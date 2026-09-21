/**
 * Is this phrase really an anagram of this input, at this tier?
 *
 * The TypeScript twin of `anagram check`, so ingest and the judging routine
 * never need the Rust toolchain. Both sides fold letters the same way
 * (`packages/engine/src/fold.ts` and the engine's `normalize()` share one
 * generated table), so "Beyoncé" and "beyonce" agree here as everywhere.
 */
import { normalizeLetters } from '@ars-magna/engine/fold';
import type { ClassName, Tier } from '@ars-magna/engine/protocol';

import { alphagram, lettersOf, type RecordReading } from './ids.ts';
import type { Engine } from './engine.ts';

export type Verdict = { ok: true } | { ok: false; reason: string };

/**
 * The letter test alone, with no dictionary: cheap and pure. `reading` is the
 * record's reading of the input (`ids.ts`): `{}` for the defaults, `null` for
 * a record made before phase N.
 */
export function sameLetters(input: string, words: readonly string[], reading: RecordReading = {}): boolean {
  return alphagram(input, reading) === alphagram(words.join(''), {});
}

/**
 * `classes` names the class of each term that is not a word of the dictionary
 * (decision D63), as the record stores it: such a term must be one the
 * dictionary carries in that class, and a word named in it is refused, since
 * a word needs no class. A numeral of the input's digits is its own class.
 */
export async function checkAnagram(
  engine: Engine,
  input: string,
  words: readonly string[],
  tier: Tier,
  reading: RecordReading = {},
  classes: Readonly<Record<string, ClassName>> = {},
): Promise<Verdict> {
  const folded = words.map((word) => normalizeLetters(word)).filter((w) => w.length > 0);
  if (folded.length === 0) return { ok: false, reason: 'no words' };
  if (!sameLetters(input, folded, reading)) {
    return { ok: false, reason: `the letters differ (${lettersOf(input, reading)} vs ${folded.join('')})` };
  }
  for (const term of Object.keys(classes)) {
    if (!folded.includes(term)) return { ok: false, reason: `"${term}" has a class but is not one of the words` };
  }
  for (const word of folded) {
    const name = classes[word];
    if (name === undefined) {
      if (!(await engine.has(word, tier))) {
        return { ok: false, reason: `"${word}" is not in the ${tier} dictionary` };
      }
      continue;
    }
    if (name === 'numerals') {
      if (!/^[0-9]+$/.test(word)) return { ok: false, reason: `"${word}" is not a numeral` };
      continue;
    }
    if (name === 'leet') {
      // The word that carries a leet character is a word of the dictionary, read as letters.
      if (!(await engine.has(word, tier))) return { ok: false, reason: `"${word}" is not in the ${tier} dictionary` };
      continue;
    }
    if (await engine.has(word, tier)) return { ok: false, reason: `"${word}" is a word of the ${tier} dictionary, so it has no class` };
    if (!(await engine.has(word, tier, [name]))) {
      return { ok: false, reason: `"${word}" is not a term of ${name}` };
    }
  }
  return { ok: true };
}
