/**
 * The text itself, which is never an anagram of itself.
 *
 * Two shapes count as the text: its own words in any order ("sauce apple" for
 * "apple sauce"), and a re-spacing, the same letters in the same order split
 * another way ("star wars" for "Star Wars", "the god father" for "The
 * Godfather"). The search lists a re-spacing, since "applesauce" is a
 * different word from "apple sauce", but nothing goes to Discover as an
 * anagram of the text it is: the nightly pipeline has refused these since its
 * first prefilter, and Build and the promotions API refuse them here, through
 * this one module so the three cannot disagree.
 *
 * Words are the engine's own: whitespace-separated, folded to letters
 * (`foldWords`), so the page, the API and the Rust side all split a text the
 * same way.
 */
import { foldWords, normalizeLetters } from './fold.ts';
import { NO_READING, type Reading } from './readings.ts';

/**
 * How many arrangements the re-spacing walk may try before it gives up and
 * says no. A queue's row has at most five words, so the pipeline never reaches
 * it; a reader who types a dozen words of one repeated letter would, and a
 * page that stopped answering would be the worse fault.
 */
const WALK_BUDGET = 20_000;

/**
 * Whether `words` can be arranged to spell `letters` exactly: the text's own
 * letters in their own order, split another way. `letters` is folded already,
 * as `normalizeLetters` gives it.
 */
export function isRespacing(words: readonly string[], letters: string): boolean {
  if (words.join('').length !== letters.length) return false;
  let steps = 0;
  const walk = (remaining: string, used: boolean[]): boolean => {
    if (remaining.length === 0) return true;
    for (let i = 0; i < words.length; i++) {
      if (used[i] || !remaining.startsWith(words[i]!)) continue;
      if (++steps > WALK_BUDGET) return false;
      used[i] = true;
      if (walk(remaining.slice(words[i]!.length), used)) return true;
      used[i] = false;
    }
    return false;
  };
  return walk(letters, words.map(() => false));
}

/** Whether `words` are the text's own words, in any order, folded as the engine folds them, the text read as `reading` says. */
export function sameWords(text: string, words: readonly string[], reading: Reading = NO_READING): boolean {
  const mine = foldWords(text, reading).sort();
  const theirs = words.map((word) => normalizeLetters(word)).filter((word) => word.length > 0).sort();
  return mine.length > 0 && mine.length === theirs.length && mine.every((word, i) => word === theirs[i]);
}

/**
 * Whether an anagram is the text itself: the text's words in any order, or a
 * re-spacing of it. `anagram` is the words, or the text of them.
 */
export function isTextItself(text: string, anagram: string | readonly string[], reading: Reading = NO_READING): boolean {
  const words = typeof anagram === 'string' ? foldWords(anagram) : anagram.map((word) => normalizeLetters(word)).filter((word) => word.length > 0);
  if (words.length === 0) return false;
  return sameWords(text, words, reading) || isRespacing(words, normalizeLetters(text, reading));
}
