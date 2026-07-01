import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, map, Observable, switchMap, forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmissionFactors } from '../ldkit/cfkg-ldkit';


// ---- Modelo de dominio que quieres usar en el frontal ----
export interface FactorItem {
  key: string;
  id: string;        // IRI base del factor
  name: string;      // nombre legible
  unit: string;      // km → kgCO2e
  country: string;   // país
  targetGas: string; // CO2, CH4, etc.
}

const GAS_IRI_MAP: Record<string, string> = {
  CO2:  'http://www.wikidata.org/entity/Q1997',
  CO2e: 'http://www.wikidata.org/entity/Q1933140',
  CH4:  'http://www.wikidata.org/entity/Q37129',
  N2O:  'http://www.wikidata.org/entity/Q905750',
};

export interface FactorDetail {
  id: string;
  name: string;
  value: number;
  unit: string;
  country: string;
  year?: number;
  targetGas: string;
  scope?: string;
  publisher?: string;
  publisherLabel?: string;
  derivedFrom?: string;
  tags: string[];
}

export interface FactorSeriesPoint {
  year: number;
  value: number;
}

export interface FactorYear {
  year: number;
  id: string;
}

export interface FactorGroup {
  key: string;

  // Lo que se pinta en la tarjeta
  name: string;
  unit: string;
  country: string;

  // IRIs del grupo
  sourceIri: string;
  srcUnitIri: string;
  tgtUnitIri: string;
  locIri: string;
  gasIri: string;

  // Nuevas dimensiones
  scopeIri?: string;
  context?: string;
}


export interface FactorVariant {
  cf: string;        // IRI del recurso
  year: number;
  value: number;
  scope?: string;
  context?: string;
  tags?: string;
}



export interface FactorTimeseries {
  id: string;
  name: string;
  unit: string;
  series: FactorSeriesPoint[];
}

// Si quieres usarlo más adelante
export interface FactorsResponse {
  items: FactorItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CfkgService {
  private http = inject(HttpClient);
  private endpoint = environment.SPARQL_ENDPOINT; // 'https://sparql.cf.linkeddata.es/cf'

searchFactors(
  text: string,
  gas: keyof typeof GAS_IRI_MAP = 'CO2e',
  limit = 50,
  offset = 0
): Observable<FactorGroup[]> {

  const safeText = (text ?? '').trim().replace(/"/g, '\\"');
  if (!safeText) return of([]);

  const gasIri = GAS_IRI_MAP[gas];

  const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT
  ?source
  ?srcUnit
  ?tgtUnit
  ?loc
  ?scope
  (SAMPLE(?cf) AS ?anyCf)
  (SAMPLE(?sourceLabel) AS ?name)
  (SAMPLE(?srcUnitLabel) AS ?srcUnitName)
  (SAMPLE(?tgtUnitLabel) AS ?tgtUnitName)
  (SAMPLE(?locLabel) AS ?country)
WHERE {
  BIND(<${gasIri}> AS ?gas)

  ?cf a ecfo:EmissionConversionFactor ;
      ecfo:hasEmissionTarget ?gas ;
      ecfo:hasEmissionSource ?source ;
      ecfo:hasSourceUnit ?srcUnit ;
      ecfo:hasTargetUnit ?tgtUnit ;
      ecfo:hasApplicableLocation ?loc .

  OPTIONAL { ?cf ecfo:hasScope ?scope }

  OPTIONAL {
    ?source rdfs:label ?sourceLabel .
    FILTER(lang(?sourceLabel)="" || langMatches(lang(?sourceLabel),"en"))
  }
  OPTIONAL {
    ?srcUnit rdfs:label ?srcUnitLabel .
    FILTER(lang(?srcUnitLabel)="" || langMatches(lang(?srcUnitLabel),"en"))
  }
  OPTIONAL {
    ?tgtUnit rdfs:label ?tgtUnitLabel .
    FILTER(lang(?tgtUnitLabel)="" || langMatches(lang(?tgtUnitLabel),"en"))
  }
  OPTIONAL {
    ?loc rdfs:label ?locLabel .
    FILTER(lang(?locLabel)="" || langMatches(lang(?locLabel),"en"))
  }

  OPTIONAL {
    ?cf ecfo:hasTag/rdfs:label ?tagLabel .
    FILTER(lang(?tagLabel)="" || langMatches(lang(?tagLabel),"en"))
  }

  FILTER(
    CONTAINS(LCASE(STR(?sourceLabel)), LCASE("${safeText}"))
    || CONTAINS(LCASE(STR(?tagLabel)), LCASE("${safeText}"))
  )
}
GROUP BY ?source ?srcUnit ?tgtUnit ?loc ?scope
ORDER BY LCASE(STR(?sourceLabel))
LIMIT ${limit}
OFFSET ${offset}
`.trim();

  const body = new HttpParams().set('query', sparql);
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: 'application/sparql-results+json',
  });

  return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
    map(res => {
      const rows = res?.results?.bindings ?? [];

      return rows.map((r: any) => {
        const unit = buildUnit(
          r.srcUnitName?.value,
          r.tgtUnitName?.value,
          r.srcUnit?.value,
          r.tgtUnit?.value
        );

        return {
          key: [
            r.source.value,
            r.srcUnit.value,
            r.tgtUnit.value,
            r.loc.value,
            gasIri,
            r.scope?.value ?? ''
          ].join('|'),

          name: r.name?.value ?? '(sin nombre)',
          unit,
          country: r.country?.value ?? '—',

          // 🔑 IRIs técnicas para la expansión
          sourceIri: r.source.value,
          srcUnitIri: r.srcUnit.value,
          tgtUnitIri: r.tgtUnit.value,
          locIri: r.loc.value,
          gasIri,

          scopeIri: r.scope?.value,
        } as FactorGroup;
      });
    })
  );
}





countFactorGroups(
  text: string,
  gas: keyof typeof GAS_IRI_MAP = 'CO2e'
): Observable<number> {

  const safeText = (text ?? '').trim().replace(/"/g, '\\"');
  if (!safeText) return of(0);

  const gasIri = GAS_IRI_MAP[gas];

  const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT (COUNT(*) AS ?total)
WHERE {
  {
    SELECT DISTINCT
      ?source ?srcUnit ?tgtUnit ?loc ?scope
    WHERE {
      BIND(<${gasIri}> AS ?gas)

      ?cf a ecfo:EmissionConversionFactor ;
          ecfo:hasEmissionTarget ?gas ;
          ecfo:hasEmissionSource ?source ;
          ecfo:hasSourceUnit ?srcUnit ;
          ecfo:hasTargetUnit ?tgtUnit ;
          ecfo:hasApplicableLocation ?loc .

      OPTIONAL { ?cf ecfo:hasScope ?scope }

      OPTIONAL {
        ?source rdfs:label ?sourceLabel .
        FILTER(lang(?sourceLabel)="" || langMatches(lang(?sourceLabel),"en"))
      }

      OPTIONAL {
        ?cf ecfo:hasTag/rdfs:label ?tagLabel .
        FILTER(lang(?tagLabel)="" || langMatches(lang(?tagLabel),"en"))
      }

      FILTER(
        CONTAINS(LCASE(STR(?sourceLabel)), LCASE("${safeText}"))
        || CONTAINS(LCASE(STR(?tagLabel)), LCASE("${safeText}"))
      )
    }
  }
}
`.trim();

  const body = new HttpParams().set('query', sparql);
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: 'application/sparql-results+json',
  });

  return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
    map(res => Number(res?.results?.bindings?.[0]?.total?.value ?? 0))
  );
}





expandGroup(group: FactorGroup): Observable<FactorVariant[]> {

  const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT
  ?year ?cf ?value
  ?scope
  ?context
  (GROUP_CONCAT(DISTINCT ?tagLabelRaw; separator=" | ") AS ?tags)
WHERE {
  BIND(<${group.gasIri}> AS ?gas)
  BIND(<${group.sourceIri}> AS ?source)
  BIND(<${group.srcUnitIri}> AS ?srcUnit)
  BIND(<${group.tgtUnitIri}> AS ?tgtUnit)
  BIND(<${group.locIri}> AS ?loc)

  ?cf a ecfo:EmissionConversionFactor ;
      ecfo:hasEmissionTarget ?gas ;
      ecfo:hasEmissionSource ?source ;
      ecfo:hasSourceUnit ?srcUnit ;
      ecfo:hasTargetUnit ?tgtUnit ;
      ecfo:hasApplicableLocation ?loc ;
      ecfo:hasApplicablePeriod ?period ;
      rdf:value ?value .

  OPTIONAL { ?cf ecfo:hasScope ?scope }
  OPTIONAL { ?cf ecfo:hasAdditionalContext ?context }

  ${group.scopeIri ? `FILTER(?scope = <${group.scopeIri}>)` : ''}
  ${group.context ? `FILTER(STR(?context) = "${group.context.replace(/"/g, '\\"')}")` : ''}

  OPTIONAL {
    ?cf ecfo:hasTag/rdfs:label ?tagLabelRaw .
    FILTER(lang(?tagLabelRaw)="" || langMatches(lang(?tagLabelRaw),"en"))
  }

  BIND(
    xsd:integer(REPLACE(STR(?period), ".*((19|20)[0-9]{2}).*", "$1"))
    AS ?year
  )
  FILTER(BOUND(?year))
}
GROUP BY ?year ?cf ?value ?scope ?context
ORDER BY DESC(?year) STR(?scope) STR(?context)
LIMIT 500
`.trim();

  const body = new HttpParams().set('query', sparql);
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: 'application/sparql-results+json',
  });

  return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
    map(res =>
      (res?.results?.bindings ?? []).map((r: any) => ({
        cf: r.cf.value,
        year: Number(r.year.value),
        value: Number(r.value.value),
        scope: r.scope?.value,
        context: r.context?.value,
        tags: r.tags?.value,
      }) as FactorVariant)
    )
  );
}


getFactorDetail(id: string): Observable<FactorDetail> {
  return from(EmissionFactors.findByIri(id)).pipe(
    switchMap((ef: any) => {
      if (!ef) throw new Error('Factor no encontrado en CFKG');

      return forkJoin({
        sourceUnit: this.resolveLabel(ef.sourceUnit),
        targetUnit: this.resolveLabel(ef.targetUnit),
        country: this.resolveLabel(ef.location),
        gas: this.resolveLabel(ef.targetGas),
        // Resolver la etiqueta legible del editor (comentario 27 del tutor:
        // no mostrar la IRI cruda como "Data Publisher").
        publisherLabel: ef.publisher
          ? this.resolveLabel(ef.publisher)
          : of<string | undefined>(undefined),
        tags: ef.tag && ef.tag.length
          ? forkJoin(ef.tag.map((t: string) => this.resolveLabel(t)))
          : of<string[]>([]),
      }).pipe(
        map(({ sourceUnit, targetUnit, country, gas, publisherLabel, tags }) => {
          const period = ef.period ?? id;
          const year = extractYear(period) ?? undefined;

          return {
            id,
            name: ef.name ?? '(sin título)',
            value: Number(ef.value ?? 0),
            unit: `${sourceUnit} → ${targetUnit}`,
            country,
            year,
            targetGas: gas,
            scope: ef.scope ?? undefined,
            publisher: ef.publisher ?? undefined,
            publisherLabel: publisherLabel ?? undefined,
            derivedFrom: ef.derivedFrom ?? undefined,
            tags,
          } as FactorDetail;
        })
      );
    })
  );
}



getFactorTimeseries(id: string): Observable<FactorTimeseries> {
  const iri = id.replace(/>/g, '\\>');

  const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

SELECT ?cf ?label ?value ?year
       ?srcUnitLabel ?tgtUnitLabel
WHERE {
  BIND(<${iri}> AS ?base)

  ?base ecfo:hasEmissionSource ?source ;
        ecfo:hasEmissionTarget ?target ;
        ecfo:hasSourceUnit ?srcUnit ;
        ecfo:hasTargetUnit ?tgtUnit ;
        ecfo:hasApplicableLocation ?loc .

  OPTIONAL { ?base ecfo:hasEmissionTarget ?baseGas }

  ?cf a ecfo:EmissionConversionFactor ;
      ecfo:hasEmissionSource ?source ;
      ecfo:hasEmissionTarget ?baseGas ;
      ecfo:hasSourceUnit ?srcUnit ;
      ecfo:hasTargetUnit ?tgtUnit ;
      ecfo:hasApplicableLocation ?loc ;
      rdf:value ?value ;
      ecfo:hasApplicablePeriod ?period .

  OPTIONAL { ?cf rdfs:label ?label }
  OPTIONAL { ?srcUnit rdfs:label ?srcUnitLabel }
  OPTIONAL { ?tgtUnit rdfs:label ?tgtUnitLabel }

  BIND(
    xsd:integer(
      REPLACE(STR(?period), ".*((19|20)[0-9]{2}).*", "$1")
    ) AS ?year
  )

  FILTER(BOUND(?year))
}
ORDER BY ?year
`.trim();

  const body = new HttpParams().set('query', sparql);
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: 'application/sparql-results+json',
  });

  return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
    map(res => {
      const rows = res?.results?.bindings ?? [];
      if (!rows.length) {
        return {
          id,
          name: '',
          unit: '',
          series: [],
        } as FactorTimeseries;
      }

      const first = rows[0];

      const unit = buildUnit(
        first.srcUnitLabel?.value,
        first.tgtUnitLabel?.value,
        '',
        ''
      );

      const name = first.label?.value ?? '(sin título)';

      const series: FactorSeriesPoint[] = rows
  .map((r: any): FactorSeriesPoint => ({
    year: Number(r.year.value),
    value: Number(r.value.value),
  }))
  .reduce((acc: FactorSeriesPoint[], cur: FactorSeriesPoint) => {
    if (!acc.find((p: FactorSeriesPoint) => p.year === cur.year)) {
      acc.push(cur);
    }
    return acc;
  }, [])
  .sort((a: FactorSeriesPoint, b: FactorSeriesPoint) => a.year - b.year);


      return {
        id,
        name,
        unit,
        series,
      } as FactorTimeseries;
    })
  );
}


resolveLabel(iri: string): Observable<string> {
  if (!iri) return of('—');

  const sparql = `
    SELECT ?label WHERE {
      <${iri}> <http://www.w3.org/2000/01/rdf-schema#label> ?label .
      FILTER (lang(?label) = "" || langMatches(lang(?label), "en"))
    }
    LIMIT 1
  `;

  const body = new HttpParams().set('query', sparql);
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: 'application/sparql-results+json',
  });

  return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
    map((res) =>
      res?.results?.bindings?.[0]?.label?.value ??
      localName(iri)   // usamos tu helper global
    )
  );
}

}

// --------- Helpers ---------

function localName(uri: string): string {
  if (!uri) return '';
  const hash = uri.lastIndexOf('#');
  const slash = uri.lastIndexOf('/');
  const i = Math.max(hash, slash);
  return i >= 0 ? uri.substring(i + 1) : uri;
}

function buildUnit(
  srcLabel: string | undefined,
  tgtLabel: string | undefined,
  srcIri: string,
  tgtIri: string
): string {
  const src = srcLabel || localName(srcIri);
  const tgt = tgtLabel || localName(tgtIri);
  if (!src && !tgt) return '';
  if (!tgt) return src;
  if (!src) return tgt;
  return `${src} → ${tgt}`;
}

function extractYear(text: string): number | null {
  if (!text) return null;
  const match = text.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}


