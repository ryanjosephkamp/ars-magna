/**
 * Offline support.
 *
 * Everything this site does happens on the reader's own machine — the search,
 * the dictionary, the definitions. Nothing is asked of a server after the first
 * visit, so working offline is closer to admitting what the app already is than
 * to adding a feature.
 *
 * Cache-first is safe here because every asset that matters is content-hashed:
 * the bundles carry a build hash, and the dictionary artifacts carry a sha of
 * their own contents. A cached response cannot be stale, because changed
 * content means a changed URL.
 *
 * This worker only *reads* the cache. Filling it is the page's job (see
 * `warmCache` in `main.tsx`), because two of the files that matter most can
 * never be captured here: everything on a first visit is fetched before this
 * worker activates, and a module worker's own script request bypasses the
 * `fetch` handler entirely. The page knows the real filenames from
 * `precache.json` and can simply put them in.
 */
const CACHE = 'ars-magna-v1';
const SHELL = '/index.html';
const HITS_SHELL = '/hits.html';

/** Which page a navigation belongs to: the gallery and its per-hit pages, or the search. */
function shellFor(pathname) {
  return pathname === HITS_SHELL || pathname.startsWith('/hits/') ? HITS_SHELL : SHELL;
}

self.addEventListener('install', () => {
  // Take over immediately; there is no in-flight state worth preserving.
  void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        // Leave the engine's own dictionary cache alone — it is managed by the
        // worker and keyed separately.
        if (key !== CACHE && key.startsWith('ars-magna-v')) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The dictionary artifacts are already persisted by the engine's own Cache
  // Storage bucket. Caching them again here would double 2.2 MB of storage for
  // no benefit.
  if (url.pathname.startsWith('/dict/')) return;

  if (request.mode === 'navigate') {
    // Network-first for the page itself, so a deploy is picked up on the next
    // load rather than being pinned until the cache is cleared. Offline, a
    // per-hit page falls back to the gallery shell, which reads the hash.
    const shell = shellFor(url.pathname);
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (url.pathname === shell) {
            const cache = await caches.open(CACHE);
            void cache.put(shell, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(shell);
          return cached ?? Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(CACHE);
          void cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        // A missing definition shard is survivable — the result list still
        // works, it just shows no gloss. Anything else genuinely failed.
        return Response.error();
      }
    })(),
  );
});
