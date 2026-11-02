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
  /** The English Wikipedia article the title matched. */
  wikipedia?: string;
};

type Binding = {
  title: { value: string };
  item: { value: string };
  class: { value: string };
  root?: { value: string };
  subjectLabel?: { value: string };
  sitelink?: { value: string };
};
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
  return `SELECT ?title ?item ?sitelink ?class ?root ?subjectLabel WHERE {
  VALUES ?title { ${values} }
  ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
  ?item wdt:P31 ?class .
  OPTIONAL { VALUES ?root { ${roots} } ?class wdt:P279* ?root . }
  OPTIONAL { ?item wdt:P106|wdt:P452|wdt:P136 ?subject . ?subject rdfs:label ?subjectLabel . FILTER(LANG(?subjectLabel) = "en") }
}`;
}

/** Each root class's category, or `exclude`. */
function rootCategories(table: CategoryTable): Map<string, Category | 'exclude'> {
  const rootCategory = new Map<string, Category | 'exclude'>();
  for (const category of Object.keys(table.roots)) {
    if (!isCategory(category)) continue;
    for (const q of Object.keys(table.roots[category])) rootCategory.set(q, category);
  }
  for (const q of Object.keys(table.exclude)) rootCategory.set(q, 'exclude');
  return rootCategory;
}

/** The category the roots an item reached give it: none if any is excluded, else the first by precedence. */
function categoryOf(matched: ReadonlySet<Category>, excluded: boolean, table: CategoryTable): Category | null {
  return excluded ? null : (table.precedence.find((c) => matched.has(c)) ?? null);
}

/** Turn the bindings for a batch into one classification per title. Pure. */
export function interpret(titles: readonly string[], bindings: readonly Binding[], table: CategoryTable): Classification[] {
  const rootCategory = rootCategories(table);

  type Entry = { qid: string; classes: Set<string>; matched: Set<Category>; excluded: boolean; subjects: Set<string>; wikipedia?: string };
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
    if (b.sitelink && !entry.wikipedia) entry.wikipedia = b.sitelink.value;
    byTitle.set(b.title.value, entry);
  }

  return titles.map((title) => {
    const entry = byTitle.get(title);
    if (!entry) return { title, qid: null, classes: [], category: null, subjects: [] };
    const category = categoryOf(entry.matched, entry.excluded, table);
    const subjects = [...entry.subjects].sort().slice(0, MAX_SUBJECTS);
    const classification: Classification = { title, qid: entry.qid, classes: [...entry.classes], category, subjects };
    if (entry.wikipedia) classification.wikipedia = entry.wikipedia;
    return classification;
  });
}

type Deps = { fetch: typeof fetch; userAgent: string; sleep?: (ms: number) => Promise<void> };

/**
 * One query's bindings. 429 is rate limiting; 502, 503 and 504 are the query
 * service having a moment, which it does several times a day. All are worth
 * a retry.
 */
async function sparql<T>(query: string, deps: Deps): Promise<T[]> {
  const sleep = deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
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
    if ([429, 502, 503, 504].includes(response.status)) {
      await sleep(3_000 * attempt);
      continue;
    }
    if (!response.ok) throw new Error(`Wikidata SPARQL -> HTTP ${response.status}`);
    return ((await response.json()) as { results: { bindings: T[] } }).results.bindings;
  }
  return [];
}

/** Run `each` over `items` in batches of `size`, pausing politely between batches. */
async function inBatches<T, R>(items: readonly T[], size: number, deps: Deps, each: (batch: readonly T[]) => Promise<R[]>): Promise<R[]> {
  const sleep = deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await each(items.slice(i, i + size))));
    if (i + size < items.length) await sleep(500);
  }
  return out;
}

export async function classifyTitles(titles: readonly string[], deps: Deps): Promise<Classification[]> {
  const table = await categoryTable();
  return inBatches(titles, BATCH, deps, async (batch) => interpret(batch, await sparql<Binding>(buildQuery(batch, table), deps), table));
}

/** What Wikidata says an item is, for the sentence about an input and its link. */
export type WikidataItem = {
  qid: string;
  /** The English description: a fragment such as "American singer-songwriter (1946–2026)". */
  description: string | null;
  /** The item has a date of death (P570) or of dissolution (P576). */
  ended: boolean;
  /** The English Wikipedia article. */
  wikipedia: string | null;
};

type DescribeBinding = { item: { value: string }; description?: { value: string }; ended?: { value: string }; sitelink?: { value: string } };

export function describeQuery(qids: readonly string[]): string {
  // EXISTS rather than an OPTIONAL on the dates, which would repeat the row for every date statement an item has.
  return `SELECT ?item ?description ?ended ?sitelink WHERE {
  VALUES ?item { ${qids.map((q) => `wd:${q}`).join(' ')} }
  OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "en") }
  BIND(EXISTS { ?item wdt:P570|wdt:P576 [] } AS ?ended)
  OPTIONAL { ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
}`;
}

/** The bindings of `describeQuery` as one item per QID asked about. Pure. */
export function interpretItems(qids: readonly string[], bindings: readonly DescribeBinding[]): Map<string, WikidataItem> {
  const out = new Map<string, WikidataItem>(qids.map((q) => [q, { qid: q, description: null, ended: false, wikipedia: null }]));
  for (const b of bindings) {
    const item = out.get(qid(b.item.value));
    if (!item) continue;
    item.description ??= b.description?.value ?? null;
    item.ended ||= b.ended?.value === 'true';
    item.wikipedia ??= b.sitelink?.value ?? null;
  }
  return out;
}

/** What Wikidata says each of these items is. */
export async function describeItems(qids: readonly string[], deps: Deps): Promise<Map<string, WikidataItem>> {
  const unique = [...new Set(qids)];
  const items = await inBatches(unique, BATCH, deps, async (batch) => [
    ...interpretItems(batch, await sparql<DescribeBinding>(describeQuery(batch), deps)).values(),
  ]);
  return new Map(items.map((item) => [item.qid, item]));
}

/** An item whose English label, or English Wikipedia title, is an input's text. */
export type LabelMatch = { qid: string; category: Category | null; wikipedia: string };

type LabelBinding = { label: { value: string }; item: { value: string }; sitelink: { value: string }; class: { value: string }; root?: { value: string } };

/** Labels come back with dozens of items when they are common words, so they are asked about a few at a time. */
export const LABEL_BATCH = 15;

export function labelQuery(labels: readonly string[], table: CategoryTable): string {
  const values = labels.map((t) => `${JSON.stringify(t)}@en`).join(' ');
  const roots = [...Object.values(table.roots).flatMap((r) => Object.keys(r)), ...Object.keys(table.exclude)]
    .map((q) => `wd:${q}`)
    .join(' ');
  // Only items with an English Wikipedia article: that drops the scholarly articles and taxa that share
  // a label, before the subclass walk.
  return `SELECT ?label ?item ?sitelink ?class ?root WHERE {
  VALUES ?label { ${values} }
  ?item rdfs:label ?label .
  ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .
  ?item wdt:P31 ?class .
  OPTIONAL { VALUES ?root { ${roots} } ?class wdt:P279* ?root . }
}`;
}

/** Every item each label names, with the category it reaches. Pure. */
export function interpretLabels(labels: readonly string[], bindings: readonly LabelBinding[], table: CategoryTable): Map<string, LabelMatch[]> {
  const rootCategory = rootCategories(table);
  type Entry = { qid: string; wikipedia: string; matched: Set<Category>; excluded: boolean };
  const byLabel = new Map<string, Map<string, Entry>>(labels.map((l) => [l, new Map()]));
  for (const b of bindings) {
    const items = byLabel.get(b.label.value);
    if (!items) continue;
    const id = qid(b.item.value);
    const entry = items.get(id) ?? { qid: id, wikipedia: b.sitelink.value, matched: new Set(), excluded: false };
    if (b.root) {
      const hit = rootCategory.get(qid(b.root.value));
      if (hit === 'exclude') entry.excluded = true;
      else if (hit) entry.matched.add(hit);
    }
    items.set(id, entry);
  }
  return new Map(
    [...byLabel].map(([label, items]) => [
      label,
      [...items.values()].map((e) => ({ qid: e.qid, category: categoryOf(e.matched, e.excluded, table), wikipedia: e.wikipedia })),
    ]),
  );
}

/** Every item with an English Wikipedia article whose English label is each of these texts. */
export async function lookupLabels(labels: readonly string[], deps: Deps): Promise<Map<string, LabelMatch[]>> {
  const table = await categoryTable();
  const unique = [...new Set(labels)];
  const pairs = await inBatches(unique, LABEL_BATCH, deps, async (batch) => [
    ...interpretLabels(batch, await sparql<LabelBinding>(labelQuery(batch, table), deps), table),
  ]);
  return new Map(pairs);
}
