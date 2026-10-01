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

## File 32 of 32: 1500 phrases

### lanadelrey:people

input: Lana Del Rey
category: people
phrases 1 to 500 of 500

1 learned lay
2 an elderly a
3 red yell an a
4 all yearend
5 an early led
6 all a end rye
7 earned ally
8 an dear yell
9 led rely an a
10 elderly ana
11 an red alley
12 del rely an a
13 laden layer
14 an early del
15 all a dye ern
16 lee lanyard
17 an lay elder
18 red yen all a
19 nearly deal
20 an ready ell
21 ane ell dry a
22 renal delay
23 really end a
24 a any red ell
25 laden relay
26 an leery lad
27 dry nee all a
28 laden leary
29 all deny are
30 end ell ray a
31 nearly lead
32 all end year
33 dye ell ran a
34 all yearned
35 all ray need
36 an a lyre led
37 delay learn
38 need rally a
39 an a rye dell
40 anally deer
41 all any deer
42 an a lyre del
43 anally reed
44 all any reed
45 an a ell dyer
46 early laden
47 an leery dal
48 led ley ran a
49 adrenal ley
50 are ally end
51 led lye ran a
52 adrenal lye
53 dear all yen
54 all a rye den
55 dearly lean
56 any real led
57 den ell ray a
58 dean really
59 nelly dear a
60 del ley ran a
61 lady leaner
62 nelly read a
63 led ern lay a
64 neared ally
65 read an yell
66 del lye ran a
67 nada yeller
68 yall end are
69 del ern lay a
70 ladle yearn
71 rely an deal
72 a rya end ell
73 lanyard eel
74 lay lend are
75 rad a yen ell
76 dale nearly
77 any real del
78 der yell an a
79 yall neared
80 nelly dare a
81 red ell nay a
82 dearly lane
83 are yell dna
84 ell rye and a
85 earned yall
86 all deny ear
87 any a der ell
88 dearly elan
89 dare an yell
90 der yen all a
91 anally dere
92 a lend layer
93 all a dey ern
94 ender allay
95 all near dye
96 dey ell ran a
97 an year dell
98 ell nae dry a
99 all eye rand
100 day a ern ell
101 reel an lady
102 led yen lar a
103 yell and are
104 dna a rye ell
105 a lend relay
106 del yen lar a
107 all need rya
108 lad a ley ern
109 neer all day
110 den ell rya a
111 all deny era
112 end ell yar a
113 lady ran lee
114 lad a lye ern
115 a lend leary
116 end ley lar a
117 lender lay a
118 end lye lar a
119 are ally den
120 dal a ley ern
121 any are dell
122 dal a lye ern
123 an layer led
124 den ell yar a
125 all year den
126 den ley lar a
127 all earn dye
128 den lye lar a
129 yelled a ran
130 dan a rye ell
131 dear any ell
132 der ell nay a
133 ley land are
134 land ray lee
135 earl lay end
136 lye land are
137 rely an dale
138 deal an lyre
139 an relay led
140 yea all nerd
141 ally an deer
142 ally an reed
143 nay all deer
144 nay all reed
145 lay real den
146 led near lay
147 yeller and a
148 an layer del
149 leer an lady
150 an leary led
151 day near ell
152 nee all yard
153 ear ally end
154 lead an lyre
155 red lean lay
156 real yen lad
157 dell yearn a
158 an relay del
159 any reel lad
160 a rend alley
161 del near lay
162 nay real led
163 lend early a
164 lady ran eel
165 leery a land
166 led earn lay
167 era ally end
168 an leary del
169 lane ray led
170 darn lay lee
171 day earn ell
172 yall end ear
173 lay lend ear
174 lear lay end
175 laden a rely
176 red yell ana
177 led lean ray
178 any earl led
179 nay real del
180 ear yell dna
181 land ray eel
182 read all yen
183 deal ran ley
184 del earn lay
185 an lyre dale
186 lane ray del
187 all rye dean
188 yall end era
189 deal ran lye
190 lay lend era
191 all rend yea
192 earl lay den
193 rand lay lee
194 end real lay
195 dry anal lee
196 yell and ear
197 ell and year
198 del lean ray
199 dna lay reel
200 darn all eye
201 any earl del
202 any leer lad
203 real yen dal
204 era yell dna
205 red lane lay
206 all eyre dna
207 dare all yen
208 any reel dal
209 ray lend ale
210 earl yen lad
211 ley and real
212 deal lay ern
213 ray lend lea
214 ladle an rye
215 led rely ana
216 reel and lay
217 ear ally den
218 yell and era
219 lye and real
220 any ear dell
221 end yell ara
222 end rely ala
223 dry lean ale
224 dean ray ell
225 yea ran dell
226 dry lean lea
227 ley land ear
228 ale rely dna
229 any lear led
230 lad yarn lee
231 lea rely dna
232 ale lay nerd
233 darn lay eel
234 lye land ear
235 ell read nay
236 neer dally a
237 rye land ale
238 lea lay nerd
239 all ane dyer
240 rye land lea
241 lee land rya
242 laden a lyre
243 era ally den
244 del rely ana
245 any era dell
246 lad near ley
247 an ell deary
248 lad near lye
249 lear lay den
250 ley land era
251 red ane ally
252 dale ran ley
253 dna lay leer
254 lad lean rye
255 any lear del
256 lye land era
257 dale ran lye
258 ell dare nay
259 any leer dal
260 elan ray led
261 an ley alder
262 read any ell
263 rand lay eel
264 lee nary lad
265 lear yen lad
266 an lye alder
267 dry anal eel
268 nay lee lard
269 leer and lay
270 earl yen dal
271 real ley dna
272 neer lay lad
273 nay reel lad
274 anal red ley
275 lad earn ley
276 ale yarn led
277 real lye dna
278 lea yarn led
279 anal red lye
280 lad earn lye
281 dale lay ern
282 ley and earl
283 elan ray del
284 dry lane ale
285 dare any ell
286 ell darn yea
287 lye and earl
288 dal yarn lee
289 dry lane lea
290 ala end lyre
291 lard any lee
292 ale yarn del
293 den yell ara
294 dal near ley
295 lad yarn eel
296 led lean rya
297 ale yen lard
298 lea yarn del
299 red elan lay
300 den rely ala
301 nee lay lard
302 lea yen lard
303 dal near lye
304 lay rend ale
305 dear nay ell
306 eel land rya
307 aye all nerd
308 lay rend lea
309 dal lean rye
310 lyre and ale
311 lyre and lea
312 ala lend rye
313 ley darn ale
314 lee nary dal
315 nay leer lad
316 lear yen dal
317 ley darn lea
318 del lean rya
319 lye darn ale
320 neer lay dal
321 nay reel dal
322 dell yen ara
323 dal earn ley
324 lye darn lea
325 ara deny ell
326 rya lend ale
327 ley and lear
328 dal earn lye
329 eel lard nay
330 rad lean ley
331 rya lend lea
332 lye and lear
333 rad lean lye
334 anal rye led
335 ara lend ley
336 dal yarn eel
337 ara lend lye
338 yar all need
339 lard any eel
340 anal rye del
341 ane lad rely
342 nerd alley a
343 ane ray dell
344 red ell yana
345 nay leer dal
346 nary ale led
347 dry elan ale
348 lead lay ern
349 nary lea led
350 dry elan lea
351 ale and rely
352 lea and rely
353 eyed all ran
354 nee ally rad
355 nary ale del
356 nary eel lad
357 ane ell yard
358 nary lea del
359 dna a yeller
360 ane yell rad
361 dan all eyre
362 ane dal rely
363 ran ley lead
364 dee an rally
365 ran lye lead
366 ane lyre lad
367 an alley der
368 ala rend ley
369 and all eyre
370 dee all yarn
371 dell are nay
372 an deer yall
373 an reed yall
374 ala rend lye
375 all rend aye
376 nary eel dal
377 dna year ell
378 aye ran dell
379 den really a
380 lander a ley
381 dan real ley
382 dere an ally
383 dere all nay
384 ane lyre dal
385 dan lay reel
386 lander a lye
387 dan real lye
388 ane rya dell
389 der lay lane
390 nae all dyer
391 led earl nay
392 der lean lay
393 ender ally a
394 led nearly a
395 lad lane rye
396 del earl nay
397 ere and ally
398 dan lay leer
399 del nearly a
400 dna earl ley
401 dell ear nay
402 dee ran ally
403 lard ane ley
404 dna earl lye
405 lady ale ern
406 all near dey
407 lard ane lye
408 lady lea ern
409 led lear nay
410 led lyre ana
411 dan are yell
412 dell era nay
413 lar nee lady
414 led lane rya
415 red ley alan
416 dry alan lee
417 dna ale lyre
418 red lye alan
419 dal lane rye
420 dna lea lyre
421 ree and ally
422 dell rye ana
423 del lear nay
424 need lar lay
425 all earn dey
426 del lyre ana
427 der lay elan
428 del lane rya
429 rand yea ell
430 dna lear ley
431 land lay ere
432 darn aye ell
433 dna lear lye
434 rad lane ley
435 rad lane lye
436 der yell ana
437 dan a yeller
438 der ane ally
439 lad elan rye
440 land lar eye
441 nada rye ell
442 dyer ell ana
443 dean rya ell
444 rand ale ley
445 yall ane red
446 rand aye ell
447 rand lea ley
448 der anal ley
449 nae rely lad
450 rand ale lye
451 rand lea lye
452 der anal lye
453 dry alan eel
454 den lyre ala
455 yall ran dee
456 land yar lee
457 land lay ree
458 deal lar yen
459 nerd ley ala
460 dna ally ere
461 nerd lye ala
462 red nae ally
463 led elan rya
464 dal elan rye
465 yall ender a
466 dan ear yell
467 dan year ell
468 all nary dee
469 red ley nala
470 yar ane dell
471 del elan rya
472 dry nala lee
473 nae rely dal
474 red lye nala
475 lad ray lene
476 rad elan ley
477 dan era yell
478 rad elan lye
479 den are yall
480 led lean yar
481 dna ally ree
482 yall nee rad
483 dell nae ray
484 land yar eel
485 dale lar yen
486 dere any all
487 dally an ere
488 dan ale rely
489 dan lea rely
490 del lean yar
491 dye lean lar
492 rad lay lene
493 yard nae ell
494 lead lar yen
495 rad nae yell
496 dal ray lene
497 dry nala eel
498 dean yar ell
499 yall ere dna
500 dan earl ley

### natashacornett:people

input: Natasha Cornett
category: people
phrases 1 to 500 of 500

1 trance thanatos
2 that none carats
3 a to that scanner
4 an at to the narcs
5 recant thanatos
6 the constant ara
7 threats to an can
8 an on a stretch at
9 canter thanatos
10 that roast nance
11 the a cannot rats
12 at to an then cars
13 nectar thanatos
14 the torn canasta
15 the a cannot arts
16 an no a stretch at
17 contestant hara
18 that sane carton
19 the as cannot art
20 an a crest that no
21 nanotech strata
22 that neat acorns
23 that no trance as
24 the tart a can son
25 attach resonant
26 that arcane tons
27 the no transact a
28 a to an then carts
29 that anon traces
30 that son trance a
31 at to an then scar
32 that sane cantor
33 the a start canon
34 the on sat can art
35 that tan corneas
36 she attract an no
37 the no sat can art
38 that sane contra
39 an no start teach
40 an at carts the no
41 that roan stance
42 the as cannot rat
43 an as trot the can
44 that anon crates
45 that no canst are
46 a to an sent chart
47 that arcane snot
48 that son crane at
49 an at ran the cost
50 an torn attaches
51 that no care ants
52 the on sat rat can
53 thats cannot are
54 that no cranes at
55 the no sat rat can
56 that sear canton
57 the a cannot tsar
58 at to an ten crash
59 that roan ascent
60 he attracts an no
61 a to an ten charts
62 that ane cartons
63 he contrast an at
64 an then a cost art
65 that anon caster
66 that on scant are
67 the torn a scan at
68 that ears cannot
69 that no scant are
70 an at star the con
71 that nascent oar
72 that no recant as
73 a to an tenth cars
74 that nascent ora
75 cannot the star a
76 the on a canst art
77 constant earth a
78 an at chatter son
79 an tort can the as
80 a cannot threats
81 an no start cheat
82 an a cart the tons
83 that ane contras
84 at to an snatcher
85 an on a test chart
86 that arse cannot
87 that son recant a
88 the no a canst art
89 constant hear at
90 state to an ranch
91 the torn a cans at
92 those tart canna
93 that no canter as
94 an sent a torch at
95 that saner canto
96 nan to that cares
97 an no a test chart
98 at cannot hearts
99 nan to that scare
100 an then a rat cost
101 as cannot threat
102 that a carts none
103 a to an ten starch
104 he cannot strata
105 that a sort nance
106 as to an ten chart
107 escort that anna
108 he attract an son
109 an no rat that sec
110 that anna sector
111 then to an carats
112 the on sat tar can
113 that ares cannot
114 anna to the carts
115 the on a scant art
116 that sera cannot
117 that at scar none
118 the no sat tar can
119 she cannot tatar
120 that tons crane a
121 the no a scant art
122 constant heart a
123 her at cannot sat
124 the on a canst rat
125 star cannot hate
126 that son canter a
127 an a rant the cost
128 thats canton are
129 that no race ants
130 the no a canst rat
131 sat cannot heart
132 the as cannot tar
133 an on at set chart
134 an hate contrast
135 that no crane sat
136 at to an net crash
137 thats cannot ear
138 that a cannot res
139 a to an net charts
140 contrast the ana
141 taste to an ranch
142 the on a tan carts
143 that tears canon
144 that on tan cares
145 at to an then arcs
146 sat cannot earth
147 an a start techno
148 an no at set chart
149 that eras cannot
150 that a cannot ers
151 the no a tan carts
152 chatters to anna
153 an at chatters no
154 an on at rat chest
155 star cannot heat
156 not crane that as
157 a to an tenth scar
158 corset that anna
159 that on tan scare
160 an no at rat chest
161 scant another at
162 her constant a at
163 the on a carts ant
164 that ears canton
165 that nan cost are
166 an at rats the con
167 at cannot haters
168 that no rant case
169 the no a carts ant
170 thats cannot era
171 an a scent throat
172 tan a to the narcs
173 rats cannot hate
174 that a escort nan
175 the on a scant rat
176 arts cannot hate
177 not ran that case
178 she act an torn at
179 an throat stance
180 that tan one cars
181 art to an ten cash
182 as cannot hatter
183 that no ran caste
184 an at con the arts
185 trash cannot tea
186 that son care ant
187 an a cart the snot
188 an heat contrast
189 that no cares ant
190 the scant a rat no
191 art cannot hates
192 not cranes that a
193 the tan a ran cost
194 hat cannot tears
195 that no scare ant
196 the on tas can art
197 that stare canon
198 the at star canon
199 an a cost the tarn
200 chatter to annas
201 an a chatter tons
202 the no tas can art
203 not ran attaches
204 star to the canna
205 an a carts the ton
206 that senna actor
207 that no tans care
208 the tan a scorn at
209 at chant senator
210 those at rant can
211 she cat an torn at
212 a canton threats
213 nan to that races
214 an at ran the scot
215 at cannot earths
216 an sat chatter no
217 he canst to an art
218 store that canna
219 the a rats canton
220 an ten at torch as
221 that nan coaster
222 nan to that acres
223 the tart a can nos
224 on transact hate
225 an no attach rest
226 rat to an ten cash
227 that tao scanner
228 the a canton arts
229 an hot a cart sent
230 no transact hate
231 north a state can
232 an then a tar cost
233 constant hare at
234 that snot crane a
235 a to an net starch
236 rants that ocean
237 an art coast then
238 that on a cant res
239 tenant has actor
240 not chatter an as
241 as to an net chart
242 that arse canton
243 an at costar then
244 the on tas rat can
245 that rate canons
246 the ant roast can
247 that no a cant res
248 that tear canons
249 that on as trance
250 an no tar that sec
251 constant are hat
252 that a star nonce
253 the no tas rat can
254 so attach tanner
255 the at cannot ras
256 that on a cant ers
257 trash cannot ate
258 the on a transact
259 an at tan her cost
260 canon hate start
261 an ana to stretch
262 that no a cant ers
263 that rates canon
264 that at ran cones
265 an shot at net car
266 an throat ascent
267 rate to an snatch
268 an a cost that ern
269 ash cannot treat
270 tear to an snatch
271 the on a canst tar
272 rat cannot hates
273 the anna cost art
274 he scant to an art
275 rats cannot heat
276 the as canton art
277 the tan a corns at
278 arts cannot heat
279 that nan score at
280 the no a canst tar
281 at canton hearts
282 that on tan races
283 an at rant the cos
284 hat cannot stare
285 shatter to an can
286 an rot canst the a
287 treat has canton
288 that ton crane as
289 an ten at host car
290 anna cost threat
291 tears to an chant
292 an at con the tsar
293 as canton threat
294 those at can tarn
295 he canst to an rat
296 tsar cannot hate
297 north a taste can
298 an at cost her ant
299 he canton strata
300 the a tan cartons
301 an at ran the cots
302 consent that ara
303 that on tan acres
304 an on at hat crest
305 at chant treason
306 an at trance shot
307 an no at hat crest
308 content aah star
309 that on as nectar
310 he tan to an carts
311 hart cannot seat
312 that ton ran case
313 an hot a scent art
314 not chase tartan
315 an a toast trench
316 an hot a star cent
317 rant that oceans
318 her a cannot tats
319 an on at tar chest
320 a contrast thane
321 that no tan acres
322 an hot a tent cars
323 threats to canna
324 start an on teach
325 a to an nett crash
326 that ants cornea
327 that no canes art
328 her tan at act son
329 escort that naan
330 that no as nectar
331 at trench to an as
332 on transact heat
333 that tan one scar
334 an no at tar chest
335 canton shatter a
336 an a contest hart
337 the on a scant tar
338 art cannot haste
339 the at cannot ars
340 art to an net cash
341 hat cannot rates
342 the at sort canna
343 an then a tot cars
344 no transact heat
345 ratan to the scan
346 a test to an ranch
347 torch state anna
348 an at ratchet son
349 an a tat the scorn
350 those anna tract
351 that no races ant
352 a to her scant tan
353 so attract henna
354 that on are canst
355 the scant a tar no
356 hats cannot rate
357 that ton cranes a
358 he carts to an ant
359 hats cannot tear
360 an then rat coast
361 an rot scant the a
362 not chatters ana
363 that on ants care
364 he scant to an rat
365 not chase rattan
366 that on at cranes
367 her tan at cat son
368 not chase tantra
369 the at rats canon
370 an hot a rat cents
371 contents aah art
372 that at ran scone
373 the on a tat narcs
374 ten aah contrast
375 an a chatter snot
376 the no a tat narcs
377 that ares canton
378 that a snort cane
379 a rest to an chant
380 enact that arson
381 that ant scar one
382 an then a rat scot
383 canon heat start
384 that none at cars
385 a to her scant ant
386 that naan sector
387 rats to the canna
388 an hot a rat scent
389 that oat scanner
390 nan to the carats
391 an net at torch as
392 tat cannot share
393 the anna rat cost
394 an at ran to chest
395 one transact hat
396 that son race ant
397 an tor canst the a
398 roach tenants at
399 arts to the canna
400 an hot a carts ten
401 that tarn oceans
402 her tat cannot as
403 an ten a cost hart
404 not attach snare
405 the as rat canton
406 an on at rat techs
407 that sera canton
408 ratan to the cans
409 a tent to an crash
410 enact that sonar
411 those at ran cant
412 a to an nth traces
413 torch taste anna
414 that no tans race
415 an no at rat techs
416 that ant corneas
417 that a scar tonne
418 rat to an net cash
419 she canton tatar
420 stare to an chant
421 tar to an ten cash
422 an toaster chant
423 rate to an chants
424 an ten a torch sat
425 rotate an snatch
426 tear to an chants
427 ran to the scant a
428 tsar cannot heat
429 those art can ant
430 at rent to an cash
431 the strata canon
432 not chatters an a
433 at set to an ranch
434 that neon carats
435 the a canton tsar
436 an a rant the scot
437 rat cannot haste
438 an then at actors
439 the on tas tar can
440 tas cannot heart
441 an as chatter ton
442 an a tat the corns
443 canton hate star
444 that no rat canes
445 the no tas tar can
446 thats rate canon
447 that a corset nan
448 a to an tenth arcs
449 thats tear canon
450 an other scant at
451 an hot a nest cart
452 tartan teach son
453 he start an canto
454 an hot a tent scar
455 that ante acorns
456 hats to an trance
457 an a tots the narc
458 canon shatter at
459 an tarts teach no
460 at to an nth cares
461 canoe that rants
462 that no canst ear
463 an hot a rats cent
464 tanner hat coast
465 that a censor ant
466 at to an nth scare
467 content aah rats
468 that a rats nonce
469 an sat tot her can
470 contents aah rat
471 an art coats then
472 an on at crash tet
473 art cannot heats
474 an rants to teach
475 an on a charts tet
476 that aster canon
477 thats react an no
478 an tor scant the a
479 astern attach no
480 that at arcs none
481 an then a tot scar
482 at trench sonata
483 the as tan carton
484 an no at crash tet
485 trash cannot eta
486 that on as recant
487 an ten a trot cash
488 tar cannot hates
489 the at rat canons
490 an no a charts tet
491 content aah arts
492 the on tan carats
493 an then a rat cots
494 attest an anchor
495 canon rest that a
496 an net at host car
497 attach an nestor
498 that nos trance a
499 he canst to an tar
500 ratchet to annas

### bankofcanadabuilding:places

input: Bank of Canada Building
category: places
phrases 1 to 500 of 500

1 laidback abandon fungi
2 an bound laidback fagin
3 an laid baba don fucking
4 laidback bonding fauna
5 an inbound laidback fag
6 i found an laidback bang
7 blocking bandaid fauna
8 laidback nina found bag
9 an laidback in found bag
10 financial god dunk baba
11 an laidback in found gab
12 financial dad gun kabob
13 i bound an laidback fang
14 an fab laidback undoing
15 fucking dial don an baba
16 laidback founding ban a
17 an laidback info gun bad
18 clanking found aid baba
19 dada of an clinking babu
20 an oaf buckling bandaid
21 an ok baba including fad
22 laidback a bounding fan
23 an laid baba nod fucking
24 bad banana fouling dick
25 an fab oak including bad
26 financial dog dunk baba
27 an laidback a bond fungi
28 fab a unlocking bandaid
29 an ain dad flocking babu
30 laidback founding nab a
31 an laidback gun find boa
32 found aba kid balancing
33 an akin baba of cuddling
34 bouncing bank fail dada
35 guan of an laidback bind
36 laidback ban gain found
37 an glib aid abandon fuck
38 laidback no baa funding
39 an in dada flocking babu
40 financial kabob add gun
41 an laidback no bud fagin
42 financial bad bunk dago
43 an akin dada of clubbing
44 bad koala bud financing
45 an on dada flicking babu
46 financial bad bunk goad
47 an bad flak aid bouncing
48 laidback in abound fang
49 an no dada flicking babu
50 dun fandango alibi back
51 i gonna bad laidback fun
52 financial dago bank bud
53 an bad faun aid blocking
54 financial goad bank bud
55 an ain fado buckling bad
56 laidback bound fan gain
57 an fain baba do duckling
58 laidback found nab gain
59 an fab oka including bad
60 an laidback funding boa
61 an laidback goa find bun
62 financial bug bank dado
63 an fab aid unlocking bad
64 fab king build anaconda
65 an bouncing flak did baa
66 fungal bandaid ok cabin
67 an laidback fungi do ban
68 laidback nina found gab
69 an ain add flocking babu
70 bad banana flicking duo
71 an bad dak fail bouncing
72 laidback ani found bang
73 an laidback fagin do bun
74 laidback band fag union
75 laidback bingo fund an a
76 financial dak bound bag
77 an laidback fund go bani
78 laidback fang don nubia
79 an dun balboa kid facing
80 laidback faun gonna bid
81 an laidback fun dog bani
82 laidback gib found anna
83 an diagonal fan bid buck
84 bad banana flocking dui
85 dad of i buckling banana
86 financial dada bug knob
87 dung of an laidback bani
88 financial bag dado bunk
89 an laidback guan don fib
90 financial gunk bob dada
91 an fain bud cloaking bad
92 fain dad unlocking baba
93 an laidback faun go bind
94 laidback bound fag nina
95 an bouncing flak did aba
96 bad bind cloaking fauna
97 an bad info baa duckling
98 bad koala dub financing
99 an laidback goa bind fun
100 laidback anna bound fig
101 ago find an laidback bun
102 laidback faun doing ban
103 an bad folk baa inducing
104 laidback guano find ban
105 laidback bound fag an in
106 laidback union bang fad
107 an laidback info bug dna
108 laidback bingo fund ana
109 big don an laidback faun
110 laidback big found anna
111 an laidback no dab fungi
112 financial dago bank dub
113 an financial dak bob dug
114 financial bog bunk dada
115 an laidback fun gain bod
116 financial gob bunk dada
117 an laidback nina fog bud
118 laidback abandon if gun
119 an laidback no dub fagin
120 financial goad bank dub
121 an bad bid cloaking faun
122 financial bug bonk dada
123 an laidback faun bin god
124 clinking fauna bob dada
125 an laidback in bung fado
126 baking flu bid anaconda
127 an laidback fun ding boa
128 laidback info band guan
129 an fain baba ok cuddling
130 fun again laidback bond
131 buckling bandaid of an a
132 aid buckling of bandana
133 an laidback fin undo bag
134 dank baba including oaf
135 an bouncing fad kid baal
136 laidback bani nag found
137 an laidback ion fund bag
138 bad nada flocking nubia
139 an ain baba flocking dud
140 fain add unlocking baba
141 an fab duo kid balancing
142 fluid gib bank anaconda
143 an laidback goa find nub
144 laidback gin abound fan
145 an fain dada ok clubbing
146 focal bank adding nubia
147 an laidback info gun dab
148 fab liking bud anaconda
149 ago bind an laidback fun
150 laidback union dab fang
151 an fab bank aid clouding
152 ain fad abound blacking
153 an laidback oaf gun bind
154 financial dak bound gab
155 an laidback fagin do nub
156 financial babu dong dak
157 an ain fado bud blacking
158 laidback faun gain bond
159 an laidback fun bin dago
160 laidback nubia fan dong
161 an laidback info dun bag
162 laidback fauna gin bond
163 an bad fink baa clouding
164 laidback ana bond fungi
165 an laidback fado gun bin
166 laidback guano fin band
167 an laidback goa fund bin
168 financial dug and kabob
169 an clinking babu add oaf
170 laidback bani gan found
171 an odd ana flicking babu
172 laidback dna fag bunion
173 an laidback faun dog bin
174 financial gab dado bunk
175 add of i buckling banana
176 laidback ani bound fang
177 an fab kind baa clouding
178 laidback bin dong fauna
179 fucking dial nod an baba
180 laidback bind fan guano
181 an laidback faun don gib
182 financial dago dab bunk
183 an laidback dona gun fib
184 fungal bib kid anaconda
185 an fab oak including dab
186 financial goad dab bunk
187 big undo an laidback fan
188 anaconda bank big fluid
189 an laidback info nag bud
190 laidback inn abound fag
191 an laidback info ban dug
192 balancing baa found kid
193 ago find an laidback nub
194 laidback gib found naan
195 an laidback duo fin bang
196 dud boa faking cannibal
197 an laidback fag undo bin
198 bouncing baal fink dada
199 dank a including of baba
200 financial dud nag kabob
201 an fain dub cloaking bad
202 laidback guan fib donna
203 an laidback dui fan bong
204 dud banana flicking boa
205 an laidback dona fin bug
206 dud banana cloaking fib
207 i baa bad clanking found
208 laidback dag fan bunion
209 annual baking did of cab
210 bound nada flicking aba
211 an fain oak add clubbing
212 baking ful bid anaconda
213 on bud an laidback fagin
214 clanking oaf undid baba
215 an bad aba fink clouding
216 laidback info bung nada
217 an laidback nina fog dub
218 laidback fagin undo ban
219 ain gun of laidback band
220 laidback fungi ban dona
221 an financial dak bud bog
222 buckling bandaid of ana
223 an financial dak bud gob
224 fab liking dub anaconda
225 an fain ado buckling bad
226 dank baba loaf inducing
227 ago fund an laidback bin
228 akin fado bud balancing
229 an laidback gin fund boa
230 laidback naan bound fig
231 an fab dui cloaking band
232 financial kabob dun dag
233 an laidback ion bud fang
234 laidback fin abound nag
235 clanking oaf did an babu
236 laidback bunion gad fan
237 an fain dad buckling boa
238 laidback big found naan
239 fain don an laidback bug
240 financial dud gan kabob
241 an laidback info nab dug
242 laidback bingo and faun
243 an laidback fang bin duo
244 confining bulk baa dada
245 an laidback info gan bud
246 laidback fig abound nan
247 an laidback nina fob dug
248 again fond laidback bun
249 an fond aid buckling baa
250 confiding baba dunk ala
251 ain dad of clanking babu
252 fab oak undid balancing
253 dada of i bunk balancing
254 laidback nina bung fado
255 an dun baba flocking aid
256 clinking fad abound baa
257 an bouncing flak aid dab
258 confiding nada bulk baa
259 an bad oaf balk inducing
260 funding on laidback baa
261 i found bad clanking aba
262 laidback bong din fauna
263 an dud baba cloaking fin
264 laidback fang nod nubia
265 an akin oaf add clubbing
266 laidback bang ain found
267 an laidback inn bug fado
268 anon dada flicking babu
269 i flunk big bad anaconda
270 laidback fang undo bani
271 i fan dad unlocking baba
272 laidback fungi nab dona
273 an bad ani buckling fado
274 clinking faun dado baba
275 an financial dak bug bod
276 financial dun gad kabob
277 an laidback fan undo gib
278 laidback bunion and fag
279 an ain fado dub blacking
280 ain bound laidback fang
281 an fab oak bald inducing
282 blank fado baa inducing
283 an laidback oaf ding bun
284 clanking dada fob nubia
285 i find bulk bag anaconda
286 laidback dingo ban faun
287 an fab aid undo blacking
288 laidback nog bind fauna
289 laidback bong aid an fun
290 laidback nob ding fauna
291 an laidback fig undo ban
292 dank baba foal inducing
293 an fab nada biking cloud
294 did oaf buckling banana
295 i abandon a buckling fad
296 laidback fad nag bunion
297 an baking bod dun facial
298 confining dada bulk aba
299 ok bad and financial bug
300 cannibal bad faking duo
301 an ain fado buckling dab
302 fab dada unlocking bani
303 an laidback oaf dung bin
304 clinking fad abound aba
305 an clinking baa bud fado
306 confiding nada bulk aba
307 an fab oka including dab
308 funding on laidback aba
309 an laidback fan dung obi
310 laidback nib dong fauna
311 an bouncing fad aid balk
312 confiding baal baa dunk
313 an fab aid unlocking dab
314 clouding kinda fan baba
315 an focal nada biking bud
316 find babu cloaking nada
317 bad guan kid of cannibal
318 laidback dingo nab faun
319 an bouncing dak bail fad
320 laidback faun dong bani
321 an laidback fin undo gab
322 akin fado dub balancing
323 banana of i dab duckling
324 dunning of laidback baa
325 a bunk bad financial god
326 clanking fauna dado bib
327 an fond aid buckling aba
328 laidback fad gan bunion
329 an bouncing dak fail dab
330 clanking fado dab nubia
331 an laidback ion fund gab
332 again fond laidback nub
333 in dada of clanking babu
334 fab oka undid balancing
335 dud a of baking cannibal
336 laidback fob dun angina
337 i do fauna band blacking
338 anaconda bad biking flu
339 i bud a flocking bandana
340 i buckling fado bandana
341 an fungi on laidback bad
342 clouding kid fab banana
343 an laidback info nag dub
344 laidback noun dab fagin
345 an fungi no laidback bad
346 confiding aba dunk baal
347 an dank oaf aid clubbing
348 abound ana flicking bad
349 an laidback ani fund bog
350 including fado bank baa
351 an laidback ani fund gob
352 oaf kinda bud balancing
353 an dud oak fib balancing
354 adlib gib funk anaconda
355 an laidback fin dung boa
356 flocking aid bud banana
357 clanking babu did of ana
358 dunning of laidback aba
359 an fain oka add clubbing
360 laidback inbound fang a
361 clanking a undid of baba
362 laidback bad fang union
363 an donna if laidback bug
364 baa if abandon duckling
365 an laidback fado gin bun
366 fado kinda bug cannibal
367 an laidback gain dun fob
368 cloaking fauna band bid
369 an dun baba flicking ado
370 including fado bank aba
371 an fab boa including dak
372 bandana if cloaking bud
373 an fab dak dial bouncing
374 anaconda adlib big funk
375 on dab an laidback fungi
376 fad kinda bouncing baal
377 an laidback nag fund obi
378 flicking ado bud banana
379 cannibal bag a found kid
380 fin dada unlocking baba
381 on dub an laidback fagin
382 duo kinda fab balancing
383 an laidback info dun gab
384 aba if abandon duckling
385 an laidback nag undo fib
386 laidback bad anon fungi
387 i do fad buckling banana
388 clunking of bandaid baa
389 i don bang laidback faun
390 donna fain laidback bug
391 ain nada buckling of bad
392 cloaking fan undid baba
393 an laidback fado gun nib
394 laidback bud fain gonna
395 an laidback goa fund nib
396 gulf kinda bib anaconda
397 an clinking aba bud fado
398 oaf kinda dub balancing
399 an fain add buckling boa
400 flocking aid dub banana
401 an financial dak dub bog
402 anaconda bank build fig
403 an fain bud cloaking dab
404 anaconda bag build fink
405 an financial dak dub gob
406 anaconda bad biking ful
407 an laidback faun dog nib
408 undo baba flicking nada
409 baa undid of an blacking
410 blacking band audio fan
411 ain add of clanking babu
412 dado if buckling banana
413 an fain dud baa blocking
414 blocking band aid fauna
415 including dak of an baba
416 flicking bound baa nada
417 an laidback dago fin bun
418 dui of bandana blacking
419 an laidback ion dub fang
420 clunking of bandaid aba
421 i bud big flank anaconda
422 inducing band fab koala
423 an dud info baa blacking
424 laidback big donna faun
425 kinda bud a of balancing
426 cloaking fad band nubia
427 an fain ado bud blacking
428 nada if abound blacking
429 fain do an laidback bung
430 anaconda babu kid fling
431 an laidback info gan dub
432 dado anna flicking babu
433 a bunk bad financial dog
434 bandana if cloaking dub
435 an laidback ado fin bung
436 laidback bound fain nag
437 an fun big laidback dona
438 bouncing bandaid flak a
439 i add baba unlocking fan
440 cannibal abound fag kid
441 an dud baba flocking ani
442 ban bandaid flick guano
443 an laidback fag undo nib
444 flicking duo dab banana
445 laidback bad gain of nun
446 abound dna flicking baa
447 an laidback guan fin bod
448 clanking fab band audio
449 an fab oka bald inducing
450 flicking ado dub banana
451 an laidback faun dig nob
452 cannibal bud fading oak
453 an laidback oaf ding nub
454 ado if buckling bandana
455 i funk big bald anaconda
456 undid baba flocking ana
457 an laidback guan nod fib
458 flocking dui dab banana
459 an laidback fund gan obi
460 guan fain laidback bond
461 i found dak bag cannibal
462 nab bandaid flick guano
463 kinda ding an focal babu
464 laidback dub fain gonna
465 bad nada nailing of buck
466 dak if abound balancing
467 an bouncing dak aid flab
468 anaconda adlib bug fink
469 an laidback nog bid faun
470 abound dna flicking aba
471 i flank dad baa bouncing
472 anaconda fagin kid bulb
473 ain baba add of clunking
474 fagin anon laidback bud
475 bad kan including of baa
476 blocking nubia fan dada
477 ain baa bank of cuddling
478 dna aback unfailing bod
479 laidback bin goad an fun
480 abound ana flicking dab
481 an nag if laidback bound
482 cannibal bud ado faking
483 i found dna baa blacking
484 cloaking fauna dab bind
485 i band bad cloaking faun
486 flocking nubia ban dada
487 aba undid of an blacking
488 balancing bod kid fauna
489 afoul in and bad backing
490 blocking bin fauna dada
491 ago fund an laidback nib
492 blocking bid nada fauna
493 big nod an laidback faun
494 laidback bonding faun a
495 an laidback ion bung fad
496 anaconda adlib bunk fig
497 an clinking baa dub fado
498 duckling bid banana oaf
499 an fab oink baa cuddling
500 dick dab banana fouling
