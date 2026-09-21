<!-- screen_version: v1 -->
# Screening anagrams for the Ars Magna Greatest Hits

Each section below is one **input** (a person, company, product, title, place or phrase), its **category**, and a numbered list of **phrases**. Every phrase is a rearrangement of exactly the input's letters into real English words. The letters are already checked; do not re-check them. An input with a number or a symbol in it also has a `reading:` line saying how that became letters (`1907:spell` is *one thousand nine hundred seven* spelled out, `1907:year` is *nineteen oh seven*, `2:too` is the word *too*, `4:drop` leaves the 4 out), so a phrase may use the letters of a number's name.

Your only job is to find the phrases worth judging. Keep every phrase with any arguable link to its input:

- a fact or a known reference about it: "The countryside" → "no city dust here";
- a description, pun, irony or joke about it: "Funeral" → "real fun";
- a word or image that points at it, however loosely: "Boeing" → "big one".

Leave out a phrase whose words merely happen to use the letters. When unsure, keep it. A judge scores every phrase you keep, and a phrase you leave out is never seen again.

Treat rude, vulgar or offensive phrases like any other: keep or leave them out on the same basis, and never leave one out for its tone.

Read each phrase yourself. Never keep or leave out phrases by a rule applied in a script, such as by word, length or position in the list.

Answer with one JSON line per section, and nothing else:

```
{"candidate_id": "thecountryside:phrases", "keep": [1, 17, 240]}
```

- `candidate_id` is the section's heading.
- `keep` lists the numbers of the phrases you keep, or `[]` when none has a link.
- A long input can continue into another file, with a section in each file. Answer each section where it appears.

## File 1 of 7: 2517 phrases

### chadgilbert:people

input: Chad Gilbert
category: people
phrases 1 to 500 of 500

1 blighted car
2 the glad crib
3 braced light
4 the glib card
5 eldritch bag
6 the clad brig
7 cabled right
8 card be light
9 lighted crab
10 child get bar
11 garbled itch
12 car bed light
13 garbled chit
14 it belch drag
15 latch bridge
16 child get bra
17 blighted arc
18 right cab led
19 bread glitch
20 chat bed girl
21 bared glitch
22 glad bet rich
23 crab delight
24 right cab del
25 beard glitch
26 art beg child
27 glared bitch
28 it belch grad
29 eldritch gab
30 chad bet girl
31 cared blight
32 clad right be
33 batch girdle
34 lac bed right
35 batch glider
36 big let chard
37 raced blight
38 deb light car
39 latched brig
40 rat beg child
41 cedar blight
42 held big cart
43 cabled girth
44 gal bitch red
45 cad blighter
46 rag bet child
47 cadre blight
48 birch get lad
49 laced bright
50 arc bed light
51 carb delight
52 bad tech girl
53 dirtbag lech
54 bald rich get
55 lighted carb
56 a bred glitch
57 charted glib
58 bad etch girl
59 latch be grid
60 girl chat deb
61 chat bird leg
62 grid let bach
63 bar ditch leg
64 girl bach ted
65 the gild crab
66 tar beg child
67 brig let chad
68 lag bitch red
69 tach bed girl
70 gar bet child
71 rag bitch led
72 rad be glitch
73 batch rid leg
74 at belch grid
75 rad bitch leg
76 crib get dahl
77 bid get larch
78 a blight cred
79 birch get dal
80 glad rib tech
81 grab itch led
82 rag bitch del
83 bad rich gelt
84 chart be gild
85 drag belt chi
86 girl dab tech
87 chart bid leg
88 dag birch let
89 gal bird tech
90 bra ditch leg
91 lid grab tech
92 halt big cred
93 gar bitch led
94 deb light arc
95 card beg hilt
96 chat bird gel
97 tag bled rich
98 brad itch leg
99 arch belt dig
100 lac beg third
101 latch bed rig
102 lech drag bit
103 rich lag debt
104 dag belt rich
105 grab itch del
106 bar ditch gel
107 chart beg lid
108 cad birth leg
109 child tag reb
110 led grab chit
111 art belch dig
112 big retch lad
113 chad belt rig
114 led rig batch
115 beth gild car
116 gar bitch del
117 led chat brig
118 char belt dig
119 rich gad belt
120 leg brad chit
121 gelt had crib
122 bach gird let
123 batch rid gel
124 larch bet dig
125 rat belch dig
126 lag bird tech
127 tach bird leg
128 rad bitch gel
129 cab red light
130 del grab chit
131 chard be gilt
132 tag birch led
133 chat bled rig
134 dirt bag lech
135 belch rid tag
136 right deb lac
137 grad belt chi
138 rich debt gal
139 del rig batch
140 bit gel chard
141 brag itch led
142 del chat brig
143 led girth cab
144 belch gird at
145 bel dig chart
146 gal birch ted
147 tad birch leg
148 het glad crib
149 held brig act
150 chart bid gel
151 lad birth ecg
152 gib let chard
153 lab retch dig
154 arch bed gilt
155 chard beg lit
156 lard beg itch
157 grid chat bel
158 lid chat berg
159 bra ditch gel
160 held brag tic
161 big etch lard
162 tag birch del
163 halt bird ecg
164 latch big red
165 brad itch gel
166 held brig cat
167 bard itch leg
168 tag bird lech
169 right bel cad
170 gat bled rich
171 reb light cad
172 dab etch girl
173 tech gild bar
174 chart big led
175 crag bled hit
176 drab itch leg
177 held tic grab
178 bel itch drag
179 brag itch del
180 del girth cab
181 cab third leg
182 berg til chad
183 big retch dal
184 bird etch gal
185 cad birth gel
186 grab etch lid
187 led grit bach
188 berg itch lad
189 big ted larch
190 herb gild act
191 deb rig latch
192 bag retch lid
193 larch bed git
194 held bit crag
195 lech dig brat
196 lab etch grid
197 red latch gib
198 arch bet gild
199 char bed gilt
200 tar belch dig
201 held crib tag
202 garb itch led
203 tech gird lab
204 clad girth be
205 lac bed girth
206 lard beg chit
207 lag birch ted
208 led chart gib
209 reb dig latch
210 bel ditch rag
211 rag bled itch
212 gal bred itch
213 cab herd gilt
214 herb gild cat
215 reb ditch gal
216 arch glib ted
217 held crit bag
218 belt hid crag
219 chit gel brad
220 hilt bag cred
221 leg bard chit
222 trig bach led
223 chart big del
224 tach bird gel
225 lid garb tech
226 grid bat lech
227 chit drag bel
228 herb dig talc
229 third ecg lab
230 arch bled git
231 del grit bach
232 lac berth dig
233 glad herb tic
234 brit gel chad
235 char bet gild
236 gat birch led
237 bald tech rig
238 crag bed hilt
239 gelt brad chi
240 bach rid gelt
241 belch rid gat
242 garb itch del
243 tad belch rig
244 bird etch lag
245 het glib card
246 del chart gib
247 led garb chit
248 itd grab lech
249 tad birch gel
250 ghat crib led
251 red glib tach
252 dal birth ecg
253 rag bled chit
254 gal bred chit
255 crab hid gelt
256 bel grit chad
257 gal bid retch
258 trig bach del
259 dahl beg crit
260 tech gild bra
261 glad reb itch
262 etc gird blah
263 itd beg larch
264 char bled git
265 git brad lech
266 bel ditch gar
267 bel itch grad
268 clad berg hit
269 gar bled itch
270 lag bred itch
271 reb ditch lag
272 beth gild arc
273 bard itch gel
274 gat birch del
275 brig etch lad
276 dit grab lech
277 lard big tech
278 arch bid gelt
279 berg itch dal
280 gat bird lech
281 tach bled rig
282 brag tech lid
283 dirt gab lech
284 drab itch gel
285 cab third gel
286 del garb chit
287 glad rib etch
288 bad lech grit
289 brag etch lid
290 chad rib gelt
291 ghat crib del
292 lit berg chad
293 hilt brad ecg
294 beg til chard
295 larch beg dit
296 bel gird chat
297 berg hid talc
298 held gib cart
299 hag bled crit
300 glad reb chit
301 bar etch gild
302 itd belch rag
303 brag chit led
304 tech lard gib
305 clad beth rig
306 dirt ecg blah
307 bach dirt leg
308 rad belch git
309 gar bled chit
310 lag bred chit
311 hed talc brig
312 reb gild chat
313 held crib gat
314 lag bid retch
315 bad lech trig
316 chit gel bard
317 char bid gelt
318 gilt char deb
319 gad birch let
320 beth gird lac
321 deb girth lac
322 cab held grit
323 chat glib red
324 rag belch dit
325 at berg child
326 drab chit leg
327 held tic garb
328 gelt bard chi
329 brag chit del
330 gab retch lid
331 garb etch lid
332 crab held git
333 dah crib gelt
334 lech gird bat
335 talc big herd
336 gib retch lad
337 het clad brig
338 cab held trig
339 crab hed gilt
340 held crit gab
341 bald rig etch
342 itd belch gar
343 hilt gab cred
344 bel girth cad
345 brig etch dal
346 git bard lech
347 dart big lech
348 act glib herd
349 bra etch gild
350 gib herd talc
351 lech grit dab
352 clad herb git
353 glib tech rad
354 gar belch dit
355 hilt bard ecg
356 cat glib herd
357 arch deb gilt
358 rid latch beg
359 lech dart gib
360 lech gird tab
361 trig bel chad
362 cal bed right
363 cal right deb
364 itd garb lech
365 lech gad brit
366 bach dirt gel
367 trig dab lech
368 bach red gilt
369 gib etch lard
370 dit garb lech
371 gilt reb chad
372 drab chit gel
373 gird latch be
374 halt gib cred
375 bel gird tach
376 glib cart hed
377 gib retch dal
378 gilt herb cad
379 reb gild tach
380 drab chi gelt
381 het gild crab
382 char glib ted
383 hat glib cred
384 brag lech dit
385 drab lech git
386 dab rich gelt
387 cad beth girl
388 grat be child
389 chard bit leg
390 glib rad etch
391 it drag blech
392 drab ecg hilt
393 der big latch
394 lab tech grid
395 the gild carb
396 cal beg third
397 brag lech itd
398 tach deb girl
399 tric held bag
400 chad brit leg
401 tel big chard
402 lich get brad
403 lad brig tech
404 bad cel right
405 grad bit lech
406 cig held brat
407 bad rec light
408 hard belt cig
409 drat big lech
410 lac beth grid
411 gat reb child
412 gird lab etch
413 lib get chard
414 der glib chat
415 carb held git
416 lad berg chit
417 dib get larch
418 cal bed girth
419 dal brig tech
420 lich get bard
421 blah cred git
422 cab der light
423 lich get drab
424 crag beth lid
425 tach brig led
426 cal berth dig
427 eth glib card
428 at blech grid
429 bal third ecg
430 lar beg ditch
431 blech rid tag
432 tab lech grid
433 lad bitch reg
434 tric held gab
435 blech gird at
436 glad crib eth
437 tach brig del
438 bald itch reg
439 gal bitch der
440 grad bel chit
441 larch deb git
442 tach bel grid
443 tach berg lid
444 glad bret chi
445 dal berg chit
446 tad brig lech
447 dahl berg tic
448 lad bitch ger
449 tha glib cred
450 larch gib ted
451 cad berg hilt
452 halt crib ged
453 lab ditch reg
454 art blech dig
455 bag cel third
456 chard bel git
457 drag belt ich
458 cad ble right
459 bald chit reg
460 crag deb hilt
461 arch belt gid
462 drag bet lich
463 dal bitch reg
464 lag bitch der
465 bah gilt cred
466 bald itch ger
467 carl beth dig
468 dab cel right
469 bat child reg
470 rat blech dig
471 chart dib leg
472 blech rid gat
473 act bleh grid
474 dag brit lech
475 der glib tach
476 grab lich ted
477 dab rec light
478 bleh gird act
479 dahl brit ecg
480 drag belt hic
481 cat bleh grid
482 drag lib tech
483 lab ditch ger
484 grat bled chi
485 cart bleh dig
486 lib etch drag
487 halt berg dic
488 bald chit ger
489 bleh gird cat
490 dal bitch ger
491 grad belt ich
492 latch bid reg
493 chart ble dig
494 card bleh git
495 bat child ger
496 bal retch dig
497 gah bled crit
498 grad bet lich
499 chat ble grid
500 tar blech dig

### trinidadchambliss:people

input: Trinidad Chambliss
category: people
phrases 1 to 500 of 500

1 his dramatic blinds
2 this calm did brains
3 i blinds this mad car
4 chili mind bastards
5 this clam did brains
6 it blinds his mad car
7 him disband cristal
8 this dad rain climbs
9 his in dad climbs art
10 brains admits child
11 an said third climbs
12 its slim a did branch
13 brains amidst child
14 its child is armband
15 an art did his climbs
16 blind dramatic hiss
17 this maid blinds car
18 it did an rash climbs
19 scimitar had blinds
20 his dad train climbs
21 i climbs an sad third
22 chairs admit blinds
23 his car admit blinds
24 this dim a blinds car
25 mini child bastards
26 his midst can bridal
27 i branch its slim dad
28 shirt disband claim
29 this disc man bridal
30 his in dad rat climbs
31 rich dismal bandits
32 his calm rid bandits
33 this mid a blinds car
34 martins did chablis
35 his mind cast bridal
36 an rat did his climbs
37 tad miss brainchild
38 his mind cats bridal
39 i cart his mad blinds
40 bastard chili minds
41 his acts mind bridal
42 i arc this mad blinds
43 limit disband crash
44 calm shit did brains
45 its rich did an lambs
46 chair admits blinds
47 this add rain climbs
48 i blinds its hard mac
49 chair amidst blinds
50 this aim card blinds
51 i climbs its hard dna
52 triads mind chablis
53 its mind cash bridal
54 its mad a blinds rich
55 dams sit brainchild
56 its mild said branch
57 his in art add climbs
58 its dams brainchild
59 his damn tribal disc
60 i act his mild brands
61 brands admits chili
62 an miss ditch bridal
63 i blinds its hard cam
64 dam sits brainchild
65 his minds act bridal
66 i card his mat blinds
67 charms didnt alibis
68 his at crib midlands
69 i cat his mild brands
70 brands amidst chili
71 his add train climbs
72 his in dad tar climbs
73 triad minds chablis
74 its child dam brains
75 his dirt a blinds mac
76 chablis drain midst
77 this acid arm blinds
78 his dirt a climbs dna
79 mad brainchild sits
80 this car amid blinds
81 an tar did his climbs
82 limits disband char
83 his minds cat bridal
84 his trim dad is blanc
85 mild chairs bandits
86 this sac mind bridal
87 it climbs an hard ids
88 chablis admit rinds
89 this dad climbs rani
90 this in mis bald card
91 itd mass brainchild
92 his card slim bandit
93 i add its slim branch
94 brachial miss didnt
95 bad child is martins
96 his in add rat climbs
97 ads mist brainchild
98 in smart did chablis
99 it arc his mad blinds
100 milt disband chairs
101 its drain had climbs
102 i climbs an third ads
103 hart disdain climbs
104 its mails did branch
105 i hid its calm brands
106 snitch slid barmaid
107 his mic stand bridal
108 his dim at blinds car
109 itd blinds charisma
110 this mil disband car
111 it dis an hard climbs
112 brainchild mass dit
113 this damn sic bridal
114 its mad lid is branch
115 bridal chains midst
116 this mac raid blinds
117 his mid at blinds car
118 bridal admits chins
119 this dna raid climbs
120 his last mic rid band
121 sad mist brainchild
122 his mind scat bridal
123 i slid its mad branch
124 bridal amidst chins
125 his ratan did climbs
126 an dirt a dish climbs
127 milt banish discard
128 his clam rid bandits
129 his dirt a blinds cam
130 barmaid snitch lids
131 an mild third basics
132 its hard a blinds mic
133 brainchild dams tis
134 bastard nim is child
135 i dash an dirt climbs
136 radiant dish climbs
137 mad child sit brains
138 its in rad had climbs
139 blinds chats midair
140 this acid ram blinds
141 an third a climbs ids
142 dit blinds charisma
143 his clams rid bandit
144 i arch its mad blinds
145 sharia didnt climbs
146 its mad child brains
147 i branch its mad lids
148 mild cards inhabits
149 this cis damn bridal
150 this in ism bald card
151 dah blinds scimitar
152 this marc aid blinds
153 i brands his calm dit
154 hilt disband racism
155 this cam raid blinds
156 an third a dis climbs
157 brainchild mats ids
158 this mic sand bridal
159 its rich a dam blinds
160 bridal maids snitch
161 an aids climbs third
162 i branch its dim lads
163 chili disband trams
164 its child aim brands
165 i climbs an dirt shad
166 bridal smash indict
167 calm hits did brains
168 an rich tis did lambs
169 mast dis brainchild
170 this nada rid climbs
171 i branch its mid lads
172 mats dis brainchild
173 this darn aid climbs
174 his mad a blinds crit
175 mat diss brainchild
176 its damn rid chablis
177 his dim a cart blinds
178 disband smart chili
179 his maid cart blinds
180 this dim a arc blinds
181 chablis admits rind
182 this maid arc blinds
183 its hard a din climbs
184 tam diss brainchild
185 his calms rid bandit
186 his in add tar climbs
187 brains dismal ditch
188 its raid hand climbs
189 an hard dit is climbs
190 bridal standish mic
191 his arc admit blinds
192 i char its mad blinds
193 chablis amidst rind
194 this scan dim bridal
195 his mid a cart blinds
196 chablis disarm dint
197 this rani add climbs
198 his trim add is blanc
199 chablis strand midi
200 this mid bridal scan
201 this mid a arc blinds
202 bridal hitman discs
203 his milt disband car
204 an sad hit rid climbs
205 cabins dismal third
206 mild chin is bastard
207 i branch its mild ads
208 balsamic hinds dirt
209 mild inch is bastard
210 its dim lad is branch
211 disband arch limits
212 this dim clad brains
213 an dirt as hid climbs
214 balsamic thirds din
215 this mic dial brands
216 i did it slams branch
217 bridal shams indict
218 this cans dim bridal
219 its mid lad is branch
220 climbs danish triad
221 its mild hard cabins
222 an tad rid his climbs
223 brainchild as midst
224 this mid clad brains
225 i brands this dim lac
226 brands mislaid itch
227 this mid bridal cans
228 i brands this mid lac
229 shitbird dismal can
230 his tics damn bridal
231 its mild ids branch a
232 brands mislaid chit
233 this acid mar blinds
234 an dirt dah is climbs
235 mads its brainchild
236 this rand aid climbs
237 his salt mic rid band
238 disband mitral chis
239 this aid cram blinds
240 him did in blasts car
241 shitbird and claims
242 his mild car bandits
243 i dam its arch blinds
244 blinds dramatics hi
245 this mil brands acid
246 i itd his calm brands
247 shitbird manic lads
248 his lid scram bandit
249 its mild a dis branch
250 mads sit brainchild
251 its nadir had climbs
252 i did in march blasts
253 cris midland habits
254 his triad blinds mac
255 his mild tic brands a
256 shitbird claim sand
257 his dna climbs triad
258 his bland mics rid at
259 shitbird claims dna
260 its aid march blinds
261 its mild chi brands a
262 minicab lads thirds
263 bridal mind sit cash
264 it did slam is branch
265 bandit laird schism
266 this din scam bridal
267 his trim a blinds cad
268 brainchild mast ids
269 its acid harm blinds
270 its dim a slid branch
271 bitchin disarm lads
272 tribal dad chin miss
273 its mid a slid branch
274 chablis nadir midst
275 its dinar had climbs
276 itd is an hard climbs
277 shitbird dim canals
278 tribal dad inch miss
279 his mad clan stir bid
280 shitbird mid canals
281 rich main did blasts
282 i did in charm blasts
283 chablis dinar midst
284 in triads had climbs
285 it card him blinds as
286 birdman sails ditch
287 tribal mind has disc
288 i did rich man blasts
289 bitchin dismal rads
290 ain trash did climbs
291 his in tad climbs rad
292 barista child minds
293 an midst rid chablis
294 his a and dirt climbs
295 shitbird clad mains
296 its dam chair blinds
297 his dim at arc blinds
298 shitbird scald main
299 its claim hid brands
300 it brands his dim lac
301 bitchin slid dramas
302 dirt damn is chablis
303 its dim lid branch as
304 birdman distal chis
305 this raid and climbs
306 him is at card blinds
307 bitchin slid madras
308 laid midst is branch
309 its dim a arch blinds
310 shitbird clad minas
311 his marc slid bandit
312 its dim lids branch a
313 shitbird amid clans
314 tribal minds is chad
315 his mid at arc blinds
316 shitbird mac island
317 his lid cram bandits
318 its dim dal is branch
319 brainchild mads tis
320 his drama blinds tic
321 it brands his mid lac
322 shitbird scald mina
323 it march said blinds
324 its mid lid branch as
325 shitbird cam island
326 bridal minds is chat
327 its mid a arch blinds
328 bandits disarm lich
329 mad snitch is bridal
330 its mid lids branch a
331 minibar clash didst
332 mild in habits cards
333 its mid dal is branch
334 climbs rath disdain
335 his lit disband marc
336 i had it scram blinds
337 shitbird clan maids
338 his acid tram blinds
339 it did as slim branch
340 shitbird clans maid
341 its aid charm blinds
342 i talc his dim brands
343 dan shitbird claims
344 an triad dish climbs
345 it is dad slim branch
346 shitbird mica lands
347 calm sir dish bandit
348 it did alms is branch
349 banish drastic mild
350 his triad blinds cam
351 i talc his mid brands
352 bitchin lids dramas
353 an dais climbs third
354 it rid a climbs hands
355 bitchin lids madras
356 its drama blinds chi
357 its dah rid an climbs
358 shitbird mic sandal
359 its maid slid branch
360 i trash in climbs dad
361 brainchild sat mids
362 its mics hand bridal
363 it climbs hard sad in
364 bitchin sadism lard
365 his tad drain climbs
366 its dim a char blinds
367 dans shitbird claim
368 calm sir hid bandits
369 it is marc had blinds
370 brainchild tad sims
371 slim chat did brains
372 its mid a char blinds
373 mids shitbird canal
374 bridal mind is chats
375 it is darn had climbs
376 ands shitbird claim
377 his mart blinds acid
378 his sad lid mint crab
379 brachial sims didnt
380 mild crash is bandit
381 i card smith blinds a
382 balsamic shri didnt
383 in midst cash bridal
384 him sit a card blinds
385 brainchild tas mids
386 his cart amid blinds
387 him did cars last bin
388 lich birdman sadist
389 did an tribal schism
390 it is hard blinds mac
391 amin shitbird scald
392 his mic lard bandits
393 i dish it calm brands
394 bitchin dim lardass
395 said card thin limbs
396 his lit rad mind cabs
397 bitchin mid lardass
398 its rich disband lam
399 it is hard climbs dna
400 this arc amid blinds
401 its hind a climbs rad
402 it charm said blinds
403 i rid at climbs hands
404 its lid branch maids
405 i had in climbs darts
406 bridal disc shit man
407 an lit mic dash birds
408 its rad mind chablis
409 i did slam sit branch
410 mad tis brains child
411 his lit rad mind scab
412 his cad limit brands
413 its rad hid an climbs
414 tribal chin did mass
415 his blind arm sic tad
416 tribal inch did mass
417 it dish in lamb cards
418 bridal mass ditch in
419 i sand a climbs third
420 its maid arch blinds
421 an dim clash rid bits
422 its lids branch maid
423 it is hard blinds cam
424 said marc hit blinds
425 it had sir blinds mac
426 said list dim branch
427 his damn lis brad tic
428 his dit claim brands
429 it had sir climbs dna
430 its mad bridal chins
431 an mid clash rid bits
432 its chis damn bridal
433 i miss lit branch dad
434 this lard dim cabins
435 it is rand had climbs
436 his mil disband cart
437 i mist child brands a
438 his milt brands acid
439 it rid as hand climbs
440 this mil disband arc
441 an lit shad birds mic
442 this lid brands mica
443 it blinds as mad rich
444 this cams din bridal
445 i is math card blinds
446 his data climbs rind
447 it climbs in rash dad
448 him blinds drastic a
449 its in rad climbs dah
450 this amir blinds cad
451 i ditch a blinds arms
452 rich lad miss bandit
453 i scam third blinds a
454 mad chair sit blinds
455 his cis tad arm blind
456 timid lads is branch
457 i rid as match blinds
458 an thirds aid climbs
459 i miss dad til branch
460 an triads hid climbs
461 an dim chi rid blasts
462 his mild cars bandit
463 i hand as dirt climbs
464 hard mind til basics
465 i ham it blinds cards
466 its mad chair blinds
467 i did mis last branch
468 dirt a minds chablis
469 it is add slim branch
470 bandits card his mil
471 i did him slant crabs
472 timid a crash blinds
473 this a and rid climbs
474 mild as ditch brains
475 an mid chi rid blasts
476 third nada is climbs
477 him did last scar bin
478 dirt a climbs danish
479 it had sir blinds cam
480 in trams did chablis
481 i card him blinds sat
482 disc til his armband
483 i is child mat brands
484 rich at blinds maids
485 i did him blasts narc
486 him did tribal scans
487 i sit dad slim branch
488 its maid char blinds
489 it is calm hid brands
490 its chili dam brands
491 i did alms sit branch
492 this lid cabins dram
493 an rad climbs his dit
494 clad sir mind habits
495 i add in trash climbs
496 tribal add chin miss
497 him did in arc blasts
498 tribal add inch miss
499 i is dart hand climbs
500 it crash amid blinds

### joshuavan:people

input: Joshua Van
category: people
phrases 1 to 17 of 17

1 oh java sun
2 oh jus van a
3 us ava john
4 oh jun vas a
5 oh java uns
6 us hon java
7 haj van sou
8 us noh java
9 hun java so
10 oh jun vasa
11 haj nova us
12 hao van jus
13 hao vas jun
14 hos jun ava
15 hon jus ava
16 sho jun ava
17 noh jus ava

### charlesspencerninthearlspencer:people

input: Charles Spencer, 9th Earl Spencer
reading: 9th:spell
category: people
phrases 1 to 500 of 500

1 present rancher perch cleanliness
2 her repellent can ranch princesses
3 plane ranchers clench enterprises
4 her central channel per princesses
5 peripheral clench enters scanners
6 her central rep channel princesses
7 peripheral clench resent scanners
8 her serpentine calls ranch spencer
9 serpentine preacher snarls clench
10 her clean lantern perch princesses
11 penal ranchers clench enterprises
12 her lean clench partner princesses
13 serene lancers clench partnership
14 her serpentine cancer ranch spells
15 serpentine ranchers clench pearls
16 the rare planner clench princesses
17 peripheral clench resents scanner
18 her serpentine scanners call perch
19 serpentine racers clench shrapnel
20 her cereal spencer channel sprints
21 serpentine larch screech planners
22 the rear planner clench princesses
23 serene lancer clench partnerships
24 her plane lancer trench princesses
25 peripheral tanners clench screens
26 her plane screen transpires clench
27 centennial clench repress sharper
28 her serpentine scanner calls perch
29 serpentine slasher clench prancer
30 her present narc perch cleanliness
31 serpentine lancers clench sharper
32 her serpentine cancers ranch spell
33 serpentine preachers snarl clench
34 her elect planner ranch princesses
35 centennial schlep repress rancher
36 her sent prancer perch cleanliness
37 serpentine lancer schlep ranchers
38 her centennial spencer press larch
39 serpentine lancers schlep rancher
40 her clean planner retch princesses
41 hills enhancer carpenters spencer
42 her serpentine clench learn scraps
43 partnership enhancers screen cell
44 her near planter clench princesses
45 channel spencer transpires lecher
46 her pert spencer ranch cleanliness
47 princesses partner channel lecher
48 her renal channel crept princesses
49 repress channels ranch percentile
50 her errant clench plane princesses
51 chiseler channels partner spencer
52 her plane narcs clench enterprises
53 partnership enhancer screen cells
54 her near clench replant princesses
55 cleanliness harper trench spencer
56 her serpentine snarls cancel perch
57 percentile help ranchers scanners
58 her renal clench parent princesses
59 percentile channel ranchers press
60 her serpentine racers clench plans
61 repent ranchers perch cleanliness
62 an repellent archers screens pinch
63 partnership enhancer screens cell
64 her centennial creeps perch snarls
65 creel screen channels partnership
66 her pert lancer channel princesses
67 cleanliness ranch perch represent
68 her penal lancer trench princesses
69 enterprises planner search clench
70 her carnal clench pens enterprises
71 partnerships enhancer screen cell
72 an serpentine cells perch ranchers
73 enterprise planners search clench
74 her errant clench panel princesses
75 enterprises spencer channel larch
76 her penal screen transpires clench
77 partnership channel creel screens
78 an stern screens clench peripheral
79 rancher press channels percentile
80 her serpentine clench learns scrap
81 partnership learner clench scenes
82 her nth crapper screen cleanliness
83 partnerships channel creel screen
84 her stern perch prance cleanliness
85 enterprise planner crashes clench
86 her paler tanner clench princesses
87 partnership learners clench scene
88 an repellent crasher screens pinch
89 enterprise planes ranchers clench
90 her serpentine cancer snarl schlep
91 enterprises planners reach clench
92 her pert scanner perch cleanliness
93 shill enhancer carpenters spencer
94 an peripheral rents screens clench
95 enterprises shrapnel crane clench
96 an errant helper clench princesses
97 partnerships learner clench scene
98 her serpentine clench learns craps
99 lichen screeches planner partners
100 her centennial perch crepes snarls
101 cleaners neer clench partnerships
102 her penal narcs clench enterprises
103 percentile helps ranchers scanner
104 her centennial cress helps prancer
105 percentile shrapnel ranch screens
106 her parental ern clench princesses
107 enterprises perch channel lancers
108 her serpentine clench snarls recap
109 enterprise perch channels lancers
110 her serpentine clench snarls caper
111 cleanliness rancher trenches prep
112 planners clench per her resistance
113 cleanliness ranch perch presenter
114 her centennial perch repress clans
115 repents rancher perch cleanliness
116 her renal clench entrap princesses
117 enterprises planes rancher clench
118 her serpentine clench snarl scrape
119 enterprise shrapnel cranes clench
120 he learn clench partner princesses
121 enterprise panels ranchers clench
122 her serpentine lass clench prancer
123 percentile helps rancher scanners
124 her serpentine narcs clench pearls
125 enterprises panel ranchers clench
126 her paternal ern clench princesses
127 clan clench sharpener enterprises
128 centennial snarls screech her prep
129 enterprises perch channels lancer
130 her centennial screens schlep parr
131 partnership cleaners clench sneer
132 her serpentine clans perch lancers
133 learner clench panther princesses
134 her prenatal ern clench princesses
135 partnership relearn clench scenes
136 her serpentine clench snarls pacer
137 scanners ranch helpers percentile
138 an peripheral terns screens clench
139 cleanliness prancer trench sphere
140 her serpentine snarl cancels perch
141 chasers clench planner enterprise
142 her centennial clench repress spar
143 chaser clench planner enterprises
144 her centennial clench repress raps
145 clans clench sharpener enterprise
146 he trench planner clear princesses
147 cleanliness rancher perch serpent
148 her centennial schlep repress narc
149 partnerships relearn clench scene
150 her serpentine clench snarl capers
151 enterprises planner arches clench
152 her serpentine lancers clench spar
153 chaser clench planners enterprise
154 her nth prancer crepes cleanliness
155 enterprise planners arches clench
156 her serpentine lancers clench raps
157 cleanliness prancer trench herpes
158 her centennial clench repress rasp
159 enterprises panels rancher clench
160 centennial lancers perch her press
161 cleanser neer clench partnerships
162 her serpentine narc schlep lancers
163 enterprise sharpen lancers clench
164 hers press partner channel licence
165 transpires enhancers clench leper
166 her centennial clench repress pars
167 persistence planners ranch lecher
168 an serpentine larch repress clench
169 repel clench transpires enhancers
170 her serpentine lancers clench rasp
171 partnership leaner clench screens
172 her serpentine narcs schlep lancer
173 transpires enhancer clench lepers
174 her serpentine lancers clench pars
175 partnerships cleaner clench sneer
176 hell can spencer ranch enterprises
177 partnerships leaner clench screen
178 he learn spencer transpires clench
179 enterprises sharpen lancer clench
180 her scanner slap clench enterprise
181 partnership cleanser clench sneer
182 he entrances rancher spell princes
183 enterprise sharpens lancer clench
184 he ranch spencer snarls percentile
185 princesses panther relearn clench
186 he clench planner scars enterprise
187 princesses prancer enchant heller
188 she clench planner scar enterprise
189 repels clench transpires enhancer
190 she peel scanner partners clincher
191 percentile snarls enhancers perch
192 princesses help ranch learn center
193 partnerships ensnare clench creel
194 her clench nearer plant princesses
195 snell perchance ranch enterprises
196 can ranch spencer shell enterprise
197 perp rancher trenches cleanliness
198 her presence rancher plans clients
199 helter prancer channel princesses
200 centennial parr clench her presses
201 rance shrapnel clench enterprises
202 he clench planner scar enterprises
203 enterprise spencer channels larch
204 he plants spencer recline ranchers
205 hansel prancer clench enterprises
206 all enhancer trench per princesses
207 princesses prancer enchanter hell
208 he clench planners scar enterprise
209 penner sharpener accents schiller
210 prancer per she trench cleanliness
211 serpentine shrapnel carers clench
212 princesses help trench can learner
213 percentile planner ranchers chess
214 cell seen screen ranch partnership
215 enterprises prancer channels lech
216 princesses help ranch learn centre
217 percentile planners rancher chess
218 princesses help ranch learn recent
219 percentile channels ranchers reps
220 scanners can hell perch enterprise
221 persistence planner ranchers lech
222 percent per hers ranch cleanliness
223 cleanliness charters perch penner
224 her cleaner trench plan princesses
225 persistence planners rancher lech
226 scanner can hell perch enterprises
227 princesses penner rancher hellcat
228 he entrances rancher spell pincers
229 princesses pell enchanter rancher
230 she rent prancer perch cleanliness
231 partnership enhancers snell recce
232 hell near percent ranch princesses
233 partnerships enhancer snell recce
234 hers screen ranch plans percentile
235 percentile channels ranchers pres
236 she ranch spencer snarl percentile
237 hers clench crane plans enterprise
238 hers center prep ranch cleanliness
239 learn her channel crept princesses
240 hers clench crane plan enterprises
241 he clench snarls prance enterprise
242 she clench planner arc enterprises
243 princesses repent rancher can hell
244 can learn helper trench princesses
245 hers perch percent ran cleanliness
246 crane learn trench help princesses
247 she clench planners arc enterprise
248 perchance scents her lier planners
249 her cells screen nance partnership
250 serpentine shells ranch per cancer
251 clan screen ranch help enterprises
252 hers centre prep ranch cleanliness
253 he perch scanner snarls percentile
254 hers screens ranch plan percentile
255 here learns clench parent princess
256 hells can spencer ranch enterprise
257 princesses help rancher clean rent
258 cleaner rent ranch help princesses
259 her clench learn parent princesses
260 hell scan spencer ranch enterprise
261 princesses per entrance ranch hell
262 her presence ranch scalpel interns
263 he clench planners arc enterprises
264 renter channel car help princesses
265 hell ran spencer ranch persistence
266 can relearn trench help princesses
267 lantern err chance help princesses
268 cleaner ran trench help princesses
269 her lane clench partner princesses
270 hell earn percent ranch princesses
271 lens ranch cancer help enterprises
272 cell screen nan cheers partnership
273 her cell screens nance partnership
274 her lens channels carpenters price
275 ranchers clean schlep represent in
276 princesses help ranch clear tenner
277 hers clench cranes plan enterprise
278 else screen clench ran partnership
279 hell cans spencer ranch enterprise
280 ern chance hell partner princesses
281 clans screen ranch help enterprise
282 hers clench scanner pal enterprise
283 scanner can shell perch enterprise
284 here cheers planner cancel sprints
285 clan screens ranch help enterprise
286 she clench planner arcs enterprise
287 her cell screen nance partnerships
288 cheer learn trench plan princesses
289 her clench crane plans enterprises
290 lens screen are clench partnership
291 can relent rancher help princesses
292 her channel relent crap princesses
293 planner per hers clench resistance
294 hen sell cancer screen partnership
295 racer rent channel help princesses
296 princesses per let channel rancher
297 let cheer planner ranch princesses
298 princesses plan lancer trench here
299 rent cheers perchance all spinners
300 princesses help her lantern cancer
301 her cell ranch spanner persistence
302 hell rent perchance ran princesses
303 clench seen shrapnel arrest prince
304 hens call spencer ranch enterprise
305 partnership ran hence screen cells
306 hers press narc channel percentile
307 princesses per trench channel real
308 cheers ran clench plans enterprise
309 he rents prancer perch cleanliness
310 car rent helper channel princesses
311 hers trench prep crane cleanliness
312 princesses perch entrance ran hell
313 he clench planner arcs enterprises
314 partnership can lecher screen lens
315 princesses help rancher learn cent
316 cheers ran clench plan enterprises
317 sent rancher perch per cleanliness
318 he clench planners arcs enterprise
319 her screens ranch plans percentile
320 rancher recall then pen princesses
321 her spencer trench rap cleanliness
322 ten ranchers perch per cleanliness
323 hers clench scanner lap enterprise
324 she clench snarl prance enterprise
325 hen call spencer ranch enterprises
326 enterprises pens cancer ranch hell
327 he clench leper transpires scanner
328 ern sell screen chance partnership
329 her scanners clench pal enterprise
330 he repel clench transpires scanner
331 partnership ran hence screens cell
332 centennial perch cheers per snarls
333 her creche lantern plan princesses
334 her presence rancher plans stencil
335 clan screen ranch helps enterprise
336 narc presents clarence help shrine
337 her clench cranes plans enterprise
338 enterprise plan ranch screech lens
339 hence learn trench pearls princess
340 clan enter rancher help princesses
341 princesses help ranch clean renter
342 hell ranch tanner creep princesses
343 hell ranch rep entrance princesses
344 her planners perchance scents lire
345 she perch scanner snarl percentile
346 can ran helpers clench enterprises
347 princesses repent ranch can heller
348 then err channel parcel princesses
349 real rent channel perch princesses
350 her reps percent ranch cleanliness
351 her clench cranes plan enterprises
352 he clench snarl prance enterprises
353 persistence per scanner ranch hell
354 arch channel relent per princesses
355 partnerships ran hence screen cell
356 her scanner clench pal enterprises
357 he perch scanners snarl percentile
358 princesses help rancher lance rent
359 hers recall snapper trench incense
360 less ranchers perch per centennial
361 hell ran pretence ranch princesses
362 enterprise pen cancer ranch shells
363 centennial cress help per ranchers
364 hers clench narcs plane enterprise
365 hers clench narc plane enterprises
366 princesses pen rather learn clench
367 hen calls spencer ranch enterprise
368 lens clench harper can enterprises
369 lens ranch cancer helps enterprise
370 serpentine shell ranch per cancers
371 princesses repent crane ranch hell
372 caller henna trench per princesses
373 princesses pan rancher center hell
374 here errant clench plan princesses
375 ranchers lance schlep represent in
376 caller rancher then pen princesses
377 trance err channel help princesses
378 princesses prancer channel her let
379 hers perch tenner crap cleanliness
380 her scanner clench pals enterprise
381 ranch ran clench sleep enterprises
382 serpentine clench reach per snarls
383 hell rent enhancer crap princesses
384 the creel ranch planner princesses
385 lancer enter ranch help princesses
386 recent renal ranch help princesses
387 she prance ranchers relent pencils
388 cancer ranch shell pen enterprises
389 lens ranch cancers help enterprise
390 partnership crane hens screen cell
391 serpentine cells ranch per ranches
392 princesses nap rancher center hell
393 sparse trench channel per silencer
394 her spencer trench par cleanliness
395 her scanners clench lap enterprise
396 enterprise plans narcs clench here
397 enterprises plans narc clench here
398 spencer represent cancer shall hin
399 cells screen nan cheer partnership
400 her narcs press channel percentile
401 rancher channel rep let princesses
402 her narc press channels percentile
403 hers clench narc planes enterprise
404 her tanner clench pearl princesses
405 here clench planner rat princesses
406 hers trench snapper incense cellar
407 cent ranch learner help princesses
408 relentless scene ran chipper ranch
409 enterprises plan narcs clench here
410 her lantern clench rape princesses
411 lancer near trench help princesses
412 her lantern lance perch princesses
413 prancer screen scalpel shrine then
414 ern channel carter help princesses
415 he clench ceres transpires planner
416 clearer channel per nth princesses
417 nearer trench clan help princesses
418 trench per hers prance cleanliness
419 serpentine clench learns per crash
420 less trench perchance learn sniper
421 cell sneer scene ranch partnership
422 tenner screen harper chances pills
423 real channel rep trench princesses
424 rent clean helper ranch princesses
425 ten clench harper learn princesses
426 here clench planter ran princesses
427 ranch tell enhancer per princesses
428 princesses perch lancer learn then
429 can err channel schlep enterprises
430 can err channels schlep enterprise
431 scanner can hells perch enterprise
432 peripheral can trench screens lens
433 cancer ranch hens spell enterprise
434 her spencer senna carpenter chills
435 serpentine sharp ranch screen cell
436 nectar err channel help princesses
437 lens screen clan cheer partnership
438 cleanliness ranch cheers rent prep
439 her scanner clench lap enterprises
440 ell screen scene ranch partnership
441 scanner scan hell perch enterprise
442 lens clench sharper can enterprise
443 enterprises pen cancers ranch hell
444 partnership crane hen screen cells
445 clean ran helper trench princesses
446 her scanner clench laps enterprise
447 her clench rate planner princesses
448 her clench tear planner princesses
449 princesses rap lantern clench here
450 persistence perch scanner ran hell
451 princesses pan rancher centre hell
452 cleanliness ran trench cheers prep
453 sense err clench clean partnership
454 hers clench lancer snap enterprise
455 enterprise plan rash clench screen
456 hell enter ranch prance princesses
457 her clench neer snarls apprentices
458 hers trench snapper incense caller
459 heller can tanner perch princesses
460 cancer ranch shell pens enterprise
461 neer central ranch help princesses
462 princesses partner real clench hen
463 lantern ran creche help princesses
464 her trench lace planner princesses
465 her spencer ranch snarl pestilence
466 reels screen clench an partnership
467 partnership cancel screen her lens
468 lens channel car perch enterprises
469 cell screens nan cheer partnership
470 princesses nap rancher centre hell
471 pencils channel rather screen reps
472 cheer ran clench plans enterprises
473 lantern cheer narc help princesses
474 enterprises pen crash learn clench
475 here learns clench entrap princess
476 enterprise spell screech ranch nan
477 hers ran scanner schlep percentile
478 screen perch rancher listen planes
479 her scanner clench alps enterprise
480 enterprises spell cancer ranch hen
481 scanner cans hell perch enterprise
482 hers perch less centennial prancer
483 clan reenter ranch help princesses
484 net ranchers perch per cleanliness
485 hers clench nan parcels enterprise
486 learn her clench entrap princesses
487 hip shrapnel learn crescent screen
488 princesses prance near trench hell
489 stench per her prancer cleanliness
490 cranes ran clench help enterprises
491 hence sell narc screen partnership
492 can relent helper ranch princesses
493 spencer henna presence thrill cars
494 hers clench nan parcel enterprises
495 hell crane tanner perch princesses
496 princesses help rancher crane lent
497 crane relent ranch help princesses
498 cancer rest planners inches helper
499 cell screen nan cheer partnerships
500 hers pen rancher crept cleanliness

### armantsarukyan:people

input: Arman Tsarukyan
category: people
phrases 1 to 500 of 500

1 an snarky trauma
2 an turn say karma
3 an sunk a marry at
4 any ranks trauma
5 an sauna try mark
6 an a ran my krauts
7 tank marry sauna
8 an mara say trunk
9 us mark an any art
10 any rank traumas
11 an aunt ray marks
12 an must a ray rank
13 trauma ran yanks
14 an may ran krauts
15 an any a rust mark
16 muskrat ray anna
17 an trauma ran sky
18 us rat an any mark
19 samara turn yank
20 an yuan star mark
21 an any a arm turks
22 nay ranks trauma
23 an aunt rays mark
24 an nuts a ray mark
25 any samara trunk
26 an any rust karma
27 an as run my karat
28 karma ray suntan
29 an runt say karma
30 an a runs my karat
31 mayan ran krauts
32 karma run an stay
33 an as ran my kraut
34 aunty mark saran
35 an aunts ray mark
36 an rusty a man ark
37 aunty ranks mara
38 an urn stay karma
39 my stark a run ana
40 traumas ran yank
41 an tuna ray marks
42 an a turns my arak
43 karma turns yana
44 an may runs karat
45 an any a rut marks
46 manana ray turks
47 my art rank sauna
48 an a rank my sutra
49 rusty anna karma
50 my aura ran tanks
51 an smart a run yak
52 mantua ray ranks
53 many a ran krauts
54 an any a ram turks
55 any nark traumas
56 an maar say trunk
57 an rum a stay rank
58 karma yarns aunt
59 an yuan rats mark
60 an any as arm turk
61 yarn sank trauma
62 an anus try karma
63 an as turn my arak
64 manna ray krauts
65 an yuan mark arts
66 an murky at ran as
67 karma yarn aunts
68 an may turns arak
69 an any as rut mark
70 mayan runs karat
71 an maya turns ark
72 us tar an any mark
73 manus array tank
74 an maya ran turks
75 an ara ask my turn
76 mayan turns arak
77 an sutra rank may
78 an rum at say rank
79 kan martyr sauna
80 my ana ran krauts
81 an sunk a rat army
82 manana rays turk
83 an army sun karat
84 an rust a rank may
85 army suntan arak
86 an tray sun karma
87 an any art ask rum
88 karma rants yuan
89 rusty a mark anna
90 an as ran my kurta
91 ray unmask ratan
92 an yuan rat marks
93 us rat an rank may
94 aunty ranks maar
95 any turn ask mara
96 an sunk a try mara
97 karma yarns tuna
98 my sauna rat rank
99 us mark an nary at
100 array unmask ant
101 an must array kan
102 an any a mar turks
103 muskrat ran yana
104 an tuna rays mark
105 an many a rat rusk
106 many saran kraut
107 an yuan smart ark
108 an any as ram turk
109 muskrat yarn ana
110 an ray unmask art
111 an must a yarn ark
112 snarky mara aunt
113 my auras ran tank
114 an must a ray nark
115 trauma yarns kan
116 an army runs taka
117 an many a rust ark
118 muskrat ray naan
119 krauts man an ray
120 an arty a sun mark
121 manna rays kraut
122 an anus marry kat
123 us rat an many ark
124 runt yank samara
125 rank a turns maya
126 an arty a run mask
127 sura yank mantra
128 an anus mark tray
129 an any at arm rusk
130 traumas yarn kan
131 an any arm krauts
132 an any rat ask rum
133 rusty manana ark
134 an yuan mark tsar
135 an at runs my arak
136 manna array tusk
137 an any arms kraut
138 stark may run an a
139 rya suntan karma
140 many as run karat
141 an any a rams turk
142 sunny mara karat
143 an any sutra mark
144 an rum a ray tanks
145 many saran kurta
146 an star murky ana
147 an at rank my sura
148 rank traumas nay
149 an tau ranks army
150 us ray an tan mark
151 nary trauma sank
152 an sura tank army
153 an any rut ask arm
154 rusty naan karma
155 an ray stun karma
156 an murky a ran sat
157 rank mantua rays
158 an ray unmask rat
159 an sunk at ray arm
160 rank mayan sutra
161 many a runs karat
162 an murky a rant as
163 manna rays kurta
164 an ana marry tusk
165 my rank a turn aas
166 sunk manta array
167 an masa ray trunk
168 an mat ray ask run
169 nay nark traumas
170 many as ran kraut
171 an sunk a arm tray
172 rya ranks mantua
173 my ara ranks aunt
174 my nuts a ran arak
175 snarky mara tuna
176 my aura rank ants
177 an any a strum ark
178 mantua yarns ark
179 rank as turn maya
180 an rum a star yank
181 mantua rays nark
182 an mara turns yak
183 my rank a rat anus
184 sutra nark mayan
185 run an stark maya
186 an sunk a tar army
187 snarky maar aunt
188 my ana runs karat
189 an must a rank rya
190 nary aunts karma
191 many a turns arak
192 an any as mar turk
193 manus yarn karat
194 stark a run mayan
195 an ara run my task
196 runny samara kat
197 an maya rust rank
198 an rank as rut may
199 sunny maar karat
200 many a rank sutra
201 us tar an rank may
202 rya unmask ratan
203 smart a rank yuan
204 an any a tram rusk
205 nary ana muskrat
206 an nay arm krauts
207 us tram an any ark
208 rusty manna arak
209 an mara turn yaks
210 an any at ram rusk
211 snarky maar tuna
212 sunk at array man
213 an rum as ray tank
214 unmask tan array
215 murky a star anna
216 an rust a mark nay
217 runny masa karat
218 an yuan tar marks
219 an a nark my sutra
220 arty manana rusk
221 an nay mark sutra
222 an rum at ask yarn
223 nary traumas kan
224 rank aunt say arm
225 an rank at ray sum
226 krauts army anna
227 my sauna tar rank
228 an rum a yanks art
229 snark any trauma
230 an aunty mark ras
231 my rust a rank ana
232 nary manus karat
233 my ana turns arak
234 us rat my rank ana
235 nana rusty karma
236 my sutra rank ana
237 an rusty a arm kan
238 katsura nary man
239 my aura ranks ant
240 an many a tar rusk
241 karn any traumas
242 my anus ran karat
243 an rum a rays tank
244 trunk maya saran
245 any art sun karma
246 an rum ana ask try
247 unmask ana tarry
248 sunny a rat karma
249 an rank a sum tray
250 katsu marry anna
251 an uta ranks army
252 my nuts a rank ara
253 kraut army annas
254 many as turn arak
255 an any rut ask ram
256 marks ratan yuan
257 an any mars kraut
258 an mat run say ark
259 krauts army naan
260 an any ram krauts
261 an nuts a mark rya
262 trunk samara nay
263 an must yarn arak
264 an sunk a ray tram
265 katsura man yarn
266 an yam ran krauts
267 an many as rut ark
268 kurta army annas
269 an maya rut ranks
270 us tar an many ark
271 kana marry aunts
272 an rust many arak
273 an sunk a try maar
274 ark mantras yuan
275 any turn ask maar
276 an rum a stay nark
277 trunks mara yana
278 any mara run task
279 an any tar ask rum
280 trunk yama saran
281 tan run say karma
282 an sat run my arak
283 trunks mayan ara
284 an yama turns ark
285 us man an arty ark
286 rusk manana tray
287 an yama ran turks
288 my rank tau ran as
289 turk mayan saran
290 many ara ask turn
291 an sunk at ray ram
292 muskrat rya anna
293 my saran run taka
294 an rust a arm yank
295 karma yurt annas
296 an any mara turks
297 an sunk a ray mart
298 mana nary krauts
299 an aunty mark ars
300 an smart a yak urn
301 karma runts yana
302 an nuts ray karma
303 my rank at run aas
304 suk tarry manana
305 snarky a arm aunt
306 an sunk a ram tray
307 turks manana rya
308 an yams run karat
309 an rank a ray smut
310 rusk mayan ratan
311 an ray stunk mara
312 an rum a stank ray
313 katsu marry naan
314 an any arms kurta
315 an art sun my arak
316 karat mayan urns
317 an mays run karat
318 an rum a rat yanks
319 trunks maar yana
320 my art nark sauna
321 an rum a rats yank
322 rusk mantra yana
323 an ara unmask try
324 an musty a ran ark
325 kana martyr anus
326 my aunts ran arak
327 an rum a yank arts
328 krauts manna rya
329 kraut man an rays
330 an rum at say nark
331 muskrat ray nana
332 an yams ran kraut
333 an rum a yarn task
334 karma trans yuan
335 an mays ran kraut
336 my rank at sun ara
337 sunk mantra raya
338 many as ran kurta
339 an rust a nark may
340 sark nary mantua
341 muskrat yarn an a
342 an any art sum ark
343 kana tarry manus
344 an rusty ana mark
345 an any at mar rusk
346 kraut myna saran
347 rank at runs maya
348 an rum at sank ray
349 arak mayan runts
350 an nay rust karma
351 us ray an mat rank
352 mask tranny aura
353 an nay ram krauts
354 an rum as yank art
355 ataman nary rusk
356 an ray unmask tar
357 an nary at ask rum
358 mark raya suntan
359 sunk at marry ana
360 my tan as run arak
361 many katsura ran
362 an sutra nark may
363 an rum a sky ratan
364 muskrat rya naan
365 stark may run ana
366 my rank a tar anus
367 kurta myna saran
368 murky a rats anna
369 my rank uta ran as
370 katsura army nan
371 an mat sunk array
372 an rum a sank tray
373 muskrat yar anna
374 an yana rust mark
375 an rusty a ram kan
376 karma astray nun
377 any anus mark art
378 my tan a runs arak
379 ark starman yuan
380 any must ran arak
381 an ara ask my runt
382 krauts mana yarn
383 my ara ranks tuna
384 an sun rat my arak
385 karma yar suntan
386 rank aunt say ram
387 an any rut ask mar
388 kaya mantras run
389 my anna rust arak
390 my tan ara ask run
391 krauts army nana
392 any arms run taka
393 my sunk at ran ara
394 kaya mantra runs
395 an yana arm turks
396 an aas turn my ark
397 muskrat raya nan
398 my sauna rant ark
399 my tan a rank sura
400 snark trauma nay
401 rank as arm aunty
402 an sunk at ray mar
403 kraut mana yarns
404 taka marry an sun
405 us ray an rank tam
406 snark mara aunty
407 must anna ray ark
408 an rust a ram yank
409 rusk ataman yarn
410 my sauna rat nark
411 an anus rat my ark
412 katsura myna ran
413 nuts a yarn karma
414 an any rat sum ark
415 snark mantua ray
416 an nary must arak
417 an tan ray ask rum
418 sark mantra yuan
419 an any mar krauts
420 my rank as rut ana
421 yanks mura ratan
422 my auras rank ant
423 us tar my rank ana
424 stunk mana array
425 my ara rank aunts
426 an arty a mark uns
427 kaya starman run
428 unmask an tarry a
429 an sunk a mar tray
430 kurta mana yarns
431 an yams turn arak
432 an rum as rat yank
433 yank mantra ursa
434 tusk man an array
435 an arty a ran musk
436 snarky amu ratan
437 an aunts mark rya
438 an sura ran my kat
439 ranks mantua yar
440 many at runs arak
441 an nary a task rum
442 muskrat yar naan
443 sunny a arm karat
444 an rum nay ask art
445 kaya mantras urn
446 sunk mantra ray a
447 an rum art say kan
448 karn traumas nay
449 rank a turns yama
450 an at nark my sura
451 snark maar aunty
452 an mays turn arak
453 an rum a yank tsar
454 yuk mantra saran
455 an mara rust yank
456 an ana rat my rusk
457 sark mantua yarn
458 rank tuna say arm
459 an rum ant ask ray
460 karn mantua rays
461 an any mars kurta
462 an rum a stray kan
463 kaya mantra urns
464 an ara stunk army
465 an arty a mask urn
466 karn mayan sutra
467 an army stun arak
468 an ana rust my ark
469 trunk mayan rasa
470 runny at ask mara
471 us ran my tan arak
472 unmask rant raya
473 my aura tans rank
474 an rust a rank yam
475 katsura nam yarn
476 my aura sank rant
477 my rank a stun ara
478 sark manana yurt
479 snarky a ram aunt
480 an aas ran my turk
481 unmask ratan yar
482 an rusty man arak
483 an ara runs my kat
484 unmask tarn raya
485 an nasty rum arak
486 an rank at ray mus
487 turks manana yar
488 an aunty rams ark
489 an rum at ran yaks
490 turks manna raya
491 an mus array tank
492 us rat an rank yam
493 snark mantua rya
494 an maar turns yak
495 an murky a ran tas
496 muskrat rya nana
497 sunny a tar karma
498 an rum a tar yanks
499 kaya starman urn
500 an mayan rat rusk

### newfoundglory:people

input: New Found Glory
category: people
phrases 1 to 500 of 500

1 fondue wrongly
2 we long foundry
3 under fly go now
4 we go run fly don
5 only few ground
6 only no drug few
7 we fly no on drug
8 only grew found
9 only few run god
10 we run on fly god
11 god lower funny
12 under fly go won
13 we run no fly god
14 only wrong feud
15 only gun of drew
16 we dry of on lung
17 dog lower funny
18 our gen fly down
19 we run on fly dog
20 now drug felony
21 only few run dog
22 no of we dry lung
23 now undergo fly
24 our gown fly end
25 we run no fly dog
26 gurney wolf don
27 we lord of gunny
28 we fly on don rug
29 gold wore funny
30 new glory do fun
31 we fly no don rug
32 won drug felony
33 only fun go drew
34 we dry no on gulf
35 felony gun word
36 new fly go round
37 we fly on do rung
38 red flown young
39 only rug don few
40 we gun on fry old
41 gunny do flower
42 on wrong fly due
43 we fly no do rung
44 gurney flow don
45 world yen of gun
46 we gun no fry old
47 felony own drug
48 due fly wrong no
49 we fry on do lung
50 wolf do gunnery
51 we go funny lord
52 we go urn fly don
53 won undergo fly
54 we drug of nylon
55 we fry no do lung
56 down lounge fry
57 own one fly drug
58 we gun on fly rod
59 only grown feud
60 old now grey fun
61 we log on dry fun
62 flow do gunnery
63 only rung do few
64 we gun no fly rod
65 now fold gurney
66 red funny go low
67 we log no dry fun
68 ugly done frown
69 only gun for wed
70 we lug on fry don
71 fun wrong yodel
72 world fun go yen
73 we lug no fry don
74 nerd wolf young
75 on fly urge down
76 on lug of new dry
77 fonder ugly now
78 only gun for dew
79 we go run fly nod
80 worn only fudge
81 ugly wen for don
82 no lug of new dry
83 now longed fury
84 down urge fly no
85 we fly on dog urn
86 found rely gown
87 we fly on ground
88 we fly urn dog no
89 on wrongful dye
90 new rolf guy don
91 we go nun fry old
92 wrongly on feud
93 on guy flown red
94 we run nog do fly
95 nerd flow young
96 on fury down leg
97 we log nun of dry
98 ground yen wolf
99 no guy flown red
100 wry gun of on led
101 world ego funny
102 no fury down leg
103 wry no gun of led
104 wrongly no feud
105 end for ugly now
106 we go nun fly rod
107 funnel go dowry
108 ugly wren of don
109 we fly on nod rug
110 gunny do fowler
111 on now urged fly
112 we fly no nod rug
113 leg own foundry
114 grey now don flu
115 wry gun of on del
116 drone flown guy
117 no now urged fly
118 wry no gun of del
119 ugly fond owner
120 now lend for guy
121 we log nun do fry
122 fondly urge now
123 we don long fury
124 we gun on fry dol
125 word ogle funny
126 down one fly rug
127 on rug new do fly
128 golden fury now
129 only wen of drug
130 we gun no fry dol
131 ground yen flow
132 one now dry gulf
133 no rug new do fly
134 led frown young
135 old fern guy now
136 we go urn fly nod
137 funny grow dole
138 own gun do flyer
139 on flu go new dry
140 guy drown felon
141 ugly now do fern
142 on fly or new dug
143 on flowery dung
144 funny row do leg
145 dry new flu go no
146 found yen growl
147 won fury don leg
148 no fly or new dug
149 one flung dowry
150 down lyre of gun
151 wry lug of on end
152 young drown elf
153 on fen guy world
154 wry no lug of end
155 newly four dong
156 won fun rely god
157 gun or we fly don
158 won fold gurney
159 won fun grey old
160 on wen lug of dry
161 yonder wolf gun
162 own fly urge don
163 we log on fry dun
164 on engulf dowry
165 ugly now don ref
166 we log no fry dun
167 gurney fowl don
168 world fen guy no
169 we fly urn do nog
170 dowry engulf no
171 owned fly go run
172 wed fly go on run
173 fonder ugly won
174 on flu grey down
175 wed fly go no run
176 grown found ley
177 low fun grey don
178 run go on fly dew
179 funny grow lode
180 no flu grey down
181 run go no fly dew
182 won longed fury
183 due fry long now
184 run go fly do wen
185 dungeon fly row
186 own fury don leg
187 wry nun go of led
188 yonder flow gun
189 done now fly rug
190 wry leg of on dun
191 gurney own fold
192 down ley for gun
193 we lug on fry nod
194 foundry gel now
195 dry lunge of now
196 wry leg of no dun
197 door flew gunny
198 own fun rely god
199 we lug no fry nod
200 grown found lye
201 own fun grey old
202 dry few lug on no
203 new log foundry
204 fly our new dong
205 wry nun go of del
206 del frown young
207 our gown fly den
208 on gun or wed fly
209 on engulf rowdy
210 down lye for gun
211 no gun or wed fly
212 only unwed frog
213 on fry glue down
214 on lug new do fry
215 funny word loge
216 dry one wolf gun
217 new gun or do fly
218 rowdy engulf no
219 end for ugly won
220 we go nun fry dol
221 gunner fly wood
222 only few gun rod
223 wry on fun do leg
224 newly fog round
225 on guy wolf nerd
226 wry no fun do leg
227 fondly urge won
228 down glue fry no
229 on ful go new dry
230 found ley wrong
231 ugly no down ref
232 wry lug of on den
233 golden fury won
234 runny few go old
235 dry new ful go no
236 fowl do gunnery
237 on won urged fly
238 wry no lug of den
239 now dye furlong
240 red funny go owl
241 gun nor we do fly
242 found lye wrong
243 no guy wolf nerd
244 wry on fun go led
245 world fen young
246 won flu grey don
247 wry no fun go led
248 fondly wore gun
249 down fun go lyre
250 no or we fly dung
251 funny growl doe
252 no won urged fly
253 no on rug fly wed
254 fondly own urge
255 won lend for guy
256 no on rug fly dew
257 golden fury own
258 won gulf dry one
259 on fly rug do wen
260 wrongful yen do
261 old fern guy won
262 no fly rug do wen
263 drew fool gunny
264 glued no fry now
265 wry gel of on dun
266 dungeon fry low
267 funny row go led
268 wry no gel of dun
269 renown guy fold
270 down rye of lung
271 wry on flu go end
272 young fold wren
273 dry one flow gun
274 wry no flu go end
275 owned fun glory
276 long fun owe dry
277 wry on fun go del
278 wry good funnel
279 worn no fled guy
280 wry no fun go del
281 older funny wog
282 on guy flow nerd
283 on flu go dry wen
284 foundry gel won
285 newly do for gun
286 nun or we fly god
287 owned fury long
288 wrong fun do ley
289 wed fly go on urn
290 down felony rug
291 gone now dry flu
292 wry on gun do elf
293 gunnery of wold
294 no guy flow nerd
295 wed fly go no urn
296 young rend wolf
297 on fry would gen
298 urn go on fly dew
299 felon gun dowry
300 ugly won do fern
301 wry no gun do elf
302 yon flew ground
303 own flu grey don
304 wry on fun do gel
305 nerd fowl young
306 down fly go rune
307 urn go no fly dew
308 dory engulf now
309 fey no gun world
310 urn go fly do wen
311 glory endow fun
312 wrong flu do yen
313 wry no fun do gel
314 yonder gulf now
315 won fun rely dog
316 no nor we fly dug
317 runny good flew
318 ugly won don ref
319 nun or we fly dog
320 gel own foundry
321 our wen fly dong
322 do new fly go run
323 won leg foundry
324 down ego fly run
325 gun or we fly nod
326 rowdy none gulf
327 down rely of gun
328 wed fry lug on no
329 duly gone frown
330 one gulf own dry
331 no on lug fry dew
332 won dye furlong
333 own fern guy old
334 on lug fry do wen
335 long endow fury
336 wrong fun do lye
337 on gun or fly dew
338 worn young fled
339 new fury log don
340 no lug fry do wen
341 young rend flow
342 due fry long won
343 new fly or go dun
344 found wen glory
345 on guy frown led
346 no gun or fly dew
347 fund grew loony
348 only wen for dug
349 wry on flu go den
350 don flowery gun
351 new glory of dun
352 wry on ful go end
353 ground yen fowl
354 we gun only ford
355 wry no flu go den
356 godown rely fun
357 no guy frown led
358 no elf on wry dug
359 only refund wog
360 done won fly rug
361 wry no ful go end
362 gown deny flour
363 dry lunge of won
364 on ful go dry wen
365 on dewy furlong
366 only urn dog few
367 on wry no lug fed
368 funny glow doer
369 own fun rely dog
370 wry on flu do gen
371 furlong own dye
372 own fry glue don
373 wry no flu do gen
374 yon wonder gulf
375 ugly ref own don
376 fly nor we go dun
377 furlong don yew
378 done fly gun row
379 we fly or on dung
380 newly roof dung
381 on guy drown elf
382 on wen or fly dug
383 under flown goy
384 newly drug of no
385 dry wen flu go no
386 undone fly grow
387 on owner fly dug
388 no wen or fly dug
389 down foyer lung
390 won lung for dye
391 wry on elf go dun
392 wordy none gulf
393 on fly grow nude
394 wry no elf go dun
395 felony row dung
396 one fun glow dry
397 do leg of wry nun
398 wed floor gunny
399 gone low dry fun
400 on nog we dry flu
401 wry long fondue
402 no owner fly dug
403 no nog we dry flu
404 yonder fowl gun
405 good wen fly run
406 dry wen of lug no
407 rowdy funnel go
408 nude fly grow no
409 do new fly go urn
410 funny logo drew
411 we glory on fund
412 wry on ful go den
413 dew floor gunny
414 newly run of god
415 wry no ful go den
416 dory engulf won
417 funny row go del
418 we fly nor on dug
419 funny growl ode
420 won fury do glen
421 wry on lug do fen
422 yonder gulf won
423 worn elf guy don
424 wry no lug do fen
425 grown foul deny
426 ugly ern of down
427 wry on ful do gen
428 dungeon fry owl
429 on fury gel down
430 wry no ful do gen
431 newly undo frog
432 own fry long due
433 dun fly or go wen
434 gunny rode wolf
435 down yen for lug
436 gun or fly do wen
437 rowdy one flung
438 no fury gel down
439 do new fry lug no
440 feud grow nylon
441 only wren of dug
442 nog or we fly dun
443 youd frown glen
444 own rolf guy end
445 do gel of wry nun
446 gurney wolf nod
447 done rug own fly
448 dry wen ful go no
449 fold wore gunny
450 own lunge of dry
451 on nog we dry ful
452 yonder gulf own
453 dewy no for lung
454 no nog we dry ful
455 gunny rode flow
456 grey owl don fun
457 god we fly on urn
458 flowery nun god
459 own lung for dye
460 god we fly no urn
461 grown fond yule
462 edgy no run wolf
463 nun or fly go dew
464 godly owner fun
465 glued no fry won
466 do elf go wry nun
467 worn guy fondle
468 on leg fry wound
469 gyn we run of old
470 wordy funnel go
471 low gunny of red
472 wed fly go or nun
473 deny foul wrong
474 on gulf down rye
475 we fry gul on don
476 norn flowed guy
477 on wolf yen drug
478 we go durn on fly
479 fondly owe rung
480 on flyer own dug
481 we fry gul no don
482 yodel frown gun
483 on flu wrong dye
484 we go durn no fly
485 frowned ugly no
486 wound leg fry no
487 gul new no of dry
488 gurney flow nod
489 on fun glory wed
490 dry few gul on no
491 word funnel goy
492 only rung of wed
493 we gun dor on fly
494 ungodly ref now
495 own fury do glen
496 gul new no do fry
497 wound goner fly
498 no gulf down rye
499 we dry gol on fun
500 gown undo flyer
