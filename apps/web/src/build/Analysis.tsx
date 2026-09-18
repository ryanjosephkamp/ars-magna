import type { Tier } from '@ars-magna/engine';

import {
  BAND_LABEL,
  TAG_LABEL,
  letterRows,
  mostUsedLine,
  rarestLine,
  signedScore,
  type Comparison,
  type LetterFigures,
  type LetterRow,
  type WordFigures,
} from '../lib/analysis.ts';
import { countLine, type TextCount } from '../lib/textCount.ts';

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
const FIGURE = 'font-mono text-[13px] tabular-nums text-ink';

const number = (n: number) => n.toLocaleString('en-US');

/** One labelled line: what it is, and the figure, or a sentence where there is none. */
function Figure({ label, prose = false, children }: { label: string; prose?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] items-baseline gap-3 border-b border-rule py-1.5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className={prose ? 'text-sm text-ink-soft' : FIGURE}>{children}</dd>
    </div>
  );
}

/** One side's figures, and whether the dictionary has answered for every word of it. */
export type SideFigures = { letters: LetterFigures; words: WordFigures; known: boolean };

/** The labelled lines each side shows, in order, and what each reads for one side. */
const LINES: readonly { readonly label: string; readonly value: (side: SideFigures) => string }[] = [
  { label: 'Letters', value: (s) => number(s.letters.count) },
  { label: 'Distinct', value: (s) => number(s.letters.distinct) },
  { label: 'Vowels', value: (s) => number(s.letters.vowels) },
  { label: 'Rarest in English', value: (s) => rarestLine(s.letters) },
  { label: 'Most used', value: (s) => mostUsedLine(s.letters) },
  { label: 'Words', value: (s) => number(s.words.count) },
  { label: 'Average length', value: (s) => (s.words.count === 0 ? '—' : s.words.averageLength.toFixed(1)) },
  {
    label: 'Parts of speech',
    value: (s) => {
      if (s.words.count === 0) return '—';
      if (!s.known) return 'Checking…';
      const parts = [...s.words.parts.map((p) => `${p.count} ${TAG_LABEL[p.tag] ?? p.tag}`), ...(s.words.unknown > 0 ? [`${s.words.unknown} unknown`] : [])];
      return parts.join(' · ') || '—';
    },
  },
  {
    label: 'Commonness',
    value: (s) =>
      s.words.count === 0 ? '—' : s.known ? s.words.commonness.map((b) => `${b.count} ${BAND_LABEL[b.band]}`).join(' · ') : 'Checking…',
  },
];

/** A cell's row in the shared grid, from the second breakpoint up; below it the cells flow side by side. */
const row = (n: number) => ({ '--row': n }) as React.CSSProperties;
const AT_ROW = 'sm:[grid-row:var(--row)]';
const COLUMN = ['sm:col-start-2', 'sm:col-start-3'] as const;
const CELL = 'border-b border-rule py-1.5 pr-3';

/**
 * One side of the shared grid: its title, its labelled lines and its letter
 * chart. At desktop width the two sides' cells sit in the same rows, so a line
 * is as tall as its taller half and both charts start level; the labels show
 * once, in the first column. On a phone the sides stack, each with its own.
 */
function Side({ index, title, side, rows, most }: { index: 0 | 1; title: string; side: SideFigures; rows: readonly LetterRow[]; most: number }) {
  const column = COLUMN[index];
  // The first half is 0.75rem wider, for the gap its cells hold; the second has no gap after it.
  const pad = index === 1 ? 'sm:pr-0' : '';
  const first = LINES.length + 2;
  return (
    <>
      <h3 className={`${LABEL} col-span-2 border-b border-rule-strong py-1.5 font-mono sm:col-span-1 sm:row-start-1 ${column} ${index === 1 ? 'mt-8 sm:mt-0' : ''}`}>
        {title}
      </h3>
      <dl className="contents">
        {LINES.map((line, i) => (
          <div key={line.label} className="contents">
            <dt className={`${CELL} text-sm text-ink-soft sm:col-start-1 ${AT_ROW} ${index === 1 ? 'sm:hidden' : ''}`} style={row(i + 2)}>
              {line.label}
            </dt>
            <dd className={`${CELL} ${FIGURE} ${column} ${AT_ROW} ${pad}`} style={row(i + 2)}>
              {line.value(side)}
            </dd>
          </div>
        ))}
      </dl>
      {side.letters.count > 0 && (
        <ul className="contents" aria-label={`How often each letter appears in the ${title.toLowerCase()}`}>
          {rows.map((r, j) => {
            const count = index === 0 ? r.text : r.anagram;
            return (
              <li
                key={r.letter}
                className={`col-span-2 grid grid-cols-[1rem_1fr_1.75rem] items-center gap-2 py-0.5 pr-3 sm:col-span-1 ${column} ${AT_ROW} ${pad} ${j === 0 ? 'mt-3' : ''}`}
                style={row(first + j)}
              >
                <span className={`font-mono text-[11px] ${count === 0 ? 'text-ink-faint' : 'text-ink-soft'}`}>{r.letter}</span>
                <span className="h-px bg-rule">
                  {count > 0 && <span className="block h-px bg-ink-faint" style={{ width: `${(count / most) * 100}%` }} />}
                </span>
                {/* A letter this side lacks reads fainter than one it has, still above 4.5:1. */}
                <span className={`font-mono text-[11px] tabular-nums ${count === 0 ? 'text-ink-faint' : 'text-ink-soft'}`}>{count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

type Props = {
  text: SideFigures;
  anagram: SideFigures;
  /** The two sides against each other; null until both boxes have letters. */
  comparison: Comparison | null;
  tier: Tier;
  /** How many anagrams the text has at `tier`, as far as the count got. */
  count: TextCount;
};

/**
 * What the two boxes hold, in figures: the letters, the words and, for the
 * text alone, how many anagrams the site finds. Everything is type — labelled
 * lines and hairline bars — as PRODUCT.md's line for this page requires.
 */
export function Analysis({ text, anagram, comparison: side, tier, count }: Props) {
  const chart = letterRows(text.letters, anagram.letters);
  return (
    <section aria-labelledby="analysis-title" className="mt-12 border-t border-rule pt-6">
      <h2 id="analysis-title" className={LABEL}>
        Analysis
      </h2>

      {/* The columns fall where the comparison's below them do (8.5rem, a 0.75rem gap, two halves), with
          the gaps inside the cells so a line's rule runs unbroken across both sides. */}
      <div className="mt-4 grid grid-cols-[9.25rem_minmax(0,1fr)] sm:grid-cols-[9.25rem_calc((100%_-_10rem)/2_+_0.75rem)_minmax(0,1fr)]">
        <span aria-hidden="true" className="hidden border-b border-rule-strong sm:col-start-1 sm:row-start-1 sm:block" />
        <Side index={0} title="Text" side={text} rows={chart.rows} most={chart.most} />
        <Side index={1} title="Anagram" side={anagram} rows={chart.rows} most={chart.most} />
      </div>

      <dl className="mt-8">
        <Figure label="Every anagram of the text" prose={count.kind === 'too-long'}>
          {countLine(count, tier)}
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

