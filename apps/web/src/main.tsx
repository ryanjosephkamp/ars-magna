import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Fill the offline cache from the list the build emitted.
 *
 * Done here rather than in the service worker's `activate` handler because the
 * page can name the files reliably and the worker cannot observe them: a first
 * visit fetches everything before the worker exists, and a module worker's own
 * script request never reaches its `fetch` handler at all. The worker is a pure
 * read-through cache; this is what puts things in it.
 */
async function warmCache(): Promise<void> {
  const manifest = await fetch('/precache.json');
  if (!manifest.ok) return;

  const { files } = (await manifest.json()) as { files?: string[] };
  if (!Array.isArray(files)) return;

  const cache = await caches.open('ars-magna-v1');
  const missing = (
    await Promise.all(files.map(async (path) => ((await cache.match(path)) ? null : path)))
  ).filter((path): path is string => path !== null);

  await Promise.all(
    missing.map(async (path) => {
      try {
        const response = await fetch(path);
        if (response.ok) await cache.put(path, response);
      } catch {
        // One asset failing should not stop the rest from being cached.
      }
    }),
  );
}

// Production only: in dev a service worker would sit in front of Vite's module
// graph and serve stale chunks against HMR.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const start = () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is an enhancement; a browser that refuses the
      // registration should still get a working site.
    });
    void warmCache().catch(() => {});
  };

  // `load` may already have fired by the time this module runs — a bfcache
  // restore or a fast static response is enough. Waiting for an event that has
  // been and gone would silently disable offline support.
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
