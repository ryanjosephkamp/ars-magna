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
  it('is its own tokens over the pool, or a re-spacing of its characters', () => {
    // Under the literal rule the 2s are characters of the text: its tokens are `2`, `fast`, `2`, `furious`.
    expect(isTextItself('2 Fast 2 Furious', ['furious', '2', 'fast', '2'])).toBe(true);
    expect(isTextItself('2 Fast 2 Furious', ['furious', 'fast'])).toBe(false);
    expect(isTextItself('2 Fast 2 Furious', ['furious', 'two', 'fast', 'two'])).toBe(false);
    // Read with the 2s left out, the text is `fast furious`.
    expect(isTextItself('2 Fast 2 Furious', ['furious', 'fast'], { '2': 'drop' })).toBe(true);
    expect(isTextItself('Area 51', ['area', '51'])).toBe(true);
    expect(isTextItself('Area 51', 'ar ea51')).toBe(true);
    expect(isTextItself('Area 51', ['area'])).toBe(false);
    // Under a leet reading the text is its letters: `kesha`, and `hakes` is not it.
    expect(isTextItself('Ke$ha', ['kesha'], { $: 's' })).toBe(true);
    expect(isTextItself('Ke$ha', ['hakes'], { $: 's' })).toBe(false);
    expect(sameWords('Blink-182', ['blink182'])).toBe(true);
    expect(sameWords('Blink-182', ['blink'])).toBe(false);
    expect(sameWords('Reacher season 4', ['reacher', 'season', '4'])).toBe(true);
    expect(sameWords('Reacher season 4', ['reacher', 'season'], { '4': 'drop' })).toBe(true);
    expect(sameWords('Reacher season 4', ['reacher', 'season'])).toBe(false);
    expect(sameWords('Reacher season 4', ['reacher', 'season', 'four'])).toBe(false);
  });
});
