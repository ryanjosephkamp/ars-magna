/**
 * The vote and promotion API against SQLite in memory with the real
 * migrations, a fixed clock and a fake Turnstile.
 */
import { describe, expect, it } from 'vitest';

import { LIMITS, PASS_TTL_MS, verifyPass } from './core.ts';
import {
  TURNSTILE_VERIFY,
  getPromotions,
  getVotes,
  guard,
  onlyPost,
  postPass,
  postPromote,
  postVote,
  type Deps,
  type Env,
  type PromotionsBody,
  type VotesBody,
} from './api.ts';
import { memoryD1 } from './testing.ts';

const ORIGIN = 'https://ars-magna.pages.dev';
const HIT = 'dormitory:phrases:dirty-room';
const OTHER = 'listen:phrases:silent';
const ALICE = '0b6a1f3e-8d2c-4c1a-9f5e-2b7d6c4a1e90';
const BOB = '7c2e4a10-3b5d-4e6f-8a9b-0c1d2e3f4a5b';
const IP = '203.0.113.7';

/** "A gentleman → elegant man" is on Discoveries; "entangle am" is not. */
const PUBLISHED_KEY = 'aaeeglmnnt:elegant-man';
const PROMOTED = { input: 'A gentleman', words: ['entangle', 'am'], tier: 'standard' };
const PROMOTED_KEY = 'aaeeglmnnt:am-entangle';

function setup(options: { turnstile?: boolean; open?: string; promotionsOpen?: string; blocked?: string[] } = {}) {
  const db = memoryD1();
  let now = Date.UTC(2026, 8, 15, 12, 0, 0);
  const verified: { url: string; form: FormData }[] = [];
  const deps: Deps = {
    now: () => now,
    fetch: async (url, init) => {
      verified.push({ url, form: init?.body as FormData });
      return new Response(JSON.stringify({ success: options.turnstile ?? true }));
    },
    published: async () => ({ ids: new Set([HIT, OTHER]), keys: new Set([PUBLISHED_KEY]) }),
    blockedKeys: async () => new Set(options.blocked ?? []),
  };
  const env: Env = {
    DISCOVERIES_DB: db,
    TURNSTILE_SECRET: 'turnstile-secret',
    IP_HASH_SECRET: 'hash-secret',
    ...(options.open ? { VOTES_OPEN: options.open } : {}),
    ...(options.promotionsOpen ? { PROMOTIONS_OPEN: options.promotionsOpen } : {}),
  };
  const post = (path: string, body: unknown, ip = IP, type = 'application/json') =>
    new Request(ORIGIN + path, { method: 'POST', headers: { 'content-type': type, 'cf-connecting-ip': ip }, body: JSON.stringify(body) });
  const passFor = async (voter: string, ip = IP) => {
    const response = await postPass(post('/api/pass', { voter, token: 'token' }, ip), env, deps);
    return ((await response.json()) as { pass: string }).pass;
  };
  const vote = (body: Record<string, unknown>, ip = IP) => postVote(post('/api/vote', body, ip), env, deps);
  const votes = async (voter?: string) => (await (await getVotes(new Request(`${ORIGIN}/api/votes${voter ? `?voter=${voter}` : ''}`), env)).json()) as VotesBody;
  const promote = (body: Record<string, unknown>, ip = IP) => postPromote(post('/api/promote', body, ip), env, deps);
  const promotions = async (letters: string, voter?: string) =>
    (await (await getPromotions(new Request(`${ORIGIN}/api/promotions?letters=${letters}${voter ? `&voter=${voter}` : ''}`), env)).json()) as PromotionsBody;
  return { db, env, deps, verified, post, passFor, vote, votes, promote, promotions, advance: (ms: number) => void (now += ms), now: () => now };
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

    // The check stays open while promotions are; the vote itself is refused.
    const paused = setup({ open: 'false' });
    expect((await postPass(paused.post('/api/pass', { voter: ALICE, token: 'token' }), paused.env, paused.deps)).status).toBe(200);
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

describe('POST /api/promote and GET /api/promotions', () => {
  it('counts one promotion per voter per anagram, whatever the word order or the spelling of the input', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    const bob = await t.passFor(BOB);
    const press = async (voter: string, pass: string, on: boolean, over: Record<string, unknown> = {}) =>
      (await (await t.promote({ ...PROMOTED, voter, pass, on, ...over })).json()) as { key: string; on: boolean; count: number };

    expect(await press(ALICE, alice, true)).toEqual({ key: PROMOTED_KEY, on: true, count: 1 });
    expect((await press(ALICE, alice, true)).count).toBe(1);
    // Another reader, another order, another spelling of the same letters: the same anagram.
    expect((await press(BOB, bob, true, { input: 'Tangle amen', words: ['am', 'entangle'] })).count).toBe(2);
    expect(await t.promotions('aaeeglmnnt', ALICE)).toEqual({ open: true, counts: { [PROMOTED_KEY]: 2 }, mine: [PROMOTED_KEY] });
    // The letters may come unsorted; a voter id that is not one lists nothing.
    expect(await t.promotions('agentleman', 'not-a-voter')).toEqual({ open: true, counts: { [PROMOTED_KEY]: 2 }, mine: [] });

    expect((await press(ALICE, alice, false)).count).toBe(1);
    expect((await press(ALICE, alice, false)).count).toBe(1);
    expect((await press(BOB, bob, false)).count).toBe(0);
    expect(await t.promotions('aaeeglmnnt', BOB)).toEqual({ open: true, counts: {}, mine: [] });
  });

  it('lists only the letters asked for, and refuses letters that are not a to z', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: true });
    await t.promote({ input: 'Dormitory', words: ['room', 'dirty'], tier: 'common', voter: ALICE, pass: alice, on: true });
    // A longer set of letters that starts with these is a different set.
    await t.promote({ input: 'A gentlemans', words: ['entangle', 'mas'], tier: 'full', voter: ALICE, pass: alice, on: true });
    expect(await t.promotions('aaeeglmnnt', ALICE)).toEqual({ open: true, counts: { [PROMOTED_KEY]: 1 }, mine: [PROMOTED_KEY] });
    expect((await t.promotions('dimoorrty')).counts).toEqual({ 'dimoorrty:dirty-room': 1 });

    const bad = await getPromotions(new Request(`${ORIGIN}/api/promotions?letters=A%20gentleman`), t.env);
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ error: 'bad-request', message: 'Send the letters to look up, a to z.' });
    expect((await getPromotions(new Request(`${ORIGIN}/api/promotions`), t.env)).status).toBe(400);
    expect((await getPromotions(new Request(`${ORIGIN}/api/promotions?letters=${'a'.repeat(201)}`), t.env)).status).toBe(400);
  });

  it('keeps what the reader saw, and nothing about the connection', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    await t.promote({ input: 'A  gentleman ', words: ['entangle', 'am'], tier: 'extended', voter: ALICE, pass: alice, on: true });
    const rows = t.db.sqlite.prepare('SELECT * FROM promotions').all();
    expect(rows).toEqual([
      {
        key: PROMOTED_KEY,
        voter: ALICE,
        input: 'A  gentleman ',
        words: 'entangle am',
        tier: 'extended',
        via: 'result',
        category: null,
        why: null,
        credit: null,
        missing: null,
        created_at: '2026-09-15T12:00:00.000Z',
      },
    ]);
    expect(JSON.stringify(t.db.sqlite.prepare('SELECT * FROM rate_limits').all())).not.toContain(IP);
  });

  it('refuses what is not a promotable anagram, without a pass, on Discoveries already, or blocked', async () => {
    const t = setup({ blocked: ['aaeeglmnnt:elan-get-man'] });
    const alice = await t.passFor(ALICE);
    const status = async (body: Record<string, unknown>) => {
      const response = await t.promote({ voter: ALICE, pass: alice, on: true, ...body });
      return [response.status, ((await response.json()) as { error?: string }).error];
    };

    expect(await status({ ...PROMOTED, words: 'entangle am' })).toEqual([400, 'bad-request']);
    expect(await status({ ...PROMOTED, words: ['Entangle', 'am'] })).toEqual([400, 'bad-request']);
    expect(await status({ ...PROMOTED, tier: 'huge' })).toEqual([400, 'bad-request']);
    expect(await status({ ...PROMOTED, input: '   ' })).toEqual([400, 'bad-request']);
    expect(await status({ ...PROMOTED, on: 'yes' })).toEqual([400, 'bad-request']);
    expect(await status({ ...PROMOTED, words: ['entangle', 'ma', 'a'] })).toEqual([400, 'not-an-anagram']);
    expect(await status({ input: 'z'.repeat(201), words: ['z'.repeat(45)], tier: 'full' })).toEqual([400, 'too-long']);
    expect(await status({ ...PROMOTED, pass: undefined })).toEqual([403, 'no-pass']);
    expect(await status({ ...PROMOTED, voter: BOB })).toEqual([403, 'no-pass']);
    expect(await status({ ...PROMOTED, words: ['elegant', 'man'] })).toEqual([409, 'published']);
    expect(await status({ ...PROMOTED, words: ['man', 'get', 'elan'] })).toEqual([403, 'blocked']);

    // An accented input folds as the search folds it.
    expect(await status({ input: 'Beyoncé', words: ['obeyence'], tier: 'full' })).toEqual([400, 'not-an-anagram']);
    expect((await t.promote({ input: 'Beyoncé', words: ['boney', 'ec'], tier: 'full', voter: ALICE, pass: alice, on: true })).status).toBe(200);

    // Taking a promotion back always works, even for an anagram published or blocked since.
    expect((await t.promote({ ...PROMOTED, words: ['elegant', 'man'], voter: ALICE, pass: alice, on: false })).status).toBe(200);
    expect((await t.promote({ ...PROMOTED, words: ['man', 'get', 'elan'], voter: ALICE, pass: alice, on: false })).status).toBe(200);
  });

  it('pauses promotions and votes apart, and keeps the check open while either is open', async () => {
    const noPromotions = setup({ promotionsOpen: 'false' });
    const pass = await noPromotions.passFor(ALICE);
    expect(pass).toMatch(/^\d{13}\./);
    expect((await noPromotions.promote({ ...PROMOTED, voter: ALICE, pass, on: true })).status).toBe(503);
    expect((await noPromotions.vote({ hit_id: HIT, voter: ALICE, pass, on: true })).status).toBe(200);
    expect((await noPromotions.promotions('aaeeglmnnt')).open).toBe(false);

    const noVotes = setup({ open: 'false' });
    const pass2 = await noVotes.passFor(ALICE);
    expect((await noVotes.vote({ hit_id: HIT, voter: ALICE, pass: pass2, on: true })).status).toBe(503);
    expect((await noVotes.promote({ ...PROMOTED, voter: ALICE, pass: pass2, on: true })).status).toBe(200);

    const neither = setup({ open: 'false', promotionsOpen: 'false' });
    const refused = await postPass(neither.post('/api/pass', { voter: ALICE, token: 'token' }), neither.env, neither.deps);
    expect(refused.status).toBe(503);
    expect(await refused.json()).toEqual({ error: 'closed', message: 'Votes and promotions are paused.' });
  });

  it('limits promotions per connection per hour, apart from votes', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    for (let i = 0; i < LIMITS.promote; i++) {
      expect((await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: i % 2 === 0 })).status).toBe(200);
    }
    expect((await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: true })).status).toBe(429);
    expect((await t.vote({ hit_id: HIT, voter: ALICE, pass: alice, on: true })).status).toBe(200);
    expect((await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: true }, '198.51.100.4')).status).toBe(200);
  });

  it('answers anything that throws with a plain 500 that names what is unavailable', async () => {
    const response = await guard(async () => {
      throw new Error('boom');
    }, 'Promotions are not available right now.');
    expect(await response.json()).toEqual({ error: 'unavailable', message: 'Promotions are not available right now.' });
  });
});
