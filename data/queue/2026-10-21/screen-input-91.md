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

## File 91 of 98: 2521 phrases

### ojsimpson:people

input: O. J. Simpson
category: people
phrases 1 to 21 of 21

1 spins mojo
2 in joss mop
3 joins mops
4 in joss pom
5 snips mojo
6 on joss imp
7 jim spoons
8 no joss imp
9 so mops jin
10 jim son ops
11 jin mop sos
12 jim son sop
13 jim nos ops
14 jin som ops
15 jim nos sop
16 jin mos ops
17 jin pom sos
18 jin som sop
19 jin mos sop
20 jim ons ops
21 jim ons sop

### hoteldevillelimoges:places

input: Hôtel de Ville, Limoges
category: places
phrases 1 to 500 of 500

1 mole delight lovelies
2 the gill love melodies
3 i smelled the live logo
4 glee melts livelihood
5 the level mill goodies
6 i smelled the evil logo
7 glee smelt livelihood
8 the mollie lives lodge
9 i smelled the olive log
10 glee melt livelihoods
11 limited love goes hell
12 i levelled to his golem
13 gill leveled smoothie
14 me levelled this igloo
15 i smelled the vile logo
16 smooth leveled gillie
17 the evil smelled igloo
18 i levelled its home log
19 hovel molested gillie
20 his logo levelled time
21 the soiled level go mil
22 smoothed gillie level
23 live hell got melodies
24 i leveled the slim logo
25 lighted lovelies mole
26 this gloom leveled lie
27 the level mil go oldies
28 televised molehill go
29 limited elves go hello
30 me dig those level lilo
31 hillside glove omelet
32 evil hell got melodies
33 i levelled the slim goo
34 midlevel hostile loge
35 the veil smelled igloo
36 the ill lev go melodies
37 midlevel ogle hostile
38 level holes go limited
39 i give too smelled hell
40 midlevel holiest loge
41 limited legs hole love
42 i levelled his moot leg
43 midlevel egoist hello
44 the live igloo smelled
45 i go still leveled home
46 holiest midlevel ogle
47 limited levels go hole
48 level to me go hillside
49 this logo leveled mile
50 its lee hello move gild
51 the evils lodge mollie
52 i go live molested hell
53 this oil leveled golem
54 i go live smelled hotel
55 this goo levelled mile
56 i go level demolish let
57 limited leg holes love
58 me levelled his lit goo
59 this limo levelled ego
60 leg to me love hillside
61 this milo levelled ego
62 me levelled til his goo
63 the mollie veils lodge
64 i got live smelled hole
65 the ill glove melodies
66 give to i smelled hello
67 this logo leveled lime
68 it go live smelled hole
69 limited legs ooh level
70 i give lot smelled hole
71 limited hell love egos
72 i let love demolish leg
73 lee love lie goldsmith
74 i go evil molested hell
75 vile hell got melodies
76 i go him levelled stole
77 limited hell loves ego
78 i go evil smelled hotel
79 his gloom levelled tie
80 i levelled his moot gel
81 live mole lose delight
82 his lee glee vomit doll
83 limited leg hole loves
84 ive smelled the ill goo
85 this goo levelled lime
86 i got some leveled hill
87 lighted mile lose love
88 i goes him levelled lot
89 live helm tell goodies
90 level to i demolish leg
91 his logo levelled item
92 log leveled to his mile
93 live hell melt goodies
94 it go some leveled hill
95 live hog tell melodies
96 i got evil smelled hole
97 i levelled loose might
98 he give too smelled ill
99 limited ego shell love
100 i go list levelled home
101 this gloom leveled lei
102 i hole it smelled glove
103 limited log heels love
104 he got live smelled oil
105 limited lev goes hello
106 doll gee his live motel
107 olive let demolish leg
108 it go evil smelled hole
109 limited hell solve ego
110 oil levelled to his meg
111 limited leg ooh levels
112 i get him levelled solo
113 limited hole solve leg
114 him got so levelled lie
115 limited hello lose veg
116 me level i solo delight
117 limited eve logs hello
118 he give lot smelled oil
119 level moo get hillside
120 i love he molested gill
121 his igloo leveled melt
122 it live he smelled logo
123 limited gel holes love
124 love to me gel hillside
125 level hill met goodies
126 i go them levelled soil
127 solo might leveled lie
128 oil levelled to his gem
129 evil mole lose delight
130 i got ive smelled hello
131 his gloom leveled tile
132 him get so levelled oil
133 limited vole goes hell
134 he go live molested ill
135 the vile igloo smelled
136 i got him levelled sole
137 lighted lime lose love
138 him is too levelled leg
139 limited hog lose level
140 log leveled to his lime
141 ill liege love methods
142 me level so oil delight
143 this limo leveled loge
144 gills to i leveled home
145 this milo leveled loge
146 he go so levelled limit
147 evil helm tell goodies
148 i got she levelled limo
149 lee hell visited gloom
150 i got she levelled milo
151 evil hell melt goodies
152 i logs it levelled home
153 evil hog tell melodies
154 i love some delight ell
155 limited logs heel love
156 i go veil molested hell
157 the mis levelled igloo
158 i is them levelled logo
159 lighted mole love lies
160 i level so delight mole
161 his goo leveled millet
162 it is he levelled gloom
163 his toil leveled golem
164 it go ive smelled hello
165 the mils leveled igloo
166 i go veil smelled hotel
167 me let legs livelihood
168 it go him levelled sole
169 level tome go hillside
170 it is log levelled home
171 limited gels hole love
172 it go she levelled limo
173 limited log shoe level
174 it go she levelled milo
175 evil lot demolish glee
176 i see moll love delight
177 devilish gloom let lee
178 i let love demolish gel
179 limited gel hole loves
180 he got oil smelled evil
181 his logo levelled mite
182 hillside go me love let
183 limited leg shoo level
184 i mill hell go devotees
185 sole mole live delight
186 me go ell visited hello
187 level hilt go melodies
188 doll gee his evil motel
189 limited hell loose veg
190 it oil he smelled glove
191 evil loo smelled eight
192 he level so log limited
193 his loo leveled gimlet
194 it ooh live smelled leg
195 level hit log melodies
196 i get ell demolish love
197 sole oil leveled might
198 him go soil leveled let
199 level oil hole midgets
200 i go mist leveled hello
201 loved hotel slim liege
202 him go lot leveled lies
203 lighted moles love lie
204 i go till leveled homes
205 lighted mile sole love
206 them sell olive go lied
207 loose elm live delight
208 the ill mis leveled goo
209 devilish mole tell ego
210 i light so leveled mole
211 limited hells love ego
212 level to i demolish gel
213 live hell gel sodomite
214 his lee ell vomited log
215 some ell delight olive
216 i oil me levelled ghost
217 i levelled light moose
218 i got veil smelled hole
219 the slim igloo leveled
220 i got he levelled milos
221 the ism levelled igloo
222 i log he smelled violet
223 she level limited logo
224 him is logo leveled let
225 limited eve slog hello
226 the olive sill deem log
227 lee lei love goldsmith
228 i go shot levelled mile
229 lighted mole lose evil
230 me go oil levelled shit
231 him levelled til goose
232 the olive ills deem log
233 limited log heel loves
234 i go slit levelled home
235 lighted love seem lilo
236 i lose hell vomited leg
237 olive moll see delight
238 oil to him leveled legs
239 olive let demolish gel
240 limited go he love sell
241 limited gel ooh levels
242 it go veil smelled hole
243 limited hovel lose leg
244 i go shit levelled mole
245 lighted mole loves lie
246 he go ill molested evil
247 limited hole solve gel
248 it go he levelled milos
249 ill hovel get melodies
250 he go live smelled toil
251 them level ill goodies
252 i shit me levelled logo
253 limited lev goose hell
254 me levels i delight loo
255 its hog leveled mollie
256 mil levelled to his ego
257 limited log hose level
258 it leveled so home gill
259 level mote go hillside
260 i goes him leveled toll
261 level goo met hillside
262 i got he levelled limos
263 limited log shovel lee
264 me level i delights loo
265 limited glove hole les
266 i log else vomited hell
267 limited hello sole veg
268 i go them levelled oils
269 vile mole lose delight
270 it lose him leveled log
271 he levels limited logo
272 he level sol go limited
273 sighted mole level oil
274 i go them levelled silo
275 lite love demolish leg
276 hog to i levelled miles
277 ill gill devotees home
278 it log he smelled olive
279 evil hill molested ego
280 i let him leveled logos
281 lighted milos love lee
282 me level so lighted oil
283 shot mollie lived glee
284 i love some lighted ell
285 limited love slog heel
286 it go he levelled limos
287 evil let demolish loge
288 him is goo levelled let
289 vile helm tell goodies
290 i tool him leveled legs
291 evil mole sole delight
292 i log him leveled stole
293 its igloo leveled helm
294 it lie love smelled hog
295 violet lie smelled hog
296 hog to i levelled smile
297 me let leg livelihoods
298 i level so lighted mole
299 devilish gee tell loom
300 i love elm lose delight
301 limited log hole elves
302 it ooh evil smelled leg
303 vile hell melt goodies
304 i go some levelled hilt
305 limited heel solve log
306 i slog it levelled home
307 vile hog tell melodies
308 the ill ism leveled goo
309 lighted lime sole love
310 i hit some levelled log
311 shot mollie devil glee
312 i love else delight mol
313 devilish golem lot lee
314 me let vole go hillside
315 limited hog sole level
316 i got ill leveled homes
317 lighted mole solve lie
318 i got lie smelled hovel
319 evil elm loose delight
320 i level leg oil methods
321 limited gels ooh level
322 him is lot levelled ego
323 lighted limos love lee
324 the oil go live smelled
325 evil hell gel sodomite
326 i lie love smelled goth
327 he level limited logos
328 i log it levelled homes
329 limited legs hole vole
330 him is too levelled gel
331 lighted sole live mole
332 i love hole smelled git
333 lee lilo move delights
334 him go so levelled tile
335 lighted movie lose ell
336 i got mis leveled hello
337 lighted mole love isle
338 i got sill leveled home
339 lighted limo loves lee
340 its level mil heed logo
341 lighted milo loves lee
342 logs to him leveled lie
343 live ell delight moose
344 log to him leveled lies
345 devilish mole lot glee
346 i get him levelled loos
347 devilish glee tell moo
348 i sit he levelled gloom
349 limited logo shell eve
350 him go oil levelled set
351 level till hem goodies
352 it go ill leveled homes
353 ill meth level goodies
354 it go lie smelled hovel
355 smoothed glee live ill
356 i go shot levelled lime
357 smoothed gill live lee
358 i got miso leveled hell
359 limited glove hoe sell
360 i got ills leveled home
361 vile lot demolish glee
362 i ogle hit smelled love
363 devilish ell go omelet
364 i lie level log methods
365 eight oil smelled vole
366 me level i delight loos
367 solo might leveled lei
368 me hill ill go devotees
369 sighted lie loom level
370 him get so leveled lilo
371 olive elm lose delight
372 him go oils leveled let
373 evil toll demolish gee
374 me go soil levelled hit
375 devilish let ogle mole
376 he got oil smelled veil
377 vile loo smelled eight
378 i sit log levelled home
379 home oil levelled gist
380 i tell eve demolish log
381 limited leg oohs level
382 i till shovel gee model
383 ill hello vomited gees
384 i toil he smelled glove
385 limited gel shoo level
386 him go silo leveled let
387 devilish lee log motel
388 i till some leveled hog
389 limited hes level logo
390 i gets him levelled loo
391 sighted mile level loo
392 gill to i leveled homes
393 lighted moll see olive
394 it go mis leveled hello
395 level lit demolish ego
396 it go sill leveled home
397 devilish gloom let eel
398 him got so levelled lei
399 livelihood get me sell
400 i list log leveled home
401 lighted lee live looms
402 doll gee his vile motel
403 lee vote demolish gill
404 he go toil smelled evil
405 lee lit demolish glove
406 i get oil smelled hovel
407 olive lie smelled goth
408 it go miso leveled hell
409 limited log hoes level
410 it go ills leveled home
411 lee lilo moves delight
412 them sell olive go idle
413 devilish toll go melee
414 i set him levelled logo
415 lighted limo love eels
416 oil to me levelled sigh
417 lighted milo love eels
418 i lose ell move delight
419 limited hovel sell ego
420 he mill violet does leg
421 lighted mill loose eve
422 i goes tom leveled hill
423 home soil levelled git
424 i got lis levelled home
425 ill homo televised leg
426 i loot him leveled legs
427 lighted limo solve lee
428 still gee movie do hell
429 lighted milo solve lee
430 i go mol televised hell
431 lighted lies moo level
432 lee love hill to smidge
433 devilish glee let loom
434 me is hit levelled logo
435 ill motives heel lodge
436 sigh to i levelled mole
437 limited leg holes vole
438 it ooh live smelled gel
439 lighted mole lose veil
440 i leveled some hot gill
441 its igloo levelled hem
442 he sell vole go limited
443 i levelled eight looms
444 i let olive smelled hog
445 lighted lives loom lee
446 me level i slighted loo
447 lighted lie moo levels
448 i sight me levelled loo
449 ill sleeve moo delight
450 i love les delight mole
451 give oil molested hell
452 i lot him levelled egos
453 limited logs hoe level
454 i is the gloom levelled
455 violet ghee smile doll
456 he go lit smelled olive
457 lighted mole sole evil
458 i tells him leveled goo
459 limited hovel lose gel
460 it sell him leveled goo
461 give oil smelled hotel
462 i ogle him leveled lost
463 limited glove shoe ell
464 i sell hell vomited ego
465 limited hovel sole leg
466 he level milos to glide
467 lee move slighted lilo
468 him go lot leveled isle
469 lighted lie moos level
470 i go tills leveled home
471 limo leveled to sleigh
472 it go lis levelled home
473 milo leveled to sleigh
474 i got mill leveled shoe
475 evil ell delight moose
476 it veil he smelled logo
477 got level demolish lie
478 go to him levelled lies
479 devilish mole let loge
480 i go silt levelled home
481 smelled eight love oil
482 i go host levelled mile
483 he televised ill gloom
484 i sell hole vomited leg
485 olive les delight mole
486 i tell gloom heels dive
487 delight oil some level
488 i levelled so gilt home
489 digestive ell moo hell
490 i go hit levelled moles
491 vile hill molested ego
492 i level hit smelled goo
493 lighted elm loose evil
494 it is homo levelled leg
495 limited glove heel sol
496 them sell olive go deli
497 limited log hoe levels
498 levelled me go this oil
499 delight mile lose love
500 i hole it levelled smog

### adrianalima:people

input: Adriana Lima
category: people
phrases 1 to 500 of 500

1 radial mania
2 an laid maria
3 i alarm an aid
4 i arm an laid a
5 radial anima
6 an radial aim
7 i dial an mara
8 i rail an mad a
9 nada airmail
10 i air mandala
11 an a amid liar
12 i ram an laid a
13 i nail armada
14 i raid an lama
15 i mar an laid a
16 an arid lamia
17 laid air man a
18 i lam an arid a
19 ain a admiral
20 an a dial amir
21 i air a man lad
22 a dial marina
23 an a rid lamia
24 i air a man dal
25 i lain armada
26 an a raid lima
27 i man a rid ala
28 an maria dial
29 i ail an drama
30 i air a lam dna
31 arid animal a
32 an a dial rami
33 i ran a lam aid
34 radial main a
35 an a amid rail
36 dial i arm an a
37 a raid manila
38 i dial an maar
39 i lam a rid ana
40 dna airmail a
41 an a amid lair
42 an a i dam liar
43 a dial airman
44 raid mail an a
45 an a i rid lama
46 laid marina a
47 an a amid lira
48 dial i ram an a
49 a din malaria
50 in a dial mara
51 raid i lam an a
52 a and airmail
53 an air aim lad
54 an a i mail rad
55 a drain lamia
56 i rail an dama
57 an a i rail dam
58 aria man dial
59 mad nail air a
60 i ran a dim ala
61 i and malaria
62 maid rail an a
63 an a i dam lair
64 laid ain mara
65 in a raid lama
66 dial i mar an a
67 laid airman a
68 ain a arm dial
69 an a i aim lard
70 raid animal a
71 main a air lad
72 i air a and lam
73 nada mail air
74 an laid a amir
75 lad aim i ran a
76 an lamia raid
77 an lam air aid
78 an a i dam lira
79 ain maria lad
80 ain a dam liar
81 i arm a din ala
82 land aim aria
83 in a ail drama
84 i ram a din ala
85 laid aria man
86 laird aim an a
87 dal aim i ran a
88 mania air lad
89 laid aim ran a
90 i lam a din ara
91 dna mail aria
92 an laid a rami
93 ain a i arm lad
94 raid mail ana
95 an arid a mail
96 rad ail i man a
97 armada ail in
98 ain a rid lama
99 i mar a din ala
100 an mara iliad
101 ain a ram dial
102 i arm a and ail
103 lamia air dna
104 iliad arm an a
105 dna ail i arm a
106 anal a midair
107 an air aim dal
108 ain a i ram lad
109 radial mina a
110 an mild a aria
111 an a i ail dram
112 aid rain lama
113 in a dial maar
114 dam ail i ran a
115 laid ain maar
116 i ail an damar
117 i ram a and ail
118 liar aim nada
119 mad a lain air
120 dna ail i ram a
121 aria and mail
122 i land a maria
123 i rim a and ala
124 an ala midair
125 ain a lam raid
126 ain a i arm dal
127 maid rail ana
128 in a rail dama
129 ain a i mar lad
130 aid nail mara
131 main a air dal
132 i mar a and ail
133 air and lamia
134 damn ail air a
135 dna ail i mar a
136 ala mind aria
137 mad anil air a
138 ain a i ram dal
139 maid rain ala
140 an ala rid aim
141 mad ail i ran a
142 laid main ara
143 ain a dam lair
144 ain a i lam rad
145 arid manila a
146 ain a mar dial
147 ain a i mar dal
148 anima air lad
149 mild a air ana
150 mid a i ran ala
151 lima air nada
152 iliad ram an a
153 alma i rid an a
154 inlaid mara a
155 mad ala air in
156 mal i raid an a
157 lamia ran aid
158 ain a dam lira
159 ami i lard an a
160 dama nail air
161 anal a rid aim
162 i arm a ani lad
163 ain maria dal
164 an ala dim air
165 i rim a ana lad
166 ani alarm aid
167 an air ail dam
168 i ram a ani lad
169 liana air dam
170 main a rid ala
171 mal and i air a
172 ana amid liar
173 an arid a lima
174 i rim a ala dna
175 dna ail maria
176 an arm ail aid
177 i arm a ani dal
178 dam nail aria
179 mad ail rain a
180 i lard ama in a
181 liana arm aid
182 anal a dim air
183 i rim a ana dal
184 arid ain lama
185 i nail a drama
186 i dam a ara lin
187 anal air maid
188 iliad mar an a
189 i mar a ani lad
190 nada rail aim
191 laid ani arm a
192 an mild a ara i
193 mania air dal
194 laid a rim ana
195 i mal an arid a
196 mad liana air
197 aid in alarm a
198 lid i man ara a
199 ana dial amir
200 in a ail damar
201 lid i arm ana a
202 iliad man ara
203 mad a rail ani
204 i ram a ani dal
205 laird aim ana
206 i man laid ara
207 i lam a ani rad
208 ana rid lamia
209 air an mad ail
210 an a amid i lar
211 maid nail ara
212 an ram ail aid
213 i dam a ara nil
214 mad nail aria
215 i arm laid ana
216 i dam lar ain a
217 damn ail aria
218 dial air man a
219 lar and i aim a
220 ana raid lima
221 in ala arm aid
222 lid i ram ana a
223 aid ain alarm
224 arid ail man a
225 i mar a ani dal
226 maria and ail
227 an ala rim aid
228 rai and i lam a
229 lair aim nada
230 laid ani ram a
231 ria and i lam a
232 lanai air dam
233 dim a rail ana
234 a rai i man lad
235 iliad arm ana
236 an ara aid mil
237 lid i mar ana a
238 lanai arm aid
239 mid a rail ana
240 i air a lam dan
241 an maar iliad
242 i ran amid ala
243 a ria i man lad
244 drain aim ala
245 dim a rain ala
246 mad liar i an a
247 lira aim nada
248 i rail mad ana
249 i air a mal dna
250 main aria lad
251 mid a rain ala
252 i air a nam lad
253 mad lanai air
254 i lain a drama
255 i man a lar aid
256 aria and lima
257 aid liar man a
258 i ran a mal aid
259 ana dial rami
260 i drain a lama
261 lad ami i ran a
262 aid lain mara
263 an mar ail aid
264 a rai i man dal
265 liana ram aid
266 an aim ail rad
267 mad lair i an a
268 ana amid rail
269 a and air mail
270 a mal i rid ana
271 lama aid rani
272 mad a ail rani
273 a ria i man dal
274 aid nail maar
275 i air anal dam
276 a nai i arm lad
277 ain liar dama
278 i ram laid ana
279 mad lira i an a
280 anima air dal
281 in ala ram aid
282 i air a nam dal
283 ala rid mania
284 i arm anal aid
285 dan ail i arm a
286 ala amid rain
287 laid ani mar a
288 i ran a ama lid
289 ala din maria
290 radial i man a
291 i aim a lar dna
292 ain ail drama
293 dim a nail ara
294 a nai i ram lad
295 ana amid lair
296 land aim air a
297 dal ami i ran a
298 inlaid maar a
299 mid a nail ara
300 a rai i lam dna
301 anal arid aim
302 an mid ala air
303 a nam i rid ala
304 dama lain air
305 i nail mad ara
306 a ria i lam dna
307 anal dim aria
308 i man aria lad
309 a nai i arm dal
310 mara dial ani
311 i nail a damar
312 dan ail i ram a
313 mara aid anil
314 i darn a lamia
315 i lar ain mad a
316 ala raid mina
317 aid rail man a
318 a nai i mar lad
319 iliad ram ana
320 i man arid ala
321 i rim a dan ala
322 lanai ram aid
323 i mar laid ana
324 a nai i ram dal
325 ana amid lira
326 midi ala ran a
327 a lar i dim ana
328 anal mid aria
329 in ala mar aid
330 dan ail i mar a
331 ara dial mina
332 in ala aim rad
333 a nai i lam rad
334 dam lain aria
335 a and aim liar
336 a rin i dam ala
337 arid main ala
338 i ram anal aid
339 a nai i mar dal
340 laid amir ana
341 aid lair man a
342 a lar i dam ani
343 anal aim raid
344 mad ara ail in
345 a mal i din ara
346 lama raid ani
347 i lard a mania
348 i alma in a rad
349 liana mar aid
350 aid lira man a
351 an a mara lid i
352 liana aim rad
353 lid aim an ara
354 mal dan i air a
355 anil air dama
356 aid mail ran a
357 i and a ara mil
358 maid lain ara
359 an ara dim ail
360 an a i mair lad
361 mad aria lain
362 a and air lima
363 an a maar lid i
364 dial ain mara
365 arid ani lam a
366 i in a mara lad
367 ara amid nail
368 i air lama dna
369 i mal ain a rad
370 ala rid anima
371 i man ala raid
372 i lar in a dama
373 lama din aria
374 dim a lain ara
375 lar dan i aim a
376 aria dam anil
377 dial aim ran a
378 an a i mair dal
379 ain rail dama
380 dam nail air a
381 rai dan i lam a
382 main aria dal
383 mail a rid ana
384 ria dan i lam a
385 raid ain lama
386 i mar anal aid
387 i in a mara dal
388 laid rami ana
389 i aim anal rad
390 i in a maar lad
391 nadir aim ala
392 dial i man ara
393 i in a lama rad
394 ain lair dama
395 an a liar maid
396 maid i lar an a
397 ain lamia rad
398 mid a lain ara
399 nam lar i aid a
400 arid mail ana
401 aid nail arm a
402 i lar mad a ani
403 iliad mar ana
404 a and aim rail
405 i mir a and ala
406 mad anil aria
407 rad mail ain a
408 i lar mid a ana
409 lanai mar aid
410 i lard a anima
411 i in a maar dal
412 lanai aim rad
413 i lain mad ara
414 nai lar i dam a
415 mild aria ana
416 laid in mara a
417 i in a ala dram
418 aid lain maar
419 i man aria dal
420 rad ail i nam a
421 dinar aim ala
422 dial i arm ana
423 ama lar i din a
424 drama ail ani
425 dam rail ain a
426 lad amir i an a
427 ain lira dama
428 i lain a damar
429 i nai lar mad a
430 anal amir aid
431 a and aim lair
432 lad rami i an a
433 dama ail rain
434 i ail damn ara
435 rad lima i an a
436 laid ani mara
437 lard aim ain a
438 dal amir i an a
439 laid mina ara
440 a and aim lira
441 dal rami i an a
442 maar dial ani
443 i ran lama aid
444 mad lin i ara a
445 maar aid anil
446 in ara dim ala
447 i rai mal and a
448 ala amid rani
449 i lam arid ana
450 i ria mal and a
451 nada ail amir
452 an a maria lid
453 mad ala a rin i
454 anal rami aid
455 an laid mara i
456 i ami lar and a
457 dama rail ani
458 aid rain lam a
459 mad nil i ara a
460 dial ain maar
461 raid ail man a
462 i mir a ana lad
463 aida in alarm
464 laid ain arm a
465 i dan a ara mil
466 rad ail mania
467 i dam ana liar
468 i mir a ana dal
469 ain ail damar
470 i air lam nada
471 i mal a ani rad
472 nada ail rami
473 aid nail ram a
474 i rai mal a dna
475 raid main ala
476 a ran amid ail
477 i rai nam a lad
478 ara amid anil
479 i ran ala maid
480 i ria mal a dna
481 arid lima ana
482 aid lima ran a
483 i ria nam a lad
484 dial main ara
485 i rid ana lama
486 i ami lar a dna
487 ara din lamia
488 dial i ram ana
489 i rin ama a lad
490 midi anal ara
491 i aim ara land
492 i mir dan a ala
493 admiral ani a
494 dna mail air a
495 lid i nam ara a
496 laid ani maar
497 an a lair maid
498 rad lin i ama a
499 rad ail anima
500 i mail ara dna

### sachabaroncohen:people

input: Sacha Baron Cohen
category: people
phrases 1 to 500 of 500

1 she brooch canaan
2 she coach an baron
3 she coach an born a
4 anchor has beacon
5 an no breach chaos
6 her on a cash bacon
7 chosen aah carbon
8 an chance ooh bars
9 her no a cash bacon
10 nachos hear bacon
11 an case ooh branch
12 he coach an born as
13 casbah anchor one
14 an each born chaos
15 he coach an on bars
16 branch choose ana
17 he coach an barons
18 he coach an no bars
19 one chacha barons
20 an a broach chosen
21 an on a coach herbs
22 brooch chase anna
23 branch choose an a
24 an no a coach herbs
25 ones chacha baron
26 an coach has boner
27 he cash an on cobra
28 nacho share bacon
29 an chance has boor
30 he cash an no cobra
31 ocean hash carbon
32 an can shoo breach
33 her no cab an chaos
34 bean anchor chaos
35 an can reach hobos
36 he crab an on chaos
37 cabana chose horn
38 an echo has carbon
39 he crab an no chaos
40 broach chose anna
41 she roach an bacon
42 an on as coach herb
43 baron nose chacha
44 an hooch bears can
45 he coach an on bras
46 baron chase nacho
47 an one brash coach
48 an no as coach herb
49 ocean horn casbah
50 an on sober chacha
51 he coach an no bras
52 casbah reach noon
53 an chacha sober no
54 an on chaos be arch
55 base anchor nacho
56 one a branch chaos
57 an no chaos be arch
58 chances aah boron
59 an coach horn base
60 an on car has boche
61 beacon anchor ash
62 an chance ooh bras
63 an on a crash boche
64 baron chances hao
65 on reach has bacon
66 an no car has boche
67 barons chance hao
68 no reach has bacon
69 an no a crash boche
70 coon aah branches
71 on a abhors chance
72 he has an born coca
73 arson beach nacho
74 no a abhors chance
75 her on a con casbah
76 casbah cane honor
77 on a anchors beach
78 her no a con casbah
79 noon bears chacha
80 on as anchor beach
81 an on chaos be char
82 sonar beach nacho
83 no a anchors beach
84 an no chaos be char
85 each nachos baron
86 no as anchor beach
87 an sec a ooh branch
88 bane anchor chaos
89 an a branches coho
90 an on echo has crab
91 nacho bear nachos
92 an chore has bacon
93 an no echo has crab
94 hobos hear cancan
95 so anchor an beach
96 an on roc has beach
97 brooch aches anna
98 an cane has brooch
99 an no roc has beach
100 harsh ocean bacon
101 on cash hear bacon
102 her on a cabs nacho
103 nacho hears bacon
104 one coach has barn
105 her no a cabs nacho
106 carbon cones haha
107 an no chacha robes
108 her on a scab nacho
109 ana broach chosen
110 no cash hear bacon
111 her no a scab nacho
112 bacon censor haha
113 an coach shoe barn
114 an on hos beach car
115 beano anchor cash
116 an scan ooh breach
117 an no hos beach car
118 casbah roach none
119 an rash coach bone
120 he broach an on sac
121 none chacha boars
122 on as abhor chance
123 he coo an brash can
124 hao branch oceans
125 an honcho base car
126 he broach an no sac
127 carbon canoe hash
128 an can oohs breach
129 so arch an on beach
130 baron ache nachos
131 an coon has breach
132 an on as arch boche
133 anon breach chaos
134 on a breach nachos
135 so arch an no beach
136 nachos hare bacon
137 no as abhor chance
138 an no as arch boche
139 banner hash cocoa
140 an on chaos breach
141 an on car ash boche
142 banners coach hao
143 on a abhor chances
144 an on arc has boche
145 beacons corn haha
146 chance a has boron
147 an no car ash boche
148 raccoon hash bean
149 no a breach nachos
150 an on hash care cob
151 beacon scorn haha
152 an can abhors echo
153 an no arc has boche
154 cabana echo horns
155 an hooch beans car
156 he ash an born coca
157 chaos henna cobra
158 no a abhor chances
159 an no hash care cob
160 roan beach nachos
161 an cans ooh breach
162 so char an on beach
163 rash beacon nacho
164 an cash echo baron
165 he has on can cobra
166 carbon canoe shah
167 on no reach casbah
168 she can on broach a
169 shah bean raccoon
170 an chaos ache born
171 an on as char boche
172 aeon branch chaos
173 an no chacha bores
174 so char an no beach
175 acne honor casbah
176 chance son abhor a
177 he has no can cobra
178 barn noose chacha
179 so abhor an chance
180 she can no broach a
181 beano ranch chaos
182 an ache has bronco
183 an no as char boche
184 nacho roach beans
185 an as brace honcho
186 an on shah care cob
187 boars henna coach
188 an sac honor beach
189 an no shah care cob
190 casbah canoe horn
191 an concha has bore
192 an on ash echo crab
193 baron aches nacho
194 chance as ooh barn
195 an no ash echo crab
196 boson near chacha
197 an aces ooh branch
198 an on roc ash beach
199 hosanna beach roc
200 has an each bronco
201 born echo cash an a
202 saber chacha noon
203 on hero can casbah
204 an no roc ash beach
205 canon abhor chase
206 an son chacha bore
207 an born a cache hos
208 nachos roach bean
209 one as chacha born
210 an rash a coo bench
211 chon horse cabana
212 no hero can casbah
213 he can as on broach
214 cornea hash bacon
215 an ochre has bacon
216 he can as no broach
217 beacon corns haha
218 an coach hose barn
219 an on hos arc beach
220 roan chacha bones
221 an cash roach bone
222 an on hash race cob
223 broncos cane haha
224 an concha has robe
225 an no hos arc beach
226 boons near chacha
227 each a horns bacon
228 an coo cash her ban
229 coach abhor senna
230 once has an broach
231 he cab an rash coon
232 acorn hash beacon
233 on no bears chacha
234 an no hash race cob
235 sabre chacha noon
236 an son chacha robe
237 born hes coach an a
238 each nacho barons
239 on chaos ran beach
240 he can son broach a
241 nan abhor coaches
242 her cons aah bacon
243 an on shah race cob
244 raccoon hash bane
245 on can abhor chase
246 an no shah race cob
247 branch canoes hao
248 on acorn has beach
249 an rash a con boche
250 concha aah boners
251 an coach near bosh
252 she anchor on cab a
253 ana branches coho
254 each can has boron
255 an cash or on beach
256 harsh canoe bacon
257 an acne has brooch
258 she anchor no cab a
259 brooch chase naan
260 an cone has broach
261 an cash or no beach
262 shah beacon acorn
263 on one chacha bars
264 an coo nab her cash
265 banana hoe scorch
266 an hes coach baron
267 he caca an born hos
268 chaos abhor nance
269 no one chacha bars
270 he coach as on barn
271 anon chase broach
272 bone roach has can
273 an each hos con bar
274 nacho crash beano
275 an narcs ooh beach
276 he coach as no barn
277 nacho shear bacon
278 chance a ooh barns
279 an on rho beach sac
280 eons chacha baron
281 an chaos arch bone
282 an no rho beach sac
283 boson earn chacha
284 base can ooh ranch
285 an a so echo branch
286 sober anon chacha
287 on ache has carbon
288 her on cab an chaos
289 canna shoo breach
290 an chaos echo barn
291 an on ash arc boche
292 cancan abhor shoe
293 one coach has bran
294 an no ash arc boche
295 nacho hares bacon
296 an no abhors cache
297 her a con has bacon
298 beacons ranch hao
299 no ache has carbon
300 an sec a abhor chon
301 bronco canes haha
302 an ash coach boner
303 he can a cash boron
304 hobos reach canna
305 each as horn bacon
306 he ash on can cobra
307 bacon ranches hao
308 bone anchor cash a
309 he can on crash boa
310 barons ache nacho
311 chance a shoo barn
312 he ash no can cobra
313 nachos abhor cane
314 an scorch aah bone
315 he can no crash boa
316 nachos roach bane
317 an ash chance boor
318 he can cos aah born
319 boons earn chacha
320 an coach shoe bran
321 he cabs an arch ono
322 chon shore cabana
323 her ana coach snob
324 on a so each branch
325 hooch bears canna
326 each no bar nachos
327 no a so each branch
328 bran noose chacha
329 born ones chacha a
330 an on acre hash cob
331 hao breach canons
332 an coach bear nosh
333 he coach as on bran
334 hes brooch canaan
335 broach cash an one
336 an sec horn aah cob
337 bone arson chacha
338 one arch has bacon
339 an no acre hash cob
340 sone chacha baron
341 on chacha bear son
342 he scab an arch ono
343 broach chose naan
344 one hash can cobra
345 an hero so can bach
346 ashen coach baron
347 an on chase broach
348 an each hos con bra
349 bronc canoes haha
350 no chacha bear son
351 he coach as no bran
352 bone sonar chacha
353 chance a ran hobos
354 he scan on broach a
355 brooch ache annas
356 an hooch bear scan
357 he arch as on bacon
358 boche anchors ana
359 broach chase an no
360 he scan no broach a
361 annas brace hooch
362 on arch has beacon
363 he arch as no bacon
364 canna shoe broach
365 an ash borne coach
366 on no car has beach
367 cancan abhor hose
368 on as breach nacho
369 no on a crash beach
370 canon abhor aches
371 an nacho cash bore
372 he can a ranch boos
373 nacho abhors cane
374 he croon an casbah
375 an arch as echo nob
376 casbah roach neon
377 no as breach nacho
378 he aah so can bronc
379 broach echo annas
380 on nachos hear cab
381 an a she can brooch
382 banner shah cocoa
383 an ash echo carbon
384 an a so roach bench
385 neon chacha boars
386 an rash echo bacon
387 he cans on broach a
388 canon abhors ache
389 an coach hone bars
390 bronco can he has a
391 nachos arch beano
392 an each son broach
393 he caca on has born
394 hobos hare cancan
395 on hash care bacon
396 he cans no broach a
397 brash ocean nacho
398 on cache has baron
399 he caca no has born
400 nachos abhor acne
401 one shah can cobra
402 an ace hash rob con
403 brooch aches naan
404 an ace shoo branch
405 he has on arc bacon
406 casbah anchor eon
407 soon arch an beach
408 so horn a can beach
409 sabra cane honcho
410 no hash care bacon
411 he has no arc bacon
412 canons abhor ache
413 no cache has baron
414 she can a abhor con
415 annas breach coho
416 an hooch bear cans
417 he char as on bacon
418 bare nachos nacho
419 an chaos char bone
420 he can a abhors con
421 canna hose broach
422 an coach earn bosh
423 an ace shah rob con
424 anon aches broach
425 an on ochre casbah
426 he char as no bacon
427 boche arc hosanna
428 born nose chacha a
429 he con a cash baron
430 nacho hone scarab
431 one cos aah branch
432 no on a cash breach
433 nacho roach banes
434 broach can an shoe
435 so on a ranch beach
436 nachos char beano
437 an no ochre casbah
438 an son or each bach
439 hooch saber canna
440 an nacho cash robe
441 he crab as on nacho
442 canna oohs breach
443 each can ooh barns
444 on cash a be anchor
445 nacho abhor canes
446 bone a ranch chaos
447 so no a ranch beach
448 canna abhors echo
449 bacon cash an hero
450 he crab as no nacho
451 chore nosh cabana
452 beach roach an son
453 no cash a be anchor
454 acorn hone casbah
455 so breach an nacho
456 he can a arch boson
457 eon chacha barons
458 chance as ooh bran
459 an rho so can beach
460 nacho abhors acne
461 on chosen aah crab
462 on a cash each born
463 hooch sabre canna
464 an coach hoes barn
465 he nosh a can cobra
466 cancan abhor hoes
467 an hooch bean cars
468 an as he can brooch
469 coca abhors henna
470 an chaos ran boche
471 he coo can has barn
472 boche roach annas
473 on shah care bacon
474 no a cash each born
475 brooch each annas
476 born a chase nacho
477 he can a abhor cons
478 cancan abhors hoe
479 none a cash broach
480 an a so ranch boche
481 anon abhors cache
482 an no abhor caches
483 brash echo con an a
484 scarab henna coho
485 an acorn has boche
486 an sac ban her coho
487 ashen roach bacon
488 an arch each boson
489 he ooh can ran cabs
490 abhors each canon
491 no shah care bacon
492 he so can an broach
493 sane nacho broach
494 one char has bacon
495 he can a arch boons
496 neo anchor casbah
497 each can shoo barn
498 he can as abhor con
499 baser chacha noon
500 an chon bear chaos

### normmacdonald:people

input: Norm Macdonald
category: people
phrases 1 to 500 of 500

1 command an lord
2 an dorm don calm
3 calm random don
4 an dorm man cold
5 cold random man
6 cold don man arm
7 command ran old
8 an don mold marc
9 doc damn normal
10 an dorm mold can
11 cold damn roman
12 an mad cold norm
13 clamor damn don
14 an dorm don clam
15 on lard command
16 on arm damn cold
17 command lard no
18 cold don man ram
19 calm damn donor
20 cold damn arm no
21 cold damn manor
22 an man mold cord
23 cod damn normal
24 calm man don rod
25 almond don marc
26 an don cram mold
27 dorm can almond
28 old don cram man
29 condom land arm
30 on old damn marc
31 macon damn lord
32 on lord damn mac
33 candor land mom
34 an mad cold morn
35 almond man cord
36 on mold damn car
37 don cram almond
38 on mold man card
39 damn random col
40 an odd calm norm
41 con lord madman
42 cold norm damn a
43 condom lard man
44 mad mon lord can
45 common land rad
46 on lord damn cam
47 madam conn lord
48 old mom can rand
49 calm damn rondo
50 on ram damn cold
51 land or command
52 cold don man mar
53 condom land ram
54 an mon mold card
55 calm random nod
56 cold damn ram no
57 candor man mold
58 on norm calm dad
59 mon card almond
60 no norm calm dad
61 clam damn donor
62 on rod damn calm
63 clad damn moron
64 no rod damn calm
65 clod damn roman
66 mad norm can old
67 common lard dna
68 an odd calm morn
69 cordon damn lam
70 on dram don calm
71 command ran dol
72 mad old man corn
73 condom land mar
74 on old cram damn
75 condor damn lam
76 cold morn damn a
77 acorn damn mold
78 calm dram don no
79 lard and common
80 cold darn an mom
81 donna mold marc
82 on morn calm dad
83 almond damn roc
84 an dorm damn col
85 clod damn manor
86 no morn calm dad
87 calm donna dorm
88 mad morn can old
89 can random mold
90 an dorm man clod
91 clad random mon
92 cord land an mom
93 macon land dorm
94 on mar damn cold
95 clamor damn nod
96 cold damn mar no
97 random man clod
98 on dram man cold
99 common lad darn
100 cold dram man no
101 condom darn lam
102 an dorm nod calm
103 dorm clam donna
104 an cold mom rand
105 clam random don
106 an damn mold roc
107 mod random clan
108 calm darn do mon
109 colon damn dram
110 old man damn roc
111 almond dam corn
112 cold dna ran mom
113 clam damn rondo
114 on norm add calm
115 mold cram donna
116 clad mom ran don
117 mad almond corn
118 no norm add calm
119 common lad rand
120 calm arm don nod
121 rand lam condom
122 calm dna do norm
123 drama conn mold
124 on dorm calm dna
125 candor damn mol
126 no dorm calm dna
127 almond nod marc
128 damn lam do corn
129 cold madam norn
130 cold damn an rom
131 corn old madman
132 an dam mold corn
133 madman nor cold
134 old mom card nan
135 lad nor command
136 on dorm land mac
137 macon darn mold
138 no dorm land mac
139 madman corn dol
140 on morn add calm
141 common dal darn
142 calm rand do mon
143 cord mold manna
144 on lam damn cord
145 nod cram almond
146 no morn add calm
147 cold dorm manna
148 on dram mold can
149 rand mold macon
150 calm dna do morn
151 dram con almond
152 on mol damn card
153 common dal rand
154 no mol damn card
155 canna mold dorm
156 on norm clam dad
157 nomad mold narc
158 mad norm do clan
159 dram mold canon
160 mad mon ran cold
161 dal nor command
162 on arm damn clod
163 damar conn mold
164 cold nod man arm
165 clam random nod
166 no norm clam dad
167 clad nomad norm
168 on rod damn clam
169 madman nor clod
170 calm rad don mon
171 mod almond narc
172 clad man do norm
173 clad nomad morn
174 no rod damn clam
175 nam random cold
176 calm dna don rom
177 cor damn almond
178 on dorm land cam
179 dom random clan
180 clad no man dorm
181 narco damn mold
182 don or damn calm
183 calm rodman don
184 no dorm land cam
185 orc damn almond
186 on dram don clam
187 command lar don
188 on mold damn arc
189 cold rodman man
190 old mon can dram
191 common lard dan
192 an nod mold marc
193 calm darn mondo
194 calm ram don nod
195 clan nomad dorm
196 mod man ran cold
197 nam random clod
198 clad mom darn no
199 calm rand mondo
200 calm dorm do nan
201 can rodman mold
202 on morn clam dad
203 cad almond norm
204 mad morn do clan
205 clam rodman don
206 an mad mold corn
207 clod madam norn
208 no morn clam dad
209 cad almond morn
210 cod land ran mom
211 cordon damn mal
212 clad man do morn
213 marc land mondo
214 mad norn do calm
215 condom damn lar
216 mad rom don clan
217 condor damn mal
218 damn rod man col
219 clod dorm manna
220 cold rad man mon
221 candor malm don
222 odd mon ran calm
223 col rodman damn
224 cold dna man rom
225 clod rodman man
226 clad man don rom
227 condom darn mal
228 man or damn cold
229 calm rodman nod
230 cold dam an norm
231 command lar nod
232 on mod darn calm
233 cordon and malm
234 on dna mold marc
235 condor and malm
236 an dorm nod clam
237 cad norland mom
238 cold dna arm mon
239 condom lard nam
240 on ram damn clod
241 clam darn mondo
242 cold nod man ram
243 candor nam mold
244 no dna mold marc
245 mondo carl damn
246 clad arm don mon
247 clad rodman mon
248 on mold darn mac
249 cram land mondo
250 no mold darn mac
251 condo darn malm
252 calm man nod rod
253 clan rodman mod
254 on dorm damn lac
255 mac norland mod
256 on mod land marc
257 clam rodman nod
258 on dorm and calm
259 card almond nom
260 can and lord mom
261 cord almond nam
262 on dol damn marc
263 cam norland mod
264 no dorm damn lac
265 cord donna malm
266 an nod cram mold
267 clam rand mondo
268 no dorm and calm
269 candor malm nod
270 calm mar don nod
271 clad random nom
272 no dol damn marc
273 condom rand mal
274 an norm mold cad
275 cold rodman nam
276 damn mol can rod
277 narc almond dom
278 old nod cram man
279 clan dram mondo
280 odd norm lam can
281 cordon dna malm
282 an dram mold con
283 condor dna malm
284 marc man old don
285 condo rand malm
286 mad no mold narc
287 clan rodman dom
288 on norm add clam
289 mac norland dom
290 clod darn an mom
291 cam norland dom
292 cold dam an morn
293 cordon dan malm
294 on mold darn cam
295 condor dan malm
296 old dram man con
297 clod rodman nam
298 odd man lam corn
299 clad rodman nom
300 no norm add clam
301 no mold darn cam
302 on dorm clam dna
303 cod man ran mold
304 an cold mon dram
305 mad arm conn old
306 mod mold ran can
307 no dorm clam dna
308 on dorm dam clan
309 cold dam ran mon
310 mad norm don lac
311 on mod calm rand
312 card land on mom
313 no dorm dam clan
314 no mod calm rand
315 can man old dorm
316 card land no mom
317 on rand mold mac
318 an morn mold cad
319 clad no damn rom
320 on mold cram dna
321 no rand mold mac
322 odd morn lam can
323 on mar damn clod
324 cold dna ram mon
325 cold nod man mar
326 can lard don mom
327 clad ram don mon
328 on dram man clod
329 on morn add clam
330 cord damn an mol
331 can dna lord mom
332 mad norm can dol
333 no dram man clod
334 no morn add clam
335 mold or damn can
336 can darn old mom
337 on mod cram land
338 an mod mold narc
339 mad dol man corn
340 on dol cram damn
341 no mod cram land
342 cod land man rom
343 no dol cram damn
344 mad morn don lac
345 on dram nod calm
346 on rand mold cam
347 odd rom man clan
348 mad mon corn lad
349 old mon cram dna
350 an mod clad norm
351 an odd norm clam
352 can arm mold don
353 calm dram nod no
354 no rand mold cam
355 damn rom can dol
356 cod land arm mon
357 calm dam do norn
358 odd mon arm clan
359 don or damn clam
360 mad mold ran con
361 marc damn old no
362 mac damn lord no
363 cod lad man norm
364 an mad norm clod
365 mad morn can dol
366 mod norm can lad
367 mad ram conn old
368 on mold and marc
369 don nor mad calm
370 car damn mold no
371 card man mold no
372 narc and old mom
373 clad mon man rod
374 an mod clad morn
375 an odd morn clam
376 clod damn an rom
377 cold dna mar mon
378 cam damn lord no
379 clad mar don mon
380 mad norn do clam
381 mad mol don narc
382 odd mon ran clam
383 cod lard man mon
384 on mold dam narc
385 an clad mon dorm
386 car damn old mon
387 card man old mon
388 cod lad man morn
389 no mold dam narc
390 an mad morn clod
391 marc and old mon
392 mod morn can lad
393 on mod darn clam
394 odd norm man lac
395 mod man land roc
396 can ram mold don
397 can man lord mod
398 clad no dam norm
399 damn dol man roc
400 mad mon ran clod
401 cod land ram mon
402 odd mon ram clan
403 mad norm con lad
404 cram damn old no
405 an mod dorm clan
406 on dorm and clam
407 car land don mom
408 mad mon darn col
409 man nor mad cold
410 no dorm and clam
411 can damn old rom
412 clad mom ran nod
413 mad mar conn old
414 mac and old norm
415 arc land don mom
416 damn mod ran col
417 cold and ran mom
418 odd morn man lac
419 mod man ran clod
420 clad no dam morn
421 mad mon corn dal
422 calm and do norm
423 mod man darn col
424 mon and calm rod
425 on mod clam rand
426 mad morn con lad
427 no mod clam rand
428 cam and old norm
429 cold mod arm nan
430 con lord mad man
431 can man mold rod
432 cod dal man norm
433 corn mold damn a
434 mac and old morn
435 mod norm can dal
436 cod damn ran mol
437 mac man lord don
438 can mar mold don
439 man or damn clod
440 cord don lam man
441 clod dam an norm
442 odd man nor calm
443 odd rom calm nan
444 cod land mar mon
445 col don damn arm
446 car damn don mol
447 card man don mol
448 odd mon mar clan
449 calm rad nod mon
450 cod darn man mol
451 calm and do morn
452 don nor calm dam
453 calm dna nod rom
454 car man mold don
455 clam man don rod
456 mad dna corn mol
457 mod nan lord mac
458 nod or damn calm
459 can dam lord mon
460 on dram nod clam
461 odd mol man narc
462 cam and old morn
463 cam man lord don
464 calm and don rom
465 arc man mold don
466 mold nor mad can
467 cod dal man morn
468 mod rand man col
469 old nor damn mac
470 mod morn can dal
471 mod nan mold car
472 clod dam an morn
473 damn mon arc dol
474 con old damn arm
475 mod nan lord cam
476 can dam old norm
477 cod mom lard nan
478 mon nor calm dad
479 damn nor do calm
480 mad norm con dal
481 don nor mad clam
482 cold mod ram nan
483 corn old dam man
484 mad rom nod clan
485 calm ran mod don
486 old nor damn cam
487 card lam don mon
488 man nor cold dam
489 cold rom dam nan
490 odd arm conn lam
491 mod rod calm nan
492 clad man nod rom
493 cod darn lam mon
494 cod rand man mol
495 cod mold arm nan
496 mod mol can rand
497 mad mol darn con
498 cord damn lam no
499 can dram mold no
500 col don damn ram

### jackieshroff:people

input: Jackie Shroff
category: people
phrases 1 to 500 of 500

1 off hijackers
2 his offer jack
3 i off her jacks
4 hijack offers
5 fisher of jack
6 off is her jack
7 hijacker offs
8 i chaff jokers
9 his ref of jack
10 heirs off jack
11 i offs her jack
12 off hires jack
13 she jack of fir
14 shire off jack
15 he jack off sir
16 off hire jacks
17 he jack of firs
18 off rich jakes
19 off chi jerks a
20 joker is chaff
21 off chi jerk as
22 chaff joke sir
23 fresh jack of i
24 jock fish fear
25 off chis jerk a
26 heir off jacks
27 i off hers jack
28 cash joke riff
29 jock if fresh a
30 serf of hijack
31 sick ref of haj
32 jack shoe riff
33 he so riff jack
34 haj sick offer
35 i so jerk chaff
36 his joker caff
37 cash jerk i off
38 jock fish fare
39 fir jack of hes
40 refs of hijack
41 she riff jock a
42 cake josh riff
43 he riffs jock a
44 res off hijack
45 he riff jocks a
46 jack hose riff
47 she if far jock
48 ers off hijack
49 he riff jock as
50 hire offs jack
51 raj sick he off
52 off sicker haj
53 jar sick he off
54 heir offs jack
55 ok chefs if raj
56 raj shock fife
57 he if far jocks
58 jar shock fife
59 ok sec riff haj
60 fife josh rack
61 jar chef of ski
62 jack hoes riff
63 hes if far jock
64 raj shock fief
65 heck i off jars
66 jar shock fief
67 off sec irk haj
68 jocks eff hair
69 josh rick eff a
70 fief josh rack
71 ok chis eff raj
72 jack hoe riffs
73 i eff shock raj
74 raj scoff hike
75 i eff shock jar
76 jar scoff hike
77 josh i eff rack
78 raj echo skiff
79 his jack or eff
80 jack fore fish
81 offs chi jerk a
82 jar echo skiff
83 ifs of her jack
84 jock eff hairs
85 oh i jerks caff
86 rocks eff haji
87 ref if has jock
88 haj rocks fife
89 fer of his jack
90 a jock sheriff
91 raj chef of ski
92 jacks hoe riff
93 i jerk hos caff
94 haj rocks fief
95 heck off is raj
96 jars hock fife
97 heck off is jar
98 haj core skiff
99 ref fish jock a
100 rack eff shoji
101 fork if sec haj
102 raj hocks fife
103 i eff rocks haj
104 jar hocks fife
105 is rock eff haj
106 haj coke riffs
107 is hock eff raj
108 rash jock fife
109 is hock eff jar
110 jars hock fief
111 i eff hock jars
112 jack offers hi
113 i eff hocks raj
114 raj hocks fief
115 i eff hocks jar
116 jar hocks fief
117 so eff hick raj
118 rash jock fief
119 so eff hick jar
120 haj cokes riff
121 i eff rho jacks
122 corks eff haji
123 oh jerk is caff
124 hijack eff ors
125 eff so rick haj
126 jacks offer hi
127 heck i offs raj
128 haj corks fife
129 heck i offs jar
130 sherif of jack
131 jars chef if ok
132 haj corks fief
133 feck of his raj
134 chai off jerks
135 feck of his jar
136 chia off jerks
137 rash jock eff i
138 ser off hijack
139 jar chefs if ok
140 aff rich jokes
141 hi res off jack
142 afresh if jock
143 hes riff jock a
144 jiff rose hack
145 jars chi eff ok
146 are shock jiff
147 is cork eff haj
148 far chefs koji
149 hi ers off jack
150 she croak jiff
151 ref if ash jock
152 he croaks jiff
153 jack eff rho is
154 feck josh fair
155 hi ref of jacks
156 jiff sore hack
157 jiff she rock a
158 search jiff ok
159 sri he off jack
160 chaff joe risk
161 i eff corks haj
162 jack horse iff
163 hi off jerk sac
164 rash coke jiff
165 she if for jack
166 jacks fife rho
167 jiff he rocks a
168 shack joe riff
169 hi so jerk caff
170 arch jokes iff
171 jerk if of cash
172 crash joke iff
173 jiff he rock as
174 kif josh farce
175 jar chis eff ok
176 jack shore iff
177 he of fir jacks
178 are hocks jiff
179 jiff she ok car
180 chaff joe kris
181 sick or eff haj
182 jacks fief rho
183 oh sick eff raj
184 ahi scoff jerk
185 ich off jerks a
186 ear shock jiff
187 he jack for ifs
188 chaser jiff ok
189 a scoff jerk hi
190 hack joe riffs
191 raff he is jock
192 arches jiff ok
193 ich off jerk as
194 joe shirk caff
195 hes if for jack
196 arch joe skiff
197 cis kor eff haj
198 hacks joe riff
199 ref if sock haj
200 chaff joke sri
201 feck i josh far
202 era shock jiff
203 jack ref if hos
204 chaos jerk iff
205 jiff she cork a
206 caff jokers hi
207 jiff he ok cars
208 ark chose jiff
209 jiff her ok sac
210 char joe skiff
211 he if for jacks
212 far feck shoji
213 her jock is aff
214 rack shoe jiff
215 hic off jerks a
216 hear sock jiff
217 hic off jerk as
218 jake rich offs
219 jiff he cork as
220 crash eff koji
221 jiff he corks a
222 each jiff kors
223 ick she off raj
224 ears hock jiff
225 ick she off jar
226 jack eff roshi
227 jar chef if kos
228 rack hose jiff
229 jiff he ok scar
230 a shocker jiff
231 her jocks iff a
232 creak josh iff
233 hers if of jack
234 hare sock jiff
235 ick he off jars
236 sack hero jiff
237 her jock iff as
238 hack joes riff
239 jar chi eff kos
240 sear hock jiff
241 jack serf of hi
242 ask chore jiff
243 jiff she ok arc
244 char jokes iff
245 jack eff oh sir
246 hers koji caff
247 jack refs of hi
248 arse hock jiff
249 jiff he ask roc
250 caff joke shri
251 hi sock eff raj
252 reach jiff kos
253 irk cos eff haj
254 hear jocks iff
255 aff so jerk chi
256 cash joker iff
257 ifs ok jar chef
258 raff chi jokes
259 i aff her jocks
260 raj chokes iff
261 jiff he ok arcs
262 joes irk chaff
263 kif so jar chef
264 chase jiff kor
265 sho i jerk caff
266 jars choke iff
267 he ifs far jock
268 jar chokes iff
269 raj chef if kos
270 share jock iff
271 iff he sock raj
272 haj forces kif
273 feck is for haj
274 rhea sock jiff
275 iff he sock jar
276 ear hocks jiff
277 fer jock fish a
278 rack hoes jiff
279 raj chi eff kos
280 haj ick offers
281 jack serf if oh
282 ask ochre jiff
283 hi jock eff ras
284 ras choke jiff
285 iff he jack ors
286 ares hock jiff
287 so iff her jack
288 era hocks jiff
289 haj sic eff kor
290 chai jerk offs
291 rah i eff jocks
292 sera hock jiff
293 jack refs if oh
294 shea jock riff
295 hi jock eff ars
296 ars choke jiff
297 jar sick eff oh
298 shake roc jiff
299 ick off jar hes
300 racks hoe jiff
301 a sock her jiff
302 hears jock iff
303 hi or eff jacks
304 as choker jiff
305 haj roc eff ski
306 ache jiff kors
307 ick he offs raj
308 aff jocks hire
309 ick he offs jar
310 raff chis joke
311 he rack so jiff
312 jack heros iff
313 hi ser off jack
314 aches jiff kor
315 ok chef ifs raj
316 creaks oh jiff
317 fer of sick haj
318 hacker jiff so
319 rec off ski haj
320 cash kore jiff
321 if of her jacks
322 chia jerk offs
323 feck fir josh a
324 hae jock riffs
325 ok hes jiff car
326 hae jocks riff
327 ich jerk offs a
328 eras hock jiff
329 jiff ok arc hes
330 joe raff hicks
331 fer if has jock
332 shack ore jiff
333 she fro if jack
334 aff chi jokers
335 kir off sec haj
336 hack eros jiff
337 jiff he arc kos
338 aff jocks heir
339 hic jerk offs a
340 aff jock heirs
341 a rock hes jiff
342 jiff shea rock
343 she iff or jack
344 shack roe jiff
345 off hes ick raj
346 aff jock hires
347 shri jock eff a
348 haj frocks fie
349 haj feck of sir
350 croak hes jiff
351 jar sock eff hi
352 haj fresco kif
353 kif for sec haj
354 rah jocks fife
355 he fro if jacks
356 cakes rho jiff
357 she arf if jock
358 jacks hero iff
359 he jiff or sack
360 chaff res koji
361 jacks ref if oh
362 jiff hae rocks
363 jack eff hi ors
364 aff jock shire
365 he arf if jocks
366 chaff ers koji
367 iff or jack hes
368 hare jocks iff
369 fer if ash jock
370 hacks ore jiff
371 heck if of jars
372 creak hos jiff
373 hi fer of jacks
374 raff ich jokes
375 oh jiff sec ark
376 shear jock iff
377 a cork hes jiff
378 rah jocks fief
379 he iff or jacks
380 aff chis joker
381 ick serf of haj
382 hares jock iff
383 heck ifs of raj
384 hacks roe jiff
385 heck ifs of jar
386 cask hero jiff
387 hi feck of jars
388 joe aff kirsch
389 ick refs of haj
390 koji arf chefs
391 he jiff or cask
392 raff hic jokes
393 off res ick haj
394 raff jocks hie
395 off ers ick haj
396 jiff shea cork
397 a hock res jiff
398 jiff sark echo
399 fer if sock haj
400 iff chao jerks
401 a hock ers jiff
402 aff ich jokers
403 jack fer if hos
404 jiff hae corks
405 heck jiff or as
406 jiff rah cokes
407 so jar iff heck
408 soar heck jiff
409 he aff sir jock
410 joes raff hick
411 jars ich eff ok
412 oars heck jiff
413 oh iff jack res
414 rhea jocks iff
415 oh iff jack ers
416 shack oer jiff
417 ref if sha jock
418 arf feck shoji
419 hes if arf jock
420 cars hoke jiff
421 is jock eff rah
422 aff hic jokers
423 i she raff jock
424 jiff ska chore
425 he ask jiff cor
426 crash oke jiff
427 he jack fro ifs
428 chaff ser koji
429 jars hic eff ok
430 hacks oer jiff
431 jack ref ifs oh
432 scar hoke jiff
433 jack hes if fro
434 shake cor jiff
435 raj feck if hos
436 creak sho jiff
437 kir cos eff haj
438 jiff ska ochre
439 jar feck if hos
440 shake orc jiff
441 i he raff jocks
442 chaff joes kir
443 jack ref if sho
444 arcs hoke jiff
445 haj cris eff ok
446 sora heck jiff
447 jiff rah ok sec
448 he jiff cos ark
449 he ask jiff orc
450 i josh feck arf
451 chef so kif raj
452 hers iff jock a
453 i raff hes jock
454 kor iff sec haj
455 oh ick eff jars
456 aff sic jerk oh
457 raj ick eff hos
458 jar ick eff hos
459 haj cor eff ski
460 ser ick off haj
461 raj ich eff kos
462 aff cis jerk oh
463 jar ich eff kos
464 i hers aff jock
465 haj feck if ors
466 sho fer if jack
467 jack eff oh sri
468 haj orc eff ski
469 he iff jock ras
470 jacks fer if oh
471 raj hic eff kos
472 sri feck of haj
473 jar hic eff kos
474 car he jiff kos
475 he iff jock ars
476 so iff heck raj
477 aff cos jerk hi
478 fro feck is haj
479 jars feck if oh
480 so jerk ich aff
481 he ifs arf jock
482 fir so feck haj
483 res aff hi jock
484 ers aff hi jock
485 fer sha if jock
486 a heck jiff ors
487 sac jerk oh iff
488 he sri aff jock
489 so jerk hic aff
490 sho feck if raj
491 sho feck if jar
492 fro kif sec haj
493 haj ick eff ors
494 jack fer ifs oh
495 a hock ser jiff
496 has rec jiff ok
497 ash rec jiff ok
498 sac he jiff kor
499 he jiff ska roc
500 ifs feck or haj
