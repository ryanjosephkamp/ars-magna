import { PROVENANCE_LABEL, shouldExplain, type WordInfo } from '../lib/definitions.ts';

export type WordDetail = {
  readonly word: string;
  /** Every spelling of the anagram class this word belongs to, including itself. */
  readonly spellings: readonly string[];
  readonly info: WordInfo;
};

const POS_LABEL: Record<string, string> = {
  n: 'noun',
  v: 'verb',
  adj: 'adj.',
  adv: 'adv.',
};

/**
 * Per-word detail for an expanded result.
 *
 * Definitions and alternate spellings were separate sections at first, which
 * meant reading a result required stitching two lists back together. They
 * belong to the word, so they are shown on the word.
 */
export function WordDetails({ details }: { details: readonly WordDetail[] | null }) {
  if (details === null) {
    return <p className="font-mono text-xs text-ink-faint">…</p>;
  }

  return (
    <dl className="space-y-2.5">
      {details.map(({ word, spellings, info }) => {
        const others = spellings.filter((s) => s !== word);
        const explain = shouldExplain(info);

        return (
          <div key={word} className="sm:flex sm:gap-3">
            <dt className="font-display shrink-0 text-base text-ink sm:w-32">{word}</dt>
            <dd className="min-w-0 flex-1">
              {info.senses.length > 0 ? (
                <ul className="space-y-0.5">
                  {info.senses.map((sense, i) => (
                    <li key={i} className="text-ink-soft">
                      <span className="font-mono text-[10px] tracking-wide text-ink-faint">
                        {POS_LABEL[sense.pos] ?? sense.pos}
                      </span>{' '}
                      {sense.gloss}
                      {sense.base !== undefined && (
                        <span className="text-ink-faint"> — from {sense.base}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : explain ? (
                <p className="text-ink-faint">{PROVENANCE_LABEL[info.provenance]}</p>
              ) : (
                <p className="text-ink-faint">No definition in WordNet.</p>
              )}

              {others.length > 0 && (
                <p className="mt-0.5 text-ink-faint">
                  same letters as{' '}
                  <span className="font-display text-ink-soft">{others.join(', ')}</span>
                </p>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
