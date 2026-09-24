# Ingest 2026-09-23

Queue: /home/user/ars-magna/data/queue/2026-09-23
Verdicts: 23 read · 23 valid · 0 rejected
Hits: 14 new in data/hits.jsonl (9 accepted, 5 alternates proposed) · 9 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 41

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 5, flagged for Greatest Hits | 3 | Bucking Fastard | bastard fucking | The film's own letters spell out the vulgar phrase 'bastard fucking,' exactly the joke its odd title hides. |
| 5, flagged for Greatest Hits | 2 | Bucking Fastard | bastard fuck gin | Still spells the hidden vulgar phrase 'bastard fuck,' with a stray extra word tacked on the end. |
| 4 | 3 | Bucking Fastard | fucking sad brat | The hidden profanity fucking pairs naturally here with sad brat, forming a complete insulting phrase. |
| 4 | 3 | Candice Bergen | canned iceberg | Her surname Bergen sounds like berg, so the anagram spells out the related word iceberg outright. |
| 4 | 3 | Forgotten Island | not forget island | The letters of Forgotten rearrange into 'not forget,' ironically reversing the title's own meaning. |
| 4 | 3 | Heart of the Beast | earth of the beast | Heart's letters rearrange into Earth, so the title becomes the coherent alternate 'Earth of the Beast.' |
| 4 | 3 | Heart of the Beast | hater of the beast | Heart becomes hater through the same letters, turning the title menacingly into 'Hater of the Beast.' |
| 4 | 3 | Heart of the Beast | earth of the beats | Rearranging both heart and beast gives earth and beats, doubling the pun in one alternate title. |
| 4 | 2 | Candice Bergen | canned berg ice | Splitting into berg and ice separately still echoes her surname Bergen's icy sound in two pieces. |

## Alternates

These qualify, but their input already has three hits on a shelf. They are proposed; accept one with `pnpm hits:set --status=accepted <id>`. An input keeps at most 5 alternates; qualifying rows past them are listed with the near misses.

| relation | reads | id | anagram | justification |
|---|---|---|---|---|
| 4 | 3 | heartofthebeast:titles:beats-hater-of-the | hater of the beats | Swapping heart for hater and beast for beats yields a second, darker alternate reading of the title. |
| 4 | 2 | buckingfastard:titles:bard-fucking-sat | fucking bard sat | Same hidden profanity as elsewhere, with bard and sat left as unconnected filler words. |
| 4 | 2 | buckingfastard:titles:brad-fucking-sat | fucking brad sat | The title's hidden fucking survives, but the rest merely names someone called Brad sitting down. |
| 4 | 2 | heartofthebeast:titles:heartbeat-heft-so | so heft heartbeat | The word heartbeat sits concealed in the title's letters, a neat find given the film is named for a heart. |
| 4 | 2 | heartofthebeast:titles:heartbeats-of-the | of the heartbeats | Hidden among the title's own letters is the single word heartbeats, fitting for something with a heart. |

## Near misses

Not added; kept in `judge-output.jsonl`.

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 4 | 1 | Bucking Fastard | fucking tad bars | Same hidden profanity, with no coherent supporting phrase. |
| 4 | 1 | Bucking Fastard | fucking brad tas | Weakest reading of the hidden-profanity family; mostly word salad. |
| 4 | 1 | Bucking Fastard | fucking stab rad | Only the core hidden profanity survives; the rest doesn't cohere. |
| 4 | 1 | Candice Bergen | can berg ice den | Same pun as the others, the weakest-reading of the four variants. |
| 4 | 1 | Candice Bergen | den can iceberg | Same surname pun as the cleaner version, but this ordering is word salad. |
| 3 | 1 | Nigella Lawson | now ill lasagne | Loose food-word link only; the rest is filler with no bearing on her. |
| 3 | 1 | Nigella Lawson | won ill lasagne | Same isolated food link as the other three; reads as word salad. |
| 3 | 1 | Nigella Lawson | lasagne will no | Same weak dish-based link in a different order; still doesn't read as a sentence. |
| 3 | 1 | Nigella Lawson | on will lasagne | Loose food-based link to a celebrity chef; the words don't form a real sentence. |

## About

What each input is, as its hits now carry it. Merging accepts these sentences; change one with `pnpm hits:describe <candidate> "One sentence."`.

| candidate | input | sentence | from |
|---|---|---|---|
| buckingfastard:titles | Bucking Fastard | Bucking Fastard is a 2026 film directed by Werner Herzog. | already on the input |
| candicebergen:people | Candice Bergen | Candice Bergen is an American actress (born 1946). | already on the input |
| forgottenisland:titles | Forgotten Island | Forgotten Island is a 2026 animated film directed by Joel Crawford and Januel Mercado. | already on the input |
| heartofthebeast:titles | Heart of the Beast | Heart of the Beast is a 2026 film directed by David Ayer. | already on the input |

## Senses

The sense a word reads in, in this anagram, where the dictionary's first sense would not explain it; Discover shows it first. Merging accepts these; change one with `pnpm hits:sense <id> <word> "One sentence."`, or remove it with `--clear`.

- `candicebergen:people:canned-iceberg`: Candice Bergen → canned iceberg
  - canned: Preserved or packaged in a sealed container, as with food. (dictionary: recorded for broadcast)
- `candicebergen:people:berg-canned-ice`: Candice Bergen → canned berg ice
  - canned: Preserved or packaged in a sealed container, as with food. (dictionary: recorded for broadcast)
- `buckingfastard:titles:bard-fucking-sat`: Bucking Fastard → fucking bard sat
  - sat: Past tense of sit. (dictionary: the seventh and last day of the week; observed as the Sabbath by Jews and some Christians)
- `buckingfastard:titles:brad-fucking-sat`: Bucking Fastard → fucking brad sat
  - brad: A common short form of the male name Bradley. (dictionary: a small nail)
  - sat: Past tense of sit. (dictionary: the seventh and last day of the week; observed as the Sabbath by Jews and some Christians)
