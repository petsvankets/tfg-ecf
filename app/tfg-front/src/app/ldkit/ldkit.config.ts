import { environment } from '../../environments/environment';

export const ldkitConfig = {
  sources: [
    { type: 'sparql', value: environment.SPARQL_ENDPOINT }
  ],
  prefixes: {
    rdf:  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    xsd:  'http://www.w3.org/2001/XMLSchema#',
    ecfo: 'https://w3id.org/ecfo#'
  }
};
