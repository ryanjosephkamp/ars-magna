import { describe, expect, it } from 'vitest';

import { HIT_ID_PATTERN, PASS_TTL_MS, VOTER_PATTERN, connectionKey, hourBucket, signPass, verifyPass } from './core.ts';
import { forgetPass, keepPass, keptPass, siteKeyFor, voterId, withCount, withVote, TURNSTILE_SITE_KEY, TURNSTILE_TEST_KEY, type KeyValue } from './state.ts';

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
