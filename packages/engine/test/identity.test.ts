import { describe, expect, it } from 'vitest';

import { isRespacing, isTextItself, sameWords } from '../src/identity.ts';

describe('the text itself', () => {
  it('knows the text’s own words, in any order', () => {
    expect(sameWords('apple sauce', ['apple', 'sauce'])).toBe(true);
    expect(sameWords('apple sauce', ['sauce', 'apple'])).toBe(true);
    // Capitals, accents and punctuation carry no letters, as the search folds them.
    expect(sameWords('Star Wars', ['wars', 'star'])).toBe(true);
    expect(sameWords('Beyoncé', ['beyonce'])).toBe(true);
    expect(sameWords("it's mine", ['mine', 'its'])).toBe(true);
    // A real anagram is not the same words.
    expect(sameWords('apple sauce', ['cause', 'apple'])).toBe(false);
    expect(sameWords('apple sauce', ['applesauce'])).toBe(false);
    expect(sameWords('listen', ['silent'])).toBe(false);
    expect(sameWords('', [])).toBe(false);
  });

  it('knows a re-spacing: the same letters in the same order, split another way', () => {
    expect(isRespacing(['star', 'wars'], 'starwars')).toBe(true);
    expect(isRespacing(['the', 'god', 'father'], 'thegodfather')).toBe(true);
    expect(isRespacing(['applesauce'], 'applesauce')).toBe(true);
    // The words in the other order still spell the letters when arranged.
    expect(isRespacing(['wars', 'star'], 'starwars')).toBe(true);
    // A rearrangement of the letters is not.
    expect(isRespacing(['cause', 'apple'], 'applesauce')).toBe(false);
    expect(isRespacing(['silent'], 'listen')).toBe(false);
    expect(isRespacing(['star'], 'starwars')).toBe(false);
  });

  it('gives up rather than hanging on a text of many repeated words', () => {
    // Every arrangement fails on the last letter, which is what makes it costly.
    const words = Array.from({ length: 14 }, () => 'ab');
    expect(isRespacing(words, `${'ab'.repeat(13)}ba`)).toBe(false);
  });

  it('is the rule Build and the promotions API share: either shape is the text', () => {
    expect(isTextItself('apple sauce', 'sauce apple')).toBe(true);
    expect(isTextItself('apple sauce', ['applesauce'])).toBe(true);
    expect(isTextItself('Star Wars', 'star wars')).toBe(true);
    expect(isTextItself('The Godfather', ['the', 'god', 'father'])).toBe(true);
    // The anagram anyone wants is not the text.
    expect(isTextItself('apple sauce', 'cause apple')).toBe(false);
    expect(isTextItself('Dormitory', 'dirty room')).toBe(false);
    expect(isTextItself('listen', 'silent')).toBe(false);
    // Nothing typed yet, and letters that do not match, are not the text either.
    expect(isTextItself('apple sauce', '')).toBe(false);
    expect(isTextItself('apple sauce', 'apple')).toBe(false);
  });
});

describe('the text with a number or a symbol in it', () => {
  it('is its own words with the item left out, and a re-spacing of those letters', () => {
    // Under the literal rule the 2s are left out: "2 Fast 2 Furious" has the words fast and furious.
    expect(isTextItself('2 Fast 2 Furious', ['furious', 'fast'])).toBe(true);
    expect(isTextItself('2 Fast 2 Furious', ['furious', 'two', 'fast', 'two'])).toBe(false);
    expect(isTextItself('2 Fast 2 Furious', ['furious', 'fast'], { '2': 'drop' })).toBe(true);
    expect(isTextItself('Area 51', ['area'])).toBe(true);
    expect(isTextItself('Area 51', 'ar ea')).toBe(true);
    expect(sameWords('Blink-182', ['blink'])).toBe(true);
    expect(sameWords('Reacher season 4', ['reacher', 'season'])).toBe(true);
    expect(sameWords('Reacher season 4', ['reacher', 'season'], { '4': 'drop' })).toBe(true);
    expect(sameWords('Reacher season 4', ['reacher', 'season', 'four'])).toBe(false);
  });
});
