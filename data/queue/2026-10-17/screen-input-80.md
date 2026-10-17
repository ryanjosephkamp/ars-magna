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

## File 80 of 88: 3000 phrases

### sarahgoodridge:people

input: Sarah Goodridge
category: people
phrases 1 to 500 of 500

1 his adored aggro
2 his good regard a
3 her good a gird as
4 good grades hair
5 his road go grade
6 i dogs her ago rad
7 dogs go diarrhea
8 his rod do garage
9 i go as harder god
10 good grade hairs
11 good grid has are
12 i go so had regard
13 gods go diarrhea
14 his a gorged road
15 i go so heard drag
16 garage dish door
17 his door gag dear
18 i go harder dogs a
19 goods grade hair
20 his good a grader
21 i go so hard grade
22 doggie had roars
23 his door read gag
24 her odd a soar gig
25 hairdo go grades
26 his goa do regard
27 i go gas had order
28 gorges had radio
29 heard good is rag
30 her a as good grid
31 agha go disorder
32 rigged door has a
33 i go harder dog as
34 haggard is rodeo
35 do his ago regard
36 i go drag do share
37 good aah girders
38 his door gag dare
39 i go harder do gas
40 geisha drag door
41 his ragged door a
42 i had a dog rogers
43 hairdos go grade
44 good grid share a
45 i drag a horse god
46 garage hid doors
47 his aga order god
48 i go so had grader
49 ahead dogs rigor
50 heard good rigs a
51 i go hard do gears
52 door aah diggers
53 heard good rig as
54 i go so heard grad
55 hao go disregard
56 i gags her dorado
57 i do hard gorges a
58 so ragged hairdo
59 his ado go regard
60 i shag a order god
61 good raged hairs
62 heard dogs go air
63 i drag a dog horse
64 ago disorder hag
65 i has good regard
66 i do as hard gorge
67 gorge had radios
68 his oar do dagger
69 i has gag do order
70 ahead dog rigors
71 heard good is gar
72 i gag so had order
73 doggies had roar
74 his god adore rag
75 i rag so heard god
76 doors aah digger
77 shared god go air
78 i go hard do rages
79 raider shag good
80 heard door is gag
81 i drag a shore god
82 dosage had rigor
83 heard gods go air
84 i gorged so hard a
85 ashore did aggro
86 his ora do dagger
87 i do so harder gag
88 garages hid door
89 shared good rig a
90 i go rash do grade
91 god gears hairdo
92 his aga dog order
93 i do as heard grog
94 ago hair dodgers
95 do his gaga order
96 i go grad do share
97 heads radio grog
98 his goa do grader
99 i hog a do regards
100 gaga hired doors
101 hired good rags a
102 i gash a order god
103 hard rag goodies
104 his god grade oar
105 so gag her odd air
106 grade radio hogs
107 her adios rag god
108 i go ash do regard
109 grades radio hog
110 do his ago grader
111 i shag a dog order
112 ago dig hoarders
113 heard god go sari
114 god is harder go a
115 daggers air hood
116 his god grade ora
117 i do god rag share
118 hoods rid garage
119 ago dig has order
120 i go a drag hordes
121 dodger go sharia
122 good grid hears a
123 i dog so heard rag
124 raider gash good
125 ago god has rider
126 i go god had rears
127 goods raged hair
128 said hag go order
129 her grids do ago a
130 raids ooh dagger
131 good a drag heirs
132 i drag a dog shore
133 hard soar doggie
134 said hogg order a
135 i go dag has order
136 shagged air door
137 heard god go airs
138 i go rod has grade
139 raid ooh daggers
140 i drag good share
141 i hogs a do regard
142 dagger air hoods
143 i gas harder good
144 i rag dad go horse
145 gorge dash radio
146 good a drag hires
147 i go so harder dag
148 god rages hairdo
149 his dog adore rag
150 i go sag had order
151 his agora dodger
152 shared dog go air
153 go his a do regard
154 ahead god rigors
155 harder god is goa
156 i dog a horse grad
157 ardor has doggie
158 ago god rid share
159 i dog a orders hag
160 garage dish odor
161 his god adore gar
162 i go hard gored as
163 hairdo dog gears
164 i rags heard good
165 i do so regard hag
166 so diehard aggro
167 his ado go grader
168 i rag a shred good
169 a gorged hairdos
170 ago grid do share
171 i gash a dog order
172 as gorged hairdo
173 good grid ash are
174 i dogs a order hag
175 dagger radio hos
176 his oar dog grade
177 i go harder do sag
178 hood rid garages
179 i has good grader
180 her drag so go aid
181 dashed ago rigor
182 heard goods rig a
183 i hog a do graders
184 gig share dorado
185 dear sigh go road
186 i hog as do regard
187 shad radio gorge
188 hired good rag as
189 i go god share rad
190 shade radio grog
191 hired gas go road
192 dog is harder go a
193 horrid ago degas
194 her adios rag dog
195 i do dog rag share
196 good hag raiders
197 i gears hard good
198 i rag a herds good
199 agha ridges door
200 heard dog go sari
201 i do god share gar
202 hordes radio gag
203 his ora dog grade
204 i go dog had rears
205 ago hoards ridge
206 good a drag shire
207 i go drag do shear
208 hair gorged soda
209 good grid has ear
210 i go as drag horde
211 rigged doors aah
212 ahead grog do sir
213 i dog so heard gar
214 good agha riders
215 good sir head gar
216 his a or do dagger
217 ago hoard ridges
218 ago dog has rider
219 i dog a order hags
220 sari hood dagger
221 hired door gags a
222 i go drag do hares
223 raid shoo dagger
224 hard a goose grid
225 i dog as order hag
226 goods aah girder
227 heard dago go sir
228 i go ash do grader
229 agha ridge doors
230 his odor gag dear
231 i go so regard dah
232 ahead gods rigor
233 heard dog go airs
234 i do god hears rag
235 hairdo dog rages
236 his odor read gag
237 i do a gorge shard
238 grade radios hog
239 ragged a hood sir
240 i gas hag do order
241 horde radio gags
242 heard goad go sir
243 i go rod had gears
244 aggro hides road
245 heard goo is drag
246 i do a gorged rash
247 dares radio hogg
248 rigged door ash a
249 his god or grade a
250 haired rags good
251 his ado gag order
252 i go dad horse gar
253 ragged radio hos
254 harder dog is goa
255 i go hod regards a
256 airs hood dagger
257 i has ragged door
258 i rag dad go shore
259 hades radio grog
260 ago dog rid share
261 she dig door rag a
262 shaded ago rigor
263 heard goa dog sir
264 i go a drags horde
265 raiders gag hood
266 her said drag goo
267 i had rods gorge a
268 garage hid odors
269 his dog adore gar
270 i hogs a do grader
271 haggis order ado
272 her dado is aggro
273 i dog a shore grad
274 goa disorder hag
275 his goa order dag
276 i do a shred aggro
277 adios hog regard
278 good grid has era
279 he add as go rigor
280 doggie dash roar
281 his rod grade goa
282 i go rad dog share
283 oh ago disregard
284 hard goo is grade
285 i gag a shred door
286 ago hairs dodger
287 i rages hard good
288 he dog a rigs road
289 rash road doggie
290 ago god has drier
291 grid go so heard a
292 geisha drag odor
293 his door gage rad
294 i had rod gorges a
295 goo grade radish
296 his dad gorge oar
297 i gag so heard rod
298 ago gored radish
299 i hears good drag
300 go his a do grader
301 ardor dog geisha
302 rigged odor has a
303 i do gar dog share
304 hard goad orgies
305 her aids drag goo
306 i had rod gorge as
307 rigors aah dodge
308 his ago dag order
309 a has dig go order
310 agog hired roads
311 his ago rod grade
312 a go so hard ridge
313 gig hears dorado
314 i grade good rash
315 i add rag go horse
316 sharia gored god
317 good grid shear a
318 i gag ash do order
319 raised road hogg
320 heard rig go soda
321 i go dah gas order
322 odors aah digger
323 i share good grad
324 i do a herds aggro
325 odor aah diggers
326 her gar dog adios
327 a is hard do gorge
328 dears radio hogg
329 hired as do aggro
330 i go rod had rages
331 giro aah dodgers
332 arid god go share
333 door is hard egg a
334 dish adore aggro
335 his dad gorge ora
336 i gag a herds door
337 hao gag disorder
338 his odor gag dare
339 a has god go rider
340 shad roar doggie
341 his god raged oar
342 i go god hears rad
343 said hoard gorge
344 heard a dogs giro
345 i add a horse grog
346 agog radio shred
347 good a hires grad
348 i has a gorged rod
349 dah roars doggie
350 good grid hares a
351 i hog as do grader
352 dah radio gorges
353 hired as gag door
354 i do dog hears rag
355 goa dig hoarders
356 dashed rigor go a
357 her grad so go aid
358 hard oars doggie
359 his dogged a roar
360 he go road gad sir
361 heard adios grog
362 his ragged odor a
363 dig go so harder a
364 rod adore haggis
365 hired doors gag a
366 i sod hard gorge a
367 ago sighed ardor
368 go his adored rag
369 i do god hears gar
370 roadside rag hog
371 radio rash do egg
372 her dada so go rig
373 raider gags hood
374 sad hair do gorge
375 gig has a do order
376 good hags raider
377 i gags heard door
378 his a or dog grade
379 disorder hog aga
380 his goa gad order
381 i dog hos regard a
382 agog radio herds
383 horrid as go aged
384 i ooh a drag dregs
385 dodgers hog aria
386 ago god air shred
387 i go ors had grade
388 rigor heads dago
389 ago drag is horde
390 so had gig order a
391 gaga hired odors
392 his god raged ora
393 i do rad has gorge
394 ideas hoard grog
395 horrid a go degas
396 gorge had a do sir
397 agar sighed door
398 ago drag do heirs
399 a go so hired drag
400 hoagie drag rods
401 heard dig go soar
402 i go a hoard dregs
403 radish gag rodeo
404 his adored grog a
405 god go a rid share
406 rigor aah dodges
407 i ash good regard
408 i rag ago do shred
409 gas gored hairdo
410 his rod adore gag
411 i go grad do shear
412 heads goad rigor
413 gad his ago order
414 i had so gorge rad
415 hoarse aggro did
416 ago drag do hires
417 i go dad shore gar
418 aside hoard grog
419 i rag shared good
420 i do rag had ogres
421 haired gags door
422 heard dig go oars
423 grid go a do share
424 garages hid odor
425 hard gag is rodeo
426 i do rod gag share
427 goo sighed radar
428 ago god air herds
429 i go grad do hares
430 gig adores hoard
431 ago dash go rider
432 gig do so harder a
433 hired dogs agora
434 heard as dog giro
435 i drag a dog heros
436 reddish agora go
437 hired goods rag a
438 god rig so heard a
439 raid oohs dagger
440 ago dog has drier
441 i go a gored shard
442 hard gar goodies
443 heard gas do giro
444 i go hod regard as
445 gig adore hoards
446 heard soar do gig
447 i rag a dog hordes
448 said aggro horde
449 odd hair go gears
450 i rag ago do herds
451 sharia gored dog
452 said rho go grade
453 so do a had rigger
454 horde radios gag
455 ago shag do rider
456 i rags a dog horde
457 ragged raids ooh
458 hard goa go rides
459 he do gag is ardor
460 gigs adore hoard
461 ago raid go shred
462 he roar gas do dig
463 ago digs hoarder
464 i drag hard goose
465 i do god rag shear
466 adios hog grader
467 his goo grade rad
468 a has dog go rider
469 ads gorge hairdo
470 dear god hogs air
471 so go a had girder
472 hair dado gorges
473 arid dog go share
474 i add gar go horse
475 goaded rigor has
476 heard oars do gig
477 i go dog hears rad
478 gorge hoard aids
479 his dog raged oar
480 i dog rho grades a
481 ragged air hoods
482 heard odor is gag
483 i dogs rho grade a
484 ashore goad grid
485 shaded rigor go a
486 i add rag go shore
487 dosage hoard rig
488 ago drag do shire
489 he go sod drag air
490 hogg adores raid
491 ago rod has ridge
492 i go dag ash order
493 dido share aggro
494 aired god go rash
495 i go rod ash grade
496 ago hoards dirge
497 heard goo is grad
498 i do god rag hares
499 hog radioed rags
500 i gag heard doors

### deannorris:people

input: Dean Norris
category: people
phrases 1 to 500 of 500

1 inner roads
2 an in orders
3 an on red sir
4 senior rand
5 an on riders
6 an red sir no
7 iron sander
8 an no riders
9 in don err as
10 raised norn
11 an red irons
12 an sir do ern
13 soar dinner
14 an iron reds
15 an no rid res
16 darn senior
17 an risen rod
18 an red in ors
19 anon riders
20 an red rosin
21 an no rid ers
22 rain drones
23 an rose rind
24 on sir rend a
25 nina orders
26 near don sir
27 no sir rend a
28 drain senor
29 i orders nan
30 an sod err in
31 risen radon
32 i ran drones
33 sad no err in
34 reason rind
35 on is errand
36 an dos err in
37 roan diners
38 errand is no
39 an sir or end
40 road sinner
41 an sore rind
42 an ids err no
43 rains drone
44 so in errand
45 i err an dons
46 oars dinner
47 i darn senor
48 i err an nods
49 drain snore
50 sir earn don
51 red norn is a
52 adorn siren
53 roars end in
54 an ern is rod
55 snider roan
56 i snore darn
57 i ran red son
58 snared iron
59 rise ran don
60 an ods err in
61 road niners
62 rears don in
63 on in err ads
64 arson diner
65 a orders inn
66 an in or reds
67 sonar diner
68 roar send in
69 an on res rid
70 adorn rinse
71 order is nan
72 i ran on reds
73 roar sinned
74 an drone sir
75 an on ers rid
76 adorn reins
77 an order sin
78 i ran no reds
79 rain snored
80 on red rains
81 i rend an ors
82 roads niner
83 an rider son
84 an sir or den
85 donna riser
86 sire ran don
87 on ern rid as
88 adorn resin
89 i snore rand
90 in nod err as
91 radon siren
92 in red arson
93 in dons err a
94 rani drones
95 as order inn
96 in nods err a
97 errands ion
98 son ran ride
99 no ern rid as
100 nadir senor
101 an don riser
102 i err on sand
103 sarin drone
104 in red sonar
105 i err no sand
106 dinar senor
107 on ran rides
108 so rid an ern
109 oar dinners
110 no ran rides
111 an in res rod
112 ora dinners
113 so ran diner
114 an sin or red
115 errand sion
116 near rid son
117 an in ers rod
118 errand ions
119 on air nerds
120 on err an ids
121 roared inns
122 no air nerds
123 nerds or in a
124 innards ore
125 on rise darn
126 is on ran red
127 senora rind
128 darn rise no
129 ran red is no
130 nadir snore
131 roar ends in
132 on din err as
133 radon rinse
134 nerds iron a
135 no din err as
136 dinar snore
137 an senor rid
138 in so ran red
139 innards roe
140 rear don sin
141 so err an din
142 radon reins
143 i reads norn
144 on ern is rad
145 rani snored
146 in rose rand
147 no ern is rad
148 sora dinner
149 so rain nerd
150 nerd or in as
151 radon resin
152 a order inns
153 i darn on res
154 ardor nines
155 on ran dries
156 i darn no res
157 roan rinsed
158 i rend arson
159 in nor red as
160 inroads ern
161 no ran dries
162 i darn on ers
163 andro siren
164 on rain reds
165 i darn no ers
166 nona riders
167 on sire darn
168 i so ran nerd
169 nano riders
170 no rain reds
171 an ins or red
172 serrano din
173 on red sarin
174 in ern do ras
175 andros rein
176 dinner or as
177 i ran red nos
178 andro rinse
179 i dares norn
180 in ern do ars
181 andro reins
182 darn sire no
183 reds nor in a
184 andro resin
185 in roars den
186 i don res ran
187 sander noir
188 no red sarin
189 on err sad in
190 risen andro
191 i rend sonar
192 i don ers ran
193 innards oer
194 on rise rand
195 is on err dna
196 sardine nor
197 an drier son
198 inn or red as
199 sander nori
200 an order ins
201 is no err dna
202 adorn risen
203 rand rise no
204 in so err dna
205 snared noir
206 on rinds are
207 do in ran res
208 snared nori
209 no rinds are
210 on in red ras
211 in earn rods
212 no in red ras
213 on rid snare
214 i or an nerds
215 nerd iron as
216 do in ran ers
217 snare rid no
218 sin nor red a
219 son air nerd
220 is an don err
221 an rod siren
222 i rend so ran
223 dear is norn
224 sir nor end a
225 in sore rand
226 end or in ras
227 as inner rod
228 on in red ars
229 near nod sir
230 i rend on ras
231 an snore rid
232 an nerd or is
233 rain don res
234 no in red ars
235 one sir rand
236 i as red norn
237 on sire rand
238 i rend no ras
239 in ran doers
240 inns or red a
241 rain don ers
242 i err son dna
243 reis ran don
244 an red nor is
245 in earns rod
246 end or in ars
247 rand sire no
248 i rend on ars
249 roan end sir
250 i rend no ars
251 so near rind
252 ads err in no
253 dinners or a
254 nerd nor is a
255 dare is norn
256 res or in dna
257 rare don sin
258 an res or din
259 so inner rad
260 err inn do as
261 in darn eros
262 i so darn ern
263 in soar nerd
264 ers or in dna
265 in snare rod
266 an ers or din
267 rear don ins
268 in or sad ern
269 anon red sir
270 a don ern sir
271 sir earn nod
272 an ern or ids
273 so rein darn
274 ins nor red a
275 near rods in
276 i end ors ran
277 sir ran node
278 red or is nan
279 on drain res
280 err inns do a
281 so rend rain
282 res on in rad
283 ran done sir
284 i nor an reds
285 no drain res
286 in or rend as
287 rear dons in
288 res no in rad
289 on drain ers
290 a don err sin
291 roar end sin
292 son and i err
293 rear nods in
294 ers on in rad
295 on risen rad
296 ers no in rad
297 an rod rinse
298 i ran sen rod
299 as ride norn
300 sen or in rad
301 no drain ers
302 on sir nerd a
303 so earn rind
304 den or in ras
305 no risen rad
306 no sir nerd a
307 an rod reins
308 ern as in rod
309 no and riser
310 nerd or sin a
311 rad snore in
312 den or in ars
313 nan rode sir
314 ends or i ran
315 in roar dens
316 i don ern ras
317 darn one sir
318 ern so in rad
319 in nears rod
320 ern or in ads
321 on darn reis
322 i don ern ars
323 on rinse rad
324 i nod res ran
325 no darn reis
326 err an sin do
327 rear do inns
328 i nod ers ran
329 ras drone in
330 a rend in ors
331 rad rinse no
332 i ran ors den
333 on reins rad
334 a don err ins
335 rad reins no
336 an sen or rid
337 nerd rosin a
338 i err nos dna
339 a rides norn
340 an on sir der
341 rears do inn
342 an no sir der
343 nan rid rose
344 i sod ern ran
345 inner rods a
346 is an nod err
347 an rod resin
348 so err and in
349 in or sander
350 i err sod nan
351 so rein rand
352 i ran ern dos
353 an rider nos
354 sin or rend a
355 as rend iron
356 ern or is dna
357 rind snore a
358 a rid ern son
359 air rend son
360 sen nor rid a
361 ars drone in
362 i err dos nan
363 nan do riser
364 err an no dis
365 so drain ern
366 err an ins do
367 rise ran nod
368 a din err son
369 nos ran ride
370 sri an on red
371 rains do ern
372 dens or i ran
373 rears nod in
374 i nor sad ern
375 nan redo sir
376 i ods ern ran
377 rose ran din
378 nos and i err
379 rear din son
380 sen or i darn
381 rani don res
382 i err ods nan
383 on siren rad
384 a nod ern sir
385 no siren rad
386 ins or rend a
387 a rend irons
388 i nor rend as
389 rani don ers
390 a nod err sin
391 rare don ins
392 ern or i sand
393 in senor rad
394 is no and err
395 near rid nos
396 i nor end ras
397 in adorn res
398 a sod err inn
399 rains red no
400 in ors nerd a
401 darn rose in
402 ser i ran don
403 none sir rad
404 ern or din as
405 in adorn ers
406 an ern or dis
407 an rods rein
408 der so ran in
409 sin earn rod
410 i nod ern ras
411 a dries norn
412 a dos err inn
413 ras end iron
414 i nor end ars
415 red son rani
416 res nor din a
417 sari don ern
418 i send or ran
419 end or rains
420 ern sin rod a
421 ends or rain
422 ers nor din a
423 nan rid sore
424 in ern rods a
425 sire ran nod
426 i nod ern ars
427 on rend sari
428 sir nor den a
429 rain red son
430 dan so err in
431 on raids ern
432 der i ran son
433 soar rend in
434 is end or ran
435 on nerd sari
436 rin on red as
437 sari rend no
438 rin no red as
439 on din rears
440 ern nor dis a
441 ras don rein
442 on res rind a
443 rare dons in
444 a rid ern nos
445 rain end ors
446 no res rind a
447 no raids ern
448 an red sri no
449 rare nods in
450 a nod err ins
451 no nerd sari
452 on ers rind a
453 ras rid none
454 no ers rind a
455 rears din no
456 ser i darn no
457 on riser dna
458 dan i err son
459 on rind ears
460 a ods err inn
461 an diner ors
462 a din err nos
463 an nod riser
464 i nor nerds a
465 no riser dna
466 inn or reds a
467 no rind ears
468 an no rid ser
469 roar end ins
470 an in res dor
471 on rinds ear
472 red ors inn a
473 oars rend in
474 an in ers dor
475 airs don ern
476 dans i err no
477 on rend airs
478 ins or nerd a
479 ars end iron
480 on is and err
481 sir darn eon
482 i nor nerd as
483 no rinds ear
484 ands i err no
485 in nerd oars
486 an rod ser in
487 saner no rid
488 is den or ran
489 roan red sin
490 ons i ran red
491 on nerd airs
492 ser on in rad
493 airs rend no
494 der on in ras
495 in nor dares
496 err an on dis
497 ras do niner
498 sri on rend a
499 no nerd airs
500 der on in ars

### leathompson:people

input: Lea Thompson
category: people
phrases 1 to 500 of 500

1 plane smooth
2 those on palm
3 me lot an shop
4 me lop so nth a
5 almost phone
6 those no palm
7 so palm the no
8 me so nth pol a
9 phantom sole
10 those on lamp
11 me hop an lost
12 a elm oh on pst
13 mental hoops
14 those no lamp
15 she palm to no
16 a elm oh no pst
17 penal smooth
18 an home plots
19 he palms to no
20 a mel oh on pst
21 male photons
22 the mono slap
23 som to an help
24 a mel oh no pst
25 spent moolah
26 me shoot plan
27 the mon slop a
28 he on pst mol a
29 man potholes
30 the mono pals
31 the no map sol
32 he no pst mol a
33 pale thomson
34 the mono laps
35 mos to an help
36 lame photons
37 the mono alps
38 he mop an lost
39 tops manhole
40 an posh motel
41 me hop an lots
42 panel smooth
43 an moot helps
44 she mop an lot
45 phantom lose
46 home to plans
47 so help to man
48 tampons hole
49 me ooh plants
50 on tom help as
51 manhole stop
52 help to mason
53 no tom help as
54 shampoo lent
55 he top salmon
56 he palm to son
57 tampon holes
58 help to moans
59 me lot an soph
60 postman hole
61 man hope lost
62 me lot an hops
63 leap thomson
64 man the pools
65 so help an tom
66 soap menthol
67 so home plant
68 the no mop las
69 manhole spot
70 man hole stop
71 he psalm to no
72 planets homo
73 not home slap
74 the no pal som
75 planet homos
76 homes to plan
77 shop to an elm
78 mantle hoops
79 man the loops
80 he stop an mol
81 hamlet spoon
82 he plot mason
83 so man the pol
84 manhole post
85 too helps man
86 he slop to man
87 lament hoops
88 a pole months
89 he mop an lots
90 meal photons
91 me hoots plan
92 the no pal mos
93 hamlet snoop
94 phone to slam
95 he mops an lot
96 anthem pools
97 hot some plan
98 she lot an pom
99 mans pothole
100 mean shop lot
101 on tom helps a
102 meals photon
103 he pot salmon
104 on help to mas
105 anthems pool
106 me shoo plant
107 she man to pol
108 plea thomson
109 man hope lots
110 no tom helps a
111 platoon mesh
112 slap the moon
113 no help to mas
114 pathos lemon
115 me hoot plans
116 the no lap som
117 males photon
118 me spoon halt
119 he slop an tom
120 anthem loops
121 not home pals
122 so pal the mon
123 laments hoop
124 name shop lot
125 me lop an shot
126 manhole pots
127 on help atoms
128 the so on palm
129 peal thomson
130 he plot moans
131 me slot an hop
132 mantel hoops
133 atoms help no
134 the no lap mos
135 anthems loop
136 me shop talon
137 the so on lamp
138 methanol ops
139 on hot sample
140 she pal to mon
141 anthem spool
142 man the spool
143 the mon lop as
144 pathos melon
145 not shop male
146 on mop has let
147 anthem sloop
148 he moon splat
149 the so no lamp
150 anthems polo
151 man hopes lot
152 so lop the man
153 halo postmen
154 she moot plan
155 he slap to mon
156 platoons hem
157 not home laps
158 on shop melt a
159 ethanol mops
160 man the sloop
161 the no mop als
162 stanhope mol
163 not shop meal
164 no shop melt a
165 methanol sop
166 on shop metal
167 so lap the mon
168 polenta mosh
169 he moo plants
170 she lop to man
171 hamlets poon
172 not hope slam
173 on toms help a
174 paleo months
175 metal shop no
176 no toms help a
177 leman photos
178 she moo plant
179 me host an pol
180 nam potholes
181 pals the moon
182 ops to an helm
183 espanol moth
184 phone to alms
185 she top an mol
186 hetman pools
187 he stomp loan
188 me plan to hos
189 apos menthol
190 he moot plans
191 she lap to mon
192 hetman loops
193 a poles month
194 lost men hop a
195 alphonso met
196 not home alps
197 he spot an mol
198 pao menthols
199 at help moons
200 he pals to mon
201 phantoms ole
202 me snoop halt
203 the on sol map
204 postman helo
205 he loom pants
206 he mop an slot
207 hetman spool
208 them solo pan
209 me plot an hos
210 tampons helo
211 man let hoops
212 she lop an tom
213 hetman sloop
214 last hope mon
215 he plan to som
216 opa menthols
217 me plan sooth
218 he post an mol
219 apo menthols
220 them solo nap
221 the no sap mol
222 empath solon
223 a slope month
224 mon help to as
225 laments pooh
226 shot one lamp
227 on pom has let
228 empath loons
229 laps the moon
230 he laps to mon
231 phantoms loe
232 man hole spot
233 hop to an elms
234 altos phenom
235 on home splat
236 sol to an hemp
237 lotsa phenom
238 mean hop lost
239 on som help at
240 at helps moon
241 no pom has let
242 not shop lame
243 he plot an som
244 so pale month
245 no som help at
246 plans the moo
247 he plan to mos
248 them loan ops
249 the no lop mas
250 man pole shot
251 posh men lot a
252 on plot shame
253 me has on plot
254 moon the alps
255 me lop an host
256 he moos plant
257 on mos help at
258 man holes top
259 he plot an mos
260 she plot moan
261 no mos help at
262 shame plot no
263 slop to an hem
264 so leap month
265 pol to an mesh
266 on shot maple
267 on hemp lot as
268 as pole month
269 on mop the las
270 man hole post
271 the mons lop a
272 not homes pal
273 she pot an mol
274 on maps hotel
275 no hemp lot as
276 no shot maple
277 on hes to palm
278 pal the moons
279 me hop on last
280 lemon shop at
281 he pal most no
282 top has lemon
283 no hes to palm
284 help to soman
285 on mot help as
286 on hole stamp
287 on hes to lamp
288 not holes map
289 the on som pal
290 name hop lost
291 soph to an elm
292 no maps hotel
293 an let hop som
294 them snap loo
295 no mot help as
296 me hasnt pool
297 he map on lost
298 he spoon malt
299 no hes to lamp
300 not help soma
301 on mesh to pal
302 stamp hole no
303 on help most a
304 plan the moos
305 hops to an elm
306 not hope alms
307 he map no lost
308 also then mop
309 she lot on map
310 on ample shot
311 no mesh to pal
312 me hop talons
313 a help most no
314 man hope slot
315 on hop melts a
316 so phone malt
317 he slot an pom
318 man those pol
319 sop to an helm
320 ample shot no
321 so lot an hemp
322 means hop lot
323 lam the on ops
324 phones to lam
325 me pal on shot
326 mean posh lot
327 no hop melts a
328 me oohs plant
329 lam the no ops
330 a lope months
331 me pal no shot
332 too help mans
333 mon helps to a
334 mans the pool
335 on ohm slept a
336 men shoot pal
337 the on mos pal
338 an motel shop
339 top son helm a
340 atom help son
341 no ohm slept a
342 sat help moon
343 them slop on a
344 hot one palms
345 so top an helm
346 he stamp loon
347 so help an mot
348 helps to moan
349 an let hop mos
350 not hole maps
351 on hem to slap
352 so mental hop
353 no hem to slap
354 hot one lamps
355 on hop smelt a
356 son map hotel
357 he palm to nos
358 man help soot
359 me nosh to pal
360 stole hop man
361 no hop smelt a
362 on map hotels
363 he pots an mol
364 not shoe palm
365 an sol met hop
366 no map hotels
367 he lap most no
368 lam the spoon
369 on helm to spa
370 almost hep no
371 tops no helm a
372 ham open lost
373 an ems hop lot
374 he plots moan
375 an hos mop let
376 soon help mat
377 on elm shop at
378 not homes lap
379 on top has elm
380 on spam hotel
381 he stop on lam
382 not shoe lamp
383 no helm to spa
384 lap the moons
385 the on som lap
386 he opt salmon
387 on hop melt as
388 mean hop lots
389 no elm shop at
390 no spam hotel
391 top no has elm
392 the pol mason
393 he stop no lam
394 amen shop lot
395 he pal to mons
396 he snoop malt
397 on mesh to lap
398 he tampon sol
399 an les hop tom
400 them slap ono
401 no hop melt as
402 pal those mon
403 no mesh to lap
404 so plane moth
405 hot men slop a
406 not posh male
407 on plot mesh a
408 he palm snoot
409 an hes lot mop
410 not hop meals
411 he mop on last
412 mop the salon
413 me lap on shot
414 melon shop at
415 no plot mesh a
416 on helps atom
417 the on sol amp
418 men stop halo
419 he lot on maps
420 top has melon
421 me slap hot no
422 man holes pot
423 me lap no shot
424 mason let hop
425 the on pom las
426 ops man hotel
427 mons help to a
428 men shoot lap
429 on mot helps a
430 atom helps no
431 the no sol amp
432 name hop lots
433 an ops let ohm
434 on map hostel
435 on helm to pas
436 late shop mon
437 on hemp to las
438 shape lot mon
439 the on mos lap
440 not posh meal
441 the no pom las
442 on posh metal
443 no mot helps a
444 soon help tam
445 no helm to pas
446 not hole spam
447 on hem to pals
448 no map hostel
449 no hemp to las
450 photo man les
451 so hop an melt
452 loans the mop
453 he map on lots
454 them span loo
455 he snap to mol
456 metal posh no
457 on helm to sap
458 not shame pol
459 no hem to pals
460 pot has lemon
461 he map no lots
462 me hasnt loop
463 no helm to sap
464 he mop talons
465 on soph melt a
466 names hop lot
467 on meth slop a
468 not hopes lam
469 hep no to slam
470 one host lamp
471 me nosh to lap
472 lop those man
473 on hops melt a
474 me shalt poon
475 no soph melt a
476 she mop talon
477 no meth slop a
478 also then pom
479 on mop the als
480 on halt poems
481 he slop an mot
482 moat help son
483 so pan the mol
484 not hop males
485 she pal on tom
486 lam the snoop
487 on palm to she
488 moan let shop
489 no hops melt a
490 them sop loan
491 on mop let ash
492 mash open lot
493 the on pol mas
494 on poles math
495 she pal no tom
496 moans the pol
497 me lop an tosh
498 an homes plot
499 he lap to mons
500 he plot soman

### lucianpiane:people

input: Lucian Piane
category: people
phrases 1 to 500 of 500

1 i cleanup ani
2 i pain an clue
3 i lie an up can
4 nuclei pain a
5 i alien an cup
6 i up an in lace
7 can pain lieu
8 i plain an cue
9 an in a up lice
10 up alien cain
11 an nail up ice
12 i can an up lei
13 ain alien cup
14 an a ice lupin
15 an in a lie cup
16 a lineup cain
17 i pain an luce
18 i pal an in cue
19 a clue panini
20 up a nail nice
21 i cup an in ale
22 panic an lieu
23 ain lie up can
24 i cup an in lea
25 ain plain cue
26 an up ain lice
27 an up a ice lin
28 ice pain luna
29 in a pain clue
30 i lap an in cue
31 nice ain pula
32 an lie up cain
33 an in a cup lei
34 nice liana up
35 i aline an cup
36 i up in clean a
37 ain pain clue
38 in a alien cup
39 an in a cue lip
40 cue nail pain
41 i ace an lupin
42 i up line can a
43 up aline cain
44 i cleanup in a
45 i up an ace lin
46 nice lanai up
47 an ail up nice
48 an in a lie cpu
49 ace ain lupin
50 i alien an cpu
51 an up a ice nil
52 epic ain luna
53 an in clue pia
54 i up an ace nil
55 ice pain ulna
56 ain a cup line
57 i up in lance a
58 ain alien cpu
59 up a lain nice
60 i cue an in alp
61 ain pia uncle
62 i up ain clean
63 i up in can ale
64 ana ice lupin
65 an in cap lieu
66 i up in can lea
67 clue pain ani
68 ain in up lace
69 i up lien can a
70 an pia nuclei
71 an pula ice in
72 i plan in cue a
73 ain pain luce
74 in a plain cue
75 i lean in cup a
76 cup alien ani
77 an anil up ice
78 i pan in clue a
79 cue lain pain
80 i nail an puce
81 i nap in clue a
82 nina clue pia
83 in a pain luce
84 up in a lie can
85 epic ain ulna
86 nice a up anil
87 i pun a lie can
88 anna ice puli
89 in ala up nice
90 i up lin cane a
91 anil pain cue
92 an in cue pail
93 i up inn lace a
94 lieu cap nina
95 ain lei up can
96 i pun in lace a
97 ain aline cup
98 i cane an puli
99 an a i cup line
100 pula ice nina
101 anal in up ice
102 up in lei can a
103 canine a puli
104 in a aline cup
105 i lie a cup nan
106 nina cue pail
107 up in nail ace
108 i up nil cane a
109 nice pia luna
110 in lupin ace a
111 i pun lei can a
112 cue plain ani
113 ain a up cline
114 i pal nun ice a
115 luce pain ani
116 an lei up cain
117 i lie nun cap a
118 liana pun ice
119 i up ain lance
120 i up an a cline
121 cain pan lieu
122 an nice a puli
123 i lap nun ice a
124 cain nap lieu
125 an in ace puli
126 i pal inn cue a
127 liana pin cue
128 an ain lie cup
129 an a i pin clue
130 canine ail up
131 i aline an cpu
132 i lap inn cue a
133 pia annul ice
134 i up anal nice
135 i pan a cue lin
136 i ain cleanup
137 in a alien cpu
138 i nap a cue lin
139 ain nail puce
140 up ani lie can
141 i up in ane lac
142 nice puli ana
143 an ani up lice
144 an a i nip clue
145 lanai pun ice
146 i lain an puce
147 up lin in ace a
148 cup aline ani
149 i lineup a can
150 an a i cup lien
151 in liana puce
152 i pain a uncle
153 i pun lin ace a
154 lanai pin cue
155 in ana up lice
156 i pan a cue nil
157 nice pia ulna
158 an ani lie cup
159 an a i pin luce
160 in lanai puce
161 in a nail puce
162 i nap a cue nil
163 liana nip cue
164 up lain an ice
165 in a i cup lane
166 cpu alien ani
167 in ale up cain
168 up nil in ace a
169 lanai nip cue
170 ain in cup ale
171 i pun nil ace a
172 naan ice puli
173 in lea up cain
174 an a i nip luce
175 ain aline cpu
176 up in lain ace
177 nine a i up lac
178 nice ani pula
179 ain in cup lea
180 in a i pan luce
181 puce nail ani
182 ain a cup lien
183 in a i nap luce
184 i annual epic
185 in puli cane a
186 in a i cup elan
187 ain puce lain
188 in anil up ace
189 in a i lean cpu
190 ain puli acne
191 i pace in luna
192 lice i pun an a
193 ace nina puli
194 i plan ain cue
195 an in a lei cpu
196 cap ail ennui
197 i up clean ani
198 alec i up an in
199 puce ail nina
200 i cup ain lane
201 ane lin i cup a
202 ace ani lupin
203 i lace up nina
204 ane nil i cup a
205 ain anil puce
206 ain lin up ace
207 i up lin a acne
208 puli cane ani
209 in ani up lace
210 i up cal nine a
211 epic ani luna
212 i clue in napa
213 i up nil a acne
214 cane ain puli
215 in a aline cpu
216 i cup inn a ale
217 iliac ape nun
218 up in ail cane
219 i cup inn a lea
220 cpu aline ani
221 an ain lei cup
222 i lie nun a pac
223 iliac ane pun
224 i lean ain cup
225 i ace nun lip a
226 iliac pea nun
227 in a lain puce
228 i cup a nan lei
229 puce lain ani
230 ain a pun lice
231 i pun alec in a
232 unclean pia i
233 an ain lip cue
234 i cue a nan lip
235 epic ani ulna
236 i pan ain clue
237 i cap nun lei a
238 pac ail ennui
239 an in pia luce
240 i lie a nan cpu
241 piu ain clean
242 an ain lie cpu
243 i cap lune in a
244 canine pula i
245 i nap ain clue
246 lice i up nan a
247 luce panini a
248 up lei can ani
249 i ice nun a alp
250 ane puli cain
251 up ana ice lin
252 i up an ain cel
253 pina ain clue
254 can alien i up
255 cel i up an ani
256 i cleanup nai
257 an pia cue lin
258 i up cal ane in
259 cup inane ail
260 an in lieu pac
261 i cue inn a alp
262 liane up cain
263 an ani cup lei
264 i up cel in ana
265 liane ain cup
266 i pace in ulna
267 an in ale cpu i
268 linea up cain
269 ain nil up ace
270 an in lea cpu i
271 linea ain cup
272 i lance up ani
273 i up nae in lac
274 piu ain lance
275 an ani cue lip
276 i up inn alec a
277 inane ail cpu
278 in ana cup lei
279 in a cel up ani
280 piu anal nice
281 up in ail acne
282 i pun cel ain a
283 cain luna pie
284 an ani lie cpu
285 i up a cel nina
286 cine up liana
287 in ana cue lip
288 lin nae i cup a
289 pina ain luce
290 nice a pun ail
291 cel up ain a in
292 nice nail pau
293 i cane in pula
294 ace a linn i up
295 uncle ani pia
296 i cane up anil
297 nil nae i cup a
298 cine up lanai
299 up ana ice nil
300 i ail nun pec a
301 pic lieu anna
302 ain in cue alp
303 i pun a cel ani
304 pau ain cline
305 an pia cue nil
306 nae cal i up in
307 can alien piu
308 i can pie luna
309 an in a piu cel
310 cain ulna pie
311 up ala ice inn
312 i pec in a luna
313 luce pia nina
314 in ani pal cue
315 i lune in a pac
316 liane ain cpu
317 i cane lupin a
318 an a i lune pic
319 linea ain cpu
320 i pan ain luce
321 i pec in a ulna
322 pac nina lieu
323 in ani cup ale
324 i in a lane cpu
325 lune ain pica
326 i nap ain luce
327 nai cel in up a
328 cine ain pula
329 in ani cup lea
330 i in a elan cpu
331 nuclei pina a
332 i cup ain elan
333 cpu line i an a
334 i paan nuclei
335 in ala pun ice
336 nai cel i pun a
337 can pina lieu
338 i lie anna cup
339 i up an nai cel
340 incline pau a
341 i up lane cain
342 i pau cel an in
343 nice anil pau
344 puce ail an in
345 puce lin i an a
346 clue pain nai
347 i pun ain lace
348 cpu lien i an a
349 cup alien nai
350 i cup nine ala
351 puce nil i an a
352 can aline piu
353 in ani lap cue
354 i ane lin a cpu
355 clean ani piu
356 can aline i up
357 i ane nil a cpu
358 pica nan lieu
359 an ain lei cpu
360 i cal nun pie a
361 nuance pail i
362 i lean ain cpu
363 i nae lin a cpu
364 uncle nai pia
365 i up inane lac
366 i cel nun a pia
367 cain pau line
368 up nan ail ice
369 i nae nil a cpu
370 nice lain pau
371 i pun nice ala
372 cpu ale a inn i
373 pic lieu naan
374 i cup ana line
375 cpu lea a inn i
376 ice pina luna
377 i pan lieu can
378 i pau cel inn a
379 lac pia ennui
380 up lin ace ani
381 lac a pie i nun
382 cue plain nai
383 i nap lieu can
384 i piu cel a nan
385 pic ennui ala
386 epic nun ail a
387 pic ale a i nun
388 luce pain nai
389 clue pin ain a
390 pic lea a i nun
391 nice nai pula
392 i pun anal ice
393 pac a lei i nun
394 cue nail pina
395 i can pie ulna
396 cpu lei i nan a
397 panic eau lin
398 pin lieu can a
399 acne ani puli
400 i cup lean ani
401 piu inane lac
402 i pin anal cue
403 clip eau nina
404 i can ane puli
405 cup aline nai
406 i nail ane cup
407 ace nai lupin
408 nine a ail cpu
409 puce anil ani
410 i clap ennui a
411 lice piu anna
412 up inn ail ace
413 cue pili anna
414 ice ail an pun
415 cane nail piu
416 cue pal ain in
417 epic nai luna
418 cup lie in ana
419 ice pina ulna
420 line up a cain
421 cpu alien nai
422 cue ail an pin
423 panic eau nil
424 i up ana cline
425 clue pina ani
426 ane in ail cup
427 cain lean piu
428 clue nip ain a
429 nuclei i napa
430 up nil ace ani
431 canna lie piu
432 nip lieu can a
433 cup liane ani
434 nice in pula a
435 cue lain pina
436 cue lap ain in
437 inane culpa i
438 i nip anal cue
439 acne nail piu
440 i in anal puce
441 cup linea ani
442 lice i up anna
443 puce nail nai
444 i pal nina cue
445 epic nai ulna
446 i cup anna lei
447 ice puli nana
448 cane nail i up
449 cane lain piu
450 i pan luna ice
451 cain pau lien
452 i cup nina ale
453 cane nai puli
454 cue lin pain a
455 nuance a pili
456 i pin ana clue
457 cline piu ana
458 i cup nina lea
459 lace nina piu
460 i nap luna ice
461 luce pina ani
462 i cue anna lip
463 cpu aline nai
464 i up elan cain
465 cain nae puli
466 cue ail an nip
467 acne lain piu
468 an nice pula i
469 iliac nae pun
470 i lie anna cpu
471 puce lain nai
472 luce pin ain a
473 acne nai puli
474 in ani cue alp
475 lice piu naan
476 i lain ane cup
477 nice piu alan
478 i up lei canna
479 cue pili naan
480 i lap nina cue
481 nance ail piu
482 i pan nail cue
483 cue anil pina
484 i up anil acne
485 lance ani piu
486 cain lean i up
487 cal pia ennui
488 i nap nail cue
489 cpu liane ani
490 i lie naan cup
491 piu alec nina
492 epic in luna a
493 cpu linea ani
494 a up nina lice
495 cine pia luna
496 i pun ace anil
497 cane anil piu
498 nuclei i pan a
499 lice nina pau
500 canna lie i up

### kategosselin:people

input: Kate Gosselin
category: people
phrases 1 to 500 of 500

1 onstage likes
2 its gone lakes
3 an let go skies
4 i get an less ok
5 legion stakes
6 its gone leaks
7 an set go likes
8 i set an ok legs
9 legion steaks
10 so see talking
11 its one ask leg
12 i set an ok gels
13 takes legions
14 its alone kegs
15 on likes gets a
16 i get on ask les
17 stake legions
18 so take single
19 no likes gets a
20 i get no ask les
21 skates legion
22 its ago kneels
23 gone kiss let a
24 it gel an ok ess
25 skate legions
26 its keen goals
27 kiss to an glee
28 i set on ask leg
29 soaking steel
30 so seeing talk
31 i stokes an leg
32 i set no ask leg
33 goat likeness
34 so like agents
35 i snake to legs
36 in keg to less a
37 steak legions
38 it goes ankles
39 an ok gets lies
40 i let ken go ass
41 soak gentiles
42 i gas skeleton
43 in legs to sake
44 i let as on kegs
45 toenails kegs
46 i goes anklets
47 i glass to knee
48 i let as no kegs
49 soaking sleet
50 lot see asking
51 i sneak to legs
52 i ask so ten leg
53 altos seeking
54 i stokes angel
55 i keen to glass
56 i let so ask gen
57 soaks gentile
58 single to sake
59 in let go sakes
60 i ok as sent leg
61 lease stoking
62 alone get kiss
63 an ok get isles
64 i to an less keg
65 toga likeness
66 on like stages
67 i snakes to leg
68 an let so is keg
69 sealing stoke
70 stages like no
71 it seek an logs
72 i let so gas ken
73 ankles egoist
74 stage like son
75 on set like gas
76 i ok as ten legs
77 latinos geeks
78 a got likeness
79 no set like gas
80 i go sen ask let
81 oaks gentiles
82 i stokes angle
83 its no ask glee
84 i gets as on elk
85 soaking stele
86 not like gases
87 ok set single a
88 i gets as no elk
89 gasket lesion
90 last seeing ok
91 an stole is keg
92 i lets ken go as
93 easel stoking
94 seat like song
95 on geek is last
96 i get on ask els
97 lotsa seeking
98 it seek slogan
99 last geek is no
100 i get no ask els
101 genial stokes
102 gates like son
103 on kiss let age
104 i set on ask gel
105 tangos selkie
106 so likes agent
107 it goes an elks
108 i set no ask gel
109 leasing stoke
110 on likes stage
111 it seeks an log
112 i go ten ask les
113 east like song
114 lies to an kegs
115 i net so ask leg
116 stage likes no
117 its one ask gel
118 sen to i ask leg
119 at go likeness
120 in leg to sakes
121 i gets as on lek
122 it seeks logan
123 ok lines gets a
124 i ok legs net as
125 seek to signal
126 a long its seek
127 i ok glen sets a
128 i knots eagles
129 ten likes go as
130 i gets as no lek
131 its sneak loge
132 i stokes an gel
133 i ok leg nest as
134 i stoke angels
135 an toke is legs
136 i ask so ten gel
137 gas like stone
138 last gene is ok
139 i lets as on keg
140 not like sages
141 in lets go sake
142 i ok sent gel as
143 song take lies
144 on leg is stake
145 i lets as no keg
146 tea like songs
147 ok set is angel
148 i ok gen let ass
149 skies to angel
150 long kit see as
151 i see on tsk gal
152 late gone kiss
153 ok line get ass
154 ken to legs is a
155 not likes ages
156 one leg kiss at
157 i see no tsk gal
158 lines got sake
159 i sneaks to leg
160 i seen log tsk a
161 not kiss eagle
162 silks to an gee
163 i go as ten elks
164 on likes gates
165 an ok gets isle
166 les to i ask gen
167 songs take lie
168 on leg is steak
169 i nest elks go a
170 eats like song
171 one keg is last
172 a get lens is ok
173 gas like notes
174 no leg is steak
175 i ok leg nets as
176 gates likes no
177 an leg sites ok
178 ken to i gel ass
179 ages listen ok
180 like gen to ass
181 i go net ask les
182 i gentle soaks
183 its ok seen gal
184 les to i gas ken
185 ok less eating
186 its ken go sale
187 i let sen ok gas
188 eels to asking
189 lee stinks go a
190 on is kegs let a
191 ate like songs
192 i slag to knees
193 no is kegs let a
194 skin to eagles
195 one leg is task
196 i set ken go las
197 legs into sake
198 lee kings to as
199 i set on gas elk
200 so leaking set
201 long ski see at
202 i let so sag ken
203 seat single ok
204 on gee is talks
205 i set no gas elk
206 ago likes sent
207 long kits see a
208 else tsk in go a
209 gate like sons
210 it slog an seek
211 i net so ask gel
212 it loans geeks
213 lost in ask gee
214 i see on tsk lag
215 line go stakes
216 no gee is talks
217 i go ten ask els
218 i sag skeleton
219 its ken go seal
220 sen to i ask gel
221 i stoke angles
222 i seek to slang
223 i tsk on lee gas
224 lie got snakes
225 i slots an geek
226 i see no tsk lag
227 line got sakes
228 lee king to ass
229 i sets ken log a
230 skies to angle
231 its no seek gal
232 i ok leg net ass
233 late goes skin
234 on keg is least
235 i tsk no lee gas
236 lies got snake
237 i go last knees
238 i gas so ten elk
239 king to leases
240 in set go lakes
241 i tsk one gels a
242 stags like one
243 least keg is no
244 i ok nest gel as
245 east single ok
246 gone skis let a
247 let is kens go a
248 sake get lions
249 skis to an glee
250 an elk is so get
251 lines go stake
252 i gel to snakes
253 so in keg let as
254 it ogle snakes
255 in legs ok seat
256 i ok sen get las
257 song eat likes
258 on gees is talk
259 i nets elks go a
260 line go steaks
261 on silk get sea
262 i ok ten gels as
263 alone get skis
264 no silk get sea
265 son is keg let a
266 lines go steak
267 in sets go lake
268 i tsk gen lose a
269 seat lose king
270 i takes on legs
271 i ok ten gel ass
272 seeking to las
273 else got an ski
274 kens to i gels a
275 song takes lie
276 i takes no legs
277 i ok ten gas les
278 lost seeking a
279 long skit see a
280 i net elks go as
281 ago like nests
282 it ask one legs
283 i set on gas lek
284 kings to lease
285 in legs ok east
286 lets is ken go a
287 not likes sage
288 on leg is skate
289 i set no gas lek
290 else ago stink
291 as go its kneel
292 i set so lag ken
293 line go skates
294 in seek to gals
295 i tsk on age les
296 long site sake
297 i kneels to gas
298 i ok tens gel as
299 long eat skies
300 in les got sake
301 i set kens log a
302 snakes get oil
303 ok sign let sea
304 i tsk no age les
305 salt seeing ok
306 isles to an keg
307 i set ken go als
308 aliens gets ok
309 like sen to gas
310 ok in leg set as
311 so taking eels
312 its no keel gas
313 ok in les gets a
314 so talk genies
315 on sis get lake
316 i net elk go ass
317 i kneels goats
318 on kiss get ale
319 i gas so ten lek
320 sage listen ok
321 an gee lists ok
322 an lek is so get
323 along sit seek
324 on leg skies at
325 i ok nets gel as
326 lees to asking
327 on kiss eat leg
328 els to i ask gen
329 sink to eagles
330 no sis get lake
331 ok leg is ten as
332 east lose king
333 in seek to slag
334 i go net ask els
335 else ok giants
336 one legs is kat
337 els to i gas ken
338 tags like ones
339 its lee ok sang
340 i set les go kan
341 lines ok stage
342 ok let sing sea
343 i tsk on gel sea
344 son talk siege
345 in legs stoke a
346 les is ken got a
347 gate likes son
348 no kiss get ale
349 i net so gas elk
350 snake get soil
351 an gee ski lost
352 on is keg lets a
353 stag like ones
354 no leg skies at
355 i tsk on gee las
356 ages like tons
357 sleek in to gas
358 a get ken is sol
359 alike get sons
360 on kiss get lea
361 no is keg lets a
362 alike gets son
363 late kegs is no
364 i ok sen get als
365 so ask gentile
366 net likes go as
367 sen to i gas elk
368 gasket lose in
369 ok sling see at
370 i set so nag elk
371 along is skeet
372 no kiss get lea
373 i ok net gels as
374 late goes sink
375 ok gin see last
376 ken let sis go a
377 so lee skating
378 i sleek to sang
379 so in keg lets a
380 lost ease king
381 on leg sit sake
382 i ok net gel ass
383 glass kite one
384 on sis take leg
385 i set so gel kan
386 task goes line
387 its lens ok age
388 i ok gen set las
389 lease got skin
390 an elk go sites
391 i tsk on gas eel
392 seeking slot a
393 kin let goes as
394 i net les ok gas
395 less go intake
396 its sen go lake
397 i tsk no gas eel
398 sail got knees
399 on keg is steal
400 i set elk snog a
401 agent like sos
402 its ok seen lag
403 elk set in go as
404 skins to eagle
405 its on leg sake
406 i net lek go ass
407 sneak get soil
408 no leg sit sake
409 i tsk so lee nag
410 stink see goal
411 no sis take leg
412 i set les ok nag
413 nails got seek
414 lost skin gee a
415 so is kent gel a
416 it snakes loge
417 long kit sees a
418 an set is elk go
419 tea likes song
420 on tie ask legs
421 i set sen ok gal
422 ago list knees
423 on glee kiss at
424 ten is elks go a
425 so stink eagle
426 its one gas elk
427 les to i sag ken
428 eats single ok
429 its glen ok sea
430 i let sen ok sag
431 loan get skies
432 in keg to sales
433 ken to gels is a
434 sang like toes
435 its no leg sake
436 i tsk gen sole a
437 as goes tinkle
438 isle to an kegs
439 ten is elk go as
440 gas like tones
441 one legs kit as
442 elk sets in go a
443 tails go knees
444 in lots ask gee
445 i set on sag elk
446 lines go skate
447 no glee kiss at
448 i let ess ok nag
449 tags like nose
450 in log see task
451 on tsk glee is a
452 teas like song
453 on list ask gee
454 i so lets an keg
455 tags likes one
456 on site ask leg
457 i set so gan elk
458 agents lies ok
459 i asks gone let
460 i set no sag elk
461 eagle is knots
462 on elk is stage
463 i ok ten gas els
464 sinks to eagle
465 in seeks to gal
466 no tsk glee is a
467 sakes get lion
468 on geek is salt
469 i net so gas lek
470 song take isle
471 its no seal keg
472 on ski leg set a
473 stag like nose
474 ok genes list a
475 sen to i gas lek
476 stag likes one
477 sole king set a
478 i set so nag lek
479 long ties sake
480 an kos get lies
481 glee tsk so in a
482 lost ask genie
483 on geek list as
484 no ski leg set a
485 soak get lines
486 lee stink go as
487 ok leg is net as
488 least gone ski
489 in leeks to gas
490 i ok sen gels at
491 long skies tea
492 salt geek is no
493 less ken it go a
494 alone gets ski
495 in leg ok seats
496 so ink leg set a
497 along see kits
498 its no seek lag
499 set is ken log a
500 goes its ankle

### kaceymusgraves:people

input: Kacey Musgraves
category: people
phrases 1 to 500 of 500

1 my average sucks
2 my are gave sucks
3 my sure veg sack a
4 my savage sucker
5 my a gave suckers
6 my sec rusk gave a
7 me suck savagery
8 my as gave sucker
9 us gave my sec ark
10 scarves make guy
11 us gave my creaks
12 my sage a rev suck
13 suckers gave may
14 us cake my graves
15 me gas very suck a
16 my averages suck
17 us grave my cakes
18 my sear a suck veg
19 curves makes gay
20 my ears gave suck
21 my a ever gas suck
22 makers guys cave
23 very a game sucks
24 us ask me gave cry
25 maker guys caves
26 my a suck greaves
27 us sky me gave car
28 sack game survey
29 my ear gave sucks
30 me revs a guy sack
31 scurvy game sake
32 my use grave sack
33 me sag very suck a
34 scum average sky
35 my gear save suck
36 me rev a guys sack
37 very smack usage
38 my age ask curves
39 me sky a gas curve
40 curves make gays
41 my arse gave suck
42 my are as suck veg
43 makers guy caves
44 very a guess mack
45 my a ever sag suck
46 may suck greaves
47 my sea grave suck
48 my a as curves keg
49 my agave suckers
50 my use gave racks
51 me revs a suck gay
52 smack age survey
53 my rage save suck
54 my a as curve kegs
55 very cakes magus
56 my era gave sucks
57 us sky me gave arc
58 easy muck graves
59 very a games suck
60 me rev a guy sacks
61 curve makes gays
62 my ages ask curve
63 us keys a game vcr
64 sucker gave yams
65 my rusk gave case
66 me rev a sucks gay
67 smack averse guy
68 very as game suck
69 us makes a cry veg
70 musky grave case
71 gave my sure sack
72 me rev as guy sack
73 sucker gave mays
74 my ark guess cave
75 us make as cry veg
76 mercy guess kava
77 my uses gave rack
78 me sky rug caves a
79 muck ravages yes
80 my surge ask cave
81 me ask sea guy vcr
82 cage mask survey
83 my graves ask cue
84 me sky as gave cur
85 eyes muck vargas
86 my sake gas curve
87 us key a games vcr
88 sucks verge maya
89 my ares gave suck
90 me revs a guy cask
91 suckers gave yam
92 my urges ask cave
93 me sky rugs cave a
94 greaves say muck
95 my urge ask caves
96 us sky a verge mac
97 cues makes gravy
98 my urge save sack
99 me ray a sucks veg
100 very amuck gases
101 my grave ask cues
102 my veg as ask cure
103 scurvy ages make
104 my sera gave suck
105 me sky rug cave as
106 curvy game sakes
107 my user gave sack
108 us say me rack veg
109 scurvy age makes
110 my sage ask curve
111 my rev as age suck
112 mack ages survey
113 my sue grave sack
114 me use gay ask vcr
115 cask game survey
116 my age asks curve
117 us revs gym cake a
118 mack age surveys
119 my rug save cakes
120 me rev a guys cask
121 mags survey cake
122 my rugs save cake
123 us key as game vcr
124 muck grave essay
125 my ruse gave sack
126 me rev as gay suck
127 scum ravages key
128 my rave age sucks
129 us sky a verge cam
130 amuck says verge
131 my sue gave racks
132 us sky me rag cave
133 murky cases gave
134 my use grave cask
135 my eve as rag suck
136 muck gave sayers
137 my grave asks cue
138 me rev a guy casks
139 scum ravage keys
140 my var guess cake
141 us sky veg cream a
142 messy vague rack
143 my eras gave suck
144 very a as suck meg
145 very amuck sages
146 my rue gave sacks
147 us sky meg carve a
148 curves games yak
149 my vase gear suck
150 my a are sucks veg
151 scurvy sage make
152 my saver age suck
153 us sky germ cave a
154 murky savage sec
155 my urge asks cave
156 me grey a suck vas
157 scrum savage key
158 my rug caves sake
159 us sky meg crave a
160 sage survey mack
161 my vase rage suck
162 me rev a suck gays
163 curves game yaks
164 my raves age suck
165 us verge my a sack
166 smack sugary eve
167 my area sucks veg
168 us grey me ask vac
169 amuck graves yes
170 my rusk save cage
171 my eve as sack rug
172 smack suave grey
173 my rug saves cake
174 me sky a sag curve
175 suck verges maya
176 my rave ages suck
177 me ray as suck veg
178 vague mercy asks
179 my vas agree suck
180 my veg as use rack
181 gassy curve make
182 my rugs cave sake
183 very a as suck gem
184 every magus sack
185 gave my sure cask
186 us rev me sack gay
187 mucky vargas see
188 my sakes gave cur
189 us sky gem carve a
190 amuck say verges
191 my aga serve suck
192 me rays a suck veg
193 cum averages sky
194 very age ask scum
195 us sky gem crave a
196 gravy muses cake
197 my veg ask saucer
198 us veer gym sack a
199 gravy muse cakes
200 my rug cave sakes
201 us sky me cave gar
202 mucky grave seas
203 every a suck mags
204 me rev as guy cask
205 curvy ages makes
206 my ages save ruck
207 us ask may gee vcr
208 mag survey cakes
209 game a sky curves
210 my eve as suck gar
211 musky cares gave
212 every a sucks mag
213 us rev gym cakes a
214 curve games yaks
215 very a mugs cakes
216 my ear as suck veg
217 musky grace save
218 my age aver sucks
219 my keg as sure vac
220 keys carve magus
221 grave yes muck as
222 me ask var guy sec
223 musky scare gave
224 my sues gave rack
225 me sky a surge vac
226 mag surveys cake
227 my urge save cask
228 us key veg scram a
229 curvy games sake
230 my rake gave cuss
231 me sue gay ask vcr
232 greasy muck save
233 grave a keys scum
234 sec very gum ask a
235 sucks verge yama
236 my vas age sucker
237 me says a ruck veg
238 averse guys mack
239 ever suck my saga
240 us rev gym cake as
241 keys crave magus
242 very a gums cakes
243 us ray me sack veg
244 cum ravages keys
245 every a gum sacks
246 my veg us ask care
247 gams survey cake
248 my user gave cask
249 me rev guy ask sac
250 curvy gases make
251 every a mugs sack
252 my keg us save car
253 ever mucky sagas
254 my rusk gave aces
255 me sky a urges vac
256 every gauss mack
257 my areas suck veg
258 us sky me gear vac
259 amuck gay verses
260 my sue grave cask
261 sec very mug ask a
262 musk cease gravy
263 my seas gave ruck
264 me say as ruck veg
265 murky sage caves
266 my sage rave suck
267 my a revs age suck
268 key craves magus
269 my vase urge sack
270 my eve as gas ruck
271 make guys craves
272 every a mug sacks
273 very a as scum keg
274 muck savages rye
275 sec guy save mark
276 my era as suck veg
277 amuck saves grey
278 my seek sugar vac
279 my a ask veg curse
280 maya curves kegs
281 every a gums sack
282 my keg as save cur
283 musky grave aces
284 my rusk age caves
285 us sky me rage vac
286 makes guys carve
287 my eve sack argus
288 a seem guy ask vcr
289 curvy sage makes
290 every as gas muck
291 me say veg ask cur
292 musky ace graves
293 my rue gave casks
294 us vary me ask ecg
295 murky cages save
296 very as ages muck
297 us sky me cage var
298 gam survey cakes
299 every as gum sack
300 my veg us creaks a
301 revue smack gays
302 my guess rake vac
303 my res a gave suck
304 musky races gave
305 very a gases muck
306 us ask eve cry mag
307 amuck save greys
308 my rug cakes vase
309 a see mask guy vcr
310 gam surveys cake
311 my ruse gave cask
312 me sky as urge vac
313 makes guys crave
314 my sake sag curve
315 my a rev age sucks
316 yam suck greaves
317 me say grave suck
318 my ers a gave suck
319 musky acres gave
320 my rusk ages cave
321 us keys veg cram a
322 curvy sages make
323 game as sky curve
324 my veg us sack are
325 mucky greaves as
326 my rug cake vases
327 my veg as sue rack
328 averse mucky gas
329 my rugs cake vase
330 us sky a merge vac
331 every sagas muck
332 my sage save ruck
333 my a veer gas suck
334 scream vague sky
335 every as mug sack
336 us key me rags vac
337 scary mauve kegs
338 key a scum graves
339 us rev gyms cake a
340 scums ravage key
341 my ages aver suck
342 my kegs us carve a
343 key carves magus
344 very ass gum cake
345 us verge my a cask
346 scurvy games kea
347 my saga veer suck
348 my eve a rag sucks
349 mucky gears save
350 every a sucks gam
351 us ask eve arc gym
352 mucky graves sea
353 my vas suck eager
354 my use veg ask car
355 make guys carves
356 sack sugar my eve
357 us keys me rag vac
358 creaky sums gave
359 ever sucks my aga
360 my eve a rags suck
361 greaves yak scum
362 my aga verse suck
363 my keg us craves a
364 gamey curves ask
365 my age saves ruck
366 my kegs us crave a
367 amuck grassy eve
368 grave yes ask cum
369 my veg us ask race
370 makes guy craves
371 my eve sucks agar
372 my rug as seek vac
373 gravy eases muck
374 every as suck mag
375 us yak me ages vcr
376 smack vary segue
377 very ass mug cake
378 us yaks me age vcr
379 amuck gay serves
380 us game very sack
381 my rev us ask cage
382 crevasse yak gum
383 very musk cages a
384 me guy res ask vac
385 murky ages caves
386 key as grave scum
387 my a rev ages suck
388 suck verges yama
389 every a suck gams
390 my veg as rue sack
391 murky cage saves
392 very ass age muck
393 us ask eve cry gam
394 every magus cask
395 rum yes gave sack
396 my a ass curve keg
397 smug creaky vase
398 my sake surge vac
399 my keg us carve as
400 saucy mask verge
401 very geum sacks a
402 me guy ers ask vac
403 mucky arses gave
404 my vas surge cake
405 my use ask age vcr
406 creaky mugs save
407 very as muck sage
408 us sky rev age mac
409 crevasse yak mug
410 my eve rack gauss
411 vcr guess me yak a
412 mucky savage res
413 every gas ask cum
414 suck verge my as a
415 muck verge assay
416 gave my sear suck
417 me vary a cuss keg
418 meek scurvy saga
419 very a sages muck
420 my sake us age vcr
421 creaky gums save
422 very ages ask cum
423 us key veg cram as
424 mucky savage ers
425 my veg causes ark
426 my keg us crave as
427 mucky rages save
428 rum sky gave case
429 us rev key gas mac
430 agave keys scrum
431 my rusk cave sage
432 me use yak gas vcr
433 kava rescues gym
434 same sake guy vcr
435 my a ears suck veg
436 kava rescue gyms
437 my sake urges vac
438 vcr game a use sky
439 musky sec ravage
440 my vas urges cake
441 us rev gym ask ace
442 musky vase grace
443 my eaves rag suck
444 my vas as cure keg
445 grey mauve casks
446 my varus gee sack
447 my eve us gas rack
448 mucky sage saver
449 every a gum casks
450 a sky as curve meg
451 murky gases cave
452 very geum sack as
453 ever sky a gas cum
454 mucky gear saves
455 my rusk cage vase
456 us ask may rev ecg
457 mucky saga serve
458 my kegs cause var
459 my keg us carves a
460 amuck gravy sees
461 my aga sever suck
462 us sky eve rag mac
463 scarves yak geum
464 my aga veer sucks
465 us rev keg say mac
466 amuck gays serve
467 my sage aver suck
468 me use sky rag vac
469 makes guy carves
470 my gauss rev cake
471 my a ask veg cures
472 scram vague keys
473 gay a serves muck
474 my eve a sucks gar
475 creaky muss gave
476 us age very smack
477 us sky rev age cam
478 mucky sage raves
479 smug key save car
480 us rev my gas cake
481 scum geyser kava
482 every a mug casks
483 my a ear sucks veg
484 mucky rage saves
485 mucky a serve gas
486 my sea as ruck veg
487 kava secures gym
488 my usage rev sack
489 us eye mag ask vcr
490 musky gear caves
491 key a gum scarves
492 us yak me scar veg
493 yama curves kegs
494 smug are sky cave
495 a arm yes suck veg
496 musky age craves
497 my vas urge cakes
498 my eve rug sacks a
499 musky ages carve
500 us came grave sky
