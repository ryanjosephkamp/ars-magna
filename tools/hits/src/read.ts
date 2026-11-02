/**
 * `pnpm hits:read id 4:drop`
 * `pnpm hits:read id --clear`
 *
 * Set how a hit's or a candidate's numbers and symbols are read (roadmap
 * phase N): `4:drop` leaves the 4 of "Reacher season 4" out, `2:too` reads
 * the 2 of "2 Fast 2 Furious" as *too*, `182:digits` reads 182 digit by
 * digit. The record stores the reading of every item, defaults filled in.
 *
 * A reading that changes the letters would change the id, and so the hit's
 * page address and its votes, so it is refused: a record with its own letters
 * is another record, added the usual way. What this command is for is saying
 * how a record already reads: the two hits from before phase N, whose numbers
 * were dropped, get `4:drop` and `2:drop` so the letters they were made with
 * are written down, and so are their candidates. `--clear` removes the field,
 * which for a record from before phase N means "read as before", every item
 * dropped; it too is refused where the id would change.
 *
 * An unknown id, a reading the input does not offer, or one that changes the
 * id writes nothing. The file is rewritten through its schema in its existing
 * order, so the diff is the one line.
 */
import { parseReading, readingProblem, type Reading } from '@ars-magna/engine/readings';

import { candidateId, recordReading, type Category } from './ids.ts';
import { CANDIDATES_PATH, HITS_PATH, candidateSchema, hitSchema, readJsonl, writeJsonl, type Candidate, type Hit } from './schema.ts';

export type ReadArgs = { id: string; reading: Reading | null };

export function parseReadArgs(argv: readonly string[]): ReadArgs {
  const stray = argv.find((a) => a.startsWith('--') && a !== '--clear');
  if (stray) throw new Error(`unknown option ${stray}`);
  const clear = argv.includes('--clear');
  const [id, ...rest] = argv.filter((a) => a !== '--clear');
  if (!id) throw new Error('name a hit or candidate id, then the reading (4:drop, 2:too, 182:digits), or --clear');
  const text = rest.join(',').trim();
  if (clear) {
    if (text.length > 0) throw new Error('--clear removes the reading; give a reading or --clear, not both');
    return { id, reading: null };
  }
  if (text.length === 0) throw new Error(`give ${id} a reading (4:drop, 2:too, 182:digits), or --clear`);
  const reading = parseReading(text);
  if (!reading) throw new Error(`a reading is written item:name, comma-separated, not ${JSON.stringify(text)}`);
  return { id, reading };
}

/** The candidate part of a hit id, or the id itself for a candidate. */
function candidateOf(id: string): string {
  return id.split(':').slice(0, 2).join(':');
}

export type ReadResult<T> = { records: T[]; from: string | null; to: string | null; changed: boolean };

/**
 * Pure: the records with the reading set on the one with `id`, or cleared.
 * Throws on an unknown id, a reading the input does not offer, or one that
 * would change the id.
 */
export function setReading<T extends { id: string; input: string; category: Category; reading?: Record<string, string> }>(
  records: readonly T[],
  id: string,
  reading: Reading | null,
): ReadResult<T> {
  const record = records.find((r) => r.id === id);
  if (!record) throw new Error(`no such record: ${id}`);
  if (reading) {
    const problem = readingProblem(record.input, reading);
    if (problem) throw new Error(`${problem}`);
  }
  const next = reading ? recordReading(record.input, reading) : undefined;
  const expected = candidateOf(record.id);
  const under = candidateId(record.input, record.category, next ?? null);
  if (under !== expected) {
    throw new Error(
      `read that way, "${record.input}" has the letters of ${under}, not ${expected}; a reading that changes the letters changes the id, so add the input again instead`,
    );
  }
  const show = (r: Record<string, string> | undefined) => (r ? Object.entries(r).map(([k, v]) => `${k}:${v}`).join(',') : null);
  const from = show(record.reading);
  const to = show(next);
  if (from === to) return { records: [...records], from, to, changed: false };
  const changed = { ...record };
  if (next) changed.reading = next;
  else delete changed.reading;
  return { records: records.map((r) => (r.id === id ? changed : r)), from, to, changed: true };
}

/** Read the file the id belongs to, set the reading, and rewrite it only if it changed. */
export async function applyReading(id: string, reading: Reading | null): Promise<ReadResult<Hit | Candidate> & { file: string }> {
  if (id.split(':').length >= 3) {
    const validator = await hitSchema();
    const result = setReading(await readJsonl(HITS_PATH, validator), id, reading);
    if (result.changed) await writeJsonl(HITS_PATH, result.records, validator);
    return { ...result, file: 'data/hits.jsonl' };
  }
  const validator = await candidateSchema();
  const result = setReading(await readJsonl(CANDIDATES_PATH, validator), id, reading);
  if (result.changed) await writeJsonl(CANDIDATES_PATH, result.records, validator);
  return { ...result, file: 'data/candidates.jsonl' };
}

async function main(): Promise<void> {
  const { id, reading } = parseReadArgs(process.argv.slice(2));
  const { from, to, changed, file } = await applyReading(id, reading);
  const say = (r: string | null) => r ?? '(none: read as before phase N, every number and symbol dropped)';
  if (!changed) {
    console.log(`${id}  already reads ${say(from)} · ${file} left as it was`);
    return;
  }
  console.log(`${id}\n  was: ${say(from)}\n  now: ${say(to)}\n${file} rewritten`);
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:read: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
