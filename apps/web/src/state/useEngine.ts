import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArsMagnaClient,
  DEFAULT_QUERY,
  normalizeLetters,
  type DictForm,
  type EngineStatus,
  type ErrorCode,
  type Query,
} from '@ars-magna/engine';
import { results } from './resultBuffer.ts';

/** How many results to materialize up front, and per "show more". */
const PAGE = 250;

/** Long enough that a burst of typing is one query, short enough to feel live. */
const DEBOUNCE_MS = 180;

export type SearchState = {
  /** Engine/dictionary lifecycle, independent of any query. */
  engine: EngineStatus;
  /** A query is in flight. */
  searching: boolean;
  /** Set when the current query itself failed. */
  error: { code: ErrorCode; message: string } | null;
  /** Candidate word classes for the current input — the real difficulty signal. */
  candidates: number;
  /**
   * The letters the latest count was for. The result total cannot say this: it
   * still holds the previous search's count until the next one resets it.
   */
  countedLetters: string | null;
  /**
   * The text's own row was left out of the results, so the total is one fewer
   * than the letters alone would give. The page says so beside the count.
   */
  textLeftOut: boolean;
  /**
   * The query has its answer: its count, or an error. Until then the total in
   * the buffer is nobody's: 0 from the reset, or the previous query's while
   * the typing debounce runs. A query not yet answered is not a zero, so the
   * page shows the searching state in the count's place rather than
   * `0 anagrams` and `Nothing spells`, which on a page load stood for the 180
   * milliseconds between the dictionary arriving and the first search.
   */
  answered: boolean;
};

export function useResults() {
  useSyncExternalStore(results.subscribe, results.getSnapshot, results.getSnapshot);
  return results;
}

export function useEngine(query: Query) {
  const clientRef = useRef<ArsMagnaClient | null>(null);
  const [state, setState] = useState<SearchState>({
    engine: { state: 'loading' },
    searching: false,
    error: null,
    candidates: 0,
    countedLetters: null,
    textLeftOut: false,
    answered: false,
  });

  // Boot the worker once.
  useEffect(() => {
    let disposed = false;
    void ArsMagnaClient.create('/dict').then((client) => {
      if (disposed) {
        client.terminate();
        return;
      }
      clientRef.current = client;
      client.onStatus((engine) => setState((s) => ({ ...s, engine })));
    });
    return () => {
      disposed = true;
      clientRef.current?.terminate();
      clientRef.current = null;
    };
  }, []);

  // Run the query whenever it or the engine's readiness changes.
  useEffect(() => {
    const client = clientRef.current;
    if (!client || state.engine.state !== 'ready') return;

    if (normalizeLetters(query.input, query.reading).length === 0) {
      results.reset();
      setState((s) => ({ ...s, searching: false, error: null, candidates: 0, countedLetters: null, textLeftOut: false, answered: false }));
      return;
    }

    const timer = setTimeout(() => {
      results.reset();
      setState((s) => ({ ...s, searching: true, error: null, textLeftOut: false, answered: false }));

      client.solve(
        query,
        {
          onCount: (total, candidates, textLeftOut) => {
            results.setTotal(total);
            setState((s) => ({ ...s, candidates, countedLetters: normalizeLetters(query.input, query.reading), textLeftOut, answered: true }));
          },
          onBatch: (offset, rows, done, truncated) =>
            results.append(offset, rows, done, truncated),
          onDone: () => setState((s) => ({ ...s, searching: false })),
          onError: (code, message) => {
            results.reset();
            // An error is an answer: a word that is not in the tier, or does
            // not fit the letters, leaves the query with no results.
            setState((s) => ({ ...s, searching: false, error: { code, message }, answered: true }));
          },
        },
        PAGE,
      );
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // `state.engine.state` is the only part of state this depends on; including
    // the whole object would re-run the query on every unrelated state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, state.engine.state]);

  const loadMore = useCallback(() => {
    clientRef.current?.page(results.length, PAGE);
  }, []);

  /**
   * Materialize up to `limit` results in one call, for export or for filtering
   * across the whole set. Returns them rather than writing to the shared buffer,
   * so an export cannot disturb what the reader is looking at.
   */
  const collect = useCallback(
    async (limit: number): Promise<{ rows: string[][]; complete: boolean }> => {
      const client = clientRef.current;
      if (!client) return { rows: [], complete: false };
      try {
        return await client.collect(limit);
      } catch {
        return { rows: [], complete: false };
      }
    },
    [],
  );

  /**
   * The result at a given position, fetched by unranking rather than by
   * counting forward. Result 8,000,000 costs the same as result 8.
   */
  const at = useCallback(async (index: bigint): Promise<string[] | null> => {
    const client = clientRef.current;
    if (!client || index < 0n) return null;
    try {
      return await client.nth(index);
    } catch {
      return null;
    }
  }, []);

  /**
   * Part-of-speech masks, so the interface can rank a row's alternate orderings
   * by the same measure the worker used to choose the one it displayed.
   */
  const masks = useCallback(async (words: readonly string[]): Promise<number[]> => {
    const client = clientRef.current;
    if (!client || words.length === 0) return [];
    try {
      return await client.masks(words);
    } catch {
      return [];
    }
  }, []);

  /** Pick a uniformly random result by unranking, so it works at any total. */
  const surpriseMe = useCallback(async (): Promise<string[] | null> => {
    const total = results.total.replace('>', '');
    if (total === '0') return null;

    const max = BigInt(total);
    // Draw 64 random bits and reduce. The modulo bias is far below anything
    // that matters for picking something fun to look at.
    const bits = new BigUint64Array(1);
    crypto.getRandomValues(bits);
    return await at(bits[0]! % max);
  }, [at]);

  const spellings = useCallback(async (word: string): Promise<string[]> => {
    const client = clientRef.current;
    if (!client) return [];
    try {
      return await client.spellings(word, query.tier);
    } catch {
      return [];
    }
  }, [query.tier]);

  /** Whether a dictionary tier carries a word. False when the engine cannot say. */
  const has = useCallback(async (word: string, tier: Query['tier']): Promise<boolean> => {
    const client = clientRef.current;
    if (!client) return false;
    try {
      return await client.has(word, tier);
    } catch {
      return false;
    }
  }, []);

  return { ...state, forms: state.engine.state === 'ready' ? state.engine.forms : NO_DICT_FORMS, loadMore, collect, at, surpriseMe, spellings, masks, has };
}

/** One empty list for every render before the dictionary is ready, so it is stable. */
const NO_DICT_FORMS: readonly DictForm[] = [];

export { DEFAULT_QUERY };
