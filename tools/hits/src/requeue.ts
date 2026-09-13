/**
 * `pnpm hits:requeue [--settings-before=s2] [--rubric-before=v2] [--category=…] [--source=…] [--dry-run] [id…]`
 *
 * Send processed candidates back to `new`, so the next enumeration runs them
 * again. A candidate is `enumerated` once a queue has been through it, and
 * its `runs` record the settings and rubric it went through. When either
 * moves on, this reopens the candidates processed under older versions.
 *
 * Every selector given must match. An id named on the command line that is
 * not an enumerated candidate is refused, and then nothing is written;
 * unclassified candidates have no category and cannot run. Nothing about a
 * candidate changes except its status and a dated note.
 */
import { flag, has } from './queue.ts';
import { isCategory, type Category } from './ids.ts';
import {
  CANDIDATES_PATH,
  candidateSchema,
  readJsonl,
  today,
  writeJsonl,
  type Candidate,
  type CandidateSource,
} from './schema.ts';
import { lastRun, versionNumber } from './settings.ts';

const SOURCES: readonly CandidateSource[] = ['manual', 'trending', 'submission'];
const OPTIONS = ['settings-before', 'rubric-before', 'category', 'source'];

export type RequeueFilter = {
  settingsBefore?: number;
  rubricBefore?: number;
  category?: Category;
  source?: CandidateSource;
  ids: string[];
};
export type Refusal = { id: string; reason: string };

function parseVersion(value: string, prefix: 's' | 'v', name: string): number {
  if (!new RegExp(`^${prefix}[0-9]+$`).test(value)) throw new Error(`--${name} must look like ${prefix}2, not "${value}"`);
  return versionNumber(value);
}

/** The filter from the command line. Throws on anything unknown, and when nothing is named. */
export function parseRequeueArgs(argv: readonly string[]): { filter: RequeueFilter; dryRun: boolean } {
  const stray = argv.find((a) => a.startsWith('--') && a !== '--dry-run' && !OPTIONS.some((o) => a.startsWith(`--${o}=`)));
  if (stray) throw new Error(`unknown option ${stray}`);
  const filter: RequeueFilter = { ids: [...new Set(argv.filter((a) => !a.startsWith('--')))] };
  const settings = flag(argv, 'settings-before');
  if (settings !== undefined) filter.settingsBefore = parseVersion(settings, 's', 'settings-before');
  const rubric = flag(argv, 'rubric-before');
  if (rubric !== undefined) filter.rubricBefore = parseVersion(rubric, 'v', 'rubric-before');
  const category = flag(argv, 'category');
  if (category !== undefined) {
    if (!isCategory(category)) throw new Error(`unknown category "${category}"`);
    filter.category = category;
  }
  const source = flag(argv, 'source');
  if (source !== undefined) {
    if (!(SOURCES as readonly string[]).includes(source)) throw new Error(`unknown source "${source}": use ${SOURCES.join(', ')}`);
    filter.source = source as CandidateSource;
  }
  const named = filter.settingsBefore !== undefined || filter.rubricBefore !== undefined || filter.category || filter.source || filter.ids.length > 0;
  if (!named) throw new Error('name what to requeue: --settings-before, --rubric-before, --category, --source, or ids');
  return { filter, dryRun: has(argv, 'dry-run') };
}

/** Pure: the candidates with the matching ones sent back to `new`, what moved, and any named id that cannot. */
export function requeue(
  candidates: readonly Candidate[],
  filter: RequeueFilter,
  date: string,
): { candidates: Candidate[]; moved: Candidate[]; refused: Refusal[] } {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const refused: Refusal[] = [];
  for (const id of filter.ids) {
    const c = byId.get(id);
    if (!c) refused.push({ id, reason: 'no such candidate' });
    else if (c.status === 'unclassified') refused.push({ id, reason: 'unclassified, so it has no category to run under' });
    else if (c.status !== 'enumerated') refused.push({ id, reason: `it is ${c.status}, not enumerated` });
  }

  const wanted = new Set(filter.ids);
  const moved: Candidate[] = [];
  const next = candidates.map((c) => {
    if (c.status !== 'enumerated') return c;
    if (wanted.size > 0 && !wanted.has(c.id)) return c;
    if (filter.category && c.category !== filter.category) return c;
    if (filter.source && c.source !== filter.source) return c;
    const run = lastRun(c);
    if (filter.settingsBefore !== undefined && versionNumber(run.settings) >= filter.settingsBefore) return c;
    if (filter.rubricBefore !== undefined && versionNumber(run.rubric) >= filter.rubricBefore) return c;
    const note = `requeued ${date}`;
    const updated: Candidate = { ...c, status: 'new', notes: c.notes ? `${c.notes}; ${note}` : note };
    moved.push(updated);
    return updated;
  });
  return { candidates: next, moved, refused };
}

/** Read the file, requeue, and rewrite it unless this is a dry run or nothing moved. Throws on a refusal, writing nothing. */
export async function applyRequeue(path: string, filter: RequeueFilter, date: string, dryRun: boolean) {
  const validator = await candidateSchema();
  const result = requeue(await readJsonl(path, validator), filter, date);
  if (result.refused.length > 0) {
    throw new Error(result.refused.map((r) => `${r.id}: ${r.reason}`).join('; '));
  }
  if (!dryRun && result.moved.length > 0) await writeJsonl(path, result.candidates, validator);
  return result;
}

async function main(): Promise<void> {
  const { filter, dryRun } = parseRequeueArgs(process.argv.slice(2));
  const { moved } = await applyRequeue(CANDIDATES_PATH, filter, today(), dryRun);
  const width = Math.max(0, ...moved.map((c) => c.id.length));
  for (const c of moved) {
    const run = c.runs?.at(-1);
    const last = run ? `${run.queue}, ${run.settings} ${run.rubric}` : 'before runs were recorded, s1 v1';
    console.log(`${c.id.padEnd(width)}  enumerated -> new  (last run ${last})`);
  }
  if (moved.length === 0) console.log('nothing matched · data/candidates.jsonl left as it was');
  else if (dryRun) console.log(`${moved.length} would move to new · dry run, nothing written`);
  else console.log(`${moved.length} moved to new · data/candidates.jsonl rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:requeue: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
