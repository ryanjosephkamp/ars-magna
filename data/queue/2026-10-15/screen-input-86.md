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

## File 86 of 86: 1000 phrases

### jamesspader:people

input: James Spader
category: people
phrases 1 to 500 of 500

1 pressed maja
2 me passed raj
3 sped me jars a
4 dames jasper
5 me passed jar
6 me as sped raj
7 depress maja
8 me spades raj
9 sped me jar as
10 dramas jeeps
11 me jar spades
12 me pad ess raj
13 madras jeeps
14 me jars spade
15 sped res jam a
16 a depress jam
17 me jar ess pad
18 pressed jam a
19 sped ems jar a
20 deep jar mass
21 sped ers jam a
22 jam pass deer
23 a raj sped ems
24 jam pass reed
25 peds me jars a
26 raj seems pad
27 peds me jar as
28 jar seems pad
29 jess per mad a
30 jams sped are
31 ped me jars as
32 dress ape jam
33 jade a ess rpm
34 mass per jade
35 ped me jar ass
36 jade rap mess
37 mad a jess rep
38 jade as sperm
39 a jess red amp
40 pea jam dress
41 jess a per dam
42 raj seem pads
43 red jess map a
44 jar seem pads
45 ped mess jar a
46 raj map seeds
47 dap me jar ess
48 seeds jar map
49 med jess rap a
50 jars seem pad
51 peds res jam a
52 jade par mess
53 peds ems jar a
54 red passe jam
55 peds ers jam a
56 sad arms jeep
57 med jess par a
58 seeds jam rap
59 sad as jee rpm
60 jade a sperms
61 ped ems jars a
62 jade pass rem
63 ped res jam as
64 mas speed raj
65 ped ems jar as
66 jade mass rep
67 ped res jams a
68 speed jar mas
69 ped ers jam as
70 red apes jams
71 ped ers jams a
72 mass peed raj
73 dam a jess rep
74 deep raj mass
75 ped mess raj a
76 mass peed jar
77 pad a jess rem
78 damp jars see
79 me as peds raj
80 seed jars map
81 pad a jess erm
82 jam sped ears
83 der jess map a
84 raj maps seed
85 sped ser jam a
86 seed jar maps
87 me jess pard a
88 rad mass jeep
89 ped jess arm a
90 deep jars mas
91 red jess pam a
92 seeds jam par
93 me ped ass raj
94 speed jam ras
95 ped jess ram a
96 sad mars jeep
97 ped jess mar a
98 peas jar meds
99 peds ser jam a
100 meds apes raj
101 ped ser jam as
102 ads jam peers
103 ped ser jams a
104 ads jam spree
105 me dap ess raj
106 meds apes jar
107 ads as jee rpm
108 speed jam ars
109 peds ems raj a
110 peas jam reds
111 pad a jess mer
112 ads arm jeeps
113 der jess amp a
114 jam sped arse
115 ped ems raj as
116 seed jams rap
117 der jess pam a
118 raj spam seed
119 dap a jess rem
120 amp seeds raj
121 mer jess dap a
122 dam pass jeer
123 dap a jess erm
124 seed jar spam
125 seeds jar amp
126 reds apes jam
127 seed jam spar
128 sad jam peers
129 sad jam spree
130 deer jams spa
131 seed jam raps
132 reed jams spa
133 sad arm jeeps
134 meds ape jars
135 mad jeer pass
136 reeds jam spa
137 damp as jeers
138 deep jams ras
139 deer jam saps
140 reed jam saps
141 peas jars med
142 deer jams pas
143 reed jams pas
144 amps seed raj
145 deer jam spas
146 reed jam spas
147 pea jars meds
148 seed jar amps
149 jade ass perm
150 damp raj sees
151 deer jams sap
152 reed jams sap
153 med apes jars
154 damp jar sees
155 jams sped ear
156 pads jam seer
157 reeds jam pas
158 seed jams par
159 seed jam rasp
160 seder jam spa
161 red peas jams
162 jams per sade
163 ads map jeers
164 seed jars amp
165 deep jams ars
166 dams jars pee
167 ems spade raj
168 jade maps res
169 reeds jam sap
170 spade jam res
171 pad mass jeer
172 ads jam speer
173 ads ram jeeps
174 jam sped ares
175 spade jar ems
176 ads rams jeep
177 jade maps ers
178 spade jam ers
179 reds ape jams
180 jam sped sera
181 raj seeps dam
182 spa deems raj
183 padre jam ess
184 seed jam pars
185 seder jam pas
186 jar seeps dam
187 spa deems jar
188 pad jam seers
189 sad map jeers
190 ads jams peer
191 sad jam speer
192 seder jam sap
193 sad ram jeeps
194 jams sped era
195 sad rams jeep
196 spa deem jars
197 pea jams reds
198 mas peed jars
199 pas deems raj
200 jade spam res
201 mad raj seeps
202 pas deems jar
203 jade ramp ess
204 pad jams seer
205 mad jar seeps
206 raj sped mesa
207 dam jars pees
208 spa jeers dam
209 sap deems raj
210 jade spam ers
211 sade jam reps
212 sad jams peer
213 jar sped mesa
214 sap deems jar
215 jade spar ems
216 jam seeps rad
217 pas deem jars
218 raj sped seam
219 jars seep dam
220 jade raps ems
221 jar sped seam
222 sap deem jars
223 raja sped ems
224 ads mar jeeps
225 pas jeers dam
226 mad jars pees
227 mad spa jeers
228 raj pees dams
229 jam sped eras
230 rads jams pee
231 pedes jar mas
232 dam sap jeers
233 dams jar pees
234 drape jam ess
235 sade jams rep
236 sad jasper me
237 sped same raj
238 ads maps jeer
239 deer jams asp
240 reed jams asp
241 saps deem raj
242 jade saps rem
243 sped same jar
244 mad jars seep
245 raj seep dams
246 saps deem jar
247 damp ass jeer
248 jar seep dams
249 spas deem raj
250 raped jam ess
251 sad mar jeeps
252 reeds jam asp
253 jeep dams ras
254 spas deem jar
255 mad pas jeers
256 mas jeers pad
257 jade rasp ems
258 mad sap jeers
259 ras peed jams
260 sad maps jeer
261 pedes jam ras
262 jeeps dam ras
263 rad jams pees
264 amp jeers ads
265 jeep dams ars
266 seder jam asp
267 jade pars ems
268 rads jam pees
269 ads spam jeer
270 jams seep rad
271 ars peed jams
272 jade seas rpm
273 jam seep rads
274 passe raj med
275 pedes jam ars
276 passe jar med
277 mad ras jeeps
278 sad amp jeers
279 jeeps dam ars
280 mas jeer pads
281 asp deems raj
282 spa jeer dams
283 maja sped res
284 meds jasper a
285 asp deems jar
286 sad spam jeer
287 maja sped ers
288 asp deem jars
289 mad ars jeeps
290 dam saps jeer
291 pas jeer dams
292 amps jeer ads
293 jade mas reps
294 asp jeers dam
295 spas jeer dam
296 dams sap jeer
297 mad saps jeer
298 sad amps jeer
299 mad asp jeers
300 sere jam pads
301 mad spas jeer
302 jade amps res
303 jade spas rem
304 jade amps ers
305 med jasper as
306 jade pram ess
307 sere jams pad
308 amped raj ess
309 amped jar ess
310 asp jeer dams
311 deem raj pass
312 deem jar pass
313 ajar ems sped
314 jade pass erm
315 damp are jess
316 sped sear jam
317 dear map jess
318 made rap jess
319 ads arms jeep
320 jade saps erm
321 peds same raj
322 peds same jar
323 mad rape jess
324 jade spas erm
325 made par jess
326 mad rap jesse
327 ads mars jeep
328 dram as jeeps
329 dram ass jeep
330 ped same jars
331 mad par jesse
332 meds peas raj
333 dear amp jess
334 mad pear jess
335 damp ear jess
336 dare map jess
337 der passe jam
338 damp era jess
339 ped ajar mess
340 pad arm jesse
341 ads jasper me
342 sad jam peres
343 pedes raj mas
344 read map jess
345 jess per dama
346 peds sear jam
347 ped mess raja
348 dam rape jess
349 dee jars maps
350 rads mas jeep
351 mads jars pee
352 pad ram jesse
353 dam rap jesse
354 dee jar spasm
355 rad mas jeeps
356 sad jams pere
357 rad map jesse
358 dame rap jess
359 jade maps ser
360 dee jars spam
361 jade pass mer
362 seeds jar pam
363 sad jams pree
364 der apes jams
365 dam par jesse
366 sad ramps jee
367 jade spam ser
368 pad mar jesse
369 dame par jess
370 dee jams spar
371 peds ajar ems
372 dee jars amps
373 dees jars map
374 dam reap jess
375 dee jams raps
376 jade mas pres
377 mads jar pees
378 mead rap jess
379 ped sear jams
380 med jess para
381 read amp jess
382 damper a jess
383 dees jar maps
384 seed jars pam
385 ped sears jam
386 sad pam jeers
387 jade amps ser
388 peds are jams
389 dee jams rasp
390 dere jams spa
391 ped seams raj
392 peds seam raj
393 ped seams jar
394 peds seam jar
395 jade saps mer
396 dare amp jess
397 dees jams rap
398 jade spas mer
399 mead par jess
400 dees jar spam
401 dere jam saps
402 dee jams pars
403 dere jams pas
404 dees jam spar
405 dere jam spas
406 dap sere jams
407 dere jams sap
408 dees jam raps
409 spade jam ser
410 pad ream jess
411 dram ape jess
412 dam pare jess
413 dap mass jeer
414 pard jams see
415 mads sap jeer
416 seeds raj pam
417 dees jar amps
418 dees jams par
419 dere jam pass
420 dees jam rasp
421 pads jams ere
422 dees jars amp
423 dap jam seers
424 dram pass jee
425 ped seam jars
426 dama jess rep
427 pads jam rees
428 pad mare jess
429 ads jam peres
430 dap raj seems
431 dap jar seems
432 ads pam jeers
433 dam pear jess
434 dees jam pars
435 dap jams seer
436 peds ears jam
437 sade jam pres
438 mad jess reap
439 dere jams asp
440 pard jam sees
441 pad jams rees
442 ads jams pere
443 pads arms jee
444 peds arse jam
445 dee raj spasm
446 dap jars seem
447 dear pam jess
448 pads jams ree
449 ads jams pree
450 ads ramps jee
451 pads rams jee
452 der peas jams
453 pads mars jee
454 mad jess pare
455 peds ear jams
456 dare pam jess
457 ped ears jams
458 peds ares jam
459 rads maps jee
460 jesse dap arm
461 peds sera jam
462 sped mae jars
463 mads raj pees
464 dams spar jee
465 dams raps jee
466 mads raj seep
467 dees raj maps
468 peds era jams
469 mads jar seep
470 mads ras jeep
471 ped arse jams
472 peds mesa raj
473 peds mesa jar
474 rads spam jee
475 ped arses jam
476 mads ars jeep
477 dams rasp jee
478 peds ems raja
479 rad amp jesse
480 dees raj spam
481 peds eras jam
482 jesse dap ram
483 dram saps jee
484 mads spa jeer
485 dams pars jee
486 read pam jess
487 sped maes raj
488 sped maes jar
489 sped ser maja
490 mads pas jeer
491 ped masse raj
492 ped ares jams
493 ped masse jar
494 dees raj amps
495 dram pea jess
496 ped sera jams
497 ped mesa jars
498 ped jess mara
499 rad pam jesse
500 jess dap mare

### toddstashwick:people

input: Todd Stashwick
category: people
phrases 1 to 500 of 500

1 haddock twists
2 stocks with dad
3 this cow tsk dad
4 stocks with add
5 this cow tsk add
6 who tsk addicts
7 its chow tsk dad
8 stock with dads
9 this doc tsk wad
10 stack with odds
11 odd switch tsk a
12 stock with adds
13 its chow tsk add
14 watch kids dots
15 this cod tsk wad
16 dad shock twist
17 odd witch tsk as
18 shock did watts
19 cos tsk with dad
20 kids dost watch
21 odd wish tsk act
22 twist had docks
23 odd wish tsk cat
24 that wicks odds
25 tsk so did watch
26 tacks with odds
27 tsk this odd caw
28 shock did twats
29 two chis tsk dad
30 twists had dock
31 cos tsk with add
32 add shock twist
33 odd itch tsk saw
34 shocks did twat
35 two chi tsk dads
36 stocks did thaw
37 two ids tsk chad
38 show tsk addict
39 two dish tsk cad
40 width do stacks
41 tsk two did cash
42 odds ask twitch
43 watch i tsk odds
44 stock did swath
45 tsk who did cast
46 stock did thaws
47 tsk show did act
48 task witch odds
49 odd chit tsk saw
50 thwack did toss
51 cod width tsk as
52 shocks did watt
53 odd wit tsk cash
54 watch kits odds
55 tsk who did cats
56 watch disk dots
57 odd shit tsk caw
58 dad stock whist
59 doc tsk with ads
60 dad shock twits
61 tsk who did acts
62 kat switch odds
63 tsk show did cat
64 watch disks dot
65 tsk so witch dad
66 odds watch skit
67 odd hit tsk caws
68 sad stock width
69 two disc tsk dah
70 disk dost watch
71 sad whit tsk doc
72 watch skid dots
73 cod wish tsk tad
74 thaw stick odds
75 i tsk odd swatch
76 two adds shtick
77 cod shit tsk wad
78 hack twist odds
79 tsk ditch do saw
80 two adds kitsch
81 tsk with sad doc
82 dad hocks twist
83 odd tic tsk wash
84 twits had docks
85 odd chi tsk swat
86 odds whack tits
87 hot disc tsk wad
88 dad shocks twit
89 cod tsk with ads
90 hocks did watts
91 had disc tsk two
92 watch skids dot
93 tsk who did scat
94 thwack sit odds
95 odd hits tsk caw
96 thwack its odds
97 sad whit tsk cod
98 dad hock twists
99 tsk so witch add
100 dash dock twist
101 tsk ids do watch
102 skid dost watch
103 tod wish tsk cad
104 odd switch task
105 odd tic tsk shaw
106 whacks did tots
107 cod hit tsk wads
108 watch disks tod
109 sad dit tsk chow
110 watts dock dish
111 sod tsk with cad
112 swatch kids dot
113 tsk with sad cod
114 shad dock twist
115 cod wit tsk dash
116 whit add stocks
117 tsk cows hit dad
118 add stock whist
119 tsk cows did hat
120 watch skids tod
121 cod hits tsk wad
122 twat docks dish
123 dos tsk with cad
124 shtick stow dad
125 tsk chow sit dad
126 odds thats wick
127 tsk tow did cash
128 add shock twits
129 tsk witch do ads
130 swatch kid dots
131 cod dit tsk wash
132 kitsch stow dad
133 odd whit tsk sac
134 dads stock whit
135 cod wit tsk shad
136 odds stack whit
137 tsk cow did hats
138 adds stock whit
139 it tsk chow dads
140 width tasks doc
141 it tsk chow adds
142 dads shock twit
143 tsk shot did caw
144 hocks did twats
145 tsk chow did sat
146 docks hid watts
147 cod whit tsk ads
148 sat docks width
149 tod dish tsk caw
150 adds shock twit
151 tsk tic show dad
152 ads stock width
153 who tsk tics dad
154 swatch kids tod
155 tsk wits had doc
156 add hocks twist
157 tsk cot wish dad
158 watt docks dish
159 tsk whos did act
160 shack twit odds
161 tsk cot did wash
162 add shocks twit
163 cod wits tsk dah
164 kid dost swatch
165 tsk with odd sac
166 odd witch tasks
167 tsk sow did chat
168 thick stow dads
169 cod ids tsk thaw
170 dah docks twist
171 width as tsk doc
172 thick stow adds
173 ods tsk with cad
174 kats witch odds
175 tsk whos did cat
176 odd twist shack
177 cod dit tsk shaw
178 add hock twists
179 tsk cos did thaw
180 dads hock twist
181 tsk cost did haw
182 stick doth wads
183 tsk cows hit add
184 tad socks width
185 a witch tsk odds
186 adds hock twist
187 tsk chow sit add
188 two shtick dads
189 tsk so ditch wad
190 twats dock dish
191 odd tics tsk haw
192 sticks doth wad
193 dad cow shit tsk
194 width dots sack
195 tod disc tsk haw
196 two kitsch dads
197 tod chi tsk wads
198 dicks doth swat
199 adds chi tsk two
200 swatch kit odds
201 tsk cot did shaw
202 odd skits watch
203 tsk disc do thaw
204 thaw ticks odds
205 had disc tsk tow
206 odd twitch asks
207 who tsk disc tad
208 switch tsk dado
209 tsk doc wish tad
210 dash docks twit
211 tsk host did caw
212 dick dots swath
213 tsk doc shit wad
214 dick dots thaws
215 tsk tic show add
216 odds thwack tis
217 who tsk tics add
218 shtick swot dad
219 tsk wits had cod
220 width sod stack
221 tsk scow hit dad
222 width dot sacks
223 tsk scow did hat
224 kitsch swot dad
225 tsk cot wish add
226 width dost sack
227 tsk two dis chad
228 width task docs
229 who tsk tic dads
230 hack twits odds
231 who tsk tic adds
232 whos tsk addict
233 shod wit tsk cad
234 dicks dots thaw
235 add chis tsk two
236 docks hid twats
237 tsk width do sac
238 twos add shtick
239 tsk dit had cows
240 dah dock twists
241 tsk wit had docs
242 dos stack width
243 tod chis tsk wad
244 odd sticks thaw
245 width so tsk cad
246 swath tick odds
247 stow chi tsk dad
248 thaws tick odds
249 tsk itch do wads
250 odds whacks tit
251 shod tic tsk wad
252 shtick stow add
253 tsk chow did tas
254 dad hocks twits
255 add cow shit tsk
256 twos add kitsch
257 caw hit tsk odds
258 tasks cod width
259 dad cow hits tsk
260 dak switch dots
261 tsk whit add cos
262 thick dots wads
263 tsk doc hid swat
264 hacks twit odds
265 tsk doc hit wads
266 odd stick swath
267 tsk tis add chow
268 odd stick thaws
269 tsk tosh did caw
270 odds tacks whit
271 chad do wits tsk
272 kitsch stow add
273 tsk scot did haw
274 dads stitch wok
275 tsk sow did tach
276 dick dost swath
277 tsk scow hit add
278 dick dost thaws
279 tsk chit do wads
280 shad docks twit
281 itd tsk sad chow
282 tact whisk odds
283 tsk wit dash doc
284 adds stitch wok
285 tsk cost hid wad
286 odd twists hack
287 tsk doc hits wad
288 odd twist hacks
289 shod dit tsk caw
290 thick swot dads
291 tsk dit wash doc
292 dash dock twits
293 itd tsk cows had
294 shtick tow dads
295 tsk cots did haw
296 dicks dost thaw
297 tsk cows hid tad
298 odds tack whist
299 add chi tsk twos
300 shtick tow adds
301 stow chi tsk add
302 odd hicks watts
303 add itch tsk sow
304 kitsch tow dads
305 whit tsk cos dad
306 kitsch tow adds
307 dads cow hit tsk
308 switch dost dak
309 tsk docs hit wad
310 swatch disk dot
311 adds cow hit tsk
312 thick dost wads
313 tis tsk chow dad
314 tod sacks width
315 tsk cod hid swat
316 dicks dot swath
317 add cow hits tsk
318 dicks dot thaws
319 width tsk docs a
320 odd switch kats
321 tsk dit show cad
322 odd tits whacks
323 adds chi tsk tow
324 shad dock twits
325 tsk ids thaw doc
326 tad docks whist
327 tsk dit had scow
328 what odd sticks
329 add chit tsk sow
330 odd whit stacks
331 tsk doc dis thaw
332 thick twos dads
333 tsk odd watch is
334 swatch skid dot
335 tsk tow dis chad
336 odd thwack sits
337 tsk cot dish wad
338 width dot casks
339 itd tsk doc wash
340 ids dots thwack
341 dad chi tsk twos
342 odd wicks thats
343 add chi tsk swot
344 width sod tacks
345 tsk chi dots wad
346 shtick swot add
347 dad itch tsk sow
348 shtick dots wad
349 add chis tsk tow
350 width ods stack
351 tsk whos add tic
352 width dots cask
353 tsk sic odd thaw
354 odd whist stack
355 tsk chow dis tad
356 kitsch swot add
357 tsk disc dot haw
358 kitsch dots wad
359 tsk chi dost wad
360 tas docks width
361 tsk scot hid wad
362 odd shtick swat
363 tad cow dish tsk
364 thwack dis dots
365 cad do whist tsk
366 swatch disk tod
367 tsk chi dot wads
368 dos tacks width
369 cad dot wish tsk
370 hick odds watts
371 tsk twos hid cad
372 odd kitsch swat
373 dad chit tsk sow
374 add hocks twits
375 haw tic tsk odds
376 tod thaws dicks
377 itd tsk doc shaw
378 ticks doth wads
379 itd tsk scow had
380 shod dick watts
381 tsk cod dis thaw
382 dads twitch kos
383 tsk scow hid tad
384 dah docks twits
385 tsk cot hid wads
386 ids dost thwack
387 dad chi tsk swot
388 odd hicks twats
389 tsk cots hid wad
390 swat thick odds
391 wit tsk doc shad
392 adds twitch kos
393 dad chis tsk tow
394 dads hocks twit
395 tsk chit sod wad
396 width doss tack
397 whos tsk tic dad
398 shtick dost wad
399 tsk sic doth wad
400 odd twits shack
401 whit tsk doc ads
402 adds hocks twit
403 tsk dos wad chit
404 width dost cask
405 tsk chis dot wad
406 dads hock twits
407 wits tsk doc dah
408 adds hock twits
409 tsk swot hid cad
410 thwack diss dot
411 dads chi tsk tow
412 kitsch dost wad
413 chad sod wit tsk
414 shtick dot wads
415 dit tsk doc shaw
416 itd docks swath
417 caw dish dot tsk
418 itd docks thaws
419 chad ids tsk tow
420 width sods tack
421 cad dish tsk tow
422 kitsch dot wads
423 caws hid dot tsk
424 swatch skid tod
425 wit tsk dos chad
426 dit dots whacks
427 itd tsk chow ads
428 itd dost whacks
429 dash cow dit tsk
430 odd twit shacks
431 itd tsk shod caw
432 what stick odds
433 tsk odd itch was
434 swath docks dit
435 ids tsk chow tad
436 thaws docks dit
437 itd tsk cows dah
438 odd ticks swath
439 caw hid dots tsk
440 odd ticks thaws
441 tsk chit ods wad
442 dido tsk swatch
443 shad cow dit tsk
444 dit dost whacks
445 tsk hot caws did
446 odd kits swatch
447 dah disc tsk tow
448 hick odds twats
449 tsk dit haw docs
450 thwack diss tod
451 caws hid tod tsk
452 width ods tacks
453 tsk odd chit was
454 odd whist tacks
455 wad itch sod tsk
456 shod dick twats
457 odd cis thaw tsk
458 odd twits hacks
459 cad itd show tsk
460 odd shtick wast
461 dit tsk chow ads
462 shod dicks twat
463 chad dit tsk sow
464 itd doss thwack
465 chad ods wit tsk
466 odd kitsch wast
467 wad itch dos tsk
468 odd skit swatch
469 tsk hod wad tics
470 twitch doss dak
471 tsk dit caws hod
472 adds thick twos
473 caw doth ids tsk
474 wast thick odds
475 dit tsk cows dah
476 dak twitch sods
477 cad sod whit tsk
478 dit doss thwack
479 dash cow itd tsk
480 whacks itd dots
481 wash cod itd tsk
482 shod dicks watt
483 wit tsk docs dah
484 tod dicks swath
485 whit tsk dos cad
486 dit sods thwack
487 wha dot tsk disc
488 tod width casks
489 disc tho tsk wad
490 whats odd stick
491 shad cow itd tsk
492 scots width dak
493 dow as tsk ditch
494 adds thick swot
495 wha tic tsk odds
496 stacks with odd
497 itd tsk docs haw
498 what ticks odds
499 tsk cost did wha
500 tod shtick wads
