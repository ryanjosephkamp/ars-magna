/**
 * The Ars Magna engine as MCP tools, so the Greatest Hits workflow can be
 * driven from a chat: "find me the best anagrams of these ten companies",
 * "what does `za` mean", "propose this one".
 *
 * Five tools. `solve`, `count` and `nth` are the search; `explain_word` reads
 * the same definition shards the site does; `propose_hit` checks a phrase
 * and writes a candidate and a proposed hit into the data files, which a
 * person then reviews like any other proposal. The engine boots once, on the
 * first call, from the committed dictionary and the built WASM.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { Definitions } from '@ars-magna/engine/definitions';
import { normalizeLetters } from '@ars-magna/engine/fold';
import { DEFS_DIR, Engine, fileFetch } from '@ars-magna/engine/node';
import type { Tier } from '@ars-magna/engine/protocol';
import { aboutProblem, syncAbout, tidySentence } from '@ars-magna/hits/about';
import { checkAnagram } from '@ars-magna/hits/check';
import { CATEGORIES, alphagram, candidateId, hitId } from '@ars-magna/hits/ids';
import {
  CANDIDATES_PATH,
  HITS_PATH,
  candidateSchema,
  dictionaryPin,
  hitSchema,
  readJsonl,
  today,
  writeJsonl,
  type Candidate,
  type Hit,
} from '@ars-magna/hits/schema';

const tier = z.enum(['common', 'standard', 'full', 'extended']).default('standard');

export type ServerDeps = {
  engine?: () => Promise<Engine>;
  definitions?: Definitions;
  /** Where propose_hit writes; the tests point it at a scratch folder. */
  paths?: { candidates: string; hits: string };
};

export function createServer(deps: ServerDeps = {}): McpServer {
  let booted: Promise<Engine> | null = null;
  const engine = () => (booted ??= (deps.engine ?? Engine.boot)());
  const definitions = deps.definitions ?? new Definitions('/defs', 512, 24, fileFetch(DEFS_DIR, /^\/defs\//));
  const paths = deps.paths ?? { candidates: CANDIDATES_PATH, hits: HITS_PATH };

  const server = new McpServer({ name: 'ars-magna', version: '0.1.0' });
  const text = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] });

  server.registerTool(
    'solve',
    {
      title: 'Solve',
      description:
        'Every way the letters of `input` can be re-partitioned into English words, as phrases. Returns the exact total (a leading ">" means a floor) and the first `first` results in canonical order, longest words first. The text itself, its words in any order, is never a result: `text_left_out` is true when that took a row out, so the total is one fewer than the letters alone would give.',
      inputSchema: {
        input: z.string().min(1),
        tier,
        minWordLen: z.number().int().min(1).max(12).default(3),
        maxWords: z.number().int().min(1).max(64).default(4),
        mustInclude: z.array(z.string()).default([]),
        first: z.number().int().min(0).max(2000).default(50),
      },
    },
    async (args) => {
      const e = await engine();
      const { total, rows, textLeftOut } = await e.solve(args.input, args, args.first);
      return text({
        input: args.input,
        letters: alphagram(args.input),
        total,
        text_left_out: textLeftOut,
        results: rows.map((r) => r.join(' ')),
      });
    },
  );

  server.registerTool(
    'count',
    {
      title: 'Count',
      description:
        'How many anagrams `input` has under these settings, without listing them. The text itself is never counted: `text_left_out` is true when that made the total one fewer.',
      inputSchema: {
        input: z.string().min(1),
        tier,
        minWordLen: z.number().int().min(1).max(12).default(3),
        maxWords: z.number().int().min(1).max(64).default(4),
      },
    },
    async (args) => {
      const e = await engine();
      const { total, textLeftOut } = await e.solve(args.input, args, 0);
      return text({ input: args.input, total, text_left_out: textLeftOut });
    },
  );

  server.registerTool(
    'nth',
    {
      title: 'Nth result',
      description: 'The result at a 0-based `index` in the canonical order, reached by unranking rather than listing: result 8,000,000 costs the same as result 8.',
      inputSchema: {
        input: z.string().min(1),
        index: z.string().regex(/^\d+$/),
        tier,
        minWordLen: z.number().int().min(1).max(12).default(3),
        maxWords: z.number().int().min(1).max(64).default(4),
      },
    },
    async (args) => {
      const e = await engine();
      const { total } = await e.solve(args.input, args, 0);
      const row = await e.nth(BigInt(args.index));
      return text({ input: args.input, index: args.index, total, result: row ? row.join(' ') : null });
    },
  );

  server.registerTool(
    'explain_word',
    {
      title: 'Explain a word',
      description: 'Definitions (WordNet 3.1), provenance in English OpenList, and the other spellings of the same letters at a tier.',
      inputSchema: { word: z.string().min(1), tier },
    },
    async (args) => {
      const word = normalizeLetters(args.word);
      const e = await engine();
      // One engine call at a time: the Node wrapper has a single reply port.
      const info = await definitions.lookup(word);
      const inTier = await e.has(word, args.tier as Tier);
      const spellings = await e.spellings(word, args.tier as Tier);
      return text({ word, inDictionary: inTier, tier: args.tier, senses: info.senses, provenance: info.provenance, spellings });
    },
  );

  server.registerTool(
    'propose_hit',
    {
      title: 'Propose a hit',
      description:
        'Check that `words` are a real anagram of `input` at `tier`, then record the input as a candidate and the phrase as a proposed hit for a person to review. `justification` is one plain sentence explaining the link for a reader; with none, a `rationale` of up to 300 characters is used instead. `about` is one factual sentence saying what the input is (under 200 characters, ending with a full stop, never an opinion, never about a private person); it is kept only when the input has none yet, and the hit carries the input\'s sentence. Nothing is published by this tool.',
      inputSchema: {
        input: z.string().min(1),
        category: z.enum(CATEGORIES),
        words: z.array(z.string().min(1)).min(1).max(8),
        tier,
        rationale: z.string().default(''),
        justification: z.string().trim().min(1).max(300).optional(),
        about: z.string().optional(),
        submitter: z.string().default('mcp'),
      },
    },
    async (args) => {
      const about = args.about === undefined ? null : tidySentence(args.about);
      const problem = about === null ? null : aboutProblem(about);
      if (problem) return text({ ok: false, reason: `about: ${problem}` });

      const e = await engine();
      const words = args.words.map(normalizeLetters).filter((w) => w.length > 0);
      const verdict = await checkAnagram(e, args.input, words, args.tier as Tier);
      if (!verdict.ok) return text({ ok: false, reason: verdict.reason });

      const date = today();
      const cv = await candidateSchema();
      const hv = await hitSchema();
      const candidates = await readJsonl(paths.candidates, cv);
      const hits = await readJsonl(paths.hits, hv);
      const cid = candidateId(args.input, args.category);
      const existing = candidates.find((c) => c.id === cid);
      const candidate: Candidate = existing
        ? { ...existing }
        : { id: cid, input: args.input, category: args.category, source: 'manual', first_seen: date, status: 'enumerated' };
      // A sentence the input already has is never replaced here; hits:describe changes one.
      const aboutWritten = about !== null && !candidate.about;
      if (aboutWritten) candidate.about = about;
      const rationale = tidySentence(args.rationale);
      const justification = args.justification ?? (rationale.length > 0 && [...rationale].length <= 300 ? rationale : undefined);
      const id = hitId(args.input, args.category, words);
      const newHit = !hits.some((h) => h.id === id);
      const hit: Hit = {
        id,
        input: args.input,
        category: args.category,
        words,
        display: words.join(' '),
        letters: alphagram(args.input),
        prefilter_score: 0,
        judge: [],
        submitter: args.submitter,
        added: date,
        dictionary: await dictionaryPin(),
        tier: args.tier as Tier,
        tags: [],
        status: 'proposed',
        ...(justification ? { justification } : {}),
      };
      const nextCandidates = existing ? candidates.map((c) => (c.id === cid ? candidate : c)) : [...candidates, candidate];
      const synced = syncAbout(newHit ? [...hits, hit] : hits, nextCandidates, [cid]);
      if (!existing || aboutWritten) await writeJsonl(paths.candidates, nextCandidates, cv);
      if (newHit || synced.changed.length > 0) await writeJsonl(paths.hits, synced.hits, hv);
      return text({ ok: true, hit: id, newCandidate: !existing, newHit, about: candidate.about ?? null });
    },
  );

  return server;
}
