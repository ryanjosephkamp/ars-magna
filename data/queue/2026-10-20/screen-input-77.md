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

## File 77 of 95: 2579 phrases

### leiferikson:people

input: Leif Erikson
category: people
phrases 1 to 500 of 500

1 foreskin lie
2 i knife loser
3 i is for kneel
4 i is ern of elk
5 refine kilos
6 fire like son
7 i see for link
8 i is ern of lek
9 foreskin lei
10 on like fires
11 i is of kernel
12 i is ern ok elf
13 felonies irk
14 fires like no
15 i like for sen
16 i is ken or elf
17 reliefs oink
18 i knife roles
19 i kneel of sir
20 on elk i is ref
21 reliefs kino
22 on like fries
23 i sleek for in
24 no elk i is ref
25 felonies kir
26 fries like no
27 i skin for lee
28 in les i ok ref
29 one risk life
30 like no is ref
31 on lek i is ref
32 on likes fire
33 lee in of risk
34 no lek i is ref
35 fire likes no
36 like in of res
37 in res i ok elf
38 like of siren
39 like in of ers
40 i is elk or fen
41 role is knife
42 i see for kiln
43 in ers i ok elf
44 siren ok life
45 i lies for ken
46 i is lek or fen
47 i files krone
48 i sink for lee
49 i ok ern if les
50 i seek florin
51 in sir of keel
52 in els i ok ref
53 i knifes role
54 i risk on feel
55 i ok ern if els
56 lines ok fire
57 i risk no feel
58 in res elk of i
59 firs like one
60 i reel of skin
61 i so in elk ref
62 like of rinse
63 i seek for lin
64 in ers elk of i
65 like of reins
66 in sir of leek
67 in res lek of i
68 i rifles keno
69 i seen for ilk
70 i so in lek ref
71 krone is life
72 in lee is fork
73 in ers lek of i
74 ok risen life
75 i skin for eel
76 i is fer on elk
77 fore likes in
78 lee in of kris
79 i is fer no elk
80 like of resin
81 lee in for ski
82 i ok fer in les
83 line ok fires
84 i reel of sink
85 i if on res elk
86 i frisk leone
87 on elk is fire
88 i if no res elk
89 fire like nos
90 i lies of kern
91 i ok ser in elf
92 rife like son
93 in eel of risk
94 i if on ers elk
95 rein of likes
96 in kor is feel
97 i if no ers elk
98 fin like rose
99 i lie for kens
100 i is fer on lek
101 so knife lire
102 i lie of kerns
103 i is fer no lek
104 life rinse ok
105 i sink for eel
106 i if on res lek
107 line of skier
108 free lin is ok
109 i if no res lek
110 line ok fries
111 in les ok fire
112 i if on ers lek
113 lie of sinker
114 in is for keel
115 i if no ers lek
116 life reins ok
117 i likes of ern
118 les or i if ken
119 ok in reliefs
120 i sin for keel
121 i ok sel in ref
122 fir like ones
123 i seek for nil
124 i ok fer in els
125 on ski relief
126 i feel on kris
127 in elk of i ser
128 relief ski no
129 i leer of skin
130 i fer so in elk
131 so ink relief
132 i link of seer
133 in lek of i ser
134 lore is knife
135 i feel no kris
136 els or i if ken
137 siren ok file
138 in rise of elk
139 sen or i if elk
140 feel oink sir
141 i free on silk
142 i fer so in lek
143 iris of kneel
144 i reeks of lin
145 sen or i if lek
146 fine like ors
147 on lek is fire
148 i ser if on elk
149 so kin relief
150 i free no silk
151 i ser if no elk
152 resin ok life
153 free ilk is no
154 sel if i ok ern
155 like for sine
156 lee sir of ink
157 i ser if on lek
158 frisk lie one
159 i like on serf
160 i ser if no lek
161 rose ink life
162 i like no serf
163 sel fer i ok in
164 one kris life
165 in res ok life
166 ern so i if elk
167 fir like nose
168 in is for leek
169 ern so i if lek
170 fir likes one
171 lee sir of kin
172 sel or i if ken
173 free kilos in
174 in ers ok life
175 fire lose ink
176 i sin for leek
177 kin rose life
178 i reels of ink
179 on rife likes
180 i ink for eels
181 fire lose kin
182 in reel of ski
183 i knifes lore
184 i keen for lis
185 fin like sore
186 i inks for lee
187 fore like sin
188 i reels of kin
189 in reef kilos
190 i leer of sink
191 relief sin ok
192 in sire of elk
193 sir feel kino
194 i riles of ken
195 on file skier
196 i like on refs
197 so liken fire
198 ok line is ref
199 feel ski iron
200 lie is for ken
201 no file skier
202 i like no refs
203 krone is file
204 in eel is fork
205 so rile knife
206 i rinse of elk
207 ore skin life
208 ok lie is fern
209 fine riles ok
210 free nil is ok
211 sore ink life
212 i reins of elk
213 on skier life
214 in rise of lek
215 likes or fine
216 in eel of kris
217 no skier life
218 ok ern is life
219 feel risk ion
220 i flee on risk
221 kin sore life
222 i kern of isle
223 file rinse ok
224 in eel for ski
225 roe skin life
226 i flee no risk
227 file reins ok
228 in lis free ok
229 in files kore
230 i ink for lees
231 ken soil fire
232 i reeks of nil
233 keno is rifle
234 in see for ilk
235 lies for kine
236 i reek of nils
237 so lier knife
238 i keel for ins
239 line risk foe
240 i feel in kors
241 in reefs kilo
242 in sire of lek
243 ore sink life
244 in els ok fire
245 in frees kilo
246 i forks in lee
247 resin ok file
248 i likes on ref
249 one ski flier
250 i risk one elf
251 info risk lee
252 in elk is fore
253 info like res
254 feel ok in sir
255 files rein ok
256 lee is for ink
257 knee foil sir
258 i rinse of lek
259 fin like eros
260 i likes no ref
261 info like ers
262 i reins of lek
263 roe sink life
264 i fire ok lens
265 rife one silk
266 i reel of inks
267 sir file keno
268 in leer of ski
269 free kin soil
270 sir lie of ken
271 ones irk life
272 lee is for kin
273 fee risk lion
274 in res ok file
275 one irk files
276 ok lin is reef
277 fine lie kors
278 in ers ok file
279 fire sole ink
280 i kerns of lei
281 sir keen foil
282 lie is of kern
283 fore lie skin
284 kin eel of sir
285 free skin oil
286 i so like fern
287 ok infer lies
288 i seek in rolf
289 lei of sinker
290 i fire on elks
291 eon risk life
292 i rein of elks
293 fore like ins
294 i else in fork
295 ins ok relief
296 on keel is fir
297 fins like ore
298 in lis of reek
299 feline sir ok
300 i fire no elks
301 fine rose ilk
302 no keel is fir
303 fink lie rose
304 i frisk on lee
305 fire sole kin
306 lee is of rink
307 flies rein ok
308 in leeks for i
309 file one risk
310 i frisk no lee
311 ken oil fires
312 i reef on silk
313 ilk fire ones
314 i inks for eel
315 reef skin oil
316 else irk of in
317 noel ski fire
318 i reef no silk
319 one irk flies
320 on ilk is reef
321 so rifle kine
322 lire is of ken
323 fire one silk
324 i flee on kris
325 rink see foil
326 i sneer of ilk
327 nose irk life
328 in kore is elf
329 one ski lifer
330 one elk is fir
331 rife likes no
332 i feels in kor
333 eros ink life
334 i flee no kris
335 fine lies kor
336 in reis of elk
337 fins like roe
338 in lek is fore
339 ken oil fries
340 i link so free
341 sir keel info
342 i is keen rolf
343 kos fire line
344 i rile of kens
345 lien ok fires
346 on is like ref
347 one frisk lei
348 i fires on elk
349 ore skin file
350 rife elk is no
351 sir flee oink
352 on leek is fir
353 ken oils fire
354 i liken of res
355 oer skin life
356 i fires no elk
357 silo fire ken
358 ok sir fee lin
359 fore lie sink
360 no leek is fir
361 free sink oil
362 i ok free nils
363 relies of ink
364 i liken of ers
365 lies or knife
366 ok sir lie fen
367 lien of skier
368 in ire ok self
369 fir like eons
370 in seer of ilk
371 ion feel kris
372 so in like ref
373 fire nose ilk
374 i fork in eels
375 lien ok fries
376 i irk on feels
377 ref like sion
378 reel is of ink
379 fine role ski
380 i irk no feels
381 keno is flier
382 ok rein is elf
383 kore sin life
384 lei is for ken
385 silk iron fee
386 ok nil is reef
387 fin relies ok
388 in isle ok ref
389 relies of kin
390 reel is of kin
391 roe skin file
392 on sir fee ilk
393 lire ok fines
394 ok lei is fern
395 ref like ions
396 i leer of inks
397 kens oil fire
398 no sir fee ilk
399 seine for ilk
400 i so feel rink
401 reef sink oil
402 one ilk is ref
403 sine ok rifle
404 rife in ok les
405 rife like nos
406 in lis ok reef
407 fine sore ilk
408 ok lin see fir
409 fink lie sore
410 i forks in eel
411 isle for kine
412 one lek is fir
413 serf like ion
414 i so kern life
415 kilo seen fir
416 ok lire is fen
417 feline is kor
418 i like son ref
419 ore sink file
420 in reis of lek
421 finer lies ok
422 eel is for ink
423 fir like sone
424 is of like ern
425 ok senile fir
426 lin is of reek
427 kilo fire sen
428 on ski lie ref
429 sir flee kino
430 i fires on lek
431 foe rise link
432 rife lek is no
433 res oil knife
434 no ski lie ref
435 liken of rise
436 eel is for kin
437 fir oil knees
438 in ire of elks
439 free kin oils
440 i fires no lek
441 neo risk life
442 i fork in lees
443 oer sink life
444 on ilk see fir
445 ers oil knife
446 i see kin rolf
447 les oink fire
448 ok lien is ref
449 iron flee ski
450 in reis ok elf
451 free kin silo
452 ski or in feel
453 keno is lifer
454 no ilk see fir
455 knife lie ors
456 on lee if risk
457 neo like firs
458 kin res of lie
459 refs like ion
460 no lee if risk
461 lion fee kris
462 like no if res
463 roe sink file
464 kin ers of lie
465 foil rise ken
466 ok sir fee nil
467 info risk eel
468 sere in of ilk
469 ones irk file
470 like no if ers
471 in kore flies
472 i rifle ok sen
473 free ski lion
474 i frisk on eel
475 so refine ilk
476 eel is of rink
477 fore lies ink
478 i flee in kors
479 eon risk file
480 i frisk no eel
481 lion seek fir
482 in lei ok serf
483 in kos relief
484 i so rifle ken
485 ok infer isle
486 on lee ski fir
487 else oink fir
488 flee ok in sir
489 file one kris
490 i sin lee fork
491 fin likes ore
492 ok sin lie ref
493 oer fine silk
494 i ok finer les
495 ion flee risk
496 leer is of ink
497 free ink soil
498 i ok risen elf
499 oer like fins
500 i sleek on fir

### tuatagovailoa:people

input: Tua Tagovailoa
category: people
phrases 1 to 500 of 500

1 goat avail auto
2 ago at out avail
3 lava to i out aga
4 toga avail auto
5 out a avail goat
6 a out at go avail
7 alto iota guava
8 out avail to aga
9 out a got via ala
10 taiga oval auto
11 out at avail goa
12 out a go via tala
13 guava iota lota
14 out a avail toga
15 out a gaol via at
16 ago iota vault a
17 out at go via ala
18 ago tau to avail
19 out to a via gala
20 ago a tout avail
21 out a via ago lat
22 ago uta to avail
23 out a via ago alt
24 ago out via tala
25 ago a lot via tau
26 out tao via gala
27 ago a it out lava
28 out ala via goat
29 ago a lot via uta
30 avail a got auto
31 a to tau go avail
32 out oat via gala
33 a to vial out aga
34 out tala via goa
35 ago at i out lava
36 a too tail guava
37 a to uta go avail
38 avail at go auto
39 out a lag via tao
40 ago auto via lat
41 ago vial out at a
42 out ala via toga
43 alto a go via tau
44 ago auto via alt
45 aga via a lot out
46 out lota via aga
47 a to auto via gal
48 ago tau via alto
49 a to tau via goal
50 ago tout via ala
51 out a lag via oat
52 tau avail to goa
53 alto a go via uta
54 ago uta via alto
55 a via at log auto
56 auto got via ala
57 a to uta via goal
58 ago vat ail auto
59 a to auto via lag
60 ago tau via lota
61 ago a i vault tao
62 uta avail to goa
63 oval a it out aga
64 ago vital auto a
65 ago a i tout lava
66 a ago taut viola
67 ago a i vault oat
68 auto go via tala
69 a out vat oil aga
70 aga via alto out
71 a via auto go lat
72 ago uta via lota
73 a to ala via gout
74 tao ail to guava
75 a via auto go alt
76 at too ail guava
77 lout to a via aga
78 at out viola aga
79 oval at i out aga
80 oat ail to guava
81 too gut a via ala
82 taut ala via goo
83 a out lat via goa
84 goal via auto at
85 a out alt via goa
86 goo avail taut a
87 ago vial to tau a
88 a auto tag viola
89 a to tau via gaol
90 a lot iota guava
91 a lot tau via goa
92 avail tau go tao
93 goal via out at a
94 gloat via auto a
95 tout via a go ala
96 i toot ala guava
97 ago a at via lout
98 avail uta go tao
99 too lag a via tau
100 goa via alto tau
101 oval a i tag auto
102 goa iota vault a
103 ago vial to uta a
104 avail tau go oat
105 too tug a via ala
106 auto to vial aga
107 a to uta via gaol
108 guava oil tao at
109 guava oil to at a
110 goa via alto uta
111 a ail vat go auto
112 goa avail a tout
113 a lot uta via goa
114 ago vial auto at
115 a via tau go lota
116 aga via taut loo
117 too lag a via uta
118 avail uta go oat
119 ago vat i out ala
120 vital a auto goa
121 a out vat ail goa
122 gout avail tao a
123 a via uta go lota
124 guava toil tao a
125 ago ail out vat a
126 gaol via auto at
127 a via tau log tao
128 tau to viola aga
129 a via tau tag loo
130 galoot via tau a
131 i out a lava goat
132 a tout viola aga
133 oval a i tout aga
134 guava oil oat at
135 a via uta log tao
136 aga via auto lot
137 a via uta tag loo
138 ago viola tau at
139 i ago taut oval a
140 goo avail tau at
141 i got a auto lava
142 tao out vial aga
143 go to tau via ala
144 gout avail oat a
145 ago a vat oil tau
146 uta to viola aga
147 it go a auto lava
148 galoot via uta a
149 a via tau log oat
150 tau lava go iota
151 it out a lava goa
152 ago viola uta at
153 loo tut a via aga
154 guava toil oat a
155 go to uta via ala
156 goo avail uta at
157 ago a vat oil uta
158 guava ail a toot
159 i go at auto lava
160 uta lava go iota
161 a tut ala via goo
162 oval a auto gait
163 a via uta log oat
164 oat out vial aga
165 a via oat lug tao
166 gal via auto tao
167 i out at lava goa
168 goal via tao tau
169 alto a guava to i
170 taut a viola goa
171 i too vault a aga
172 to auto via gala
173 i out a lava toga
174 aga oil auto vat
175 gal via out tao a
176 goal via tao uta
177 ago tau lava to i
178 lag via auto tao
179 gal via out oat a
180 ava i gloat auto
181 ago uta lava to i
182 gal via auto oat
183 i out a volta aga
184 lav out iota aga
185 it ago oval a tau
186 goa via lat auto
187 ava to i out gala
188 ago tail out ava
189 out a vail ago at
190 goa via alt auto
191 ava out a go tail
192 goal via oat tau
193 i ago oval at tau
194 ait out ago lava
195 it ago oval a uta
196 aga via tau tool
197 i gloat ava out a
198 vita out ago ala
199 guava i tool at a
200 goal via oat uta
201 i ago oval at uta
202 lag via auto oat
203 i tout a lava goa
204 out at voila aga
205 guava i loot at a
206 aga via uta tool
207 a at auto go vial
208 aga via tau loot
209 goa vial out at a
210 goa via ala tout
211 it gaol ava out a
212 ago vial tao tau
213 i got ava out ala
214 gout via ala tao
215 ava ago a til out
216 ava it gaol auto
217 i go tau tao lava
218 aga via tao lout
219 it go ava out ala
220 ago voila taut a
221 vail out a to aga
222 goa ail auto vat
223 ava out a go tali
224 goa via lota tau
225 i tat a loo guava
226 aga via uta loot
227 a ava it out goal
228 voila a tag auto
229 guava i lot tao a
230 ago vial tao uta
231 i go ava out tala
232 gaol via tao tau
233 a at tau go viola
234 goo via tala tau
235 i gaol a vat auto
236 at voila ago tau
237 oval tau aga to i
238 at vail ago auto
239 i gaol ava out at
240 ava ago taut oil
241 i lot ava out aga
242 ava auto go tail
243 i go vat auto ala
244 ago vial oat tau
245 ait out a go lava
246 ago tali out ava
247 i go uta tao lava
248 goa via lota uta
249 tui ago a to lava
250 gout via ala oat
251 ava out a got ail
252 gaol via tao uta
253 at ava i out goal
254 goo via tala uta
255 a at uta go viola
256 aga via oat lout
257 i out vat ala goa
258 at voila ago uta
259 oval uta aga to i
260 ago auto lava it
261 vail ago a to tau
262 ava out lag iota
263 vita out a go ala
264 ago vial oat uta
265 i out ava ago lat
266 gaol via oat tau
267 i go tau oat lava
268 taiga oval a out
269 goa i vault tao a
270 ago iota lav tau
271 i out ava ago alt
272 gaol via oat uta
273 guava i lot oat a
274 goa voila taut a
275 i lot ava ago tau
276 ago iota lav uta
277 ava out at go ail
278 ava til ago auto
279 ava to i lag auto
280 voila tau to aga
281 vail ago a to uta
282 vail auto to aga
283 i go uta oat lava
284 ava auto go tali
285 ava lit a go auto
286 voila a tout aga
287 out a ava lit goa
288 iota ava out gal
289 goa i vault oat a
290 out lava iot aga
291 i out tao lav aga
292 guava iot alto a
293 i lot ava ago uta
294 tali ava out goa
295 oval a tui ago at
296 gala via tau too
297 ava taut a go oil
298 goat vial auto a
299 goa vial to tau a
300 iot ala to guava
301 ago lit out ava a
302 voila uta to aga
303 i lag ava out tao
304 ait auto go lava
305 i out oat lav aga
306 a ava taut igloo
307 logo via tau at a
308 ait a tool guava
309 goa via lout at a
310 vita a gaol auto
311 goa vial to uta a
312 ava auto got ail
313 ava to i gaol tau
314 goa tail out ava
315 i go ava alto tau
316 out lava ait goa
317 out a ait ago lav
318 vita auto go ala
319 logo via uta at a
320 gala via uta too
321 a ava it log auto
322 tau iot ago lava
323 a tau tao go vial
324 out ala vita goa
325 i lag ava out oat
326 ait a loot guava
327 a ava i tout goal
328 goat viola tau a
329 ava to i gaol uta
330 out tao vail aga
331 i go ava alto uta
332 uta iot ago lava
333 tui oval a to aga
334 auto ava lit goa
335 at ava i log auto
336 goat viola uta a
337 a uta tao go vial
338 goa vial auto at
339 a tau oat go vial
340 tao tui ago lava
341 tao ava i out gal
342 toga vial auto a
343 ava oil a got tau
344 ago lit auto ava
345 ait oval a go tau
346 gat viola auto a
347 a uta oat go vial
348 guava tail a oot
349 tol ago a via tau
350 aga ait oval out
351 ava oil a got uta
352 tau vail ago tao
353 ait oval a go uta
354 out oat vail aga
355 a voila at go tau
356 goat ail out ava
357 i to a lota guava
358 oil ava taut goa
359 ava oil at go tau
360 ago ail tout ava
361 a vail at go auto
362 gout iota lava a
363 a oot i vault aga
364 goa viola tau at
365 auto ava i go lat
366 toga viola tau a
367 auto ava i go alt
368 uta vail ago tao
369 a tau lav go iota
370 oat tui ago lava
371 oat ava i out gal
372 aga toil out ava
373 goa oil tau vat a
374 tag oil auto ava
375 ago oil tut ava a
376 ago ait oval tau
377 tol ago a via uta
378 guava ail a otto
379 i ava too gut ala
380 tau vail ago oat
381 lat ava i out goa
382 auto ait ago lav
383 alt ava i out goa
384 goa viola uta at
385 a voila at go uta
386 toga viola uta a
387 ava oil at go uta
388 ago ait oval uta
389 ava toil a go tau
390 goat oil tau ava
391 i ava auto to gal
392 ava tau log iota
393 a uta lav go iota
394 ago toil tau ava
395 goa oil uta vat a
396 uta vail ago oat
397 tau ava i lot goa
398 ava iot out gala
399 tag oil out ava a
400 toga ail out ava
401 ava tout i go ala
402 it ava auto goal
403 i ava tau to goal
404 aga it oval auto
405 i ava too lag tau
406 goa til auto ava
407 i ava too tug ala
408 goat oil uta ava
409 ava toil a go uta
410 ava uta log iota
411 uta ava i lot goa
412 ago toil uta ava
413 tau ava i go lota
414 ava ait out goal
415 i ava uta to goal
416 ava tao lug iota
417 i ava too lag uta
418 aga iot oval tau
419 gat via loo tau a
420 gat oil auto ava
421 goo via lat tau a
422 guava i alto tao
423 goo via alt tau a
424 goo tail tau ava
425 i to tau lava goa
426 goal vita auto a
427 uta ava i go lota
428 aga iot oval uta
429 gout oil at ava a
430 goa ait oval tau
431 goa til out ava a
432 aga oil tout ava
433 gat via loo uta a
434 toga oil tau ava
435 goo via lat uta a
436 guava ail at oot
437 goo via alt uta a
438 ail ava taut goo
439 ava tut a oil goa
440 goo tail uta ava
441 gat oil out ava a
442 ava oat lug iota
443 i to uta lava goa
444 goat voila tau a
445 a to lava tui goa
446 aga tui oval tao
447 tau ava i log tao
448 goat vail auto a
449 tau ava i tag loo
450 goa ait oval uta
451 i ava ala to gout
452 guava i alto oat
453 goo ail tau vat a
454 toga oil uta ava
455 i ava lout to aga
456 goa toil tau ava
457 a iot tau go lava
458 goat voila uta a
459 goa vail out at a
460 goa vial tao tau
461 it ava ago a lout
462 gat voila auto a
463 a via at gol auto
464 aga tui oval oat
465 uta ava i log tao
466 goa toil uta ava
467 uta ava i tag loo
468 gala via tau oot
469 goo ail uta vat a
470 aga via auto tol
471 i to auto lav aga
472 goa vial tao uta
473 a to auto vig ala
474 ava ait out gaol
475 a iot uta go lava
476 goa voila tau at
477 gout ail to ava a
478 toga voila tau a
479 a to ala guv iota
480 ava tui ago alto
481 i ava ago at lout
482 goa ail tout ava
483 tau ava i log oat
484 i otto ala guava
485 a tui tao go lava
486 goa vail auto at
487 loo ava i tut aga
488 toga vail auto a
489 oot via a gut ala
490 it too ala guava
491 a vail tau go tao
492 gala via uta oot
493 a to iota luv aga
494 guava tali a too
495 ala ava i tut goo
496 goa vial oat tau
497 gut oil tao ava a
498 i ava tau galoot
499 uta ava i log oat
500 i too tala guava

### patmurphy:people

input: Pat Murphy
category: people
phrases 1 to 64 of 64

1 apt murphy
2 my hurt pap
3 thy rpm up a
4 party hump
5 thy up ramp
6 tap murphy
7 thy up pram
8 pray thump
9 harp my put
10 harm tuppy
11 thy rum pap
12 myth up rap
13 a thump pry
14 up pry math
15 my ruth pap
16 myth up par
17 pup my hart
18 at hump pry
19 ham pry put
20 ham try pup
21 harp my tup
22 arm thy pup
23 rpm put hay
24 pap hum try
25 rpm pay hut
26 hut pry map
27 ram thy pup
28 ump try hap
29 pat hum pry
30 tap hum pry
31 mar thy pup
32 rap thy ump
33 hut pry amp
34 ump pry hat
35 par thy ump
36 rpm yap hut
37 ham pry tup
38 my hurt app
39 hup my part
40 apt hum pry
41 tup hay rpm
42 hup my trap
43 my ruth app
44 hup my tarp
45 hup my prat
46 rath my pup
47 thru my pap
48 my rapt hup
49 app thy rum
50 app hum try
51 yah rpm put
52 map hup try
53 hat rpm yup
54 pau thy rpm
55 amp hup try
56 mat hup pry
57 yah rpm tup
58 my thru app
59 tam hup pry
60 pam hup try
61 pam hut pry
62 pah ump try
63 tha ump pry
64 tha rpm yup

### ahmetzappa:people

input: Ahmet Zappa
category: people
phrases 1 to 92 of 92

1 hate map zap
2 the map zap a
3 heat map zap
4 the amp zap a
5 tape ham zap
6 pet ham zap a
7 haze map pat
8 me zap a path
9 amp zap hate
10 het map zap a
11 team hap zap
12 hep mat zap a
13 haze map tap
14 he map zap at
15 temp aah zap
16 apt a zap hem
17 ahem pat zap
18 hep tam zap a
19 ahem tap zap
20 het amp zap a
21 mate hap zap
22 me hap zap at
23 maze hat pap
24 he zap at amp
25 math zap ape
26 met hap zap a
27 meat hap zap
28 hemp zap at a
29 amp zap heat
30 hem pat zap a
31 math zap pea
32 hem tap zap a
33 maze hap pat
34 the pam zap a
35 maze hap tap
36 he pam zap at
37 zeta hap map
38 me phat zap a
39 amp pat haze
40 eth map zap a
41 pate ham zap
42 me pah zap at
43 heap mat zap
44 eth amp zap a
45 amp tap haze
46 het pam zap a
47 tam zap heap
48 met pah zap a
49 peat ham zap
50 eth pam zap a
51 zeta ham pap
52 haze mat pap
53 hame pat zap
54 hame tap zap
55 pap haze tam
56 zeta hap amp
57 apt map haze
58 apt zap ahem
59 tame hap zap
60 apt hap maze
61 apt amp haze
62 pep hazmat a
63 apt zap hame
64 empath zap a
65 pam apt haze
66 pep hamza at
67 hate pam zap
68 pah apt maze
69 temp aha zap
70 heat pam zap
71 maze hat app
72 haze pam pat
73 haze pam tap
74 team pah zap
75 mate pah zap
76 meta hap zap
77 meat pah zap
78 zeta ham app
79 haze mat app
80 maze pah pat
81 maze pah tap
82 maze tha pap
83 zeta hap pam
84 zeta pah map
85 mae path zap
86 tame pah zap
87 zeta pah amp
88 haze tam app
89 mae phat zap
90 maze tha app
91 meta pah zap
92 zeta pah pam

### dougloft:people

input: Doug Loft
category: people
phrases 1 to 33 of 33

1 gold tofu
2 flu to god
3 flood gut
4 old of gut
5 flood tug
6 dug of lot
7 god flout
8 flu to dog
9 fold gout
10 do to gulf
11 dog flout
12 old of tug
13 food glut
14 ful to god
15 todo gulf
16 ful to dog
17 doof glut
18 do of glut
19 flu go dot
20 dot of lug
21 dol of gut
22 tod of lug
23 dol of tug
24 oft do lug
25 ful go dot
26 do flu got
27 tod flu go
28 do ful got
29 tod ful go
30 dot of gul
31 dug of tol
32 tod of gul
33 do oft gul

### milwaukeebrewers:companies

input: Milwaukee Brewers
category: companies
phrases 1 to 500 of 500

1 walk reimburse wee
2 like bums were wear
3 us like we be warmer
4 album rewire weeks
5 like bum were wears
6 we were blue is mark
7 albums rewire week
8 blue week is warmer
9 we were i makes blur
10 swimwear burke lee
11 sure limb were wake
12 me were i bus walker
13 walk reimburse ewe
14 wise blue were mark
15 we were i mark blues
16 lukewarm beer wise
17 sure mike blew wear
18 we like me swear rub
19 wiser lukewarm bee
20 bum likes were wear
21 i were serum be walk
22 blue reek swimwear
23 warm weber like use
24 we milk sure be wear
25 muesli wake brewer
26 i were weak rumbles
27 us like we warm beer
28 emu walk breweries
29 sure week wear limb
30 me wire sure be walk
31 weaker umber lewis
32 weak miles were rub
33 we were i break slum
34 bursar milk weewee
35 i were weak slumber
36 me were i swear bulk
37 weaker rumble wise
38 same wire were bulk
39 me were blur is wake
40 weaker lumber wise
41 like bum were wares
42 we were i make blurs
43 lukewarm wire bees
44 i were lumbar weeks
45 us were we bear milk
46 swimwear burke eel
47 weak smile were rub
48 we rules i make brew
49 lukewarm bee wires
50 we is lukewarm beer
51 us were milk be wear
52 warlike web resume
53 lukewarm wee be sir
54 me were i sub walker
55 lumbar risk weewee
56 we beware sure milk
57 i were sum be walker
58 mural brisk weewee
59 warm blue rise week
60 me blur i swear week
61 weaker umber wiles
62 blue week wire arms
63 we see warm like rub
64 swimwear lube reek
65 weaker swim be rule
66 me were i walk rebus
67 muesli wreak weber
68 bum week were liars
69 we like me rub wears
70 lukewarm weir bees
71 me were busier walk
72 we risk me wear blue
73 weak brewer muesli
74 same blur wire week
75 me were bulk is wear
76 rube keel swimwear
77 mural weeks be wire
78 me were i blur wakes
79 umber week wailers
80 like bums were ware
81 we like me rubs wear
82 weaker brew muesli
83 wee risk were album
84 we like warm be user
85 warlike weber muse
86 skim blue were wear
87 me blur i wear weeks
88 lumbar kris weewee
89 real bum wire weeks
90 us wire me be walker
91 wailers rebuke mew
92 we be lukewarm rise
93 we were i makes burl
94 weak breweries lum
95 bum week were rails
96 me were rube is walk
97 lukewarm web siree
98 like weber swum are
99 we were mike blur as
100 swimwear rube leek
101 blue rims were wake
102 me use i walk brewer
103 lukewarm bree wise
104 warm blue sire week
105 i see warm were bulk
106 weaker brulee swim
107 rum week were basil
108 we were use milk bar
109 lukewarm weber sei
110 sure week warm bile
111 we were i barks mule
112 eek bluer swimwear
113 bum wire see walker
114 me were i bulk wears
115 blume rewire wakes
116 warm weber like sue
117 me were i rubes walk
118 eke bluer swimwear
119 mural week be wires
120 i were rub seem walk
121 weaker blume wires
122 like beer swum wear
123 we like warm be ruse
124 walkies umber were
125 i be lukewarm sewer
126 we were i blame rusk
127 wake breweries lum
128 able musk were wire
129 us were i blew maker
130 swimwear uber keel
131 real bum wires week
132 us like me brew wear
133 swimwear uber leek
134 we is weaker rumble
135 we like rum be wears
136 wiser weaker blume
137 blue week wire mars
138 we blur i make sewer
139 murals birk weewee
140 we is weaker lumber
141 we were i lube marks
142 walkies brewer emu
143 we swear like umber
144 me is week blur wear
145 wreak sublime were
146 sure mile brew wake
147 we is rule make brew
148 askew blume rewire
149 bum week were liras
150 we were lube is mark
151 swimwear ruble eek
152 like rebus were maw
153 us were i walk ember
154 swimwear ruble eke
155 wise rule make brew
156 we be sure walk emir
157 real bums wire week
158 us were we break mil
159 we limber sure wake
160 we were i slum baker
161 wise lube were mark
162 us were we bare milk
163 we be lukewarm sire
164 me be sure walk weir
165 weak rims were blue
166 we use i blew marker
167 me were warlike bus
168 we rule i makes brew
169 mural weber is week
170 we were lie bus mark
171 able rum wire weeks
172 we see i bulk warmer
173 weaker swim be lure
174 we web i make rulers
175 weak beer rule swim
176 me were i walks rube
177 sure emir blew wake
178 i were beer sum walk
179 blue rim were wakes
180 me were i blurs wake
181 same weir were bulk
182 i were mere bus walk
183 bare week rule swim
184 we were i sulk amber
185 weak lemurs be wire
186 we wires me bulk are
187 weak mule were ribs
188 we use i blew remark
189 weaker rum be lewis
190 i see week warm blur
191 warm blue wire seek
192 we seem i rub walker
193 wiser rule make web
194 we sum i barrel week
195 weak mule is brewer
196 me blur i wears week
197 like rubes were maw
198 we like me swear bur
199 wise ruler make web
200 we is ruler make web
201 real rube swim week
202 we were i slum brake
203 weak slime were rub
204 me rules i brew wake
205 i see lukewarm brew
206 we likes me rub wear
207 able rum wires week
208 us rewire me be walk
209 rum week bear lewis
210 we rule i make brews
211 wee sir rumble wake
212 us rebel i warm week
213 umber wire see walk
214 we mire sure be walk
215 sure mike blew ware
216 us were me walk brie
217 weak rim were blues
218 we rule sir make web
219 bum wire were lakes
220 we were mule is bark
221 us were limber wake
222 we rule wise be mark
223 wee sir lumber wake
224 us milk we wear beer
225 we warble sure mike
226 me use i brew walker
227 wise mule were bark
228 we web i makes ruler
229 rum bike were wales
230 us were emir be walk
231 sure mike wee brawl
232 us wire me walk beer
233 we rumba like sewer
234 i blur mere was week
235 weak mile were rubs
236 i rule week be swarm
237 lukewarm ewe be sir
238 we were i bulk smear
239 sure mire blew wake
240 we mew i break rules
241 sure wile make brew
242 me were burl is wake
243 bum likes were ware
244 we be lemur wake sir
245 weak miles were bur
246 we rule me ribs wake
247 bum wire were leaks
248 i be rule warms week
249 rum week be wailers
250 we rules me rib wake
251 warm bike rules wee
252 we likes rum be wear
253 sure lime brew wake
254 i sew blue were mark
255 lumbar week wee sir
256 i rub else warm week
257 slim rube were wake
258 we rules week brim a
259 wee kris were album
260 i mew sure be walker
261 same week blur weir
262 i were mus be walker
263 bum week swear lire
264 us like we wear berm
265 weak smile were bur
266 us were we mark bile
267 weak rue were limbs
268 we reeks i warm blue
269 weak lemur be wires
270 we rise me blur wake
271 mural weeks be weir
272 we were use milk bra
273 weak wire seem blur
274 we is lure make brew
275 weaker mil were bus
276 we like me rub wares
277 warm rebus like wee
278 we milk sure be ware
279 weak user were limb
280 us were mire be walk
281 rum lewis wake beer
282 me sue i walk brewer
283 bum lewis were rake
284 we rules i web maker
285 we like umber wears
286 we use me rib walker
287 we be warlike serum
288 we were mile ask rub
289 bleak sum were wire
290 i seem week blur war
291 real weeks bum weir
292 we were sue milk bar
293 real burke swim wee
294 we risk mule be wear
295 warm rube lie weeks
296 we rule i break mews
297 sure week ware limb
298 we is lee warm burke
299 weaker slum be wire
300 we webs i make ruler
301 bum lire were wakes
302 i rebels we wake rum
303 weak lire were bums
304 we like rue be swarm
305 lee swim were burka
306 we be sure mark wile
307 weak sir wee rumble
308 us milk we be wearer
309 bleak rum were wise
310 i use berm were walk
311 we remark wise blue
312 we lure i makes brew
313 wee mike swear blur
314 we is week rub realm
315 weak semi were blur
316 we were milk be sura
317 wise lure make brew
318 us were me walk bier
319 we bruise mere walk
320 me blur i wake sewer
321 bum weeks wear lire
322 we blur i smear week
323 warm rebus lie week
324 me burl i swear week
325 weak sir wee lumber
326 we were lie sub mark
327 alike sum were brew
328 me is rule brew wake
329 rum week were bails
330 we lie sure web mark
331 bum weeks wire earl
332 we see milk rub wear
333 bum week wire laser
334 we were i lurk beams
335 bum weir see walker
336 we wire me blur sake
337 weaker mule is brew
338 me blurs i wear week
339 weak ruse were limb
340 we were i bulk mares
341 me were warlike sub
342 we see warm like bur
343 weak mules were rib
344 i were mere sub walk
345 weak beer lure swim
346 i were week rub slam
347 wee blue wire marks
348 me see wire rub walk
349 warm rube lies week
350 we be i wreak lemurs
351 same burl wire week
352 we bulk i swear mere
353 weak lemur is weber
354 we like me bur wears
355 warm lube rise week
356 i were slew make rub
357 able musk were weir
358 i web sure mere walk
359 bleak rue were swim
360 we skewer i be mural
361 wee lewis make burr
362 we rules rim be wake
363 were rumble is wake
364 we blew rue make sir
365 warm rubes like wee
366 me were i bulk wares
367 weak limes were rub
368 me were i burl wakes
369 we rise lumbar week
370 we be rue swear milk
371 sure mil wake weber
372 we sue i blew marker
373 bare week lure swim
374 i were rum blew sake
375 we wires blue maker
376 we is mere blur wake
377 we wire blue makers
378 we wee sir make blur
379 blue week warm reis
380 we lure i make brews
381 wiser wee make blur
382 we is me bulk wearer
383 we bums like wearer
384 me burl i wear weeks
385 were lumber is wake
386 we err week is album
387 like umber sew wear
388 we like rum be wares
389 we beware rum likes
390 we milk user be wear
391 we break wise lemur
392 us mire we be walker
393 wiser lure make web
394 i were rum bees walk
395 me were rubies walk
396 we rules i wake berm
397 we rub weaker miles
398 i wee sure blew mark
399 rum week wails beer
400 we sire me blur wake
401 we break wiser mule
402 we lures i make brew
403 bum week wires earl
404 we rise me bulk wear
405 warm wile see burke
406 we skewer i bum real
407 i rumbles week wear
408 me web i wake rulers
409 weaker lemur is web
410 we lure sir make web
411 weak lime were rubs
412 we be rue warm likes
413 real week bums weir
414 we lure wise be mark
415 wee umber is walker
416 me wire user be walk
417 warm rubes lie week
418 us were milk be ware
419 slim burke were awe
420 we were ski be mural
421 rum week bare lewis
422 we use rim be walker
423 wiser blue wee mark
424 we were mike burl as
425 wee rum break lewis
426 we be slur make wire
427 mere lewis rub wake
428 we sue i blew remark
429 rum week web serial
430 we lies me burr wake
431 wise week err album
432 we risk me lube wear
433 sure weber milk awe
434 i be ruler swam week
435 rural bee swim week
436 we wee sir mark blue
437 sure mile wreak web
438 we is mew break rule
439 blue weeks warm ire
440 we were ski bum real
441 we make bluer wires
442 we were i burkes lam
443 i slumber week wear
444 me is ruler web wake
445 us wear limber week
446 we like use warm reb
447 skim lube were wear
448 i lure week be swarm
449 we walk mere rubies
450 us were wile be mark
451 meek wire be walrus
452 us wire mere be walk
453 weaker blue mew sir
454 we is reek warm blue
455 we swear bluer mike
456 us were we brake mil
457 weaker sir web mule
458 me rule i brews wake
459 wee rule swim baker
460 me bulk i wear sewer
461 warm burke lies wee
462 i were slur make web
463 i rumble week swear
464 we wee i mark rubles
465 weak lemurs be weir
466 we resume i walk reb
467 we embark wise rule
468 we rise me walk rube
469 i lumber week swear
470 we milk ruse be wear
471 i rumble weak sewer
472 we sew i remark blue
473 warm lube sire week
474 i were bur seem walk
475 askew rim were blue
476 we burl i make sewer
477 askew mile were rub
478 us were lie web mark
479 we be lukewarm reis
480 me rule sir web wake
481 warm weir seek blue
482 we were i balk serum
483 bum week wears lire
484 me wire ruse be walk
485 wee miles burr wake
486 we wire musk be real
487 i lumber weak sewer
488 us were bee milk war
489 we sire lumbar week
490 we risk me ware blue
491 we web surreal mike
492 we blur i mares week
493 alike mews were rub
494 me sue i brew walker
495 rum week swear bile
496 we were i bulk reams
497 mural week were bis
498 me were bulk is ware
499 skim blue were ware
500 me is week burl wear

### alexusgrynkewich:people

input: Alexus Grynkewich
category: people
phrases 1 to 500 of 500

1 sexy whacking rule
2 her waxing yes luck
3 we guy her six clank
4 sexy cruel hawking
5 lucky wing hear sex
6 i sex her wacky lung
7 sheer lucky waxing
8 hungry sex ice walk
9 we nix her slack guy
10 sucking hex lawyer
11 crank while sex guy
12 her icy sex gun walk
13 hex lucky swearing
14 new guy relax hicks
15 her clunky wig sex a
16 hungry excise walk
17 hungry exec is walk
18 her wacky in sex lug
19 sexy whacking lure
20 ugly sex knew chair
21 her kin sex guy claw
22 whey relax sucking
23 her lux cawing keys
24 her sec nix guy walk
25 whiskey angle crux
26 his green wacky lux
27 us nix her wacky leg
28 waxing lucky heres
29 lucky sex hang wire
30 i sex why anger luck
31 wrinkly gauche sex
32 new guys relax hick
33 i sex why range luck
34 huck sexing lawyer
35 her six wacky lunge
36 her wacky lux is gen
37 sexy wreck hauling
38 such lying wake rex
39 her sly king cue wax
40 hygiene walks crux
41 sexy wing hear luck
42 his new leg yak crux
43 agency whisker lux
44 lacking rex use why
45 his weak lux cry gen
46 waxing cheer sulky
47 sexual neck rig why
48 we guys rex chalk in
49 surly waxing cheek
50 chalky six were gun
51 us nix her wacky gel
52 waxing luck heresy
53 curly week hang six
54 he gray new six luck
55 weakly cursing hex
56 early chug knew six
57 we sky in relax chug
58 sexy ulcer hawking
59 six why agree clunk
60 i sex why clear gunk
61 lawyering huck sex
62 her luce sky waxing
63 we sky lux charge in
64 waxing cheeky slur
65 ugly week ranch six
66 i suck why relax gen
67 whiskey glean crux
68 six hug neck lawyer
69 i guys new chalk rex
70 relaxing suck whey
71 hick guy relax news
72 i suck why angle rex
73 waxing cheery sulk
74 sexy wire hang luck
75 i sky new relax chug
76 huck relying waxes
77 crank guy wheel six
78 her sec lux yaw king
79 shiny lux wreckage
80 six why enrage luck
81 i sex why glue crank
82 wacky greenish lux
83 crying hulk see wax
84 his key lux warn ecg
85 curly exes hawking
86 weak lunch grey six
87 i sky gun relax chew
88 lawyering suck hex
89 racking lux see why
90 his new crux gel yak
91 cushy rex weakling
92 cheery six gun walk
93 i sky new charge lux
94 wry sucking exhale
95 sexual why rick gen
96 i wreck lux hang yes
97 shakily wrung exec
98 huge six knew clary
99 we shack in ugly rex
100 lark excusing whey
101 six gulch knew year
102 i guy rex chalk news
103 leery waxing shuck
104 lucky rex hang wise
105 i sex why creak lung
106 weary suckling hex
107 he walk six urgency
108 we cry ken laugh six
109 cheesy waxing lurk
110 lacking why rue sex
111 he guy six crawl ken
112 weakly crux neighs
113 hex urgency is walk
114 we rick yes hang lux
115 wacky hurling exes
116 sexy rice hung walk
117 an wry hex glue sick
118 weakly crux hinges
119 cruel why axe kings
120 i sex why ruck angel
121 aweigh sucker lynx
122 waxing clue her sky
123 i sex why urge clank
124 sexy crinkle waugh
125 weakly rich sex gun
126 he cry six wake lung
127 sexy lungi whacker
128 lucky sex hang weir
129 i cry lux hang weeks
130 waxing celery husk
131 lacking rex sue why
132 we sky gun relax chi
133 surly exec hawking
134 an crux gel whiskey
135 we chalk in sexy rug
136 relaxing shuck yew
137 an crux sigh weekly
138 we sex ink cry laugh
139 creaky helix swung
140 sexy lung wake rich
141 i glue why snack rex
142 relaxes chunky wig
143 walking cry hex use
144 i shack new ugly rex
145 exchange wily rusk
146 i walk hungry execs
147 i were lux sky chang
148 exchange wiry sulk
149 hick gun sex lawyer
150 we sex kin cry laugh
151 relax hickey swung
152 six why clunk eager
153 i sex why ruck angle
154 waxing creel husky
155 like cry hung waxes
156 we key six hang curl
157 waxing lychee rusk
158 hex luck wing years
159 he win rex guy slack
160 angel crux whiskey
161 icy rex knew laughs
162 we sex in chalky rug
163 shucking yew relax
164 nix her lucky wages
165 laugh cry i knew sex
166 waxer lucky neighs
167 sexy hulk wing care
168 we hacks in ugly rex
169 waxer lucky hinges
170 her ugly nick waxes
171 in sex why gear luck
172 surely waxing heck
173 wacky lux sign here
174 i key lux hang screw
175 excel husky waring
176 rank wish excel guy
177 he sex rung lick way
178 laker excusing why
179 sexy win hulk grace
180 i guns why excel ark
181 greenway hicks lux
182 hewn guy relax sick
183 we shy lux care king
184 weaklings crux hey
185 six guy neck whaler
186 we sky each ring lux
187 yuck sexing whaler
188 such king relax yew
189 i shy lux knew grace
190 exhales yuck wring
191 wacky lux sing here
192 he win rex guy lacks
193 whacker guise lynx
194 waxes clink her guy
195 i hug we creaks lynx
196 relaxing chews yuk
197 waxing hulk see cry
198 i keys lux hang crew
199 exchange swirl yuk
200 nicer guys hex walk
201 i neck lux gears why
202 waxing lechery suk
203 lucky wing sex hare
204 i guy rex neck shawl
205 waxer chug skyline
206 sexy in whack gruel
207 i hung exes cry walk
208 yech lurking waxes
209 hex luck swing year
210 i chalk new sexy rug
211 exhaling screw yuk
212 icy sex hunger walk
213 i suck he wager lynx
214 waxer yuck english
215 walking cry hue sex
216 in sex why rage luck
217 hacky wrung exiles
218 we relax cushy king
219 we guy elk ranch six
220 waxer shucking ley
221 six luck grew hyena
222 we grey lux shack in
223 waxer shucking lye
224 six guy renew chalk
225 an ugly res hex wick
226 exhaling crews yuk
227 caring why seek lux
228 i sex wren guy chalk
229 relaxing chewy suk
230 sexy chi gun walker
231 i sex rug lynch wake
232 hugely nicks waxer
233 early sex hung wick
234 are lick sex gun why
235 waxer hickey lungs
236 sexy in whack luger
237 i sex new chalky rug
238 exhale sucky wring
239 six why glue canker
240 i sex why luge crank
241 waxer yuck shingle
242 clean rex guy whisk
243 i hacks new ugly rex
244 grew unisex chalky
245 early huck sex wing
246 an ugly ers hex wick
247 weary lex shucking
248 gin her lucky waxes
249 we link rex say chug
250 waxer suckling hey
251 sexy weir hang luck
252 way clerk he gun six
253 waxer hickey slung
254 he waring lucky sex
255 he gin yes walk crux
256 relaxing sucky hew
257 sexy lug knew chair
258 i suck why glean rex
259 weaklings crux yeh
260 six ken chug lawyer
261 i guy rex whack lens
262 yeh waxer suckling
263 crank guile sex why
264 we hex sir guy clank
265 wreaking cushy lex
266 kin why excel sugar
267 i cry lux hangs week
268 exhales icky wrung
269 gray luck whine sex
270 i neck lux rages why
271 waxer yech sulking
272 sick gun relax whey
273 he sky lux wing care
274 we sick huge larynx
275 i urge we shack lynx
276 hex genius cry walk
277 we sin rex guy chalk
278 she wake crying lux
279 he sky lux win grace
280 ugly rex hawks nice
281 he slug in wacky rex
282 sexy urge chin walk
283 wax clerk she guy in
284 chunky wig sex real
285 she lug rex nick way
286 clear hex guys wink
287 i hex ken guys crawl
288 sexy wink clear hug
289 in huge sex cry walk
290 he walk sexy curing
291 i husk we grace lynx
292 sexy huck win large
293 we key six gun larch
294 sexy wick hung real
295 i lug why sex canker
296 sexy urge inch walk
297 i keys hex gun crawl
298 we shake crying lux
299 i hex lungs cry wake
300 he sex curly waking
301 an wry hex luge sick
302 sexy huck wing real
303 i grey new shack lux
304 lyric sex hung wake
305 we guy lek ranch six
306 sexy wire gun chalk
307 we sky lie hang crux
308 newer six guy chalk
309 we hex in grays luck
310 aching lux were sky
311 we sex ilk guy ranch
312 we change risky lux
313 we sky lux hang rice
314 angry luck hex wise
315 we hex in ugly racks
316 lanky six were chug
317 we shy lux race king
318 early chunk sex wig
319 i key lux hang crews
320 i walks hungry exec
321 we guy rex shack lin
322 lucky six wager hen
323 i guys rex chalk wen
324 six urge lynch wake
325 i gun why larks exec
326 sexy rule hang wick
327 i sex lyre gun whack
328 sexy leg ruin whack
329 we hex guy ran slick
330 lucky wing sex rhea
331 we gun rye chalk six
332 ugly nix were shack
333 he ink rex guy claws
334 key crux wish angel
335 i gel why snake crux
336 six chug knew leary
337 we sky nix clear hug
338 sexy hike gun crawl
339 we grey lux hacks in
340 six why lunge creak
341 we key six lug ranch
342 icky hug relax news
343 i key hex guns crawl
344 new helix guy racks
345 i key lux hangs crew
346 sexy luck wing hare
347 i sex gunk cry whale
348 sexy lung hear wick
349 we nix he grays luck
350 ugly hex swear nick
351 i luge why snack rex
352 chalky gun wire sex
353 i see lynx whack rug
354 ugly week nix crash
355 he guy kin claws rex
356 saucy hex knew girl
357 we is lynx hug creak
358 lucky in hex wagers
359 we nick he grays lux
360 genial why suck rex
361 i sky wen relax chug
362 sexy hulk wing race
363 we ink rex guy clash
364 we hulk sexy racing
365 we sky he align crux
366 key lux reach wings
367 us nix why clear keg
368 we suck angry helix
369 i gee lux cranks why
370 us relax chewy king
371 i gel why sneak crux
372 early chug sex wink
373 we sex ink guy larch
374 leaky crew hung six
375 any clerk we hug six
376 inky sex crew laugh
377 we guy rex clash kin
378 he ring lucky waxes
379 she ink rex guy claw
380 sexy line whack rug
381 she lug in wacky rex
382 ugly sex waken rich
383 we sky he arcing lux
384 kin sex chug lawyer
385 us ink why relax ecg
386 we guys crank helix
387 we sex kin guy larch
388 walking cry hex sue
389 i urge we hacks lynx
390 hick guys relax wen
391 i hex new grays luck
392 icy sex hung walker
393 i hex new ugly racks
394 weak sex hung lyric
395 we guy ern chalk six
396 sexy wen rick laugh
397 i sky lux charge wen
398 he waring sexy luck
399 clash guy i knew rex
400 ugly rex wine shack
401 she guy kin claw rex
402 agile why snuck rex
403 he sky lux wing race
404 six whey anger luck
405 we sex lung ray hick
406 we key crashing lux
407 us nix we grey chalk
408 sexy hug learn wick
409 i shy gene walk crux
410 six whey range luck
411 larch guy i knew sex
412 we hulk sexy caring
413 we sick rye hang lux
414 ugly chi sex wanker
415 i hex urge sync walk
416 weary sex hung lick
417 i sex rye whack lung
418 wiry sex neck laugh
419 his rex we guy clank
420 weak six lynch urge
421 i hugs we creak lynx
422 sexy hunk clear wig
423 i sex why glean ruck
424 weak helix guns cry
425 why sex rug nickel a
426 shy rex cue walking
427 i shy rex clung wake
428 walking cur hex yes
429 i lug exes crank why
430 sexy lire gun whack
431 we hex guy ran licks
432 hex gurney was lick
433 i hug newly sack rex
434 icky rex laugh news
435 crawl gun he key six
436 lucky six hew anger
437 we sky each grin lux
438 six leg weary chunk
439 i grey new hacks lux
440 six clue grew hanky
441 we sky nigh care lux
442 clunky wig hear sex
443 i key hex gun crawls
444 sick lux enrage why
445 we sky lux gin reach
446 lucky gin swear hex
447 yes chug rex walk in
448 sewn guy relax hick
449 we guy rex hacks lin
450 sex her wacky lungi
451 we hug rex nick lays
452 lucky six hew range
453 we shy king curl axe
454 six keg weary lunch
455 i lug why ranks exec
456 we chalk six gurney
457 we guy rex shack nil
458 crank lux weigh yes
459 we sex hug lick yarn
460 nicer guy hex walks
461 we hug rex slay nick
462 he sawing lucky rex
463 i kern lux cages why
464 he sex wacky ruling
465 we ski lynx hug care
466 leery six gun whack
467 we nix yes chalk rug
468 six yule hang wreck
469 we yen six chalk rug
470 nigh sex weary luck
471 i hex yes crawl gunk
472 chewy ski relax gun
473 i hex ken guy crawls
474 six yen chug walker
475 i sex crawly hug ken
476 he sky cruel waxing
477 we guy rex chalk ins
478 sexual cry hew king
479 we sex ink hug clary
480 he wakes crying lux
481 we key lux gin crash
482 early suck hex wing
483 crawl hung i key sex
484 shaky nice grew lux
485 we gin lux shake cry
486 sexy in wreak gulch
487 we sky lux ring ache
488 hex leg sick runway
489 i key sung hex crawl
490 hick leg sex runway
491 us nix why creak leg
492 we hex curly asking
493 i lug sex crew hanky
494 greasy luck hex win
495 us nix why grace elk
496 six lech guy wanker
497 he lugs in wacky rex
498 weary luck hex sign
499 we sky rex lug china
500 sexy in lug whacker

### mikelove:people

input: Mike Love
category: people
phrases 1 to 21 of 21

1 like move
2 me live ok
3 i ok lev me
4 movie elk
5 me ok evil
6 mike vole
7 me ok veil
8 movie lek
9 i move elk
10 mil evoke
11 i move lek
12 ive ok elm
13 mil ok eve
14 vim ok lee
15 ok vie elm
16 vim ok eel
17 vile me ok
18 ive mel ok
19 me koi lev
20 mil ok vee
21 vie mel ok

### nickfolk:people

input: Nick Folk
category: people
phrases 1 to 4 of 4

1 lock fink
2 flock ink
3 flock kin
4 knock fil

### jesseminter:people

input: Jesse Minter
category: people
phrases 1 to 360 of 360

1 mines jester
2 me jet sirens
3 jet res is men
4 jin semester
5 me jets siren
6 jet ers is men
7 mine jesters
8 me jest siren
9 me jets in res
10 mien jesters
11 me sin jester
12 me jets in ers
13 men is jester
14 me jest in res
15 me jets rinse
16 me jest in ers
17 me jets reins
18 jet sen is rem
19 me jets resin
20 in res jet ems
21 me jest rinse
22 in ers jet ems
23 me jest reins
24 in ess jet rem
25 me jest resin
26 jet ern is ems
27 me isnt jeers
28 me sin jet res
29 me jeers tins
30 me jet sen sir
31 rise jets men
32 me sin jet ers
33 sir jet semen
34 me jets ern is
35 rises jet men
36 i jets men res
37 mine jets res
38 i jets men ers
39 men sit jeers
40 me jest ern is
41 mine jets ers
42 i jest men res
43 its jeers men
44 i jest men ers
45 me jeers nits
46 i jet mess ern
47 rise jest men
48 i jet rem ness
49 sire jets men
50 me jet ern sis
51 miss jeer ten
52 i jets rem sen
53 in jeers stem
54 me jet res ins
55 mine jest res
56 i jest rem sen
57 mine jest ers
58 me jet ers ins
59 sire jest men
60 i jets ems ern
61 rim jet sense
62 i jest ems ern
63 jet seen rims
64 erm sen is jet
65 jets seen rim
66 ser me jets in
67 sins jet mere
68 ser me jest in
69 in jeer stems
70 jin me set res
71 jest seen rim
72 i jet erm ness
73 rein jet mess
74 jin me set ers
75 neer jet miss
76 jess i net rem
77 sin jets mere
78 i jets erm sen
79 jeers met sin
80 ser me jet sin
81 miss jeer net
82 i jest erm sen
83 men sits jeer
84 i jess ten rem
85 tis jeers men
86 in jet erm ess
87 reis jets men
88 i jets men ser
89 in jester ems
90 ser men is jet
91 jeer met sins
92 sri me jet sen
93 siren jet ems
94 i jess me rent
95 sin jest mere
96 ser me jet ins
97 reis jest men
98 i jest men ser
99 tin jeer mess
100 rin me jet ess
101 mines jet res
102 i jet mer ness
103 mines jet ers
104 i jess met ern
105 ins jets mere
106 i jets mer sen
107 risen jet ems
108 i jest mer sen
109 jeers met ins
110 in jet mer ess
111 nim jeers set
112 in jet ems ser
113 emir jet ness
114 i jess erm ten
115 rinse jet ems
116 i jess erm net
117 reins jet ems
118 is jet mer sen
119 miser jet sen
120 me set ser jin
121 ins jest mere
122 i jess mer ten
123 mis jeer sent
124 i jess mer net
125 mis jeers ten
126 i jess me tern
127 in jesters me
128 it jess me ern
129 resin jet ems
130 sin jeer stem
131 mire jet ness
132 emir jets sen
133 miner jet ess
134 rein jets ems
135 nit jeer mess
136 mis jet sneer
137 ism jeer sent
138 ism jeers ten
139 mire jets sen
140 emir jest sen
141 nim jets seer
142 nim jeer sets
143 tin jeers ems
144 nim jet seers
145 rein jest ems
146 mis jeers net
147 sine jets rem
148 mire jest sen
149 mis jeer nest
150 mist jeer sen
151 ism jet sneer
152 nim jest seer
153 semi jets ern
154 ins jeer stem
155 semis jet ern
156 neer jets mis
157 sine jest rem
158 mis jeer tens
159 ism jeers net
160 mien jets res
161 semi jest ern
162 mien jets ers
163 ism jeer nest
164 mint jeer ess
165 ems isnt jeer
166 mis jeer nets
167 neer jest mis
168 tins jeer ems
169 neer jets ism
170 jim seen rest
171 mien jest res
172 mien jest ers
173 ism jeer tens
174 risen jets me
175 nit jeers ems
176 ism jeer nets
177 nee jets rims
178 nits jeer ems
179 neer jest ism
180 risen jest me
181 nee jest rims
182 sere jets nim
183 jin seem rest
184 jim sent seer
185 sere jest nim
186 in jesse term
187 me inter jess
188 jin mere sets
189 jin mess tree
190 mir jet sense
191 jim sere sent
192 jim ten seers
193 in jess meter
194 jim tense res
195 jim tense ers
196 in jess metre
197 jim sneer set
198 jim nee rests
199 jess met rein
200 jim net seers
201 jim sere nest
202 i jesters men
203 sri jet semen
204 tire jess men
205 jin me steers
206 jess nee trim
207 jim sere tens
208 jin terms see
209 sine jets erm
210 mine jets ser
211 jim enter ess
212 jin me resets
213 sim jet sneer
214 jim sere nets
215 jim stern see
216 jim nest seer
217 rite jess men
218 jin met seers
219 sine jest erm
220 mine jest ser
221 time jess ern
222 rim jesse ten
223 jin sere stem
224 jim rents see
225 miss jee rent
226 tier jess men
227 jim nets seer
228 emir jess ten
229 jin meets res
230 jin meets ers
231 sim jeer sent
232 sim jeers ten
233 jim rent sees
234 tin jess mere
235 jin stem seer
236 mire jess ten
237 nim jess tree
238 sims jeer ten
239 jin meter ess
240 rim jesse net
241 jim terns see
242 ins jester me
243 tim jeers sen
244 emir jess net
245 jin term sees
246 sin jee terms
247 tim jeer ness
248 tin jesse rem
249 sim jeers net
250 rim jess teen
251 jim ness tree
252 jim neer sets
253 sim jeer nest
254 rin jet seems
255 tin jesse erm
256 jim sen trees
257 stirs jee men
258 mire jess net
259 sins jee term
260 sims jeer net
261 mines jet ser
262 inert jess me
263 nit jess mere
264 sim jeer tens
265 item jess ern
266 trine jess me
267 rims jee sent
268 mir jets seen
269 sim jeer nets
270 rin jets seem
271 miss jee tern
272 jim sen steer
273 jin ems trees
274 ins jee terms
275 mir jest seen
276 is jeers ment
277 jim sen reset
278 nit jesse rem
279 rin jest seem
280 jim tern sees
281 tine jess rem
282 jim tens seer
283 nit jesse erm
284 neer jet sims
285 jim teens res
286 tine jess erm
287 mite jess ern
288 jim teens ers
289 rims jee nest
290 rees jim sent
291 jin ems steer
292 jim sen ester
293 mir jesse ten
294 neer jets sim
295 trim jee ness
296 jin ems reset
297 mis jee stern
298 rim jee nests
299 nim jee rests
300 sine jets mer
301 nim jets rees
302 rims jee tens
303 neer jest sim
304 ser jim tense
305 rims jee nets
306 mien jets ser
307 mis jee rents
308 sine jest mer
309 nim jest rees
310 mints jee res
311 sis jeer ment
312 jin ems ester
313 mints jee ers
314 ism jee stern
315 ere jim nests
316 mir jesse net
317 jin metre ess
318 rees jim nest
319 mien jest ser
320 tim jesse ern
321 ser jim teens
322 ism jee rents
323 emit jess ern
324 mir jess teen
325 rees jim tens
326 ere jin stems
327 mists jee ern
328 rees jim nets
329 mis jee terns
330 ree jim nests
331 sims jee rent
332 rees jin stem
333 rin jess mete
334 mint jess ere
335 rin jess meet
336 ism jee terns
337 rin jesse met
338 nite jess rem
339 tin jesse mer
340 sim jee stern
341 ree jin stems
342 nite jess erm
343 sim jee rents
344 jim seen tres
345 mint jess ree
346 rin jee stems
347 mir jee nests
348 nit jesse mer
349 sim jee terns
350 tine jess mer
351 jin seem tres
352 sims jee tern
353 ire jess ment
354 mints jee ser
355 sirs jee ment
356 tim jess neer
357 jin meets ser
358 nite jess mer
359 rei jess ment
360 eri jess ment

### wildwood:titles

input: Wildwood
category: titles
phrases 1 to 5 of 5

1 widow old
2 lid do wow
3 dildo wow
4 i dow wold
5 widow dol
