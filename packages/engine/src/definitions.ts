/**
 * Word definitions and provenance, fetched on demand.
 *
 * Ten megabytes of glosses would triple the app's download for something most
 * visitors never open, so they are sharded by a hash of the word and pulled in
 * only when a result row is expanded. A shard is ~15 KB gzipped and covers
 * roughly 740 words, so opening a few rows usually costs one or two requests.
 *
 * Provenance matters as much as the definition here. English OpenList
 * deliberately contains machine-derived forms and unusual Scrabble words; a
 * result built from one of those reads as a bug unless the interface can say
 * where the word came from.
 *
 * Lives in the engine package rather than the app because the MCP server
 * answers the same question from the same shards, read off disk.
 */

export type Sense = {
  readonly pos: string;
  readonly gloss: string;
  /** Present when the gloss belongs to a base form, e.g. `dormitories` -> `dormitory`. */
  readonly base?: string;
};

export type Provenance = 'attested' | 'twl' | 'generated' | 'unattested';

export type WordInfo = {
  readonly word: string;
  readonly senses: readonly Sense[];
  readonly provenance: Provenance;
};

const PROVENANCE_OF: Record<string, Provenance> = {
  t: 'twl',
  g: 'generated',
  o: 'unattested',
};

/**
 * Shown only when there is no definition, so each of these has to carry the
 * "no definition" half of the message itself.
 *
 * `twl` used to read just "in the Scrabble dictionary", which is true and was
 * doing a definition's job: it answered a question nobody asked instead of the
 * one they did. A reader looking at `za` wants to know what it means, and the
 * honest answer is that we do not have one — followed by the reason the word is
 * in the list at all.
 */
export const PROVENANCE_LABEL: Record<Provenance, string | null> = {
  // The ordinary case needs no explanation; saying so would be noise on most rows.
  attested: null,
  twl: 'no definition found — valid in tournament play',
  generated: 'no definition found — a machine-derived form in English OpenList',
  unattested: 'no definition found — and no source confirms this word',
};

/**
 * Whether a word's provenance is worth showing.
 *
 * Provenance exists to explain words a reader would otherwise take for a bug.
 * A definition already does that job, so the label is suppressed whenever one
 * is present — which matters because 46% of the list carries the `twl` code,
 * including thoroughly ordinary words like `dormitory`. Announcing "in the
 * Scrabble dictionary" on half of every result would be noise, and noise
 * teaches people to stop reading.
 */
export function shouldExplain(info: WordInfo): boolean {
  return info.senses.length === 0 && PROVENANCE_LABEL[info.provenance] !== null;
}

type RawShard = {
  p?: Record<string, string[]>;
  d?: Record<string, ([string, string] | [string, string, string])[]>;
};

type Shard = {
  provenance: Map<string, Provenance>;
  senses: Map<string, Sense[]>;
};

/**
 * FNV-1a, 32-bit. Must match `tools/dict-build/src/hash.ts` exactly — a drift
 * would not throw, it would silently return "no definition" for most words.
 * `definitions.test.ts` asserts the two implementations agree.
 */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function parseShard(raw: RawShard): Shard {
  const provenance = new Map<string, Provenance>();
  for (const [code, words] of Object.entries(raw.p ?? {})) {
    const value = PROVENANCE_OF[code];
    if (!value) continue;
    for (const word of words) provenance.set(word, value);
  }

  const senses = new Map<string, Sense[]>();
  for (const [word, list] of Object.entries(raw.d ?? {})) {
    senses.set(
      word,
      list.map(([pos, gloss, base]) => (base === undefined ? { pos, gloss } : { pos, gloss, base })),
    );
  }

  return { provenance, senses };
}

export class Definitions {
  #baseUrl: string;
  #shardCount: number;
  /** Insertion-ordered, so the oldest key is the first one `keys()` yields. */
  #cache = new Map<number, Shard>();
  #inFlight = new Map<number, Promise<Shard | null>>();
  #maxShards: number;
  #fetch: typeof fetch | null;

  constructor(baseUrl = '/defs', shardCount = 512, maxShards = 24, fetchImpl: typeof fetch | null = null) {
    this.#baseUrl = baseUrl;
    this.#shardCount = shardCount;
    this.#maxShards = maxShards;
    this.#fetch = fetchImpl;
  }

  async #shard(index: number): Promise<Shard | null> {
    const cached = this.#cache.get(index);
    if (cached) {
      // Refresh recency: delete and re-insert moves it to the end.
      this.#cache.delete(index);
      this.#cache.set(index, cached);
      return cached;
    }

    const pending = this.#inFlight.get(index);
    if (pending) return await pending;

    const request = (async (): Promise<Shard | null> => {
      try {
        // Resolved at call time so a test can stub the global after construction.
        const doFetch = this.#fetch ?? fetch;
        const response = await doFetch(`${this.#baseUrl}/${index}.json`);
        if (!response.ok) return null;
        const shard = parseShard((await response.json()) as RawShard);

        this.#cache.set(index, shard);
        while (this.#cache.size > this.#maxShards) {
          const oldest = this.#cache.keys().next().value;
          if (oldest === undefined) break;
          this.#cache.delete(oldest);
        }
        return shard;
      } catch {
        // Definitions are an enhancement; a failed fetch should leave the
        // result list working, not surface an error.
        return null;
      } finally {
        this.#inFlight.delete(index);
      }
    })();

    this.#inFlight.set(index, request);
    return await request;
  }

  async lookup(word: string): Promise<WordInfo> {
    const shard = await this.#shard(fnv1a(word) % this.#shardCount);
    return {
      word,
      senses: shard?.senses.get(word) ?? [],
      // Absence from the provenance map is what "attested" means; it is the
      // common case and is left out of the shards to save space.
      provenance: shard?.provenance.get(word) ?? 'attested',
    };
  }

  /** Look several words up at once, sharing shard fetches between them. */
  async lookupAll(words: readonly string[]): Promise<WordInfo[]> {
    return await Promise.all(words.map((word) => this.lookup(word)));
  }
}
