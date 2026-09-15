/**
 * The votes database, through the part of Cloudflare D1's interface the API
 * uses. The tests give it SQLite in memory with the same migrations.
 */

export type D1Result<T> = { results: T[] };

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  /** Runs the statements in one transaction and returns each one's rows. */
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

/** Every hit's vote count above zero. */
export async function readCounts(db: D1Database): Promise<Record<string, number>> {
  const { results } = await db.prepare('SELECT hit_id, count FROM vote_counts WHERE count > 0').all<{ hit_id: string; count: number }>();
  return Object.fromEntries(results.map((r) => [r.hit_id, r.count]));
}

/** The hits one voter has voted for. */
export async function readMine(db: D1Database, voter: string): Promise<string[]> {
  const { results } = await db.prepare('SELECT hit_id FROM votes WHERE voter = ? ORDER BY hit_id').bind(voter).all<{ hit_id: string }>();
  return results.map((r) => r.hit_id);
}

/**
 * Casts or takes back one voter's vote for a hit and returns the hit's count.
 * Casting twice or taking back a vote never cast changes nothing. The count is
 * recounted in the same transaction, so it cannot drift from the votes.
 */
export async function setVote(db: D1Database, hitId: string, voter: string, on: boolean, at: string): Promise<number> {
  const change = on
    ? db.prepare('INSERT INTO votes (hit_id, voter, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING').bind(hitId, voter, at)
    : db.prepare('DELETE FROM votes WHERE hit_id = ? AND voter = ?').bind(hitId, voter);
  const recount = db
    .prepare(
      'INSERT INTO vote_counts (hit_id, count) VALUES (?, (SELECT COUNT(*) FROM votes WHERE hit_id = ?)) ' +
        'ON CONFLICT (hit_id) DO UPDATE SET count = excluded.count',
    )
    .bind(hitId, hitId);
  const read = db.prepare('SELECT count FROM vote_counts WHERE hit_id = ?').bind(hitId);
  const results = await db.batch<{ count: number }>([change, recount, read]);
  return results[2]?.results[0]?.count ?? 0;
}

/**
 * Counts one action against a key's hourly limit and says whether it is still
 * within it. The first action of a new hour clears the hours before it.
 */
export async function withinLimit(db: D1Database, key: string, bucket: string, limit: number): Promise<boolean> {
  const row = await db
    .prepare(
      'INSERT INTO rate_limits (key, bucket, count) VALUES (?, ?, 1) ' +
        'ON CONFLICT (key, bucket) DO UPDATE SET count = count + 1 RETURNING count',
    )
    .bind(key, bucket)
    .first<{ count: number }>();
  const count = row?.count ?? 1;
  if (count === 1) await db.prepare('DELETE FROM rate_limits WHERE bucket < ?').bind(bucket).run();
  return count <= limit;
}
