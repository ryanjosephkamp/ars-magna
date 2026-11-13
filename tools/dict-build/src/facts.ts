/**
 * Per-word provenance, from the pinned facts file.
 *
 * The facts file lists the spellings of the pinned English OpenList revision
 * that are exceptions, one per line with a tab: `generated` for a spelling the
 * dataset produced by rule (`abacteremicer`), `unattested` for one no source
 * vouches for. Every other spelling of the pinned word list is vouched for by a
 * source. `facts-extract.ts` writes the file from the revision's
 * `merged_valid_dict.json`. Which source vouched for a spelling is not kept:
 * some of the list's sources do not allow publishing the words they supplied.
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { normalize } from './normalize.ts';
import type { WordFacts } from './tiers.ts';

export type SpellingFact = 'generated' | 'unattested';

/** The facts file's lines, by spelling. Throws on a line it cannot read. */
export function parseFacts(text: string): Map<string, SpellingFact> {
  const facts = new Map<string, SpellingFact>();
  for (const line of text.split('\n')) {
    if (line.length === 0) continue;
    const [spelling, fact, extra] = line.split('\t');
    if (!spelling || (fact !== 'generated' && fact !== 'unattested') || extra !== undefined) {
      throw new Error(`facts: cannot read the line ${JSON.stringify(line)}`);
    }
    facts.set(spelling, fact);
  }
  return facts;
}

/**
 * Each word's facts, by its index in the build's word list. `spellings` are the
 * lines of the pinned word list; several can normalize to one word
 * (`ad-lib` and `adlib`).
 */
export function wordFacts(
  facts: ReadonlyMap<string, SpellingFact>,
  spellings: readonly string[],
  indexOf: ReadonlyMap<string, number>,
  wordCount: number,
): WordFacts[] {
  const seen = new Uint8Array(wordCount);
  const attested = new Uint8Array(wordCount);
  const vouched = new Uint8Array(wordCount);

  for (const spelling of spellings) {
    const index = indexOf.get(normalize(spelling));
    if (index === undefined) continue;
    const fact = facts.get(spelling);
    seen[index] = 1;
    // A word counts as generated only if *every* spelling that normalizes to
    // it was generated. There are 43 such collisions (`ad-lib` -> `adlib`).
    if (fact !== 'generated') attested[index] = 1;
    if (fact === undefined) vouched[index] = 1;
  }

  const out: WordFacts[] = new Array(wordCount);
  for (let i = 0; i < wordCount; i++) {
    out[i] = { generated: seen[i] === 1 && attested[i] === 0, vouched: vouched[i] === 1 };
  }
  return out;
}

export async function loadFacts(options: {
  factsPath: string;
  factsSha256: string;
  spellings: readonly string[];
  indexOf: ReadonlyMap<string, number>;
  wordCount: number;
}): Promise<WordFacts[]> {
  const { factsPath, factsSha256, spellings, indexOf, wordCount } = options;
  const bytes = await readFile(factsPath);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== factsSha256) {
    throw new Error(`facts: ${factsPath} has sha256 ${sha256}, not the pinned ${factsSha256}`);
  }
  return wordFacts(parseFacts(bytes.toString('utf8')), spellings, indexOf, wordCount);
}
