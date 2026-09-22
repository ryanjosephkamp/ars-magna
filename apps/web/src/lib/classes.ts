/**
 * The term classes on the page: what each is called, which ones a reader can
 * turn on, and what the count line says about them.
 *
 * Decision D63: every term of an anagram is a word of the dictionary or a term
 * of a labelled class, and words alone is the default. The Terms control turns
 * a class on; the lines under the field turn a character's leet readings on.
 * Numerals and leet are made by the engine from the text itself, so neither
 * has a file; the rest come from the class files through `dict:build`.
 *
 * When a search answers 0 because the text has characters no word can use, the
 * page counts once more with the classes that could use them and offers them
 * (`offerFor`). Nothing offers names or acronyms: their terms are letters, so
 * they cannot answer a stranded digit, and a second number beside every
 * ordinary search is exactly the noise this page does not have.
 *
 * Pure: the page hands in what the engine and terms.json said.
 */
import { CLASSES, lettersOf, type ClassName } from '@ars-magna/engine';
import { isNumeral, type Term } from './terms.ts';

/** The control's label for each class. */
export const CLASS_LABEL: Readonly<Record<ClassName, string>> = {
  numerals: 'Numerals',
  symbols: 'Symbols',
  shorthand: 'Shorthand',
  blends: 'Blends',
  acronyms: 'Acronyms',
  leet: 'Leet',
  names: 'Names',
  slang: 'Slang',
};

/** The class as a count line names it, in a list of them. */
export const CLASS_WORD: Readonly<Record<ClassName, string>> = {
  numerals: 'numerals',
  symbols: 'symbols',
  shorthand: 'shorthand',
  blends: 'blends',
  acronyms: 'acronyms',
  leet: 'leet',
  names: 'names',
  slang: 'slang',
};

/**
 * The class as the word panel's chip names it, where a word's part of speech
 * would be: `blend bait`, `acronym what the fuck`, as `noun a container` reads.
 */
export const CLASS_CHIP: Readonly<Record<ClassName, string>> = {
  numerals: 'numeral',
  symbols: 'symbol',
  shorthand: 'shorthand',
  blends: 'blend',
  acronyms: 'acronym',
  leet: 'leet',
  names: 'name',
  slang: 'slang',
};

/** What one term of the class is, in a sentence about it: `b8 is a blend`. */
export const CLASS_ONE: Readonly<Record<ClassName, string>> = {
  numerals: 'a numeral',
  symbols: 'a symbol',
  shorthand: 'shorthand',
  blends: 'a blend',
  acronyms: 'an acronym',
  leet: 'a leet reading',
  names: 'a name',
  slang: 'slang',
};

/** What the class admits, for the control's description. Each is a sentence. */
export const CLASS_HINT: Readonly<Record<ClassName, string>> = {
  numerals: 'A digit or a run of digits of the text, as itself, read as a number.',
  symbols: 'A symbol of the text, as itself, read as its word.',
  shorthand: 'One character read as a word.',
  blends: 'Letters and digits that sound like a word.',
  acronyms: 'Initialisms and text abbreviations.',
  leet: 'A digit or symbol standing for one letter, chosen under the field.',
  names: 'Names of people, places, companies and products, three letters or more.',
  slang: 'Informal and slang words the pinned list lacks.',
};

/** What a name's panel says in place of a dictionary gloss. */
export const NAME_SENTENCE = 'Name, not in English OpenList.';

/**
 * What the panel says for a term the engine made from the text rather than
 * read from a file, so it has no gloss and no trace of its own.
 */
export const GENERATED_SENTENCE: Readonly<Partial<Record<ClassName, string>>> = {
  numerals: 'The text’s own digits, read as a number.',
  names: NAME_SENTENCE,
};

/**
 * The classes the Terms control lists: every class the dictionary can admit,
 * in the plan's table order, leet aside — leet is a choice per character, made
 * under the field. `terms` is the engine's count of terms per class, so a
 * class with no terms (slang, until G1) is not offered; numerals need none,
 * since the engine makes them from the text.
 */
export function shownClasses(terms: Readonly<Partial<Record<ClassName, number>>>): ClassName[] {
  return CLASSES.filter((name) => name !== 'leet' && (name === 'numerals' || (terms[name] ?? 0) > 0));
}

/** The classes on, in the plan's table order, whatever order they were turned on in. */
export function inTableOrder(classes: readonly ClassName[]): ClassName[] {
  return CLASSES.filter((name) => classes.includes(name));
}

/** `shorthand, blends and leet`; `or` for a list of things to choose between. */
export function listOf(names: readonly string[], join: 'and' | 'or'): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${join} ${names.at(-1)}`;
}

/**
 * What the count line's unit says the number holds: `anagrams` for words
 * alone, `anagrams with shorthand and blends` once classes or leet are on, and
 * `anagrams with known words` when a second figure sits beside it, so the two
 * are told apart. `leet` joins the list when any character of the text is read
 * as itself or a letter.
 */
export function countUnit(options: {
  readonly total: string;
  readonly classes: readonly ClassName[];
  readonly leet: readonly string[];
  readonly offered: boolean;
}): string {
  const one = options.total === '1' ? 'anagram' : 'anagrams';
  const on = [...inTableOrder(options.classes).map((name) => CLASS_WORD[name]), ...(options.leet.length > 0 ? [CLASS_WORD.leet] : [])];
  if (on.length > 0) return `${one} with ${listOf(on, 'and')}`;
  return options.offered ? `${one} with known words` : one;
}

/** What a search would also admit: the classes to turn on, and the characters to read as letters too. */
export type Offer = {
  readonly classes: readonly ClassName[];
  readonly leet: readonly string[];
};

/** The characters an offer would read as letters, as its line names them: `! as i`, `1 and 8 as letters`. */
function leetWords(chars: readonly string[]): string {
  if (chars.length === 0) return '';
  const letters = chars.length === 1 ? lettersOf(chars[0]!) : [];
  if (letters.length === 1) return `${chars[0]} as ${letters[0]}`;
  if (letters.length > 1) return `${chars[0]} as ${listOf(letters, 'or')}`;
  return `${listOf(chars, 'and')} as letters`;
}

/** The classes and characters of an offer, as its line names them: `numerals, shorthand or blends`. */
export function offerWords(offer: Offer): string {
  const leet = leetWords(offer.leet);
  return listOf([...inTableOrder(offer.classes).map((name) => CLASS_WORD[name]), ...(leet ? [leet] : [])], 'or');
}

/**
 * What to offer a reader whose search found nothing because the text has
 * characters no term of it uses: every class that is off and carries a term
 * with one of those characters, numerals when one is a digit, and — only for a
 * character no such class could use — its leet letters, since reading a
 * character as a letter is the last thing to reach for and the line under the
 * field offers it in any case. Nothing offers more than the search needs.
 *
 * Null when there is nothing to offer, which is every search that has results
 * and every text of letters alone.
 */
export function offerFor(options: {
  /** The characters of the text no term of this search uses, as the engine reported them. */
  readonly unused: string;
  /** The classes the search already admits. */
  readonly classes: readonly ClassName[];
  /** The characters leet is already on for. */
  readonly leet: readonly string[];
  /** The terms of the class files, so the offer names only classes that could help. */
  readonly terms: readonly Term[];
  /** The characters that offer a leet letter and are still read as themselves. */
  readonly leetable: readonly string[];
}): Offer | null {
  const stranded = [...new Set(options.unused)];
  if (stranded.length === 0) return null;
  const covers = (name: ClassName, char: string) =>
    name === 'numerals' ? isNumeral(char) : options.terms.some((term) => term.class === name && term.term.includes(char));
  const classes = CLASSES.filter(
    (name) => !options.classes.includes(name) && name !== 'leet' && stranded.some((char) => covers(name, char)),
  );
  const leet = stranded.filter(
    (char) =>
      options.leetable.includes(char) && !options.leet.includes(char) && !classes.some((name) => covers(name, char)),
  );
  return classes.length > 0 || leet.length > 0 ? { classes, leet } : null;
}
