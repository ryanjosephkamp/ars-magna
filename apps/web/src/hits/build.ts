/**
 * What the gallery is built from: the published hits, as the page and the
 * per-hit static pages need them. Pure, so `scripts/build-hits.ts` can call
 * it at build time and the tests can call it on fixtures. No Node imports
 * here; the script does the file work.
 */

import { CLASSES, type ClassName } from '@ars-magna/engine';

export type Category = 'people' | 'companies' | 'products' | 'titles' | 'places' | 'phrases';

/** Greatest Hits (featured), Interesting, or A stretch. */
export type Shelf = 'greatest' | 'interesting' | 'stretch';

/** One judge's score in either rubric: v1 carries aptness, grammar and a total; v2 carries relation and reads. */
export type JudgeRecord = {
  model: string;
  rationale: string;
  total?: number;
  aptness?: number;
  grammar?: number;
  relation?: number;
  reads?: number;
  justification?: string;
};

/** A line of data/hits.jsonl, the fields the site needs. */
export type HitRecord = {
  id: string;
  input: string;
  category: Category;
  words: string[];
  display: string;
  letters: string;
  /** How the input's numbers and symbols are read, every item of them; absent on a hit from before phase N, whose items were dropped. */
  reading?: Record<string, string>;
  /** The class of each term that is not a word of the dictionary, keyed by the term (D63); absent when every term is a word. */
  classes?: Record<string, ClassName>;
  judge: JudgeRecord[];
  submitter?: string;
  added: string;
  tags: string[];
  status: 'proposed' | 'accepted' | 'featured' | 'retired';
  justification?: string;
  /** One factual sentence saying what the input is. */
  about?: string;
  /** The input's English Wikipedia article. */
  wikipedia?: string;
  /** The sense a word reads in, in this anagram, keyed by the word. */
  senses?: Record<string, string>;
};

/** What ships in /hits.json: one compact row per published hit. */
export type PublicHit = {
  id: string;
  slug: string;
  input: string;
  category: Category;
  display: string;
  words: string[];
  letters: string;
  /** How the input's numbers and symbols are read, so the search opens on the same letters; absent on a hit from before phase N. */
  reading?: Record<string, string>;
  /**
   * The class of each term that is not a word of the dictionary, keyed by the
   * term: what the row is labelled with and the panel explains. Absent when
   * every term is a word, which is every hit today.
   */
  classes?: Record<string, ClassName>;
  justification: string;
  shelf: Shelf;
  score: number | null;
  featured: boolean;
  submitter: string | null;
  added: string;
  tags: string[];
  /** What the input is, in one sentence; null until it has one. */
  about: string | null;
  /** The input's English Wikipedia article, or null. */
  wikipedia: string | null;
  /**
   * The sense a word reads in, in this anagram, keyed by the word, where the
   * dictionary's first sense would not explain the reading. Left out when the
   * hit has none, which is most of them.
   */
  senses?: Record<string, string>;
  /**
   * The words' best orders as phrases, the hit's own first, at most eight;
   * empty when the words read only one way. Worked out at build time with the
   * engine, so the page ranks them without one.
   */
  orderings: string[];
};

export const CATEGORIES: readonly Category[] = ['people', 'companies', 'products', 'titles', 'places', 'phrases'];

/**
 * The classes a hit's terms come from, once each, in the plan's table order:
 * what the row is labelled with, and what its links carry so the search and
 * Build open with the same terms admitted. Empty for a hit of words alone,
 * which is every hit today.
 */
export function hitClasses(hit: Pick<PublicHit, 'classes'>): ClassName[] {
  const named = Object.values(hit.classes ?? {});
  return CLASSES.filter((name) => named.includes(name));
}

export const CATEGORY_LABEL: Record<Category, string> = {
  people: 'People',
  companies: 'Companies',
  products: 'Products',
  titles: 'Titles',
  places: 'Places',
  phrases: 'Phrases',
};

/** The Discover page's sections, in order, each with what it means. */
export const SECTIONS: readonly { shelf: Shelf; label: string; note: string }[] = [
  { shelf: 'greatest', label: 'Greatest Hits', note: 'The best of them, picked by hand.' },
  { shelf: 'interesting', label: 'Interesting', note: 'Names the original, or has a clear, specific link to it.' },
  { shelf: 'stretch', label: 'A stretch', note: 'A looser link, arguable in a sentence.' },
];

const SECTION_RANK: Record<Shelf, number> = { greatest: 0, interesting: 1, stretch: 2 };

/** The colons of a hit id become hyphens; every part is `[a-z-]`, so it reads back unambiguously. */
export function slugOf(id: string): string {
  return id.replace(/:/g, '-');
}

export function publishable(hits: readonly HitRecord[]): HitRecord[] {
  return hits.filter((h) => h.status === 'accepted' || h.status === 'featured');
}

/**
 * The shelf a published hit shows on. This repeats `shelfOf` in
 * tools/hits/src/shelf.ts, which is the rule's source; the site does not
 * import the pipeline package, and a test there checks that the two agree.
 * A `shelf:` tag, the operator's placement, decides before the scores. Only the
 * best relation matters: rubric v1's aptness counts as relation.
 */
export function shelfOf(hit: Pick<HitRecord, 'status' | 'judge'> & { tags?: readonly string[] }): Shelf {
  if (hit.status === 'featured') return 'greatest';
  if (hit.tags?.includes('shelf:stretch')) return 'stretch';
  if (hit.tags?.includes('shelf:interesting')) return 'interesting';
  if (hit.judge.length === 0) return 'interesting';
  const relation = Math.max(...hit.judge.map((j) => j.relation ?? j.aptness ?? 1));
  return relation >= 4 ? 'interesting' : 'stretch';
}

/** A published hit as the site ships it. Its `orderings` start empty: the build, which has the engine, fills them in. */
export function toPublic(hit: HitRecord): PublicHit {
  const v1 = hit.judge.filter((j) => j.total !== undefined).sort((a, b) => b.total! - a.total!)[0];
  const v2 = hit.judge
    .filter((j) => j.relation !== undefined && j.justification)
    .sort((a, b) => b.relation! - a.relation! || (b.reads ?? 0) - (a.reads ?? 0))[0];
  const note = hit.tags.find((t) => t.startsWith('note:'))?.slice(5);
  return {
    id: hit.id,
    slug: slugOf(hit.id),
    input: hit.input,
    category: hit.category,
    display: hit.display,
    words: hit.words,
    letters: hit.letters,
    ...(hit.reading ? { reading: hit.reading } : {}),
    ...(hit.classes && Object.keys(hit.classes).length > 0 ? { classes: hit.classes } : {}),
    // The operator's own sentence first, then the v2 judge's, then the v1 rationale, then a submitter's note.
    justification: hit.justification ?? v2?.justification ?? v1?.rationale ?? note ?? '',
    shelf: shelfOf(hit),
    score: v1?.total ?? null,
    featured: hit.status === 'featured',
    // `seed` and `mcp` say how the hit reached the file, not a person to credit.
    submitter: hit.submitter && hit.submitter !== 'seed' && hit.submitter !== 'mcp' ? hit.submitter : null,
    added: hit.added,
    // A note becomes the justification and a shelf tag the shelf; neither is a tag a reader filters by.
    tags: hit.tags.filter((t) => !t.startsWith('note:') && !t.startsWith('shelf:')),
    about: hit.about ?? null,
    wikipedia: hit.wikipedia ?? null,
    ...(hit.senses && Object.keys(hit.senses).length > 0 ? { senses: hit.senses } : {}),
    orderings: [],
  };
}

/**
 * A row of `hits.json` as the page can rely on it. A copy the service worker
 * kept from before a field existed lacks it, and the page should still open.
 */
export function withDefaults(hit: Partial<PublicHit> & Pick<PublicHit, 'id' | 'words'>): PublicHit {
  return { about: null, wikipedia: null, orderings: [], ...hit } as PublicHit;
}

/** A search for the input itself, as a reader would type it. */
export function googleUrl(input: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}

export type Order = 'votes' | 'newest' | 'alphabetical';

/**
 * A section's hits in the reader's chosen order: most votes first with ties A
 * to Z, newest first, or A to Z by input and then by anagram. The id breaks any
 * remaining tie, so the order is total.
 */
export function inOrder(hits: readonly PublicHit[], order: Order, counts: Readonly<Record<string, number>> = {}): PublicHit[] {
  const newest = (a: PublicHit, b: PublicHit) => b.added.localeCompare(a.added) || a.id.localeCompare(b.id);
  const byName = (a: PublicHit, b: PublicHit) =>
    a.input.localeCompare(b.input, 'en', { sensitivity: 'base' }) || a.display.localeCompare(b.display, 'en') || a.id.localeCompare(b.id);
  const byVotes = (a: PublicHit, b: PublicHit) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || byName(a, b);
  return [...hits].sort(order === 'votes' ? byVotes : order === 'alphabetical' ? byName : newest);
}

/** Rows a section shows before its Show all control. */
export const FOLD = 12;

/**
 * Whether a section shows every row. Under Find or Category every section does,
 * since a reader looking for something should see all of it. Otherwise the
 * reader's own Show all or Show fewer decides, and before they choose, the
 * section a link points into opens.
 */
export function sectionOpen(shelf: Shelf, state: { filtered: boolean; chosen: boolean | undefined; linked: Shelf | null }): boolean {
  if (state.filtered) return true;
  return state.chosen ?? state.linked === shelf;
}

/**
 * The section a link to a hit opens: the hit's own, wherever the hit sits in it. Wherever, rather than only
 * past the fold, because votes arriving can move the hit across the fold after the page has landed on it, and
 * the section folding under the reader then would be worse than a section opened that did not need to be.
 */
export function linkedSection(hits: readonly PublicHit[], slug: string | null): Shelf | null {
  if (!slug) return null;
  return hits.find((h) => h.slug === slug)?.shelf ?? null;
}

/**
 * The section under a line across the page, just below the sections bar; null above the first or past the
 * last. Sections are given in page order, and each runs on to the next one's top, so the space between two
 * never leaves the line with no section.
 */
export function sectionAt(bounds: readonly { shelf: Shelf; top: number; bottom: number }[], line: number): Shelf | null {
  const index = bounds.findIndex((b, i) => b.top <= line && line < (bounds[i + 1]?.top ?? b.bottom));
  return index >= 0 ? bounds[index]!.shelf : null;
}

/** In section order (Greatest Hits, Interesting, A stretch), newest first within each, then by id so the order is total. */
export function ordered(hits: readonly PublicHit[]): PublicHit[] {
  return [...hits].sort(
    (a, b) => SECTION_RANK[a.shelf] - SECTION_RANK[b.shelf] || b.added.localeCompare(a.added) || a.id.localeCompare(b.id),
  );
}

/**
 * The anagram of the day: a deterministic pick from the list by the date, so
 * everyone sees the same one and it changes at midnight UTC. Greatest Hits
 * and Interesting form the pool; A stretch only when there is nothing else.
 */
export function pickOfTheDay(hits: readonly PublicHit[], date: string): PublicHit | null {
  if (hits.length === 0) return null;
  const strong = hits.filter((h) => h.shelf !== 'stretch');
  const pool = strong.length > 0 ? strong : hits;
  let hash = 2166136261;
  for (let i = 0; i < date.length; i++) hash = Math.imul(hash ^ date.charCodeAt(i), 16777619);
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[(hash >>> 0) % sorted.length]!;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * One small static page per hit, so a shared link carries its own title and
 * description for crawlers and link previews, then sends the reader to the
 * gallery with the hit selected. Static files only: nothing on this site is
 * asked of a server.
 */
export function hitPage(hit: PublicHit, origin: string): string {
  const title = `${hit.input} → ${hit.display}`;
  // What the input is, when the hit says, for a preview read by someone who may not know it.
  const description = hit.about || hit.justification || `An anagram of ${hit.input}: ${hit.display}. One of the anagrams on Ars Magna Discover.`;
  const url = `${origin}/hits/${hit.slug}/`;
  const target = `/hits#${hit.slug}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} — Ars Magna</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:site_name" content="Ars Magna" />
    <meta name="twitter:card" content="summary" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  </head>
  <body>
    <p><a href="${escapeHtml(target)}">${escapeHtml(hit.input)} is an anagram of ${escapeHtml(hit.display)}.</a></p>
    <script>location.replace(${JSON.stringify(target)});</script>
  </body>
</html>
`;
}
