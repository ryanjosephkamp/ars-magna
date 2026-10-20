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

## File 95 of 95: 1760 phrases

### junmaeda:people

input: Jun Maeda
category: people
phrases 1 to 17 of 17

1 nude maja
2 an due jam
3 duma jean
4 a mud jean
5 dune maja
6 nude jam a
7 maud jean
8 dune jam a
9 duma jane
10 made a jun
11 maud jane
12 mud jane a
13 jade a mun
14 dum jean a
15 dum jane a
16 dame a jun
17 mead a jun

### whatsapp:products

input: WhatsApp
category: products
phrases 1 to 22 of 22

1 whap past
2 pst whap a
3 path swap
4 path paws
5 path wasp
6 paths paw
7 whap taps
8 whap spat
9 thaws pap
10 thaw paps
11 whap pats
12 what paps
13 staph paw
14 swath pap
15 what apps
16 whats pap
17 phat swap
18 phat paws
19 phat wasp
20 thaw apps
21 swath app
22 thaws app

### mingxi:people

input: Ming Xi
category: people
phrases 1 to 4 of 4

1 mixing
2 gin mix
3 ing mix
4 mig nix

### chrisballard:people

input: Chris Ballard
category: people
phrases 1 to 441 of 441

1 hardball cris
2 all crash bird
3 brr i had calls
4 car shall bird
5 his all cad brr
6 hard bills car
7 brr all is chad
8 hard call ribs
9 brr i dash call
10 hard bill cars
11 brr i call shad
12 hall birds car
13 brr as hid call
14 all arch birds
15 brr i shall cad
16 all hard cribs
17 brr i calls dah
18 hard scar bill
19 brr all sad chi
20 bird call rash
21 brr i clash lad
22 all char birds
23 brr as ill chad
24 crash rid ball
25 brr i clash dal
26 crab has drill
27 brr all hid sac
28 car hills brad
29 brr as hill cad
30 cards hill bar
31 his lad brr lac
32 hall bird cars
33 is call had brr
34 hard calls rib
35 brr all sic dah
36 bar card hills
37 brr hall is cad
38 halls bird car
39 brr a hills cad
40 bar cash drill
41 brr chill sad a
42 card shall rib
43 brr all cis dah
44 hard call bris
45 hi brr sad call
46 bars card hill
47 his dal brr lac
48 bill card rash
49 all ads brr chi
50 shard bill car
51 brr sac had ill
52 card has brill
53 brr cad has ill
54 ill hard crabs
55 i brr clad lash
56 arc shall bird
57 brr call a dish
58 car drill bash
59 brr lac has lid
60 cars hill brad
61 brr dahl is lac
62 cars had brill
63 brr a shill cad
64 ribs card hall
65 brr calls a hid
66 bird scar hall
67 brr lac had lis
68 sir ball chard
69 brr call dah is
70 brad crash ill
71 brr cad ash ill
72 hard arc bills
73 cis brr all had
74 all crib shard
75 brr chill ads a
76 all ribs chard
77 brr cash a dill
78 cards hill bra
79 brr las hid lac
80 hall rid crabs
81 ill dah brr sac
82 arch rid balls
83 brr lac ash lid
84 bra card hills
85 his lad cal brr
86 hall rib cards
87 brr clash a lid
88 bra cash drill
89 brr als hid lac
90 birds arc hall
91 brr sic had all
92 hard arcs bill
93 ich brr all ads
94 rich balls rad
95 his dal cal brr
96 car hills bard
97 dic brr all ash
98 brad scar hill
99 brr dic shall a
100 scar had brill
101 hic brr all ads
102 bad car shrill
103 brr child las a
104 bill crash rad
105 i brr halls cad
106 bras card hill
107 brr cal has lid
108 char rid balls
109 brr child als a
110 rib call shard
111 brr disc hall a
112 bar crash dill
113 all has dic brr
114 car shill brad
115 brr call ads hi
116 halls rid crab
117 brr cal had lis
118 bar card shill
119 i brr dahl lacs
120 rib card halls
121 sha brr ill cad
122 rad shall crib
123 lads brr hi lac
124 cars hill bard
125 brr clad las hi
126 crab ash drill
127 lad brr hi lacs
128 all birch rads
129 i alls brr chad
130 car dash brill
131 brr chad a sill
132 bris card hall
133 brr chad a ills
134 rich ball rads
135 brr cal ash lid
136 brad arc hills
137 brr clad als hi
138 bard crash ill
139 dal brr hi lacs
140 brash call rid
141 sal brr hid lac
142 drab crash ill
143 all sad ich brr
144 bird arc halls
145 brr child sal a
146 bird arcs hall
147 brr chi lad las
148 rad chill bars
149 all sad hic brr
150 labs lard rich
151 lad sal brr chi
152 car shrill dab
153 brr cal dahl is
154 brill card ash
155 brr lich lads a
156 bard scar hill
157 brr dic hall as
158 bill arc shard
159 brr dic halls a
160 rad chills bar
161 brr chi lad als
162 bash arc drill
163 brr chi dal las
164 bra crash dill
165 brr lich lad as
166 ill crab shard
167 dal sal brr chi
168 drab scar hill
169 brr cal las hid
170 rad hills crab
171 brr chi dal als
172 rad hill crabs
173 brr lich dal as
174 rads chill bar
175 brr ich lad las
176 slab lard rich
177 brr cal als hid
178 bra card shill
179 brr lac dah lis
180 drab car hills
181 brr hic lad las
182 abs arch drill
183 brr ich lad als
184 brad arcs hill
185 brr ich dal las
186 arcs had brill
187 brr cal dah lis
188 bills arch rad
189 brr hic lad als
190 ras chill brad
191 brr cal lads hi
192 sad arch brill
193 brr hic dal las
194 car shill bard
195 sal ich brr lad
196 las bird larch
197 brr ich dal als
198 bars arch dill
199 brr cal sha lid
200 ars chill brad
201 sal hic brr lad
202 cad shrill bar
203 brr hic dal als
204 larch rid labs
205 brr clad sal hi
206 bill arch rads
207 sal ich brr dal
208 abs char drill
209 brr lac sha lid
210 bald larch sir
211 sal hic brr dal
212 rad chill bras
213 brr cad alls hi
214 bard arc hills
215 brr cal sal hid
216 bills char rad
217 brr dic sha all
218 brash card ill
219 brill cash rad
220 bad arc shrill
221 brad arch sill
222 rads hill crab
223 drab arc hills
224 brad arch ills
225 rad shrill cab
226 drab cars hill
227 bas arch drill
228 hall crib rads
229 halls crib rad
230 rad chills bra
231 hall cribs rad
232 lad ribs larch
233 bars char dill
234 larch slid bar
235 larch rid slab
236 rads chill bra
237 bill char rads
238 birch lard las
239 sill bar chard
240 all chard bris
241 brad arc shill
242 ras drill bach
243 ills bar chard
244 rib clash lard
245 ras bill chard
246 brad char sill
247 brad char ills
248 lads rib larch
249 bas char drill
250 lids bar larch
251 als bird larch
252 brill arc dash
253 ars drill bach
254 ill chard bars
255 crib lard lash
256 ars bill chard
257 brash car dill
258 bard arcs hill
259 brill arch ads
260 bras arch dill
261 ras chill bard
262 cad shrill bra
263 drab arcs hill
264 brill scar dah
265 hard sac brill
266 rad shill crab
267 brill arc shad
268 lis brad larch
269 rid crab shall
270 ars chill bard
271 cab rash drill
272 drab car shill
273 arc shrill dab
274 larch slid bra
275 brill char ads
276 bras char dill
277 birch lard als
278 bard arch sill
279 dal ribs larch
280 bard arch ills
281 drab arch sill
282 drab arch ills
283 crab hard sill
284 crab hard ills
285 sad char brill
286 bard arc shill
287 bard char sill
288 ill chard bras
289 drab arc shill
290 bard char ills
291 drab char sill
292 drab char ills
293 lis bard larch
294 drab ras chill
295 brill arcs dah
296 drab ars chill
297 rash cad brill
298 larch lard bis
299 crab rash dill
300 brash arc dill
301 cris hard ball
302 carbs hard ill
303 drab larch lis
304 carr had bills
305 brill car shad
306 alls hard crib
307 brill chard as
308 carb has drill
309 carr shall bid
310 bar lars child
311 carb hard sill
312 carb hard ills
313 birds call rah
314 carr hid balls
315 brill cars dah
316 bars larch lid
317 brr laid clash
318 bad carr hills
319 bah scar drill
320 brr acid halls
321 carb ill shard
322 bra lars child
323 bird calls rah
324 drab call shri
325 birch lad lars
326 brad call shri
327 bald lars rich
328 ball carr dish
329 bars lar child
330 bird carl lash
331 bills card rah
332 carb rash dill
333 bras larch lid
334 brr lilac dash
335 ball card shri
336 bra chard sill
337 carb ash drill
338 bra chard ills
339 brill chad ras
340 bill carr dash
341 carr slid blah
342 drab hall cris
343 bra larch lids
344 bris larch lad
345 lib crash lard
346 libs arch lard
347 brr lilac shad
348 brill chad ars
349 brad alls rich
350 bah arc drills
351 bill carr shad
352 birch lads lar
353 birch lard sal
354 brr halal disc
355 bah arcs drill
356 brr clash dial
357 bad carr shill
358 birch dal lars
359 bras lar child
360 crab sha drill
361 bill cards rah
362 dibs carr hall
363 bard call shri
364 bids carr hall
365 ribs carl dahl
366 bald larch sri
367 brr clad hails
368 bid carr halls
369 bird clash lar
370 carbs hall rid
371 brash carl lid
372 bird arch alls
373 bah car drills
374 bah cars drill
375 bris larch dal
376 cab rah drills
377 bills carr dah
378 brill card sha
379 birch rad alls
380 brr scald hail
381 brad hall cris
382 cabs rah drill
383 dab carr hills
384 bard alls rich
385 bird char alls
386 brr acid shall
387 scab rah drill
388 drab alls rich
389 blah lard cris
390 blah carr lids
391 alas brr child
392 dabs carr hill
393 bash carr dill
394 libs char lard
395 brr lilacs had
396 bris carl dahl
397 crabs rah dill
398 bars lard lich
399 carb halls rid
400 bird larch sal
401 carbs rad hill
402 ball chard sri
403 bard hall cris
404 brr acids hall
405 dab carr shill
406 bras lard lich
407 crib dahl lars
408 bid larch lars
409 carb rad hills
410 rid carb shall
411 brr calla dish
412 carb rads hill
413 brr callas hid
414 lib carl shard
415 rib chard alls
416 sala brr child
417 dib carr halls
418 bids larch lar
419 carb sha drill
420 brr lilacs dah
421 carb rad shill
422 cribs dahl lar
423 bald carl shri
424 libs larch rad
425 brr dacha sill
426 brr dacha ills
427 carbs rah dill
428 lars lib chard
429 brr lich salad
430 lars dib larch
431 lib larch rads
432 dib carr shall
433 brad lars lich
434 dibs larch lar
435 libs carr dahl
436 brr challa ids
437 libs carl hard
438 lar libs chard
439 bard lars lich
440 drab lars lich
441 brr challa dis

### tenzing:titles

input: Tenzing
category: titles
phrases 1 to 2 of 2

1 net zing
2 gent zin

### gigihadid:people

input: Gigi Hadid
category: people
phrases 1 to 13 of 13

1 aid hid gig
2 hi i did gag
3 ahi did gig
4 hi i add gig
5 gag hi didi
6 hi gig did a
7 gid ahi dig
8 hi i dig dag
9 hi i gad dig
10 i hi gig dad
11 i gad gid hi
12 hi gid dig a
13 dag gid hi i

### rosiehuntingtonwhiteley:people

input: Rosie Huntington-Whiteley
category: people
phrases 1 to 500 of 500

1 thoroughly wine intestine
2 unwittingly noise the hero
3 you howl the interesting in
4 thoroughly twine einstein
5 interesting holy out whine
6 they win the in neurologist
7 unwittingly hone theories
8 unwittingly hire those one
9 the in yen with neurologist
10 thoroughly twine nineties
11 unwittingly shoe their one
12 he win the tiny neurologist
13 those heroine unwittingly
14 ninth while out generosity
15 thy in wine the neurologist
16 unwittingly herein soothe
17 within yen the neurologist
18 unwittingly is the one hero
19 unwittingly heroine ethos
20 interesting youth win hole
21 i wine thy then neurologist
22 thy nine white neurologist
23 the new yin hit neurologist
24 unwittingly hose their one
25 i net the whiny neurologist
26 online hut with generosity
27 i toy whose unrelenting hit
28 uninteresting hoy to while
29 the in whit yen neurologist
30 the tiny whine neurologist
31 linnet to your eight whines
32 unwittingly hire the noose
33 i toy this unrelenting howe
34 unwittingly hoes their one
35 unwittingly is the here ono
36 interesting hue with loony
37 we hit thy nine neurologist
38 who untie interesting holy
39 it owe this unrelenting hoy
40 who unite interesting holy
41 it ooh this unrelenting yew
42 interesting lotion hue why
43 who toy his unrelenting tie
44 unwittingly hoe the senior
45 the in yew thin neurologist
46 unwittingly shoe into here
47 its unrelenting why ooh tie
48 who hole interesting unity
49 he is unwittingly other one
50 youth on interesting while
51 unwittingly toe his on here
52 unwittingly noose the heir
53 unwittingly toe his no here
54 uninteresting holy owe hit
55 he twine thy in neurologist
56 neurologist whinny the tie
57 her intent silo white young
58 hot whine until generosity
59 thy nee in with neurologist
60 thine wine thy neurologist
61 their youngest no whine lit
62 while hunt into generosity
63 the in whey tin neurologist
64 white lion hunt generosity
65 thee win thy in neurologist
66 uninteresting why ooh tile
67 it ooh thy unrelenting wise
68 uninteresting lie hoot why
69 our tote whinnying this lee
70 unwittingly ooh his entree
71 i hole to uninteresting why
72 thin while unto generosity
73 the in yew hint neurologist
74 unwittingly hie the sooner
75 it toy his unrelenting howe
76 unwittingly hose into here
77 whine til their youngest no
78 those unwittingly one heir
79 too tie his unrelenting why
80 interesting hoy unto while
81 shiny newton to their guile
82 thou wine interesting holy
83 thy interesting now oil hue
84 nine neurologist with they
85 his unrelenting hit owe toy
86 unwittingly ooh these rein
87 unwittingly see her in hoot
88 i thoroughly went einstein
89 the in yin whet neurologist
90 unwittingly hoe their ones
91 he win out interesting holy
92 we thoroughly in intestine
93 i hew the tinny neurologist
94 it thoroughly new einstein
95 unwittingly hoe the one sir
96 whiny then tie neurologist
97 i whine thy ten neurologist
98 engine insert without holy
99 inert no until whose eighty
100 his too unrelenting whitey
101 i shoe unwittingly on there
102 ooh its unrelenting whitey
103 i shoe unwittingly no there
104 those unwittingly here ion
105 on trine until whose eighty
106 unwittingly nose their hoe
107 no trine until whose eighty
108 who tie uninteresting holy
109 it ooh with unrelenting yes
110 thin yen white neurologist
111 his north weenie tilt young
112 uninteresting woe hit holy
113 thy interesting wool hue in
114 interesting whole thin you
115 in while hunt to generosity
116 neurologist with ninth eye
117 he oil to uninteresting why
118 he unwittingly on theories
119 her one nitwit honeys guilt
120 unrelenting hoot is whitey
121 thy interesting won oil hue
122 interesting hoy until howe
123 it shoe unwittingly on here
124 he unwittingly no theories
125 unwittingly ooh the in seer
126 tiny hen white neurologist
127 it ooh its unrelenting whey
128 nine why tithe neurologist
129 the online south wring yeti
130 unwittingly hoe these iron
131 it hunt in whole generosity
132 unwittingly hoes into here
133 it shoe unwittingly here no
134 unwittingly hire these ono
135 i hoot this unrelenting yew
136 i thoroughly new intestine
137 they hit in new neurologist
138 he unwittingly other noise
139 i host unwittingly here one
140 white loin hunt generosity
141 his written hone tile young
142 white hint yen neurologist
143 thou lie on interesting why
144 it thoroughly intense wine
145 thy interesting oil own hue
146 interesting lion hew youth
147 thou lie no interesting why
148 interesting whole hint you
149 i owe thy unrelenting hoist
150 white lino hunt generosity
151 i hose unwittingly on there
152 he white tinny neurologist
153 unwittingly hoe the rose in
154 uninteresting two hie holy
155 the wily nutrition seen hog
156 interesting whole youth in
157 i hose unwittingly no there
158 the whiny tine neurologist
159 i wee thy ninth neurologist
160 ninety neurologist with he
161 unwittingly is the neo hero
162 unrelenting hooey with tis
163 unwittingly shoe her on tie
164 this unrelenting wit hooey
165 i hole unto interesting why
166 uninteresting lei hoot why
167 i yen then with neurologist
168 whitey in then neurologist
169 our lee tote whinnying shit
170 in thoroughly new entities
171 unwittingly shoe her no tie
172 unwittingly seine her hoot
173 unwittingly shoe the in ore
174 i thoroughly went nineties
175 our tote whinnying this eel
176 uninteresting tool hie why
177 young soil her white intent
178 she unwittingly ooh entire
179 i hoe thy uninteresting low
180 unwittingly hire those eon
181 his unrelenting two tie hoy
182 intent why hie neurologist
183 i woo thy unrelenting heist
184 unwittingly shoe their eon
185 i ooh unwittingly here sent
186 it thoroughly new nineties
187 tenure into thy legion wish
188 thou win interesting hoyle
189 it hose unwittingly on here
190 uninteresting why toil hoe
191 i toot his unrelenting whey
192 unwittingly noise hot here
193 i hoot thy unrelenting wise
194 in thoroughly wet einstein
195 i whine thy net neurologist
196 lithe noun with generosity
197 the online yeti shout wring
198 unwittingly hoist here one
199 unwittingly hoe its on here
200 teeny hin with neurologist
201 it hose unwittingly here no
202 out whiny interesting hole
203 i shoe unwittingly on three
204 i thoroughly nine twenties
205 unwittingly hoe its here no
206 thy tine whine neurologist
207 unwittingly hoe the on rise
208 unrelenting whitey ooh tis
209 i shoe unwittingly three no
210 interesting hoe howl unity
211 thoroughly wine its in teen
212 i thoroughly sentient wine
213 you whine on in streetlight
214 uninteresting loot hie why
215 unwittingly shoe the in roe
216 weeny hit thin neurologist
217 thy in hint wee neurologist
218 ninth whit eye neurologist
219 unwittingly hoe the no rise
220 whiny teen hit neurologist
221 you whine no in streetlight
222 unwittingly hose their eon
223 i hit who tunnel generosity
224 interesting hoy untie howl
225 out why in interesting hole
226 unwittingly rein those hoe
227 i whet thy nine neurologist
228 oil thy uninteresting howe
229 unwittingly ooh the sere in
230 interesting hoy unite howl
231 i wet thoroughly intense in
232 while hint unto generosity
233 unwittingly toe her in shoe
234 they white inn neurologist
235 thy interesting hun owe oil
236 ooh thy uninteresting wile
237 unwittingly hose her on tie
238 twit his unrelenting hooey
239 i nose unwittingly hot here
240 we thoroughly tin einstein
241 it hoot his unrelenting yew
242 unwittingly hoe their eons
243 it wine thoroughly in tense
244 interesting loony hue whit
245 unwittingly hose her no tie
246 we thoroughly tiniest nine
247 unwittingly hoe the sore in
248 union hoy wine streetlight
249 unwittingly hose the in ore
250 interesting loin hew youth
251 thy interesting hun woo lie
252 weeny hit hint neurologist
253 this teeny tune whoring oil
254 it whoosh unrelenting yeti
255 the tinny tool weighs urine
256 see unwittingly hot heroin
257 thy het in wine neurologist
258 unrelenting hooey shit wit
259 neurologist hew the tiny in
260 interesting lino hew youth
261 i unwittingly horse the one
262 thou whole interesting yin
263 thoroughly tie its new nine
264 unrelenting yeti wish hoot
265 unwittingly sit her one hoe
266 i thoroughly intense twine
267 the het yin win neurologist
268 he unwittingly shoo entire
269 who tie its unrelenting hoy
270 unwittingly hit here noose
271 unwittingly tee his on hero
272 i thoroughly nineteen wits
273 unwittingly hie the on rose
274 uninteresting wit hoe holy
275 unwittingly hoe the on sire
276 unwittingly hoe their sone
277 unwittingly tee his no hero
278 it whole uninteresting hoy
279 unwittingly hie the rose no
280 uninteresting whey ooh lit
281 unwittingly hoe the no sire
282 unrelenting hooey hit wits
283 i hoes unwittingly on there
284 unwittingly hone those ire
285 i unwittingly see the honor
286 ooh unwittingly here stein
287 i hose unwittingly on three
288 those unwittingly neo hire
289 unwittingly ooh the nee sir
290 interesting hun wilt hooey
291 he oil unto interesting why
292 unrelenting hooey wish tit
293 his unrelenting toy hie two
294 generosity whole thin unit
295 yet woo his unrelenting hit
296 uninteresting whey hit loo
297 his young weenie tilt thorn
298 their unwittingly neo shoe
299 i hoes unwittingly no there
300 unwittingly hoes their eon
301 i hose unwittingly three no
302 ooh until interesting whey
303 unwittingly hose the in roe
304 unrelenting whit sit hooey
305 i win thoroughly see intent
306 thou yon interesting while
307 it went thoroughly in seine
308 he unwittingly ooh entries
309 it hew thy nine neurologist
310 too unwittingly here shine
311 unwittingly hie to her ones
312 its unrelenting whit hooey
313 it hue now interesting holy
314 interesting lout whine hoy
315 i honey low interesting hut
316 in thoroughly wet nineties
317 thy neuter wish into legion
318 uninteresting wit hole hoy
319 unwittingly see her hot ion
320 neurologist white then yin
321 i hoot with unrelenting yes
322 he unwittingly toes heroin
323 unwittingly shoe the on ire
324 thoroughly see nine nitwit
325 unwittingly toe her in hose
326 interestingly hue with ono
327 unwittingly ooh her in tees
328 i whinny teeth neurologist
329 i hoe thy uninteresting owl
330 uninteresting whit ooh ley
331 unwittingly shoe the no ire
332 interesting while youth no
333 he sit unwittingly one hero
334 ninth whey tie neurologist
335 young oils her white intent
336 whiny tee thin neurologist
337 unwittingly tree his on hoe
338 those unwittingly neo heir
339 it seen thoroughly in twine
340 uninteresting whit ooh lye
341 on whine their youngest lit
342 generosity whole hint unit
343 it hoes unwittingly on here
344 unwittingly in here soothe
345 unwittingly tree his no hoe
346 uninteresting tow hie holy
347 i hoist thy unrelenting woe
348 unwittingly sheer into hoe
349 we tie thoroughly in tennis
350 thou interestingly in howe
351 he ooh unwittingly trees in
352 i unwittingly seethe honor
353 you hit low interesting hen
354 their unwittingly neo hose
355 it hoes unwittingly here no
356 teeth in whiny neurologist
357 i hoot its unrelenting whey
358 uninteresting tie howl hoy
359 she ooh unwittingly tree in
360 she unwittingly toe heroin
361 tureen into thy legion wish
362 sit with unrelenting hooey
363 the tinny loot weighs urine
364 with its unrelenting hooey
365 he soot unwittingly here in
366 we thoroughly tin nineties
367 he hit unwittingly rose one
368 unrelenting whist ooh yeti
369 it wine thoroughly in teens
370 either unwittingly on shoe
371 i heist too unrelenting why
372 tie thoroughly wine tennis
373 unwittingly hie to her nose
374 unwittingly either shoe no
375 thy in ewe thin neurologist
376 wen thoroughly in entities
377 i ooh unwittingly here nest
378 he unwittingly shoe orient
379 our lee tote whinnying hits
380 whiny tee hint neurologist
381 i went thoroughly nine site
382 unrelenting hooey hits wit
383 he note unwittingly is hero
384 ooh with uninteresting ley
385 unwittingly hoe her on site
386 uninteresting hoy owe hilt
387 unwittingly hoe her no site
388 who tile uninteresting hoy
389 thy hewn in tie neurologist
390 there unwittingly ooh sine
391 it twin thoroughly see nine
392 uninteresting hilt ooh yew
393 she whine to trying outline
394 neurologist with thine yen
395 nun with it hole generosity
396 he unwittingly ten hoosier
397 her unwittingly toe his one
398 thy uninteresting wool hie
399 who hie its unrelenting toy
400 ooh with uninteresting lye
401 unwittingly hie the on sore
402 thy within nee neurologist
403 who hit on interesting yule
404 tree unwittingly ooh shine
405 thy interesting loo win hue
406 he unwittingly oohs entire
407 it wee thoroughly in tennis
408 who interestingly hoe unit
409 it site thoroughly new nine
410 unwittingly hit heroes one
411 he horse unwittingly on tie
412 there unwittingly shoe ion
413 unwittingly hoes her on tie
414 whose unrelenting titi hoy
415 i sheet unwittingly on hero
416 unrelenting whitey shoot i
417 unwittingly hie the sore no
418 lithe wino hunt generosity
419 who hit no interesting yule
420 others unwittingly hie one
421 interesting lion hue to why
422 his unwittingly nee hooter
423 we ooh interestingly in hut
424 either unwittingly on hose
425 i tweets thoroughly in nine
426 uninteresting toy hie howl
427 i unwittingly shore the one
428 neurologist wine they thin
429 he horse unwittingly no tie
430 unwittingly either hose no
431 unwittingly hoes her no tie
432 he unwittingly hose orient
433 i sheet unwittingly no hero
434 hewn yeti thin neurologist
435 its unrelenting hit owe hoy
436 unrelenting whit shoo yeti
437 unwittingly hoes the in ore
438 their unwittingly neo hoes
439 i seen unwittingly hot hero
440 uninteresting oil whet hoy
441 its unrelenting hit ooh yew
442 thy nohow interesting lieu
443 unwittingly hose the on ire
444 thee unwittingly ooh siren
445 the thin wool yens intrigue
446 he unwittingly onshore tie
447 on inter until whose eighty
448 ooh unwittingly serene hit
449 he rise unwittingly hot one
450 uninteresting hoy til howe
451 unwittingly tie her one hos
452 tense unwittingly ooh hire
453 unwittingly hose the no ire
454 unwittingly hoe into heres
455 no inter until whose eighty
456 there unwittingly hose ion
457 girls whiteout thy nine one
458 inn thoroughly tin sweetie
459 unwittingly toes her in hoe
460 whiny tent hie neurologist
461 who to his unrelenting yeti
462 interestingly hue into who
463 i wine thoroughly nine test
464 thou interestingly hie now
465 it ooh yet unrelenting wish
466 neurologist wine they hint
467 unwittingly hoe the in eros
468 unholy interesting hit owe
469 unwittingly shoo her in tee
470 ooh unwittingly three sine
471 yet ooh his unrelenting wit
472 thee tin whiny neurologist
473 i sheer unwittingly hot one
474 hewn yeti hint neurologist
475 i tie thoroughly new tennis
476 unwittingly hie other ones
477 i shy too unrelenting white
478 they thine win neurologist
479 he site unwittingly on hero
480 he unwittingly net hoosier
481 i hoes unwittingly on three
482 ninth yeti hew neurologist
483 thy in ewe hint neurologist
484 shoo with unrelenting yeti
485 i win hotel hunt generosity
486 unwittingly heist here ono
487 he is unwittingly here toon
488 twenty hin hie neurologist
489 he tone unwittingly is hero
490 three unwittingly shoe ion
491 he site unwittingly no hero
492 tense unwittingly ooh heir
493 he see unwittingly hot iron
494 thee unwittingly shoe iron
495 i ooh unwittingly here tens
496 he unwittingly soothe rein
497 i shoo unwittingly here ten
498 the inn whitey neurologist
499 thee is unwittingly on hero
500 hero unwittingly hot seine

### goldybrar:people

input: Goldy Brar
category: people
phrases 1 to 45 of 45

1 drab glory
2 by lord rag
3 brad glory
4 by lord gar
5 bard glory
6 bar dry log
7 gal rob dry
8 bra dry log
9 lag rob dry
10 gal orb dry
11 lag orb dry
12 rag lob dry
13 gar lob dry
14 brr go lady
15 brr godly a
16 lar dry gob
17 bly or drag
18 gal bro dry
19 lay brr god
20 gay brr old
21 day brr log
22 lay brr dog
23 lag bro dry
24 bly or grad
25 lar bog dry
26 bar dry gol
27 lab dry gor
28 bra dry gol
29 gal bor dry
30 rag bol dry
31 rag bly rod
32 lag bor dry
33 gay brr dol
34 gar bol dry
35 gar bly rod
36 lad brr goy
37 lard by gor
38 dal brr goy
39 gor bal dry
40 day brr gol
41 rag bly dor
42 gal brr yod
43 rad bly gor
44 gar bly dor
45 lag brr yod

### tealeoni:people

input: Téa Leoni
category: people
phrases 1 to 216 of 216

1 alone tie
2 i eat noel
3 lee in to a
4 alien toe
5 at lie one
6 in eel to a
7 eaten oil
8 on elite a
9 an lee to i
10 atone lie
11 a into lee
12 an eel to i
13 lite aeon
14 no elite a
15 i not lee a
16 aline toe
17 i let aeon
18 i let neo a
19 atone lei
20 i note ale
21 it on lee a
22 an etoile
23 on eat lie
24 it no lee a
25 aeon tile
26 no eat lie
27 a i let one
28 aloe tine
29 i note lea
30 i on lee at
31 neato lie
32 i toe lane
33 i no lee at
34 liane toe
35 a lie note
36 i lot nee a
37 linea toe
38 a tile one
39 a i let eon
40 neato lei
41 i toe lean
42 i tel one a
43 ait leone
44 i tone ale
45 ole i net a
46 aloe nite
47 i tone lea
48 i tele on a
49 iota lene
50 on lie tea
51 i tele no a
52 i tee loan
53 i teel on a
54 tea lie no
55 i teel no a
56 a lie tone
57 i ole ten a
58 a into eel
59 loe i net a
60 line toe a
61 it on eel a
62 on lie ate
63 i lene to a
64 one lite a
65 it no eel a
66 ate lie no
67 i loe ten a
68 no tae lie
69 i on eel at
70 i net aloe
71 i no eel at
72 a oil teen
73 i tel neo a
74 a tie noel
75 i tol nee a
76 on eat lei
77 a i lee ton
78 no eat lei
79 i not eel a
80 on lie eta
81 a i tel eon
82 eta lie no
83 a i eel ton
84 lei note a
85 an lie toe
86 i toe elan
87 lee in tao
88 lion tee a
89 on tie ale
90 ale tie no
91 on tie lea
92 lei tone a
93 lea tie no
94 lee to ani
95 one lei at
96 ale toe in
97 lea toe in
98 an oil tee
99 lee in oat
100 lien toe a
101 lone tie a
102 no tae lei
103 at lie eon
104 loin tee a
105 on lei tea
106 an lei toe
107 no lei tea
108 lino tee a
109 eel to ani
110 late one i
111 on lei ate
112 no lei ate
113 neo lie at
114 a tile eon
115 ain to lee
116 neo lite a
117 lee ion at
118 nee oil at
119 in eel tao
120 i tae noel
121 i one tale
122 on lei eta
123 neo tile a
124 no lei eta
125 nee toil a
126 ain to eel
127 teal one i
128 in eel oat
129 on tae lie
130 it one ale
131 neo lei at
132 it one lea
133 lite eon a
134 ane to lie
135 i one tael
136 i lone tea
137 i lone ate
138 ail on tee
139 on tae lei
140 ail no tee
141 late eon i
142 i ten aloe
143 lone i eat
144 ane to lei
145 i lone eta
146 i neo tale
147 an tie ole
148 i eat leno
149 nee to ail
150 i neo teal
151 ait on lee
152 ait lee no
153 nae to lie
154 it neo ale
155 nai to lee
156 lone tae i
157 it neo lea
158 i nee alto
159 an iot lee
160 an tie loe
161 ole tae in
162 at ion eel
163 i ante ole
164 i nee lota
165 i neo tael
166 tea ole in
167 ait on eel
168 ait no eel
169 nai to eel
170 at lei eon
171 ate ole in
172 nae to lei
173 an iot eel
174 tea noel i
175 loe tae in
176 a tie leno
177 i nota lee
178 a it leone
179 eat ole in
180 i ante loe
181 late neo i
182 ate noel i
183 a tion lee
184 tea loe in
185 at i leone
186 eta ole in
187 ate loe in
188 i lene tao
189 i nota eel
190 eta noel i
191 eat loe in
192 a tion eel
193 leno tae i
194 eta loe in
195 i lene oat
196 tale eon i
197 tea leno i
198 neat ole i
199 ate leno i
200 ale eon it
201 lea eon it
202 eta leno i
203 neat loe i
204 tael eon i
205 a tine ole
206 ane ole it
207 aeon tel i
208 a ion tele
209 a ion teel
210 a tine loe
211 ane loe it
212 a iot lene
213 a nite ole
214 nae ole it
215 a nite loe
216 nae loe it

### elinasvitolina:people

input: Elina Svitolina
category: people
phrases 1 to 500 of 500

1 an initial loves
2 an in is volatile
3 i visit an all one
4 i lives national
5 i listen an viola
6 an alive in is lot
7 i live nationals
8 i steal an violin
9 i live to an nails
10 its online avail
11 i lives an latino
12 i list an alive no
13 it noise vanilla
14 it noise an villa
15 i love an in tails
16 i veils national
17 i live an latinos
18 an in tail is love
19 i veil nationals
20 i till an evasion
21 it sail an in love
22 an initials love
23 its in alive loan
24 i nail to an lives
25 i atone villains
26 i nails an violet
27 i last an in olive
28 live national is
29 its on alive nail
30 it is an live loan
31 national is veil
32 alive in to nails
33 i live an ain lost
34 i toenails anvil
35 its no alive nail
36 in to an live sail
37 evil national is
38 i sin an volatile
39 i list an ain love
40 on initial slave
41 it nails an olive
42 i tail an on lives
43 novel initials a
44 i toe an villains
45 i lot an ain lives
46 at noise villain
47 an nail is violet
48 i live to an slain
49 slave initial no
50 an latino is evil
51 i live to an snail
52 novels initial a
53 ain a tell vision
54 i tail an no lives
55 alone nail visit
56 in a listen viola
57 i nails to an evil
58 an initial solve
59 sail into an evil
60 i tail an in loves
61 least ain violin
62 i slate an violin
63 i live an on tails
64 in violate nails
65 it nail an olives
66 i live an no tails
67 violin aliens at
68 its in alone vial
69 it live an on sail
70 novel initial as
71 i nail an violets
72 an live no is tail
73 also nail invite
74 i snail an violet
75 it live an no sail
76 in violates nail
77 i stale an violin
78 its in a nail love
79 live sail nation
80 its in love liana
81 i slot an alive in
82 in valet liaison
83 alive in to slain
84 it is an evil loan
85 violin entails a
86 alive in to snail
87 i live an ain lots
88 vile national is
89 an in olive tails
90 i solve an in tail
91 ain violent sail
92 live a into nails
93 its in a live loan
94 ain latino lives
95 in violin steal a
96 an in at oil lives
97 in violate snail
98 violent a is nail
99 in sail to an evil
100 villain to anise
101 an saint live oil
102 i love an in alist
103 liana into lives
104 an a tiles violin
105 i slit an alive no
106 avail into lines
107 an in alive toils
108 an ill a visit one
109 ain live latinos
110 violent in sail a
111 an in at live soil
112 silva into alien
113 i violates an lin
114 i is an live talon
115 alien loan visit
116 it snail an olive
117 i tail an live son
118 so initial navel
119 in a lives latino
120 it oil an in slave
121 on initial salve
122 its ain live loan
123 i love its anal in
124 salve initial no
125 its in love lanai
126 it ails an in love
127 violent alias in
128 its violin lean a
129 i snail to an evil
130 alone lain visit
131 in a live latinos
132 i lain to an lives
133 evil sail nation
134 on a site villain
135 i live into an las
136 vials into alien
137 in a till evasion
138 an in a list olive
139 alive latinos in
140 no a site villain
141 its on a live nail
142 ain violet nails
143 an ain olive list
144 an alive no is lit
145 in isolate anvil
146 its on live liana
147 i is an novel tail
148 in toenails vial
149 its no live liana
150 its no a live nail
151 vial into aliens
152 an ill ain soviet
153 an on tail is evil
154 lanai into lives
155 i violate an nils
156 it sail an on evil
157 insane vital oil
158 an stain live oil
159 an ain lot is evil
160 also lain invite
161 vain in to allies
162 an no tail is evil
163 salina into evil
164 i enlist an viola
165 it sail an no evil
166 ain silent viola
167 in a nails violet
168 i sin an alive lot
169 volatile ain sin
170 in a toes villain
171 i sit an live loan
172 in toenail silva
173 ain in love tails
174 in to an live ails
175 volatile nina is
176 vital no is alien
177 i lives an in alto
178 violins entail a
179 alive in is talon
180 i lives to an anil
181 in entails viola
182 alive son tail in
183 i salt an in olive
184 live ails nation
185 alive nina is lot
186 i lot an in valise
187 violin entail as
188 i veil an latinos
189 i nails to an veil
190 so venal initial
191 an latino is veil
192 an in tali is love
193 invite sail loan
194 an lilo is native
195 an in a toil lives
196 ain evil latinos
197 live in to salina
198 i slit an ain love
199 at liven liaison
200 live a into slain
201 i live an on alist
202 ain viola listen
203 live a into snail
204 an a live its lion
205 alive latino sin
206 in as live latino
207 i live an no alist
208 native nails oil
209 evil a into nails
210 an live in is alto
211 alive ain tonsil
212 ain nail to lives
213 its in a loan evil
214 in toenail vials
215 alive las into in
216 in to an alive lis
217 also invite anil
218 live as into nail
219 it live an on ails
220 ain slain violet
221 its on alive anil
222 i live its anal no
223 ain violet snail
224 an saint oil evil
225 its in a lain love
226 anvil is toenail
227 is an live latino
228 it live an no ails
229 in latino valise
230 in at noise villa
231 an ain lit is love
232 ain violent ails
233 in liana to lives
234 an in at soil evil
235 stale ain violin
236 its in oval alien
237 i is an evil talon
238 anvil into aisle
239 its no alive anil
240 i tail an evil son
241 alas invite lion
242 sail into an veil
243 i nail its novel a
244 in violates anil
245 in avail to lines
246 i live an in altos
247 nail into valise
248 i nail into slave
249 its on a nail evil
250 native sail lion
251 it envision all a
252 i nail to an evils
253 an initials vole
254 on a ties villain
255 its no a nail evil
256 not avian lilies
257 in silva to alien
258 i lives an on tali
259 vial into saline
260 no a ties villain
261 i last an live ion
262 villa into anise
263 alive in sit loan
264 i is an naive toll
265 native nail soil
266 an as invite lilo
267 i list an one vial
268 anvil is elation
269 it lain an olives
270 i lives an no tali
271 violent liana is
272 its on live lanai
273 it is an vile loan
274 olive nail saint
275 volatile a sin in
276 i live an ain slot
277 alien at violins
278 ails into an evil
279 i veil an ain lost
280 alive saint lion
281 its ain evil loan
282 i silt an alive no
283 natives nail oil
284 an in tiles viola
285 an in as live toil
286 violins aline at
287 live into an sail
288 an in at live oils
289 live into salina
290 till via an noise
291 i sit an evil loan
292 invite oil nasal
293 its no live lanai
294 i soil an in valet
295 veil sail nation
296 an a tile violins
297 in sail to an veil
298 alive anti lions
299 i aliens to anvil
300 an in a live toils
301 violet sail nina
302 i lain an violets
303 an in at live silo
304 evil ails nation
305 i violates an nil
306 i loves an in tali
307 ain vital lesion
308 its on alien vial
309 an in oil is valet
310 not liaise anvil
311 i veils an latino
312 in to an vile sail
313 saline at violin
314 an a invites lilo
315 its in a love anil
316 native slain oil
317 its no alien vial
318 i live into an als
319 native snail oil
320 an anil is violet
321 i toil an in slave
322 ain till evasion
323 an nail sit olive
324 in ails to an evil
325 silva into aline
326 ail into an lives
327 an live no is tali
328 aline loan visit
329 in vials to alien
330 i lives an in lota
331 sin violate nail
332 an in olive alist
333 i veil to an slain
334 olives tail nina
335 i tinsel an viola
336 i snail to an veil
337 salient a violin
338 in vial to aliens
339 it lies an on vial
340 lives ail nation
341 alive nail sit no
342 i liven to an sail
343 ion listen avail
344 an in violate lis
345 i nail to an veils
346 violent lanai is
347 an satin live oil
348 i veil an on tails
349 salina into veil
350 its in anal olive
351 an in villa is toe
352 alias invent oil
353 in lanai to lives
354 it lies an no vial
355 olive nail stain
356 ain nails to evil
357 in ail to an lives
358 volatile ain ins
359 its on evil liana
360 i loves an ain lit
361 vials into aline
362 alone lin visit a
363 i tail an on evils
364 alive stain lion
365 in violin slate a
366 i veil an no tails
367 tennis oil avail
368 vain a listen oil
369 an on tail is veil
370 anvil tail noise
371 its no evil liana
372 it sail an on veil
373 ain latino evils
374 volatile a is inn
375 i lot an ain evils
376 ani listen viola
377 ain no live tails
378 an ain lot is veil
379 latino via lines
380 i envision all at
381 an in alto is evil
382 ain vile latinos
383 an stain oil evil
384 i tail an no evils
385 invite ails loan
386 in a nail violets
387 i lot via an lines
388 liana into evils
389 in a snail violet
390 an live in is lota
391 violet salina in
392 live lion saint a
393 an no tail is veil
394 ain violin tales
395 an ain live toils
396 it sail an no veil
397 alive latino ins
398 i listen via loan
399 an in a slit olive
400 avian silent oil
401 violent in ails a
402 live lis into an a
403 noise aint villa
404 alive nils into a
405 its live no lain a
406 alone anil visit
407 in violin stale a
408 it live an ain sol
409 inn violate sail
410 alive lin into as
411 an vile no is tail
412 aisle tan violin
413 in as nail violet
414 it sail an vile no
415 live liaison tan
416 in salina to evil
417 its ain a love lin
418 an lilo vanities
419 naive last oil in
420 it ails an on evil
421 native nail oils
422 slain a into evil
423 it ails an no evil
424 online avail sit
425 evil a into snail
426 i lot an alive ins
427 native nail silo
428 i ail an novelist
429 it oil an in salve
430 ain latino veils
431 ain at live lions
432 i oil an in valets
433 violin steal ani
434 an las oil invite
435 i solve an in tali
436 avian oil listen
437 evil as into nail
438 i till via an ones
439 vital nail noise
440 in at nails olive
441 an in sat live oil
442 aliens tail vino
443 ain at lives lion
444 is to an live nail
445 viola tin aliens
446 alone in via list
447 i votes an ain ill
448 alive anti loins
449 its vial nail one
450 it love an ain lis
451 in silva elation
452 it nails alive no
453 i is an alien volt
454 evasion tail lin
455 anal in is violet
456 i oil an in vestal
457 evasion nail lit
458 live nina to sail
459 an in a til olives
460 soviet lain nail
461 violent a is anil
462 it ail an on lives
463 native ails lion
464 i nails violent a
465 i silt an ain love
466 live liaison ant
467 sit an alive lion
468 i oil an live ants
469 liana into veils
470 alive in last ion
471 it ail an no lives
472 lanai into evils
473 i itll an evasion
474 i visit an all eon
475 native lain soil
476 violet sail an in
477 i tail an on veils
478 olive nail satin
479 its all naive ion
480 its on a live anil
481 ala invite lions
482 its ana live lion
483 it ail an in loves
484 alive satin lion
485 i listen on avail
486 i lot an ain veils
487 olive lain saint
488 its on evil lanai
489 i veil an ain lots
490 alien sat violin
491 all a invite sion
492 i live an lost ani
493 alien vital sion
494 an ain olive slit
495 i last an evil ion
496 alive nation lis
497 alive sin to nail
498 i tail an no veils
499 ana tiles violin
500 alone in sit vial
