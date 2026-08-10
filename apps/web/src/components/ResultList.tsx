import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { Row } from '../state/resultBuffer.ts';

type Props = {
  rows: readonly Row[];
  total: string;
  hasMore: boolean;
  onLoadMore(): void;
  spellings(word: string): Promise<string[]>;
};

/**
 * Virtualized against the window rather than an inner scroll box.
 *
 * A nested scroller inside a page that also scrolls is a bad deal for the one
 * thing users do here — read a long list. It steals wheel events near the
 * boundary, breaks Home/End and find-in-page, and puts two scrollbars on screen.
 * Window virtualization keeps the DOM to a screenful while the page behaves like
 * a page.
 */
export function ResultList({ rows, total, hasMore, onLoadMore, spellings }: Props) {
  const anchor = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  // The virtualizer positions against the document, so it needs to know where
  // the list begins. Measured after layout, and again whenever the header above
  // it can have changed height.
  useLayoutEffect(() => {
    const element = anchor.current;
    if (!element) return;
    const measure = () => setOffsetTop(element.getBoundingClientRect().top + window.scrollY);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 52,
    overscan: 10,
    scrollMargin: offsetTop,
    getItemKey: (index) => index,
  });

  const items = virtualizer.getVirtualItems();
  const last = items.at(-1);

  useEffect(() => {
    if (hasMore && last && last.index >= rows.length - 20) onLoadMore();
  }, [hasMore, last, rows.length, onLoadMore]);

  const toggle = useCallback((index: number) => {
    setExpanded((current) => (current === index ? null : index));
  }, []);

  return (
    <div ref={anchor}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {items.map((item) => {
          const row = rows[item.index];
          if (!row) return null;
          return (
            <div
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={item.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <ResultRow
                row={row}
                index={item.index}
                expanded={expanded === item.index}
                onToggle={toggle}
                spellings={spellings}
              />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <p className="py-5 text-center font-mono text-xs text-ink-faint" aria-live="polite">
          {rows.length.toLocaleString()} of {total} shown
        </p>
      )}
    </div>
  );
}

function ResultRow({
  row,
  index,
  expanded,
  onToggle,
  spellings,
}: {
  row: Row;
  index: number;
  expanded: boolean;
  onToggle(index: number): void;
  spellings(word: string): Promise<string[]>;
}) {
  const [alternates, setAlternates] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    if (!expanded || alternates) return;
    let live = true;
    void Promise.all(row.map((word) => spellings(word))).then((lists) => {
      if (!live) return;
      const map: Record<string, string[]> = {};
      row.forEach((word, i) => {
        map[word] = lists[i] ?? [word];
      });
      setAlternates(map);
    });
    return () => {
      live = false;
    };
  }, [expanded, alternates, row, spellings]);

  // Only ~6% of anagram classes have a second spelling, so this stays quiet
  // until a row is actually opened.
  const extras = alternates
    ? Object.entries(alternates).filter(([, list]) => list.length > 1)
    : [];

  return (
    <div className="border-b border-rule">
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-expanded={expanded}
        className="group flex w-full items-baseline gap-3 py-3 text-left transition-colors
                   duration-150 hover:bg-sunken focus-visible:bg-sunken"
      >
        <span className="w-10 shrink-0 pl-1 font-mono text-[11px] text-ink-faint tabular-nums">
          {index + 1}
        </span>
        <span className="font-display flex-1 text-xl leading-snug text-ink">
          {row.join(' ')}
        </span>
        <span
          className="shrink-0 pr-2 font-mono text-[11px] text-ink-faint opacity-0 transition-opacity
                     duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {row.length} word{row.length === 1 ? '' : 's'}
        </span>
      </button>

      {expanded && (
        <div className="settle pb-4 pl-14 text-sm">
          {alternates === null ? (
            <p className="font-mono text-xs text-ink-faint">…</p>
          ) : extras.length === 0 ? (
            <p className="text-ink-faint">No other spelling uses these letters.</p>
          ) : (
            <dl className="space-y-1">
              {extras.map(([word, list]) => (
                <div key={word} className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="font-display text-ink-soft">{word}</dt>
                  <dd className="font-display text-ink-faint">
                    also {list.filter((w) => w !== word).join(', ')}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
