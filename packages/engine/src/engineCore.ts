/**
 * Worker-side logic, with the worker globals injected.
 *
 * Kept free of `self` / `postMessage` references so it can be driven directly
 * from a test with a fake port — testing a real Worker means a browser, and the
 * interesting logic here (paging, error mapping, stale-request handling) has
 * nothing to do with threads.
 */
import initWasm, { Engine, type InitInput } from './wasm/anagram.js';
import type { Manifest, Query, Request, Response, Tier } from './protocol.ts';

export type Port = {
  post(message: Response): void;
};

export type CoreOptions = {
  /** Overrides the wasm module source; the worker passes a URL, tests pass bytes. */
  wasmInput?: InitInput;
  fetchImpl?: typeof fetch;
};

const CACHE_NAME = 'ars-magna-dict-v1';

/** Enough for any interactive query; a hard stop for the pathological ones. */
const DEFAULT_MAX_NODES = 50_000_000;

/** Fetch through the Cache Storage API when available.
 *
 *  Artifact filenames carry a content hash, so a cached entry can never be
 *  stale — a rebuilt dictionary is a different URL. That makes the cache a pure
 *  win and lets the app work offline after one visit. */
async function fetchArtifact(url: string, fetchImpl: typeof fetch): Promise<ArrayBuffer> {
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(url);
      if (hit) return await hit.arrayBuffer();

      const response = await fetchImpl(url);
      if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
      await cache.put(url, response.clone());
      return await response.arrayBuffer();
    } catch {
      // Cache Storage is unavailable in some private-browsing modes; fall
      // through to a plain fetch rather than failing the load.
    }
  }
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return await response.arrayBuffer();
}

type Session = {
  readonly id: number;
  readonly query: Query;
  /** Cursor for sequential paging, so scrolling does not re-skip from zero. */
  served: number;
  exhausted: boolean;
};

export class EngineCore {
  #port: Port;
  #options: CoreOptions;
  #engine: Engine | null = null;
  #manifest: Manifest | null = null;
  #session: Session | null = null;

  constructor(port: Port, options: CoreOptions = {}) {
    this.#port = port;
    this.#options = options;
  }

  async handle(request: Request): Promise<void> {
    try {
      switch (request.k) {
        case 'init':
          return await this.#init(request.id, request.baseUrl);
        case 'solve':
          return this.#solve(request.id, request.query, request.first, request.maxNodes);
        case 'page':
          return this.#page(request.offset, request.len);
        case 'random':
          return this.#random(request.id, request.index);
        case 'spellings':
          return this.#spellings(request.id, request.word, request.tier);
        case 'lookup':
          return this.#lookup(request.id, request.word, request.tier);
      }
    } catch (error) {
      this.#fail(request.id, error);
    }
  }

  #fail(id: number, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    // The Rust layer reports these as plain messages; map them to codes the UI
    // can attach to the right control rather than showing a global banner.
    const code = /not in this dictionary tier/.test(message)
      ? 'UNKNOWN_WORD'
      : /does not fit in the input letters/.test(message)
        ? 'NOT_A_SUBSET'
        : /HTTP|fetch|network/i.test(message)
          ? 'FETCH_FAILED'
          : 'INTERNAL';
    this.#port.post({ k: 'error', id, code, message });
  }

  async #init(id: number, baseUrl: string): Promise<void> {
    const started = performance.now();
    const fetchImpl = this.#options.fetchImpl ?? fetch;

    try {
      await initWasm(
        this.#options.wasmInput !== undefined ? { module_or_path: this.#options.wasmInput } : undefined,
      );
    } catch (error) {
      this.#port.post({
        k: 'error',
        id,
        code: 'WASM_INIT',
        message: error instanceof Error ? error.message : 'WebAssembly failed to start',
      });
      return;
    }

    const manifestUrl = `${baseUrl}/manifest.json`;
    const response = await fetchImpl(manifestUrl);
    if (!response.ok) throw new Error(`${manifestUrl} -> HTTP ${response.status}`);
    const manifest = (await response.json()) as Manifest;

    const full = manifest.files.full;
    const tiers = manifest.files.tiers;
    if (!full || !tiers) {
      this.#port.post({
        k: 'error',
        id,
        code: 'BAD_ARTIFACT',
        message: 'manifest is missing the full or tiers artifact',
      });
      return;
    }

    const [dictBytes, tierBytes] = await Promise.all([
      fetchArtifact(`${baseUrl}/${full.name}`, fetchImpl),
      fetchArtifact(`${baseUrl}/${tiers.name}`, fetchImpl),
    ]);

    this.#engine = new Engine(new Uint8Array(dictBytes), new Uint8Array(tierBytes));
    this.#manifest = manifest;

    this.#port.post({
      k: 'ready',
      id,
      counts: manifest.counts,
      builtAt: manifest.builtAt,
      loadMs: Math.round(performance.now() - started),
    });
  }

  #require(): Engine {
    if (!this.#engine) throw new Error('engine is not initialized');
    return this.#engine;
  }

  #solve(id: number, query: Query, first: number, maxNodes = DEFAULT_MAX_NODES): void {
    const engine = this.#require();
    const started = performance.now();

    const candidates = engine.begin(
      query.input,
      query.tier,
      query.minWordLen,
      query.maxWords,
      [...query.mustInclude],
      maxNodes,
    );

    this.#session = { id, query, served: 0, exhausted: false };

    // The exact total goes out before any results do: on a query with millions
    // of answers the count lands in milliseconds while enumerating them all
    // never would, and "11,131,625 anagrams" is the more useful thing to show
    // first anyway.
    const total = engine.count(maxNodes * 2);
    this.#port.post({ k: 'count', id, total, candidates });

    this.#emit(id, 0, first);
    this.#port.post({
      k: 'solved',
      id,
      stats: { candidates, elapsedMs: Math.round(performance.now() - started) },
    });
  }

  #page(offset: number, len: number): void {
    const session = this.#session;
    if (!session) throw new Error('no active query');
    // Paging replies carry the *session* id, not the page request's: the client
    // keys results by query, and a page belongs to the query that produced it.
    this.#emit(session.id, offset, len);
  }

  #emit(id: number, offset: number, len: number): void {
    const engine = this.#require();
    const packed = engine.batch(offset, len);
    const rows = packed.length === 0 ? [] : packed.split('\n').map((row) => row.split(' '));

    // A short batch is only "the end" when the search actually ran out; if it
    // hit its node budget instead, more answers exist and saying otherwise
    // would be a claim of completeness the engine cannot back.
    const truncated = !engine.exhausted;
    const done = rows.length < len && !truncated;

    if (this.#session) {
      this.#session.served = Math.max(this.#session.served, offset + rows.length);
      this.#session.exhausted ||= done;
    }

    this.#port.post({ k: 'batch', id, offset, rows, done, truncated });
  }

  #random(id: number, index: string): void {
    const engine = this.#require();
    const packed = engine.nth(index);
    const rows = packed === undefined || packed === null ? [] : [packed.split(' ')];
    this.#port.post({ k: 'batch', id, offset: -1, rows, done: true, truncated: false });
  }

  #spellings(id: number, word: string, tier: Tier): void {
    this.#port.post({ k: 'spellings', id, words: this.#require().spellingsOf(word, tier) });
  }

  #lookup(id: number, word: string, tier: Tier): void {
    this.#port.post({ k: 'lookup', id, found: this.#require().has(word, tier) });
  }

  get manifest(): Manifest | null {
    return this.#manifest;
  }
}
