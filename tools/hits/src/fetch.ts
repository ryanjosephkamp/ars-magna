/**
 * `pnpm hits:fetch [--date=YYYY-MM-DD] [--limit=150] [--classify-with-haiku]`
 * `pnpm hits:fetch --reclassify`
 *
 * New candidate inputs, with no model: the day's most-viewed Wikipedia
 * articles, categorized through Wikidata, deduplicated against what is
 * already in data/candidates.jsonl, appended. The run prints what it added
 * by category and a tally of the classes it could not place, which is how
 * the category table grows.
 *
 * `--reclassify` fetches nothing: it asks Wikidata again about the candidates
 * the table could not place, for after the table has grown. A candidate that
 * now fits moves to its category as `new`, under the id that category gives
 * it; one that already exists there is dropped rather than duplicated.
 */
import { classifyWithHaiku } from './classify/haiku.ts';
import { cleanTitle, isJunk } from './classify/junk.ts';
import { classifyTitles, type Classification } from './classify/wikidata.ts';
import { candidateId, type Category } from './ids.ts';
import { flag, has } from './queue.ts';
import { CANDIDATES_PATH, appendJsonl, candidateSchema, readJsonl, today, writeJsonl, type Candidate } from './schema.ts';
import { USER_AGENT, type RawCandidate, type Source } from './sources/source.ts';
import { wikipediaTop } from './sources/wikipedia-top.ts';

export const SOURCES: readonly Source[] = [wikipediaTop];
export const DEFAULT_LIMIT = 150;

export type FetchResult = {
  candidates: Candidate[];
  added: Candidate[];
  classified: Classification[];
  junk: number;
  /** P31 classes of the titles that found no category, most frequent first. */
  unclassified: [string, number][];
};

/**
 * The pure core: given raw titles and their classifications, the candidate
 * records to append. Exposed so the test can drive it on fixtures.
 */
export function toCandidates(
  raw: readonly RawCandidate[],
  classified: ReadonlyMap<string, Classification>,
  haiku: ReadonlyMap<string, Category>,
  date: string,
): Candidate[] {
  const out: Candidate[] = [];
  for (const item of raw) {
    const c = classified.get(item.title);
    const category = c?.category ?? haiku.get(item.title) ?? null;
    const input = cleanTitle(item.title);
    const candidate: Candidate = {
      id: candidateId(input, category ?? 'phrases'),
      input,
      category: category ?? 'phrases',
      source: 'trending',
      first_seen: date,
      status: category ? 'new' : 'unclassified',
    };
    if (c?.qid) candidate.wikidata_qid = c.qid;
    if (input !== item.title) candidate.notes = `Wikipedia: ${item.title}`;
    out.push(candidate);
  }
  return out;
}

/** The Wikipedia title a candidate came from, for asking Wikidata again. */
export function titleOf(candidate: Candidate): string {
  const prefix = 'Wikipedia: ';
  return candidate.notes?.startsWith(prefix) ? candidate.notes.slice(prefix.length) : candidate.input;
}

/**
 * The pure core of `--reclassify`: the candidate list with every unclassified
 * candidate that now has a category moved there. Returns the new list and
 * the candidates that moved.
 */
export function reclassify(
  candidates: readonly Candidate[],
  classified: ReadonlyMap<string, Classification>,
): { candidates: Candidate[]; moved: Candidate[] } {
  const ids = new Set(candidates.map((c) => c.id));
  const out: Candidate[] = [];
  const moved: Candidate[] = [];
  for (const c of candidates) {
    const category = c.status === 'unclassified' ? classified.get(titleOf(c))?.category : undefined;
    if (!category) {
      out.push(c);
      continue;
    }
    const id = candidateId(c.input, category);
    const placed: Candidate = { ...c, id, category, status: 'new' };
    const qid = classified.get(titleOf(c))?.qid;
    if (qid) placed.wikidata_qid = qid;
    moved.push(placed);
    // Already a candidate under that category (a later fetch placed it): the
    // unclassified line just goes away.
    if (!ids.has(id)) {
      out.push(placed);
      ids.add(id);
    }
  }
  return { candidates: out, moved };
}

export async function runReclassify(options: { fetch: typeof fetch; dryRun?: boolean }): Promise<Candidate[]> {
  const validate = await candidateSchema();
  const all = await readJsonl(CANDIDATES_PATH, validate);
  const unplaced = all.filter((c) => c.status === 'unclassified');
  if (unplaced.length === 0) return [];
  const classified = await classifyTitles(unplaced.map(titleOf), { fetch: options.fetch, userAgent: USER_AGENT });
  const { candidates, moved } = reclassify(all, new Map(classified.map((c) => [c.title, c])));
  if (!options.dryRun && moved.length > 0) await writeJsonl(CANDIDATES_PATH, candidates, validate);
  return moved;
}

export async function runFetch(options: {
  date: string;
  limit: number;
  fetch: typeof fetch;
  haiku?: { apiKey: string } | null;
  sources?: readonly Source[];
  dryRun?: boolean;
}): Promise<FetchResult> {
  const deps = { fetch: options.fetch, userAgent: USER_AGENT };
  const raw: RawCandidate[] = [];
  for (const source of options.sources ?? SOURCES) raw.push(...(await source.fetch(options.date, deps)));

  const junkCount = raw.filter((r) => isJunk(r.title)).length;
  const kept = raw
    .filter((r) => !isJunk(r.title))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, options.limit);

  const classified = await classifyTitles(
    kept.map((r) => r.title),
    { ...deps, ...(options.dryRun ? {} : {}) },
  );
  const byTitle = new Map(classified.map((c) => [c.title, c]));

  let haiku = new Map<string, Category>();
  const unplaced = classified.filter((c) => c.category === null).map((c) => c.title);
  if (options.haiku && unplaced.length > 0) {
    haiku = await classifyWithHaiku(unplaced, { fetch: options.fetch, apiKey: options.haiku.apiKey });
  }

  const candidates = toCandidates(kept, byTitle, haiku, options.date);
  const added = options.dryRun ? [] : await appendJsonl(CANDIDATES_PATH, candidates, await candidateSchema());

  const tally = new Map<string, number>();
  for (const c of classified) {
    if (c.category !== null || haiku.has(c.title)) continue;
    for (const cls of c.classes) tally.set(cls, (tally.get(cls) ?? 0) + 1);
  }
  const unclassified = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  return { candidates, added, classified, junk: junkCount, unclassified };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const date = flag(argv, 'date') ?? today();
  const limit = Number(flag(argv, 'limit') ?? DEFAULT_LIMIT);
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  const haiku = has(argv, 'classify-with-haiku') && apiKey ? { apiKey } : null;

  if (has(argv, 'reclassify')) {
    const moved = await runReclassify({ fetch, dryRun: has(argv, 'dry-run') });
    console.log(`${moved.length} unclassified candidates now have a category`);
    for (const c of moved) console.log(`  ${c.input.padEnd(40)} ${c.category}`);
    return;
  }

  const before = (await readJsonl(CANDIDATES_PATH, await candidateSchema())).length;
  const result = await runFetch({ date, limit, fetch, haiku, dryRun: has(argv, 'dry-run') });

  const byCategory = new Map<string, number>();
  for (const c of result.added) byCategory.set(c.status === 'unclassified' ? 'unclassified' : c.category, (byCategory.get(c.status === 'unclassified' ? 'unclassified' : c.category) ?? 0) + 1);
  console.log(`${result.candidates.length} titles considered (${result.junk} junk skipped) · ${result.added.length} new candidates · ${before} before`);
  for (const [k, n] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
  if (result.unclassified.length) {
    console.log('unclassified P31 classes (grow classify/categories.json from these):');
    for (const [cls, n] of result.unclassified.slice(0, 15)) console.log(`  ${String(n).padStart(4)}  ${cls}`);
  }
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
