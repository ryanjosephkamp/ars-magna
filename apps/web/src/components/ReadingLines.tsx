import { readingText, type ReadItem } from '@ars-magna/engine';

type Props = {
  /** The distinct digits and symbols of the text, each with how it stands. */
  items: readonly ReadItem[];
  /** Where the lines sit: the search field's letters line, or Build's text box. */
  className?: string;
};

/**
 * One line per digit or symbol in the text, under the letters line: the
 * character, then how it stands. Under the literal rule nothing is converted:
 * a character is itself by default (`1 as itself`, `$ as itself`), a reader
 * may read one as a letter (`$ as s`) or leave it out (`4 left out`), and the
 * line says which. The control that offers the choice is the site phase's
 * (roadmap N5); here the lines only say.
 */
export function ReadingLines({ items, className = '' }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-1 font-mono text-xs text-ink-faint ${className}`} aria-label="How the digits and symbols stand">
      {items.map((item) => (
        <li key={item.key} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-ink-soft">{item.key}</span>
          <span>{readingText(item.reading)}</span>
        </li>
      ))}
    </ul>
  );
}
