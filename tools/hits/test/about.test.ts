/**
 * What an input is: the rule a sentence follows, which must agree with the
 * schema; the copies on hits; and the sentence built from Wikidata's English
 * description, on descriptions as Wikidata writes them.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ABOUT_PATTERN,
  WIKIPEDIA_PATTERN,
  aboutProblem,
  articleFor,
  candidateOf,
  sentenceFromWikidata,
  syncAbout,
  tidySentence,
  wikipediaProblem,
} from '../src/about.ts';
import { SCHEMA_DIR, candidateSchema, hitSchema, type Candidate, type Hit } from '../src/schema.ts';

const candidate = (over: Partial<Candidate> = {}): Candidate => ({
  id: 'dormitory:phrases',
  input: 'dormitory',
  category: 'phrases',
  source: 'manual',
  first_seen: '2026-09-11',
  status: 'enumerated',
  ...over,
});

const hit = (id: string, over: Partial<Hit> = {}): Hit => ({
  id,
  input: 'dormitory',
  category: 'phrases',
  words: id.split(':')[2]!.split('-'),
  display: id.split(':')[2]!.split('-').join(' '),
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

describe('the rule for a sentence', () => {
  it('is the schema’s own rule, on both records', async () => {
    for (const file of ['candidate.schema.json', 'hit.schema.json']) {
      const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, file), 'utf8')) as {
        properties: { about: { pattern: string; maxLength: number }; wikipedia: { pattern: string } };
      };
      // Compared as compiled expressions: `source` escapes the slashes a schema string leaves bare.
      expect(new RegExp(schema.properties.about.pattern, 'u').source).toBe(ABOUT_PATTERN.source);
      expect(schema.properties.about.maxLength).toBe(200);
      expect(new RegExp(schema.properties.wikipedia.pattern).source).toBe(WIKIPEDIA_PATTERN.source);
    }
  });

  it('agrees with the schema on every case, counting characters as the schema does', async () => {
    const cv = await candidateSchema();
    const cases = [
      'A.',
      'Dolly Parton was an American singer-songwriter (1946–2026).',
      'Its motto is "Nothing is impossible."',
      'Its motto is “Nothing is impossible.”',
      '(A bracketed sentence.)',
      ' A leading space.',
      'A trailing space. ',
      'No full stop',
      'Two\nlines.',
      '.',
      `${'x'.repeat(199)}.`,
      `${'x'.repeat(200)}.`,
      `${'😀'.repeat(199)}.`,
      `${'😀'.repeat(200)}.`,
    ];
    for (const text of cases) {
      expect(aboutProblem(text) === null, JSON.stringify(text)).toBe(cv(candidate({ about: text })));
    }
    expect(aboutProblem('')).toMatch(/empty/);
    expect(aboutProblem(`${'x'.repeat(200)}.`)).toMatch(/201 characters; keep it to 200/);
    expect(aboutProblem('No full stop')).toMatch(/ending with a full stop/);
  });

  it('takes a sentence tidied onto one line, and an English Wikipedia address only', async () => {
    expect(tidySentence('  A dormitory is\n  a building.  ')).toBe('A dormitory is a building.');
    expect(wikipediaProblem('https://en.wikipedia.org/wiki/Anna%27s_Archive')).toBeNull();
    expect(wikipediaProblem('https://de.wikipedia.org/wiki/Schlafsaal')).toMatch(/not an English Wikipedia article/);
    const hv = await hitSchema();
    expect(hv(hit('dormitory:phrases:dirty-room', { wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' }))).toBe(true);
    expect(hv(hit('dormitory:phrases:dirty-room', { wikipedia: 'http://en.wikipedia.org/wiki/Dormitory' }))).toBe(false);
  });
});

describe('copies on hits', () => {
  it('mirror the candidate, removing what it lacks, and leave a hit with no candidate alone', () => {
    const candidates = [
      candidate({ about: 'A dormitory is a building of shared bedrooms.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' }),
      candidate({ id: 'listen:phrases', input: 'listen' }),
    ];
    const hits = [
      hit('dormitory:phrases:dirty-room'),
      hit('listen:phrases:silent', { about: 'A stale sentence.', wikipedia: 'https://en.wikipedia.org/wiki/Listen' }),
      hit('astronomer:phrases:moon-starer', { about: 'Kept.' }),
      hit('dormitory:phrases:dirty-mort-o', { about: 'A dormitory is a building of shared bedrooms.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' }),
    ];
    const { hits: out, changed } = syncAbout(hits, candidates);
    expect(changed).toEqual(['dormitory:phrases:dirty-room', 'listen:phrases:silent']);
    expect(out[0]).toMatchObject({ about: 'A dormitory is a building of shared bedrooms.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' });
    expect(out[1]!.about).toBeUndefined();
    expect(out[1]!.wikipedia).toBeUndefined();
    expect(out[2]).toBe(hits[2]);
    expect(out[3]).toBe(hits[3]);
    // A second pass changes nothing.
    expect(syncAbout(out, candidates).changed).toEqual([]);
  });

  it('touch only the inputs named, so a command changes only what it was asked to', () => {
    const candidates = [candidate({ about: 'A dormitory is a building.' }), candidate({ id: 'listen:phrases', input: 'listen', about: 'To listen is to hear.' })];
    const hits = [hit('dormitory:phrases:dirty-room'), hit('listen:phrases:silent')];
    const { hits: out, changed } = syncAbout(hits, candidates, ['listen:phrases']);
    expect(changed).toEqual(['listen:phrases:silent']);
    expect(out[0]).toBe(hits[0]);
    expect(candidateOf('listen:phrases:silent')).toBe('listen:phrases');
  });
});

describe('a sentence from Wikidata', () => {
  it('reads the descriptions of published inputs as sentences', () => {
    expect(sentenceFromWikidata('Elizabeth Holmes', 'American biotechnology entrepreneur convicted of fraud', false)).toBe(
      'Elizabeth Holmes is an American biotechnology entrepreneur convicted of fraud.',
    );
    expect(sentenceFromWikidata('Donald Trump', 'President of the United States (2017–2021; since 2025)', false)).toBe(
      'Donald Trump is President of the United States (2017–2021; since 2025).',
    );
    expect(sentenceFromWikidata('Dolly Parton', 'American singer-songwriter (1946–2026)', true)).toBe('Dolly Parton was an American singer-songwriter (1946–2026).');
    expect(sentenceFromWikidata('Theranos', 'defunct American privately held health-technology company', true)).toBe(
      'Theranos is a defunct American privately held health-technology company.',
    );
    expect(sentenceFromWikidata('World Trade Center', 'former skyscraper complex in Manhattan, New York (1968-2001)', true)).toBe(
      'World Trade Center is a former skyscraper complex in Manhattan, New York (1968-2001).',
    );
    expect(sentenceFromWikidata('Reacher season 4', 'season of television series', false)).toBe('Reacher season 4 is a season of television series.');
    expect(sentenceFromWikidata('United States', 'country located primarily in North America', false)).toBe('United States is a country located primarily in North America.');
    expect(sentenceFromWikidata('The Falling Man', 'iconic photograph from 9/11', false)).toBe('The Falling Man is an iconic photograph from 9/11.');
    expect(sentenceFromWikidata('Amsterdam', 'capital and most populous city of the Netherlands', false)).toBe(
      'Amsterdam is the capital and most populous city of the Netherlands.',
    );
    expect(sentenceFromWikidata('Morgan Stanley', 'U.S. investment bank', false)).toBe('Morgan Stanley is a U.S. investment bank.');
    expect(sentenceFromWikidata('Pride and Prejudice', '1813 novel by Jane Austen', false)).toBe('Pride and Prejudice is an 1813 novel by Jane Austen.');
  });

  it('never doubles a full stop, and gives nothing for a Wikimedia page, no description or an over-long one', () => {
    expect(sentenceFromWikidata('Apple', 'technology company based in Cupertino, California, founded as Apple Computer, Inc.', false)).toBe(
      'Apple is a technology company based in Cupertino, California, founded as Apple Computer, Inc.',
    );
    expect(sentenceFromWikidata('Mercury', 'Wikimedia disambiguation page', false)).toBeNull();
    expect(sentenceFromWikidata('Nothing', null, false)).toBeNull();
    expect(sentenceFromWikidata('Nothing', '   ', false)).toBeNull();
    expect(sentenceFromWikidata('Long', 'x'.repeat(195), false)).toBeNull();
  });

  it('chooses a, an or no article as the phrase is read aloud', () => {
    expect(articleFor('American football team')).toBe('an');
    expect(articleFor('NFL team')).toBe('an');
    expect(articleFor('SUV built by Ford')).toBe('an');
    expect(articleFor('BBC television series')).toBe('a');
    expect(articleFor('US-based airline')).toBe('a');
    expect(articleFor('2026 film directed by Christopher Nolan')).toBe('a');
    expect(articleFor('8-bit video game console')).toBe('an');
    expect(articleFor('18th-century novel')).toBe('an');
    expect(articleFor('1850s ship')).toBe('an');
    expect(articleFor('11-part documentary')).toBe('an');
    expect(articleFor('university in England')).toBe('a');
    expect(articleFor('European country')).toBe('a');
    expect(articleFor('Ukrainian footballer')).toBe('a');
    expect(articleFor('umbrella brand')).toBe('an');
    expect(articleFor('honorary title')).toBe('an');
    expect(articleFor('U.S. investment bank')).toBe('a');
    expect(articleFor('the capital of France')).toBe('');
    expect(articleFor('capital and most populous city of the Netherlands')).toBe('the');
    expect(articleFor('most populous city in the United States')).toBe('the');
    expect(articleFor('seat of Los Angeles County, and largest city in California')).toBe('the');
    expect(articleFor('headquarters of the Metropolitan Police Service')).toBe('the');
    expect(articleFor('second-largest city in Mexico')).toBe('the');
    expect(articleFor('western novel')).toBe('a');
    expect(articleFor('three waterfalls that straddle the border between Canada and the United States')).toBe('');
    expect(articleFor('Mayor of New York City since 2026')).toBe('');
    expect(articleFor('Prime Minister of the United Kingdom')).toBe('');
  });
});
