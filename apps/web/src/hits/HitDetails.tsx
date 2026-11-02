import { useEffect, useState } from 'react';
import { describeReading } from '@ars-magna/engine';

import { WordDetails, type WordDetail } from '../components/WordDetails.tsx';
import type { Definitions } from '../lib/definitions.ts';
import { countOrderings } from '../lib/orderingCount.ts';
import { termsFrom, writtenTerm } from '../lib/terms.ts';
import { useTerms } from '../state/useTerms.ts';
import { legacyReading } from '../lib/urlState.ts';
import { googleUrl, type PublicHit } from './build.ts';

const LABEL = 'mb-1.5 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase';
const OUT = 'text-ink-soft underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent';

/**
 * What an opened row on Discover shows: what the input is and where to read
 * more about it, what each word means (the sense this anagram reads it in
 * first, when the hit has one), and the other orders the words read in.
 * The definitions are fetched when the row opens, from the same shards the
 * search page reads; the orderings came with the list, ranked when the site was
 * built, so the page never needs the engine.
 */
export function HitDetails({ hit, definitions, id }: { hit: PublicHit; definitions: Definitions; id: string }) {
  const [details, setDetails] = useState<WordDetail[] | null>(null);
  const terms = termsFrom(useTerms());

  useEffect(() => {
    let live = true;
    // A word used twice is explained once. A term that is not a word of the
    // dictionary is not looked up there: its line comes from the class files.
    const words = [...new Set(hit.words)];
    const classOf = (word: string) => hit.classes?.[word];
    void definitions.lookupAll(words.filter((word) => classOf(word) === undefined)).then((infos) => {
      if (!live) return;
      let next = 0;
      setDetails(
        words.map((word) => {
          const sense = hit.senses?.[word];
          const termClass = classOf(word);
          if (termClass !== undefined) {
            const term = terms.get(word);
            return {
              word,
              display: writtenTerm(terms, word),
              spellings: [writtenTerm(terms, word)],
              info: { word, senses: [], provenance: 'attested' as const, forms: [] },
              termClass,
              ...(term ? { term } : {}),
            };
          }
          return { word, spellings: [word], info: infos[next++]!, ...(sense === undefined ? {} : { sense }) };
        }),
      );
    });
    return () => {
      live = false;
    };
  }, [definitions, hit.words, hit.senses, hit.classes, terms]);

  // How the input's digits and symbols were read, in words: the five hits made
  // with a character left out say so, as decision D63 asked.
  const reading = describeReading(hit.input, hit.reading ?? legacyReading(hit.input));
  const count = countOrderings(hit.words);

  return (
    <div id={id} className="settle mt-3 space-y-4 text-sm">
      <div className="space-y-1.5">
        {hit.about && <p className="max-w-prose text-ink">{hit.about}</p>}
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={googleUrl(hit.input)} target="_blank" rel="noopener noreferrer" className={OUT}>
            Search Google
          </a>
          {hit.wikipedia && (
            <a href={hit.wikipedia} target="_blank" rel="noopener noreferrer" className={OUT}>
              Wikipedia
            </a>
          )}
        </p>
      </div>

      {reading.length > 0 && (
        <div>
          <p className={LABEL}>Numbers and symbols</p>
          <p className="font-mono text-xs text-ink-soft">{reading}</p>
        </div>
      )}

      <div>
        <p className={LABEL}>{hit.classes ? 'Words and terms' : 'Words'}</p>
        <WordDetails details={details} />
      </div>

      {hit.orderings.length > 1 && (
        <div>
          <p className={LABEL}>
            {count === Infinity ? 'Many' : count.toLocaleString()} orderings
            {hit.orderings.length < count && ` · first ${hit.orderings.length}`}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {hit.orderings.map((phrase, i) => (
              <li key={phrase} className={`font-display text-base ${i === 0 ? 'text-ink' : 'text-ink-soft'}`}>
                {phrase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
