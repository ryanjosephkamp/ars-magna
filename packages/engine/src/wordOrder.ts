/**
 * Putting the words of a result into an order that reads like English.
 *
 * The engine returns each answer as a multiset, and the order it happens to emit
 * is whatever the rarest-letter search produced — so `luna terra sol` led with
 * `loser natural` where `natural loser` reads properly. This picks a better one.
 *
 * ## No model, no service, no key
 *
 * Two pieces. Every word carries a bitmask of the parts of speech it can be, and
 * `TRANSITION` below scores how well one part of speech follows another. That
 * table is written by hand — about a hundred numbers you can read and change.
 * An adjective before a noun scores well; a noun before an adjective does not;
 * a determiner before a verb is close to forbidden. That is the whole model.
 *
 * ## Why the search is exact rather than greedy
 *
 * Words are ambiguous. `natural` is both an adjective and a noun, so the score
 * of an ordering depends on which reading you assign each word, and the two
 * choices cannot be made independently. Picking tags first and then ordering
 * gets `natural loser` wrong about as often as it gets it right.
 *
 * So the tag assignment is *inside* the search: the state is (which words are
 * placed, which was placed last, what tag it took), and the best score over all
 * of that is found by dynamic programming over subsets. For the four or five
 * words a result usually has this is microseconds, and it is the true optimum
 * rather than a plausible guess.
 *
 * Above `MAX_EXACT` words the subset space stops being free, and the original
 * order is kept — an ordering nobody can read is not worth 40 ms.
 */

export const TAGS = [
  'det',
  'pron',
  'prep',
  'conj',
  'adj',
  'adv',
  'noun',
  'verb',
  'interj',
  'unknown',
] as const;

export type Tag = (typeof TAGS)[number];

/** Bit per tag, in `TAGS` order. A word's mask is the OR of what it can be. */
export const TAG_BIT: Record<Tag, number> = {
  det: 1 << 0,
  pron: 1 << 1,
  prep: 1 << 2,
  conj: 1 << 3,
  adj: 1 << 4,
  adv: 1 << 5,
  noun: 1 << 6,
  verb: 1 << 7,
  interj: 1 << 8,
  unknown: 1 << 9,
};

/** Beyond this the exact search is no longer cheap; the input order is kept. */
export const MAX_EXACT = 10;

type Row = Partial<Record<Tag | '$', number>>;

/**
 * How well one part of speech follows another, from -4 (ungrammatical) to
 * +4 (idiomatic). `^` is the start of the phrase and `$` the end; anything
 * unlisted is 0, meaning "no opinion".
 *
 * Tune freely. The numbers only ever compete with each other, so their absolute
 * size does not matter — only the gaps between them.
 */
export const TRANSITION: Record<Tag | '^', Row> = {
  // A phrase opens well on a determiner, an adjective or a noun.
  '^': { det: 3, adj: 2, noun: 2, pron: 2, verb: 1, adv: 1, interj: 1, prep: -2, conj: -4 },

  det: { noun: 4, adj: 4, adv: 1, det: -3, verb: -4, prep: -3, conj: -3, pron: -2, $: -4 },
  adj: { noun: 4, adj: 2, prep: 0, conj: 0, verb: -2, det: -2, pron: -1, $: -1 },
  adv: { verb: 4, adj: 3, adv: 1, det: 0, prep: 0, noun: -2, $: 0 },
  // The one that decides `natural loser` over `loser natural`: a noun followed
  // by a bare adjective is the shape English almost never takes.
  noun: { verb: 3, prep: 3, conj: 2, noun: 1, adv: 1, det: -1, adj: -3, $: 3 },
  verb: { det: 3, noun: 3, prep: 3, adv: 2, pron: 2, adj: 1, conj: 0, verb: -2, $: 1 },
  prep: { det: 4, noun: 3, pron: 3, adj: 2, prep: -3, conj: -3, verb: -3, $: -4 },
  pron: { verb: 4, prep: 1, conj: 1, adv: 1, noun: -2, det: -2, adj: -2, $: 1 },
  conj: { det: 2, noun: 2, adj: 2, pron: 2, verb: 2, conj: -4, prep: -1, $: -4 },
  interj: { $: 2, interj: 0, det: 1, noun: 1, pron: 1, verb: 0 },
  // No information is not the same as a bad fit; an untagged word sits anywhere
  // without dragging the score around.
  unknown: {},
};

function score(from: Tag | '^', to: Tag | '$'): number {
  const row = TRANSITION[from] as Row;
  return row[to] ?? 0;
}

/** Tags a mask allows, as indices into `TAGS`. Empty masks read as `unknown`. */
function tagsOf(mask: number): number[] {
  const out: number[] = [];
  for (let t = 0; t < TAGS.length; t++) {
    if (mask & (1 << t)) out.push(t);
  }
  return out.length > 0 ? out : [TAGS.indexOf('unknown')];
}

/**
 * The score of one specific ordering.
 *
 * Used to sort the alternatives a reader can open, and — more importantly — by
 * `bestOrder` to check that its answer actually beats the order it was given.
 */
export function scoreOrder(words: readonly string[], masks: readonly number[]): number {
  const k = words.length;
  if (k === 0 || masks.length !== k) return 0;

  const options = masks.map(tagsOf);
  let previous = new Map<number, number>();
  for (const t of options[0]!) previous.set(t, score('^', TAGS[t]!));

  for (let i = 1; i < k; i++) {
    const next = new Map<number, number>();
    for (const u of options[i]!) {
      let bestSoFar = -Infinity;
      for (const [t, value] of previous) {
        bestSoFar = Math.max(bestSoFar, value + score(TAGS[t]!, TAGS[u]!));
      }
      next.set(u, bestSoFar);
    }
    previous = next;
  }

  let total = -Infinity;
  for (const [t, value] of previous) total = Math.max(total, value + score(TAGS[t]!, '$'));
  return total;
}

/**
 * The best-reading permutation of `words`, or the original if none is better.
 *
 * `masks[i]` is the part-of-speech bitmask for `words[i]`. Returns a new array;
 * the input is never mutated. A reorder only happens on a strict improvement,
 * which keeps a saved link stable and keeps the display from churning.
 */
export function bestOrder(words: readonly string[], masks: readonly number[]): string[] {
  const k = words.length;
  if (k <= 1 || k > MAX_EXACT || masks.length !== k) return [...words];

  const T = TAGS.length;
  const options = masks.map(tagsOf);
  const full = (1 << k) - 1;
  const size = (full + 1) * k * T;

  const best = new Float64Array(size).fill(-Infinity);
  const from = new Int32Array(size).fill(-1);
  const at = (subset: number, last: number, tag: number) => (subset * k + last) * T + tag;

  for (let i = 0; i < k; i++) {
    for (const t of options[i]!) {
      best[at(1 << i, i, t)] = score('^', TAGS[t]!);
    }
  }

  for (let subset = 1; subset <= full; subset++) {
    for (let last = 0; last < k; last++) {
      if (!(subset & (1 << last))) continue;
      for (const t of options[last]!) {
        const here = best[at(subset, last, t)]!;
        if (here === -Infinity) continue;

        for (let next = 0; next < k; next++) {
          if (subset & (1 << next)) continue;
          const nextSubset = subset | (1 << next);
          for (const u of options[next]!) {
            const candidate = here + score(TAGS[t]!, TAGS[u]!);
            const slot = at(nextSubset, next, u);
            if (candidate > best[slot]!) {
              best[slot] = candidate;
              from[slot] = at(subset, last, t);
            }
          }
        }
      }
    }
  }

  let bestSlot = -1;
  let bestScore = -Infinity;
  for (let last = 0; last < k; last++) {
    for (const t of options[last]!) {
      const total = best[at(full, last, t)]! + score(TAGS[t]!, '$');
      if (total > bestScore) {
        bestScore = total;
        bestSlot = at(full, last, t);
      }
    }
  }
  if (bestSlot < 0) return [...words];

  // Only move words when the new order is *strictly* better. Without this the
  // table's many zero-scoring transitions tie constantly, the tie is broken by
  // whichever path the loops happened to reach first, and the result is a
  // reshuffle that reads no better than the original — `outlearns lar` becoming
  // `lar outlearns` for no reason a reader could name. Churn is worse than
  // leaving it alone, because it costs the reader attention and returns nothing.
  if (bestScore <= scoreOrder(words, masks)) return [...words];

  const order: number[] = [];
  for (let slot = bestSlot; slot >= 0; slot = from[slot]!) {
    order.push(Math.floor(slot / T) % k);
    if (from[slot] === -1) break;
  }
  order.reverse();

  return order.length === k ? order.map((i) => words[i]!) : [...words];
}
