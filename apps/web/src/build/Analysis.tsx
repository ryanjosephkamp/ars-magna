import { formatCount, type Tier } from '@ars-magna/engine';

import {
  BAND_LABEL,
  TAG_LABEL,
  TIER_LABEL,
  signedScore,
  type Comparison,
  type LetterFigures,
  type WordFigures,
} from '../lib/analysis.ts';

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
const FIGURE = 'font-mono text-[13px] tabular-nums text-ink';

const number = (n: number) => n.toLocaleString('en-US');

/** One labelled line: what it is, and the figure. */
function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] items-baseline gap-3 border-b border-rule py-1.5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className={FIGURE}>{children}</dd>
    </div>
  );
}

/** Every letter present, with a hairline bar as long as its count. */
function Histogram({ histogram }: { histogram: LetterFigures['histogram'] }) {
  const most = histogram.reduce((top, l) => Math.max(top, l.count), 0);
  if (most === 0) return null;
  return (
    <ul className="mt-3 flex flex-col gap-1" aria-label="How often each letter appears">
      {histogram.map(({ letter, count }) => (
        <li key={letter} className="grid grid-cols-[1rem_1fr_1.75rem] items-center gap-2">
          <span className="font-mono text-[11px] text-ink-soft">{letter}</span>
          <span className="h-px bg-rule">
            <span className="block h-px bg-ink-faint" style={{ width: `${(count / most) * 100}%` }} />
          </span>
          <span className="font-mono text-[11px] tabular-nums text-ink-faint">{count}</span>
        </li>
      ))}
    </ul>
  );
}

function Side({
  title,
  letters,
  words,
  known,
}: {
  title: string;
  letters: LetterFigures;
  words: WordFigures;
  /** False while the dictionary has not answered for every word. */
  known: boolean;
}) {
  const parts = [...words.parts.map((p) => `${p.count} ${TAG_LABEL[p.tag] ?? p.tag}`), ...(words.unknown > 0 ? [`${words.unknown} unknown`] : [])];
  return (
    <div>
      <h3 className={LABEL}>{title}</h3>
      <dl className="mt-2">
        <Figure label="Letters">{number(letters.count)}</Figure>
        <Figure label="Distinct">{number(letters.distinct)}</Figure>
        <Figure label="Vowels">{number(letters.vowels)}</Figure>
        <Figure label="Rarest letter">{letters.rarest ?? '—'}</Figure>
        <Figure label="Words">{number(words.count)}</Figure>
        <Figure label="Average length">{words.count === 0 ? '—' : words.averageLength.toFixed(1)}</Figure>
        <Figure label="Parts of speech">{words.count === 0 ? '—' : known ? (parts.join(' · ') || '—') : 'Checking…'}</Figure>
        <Figure label="Commonness">
          {words.count === 0 ? '—' : known ? words.commonness.map((b) => `${b.count} ${BAND_LABEL[b.band]}`).join(' · ') : 'Checking…'}
        </Figure>
      </dl>
      <Histogram histogram={letters.histogram} />
    </div>
  );
}

/** One side's figures, and whether the dictionary has answered for every word of it. */
export type SideFigures = { letters: LetterFigures; words: WordFigures; known: boolean };

type Props = {
  text: SideFigures;
  anagram: SideFigures;
  /** The two sides against each other; null until both boxes have letters. */
  comparison: Comparison | null;
  tier: Tier;
  /** The engine's count of every anagram the text has at `tier`: a decimal string, `>`-prefixed for a floor; null while counting or when it could not be had. */
  total: string | null;
  /** Set while the count is still running. */
  counting: boolean;
};

/**
 * What the two boxes hold, in figures: the letters, the words and, for the
 * text alone, how many anagrams the site finds. Everything is type — labelled
 * lines and hairline bars — as PRODUCT.md's line for this page requires.
 */
export function Analysis({ text, anagram, comparison: side, tier, total, counting }: Props) {
  return (
    <section aria-labelledby="analysis-title" className="mt-12 border-t border-rule pt-6">
      <h2 id="analysis-title" className={LABEL}>
        Analysis
      </h2>

      <div className="mt-4 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        <Side title="Text" letters={text.letters} words={text.words} known={text.known} />
        <Side title="Anagram" letters={anagram.letters} words={anagram.words} known={anagram.known} />
      </div>

      <dl className="mt-8">
        <Figure label="Every anagram of the text">
          {text.letters.count === 0
            ? '—'
            : counting
              ? 'Counting…'
              : total === null
                ? 'Not counted'
                : `${formatCount(total)} in ${TIER_LABEL[tier]}`}
        </Figure>
      </dl>

      {side && (
        <div className="mt-8">
          <h3 className={LABEL}>Text against anagram</h3>
          <dl className="mt-2">
            <div className="grid grid-cols-[8.5rem_1fr_1fr] items-baseline gap-3 border-b border-rule-strong py-1.5">
              <dt className="text-sm text-ink-soft">&nbsp;</dt>
              <dd className={`${LABEL} font-mono`}>Text</dd>
              <dd className={`${LABEL} font-mono`}>Anagram</dd>
            </div>
            <Pair label="Words" text={number(side.words.text)} anagram={number(side.words.anagram)} />
            {side.parts.map((part) => (
              <Pair key={part.tag} label={TAG_LABEL[part.tag] ?? part.tag} text={number(part.text)} anagram={number(part.anagram)} />
            ))}
            <Pair label="Reads" text={signedScore(side.reads.text)} anagram={signedScore(side.reads.anagram)} />
          </dl>
          <dl className="mt-0">
            <Figure label="Shared words">{side.shared.length === 0 ? 'none' : side.shared.join(' · ')}</Figure>
          </dl>
          <p className="mt-3 max-w-prose text-xs text-ink-faint">
            Reads is the score the engine orders results by: how well each word's part of speech follows the one before it.
          </p>
        </div>
      )}
    </section>
  );
}

function Pair({ label, text, anagram }: { label: string; text: string; anagram: string }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr_1fr] items-baseline gap-3 border-b border-rule py-1.5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className={FIGURE}>{text}</dd>
      <dd className={FIGURE}>{anagram}</dd>
    </div>
  );
}

