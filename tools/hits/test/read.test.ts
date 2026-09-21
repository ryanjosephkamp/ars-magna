/**
 * `pnpm hits:read` on copies of a few hits and candidates, and what
 * `hits:enumerate` does to a candidate from before phase N when its turn comes.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { rereadCandidates } from '../src/enumerate.ts';
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
    // Spelled, the 4 would give the letters of reacherseasonfour: another record.
    expect(() => setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '4': 'spell' })).toThrow(/reacherseasonfour:titles, not reacherseason:titles/);
    expect(() => setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '4': 'year' })).toThrow(/4 cannot be read as year/);
    expect(() => setReading([hit({})], 'reacherseason:titles:as-one-searcher', { '5': 'drop' })).toThrow(/no 5 to read/);
    expect(() => setReading([hit({})], 'nope:titles:a', { '4': 'drop' })).toThrow(/no such record/);
    // Writing the same reading again changes nothing; --clear takes it back to "as before phase N".
    const same = setReading(records, 'reacherseason:titles:as-one-searcher', { '4': 'drop' });
    expect(same.changed).toBe(false);
    const cleared = setReading(records, 'reacherseason:titles:as-one-searcher', null);
    expect([cleared.from, cleared.to, cleared.changed, cleared.records[0]!.reading]).toEqual(['4:drop', null, true, undefined]);
    // A record read by the defaults keeps its id under a reading that spells the same letters; --clear would change it.
    const spelled = hit({ id: 'reacherseasonfour:titles:as-one-searcher-four', input: 'Reacher season 4', words: ['as', 'one', 'searcher', 'four'], display: 'as one searcher four', letters: 'aaceeefhnoorrssu', reading: { '4': 'spell' } });
    expect(() => setReading([spelled], spelled.id, null)).toThrow(/reacherseason:titles, not reacherseasonfour:titles/);
  });

  it('works on a candidate too, and records every item of the input', () => {
    const c = candidate({ id: 'blinkvs:titles', input: 'Blink-182 vs 2', category: 'titles', status: 'enumerated' });
    const { records } = setReading([c], 'blinkvs:titles', { '182': 'drop', '2': 'drop' });
    expect(records[0]!.reading).toEqual({ '182': 'drop', '2': 'drop' });
    expect(() => setReading([c], 'blinkvs:titles', { '182': 'drop' })).toThrow(/blinkvstwo:titles, not blinkvs:titles/);
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

describe('hits:enumerate reads a candidate from before phase N afresh', () => {
  it('re-ids a new candidate with a number by the defaults, and leaves the rest alone', () => {
    const list = [
      candidate({}),
      candidate({ id: 'sardar:titles', input: 'Sardar 2', category: 'titles', status: 'enumerated' }),
      candidate({ id: 'reacherseason:titles', input: 'Reacher season 4', category: 'titles', reading: { '4': 'drop' } }),
      candidate({ id: 'beyonce:people', input: 'Beyoncé', category: 'people' }),
      candidate({ id: 'beverlyhills:places', input: 'Beverly Hills 90210', category: 'places', notes: 'a zip' }),
    ];
    const { candidates, moved, clashes, changed } = rereadCandidates(list, '2026-09-21');
    expect(moved).toEqual([['como:companies', 'comoonethousandninehundredseven:companies']]);
    expect(clashes).toEqual([]);
    expect(changed).toBe(2);
    expect(candidates[0]).toMatchObject({ id: 'comoonethousandninehundredseven:companies', reading: { '1907': 'spell' }, notes: 're-read 2026-09-21 from como:companies' });
    // Enumerated already: untouched until requeued. Read as its hits are: untouched. No number: untouched.
    expect(candidates[1]).toEqual(list[1]);
    expect(candidates[2]).toEqual(list[2]);
    expect(candidates[3]).toEqual(list[3]);
    // A long number is dropped by default, so the letters and the id stay; the reading alone is written.
    expect(candidates[4]).toEqual({ ...list[4], reading: { '90210': 'drop' } });
  });

  it('names a clash instead of merging two candidates', () => {
    const list = [candidate({}), candidate({ id: 'comoonethousandninehundredseven:companies', input: 'Como 1907', reading: { '1907': 'spell' } })];
    const { candidates, moved, clashes, changed } = rereadCandidates(list, '2026-09-21');
    expect(moved).toEqual([]);
    expect(clashes).toEqual([['como:companies', 'comoonethousandninehundredseven:companies']]);
    expect(changed).toBe(0);
    expect(candidates).toEqual(list);
  });
});
