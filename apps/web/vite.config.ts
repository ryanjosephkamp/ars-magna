import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2022',
    // The dictionary artifacts in public/dict are content-hashed and served
    // pre-compressed; never inline them.
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    // Required for the SharedArrayBuffer cancellation path (Phase 9).
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
