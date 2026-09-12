/**
 * The order a reader chose for a result.
 *
 * The engine returns each answer as a multiset and the list shows it in the
 * order that reads best by the part-of-speech table. A reader may prefer
 * another, and once they have chosen one, everything that names the result —
 * Copy, Pin, the share texts — should use it. The choice lives here, beside
 * the results, keyed by the words as a multiset; the rows themselves and the
 * buffer they live in are never touched, which is what keeps the virtualized
 * list cheap and the engine's order recoverable.
 */
import type { Row } from '../state/resultBuffer.ts';

export type Chosen = ReadonlyMap<string, readonly string[]>;

/** The identity of a result: its words sorted, whatever order they are shown in. */
export function rowKey(row: readonly string[]): string {
  return [...row].sort().join(' ');
}

/** The order a row is shown in: the reader's choice if they made one, else the engine's. */
export function displayOrder(chosen: Chosen, row: Row): readonly string[] {
  return chosen.get(rowKey(row)) ?? row;
}

/** A new map with `order` chosen for its words. */
export function choose(chosen: Chosen, order: readonly string[]): Map<string, readonly string[]> {
  const next = new Map(chosen);
  next.set(rowKey(order), [...order]);
  return next;
}
