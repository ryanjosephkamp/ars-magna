# Ingest 2026-09-13

Queue: /Users/noir/Documents/ars-magna/ars-magna/data/queue/2026-09-13m
Verdicts: 1390 read · 1390 valid · 0 rejected
Hits: 17 new in data/hits.jsonl (14 accepted, 3 alternates proposed) · 1115 near misses kept in judge-output.jsonl
Candidates moved to enumerated: 34

Merging this pull request accepts every hit under Interesting and A stretch. Greatest Hits changes only when the operator promotes a hit by name.

## Interesting

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 4 | 2 | Theranos | not share | Theranos was famously secretive, refusing to share how its blood-testing machines worked or let outsiders check its results. |
| 4 | 2 | Windows on the World | lower dish downtown | Windows on the World was a restaurant in Lower Manhattan, so a 'dish' served 'downtown' in 'lower' Manhattan describes it. |

## A stretch

| relation | reads | input | anagram | justification |
|---|---|---|---|---|
| 3 | 3 | Morgan Stanley | my strange loan | Morgan Stanley is a bank, and strange loans such as the mortgage securities of 2008 are the kind of business banks are blamed for. |
| 3 | 3 | Morgan Stanley | monetary slang | Morgan Stanley is an investment bank, a world steeped in money jargon, so "monetary slang" loosely describes its daily talk. |
| 3 | 2 | American Airlines | inane car air miles | The anagram contains 'air miles', the frequent-flyer points American Airlines awards passengers through its AAdvantage program. |
| 3 | 2 | British Airways | rishi away brits | British Airways flies Brits away on holiday, and Rishi Sunak was a British prime minister. |
| 3 | 2 | Cantor Fitzgerald | trading loft craze | Cantor Fitzgerald is a bond-trading firm, and 'trading loft craze' evokes a frenzied trading floor. |
| 3 | 2 | Cantor Fitzgerald | trading froze talc | Cantor Fitzgerald is a trading firm, and 'trading froze' describes markets halting, as they did after the firm lost its offices on 9/11. |
| 3 | 2 | General Motors | enlarge motors | General Motors is a carmaker, and 'enlarge motors' fits its long history of big V8 engines. |
| 3 | 2 | Harley-Davidson | navy shield road | Harley-Davidson's logo is the bar-and-shield, and its touring bikes carry 'Road' names like Road King. |
| 3 | 2 | Morgan Stanley | an morgan style | Morgan Stanley was founded by partners of J.P. Morgan's bank, so "a Morgan style" fits a firm run in the Morgan manner. |
| 3 | 2 | Seattle Seahawks | lake state washes | Seattle sits on Lake Washington in Washington State, and 'lake', 'state' and 'washes' echo both of those names. |
| 3 | 2 | Theranos | trash one | Theranos was hyped as revolutionary, but its blood-testing technology turned out not to work, making it a trash one. |
| 3 | 2 | Windows on the World | downtown wild heros | The restaurant was in downtown Manhattan's World Trade Center, and 'heros' recalls the 9/11 rescuers there. |

## Alternates

These qualify, but their input already has three hits on a shelf. They are proposed; accept one with `pnpm hits:set --status=accepted <id>`.

| relation | reads | id | anagram | justification |
|---|---|---|---|---|
| 3 | 2 | goldmansachs:companies:cash-longs-mad | mad cash longs | Goldman Sachs is a trading giant known for huge profits; 'mad cash' is slang for lots of money and 'longs' are bets on rising prices. |
| 3 | 2 | morganstanley:companies:analyst-monger | monger analyst | Morgan Stanley employs traders and research analysts, and a "monger" is a dealer, so the phrase names two Wall Street jobs. |
| 3 | 2 | morganstanley:companies:argent-loans-my | my argent loans | Argent means silver or money, and loans are core bank business, so "my money loans" loosely describes a bank like Morgan Stanley. |

## Near misses

Not added; kept in `judge-output.jsonl`. The first 30 of 1115, by relation and reads:

| relation | reads | input | anagram | rationale |
|---|---|---|---|---|
| 3 | 1 | American Airlines | ain arc i earn miles | Contains the phrase 'i earn miles', a loose but real frequent-flyer link. |
| 3 | 1 | American Airlines | ain car i earn miles | Contains the phrase 'i earn miles', a loose but real frequent-flyer link. |
| 3 | 1 | American Airlines | rec in ana air miles | Contains the phrase 'air miles', a loose but real frequent-flyer link. |
| 3 | 1 | American Airlines | i earn air can miles | 'earn', 'air' and 'miles' together loosely evoke earning air miles. |
| 3 | 1 | American Airlines | nae in car air miles | Contains the phrase 'air miles', a loose but real frequent-flyer link. |
| 3 | 1 | American Airlines | car nai i earn miles | Contains the phrase 'i earn miles', a loose but real frequent-flyer link. |
| 3 | 1 | Goldman Sachs | sold scam hang | 'sold scam' fits the firm's mortgage-securities fraud case, despite the stray 'hang'. |
| 3 | 1 | Harley-Davidson | visor handle day | Two motorcycle-gear words give a loose link. |
| 3 | 1 | Harley-Davidson | live handy roads | Loosely echoes the brand's live-to-ride road culture. |
| 3 | 1 | Nishiyama Onsen Keiunkan | aeon skunk yeah simian inn | Aeon and inn loosely nod to the world's oldest hotel; the rest is noise. |
| 3 | 1 | Nishiyama Onsen Keiunkan | inn hike mike annoys sauna | Inn, hike and sauna loosely evoke a mountain hot-spring inn; the other words are unrelated. |
| 3 | 1 | Nishiyama Onsen Keiunkan | inn hike anyone skim sauna | Inn, hike and sauna loosely evoke a mountain hot-spring inn; the other words are unrelated. |
| 3 | 1 | Nishiyama Onsen Keiunkan | okay asian kinsmen hue inn | Asian kinsmen and inn loosely describe a family-run Japanese inn; the phrase is still word salad. |
| 3 | 1 | Nishiyama Onsen Keiunkan | inn hue mayonnaise ask kin | Inn plus kin loosely echoes the famous family-run history; the rest is noise. |
| 3 | 1 | Nishiyama Onsen Keiunkan | uneasy hakim soak nine inn | Soak plus inn loosely evokes a hot-spring inn; the rest is unrelated. |
| 3 | 1 | Nishiyama Onsen Keiunkan | inn hie kinsmen okay sauna | Inn, kinsmen and sauna loosely echo a family-run hot-spring inn; the phrase does not cohere. |
| 3 | 1 | Nishiyama Onsen Keiunkan | inn hike yeoman skin sauna | Inn, hike and sauna loosely evoke a mountain hot-spring inn; the other words are unrelated. |
| 3 | 1 | Volkswagen | van skew gol | Two words name Volkswagen vehicle types or models, a loose but real link. |
| 3 | 1 | Volkswagen | keg slow van | Slow van loosely evokes the sluggish VW bus; keg is filler. |
| 3 | 1 | Windows on the World | whose twin world don | 'Twin' plus 'world' loosely points to the Twin Towers. |
| 3 | 1 | Windows on the World | whose twin lord down | 'Twin' and 'down' loosely recall the towers' fall amid salad. |
| 2 | 2 | American Airlines | car in same airline | Only 'airline', carried over from the input itself, connects; the other words are unrelated filler. |
| 2 | 2 | Berkshire Hathaway | a hit by share hawker | 'Share hawker' means stock peddler, generic and not Berkshire-specific; one-word link. |
| 2 | 2 | Berkshire Hathaway | bah i wreak thy share | Only 'share' evokes Berkshire stock; 'wreak thy share' has no Berkshire meaning. |
| 2 | 2 | Berkshire Hathaway | bay hawker hit share | 'Share' and 'hawker' suggest stock selling, generic and not Berkshire-specific. |
| 2 | 2 | Berkshire Hathaway | share bet hairy hawk | 'Share' and 'bet' are market words, but nothing Berkshire-specific; 'hairy hawk' is noise. |
| 2 | 2 | British Airways | wiry sitar sahib | Only the Raj flavour of 'sahib' faintly recalls Britain. |
| 2 | 2 | General Motors | generals motor | Nearly the name itself with the s moved; link only through the kept word 'motor'. |
| 2 | 2 | Goldman Sachs | cash mans gold | 'cash' and 'gold' suggest money, but 'gold' is kept from the name; a thin link. |
| 2 | 2 | Harley-Davidson | handle advisory | Only 'handle' faintly suggests handlebars. |
