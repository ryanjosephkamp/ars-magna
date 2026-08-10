/**
 * Results live here, not in React state.
 *
 * A single query can deliver tens of thousands of rows in a few milliseconds.
 * Routing that through `useState` would queue one render per batch and stall the
 * main thread. Instead rows land in a plain mutable array and subscribers are
 * notified at most once per animation frame, so React re-renders at a steady 60
 * fps whether 200 rows arrived or 200,000.
 *
 * The store exposes a monotonic version number as its snapshot — arrays are
 * mutated in place, so identity can't be the change signal.
 */

export type Row = readonly string[];

class ResultBuffer {
  #rows: Row[] = [];
  #version = 0;
  #listeners = new Set<() => void>();
  #scheduled = false;

  /** Total the engine reported, as a decimal string. `>` prefix means a floor. */
  total = '0';
  /** True when more results exist than have been fetched. */
  hasMore = false;
  /**
   * The search stopped at its node budget rather than running out of answers,
   * so the count is a floor and the list is incomplete. Said out loud in the
   * interface rather than left to look like the full set.
   */
  truncated = false;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  getSnapshot = (): number => this.#version;

  get rows(): readonly Row[] {
    return this.#rows;
  }

  get length(): number {
    return this.#rows.length;
  }

  reset(): void {
    this.#rows = [];
    this.total = '0';
    this.hasMore = false;
    this.truncated = false;
    this.#notify();
  }

  setTotal(total: string): void {
    this.total = total;
    this.#notify();
  }

  /**
   * Place a batch at `offset`. Batches can in principle arrive out of order, so
   * rows are written by index rather than pushed.
   */
  append(offset: number, rows: readonly Row[], done: boolean, truncated = false): void {
    for (let i = 0; i < rows.length; i++) {
      this.#rows[offset + i] = rows[i]!;
    }
    this.hasMore = !done;
    this.truncated ||= truncated;
    this.#notify();
  }

  #notify(): void {
    if (this.#scheduled) return;
    this.#scheduled = true;

    const flush = () => {
      this.#scheduled = false;
      this.#version++;
      for (const listener of this.#listeners) listener();
    };

    // rAF is unavailable in tests and in a background tab; fall back so
    // notifications are never simply dropped.
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(flush);
    else queueMicrotask(flush);
  }
}

export const results = new ResultBuffer();
