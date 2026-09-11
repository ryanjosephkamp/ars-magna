/**
 * Worker-side logic, with the worker globals injected.
 *
 * Kept free of `self` / `postMessage` references so it can be driven directly
 * from a test with a fake port — testing a real Worker means a browser, and the
 * interesting logic here (paging, error mapping, stale-request handling) has
 * nothing to do with threads.
 */
import initWasm, { Engine, type InitInput } from './wasm/anagram.js';
import type { Manifest, ManifestFile, Query, Request, Response, Tier } from './protocol.ts';
import { bestOrder } from './wordOrder.ts';

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
async function fetchOne(url: string, fetchImpl: typeof fetch): Promise<ArrayBuffer> {
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(url);
      if (hit) return await hit.arrayBuffer();

      const response = await fetchImpl(url);
      if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
      await cache.put(url, response.clone());
      return await response.arrayBuffer();
    } catch (error) {
      // A failed request must not be swallowed as "Cache Storage is missing" —
      // that would silently fall through to a second identical request.
      if (error instanceof Error && error.message.includes('-> HTTP')) throw error;
      // Cache Storage is unavailable in some private-browsing modes; fall
      // through to a plain fetch rather than failing the load.
    }
  }
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return await response.arrayBuffer();
}

/**
 * Fetch an artifact, preferring the pre-compressed sibling.
 *
 * The dictionary is `application/octet-stream`, which Cloudflare will not
 * compress on the fly, so the plain `.bin` crosses the wire at full size — 2.1
 * MB of the 2.4 MB first load. The build already emits a `.br` next to every
 * artifact, and the host serves it with `Content-Encoding: br`, so the browser
 * decodes it transparently and this gets the same bytes for a third of the
 * transfer.
 *
 * `Content-Encoding` is the one part of this that depends on the host being
 * configured correctly, and getting it wrong yields undecoded brotli rather
 * than an error — the engine would then fail deep inside `Dict::decode` with
 * something unreadable. So the decoded length is checked against the manifest,
 * and anything unexpected falls back to the uncompressed URL. A slow load beats
 * a corrupt one.
 */
async function fetchArtifact(
  baseUrl: string,
  file: ManifestFile,
  fetchImpl: typeof fetch,
): Promise<ArrayBuffer> {
  const plain = `${baseUrl}/${file.name}`;

  if (file.brotliBytes !== undefined) {
    const compressed = `${plain}.br`;
    try {
      const bytes = await fetchOne(compressed, fetchImpl);
      if (bytes.byteLength === file.bytes) return bytes;

      // Either the host served brotli without saying so, or a cache entry from
      // a host that used to. Drop it so the next visit does not repeat this.
      if (typeof caches !== 'undefined') {
        try {
          await (await caches.open(CACHE_NAME)).delete(compressed);
        } catch {
          // Nothing to clean up; the fallback below is what matters.
        }
      }
    } catch {
      // No sibling deployed, or the request failed. Fall back.
    }
  }

  return await fetchOne(plain, fetchImpl);
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
        case 'collect':
          return this.#collect(request.id, request.limit);
        case 'random':
          return this.#random(request.id, request.index);
        case 'spellings':
          return this.#spellings(request.id, request.word, request.tier);
        case 'lookup':
          return this.#lookup(request.id, request.word, request.tier);
        case 'masks':
          return this.#masks(request.id, request.words);
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
        : /appears more than 127 times/.test(message)
          ? 'TOO_MANY_REPEATS'
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
      fetchArtifact(baseUrl, full, fetchImpl),
      fetchArtifact(baseUrl, tiers, fetchImpl),
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


  /**
   * Unpack a batch and put each row into an order that reads like English.
   *
   * The single place rows are materialized. `#emit`, `#collect` and `#random`
   * each had their own copy of the split, which meant the page, the export and
   * "surprise me" could disagree about the same answer. They cannot now.
   *
   * The cost is proportional to rows *shown*, never to rows searched: a query
   * that walked fifty million nodes and one that walked fifty pay the same here.
   */
  #rows(packed: string): string[][] {
    if (packed.length === 0) return [];
    const rows = packed.split('\n').map((row) => row.split(' '));

    const flat = rows.flat();
    if (flat.length === 0) return rows;

    // One call across the whole batch rather than one per word.
    const masks = this.#require().posMasks(flat.join(' '));
    if (masks.length !== flat.length) return rows;

    let at = 0;
    return rows.map((row) => {
      const slice = Array.from(masks.subarray(at, at + row.length));
      at += row.length;
      return bestOrder(row, slice);
    });
  }

  #emit(id: number, offset: number, len: number): void {
    const engine = this.#require();
    const packed = engine.batch(offset, len);
    const rows = this.#rows(packed);

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

  /**
   * One big enumeration for export. Deliberately does not touch the session
   * cursor: exporting should not disturb where the reader is in the list.
   */
  #collect(id: number, limit: number): void {
    const engine = this.#require();
    const packed = engine.batch(0, limit);
    const rows = this.#rows(packed);
    // Short of the limit and the search finished on its own terms: that is
    // everything there is. Otherwise the file is a partial list and has to say so.
    this.#port.post({ k: 'collected', id, rows, complete: rows.length < limit && engine.exhausted });
  }

  #random(id: number, index: string): void {
    const engine = this.#require();
    const packed = engine.nth(index);
    const rows = packed === undefined || packed === null ? [] : this.#rows(packed);
    this.#port.post({ k: 'batch', id, offset: -1, rows, done: true, truncated: false });
  }

  #spellings(id: number, word: string, tier: Tier): void {
    this.#port.post({ k: 'spellings', id, words: this.#require().spellingsOf(word, tier) });
  }

  #lookup(id: number, word: string, tier: Tier): void {
    this.#port.post({ k: 'lookup', id, found: this.#require().has(word, tier) });
  }

  /** Part-of-speech masks, so the interface can rank the alternate orderings
   *  by the same measure the worker used to pick the one it showed. */
  #masks(id: number, words: readonly string[]): void {
    const masks =
      words.length === 0 ? [] : Array.from(this.#require().posMasks(words.join(' ')));
    this.#port.post({ k: 'masks', id, masks });
  }

  get manifest(): Manifest | null {
    return this.#manifest;
  }
}
