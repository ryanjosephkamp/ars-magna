/**
 * Writes the facts file the build reads, from an English OpenList
 * `merged_valid_dict.json`.
 *
 *   pnpm --filter @ars-magna/dict-build run facts:extract <merged_valid_dict.json> <out.tsv>
 *
 * The build needs two facts about each spelling in the list: whether the
 * dataset generated it by rule, and whether any source vouches for it. The
 * dictionary file holds far more than that, 290 MB of it, and its records name
 * the intake that wrote each word, which some intakes do not allow publishing.
 * The facts file keeps only the two facts, and only for the exceptions: one
 * line per spelling, a tab, then `generated` or `unattested`. A spelling of the
 * word list that is not in the file is vouched for by a source.
 *
 * The dictionary file is one enormous top-level object keyed by spelling, so
 * it is streamed rather than parsed.
 */
import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { chain } from 'stream-chain';
import StreamObject from 'stream-json/streamers/StreamObject.js';

import type { SpellingFact } from './facts.ts';

type RawRecord = {
  source?: unknown;
  candidate_source?: unknown;
  generation_method?: unknown;
};

/** What one record says about its spelling; `null` when a source vouches for it. */
export function factOf(value: unknown): SpellingFact | null {
  const record = (value ?? {}) as RawRecord;
  if (record.generation_method !== undefined) return 'generated';
  // A record written by an intake or a dictionary lookup names it in `source`.
  // Otherwise the discovery log vouches for the word when one of its entries
  // is suffixed `_valid`; `_unlikely` entries do not.
  if (typeof record.source === 'string') return null;
  const log = record.candidate_source;
  if (Array.isArray(log) && log.some((entry) => typeof entry === 'string' && entry.endsWith('_valid'))) {
    return null;
  }
  return 'unattested';
}

async function main(): Promise<void> {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.error('usage: facts-extract <merged_valid_dict.json> <out.tsv>');
    process.exit(2);
  }

  const lines: string[] = [];
  let records = 0;
  const pipeline = chain([createReadStream(input), StreamObject.withParser()]);
  for await (const { key, value } of pipeline as AsyncIterable<{ key: string; value: unknown }>) {
    records++;
    const fact = factOf(value);
    if (fact !== null) lines.push(`${key}\t${fact}`);
  }

  lines.sort();
  await writeFile(output, `${lines.join('\n')}\n`);
  const count = (fact: SpellingFact) => lines.filter((line) => line.endsWith(`\t${fact}`)).length;
  console.log(
    `${records.toLocaleString()} records · ${count('generated').toLocaleString()} generated · ` +
      `${count('unattested').toLocaleString()} unattested → ${output}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
