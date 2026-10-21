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

## File 89 of 98: 2858 phrases

### helenhaines:people

input: Helen Haines
category: people
phrases 1 to 500 of 500

1 inhale sheen
2 his lee henna
3 he heels an in
4 he sel in hen a
5 he shine lane
6 she heel an in
7 he in hen les a
8 she heal nine
9 she lie an hen
10 an hen les he i
11 he shine lean
12 he shin an lee
13 he in hen els a
14 he leash nine
15 he lie an hens
16 an hen els he i
17 he heels nina
18 i heels an hen
19 he i sel an hen
20 she hale nine
21 he lies an hen
22 he i hen lens a
23 he heals nine
24 he heel an sin
25 she lie henna
26 i heel an hens
27 she alien hen
28 an hen is heel
29 he aliens hen
30 an in heel hes
31 she heel nina
32 he shin an eel
33 i heels henna
34 he heel an ins
35 he alien hens
36 lee in has hen
37 he lies henna
38 he hie an lens
39 he hales nine
40 an hes lie hen
41 he nail sheen
42 in eel has hen
43 he heal nines
44 he seal in hen
45 he inhale sen
46 he has lee inn
47 he shine elan
48 he is lean hen
49 he hale nines
50 he lean in hes
51 he henna isle
52 lee hen shin a
53 nine has heel
54 lee in ash hen
55 she aline hen
56 he heal in sen
57 he aline hens
58 he hale in sen
59 she henna lei
60 he she lean in
61 he lain sheen
62 he heels inn a
63 an shine heel
64 an les hie hen
65 in heal sheen
66 in eel ash hen
67 heel is henna
68 a in heels hen
69 hen seen hail
70 he lash nee in
71 lee nine shah
72 he has nee lin
73 henna his eel
74 he is hen lane
75 ash heel nine
76 she heel inn a
77 nine heal hes
78 he ash lee inn
79 hale sheen in
80 a in heel hens
81 hes lie henna
82 heel he is nan
83 ain heels hen
84 his lee an hen
85 ale shine hen
86 he heel inn as
87 nina heel hes
88 he has nee nil
89 lea shine hen
90 an lee hes hin
91 ashen heel in
92 an in eels heh
93 an senile heh
94 an els hie hen
95 ain heel hens
96 as in heel hen
97 ani heels hen
98 he heel inns a
99 hale hes nine
100 he has eel inn
101 sine heal hen
102 an in lees heh
103 nee hale shin
104 he she lie nan
105 nee line hash
106 he i heels nan
107 alien hen hes
108 an lee hens hi
109 nan hie heels
110 he is hen elan
111 hes aline hen
112 she i lean hen
113 hale hin seen
114 heh an lee sin
115 hash nine lee
116 he i lean hens
117 lane hie hens
118 he ash nee lin
119 nee line shah
120 nah he see lin
121 nine eel shah
122 his eel an hen
123 lei henna hes
124 his lee nan he
125 ani heel hens
126 she i heel nan
127 hin lease hen
128 i lash nee hen
129 lean hie hens
130 i he henna les
131 ashen hen lie
132 he lie hes nan
133 lanes hie hen
134 shh an nee lie
135 nee shin heal
136 an lin see heh
137 henna hie les
138 he i leans hen
139 heh nine sale
140 he ash nee nil
141 hen ail sheen
142 nah he see nil
143 leans hie hen
144 i lean hes hen
145 nee hens hail
146 i heal sen hen
147 sane line heh
148 heh an lee ins
149 hash nine eel
150 he sin hen ale
151 ane shin heel
152 nah he sin lee
153 he nine shale
154 he sin hen lea
155 an lines hehe
156 he ash eel inn
157 hale hen sine
158 an nil see heh
159 ashen line he
160 i hale sen hen
161 else henna hi
162 an lee hin she
163 sane hin heel
164 i he henna els
165 nail seen heh
166 hi he lean sen
167 elan hie hens
168 nah he lie sen
169 henna hie els
170 an in else heh
171 nee lien hash
172 heh i lean sen
173 saline hen he
174 a lie hens hen
175 ahh nine eels
176 shh an nee lei
177 ahh line seen
178 heh lin seen a
179 ashen hin lee
180 nah i heel sen
181 hehe in lanes
182 nah he sin eel
183 alien sen heh
184 a sin heel hen
185 ashen hen lei
186 hen as lee hin
187 nee hen hails
188 an sen heel hi
189 nee lien shah
190 he hie les nan
191 heal hin seen
192 a inn heel hes
193 nah shine lee
194 heh an nee lis
195 inane lee shh
196 an in les hehe
197 nee lines ahh
198 nan i heel hes
199 ane hin heels
200 lene he has in
201 else nine ahh
202 heh nil seen a
203 hehe in leans
204 he ail hen sen
205 nee hin leash
206 a shin hen eel
207 ahh nine lees
208 nah hen is lee
209 lean shin hee
210 a ins heel hen
211 heh nine ales
212 nah in lee hes
213 hah nine eels
214 shh lee nine a
215 hah line seen
216 heh as lee inn
217 ane lines heh
218 ahh in lee sen
219 nee hin heals
220 he hie els nan
221 heh nee nails
222 an hen else hi
223 nene his hale
224 an in els hehe
225 nee lines hah
226 a hie hen lens
227 ahh linen see
228 an line she he
229 else nine hah
230 an lei hen hes
231 anil seen heh
232 hah in lee sen
233 hah nine lees
234 a hin heel sen
235 lean sine heh
236 an eels hi hen
237 sane lien heh
238 an eel hi hens
239 nee hin shale
240 nah hen is eel
241 slain hen hee
242 lene he shin a
243 senna lie heh
244 lene he ash in
245 ashen hin eel
246 nine les heh a
247 nee hin hales
248 heh in nee las
249 inane les heh
250 shh in nee ale
251 nah shine eel
252 nee line shh a
253 heh nee snail
254 shh in nee lea
255 hehe nine las
256 nine eel shh a
257 inane eel shh
258 ahh in nee les
259 she hail nene
260 an lees hi hen
261 hah linen see
262 he else in nah
263 shh nee aline
264 an line hes he
265 ashen lien he
266 lene i has hen
267 lane shin hee
268 nan is lee heh
269 seal nine heh
270 his hen lene a
271 ahh lien seen
272 in hes hen ale
273 lane hi sheen
274 in hes hen lea
275 an heil sheen
276 lee hens hin a
277 nina else heh
278 heh as nee lin
279 hehe nine als
280 an hin hes eel
281 lean hi sheen
282 hah in nee les
283 nah sheen lie
284 lens hehe in a
285 ain lens hehe
286 heh in nee als
287 inane els heh
288 an lie sen heh
289 nah heel sine
290 he hae in lens
291 he hails nene
292 i hehe an lens
293 hah lien seen
294 ane in lee shh
295 he selah nine
296 lee inns heh a
297 lease heh inn
298 nine els heh a
299 he shea linen
300 heh as nee nil
301 senna hi heel
302 ahh in nee els
303 alien nee shh
304 he she in lane
305 ahh nines lee
306 an lin she hee
307 she hae linen
308 an lien she he
309 has hee linen
310 sha in lee hen
311 lash hee nine
312 she hi lee nan
313 lean sin hehe
314 in hen hee las
315 sha heel nine
316 nan is eel heh
317 henna hi eels
318 an sin eel heh
319 he hae linens
320 in eel nah hes
321 senile nah he
322 in sen heh ale
323 nails hen hee
324 an hin hee les
325 nah hee lines
326 in sen heh lea
327 elan shin hee
328 his eel nan he
329 hae heels inn
330 an isle hen he
331 leash hee inn
332 hah in nee els
333 nail hens hee
334 i nah lee hens
335 ash hee linen
336 an nils hee he
337 hah nines lee
338 he heil an sen
339 sea linen heh
340 he in hen sale
341 she liane hen
342 nee lien shh a
343 henna hi lees
344 an nil she hee
345 shea heel inn
346 an lei hen she
347 he liane hens
348 ane in les heh
349 easel heh inn
350 an lei hens he
351 sane lin hehe
352 lene i ash hen
353 elan hi sheen
354 he in hes lane
355 she linea hen
356 an lin hes hee
357 snail hen hee
358 ane in eel shh
359 hansel hee in
360 nee nils heh a
361 he linea hens
362 an lien hes he
363 nai heels hen
364 lee hes hi nan
365 nah sheen lei
366 in hen hee als
367 shale hee inn
368 i shh nee lane
369 slain nee heh
370 an lei sen heh
371 lean ins hehe
372 he nah lee ins
373 ahh nines eel
374 i shh nee lean
375 aline sen heh
376 an ins eel heh
377 lane sin hehe
378 an hin he else
379 hales hee inn
380 an hin hee els
381 ale hin sheen
382 she in hen ale
383 nae shin heel
384 an lis hen hee
385 lea hin sheen
386 an nil hes hee
387 heal his nene
388 he sha lee inn
389 nan lies hehe
390 nah she in lee
391 nina eels heh
392 he she in elan
393 nai heel hens
394 she in hen lea
395 lain hens hee
396 he in hens ale
397 sane nil hehe
398 he hi ane lens
399 easel hen hin
400 he in hens lea
401 hale hee inns
402 i ahh nee lens
403 ashen hee lin
404 i lash he nene
405 hah nines eel
406 ane in els heh
407 hash lie nene
408 i heh ane lens
409 henna hee lis
410 he sel ain hen
411 lane sine heh
412 nee hen hi las
413 hae heel inns
414 ahh in eel sen
415 shah lie nene
416 in les hae hen
417 nina lees heh
418 he in hen ales
419 heals hee inn
420 i hah nee lens
421 anil sheen he
422 an hes lene hi
423 ale nines heh
424 he else hi nan
425 sane heil hen
426 a line hen hes
427 lea nines heh
428 ain les hen he
429 shea hen line
430 he in hes elan
431 ashen hee nil
432 ane les hi hen
433 leans hin hee
434 i henna he sel
435 a linens hehe
436 i shh nee elan
437 heal hee inns
438 nah he in eels
439 senna lei heh
440 hah in eel sen
441 hae hens line
442 nah she in eel
443 ane nils hehe
444 i else nah hen
445 selah nee hin
446 in eel sha hen
447 as linen hehe
448 he nah nee lis
449 hae hen lines
450 sel he hie nan
451 senna heil he
452 nee hen hi als
453 seal inn hehe
454 nah he in lees
455 elan sin hehe
456 he sha nee lin
457 nee hansel hi
458 heh linn see a
459 anil hens hee
460 heh sel nine a
461 sean line heh
462 in els hae hen
463 lanes hin hee
464 an hin he eels
465 nail sen hehe
466 an hin she eel
467 ane heil hens
468 sel hie an hen
469 elan sine heh
470 ain els hen he
471 nah heil seen
472 ane els hi hen
473 hail hes nene
474 nah hi lee sen
475 sha hee linen
476 heh sal nee in
477 hehe sal nine
478 he hi sen lane
479 sean hin heel
480 he sha nee nil
481 hae hes linen
482 an hin he lees
483 hae sheen lin
484 ane lin she he
485 sale inn hehe
486 he sal nee hin
487 hehe sean lin
488 i heh sen lane
489 sean heil hen
490 a lei hens hen
491 selah hee inn
492 an hi hee lens
493 nina les hehe
494 a inn else heh
495 shea hen lien
496 a lien hen hes
497 lash hie nene
498 he hi eels nan
499 lain sen hehe
500 she hi eel nan

### kimjongun:people

input: Kim Jong Un
category: people
phrases 1 to 18 of 18

1 joking mun
2 junk go nim
3 on jug mink
4 no jug mink
5 jinn ok gum
6 jinn ok mug
7 jug ink mon
8 jug in monk
9 jug kin mon
10 jim on gunk
11 mig on junk
12 mig junk no
13 gunk jim no
14 mun kin jog
15 nom kin jug
16 go mink jun
17 jog ink mun
18 jug ink nom

### barbarapalvin:people

input: Barbara Palvin
category: people
phrases 1 to 500 of 500

1 larva barb pain
2 an lava barb rip
3 i plan var barb a
4 larva pan rabbi
5 an bap bar rival
6 i rap van bar lab
7 rabbi pal varna
8 an barb rap vial
9 i pal van bar bra
10 larva nap rabbi
11 naval a barb rip
12 i par van bar lab
13 napa barb rival
14 pilar van barb a
15 i lap van bar bra
16 pavan barb liar
17 an lav barb pair
18 i pan var bar lab
19 arrival ban bap
20 viral pan barb a
21 i nap var bar lab
22 larva brain bap
23 an barb par vial
24 a bar van rip lab
25 rabbi lap varna
26 viral nap barb a
27 i pal ban bar var
28 naval rap rabbi
29 an bra rival bap
30 i bar bra pan lav
31 para barb anvil
32 in lava rap barb
33 i bar bra nap lav
34 libra bar pavan
35 an lav rap rabbi
36 a pal van bar rib
37 arrival nab bap
38 an larva rap bib
39 i lap ban bar var
40 pair blab varna
41 in lava par barb
42 i bar var nab pal
43 pavan barb rail
44 an lav par rabbi
45 i rap bar ban lav
46 naval par rabbi
47 plain var barb a
48 in pal var barb a
49 pavan barb lair
50 vain lab bar rap
51 a lap van bar rib
52 pavan barb lira
53 an parr bib lava
54 i rap var ban lab
55 pair naval barb
56 vain pal bar bra
57 i bar bap ran lav
58 varna barb pail
59 an var barb pail
60 i bar var nab lap
61 viral napa barb
62 an larva par bib
63 i ban var pal bra
64 naval bap briar
65 bar an viral bap
66 i rap bar nab lav
67 avian parr blab
68 an larva rib bap
69 i pal an var barb
70 brava banal rip
71 in bap bar larva
72 in lap var barb a
73 pari naval barb
74 i barb naval rap
75 i par bar ban lav
76 briar lab pavan
77 vain lab bar par
78 a rap van rib lab
79 anvil parr baba
80 vain lap bar bra
81 i rap var nab lab
82 brain brava pal
83 rabbi pal an var
84 a pal van rib bra
85 plain brava bar
86 vain a blab parr
87 i par var ban lab
88 brain brava lap
89 vain bra rap lab
90 i ban var lap bra
91 libra bra pavan
92 naval a bib parr
93 i nab var pal bra
94 pilar ban brava
95 i barb naval par
96 i lap an var barb
97 rabbi alp varna
98 rabbi lap an var
99 i rap bra ban lav
100 plain brava bra
101 in para barb lav
102 i par bar nab lav
103 bairn bap larva
104 an viral bra bap
105 an a barb lav rip
106 arrival pan bab
107 bra bar via plan
108 barb i rap an lav
109 arrival nap bab
110 vain bra par lab
111 a par van rib lab
112 libra bap varna
113 ain var barb pal
114 a lap van rib bra
115 rival paan barb
116 pair blab an var
117 i par var nab lab
118 brain brava alp
119 blab via an parr
120 i nab var lap bra
121 bairn brava pal
122 barn bar via pal
123 an a barb var lip
124 viral paan barb
125 ain var barb lap
126 i rap bra nab lav
127 libra brava pan
128 in var blab para
129 a rap var blab in
130 libra brava nap
131 ain lav rap barb
132 i par bra ban lav
133 pilar varna bab
134 barb ran via pal
135 a bar var pin lab
136 bairn brava lap
137 barn bar via lap
138 barb i par an lav
139 pari blab varna
140 vain alp bar bra
141 i bar var ban alp
142 rabbi lar pavan
143 rival pan barb a
144 a pal var bar bin
145 pina larva barb
146 rival nap barb a
147 i blab an rap var
148 bairn brava alp
149 pair lab bar van
150 i par bra nab lav
151 briar bal pavan
152 ain lav par barb
153 a bar van rib alp
154 labia brr pavan
155 barb ran via lap
156 a par var blab in
157 pail barn brava
158 barn rap via lab
159 i bar var nab alp
160 pilar brava nab
161 bran bar via pal
162 a lap var bar bin
163 pail bran brava
164 bra pal via barn
165 a bar bra pin lav
166 anvil parr abba
167 ain var blab rap
168 a bar var nip lab
169 i barb pan larva
170 bin bar lav rap a
171 i pal varna barb
172 a bar lav ban rip
173 i barb nap larva
174 i blab an par var
175 barn par via lab
176 rib bar lav pan a
177 bran bar via lap
178 a rap var bin lab
179 bra lap via barn
180 a bar var ban lip
181 pin larva barb a
182 a ban var rip lab
183 ain var blab par
184 rib bar lav nap a
185 i lap varna barb
186 a pal var bin bra
187 bran rap via lab
188 a pan var rib lab
189 ain var barb alp
190 i barb an var alp
191 bra pal via bran
192 a bar lav nab rip
193 nip larva barb a
194 a nap var rib lab
195 barn bar via alp
196 bin bar lav par a
197 bran par via lab
198 a bar bra nip lav
199 bra lap via bran
200 a ran var pal bib
201 parr ban via lab
202 a bar var nab lip
203 rap van bail bra
204 in lav rap barb a
205 pain lab bar var
206 a nab var rip lab
207 barb ran via alp
208 a par var bin lab
209 rip baal bar van
210 a lap var bin bra
211 pin lava bar bra
212 a pal var ban rib
213 i blab varna rap
214 a rap lav bin bra
215 rabbi plan var a
216 a ban bra rip lav
217 rip lava ban bar
218 a ran var lap bib
219 parr nab via lab
220 blip bar an var a
221 anal var rap bib
222 an a parr bib lav
223 par van bail bra
224 a pan lav rib bra
225 bran bar via alp
226 a pal var bar nib
227 pain lav bar bra
228 a rap lav ran bib
229 air pal van barb
230 a nap lav rib bra
231 rip lava nab bar
232 in lav par barb a
233 i blab varna par
234 a lap var ban rib
235 nip lava bar bra
236 a pal var nab rib
237 anal var par bib
238 a nab bra rip lav
239 bail bar van rap
240 rib ban lav rap a
241 anvil rap barb a
242 a par lav bin bra
243 anal var rib bap
244 a lap var bar nib
245 bar bap rail van
246 a bar var bin alp
247 van bra pair lab
248 nib bar lav rap a
249 i barb varna alp
250 a par lav ran bib
251 barb van air alp
252 a ran lav rib bap
253 a bap rival barn
254 a lap var nab rib
255 air lap van barb
256 rip blab an var a
257 bail bar pan var
258 rib nab lav rap a
259 rap lava bin bra
260 rib ban lav par a
261 blip bar varna a
262 nib bar lav par a
263 rip lava ban bra
264 in alp var barb a
265 bail bar nap var
266 rib nab lav par a
267 barb van rip ala
268 a ran var bib alp
269 rip lav ran baba
270 a ban var rib alp
271 pair lav ban bar
272 a nab var rib alp
273 pan lava rib bra
274 i blab van parr a
275 bib lava ran rap
276 i rap van bra lab
277 lip varna barb a
278 i par van bra lab
279 bail bar van par
280 i bar bra van alp
281 nap lava rib bra
282 i pan var bra lab
283 anvil par barb a
284 i nap var bra lab
285 air lav pan barb
286 lip van bar bra a
287 rap van rib baal
288 a van bra rip lab
289 air lav nap barb
290 i ran var bap lab
291 pair lab ban var
292 i ran bra bap lav
293 rip lava nab bra
294 an a var bra blip
295 par lava bin bra
296 a var bra pin lab
297 pair lav nab bar
298 i ban var bra alp
299 ail van rap barb
300 a van alp rib bra
301 bib lava ran par
302 i nab var bra alp
303 ran lava rib bap
304 a var bra nip lab
305 a bap rival bran
306 lib bar van rap a
307 rip blab varna a
308 bal bar a rip van
309 pair lab nab var
310 i rap van bar bal
311 air blab van rap
312 lip ban bra var a
313 par van rib baal
314 lin bap bar var a
315 bail bra pan var
316 lib bar van par a
317 bap bar van liar
318 lip nab bra var a
319 bin bar lava rap
320 i par van bar bal
321 bail bra nap var
322 nib lab rap var a
323 pail van bar bra
324 i rap van bal bra
325 pair lav ban bra
326 nib bra pal var a
327 rib bar lava pan
328 nil bap bar var a
329 para van rib lab
330 brr a pan via lab
331 bar bap rain lav
332 i bar bap lar van
333 rib bar lava nap
334 brr a nap via lab
335 rib baa plan var
336 i pal van baa brr
337 bail ban rap var
338 nib lab par var a
339 vial pan bar bra
340 nib bra lap var a
341 ail van par barb
342 i par van bal bra
343 barb ana rip lav
344 a var alp bin bra
345 pin baal bar var
346 nib bra lav rap a
347 vial nap bar bra
348 brr a ban via pal
349 air blab van par
350 i lap van baa brr
351 bin bar lava par
352 var bab i ran pal
353 bail bap ran var
354 nib bra lav par a
355 pair lav nab bra
356 brr a ban via lap
357 nail bap bar var
358 brr a nab via pal
359 var bra pain lab
360 nib bar alp var a
361 vial ban bar rap
362 var bab i ran lap
363 baa barn rip lav
364 bal bar a pin var
365 van bra rip baal
366 bab rap i ran lav
367 rib aba plan var
368 brr a nab via lap
369 bail ban par var
370 bab par i ran lav
371 bap bar van lair
372 bal bar a nip var
373 vial ran bap bar
374 a bal van rip bra
375 nip baal bar var
376 bal rap a bin var
377 bap bar van lira
378 bal ban a rip var
379 vial nab bar rap
380 van brr i baa alp
381 viral barn bap a
382 bal pan a rib var
383 blip bar van ara
384 bal nap a rib var
385 bib lav ran para
386 rib bal van rap a
387 vial ban bar par
388 lib rap a nab var
389 ran var blab pia
390 bal nab a rip var
391 lip ran var baba
392 i rap var nab bal
393 lip van barb ara
394 bal par a bin var
395 bin baal rap var
396 brr a ban via alp
397 rip baal ban var
398 brr baa i pan lav
399 rib ban lava rap
400 var bab i ran alp
401 barb var pin ala
402 brr baa i nap lav
403 rib baal pan var
404 lar pan a bib var
405 vial ban bra rap
406 an a brr bap vial
407 pin lav barb ara
408 rib bal van par a
409 rib baal nap var
410 lar nap a bib var
411 bra bap rail van
412 lib par a nab var
413 vial nab bar par
414 brr a nab via alp
415 nib bar lava rap
416 i par var nab bal
417 baa bran rip lav
418 bib lar van rap a
419 lain bap bar var
420 i bal bar pan var
421 i plan brava bar
422 aba brr i pan lav
423 rip baal nab var
424 i bal bar nap var
425 vial ran bap bra
426 aba brr i nap lav
427 bin bar lav para
428 i ban var lar bap
429 rib nab lava rap
430 i brr naval a bap
431 an var alp rabbi
432 lip ran var bab a
433 bin baal par var
434 bib lar van par a
435 rip blab van ara
436 a lar van rib bap
437 barn bar lav pia
438 i nab var lar bap
439 rib ban lava par
440 i bal bra pan var
441 vial nab bra rap
442 i bal bra nap var
443 viral bran bap a
444 an a ava brr blip
445 air blab pan var
446 lib bra van rap a
447 var para bin lab
448 a bal var pin bra
449 air blab nap var
450 i bal ban rap var
451 bab an viral rap
452 ava brr i pan lab
453 vial ban bra par
454 ava brr i nap lab
455 barb var nip ala
456 lin rap var bab a
457 blip bar ana var
458 i brr an bap lava
459 nib bar lava par
460 i bal bap ran var
461 bra barn via alp
462 lib bra van par a
463 brava bar an lip
464 i bal ban par var
465 an lab brava rip
466 a bal var nip bra
467 in larva bap bra
468 lin par var bab a
469 lin rap var baba
470 i pal van aba brr
471 var bap rain lab
472 a brr bap ail van
473 pia lav ran barb
474 in lav parr bab a
475 nip lav barb ara
476 nil rap var bab a
477 bani bar pal var
478 ava brr i nab pal
479 rib nab lava par
480 lib bar pan var a
481 bap barn air lav
482 bab lar i rap van
483 var barb ana lip
484 lib bar nap var a
485 in lav parr baba
486 a lar var bin bap
487 pail ban bar var
488 i lap van aba brr
489 an lav bap briar
490 an a brr vail bap
491 vial nab bra par
492 i bab an parr lav
493 an var bap libra
494 rip lav ran bab a
495 bail nab rap var
496 a brr aba pin lav
497 rib bar lav napa
498 ava brr i nab lap
499 lava rap bra nib
500 nil par var bab a

### lawrencebishnoi:people

input: Lawrence Bishnoi
category: people
phrases 1 to 500 of 500

1 balconies whiner
2 his canine bowler
3 his on new caliber
4 i cables her in now
5 his canine blower
6 his no new caliber
7 i cables her in won
8 whose caliber inn
9 his on new calibre
10 his on in blew care
11 whose calibre inn
12 his no new calibre
13 i own her in cables
14 once brains while
15 new in is bachelor
16 i win her on cables
17 bachelors wine in
18 i clown her sabine
19 i win her no cables
20 in bachelor swine
21 i enable his crown
22 his on in blew race
23 i wrenches albino
24 i blows her canine
25 i bow her in cleans
26 caliber shine now
27 her blow is canine
28 his on in blew acre
29 now rich baseline
30 i blow her canines
31 i bow her in lances
32 win her balconies
33 her now lie cabins
34 care blew his in no
35 bachelor wines in
36 her ben win social
37 his now crib an lee
38 clarion been wish
39 her new social bin
40 i is here blown can
41 in search bowline
42 her bowl is canine
43 his won crib an lee
44 caliber nine show
45 i bowl her canines
46 race blew his in no
47 below insane rich
48 we cabins her lion
49 his lee own an crib
50 caliber none wish
51 we clarion his ben
52 i be his wan cornel
53 i ranches bowline
54 on chili be answer
55 his now crib an eel
56 nice whales robin
57 on in were chablis
58 i lose we branch in
59 liaison be wrench
60 herbal nice is now
61 her in bone sic law
62 on whines caliber
63 no chili be answer
64 i be in new scholar
65 caliber shine won
66 her won lie cabins
67 i blew in on search
68 calibre shine now
69 no in were chablis
70 her new lob is cain
71 else chin rainbow
72 his in enable crow
73 i blew in no search
74 else inch rainbow
75 her lie own cabins
76 his won crib an eel
77 won rich baseline
78 in wheel is carbon
79 her cis in bone law
80 caliber whines no
81 in wine be scholar
82 acre blew his in no
83 new choir lesbian
84 we coil his banner
85 i is we rob channel
86 who bins reliance
87 in lower be chains
88 his eel own an crib
89 who ascribe linen
90 his on caliber wen
91 an cis whirl be one
92 own rich baseline
93 his no caliber wen
94 i lies we branch no
95 answer bone chili
96 his lee win carbon
97 we bleach in on sir
98 casino been whirl
99 in while be acorns
100 we bleach in no sir
101 brains cone while
102 on in breach lewis
103 we is on lie branch
104 line show carbine
105 herbal nice is won
106 i is row be channel
107 calibre nine show
108 in owner is bleach
109 i is now lee branch
110 who enables ricin
111 no in breach lewis
112 we lie so in branch
113 rainbows leech in
114 casino blew her in
115 i see in low branch
116 calibre none wish
117 in lewis be anchor
118 her lice win an sob
119 sailor been winch
120 won line be chairs
121 i be in answer loch
122 hernia blows nice
123 his ben win oracle
124 an rich sow lie ben
125 branches wine oil
126 own line is breach
127 i be now search lin
128 alibis wrench one
129 lesbian cow her in
130 i bleach on new sir
131 in bachelor sinew
132 i bachelor in news
133 i sole we branch in
134 bachelor wine sin
135 his in corneal web
136 her won lin ice abs
137 below nine chairs
138 own nice is herbal
139 i bleach no new sir
140 cashier blow nine
141 his ben own eclair
142 i horn we cables in
143 on whines calibre
144 his bin own cereal
145 i lie we branch son
146 calibre shine won
147 on in blew cashier
148 i bin he clears now
149 calibre whines no
150 own line be chairs
151 i is we branch noel
152 sabine corn while
153 cleaner bow his in
154 i blow he cranes in
155 albino cheers win
156 his lie cow banner
157 i lie so new branch
158 easier blown chin
159 her in cables wino
160 her own lin ice abs
161 easier blown inch
162 his on calibre wen
163 i be in choral news
164 nice inhales brow
165 serial now be chin
166 i is won branch lee
167 berlin owe chains
168 serial now be inch
169 i be who clears inn
170 brains coin wheel
171 his no calibre wen
172 he was in born lice
173 arsenic bin whole
174 able in choir news
175 i corn in be whales
176 nice while barons
177 own rich be aliens
178 i is we orb channel
179 sailor bench wine
180 i bachelors new in
181 i is lee own branch
182 cabins whore line
183 be his new clarion
184 her lice win an bos
185 brains nice whole
186 we conn her alibis
187 i belches in worn a
188 heroin win cables
189 corneal in be wish
190 i search now in bel
191 now inhale scribe
192 in line bow search
193 i search in low ben
194 breach wine lions
195 her now cabins lei
196 i chin we blares no
197 clarion be whines
198 in wen is bachelor
199 i inch we blares no
200 canine ribs whole
201 we cabins her loin
202 an bin ices her low
203 cashier bowl nine
204 his crown been ail
205 i be won search lin
206 caliber whine son
207 in chin elbows are
208 her won lin ice bas
209 canines rob while
210 in inch elbows are
211 i see in branch owl
212 noble wire chains
213 in wins be cholera
214 we is on nicer blah
215 whole sin carbine
216 in now search bile
217 i chew in on blares
218 earlobes winch in
219 in win lose breach
220 i blew in on chaser
221 chairs elbow nine
222 we cabins her lino
223 i blew in on arches
224 nine abolish crew
225 i own in bleachers
226 i bin he clears won
227 robin chew aliens
228 own in lies breach
229 we is no nicer blah
230 bronchial win see
231 new lie his carbon
232 i chew in no blares
233 carbon whines lie
234 in bowels chin are
235 i blew in no chaser
236 in newbie scholar
237 in bowels inch are
238 i breach now in les
239 inhalers bow nice
240 in wench be sailor
241 i blew in no arches
242 lesbian chew iron
243 her new social nib
244 i bone he crawls in
245 her winces albino
246 his wen be clarion
247 i own lin be search
248 below rich sienna
249 on in wires bleach
250 i be now search nil
251 lion win breaches
252 new lion is breach
253 i bowl he cranes in
254 in arches bowline
255 her cow bin aliens
256 her won nil ice abs
257 reliance bin show
258 insane low be rich
259 her own lin ice bas
260 icon wheel brains
261 on sir wine bleach
262 i be in low ranches
263 insane crib whole
264 her sec win albino
265 i be in learns chow
266 herbal sonic wine
267 no sir wine bleach
268 i own he clears bin
269 inhaler bows nice
270 won chin be serial
271 we is on breach lin
272 herbal coins wine
273 won inch be serial
274 we is in choral ben
275 line whirs beacon
276 her no cabins wile
277 i is now branch eel
278 iris enhance blow
279 in now cables heir
280 we is no breach lin
281 lines wine broach
282 in cows be inhaler
283 we rob in cash line
284 once whirl sabine
285 his niece rob lawn
286 her own nil ice abs
287 liner wish beacon
288 her bel win casino
289 we is lin be anchor
290 whence oil brains
291 she own in caliber
292 we breach so in lin
293 robin chin weasel
294 his wen lie carbon
295 we be on chairs lin
296 win enables choir
297 on winch be serial
298 i search in won bel
299 robin inch weasel
300 in now breach isle
301 we is in con herbal
302 won inhale scribe
303 new line is broach
304 we be no chairs lin
305 once whir lesbian
306 her won cabins lei
307 i be now learns chi
308 answer boil niche
309 his eel win carbon
310 we blares on in chi
311 beacon relish win
312 an shrew boil nice
313 i is he cowl banner
314 caliber shine own
315 no winch be serial
316 we blares no in chi
317 sabine chin lower
318 caliber hen is now
319 i win so lee branch
320 sabine inch lower
321 new chin be sailor
322 we is on branch lei
323 albino crew shine
324 own chin be serial
325 i slew in on breach
326 nine chairs bowel
327 new inch be sailor
328 we is no branch lei
329 chains bower line
330 own inch be serial
331 i slew in no breach
332 rainbows chin lee
333 who blares in nice
334 i show in clean reb
335 sienna crib whole
336 wiser no bleach in
337 an one lis brew chi
338 rainbows inch lee
339 new iron is bleach
340 i be wish ran clone
341 chins were albino
342 her cob win aliens
343 i own in search bel
344 bachelor wine ins
345 own rich be saline
346 i breach in won les
347 below cashier inn
348 won in search bile
349 he is wile can born
350 lions beware chin
351 in chi blew reason
352 sic be an one whirl
353 lions beware inch
354 i reaches blown in
355 i slew in be anchor
356 corneas bin while
357 i wheels in carbon
358 i be we anchor nils
359 niece howl brains
360 his corneal win be
361 i be we anchors lin
362 lion breach swine
363 in ben wish oracle
364 i be won search nil
365 cabins wheel iron
366 on in birch weasel
367 i bone he scrawl in
368 sabine clown hire
369 cereal bin his now
370 we branch so in lei
371 canine blows hire
372 own in rise bleach
373 he is ben clown air
374 cole whine brains
375 i win on bleachers
376 her won nil ice bas
377 nice inhale brows
378 on win lies breach
379 i is new choral ben
380 calibre whine son
381 her lei own cabins
382 he saw in born lice
383 carbine holes win
384 her neb win social
385 an bin ices her owl
386 lie shown carbine
387 in whirl be oceans
388 i own in breach les
389 chablis wire none
390 i win no bleachers
391 i con he warbles in
392 carbon whine lies
393 on wise lie branch
394 i lob in new search
395 canines blow hire
396 own in hire cables
397 i is won branch eel
398 hence blow raisin
399 her col win sabine
400 i rib he cleans now
401 caliber shone win
402 in elbows enrich a
403 an rich lei sow ben
404 new banish recoil
405 i branch one lewis
406 we is in anchor bel
407 lesion win breach
408 in howl be arsenic
409 i be inn search low
410 new boiler chains
411 one news bar chili
412 i own nil be search
413 breach wine loins
414 in bile own search
415 i breach in new sol
416 canines rib whole
417 cornea blew his in
418 i breach so new lin
419 sine win bachelor
420 on in breach wiles
421 i own in sec herbal
422 nine broach lewis
423 no in breach wiles
424 her own nil ice bas
425 swine broach line
426 in bowels enrich a
427 we chairs on in bel
428 cables wine rhino
429 in cow be inhalers
430 i bin he crawls one
431 earlobes chin win
432 in ben show eclair
433 i is new con herbal
434 rabies conn while
435 cereal bin show in
436 we chairs no in bel
437 earlobes inch win
438 in win hole braces
439 i be now arches lin
440 insane elbow rich
441 i lie won branches
442 i blares on new chi
443 canine robs while
444 in wiles be anchor
445 i is on bleach wren
446 albino cheer wins
447 his lin beware con
448 we is on breach nil
449 chili owe banners
450 on lie chew brains
451 i con in be whalers
452 increase bin howl
453 her lin owe cabins
454 i howl in be cranes
455 chino wine blares
456 won in cables heir
457 i be in ranches owl
458 swine iron bleach
459 her ion win cables
460 i blares no new chi
461 serial bone winch
462 new coin is herbal
463 i is no bleach wren
464 lichen owe brains
465 in swine be choral
466 i is eel own branch
467 carbine hole wins
468 her lis win beacon
469 we is no breach nil
470 carbine shine low
471 i bench serial now
472 i is we conn herbal
473 noel wish carbine
474 in lie owns breach
475 i be won learns chi
476 rainbow slice hen
477 his new linear cob
478 an sec oil whir ben
479 nine wore chablis
480 her cow bin saline
481 i be now clears hin
482 rainbow leech sin
483 one wile is branch
484 we bin he carols in
485 sabine wrench oil
486 she own in calibre
487 we breach on in lis
488 below rein chains
489 his lin wee carbon
490 we is nil be anchor
491 iris enhance bowl
492 in lion web search
493 i be who cranes lin
494 branches lie wino
495 on in welch rabies
496 i bleach so in wren
497 coin inhales brew
498 won lire be chains
499 we breach no in lis
500 wins enable choir

### dylansprouse:people

input: Dylan Sprouse
category: people
phrases 1 to 500 of 500

1 sound players
2 an older pussy
3 an yes up lords
4 us do an sly rep
5 sound parsley
6 you dress plan
7 only dress up a
8 so up an sly red
9 pearly sounds
10 you press land
11 an old sure spy
12 up do an sly res
13 say splendour
14 us don players
15 an spy do rules
16 up do an sly ers
17 player sounds
18 us don parsley
19 an lord use spy
20 us don per sly a
21 assured pylon
22 sure don plays
23 an yes ups lord
24 us pry so lend a
25 replay sounds
26 years don plus
27 an yes sup lord
28 on up less dry a
29 layers pounds
30 us spend royal
31 less don up ray
32 up no less dry a
33 parley sounds
34 you plans reds
35 up lesson dry a
36 us pry les don a
37 soupy slander
38 ours send play
39 on dress up lay
40 us pry lens do a
41 relays pounds
42 so under plays
43 only red up ass
44 us pry as on led
45 soupy landers
46 us drones play
47 up no dress lay
48 us pry as no led
49 plays sounder
50 you slap nerds
51 us preys an old
52 us ply on red as
53 raspy nodules
54 real don pussy
55 an up less dory
56 us ply no red as
57 asunder ploys
58 us respond lay
59 on plus say red
60 us pry on sled a
61 slayer pounds
62 yours send pal
63 no plus say red
64 us pry no sled a
65 royal suspend
66 yours end slap
67 us poles an dry
68 us pry as on del
69 laundry pesos
70 a sounds reply
71 an pus lord yes
72 us pry as no del
73 play resounds
74 an dopey slurs
75 less no up yard
76 us end pro sly a
77 laundry posse
78 ours end plays
79 us slope an dry
80 up lens so dry a
81 soundly spare
82 you pals nerds
83 our ply send as
84 us pry els don a
85 laundry poses
86 play do nurses
87 an syrup do les
88 us pen sol dry a
89 unsold payers
90 send your slap
91 up don rely ass
92 us pry sol end a
93 spray nodules
94 ours ends play
95 only reds up as
96 up red on sly as
97 plays resound
98 us drone plays
99 sly super don a
100 sly no up red as
101 slayers pound
102 yours send lap
103 our ply sends a
104 us ply res don a
105 soundly spear
106 send our plays
107 an lord sue spy
108 so spy led run a
109 prays nodules
110 plays do nurse
111 up yes do snarl
112 us ply ers don a
113 palsy sounder
114 you slaps nerd
115 any loss up red
116 up ends or sly a
117 soundly rapes
118 an surly dopes
119 an spy do lures
120 sly son up red a
121 slays pounder
122 plays does run
123 on dry up sales
124 up end or sly as
125 palsy resound
126 yours end pals
127 an loss up dyer
128 up les on dry as
129 pears soundly
130 you lands reps
131 up no dry sales
132 up les no dry as
133 personas duly
134 players do sun
135 spend our sly a
136 son up les dry a
137 parody unless
138 up don slayers
139 old spy nurse a
140 an dry les so up
141 spousal nerdy
142 you laps nerds
143 an spry old use
144 so spy del run a
145 repays unsold
146 so played runs
147 us reply an sod
148 up nerd so sly a
149 apres soundly
150 so say plunder
151 on pulse dry as
152 a do les run spy
153 an surly spode
154 us yelps an rod
155 us ply so rend a
156 yours ends pal
157 no pulse dry as
158 us nod per sly a
159 ready plus son
160 sly purse don a
161 up reds on sly a
162 play does runs
163 our ply ends as
164 up reds no sly a
165 sends our play
166 old yes spurn a
167 a do per sly sun
168 send your pals
169 old spy sun are
170 us so ply an red
171 pays don rules
172 on pulses dry a
173 up sly res don a
174 yours end laps
175 us reply an dos
176 us ply ern do as
177 ours spend lay
178 an old uses pry
179 up sly ers don a
180 pulsar don yes
181 no pulses dry a
182 so pry led sun a
183 spend your las
184 dry son pulse a
185 us pry les nod a
186 purely don ass
187 so pulse an dry
188 sun ply so red a
189 play don users
190 ours spy an led
191 up els on dry as
192 only sad super
193 us rely an pods
194 up els no dry as
195 us snored play
196 an red plus soy
197 up den or sly as
198 yours end alps
199 an sly sure pod
200 us pry an les do
201 surely do snap
202 real spy do sun
203 son up els dry a
204 your end slaps
205 plus ones dry a
206 us lop sen dry a
207 your ends slap
208 our ply end ass
209 an dry els so up
210 us nod players
211 on dry up seals
212 us ply ors end a
213 us read pylons
214 up son lard yes
215 red ups on sly a
216 one slurps day
217 an dry use slop
218 up dens or sly a
219 send your laps
220 an used sly pro
221 a do els run spy
222 less round pay
223 up no dry seals
224 sly no ups red a
225 only sure pads
226 an old yes spur
227 so pry del sun a
228 slap round yes
229 an red sly soup
230 up rend so sly a
231 any loud press
232 an dry lose sup
233 a do les sun pry
234 as sound reply
235 up loses an dry
236 sly sup on red a
237 yours ends lap
238 an up rosy sled
239 sly sup no red a
240 our ends plays
241 sly don up ears
242 les ups on dry a
243 yours snap led
244 us lopes an dry
245 les ups no dry a
246 lesson up yard
247 an sly super do
248 sly pun so red a
249 any sold super
250 old yes run spa
251 les sup on dry a
252 only spuds are
253 us drops an ley
254 les sup no dry a
255 sure don palsy
256 us prey an olds
257 spy or us lend a
258 sends your pal
259 up sen say lord
260 sly pus on red a
261 early don puss
262 plus nose dry a
263 sly pus no red a
264 sadly on super
265 an puss do lyre
266 les pun so dry a
267 send your alps
268 up loss end ray
269 urn spy les do a
270 also under spy
271 on les up yards
272 up sly ern do as
273 sensor up lady
274 older spy sun a
275 sly nos up red a
276 sadly super no
277 ruled son spy a
278 us pry els nod a
279 on play duress
280 ours spy an del
281 sol up sen dry a
282 yours pen lads
283 an plus yes rod
284 nos up les dry a
285 us layers pond
286 no les up yards
287 ply or us send a
288 earl don pussy
289 an ply do users
290 us pry an els do
291 no play duress
292 us drops an lye
293 a do per sly uns
294 plus one yards
295 only red ups as
296 up sly ors end a
297 lady purse son
298 sly son up dear
299 us ply res nod a
300 only sad purse
301 up son dry sale
302 so sly dun per a
303 us land osprey
304 an syrup do els
305 us ply ers nod a
306 so nursed play
307 plus rye don as
308 a do els sun pry
309 surely don spa
310 as lend our spy
311 sly rep us don a
312 your ends pals
313 on use dry slap
314 us do per an sly
315 on purses lady
316 up lyre don ass
317 us ply an res do
318 real sound spy
319 up one dry lass
320 a do ess ply run
321 up sends royal
322 old yes run pas
323 uns ply so red a
324 us dare pylons
325 up son dry seal
326 us ply an ers do
327 us delays porn
328 our sly sad pen
329 els ups on dry a
330 lady purses no
331 an dry lose pus
332 els ups no dry a
333 up snores lady
334 an yes slur pod
335 us ply ern sod a
336 on pulse yards
337 old sun prey as
338 a do res ply sun
339 pals round yes
340 on plus dry sea
341 ply or us ends a
342 your led snaps
343 old yes sun rap
344 red son us ply a
345 yards pulse no
346 old yes run sap
347 ply or us end as
348 so randy pulse
349 an led sour spy
350 a do ers ply sun
351 any sold purse
352 up yen lord ass
353 els sup on dry a
354 dear only puss
355 sold sun prey a
356 us spy led nor a
357 nearly do puss
358 an sly purse do
359 els sup no dry a
360 near old pussy
361 our les spy dna
362 uns pry les do a
363 yours snap del
364 us don per lays
365 els pun so dry a
366 sends your lap
367 sly drones up a
368 les pry so dun a
369 sadly on purse
370 on pluses dry a
371 urn spy els do a
372 pal rounds yes
373 an spurs do ley
374 sly rep so dun a
375 rules say pond
376 an spry old sue
377 us spy del nor a
378 plays don user
379 sly don up arse
380 on reds us ply a
381 one spurs lady
382 us slay per don
383 nos up els dry a
384 sadly purse no
385 us plays on red
386 no reds us ply a
387 so sunder play
388 no pluses dry a
389 up sly res nod a
390 pounds rely as
391 us reply an ods
392 up sly ers nod a
393 yours slap den
394 an sod rule spy
395 sly sun rep do a
396 lays don super
397 us plays no red
398 sly end or ups a
399 surely don pas
400 rosy plus end a
401 old sen us pry a
402 old spun years
403 us yelp an rods
404 us ply ern ods a
405 surely on pads
406 red son up lays
407 sly sup or end a
408 a rounds yelps
409 up no slays red
410 old ern us spy a
411 as round yelps
412 an spurs do lye
413 up sly ern sod a
414 surely do span
415 up yen lords as
416 uns pry els do a
417 super slay don
418 red sons up lay
419 sly pus or end a
420 us dons player
421 up son slay red
422 den or us ply as
423 your ends laps
424 on dye slurps a
425 on pus les dry a
426 ours pens lady
427 an up sly doers
428 els pry so dun a
429 surely no pads
430 so lured an spy
431 sly rod us pen a
432 us nods player
433 an red soul spy
434 no pus les dry a
435 one slurp days
436 up les don rays
437 dens or us ply a
438 surely don sap
439 on use dry pals
440 a do ess ply urn
441 laps round yes
442 no dye slurps a
443 a do res ply uns
444 you lends spar
445 a lends our spy
446 a do ers ply uns
447 any old purses
448 on spuds rely a
449 res ply so dun a
450 parsley do sun
451 sly don ups are
452 ers ply so dun a
453 sale don syrup
454 sly son up dare
455 spy or led sun a
456 us planes dory
457 on spur say led
458 up sly ern ods a
459 so prunes lady
460 sad no spy rule
461 sly sen up rod a
462 yours lend spa
463 no spuds rely a
464 an led so pry us
465 sure old pansy
466 under sol spy a
467 sly den or ups a
468 so under palsy
469 an dos rule spy
470 red nos us ply a
471 spend your als
472 up lens do rays
473 sly den or sup a
474 days poles run
475 no spur say led
476 spy or del sun a
477 surely do pans
478 up yes ran olds
479 sly uns rep do a
480 yours span led
481 old sun preys a
482 sly rep us nod a
483 you lends raps
484 on reply suds a
485 an del so pry us
486 up send royals
487 no reply suds a
488 on pus els dry a
489 your ends alps
490 sly sound per a
491 no pus els dry a
492 also end syrup
493 less don up rya
494 up send or sly a
495 are sounds ply
496 on yes spur lad
497 sly pun res do a
498 syrup deal son
499 old spy run sea
500 sly pun ers do a

### richardriehle:people

input: Richard Riehle
category: people
phrases 1 to 500 of 500

1 her riled chair
2 i rear her child
3 i err her child a
4 her richer dial
5 her riled rich a
6 i err he arch lid
7 hired rich real
8 i ride her larch
9 i err he lard chi
10 here rich laird
11 her led air rich
12 i err he char lid
13 harder rich lie
14 her chi rid real
15 i err her chi lad
16 hard richer lie
17 her del air rich
18 i err held rich a
19 elder rich hair
20 her lid hire car
21 her lid err chi a
22 her rich derail
23 her rich lid are
24 i err her chi dal
25 heard rich lire
26 her rich rid ale
27 err i hid her lac
28 i rehired larch
29 i arch her idler
30 rich lid he err a
31 hired rich earl
32 her rich lie rad
33 i err her clad hi
34 held richer air
35 her rich rid lea
36 i he err rich lad
37 her idler chair
38 her chi rid earl
39 hi i err held car
40 rich rid healer
41 i char her idler
42 i he err rich dal
43 harder rich lei
44 her red rail chi
45 hi rich led err a
46 lier heard rich
47 i rile her chard
48 hi rich del err a
49 rare child hire
50 her richer lid a
51 ich i err her lad
52 hired rich lear
53 her red rich ail
54 hi i err held arc
55 lecher rid hair
56 her rich idler a
57 hi i err arch led
58 hard richer lei
59 her lech rid air
60 hic i err her lad
61 relic herd hair
62 her hire rid lac
63 i err led char hi
64 hale rich rider
65 her chi rid lear
66 hi i err arch del
67 rear child hire
68 i lard here rich
69 ich i err her dal
70 riled rich hear
71 her lid rear chi
72 i err del char hi
73 rare child heir
74 her lid hire arc
75 he err lac rid hi
76 lid hire archer
77 her red chi liar
78 i lar her red chi
79 chair herd lire
80 her heir rid lac
81 i err lac herd hi
82 richer real hid
83 arch rid her lie
84 he err lid arc hi
85 rich hire alder
86 car hid her lire
87 hic i err her dal
88 rear child heir
89 her chi err dial
90 i err lac rid heh
91 hard relic hire
92 rich lire herd a
93 hi he err lid car
94 richer led hair
95 her heir arc lid
96 i err lid arc heh
97 arch hired lire
98 her rich lid ear
99 heh i err lid car
100 archer hid lire
101 char rid her lie
102 her lid err ich a
103 larch ride hire
104 i reel hard rich
105 i err he hid carl
106 heard rich rile
107 i rid here larch
108 hi err lech rid a
109 rich erred hail
110 i rear held rich
111 her lid err hic a
112 riled rich hare
113 her rich lid era
114 he rid her carl i
115 heard chili err
116 her red chi lair
117 hi i err lech rad
118 hard relic heir
119 her red chi lira
120 he err lich rid a
121 hale rich drier
122 he rid rich earl
123 i err herd lich a
124 richer del hair
125 rich herd rile a
126 i carl hi her red
127 larch ride heir
128 he rail red rich
129 i ich he err lard
130 herd rile chair
131 hid her lier car
132 i hic he err lard
133 arch riled hire
134 her rare lid chi
135 i lard her rec hi
136 riled rich rhea
137 i herd rich earl
138 i lich he err rad
139 chi hire larder
140 i leer hard rich
141 i err led rah chi
142 held crier hair
143 her ire arch lid
144 i carr hi her led
145 lier harder chi
146 i err held chair
147 i err del rah chi
148 richer hire lad
149 lier rich herd a
150 hi cal i err herd
151 harder chi lire
152 err her laid chi
153 i carr hi her del
154 crier herd hail
155 her chi rile rad
156 red a err lich hi
157 arch riled heir
158 arch rid her lei
159 err i hid her cal
160 chard hire lire
161 her rich ire lad
162 he i carr her lid
163 rare chili herd
164 i err child hear
165 i err chi hed lar
166 richer earl hid
167 hard lie err chi
168 i lar hi her cred
169 richer hale rid
170 her ire lard chi
171 hi rec i err dahl
172 had richer lire
173 her rich lei rad
174 i err lid rec ahh
175 lier hired arch
176 her ire char lid
177 i he lar red rich
178 richer heir lad
179 her rare child i
180 i err hard cel hi
181 herder rail chi
182 arc hid her lire
183 i err lid rec hah
184 rear chili herd
185 char rid her lei
186 i err hed carl hi
187 hear richer lid
188 he rid rich lear
189 i ich lar her red
190 hail richer red
191 he err laid rich
192 err he rid cal hi
193 her richer laid
194 he rear rich lid
195 i hic lar her red
196 lier hired char
197 i herd rich lear
198 ich rah i err led
199 rich hie larder
200 i hire red larch
201 i der lar her chi
202 rich heir alder
203 he err rich dial
204 i hid her rec lar
205 heal rich rider
206 held chi err air
207 err i rid cal heh
208 crier hire dahl
209 her rich ire dal
210 i rid her cel rah
211 hear rich idler
212 her hard relic i
213 i rec rah her lid
214 idler hire char
215 he rid arch lire
216 ich rah i err del
217 harder chi rile
218 he err child air
219 hic rah i err led
220 hire rile chard
221 hi her riled car
222 hic rah i err del
223 richer hire dal
224 red chi err hail
225 err i rid cel ahh
226 hi held carrier
227 rich lie err dah
228 err i rid cel hah
229 richer lear hid
230 i herd arch lire
231 he rid rec lar hi
232 hired arch rile
233 err child hire a
234 i herd rec lar hi
235 lier herd chair
236 hid her lier arc
237 i rid rec lar heh
238 heir char idler
239 hard lei err chi
240 i err dic lar heh
241 heir rile chard
242 real rich rid he
243 her der i carl hi
244 richer heir dal
245 her lier chi rad
246 hi der lich err a
247 harder relic hi
248 i err child hare
249 i he der lar rich
250 richer liar hed
251 real rich herd i
252 err i hid cel rah
253 lier richer dah
254 her richer lad i
255 lar ich hed err i
256 lier archer hid
257 err lie had rich
258 lar hic hed err i
259 richer lire dah
260 he rile rich rad
261 lar dic hi he err
262 richer lid rhea
263 he rid lier arch
264 her der ich lar i
265 heal rich drier
266 her rich alder i
267 her der hic lar i
268 hired char rile
269 he lard rich ire
270 rarer child hie
271 i err child rhea
272 rarer chile hid
273 i herd lier arch
274 arch idler hire
275 hi her lier card
276 dire hire larch
277 he rid lier char
278 rich idler rhea
279 rich lei err dah
280 i richer herald
281 i herd lier char
282 rider hie larch
283 he err lid chair
284 richer rail hed
285 her richer dal i
286 char hired lire
287 i arch her riled
288 arch idler heir
289 hi her riled arc
290 dire heir larch
291 her lire card hi
292 hi riled archer
293 he rid lire char
294 richer lair hed
295 err chili herd a
296 richer dah rile
297 i err chi herald
298 hare richer lid
299 i err hide larch
300 richer lira hed
301 i char her riled
302 hired ire larch
303 i herd lire char
304 herald rich ire
305 heir err child a
306 her rich redial
307 hard chile err i
308 lier hire chard
309 err lei had rich
310 hare rich idler
311 her heir lid car
312 char riled hire
313 her dire larch i
314 he richer laird
315 he err chi laird
316 richer lard hie
317 he err chili rad
318 richer ire dahl
319 err lire had chi
320 drier hie larch
321 hi child err are
322 carl hired hire
323 i rile herd char
324 hi richer alder
325 err chi hid real
326 lier heir chard
327 rile her car hid
328 rarer chili hed
329 err lid hear chi
330 char riled heir
331 her lier chard i
332 carl hired heir
333 lier chi err dah
334 hailed rich err
335 her cred rail hi
336 ail rich herder
337 he rid ire larch
338 ail richer herd
339 i herd ire larch
340 ariel rich herd
341 err rich hid ale
342 rile archer hid
343 clear rid her hi
344 rid her charlie
345 hi he lard crier
346 archer lid heir
347 err rich hid lea
348 lich her raider
349 err chi hire lad
350 riled crier ahh
351 hi i erred larch
352 rehire rich lad
353 arch rid he rile
354 rah richer lied
355 her idler hi car
356 hair lech rider
357 err chi hid earl
358 lar richer hide
359 err chi rid hale
360 der richer hail
361 her idler arc hi
362 rei rich herald
363 heh i lard crier
364 rah hired relic
365 her rich die lar
366 liar chi herder
367 arch herd rile i
368 eri rich herald
369 char rid he rile
370 riled crier hah
371 ich her red liar
372 charred lire hi
373 her cred hi liar
374 lich hired rear
375 real rich red hi
376 harrier chi led
377 her lire chi rad
378 larder chi heir
379 hed err rich ail
380 heil richer rad
381 err lech hid air
382 rah richer idle
383 her lid hi racer
384 rehire rich dal
385 led err chi hair
386 hair lech drier
387 her rich led rai
388 hard crier heil
389 lich her red air
390 ahh relic rider
391 err rich hie lad
392 harrier chi del
393 err chi hire dal
394 chard heir lire
395 her crier hi lad
396 rah richer deli
397 hi child err ear
398 lair chi herder
399 her rich led ria
400 herald crier hi
401 rile her arc hid
402 lira chi herder
403 her rider hi lac
404 rei hired larch
405 err lid hare chi
406 arch rider heil
407 err chi hid lear
408 eri hired larch
409 her relic hi rad
410 hah relic rider
411 hic her red liar
412 rei richer dahl
413 rarer lech hid i
414 archer rid heil
415 ich her red rail
416 dahl crier heir
417 rei her rich lad
418 lar rehired chi
419 del err chi hair
420 eri richer dahl
421 her rich del rai
422 ahh relic drier
423 heil rid her car
424 carrier lid heh
425 carl he rid hire
426 archer idler hi
427 hi child err era
428 arch drier heil
429 hed err chi liar
430 hah relic drier
431 ich her red lair
432 harder ich lire
433 arch hid lie err
434 lich erred hair
435 her cred hi lair
436 arch lid rehire
437 her rich del ria
438 harder hic lire
439 eri her rich lad
440 ahh crier idler
441 lich rid her are
442 liar ich herder
443 carl i hire herd
444 hear lich rider
445 ich her red lira
446 larder ich hire
447 her cred hi lira
448 laird crier heh
449 hard lice err hi
450 cel hid harrier
451 ich rid her real
452 hah crier idler
453 carl he rid heir
454 air lich herder
455 hi rich err dale
456 held richer rai
457 hi red rich earl
458 harrier ich led
459 hic her red rail
460 larder ich heir
461 char hid lie err
462 held richer ria
463 err rich hie dal
464 rah rich relied
465 her rare lid ich
466 rarer lich hide
467 her rider lich a
468 liar hic herder
469 carl i herd heir
470 hired rare lich
471 hi herd rile car
472 hare lich rider
473 her lid archer i
474 larder hic hire
475 her crier hi dal
476 rail ich herder
477 her drier hi lac
478 charred lier hi
479 hic her red lair
480 harrier ich del
481 lar he ride rich
482 harder lich ire
483 err chi herd ail
484 lair ich herder
485 card rile her hi
486 hear lich drier
487 hed err chi rail
488 harrier hic led
489 heir err chi lad
490 had richer lier
491 lard rice her hi
492 larder hic heir
493 her hire rid cal
494 lira ich herder
495 her ride carl hi
496 rhea lich rider
497 i held rare rich
498 char rider heil
499 hi lire char red
500 rah chile rider

### tigershroff:people

input: Tiger Shroff
category: people
phrases 1 to 340 of 340

1 offers right
2 her first fog
3 fifth rogers
4 her off grits
5 offer rights
6 her fit frogs
7 for fighters
8 he frog first
9 offers girth
10 serf of right
11 forger shift
12 refs of right
13 forge shrift
14 off right res
15 shifter frog
16 she frog rift
17 griefs forth
18 off right ers
19 forges firth
20 he frogs rift
21 griefs froth
22 her riffs got
23 gofer shrift
24 hers got riff
25 others griff
26 fight for res
27 ferro fights
28 fight for ers
29 sheriff trog
30 ref of rights
31 fighters fro
32 hers off grit
33 throes griff
34 ref for sight
35 forges frith
36 he frog rifts
37 her frog fits
38 for her gifts
39 her frog fist
40 hers frog fit
41 hers off trig
42 the frogs fir
43 off err sight
44 this frog ref
45 fret for sigh
46 the frog firs
47 his frog fret
48 her figs fort
49 fright of res
50 her fig frost
51 so fright ref
52 fright of ers
53 her frog sift
54 err of fights
55 fresh rift go
56 hers fort fig
57 hers fog rift
58 fresh fir got
59 gift for hers
60 ref frog shit
61 first hog ref
62 her fog rifts
63 her rig toffs
64 her fig forts
65 ref frogs hit
66 serf of girth
67 heft frog sir
68 heft for rigs
69 rest hog riff
70 her fogs rift
71 shrift go ref
72 her grit offs
73 serf frog hit
74 refs of girth
75 hers rig toff
76 ref fog shirt
77 shift err fog
78 firth go serf
79 her rigs toff
80 refs frog hit
81 riffs get rho
82 her trig offs
83 ref frog hits
84 off girth res
85 short eff rig
86 fresh frog it
87 oft fresh rig
88 off girth ers
89 fig short ref
90 firth go refs
91 ref fort sigh
92 fight or serf
93 fir ghost ref
94 stiff err hog
95 riff gets rho
96 hes frog rift
97 ref fight ors
98 fight or refs
99 fights or ref
100 fresh fig rot
101 fresh for git
102 fresh of grit
103 fresh of trig
104 ref gifts rho
105 serf gift rho
106 fresh or gift
107 fresh fig tor
108 toff err sigh
109 refs gift rho
110 rift hogs ref
111 horst eff rig
112 tiff err hogs
113 fir hogs fret
114 rift hog serf
115 res fog firth
116 ers fog firth
117 firs hog fret
118 rift hog refs
119 rifts hog ref
120 fir hog frets
121 goth riff res
122 goth riff ers
123 rho fret figs
124 fig froth res
125 fig froth ers
126 eff right ors
127 rho eff grits
128 reg off shirt
129 rho frets fig
130 het frogs fir
131 this frog fer
132 ser for fight
133 her soft frig
134 het frog firs
135 her gifts fro
136 ors eff girth
137 rights or eff
138 ger off shirt
139 reg for shift
140 fer of rights
141 fer for sight
142 her fog frits
143 ser right off
144 fret frogs hi
145 fer first hog
146 ger for shift
147 he griff sort
148 ser of fright
149 reg shot riff
150 frets frog hi
151 he frog frits
152 ser off girth
153 the griff ors
154 grift for she
155 grift for hes
156 griff hot res
157 her gor stiff
158 reg of shrift
159 griff hot ers
160 ger shot riff
161 reg hot riffs
162 fer short fig
163 reg fish fort
164 fer frog shit
165 the gor riffs
166 regs hot riff
167 she griff rot
168 her griff sot
169 regs of firth
170 rest griff oh
171 ger of shrift
172 hers gift fro
173 fer frogs hit
174 fresh fit gor
175 frig hot serf
176 she frig fort
177 ger hot riffs
178 res fig forth
179 he frig frost
180 fer or fights
181 seg for firth
182 ger fish fort
183 griff to hers
184 ers fig forth
185 regs if forth
186 so fright fer
187 she griff tor
188 reg fifth ors
189 frig hot refs
190 reg stiff rho
191 regs or fifth
192 he griff rots
193 fer fog shirt
194 frith go serf
195 fer frog hits
196 ref fig horst
197 fret fir gosh
198 fer fort sigh
199 frith go refs
200 reg host riff
201 ger fifth ors
202 he frig forts
203 ger stiff rho
204 grift of hers
205 she trog riff
206 fer fight ors
207 ref fir goths
208 fresh fig tro
209 serf fir goth
210 ref firs goth
211 he trog riffs
212 regs if froth
213 ger host riff
214 tres hog riff
215 refs fir goth
216 fer gifts rho
217 ref frig shot
218 res fight fro
219 set griff rho
220 ref rift gosh
221 ers fight fro
222 err gosh tiff
223 fresh fro git
224 ser fog firth
225 ref fro sight
226 eth frogs fir
227 hes griff rot
228 fret fish gor
229 ref fish trog
230 eth frog firs
231 hes frig fort
232 fresh to frig
233 fer shrift go
234 fret fro sigh
235 ref frig host
236 hes griff tor
237 ref shift gor
238 serf grift oh
239 frets frig oh
240 ref frog sith
241 refs grift oh
242 seg froth fir
243 fret fog shri
244 hers gor tiff
245 res gor fifth
246 heft frog sri
247 ers gor fifth
248 fer fir ghost
249 ref frits hog
250 fresh if trog
251 fret frig hos
252 hes trog riff
253 ser fig forth
254 err ghost iff
255 res fog frith
256 ref frig tosh
257 ers fog frith
258 fet frog shri
259 griff tho res
260 ref grift hos
261 griff tho ers
262 reg tho riffs
263 tres griff oh
264 fro ser fight
265 seg forth fir
266 regs tho riff
267 heft fro rigs
268 het griff ors
269 eff gor shirt
270 ifs reg forth
271 reg tosh riff
272 fer frig shot
273 frig tho serf
274 fro reg shift
275 ger tho riffs
276 fer rift hogs
277 iff reg short
278 she griff tro
279 fer fig horst
280 ser goth riff
281 fer fro sight
282 frig tho refs
283 she grift fro
284 het gor riffs
285 ser fig froth
286 ifs ger forth
287 ger tosh riff
288 fer rifts hog
289 heft frig ors
290 fer fir goths
291 trog fer fish
292 fro ger shift
293 iff ger short
294 hot griff ser
295 err goths iff
296 fer firs goth
297 fer frig host
298 reg hots riff
299 gor fer shift
300 ser gor fifth
301 regs rho tiff
302 sith fer frog
303 ifs reg froth
304 eff rigs thro
305 fer rift gosh
306 frith ser fog
307 ger hots riff
308 fer frits hog
309 iff reg horst
310 ifs ger froth
311 heft firs gor
312 fer frig tosh
313 ref figs thro
314 fer grift hos
315 fest frig rho
316 reg shri toff
317 hers frig oft
318 thro fer figs
319 serf fig thro
320 iff ger horst
321 eth griff ors
322 fro seg firth
323 seg thro riff
324 refs fig thro
325 hes griff tro
326 fret frig sho
327 ref frig hots
328 hes grift fro
329 ger shri toff
330 hers trog iff
331 eth gor riffs
332 ref grift sho
333 frith of regs
334 frith for seg
335 eff trog shri
336 griff tho ser
337 fer frig hots
338 fer grift sho
339 seg frith fro
340 regs thro iff
