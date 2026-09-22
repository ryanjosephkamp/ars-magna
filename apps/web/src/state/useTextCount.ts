import { useEffect, useRef, useState } from 'react';
import { DEFAULT_QUERY, NO_READING, TIERS, foldWords, type ClassName, type EngineStatus, type Reading, type Tier } from '@ars-magna/engine';

import { nestCounts, nextTier, type TextCount } from '../lib/textCount.ts';
import { CountWorker } from './countWorker.ts';

/** How long the text must stay put before it is counted. */
const DEBOUNCE_MS = 500;

/** How many anagrams the text has in each of the four dictionaries. */
export type TierCounts = Readonly<Record<Tier, TextCount>>;

/**
 * How many anagrams the text has at each dictionary: Build's own number,
 * counted in a worker of its own so the word checks never wait behind it.
 *
 * The four are counted one at a time, the chosen dictionary first, each under
 * the time limit in `textCount.ts`. They nest, so once one stops at the limit
 * the wider ones are not counted at all and read its figure (`nextTier`,
 * `nestCounts`). The worker (`countWorker.ts`, which Search's filter count
 * shares) lives only while it counts: started from the cache the page's own
 * worker filled and closed when the last count ends. The moment the text
 * changes, a count still running is abandoned by closing it, and one that
 * passes the time limit loses its worker to a fresh one for the next.
 * Changing the chosen dictionary counts nothing again: all four are counted,
 * or settled by a narrower one. The term classes the page admits count too, so
 * the figures agree with the checks above them: with shorthand and blends on,
 * "Blink-182" has the anagrams those terms make, not none.
 */
export function useTextCounts(
  input: string,
  letters: string,
  chosen: Tier,
  dictionary: EngineStatus['state'],
  reading: Reading = NO_READING,
  classes: readonly ClassName[] = [],
): TierCounts {
  const [counted, setCounted] = useState<{ key: string; counts: Partial<Record<Tier, TextCount>> } | null>(null);
  const chosenRef = useRef(chosen);
  chosenRef.current = chosen;
  // The text's words, not only its letters: the text itself is never counted, so
  // `applesauce` has one anagram fewer than `apple sauce` though the letters are the same.
  const words = foldWords(input, reading).join(' ');
  // A class changes every figure, so it is part of what was counted.
  const admitted = [...classes].join(',');

  const key = `${admitted}|${words}`;

  useEffect(() => {
    // Started once the page's dictionary has loaded, so it is in the cache.
    if (letters.length === 0 || dictionary !== 'ready') return;
    let live = true;
    const worker = new CountWorker();
    const done: Partial<Record<Tier, TextCount>> = {};
    const record = (tier: Tier, count: TextCount) => {
      done[tier] = count;
      setCounted((prev) => ({ key, counts: { ...(prev?.key === key ? prev.counts : {}), [tier]: count } }));
    };
    const timer = setTimeout(() => {
      void (async () => {
        for (let tier = nextTier(chosenRef.current, done); tier !== null; tier = nextTier(chosenRef.current, done)) {
          const result = await worker.count({ ...DEFAULT_QUERY, input, tier, reading, classes: admitted ? (admitted.split(',') as ClassName[]) : [] });
          // Null only once the text changed and the worker was closed.
          if (!live || result === null) return;
          record(tier, result.count);
        }
        worker.close();
      })();
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
      worker.close();
    };
    // The words and the classes are the key; capitals and punctuation cannot change a count, and every dictionary is counted or settled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, dictionary]);

  if (letters.length === 0) return Object.fromEntries(TIERS.map((tier) => [tier, { kind: 'none' }])) as Record<Tier, TextCount>;
  if (dictionary === 'failed') return Object.fromEntries(TIERS.map((tier) => [tier, { kind: 'failed' }])) as Record<Tier, TextCount>;
  return nestCounts(counted?.key === key ? counted.counts : {});
}
