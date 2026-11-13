/**
 * Titles that are never inputs: navigation pages, dated lists, and anything
 * too short to anagram. Applied before classification so no lookup is spent
 * on them.
 */
import { normalizeLetters } from '@ars-magna/engine/fold';

const PREFIXES = ['Main Page', 'Special:', 'Portal:', 'Wikipedia:', 'File:', 'Help:', 'Category:', 'Template:', 'Deaths in ', 'List of ', 'Lists of '];

export function isJunk(title: string): boolean {
  if (PREFIXES.some((p) => title.startsWith(p))) return true;
  if (/\(disambiguation\)$/.test(title)) return true;
  // Years, dates and "2026 in film"-style calendar pages.
  if (/^\d{3,4}(\s|$)/.test(title)) return true;
  if (/^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d/.test(title)) return true;
  return normalizeLetters(cleanTitle(title)).length < 4;
}

/**
 * The input a person would type: the article title without Wikipedia's
 * disambiguating tail. "Toxic (2026 film)" is "Toxic"; "Neatsville, Kentucky"
 * keeps its comma, which folds away anyway.
 */
export function cleanTitle(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
}
