# CFKG Emission Factor Explorer

Aplicación web, desarrollada en Angular, para explorar **factores de emisión de
carbono** publicados como grafo de conocimiento en el **Conversion Factor Knowledge
Graph (CFKG)**, modelado con la ontología **ECFO**.

La aplicación es un **cliente puro de un endpoint SPARQL**: no tiene backend propio.
Consulta directamente el endpoint público de CFKG y oculta SPARQL y RDF al usuario
tras un flujo de tres pantallas (búsqueda → resultados agrupados → detalle).

Trabajo Fin de Grado · Grado en Ingeniería Informática · ETSIINF, Universidad
Politécnica de Madrid. Autor: Lucas Rodríguez Llera. Tutor: Daniel Garijo.

---

## Funcionalidades

- Búsqueda de factores por actividad, categoría o etiquetas, con filtrado por gas.
- Resultados **agrupados** por dimensiones clave (actividad, unidades, localización y
  gas), con expansión a las **variantes** de cada grupo (por año y condiciones).
- Vista de **detalle** con los metadatos del factor y, cuando hay datos para varios
  años, una **serie temporal**.
- Acceso en tiempo real al endpoint SPARQL; los datos del grafo no se modifican.

---

## Requisitos previos

- **Node.js** 20.19+ (o 22.12+) y **npm**.
- Acceso a un endpoint SPARQL 1.1 (por defecto, el endpoint público de CFKG).

---

## Ejecución en desarrollo

```bash
cd app/tfg-front
npm install
npm start            # equivale a "ng serve"
```

La aplicación queda disponible en `http://localhost:4200` y recarga
automáticamente al guardar cambios.

---

## Compilación para producción

```bash
cd app/tfg-front
npm run build        # salida en dist/tfg-front/browser
```

---

## Ejecución con Docker

El frontend incluye un `Dockerfile` (build multistage que compila la aplicación y
la sirve con nginx), lo que permite reproducir la ejecución sin instalar Node:

```bash
cd app/tfg-front
docker build -t cfkg-explorer .
docker run --rm -p 8080:80 cfkg-explorer   # -> http://localhost:8080
```

---

## Configuración del endpoint SPARQL

El endpoint se define en `app/tfg-front/src/environments/environment.ts`
(`SPARQL_ENDPOINT`). Por defecto:

```
https://sparql.cf.linkeddata.es/cf
```

Para usar un **endpoint local de prueba** (por ejemplo, cuando el público no esté
disponible), consulta `backend-sparql/README.md`, que explica cómo levantar Apache
Jena Fuseki y cargar los datos de ejemplo incluidos en `backend-sparql/data/`.

---

## Estructura del repositorio

```
app/tfg-front/            # Aplicación Angular (código vivo)
  src/app/services/       # CfkgService: construye las consultas SPARQL
  src/app/ldkit/          # Lens de LDKit para la vista de detalle
  src/app/screens/        # Pantallas: búsqueda, resultados, detalle
  Dockerfile, nginx.conf  # Imagen reproducible del frontend
backend-sparql/           # Endpoint SPARQL local de prueba (opcional)
  data/*.ttl              # Datos de ejemplo en vocabulario ECFO real
```

---

## Tecnologías

- **Angular 20** (componentes standalone, *zoneless*, *signals*) y **TypeScript**.
- **Angular Material + CDK** para la interfaz.
- **LDKit** para la resolución de metadatos en la vista de detalle.
- **ng2-charts / Chart.js** para la serie temporal.
- **SPARQL 1.1** y **RDF** como capa de acceso a datos.

---

## Licencia

Bajo la licencia indicada en el archivo `LICENSE` del repositorio.
