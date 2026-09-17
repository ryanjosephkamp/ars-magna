import { describe, expect, it } from 'vitest';

import { foldLetters } from '@ars-magna/engine';

import type { PublicHit } from '../hits/build.ts';
import { discoveredFor, discoveryFor } from './inDiscoveries.ts';

const hit = (over: Partial<PublicHit> & Pick<PublicHit, 'id' | 'words' | 'letters' | 'shelf'>): PublicHit => ({
  slug: over.id.replace(/:/g, '-'),
  input: 'A gentleman',
  category: 'phrases',
  display: over.words.join(' '),
  justification: '',
  score: null,
  featured: over.shelf === 'greatest',
  submitter: null,
  added: '2026-09-16',
  tags: [],
  about: null,
  wikipedia: null,
  orderings: [],
  ...over,
});

const elegant = hit({ id: 'agentleman:phrases:elegant-man', words: ['elegant', 'man'], letters: 'aaeeglmnnt', shelf: 'greatest' });
const male = hit({ id: 'agentleman:phrases:an-gent-male', words: ['an', 'male', 'gent'], letters: 'aaeeglmnnt', shelf: 'stretch' });
const elan = hit({ id: 'agentleman:phrases:elan-get-man', words: ['man', 'get', 'elan'], letters: 'aaeeglmnnt', shelf: 'stretch' });
const odor = hit({ id: 'doritos:products:its-odor', input: 'Doritos', words: ['its', 'odor'], letters: 'dioorst', shelf: 'stretch' });
const beyonce = hit({ id: 'beyonce:people:boney-ec', input: 'Beyoncé', words: ['boney', 'ec'], letters: 'bceenoy', shelf: 'interesting' });
const all = [male, odor, elan, elegant, beyonce];

describe('In Discoveries', () => {
  it('finds the hits for a search’s letters, in section order, most voted first with ties A to Z', () => {
    const found = discoveredFor(all, 'agentleman', { [elan.id]: 2 });
    expect(found.sections.map((s) => [s.label, s.hits.map((h) => h.display)])).toEqual([
      ['Greatest Hits', ['elegant man']],
      ['A stretch', ['man get elan', 'an male gent']],
    ]);
    // Without counts, a tie goes A to Z by the anagram.
    expect(discoveredFor(all, 'agentleman').sections[1]!.hits.map((h) => h.display)).toEqual(['an male gent', 'man get elan']);
    expect(discoveredFor(all, 'zzz').sections).toEqual([]);
  });

  it('matches letters the way the search folds them', () => {
    expect(discoveredFor(all, foldLetters('Beyoncé').letters).sections.map((s) => s.hits[0]!.id)).toEqual([beyonce.id]);
  });

  it('labels a row with its section, whatever order its words are in', () => {
    const found = discoveredFor(all, 'agentleman');
    expect(discoveryFor(found, ['man', 'elegant'])).toEqual({ hit: elegant, label: 'Greatest Hits', respelled: false });
    expect(discoveryFor(found, ['entangle', 'am'])).toBeNull();
    expect(discoveryFor(null, ['elegant', 'man'])).toBeNull();
  });

  it('matches a row that spells a hit another way, and says so', () => {
    expect(discoveryFor(discoveredFor(all, 'doritos'), ['door', 'sit'])).toEqual({ hit: odor, label: 'A stretch', respelled: true });
    expect(discoveryFor(discoveredFor(all, 'agentleman'), ['man', 'get', 'lane'])).toMatchObject({ hit: elan, respelled: true });
  });

  it('gives a row shared by two hits to the higher section, then the more voted', () => {
    const twin = hit({ id: 'agentleman:people:elegant-man', category: 'people', words: ['elegant', 'man'], letters: 'aaeeglmnnt', shelf: 'stretch' });
    expect(discoveryFor(discoveredFor([twin, elegant], 'agentleman'), ['elegant', 'man'])!.hit).toBe(elegant);
    const other = hit({ id: 'agentleman:companies:an-gent-male', category: 'companies', words: ['an', 'male', 'gent'], letters: 'aaeeglmnnt', shelf: 'stretch' });
    expect(discoveryFor(discoveredFor([male, other], 'agentleman', { [other.id]: 3 }), ['gent', 'an', 'male'])!.hit).toBe(other);
  });
});
