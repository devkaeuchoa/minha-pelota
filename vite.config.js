import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    laravel({
      input: 'resources/js/app.tsx',
      refresh: true,
    }),
    react(),
  ],
  server: process.env.VITE_DEV_SERVER_ORIGIN
    ? {
        origin: process.env.VITE_DEV_SERVER_ORIGIN,
        // laravel-vite-plugin defaults server.cors.origin to server.origin when
        // only `origin` is set, which locks CORS to the vite dev server's own
        // URL and blocks the actual page origin (http://localhost, no port)
        // from fetching these cross-origin scripts. Reflect any origin instead.
        cors: true,
        hmr: { host: new URL(process.env.VITE_DEV_SERVER_ORIGIN).hostname },
      }
    : undefined,
});
