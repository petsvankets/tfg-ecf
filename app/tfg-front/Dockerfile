# Imagen reproducible del frontend CFKG Emission Factor Explorer.
# Build multistage: compila la aplicación Angular y la sirve como estático con nginx.
#
#   docker build -t cfkg-explorer .
#   docker run --rm -p 8080:80 cfkg-explorer
#   # -> http://localhost:8080
#
# La aplicación es un cliente puro de un endpoint SPARQL; el endpoint se configura
# en src/environments/environment.ts (SPARQL_ENDPOINT) antes de construir la imagen.

# ---- Etapa 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: servir ----
FROM nginx:alpine
# Limpiar el contenido por defecto de nginx (incluida su página de bienvenida).
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/tfg-front/browser/ /usr/share/nginx/html/
# Con SSR configurado, el build genera el índice como index.csr.html; se renombra
# a index.html para servirlo como SPA estática.
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
