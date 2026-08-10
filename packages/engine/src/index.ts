/**
 * Main-thread client for the worker.
 *
 * Requests are correlated by a monotonic id. The search is fast enough that a
 * query normally finishes between keystrokes, so rather than trying to
 * interrupt work mid-flight, responses from superseded queries are simply
 * dropped — cheaper, and it removes a whole class of race.
 */
import type {
  DictCounts,
  ErrorCode,
  Query,
  Request,
  Response,
  SolveStats,
  Tier,
} from './protocol.ts';

export * from './protocol.ts';

export type SolveHandlers = {
  /** Exact total, ahead of any results. A `>` prefix means it is a floor. */
  onCount?(total: string, candidates: number): void;
  onBatch?(
    offset: number,
    rows: readonly (readonly string[])[],
    done: boolean,
    truncated: boolean,
  ): void;
  onDone?(stats: SolveStats): void;
  onError?(code: ErrorCode, message: string): void;
};

export type EngineStatus =
  | { readonly state: 'loading' }
  | { readonly state: 'ready'; readonly counts: DictCounts; readonly builtAt: string }
  | { readonly state: 'failed'; readonly code: ErrorCode; readonly message: string };

export class ArsMagnaClient {
  #worker: Worker;
  #nextId = 1;
  #activeQuery = 0;
  #handlers = new Map<number, SolveHandlers>();
  #pending = new Map<number, { resolve(value: never): void; reject(error: Error): void }>();
  #status: EngineStatus = { state: 'loading' };
  #statusListeners = new Set<(status: EngineStatus) => void>();

  constructor(worker: Worker) {
    this.#worker = worker;
    this.#worker.onmessage = (event: MessageEvent<Response>) => this.#receive(event.data);
  }

  /** Spawn the worker and load the dictionary. */
  static async create(baseUrl = '/dict'): Promise<ArsMagnaClient> {
    const worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
    const client = new ArsMagnaClient(worker);
    await client.#init(baseUrl);
    return client;
  }

  get status(): EngineStatus {
    return this.#status;
  }

  onStatus(listener: (status: EngineStatus) => void): () => void {
    this.#statusListeners.add(listener);
    listener(this.#status);
    return () => this.#statusListeners.delete(listener);
  }

  #setStatus(status: EngineStatus): void {
    this.#status = status;
    for (const listener of this.#statusListeners) listener(status);
  }

  #send(request: Request): void {
    this.#worker.postMessage(request);
  }

  #init(baseUrl: string): Promise<void> {
    return new Promise((resolve) => {
      const id = this.#nextId++;
      this.#handlers.set(id, {
        onError: (code, message) => {
          this.#setStatus({ state: 'failed', code, message });
          // Resolve rather than reject: a failed dictionary load is a state the
          // UI renders, not an exception callers should have to catch.
          resolve();
        },
      });
      this.#readyResolve = resolve;
      this.#send({ k: 'init', id, baseUrl });
    });
  }

  #readyResolve: (() => void) | null = null;

  /**
   * Start a query. Returns the request id; results arrive through `handlers`.
   * Any earlier query's responses are discarded from this point on.
   */
  solve(query: Query, handlers: SolveHandlers, first = 200, maxNodes?: number): number {
    const id = this.#nextId++;
    this.#activeQuery = id;
    this.#handlers.set(id, handlers);
    this.#send(maxNodes === undefined ? { k: 'solve', id, query, first } : { k: 'solve', id, query, first, maxNodes });
    return id;
  }

  /** Request more results for the active query. */
  page(offset: number, len: number): void {
    if (this.#activeQuery === 0) return;
    this.#send({ k: 'page', id: this.#nextId++, offset, len });
  }

  /** The solution at `index`, fetched by unranking rather than enumeration. */
  nth(index: bigint): Promise<string[] | null> {
    return this.#ask<string[] | null>((id) => ({ k: 'random', id, index: index.toString() }));
  }

  /** Every spelling of the anagram class `word` belongs to. */
  spellings(word: string, tier: Tier): Promise<string[]> {
    return this.#ask<string[]>((id) => ({ k: 'spellings', id, word, tier }));
  }

  /** Whether `word` exists at `tier`. Used to validate "must include" chips. */
  has(word: string, tier: Tier): Promise<boolean> {
    return this.#ask<boolean>((id) => ({ k: 'lookup', id, word, tier }));
  }

  #ask<T>(build: (id: number) => Request): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = this.#nextId++;
      this.#pending.set(id, {
        resolve: resolve as (value: never) => void,
        reject,
      });
      this.#send(build(id));
    });
  }

  terminate(): void {
    this.#worker.terminate();
  }

  #receive(message: Response): void {
    const oneShot = this.#pending.get(message.id);
    if (oneShot) {
      this.#pending.delete(message.id);
      if (message.k === 'error') oneShot.reject(new Error(message.message));
      else if (message.k === 'spellings') oneShot.resolve(message.words as never);
      else if (message.k === 'lookup') oneShot.resolve(message.found as never);
      else if (message.k === 'batch') oneShot.resolve((message.rows[0] ?? null) as never);
      return;
    }

    if (message.k === 'ready') {
      this.#setStatus({ state: 'ready', counts: message.counts, builtAt: message.builtAt });
      this.#readyResolve?.();
      this.#readyResolve = null;
      return;
    }

    const handlers = this.#handlers.get(message.id);
    if (!handlers) return;

    // Drop anything from a superseded query.
    if (message.id !== this.#activeQuery && this.#activeQuery !== 0 && message.k !== 'error') {
      return;
    }

    switch (message.k) {
      case 'count':
        handlers.onCount?.(message.total, message.candidates);
        break;
      case 'batch':
        handlers.onBatch?.(message.offset, message.rows, message.done, message.truncated);
        break;
      case 'solved':
        handlers.onDone?.(message.stats);
        break;
      case 'error':
        handlers.onError?.(message.code, message.message);
        this.#handlers.delete(message.id);
        break;
    }
  }
}
