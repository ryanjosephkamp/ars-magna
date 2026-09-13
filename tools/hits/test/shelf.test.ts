import { describe, expect, it } from 'vitest';

import { SHELF_CAP, assess, bestJudgement, scoresOf, shelfOf, shelve, type Scores } from '../src/shelf.ts';
import type { Hit, JudgementV1, JudgementV2 } from '../src/schema.ts';
import { shelfOf as siteShelfOf, type HitRecord } from '../../../apps/web/src/hits/build.ts';

const v2 = (relation: number, reads: number): JudgementV2 => ({
  model: 'claude-sonnet-5',
  rubric_version: 'v2',
  relation,
  reads,
  tone: [],
  subjects: [],
  ...(relation >= 3 ? { justification: 'why a reader cares' } : {}),
  rationale: 'why this score',
  judged_at: '2026-09-13',
});

const v1 = (aptness: number, grammar: number, memorability = 3): JudgementV1 => ({
  model: 'claude-sonnet-5',
  rubric_version: 'v1',
  aptness,
  grammar,
  memorability,
  total: aptness + grammar + memorability,
  rationale: 'why this score',
  judged_at: '2026-09-11',
});

describe('shelves', () => {
  it('assesses every row of the shelf table', () => {
    const cases: [number, number, ReturnType<typeof assess>][] = [
      [5, 1, 'interesting'],
      [5, 3, 'interesting'],
      [4, 1, 'interesting'],
      [3, 3, 'stretch'],
      [3, 2, 'stretch'],
      [3, 1, 'near'],
      [2, 3, 'near'],
      [1, 3, 'none'],
    ];
    for (const [relation, reads, want] of cases) expect(assess({ relation, reads })).toBe(want);
  });

  it('reads rubric v1 as relation and reads', () => {
    expect(scoresOf(v1(3, 5))).toEqual({ relation: 3, reads: 3 });
    expect(scoresOf(v1(4, 4))).toEqual({ relation: 4, reads: 3 });
    expect(scoresOf(v1(4, 3))).toEqual({ relation: 4, reads: 2 });
    expect(scoresOf(v1(3, 2))).toEqual({ relation: 3, reads: 2 });
    expect(scoresOf(v1(2, 1))).toEqual({ relation: 2, reads: 1 });
    expect(scoresOf(v2(5, 2))).toEqual({ relation: 5, reads: 2 });
  });

  it('decides by the best judgement: relation, then reads', () => {
    expect(scoresOf(bestJudgement([v2(3, 3), v2(4, 1), v2(4, 2)])!)).toEqual({ relation: 4, reads: 2 });
    expect(bestJudgement([])).toBeUndefined();
  });

  it('puts a published hit on its shelf', () => {
    const hit = (status: Hit['status'], judge: Hit['judge']) => ({ status, judge });
    expect(shelfOf(hit('featured', [v2(1, 1)]))).toBe('greatest');
    expect(shelfOf(hit('accepted', []))).toBe('interesting');
    expect(shelfOf(hit('accepted', [v2(3, 3), v2(4, 1)]))).toBe('interesting');
    expect(shelfOf(hit('accepted', [v1(3, 4, 4)]))).toBe('stretch');
    // An accepted hit the judge scored below the shelves was the operator's call.
    expect(shelfOf(hit('accepted', [v2(2, 3)]))).toBe('stretch');
  });

  it('fills three slots best first, keeps the rest as alternates, and sorts near misses out', () => {
    type Row = { key: string; s: Scores };
    const rows: Row[] = [
      { key: 'a', s: { relation: 3, reads: 2 } },
      { key: 'b', s: { relation: 5, reads: 3 } },
      { key: 'c', s: { relation: 3, reads: 3 } },
      { key: 'd', s: { relation: 4, reads: 1 } },
      { key: 'e', s: { relation: 3, reads: 1 } },
      { key: 'f', s: { relation: 2, reads: 3 } },
      { key: 'g', s: { relation: 1, reads: 3 } },
    ];
    const keys = (list: Row[]) => list.map((r) => r.key);
    const all = shelve(rows, (r) => r.s, (r) => r.key);
    expect(SHELF_CAP).toBe(3);
    expect(keys(all.accepted)).toEqual(['b', 'd', 'c']);
    expect(keys(all.alternates)).toEqual(['a']);
    expect(keys(all.near)).toEqual(['e', 'f']);
    expect(keys(all.none)).toEqual(['g']);
    // Hits the input already has on a shelf take slots.
    expect(keys(shelve(rows, (r) => r.s, (r) => r.key, 2).accepted)).toEqual(['b']);
    expect(keys(shelve(rows, (r) => r.s, (r) => r.key, 5).alternates)).toEqual(['b', 'd', 'c', 'a']);
    // The result does not depend on input order.
    expect(keys(shelve([...rows].reverse(), (r) => r.s, (r) => r.key).accepted)).toEqual(['b', 'd', 'c']);
  });

  it('agrees with the site build, which repeats the rule', () => {
    const cases: Pick<Hit, 'status' | 'judge'>[] = [
      { status: 'featured', judge: [] },
      { status: 'accepted', judge: [] },
      { status: 'accepted', judge: [v2(5, 1)] },
      { status: 'accepted', judge: [v2(4, 3)] },
      { status: 'accepted', judge: [v2(3, 1), v2(3, 3)] },
      { status: 'accepted', judge: [v2(2, 3)] },
      { status: 'accepted', judge: [v1(4, 2)] },
      { status: 'accepted', judge: [v1(3, 5)] },
      { status: 'accepted', judge: [v1(3, 4), v2(4, 2)] },
    ];
    for (const c of cases) expect(siteShelfOf(c as unknown as HitRecord)).toBe(shelfOf(c));
  });
});
