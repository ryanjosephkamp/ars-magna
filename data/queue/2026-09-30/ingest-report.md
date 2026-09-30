# Ingest 2026-09-30

Queue: /home/user/ars-magna/data/queue/2026-09-30
Verdicts: 11 read · 11 valid · 0 rejected
Hits: 5 new in data/hits.jsonl (5 accepted, 0 alternates proposed) · 3 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 230

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 5, flagged for Greatest Hits | 2 | Bucking Fastard | bastard fucking | Bucking Fastard is itself built as a spoonerism of 'f***ing bastard', and this anagram spells that out directly. |
| 4 | 3 | American Horror Story | arty horror is romance | AHS is known for its stylised, arthouse visuals and for building horror seasons around central romantic relationships. |
| 4 | 2 | Bonnie Blue | bonnie lube | Lube is a direct, literal reference to the pornographic content Bonnie Blue is known for. |
| 4 | 2 | Forgotten Island | not forget island | Reverses the title's own meaning: an island called Forgotten is here one you must not forget. |
| 4 | 2 | The Paradise | despair hate | Flips 'Paradise' to its opposite, despair and hate, an ironic contrast with what the title promises. |

## Near misses

Not added; kept in `judge-output.jsonl`.

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 2 | 2 | Day Drinker | ready drink | Just restates 'day drinker' as a near-synonym; no new information about the film. |
| 2 | 2 | Heart of the Beast | of the heartbeats | Only stretches 'heart' from the title into 'heartbeats'; adds no independent meaning. |
| 2 | 2 | Tom Bateman | batman tome | Batman is only a sound-alike of Bateman; no real connection to the actor's career. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| buckingfastard:titles | Bucking Fastard | Bucking Fastard is a 2026 film directed by Werner Herzog. | already on the input |
| americanhorrorstory:titles | American Horror Story | American Horror Story is an American anthology horror television series. | already on the input |
| bonnieblue:people | Bonnie Blue | Bonnie Blue is a British pornographic actress. | already on the input |
| forgottenisland:titles | Forgotten Island | Forgotten Island is a 2026 animated film directed by Joel Crawford and Januel Mercado. | already on the input |
| theparadise:titles | The Paradise | The Paradise is a 2026 film by Srikanth Odela. | already on the input |
