#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "Arrancando Fuseki persistente en http://localhost:3030/ecf/sparql"
java -jar fuseki-server.jar --config ./config.ttl --port 3030
