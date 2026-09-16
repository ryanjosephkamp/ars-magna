/**
 * Tier construction.
 *
 * The three tiers are strictly nested (Common ⊂ Standard ⊂ Full), which is what
 * lets the app ship one word list plus two bitsets and switch tiers with no
 * further network.
 *
 * The logic here is where the product's result quality actually lives, and it
 * has to work around four things measured in the source data:
 *
 *  1. 175,501 entries come from the TWL Scrabble dictionary and carry no
 *     `candidate_source` field at all. Ranking by `candidate_source` length —
 *     the obvious approach — scores every one of them zero, including ordinary
 *     words like `broth` and `shove`.
 *  2. `candidate_source` entries are suffixed `_valid` or `_unlikely`. `aalii`
 *     has eight sources, all `_unlikely`. Counting array length alone would
 *     rank an obscure Hawaiian shrub alongside `a`.
 *  3. 64,837 entries are algorithmically generated (`isothermicalest`,
 *     `nonlivabler`, `abacteremicer`) and flagged by a `generation_method`
 *     field. These are the single largest source of unrecognizable results.
 *  4. The frequency list puts OCR noise (`cq`, `hq`, `rx`, `zz`) inside the top
 *     40k, and two-letter words are the biggest driver of result explosion —
 *     so short words are admitted by curation, never by frequency.
 */

/**
 * The tournament two-letter word list (NWL). Two-letter words are genuinely
 * load-bearing in anagram phrases, so we want the real ones and none of the
 * frequency-list noise.
 */
export const SHORT_ALLOWLIST: ReadonlySet<string> = new Set([
  // single letters — both are real English words and both are needed to make
  // phrases like "nag a ram" reachable
  'a', 'i',
  'aa', 'ab', 'ad', 'ae', 'ag', 'ah', 'ai', 'al', 'am', 'an', 'ar', 'as', 'at', 'aw', 'ax', 'ay',
  'ba', 'be', 'bi', 'bo', 'by',
  'da', 'de', 'do',
  'ed', 'ef', 'eh', 'el', 'em', 'en', 'er', 'es', 'et', 'ew', 'ex',
  'fa', 'fe',
  'gi', 'go',
  'ha', 'he', 'hi', 'hm', 'ho',
  'id', 'if', 'in', 'is', 'it',
  'jo',
  'ka', 'ki',
  'la', 'li', 'lo',
  'ma', 'me', 'mi', 'mm', 'mo', 'mu', 'my',
  'na', 'ne', 'no', 'nu',
  'od', 'oe', 'of', 'oh', 'oi', 'ok', 'om', 'on', 'op', 'or', 'os', 'ow', 'ox', 'oy',
  'pa', 'pe', 'pi', 'po',
  'qi',
  're',
  'sh', 'si', 'so',
  'ta', 'te', 'ti', 'to',
  'uh', 'um', 'un', 'up', 'us', 'ut',
  'we', 'wo',
  'xi', 'xu',
  'ya', 'ye', 'yo',
  'za', 'zo',
]);

/** Frequency rank cutoff for the Common tier. Rank is computed over the words
 *  that exist in the dictionary, not over the raw frequency list. */
export const COMMON_RANK_CUTOFF = 40_000;

/**
 * Each word's 1-based rank by descending corpus frequency, with ties broken by
 * list order; `0` for a word with no occurrences, and for a word `ranked`
 * leaves out.
 *
 * Only English OpenList's own words take a place. A site addition is never in
 * Common, but if it held a rank it would still push the word at rank 40,000 out
 * of Common: `onsen`, the first addition the corpus knows, took `transients`'
 * place until 2026-09-16. Common, Standard and Full stay exactly as the pinned
 * list defines them, whatever the additions are.
 */
export function frequencyRanks(occurrences: Float64Array, ranked: (index: number) => boolean): Int32Array {
  const present: number[] = [];
  for (let i = 0; i < occurrences.length; i++) if (occurrences[i]! > 0 && ranked(i)) present.push(i);
  present.sort((a, b) => occurrences[b]! - occurrences[a]! || a - b);

  const rank = new Int32Array(occurrences.length);
  present.forEach((index, position) => {
    rank[index] = position + 1;
  });
  return rank;
}

export type WordFacts = {
  /** Present in the TWL Scrabble dictionary. */
  twl: boolean;
  /** Produced by the dataset's generation pipeline rather than attested. */
  generated: boolean;
  /** `candidate_source` entries ending in `_valid`. Kept for display only —
   *  it does not correlate with commonness and is never a tier gate. */
  nValid: number;
};

export type TierInputs = {
  readonly word: string;
  readonly facts: WordFacts;
  /** 1-based rank among dictionary words by descending corpus frequency;
   *  `0` means the word has no frequency data at all. */
  readonly freqRank: number;
  /** A word the site added, absent from English OpenList at the pinned revision. */
  readonly addition: boolean;
};

export function inCommon({ word, facts, freqRank, addition }: TierInputs): boolean {
  if (addition) return false;
  if (facts.generated) return false;
  if (SHORT_ALLOWLIST.has(word)) return true;
  if (word.length < 3) return false;
  return freqRank > 0 && freqRank <= COMMON_RANK_CUTOFF;
}

/**
 * Standard is every attested word: the full list minus the 64,837
 * machine-generated entries.
 *
 * It used to be Common ∪ TWL, which sounded reasonable and was not: TWL stops
 * at 15 letters, so of the 34,327 words of 16 letters or more only 35 made it
 * in, and about 136,800 attested words in total were missing from the default
 * tier — "internationalization", "compartmentalization" and
 * "electroencephalogram" among them. The README had always described Standard
 * as "the list without the generated entries"; now it is.
 */
export function inStandard(input: TierInputs): boolean {
  return !input.addition && !input.facts.generated;
}

/**
 * Full is English OpenList at the pinned revision, and nothing else.
 *
 * It used to be the whole shipped list, which is why it needed no bitset at all.
 * Extended is that tier now — the pinned list plus the site's own additions — so
 * Full has to be stated rather than assumed. An addition carries no provenance
 * record from the source metadata, so without this it would fall through
 * `inStandard`'s "not generated" test and land in the default tier.
 */
export function inFull(input: TierInputs): boolean {
  return !input.addition;
}

/**
 * Zipf scale, quantised to one byte per word.
 *
 * zipf = log10(occurrences per billion tokens); it runs about -1 for hapax
 * legomena up to ~7.5 for "the". `(zipf + 1) * 24` maps that onto 0..255 with
 * room to spare, and 0 is reserved for "no frequency data".
 */
export function zipfByte(occurrences: number, corpusTotal: number): number {
  if (occurrences <= 0) return 0;
  const zipf = Math.log10((occurrences / corpusTotal) * 1e9);
  return Math.max(1, Math.min(255, Math.round((zipf + 1) * 24)));
}
