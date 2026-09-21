/**
 * What `hits:enumerate` does before the batch runs: a `new` candidate whose
 * input has a digit or a symbol of the set waits for the literal rule, with
 * one note, and the rest run.
 */
import { describe, expect, it } from 'vitest';

import { WAITS_NOTE, setAsideCandidates } from '../src/enumerate.ts';
import type { Candidate } from '../src/schema.ts';

const c = (over: Partial<Candidate>): Candidate => ({
  id: 'x:phrases',
  input: 'x',
  category: 'phrases',
  source: 'trending',
  first_seen: '2026-09-21',
  status: 'new',
  ...over,
});

describe('setAsideCandidates', () => {
  it('sets aside a new candidate with an item, notes it once, and runs the rest', () => {
    const list = [
      c({ id: 'bigbrother:titles', input: 'Big Brother 28', category: 'titles' }),
      c({ id: 'vishwanathsons:titles', input: 'Vishwanath & Sons', category: 'titles', notes: 'Wikipedia: Vishwanath & Sons' }),
      c({ id: 'kesha:people', input: 'Ke$ha', category: 'people' }),
      c({ id: 'hello:phrases', input: 'Hello!' }),
      c({ id: 'dormitory:phrases', input: 'Dormitory' }),
      c({ id: 'sardar:titles', input: 'Sardar 2', category: 'titles', status: 'enumerated' }),
      c({ id: 'reacherseason:titles', input: 'Reacher season 4', category: 'titles', notes: `requeued 2026-09-13; ${WAITS_NOTE}` }),
    ];
    const { run, aside, noted } = setAsideCandidates(list);
    expect(run.map((x) => x.id)).toEqual(['hello:phrases', 'dormitory:phrases', 'sardar:titles']);
    expect(aside.map((x) => x.id)).toEqual(['bigbrother:titles', 'vishwanathsons:titles', 'kesha:people', 'reacherseason:titles']);
    // The note is written once, after any note the line has; a line that has it already is untouched.
    expect(aside[0]!.notes).toBe(WAITS_NOTE);
    expect(aside[1]!.notes).toBe(`Wikipedia: Vishwanath & Sons; ${WAITS_NOTE}`);
    expect(aside[3]).toBe(list[6]);
    // Every line is in the noted file, in its order, and only the set-aside ones changed.
    expect(noted.map((x) => x.id)).toEqual(list.map((x) => x.id));
    expect(noted[3]).toBe(list[3]);
    expect(noted[5]).toBe(list[5]);
    // Running it again changes nothing.
    const again = setAsideCandidates(noted);
    expect(again.noted).toEqual(noted);
    expect(again.aside.map((x) => x.id)).toEqual(aside.map((x) => x.id));
  });
});
