/**
 * `pnpm hits:describe <candidate-id> "One factual sentence about what the input is."`
 * `pnpm hits:describe <candidate-id> --wikidata=Q123`
 * `pnpm hits:describe <candidate-id> [sentence] --wikipedia=<url>|none`
 *
 * Set what an input is: the candidate's `about`, and with `--wikipedia` its
 * link, then the copies on every hit of that input, whatever their status.
 * `--wikidata` names the Wikidata item instead: it records the QID and writes
 * the sentence from the item's English description and the link from its
 * English Wikipedia article, or no link when it has none.
 *
 * An input whose hits have no candidate line (the classics seeded before
 * candidates existed) gets a `manual` candidate, appended. An unknown id, a
 * hit id, a sentence over 200 characters or not ending with a full stop, and
 * an address that is not an English Wikipedia article write nothing. Both
 * files are rewritten through the schema in their existing order, so the diff
 * is the candidate line and that input's hit lines.
 */
import { aboutProblem, candidateOf, sentenceFromWikidata, syncAbout, tidySentence, wikipediaProblem } from './about.ts';
import { describeItems, type WikidataItem } from './classify/wikidata.ts';
import { flag } from './queue.ts';
import { CANDIDATES_PATH, HITS_PATH, candidateSchema, explain, hitSchema, readJsonl, today, writeJsonl, type Candidate, type Hit } from './schema.ts';
import { USER_AGENT } from './sources/source.ts';

export type DescribeArgs = {
  id: string;
  /** The sentence, tidied; null with `--wikidata` or when only the link changes. */
  text: string | null;
  wikidata: string | null;
  /** An address, `none` to clear the link, or null to leave it. */
  wikipedia: string | null;
};

export function parseDescribeArgs(argv: readonly string[]): DescribeArgs {
  const stray = argv.find((a) => a.startsWith('--') && !/^--(wikidata|wikipedia)=/.test(a));
  if (stray) throw new Error(`unknown option ${stray}`);
  const wikidata = flag(argv, 'wikidata') ?? null;
  const wikipedia = flag(argv, 'wikipedia') ?? null;
  const [id, ...rest] = argv.filter((a) => !a.startsWith('--'));
  if (!id) throw new Error('name a candidate id, then one sentence in quotes, --wikidata=Q… or --wikipedia=…');
  if (id.split(':').length !== 2) {
    throw new Error(`${id} is not a candidate id; name the input's candidate, ${candidateOf(id)}, since every hit of an input shares its sentence`);
  }
  const text = rest.length > 0 ? tidySentence(rest.join(' ')) : null;
  if (text !== null && wikidata !== null) throw new Error('--wikidata writes the sentence from Wikidata; give the sentence or --wikidata, not both');
  if (text === null && wikidata === null && wikipedia === null) {
    throw new Error(`give ${id} one factual sentence in quotes, --wikidata=Q… or --wikipedia=…`);
  }
  if (text !== null) {
    const problem = aboutProblem(text);
    if (problem) throw new Error(problem);
  }
  if (wikidata !== null && !/^Q[0-9]+$/.test(wikidata)) throw new Error(`--wikidata takes an item id such as Q42, not ${wikidata}`);
  if (wikipedia !== null && wikipedia !== 'none') {
    const problem = wikipediaProblem(wikipedia);
    if (problem) throw new Error(problem);
  }
  return { id, text, wikidata, wikipedia };
}

/** What to set on the candidate. `wikipedia: null` clears the link; an absent key leaves it. */
export type AboutChange = { about?: string; wikipedia?: string | null; wikidata_qid?: string };

export type DescribeResult = {
  candidates: Candidate[];
  hits: Hit[];
  /** The candidate line was appended, for an input whose hits had none. */
  created: boolean;
  from: { about: string | null; wikipedia: string | null };
  to: { about: string | null; wikipedia: string | null };
  /** Hits whose copy changed. */
  synced: string[];
  changed: boolean;
};

/** The input's text and category, from its candidate or, when it has none, from its hits. Throws when neither exists. */
export function inputOf(candidates: readonly Candidate[], hits: readonly Hit[], id: string): { input: string; category: Candidate['category'] } {
  const candidate = candidates.find((c) => c.id === id);
  if (candidate) return { input: candidate.input, category: candidate.category };
  const hit = hits.find((h) => candidateOf(h.id) === id);
  if (hit) return { input: hit.input, category: hit.category };
  throw new Error(`no such candidate: ${id}`);
}

/** Pure: both lists with the change made and the copies synced. Throws on an input that has neither a candidate nor a hit. */
export function setAbout(
  candidates: readonly Candidate[],
  hits: readonly Hit[],
  id: string,
  change: AboutChange,
  date: string,
): DescribeResult {
  const existing = candidates.find((c) => c.id === id);
  const { input, category } = inputOf(candidates, hits, id);
  const base: Candidate = existing ?? { id, input, category, source: 'manual', first_seen: date, status: 'enumerated' };
  const next: Candidate = { ...base };
  if (change.wikidata_qid !== undefined) next.wikidata_qid = change.wikidata_qid;
  if (change.about !== undefined) next.about = change.about;
  if (change.wikipedia === null) delete next.wikipedia;
  else if (change.wikipedia !== undefined) next.wikipedia = change.wikipedia;

  const candidateChanged =
    !existing || existing.about !== next.about || existing.wikipedia !== next.wikipedia || existing.wikidata_qid !== next.wikidata_qid;
  const nextCandidates = existing ? candidates.map((c) => (c.id === id ? next : c)) : [...candidates, next];
  const { hits: nextHits, changed: synced } = syncAbout(hits, nextCandidates, [id]);
  return {
    candidates: candidateChanged ? nextCandidates : [...candidates],
    hits: nextHits,
    created: !existing,
    from: { about: existing?.about ?? null, wikipedia: existing?.wikipedia ?? null },
    to: { about: next.about ?? null, wikipedia: next.wikipedia ?? null },
    synced,
    changed: candidateChanged || synced.length > 0,
  };
}

/** The change `--wikidata` makes, from what Wikidata says about the item. Throws when it has no usable English description. */
export function changeFromWikidata(input: string, item: WikidataItem): AboutChange {
  const about = sentenceFromWikidata(input, item.description, item.ended);
  if (!about) {
    throw new Error(`Wikidata has no English description of ${item.qid} that makes a sentence; write the sentence yourself`);
  }
  return { wikidata_qid: item.qid, about, wikipedia: item.wikipedia };
}

/** Read both files, make the change, and rewrite them only if something changed. Both are validated before either is written. */
export async function applyAbout(
  paths: { candidates: string; hits: string },
  id: string,
  change: AboutChange,
  date: string,
): Promise<DescribeResult> {
  const cv = await candidateSchema();
  const hv = await hitSchema();
  const result = setAbout(await readJsonl(paths.candidates, cv), await readJsonl(paths.hits, hv), id, change, date);
  if (!result.changed) return result;
  for (const c of result.candidates) {
    const id = c.id;
    if (!cv(c)) throw new Error(`refusing to write ${id}: ${explain(cv)}`);
  }
  for (const h of result.hits) {
    const id = h.id;
    if (!hv(h)) throw new Error(`refusing to write ${id}: ${explain(hv)}`);
  }
  await writeJsonl(paths.candidates, result.candidates, cv);
  await writeJsonl(paths.hits, result.hits, hv);
  return result;
}

/** The change the arguments ask for, asking Wikidata when they name an item. */
export async function changeFor(args: DescribeArgs, input: string, fetchImpl: typeof fetch): Promise<AboutChange> {
  const change: AboutChange = {};
  if (args.wikidata) {
    const item = (await describeItems([args.wikidata], { fetch: fetchImpl, userAgent: USER_AGENT })).get(args.wikidata)!;
    Object.assign(change, changeFromWikidata(input, item));
  }
  if (args.text !== null) change.about = args.text;
  if (args.wikipedia !== null) change.wikipedia = args.wikipedia === 'none' ? null : args.wikipedia;
  return change;
}

async function main(): Promise<void> {
  const args = parseDescribeArgs(process.argv.slice(2));
  const cv = await candidateSchema();
  const hv = await hitSchema();
  const { input } = inputOf(await readJsonl(CANDIDATES_PATH, cv), await readJsonl(HITS_PATH, hv), args.id);
  const change = await changeFor(args, input, fetch);
  const result = await applyAbout({ candidates: CANDIDATES_PATH, hits: HITS_PATH }, args.id, change, today());
  if (!result.changed) {
    console.log(`${args.id}  already reads that way · data/candidates.jsonl and data/hits.jsonl left as they were`);
    return;
  }
  const lines = [
    args.id,
    ...(result.created ? ['  no candidate line: appended one, as manual and enumerated'] : []),
    ...(change.wikidata_qid ? [`  wikidata: ${change.wikidata_qid}`] : []),
    `  about was: ${result.from.about ?? '(none)'}`,
    `  about now: ${result.to.about ?? '(none)'}`,
    ...(result.from.wikipedia !== result.to.wikipedia ? [`  wikipedia was: ${result.from.wikipedia ?? '(none)'}`, `  wikipedia now: ${result.to.wikipedia ?? '(none)'}`] : []),
    `  copied to ${result.synced.length} ${result.synced.length === 1 ? 'hit' : 'hits'}${result.synced.length ? `: ${result.synced.join(', ')}` : ''}`,
    'data/candidates.jsonl and data/hits.jsonl rewritten',
  ];
  console.log(lines.join('\n'));
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:describe: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
