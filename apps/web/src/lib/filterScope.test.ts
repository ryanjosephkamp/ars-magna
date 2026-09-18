import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, type Query } from '@ars-magna/engine';
import {
  AUTO_LOAD_LIMIT,
  containingKey,
  containingLabel,
  containingQuery,
  filterScope,
  filterWords,
  fitsLetters,
} from './filterScope.ts';

describe('filterScope', () => {
  const base = { filter: 'man', loaded: 250, total: '12345', letters: 'agentlemanxyz', mustInclude: [] as string[], known: ['man'] };

  it('covers everything when there is no filter or every result is loaded', () => {
    expect(filterScope({ ...base, filter: '   ' })).toEqual({ kind: 'all' });
    expect(filterScope({ ...base, loaded: 12345 })).toEqual({ kind: 'all' });
  });

  it('loads the rest of a list under the limit, whatever the filter is', () => {
    expect(filterScope({ ...base, total: '4999' })).toEqual({ kind: 'load-rest' });
    expect(filterScope({ ...base, total: '4999', filter: 'dirty ro' })).toEqual({ kind: 'load-rest' });
    expect(AUTO_LOAD_LIMIT).toBe(5000);
    expect(filterScope({ ...base, total: '5000' })).toEqual({ kind: 'must-include', words: ['man'] });
    expect(filterScope({ ...base, total: '5000', limit: 6000 })).toEqual({ kind: 'load-rest' });
  });

  it('counts across every result when the filter is dictionary words that fit a partial list', () => {
    expect(filterScope({ ...base, filter: '  Elegant MAN ', known: ['elegant', 'man'] })).toEqual({ kind: 'must-include', words: ['elegant', 'man'] });
    // A floor is partial too.
    expect(filterScope({ ...base, total: '>1000000' })).toEqual({ kind: 'must-include', words: ['man'] });
  });

  it('keeps a fragment on the loaded rows, and says so', () => {
    expect(filterScope({ ...base, filter: 'ma', known: [] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'dirty ro', known: ['dirty'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: "don't" })).toEqual({ kind: 'loaded' });
    // Not looked up yet: say what is true now.
    expect(filterScope({ ...base, known: null })).toEqual({ kind: 'loaded' });
  });

  it('counts only words the letters hold alongside Must include, and nothing Must include already has', () => {
    expect(filterScope({ ...base, filter: 'zebra', known: ['zebra'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man man', known: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, mustInclude: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man gent', mustInclude: ['man'], known: ['man', 'gent'] })).toEqual({ kind: 'must-include', words: ['gent'] });
  });

  it('never counts a word Must exclude has taken out of the dictionary', () => {
    expect(filterScope({ ...base, mustExclude: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man gent', known: ['man', 'gent'], mustExclude: ['gent'] })).toEqual({ kind: 'loaded' });
    // Excluding another word leaves the count as it was.
    expect(filterScope({ ...base, mustExclude: ['gent'] })).toEqual({ kind: 'must-include', words: ['man'] });
  });
});

describe('the count of results containing the filter', () => {
  const query: Query = { ...DEFAULT_QUERY, input: 'Demis Hassabis' };

  it('asks for the search as it stands with the words added to Must include', () => {
    expect(containingQuery(query, ['shamed'])).toEqual({ ...query, mustInclude: ['shamed'] });
    expect(containingQuery({ ...query, mustInclude: ['basis'] }, ['shamed'])).toEqual({ ...query, mustInclude: ['basis', 'shamed'] });
    // The search itself is left as it was.
    expect(query.mustInclude).toEqual([]);
  });

  it('keys an answer to the filter and the search it was asked for', () => {
    const shamed = containingKey(query, ['shamed']);
    expect(containingKey({ ...query }, ['shamed'])).toBe(shamed);
    // A superseded filter, or the same filter over another search, is another question.
    expect(containingKey(query, ['shame'])).not.toBe(shamed);
    expect(containingKey({ ...query, tier: 'full' }, ['shamed'])).not.toBe(shamed);
    expect(containingKey({ ...query, minWordLen: 3 }, ['shamed'])).not.toBe(shamed);
    expect(containingKey({ ...query, maxWords: 3 }, ['shamed'])).not.toBe(shamed);
    expect(containingKey({ ...query, input: 'Demis Hassabi' }, ['shamed'])).not.toBe(shamed);
    expect(containingKey({ ...query, mustExclude: ['ai'] }, ['shamed'])).not.toBe(shamed);
    // Must include and the filter's words are one list: the engine is asked the same question.
    expect(containingKey({ ...query, mustInclude: ['shamed'] }, [])).toBe(shamed);
  });

  it('leads with how many of every result contain the words, exactly', () => {
    expect(containingLabel('11', '15202', ['shamed'])).toBe('11 of 15,202 contain “shamed”');
    expect(containingLabel('1', '15202', ['shamed'])).toBe('1 of 15,202 contains “shamed”');
    expect(containingLabel('1234', '15202', ['dirty', 'room'])).toBe('1,234 of 15,202 contain “dirty” and “room”');
    expect(containingLabel('9', '9000', ['a', 'b', 'c'])).toBe('9 of 9,000 contain “a”, “b” and “c”');
  });

  it('says a true zero in words', () => {
    expect(containingLabel('0', '15202', ['amebiasis'])).toBe('None of 15,202 contain “amebiasis”');
  });

  it('says so when either figure is a floor', () => {
    expect(containingLabel('>5000000', '>90000000', ['moon'])).toBe('more than 5,000,000 of more than 90,000,000 contain “moon”');
    expect(containingLabel('0', '>90000000', ['moon'])).toBe('None of more than 90,000,000 contain “moon”');
  });
});

describe('filter words', () => {
  it('reads a filter as words only when it is letters and spaces', () => {
    expect(filterWords(' Dirty  room ')).toEqual(['dirty', 'room']);
    expect(filterWords('dirty-room')).toBeNull();
    expect(filterWords('')).toBeNull();
  });

  it('counts repeated letters when fitting words', () => {
    expect(fitsLetters('aaeeglmnnt', ['elegant', 'man'])).toBe(true);
    expect(fitsLetters('aaeeglmnnt', ['man', 'man'])).toBe(false);
  });
});
