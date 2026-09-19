/**
 * Build's own number: how many anagrams the text has, counted in a worker of
 * its own and never for longer than the reader will wait.
 *
 * The engine counts in one uninterruptible call with a budget in search nodes,
 * and a node's cost grows with the text: about 50,000 a second on 25 letters,
 * 10,000 on 160. No budget is also a time limit, so the count climbs a ladder
 * of budgets, each four times the last. A rung that finishes exactly is the
 * answer; one that runs out of budget leaves a floor and the next rung starts.
 * When the time runs out mid-rung, the page shows the last floor and the
 * worker is killed. Pure apart from the timer, so the tests drive it with a
 * stand-in for the engine.
 *
 * The four dictionaries nest, each holding every anagram of the narrower
 * ones, so their figures do too: a wider dictionary never reads less than a
 * narrower one, and once one stops at the limit the wider ones are not
 * counted, since a wider search is never cheaper (`nextTier`, `nestCounts`).
 */
import { TIERS, formatCount, type Tier } from '@ars-magna/engine';

import { TIER_LABEL } from './analysis.ts';

/** How long the page waits for the count, in milliseconds, from when it starts to when it gives up. */
export const BUILD_COUNT_LIMIT_MS = 4_000;

/** The node budget of each rung: 10,000, then four times the last, to the search's own 50,000,000. */
export const COUNT_STEPS: readonly number[] = [10_000, 40_000, 160_000, 640_000, 2_560_000, 10_240_000, 50_000_000];

export type TextCount =
  /** No letters, so nothing to count. */
  | { readonly kind: 'none' }
  | { readonly kind: 'counting' }
  /** Every anagram, counted. */
  | { readonly kind: 'exact'; readonly total: string }
  /**
   * At least this many; the time or the last budget ran out first. Digits
   * only, no `>`. `from` names a narrower dictionary whose figure this is,
   * when that one reached further than this one's own count, or this one was
   * not counted because that one stopped.
   */
  | { readonly kind: 'floor'; readonly total: string; readonly from?: Tier }
  /**
   * The time ran out before the engine had found a single anagram to count.
   * `from` names the narrower dictionary that stopped, when this one was not
   * counted at all.
   */
  | { readonly kind: 'too-long'; readonly from?: Tier }
  /** The engine could not say. */
  | { readonly kind: 'failed' };

/**
 * What one rung's answer means: a total with a `>` is a floor, and a floor of
 * 0 is no floor at all, since the count stopped before it reached a whole
 * anagram.
 */
export function readTotal(total: string): TextCount {
  if (!total.startsWith('>')) return { kind: 'exact', total };
  const floor = total.slice(1);
  return /^0*$/.test(floor) ? { kind: 'too-long' } : { kind: 'floor', total: floor };
}

/** What the deadline resolves to, told apart from any total the engine gives. */
const TIMED_OUT = Symbol('timed out');

/**
 * Climb `steps` until a rung counts exactly or `limitMs` passes. `ask` counts
 * with a node budget and resolves the engine's total, `>` for a floor, or
 * null when it could not. `wait` resolves after a number of milliseconds.
 * `timedOut` tells the caller a rung is still running and must be stopped.
 */
export async function climb(
  ask: (maxNodes: number) => Promise<string | null>,
  options: {
    readonly steps?: readonly number[];
    readonly limitMs?: number;
    readonly wait?: (ms: number) => Promise<void>;
  } = {},
): Promise<{ readonly count: TextCount; readonly timedOut: boolean }> {
  const { steps = COUNT_STEPS, limitMs = BUILD_COUNT_LIMIT_MS, wait = (ms) => new Promise((r) => setTimeout(r, ms)) } = options;
  const deadline = wait(limitMs).then((): typeof TIMED_OUT => TIMED_OUT);
  let best: TextCount = { kind: 'too-long' };
  for (const maxNodes of steps) {
    const total = await Promise.race([ask(maxNodes), deadline]);
    if (total === TIMED_OUT) return { count: best, timedOut: true };
    if (total === null) return { count: { kind: 'failed' }, timedOut: false };
    const read = readTotal(total);
    if (read.kind === 'exact') return { count: read, timedOut: false };
    if (read.kind === 'floor') best = read;
  }
  return { count: best, timedOut: false };
}

/**
 * The line `Every anagram of the text` reads: `115 in Standard`, `more than
 * 39,233,467,955 in Standard`, or a sentence when the text is too long to
 * count in the time the page allows.
 */
export function countLine(count: TextCount, tier: Tier, limitMs = BUILD_COUNT_LIMIT_MS): string {
  switch (count.kind) {
    case 'none':
      return '—';
    case 'counting':
      return 'Counting…';
    case 'exact':
      return `${formatCount(count.total)} in ${TIER_LABEL[tier]}`;
    case 'floor':
      return `more than ${formatCount(count.total)} in ${TIER_LABEL[tier]}`;
    case 'too-long': {
      const seconds = limitMs / 1000;
      return `The text is too long to count here; the page stops counting after ${seconds} ${seconds === 1 ? 'second' : 'seconds'}.`;
    }
    case 'failed':
      return 'Not counted';
  }
}

/** The count as the exports carry it: the engine's form, `>` for a floor, or null when there is no figure. */
export function exportTotal(count: TextCount): string | null {
  return count.kind === 'exact' ? count.total : count.kind === 'floor' ? `>${count.total}` : null;
}

/** The four dictionaries in the order they are counted: the one chosen first, so its line fills first, then the rest narrowest first. */
export function tierOrder(chosen: Tier): Tier[] {
  return [chosen, ...TIERS.filter((tier) => tier !== chosen)];
}

/** Whether a count stopped short of the exact figure: every wider dictionary would stop too, since none is cheaper. */
export function stopped(count: TextCount | undefined): boolean {
  return count?.kind === 'floor' || count?.kind === 'too-long';
}

/**
 * The next dictionary to count, or null when there is none left: in
 * `tierOrder`, the first not yet counted that no narrower dictionary's stop
 * already settles. The dictionaries nest, each holding every anagram of the
 * narrower ones, so a wider search is never cheaper: once one stops, every
 * wider one would stop too, and reads the narrower one's figure instead. With
 * Extended chosen and stopping, Common is still counted, since it may finish;
 * if it stops as well, Standard and Full are settled by it.
 */
export function nextTier(chosen: Tier, counted: Readonly<Partial<Record<Tier, TextCount>>>): Tier | null {
  const settled = (tier: Tier) => TIERS.slice(0, TIERS.indexOf(tier)).some((narrower) => stopped(counted[narrower]));
  return tierOrder(chosen).find((tier) => counted[tier] === undefined && !settled(tier)) ?? null;
}

/** Whether digits `a` stand for a larger number than digits `b`. */
const larger = (a: string, b: string): boolean => BigInt(a) > BigInt(b);

/**
 * Every dictionary's figure as the page shows it, from the counts that have
 * come in. A wider dictionary holds every anagram of a narrower one, so its
 * figure is never less: a floor lower than a narrower dictionary's figure
 * rises to it, and a dictionary that stopped before finding one anagram reads
 * the narrower figure as its floor. One not yet counted reads `counting`,
 * unless a narrower dictionary's stop settles it, when it reads that figure,
 * or `too-long` when there is none. An exact count is never changed.
 */
export function nestCounts(counted: Readonly<Partial<Record<Tier, TextCount>>>): Record<Tier, TextCount> {
  const out = {} as Record<Tier, TextCount>;
  /** The largest figure a narrower dictionary reached, and which dictionary counted it. */
  let carried: { total: string; from: Tier } | null = null;
  /** The narrower dictionary that stopped, when one has. */
  let stop: Tier | null = null;
  for (const tier of TIERS) {
    const own = counted[tier];
    const floor: TextCount | null = carried !== null && carried.total !== '0' ? { kind: 'floor', total: carried.total, from: carried.from } : null;
    let shown: TextCount;
    if (own === undefined) shown = stop === null ? { kind: 'counting' } : (floor ?? { kind: 'too-long', from: stop });
    else if (own.kind === 'floor') shown = floor !== null && larger(floor.total, own.total) ? floor : own;
    else if (own.kind === 'too-long') shown = floor ?? own;
    else shown = own;
    out[tier] = shown;
    if ((shown.kind === 'exact' || shown.kind === 'floor') && (carried === null || larger(shown.total, carried.total))) {
      carried = { total: shown.total, from: (shown.kind === 'floor' ? shown.from : undefined) ?? tier };
    }
    if (stop === null && stopped(own)) stop = tier;
  }
  return out;
}

/**
 * Whether a dictionary's exact count is the same as the narrower one's before
 * it, so the words it adds make no further anagram: `Full 999 · adds none`.
 * Never for Common, which has nothing narrower, nor for a count of 0.
 */
export function addsNone(counts: Readonly<Record<Tier, TextCount>>, tier: Tier): boolean {
  const i = TIERS.indexOf(tier);
  const own = counts[tier];
  const narrower = i > 0 ? counts[TIERS[i - 1]!] : undefined;
  return own.kind === 'exact' && narrower?.kind === 'exact' && own.total === narrower.total && own.total !== '0';
}

/**
 * One dictionary's figure in the count by dictionary, where the label already
 * names it: `115`, `999 · adds none`, `more than 1,065,799`, or a sentence
 * when the time ran out before a single anagram.
 */
export function tierLine(count: TextCount, same = false): string {
  switch (count.kind) {
    case 'exact':
      return same ? `${formatCount(count.total)} · adds none` : formatCount(count.total);
    case 'floor':
      return `more than ${formatCount(count.total)}`;
    case 'too-long':
      return 'Too long to count here.';
    case 'none':
      return '—';
    case 'counting':
      return 'Counting…';
    case 'failed':
      return 'Not counted';
  }
}

/** Whether any count stopped at the time limit, so the page says how long it gives each. */
export function stoppedAny(counts: readonly TextCount[]): boolean {
  return counts.some((c) => c.kind === 'too-long' || c.kind === 'floor');
}

/** The sentence under the count by dictionary when a count stopped at the limit. */
export function limitNote(limitMs = BUILD_COUNT_LIMIT_MS): string {
  const seconds = limitMs / 1000;
  return `Each count stops after ${seconds} ${seconds === 1 ? 'second' : 'seconds'}; “more than” means it stopped first.`;
}

/**
 * The sentences under the count by dictionary, as its figures need them: how
 * long a count may run, when one stopped; that the dictionaries nest, when a
 * figure came from a narrower one or a line reads `adds none`; and what each
 * of those means.
 */
export function countNotes(counts: Readonly<Record<Tier, TextCount>>, limitMs = BUILD_COUNT_LIMIT_MS): string[] {
  const all = TIERS.map((tier) => counts[tier]);
  const carried = all.some((c) => (c.kind === 'floor' || c.kind === 'too-long') && c.from !== undefined);
  const same = TIERS.some((tier) => addsNone(counts, tier));
  return [
    ...(stoppedAny(all) ? [limitNote(limitMs)] : []),
    ...(carried || same ? ['Each dictionary holds every anagram of the ones above it.'] : []),
    ...(carried ? ['Once a count stops, the dictionaries below it are not counted and read its figure.'] : []),
    ...(same ? ['A line that reads “adds none” has no anagram the one above lacks.'] : []),
  ];
}
