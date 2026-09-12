/**
 * The trending fetch on recorded responses: the Wikipedia top-1000 for
 * 9 September 2026 and the Wikidata answer for its first sixty non-junk
 * titles. `fetch` is injected, so nothing here touches the network; a live
 * smoke test runs only with HITS_LIVE=1.
 */
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cleanTitle, isJunk } from '../src/classify/junk.ts';
import { buildQuery, categoryTable, classifyTitles, interpret } from '../src/classify/wikidata.ts';
import { reclassify, runFetch, titleOf, toCandidates } from '../src/fetch.ts';
import { previousDay, wikipediaTop } from '../src/sources/wikipedia-top.ts';
import { USER_AGENT } from '../src/sources/source.ts';
import { candidateSchema, type Candidate } from '../src/schema.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => readFile(resolve(here, 'fixtures', name), 'utf8');

/** Serves the fixtures; 404s the day after them so the fallback runs. */
async function recordedFetch(): Promise<{ fetch: typeof fetch; calls: string[] }> {
  const pageviews = await fixture('pageviews-2026-09-09.json');
  const sparql = await fixture('sparql-2026-09-09.json');
  const calls: string[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push(url);
    expect((init?.headers as Record<string, string>)['user-agent']).toBe(USER_AGENT);
    if (url.includes('/pageviews/top/')) {
      if (url.endsWith('/2026/09/09')) return new Response(pageviews, { status: 200 });
      return new Response('not yet', { status: 404 });
    }
    if (url.startsWith('https://query.wikidata.org/sparql')) {
      // Every batch is a SPARQL query over enwiki titles; the fixture answers
      // for all sixty, so the same response serves both batches.
      expect(String(init?.body)).toContain(encodeURIComponent('@en'));
      expect(String(init?.body)).toContain(encodeURIComponent('wdt:P279*'));
      return new Response(sparql, { status: 200 });
    }
    throw new Error(`unexpected ${url}`);
  }) as typeof fetch;
  return { fetch: impl, calls };
}

describe('junk', () => {
  it('drops navigation pages, dated lists and the very short', () => {
    for (const t of ['Main Page', 'Special:Search', 'Portal:Current events', 'Deaths in 2026', 'List of countries', 'Wikipedia:Featured pictures', 'Cher (disambiguation)', '2026 in film', 'September 11 attacks'.slice(0, 0) + '.xyz', '1984']) {
      expect(isJunk(t), t).toBe(true);
    }
    for (const t of ['Ben Shelton', 'ChatGPT', 'Neatsville, Kentucky', 'Spider-Man: Brand New Day']) expect(isJunk(t), t).toBe(false);
  });

  it('strips the disambiguating tail from a title', () => {
    expect(cleanTitle('Toxic (2026 film)')).toBe('Toxic');
    expect(cleanTitle('The Gentlemen (2024 TV series)')).toBe('The Gentlemen');
    expect(cleanTitle('Neatsville, Kentucky')).toBe('Neatsville, Kentucky');
  });
});

describe('wikipedia-top', () => {
  it('asks for the previous day and falls back one more on a 404', async () => {
    const { fetch, calls } = await recordedFetch();
    const rows = await wikipediaTop.fetch('2026-09-11', { fetch, userAgent: USER_AGENT });
    expect(calls).toEqual([
      'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/2026/09/10',
      'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/2026/09/09',
    ]);
    expect(rows).toHaveLength(999);
    expect(rows[0]!.title).toBe('Main Page');
    expect(rows.find((r) => r.title === 'Ben Shelton')!.weight).toBeGreaterThan(0);
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
  });
});

describe('wikidata', () => {
  it('classifies through the transitive subclass walk, with events and parties left out', async () => {
    const { fetch } = await recordedFetch();
    const titles = ['Ben Shelton', 'ChatGPT', 'Neatsville, Kentucky', 'Spider-Man: Brand New Day', 'United States', 'Navier–Stokes equations', 'September 11 attacks', 'Alternative for Germany', 'The Gentlemen (2024 TV series)', 'Killing of Sam Nordquist'];
    const out = await classifyTitles(titles, { fetch, userAgent: USER_AGENT, sleep: async () => {} });
    const by = new Map(out.map((c) => [c.title, c]));
    expect(by.get('Ben Shelton')!.category).toBe('people');
    expect(by.get('ChatGPT')!.category).toBe('products');
    expect(by.get('Neatsville, Kentucky')!.category).toBe('places');
    expect(by.get('Spider-Man: Brand New Day')!.category).toBe('titles');
    expect(by.get('The Gentlemen (2024 TV series)')!.category).toBe('titles');
    expect(by.get('United States')!.category).toBe('places');
    expect(by.get('Navier–Stokes equations')!.category).toBeNull();
    expect(by.get('September 11 attacks')!.category).toBeNull();
    expect(by.get('Alternative for Germany')!.category).toBeNull();
    expect(by.get('Killing of Sam Nordquist')!.qid).toBeNull();
    expect(by.get('Ben Shelton')!.qid).toMatch(/^Q\d+$/);
  });

  it('applies precedence and exclusion when an item matches several roots', async () => {
    const table = await categoryTable();
    const b = (title: string, cls: string, root?: string) => ({
      title: { value: title },
      item: { value: 'http://www.wikidata.org/entity/Q1' },
      class: { value: `http://www.wikidata.org/entity/${cls}` },
      ...(root ? { root: { value: `http://www.wikidata.org/entity/${root}` } } : {}),
    });
    // A film studio that is also a company: titles beats companies.
    expect(interpret(['x'], [b('x', 'Q11424', 'Q11424'), b('x', 'Q783794', 'Q783794')], table)[0]!.category).toBe('titles');
    // Anything that reaches an excluded root is unclassified, whatever else matched.
    expect(interpret(['y'], [b('y', 'Q7397', 'Q7397'), b('y', 'Q1656682', 'Q1656682')], table)[0]!.category).toBeNull();
    expect(buildQuery(['a "quoted" title'], table)).toContain('"a \\"quoted\\" title"@en');
  });
});

describe('fetch', () => {
  it('turns the day into candidates, appends nothing twice, and tallies the unplaced', async () => {
    const { fetch } = await recordedFetch();
    const first = await runFetch({ date: '2026-09-11', limit: 60, fetch, dryRun: true });
    expect(first.junk).toBeGreaterThan(0);
    expect(first.candidates.length).toBe(60);

    const validate = await candidateSchema();
    for (const c of first.candidates) expect(validate(c), JSON.stringify(c)).toBe(true);

    const by = new Map(first.candidates.map((c) => [c.input, c]));
    expect(by.get('Ben Shelton')).toMatchObject({ category: 'people', status: 'new', source: 'trending' });
    expect(by.get('ChatGPT')).toMatchObject({ category: 'products', status: 'new' });
    expect(by.get('Neatsville, Kentucky')).toMatchObject({ category: 'places', status: 'new' });
    expect(by.get('Spider-Man: Brand New Day')).toMatchObject({ category: 'titles', status: 'new' });
    expect(by.get('The Gentlemen')).toMatchObject({ category: 'titles', notes: 'Wikipedia: The Gentlemen (2024 TV series)' });
    expect(by.get('Navier–Stokes equations')).toMatchObject({ status: 'unclassified' });
    // A month-and-day title is junk before it is ever classified.
    expect(by.has('September 11 attacks')).toBe(false);
    expect(by.get('Killing of the Clancy children')).toMatchObject({ status: 'unclassified' });
    expect(first.unclassified.length).toBeGreaterThan(0);

    // The pure step is stable: the same inputs give the same records.
    const again = toCandidates([{ title: 'Ben Shelton', source: 's', weight: 1 }], new Map(first.classified.map((c) => [c.title, c])), new Map(), '2026-09-11');
    expect(again[0]).toEqual(by.get('Ben Shelton'));
  });
});

describe('reclassify', () => {
  it('moves an unclassified candidate into the category Wikidata now gives it, without duplicating one already there', () => {
    const c = (over: Partial<Candidate>): Candidate => ({ id: 'x:phrases', input: 'x', category: 'phrases', source: 'trending', first_seen: '2026-09-11', status: 'unclassified', ...over });
    const candidates = [
      c({ id: 'youtube:phrases', input: 'YouTube' }),
      c({ id: 'sabahfk:phrases', input: 'Sabah FK', notes: 'Wikipedia: Sabah FK (Azerbaijan)' }),
      c({ id: 'sabahfk:companies', input: 'Sabah FK', category: 'companies', status: 'new' }),
      c({ id: 'houthis:phrases', input: 'Houthis' }),
      c({ id: 'dolly:people', input: 'Dolly', category: 'people', status: 'enumerated' }),
    ];
    expect(titleOf(candidates[1]!)).toBe('Sabah FK (Azerbaijan)');
    expect(titleOf(candidates[0]!)).toBe('YouTube');
    const classified = new Map([
      ['YouTube', { title: 'YouTube', qid: 'Q866', classes: ['Q35127'], category: 'products' as const }],
      ['Sabah FK (Azerbaijan)', { title: 'Sabah FK (Azerbaijan)', qid: 'Q43082535', classes: ['Q476028'], category: 'companies' as const }],
      ['Houthis', { title: 'Houthis', qid: 'Q3042087', classes: ['Q2738074'], category: null }],
    ]);
    const { candidates: out, moved } = reclassify(candidates, classified);
    expect(moved.map((m) => m.id)).toEqual(['youtube:products', 'sabahfk:companies']);
    expect(out.map((m) => m.id)).toEqual(['youtube:products', 'sabahfk:companies', 'houthis:phrases', 'dolly:people']);
    expect(out[0]).toMatchObject({ category: 'products', status: 'new', wikidata_qid: 'Q866', source: 'trending' });
    expect(out.filter((m) => m.id === 'sabahfk:companies')).toHaveLength(1);
  });
});

describe.skipIf(!process.env['HITS_LIVE'])('live', () => {
  it('reaches Wikimedia and Wikidata', async () => {
    const rows = await wikipediaTop.fetch(new Date().toISOString().slice(0, 10), { fetch, userAgent: USER_AGENT });
    expect(rows.length).toBeGreaterThan(900);
    const [c] = await classifyTitles(['Dolly Parton'], { fetch, userAgent: USER_AGENT });
    expect(c!.category).toBe('people');
  }, 60_000);
});
