/**
 * `pnpm hits:set --status=accepted|featured|proposed|retired id…`
 *
 * The step a person takes on the dataset: change the status of hits by id.
 * Every id must already be in data/hits.jsonl and the status must be one the
 * schema allows, or nothing is written. The file is rewritten through the
 * schema in its existing order, so the diff is exactly the lines that changed.
 */
import { flag } from './queue.ts';
import {
  HITS_PATH,
  HIT_STATUSES,
  hitSchema,
  readJsonl,
  writeJsonl,
  type Hit,
  type HitStatus,
} from './schema.ts';

export type StatusChange = { id: string; from: HitStatus; to: HitStatus };
export type SetResult = { hits: Hit[]; changed: StatusChange[]; unchanged: string[] };

export function isHitStatus(value: string): value is HitStatus {
  return (HIT_STATUSES as readonly string[]).includes(value);
}

/** The status and the ids from the command line. Throws on anything missing or unknown. */
export function parseSetArgs(argv: readonly string[]): { status: HitStatus; ids: string[] } {
  const status = flag(argv, 'status');
  if (status === undefined) throw new Error(`--status is required: one of ${HIT_STATUSES.join(', ')}`);
  if (!isHitStatus(status)) throw new Error(`unknown status "${status}": use one of ${HIT_STATUSES.join(', ')}`);
  const stray = argv.find((a) => a.startsWith('--') && !a.startsWith('--status='));
  if (stray) throw new Error(`unknown option ${stray}`);
  const ids = [...new Set(argv.filter((a) => !a.startsWith('--')))];
  if (ids.length === 0) throw new Error('name at least one hit id, e.g. dormitory:phrases:dirty-room');
  return { status, ids };
}

/** Pure: the hits with the status applied, and what that changed. Throws naming every id that is not a hit. */
export function setStatus(hits: readonly Hit[], ids: readonly string[], status: HitStatus): SetResult {
  const known = new Set(hits.map((h) => h.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length > 0) throw new Error(`no such hit: ${missing.join(', ')}`);

  const wanted = new Set(ids);
  const changed: StatusChange[] = [];
  const unchanged: string[] = [];
  const next = hits.map((h) => {
    if (!wanted.has(h.id)) return h;
    if (h.status === status) {
      unchanged.push(h.id);
      return h;
    }
    changed.push({ id: h.id, from: h.status, to: status });
    return { ...h, status };
  });
  return { hits: next, changed, unchanged };
}

/** Read the file, apply the status, and rewrite it only if something changed. */
export async function applyStatus(path: string, ids: readonly string[], status: HitStatus): Promise<SetResult> {
  const validator = await hitSchema();
  const result = setStatus(await readJsonl(path, validator), ids, status);
  if (result.changed.length > 0) await writeJsonl(path, result.hits, validator);
  return result;
}

async function main(): Promise<void> {
  const { status, ids } = parseSetArgs(process.argv.slice(2));
  const { changed, unchanged } = await applyStatus(HITS_PATH, ids, status);
  const width = Math.max(...ids.map((id) => id.length));
  for (const c of changed) console.log(`${c.id.padEnd(width)}  ${c.from} -> ${c.to}`);
  for (const id of unchanged) console.log(`${id.padEnd(width)}  already ${status}`);
  console.log(
    changed.length > 0
      ? `${changed.length} changed · ${unchanged.length} already ${status} · data/hits.jsonl rewritten`
      : `nothing changed · data/hits.jsonl left as it was`,
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:set: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
