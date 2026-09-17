/**
 * Senses through the pipeline: the judge's batch lists each word with its
 * first dictionary gloss or `no definition`; ingest refuses a verdict whose
 * senses name a word its phrase does not contain, leaves off a sense that
 * breaks the rule, writes the rest onto the hit in reading order, and lists
 * them in the report under the hit with the gloss each is read over.
 */
import { describe, expect, it } from 'vitest';

import { assessBatch, promoteOnly, renderReport, renderSenses, toJudgement, validateVerdicts, type IngestOptions } from '../src/ingest.ts';
import { renderBatch, type VerdictV2 } from '../src/judge.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { readJudgeSenses } from '../src/sense.ts';
import { hitSchema, type JudgementV2 } from '../src/schema.ts';

const row = (candidate: string, input: string, words: string[]): Prefiltered => ({
  id: `${candidate}:${[...words].sort().join('-')}`,
  candidate_id: candidate,
  input,
  category: 'people',
  words,
  display: words.join(' '),
  letters: 'x',
  prefilter_score: 1,
  tier: 'extended',
});
const verdict = (id: string, over: Partial<VerdictV2> = {}): VerdictV2 => ({
  id,
  relation: 5,
  reads: 2,
  tone: [],
  subjects: [],
  justification: 'A clear link.',
  rationale: 'Clear.',
  ...over,
});
const dictionary = { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) };

const dario = row('darioamodei:people', 'Dario Amodei', ['i', 'da', 'ai', 'doomer']);
const idea = row('darioamodei:people', 'Dario Amodei', ['idea', 'moor', 'dia']);
const batch = new Map([dario, idea].map((r) => [r.id, r]));
const glosses = new Map<string, string | null>([
  ['i', 'the person speaking or writing'],
  ['da', 'a heavy Burmese knife'],
  ['ai', 'the three-toed sloth of South America'],
  ['doomer', 'A person who believes catastrophe is inevitable.'],
  ['dia', null],
]);
const options: IngestOptions = { model: 'claude-sonnet-5', version: 'v2', date: '2026-09-17', queueDay: '2026-09-17', threshold: 11, dictionary };

describe('the judge’s batch', () => {
  it('lists each word once with its first gloss, or no definition, and nothing without the glosses', () => {
    const repeated = row('didi:phrases', 'Didi', ['di', 'di']);
    const text = renderBatch([dario, idea, repeated], '# rubric', 1, 1, undefined, glosses);
    expect(text).toContain(
      [
        '  anagram: i da ai doomer',
        '  words:',
        '    i: the person speaking or writing',
        '    da: a heavy Burmese knife',
        '    ai: the three-toed sloth of South America',
        '    doomer: A person who believes catastrophe is inevitable.',
      ].join('\n'),
    );
    expect(text).toContain('    dia: no definition');
    // A word missing from the map has no definition either, and a word used twice is listed once.
    expect(text).toContain('    moor: no definition');
    expect(text.match(/ {4}di: /g)).toHaveLength(1);
    expect(renderBatch([dario], '# rubric', 1, 1)).not.toContain('words:');
  });
});

describe('the judge’s senses', () => {
  it('are read strictly: foreign keys named, broken sentences skipped, the rest kept in reading order', () => {
    const read = readJudgeSenses({ ai: 'Artificial intelligence.', da: 'Short for the, as in casual speech.', the: 'Not here.', i: 'x'.repeat(121) + '.', doomer: 3 }, dario.words);
    expect(read.senses).toEqual({ da: 'Short for the, as in casual speech.', ai: 'Artificial intelligence.' });
    expect(Object.keys(read.senses)).toEqual(['da', 'ai']);
    expect(read.foreign).toEqual(['the']);
    expect(read.skipped).toEqual([
      { word: 'i', reason: 'the sense is 122 characters; keep it to 120' },
      { word: 'doomer', reason: 'not a sentence' },
    ]);
    expect(readJudgeSenses(undefined, dario.words)).toEqual({ senses: {}, foreign: [], skipped: [] });
    expect(readJudgeSenses(['da'], dario.words).skipped).toEqual([{ word: '', reason: 'senses is not an object keyed by word' }]);
  });

  it('refuse a verdict whose senses name a word its phrase does not contain, and keep one with a broken sentence', () => {
    const { ok, rejected } = validateVerdicts(
      [
        verdict(dario.id, { senses: { da: 'Short for the, as in casual speech.', idea: 'A thought.' } }),
        verdict(idea.id, { senses: { dia: 'no full stop' } }),
      ],
      batch,
    );
    expect(rejected).toEqual([{ id: dario.id, reason: 'senses name idea, not a word of this phrase' }]);
    expect(ok.map((v) => v.id)).toEqual([idea.id]);
    // The broken sentence costs the verdict nothing, and is not recorded.
    expect((toJudgement(ok[0]!, 'm', 'v2', '2026-09-17', idea.words) as JudgementV2).senses).toBeUndefined();
  });

  it('reach the judge entry and the hit, from a queue and from --only, and the report lists them under the hit', async () => {
    const senses = { ai: 'Artificial intelligence.', da: 'Short for the, as in casual speech.' };
    const { hits } = assessBatch(batch, [verdict(dario.id, { senses }), verdict(idea.id, { relation: 4 })], options);
    const byId = new Map(hits.map((p) => [p.hit.id, p.hit]));
    const hit = byId.get(dario.id)!;
    expect(hit.senses).toEqual({ da: 'Short for the, as in casual speech.', ai: 'Artificial intelligence.' });
    expect(Object.keys(hit.senses!)).toEqual(['da', 'ai']);
    expect((hit.judge[0] as JudgementV2).senses).toEqual(hit.senses);
    expect(byId.get(idea.id)).not.toHaveProperty('senses');
    const validate = await hitSchema();
    for (const p of hits) expect(validate(p.hit), JSON.stringify(validate.errors)).toBe(true);

    const only = promoteOnly(batch, [verdict(dario.id, { relation: 2, senses })], [dario.id], 'accepted', options);
    expect(only.hits[0]!.senses).toEqual(hit.senses);

    const report = renderReport({
      date: '2026-09-17',
      dir: 'data/queue/2026-09-17',
      empty: false,
      read: 2,
      valid: 2,
      rejected: [],
      rubric: 'v2',
      placed: hits,
      addedIds: new Set(hits.map((p) => p.hit.id)),
      near: [],
      moved: 1,
      threshold: 11,
      glosses,
      sensesSkipped: [{ id: idea.id, reason: 'senses dia: write one sentence on one line, ending with a full stop' }],
    });
    expect(report).toContain('## Senses');
    expect(report).toContain(
      [
        `- \`${dario.id}\`: Dario Amodei → i da ai doomer`,
        '  - da: Short for the, as in casual speech. (dictionary: a heavy Burmese knife)',
        '  - ai: Artificial intelligence. (dictionary: the three-toed sloth of South America)',
      ].join('\n'),
    );
    expect(report).toContain(`- ${idea.id}: senses dia: write one sentence on one line, ending with a full stop`);
    expect(report).not.toContain(`\`${idea.id}\`:`);
    expect(renderSenses([], glosses, [])).toEqual([]);
  });
});
