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
import type { Query } from '@ars-magna/engine';
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
