# Ingest 2026-09-21

Queue: /home/user/ars-magna/data/queue/2026-09-21
Verdicts: 4 read · 4 valid · 0 rejected
Hits: 3 new in data/hits.jsonl (3 accepted, 0 alternates proposed) · 1 near miss kept in judge-output.jsonl
Candidates moved to enumerated: 43

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 4 | 2 | Jimmy Fallon | fan jimmy lol | Fallon is well known for breaking character and laughing uncontrollably during sketches, i.e. LOL-ing on air. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 3 | Lust Stories 3 | either loses trust | The anthology's stories about desire and infidelity often turn on one partner losing trust in the other. |
| 3 | 2 | Big Brother 28 | thy big brother tweeting | Big Brother's live, around-the-clock format makes it one of the most tweeted-about reality shows while it airs. |

## Near misses

Not added; kept in `judge-output.jsonl`.

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 2 | 2 | The Blame | hamlet be | Hamlet here is the common noun for a small village; only a coincidental homophone with Shakespeare's play, no real link to the show. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| jimmyfallon:people | Jimmy Fallon | Jimmy Fallon is an American talk show host and comedian (born 1974). | already on the input |
| luststoriesthree:titles | Lust Stories 3 | Lust Stories 3 is a 2026 Indian anthology film. | already on the input |
| bigbrothertwentyeight:titles | Big Brother 28 | Big Brother 28 is a season of American television series. | already on the input |

## Senses

The sense a word reads in, in this anagram, where the dictionary's first sense would not explain it; Discover shows it first. Merging accepts these; change one with `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`.

- `jimmyfallon:people:fan-jimmy-lol`: Jimmy Fallon → fan jimmy lol
  - lol: Internet slang/interjection for laughing out loud, used here to describe Fallon's on-air laughter. (dictionary: no definition)
