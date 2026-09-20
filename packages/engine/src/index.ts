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
  DictForm,
  ErrorCode,
  Query,
  Request,
  Response,
  SolveStats,
  Tier,
} from './protocol.ts';

export * from './protocol.ts';
export { readForms } from './dictForms.ts';
export { bestOrder, scoreOrder, TAG_BIT, TAGS, MIN_GAIN, type Tag } from './wordOrder.ts';
export { foldChar, foldLetters, foldWords, isSkipped, normalizeLetters, type Folded } from './fold.ts';
export { isRespacing, isTextItself, sameWords } from './identity.ts';

export type SolveHandlers = {
  /**
   * Exact total, ahead of any results. A `>` prefix means it is a floor.
   * `textLeftOut` says the text's own row is not among them: see `count` in
   * the protocol.
   */
  onCount?(total: string, candidates: number, textLeftOut: boolean): void;
  onBatch?(
    offset: number,
    rows: readonly (readonly string[])[],
    done: boolean,
    truncated: boolean,
  ): void;
  onDone?(stats: SolveStats): void;
  onError?(code: ErrorCode, message: string): void;
};

/** A count on its own: the total (`>` in front for a floor), and whether the text's own row was left out of it. */
export type CountAnswer = { readonly total: string; readonly textLeftOut: boolean };

export type EngineStatus =
  | { readonly state: 'loading' }
  | { readonly state: 'ready'; readonly counts: DictCounts; readonly builtAt: string; readonly forms: readonly DictForm[] }
  | { readonly state: 'failed'; readonly code: ErrorCode; readonly message: string };

export class ArsMagnaClient {
  #worker: Worker;
  /** Makes a fresh worker, so a runaway search can be killed and replaced. */
  #respawn: (() => Worker) | null;
  #baseUrl = '/dict';
  #nextId = 1;
  #activeQuery = 0;
  /** The latest `count` asked for; an answer to any earlier one is dropped. */
  #activeCount = 0;
  /** Counts asked for and not yet answered, superseded ones included: the worker runs each in turn. */
  #counting = new Set<number>();
  /** The query the worker is busy with, or 0 once it has answered. */
  #inFlight = 0;
  /**
   * The offset of the page asked for and not yet answered, or -1. The list
   * asks for the next page on every frame it draws near its end, and a page
   * takes longer than a frame, so without this one scroll to the end sent the
   * same request a dozen times: one request per offset per query.
   */
  #pagePending = -1;
  #handlers = new Map<number, SolveHandlers>();
  #pending = new Map<number, { resolve(value: never): void; reject(error: Error): void }>();
  #status: EngineStatus = { state: 'loading' };
  #statusListeners = new Set<(status: EngineStatus) => void>();

  constructor(worker: Worker, respawn: (() => Worker) | null = null) {
    this.#worker = worker;
    this.#respawn = respawn;
    this.#worker.onmessage = (event: MessageEvent<Response>) => this.#receive(event.data);
  }

  /** Spawn the worker and load the dictionary. */
  static async create(baseUrl = '/dict'): Promise<ArsMagnaClient> {
    const spawn = () =>
      new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
    const client = new ArsMagnaClient(spawn(), spawn);
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
    this.#baseUrl = baseUrl;
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
    // The search cannot be interrupted from inside: a query that is still
    // running when the next one arrives would make the new one wait behind
    // it, for minutes on a pasted sentence. So a busy worker is killed and
    // replaced. The dictionary reloads from Cache Storage, which costs a few
    // hundred milliseconds — only ever paid when the previous search had not
    // finished within the typing debounce, which is exactly when it matters.
    // A count still running (a filter's, which cannot be stopped either) makes
    // the worker just as busy: the new search must not wait behind it.
    if ((this.#inFlight !== 0 || this.#counting.size > 0) && this.#respawn) this.#restart();

    const id = this.#nextId++;
    this.#activeQuery = id;
    this.#inFlight = id;
    this.#pagePending = -1;
    this.#handlers.set(id, handlers);
    this.#send(maxNodes === undefined ? { k: 'solve', id, query, first } : { k: 'solve', id, query, first, maxNodes });
    return id;
  }

  /**
   * Request more results for the active query. A page already asked for and
   * not yet answered is not asked for again; it is asked again only after its
   * batch arrives, or once a new query replaces the one it belonged to.
   */
  page(offset: number, len: number): void {
    if (this.#activeQuery === 0 || offset === this.#pagePending) return;
    this.#pagePending = offset;
    this.#send({ k: 'page', id: this.#nextId++, offset, len });
  }

  /**
   * The total for `query`, without results and without touching the list the
   * active search is paging through, and whether the text's own row was left
   * out of it (see `count` in the protocol). Resolves with null when a later
   * `count` replaced this one before it was answered, the way a superseded
   * query's results are dropped.
   */
  async count(query: Query, maxNodes?: number): Promise<CountAnswer | null> {
    let asked = 0;
    try {
      const total = await this.#ask<CountAnswer>((id) => {
        asked = id;
        this.#activeCount = id;
        this.#counting.add(id);
        return maxNodes === undefined ? { k: 'count', id, query } : { k: 'count', id, query, maxNodes };
      });
      return asked === this.#activeCount ? total : null;
    } finally {
      this.#counting.delete(asked);
    }
  }

  /** The solution at `index`, fetched by unranking rather than enumeration. */
  nth(index: bigint): Promise<string[] | null> {
    return this.#ask<string[] | null>((id) => ({ k: 'random', id, index: index.toString() }));
  }

  /**
   * Materialize up to `limit` results for export. Does not affect the
   * browsing session or its paging position.
   */
  collect(limit: number): Promise<{ rows: string[][]; complete: boolean }> {
    return this.#ask((id) => ({ k: 'collect', id, limit }));
  }

  /** Every spelling of the anagram class `word` belongs to. */
  spellings(word: string, tier: Tier): Promise<string[]> {
    return this.#ask<string[]>((id) => ({ k: 'spellings', id, word, tier }));
  }

  /** Whether `word` exists at `tier`. Used to validate "must include" chips. */
  has(word: string, tier: Tier): Promise<boolean> {
    return this.#ask<boolean>((id) => ({ k: 'lookup', id, word, tier }));
  }

  /** Part-of-speech masks for `words`, in order. */
  masks(words: readonly string[]): Promise<number[]> {
    return this.#ask<number[]>((id) => ({ k: 'masks', id, words }));
  }

  /** Each word's frequency byte, in order: `(zipf + 1) * 24`, or 0 where the dictionary has none. */
  zipf(words: readonly string[]): Promise<number[]> {
    return this.#ask<number[]>((id) => ({ k: 'zipf', id, words }));
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

  /** Whether the worker is still busy with a query. */
  get busy(): boolean {
    return this.#inFlight !== 0;
  }

  /** Kill the worker mid-search and start a fresh one on the same dictionary. */
  #restart(): void {
    this.#worker.terminate();
    const reason = new Error('search cancelled: a newer query replaced it');
    for (const [id, waiter] of this.#pending) {
      this.#pending.delete(id);
      waiter.reject(reason);
    }
    // Nothing the old worker was doing can complete now; its callers must
    // not be left waiting for an onDone that will never come.
    this.#handlers.clear();
    this.#inFlight = 0;
    this.#pagePending = -1;
    this.#counting.clear();

    this.#worker = this.#respawn!();
    this.#worker.onmessage = (event: MessageEvent<Response>) => this.#receive(event.data);
    const id = this.#nextId++;
    this.#handlers.set(id, {
      onError: (code, message) => this.#setStatus({ state: 'failed', code, message }),
    });
    this.#send({ k: 'init', id, baseUrl: this.#baseUrl });
  }

  /** Fail everything in flight; the worker is gone. */
  #crash(code: ErrorCode, message: string): void {
    for (const [id, waiter] of this.#pending) {
      this.#pending.delete(id);
      waiter.reject(new Error(message));
    }
    const active = this.#handlers.get(this.#activeQuery);
    if (active) {
      active.onError?.(code, message);
      this.#handlers.delete(this.#activeQuery);
    } else if (this.#status.state === 'loading') {
      // Crashed while the dictionary was still loading: that is a failed
      // load, and the init promise is waiting on it.
      this.#setStatus({ state: 'failed', code, message });
      this.#readyResolve?.();
      this.#readyResolve = null;
    }
  }

  #receive(message: Response): void {
    // The worker itself crashed (a WebAssembly panic, an out-of-memory abort)
    // rather than any one request failing. Its `onerror` posts id -1, which
    // belongs to nothing; before this, nothing received it and the page sat
    // on "searching…" for good. Every waiting caller is told, and the active
    // query fails with the message so the interface can show it.
    if (message.k === 'error' && message.id === -1) {
      this.#crash(message.code, message.message);
      return;
    }

    const oneShot = this.#pending.get(message.id);
    if (oneShot) {
      this.#pending.delete(message.id);
      if (message.k === 'error') oneShot.reject(new Error(message.message));
      else if (message.k === 'spellings') oneShot.resolve(message.words as never);
      else if (message.k === 'lookup') oneShot.resolve(message.found as never);
      else if (message.k === 'masks') oneShot.resolve(message.masks as never);
      else if (message.k === 'count') oneShot.resolve({ total: message.total, textLeftOut: message.textLeftOut } as never);
      else if (message.k === 'zipf') oneShot.resolve(message.zipf as never);
      else if (message.k === 'batch') oneShot.resolve((message.rows[0] ?? null) as never);
      else if (message.k === 'collected')
        oneShot.resolve({ rows: message.rows, complete: message.complete } as never);
      return;
    }

    if (message.k === 'ready') {
      this.#setStatus({ state: 'ready', counts: message.counts, builtAt: message.builtAt, forms: message.forms });
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
        handlers.onCount?.(message.total, message.candidates, message.textLeftOut);
        break;
      case 'batch':
        // Paging replies carry the query's id, so the page is told from its
        // offset: the one waited for has arrived, and may be asked for again.
        if (message.offset === this.#pagePending) this.#pagePending = -1;
        handlers.onBatch?.(message.offset, message.rows, message.done, message.truncated);
        break;
      case 'solved':
        if (message.id === this.#inFlight) this.#inFlight = 0;
        handlers.onDone?.(message.stats);
        break;
      case 'error':
        if (message.id === this.#inFlight) this.#inFlight = 0;
        this.#pagePending = -1;
        handlers.onError?.(message.code, message.message);
        this.#handlers.delete(message.id);
        break;
    }
  }
}
