/**
 * The labelled terms of decision D63, as the site serves them in terms.json:
 * the class files' own lines, without the fields only the repository needs.
 *
 * A term that is not a word of the dictionary is shown with a dotted underline
 * and explained in the panel (`b8 · bait · a blend`), so the page needs what
 * each term reads as, its gloss and its trace. The `classes` artifact the
 * engine loads carries a term and its class bits alone, so this list is built
 * from the class files beside it (`scripts/build-terms.ts`) and read by the
 * word panel, the Build page and `/api/promote`.
 *
 * Numerals and leet readings have no file: the engine makes them from the
 * text, and the panel says so itself. Names have no file here either: a name
 * is letters, and the panel has one sentence for it.
 *
 * Pure, and no DOM: the build script, the page, the API and the tests all read
 * it.
 */
import type { ClassName } from '@ars-magna/engine';

/** The class files, by class, in `data/vocabulary/`. `slang.jsonl` arrives with G1. */
export const CLASS_FILE: Readonly<Record<'symbols' | 'shorthand' | 'blends' | 'acronyms' | 'slang', string>> = {
  symbols: 'symbols.jsonl',
  shorthand: 'shorthand.jsonl',
  blends: 'blends.jsonl',
  acronyms: 'acronyms.jsonl',
  slang: 'slang.jsonl',
};

/** One term of a class file, as terms.json carries it. */
export type Term = {
  /** The term as the search folds it: `b8`, `&`, `wtf`. */
  readonly term: string;
  readonly class: ClassName;
  /** What it stands for: `bait`, `and`, `by the way`. */
  readonly reads: string;
  readonly gloss: string;
  /** Where to read more, always a URL: usually the term's Wiktionary entry. */
  readonly trace: string;
  /** The term or its reading is an expletive, so the page says so. */
  readonly tone?: 'crude';
  /** How the term is usually written when that is capitals: `WTF`, `RSVP`. */
  readonly written?: string;
};

/** What terms.json holds. */
export type TermsFile = { readonly generated: string; readonly terms: readonly Term[] };

/** The terms by the term itself, for a panel and a check to look one up. */
export type Terms = ReadonlyMap<string, Term>;

export const NO_TERMS: Terms = new Map();

export function termsFrom(list: readonly Term[]): Terms {
  return new Map(list.map((term) => [term.term, term]));
}

/** Whether a term is a run of digits, which the engine makes from the text rather than a file. */
export function isNumeral(term: string): boolean {
  return /^[0-9]+$/.test(term);
}

/**
 * How a term is written where a row shows it: an acronym's capitals when the
 * file gives them (`WTF` for `wtf`), else the term as it is. A word of the
 * dictionary is not a term and keeps its listed form instead.
 */
export function writtenTerm(terms: Terms, term: string): string {
  return terms.get(term)?.written ?? term;
}
