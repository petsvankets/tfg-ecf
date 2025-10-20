#!/usr/bin/env bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
FUSEKI="$HERE/fuseki"
DATASET_DIR="$HERE/dataset"
mkdir -p "$DATASET_DIR"

# Carga inicial de todos los TTL de ../data si existen
if compgen -G "$HERE/../data/*.ttl" > /dev/null; then
  echo "Cargando TTL en TDB2..."
  "$FUSEKI"/tdb2.tdbloader --loc="$DATASET_DIR" "$HERE"/../data/*.ttl
fi

echo "Arrancando Fuseki en http://localhost:3030/ecf/sparql (CORS ON)"
"$FUSEKI"/fuseki-server --config "$HERE/config.ttl" --port 3030
