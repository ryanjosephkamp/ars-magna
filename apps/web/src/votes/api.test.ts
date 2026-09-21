/**
 * The vote and promotion API against SQLite in memory with the real
 * migrations, a fixed clock and a fake Turnstile.
 */
import { describe, expect, it } from 'vitest';

import { LIMITS, MAX_TYPED_LETTERS, PASS_TTL_MS, keySha256, verifyPass } from './core.ts';
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

/** "A gentleman → elegant man" is on Discover; "entangle am" is not. */
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
    blockedKeys: async () => new Set(await Promise.all((options.blocked ?? []).map(keySha256))),
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
    (await (await getPromotions(new Request(`${ORIGIN}/api/promotions?letters=${letters}${voter ? `&voter=${voter}` : ''}`), env, deps)).json()) as PromotionsBody;
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
    const unpublished = await t.vote({ hit_id: 'titanic:titles:i-intact', voter: ALICE, pass: alice, on: true });
    expect(unpublished.status).toBe(404);
    // The sentence a reader sees names the page, so a rename has to reach it.
    expect(await unpublished.json()).toEqual({ error: 'unknown-hit', message: 'That anagram is not on Discover.' });
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
        about: null,
        converted_to: null,
        reading: null,
      },
    ]);
    expect(JSON.stringify(t.db.sqlite.prepare('SELECT * FROM rate_limits').all())).not.toContain(IP);
  });

  it('refuses what is not a promotable anagram, without a pass, on Discover already, or blocked', async () => {
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
    const published = await t.promote({ ...PROMOTED, words: ['elegant', 'man'], voter: ALICE, pass: alice, on: true });
    expect(await published.json()).toEqual({ error: 'published', message: 'That anagram is on Discover already. Vote for it instead.' });
    expect(await status({ ...PROMOTED, words: ['man', 'get', 'elan'] })).toEqual([403, 'blocked']);

    // The text itself, from a search row: its own words in any order, or a re-spacing of it.
    expect(await status({ input: 'A gentleman', words: ['a', 'gentleman'], tier: 'standard' })).toEqual([400, 'text-itself']);
    expect(await status({ input: 'A gentleman', words: ['gentleman', 'a'], tier: 'standard' })).toEqual([400, 'text-itself']);
    expect(await status({ input: 'Star Wars', words: ['star', 'wars'], tier: 'standard' })).toEqual([400, 'text-itself']);
    expect(await status({ input: 'The Godfather', words: ['the', 'god', 'father'], tier: 'standard' })).toEqual([400, 'text-itself']);
    const itself = await t.promote({ input: 'Apple sauce', words: ['sauce', 'apple'], tier: 'standard', voter: ALICE, pass: alice, on: true });
    expect(await itself.json()).toEqual({ error: 'text-itself', message: 'That is the text itself, not an anagram of it.' });
    // A different spelling of the same letters is an anagram, and goes through.
    expect((await t.promote({ input: 'Apple sauce', words: ['cause', 'apple'], tier: 'standard', voter: ALICE, pass: alice, on: true })).status).toBe(200);

    // An accented input folds as the search folds it.
    expect(await status({ input: 'Beyoncé', words: ['obeyence'], tier: 'full' })).toEqual([400, 'not-an-anagram']);
    expect((await t.promote({ input: 'Beyoncé', words: ['boney', 'ec'], tier: 'full', voter: ALICE, pass: alice, on: true })).status).toBe(200);

    // A digit is a character of the pool (the literal rule): as itself by default, so the letters alone are no anagram of
    // the text; left out when `reading` says so; a reading the table does not offer is refused. Nothing is ever converted.
    expect(await status({ input: 'Reacher season 4', words: ['as', 'one', 'searcher'], tier: 'standard' })).toEqual([400, 'not-an-anagram']);
    expect(await status({ input: 'Reacher season 4', words: ['four', 'as', 'one', 'searcher'], tier: 'standard' })).toEqual([400, 'not-an-anagram']);
    expect(await status({ input: 'Reacher season 4', words: ['as', 'one', 'searcher'], tier: 'standard', reading: { '4': 'drop' } })).toEqual([200, undefined]);
    expect(await status({ input: 'Reacher season 4', words: ['as', 'one', 'searcher'], tier: 'standard', reading: { '4': 'spell' } })).toEqual([400, 'bad-reading']);
    expect(await status({ input: 'Reacher season 4', words: ['as', 'one', 'searcher'], tier: 'standard', reading: { '4': 'year' } })).toEqual([400, 'bad-reading']);
    expect(await status({ input: 'Reacher season 4', words: ['as', 'one', 'searcher'], tier: 'standard', reading: { '5': 'drop' } })).toEqual([400, 'bad-reading']);
    expect(await status({ input: 'Reacher season 4', words: ['as', 'one', 'searcher'], tier: 'standard', reading: ['4'] })).toEqual([400, 'bad-request']);
    // A leet reading is a letter: under `$` as s the letters are kesha, and the words must be words.
    expect(await status({ input: 'Ke$ha', words: ['shake'], tier: 'standard', reading: { $: 's' } })).toEqual([200, undefined]);
    expect(await status({ input: 'Ke$ha', words: ['shake'], tier: 'standard' })).toEqual([400, 'not-an-anagram']);
    // The text's own words with its digits left out are the text: "furious fast" is "2 Fast 2 Furious"; the number's name never fits.
    expect(await status({ input: '2 Fast 2 Furious', words: ['furious', 'fast'], tier: 'standard', reading: { '2': 'drop' } })).toEqual([400, 'text-itself']);
    expect(await status({ input: '2 Fast 2 Furious', words: ['furious', 'fast'], tier: 'standard' })).toEqual([400, 'not-an-anagram']);
    expect(await status({ input: '2 Fast 2 Furious', words: ['two', 'fast', 'two', 'furious'], tier: 'standard' })).toEqual([400, 'not-an-anagram']);
    expect(await status({ input: '2 Fast 2 Furious', words: ['furious', 'fast'], tier: 'standard', reading: { '2': 'too' } })).toEqual([400, 'bad-reading']);
    // What is stored is the reading of every item, defaults filled in.
    const stored = t.db.sqlite.prepare("SELECT reading FROM promotions WHERE input = 'Reacher season 4'").all() as { reading: string }[];
    expect(stored.map((r) => JSON.parse(r.reading))).toEqual([{ '4': 'drop' }]);
    expect((await t.promote({ input: 'Area 51 x', words: ['axe', 'ra'], tier: 'full', voter: ALICE, pass: alice, on: true, reading: { '5': 'drop', '1': 'drop' } })).status).toBe(200);
    const area = t.db.sqlite.prepare("SELECT reading FROM promotions WHERE input = 'Area 51 x'").all() as { reading: string }[];
    expect(area.map((r) => JSON.parse(r.reading))).toEqual([{ '5': 'drop', '1': 'drop' }]);

    // Taking a promotion back always works, even for an anagram published or blocked since.
    expect((await t.promote({ ...PROMOTED, words: ['elegant', 'man'], voter: ALICE, pass: alice, on: false })).status).toBe(200);
    expect((await t.promote({ ...PROMOTED, words: ['man', 'get', 'elan'], voter: ALICE, pass: alice, on: false })).status).toBe(200);
  });

  it('leaves a blocked anagram out of the counts, and shows the counts whole when the block list cannot be read', async () => {
    const t = setup({ blocked: [PROMOTED_KEY] });
    // Promoted before it was blocked: the rows stay, the count is not shown.
    t.db.sqlite.exec(
      "INSERT INTO promotions (key, voter, input, words, tier, via, created_at) VALUES " +
        `('${PROMOTED_KEY}', '${ALICE}', 'A gentleman', 'entangle am', 'standard', 'result', '2026-09-15T12:00:00.000Z'), ` +
        `('aaeeglmnnt:angel-meant', '${ALICE}', 'A gentleman', 'angel meant', 'standard', 'result', '2026-09-15T12:00:00.000Z'); ` +
        `INSERT INTO promotion_counts (key, count) VALUES ('${PROMOTED_KEY}', 1), ('aaeeglmnnt:angel-meant', 1);`,
    );
    expect(await t.promotions('aaeeglmnnt', ALICE)).toEqual({
      open: true,
      counts: { 'aaeeglmnnt:angel-meant': 1 },
      mine: ['aaeeglmnnt:am-entangle', 'aaeeglmnnt:angel-meant'],
    });
    expect(t.db.sqlite.prepare('SELECT COUNT(*) AS n FROM promotions').get()).toEqual({ n: 2 });

    const failing = { ...t.deps, blockedKeys: async () => Promise.reject(new Error('hits.json answered 500')) };
    const whole = (await (await getPromotions(new Request(`${ORIGIN}/api/promotions?letters=aaeeglmnnt`), t.env, failing)).json()) as PromotionsBody;
    expect(whole.counts).toEqual({ [PROMOTED_KEY]: 1, 'aaeeglmnnt:angel-meant': 1 });
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

describe('POST /api/promote with via "typed": a submission from the Build page', () => {
  const SUBMITTED = {
    ...PROMOTED,
    via: 'typed',
    category: 'phrases',
    about: '  A gentleman is a courteous man,\n as the phrase has it. ',
    why: 'It says the same thing twice.',
    credit: 'Ryan',
    missing: [],
  };
  const rows = (t: ReturnType<typeof setup>) => t.db.sqlite.prepare('SELECT * FROM promotions ORDER BY key, voter').all() as Record<string, unknown>[];

  it('keeps the note beside the promotion, tidied, and counts it as one promotion', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    const response = await t.promote({ ...SUBMITTED, voter: ALICE, pass: alice, on: true });
    expect(await response.json()).toEqual({ key: PROMOTED_KEY, on: true, count: 1 });
    expect(rows(t)).toEqual([
      {
        key: PROMOTED_KEY,
        voter: ALICE,
        input: 'A gentleman',
        words: 'entangle am',
        tier: 'standard',
        via: 'typed',
        category: 'phrases',
        why: 'It says the same thing twice.',
        credit: 'Ryan',
        missing: null,
        created_at: '2026-09-15T12:00:00.000Z',
        about: 'A gentleman is a courteous man, as the phrase has it.',
        converted_to: null,
        reading: null,
      },
    ]);
    expect(JSON.stringify(t.db.sqlite.prepare('SELECT * FROM rate_limits').all())).not.toContain(IP);
  });

  it('keeps empty notes as null and word requests as words', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    await t.promote({ ...SUBMITTED, about: '   ', why: undefined, credit: null, missing: ['am', 'am'], voter: ALICE, pass: alice, on: true });
    expect(rows(t)[0]).toMatchObject({ via: 'typed', about: null, why: null, credit: null, missing: 'am' });
  });

  it('adds the note to the same voter’s promotion from a search, and replaces it on a second submission', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    const bob = await t.passFor(BOB);
    await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: true });
    await t.promote({ ...PROMOTED, voter: BOB, pass: bob, on: true });
    t.advance(60_000);
    const noted = await t.promote({ ...SUBMITTED, voter: ALICE, pass: alice, on: true });
    expect(((await noted.json()) as { count: number }).count).toBe(2);
    await t.promote({ ...SUBMITTED, why: 'Better said.', credit: '', voter: ALICE, pass: alice, on: true });
    const [alicesRow, bobsRow] = rows(t);
    expect(alicesRow).toMatchObject({ voter: ALICE, via: 'typed', why: 'Better said.', credit: null, created_at: '2026-09-15T12:00:00.000Z' });
    expect(bobsRow).toMatchObject({ voter: BOB, via: 'result', why: null });
    expect(await t.promotions('aaeeglmnnt', ALICE)).toEqual({ open: true, counts: { [PROMOTED_KEY]: 2 }, mine: [PROMOTED_KEY] });

    // Taking it back, from Build or from a search, takes the note with it.
    expect(((await (await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: false })).json()) as { count: number }).count).toBe(1);
    expect(rows(t).map((r) => r['voter'])).toEqual([BOB]);
  });

  it('refuses a note that breaks its rules, with a sentence for the reader', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    const refusal = async (over: Record<string, unknown>) => {
      const response = await t.promote({ ...SUBMITTED, voter: ALICE, pass: alice, on: true, ...over });
      return [response.status, await response.json()];
    };
    const request = { error: 'bad-request', message: 'Send JSON with an input, its words, a tier, a category, a voter id and on.' };
    expect(await refusal({ category: undefined })).toEqual([400, request]);
    expect(await refusal({ category: 'animals' })).toEqual([400, request]);
    expect(await refusal({ why: 42 })).toEqual([400, request]);
    expect(await refusal({ missing: ['zebra'] })).toEqual([400, request]);
    expect(await refusal({ missing: 'am' })).toEqual([400, request]);
    expect(await refusal({ via: 'mailed' })).toEqual([400, { error: 'bad-request', message: 'Send JSON with an input, its words, a tier, a voter id and on.' }]);
    expect(await refusal({ about: 'a gentleman' })).toEqual([400, { error: 'about', message: 'Write what the input is as one sentence ending with a full stop.' }]);
    expect(await refusal({ about: `${'A'.repeat(210)}.` })).toEqual([400, { error: 'about', message: 'Keep what the input is to 200 characters; this is 211.' }]);
    expect(await refusal({ why: 'w'.repeat(501) })).toEqual([400, { error: 'too-long-note', message: 'Keep why it is good to 500 characters.' }]);
    expect(await refusal({ credit: 'c'.repeat(61) })).toEqual([400, { error: 'too-long-note', message: 'Keep the credit to 60 characters.' }]);
    expect(rows(t)).toEqual([]);
  });

  it('refuses the text itself, typed from Build as from a search', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    const itself = { ...SUBMITTED, input: 'Apple sauce', words: ['sauce', 'apple'] };
    const refused = await t.promote({ ...itself, voter: ALICE, pass: alice, on: true });
    expect(refused.status).toBe(400);
    expect(await refused.json()).toEqual({ error: 'text-itself', message: 'That is the text itself, not an anagram of it.' });
    // A re-spacing is the text too, and nothing was written for either.
    expect((await t.promote({ ...itself, words: ['applesauce'], voter: ALICE, pass: alice, on: true })).status).toBe(400);
    expect(rows(t)).toEqual([]);
    // Taking one back is never refused.
    expect((await t.promote({ ...itself, voter: ALICE, pass: alice, on: false })).status).toBe(200);
  });

  it('holds at most 80 letters, though a search can promote more', async () => {
    expect(MAX_TYPED_LETTERS).toBe(80);
    const t = setup();
    const alice = await t.passFor(ALICE);
    // Anagrams, not re-spacings: a promotion of the text itself is refused whatever its length.
    const long = { input: 'ab'.repeat(41), words: ['ba'.repeat(20), 'ab'.repeat(20), 'ab'], tier: 'extended' };
    const refused = await t.promote({ ...SUBMITTED, ...long, voter: ALICE, pass: alice, on: true });
    expect([refused.status, await refused.json()]).toEqual([400, { error: 'too-long', message: 'A submission holds at most 80 letters.' }]);
    expect((await t.promote({ ...long, voter: ALICE, pass: alice, on: true })).status).toBe(200);
    const eighty = { input: 'ab'.repeat(40), words: ['ba'.repeat(20), 'ab'.repeat(20)], tier: 'extended' };
    expect((await t.promote({ ...SUBMITTED, ...eighty, voter: ALICE, pass: alice, on: true })).status).toBe(200);
  });

  it('refuses what a promotion refuses: not an anagram, no pass, on Discover already', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    expect((await t.promote({ ...SUBMITTED, words: ['entangle', 'ma', 'a'], voter: ALICE, pass: alice, on: true })).status).toBe(400);
    expect((await t.promote({ ...SUBMITTED, voter: ALICE, on: true })).status).toBe(403);
    const published = await t.promote({ ...SUBMITTED, words: ['elegant', 'man'], voter: ALICE, pass: alice, on: true });
    expect([published.status, await published.json()]).toEqual([409, { error: 'published', message: 'That anagram is on Discover already. Vote for it instead.' }]);
  });

  it('pauses with promotions and says so in its own words', async () => {
    const t = setup({ promotionsOpen: 'false' });
    const alice = await t.passFor(ALICE);
    const paused = await t.promote({ ...SUBMITTED, voter: ALICE, pass: alice, on: true });
    expect([paused.status, await paused.json()]).toEqual([503, { error: 'closed', message: 'Submissions are paused.' }]);
  });

  it('counts against the hourly limit promotions share', async () => {
    const t = setup();
    const alice = await t.passFor(ALICE);
    for (let i = 0; i < LIMITS.promote; i++) {
      expect((await t.promote({ ...PROMOTED, voter: ALICE, pass: alice, on: i % 2 === 0 })).status).toBe(200);
    }
    expect((await t.promote({ ...SUBMITTED, voter: ALICE, pass: alice, on: true })).status).toBe(429);
  });
});
