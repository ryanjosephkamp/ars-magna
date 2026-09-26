# Ingest 2026-09-26

Queue: /home/user/ars-magna/data/queue/2026-09-26
Verdicts: 68 read · 68 valid · 0 rejected
Hits: 21 new in data/hits.jsonl (20 accepted, 1 alternate proposed) · 46 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 130

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 5, flagged for Greatest Hits | 3 | Bucking Fastard | bastard fucking | The film's title is itself a scrambled, censored version of this exact profanity. |
| 4 | 3 | Ed Henry | deny her | He was fired from Fox News after a woman accused him of misconduct he denied. |
| 4 | 3 | Forgotten Island | not forget island | It ironically reverses the title's own word, telling the island not to be forgotten. |
| 4 | 2 | Avengers: Doomsday | days doom avengers | Doom and Avengers directly restate the film's own title. |
| 4 | 2 | Candice Bergen | canned iceberg | Iceberg sounds like her surname Bergen, a word tied to mountains and ice. |
| 4 | 2 | Davante Adams | saved adamant | Adamant sounds like his surname Adams and describes a tough, sure-handed receiver. |
| 4 | 2 | Harvey Weinstein | anywhere invites | He was known for luring victims to meetings anywhere under false pretenses. |
| 4 | 2 | Lance Oppenheim | help open cinema | Cinema names the medium he works in as a documentary filmmaker. |
| 4 | 2 | Silent Hill: Townfall | fallen hill list town | Fallen town directly matches the game's own subtitle, Townfall. |
| 4 | 2 | Silent Hill: Townfall | fallen town hills lit | Fallen town restates the game's own subtitle, Townfall. |
| 4 | 2 | Silent Hill: Townfall | Final hell tills town. | Hell matches the demonic otherworld that consumes the town in the series. |
| 4 | 2 | The Paradise | despair hate | It ironically contrasts despair and hate with a place named Paradise. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 3 | Day Drinker | ready drink | It directly restates the title's own idea of being ready for a daytime drink. |
| 3 | 3 | Heart of the Beast | of the heartbeats | Heartbeats rebuilds the title's own word heart into a new, fitting image. |
| 3 | 2 | American Horror Story | Arty horror is romance. | The anthology series is known for stylised visuals blending horror with romance. |
| 3 | 2 | Cleopatra | palace rot | Palace fits her royal reign, and rot suggests the decline that ended it. |
| 3 | 2 | Gyanesh Kumar | husky manager | As Chief Election Commissioner he manages India's entire election process. |
| 3 | 2 | The Paradise | despair heat | It ironically contrasts despair with a place named Paradise. |
| 3 | 2 | Tom Bateman | me to batman | Bateman is a near-homophone of Batman, a common joke about his surname. |
| 3 | 2 | Tom Bateman | batman tome | Bateman is a near-homophone of Batman, a common joke about his surname. |

## Alternates

These qualify, but their input already has three hits on a shelf. They are proposed; accept one with `pnpm hits:set --status=accepted <id>`. An input keeps at most 5 alternates; qualifying rows past them are listed with the near misses.

| relation | reads | id | anagram | justification |
|---|---|---|---|---|
| 3 | 2 | silenthilltownfall:titles:final-hill-tells-town | final town tells hill | Town and hill point to the title's setting, with final suggesting an ending. |

## Near misses

Not added; kept in `judge-output.jsonl`. The first 30 of 46, by relation and reads:

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 5 | 1 | Bucking Fastard | bastard fuck gin | Same core reveal as the cleaner version, with an added stray word. |
| 5 | 1 | Jeffrey Dahmer | jarred he eff my | Jarred is a specific, well-known fact about how he stored remains. |
| 5 | 1 | Unabomber | rune bomb a | Bomb is the single most defining fact about the Unabomber. |
| 5 | 1 | Unabomber | an rue bomb | Same defining bomb fact, with rue adding a weak hint of remorse. |
| 4 | 1 | American Horror Story | my ain horror creators | A specific factual nod to the show's actual creators. |
| 4 | 1 | Daniel Rakowitz | like to an wizard | Wizard is a specific, documented part of his self-mythology. |
| 4 | 1 | Davante Adams | dev adamant as | Same surname pun as the cleaner version, but reads as word salad. |
| 4 | 1 | Harvey Weinstein | hyenas interview | A predator metaphor paired with his known casting-interview pretext. |
| 4 | 1 | Lance Oppenheim | cinema help peon | Same direct link as the cleaner version; reads worse. |
| 4 | 1 | Michael Penix Jr. | him replace jinx | Jinx directly names his well-documented reputation for injuries. |
| 4 | 1 | Silent Hill: Townfall | fallen hill slit town | Fallen plus town closely paraphrases the game's title. |
| 4 | 1 | Silent Hill: Townfall | fallen hills til town | Fallen plus town closely paraphrases the title. |
| 4 | 1 | Silent Hill: Townfall | final hell till towns | Hell is a specific, well-known feature of the series' horror. |
| 4 | 1 | Silent Hill: Townfall | final hells till town | Hell(s) is a specific, recognizable feature of the series. |
| 4 | 1 | Teenage Sex and Death at Camp Miasma | decapitated management exams has a | Decapitated is a direct, specific slasher-genre reference. |
| 4 | 1 | Teenage Sex and Death at Camp Miasma | decapitated nametag has mean exams | Decapitated plus nametag directly evoke a camp slasher film. |
| 4 | 1 | The Life of a Showgirl | offstage hillier who | Offstage is a precise match to the title's on-stage/off-stage theme. |
| 4 | 1 | To Catch a Predator | trapdoor teach cat | Same apt trapdoor image, with weaker surrounding words. |
| 4 | 1 | To Catch a Predator | tea catch trapdoor | Trapdoor is an apt image for the show's entrapment format. |
| 3 | 1 | American Horror Story | romance horror is tray | Romance and horror together loosely fit the show's recurring mix. |
| 3 | 1 | Arun Gawli | gun air law | Gun and law together loosely trace his path from gangster to politician. |
| 3 | 1 | Avengers: Doomsday | savagery send doom | Savagery loosely fits the film's apocalyptic battle theme. |
| 3 | 1 | Avengers: Endgame | sand game revenge | Revenge loosely names the film's emotional core. |
| 3 | 1 | Bonnie Blue | nubile bone | Nubile is a real, if crude, word for her public persona. |
| 3 | 1 | Cleopatra | placate or | Placate loosely captures her diplomatic use of charm. |
| 3 | 1 | Harvey Weinstein | new hires naivety | Loosely evokes the junior employees he was accused of preying on. |
| 3 | 1 | Jeffrey Dahmer | harmed jefe fry | Harmed and fry loosely gesture at his murders and alleged cannibalism. |
| 3 | 1 | Lili Reinhart | ain thriller i | Thriller loosely names the genre of her best-known show. |
| 3 | 1 | Line of Fire | in rifle foe | Rifle and foe loosely conjure the combat implied by Line of Fire. |
| 3 | 1 | Nigella Lawson | an slow nigella | Slow loosely matches her deliberate, indulgent on-screen style. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| buckingfastard:titles | Bucking Fastard | Bucking Fastard is a 2026 film directed by Werner Herzog. | already on the input |
| edhenry:people | Ed Henry | Ed Henry is an American television reporter and correspondent. | already on the input |
| forgottenisland:titles | Forgotten Island | Forgotten Island is a 2026 animated film directed by Joel Crawford and Januel Mercado. | already on the input |
| avengersdoomsday:titles | Avengers: Doomsday | Avengers: Doomsday is an upcoming film directed by Anthony and Joe Russo. | already on the input |
| candicebergen:people | Candice Bergen | Candice Bergen is an American actress (born 1946). | already on the input |
| davanteadams:people | Davante Adams | Davante Adams is an American football player (born 1992). | already on the input |
| harveyweinstein:people | Harvey Weinstein | Harvey Weinstein is an American film producer and sex offender (born 1952). | already on the input |
| lanceoppenheim:people | Lance Oppenheim | Lance Oppenheim is an American film director. | already on the input |
| silenthilltownfall:titles | Silent Hill: Townfall | Silent Hill: Townfall is a 2026 video game developed by Screen Burn and Annapurna Interactive. | already on the input |
| theparadise:titles | The Paradise | The Paradise is a 2026 film by Srikanth Odela. | already on the input |
| daydrinker:titles | Day Drinker | Day Drinker is an upcoming film directed by Marc Webb. | already on the input |
| heartofthebeast:titles | Heart of the Beast | Heart of the Beast is a 2026 film directed by David Ayer. | already on the input |
| americanhorrorstory:titles | American Horror Story | American Horror Story is an American anthology horror television series. | already on the input |
| cleopatra:people | Cleopatra | Cleopatra was Queen of Ptolemaic Kingdom of Egypt from 51 to 30 BCE. | already on the input |
| gyaneshkumar:people | Gyanesh Kumar | Gyanesh Kumar is a 26th Chief Election Commissioner of India (Retd. IAS Officer). | already on the input |
| tombateman:people | Tom Bateman | Tom Bateman is a British actor. | already on the input |

## Senses

The sense a word reads in, in this anagram, where the dictionary's first sense would not explain it; Discover shows it first. Merging accepts these; change one with `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`.

- `avengersdoomsday:titles:avengers-days-doom`: Avengers: Doomsday → days doom avengers
  - doom: The noun for apocalyptic fate, not the verb 'to decree.' (dictionary: decree or designate beforehand)
- `tombateman:people:batman-me-to`: Tom Bateman → me to batman
  - batman: Read here as the superhero Batman, not the military-orderly sense listed. (dictionary: an orderly assigned to serve a British military officer)
- `tombateman:people:batman-tome`: Tom Bateman → batman tome
  - batman: Read here as the superhero Batman, not the military-orderly sense listed. (dictionary: an orderly assigned to serve a British military officer)

## Display

How each of these reads on Discover, as the judge proposed and the check allowed: listed forms, punctuation and capitals over the same words. Merging accepts these; change one with `pnpm hits:display <id> "…"`, or return it to the words with `--clear`.

- `silenthilltownfall:titles:final-hell-tills-town`: Silent Hill: Townfall → Final hell tills town. (the words: final hell tills town)
- `americanhorrorstory:titles:arty-horror-is-romance`: American Horror Story → Arty horror is romance. (the words: arty horror is romance)
