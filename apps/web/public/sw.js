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
 * it anything stale a returning visitor still holds. `offline.ts` fills the
 * same cache and names it too; the two must match. v3 replaced v2, whose page
 * shells were redirected responses no navigation could use.
 *
 * Filling the cache is the page's job (see `warmCache` in `offline.ts`), because
 * two of the files that matter most can never be captured here: everything on a
 * first visit is fetched before this worker activates, and a module worker's own
 * script request bypasses the `fetch` handler entirely. The page knows the real
 * filenames from `precache.json` and can simply put them in.
 */
const CACHE = 'ars-magna-v3';
const SHELL = '/index.html';
const HITS_SHELL = '/hits.html';
const BUILD_SHELL = '/build.html';
const HOW_SHELL = '/how.html';

/**
 * Which page a navigation belongs to: the gallery and its per-hit pages, Build,
 * how Discover works, or the search.
 *
 * Cloudflare Pages serves `/hits`, `/build` and `/how` from the `.html` files,
 * and those extensionless addresses are what the site links to, so both
 * spellings have to reach the same shell. It matters only offline, but offline
 * this is the only thing deciding which page the reader gets.
 */
function shellFor(pathname) {
  if (pathname === '/how' || pathname === HOW_SHELL) return HOW_SHELL;
  if (pathname === '/build' || pathname === BUILD_SHELL) return BUILD_SHELL;
  if (pathname === '/hits' || pathname === HITS_SHELL || pathname.startsWith('/hits/')) return HITS_SHELL;
  return SHELL;
}

/**
 * The shell a navigation's own response is, or null when it is some other
 * page: a page's addresses with and without `.html`, and nothing else. A
 * per-hit page under `/hits/` is a page of its own, not the gallery, and an
 * unknown path is not the search page.
 */
function ownShell(pathname) {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (path === '/' || path === SHELL) return SHELL;
  if (path === '/hits' || path === HITS_SHELL) return HITS_SHELL;
  if (path === '/build' || path === BUILD_SHELL) return BUILD_SHELL;
  if (path === '/how' || path === HOW_SHELL) return HOW_SHELL;
  return null;
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
  // Votes are live. A cached count would be wrong the moment anyone voted, and
  // offline there is nothing to vote with.
  if (pathname.startsWith('/api/')) return 'bypass';
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
    //
    // A page's own response is kept as its shell, under either address. Only
    // a plain 200 is: a navigation sees a redirect as an opaque response, and
    // a redirected response is one the browser refuses for a navigation, so
    // either would leave the page blank offline.
    const shell = shellFor(url.pathname);
    const own = ownShell(url.pathname);
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (own !== null && fresh.ok && !fresh.redirected) {
            const cache = await caches.open(CACHE);
            void cache.put(own, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(shell);
          if (!cached) return Response.error();
          // A shell cached as a redirected response is copied into a plain
          // one, the only kind a navigation accepts.
          return cached.redirected
            ? new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers: cached.headers })
            : cached;
        }
      })(),
    );
    return;
  }

  event.respondWith(strategy === 'cache' ? cacheFirst(request) : networkFirst(request));
});
