import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_QUERY, type Tier } from '@ars-magna/engine';

import { CheckToast } from '../components/CheckToast.tsx';
import { TierPicker } from '../components/Controls.tsx';
import { SiteFooter } from '../components/SiteFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';
import { lettersMatchLabel, wordsKnown, wordsKnownLabel, wordsOf } from '../lib/checks.ts';
import { insertAt, ledger, lettersLine, readBack, verdict } from '../lib/ledger.ts';
import { useDictionary } from '../state/useDictionary.ts';
import { usePass } from '../state/usePass.ts';
import { usePublishedHits } from '../state/usePublishedHits.ts';
import { Analysis } from './Analysis.tsx';
import { Submit } from './Submit.tsx';
import { Tray } from './Tray.tsx';

const ISSUE_FORM = 'https://github.com/ryanjosephkamp/ars-magna/issues/new?template=submit-anagram.yml';

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
const BOX =
  'font-display field-sizing-content min-h-[3.25rem] w-full resize-none border-0 border-b border-rule bg-transparent pb-2 text-3xl leading-tight tracking-tight text-ink outline-none transition-colors duration-150 placeholder:text-ink-faint focus:border-accent sm:text-4xl';

/**
 * Build an anagram: type a text, see its letters, type an anagram of it and
 * watch the letters run out, read the two checks, and send a good one to
 * Discover. Every figure here is set in type.
 */
export function BuildPage() {
  const id = useId();
  const [text, setText] = useState('');
  const [anagram, setAnagram] = useState('');
  const [tier, setTier] = useState<Tier>(DEFAULT_QUERY.tier);
  const anagramRef = useRef<HTMLTextAreaElement>(null);
  /** Where the caret last was in the anagram box, for a letter pressed while the box is not focused. */
  const caret = useRef({ start: 0, end: 0 });
  /** Where to put the caret once a pressed letter is in, while the box keeps focus. */
  const pendingCaret = useRef<number | null>(null);

  const l = useMemo(() => ledger(text, anagram), [text, anagram]);
  const marks = useMemo(() => readBack(text, anagram), [text, anagram]);
  const words = useMemo(() => wordsOf(anagram), [anagram]);
  const textWords = useMemo(() => wordsOf(text), [text]);
  const looked = useMemo(() => [...textWords, ...words], [textWords, words]);
  const dictionary = useDictionary(looked);
  const pass = usePass();
  const published = usePublishedHits(true, '');

  const known = wordsKnown(words, dictionary.tierOf, tier);
  const knownLabel =
    words.length > 0 && dictionary.status.state === 'loading'
      ? 'Loading the dictionary…'
      : words.length > 0 && dictionary.status.state === 'failed'
        ? 'The dictionary did not load.'
        : wordsKnownLabel(known, tier);
  const matchLabel = lettersMatchLabel(l);
  const checked = known.kind === 'known' || known.kind === 'unknown';

  const remember = () => {
    const box = anagramRef.current;
    if (box) caret.current = { start: box.selectionStart, end: box.selectionEnd };
  };

  const insert = (letter: string) => {
    const box = anagramRef.current;
    const focused = box !== null && document.activeElement === box;
    const at = focused ? { start: box.selectionStart, end: box.selectionEnd } : caret.current;
    const next = insertAt(anagram, at.start, at.end, letter);
    caret.current = { start: next.caret, end: next.caret };
    pendingCaret.current = focused ? next.caret : null;
    setAnagram(next.value);
  };

  // A controlled box puts the caret at the end whenever its value is set, so a
  // letter pressed mid-word would send the next one to the end. Put it back.
  useLayoutEffect(() => {
    const box = anagramRef.current;
    if (box && pendingCaret.current !== null) box.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  }, [anagram]);

  // How many anagrams the text itself has, at the chosen tier: the site's own
  // number, asked once the text has stayed put for a moment. A count that runs
  // out of its budget comes back as a floor, and reads as `more than`.
  const countKey = `${l.text.letters}|${tier}`;
  const [counted, setCounted] = useState<{ key: string; total: string | null } | null>(null);
  useEffect(() => {
    if (l.text.letters.length === 0 || dictionary.status.state !== 'ready') return;
    let live = true;
    const timer = setTimeout(() => {
      void dictionary
        .count({ ...DEFAULT_QUERY, input: text, mustInclude: [], mustExclude: [], tier })
        .then((total) => {
          if (live && total !== null) setCounted({ key: countKey, total });
        });
    }, 500);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // The key holds the letters and the tier; the text's spelling cannot change them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countKey, dictionary.status.state]);
  const total = counted?.key === countKey ? counted.total : null;

  const textLine = lettersLine(l.text);
  const anagramVerdict = verdict(l);
  const skippedInAnagram = l.anagram.skipped.length;

  return (
    <div className="min-h-dvh">
      <SiteHeader page="/build" />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">Build an anagram</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft">
            Type a text, then rearrange its letters into an anagram below. The page checks that every letter is used once and that every
            word is in the dictionary.
          </p>
        </header>

        <section aria-label="Text" className="flex flex-col gap-2">
          <label htmlFor={`${id}-text`} className={LABEL}>
            Text
          </label>
          <textarea
            id={`${id}-text`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type anything"
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={BOX}
          />
          <p className="font-mono text-xs text-ink-faint" aria-live="polite">
            {textLine || <span className="opacity-0">·</span>}
          </p>
        </section>

        <section aria-labelledby={`${id}-letters`} className="mt-8 flex flex-col gap-1.5">
          <h2 id={`${id}-letters`} className={LABEL}>
            Letters <span className="font-mono tracking-normal normal-case">· tap one to add it</span>
          </h2>
          <Tray tray={l.tray} onInsert={insert} />
        </section>

        <section aria-label="Anagram" className="mt-8 flex flex-col gap-2">
          <label htmlFor={`${id}-anagram`} className={LABEL}>
            Anagram
          </label>
          <textarea
            ref={anagramRef}
            id={`${id}-anagram`}
            value={anagram}
            onChange={(event) => {
              setAnagram(event.target.value);
              caret.current = { start: event.target.selectionStart, end: event.target.selectionEnd };
            }}
            onSelect={remember}
            onKeyUp={remember}
            onClick={remember}
            placeholder="Its anagram"
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby={`${id}-verdict`}
            className={BOX}
          />
          {anagram.trim().length > 0 && (
            <p className="font-display text-xl leading-snug break-words whitespace-pre-wrap text-ink-soft" aria-hidden="true">
              {marks.map((m, i) => (
                <span key={i} className={m.extra ? 'text-accent' : undefined}>
                  {m.char}
                </span>
              ))}
            </p>
          )}
          <p id={`${id}-verdict`} className={`font-mono text-xs ${l.match ? 'text-ink' : 'text-ink-soft'}`} aria-live="polite">
            {anagramVerdict || <span className="opacity-0">·</span>}
            {anagramVerdict && skippedInAnagram > 0 && (
              <span className="text-ink-faint">
                {' '}
                · {skippedInAnagram} {skippedInAnagram === 1 ? 'character' : 'characters'} skipped: {l.anagram.skipped.join(' ')}
              </span>
            )}
          </p>
        </section>

        <section aria-label="Checks" className="mt-10 flex flex-col gap-5 border-t border-rule pt-6">
          <div className="self-start">
            <TierPicker value={tier} counts={dictionary.status.state === 'ready' ? dictionary.status.counts : null} onChange={setTier} />
          </div>
          <dl className="flex flex-col gap-2 text-sm" aria-live="polite">
            <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
              <dt className="text-ink-soft">Letters match</dt>
              <dd className={`font-mono text-[13px] ${matchLabel === 'No' ? 'text-accent' : 'text-ink'}`}>{matchLabel}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
              <dt className="text-ink-soft">Words known</dt>
              <dd className={`font-mono text-[13px] ${known.kind === 'unknown' ? 'text-accent' : 'text-ink'}`}>{knownLabel}</dd>
            </div>
          </dl>
        </section>

        <Analysis
          text={{ letters: l.text.letters, words: textWords }}
          anagram={{ letters: l.anagram.letters, words }}
          factsOf={dictionary.factsOf}
          tier={tier}
          total={total}
          counting={l.text.letters.length > 0 && total === null && dictionary.status.state === 'ready'}
        />

        {l.match && (
          <Submit
            text={text}
            words={words}
            letters={l.text.letters.length}
            tierOf={dictionary.tierOf}
            checked={checked && dictionary.status.state === 'ready'}
            published={published}
            pass={pass}
          />
        )}

        <p className="mt-12 max-w-prose text-sm text-ink-soft">
          You can also send an anagram as{' '}
          <a
            href={ISSUE_FORM}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent"
          >
            a GitHub issue
          </a>
          .
        </p>

        <SiteFooter counts={dictionary.status.state === 'ready' ? dictionary.status.counts : null} />
      </main>

      <CheckToast pass={pass} />
    </div>
  );
}
