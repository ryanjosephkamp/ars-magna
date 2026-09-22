import { useEffect, useId, useRef, useState } from 'react';
import {
  TIERS,
  UNLIMITED_WORDS,
  normalizeLetters,
  type ClassName,
  type Query,
  type Tier,
  type DictCounts,
} from '@ars-magna/engine';
import { CLASS_HINT, CLASS_LABEL, inTableOrder, shownClasses } from '../lib/classes.ts';
import { inBoth, inBothSentence } from '../lib/urlState.ts';

const TIER_LABEL: Record<Tier, string> = {
  common: 'Common',
  standard: 'Standard',
  full: 'Full',
  extended: 'Extended',
};

const TIER_HINT: Record<Tier, string> = {
  common: "Everyday words, plus the site's listed contractions.",
  standard: "Every attested word, the list without its machine-derived forms, plus the site's listed contractions.",
  full: "Every word in English OpenList, including rare and machine-derived forms, plus the site's listed contractions.",
  extended: "Every word in English OpenList, plus the site's own additions and its listed contractions.",
};

function compact(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

type Props = {
  query: Query;
  counts: DictCounts | null;
  /** How many terms the dictionary carries in each class, so the control lists the ones it has. */
  termCounts: Readonly<Partial<Record<ClassName, number>>>;
  onChange(patch: Partial<Omit<Query, 'input'>>): void;
  invalidWord: string | null;
};

export function Controls({ query, counts, termCounts, onChange, invalidWord }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
      <TierPicker
        value={query.tier}
        counts={counts}
        onChange={(tier) => onChange({ tier })}
      />

      <ClassPicker
        value={query.classes}
        counts={termCounts}
        onChange={(classes) => onChange({ classes })}
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

      <WordsField
        label="Must include"
        ariaLabel="Must include these words"
        value={query.mustInclude}
        other={query.mustExclude}
        invalid={invalidWord}
        onChange={(words) => onChange({ mustInclude: words })}
      />

      <WordsField
        label="Must exclude"
        ariaLabel="Must exclude these words"
        value={query.mustExclude}
        other={query.mustInclude}
        invalid={null}
        onChange={(words) => onChange({ mustExclude: words })}
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
 * A radiogroup rather than a select: four options the user toggles constantly,
 * and switching costs nothing because all tiers ship in one artifact — one word
 * list and three bitsets over it.
 */
export function TierPicker({
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
        className="flex flex-wrap divide-x divide-rule overflow-hidden rounded-[3px] border
                   border-rule bg-surface"
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

/**
 * The term classes, one checkbox each (decision D63). Words alone is the
 * default, so every box starts empty and a reader turns on what they want:
 * these are not exclusive, so they are checkboxes rather than the Dictionary's
 * radios, in the same frame so the two read as one row of controls. A class
 * the dictionary carries no terms of is not offered; numerals need none, since
 * the engine makes them from the text's own digits. Leet is not here: it is a
 * choice per character, under the field.
 */
export function ClassPicker({
  value,
  counts,
  onChange,
}: {
  value: readonly ClassName[];
  counts: Readonly<Partial<Record<ClassName, number>>>;
  onChange(classes: ClassName[]): void;
}) {
  const shown = shownClasses(counts);
  if (shown.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase" id="terms-label">
        Terms
      </span>
      <div
        role="group"
        aria-labelledby="terms-label"
        className="flex flex-wrap divide-x divide-rule overflow-hidden rounded-[3px] border border-rule bg-surface"
      >
        {shown.map((name) => {
          const on = value.includes(name);
          const count = counts[name] ?? 0;
          return (
            <label
              key={name}
              title={CLASS_HINT[name]}
              className={`flex items-baseline px-3 py-1.5 text-sm transition-colors duration-150 has-[:focus-visible]:outline
                          has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                            on ? 'bg-accent-wash font-medium text-accent' : 'text-ink-soft hover:bg-sunken hover:text-ink'
                          }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange(inTableOrder(on ? value.filter((c) => c !== name) : [...value, name]))}
                className="sr-only"
              />
              {CLASS_LABEL[name]}
              {count > 0 && <span className="ml-1.5 font-mono text-[10px] opacity-60">{compact(count)}</span>}
            </label>
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
 * Must include and Must exclude. Pinning a word is how you steer eleven
 * million results toward the one you want, and excluding one is how you steer
 * them away, so each gets a real field rather than being buried behind a
 * disclosure.
 *
 * A word the other field already holds is refused where it was typed: the
 * field keeps the draft and says why, and the search does not change.
 */
function WordsField({
  label,
  ariaLabel,
  value,
  other,
  invalid,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: readonly string[];
  /** The other field's words. */
  other: readonly string[];
  invalid: string | null;
  onChange(words: string[]): void;
}) {
  const id = useId();
  const joined = value.join(' ');
  const [draft, setDraft] = useState(joined);
  const [refused, setRefused] = useState<string | null>(null);
  const committed = useRef(joined);

  useEffect(() => {
    if (joined !== committed.current) {
      committed.current = joined;
      setDraft(joined);
      setRefused(null);
    }
  }, [joined]);

  // One word, or several separated by spaces or commas: the search keeps every
  // one of them, as Show them under a filter of several words asks it to.
  const commit = (next: string) => {
    const words = next
      .split(/[\s,]+/)
      .map((word) => normalizeLetters(word))
      .filter((word) => word.length > 0);
    const both = inBoth(words, other);
    if (both !== null) {
      setRefused(inBothSentence(both));
      return;
    }
    setRefused(null);
    committed.current = words.join(' ');
    onChange(words);
  };

  const message = refused ?? (invalid !== null && draft.length > 0 ? invalid : null);

  return (
    <Field label={label}>
      <input
        id={id}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setRefused(null);
        }}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit(draft);
          if (event.key === 'Escape') {
            setDraft('');
            commit('');
          }
        }}
        placeholder="a word"
        aria-label={ariaLabel}
        aria-invalid={message !== null}
        aria-describedby={message !== null ? `${id}-error` : undefined}
        autoComplete="off"
        spellCheck={false}
        className={`h-[34px] w-32 rounded-[3px] border bg-surface px-2 text-sm transition-colors
                    duration-150 placeholder:text-ink-faint ${
                      message !== null ? 'border-accent text-accent' : 'border-rule hover:border-rule-strong'
                    }`}
      />
      {message !== null && (
        <span id={`${id}-error`} className="max-w-48 text-xs text-accent">
          {message}
        </span>
      )}
    </Field>
  );
}
