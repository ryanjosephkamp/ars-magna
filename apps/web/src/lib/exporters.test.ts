import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, type Query } from '@ars-magna/engine';
import { crc32, createZip } from './zip.ts';
import {
  buildBlob,
  fileStem,
  toCsv,
  toJson,
  toTxt,
  type ExportInput,
} from './exporters.ts';

const query = (overrides: Partial<Query> = {}): Query => ({
  input: 'dormitory',
  ...DEFAULT_QUERY,
  ...overrides,
});

const input = (overrides: Partial<ExportInput> = {}): ExportInput => ({
  query: query(),
  letters: 'dimoorrty',
  total: '3',
  rows: [['dormitory'], ['dirty', 'room'], ['moor', 'dirty']],
  generatedAt: new Date('2026-08-10T12:00:00Z'),
  ...overrides,
});

describe('toTxt', () => {
  it('writes one anagram per line and nothing else', () => {
    expect(toTxt(input())).toBe('dormitory\ndirty room\nmoor dirty\n');
  });

  it('stays parseable when the list is empty', () => {
    expect(toTxt(input({ rows: [] }))).toBe('\n');
  });
});

describe('toJson', () => {
  it('keeps words as arrays rather than flattening the spaces away', () => {
    const parsed = JSON.parse(toJson(input()));
    expect(parsed.anagrams).toEqual([['dormitory'], ['dirty', 'room'], ['moor', 'dirty']]);
  });

  it('records the alphagram, not the input spelling', () => {
    // Two different inputs with the same letters must produce the same value —
    // that is the point of recording it at all.
    const a = JSON.parse(toJson(input({ query: query({ input: 'dormitory' }) })));
    const b = JSON.parse(
      toJson(input({ query: query({ input: 'dirty room' }), letters: 'dirtyroom' })),
    );
    expect(a.letters).toBe('dimoorrty');
    expect(b.letters).toBe('dimoorrty');
  });

  it('records the query that produced it', () => {
    const parsed = JSON.parse(
      toJson(
        input({
          query: query({ tier: 'full', minWordLen: 4, maxWords: 2, mustInclude: ['room'], mustExclude: ['dirt'] }),
        }),
      ),
    );
    expect(parsed.input).toBe('dormitory');
    expect(parsed.letters).toBe('dimoorrty');
    expect(parsed.filters).toEqual({
      dictionary: 'full',
      minWordLength: 4,
      maxWords: 2,
      mustInclude: ['room'],
      mustExclude: ['dirt'],
    });
  });

  it('reports an unlimited word count as null rather than the sentinel', () => {
    const parsed = JSON.parse(toJson(input()));
    expect(parsed.filters.maxWords).toBeNull();
  });

  it('says so when the list is partial', () => {
    const complete = JSON.parse(toJson(input()));
    expect(complete.complete).toBe(true);
    expect(complete.totalIsFloor).toBe(false);

    const partial = JSON.parse(toJson(input({ total: '5000' })));
    expect(partial.complete).toBe(false);
    expect(partial.exported).toBe(3);
    expect(partial.total).toBe('5000');

    // A floored total can never be called complete, even if every row was written.
    const floored = JSON.parse(toJson(input({ total: '>3' })));
    expect(floored.complete).toBe(false);
    expect(floored.totalIsFloor).toBe(true);
  });
});

describe('toCsv', () => {
  it('has a header row and one row per anagram', () => {
    const lines = toCsv(input()).trim().split('\n');
    expect(lines[0]!.startsWith('#')).toBe(true);
    expect(lines[1]).toBe('anagram,word_count,longest_word');
    expect(lines).toHaveLength(5);
    expect(lines[3]).toBe('dirty room,2,dirty');
  });

  it('picks the longest word, not the first', () => {
    const csv = toCsv(input({ rows: [['a', 'lengthiest', 'bc']] }));
    expect(csv).toContain('a lengthiest bc,3,lengthiest');
  });

  it('quotes anything that would break the format', () => {
    // Input is normalized to letters, but the *query* echoed in the comment row
    // is raw user text and can contain commas and quotes.
    const csv = toCsv(input({ query: query({ input: 'a,b "c"' }) }));
    expect(csv.split('\n')[0]).toContain('"a,b ""c"""');
  });

  it('marks a partial export in the comment row', () => {
    expect(toCsv(input({ total: '90000' })).split('\n')[0]).toContain('(partial)');
    expect(toCsv(input()).split('\n')[0]).not.toContain('(partial)');
  });
});

describe('fileStem', () => {
  it('slugifies the input', () => {
    expect(fileStem(query({ input: 'Ryan Joseph Kamp' }))).toBe('ars-magna-ryan-joseph-kamp');
    expect(fileStem(query({ input: "O'Brien-Smith!" }))).toBe('ars-magna-o-brien-smith');
  });

  it('falls back rather than producing a nameless file', () => {
    expect(fileStem(query({ input: '' }))).toBe('ars-magna-anagrams');
    expect(fileStem(query({ input: '!!!' }))).toBe('ars-magna-anagrams');
  });

  it('bounds the length', () => {
    expect(fileStem(query({ input: 'a'.repeat(300) })).length).toBeLessThanOrEqual(70);
  });
});

describe('crc32', () => {
  it('matches the reference vectors', () => {
    const bytes = (s: string) => new TextEncoder().encode(s);
    expect(crc32(bytes(''))).toBe(0);
    expect(crc32(bytes('a'))).toBe(0xe8b7be43);
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
  });
});

describe('createZip', () => {
  it('produces an archive with the expected structure', async () => {
    const blob = createZip(
      [
        { name: 'one.txt', content: 'hello' },
        { name: 'two.txt', content: 'world' },
      ],
      new Date('2026-08-10T12:00:00Z'),
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);

    // Local file header signature at the very start.
    expect(view.getUint32(0, true)).toBe(0x04034b50);

    // End-of-central-directory sits in the last 22 bytes and names both entries.
    const end = bytes.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 8, true)).toBe(2);
    expect(view.getUint16(end + 10, true)).toBe(2);

    // The central directory offset it records must actually point at one.
    const centralOffset = view.getUint32(end + 16, true);
    expect(view.getUint32(centralOffset, true)).toBe(0x02014b50);

    // Contents are stored verbatim, so the payloads are findable as plain text.
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('hello');
    expect(text).toContain('world');
    expect(text).toContain('one.txt');
  });

  it('records a correct CRC and size for each entry', async () => {
    const content = 'dirty room\n';
    const bytes = new Uint8Array(
      await createZip([{ name: 'a.txt', content }]).arrayBuffer(),
    );
    const view = new DataView(bytes.buffer);
    const encoded = new TextEncoder().encode(content);

    expect(view.getUint32(14, true)).toBe(crc32(encoded));
    expect(view.getUint32(18, true)).toBe(encoded.length);
    expect(view.getUint32(22, true)).toBe(encoded.length);
    expect(view.getUint16(8, true)).toBe(0); // stored, not deflated
  });

  it('handles an empty archive without corrupting the trailer', async () => {
    const bytes = new Uint8Array(await createZip([]).arrayBuffer());
    expect(bytes).toHaveLength(22);
    expect(new DataView(bytes.buffer).getUint32(0, true)).toBe(0x06054b50);
  });
});

describe('buildBlob', () => {
  it('gives each format its own media type', () => {
    expect(buildBlob('txt', input()).type).toContain('text/plain');
    expect(buildBlob('json', input()).type).toContain('application/json');
    expect(buildBlob('csv', input()).type).toContain('text/csv');
    expect(buildBlob('zip', input()).type).toBe('application/zip');
  });

  it('packs all three formats plus a readme into the zip', async () => {
    const text = new TextDecoder().decode(await buildBlob('zip', input()).arrayBuffer());
    for (const name of ['README.txt', 'anagrams.txt', 'anagrams.json', 'anagrams.csv']) {
      expect(text).toContain(name);
    }
  });
});
