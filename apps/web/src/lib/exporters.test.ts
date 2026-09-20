import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, type Query } from '@ars-magna/engine';
import { crc32, createZip } from './zip.ts';
import {
  buildBlob,
  buildFileStem,
  buildJson,
  buildTxt,
  fileStem,
  toCsv,
  toJson,
  toTxt,
  type BuildReport,
  type ExportInput,
} from './exporters.ts';
import { commonnessByWord, comparison, letterFigures, wordFigures, wordLengthRows } from './analysis.ts';
import { formsFrom } from './forms.ts';
import { nestCounts, type TextCount } from './textCount.ts';

const exact = (total: string): TextCount => ({ kind: 'exact', total });
const floor = (total: string): TextCount => ({ kind: 'floor', total });

const query = (overrides: Partial<Query> = {}): Query => ({
  input: 'dormitory',
  ...DEFAULT_QUERY,
  ...overrides,
});

const input = (overrides: Partial<ExportInput> = {}): ExportInput => ({
  query: query(),
  letters: 'dimoorrty',
  total: '3',
  textLeftOut: false,
  rows: [['torrid', 'yom'], ['dirty', 'room'], ['moor', 'dirty']],
  generatedAt: new Date('2026-08-10T12:00:00Z'),
  ...overrides,
});

describe('toTxt', () => {
  it('writes one anagram per line and nothing else', () => {
    expect(toTxt(input())).toBe('torrid yom\ndirty room\nmoor dirty\n');
  });

  it('stays parseable when the list is empty', () => {
    expect(toTxt(input({ rows: [] }))).toBe('\n');
  });

  it('spells a listed form as the page does in the files a person reads, and keeps the letters in the JSON', () => {
    const forms = formsFrom([{ letters: 'dont', form: "don't", shown: true }, { letters: 'its', form: "it's", shown: false }]);
    const withForm = input({ rows: [['dont', 'doit'], ['its', 'dot', 'no']], forms });
    expect(toTxt(withForm)).toBe("don't doit\nits dot no\n");
    expect(toCsv(withForm)).toContain("\ndon't doit,2,don't\n");
    expect(JSON.parse(toJson(withForm)).anagrams).toEqual([['dont', 'doit'], ['its', 'dot', 'no']]);
  });
});

describe('toJson', () => {
  it('keeps words as arrays rather than flattening the spaces away', () => {
    const parsed = JSON.parse(toJson(input()));
    expect(parsed.anagrams).toEqual([['torrid', 'yom'], ['dirty', 'room'], ['moor', 'dirty']]);
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

  it('says so when the text itself was left out of the list and the total', () => {
    expect(JSON.parse(toJson(input())).textLeftOut).toBe(false);
    expect(toCsv(input()).split('\n')[0]).not.toContain('left out');

    const left = input({ textLeftOut: true });
    expect(JSON.parse(toJson(left)).textLeftOut).toBe(true);
    expect(toCsv(left).split('\n')[0]).toMatch(/ · The text itself is left out\.$/);
    // TXT stays one anagram per line and nothing else.
    expect(toTxt(left)).toBe(toTxt(input()));
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

describe('the Build page’s export', () => {
  const NOUN = 1 << 6;
  const side = (words: string[], masks: number[], zipf: number[]) => ({ words, masks, zipf });
  const text = side(['dormitory'], [NOUN], [100]);
  const anagram = side(['dirty', 'room'], [1 << 4, NOUN], [139, 158]);

  const report = (over: Partial<BuildReport> = {}): BuildReport => ({
    text: 'Dormitory',
    anagram: 'dirty room',
    tier: 'standard',
    checks: { lettersMatch: 'Yes', wordsKnown: 'Yes · every word is in Standard' },
    verdict: 'All 9 letters used',
    letters: { text: letterFigures('dormitory'), anagram: letterFigures('dirtyroom') },
    words: { text: wordFigures(text.words, text.masks, text.zipf), anagram: wordFigures(anagram.words, anagram.masks, anagram.zipf) },
    skipped: { text: [], anagram: [] },
    comparison: comparison(text, anagram),
    total: '115',
    countNote: null,
    wordLengths: wordLengthRows(text.words, anagram.words).rows,
    commonness: { text: commonnessByWord(text.words, text.zipf), anagram: commonnessByWord(anagram.words, anagram.zipf) },
    byDictionary: { common: exact('97'), standard: exact('115'), full: exact('120'), extended: exact('121') },
    generatedAt: new Date('2026-09-18T05:00:00.000Z'),
    ...over,
  });

  it('writes the four new figures: against English, word lengths, each word and every dictionary', () => {
    const txt = buildTxt(report());
    // dormitory has 9 letters: English would put 0.4 d and 0.7 o in 9.
    expect(txt).toContain('Against English     d 1 / 0.4 · i 1 / 0.6 · m 1 / 0.2 · o 2 / 0.7 · r 2 / 0.5 · t 1 / 0.8 · y 1 / 0.2');
    expect(txt).toContain('Word lengths        9 letters: 1');
    expect(txt).toContain('Word lengths        4 letters: 1 · 5 letters: 1');
    expect(txt).toContain('Each word           dormitory uncommon');
    expect(txt).toContain('Each word           dirty common · room everyday');
    expect(txt).toContain(
      ['By dictionary       Common 97', '                    Standard 115', '                    Full 120', '                    Extended 121'].join('\n'),
    );
    expect(buildTxt(report({ wordLengths: wordLengthRows(['dormitory'], ['i', 'da', 'ai']).rows }))).toContain(
      'Word lengths        1 letter: 1 · 2 letters: 2',
    );
    // Standard chosen and stopped, then Common stopped: Full and Extended were not counted and read its floor.
    const stopped = buildTxt(report({ byDictionary: nestCounts({ standard: floor('107'), common: floor('1065799') }) }));
    expect(stopped).toContain(
      [
        'By dictionary       Common more than 1,065,799',
        '                    Standard more than 1,065,799',
        '                    Full more than 1,065,799',
        '                    Extended more than 1,065,799',
        '                    Each count stops after 4 seconds; “more than” means it stopped first.',
        '                    Each dictionary holds every anagram of the ones above it.',
        '                    Once a count stops, the dictionaries below it are not counted and read its figure.',
      ].join('\n'),
    );
    // "this is a test": the same 999 in the three widest is the exact count, and says so.
    const same = buildTxt(report({ byDictionary: nestCounts({ common: exact('58'), standard: exact('999'), full: exact('999'), extended: exact('999') }) }));
    expect(same).toContain('                    Full 999 · adds none');
    expect(same).toContain('                    A line that reads “adds none” has no anagram the one above lacks.');

    const parsed = JSON.parse(
      buildJson(report({ byDictionary: nestCounts({ common: floor('1065799'), standard: exact('2000000'), full: { kind: 'too-long' }, extended: exact('2000000') }) })),
    );
    expect(parsed.byDictionary).toEqual({
      common: { total: '1065799', isFloor: true, addsNone: false, countedIn: 'common' },
      standard: { total: '2000000', isFloor: false, addsNone: false, countedIn: 'standard' },
      full: { total: '2000000', isFloor: true, addsNone: false, countedIn: 'standard' },
      extended: { total: '2000000', isFloor: false, addsNone: false, countedIn: 'extended' },
    });
    const none = JSON.parse(buildJson(report({ byDictionary: nestCounts({ common: exact('58'), standard: exact('999'), full: exact('999'), extended: { kind: 'counting' } }) })));
    expect(none.byDictionary.full).toEqual({ total: '999', isFloor: false, addsNone: true, countedIn: 'full' });
    expect(none.byDictionary.extended).toBeNull();
    expect(parsed.english.text[3]).toEqual({ letter: 'o', count: 2, expected: 0.7 });
    expect(parsed.wordLengths).toEqual([
      { length: 4, text: 0, anagram: 1 },
      { length: 5, text: 0, anagram: 1 },
      { length: 6, text: 0, anagram: 0 },
      { length: 7, text: 0, anagram: 0 },
      { length: 8, text: 0, anagram: 0 },
      { length: 9, text: 1, anagram: 0 },
    ]);
    expect(parsed.commonness.anagram[1]).toMatchObject({ word: 'room', band: 'everyday', zipf: 158 });
  });

  it('writes the boxes, the checks and every figure as plain text', () => {
    const txt = buildTxt(report());
    expect(txt).toContain('Ars Magna — Build');
    expect(txt).toContain('Text                Dormitory');
    expect(txt).toContain('Anagram             dirty room');
    expect(txt).toContain('Letters match       Yes');
    expect(txt).toContain('Words known         Yes · every word is in Standard');
    expect(txt).toContain('Rarest in English   y · 1.97%');
    expect(txt).toContain('Most used           o r · 2');
    expect(txt).toContain('Each letter         d 1 · i 1 · m 1 · o 2 · r 2 · t 1 · y 1');
    expect(txt).toContain('Average length      4.5');
    expect(txt).toContain('Every anagram       115 in Standard');
    expect(txt).toContain('TEXT AGAINST ANAGRAM');
    expect(txt).toContain('Words               1 / 2');
    expect(txt).toContain('adjective           0 / 1');
    expect(txt).toContain('Reads               +5 / +9');
    expect(txt).toContain('Dictionary          Standard');
    expect(txt).toContain('Parts of speech     1 adjective · 1 noun');
    expect(txt).toContain('Shared words        none');
    expect(txt).toContain('Generated 2026-09-18T05:00:00.000Z by Ars Magna');
    expect(txt.endsWith('\n')).toBe(true);
  });

  it('says a floor is a floor, and leaves out what is not there', () => {
    const byDictionary = nestCounts({ standard: floor('5000000'), common: exact('97') });
    const floored = buildTxt(report({ total: '>5000000', byDictionary, comparison: null, skipped: { text: ['4'], anagram: [] } }));
    expect(floored).toContain('Every anagram       more than 5,000,000 in Standard');
    // Standard stopped with nothing and reads Common's exact count: at least, on the line and by dictionary.
    const carried = nestCounts({ standard: { kind: 'too-long' }, common: exact('97') });
    const atLeast = buildTxt(report({ total: '>97', byDictionary: carried }));
    expect(atLeast).toContain('Every anagram       at least 97 in Standard');
    expect(atLeast).toContain('                    Standard at least 97');
    expect(atLeast).toContain('                    A line that reads “at least” has the exact count of the one above, and may add nothing to it.');
    // The JSON says the same through `countedIn`: the figure is Common's, whose own entry is exact.
    expect(JSON.parse(buildJson(report({ total: '>97', byDictionary: carried }))).byDictionary).toMatchObject({
      common: { total: '97', isFloor: false, countedIn: 'common' },
      standard: { total: '97', isFloor: true, countedIn: 'common' },
    });
    expect(floored).toContain('Skipped             4');
    expect(floored).not.toContain('TEXT AGAINST ANAGRAM');
    expect(buildTxt(report({ total: null }))).toContain('Every anagram       —');
    const note = 'The text is too long to count here; the page stops counting after 4 seconds.';
    expect(buildTxt(report({ total: null, countNote: note }))).toContain(`Every anagram       ${note}`);
    expect(JSON.parse(buildJson(report({ total: null, countNote: note })))).toMatchObject({ total: null, totalIsFloor: false, countNote: note });
  });

  it('writes the same figures as data', () => {
    const parsed = JSON.parse(buildJson(report()));
    expect(parsed).toMatchObject({
      text: 'Dormitory',
      anagram: 'dirty room',
      tier: 'standard',
      total: '115',
      totalIsFloor: false,
      generatedAt: '2026-09-18T05:00:00.000Z',
      generatedBy: 'Ars Magna',
    });
    expect(parsed.letters.text.rarest).toEqual({ letters: ['y'], percent: 1.97 });
    expect(parsed.letters.text.mostUsed).toEqual({ letters: ['o', 'r'], count: 2 });
    expect(parsed.words.anagram.count).toBe(2);
    expect(parsed.comparison.words).toEqual({ text: 1, anagram: 2 });
    expect(JSON.parse(buildJson(report({ total: '>5000000' })))).toMatchObject({ total: '5000000', totalIsFloor: true });
  });

  it('writes the letter map, counting letters from 1, and the limit past it', () => {
    expect(buildTxt(report())).toContain('Letter map          d 1→1 · o 2→7 · r 3→3 · m 4→9 · i 5→2 · t 6→4 · o 7→8 · r 8→6 · y 9→5');
    expect(JSON.parse(buildJson(report())).letterMap.links[1]).toEqual({ letter: 'o', from: 1, to: 6 });
    const long = 'a'.repeat(61);
    const past = report({ text: long, anagram: long, letters: { text: letterFigures(long), anagram: letterFigures(long) } });
    expect(buildTxt(past)).toContain('Letter map          The letter map draws texts of up to 60 letters.');
    expect(JSON.parse(buildJson(past)).letterMap).toBeNull();
  });

  it('names the file after the text', () => {
    expect(buildFileStem('Dario Amodei')).toBe('ars-magna-build-dario-amodei');
    expect(buildFileStem('  ')).toBe('ars-magna-build');
  });
});
