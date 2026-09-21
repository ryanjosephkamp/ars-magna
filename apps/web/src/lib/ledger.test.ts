import { describe, expect, it } from 'vitest';
import { foldText, insertAt, ledger, lettersLine, readBack, verdict } from './ledger.ts';

const tray = (text: string, anagram: string) =>
  Object.fromEntries(ledger(text, anagram).tray.map((l) => [l.letter, [l.have, l.left]]));

describe('foldText', () => {
  it('folds as the search does and lists what it skipped, once each', () => {
    // A digit and a symbol of the set are characters the search uses as themselves (the literal
    // rule); until the page counts the pool (roadmap N5) the ledger lists each run once, as typed.
    expect(foldText('Beyoncé 4 & 44 Ж')).toEqual({ letters: 'beyonce', skipped: ['4', '&', '44', 'Ж'], skippedCount: 5 });
    // A character a reading leaves out is listed once, every occurrence counted.
    expect(foldText('Beyoncé 4 & 44 Ж', { '4': 'drop' })).toEqual({ letters: 'beyonce', skipped: ['4', '&', 'Ж'], skippedCount: 5 });
    expect(foldText('Beverly Hills 90210 ©')).toEqual({ letters: 'beverlyhills', skipped: ['90210', '©'], skippedCount: 6 });
    expect(foldText('Ke$ha', { $: 's' })).toEqual({ letters: 'kesha', skipped: [], skippedCount: 0 });
  });

  it('ignores apostrophes, hyphens and punctuation without listing them', () => {
    expect(foldText("jack-o'-lantern, it's.")).toEqual({ letters: 'jackolanternits', skipped: [], skippedCount: 0 });
  });
});

describe('the ledger', () => {
  it('holds every letter of the text with its count, a to z', () => {
    expect(tray('Dario Amodei', '')).toEqual({ a: [2, 2], d: [2, 2], e: [1, 1], i: [2, 2], m: [1, 1], o: [2, 2], r: [1, 1] });
  });

  it('takes letters off as the anagram uses them, down to zero', () => {
    expect(tray('Dario Amodei', 'I da AI')).toMatchObject({ a: [2, 0], d: [2, 1], i: [2, 0], o: [2, 2] });
  });

  it('goes below zero for a letter used more often than the text has it, and lists a letter the text lacks', () => {
    const t = tray('Dario Amodei', 'I da AI doomers');
    expect(t['s']).toEqual([0, -1]);
    expect(Object.keys(t)).toEqual(['a', 'd', 'e', 'i', 'm', 'o', 'r', 's']);
    expect(tray('aa', 'aaa')['a']).toEqual([2, -1]);
  });

  it('names what is extra and what is missing, a to z', () => {
    const l = ledger('patent', 'papan');
    expect(l.extra).toEqual([
      { letter: 'a', count: 1 },
      { letter: 'p', count: 1 },
    ]);
    expect(l.missing).toEqual([
      { letter: 'e', count: 1 },
      { letter: 't', count: 2 },
    ]);
    expect(l.match).toBe(false);
  });

  it('matches only when both boxes have the same letters', () => {
    expect(ledger('Dario Amodei', 'I da AI doomer').match).toBe(true);
    expect(ledger('Dormitory', 'dirty room').match).toBe(true);
    expect(ledger('Dormitory', '').match).toBe(false);
    expect(ledger('', '').match).toBe(false);
    expect(ledger('4', '4').match).toBe(false);
    expect(ledger('4', 'four').match).toBe(false);
    expect(ledger('4', '4', { '4': 'drop' }).match).toBe(false);
    expect(ledger('?', '?').match).toBe(false);
  });

  it('ignores apostrophes, hyphens, punctuation, spacing and case in both boxes, and folds accents', () => {
    expect(ledger("It's dormitory", 'Dirty-room, its.').match).toBe(true);
    expect(ledger('Beyoncé', 'obey-NCE').match).toBe(true);
    expect(ledger('Beyonce', 'obey ncé!').match).toBe(true);
  });
});

describe('the verdict line', () => {
  it('says nothing until the anagram has a letter', () => {
    expect(verdict(ledger('Dario Amodei', ''))).toBe('');
    expect(verdict(ledger('Dario Amodei', ' - ?'))).toBe('');
    expect(verdict(ledger('Dario Amodei', ' - 4'))).toBe('');
  });

  it('reads extras then missing letters, one per letter, in the exact form', () => {
    expect(verdict(ledger('patent', 'paapn'))).toBe('1 extra a · 1 extra p · 1 missing e · 2 missing t');
    expect(verdict(ledger('Dario Amodei', 'I da AI doome'))).toBe('1 missing r');
    expect(verdict(ledger('Dario Amodei', 'I da AI doomers'))).toBe('1 extra s');
    expect(verdict(ledger('pat', 'paat'))).toBe('1 extra a');
  });

  it('counts the letters on a match', () => {
    expect(verdict(ledger('Dario Amodei', 'I da AI doomer'))).toBe('All 11 letters used');
    expect(verdict(ledger('A', 'a'))).toBe('All 1 letter used');
  });
});

describe('the letters line', () => {
  it('counts letters and lists what was skipped', () => {
    expect(lettersLine(foldText('Dario Amodei'))).toBe('11 letters');
    expect(lettersLine(foldText('I'))).toBe('1 letter');
    expect(lettersLine(foldText('Route 66 & Ж'))).toBe('5 letters · 4 characters skipped: 66 & Ж');
    expect(lettersLine(foldText('Route 66 & Ж', { '6': 'drop' }))).toBe('5 letters · 4 characters skipped: 6 & Ж');
    expect(lettersLine(foldText('Route 6'))).toBe('5 letters · 1 character skipped: 6');
    // An ordinal's suffix is letters under the literal rule.
    expect(lettersLine(foldText('the 1000th man'))).toBe('8 letters · 4 characters skipped: 1000');
    expect(lettersLine(foldText('   '))).toBe('');
  });
});

describe('the read-back', () => {
  it('marks the letters the text has run out of, counting left to right', () => {
    const marks = readBack('pat', 'pa ta').map((c) => (c.extra ? c.char.toUpperCase() : c.char)).join('');
    expect(marks).toBe('pa tA');
    expect(readBack('Dario Amodei', 'I da AI doomers').filter((c) => c.extra).map((c) => c.char)).toEqual(['s']);
  });

  it('never marks what carries no letter, and marks a folded pair when either letter is extra', () => {
    expect(readBack('dormitory', "dirty-room's").filter((c) => c.extra).map((c) => c.char)).toEqual(['s']);
    expect(readBack('strasse', 'Straße').some((c) => c.extra)).toBe(false);
    expect(readBack('strase', 'Straße').find((c) => c.char === 'ß')?.extra).toBe(true);
  });
});

describe('insertAt', () => {
  it('puts a letter at the caret and moves the caret past it', () => {
    expect(insertAt('i da', 4, 4, 'a')).toEqual({ value: 'i daa', caret: 5 });
    expect(insertAt('i da', 0, 0, 'x')).toEqual({ value: 'xi da', caret: 1 });
  });

  it('replaces a selection, in either direction, and keeps within the text', () => {
    expect(insertAt('dirty room', 6, 10, 'x')).toEqual({ value: 'dirty x', caret: 7 });
    expect(insertAt('dirty room', 10, 6, 'x')).toEqual({ value: 'dirty x', caret: 7 });
    expect(insertAt('ab', 99, 99, 'c')).toEqual({ value: 'abc', caret: 3 });
  });
});
