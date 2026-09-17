import { describe, expect, it } from 'vitest';

import {
  FOLD,
  SECTIONS,
  hitPage,
  inOrder,
  linkedSection,
  ordered,
  pickOfTheDay,
  publishable,
  sectionAt,
  sectionOpen,
  shelfOf,
  slugOf,
  toPublic,
  withDefaults,
  googleUrl,
  type HitRecord,
} from './build.ts';

const record = (over: Partial<HitRecord>): HitRecord => ({
  id: 'dormitory:phrases:dirty-room',
  input: 'dormitory',
  category: 'phrases',
  words: ['dirty', 'room'],
  display: 'dirty room',
  letters: 'dimoorrty',
  judge: [],
  submitter: 'seed',
  added: '2026-09-11',
  tags: ['classic'],
  status: 'accepted',
  ...over,
});

const hits: HitRecord[] = [
  record({}),
  record({ id: 'starwars:titles:stars-war', input: 'Star Wars', category: 'titles', words: ['stars', 'war'], display: 'stars war', letters: 'aarrsstw', status: 'featured', judge: [{ total: 12, aptness: 4, grammar: 4, rationale: 'The title as a sentence.', model: 'm' }], tags: [] }),
  record({ id: 'kindle:products:linked', input: 'Kindle', category: 'products', words: ['linked'], display: 'linked', letters: 'deikln', status: 'proposed' }),
  record({ id: 'listen:phrases:silent', input: 'listen', words: ['silent'], display: 'silent', letters: 'eilnst', status: 'retired' }),
];

describe('gallery build', () => {
  it('publishes accepted and featured hits only, featured first', () => {
    const rows = ordered(publishable(hits).map(toPublic));
    expect(rows.map((r) => r.id)).toEqual(['starwars:titles:stars-war', 'dormitory:phrases:dirty-room']);
    expect(rows[0]).toMatchObject({ featured: true, shelf: 'greatest', score: 12, justification: 'The title as a sentence.', submitter: null });
    expect(rows[1]).toMatchObject({ featured: false, shelf: 'interesting', score: null, justification: '', tags: ['classic'] });
  });

  it('makes a slug that reads back and a note tag into the justification', () => {
    expect(slugOf('dormitory:phrases:dirty-room')).toBe('dormitory-phrases-dirty-room');
    const withNote = toPublic(record({ tags: ['submitted', 'note:the one everyone knows'], submitter: 'someone' }));
    expect(withNote.justification).toBe('the one everyone knows');
    expect(withNote.tags).toEqual(['submitted']);
    expect(withNote.submitter).toBe('someone');
    // `seed` and `mcp` are how a hit reached the file, not someone to credit on the page.
    expect(toPublic(record({ submitter: 'seed' })).submitter).toBeNull();
    expect(toPublic(record({ submitter: 'mcp' })).submitter).toBeNull();
    // A shelf tag becomes the shelf, not a tag.
    expect(toPublic(record({ tags: ['classic', 'shelf:stretch'] }))).toMatchObject({ shelf: 'stretch', tags: ['classic'] });
  });

  it('starts every row with no orderings, and reads an older list as having none of the newer fields', () => {
    expect(toPublic(record({})).orderings).toEqual([]);
    const { about: _a, wikipedia: _w, orderings: _o, ...older } = toPublic(record({}));
    expect(withDefaults(older)).toMatchObject({ about: null, wikipedia: null, orderings: [] });
    expect(withDefaults({ ...older, orderings: ['room dirty'] }).orderings).toEqual(['room dirty']);
  });

  it('carries a hit\'s senses when it has one, and leaves the field out when it has none', () => {
    const senses = { da: 'Short for the, as in casual speech.', ai: 'Artificial intelligence.' };
    expect(toPublic(record({ words: ['i', 'da', 'ai', 'doomer'], senses })).senses).toEqual(senses);
    expect(toPublic(record({}))).not.toHaveProperty('senses');
    expect(toPublic(record({ senses: {} }))).not.toHaveProperty('senses');
    // A list cached from before senses existed reads as having none.
    const { orderings: _o, ...older } = toPublic(record({}));
    expect(withDefaults(older)).not.toHaveProperty('senses');
  });

  it('searches Google for the input as a reader would type it', () => {
    expect(googleUrl('Dolly Parton')).toBe('https://www.google.com/search?q=Dolly%20Parton');
    expect(googleUrl("(What's the Story) Morning Glory?")).toBe('https://www.google.com/search?q=(What\'s%20the%20Story)%20Morning%20Glory%3F');
  });

  it('carries what the input is and its Wikipedia article, null until the hit has them', () => {
    expect(toPublic(record({}))).toMatchObject({ about: null, wikipedia: null });
    expect(
      toPublic(record({ about: 'A dormitory is a building of shared bedrooms.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' })),
    ).toMatchObject({ about: 'A dormitory is a building of shared bedrooms.', wikipedia: 'https://en.wikipedia.org/wiki/Dormitory' });
  });

  it('prefers the operator sentence, then the v2 judge, then the v1 rationale, then a note', () => {
    const v1 = { model: 'm', total: 11, aptness: 3, grammar: 4, rationale: 'v1 rationale' };
    const v2 = { model: 'm', relation: 4, reads: 3, rationale: 'v2 rationale', justification: 'v2 justification' };
    const { justification: _none, ...v2WithoutJustification } = v2;
    const tags = ['note:a note'];
    expect(toPublic(record({ judge: [v1, v2], tags, justification: 'mine' })).justification).toBe('mine');
    expect(toPublic(record({ judge: [v1, v2], tags })).justification).toBe('v2 justification');
    expect(toPublic(record({ judge: [v1, v2WithoutJustification], tags })).justification).toBe('v1 rationale');
    expect(toPublic(record({ judge: [], tags })).justification).toBe('a note');
  });

  it('shelves by the best relation, with v1 aptness as relation', () => {
    expect(shelfOf(record({ status: 'featured', judge: [] }))).toBe('greatest');
    expect(shelfOf(record({ judge: [] }))).toBe('interesting');
    expect(shelfOf(record({ judge: [{ model: 'm', rationale: 'r', relation: 4, reads: 1 }] }))).toBe('interesting');
    expect(shelfOf(record({ judge: [{ model: 'm', rationale: 'r', relation: 3, reads: 3 }] }))).toBe('stretch');
    expect(shelfOf(record({ judge: [{ model: 'm', rationale: 'r', total: 12, aptness: 3, grammar: 5 }] }))).toBe('stretch');
    // The operator's shelf tag decides over the scores, but not over featured.
    expect(shelfOf(record({ judge: [{ model: 'm', rationale: 'r', relation: 5, reads: 3 }], tags: ['shelf:stretch'] }))).toBe('stretch');
    expect(shelfOf(record({ judge: [{ model: 'm', rationale: 'r', relation: 3, reads: 3 }], tags: ['shelf:interesting'] }))).toBe('interesting');
    expect(shelfOf(record({ status: 'featured', tags: ['shelf:stretch'] }))).toBe('greatest');
  });

  it('orders the list by section, newest first within each', () => {
    const stretch = [{ model: 'm', rationale: 'r', relation: 3, reads: 3 }];
    const rows = ordered([
      toPublic(record({ id: 'a:phrases:old-stretch', added: '2026-09-01', judge: stretch })),
      toPublic(record({ id: 'b:phrases:new-interesting', added: '2026-09-13' })),
      toPublic(record({ id: 'c:phrases:old-interesting', added: '2026-09-02' })),
      toPublic(record({ id: 'd:phrases:greatest', added: '2026-09-01', status: 'featured' })),
    ]);
    expect(rows.map((r) => r.id)).toEqual(['d:phrases:greatest', 'b:phrases:new-interesting', 'c:phrases:old-interesting', 'a:phrases:old-stretch']);
    expect(SECTIONS.map((s) => [s.shelf, s.label])).toEqual([
      ['greatest', 'Greatest Hits'],
      ['interesting', 'Interesting'],
      ['stretch', 'A stretch'],
    ]);
  });

  it('orders a section newest first or A to Z by input, then anagram', () => {
    const rows = [
      toPublic(record({ id: 'titanic:titles:i-intact', input: 'Titanic', display: 'I intact', added: '2026-09-12' })),
      toPublic(record({ id: 'amsterdam:places:dam-stream', input: 'Amsterdam', display: 'dam stream', added: '2026-09-11' })),
      toPublic(record({ id: 'animosity:phrases:amity-is-no', input: 'animosity', display: 'is no amity', added: '2026-09-14' })),
      toPublic(record({ id: 'animosity:phrases:amity-in-so', input: 'Animosity', display: 'so in amity', added: '2026-09-13' })),
    ];
    expect(inOrder(rows, 'newest').map((r) => r.display)).toEqual(['is no amity', 'so in amity', 'I intact', 'dam stream']);
    // Case does not decide the input; the anagram breaks a tie between the same input.
    expect(inOrder(rows, 'alphabetical').map((r) => r.display)).toEqual(['dam stream', 'is no amity', 'so in amity', 'I intact']);
    // Most votes first; a tie, including no votes at all, goes A to Z.
    const counts = { 'titanic:titles:i-intact': 3, 'animosity:phrases:amity-in-so': 3, 'amsterdam:places:dam-stream': 1 };
    expect(inOrder(rows, 'votes', counts).map((r) => r.display)).toEqual(['so in amity', 'I intact', 'dam stream', 'is no amity']);
    expect(inOrder(rows, 'votes').map((r) => r.display)).toEqual(inOrder(rows, 'alphabetical').map((r) => r.display));
  });

  it('folds a section at twelve rows unless a filter, the reader or a link opens it', () => {
    const rows = Array.from({ length: 14 }, (_, i) =>
      toPublic(record({ id: `word${String.fromCharCode(97 + i)}:phrases:w`, input: `word ${i}` })),
    );
    const featured = toPublic(record({ id: 'starwars:titles:stars-war', input: 'Star Wars', status: 'featured' }));
    expect(FOLD).toBe(12);
    // A link opens its hit's section, wherever the hit sits in it; a link to nothing opens none.
    expect(linkedSection([featured, ...rows], rows[12]!.slug)).toBe('interesting');
    expect(linkedSection([featured, ...rows], rows[0]!.slug)).toBe('interesting');
    expect(linkedSection([featured, ...rows], featured.slug)).toBe('greatest');
    expect(linkedSection(rows, 'nothing-here')).toBeNull();
    expect(linkedSection(rows, null)).toBeNull();

    const closed = { filtered: false, chosen: undefined, linked: null };
    expect(sectionOpen('interesting', closed)).toBe(false);
    expect(sectionOpen('interesting', { ...closed, filtered: true })).toBe(true);
    expect(sectionOpen('interesting', { ...closed, chosen: true })).toBe(true);
    expect(sectionOpen('interesting', { ...closed, linked: 'interesting' })).toBe(true);
    expect(sectionOpen('stretch', { ...closed, linked: 'interesting' })).toBe(false);
    // Show fewer on the linked section folds it; a filter still shows every match.
    expect(sectionOpen('interesting', { ...closed, chosen: false, linked: 'interesting' })).toBe(false);
    expect(sectionOpen('interesting', { filtered: true, chosen: false, linked: null })).toBe(true);
  });

  it('names the section under a line, and none above the first or past the last', () => {
    // Forty pixels between sections, as the page has.
    const bounds = [
      { shelf: 'greatest' as const, top: 100, bottom: 460 },
      { shelf: 'interesting' as const, top: 500, bottom: 860 },
      { shelf: 'stretch' as const, top: 900, bottom: 1400 },
    ];
    expect(sectionAt(bounds, 50)).toBeNull();
    expect(sectionAt(bounds, 100)).toBe('greatest');
    expect(sectionAt(bounds, 480)).toBe('greatest');
    expect(sectionAt(bounds, 500)).toBe('interesting');
    expect(sectionAt(bounds, 1399)).toBe('stretch');
    expect(sectionAt(bounds, 1400)).toBeNull();
  });

  it('picks the same anagram of the day for everyone, from Greatest Hits and Interesting', () => {
    const rows = publishable(hits).map(toPublic);
    expect(pickOfTheDay(rows, '2026-09-11')).toEqual(pickOfTheDay(rows, '2026-09-11'));
    const stretch = toPublic(record({ id: 'funeral:phrases:fun-real', input: 'funeral', display: 'real fun', judge: [{ model: 'm', rationale: 'r', relation: 3, reads: 3 }] }));
    const dates = Array.from({ length: 60 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));
    const picks = new Set(dates.map((d) => pickOfTheDay([...rows, stretch], d)!.id));
    // Both the Greatest Hit and the Interesting one come up over sixty days; A stretch never does.
    expect([...picks].sort()).toEqual(['dormitory:phrases:dirty-room', 'starwars:titles:stars-war']);
    expect(pickOfTheDay([stretch], '2026-09-11')!.id).toBe('funeral:phrases:fun-real');
    expect(pickOfTheDay([], '2026-09-11')).toBeNull();
  });

  it('renders a per-hit page with the meta tags and a redirect', () => {
    const page = hitPage(toPublic(hits[1]!), 'https://ars-magna.pages.dev');
    expect(page).toContain('<title>Star Wars → stars war — Ars Magna</title>');
    expect(page).toContain('property="og:description" content="The title as a sentence."');
    expect(page).toContain('href="https://ars-magna.pages.dev/hits/starwars-titles-stars-war/"');
    expect(page).toContain('url=/hits#starwars-titles-stars-war');
    expect(hitPage(toPublic(record({ input: 'A "quoted" <name>' })), 'x')).toContain('A &quot;quoted&quot; &lt;name&gt;');
    // What the input is describes the page first, when the hit says.
    const about = hitPage(toPublic({ ...hits[1]!, about: 'Star Wars is an epic space opera franchise.' }), 'https://ars-magna.pages.dev');
    expect(about).toContain('<meta name="description" content="Star Wars is an epic space opera franchise." />');
    expect(about).toContain('property="og:description" content="Star Wars is an epic space opera franchise."');
  });
});
