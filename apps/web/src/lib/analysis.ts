/**
 * What the Build page can say about a text and an anagram of it, from what the
 * dictionary already carries: the letters, the words, and how the two compare.
 *
 * Every figure here is a number or a label the page sets in type. Pure: the
 * page fetches each word's part-of-speech mask and frequency byte from the
 * engine and hands them over in order.
 */
import { TAGS, TAG_BIT, scoreOrder, type Tag, type Tier } from '@ars-magna/engine';

/** Parts of speech spelled out, as the word panel on a search result spells them. */
export const TAG_LABEL: Record<Tag, string> = {
  det: 'determiner',
  pron: 'pronoun',
  prep: 'preposition',
  conj: 'conjunction',
  adj: 'adjective',
  adv: 'adverb',
  noun: 'noun',
  verb: 'verb',
  interj: 'interjection',
  unknown: 'unknown',
};

export const TIER_LABEL: Record<Tier, string> = { common: 'Common', standard: 'Standard', full: 'Full', extended: 'Extended' };

/** A score reads with its sign, so `+7` and `-2` are not mistaken for counts. */
export function signedScore(score: number): string {
  return score > 0 ? `+${score}` : String(score);
}

/**
 * How often each letter turns up in English, as a percentage of letters. From
 * the usual count over a large English corpus; it decides which of a text's
 * letters are the rarest, and nothing else. j and x share a figure.
 */
export const LETTER_FREQUENCY: Readonly<Record<string, number>> = {
  e: 12.7, t: 9.06, a: 8.17, o: 7.51, i: 6.97, n: 6.75, s: 6.33, h: 6.09, r: 5.99, d: 4.25,
  l: 4.03, c: 2.78, u: 2.76, m: 2.41, w: 2.36, f: 2.23, g: 2.02, y: 1.97, p: 1.93, b: 1.49,
  v: 0.98, k: 0.77, j: 0.15, x: 0.15, q: 0.095, z: 0.074,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export type LetterFigures = {
  readonly count: number;
  readonly distinct: number;
  readonly vowels: number;
  /**
   * The letters present that are rarest in English, a to z, with their share
   * of English letters: more than one when they tie. Null with no letters. `y`
   * counts as a consonant.
   */
  readonly rarest: { readonly letters: readonly string[]; readonly percent: number } | null;
  /** The letters used most in this side, a to z, and how many times each is. Null with no letters. */
  readonly mostUsed: { readonly letters: readonly string[]; readonly count: number } | null;
  /** Every letter present, alphabetical, with how many there are. */
  readonly histogram: readonly { readonly letter: string; readonly count: number }[];
};

export function letterFigures(letters: string): LetterFigures {
  const counts = new Map<string, number>();
  for (const letter of letters) counts.set(letter, (counts.get(letter) ?? 0) + 1);
  const histogram = [...counts.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([letter, count]) => ({ letter, count }));
  const least = Math.min(...histogram.map(({ letter }) => LETTER_FREQUENCY[letter] ?? 0));
  const most = Math.max(...histogram.map(({ count }) => count));
  return {
    count: letters.length,
    distinct: histogram.length,
    vowels: [...letters].filter((l) => VOWELS.has(l)).length,
    rarest:
      histogram.length === 0
        ? null
        : { letters: histogram.filter(({ letter }) => (LETTER_FREQUENCY[letter] ?? 0) === least).map(({ letter }) => letter), percent: least },
    mostUsed: histogram.length === 0 ? null : { letters: histogram.filter(({ count }) => count === most).map(({ letter }) => letter), count: most },
    histogram,
  };
}

/** `j x · 0.15%`: the rarest letters in English and their share of English letters, or `—`. */
export function rarestLine(f: LetterFigures): string {
  return f.rarest === null ? '—' : `${f.rarest.letters.join(' ')} · ${f.rarest.percent}%`;
}

/** `o r · 2`: the letters used most, and how many times each is, or `—`. */
export function mostUsedLine(f: LetterFigures): string {
  return f.mostUsed === null ? '—' : `${f.mostUsed.letters.join(' ')} · ${f.mostUsed.count}`;
}

/** One line of the letter charts: a letter either side has, and how many each side has of it. */
export type LetterRow = { readonly letter: string; readonly text: number; readonly anagram: number };

/**
 * The rows both letter charts share: every letter either side has, a to z,
 * so a letter sits on the same line left and right, with 0 where a side lacks
 * it. `most` is the largest count on either side, so both charts share one
 * scale.
 */
export function letterRows(text: LetterFigures, anagram: LetterFigures): { rows: LetterRow[]; most: number } {
  const of = (f: LetterFigures) => new Map(f.histogram.map(({ letter, count }) => [letter, count]));
  const left = of(text);
  const right = of(anagram);
  const rows = [...new Set([...left.keys(), ...right.keys()])]
    .sort()
    .map((letter) => ({ letter, text: left.get(letter) ?? 0, anagram: right.get(letter) ?? 0 }));
  return { rows, most: rows.reduce((top, r) => Math.max(top, r.text, r.anagram), 0) };
}

/**
 * How common a word is, in bands over the dictionary's frequency byte
 * (`(zipf + 1) * 24`). `everyday` is zipf 5 and up (`the`, `room`), `common` 4
 * to 5 (`dirty`), `uncommon` 3 to 4 (`dormitory`), `rare` below 3 (`onsen`),
 * and `unknown` a word the frequency build had nothing for, which is every
 * site addition.
 */
export type Band = 'everyday' | 'common' | 'uncommon' | 'rare' | 'unknown';

export const BANDS: readonly Band[] = ['everyday', 'common', 'uncommon', 'rare', 'unknown'];

export const BAND_LABEL: Record<Band, string> = {
  everyday: 'everyday',
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  unknown: 'no frequency',
};

export function bandOf(zipfByte: number): Band {
  if (zipfByte <= 0) return 'unknown';
  if (zipfByte >= 144) return 'everyday';
  if (zipfByte >= 120) return 'common';
  if (zipfByte >= 96) return 'uncommon';
  return 'rare';
}

/** A word's parts of speech, from its mask. Empty when the dictionary knows none. */
export function partsOf(mask: number): Tag[] {
  return TAGS.filter((tag) => tag !== 'unknown' && (mask & TAG_BIT[tag]) !== 0);
}

export type WordFigures = {
  readonly count: number;
  /** Mean word length, to one decimal. */
  readonly averageLength: number;
  /** How many words can be each part of speech, commonest first. A word that can be two is counted in both. */
  readonly parts: readonly { readonly tag: Tag; readonly count: number }[];
  /** Words the dictionary gives no part of speech: a word it does not have, or one with no tags. */
  readonly unknown: number;
  /** How many words fall in each band, in `BANDS` order, bands with none left out. */
  readonly commonness: readonly { readonly band: Band; readonly count: number }[];
};

/** `masks` and `zipf` are each word's, in order; a missing entry counts as nothing known. */
export function wordFigures(words: readonly string[], masks: readonly number[], zipf: readonly number[]): WordFigures {
  const parts = new Map<Tag, number>();
  const bands = new Map<Band, number>();
  let unknown = 0;
  let letters = 0;
  words.forEach((word, i) => {
    letters += word.length;
    const tags = partsOf(masks[i] ?? 0);
    if (tags.length === 0) unknown++;
    for (const tag of tags) parts.set(tag, (parts.get(tag) ?? 0) + 1);
    const band = bandOf(zipf[i] ?? 0);
    bands.set(band, (bands.get(band) ?? 0) + 1);
  });
  return {
    count: words.length,
    averageLength: words.length === 0 ? 0 : Math.round((letters / words.length) * 10) / 10,
    parts: [...parts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || TAGS.indexOf(a.tag) - TAGS.indexOf(b.tag)),
    unknown,
    commonness: BANDS.map((band) => ({ band, count: bands.get(band) ?? 0 })).filter((b) => b.count > 0),
  };
}

export type Comparison = {
  readonly words: { readonly text: number; readonly anagram: number };
  /** Every part of speech either side has, with how many words on each side can be it. */
  readonly parts: readonly { readonly tag: Tag; readonly text: number; readonly anagram: number }[];
  /** How each side reads by the ordering score the engine ranks results with. */
  readonly reads: { readonly text: number; readonly anagram: number };
  /** Words in both, once each, in the text's order. */
  readonly shared: readonly string[];
};

export function comparison(
  text: { words: readonly string[]; masks: readonly number[]; zipf: readonly number[] },
  anagram: { words: readonly string[]; masks: readonly number[]; zipf: readonly number[] },
): Comparison {
  const left = wordFigures(text.words, text.masks, text.zipf);
  const right = wordFigures(anagram.words, anagram.masks, anagram.zipf);
  const tags = [...new Set([...left.parts.map((p) => p.tag), ...right.parts.map((p) => p.tag)])].sort(
    (a, b) => TAGS.indexOf(a) - TAGS.indexOf(b),
  );
  const countOf = (figures: WordFigures, tag: Tag) => figures.parts.find((p) => p.tag === tag)?.count ?? 0;
  return {
    words: { text: left.count, anagram: right.count },
    parts: tags.map((tag) => ({ tag, text: countOf(left, tag), anagram: countOf(right, tag) })),
    reads: {
      text: scoreOrder(text.words, [...text.masks]),
      anagram: scoreOrder(anagram.words, [...anagram.masks]),
    },
    shared: [...new Set(text.words.filter((word) => anagram.words.includes(word)))],
  };
}
