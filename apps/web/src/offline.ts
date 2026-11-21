/**
 * Offline support, the page's half: register the service worker and fill its
 * cache from the list the build emitted. Every page calls `startOffline`, so
 * one visit to any of them is enough.
 *
 * The cache is filled here rather than in the service worker's `activate`
 * handler because the page can name the files reliably and the worker cannot
 * observe them: a first visit fetches everything before the worker exists, and
 * a module worker's own script request never reaches its `fetch` handler at
 * all. The worker is a pure read-through cache; this is what puts things in it.
 */

/**
 * Where each page shell is fetched from: the address the site links to.
 * Cloudflare Pages answers `/hits.html` with a 308 redirect to `/hits` (and
 * `/index.html` with one to `/`), and a response that followed a redirect is
 * one the browser refuses to show for a navigation. Fetching the `.html`
 * names cached four redirected responses, so every page failed offline. Each
 * shell is still stored under its `.html` name, which is what public/sw.js
 * looks up.
 */
const SHELL_SOURCES: Readonly<Record<string, string>> = {
  '/index.html': '/',
  '/hits.html': '/hits',
  '/build.html': '/build',
  '/how.html': '/how',
};

/**
 * A response the cache can hand to a navigation. One that followed a redirect
 * is copied into a fresh response, which carries the same body and headers
 * without the redirected flag.
 */
export function storable(response: Response): Response {
  if (!response.redirected) return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

/** Put every file the build listed into the cache, skipping those already there. */
export async function warmCache(): Promise<void> {
  const manifest = await fetch('/precache.json');
  if (!manifest.ok) return;

  const { files } = (await manifest.json()) as { files?: string[] };
  if (!Array.isArray(files)) return;

  // The same cache the service worker reads; public/sw.js names it too.
  const cache = await caches.open('ars-magna-v3');
  const missing = (
    await Promise.all(
      files.map(async (path) => {
        const cached = await cache.match(path);
        // A redirected copy is as good as none: no navigation can use it.
        return cached && !cached.redirected ? null : path;
      }),
    )
  ).filter((path): path is string => path !== null);

  await Promise.all(
    missing.map(async (path) => {
      try {
        const response = await fetch(SHELL_SOURCES[path] ?? path);
        if (response.ok) await cache.put(path, storable(response));
      } catch {
        // One asset failing should not stop the rest from being cached.
      }
    }),
  );
}

/**
 * Register the service worker and fill its cache. Production only: in dev a
 * service worker would sit in front of Vite's module graph and serve stale
 * chunks against HMR.
 */
export function startOffline(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

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
