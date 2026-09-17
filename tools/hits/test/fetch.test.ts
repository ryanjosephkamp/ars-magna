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
import {
  MAX_SUBJECTS,
  buildQuery,
  categoryTable,
  classifyTitles,
  describeQuery,
  interpret,
  interpretItems,
  interpretLabels,
  subjectSlug,
  type Classification,
} from '../src/classify/wikidata.ts';
import { describable, lookupable, matchItems, reclassify, runFetch, titleOf, toCandidates, withWikidata } from '../src/fetch.ts';
import { previousDay, wikipediaTop } from '../src/sources/wikipedia-top.ts';
import { USER_AGENT } from '../src/sources/source.ts';
import { candidateSchema, type Candidate } from '../src/schema.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => readFile(resolve(here, 'fixtures', name), 'utf8');

/** Serves the fixtures; 404s the day after them so the fallback runs. */
async function recordedFetch(): Promise<{ fetch: typeof fetch; calls: string[] }> {
  const pageviews = await fixture('pageviews-2026-09-09.json');
  const sparql = await fixture('sparql-2026-09-09.json');
  const described = await fixture('sparql-describe-2026-09-09.json');
  const calls: string[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push(url);
    expect((init?.headers as Record<string, string>)['user-agent']).toBe(USER_AGENT);
    if (url.includes('/pageviews/top/')) {
      if (url.endsWith('/2026/09/09')) return new Response(pageviews, { status: 200 });
      return new Response('not yet', { status: 404 });
    }
    if (url.startsWith('https://query.wikidata.org/sparql') && String(init?.body).includes(encodeURIComponent('schema:description'))) {
      // What the placed titles' items are: recorded for every item in the classification fixture.
      expect(String(init?.body)).toContain(encodeURIComponent('VALUES ?item'));
      return new Response(described, { status: 200 });
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

  it('reads subjects from a recorded answer: occupation for a person, industry for a company, genre for a novel', async () => {
    const table = await categoryTable();
    const recorded = JSON.parse(await fixture('sparql-subjects-2026-09-13.json')) as { results: { bindings: Parameters<typeof interpret>[1] } };
    const titles = ['Ben Shelton', 'Boeing', 'Dune (novel)'];
    const by = new Map(interpret(titles, recorded.results.bindings, table).map((c) => [c.title, c]));
    expect(by.get('Ben Shelton')).toMatchObject({ category: 'people', subjects: ['tennis-player'] });
    expect(by.get('Boeing')).toMatchObject({
      category: 'companies',
      subjects: ['aerospace-industry', 'aircraft-construction', 'aircraft-industry', 'space-based-economy', 'space-industry', 'weapons-industry'],
    });
    expect(by.get('Dune (novel)')!.subjects).toEqual(['adventure-fiction', 'planetary-romance', 'science-fiction', 'social-science-fiction', 'soft-science-fiction']);
  });

  it('reads occupation, industry and genre labels as subject slugs', async () => {
    const table = await categoryTable();
    const b = (label?: string) => ({
      title: { value: 'x' },
      item: { value: 'http://www.wikidata.org/entity/Q1' },
      class: { value: 'http://www.wikidata.org/entity/Q5' },
      ...(label ? { subjectLabel: { value: label } } : {}),
    });
    const [c] = interpret(['x'], [b('tennis player'), b('Science fiction film'), b('tennis player'), b(), b('Café owner'), b('3D animation')], table);
    expect(c!.subjects).toEqual(['cafe-owner', 'science-fiction-film', 'tennis-player']);
    expect(interpret(['y'], [], table)[0]!.subjects).toEqual([]);
    const many = interpret(['x'], 'abcdefghijkl'.split('').map((l) => b(`${l} job`)), table)[0]!;
    expect(many.subjects).toHaveLength(MAX_SUBJECTS);
    expect(subjectSlug('  --Aérospace   industry!  ')).toBe('aerospace-industry');
    expect(buildQuery(['x'], table)).toContain('wdt:P106|wdt:P452|wdt:P136');

    // A classified title carries its subjects onto the candidate.
    const [candidate] = toCandidates([{ title: 'x', source: 's', weight: 1 }], new Map([['x', { ...c!, category: 'people' as const }]]), new Map(), '2026-09-13');
    expect(candidate!.subjects).toEqual(['cafe-owner', 'science-fiction-film', 'tennis-player']);
    expect((await candidateSchema())(candidate)).toBe(true);
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

    // A placed candidate says what it is, from Wikidata; an item the table excludes, such as an event, does not.
    expect(by.get('Ben Shelton')).toMatchObject({
      about: 'Ben Shelton is an American tennis player.',
      wikipedia: 'https://en.wikipedia.org/wiki/Ben_Shelton',
    });
    expect(by.get('Killing of the Clancy children')!.about).toBeUndefined();
    expect(by.get('Navier–Stokes equations')!.about).toBeUndefined();

    // The pure steps are stable: the same inputs give the same records.
    const again = toCandidates([{ title: 'Ben Shelton', source: 's', weight: 1 }], new Map(first.classified.map((c) => [c.title, c])), new Map(), '2026-09-11');
    const items = interpretItems([again[0]!.wikidata_qid!], JSON.parse(await fixture('sparql-describe-2026-09-09.json')).results.bindings);
    expect(withWikidata(again[0]!, items.get(again[0]!.wikidata_qid!))).toEqual(by.get('Ben Shelton'));
  });
});

describe('what an input is, from Wikidata', () => {
  const c = (over: Partial<Candidate>): Candidate => ({ id: 'x:people', input: 'X', category: 'people', source: 'trending', first_seen: '2026-09-11', status: 'new', ...over });

  it('asks for each item once, with the dates of death and dissolution as a yes or no, not a row each', () => {
    const query = describeQuery(['Q1', 'Q2']);
    expect(query).toContain('VALUES ?item { wd:Q1 wd:Q2 }');
    expect(query).toContain('BIND(EXISTS { ?item wdt:P570|wdt:P576 [] } AS ?ended)');
    expect(query).not.toMatch(/OPTIONAL \{ \?item wdt:P570/);
    const items = interpretItems(
      ['Q1', 'Q2', 'Q3'],
      [
        { item: { value: 'http://www.wikidata.org/entity/Q1' }, description: { value: 'American singer-songwriter (1946–2026)' }, ended: { value: 'true' }, sitelink: { value: 'https://en.wikipedia.org/wiki/Dolly_Parton' } },
        { item: { value: 'http://www.wikidata.org/entity/Q2' }, ended: { value: 'false' } },
      ],
    );
    expect(items.get('Q1')).toEqual({ qid: 'Q1', description: 'American singer-songwriter (1946–2026)', ended: true, wikipedia: 'https://en.wikipedia.org/wiki/Dolly_Parton' });
    expect(items.get('Q2')).toEqual({ qid: 'Q2', description: null, ended: false, wikipedia: null });
    expect(items.get('Q3')).toEqual({ qid: 'Q3', description: null, ended: false, wikipedia: null });
  });

  it('fills a sentence and a link only where the candidate has none', () => {
    const item = { qid: 'Q1', description: 'American singer-songwriter (1946–2026)', ended: true, wikipedia: 'https://en.wikipedia.org/wiki/Dolly_Parton' };
    expect(withWikidata(c({ input: 'Dolly Parton', wikidata_qid: 'Q1' }), item)).toMatchObject({
      about: 'Dolly Parton was an American singer-songwriter (1946–2026).',
      wikipedia: 'https://en.wikipedia.org/wiki/Dolly_Parton',
    });
    const mine = c({ input: 'Dolly Parton', wikidata_qid: 'Q1', about: 'Dolly Parton wrote Jolene.' });
    expect(withWikidata(mine, item)).toEqual({ ...mine, wikipedia: 'https://en.wikipedia.org/wiki/Dolly_Parton' });
    expect(withWikidata(mine, undefined)).toBe(mine);
    expect(withWikidata(c({}), { ...item, description: 'Wikimedia disambiguation page', wikipedia: null })).toEqual(c({}));
  });

  it('describes placed candidates with an item, and looks items up only for manual ones outside phrases', () => {
    expect(describable(c({ wikidata_qid: 'Q1' }))).toBe(true);
    expect(describable(c({}))).toBe(false);
    expect(describable(c({ wikidata_qid: 'Q1', status: 'unclassified' }))).toBe(false);
    expect(describable(c({ wikidata_qid: 'Q1', status: 'rejected' }))).toBe(false);
    expect(lookupable(c({ source: 'manual' }))).toBe(true);
    expect(lookupable(c({ source: 'manual', wikidata_qid: 'Q1' }))).toBe(false);
    expect(lookupable(c({ source: 'manual', category: 'phrases' }))).toBe(false);
    expect(lookupable(c({ source: 'trending' }))).toBe(false);
  });

  it('matches a manual candidate by title inside its own category, and only suggests the one label match that fits', () => {
    const manual = [
      c({ id: 'starwars:titles', input: 'Star Wars', category: 'titles', source: 'manual' }),
      c({ id: 'iphone:products', input: 'iPhone', category: 'products', source: 'manual' }),
      c({ id: 'titanic:titles', input: 'Titanic', category: 'titles', source: 'manual' }),
      c({ id: 'saharadesert:places', input: 'Sahara Desert', category: 'places', source: 'manual' }),
      c({ id: 'nobody:people', input: 'Nobody', category: 'people', source: 'manual' }),
    ];
    const cls = (title: string, qid: string | null, category: Candidate['category'] | null): [string, Classification] => [title, { title, qid, classes: [], category, subjects: [] }];
    const byTitle = new Map([
      cls('Star Wars', 'Q462', 'titles'),
      cls('iPhone', null, null),
      cls('IPhone', 'Q2766', 'products'),
      cls('Titanic', 'Q25173', 'places'),
      cls('Sahara Desert', null, null),
      cls('Nobody', null, null),
    ]);
    const byLabel = new Map([
      ['Titanic', [
        { qid: 'Q44578', category: 'titles' as const, wikipedia: 'https://en.wikipedia.org/wiki/Titanic_(1997_film)' },
        { qid: 'Q18605', category: 'titles' as const, wikipedia: 'https://en.wikipedia.org/wiki/Titanic_(1953_film)' },
      ]],
      ['Sahara Desert', [{ qid: 'Q6583', category: 'places' as const, wikipedia: 'https://en.wikipedia.org/wiki/Sahara' }]],
      ['Nobody', []],
    ]);
    const { matched, suggested, unmatched } = matchItems(manual, byTitle, byLabel);
    expect(matched).toEqual([
      { id: 'starwars:titles', input: 'Star Wars', qid: 'Q462' },
      { id: 'iphone:products', input: 'iPhone', qid: 'Q2766' },
    ]);
    expect(suggested).toEqual([{ id: 'saharadesert:places', input: 'Sahara Desert', qid: 'Q6583' }]);
    expect(unmatched).toEqual([
      { id: 'titanic:titles', input: 'Titanic', reason: '2 items in titles share its label (Q44578, Q18605)' },
      { id: 'nobody:people', input: 'Nobody', reason: 'no item has its title or label' },
    ]);
  });

  it('reads every item a label names, each with the category its classes reach', async () => {
    const table = await categoryTable();
    const human = Object.keys(table.roots.people)[0]!;
    const excluded = Object.keys(table.exclude)[0]!;
    const e = (q: string) => ({ value: `http://www.wikidata.org/entity/${q}` });
    const labels = interpretLabels(
      ['Mercury', 'Nothing'],
      [
        { label: { value: 'Mercury' }, item: e('Q1'), sitelink: { value: 'https://en.wikipedia.org/wiki/Freddie_Mercury' }, class: e('Q5'), root: e(human) },
        { label: { value: 'Mercury' }, item: e('Q2'), sitelink: { value: 'https://en.wikipedia.org/wiki/Mercury_(planet)' }, class: e('Q634') },
        { label: { value: 'Mercury' }, item: e('Q3'), sitelink: { value: 'https://en.wikipedia.org/wiki/Mercury_Prize' }, class: e('Q1'), root: e(human) },
        { label: { value: 'Mercury' }, item: e('Q3'), sitelink: { value: 'https://en.wikipedia.org/wiki/Mercury_Prize' }, class: e('Q2'), root: e(excluded) },
      ],
      table,
    );
    expect(labels.get('Mercury')).toEqual([
      { qid: 'Q1', category: 'people', wikipedia: 'https://en.wikipedia.org/wiki/Freddie_Mercury' },
      { qid: 'Q2', category: null, wikipedia: 'https://en.wikipedia.org/wiki/Mercury_(planet)' },
      { qid: 'Q3', category: null, wikipedia: 'https://en.wikipedia.org/wiki/Mercury_Prize' },
    ]);
    expect(labels.get('Nothing')).toEqual([]);
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
      ['YouTube', { title: 'YouTube', qid: 'Q866', classes: ['Q35127'], category: 'products' as const, subjects: ['online-video-platform'] }],
      ['Sabah FK (Azerbaijan)', { title: 'Sabah FK (Azerbaijan)', qid: 'Q43082535', classes: ['Q476028'], category: 'companies' as const, subjects: [] }],
      ['Houthis', { title: 'Houthis', qid: 'Q3042087', classes: ['Q2738074'], category: null, subjects: [] }],
    ]);
    const { candidates: out, moved } = reclassify(candidates, classified);
    expect(moved.map((m) => m.id)).toEqual(['youtube:products', 'sabahfk:companies']);
    expect(out.map((m) => m.id)).toEqual(['youtube:products', 'sabahfk:companies', 'houthis:phrases', 'dolly:people']);
    expect(out[0]).toMatchObject({ category: 'products', status: 'new', wikidata_qid: 'Q866', source: 'trending', subjects: ['online-video-platform'] });
    expect(out[1]!.subjects).toBeUndefined();
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
