/**
 * `pnpm hits:input` on a copy of a few hits from data/hits.jsonl.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { applyInput, parseInputArgs, setInput } from '../src/input.ts';
import { hitSchema, writeJsonl, type Hit } from '../src/schema.ts';

const hit = (over: Partial<Hit>): Hit => ({
  id: 'bigbrother:titles:brig-bro-the',
  input: 'Big Brother 28',
  category: 'titles',
  words: ['the', 'brig', 'bro'],
  display: 'the brig bro',
  letters: 'bbeghiorrt',
  prefilter_score: 0,
  judge: [],
  added: '2026-09-13',
  dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: '368bf0e4460461c985fca8bde49e4062d56c1516' },
  tier: 'common',
  tags: [],
  status: 'featured',
  ...over,
});

describe('hits:input', () => {
  it('reads an id and the input, quoted or not', () => {
    expect(parseInputArgs(['bigbrother:titles:brig-bro-the', 'Big Brother'])).toEqual({ id: 'bigbrother:titles:brig-bro-the', input: 'Big Brother' });
    expect(parseInputArgs(['bigbrother:titles:brig-bro-the', 'Big', 'Brother'])).toEqual({ id: 'bigbrother:titles:brig-bro-the', input: 'Big Brother' });
    expect(() => parseInputArgs([])).toThrow(/name a hit id/);
    expect(() => parseInputArgs(['a:phrases:b', '  '])).toThrow(/give a:phrases:b its input/);
    expect(() => parseInputArgs(['--force', 'a:phrases:b', 'x'])).toThrow(/unknown option --force/);
  });

  it('changes how the input reads when its letters, in order, stay the same', () => {
    const { hits, from, changed } = setInput([hit({})], 'bigbrother:titles:brig-bro-the', 'Big Brother');
    expect([from, changed, hits[0]!.input, hits[0]!.id, hits[0]!.letters]).toEqual(['Big Brother 28', true, 'Big Brother', 'bigbrother:titles:brig-bro-the', 'bbeghiorrt']);
    expect(setInput([hit({})], 'bigbrother:titles:brig-bro-the', 'Big Brother 28').changed).toBe(false);
  });

  it('refuses an input that would change the id, and an unknown id', () => {
    expect(() => setInput([hit({})], 'bigbrother:titles:brig-bro-the', 'Brother Big')).toThrow(/reads as brotherbig:titles, not bigbrother:titles/);
    expect(() => setInput([hit({})], 'bigbrother:titles:brig-bro-the', 'Big Brothers')).toThrow(/would change the id/);
    expect(() => setInput([hit({})], 'nope:titles:a', 'Big Brother')).toThrow(/no such hit: nope:titles:a/);
  });

  it('rewrites only the one line, and leaves the file alone when nothing changes', async () => {
    const validator = await hitSchema();
    const other = hit({ id: 'dormitory:phrases:dirty-room', input: 'dormitory', category: 'phrases', words: ['dirty', 'room'], display: 'dirty room', letters: 'dimoorrty' });
    const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-input-')), 'hits.jsonl');
    await writeJsonl(path, [other, hit({})], validator);
    const before = await readFile(path, 'utf8');
    expect((await applyInput(path, 'bigbrother:titles:brig-bro-the', 'Big Brother')).changed).toBe(true);
    const after = await readFile(path, 'utf8');
    expect(after.split('\n')[0]).toBe(before.split('\n')[0]);
    expect(after.split('\n')[1]).toBe(before.split('\n')[1]!.replace('"input":"Big Brother 28"', '"input":"Big Brother"'));
    expect((await applyInput(path, 'bigbrother:titles:brig-bro-the', 'Big Brother')).changed).toBe(false);
    expect(await readFile(path, 'utf8')).toBe(after);
  });
});
