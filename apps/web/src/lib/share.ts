/**
 * The texts and links behind the Share actions. Pure: no window, no clipboard,
 * so the wording and the encoding can be tested and the same module serves the
 * result list and the gallery.
 *
 * Two texts. The post is one exact sentence and the link, in the site's own
 * voice: it says the true thing and stops. The card is three lines that read
 * the same pasted anywhere — a post, a message, a note — with one glyph and
 * the one number no other anagram tool can write.
 */
import { normalizeLetters, type Reading } from '@ars-magna/engine';

export type Shareable = {
  /** The text as the reader typed it. */
  input: string;
  /** How its numbers and symbols are read, where that differs from the defaults; the letter count follows it. */
  reading?: Reading;
  /** The anagram, in the order the reader chose. */
  phrase: string;
  /** Where the link goes: the search with this phrase kept, or a hit's page. */
  url: string;
  /** The search's exact count as digits, or null when unknown or a floor. */
  total?: string | null;
};

/** X refuses longer posts; the sentence and a link fit any realistic input. */
export const POST_LIMIT = 280;

/** X counts every link as 23 characters, however long it is. */
const LINK_LENGTH = 23;

/** The post's length as X measures it. */
export function postLength(item: Shareable): number {
  return postText(item).length - item.url.length + LINK_LENGTH;
}

export function postText(item: Shareable): string {
  return `"${item.input.trim()}" rearranges, letter for letter, into "${item.phrase}".\n${item.url}`;
}

function exactCount(total: string | null | undefined): string | null {
  if (!total || !/^\d+$/.test(total) || total === '1') return null;
  return total.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function cardText(item: Shareable): string {
  const letters = normalizeLetters(item.input, item.reading ?? {}).length;
  const words = item.phrase.split(' ').filter((w) => w.length > 0).length;
  const facts = [
    `${letters} ${letters === 1 ? 'letter' : 'letters'}`,
    `${words} ${words === 1 ? 'word' : 'words'}`,
  ];
  const total = exactCount(item.total);
  if (total) facts.push(`one of ${total}`);
  return `${item.input.trim()} → ${item.phrase}\n${facts.join(' · ')}\n${item.url}`;
}

/** A prefilled post on X; the reader sends it, or not. No API, no key. */
export function xPostUrl(text: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

/** The phrase in quotes, so the search is for those words in that order. */
export function googleSearchUrl(phrase: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`"${phrase}"`)}`;
}
