/**
 * What the gallery is built from: the published hits, as the page and the
 * per-hit static pages need them. Pure, so `scripts/build-hits.ts` can call
 * it at build time and the tests can call it on fixtures. No Node imports
 * here; the script does the file work.
 */

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
  judge: JudgeRecord[];
  submitter?: string;
  added: string;
  tags: string[];
  status: 'proposed' | 'accepted' | 'featured' | 'retired';
  justification?: string;
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
  justification: string;
  shelf: Shelf;
  score: number | null;
  featured: boolean;
  submitter: string | null;
  added: string;
  tags: string[];
};

export const CATEGORIES: readonly Category[] = ['people', 'companies', 'products', 'titles', 'places', 'phrases'];

export const CATEGORY_LABEL: Record<Category, string> = {
  people: 'People',
  companies: 'Companies',
  products: 'Products',
  titles: 'Titles',
  places: 'Places',
  phrases: 'Phrases',
};

/** The Discoveries page's sections, in order, each with what it means. */
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
    // The operator's own sentence first, then the v2 judge's, then the v1 rationale, then a submitter's note.
    justification: hit.justification ?? v2?.justification ?? v1?.rationale ?? note ?? '',
    shelf: shelfOf(hit),
    score: v1?.total ?? null,
    featured: hit.status === 'featured',
    submitter: hit.submitter && hit.submitter !== 'seed' ? hit.submitter : null,
    added: hit.added,
    // A note becomes the justification and a shelf tag the shelf; neither is a tag a reader filters by.
    tags: hit.tags.filter((t) => !t.startsWith('note:') && !t.startsWith('shelf:')),
  };
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
  const description = hit.justification || `An anagram of ${hit.input}: ${hit.display}. One of the Ars Magna discoveries.`;
  const url = `${origin}/hits/${hit.slug}/`;
  const target = `/hits.html#${hit.slug}`;
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
