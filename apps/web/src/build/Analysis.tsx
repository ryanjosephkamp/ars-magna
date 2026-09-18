import { useState } from 'react';
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
import { countStep, figureWidth, letterFigure, letterName, moveFocus } from '../lib/letterChart.ts';
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

/** The ramp's five steps as whole class names, so the build keeps them; index 0 is a letter with no bar. */
const STEP_FILL = ['', 'bg-count-1', 'bg-count-2', 'bg-count-3', 'bg-count-4', 'bg-count-5'] as const;

/** What both charts share: their rows, their scale and the room their figures need. */
type ChartShape = { rows: readonly LetterRow[]; most: number; width: number };

/** The letter the reader has selected, and how to change it; null clears it. */
type Selection = { selected: string | null; onSelect(letter: string | null): void };

/**
 * One side's letter chart: a bar per letter either side has, as long as its
 * count and as dark as the ramp makes that count, on the scale both charts
 * share. Every bar is a button that selects its letter, and the chart is a
 * vertical toolbar, one Tab stop, with the arrow keys moving within it. A
 * bar's figure (`2 of 5 · 40%`) replaces its count on hover and focus, and
 * stays while its letter is selected, so a phone, which has no hover, shows it.
 */
function LetterChart({
  index,
  title,
  total,
  chart,
  first,
  className,
  selected,
  onSelect,
}: { index: 0 | 1; title: string; total: number; chart: ChartShape; first: number; className: string } & Selection) {
  const [focused, setFocused] = useState<string | null>(null);
  const letters = chart.rows.map((r) => r.letter);
  // The bar the Tab key lands on: the one last focused, else the selected letter, else the first.
  const stop = [focused, selected].find((l) => l !== null && letters.includes(l)) ?? letters[0];
  return (
    <div role="toolbar" aria-orientation="vertical" aria-label={`Letters of the ${title.toLowerCase()}`} className="contents">
      {chart.rows.map((r, j) => {
        const count = index === 0 ? r.text : r.anagram;
        const on = r.letter === selected;
        const figure = letterFigure(count, total);
        const tone = on ? 'text-accent' : count === 0 ? 'text-ink-faint' : 'text-ink-soft';
        return (
          <button
            key={r.letter}
            type="button"
            aria-pressed={on}
            aria-label={letterName(r.letter, count, total)}
            tabIndex={r.letter === stop ? 0 : -1}
            onFocus={() => setFocused(r.letter)}
            onClick={() => onSelect(on ? null : r.letter)}
            onKeyDown={(event) => {
              const to = moveFocus(event.key, j, chart.rows.length);
              if (to === null) return;
              event.preventDefault();
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[to]?.focus();
            }}
            className={`group col-span-2 -ml-1 grid h-6 items-center gap-2 rounded-[2px] pl-1 text-left font-mono text-[11px] transition-colors duration-150 hover:bg-accent-wash sm:col-span-1 ${className} ${j === 0 ? 'mt-3' : ''}`}
            // The figure column holds the longest figure either chart can show, in the mono face's own characters.
            style={{ ...row(first + j), gridTemplateColumns: `1rem minmax(0, 1fr) ${chart.width}ch` }}
          >
            <span className={`${tone} ${on ? 'underline decoration-2 underline-offset-[3px]' : ''}`}>{r.letter}</span>
            <span className="relative h-1.5">
              <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
              {count > 0 && (
                <span
                  className={`absolute inset-y-0 left-0 rounded-r-[2px] transition-colors duration-150 ${on ? 'bg-accent' : STEP_FILL[countStep(count, chart.most)]}`}
                  style={{ width: `${(count / chart.most) * 100}%` }}
                />
              )}
            </span>
            <span className={`whitespace-nowrap tabular-nums ${tone}`}>
              {on ? (
                figure
              ) : (
                <>
                  <span className="group-hover:hidden group-focus-visible:hidden">{count}</span>
                  <span className="hidden group-hover:inline group-focus-visible:inline">{figure}</span>
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * One side of the shared grid: its title, its labelled lines and its letter
 * chart. At desktop width the two sides' cells sit in the same rows, so a line
 * is as tall as its taller half and both charts start level; the labels show
 * once, in the first column. On a phone the sides stack, each with its own.
 */
function Side({ index, title, side, chart, selected, onSelect }: { index: 0 | 1; title: string; side: SideFigures; chart: ChartShape } & Selection) {
  const column = COLUMN[index];
  // The first half is 0.75rem wider, for the gap its cells hold; the second has no gap after it.
  const pad = index === 1 ? 'sm:pr-0' : '';
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
        <LetterChart
          index={index}
          title={title}
          total={side.letters.count}
          chart={chart}
          first={LINES.length + 2}
          className={`pr-3 ${column} ${AT_ROW} ${pad}`}
          selected={selected}
          onSelect={onSelect}
        />
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
} & Selection;

/**
 * What the two boxes hold, in figures: the letters, the words and, for the
 * text alone, how many anagrams the site finds. Everything is type — labelled
 * lines and thin bars, darker for a larger count — as PRODUCT.md's lines for
 * this page require; the accent marks only the letter the reader selects.
 */
export function Analysis({ text, anagram, comparison: side, tier, count, selected, onSelect }: Props) {
  const { rows, most } = letterRows(text.letters, anagram.letters);
  const chart = { rows, most, width: figureWidth(rows, { text: text.letters.count, anagram: anagram.letters.count }) };
  return (
    <section aria-labelledby="analysis-title" className="mt-12 border-t border-rule pt-6">
      <h2 id="analysis-title" className={LABEL}>
        Analysis
      </h2>

      {/* The columns fall where the comparison's below them do (8.5rem, a 0.75rem gap, two halves), with
          the gaps inside the cells so a line's rule runs unbroken across both sides. */}
      <div className="mt-4 grid grid-cols-[9.25rem_minmax(0,1fr)] sm:grid-cols-[9.25rem_calc((100%_-_10rem)/2_+_0.75rem)_minmax(0,1fr)]">
        <span aria-hidden="true" className="hidden border-b border-rule-strong sm:col-start-1 sm:row-start-1 sm:block" />
        <Side index={0} title="Text" side={text} chart={chart} selected={selected} onSelect={onSelect} />
        <Side index={1} title="Anagram" side={anagram} chart={chart} selected={selected} onSelect={onSelect} />
      </div>
      {rows.length > 0 && (
        <p className="mt-3 text-xs text-ink-faint print:hidden">
          Select a letter to mark it across the page; select it again, or press Escape, to clear it.
        </p>
      )}

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

