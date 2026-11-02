/**
 * `pnpm hits:sense` on a copy of the first hits in data/hits.jsonl.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { SENSE_MAX, applySense, parseSenseArgs, senseProblem, setSense } from '../src/sense.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit } from '../src/schema.ts';

async function sampleFile() {
  const validator = await hitSchema();
  const hits = (await readJsonl(HITS_PATH, validator)).slice(0, 4).map((h) => {
    const { senses: _none, ...rest } = h;
    return rest;
  });
  const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-sense-')), 'hits.jsonl');
  await writeJsonl(path, hits, validator);
  return { path, hits };
}

describe('hits:sense', () => {
  it('reads an id, a word and the sentence or --clear, and refuses what it cannot set', () => {
    expect(parseSenseArgs(['a:phrases:b', 'da', 'Short for the.'])).toEqual({ id: 'a:phrases:b', word: 'da', text: 'Short for the.' });
    expect(parseSenseArgs(['a:phrases:b', 'DA', 'Unquoted', 'words.'])).toEqual({ id: 'a:phrases:b', word: 'da', text: 'Unquoted words.' });
    expect(parseSenseArgs(['a:phrases:b', 'da', '--clear'])).toEqual({ id: 'a:phrases:b', word: 'da', text: null });
    expect(() => parseSenseArgs([])).toThrow(/name a hit id and one of its words/);
    expect(() => parseSenseArgs(['a:phrases:b'])).toThrow(/name a hit id and one of its words/);
    expect(() => parseSenseArgs(['a:phrases:b', 'da'])).toThrow(/give da in a:phrases:b a sense/);
    expect(() => parseSenseArgs(['a:phrases:b', 'da', `${'x'.repeat(SENSE_MAX)}.`])).toThrow(/121 characters; keep it to 120/);
    expect(() => parseSenseArgs(['a:phrases:b', 'da', 'No full stop'])).toThrow(/ending with a full stop/);
    expect(() => parseSenseArgs(['a:phrases:b', 'da', 'A sentence.', '--clear'])).toThrow(/not both/);
    expect(() => parseSenseArgs(['a:phrases:b', 'd-a', 'A sentence.'])).toThrow(/lowercase letters only/);
    expect(() => parseSenseArgs(['--force', 'a:phrases:b', 'da', 'A sentence.'])).toThrow(/unknown option --force/);
    expect(senseProblem(`${'x'.repeat(SENSE_MAX - 1)}.`)).toBeNull();
    expect(senseProblem('')).toBe('the sense is empty');
  });

  it('refuses an unknown id and a word that is not the hit\'s, and leaves the file as it was', async () => {
    const { path, hits } = await sampleFile();
    const before = await readFile(path, 'utf8');
    await expect(applySense(path, 'nosuch:phrases:hit', 'room', 'A sentence.')).rejects.toThrow(/no such hit/);
    const foreign = 'zzzz';
    await expect(applySense(path, hits[1]!.id, foreign, 'A sentence.')).rejects.toThrow(
      new RegExp(`zzzz is not a word of ${hits[1]!.id}; its words are ${hits[1]!.words.join(' ')}`),
    );
    expect(await readFile(path, 'utf8')).toBe(before);
  });

  it('changes exactly one line, and nothing when the sentence is the same', async () => {
    const { path, hits } = await sampleFile();
    const word = hits[2]!.words[0]!;
    const before = (await readFile(path, 'utf8')).split('\n');
    const result = await applySense(path, hits[2]!.id, word, 'A reading this anagram uses.');
    expect(result).toMatchObject({ changed: true, from: null });
    const after = (await readFile(path, 'utf8')).split('\n');
    expect(after).toHaveLength(before.length);
    expect(after.filter((line, i) => line !== before[i])).toHaveLength(1);
    expect(JSON.parse(after[2]!).senses).toEqual({ [word]: 'A reading this anagram uses.' });
    expect((await applySense(path, hits[2]!.id, word, 'A reading this anagram uses.')).changed).toBe(false);
  });

  it('keeps senses in reading order, and removes the field with the last one cleared', () => {
    const hit = { id: 'darioamodei:people:ai-da-doomer-i', words: ['i', 'da', 'ai', 'doomer'] } as Hit;
    let { hits } = setSense([hit], hit.id, 'ai', 'Artificial intelligence.');
    ({ hits } = setSense(hits, hit.id, 'da', 'Short for the, as in casual speech.'));
    expect(Object.keys(hits[0]!.senses!)).toEqual(['da', 'ai']);
    const cleared = setSense(hits, hit.id, 'da', null);
    expect(cleared).toMatchObject({ changed: true, from: 'Short for the, as in casual speech.' });
    expect(cleared.hits[0]!.senses).toEqual({ ai: 'Artificial intelligence.' });
    const none = setSense(cleared.hits, hit.id, 'ai', null);
    expect(none.hits[0]).not.toHaveProperty('senses');
    // Clearing a sense a word does not have changes nothing.
    expect(setSense(none.hits, hit.id, 'ai', null).changed).toBe(false);
  });
});
