/**
 * The letter map: which letter of the text goes to which letter of the
 * anagram, so the page can draw a line from each to where it went.
 *
 * Letters fold as the search folds them (`fold.ts`): an accented letter is its
 * base letter, and a character that folds to two (`ß` is ss) carries both. A
 * letter that repeats is matched in order, the first in the text to the first
 * in the anagram and so on, so one letter's lines never cross each other. What
 * is left over has no line: a letter of the text the anagram has not used, or
 * one the anagram uses beyond what the text has. Pure, so the tests run it
 * without a page.
 */
import { foldChar } from '@ars-magna/engine';

/** How many letters the map draws, on either side; past it the page says so in a sentence instead. */
export const MAP_LIMIT = 60;

/** One typed character and the letters it folds to; none for a space or punctuation. */
export type MapChar = { readonly char: string; readonly letters: string };

/** One line of the map: a letter, from its place in the text to its place in the anagram. */
export type MapLink = {
  readonly letter: string;
  /** Which character of the text, and of the anagram, the line joins. */
  readonly fromChar: number;
  readonly toChar: number;
  /** Which letter of each side it is, counting letters only, from 0. */
  readonly from: number;
  readonly to: number;
};

export type LetterMap = {
  readonly text: readonly MapChar[];
  readonly anagram: readonly MapChar[];
  readonly links: readonly MapLink[];
  /** Characters of the text holding a letter the anagram has not used. */
  readonly missing: readonly number[];
  /** Characters of the anagram holding a letter beyond what the text has. */
  readonly extra: readonly number[];
};

type Slot = { char: number; letter: number };

function chars(input: string): { chars: MapChar[]; slots: Map<string, Slot[]> } {
  const out: MapChar[] = [];
  const slots = new Map<string, Slot[]>();
  let letter = 0;
  [...input].forEach((char, i) => {
    const letters = foldChar(char);
    out.push({ char, letters });
    for (const l of letters) {
      const list = slots.get(l) ?? [];
      list.push({ char: i, letter: letter++ });
      slots.set(l, list);
    }
  });
  return { chars: out, slots };
}

/** The map for a text and an anagram of it, as far as their letters agree. */
export function letterMap(text: string, anagram: string): LetterMap {
  const t = chars(text);
  const a = chars(anagram);
  const links: MapLink[] = [];
  const missing = new Set<number>();
  const extra = new Set<number>();
  for (const letter of [...new Set([...t.slots.keys(), ...a.slots.keys()])].sort()) {
    const from = t.slots.get(letter) ?? [];
    const to = a.slots.get(letter) ?? [];
    const n = Math.min(from.length, to.length);
    for (let k = 0; k < n; k++) links.push({ letter, fromChar: from[k]!.char, toChar: to[k]!.char, from: from[k]!.letter, to: to[k]!.letter });
    for (const s of from.slice(n)) missing.add(s.char);
    for (const s of to.slice(n)) extra.add(s.char);
  }
  links.sort((x, y) => x.from - y.from);
  return { text: t.chars, anagram: a.chars, links, missing: [...missing].sort((x, y) => x - y), extra: [...extra].sort((x, y) => x - y) };
}

/** Whether the map is drawn: both sides have letters, and neither has more than the limit. */
export function mapFits(textLetters: number, anagramLetters: number, limit = MAP_LIMIT): boolean {
  return textLetters > 0 && anagramLetters > 0 && textLetters <= limit && anagramLetters <= limit;
}

/** The map as a line of the export: each letter of the text, where it is and where it went, counting letters from 1. */
export function mapLine(map: LetterMap): string {
  return map.links.map((l) => `${l.letter} ${l.from + 1}→${l.to + 1}`).join(' · ') || '—';
}
