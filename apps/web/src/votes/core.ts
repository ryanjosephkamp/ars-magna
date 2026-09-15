/**
 * Votes on Discoveries: the rules the page and the vote API share.
 *
 * No DOM and no Workers types, so Pages Functions, the browser and the tests
 * run the same code. Web Crypto (`crypto.subtle`) is the one platform API it
 * needs, and the browser, Workers and Node all provide it.
 */

/** A voter id: a random UUID the browser makes once and keeps. */
export const VOTER_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** A hit id, as data/schema/hit.schema.json defines it. */
export const HIT_ID_PATTERN = /^[a-z]+:(people|companies|products|titles|places|phrases):[a-z]+(-[a-z]+)*$/;

/** How long a pass from the check before voting lasts: one visit. */
export const PASS_TTL_MS = 2 * 60 * 60 * 1000;

/** The most actions of each kind one connection may take in an hour. */
export const LIMITS = { vote: 120, pass: 20 } as const;

const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
  return Array.from(signature, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Equal hex strings, compared in time that does not depend on where they differ. */
function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** A pass for one voter until `expires` (milliseconds since the epoch), signed so the API stores nothing for it. */
export async function signPass(secret: string, voter: string, expires: number): Promise<string> {
  return `${expires}.${await hmac(secret, `pass|${voter}|${expires}`)}`;
}

/** Whether a pass was signed with this secret, for this voter, and is still within its visit. */
export async function verifyPass(secret: string, voter: string, pass: string, now: number): Promise<boolean> {
  const match = /^(\d{13})\.([0-9a-f]{64})$/.exec(pass);
  if (!match) return false;
  const expires = Number(match[1]);
  if (expires <= now || expires > now + PASS_TTL_MS) return false;
  return sameHex(match[2]!, await hmac(secret, `pass|${voter}|${expires}`));
}

/**
 * The key a connection's rate limits are counted under: its IP address hashed
 * with the secret and the UTC day. It changes every day, and without the
 * secret it cannot be turned back into an address.
 */
export async function connectionKey(secret: string, ip: string, now: number): Promise<string> {
  const day = new Date(now).toISOString().slice(0, 10);
  return (await hmac(secret, `ip|${day}|${ip}`)).slice(0, 32);
}

/** The UTC hour a rate-limit count belongs to, such as 2026-09-15T14. */
export function hourBucket(now: number): string {
  return new Date(now).toISOString().slice(0, 13);
}
