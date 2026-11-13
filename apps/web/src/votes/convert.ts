/**
 * When a promoted anagram is published, its promoters' clicks become votes
 * (voting plan R4). Deploy runs these statements against the database after
 * each upload (`apps/web/scripts/convert-promotions.ts`); no agent writes the
 * database.
 *
 * Each promotion row of a published anagram's key that has not been converted
 * gives its voter a vote for the hit and is then marked with the hit's id
 * (`converted_to`, migration 0004). Marking the row, not the key, means:
 *
 * - a vote the reader takes back afterwards is never added again;
 * - a promotion made in the minutes before the site knew the anagram was
 *   published is caught by the next deploy;
 * - running the statements twice changes nothing.
 *
 * The promotion rows are kept. Pure: it builds SQL text from published pairs,
 * whose ids and keys are checked against their patterns before they are
 * written into it.
 */
import { HIT_ID_PATTERN, KEY_PATTERN, promotionKey } from './core.ts';

/** A published hit and the promotion key its words give. */
export type Conversion = { hit_id: string; key: string };

/** What a published hit needs to be converted to: its id, words and the day it was added. */
export type PublishedHit = { id: string; words: readonly string[]; added: string; status: string };

/** The most pairs in one statement, which keeps each well under D1's 100 KB statement limit. */
export const CONVERSION_CHUNK = 200;

/**
 * One hit per published key. Two published hits can share a key, since the
 * key leaves out the input and the category: Listen and Enlist both give
 * `eilnst:silent`. The earliest added takes the votes, then the lowest id.
 * Keys in `blocked` are left out: a blocked anagram's promotions stay as
 * they are.
 */
export function conversionPairs(hits: readonly PublishedHit[], blocked: ReadonlySet<string> = new Set()): Conversion[] {
  const best = new Map<string, PublishedHit>();
  for (const hit of hits) {
    if (hit.status !== 'accepted' && hit.status !== 'featured') continue;
    const key = promotionKey(hit.words);
    if (blocked.has(key)) continue;
    const held = best.get(key);
    if (!held || hit.added < held.added || (hit.added === held.added && hit.id < held.id)) best.set(key, hit);
  }
  return [...best]
    .map(([key, hit]) => ({ hit_id: hit.id, key }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function literal(value: string, pattern: RegExp): string {
  if (!pattern.test(value)) throw new Error(`refusing to write ${JSON.stringify(value)} into SQL`);
  return `'${value}'`;
}

/**
 * The statements, in order. For each chunk of pairs: add the votes, then mark
 * the rows. Then recount every hit's votes. A run stopped part way can simply
 * be run again.
 */
export function conversionStatements(pairs: readonly Conversion[], chunk: number = CONVERSION_CHUNK): string[] {
  const out: string[] = [];
  for (let i = 0; i < pairs.length; i += chunk) {
    const values = pairs
      .slice(i, i + chunk)
      .map((p) => `(${literal(p.hit_id, HIT_ID_PATTERN)}, ${literal(p.key, KEY_PATTERN)})`)
      .join(', ');
    const pub = `WITH pub(hit_id, key) AS (VALUES ${values})`;
    out.push(
      `${pub} INSERT OR IGNORE INTO votes (hit_id, voter, created_at) ` +
        'SELECT pub.hit_id, p.voter, p.created_at FROM promotions p JOIN pub ON p.key = pub.key WHERE p.converted_to IS NULL',
    );
    out.push(
      `${pub} UPDATE promotions SET converted_to = (SELECT pub.hit_id FROM pub WHERE pub.key = promotions.key) ` +
        'WHERE converted_to IS NULL AND key IN (SELECT key FROM pub)',
    );
  }
  if (out.length > 0) {
    out.push('INSERT OR IGNORE INTO vote_counts (hit_id, count) SELECT hit_id, COUNT(*) FROM votes GROUP BY hit_id');
    out.push('UPDATE vote_counts SET count = (SELECT COUNT(*) FROM votes v WHERE v.hit_id = vote_counts.hit_id)');
  }
  return out;
}
