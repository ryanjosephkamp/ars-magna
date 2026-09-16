import { useEffect, useId, useRef, useState } from 'react';
import {
  TIERS,
  UNLIMITED_WORDS,
  normalizeLetters,
  type Query,
  type Tier,
  type DictCounts,
} from '@ars-magna/engine';

const TIER_LABEL: Record<Tier, string> = {
  common: 'Common',
  standard: 'Standard',
  full: 'Full',
};

const TIER_HINT: Record<Tier, string> = {
  common: 'Everyday words only.',
  standard: 'Every attested word: the list without its machine-derived forms.',
  full: 'Every word in English OpenList, including rare and machine-derived forms.',
};

function compact(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

type Props = {
  query: Query;
  counts: DictCounts | null;
  onChange(patch: Partial<Omit<Query, 'input'>>): void;
  invalidWord: string | null;
};

export function Controls({ query, counts, onChange, invalidWord }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
      <TierPicker
        value={query.tier}
        counts={counts}
        onChange={(tier) => onChange({ tier })}
      />

      <NumberPicker
        label="Min word length"
        value={query.minWordLen}
        options={[1, 2, 3, 4, 5]}
        format={(v) => `${v}`}
        onChange={(minWordLen) => onChange({ minWordLen })}
      />

      <NumberPicker
        label="Max words"
        value={query.maxWords}
        options={[1, 2, 3, 4, 5, UNLIMITED_WORDS]}
        format={(v) => (v === UNLIMITED_WORDS ? 'Any' : `${v}`)}
        onChange={(maxWords) => onChange({ maxWords })}
      />

      <MustInclude
        value={query.mustInclude[0] ?? ''}
        invalid={invalidWord}
        onChange={(word) => onChange({ mustInclude: word ? [word] : [] })}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * A radiogroup rather than a select: three options the user toggles constantly,
 * and switching costs nothing because all tiers ship in one artifact.
 */
function TierPicker({
  value,
  counts,
  onChange,
}: {
  value: Tier;
  counts: DictCounts | null;
  onChange(tier: Tier): void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase"
        id="tier-label"
      >
        Dictionary
      </span>
      <div
        role="radiogroup"
        aria-labelledby="tier-label"
        className="flex divide-x divide-rule overflow-hidden rounded-[3px] border border-rule bg-surface"
      >
        {TIERS.map((tier) => {
          const active = tier === value;
          return (
            <button
              key={tier}
              type="button"
              role="radio"
              aria-checked={active}
              title={TIER_HINT[tier]}
              onClick={() => onChange(tier)}
              className={`px-3 py-1.5 text-sm transition-colors duration-150 ${
                active
                  ? 'bg-accent-wash font-medium text-accent'
                  : 'text-ink-soft hover:bg-sunken hover:text-ink'
              }`}
            >
              {TIER_LABEL[tier]}
              {counts && (
                <span className="ml-1.5 font-mono text-[10px] opacity-60">
                  {compact(counts[tier])}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberPicker({
  label,
  value,
  options,
  format,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  format(value: number): string;
  onChange(value: number): void;
}) {
  const id = useId();
  return (
    <Field label={label}>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-[34px] rounded-[3px] border border-rule bg-surface px-2 text-sm text-ink
                   transition-colors duration-150 hover:border-rule-strong"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {format(option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * The highest-leverage control on the page: pinning a word is how you steer
 * eleven million results toward the one you want, so it gets a real field
 * rather than being buried behind a disclosure.
 */
function MustInclude({
  value,
  invalid,
  onChange,
}: {
  value: string;
  invalid: string | null;
  onChange(word: string): void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value);
    }
  }, [value]);

  const commit = (next: string) => {
    const cleaned = normalizeLetters(next);
    committed.current = cleaned;
    onChange(cleaned);
  };

  const bad = invalid !== null && draft.length > 0;

  return (
    <Field label="Must include">
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit(draft);
          if (event.key === 'Escape') {
            setDraft('');
            commit('');
          }
        }}
        placeholder="a word"
        aria-label="Must include this word"
        aria-invalid={bad}
        aria-describedby={bad ? `${id}-error` : undefined}
        autoComplete="off"
        spellCheck={false}
        className={`h-[34px] w-32 rounded-[3px] border bg-surface px-2 text-sm transition-colors
                    duration-150 placeholder:text-ink-faint ${
                      bad ? 'border-accent text-accent' : 'border-rule hover:border-rule-strong'
                    }`}
      />
      {bad && (
        <span id={`${id}-error`} className="text-xs text-accent">
          {invalid}
        </span>
      )}
    </Field>
  );
}
