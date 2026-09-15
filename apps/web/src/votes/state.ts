/**
 * The page's side of votes: what the counts look like before and after the API
 * answers, and the voter id and pass the browser keeps. Pure apart from the
 * storage it is handed, so the tests run it without a browser.
 */
import { VOTER_PATTERN } from './core.ts';

export type Tally = { counts: Readonly<Record<string, number>>; mine: ReadonlySet<string> };

/** The tally the moment a reader presses Vote, before the API answers. Pressing into the state it is already in changes nothing. */
export function withVote(tally: Tally, hitId: string, on: boolean): Tally {
  if (tally.mine.has(hitId) === on) return tally;
  const mine = new Set(tally.mine);
  if (on) mine.add(hitId);
  else mine.delete(hitId);
  const count = Math.max(0, (tally.counts[hitId] ?? 0) + (on ? 1 : -1));
  return { counts: { ...tally.counts, [hitId]: count }, mine };
}

/** The tally once the API has answered with the hit's real count. */
export function withCount(tally: Tally, hitId: string, on: boolean, count: number): Tally {
  const mine = new Set(tally.mine);
  if (on) mine.add(hitId);
  else mine.delete(hitId);
  return { counts: { ...tally.counts, [hitId]: count }, mine };
}

/** The site's Turnstile key, which covers ars-magna.pages.dev. */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAE2SmLInpWFmqzhN';
/** Cloudflare's test key that always passes and shows nothing, for a local machine the site's key does not cover. */
export const TURNSTILE_TEST_KEY = '1x00000000000000000000BB';

export function siteKeyFor(hostname: string): string {
  return hostname === 'localhost' || hostname === '127.0.0.1' ? TURNSTILE_TEST_KEY : TURNSTILE_SITE_KEY;
}

export type KeyValue = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const VOTER_KEY = 'ars-magna-voter';
const PASS_KEY = 'ars-magna-pass';

/** The browser's voter id: the one it kept, or a new one it keeps from now on. Without storage, a new one for this page load. */
export function voterId(store: KeyValue | null, make: () => string = () => crypto.randomUUID()): string {
  try {
    const kept = store?.getItem(VOTER_KEY);
    if (kept && VOTER_PATTERN.test(kept)) return kept;
  } catch {
    // Storage can be refused; a voter id for this page load still works.
  }
  const id = make();
  try {
    store?.setItem(VOTER_KEY, id);
  } catch {
    // As above.
  }
  return id;
}

export type Pass = { pass: string; expires: number };

/** The pass kept for this visit, while it has more than a minute left. */
export function keptPass(store: KeyValue | null, now: number): string | null {
  try {
    const raw = store?.getItem(PASS_KEY);
    if (!raw) return null;
    const kept = JSON.parse(raw) as Partial<Pass>;
    return typeof kept.pass === 'string' && typeof kept.expires === 'number' && kept.expires - 60_000 > now ? kept.pass : null;
  } catch {
    return null;
  }
}

export function keepPass(store: KeyValue | null, pass: Pass): void {
  try {
    store?.setItem(PASS_KEY, JSON.stringify(pass));
  } catch {
    // Without storage, the next vote asks for a pass again.
  }
}

export function forgetPass(store: KeyValue | null): void {
  try {
    store?.removeItem(PASS_KEY);
  } catch {
    // Nothing kept, nothing to forget.
  }
}
