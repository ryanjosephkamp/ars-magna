/**
 * Each word's first gloss, read off the committed definition shards without
 * the engine: the hint beside a sense in the desk.
 */
import { describe, expect, it } from 'vitest';

import { firstGlosses, renderGlossList } from '../src/glosses.ts';

describe('first glosses', () => {
  it('gives the dictionary\'s first gloss, a site addition\'s gloss, and null for a word with none', async () => {
    const glosses = await firstGlosses(['da', 'ai', 'da', 'doomer', 'qzqzq']);
    expect([...glosses.keys()]).toEqual(['da', 'ai', 'doomer', 'qzqzq']);
    expect(glosses.get('da')).toBe('a heavy Burmese knife');
    expect(glosses.get('ai')).toBe('the three-toed sloth of South America');
    expect(glosses.get('doomer')).toMatch(/^A person who believes catastrophe/);
    expect(glosses.get('qzqzq')).toBeNull();
  });

  it('list each hit with its words once, their glosses or no definition, the senses set, and a count', () => {
    const glosses = new Map<string, string | null>([['da', 'a heavy Burmese knife'], ['i', 'the person speaking or writing']]);
    const text = renderGlossList(
      [
        { id: 'darioamodei:people:ai-da-doomer-i', input: 'Dario Amodei', display: 'i da ai doomer', words: ['i', 'da', 'ai', 'doomer'], senses: { da: 'Short for the, as in casual speech.' } },
        { id: 'didi:phrases:di-di', input: 'Didi', display: 'di di', words: ['di', 'di'] },
      ],
      glosses,
    );
    expect(text).toBe(
      [
        'darioamodei:people:ai-da-doomer-i  Dario Amodei → i da ai doomer',
        '  i       the person speaking or writing',
        '  da      a heavy Burmese knife',
        '          sense: Short for the, as in casual speech.',
        '  ai      no definition',
        '  doomer  no definition',
        'didi:phrases:di-di  Didi → di di',
        '  di  no definition',
        '',
        '2 hits, 5 words, 5 distinct (3 with no definition), 1 sense set',
        '',
      ].join('\n'),
    );
  });
});
