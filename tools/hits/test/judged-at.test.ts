import { describe, expect, it } from 'vitest';

import { parseJudgedAtArgs, redate } from '../src/judged-at.ts';
import type { VerdictV2 } from '../src/judge.ts';
import type { Hit, JudgementV2 } from '../src/schema.ts';

const judgement = (over: Partial<JudgementV2> = {}): JudgementV2 => ({
  model: 'claude-sonnet-5',
  rubric_version: 'v2',
  relation: 4,
  reads: 3,
  tone: [],
  subjects: [],
  rationale: 'why',
  judged_at: '2026-09-16',
  ...over,
});

const hit = (id: string, judge: JudgementV2[]): Hit => {
  const [input, category, words] = id.split(':') as [string, Hit['category'], string];
  const list = words.split('-');
  return {
    id,
    input,
    category,
    words: list,
    display: list.join(' '),
    letters: [...list.join('')].sort().join(''),
    prefilter_score: 0,
    judge,
    added: '2026-09-16',
    dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: '368bf0e4460461c985fca8bde49e4062d56c1516' },
    tier: 'common',
    tags: [],
    status: 'accepted',
  };
};

const verdict = (id: string, over: Partial<VerdictV2> = {}): VerdictV2 => ({ id, relation: 4, reads: 3, rationale: 'why', ...over });

describe('hits:judged-at', () => {
  it('dates each named hit from its queue and leaves added and every other hit alone', () => {
    const hits = [hit('macklemore:people:lack-me-more', [judgement()]), hit('unitedkingdom:places:kingdom-untied', [judgement()])];
    const { hits: next, changed, unchanged } = redate(hits, ['macklemore:people:lack-me-more'], [verdict('macklemore:people:lack-me-more')], '2026-09-15');
    expect(changed).toEqual([{ id: 'macklemore:people:lack-me-more', from: ['2026-09-16'], to: ['2026-09-15'] }]);
    expect(unchanged).toEqual([]);
    expect(next[0]!.judge[0]!.judged_at).toBe('2026-09-15');
    expect(next[0]!.added).toBe('2026-09-16');
    expect(next[1]).toBe(hits[1]);
  });

  it('takes the date a verdict carries, matching each judgement to its model', () => {
    const hits = [hit('a:phrases:b-c', [judgement(), judgement({ model: 'grok-4' })])];
    const verdicts = [verdict('a:phrases:b-c'), verdict('a:phrases:b-c', { model: 'grok-4', judged_at: '2026-09-14' })];
    const { hits: next } = redate(hits, ['a:phrases:b-c'], verdicts, '2026-09-15');
    expect(next[0]!.judge.map((j) => [j.model, j.judged_at])).toEqual([
      ['claude-sonnet-5', '2026-09-15'],
      ['grok-4', '2026-09-14'],
    ]);
  });

  it('reports a hit already dated from its queue as unchanged', () => {
    const hits = [hit('a:phrases:b-c', [judgement({ judged_at: '2026-09-15' })])];
    const { changed, unchanged, hits: next } = redate(hits, ['a:phrases:b-c'], [verdict('a:phrases:b-c')], '2026-09-15');
    expect([changed, unchanged]).toEqual([[], ['a:phrases:b-c']]);
    expect(next[0]).toBe(hits[0]);
  });

  it('refuses, naming them, ids that are not hits and hits the queue never judged', () => {
    const hits = [hit('a:phrases:b-c', [judgement()]), hit('d:phrases:e-f', [judgement()])];
    expect(() => redate(hits, ['a:phrases:b-c', 'x:phrases:y-z'], [verdict('a:phrases:b-c')], '2026-09-15')).toThrow('no such hit: x:phrases:y-z');
    expect(() => redate(hits, ['a:phrases:b-c', 'd:phrases:e-f'], [verdict('a:phrases:b-c')], '2026-09-15')).toThrow(
      'no verdict in this queue for: d:phrases:e-f',
    );
  });

  it('needs the queue and at least one id, and nothing else', () => {
    expect(parseJudgedAtArgs(['--date=2026-09-15', 'a:phrases:b-c', 'a:phrases:b-c'])).toEqual({ queue: '2026-09-15', ids: ['a:phrases:b-c'] });
    expect(() => parseJudgedAtArgs(['a:phrases:b-c'])).toThrow('--date is required');
    expect(() => parseJudgedAtArgs(['--date=2026-09-15'])).toThrow('name at least one hit id');
    expect(() => parseJudgedAtArgs(['--date=2026-09-15', '--model=x', 'a:phrases:b-c'])).toThrow('unknown option --model=x');
  });
});
