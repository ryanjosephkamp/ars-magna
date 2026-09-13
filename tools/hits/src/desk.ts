/**
 * `pnpm hits:desk [--queues=3] [--out=FILE]`
 *
 * Build the review desk: one self-contained page from data/hits.jsonl,
 * data/candidates.jsonl and the newest judged queues, written to
 * .cache/desk/index.html. Open it in a browser, or have a Claude Code session
 * publish it as a private artifact to use on a phone.
 *
 * The page never writes to the repository. Every decision made in it becomes
 * a command, and the page fills docs/prompts/apply-desk.md with those
 * commands for an agent to run on a branch; the pull request stays the
 * record of what the operator approved.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { deskData, renderDesk, type QueueInput } from './desk/build.ts';
import { parseVerdicts } from './judge.ts';
import { JUDGE_OUTPUT, flag, queueDates, queueDir, readJudgedRows } from './queue.ts';
import { CANDIDATES_PATH, HITS_PATH, REPO_ROOT, candidateSchema, hitSchema, readJsonl, today } from './schema.ts';
import { PRESETS } from './settings.ts';
import { tagPattern } from './tag.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const DESK_TEMPLATE = resolve(here, '../templates/desk.html');
export const COMPOSE_SOURCE = resolve(here, 'desk/compose.ts');
export const APPLY_DESK_PROMPT = resolve(REPO_ROOT, 'docs/prompts/apply-desk.md');
export const DEEP_RUN_PROMPT = resolve(REPO_ROOT, 'docs/prompts/deep-run.md');
export const DESK_OUT = resolve(REPO_ROOT, '.cache/desk/index.html');

/** The newest `count` queues that have verdicts, newest first. */
export async function judgedQueues(count: number): Promise<QueueInput[]> {
  const out: QueueInput[] = [];
  for (const name of (await queueDates()).reverse()) {
    if (out.length >= count) break;
    const dir = queueDir(name);
    if (!existsSync(resolve(dir, JUDGE_OUTPUT))) continue;
    const verdicts = parseVerdicts(await readFile(resolve(dir, JUDGE_OUTPUT), 'utf8'));
    if (verdicts.length === 0) continue;
    out.push({ name, rows: await readJudgedRows(dir), verdicts });
  }
  return out;
}

export async function buildDesk(options: { queues: number; out: string; generated?: string }): Promise<{ html: string; data: ReturnType<typeof deskData> }> {
  const hits = await readJsonl(HITS_PATH, await hitSchema());
  const candidates = await readJsonl(CANDIDATES_PATH, await candidateSchema());
  const data = deskData({
    hits,
    candidates,
    queues: await judgedQueues(options.queues),
    generated: options.generated ?? new Date().toISOString(),
    today: today(),
    tagPattern: (await tagPattern()).source,
    applyDesk: await readFile(APPLY_DESK_PROMPT, 'utf8'),
    deepRun: await readFile(DEEP_RUN_PROMPT, 'utf8'),
    deepPerInput: PRESETS.deep.perInput,
  });
  const html = renderDesk(await readFile(DESK_TEMPLATE, 'utf8'), data, await readFile(COMPOSE_SOURCE, 'utf8'));
  await mkdir(dirname(options.out), { recursive: true });
  await writeFile(options.out, html);
  return { html, data };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const queues = Number(flag(argv, 'queues') ?? 3);
  if (!Number.isInteger(queues) || queues < 1) throw new Error('--queues must be a positive whole number');
  const outFlag = flag(argv, 'out');
  const out = outFlag ? resolve(process.env['INIT_CWD'] ?? process.cwd(), outFlag) : DESK_OUT;
  const { html, data } = await buildDesk({ queues, out });
  const near = data.queues.reduce((n, q) => n + q.rows.filter((r) => !r.hit).length, 0);
  console.log(
    `wrote ${relative(process.env['INIT_CWD'] ?? process.cwd(), out)} (${Math.round(Buffer.byteLength(html) / 1024)} KB): ` +
      `${data.hits.length} hits, ${data.candidates.length} candidates, ` +
      `${data.queues.length} queues (${data.queues.map((q) => q.name).join(', ') || 'none'}), ${near} near misses`,
  );
  console.log('Open it in a browser. It writes nothing to the repository; Copy prompt gives an agent the commands.');
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  try {
    await main();
  } catch (error) {
    console.error(`hits:desk: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
