# CFKG Emission Factor Explorer

Angular application to explore emission factors from the **CFKG (Carbon Footprint Knowledge Graph)** using a public SPARQL endpoint.

---

## Project directory

All commands must be executed inside:

app/tfg-front

---

## Requirements

- Node.js 18 or higher  
- npm  
- Angular CLI

If Angular CLI is not installed:

npm install -g @angular/cli

---

## Install dependencies

From inside `app/tfg-front` run:

npm install

---

## Run the project

Start the development server:

ng serve

Then open your browser at:

http://localhost:4200

---

## Build the project (optional)

To generate a production build:

ng build

The output will be generated in:

dist/tfg-front

---

## SPARQL endpoint

The application queries the following public endpoint:

https://sparql.cf.linkeddata.es/cf

Configured in:

src/environments/environment.ts

---

## Notes

- Internet access is required to query the CFKG endpoint.
- The application reloads automatically when running with `ng serve`.

---
