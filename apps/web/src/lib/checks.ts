/**
 * The Build page's two checks: Letters match, which the ledger answers, and
 * Words known, which the dictionary answers one word at a time.
 *
 * A word is a chunk of the anagram between spaces, folded as the search folds
 * letters: `it's` is the word `its`, a typed `don't` the word `dont`, and a
 * hyphenated `jack-o'-lantern` the one word `jackolantern`. A listed form's
 * letters-word is in every tier of the dictionary, so a typed `don't` is
 * known at Common; a possessive `dog's` is the word `dogs`. Pure: the page
 * looks each word's tiers up in the engine and hands this module the answers.
 */
import { TIERS, normalizeLetters, type Tier } from '@ars-magna/engine';

import type { Ledger } from './ledger.ts';

const TIER_NAME: Record<Tier, string> = { common: 'Common', standard: 'Standard', full: 'Full', extended: 'Extended' };

/** The anagram's words, folded, in the order typed. */
export function wordsOf(anagram: string): string[] {
  return anagram
    .split(/\s+/)
    .map((word) => normalizeLetters(word))
    .filter((word) => word.length > 0);
}

/**
 * What the dictionary says about one word: the narrowest tier that has it,
 * `null` when no tier does, `undefined` while it has not been asked.
 */
export type TierOf = (word: string) => Tier | null | undefined;

export type WordsKnown =
  | { readonly kind: 'empty' }
  | { readonly kind: 'pending' }
  | { readonly kind: 'known' }
  /** Each word the chosen tier lacks, once, in the order typed, with the narrowest tier that has it. */
  | { readonly kind: 'unknown'; readonly words: readonly { readonly word: string; readonly tier: Tier | null }[] };

const rank = (tier: Tier) => TIERS.indexOf(tier);

export function wordsKnown(words: readonly string[], tierOf: TierOf, chosen: Tier): WordsKnown {
  if (words.length === 0) return { kind: 'empty' };
  const tiers = words.map(tierOf);
  if (tiers.some((t) => t === undefined)) return { kind: 'pending' };
  const unknown: { word: string; tier: Tier | null }[] = [];
  words.forEach((word, i) => {
    const tier = tiers[i] as Tier | null;
    if ((tier === null || rank(tier) > rank(chosen)) && !unknown.some((u) => u.word === word)) unknown.push({ word, tier });
  });
  return unknown.length === 0 ? { kind: 'known' } : { kind: 'unknown', words: unknown };
}

/**
 * What the verdict line reads when the anagram is the text itself: its own
 * words in any order, or a re-spacing of it. The letters match and the words
 * are known, so both checks answer as they do; what the page will not do is
 * offer to send the text to Discover as an anagram of itself.
 */
export const TEXT_ITSELF = 'That is the text itself.';

export function lettersMatchLabel(l: Ledger): string {
  if (l.text.letters.length === 0 || l.anagram.letters.length === 0) return '—';
  return l.match ? 'Yes' : 'No';
}

/**
 * The Words known line, exactly: `Yes · every word is in Standard`, or `No`
 * and each word the tier lacks, `doomer is in Extended, not Standard` for one
 * a wider tier has and `qzx is not in the dictionary` for one no tier has.
 */
export function wordsKnownLabel(result: WordsKnown, chosen: Tier): string {
  switch (result.kind) {
    case 'empty':
      return '—';
    case 'pending':
      return 'Checking…';
    case 'known':
      return `Yes · every word is in ${TIER_NAME[chosen]}`;
    case 'unknown':
      return [
        'No',
        ...result.words.map(({ word, tier }) =>
          tier === null ? `${word} is not in the dictionary` : `${word} is in ${TIER_NAME[tier]}, not ${TIER_NAME[chosen]}`,
        ),
      ].join(' · ');
  }
}

/**
 * The tier a submission records: the narrowest that holds every word the
 * dictionary has, which is how a hit's own tier is chosen. Words in no tier
 * are word requests and do not widen it; with none known, Extended.
 */
export function submissionTier(words: readonly string[], tierOf: TierOf): Tier {
  const known = words.map(tierOf).filter((t): t is Tier => t !== null && t !== undefined);
  if (known.length === 0) return 'extended';
  return known.reduce((widest, t) => (rank(t) > rank(widest) ? t : widest));
}

/** The words no tier has, once each, in the order typed: a submission's word requests. */
export function wordRequests(words: readonly string[], tierOf: TierOf): string[] {
  return [...new Set(words.filter((word) => tierOf(word) === null))];
}

/** What the page says of each word request before a submission goes. */
export function wordRequestSentence(word: string): string {
  return `${word} is not in the dictionary; it will be reviewed as a word request too.`;
}
