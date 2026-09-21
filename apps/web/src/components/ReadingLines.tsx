import { LEFT_OUT, type ReadItem } from '@ars-magna/engine';

type Props = {
  /** The distinct numbers and symbols of the text, each with how it stands. */
  items: readonly ReadItem[];
  /** Where the lines sit: the search field's letters line, or Build's text box. */
  className?: string;
};

/**
 * One line per number or symbol in the text, under the letters line: the item,
 * then how it stands. Under the literal rule nothing is converted, and until
 * the literal phase counts digits and symbols as characters of the pool every
 * item is left out, so the line reads `182 left out`, `$ left out`. The
 * literal phase turns the reading into a control again (`$ as itself`, `$ as
 * s`).
 */
export function ReadingLines({ items, className = '' }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-1 font-mono text-xs text-ink-faint ${className}`} aria-label="How the numbers and symbols stand">
      {items.map((item) => (
        <li key={item.key} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-ink-soft">{item.key}</span>
          <span>{item.offered.find((o) => o.name === item.reading)?.text ?? LEFT_OUT}</span>
        </li>
      ))}
    </ul>
  );
}
