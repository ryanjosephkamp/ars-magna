import { useId } from 'react';
import { SORT_LABEL, SORT_MODES, isSortMode, type SortMode } from '../lib/resultView.ts';
import { buildHref } from '../lib/urlState.ts';
import type { ExportFormat } from '../lib/exporters.ts';

const FORMATS: ExportFormat[] = ['txt', 'json', 'csv', 'zip'];

type Props = {
  filter: string;
  onFilterChange(value: string): void;
  sort: SortMode;
  onSortChange(value: SortMode): void;
  /** Rows surviving the filter. */
  shown: number;
  /** Rows currently materialized. */
  loaded: number;
  /** The engine's total, already formatted for display. */
  total: string;
  /** More results exist than are loaded, and loading them all is feasible. */
  canLoadAll: boolean;
  loadingAll: boolean;
  onLoadAll(): void;
  onExport(format: ExportFormat): void;
  exporting: ExportFormat | null;
  /** The text searched, for the link to Build. */
  input: string;
  /**
   * The filter is dictionary words and the list is partial. `label` says how
   * many of every result contain them, as far as the count has got (counting,
   * the figure, a floor, or that it stopped), and is null when the engine
   * could not count; `onShow` switches the list to them through Must include,
   * and is null when none do.
   */
  containing: { label: string | null; onShow: (() => void) | null } | null;
};

/**
 * Filter, sort and export.
 *
 * Filtering and sorting act on what is loaded, not on the whole answer space —
 * there is no sorting eleven million results that were never enumerated. Rather
 * than hide that, the status line states exactly what the operation covered and
 * offers to load the rest when the total is small enough to make that real. A
 * filter that is dictionary words is counted across every result instead, and
 * the line leads with that count (see `lib/filterScope.ts`).
 */
export function ResultToolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  shown,
  loaded,
  total,
  canLoadAll,
  loadingAll,
  onLoadAll,
  onExport,
  exporting,
  containing,
  input,
}: Props) {
  const filterId = useId();
  const sortId = useId();

  const filtering = filter.trim().length > 0;
  const partial = canLoadAll || loadingAll;

  return (
    <div className="border-b border-rule py-3">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label
            htmlFor={filterId}
            className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase"
          >
            Filter
          </label>
          <input
            id={filterId}
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onFilterChange('');
              // Enter asks for what Show them shows, even before the count is in.
              if (event.key === 'Enter') containing?.onShow?.();
            }}
            placeholder="a word or phrase"
            autoComplete="off"
            spellCheck={false}
            className="h-[34px] w-full max-w-56 rounded-[3px] border border-rule bg-surface px-2
                       text-sm transition-colors duration-150 placeholder:text-ink-faint
                       hover:border-rule-strong"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={sortId}
            className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase"
          >
            Sort
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(event) =>
              isSortMode(event.target.value) && onSortChange(event.target.value)
            }
            className="h-[34px] rounded-[3px] border border-rule bg-surface px-2 text-sm text-ink
                       transition-colors duration-150 hover:border-rule-strong"
          >
            {SORT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {SORT_LABEL[mode]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase">
            Export
          </span>
          <div className="flex divide-x divide-rule overflow-hidden rounded-[3px] border border-rule bg-surface">
            {FORMATS.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => onExport(format)}
                disabled={exporting !== null}
                aria-label={`Export as ${format.toUpperCase()}`}
                className="px-2.5 py-1.5 font-mono text-[11px] tracking-wide text-ink-soft
                           uppercase transition-colors duration-150 hover:bg-accent-wash
                           hover:text-accent disabled:opacity-40"
              >
                {exporting === format ? '…' : format}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase">Build</span>
          <a
            href={buildHref(input)}
            className="h-[34px] rounded-[3px] border border-rule bg-surface px-2.5 py-1.5 text-sm text-ink-soft
                       transition-colors duration-150 hover:border-accent hover:bg-accent-wash hover:text-accent"
          >
            Build your own
          </a>
        </div>
      </div>

      <p className="mt-2.5 font-mono text-[11px] text-ink-faint" aria-live="polite">
        {containing?.label ? (
          <>
            {containing.label}
            {containing.onShow && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={containing.onShow}
                  className="text-left underline decoration-rule-strong underline-offset-4 transition-colors
                             duration-150 hover:text-accent hover:decoration-accent"
                >
                  Show them
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {filtering ? (
              <>
                {shown.toLocaleString()} of {loaded.toLocaleString()} loaded match
              </>
            ) : (
              <>{loaded.toLocaleString()} loaded</>
            )}
            {partial && <> · of {total}</>}
            {canLoadAll && !loadingAll && !containing && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={onLoadAll}
                  className="text-left underline decoration-rule-strong underline-offset-4 transition-colors
                             duration-150 hover:text-accent hover:decoration-accent"
                >
                  load all to filter and sort across everything
                </button>
              </>
            )}
            {loadingAll && <> · loading the rest…</>}
          </>
        )}
      </p>
    </div>
  );
}
