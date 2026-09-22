import { describe, expect, it } from 'vitest';
import type { Tier } from '@ars-magna/engine';
import type { ClassName } from '@ars-magna/engine';
import {
  TEXT_ITSELF,
  classesUsed,
  lettersMatchLabel,
  submissionTier,
  wordRequestSentence,
  wordRequests,
  wordsKnown,
  wordsKnownLabel,
  wordsOf,
  type StandingOf,
  type TierOf,
} from './checks.ts';
import { ledger } from './ledger.ts';

/** The narrowest tiers the real dictionary gives these words. */
const TIERS: Record<string, Tier | null> = { i: 'common', da: 'common', ai: 'common', doomer: 'extended', starer: 'standard', qzx: null, radioo: null };
const tierOf: TierOf = (word) => (word in TIERS ? TIERS[word] : undefined);

/** The classes the real class files give these terms; every other word is no term. */
const CLASSES: Record<string, ClassName> = { b8: 'blends', '1': 'shorthand', '2': 'shorthand', '&': 'symbols', wtf: 'acronyms', eiffel: 'names' };
const standingOf: StandingOf = (word) => {
  if (word in TIERS) {
    const tier = TIERS[word]!;
    return { tier, termClass: tier === null ? (CLASSES[word] ?? null) : null };
  }
  return word in CLASSES ? { tier: null, termClass: CLASSES[word]! } : undefined;
};

describe('wordsOf', () => {
  it('reads the chunks between spaces as words, folded, apostrophes and hyphens carrying no letters', () => {
    expect(wordsOf('  I da   AI doomer ')).toEqual(['i', 'da', 'ai', 'doomer']);
    expect(wordsOf("it's a jack-o'-lantern")).toEqual(['its', 'a', 'jackolantern']);
    // A typed form is its letters-word, which the dictionary lists in every tier; a possessive is the plural's letters.
    expect(wordsOf("don't")).toEqual(['dont']);
    expect(wordsOf("dog's")).toEqual(['dogs']);
    // A digit and an ampersand are tokens of the pool, which Words known then says are no words; a lone exclamation mark is punctuation.
    expect(wordsOf('Beyoncé 4 & !')).toEqual(['beyonce', '4', '&']);
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

  it('counts the pool, so an anagram has to use the text’s digits and symbols as themselves', () => {
    // The letters alone leave the 1, the 8 and the 2 of the text unused.
    expect(lettersMatchLabel(ledger('Blink-182', 'blink'))).toBe('No');
    expect(lettersMatchLabel(ledger('Ke$ha', 'hake'))).toBe('No');
    // An anagram that uses them as terms of a class matches, as the search's own count does.
    expect(lettersMatchLabel(ledger('Blink-182', '1 2 link b8'))).toBe('Yes');
    expect(lettersMatchLabel(ledger('AT&T', 'tat &'))).toBe('Yes');
    // A reading that leaves a character out, or reads it as a letter, matches as before.
    expect(lettersMatchLabel(ledger('Reacher season 4', 'as one searcher', { '4': 'drop' }))).toBe('Yes');
    expect(lettersMatchLabel(ledger('Ke$ha', 'shake', { $: 's' }))).toBe('Yes');
    expect(lettersMatchLabel(ledger('Blink-182', ''))).toBe('—');
  });
});

describe('Words known', () => {
  it('knows every word the chosen tier has', () => {
    const result = wordsKnown(['i', 'da', 'ai', 'doomer'], standingOf, 'extended');
    expect(result).toEqual({ kind: 'known', terms: [] });
    expect(wordsKnownLabel(result, 'extended')).toBe('Yes · every word is in Extended');
  });

  it('names a word a wider tier has, and one no tier has, once each', () => {
    const result = wordsKnown(['i', 'da', 'ai', 'doomer', 'qzx', 'doomer'], standingOf, 'standard');
    expect(result).toEqual({
      kind: 'unknown',
      terms: [],
      words: [
        { word: 'doomer', tier: 'extended', termClass: null },
        { word: 'qzx', tier: null, termClass: null },
      ],
    });
    expect(wordsKnownLabel(result, 'standard')).toBe('No · doomer is in Extended, not Standard · qzx is not in the dictionary');
    expect(wordsKnownLabel(wordsKnown(['starer'], standingOf, 'common'), 'common')).toBe('No · starer is in Standard, not Common');
  });

  it('names each term’s class where the class is on', () => {
    const result = wordsKnown(['1', '2', 'i', 'b8'], standingOf, 'common', ['shorthand', 'blends']);
    expect(result).toEqual({
      kind: 'known',
      terms: [
        { word: '1', tier: null, termClass: 'shorthand' },
        { word: '2', tier: null, termClass: 'shorthand' },
        { word: 'b8', tier: null, termClass: 'blends' },
      ],
    });
    expect(wordsKnownLabel(result, 'common', ['shorthand', 'blends'])).toBe(
      'Yes · every word is in Common · 1 is shorthand · 2 is shorthand · b8 is a blend',
    );
    expect(classesUsed(result)).toEqual(['shorthand', 'blends']);
  });

  it('says what a term is when its class is not turned on, rather than calling it no word', () => {
    const result = wordsKnown(['i', 'b8', 'qzx'], standingOf, 'common', ['shorthand']);
    expect(wordsKnownLabel(result, 'common', ['shorthand'])).toBe(
      'No · b8 is a blend, not turned on · qzx is not in the dictionary',
    );
  });

  it('waits for every answer, and says nothing about an empty anagram', () => {
    expect(wordsKnown(['doomer', 'unasked'], standingOf, 'standard')).toEqual({ kind: 'pending' });
    expect(wordsKnownLabel({ kind: 'pending' }, 'standard')).toBe('Checking…');
    expect(wordsKnown([], standingOf, 'standard')).toEqual({ kind: 'empty' });
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

  it('asks for the words no tier has, and only those: a term of a class is not a word request', () => {
    expect(wordRequests(['i', 'doomer', 'qzx', 'radioo', 'qzx'], standingOf)).toEqual(['qzx', 'radioo']);
    expect(wordRequests(['i', 'doomer'], standingOf)).toEqual([]);
    expect(wordRequests(['b8', '1', 'qzx'], standingOf)).toEqual(['qzx']);
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
