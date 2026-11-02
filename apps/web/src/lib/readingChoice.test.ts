import { describe, expect, it } from 'vitest';
import { readItems } from '@ars-magna/engine';

import { LEET, choicesFor, chosenLeet, defaultLeet, leetFor, leetOf, readingOf, valueOf } from './readingChoice.ts';

const item = (input: string, key: string, reading = {}) => readItems(input, reading).find((i) => i.key === key)!;

describe('what a character’s line offers', () => {
  it('offers itself, itself with its letters, each letter, and left out — the middle one on Search alone', () => {
    expect(choicesFor(item('Ke$ha', '$'), true)).toEqual([
      { value: 'self', text: 'as itself' },
      { value: LEET, text: 'as itself or s' },
      { value: 's', text: 'as s' },
      { value: 'drop', text: 'left out' },
    ]);
    // Build checks one anagram, so there is one reading at a time.
    expect(choicesFor(item('Ke$ha', '$'), false).map((c) => c.value)).toEqual(['self', 's', 'drop']);
  });

  it('names both of a character’s letters in the one choice', () => {
    expect(choicesFor(item('Se7en', '7'), true).map((c) => c.text)).toEqual(['as itself', 'as itself, t or v', 'as t', 'as v', 'left out']);
    expect(choicesFor(item('Blink-182', '1'), true)[1]).toEqual({ value: LEET, text: 'as itself, i or l' });
  });

  it('offers no leet choice to a character that has no letter', () => {
    expect(choicesFor(item('AT&T', '&'), true).map((c) => c.value)).toEqual(['self', 'drop']);
  });

  it('shows the reading in force, and the leet choice where the character stands both ways', () => {
    expect(valueOf(item('Ke$ha', '$'), false)).toBe('self');
    expect(valueOf(item('Ke$ha', '$'), true)).toBe(LEET);
    expect(valueOf(item('Ke$ha', '$', { $: 's' }), false)).toBe('s');
    expect(valueOf(item('Reacher season 4', '4', { '4': 'drop' }), false)).toBe('drop');
  });

  it('turns a chosen value back into a reading and a leet choice', () => {
    expect([readingOf('self'), leetOf('self')]).toEqual(['self', false]);
    expect([readingOf(LEET), leetOf(LEET)]).toEqual(['self', true]);
    expect([readingOf('s'), leetOf('s')]).toEqual(['s', false]);
    expect([readingOf('drop'), leetOf('drop')]).toEqual(['drop', false]);
  });
});

describe('which characters are read both ways', () => {
  it('takes the accepted default: the three symbols whose letter is plain, and no digit', () => {
    expect(defaultLeet('Ke$ha')).toEqual(['$']);
    expect(defaultLeet('$h!t')).toEqual(['$', '!']);
    expect(defaultLeet('2 Fast 2 Furious @')).toEqual(['@']);
    expect(defaultLeet('Blink-182')).toEqual([]);
    expect(defaultLeet('AT&T')).toEqual([]);
    expect(defaultLeet('dormitory')).toEqual([]);
  });

  it('leaves a character the reader has already read another way out of it', () => {
    expect(defaultLeet('Ke$ha', { $: 's' })).toEqual([]);
    expect(defaultLeet('Ke$ha', { $: 'drop' })).toEqual([]);
  });

  it('follows the text: a choice is kept by character, and another text takes its own defaults', () => {
    expect(leetFor('Ke$ha', {}, {})).toEqual(['$']);
    expect(leetFor('Ke$ha', {}, { $: false })).toEqual([]);
    expect(leetFor('Blink-182', {}, { '1': true })).toEqual(['1']);
    // The `$` the reader turned off on another text does not turn this one's digits off.
    expect(leetFor('Blink-182', {}, { $: false })).toEqual([]);
  });

  it('reads a link’s own set back as choices, and nothing when it is the text’s default', () => {
    expect(chosenLeet('Ke$ha', {}, ['$'])).toEqual({});
    expect(chosenLeet('Ke$ha', {}, [])).toEqual({ $: false });
    expect(chosenLeet('Blink-182', {}, ['1'])).toEqual({ '1': true, '8': false, '2': false });
    expect(chosenLeet('dormitory', {}, [])).toEqual({});
  });
});
