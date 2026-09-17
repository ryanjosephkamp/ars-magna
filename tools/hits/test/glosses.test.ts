/**
 * Each word's first gloss, read off the committed definition shards without
 * the engine: the hint beside a sense in the desk.
 */
import { describe, expect, it } from 'vitest';

import { firstGlosses } from '../src/glosses.ts';

describe('first glosses', () => {
  it('gives the dictionary\'s first gloss, a site addition\'s gloss, and null for a word with none', async () => {
    const glosses = await firstGlosses(['da', 'ai', 'da', 'doomer', 'qzqzq']);
    expect([...glosses.keys()]).toEqual(['da', 'ai', 'doomer', 'qzqzq']);
    expect(glosses.get('da')).toBe('a heavy Burmese knife');
    expect(glosses.get('ai')).toBe('the three-toed sloth of South America');
    expect(glosses.get('doomer')).toMatch(/^A person who believes catastrophe/);
    expect(glosses.get('qzqzq')).toBeNull();
  });
});
