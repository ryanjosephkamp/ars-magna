import { describe, expect, it } from 'vitest';

import { SECTIONS, hitPage, ordered, pickOfTheDay, publishable, shelfOf, slugOf, toPublic, type HitRecord } from './build.ts';

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
    // A shelf tag becomes the shelf, not a tag.
    expect(toPublic(record({ tags: ['classic', 'shelf:stretch'] }))).toMatchObject({ shelf: 'stretch', tags: ['classic'] });
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
    expect(page).toContain('url=/hits.html#starwars-titles-stars-war');
    expect(hitPage(toPublic(record({ input: 'A "quoted" <name>' })), 'x')).toContain('A &quot;quoted&quot; &lt;name&gt;');
  });
});
