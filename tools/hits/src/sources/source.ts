/**
 * Where candidate inputs come from.
 *
 * A source yields raw titles for a day; classification into categories
 * happens afterwards and is shared. Adding a source (a chart, a box-office
 * list, a brand index) means implementing this interface and registering it
 * in `fetch.ts`; nothing else changes.
 */

export type RawCandidate = {
  /** The title as the source spells it, e.g. a Wikipedia article title. */
  title: string;
  /** Where it came from, for the run summary. */
  source: string;
  /** A ranking signal within the source, larger is more prominent. */
  weight: number;
};

export type SourceDeps = {
  fetch: typeof fetch;
  userAgent: string;
};

export interface Source {
  readonly name: string;
  /** Candidates for `date` (ISO), most prominent first. */
  fetch(date: string, deps: SourceDeps): Promise<RawCandidate[]>;
}

/**
 * Wikimedia and Wikidata both require a descriptive User-Agent naming the
 * project and a way to reach whoever runs it; without one, the REST API
 * answers 403. The contact is the repository's issue tracker.
 */
export const USER_AGENT =
  'ArsMagnaGreatestHits/0.1 (https://github.com/ryanjosephkamp/ars-magna; issues on GitHub)';
