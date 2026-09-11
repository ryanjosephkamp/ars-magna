/**
 * The model-free half of the pipeline: prefilter rules and scoring, judge
 * batching and parsing, ingest validation and hit building. All pure, all on
 * fixtures; the engine-backed anagram check has its own test.
 */
import { describe, expect, it } from 'vitest';

import { TAG_BIT as B } from '@ars-magna/engine';

import { prefilterRow, reject, score, select, type RawRow } from '../src/prefilter.ts';
import { batches, parseVerdicts, renderBatch, rubric, type Verdict } from '../src/judge.ts';
import { buildHits, validateVerdicts } from '../src/ingest.ts';
import { hitSchema } from '../src/schema.ts';
import type { Prefiltered } from '../src/prefilter.ts';

const raw = (over: Partial<RawRow> = {}): RawRow => ({
  id: 'dormitory:phrases',
  input: 'dormitory',
  category: 'phrases',
  count: '61',
  count_is_floor: false,
  index: '3',
  sampled: false,
  words: ['room', 'dirty'],
  zipf: [130, 120],
  tiers: ['common', 'common'],
  pos: [B.noun, B.adj],
  ...over,
});

describe('prefilter', () => {
  it('names the rule that drops a row', () => {
    expect(reject(raw())).toBeNull();
    expect(reject(raw({ words: ['a', 'b', 'c', 'd', 'e'], zipf: [1, 1, 1, 1, 1], tiers: ['common', 'common', 'common', 'common', 'common'], pos: [0, 0, 0, 0, 0] }))).toBe('word count');
    expect(reject(raw({ words: ['dirty', 'ro', 'om'], zipf: [1, 1, 1], tiers: ['common', 'common', 'common'], pos: [0, 0, 0] }))).toBe('short word');
    expect(reject(raw({ words: ['papa', 'papa'], zipf: [1, 1], tiers: ['common', 'common'], pos: [0, 0] }))).toBe('repeated word');
    expect(reject(raw({ tiers: ['common', 'full'] }))).toBe('rare word');
    expect(reject(raw({ tiers: ['common', 'standard'] }))).toBe('rare word');
    expect(reject(raw({ category: 'celebrities' }))).toBe('category');
  });

  it('orders the words the way the site would and keys the hit by the multiset', () => {
    const pre = prefilterRow(raw())!;
    expect(pre.display).toBe('dirty room');
    expect(pre.id).toBe('dormitory:phrases:dirty-room');
    expect(pre.letters).toBe('dimoorrty');
    expect(pre.tier).toBe('common');
  });

  it('scores a common, well-ordered two-word phrase above a rare four-word one', () => {
    const good = score(['dirty', 'room'], [B.adj, B.noun], [130, 120]);
    const salad = score(['lar', 'outlearns', 'or', 'dorty'], [0, 0, B.conj, 0], [30, 20, 200, 10]);
    expect(good).toBeGreaterThan(salad);
  });

  it('keeps the best few per candidate and never two orderings of one multiset', () => {
    const a = prefilterRow(raw())!;
    const b = prefilterRow(raw({ words: ['dirty', 'room'], index: '9', sampled: true }))!;
    const c = prefilterRow(raw({ words: ['moody', 'trir'], zipf: [100, 10] }))!;
    const other = prefilterRow(raw({ id: 'listen:phrases', input: 'listen', words: ['silent'], zipf: [140], tiers: ['common'], pos: [B.adj] }))!;
    const kept = select([a, b, c, other], 1);
    expect(kept.map((r) => r.id).sort()).toEqual(['dormitory:phrases:dirty-room', 'listen:phrases:silent']);
  });
});

const pre = (id: string, candidate: string, display: string): Prefiltered => ({
  id: `${candidate}:${id}`,
  candidate_id: candidate,
  input: candidate.split(':')[0]!,
  category: 'phrases',
  words: display.split(' '),
  display,
  letters: [...display.replace(/ /g, '')].sort().join(''),
  prefilter_score: 1,
  tier: 'common',
  count: '10',
  index: '0',
  sampled: false,
});

describe('judge', () => {
  it('carries a version in the rubric', async () => {
    const { version, text } = await rubric();
    expect(version).toMatch(/^v\d+$/);
    expect(text).toContain('aptness');
  });

  it('batches without splitting a candidate and renders every row', () => {
    const rows = [
      pre('a-b', 'x:phrases', 'a b'),
      pre('c-d', 'x:phrases', 'c d'),
      pre('e-f', 'y:phrases', 'e f'),
      pre('g-h', 'z:phrases', 'g h'),
      pre('i-j', 'z:phrases', 'i j'),
    ];
    const split = batches(rows, 3);
    // x and y fit in one batch of three; z would push it to five, so z starts
    // the next batch whole rather than being split across two.
    expect(split.map((b) => b.map((r) => r.candidate_id))).toEqual([
      ['x:phrases', 'x:phrases', 'y:phrases'],
      ['z:phrases', 'z:phrases'],
    ]);
    expect(batches(rows, 1).map((b) => b.length)).toEqual([2, 1, 2]);
    const text = renderBatch(split[0]!, '# rubric', 1, 2);
    expect(text).toContain('id: x:phrases:a-b');
    expect(text).toContain('anagram: c d');
    expect(text).toContain('Batch 1 of 2');
  });

  it('parses JSONL out of a fenced or chatty answer', () => {
    const answer = 'Here you go:\n```jsonl\n{"id":"x","aptness":5,"grammar":4,"memorability":3,"rationale":"apt"}\n\n{"id":"y","aptness":1,"grammar":1,"memorability":1,"rationale":"salad"}\n```\n';
    expect(parseVerdicts(answer).map((v) => v.id)).toEqual(['x', 'y']);
  });
});

describe('ingest', () => {
  const batch = new Map<string, Prefiltered>([
    ['dormitory:phrases:dirty-room', { ...pre('dirty-room', 'dormitory:phrases', 'dirty room'), letters: 'dimoorrty' }],
    ['dormitory:phrases:moody-trir', pre('moody-trir', 'dormitory:phrases', 'moody trir')],
  ]);
  const good: Verdict = { id: 'dormitory:phrases:dirty-room', aptness: 5, grammar: 5, memorability: 5, rationale: 'The classic.' };

  it('rejects what the rubric does not allow', () => {
    const { ok, rejected } = validateVerdicts(
      [
        good,
        { ...good, id: 'nope' },
        { ...good, aptness: 6 },
        { ...good, id: 'dormitory:phrases:moody-trir', rationale: '  ' },
        good,
      ],
      batch,
    );
    expect(ok).toHaveLength(1);
    expect(rejected.map((r) => r.reason)).toEqual(['not in this batch', 'score outside 1-5', 'no rationale', 'duplicate verdict']);
  });

  it('builds valid proposed hits above the threshold, keeping every judge column', async () => {
    const hits = buildHits(
      batch,
      [
        good,
        { ...good, model: 'grok-4', aptness: 2 },
        { id: 'dormitory:phrases:moody-trir', aptness: 1, grammar: 2, memorability: 1, rationale: 'salad' },
      ],
      {
        model: 'claude-sonnet-5',
        version: 'v1',
        date: '2026-09-11',
        threshold: 11,
        dictionary: { repo: 'r', rev: 'a'.repeat(40) },
      },
    );
    expect(hits).toHaveLength(1);
    const hit = hits[0]!;
    expect(hit.status).toBe('proposed');
    expect(hit.judge.map((j) => [j.model, j.total])).toEqual([['claude-sonnet-5', 15], ['grok-4', 12]]);
    expect((await hitSchema())(hit)).toBe(true);
  });
});
