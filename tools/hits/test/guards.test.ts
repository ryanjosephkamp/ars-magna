/**
 * The judge guards (roadmap F0). The night they answer, 2026-09-18, is the
 * fixture: its screen and judge answers from the branch of #72, which was
 * closed unmerged (`hits/2026-09-18` at e91cd5e), in
 * `fixtures/queue-2026-09-18/`. Its screen input is the one on main, in
 * `data/queue/2026-09-18/`. Both must be refused, and every routine night
 * already on main must pass.
 */
import { describe, expect, it } from 'vitest';
import { copyFile, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPEAT_CAP, SCREEN_KEEP_CAP, maskQuoted, repeatMessage, repeatedJustifications, screenKeepProblems } from '../src/guards.ts';
import { assessBatch, judgedByFlag, toJudgement, type IngestOptions } from '../src/ingest.ts';
import { parseVerdicts, type VerdictV2 } from '../src/judge.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { applyScreen, parseScreenInputs, parseScreenOutput, validateScreen } from '../src/screen.ts';
import { ALTERNATE_CAP, SHELF_CAP, assess } from '../src/shelf.ts';
import { QUEUE_DIR, candidateSchema, hitSchema, type Candidate } from '../src/schema.ts';
import { isDeepQueue } from '../src/settings.ts';

const FIXTURE = fileURLToPath(new URL('./fixtures/queue-2026-09-18/', import.meta.url));
const NIGHT = resolve(QUEUE_DIR, '2026-09-18');

/** A copy of the 2026-09-18 queue as the routine left it, with the summary given, in a folder of its own. */
async function night(summary?: object): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'ars-magna-guards-'));
  for (const name of await readdir(NIGHT)) {
    if (/^screen-input-\d+\.md$|^screen-scores\.txt$/.test(name)) await copyFile(join(NIGHT, name), join(dir, name));
  }
  await copyFile(join(FIXTURE, 'screen-output.jsonl'), join(dir, 'screen-output.jsonl'));
  await writeFile(join(dir, 'summary.json'), JSON.stringify(summary ?? JSON.parse(await readFile(join(NIGHT, 'summary.json'), 'utf8'))));
  return dir;
}

/** Every queue on main that the routine judged: screened, answered, and not a deep run. */
async function routineNights(): Promise<string[]> {
  const out: string[] = [];
  for (const name of (await readdir(QUEUE_DIR)).sort()) {
    const dir = resolve(QUEUE_DIR, name);
    if (!existsSync(join(dir, 'judge-output.jsonl')) || !existsSync(join(dir, 'screen-output.jsonl'))) continue;
    if (!(await isDeepQueue(dir))) out.push(dir);
  }
  return out;
}

describe('the screen keeps at most SCREEN_KEEP_CAP phrases an input', () => {
  it('refuses the 2026-09-18 answers, naming each input over the cap and saying to keep the strongest', async () => {
    const dir = await night();
    const refusal = applyScreen(dir);
    await expect(refusal).rejects.toThrow(/thesheepdetectives:titles: keeps 448 phrases, and an input keeps at most 12\. Keep only its strongest links\./);
    await expect(refusal).rejects.toThrow(/oliverreed:people: keeps 54 phrases/);
    await expect(refusal).rejects.toThrow(/Nothing was written\./);
    // Nine inputs kept more than 12; the ones that kept 5 to 11 are not named.
    const message = String(await refusal.catch((e: Error) => e.message));
    expect(message.match(/: keeps \d+ phrases/g)).toHaveLength(9);
    expect(message).not.toMatch(/giadadelaurentiis/);
    expect(existsSync(join(dir, 'screened.jsonl'))).toBe(false);
  });

  it('counts an input across every file its phrases span', () => {
    const sections = parseScreenInputs([
      '## File 1 of 2: 10 phrases\n\n### long:phrases\n\ninput: Long\ncategory: phrases\nphrases 1 to 10 of 20\n\n' +
        Array.from({ length: 10 }, (_, i) => `${i + 1} p${i + 1}`).join('\n'),
      '## File 2 of 2: 10 phrases\n\n### long:phrases\n\ninput: Long\ncategory: phrases\nphrases 11 to 20 of 20\n\n' +
        Array.from({ length: 10 }, (_, i) => `${i + 11} p${i + 11}`).join('\n'),
    ]);
    const answers = parseScreenOutput('{"candidate_id":"long:phrases","keep":[1,2,3,4,5,6,7]}\n{"candidate_id":"long:phrases","keep":[11,12,13,14,15,16]}\n');
    const { kept, problems } = validateScreen(answers, sections);
    expect(problems).toEqual([]);
    expect(screenKeepProblems(kept)).toEqual(['long:phrases: keeps 13 phrases, and an input keeps at most 12. Keep only its strongest links.']);
    expect(screenKeepProblems(kept, 13)).toEqual([]);
  });

  it('leaves a deep run alone, whose summary records the deep preset', async () => {
    const summary = JSON.parse(await readFile(join(NIGHT, 'summary.json'), 'utf8')) as { limit: number };
    const dir = await night({ ...summary, limit: 50_000 });
    expect(await isDeepQueue(dir)).toBe(true);
    expect(await applyScreen(dir)).toHaveLength(783);
    expect(await isDeepQueue(await night())).toBe(false);
  });

  it('passes every routine night already on main', async () => {
    const nights = await routineNights();
    expect(nights.length).toBeGreaterThanOrEqual(4);
    for (const dir of nights) {
      const files = (await readdir(dir)).filter((n) => /^screen-input-\d+\.md$/.test(n));
      const sections = parseScreenInputs(await Promise.all(files.map((f) => readFile(join(dir, f), 'utf8'))));
      const { kept } = validateScreen(parseScreenOutput(await readFile(join(dir, 'screen-output.jsonl'), 'utf8')), sections);
      expect(screenKeepProblems(kept), dir).toEqual([]);
    }
    expect(SCREEN_KEEP_CAP).toBe(12);
  });
});

describe('ingest refuses justifications written from a template', () => {
  it('masks quoted words, keeps apostrophes, and ignores case, spacing and the full stop', () => {
    expect(maskQuoted(`'Violates' loosely evokes Reed's wild reputation.`)).toBe(`… loosely evokes reed's wild reputation`);
    expect(maskQuoted(`"tech" loosely evokes technology, a thin tie to the sheep detectives' cases.`)).toBe(
      `… loosely evokes technology, a thin tie to the sheep detectives' cases`,
    );
    expect(maskQuoted('“Vetted”  and ‘speech’ loosely evoke   an examination.')).toBe('… and … loosely evoke an examination');
    expect(maskQuoted(`"chest" and "pet" loosely evoke evidence.`)).toBe(maskQuoted(`"vetted" and "speech" loosely evoke evidence`));
  });

  it('refuses the 2026-09-18 verdict file, naming each repeated sentence and its count', async () => {
    const verdicts = parseVerdicts(await readFile(join(FIXTURE, 'judge-output.jsonl'), 'utf8'));
    expect(verdicts).toHaveLength(783);
    const repeats = repeatedJustifications(verdicts);
    expect(repeats.length).toBeGreaterThan(10);
    expect(repeats[0]).toMatchObject({
      count: 31,
      sentence: `… and … loosely evoke veterinary or investigative examination, a thin but real tie to the sheep detectives' cases`,
    });
    expect(repeats.every((r) => r.count > REPEAT_CAP && r.ids.length === r.count)).toBe(true);
    const message = repeatMessage(repeats, 'judge-output.jsonl');
    expect(message).toMatch(/^judge-output\.jsonl is refused: \d+ justifications are on more than 3 verdicts once the words they quote are masked\./);
    expect(message).toContain(`  31 verdicts: "… and … loosely evoke veterinary or investigative examination, a thin but real tie to the sheep detectives' cases." (`);
    expect(message).toMatch(/Judge these rows again, one at a time, and write each sentence for its row\. Nothing was written\.$/);
  });

  it('allows a sentence on three verdicts, counts each verdict once, and passes every routine night on main', async () => {
    const line = (id: string, justification: string) => ({ id, justification });
    const three = [line('a', `"x" is a pun.`), line('b', `"y" is a pun.`), line('c', `"z" is a pun`), line('c', `"z" is a pun`)];
    expect(repeatedJustifications(three)).toEqual([]);
    expect(repeatedJustifications([...three, line('d', `'w' is a pun.`)])).toEqual([{ sentence: '… is a pun', count: 4, ids: ['a', 'b', 'c', 'd'] }]);
    for (const dir of await routineNights()) {
      expect(repeatedJustifications(parseVerdicts(await readFile(join(dir, 'judge-output.jsonl'), 'utf8'))), dir).toEqual([]);
    }
  });
});

describe('what the 2026-09-18 night would have shelved past the guards', () => {
  it('keeps at most five alternates an input, and puts a phrase that reads 1 with the near misses', async () => {
    // Rebuild the rows the judge saw, as a deep run would, so the verdicts can be placed.
    const summary = JSON.parse(await readFile(join(NIGHT, 'summary.json'), 'utf8')) as { limit: number };
    const rows = await applyScreen(await night({ ...summary, limit: 50_000 }));
    const batch = new Map<string, Prefiltered>(rows.map((r) => [r.id, r]));
    const verdicts = parseVerdicts(await readFile(join(FIXTURE, 'judge-output.jsonl'), 'utf8'));
    const options: IngestOptions = {
      model: 'claude-sonnet-5',
      version: 'v2',
      date: '2026-09-18',
      queueDay: '2026-09-18',
      threshold: 11,
      dictionary: { repo: 'r', rev: 'a'.repeat(40) },
      judgedBy: 'routine',
    };
    const { hits, near } = assessBatch(batch, verdicts, options);
    const per = new Map<string, { accepted: number; alternates: number }>();
    for (const { hit, placement } of hits) {
      const c = hit.id.split(':').slice(0, 2).join(':');
      const n = per.get(c) ?? { accepted: 0, alternates: 0 };
      if (placement === 'alternate') n.alternates++;
      else n.accepted++;
      per.set(c, n);
    }
    for (const n of per.values()) {
      expect(n.accepted).toBeLessThanOrEqual(SHELF_CAP);
      expect(n.alternates).toBeLessThanOrEqual(ALTERNATE_CAP);
    }
    expect(per.get('thesheepdetectives:titles')).toEqual({ accepted: 3, alternates: 5 });
    // #72 wrote 416 hits; the same verdicts now give at most eight an input.
    expect(hits.length).toBeLessThan(150);
    // Nothing that reads as word salad reaches a shelf: "windscreen foals paisa" is a near miss now.
    for (const { hit } of hits) {
      const v = verdicts.find((x) => x.id === hit.id) as VerdictV2;
      expect(v.reads, hit.id).toBeGreaterThan(1);
    }
    expect(near.some((n) => n.display === 'windscreen foals paisa' && n.relation === 4 && n.reads === 1)).toBe(true);
    // Every judge entry says the routine judged it.
    expect(hits.every(({ hit }) => hit.judge.every((j) => j.judged_by === 'routine'))).toBe(true);
  });
});

describe('who judged a queue', () => {
  it('is required of a queue ingest, and recorded on the judge entry and the candidate run', async () => {
    expect(judgedByFlag('routine')).toBe('routine');
    expect(judgedByFlag('hand')).toBe('hand');
    expect(() => judgedByFlag(undefined)).toThrow(/--judged-by must say who judged the queue: routine for the judge routine, or hand/);
    expect(() => judgedByFlag('subagent')).toThrow(/, not subagent$/);

    const v: VerdictV2 = { id: 'x:phrases:a-b', relation: 4, reads: 3, justification: 'Why.', rationale: 'Because.' };
    const entry = toJudgement(v, 'claude-opus-5', 'v2', '2026-09-19', ['a', 'b'], 'hand');
    expect(entry).toMatchObject({ model: 'claude-opus-5', judged_by: 'hand' });
    expect(toJudgement(v, 'claude-opus-5', 'v2', '2026-09-19')).not.toHaveProperty('judged_by');
    const validateHit = await hitSchema();
    const hit = {
      id: 'dormitory:phrases:dirty-room',
      input: 'Dormitory',
      category: 'phrases',
      words: ['dirty', 'room'],
      display: 'dirty room',
      letters: 'dimoorrty',
      prefilter_score: 1,
      judge: [{ ...entry, justification: 'A dormitory is a room.' }],
      added: '2026-09-19',
      dictionary: { repo: 'r', rev: 'a'.repeat(40) },
      tier: 'common',
      tags: [],
      status: 'accepted',
      justification: 'A dormitory is a room.',
    };
    expect(validateHit(hit), JSON.stringify(validateHit.errors)).toBe(true);
    expect(validateHit({ ...hit, judge: [{ ...entry, judged_by: 'subagent' }] })).toBe(false);

    const validateCandidate = await candidateSchema();
    const candidate: Candidate = {
      id: 'dormitory:phrases',
      input: 'Dormitory',
      category: 'phrases',
      source: 'manual',
      first_seen: '2026-09-19',
      status: 'enumerated',
      runs: [{ queue: '2026-09-19', settings: 's3', rubric: 'v2', date: '2026-09-19', model: 'claude-sonnet-5', judged_by: 'routine' }],
    };
    expect(validateCandidate(candidate), JSON.stringify(validateCandidate.errors)).toBe(true);
    expect(assess({ relation: 5, reads: 1 })).toBe('near');
  });
});
