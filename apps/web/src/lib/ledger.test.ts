import { describe, expect, it } from 'vitest';
import { foldText, insertAt, ledger, lettersLine, readBack, verdict } from './ledger.ts';

const tray = (text: string, anagram: string) =>
  Object.fromEntries(ledger(text, anagram).tray.map((l) => [l.letter, [l.have, l.left]]));

describe('foldText', () => {
  it('folds the pool as the search does and lists what it skipped, once each', () => {
    // A digit and a symbol of the set are characters of the text as themselves (the literal rule),
    // so they are counted, not skipped; another script's letter and another symbol are skipped.
    expect(foldText('Beyoncé 4 & 44 Ж')).toEqual({ letters: 'beyonce4&44', skipped: ['Ж'], skippedCount: 1 });
    // A character a reading leaves out is listed once, every occurrence counted.
    expect(foldText('Beyoncé 4 & 44 Ж', { '4': 'drop' })).toEqual({ letters: 'beyonce&', skipped: ['4', 'Ж'], skippedCount: 4 });
    expect(foldText('Beverly Hills 90210 ©')).toEqual({ letters: 'beverlyhills90210', skipped: ['©'], skippedCount: 1 });
    expect(foldText('Ke$ha', { $: 's' })).toEqual({ letters: 'kesha', skipped: [], skippedCount: 0 });
    expect(foldText('Ke$ha')).toEqual({ letters: 'ke$ha', skipped: [], skippedCount: 0 });
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
    // A digit is a character of the text, so an anagram that uses it matches.
    expect(ledger('4', '4').match).toBe(true);
    expect(ledger('4', 'four').match).toBe(false);
    expect(ledger('4', '4', { '4': 'drop' }).match).toBe(false);
    expect(ledger('?', '?').match).toBe(false);
  });

  it('counts the pool, so an anagram has to use the text’s digits and symbols as themselves', () => {
    // Until N5 the ledger counted letters alone: "Blink-182" against "blink" read Yes and offered
    // a Submit that /api/promote refuses. Now the characters are counted like letters.
    const l = ledger('Blink-182', 'blink');
    expect(l.match).toBe(false);
    expect(l.missing).toEqual([
      { letter: '1', count: 1 },
      { letter: '2', count: 1 },
      { letter: '8', count: 1 },
    ]);
    expect(lettersLine(l.text)).toBe('8 characters');
    // The terms of a class use them, and the boxes then match, as the search's own rows do.
    expect(ledger('Blink-182', '1 2 link b8').match).toBe(true);
    expect(ledger('Blink-182', 'blink 182').match).toBe(true);
    expect(ledger('Ke$ha', 'hake').match).toBe(false);
    expect(ledger('AT&T', 'tat &').match).toBe(true);
    // A reading that leaves the item out owes it nothing: the five kept hits' Build links.
    expect(ledger('Reacher season 4', 'as one searcher', { '4': 'drop' }).match).toBe(true);
    expect(ledger('Vishwanath & Sons', 'shows a vast inn h', { '&': 'drop' }).match).toBe(true);
    // A leet reading makes the character a letter, so the anagram spells it as one.
    expect(ledger('Ke$ha', 'shake', { $: 's' }).match).toBe(true);
  });

  it('ignores apostrophes, hyphens, punctuation, spacing and case in both boxes, and folds accents', () => {
    expect(ledger("It's dormitory", 'Dirty-room, its.').match).toBe(true);
    expect(ledger('Beyoncé', 'obey-NCE').match).toBe(true);
    expect(ledger('Beyonce', 'obey ncé!').match).toBe(true);
  });
});

describe('the verdict line', () => {
  it('says nothing until the anagram has a character', () => {
    expect(verdict(ledger('Dario Amodei', ''))).toBe('');
    expect(verdict(ledger('Dario Amodei', ' - ?'))).toBe('');
    // A digit is a character now, so the line speaks for it as it does for a letter.
    expect(verdict(ledger('Dario Amodei', ' - 4'))).toContain('1 extra 4');
  });

  it('reads extras then missing letters, one per letter, in the exact form', () => {
    expect(verdict(ledger('patent', 'paapn'))).toBe('1 extra a · 1 extra p · 1 missing e · 2 missing t');
    expect(verdict(ledger('Dario Amodei', 'I da AI doome'))).toBe('1 missing r');
    expect(verdict(ledger('Dario Amodei', 'I da AI doomers'))).toBe('1 extra s');
    expect(verdict(ledger('pat', 'paat'))).toBe('1 extra a');
  });

  it('counts the characters on a match, and says letters for a text of letters', () => {
    expect(verdict(ledger('Dario Amodei', 'I da AI doomer'))).toBe('All 11 letters used');
    expect(verdict(ledger('A', 'a'))).toBe('All 1 letter used');
    expect(verdict(ledger('Blink-182', '1 2 link b8'))).toBe('All 8 characters used');
    expect(verdict(ledger('Ke$ha', 'hake$'))).toBe('All 5 characters used');
  });

  it('names a digit or a symbol of the text the anagram has not used, as it names a letter', () => {
    expect(verdict(ledger('Blink-182', 'blink'))).toBe('1 missing 1 · 1 missing 2 · 1 missing 8');
    expect(verdict(ledger('Ke$ha', 'hake'))).toBe('1 missing $');
    expect(verdict(ledger('Sardar 2', 'radars'))).toBe('1 missing 2');
    expect(verdict(ledger('Blink-182', 'blinx'))).toBe('1 extra x · 1 missing 1 · 1 missing 2 · 1 missing 8 · 1 missing k');
    expect(verdict(ledger('Blink-182', ''))).toBe('');
    // With the reading leaving the character out, the match is a match.
    expect(verdict(ledger('Reacher season 4', 'as one searcher', { '4': 'drop' }))).toBe('All 13 letters used');
  });
});

describe('the letters line', () => {
  it('counts the pool and lists what was skipped, as the search field does', () => {
    expect(lettersLine(foldText('Dario Amodei'))).toBe('11 letters');
    expect(lettersLine(foldText('I'))).toBe('1 letter');
    expect(lettersLine(foldText('Route 66 & Ж'))).toBe('8 characters · 1 character skipped: Ж');
    expect(lettersLine(foldText('Route 66 & Ж', { '6': 'drop' }))).toBe('6 characters · 3 characters skipped: 6 Ж');
    expect(lettersLine(foldText('Route 6'))).toBe('6 characters');
    // An ordinal's suffix is letters under the literal rule, and its digits are characters.
    expect(lettersLine(foldText('the 1000th man'))).toBe('12 characters');
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

  it('counts a digit or a symbol of the text as itself, and marks one the text does not have', () => {
    expect(readBack('Blink-182', '1 2 link b8').some((c) => c.extra)).toBe(false);
    expect(readBack('Blink-182', 'blink 183').filter((c) => c.extra).map((c) => c.char)).toEqual(['3']);
    // A character the reading leaves out is not the text's to spend.
    expect(readBack('Reacher season 4', 'as one searcher 4', { '4': 'drop' }).filter((c) => c.extra).map((c) => c.char)).toEqual(['4']);
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
