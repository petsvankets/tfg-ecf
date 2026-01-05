# 🌍 CFKG Emission Factor Explorer

Esto es una aplicación web hecha en Angular para trastear con factores de emisión sacados de la base de conocimiento de huella de carbono (CFKG).

Básicamente: sirve para mirar datos de emisiones de CO₂ sin volverte loco ni tener que pelearte directamente con SPARQL.

---

## 🎯 ¿Qué hace esta aplicación?

La app se conecta a un endpoint SPARQL público con datos de factores de emisión y te deja:

- 🔍 Buscar factores de emisión por actividad o categoría
- 📊 Ver los datos más o menos ordenadoso
- 💡 Entender de dónde salen las emisiones
- ⚡ Obtener resultados en tiempo real del endpoint

---

## 📋 Requisitos previos

Antes de empezar, asegúrate de tener instalados:

- **Node.js** v18 o superior (descárgalo desde [nodejs.org](https://nodejs.org))
- **npm** (viene con Node.js)
- **Angular CLI** (opcional, pero recomendado)

Si no tienes Angular CLI:

```bash
npm install -g @angular/cli
```

Si no te gustan las instalaciones globales, puedes tirar de npx y listo.

---

## 🚀 Cómo arrancar la app

### 1️⃣ Navega a la carpeta correcta

```bash
cd app/tfg-front
```

### 2️⃣ Instala las dependencias

```bash
npm install
```

Esto descargará todas las librerías que necesita el proyecto. ☕ Esto puede tomar un minuto.

### 3️⃣ Arranca el servidor

```bash
ng serve
```

O si lo prefieres:

```bash
npm start
```

### 4️⃣ ¡Abre en tu navegador!

Una vez que veas el mensaje indicando que el servidor está listo, abre:

```
http://localhost:4200
```

**¡Eso es!** La aplicación se recargará automáticamente cada vez que hagas cambios. 🎉

---

## 📦 Construir para producción

¿Listo para desplegar? Genera una compilación optimizada:

```bash
ng build --configuration production
```

El resultado estará en `dist/tfg-front/` listo para servir en tu servidor web.

---

## 🔗 La magia: SPARQL endpoint

La app consulta datos desde aquí:

```
https://sparql.cf.linkeddata.es/cf
```

La URL está configurada en:

```
src/environments/environment.ts
```

Si quieres cambiar el endpoint, editas ese archivo y ya está.

---

## 📁 Estructura del proyecto

```
app/tfg-front/
├── src/
│   ├── app/              # Componentes y lógica de la app
│   ├── environments/     # Configuración por entorno
│   ├── styles.scss       # Estilos globales
│   ├── main.ts           # Punto de entrada
│   └── index.html        # HTML principal
├── public/               # Archivos estáticos
├── angular.json          # Configuración de Angular
└── package.json          # Dependencias del proyecto
```



## ⚡ Notas importantes

- 🌐 Necesitas internet para que el SPARQL funcione
- 🔄 En desarrollo, Angular se recarga solo (no necesitas refrescar manualmente)
- 📱 Funciona bien en móvil, tablet y desktop (Responsive)
- 🚀 El proyecto tiene SSR configurado, aunque no es obligatorio usarlo


---

## ❓ ¿Problemas?

### El servidor no inicia
- Verifica que estés en la carpeta `app/tfg-front`
- Intenta eliminar `node_modules` y hacer `npm install` de nuevo
- Asegúrate de tener Node.js 18+

### No conecta con el endpoint
- Verifica tu conexión a internet
- Comprueba que la URL en `environment.ts` sea correcta
- Intenta acceder a la URL directamente en el navegador

### Puerto 4200 ya en uso
- Especifica un puerto diferente: `ng serve --port 4300`

---

## 📚 Tecnologías utilizadas

- **Angular 18+** - Framework frontend moderno
- **TypeScript** - Tipado estático para JavaScript
- **SPARQL** - Lenguaje de consulta para grafos
- **RDF/LinkedData** - Formato de datos semánticos
- **SCSS** - Estilos avanzados

---

## 📄 Licencia

Este proyecto está bajo la licencia especificada en el archivo `LICENSE` de este repositorio.

---


Si tienes dudas o sugerencias, no dudes en abrir un issue o contactar. ¡Nos encanta saber cómo usas esta herramienta!

**Última actualización**: Enero 2026

---
