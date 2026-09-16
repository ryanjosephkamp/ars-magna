/**
 * The worker boundary.
 *
 * Imported by both sides, so the message shapes cannot drift apart. Every
 * message carries the `id` of the request that caused it: the search is fast
 * enough that a query usually completes before the next keystroke, but when it
 * does not, the client discards anything whose id is stale rather than trying
 * to interrupt work already in flight.
 */

export type Tier = 'common' | 'standard' | 'full' | 'extended';

/** Narrowest first, which is the order the picker shows them in. */
export const TIERS: readonly Tier[] = ['common', 'standard', 'full', 'extended'];

/** Treated by the engine as "no limit on how many words a result may use". */
export const UNLIMITED_WORDS = 64;

export type Query = {
  readonly input: string;
  readonly tier: Tier;
  /** Words shorter than this are removed from the vocabulary. */
  readonly minWordLen: number;
  readonly maxWords: number;
  readonly mustInclude: readonly string[];
};

export const DEFAULT_QUERY: Omit<Query, 'input'> = {
  tier: 'standard',
  // 2 keeps the good short words (`of`, `to`, `an`) while excluding lone
  // letters, which are the single largest source of noise in results.
  minWordLen: 2,
  maxWords: UNLIMITED_WORDS,
  mustInclude: [],
};

export type DictCounts = {
  readonly common: number;
  readonly standard: number;
  /** English OpenList at the pinned revision. */
  readonly full: number;
  /** The pinned list plus the site's own additions: every word that ships. */
  readonly extended: number;
  readonly signatures: number;
};

export type ManifestFile = {
  readonly name: string;
  /** Size decoded. The check that a compressed transfer arrived intact. */
  readonly bytes: number;
  /** Size of the sibling `.br`, when the build produced one. */
  readonly brotliBytes?: number;
  readonly sha256: string;
};

export type Manifest = {
  readonly schemaVersion: number;
  readonly builtAt: string;
  readonly source: { readonly repo: string; readonly rev: string };
  readonly counts: DictCounts;
  readonly files: Readonly<Record<string, ManifestFile>>;
};

export type SolveStats = {
  readonly candidates: number;
  readonly elapsedMs: number;
};

// ------------------------------------------------------------------ requests

export type Request =
  | { readonly k: 'init'; readonly id: number; readonly baseUrl: string }
  | {
      readonly k: 'solve';
      readonly id: number;
      readonly query: Query;
      readonly first: number;
      /**
       * Search-effort ceiling in DFS nodes. Exists so a pathological input
       * cannot hang the worker, and so the truncation path can be exercised
       * by a test rather than taken on faith.
       */
      readonly maxNodes?: number;
    }
  | { readonly k: 'page'; readonly id: number; readonly offset: number; readonly len: number }
  | {
      /**
       * Materialize up to `limit` results in one go, for export. Separate from
       * `page` because it is not part of the browsing session: it must not move
       * the paging cursor or be mistaken for the visible list.
       */
      readonly k: 'collect';
      readonly id: number;
      readonly limit: number;
    }
  | { readonly k: 'random'; readonly id: number; readonly index: string }
  | { readonly k: 'spellings'; readonly id: number; readonly word: string; readonly tier: Tier }
  | { readonly k: 'lookup'; readonly id: number; readonly word: string; readonly tier: Tier }
  | { readonly k: 'masks'; readonly id: number; readonly words: readonly string[] };

// ----------------------------------------------------------------- responses

/** Fatal codes render the unsupported-browser screen; the rest are recoverable. */
export type ErrorCode =
  | 'WASM_INIT'
  | 'FETCH_FAILED'
  | 'BAD_ARTIFACT'
  | 'UNKNOWN_WORD'
  | 'NOT_A_SUBSET'
  /** One letter occurs more than 127 times; the engine's counts are bytes. */
  | 'TOO_MANY_REPEATS'
  | 'INTERNAL';

export const FATAL_ERRORS: readonly ErrorCode[] = ['WASM_INIT', 'BAD_ARTIFACT'];

export type Response =
  | {
      readonly k: 'ready';
      readonly id: number;
      readonly counts: DictCounts;
      readonly builtAt: string;
      readonly loadMs: number;
    }
  | {
      readonly k: 'count';
      readonly id: number;
      /**
       * Decimal string, not a number: totals routinely exceed
       * `Number.MAX_SAFE_INTEGER`. A leading `>` marks a floor rather than an
       * exact figure (the true total overflowed 128 bits).
       */
      readonly total: string;
      readonly candidates: number;
    }
  | {
      readonly k: 'batch';
      readonly id: number;
      readonly offset: number;
      readonly rows: readonly (readonly string[])[];
      /** No further results exist after this batch. */
      readonly done: boolean;
      /**
       * The search stopped at its node budget rather than running out of
       * answers. A short batch means very different things in the two cases,
       * and the interface has to be able to tell them apart.
       */
      readonly truncated: boolean;
    }
  | { readonly k: 'solved'; readonly id: number; readonly stats: SolveStats }
  | { readonly k: 'spellings'; readonly id: number; readonly words: readonly string[] }
  | { readonly k: 'lookup'; readonly id: number; readonly found: boolean }
  | { readonly k: 'masks'; readonly id: number; readonly masks: readonly number[] }
  | {
      readonly k: 'collected';
      readonly id: number;
      readonly rows: readonly (readonly string[])[];
      /** Every result was written; nothing was cut off by the limit or a budget. */
      readonly complete: boolean;
    }
  | {
      readonly k: 'error';
      readonly id: number;
      readonly code: ErrorCode;
      readonly message: string;
    };

/** `1234567` -> `1,234,567`; passes through a `>` prefix. */
export function formatCount(total: string): string {
  const floor = total.startsWith('>');
  const digits = floor ? total.slice(1) : total;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return floor ? `more than ${grouped}` : grouped;
}
