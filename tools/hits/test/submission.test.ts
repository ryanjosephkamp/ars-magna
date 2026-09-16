import { describe, expect, it } from 'vitest';

import { parseIssueForm } from '../src/submission.ts';

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
