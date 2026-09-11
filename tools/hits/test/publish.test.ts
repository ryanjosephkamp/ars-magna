import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildDataset, configs, publishable } from '../src/publish.ts';
import { hitSchema, type Hit } from '../src/schema.ts';

const hit = (over: Partial<Hit>): Hit => ({
  id: 'dormitory:phrases:dirty-room',
  input: 'dormitory',
  category: 'phrases',
  words: ['dirty', 'room'],
  display: 'dirty room',
  letters: 'dimoorrty',
  prefilter_score: 0,
  judge: [],
  added: '2026-09-11',
  dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) },
  tier: 'common',
  tags: [],
  status: 'accepted',
  ...over,
});

const hits: Hit[] = [
  hit({}),
  hit({ id: 'starwars:titles:stars-war', input: 'Star Wars', category: 'titles', words: ['stars', 'war'], display: 'stars war', letters: 'aarrsstw', status: 'featured' }),
  hit({ id: 'kindle:products:linked', input: 'Kindle', category: 'products', words: ['linked'], display: 'linked', letters: 'deikln', status: 'proposed' }),
  hit({ id: 'listen:phrases:silent', input: 'listen', words: ['silent'], display: 'silent', letters: 'eilnst', status: 'retired' }),
];

describe('publish', () => {
  it('publishes accepted and featured hits only', () => {
    expect(publishable(hits).map((h) => h.id)).toEqual(['dormitory:phrases:dirty-room', 'starwars:titles:stars-war']);
  });

  it('builds one config per category plus all, each holding only its own rows', () => {
    const built = configs(hits);
    expect(built.map((c) => c.name)).toEqual(['all', 'people', 'companies', 'products', 'titles', 'places', 'phrases']);
    expect(built[0]!.rows).toHaveLength(2);
    expect(built.find((c) => c.name === 'titles')!.rows.map((h) => h.id)).toEqual(['starwars:titles:stars-war']);
    expect(built.find((c) => c.name === 'products')!.rows).toHaveLength(0);
    for (const c of built.slice(1)) expect(c.rows.every((h) => h.category === c.name)).toBe(true);
  });

  it('writes the files and a card whose counts and configs match', async () => {
    const out = await mkdtemp(join(tmpdir(), 'hits-dataset-'));
    const files = await buildDataset({
      hits,
      out,
      dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: 'b'.repeat(40) },
      rubricVersion: 'v1',
      datasetId: 'someone/some-hits',
      date: '2026-09-11',
    });
    expect(files).toEqual(['all.jsonl', 'people.jsonl', 'companies.jsonl', 'products.jsonl', 'titles.jsonl', 'places.jsonl', 'phrases.jsonl', 'README.md']);

    const validate = await hitSchema();
    const all = (await readFile(join(out, 'all.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as Hit);
    expect(all).toHaveLength(2);
    for (const row of all) expect(validate(row)).toBe(true);
    expect(await readFile(join(out, 'products.jsonl'), 'utf8')).toBe('');

    const card = await readFile(join(out, 'README.md'), 'utf8');
    expect(card).toContain('config_name: titles\n    data_files: titles.jsonl');
    expect(card).toContain('| `all` | Every published hit. | 2 |');
    expect(card).toContain('| `titles` |');
    expect(card).toContain('bbbbbbbbbbbb');
    expect(card).toContain('load_dataset("someone/some-hits", "people")');
    expect(card).toContain('- 2026-09-11: 2 rows across 6 categories');

    // A second build keeps the earlier changelog entry.
    await buildDataset({ hits, out, dictionary: { repo: 'r', rev: 'c'.repeat(40) }, rubricVersion: 'v1', datasetId: 'someone/some-hits', date: '2026-09-12' });
    const again = await readFile(join(out, 'README.md'), 'utf8');
    expect(again).toContain('- 2026-09-12:');
    expect(again).toContain('- 2026-09-11:');
  });
});
