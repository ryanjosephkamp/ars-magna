/**
 * The vote API, as plain request handlers. `apps/web/functions/api/` wires
 * them to Cloudflare Pages Functions; the tests call them directly.
 *
 *   GET  /api/votes?voter=   every hit's count, and which hits this voter voted for
 *   POST /api/pass           {voter, token}: the Turnstile check, once a visit; returns a signed pass
 *   POST /api/vote           {hit_id, on, voter, pass}: casts or takes back a vote; returns the count
 *
 * Votes attach to published hit ids only. A POST must be JSON, which a page on
 * another site cannot send here without a CORS preflight this API never grants.
 */
import { HIT_ID_PATTERN, LIMITS, PASS_TTL_MS, VOTER_PATTERN, connectionKey, hourBucket, signPass, verifyPass } from './core.ts';
import { readCounts, readMine, setVote, withinLimit, type D1Database } from './store.ts';

export type Env = {
  DISCOVERIES_DB: D1Database;
  TURNSTILE_SECRET: string;
  /** Hashes connection addresses for rate limits and signs passes. */
  IP_HASH_SECRET: string;
  /** "false" pauses voting; anything else, or nothing, leaves it open. */
  VOTES_OPEN?: string;
  /** Pages' own static files, where hits.json is read from. */
  ASSETS?: { fetch(request: Request): Promise<Response> };
};

export type Deps = {
  now(): number;
  fetch(input: string, init?: RequestInit): Promise<Response>;
  /** The ids of the published hits, the only ones that take votes. */
  publishedIds(request: Request, env: Env): Promise<ReadonlySet<string>>;
};

/** What GET /api/votes returns. */
export type VotesBody = { open: boolean; counts: Record<string, number>; mine: string[] };

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

const isOpen = (env: Env): boolean => env.VOTES_OPEN !== 'false';
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
  return json({ open: isOpen(env), counts, mine } satisfies VotesBody);
}

export async function postPass(request: Request, env: Env, deps: Deps): Promise<Response> {
  if (!isOpen(env)) return refuse(503, 'closed', 'Voting is paused.');
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
    return refuse(403, 'check-failed', 'The check before voting did not pass. Try again.');
  }
  const expires = now + PASS_TTL_MS;
  return json({ pass: await signPass(env.IP_HASH_SECRET, voter, expires), expires });
}

export async function postVote(request: Request, env: Env, deps: Deps): Promise<Response> {
  if (!isOpen(env)) return refuse(503, 'closed', 'Voting is paused.');
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
  if (!(await deps.publishedIds(request, env)).has(hitId)) {
    return refuse(404, 'unknown-hit', 'That anagram is not on Discoveries.');
  }
  const connection = await connectionKey(env.IP_HASH_SECRET, ipOf(request), now);
  if (!(await withinLimit(env.DISCOVERIES_DB, `vote:${connection}`, hourBucket(now), LIMITS.vote))) {
    return refuse(429, 'too-many', 'Too many votes from this connection this hour. Try again later.');
  }
  const count = await setVote(env.DISCOVERIES_DB, hitId, voter, on, new Date(now).toISOString());
  return json({ hit_id: hitId, on, count });
}

/** Any method but POST on an endpoint that only takes POST. */
export async function onlyPost(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'method', message: 'Use POST.' }), {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Turns anything a handler throws into a plain 500, never a stack trace. */
export async function guard(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch {
    return refuse(500, 'unavailable', 'Votes are not available right now.');
  }
}

let published: { at: number; ids: ReadonlySet<string> } | null = null;

/** The live dependencies: the clock, the network, and hits.json read once every five minutes. */
export function liveDeps(): Deps {
  return {
    now: () => Date.now(),
    fetch: (input, init) => fetch(input, init),
    async publishedIds(request, env) {
      const now = Date.now();
      if (published && now - published.at < 5 * 60_000) return published.ids;
      const url = new URL('/hits.json', request.url);
      const response = await (env.ASSETS ? env.ASSETS.fetch(new Request(url)) : fetch(url));
      if (!response.ok) throw new Error(`hits.json answered ${response.status}`);
      const body = (await response.json()) as { hits: { id: string }[] };
      published = { at: now, ids: new Set(body.hits.map((h) => h.id)) };
      return published.ids;
    },
  };
}
