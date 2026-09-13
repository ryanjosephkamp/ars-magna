/**
 * Drives the server through a real MCP client over an in-memory transport,
 * against the real engine and shards. Skipped when the engine is not built.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { DICT_DIR, REPO_ROOT } from '@ars-magna/engine/node';
import { createServer } from '../src/server.ts';

const built =
  existsSync(resolve(REPO_ROOT, 'packages/engine/src/wasm/anagram_bg.wasm')) && existsSync(resolve(DICT_DIR, 'manifest.json'));

type ToolResult = { content: { type: string; text?: string }[] };
const parse = (result: unknown) => JSON.parse((result as ToolResult).content[0]!.text!) as Record<string, unknown>;

describe.skipIf(!built)('ars-magna MCP server', () => {
  let client: Client;
  let scratch: string;

  beforeAll(async () => {
    scratch = await mkdtemp(join(tmpdir(), 'mcp-'));
    const server = createServer({ paths: { candidates: join(scratch, 'c.jsonl'), hits: join(scratch, 'h.jsonl') } });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '0' });
    await client.connect(clientTransport);
  });

  it('lists the five tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['count', 'explain_word', 'nth', 'propose_hit', 'solve']);
  });

  it('solves, counts, and unranks consistently', async () => {
    const solved = parse(await client.callTool({ name: 'solve', arguments: { input: 'dormitory', tier: 'common', maxWords: 2, first: 100 } }));
    expect(solved['letters']).toBe('dimoorrty');
    expect(solved['results']).toContain('dirty room');
    const counted = parse(await client.callTool({ name: 'count', arguments: { input: 'dormitory', tier: 'common', maxWords: 2 } }));
    expect(counted['total']).toBe(solved['total']);
    const nth = parse(await client.callTool({ name: 'nth', arguments: { input: 'dormitory', index: '0', tier: 'common', maxWords: 2 } }));
    expect((solved['results'] as string[])[0]).toBe(nth['result']);
  });

  it('explains a word with a gloss, provenance and its spellings', async () => {
    const info = parse(await client.callTool({ name: 'explain_word', arguments: { word: 'Listen', tier: 'standard' } }));
    expect(info['inDictionary']).toBe(true);
    expect((info['senses'] as unknown[]).length).toBeGreaterThan(0);
    expect(info['spellings']).toEqual(expect.arrayContaining(['listen', 'silent']));
    const generated = parse(await client.callTool({ name: 'explain_word', arguments: { word: 'abacteremicer', tier: 'full' } }));
    expect(generated['provenance']).toBe('generated');
  });

  it('proposes a real anagram and refuses a fake one', async () => {
    const bad = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'dormitory', category: 'phrases', words: ['dirty', 'rooms'] } }));
    expect(bad['ok']).toBe(false);
    expect(String(bad['reason'])).toMatch(/letters differ/);

    const good = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'Dormitory', category: 'phrases', words: ['Room', 'dirty'], rationale: 'the classic', justification: 'A dormitory is a room, and students keep it dirty.' } }));
    expect(good).toMatchObject({ ok: true, hit: 'dormitory:phrases:dirty-room', newCandidate: true, newHit: true });
    const hits = (await readFile(join(scratch, 'h.jsonl'), 'utf8')).trim().split('\n');
    expect(hits).toHaveLength(1);
    expect(JSON.parse(hits[0]!)).toMatchObject({ status: 'proposed', submitter: 'mcp', display: 'room dirty', justification: 'A dormitory is a room, and students keep it dirty.' });

    // Again is not new.
    const again = parse(await client.callTool({ name: 'propose_hit', arguments: { input: 'dormitory', category: 'phrases', words: ['dirty', 'room'] } }));
    expect(again).toMatchObject({ ok: true, newCandidate: false, newHit: false });
  });
});
