import { describe, expect, it } from 'vitest';
import { DEFAULT_QUERY, type Query } from '@ars-magna/engine';
import {
  AUTO_LOAD_LIMIT,
  containingKey,
  FILTER_COUNT_LIMIT_MS,
  containingLabel,
  containingLine,
  containingQuery,
  filterScope,
  filterWords,
  fitsLetters,
  loadsRest,
  shownAsTyped,
} from './filterScope.ts';

describe('filterScope', () => {
  const base = { filter: 'man', loaded: 250, total: '12345', letters: 'agentlemanxyz', mustInclude: [] as string[], known: ['man'] };

  it('covers everything when there is no filter', () => {
    expect(filterScope({ ...base, filter: '   ' })).toEqual({ kind: 'all' });
  });

  it('asks the engine about dictionary words that fit, however much of the list is loaded', () => {
    expect(filterScope({ ...base, filter: '  Elegant MAN ', known: ['elegant', 'man'] })).toEqual({ kind: 'must-include', words: ['elegant', 'man'], everyLoaded: false });
    // A floor is partial too.
    expect(filterScope({ ...base, total: '>1000000' })).toEqual({ kind: 'must-include', words: ['man'], everyLoaded: false });
    // Every result loaded: still the engine, now with the rows on screen beside it.
    expect(filterScope({ ...base, loaded: 12345 })).toEqual({ kind: 'must-include', words: ['man'], everyLoaded: true });
    // A short list too: it is a question about every result, not about the rows on screen.
    expect(filterScope({ ...base, total: '588', loaded: 250 })).toEqual({ kind: 'must-include', words: ['man'], everyLoaded: false });
  });

  it('keeps a fragment on the rows on screen, every result when they are all loaded', () => {
    expect(filterScope({ ...base, filter: 'ma', known: [] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'ma', known: [], loaded: 12345 })).toEqual({ kind: 'all' });
    expect(filterScope({ ...base, filter: 'dirty ro', known: ['dirty'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: "don't" })).toEqual({ kind: 'loaded' });
    // Not looked up yet: say what is true now.
    expect(filterScope({ ...base, known: null })).toEqual({ kind: 'loaded' });
  });

  it('counts only words the letters hold alongside Must include, and nothing Must include already has', () => {
    expect(filterScope({ ...base, filter: 'zebra', known: ['zebra'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man man', known: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, mustInclude: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man gent', mustInclude: ['man'], known: ['man', 'gent'] })).toEqual({ kind: 'must-include', words: ['gent'], everyLoaded: false });
  });

  it('never counts a word Must exclude has taken out of the dictionary', () => {
    expect(filterScope({ ...base, mustExclude: ['man'] })).toEqual({ kind: 'loaded' });
    expect(filterScope({ ...base, filter: 'man gent', known: ['man', 'gent'], mustExclude: ['gent'] })).toEqual({ kind: 'loaded' });
    // Excluding another word leaves the count as it was.
    expect(filterScope({ ...base, mustExclude: ['gent'] })).toEqual({ kind: 'must-include', words: ['man'], everyLoaded: false });
  });
});

describe('loading the rest of a short list', () => {
  it('loads the rest under the limit, whatever the filter is, so the rows on screen narrow over every result', () => {
    expect(AUTO_LOAD_LIMIT).toBe(5000);
    expect(loadsRest({ filter: 'man', loaded: 250, total: '4999' })).toBe(true);
    expect(loadsRest({ filter: 'dirty ro', loaded: 250, total: '4999' })).toBe(true);
    expect(loadsRest({ filter: 'man', loaded: 250, total: '5000' })).toBe(false);
    expect(loadsRest({ filter: 'man', loaded: 250, total: '5000', limit: 6000 })).toBe(true);
  });

  it('does nothing without a filter, once all are loaded, or for a floor', () => {
    expect(loadsRest({ filter: ' ', loaded: 250, total: '4999' })).toBe(false);
    expect(loadsRest({ filter: 'man', loaded: 4999, total: '4999' })).toBe(false);
    expect(loadsRest({ filter: 'man', loaded: 250, total: '>4000' })).toBe(false);
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
    // Word order is no part of the question.
    expect(containingKey(query, ['apple', 'sauce'])).toBe(containingKey(query, ['sauce', 'apple']));
    expect(containingKey({ ...query, mustInclude: ['sauce'] }, ['apple'])).toBe(containingKey(query, ['apple', 'sauce']));
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

describe('the line while and after the count runs in its own worker', () => {
  const words = ['wheat'];
  const total = '144632962364130';
  it('says it is counting, then gives the figure', () => {
    expect(containingLine({ kind: 'counting' }, total, words)).toBe('Counting which of 144,632,962,364,130 contain “wheat”…');
    expect(containingLine({ kind: 'exact', total: '11' }, '15202', ['shamed'])).toBe('11 of 15,202 contain “shamed”');
    expect(containingLine({ kind: 'exact', total: '0' }, '15202', ['amebiasis'])).toBe('None of 15,202 contain “amebiasis”');
  });

  it('gives the floor it reached when the time ran out', () => {
    expect(containingLine({ kind: 'floor', total: '438623680172' }, total, words)).toBe(
      'more than 438,623,680,172 of 144,632,962,364,130 contain “wheat”',
    );
  });

  it('says the count stopped when the time ran out before it found one', () => {
    expect(FILTER_COUNT_LIMIT_MS).toBe(4_000);
    expect(containingLine({ kind: 'too-long' }, total, words)).toBe(
      'Counting which of 144,632,962,364,130 contain “wheat” stopped after 4 seconds.',
    );
    expect(containingLine({ kind: 'too-long' }, total, ['dirty', 'room'], 1_000)).toBe(
      'Counting which of 144,632,962,364,130 contain “dirty” and “room” stopped after 1 second.',
    );
  });

  it('leaves the line to the loaded rows when the engine could not count', () => {
    expect(containingLine({ kind: 'failed' }, total, words)).toBeNull();
  });
});

describe('the rows on screen beside the count, on a list that is all loaded', () => {
  it('says how many are shown as typed only when that is not the count', () => {
    // "apple sauce": 12 results hold sauce, and every one shows it as cause.
    expect(shownAsTyped({ kind: 'exact', total: '12' }, 0)).toBe('0 shown as typed');
    expect(shownAsTyped({ kind: 'exact', total: '12' }, 12)).toBeNull();
    expect(shownAsTyped({ kind: 'exact', total: '1200' }, 1234)).toBe('1,234 shown as typed');
    expect(shownAsTyped({ kind: 'floor', total: '12' }, 12)).toBe('12 shown as typed');
    expect(shownAsTyped({ kind: 'counting' }, 3)).toBeNull();
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
