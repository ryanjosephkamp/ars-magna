import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArsMagnaClient,
  DEFAULT_QUERY,
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

    if (query.input.replace(/[^a-zA-Z]/g, '').length === 0) {
      results.reset();
      setState((s) => ({ ...s, searching: false, error: null, candidates: 0 }));
      return;
    }

    const timer = setTimeout(() => {
      results.reset();
      setState((s) => ({ ...s, searching: true, error: null }));

      client.solve(
        query,
        {
          onCount: (total, candidates) => {
            results.setTotal(total);
            setState((s) => ({ ...s, candidates }));
          },
          onBatch: (offset, rows, done, truncated) =>
            results.append(offset, rows, done, truncated),
          onDone: () => setState((s) => ({ ...s, searching: false })),
          onError: (code, message) => {
            results.reset();
            setState((s) => ({ ...s, searching: false, error: { code, message } }));
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

  return { ...state, loadMore, at, surpriseMe, spellings };
}

export { DEFAULT_QUERY };
