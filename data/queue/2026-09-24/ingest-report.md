# Ingest 2026-09-24

Queue: /home/user/ars-magna/data/queue/2026-09-24
Verdicts: 13 read · 13 valid · 0 rejected
Hits: 8 new in data/hits.jsonl (8 accepted, 0 alternates proposed) · 4 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 65

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 5, flagged for Greatest Hits | 3 | Bucking Fastard | bastard fucking | It unscrambles the spoonerism that is the title's own joke, 'Bucking Fastard' for 'fucking bastard.' |
| 4 | 3 | Heart of the Beast | of the heartbeats | It reshapes 'beast' into 'heartbeats,' a pun on the film's own title, Heart of the Beast. |
| 4 | 2 | Forgotten Island | not forget island | It ironically inverts the title itself: 'Forgotten Island' becomes an instruction not to forget it. |
| 4 | 2 | Gracie Mansion | I grace mansion. | It is a near-homophone of 'Gracie Mansion' itself, the New York mayor's residence, spoken as a sentence. |
| 4 | 2 | Harvey Weinstein | hyenas interview | Casts him as a predatory 'hyena' exposed by the journalists' interviews that broke his abuse scandal. |
| 4 | 2 | Tom Bateman | Batman tome. | His surname Bateman is a near-homophone of Batman, the superhero, paired with a hefty book. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 3 | Heart of the Beast | hater of the beast | Describes an enemy of 'the beast,' a loose fit for a film literally titled Heart of the Beast. |
| 3 | 2 | Line of Fire | i fire felon | Plays on 'line of fire' as gunfire at a criminal, not on the actual family drama's plot. |

## Near misses

Not added; kept in `judge-output.jsonl`.

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 2 | 3 | Angry Anderson | an angry red son | Keeps his own nickname 'angry'; 'red son' adds nothing established about him. |
| 2 | 3 | Shelley Beattie | i set the eyeball | A clean sentence, but no confirmed fact ties an eyeball specifically to her. |
| 2 | 2 | Lance Oppenheim | phenomenal epic | Generic praise; nothing ties it specifically to this director's actual work. |
| 2 | 2 | Lewis Pullman | pullman wiles | Only his own surname is retained; 'wiles' states no known fact about him. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| buckingfastard:titles | Bucking Fastard | Bucking Fastard is a 2026 film directed by Werner Herzog. | already on the input |
| heartofthebeast:titles | Heart of the Beast | Heart of the Beast is a 2026 film directed by David Ayer. | already on the input |
| forgottenisland:titles | Forgotten Island | Forgotten Island is a 2026 animated film directed by Joel Crawford and Januel Mercado. | already on the input |
| graciemansion:places | Gracie Mansion | Gracie Mansion is an official residence of the mayor of New York City. | already on the input |
| harveyweinstein:people | Harvey Weinstein | Harvey Weinstein is an American film producer and sex offender (born 1952). | already on the input |
| tombateman:people | Tom Bateman | Tom Bateman is a British actor. | already on the input |
| lineoffire:titles | Line of Fire | Line of Fire is an American family drama series. | already on the input |

## Senses

The sense a word reads in, in this anagram, where the dictionary's first sense would not explain it; Discover shows it first. Merging accepts these; change one with `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`.

- `buckingfastard:titles:bastard-fucking`: Bucking Fastard → bastard fucking
  - fucking: Used as a crude intensifier, not literally about intercourse. (dictionary: slang for sexual intercourse)
- `graciemansion:places:grace-i-mansion`: Gracie Mansion → I grace mansion.
  - grace: To honor with one's presence, used as a verb. (dictionary: (Christian theology) a state of sanctification by God; the state of one who is under such divine influence)
  - mansion: A large, impressive house. (dictionary: (astrology) one of 12 equal areas into which the zodiac is divided)
- `harveyweinstein:people:hyenas-interview`: Harvey Weinstein → hyenas interview
  - interview: A formal meeting to gather information, used as a noun. (dictionary: conduct an interview in television, newspaper, and radio reporting)
- `tombateman:people:batman-tome`: Tom Bateman → Batman tome.
  - batman: The fictional superhero, evoked by the sound of the actor's surname. (dictionary: an orderly assigned to serve a British military officer)
- `lineoffire:titles:felon-fire-i`: Line of Fire → i fire felon
  - fire: To shoot a weapon, used as a verb. (dictionary: the event of something burning (often destructive))

## Display

How each of these reads on Discover, as the judge proposed and the check allowed: listed forms, punctuation and capitals over the same words. Merging accepts these; change one with `pnpm hits:display <id> "…"`, or return it to the words with `--clear`.

- `graciemansion:places:grace-i-mansion`: Gracie Mansion → I grace mansion. (the words: i grace mansion)
- `tombateman:people:batman-tome`: Tom Bateman → Batman tome. (the words: batman tome)
