/**
 * The vote and promotion API, as plain request handlers.
 * `apps/web/functions/api/` wires them to Cloudflare Pages Functions; the
 * tests call them directly.
 *
 *   GET  /api/votes?voter=               every hit's count, and which hits this voter voted for
 *   POST /api/pass                       {voter, token}: the Turnstile check, once a visit; returns a signed pass
 *   POST /api/vote                       {hit_id, on, voter, pass}: casts or takes back a vote; returns the count
 *   GET  /api/promotions?letters=&voter= one set of letters' promotion counts, and which this voter promoted
 *   POST /api/promote                    {input, words, tier, on, voter, pass}: makes or takes back a promotion
 *
 * Votes attach to published hit ids only; promotions to any other anagram. A
 * POST must be JSON, which a page on another site cannot send here without a
 * CORS preflight this API never grants.
 */
import { normalizeLetters } from '@ars-magna/engine/fold';

import {
  HIT_ID_PATTERN,
  LIMITS,
  MAX_INPUT,
  MAX_LETTERS,
  MAX_WORDS,
  PASS_TTL_MS,
  VOTER_PATTERN,
  WORD_PATTERN,
  connectionKey,
  hourBucket,
  isTier,
  promotable,
  promotionKey,
  signPass,
  sortedLetters,
  verifyPass,
} from './core.ts';
import {
  readCounts,
  readMine,
  readMyPromotions,
  readPromotionCounts,
  setPromotion,
  setVote,
  withinLimit,
  type D1Database,
} from './store.ts';

export type Env = {
  DISCOVERIES_DB: D1Database;
  TURNSTILE_SECRET: string;
  /** Hashes connection addresses for rate limits and signs passes. */
  IP_HASH_SECRET: string;
  /** "false" pauses voting; anything else, or nothing, leaves it open. */
  VOTES_OPEN?: string;
  /** "false" pauses promotions; anything else, or nothing, leaves them open. */
  PROMOTIONS_OPEN?: string;
  /** Pages' own static files, where hits.json is read from. */
  ASSETS?: { fetch(request: Request): Promise<Response> };
};

/** What is on Discover: the hit ids that take votes, and their promotion keys, which take no promotions. */
export type Published = { ids: ReadonlySet<string>; keys: ReadonlySet<string> };

export type Deps = {
  now(): number;
  fetch(input: string, init?: RequestInit): Promise<Response>;
  published(request: Request, env: Env): Promise<Published>;
  /** Promotion keys that may not be promoted. The list itself lands with the review (roadmap phase F). */
  blockedKeys(request: Request, env: Env): Promise<ReadonlySet<string>>;
};

/** What GET /api/votes returns. */
export type VotesBody = { open: boolean; counts: Record<string, number>; mine: string[] };

/** What GET /api/promotions returns: counts and this voter's promotions, keyed by promotion key. */
export type PromotionsBody = { open: boolean; counts: Record<string, number>; mine: string[] };

export const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function refuse(status: number, error: string, message: string): Response {
  return json({ error, message }, status);
}

const votesOpen = (env: Env): boolean => env.VOTES_OPEN !== 'false';
const promotionsOpen = (env: Env): boolean => env.PROMOTIONS_OPEN !== 'false';
const ipOf = (request: Request): string => request.headers.get('cf-connecting-ip') ?? '';

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return null;
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Whether Cloudflare accepts a Turnstile token. Any failure to ask counts as no. */
export async function verifyTurnstile(token: string, secret: string, ip: string, fetchImpl: Deps['fetch']): Promise<boolean> {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const response = await fetchImpl(TURNSTILE_VERIFY, { method: 'POST', body: form });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: unknown };
    return result.success === true;
  } catch {
    return false;
  }
}

export async function getVotes(request: Request, env: Env): Promise<Response> {
  const voter = new URL(request.url).searchParams.get('voter');
  const counts = await readCounts(env.DISCOVERIES_DB);
  const mine = voter && VOTER_PATTERN.test(voter) ? await readMine(env.DISCOVERIES_DB, voter) : [];
  return json({ open: votesOpen(env), counts, mine } satisfies VotesBody);
}

/** The check before a visit's first vote or promotion: open while either is. */
export async function postPass(request: Request, env: Env, deps: Deps): Promise<Response> {
  if (!votesOpen(env) && !promotionsOpen(env)) return refuse(503, 'closed', 'Votes and promotions are paused.');
  const body = await readJson(request);
  const voter = body?.['voter'];
  const token = body?.['token'];
  if (typeof voter !== 'string' || !VOTER_PATTERN.test(voter) || typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return refuse(400, 'bad-request', 'Send JSON with a voter id and a Turnstile token.');
  }
  const now = deps.now();
  const connection = await connectionKey(env.IP_HASH_SECRET, ipOf(request), now);
  if (!(await withinLimit(env.DISCOVERIES_DB, `pass:${connection}`, hourBucket(now), LIMITS.pass))) {
    return refuse(429, 'too-many', 'Too many checks from this connection this hour. Try again later.');
  }
  if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET, ipOf(request), deps.fetch))) {
    return refuse(403, 'check-failed', 'The check did not pass. Try again.');
  }
  const expires = now + PASS_TTL_MS;
  return json({ pass: await signPass(env.IP_HASH_SECRET, voter, expires), expires });
}

export async function postVote(request: Request, env: Env, deps: Deps): Promise<Response> {
  if (!votesOpen(env)) return refuse(503, 'closed', 'Voting is paused.');
  const body = await readJson(request);
  const hitId = body?.['hit_id'];
  const voter = body?.['voter'];
  const on = body?.['on'];
  const pass = body?.['pass'];
  if (typeof hitId !== 'string' || !HIT_ID_PATTERN.test(hitId) || typeof voter !== 'string' || !VOTER_PATTERN.test(voter) || typeof on !== 'boolean') {
    return refuse(400, 'bad-request', 'Send JSON with a hit_id, a voter id and on.');
  }
  const now = deps.now();
  if (typeof pass !== 'string' || !(await verifyPass(env.IP_HASH_SECRET, voter, pass, now))) {
    return refuse(403, 'no-pass', 'The check before voting has expired. Vote again to renew it.');
  }
  if (!(await deps.published(request, env)).ids.has(hitId)) {
    return refuse(404, 'unknown-hit', 'That anagram is not on Discover.');
  }
  const connection = await connectionKey(env.IP_HASH_SECRET, ipOf(request), now);
  if (!(await withinLimit(env.DISCOVERIES_DB, `vote:${connection}`, hourBucket(now), LIMITS.vote))) {
    return refuse(429, 'too-many', 'Too many votes from this connection this hour. Try again later.');
  }
  const count = await setVote(env.DISCOVERIES_DB, hitId, voter, on, new Date(now).toISOString());
  return json({ hit_id: hitId, on, count });
}

export async function getPromotions(request: Request, env: Env): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const letters = params.get('letters') ?? '';
  if (!/^[a-z]+$/.test(letters) || letters.length > MAX_LETTERS) {
    return refuse(400, 'bad-request', 'Send the letters to look up, a to z.');
  }
  const sorted = sortedLetters(letters);
  const voter = params.get('voter');
  const counts = await readPromotionCounts(env.DISCOVERIES_DB, sorted);
  const mine = voter && VOTER_PATTERN.test(voter) ? await readMyPromotions(env.DISCOVERIES_DB, voter, sorted) : [];
  return json({ open: promotionsOpen(env), counts, mine } satisfies PromotionsBody);
}

export async function postPromote(request: Request, env: Env, deps: Deps): Promise<Response> {
  if (!promotionsOpen(env)) return refuse(503, 'closed', 'Promotions are paused.');
  const body = await readJson(request);
  const input = body?.['input'];
  const words = body?.['words'];
  const tier = body?.['tier'];
  const voter = body?.['voter'];
  const on = body?.['on'];
  const pass = body?.['pass'];
  if (
    typeof input !== 'string' ||
    input.trim().length === 0 ||
    input.length > MAX_INPUT ||
    !Array.isArray(words) ||
    words.length === 0 ||
    words.length > MAX_WORDS ||
    !words.every((w): w is string => typeof w === 'string' && WORD_PATTERN.test(w)) ||
    !isTier(tier) ||
    typeof voter !== 'string' ||
    !VOTER_PATTERN.test(voter) ||
    typeof on !== 'boolean'
  ) {
    return refuse(400, 'bad-request', 'Send JSON with an input, its words, a tier, a voter id and on.');
  }
  if (normalizeLetters(input).length > MAX_LETTERS) {
    return refuse(400, 'too-long', 'That input has more letters than a promotion can hold.');
  }
  if (!promotable(input, words)) {
    return refuse(400, 'not-an-anagram', 'Those words do not use exactly the letters of the input.');
  }
  const now = deps.now();
  if (typeof pass !== 'string' || !(await verifyPass(env.IP_HASH_SECRET, voter, pass, now))) {
    return refuse(403, 'no-pass', 'The check has expired. Press again to renew it.');
  }
  const key = promotionKey(words);
  // Taking a promotion back always works; making one does not for an anagram
  // already on Discover, or one that is blocked.
  if (on && (await deps.published(request, env)).keys.has(key)) {
    return refuse(409, 'published', 'That anagram is on Discover already. Vote for it instead.');
  }
  if (on && (await deps.blockedKeys(request, env)).has(key)) {
    return refuse(403, 'blocked', 'That anagram cannot be promoted.');
  }
  const connection = await connectionKey(env.IP_HASH_SECRET, ipOf(request), now);
  if (!(await withinLimit(env.DISCOVERIES_DB, `promote:${connection}`, hourBucket(now), LIMITS.promote))) {
    return refuse(429, 'too-many', 'Too many promotions from this connection this hour. Try again later.');
  }
  const count = await setPromotion(env.DISCOVERIES_DB, key, voter, on, { input, words, tier, via: 'result' }, new Date(now).toISOString());
  return json({ key, on, count });
}

/** Any method but POST on an endpoint that only takes POST. */
export async function onlyPost(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'method', message: 'Use POST.' }), {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Turns anything a handler throws into a plain 500, never a stack trace. */
export async function guard(handler: () => Promise<Response>, message = 'Votes are not available right now.'): Promise<Response> {
  try {
    return await handler();
  } catch {
    return refuse(500, 'unavailable', message);
  }
}

let published: { at: number; value: Published } | null = null;

/** Nothing is blocked until the block list lands with the review (roadmap phase F). */
const NO_BLOCKS: ReadonlySet<string> = new Set();

/** The live dependencies: the clock, the network, and hits.json read once every five minutes. */
export function liveDeps(): Deps {
  return {
    now: () => Date.now(),
    fetch: (input, init) => fetch(input, init),
    async published(request, env) {
      const now = Date.now();
      if (published && now - published.at < 5 * 60_000) return published.value;
      const url = new URL('/hits.json', request.url);
      const response = await (env.ASSETS ? env.ASSETS.fetch(new Request(url)) : fetch(url));
      if (!response.ok) throw new Error(`hits.json answered ${response.status}`);
      const body = (await response.json()) as { hits: { id: string; words: string[] }[] };
      const value: Published = { ids: new Set(body.hits.map((h) => h.id)), keys: new Set(body.hits.map((h) => promotionKey(h.words))) };
      published = { at: now, value };
      return value;
    },
    blockedKeys: async () => NO_BLOCKS,
  };
}
