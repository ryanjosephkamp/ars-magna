import type { ClassName } from '@ars-magna/engine';

import { CLASS_CHIP, GENERATED_SENTENCE } from '../lib/classes.ts';
import { PROVENANCE_LABEL, shouldExplain, type WordInfo } from '../lib/definitions.ts';
import type { Term } from '../lib/terms.ts';

export type WordDetail = {
  /** The word as the engine knows it: letters, or a term's own characters. */
  readonly word: string;
  /** The word as the row shows it: a listed form (`don't`), a term's capitals (`WTF`), or the word. */
  readonly display?: string;
  /** Every spelling of the anagram class this word belongs to, including itself, as rows show them. */
  readonly spellings: readonly string[];
  readonly info: WordInfo;
  /** The sense the word reads in, in one anagram on Discover; shown before the dictionary's. */
  readonly sense?: string;
  /** The class this term comes from, when it is not a word of the dictionary. */
  readonly termClass?: ClassName;
  /** The class file's line for the term: what it reads as, its gloss and its trace. */
  readonly term?: Term;
  /** The leet reading this word carries, as the line under the field says it: `$ as s`. */
  readonly leetText?: string;
};

/** What a trace's link reads: the site it points at, so a reader knows where they are going. */
function traceLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host.endsWith('wiktionary.org') ? 'Wiktionary' : host;
  } catch {
    return 'Where it comes from';
  }
}

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
      {details.map(({ word, display = word, spellings, info, sense: reading, termClass, term, leetText }) => {
        const others = spellings.filter((s) => s !== display);
        const explain = shouldExplain(info);
        // A listed form under a word the dictionary has of its own (`it's` under
        // `its`), with its meaning. A form that is the row's spelling already
        // (`don't`) has its gloss as the definition above, so it is not repeated.
        const listed = info.forms.filter((f) => f.form !== display);

        return (
          <div key={word} className="sm:flex sm:gap-3">
            <dt
              className={`font-display shrink-0 text-base text-ink sm:w-32 ${
                termClass ? 'underline decoration-dotted decoration-rule-strong underline-offset-4' : ''
              }`}
            >
              {display}
            </dt>
            <dd className="min-w-0 flex-1">
              {/* A term that is not a word of the dictionary: what it stands for,
                  its class, its meaning and where it comes from. The class alone
                  for one the engine makes from the text (a numeral, a name). */}
              {termClass && (
                <>
                  <p className="text-ink">
                    <span className="font-mono text-[10px] tracking-wide text-ink-faint">
                      {CLASS_CHIP[termClass]}
                      {term?.tone === 'crude' ? ' · crude' : ''}
                    </span>
                    {term ? ` ${term.reads}` : ''}
                  </p>
                  {term && <p className="text-ink-soft">{term.gloss}</p>}
                  {!term && GENERATED_SENTENCE[termClass] && <p className="text-ink-faint">{GENERATED_SENTENCE[termClass]}</p>}
                  {term && (
                    <p>
                      <a
                        href={term.trace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-faint underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent"
                      >
                        {traceLabel(term.trace)}
                      </a>
                    </p>
                  )}
                </>
              )}
              {/* A word the reader is shown with a character where its letter went. */}
              {leetText !== undefined && <p className="font-mono text-[11px] text-ink-faint">{leetText}</p>}
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
              ) : explain || termClass ? null : (
                // A term of a class is explained by its own line above; the dictionary has no entry to miss.
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
