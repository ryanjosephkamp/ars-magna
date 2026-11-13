import { describe, expect, it } from 'vitest';

import { parseFacts, wordFacts } from '../src/facts.ts';
import { factOf } from '../src/facts-extract.ts';

describe('factOf', () => {
  it('keeps whether a record was generated or vouched for, never which source wrote it', () => {
    expect(factOf({ generation_method: 'suffix', source: 'synthetic_generation' })).toBe('generated');
    expect(factOf({ source: 'any_intake' })).toBeNull();
    expect(factOf({ candidate_source: ['wordnet_valid', 'linux_unlikely'] })).toBeNull();
    expect(factOf({ candidate_source: ['aalii_unlikely'] })).toBe('unattested');
    expect(factOf({})).toBe('unattested');
  });
});

describe('parseFacts', () => {
  it('reads one spelling and one fact per line', () => {
    const facts = parseFacts('abacteremicer\tgenerated\naalii\tunattested\n');
    expect([...facts]).toEqual([
      ['abacteremicer', 'generated'],
      ['aalii', 'unattested'],
    ]);
  });

  it('refuses a line it cannot read', () => {
    expect(() => parseFacts('word\tattested\n')).toThrow(/cannot read/);
    expect(() => parseFacts('word\n')).toThrow(/cannot read/);
  });
});

describe('wordFacts', () => {
  const words = ['adlib', 'broth', 'nonlivabler', 'aalii', 'onsen'];
  const indexOf = new Map(words.map((w, i) => [w, i]));
  const facts = parseFacts('nonlivabler\tgenerated\nad-lib\tgenerated\naalii\tunattested\n');

  it('treats a spelling the file does not name as vouched for', () => {
    const [, broth, nonlivabler, aalii, onsen] = wordFacts(facts, ['broth', 'nonlivabler', 'aalii'], indexOf, words.length);
    expect(broth).toEqual({ generated: false, vouched: true });
    expect(nonlivabler).toEqual({ generated: true, vouched: false });
    expect(aalii).toEqual({ generated: false, vouched: false });
    // A word with no spelling in the pinned list (a site addition) is neither.
    expect(onsen).toEqual({ generated: false, vouched: false });
  });

  it('counts a word as generated only when every spelling of it was', () => {
    const [adlib] = wordFacts(facts, ['ad-lib', 'adlib'], indexOf, words.length);
    expect(adlib).toEqual({ generated: false, vouched: true });
    const [onlyGenerated] = wordFacts(facts, ['ad-lib'], indexOf, words.length);
    expect(onlyGenerated).toEqual({ generated: true, vouched: false });
  });
});
