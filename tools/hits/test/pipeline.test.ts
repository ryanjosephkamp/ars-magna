/**
 * The model-free half of the pipeline: prefilter rules and scoring, judge
 * batching and parsing, ingest validation and hit building. All pure, all on
 * fixtures; the engine-backed anagram check has its own test.
 */
import { describe, expect, it } from 'vitest';

import { TAG_BIT as B } from '@ars-magna/engine';

import { perInputFlag, prefilterRow, reject, score, screenOrder, select, settleEmpty, type RawRow } from '../src/prefilter.ts';
import { batches, parseVerdicts, renderBatch, rubric, type Verdict } from '../src/judge.ts';
import { assessBatch, buildHits, renderReport, takenCounts, validateVerdicts } from '../src/ingest.ts';
import type { VerdictV2 } from '../src/judge.ts';
import type { Hit } from '../src/schema.ts';
import { hitSchema, type Candidate } from '../src/schema.ts';
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
    const common = (n: number) => ({ zipf: Array(n).fill(1), tiers: Array(n).fill('common'), pos: Array(n).fill(0) });
    expect(reject(raw())).toBeNull();
    expect(reject(raw({ words: ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'], ...common(6) }))).toBe('word count');
    expect(reject(raw({ input: 'abcdeabcdeabcde', words: ['bca', 'edc', 'bae', 'dcb', 'aed'], ...common(5) }))).toBeNull();
    expect(reject(raw({ input: 'abcdeabcdeabcde', words: ['cde', 'abc', 'eab', 'dea', 'bcd'], ...common(5) }))).toBe('identity');
    expect(reject(raw({ words: ['dirty', 'ro', 'om'], ...common(3) }))).toBe('short word');
    expect(reject(raw({ words: ['papa', 'papa'], zipf: [1, 1], tiers: ['common', 'common'], pos: [0, 0] }))).toBe('repeated word');
    expect(reject(raw({ tiers: ['common', 'full'] }))).toBe('rare word');
    expect(reject(raw({ tiers: ['common', 'standard'] }))).toBe('rare word');
    expect(reject(raw({ category: 'celebrities' }))).toBe('category');
    expect(reject(raw({ input: 'Star Wars', words: ['star', 'wars'], pos: [0, 0] }))).toBe('identity');
    expect(reject(raw({ input: 'Star Wars', words: ['wars', 'star'], pos: [0, 0] }))).toBe('identity');
    expect(reject(raw({ input: 'Star Wars', words: ['stars', 'war'], pos: [0, 0] }))).toBeNull();
    expect(reject(raw({ input: 'The Godfather', words: ['father', 'the', 'god'], zipf: [1, 1, 1], tiers: ['common', 'common', 'common'], pos: [0, 0, 0] }))).toBe('identity');
  });

  it('lets a short word through only when the allowlist names it', () => {
    const row = raw({ id: 'ashoplifter:phrases', input: 'A shoplifter', words: ['has', 'to', 'pilfer'], zipf: [150, 170, 60], tiers: ['common', 'common', 'common'], pos: [0, 0, 0] });
    expect(reject(row)).toBe('short word');
    expect(reject(row, new Set(['to']))).toBeNull();
    expect(reject(raw({ ...row, words: ['has', 'ot', 'pilfer'] }), new Set(['to']))).toBe('short word');
    expect(prefilterRow(row, new Set(['to']))!.id).toBe('ashoplifter:phrases:has-pilfer-to');
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

  it('keeps every row that passed, by input in arrival order and best-reading first, unless --per-input bounds it', () => {
    const rows = [
      prefilterRow(raw({ words: ['dirt', 'yroom'], zipf: [90, 5] }))!,
      prefilterRow(raw({ id: 'listen:phrases', input: 'listen', words: ['silent'], zipf: [1], tiers: ['common'], pos: [B.adj] }))!,
      prefilterRow(raw())!,
      prefilterRow(raw({ words: ['moody', 'trir'], zipf: [100, 10] }))!,
    ];
    const all = select(rows);
    expect(all).toHaveLength(4);
    expect(all.map((r) => r.candidate_id)).toEqual(['dormitory:phrases', 'dormitory:phrases', 'dormitory:phrases', 'listen:phrases']);
    expect(all[0]!.id).toBe('dormitory:phrases:dirty-room');
    expect(select(rows, 2).map((r) => r.candidate_id)).toEqual(['dormitory:phrases', 'dormitory:phrases', 'listen:phrases']);
  });

  it('sends anchored phrases first, then takes turns by word count, best-reading first within each', () => {
    const row = (display: string, score: number, anchor?: string): Prefiltered => ({
      ...pre(display.replace(/ /g, '-'), 'x:phrases', display),
      prefilter_score: score,
      ...(anchor ? { anchor } : {}),
    });
    const ordered = screenOrder([
      row('aa bb', 9),
      row('cc dd', 8),
      row('ee ff gg', 3),
      row('hh ii jj kk', 5),
      row('ll mm nn', 4),
      row('city oo pp', 1, 'city'),
      row('city qq rr ss', 2, 'city'),
    ]);
    expect(ordered.map((r) => r.display)).toEqual(['city qq rr ss', 'city oo pp', 'aa bb', 'll mm nn', 'hh ii jj kk', 'cc dd', 'ee ff gg']);
    expect(select(ordered, 3).map((r) => r.display)).toEqual(['city qq rr ss', 'city oo pp', 'aa bb']);
    expect(prefilterRow(raw({ anchor: 'room' }))!.anchor).toBe('room');
    expect('anchor' in prefilterRow(raw())!).toBe(false);
  });

  it('reads --per-input as a whole number or all', () => {
    expect(perInputFlag(undefined)).toBe(500);
    expect(perInputFlag('all')).toBe(Infinity);
    expect(perInputFlag('40')).toBe(40);
    expect(() => perInputFlag('0')).toThrow(/positive whole number/);
    expect(() => perInputFlag('many')).toThrow(/positive whole number/);
  });

  it('settles a candidate that ran and left nothing keepable, and only that one', () => {
    const c = (id: string, status: Candidate['status'] = 'new', notes?: string): Candidate => ({
      id, input: id.split(':')[0]!, category: 'phrases', source: 'manual', first_seen: '2026-09-11', status, ...(notes ? { notes } : {}),
    });
    const candidates = [c('empty:phrases'), c('kept:phrases'), c('notrun:phrases'), c('done:phrases', 'enumerated'), c('noted:phrases', 'new', 'Wikipedia: Noted (film)')];
    const settled = settleEmpty(candidates, new Set(['empty:phrases', 'kept:phrases', 'done:phrases', 'noted:phrases']), new Set(['kept:phrases']), '2026-09-12');
    expect(settled.map((x) => x.id)).toEqual(['empty:phrases', 'noted:phrases']);
    expect(candidates.map((x) => x.status)).toEqual(['enumerated', 'new', 'new', 'enumerated', 'enumerated']);
    expect(candidates[0]!.notes).toBe('nothing keepable 2026-09-12');
    expect(candidates[4]!.notes).toBe('Wikipedia: Noted (film); nothing keepable 2026-09-12');
    // A second pass changes nothing.
    expect(settleEmpty(candidates, new Set(['empty:phrases']), new Set(), '2026-09-13')).toEqual([]);
  });

  it('records the run on a candidate it settles', () => {
    const c: Candidate = { id: 'empty:phrases', input: 'empty', category: 'phrases', source: 'manual', first_seen: '2026-09-11', status: 'new' };
    const run = { queue: '2026-09-13', settings: 's1', rubric: 'v2', date: '2026-09-13' };
    settleEmpty([c], new Set([c.id]), new Set(), '2026-09-13', run);
    expect(c.runs).toEqual([run]);
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
    expect(text).toContain('relation');
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
    expect(hit.judge.map((j) => [j.model, 'total' in j ? j.total : null])).toEqual([['claude-sonnet-5', 15], ['grok-4', 12]]);
    expect((await hitSchema())(hit)).toBe(true);
  });
});

describe('ingest under rubric v2', () => {
  const rows = ['b-c', 'd-e', 'f-g', 'h-i', 'j-k', 'l-m', 'n-o'].map((id) => pre(id, 'x:phrases', id.replace('-', ' ')));
  const batch = new Map(rows.map((r) => [r.id, r]));
  const v = (id: string, relation: number, reads: number, over: Partial<VerdictV2> = {}): VerdictV2 => ({
    id: `x:phrases:${id}`,
    relation,
    reads,
    tone: [],
    subjects: [],
    ...(relation >= 3 ? { justification: `about ${id}` } : {}),
    rationale: 'why',
    ...over,
  });
  const verdicts = [
    v('b-c', 5, 3, { tone: ['self-referential'], subjects: ['film'] }),
    v('d-e', 4, 2),
    v('f-g', 3, 3),
    v('h-i', 3, 2),
    v('j-k', 3, 1),
    v('l-m', 2, 3),
    v('n-o', 1, 1),
  ];
  const options = { model: 'claude-sonnet-5', version: 'v2', date: '2026-09-13', threshold: 11, dictionary: { repo: 'r', rev: 'a'.repeat(40) } };

  it('rejects what rubric v2 does not allow', () => {
    const { ok, rejected } = validateVerdicts(
      [
        verdicts[0]!,
        { ...verdicts[1]!, relation: 6 },
        { ...verdicts[2]!, reads: 4 },
        { ...verdicts[3]!, justification: ' ' },
        { ...verdicts[4]!, tone: ['smug'] },
        { ...verdicts[5]!, subjects: ['Film Star'] },
        { ...verdicts[6]!, rationale: '' },
      ],
      batch,
    );
    expect(ok.map((x) => x.id)).toEqual(['x:phrases:b-c']);
    expect(rejected.map((r) => r.reason)).toEqual(['relation outside 1-5', 'reads outside 1-3', 'no justification', 'unknown tone', 'bad subject', 'no rationale']);
    expect(validateVerdicts([{ ...verdicts[0]!, justification: 'x'.repeat(301) }], batch).rejected[0]!.reason).toBe('justification over 300 characters');
  });

  it('shelves three per input, proposes the rest as alternates, and keeps near misses out of the file', async () => {
    const { hits, near } = assessBatch(batch, verdicts, options);
    expect(hits.map((p) => [p.hit.id, p.hit.status, p.placement])).toEqual([
      ['x:phrases:b-c', 'accepted', 'interesting'],
      ['x:phrases:d-e', 'accepted', 'interesting'],
      ['x:phrases:f-g', 'accepted', 'stretch'],
      ['x:phrases:h-i', 'proposed', 'alternate'],
    ]);
    expect(hits[0]!.hit).toMatchObject({ justification: 'about b-c', tags: ['greatest-candidate', 'tone:self-referential', 'subject:film'] });
    expect(hits[3]!.hit.tags).toEqual(['alternate']);
    expect(near.map((n) => [n.id, n.relation, n.reads])).toEqual([['x:phrases:j-k', 3, 1], ['x:phrases:l-m', 2, 3]]);
    const validate = await hitSchema();
    for (const p of hits) expect(validate(p.hit), JSON.stringify(validate.errors)).toBe(true);

    // An input that already has two hits on a shelf has one slot left.
    const later = assessBatch(batch, verdicts, { ...options, taken: new Map([['x:phrases', 2]]) });
    expect(later.hits.filter((p) => p.hit.status === 'accepted').map((p) => p.hit.id)).toEqual(['x:phrases:b-c']);
    expect(later.hits.filter((p) => p.placement === 'alternate')).toHaveLength(3);
  });

  it('leaves a phrase already in the file alone, without spending a slot on it', () => {
    // The input already has b-c on a shelf; judging b-c again must not place it twice.
    const again = assessBatch(batch, verdicts, { ...options, taken: new Map([['x:phrases', 1]]), existing: new Set(['x:phrases:b-c']) });
    expect(again.hits.map((p) => [p.hit.id, p.hit.status])).toEqual([
      ['x:phrases:d-e', 'accepted'],
      ['x:phrases:f-g', 'accepted'],
      ['x:phrases:h-i', 'proposed'],
    ]);
  });

  it('counts the hits each input already has on a shelf', () => {
    const hit = (id: string, status: Hit['status']) => ({ id, status }) as Hit;
    const taken = takenCounts([hit('x:phrases:a', 'accepted'), hit('x:phrases:b', 'featured'), hit('x:phrases:c', 'proposed'), hit('y:titles:d', 'retired')]);
    expect([...taken]).toEqual([['x:phrases', 2]]);
  });

  it('reports by shelf and says what a merge accepts', () => {
    const assessed = assessBatch(batch, verdicts, options);
    const text = renderReport({
      date: '2026-09-13',
      dir: 'data/queue/2026-09-13',
      empty: false,
      read: 7,
      valid: 7,
      rejected: [],
      rubric: 'v2',
      placed: assessed.hits,
      addedIds: new Set(assessed.hits.map((p) => p.hit.id)),
      near: assessed.near,
      moved: 1,
      threshold: 11,
    });
    expect(text).toContain('Hits: 4 new in data/hits.jsonl (3 accepted, 1 alternate proposed) · 2 near misses kept in judge-output.jsonl');
    expect(text).toContain('Merging this pull request accepts every hit under Interesting and A stretch.');
    for (const heading of ['## Interesting', '## A stretch', '## Alternates', '## Near misses']) expect(text).toContain(heading);
    expect(text).toContain('| 5, flagged for Greatest Hits | 3 | x | b c | about b-c |');
    expect(text).toContain('| 3 | 2 | x:phrases:h-i | h i | about h-i |');
    expect(text).toContain('| 2 | 3 | x | l m | why |');
  });
});
