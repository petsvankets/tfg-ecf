import { defineConfig } from 'vite';

// Angular 17/18 con Vite soporta este archivo sin más.
export default defineConfig({
  resolve: {
    alias: {
      // cuando alguna lib pida 'web-streams-ponyfill', dáselo desde 'web-streams-polyfill/ponyfill'
      'web-streams-ponyfill': 'web-streams-polyfill/ponyfill',
    },
  },
});
