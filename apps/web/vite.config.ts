import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Emit the list of built assets for the service worker to precache.
 *
 * The worker script and the wasm module are loaded in ways the service
 * worker's `fetch` handler never sees — a module worker's own script request
 * bypasses it — so they can never be cached opportunistically, and offline
 * would silently boot to a blank page. Their filenames are content-hashed, so
 * they cannot be hardcoded either. Writing the real list at build time is the
 * only version of this that stays correct.
 */
function precacheManifest(): Plugin {
  return {
    name: 'ars-magna-precache',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .map((name) => `/${name}`)
        // The dictionary is cached by the engine itself, and the definition
        // shards are fetched on demand; neither belongs in a precache.
        .filter((path) => !path.startsWith('/dict/') && !path.startsWith('/defs/'));

      this.emitFile({
        type: 'asset',
        fileName: 'precache.json',
        source: `${JSON.stringify({ files: ['/index.html', ...files] }, null, 2)}\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), precacheManifest()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    // The engine is a workspace package consumed as TypeScript source, and it
    // owns the worker entry plus the wasm glue. Pre-bundling it would break
    // both `new Worker(new URL(...))` and the wasm asset URL.
    exclude: ['@ars-magna/engine'],
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
