/**
 * What an input is, through the pipeline: the judge's batch shows each input's
 * sentence or `(empty)`; ingest keeps the judge's sentence only for an input
 * with none, copies sentences onto new hits, and lists them in the report; a
 * submission's "What the input is" and "Why it is good" become the sentence
 * and the justification rather than a note tag.
 */
import { describe, expect, it } from 'vitest';

import { aboutsFromVerdicts, assessBatch, fromSubmission, promoteOnly, renderAbout, renderReport, type IngestOptions } from '../src/ingest.ts';
import { renderBatch, type VerdictV2 } from '../src/judge.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { candidateSchema, hitSchema, type Candidate, type Hit } from '../src/schema.ts';

const row = (candidate: string, input: string, words: string[]): Prefiltered => ({
  id: `${candidate}:${[...words].sort().join('-')}`,
  candidate_id: candidate,
  input,
  category: 'phrases',
  words,
  display: words.join(' '),
  letters: 'x',
  prefilter_score: 1,
  tier: 'common',
});
const verdict = (id: string, over: Partial<VerdictV2> = {}): VerdictV2 => ({
  id,
  relation: 4,
  reads: 3,
  tone: [],
  subjects: [],
  justification: 'A clear link.',
  rationale: 'Clear.',
  ...over,
});
const candidate = (id: string, input: string, over: Partial<Candidate> = {}): Candidate => ({
  id,
  input,
  category: 'phrases',
  source: 'manual',
  first_seen: '2026-09-11',
  status: 'new',
  ...over,
});
const dictionary = { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) };

const funeral = [row('funeral:phrases', 'Funeral', ['real', 'fun']), row('funeral:phrases', 'Funeral', ['fun', 'rale'])];
const dormitory = [row('dormitory:phrases', 'Dormitory', ['dirty', 'room'])];
const batch = new Map([...funeral, ...dormitory].map((r) => [r.id, r]));

describe('the judge’s batch', () => {
  it('says what each input is on its first row, or that it is empty, and nothing without the sentences', () => {
    const about = new Map([['dormitory:phrases', 'A dormitory is a building of shared bedrooms.']]);
    const text = renderBatch([...funeral, ...dormitory], '# rubric', 1, 1, about);
    expect(text.match(/about: \(empty\)/g)).toHaveLength(1);
    expect(text).toContain('  category: phrases\n  about: (empty)\n  anagram: real fun');
    expect(text).toContain('  about: A dormitory is a building of shared bedrooms.\n  anagram: dirty room');
    expect(text).not.toContain('about: (empty)\n  anagram: fun rale');
    expect(renderBatch(funeral, '# rubric', 1, 1)).not.toContain('about:');
  });
});

describe('the judge’s sentences', () => {
  it('keep the first sentence that follows the rule, only for an input that has none, and skip a bad one without the verdict', () => {
    const candidates = [candidate('funeral:phrases', 'Funeral'), candidate('dormitory:phrases', 'Dormitory', { about: 'A dormitory is a building.' })];
    const verdicts = [
      verdict(funeral[0]!.id, { about: 'no full stop' }),
      verdict(funeral[1]!.id, { about: 'A funeral is a ceremony for someone who has died.', model: 'claude-sonnet-5' }),
      verdict(dormitory[0]!.id, { about: 'A dormitory is somewhere else entirely.' }),
      verdict('nosuch:phrases:row', { about: 'Ignored.' }),
    ];
    const { written, skipped } = aboutsFromVerdicts(verdicts, batch, candidates, 'claude-code-session');
    expect(written).toEqual([
      { candidate: 'funeral:phrases', input: 'Funeral', text: 'A funeral is a ceremony for someone who has died.', from: 'the judge, claude-sonnet-5' },
    ]);
    expect(skipped).toEqual([{ id: funeral[0]!.id, reason: 'about: write one sentence on one line, ending with a full stop' }]);
    expect(aboutsFromVerdicts([verdict(funeral[0]!.id, { about: 42 })], batch, candidates, 'm').skipped[0]!.reason).toBe('about: not a sentence');
  });

  it('reach the hits ingest builds, from a queue and from --only, and the report lists them', async () => {
    const options: IngestOptions = {
      model: 'claude-sonnet-5',
      version: 'v2',
      date: '2026-09-16',
      queueDay: '2026-09-16',
      threshold: 11,
      dictionary,
      about: new Map([['funeral:phrases', { about: 'A funeral is a ceremony for someone who has died.', wikipedia: 'https://en.wikipedia.org/wiki/Funeral' }]]),
    };
    const { hits } = assessBatch(batch, [verdict(funeral[0]!.id), verdict(dormitory[0]!.id)], options);
    const byId = new Map(hits.map((p) => [p.hit.id, p.hit]));
    expect(byId.get(funeral[0]!.id)).toMatchObject({ about: 'A funeral is a ceremony for someone who has died.', wikipedia: 'https://en.wikipedia.org/wiki/Funeral' });
    expect(byId.get(dormitory[0]!.id)!.about).toBeUndefined();
    const validate = await hitSchema();
    for (const p of hits) expect(validate(p.hit), JSON.stringify(validate.errors)).toBe(true);

    const only = promoteOnly(batch, [verdict(funeral[1]!.id, { relation: 2 })], [funeral[1]!.id], 'accepted', options);
    expect(only.hits[0]).toMatchObject({ about: 'A funeral is a ceremony for someone who has died.' });

    const report = renderReport({
      date: '2026-09-16',
      dir: 'data/queue/2026-09-16',
      empty: false,
      read: 2,
      valid: 2,
      rejected: [],
      rubric: 'v2',
      placed: hits,
      addedIds: new Set(hits.map((p) => p.hit.id)),
      near: [],
      moved: 2,
      threshold: 11,
      about: [{ candidate: 'funeral:phrases', input: 'Funeral', text: 'A funeral is a ceremony | a rite.', from: 'the judge, claude-sonnet-5' }],
      aboutSkipped: [{ id: dormitory[0]!.id, reason: 'about: the sentence is empty' }],
    });
    expect(report).toContain('## About');
    expect(report).toContain('| funeral:phrases | Funeral | A funeral is a ceremony / a rite. | the judge, claude-sonnet-5 |');
    expect(report).toContain(`- ${dormitory[0]!.id}: about: the sentence is empty`);
    expect(renderAbout([], [])).toEqual([]);
  });
});

describe('a submission', () => {
  const parsed = {
    input: 'Dormitory',
    category: 'phrases' as const,
    words: ['dirty', 'room'],
    tier: 'common' as const,
    why: 'Students keep\nit that way.',
    about: 'A dormitory is a building of shared bedrooms.',
  };
  const context = { candidates: [] as Candidate[], hits: [] as Hit[], date: '2026-09-16', url: 'https://github.com/x/y/issues/1', credit: 'reader', dictionary };

  it('records the sentence on a new candidate and the reason as the justification, with no note tag', async () => {
    const out = fromSubmission(parsed, context);
    expect(out).toMatchObject({ newCandidate: true, newHit: true, notes: [] });
    expect(out.candidates[0]).toMatchObject({ id: 'dormitory:phrases', source: 'submission', about: 'A dormitory is a building of shared bedrooms.' });
    expect(out.hits[0]).toMatchObject({
      id: 'dormitory:phrases:dirty-room',
      tags: ['submitted'],
      justification: 'Students keep it that way.',
      about: 'A dormitory is a building of shared bedrooms.',
      submitter: 'reader',
      status: 'proposed',
    });
    expect((await candidateSchema())(out.candidates[0])).toBe(true);
    expect((await hitSchema())(out.hits[0])).toBe(true);
  });

  it('keeps a sentence the input already has, and leaves off what breaks a rule, saying how to set it', () => {
    const existing = candidate('dormitory:phrases', 'Dormitory', { about: 'A dormitory is a shared sleeping building.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' });
    const kept = fromSubmission(parsed, { ...context, candidates: [existing] });
    expect(kept.candidates[0]).toEqual(existing);
    expect(kept.hits[0]).toMatchObject({ about: 'A dormitory is a shared sleeping building.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' });
    expect(kept.notes[0]).toMatch(/already reads "A dormitory is a shared sleeping building."/);

    const bad = fromSubmission({ ...parsed, about: 'no full stop', why: 'Brilliant 🔥' }, context);
    expect(bad.candidates[0]!.about).toBeUndefined();
    expect(bad.hits[0]!.justification).toBeUndefined();
    expect(bad.notes).toEqual([
      '"What the input is" left off (write one sentence on one line, ending with a full stop); set one with pnpm hits:describe dormitory:phrases "One sentence."',
      '"Why it is good" left off (it has emoji); set a justification with pnpm hits:justify dormitory:phrases:dirty-room "One plain sentence."',
    ]);

    // An empty form field writes nothing and says nothing.
    const bare = fromSubmission({ ...parsed, about: '', why: '' }, context);
    expect(bare.notes).toEqual([]);
    expect(bare.hits[0]!.tags).toEqual(['submitted']);
  });
});
