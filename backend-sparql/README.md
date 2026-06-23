# Endpoint SPARQL de prueba (opcional)

La aplicación **CFKG Emission Factor Explorer** es un cliente puro de un endpoint
SPARQL. Por defecto consulta el endpoint público de CFKG
(`https://sparql.cf.linkeddata.es/cf`) y **no necesita ningún backend propio**.

Esta carpeta solo proporciona una forma de levantar un **endpoint SPARQL local de
prueba** para desarrollar o validar consultas cuando el endpoint público no está
disponible. No forma parte del sistema que se entrega.

> Apache Jena Fuseki **no se incluye en el repositorio**: se descarga aparte. Aquí
> se versionan únicamente los datos de ejemplo (`data/*.ttl`) y estas instrucciones.

## Datos de ejemplo

- `data/sample.ttl` — factor "Diesel, Reino Unido, CO2e" para 2019, 2020 y 2021
  (sirve para probar búsqueda, agrupación, variantes y serie temporal).
- `data/factors-extra.ttl` — una segunda actividad (electricidad de red).

Ambos usan el **mismo vocabulario ECFO** que las consultas reales de la aplicación
(`rdf:value`, `ecfo:hasSourceUnit`/`hasTargetUnit` como IRIs,
`ecfo:hasApplicablePeriod`, `ecfo:hasEmissionTarget` con el gas como IRI de
Wikidata, etc.), de modo que las cuatro consultas devuelven resultados.

## Pasos

1. Descargar Apache Jena Fuseki desde la web oficial
   (<https://jena.apache.org/download/>) y descomprimirlo.

2. Arrancar Fuseki con un dataset en memoria y cargar los datos de ejemplo:

   ```bash
   ./fuseki-server --update --mem /cf
   # En otra terminal, cargar los TTL:
   curl -X POST -H 'Content-Type: text/turtle' \
        --data-binary @data/sample.ttl \
        http://localhost:3030/cf/data
   curl -X POST -H 'Content-Type: text/turtle' \
        --data-binary @data/factors-extra.ttl \
        http://localhost:3030/cf/data
   ```

3. Comprobar que el endpoint responde:

   ```bash
   curl -X POST http://localhost:3030/cf/query \
        -H 'Accept: application/sparql-results+json' \
        --data-urlencode 'query=SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }'
   ```

4. Apuntar la aplicación al endpoint local: editar
   `app/tfg-front/src/environments/environment.ts` y fijar
   `SPARQL_ENDPOINT` a `http://localhost:3030/cf/query`.

5. Ejecutar la aplicación (`npm start`) y comprobar el flujo completo:
   buscar "diesel" → expandir el grupo → abrir el detalle y ver la serie temporal.
