import { useEffect, useRef, useState } from 'react';
import { ArsMagnaClient, DEFAULT_QUERY, TIERS, foldWords, type EngineStatus, type Tier } from '@ars-magna/engine';

import { climb, nestCounts, nextTier, type TextCount } from '../lib/textCount.ts';

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
 * `nestCounts`). The worker lives only while it counts: a
 * second engine holds its own copy of the dictionary, about 70 MB on a phone
 * and more once a count has run, so it is started from the cache the page's
 * own worker filled and stopped when the last count ends. A count cannot be
 * stopped from inside the engine, so the moment the text changes a count
 * still running is abandoned by stopping its worker, and one that passes the
 * time limit is stopped the same way and a fresh worker takes the next.
 * Changing the chosen dictionary counts nothing again: all four are counted,
 * or settled by a narrower one.
 */
export function useTextCounts(input: string, letters: string, chosen: Tier, dictionary: EngineStatus['state']): TierCounts {
  const [counted, setCounted] = useState<{ key: string; counts: Partial<Record<Tier, TextCount>> } | null>(null);
  const chosenRef = useRef(chosen);
  chosenRef.current = chosen;
  // The text's words, not only its letters: the text itself is never counted, so
  // `applesauce` has one anagram fewer than `apple sauce` though the letters are the same.
  const words = foldWords(input).join(' ');

  useEffect(() => {
    // Started once the page's dictionary has loaded, so it is in the cache.
    if (letters.length === 0 || dictionary !== 'ready') return;
    let live = true;
    let client: ArsMagnaClient | null = null;
    const done: Partial<Record<Tier, TextCount>> = {};
    const record = (tier: Tier, count: TextCount) => {
      done[tier] = count;
      setCounted((prev) => ({ key: words, counts: { ...(prev?.key === words ? prev.counts : {}), [tier]: count } }));
    };
    const timer = setTimeout(() => {
      void (async () => {
        for (let tier = nextTier(chosenRef.current, done); tier !== null; tier = nextTier(chosenRef.current, done)) {
          client ??= await ArsMagnaClient.create('/dict');
          if (!live) return client.terminate();
          if (client.status.state !== 'ready') {
            client.terminate();
            client = null;
            record(tier, { kind: 'failed' });
            continue;
          }
          const running = client;
          const { count, timedOut } = await climb(async (maxNodes) => {
            if (!live) return null;
            try {
              return await running.count({ ...DEFAULT_QUERY, input, tier }, maxNodes);
            } catch {
              return null;
            }
          });
          if (!live) return running.terminate();
          // A rung still running would hold up the next dictionary: its worker goes.
          if (timedOut) {
            running.terminate();
            client = null;
          }
          record(tier, count);
        }
        client?.terminate();
        client = null;
      })();
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
      client?.terminate();
    };
    // The words are the key; capitals and punctuation cannot change a count, and every dictionary is counted or settled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, dictionary]);

  if (letters.length === 0) return Object.fromEntries(TIERS.map((tier) => [tier, { kind: 'none' }])) as Record<Tier, TextCount>;
  if (dictionary === 'failed') return Object.fromEntries(TIERS.map((tier) => [tier, { kind: 'failed' }])) as Record<Tier, TextCount>;
  return nestCounts(counted?.key === words ? counted.counts : {});
}
