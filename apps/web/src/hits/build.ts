/**
 * What the gallery is built from: the published hits, as the page and the
 * per-hit static pages need them. Pure, so `scripts/build-hits.ts` can call
 * it at build time and the tests can call it on fixtures. No Node imports
 * here; the script does the file work.
 */

export type Category = 'people' | 'companies' | 'products' | 'titles' | 'places' | 'phrases';

/** A line of data/hits.jsonl, the fields the site needs. */
export type HitRecord = {
  id: string;
  input: string;
  category: Category;
  words: string[];
  display: string;
  letters: string;
  judge: { total: number; rationale: string; model: string }[];
  submitter?: string;
  added: string;
  tags: string[];
  status: 'proposed' | 'accepted' | 'featured' | 'retired';
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
  rationale: string;
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

/** The colons of a hit id become hyphens; every part is `[a-z-]`, so it reads back unambiguously. */
export function slugOf(id: string): string {
  return id.replace(/:/g, '-');
}

export function publishable(hits: readonly HitRecord[]): HitRecord[] {
  return hits.filter((h) => h.status === 'accepted' || h.status === 'featured');
}

export function toPublic(hit: HitRecord): PublicHit {
  const best = [...hit.judge].sort((a, b) => b.total - a.total)[0];
  const note = hit.tags.find((t) => t.startsWith('note:'))?.slice(5);
  return {
    id: hit.id,
    slug: slugOf(hit.id),
    input: hit.input,
    category: hit.category,
    display: hit.display,
    words: hit.words,
    letters: hit.letters,
    rationale: best?.rationale ?? note ?? '',
    score: best?.total ?? null,
    featured: hit.status === 'featured',
    submitter: hit.submitter && hit.submitter !== 'seed' ? hit.submitter : null,
    added: hit.added,
    tags: hit.tags.filter((t) => !t.startsWith('note:')),
  };
}

/** Featured first, then newest, then by id so the order is total. */
export function ordered(hits: readonly PublicHit[]): PublicHit[] {
  return [...hits].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || b.added.localeCompare(a.added) || a.id.localeCompare(b.id),
  );
}

/**
 * The anagram of the day: a deterministic pick from the list by the date, so
 * everyone sees the same one and it changes at midnight UTC. Featured hits
 * form the pool when there are any.
 */
export function pickOfTheDay(hits: readonly PublicHit[], date: string): PublicHit | null {
  if (hits.length === 0) return null;
  const pool = hits.some((h) => h.featured) ? hits.filter((h) => h.featured) : hits;
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
  const description = hit.rationale || `An anagram of ${hit.input}: ${hit.display}. From the Ars Magna Greatest Hits.`;
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
