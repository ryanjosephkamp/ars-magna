import { describe, expect, it } from 'vitest';

import { hitPage, ordered, pickOfTheDay, publishable, slugOf, toPublic, type HitRecord } from './build.ts';

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
  record({ id: 'starwars:titles:stars-war', input: 'Star Wars', category: 'titles', words: ['stars', 'war'], display: 'stars war', letters: 'aarrsstw', status: 'featured', judge: [{ total: 12, rationale: 'The title as a sentence.', model: 'm' }], tags: [] }),
  record({ id: 'kindle:products:linked', input: 'Kindle', category: 'products', words: ['linked'], display: 'linked', letters: 'deikln', status: 'proposed' }),
  record({ id: 'listen:phrases:silent', input: 'listen', words: ['silent'], display: 'silent', letters: 'eilnst', status: 'retired' }),
];

describe('gallery build', () => {
  it('publishes accepted and featured hits only, featured first', () => {
    const rows = ordered(publishable(hits).map(toPublic));
    expect(rows.map((r) => r.id)).toEqual(['starwars:titles:stars-war', 'dormitory:phrases:dirty-room']);
    expect(rows[0]).toMatchObject({ featured: true, score: 12, rationale: 'The title as a sentence.', submitter: null });
    expect(rows[1]).toMatchObject({ featured: false, score: null, rationale: '', tags: ['classic'] });
  });

  it('makes a slug that reads back and a note tag into the rationale', () => {
    expect(slugOf('dormitory:phrases:dirty-room')).toBe('dormitory-phrases-dirty-room');
    const withNote = toPublic(record({ tags: ['submitted', 'note:the one everyone knows'], submitter: 'someone' }));
    expect(withNote.rationale).toBe('the one everyone knows');
    expect(withNote.tags).toEqual(['submitted']);
    expect(withNote.submitter).toBe('someone');
  });

  it('picks the same anagram of the day for everyone and changes by date', () => {
    const rows = publishable(hits).map(toPublic);
    const today = pickOfTheDay(rows, '2026-09-11');
    expect(today).toEqual(pickOfTheDay(rows, '2026-09-11'));
    // Only the featured one is in the pool while any is featured.
    expect(today!.id).toBe('starwars:titles:stars-war');
    const plain = rows.map((r) => ({ ...r, featured: false }));
    const days = new Set(['2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14'].map((d) => pickOfTheDay(plain, d)!.id));
    expect(days.size).toBeGreaterThan(1);
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
