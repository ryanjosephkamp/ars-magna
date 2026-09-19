# Ingest 2026-09-19

Queue: /home/user/ars-magna/data/queue/2026-09-19
Verdicts: 51 read · 51 valid · 0 rejected
Hits: 16 new in data/hits.jsonl (12 accepted, 4 alternates proposed) · 34 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 94

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 5, flagged for Greatest Hits | 3 | The Sheep Detectives | sheep detect thieves | Directly states the show's premise: sheep detectives who detect thieves. |
| 4 | 3 | Oliver Reed | revel or die | Oliver Reed was famous for hard-drinking revelry and died following a drinking session. |
| 4 | 3 | Sienna Miller | insane miller | Her first name Sienna rearranges to 'insane', paired with her real surname Miller, punning on her own name. |
| 4 | 3 | The Sheep Detectives | cheep detest thieves | 'Cheep' puns on sheep, and detesting thieves is exactly what detectives do in the show. |
| 4 | 3 | The Sheep Detectives | these hep detectives | Describes the sheep detectives themselves as 'hep' (cool, in the know), fitting the show directly. |
| 4 | 2 | Colin Kaepernick | iconic kneel park | His kneeling protest during the national anthem became an iconic, defining image. |
| 4 | 2 | Sienna Miller | inane millers | Her name Sienna rearranges to 'inane', combined with her surname Miller, punning on her own name. |
| 4 | 2 | Thomas Silverstein | i is not harmless vet | Thomas Silverstein was one of the most violent federal prisoners ever, the opposite of 'harmless'. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 2 | Sean McDermott | command setter | As head coach, he sets the plays and commands, fitting 'command setter'. |
| 3 | 2 | Sean McDermott | commander test | As head coach, Sean McDermott commands the team and is tested every season. |
| 3 | 2 | Sienna Miller | sane miller in | 'Sane miller' inverts the 'insane' pun on her name, playing on the opposite reading of Sienna. |
| 3 | 2 | The Scandal | snatch deal | A hastily grabbed, shady 'snatch deal' evokes the secretive dealing central to any scandal. |

## Alternates

These qualify, but their input already has three hits on a shelf. They are proposed; accept one with `pnpm hits:set --status=accepted <id>`. An input keeps at most 5 alternates; qualifying rows past them are listed with the near misses.

| relation | reads | id | anagram | justification |
|---|---|---|---|---|
| 4 | 3 | thesheepdetectives:titles:detest-sheep-the-vice | the sheep detest vice | Describes the sheep detectives as detesting vice, fitting a crime-solving detective show. |
| 4 | 3 | thesheepdetectives:titles:he-species-the-vetted | he vetted the species | Puns on 'vet' as both investigate and veterinarian, apt since sheep (a species) are the detectives. |
| 4 | 2 | thesheepdetectives:titles:deceit-sheep-the-vets | the sheep vets deceit | Puns on 'vets' (investigates, and veterinarian) for sheep detectives uncovering deceit. |
| 3 | 2 | thesheepdetectives:titles:deceptive-sheets-the | the deceptive sheets | 'Deceptive' echoes 'detective' and 'sheets' echoes 'sheep', both punning on the show's title. |

## Near misses

Not added; kept in `judge-output.jsonl`. The first 30 of 34, by relation and reads:

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 4 | 1 | Colin Kaepernick | piano crick kneel | Contains the exact verb 'kneel' naming his defining protest act. |
| 4 | 1 | Courtney Stodden | dry due to consent | Same direct link via 'consent' to her defining controversy. |
| 4 | 1 | Courtney Stodden | troy consent dude | 'Consent' names the exact controversy that made her famous. |
| 4 | 1 | Howard Graham Buffett | daft haw bought farmer | 'Farmer' is his actual, specific documented occupation. |
| 4 | 1 | Ms. Rachel | hers calm | Same accurate description of her calm persona, reversed order. |
| 4 | 1 | Ms. Rachel | her calms | Directly and accurately describes her defining calm persona. |
| 3 | 1 | Aileen Wuornos | alone sure wino | Loosely describes her documented alcoholism and isolation. |
| 3 | 1 | Aileen Wuornos | insane euro low | Same 'insane' link as above, in a weaker overall phrase. |
| 3 | 1 | Aileen Wuornos | insane rule woo | 'Insane' points to the real debate over her mental state at trial. |
| 3 | 1 | Colin Kaepernick | i cock in kneel rap | Contains 'kneel' but buried in an otherwise incoherent phrase. |
| 3 | 1 | Diana, Princess of Wales | an pair confessed wails | References her well-known televised confession about her marriage. |
| 3 | 1 | Diana, Princess of Wales | windscreen foals paisa | Dark but specific echo of the car crash that killed her. |
| 3 | 1 | Elizabeth Báthory | ably theorize bath | Loose pun on her surname plus the many theories about her legend. |
| 3 | 1 | Giada De Laurentiis | salad intrigue aide | Same loose culinary link, weaker filler word this time. |
| 3 | 1 | Giada De Laurentiis | salad intrigue idea | Salad loosely points to her career as a chef; rest is filler. |
| 3 | 1 | Miley Cyrus | my lyric use | Generic but fitting reference to her career writing song lyrics. |
| 3 | 1 | MobLand | band mol | Pun on 'moll' plus 'band' fitting the crime drama's world. |
| 3 | 1 | MobLand | lam bond | Both words carry crime connotations fitting the show's premise. |
| 3 | 1 | MobLand | nab mold | 'Nab' is specific crime/police slang fitting the setting. |
| 3 | 1 | Peter Max | expat erm | Same emigration fact, framed around his adult career instead. |
| 3 | 1 | Peter Max | expat mer | Third phrasing of the same underlying emigration fact. |
| 3 | 1 | Peter Max | expat rem | Loose but real fact: Max was a German-born immigrant to the US. |
| 3 | 1 | Randy Pedersen | spare nerd deny | 'Spare' is specific bowling terminology fitting his profession. |
| 3 | 1 | Thomas Silverstein | violent hamsters is | The word 'violent' fits him precisely despite the nonsensical rest. |
| 3 | 1 | Warren Beatty | betrayer want | Loosely fits his famous pre-marriage reputation as a womanizer. |
| 3 | 1 | Warren Buffett | buffet err want | Standard homophone pun on his own surname. |
| 3 | 1 | Warren Buffett | raw buffet rent | Third variant of the same surname-homophone pun. |
| 3 | 1 | Warren Buffett | raw buffet tern | Fifth variant of the same surname-homophone pun. |
| 3 | 1 | Warren Buffett | war buffet rent | Same surname homophone, different filler words. |
| 3 | 1 | Warren Buffett | war buffet tern | Fourth variant of the same surname-homophone pun. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| thesheepdetectives:titles | The Sheep Detectives | The Sheep Detectives is a 2026 film directed by Kyle Balda. | already on the input |
| oliverreed:people | Oliver Reed | Oliver Reed was a British actor (1938–1999). | already on the input |
| siennamiller:people | Sienna Miller | Sienna Miller is a British-American actress. | already on the input |
| colinkaepernick:people | Colin Kaepernick | Colin Kaepernick is an American football player (born 1987). | already on the input |
| thomassilverstein:people | Thomas Silverstein | Thomas Silverstein was an American murderer (1952-2019). | already on the input |
| seanmcdermott:people | Sean McDermott | Sean McDermott is an American football coach (born 1974). | already on the input |
| thescandal:titles | The Scandal | The Scandal is a 2026 South Korean television series. | already on the input |

## Senses

The sense a word reads in, in this anagram, where the dictionary's first sense would not explain it; Discover shows it first. Merging accepts these; change one with `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`.

- `siennamiller:people:insane-miller`: Sienna Miller → insane miller
  - miller: Her own surname, not the 1940s bandleader Glenn Miller. (dictionary: United States bandleader of a popular big band (1909-1944))
- `siennamiller:people:inane-millers`: Sienna Miller → inane millers
  - millers: Her own surname pluralised, not the 1940s bandleader Glenn Miller. (dictionary: United States bandleader of a popular big band (1909-1944))
- `seanmcdermott:people:command-setter`: Sean McDermott → command setter
  - setter: Read as one who sets plans or plays, not the typesetting sense. (dictionary: one who sets written material into type)
- `siennamiller:people:in-miller-sane`: Sienna Miller → sane miller in
  - miller: Her own surname, not the 1940s bandleader Glenn Miller. (dictionary: United States bandleader of a popular big band (1909-1944))
- `thesheepdetectives:titles:he-species-the-vetted`: The Sheep Detectives → he vetted the species
  - vetted: Also carries the sense of investigate or check thoroughly, layered with the veterinary meaning. (dictionary: work as a veterinarian)
- `thesheepdetectives:titles:deceit-sheep-the-vets`: The Sheep Detectives → the sheep vets deceit
  - vets: Also carries the sense of investigates or checks thoroughly, layered with the veterinary meaning. (dictionary: a doctor who practices veterinary medicine)
