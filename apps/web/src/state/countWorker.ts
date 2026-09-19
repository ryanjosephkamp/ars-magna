/**
 * A count in a worker of its own, so nothing else ever waits behind it.
 *
 * The engine counts in one uninterruptible call, so a long count holds its
 * worker until it ends. Build's count of the text and Search's count of a
 * filter both run here, away from the worker the page itself asks for words,
 * rows and positions. The worker is started for the first count, from the
 * dictionary the page's own worker cached, and kept for the next while each
 * finishes within the limit, so a string of quick counts pays for one start.
 * A count that runs out of time, or is abandoned because what it counts has
 * changed, cannot be stopped from inside: its worker is stopped instead, and
 * the next count starts a fresh one. A second engine holds its own copy of the
 * dictionary, about 70 MB on a phone, so the page closes this as soon as it
 * has nothing left to count.
 */
import { ArsMagnaClient, type Query } from '@ars-magna/engine';

import { BUILD_COUNT_LIMIT_MS, climb, type TextCount } from '../lib/textCount.ts';

/** What the worker needs of an engine client; the tests hand it a stand-in. */
export type Counter = Pick<ArsMagnaClient, 'count' | 'status' | 'terminate'>;

export type CountWorkerOptions = {
  /** How long one count may run, in milliseconds. */
  readonly limitMs?: number;
  /** Starts an engine in a worker of its own. */
  readonly create?: () => Promise<Counter>;
  /** Resolves after a number of milliseconds; the tests move a clock by hand. */
  readonly wait?: (ms: number) => Promise<void>;
};

export class CountWorker {
  readonly #limitMs: number;
  readonly #create: () => Promise<Counter>;
  readonly #wait: ((ms: number) => Promise<void>) | undefined;
  #client: Counter | null = null;
  #closed = false;
  #busy = false;

  constructor({ limitMs = BUILD_COUNT_LIMIT_MS, create = () => ArsMagnaClient.create('/dict'), wait }: CountWorkerOptions = {}) {
    this.#limitMs = limitMs;
    this.#create = create;
    this.#wait = wait;
  }

  /** Whether a count is running, so stopping now abandons it. */
  get busy(): boolean {
    return this.#busy;
  }

  /**
   * How many results `query` has, climbing the node budgets of `textCount.ts`
   * until the time limit. Null when the worker was closed first, since an
   * abandoned count has no answer to give. Counts run one at a time.
   * `textLeftOut` says the engine left the text's own row out of the count.
   */
  async count(query: Query): Promise<{ readonly count: TextCount; readonly timedOut: boolean; readonly textLeftOut: boolean } | null> {
    if (this.#closed) return null;
    this.#busy = true;
    try {
      const client = this.#client ?? (await this.#create());
      // Closed while the engine was starting: it is not wanted any more.
      if (this.#closed) {
        client.terminate();
        return null;
      }
      this.#client = client;
      if (client.status.state !== 'ready') {
        this.#drop(client);
        return { count: { kind: 'failed' }, timedOut: false, textLeftOut: false };
      }
      // Whether the text's own row was left out, as the last rung to answer said.
      let textLeftOut = false;
      const result = await climb(
        async (maxNodes) => {
          if (this.#closed) return null;
          try {
            const answer = await client.count(query, maxNodes);
            if (answer) textLeftOut = answer.textLeftOut;
            return answer?.total ?? null;
          } catch {
            return null;
          }
        },
        { limitMs: this.#limitMs, ...(this.#wait ? { wait: this.#wait } : {}) },
      );
      if (this.#closed) return null;
      // A rung still running would hold up the next count: its worker goes.
      if (result.timedOut) this.#drop(client);
      return { ...result, textLeftOut };
    } finally {
      this.#busy = false;
    }
  }

  /** Stop the worker for good: a count still running is abandoned and answers null. */
  close(): void {
    this.#closed = true;
    const client = this.#client;
    this.#client = null;
    client?.terminate();
  }

  #drop(client: Counter): void {
    client.terminate();
    if (this.#client === client) this.#client = null;
  }
}
