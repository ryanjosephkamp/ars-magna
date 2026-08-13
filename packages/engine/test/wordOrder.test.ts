/**
 * The ordering is judged on two things: that it improves what it touches, and
 * that it leaves alone what it cannot improve. The second is the harder one —
 * an early version reordered a third of all results into arrangements that read
 * no better, purely because the scoring table ties often and the tie was broken
 * by whichever path the loops reached first.
 */
import { describe, expect, it } from 'vitest';

import { MAX_EXACT, TAG_BIT as B, bestOrder, scoreOrder } from '../src/wordOrder.ts';

const say = (words: string[], masks: number[]) => bestOrder(words, masks).join(' ');

describe('bestOrder', () => {
  it('puts the adjective before the noun', () => {
    // The case this was built for: `luna terra sol` led with `loser natural`.
    expect(say(['loser', 'natural'], [B.noun, B.adj | B.noun])).toBe('natural loser');
    expect(say(['room', 'dirty'], [B.noun, B.adj])).toBe('dirty room');
  });

  it('puts the determiner at the front', () => {
    expect(say(['classroom', 'the'], [B.noun, B.det])).toBe('the classroom');
    expect(say(['eyes', 'the'], [B.noun, B.det])).toBe('the eyes');
    expect(say(['room', 'dirty', 'the'], [B.noun, B.adj, B.det])).toBe('the dirty room');
  });

  it('puts the adverb before what it modifies', () => {
    expect(say(['charmless', 'too'], [B.adj, B.adv])).toBe('too charmless');
    expect(say(['ran', 'quickly'], [B.verb, B.adv])).toBe('quickly ran');
  });

  it('resolves an ambiguous word in whichever reading orders best', () => {
    // `natural` is adjective and noun; `iron` is noun and verb. The tag choice
    // and the ordering are one decision, which is why the search covers both.
    expect(say(['natural', 'loser'], [B.adj | B.noun, B.noun])).toBe('natural loser');
    expect(say(['shirts', 'iron'], [B.noun, B.noun | B.verb])).toBe('iron shirts');
  });

  it('leaves an order alone unless it can strictly beat it', () => {
    // Two untagged words score identically in either arrangement. Moving them
    // would be churn: the reader pays attention and gets nothing back.
    expect(say(['lar', 'outlearns'], [0, 0])).toBe('lar outlearns');
    expect(say(['outlearns', 'lar'], [0, 0])).toBe('outlearns lar');
    // Already correct input must survive untouched.
    expect(say(['dirty', 'room'], [B.adj, B.noun])).toBe('dirty room');
    expect(say(['the', 'classroom'], [B.det, B.noun])).toBe('the classroom');
  });

  it('never invents, drops or duplicates a word', () => {
    const words = ['or', 'dorty', 'mi', 'the'];
    const masks = [B.conj, 0, B.noun, B.det];
    const out = bestOrder(words, masks);
    expect([...out].sort()).toEqual([...words].sort());
    expect(out).toHaveLength(words.length);
  });

  it('passes through the cases it cannot or should not handle', () => {
    expect(bestOrder([], [])).toEqual([]);
    expect(bestOrder(['solo'], [B.noun])).toEqual(['solo']);
    // A mask array that does not line up is a caller bug, not a licence to guess.
    expect(bestOrder(['a', 'b'], [B.det])).toEqual(['a', 'b']);

    const many = Array.from({ length: MAX_EXACT + 1 }, (_, i) => `w${i}`);
    expect(bestOrder(many, many.map(() => B.noun))).toEqual(many);
  });

  it('is deterministic, so a rebuild does not reshuffle a saved link', () => {
    const words = ['neutrals', 'la', 'or'];
    const masks = [B.noun, B.noun, B.conj];
    const once = bestOrder(words, masks);
    for (let i = 0; i < 5; i++) expect(bestOrder(words, masks)).toEqual(once);
  });

  it('stays fast enough to run on every row a reader sees', () => {
    const words = ['the', 'dirty', 'room', 'and', 'more'];
    const masks = [B.det, B.adj, B.noun, B.conj, B.adj | B.adv];
    const started = performance.now();
    for (let i = 0; i < 250; i++) bestOrder(words, masks);
    // 250 rows is a full page. Generous bound: the measured cost is ~0.01 ms each.
    expect(performance.now() - started).toBeLessThan(250);
  });
});

describe('scoreOrder', () => {
  it('prefers the grammatical arrangement', () => {
    expect(scoreOrder(['dirty', 'room'], [B.adj, B.noun])).toBeGreaterThan(
      scoreOrder(['room', 'dirty'], [B.noun, B.adj]),
    );
    expect(scoreOrder(['the', 'room'], [B.det, B.noun])).toBeGreaterThan(
      scoreOrder(['room', 'the'], [B.noun, B.det]),
    );
  });

  it('agrees with what bestOrder chose', () => {
    const words = ['loser', 'natural', 'the'];
    const masks = [B.noun, B.adj | B.noun, B.det];
    const chosen = bestOrder(words, masks);
    const chosenMasks = chosen.map((w) => masks[words.indexOf(w)]!);
    expect(scoreOrder(chosen, chosenMasks)).toBeGreaterThanOrEqual(scoreOrder(words, masks));
  });
});
