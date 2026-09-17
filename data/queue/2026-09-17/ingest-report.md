# Ingest 2026-09-17

Queue: /home/user/ars-magna/data/queue/2026-09-17
Verdicts: 6 read · 6 valid · 0 rejected
Hits: 5 new in data/hits.jsonl (5 accepted, 0 alternates proposed) · 1 near miss kept in judge-output.jsonl
Candidates moved to enumerated: 54

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 4 | 3 | Evilstick | vile stick | Evilstick is literally an evil stick, and vile is a direct synonym for evil describing the toy wand. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 3 | Evilstick | vile ticks | Vile ticks reads as evil-sounding mechanical clicks, with vile substituting for evil in the wand's name. |
| 3 | 3 | Max Dowman | mad max now | His given name Max evokes the Mad Max action-film franchise, a pun on his name. |
| 3 | 3 | Max Dowman | mad max won | His given name Max evokes the Mad Max franchise, read here as the sentence Mad Max won. |
| 3 | 2 | Evilstick | ticks evil | Ticks evil reads as mechanical clicking sounds that are evil, echoing evil in the product's own name. |

## Near misses

Not added; kept in `judge-output.jsonl`.

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 3 | 1 | Max Dowman | mad max own | Same weak name pun as the other two, but reads as word salad. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| evilstick:products | Evilstick | Evilstick is a toy wand. | already on the input |
| maxdowman:people | Max Dowman | Max Dowman is an English footballer (born 2009). | already on the input |

## Senses

The sense a word reads in, in this anagram, where the dictionary's first sense would not explain it; Discoveries shows it first. Merging accepts these; change one with `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`.

- `maxdowman:people:mad-max-now`: Max Dowman → mad max now
  - max: Used here as the male name from the Mad Max film franchise, not GHB slang. (dictionary: street names for gamma hydroxybutyrate)
- `maxdowman:people:mad-max-won`: Max Dowman → mad max won
  - max: Used here as the male name from the Mad Max film franchise, not GHB slang. (dictionary: street names for gamma hydroxybutyrate)
  - won: Used here as the past tense of the verb win, not the Korean currency. (dictionary: the basic unit of money in South Korea)
