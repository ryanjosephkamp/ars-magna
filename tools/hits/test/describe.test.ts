/**
 * `pnpm hits:describe` on scratch copies of the first lines of both data files.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { candidateOf } from '../src/about.ts';
import { applyAbout, changeFor, changeFromWikidata, parseDescribeArgs } from '../src/describe.ts';
import { CANDIDATES_PATH, HITS_PATH, candidateSchema, hitSchema, readJsonl, writeJsonl, type Candidate, type Hit } from '../src/schema.ts';

/** Every hit of the first input that has more than one, its candidate, a classic with no candidate line, and a few others. */
async function sampleFiles() {
  const cv = await candidateSchema();
  const hv = await hitSchema();
  const allCandidates = await readJsonl(CANDIDATES_PATH, cv);
  const allHits = await readJsonl(HITS_PATH, hv);
  const ids = new Set(allCandidates.map((c) => c.id));
  const counts = new Map<string, number>();
  for (const h of allHits) counts.set(candidateOf(h.id), (counts.get(candidateOf(h.id)) ?? 0) + 1);
  const input = [...counts].find(([id, n]) => n > 1 && ids.has(id))![0];
  const orphan = allHits.find((h) => !ids.has(candidateOf(h.id)))!;
  const picked = [...allHits.filter((h) => candidateOf(h.id) === input), orphan, ...allHits.filter((h) => candidateOf(h.id) !== input).slice(0, 3)];
  const hits: Hit[] = [...new Map(picked.map((h) => [h.id, h])).values()];
  const keep = new Set(hits.map((h) => candidateOf(h.id)));
  const candidates: Candidate[] = allCandidates.filter((c) => keep.has(c.id)).map(({ about: _a, wikipedia: _w, ...c }) => c);
  const dir = await mkdtemp(join(tmpdir(), 'ars-magna-describe-'));
  const paths = { candidates: join(dir, 'candidates.jsonl'), hits: join(dir, 'hits.jsonl') };
  await writeJsonl(paths.candidates, candidates, cv);
  await writeJsonl(paths.hits, hits.map(({ about: _a, wikipedia: _w, ...h }) => h), hv);
  return { paths, input, orphan: candidateOf(orphan.id), inputHits: hits.filter((h) => candidateOf(h.id) === input).length };
}

const lines = async (path: string) => (await readFile(path, 'utf8')).split('\n');

describe('hits:describe', () => {
  it('reads a candidate id and a sentence, and refuses what it cannot set', () => {
    expect(parseDescribeArgs(['dormitory:phrases', 'A dormitory is a building', 'of shared bedrooms.'])).toEqual({
      id: 'dormitory:phrases',
      text: 'A dormitory is a building of shared bedrooms.',
      wikidata: null,
      wikipedia: null,
    });
    expect(parseDescribeArgs(['starwars:titles', '--wikidata=Q462'])).toMatchObject({ text: null, wikidata: 'Q462' });
    expect(parseDescribeArgs(['starwars:titles', '--wikipedia=none'])).toMatchObject({ text: null, wikipedia: 'none' });
    expect(() => parseDescribeArgs([])).toThrow(/name a candidate id/);
    expect(() => parseDescribeArgs(['dormitory:phrases'])).toThrow(/give dormitory:phrases one factual sentence/);
    expect(() => parseDescribeArgs(['dormitory:phrases:dirty-room', 'A sentence.'])).toThrow(/name the input's candidate, dormitory:phrases/);
    expect(() => parseDescribeArgs(['dormitory:phrases', 'No full stop'])).toThrow(/ending with a full stop/);
    expect(() => parseDescribeArgs(['dormitory:phrases', `${'x'.repeat(200)}.`])).toThrow(/201 characters/);
    expect(() => parseDescribeArgs(['starwars:titles', 'A film.', '--wikidata=Q462'])).toThrow(/not both/);
    expect(() => parseDescribeArgs(['starwars:titles', '--wikidata=462'])).toThrow(/such as Q42/);
    expect(() => parseDescribeArgs(['starwars:titles', '--wikipedia=https://de.wikipedia.org/wiki/Star_Wars'])).toThrow(/not an English Wikipedia/);
    expect(() => parseDescribeArgs(['starwars:titles', '--force', 'A film.'])).toThrow(/unknown option --force/);
  });

  it('refuses an input with neither a candidate nor a hit, and leaves both files as they were', async () => {
    const { paths } = await sampleFiles();
    const before = [await readFile(paths.candidates, 'utf8'), await readFile(paths.hits, 'utf8')];
    await expect(applyAbout(paths, 'nosuchinput:phrases', { about: 'A sentence.' }, '2026-09-16')).rejects.toThrow(/no such candidate/);
    expect([await readFile(paths.candidates, 'utf8'), await readFile(paths.hits, 'utf8')]).toEqual(before);
  });

  it('changes the candidate line and that input’s hit lines, and nothing a second time', async () => {
    const { paths, input, inputHits } = await sampleFiles();
    const candidatesBefore = await lines(paths.candidates);
    const hitsBefore = await lines(paths.hits);
    const sentence = 'An input described for the test.';
    const result = await applyAbout(paths, input, { about: sentence, wikipedia: 'https://en.wikipedia.org/wiki/Test' }, '2026-09-16');
    expect(result).toMatchObject({ created: false, changed: true, from: { about: null, wikipedia: null }, to: { about: sentence } });
    expect(result.synced).toHaveLength(inputHits);

    const candidatesAfter = await lines(paths.candidates);
    const hitsAfter = await lines(paths.hits);
    expect(candidatesAfter).toHaveLength(candidatesBefore.length);
    expect(hitsAfter).toHaveLength(hitsBefore.length);
    expect(candidatesAfter.filter((l, i) => l !== candidatesBefore[i])).toHaveLength(1);
    const changedHits = hitsAfter.filter((l, i) => l !== hitsBefore[i]).map((l) => JSON.parse(l) as Hit);
    expect(changedHits).toHaveLength(inputHits);
    for (const h of changedHits) expect(h).toMatchObject({ about: sentence, wikipedia: 'https://en.wikipedia.org/wiki/Test' });

    expect((await applyAbout(paths, input, { about: sentence }, '2026-09-16')).changed).toBe(false);

    // Clearing the link takes it off the candidate and every copy, and keeps the sentence.
    const cleared = await applyAbout(paths, input, { wikipedia: null }, '2026-09-16');
    expect(cleared.to).toEqual({ about: sentence, wikipedia: null });
    for (const l of await lines(paths.hits)) {
      if (!l) continue;
      const h = JSON.parse(l) as Hit;
      if (candidateOf(h.id) === input) expect(h.wikipedia).toBeUndefined();
    }
  });

  it('appends a manual candidate for an input whose hits have none', async () => {
    const { paths, orphan } = await sampleFiles();
    const before = await lines(paths.candidates);
    const result = await applyAbout(paths, orphan, { about: 'A classic without a candidate line.' }, '2026-09-16');
    expect(result.created).toBe(true);
    const after = await lines(paths.candidates);
    expect(after).toHaveLength(before.length + 1);
    expect(JSON.parse(after[after.length - 2]!)).toMatchObject({
      id: orphan,
      source: 'manual',
      status: 'enumerated',
      first_seen: '2026-09-16',
      about: 'A classic without a candidate line.',
    });
    expect(result.synced.length).toBeGreaterThan(0);
  });

  it('writes the sentence and the link from a named Wikidata item, or refuses one with no usable description', async () => {
    const item = { qid: 'Q462', description: 'American epic space opera media franchise', ended: false, wikipedia: 'https://en.wikipedia.org/wiki/Star_Wars' };
    expect(changeFromWikidata('Star Wars', item)).toEqual({
      wikidata_qid: 'Q462',
      about: 'Star Wars is an American epic space opera media franchise.',
      wikipedia: 'https://en.wikipedia.org/wiki/Star_Wars',
    });
    expect(changeFromWikidata('Star Wars', { ...item, wikipedia: null }).wikipedia).toBeNull();
    expect(() => changeFromWikidata('Star Wars', { ...item, description: null })).toThrow(/write the sentence yourself/);

    const recorded = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(init?.body)).toContain(encodeURIComponent('wd:Q462'));
      return new Response(
        JSON.stringify({
          results: {
            bindings: [
              {
                item: { value: 'http://www.wikidata.org/entity/Q462' },
                description: { value: item.description },
                ended: { value: 'false' },
                sitelink: { value: item.wikipedia },
              },
            ],
          },
        }),
        { status: 200 },
      );
    }) as typeof fetch;
    const change = await changeFor({ id: 'starwars:titles', text: null, wikidata: 'Q462', wikipedia: null }, 'Star Wars', recorded);
    expect(change).toEqual(changeFromWikidata('Star Wars', item));
  });
});
