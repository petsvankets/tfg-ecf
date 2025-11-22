// src/app/ldkit/cfkg-ldkit.ts
import { createLens, type Options } from 'ldkit';
import { rdf, rdfs, xsd, createNamespace } from 'ldkit/namespaces';
import { environment } from '../../environments/environment';

// Dublin Core
export const dc = createNamespace({
  iri: 'http://purl.org/dc/elements/1.1/',
  prefix: 'dc',
  terms: ['publisher'],
} as const);

// PROV
export const prov = createNamespace({
  iri: 'http://www.w3.org/ns/prov#',
  prefix: 'prov',
  terms: ['wasDerivedFrom'],
} as const);

// ECFO Namespace
export const ecfo = createNamespace({
  iri: 'https://w3id.org/ecfo#',
  prefix: 'ecfo',
  terms: [
    'EmissionConversionFactor',
    'hasSourceUnit',
    'hasTargetUnit',
    'hasApplicableLocation',
    'hasApplicablePeriod',
    'hasEmissionTarget',
    'hasScope',
    'hasTag',
  ],
} as const);


// --- PATCH fetch para la uni ---
const ldkitFetch: typeof fetch = async (input, init = {}) => {
  const opts: RequestInit = { ...init };

  if (opts.method === 'POST' && typeof opts.body === 'string') {
    const headers = new Headers(opts.headers ?? {});
    const ct = headers.get('content-type') || headers.get('Content-Type');

    if (ct && ct.includes('application/sparql-query')) {
      const params = new URLSearchParams();
      params.set('query', String(opts.body));

      opts.body = params.toString();
      headers.set(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
      opts.headers = headers;
    }
  }
  return fetch(input, opts);
};

const options: Options = {
  sources: [environment.SPARQL_ENDPOINT],
  language: 'en',
  fetch: ldkitFetch,
};


const EmissionFactorSchema = {
  '@type': ecfo['EmissionConversionFactor'],

  name: rdfs.label,

  value: {
    '@id': rdf.value,
    '@type': xsd.decimal,
  },

  sourceUnit: {
    '@id': ecfo['hasSourceUnit'],
    '@embed': {
      label: rdfs.label
    }
  },

  targetUnit: {
    '@id': ecfo['hasTargetUnit'],
    '@embed': {
      label: rdfs.label
    }
  },

  location: {
    '@id': ecfo['hasApplicableLocation'],
    '@embed': {
      label: rdfs.label
    }
  },

  period: {
    '@id': ecfo['hasApplicablePeriod'],
    '@optional': true
  },

  targetGas: {
    '@id': ecfo['hasEmissionTarget'],
    '@embed': {
      label: rdfs.label
    }
  },

  scope: {
    '@id': ecfo['hasScope'],
    '@optional': true
  },

  tag: {
    '@id': ecfo['hasTag'],
    '@array': true,
    '@embed': {
      label: rdfs.label
    }
  },

  publisher: {
    '@id': dc['publisher'],
    '@optional': true
  },

  derivedFrom: {
    '@id': prov['wasDerivedFrom'],
    '@optional': true
  }
} as const;




// Export Lens
export const EmissionFactors = createLens(EmissionFactorSchema, options);
