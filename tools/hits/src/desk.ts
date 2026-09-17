/**
 * `pnpm hits:desk [--queues=3] [--out=FILE] [--artifact] [--audit]`
 *
 * Build the review desk: one self-contained page from data/hits.jsonl,
 * data/candidates.jsonl and the newest judged queues, written to
 * .cache/desk/index.html. Open it in a browser. To use it on a phone, build
 * with `--artifact`, which also writes .cache/desk/artifact.html (the same page
 * without the document tags an Artifact adds itself), and have a Claude Code
 * session publish that file as a private claude.ai Artifact.
 *
 * With `--audit` it builds the Greatest Hits audit instead, to
 * .cache/desk/audit.html (and audit-artifact.html): one page listing every
 * anagram the site's Discoveries page shows, each in its current section,
 * to move between Greatest Hits, Interesting and A stretch or off the page.
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

import { artifactFragment, deskData, renderDesk, type DeskMode, type QueueInput, type SenseRule } from './desk/build.ts';
import { firstGlosses } from './glosses.ts';
import { parseVerdicts } from './judge.ts';
import { JUDGE_OUTPUT, flag, queueDates, queueDir, readJudgedRows } from './queue.ts';
import { CANDIDATES_PATH, HITS_PATH, REPO_ROOT, SCHEMA_DIR, candidateSchema, hitSchema, readJsonl, today } from './schema.ts';
import { PRESETS } from './settings.ts';
import { tagPattern } from './tag.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const DESK_TEMPLATE = resolve(here, '../templates/desk.html');
export const COMPOSE_SOURCE = resolve(here, 'desk/compose.ts');
export const APPLY_DESK_PROMPT = resolve(REPO_ROOT, 'docs/prompts/apply-desk.md');
export const DEEP_RUN_PROMPT = resolve(REPO_ROOT, 'docs/prompts/deep-run.md');
export const DESK_OUT = resolve(REPO_ROOT, '.cache/desk/index.html');
export const DESK_ARTIFACT_OUT = resolve(REPO_ROOT, '.cache/desk/artifact.html');
export const AUDIT_OUT = resolve(REPO_ROOT, '.cache/desk/audit.html');
export const AUDIT_ARTIFACT_OUT = resolve(REPO_ROOT, '.cache/desk/audit-artifact.html');

/** The pattern for what an input is, read from the hit schema so the page checks a sentence the way the schema will. */
export async function aboutPattern(): Promise<string> {
  const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'hit.schema.json'), 'utf8')) as {
    properties: { about: { pattern: string } };
  };
  return schema.properties.about.pattern;
}

/** The rule for a sense, read from the hit schema so the page checks a sentence the way the schema will. */
export async function senseRule(): Promise<SenseRule> {
  const schema = JSON.parse(await readFile(resolve(SCHEMA_DIR, 'hit.schema.json'), 'utf8')) as {
    properties: { senses: { additionalProperties: { pattern: string; maxLength: number } } };
  };
  const { pattern, maxLength } = schema.properties.senses.additionalProperties;
  return { pattern, max: maxLength };
}

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

export async function buildDesk(options: {
  queues: number;
  out: string;
  generated?: string;
  mode?: DeskMode;
}): Promise<{ html: string; data: ReturnType<typeof deskData> }> {
  const mode = options.mode ?? 'desk';
  const hits = await readJsonl(HITS_PATH, await hitSchema());
  // The audit shows only hits, so it carries no candidates and no queues.
  const candidates = mode === 'audit' ? [] : await readJsonl(CANDIDATES_PATH, await candidateSchema());
  const data = deskData({
    mode,
    hits,
    candidates,
    queues: mode === 'audit' ? [] : await judgedQueues(options.queues),
    generated: options.generated ?? new Date().toISOString(),
    today: today(),
    tagPattern: (await tagPattern()).source,
    aboutPattern: await aboutPattern(),
    senseRule: await senseRule(),
    // Each word's first gloss, the hint beside its sense, read off the site's definition shards.
    glosses: await firstGlosses(hits.flatMap((h) => h.words)),
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
  const mode: DeskMode = argv.includes('--audit') ? 'audit' : 'desk';
  const cwd = process.env['INIT_CWD'] ?? process.cwd();
  const outFlag = flag(argv, 'out');
  const out = outFlag ? resolve(cwd, outFlag) : mode === 'audit' ? AUDIT_OUT : DESK_OUT;
  const { html, data } = await buildDesk({ queues, out, mode });
  const size = `${Math.round(Buffer.byteLength(html) / 1024)} KB`;
  if (mode === 'audit') {
    const published = data.hits.filter((h) => h.status === 'featured' || h.status === 'accepted');
    const count = (shelf: string) => published.filter((h) => h.shelf === shelf).length;
    console.log(
      `wrote ${relative(cwd, out)} (${size}): ${published.length} published anagrams, ` +
        `${count('greatest')} in Greatest Hits, ${count('interesting')} in Interesting and ${count('stretch')} in A stretch`,
    );
  } else {
    const near = data.queues.reduce((n, q) => n + q.rows.filter((r) => !r.hit).length, 0);
    console.log(
      `wrote ${relative(cwd, out)} (${size}): ${data.hits.length} hits, ${data.candidates.length} candidates, ` +
        `${data.queues.length} queues (${data.queues.map((q) => q.name).join(', ') || 'none'}), ${near} near misses`,
    );
  }
  if (argv.includes('--artifact')) {
    const fragment = artifactFragment(html);
    const artifactOut = mode === 'audit' ? AUDIT_ARTIFACT_OUT : DESK_ARTIFACT_OUT;
    await mkdir(dirname(artifactOut), { recursive: true });
    await writeFile(artifactOut, fragment);
    console.log(`wrote ${relative(cwd, artifactOut)} (${Math.round(Buffer.byteLength(fragment) / 1024)} KB) to publish as a private claude.ai Artifact`);
  }
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
