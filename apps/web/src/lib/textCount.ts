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
  /** At least this many; the time or the last budget ran out first. Digits only, no `>`. */
  | { readonly kind: 'floor'; readonly total: string }
  /** The time ran out before the engine had found a single anagram to count. */
  | { readonly kind: 'too-long' }
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
 * The line `Every anagram of the text` reads: `116 in Standard`, `more than
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

/**
 * One dictionary's figure in the count by dictionary, where the label already
 * names it: `116`, `more than 1,065,799`, or a sentence when the time ran out
 * before a single anagram.
 */
export function tierLine(count: TextCount): string {
  switch (count.kind) {
    case 'exact':
      return formatCount(count.total);
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
