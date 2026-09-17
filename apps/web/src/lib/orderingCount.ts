/**
 * How many distinct orders a set of words reads in, apart from the orders
 * themselves, which `orderings.ts` ranks with the engine's scoring. Kept on
 * its own so a page that has no engine, such as Discover, can count.
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
