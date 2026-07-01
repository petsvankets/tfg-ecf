import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // La aplicación obtiene los datos en vivo del endpoint SPARQL, por lo que el
    // prerenderizado no aporta valor y, además, las rutas con parámetro (factor/:id)
    // requerirían getPrerenderParams. Se renderiza en el cliente.
    path: '**',
    renderMode: RenderMode.Client
  }
];
