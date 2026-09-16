import { describe, expect, it } from 'vitest';

import {
  HIT_ID_PATTERN,
  KEY_PATTERN,
  MAX_LETTERS,
  MAX_WORDS,
  PASS_TTL_MS,
  VOTER_PATTERN,
  connectionKey,
  hourBucket,
  promotable,
  promotionKey,
  signPass,
  sortedLetters,
  spellingKey,
  verifyPass,
} from './core.ts';
import {
  CHECK_TIMED_OUT,
  CHECK_TIME_LIMIT_MS,
  forgetPass,
  keepPass,
  keptPass,
  siteKeyFor,
  voterId,
  withCount,
  withTimeLimit,
  withVote,
  TURNSTILE_SITE_KEY,
  TURNSTILE_TEST_KEY,
  type KeyValue,
  type Tally,
  type Timer,
} from './state.ts';

const VOTER = '0b6a1f3e-8d2c-4c1a-9f5e-2b7d6c4a1e90';
const NOW = Date.UTC(2026, 8, 15, 12, 30);

function memoryStore(initial: Record<string, string> = {}): KeyValue & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe('passes', () => {
  it('verify for the voter they were signed for, until they expire', async () => {
    const pass = await signPass('secret', VOTER, NOW + PASS_TTL_MS);
    expect(await verifyPass('secret', VOTER, pass, NOW)).toBe(true);
    expect(await verifyPass('secret', VOTER, pass, NOW + PASS_TTL_MS)).toBe(false);
    expect(await verifyPass('other secret', VOTER, pass, NOW)).toBe(false);
    expect(await verifyPass('secret', VOTER.replace('0b', '1b'), pass, NOW)).toBe(false);
    expect(await verifyPass('secret', VOTER, `${NOW + PASS_TTL_MS + 1}${pass.slice(13)}`, NOW)).toBe(false);
    expect(await verifyPass('secret', VOTER, 'not a pass', NOW)).toBe(false);
    // A pass that claims to outlast a visit is refused even with a good signature.
    expect(await verifyPass('secret', VOTER, await signPass('secret', VOTER, NOW + 2 * PASS_TTL_MS), NOW)).toBe(false);
  });
});

describe('connections', () => {
  it('hash an address with the secret and the day, so the key changes daily and hides the address', async () => {
    const today = await connectionKey('secret', '203.0.113.7', NOW);
    expect(today).toMatch(/^[0-9a-f]{32}$/);
    expect(await connectionKey('secret', '203.0.113.7', NOW + 60_000)).toBe(today);
    expect(await connectionKey('secret', '203.0.113.7', NOW + 24 * 60 * 60 * 1000)).not.toBe(today);
    expect(await connectionKey('other secret', '203.0.113.7', NOW)).not.toBe(today);
    expect(await connectionKey('secret', '203.0.113.8', NOW)).not.toBe(today);
    expect(hourBucket(NOW)).toBe('2026-09-15T12');
  });

  it('accept voter ids and hit ids in their exact forms only', () => {
    expect(VOTER_PATTERN.test(crypto.randomUUID())).toBe(true);
    expect(VOTER_PATTERN.test('ALICE')).toBe(false);
    expect(HIT_ID_PATTERN.test('dormitory:phrases:dirty-room')).toBe(true);
    expect(HIT_ID_PATTERN.test('dormitory:plays:dirty-room')).toBe(false);
  });
});

describe('promotions', () => {
  it('key an anagram by its letters and its words, never by their order', () => {
    expect(sortedLetters('agentleman')).toBe('aaeeglmnnt');
    expect(promotionKey(['entangle', 'am'])).toBe('aaeeglmnnt:am-entangle');
    expect(promotionKey(['am', 'entangle'])).toBe('aaeeglmnnt:am-entangle');
    expect(KEY_PATTERN.test(promotionKey(['elegant', 'man']))).toBe(true);
    expect(KEY_PATTERN.test('aaeeglmnnt:Elegant-man')).toBe(false);
  });

  it('share a spelling key across the spellings the search shows as one row', () => {
    expect(spellingKey(['door', 'sit'])).toBe(spellingKey(['its', 'odor']));
    expect(spellingKey(['man', 'get', 'lane'])).toBe(spellingKey(['elan', 'get', 'man']));
    expect(spellingKey(['elegant', 'man'])).not.toBe(spellingKey(['entangle', 'am']));
  });

  it('are offered only for well-formed words that use exactly the input’s folded letters', () => {
    expect(promotable('A gentleman', ['entangle', 'am'])).toBe(true);
    expect(promotable('Beyoncé', ['boney', 'ec'])).toBe(true);
    expect(promotable('A gentleman', ['entangle', 'ma', 'a'])).toBe(false);
    expect(promotable('A gentleman', ['Entangle', 'am'])).toBe(false);
    expect(promotable('   ', [])).toBe(false);
    expect(promotable('z'.repeat(MAX_LETTERS + 1), ['z'.repeat(MAX_LETTERS + 1)])).toBe(false);
    expect(promotable('a'.repeat(MAX_WORDS + 1), Array.from({ length: MAX_WORDS + 1 }, () => 'a'))).toBe(false);
  });
});

describe('the page’s tally', () => {
  it('moves a count at once when Vote is pressed, then takes the API’s count', () => {
    const start = { counts: { a: 2 }, mine: new Set<string>() };
    const pressed = withVote(start, 'a', true);
    expect([pressed.counts['a'], pressed.mine.has('a')]).toEqual([3, true]);
    expect(withVote(pressed, 'a', true)).toBe(pressed);
    expect(withVote(pressed, 'a', false)).toEqual(start);
    expect(withVote(start, 'b', false)).toBe(start);
    const answered = withCount(pressed, 'a', true, 7);
    expect([answered.counts['a'], answered.mine.has('a')]).toEqual([7, true]);
    expect(withVote({ counts: {}, mine: new Set(['c']) }, 'c', false).counts['c']).toBe(0);
  });

  it('keeps one voter id per browser, and a pass until a minute before it expires', () => {
    const store = memoryStore();
    const first = voterId(store, () => VOTER);
    expect(first).toBe(VOTER);
    expect(voterId(store, () => 'never used')).toBe(VOTER);
    expect(voterId(memoryStore({ 'ars-magna-voter': 'tampered' }), () => VOTER)).toBe(VOTER);
    expect(voterId(null, () => VOTER)).toBe(VOTER);

    keepPass(store, { pass: 'p', expires: NOW + 120_000 });
    expect(keptPass(store, NOW)).toBe('p');
    expect(keptPass(store, NOW + 61_000)).toBeNull();
    forgetPass(store);
    expect(keptPass(store, NOW)).toBeNull();
    expect(keptPass(memoryStore({ 'ars-magna-pass': '{broken' }), NOW)).toBeNull();
  });

  it('uses the site’s Turnstile key everywhere but a local machine', () => {
    expect(siteKeyFor('ars-magna.pages.dev')).toBe(TURNSTILE_SITE_KEY);
    expect(siteKeyFor('localhost')).toBe(TURNSTILE_TEST_KEY);
    expect(siteKeyFor('127.0.0.1')).toBe(TURNSTILE_TEST_KEY);
  });
});

/** A timer the test fires by hand, so two minutes cost nothing to wait out. */
function fakeTimer(): Timer & { fire(): void; scheduled(): boolean; waited: number } {
  let run: (() => void) | null = null;
  const timer = {
    waited: 0,
    set(fn: () => void, ms: number): number {
      run = fn;
      timer.waited = ms;
      return 1;
    },
    clear(): void {
      run = null;
    },
    fire(): void {
      const fn = run;
      run = null;
      fn?.();
    },
    scheduled: () => run !== null,
  };
  return timer;
}

describe('the check before voting', () => {
  it('is abandoned two minutes on, and tidies the widget away as it goes', async () => {
    const timer = fakeTimer();
    let tidied = 0;
    // A check nobody ever answers: the reader walked away from the click.
    const limited = withTimeLimit(new Promise<string>(() => {}), CHECK_TIME_LIMIT_MS, () => (tidied += 1), timer);
    expect(timer.waited).toBe(120_000);
    timer.fire();
    await expect(limited).rejects.toThrow(CHECK_TIMED_OUT);
    expect(tidied).toBe(1);
  });

  it('takes the token a finished check gives it, and stops waiting', async () => {
    const timer = fakeTimer();
    let tidied = 0;
    await expect(withTimeLimit(Promise.resolve('a token'), CHECK_TIME_LIMIT_MS, () => (tidied += 1), timer)).resolves.toBe('a token');
    expect([timer.scheduled(), tidied]).toEqual([false, 0]);
  });

  it('passes a check that failed or expired straight through, as before', async () => {
    for (const reason of ['check-failed', 'check-expired']) {
      const timer = fakeTimer();
      let tidied = 0;
      await expect(withTimeLimit(Promise.reject(new Error(reason)), CHECK_TIME_LIMIT_MS, () => (tidied += 1), timer)).rejects.toThrow(reason);
      // The check tidied up after itself, so the limit has nothing to do.
      expect([timer.scheduled(), tidied]).toEqual([false, 0]);
    }
  });

  it('leaves the count where it started when the check runs out of time', async () => {
    const start: Tally = { counts: { 'dormitory:phrases:dirty-room': 2 }, mine: new Set<string>() };
    const pressed = withVote(start, 'dormitory:phrases:dirty-room', true);
    expect(pressed.counts['dormitory:phrases:dirty-room']).toBe(3);

    const timer = fakeTimer();
    const limited = withTimeLimit(new Promise<string>(() => {}), CHECK_TIME_LIMIT_MS, () => {}, timer);
    timer.fire();
    await expect(limited).rejects.toThrow(CHECK_TIMED_OUT);

    // The hook undoes the press by this path on any failure, the limit included.
    expect(withVote(pressed, 'dormitory:phrases:dirty-room', false)).toEqual(start);
  });
});
