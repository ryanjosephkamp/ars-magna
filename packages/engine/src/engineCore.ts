/**
 * Worker-side logic, with the worker globals injected.
 *
 * Kept free of `self` / `postMessage` references so it can be driven directly
 * from a test with a fake port — testing a real Worker means a browser, and the
 * interesting logic here (paging, error mapping, stale-request handling) has
 * nothing to do with threads.
 */
import initWasm, { Engine, type InitInput, type Rows } from './wasm/anagram.js';
import { CLASSES, isClassName, type ClassName, type Manifest, type ManifestFile, type Query, type Request, type Response, type RowTag, type Tier } from './protocol.ts';
import { bestOrder } from './wordOrder.ts';
import { foldWords, normalizeLetters } from './fold.ts';
import { readForms } from './dictForms.ts';

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
  /** The dictionary load under way, which every other request waits for. */
  #loading: Promise<void> | null = null;

  constructor(port: Port, options: CoreOptions = {}) {
    this.#port = port;
    this.#options = options;
  }

  async handle(request: Request): Promise<void> {
    // A worker that replaces a killed one is sent its dictionary and the next
    // request back to back, and the load awaits the network and the cache, so
    // the request would arrive to no engine and fail with "engine is not
    // initialized". It waits for the load instead; requests keep their order.
    if (request.k !== 'init' && this.#loading) await this.#loading;
    try {
      switch (request.k) {
        case 'init': {
          const loading = this.#init(request.id, request.baseUrl);
          this.#loading = loading.catch(() => {});
          return await loading;
        }
        case 'solve':
          return this.#solve(request.id, request.query, request.first, request.maxNodes);
        case 'page':
          return this.#page(request.offset, request.len);
        case 'count':
          return this.#count(request.id, request.query, request.maxNodes);
        case 'collect':
          return this.#collect(request.id, request.limit);
        case 'random':
          return this.#random(request.id, request.index);
        case 'spellings':
          return this.#spellings(request.id, request.word, request.tier);
        case 'lookup':
          return this.#lookup(request.id, request.word, request.tier, request.classes ?? []);
        case 'masks':
          return this.#masks(request.id, request.words);
        case 'zipf':
          return this.#zipf(request.id, request.words);
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
          : /more than six different digits and symbols/.test(message)
            ? 'TOO_MANY_CHARACTERS'
            : /numerals/.test(message)
              ? 'TOO_MANY_NUMERALS'
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

    // The terms of the classes travel in their own artifact, which the build
    // emits only once a class file has a term; a manifest without one is a
    // dictionary of words alone.
    const classes = manifest.files.classes;
    const [dictBytes, tierBytes, classBytes] = await Promise.all([
      fetchArtifact(baseUrl, full, fetchImpl),
      fetchArtifact(baseUrl, tiers, fetchImpl),
      classes ? fetchArtifact(baseUrl, classes, fetchImpl) : Promise.resolve(null),
    ]);

    const dict = new Uint8Array(dictBytes);
    const engine = new Engine(dict, new Uint8Array(tierBytes), classBytes ? new Uint8Array(classBytes) : undefined);
    this.#engine = engine;
    this.#manifest = manifest;

    const termCounts = Array.from(engine.classCounts());
    this.#port.post({
      k: 'ready',
      id,
      counts: manifest.counts,
      builtAt: manifest.builtAt,
      loadMs: Math.round(performance.now() - started),
      // The forms travel beside the letters: results stay [a-z]+, and the
      // page shows `don't` for `dont` from this list.
      forms: readForms(dict),
      classes: Object.fromEntries(CLASSES.map((name, i) => [name, termCounts[i] ?? 0])) as Record<ClassName, number>,
    });
  }

  #require(): Engine {
    if (!this.#engine) throw new Error('engine is not initialized');
    return this.#engine;
  }

  #solve(id: number, query: Query, first: number, maxNodes = DEFAULT_MAX_NODES): void {
    const engine = this.#require();
    const started = performance.now();

    // Folded here as well as in Rust: the engine's normalize() does the same
    // thing, but the worker is the boundary every caller crosses, and folding
    // on both sides means neither can regress the other unnoticed. The words
    // go over with single spaces between them, since the engine needs to know
    // what the text's own words are: the text is never its own result. The
    // reader's fixed readings are applied here (`$` as s, a character left
    // out); the characters leet is on for go over as they are, and the
    // engine tries each of their readings.
    const candidates = engine.begin(
      foldWords(query.input, query.reading).join(' '),
      query.tier,
      [...query.classes],
      [...query.leet],
      query.minWordLen,
      query.maxWords,
      query.mustInclude.map((word) => normalizeLetters(word)),
      query.mustExclude.map((word) => normalizeLetters(word)),
      maxNodes,
    );

    this.#session = { id, query, served: 0, exhausted: false };

    // The exact total goes out before any results do: on a query with millions
    // of answers the count lands in milliseconds while enumerating them all
    // never would, and "11,131,625 anagrams" is the more useful thing to show
    // first anyway. Same node budget as enumeration: a count node is far more
    // expensive than a walk node (it scans a whole bucket), so doubling it
    // bought minutes of frozen worker on a pasted sentence, not accuracy. The
    // engine also caps the memo, so a count cannot grow without bound.
    const total = engine.count(maxNodes);
    this.#port.post({
      k: 'count',
      id,
      total,
      candidates,
      textLeftOut: engine.textLeftOut,
      unused: engine.unused,
      leet: engine.leetTried,
    });

    this.#emit(id, 0, first);
    this.#port.post({
      k: 'solved',
      id,
      stats: { candidates, elapsedMs: Math.round(performance.now() - started) },
    });
  }

  /**
   * A query's total alone. The engine prepares it apart from the session, so
   * the list the reader is paging through, its cursor and its memo are all
   * untouched. `candidates` is reported as 0: nothing here predicts a search.
   */
  #count(id: number, query: Query, maxNodes = DEFAULT_MAX_NODES): void {
    const counted = this.#require().countQuery(
      foldWords(query.input, query.reading).join(' '),
      query.tier,
      [...query.classes],
      [...query.leet],
      query.minWordLen,
      query.maxWords,
      query.mustInclude.map((word) => normalizeLetters(word)),
      query.mustExclude.map((word) => normalizeLetters(word)),
      maxNodes,
    );
    const { total, textLeftOut, unused } = counted;
    counted.free();
    // A count on its own reports no leet: what it counted is the query's own business.
    this.#port.post({ k: 'count', id, total, candidates: 0, textLeftOut, unused, leet: [...query.leet] });
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
   *
   * The tags come as a second packed string, one line per row, empty when no
   * row has one (every row of words alone as typed, which is every row until
   * a class or leet is on); a tagged row's written forms and classes are
   * reordered with its words.
   */
  #rows(packed: Rows): { rows: string[][]; tags?: (RowTag | null)[] } {
    const text = packed.rows;
    const tagText = packed.tags;
    packed.free();
    if (text.length === 0) return { rows: [] };
    const rows = text.split('\n').map((row) => row.split(' '));
    const tags = tagText.length === 0 ? null : tagText.split('\n').map(parseTag);

    const flat = rows.flat();
    if (flat.length === 0) return tags ? { rows, tags } : { rows };

    // One call across the whole batch rather than one per word.
    const masks = this.#require().posMasks(flat.join(' '));
    if (masks.length !== flat.length) return tags ? { rows, tags } : { rows };

    let at = 0;
    const ordered = rows.map((row, i) => {
      const slice = Array.from(masks.subarray(at, at + row.length));
      at += row.length;
      const best = bestOrder(row, slice);
      const tag = tags?.[i];
      if (tag) {
        // The same permutation for the written forms and the classes: a word
        // and its tag travel together whatever order reads best.
        const order = best.map((word) => {
          const j = row.indexOf(word);
          row[j] = '\0';
          return j;
        });
        tags![i] = { ...tag, written: order.map((j) => tag.written[j]!), classes: order.map((j) => tag.classes[j]!) };
      }
      return best;
    });
    return tags ? { rows: ordered, tags } : { rows: ordered };
  }

  #emit(id: number, offset: number, len: number): void {
    const engine = this.#require();
    const { rows, tags } = this.#rows(engine.batch(offset, len));

    // A short batch is "the end" of what this session can serve in two cases:
    // the search ran out of answers, or it ran out of budget. They are told
    // apart by `truncated`, and the count is already a floor in the second
    // case — but both mean the list must stop asking for pages. Re-paging a
    // truncated search re-walks to the same budget and returns nothing new,
    // at the full cost of the budget each time.
    const truncated = !engine.exhausted;
    const done = truncated || rows.length < len;

    if (this.#session) {
      this.#session.served = Math.max(this.#session.served, offset + rows.length);
      this.#session.exhausted ||= done;
    }

    this.#port.post(tags ? { k: 'batch', id, offset, rows, done, truncated, tags } : { k: 'batch', id, offset, rows, done, truncated });
  }

  /**
   * One big enumeration for export. Deliberately does not touch the session
   * cursor: exporting should not disturb where the reader is in the list.
   */
  #collect(id: number, limit: number): void {
    const engine = this.#require();
    const { rows, tags } = this.#rows(engine.collect(limit));
    // Short of the limit and the search finished on its own terms: that is
    // everything there is. Otherwise the file is a partial list and has to say so.
    const complete = rows.length < limit && engine.exhausted;
    this.#port.post(tags ? { k: 'collected', id, rows, complete, tags } : { k: 'collected', id, rows, complete });
  }

  #random(id: number, index: string): void {
    const engine = this.#require();
    const packed = engine.nth(index);
    const { rows, tags } = packed === undefined || packed === null ? { rows: [] } : this.#rows(packed);
    this.#port.post(
      tags ? { k: 'batch', id, offset: -1, rows, done: true, truncated: false, tags } : { k: 'batch', id, offset: -1, rows, done: true, truncated: false },
    );
  }

  #spellings(id: number, word: string, tier: Tier): void {
    const words = this.#require().spellingsOf(normalizeLetters(word), tier, []);
    this.#port.post({ k: 'spellings', id, words });
  }

  /**
   * Whether a word is in the tier, or is a term of one of the classes asked
   * for, and in the second case which class carries it: the classes are asked
   * one at a time, in the table's order, so the answer is the same first class
   * a row's tag names. Only a word no tier has costs those extra lookups, and
   * only on the Build page, which asks once per word.
   */
  #lookup(id: number, word: string, tier: Tier, classes: readonly ClassName[]): void {
    const engine = this.#require();
    const letters = normalizeLetters(word);
    const found = engine.has(letters, tier, [...classes]);
    if (!found || classes.length === 0 || engine.has(letters, tier, [])) {
      this.#port.post({ k: 'lookup', id, found });
      return;
    }
    const termClass = CLASSES.filter((name) => classes.includes(name)).find((name) => engine.has(letters, tier, [name]));
    this.#port.post(termClass ? { k: 'lookup', id, found, termClass } : { k: 'lookup', id, found });
  }

  /** Part-of-speech masks, so the interface can rank the alternate orderings
   *  by the same measure the worker used to pick the one it showed. */
  #masks(id: number, words: readonly string[]): void {
    const masks =
      words.length === 0 ? [] : Array.from(this.#require().posMasks(words.join(' ')));
    this.#port.post({ k: 'masks', id, masks });
  }

  /** Each word's frequency byte: how common the dictionary says it is. */
  #zipf(id: number, words: readonly string[]): void {
    const zipf = words.length === 0 ? [] : Array.from(this.#require().zipfOf(words.join(' ')));
    this.#port.post({ k: 'zipf', id, zipf });
  }

  get manifest(): Manifest | null {
    return this.#manifest;
  }
}

/**
 * One line of the engine's packed tags: empty for a row of words alone, else
 * `reading|classes|written` with the reading as `$:s` pairs comma-joined, one
 * class name per word (`-` for a word of the dictionary), and the written
 * words space separated. The Rust side (`pack_tags` in `crates/anagram-wasm`)
 * writes it.
 */
export function parseTag(line: string): RowTag | null {
  if (line.length === 0) return null;
  const [readingText = '', classText = '', writtenText = ''] = line.split('|');
  const reading: Record<string, string> = {};
  for (const pair of readingText.split(',')) {
    if (pair.length === 0) continue;
    const colon = pair.indexOf(':');
    if (colon > 0) reading[pair.slice(0, colon)] = pair.slice(colon + 1);
  }
  const classes = classText.split(' ').map((name) => (isClassName(name) ? name : null));
  return { classes, written: writtenText.split(' '), reading };
}
