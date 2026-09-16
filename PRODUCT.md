# Product

## Register

product

## Users

People who need every anagram of a specific piece of text, not a curated handful:
puzzle constructors, crossword and Scrabble players, writers hunting a title,
tattoo and gift shoppers rearranging a name, and the merely curious typing their
own name to see what falls out.

They arrive with one string in mind and a single question — *what else can these
letters spell?* — and they stay to scan. The session shape is: type once, then
read for minutes. Result legibility under sustained reading matters more than
first-impression polish.

## Product Purpose

Given any text, return **every** way its exact letters can be re-partitioned into
real English words. Not a sample, not the best few — the complete set, with an
exact count even when that count runs to eight figures.

Two things make this different from the anagram tools that already exist:

1. **Completeness is the promise.** Most tools silently cap, sample, or drop
   results. Ars Magna states the exact total and can reach any result in it.
2. **The dictionary is a stated authority.** Validity is judged against a pinned
   revision of English OpenList, with three nested tiers the user chooses
   between, so results are reproducible and the vocabulary is never a mystery.

Success is a user finding the specific rearrangement they were looking for, and
trusting that if it were not shown, it does not exist.

## Brand Personality

Precise, scholarly, quietly playful.

A serious instrument that knows it is also a toy. Copy is exact and unfussy —
counts, labels, results. The wit lives in the substance, never the chrome: the
site is called Ars Magna because that is an anagram of Anagrams, and it can prove
it. No exclamation marks, no encouragement, no mascot.

Voice test: an error message reads *"elephant doesn't fit in these letters"*, not
*"Oops! We couldn't find that word 😅"*.

Every message to the reader is a sentence: it starts with a capital letter and
ends with a full stop. Labels and buttons are not sentences and take neither — a
button reads *Vote*, a control is labelled *Dictionary*, and the sentence under
it ends properly.

## Anti-references

- **Warm cream / parchment / sand backgrounds.** The saturated default of the
  moment, and a poor surface for reading tens of thousands of words.
- **Existing anagram sites** (wordsmith.org, anagrammer, and the SEO farms):
  ad-choked, cramped, results dumped as undifferentiated blue text.
- **Dashboard chrome.** No stat tiles, no cards, no sparklines. There is one
  number on this page and it is the result count.
- **Word-game cuteness.** No tile graphics, no confetti, no Scrabble-rack skeuomorphism.

## Design Principles

1. **The letters are the interface.** Type carries the visual weight; chrome is
   hairlines and space. If an element is not text the user came for, it should be
   nearly invisible.
2. **State the number.** The exact total appears before any result does, because
   on most queries it is the more useful fact and it arrives faster.
3. **Never imply completeness you don't have.** Any cap, truncation, or budget
   exhaustion is said out loud in the interface.
4. **Filters over pagination.** With millions of results, the answer to "too many"
   is a better query — min word length, max words, a pinned word — not page 4,000.
5. **Earned familiarity.** Standard affordances for standard tasks. The novelty is
   in what the tool does, not in how its controls work.

## Accessibility & Inclusion

Best-effort baseline rather than a formal audit target: 4.5:1 contrast on body
text, visible focus rings on every interactive element, full keyboard operation
of the controls and result list, and `prefers-reduced-motion` honoured. The result
count updates a polite live region so it is not silent to screen readers.
