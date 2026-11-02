import { describe, expect, it } from 'vitest';

import { NO_FORMS, displayPhrase, displayRow, displayWord, formsFrom, formsOf } from './forms.ts';

const forms = formsFrom([
  { letters: 'its', form: "it's", shown: false },
  { letters: 'dont', form: "don't", shown: true },
  { letters: 'im', form: "i'm", shown: true },
]);

describe('how a row reads', () => {
  it('shows the form only where it is the only spelling of its letters', () => {
    // `dont` is no word without its apostrophe, so the row reads don't; `its` is a word, and reads its.
    expect(displayWord(forms, 'dont')).toBe("don't");
    expect(displayWord(forms, 'its')).toBe('its');
    // A word with no form, and the other spelling of i'm's letters, read as themselves.
    expect(displayWord(forms, 'sit')).toBe('sit');
    expect(displayWord(forms, 'mi')).toBe('mi');
    expect(displayRow(forms, ['dont', 'sit', 'its'])).toEqual(["don't", 'sit', 'its']);
    expect(displayPhrase(forms, ['im', 'dont'])).toBe("i'm don't");
  });

  it('lists every form that spells a word, for the panel, whether or not a row shows it', () => {
    expect(formsOf(forms, 'its')).toEqual([{ letters: 'its', form: "it's", shown: false }]);
    expect(formsOf(forms, 'dont')).toEqual([{ letters: 'dont', form: "don't", shown: true }]);
    expect(formsOf(forms, 'sit')).toEqual([]);
  });

  it('is the identity before the dictionary is ready', () => {
    expect(displayRow(NO_FORMS, ['dont', 'its'])).toEqual(['dont', 'its']);
  });
});
