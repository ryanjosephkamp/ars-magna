/**
 * Exporting a result set.
 *
 * The honest problem here is size. A query can have eleven million answers, and
 * writing them all would be gigabytes the browser cannot hold — so every export
 * is capped, and every format says so *in the file itself* rather than only in
 * the interface that produced it. A file that has been emailed on has left its
 * context behind; if it is a partial list it needs to carry that fact with it.
 *
 * TXT is the exception: it was asked for as one anagram per line, so it stays
 * pure data with no header. Its truncation is disclosed at the point of
 * download instead.
 */
import { formatCount, type Query, type Tier } from '@ars-magna/engine';
import { TIERS } from '@ars-magna/engine';

import {
  BAND_LABEL,
  LETTER_FREQUENCY,
  TAG_LABEL,
  TIER_LABEL,
  letterRows,
  mostUsedLine,
  rarestLine,
  signedScore,
  type Comparison,
  type LengthRow,
  type LetterFigures,
  type WordCommonness,
  type WordFigures,
} from './analysis.ts';
import { englishCount, englishFigure } from './letterChart.ts';
import { createZip } from './zip.ts';

/** Ceiling on rows in any export. ~100k lines is a 2–3 MB text file. */
export const EXPORT_LIMIT = 100_000;

export type ExportFormat = 'txt' | 'json' | 'csv' | 'zip';

export type ExportInput = {
  readonly query: Query;
  readonly letters: string;
  /** The engine's reported total; a `>` prefix means it is itself a floor. */
  readonly total: string;
  readonly rows: readonly (readonly string[])[];
  readonly generatedAt: Date;
};

const SOURCE = 'https://huggingface.co/datasets/ryanjosephkamp/english-openlist';

function isComplete({ total, rows }: ExportInput): boolean {
  if (total.startsWith('>')) return false;
  return rows.length >= Number(total);
}

function metadata(input: ExportInput) {
  const { query, letters, total, rows, generatedAt } = input;
  return {
    input: query.input,
    // The sorted alphagram, not the normalized input. It is what actually
    // identifies the letter set — every anagram in the file shares it, and two
    // exports with the same value are answers to the same question.
    letters: [...letters].sort().join(''),
    total: total.replace('>', ''),
    totalIsFloor: total.startsWith('>'),
    exported: rows.length,
    complete: isComplete(input),
    filters: {
      dictionary: query.tier,
      minWordLength: query.minWordLen,
      maxWords: query.maxWords >= 64 ? null : query.maxWords,
      mustInclude: [...query.mustInclude],
      mustExclude: [...query.mustExclude],
    },
    generatedAt: generatedAt.toISOString(),
    generatedBy: 'Ars Magna',
    dictionary: SOURCE,
  };
}

/** One anagram per line, nothing else. */
export function toTxt(input: ExportInput): string {
  return `${input.rows.map((row) => row.join(' ')).join('\n')}\n`;
}

/**
 * Words are kept as an array rather than flattened to a string: where the
 * spaces fall is the entire point of an anagram, and a consumer that wants the
 * phrase can join it, while one that wants the words cannot reliably split it.
 */
export function toJson(input: ExportInput): string {
  return `${JSON.stringify({ ...metadata(input), anagrams: input.rows }, null, 2)}\n`;
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Columns chosen for what someone actually does with this in a spreadsheet:
 * sort by how many words an answer uses, or find the ones built around one
 * long word.
 */
export function toCsv(input: ExportInput): string {
  const meta = metadata(input);
  const lines: string[] = [];

  // A leading comment row keeps the provenance attached without disturbing the
  // header row that every spreadsheet expects to find at the top of the data.
  lines.push(
    `# Ars Magna — anagrams of ${csvCell(meta.input)} · ${meta.exported} of ${
      meta.totalIsFloor ? `more than ${meta.total}` : meta.total
    }${meta.complete ? '' : ' (partial)'} · ${meta.generatedAt}`,
  );
  lines.push('anagram,word_count,longest_word');

  for (const row of input.rows) {
    const longest = row.reduce((best, word) => (word.length > best.length ? word : best), '');
    lines.push([csvCell(row.join(' ')), String(row.length), csvCell(longest)].join(','));
  }

  return `${lines.join('\n')}\n`;
}

export function fileStem(query: Query): string {
  const slug = query.input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `ars-magna-${slug.length > 0 ? slug : 'anagrams'}`;
}

const README = (input: ExportInput) => {
  const meta = metadata(input);
  return `Ars Magna — anagrams of "${meta.input}"

${meta.exported.toLocaleString()} of ${
    meta.totalIsFloor ? `more than ${Number(meta.total).toLocaleString()}` : Number(meta.total).toLocaleString()
  } anagrams${meta.complete ? '' : ' (this is a partial list)'}

Letters       ${meta.letters}
Dictionary    ${meta.filters.dictionary}
Min word len  ${meta.filters.minWordLength}
Max words     ${meta.filters.maxWords ?? 'any'}
Must include  ${meta.filters.mustInclude.join(', ') || '—'}
Must exclude  ${meta.filters.mustExclude.join(', ') || '—'}
Generated     ${meta.generatedAt}

anagrams.txt   one anagram per line
anagrams.json  the same list plus this metadata, words kept as arrays
anagrams.csv   spreadsheet-friendly, with word count and longest word

Word validity comes from English OpenList:
${SOURCE}
`;
};

export function buildBlob(format: ExportFormat, input: ExportInput): Blob {
  switch (format) {
    case 'txt':
      return new Blob([toTxt(input)], { type: 'text/plain;charset=utf-8' });
    case 'json':
      return new Blob([toJson(input)], { type: 'application/json;charset=utf-8' });
    case 'csv':
      return new Blob([toCsv(input)], { type: 'text/csv;charset=utf-8' });
    case 'zip':
      return createZip(
        [
          { name: 'README.txt', content: README(input) },
          { name: 'anagrams.txt', content: toTxt(input) },
          { name: 'anagrams.json', content: toJson(input) },
          { name: 'anagrams.csv', content: toCsv(input) },
        ],
        input.generatedAt,
      );
  }
}

// ------------------------------------------------------------------- Build

/** What the Build page exports: the two boxes, the checks and every figure of the analysis. */
export type BuildReport = {
  readonly text: string;
  readonly anagram: string;
  readonly tier: Tier;
  /** Exactly what the two check lines read. */
  readonly checks: { readonly lettersMatch: string; readonly wordsKnown: string };
  readonly verdict: string;
  readonly letters: { readonly text: LetterFigures; readonly anagram: LetterFigures };
  readonly words: { readonly text: WordFigures; readonly anagram: WordFigures };
  /** The characters each box carried that no letter came of.  */
  readonly skipped: { readonly text: readonly string[]; readonly anagram: readonly string[] };
  /** The two sides against each other, once both boxes have letters. */
  readonly comparison: Comparison | null;
  /** The engine's count of every anagram of the text at `tier`; a `>` prefix is a floor. Null when it was not had. */
  readonly total: string | null;
  /** What the page said instead of a figure, when the text was too long to count; null otherwise. */
  readonly countNote: string | null;
  /** How many words of each length each side has, from the shortest to the longest either has. */
  readonly wordLengths: readonly LengthRow[];
  /** Each side's distinct words on the commonness scale. */
  readonly commonness: { readonly text: readonly WordCommonness[]; readonly anagram: readonly WordCommonness[] };
  /** Every anagram of the text in each dictionary, in the engine's form (`>` for a floor), null where there is no figure. */
  readonly byDictionary: Readonly<Record<Tier, string | null>>;
  /** The sentence the page shows when a count stopped at its time limit; null otherwise. */
  readonly byDictionaryNote: string | null;
  readonly generatedAt: Date;
};

/** Labels in one column wide enough for the longest, `Rarest in English`, with room to spare. */
const pad = (label: string, value: string): string => `${label.padEnd(20)}${value}`;

const parts = (figures: WordFigures): string =>
  [...figures.parts.map((p) => `${p.count} ${TAG_LABEL[p.tag]}`), ...(figures.unknown > 0 ? [`${figures.unknown} unknown`] : [])].join(' · ') ||
  '—';

const commonness = (figures: WordFigures): string =>
  figures.commonness.map((b) => `${b.count} ${BAND_LABEL[b.band]}`).join(' · ') || '—';

/** Each letter either side has, with this side's count and what English would put in as many letters. */
function english(report: BuildReport, which: 'text' | 'anagram'): { letter: string; count: number; expected: number }[] {
  const total = report.letters[which].count;
  if (total === 0) return [];
  return letterRows(report.letters.text, report.letters.anagram).rows.map((r) => ({
    letter: r.letter,
    count: r[which],
    expected: Math.round(englishCount(r.letter, total, LETTER_FREQUENCY) * 10) / 10,
  }));
}

function side(report: BuildReport, which: 'text' | 'anagram'): string[] {
  const letters = report.letters[which];
  const words = report.words[which];
  const skipped = report.skipped[which];
  const lengths = report.wordLengths.filter((r) => r[which] > 0);
  return [
    which === 'text' ? 'TEXT' : 'ANAGRAM',
    pad('Letters', String(letters.count)),
    pad('Distinct', String(letters.distinct)),
    pad('Vowels', String(letters.vowels)),
    pad('Rarest in English', rarestLine(letters)),
    pad('Most used', mostUsedLine(letters)),
    pad('Each letter', letters.histogram.map((l) => `${l.letter} ${l.count}`).join(' · ') || '—'),
    pad('Against English', english(report, which).map((e) => `${e.letter} ${e.count} / ${englishFigure(e.expected)}`).join(' · ') || '—'),
    pad('Words', String(words.count)),
    pad('Average length', words.count === 0 ? '—' : words.averageLength.toFixed(1)),
    pad('Word lengths', lengths.map((r) => `${r.length} ${r.length === 1 ? 'letter' : 'letters'}: ${r[which]}`).join(' · ') || '—'),
    pad('Parts of speech', parts(words)),
    pad('Commonness', commonness(words)),
    pad('Each word', report.commonness[which].map((w) => `${w.word} ${BAND_LABEL[w.band]}`).join(' · ') || '—'),
    ...(skipped.length > 0 ? [pad('Skipped', skipped.join(' '))] : []),
  ];
}

/** The analysis as a page of plain text, in the order the page shows it. */
export function buildTxt(report: BuildReport): string {
  const lines: string[] = [
    'Ars Magna — Build',
    '',
    pad('Text', report.text.trim() || '—'),
    pad('Anagram', report.anagram.trim() || '—'),
    pad('Dictionary', TIER_LABEL[report.tier]),
    '',
    pad('Letters match', report.checks.lettersMatch),
    pad('Words known', report.checks.wordsKnown),
    ...(report.verdict ? [pad('Letters', report.verdict)] : []),
    '',
    ...side(report, 'text'),
    '',
    ...side(report, 'anagram'),
    '',
    pad(
      'Every anagram',
      report.total === null ? (report.countNote ?? '—') : `${formatCount(report.total)} in ${TIER_LABEL[report.tier]}`,
    ),
    pad(
      'By dictionary',
      TIERS.map((t) => {
        const total = report.byDictionary[t];
        return `${TIER_LABEL[t]} ${total === null ? '—' : formatCount(total)}`;
      }).join(' · '),
    ),
    ...(report.byDictionaryNote ? [pad('', report.byDictionaryNote)] : []),
  ];
  if (report.comparison) {
    const c = report.comparison;
    lines.push(
      '',
      'TEXT AGAINST ANAGRAM',
      pad('Words', `${c.words.text} / ${c.words.anagram}`),
      ...c.parts.map((p) => pad(TAG_LABEL[p.tag], `${p.text} / ${p.anagram}`)),
      pad('Reads', `${signedScore(c.reads.text)} / ${signedScore(c.reads.anagram)}`),
      pad('Shared words', c.shared.join(' · ') || 'none'),
    );
  }
  lines.push('', `Generated ${report.generatedAt.toISOString()} by Ars Magna`, `Dictionary: ${SOURCE}`);
  return `${lines.join('\n')}\n`;
}

/** The same figures as data, for a reader who wants to work with them. */
export function buildJson(report: BuildReport): string {
  const { generatedAt, ...rest } = report;
  return `${JSON.stringify(
    {
      ...rest,
      total: report.total === null ? null : report.total.replace('>', ''),
      totalIsFloor: report.total !== null && report.total.startsWith('>'),
      byDictionary: Object.fromEntries(
        TIERS.map((t) => {
          const total = report.byDictionary[t];
          return [t, total === null ? null : { total: total.replace('>', ''), isFloor: total.startsWith('>') }];
        }),
      ),
      english: { text: english(report, 'text'), anagram: english(report, 'anagram') },
      generatedAt: generatedAt.toISOString(),
      generatedBy: 'Ars Magna',
      dictionary: SOURCE,
    },
    null,
    2,
  )}\n`;
}

/** `ars-magna-build-dormitory`, from the text. */
export function buildFileStem(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `ars-magna-build${slug.length > 0 ? `-${slug}` : ''}`;
}

/** Hand a blob to the browser as a download and let go of the object URL. */
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers; one turn of
  // the event loop is enough for it to have been claimed.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
