/**
 * The names list's own rules, without fetching a source: how a label becomes
 * tokens, how one token's attestations become one line, and what the schema
 * and the list-level rules refuse. The committed list is checked too, so a
 * hand edit that breaks the order or lists a dictionary word fails here as
 * well as in `vocab:check`.
 */
import { describe, expect, it } from 'vitest';

import {
  isRomanNumeral,
  mergeNames,
  parseGeonames,
  parseGiven,
  parseSurnames,
  parseWikidata,
  tokensOf,
  NAME_FLOOR,
  type Attestation,
} from '../src/names.ts';
import { nameProblems, nameSchema, readNames, type Name } from '../src/vocab.ts';

describe('tokens of a label', () => {
  it('folds each piece as the search folds it, three letters or more', () => {
    expect(tokensOf('Taylor Swift')).toEqual(['taylor', 'swift']);
    expect(tokensOf('Beyoncé Knowles-Carter')).toEqual(['beyonce', 'knowles', 'carter']);
    expect(tokensOf("O'Brien")).toEqual(['brien']);
    expect(tokensOf('Washington, D.C.')).toEqual(['washington']);
    // A single letter is no token, and `sao` is a particle.
    expect(tokensOf('J.C. Bamford Excavators')).toEqual(['bamford', 'excavators']);
    expect(tokensOf('São Paulo')).toEqual(['paulo']);
  });

  it('leaves out particles and regnal numbers, and lists a token once', () => {
    expect(tokensOf('Rio de Janeiro')).toEqual(['rio', 'janeiro']);
    expect(tokensOf('Ludwig van Beethoven')).toEqual(['ludwig', 'beethoven']);
    expect(tokensOf('Louis XIV')).toEqual(['louis']);
    expect(tokensOf('Pope John Paul II')).toEqual(['pope', 'john', 'paul']);
    expect(tokensOf('Baden-Baden')).toEqual(['baden']);
    expect(isRomanNumeral('mdcclxxvi')).toBe(true);
    expect(isRomanNumeral('mimi')).toBe(false);
    expect(isRomanNumeral('')).toBe(false);
  });

  it('gives nothing for a label with no Latin letters, and nothing for a piece with a digit in it', () => {
    expect(tokensOf('東京')).toEqual([]);
    expect(tokensOf('42')).toEqual([]);
    expect(tokensOf('3M')).toEqual([]);
    expect(tokensOf('Boeing 747')).toEqual(['boeing']);
    expect(tokensOf('Canal+')).toEqual(['canal']);
    // A piece with a digit yields no token: the search reads a digit as a
    // character of the text (D62), so `TF1` is not the name `tf`, `Se7en` not
    // `seen`, and `20th` not `th`; the other pieces stand.
    expect(tokensOf('TF1')).toEqual([]);
    expect(tokensOf('Se7en')).toEqual([]);
    expect(tokensOf('20th Century Studios')).toEqual(['century', 'studios']);
    expect(tokensOf('6th of October City')).toEqual(['october', 'city']);
    expect(tokensOf('B2B Holdings')).toEqual(['holdings']);
  });

  it('keeps a token of three letters or more, the names class floor', () => {
    expect(NAME_FLOOR).toBe(3);
    expect(tokensOf('BP')).toEqual([]);
    expect(tokensOf('Dr Pepper')).toEqual(['pepper']);
    expect(tokensOf('Port-au-Prince')).toEqual(['port', 'prince']);
    expect(tokensOf('AC Sparta Prague')).toEqual(['sparta', 'prague']);
    expect(tokensOf('Ada')).toEqual(['ada']);
  });
});

const wikidata = (kind: Attestation['kind'], from: string, prominence: number): Attestation => ({
  kind,
  source: 'wikidata',
  from,
  trace: `https://www.wikidata.org/wiki/Q${prominence}`,
  prominence,
});
const surname = (rank: number): Attestation => ({ kind: 'surname', source: 'census-surnames-2000', trace: 'census', prominence: rank });
const given = (percent: number): Attestation => ({ kind: 'given', source: 'census-given-1990', trace: 'census', prominence: percent });
const geonames = (from: string, population: number): Attestation => ({ kind: 'place', source: 'geonames', from, trace: 'geo', prominence: population });

describe('merging attestations into lines', () => {
  it('takes the kind from Wikidata first, by the most prominent entity, and records the rest under also', () => {
    const lines = mergeNames(
      new Map([
        ['washington', [wikidata('person', 'George Washington', 220), wikidata('place', 'Washington, D.C.', 250), surname(138), geonames('Washington', 700_000)]],
      ]),
      new Set(),
    );
    expect(lines).toEqual([
      {
        name: 'washington',
        kind: 'place',
        source: 'wikidata',
        from: 'Washington, D.C.',
        trace: 'https://www.wikidata.org/wiki/Q250',
        prominence: 250,
        also: [
          { kind: 'person', source: 'wikidata', from: 'George Washington', prominence: 220 },
          { kind: 'surname', source: 'census-surnames-2000', prominence: 138 },
          { kind: 'place', source: 'geonames', from: 'Washington', prominence: 700_000 },
        ],
      },
    ]);
  });

  it('ranks a surname by the lower figure and everything else by the higher', () => {
    const lines = mergeNames(new Map([['smithson', [surname(4_000), surname(12)]], ['lagos', [geonames('Lagos', 100_000), geonames('Lagos', 9_000_000)]]]), new Set());
    expect(lines.map((l) => [l.name, l.prominence])).toEqual([
      ['lagos', 9_000_000],
      ['smithson', 12],
    ]);
    expect(lines.every((l) => l.also === undefined)).toBe(true);
  });

  it('leaves out a word the dictionary carries, and sorts by name', () => {
    const lines = mergeNames(
      new Map([
        ['york', [wikidata('place', 'New York City', 300)]],
        ['new', [wikidata('place', 'New York City', 300)]],
        ['amy', [given(0.2)]],
      ]),
      new Set(['new']),
    );
    expect(lines.map((l) => l.name)).toEqual(['amy', 'york']);
  });
});

describe('the sources as parsed', () => {
  it('reads a Wikidata answer into entities sorted by id', () => {
    const json = JSON.stringify({
      results: {
        bindings: [
          { item: { value: 'http://www.wikidata.org/entity/Q76' }, label: { value: 'Barack Obama' }, sl: { value: '250' } },
          { item: { value: 'http://www.wikidata.org/entity/Q1' }, label: { value: 'universe' }, sl: { value: '300' } },
        ],
      },
    });
    expect(parseWikidata(json)).toEqual([
      { id: 'Q1', label: 'universe', sitelinks: 300 },
      { id: 'Q76', label: 'Barack Obama', sitelinks: 250 },
    ]);
  });

  it('reads the Census files and takes what the pin says', () => {
    const csv = 'name,rank,count\nSMITH,1,2376206\nJOHNSON,2,1857160\nWILLIAMS,3,1534042\nALL OTHER NAMES,0,29312001\n';
    expect(parseSurnames(csv, 2)).toEqual([
      { name: 'SMITH', rank: 1 },
      { name: 'JOHNSON', rank: 2 },
    ]);
    const given = 'MARY           2.629  2.629      1\nPATRICIA       1.073  3.702      2\nCELINA         0.008 81.852   1000\n';
    expect(parseGiven(given, 0.01)).toEqual([
      { name: 'MARY', percent: 2.629 },
      { name: 'PATRICIA', percent: 1.073 },
    ]);
  });

  it('reads a GeoNames dump from the population up', () => {
    const row = (id: string, name: string, population: string) =>
      [id, name, name, '', '0', '0', 'P', 'PPL', 'XX', '', '', '', '', '', population, '', '', 'UTC', '2026-01-01'].join('\t');
    const text = [row('2', 'Lagos', '9000000'), row('1', 'Small Town', '20000'), ''].join('\n');
    expect(parseGeonames(text, 300_000)).toEqual([{ id: '2', name: 'Lagos', population: 9_000_000 }]);
  });
});

describe('the name schema and the list-level rules', () => {
  const line: Name = {
    name: 'amodei',
    kind: 'person',
    source: 'wikidata',
    from: 'Dario Amodei',
    trace: 'https://www.wikidata.org/wiki/Q1',
    prominence: 40,
  };

  it('accepts a line as names:build writes it', async () => {
    const check = await nameSchema();
    expect(check(line)).toBe(true);
    expect(check({ ...line, also: [{ kind: 'surname', source: 'census-surnames-2000', prominence: 900 }] })).toBe(true);
  });

  it('refuses what the build could not have written', async () => {
    const check = await nameSchema();
    expect(check({ ...line, name: 'Amodei' })).toBe(false);
    expect(check({ ...line, name: 'a' })).toBe(false);
    // The floor of three letters (D63).
    expect(check({ ...line, name: 'bp' })).toBe(false);
    expect(check({ ...line, name: 'ada' })).toBe(true);
    expect(check({ ...line, kind: 'deity' })).toBe(false);
    expect(check({ ...line, source: 'a friend' })).toBe(false);
    expect(check({ ...line, gloss: 'Not a field here.' })).toBe(false);
    expect(check({ ...line, also: [] })).toBe(false);
  });

  it('names a dictionary word, a repeat, a line out of order, one under the floor and one its label does not yield', () => {
    const lines: Name[] = [line, { ...line, name: 'zebra' }, { ...line, name: 'amodei' }, { ...line, name: 'Ångström' }];
    expect(nameProblems(lines, new Set(['zebra']))).toEqual([
      'zebra: a word the dictionary already carries, not a name it lacks',
      'zebra: not a token of its label "Dario Amodei"',
      'amodei: listed more than once',
      'amodei: out of order after zebra; the list is sorted by name',
      'Ångström: not a search form; it normalizes to angstrom',
      'Ångström: not a token of its label "Dario Amodei"',
    ]);
    expect(nameProblems([line], null)).toEqual([]);
    // Lines an older build wrote: a two-letter token, and a token of a piece with a digit.
    expect(nameProblems([{ ...line, name: 'tf', from: 'TF1' }], null)).toEqual([
      'tf: under the floor of 3 letters',
      'tf: not a token of its label "TF1"',
    ]);
    expect(nameProblems([{ ...line, name: 'seen', from: 'Se7en' }], null)).toEqual(['seen: not a token of its label "Se7en"']);
    // A Census line has no label to hold it to.
    const { from: _none, ...census } = line;
    expect(nameProblems([{ ...census, kind: 'surname', source: 'census-surnames-2000' }], null)).toEqual([]);
  });

  it('holds the committed list to the rules', async () => {
    const names = await readNames();
    expect(names.length).toBeGreaterThan(9_000);
    expect(names.length).toBeLessThan(11_000);
    expect(names.every((n) => n.name.length >= NAME_FLOOR)).toBe(true);
    expect(nameProblems(names, null)).toEqual([]);
  });
});
