# Names experiment: one deep run with the names list admitted (2026-09-21)

Phase Q1 (decision D36). The vocabulary has no names; this run admitted the names list, `data/vocabulary/names.jsonl`, beside Common for one deep run over fifty inputs, to see what names are worth in a phrase. Nothing here is published: the verdicts were not ingested into `data/hits.jsonl`, and whether names are admitted by default (Q2) is the operator's decision on this report.

## The run

- Queue `data/queue/2026-09-21n`, settings `s4`, the deep preset: tier `common` plus the admitted words, words of 3 letters or more with the 28 short words, at most 5 words, every spelling (cap 64), the first 50,000 results plus 5,000 sampled (seed 1), the text itself excluded; 9,506 words admitted beside Common: the 2 site additions and 9,504 names.
- Dictionary enumerated with: English OpenList `368bf0e44604` built with the names list as Extended-only words, word list sha256 `790e94156349cd53b70ea8ab5d50ae95a59c7559182aded759dd23dcefe144e8` (`pnpm dict:build --names`, never committed). The site's own word list is `fa3dac892b6f3e7b2449b972f74d9805e529942afbc9d648b74da6ce319eee4f`.
- Names list: 9,504 names, sha256 `478f421a3b33629f5da088cb55681c6307baafa30a495e2f724c04569c5e3203`; by kind 3,351 surname, 3,156 place, 1,633 person, 764 given, 401 company, 199 brand.
- Prefilter at 300 phrases per input; screen by `claude-sonnet-5` subagents, one per file, each reading every phrase of its file; judge by `claude-opus-5` subagents, one per file, each writing every sentence for its own row; rubric v2; ingest run with the engine check on, then its writes to `data/hits.jsonl` and `data/candidates.jsonl` set aside.
- 4,330,466 raw rows enumerated; 11,347 phrases sent to the screen; the screen kept 448; 448 verdicts.

## The fifty inputs

The manual candidates last run under settings before s3 (`--source=manual --settings-before=s3`, 250 of them), fifty drawn by category so each category reads on its own: 9 people, 9 titles, 8 places, 8 phrases, 8 companies, 8 products, each category ordered by sha256("2026:<id>") and the first taken (seed 2026). Counts are the engine's, with and without the names admitted; an input over 50,000 got up to three anchors with a clear link, each checked to fit its letters.

| Input | Category | Without names | With names | Anchors | Screened | Kept | Kept with a name | Relation 3+ | Of which with a name |
|---|---|---|---|---|---|---|---|---|---|
| Albert Einstein | people | 28,725 | 38,197 |  | 300 | 33 | 5 | 4 | 2 |
| Arnold Schwarzenegger | people | 173,115 | 702,506 | conan, screen, legend | 300 | 0 | 0 | 0 | 0 |
| Charles Darwin | people | 3,984 | 6,904 |  | 300 | 24 | 0 | 6 | 0 |
| Keanu Reeves | people | 135 | 224 |  | 300 | 2 | 1 | 0 | 0 |
| Meryl Streep | people | 118 | 142 |  | 300 | 4 | 0 | 0 | 0 |
| Morgan Freeman | people | 2,147 | 3,211 |  | 300 | 1 | 0 | 0 | 0 |
| Serena Williams | people | 26,349 | 37,341 |  | 300 | 7 | 1 | 1 | 0 |
| Tom Cruise | people | 225 | 306 |  | 300 | 12 | 1 | 0 | 0 |
| William Shakespeare | people | 917,679 | 1,845,809 | lear, ariel, speak | 300 | 50 | 2 | 6 | 1 |
| Back to the Future | titles | 11,283 | 22,411 |  | 300 | 0 | 0 | 0 | 0 |
| Friends | titles | 12 | 13 |  | 27 | 0 | 0 | 0 | 0 |
| Hotel California | titles | 123,418 | 264,363 | hell, chill, recall | 300 | 0 | 0 | 0 | 0 |
| Macbeth | titles | 7 | 7 |  | 12 | 0 | 0 | 0 | 0 |
| Pride and Prejudice | titles | 18,820 | 53,110 | jane, cupid, dance | 300 | 7 | 0 | 3 | 0 |
| The Great Gatsby | titles | 2,812 | 3,570 |  | 300 | 7 | 1 | 0 | 0 |
| The Matrix | titles | 29 | 40 |  | 79 | 6 | 0 | 1 | 0 |
| The Silence of the Lambs | titles | 5,615,558 | 9,894,698 | moth, beans, flesh | 300 | 18 | 0 | 15 | 0 |
| The Simpsons | titles | 514 | 564 |  | 300 | 1 | 1 | 0 | 0 |
| Eiffel Tower | places | 440 | 552 |  | 300 | 17 | 3 | 2 | 1 |
| Manchester | places | 228 | 348 |  | 300 | 9 | 1 | 2 | 0 |
| Melbourne | places | 77 | 100 |  | 300 | 5 | 2 | 2 | 0 |
| Mount Rushmore | places | 3,436 | 4,947 |  | 300 | 3 | 0 | 2 | 0 |
| Neatsville, Kentucky | places | 151,536 | 382,754 | tiny, cattle, unseen | 300 | 0 | 0 | 0 | 0 |
| Silicon Valley | places | 2,424 | 4,686 |  | 300 | 13 | 3 | 4 | 2 |
| The White House | places | 1,872 | 2,595 |  | 300 | 2 | 0 | 0 | 0 |
| Wall Street | places | 71 | 108 |  | 300 | 9 | 0 | 2 | 0 |
| debit card | phrases | 57 | 60 |  | 179 | 13 | 4 | 1 | 0 |
| Funeral | phrases | 11 | 13 |  | 38 | 8 | 0 | 1 | 0 |
| happy birthday | phrases | 194 | 331 |  | 300 | 8 | 0 | 0 | 0 |
| president of the united states | phrases | 49,142,460 | 88,659,321 | senate, oath, taft | 300 | 25 | 12 | 16 | 12 |
| Punishment | phrases | 229 | 279 |  | 300 | 20 | 2 | 8 | 0 |
| Slot machines | phrases | 7,420 | 10,475 |  | 300 | 13 | 1 | 7 | 0 |
| Softheartedness | phrases | 42,065 | 48,532 |  | 300 | 31 | 1 | 4 | 0 |
| the eyes | phrases | 4 | 5 |  | 14 | 1 | 0 | 1 | 0 |
| Ferrari | companies | 5 | 6 |  | 10 | 3 | 0 | 0 | 0 |
| Lufthansa | companies | 41 | 55 |  | 165 | 8 | 2 | 4 | 1 |
| Mattel | companies | 5 | 5 |  | 14 | 0 | 0 | 0 | 0 |
| McDonald's | companies | 1 | 1 |  | 3 | 0 | 0 | 0 | 0 |
| Morgan Stanley | companies | 9,321 | 13,569 |  | 300 | 10 | 0 | 4 | 0 |
| Pizza Hut | companies | 0 | 4 |  | 6 | 1 | 1 | 0 | 0 |
| Volkswagen | companies | 59 | 88 |  | 231 | 0 | 0 | 0 | 0 |
| Western Union | companies | 1,687 | 2,286 |  | 300 | 0 | 0 | 0 | 0 |
| Etch A Sketch | products | 43 | 78 |  | 211 | 2 | 0 | 2 | 0 |
| Instagram | products | 162 | 176 |  | 300 | 39 | 6 | 2 | 0 |
| Nespresso | products | 25 | 25 |  | 65 | 5 | 0 | 2 | 0 |
| Nutella | products | 8 | 13 |  | 28 | 1 | 1 | 1 | 1 |
| Photoshop | products | 19 | 19 |  | 65 | 8 | 0 | 1 | 0 |
| Tamagotchi | products | 224 | 371 |  | 300 | 2 | 1 | 0 | 0 |
| Tesla Model S | products | 1,102 | 1,212 |  | 300 | 12 | 1 | 3 | 0 |
| Toblerone | products | 81 | 117 |  | 300 | 8 | 5 | 1 | 1 |

## What the names were worth

- The screen kept **448** phrases; **58** of them (13%) use a name from the list.
- **108** verdicts reached relation 3 or better; **21** of those use a name.
- Relation scores over every verdict: 1: 184, 2: 156, 3: 89, 4: 17, 5: 2.
- Relation scores over the verdicts on a phrase with a name: 1: 24, 2: 13, 3: 21.

### The phrases with a name that reached relation 3 or better

| Input | Anagram | Relation | Reads | The name, its kind | Justification |
|---|---|---|---|---|---|
| Eiffel Tower | we rot eiffel | 3 | 2 | `eiffel` (person, Gustave Eiffel) | The iron tower has to be repainted every few years to hold off rust, and neglected corrosion is a recurring news story about it. |
| Lufthansa | fault hans | 3 | 2 | `hans` (person, Hans Christian Andersen) | Lufthansa is Germany's flag carrier, and Hans is a stock German first name, so the phrase pins blame on a German. |
| president of the united states | its putin defrosted the senate | 3 | 2 | `putin` (person, Vladimir Putin) | Russia's leader is a standing preoccupation of the American one, and Senate inquiries into Moscow have shadowed recent terms. |
| Silicon Valley | lovely sin cali | 3 | 2 | `cali` (place) | Cali stands for California, where the valley sits, and sets it beside the moral censure the industry regularly attracts. |
| Toblerone | berne loot | 3 | 2 | `berne` (place, Canton of Berne) | Toblerone was created in Bern and is a standard haul carried home from Swiss airports and duty-free counters. |
| Albert Einstein | its in berne let a | 3 | 1 | `berne` (place, Canton of Berne) | Einstein wrote his 1905 papers, special relativity among them, while employed at the patent office in Berne. |
| Albert Einstein | israel be intent | 3 | 1 | `israel` (place) | Israel offered Einstein its presidency in 1952, an invitation he politely turned down. |
| Nutella | lela nut | 3 | 1 | `lela` (given) | Nutella is a hazelnut and cocoa spread, so nut names the very ingredient the product is built on. |
| president of the united states | these done president suit taft | 3 | 1 | `taft` (person, William Howard Taft) | William Howard Taft held exactly the job this input names, so its letters hand back one of the men who filled it. |
| president of the united states | the side student pioneers taft | 3 | 1 | `taft` (person, William Howard Taft) | Taft was the twenty-seventh person to serve as president of the United States, and his surname drops out of the title itself. |
| president of the united states | the ruined pettiness does taft | 3 | 1 | `taft` (person, William Howard Taft) | The surname is that of William Howard Taft, who ran the country from 1909 until 1913. |
| president of the united states | this needed eruptions set taft | 3 | 1 | `taft` (person, William Howard Taft) | Taft won the 1908 election for this office, so a real winner of it is sitting inside its own letters. |
| president of the united states | its southern despite need taft | 3 | 1 | `taft` (person, William Howard Taft) | Taft, an Ohio lawyer who reached the White House, is a holder of this office, though nothing about him was southern. |
| president of the united states | the fittest reid pounds senate | 3 | 1 | `reid` (surname) | Harry Reid ran the United States Senate as majority leader, which made him the daily counterpart of whoever held this office. |
| president of the united states | these trusted die pension taft | 3 | 1 | `taft` (person, William Howard Taft) | The name here is Taft, the man Theodore Roosevelt picked to succeed him in this very office. |
| president of the united states | these desired tension put taft | 3 | 1 | `taft` (person, William Howard Taft) | This Taft is the president who lost the 1912 election to Woodrow Wilson and left office the following spring. |
| president of the united states | this opened suit resented taft | 3 | 1 | `taft` (person, William Howard Taft) | Taft, a president of famously large build whose tailoring was much remarked on, is named beside a word for clothing. |
| president of the united states | our inside stephen detest taft | 3 | 1 | `stephen` (person, Stephen Hawking); `taft` (person, William Howard Taft) | Taft was an American president, and finding his name folded inside his own job title is the link. |
| president of the united states | its present need hideouts taft | 3 | 1 | `taft` (person, William Howard Taft) | The surname belongs to William Howard Taft, who occupied the White House and afterwards the Chief Justice's chair. |
| Silicon Valley | only lives cali | 3 | 1 | `cali` (place) | Cali is a nickname for California, the state that contains Silicon Valley, so the anagram lands back on the region's home ground. |
| William Shakespeare | him air welles speak a | 3 | 1 | `welles` (person, Orson Welles) | Orson Welles built much of his career on staging and filming Shakespeare, so broadcasting Welles speaking points back at the playwright. |

### Every phrase that reached relation 3 or better, for comparison

| Input | Anagram | Relation | Reads | Uses a name | Justification |
|---|---|---|---|---|---|
| debit card | bad credit | 5 | 3 | no | People refused a credit card over a poor borrowing record fall back on the debit card, which spends only money they already hold. |
| the eyes | they see | 5 | 3 | no | Seeing is the one thing eyes do, so the letters simply restate the organ by its function. |
| Funeral | real fun | 4 | 3 | no | A burial service is the least enjoyable occasion there is, so its letters promising genuine enjoyment invert it completely. |
| Photoshop | posh photo | 4 | 3 | no | Making a picture look posh, polished and expensive is the exact job people open this program to do. |
| Punishment | nine thumps | 4 | 3 | no | A counted set of blows is this word at its most physical, and nine of them recalls the cat-o'-nine-tails used at sea. |
| Slot machines | the manic loss | 4 | 3 | no | Players feed reels in a compulsive frenzy until the money is gone, and that frenzy ending in loss is the phrase itself. |
| Slot machines | this lone scam | 4 | 3 | no | The odds on every reel are set so the house wins over time, which is why players call the whole cabinet a swindle. |
| Lufthansa | fatal huns | 4 | 2 | no | Hun was old wartime slang for a German, and Lufthansa is the German flag carrier, so this reads as deadly Germans flying. |
| Morgan Stanley | monger analyst | 4 | 2 | no | A dealer who holds stock to sell and a person skilled at reading data are two of the jobs an investment bank is staffed with. |
| Silicon Valley | social envy ill | 4 | 2 | no | The social networks built there are widely blamed for breeding envy and harming users' mental health, which these three words state outright. |
| Slot machines | scams hotline | 4 | 2 | no | Slot machines commonly carry a problem-gambling helpline number, so a hotline about the swindle is printed on the cabinet. |
| Slot machines | mine cash lost | 4 | 2 | no | The transaction a slot machine performs is turning a player's cash into nothing, told here in the loser's own voice. |
| Softheartedness | others tends safe | 4 | 2 | no | Caring for other people and keeping them from harm is precisely the disposition this word names. |
| Tesla Model S | seldom steal | 4 | 2 | no | Thieves rarely take these cars: they are connected, tracked and sit among the least stolen vehicles on the road. |
| The Silence of the Lambs | the manic stole be flesh | 4 | 2 | no | A stole is a garment worn over the shoulders, and the madman in this story is sewing exactly that from women's skin. |
| William Shakespeare | his ample wake is lear | 4 | 2 | no | Wake here means the trail a ship leaves, so the line says what Shakespeare left behind him is King Lear. |
| president of the united states | its upset interest defend oath | 4 | 1 | no | The oath sworn on taking this office promises to preserve, protect and defend the Constitution, and both of those key words emerge here. |
| The Silence of the Lambs | this safe cell been moth | 4 | 1 | no | Lecter is kept in a cell everyone treats as secure until he walks out of it, and the moth is the case's token. |
| The Silence of the Lambs | the safe scene bill moth | 4 | 1 | no | Bill is the name of the killer the agents are chasing, and the moth is the calling card he leaves behind. |
| Charles Darwin | cardinal shrew | 3 | 3 | no | Read as bird plus mammal, it sounds like a two-word species label, the sort of name the man who catalogued creatures left behind. |
| Charles Darwin | i draw her clans | 3 | 3 | no | He famously sketched branching diagrams of which creatures are kin to which, so drawing nature's family groups is close to his daily work. |
| Charles Darwin | i scrawl her dna | 3 | 3 | no | Writing out the code of inheritance fairly describes the man who first set down how traits pass between generations. |
| Morgan Stanley | monetary slang | 3 | 3 | no | The firm's whole business is money, and that trade runs on its own informal jargon, which is exactly what this phrase names. |
| Morgan Stanley | my argent loans | 3 | 3 | no | Argent is silver and, by extension, coin, so the phrase claims ownership of money lent out, which is banking in three words. |
| president of the united states | friend to the stupidest senate | 3 | 3 | no | Whoever holds this office must work with the United States Senate, and the line casts him as that chamber's insulting ally. |
| president of the united states | i fronted the stupidest senate | 3 | 3 | no | Said in the first person, it has a president boasting that he led the Senate, the chamber he governs alongside. |
| Slot machines | honest claims | 3 | 3 | no | Casinos advertise their reels as fair and regulated, so a cabinet built to drain wallets is forever making honest claims. |
| Softheartedness | these fond stares | 3 | 3 | no | Looking at people with open affection is exactly how someone tender-hearted gives themselves away. |
| Softheartedness | her fondest asset | 3 | 3 | no | For someone easily moved to pity, that warmth is the quality most worth counting as her best. |
| William Shakespeare | i sample his weak lear | 3 | 3 | no | King Lear is Shakespeare's tragedy, so this reads as a critic tasting a thin version of the playwright's own great play. |
| William Shakespeare | his pale mike was lear | 3 | 3 | no | Lear is the title role of Shakespeare's tragedy, and this casts a man of his own as the actor who played it. |
| William Shakespeare | his pale mike saw lear | 3 | 3 | no | Lear names Shakespeare's tragedy, and the line puts one of his own household in the audience for it. |
| Albert Einstein | anisette berlin | 3 | 2 | no | Einstein held his chair in Berlin from 1914 to 1932, the years in which he completed general relativity. |
| Albert Einstein | its innate rebel | 3 | 2 | no | Einstein was a lifelong nonconformist who skipped lectures, gave up his citizenship at sixteen and distrusted authority. |
| Charles Darwin | her dna is crawl | 3 | 2 | no | The line sets inherited material beside creeping movement, close to his account of life descending from low, ground-hugging ancestors. |
| Charles Darwin | crawl hand rise | 3 | 2 | no | Crawling and then rising is the popular picture of life climbing from low forms to upright ones, the story his theory is remembered for. |
| Eiffel Tower | we rot eiffel | 3 | 2 | yes: eiffel | The iron tower has to be repainted every few years to hold off rust, and neglected corrosion is a recurring news story about it. |
| Etch A Sketch | teach sketch | 3 | 2 | no | The knob-driven toy is how a great many children first work out how to draw a line and a picture. |
| Etch A Sketch | a sketch tech | 3 | 2 | no | Behind the screen sit a stylus, rails and aluminium powder, so the gadget really is a small piece of drawing machinery. |
| Instagram | anti grams | 3 | 2 | no | A 'gram is a post on the app, so this reads as a refusal of them, and it very nearly spells anagram. |
| Instagram | mag star in | 3 | 2 | no | The platform turns ordinary users into magazine-cover celebrities, which is precisely what a 'mag star' is. |
| Lufthansa | fault hans | 3 | 2 | yes: hans | Lufthansa is Germany's flag carrier, and Hans is a stock German first name, so the phrase pins blame on a German. |
| Lufthansa | an aft lush | 3 | 2 | no | Aft means the tail end of an aircraft, so these words seat a drunk passenger at the back of the cabin. |
| Lufthansa | snafu halt | 3 | 2 | no | Lufthansa flights are grounded often enough by strikes and computer failures, and a snafu halting the schedule describes exactly that. |
| Manchester | her ten macs | 3 | 2 | no | Manchester is proverbially rainy, and a mac is the waterproof coat the English reach for against it. |
| Manchester | hence trams | 3 | 2 | no | Manchester runs the Metrolink, Britain's largest tram network, so trams are one of the city's everyday emblems. |
| Melbourne | nobler emu | 3 | 2 | no | Melbourne is an Australian city and the emu is the flightless bird that stands on Australia's coat of arms. |
| Morgan Stanley | money rang last | 3 | 2 | no | Trading days close on a bell, so money ringing for the last time reads as the end of a session in the markets. |
| Mount Rushmore | south rumor men | 3 | 2 | no | The carving stands in South Dakota and shows the faces of four men, and the anagram names both of those. |
| Nespresso | on presses | 3 | 2 | no | An espresso machine drives hot water through the grounds under pressure, so pressing is precisely what this product does. |
| Nespresso | no presses | 3 | 2 | no | Nespresso sells coffee needing no plunger pot and no tamped handle, because the sealed capsule does all the work. |
| president of the united states | its putin defrosted the senate | 3 | 2 | yes: putin | Russia's leader is a standing preoccupation of the American one, and Senate inquiries into Moscow have shadowed recent terms. |
| Pride and Prejudice | jaundiced red piper | 3 | 2 | no | A jaundiced view is a biased one, so the letters find a fresh word for the prejudice the title announces. |
| Punishment | nines thump | 3 | 2 | no | Blows landing in nines echo the nine-tailed whip that once delivered sentences aboard ship. |
| Punishment | me shun pint | 3 | 2 | no | Going without your beer is the small penalty people impose on themselves, and shunning is itself a long-used sanction. |
| Punishment | the imp nuns | 3 | 2 | no | Nuns are the stock disciplinarians of schoolroom memory, and an imp is the mischief that brings the ruler down. |
| Punishment | the imps nun | 3 | 2 | no | A nun set over a pack of imps pictures discipline facing the misbehaviour it exists to correct. |
| Punishment | men shun tip | 3 | 2 | no | Withholding the gratuity is how a diner penalises bad service, a sentence passed without any court. |
| Serena Williams | mine was rallies | 3 | 2 | no | In tennis a rally is the back-and-forth exchange that decides a point, and Williams won matches by dominating them. |
| Silicon Valley | lovely sin cali | 3 | 2 | yes: cali | Cali stands for California, where the valley sits, and sets it beside the moral censure the industry regularly attracts. |
| Slot machines | claim hotness | 3 | 2 | no | Gamblers insist a particular machine is running hot and due to pay out, a superstition this states outright. |
| Softheartedness | those stern fades | 3 | 2 | no | Being soft-hearted is what shows when a person's severity gives way, and that is a stern look fading. |
| Tesla Model S | some stalled | 3 | 2 | no | A car's name rearranging into a report of vehicles that stopped running is the last headline its maker would want. |
| Tesla Model S | slalom steed | 3 | 2 | no | A steed is something you ride and a slalom is a weaving course, so together they picture a quick, agile machine. |
| The Matrix | hatter mix | 3 | 2 | no | The film sends its hero down a rabbit hole into Wonderland, the world the Mad Hatter comes from. |
| The Silence of the Lambs | the lifeless can be moth | 3 | 2 | no | A death's-head moth is the killer's calling card, left in the throats of the lifeless women he has taken. |
| The Silence of the Lambs | the fell absence is moth | 3 | 2 | no | The title names an absence of sound, and the moth is the image the film hangs on that quiet. |
| The Silence of the Lambs | the nice mob steal flesh | 3 | 2 | no | Stealing flesh is a plain description of what the murderer does to the women he abducts. |
| Toblerone | berne loot | 3 | 2 | yes: berne | Toblerone was created in Bern and is a standard haul carried home from Swiss airports and duty-free counters. |
| Wall Street | wallet rest | 3 | 2 | no | Wall Street is where American money is made and lost, so what remains of a wallet is a pointed joke. |
| Wall Street | law settler | 3 | 2 | no | Wall Street takes its name from a wall built by Dutch settlers in New Amsterdam, and its firms now live under financial law. |
| William Shakespeare | i wakes his ample lear | 3 | 2 | no | Waking his ample Lear reads as reviving the long tragedy Shakespeare wrote, the play named after its aged king. |
| Albert Einstein | its in berne let a | 3 | 1 | yes: berne | Einstein wrote his 1905 papers, special relativity among them, while employed at the patent office in Berne. |
| Albert Einstein | israel be intent | 3 | 1 | yes: israel | Israel offered Einstein its presidency in 1952, an invitation he politely turned down. |
| Charles Darwin | i draws her clan | 3 | 1 | no | Grouping living things by blood and setting that down on paper is what his notebooks of descent spent years doing. |
| Eiffel Tower | fee wore lift | 3 | 1 | no | Visitors pay a fee to ride the lifts that carry them up the tower, so those two words together name a real feature. |
| Melbourne | bourne elm | 3 | 1 | no | Melbourne's grand avenues hold some of the world's last great stands of mature elms, spared the disease that felled Europe's. |
| Mount Rushmore | hero mourn must | 3 | 1 | no | Mount Rushmore is a national memorial to four dead presidents, so grieving for heroes matches what the rock commemorates. |
| Nutella | lela nut | 3 | 1 | yes: lela | Nutella is a hazelnut and cocoa spread, so nut names the very ingredient the product is built on. |
| president of the united states | these done president suit taft | 3 | 1 | yes: taft | William Howard Taft held exactly the job this input names, so its letters hand back one of the men who filled it. |
| president of the united states | the side student pioneers taft | 3 | 1 | yes: taft | Taft was the twenty-seventh person to serve as president of the United States, and his surname drops out of the title itself. |
| president of the united states | the ruined pettiness does taft | 3 | 1 | yes: taft | The surname is that of William Howard Taft, who ran the country from 1909 until 1913. |
| president of the united states | this needed eruptions set taft | 3 | 1 | yes: taft | Taft won the 1908 election for this office, so a real winner of it is sitting inside its own letters. |
| president of the united states | its southern despite need taft | 3 | 1 | yes: taft | Taft, an Ohio lawyer who reached the White House, is a holder of this office, though nothing about him was southern. |
| president of the united states | the fittest reid pounds senate | 3 | 1 | yes: reid | Harry Reid ran the United States Senate as majority leader, which made him the daily counterpart of whoever held this office. |
| president of the united states | these trusted die pension taft | 3 | 1 | yes: taft | The name here is Taft, the man Theodore Roosevelt picked to succeed him in this very office. |
| president of the united states | the pitted founders sit senate | 3 | 1 | no | The framers who wrote the Constitution invented both this office and the Senate that sits opposite it. |
| president of the united states | these desired tension put taft | 3 | 1 | yes: taft | This Taft is the president who lost the 1912 election to Woodrow Wilson and left office the following spring. |
| president of the united states | this opened suit resented taft | 3 | 1 | yes: taft | Taft, a president of famously large build whose tailoring was much remarked on, is named beside a word for clothing. |
| president of the united states | our inside stephen detest taft | 3 | 1 | yes: stephen, taft | Taft was an American president, and finding his name folded inside his own job title is the link. |
| president of the united states | its present need hideouts taft | 3 | 1 | yes: taft | The surname belongs to William Howard Taft, who occupied the White House and afterwards the Chief Justice's chair. |
| Pride and Prejudice | jaundiced ride prep | 3 | 1 | no | To be jaundiced is to judge sourly in advance, the failing that drives the novel and names half its title. |
| Pride and Prejudice | jaundiced dire prep | 3 | 1 | no | Jaundiced means prejudging harshly, so the phrase names outright the fault Austen sets against pride in her title. |
| Punishment | hemp sin nut | 3 | 1 | no | Sin is the wrongdoing that calls for a sentence, and hemp is the fibre of the rope hangmen once used to carry one out. |
| Punishment | ten shun imp | 3 | 1 | no | Shunning someone is a penalty communities have always used, and the imp is the troublemaker being frozen out. |
| Silicon Valley | only lives cali | 3 | 1 | yes: cali | Cali is a nickname for California, the state that contains Silicon Valley, so the anagram lands back on the region's home ground. |
| Silicon Valley | evil con is ally | 3 | 1 | no | The region is known for spectacular startup frauds, and calling it an evil con puts that history into two words. |
| Slot machines | an lost chimes | 3 | 1 | no | A slot floor is a wall of ringing bells over steadily vanishing money, which is what lost chimes conjures. |
| The Silence of the Lambs | the in bleats come flesh | 3 | 1 | no | Bleating is what lambs do, and flesh is what the film's caged cannibal eats, so both content words land on it. |
| The Silence of the Lambs | the on slit became flesh | 3 | 1 | no | The film's killer cuts his victims open and sews their skin into a garment, which is slitting turned into flesh. |
| The Silence of the Lambs | the no slit became flesh | 3 | 1 | no | Making something wearable out of cut human skin is the murderer's whole project, and these two nouns describe it between them. |
| The Silence of the Lambs | this fell case been moth | 3 | 1 | no | The moth pupa found in a victim's throat is the clue that drives the FBI hunt the story follows. |
| The Silence of the Lambs | the in bleat comes flesh | 3 | 1 | no | Clarice is haunted by lambs crying out, and the prisoner she consults feeds on human flesh; the anagram holds both. |
| The Silence of the Lambs | the fine case bells moth | 3 | 1 | no | An investigation and a moth are the two halves of the plot, since the insect in a corpse gives the agents their lead. |
| The Silence of the Lambs | the fine cases bell moth | 3 | 1 | no | The agents work cases, and the moth pulled from a victim is the object those cases turn on. |
| The Silence of the Lambs | the fine cells base moth | 3 | 1 | no | Much of the film happens along a corridor of asylum cells, and the moth is its most quoted image. |
| The Silence of the Lambs | me bleat the sonic flesh | 3 | 1 | no | A title about silence gives up a bleat and a word for sound, next to the flesh the cannibal wants. |
| William Shakespeare | him air welles speak a | 3 | 1 | yes: welles | Orson Welles built much of his career on staging and filming Shakespeare, so broadcasting Welles speaking points back at the playwright. |

### Names that reached the judge

41 distinct names appear in the phrases the screen kept. The most used: `taft` (10, person), `berne` (3, place), `bern` (3, place), `cali` (2, place), `eiffel` (2, person), `sam` (2, surname), `ingram` (2, surname), `britain` (2, person), `penn` (2, person), `abd` (2, person), `keanu` (1, person), `bragg` (1, person), `reid` (1, surname), `putin` (1, person), `stephen` (1, person), `chester` (1, person), `lem` (1, person), `lebron` (1, surname), `inc` (1, company), `effie` (1, given), `lela` (1, given), `tina` (1, person), `marin` (1, surname), `nita` (1, given), `delmas` (1, place).

## What this suggests

Read as a yield: **21 of 108** phrases at relation 3 or better used a name, and **none of them reached relation 4 or 5** — every name-bearing phrase the judge rated highly was a 3, the loosest grade that still counts as a link. Of those 21, **5** also read as English (reads 2 or 3); the rest are word salad that happens to contain a famous surname.

The names that worked did so in two ways. A name that **is** the input's own subject or maker: `eiffel` for the Eiffel Tower, `berne` for Toblerone, `cali` for Silicon Valley, `hans` for Lufthansa — four of the five hits ingest would have placed. And a name that **fills a hole**, of which `taft` is the warning: 10 of the 21 were one surname dropping out of "president of the united states", each judged a 3 for naming a real holder of the office, all but one reading as salad. One name can flood an input the moment its letters fit.

Against that, the cost is measurable. Over these fifty inputs the engine found 1.81 times as many anagrams with the names admitted (56.3 million to 102.0 million; median 1.39 times per input, up to 4.06 for Pride and Prejudice), and the same batch wrote 2,725,956 rows without the names and 4,330,466 with them and the anchors. A nightly with names admitted would therefore screen its same 500 phrases an input out of a pool nearly twice as large and more diluted. The screen felt that: 19% of the 11,347 phrases it read carried a name and it kept 13% of them — names were slightly harder to keep, not easier.

**The recommendation for Q2**, which is the operator's decision and not this session's: admit the names, but not as a set on by default. An `Include names` control on Search and Build, off by default, gives a reader hunting their own name exactly what phase Q was for, and costs the pipeline nothing. For the nightly and deep runs, admit names **per input** rather than globally — the names attached to that input (`eiffel` for the Eiffel Tower, `berne` for Toblerone) are where every good hit here came from, and admitting the whole list is what lets `taft` answer for every long American phrase. If the whole list is admitted anyway, the anchor mechanism already exists to aim it, and the screen's keep cap is what holds the line.

## What ingest would have placed

The ingest ran with the engine check on against the names build, so the repeated-sentence guard, the shelves and the alternate cap all applied; its report is `ingest-report.md` beside this file's queue. Its writes to `data/hits.jsonl` and `data/candidates.jsonl` were set aside (`git checkout`), so no hit from this run is published and the candidates keep their state; the diff it would have made is kept in the handoff folder. `pnpm hits:ingest --date=2026-09-21n --model=claude-opus-5 --judged-by=hand` against a `--names` build would place them, if Q2 admits the names.

- Verdicts: 448 read · 448 valid · 0 rejected
- Hits: 47 new in data/hits.jsonl (28 accepted, 19 alternates proposed) · 194 near misses kept in judge-output.jsonl
- Candidates moved to enumerated: 50

The five it would have placed that use a name, as they would have read on Discover:

| Status | Input | As it would read | The name |
|---|---|---|---|
| accepted | Eiffel Tower | We rot Eiffel. | `eiffel` (person) |
| accepted | Lufthansa | Fault Hans. | `hans` (person) |
| accepted | Silicon Valley | Lovely sin, Cali. | `cali` (place) |
| accepted | Toblerone | Berne loot. | `berne` (place) |
| proposed | president of the united states | Its Putin defrosted the Senate. | `putin` (person) |

## Files

- `data/queue/2026-09-21n/`: `summary.json` (settings, counts, anchors, the dictionary), `additions.txt` (the admitted words, names included), `screen-input-*.md`, `screen-scores.txt`, `screen-output.jsonl`, `screened.jsonl`, `judge-output.jsonl` (every verdict, near misses included), `ingest-report.md`. `raw.jsonl`, `prefiltered.jsonl` and `judge-input-*.md` are not committed, as for every queue.
- `handoff/2026-09-21/phase-q1/` (outside the repository): the sources the list was built from, the names build's artifacts, the selection script and seed, the run list with its anchors, the counts without names, the subagents' answer files, the ingest diff set aside, and this report's generator.
