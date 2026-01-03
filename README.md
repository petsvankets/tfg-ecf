# 🌍 CFKG Emission Factor Explorer

Bienvenido a **CFKG Emission Factor Explorer**, una aplicación web moderna construida con Angular que te permite explorar y analizar factores de emisión desde la base de conocimiento de huella de carbono (**CFKG**). 

Si trabajas con sostenibilidad, análisis de carbono o simplemente quieres entender mejor el impacto ambiental de diferentes actividades, este proyecto te ayudará a navegar datos de emisión de forma intuitiva.

---

## 🎯 ¿Qué hace esta aplicación?

Esta app se conecta a un endpoint SPARQL público que contiene información detallada sobre factores de emisión de CO₂. Puedes:

- 🔍 **Buscar** factores de emisión por categoría o actividad
- 📊 **Visualizar** datos estruturados en un grafo de conocimiento
- 💡 **Explorar** relaciones entre diferentes fuentes de emisión
- ⚡ **Obtener resultados** en tiempo real desde la base de datos

---

## 📋 Requisitos previos

Antes de empezar, asegúrate de tener instalados:

- **Node.js** v18 o superior (descárgalo desde [nodejs.org](https://nodejs.org))
- **npm** (viene con Node.js)
- **Angular CLI** (opcional, pero recomendado)

¿No tienes Angular CLI? No te preocupes, instálalo con:

```bash
npm install -g @angular/cli
```

**💡 Tip**: Si prefieres evitar instalaciones globales, puedes usar `npx` directamente.

---

## 🚀 Comenzar es súper fácil

### 1️⃣ Navega a la carpeta correcta

```bash
cd app/tfg-front
```

### 2️⃣ Instala las dependencias

```bash
npm install
```

Esto descargará todas las librerías que necesita el proyecto. ☕ Esto puede tomar un minuto.

### 3️⃣ Inicia el servidor de desarrollo

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

Esta aplicación consulta datos desde:

```
https://sparql.cf.linkeddata.es/cf
```

Es un endpoint público que contiene la base de conocimiento CFKG. La configuración se encuentra en:

```
src/environments/environment.ts
```

¿Quieres cambiar el endpoint? Solo modifica ese archivo y ¡listo! No necesitas recompilar.

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

---

## 🛠️ Desarrollo útil

### Ejecutar pruebas unitarias

```bash
ng test
```

### Hacer lint del código

```bash
ng lint
```

### Generar componentes rápidamente

```bash
ng generate component nombre-componente
```

---

## ⚡ Notas importantes

- 🌐 **Necesitas internet** para consultar el endpoint SPARQL
- 🔄 **Recarga automática** en modo desarrollo (no necesitas refrescar manualmente)
- 📱 **Responsive** - Funciona bien en desktop, tablet y móvil
- 🚀 **SSR disponible** - El proyecto incluye Server-Side Rendering configurado

---

## 🤝 Contribuir

¿Encontraste un bug? ¿Tienes una idea genial? Las contribuciones son bienvenidas. 

Si quieres mejorar algo:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/MiIdea`)
3. Commit tus cambios (`git commit -m 'Agrego MiIdea'`)
4. Push a la rama (`git push origin feature/MiIdea`)
5. Abre un Pull Request

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

## 👋 ¿Preguntas?

Si tienes dudas o sugerencias, no dudes en abrir un issue o contactar. ¡Nos encanta saber cómo usas esta herramienta!

**Última actualización**: Enero 2026

---
