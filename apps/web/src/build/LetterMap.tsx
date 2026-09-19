import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { MAP_LIMIT, letterMap, mapFits } from '../lib/letterMap.ts';

const LABEL = 'text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase';
/** The selected letter, as the read-back lines mark it: the accent, and an underline that does not depend on colour. */
const MARKED = 'text-accent underline decoration-2 underline-offset-4';
/** How far apart the two lines sit, in pixels: the room the lines run through. */
const GAP = 72;

type Line = { letter: string; x1: number; x2: number };

/**
 * The letter map: the text on one line, the anagram on the line below, and a
 * fine line from each letter of the text to where it went. The selected
 * letter's lines take the accent, and tapping a letter here selects it as
 * the charts do. A letter with no partner has no line: one the anagram uses
 * too often shows in the accent, as the read-back line marks it, and one it
 * has not used yet fades. Past `MAP_LIMIT` letters the lines would be a web,
 * so the page says so instead. A picture of what the charts already state in
 * figures, so a screen reader is told what it shows and skips it.
 */
export function LetterMap({
  text,
  anagram,
  selected,
  onSelect,
}: {
  text: string;
  anagram: string;
  selected: string | null;
  onSelect(letter: string | null): void;
}) {
  const map = useMemo(() => letterMap(text, anagram), [text, anagram]);
  const lettersOf = (side: typeof map.text) => side.reduce((n, c) => n + c.letters.length, 0);
  const textLetters = lettersOf(map.text);
  const anagramLetters = lettersOf(map.anagram);
  const fits = mapFits(textLetters, anagramLetters);
  const box = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState<{ width: number; lines: Line[] }>({ width: 0, lines: [] });

  // Where each letter sits is only known once the page has laid it out, in
  // whatever face the reader's device has; measured again on any resize and
  // once the fonts have loaded. The drawing is as wide as the letter rows run,
  // measured from the letters themselves: the box is at least as wide as its
  // column and holds the drawing, so a width taken from the box would keep a
  // wide layout's width after the page narrows, and scroll sideways.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !fits) return;
    const measure = () => {
      const origin = el.getBoundingClientRect();
      // A glyph's box holds the letter-spacing after it; its centre is the glyph's alone.
      const spacing = parseFloat(getComputedStyle(el).letterSpacing) || 0;
      const boxes = (side: string) => [...el.querySelectorAll<HTMLElement>(`[data-side="${side}"] > span`)].map((span) => span.getBoundingClientRect());
      const top = boxes('text');
      const bottom = boxes('anagram');
      const centre = (r: DOMRect | undefined) => (r ? r.left - origin.left + (r.width - spacing) / 2 : 0);
      setDrawn({
        width: Math.ceil(Math.max(0, ...[...top, ...bottom].map((r) => r.right - origin.left))),
        lines: map.links.map((l) => ({ letter: l.letter, x1: centre(top[l.fromChar]), x2: centre(bottom[l.toChar]) })),
      });
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    void document.fonts?.ready.then(measure);
    return () => watch.disconnect();
  }, [map, fits]);

  if (textLetters === 0 || anagramLetters === 0) return null;

  const longest = Math.max(map.text.length, map.anagram.length);
  const size = longest <= 24 ? 'text-3xl' : longest <= 40 ? 'text-2xl' : 'text-xl';
  const missing = new Set(map.missing);
  const extra = new Set(map.extra);
  const pick = (letters: string) => {
    const letter = letters[0];
    if (letter) onSelect(selected === letter ? null : letter);
  };
  const glyphs = (side: 'text' | 'anagram') =>
    (side === 'text' ? map.text : map.anagram).map((c, i) => {
      const odd = side === 'text' ? missing.has(i) : extra.has(i);
      const tone = selected !== null && c.letters.includes(selected) ? MARKED : odd ? (side === 'text' ? 'text-ink-faint' : 'text-accent') : '';
      return (
        <span
          key={i}
          onClick={c.letters ? () => pick(c.letters) : undefined}
          className={`${tone} ${c.letters ? 'cursor-pointer rounded-[2px] transition-colors duration-150 hover:bg-accent-wash' : ''}`}
        >
          {/* A line break in the box would break the map's two lines; it reads as a space here. */}
          {/\s/.test(c.char) ? ' ' : c.char}
        </span>
      );
    });
  const curve = (l: Line) => `M ${l.x1} 0 C ${l.x1} ${GAP / 2}, ${l.x2} ${GAP / 2}, ${l.x2} ${GAP}`;
  const marked = drawn.lines.filter((l) => l.letter === selected);

  return (
    <section aria-labelledby="letter-map-title" className="mt-10">
      <h3 id="letter-map-title" className={LABEL}>
        Letter map
      </h3>
      {!fits ? (
        <p className="mt-2 text-sm text-ink-soft">{`The letter map draws texts of up to ${MAP_LIMIT} letters.`}</p>
      ) : (
        <>
          {/* Sideways only: a glyph that runs a pixel past the rows must not make the map scroll up and down. */}
          <div className="mt-3 overflow-x-auto overflow-y-hidden pb-2 print:overflow-visible" aria-hidden="true">
            <div ref={box} className={`relative w-max min-w-full font-display leading-none tracking-[0.12em] whitespace-pre text-ink ${size}`}>
              <p data-side="text">{glyphs('text')}</p>
              <svg width={drawn.width} height={GAP} className="my-1.5 block overflow-visible" fill="none">
                {drawn.lines.map((l, i) => (
                  <path
                    key={i}
                    d={curve(l)}
                    className={`stroke-ink-faint transition-opacity duration-150 ${selected === null ? 'opacity-60' : 'opacity-25'}`}
                    strokeWidth={1}
                  />
                ))}
                {/* The selected letter's lines last, so they cross over the rest. */}
                {marked.map((l, i) => (
                  <path key={`on-${i}`} d={curve(l)} className="stroke-accent" strokeWidth={1.5} />
                ))}
              </svg>
              <p data-side="anagram">{glyphs('anagram')}</p>
            </div>
          </div>
          <p className="mt-2 max-w-prose text-xs text-ink-faint">
            A line runs from each letter of the text to where it goes in the anagram.
            <span className="print:hidden"> Select a letter to follow its lines.</span>
          </p>
        </>
      )}
    </section>
  );
}
