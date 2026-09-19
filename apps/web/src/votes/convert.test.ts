/**
 * Promotions become votes when their anagram is published (R4): the SQL Deploy
 * runs, against SQLite in memory with every migration applied.
 */
import { describe, expect, it } from 'vitest';

import { CONVERSION_CHUNK, conversionPairs, conversionStatements, type PublishedHit } from './convert.ts';
import { memoryD1 } from './testing.ts';

const ALICE = '0b6a1f3e-8d2c-4c1a-9f5e-2b7d6c4a1e90';
const BOB = '7c2e4a10-3b5d-4e6f-8a9b-0c1d2e3f4a5b';
const CAROL = '5d9f1b2c-6a7e-4f80-9b1c-2d3e4f5a6b7c';

const hit = (id: string, words: string[], added = '2026-09-20', status = 'accepted'): PublishedHit => ({ id, words, added, status });

function setup() {
  const db = memoryD1();
  const promote = (key: string, voter: string, at = '2026-09-19T10:00:00.000Z') =>
    db.sqlite
      .prepare("INSERT INTO promotions (key, voter, input, words, tier, via, created_at) VALUES (?, ?, 'A gentleman', 'entangle am', 'standard', 'result', ?)")
      .run(key, voter, at);
  const run = (statements: string[]) => {
    for (const sql of statements) db.sqlite.exec(sql);
  };
  const votes = () => db.sqlite.prepare('SELECT hit_id, voter, created_at FROM votes ORDER BY hit_id, voter').all();
  const counts = () => Object.fromEntries((db.sqlite.prepare('SELECT hit_id, count FROM vote_counts').all() as { hit_id: string; count: number }[]).map((r) => [r.hit_id, r.count]));
  return { db, promote, run, votes, counts };
}

describe('promotions become votes', () => {
  const KEY = 'aaeeglmnnt:am-entangle';
  const HIT = 'agentleman:phrases:am-entangle';

  it('gives each promoter a vote for the published hit, dated from the promotion, and recounts', () => {
    const t = setup();
    t.promote(KEY, ALICE);
    t.promote(KEY, BOB, '2026-09-19T11:00:00.000Z');
    t.promote('dimoorrty:dirty-room', CAROL);
    t.run(conversionStatements(conversionPairs([hit(HIT, ['entangle', 'am'])])));
    expect(t.votes()).toEqual([
      { hit_id: HIT, voter: ALICE, created_at: '2026-09-19T10:00:00.000Z' },
      { hit_id: HIT, voter: BOB, created_at: '2026-09-19T11:00:00.000Z' },
    ]);
    expect(t.counts()).toEqual({ [HIT]: 2 });
    // The promotion rows stay, marked with the hit their votes went to; an unpublished anagram's are untouched.
    expect(t.db.sqlite.prepare('SELECT key, voter, converted_to FROM promotions ORDER BY key, voter').all()).toEqual([
      { key: KEY, voter: ALICE, converted_to: HIT },
      { key: KEY, voter: BOB, converted_to: HIT },
      { key: 'dimoorrty:dirty-room', voter: CAROL, converted_to: null },
    ]);
  });

  it('changes nothing when run again, never adds back a vote taken back, and catches a late promotion', () => {
    const t = setup();
    const statements = conversionStatements(conversionPairs([hit(HIT, ['entangle', 'am'])]));
    t.promote(KEY, ALICE);
    t.run(statements);
    t.run(statements);
    expect(t.counts()).toEqual({ [HIT]: 1 });
    // Alice takes her vote back; Bob promotes before the site knew it was published.
    t.db.sqlite.exec(`DELETE FROM votes WHERE voter = '${ALICE}'; UPDATE vote_counts SET count = 0`);
    t.promote(KEY, BOB);
    t.run(statements);
    expect(t.votes()).toEqual([{ hit_id: HIT, voter: BOB, created_at: '2026-09-19T10:00:00.000Z' }]);
    expect(t.counts()).toEqual({ [HIT]: 1 });
  });

  it('keeps a vote the reader already cast, so no one counts twice', () => {
    const t = setup();
    t.promote(KEY, ALICE);
    t.db.sqlite.exec(`INSERT INTO votes (hit_id, voter, created_at) VALUES ('${HIT}', '${ALICE}', '2026-09-21T00:00:00.000Z')`);
    t.run(conversionStatements(conversionPairs([hit(HIT, ['entangle', 'am'])])));
    expect(t.votes()).toEqual([{ hit_id: HIT, voter: ALICE, created_at: '2026-09-21T00:00:00.000Z' }]);
    expect(t.counts()).toEqual({ [HIT]: 1 });
  });

  it('gives a key two published hits share to the earliest added, then the lowest id, and skips blocked and unpublished ones', () => {
    const pairs = conversionPairs([
      hit('listen:phrases:silent', ['silent'], '2026-09-14'),
      hit('enlist:phrases:silent', ['silent'], '2026-09-14'),
      hit('tinsel:phrases:silent', ['silent'], '2026-09-12', 'proposed'),
      hit(HIT, ['entangle', 'am'], '2026-09-20', 'featured'),
      hit('dormitory:phrases:dirty-room', ['dirty', 'room']),
    ], new Set(['dimoorrty:dirty-room']));
    expect(pairs).toEqual([
      { hit_id: HIT, key: KEY },
      { hit_id: 'enlist:phrases:silent', key: 'eilnst:silent' },
    ]);
  });

  it('writes statements in chunks, and refuses anything that is not an id or a key', () => {
    const many = Array.from({ length: CONVERSION_CHUNK + 1 }, (_, i) => ({ hit_id: `a${'b'.repeat(i)}:phrases:x`, key: `x:${'b'.repeat(i + 1)}` }));
    expect(conversionStatements(many)).toHaveLength(2 * 2 + 2);
    expect(conversionStatements([])).toEqual([]);
    expect(() => conversionStatements([{ hit_id: "x:phrases:a'); DROP TABLE votes; --", key: 'a:a' }])).toThrow(/refusing to write/);
    for (const sql of conversionStatements(many)) expect(sql.length).toBeLessThan(100_000);
  });
});
