import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildDataset, missingFromDictionary, publishAddition, renderCard } from '../src/vocab-publish.ts';
import type { Addition } from '../src/vocab.ts';

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
    expect(files).toEqual(['vocabulary.txt', 'additions.jsonl', 'README.md']);

    // Sorted, one per line, trailing newline: a reader splits on whitespace.
    expect(await readFile(join(out, 'vocabulary.txt'), 'utf8')).toBe('apple\ndoomer\nzebra\n');

    const rows = (await readFile(join(out, 'additions.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
    expect(rows).toHaveLength(1);
    expect(rows[0].pinned_rev).toBe(source.rev);

    const card = await readFile(join(out, 'README.md'), 'utf8');
    expect(card).not.toMatch(/\{\{[A-Z_]+\}\}/);
    expect(card).toContain('| `vocabulary.txt` | 3 |');
    expect(card).toContain('2 of these words come from');
    expect(card).toContain(source.rev);
  });

  it('says English OpenList is credited rather than republished', async () => {
    const card = await renderCard({
      total: 378_845,
      pinned: 378_844,
      additions: 1,
      source,
      datasetId: 'ryanjosephkamp/ars-magna-vocabulary',
      date: '2026-09-16',
    });
    expect(card).toContain('**not** republished here and nothing');
    expect(card).toContain('378,845');
    expect(card).toContain('368bf0e');
  });
});
