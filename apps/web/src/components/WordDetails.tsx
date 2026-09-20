import { PROVENANCE_LABEL, shouldExplain, type WordInfo } from '../lib/definitions.ts';

export type WordDetail = {
  /** The word as the engine knows it: letters only. */
  readonly word: string;
  /** The word as the row shows it: a listed form (`don't`) where it is the only spelling of its letters, else the word. */
  readonly display?: string;
  /** Every spelling of the anagram class this word belongs to, including itself, as rows show them. */
  readonly spellings: readonly string[];
  readonly info: WordInfo;
  /** The sense the word reads in, in one anagram on Discover; shown before the dictionary's. */
  readonly sense?: string;
};

const POS_LABEL: Record<string, string> = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  // WordNet carries none of these — they arrive from the curated gloss table,
  // which is the only reason `the`, `of` and `you` have a definition at all.
  det: 'determiner',
  pron: 'pronoun',
  prep: 'preposition',
  conj: 'conjunction',
  interj: 'interjection',
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
      {details.map(({ word, display = word, spellings, info, sense: reading }) => {
        const others = spellings.filter((s) => s !== display);
        const explain = shouldExplain(info);
        // A listed form under a word the dictionary has of its own (`it's` under
        // `its`), with its meaning. A form that is the row's spelling already
        // (`don't`) has its gloss as the definition above, so it is not repeated.
        const listed = info.forms.filter((f) => f.form !== display);

        return (
          <div key={word} className="sm:flex sm:gap-3">
            <dt className="font-display shrink-0 text-base text-ink sm:w-32">{display}</dt>
            <dd className="min-w-0 flex-1">
              {/* The reading this anagram uses, where the dictionary's first
                  sense would not explain it. The dictionary keeps its own order
                  beneath: this is one hit's sense, not the word's. */}
              {reading !== undefined && (
                <p className="text-ink">
                  <span className="font-mono text-[10px] tracking-wide text-ink-faint">In this anagram</span> {reading}
                </p>
              )}
              {info.senses.length > 0 ? (
                <ul className="space-y-0.5">
                  {info.senses.map((sense, i) => (
                    <li key={i} className="text-ink-soft">
                      {/* A site addition's gloss carries no part of speech;
                          `kind` is not one, so there is no chip to show. */}
                      {sense.pos.length > 0 && (
                        <>
                          <span className="font-mono text-[10px] tracking-wide text-ink-faint">
                            {POS_LABEL[sense.pos] ?? sense.pos}
                          </span>{' '}
                        </>
                      )}
                      {sense.gloss}
                      {sense.base !== undefined && (
                        <span className="text-ink-faint"> — from {sense.base}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : explain ? null : (
                <p className="text-ink-faint">No definition found.</p>
              )}

              {/* Usually this stands in place of a definition. For a site
                  addition or form it sits under one: the gloss says what the
                  word means, this says why the dictionary has it. */}
              {explain && <p className="text-ink-faint">{PROVENANCE_LABEL[info.provenance]}</p>}

              {listed.length > 0 && (
                <ul className="mt-0.5 space-y-0.5">
                  {listed.map((f) => (
                    <li key={f.form} className="text-ink-soft">
                      <span className="font-display text-ink">{f.form}</span> {f.gloss}{' '}
                      <span className="text-ink-faint">{PROVENANCE_LABEL.form}</span>
                    </li>
                  ))}
                </ul>
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
