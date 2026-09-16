import { describe, expect, it } from 'vitest';

import { missingWord, parseIssueForm, refusal, type Submission } from '../src/submission.ts';

const body = `### Input

Dormitory

### Category

phrases

### Anagram

Dirty  Room

### Dictionary tier

common

### Why it is good

The one everyone knows.

### Credit

_No response_
`;

describe('parseIssueForm', () => {
  it('reads the rendered form, folding the words and blanking optional fields', () => {
    expect(parseIssueForm(body)).toEqual({
      input: 'Dormitory',
      category: 'phrases',
      words: ['dirty', 'room'],
      tier: 'common',
      why: 'The one everyone knows.',
      credit: '',
    });
  });

  it('names what is missing or wrong', () => {
    expect(parseIssueForm('### Input\n\n\n### Category\n\nphrases\n### Anagram\n\nx')).toEqual({ error: 'the Input field is empty' });
    expect(parseIssueForm(body.replace('phrases', 'celebrities'))).toEqual({ error: 'unknown category "celebrities"' });
    expect(parseIssueForm(body.replace('Dirty  Room', '123'))).toEqual({ error: 'the Anagram field has no letters' });
    expect((parseIssueForm(body.replace('common', 'whatever')) as { tier: string }).tier).toBe('standard');
    // Extended is a real tier now, so the form must carry it through rather
    // than quietly checking the submission against the default dictionary.
    expect((parseIssueForm(body.replace('common', 'extended')) as { tier: string }).tier).toBe('extended');
  });
});

describe('why a submission was refused', () => {
  const sub = (tier: Submission['tier'] = 'common'): Submission => ({
    input: 'Dario Amodei',
    category: 'people',
    words: ['i', 'da', 'ai', 'doomer'],
    tier,
    why: '',
    credit: '',
  });

  it('names the word a refusal is about, and nothing when it names none', () => {
    expect(missingWord('no: "doomer" is not in the common dictionary')).toBe('doomer');
    expect(missingWord('no: the letters differ (a vs b)')).toBeNull();
  });

  it('calls it the author\'s mistake only when the letters differ', () => {
    expect(refusal(sub(), 'no: the letters differ (x vs y)', () => ({ ok: false, message: '' }))).toEqual({ kind: 'letters' });
  });

  it('points at the wider tier when the word is simply in one', () => {
    // Missing from Common, present at Full: a dropdown away, not a word request.
    const check = (s: Submission) => ({ ok: s.tier === 'full' || s.tier === 'extended', message: 'no: "doomer" is not in the standard dictionary' });
    expect(refusal(sub(), 'no: "doomer" is not in the common dictionary', check)).toEqual({
      kind: 'tier',
      word: 'doomer',
      wider: 'full',
    });
  });

  it('calls it a word request when no tier has the word', () => {
    const check = () => ({ ok: false, message: 'no: "doomer" is not in the extended dictionary' });
    expect(refusal(sub(), 'no: "doomer" is not in the common dictionary', check)).toEqual({
      kind: 'vocabulary',
      word: 'doomer',
    });
  });

  it('keeps reporting the word it was asked about when a wider tier trips on another', () => {
    // Widening reveals a second missing word. The first is still the one the
    // author was told about, so do not silently switch to the second.
    const check = () => ({ ok: false, message: 'no: "zzz" is not in the standard dictionary' });
    expect(refusal(sub(), 'no: "doomer" is not in the common dictionary', check)).toEqual({
      kind: 'vocabulary',
      word: 'doomer',
    });
  });
});
