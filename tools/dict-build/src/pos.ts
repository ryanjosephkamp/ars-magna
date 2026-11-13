/**
 * One part-of-speech byte per word, for the ordering in the worker.
 *
 * Four sources, best first:
 *
 *  1. The curated gloss table, which is the only place determiners, pronouns,
 *     prepositions and conjunctions exist at all. Those four classes carry most
 *     of the syntactic weight in a short phrase, so they matter out of all
 *     proportion to their number.
 *  2. WordNet, through the same lookup the definitions use — so a word tagged
 *     here is a word the reader can also get a definition for.
 *  3. The forms file, for a letters-word that is no word without its
 *     apostrophe (`dont`): neither table knows it, and the form's own line says
 *     what it is (`don't` is a verb). A pinned letters-word (`its`) keeps the
 *     dictionary's own tags.
 *  4. A suffix guess for the remainder. `-ly` is an adverb, `-ness` a noun,
 *     `-able` an adjective. Crude, and better than nothing for the long tail of
 *     machine-derived forms.
 *
 * Anything still unknown is 0, which the ordering treats as "no opinion" rather
 * than as a bad fit.
 */
import { TAG_BIT } from '../../../packages/engine/src/wordOrder.ts';
import { CURATED } from './glosses.ts';
import { loadSenses, type CuratedPos } from './wordnet.ts';

/** Bit per part of speech, keyed by the codes the shards already use. */
const BIT: Record<CuratedPos, number> = {
  n: TAG_BIT.noun,
  v: TAG_BIT.verb,
  adj: TAG_BIT.adj,
  adv: TAG_BIT.adv,
  det: TAG_BIT.det,
  pron: TAG_BIT.pron,
  prep: TAG_BIT.prep,
  conj: TAG_BIT.conj,
  interj: TAG_BIT.interj,
};

/**
 * Suffix guesses, longest first so `-ness` is tried before `-s` would be.
 * Only consulted when nothing better is known.
 */
const SUFFIX: [string, number][] = [
  ['ness', TAG_BIT.noun],
  ['tion', TAG_BIT.noun],
  ['sion', TAG_BIT.noun],
  ['ment', TAG_BIT.noun],
  ['ship', TAG_BIT.noun],
  ['able', TAG_BIT.adj],
  ['ible', TAG_BIT.adj],
  ['less', TAG_BIT.adj],
  ['ous', TAG_BIT.adj],
  ['ful', TAG_BIT.adj],
  ['ive', TAG_BIT.adj],
  ['ity', TAG_BIT.noun],
  ['ist', TAG_BIT.noun],
  ['ize', TAG_BIT.verb],
  ['ise', TAG_BIT.verb],
  ['ing', TAG_BIT.verb | TAG_BIT.adj],
  ['ly', TAG_BIT.adv],
  ['ed', TAG_BIT.verb | TAG_BIT.adj],
];

export type PosResult = {
  /** Two bytes per word, little-endian. See the note in `buildPos`. */
  readonly bytes: Uint8Array;
  readonly fromCurated: number;
  readonly fromWordNet: number;
  readonly fromForms: number;
  readonly fromSuffix: number;
  readonly unknown: number;
};

export async function buildPos(options: {
  dir: string;
  words: readonly string[];
  /** The parts of speech the forms file gives a letters-word that is no word of the pin, keyed by the letters. */
  formPos?: ReadonlyMap<string, readonly string[]>;
}): Promise<PosResult> {
  const { dir, words, formPos = new Map<string, readonly string[]>() } = options;
  const { senses } = await loadSenses({ dir, keep: new Set(words), maxSenses: 8 });

  // Two bytes per word, not one: there are nine parts of speech and
  // `interj` is the ninth bit. A single byte silently truncated it to zero,
  // which cost every interjection-only word its tag and showed up only as a
  // count sixty short of what the sources had supplied.
  const bytes = new Uint8Array(words.length * 2);
  let fromCurated = 0;
  let fromWordNet = 0;
  let fromForms = 0;
  let fromSuffix = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    let mask = 0;

    const curated = CURATED.get(word);
    if (curated) {
      for (const sense of curated) mask |= BIT[sense.pos] ?? 0;
      if (mask) fromCurated++;
    }

    if (mask === 0) {
      const found = senses.get(word);
      if (found) {
        for (const sense of found) mask |= BIT[sense.pos] ?? 0;
        if (mask) fromWordNet++;
      }
    }

    if (mask === 0) {
      const listed = formPos.get(word);
      if (listed) {
        // The forms file names the tags as `TAGS` does (`noun`, `verb`), not by
        // the shards' codes, so it reads the bits directly.
        for (const tag of listed) mask |= TAG_BIT[tag as keyof typeof TAG_BIT] ?? 0;
        if (mask) fromForms++;
      }
    }

    if (mask === 0) {
      for (const [suffix, bit] of SUFFIX) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
          mask = bit;
          fromSuffix++;
          break;
        }
      }
    }

    bytes[i * 2] = mask & 0xff;
    bytes[i * 2 + 1] = (mask >> 8) & 0xff;
  }

  return {
    bytes,
    fromCurated,
    fromWordNet,
    fromForms,
    fromSuffix,
    unknown: words.length - fromCurated - fromWordNet - fromForms - fromSuffix,
  };
}
