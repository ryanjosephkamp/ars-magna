import { useState } from 'react';
import { TIERS, type Tier } from '@ars-magna/engine';

import {
  BAND_EDGES,
  BAND_LABEL,
  LETTER_FREQUENCY,
  TAG_LABEL,
  TIER_LABEL,
  letterRows,
  mostUsedLine,
  rarestLine,
  signedScore,
  type Comparison,
  type LetterFigures,
  type LengthRow,
  type LetterRow,
  type WordCommonness,
  type WordFigures,
} from '../lib/analysis.ts';
import { countStep, englishCount, figureWidth, letterFigure, letterName, letterScale, moveFocus } from '../lib/letterChart.ts';
import { addsNone, countNotes, tierLine } from '../lib/textCount.ts';
import { LetterMap } from './LetterMap.tsx';
import type { TierCounts } from '../state/useTextCount.ts';

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
const FIGURE = 'font-mono text-[13px] tabular-nums text-ink';

const number = (n: number) => n.toLocaleString('en-US');

/**
 * A figure that may wrap after each group of digits: a saturated floor runs
 * to some forty digits, far wider than a phone's column, and a comma alone
 * gives the browser no place to break it.
 */
function Breakable({ children }: { children: string }) {
  return children.split(',').map((part, i, all) => (
    <span key={i}>
      {part}
      {i < all.length - 1 && (
        <>
          ,<wbr />
        </>
      )}
    </span>
  ));
}

/** One labelled line: what it is, and the figure, or a sentence where there is none. */
function Figure({ label, prose = false, children }: { label: string; prose?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] items-baseline gap-3 border-b border-rule py-1.5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className={prose ? 'text-sm text-ink-soft' : FIGURE}>{children}</dd>
    </div>
  );
}

/** One side's figures, whether the dictionary has answered for every word of it, and each word's place on the commonness scale. */
export type SideFigures = { letters: LetterFigures; words: WordFigures; known: boolean; commonness: readonly WordCommonness[] };

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
const fillFor = (count: number, most: number): string => STEP_FILL[countStep(count, most)] ?? '';

/**
 * What both letter charts share: their rows, the largest count (which sets
 * each bar's darkness), the scale (counts and English ticks alike), each
 * side's letters, and the room their figures need.
 */
type ChartShape = { rows: readonly LetterRow[]; most: number; scale: number; totals: { text: number; anagram: number }; width: number };

/** The letter the reader has selected, and how to change it; null clears it. */
type Selection = { selected: string | null; onSelect(letter: string | null): void };

/** Where each chart starts in the shared grid, row by row, and how wide the words of the last one run. */
type Layout = { letters: number; lengths: number; words: number; wordWidth: number };

const words = (n: number) => `${number(n)} ${n === 1 ? 'word' : 'words'}`;

/**
 * A bar on its hairline track: `length` is its share of the track, `tick`
 * where English would put the letter, and `dot` a word's place on the
 * commonness scale, with `edges` marking where the bands meet.
 */
function Bar({ length = 0, fill = '', tick = null, dot = null, edges = [] }: { length?: number; fill?: string; tick?: number | null; dot?: number | null; edges?: readonly number[] }) {
  return (
    <span className="relative h-1.5" aria-hidden="true">
      <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
      {edges.map((edge) => (
        <span key={edge} className="absolute -top-px h-2 w-px bg-rule-strong" style={{ left: `${edge * 100}%` }} />
      ))}
      {length > 0 && <span className={`absolute inset-y-0 left-0 rounded-r-[2px] transition-colors duration-150 ${fill}`} style={{ width: `${length * 100}%` }} />}
      {tick !== null && (
        // Taller than the bar and ringed in the ground colour, so it reads over a bar of full ink.
        <span className="absolute -top-[3px] h-3 w-0.5 -translate-x-1/2 bg-ink-soft ring-1 ring-ground" style={{ left: `${Math.min(tick, 1) * 100}%` }} />
      )}
      {dot !== null && <span className="absolute -top-px size-2 -translate-x-1/2 rounded-full bg-ink-soft" style={{ left: `${dot * 100}%` }} />}
    </span>
  );
}

/**
 * A chart's name: beside its first row in the first column at desktop width,
 * where the text's side names it for both, and above the chart on a phone,
 * where each side names only a chart it has.
 */
function Caption({ index, at, own, children }: { index: 0 | 1; at: number; own: boolean; children: React.ReactNode }) {
  const shown = index === 1 ? 'sm:hidden' : own ? '' : 'hidden sm:block';
  return (
    <p className={`${LABEL} col-span-2 mt-6 sm:col-span-1 sm:col-start-1 sm:mt-3 sm:h-6 sm:leading-6 ${AT_ROW} ${shown}`} style={row(at)}>
      {children}
    </p>
  );
}

/**
 * One side's letter chart: a bar per letter either side has, as long as its
 * count and as dark as the ramp makes that count, on the scale both charts
 * share, with a tick where English would put that letter in as many letters.
 * Every bar is a button that selects its letter, and the chart is a vertical
 * toolbar, one Tab stop, with the arrow keys moving within it. A bar's figure
 * (`2 of 5 · 40%`) replaces its count on hover and focus, and stays while its
 * letter is selected, so a phone, which has no hover, shows it.
 */
function LetterChart({
  index,
  title,
  chart,
  first,
  className,
  selected,
  onSelect,
}: { index: 0 | 1; title: string; chart: ChartShape; first: number; className: string } & Selection) {
  const [focused, setFocused] = useState<string | null>(null);
  const letters = chart.rows.map((r) => r.letter);
  const total = index === 0 ? chart.totals.text : chart.totals.anagram;
  // The bar the Tab key lands on: the one last focused, else the selected letter, else the first.
  const stop = [focused, selected].find((l) => l !== null && letters.includes(l)) ?? letters[0];
  return (
    <div role="toolbar" aria-orientation="vertical" aria-label={`Letters of the ${title.toLowerCase()}`} className="contents">
      {chart.rows.map((r, j) => {
        const count = index === 0 ? r.text : r.anagram;
        const on = r.letter === selected;
        const figure = letterFigure(count, total);
        const english = englishCount(r.letter, total, LETTER_FREQUENCY);
        const tone = on ? 'text-accent' : count === 0 ? 'text-ink-faint' : 'text-ink-soft';
        return (
          <button
            key={r.letter}
            type="button"
            aria-pressed={on}
            aria-label={letterName(r.letter, count, total, english)}
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
            <Bar
              length={chart.scale > 0 ? count / chart.scale : 0}
              fill={on ? 'bg-accent' : fillFor(count, chart.most)}
              tick={chart.scale > 0 ? english / chart.scale : null}
            />
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
 * One side's word lengths: a bar per length from the shortest word on either
 * side to the longest, darker for more words, on the scale both sides share.
 */
function LengthChart({ index, title, lengths, first, className }: { index: 0 | 1; title: string; lengths: { rows: readonly LengthRow[]; most: number }; first: number; className: string }) {
  const width = Math.max(...lengths.rows.map((r) => words(Math.max(r.text, r.anagram)).length));
  return (
    <ul className="contents" aria-label={`Word lengths in the ${title.toLowerCase()}`}>
      {lengths.rows.map((r, j) => {
        const n = index === 0 ? r.text : r.anagram;
        return (
          <li
            key={r.length}
            className={`col-span-2 grid h-6 items-center gap-2 font-mono text-[11px] sm:col-span-1 ${className} ${j === 0 ? 'mt-3' : ''}`}
            style={{ ...row(first + j), gridTemplateColumns: `2ch minmax(0, 1fr) ${width}ch` }}
          >
            <span className="sr-only">{`${words(n)} of ${r.length} ${r.length === 1 ? 'letter' : 'letters'}`}</span>
            <span aria-hidden="true" className={`text-right ${n === 0 ? 'text-ink-faint' : 'text-ink-soft'}`}>
              {r.length}
            </span>
            <Bar length={lengths.most > 0 ? n / lengths.most : 0} fill={fillFor(n, lengths.most)} />
            <span aria-hidden="true" className={`whitespace-nowrap tabular-nums ${n === 0 ? 'text-ink-faint' : 'text-ink-soft'}`}>
              {words(n)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * One side's words, each placed on the commonness scale from rare to
 * everyday, with the band it falls in; faint marks show where the bands meet.
 */
function WordChart({ title, side, first, width, className }: { title: string; side: SideFigures; first: number; width: number; className: string }) {
  const columns = { gridTemplateColumns: `${width}ch minmax(0, 1fr) 12ch` };
  if (!side.known) {
    return (
      <p className={`col-span-2 mt-3 h-6 font-mono text-[11px] leading-6 text-ink-soft sm:col-span-1 ${className}`} style={row(first)}>
        Checking…
      </p>
    );
  }
  return (
    <ul className="contents" aria-label={`How common each word of the ${title.toLowerCase()} is`}>
      {side.commonness.map((w, j) => (
        <li
          key={w.word}
          className={`col-span-2 grid min-h-6 items-center gap-2 font-mono text-[11px] sm:col-span-1 ${className} ${j === 0 ? 'mt-3' : ''}`}
          style={{ ...row(first + j), ...columns }}
        >
          <span className="break-all text-ink-soft">{w.word}</span>
          <Bar dot={w.position} edges={BAND_EDGES} />
          <span className={`whitespace-nowrap ${w.band === 'unknown' ? 'text-ink-faint' : 'text-ink-soft'}`}>{BAND_LABEL[w.band]}</span>
        </li>
      ))}
      <li aria-hidden="true" className={`col-span-2 grid h-5 items-start gap-2 font-mono text-[10px] text-ink-faint sm:col-span-1 ${className}`} style={{ ...row(first + side.commonness.length), ...columns }}>
        <span />
        <span className="flex justify-between">
          <span>rare</span>
          <span>everyday</span>
        </span>
      </li>
    </ul>
  );
}

/**
 * One side of the shared grid: its title, its labelled lines and its three
 * charts. At desktop width the two sides' cells sit in the same rows, so a
 * line is as tall as its taller half and the charts start level; the labels
 * and the charts' names show once, in the first column. On a phone the sides
 * stack, each with its own.
 */
function Side({
  index,
  title,
  side,
  chart,
  lengths,
  layout,
  selected,
  onSelect,
}: { index: 0 | 1; title: string; side: SideFigures; chart: ChartShape; lengths: { rows: readonly LengthRow[]; most: number }; layout: Layout } & Selection) {
  const column = COLUMN[index];
  // The first half is 0.75rem wider, for the gap its cells hold; the second has no gap after it.
  const pad = index === 1 ? 'sm:pr-0' : '';
  const cell = `pr-3 ${column} ${AT_ROW} ${pad}`;
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
      {chart.rows.length > 0 && (index === 0 || side.letters.count > 0) && (
        <Caption index={index} at={layout.letters} own={side.letters.count > 0}>
          Each letter
        </Caption>
      )}
      {side.letters.count > 0 && (
        <LetterChart index={index} title={title} chart={chart} first={layout.letters} className={cell} selected={selected} onSelect={onSelect} />
      )}
      {lengths.rows.length > 0 && (index === 0 || side.words.count > 0) && (
        <Caption index={index} at={layout.lengths} own={side.words.count > 0}>
          Word lengths
        </Caption>
      )}
      {side.words.count > 0 && <LengthChart index={index} title={title} lengths={lengths} first={layout.lengths} className={cell} />}
      {lengths.rows.length > 0 && (index === 0 || side.words.count > 0) && (
        <Caption index={index} at={layout.words} own={side.words.count > 0}>
          Each word
        </Caption>
      )}
      {side.words.count > 0 && <WordChart title={title} side={side} first={layout.words} width={layout.wordWidth} className={cell} />}
    </>
  );
}

type Props = {
  text: SideFigures;
  anagram: SideFigures;
  /** The two sides against each other; null until both boxes have letters. */
  comparison: Comparison | null;
  tier: Tier;
  /** How many anagrams the text has in each dictionary, as far as each count got. */
  counts: TierCounts;
  /** The rows both word-length charts share, and their scale. */
  lengths: { rows: readonly LengthRow[]; most: number };
  /** The two boxes as typed, for the letter map. */
  typed: { text: string; anagram: string };
} & Selection;

/**
 * What the two boxes hold, in figures: the letters, the words and, for the
 * text alone, how many anagrams the site finds in each dictionary. Everything
 * is type — labelled lines and thin bars, darker for a larger count — as
 * PRODUCT.md's lines for this page require; the accent marks only the letter
 * the reader selects.
 */
export function Analysis({ text, anagram, comparison: side, tier, counts, lengths, typed, selected, onSelect }: Props) {
  const { rows, most } = letterRows(text.letters, anagram.letters);
  const totals = { text: text.letters.count, anagram: anagram.letters.count };
  const chart = { rows, most, totals, scale: letterScale(rows, totals, LETTER_FREQUENCY), width: figureWidth(rows, totals) };
  const letters = LINES.length + 2;
  const layout: Layout = {
    letters,
    lengths: letters + rows.length,
    words: letters + rows.length + lengths.rows.length,
    wordWidth: Math.min(16, Math.max(4, ...[...text.commonness, ...anagram.commonness].map((w) => w.word.length))),
  };
  const notes = countNotes(counts);
  return (
    <section aria-labelledby="analysis-title" className="mt-12 border-t border-rule pt-6">
      <h2 id="analysis-title" className={LABEL}>
        Analysis
      </h2>

      {/* The columns fall where the comparison's below them do (8.5rem, a 0.75rem gap, two halves), with
          the gaps inside the cells so a line's rule runs unbroken across both sides. */}
      <div className="mt-4 grid grid-cols-[9.25rem_minmax(0,1fr)] sm:grid-cols-[9.25rem_calc((100%_-_10rem)/2_+_0.75rem)_minmax(0,1fr)]">
        <span aria-hidden="true" className="hidden border-b border-rule-strong sm:col-start-1 sm:row-start-1 sm:block" />
        <Side index={0} title="Text" side={text} chart={chart} lengths={lengths} layout={layout} selected={selected} onSelect={onSelect} />
        <Side index={1} title="Anagram" side={anagram} chart={chart} lengths={lengths} layout={layout} selected={selected} onSelect={onSelect} />
      </div>
      {rows.length > 0 && (
        <p className="mt-4 max-w-prose text-xs text-ink-faint print:hidden">
          A tick shows how many of each letter English would use in as many letters. Select a letter to mark it across the page;
          select it again, or press Escape, to clear it.
        </p>
      )}

      <LetterMap text={typed.text} anagram={typed.anagram} selected={selected} onSelect={onSelect} />

      {/* On a phone the label sits above the four lines, so the figures have the width: a saturated floor
          reads `more than` and some forty digits. */}
      <dl className="mt-8">
        <div className="grid grid-cols-1 items-baseline gap-x-3 gap-y-1.5 border-b border-rule py-1.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
          <dt className="text-sm text-ink-soft">Every anagram of the text</dt>
          <dd className="min-w-0">
            <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1">
              {TIERS.map((t) => {
                const line = tierLine(counts[t], addsNone(counts, t));
                const prose = counts[t].kind === 'too-long';
                return (
                  <div key={t} className="contents">
                    <dt className={`text-sm ${t === tier ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                      {TIER_LABEL[t]}
                      {t === tier && <span className="sr-only">, the dictionary chosen</span>}
                    </dt>
                    <dd className={`min-w-0 ${prose ? 'text-sm text-ink-soft' : `${FIGURE} ${t === tier ? '' : 'text-ink-soft'}`}`}>
                      <Breakable>{line}</Breakable>
                    </dd>
                  </div>
                );
              })}
            </dl>
            {notes.length > 0 && <p className="mt-1.5 max-w-prose text-xs text-ink-faint">{notes.join(' ')}</p>}
          </dd>
        </div>
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

