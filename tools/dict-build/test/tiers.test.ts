/**
 * The tier rules that do not need the pinned sources.
 */
import { describe, expect, it } from 'vitest';

import { COMMON_RANK_CUTOFF, frequencyRanks, inCommon, inFull, inStandard } from '../src/tiers.ts';

describe('frequency ranks', () => {
  it('rank by descending occurrences, break ties by list order, and give an absent word 0', () => {
    const ranks = frequencyRanks(new Float64Array([5, 0, 9, 5]), () => true);
    expect([...ranks]).toEqual([2, 0, 1, 3]);
  });

  it('never give a site addition a place, so it cannot push a pinned word out of Common', () => {
    // Index 1 is an addition the corpus knows well. Without it, every pinned word keeps its rank.
    const occurrences = new Float64Array([9, 8, 7]);
    const withAddition = frequencyRanks(occurrences, (i) => i !== 1);
    expect([...withAddition]).toEqual([1, 0, 2]);

    // The word at the cutoff stays in Common however common the addition is.
    const atCutoff = { word: 'transients', facts: { twl: true, generated: false, nValid: 1 }, addition: false };
    expect(inCommon({ ...atCutoff, freqRank: COMMON_RANK_CUTOFF })).toBe(true);
    expect(inCommon({ ...atCutoff, freqRank: COMMON_RANK_CUTOFF + 1 })).toBe(false);
  });

  it('put the letters of a listed form in every tier by listing, never by rank', () => {
    // `dont` has no provenance record and no rank; it is in Common, Standard and Full because it is listed.
    const dont = { word: 'dont', facts: { twl: false, generated: false, nValid: 0 }, freqRank: 0, addition: false, form: true };
    expect(inCommon(dont)).toBe(true);
    expect(inStandard(dont)).toBe(true);
    expect(inFull(dont)).toBe(true);
    // Without the listing the same word is nowhere: that is what an unlisted `dont` was until 2026-09-20.
    expect(inCommon({ ...dont, form: false })).toBe(false);
    expect(inStandard({ ...dont, form: false })).toBe(true);
  });
});
