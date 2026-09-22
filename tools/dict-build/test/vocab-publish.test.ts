import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildDataset, missingFromDictionary, publishAddition, renderCard } from '../src/vocab-publish.ts';
import type { Addition, ClassTermLine, Form, TermClass } from '../src/vocab.ts';

const source = { repo: 'ryanjosephkamp/english-openlist', rev: '368bf0e4460461c985fca8bde49e4062d56c1516' };

const addition = (over: Partial<Addition> = {}): Addition => ({
  word: 'doomer',
  kind: 'slang',
  gloss: 'A person who believes catastrophe is inevitable.',
  trace: 'https://en.wiktionary.org/wiki/doomer',
  proposed_by: 'ryanjosephkamp',
  added: '2026-09-15',
  ...over,
});

describe('the published addition row', () => {
  it('carries the revision it was added on top of, so a row reads on its own', () => {
    expect(publishAddition(addition(), source)).toEqual({
      ...addition(),
      pinned_repo: source.repo,
      pinned_rev: source.rev,
    });
  });
});

describe('refusing to publish a stale build', () => {
  it('names every addition the committed dictionary does not carry', () => {
    const words = new Set(['doomer', 'house']);
    expect(missingFromDictionary([addition()], words)).toEqual([]);
    expect(missingFromDictionary([addition(), addition({ word: 'rizz' })], words)).toEqual(['rizz']);
  });
});

describe('the dataset folder', () => {
  it('writes a sorted word list, the additions, and a card with no placeholders left', async () => {
    const out = await mkdtemp(join(tmpdir(), 'ars-magna-vocab-ds-'));
    const files = await buildDataset({
      words: ['zebra', 'apple', 'doomer'],
      pinned: new Set(['zebra', 'apple']),
      additions: [addition()],
      source,
      out,
      datasetId: 'ryanjosephkamp/ars-magna-vocabulary',
      date: '2026-09-16',
    });
    expect(files).toEqual(['vocabulary.txt', 'additions.jsonl', 'forms.jsonl', 'symbols.jsonl', 'shorthand.jsonl', 'blends.jsonl', 'acronyms.jsonl', 'README.md']);

    // Sorted, one per line, trailing newline: a reader splits on whitespace.
    expect(await readFile(join(out, 'vocabulary.txt'), 'utf8')).toBe('apple\ndoomer\nzebra\n');

    const rows = (await readFile(join(out, 'additions.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
    expect(rows).toHaveLength(1);
    expect(rows[0].pinned_rev).toBe(source.rev);

    const card = await readFile(join(out, 'README.md'), 'utf8');
    expect(card).not.toMatch(/\{\{[A-Z_]+\}\}/);
    expect(card).toContain('| `vocabulary.txt` | 3 |');
    expect(card).toContain('| `forms.jsonl` | 0 |');
    expect(card).toContain('2 of these words come from');
    expect(card).toContain(source.rev);
    // No forms given: the file is still written, empty, so the card's config always resolves.
    expect(await readFile(join(out, 'forms.jsonl'), 'utf8')).toBe('');
    // And so is every class file.
    expect(await readFile(join(out, 'blends.jsonl'), 'utf8')).toBe('');
    expect(card).toContain('| `blends.jsonl` | 0 |');
  });

  it('writes the class files beside the words, each row with its class and the pin it was refused as a word against', async () => {
    const out = await mkdtemp(join(tmpdir(), 'ars-magna-vocab-ds-'));
    const b8: ClassTermLine = {
      term: 'b8',
      reads_as: 'bait',
      gloss: 'Text-messaging spelling of bait.',
      trace: 'https://en.wiktionary.org/wiki/b8',
      proposed_by: 'ryanjosephkamp',
      added: '2026-09-22',
    };
    const wtf: ClassTermLine = { ...b8, term: 'wtf', reads_as: 'what the fuck', gloss: 'Initialism of what the fuck.', trace: 'https://en.wiktionary.org/wiki/WTF', written: 'WTF', tone: 'crude' };
    const classes = new Map<TermClass, ClassTermLine[]>([
      ['blends', [b8]],
      ['acronyms', [wtf]],
    ]);
    await buildDataset({
      words: ['bait', 'zebra'],
      pinned: new Set(['bait', 'zebra']),
      additions: [],
      classes,
      source,
      out,
      datasetId: 'ryanjosephkamp/ars-magna-vocabulary',
      date: '2026-09-22',
    });
    const blends = (await readFile(join(out, 'blends.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
    expect(blends).toEqual([{ ...b8, class: 'blends', pinned_repo: source.repo, pinned_rev: source.rev }]);
    const acronyms = (await readFile(join(out, 'acronyms.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
    expect(acronyms[0]).toMatchObject({ term: 'wtf', class: 'acronyms', written: 'WTF', tone: 'crude' });
    expect(await readFile(join(out, 'symbols.jsonl'), 'utf8')).toBe('');
    const card = await readFile(join(out, 'README.md'), 'utf8');
    expect(card).not.toMatch(/\{\{[A-Z_]+\}\}/);
    expect(card).toContain('| `blends.jsonl` | 1 |');
    expect(card).toContain('| `acronyms.jsonl` | 1 |');
    expect(card).toContain('| `symbols.jsonl` | 0 |');
    expect(card).toContain('The 2 terms of the');
    expect(card).toContain('config_name: acronyms');
  });

  it('writes the forms beside the additions, each with the pin it sits on top of', async () => {
    const out = await mkdtemp(join(tmpdir(), 'ars-magna-vocab-ds-'));
    const form: Form = {
      form: "don't",
      letters: 'dont',
      kind: 'contraction',
      gloss: 'Contraction of do not.',
      trace: 'https://en.wiktionary.org/wiki/don%27t',
      proposed_by: 'ryanjosephkamp',
      added: '2026-09-20',
      pos: ['verb'],
    };
    await buildDataset({
      words: ['dont', 'its', 'doomer'],
      pinned: new Set(['its']),
      additions: [addition()],
      forms: [form, { ...form, form: "it's", letters: 'its', gloss: 'Contraction of it is or it has.', pos: ['pron', 'verb'] }],
      source,
      out,
      datasetId: 'ryanjosephkamp/ars-magna-vocabulary',
      date: '2026-09-20',
    });
    const rows = (await readFile(join(out, 'forms.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
    expect(rows.map((r) => [r.form, r.letters, r.pinned_rev])).toEqual([
      ["don't", 'dont', source.rev],
      ["it's", 'its', source.rev],
    ]);
    const card = await readFile(join(out, 'README.md'), 'utf8');
    expect(card).toContain('| `forms.jsonl` | 2 |');
    expect(card).toContain('Possessives are never listed');
    // A form's letters the dictionary lacks is a stale build, as an addition's word is.
    expect(missingFromDictionary([], new Set(['its']), [form])).toEqual(['dont']);
  });

  it('says English OpenList is credited rather than republished', async () => {
    const card = await renderCard({
      total: 378_845,
      pinned: 378_844,
      additions: 1,
      forms: 0,
      source,
      datasetId: 'ryanjosephkamp/ars-magna-vocabulary',
      date: '2026-09-16',
    });
    expect(card).toContain('**not** republished here and nothing');
    expect(card).toContain('378,845');
    expect(card).toContain('368bf0e');
  });
});
