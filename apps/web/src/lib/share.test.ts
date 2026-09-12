import { describe, expect, it } from 'vitest';
import { POST_LIMIT, cardText, googleSearchUrl, postLength, postText, xPostUrl } from './share.ts';

const item = {
  input: 'dormitory',
  phrase: 'dirty room',
  url: 'https://ars-magna.pages.dev/#q=dormitory&p=dirty%20room',
  total: '61',
};

describe('share texts', () => {
  it('writes the post as one exact sentence and the link', () => {
    expect(postText(item)).toBe(
      '"dormitory" rearranges, letter for letter, into "dirty room".\nhttps://ars-magna.pages.dev/#q=dormitory&p=dirty%20room',
    );
  });

  it('writes the card as three lines with the count', () => {
    expect(cardText(item)).toBe(
      'dormitory → dirty room\n9 letters · 2 words · one of 61\nhttps://ars-magna.pages.dev/#q=dormitory&p=dirty%20room',
    );
  });

  it('leaves the count out when it is unknown, a floor, or one', () => {
    expect(cardText({ ...item, total: null })).toContain('9 letters · 2 words\n');
    expect(cardText({ ...item, total: '>5000' })).toContain('9 letters · 2 words\n');
    expect(cardText({ ...item, total: '1' })).toContain('9 letters · 2 words\n');
    expect(cardText({ ...item, total: '6346' })).toContain('one of 6,346');
  });

  it('counts letters the way the engine does, and words by the phrase', () => {
    expect(cardText({ ...item, input: 'Beyonc\u00e9 Knowles', phrase: 'keel boys now cen' })).toContain(
      '14 letters · 4 words',
    );
    expect(cardText({ ...item, input: 'a', phrase: 'a', total: null })).toContain('1 letter · 1 word');
  });

  it('stays under the post limit for a long input', () => {
    const long = {
      input: 'The Right Honourable Alexander Boris de Pfeffel Johnson',
      phrase: 'the fresh bold hero of a pretentious jolly rebel and a jinx',
      url: 'https://ars-magna.pages.dev/#q=The%20Right%20Honourable%20Alexander%20Boris%20de%20Pfeffel%20Johnson&p=the%20fresh%20bold%20hero%20of%20a%20pretentious%20jolly%20rebel%20and%20a%20jinx',
      total: '123456789',
    };
    // X counts a link as 23 characters whatever its length; the sentence is what has to fit.
    expect(postLength(long)).toBeLessThan(POST_LIMIT);
    expect(postLength(item)).toBe(postText(item).length - item.url.length + 23);
  });

  it('quotes and encodes for X and Google', () => {
    expect(googleSearchUrl('dirty room')).toBe('https://www.google.com/search?q=%22dirty%20room%22');
    const url = xPostUrl(postText({ ...item, input: 'Tom & Jerry #1' }));
    expect(url.startsWith('https://x.com/intent/post?text=')).toBe(true);
    expect(url).toContain('%26');
    expect(url).toContain('%23');
    expect(url).not.toContain(' ');
    expect(decodeURIComponent(url.slice(url.indexOf('=') + 1))).toContain('"Tom & Jerry #1" rearranges');
  });
});
