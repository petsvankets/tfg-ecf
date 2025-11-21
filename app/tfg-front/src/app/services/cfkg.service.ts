import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ---- Modelo de dominio que quieres usar en el frontal ----
export interface FactorItem {
  id: string;       // IRI del recurso factor
  name: string;     // etiqueta legible
  unit: string;     // tipo "kWh → kgCO2e" o similar
  country: string;  // localización aplicable
  latestValue?: number;
  latestYear?: number;
}
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
  derivedFrom?: string;
  tags: string[];
}

export interface FactorSeriesPoint {
  year: number;
  value: number;
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

  searchFactors(text: string, limit = 20): Observable<FactorItem[]> {
    const safeText = (text || '').replace(/"/g, '\\"');

    const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?cf ?label ?value ?srcUnit ?srcUnitLabel ?tgtUnit ?tgtUnitLabel
       ?loc ?locLabel ?period
WHERE {
  ?cf a ecfo:EmissionConversionFactor ;
      rdf:value ?value ;
      ecfo:hasSourceUnit ?srcUnit ;
      ecfo:hasTargetUnit ?tgtUnit .

  OPTIONAL { ?cf      rdfs:label ?label }
  OPTIONAL { ?srcUnit rdfs:label ?srcUnitLabel }
  OPTIONAL { ?tgtUnit rdfs:label ?tgtUnitLabel }
  OPTIONAL {
    ?cf ecfo:hasApplicableLocation ?loc .
    OPTIONAL { ?loc rdfs:label ?locLabel }
  }
  OPTIONAL { ?cf ecfo:hasApplicablePeriod ?period }

  ${safeText
    ? `FILTER(CONTAINS(LCASE(STR(?label)), LCASE("${safeText}")))`
    : ''}
}
ORDER BY LCASE(STR(?label))
LIMIT ${limit}
`.trim();

    const body = new HttpParams().set('query', sparql);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/sparql-results+json',
    });

    return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
      map((res) => {
        const rows = res?.results?.bindings ?? [];

        const items: FactorItem[] = rows.map((r: any) => {
          const id = r.cf?.value ?? '';

          const label = r.label?.value ?? '(sin título)';
          const valueRaw = r.value?.value;
          const value = valueRaw != null ? Number(valueRaw) : undefined;

          const srcUnitIri = r.srcUnit?.value ?? '';
          const tgtUnitIri = r.tgtUnit?.value ?? '';
          const srcUnitLabel = r.srcUnitLabel?.value;
          const tgtUnitLabel = r.tgtUnitLabel?.value;

          const locLabel = r.locLabel?.value;
          const locIri = r.loc?.value ?? '';

          const period = r.period?.value ?? id;
          const latestYear = extractYear(period);

          return {
            id,
            name: label,
            unit: buildUnit(srcUnitLabel, tgtUnitLabel, srcUnitIri, tgtUnitIri),
            country: locLabel || localName(locIri) || '—',
            latestValue: value,
            latestYear: latestYear ?? undefined,
          };
        });

        return items;
      })
    );
  }
  getFactorDetail(id: string): Observable<FactorDetail> {
  const iri = id.replace(/>/g, '\\>'); // por si acaso

  const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc:   <http://purl.org/dc/elements/1.1/>
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?label ?value ?srcUnit ?srcUnitLabel ?tgtUnit ?tgtUnitLabel
       ?loc ?locLabel ?period ?target ?targetLabel ?scope
       ?publisher ?derivedFrom ?tag ?tagLabel
WHERE {
  BIND(<${iri}> AS ?cf)

  ?cf a ecfo:EmissionConversionFactor ;
      rdf:value ?value ;
      ecfo:hasSourceUnit ?srcUnit ;
      ecfo:hasTargetUnit ?tgtUnit ;
      ecfo:hasEmissionTarget ?target .

  OPTIONAL { ?cf rdfs:label ?label }
  OPTIONAL { ?srcUnit rdfs:label ?srcUnitLabel }
  OPTIONAL { ?tgtUnit rdfs:label ?tgtUnitLabel }
  OPTIONAL {
    ?cf ecfo:hasApplicableLocation ?loc .
    OPTIONAL { ?loc rdfs:label ?locLabel }
  }
  OPTIONAL { ?cf ecfo:hasApplicablePeriod ?period }
  OPTIONAL { ?cf ecfo:hasScope ?scope }
  OPTIONAL { ?cf dc:publisher ?publisher }
  OPTIONAL { ?cf prov:wasDerivedFrom ?derivedFrom }
  OPTIONAL {
    ?cf ecfo:hasTag ?tag .
    OPTIONAL { ?tag rdfs:label ?tagLabel }
  }
  OPTIONAL { ?target rdfs:label ?targetLabel }
}
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
        throw new Error('Factor no encontrado en CFKG');
      }

      const first = rows[0];

      const label = first.label?.value ?? '(sin título)';
      const value = Number(first.value?.value ?? 0);

      const srcUnitIri = first.srcUnit?.value ?? '';
      const tgtUnitIri = first.tgtUnit?.value ?? '';
      const srcUnitLabel = first.srcUnitLabel?.value;
      const tgtUnitLabel = first.tgtUnitLabel?.value;

      const locLabel = first.locLabel?.value;
      const locIri = first.loc?.value ?? '';

      const period = first.period?.value ?? id;
      const year = extractYear(period) ?? undefined;

      const gasLabel =
        first.targetLabel?.value || localName(first.target?.value ?? '');

      const scope = first.scope?.value;
      const publisher = first.publisher?.value;
      const derivedFrom = first.derivedFrom?.value;

      const tagsSet = new Set<string>();
      for (const r of rows) {
        const tagL = r.tagLabel?.value || localName(r.tag?.value ?? '');
        if (tagL) tagsSet.add(tagL);
      }

      return {
        id,
        name: label,
        value,
        unit: buildUnit(srcUnitLabel, tgtUnitLabel, srcUnitIri, tgtUnitIri),
        country: locLabel || localName(locIri) || '—',
        year,
        targetGas: gasLabel,
        scope,
        publisher,
        derivedFrom,
        tags: Array.from(tagsSet),
      } as FactorDetail;
    })
  );
}
getFactorTimeseries(id: string): Observable<FactorTimeseries> {
  const iri = id.replace(/>/g, '\\>');

  const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?cf ?label ?value ?period
       ?srcUnit ?srcUnitLabel ?tgtUnit ?tgtUnitLabel
WHERE {
  BIND(<${iri}> AS ?base)

  ?base ecfo:hasEmissionSource ?source ;
        ecfo:hasEmissionTarget ?target ;
        ecfo:hasSourceUnit ?srcUnit ;
        ecfo:hasTargetUnit ?tgtUnit ;
        ecfo:hasApplicableLocation ?loc .

  ?cf a ecfo:EmissionConversionFactor ;
      ecfo:hasEmissionSource ?source ;
      ecfo:hasEmissionTarget ?target ;
      ecfo:hasSourceUnit ?srcUnit ;
      ecfo:hasTargetUnit ?tgtUnit ;
      ecfo:hasApplicableLocation ?loc ;
      rdf:value ?value .

  OPTIONAL { ?cf rdfs:label ?label }
  OPTIONAL { ?cf ecfo:hasApplicablePeriod ?period }
  OPTIONAL { ?srcUnit rdfs:label ?srcUnitLabel }
  OPTIONAL { ?tgtUnit rdfs:label ?tgtUnitLabel }
}
ORDER BY ?period
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

      const srcUnitIri = first.srcUnit?.value ?? '';
      const tgtUnitIri = first.tgtUnit?.value ?? '';
      const srcUnitLabel = first.srcUnitLabel?.value;
      const tgtUnitLabel = first.tgtUnitLabel?.value;

      const unit = buildUnit(srcUnitLabel, tgtUnitLabel, srcUnitIri, tgtUnitIri);
      const name = first.label?.value ?? '(sin título)';

      const series: FactorSeriesPoint[] = rows
  .map((r: any): FactorSeriesPoint | null => {
    const period: string = r.period?.value ?? r.cf?.value ?? '';
    const year = extractYear(period);
    const value = Number(r.value?.value ?? 0);
    if (!year) return null;
    return { year, value };
  })
  .filter((p: FactorSeriesPoint | null): p is FactorSeriesPoint => !!p)
  .sort(
    (a: FactorSeriesPoint, b: FactorSeriesPoint) => a.year - b.year
  );


      return {
        id,
        name,
        unit,
        series,
      } as FactorTimeseries;
    })
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
