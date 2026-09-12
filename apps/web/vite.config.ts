import type { IncomingMessage, ServerResponse } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
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
        source: `${JSON.stringify({ files: ['/index.html', '/hits.html', '/hits.json', ...files] }, null, 2)}\n`,
      });
    },
  };
}

/**
 * Serve `*.br` with `Content-Encoding: br`, the way `_headers` does in
 * production.
 *
 * Vite knows nothing about `_headers`, so without this the engine's preference
 * for the pre-compressed artifact would be exercised for the first time on
 * Cloudflare. It would still work — the decoded-length check falls back — but
 * it would fall back on every local run, so the path that ships would be the
 * one nobody had ever seen succeed.
 */
function brotliHeaders(): Plugin {
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (req.url?.split('?')[0]?.endsWith('.br')) {
      res.setHeader('Content-Encoding', 'br');
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    next();
  };

  return {
    name: 'ars-magna-brotli-headers',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), precacheManifest(), brotliHeaders()],
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
    // Two pages: the search and the Greatest Hits gallery.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hits: resolve(__dirname, 'hits.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
});
