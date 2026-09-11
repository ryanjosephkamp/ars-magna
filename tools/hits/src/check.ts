/**
 * Is this phrase really an anagram of this input, at this tier?
 *
 * The TypeScript twin of `anagram check`, so ingest and the judging routine
 * never need the Rust toolchain. Both sides fold letters the same way
 * (`packages/engine/src/fold.ts` and the engine's `normalize()` share one
 * generated table), so "Beyoncé" and "beyonce" agree here as everywhere.
 */
import { normalizeLetters } from '@ars-magna/engine/fold';
import type { Tier } from '@ars-magna/engine/protocol';

import { alphagram } from './ids.ts';
import type { Engine } from './engine.ts';

export type Verdict = { ok: true } | { ok: false; reason: string };

/** The letter test alone, with no dictionary: cheap and pure. */
export function sameLetters(input: string, words: readonly string[]): boolean {
  return alphagram(input) === alphagram(words.join(''));
}

export async function checkAnagram(
  engine: Engine,
  input: string,
  words: readonly string[],
  tier: Tier,
): Promise<Verdict> {
  const folded = words.map(normalizeLetters).filter((w) => w.length > 0);
  if (folded.length === 0) return { ok: false, reason: 'no words' };
  if (!sameLetters(input, folded)) {
    return { ok: false, reason: `the letters differ (${normalizeLetters(input)} vs ${folded.join('')})` };
  }
  for (const word of folded) {
    if (!(await engine.has(word, tier))) {
      return { ok: false, reason: `"${word}" is not in the ${tier} dictionary` };
    }
  }
  return { ok: true };
}
