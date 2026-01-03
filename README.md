# CFKG Emission Factor Explorer (Angular)

Single-page app to explore emission factors from the CFKG knowledge graph. Built with Angular 20, Angular Material, ng2-charts/Chart.js, and SSR-ready output. Includes search, sector shortcuts, results with expandable variants, and factor detail with time series.

## Prerequisites
- Node.js **18+** (recommended 20+ to match Angular 20 toolchain)
- npm (comes with Node)
- (Optional) Angular CLI globally: `npm install -g @angular/cli`

## Install
```bash
npm install
```

## Environment
The SPARQL endpoint is configured in `src/environments/environment.ts`:

```ts
export const environment = {
	production: false,
	SPARQL_ENDPOINT: 'https://sparql.cf.linkeddata.es/cf'
};
```

For production, create `src/environments/environment.prod.ts` if you need a different endpoint or flags.

## Run locally (SPA)
```bash
npm start            # ng serve
# then open http://localhost:4200/
```

## Build (SPA)
```bash
npm run build        # outputs to dist/tfg-front
```

Deploy the contents of `dist/tfg-front/browser` to any static host (Azure Static Web Apps, Netlify, S3+CloudFront, etc.).

## Server-side rendering preview
Build and serve the SSR bundle (Node/Express):
```bash
npm run build
npm run serve:ssr:tfg-front   # serves dist/tfg-front/server/server.mjs
```
Useful to validate hydration and SEO before deploying. Deploy both `browser` and `server` outputs to your Node host if you want SSR in production.

## Tests
```bash
npm test   # Karma + Jasmine unit tests
```

## Useful scripts
| Script | Description |
| --- | --- |
| `npm start` | Run dev server with live reload (http://localhost:4200). |
| `npm run build` | Production build to `dist/tfg-front`. |
| `npm run serve:ssr:tfg-front` | Serve the SSR bundle from `dist/tfg-front/server/server.mjs`. |
| `npm test` | Run unit tests (Karma/Jasmine). |

## Project structure (high level)
```
src/
	app/
		screens/
			factors-search/   # Landing + search form and sector shortcuts
			factors-results/  # Results table with expandable variants
			factor-detail/    # Factor detail + timeseries chart
		services/           # CFKG data access
		models/             # Data models
		ldkit/              # LDKit config
	environments/         # environment.ts (and optional environment.prod.ts)
```

## Deployment notes
- **SPA/static:** deploy `dist/tfg-front/browser` to static hosting.
- **SSR:** deploy both `browser` and `server` outputs; run `node dist/tfg-front/server/server.mjs` (or your process manager) and proxy traffic to it.

## Development tips
- Keep Node in sync with the Angular CLI version (Node 20 is safe for Angular 20).
- If Angular CLI is not global, run `npx ng <command>` instead of `ng <command>`.
- When changing environments, rebuild before serving SSR (`npm run build`).
