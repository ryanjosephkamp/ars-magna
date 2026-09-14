/**
 * Offline support.
 *
 * Everything this site does happens on the reader's own machine — the search,
 * the dictionary, the definitions. Nothing is asked of a server after the first
 * visit, so working offline is closer to admitting what the app already is than
 * to adding a feature.
 *
 * How a request is answered depends on whether its URL can go stale:
 *
 * - Vite's output under `/assets/` carries a build hash in its filename, so a
 *   cached copy cannot be stale: changed content means a changed URL. Those are
 *   served from the cache first.
 * - Everything else keeps its URL across deploys: `/hits.json` (rebuilt on every
 *   deploy), `/precache.json`, the definition shards under `/defs/`, the icon and
 *   the web manifest. Served cache-first, a returning visitor would see the copy
 *   from their first visit forever, as the gallery did until 2026-09-13. Those
 *   go to the network first, and the cached copy is only the offline fallback.
 *   The browser's own HTTP cache (see `_headers`) still spares the round trip
 *   for the shards.
 * - Page navigations go to the network first too, falling back to the page
 *   shell offline.
 * - The dictionary artifacts under `/dict/` are left to the engine's own cache.
 *
 * Bumping `CACHE` makes the next activation delete the previous cache, and with
 * it anything stale a returning visitor still holds. `main.tsx` fills the same
 * cache and names it too; the two must match.
 *
 * Filling the cache is the page's job (see `warmCache` in `main.tsx`), because
 * two of the files that matter most can never be captured here: everything on a
 * first visit is fetched before this worker activates, and a module worker's own
 * script request bypasses the `fetch` handler entirely. The page knows the real
 * filenames from `precache.json` and can simply put them in.
 */
const CACHE = 'ars-magna-v2';
const SHELL = '/index.html';
const HITS_SHELL = '/hits.html';

/** Which page a navigation belongs to: the gallery and its per-hit pages, or the search. */
function shellFor(pathname) {
  return pathname === HITS_SHELL || pathname.startsWith('/hits/') ? HITS_SHELL : SHELL;
}

/**
 * How a same-origin GET is answered: `bypass` (not handled here), `shell` (a
 * navigation), `cache` (content-hashed, cache first) or `network` (network
 * first, cache as the offline fallback).
 */
function strategyFor(pathname, mode) {
  // The dictionary artifacts are already persisted by the engine's own Cache
  // Storage bucket. Caching them again here would double 2.2 MB of storage for
  // no benefit.
  if (pathname.startsWith('/dict/')) return 'bypass';
  if (mode === 'navigate') return 'shell';
  if (pathname.startsWith('/assets/')) return 'cache';
  return 'network';
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

async function remember(request, response) {
  if (!response.ok) return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    await remember(request, fresh);
    return fresh;
  } catch {
    return Response.error();
  }
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    await remember(request, fresh);
    return fresh;
  } catch {
    // Offline: the last copy fetched, if any. A missing definition shard is
    // survivable — the result list still works, it just shows no gloss.
    const cached = await caches.match(request);
    return cached ?? Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const strategy = strategyFor(url.pathname, request.mode);
  if (strategy === 'bypass') return;

  if (strategy === 'shell') {
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

  event.respondWith(strategy === 'cache' ? cacheFirst(request) : networkFirst(request));
});
