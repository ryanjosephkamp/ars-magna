<!-- screen_version: v1 -->
# Screening anagrams for the Ars Magna Greatest Hits

Each section below is one **input** (a person, company, product, title, place or phrase), its **category**, and a numbered list of **phrases**. Every phrase is a rearrangement of exactly the input's letters into real English words. The letters are already checked; do not re-check them. An input with a number or a symbol in it also has a `reading:` line saying that the item was left out (`4:drop` leaves the 4 out); nothing is converted, so no phrase uses the letters of a number's name.

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

## File 20 of 66: 2612 phrases

### fredastaire:people

input: Fred Astaire
category: people
phrases 1 to 500 of 500

1 afraid trees
2 its dear fear
3 after a is red
4 i set far red a
5 afraid steer
6 its dear fare
7 its a fear red
8 i fret as red a
9 afraid reset
10 its rare deaf
11 fat are is red
12 i err as deft a
13 fair dearest
14 after is dear
15 its a fare red
16 i err a set fad
17 easier draft
18 it fears dear
19 red at is fear
20 a is at err fed
21 fairest dear
22 its rear deaf
23 far are is ted
24 red ref is at a
25 afraid ester
26 it read fears
27 red at fire as
28 red a i fat res
29 fairest dare
30 i arrest deaf
31 red a fits are
32 red a i fat ers
33 fairer dates
34 its rare fade
35 far a see dirt
36 a if as err ted
37 seated friar
38 i fast reader
39 its ref read a
40 sad fet i err a
41 afeard tires
42 i feared star
43 dirt a free as
44 it as red a ref
45 fated sierra
46 it erased far
47 its a free rad
48 i as red at ref
49 rarefied sat
50 after is dare
51 red as fit are
52 it err a as fed
53 afeard tries
54 i retard safe
55 red a fires at
56 i err a at feds
57 teased friar
58 its rear fade
59 free a is dart
60 red res if at a
61 safer tirade
62 i arrest fade
63 its a rear fed
64 red ers if at a
65 sedate friar
66 it fears dare
67 dear fret is a
68 i err at as fed
69 afeared stir
70 i fears trade
71 red sir fate a
72 i err a sat fed
73 adrift saree
74 it reads fear
75 free at rid as
76 i set ref a rad
77 afire trades
78 i stared fear
79 red a sit fear
80 i set der far a
81 fairer stead
82 i fat readers
83 its ref dare a
84 fer red a is at
85 afeard rites
86 it fear dares
87 far at is deer
88 i aft red a res
89 afire treads
90 i fear trades
91 far at is reed
92 i aft red a ers
93 idea rafters
94 it fares dear
95 red set fair a
96 i set arf red a
97 fated raiser
98 it read fares
99 i desert far a
100 i fat ser red a
101 aired afters
102 i feared rats
103 red at is fare
104 i err a tas fed
105 radiate serf
106 i feared arts
107 far tea is red
108 i err fet a ads
109 radiate refs
110 i reared fast
111 its a err deaf
112 fed res i rat a
113 raiders fate
114 faster ride a
115 red a fire sat
116 it fer as red a
117 feared stair
118 i reread fast
119 rare at is fed
120 fed ers i rat a
121 rarefied tas
122 are fast ride
123 aft are is red
124 i fer as red at
125 afeard tiers
126 i refers data
127 dear ref is at
128 i fret a der as
129 astride fear
130 i fear treads
131 far a sit deer
132 fed res i tar a
133 feared sitar
134 it fear dears
135 far a sit reed
136 fed ers i tar a
137 raised after
138 i erase draft
139 its far a deer
140 it err a def as
141 deter safari
142 i farted ears
143 its far a reed
144 def is a err at
145 readies fart
146 desert fair a
147 free at is rad
148 i err at def as
149 data ferries
150 i tarred safe
151 far ate is red
152 fed ser i rat a
153 freed tiaras
154 it fares dare
155 red a sift are
156 i set a fer rad
157 adrift erase
158 i erased fart
159 its a err fade
160 i ser aft red a
161 raider feast
162 i fares trade
163 free a rid sat
164 i fat a der res
165 readies raft
166 i fears tread
167 rear at is fed
168 a if ser red at
169 readers fiat
170 tried safer a
171 red a fit ears
172 i fat a der ers
173 dearie farts
174 it fees radar
175 red rise fat a
176 i err a def sat
177 readies frat
178 i read afters
179 it fear red as
180 fed ser i tar a
181 radiates ref
182 fear is trade
183 red a sit fare
184 i err a def tas
185 raiders feat
186 it reads fare
187 it fears red a
188 i ser far a ted
189 fad arteries
190 tired safer a
191 i read far set
192 der ref is at a
193 fared satire
194 i erased raft
195 dirt a reef as
196 i fer red a sat
197 astride fare
198 it rear fades
199 its a reef rad
200 arf der i set a
201 tirade fears
202 i stared fare
203 rare a sit fed
204 ser der i fat a
205 aide rafters
206 i feared tsar
207 dire a set far
208 i fer red a tas
209 defer tiaras
210 dirt safe are
211 its rare a fed
212 def ser i rat a
213 raider fates
214 as fire trade
215 dear ref sit a
216 def res i rat a
217 teared fairs
218 sir feared at
219 fat ear is red
220 def ers i rat a
221 dearie rafts
222 far rest idea
223 its dear ref a
224 i far a res ted
225 raider feats
226 said far tree
227 red tis fear a
228 i far a ers ted
229 darts faerie
230 fits read are
231 red sire fat a
232 i der aft a res
233 tirade fares
234 i rated fears
235 free a sit rad
236 i der aft a ers
237 aired faster
238 i farted arse
239 red a fit arse
240 def ser i tar a
241 read fairest
242 i erased frat
243 i fears red at
244 def res i tar a
245 aida ferrets
246 it fare dares
247 far ear is ted
248 red serf i at a
249 farted raise
250 i fared tears
251 dear a set fir
252 def ers i tar a
253 raiders feta
254 feet is radar
255 i set far dare
256 red refs i at a
257 aider afters
258 i dare afters
259 rear a sit fed
260 red ref i sat a
261 stared afire
262 fist read are
263 red a refit as
264 i ser der aft a
265 aider faster
266 i fare trades
267 red a fits ear
268 der res if at a
269 farted arise
270 fire stared a
271 i as after red
272 der ers if at a
273 radiates fer
274 date fear sir
275 far eta is red
276 red ref i tas a
277 sated fairer
278 a fires trade
279 i seat far red
280 it der a as ref
281 fires read at
282 fat era is red
283 i fer a at reds
284 dear fate sir
285 fit a erred as
286 red fet i ras a
287 i trees farad
288 far a tree ids
289 i der a at serf
290 a fire trades
291 far sir teed a
292 red fet i ars a
293 it fared ears
294 i see far dart
295 der fer is at a
296 sir read fate
297 far era is ted
298 i der at as ref
299 strife read a
300 red as fit ear
301 i ser a art fed
302 it feed arras
303 far tree dis a
304 i der a at refs
305 i draft saree
306 it fares red a
307 i der a sat ref
308 i fats reader
309 i faster red a
310 i def a art res
311 fries trade a
312 i dart free as
313 i def a art ers
314 are fits dare
315 free a dis art
316 i arf a res ted
317 fries read at
318 i tree sad far
319 i arf a ers ted
320 are farts die
321 deft a is rear
322 it fer der a as
323 fire reads at
324 red a fits era
325 i fer a ras ted
326 data free sir
327 it fare red as
328 i fer a ars ted
329 its fear read
330 red a fit ares
331 i fer der at as
332 dire after as
333 rest if dear a
334 der ser if at a
335 dear fair set
336 freer a is tad
337 i fer res a tad
338 i fare treads
339 red fir seat a
340 i der a tas ref
341 i fared stare
342 i erred fast a
343 i fer ers a tad
344 desire fart a
345 free a rat ids
346 i der a ras fet
347 rested fair a
348 red a fit sera
349 i fer der a sat
350 a fit readers
351 dire a fret as
352 i ser def a art
353 fist dare are
354 dear res fit a
355 i der a ars fet
356 it fare dears
357 side ref rat a
358 reds ref i at a
359 i fares tread
360 red as fit era
361 i arf ser a ted
362 die rafters a
363 red firs eat a
364 tad a ref res i
365 are rid feast
366 red a fire tas
367 fed res i art a
368 stride fear a
369 fit res read a
370 tad a ref ers i
371 ride fears at
372 dear ers fit a
373 fed ers i art a
374 fear is tread
375 free a dis rat
376 i fer der a tas
377 a free triads
378 i fares red at
379 rad a fet res i
380 i farted ares
381 it see far rad
382 rad a fet ers i
383 at fires dare
384 fit ers read a
385 ted ref i ras a
386 a fire treads
387 i deter far as
388 ted ref i ars a
389 sea drift are
390 far at die res
391 tad a ref ser i
392 fit reads are
393 red tis fare a
394 rad a fet ser i
395 at fire dares
396 sad fir tree a
397 tad a fer ser i
398 i fasted rear
399 i fear red sat
400 fat is reader
401 red ire fast a
402 faster dire a
403 red fir eat as
404 red fairest a
405 far at die ers
406 riders fate a
407 far tees rid a
408 air see draft
409 i arrest a fed
410 far tides are
411 east a rid ref
412 dare fate sir
413 fit a sear red
414 strife dare a
415 far tee rid as
416 desire raft a
417 free a rid tas
418 are fat rides
419 fit res dare a
420 it rears deaf
421 aft ear is red
422 far die tears
423 red reis fat a
424 die fear star
425 fat seer rid a
426 fare is trade
427 fit ers dare a
428 i farted sera
429 red a fit eras
430 it fared arse
431 i seed far art
432 fries dare at
433 i eat far reds
434 fear sit dare
435 freer a dis at
436 i fared rates
437 far a diet res
438 as fire tread
439 red a sift ear
440 rides fear at
441 i far rested a
442 freer said at
443 i free a darts
444 its fear dare
445 far a diet ers
446 dear far site
447 i star are fed
448 ride seat far
449 freed i star a
450 i fart reseda
451 a if red tears
452 fit see radar
453 die rest far a
454 i rated fares
455 far a tide res
456 it feared ras
457 free a tar ids
458 a desire frat
459 sad ref tire a
460 side fear art
461 fetid a err as
462 dare fair set
463 i tree far ads
464 are fit dares
465 aft era is red
466 side rate far
467 far a tide ers
468 side tear far
469 side ref tar a
470 fire read sat
471 i rat far seed
472 rider feast a
473 free a dis tar
474 are fart dies
475 red a sift era
476 tried fear as
477 i erred fat as
478 at free raids
479 said fet err a
480 far see triad
481 sere a rid fat
482 tried fears a
483 a if red stare
484 fired tears a
485 red fet air as
486 a fits reader
487 see at rid far
488 i steer farad
489 ride set far a
490 it fee radars
491 i fare red sat
492 as free triad
493 far a edit res
494 red seat fair
495 i rat free ads
496 said a ferret
497 it as far deer
498 i reared fats
499 it as far reed
500 i raft reseda

### jacobtremblay:people

input: Jacob Tremblay
category: people
phrases 1 to 500 of 500

1 my abject labor
2 my job table car
3 my jet a blob car
4 by alarm object
5 my job clear bat
6 my jet a bar bloc
7 calm betray job
8 my art job cable
9 my jet a barb col
10 army object lab
11 my lab job trace
12 my jet a lob crab
13 cabby major let
14 my job clear tab
15 my jet a blob arc
16 cream baby jolt
17 my job alert cab
18 my jet a blab roc
19 object lamb ray
20 my job react lab
21 bel jab to my car
22 clam betray job
23 my job rat cable
24 me job at cry lab
25 by abject moral
26 my job table arc
27 bel cab to my raj
28 maybe jolt crab
29 my job bleat car
30 bel jar to my cab
31 jay bomb cartel
32 my lab job crate
33 me lot by jab car
34 lambert joy cab
35 my job alter cab
36 my let job a crab
37 cymbal rate job
38 my tale job crab
39 me jolt by crab a
40 cymbal tear job
41 my raj be cobalt
42 lab to me jab cry
43 trace jam lobby
44 my jar be cobalt
45 my job belt a car
46 clamor baby jet
47 job my later cab
48 me lot by cab raj
49 marcel baby jot
50 my a jabber colt
51 me lot by jar cab
52 balm ray object
53 my job blare act
54 by job a let marc
55 colter jam baby
56 my let jab cobra
57 bel jab to my arc
58 lobby react jam
59 my babe jolt car
60 by be raj to calm
61 by macabre jolt
62 my job cater lab
63 by be jar to calm
64 bramble joy act
65 my job blare cat
66 me bolt a jab cry
67 calm jabber toy
68 my job tar cable
69 try job a be clam
70 colt jabber may
71 my a jabber clot
72 me try a jab bloc
73 bramble joy cat
74 my lab job carte
75 my lab or jet cab
76 jay bomb claret
77 my brat job lace
78 raj ebb to my lac
79 clay jabber tom
80 job my able cart
81 ebb jar to my lac
82 crate jam lobby
83 blame at job cry
84 by job a melt car
85 by abject molar
86 my teal job crab
87 by job let cram a
88 clot jabber may
89 my bolt jab care
90 me job by rat lac
91 jab rely combat
92 job my late crab
93 lot be by jam car
94 marcel jab toby
95 my lot jab brace
96 my lot be jab car
97 mercy jolt baba
98 my at cobble raj
99 reb jab to my lac
100 lambert job cay
101 my bet jab carol
102 me lot by jab arc
103 ably arm object
104 my at jar cobble
105 a job bam let cry
106 lobby cater jam
107 jabber to my lac
108 me blot a jab cry
109 bloc betray jam
110 my job bale cart
111 calm a be job try
112 maja try cobble
113 my job bear talc
114 my jolt be a crab
115 jay mat cobbler
116 my jet labor cab
117 my bel job at car
118 object bray lam
119 my at jabber col
120 jam to lab be cry
121 carte jam lobby
122 calm tray be job
123 cry be job malt a
124 jam rely bobcat
125 my jolt bear cab
126 a job lab met cry
127 jet moral cabby
128 my lab jet cobra
129 my lot be raj cab
130 jay mat clobber
131 my bet jab coral
132 by be raj to clam
133 object lamb rya
134 able try job mac
135 my lot be jar cab
136 ably ram object
137 my blot jab care
138 my job belt a arc
139 abbey jolt marc
140 calm bye job art
141 by be jar to clam
142 cabby jar motel
143 my babe jar colt
144 my job be lat car
145 mercy jab bloat
146 my bolt jab race
147 me job by tar lac
148 tam clobber jay
149 my lat job brace
150 my job be alt car
151 cobble jam tray
152 my alt job brace
153 a bob jam let cry
154 jet balmy cobra
155 my jot bar cable
156 a let by comb raj
157 rectal jay bomb
158 my jab bear colt
159 me job by arc lat
160 cabot jam beryl
161 my raj beat bloc
162 cry be job lam at
163 bomber talc jay
164 my job bare talc
165 a jar by let comb
166 crabby male jot
167 my jar beat bloc
168 me job by arc alt
169 clam jabber toy
170 my bot clear jab
171 my a etc blob raj
172 combat jab lyre
173 my raj clot babe
174 me lob by act raj
175 cymbal bear jot
176 my jet barb coal
177 my let or jab cab
178 boar jet cymbal
179 my raj table cob
180 my a etc blob jar
181 jay tram cobble
182 able try job cam
183 me lob by jar act
184 crab jab motley
185 my babe jar clot
186 me bat by jar col
187 calmer baby jot
188 my jar table cob
189 me blab a jot cry
190 mart cobble jay
191 my job bleat arc
192 by jolt a be marc
193 comb jab realty
194 calm ray bet job
195 a rob by jet calm
196 ably mar object
197 blame jab to cry
198 me lob by cat raj
199 cymbal jab tore
200 my tael job crab
201 me lob by jar cat
202 jolt cram abbey
203 my bel job carat
204 me lob at jab cry
205 crabby lame jot
206 my raja bet bloc
207 me rat by jab col
208 rya object balm
209 calm bye job rat
210 my job be art lac
211 balmy job carte
212 my jab bear clot
213 my bel job a cart
214 trace balmy job
215 my brat jab cole
216 by lot raj be mac
217 bobcat jam lyre
218 calm brat be joy
219 my at raj be bloc
220 clay jabber mot
221 my jet rob cabal
222 lot be by jar mac
223 jet molar cabby
224 arty job be calm
225 cry be bolt jam a
226 react balmy job
227 my jolt bare cab
228 my at jar be bloc
229 cymbal bare jot
230 bay let job marc
231 a try jam be bloc
232 colt jabber yam
233 my jab table roc
234 my jot be lab car
235 realm jot cabby
236 my abbe jolt car
237 cry bet job lam a
238 mare jolt cabby
239 my babel jot car
240 me jot by arc lab
241 calmer jab toby
242 my jot blab care
243 by lot raj be cam
244 abject army lob
245 my blot jab race
246 lot be by jar cam
247 lacy jabber tom
248 my jet barb cola
249 my job be rat lac
250 clot jabber yam
251 my bot cable raj
252 by job a melt arc
253 cab majorly bet
254 my babe jolt arc
255 by jam bel to car
256 crate balmy job
257 my bot jar cable
258 jolt be by cram a
259 creamy jab bolt
260 my lab jot brace
261 lot be by jam arc
262 talc jab embryo
263 calm raj be toby
264 my lot be jab arc
265 coy lambert jab
266 my bet jab claro
267 by job elm cart a
268 crabby meal jot
269 my jab bare colt
270 by job a term lac
271 cater balmy job
272 calm jar be toby
273 me jot by bar lac
274 cymbal jab rote
275 marly job be act
276 lam to jab be cry
277 comely jab brat
278 my bel jab actor
279 elm try a job cab
280 clamor jab byte
281 late bam job cry
282 bel try a job mac
283 ably abject rom
284 jet boy bar calm
285 a mob jab let cry
286 cabby ream jolt
287 my raja belt cob
288 me tar by jab col
289 creamy jab blot
290 calm raj bet boy
291 cry be blot jam a
292 arty jam cobble
293 my bra jot cable
294 my a raj bet bloc
295 crabby loam jet
296 calm bar bet joy
297 my a jar bet bloc
298 abject bam lory
299 calm jar bet boy
300 a orb by jet calm
301 coy jabber malt
302 my jolt barb ace
303 me rot by jab lac
304 bramble jot cay
305 marly job be cat
306 a jolt bam be cry
307 creamy jot blab
308 my rate jab bloc
309 a jot lamb be cry
310 act majorly ebb
311 my tear jab bloc
312 by jab elm to car
313 cat majorly ebb
314 my lobe jab cart
315 bel try a job cam
316 abject bray mol
317 my alert jab cob
318 my bel job at arc
319 cable barmy jot
320 my jab bare clot
321 my jolt ebb a car
322 lacy jabber mot
323 bay melt job car
324 my jab or be talc
325 brace balmy jot
326 jet boy lamb car
327 my job be tar lac
328 lamer jot cabby
329 lay job met crab
330 a jar by met bloc
331 cobby later jam
332 calm bye job tar
333 a rob by jet clam
334 cobby jet alarm
335 able job mat cry
336 my job be lat arc
337 cob lambert jay
338 ace lamb job try
339 col be by jam art
340 cobbler jay tam
341 my lob jab trace
342 my art jab be col
343 cobby alert jam
344 my bolt jab acre
345 my raj lab be cot
346 cabby raj motel
347 calm jab be troy
348 my job be alt arc
349 cobby metal raj
350 my belt jab orca
351 my jar lab be cot
352 cobby metal jar
353 lay job bet marc
354 my a raj belt cob
355 corby table jam
356 jet a bomb clary
357 my lob be raj act
358 cot bramble jay
359 jet a lobby marc
360 my a jar belt cob
361 cel major tabby
362 my jot blab race
363 my lob be jar act
364 cyber job tamal
365 my jet orb cabal
366 my raj bat be col
367 cobalt jay berm
368 mat job be clary
369 a arm by jet bloc
370 crabby malt joe
371 my beta jar bloc
372 my jar bat be col
373 cobbler taj may
374 able tam job cry
375 a bat elm job cry
376 abject bar moly
377 my lob react jab
378 jot be by lam car
379 combat jarl bye
380 my bel jar cabot
381 my lob be raj cat
382 comet jarl baby
383 my bola jet crab
384 my a jet bra bloc
385 object bal army
386 my jab alter cob
387 my lob be jar cat
388 corby jab metal
389 calm bet rob jay
390 cry be lob jam at
391 object blam ray
392 my abbe jar colt
393 col be by jam rat
394 cream taj lobby
395 calm bey job art
396 my rat jab be col
397 colby jab mater
398 my jot barb lace
399 by cab elm to raj
400 cobby ajar melt
401 jot my able crab
402 a mob lab jet cry
403 clobber taj may
404 lacy job met bar
405 by jar elm to cab
406 cyber bolt maja
407 calm jab be tory
408 my reb job a talc
409 cobby alter jam
410 my jot blare cab
411 by job elm arc at
412 abject army bol
413 male tab job cry
414 roc belt by jam a
415 cyber bloat jam
416 by jab to marcel
417 my a jab belt roc
418 carb maybe jolt
419 my raja ebb colt
420 by jar bel to mac
421 corby belt maja
422 my babel jar cot
423 a jot balm be cry
424 colby jab tamer
425 jet boy calm bra
426 a bob lam jet cry
427 clay taj bomber
428 lacy tram be job
429 a lot jam ebb cry
430 cobby melt raja
431 calm ray jet bob
432 my reb job at lac
433 abject bra moly
434 calm bra bet joy
435 by jab a term col
436 object lamb yar
437 my later jab cob
438 my bel or jab act
439 cyber blot maja
440 tame lab job cry
441 my raj tab be col
442 comte jarl baby
443 my raj clot abbe
444 my jar tab be col
445 object bray mal
446 arty job be clam
447 a lamb by jet roc
448 cabby major tel
449 my jot bale crab
450 a job tab cry elm
451 cobble taj army
452 my lob jab crate
453 tom be by jar lac
454 corby bleat jam
455 my abbe jar clot
456 my jot be lab arc
457 object bly mara
458 lacy mart be job
459 by jar bel to cam
460 mercy jolt abba
461 jet may blob car
462 a ram by jet bloc
463 act jabber moly
464 able tom jab cry
465 my reb jolt a cab
466 coy bramble taj
467 racy bam job let
468 my bel or jab cat
469 come jarl tabby
470 my blot jab acre
471 my bet or jab lac
472 cat jabber moly
473 raj be to cymbal
474 mol be by act raj
475 lacy taj bomber
476 my raja ebb clot
477 by job rem talc a
478 carb jab motley
479 lacy arm bet job
480 mol be by jar act
481 crabby taj mole
482 jar be to cymbal
483 my a raj ebb colt
484 combat jarl bey
485 calm bey job rat
486 reb jot by calm a
487 cymbal bora jet
488 my bore jab talc
489 a orb by jet clam
490 cymbal taj bore
491 ace balm job try
492 my a jar ebb colt
493 cobbler taj yam
494 my jet blab orca
495 by jam bel to arc
496 crabby mae jolt
497 jet a rob cymbal
498 mol be by cat raj
499 cymbal taj robe
500 calm bat job rye

### jamestrafford:people

input: James Trafford
category: people
phrases 1 to 500 of 500

1 red major staff
2 fast jam for red
3 rest afford jam
4 me jars of draft
5 order jam staff
6 me drafts of raj
7 farts from jade
8 mad jets for far
9 jet afford arms
10 me jar of drafts
11 off jam traders
12 sad jet from far
13 off dreamt jars
14 mad jest for far
15 fjords frame at
16 mad rest off raj
17 fjords team far
18 sad jet for farm
19 formed fast raj
20 mad rest off jar
21 formed fast jar
22 smart raj of fed
23 off jam retards
24 off star jam red
25 jets afford arm
26 star jam for fed
27 jet afford mars
28 smart jar of fed
29 rafts from jade
30 fat jams for red
31 faster jam ford
32 red farts of jam
33 fed farts major
34 far jams for ted
35 feds fart major
36 fast raj for med
37 off jams retard
38 far jets for dam
39 fjords mate far
40 fast jar for med
41 fjord frames at
42 jet far from ads
43 off jams trader
44 off rats jam red
45 darts jam offer
46 off arts jam red
47 jest afford arm
48 fat raj for meds
49 fjords eat farm
50 fat jar for meds
51 feds raft major
52 deft a from jars
53 fjord teams far
54 red fart of jams
55 frosted far jam
56 off art jams red
57 same fart fjord
58 jet far for dams
59 soft framed raj
60 soft far jam red
61 jets afford ram
62 red fats for jam
63 jets from farad
64 most far jar fed
65 frat major feds
66 off arms jar ted
67 soft framed jar
68 far jest for dam
69 jade farm frost
70 off raj rest dam
71 stem afford raj
72 sad far jet form
73 fjord steam far
74 fat jam for reds
75 jade farts form
76 sad fret for jam
77 stem afford jar
78 sad term off raj
79 fjord fate arms
80 jet farm for ads
81 fjord seat farm
82 off rest jar dam
83 formed fat jars
84 sad term off jar
85 rafts major fed
86 red rafts of jam
87 same raft fjord
88 deft as from raj
89 east farm fjord
90 jet arms for fad
91 tea farm fjords
92 deft as from jar
93 jade fart forms
94 red raft of jams
95 fjords fate arm
96 red frat of jams
97 efforts dam raj
98 off rat jams red
99 jest afford ram
100 off rest jam rad
101 dam jar efforts
102 mad fret of jars
103 jest from farad
104 off tsar jam red
105 fjord eat farms
106 fat jars for med
107 fame star fjord
108 off raj star med
109 jet afford rams
110 off art jar meds
111 farted for jams
112 far jams do fret
113 jade raft forms
114 far jam do frets
115 off tarred jams
116 off star jar med
117 smart offed raj
118 far jets of dram
119 dart jam offers
120 off mars jar ted
121 dart jams offer
122 off arm jars ted
123 mad raj efforts
124 off art jam reds
125 jade farms fort
126 aft jams for red
127 starred jam off
128 mad frets of raj
129 smart offed jar
130 jet mars for fad
131 jets afford mar
132 mad frets of jar
133 dam jars effort
134 red mast off raj
135 mad jar efforts
136 off mast jar red
137 fjord feast arm
138 off raj mats red
139 ate farm fjords
140 off arms jet rad
141 fjord fate mars
142 mat raj for feds
143 rad jam efforts
144 off mats jar red
145 off jarred mast
146 off raj rat meds
147 jet affords arm
148 mat jar for feds
149 fjords tame far
150 off rat jar meds
151 fed fart majors
152 deft arms of raj
153 fjord frame sat
154 deft arms of jar
155 off jarred mats
156 off mat jars red
157 mare fast fjord
158 far jest of dram
159 toffs dream raj
160 mat jars for fed
161 eats farm fjord
162 jet farms of rad
163 raj doff master
164 off rat jam reds
165 dream jar toffs
166 off art jars med
167 mad jars effort
168 off raj term ads
169 safe tram fjord
170 jet arm for fads
171 effort dams raj
172 jet farm of rads
173 jar doff master
174 off raj rats med
175 dams jar effort
176 off term jar ads
177 tea farms fjord
178 off rats jar med
179 fasted from raj
180 off jars met rad
181 afar met fjords
182 aft raj for meds
183 jam doff arrest
184 off arts jar med
185 jade farm forts
186 off raj set dram
187 soft farmed raj
188 off tar jams red
189 fasted from jar
190 aft jar for meds
191 soft farmed jar
192 off set jar dram
193 fjords fate ram
194 off ram jars ted
195 fed raft majors
196 off tam jars red
197 jest afford mar
198 deft a forms raj
199 major eff darts
200 deft form jars a
201 toff dreams raj
202 deft forms jar a
203 form fasted raj
204 raj farm to feds
205 fjords fear mat
206 aft jam for reds
207 daft major serf
208 off jets arm rad
209 dreams jar toff
210 jar farm to feds
211 far meat fjords
212 off mars jet rad
213 form fasted jar
214 soft raj arm fed
215 fame rat fjords
216 soft far jar med
217 fjords tae farm
218 mad fet for jars
219 deft far majors
220 sad fet from raj
221 fame rats fjord
222 deft mars of raj
223 feds format raj
224 rest jam for fad
225 fjord smear fat
226 sad fet from jar
227 fjord fear mast
228 off rat jars med
229 feds format jar
230 deft mars of jar
231 rad jams effort
232 jars farm to fed
233 fjord fear mats
234 deft arm of jars
235 ate farms fjord
236 off raj met rads
237 mare fat fjords
238 deft as form raj
239 fjord feast ram
240 off jar met rads
241 dream jars toff
242 far arms jot fed
243 rads jam effort
244 deft form jar as
245 fjords fear tam
246 daft ems for raj
247 fed format jars
248 daft res for jam
249 jet affords ram
250 far farm jet dos
251 daft major refs
252 daft ems for jar
253 fjord fates arm
254 daft ers for jam
255 farad jets form
256 farm jars of ted
257 formed aft jars
258 off raj tar meds
259 feat arm fjords
260 off raj rams ted
261 far mates fjord
262 jet ram for fads
263 farad jet forms
264 raj farms to fed
265 staffer jam rod
266 off tar jar meds
267 frost fared jam
268 off rams jar ted
269 fad major frets
270 off jest arm rad
271 eta farm fjords
272 jar farms to fed
273 fads major fret
274 aft jars for med
275 fjords fate mar
276 off jet arm rads
277 mat safer fjord
278 off tsar jar med
279 after mas fjord
280 off mar jars ted
281 afters jam ford
282 jet rams for fad
283 raja doff terms
284 off tar jam reds
285 draft jams fore
286 raj farms of ted
287 drafts jam fore
288 off raj mat reds
289 fjord fears mat
290 daft rem of jars
291 feats arm fjord
292 farms jar of ted
293 fjord ream fast
294 off mat jar reds
295 fjord mares fat
296 mad raj eff sort
297 same frat fjord
298 off jets ram rad
299 teas farm fjord
300 mad jar eff sort
301 fjord tae farms
302 raj set from fad
303 farad jest form
304 soft raj ram fed
305 fjord fate rams
306 set jar from fad
307 ford after jams
308 off raj stem rad
309 raj doff stream
310 off stem jar rad
311 jar doff stream
312 deft ram of jars
313 farmers jot fad
314 far mars jot fed
315 fjord feast mar
316 raj fart of meds
317 jam offs retard
318 terms jar of fad
319 fjord fears tam
320 fart jar of meds
321 jet affords mar
322 red art offs jam
323 jam offs trader
324 jars met for fad
325 fame tar fjords
326 off tam jar reds
327 fjord fates ram
328 daft jars for me
329 jade frat forms
330 off ems dart raj
331 oft framed jars
332 off res jam dart
333 fjords fare mat
334 off tar jars med
335 fort fared jams
336 off ems jar dart
337 fjord reams fat
338 jet mar for fads
339 feat ram fjords
340 fart jam of reds
341 jade rafts form
342 fast ref jam rod
343 eta farms fjord
344 off ers jam dart
345 fjords ream fat
346 off jest ram rad
347 afar stem fjord
348 fjords met far a
349 majors fret fad
350 jets farm of rad
351 fjord fare mast
352 sad ref fort jam
353 rom staffed raj
354 off jet ram rads
355 far meats fjord
356 raj raft of meds
357 fjord fare mats
358 jets arm for fad
359 mesa fart fjord
360 me off raj darts
361 safe mart fjord
362 deft mas for raj
363 rom staffed jar
364 jet ras from fad
365 fated raj forms
366 raft jar of meds
367 feats ram fjord
368 deft mas for jar
369 fjords fare tam
370 far ref jam dots
371 fated jars form
372 raj farts of med
373 fated jar forms
374 off jet rams rad
375 formed fats raj
376 do jets farm far
377 fjord seam fart
378 raj met for fads
379 formed fats jar
380 farts jar of med
381 forts fared jam
382 deft rams of raj
383 fjord sate farm
384 off jams err tad
385 raj eff stardom
386 jar met for fads
387 fjord frame tas
388 frat jar of meds
389 jar eff stardom
390 raft jam of reds
391 seta farm fjord
392 red rat offs jam
393 ford frets maja
394 off jets mar rad
395 fords after jam
396 deft rams of jar
397 fjord fares mat
398 soft raj mar fed
399 mesa raft fjord
400 staff or red jam
401 tram offed jars
402 jet ars from fad
403 aft smear fjord
404 ford me fast raj
405 majors eff dart
406 deft mar of jars
407 raj offset dram
408 ford me fast jar
409 mare fats fjord
410 frat jam of reds
411 dram jar offset
412 me doff star raj
413 ajar deft forms
414 ems draft of raj
415 famed raj frost
416 res jam of draft
417 fjord fates mar
418 fart jars of med
419 fjord seam raft
420 deft ras for jam
421 mart offed jars
422 far jam dost ref
423 raj deform fats
424 far serf jam dot
425 defrost far jam
426 ems jar of draft
427 famed jar frost
428 most ref jar fad
429 jar deform fats
430 jest farm of rad
431 farmer jot fads
432 sad fet form raj
433 feat mar fjords
434 off rem jars tad
435 trams offed raj
436 fret jam for ads
437 trams offed jar
438 jest arm for fad
439 armed raj toffs
440 ref jam of darts
441 fjord seam frat
442 ers jam of draft
443 armed jar toffs
444 sad fet form jar
445 fjord fares tam
446 do jet farms far
447 jot fared farms
448 term jars of fad
449 famed jars fort
450 mad serf jot far
451 feat rams fjord
452 do jest farm far
453 feats mar fjord
454 fjord met far as
455 fjord fret masa
456 off jest mar rad
457 oft farmed jars
458 star jam eff rod
459 aft mares fjord
460 fat rom jar feds
461 afford jars met
462 raft jars of med
463 deft forms raja
464 off jet mar rads
465 jars doff mater
466 deft ars for jam
467 fords fret maja
468 far ref jams dot
469 safer tam fjord
470 jets ram for fad
471 armed jars toff
472 far refs jam dot
473 daft majors ref
474 raj fats for med
475 aft reams fjord
476 soft ref dam raj
477 fjord ream fats
478 raj stem for fad
479 deform fast raj
480 fat rom jars fed
481 aft ream fjords
482 fats jar for med
483 deform fast jar
484 me jars aft ford
485 jars doff tamer
486 soft ref jar dam
487 famed raj forts
488 stem jar for fad
489 fated from jars
490 mad refs jot far
491 famed jar forts
492 frat jars of med
493 mod staffer raj
494 fret jars of dam
495 ajar terms doff
496 raj term of fads
497 mod staffer jar
498 sad ref jot farm
499 toff jarred mas
500 fat ref jam rods

### michaelpaynter:people

input: Michael Paynter
category: people
phrases 1 to 500 of 500

1 hairy placement
2 their many place
3 the in place army
4 my in place her at
5 peachy terminal
6 her typical mean
7 my in place heart
8 my in parcel the a
9 preachy ailment
10 her typical name
11 my in earth place
12 i parcel my then a
13 machinery plate
14 the many replica
15 he train my place
16 he place my in art
17 archetypal mien
18 the carmine play
19 i plan my teacher
20 my pin clear the a
21 alchemy painter
22 my plain teacher
23 i reach my planet
24 my in let preach a
25 chimera penalty
26 my alien chapter
27 my then air place
28 my a pencil her at
29 enrich playmate
30 the maniac reply
31 my later cheap in
32 he trip my clean a
33 machinery leapt
34 her typical amen
35 it plane my reach
36 my a rip the clean
37 machinery petal
38 the creamy plain
39 my are thin place
40 he rat my in place
41 replicate mynah
42 her atypical men
43 the in parcel may
44 he parcel my in at
45 charlie payment
46 my plain cheater
47 the a pencil army
48 my a tin her place
49 cypher laminate
50 my cheap latrine
51 he clear my paint
52 my nip clear the a
53 alchemy repaint
54 thy marine place
55 my a pencil heart
56 i ran my cheap let
57 alchemy pertain
58 my cheap retinal
59 my are hint place
60 he clear my in pat
61 archetypal mine
62 my plainer teach
63 my in pal teacher
64 he clear my in tap
65 emphatic nearly
66 her typical mane
67 i center my alpha
68 my a tip her clean
69 empathic nearly
70 her minty palace
71 my a earth pencil
72 my in here pal act
73 archenemy plait
74 thy mean replica
75 my in plate reach
76 my a rip the lance
77 anyplace hermit
78 my heretical pan
79 i plan my cheater
80 he tar my in place
81 chimera aplenty
82 my plainer cheat
83 my in later peach
84 an a let my cipher
85 cheaply minaret
86 my heretical nap
87 my let pain reach
88 my a pit her clean
89 charley naptime
90 my plain hectare
91 help my certain a
92 my in here pal cat
93 my reliant peach
94 my hit near place
95 he pearl my in act
96 my retinal peach
97 it rhyme an place
98 me clip her any at
99 me plane charity
100 my at hear pencil
101 he pin my clear at
102 they man replica
103 the in calmer pay
104 my in here lap act
105 an pricey hamlet
106 it learn my peach
107 he pearl my in cat
108 an mythical peer
109 it near my chapel
110 he rip my clean at
111 my tracheal pine
112 my ten place hair
113 my in here lap cat
114 me chair penalty
115 i centre my alpha
116 me let an chirpy a
117 they plain cream
118 him clear an type
119 i trench my pale a
120 they pain marcel
121 my in lap teacher
122 he clear my apt in
123 my renal hepatic
124 it panel my reach
125 i place my nth are
126 they pan miracle
127 my let aah prince
128 my clear hit pen a
129 me panel charity
130 my in replace hat
131 the in a ply cream
132 they nap miracle
133 my in pearl teach
134 me parcel thy in a
135 my neater caliph
136 i map the larceny
137 hit per my clean a
138 thy alien camper
139 my a hail percent
140 my a tip her lance
141 thy alpine cream
142 my in cheap alert
143 my in a pelt reach
144 they parcel main
145 the pin clear may
146 the in a pry camel
147 i parent alchemy
148 cream play the in
149 my nit place her a
150 they clean prima
151 her at pencil may
152 i pal my ten reach
153 him reenact play
154 i lean my chapter
155 he nip my clear at
156 miracle pay then
157 the may rip clean
158 my a pit her lance
159 thy pale carmine
160 my in hate parcel
161 an a ply the crime
162 thy caramel pine
163 my in place hater
164 i pen my clear hat
165 thy carmine leap
166 i place my anther
167 me plant her icy a
168 they arm pelican
169 i heap my central
170 i hat per my clean
171 thy carmine plea
172 my a plan heretic
173 my hip ten clear a
174 an emphatic lyre
175 they pal an crime
176 my hep in clear at
177 an mythic repeal
178 my heart plan ice
179 my in a per chalet
180 they pal carmine
181 i replace thy man
182 i lap my ten reach
183 machine pray let
184 he pain my cartel
185 the limp rye can a
186 thy pineal cream
187 my hit earn place
188 my clean rep hit a
189 yeah plant crime
190 my tin hear place
191 i replace my nth a
192 him tape larceny
193 it earn my chapel
194 he act my paler in
195 thy maniac leper
196 my hint replace a
197 an pay let her mic
198 an empathic lyre
199 my at heal prince
200 i pan my real tech
201 thy anemic pearl
202 my are plate chin
203 my ten lip reach a
204 thine place army
205 my are hat pencil
206 me pin thy clear a
207 mine lay chapter
208 my are plate inch
209 i can per my lathe
210 canary help time
211 him place an trey
212 i nap my real tech
213 i rhyme placenta
214 they rim an place
215 i clear my ten hap
216 they pin caramel
217 he pan my article
218 me rip thy clean a
219 they pencil mara
220 my line preach at
221 he pin my rectal a
222 they nail camper
223 the in ply camera
224 me arc the any lip
225 thy pilar menace
226 my in pearl cheat
227 he cat my paler in
228 they reclaim pan
229 the in creamy pal
230 i pal my net reach
231 the army pelican
232 my in rate chapel
233 i pearl my het can
234 typical man here
235 my in tear chapel
236 i ran my het place
237 them ray pelican
238 my plan earth ice
239 my in a pat lecher
240 they reclaim nap
241 i replace an myth
242 my in a tap lecher
243 they lap carmine
244 them lay an price
245 my harp let an ice
246 thy paler cinema
247 he nap my article
248 i heal my pert can
249 my heart pelican
250 my in cereal path
251 i hat my clean rep
252 at reply machine
253 i learnt my peach
254 he prance my lit a
255 he triple cayman
256 my tip hear clean
257 my in here act alp
258 them pile canary
259 my plane eat rich
260 i hat per my lance
261 they lance prima
262 my in heal carpet
263 my hip net clear a
264 price the layman
265 her may tin place
266 he cap my ten liar
267 they mail prance
268 my in alert peach
269 it cap my real hen
270 they ram pelican
271 they lap an crime
272 my ten phi clear a
273 they parcel mina
274 him place an tyre
275 thy in rem place a
276 me layin chapter
277 he nail my carpet
278 he prance til my a
279 it replace mynah
280 my in heat parcel
281 i pat my clear hen
282 certain may help
283 it preach my lane
284 my clear hen tip a
285 my earth pelican
286 the nip clear may
287 my in here cat alp
288 may pencil heart
289 my hair net place
290 i tap my clear hen
291 tree my chaplain
292 i peach my rental
293 i lap my net reach
294 thine play cream
295 me rain thy place
296 an a tip my lecher
297 my hairnet place
298 my in pal cheater
299 my lit a pen reach
300 then reclaim pay
301 my pit hear clean
302 i crap an lee myth
303 they nip caramel
304 i plan my hectare
305 i perm thy clean a
306 heretic play man
307 my a lean pitcher
308 me nip thy clear a
309 remain thy place
310 marcel pay the in
311 my het in parcel a
312 pencil earth may
313 my at hale prince
314 i clean my hep art
315 me inlay chapter
316 the in creamy lap
317 he care my tan lip
318 he reclaim panty
319 it preach my lean
320 my clear hen pit a
321 them lean piracy
322 my let rain peach
323 he nip my rectal a
324 yeah ramp client
325 my then a replica
326 i hale my pert can
327 thrice mean play
328 her may tip clean
329 an a pit my lecher
330 i entrap alchemy
331 it place her myna
332 i try an cheap elm
333 he prey claimant
334 my hit rape clean
335 i try he man place
336 he mantle piracy
337 me clear thy pain
338 my pet lin reach a
339 it preach laymen
340 my in leapt reach
341 my net lip reach a
342 machine pale try
343 my a enter caliph
344 me cypher an lit a
345 thy carmine peal
346 my in reach petal
347 i net my clear hap
348 they mar pelican
349 the may rip lance
350 my halt a pen rice
351 imply an teacher
352 my a pearl ethnic
353 me cypher til an a
354 any price hamlet
355 the riley can amp
356 i pry an lee match
357 yeah plan metric
358 an may let cipher
359 i rat my hep clean
360 plenty aah crime
361 they cream an lip
362 i place my nth ear
363 my althea prince
364 he play an metric
365 he rail my ten cap
366 limp any teacher
367 me lay an pitcher
368 my hep in claret a
369 machine leap try
370 the any clear imp
371 it lean my hep car
372 me preach litany
373 my are hap client
374 i pen thy calmer a
375 mine pray chalet
376 in myth place are
377 he cap my ten lair
378 plea try machine
379 my pin clear hate
380 he cap my net liar
381 thrice name play
382 my then clear pia
383 my net phi clear a
384 they lain camper
385 my in preach tale
386 i reach my ten alp
387 me parlay ethnic
388 my tea plane rich
389 i clear my apt hen
390 learn my hepatic
391 her typical men a
392 i clear my hep tan
393 they pencil maar
394 he pity an marcel
395 i etch my real pan
396 yeah malt prince
397 my are pal ethnic
398 i clear my het pan
399 hair play cement
400 i mean thy parcel
401 i etch my real nap
402 pitcher mean lay
403 my real pin teach
404 i clear my het nap
405 merchant pay lie
406 my tie plan reach
407 i place my nth era
408 amply in teacher
409 thy a plane crime
410 he race my tan lip
411 charity man peel
412 they lam an price
413 he cap my ten lira
414 percent hail may
415 my are tin chapel
416 my hep tin clear a
417 he lament piracy
418 my in hale carpet
419 i clear my hep ant
420 thin replace may
421 my rip hate clean
422 i lance my hep art
423 inhale my carpet
424 her may pit clean
425 my in reel hat cap
426 any male pitcher
427 my a enrich plate
428 my het pin clear a
429 many late cipher
430 he pain my claret
431 my pet nil reach a
432 him repay lancet
433 i plane thy cream
434 my reel hit an cap
435 my hire placenta
436 my ear thin place
437 my het a rip clean
438 mythic plane are
439 he rely an impact
440 i rap my het clean
441 chimney pearl at
442 my in lap cheater
443 he ply an metric a
444 thy paler iceman
445 my in alter peach
446 my nth pie clear a
447 thine pay marcel
448 the pan lay crime
449 my pet hin clear a
450 pencil hate army
451 my a paint lecher
452 an a price thy elm
453 pen her calamity
454 i create an lymph
455 i play me trench a
456 retain my chapel
457 my hair pet clean
458 i match per an ley
459 cheaply ran time
460 he rat my pelican
461 i tar my hep clean
462 nicely map heart
463 i name thy parcel
464 i rat my hep lance
465 thine parcel may
466 price the lay man
467 i ran my elect hap
468 clear empathy in
469 thy a prime clean
470 my hep a let cairn
471 pitcher name lay
472 it hap my cleaner
473 he rail my net cap
474 malice pray then
475 the nap lay crime
476 an yap let her mic
477 a pelt machinery
478 he pan my recital
479 i match per an lye
480 heretic plan may
481 price the manly a
482 i carp an lee myth
483 reply the caiman
484 i arent my chapel
485 a per thy nice lam
486 they prance lima
487 my ate plane rich
488 i clear my nth ape
489 match repay line
490 he nap my recital
491 he cap my net lair
492 teach pay merlin
493 my in paler teach
494 i par my het clean
495 tiny help camera
496 my line pat reach
497 my a hit per lance
498 hair empty lance
499 my in heap cartel
500 i reach my net alp

### viratkohli:people

input: Virat Kohli
category: people
phrases 1 to 83 of 83

1 trivia kohl
2 rival hit ok
3 i irk hot lav
4 viral hit ok
5 i ok hilt var
6 var hit kilo
7 i hit kor lav
8 vial hit kor
9 i kit rho lav
10 rho kit vial
11 oh it irk lav
12 oval hit irk
13 hi ilk to var
14 kilt via rho
15 hi volt irk a
16 kith oil var
17 hi ok til var
18 kor via hilt
19 hi irk to lav
20 hot vial irk
21 i talk vor hi
22 kith or vial
23 vor i hat ilk
24 rival oh kit
25 i or kith lav
26 viral oh kit
27 hi or kit lav
28 valor hi kit
29 var hi lit ok
30 kir hot vial
31 hi ilk or vat
32 vital hi kor
33 i kir hot lav
34 hi irk volta
35 i hot ilk var
36 i rakhi volt
37 i hi volt ark
38 oval hit kir
39 a hit ilk vor
40 vail hit kor
41 i oh kilt var
42 arvo hit ilk
43 lav tho irk i
44 valor kith i
45 it oh ilk var
46 vail or kith
47 hi kir to lav
48 vial tho irk
49 it hi kor lav
50 hail kit vor
51 it kir oh lav
52 kira hi volt
53 kilt vor hi a
54 thro via ilk
55 var tho ilk i
56 vital oh irk
57 ilk vor hi at
58 raki hi volt
59 a hi kir volt
60 arvo hi kilt
61 var kohl it i
62 ahi irk volt
63 lakh vor it i
64 vital oh kir
65 i vor tha ilk
66 irk via holt
67 vat rho ilk i
68 vail rho kit
69 lav tho kir i
70 hot vail irk
71 vial tho kir
72 vita rho ilk
73 volta hi kir
74 ail kith vor
75 var hilt koi
76 lav rho tiki
77 vor ahi kilt
78 ahi kir volt
79 vail tho irk
80 vail hot kir
81 tilak hi vor
82 vail tho kir
83 via holt kir

### katseye:people

input: Katseye
category: people
phrases 1 to 29 of 29

1 take yes
2 a key set
3 east key
4 a tsk eye
5 key eats
6 a sky tee
7 eat keys
8 a eek sty
9 key teas
10 a eke sty
11 seat key
12 task eye
13 key seta
14 tea keys
15 ate keys
16 kat eyes
17 teak yes
18 eta keys
19 sate key
20 sake yet
21 sea tyke
22 yaks tee
23 yak tees
24 tae keys
25 stay eek
26 stay eke
27 kay tees
28 sake tye
29 sae tyke

### raonibarcelos:people

input: Raoni Barcelos
category: people
phrases 1 to 500 of 500

1 airborne coals
2 an close barrio
3 i bear an colors
4 i bar an cool res
5 labor scenario
6 an color rabies
7 i bears an color
8 i bar an cool ers
9 aerial broncos
10 are cool brains
11 i score an labor
12 i clear so born a
13 baron calories
14 born social are
15 i sober an carol
16 i crab so on real
17 laborer casino
18 an coarse broil
19 an are cool ribs
20 i crab so no real
21 balconies roar
22 also care robin
23 i close an arbor
24 i bar an loco res
25 barons calorie
26 cooler brains a
27 i bare an colors
28 i bar an loco ers
29 rabies coronal
30 i bears coronal
31 i color an saber
32 i con so barrel a
33 braise coronal
34 i blares corona
35 on care is labor
36 i blare so on car
37 labia coroners
38 i labor corneas
39 an car is bolero
40 i blare so no car
41 arriba console
42 reborn social a
43 i sober an coral
44 i crab so on earl
45 boars coraline
46 cooler brain as
47 an carol is bore
48 i crab as on role
49 car loose brain
50 i carol an robes
51 i crab so no earl
52 on arabic loser
53 i color an sabre
54 an sole a rib roc
55 i blares racoon
56 an core is labor
57 i crab as no role
58 so brain oracle
59 an carol is robe
60 i ran solo be car
61 coolers brain a
62 in are cool bars
63 i lose a arc born
64 are coins labor
65 an a ribs cooler
66 i corn so blare a
67 are color basin
68 an role is cobra
69 an a so crib role
70 ears cool brain
71 in colors bear a
72 i ran so bar cole
73 so able carrion
74 one car is labor
75 i crab so on lear
76 also race robin
77 on sailor be car
78 i crab so no lear
79 are cools brain
80 no sailor be car
81 i carol as on reb
82 are soil carbon
83 i carol an bores
84 i carol as no reb
85 car reason boil
86 cool are is barn
87 an a i rob closer
88 can lose barrio
89 cool a is barren
90 i crab as on lore
91 brain care solo
92 i clears an boor
93 i arc so nobler a
94 i saber coronal
95 on real is cobra
96 i enrol so crab a
97 also core brain
98 i coos an barrel
99 i crab as no lore
100 bore can sailor
101 real a is bronco
102 i ran so bear col
103 baron air close
104 born close air a
105 on a so real crib
106 sea color brain
107 an a boil crores
108 i ran so able roc
109 on serial cobra
110 an are cool bris
111 i err so on cabal
112 i labors cornea
113 an coral is bore
114 i corn sol bear a
115 sir labor ocean
116 i robes an coral
117 no a so real crib
118 also born erica
119 i core an labors
120 i con role bar as
121 on brace sailor
122 i cores an labor
123 i err so no cabal
124 no serial cobra
125 born are is coal
126 i arc so on blare
127 coroner bail as
128 on race is labor
129 i ran loos be car
130 sooner bail car
131 born a is oracle
132 an a or sole crib
133 oracle is baron
134 in a sober carol
135 i arc so no blare
136 so clean barrio
137 an are solo crib
138 i sole a arc born
139 no brace sailor
140 an oil sober car
141 a lie so born car
142 robe can sailor
143 an coral is robe
144 i ran ras be cool
145 on carol rabies
146 i carols an bore
147 i crane sol rob a
148 rabies carol no
149 i bore an corals
150 on is role crab a
151 i sabre coronal
152 on are boils car
153 no is role crab a
154 car noise labor
155 in a close arbor
156 i ran ars be cool
157 one crab sailor
158 no are boils car
159 an a so crib lore
160 sober racial no
161 i coo an barrels
162 i corn a bore las
163 a coin laborers
164 i scar an bolero
165 i ran solo be arc
166 on arabic roles
167 i sober an claro
168 so in role crab a
169 born calories a
170 an are rob coils
171 i corn a robe las
172 cronies labor a
173 an rose boil car
174 an a i orb closer
175 air lose carbon
176 i bores an coral
177 i ran a robes col
178 arse cool brain
179 i carols an robe
180 i ran so bare col
181 a coins laborer
182 i robe an corals
183 i snore col bar a
184 also nice arbor
185 in colors bare a
186 i corn sol bare a
187 bison carol are
188 on a cries labor
189 on is are lob car
190 robin coals are
191 an coo is barrel
192 i blare as on roc
193 cool bears rain
194 in cos labor are
195 no is are lob car
196 ear cool brains
197 bear an cool sir
198 i blare as no roc
199 barn raise cool
200 on a close briar
201 i ban so real roc
202 loose can briar
203 an cole is arbor
204 in a or sec labor
205 also rice baron
206 no a close briar
207 an a or sec broil
208 base rain color
209 in are cool bras
210 i so crab an role
211 born social ear
212 near cool is bar
213 i arc so born ale
214 case iron labor
215 born are is cola
216 i arc on bear sol
217 so bear clarion
218 cool are is bran
219 i ran as bore col
220 so corner labia
221 born a soil care
222 i ran a bores col
223 beans air color
224 bare carol is no
225 i arc no bear sol
226 bones carol air
227 on are boil cars
228 i arc so born lea
229 cool bear rains
230 bare as color in
231 i ran as robe col
232 saloon crib are
233 born a coils are
234 an a or lose crib
235 sober clarion a
236 one a carol ribs
237 i corn as rob ale
238 soon care libra
239 in a sober coral
240 i err a cool bans
241 are sail bronco
242 an car soil bore
243 so on a crib earl
244 born close aria
245 no are boil cars
246 i corn as rob lea
247 baron care soil
248 an a boils crore
249 on a as crib role
250 crab reason oil
251 bone sir carol a
252 so no a crib earl
253 coroners bail a
254 in a carol robes
255 no a as crib role
256 ain sober carol
257 is an bare color
258 able no or is car
259 so arabic loner
260 an car oil robes
261 i con lore bar as
262 brain race solo
263 an lore is cobra
264 i ran so bore lac
265 cornea is labor
266 an ear cool ribs
267 i nab so real roc
268 are coils baron
269 bone a is corral
270 on lie as rob car
271 are oils carbon
272 clear a is boron
273 i con res labor a
274 are color sabin
275 reborn a is coal
276 an role or is cab
277 icons labor are
278 an are broil cos
279 i corn a bore als
280 once roars bail
281 an as rob recoil
282 i crane sol orb a
283 on scale barrio
284 an a boil scorer
285 a color ras be in
286 era cool brains
287 on crores bail a
288 i con ers labor a
289 on coral rabies
290 an car soil robe
291 i ran so robe lac
292 also iron brace
293 no crores bail a
294 in a or sole crab
295 barrio scale no
296 an sore boil car
297 i arc on bore las
298 no coral rabies
299 on are oil crabs
300 i ban so rare col
301 son labor erica
302 an claro is bore
303 born a i lose car
304 a console briar
305 i robes an claro
306 so on lire crab a
307 soon brace liar
308 no are oil crabs
309 i arc no bore las
310 brain coal rose
311 on as rice labor
312 i corn a robe als
313 brains care loo
314 in are solo crab
315 so no lire crab a
316 on racial robes
317 born as oil care
318 i err a coal snob
319 close ain arbor
320 on roar is cable
321 i ran a lobes roc
322 are coin labors
323 on a scar boiler
324 i arc on robe las
325 born social era
326 an car lose biro
327 a or i close barn
328 on soar caliber
329 in as carol bore
330 i arc no robe las
331 robin carol sea
332 on sir bear coal
333 i sear on bar col
334 closer ain boar
335 on earl is cobra
336 a color ars be in
337 bacon air loser
338 no a scar boiler
339 on is lore crab a
340 boar rain close
341 in a carol bores
342 on lace sir rob a
343 caliber soar no
344 boo clear an sir
345 i roars an col be
346 rabies ran cool
347 an car oil bores
348 i sear no bar col
349 ares cool brain
350 an claro is robe
351 i ran ors be coal
352 son barrel ciao
353 on are soil crab
354 no is lore crab a
355 so racial boner
356 solo in bear car
357 no lace sir rob a
358 on labors erica
359 no sir bear coal
360 noble a or is car
361 coroner bails a
362 no earl is cobra
363 i arc on able ors
364 in crab aerosol
365 an cars oil bore
366 i arc on bare sol
367 bare ain colors
368 an sir bore cola
369 on sir or cable a
370 once air labors
371 born a oil cares
372 i arc no able ors
373 alone sir cobra
374 solar a crib one
375 i arc no bare sol
376 arabic loser no
377 an as boil crore
378 i rear so ban col
379 so cranial bore
380 bare an cool sir
381 i ran sea rob col
382 social ran bore
383 an era cool ribs
384 an a or ribs cole
385 rain lose cobra
386 so rice an labor
387 so err a can boil
388 no labors erica
389 on are coal ribs
390 no sir or cable a
391 so lance barrio
392 born a oil scare
393 so in lore crab a
394 on caliber oars
395 an loo brace sir
396 in roc or able as
397 base carol iron
398 no are coal ribs
399 a or i can robles
400 boiler can soar
401 in as carol robe
402 i nab so rare col
403 sera cool brain
404 on rose bail car
405 a or i scale born
406 labor canoe sir
407 on oil care bars
408 on cos i barrel a
409 robins coal are
410 on soil bear car
411 i ran so bale roc
412 sonic are labor
413 born a recoil as
414 no cos i barrel a
415 as coin laborer
416 on a ribs oracle
417 i solo ern crab a
418 born solace air
419 an arc is bolero
420 i ran loos be arc
421 barons care oil
422 no rose bail car
423 i arc sol borne a
424 barrio can sole
425 no oil care bars
426 so lie a arc born
427 nice solar boar
428 no a ribs oracle
429 ors carol in be a
430 oar close brain
431 an oil core bars
432 an sol care i rob
433 on braise carol
434 i bores an claro
435 i ran as loco reb
436 so linear cobra
437 an cars oil robe
438 so on a crib lear
439 so cranial robe
440 an sir robe cola
441 in a or sober lac
442 social ran robe
443 born as coil are
444 able corn or is a
445 boo clears rain
446 on are scar boil
447 i rear a cons lob
448 on racial bores
449 bare coral is no
450 on loser i crab a
451 no braise carol
452 in car lose boar
453 so no a crib lear
454 are boil acorns
455 iron a be carols
456 i corn as orb ale
457 coral air bones
458 iron a be corals
459 i so crab an lore
460 baron cares oil
461 on a rice labors
462 no or i care labs
463 boiler can oars
464 an are boils roc
465 i rear so nab col
466 saber rain cool
467 no are scar boil
468 no loser i crab a
469 a clones barrio
470 coral a is boner
471 i corn as orb lea
472 scion labor are
473 one a ribs coral
474 i ran ors be cola
475 baron scare oil
476 an are coils orb
477 a lie as rob corn
478 social roar ben
479 an liar bore cos
480 on a or sec libra
481 on broil caesar
482 on oil bears car
483 no a or sec libra
484 roar lose cabin
485 coral sir bone a
486 so on a rile crab
487 a clone barrios
488 reborn a is cola
489 i arc on bore als
490 bean air colors
491 in a robes coral
492 as on car lie orb
493 braise an color
494 on a score libra
495 so no a rile crab
496 as recoil baron
497 cool a rise barn
498 i arc no bore als
499 bars can oriole
500 born a soil race
