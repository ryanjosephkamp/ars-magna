/**
 * A row's terms: what each one is shown as, and which class it comes from.
 *
 * The engine tags a row whose terms are not all plain words of the dictionary
 * under the text as typed (`RowTag`): a class per word, the words as written
 * (the leet character where its letter went, `$hake` for *shake* under `$` as
 * s), and the reading the row was found under. The tag is parallel to the
 * engine's own order, and a reader may show the row in another, so the two are
 * paired here, word by word, taking each word's written form in turn — the
 * same word twice in one row may carry the character once and not the other
 * time.
 *
 * A term's own capitals come from the class files (`WTF` for `wtf`), a word's
 * from the dictionary's listed forms (`don't` for `dont`); a word that carries
 * a leet character is written as the engine wrote it. Pure.
 */
import type { ClassName, RowTag } from '@ars-magna/engine';

import { displayWord, type Forms } from './forms.ts';
import { writtenTerm, type Terms } from './terms.ts';

/** One word of a row as it is shown: the word itself, its spelling, and its class when it is not a word. */
export type RowTerm = {
  /** The word as the engine knows it: letters, or a term's own characters. */
  readonly word: string;
  /** What the row shows: a listed form, a term's capitals, or the word with its leet character. */
  readonly display: string;
  /** The class the term comes from, or null for a word of the dictionary. */
  readonly termClass: ClassName | null;
};

/**
 * The row's words in the order shown, each with its spelling and its class.
 * Without a tag every word is a plain word, which is every row of a search of
 * words alone.
 */
export function rowTerms(options: {
  /** The row in the engine's own order, which the tag is parallel to. */
  readonly row: readonly string[];
  /** The order the row is shown in: the reader's choice, or the engine's. */
  readonly shown: readonly string[];
  readonly tag: RowTag | null | undefined;
  readonly forms: Forms;
  readonly terms: Terms;
}): RowTerm[] {
  const { row, shown, tag, forms, terms } = options;
  if (!tag) return shown.map((word) => ({ word, display: displayWord(forms, word), termClass: null }));

  // Each word's written forms and classes, in the engine's order, taken in
  // turn as the shown order asks for them.
  const pending = new Map<string, { written: string; termClass: ClassName | null }[]>();
  row.forEach((word, i) => {
    const list = pending.get(word) ?? [];
    list.push({ written: tag.written[i] ?? word, termClass: tag.classes[i] ?? null });
    pending.set(word, list);
  });

  return shown.map((word) => {
    const next = pending.get(word)?.shift();
    if (!next) return { word, display: displayWord(forms, word), termClass: null };
    const display = next.termClass === null ? displayWord(forms, word) : writtenTerm(terms, next.written);
    return { word, display, termClass: next.termClass };
  });
}

/**
 * Which character stands where, in one word the search wrote with a leet
 * character (`$hake` for *shake*): `$ as s`, the same words the line under the
 * field uses. Empty when the two do not line up, which they always do — one
 * character takes the place of one letter.
 */
export function leetReadingText(word: string, written: string): string {
  if (word.length !== written.length) return '';
  const pairs: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const pair = `${written[i]} as ${word[i]}`;
    if (written[i] !== word[i] && !pairs.includes(pair)) pairs.push(pair);
  }
  return pairs.join(' · ');
}

/** A row as the page shows it: its terms' spellings, single spaces between. */
export function termPhrase(list: readonly RowTerm[]): string {
  return list.map((t) => t.display).join(' ');
}

/**
 * The class of each term that is not a plain word of the dictionary, keyed by
 * the term as the words have it, exactly as a hit's `classes` carries it
 * (`{"b8": "blends"}`, `{"shake": "leet"}` for a word that carries a leet
 * character): what a promotion of the row records, so the review knows what
 * its terms are.
 */
export function termClassesOf(list: readonly RowTerm[]): Record<string, ClassName> {
  const out: Record<string, ClassName> = {};
  for (const { word, termClass } of list) if (termClass !== null) out[word] = termClass;
  return out;
}

/** The classes a row's terms come from, once each, in the order they read. */
export function classesOf(list: readonly RowTerm[]): ClassName[] {
  const out: ClassName[] = [];
  for (const { termClass } of list) if (termClass !== null && !out.includes(termClass)) out.push(termClass);
  return out;
}
