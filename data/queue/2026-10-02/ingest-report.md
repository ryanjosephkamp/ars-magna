# Ingest 2026-10-02

Queue: /home/user/ars-magna/data/queue/2026-10-02
Verdicts: 29 read · 29 valid · 0 rejected
Hits: 14 new in data/hits.jsonl (13 accepted, 1 alternate proposed) · 3 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 302

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 5, flagged for Greatest Hits | 2 | Bucking Fastard | bastard fucking | Bucking Fastard is itself a spoonerism for "f***ing bastard", which this anagram spells out directly. |
| 5, flagged for Greatest Hits | 2 | John McAfee | mac fee john | 'Mac fee' sounds exactly like McAfee, the antivirus company he founded. |
| 4 | 2 | Forgotten Island | not forget island | The title's own words are rearranged into a plea not to forget the island, reversing its name. |
| 4 | 2 | Godzilla Minus Zero | no mogul size lizard | 'No size' echoes the title's own 'Minus Zero', applied to the lizard monster. |
| 4 | 2 | To Catch a Predator | predator chat coat | The show catches predators through online chat stings, which 'chat' names directly. |
| 4 | 2 | To Catch a Predator | predator chat taco | The show catches predators through online chat stings, which 'chat' names directly. |
| 4 | 2 | Troy Parrott | parrot to try | 'Parrot' is a near-homophone of his own surname Parrott. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 2 | Bonnie Blue | nubile bone | 'Nubile' and 'bone' both carry sexual connotations fitting a pornographic performer. |
| 3 | 2 | Bonnie Blue | bonnie lube | Lube evokes the pornography industry that Bonnie Blue performs in. |
| 3 | 2 | Godzilla Minus Zero | on mogul size lizard | Godzilla is a giant lizard monster, and 'size' evokes its famous scale. |
| 3 | 2 | Natasha Cornett | Canter Thanatos. | A canter toward Thanatos, the Greek death-god, evokes a murderer heading toward her fate. |
| 3 | 2 | Natasha Cornett | Nectar Thanatos. | Nectar offered to Thanatos, the Greek death-god, evokes a sweet lure that drew victims to harm. |
| 3 | 2 | Natasha Cornett | Recant Thanatos. | To recant before Thanatos, the Greek death-god, evokes a confession extracted from a killer. |

## Alternates

These qualify, but their input already has three hits on a shelf. They are proposed; accept one with `pnpm hits:set --status=accepted <id>`. An input keeps at most 5 alternates; qualifying rows past them are listed with the near misses.

| relation | reads | id | anagram | justification |
|---|---|---|---|---|
| 3 | 2 | natashacornett:people:thanatos-trance | Trance Thanatos. | A trance before Thanatos, the Greek death-god, evokes the fatal spell under which a murderer acted. |

## Near misses

Not added; kept in `judge-output.jsonl`.

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 2 | 2 | Dustin Diamond | diamond nudist | Nudist loosely gestures at his later adult-entertainment controversy; strained. |
| 2 | 2 | Guntur Soekarnoputra | orangutan ok ruptures | Only tenuous link is orangutan to Indonesia; rest is filler. |
| 2 | 2 | Jackie Chan | cane hijack | Only a strained link via cane as a martial-arts prop; hijack is unrelated. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| buckingfastard:titles | Bucking Fastard | Bucking Fastard is a 2026 film directed by Werner Herzog. | already on the input |
| johnmcafee:people | John McAfee | John McAfee was a British-American programmer and businessman (1945–2021). | already on the input |
| forgottenisland:titles | Forgotten Island | Forgotten Island is a 2026 animated film directed by Joel Crawford and Januel Mercado. | already on the input |
| godzillaminuszero:titles | Godzilla Minus Zero | Godzilla Minus Zero is an upcoming film directed by Takashi Yamazaki. | already on the input |
| tocatchapredator:titles | To Catch a Predator | To Catch a Predator is an American reality television series focusing on exposing pedophiles through sting operations. | already on the input |
| troyparrott:people | Troy Parrott | Troy Parrott is an Irish association football player (born 2002). | already on the input |
| bonnieblue:people | Bonnie Blue | Bonnie Blue is a British pornographic actress. | already on the input |
| natashacornett:people | Natasha Cornett | Natasha Cornett is an American murderer. | already on the input |

## Display

How each of these reads on Discover, as the judge proposed and the check allowed: listed forms, punctuation and capitals over the same words. Merging accepts these; change one with `pnpm hits:display <id> "…"`, or return it to the words with `--clear`.

- `natashacornett:people:canter-thanatos`: Natasha Cornett → Canter Thanatos. (the words: canter thanatos)
- `natashacornett:people:nectar-thanatos`: Natasha Cornett → Nectar Thanatos. (the words: nectar thanatos)
- `natashacornett:people:recant-thanatos`: Natasha Cornett → Recant Thanatos. (the words: recant thanatos)
- `natashacornett:people:thanatos-trance`: Natasha Cornett → Trance Thanatos. (the words: trance thanatos)
