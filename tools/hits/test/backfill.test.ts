import { describe, expect, it } from 'vitest';

import { planBackfill, queueModels, type QueueRecord } from '../src/backfill.ts';
import type { VerdictV1 } from '../src/judge.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { hitSchema, type Candidate, type Hit } from '../src/schema.ts';

const letters = (s: string) => [...s.replace(/ /g, '')].sort().join('');

const row = (candidate: string, words: string): Prefiltered => ({
  id: `${candidate}:${words.split(' ').sort().join('-')}`,
  candidate_id: candidate,
  input: candidate.split(':')[0]!,
  category: candidate.split(':')[1] as Prefiltered['category'],
  words: words.split(' '),
  display: words,
  letters: letters(words),
  prefilter_score: 1,
  tier: 'common',
  count: '10',
  index: '0',
  sampled: false,
});

const verdict = (r: Prefiltered, aptness: number, grammar: number): VerdictV1 => ({
  id: r.id, aptness, grammar, memorability: 3, rationale: `about ${r.display}`,
});

const dictionary = { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) };
const judge = (model: string, aptness: number, grammar: number) => ({
  model, rubric_version: 'v1', aptness, grammar, memorability: 3, total: aptness + grammar + 3, rationale: 'r', judged_at: '2026-09-11',
});
const hit = (r: Prefiltered, over: Partial<Hit>): Hit => ({
  id: r.id, input: r.input, category: r.category, words: r.words, display: r.display, letters: r.letters,
  prefilter_score: 1, judge: [], added: '2026-09-11', dictionary, tier: 'common', tags: [], status: 'accepted', ...over,
});

const one = row('a:phrases', 'one');
const two = row('a:phrases', 'two');
const three = row('a:phrases', 'three');
const four = row('a:phrases', 'four');
const five = row('a:phrases', 'five');
const nine = row('a:phrases', 'nine');
const alpha = row('b:titles', 'alpha');
const beta = row('b:titles', 'beta');
const zed = row('c:phrases', 'zed');

const queues: QueueRecord[] = [
  {
    name: '2026-09-11',
    rows: [one, two, three, four, five],
    verdicts: [verdict(one, 3, 4), verdict(two, 4, 3), verdict(three, 5, 5), verdict(four, 3, 2), verdict(five, 2, 4), { ...verdict(one, 9, 9) }],
    ran: ['a:phrases'],
    judged: true,
  },
  {
    name: '2026-09-12',
    rows: [alpha, beta, one],
    verdicts: [verdict(alpha, 4, 3), verdict(beta, 3, 1), verdict(one, 3, 4)],
    ran: ['b:titles', 'a:phrases'],
    judged: true,
  },
  { name: '2026-09-13', rows: [], verdicts: [], ran: ['c:phrases'], judged: false },
];

const hits: Hit[] = [
  hit(nine, { status: 'accepted' }),
  hit(three, { status: 'retired', judge: [judge('m', 5, 5)] }),
  hit(alpha, { status: 'proposed', judge: [judge('sonnet', 4, 3)] }),
  hit(zed, { status: 'accepted', tags: ['classic'] }),
];

const candidates: Candidate[] = ['a:phrases', 'b:titles', 'c:phrases'].map((id) => ({
  id, input: id.split(':')[0]!, category: id.split(':')[1] as Candidate['category'], source: 'manual', first_seen: '2026-09-11', status: 'enumerated',
}));

const plan = (justifications: Record<string, string>, over: { hits?: Hit[]; candidates?: Candidate[] } = {}) =>
  planBackfill({
    queues,
    hits: over.hits ?? hits,
    candidates: over.candidates ?? candidates,
    justifications: new Map(Object.entries(justifications)),
    models: queueModels(queues, over.hits ?? hits),
    dictionary,
    date: '2026-09-13',
  });

describe('hits:backfill', () => {
  it('shelves old verdicts around the hits already decided, and re-places one still proposed', () => {
    const p = plan({});
    // a:phrases already has "nine" on a shelf and "three" retired: two slots, filled best first.
    // Ties on relation and reads fall back to the id.
    expect(p.shelved.map((x) => [x.hit.id, x.hit.status, x.placement])).toEqual([
      ['a:phrases:two', 'accepted', 'interesting'],
      ['b:titles:alpha', 'accepted', 'interesting'],
      ['a:phrases:one', 'accepted', 'stretch'],
    ]);
    expect(p.alternates.map((x) => [x.hit.id, x.hit.status, x.hit.tags])).toEqual([['a:phrases:four', 'proposed', ['alternate']]]);
    expect(p.near.map((n) => n.id)).toEqual(['b:titles:beta', 'a:phrases:five']);
    expect(p.hits.find((h) => h.id === 'a:phrases:three')!.status).toBe('retired');
    // The proposed hit is changed in place, not duplicated.
    expect(p.hits.filter((h) => h.id === 'b:titles:alpha')).toHaveLength(1);
    expect(p.rejected.map((r) => r.reason)).toEqual(['2026-09-11: score outside 1-5']);
    // A row seen in two queues keeps a judge from each, named by the model of a hit that came from
    // that queue ("three" for the first, "alpha" for the second) and dated by the queue.
    expect(p.hits.find((h) => h.id === 'a:phrases:one')!.judge.map((j) => [j.model, j.judged_at])).toEqual([
      ['m', '2026-09-11'],
      ['sonnet', '2026-09-12'],
    ]);
  });

  it('lists every published hit without a justification, and takes them from the file', async () => {
    const draft = plan({});
    expect(draft.missing.map((m) => m.id)).toEqual(['a:phrases:nine', 'b:titles:alpha', 'c:phrases:zed', 'a:phrases:two', 'a:phrases:one']);
    expect(draft.missing.find((m) => m.id === 'a:phrases:two')).toMatchObject({ relation: 4, reads: 2, rationale: 'about two', justification: '' });
    expect(draft.missing.find((m) => m.id === 'c:phrases:zed')).toMatchObject({ relation: null, reads: null });

    const filled = Object.fromEntries(draft.missing.map((m) => [m.id, `why ${m.display}`]));
    const done = plan({ ...filled, 'x:phrases:unknown': 'stray' });
    expect(done.missing).toEqual([]);
    expect(done.justified).toHaveLength(5);
    expect(done.unknown).toEqual(['x:phrases:unknown']);
    const validate = await hitSchema();
    for (const h of done.hits) expect(validate(h), `${h.id} ${JSON.stringify(validate.errors)}`).toBe(true);
  });

  it('records a run per judged queue on each candidate, and a second pass changes nothing', () => {
    const filled = Object.fromEntries(plan({}).missing.map((m) => [m.id, `why ${m.display}`]));
    const done = plan(filled);
    expect(done.runsAdded).toBe(3);
    expect(done.candidates.find((c) => c.id === 'a:phrases')!.runs!.map((r) => r.queue)).toEqual(['2026-09-11', '2026-09-12']);
    expect(done.candidates.find((c) => c.id === 'c:phrases')!.runs).toBeUndefined();

    const again = plan(filled, { hits: done.hits, candidates: done.candidates });
    expect(again.hits).toEqual(done.hits);
    expect(again.candidates).toEqual(done.candidates);
    expect(again.runsAdded).toBe(0);
    expect(again.justified).toEqual([]);
    expect(again.shelved).toEqual([]);
  });
});
