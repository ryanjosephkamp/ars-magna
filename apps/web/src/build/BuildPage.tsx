import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Tier } from '@ars-magna/engine';

import { CheckToast } from '../components/CheckToast.tsx';
import { TierPicker } from '../components/Controls.tsx';
import { SiteFooter } from '../components/SiteFooter.tsx';
import { SiteHeader } from '../components/SiteHeader.tsx';
import { commonnessByWord, comparison, letterFigures, wordFigures, wordLengthRows } from '../lib/analysis.ts';
import { lettersMatchLabel, wordsKnown, wordsKnownLabel, wordsOf } from '../lib/checks.ts';
import { buildFileStem, buildJson, buildTxt, download, type BuildReport } from '../lib/exporters.ts';
import { holdsLetter } from '../lib/letterChart.ts';
import { insertAt, ledger, lettersLine, readBack, verdict } from '../lib/ledger.ts';
import { countLine, exportTotal, limitNote, stoppedAny } from '../lib/textCount.ts';
import { decodeBuild, syncBuildUrl } from '../lib/urlState.ts';
import { useDictionary } from '../state/useDictionary.ts';
import { usePass } from '../state/usePass.ts';
import { usePublishedHits } from '../state/usePublishedHits.ts';
import { useTextCounts } from '../state/useTextCount.ts';
import { Analysis } from './Analysis.tsx';
import { Submit } from './Submit.tsx';
import { Tray } from './Tray.tsx';

const ISSUE_FORM = 'https://github.com/ryanjosephkamp/ars-magna/issues/new?template=submit-anagram.yml';

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
/** A read-back line under a box: what was typed, in type, where single letters can be marked. */
const READ_BACK = 'font-display text-xl leading-snug break-words whitespace-pre-wrap text-ink-soft print:hidden';
/** The letter the reader has selected, wherever it is marked: the accent, and an underline that does not depend on colour. */
const MARKED = 'text-accent underline decoration-2 underline-offset-4';

const BOX =
  'font-display field-sizing-content min-h-[3.25rem] w-full resize-none border-0 border-b border-rule bg-transparent pb-2 text-3xl leading-tight tracking-tight text-ink outline-none transition-colors duration-150 placeholder:text-ink-faint focus:border-accent sm:text-4xl';

/**
 * Build an anagram: type a text, see its letters, type an anagram of it and
 * watch the letters run out, read the two checks, and send a good one to
 * Discover. Every figure here is set in type.
 */
export function BuildPage() {
  const id = useId();
  // The address is the source of truth on first paint, so a shared link opens
  // on exactly the check it was copied from, and a row's Build link arrives
  // with its text already in the box.
  const opened = useMemo(() => decodeBuild(window.location.hash), []);
  const [text, setText] = useState(opened.text);
  const [anagram, setAnagram] = useState(opened.anagram);
  const [tier, setTier] = useState<Tier>(opened.tier);
  const anagramRef = useRef<HTMLTextAreaElement>(null);
  /** Where the caret last was in the anagram box, for a letter pressed while the box is not focused. */
  const caret = useRef({ start: 0, end: 0 });
  /** Where to put the caret once a pressed letter is in, while the box keeps focus. */
  const pendingCaret = useRef<number | null>(null);

  const l = useMemo(() => ledger(text, anagram), [text, anagram]);
  // The letter selected in a chart, marked in both charts, the tray and both
  // read-back lines. It lapses when neither box has it any more.
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked !== null && l.tray.some((t) => t.letter === picked) ? picked : null;
  useEffect(() => {
    if (selected === null) return;
    const clear = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPicked(null);
    };
    document.addEventListener('keydown', clear);
    return () => document.removeEventListener('keydown', clear);
  }, [selected]);
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

  const report = (): BuildReport => ({
    text,
    anagram,
    tier,
    checks: { lettersMatch: matchLabel, wordsKnown: knownLabel },
    verdict: anagramVerdict,
    letters: { text: analysis.text.letters, anagram: analysis.anagram.letters },
    words: { text: analysis.text.words, anagram: analysis.anagram.words },
    skipped: { text: l.text.skipped, anagram: l.anagram.skipped },
    comparison: analysis.comparison,
    total: exportTotal(textCount),
    countNote: textCount.kind === 'too-long' ? countLine(textCount, tier) : null,
    wordLengths: analysis.lengths.rows,
    commonness: { text: analysis.text.commonness, anagram: analysis.anagram.commonness },
    byDictionary: {
      common: exportTotal(counts.common),
      standard: exportTotal(counts.standard),
      full: exportTotal(counts.full),
      extended: exportTotal(counts.extended),
    },
    byDictionaryNote: stoppedAny(Object.values(counts)) ? limitNote() : null,
    generatedAt: new Date(),
  });

  const exportAs = (format: 'txt' | 'json') => {
    const built = report();
    const body = format === 'txt' ? buildTxt(built) : buildJson(built);
    const type = format === 'txt' ? 'text/plain;charset=utf-8' : 'application/json;charset=utf-8';
    download(new Blob([body], { type }), `${buildFileStem(text)}.${format}`);
  };

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

  // How many anagrams the text itself has in each dictionary, the chosen one
  // first: the site's own number, in a worker of its own and within a time limit.
  const counts = useTextCounts(text, l.text.letters, tier, dictionary.status.state);
  const textCount = counts[tier];

  useEffect(() => syncBuildUrl({ text, anagram, tier }), [text, anagram, tier]);

  // Every figure the analysis shows, worked out once for the page and the
  // export: the page hands the dictionary's answers to the pure module.
  const analysis = useMemo(() => {
    const facts = (list: readonly string[]) => ({
      words: list,
      masks: list.map((word) => dictionary.factsOf(word)?.mask ?? 0),
      zipf: list.map((word) => dictionary.factsOf(word)?.zipf ?? 0),
      known: list.every((word) => dictionary.factsOf(word) !== undefined),
    });
    const left = facts(textWords);
    const right = facts(words);
    return {
      text: {
        letters: letterFigures(l.text.letters),
        words: wordFigures(left.words, left.masks, left.zipf),
        known: left.known,
        commonness: commonnessByWord(left.words, left.zipf),
      },
      anagram: {
        letters: letterFigures(l.anagram.letters),
        words: wordFigures(right.words, right.masks, right.zipf),
        known: right.known,
        commonness: commonnessByWord(right.words, right.zipf),
      },
      lengths: wordLengthRows(left.words, right.words),
      comparison:
        l.text.letters.length > 0 && l.anagram.letters.length > 0 ? comparison(left, right) : null,
    };
  }, [l, textWords, words, dictionary.factsOf]);

  const textLine = lettersLine(l.text);
  const anagramVerdict = verdict(l);
  const skippedInAnagram = l.anagram.skipped.length;

  return (
    <div className="min-h-dvh">
      <SiteHeader page="/build" />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
        <header className="mb-12">
          <h1 className="font-display text-5xl tracking-[-0.02em] text-ink sm:text-6xl">Build an anagram</h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft print:hidden">
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
          {l.text.letters.length > 0 && (
            // The box itself cannot colour one letter, so the text is read back
            // beneath it, always, so selecting a letter never moves the page.
            <p className={READ_BACK} aria-hidden="true">
              {[...text].map((char, i) => (
                <span key={i} className={holdsLetter(char, selected) ? MARKED : undefined}>
                  {char}
                </span>
              ))}
            </p>
          )}
          <p className="font-mono text-xs text-ink-faint" aria-live="polite">
            {textLine || <span className="opacity-0">·</span>}
          </p>
        </section>

        <section aria-labelledby={`${id}-letters`} className="mt-8 flex flex-col gap-1.5 print:hidden">
          <h2 id={`${id}-letters`} className={LABEL}>
            Letters <span className="font-mono tracking-normal normal-case">· tap one to add it</span>
          </h2>
          <Tray tray={l.tray} selected={selected} onInsert={insert} />
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
            // On paper the box above already shows the anagram, and the verdict
            // says in words what the red marks say here.
            <p className={READ_BACK} aria-hidden="true">
              {marks.map((m, i) => (
                <span key={i} className={holdsLetter(m.char, selected) ? MARKED : m.extra ? 'text-accent' : undefined}>
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
          <div className="self-start print:hidden">
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
          text={analysis.text}
          anagram={analysis.anagram}
          comparison={analysis.comparison}
          tier={tier}
          counts={counts}
          lengths={analysis.lengths}
          typed={{ text, anagram }}
          selected={selected}
          onSelect={setPicked}
        />

        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3 print:hidden">
          <div className="flex flex-col gap-1.5">
            <span className={LABEL}>Export</span>
            <div className="flex divide-x divide-rule overflow-hidden rounded-[3px] border border-rule bg-surface">
              {(['txt', 'json'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => exportAs(format)}
                  aria-label={`Export the analysis as ${format.toUpperCase()}`}
                  className="px-2.5 py-1.5 font-mono text-[11px] tracking-wide text-ink-soft uppercase transition-colors
                             duration-150 hover:bg-accent-wash hover:text-accent"
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="pb-1.5 text-sm text-ink-soft underline decoration-rule-strong underline-offset-4 transition-colors
                       duration-150 hover:text-accent hover:decoration-accent"
          >
            Print
          </button>
        </div>

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

        <p className="mt-12 max-w-prose text-sm text-ink-soft print:hidden">
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
