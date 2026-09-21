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
 * A new candidate Wikidata places also gets `about`, a sentence built from the
 * item's English description, and `wikipedia`, its English Wikipedia article.
 *
 * `--reclassify` fetches no titles. It asks Wikidata again about the
 * candidates the table could not place, for after the table has grown: a
 * candidate that now fits moves to its category as `new`, under the id that
 * category gives it; one that already exists there is dropped rather than
 * duplicated. Then it finds the Wikidata item of each manual candidate that
 * has none, by its English Wikipedia title, taking an item only when it
 * reaches the candidate's own category, and prints the one label match in
 * that category as a suggestion; and it writes `about` and `wikipedia` for every
 * placed candidate with an item and no sentence yet, copying them to the
 * hits. A sentence that exists, from any source, is never replaced.
 */
import { sentenceFromWikidata, syncAbout } from './about.ts';
import { classifyWithHaiku } from './classify/haiku.ts';
import { cleanTitle, isJunk } from './classify/junk.ts';
import { classifyTitles, describeItems, lookupLabels, type Classification, type WikidataItem } from './classify/wikidata.ts';
import { candidateId, recordReading, type Category } from './ids.ts';
import { flag, has } from './queue.ts';
import { CANDIDATES_PATH, HITS_PATH, appendJsonl, candidateSchema, explain, hitSchema, readJsonl, today, writeJsonl, type Candidate } from './schema.ts';
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
    // A new candidate is read by the defaults, and records how (phase N).
    const reading = recordReading(input);
    const candidate: Candidate = {
      id: candidateId(input, category ?? 'phrases', {}),
      input,
      category: category ?? 'phrases',
      source: 'trending',
      first_seen: date,
      status: category ? 'new' : 'unclassified',
      ...(reading ? { reading } : {}),
    };
    if (c?.qid) candidate.wikidata_qid = c.qid;
    if (c?.subjects.length) candidate.subjects = c.subjects;
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
    // Placed under its own reading, or, for a candidate from before phase N, read afresh by the defaults.
    const reading = c.reading ?? recordReading(c.input);
    const id = candidateId(c.input, category, reading ?? {});
    const placed: Candidate = { ...c, id, category, status: 'new', ...(reading ? { reading } : {}) };
    const legacy = candidateId(c.input, category, null);
    const qid = classified.get(titleOf(c))?.qid;
    if (qid) placed.wikidata_qid = qid;
    const subjects = classified.get(titleOf(c))?.subjects;
    if (subjects?.length) placed.subjects = subjects;
    moved.push(placed);
    // Already a candidate under that category (a later fetch placed it), under
    // its own id or the one it had before phase N: the unclassified line just goes away.
    if (!ids.has(id) && !ids.has(legacy)) {
      out.push(placed);
      ids.add(id);
    }
  }
  return { candidates: out, moved };
}

/** The id a candidate would have had before phase N: its digits and symbols left out of the letters. */
export function legacyId(c: Pick<Candidate, 'input' | 'category'>): string {
  return candidateId(c.input, c.category, null);
}

/**
 * A candidate with what Wikidata says about its item: `about` and `wikipedia`
 * where it has neither yet, each only where Wikidata gives one. Pure.
 */
export function withWikidata(candidate: Candidate, item: WikidataItem | undefined): Candidate {
  if (!item) return candidate;
  const next = { ...candidate };
  const about = candidate.about ? null : sentenceFromWikidata(candidate.input, item.description, item.ended);
  if (about) next.about = about;
  if (!candidate.wikipedia && item.wikipedia) next.wikipedia = item.wikipedia;
  return next;
}

/** A candidate Wikidata may describe: placed, with an item, and not rejected. */
export function describable(c: Candidate): boolean {
  return Boolean(c.wikidata_qid) && c.status !== 'unclassified' && c.status !== 'rejected';
}

/** A manual candidate whose item can be looked up by its text. Phrases are skipped: a common word's label names a concept, not the input. */
export function lookupable(c: Candidate): boolean {
  return c.source === 'manual' && !c.wikidata_qid && c.category !== 'phrases' && c.status !== 'unclassified' && c.status !== 'rejected';
}

export type Matched = { id: string; input: string; qid: string };
export type Unmatched = { id: string; input: string; reason: string };

/**
 * The item of each manual candidate, by its English Wikipedia title (as
 * written, then with a capital first letter), taken only when the item
 * reaches the candidate's own category. Failing that, the one item in its
 * category whose English label is its text is a suggestion, never written:
 * a label is shared by obscure items often enough (Peloton the supercomputer
 * program, Old England the Brussels department store) that a person names the
 * item with `pnpm hits:describe <id> --wikidata=Q…`. Pure.
 */
export function matchItems(
  candidates: readonly Candidate[],
  byTitle: ReadonlyMap<string, Classification>,
  byLabel: ReadonlyMap<string, readonly { qid: string; category: Category | null; wikipedia: string }[]>,
): { matched: Matched[]; suggested: Matched[]; unmatched: Unmatched[] } {
  const matched: Matched[] = [];
  const suggested: Matched[] = [];
  const unmatched: Unmatched[] = [];
  for (const c of candidates) {
    const titles = [c.input, capitalized(c.input)];
    const title = titles.map((t) => byTitle.get(t)).find((r) => r?.qid && r.category === c.category);
    if (title?.qid) {
      matched.push({ id: c.id, input: c.input, qid: title.qid });
      continue;
    }
    const items = byLabel.get(c.input) ?? [];
    const fitting = items.filter((i) => i.category === c.category);
    if (fitting.length === 1) {
      suggested.push({ id: c.id, input: c.input, qid: fitting[0]!.qid });
      continue;
    }
    const elsewhere = titles.map((t) => byTitle.get(t)).find((r) => r?.qid);
    const reason =
      fitting.length > 1
        ? `${fitting.length} items in ${c.category} share its label (${fitting.map((i) => i.qid).join(', ')})`
        : elsewhere?.qid
          ? `its Wikipedia title is ${elsewhere.qid}, which is not in ${c.category}`
          : items.length > 0
            ? `no item with its label is in ${c.category}`
            : 'no item has its title or label';
    unmatched.push({ id: c.id, input: c.input, reason });
  }
  return { matched, suggested, unmatched };
}

function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type ReclassifyReport = {
  moved: Candidate[];
  matched: Matched[];
  /** Label matches, with the sentence Wikidata would give; written only once a person names the item. */
  suggested: (Matched & { about: string | null; wikipedia: string | null })[];
  unmatched: Unmatched[];
  /** Candidates that gained a sentence or a link, as they now read. */
  described: Candidate[];
  /** Placed candidates with an item that Wikidata gave no sentence for. */
  undescribed: Candidate[];
  hitsSynced: number;
};

export async function runReclassify(options: { fetch: typeof fetch; dryRun?: boolean }): Promise<ReclassifyReport> {
  const deps = { fetch: options.fetch, userAgent: USER_AGENT };
  const cv = await candidateSchema();
  const hv = await hitSchema();
  let all = await readJsonl(CANDIDATES_PATH, cv);

  const unplaced = all.filter((c) => c.status === 'unclassified');
  let moved: Candidate[] = [];
  if (unplaced.length > 0) {
    const classified = await classifyTitles(unplaced.map(titleOf), deps);
    ({ candidates: all, moved } = reclassify(all, new Map(classified.map((c) => [c.title, c]))));
  }

  const manual = all.filter(lookupable);
  const texts = [...new Set(manual.flatMap((c) => [c.input, capitalized(c.input)]))];
  const byTitle = new Map((await classifyTitles(texts, deps)).map((c) => [c.title, c]));
  const unmatchedByTitle = manual.filter((c) => ![c.input, capitalized(c.input)].some((t) => byTitle.get(t)?.qid && byTitle.get(t)?.category === c.category));
  const byLabel = unmatchedByTitle.length > 0 ? await lookupLabels(unmatchedByTitle.map((c) => c.input), deps) : new Map();
  const { matched, suggested, unmatched } = matchItems(manual, byTitle, byLabel);
  const qidOf = new Map(matched.map((m) => [m.id, m.qid]));
  all = all.map((c) => (qidOf.has(c.id) ? { ...c, wikidata_qid: qidOf.get(c.id)! } : c));

  const wanting = all.filter((c) => describable(c) && (!c.about || !c.wikipedia));
  const asked = [...wanting.map((c) => c.wikidata_qid!), ...suggested.map((s) => s.qid)];
  const items = asked.length > 0 ? await describeItems(asked, deps) : new Map<string, WikidataItem>();
  const described: Candidate[] = [];
  const undescribed: Candidate[] = [];
  all = all.map((c) => {
    if (!describable(c) || (c.about && c.wikipedia)) return c;
    const next = withWikidata(c, items.get(c.wikidata_qid!));
    if (next.about !== c.about || next.wikipedia !== c.wikipedia) described.push(next);
    if (!next.about) undescribed.push(next);
    return next;
  });

  const hits = await readJsonl(HITS_PATH, hv);
  const synced = syncAbout(hits, all);
  if (!options.dryRun) {
    for (const c of all) {
      const id = c.id;
      if (!cv(c)) throw new Error(`refusing to write ${id}: ${explain(cv)}`);
    }
    for (const h of synced.hits) {
      const id = h.id;
      if (!hv(h)) throw new Error(`refusing to write ${id}: ${explain(hv)}`);
    }
    if (moved.length + matched.length + described.length > 0) await writeJsonl(CANDIDATES_PATH, all, cv);
    if (synced.changed.length > 0) await writeJsonl(HITS_PATH, synced.hits, hv);
  }
  return {
    moved,
    matched,
    suggested: suggested.map((s) => {
      const item = items.get(s.qid);
      return { ...s, about: sentenceFromWikidata(s.input, item?.description, item?.ended ?? false), wikipedia: item?.wikipedia ?? null };
    }),
    unmatched,
    described,
    undescribed,
    hitsSynced: synced.changed.length,
  };
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

  // Only candidates Wikidata placed are described: an item the table excludes, such as an event, is not an input.
  // Ones already on file are described too, and then not appended, which costs nothing but part of one query.
  const placed = toCandidates(kept, byTitle, haiku, options.date);
  const wanting = placed.filter(describable);
  const items = wanting.length > 0 ? await describeItems(wanting.map((c) => c.wikidata_qid!), deps) : new Map<string, WikidataItem>();
  const candidates = placed.map((c) => (describable(c) ? withWikidata(c, items.get(c.wikidata_qid!)) : c));
  // A title on file under the id it had before phase N (its number left out) is the same candidate, not a new one.
  const validator = await candidateSchema();
  const onFile = new Set((await readJsonl(CANDIDATES_PATH, validator)).map((c) => c.id));
  const fresh = candidates.filter((c) => !onFile.has(legacyId(c)));
  const added = options.dryRun ? [] : await appendJsonl(CANDIDATES_PATH, fresh, validator);

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
    const dryRun = has(argv, 'dry-run');
    const r = await runReclassify({ fetch, dryRun });
    console.log(`${r.moved.length} unclassified candidates now have a category`);
    for (const c of r.moved) console.log(`  ${c.input.padEnd(40)} ${c.category}`);
    console.log(`${r.matched.length} manual candidates matched to a Wikidata item by their Wikipedia title`);
    for (const m of r.matched) console.log(`  ${m.input.padEnd(40)} ${m.qid}`);
    if (r.suggested.length) {
      console.log(`${r.suggested.length} more have one item in their category by label, not written: name it with pnpm hits:describe <id> --wikidata=Q… if it is right`);
      for (const s of r.suggested) console.log(`  ${s.id.padEnd(40)} ${s.qid.padEnd(12)} would read: ${s.about ?? '(no sentence)'}  ${s.wikipedia ?? ''}`);
    }
    console.log(`${r.unmatched.length} left unmatched`);
    for (const u of r.unmatched) console.log(`  ${u.input.padEnd(40)} ${u.reason}`);
    console.log(`${r.described.length} candidates described from Wikidata`);
    for (const c of r.described) console.log(`  ${c.id.padEnd(40)} ${c.about ?? '(no sentence)'}${c.wikipedia ? `  ${c.wikipedia}` : ''}`);
    if (r.undescribed.length) {
      console.log(`${r.undescribed.length} candidates with an item still have no sentence: Wikidata gave no usable English description`);
      for (const c of r.undescribed) console.log(`  ${c.id.padEnd(40)} ${c.wikidata_qid}`);
    }
    console.log(`${r.hitsSynced} hits took their input's sentence or link${dryRun ? ' · dry run: nothing written' : ''}`);
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
