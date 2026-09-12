import { scoreOrder } from '@ars-magna/engine';

/**
 * Word orderings for a single result.
 *
 * The engine returns each answer as a *multiset* of words, because
 * `dirty room` and `room dirty` use identical letters and enumerating both
 * would multiply every result by k!. That is the right call for search — but a
 * person hunting for a phrase wants to see the orders. So they are generated
 * here, per result, only when a row is opened.
 *
 * Repeated words are the trap: `papa` solves to `pa pa`, and the two slots are
 * interchangeable. A naive permutation walk emits that twice. Skipping repeated
 * values at each level of the recursion emits each distinct *phrase* once.
 */

/** Above this the count is reported as "more than", not as a figure. */
const COUNT_CEILING = 1e15;

/**
 * How many distinct orderings exist: k! divided by the factorial of each
 * repeat group. Returns `Infinity` when the answer exceeds what a JS number can
 * represent exactly, so callers can say "more than" instead of lying.
 */
export function countOrderings(words: readonly string[]): number {
  const repeats = new Map<string, number>();
  for (const word of words) repeats.set(word, (repeats.get(word) ?? 0) + 1);

  let total = 1;
  for (let i = 2; i <= words.length; i++) {
    total *= i;
    if (total > COUNT_CEILING) return Infinity;
  }
  for (const count of repeats.values()) {
    for (let i = 2; i <= count; i++) total /= i;
  }
  return Math.round(total);
}

/**
 * Distinct orderings, capped at `limit`.
 *
 * The result's own order is emitted first — it is the one the user is already
 * looking at, and leading with a reshuffle of it would be disorienting.
 *
 * When `masks` is supplied the rest are ranked by how well they read, using the
 * same scoring the worker used to choose the order on display. Without it they
 * fall back to a stable alphabetical walk, so the list never changes between
 * openings either way.
 */
export function orderings(
  words: readonly string[],
  limit: number,
  masks?: readonly number[],
): string[][] {
  if (words.length === 0 || limit <= 0) return [];
  if (words.length === 1) return [[...words]];

  const original = words.join(' ');
  const sorted = [...words].sort();
  const used = new Array<boolean>(sorted.length).fill(false);
  const current: string[] = [];
  const out: string[][] = [];
  let seenOriginal = false;

  const walk = (): void => {
    if (out.length >= limit) return;

    if (current.length === sorted.length) {
      const phrase = current.join(' ');
      if (phrase === original) seenOriginal = true;
      out.push([...current]);
      return;
    }

    let previous: string | null = null;
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue;
      // Two slots holding the same word are interchangeable; taking the value
      // only once per level is what keeps `pa pa` from appearing twice.
      if (sorted[i] === previous) continue;

      previous = sorted[i]!;
      used[i] = true;
      current.push(sorted[i]!);
      walk();
      current.pop();
      used[i] = false;

      if (out.length >= limit) return;
    }
  };

  walk();

  // Rank by readability before the original is floated up, so the alternatives
  // below it are in a useful order rather than an alphabetical one. Sorting by
  // the same score the worker used means the list agrees with the choice it
  // already made.
  if (masks !== undefined && masks.length === words.length) {
    const maskOf = new Map(words.map((word, i) => [word, masks[i]!]));
    const cache = new Map<string, number>();
    const rank = (row: string[]): number => {
      const key = row.join(' ');
      let value = cache.get(key);
      if (value === undefined) {
        value = scoreOrder(row, row.map((word) => maskOf.get(word) ?? 0));
        cache.set(key, value);
      }
      return value;
    };
    // Stable: equal scores keep the alphabetical walk's order.
    out.sort((a, b) => rank(b) - rank(a));
  }

  // Float the row's own order to the front. If the cap cut it off, put it there
  // anyway and drop the last entry — the user's current view must be in the list.
  const index = out.findIndex((row) => row.join(' ') === original);
  if (index > 0) {
    const [row] = out.splice(index, 1);
    out.unshift(row!);
  } else if (index === -1 && seenOriginal === false) {
    out.unshift([...words]);
    if (out.length > limit) out.pop();
  }

  return out;
}

/**
 * The ordering after `current` in the ranked list, wrapping at the end, so one
 * control can walk every arrangement the panel would show. When `current` is
 * not in the list (a link carried an order the cap cut off) the walk starts
 * from the front.
 */
export function nextOrdering(
  words: readonly string[],
  current: readonly string[],
  limit: number,
  masks?: readonly number[],
): string[] {
  const list = orderings(words, limit, masks);
  if (list.length === 0) return [...current];
  const phrase = current.join(' ');
  const index = list.findIndex((row) => row.join(' ') === phrase);
  return [...list[(index + 1) % list.length]!];
}
