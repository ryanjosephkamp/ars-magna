/**
 * Which anagrams of a search's letters are on Discoveries, and which rows of
 * the complete list they are.
 *
 * A hit belongs to the letters when its sorted letters are the search's. A row
 * is a hit when it has the same spelling key: the search collapses words that
 * share letters into one row ("door sit" stands for "its odor" too), so a
 * published anagram can sit behind a row that spells it another way, and the
 * row then names the Discoveries spelling.
 */
import { SECTIONS, inOrder, type PublicHit, type Shelf } from '../hits/build.ts';
import { sortedLetters, spellingKey } from '../votes/core.ts';

export type DiscoverySection = { shelf: Shelf; label: string; hits: PublicHit[] };

export type Discovered = {
  /** Greatest Hits, then Interesting, then A stretch; only sections with hits. */
  sections: DiscoverySection[];
  /** The hit a row stands for, by the row's spelling key. */
  bySpelling: ReadonlyMap<string, PublicHit>;
};

export type RowDiscovery = {
  hit: PublicHit;
  /** The section's label: Greatest Hits, Interesting or A stretch. */
  label: string;
  /** The row spells the hit differently, so the label names the Discoveries spelling. */
  respelled: boolean;
};

const LABEL = new Map<Shelf, string>(SECTIONS.map((s) => [s.shelf, s.label]));

/**
 * The hits for these letters (already folded; any order), each section most
 * voted first with ties A to Z. `counts` are the vote counts to rank by.
 */
export function discoveredFor(
  hits: readonly PublicHit[],
  letters: string,
  counts: Readonly<Record<string, number>> = {},
): Discovered {
  const sorted = sortedLetters(letters);
  const mine = hits.filter((h) => h.letters === sorted);
  const sections = SECTIONS.map((s) => ({
    shelf: s.shelf,
    label: s.label,
    hits: inOrder(
      mine.filter((h) => h.shelf === s.shelf),
      'votes',
      counts,
    ),
  })).filter((s) => s.hits.length > 0);

  // Where two hits share a spelling key (the same words as two categories, or
  // two spellings of one row), the row stands for the higher section, then the
  // more voted: the first in this order.
  const bySpelling = new Map<string, PublicHit>();
  for (const section of sections) {
    for (const hit of section.hits) {
      const key = spellingKey(hit.words);
      if (!bySpelling.has(key)) bySpelling.set(key, hit);
    }
  }
  return { sections, bySpelling };
}

/** The published hit a row of the complete list stands for, if any. */
export function discoveryFor(discovered: Discovered | null, row: readonly string[]): RowDiscovery | null {
  if (!discovered || discovered.bySpelling.size === 0) return null;
  const hit = discovered.bySpelling.get(spellingKey(row));
  if (!hit) return null;
  const respelled = [...row].sort().join(' ') !== [...hit.words].sort().join(' ');
  return { hit, label: LABEL.get(hit.shelf) ?? '', respelled };
}
