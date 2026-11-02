/**
 * `pnpm vocab:request <word> --why="…" [--source=submission|anchor|judge]
 *  [--from=…] [--gloss="…"] [--trace=…] [--decline]`
 *
 * Put a word on the request list, or decline one already on it. The judge
 * writes its own requests through `hits:ingest`; this is for the two sources
 * no model is behind: a reader's submission refused because the vocabulary
 * has no such word, and a seeded anchor the engine could not find.
 *
 * It never adds a word to the vocabulary. `pnpm vocab:add` does that, and
 * only after the operator has accepted the request by name.
 */
import { REQUESTS_PATH, readRequests, writeRequests, type RequestSource, type WordRequest } from './requests.ts';
import { today } from './schema.ts';
import { readAdditionWords } from './settings.ts';

const SOURCES: readonly RequestSource[] = ['judge', 'submission', 'anchor'];

function flag(argv: readonly string[], name: string): string | undefined {
  return argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const word = (argv.find((a) => !a.startsWith('--')) ?? '').trim().toLowerCase();
  if (!/^[a-z]+$/.test(word)) {
    console.error('usage: pnpm vocab:request <word> --why="one line" [--source=] [--from=] [--gloss=] [--trace=] [--decline]');
    console.error('the word must be lowercase letters only, as it would be searched');
    process.exit(1);
  }

  const list = await readRequests();
  const existing = list.find((r) => r.word === word);

  if (argv.includes('--decline')) {
    if (!existing) {
      console.error(`"${word}" is not on the request list, so there is nothing to decline`);
      process.exit(1);
    }
    if (existing.status === 'declined') {
      console.log(`"${word}" was already declined; nothing changed`);
      return;
    }
    existing.status = 'declined';
    await writeRequests(list);
    console.log(`declined "${word}". It will not be proposed again.`);
    return;
  }

  if (existing) {
    console.error(`"${word}" is already on the request list, ${existing.status}, from ${existing.from}`);
    process.exit(1);
  }
  if ((await readAdditionWords()).some((w) => w === word)) {
    console.error(`"${word}" is already in data/vocabulary/additions.jsonl`);
    process.exit(1);
  }

  const source = (flag(argv, 'source') ?? 'submission') as RequestSource;
  if (!SOURCES.includes(source)) {
    console.error(`--source must be one of ${SOURCES.join(', ')}, not ${source}`);
    process.exit(1);
  }
  const why = flag(argv, 'why');
  if (!why) {
    console.error('--why is required: one line on why the word is being proposed');
    process.exit(1);
  }

  const request: WordRequest = {
    word,
    source,
    from: flag(argv, 'from') ?? 'by hand',
    why,
    ...(flag(argv, 'gloss') ? { gloss: flag(argv, 'gloss')! } : {}),
    ...(flag(argv, 'trace') ? { trace: flag(argv, 'trace')! } : {}),
    seen: today(),
    status: 'open',
  };
  await writeRequests([...list, request]);
  console.log(`requested "${word}" (${source}). ${REQUESTS_PATH}`);
  console.log('Nothing is in the vocabulary yet: accept it with pnpm vocab:add, or decline it with --decline.');
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  await main();
}
