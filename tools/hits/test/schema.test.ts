import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readRequests } from '../src/requests.ts';
import { readAdditionWords } from '../src/settings.ts';
import {
  CANDIDATES_PATH,
  HITS_PATH,
  appendJsonl,
  candidateSchema,
  hitSchema,
  readJsonl,
  type Candidate,
  type Hit,
} from '../src/schema.ts';
import { alphagram, candidateId, hitId } from '../src/ids.ts';
import { sensesProblem } from '../src/sense.ts';
import { displayProblemFor, readFormsMap } from '../src/display.ts';

const candidate = (over: Partial<Candidate> = {}): Candidate => ({
  id: 'dormitory:phrases',
  input: 'dormitory',
  category: 'phrases',
  source: 'manual',
  first_seen: '2026-09-11',
  status: 'new',
  ...over,
});

const hit = (over: Partial<Hit> = {}): Hit => ({
  id: 'dormitory:phrases:dirty-room',
  input: 'dormitory',
  category: 'phrases',
  words: ['dirty', 'room'],
  display: 'dirty room',
  letters: 'dimoorrty',
  prefilter_score: 12,
  judge: [
    {
      model: 'claude-sonnet-5',
      rubric_version: 'v1',
      aptness: 5,
      grammar: 5,
      memorability: 5,
      total: 15,
      rationale: 'The canonical example.',
      judged_at: '2026-09-11',
    },
  ],
  added: '2026-09-11',
  dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: '368bf0e4460461c985fca8bde49e4062d56c1516' },
  tier: 'common',
  tags: [],
  status: 'proposed',
  ...over,
});

describe('ids', () => {
  it('folds accents, case, spacing and punctuation into one candidate', () => {
    expect(candidateId('Beyoncé Knowles', 'people')).toBe('beyonceknowles:people');
    expect(candidateId('beyonce knowles', 'people')).toBe(candidateId('BEYONCÉ KNOWLES', 'people'));
    expect(candidateId('Coca-Cola', 'companies')).toBe('cocacola:companies');
  });

  it('keeps the same letters apart across categories', () => {
    expect(candidateId('Kindle', 'products')).not.toBe(candidateId('Kindle', 'companies'));
  });

  it('makes a hit id from the words as a multiset', () => {
    expect(hitId('dormitory', 'phrases', ['room', 'dirty'])).toBe('dormitory:phrases:dirty-room');
    expect(hitId('dormitory', 'phrases', ['dirty', 'room'])).toBe(hitId('dormitory', 'phrases', ['room', 'dirty']));
    expect(alphagram('Dirty Room')).toBe('dimoorrty');
  });
});

describe('schemas', () => {
  it('accept the fixtures', async () => {
    expect((await candidateSchema())(candidate())).toBe(true);
    expect((await hitSchema())(hit())).toBe(true);
    expect((await hitSchema())(hit({ judge: [], status: 'accepted' }))).toBe(true);
  });

  it('reject a bad category, a missing rubric version, and an out-of-range score', async () => {
    const cv = await candidateSchema();
    const hv = await hitSchema();
    expect(cv({ ...candidate(), category: 'celebrities' } as unknown as Candidate)).toBe(false);
    expect(cv(candidate({ id: 'Dormitory:phrases' }))).toBe(false);
    const missing = hit();
    delete (missing.judge[0] as Partial<Hit['judge'][number]>).rubric_version;
    expect(hv(missing)).toBe(false);
    expect(hv(hit({ judge: [{ ...hit().judge[0]!, aptness: 6 }] }))).toBe(false);
    expect(hv(hit({ words: ['Dirty', 'room'] }))).toBe(false);
    expect(hv({ ...hit(), extra: 1 } as unknown as Hit)).toBe(false);
  });

  it('accept a rubric v2 judgement, a justification and namespaced tags, and hold v2 to its rules', async () => {
    const hv = await hitSchema();
    const v2 = {
      model: 'claude-sonnet-5',
      rubric_version: 'v2',
      relation: 5,
      reads: 3,
      tone: ['self-referential'],
      subjects: ['tv-series'],
      justification: 'Torchwood is the name of the show\'s own spin-off.',
      rationale: 'The letters spell its spin-off.',
      judged_at: '2026-09-13',
    };
    const ok = hit({ judge: [v2 as never], justification: 'Torchwood is the Doctor Who spin-off.', tags: ['greatest-candidate', 'tone:self-referential', 'subject:tv-series'] });
    expect(hv(ok), JSON.stringify(hv.errors)).toBe(true);
    const { justification: _dropped, ...bare } = v2;
    expect(hv(hit({ judge: [bare as never] }))).toBe(false);
    expect(hv(hit({ judge: [{ ...bare, relation: 2 } as never] }))).toBe(true);
    expect(hv(hit({ judge: [{ ...v2, tone: ['smug'] } as never] }))).toBe(false);
    expect(hv(hit({ judge: [{ ...v2, aptness: 5 } as never] }))).toBe(false);
    expect(hv(hit({ judge: [{ ...v2, reads: 4 } as never] }))).toBe(false);
    expect(hv(hit({ tags: ['Tone:rude'] }))).toBe(false);
    expect(hv(hit({ tags: ['tone:smug'] }))).toBe(false);
    expect(hv(hit({ tags: ['classic', 'submitted', 'alternate', 'note:the one everyone knows', 'subject:airline', 'tone:rude'] }))).toBe(true);
    expect(hv(hit({ tags: ['shelf:interesting'] }))).toBe(true);
    expect(hv(hit({ tags: ['shelf:stretch'] }))).toBe(true);
    expect(hv(hit({ tags: ['shelf:greatest'] }))).toBe(false);
    expect(hv(hit({ justification: 'x'.repeat(301) }))).toBe(false);
  });

  it('accept what an input is on a candidate and on a hit, and refuse a sentence or link that breaks the rule', async () => {
    const cv = await candidateSchema();
    const hv = await hitSchema();
    const about = 'A dormitory is a building of shared bedrooms, as at a school or college.';
    const wikipedia = 'https://en.wikipedia.org/wiki/Dormitory';
    expect(cv(candidate({ about, wikipedia })), JSON.stringify(cv.errors)).toBe(true);
    expect(hv(hit({ about, wikipedia })), JSON.stringify(hv.errors)).toBe(true);
    for (const validate of [(x: string) => cv(candidate({ about: x })), (x: string) => hv(hit({ about: x }))]) {
      expect(validate(`${'x'.repeat(200)}.`)).toBe(false);
      expect(validate('Two\nlines.')).toBe(false);
      expect(validate(' Leading space.')).toBe(false);
      expect(validate('No full stop')).toBe(false);
    }
    expect(cv(candidate({ wikipedia: 'https://en.wikipedia.org/wiki/' }))).toBe(false);
    expect(hv(hit({ wikipedia: 'https://fr.wikipedia.org/wiki/Dortoir' }))).toBe(false);
  });

  it('accept a sense for a word of a hit, and refuse one that breaks the rule', async () => {
    const hv = await hitSchema();
    const ok = hit({ senses: { room: 'Space enough to move in, as in room to breathe.' } });
    expect(hv(ok), JSON.stringify(hv.errors)).toBe(true);
    expect(hv(hit({ senses: { room: `${'x'.repeat(119)}.` } }))).toBe(true);
    expect(hv(hit({ senses: { room: `${'x'.repeat(120)}.` } }))).toBe(false);
    expect(hv(hit({ senses: { room: 'No full stop' } }))).toBe(false);
    expect(hv(hit({ senses: { room: 'Two\nlines.' } }))).toBe(false);
    expect(hv(hit({ senses: { Room: 'A capital.' } }))).toBe(false);
    expect(hv(hit({ senses: { room2: 'A digit.' } }))).toBe(false);
    expect(hv(hit({ senses: {} }))).toBe(false);
    expect(hv(hit({ senses: { room: 3 } as never }))).toBe(false);
    // The schema cannot see the words, so the key's word is checked in code.
    expect(sensesProblem(ok)).toBeNull();
    expect(sensesProblem(hit({ senses: { attic: 'Not a word of this hit.' } }))).toMatch(/attic, which is not one of its words: dirty room/);
    expect(sensesProblem(hit({}))).toBeNull();
    // A v2 judge entry records the senses it proposed, under the same rule.
    const v2 = { model: 'm', rubric_version: 'v2', relation: 4, reads: 3, tone: [], subjects: [], justification: 'A link.', rationale: 'r', judged_at: '2026-09-17' };
    expect(hv(hit({ judge: [{ ...v2, senses: { room: 'A space to move in.' } } as never] })), JSON.stringify(hv.errors)).toBe(true);
    expect(hv(hit({ judge: [{ ...v2, senses: { room: 'No full stop' } } as never] }))).toBe(false);
    expect(hv(hit({ judge: [{ ...v2, senses: {} } as never] }))).toBe(false);
    // A v2 judge entry records the display it proposed; a hit's display holds at most 200 characters.
    expect(hv(hit({ judge: [{ ...v2, display: 'Dirty room.' } as never] })), JSON.stringify(hv.errors)).toBe(true);
    expect(hv(hit({ judge: [{ ...v2, display: '' } as never] }))).toBe(false);
    expect(hv(hit({ display: 'Dirty room.' })), JSON.stringify(hv.errors)).toBe(true);
    expect(hv(hit({ display: 'd'.repeat(201) }))).toBe(false);
  });

  it('validate every committed line of both data files', async () => {
    const candidates = await readJsonl(CANDIDATES_PATH, await candidateSchema());
    const hits = await readJsonl(HITS_PATH, await hitSchema());
    const forms = await readFormsMap();
    expect(candidates.length).toBeGreaterThanOrEqual(40);
    expect(hits.length).toBeGreaterThanOrEqual(5);
    for (const c of candidates) expect(c.id).toBe(candidateId(c.input, c.category));
    for (const h of hits) {
      expect(h.id).toBe(hitId(h.input, h.category, h.words));
      expect(h.letters).toBe(alphagram(h.input));
      expect(alphagram(h.words.join(''))).toBe(h.letters);
      // The display reads exactly the words in their order, with listed forms, the allowed marks and capitals at most.
      expect(displayProblemFor(h.display, h.words, forms, { possessives: true }), `${h.id} displays "${h.display}"`).toBeNull();
      expect(sensesProblem(h)).toBeNull();
    }
  });

  it('validate every committed word request, and never one already in the vocabulary', async () => {
    // The file is hand-edited to decline a word, so CI has to read it.
    const requests = await readRequests();
    const additions = new Set(await readAdditionWords());
    const seen = new Set<string>();
    for (const r of requests) {
      expect(additions.has(r.word), `${r.word} is already an addition, so it is not a request`).toBe(false);
      expect(seen.has(r.word), `${r.word} is requested twice`).toBe(false);
      seen.add(r.word);
    }
  });
});

describe('jsonl files', () => {
  it('read, refuse a duplicate id, and append only what is new', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'hits-'));
    const path = join(dir, 'c.jsonl');
    const cv = await candidateSchema();

    await writeFile(path, `${JSON.stringify(candidate())}\n\n${JSON.stringify(candidate({ id: 'listen:phrases', input: 'listen' }))}\n`);
    expect((await readJsonl(path, cv)).map((c) => c.id)).toEqual(['dormitory:phrases', 'listen:phrases']);

    const added = await appendJsonl(path, [candidate(), candidate({ id: 'stone:phrases', input: 'stone' })], cv);
    expect(added.map((c) => c.id)).toEqual(['stone:phrases']);
    expect(await readJsonl(path, cv)).toHaveLength(3);

    await writeFile(path, `${JSON.stringify(candidate())}\n${JSON.stringify(candidate())}\n`);
    await expect(readJsonl(path, cv)).rejects.toThrow(/duplicate id/);

    await writeFile(path, `${JSON.stringify(candidate())}\nnot json\n`);
    await expect(readJsonl(path, cv)).rejects.toThrow(/:2: not JSON/);

    await writeFile(path, `${JSON.stringify({ ...candidate(), status: 'done' })}\n`);
    await expect(readJsonl(path, cv)).rejects.toThrow(/status/);
  });
});
