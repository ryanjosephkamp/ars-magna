/**
 * `pnpm hits:read` on copies of a few hits and candidates, and what
 * `hits:enumerate` does to a candidate from before phase N when its turn comes.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseReadArgs, setReading } from '../src/read.ts';
import { hitSchema, writeJsonl, type Candidate, type Hit } from '../src/schema.ts';

const hit = (over: Partial<Hit>): Hit => ({
  id: 'reacherseason:titles:as-one-searcher',
  input: 'Reacher season 4',
  category: 'titles',
  words: ['as', 'one', 'searcher'],
  display: 'as one searcher',
  letters: 'aaceeehnorrss',
  prefilter_score: 0,
  judge: [],
  added: '2026-09-13',
  dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: '368bf0e4460461c985fca8bde49e4062d56c1516' },
  tier: 'common',
  tags: [],
  status: 'accepted',
  ...over,
});

const candidate = (over: Partial<Candidate>): Candidate => ({
  id: 'como:companies',
  input: 'Como 1907',
  category: 'companies',
  source: 'trending',
  first_seen: '2026-09-11',
  status: 'new',
  ...over,
});

describe('hits:read', () => {
  it('reads an id and a reading, or --clear', () => {
    expect(parseReadArgs(['sardar:titles:radars', '2:drop'])).toEqual({ id: 'sardar:titles:radars', reading: { '2': 'drop' } });
    expect(parseReadArgs(['x:titles', '182:digits', '2:too'])).toEqual({ id: 'x:titles', reading: { '182': 'digits', '2': 'too' } });
    expect(parseReadArgs(['x:titles', '--clear'])).toEqual({ id: 'x:titles', reading: null });
    expect(() => parseReadArgs([])).toThrow(/name a hit or candidate id/);
    expect(() => parseReadArgs(['x:titles'])).toThrow(/give x:titles a reading/);
    expect(() => parseReadArgs(['x:titles', '4'])).toThrow(/item:name/);
    expect(() => parseReadArgs(['x:titles', '4:drop', '--clear'])).toThrow(/not both/);
    expect(() => parseReadArgs(['x:titles', '--force'])).toThrow(/unknown option --force/);
  });

  it('writes the reading a record was made with, and refuses one that changes the id', () => {
    // The hit from before phase N: its 4 was dropped, so 4:drop keeps its id and letters.
    const { records, from, to, changed } = setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '4': 'drop' });
    expect([from, to, changed]).toEqual([null, '4:drop', true]);
    expect(records[0]!.reading).toEqual({ '4': 'drop' });
    expect(records[0]!.id).toBe('reacherseason:titles:as-one-searcher');
    // Nothing is converted: a reading that would spell the 4 is one the table does not offer.
    expect(() => setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '4': 'spell' })).toThrow(/4 cannot be read as spell/);
    expect(() => setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '4': 'year' })).toThrow(/4 cannot be read as year/);
    expect(() => setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '5': 'drop' })).toThrow(/no 5 to read/);
    expect(() => setReading([hit({})], 'nope:titles:a', { '4': 'drop' })).toThrow(/no such record/);
    // Writing the same reading again changes nothing; --clear takes it back to "as before phase N".
    const same = setReading(records, 'reacherseason:titles:as-one-searcher', { '4': 'drop' });
    expect(same.changed).toBe(false);
    const cleared = setReading(records, 'reacherseason:titles:as-one-searcher', null);
    expect([cleared.from, cleared.to, cleared.changed, cleared.records[0]!.reading]).toEqual(['4:drop', null, true, undefined]);
    // A record made on 2026-09-21 under the withdrawn s5 rule keeps the id it was made with; a reading cannot be set or cleared on it, since either changes the id.
    const spelled = hit({ id: 'reacherseasonfour:titles:as-one-searcher-four', input: 'Reacher season 4', words: ['as', 'one', 'searcher', 'four'], display: 'as one searcher four', letters: 'aaceeefhnoorrssu', reading: { '4': 'spell' } });
    expect(() => setReading([spelled], spelled.id, null)).toThrow(/reacherseason:titles, not reacherseasonfour:titles/);
    expect(() => setReading([spelled], spelled.id, { '4': 'drop' })).toThrow(/reacherseason:titles, not reacherseasonfour:titles/);
  });

  it('works on a candidate too, and records every item of the input', () => {
    const c = candidate({ id: 'blink182vs2:titles', input: 'Blink-182 vs 2', category: 'titles', status: 'enumerated' });
    // Naming one item fills the rest in with the default, as itself.
    const { records } = setReading([c], 'blink182vs2:titles', { '1': 'self' });
    expect(records[0]!.reading).toEqual({ '1': 'self', '8': 'self', '2': 'self' });
    // A reading that leaves a character out, or reads it as a letter, changes the letters and so the id: refused.
    expect(() => setReading([c], 'blink182vs2:titles', { '1': 'drop' })).toThrow(/blink82vs2:titles, not blink182vs2:titles/);
    expect(() => setReading([c], 'blink182vs2:titles', { '8': 'b' })).toThrow(/blink1b2vs2:titles, not blink182vs2:titles/);
    // A reading the table does not offer is refused, and so is a run: an item is one character.
    expect(() => setReading([c], 'blink182vs2:titles', { '1': 'digits' })).toThrow(/1 cannot be read as digits/);
    expect(() => setReading([c], 'blink182vs2:titles', { '182': 'drop' })).toThrow(/the input has no 182 to read/);
    // A record made with a leet reading keeps it.
    const kesha = candidate({ id: 'kesha:people', input: 'Ke$ha', category: 'people', status: 'enumerated', reading: { $: 's' } });
    expect(setReading([kesha], 'kesha:people', { $: 's' }).changed).toBe(false);
    expect(() => setReading([kesha], 'kesha:people', { $: 'self' })).toThrow(/ke\$ha:people, not kesha:people/);
  });

  it('rewrites only the one line', async () => {
    const validator = await hitSchema();
    const other = hit({ id: 'dormitory:phrases:dirty-room', input: 'dormitory', category: 'phrases', words: ['dirty', 'room'], display: 'dirty room', letters: 'dimoorrty' });
    const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-read-')), 'hits.jsonl');
    await writeJsonl(path, [other, hit({})], validator);
    const before = await readFile(path, 'utf8');
    const { records } = setReading([other, hit({})], 'reacherseason:titles:as-one-searcher', { '4': 'drop' });
    await writeJsonl(path, records, validator);
    const after = await readFile(path, 'utf8');
    expect(after.split('\n')[0]).toBe(before.split('\n')[0]);
    expect(after.split('\n')[1]).toContain('"reading":{"4":"drop"}');
  });
});
