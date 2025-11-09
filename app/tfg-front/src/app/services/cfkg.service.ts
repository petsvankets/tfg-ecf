import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CfkgItem {
  id: string;
  label: string;
  source: string;
  target: string;
  scope: string;
}

@Injectable({ providedIn: 'root' })
export class CfkgService {
  private http = inject(HttpClient);
  private endpoint = environment.SPARQL_ENDPOINT; // 'https://sparql.cf.linkeddata.es/cf'

  searchFactors(text: string, limit = 20): Observable<CfkgItem[]> {
    const sparql = `
PREFIX ecfo: <https://w3id.org/ecfo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?cf ?label ?source ?target ?scope
WHERE {
  ?cf ecfo:hasEmissionSource ?s ;
      ecfo:hasEmissionTarget ?t ;
      ecfo:hasScope ?scope .
  OPTIONAL { ?cf rdfs:label ?label }
  OPTIONAL { ?s  rdfs:label ?source }
  OPTIONAL { ?t  rdfs:label ?target }
  ${text ? `FILTER(CONTAINS(LCASE(STR(?label)), LCASE("${text}")))` : ''}
}
ORDER BY LCASE(STR(?label))
LIMIT ${limit}
`.trim();

    const body = new HttpParams().set('query', sparql);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/sparql-results+json'
    });

    return this.http.post<any>(this.endpoint, body.toString(), { headers }).pipe(
      map(res => {
        const rows = res?.results?.bindings ?? [];
        return rows.map((r: any) => ({
          id: r.cf?.value ?? '',
          label: r.label?.value ?? '(sin título)',
          source: r.source?.value ?? '',
          target: r.target?.value ?? '',
          scope:  r.scope?.value  ?? '',
        }) as CfkgItem);
      })
    );
  }
}
