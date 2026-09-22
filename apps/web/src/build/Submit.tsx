import { useEffect, useId, useState } from 'react';
import type { ClassName } from '@ars-magna/engine';

import { SECTIONS, type PublicHit } from '../hits/build.ts';
import { submissionTier, wordRequestSentence, wordRequests, type StandingOf, type TierOf } from '../lib/checks.ts';
import { ActionProblem, type Pass } from '../state/usePass.ts';
import { useBlocked } from '../state/usePublishedHits.ts';
import type { PromotionsBody } from '../votes/api.ts';
import {
  CATEGORIES,
  MAX_CREDIT,
  MAX_TYPED_LETTERS,
  MAX_WHY,
  aboutProblem,
  promotionKey,
  sortedLetters,
  tidyNote,
  type Category,
} from '../votes/core.ts';

const CATEGORY_LABEL: Record<Category, string> = {
  people: 'People',
  companies: 'Companies',
  products: 'Products',
  titles: 'Titles',
  places: 'Places',
  phrases: 'Phrases',
};

const GENERIC = 'Your submission did not save. Try again.';

function sentenceFor(error: unknown): string {
  if (!(error instanceof ActionProblem)) return GENERIC;
  if (error.code === 'check-timed-out') return 'The check before submitting did not finish, so your submission did not save. Try again.';
  if (error.code === 'check-failed') return 'The check before submitting did not pass. Try again.';
  return error.serverMessage ?? GENERIC;
}

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
const FIELD =
  'w-full rounded-[3px] border border-rule bg-surface px-2 py-1.5 text-sm text-ink transition-colors duration-150 placeholder:text-ink-faint hover:border-rule-strong';

type Props = {
  /** The text as typed. */
  text: string;
  /** How its digits and symbols are read, every distinct one, or null for a text without any. */
  reading: Record<string, string> | null;
  /** The anagram's words, folded, in the order typed. */
  words: readonly string[];
  /** The class of each term that is not a word of the dictionary, keyed by the term. */
  classes: Readonly<Record<string, ClassName>>;
  /** How many characters the text has. */
  letters: number;
  tierOf: TierOf;
  standingOf: StandingOf;
  /** Every term's tier and class have been looked up. */
  checked: boolean;
  /** The published hits, once loaded. */
  published: readonly PublicHit[] | null;
  pass: Pass;
};

/**
 * Submit to Discover, shown once the letters match: a promotion of this
 * anagram with a note for the review. The API is the search page's Promote,
 * with `via: 'typed'`, behind the same check and the same hourly limit.
 */
export function Submit({ text, reading, words, classes, letters, tierOf, standingOf, checked, published, pass }: Props) {
  const key = promotionKey(words);
  const onDiscover = published?.find((hit) => promotionKey(hit.words) === key) ?? null;
  const blocked = useBlocked(key);

  let body: React.ReactNode;
  if (letters > MAX_TYPED_LETTERS) {
    body = (
      <p className="mt-4 max-w-prose text-sm text-ink-soft">
        A submission holds at most {MAX_TYPED_LETTERS} letters; this text has {letters.toLocaleString('en-US')}.
      </p>
    );
  } else if (onDiscover) {
    const shelf = SECTIONS.find((s) => s.shelf === onDiscover.shelf)?.label ?? 'a section';
    body = (
      <p className="mt-4 max-w-prose text-sm text-ink-soft">
        This anagram is on Discover already, in {shelf}.{' '}
        <a
          href={`/hits#${onDiscover.slug}`}
          className="underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent"
        >
          See it on Discover
        </a>
      </p>
    );
  } else if (blocked) {
    body = <p className="mt-4 max-w-prose text-sm text-ink-soft">This anagram cannot be submitted.</p>;
  } else {
    body = (
      <Form
        key={key}
        promotionKey={key}
        text={text}
        reading={reading}
        words={words}
        classes={classes}
        tierOf={tierOf}
        standingOf={standingOf}
        checked={checked}
        pass={pass}
      />
    );
  }

  return (
    <section aria-labelledby="submit-title" className="mt-14 border-t border-rule-strong pt-8 print:hidden">
      <h2 id="submit-title" className="font-display text-3xl tracking-[-0.01em] text-ink">
        Submit to Discover
      </h2>
      {body}
    </section>
  );
}

type Promo = { count: number; mine: boolean; open: boolean };

function Form({
  promotionKey: key,
  text,
  reading,
  words,
  classes,
  tierOf,
  standingOf,
  checked,
  pass,
}: {
  promotionKey: string;
  text: string;
  reading: Record<string, string> | null;
  words: readonly string[];
  classes: Readonly<Record<string, ClassName>>;
  tierOf: TierOf;
  standingOf: StandingOf;
  checked: boolean;
  pass: Pass;
}) {
  const id = useId();
  const [category, setCategory] = useState<Category | ''>('');
  const [about, setAbout] = useState('');
  const [aboutTouched, setAboutTouched] = useState(false);
  const [why, setWhy] = useState('');
  const [credit, setCredit] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ snapshot: string; ok: boolean; text: string } | null>(null);
  const [promo, setPromo] = useState<Promo | null>(null);

  // How many promotions the anagram has, and whether one is this browser's:
  // what shows that a submission is still there after a reload.
  useEffect(() => {
    let live = true;
    fetch(`/api/promotions?letters=${encodeURIComponent(sortedLetters(words.join('')))}&voter=${pass.voter}`, { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<PromotionsBody>) : Promise.reject(new Error(String(r.status)))))
      .then((answer) => {
        if (live) setPromo({ count: answer.counts[key] ?? 0, mine: answer.mine.includes(key), open: answer.open });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
    // `key` is the words, sorted; the letters follow from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pass.voter]);

  const missing = checked ? wordRequests(words, standingOf) : [];
  const aboutText = tidyNote(about);
  const aboutIssue = aboutText.length > 0 ? aboutProblem(aboutText) : null;
  const payload = {
    input: text.trim(),
    // Every item's reading, so the review reads the text as the reader did,
    // and the class of each term that is not a word, so it knows what it is.
    ...(reading ? { reading } : {}),
    ...(Object.keys(classes).length > 0 ? { classes } : {}),
    words: [...words],
    tier: submissionTier(words, tierOf),
    on: true,
    via: 'typed',
    category,
    about: aboutText,
    why: tidyNote(why),
    credit: tidyNote(credit),
    missing,
  };
  const snapshot = JSON.stringify(payload);
  const shown = result?.snapshot === snapshot ? result : null;
  const done = shown?.ok === true;
  const paused = promo?.open === false;

  const submit = async () => {
    setSending(true);
    try {
      const answer = await pass.send<{ key: string; on: boolean; count: number }>('/api/promote', payload);
      setPromo({ count: answer.count, mine: true, open: true });
      setResult({ snapshot, ok: true, text: 'Submitted. It counts as your promotion of this anagram.' });
    } catch (error) {
      if (error instanceof ActionProblem && error.code === 'closed') setPromo((p) => (p ? { ...p, open: false } : p));
      setResult({ snapshot, ok: false, text: sentenceFor(error) });
    } finally {
      setSending(false);
    }
  };

  const blocked = category === '' ? 'Choose a category to submit.' : !checked ? 'Checking the words…' : null;

  return (
    <>
      <p className="mt-4 max-w-prose text-sm text-ink-soft">
        Sending it counts as your promotion of this anagram and keeps what you write below for the review. A model reads the most
        promoted anagrams first and places each in Interesting or A stretch, or leaves it out; nothing reaches Discover until the
        site’s editor approves it. If it is placed, what the input is and your credit may be shown with it.
      </p>
      {promo && promo.count > 0 && (
        <p className="mt-3 font-mono text-[11px] text-ink-faint">
          {promo.count.toLocaleString('en-US')} {promo.count === 1 ? 'promotion' : 'promotions'} so far
        </p>
      )}
      {promo?.mine && !done && (
        <p className="mt-2 max-w-prose text-sm text-ink-soft">You have promoted this anagram; submitting again updates your note.</p>
      )}

      <form
        className="mt-6 flex max-w-prose flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          setAboutTouched(true);
          if (!sending && !blocked && !aboutIssue && !done && !paused) void submit();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-category`} className={LABEL}>
            Category
          </label>
          <select
            id={`${id}-category`}
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="h-[34px] w-48 rounded-[3px] border border-rule bg-surface px-2 text-sm text-ink transition-colors duration-150 hover:border-rule-strong"
          >
            <option value="" disabled>
              Choose one
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <Field
          id={`${id}-about`}
          label="What the input is"
          hint="One factual sentence, up to 200 characters, for a reader who has not heard of it."
          problem={aboutTouched ? aboutIssue : null}
        >
          <input
            id={`${id}-about`}
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            onBlur={() => setAboutTouched(true)}
            placeholder="A dormitory is a building of shared bedrooms, as at a school or college."
            aria-invalid={aboutTouched && aboutIssue !== null}
            aria-describedby={`${id}-about-hint`}
            className={FIELD}
          />
        </Field>

        <Field id={`${id}-why`} label="Why it is good" hint="One or two lines on what the anagram says about the input." problem={null}>
          <textarea
            id={`${id}-why`}
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            maxLength={MAX_WHY}
            rows={2}
            aria-describedby={`${id}-why-hint`}
            className={FIELD}
          />
        </Field>

        <Field id={`${id}-credit`} label="Credit" hint="How you would like to be named, if at all." problem={null}>
          <input
            id={`${id}-credit`}
            value={credit}
            onChange={(event) => setCredit(event.target.value)}
            maxLength={MAX_CREDIT}
            aria-describedby={`${id}-credit-hint`}
            className={`${FIELD} max-w-72`}
          />
        </Field>

        {missing.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm text-ink-soft">
            {missing.map((word) => (
              <li key={word}>{wordRequestSentence(word)}</li>
            ))}
          </ul>
        )}

        {paused ? (
          <p className="text-sm text-ink-soft">Submissions are paused.</p>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <button
              type="submit"
              disabled={sending || blocked !== null || aboutIssue !== null || done}
              className="rounded-[3px] border border-accent bg-accent-wash px-4 py-1.5 text-sm font-medium text-accent transition-colors
                         duration-150 hover:bg-accent hover:text-surface disabled:border-rule disabled:bg-surface disabled:text-ink-faint"
            >
              {sending ? 'Submitting…' : done ? 'Submitted' : 'Submit'}
            </button>
            {blocked && <span className="font-mono text-[11px] text-ink-faint">{blocked}</span>}
          </div>
        )}

        {shown && (
          <p role="status" className={`max-w-prose text-sm ${shown.ok ? 'text-ink' : 'text-accent'}`}>
            {shown.text}
          </p>
        )}
      </form>
    </>
  );
}

function Field({
  id,
  label,
  hint,
  problem,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  problem: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={LABEL}>
        {label} <span className="font-mono tracking-normal normal-case">optional</span>
      </label>
      {children}
      <p id={`${id}-hint`} className={`text-xs ${problem ? 'text-accent' : 'text-ink-faint'}`}>
        {problem ?? hint}
      </p>
    </div>
  );
}
