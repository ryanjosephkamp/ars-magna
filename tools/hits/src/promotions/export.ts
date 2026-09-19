/**
 * `pnpm promotions:export [--counts] [--out=<dir>] [--db=remote|local] [--date=YYYY-MM-DD] [--debug]`
 *
 * Reads the votes database with SELECT statements only, and writes:
 *
 *   --counts     this repository's daily counts, data/counts/<date>/: each
 *                promoted anagram's count under its code, for anagrams whose
 *                words the engine finds, and each hit's votes. No text.
 *   --out=<dir>  the private export, <dir>/export/<date>.jsonl: every promotion
 *                of each anagram with what readers typed and the engine's
 *                check. <dir> is the private repository's checkout, or a
 *                gitignored folder on this Mac.
 *
 * No query names the voter column, so no voter id is ever read. Anagrams
 * already published (their promotions have become votes) are left out, and a
 * promotion row already converted to a vote too.
 *
 * The Export promotions Action runs it on a public repository, whose logs are
 * public: it prints totals only, keeps wrangler's output from the log, and on
 * any failure prints a fixed sentence (`--debug` prints the error, for a laptop).
 */
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { TIERS, type Tier } from '@ars-magna/engine/protocol';

import { sameLetters } from '../check.ts';
import { flag } from '../queue.ts';
import { HITS_PATH, REPO_ROOT, dictionaryPin, hitSchema, readJsonl, today } from '../schema.ts';
import {
  COUNTS_DIR,
  failQuietly,
  keySha256,
  promotionKey,
  readBlocks,
  validators,
  writeLines,
  type CountsMeta,
  type Dictionary,
  type ExportCheck,
  type ExportLine,
  type ExportSearch,
  type ExportSubmission,
  type PromotionCount,
  type VoteCount,
} from './files.ts';

/** A row of the promotions table as the export reads it: every column but the voter. */
export type PromotionRow = {
  key: string;
  input: string;
  words: string;
  tier: string;
  via: string;
  category: string | null;
  about?: string | null;
  why: string | null;
  credit: string | null;
  missing: string | null;
  created_at: string;
  converted_to?: string | null;
};

/** The columns the export may read. `voter` is never among them. */
export const EXPORT_COLUMNS = ['key', 'input', 'words', 'tier', 'via', 'category', 'about', 'why', 'credit', 'missing', 'created_at', 'converted_to'] as const;

/** What the engine is asked: whether a word is in a tier. */
export type WordChecker = { has(word: string, tier: Tier): Promise<boolean> };

const KEY = /^[a-z]+:[a-z]+(-[a-z]+)*$/;
const HIT_ID = /^[a-z]+:(people|companies|products|titles|places|phrases):[a-z]+(-[a-z]+)*$/;
const CATEGORY = new Set(['people', 'companies', 'products', 'titles', 'places', 'phrases']);

const isTier = (t: string): t is Tier => (TIERS as readonly string[]).includes(t);
const day = (at: string): string => at.slice(0, 10);
const wordsOf = (text: string): string[] => text.split(' ').filter((w) => w.length > 0);

/** The engine's check of one anagram's words, and whether each tier holds them all. */
async function checkWords(words: readonly string[], inputs: readonly string[], checker: WordChecker, dictionary: Dictionary): Promise<ExportCheck> {
  const letters = inputs.every((input) => sameLetters(input, words));
  const known = new Map<Tier, boolean>();
  for (const tier of TIERS) {
    let all = true;
    for (const word of new Set(words)) if (!(await checker.has(word, tier))) all = false;
    known.set(tier, all);
  }
  const unknown: string[] = [];
  for (const word of [...new Set(words)].sort()) if (!(await checker.has(word, 'extended'))) unknown.push(word);
  const narrowest = TIERS.find((t) => known.get(t)) ?? null;
  const reason = !letters ? 'letters' : unknown.length > 0 ? 'unknown-word' : null;
  return { ok: reason === null && narrowest !== null, reason, narrowest, unknown, dictionary };
}

async function atTier(words: readonly string[], tier: Tier, checker: WordChecker): Promise<boolean> {
  for (const word of new Set(words)) if (!(await checker.has(word, tier))) return false;
  return true;
}

/**
 * One line per promoted anagram, most promoted first: its count, its dates,
 * what readers searched and submitted, and the engine's check. Rows of a
 * published anagram, rows already converted to votes and rows whose key is
 * malformed are left out. Pure but for the checker.
 */
export async function exportLines(
  rows: readonly PromotionRow[],
  context: { published: ReadonlySet<string>; blocked: ReadonlySet<string>; checker: WordChecker; dictionary: Dictionary },
): Promise<ExportLine[]> {
  const groups = new Map<string, PromotionRow[]>();
  for (const row of rows) {
    if (row.converted_to || !KEY.test(row.key) || context.published.has(row.key) || !isTier(row.tier)) continue;
    groups.set(row.key, [...(groups.get(row.key) ?? []), row]);
  }
  const lines: ExportLine[] = [];
  for (const [key, group] of groups) {
    const words = key.slice(key.indexOf(':') + 1).split('-');
    const code = await keySha256(key);
    const searches = new Map<string, ExportSearch>();
    const submissions: ExportSubmission[] = [];
    for (const row of group) {
      const seen = wordsOf(row.words);
      const tier = row.tier as Tier;
      if (row.via === 'typed') {
        submissions.push({
          input: row.input,
          words: seen,
          tier,
          category: row.category && CATEGORY.has(row.category) ? (row.category as ExportSubmission['category']) : null,
          about: row.about ?? null,
          why: row.why,
          credit: row.credit,
          missing: row.missing ? wordsOf(row.missing) : [],
          created: day(row.created_at),
          at_tier: await atTier(seen, tier, context.checker),
        });
      } else {
        const id = JSON.stringify([row.input, seen, tier]);
        const held = searches.get(id);
        if (held) held.n++;
        else searches.set(id, { input: row.input, words: seen, tier, n: 1, at_tier: await atTier(seen, tier, context.checker) });
      }
    }
    const dates = group.map((r) => day(r.created_at)).sort();
    lines.push({
      key,
      key_sha256: code,
      count: group.length,
      first: dates[0]!,
      last: dates.at(-1)!,
      via: { result: group.filter((r) => r.via !== 'typed').length, typed: submissions.length },
      searches: [...searches.values()].sort((a, b) => b.n - a.n || a.input.localeCompare(b.input)),
      submissions: submissions.sort((a, b) => b.created.localeCompare(a.created)),
      check: await checkWords(words, group.map((r) => r.input), context.checker, context.dictionary),
      blocked: context.blocked.has(code),
    });
  }
  return lines.sort((a, b) => b.count - a.count || a.key_sha256.localeCompare(b.key_sha256));
}

/** The convention every day's counts follow, stated in its meta.json. */
export const COUNTS_CONVENTION =
  'One promotion or vote per browser per anagram; one taken back is not counted. Counts as the database held them at taken_at. ' +
  'An anagram already published is counted in votes.jsonl, its promotions having become votes. promotions.jsonl lists an anagram by ' +
  'the SHA-256 of its key only when the engine finds every word in the site vocabulary and it is not blocked; the rest are counted in meta.';

/** The day's public counts: no text, only codes, hit ids and numbers. Pure. */
export function countFiles(
  lines: readonly ExportLine[],
  votes: readonly VoteCount[],
  context: { date: string; takenAt: string; dictionary: Dictionary },
): { promotions: PromotionCount[]; votes: VoteCount[]; meta: CountsMeta } {
  const listed = lines.filter((l) => l.check.ok && !l.blocked);
  const kept = votes.filter((v) => HIT_ID.test(v.hit_id) && Number.isInteger(v.count) && v.count > 0);
  return {
    promotions: listed.map((l) => ({ key_sha256: l.key_sha256, count: l.count })).sort((a, b) => a.key_sha256.localeCompare(b.key_sha256)),
    votes: kept.map((v) => ({ hit_id: v.hit_id, count: v.count })).sort((a, b) => a.hit_id.localeCompare(b.hit_id)),
    meta: {
      date: context.date,
      taken_at: context.takenAt,
      convention: COUNTS_CONVENTION,
      promotions: {
        anagrams: lines.length,
        listed: listed.length,
        total: lines.reduce((sum, l) => sum + l.count, 0),
        left_out: { unchecked: lines.filter((l) => !l.check.ok).length, blocked: lines.filter((l) => l.check.ok && l.blocked).length },
      },
      votes: { hits: kept.length, total: kept.reduce((sum, v) => sum + v.count, 0) },
      dictionary: context.dictionary,
    },
  };
}

// ------------------------------------------------------------------ the CLI

/** One SELECT through wrangler, its output kept from the log. */
function select<T>(sql: string, db: 'remote' | 'local'): T[] {
  if (!/^\s*(SELECT|PRAGMA table_info)\b/i.test(sql)) throw new Error('the export only reads');
  const out = execFileSync('pnpm', ['dlx', 'wrangler@4.121.0', 'd1', 'execute', 'ars-magna-discoveries', `--${db}`, '--json', '--command', sql], {
    cwd: resolve(REPO_ROOT, 'apps/web'),
    env: { ...process.env, CI: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 512 * 1024 * 1024,
    encoding: 'utf8',
  });
  const parsed = JSON.parse(out) as { results?: T[] }[];
  return parsed.flatMap((p) => p.results ?? []);
}

async function main(argv: readonly string[]): Promise<void> {
  const counts = argv.includes('--counts');
  const out = flag(argv, 'out');
  if (!counts && !out) throw new Error('say --counts, --out=<dir>, or both');
  const db = flag(argv, 'db') === 'local' ? 'local' : 'remote';
  const date = flag(argv, 'date') ?? today();

  // The columns this database has (0004 added converted_to), less the voter's.
  const columns = new Set(select<{ name: string }>('PRAGMA table_info(promotions)', db).map((c) => c.name));
  const read = EXPORT_COLUMNS.filter((c) => columns.has(c));
  const rows = select<PromotionRow>(`SELECT ${read.join(', ')} FROM promotions`, db);
  const votes = select<VoteCount>('SELECT hit_id, count FROM vote_counts WHERE count > 0', db);
  const takenAt = new Date().toISOString();

  const hits = await readJsonl(HITS_PATH, await hitSchema());
  const published = new Set(hits.filter((h) => h.status === 'accepted' || h.status === 'featured').map((h) => promotionKey(h.words)));
  const blocked = new Set((await readBlocks()).map((b) => b.key_sha256));
  const dictionary = await dictionaryPin();
  const { Engine } = await import('../engine.ts');
  const engine = await Engine.boot();
  const lines = await exportLines(rows, { published, blocked, checker: engine, dictionary });

  if (out) {
    await writeLines(resolve(out, 'export', `${date}.jsonl`), lines, await validators.exportLine());
  }
  const files = countFiles(lines, votes, { date, takenAt, dictionary });
  if (counts) {
    const dir = resolve(COUNTS_DIR, date);
    await writeLines(resolve(dir, 'promotions.jsonl'), files.promotions, await validators.promotionCount());
    await writeLines(resolve(dir, 'votes.jsonl'), files.votes, await validators.voteCount());
    const meta = await validators.countsMeta();
    if (!meta(files.meta)) throw new Error('refusing to write meta.json: it does not fit its schema');
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'meta.json'), `${JSON.stringify(files.meta, null, 2)}\n`);
  }
  const m = files.meta;
  console.log(
    `promotions:export ${date}: ${m.promotions.anagrams} promoted anagrams, ${m.promotions.total} promotions; ` +
      `${m.promotions.listed} listed by code, ${m.promotions.left_out.unchecked} left out unchecked, ${m.promotions.left_out.blocked} blocked; ` +
      `${m.votes.total} votes on ${m.votes.hits} hits.` +
      (counts ? ` Wrote data/counts/${date}/.` : '') +
      (out ? ' Wrote the private export.' : ''),
  );
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const argv = process.argv.slice(2);
  await main(argv).catch(failQuietly('promotions:export', argv));
}
