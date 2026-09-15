/**
 * The vote API against SQLite in memory with the real migrations, a fixed
 * clock and a fake Turnstile.
 */
import { describe, expect, it } from 'vitest';

import { LIMITS, PASS_TTL_MS, verifyPass } from './core.ts';
import { TURNSTILE_VERIFY, getVotes, guard, onlyPost, postPass, postVote, type Deps, type Env, type VotesBody } from './api.ts';
import { memoryD1 } from './testing.ts';

const ORIGIN = 'https://ars-magna.pages.dev';
const HIT = 'dormitory:phrases:dirty-room';
const OTHER = 'listen:phrases:silent';
const ALICE = '0b6a1f3e-8d2c-4c1a-9f5e-2b7d6c4a1e90';
const BOB = '7c2e4a10-3b5d-4e6f-8a9b-0c1d2e3f4a5b';
const IP = '203.0.113.7';

function setup(options: { turnstile?: boolean; open?: string } = {}) {
  const db = memoryD1();
  let now = Date.UTC(2026, 8, 15, 12, 0, 0);
  const verified: { url: string; form: FormData }[] = [];
  const deps: Deps = {
    now: () => now,
    fetch: async (url, init) => {
      verified.push({ url, form: init?.body as FormData });
      return new Response(JSON.stringify({ success: options.turnstile ?? true }));
    },
    publishedIds: async () => new Set([HIT, OTHER]),
  };
  const env: Env = { DISCOVERIES_DB: db, TURNSTILE_SECRET: 'turnstile-secret', IP_HASH_SECRET: 'hash-secret', ...(options.open ? { VOTES_OPEN: options.open } : {}) };
  const post = (path: string, body: unknown, ip = IP, type = 'application/json') =>
    new Request(ORIGIN + path, { method: 'POST', headers: { 'content-type': type, 'cf-connecting-ip': ip }, body: JSON.stringify(body) });
  const passFor = async (voter: string, ip = IP) => {
    const response = await postPass(post('/api/pass', { voter, token: 'token' }, ip), env, deps);
    return ((await response.json()) as { pass: string }).pass;
  };
  const vote = (body: Record<string, unknown>, ip = IP) => postVote(post('/api/vote', body, ip), env, deps);
  const votes = async (voter?: string) => (await (await getVotes(new Request(`${ORIGIN}/api/votes${voter ? `?voter=${voter}` : ''}`), env)).json()) as VotesBody;
  return { db, env, deps, verified, post, passFor, vote, votes, advance: (ms: number) => void (now += ms), now: () => now };
}

describe('POST /api/pass', () => {
  it('gives a pass signed for the voter when Turnstile accepts the token', async () => {
    const t = setup();
    const response = await postPass(t.post('/api/pass', { voter: ALICE, token: 'token' }), t.env, t.deps);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = (await response.json()) as { pass: string; expires: number };
    expect(body.expires).toBe(t.now() + PASS_TTL_MS);
    expect(await verifyPass('hash-secret', ALICE, body.pass, t.now())).toBe(true);
    expect(await verifyPass('hash-secret', BOB, body.pass, t.now())).toBe(false);
    // Turnstile is asked with the secret, the token and the connection's address.
    expect(t.verified[0]!.url).toBe(TURNSTILE_VERIFY);
    expect([t.verified[0]!.form.get('secret'), t.verified[0]!.form.get('response'), t.verified[0]!.form.get('remoteip')]).toEqual(['turnstile-secret', 'token', IP]);
  });

  it('refuses a failed check, a bad voter id, and a body that is not JSON', async () => {
    const t = setup({ turnstile: false });
    expect((await postPass(t.post('/api/pass', { voter: ALICE, token: 'token' }), t.env, t.deps)).status).toBe(403);
    expect((await postPass(t.post('/api/pass', { voter: 'alice', token: 'token' }), t.env, t.deps)).status).toBe(400);
    expect((await postPass(t.post('/api/pass', { voter: ALICE }), t.env, t.deps)).status).toBe(400);
    expect((await postPass(t.post('/api/pass', { voter: ALICE, token: 'token' }, IP, 'text/plain'), t.env, t.deps)).status).toBe(400);
  });
});

describe('POST /api/vote and GET /api/votes', () => {
  it('counts one vote per voter per hit, and taking a vote back takes one away', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    const bob = await t.passFor(BOB);
    const cast = async (voter: string, pass: string, on: boolean, hit = HIT) => (await (await t.vote({ hit_id: hit, voter, pass, on })).json()) as { on: boolean; count: number };

    expect(await cast(ALICE, alice, true)).toEqual({ hit_id: HIT, on: true, count: 1 });
    expect((await cast(ALICE, alice, true)).count).toBe(1);
    expect((await cast(BOB, bob, true)).count).toBe(2);
    expect((await cast(BOB, bob, true, OTHER)).count).toBe(1);
    expect(await t.votes(ALICE)).toEqual({ open: true, counts: { [HIT]: 2, [OTHER]: 1 }, mine: [HIT] });

    expect((await cast(ALICE, alice, false)).count).toBe(1);
    expect((await cast(ALICE, alice, false)).count).toBe(1);
    expect((await cast(BOB, bob, false, OTHER)).count).toBe(0);
    // A count of zero is not listed; a voter id that is not one lists nothing.
    expect(await t.votes('not-a-voter')).toEqual({ open: true, counts: { [HIT]: 1 }, mine: [] });
    expect(await t.votes(BOB)).toMatchObject({ mine: [HIT] });
  });

  it('refuses a vote without a pass for this voter, for a hit that is not published, and while voting is paused', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    expect((await t.vote({ hit_id: HIT, voter: ALICE, on: true })).status).toBe(403);
    expect((await t.vote({ hit_id: HIT, voter: BOB, pass: alice, on: true })).status).toBe(403);
    expect((await t.vote({ hit_id: HIT, voter: ALICE, pass: alice.replace(/.$/, (c) => (c === '0' ? '1' : '0')), on: true })).status).toBe(403);
    expect((await t.vote({ hit_id: 'titanic:titles:i-intact', voter: ALICE, pass: alice, on: true })).status).toBe(404);
    expect((await t.vote({ hit_id: 'Not An Id', voter: ALICE, pass: alice, on: true })).status).toBe(400);
    expect((await t.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: 'yes' })).status).toBe(400);

    t.advance(PASS_TTL_MS);
    const expired = await t.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: true });
    expect(expired.status).toBe(403);
    expect(await expired.json()).toMatchObject({ error: 'no-pass' });

    const paused = setup({ open: 'false' });
    expect((await postPass(paused.post('/api/pass', { voter: ALICE, token: 'token' }), paused.env, paused.deps)).status).toBe(503);
    expect((await paused.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: true })).status).toBe(503);
    expect(await paused.votes()).toEqual({ open: false, counts: {}, mine: [] });
  });

  it('limits each connection per hour, starts afresh the next hour, and never stores an address', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    for (let i = 0; i < LIMITS.vote; i++) {
      expect((await t.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: i % 2 === 0 })).status).toBe(200);
    }
    const limited = await t.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: true });
    expect(limited.status).toBe(429);
    // Another connection is counted apart.
    expect((await t.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: true }, '198.51.100.4')).status).toBe(200);

    t.advance(60 * 60 * 1000);
    const fresh = await t.passFor(ALICE);
    expect((await t.vote({ hit_id: HIT, voter: ALICE, pass: fresh, on: false })).status).toBe(200);
    const rows = t.db.sqlite.prepare('SELECT key, bucket FROM rate_limits').all() as { key: string; bucket: string }[];
    expect(new Set(rows.map((r) => r.bucket))).toEqual(new Set(['2026-09-15T13']));
    expect(JSON.stringify(rows)).not.toContain(IP);
  });

  it('refuses any method but POST on the endpoints that take POST', async () => {
    const response = await onlyPost();
    expect([response.status, response.headers.get('allow')]).toEqual([405, 'POST']);
  });

  it('answers anything that throws with a plain 500', async () => {
    const response = await guard(async () => {
      throw new Error('boom');
    });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'unavailable', message: 'Votes are not available right now.' });
  });
});
