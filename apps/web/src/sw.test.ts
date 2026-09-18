import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

// public/sw.js is a classic worker script, not a module, so it is run here in a
// sandbox with a fake network and a fake Cache Storage, the way a browser would
// run it, rather than imported.
const SW = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const MAIN = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const ORIGIN = 'https://ars-magna.pages.dev';

type Listener = (event: Record<string, unknown>) => void;
type Key = { url: string } | string;

const pathOf = (key: Key): string => new URL(typeof key === 'string' ? key : key.url, ORIGIN).pathname;

type Setup = {
  online?: boolean;
  cached?: Record<string, string>;
  network?: Record<string, string>;
  cacheNames?: string[];
};

function worker(setup: Setup = {}) {
  const listeners = new Map<string, Listener>();
  const stored = new Map<string, string>(Object.entries(setup.cached ?? {}));
  const fetched: string[] = [];
  const deleted: string[] = [];

  const cache = {
    match: async (key: Key) => {
      const body = stored.get(pathOf(key));
      return body === undefined ? undefined : new Response(body);
    },
    put: async (key: Key, response: Response) => {
      stored.set(pathOf(key), await response.text());
    },
  };

  const sandbox: Record<string, unknown> = {
    URL,
    Response,
    self: {
      location: { origin: ORIGIN },
      addEventListener: (type: string, listener: Listener) => void listeners.set(type, listener),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => cache,
      match: (key: Key) => cache.match(key),
      keys: async () => setup.cacheNames ?? [],
      delete: async (name: string) => {
        deleted.push(name);
        return true;
      },
    },
    fetch: async (key: Key) => {
      const path = pathOf(key);
      fetched.push(path);
      if (setup.online === false) throw new TypeError('Failed to fetch');
      const body = setup.network?.[path];
      return body === undefined ? new Response('not found', { status: 404 }) : new Response(body);
    },
  };
  runInNewContext(SW, sandbox);

  /** What the worker answers for a GET, or undefined when it leaves the request to the browser. */
  async function get(path: string, mode = 'cors'): Promise<string | undefined> {
    let answer: Promise<Response> | undefined;
    listeners.get('fetch')?.({
      request: { method: 'GET', url: ORIGIN + path, mode },
      respondWith: (response: Promise<Response>) => {
        answer = response;
      },
    });
    return answer === undefined ? undefined : (await answer).text();
  }

  async function activate(): Promise<void> {
    let done: Promise<unknown> | undefined;
    listeners.get('activate')?.({
      waitUntil: (work: Promise<unknown>) => {
        done = work;
      },
    });
    await done;
  }

  const strategyFor = sandbox['strategyFor'] as (pathname: string, mode: string) => string;
  return { get, activate, strategyFor, stored, fetched, deleted };
}

const cacheName = /const CACHE = '([^']+)';/.exec(SW)?.[1];

describe('service worker', () => {
  it('sends content-hashed assets to the cache and every file that keeps its URL to the network', () => {
    const { strategyFor } = worker();
    expect(strategyFor('/assets/hits-BKH7ydKv.js', 'cors')).toBe('cache');
    expect(strategyFor('/hits.json', 'cors')).toBe('network');
    expect(strategyFor('/precache.json', 'cors')).toBe('network');
    expect(strategyFor('/defs/0.json', 'cors')).toBe('network');
    expect(strategyFor('/manifest.webmanifest', 'cors')).toBe('network');
    expect(strategyFor('/hits', 'navigate')).toBe('shell');
    expect(strategyFor('/dict/full-0123abcd.bin', 'cors')).toBe('bypass');
    expect(strategyFor('/api/votes', 'cors')).toBe('bypass');
    expect(strategyFor('/api/promotions', 'cors')).toBe('bypass');
    expect(strategyFor('/build', 'navigate')).toBe('shell');
  });

  it('leaves the vote and promotion API to the network, never answering it from a cache', async () => {
    const sw = worker({ cached: { '/api/votes': '{"counts":{}}', '/api/promotions': '{"counts":{}}' } });
    expect(await sw.get('/api/votes?voter=x')).toBeUndefined();
    expect(await sw.get('/api/promotions?letters=aaeeglmnnt')).toBeUndefined();
    expect(sw.fetched).toEqual([]);
  });

  it('never answers a promotion or a submission, which are POSTs to the API', async () => {
    const sw = worker();
    expect(sw.strategyFor('/api/promote', 'cors')).toBe('bypass');
    expect(sw.strategyFor('/api/pass', 'cors')).toBe('bypass');
    expect(await sw.get('/api/promote')).toBeUndefined();
    expect(sw.fetched).toEqual([]);
  });

  it('serves a fresh hits.json over the copy cached on an earlier visit, and keeps the fresh one', async () => {
    const sw = worker({ cached: { '/hits.json': '{"hits":10}' }, network: { '/hits.json': '{"hits":240}' } });
    expect(await sw.get('/hits.json')).toBe('{"hits":240}');
    expect(sw.stored.get('/hits.json')).toBe('{"hits":240}');
  });

  it('falls back to the cached hits.json offline', async () => {
    const sw = worker({ online: false, cached: { '/hits.json': '{"hits":240}' } });
    expect(await sw.get('/hits.json')).toBe('{"hits":240}');
  });

  it('answers a content-hashed asset from the cache without asking the network', async () => {
    const sw = worker({
      cached: { '/assets/main-CxouUuaG.js': 'from the cache' },
      network: { '/assets/main-CxouUuaG.js': 'from the network' },
    });
    expect(await sw.get('/assets/main-CxouUuaG.js')).toBe('from the cache');
    expect(sw.fetched).toEqual([]);
  });

  it('falls back to the gallery shell for a per-hit page offline', async () => {
    const sw = worker({ online: false, cached: { '/hits.html': 'gallery shell' } });
    expect(await sw.get('/hits/dirty-room', 'navigate')).toBe('gallery shell');
  });

  it('sends both spellings of a page to that page’s own shell offline', async () => {
    // The site links to /hits and /how; Pages serves them from the .html files.
    // Offline, a reader who followed one of those links would otherwise land on
    // the search page.
    const cached = { '/index.html': 'search shell', '/hits.html': 'gallery shell', '/build.html': 'build shell', '/how.html': 'how shell' };
    const sw = worker({ online: false, cached });
    expect(await sw.get('/hits', 'navigate')).toBe('gallery shell');
    expect(await sw.get('/hits.html', 'navigate')).toBe('gallery shell');
    expect(await sw.get('/how', 'navigate')).toBe('how shell');
    expect(await sw.get('/how.html', 'navigate')).toBe('how shell');
    expect(await sw.get('/build', 'navigate')).toBe('build shell');
    expect(await sw.get('/build.html', 'navigate')).toBe('build shell');
    expect(await sw.get('/', 'navigate')).toBe('search shell');
  });

  it('leaves the dictionary artifacts to the engine', async () => {
    const sw = worker();
    expect(await sw.get('/dict/full-0123abcd.bin')).toBeUndefined();
    expect(sw.fetched).toEqual([]);
  });

  it('deletes older page caches on activation and keeps the current one and the dictionary cache', async () => {
    expect(cacheName).toBeDefined();
    const sw = worker({ cacheNames: ['ars-magna-v1', 'ars-magna-dict-v1', cacheName ?? ''] });
    await sw.activate();
    expect(sw.deleted).toEqual(['ars-magna-v1']);
  });

  it('names the same cache as the page that fills it', () => {
    expect(/caches\.open\('([^']+)'\)/.exec(MAIN)?.[1]).toBe(cacheName);
  });
});
