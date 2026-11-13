/**
 * A hit's display: the rule every writer applies (`displayProblem`), the
 * judge's suggestion read strictly, the command, and the file.
 */
import { describe, expect, it } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DISPLAY_MARKS, composeCommands, displayProblem } from '../src/desk/compose.ts';
import { applyDisplay, parseDisplayArgs, readFormsMap, readJudgeDisplay, setDisplay } from '../src/display.ts';
import { assessBatch, promoteOnly, renderDisplays, toJudgement, type IngestOptions } from '../src/ingest.ts';
import type { VerdictV2 } from '../src/judge.ts';
import { applyOrder } from '../src/order.ts';
import type { Prefiltered } from '../src/prefilter.ts';
import { HITS_PATH, hitSchema, readJsonl, writeJsonl, type Hit, type JudgementV2 } from '../src/schema.ts';

const forms = { "it's": 'its', "don't": 'dont', "i'm": 'im', "o'clock": 'oclock' };

describe('the display rule', () => {
  it('reads the words in order as themselves or listed forms, with the allowed marks and capitals', () => {
    expect(displayProblem('dirty room', ['dirty', 'room'], forms)).toBeNull();
    expect(displayProblem('Dirty room.', ['dirty', 'room'], forms)).toBeNull();
    expect(displayProblem("I'm a dirty room.", ['im', 'a', 'dirty', 'room'], forms)).toBeNull();
    expect(displayProblem("I’m a dirty room.", ['im', 'a', 'dirty', 'room'], forms)).toBeNull();
    expect(displayProblem('“Dirty room,” it said: yes; no?', ['dirty', 'room', 'it', 'said', 'yes', 'no'], forms)).toBeNull();
    expect(displayProblem('NASA, I da AI doomer', ['nasa', 'i', 'da', 'ai', 'doomer'], forms)).toBeNull();
    // Spaces are tidied; the marks are exactly these.
    expect(displayProblem('  dirty   room ', ['dirty', 'room'], forms)).toBeNull();
    expect(DISPLAY_MARKS).toBe("'’-,.?:;\"“”‘");
  });

  it('refuses an exclamation mark, other characters, and capitals after a lowercase letter', () => {
    expect(displayProblem('Dirty room!', ['dirty', 'room'], forms)).toMatch(/exclamation mark/);
    expect(displayProblem('dirty (room)', ['dirty', 'room'], forms)).toMatch(/“\(” is not a letter/);
    expect(displayProblem('dirty room 2', ['dirty', 'room'], forms)).toMatch(/“2” is not a letter/);
    expect(displayProblem('dIrty room', ['dirty', 'room'], forms)).toMatch(/capital after a lowercase letter/);
    expect(displayProblem('dirty room —', ['dirty', 'room'], forms)).toMatch(/“—” is not a letter/);
    expect(displayProblem('', ['dirty', 'room'], forms)).toMatch(/empty/);
  });

  it('holds the display to the hit’s words, each once, in their order', () => {
    expect(displayProblem('room dirty', ['dirty', 'room'], forms)).toMatch(/reads room dirty, not the words dirty room in their order/);
    expect(displayProblem('dirty', ['dirty', 'room'], forms)).toMatch(/reads dirty, not/);
    expect(displayProblem('dirty room room', ['dirty', 'room'], forms)).toMatch(/not the words/);
    expect(displayProblem('dirty rooms', ['dirty', 'room'], forms)).toMatch(/reads dirty rooms/);
    // A token that is only marks has no word in it.
    expect(displayProblem('dirty , room', ['dirty', 'room'], forms)).toMatch(/“,” has no letters/);
  });

  it('allows an apostrophe or hyphen only in a listed form, and a possessive only by the operator’s command', () => {
    expect(displayProblem("don't stop", ['dont', 'stop'], forms)).toBeNull();
    // The form's letters must be the word in that place.
    expect(displayProblem("don't stop", ['stop', 'dont'], forms)).toMatch(/not the words stop dont/);
    expect(displayProblem("it's a dog's life", ['its', 'a', 'dogs', 'life'], forms)).toMatch(/“dog's” is not a listed form/);
    expect(displayProblem("it's a dog's life", ['its', 'a', 'dogs', 'life'], forms, { possessives: true })).toBeNull();
    // An unlisted contraction is the same as a possessive: the operator's call.
    expect(displayProblem("could've been", ['couldve', 'been'], forms)).toMatch(/not a listed form/);
    expect(displayProblem("could've been", ['couldve', 'been'], forms, { possessives: true })).toBeNull();
    // A listed form stands for its own letters and no other word, whoever writes it.
    expect(displayProblem("don't stop", ['dint', 'stop'], forms, { possessives: true })).toMatch(/reads dont stop, not the words dint stop/);
    expect(displayProblem('jack-o-lantern', ['jackolantern'], forms)).toMatch(/not a listed form/);
  });
});

describe('the judge’s display', () => {
  it('is kept when it passes with possessives refused, left off with the reason otherwise, and dropped when it is the words', () => {
    expect(readJudgeDisplay("I'm a dirty room.", ['im', 'a', 'dirty', 'room'], forms)).toEqual({ display: "I'm a dirty room.", skipped: null });
    expect(readJudgeDisplay('im a dirty room', ['im', 'a', 'dirty', 'room'], forms)).toEqual({ display: null, skipped: null });
    expect(readJudgeDisplay(undefined, ['dirty'], forms)).toEqual({ display: null, skipped: null });
    expect(readJudgeDisplay(42, ['dirty'], forms).skipped?.reason).toBe('display is not a string');
    expect(readJudgeDisplay("a dog's life", ['a', 'dogs', 'life'], forms).skipped?.reason).toMatch(/possessive appears only by the operator's command/);
    expect(readJudgeDisplay('Dirty room!', ['dirty', 'room'], forms).skipped?.reason).toMatch(/exclamation/);
    expect(readJudgeDisplay('D'.repeat(201), ['d'], forms).skipped?.reason).toMatch(/201 characters/);
  });

  it('reaches the judge entry and the hit from a queue and from --only, and the report lists it beside the words', async () => {
    const row = (words: string[]): Prefiltered => ({
      id: `dirtyroom:phrases:${[...words].sort().join('-')}`,
      candidate_id: 'dirtyroom:phrases',
      input: 'dirty room',
      category: 'phrases',
      words,
      display: words.join(' '),
      letters: 'dimoorrty',
      prefilter_score: 1,
      tier: 'common',
    });
    const im = row(['im', 'dory', 'rot']);
    const dor = row(['dormitory']);
    const batch = new Map([im, dor].map((r) => [r.id, r]));
    const verdict = (id: string, over: Partial<VerdictV2> = {}): VerdictV2 => ({ id, relation: 4, reads: 2, tone: [], subjects: [], justification: 'A link.', rationale: 'Clear.', ...over });
    const options: IngestOptions = {
      model: 'claude-sonnet-5',
      version: 'v2',
      date: '2026-09-20',
      queueDay: '2026-09-20',
      threshold: 11,
      dictionary: { repo: 'ryanjosephkamp/english-openlist', rev: 'a'.repeat(40) },
      forms,
    };
    const judged = toJudgement(verdict(im.id, { display: "I'm dory rot." }), 'm', 'v2', '2026-09-20', im.words, 'hand', forms) as JudgementV2;
    expect(judged.display).toBe("I'm dory rot.");
    // Without the words there is nothing to check against, so no display.
    expect(toJudgement(verdict(im.id, { display: "I'm dory rot." }), 'm', 'v2', '2026-09-20') as JudgementV2).not.toHaveProperty('display');

    const { hits } = assessBatch(batch, [verdict(im.id, { display: "I'm dory rot." }), verdict(dor.id, { display: 'Dormitory!' })], options);
    const byId = new Map(hits.map((p) => [p.hit.id, p.hit]));
    expect(byId.get(im.id)!.display).toBe("I'm dory rot.");
    expect(byId.get(im.id)!.words).toEqual(['im', 'dory', 'rot']);
    expect((byId.get(im.id)!.judge[0] as JudgementV2).display).toBe("I'm dory rot.");
    // The one with an exclamation mark keeps its verdict and its plain display.
    expect(byId.get(dor.id)!.display).toBe('dormitory');
    expect(byId.get(dor.id)!.judge[0]).not.toHaveProperty('display');
    const validate = await hitSchema();
    for (const p of hits) expect(validate(p.hit), JSON.stringify(validate.errors)).toBe(true);

    const only = promoteOnly(batch, [verdict(im.id, { relation: 2, display: "I'm dory rot." })], [im.id], 'proposed', options);
    expect(only.hits[0]!.display).toBe("I'm dory rot.");

    const section = renderDisplays(hits.map((p) => p.hit), [{ id: dor.id, reason: 'display: an exclamation mark is never shown' }]);
    expect(section).toContain('## Display');
    expect(section).toContain(`- \`${im.id}\`: dirty room → I'm dory rot. (the words: im dory rot)`);
    expect(section).toContain(`- ${dor.id}: display: an exclamation mark is never shown`);
    expect(renderDisplays([byId.get(dor.id)!], [])).toEqual([]);
  });
});

describe('hits:display', () => {
  it('reads an id and a display, or --clear, and nothing else', () => {
    expect(parseDisplayArgs(['a:b:c', 'Dirty', 'room.'])).toEqual({ id: 'a:b:c', text: 'Dirty room.' });
    expect(parseDisplayArgs(['a:b:c', '--clear'])).toEqual({ id: 'a:b:c', text: null });
    expect(() => parseDisplayArgs(['a:b:c'])).toThrow(/give a:b:c a display/);
    expect(() => parseDisplayArgs(['a:b:c', 'x', '--clear'])).toThrow(/not both/);
    expect(() => parseDisplayArgs(['a:b:c', '--force'])).toThrow(/unknown option/);
    expect(() => parseDisplayArgs([])).toThrow(/name a hit id/);
  });

  it('sets a display that passes, a possessive included, refuses one that does not, and clears back to the words', async () => {
    const validator = await hitSchema();
    const all = await readJsonl(HITS_PATH, validator);
    const two = all.find((h) => new Set(h.words).size > 1)!;
    const hits: Hit[] = [all[0]!, two].filter((h, i, list) => list.indexOf(h) === i);
    const capital = two.words.map((w, i) => (i === 0 ? w[0]!.toUpperCase() + w.slice(1) : w)).join(' ') + '.';
    const set = setDisplay(hits, two.id, capital, forms);
    expect(set.changed).toBe(true);
    expect(set.hits.find((h) => h.id === two.id)!.display).toBe(capital);
    expect(setDisplay(set.hits, two.id, capital, forms).changed).toBe(false);
    expect(() => setDisplay(hits, two.id, `${two.words.join(' ')}!`, forms)).toThrow(/exclamation mark/);
    expect(() => setDisplay(hits, 'no:such:hit', 'x', forms)).toThrow(/no such hit/);
    // A possessive on a word of the hit passes here, and only here.
    const withS = two.words.find((w) => w.endsWith('s') && w.length > 2);
    if (withS) {
      const possessive = two.words.map((w) => (w === withS ? `${w.slice(0, -1)}'s` : w)).join(' ');
      expect(setDisplay(hits, two.id, possessive, forms).changed).toBe(true);
      expect(readJudgeDisplay(possessive, two.words, forms).skipped).not.toBeNull();
    }
    const cleared = setDisplay(set.hits, two.id, null, forms);
    expect(cleared.hits.find((h) => h.id === two.id)!.display).toBe(two.words.join(' '));
    expect(cleared.from).toBe(capital);
  });

  it('rewrites exactly one line of the file, and hits:order then returns the display to the words and says so', async () => {
    const validator = await hitSchema();
    const all = await readJsonl(HITS_PATH, validator);
    const two = all.find((h) => new Set(h.words).size > 1)!;
    const hits = [...all.filter((h) => h.id !== two.id).slice(0, 2), two];
    const path = join(await mkdtemp(join(tmpdir(), 'ars-magna-display-')), 'hits.jsonl');
    await writeJsonl(path, hits, validator);
    const capital = two.words.map((w, i) => (i === 0 ? w[0]!.toUpperCase() + w.slice(1) : w)).join(' ') + '.';
    const result = await applyDisplay(path, two.id, capital);
    expect(result.changed).toBe(true);
    const after = await readJsonl(path, validator);
    expect(after.map((h) => h.display)).toEqual([hits[0]!.display, hits[1]!.display, capital]);
    // The order changes: the display, which read the old order, goes back to the words, and the command says so.
    const reordered = [...two.words].reverse();
    const order = await applyOrder(path, two.id, reordered);
    expect(order.changed).toBe(true);
    expect(order.displayReplaced).toBe(true);
    expect(order.from).toBe(capital);
    expect((await readJsonl(path, validator)).at(-1)!.display).toBe(reordered.join(' '));
    // Reordering a hit whose display was the words says nothing of a replaced display.
    expect((await applyOrder(path, two.id, two.words)).displayReplaced).toBe(false);
  });

  it('reads the listed forms from the vocabulary file', async () => {
    const listed = await readFormsMap();
    expect(listed["it's"]).toBe('its');
    expect(listed["don't"]).toBe('dont');
    expect(Object.keys(listed).length).toBeGreaterThanOrEqual(53);
    expect(await readFormsMap('/nowhere/forms.jsonl')).toEqual({});
  });
});

describe('the desk’s display decision', () => {
  it('becomes hits:display after the senses and after any word order, empty text clearing it', () => {
    const { commands } = composeCommands(
      [
        { kind: 'display', id: 'dirtyroom:phrases:dirty-room', text: 'Room, dirty.' },
        { kind: 'order', id: 'dirtyroom:phrases:dirty-room', words: ['room', 'dirty'], hit: true },
        { kind: 'sense', id: 'dirtyroom:phrases:dirty-room', word: 'room', text: 'Space.' },
        { kind: 'display', id: 'a:phrases:b', text: '' },
        { kind: 'tag', id: 'dirtyroom:phrases:dirty-room', add: ['tone:pun'], remove: [] },
      ],
      '2026-09-20',
    );
    expect(commands).toEqual([
      'pnpm hits:order dirtyroom:phrases:dirty-room room dirty',
      'pnpm hits:sense dirtyroom:phrases:dirty-room room Space.',
      "pnpm hits:display dirtyroom:phrases:dirty-room 'Room, dirty.'",
      'pnpm hits:display a:phrases:b --clear',
      'pnpm hits:tag dirtyroom:phrases:dirty-room +tone:pun',
    ]);
  });
});
