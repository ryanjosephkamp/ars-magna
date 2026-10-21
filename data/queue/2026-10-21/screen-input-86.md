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

## File 86 of 98: 2905 phrases

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

### jakebauers:people

input: Jake Bauers
category: people
phrases 1 to 183 of 183

1 jabs eureka
2 a jerk abuse
3 us reek a jab
4 abuser jake
5 a jerks beau
6 us be raj kea
7 as jerk beau
8 us jar kea be
9 juke bears a
10 a ras be juke
11 juke bear as
12 a ars be juke
13 use bake raj
14 bae us jerk a
15 use bake jar
16 jee us bark a
17 juke saber a
18 kae us be raj
19 baa jerk use
20 kae us be jar
21 juke sabre a
22 jus a be rake
23 raj use beak
24 kab us jeer a
25 beak jar use
26 eek a bus raj
27 aba jerk use
28 jee a bus ark
29 juke bar sea
30 eke a bus raj
31 jab rake use
32 rub jee ask a
33 sue bake raj
34 eek a sub raj
35 sue bake jar
36 jee a sub ark
37 baa jerk sue
38 eke a sub raj
39 sake rue jab
40 reb juke as a
41 raj sue beak
42 be jerk sau a
43 beak jar sue
44 bee jar a suk
45 sure jab kea
46 bus jar a eek
47 bare as juke
48 bus jar a eke
49 aba jerk sue
50 bur jee ask a
51 jab rake sue
52 sub jar a eek
53 baser a juke
54 sub jar a eke
55 user jab kea
56 us jake a reb
57 ruse jab kea
58 bee jus ark a
59 res baa juke
60 bru jee ask a
61 ers baa juke
62 bee raj a suk
63 kea rue jabs
64 rub jee ska a
65 us bear jake
66 bar a jee suk
67 ara bes juke
68 bar a jus eek
69 us bare jake
70 jab a suk ere
71 bus jake are
72 bar a jus eke
73 rube jakes a
74 a jus kae reb
75 abs are juke
76 bur jee ska a
77 sub jake are
78 jab a suk ree
79 bas are juke
80 reb kea a jus
81 bar jake use
82 bra a jee suk
83 kae sure jab
84 bra a jus eek
85 rebus jake a
86 bra a jus eke
87 bra sea juke
88 ere jus kab a
89 rubes jake a
90 ree jus kab a
91 bra jake use
92 bru jee ska a
93 rube jake as
94 bar jake sue
95 bus jake ear
96 jura ask bee
97 rub jake sea
98 bus jake era
99 abs ear juke
100 suk ajar bee
101 eek ajar bus
102 abs era juke
103 bra jake sue
104 sub jake ear
105 eke ajar bus
106 bas ear juke
107 be sake jura
108 sub jake era
109 be jake sura
110 bas era juke
111 eek ajar sub
112 bake are jus
113 bur jake sea
114 eke ajar sub
115 uber jakes a
116 abs jake rue
117 beak are jus
118 uber jake as
119 bas jake rue
120 aba juke res
121 aba juke ers
122 reb juke aas
123 abs eau jerk
124 bare kea jus
125 bar sae juke
126 be juke rasa
127 beaker a jus
128 bas eau jerk
129 bake ear jus
130 bus jee arak
131 bus raja eek
132 bra sae juke
133 bus raja eke
134 bake era jus
135 beak ear jus
136 bee jus arak
137 jab sau reek
138 jab kae user
139 baa jus reek
140 bru jake sea
141 jab kae ruse
142 beak era jus
143 sub jee arak
144 sub raja eek
145 bear kea jus
146 aba jus reek
147 baa jeer suk
148 burka as jee
149 sub raja eke
150 jabs kae rue
151 baa jee rusk
152 bee raja suk
153 be jake ursa
154 aba jeer suk
155 aba jee rusk
156 bae sau jerk
157 baa juke ser
158 rub jake sae
159 jab sura eek
160 bae ras juke
161 jab sura eke
162 bae ars juke
163 jus bae rake
164 reb jake sau
165 bes kea jura
166 bur jake sae
167 aba juke ser
168 kab jura see
169 bare kae jus
170 bark sau jee
171 bee jura ska
172 jee kab sura
173 jab ursa eek
174 kab sau jeer
175 abs jura eek
176 bear kae jus
177 jab ursa eke
178 abs jura eke
179 bas jura eek
180 bas jura eke
181 bru jake sae
182 bes kae jura
183 kab ursa jee

### jeffreydonaldson:people

input: Jeffrey Donaldson
category: people
phrases 1 to 500 of 500

1 anyone fled fjords
2 off jersey don land
3 sly need of an fjord
4 offended only jars
5 any fjords don feel
6 an off red lend joys
7 offenders joy land
8 off yes lend jordan
9 an off red lends joy
10 densely off jordan
11 sold jenny off dear
12 an off nerds joy led
13 offender joy lands
14 old jenny for fades
15 an old fed fry jones
16 offender joys land
17 any fjord don feels
18 an fond red joy self
19 slander offend joy
20 fond jersey of land
21 an off nerds joy del
22 landers offend joy
23 real odds off jenny
24 an fond fly do jeers
25 fondly fees jordan
26 sold jenny for deaf
27 yes lend of an fjord
28 sol afforded jenny
29 slender don off jay
30 an off nerd joys led
31 sendoff enjoy lard
32 off red enjoy lands
33 dry fled of an jones
34 jenny flared foods
35 sold jenny off dare
36 ends fled for an joy
37 jordan defy felons
38 off jenny reads old
39 an on self dye fjord
40 jenny offload reds
41 dear jenny of folds
42 an off nerd joys del
43 lander offends joy
44 sly need off jordan
45 an sold fern joy fed
46 jenny fared floods
47 an fjord fondle yes
48 an on les defy fjord
49 lander sendoff joy
50 sad jenny offer old
51 an no les defy fjord
52 fedora folds jenny
53 old jenny off dares
54 nerds fled of an joy
55 faded jenny floors
56 sold jenny for fade
57 red fly don of jeans
58 jenny affords dole
59 sad jenny of folder
60 an odd elf fry jones
61 lander offend joys
62 dense fly of jordan
63 an old nerds eff joy
64 none flayed fjords
65 off red enjoys land
66 self don end for jay
67 jordan offends ley
68 false ford do jenny
69 on fly send for jade
70 fondly fared jones
71 landed jones of fry
72 an off led rend joys
73 jenny affords lode
74 on fly feeds jordan
75 fed lends for an joy
76 jordan sendoff ley
77 no fly feeds jordan
78 an self rod fend joy
79 jordan offends lye
80 fond fly see jordan
81 red jenny folds of a
82 fray fondled jones
83 red jenny off loads
84 an sold ref fend joy
85 jordan sendoff lye
86 deaf jenny of lords
87 dry don of self jean
88 offended joy snarl
89 far fold does jenny
90 an off del rend joys
91 foals fodder jenny
92 off lenders don jay
93 far sled do of jenny
94 jones flayed frond
95 off lord deny jeans
96 on fly ends for jade
97 fondly fee jordans
98 off loser add jenny
99 dens fled for an joy
100 fords enjoyed flan
101 only fjord end safe
102 an red lens doff joy
103 annoyed fjord self
104 one feds fly jordan
105 jade ends fly for no
106 jordans defy felon
107 needs fly of jordan
108 an old nerd eff joys
109 fodder enjoys flan
110 safe jenny ford old
111 led yen of an fjords
112 raffles donned joy
113 only feed an fjords
114 an on els defy fjord
115 ordeals doff jenny
116 darned fly of jones
117 an no els defy fjord
118 jaded offer nylons
119 off jenny does lard
120 led fend for an joys
121 jordans offend ley
122 off joy end slander
123 jade end fly for son
124 raffle donned joys
125 off reds enjoy land
126 les deny of an fjord
127 jordans offend lye
128 sandy fjord feel no
129 ended fly of on jars
130 jade fronds felony
131 only nerds off jade
132 only fed send of raj
133 jaded offers nylon
134 old jenny off dears
135 ended no fly of jars
136 dorsal jenny offed
137 odd jenny of flares
138 only fed send of jar
139 fanned folders joy
140 an rolf defend joys
141 an odd ferns joy elf
142 annoyed fjords elf
143 an joy folds fender
144 an sly foe end fjord
145 neon flayed fjords
146 off jenny deal rods
147 on feed an sly fjord
148 fayed fjord nelson
149 safer fold do jenny
150 sad elf do for jenny
151 floored jenny fads
152 randy jones off led
153 ley end of an fjords
154 fanned folder joys
155 an joy fold fenders
156 on ends fled for jay
157 enjoys far fondled
158 jenny folded for as
159 on dry fled of jeans
160 enjoy lard offends
161 odd jenny for fleas
162 only feds end of raj
163 fey jordans fondle
164 an rolf defends joy
165 lye end of an fjords
166 leafy donne fjords
167 any don flee fjords
168 only feds end of jar
169 fonder jays fondle
170 self jenny roof dad
171 del yen of an fjords
172 enjoy slander doff
173 off jones lend yard
174 only fed end of jars
175 snarf fold enjoyed
176 far end enjoy folds
177 del fend for an joys
178 enjoys lard offend
179 odd jenny off laser
180 dense don fly of raj
181 jordan feds felony
182 an joy folded ferns
183 self nerd don of jay
184 enjoy landers doff
185 on self defy jordan
186 dense don fly of jar
187 dean fjords felony
188 off joy end landers
189 self den don for jay
190 doff snarl enjoyed
191 any fjords fled one
192 red jones fly of dna
193 jordans fed felony
194 off nerd enjoy lads
195 on nerds fly of jade
196 raffles jenny dodo
197 off jenny leads rod
198 an sly don doff jeer
199 enjoys lander doff
200 off jenny sled road
201 only fed ends of raj
202 fado folders jenny
203 only defend of jars
204 on feds lend for jay
205 sedan fjord felony
206 older jenny off ads
207 jade nerds fly of no
208 naff enjoyed lords
209 old jenny offer ads
210 dry elf don of jeans
211 deans fjord felony
212 far ends enjoy fold
213 only fed ends of jar
214 fanned dojo flyers
215 off jenny lead rods
216 self jenny do of rad
217 jordans def felony
218 off joy send lander
219 yen sled of an fjord
220 jordans fend foley
221 off roles add jenny
222 sly fed don for jean
223 offended nosy jarl
224 an joys fold fender
225 lens dye of an fjord
226 raff jenny doodles
227 fond jones fly dear
228 sly no defend of raj
229 raffle jones noddy
230 dear jenny off olds
231 sly no defend of jar
232 safely donne fjord
233 off jersey nod land
234 jade sen fly for don
235 noddy jarl offense
236 old fjord see fanny
237 sold fry end of jean
238 flayed fjord onsen
239 on fly feed jordans
240 old fern send of jay
241 flayed fronds jeon
242 fond fly read jones
243 fond yes lend of raj
244 fondled joey snarf
245 off jenny read olds
246 an dry dol eff jones
247 enjoys arf fondled
248 off sender joy land
249 on nerds fled of jay
250 flared fond enjoys
251 randy jones off del
252 fond yes lend of jar
253 raffles jeon noddy
254 off ends enjoy lard
255 on end fled for jays
256 afford lends enjoy
257 feds enjoy for land
258 les of jenny for dad
259 afford lend enjoys
260 off nerds enjoy lad
261 fly for end do jeans
262 andros fondly jefe
263 sad jenny floor fed
264 old ref of sad jenny
265 affords lend enjoy
266 no fly feed jordans
267 led yens of an fjord
268 snarf folded enjoy
269 feral jenny of odds
270 needs don fly of raj
271 fond flyers do jean
272 needs don fly of jar
273 done fly ford jeans
274 els deny of an fjord
275 off nelson dry jade
276 old ferns end of jay
277 on fly fodder jeans
278 odd les of far jenny
279 off role adds jenny
280 jade nerd fly of son
281 no fly fodder jeans
282 dry led fan of jones
283 off jenny lord sade
284 jade den fly for son
285 off jones laden dry
286 on dens fly for jade
287 fond jersey fan old
288 on fed lends for jay
289 landed ferns of joy
290 so lend an fey fjord
291 off jenny rode lads
292 any les end of fjord
293 off lords deny jean
294 jade dens fly for no
295 dorsal jenny of fed
296 jade send fly for no
297 fly need of jordans
298 fed of jenny lord as
299 off jenny deals rod
300 old fern ends of jay
301 off les deny jordan
302 far led sod of jenny
303 any jones fled ford
304 old fen send for jay
305 jenny lord of fades
306 del yens of an fjord
307 only fed ford jeans
308 fly for ends do jean
309 an fond fold jersey
310 sold fern end of jay
311 older jenny of fads
312 fond need of sly raj
313 far food sled jenny
314 fond need of sly jar
315 deaf jenny for olds
316 only feds jar of den
317 denser joy off land
318 so do jenny fled far
319 slender joy off dna
320 yes off don lend raj
321 fond flyer do jeans
322 yes off don lend jar
323 faded jenny for sol
324 self don rend of jay
325 off jenny load reds
326 on ded fly for jeans
327 dandy elf for jones
328 dry del fan of jones
329 far end enjoys fold
330 only fed jars of den
331 only feds ford jean
332 old den fry of jeans
333 off ley send jordan
334 on dens fled for jay
335 fond jones fly dare
336 on fly for jaded sen
337 off jenny dare olds
338 no ded fly for jeans
339 off sled enjoy darn
340 jaded sen fly for no
341 one fjords fly dean
342 red fly nod of jeans
343 off jones land dyer
344 on fry lends of jade
345 red fold enjoy fans
346 sly fern don of jade
347 on need flay fjords
348 fond les end for jay
349 any don flees fjord
350 sly ford end of jean
351 false no deny fjord
352 on fed lend for jays
353 on fry folded jeans
354 fed of jenny lords a
355 odd jenny for leafs
356 an fjord don fly see
357 any fold seen fjord
358 far del sod of jenny
359 sold jenny doff are
360 self nod end for jay
361 on jersey doff land
362 needs on fjord fly a
363 off end enjoys lard
364 end do jones fly far
365 fed enjoy for lands
366 on sled fend for jay
367 fond no jade flyers
368 on fry of jaded lens
369 no fry folded jeans
370 needs no fjord fly a
371 off lye send jordan
372 no sled fend for jay
373 no jersey doff land
374 fond lens of red jay
375 off joy ends lander
376 les of jenny for add
377 self jenny for dado
378 on sled an fey fjord
379 off led enjoys darn
380 self nerd joy of dna
381 only defends of raj
382 old fen ends for jay
383 fonder fly do jeans
384 sly red of fond jean
385 fey self don jordan
386 don for elf send jay
387 one fed fly jordans
388 son fly fjord need a
389 jenny read of folds
390 off joy and red lens
391 old jenny offs dear
392 so defend on fly raj
393 only defends of jar
394 self den joy for dna
395 off drones lend jay
396 old fen dry of jeans
397 fond joy free lands
398 sold fen end for jay
399 off jones rend lady
400 so defend on fly jar
401 an fjords defy noel
402 so defend no fly raj
403 jenny leads of ford
404 only fed jar of dens
405 jaded nelson of fry
406 so defend no fly jar
407 far fold deny jones
408 jade end fly for nos
409 self deny of jordan
410 old jenny so far fed
411 landed fern of joys
412 off jenny so red lad
413 fond lenders of jay
414 off dry jones lend a
415 off jenny redo lads
416 els of jenny for dad
417 self jenny roof add
418 sold den fry of jean
419 false fjord don yen
420 fey don lend of jars
421 ended joy off snarl
422 jenny of led for ads
423 off sol dared jenny
424 an fjord feed sly no
425 fond jones fry deal
426 far self end don joy
427 off den joy slander
428 off don need sly raj
429 red folds enjoy fan
430 red fly dons of jean
431 sad roof fled jenny
432 sad joy lend of fern
433 jones defy for land
434 red fly nods of jean
435 off jones deny lard
436 fly of nerds do jean
437 self ford enjoy dna
438 off don need sly jar
439 lee fjords do fanny
440 jars fly of done end
441 fonder self don jay
442 jay fled ends for no
443 off lender don jays
444 on nerd fled of jays
445 off joys end lander
446 so ford jenny fled a
447 fond joys free land
448 fly of nerd do jeans
449 any fjords nod feel
450 dry les of fond jean
451 old fender joy fans
452 old fern end of jays
453 off joy lend sander
454 self den joy of darn
455 fed enjoys for land
456 on den fled for jays
457 jones fend for lady
458 old dens fry of jean
459 any fjord fled ones
460 fed for jenny do las
461 fond jersey do flan
462 fly of reds don jean
463 only need doff jars
464 jeans fled dry of no
465 red nylons off jade
466 odd els of far jenny
467 odd jenny off reals
468 nosy end fled of raj
469 older jenny doff as
470 jean send old of fry
471 off lenders joy dna
472 fly for den do jeans
473 fond sled enjoy far
474 on don feed fly jars
475 off sled enjoy rand
476 sly fen don for jade
477 jade fed for nylons
478 dry nod of self jean
479 off lender joy sand
480 nosy end fled of jar
481 jenny folds of dare
482 far led ods of jenny
483 off ley ends jordan
484 odd sen fly for jean
485 fond joy learn feds
486 jars fly feed don no
487 jade feds for nylon
488 jay fled end for son
489 jenny fled of roads
490 jeans end old of fry
491 off yen sled jordan
492 an fjord do fly seen
493 an fjords dye felon
494 an jones eff old dry
495 off del enjoys darn
496 any els end of fjord
497 fond joy feels darn
498 on led fend for jays
499 jenny ford of deals
500 red fen joy of lands

### lekhawashington:people

input: Lekha Washington
category: people
phrases 1 to 500 of 500

1 an sole nighthawk
2 an thanks go while
3 he ask an low thing
4 who think lasagne
5 an high know least
6 he ask an low night
7 whose anal knight
8 an thing ask whole
9 an walk go the shin
10 who thank sealing
11 an night ask whole
12 his hag know an let
13 those waning lakh
14 those in hang walk
15 an ok a wish length
16 as knowing health
17 an think go whales
18 i wash an ok length
19 who tanks healing
20 whose in hang talk
21 his wan a ok length
22 whole gain thanks
23 an on highest walk
24 i know a has length
25 asking own health
26 an no highest walk
27 lakh to an new sigh
28 nothing shake law
29 hawk to an english
30 an ok ash with glen
31 whole thanking as
32 who light an snake
33 this new kohl nag a
34 alone hawk things
35 an high know tales
36 an ok has with glen
37 also then hawking
38 who light an sneak
39 i haw an ok lengths
40 who hating ankles
41 whose ling thank a
42 an in hag tsk whole
43 awhile thank song
44 whole sign thank a
45 an ok haw is length
46 white gonna lakhs
47 who talk an neighs
48 an nigh a tsk whole
49 along want sheikh
50 who talk an hinges
51 this new kohl gan a
52 alone hawks thing
53 who tank his angel
54 we hangs an ok hilt
55 who stank healing
56 whose gal thank in
57 the in kan howl gas
58 alone hawks night
59 an high know tesla
60 an on hag tsk while
61 health gains know
62 an thing ok whales
63 an no hag tsk while
64 whose halting kan
65 an slow taken high
66 he walk his tan nog
67 as honking wealth
68 the as honing walk
69 an ok whit has glen
70 healing hats know
71 english a know hat
72 his won gal hat ken
73 on walking sheath
74 an hank go whistle
75 his own gal hat ken
76 no walking sheath
77 an high walk stone
78 an het walk go shin
79 alone wash knight
80 an night ok whales
81 i know a ash length
82 anal highest know
83 an low shake thing
84 i shake an nth glow
85 health gain knows
86 an high know taels
87 he show an gilt kan
88 won asking health
89 on king was health
90 his won hat lag ken
91 at honking whales
92 an low shake night
93 an thin hog was elk
94 high know sealant
95 no king was health
96 his own hat lag ken
97 legion thank wash
98 whole a think sang
99 the in kan howl sag
100 so wanking health
101 whole gas thank in
102 she ink an low ghat
103 an nighthawk lose
104 an high walk notes
105 he honk an lit swag
106 hogan thank lewis
107 an hanks got while
108 i hawk as on length
109 hogan with ankles
110 an shank got while
111 i hawk as no length
112 healing hast know
113 an no weight lakhs
114 he thank so gin law
115 healing hat knows
116 who tank his angle
117 an thin hog was lek
118 not hawks healing
119 an khan go whistle
120 an hot lis knew hag
121 height know nasal
122 an on eighth walks
123 he honk til an swag
124 healing tank show
125 on gas thank while
126 he honk an lit wags
127 alone hawk nights
128 an king wash hotel
129 an lin gawk the hos
130 goal thank whines
131 no gas thank while
132 an ok whit ash glen
133 taken howling has
134 an two high ankles
135 he honk til an wags
136 logan want sheikh
137 an ok swing health
138 an thin saw hog elk
139 eighth know nasal
140 an wings ok health
141 his nth wok angle a
142 asking than whole
143 an las know height
144 it ok he hang lawns
145 who shank gelatin
146 steal an high know
147 an nth haw go likes
148 on shaking wealth
149 whole gas an think
150 an ok hag thin slew
151 healing shat know
152 whose lag thank in
153 i hang now set lakh
154 heating lash know
155 whole knights an a
156 an as who think leg
157 no shaking wealth
158 an king hats whole
159 i gawk an nth holes
160 sealing hath know
161 his two angle hank
162 an kin hash go welt
163 legion thank shaw
164 the salah own king
165 ink to he hang laws
166 along white hanks
167 an las know eighth
168 it know he lash nag
169 along shank white
170 single know hath a
171 kin to he hang laws
172 law honking hates
173 an thong ask while
174 an hot skin hew gal
175 healing thank sow
176 whose link hang at
177 an kin shah go welt
178 wagon skin health
179 shaken a light now
180 an ok hag hint slew
181 whole gains thank
182 who thank single a
183 an nigh ok haw lets
184 hogan has twinkle
185 an won eight lakhs
186 an thin saw hog lek
187 hawk listen hogan
188 this hag walk none
189 an tan wish hog elk
190 along whites hank
191 won a thank sleigh
192 an nil gawk the hos
193 an hawking hotels
194 an kings hat whole
195 i hang won set lakh
196 whole knights ana
197 shake an light now
198 whose nth a ink gal
199 not hash weakling
200 an owl shake thing
201 while gas an nth ok
202 hogan tanks while
203 his two angle khan
204 an nth a sleigh wok
205 on hath weaklings
206 whole a gin thanks
207 an nth hag ok lewis
208 tingles know haha
209 an owl shake night
210 it know he gan lash
211 weaklings hath no
212 known high steal a
213 i own lakh hang set
214 whites gonna lakh
215 an hank slow eight
216 i ok wan has length
217 sewing thank halo
218 an lakhs own eight
219 an hot sink hew gal
220 whole giant hanks
221 angel hat his know
222 ilk to an hewn shag
223 whole giant shank
224 who angle this kan
225 he is tank long haw
226 glisten know haha
227 own a thank sleigh
228 i ask on haw length
229 who shank tagline
230 whole a think snag
231 we has ok hang lint
232 shaken alight now
233 whole knight an as
234 i ask no haw length
235 whole hangs takin
236 an khans got while
237 we has lakh got inn
238 hogan talk whines
239 an king hast whole
240 lakh sigh to an wen
241 alas known height
242 who tank an sleigh
243 on hash walk get in
244 gelatin hash know
245 an wig thank holes
246 in to he gnaws lakh
247 snake hat howling
248 who angle its hank
249 i hang on welsh kat
250 along whites khan
251 on thing shake law
252 an hot skin hew lag
253 an hawking hostel
254 an hot single hawk
255 an nth wig ok leash
256 healing shank two
257 on king has wealth
258 we tsk on hang hail
259 wagon sink health
260 on king saw health
261 i hang no welsh kat
262 shaken awol thing
263 no thing shake law
264 an tan wish hog lek
265 hank slow heating
266 whole thing sank a
267 we hang hail tsk no
268 lakhs own heating
269 ale hang this know
270 he slow at gin hank
271 lasagne with honk
272 an ok lighten wash
273 on walk shah get in
274 shaken awol night
275 no king has wealth
276 length honk i was a
277 hank show gelatin
278 his long taken haw
279 no walk shah get in
280 waking son health
281 no king saw health
282 on is a hawk length
283 shah know gelatin
284 on night shake law
285 an as who think gel
286 know inhales ghat
287 an winks go health
288 wet ling ok an hash
289 salon weight hank
290 an hawk sign hotel
291 length hawk a is no
292 sneak hat howling
293 an on walk heights
294 whose nth a ink lag
295 leaning hawk shot
296 an high walk tones
297 ilk to an hewn gash
298 alas known eighth
299 this on hawk angel
300 an nth ok heals wig
301 neighs thank awol
302 lea hang this know
303 so in a hawk length
304 shaking wan hotel
305 no night shake law
306 whose nth kin lag a
307 known eight salah
308 whole night sank a
309 wet ling ok an shah
310 hank loans weight
311 his lakh own agent
312 an low hag kits hen
313 who hasnt linkage
314 heights walk an no
315 an hot sink hew lag
316 hogan skin wealth
317 angel hawk this no
318 he slow at gin khan
319 along white khans
320 his know glean hat
321 he wank in shot gal
322 anal eighth knows
323 an hog thank lewis
324 his nth wok glean a
325 awhile hang knots
326 then a howl asking
327 ok in a wash length
328 hinges thank awol
329 an two sleigh hank
330 an owl he ask thing
331 hank howls eating
332 an hawk sing hotel
333 ilk to an hewn hags
334 ethanol wash king
335 who tsk an healing
336 an hot lin haw kegs
337 genial show thank
338 an ok highest lawn
339 in tsk a hang whole
340 hag want sinkhole
341 hog with an ankles
342 an owl he ask night
343 law honking haste
344 an khan slow eight
345 ink to he hang slaw
346 hogan thank wiles
347 an king howls hate
348 he hog i tanks lawn
349 king loathe shawn
350 hawk to an shingle
351 a ask now light hen
352 sheath align know
353 an tank sigh whole
354 an nth wig ok shale
355 shaken at howling
356 on at hawk english
357 on tsk a hang while
358 haha twinkle song
359 shaken a light won
360 i so hawk an length
361 khan slow heating
362 an als know height
363 while hang a tsk no
364 anal know heights
365 an law honks eight
366 length has a win ok
367 whole snaking hat
368 an lot weighs hank
369 it own lakh has gen
370 law honks heating
371 no at hawk english
372 kin to he hang slaw
373 known halt geisha
374 whole stink hang a
375 i lag whose nth kan
376 khan show gelatin
377 on a knight whales
378 an nth wig ok hales
379 tagline hash know
380 an want log sheikh
381 on was hank hit leg
382 town leaking hash
383 who angle its khan
384 an low ghat ink hes
385 weakling hath son
386 in task hang whole
387 leg hit hank was no
388 shaken alight won
389 an high taken owls
390 tsk i hang an whole
391 hotel sawing hank
392 an king shat whole
393 he tsk on hang wail
394 salon weight khan
395 shake an light won
396 he hang wail tsk no
397 lakh shown eating
398 angle hat his know
399 i hawk on shag lent
400 king shown althea
401 this no glean hawk
402 he snow a ting lakh
403 tingle knows haha
404 those ink hang law
405 an nth hag ok wiles
406 while tangos hank
407 an high walk onset
408 she win kan go halt
409 healing wank shot
410 whole gin thank as
411 i hawk no shag lent
412 hogan stank while
413 whole skin hang at
414 he wank in shot lag
415 those walking nah
416 shaken light own a
417 he wan so light kan
418 hank show tagline
419 an lawn got sheikh
420 length honk i saw a
421 while tango hanks
422 those kin hang law
423 whose nth ilk nag a
424 healing wash knot
425 on task hang while
426 i hath know nag les
427 khan loans weight
428 who shake an glint
429 his nth ala own keg
430 while tango shank
431 an lawn ok heights
432 on has hit knew gal
433 alone haw knights
434 slate an high know
435 on was khan hit leg
436 easing thank howl
437 an son weight lakh
438 won a ask light hen
439 khan howls eating
440 an lakh white song
441 in a who ask length
442 whole giant khans
443 long as white hank
444 no has hit knew gal
445 whales gonna kith
446 whole as think nag
447 leg hit khan was no
448 shah know tagline
449 the hank sail gown
450 an hot nil haw kegs
451 town leaking shah
452 no task hang while
453 on has hank let wig
454 alone wank thighs
455 whole a think nags
456 he owns a ting lakh
457 anon highest walk
458 his law honk agent
459 while sag an nth ok
460 wealth gain honks
461 an als know eighth
462 no has hank let wig
463 along shaken whit
464 an two sleigh khan
465 we link so hath nag
466 howling shake ant
467 an own light shake
468 own a ask light hen
469 whole giants hank
470 this on hawk angle
471 i snag new hot lakh
472 hank whites logan
473 on high was anklet
474 i hawk so nth angel
475 hot leaning hawks
476 one gal thank wish
477 he host in wank gal
478 hogan sink wealth
479 an no weights lakh
480 an hot inks hew gal
481 alone shaw knight
482 angle hawk this no
483 i ok an shaw length
484 hostile hang wank
485 his tank nag whole
486 i hawk on gash lent
487 hank loan weights
488 stale an high know
489 he hog i stank lawn
490 walk honing hates
491 an high taken lows
492 i hawk no gash lent
493 whole shaking tan
494 an lot weighs khan
495 we tan on sigh lakh
496 highest known ala
497 not hawk his angel
498 i who ask an length
499 whole tanking ash
500 an king sow health

### biggboss:titles

input: Bigg Boss
category: titles
phrases 1 to 3 of 3

1 gigs bobs
2 bigs bogs
3 bigs gobs

### kellyloeffler:people

input: Kelly Loeffler
category: people
phrases 1 to 155 of 155

1 kelly of feller
2 ok reel fell fly
3 rolf feel kelly
4 ok ref fell yell
5 fell fore kelly
6 ok leer fell fly
7 kelly offer ell
8 key for fell ell
9 leery fell folk
10 ok lyre fell elf
11 rolf flee kelly
12 fell ore fly elk
13 reek fell folly
14 fell roe fly elk
15 folk elf yeller
16 lee rolf fly elk
17 folk feller ley
18 ell fly for keel
19 folk feller lye
20 elk of fell lyre
21 yolk feller elf
22 elk for fell ley
23 folk freely ell
24 fell ore fly lek
25 elk for fell lye
26 ell fly for leek
27 key ell eff roll
28 fell roe fly lek
29 lee rolf fly lek
30 lek of fell lyre
31 fly or fell keel
32 lek for fell ley
33 lek for fell lye
34 fly or fell leek
35 fore ell fly elk
36 fey elf roll elk
37 ok rely fell elf
38 fore ell fly lek
39 fey elf roll lek
40 elk of fell rely
41 fey ell fell kor
42 kor fly fell lee
43 fork fly lee ell
44 lek of fell rely
45 elk off rely ell
46 kelly of ref ell
47 folk fry lee ell
48 elk for elf yell
49 lek off rely ell
50 kor fly fell eel
51 lek for elf yell
52 elk oer fell fly
53 elk of flyer ell
54 elk roll fly fee
55 lek oer fell fly
56 lek of flyer ell
57 kor fly feel ell
58 lek roll fly fee
59 elf fly role elk
60 elf fly role lek
61 fork fly eel ell
62 elk off lyre ell
63 elf fly lore elk
64 elk rolf fly eel
65 folk fry eel ell
66 lek off lyre ell
67 kor fly flee ell
68 elf fly lore lek
69 ok flyer elf ell
70 lek rolf fly eel
71 kore fly elf ell
72 kor ley fell elf
73 kor lye fell elf
74 elk roll ley eff
75 ell ley fork elf
76 elk roll lye eff
77 ell lye fork elf
78 key rolf elf ell
79 lek roll ley eff
80 ell fry floe elk
81 kelly or ell eff
82 lek roll lye eff
83 kor yell ell eff
84 ell fry floe lek
85 ok fer fell yell
86 ell eff lory elk
87 ell eff lory lek
88 free fly lol elk
89 fell ref lol key
90 fey ell rolf elk
91 key fro fell ell
92 free fly lol lek
93 eek elf fly roll
94 elk ole fell fry
95 kelly of fer ell
96 eke elf fly roll
97 fey ell rolf lek
98 lek ole fell fry
99 oke fry fell ell
100 elk loe fell fry
101 elk lol feel fry
102 lol ref fly leek
103 fro elf yell elk
104 elk fro fell ley
105 eek rolf fly ell
106 lek loe fell fry
107 elk fro fell lye
108 fro ell fly leek
109 folk fly ere ell
110 eke rolf fly ell
111 lek lol feel fry
112 lol elf fry leek
113 elk for elfy ell
114 fro elf yell lek
115 lek fro fell ley
116 lek fro fell lye
117 elk lol fly reef
118 lek for elfy ell
119 elk or elfy fell
120 folk fly ree ell
121 elk lol flee fry
122 lek lol fly reef
123 folk elf rye ell
124 lek or elfy fell
125 lol lyre eff elk
126 lek lol flee fry
127 folk ref ley ell
128 lol lyre eff lek
129 folk ref lye ell
130 yolk ref elf ell
131 reek elf fly lol
132 lol eek fell fry
133 elk rolf elf ley
134 elk rolf elf lye
135 lol eke fell fry
136 keel ref fly lol
137 keel ell fly fro
138 lek rolf elf ley
139 keel elf fry lol
140 lek rolf elf lye
141 eff lol rely elk
142 eff lol rely lek
143 lol fer fly keel
144 key lol fer fell
145 lol fer fly leek
146 folk fer ley ell
147 folk fer lye ell
148 yolk fer elf ell
149 kor elfy elf ell
150 elk lol elfy ref
151 elk fro elfy ell
152 lek lol elfy ref
153 lek fro elfy ell
154 elk lol elfy fer
155 lek lol elfy fer

### blakesnell:people

input: Blake Snell
category: people
phrases 1 to 64 of 64

1 balls kneel
2 ken sell lab
3 sable knell
4 an bells elk
5 ball kneels
6 an bell elks
7 ankles bell
8 las be knell
9 ankle bells
10 les ball ken
11 blase knell
12 an bells lek
13 bales knell
14 las bell ken
15 bleak snell
16 all ben elks
17 als be knell
18 als bell ken
19 bel knell as
20 ell bank les
21 elk sell ban
22 els ball ken
23 kan bell les
24 sen ball elk
25 sell nab elk
26 lek sell ban
27 bel sell kan
28 all bel kens
29 sen ball lek
30 sell nab lek
31 ell bank els
32 kan bell els
33 all neb elks
34 ell sank bel
35 ell ban elks
36 ell bans elk
37 ell balk sen
38 ell nab elks
39 ell bans lek
40 sal be knell
41 lab elk lens
42 sal bell ken
43 labs ken ell
44 lab lek lens
45 slab ken ell
46 lab kens ell
47 all ble kens
48 as ble knell
49 kan ble sell
50 bal ken sell
51 bank sel ell
52 kan bell sel
53 ball ken sel
54 alls ben elk
55 alls bel ken
56 alls ben lek
57 bal elk lens
58 sank ble ell
59 kab lens ell
60 bal lek lens
61 bal kens ell
62 alls neb elk
63 alls ble ken
64 alls neb lek

### nelsondilipkumar:people

input: Nelson Dilipkumar
category: people
phrases 1 to 500 of 500

1 painkillers mound
2 us pranked million
3 i spell our mankind
4 an super nim do kill
5 painkiller mounds
6 around simple link
7 in kill do superman
8 an up merlin ski old
9 kill remain pounds
10 up kill don remains
11 i up on smaller kind
12 on mud painkillers
13 up kill mind reason
14 i up no smaller kind
15 painkillers mud no
16 up kill don marines
17 i up kill do manners
18 marine pounds kill
19 up kill don seminar
20 us kill me pardon in
21 remains pound kill
22 is our planned milk
23 an up mol lie drinks
24 up darkens million
25 upon in kill dreams
26 i sun me kill pardon
27 normal kids lineup
28 up kills remain don
29 i do in smaller punk
30 pardon like muslin
31 up line kids normal
32 us kill i pardon men
33 marines pound kill
34 our in spanked mill
35 me up in skin dollar
36 painkiller don sum
37 our milk pen island
38 me is in punk dollar
39 around simple kiln
40 our in sampled link
41 me up in ink dollars
42 seminar pound kill
43 our lin sample kind
44 me up in kin dollars
45 permian sound kill
46 up skill remain don
47 me up in sink dollar
48 dopamine kill runs
49 on pull remain kids
50 i up on milk slander
51 airmen pounds kill
52 no pull remain kids
53 i don up smaller kin
54 kills remain pound
55 up kind lies normal
56 i up no milk slander
57 medallion skip run
58 up more link island
59 our mild in pal kens
60 normal side uplink
61 up norm like island
62 i up in dreams knoll
63 mine spun roadkill
64 up kills don marine
65 i up men skin dollar
66 skill remain pound
67 normal kid pulse in
68 an ok mull rid penis
69 minerals do uplink
70 normal spud like in
71 us milk i do planner
72 dopamine kills run
73 up lines kid normal
74 i up silk end normal
75 random unlike lips
76 up kind mill reason
77 i up on milk landers
78 mankind rule spoil
79 up skill don marine
80 our mild in lap kens
81 slim unlike pardon
82 on in drills makeup
83 i run link do sample
84 random unlike slip
85 up morn like island
86 i up no milk landers
87 pullman kid senior
88 up red kill mansion
89 i up men ink dollars
90 painkiller mud son
91 up kill mind senora
92 i lurk in don sample
93 prude kill mansion
94 on rump like island
95 on up in kill dreams
96 realism don uplink
97 no rump like island
98 our in ems plank lid
99 skill run dopamine
100 our nil sample kind
101 an up mol drinks lei
102 up skilled ironman
103 all don umpire skin
104 up no in kill dreams
105 normal kid lineups
106 up side link normal
107 an ok mull rid spine
108 marine pound kills
109 insane milk up lord
110 an on lumps irk lied
111 spaniel round milk
112 unmarked pill is no
113 i up on smaller dink
114 dorks up millennia
115 up kinds lie normal
116 i pull on ink dreams
117 mandolin like spur
118 up old link remains
119 i pun on kill dreams
120 dampers kill union
121 our ill kidnaps men
122 i up lens kid normal
123 similar done plunk
124 up lied skin normal
125 an no lumps irk lied
126 mine puns roadkill
127 up silk don mineral
128 i up no smaller dink
129 diploma nurse link
130 on in drill makeups
131 i up men sink dollar
132 mankind peril soul
133 on ill kid superman
134 i pull no ink dreams
135 marine pound skill
136 normal lied is punk
137 i pun no kill dreams
138 idol link superman
139 our ken limp island
140 i sun me pink dollar
141 more uplink island
142 up link do minerals
143 i pull on kin dreams
144 rink up medallions
145 up merlin ok island
146 an on plums irk lied
147 normal dies uplink
148 raised monk pull in
149 i pull no kin dreams
150 pink loud minerals
151 pure no milk island
152 i pull me ok innards
153 painkiller don mus
154 on pulls remain kid
155 an spud more kill in
156 plainer sound milk
157 on pull admire skin
158 an no plums irk lied
159 mineral solid punk
160 no pulls remain kid
161 an on slump irk lied
162 normal disk lineup
163 senior kind up mall
164 an up merlin ski dol
165 praline sound milk
166 liked sin up normal
167 an no slump irk lied
168 around silken limp
169 no pull admire skin
170 i dreams ill on punk
171 unlike normal dips
172 marine pull do skin
173 i dreams ill no punk
174 normal dislike pun
175 up links die normal
176 i kill me pardon uns
177 in sparkled moulin
178 all don umpire sink
179 an lier lump ski don
180 punk sir medallion
181 normal duke slip in
182 an ok mull rid pines
183 kind pulls romaine
184 like run mop island
185 an lier plum ski don
186 rod milk peninsula
187 kind isle up normal
188 i is up random knell
189 lion dreams uplink
190 up links remain old
191 i ok sir end pullman
192 plus liked ironman
193 up links do mineral
194 on up in smaller kid
195 seminal proud link
196 up link don realism
197 up no in smaller kid
198 mankind lure spoil
199 up old skin mineral
200 i pun on smaller kid
201 punk aliens milord
202 up kills don airmen
203 i pun no smaller kid
204 pond kill aneurism
205 in kill dump senora
206 i lump in ok slander
207 mansion drill puke
208 our elm pink island
209 an ok mull rid snipe
210 mansion kid puller
211 liked in up normals
212 i is kern do pullman
213 primula kid nelson
214 mineral old is punk
215 i pull inn ok dreams
216 kinds pull romaine
217 unmarked in is poll
218 an on lumps irk idle
219 insider ok pullman
220 on plus kid mineral
221 i ok plum in slander
222 leopard link minus
223 normal dip like sun
224 an no lumps irk idle
225 normal upside link
226 insane kill up dorm
227 i up ski lend normal
228 mineral pound silk
229 our in sampled kiln
230 i up on darkens mill
231 skimp our landline
232 liked in ups normal
233 i don me larks lupin
234 normal skid lineup
235 up lied sink normal
236 me is lupin rank old
237 unlike prom island
238 up old link marines
239 me run lip ok island
240 marine sold uplink
241 up line disk normal
242 i up no darkens mill
243 spread link moulin
244 on kind lump serial
245 i sparked in on mull
246 similar olden punk
247 on milk up islander
248 i sell up random kin
249 mandolin rule skip
250 serial kind lump no
251 an dim rune kill ops
252 ladies minor plunk
253 up skill don airmen
254 an on plums irk idle
255 medallion risk pun
256 up no milk islander
257 me up in inks dollar
258 old uplink remains
259 marine son pull kid
260 i sparked in no mull
261 euro spill mankind
262 on pull admire sink
263 i run old ink sample
264 medallions kip run
265 up link dies normal
266 an rum pies ink doll
267 realism pound link
268 up skin remain doll
269 an no plums irk idle
270 urinals model pink
271 normal kind use lip
272 an on slump irk idle
273 airmen pound kills
274 no pull admire sink
275 us mill i pranked no
276 airlines mold punk
277 marine pull do sink
278 an no slump irk idle
279 union sparked mill
280 up kill nod remains
281 an mid rune kill ops
282 kind poll aneurism
283 on pull remain disk
284 i up dill ok manners
285 ironman killed sup
286 up men kill inroads
287 i is nerd ok pullman
288 medallion kip runs
289 liked pun is normal
290 i pun me skin dollar
291 medulla ink prison
292 more kiln up island
293 i enroll up mad skin
294 primus ok landline
295 no pull remain disk
296 i up ilk send normal
297 muesli link pardon
298 marine kill ups don
299 i run kin sample old
300 airmen pound skill
301 pink duel is normal
302 us ink me pollard in
303 domains prune kill
304 up old link seminar
305 an on lumps irk deli
306 mansion irked pull
307 i kill don superman
308 i do pills rank menu
309 mankind purse lilo
310 in kill mud persona
311 an no lumps irk deli
312 minus paroled link
313 on kill remain spud
314 i lump in ok landers
315 slander link opium
316 old links up marine
317 i lurk on sampled in
318 dopamine kill urns
319 up old sink mineral
320 i run kiln do sample
321 normals kid lineup
322 in mike pun dollars
323 i lurk in sampled no
324 kind lilo superman
325 up monks rallied in
326 an on plums irk deli
327 lido link superman
328 insane rump do kill
329 i ok plum in landers
330 mankind rouse pill
331 normal duel skip in
332 us mill i pardon ken
333 random unlike lisp
334 up line skid normal
335 an no plums irk deli
336 roadkill pen minus
337 on risk die pullman
338 an on slump irk deli
339 kind perm allusion
340 in kill pod surname
341 me sun in kip dollar
342 allusion mind perk
343 random silk up line
344 i run ilk don sample
345 nine lurks diploma
346 no risk die pullman
347 an no slump irk deli
348 run kidnaps mollie
349 our link din sample
350 us mind i rape knoll
351 kind lupin morales
352 marine don kill sup
353 i run link do maples
354 solarium lend pink
355 up lion link dreams
356 me do in larks lupin
357 medallion skip urn
358 unarmed ops kill in
359 i pun me ink dollars
360 mineral dunk spoil
361 mundane kill is pro
362 an kin rom duel lips
363 kinsman poured ill
364 on plus admire link
365 i lurk in don maples
366 menu spin roadkill
367 on kill dip surname
368 i is on pranked mull
369 nominal ruled skip
370 up skin idle normal
371 i is no pranked mull
372 airline mold punks
373 ill rose up mankind
374 i up ken slid normal
375 doll pink aneurism
376 like pom run island
377 me up ok ill innards
378 ironman pulled ski
379 up lien kids normal
380 us kip i lend normal
381 mandolin rules kip
382 unarmed kill sip no
383 an kin rom slip duel
384 random likes lupin
385 no plus admire link
386 i pun me sink dollar
387 old uplink marines
388 no kill dip surname
389 i enroll up mad sink
390 dirk noise pullman
391 plus link do marine
392 us lend ok primal in
393 ironman killed pus
394 normal idle is punk
395 i pranked so in mull
396 nominal liked spur
397 on pill kid surname
398 us ink me pardon ill
399 mineral loud pinks
400 in dill ok superman
401 i spill menu do rank
402 mod sun painkiller
403 one dirk is pullman
404 an kin ump lord isle
405 idol pink numerals
406 marine don ski pull
407 i link urn do sample
408 moulin spared link
409 on sin drill makeup
410 i ski on red pullman
411 idealism plonk run
412 no pill kid surname
413 i up ilk ends normal
414 island perk moulin
415 mild link up reason
416 i ski no red pullman
417 normal skied lupin
418 old mike ruins plan
419 i up men inks dollar
420 diploma nurse kiln
421 on pull remain skid
422 i sun me ink pollard
423 dopamine kills urn
424 up die slink normal
425 i ink so red pullman
426 remains dull pinko
427 up sink remain doll
428 i is ken mull pardon
429 loud peril kinsman
430 random sun like lip
431 i sulk me pardon lin
432 dopamine risk null
433 no pull remain skid
434 i up in darkens moll
435 mandolin lure skip
436 up doll skin marine
437 i like ump don snarl
438 marine solid plunk
439 pink menu is dollar
440 us don lin park mile
441 killer pun domains
442 in skull remain pod
443 i up kin sled normal
444 duke spill ironman
445 kind mon up rallies
446 us kip in normal led
447 millennia dusk pro
448 normal die is plunk
449 me up sin ink dollar
450 idol plunk remains
451 marine doll is punk
452 i spun me ink dollar
453 mineral pounds ilk
454 dull no remain skip
455 i ok nun dreams pill
456 landers link opium
457 i link old superman
458 us ink i pollard men
459 old uplink seminar
460 in nils lord makeup
461 i sun me pollard kin
462 airline molds punk
463 in mike sun pollard
464 an dim rune kill sop
465 plus mainline dork
466 smaller ion up kind
467 me ok in dun pillars
468 mainline drop sulk
469 up mon kill sardine
470 run like limps don a
471 primula kindle son
472 up kind mill senora
473 up in do smaller ink
474 laurels mind pinko
475 like mil sun pardon
476 me sin up kin dollar
477 rallies mound pink
478 sold link up marine
479 an mid rune kill sop
480 krill sun dopamine
481 raised no pull mink
482 i is rpm annulled ok
483 napkins lured limo
484 on skull remain dip
485 i mud on sparkle lin
486 napkins lured milo
487 on link dump serial
488 i ski me pardon null
489 similar nude plonk
490 on rise kid pullman
491 us link i pardon elm
492 diploma runes link
493 up kill nod marines
494 i mud no sparkle lin
495 loin dreams uplink
496 up lie lord kinsman
497 up in do smaller kin
498 medallion ink spur
499 up norm link ladies
500 i sun men kip dollar
