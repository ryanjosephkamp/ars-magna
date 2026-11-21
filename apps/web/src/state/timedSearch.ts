/**
 * A search that stops when it runs too long.
 *
 * The engine searches in one uninterruptible call, and its count comes before
 * any row. A long text with many different letters can keep it busy for
 * minutes before that count arrives: *The quick brown fox jumps over the lazy
 * dog* ran for over 100 seconds with only "searching…" on the page, and the
 * worker went on running after the reader gave up. So a search gets
 * `SEARCH_LIMIT_MS`. When the limit passes first, the same query runs again
 * under a small node budget (`solve` replaces the busy worker itself), which
 * answers in about a second with a floor, `more than 237`, and the rows found
 * on the way; the page says the count is a minimum. When that one runs out of
 * time as well, or stops before a single whole anagram, its worker is stopped
 * and the page says the search stopped.
 *
 * Search waits longer than Build's four seconds because its answer is the
 * page itself: *The United States of America* takes about two seconds on a
 * laptop and so several on a phone, and it should still get its exact count.
 *
 * Pure apart from the timer, so the tests drive it with a stand-in for the
 * engine and a clock moved by hand.
 */
import type { ArsMagnaClient, Query, SolveHandlers } from '@ars-magna/engine';

/** How long a search may run before the page stops it, in milliseconds; the short search after it gets as long again. */
export const SEARCH_LIMIT_MS = 10_000;

/**
 * The node budget of the short search that follows one stopped at the limit:
 * about 0.7 seconds and 31 rows for the pangram on a laptop, so a phone still
 * answers in a few seconds.
 */
export const FALLBACK_NODES = 20_000;

/** What the search needs of an engine client; the tests hand it a stand-in. */
export type Searcher = Pick<ArsMagnaClient, 'solve' | 'cancel'>;

export type TimedHandlers = SolveHandlers & {
  /** The full search ran out of time; the short one is starting, so the list should be cleared for it. */
  onLimit?(): void;
  /** The short search ran out of time too, or found no whole anagram: nothing more will arrive. */
  onStopped?(): void;
};

export type TimedOptions = {
  readonly limitMs?: number;
  readonly fallbackNodes?: number;
  /** Resolves after a number of milliseconds; the tests move a clock by hand. */
  readonly wait?: (ms: number) => Promise<void>;
};

/** A floor of 0: the budget ran out before the engine had a whole anagram to count. */
const NOTHING_FOUND = /^>0*$/;

/**
 * Start `query` on `client` under the time limit. Returns a function that
 * abandons it: a worker still busy with it is stopped, nothing more reaches
 * `handlers`, and its timer no longer acts, so a newer search is never
 * stopped by an older one's limit.
 */
export function timedSearch(client: Searcher, query: Query, handlers: TimedHandlers, first: number, options: TimedOptions = {}): () => void {
  const { limitMs = SEARCH_LIMIT_MS, fallbackNodes = FALLBACK_NODES, wait = (ms) => new Promise((r) => setTimeout(r, ms)) } = options;
  let live = true;

  const stop = () => {
    if (!live) return;
    live = false;
    client.cancel();
    handlers.onStopped?.();
  };

  /**
   * Run the query once, under `maxNodes` or the engine's own budget. Returns
   * whether it has answered: its count arrived, or it failed. The limit is on
   * the count, which comes before any row; once it is in, the rows follow it.
   */
  const run = (maxNodes?: number): (() => boolean) => {
    let answered = false;
    const short = maxNodes !== undefined;
    client.solve(
      query,
      {
        onCount: (total, ...rest) => {
          answered = true;
          if (!live) return;
          // The short search stopped before a whole anagram: there is nothing to show but the reason.
          if (short && NOTHING_FOUND.test(total)) {
            stop();
            return;
          }
          handlers.onCount?.(total, ...rest);
        },
        onBatch: (...args) => {
          if (live) handlers.onBatch?.(...args);
        },
        onDone: (stats) => {
          if (live) handlers.onDone?.(stats);
        },
        onError: (code, message) => {
          answered = true;
          if (live) handlers.onError?.(code, message);
        },
      },
      first,
      maxNodes,
    );
    return () => answered;
  };

  const full = run();
  void wait(limitMs).then(() => {
    if (!live || full()) return;
    handlers.onLimit?.();
    const fallback = run(fallbackNodes);
    void wait(limitMs).then(() => {
      if (live && !fallback()) stop();
    });
  });

  return () => {
    if (!live) return;
    live = false;
    client.cancel();
  };
}
