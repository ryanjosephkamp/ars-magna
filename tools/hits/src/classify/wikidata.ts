/**
 * Which category is this Wikipedia article? Ask Wikidata, in one query per
 * batch of titles.
 *
 * The SPARQL endpoint does the whole job at once: title → item through the
 * enwiki sitelink, item → its P31 classes, and each class → whichever of our
 * root classes it reaches through P279* (subclass of, transitively). The
 * transitive walk is the point. The daily top thousand is full of football
 * clubs, bands and chatbots, whose own classes sit two or more hops below
 * "business", "human" or "software"; a single-level lookup would leave most
 * of them unclassified.
 *
 * The endpoint asks for a descriptive User-Agent and a polite pace: batches
 * of fifty, one at a time, with a retry on 429. Fifty titles come back in a
 * second or two.
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type Category, isCategory } from '../ids.ts';

const here = dirname(fileURLToPath(import.meta.url));
const ENDPOINT = 'https://query.wikidata.org/sparql';
export const BATCH = 50;

export type CategoryTable = {
  precedence: Category[];
  roots: Record<Category, Record<string, string>>;
  exclude: Record<string, string>;
};

let table: CategoryTable | null = null;
export async function categoryTable(): Promise<CategoryTable> {
  table ??= JSON.parse(await readFile(resolve(here, 'categories.json'), 'utf8')) as CategoryTable;
  return table;
}

export type Classification = {
  title: string;
  qid: string | null;
  /** P31 classes seen, for the unclassified tally. */
  classes: string[];
  category: Category | null;
  /** Occupation, industry and genre labels as slugs, sorted: actor, airline, science-fiction-film. */
  subjects: string[];
};

type Binding = {
  title: { value: string };
  item: { value: string };
  class: { value: string };
  root?: { value: string };
  subjectLabel?: { value: string };
};
type SparqlResult = { results: { bindings: Binding[] } };

/** Most subjects kept for one title; a prolific person can list dozens of occupations. */
export const MAX_SUBJECTS = 8;

function qid(uri: string): string {
  return uri.slice(uri.lastIndexOf('/') + 1);
}

/**
 * A Wikidata label as a subject slug: "science fiction film" becomes
 * "science-fiction-film". A label that does not start with a letter, such
 * as "3D animation", gives none.
 */
export function subjectSlug(label: string): string | null {
  const slug = label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return /^[a-z]/.test(slug) ? slug : null;
}

export function buildQuery(titles: readonly string[], table: CategoryTable): string {
  const values = titles.map((t) => `${JSON.stringify(t)}@en`).join(' ');
  const roots = [...Object.values(table.roots).flatMap((r) => Object.keys(r)), ...Object.keys(table.exclude)]
    .map((q) => `wd:${q}`)
    .join(' ');
  // P106 occupation (people), P452 industry (companies), P136 genre (titles).
  return `SELECT ?title ?item ?class ?root ?subjectLabel WHERE {
  VALUES ?title { ${values} }
  ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
  ?item wdt:P31 ?class .
  OPTIONAL { VALUES ?root { ${roots} } ?class wdt:P279* ?root . }
  OPTIONAL { ?item wdt:P106|wdt:P452|wdt:P136 ?subject . ?subject rdfs:label ?subjectLabel . FILTER(LANG(?subjectLabel) = "en") }
}`;
}

/** Turn the bindings for a batch into one classification per title. Pure. */
export function interpret(titles: readonly string[], bindings: readonly Binding[], table: CategoryTable): Classification[] {
  const rootCategory = new Map<string, Category | 'exclude'>();
  for (const category of Object.keys(table.roots)) {
    if (!isCategory(category)) continue;
    for (const q of Object.keys(table.roots[category])) rootCategory.set(q, category);
  }
  for (const q of Object.keys(table.exclude)) rootCategory.set(q, 'exclude');

  type Entry = { qid: string; classes: Set<string>; matched: Set<Category>; excluded: boolean; subjects: Set<string> };
  const byTitle = new Map<string, Entry>();
  for (const b of bindings) {
    const entry: Entry = byTitle.get(b.title.value) ?? {
      qid: qid(b.item.value),
      classes: new Set(),
      matched: new Set(),
      excluded: false,
      subjects: new Set(),
    };
    entry.classes.add(qid(b.class.value));
    if (b.root) {
      const hit = rootCategory.get(qid(b.root.value));
      if (hit === 'exclude') entry.excluded = true;
      else if (hit) entry.matched.add(hit);
    }
    const slug = b.subjectLabel ? subjectSlug(b.subjectLabel.value) : null;
    if (slug) entry.subjects.add(slug);
    byTitle.set(b.title.value, entry);
  }

  return titles.map((title) => {
    const entry = byTitle.get(title);
    if (!entry) return { title, qid: null, classes: [], category: null, subjects: [] };
    const category = entry.excluded ? null : (table.precedence.find((c) => entry.matched.has(c)) ?? null);
    const subjects = [...entry.subjects].sort().slice(0, MAX_SUBJECTS);
    return { title, qid: entry.qid, classes: [...entry.classes], category, subjects };
  });
}

export async function classifyTitles(
  titles: readonly string[],
  deps: { fetch: typeof fetch; userAgent: string; sleep?: (ms: number) => Promise<void> },
): Promise<Classification[]> {
  const table = await categoryTable();
  const sleep = deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const out: Classification[] = [];
  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH);
    const query = buildQuery(batch, table);
    let bindings: Binding[] = [];
    for (let attempt = 1; attempt <= 4; attempt++) {
      const response = await deps.fetch(`${ENDPOINT}?format=json`, {
        method: 'POST',
        headers: {
          'user-agent': deps.userAgent,
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/sparql-results+json',
        },
        body: `query=${encodeURIComponent(query)}`,
      });
      // 429 is rate limiting; 502, 503 and 504 are the query service having a
      // moment, which it does several times a day. All are worth a retry.
      if ([429, 502, 503, 504].includes(response.status)) {
        await sleep(3_000 * attempt);
        continue;
      }
      if (!response.ok) throw new Error(`Wikidata SPARQL -> HTTP ${response.status}`);
      bindings = ((await response.json()) as SparqlResult).results.bindings;
      break;
    }
    out.push(...interpret(batch, bindings, table));
    if (i + BATCH < titles.length) await sleep(500);
  }
  return out;
}
