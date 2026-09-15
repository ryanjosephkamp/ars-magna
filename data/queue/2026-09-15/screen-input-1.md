<!-- screen_version: v1 -->
# Screening anagrams for the Ars Magna Greatest Hits

Each section below is one **input** (a person, company, product, title, place or phrase), its **category**, and a numbered list of **phrases**. Every phrase is a rearrangement of exactly the input's letters into real English words. The letters are already checked; do not re-check them.

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

## File 1 of 5: 2701 phrases

### bobmackie:people

input: Bob Mackie
category: people
phrases 1 to 56 of 56

1 cake bimbo
2 i bomb cake
3 i ebb mock a
4 kabob mice
5 i mock babe
6 ok mic ebb a
7 i bake comb
8 i mob beck a
9 i comb beak
10 mac ebb i ok
11 i beam bock
12 cam ebb i ok
13 a comb bike
14 ick me bob a
15 i mock abbe
16 a ick be mob
17 ok came bib
18 i me kab cob
19 mic ok babe
20 boa be mick
21 bock be aim
22 mack be obi
23 cob be kami
24 mic ok abbe
25 mace bib ok
26 mica ebb ok
27 acme bib ok
28 mic bob kea
29 mic ebb oak
30 back obi me
31 i make cobb
32 mic ebb oka
33 a cobb mike
34 bab ok mice
35 abo be mick
36 oba be mick
37 mack be bio
38 back bio me
39 kab mob ice
40 i mabe bock
41 ambo beck i
42 ambo be ick
43 bam bice ok
44 ami bock be
45 mac ebb koi
46 cam ebb koi
47 mac oke bib
48 cam oke bib
49 kae mic bob
50 mae ick bob
51 moa ick ebb
52 koa mic ebb
53 ick bae mob
54 oke bab mic
55 kab obe mic
56 bam obe ick

### camskattebo:people

input: Cam Skattebo
category: people
phrases 1 to 500 of 500

1 combat stake
2 me toast back
3 me backs to at
4 a to me tsk cab
5 combat steak
6 teams to back
7 back stem to a
8 tsk to a be mac
9 combat takes
10 steam to back
11 best a to mack
12 tsk to a be cam
13 combat skate
14 mates to back
15 back a set tom
16 cob me tsk at a
17 backseat tom
18 most eat back
19 as met to back
20 setback atom
21 me stack boat
22 back ems to at
23 setback moat
24 me attack sob
25 mock a best at
26 beaks tomcat
27 most back tea
28 me task to cab
29 bakes tomcat
30 meats to back
31 most a be tack
32 backseat mot
33 team to backs
34 me sack to bat
35 aback totems
36 most back ate
37 at be to smack
38 smack to beat
39 matt a be sock
40 most take cab
41 ok at best mac
42 mate to backs
43 me bask to act
44 me attack bos
45 me sack to tab
46 back seat tom
47 me bask to cat
48 me tacks boat
49 a met to backs
50 meat to backs
51 ok at best cam
52 me task cabot
53 mock at bet as
54 back east tom
55 stock a be tam
56 some tat back
57 a smack to bet
58 mac to basket
59 back a set mot
60 me tack boats
61 mock a bets at
62 so matte back
63 mask be to act
64 combs take at
65 mock at be sat
66 mack to beast
67 me tots back a
68 tom setback a
69 back a met sot
70 cam to basket
71 mask be to cat
72 most back eta
73 me bat to cask
74 comb takes at
75 me cabs to kat
76 mack to beats
77 mat a to becks
78 stack to beam
79 ok at scam bet
80 bat make cost
81 mat as to beck
82 task come bat
83 back sat to me
84 me tack boast
85 me scab to kat
86 back same tot
87 me tack to abs
88 toast be mack
89 me cab to kats
90 bam take cost
91 me bat stock a
92 at stock beam
93 task be to mac
94 smack to beta
95 ok mast be act
96 cast take mob
97 mock a bet sat
98 tomb casket a
99 me tot back as
100 at mock beast
101 as bet to mack
102 casket to bam
103 ok at bets mac
104 som be attack
105 ok mast be cat
106 tab make cost
107 mac ask to bet
108 cats take mob
109 task be to cam
110 most cake bat
111 ok at bet cams
112 task come tab
113 a bets to mack
114 acts take mob
115 me tack to bas
116 most bake act
117 sat be to mack
118 at mock beats
119 ok tam be cast
120 tombs cake at
121 mock tat be as
122 comb stake at
123 ok at bets cam
124 mos be attack
125 cam ask to bet
126 cab takes tom
127 mock a set tab
128 comb take sat
129 ok tam be cats
130 tomb cakes at
131 ok matt be sac
132 at comb steak
133 ok set act bam
134 back eat toms
135 ok tam be acts
136 back a totems
137 mat be to sack
138 totem backs a
139 ok set cat bam
140 at mocks beat
141 ok at bet macs
142 backs eat tom
143 kat be to scam
144 sack met boat
145 back ems tot a
146 cabs take tom
147 ok sat bet mac
148 kat come stab
149 a mats to beck
150 back as totem
151 mock at be tas
152 at smock beat
153 tam be to sack
154 most bake cat
155 ok act met abs
156 act takes mob
157 me ok bats act
158 scab take tom
159 sec kat to bam
160 atom be stack
161 ok sat bet cam
162 bat act smoke
163 ok cat met abs
164 act make bots
165 me ok bats cat
166 tacks to beam
167 me so tat back
168 tack to beams
169 ok mas act bet
170 beat sack tom
171 me bat ok acts
172 most act beak
173 back tas to me
174 back team sot
175 ok mac set tab
176 mack set boat
177 kat be to cams
178 act take mobs
179 ok mas cat bet
180 mob casket at
181 ace a tsk tomb
182 back mat toes
183 ok act met bas
184 most cake tab
185 ok tam be scat
186 cat takes mob
187 ok cam set tab
188 bet coat mask
189 stack tom be a
190 tomb act sake
191 ok mas be tact
192 mock bates at
193 mat kat be cos
194 bat cat smoke
195 kats be to mac
196 kat be mascot
197 mock a bet tas
198 cat make bots
199 etc ask to bam
200 best act mako
201 ok cat met bas
202 comb skate at
203 mas be to tack
204 back eats tom
205 sec at mob kat
206 tom backs tea
207 be act ask tom
208 most cat beak
209 mat be to cask
210 back seat mot
211 tas be to mack
212 cat take mobs
213 kats be to cam
214 back atom set
215 me stock a tab
216 some tack bat
217 sack tom be at
218 bat ask comet
219 kat be to macs
220 cast make bot
221 a so matt beck
222 tomb cat sake
223 be cat ask tom
224 back at tomes
225 ace at tsk mob
226 bam eat stock
227 ok ems act bat
228 mack to baste
229 tam be to cask
230 stab cake tom
231 be stock mat a
232 back at smote
233 at so bet mack
234 best cat mako
235 at bes to mack
236 act makes bot
237 ok ems cat bat
238 tab act smoke
239 ok sac met tab
240 atoms be tack
241 tacks tom be a
242 back east mot
243 ok tas bet mac
244 back mate sot
245 ok ems act tab
246 moat be stack
247 sec tam ok bat
248 cab stake tom
249 tsk a come bat
250 kat come tabs
251 me sock at bat
252 cats make bot
253 ok ems cat tab
254 mac take bots
255 ok tas bet cam
256 amok act best
257 tame a tsk cob
258 back sate tom
259 tom as be tack
260 coma task bet
261 me tot a backs
262 tom cab steak
263 me stack a bot
264 comb eat task
265 ok tam bet sac
266 stab make cot
267 me so tack bat
268 sack eat tomb
269 sec tam ok tab
270 acts make bot
271 tsk a come tab
272 tom backs ate
273 me tsk a cabot
274 tame to backs
275 me sock at tab
276 cab make tots
277 sack mott be a
278 back mats toe
279 tot a be smack
280 kat comes bat
281 ace tsk to bam
282 bat make scot
283 tsk at be coma
284 mack to betas
285 be cot mask at
286 cat makes bot
287 me ask act bot
288 tab cat smoke
289 back at met so
290 scat take mob
291 be act mats ok
292 mob act stake
293 be sock mat at
294 tome backs at
295 me sack at bot
296 bat team sock
297 cabs at met ok
298 sat mock beat
299 tomb etc ask a
300 cab take toms
301 met a sock bat
302 amok cat best
303 bat a mock set
304 bock teams at
305 tots a be mack
306 back oats met
307 ems cab to kat
308 bates to mack
309 me ok acts tab
310 stack eat mob
311 me ask cat bot
312 sac take tomb
313 me so tack tab
314 mob act steak
315 scab at met ok
316 scam take bot
317 be cast mat ok
318 stab eat mock
319 ok ems tat cab
320 bot came task
321 at so mat beck
322 cam take bots
323 be cat mats ok
324 some tack tab
325 tat so be mack
326 mot setback a
327 be mock tats a
328 cab ask totem
329 stack mot be a
330 tate ask comb
331 me tack a bots
332 tab ask comet
333 ok tam bes act
334 back moat set
335 ask at met cob
336 tom bake cast
337 be cats mat ok
338 tea stock bam
339 sock at be tam
340 bam take scot
341 be acts mat ok
342 tomb cake sat
343 mat so be tack
344 mob cat stake
345 cab at stem ok
346 comet bask at
347 ok tam bes cat
348 bock steam at
349 me ask cot bat
350 atom be tacks
351 kat so met cab
352 bat cakes tom
353 ok tet cab mas
354 taco mask bet
355 me tacks a bot
356 mob cat steak
357 met a sock tab
358 tom bake cats
359 me tack at sob
360 tea task comb
361 be mocks tat a
362 tomb sack tea
363 be act ask mot
364 aback set tom
365 be smock tat a
366 kats come bat
367 tsk a bet coma
368 bat makes cot
369 bet cot mask a
370 etc mask boat
371 tam so be tack
372 cab skate tom
373 tack toms be a
374 tabs cake tom
375 mob etc ask at
376 tom bake acts
377 sack mot be at
378 back tae toms
379 cab sat met ok
380 bat seat mock
381 tot as be mack
382 backs tae tom
383 be cat ask mot
384 bat make cots
385 kat so bet mac
386 bat mate sock
387 bet sock mat a
388 cask met boat
389 stab act me ok
390 beaks act tom
391 kat bes to mac
392 base tack tom
393 me as tack bot
394 kat comes tab
395 be mac ask tot
396 tab make scot
397 bat mac set ok
398 at mock baste
399 me ask cot tab
400 bet sack atom
401 be scam tat ok
402 back teas tom
403 bet mocks at a
404 tao met backs
405 stab cat me ok
406 cab makes tot
407 a to mast beck
408 tabs make cot
409 me bask cot at
410 mob stack tea
411 bet smock at a
412 tab team sock
413 me bat cos kat
414 ate stock bam
415 kat so bet cam
416 meat sock bat
417 tsk a comb tea
418 beak cast tom
419 be mac tats ok
420 tea mock stab
421 kat bes to cam
422 tom bakes act
423 comb tet ask a
424 mob act skate
425 bet sack a tom
426 mote backs at
427 mob etc task a
428 stock met baa
429 be cam ask tot
430 stoat be mack
431 tack som be at
432 coma tsk beat
433 bat cast me ok
434 beat mask cot
435 tacks mot be a
436 kat come bast
437 be cot ask mat
438 tom beat cask
439 me tack at bos
440 bet cast mako
441 bat cam set ok
442 bam take cots
443 tsk at be camo
444 beaks cat tom
445 bat cats me ok
446 bat ask comte
447 tack mos be at
448 ate task comb
449 be scat mat ok
450 tomb sack ate
451 me act kat sob
452 beak cats tom
453 me tat as bock
454 beta sack tom
455 be cam tats ok
456 mac takes bot
457 cab mat set ok
458 sob cake matt
459 most a at beck
460 kat cost beam
461 me ok tact abs
462 beat mat sock
463 tabs act me ok
464 mako test cab
465 tsk a comb ate
466 most cab teak
467 be cot ask tam
468 cab tat smoke
469 mot as be tack
470 tab cakes tom
471 me cat kat sob
472 cob team task
473 tabs cat me ok
474 tabs eat mock
475 a to tam becks
476 tact make sob
477 at to mas beck
478 tom beak acts
479 be cams tat ok
480 at mock betas
481 tab cast me ok
482 back sea mott
483 tom at be cask
484 tom bakes cat
485 cab tam set ok
486 moat be tacks
487 bock set mat a
488 bet cats mako
489 as to tam beck
490 bet smack tao
491 met to cab ask
492 bot sack team
493 tom etc bask a
494 mob cat skate
495 cob me task at
496 comb take tas
497 met cot bask a
498 bats kat come
499 bock met as at
500 cams take bot

### jaxsondart:people

input: Jaxson Dart
category: people
phrases 1 to 11 of 11

1 jordans tax
2 don jars tax
3 nod jars tax
4 raj tax dons
5 raj tax nods
6 dons jar tax
7 nods jar tax
8 sax jot darn
9 sax jot rand
10 darn taj sox
11 rand taj sox

### odellbeckhamjr:people

input: Odell Beckham Jr.
category: people
phrases 1 to 500 of 500

1 calm behold jerk
2 her deck job mall
3 hell jam bedrock
4 her led block jam
5 bell joked march
6 her jock bed mall
7 jock harmed bell
8 her mod bell jack
9 jam behold clerk
10 her dock bell jam
11 clam behold jerk
12 her dell job mack
13 bell joked charm
14 her del block jam
15 dell jack hombre
16 her dell mob jack
17 bleach mold jerk
18 her lock bled jam
19 comb jerked hall
20 her meld job lack
21 combed jerk hall
22 her med ball jock
23 held jock marble
24 her jock bell dam
25 raj bled hemlock
26 her elm jack bold
27 loch jerk bedlam
28 her led lamb jock
29 jar bled hemlock
30 her doll jam beck
31 loch jerked lamb
32 her bel mold jack
33 blamed loch jerk
34 her del lamb jock
35 held blocker jam
36 her moll jack deb
37 moll jacked herb
38 her mad jock bell
39 blocked helm raj
40 jack bed her moll
41 held jock ramble
42 her med jack boll
43 heckler mold jab
44 her jock bled lam
45 jock helm balder
46 her elm bald jock
47 loch jerked balm
48 her jock meld lab
49 bach jerked moll
50 her meld lock jab
51 herm balled jock
52 her boll deck jam
53 jack bolder helm
54 her dell mock jab
55 jar blocked helm
56 me bell hard jock
57 boll jerked mach
58 all job deck herm
59 herbal jock meld
60 her meld lob jack
61 herm jacked boll
62 me jerk cold blah
63 blocker meld haj
64 dark cell hem job
65 jam bold heckler
66 he jerk cold lamb
67 jarl blocked hem
68 her dell jam bock
69 jarl bed hemlock
70 he jerk bold calm
71 merch joked ball
72 me block held raj
73 jarl beheld mock
74 mad hell jerk cob
75 dermal bleh jock
76 me block held jar
77 cabled jerk holm
78 bad cell jerk ohm
79 jarl deb hemlock
80 all herm bed jock
81 blam loch jerked
82 hold jerk be calm
83 cham boll jerked
84 jack bled her mol
85 jarl bleh mocked
86 calm job herd elk
87 old elm jack herb
88 red jock bell ham
89 cod hell jerk bam
90 mod hell jerk cab
91 he jerk cold balm
92 red hell jam bock
93 cold jerk hem lab
94 old reb helm jack
95 bad col helm jerk
96 calm job herd lek
97 he clerk bold jam
98 jab deck her moll
99 held bel rock jam
100 red jock hem ball
101 red jock helm lab
102 all hem bred jock
103 old beck helm raj
104 cold bel jerk ham
105 he jerk bold clam
106 mad cell jerk hob
107 old beck helm jar
108 mod hell jack reb
109 held elk cram job
110 held col jerk bam
111 old lech jerk bam
112 me brad hell jock
113 bad loch jerk elm
114 held reb lock jam
115 he bell dorm jack
116 held elm bar jock
117 old bel jerk mach
118 calm led jerk hob
119 arm job deck hell
120 mod hell jar beck
121 old herm jack bel
122 held jock arm bel
123 hold jerk be clam
124 dark elm job lech
125 mack job red hell
126 held mol jerk cab
127 cold elk jam herb
128 me jack doll herb
129 held rom jack bel
130 jack berm do hell
131 jam bed rock hell
132 held lek cram job
133 jack mob red hell
134 me hold clerk jab
135 calm del jerk hob
136 mad loch jerk bel
137 held cob jerk lam
138 red boll hem jack
139 jerk cell had mob
140 ram job deck hell
141 held jock ram bel
142 held bel mock raj
143 cold lek jam herb
144 held bel cork jam
145 held bel mock jar
146 me herd jock ball
147 me clerk job dahl
148 he jam droll beck
149 me clerk bold haj
150 held mol jack reb
151 held col jam berk
152 old lech jam berk
153 bad lech jerk mol
154 me bard hell jock
155 jack be dorm hell
156 me jerk doll bach
157 bald col hem jerk
158 calm hod jerk bel
159 mod ell jack herb
160 ok meld belch raj
161 had job clerk elm
162 held jock lam reb
163 jack bell do herm
164 arch job meld elk
165 held mol jar beck
166 he jack doll berm
167 mar job deck hell
168 held jock mar bel
169 held col jam kerb
170 old lech jam kerb
171 mad lech jerk lob
172 me bred jock hall
173 raj bed mock hell
174 mod lech jerk lab
175 jack be lord helm
176 jam bed cork hell
177 jar bed mock hell
178 lack job red helm
179 jam deb rock hell
180 call bed jerk ohm
181 bold jerk hem lac
182 jam be clerk hold
183 jack bed hem roll
184 me jerk clod blah
185 arch job meld lek
186 held elm jar bock
187 me herd boll jack
188 he bred moll jack
189 ham job clerk led
190 he jerk clod lamb
191 cab old helm jerk
192 he mold clerk jab
193 cold elk jab herm
194 jab mock red hell
195 he bred jock mall
196 clad elk job herm
197 jack bell red ohm
198 lam belch do jerk
199 he bell jock dram
200 he meld block raj
201 jar mob deck hell
202 bell rem had jock
203 he meld block jar
204 lamb lech do jerk
205 lack job held rem
206 ham job clerk del
207 jack be droll hem
208 me jerk boll chad
209 jab clerk do helm
210 had comb jerk ell
211 harm job deck ell
212 chalk job red elm
213 job med hark cell
214 jack rob held elm
215 cold lek jab herm
216 marc job held elk
217 arm bed jock hell
218 clad bel jerk ohm
219 jam orb deck hell
220 jar bed lock helm
221 clad lek job herm
222 rack job held elm
223 jack bed hell rom
224 clad lob hem jerk
225 me jerk bloc dahl
226 ball doc hem jerk
227 jam bell hock red
228 jam herb lock led
229 mach bell do jerk
230 card job helm elk
231 he jerk clod balm
232 jam deb cork hell
233 jar deb mock hell
234 jack rob med hell
235 call deb jerk ohm
236 lack job herd elm
237 jack bel hold rem
238 ham bell cod jerk
239 jerk hell dam cob
240 clad hob jerk elm
241 rack job med hell
242 jab lock red helm
243 bach old jerk elm
244 had bloc jerk elm
245 jack deb hem roll
246 drab jock hem ell
247 jack reb hold elm
248 marc job held lek
249 hell jerk doc bam
250 mach be doll jerk
251 ram bed jock hell
252 jack bel lord hem
253 jam herb lock del
254 jam reb dock hell
255 bald loch jerk me
256 dram be jock hell
257 mod bel clerk haj
258 jack be herd moll
259 helm led bar jock
260 jack be doll herm
261 jam rob deck hell
262 jack lob red helm
263 harm be jock dell
264 card job helm lek
265 mall be jock herd
266 a belch mold jerk
267 helm or bled jack
268 cab doll hem jerk
269 jar beck hold elm
270 jam berk cod hell
271 call bod hem jerk
272 jab clerk old hem
273 jerk cell ham bod
274 jab rock held elm
275 jack orb held elm
276 mac lob held jerk
277 jack mob herd ell
278 haj bell mock red
279 ball cod hem jerk
280 clam job herd elk
281 lab cod helm jerk
282 lac mob held jerk
283 helm del bar jock
284 hell med bar jock
285 her jock deb mall
286 jab lock held rem
287 chad be jerk moll
288 mar bed jock hell
289 ham bell doc jerk
290 jerk led ham bloc
291 cam lob held jerk
292 jam bel lock herd
293 jam kerb cod hell
294 raj mob deck hell
295 hell jock arm deb
296 jab rock med hell
297 jack orb med hell
298 jar deb lock helm
299 march job led elk
300 jam bell deck rho
301 jar bell deck ohm
302 her led jock balm
303 mel her bold jack
304 rom hell jack deb
305 hall job deck rem
306 jar bell dock hem
307 jack lob held rem
308 helm rod jack bel
309 cab hold jerk elm
310 jab deck hem roll
311 mac bel hold jerk
312 charm job led elk
313 raj comb held elk
314 hem doll jack reb
315 jack rob led helm
316 mark job lech led
317 her dell jock bam
318 hell rod jam beck
319 jar bell hock med
320 jar comb held elk
321 jerk del ham bloc
322 clam job herd lek
323 blah cod jerk elm
324 raj bed lock helm
325 hell doc jam berk
326 rack job led helm
327 haj block red elm
328 hell jerk bod mac
329 march job del elk
330 her del jock balm
331 jab lock herd elm
332 cam bel hold jerk
333 cab dell jerk ohm
334 dab cell jerk ohm
335 hem dell bar jock
336 cad mob hell jerk
337 hell jock ram deb
338 jerk loch lam deb
339 lab doc helm jerk
340 march job led lek
341 raj deb mock hell
342 hem doll jar beck
343 erm jock had bell
344 charm job del elk
345 jack rob del helm
346 mark job lech del
347 bach led jerk mol
348 jar belch meld ok
349 jack bell rod hem
350 hell jerk bod cam
351 lad job clerk hem
352 jam hob clerk led
353 held job lack erm
354 lard be jock helm
355 cab dol helm jerk
356 hem dork jab cell
357 hell doc jam kerb
358 jam herb dock ell
359 haj be clerk mold
360 jerk dell ham cob
361 jack lob herd elm
362 charm job led lek
363 raj comb held lek
364 rack job del helm
365 chalk job led rem
366 jar comb held lek
367 jab cork held elm
368 balm lech do jerk
369 hall bed jock rem
370 lack job led herm
371 jack bel herd mol
372 rem hell jack bod
373 harm bed jock ell
374 lam bed loch jerk
375 jerk loch dam bel
376 march job del lek
377 dah mob cell jerk
378 jab deck hell rom
379 bach del jerk mol
380 call hob med jerk
381 jam hob clerk del
382 blah doc jerk elm
383 char job meld elk
384 hell jock mar deb
385 red hell jock bam
386 herd jock lam bel
387 jab cork med hell
388 mack job herd ell
389 raj beck hold elm
390 jar bel dock helm
391 charm job del lek
392 dab col helm jerk
393 jab rock led helm
394 jack orb led helm
395 jerk clod ham bel
396 helm led jar bock
397 chalk job del rem
398 jar lob deck helm
399 jack bell med rho
400 lack job del herm
401 mel her bald jock
402 jab mock herd ell
403 brad jock hem ell
404 bad jock hell rem
405 jack rob dell hem
406 jab dock hell rem
407 raj block led hem
408 hell jock dam reb
409 hack job dell rem
410 helm dol jack reb
411 bach mod jerk ell
412 led jerk loch bam
413 her bell dom jack
414 bleh me lord jack
415 jam bloc herd elk
416 jar block led hem
417 med jerk loch lab
418 rack job dell hem
419 mol led jack herb
420 haj bell rock med
421 mac bell hod jerk
422 med jerk col blah
423 erm hell jack bod
424 dah job clerk elm
425 led jock harm bel
426 med jerk cob hall
427 jab cord helm elk
428 all herb jock med
429 raj deb lock helm
430 jab rock del helm
431 jack orb del helm
432 droll jam be heck
433 jam bel chord elk
434 raj bell deck ohm
435 helm del jar bock
436 hell med jar bock
437 dal job clerk hem
438 char job meld lek
439 dab loch jerk elm
440 raj bell dock hem
441 bach dol jerk elm
442 helm dol jar beck
443 calm bled jerk oh
444 jam bock herd ell
445 led jock lam herb
446 hod jerk cell bam
447 jam bel clerk hod
448 cam bell hod jerk
449 oh dell jack berm
450 ell jock had berm
451 ham bled col jerk
452 raj block del hem
453 chad mob jerk ell
454 del jerk loch bam
455 jar block del hem
456 dam hob cell jerk
457 jam reb hock dell
458 raj bell hock med
459 jar boll deck hem
460 led helm jock bra
461 jerk lech lam bod
462 mol del jack herb
463 jerk hod clam bel
464 del jock harm bel
465 jam bloc herd lek
466 rem hell dab jock
467 jack bel meld rho
468 jack bell hod rem
469 raj bled lock hem
470 mad reb jock hell
471 blam he jerk cold
472 jar bled lock hem
473 lab jock herd elm
474 jab cord helm lek
475 held lock jab erm
476 lad mob lech jerk
477 lark job lech med
478 jam bel chord lek
479 ell jock harm deb
480 del jock lam herb
481 doll hem beck raj
482 cad bell jerk ohm
483 lad cob helm jerk
484 hem jock lard bel
485 raj belch mod elk
486 del helm jock bra
487 jab lock led herm
488 jar belch mod elk
489 haj mob clerk led
490 jab rock dell hem
491 jack orb dell hem
492 hem dell jar bock
493 dak job cell herm
494 heck deb roll jam
495 hall job deck erm
496 jarl me hold beck
497 jab cork led helm
498 larch job med elk
499 held lob jack erm
500 bard jock hem ell

### robertkraft:people

input: Robert Kraft
category: people
phrases 1 to 129 of 129

1 trek for brat
2 brr trek of at
3 berk for tart
4 brr ok far tet
5 kerb for tart
6 brr oft trek a
7 bar trek fort
8 ok fet brrr at
9 berk fort art
10 brr ok rat fet
11 fart rob trek
12 brr ref to kat
13 bra trek fort
14 brr ok tat ref
15 raft rob trek
16 brr tet fork a
17 kerb fort art
18 brr ok tar fet
19 berk fort rat
20 at brr fret ok
21 frat rob trek
22 brr tet of ark
23 kerb fort rat
24 brr fet to ark
25 bark fret rot
26 ok fet brr art
27 berk rot fart
28 fet or brr kat
29 fart orb trek
30 fer brr to kat
31 barf trek rot
32 brr att ok ref
33 berk fort tar
34 brr arf ok tet
35 berk rot raft
36 at brr fet kor
37 bark fret tor
38 tat brr fer ok
39 raft orb trek
40 att brr fer ok
41 kerb rot fart
42 ref trot bark
43 berk rot frat
44 frat orb trek
45 tor fart berk
46 kerb fort tar
47 far berk trot
48 kerb rot raft
49 barf trek tor
50 reb rot kraft
51 kerb rot frat
52 tor raft berk
53 tor fart kerb
54 bot err kraft
55 brat fret kor
56 far kerb trot
57 tort bark ref
58 tor raft kerb
59 far berk tort
60 tart reb fork
61 far kerb tort
62 frat berk tor
63 bret or kraft
64 kraft reb tor
65 frat kerb tor
66 fart bro trek
67 art bret fork
68 raft bro trek
69 brrr oft take
70 frat bro trek
71 rat bret fork
72 kart rob fret
73 fatter brr ok
74 take brr fort
75 ark bret fort
76 tart berk fro
77 art bork fret
78 tar bret fork
79 tart kerb fro
80 brat trek fro
81 fake brr trot
82 rat bork fret
83 kart orb fret
84 fake brrr tot
85 tate brr fork
86 fat brrr toke
87 bark fer trot
88 freak brr tot
89 fart bor trek
90 fake brr tort
91 bark fret tro
92 fart bret kor
93 kraft brr toe
94 raft bor trek
95 tart bork ref
96 tar bork fret
97 kat brr forte
98 frat bor trek
99 raft bret kor
100 fart brr toke
101 teak brr fort
102 bark fer tort
103 barf trek tro
104 frat bret kor
105 teat brr fork
106 raft brr toke
107 frat brr toke
108 aft brrr toke
109 faker brr tot
110 kart reb fort
111 fart berk tro
112 arf berk trot
113 raft berk tro
114 fart kerb tro
115 arf kerb trot
116 kart bro fret
117 raft kerb tro
118 arf berk tort
119 arf kerb tort
120 frat berk tro
121 kraft reb tro
122 frat kerb tro
123 kart bor fret
124 bret for kart
125 tart bork fer
126 tarok brr fet
127 taker brr oft
128 teak brrr oft
129 kart bret fro

### macklemore:people

input: Macklemore
category: people
phrases 1 to 364 of 364

1 meek clamor
2 me lack more
3 me rock elm a
4 me come lark
5 me lock rem a
6 me rock male
7 me ok elm car
8 me ok marcel
9 me arc ok elm
10 me rock meal
11 erm me lock a
12 me mock real
13 me cork elm a
14 me mark cole
15 me ok rem lac
16 me rock lame
17 erm me ok lac
18 me lock mare
19 mel me rock a
20 me cork male
21 mel me ok car
22 me cork meal
23 mer me lock a
24 me mock earl
25 mel me cork a
26 me rack mole
27 mel me ok arc
28 me cork lame
29 cal me ok rem
30 me calm kore
31 cel me ok arm
32 me lock ream
33 rec me ok lam
34 me mock lear
35 cel me ok ram
36 me cloak rem
37 me or elk mac
38 a clerk memo
39 mer me ok lac
40 calm ok mere
41 me or elk cam
42 me clerk moa
43 cel me ok mar
44 me croak elm
45 me or lek mac
46 mom care elk
47 me or lek cam
48 arm come elk
49 ok elm merc a
50 car keel mom
51 me ok cal erm
52 a mock merle
53 a roc elk mem
54 me creak mol
55 me ok mer cal
56 me clam kore
57 a roc lek mem
58 are lock mem
59 a rec elk mom
60 mom care lek
61 a rec lek mom
62 me carom elk
63 a merc mel ok
64 arm come lek
65 mal rec me ok
66 ram come elk
67 a cor elk mem
68 are mock elm
69 a cor lek mem
70 mom race elk
71 a orc elk mem
72 elm ok cream
73 a orc lek mem
74 ark come elm
75 a cel mem kor
76 arm mock lee
77 clam ok mere
78 mac ok merle
79 me carom lek
80 ram come lek
81 mar come elk
82 mom race lek
83 cam ok merle
84 mom rack eel
85 rem make col
86 rem ok camel
87 ram mock lee
88 mar come lek
89 arc keel mom
90 elm make roc
91 more elk mac
92 clear mem ok
93 rom came elk
94 arm coke elm
95 arm mock eel
96 mom arc leek
97 more elk cam
98 mar mock lee
99 ear lock mem
100 lac reek mom
101 more lek mac
102 rom came lek
103 era lock mem
104 ram coke elm
105 ear mock elm
106 kor came elm
107 ale rock mem
108 more lek cam
109 ram mock eel
110 rack lee mom
111 lea rock mem
112 rom cake elm
113 lam coke rem
114 era mock elm
115 mar coke elm
116 mac keel rom
117 ale mock rem
118 mar mock eel
119 lack or meme
120 lea mock rem
121 mol cake rem
122 memo arc elk
123 me cloak erm
124 cam keel rom
125 mem lack ore
126 lee rom mack
127 mem lack roe
128 mac reek mol
129 meek col arm
130 meek mol car
131 ale cork mem
132 memo arc lek
133 cam reek mol
134 lea cork mem
135 mem leak roc
136 mem rake col
137 meek col ram
138 kor lace mem
139 meek or calm
140 meek col mar
141 meek roc lam
142 calmer me ok
143 a locker mem
144 car leek mom
145 meek rom lac
146 carl ok meme
147 meek or clam
148 me lack omer
149 macro elk me
150 me croak mel
151 car elk memo
152 make col erm
153 camel erm ok
154 arc meek mol
155 lam coke erm
156 acre elk mom
157 me cloak mer
158 macro lek me
159 car lek memo
160 ale mock erm
161 are mock mel
162 lea mock erm
163 mor lee mack
164 cream mel ok
165 acre lek mom
166 ark come mel
167 cal reek mom
168 mack role me
169 ark cole mem
170 lake rec mom
171 coma elk rem
172 mae rock elm
173 mack eel rom
174 male merc ok
175 mack elm ore
176 cal meek rom
177 mac leek rom
178 meal merc ok
179 cor meek lam
180 lake roc mem
181 cake erm mol
182 mae lock rem
183 ark col meme
184 arm coke mel
185 mack elm roe
186 leak rec mom
187 cam leek rom
188 maker col me
189 lam creme ok
190 mace elk rom
191 mac kore elm
192 lame merc ok
193 coma lek rem
194 mal meek roc
195 lark cee mom
196 camel mer ok
197 cam kore elm
198 orc meek lam
199 mal coke rem
200 ram coke mel
201 ear mock mel
202 mack lore me
203 kale rec mom
204 mace lek rom
205 lack mom ere
206 mor meek lac
207 acme elk rom
208 cake mel rom
209 mace elm kor
210 mae cork elm
211 era mock mel
212 kale roc mem
213 camo elk rem
214 make roc mel
215 mar coke mel
216 coma elk erm
217 orca elk mem
218 acme lek rom
219 mack mel ore
220 acme elm kor
221 rake cel mom
222 make col mer
223 lac kor meme
224 lar coke mem
225 make cor elm
226 lam mock ere
227 camo lek rem
228 mark cee mol
229 lack mom ree
230 mack mel roe
231 coma lek erm
232 calm eek rom
233 lam coke mer
234 orca lek mem
235 lac kore mem
236 came mel kor
237 calm eke rom
238 calm oke rem
239 mack ole rem
240 lake cor mem
241 mac keel mor
242 make rec mol
243 came elk mor
244 ale mock mer
245 make orc elm
246 lea mock mer
247 cake mer mol
248 calm oke erm
249 mack ole erm
250 cam keel mor
251 ammo rec elk
252 camel me kor
253 rack ole mem
254 lam mock ree
255 make cel rom
256 leak cor mem
257 camo elk erm
258 mace mel kor
259 oak merc elm
260 mel mae rock
261 came lek mor
262 lake orc mem
263 carl eek mom
264 mal creme ok
265 ark cel memo
266 mako rec elm
267 carl eke mom
268 ammo rec lek
269 marc oke elm
270 cake elm mor
271 camo lek erm
272 leak orc mem
273 amok rec elm
274 clam eek rom
275 kale cor mem
276 mack loe rem
277 acme mel kor
278 marc eek mol
279 clam eke rom
280 clam oke rem
281 marc eke mol
282 mack loe erm
283 oka merc elm
284 rack loe mem
285 clam oke erm
286 mer mae lock
287 mako cel rem
288 moa merc elk
289 kale orc mem
290 mel mae cork
291 mae lock erm
292 mako cel erm
293 amok cel rem
294 ere mal mock
295 amok cel erm
296 moa merc lek
297 mer mal coke
298 kea merc mol
299 mac kore mel
300 cal kor meme
301 mal coke erm
302 make cor mel
303 okra cel mem
304 mac elk omer
305 cam kore mel
306 alec mem kor
307 cake mel mor
308 cal kore mem
309 coma elk mer
310 cram oke elm
311 cam elk omer
312 mack eel mor
313 mac leek mor
314 mack mol ere
315 ree mal mock
316 cram eek mol
317 mac lek omer
318 make orc mel
319 cam leek mor
320 cram eke mol
321 mace elk mor
322 coma lek mer
323 cam lek omer
324 carl oke mem
325 oak merc mel
326 calm eek mor
327 calm eke mor
328 mace lek mor
329 mako rec mel
330 calm oke mer
331 mack ole mer
332 mack mol ree
333 marc oke mel
334 acme elk mor
335 amok rec mel
336 camo elk mer
337 meek cor mal
338 make cel mor
339 koa merc elm
340 oka merc mel
341 acme lek mor
342 malm cee kor
343 camo lek mer
344 meek orc mal
345 eek malm roc
346 kae merc mol
347 clam eek mor
348 mack loe mer
349 eke malm roc
350 lam merc oke
351 kora cel mem
352 clam eke mor
353 clam oke mer
354 mako cel mer
355 cram oke mel
356 amok cel mer
357 cal meek mor
358 koa merc mel
359 mal merc oke
360 malm cor eek
361 malm cor eke
362 malm rec oke
363 malm orc eek
364 malm orc eke

### johnharbaugh:people

input: John Harbaugh
category: people
phrases 1 to 500 of 500

1 haha grub john
2 huh john grab a
3 john aah burgh
4 huh john garb a
5 hob hung rajah
6 ahh a grub john
7 brag jonah huh
8 huh on grab haj
9 job hangar huh
10 huh no grab haj
11 grab jonah huh
12 hah a grub john
13 burg john haha
14 haj or hang hub
15 abhor haj hung
16 ahh hag run job
17 garb jonah huh
18 huh haj go barn
19 bong rajah huh
20 hah hag run job
21 grub jonah ahh
22 bar haj hog hun
23 grub jonah hah
24 run haj hob hag
25 hub aargh john
26 huh haj go bran
27 burgh john aha
28 huh on garb haj
29 burg jonah ahh
30 brag a john huh
31 brogan haj huh
32 huh no garb haj
33 hub jargon ahh
34 oh haj hug barn
35 burg jonah hah
36 an haj oh burgh
37 hub hong rajah
38 oh haj hung bra
39 hub jargon hah
40 oh haj burn hag
41 bah jargon huh
42 ban haj hug rho
43 abhor jag hunh
44 ahh on grub haj
45 job aargh hunh
46 ahh run hog jab
47 bog rajah hunh
48 oh hun grab haj
49 gob rajah hunh
50 ahh no grub haj
51 ahh urn job hag
52 hob hag jar hun
53 hub hang raj oh
54 hub hang jar oh
55 nab haj hug rho
56 ahh haj rob gun
57 oh haj hug bran
58 hah on grub haj
59 hah run hog jab
60 hah no grub haj
61 hah urn job hag
62 hub hog haj ran
63 ahh hun job gar
64 huh haj ran gob
65 burn go haj ahh
66 ahh jog ran hub
67 rub hang haj oh
68 hob hug haj ran
69 ahh hun jog bar
70 hah haj rob gun
71 huh haj rob nag
72 nah haj rob hug
73 huh nog bar haj
74 ahh rho gun jab
75 ahh haj run bog
76 ahh haj run gob
77 job hag ran huh
78 hah hun job gar
79 hun haj rob hag
80 jab ran hog huh
81 burn go haj hah
82 hah jog ran hub
83 ahh hun rob jag
84 huh hag jar nob
85 job hug ran ahh
86 hah hun jog bar
87 rho hun bag haj
88 bra haj hog hun
89 hah rho gun jab
90 ahh hun jog bra
91 hah haj run bog
92 hah haj run gob
93 oh hun garb haj
94 hun raj hob hag
95 nah rho hug jab
96 ahh urn hog jab
97 ahh hun bog raj
98 hah hun rob jag
99 rho hun jab hag
100 job hug ran hah
101 ban jar hog huh
102 huh rho nab jag
103 ahh or hung jab
104 ahh nog jar hub
105 bur hang haj oh
106 hun haj orb hag
107 on haj ahh burg
108 hah hun jog bra
109 brag haj on huh
110 no haj ahh burg
111 brag haj no huh
112 ugh haj ran hob
113 bar haj hung oh
114 hah urn hog jab
115 hah hun bog raj
116 hub rang haj oh
117 ahh rho jug ban
118 hob gun raj ahh
119 hah or hung jab
120 hob gun jar ahh
121 hah nog jar hub
122 hub nag haj rho
123 ahh haj rub nog
124 nah rho bug haj
125 on haj hah burg
126 no haj hah burg
127 hob rag haj hun
128 urn haj hob hag
129 ahh rho nab jug
130 bun hog raj ahh
131 ahh urn bog haj
132 bun hog jar ahh
133 hah rho jug ban
134 orb gun haj ahh
135 rho hun gab haj
136 ugh rho ban haj
137 hob gun raj hah
138 hob nag raj huh
139 hub gan haj rho
140 hob gun jar hah
141 hob nag jar huh
142 nob hug raj ahh
143 nob hug jar ahh
144 ban jag rho huh
145 hah haj rub nog
146 nah haj hob rug
147 jab nag rho huh
148 job rag ahh hun
149 hah rho nab jug
150 ahh nor hug jab
151 bun hog raj hah
152 hun haj hob gar
153 hah urn bog haj
154 bun hog jar hah
155 ugh rho nab haj
156 ban raj hog huh
157 hob gan raj huh
158 orb gun haj hah
159 orb nag haj huh
160 bang haj or huh
161 hob gan jar huh
162 rub hog haj nah
163 orb hug haj nah
164 nob hug raj hah
165 jab gan rho huh
166 nob hug jar hah
167 nub hog raj ahh
168 bang jar oh huh
169 jab hang or huh
170 nub hog jar ahh
171 job rag hah hun
172 hah nor hug jab
173 nab raj hog huh
174 nab jar hog huh
175 bog haj ran huh
176 orb gan haj huh
177 hob jag ran huh
178 nob rag haj huh
179 ahh haj bur nog
180 ahh haj or bung
181 haj nor hag hub
182 nub hog raj hah
183 ahh nor jag hub
184 nub hog jar hah
185 ahh haj nor bug
186 brag haj hun oh
187 hob jag ahh run
188 ahh ugh ran job
189 bag haj nor huh
190 burg john ahh a
191 barn jag oh huh
192 jab rang oh huh
193 hah haj bur nog
194 job rag nah huh
195 huh gah ran job
196 gan haj rob huh
197 hub hog nah raj
198 hah haj or bung
199 hub hog nah jar
200 hunh haj go bra
201 jab hag nor huh
202 hob hug nah raj
203 hah nor jag hub
204 hob hug nah jar
205 hob jug ran ahh
206 hah haj nor bug
207 bah haj hog run
208 burn jag ahh oh
209 hob jag hah run
210 hah ugh ran job
211 burg john hah a
212 bur hog haj nah
213 bog jar ahh hun
214 gob jar ahh hun
215 hon haj hug bra
216 hon hag jar hub
217 bah or hung haj
218 bran jag oh huh
219 job gun rah ahh
220 bag jar hon huh
221 bang raj oh huh
222 hob jug ran hah
223 burn jag hah oh
224 orb jag ahh hun
225 bah raj hog hun
226 bah jar hog hun
227 bog jar hah hun
228 gob jar hah hun
229 hunh or bag haj
230 hon haj rub hag
231 bun jag ahh rho
232 bar jag hon huh
233 job gun rah hah
234 job nag rah huh
235 hub jag nah rho
236 bah haj gun rho
237 gab haj nor huh
238 bag jar hunh oh
239 bung jar ahh oh
240 orb jag hah hun
241 hunh or jab hag
242 oh rah hung jab
243 hob jag ahh urn
244 gah haj run hob
245 noh haj hug bra
246 bun jag hah rho
247 gah hun rob haj
248 noh hag jar hub
249 job gan rah huh
250 bog jar nah huh
251 gob jar nah huh
252 bar jag hunh oh
253 jab gran oh huh
254 bag jar noh huh
255 bung jar hah oh
256 bah nor hug haj
257 bah haj hog urn
258 bra jag hon huh
259 oh gah burn haj
260 hob jag hah urn
261 nub jag ahh rho
262 job gah ahh run
263 ahh hon jug bar
264 jab rag hon huh
265 orb jag nah huh
266 gah hun hob raj
267 ahh jun hog bar
268 job gar nah huh
269 noh haj rub hag
270 ahh hon bug raj
271 gab jar hon huh
272 bag raj hon huh
273 bar jag noh huh
274 gah rho jab hun
275 rub jog nah ahh
276 job rug nah ahh
277 bar haj go hunh
278 hon haj bur hag
279 nub jag hah rho
280 job gah hah run
281 gah hun orb haj
282 hah hon jug bar
283 bra jag hunh oh
284 hunh or gab haj
285 ahh jun rob hag
286 hah jun hog bar
287 nah haj rob ugh
288 ugh hon bar haj
289 jab rag hunh oh
290 hah hon bug raj
291 rob jag nah huh
292 huh rah jog ban
293 gab jar hunh oh
294 rub jog nah hah
295 ahh hon jug bra
296 bag raj hunh oh
297 bar haj hug hon
298 job rug nah hah
299 rho bag jun ahh
300 bung raj ahh oh
301 rug jab hon ahh
302 ahh jun hog bra
303 hun jag bro ahh
304 orb jug nah ahh
305 oh jun ahh grab
306 bra jag noh huh
307 job hag rah hun
308 hah jun rob hag
309 hub rag haj hon
310 jab rah hog hun
311 ahh noh jug bar
312 gah urn hob haj
313 jab rag noh huh
314 huh rah nab jog
315 bog raj nah huh
316 ahh noh bug raj
317 gab jar noh huh
318 ugh ahh nor jab
319 huh gah jar nob
320 hob gun haj rah
321 bag raj noh huh
322 hah hon jug bra
323 rho bag jun hah
324 bung raj hah oh
325 rug jab hon hah
326 hah jun hog bra
327 huh rah jab nog
328 hun jag bro hah
329 orb jug nah hah
330 ahh jun orb hag
331 noh haj bur hag
332 bah ahh jog run
333 oh jun hah grab
334 gob raj ahh hun
335 rob jug nah ahh
336 bun hog haj rah
337 grub haj nah oh
338 bur jog nah ahh
339 hah noh jug bar
340 job gah ahh urn
341 hob gah jar hun
342 bun jog rah ahh
343 ugh noh bar haj
344 gab raj hon huh
345 hah noh bug raj
346 nob jag rah huh
347 ugh hah nor jab
348 bar nah jog huh
349 nob hug haj rah
350 barn ahh jug oh
351 ahh noh jug bra
352 hunh bah go raj
353 bar haj hug noh
354 rug jab noh ahh
355 hunh bah go jar
356 bah raj hung oh
357 bah jar hung oh
358 hah jun orb hag
359 bah hah jog run
360 oh jun ahh brag
361 gob raj hah hun
362 rob jug nah hah
363 bur jog nah hah
364 huh bro nah jag
365 bun hag haj rho
366 hub rag haj noh
367 hob jag rah hun
368 job gah hah urn
369 bun jog rah hah
370 jab gar hon huh
371 jug nor bah ahh
372 nah rah ugh job
373 gab raj hunh oh
374 rho gab jun ahh
375 hon bah hug raj
376 nog bah huh raj
377 hub gran haj oh
378 hon bah hug jar
379 rung bah oh haj
380 barn hah jug oh
381 hah noh jug bra
382 jab ahh rung oh
383 rug jab noh hah
384 job hug nah rah
385 nub hog haj rah
386 barn haj ugh oh
387 haj nor gah hub
388 oh jun hah brag
389 hunh rah go jab
390 gob haj ahh urn
391 nub jog rah ahh
392 oh jun ahh garb
393 nob jug rah ahh
394 bah ran jog huh
395 bra nah jog huh
396 nob hag raj huh
397 ahh jun hob gar
398 hob ugh nah raj
399 bran ahh jug oh
400 hob ugh nah jar
401 jug nor bah hah
402 gob raj nah huh
403 hun jag bor ahh
404 gab raj noh huh
405 jab gar hunh oh
406 ugh bah nor haj
407 rho gab jun hah
408 jab nah ugh rho
409 jab hah rung oh
410 hon rah hug jab
411 haj hon ugh bra
412 ahh bro nah jug
413 bung haj rah oh
414 nub hag haj rho
415 gob haj hah urn
416 nub jog rah hah
417 oh jun hah garb
418 nob jug rah hah
419 hah jun hob gar
420 bah ahh jog urn
421 bra haj nog huh
422 bran hah jug oh
423 bro gun haj ahh
424 bah jag hun rho
425 hun jag bor hah
426 bran haj ugh oh
427 jab gar noh huh
428 bug jar ahh hon
429 hub nog raj ahh
430 noh bah hug raj
431 hon gah jar hub
432 noh bah hug jar
433 bru hang haj oh
434 hah bro nah jug
435 burg haj nah oh
436 bah hah jog urn
437 bog haj rah hun
438 bro gun haj hah
439 bro nag haj huh
440 ban haj gor huh
441 bah nah jug rho
442 bro hug haj nah
443 bug jar hah hon
444 rub jag ahh hon
445 hub nog raj hah
446 bah jar nog huh
447 hon gah rub haj
448 huh bor nah jag
449 noh rah hug jab
450 haj noh ugh bra
451 nab haj gor huh
452 bro gan haj huh
453 nob ugh raj ahh
454 hunh bah or jag
455 nob ugh jar ahh
456 nob gar haj huh
457 bah rah jog hun
458 hunh gah or jab
459 job gah rah hun
460 rub jag hah hon
461 bug jar ahh noh
462 nob rug haj ahh
463 bah jag nor huh
464 noh gah jar hub
465 jab gah nor huh
466 orb ugh haj nah
467 nob ugh raj hah
468 nob ugh jar hah
469 ahh bru nah jog
470 haj rah ugh nob
471 ahh bor nah jug
472 bug jar hah noh
473 rub jag ahh noh
474 raj hon gah hub
475 nob rug haj hah
476 hub jog nah rah
477 noh gah rub haj
478 bor gun haj ahh
479 ahh jun bro hag
480 bur jag ahh hon
481 hob rag ahh jun
482 hah bru nah jog
483 ugh hon bah raj
484 gob haj rah hun
485 haj bru ahh nog
486 ugh hon bah jar
487 hon gah bur haj
488 hah bor nah jug
489 jab nah gor huh
490 burgh haj a hon
491 rub jag hah noh
492 hub jag rah hon
493 bun gah haj rho
494 rug hon bah haj
495 bro hag haj hun
496 bor gun haj hah
497 bor nag haj huh
498 hah jun bro hag
499 bor hug haj nah
500 bur jag hah hon

### rayaghayan:people

input: Ray Aghayan
category: people
phrases 1 to 141 of 141

1 an gray ayah
2 gray hay an a
3 any aah gray
4 gay hay ran a
5 any ray agha
6 an gray a yah
7 yang aah ray
8 hag any ray a
9 angry ayah a
10 rag hay any a
11 gay aah yarn
12 gar hay any a
13 gray aah nay
14 nag hay ray a
15 any rag ayah
16 hag nay ray a
17 any hay agar
18 gan hay ray a
19 gray hay ana
20 nah a ray gay
21 nay ray agha
22 yah a ran gay
23 yang aah rya
24 rag hay nay a
25 nary gay aah
26 hay a gan rya
27 yana ray hag
28 gar hay nay a
29 gay ayah ran
30 yah a ray nag
31 yang hay ara
32 gah any ray a
33 ayah ray nag
34 any a rya hag
35 ray gan ayah
36 yah a gan ray
37 rag hay yana
38 nag hay rya a
39 aga hay yarn
40 yah a rag nay
41 aha any gray
42 gay rah any a
43 any ayah gar
44 gah nay ray a
45 any rya agha
46 gay a nah rya
47 nay rag ayah
48 rah nay gay a
49 agar hay nay
50 rag yah any a
51 gar hay yana
52 yah a nag rya
53 hara any gay
54 yah a gan rya
55 rya nag ayah
56 gar yah any a
57 nary hay aga
58 hag ran yay a
59 yah any agar
60 a yar any hag
61 rya gan ayah
62 gay a yar nah
63 hangar yay a
64 gah any rya a
65 aha nary gay
66 a ran gah yay
67 gran aah yay
68 gyn aah ray a
69 raga any hay
70 yar gah any a
71 agha ran yay
72 nag hay yar a
73 raya any hag
74 hag nay rya a
75 yar any agha
76 rag nah yay a
77 yang aha ray
78 gar yah nay a
79 an aargh yay
80 gar nah yay a
81 yah nary aga
82 gyn aah rya a
83 hang ara yay
84 a gan yar yah
85 gay aha yarn
86 gan hay yar a
87 gray yah ana
88 gyn aha ray a
89 gray aha nay
90 nag rah yay a
91 yang yah ara
92 gyn hay ara a
93 gay hara nay
94 yar gyn aah a
95 gar ayah nay
96 hag nay yar a
97 agha nay rya
98 gan rah yay a
99 yang aha rya
100 nag yah yar a
101 yang aah yar
102 gah nay rya a
103 rag yah yana
104 gyn yah ara a
105 aga yah yarn
106 gyn aha rya a
107 raga hay nay
108 gah nay yar a
109 agar yah nay
110 gyn aha yar a
111 hag yana rya
112 any raga yah
113 gar yah yana
114 gran aha yay
115 gay rah yana
116 nag hay raya
117 nag hara yay
118 agar nah yay
119 rang aha yay
120 gah yana ray
121 raga yah nay
122 gan hay raya
123 gan hara yay
124 gay nah raya
125 rang aah yay
126 nag ayah yar
127 raga nah yay
128 hag nay raya
129 raya gah nay
130 gan ayah yar
131 gah yana rya
132 agha nay yar
133 yang aha yar
134 gyn ayah ara
135 hag yana yar
136 nag yah raya
137 yar gah yana
138 gah any raya
139 gan yah raya
140 gyn aah raya
141 gyn aha raya

### cindystarfall:people

input: Cindy Starfall
category: people
phrases 1 to 500 of 500

1 scandal flirty
2 falls dirty can
3 its dry fall can
4 stray find call
5 its fly land car
6 can draft silly
7 an list fly card
8 clay land first
9 all at finds cry
10 it dally francs
11 its dry fan call
12 day till francs
13 an still cry fad
14 can dally first
15 its fly lard can
16 fans dirty call
17 all sat find cry
18 last find clary
19 an lads lift cry
20 trays find call
21 its dna fall cry
22 sally drift can
23 dry fall sit can
24 lady flirts can
25 sad try fill can
26 lastly find car
27 all a sync drift
28 tray find calls
29 an lit fly cards
30 any drill facts
31 its dna fry call
32 tidy all francs
33 an ill dry facts
34 any drills fact
35 an fill dry acts
36 firstly can lad
37 an slit fly card
38 flat cry island
39 fly til an cards
40 satyr find call
41 tall as find cry
42 fan dirty calls
43 an dry sift call
44 sadly flirt can
45 flat land is cry
46 sally find cart
47 an list dry calf
48 nifty all cards
49 an dill fast cry
50 flatly in cards
51 an still fry cad
52 tray finds call
53 an fall rid cyst
54 rally find cast
55 it can dry falls
56 island try calf
57 call an dry fits
58 candy all first
59 an sill dry fact
60 car stand filly
61 an flat slid cry
62 rally find cats
63 an ills dry fact
64 fact darn silly
65 an lad lifts cry
66 can drafts lily
67 its fly land arc
68 candy star fill
69 call an dry fist
70 rally find acts
71 all dry sift can
72 callas find try
73 in fad try calls
74 tally find cars
75 an try slid calf
76 fall dirty scan
77 in fads try call
78 first lady clan
79 sad till fry can
80 cally find star
81 an silt fly card
82 racist land fly
83 disc fall an try
84 island fly cart
85 calls an dry fit
86 fall dirty cans
87 dry fall is cant
88 city darn falls
89 in flat cry lads
90 lyrics land fat
91 an flat cry lids
92 rancid last fly
93 its fall and cry
94 days till franc
95 dry fan sit call
96 frills candy at
97 an try fills cad
98 calls faint dry
99 an sty fill card
100 tally finds car
101 an fads till cry
102 can ally drifts
103 its fry and call
104 cally first dna
105 an flats cry lid
106 rally finds act
107 an falls dry tic
108 salt find clary
109 in lads try calf
110 scary tall find
111 an lids try calf
112 candy fall stir
113 an fall dry tics
114 days flirt clan
115 an fly slid cart
116 still day franc
117 last lid fry can
118 firstly can dal
119 an tad fills cry
120 lyric land fast
121 dry flat is clan
122 tally find scar
123 i sync all draft
124 candy rats fill
125 star lid fly can
126 arts fill candy
127 all dna fits cry
128 rally finds cat
129 an slit dry calf
130 lady til francs
131 an falls cry dit
132 ally find carts
133 an lid fly carts
134 filly can darts
135 all fist cry dna
136 silly craft dna
137 sly in card flat
138 lady list franc
139 in falls try cad
140 sadly flint car
141 sad try fin call
142 ill randy facts
143 an lids fly cart
144 call faints dry
145 it fans dry call
146 cally find rats
147 all tas find cry
148 cally find arts
149 cast an dry fill
150 lady flirt scan
151 an lift dry lacs
152 dilly farts can
153 all fast din cry
154 flat lyrics dna
155 an dirt fly lacs
156 art fills candy
157 flint a cry lads
158 cards lay flint
159 ill a sync draft
160 cally drafts in
161 an sly dirt calf
162 land if crystal
163 an lads fly crit
164 flint scar lady
165 an lads flit cry
166 lady flirt cans
167 call as find try
168 tiny fall cards
169 dirt las fly can
170 yards lift clan
171 in falls cry tad
172 rally find scat
173 an dit fry calls
174 craft and silly
175 cats an dry fill
176 candy far still
177 calls a find try
178 day flirt clans
179 clad last fry in
180 antics fall dry
181 its lad fry clan
182 fancy at drills
183 dry a lift clans
184 cry stand flail
185 sly flat rid can
186 facts darn lily
187 an dill fry cast
188 day flirts clan
189 an dal lifts cry
190 flint cry salad
191 clad star fly in
192 scary land lift
193 dirt a fly clans
194 calla finds try
195 its rad fly clan
196 yards fill cant
197 in flats cry lad
198 crystal fan lid
199 act an dry fills
200 ally finds cart
201 its lad fly narc
202 lyrics and flat
203 an dill fry cats
204 craft sand lily
205 sad till fan cry
206 fall sync triad
207 dry a lifts clan
208 fancy lard list
209 an dill fry acts
210 lacy land first
211 stand if all cry
212 lastly find arc
213 an sly lift card
214 candy farts ill
215 call a finds try
216 candy rat fills
217 sly flint card a
218 can farts idyll
219 cat an dry fills
220 tsar fill candy
221 it fan dry calls
222 fancy star dill
223 its fry land lac
224 frills cant day
225 its flan cry lad
226 tiny falls card
227 an dill fats cry
228 crafts dally in
229 an lifts dry lac
230 cally finds art
231 in lat fly cards
232 tilly fan cards
233 in alt fly cards
234 sandal lift cry
235 its fly darn lac
236 lady lift narcs
237 in fly lard acts
238 canals dry lift
239 an silt dry calf
240 clary land fits
241 sly fit land car
242 scan draft lily
243 ill fads try can
244 call drafts yin
245 i lands flat cry
246 calls draft yin
247 flint as cry lad
248 cally find tsar
249 an rad fill cyst
250 tilly fans card
251 it fall dry scan
252 lin crafts lady
253 scant a dry fill
254 fancy rad still
255 far at sync dill
256 lilac stand fry
257 sly in lard fact
258 nay drifts call
259 lit fly sand car
260 nay drift calls
261 clad rats fly in
262 clay sand flirt
263 all fan rid cyst
264 dna fly cristal
265 clad arts fly in
266 fiscal land try
267 i fall stand cry
268 yard lift clans
269 aft a sync drill
270 clary land fist
271 cry and all fits
272 scald train fly
273 all dna sift cry
274 arty calls find
275 all fit sync rad
276 nils craft lady
277 dirt als fly can
278 lad fin crystal
279 sad tin fall cry
280 aft land lyrics
281 all far sync dit
282 dilly can rafts
283 i fry stand call
284 cans draft lily
285 salt lid fry can
286 tansy fill card
287 it fall dry cans
288 clary sand lift
289 sly a drift clan
290 nay drill facts
291 sad tin fry call
292 rancid salt fly
293 cry and all fist
294 scandal fry lit
295 sly in craft lad
296 las flirt candy
297 fit las land cry
298 flint lady cars
299 facts all dry in
300 dilly ran facts
301 all fans dry tic
302 nay drills fact
303 an lit fry scald
304 lyric sand flat
305 call fast dry in
306 lint scarf lady
307 card last fly in
308 clary lands fit
309 scat an dry fill
310 lily crafts dna
311 tall ids fry can
312 cally finds rat
313 its dal fry clan
314 silly rand fact
315 its rand fly lac
316 fancy sad trill
317 an fad tills cry
318 lyric lands fat
319 i cant dry falls
320 fry til scandal
321 in tall cry fads
322 call snarf tidy
323 fry til an scald
324 canal dry lifts
325 sly dna lift car
326 card lays flint
327 in flats cry dal
328 yard lifts clan
329 all dit fans cry
330 cyst drain fall
331 its dal fly narc
332 lady slit franc
333 disc fry an tall
334 falls dry actin
335 land if last cry
336 fact ally rinds
337 an dill fry scat
338 cristal and fly
339 sad lint fly car
340 arc stand filly
341 sad fill tan cry
342 yard fills cant
343 all fan dry tics
344 flatly sin card
345 can last rid fly
346 card slay flint
347 clad flan is try
348 triads fly clan
349 sad lin cry flat
350 lit lady francs
351 sly fit lard can
352 scan ally drift
353 sly rad lift can
354 flat sync laird
355 clad salt fry in
356 fill canst yard
357 all tad fins cry
358 arty call finds
359 all tan fry disc
360 fancy stall rid
361 in rad fall cyst
362 idly last franc
363 in darts fly lac
364 lady lifts narc
365 can all dry fits
366 filly card ants
367 an sly clad rift
368 fancy rats dill
369 lit dna fly cars
370 fancy sat drill
371 clad tsar fly in
372 call any drifts
373 its clad fly ran
374 calls any drift
375 all far din cyst
376 ill candy rafts
377 list an clad fry
378 clans lay drift
379 sad ant fill cry
380 clay darn lifts
381 sad lin try calf
382 sadly craft lin
383 salt fly din car
384 cyan all drifts
385 i land sly craft
386 cans ally drift
387 its flan cry dal
388 crafts and lily
389 flat lad sin cry
390 tally find arcs
391 i canst dry fall
392 idyll can rafts
393 can all dry fist
394 cards tally fin
395 in flats dry lac
396 clay lands rift
397 all ant fry disc
398 fad install cry
399 all ids fry cant
400 franc stay dill
401 sly lid fart can
402 crafts an idyll
403 i dry flat clans
404 clad any flirts
405 sly rift can lad
406 lastly fin card
407 sly lat find car
408 cards tan filly
409 flint a dry lacs
410 clan lay drifts
411 sly alt find car
412 flint sad clary
413 an flit dry lacs
414 randy fill acts
415 flint as cry dal
416 calf star lindy
417 all fats din cry
418 calls drafty in
419 stir an clad fly
420 cally fans dirt
421 in fry stall cad
422 clay land rifts
423 it fly lands car
424 tilly scarf dna
425 it fly land cars
426 facts ran idyll
427 cis dna fall try
428 till sync farad
429 sad tall fin cry
430 sadly lift narc
431 lit far sync lad
432 cally stand fir
433 far sty can dill
434 candy tar fills
435 stall if dry can
436 candy stall fir
437 in fly dart lacs
438 cyan fast drill
439 all fad tins cry
440 cast darn filly
441 all fads tin cry
442 dna flirts clay
443 cry and fast ill
444 nil crafts lady
445 sly in dart calf
446 flatly rid scan
447 sad lin fly cart
448 cart sand filly
449 clad fly is rant
450 triad fly clans
451 fit als land cry
452 lats find clary
453 an fry slid talc
454 facts rally din
455 sly lid raft can
456 tally finds arc
457 dry a flit clans
458 randy call sift
459 its flan dry lac
460 sally din craft
461 all dna fry tics
462 can dally rifts
463 in lats dry calf
464 card tally fins
465 tan fly slid car
466 clan lays drift
467 clad tan fly sir
468 fancy lard slit
469 sly lid ran fact
470 randy list calf
471 ill far sync tad
472 frilly sad cant
473 sly in craft dal
474 cats darn filly
475 it fall sand cry
476 clan slay drift
477 all fir sync tad
478 silly daft narc
479 an sly lid craft
480 narcs fall tidy
481 sly lid can frat
482 call randy fits
483 an far dill cyst
484 cally draft sin
485 it fry sand call
486 flatly rid cans
487 fit las dry clan
488 dint fly rascal
489 sad nit fall cry
490 lyric land fats
491 ill fad try scan
492 acts darn filly
493 an tills fry cad
494 flint arcs lady
495 an daft sill cry
496 falls tidy narc
497 can at dry fills
498 cyst land flair
499 sad nil cry flat
500 cyst land frail
