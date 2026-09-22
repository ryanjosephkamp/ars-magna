/**
 * The Build page's two checks: Letters match, which the ledger answers, and
 * Words known, which the dictionary answers one term at a time.
 *
 * A term is a chunk of the anagram between spaces, folded as the search folds
 * a text: `it's` is the word `its`, a typed `don't` the word `dont`, and a
 * hyphenated `jack-o'-lantern` the one word `jackolantern`. A listed form's
 * letters-word is in every tier of the dictionary, so a typed `don't` is known
 * at Common; a possessive `dog's` is the word `dogs`. A term that is not a
 * word of any tier may be a term of a labelled class (D63) — `b8` a blend, `1`
 * shorthand, `&` a symbol — and the check names its class: known when the
 * class is on, and named as what it is when it is not, since turning it on is
 * one tick of the Terms control. Pure: the page looks each term up in the
 * engine and hands this module the answers.
 */
import { TIERS, normalizeLetters, type ClassName, type Tier } from '@ars-magna/engine';

import { CLASS_ONE } from './classes.ts';
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

/** What the dictionary says about one term: its narrowest tier, and its class when no tier has it. */
export type TermStanding = { readonly tier: Tier | null; readonly termClass: ClassName | null };

/** The same, for a term that has not been asked about yet. */
export type StandingOf = (word: string) => TermStanding | undefined;

/** One term of the anagram, as the check names it. */
export type CheckedTerm = TermStanding & { readonly word: string };

export type WordsKnown =
  | { readonly kind: 'empty' }
  | { readonly kind: 'pending' }
  /** Every term is known: the terms among them, once each, in the order typed. */
  | { readonly kind: 'known'; readonly terms: readonly CheckedTerm[] }
  /** Each term the search would not admit, once, in the order typed, and the terms it would. */
  | { readonly kind: 'unknown'; readonly words: readonly CheckedTerm[]; readonly terms: readonly CheckedTerm[] };

const rank = (tier: Tier) => TIERS.indexOf(tier);

/** A term the chosen tier and classes admit: a word of the tier, or a term of a class that is on. */
function admitted(standing: TermStanding, chosen: Tier, classes: readonly ClassName[]): boolean {
  if (standing.tier !== null && rank(standing.tier) <= rank(chosen)) return true;
  return standing.termClass !== null && classes.includes(standing.termClass);
}

export function wordsKnown(
  words: readonly string[],
  standingOf: StandingOf,
  chosen: Tier,
  classes: readonly ClassName[] = [],
): WordsKnown {
  if (words.length === 0) return { kind: 'empty' };
  const standings = words.map(standingOf);
  if (standings.some((s) => s === undefined)) return { kind: 'pending' };
  const unknown: CheckedTerm[] = [];
  const terms: CheckedTerm[] = [];
  words.forEach((word, i) => {
    const standing = standings[i] as TermStanding;
    const entry: CheckedTerm = { word, ...standing };
    const known = admitted(standing, chosen, classes);
    if (known && standing.termClass !== null && standing.tier === null) {
      if (!terms.some((t) => t.word === word)) terms.push(entry);
    } else if (!known && !unknown.some((u) => u.word === word)) unknown.push(entry);
  });
  return unknown.length === 0 ? { kind: 'known', terms } : { kind: 'unknown', words: unknown, terms };
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

/** What one term that is not a word of a tier reads as: `b8 is a blend`. */
function termNote(term: CheckedTerm, classes: readonly ClassName[]): string {
  if (term.termClass === null) return `${term.word} is not in the dictionary`;
  const what = `${term.word} is ${CLASS_ONE[term.termClass]}`;
  return classes.includes(term.termClass) ? what : `${what}, not turned on`;
}

/**
 * The Words known line, exactly: `Yes · every word is in Standard`, with each
 * term that is not a word named after it (`b8 is a blend`); or `No` and each
 * term the search would not admit, `doomer is in Extended, not Standard` for a
 * word a wider tier has, `b8 is a blend, not turned on` for a term of a class
 * that is off, and `qzx is not in the dictionary` for one nothing has.
 */
export function wordsKnownLabel(result: WordsKnown, chosen: Tier, classes: readonly ClassName[] = []): string {
  switch (result.kind) {
    case 'empty':
      return '—';
    case 'pending':
      return 'Checking…';
    case 'known':
      return [`Yes · every word is in ${TIER_NAME[chosen]}`, ...result.terms.map((term) => termNote(term, classes))].join(' · ');
    case 'unknown':
      return [
        'No',
        ...result.words.map((term) =>
          term.tier === null ? termNote(term, classes) : `${term.word} is in ${TIER_NAME[term.tier]}, not ${TIER_NAME[chosen]}`,
        ),
        ...result.terms.map((term) => termNote(term, classes)),
      ].join(' · ');
  }
}

/** The classes a submission's terms come from, once each, in the plan's table order. */
export function classesUsed(result: WordsKnown): ClassName[] {
  const terms = result.kind === 'known' ? result.terms : result.kind === 'unknown' ? result.terms : [];
  const out: ClassName[] = [];
  for (const { termClass } of terms) if (termClass !== null && !out.includes(termClass)) out.push(termClass);
  return out;
}


/**
 * The tier a submission records: the narrowest that holds every word the
 * dictionary has, which is how a hit's own tier is chosen. Terms of a class
 * are in no tier and do not widen it, and nor do words in no tier, which are
 * word requests; with none known, Extended.
 */
export function submissionTier(words: readonly string[], tierOf: TierOf): Tier {
  const known = words.map(tierOf).filter((t): t is Tier => t !== null && t !== undefined);
  if (known.length === 0) return 'extended';
  return known.reduce((widest, t) => (rank(t) > rank(widest) ? t : widest));
}

/**
 * The words nothing has, once each, in the order typed: a submission's word
 * requests. A term of a labelled class is not one — the vocabulary has it, as
 * a term rather than a word.
 */
export function wordRequests(words: readonly string[], standingOf: StandingOf): string[] {
  return [...new Set(words.filter((word) => standingOf(word)?.tier === null && standingOf(word)?.termClass === null))];
}

/** What the page says of each word request before a submission goes. */
export function wordRequestSentence(word: string): string {
  return `${word} is not in the dictionary; it will be reviewed as a word request too.`;
}
