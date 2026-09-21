import { describe, expect, it } from 'vitest';
import type { Tier } from '@ars-magna/engine';
import {
  TEXT_ITSELF,
  lettersMatchLabel,
  submissionTier,
  wordRequestSentence,
  wordRequests,
  wordsKnown,
  wordsKnownLabel,
  wordsOf,
  type TierOf,
} from './checks.ts';
import { ledger } from './ledger.ts';

/** The narrowest tiers the real dictionary gives these words. */
const TIERS: Record<string, Tier | null> = { i: 'common', da: 'common', ai: 'common', doomer: 'extended', starer: 'standard', qzx: null, radioo: null };
const tierOf: TierOf = (word) => (word in TIERS ? TIERS[word] : undefined);

describe('wordsOf', () => {
  it('reads the chunks between spaces as words, folded, apostrophes and hyphens carrying no letters', () => {
    expect(wordsOf('  I da   AI doomer ')).toEqual(['i', 'da', 'ai', 'doomer']);
    expect(wordsOf("it's a jack-o'-lantern")).toEqual(['its', 'a', 'jackolantern']);
    // A typed form is its letters-word, which the dictionary lists in every tier; a possessive is the plural's letters.
    expect(wordsOf("don't")).toEqual(['dont']);
    expect(wordsOf("dog's")).toEqual(['dogs']);
    // A number and an ampersand are read as words; a lone exclamation mark is punctuation.
    expect(wordsOf('Beyoncé 4 & !')).toEqual(['beyonce', 'four', 'and']);
    expect(wordsOf('Beyoncé ?? !')).toEqual(['beyonce']);
    expect(wordsOf(' - ')).toEqual([]);
  });
});

describe('Letters match', () => {
  it('reads Yes, No, or a dash while a box is empty', () => {
    expect(lettersMatchLabel(ledger('Dario Amodei', 'I da AI doomer'))).toBe('Yes');
    expect(lettersMatchLabel(ledger('Dario Amodei', 'I da AI doome'))).toBe('No');
    expect(lettersMatchLabel(ledger('Dario Amodei', 'I da AI doomers'))).toBe('No');
    expect(lettersMatchLabel(ledger('Dario Amodei', ''))).toBe('—');
    expect(lettersMatchLabel(ledger('', 'doomer'))).toBe('—');
  });
});

describe('Words known', () => {
  it('knows every word the chosen tier has', () => {
    const result = wordsKnown(['i', 'da', 'ai', 'doomer'], tierOf, 'extended');
    expect(result).toEqual({ kind: 'known' });
    expect(wordsKnownLabel(result, 'extended')).toBe('Yes · every word is in Extended');
  });

  it('names a word a wider tier has, and one no tier has, once each', () => {
    const result = wordsKnown(['i', 'da', 'ai', 'doomer', 'qzx', 'doomer'], tierOf, 'standard');
    expect(result).toEqual({
      kind: 'unknown',
      words: [
        { word: 'doomer', tier: 'extended' },
        { word: 'qzx', tier: null },
      ],
    });
    expect(wordsKnownLabel(result, 'standard')).toBe('No · doomer is in Extended, not Standard · qzx is not in the dictionary');
    expect(wordsKnownLabel(wordsKnown(['starer'], tierOf, 'common'), 'common')).toBe('No · starer is in Standard, not Common');
  });

  it('waits for every answer, and says nothing about an empty anagram', () => {
    expect(wordsKnown(['doomer', 'unasked'], tierOf, 'standard')).toEqual({ kind: 'pending' });
    expect(wordsKnownLabel({ kind: 'pending' }, 'standard')).toBe('Checking…');
    expect(wordsKnown([], tierOf, 'standard')).toEqual({ kind: 'empty' });
    expect(wordsKnownLabel({ kind: 'empty' }, 'standard')).toBe('—');
  });
});

describe('what a submission records', () => {
  it('takes the narrowest tier that holds every word the dictionary has', () => {
    expect(submissionTier(['i', 'da', 'ai'], tierOf)).toBe('common');
    expect(submissionTier(['i', 'starer'], tierOf)).toBe('standard');
    expect(submissionTier(['i', 'da', 'ai', 'doomer'], tierOf)).toBe('extended');
    // A word request does not widen it.
    expect(submissionTier(['i', 'starer', 'qzx'], tierOf)).toBe('standard');
    expect(submissionTier(['qzx'], tierOf)).toBe('extended');
  });

  it('asks for the words no tier has, and only those', () => {
    expect(wordRequests(['i', 'doomer', 'qzx', 'radioo', 'qzx'], tierOf)).toEqual(['qzx', 'radioo']);
    expect(wordRequests(['i', 'doomer'], tierOf)).toEqual([]);
  });

  it('says so in the exact sentence', () => {
    expect(wordRequestSentence('doomer')).toBe('doomer is not in the dictionary; it will be reviewed as a word request too.');
  });
});

describe('the text itself', () => {
  it('has one line, which the page shows in place of the letters verdict', () => {
    expect(TEXT_ITSELF).toBe('That is the text itself.');
  });
});
