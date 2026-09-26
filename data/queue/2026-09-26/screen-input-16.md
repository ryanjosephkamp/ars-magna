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

## File 16 of 17: 2727 phrases

### dovecameron:people

input: Dove Cameron
category: people
phrases 1 to 500 of 500

1 covered moan
2 an moved core
3 me do an cover
4 me do rev con a
5 romance dove
6 an cod remove
7 me cod an over
8 me rev on cod a
9 overcame don
10 over came don
11 me do over can
12 one vcr me do a
13 moved cornea
14 me overdo can
15 on med cover a
16 a cod me rev no
17 overdone mac
18 care don move
19 no med cover a
20 on doc me rev a
21 covered noma
22 can do remove
23 over men cod a
24 no doc me rev a
25 overdone cam
26 on made cover
27 on cred move a
28 neo vcr me do a
29 dna overcome
30 cover do name
31 no cred move a
32 me do eon vcr a
33 moaned cover
34 on moved care
35 me rove an doc
36 dev or me con a
37 comrade oven
38 an drove come
39 me don cover a
40 me dev on roc a
41 cavemen door
42 cave don more
43 an cove do rem
44 me dev no roc a
45 cave doormen
46 race don move
47 me rove an cod
48 me dev cor on a
49 overcame nod
50 dna come over
51 over med con a
52 me on doe vcr a
53 daemon cover
54 ever can mood
55 on rem do cave
56 me dev cor no a
57 roamed coven
58 one moved car
59 no rem do cave
60 me no doe vcr a
61 deacon mover
62 a come vendor
63 on eve arm doc
64 me dev orc on a
65 cameo vendor
66 on came drove
67 no eve arm doc
68 me dev orc no a
69 cavemen odor
70 man code over
71 one vcr demo a
72 me on ode vcr a
73 and overcome
74 no came drove
75 on rev do mace
76 me no ode vcr a
77 covered mano
78 card move one
79 no rev do mace
80 dan overcome
81 never do coma
82 on mere do vac
83 romance devo
84 me cover dona
85 even rom cod a
86 vance moored
87 once mad over
88 me do on carve
89 vance roomed
90 over can mode
91 me do no carve
92 vance doomer
93 an coed mover
94 me cave on rod
95 on cared move
96 me cave no rod
97 ever don coma
98 me do on crave
99 a cover demon
100 on eve ram doc
101 more can dove
102 me do no crave
103 no cared move
104 no eve ram doc
105 rave come don
106 ever do on mac
107 me cave donor
108 me rave on doc
109 crane do move
110 no ever do mac
111 over name doc
112 me rave no doc
113 on moved race
114 on rev do acme
115 over can dome
116 no rev do acme
117 can demo over
118 ever do on cam
119 ever doom can
120 me do oven car
121 mean cover do
122 no ever do cam
123 mace don over
124 mod roc even a
125 mood even car
126 on eve mar doc
127 can rode move
128 no eve mar doc
129 over done mac
130 me arc on dove
131 cover do amen
132 me arc no dove
133 care do venom
134 cod men rove a
135 on caved more
136 one rem do vac
137 made cover no
138 me on over cad
139 door even mac
140 me con drove a
141 over done cam
142 me no over cad
143 con moved are
144 me code on var
145 mean cod over
146 me aver on doc
147 con removed a
148 me code no var
149 on move cedar
150 me nod cover a
151 coma end over
152 me aver no doc
153 acre don move
154 me cod on rave
155 can redo move
156 cod mon veer a
157 cedar move no
158 ace mon do rev
159 on cover dame
160 do on came rev
161 on raced move
162 me cod no rave
163 door even cam
164 do no came rev
165 van code more
166 me do core van
167 dame cover no
168 a cover do men
169 no raced move
170 an med rev coo
171 done move car
172 on doe rev mac
173 once over dam
174 no doe rev mac
175 name cod over
176 me do cove ran
177 on dream cove
178 me rode on vac
179 acme don over
180 a con red move
181 car doom even
182 me rode no vac
183 me rave condo
184 me cord oven a
185 no dream cove
186 me corn dove a
187 cream do oven
188 coed mon rev a
189 ever do macon
190 on eve dam roc
191 an doc remove
192 no eve dam roc
193 over came nod
194 an over doc me
195 men cave door
196 on doe rev cam
197 cave end room
198 no doe rev cam
199 never do camo
200 me coo red van
201 macro do even
202 marc do on eve
203 move ran code
204 marc do no eve
205 dam cover one
206 a come don rev
207 mean doc over
208 an med or cove
209 nova come red
210 on eve arc mod
211 on cream dove
212 no eve arc mod
213 race do venom
214 mod con veer a
215 an cover mode
216 me aver on cod
217 doer move can
218 me aver no cod
219 me cave rondo
220 me once do var
221 no cream dove
222 me redo on vac
223 coma do nerve
224 me redo no vac
225 dear con move
226 an cod rom eve
227 on maced over
228 even or do mac
229 an decor move
230 me cod one var
231 move read con
232 me rev on coda
233 mad cover one
234 on ode rev mac
235 maced over no
236 on mod rev ace
237 on moved acre
238 me do oven arc
239 ever don camo
240 no ode rev mac
241 over man deco
242 me rev condo a
243 no moved acre
244 ace mod rev no
245 on move cadre
246 me rove on cad
247 carom do even
248 do on cram eve
249 man cover doe
250 mon ever cod a
251 an cover dome
252 me do con rave
253 cadre move no
254 do eve cram no
255 on cover mead
256 cod nome rev a
257 covered mon a
258 med or on cave
259 me adorn cove
260 nee vcr doom a
261 mead cover no
262 even or do cam
263 care nod move
264 med or no cave
265 cover do mane
266 on ode rev cam
267 an cover demo
268 mac do one rev
269 on armed cove
270 neo vcr demo a
271 cad room even
272 no ode rev cam
273 mood veer can
274 can do me rove
275 dare con move
276 do an rev come
277 move earn doc
278 men or do cave
279 made con over
280 an mod eve roc
281 an credo move
282 cam do one rev
283 me aver condo
284 man roc do eve
285 one cave dorm
286 mod ever con a
287 once move rad
288 me or don cave
289 more done vac
290 me do con aver
291 condom veer a
292 vac do mere no
293 card moo even
294 arm con do eve
295 care moved no
296 eve on mod car
297 corned move a
298 eve no mod car
299 ever coo damn
300 mad con or eve
301 never mad coo
302 dove or me can
303 dna core move
304 me do roc vane
305 even roam doc
306 arm cod on eve
307 vac need room
308 over men doc a
309 on remove cad
310 arm cod no eve
311 cad remove no
312 me don ore vac
313 on carve mode
314 me do cone var
315 an coder move
316 me or done vac
317 no carve mode
318 car do mon eve
319 near cod move
320 a roc end move
321 node move car
322 ram con do eve
323 card moon eve
324 me do roc vena
325 don veer coma
326 nee rom do vac
327 amen cod over
328 neo rem do vac
329 mood even arc
330 me don roe vac
331 once arm dove
332 eve on mad roc
333 man core dove
334 a once mod rev
335 on crave mode
336 mac do on veer
337 camo end over
338 mac do no veer
339 rod even coma
340 me do roc nave
341 dame con over
342 nee vcr do moa
343 no crave mode
344 rom even doc a
345 on carve dome
346 me do vcr aeon
347 van come doer
348 can do rom eve
349 move or dance
350 no or me caved
351 no carve dome
352 me on coed var
353 cave nod more
354 med or one vac
355 man cover ode
356 me no coed var
357 race nod move
358 cam do on veer
359 an code mover
360 a corn mod eve
361 move and core
362 an cove do erm
363 are cod venom
364 cam do no veer
365 mon care dove
366 ram cod on eve
367 on carve demo
368 a cod move ern
369 on crave dome
370 ram cod no eve
371 ever moan doc
372 me or coed van
373 more and cove
374 me nor do cave
375 no carve demo
376 a come nod rev
377 no crave dome
378 a cove don rem
379 one drove mac
380 me or code van
381 modern cove a
382 mar con do eve
383 doom veer can
384 cove or mend a
385 den room cave
386 me cod ore van
387 more coed van
388 me cod roe van
389 ever mad coon
390 a con demo rev
391 cove don mare
392 a coven do rem
393 orca end move
394 me oer don vac
395 over and come
396 erm on do cave
397 rad come oven
398 mar cod on eve
399 on crave demo
400 mar cod no eve
401 ace don mover
402 a cord mon eve
403 oven came rod
404 a vcr need moo
405 no crave demo
406 men rove doc a
407 near doc move
408 a doc move ern
409 macro don eve
410 neve or do mac
411 ado cover men
412 a code rev mon
413 oer moved can
414 erm cove don a
415 acre do venom
416 me end coo var
417 over doc amen
418 me cod neo var
419 me raved coon
420 den move roc a
421 cove rode man
422 mon veer doc a
423 ever moon cad
424 me or cod vane
425 odor even mac
426 a cod omen rev
427 neo moved car
428 neve or do cam
429 arm code oven
430 man doc or eve
431 one drove cam
432 a con dorm eve
433 cane do mover
434 a cove end rom
435 race moved no
436 erm coven do a
437 camo do nerve
438 me or cod vena
439 moved crone a
440 mac do neo rev
441 mover can doe
442 me or cod nave
443 code rove man
444 me oer cod van
445 ever nod coma
446 coda me rev no
447 con moved ear
448 arc do mon eve
449 dam cone over
450 cad me rove no
451 coven do mare
452 a cone mod rev
453 one cram dove
454 me con doe var
455 rod move cane
456 cam do neo rev
457 dona come rev
458 a cod norm eve
459 rave come nod
460 me or nod cave
461 vane come rod
462 men oer do vac
463 mon read cove
464 one mode vcr a
465 once ram dove
466 a doc omen rev
467 carom don eve
468 a cod morn eve
469 mead con over
470 a con mode rev
471 arc doom even
472 one dome vcr a
473 rod name cove
474 me rev and coo
475 odor even cam
476 no or deem vac
477 car demo oven
478 an doc rom eve
479 move ran deco
480 red mon cove a
481 on drove mace
482 man cod or eve
483 armed cove no
484 can mod or eve
485 no drove mace
486 a con dome rev
487 mad cone over
488 me nod ore vac
489 core do maven
490 me coo den var
491 mode rove can
492 rec on moved a
493 cave end moor
494 a con dove rem
495 vena come rod
496 vac do men ore
497 mace nod over
498 nome rev doc a
499 men cave odor
500 me con ode var

### manchestercityfc:companies

input: Manchester City F.C.
category: companies
phrases 1 to 500 of 500

1 my ecstatic french
2 it fence my scratch
3 it french my sec act
4 my eccentric shaft
5 the crime sync fact
6 it french my sec cat
7 mercy shift accent
8 my secret can fitch
9 i act my french sect
10 infects my catcher
11 my fire catch cents
12 i cat my french sect
13 cystic french team
14 my secret chin fact
15 i trench my sec fact
16 infect my catchers
17 my secret inch fact
18 my in sect fetch car
19 fancy stretch mice
20 my sir fetch accent
21 my in chef crest act
22 science craft myth
23 my fire catch scent
24 it catch my sec fern
25 face trench mystic
26 my fit catch screen
27 my in chef crest cat
28 scarcity fetch men
29 it fetch my cancers
30 i french my sec tact
31 cynics matter chef
32 my fine catch crest
33 my in fret catch sec
34 matches infect cry
35 my fetch sit cancer
36 my in sec fetch cart
37 chimney crest fact
38 my nice craft chest
39 my in sec craft tech
40 master fetch cynic
41 its mercy fetch can
42 my in sect cart chef
43 finest mercy catch
44 my secret act finch
45 the cis men cry fact
46 fancy hectic terms
47 my chest fit cancer
48 my sec tic french at
49 cystic french mate
50 my fin catch secret
51 my chic set fret can
52 chance mystic fret
53 my secret cat finch
54 my in ref catch sect
55 cynic matters chef
56 me craft the cynics
57 it fetch my sec narc
58 cynic matter chefs
59 my stitch fence car
60 my in sec retch fact
61 cystic french meat
62 my fit crest chance
63 my sec rich net fact
64 catfish cement cry
65 me crafts the cynic
66 my cent sic her fact
67 yet chic craftsmen
68 my insect fetch car
69 my chic ref test can
70 chemist fry accent
71 my chest infect car
72 my sec tech can rift
73 crane fetch mystic
74 my chic after cents
75 my sec tin fetch car
76 antics fetch mercy
77 my sent arctic chef
78 etc is my french act
79 accent scythe firm
80 my rift catch scene
81 the sec nim cry fact
82 fancy screech mitt
83 his cry cement fact
84 my in sect fetch arc
85 chart fence mystic
86 my chic after scent
87 my chic cent set far
88 mystic trance chef
89 my nice fetch carts
90 my sec chi rent fact
91 chat infects mercy
92 my frets catch nice
93 my sec retch fit can
94 fry catch centimes
95 my chic center fast
96 my ten fetch sic car
97 firemen catch cyst
98 my chic fence start
99 etc is my french cat
100 cynic scream theft
101 my tin screech fact
102 my chic fet rest can
103 arctic fence myths
104 my cents cart chief
105 my sec itch fret can
106 cafe trench mystic
107 my fires catch cent
108 my ten fir catch sec
109 ceramic sync theft
110 my stir catch fence
111 my cis ten fetch car
112 hence mystic craft
113 my screen itch fact
114 my in sec etch craft
115 fame stretch cynic
116 my stench rice fact
117 my cent arc its chef
118 stream fetch cynic
119 my secret cinch fat
120 my rich sect can fet
121 arctic fences myth
122 etc chance my first
123 my crit fetch an sec
124 cystic tame french
125 my sec french attic
126 my tic crest an chef
127 sect craft chimney
128 my chief scent cart
129 my sec cinch fret at
130 cynics cream theft
131 my fries catch cent
132 my sec chit fret can
133 match fester cynic
134 my first cache cent
135 an sec mic try fetch
136 mac rectify stench
137 my fitch set cancer
138 my ten sec craft chi
139 ancestry fetch mic
140 my incest fetch car
141 my sec chic tent far
142 mythic screen fact
143 my chi center facts
144 my sec fitch net car
145 ethnic mercy facts
146 the cry mince facts
147 he craft my cis cent
148 misty fetch cancer
149 my fitch care cents
150 my chic ref scent at
151 chats infect mercy
152 my chic centre fast
153 etc fetch my in cars
154 mystic recant chef
155 my recent chic fast
156 my sec cent itch far
157 cent fry catechism
158 my nice crafts tech
159 my chic fern set act
160 mercy snitch facet
161 my ice trench facts
162 my sec chic rent fat
163 scarce infect myth
164 my fitch scent care
165 my chic cent fret as
166 mac certify stench
167 the cynic met scarf
168 my sec chef tint car
169 act rectify mensch
170 my chef stir accent
171 my chic cent frets a
172 craft theme cynics
173 my set french cacti
174 my chic sent act ref
175 crescent fitch may
176 my tis fetch cancer
177 my net fetch sic car
178 fancy chest metric
179 my tech fits cancer
180 my cis chef tent car
181 cynic cream thefts
182 my chi centers fact
183 my sec chef tin cart
184 minty screech fact
185 my hectic far cents
186 it etch my sec franc
187 cam rectify stench
188 my nice craft techs
189 my chic fen test car
190 mystic canter chef
191 my screech fit cant
192 my chic fern set cat
193 intact chefs mercy
194 my chit screen fact
195 my sec nit fetch car
196 etc craft chimneys
197 the cry infect scam
198 my sec chin fret act
199 matt finch secrecy
200 my chi centre facts
201 my sec inch fret act
202 etc crafts chimney
203 my fitch screen act
204 my sec rift etch can
205 crafts theme cynic
206 my hectic far scent
207 my ten tic scar chef
208 matches fret cynic
209 its cry fence match
210 my chic sent cat ref
211 minty scarce fetch
212 the cry infects mac
213 my net fir catch sec
214 act certify mensch
215 the mice sync craft
216 my ten sec fart chic
217 carmine fetch cyst
218 her cynics met fact
219 my nth recce is fact
220 cat rectify mensch
221 my fet scratch nice
222 my cis chef rent act
223 cam certify stench
224 my ten arctic chefs
225 my sec tin catch ref
226 mystic heft cancer
227 my chic fetters can
228 my ten chef sic cart
229 cat certify mensch
230 my techs fit cancer
231 my chic fen rest act
232 mach rectify cents
233 my chic enter facts
234 my sec cent fit arch
235 cynic creams theft
236 my chic enters fact
237 my fit ern catch sec
238 mach rectify scent
239 my fitch screen cat
240 my cis tech fret can
241 mach certify cents
242 my chic resent fact
243 my cis net fetch car
244 mystic chat fencer
245 my chef nest arctic
246 my sec chin fret cat
247 scenic crafty meth
248 my chief crest cant
249 my sec inch fret cat
250 marc infect scythe
251 my cries fetch cant
252 my sec tic ran fetch
253 craft themes cynic
254 my tech infects car
255 my cis chef rent cat
256 scary fitch cement
257 my chi centres fact
258 my ten sec raft chic
259 mach certify scent
260 my scene itch craft
261 etc fetch my in scar
262 mystic chef nectar
263 my nice retch facts
264 me sit cry fetch can
265 chasm rectify cent
266 my cretins act chef
267 it sync me fetch car
268 mater fetch cynics
269 my insect cart chef
270 my chic fen rest cat
271 craft scythe mince
272 my cite french cast
273 my chic ern set fact
274 crafty chimes cent
275 my chis center fact
276 my sent tic arc chef
277 thence cystic farm
278 my cistern act chef
279 my chic sect net far
280 chasm certify cent
281 my cites french act
282 my cis ten cart chef
283 cyst cremate finch
284 my stench ice craft
285 my chic ten cast ref
286 tach infects mercy
287 the mic crest fancy
288 my far cent sic tech
289 crafty chest mince
290 the cry infects cam
291 my sec chi net craft
292 misty fencer catch
293 my cent carts chief
294 my nth sec rice fact
295 schematic cent fry
296 that mic cry fences
297 my chic ten act serf
298 tamer fetch cynics
299 her cynic met facts
300 my rich sect act fen
301 crafty chime cents
302 my ten hectic scarf
303 my sec cent fit char
304 crafty chime scent
305 my rift chance sect
306 my sec fern itch act
307 crafty stench mice
308 that mics cry fence
309 my sec tech fit narc
310 fancy techs metric
311 my fitch resect can
312 me cry chest fit can
313 crafty cinch meets
314 my scene cart fitch
315 my cis ten catch ref
316 icy tech craftsmen
317 my cite french cats
318 my chic ten cats ref
319 creamy cents fitch
320 my fir accent chest
321 my sec cent fart chi
322 creamy scent fitch
323 my cretins cat chef
324 etc scarf my in tech
325 catchy fences trim
326 my ref catch insect
327 my sec tin fetch arc
328 sic catchy ferment
329 my cite french acts
330 my ten sec arc fitch
331 thence crafty mics
332 my cretin cast chef
333 me fret an chic cyst
334 tram fetches cynic
335 my cistern cat chef
336 my sec tech fin cart
337 cystic trench fame
338 my cites french cat
339 etc carts my in chef
340 mythic fences cart
341 my fitch race cents
342 my chic ten cat serf
343 mythic fence carts
344 my techs infect car
345 my rich sect cat fen
346 mythic cents farce
347 my crescent fat chi
348 i fry me catch cents
349 mechanic cyst fret
350 my tech infect cars
351 it met chefs cry can
352 mart fetches cynic
353 my chis centre fact
354 my chic ref set cant
355 fancy creche mitts
356 my fitch scent race
357 my sec fern itch cat
358 mythic scent farce
359 the cry infect cams
360 etc catch my in serf
361 craft mythic scene
362 my cretin cats chef
363 my sec crit heft can
364 cystic theme franc
365 my nit screech fact
366 etc cart my in chefs
367 cystic chef marten
368 my scene craft chit
369 them cry in sec fact
370 catchy cis ferment
371 etc scratch my fine
372 that sec mic cry fen
373 mach fetters cynic
374 the mics fry accent
375 my chic ref nest act
376 scenic thyme craft
377 fit mercy can chest
378 my chic ten act refs
379 catchy cents fermi
380 my nicer chest fact
381 i fry me catch scent
382 scarf itchy cement
383 my cretin act chefs
384 my ten fetch sic arc
385 accent chesty firm
386 my incest cart chef
387 etc can my fresh tic
388 mystic fen catcher
389 my chic centers fat
390 my sec cent raft chi
391 minty creche facts
392 my chin resect fact
393 my net tic scar chef
394 catchy scent fermi
395 my niche crest fact
396 my sec cent chat fir
397 crescent fitch yam
398 my inch resect fact
399 my sec chic net fart
400 chesty marc infect
401 my tech fit cancers
402 my chic res net fact
403 catchy cement firs
404 my chin erect facts
405 my net chef sic cart
406 crafty techs mince
407 my inch erect facts
408 me cry in fetch cast
409 stretchy fin mecca
410 my ten scarce fitch
411 my chic fen set cart
412 crafty chis cement
413 my crescent fitch a
414 my chic ref nest cat
415 mythic fencer cast
416 my secret aft cinch
417 my chic ten cat refs
418 mystic fern cachet
419 my chef nets arctic
420 my chic ers net fact
421 mythic fencer cats
422 my crit fetches can
423 my sec tet cinch far
424 catchy fencer mist
425 my fitch cares cent
426 my sec chit act fern
427 mythic fencer acts
428 my finch trace sect
429 an chic sect met fry
430 catchy rem infects
431 my sec frantic tech
432 my ten tics arc chef
433 icy craftsmen etch
434 my nicest fetch car
435 my sir etc fetch can
436 cystic fencer math
437 my fitch scare cent
438 my chic fet nest car
439 catch mercy infest
440 my cinch test farce
441 etc catch my in refs
442 scratchy if cement
443 my crit face stench
444 my aft sec rent chic
445 crafty mensch cite
446 its mercy cant chef
447 etc sic my french at
448 catchy mince frets
449 my feet cinch carts
450 my sec nit cart chef
451 cystic fen rematch
452 my cinch erect fast
453 it cry me fetch scan
454 scratchy mince fet
455 my sec ethnic craft
456 i french me act cyst
457 frenetic cyst mach
458 an cyst fetch crime
459 my chic crest an fet
460 accent mythic serf
461 my theft sic cancer
462 my rich sec cant fet
463 chatty fencer mics
464 my cent cart chiefs
465 me cry in fetch cats
466 mystic fencer tach
467 my cretin cat chefs
468 my cis cent rat chef
469 mythic fet cancers
470 my ref catch incest
471 the cis cent fry mac
472 mythic fencer scat
473 the cynic farm sect
474 thy sec mic fret can
475 accent mythic refs
476 my sect enrich fact
477 my sec chi fret cant
478 craft chesty mince
479 my tics trench face
480 my sec chic net raft
481 accents mythic ref
482 my sec tacit french
483 my sec crit fan tech
484 catfish mercy cent
485 my cinch fester act
486 my sec ern itch fact
487 me infect scratchy
488 my stitch fence arc
489 me cry in fetch acts
490 cate french mystic
491 my rice canst fetch
492 my cis ten fetch arc
493 cremate fitch sync
494 my sec tantric chef
495 me cry tits can chef
496 stance mercy fitch
497 my tense chic craft
498 my chic tet can serf
499 infect scythe cram
500 my rich scent facet

### mattlafleur:people

input: Matt LaFleur
category: people
phrases 1 to 500 of 500

1 artful metal
2 full matter a
3 full a term at
4 aflutter lam
5 full matt are
6 all a met turf
7 tearful malt
8 let fault arm
9 full a met art
10 flutter lama
11 let fault ram
12 all at met fur
13 flatter maul
14 full team art
15 rum a tell fat
16 flatter alum
17 are fall mutt
18 rum a let flat
19 latte armful
20 left mural at
21 me turf all at
22 flutter alma
23 mutter fall a
24 tall a met fur
25 aflutter mal
26 all turf meat
27 aft rum tell a
28 at let armful
29 me turf tall a
30 team rat full
31 me tut all far
32 full mate art
33 fell a tut arm
34 let fault mar
35 left a rut lam
36 muller fat at
37 me fat all rut
38 mate rat full
39 fell a tut ram
40 meat rat full
41 fell rum tat a
42 true fat mall
43 mat a rut fell
44 let fat mural
45 me full rat at
46 all fart mute
47 me full tart a
48 full matt ear
49 rum a felt lat
50 true fall mat
51 rum a felt alt
52 flutter lam a
53 rum a fall tet
54 mullet fart a
55 fell a rut tam
56 all tut frame
57 me tat all fur
58 full eat tram
59 fell a tut mar
60 real matt flu
61 flat a rut elm
62 team tar full
63 met full rat a
64 all raft mute
65 rum at fat ell
66 tame all turf
67 me full tar at
68 full eat mart
69 far a mull tet
70 matt a fuller
71 me fall at rut
72 a turf mallet
73 let flu arm at
74 true fall tam
75 met full tar a
76 tau tell farm
77 tell fur mat a
78 late flat rum
79 let turf lam a
80 mullet raft a
81 rut a met fall
82 tate arm full
83 let flu tram a
84 full matt era
85 let flu ram at
86 true flat lam
87 let fur malt a
88 all mute frat
89 let fur lam at
90 fuller mat at
91 me aft all rut
92 team fall rut
93 let flu mar at
94 mute fall art
95 tet full arm a
96 after at mull
97 let ful arm at
98 mate tar full
99 melt flu rat a
100 tea tram full
101 at all rum fet
102 full at mater
103 let ful tram a
104 mute far tall
105 tet full ram a
106 tulle farm at
107 let ful ram at
108 meat tar full
109 rem full tat a
110 uta tell farm
111 a mart let flu
112 let turf lama
113 a tam tell fur
114 matte all fur
115 tet full mar a
116 full art meat
117 melt flu tar a
118 rate mat full
119 let ful mar at
120 tear mat full
121 me rat lat flu
122 left maul art
123 me rat alt flu
124 far at mullet
125 a art melt flu
126 mate fall rut
127 melt ful rat a
128 turf eat mall
129 fret mull at a
130 rue fall matt
131 ell turf mat a
132 mute fall rat
133 felt lam a rut
134 elm fault art
135 a mart let ful
136 ate tram full
137 me tar lat flu
138 meat fall rut
139 me tar alt flu
140 tate ram full
141 melt ful tar a
142 all tat femur
143 at aft rum ell
144 altar met flu
145 all a mutt ref
146 later mat flu
147 rem fall a tut
148 full at tamer
149 me rat lat ful
150 ear fall mutt
151 me rat alt ful
152 full rate tam
153 a art melt ful
154 full tear tam
155 a lat term flu
156 let fart maul
157 a alt term flu
158 left maul rat
159 erm full tat a
160 true aft mall
161 ell farm a tut
162 metal rat flu
163 elm flu rat at
164 late lam turf
165 tall rum a fet
166 let fart alum
167 erm a tut fall
168 flat rat mule
169 a lat melt fur
170 felt maul art
171 a tut mall ref
172 elm fault rat
173 a alt melt fur
174 tate fall rum
175 ell tuft arm a
176 late tram flu
177 left lat a rum
178 mall turf tea
179 left alt a rum
180 rule fat malt
181 me tar lat ful
182 let raft maul
183 all a tuft rem
184 all tart fume
185 me tar alt ful
186 team all turf
187 elf malt a rut
188 teat arm full
189 ell turf tam a
190 era fall mutt
191 far mutt a ell
192 male flat rut
193 lum far let at
194 rum flat tale
195 fet mull art a
196 full tae tram
197 ell fur mat at
198 art felt alum
199 elf lam at rut
200 tall at femur
201 a rut mall fet
202 term fall tau
203 elm flu tar at
204 late malt fur
205 matt a fur ell
206 tamal let fur
207 ell tuft ram a
208 let raft alum
209 elm turf lat a
210 frat maul let
211 fet mull rat a
212 flat at lemur
213 elm turf alt a
214 flat rut meal
215 all a erm tuft
216 real matt ful
217 a lat term ful
218 full tae mart
219 a alt term ful
220 treat lam flu
221 ref mull tat a
222 taut fell arm
223 elm ful rat at
224 tate mar full
225 ell tuft mar a
226 alum let frat
227 mal left rut a
228 fuel malt art
229 tart a flu elm
230 flat arm lute
231 fet mull tar a
232 flute lam art
233 me full art at
234 mall turf ate
235 elm ful tar at
236 felt maul rat
237 a lum left art
238 arm tut fella
239 mer full tat a
240 mall tut fear
241 rum at lat elf
242 latte arm flu
243 rum at alt elf
244 tame art full
245 all a fer mutt
246 mute fall tar
247 lum a felt art
248 mate all turf
249 tart a ful elm
250 art mull fate
251 me att all fur
252 fear all mutt
253 lum a let frat
254 alum rat felt
255 fam rut tell a
256 male tart flu
257 tall at fur me
258 eta tram full
259 flam a rut let
260 mare tat full
261 mal a rut felt
262 term fall uta
263 all a mer tuft
264 mall rut fate
265 lar me tat flu
266 lame flat rut
267 mel flu rat at
268 mull eat fart
269 let turf mal a
270 tulle fat arm
271 tart a mel flu
272 tame tall fur
273 fell rum att a
274 alert mat flu
275 let fart a lum
276 rate fat mull
277 tel flu arm at
278 tear fat mull
279 left lum rat a
280 teal flat rum
281 a att full rem
282 fuel malt rat
283 let raft a lum
284 full mart tea
285 tel turf lam a
286 teat ram full
287 mel flu tar at
288 flute lam rat
289 felt lum rat a
290 left maul tar
291 tel flu tram a
292 tall rut fame
293 tel flu ram at
294 far mull tate
295 tel fur malt a
296 metal tar flu
297 full a att erm
298 fall tut mare
299 fer a tut mall
300 lure fat malt
301 left lum tar a
302 lama rut felt
303 tel fur lam at
304 flat tar mule
305 elf lum tart a
306 tame rat full
307 lar me tat ful
308 metal art flu
309 mel ful rat at
310 tall fume art
311 mel flat a rut
312 fate rat mull
313 tart a mel ful
314 turf tae mall
315 tel flu mar at
316 flat art mule
317 tel flat a rum
318 felt mural at
319 mal at rut elf
320 mull eat raft
321 tel ful arm at
322 elm fault tar
323 felt lum tar a
324 real lam tuft
325 elm flu art at
326 aft at muller
327 mel ful tar at
328 rum tall feat
329 let fur mal at
330 taut fell ram
331 lum a fret lat
332 fatter a mull
333 tel ful tram a
334 left alum art
335 lum a fret alt
336 flat ram lute
337 tel ful ram at
338 lame tart flu
339 fer mull tat a
340 tall fur meat
341 tet fur mall a
342 mull eat frat
343 fam at rut ell
344 teat fall rum
345 me arf all tut
346 ute farm tall
347 arf a mull tet
348 ram tut fella
349 elf lum rat at
350 rate malt flu
351 tel ful mar at
352 tear malt flu
353 elm ful art at
354 fuel lam tart
355 ell fur tam at
356 tale lam turf
357 elf lum tar at
358 full mart ate
359 met flu lar at
360 far malt lute
361 mer fall a tut
362 tea fart mull
363 elm fur lat at
364 latte ram flu
365 att mer full a
366 altar met ful
367 elm fur alt at
368 fella tat rum
369 lum tel far at
370 later mat ful
371 rem flu lat at
372 mat far tulle
373 rem flu alt at
374 fell tram tau
375 ref mull att a
376 tale tram flu
377 mel turf lat a
378 alarm tut elf
379 mel turf alt a
380 fume rat tall
381 erm flu lat at
382 ultra fat elm
383 erm flu alt at
384 fella mat rut
385 met ful lar at
386 felt maul tar
387 lum arf let at
388 rum felt tala
389 rem ful lat at
390 flu alarm tet
391 rem ful alt at
392 mall turf eta
393 elf lum art at
394 tulle fat ram
395 mal tel turf a
396 metal rat ful
397 erm ful lat at
398 tale malt fur
399 erm ful alt at
400 left alum rat
401 lum tel fart a
402 emu fall tart
403 mel flu art at
404 later tam flu
405 lum tel raft a
406 teat mar full
407 elf lar a mutt
408 tea raft mull
409 ell arf a mutt
410 lat arm flute
411 me flu lat art
412 matt flu earl
413 me flu alt art
414 let fatal rum
415 mel ful art at
416 latte lam fur
417 tel flu mart a
418 alt arm flute
419 elm tuft lar a
420 alum tar felt
421 att fer mull a
422 late tram ful
423 ref lum lat at
424 all tuft mare
425 ref lum alt at
426 ate fart mull
427 mel fur lat at
428 mall tut fare
429 mel fur alt at
430 late mart flu
431 a lum tel frat
432 realm tat flu
433 me ful lat art
434 frat mull tea
435 me ful alt art
436 ream tat full
437 me att lar flu
438 ute fall tram
439 me fur lat alt
440 fare all mutt
441 tel ful mart a
442 flu alter tam
443 mer flu lat at
444 fear tat mull
445 mer flu alt at
446 taut fell mar
447 me att lar ful
448 tam rut fella
449 fet lum lar at
450 art mull feat
451 mer ful lat at
452 emu fart tall
453 mer ful alt at
454 rem fault lat
455 tel flam a rut
456 fell tram uta
457 tel fur mal at
458 fuel malt tar
459 fer lum lat at
460 lat turf meal
461 fer lum alt at
462 rem fault alt
463 mel tuft lar a
464 alt turf meal
465 lum arf tel at
466 ute fall mart
467 flat mar lute
468 flute lam tar
469 teal lam turf
470 left lama rut
471 mar tut fella
472 treat lam ful
473 ate raft mull
474 mall rut feat
475 latte mar flu
476 tame tar full
477 melt artful a
478 fall tut ream
479 fate tar mull
480 teal tram flu
481 artful at elm
482 far mull teat
483 team tall fur
484 latte arm ful
485 frat mull ate
486 emu raft tall
487 rum flat tael
488 mat ultra elf
489 teal malt fur
490 lute fart lam
491 ute fart mall
492 mull tae fart
493 tulle fat mar
494 tala term flu
495 tau fret mall
496 male tart ful
497 flue malt art
498 tame fall rut
499 feat rat mull
500 tater lam flu

### thelifeofashowgirl:titles

input: The Life of a Showgirl
category: titles
phrases 1 to 500 of 500

1 whose hello graffiti
2 her will fish footage
3 i will her off hostage
4 fish follow heritage
5 the will ooh giraffes
6 he go of this firewall
7 graffiti holes whole
8 i hollow the giraffes
9 he got of his firewall
10 while fight seafloor
11 whose off alright lie
12 i hog of this farewell
13 while fool gearshift
14 i grow those halflife
15 it hog of his farewell
16 heritage showoff ill
17 her wish fill footage
18 i hog of the firewalls
19 whole foil gearshift
20 i fight of wholesaler
21 i hogs of the firewall
22 foe hightail flowers
23 his gift ooh farewell
24 his off ill go weather
25 eight hoof firewalls
26 who realise of flight
27 i glow his off leather
28 footfalls weigh hire
29 who log his afterlife
30 he fog to his firewall
31 eight hoofs firewall
32 i weigh her footfalls
33 fee of his alright low
34 goiter show halflife
35 fragile whole of shit
36 i golf his hot welfare
37 halflife weigh roots
38 alright wife of holes
39 i fog his hot farewell
40 footfalls weigh heir
41 he goof this firewall
42 his hit go of farewell
43 halflife weighs root
44 fragile while of shot
45 i golf his low feather
46 foes hightail flower
47 his tower go halflife
48 fill go of his weather
49 allergies whiff hoot
50 fragile fish to whole
51 i hew the off gorillas
52 fragile whistle hoof
53 wish the fragile fool
54 fee of his alright owl
55 seafloor weigh filth
56 its high fool welfare
57 who is of alright feel
58 halflife weigh torso
59 whose off alright lei
60 weather fog of his ill
61 galleries whiff hoot
62 this fig ooh farewell
63 i wolf the fragile hos
64 halflife weigh roost
65 fragile hotel of wish
66 is of the fragile howl
67 eights hoof firewall
68 i off right wholesale
69 i feel of alright show
70 fragile filet whoosh
71 high foot is farewell
72 i flow the fragile hos
73 foes hightail fowler
74 his hoof get firewall
75 his igloo flew the far
76 fewer fools hightail
77 goo with his freefall
78 i hog his two freefall
79 halflife reshoot wig
80 the hill woo giraffes
81 he hog of its firewall
82 legislator hoe whiff
83 the goo fish firewall
84 i flog his hot welfare
85 wholesale giro fifth
86 off will hire hostage
87 woe of his alright elf
88 igloo whiff leathers
89 his alright woof feel
90 hog is of the firewall
91 hooter swig halflife
92 its whore go halflife
93 i will he off shortage
94 halflife stooge whir
95 alright foes of while
96 i flog his low feather
97 folio whereas flight
98 his off wealthier log
99 his left goo wire half
100 hellish fig footwear
101 fragile whole of hits
102 who of his fragile let
103 he offwhite gorillas
104 he foil his afterglow
105 we is off alright hole
106 follow gearshift hie
107 his fill goof weather
108 his lit hog of welfare
109 halflife shooter wig
110 who fills of heritage
111 i fowl the fragile hos
112 afterlife highs wool
113 fragile while of host
114 i off so alright wheel
115 welfare folio thighs
116 the figs ooh firewall
117 we eff his alright loo
118 graffiti hollows hee
119 rig to whose halflife
120 wee of its floral high
121 halflife hooters wig
122 off heir will hostage
123 i fog the fallow heirs
124 gearshift lowlife oh
125 alright wise off hole
126 his half goo wire felt
127 graffiti hellos howe
128 their sow go halflife
129 i holes of alright few
130 halflife withers goo
131 alright few of helios
132 i hires the fallow fog
133 halflife hooter wigs
134 the fig ooh firewalls
135 his fragile of the low
136 footwear fille highs
137 his foil golf weather
138 owe of his alright elf
139 halflife goiter whos
140 this wig ooh freefall
141 he is alright fool few
142 flashlight roofie we
143 earliest wolf of high
144 alright few is of hole
145 halflife owes righto
146 the oil howl giraffes
147 this fragile low of he
148 firewalls heigh foot
149 she fool alright wife
150 i flee of alright show
151 halflife weighs toro
152 alright foe show life
153 i of the fragile howls
154 footfalls heigh wire
155 her wish fog fellatio
156 who is off alright lee
157 gearshift fie hollow
158 show the fragile foil
159 his hilt go of welfare
160 halflife weigh toros
161 alright few ooh files
162 his hit log of welfare
163 footwear heigh fills
164 alright few shoo life
165 the half loo fires wig
166 heritage hollows iff
167 alright feel woo fish
168 i off alright lee show
169 hightail lowe offers
170 alright few of holies
171 i fog the fallow shire
172 offstage hillier who
173 alright self ooh wife
174 the rash wife foil log
175 footfalls heigh weir
176 earliest flow of high
177 he go shit of firewall
178 whet foolish fragile
179 high fell is footwear
180 she oil of alright few
181 offstage hillier how
182 his whir fell footage
183 i go who fill feathers
184 halflife woes righto
185 fragile wish ooh left
186 i heist her fallow fog
187 halflife goiter hows
188 alright few ooh flies
189 i off hills go weather
190 wholesale righto iff
191 her fig show fellatio
192 his fragile wolf to he
193 the fragile wool fish
194 he lot of fragile wish
195 who realise off light
196 fish to he go firewall
197 alright files of howe
198 he soil of alright few
199 off ill show heritage
200 fog for his lite whale
201 afterlife go his howl
202 whose hit fail for leg
203 he fools alright wife
204 his hire towel of flag
205 who fathers of gillie
206 his fragile flow to he
207 feather goof his will
208 i shit who go freefall
209 well hit ooh giraffes
210 she go hit of firewall
211 alright flies of howe
212 i see off alright howl
213 earliest low off high
214 his fragile of the owl
215 this ego row halflife
216 i hill for few hostage
217 high fool sit welfare
218 i off we hill shortage
219 alright wish fool fee
220 i feel of alright whos
221 fragile hole fish two
222 he sow of alright life
223 this hog foil welfare
224 i short we go halflife
225 i were high footfalls
226 i will hog of feathers
227 she ooh well graffiti
228 this fragile owl of he
229 his toe grow halflife
230 he go hit of firewalls
231 its high woo freefall
232 we off he hit gorillas
233 who gore its halflife
234 his half goo felt weir
235 fragile while of tosh
236 his worth ego fail elf
237 too grew his halflife
238 ewe of its floral high
239 fragile wish ooh felt
240 who is fill go feather
241 the fig shoo firewall
242 i go who rest halflife
243 of this fragile whole
244 i of whose alright elf
245 light hoof is welfare
246 i log while of fathers
247 alright wife fool hes
248 go of his het firewall
249 his elf whirl footage
250 i worst he go halflife
251 his twig ooh freefall
252 wish of i golf leather
253 alright wifes of hole
254 wig of i fathers hello
255 welfare fight his loo
256 his heir towel of flag
257 the rigs woo halflife
258 i go show fill feather
259 off hos will heritage
260 i hill of few shortage
261 alright fish fool wee
262 he shit of fragile low
263 alright lies off howe
264 wog is to her halflife
265 farewell goof his hit
266 he is eight for fallow
267 his glow foil feather
268 i will he goof fathers
269 fragile hole fit show
270 few of he hit gorillas
271 high foe of stairwell
272 he slow of fragile hit
273 fragile fool with hes
274 i shit hog of farewell
275 of whose alright life
276 who is off alright eel
277 his fig hoot farewell
278 i sigh of hot farewell
279 his git hoof farewell
280 i log who fathers life
281 off hill wire hostage
282 we of his alright floe
283 alright show file foe
284 hew of his fragile lot
285 fill show of heritage
286 who is hit go freefall
287 alright few shoo file
288 i go who fills feather
289 alright few oohs life
290 he go hits of firewall
291 his alright woof flee
292 i go so threw halflife
293 his gill feather woof
294 i show off alright eel
295 i go fifth wholesaler
296 her aloof lit sigh few
297 this foe hog firewall
298 who go shirt fail feel
299 his foil flog weather
300 fish for it wheel goal
301 wholesale fight for i
302 he fish to fragile low
303 this fog hoe firewall
304 the fragile lis of who
305 earliest fowl of high
306 i hit show go freefall
307 we off alright helios
308 he oils of alright few
309 high foes to firewall
310 i flesh of alright woe
311 high foils to welfare
312 i eff so alright whole
313 fragile let hoof wish
314 i ooh alright few self
315 i off shallower eight
316 he will fir of hostage
317 earliest owl off high
318 she hit of fragile low
319 high foe to firewalls
320 sigh til her aloof few
321 i whoosh fragile left
322 hog to i fish farewell
323 shot wire go halflife
324 who to his fragile elf
325 wholesale fig for hit
326 i of the shallower fig
327 healthier wolf is fog
328 heather go off is will
329 it fools high welfare
330 i wolf fish go leather
331 off low realise thigh
332 he show of fragile lit
333 alright lewis off hoe
334 i wills off go heather
335 we off alright holies
336 i off hill go weathers
337 i showoff alright lee
338 hair gift of whose ell
339 we hightail for floes
340 i howl life go fathers
341 well hes ooh graffiti
342 he foil so alright few
343 wealthier fish of log
344 i slot high of welfare
345 his goth foil welfare
346 whose hit fail for gel
347 rose go with halflife
348 his fragile fowl to he
349 we hoofs alright life
350 i hits who go freefall
351 alright loo see whiff
352 i row she got halflife
353 worth ego is halflife
354 fish of i glow leather
355 fragile holes of whit
356 he off so alright wile
357 i goes worth halflife
358 i golf who lie fathers
359 off hit rig wholesale
360 i flow fish go leather
361 off whirl lie hostage
362 hills of i fog weather
363 alright lee fish woof
364 will of i fogs heather
365 i foot high farewells
366 i off he hog stairwell
367 healthier flow is fog
368 he sow of alright file
369 weather golf fish oil
370 i is wolf golf heather
371 his hilt goof welfare
372 i row high of leaflets
373 he shoo well graffiti
374 we lie off right shoal
375 light woof feel hairs
376 i fee of alright howls
377 her wog fish fellatio
378 i hit hogs of farewell
379 off will hie shortage
380 it row she go halflife
381 two heirs go halflife
382 i logs he flower faith
383 who file fragile shot
384 he hit so fragile wolf
385 wolf this fragile hoe
386 he shit of fragile owl
387 wholesale riff go hit
388 i lot highs of welfare
389 afterlife hog his low
390 i off shill go weather
391 fragile hole of whist
392 its ago riff hew hello
393 alright show foil fee
394 his low ghee loft fair
395 the fig oohs firewall
396 fog for his lite wheal
397 fragile fool with she
398 he is row got halflife
399 this low holier gaffe
400 i is flow golf heather
401 her gist woo halflife
402 i off wish log leather
403 two hires go halflife
404 i fees of alright howl
405 his two ogre halflife
406 it free high fools law
407 alright wile off shoe
408 i offs will go heather
409 eight hos of firewall
410 wolf of i sigh leather
411 i whoosh fragile felt
412 he is goth of firewall
413 halflife gore his two
414 she rig while of float
415 high lilo off sweater
416 he hit so fragile flow
417 he files alright woof
418 i swill off go heather
419 healthier figs of low
420 i loft so high welfare
421 this fragile fool hew
422 we file of alright hos
423 his wig hoot freefall
424 he is alright wolf foe
425 hot wires go halflife
426 his fog tile for whale
427 she file alright woof
428 we lie off right halos
429 flow this fragile hoe
430 i off we sleigh harlot
431 his hole if afterglow
432 shrew to i go halflife
433 alright foe of whiles
434 fill of i hogs weather
435 alright life sew hoof
436 wish of i flog leather
437 fit sigh ooh farewell
438 he hits of fragile low
439 fragile shoe wolf hit
440 i go who fathers fille
441 we hightail off loser
442 he fish to fragile owl
443 alright elf shoo wife
444 flow of i sigh leather
445 the giro sow halflife
446 i light hos of welfare
447 fragile heist of howl
448 i fool alright few hes
449 his gilt hoof welfare
450 it is who hog freefall
451 he hole slow graffiti
452 alright howl is of fee
453 off hell hog wisteria
454 he is alright flow foe
455 too swig her halflife
456 i welsh of alright foe
457 alright fish fee wool
458 she go whole fit flair
459 of whose alright file
460 she go whole fit frail
461 alright isle off howe
462 i hill he fog software
463 hollow fig is feather
464 he sow off alright lie
465 fragile hit woo flesh
466 i hits hog of farewell
467 who hole til giraffes
468 i log who file fathers
469 i off healthier glows
470 he sit of fragile howl
471 sore go with halflife
472 she hit of fragile owl
473 his ogre tow halflife
474 i rows he got halflife
475 off weir hill hostage
476 he oil while of grafts
477 alright les hoof wife
478 its fragile howl of he
479 fragile shoe flow hit
480 i show it hog freefall
481 two shire go halflife
482 i flee of alright whos
483 alright few oohs file
484 who hit of fragile les
485 who lose alright fife
486 it rows he go halflife
487 fragile howe fish lot
488 i fill who fathers ego
489 his fragile fool whet
490 i hog he fill software
491 its hoe grow halflife
492 hos with i go freefall
493 her wig soot halflife
494 i so grow the halflife
495 its hog wore halflife
496 welfare of high is lot
497 other wog is halflife
498 wish to i hog freefall
499 alright fish fool ewe
500 he sew off alright oil

### finneganswake:titles

input: Finnegans Wake
category: titles
phrases 1 to 500 of 500

1 fans weakening
2 an sneaking few
3 an new safe king
4 an in gen ask few
5 an fawning seek
6 an gas knew fine
7 we fags an in ken
8 we fanning sake
9 we knife an sang
10 we fans an in keg
11 weeks fanning a
12 an week sign fan
13 we fan an in kegs
14 we faking senna
15 an gen was knife
16 i fags an new ken
17 week fanning as
18 an week sing fan
19 i fans an new keg
20 waking seen fan
21 we snag an knife
22 an new ken is fag
23 fangs weaken in
24 an gin knew safe
25 i fan an new kegs
26 fawn ask engine
27 an king see fawn
28 an new keg is fan
29 fang weakens in
30 fine a knew sang
31 i snag an few ken
32 fawn an seeking
33 an sane few king
34 an few nag is ken
35 fan wake ensign
36 we nags an knife
37 we fag an in kens
38 fangs wake nine
39 an gene was fink
40 i sank an few gen
41 easing knew fan
42 an sag knew fine
43 an in keg was fen
44 fan weaken sign
45 we faking an sen
46 i nags an few ken
47 wanking an fees
48 an news gin fake
49 few ken sign an a
50 new snake fagin
51 an gen saw knife
52 i fag an new kens
53 fang snake wine
54 an in weeks fang
55 few ken sing an a
56 fawning a knees
57 an ken wing safe
58 an new a fin kegs
59 fan wank seeing
60 new a knife sang
61 an new a fins keg
62 nine weak fangs
63 an in week fangs
64 an few nan is keg
65 new sneak fagin
66 an age knew fins
67 an new as fin keg
68 fang sneak wine
69 an weeks gin fan
70 few ken gas an in
71 fine waken sang
72 an wink see fang
73 an few kan is gen
74 insane fag knew
75 fake an new sign
76 i nag an few kens
77 fang wakes nine
78 an week gin fans
79 i fag an sewn ken
80 nan knife wages
81 fine a knew snag
82 an in keg saw fen
83 sienna knew fag
84 an ages knew fin
85 an in ken sew fag
86 safe waning ken
87 an king wee fans
88 i fan an sewn keg
89 fan wan seeking
90 new sing an fake
91 an in keg sew fan
92 anew knife sang
93 an week sin fang
94 few gen skin an a
95 fake wan ensign
96 an knees win fag
97 i gan an few kens
98 fan sawing knee
99 gas an new knife
100 we gas an kin fen
101 anise knew fang
102 new in fake sang
103 few gen sink an a
104 fake gnaws nine
105 an new sneak fig
106 we fag an kin sen
107 fawning as knee
108 an seek wing fan
109 i fan an skew gen
110 fawn gain knees
111 an seek win fang
112 few ken gin an as
113 fan sawing keen
114 an wen sign fake
115 an sewn a fin keg
116 fine waken snag
117 an in fawn geeks
118 few ken sag an in
119 fang wake nines
120 an week fin sang
121 we sign ken fan a
122 fawning as keen
123 an king swan fee
124 i knew gen fans a
125 awning seek fan
126 an ken gains few
127 few ken gins an a
128 knife wean sang
129 an wen sing fake
130 we sing ken fan a
131 fans weaken gin
132 an geek win fans
133 few gen ink an as
134 fine snake gnaw
135 an ken swag fine
136 few kens gin an a
137 wank seen fagin
138 an gene saw fink
139 an wan keg is fen
140 fen awaken sign
141 an ken snag wife
142 an skew a fin gen
143 fan weakens gin
144 an wink seen fag
145 an new ken if gas
146 knife wane sang
147 an geeks win fan
148 we ask in fan gen
149 fang weaken sin
150 safe nag knew in
151 we sag an kin fen
152 fine sneak gnaw
153 an wen gas knife
154 i knew gen fan as
155 anew snag knife
156 an weeks fag inn
157 we gas ken fan in
158 nee waking fans
159 an sage knew fin
160 an skew a gin fen
161 seeing fawn kan
162 an keg swan fine
163 i nag an skew fen
164 sang weaken fin
165 fine as knew nag
166 few gen inks an a
167 nine askew fang
168 fine a knew nags
169 i ask new fan gen
170 swain keen fang
171 an knees fan wig
172 we skin gen fan a
173 fine waken nags
174 in sea knew fang
175 i gas new fan ken
176 fans wank genie
177 an wake sing fen
178 i gan an skew fen
179 nan feigns wake
180 in week fan sang
181 we gin ken fans a
182 fan snaking wee
183 an week fags inn
184 i was ken fan gen
185 fags waken nine
186 an kings wee fan
187 we snag i fan ken
188 weaning ask fen
189 an new sage fink
190 we sink gen fan a
191 fakes gnaw nine
192 nine a knew fags
193 we nag i fans ken
194 fake waning sen
195 an knee win fags
196 i snag a knew fen
197 fan swank genie
198 we nag an knifes
199 we is ken nag fan
200 fen wean asking
201 an ken wags fine
202 we gin ken fan as
203 wan feign snake
204 an saw feign ken
205 i sank we fan gen
206 fagin swan knee
207 an keen win fags
208 an ken as new fig
209 fagin wan knees
210 an king wan fees
211 we gan i fans ken
212 fags weaken inn
213 an gen sank wife
214 we ink gen fans a
215 fag weakens inn
216 an geek wins fan
217 we ask in nag fen
218 fake nan sewing
219 an ken wine fags
220 we nags i fan ken
221 fawning kan see
222 new nag ask fine
223 i nag as knew fen
224 sea wanking fen
225 an gen wins fake
226 i nags a knew fen
227 knife wean snag
228 an keg wine fans
229 an as if knew gen
230 safe awning ken
231 an wee skin fang
232 an new ken if sag
233 anew nags knife
234 an ken nags wife
235 we is ken gan fan
236 fagin swan keen
237 an gen wink safe
238 we is ken fag nan
239 fagin snake wen
240 new king fan sea
241 an ken we is fang
242 waking sane fen
243 an sen wing fake
244 we sag ken fan in
245 senna wag knife
246 an knee fans wig
247 we is keg fan nan
248 fen wane asking
249 an wank sign fee
250 i saw ken fan gen
251 fawn gains knee
252 an kens gain few
253 an inn as few keg
254 geeks fawn nina
255 an knee wins fag
256 an gen as kin few
257 sane fagin knew
258 an week gins fan
259 gen is a knew fan
260 fawn gaines ken
261 an kegs wine fan
262 we gins ken fan a
263 knife wane snag
264 an wink gee fans
265 we ask in gan fen
266 fan wank genies
267 an ane few kings
268 i ask new nag fen
269 fawn gains keen
270 we feigns an kan
271 we snag ken fin a
272 fawning sea ken
273 nine as knew fag
274 we ink gen fan as
275 nan feign wakes
276 an wig keen fans
277 new ken in fags a
278 fagin sneak wen
279 an wank sing fee
280 we gin kens fan a
281 fake gnaw nines
282 we gan an knifes
283 we skin a nag fen
284 waning sank fee
285 an ewe fans king
286 i gan as knew fen
287 anew faking sen
288 an keen wins fag
289 in new keg fans a
290 fake senna wing
291 an kegs wan fine
292 we fan as kin gen
293 awning sank fee
294 in news nag fake
295 we nag ken fins a
296 fan weaken gins
297 few snake nag in
298 we is gen fan kan
299 nan fink sewage
300 an skin gee fawn
301 i sag new fan ken
302 fang weaken ins
303 fine nag was ken
304 we nag i fan kens
305 snag weaken fin
306 keen wings fan a
307 in new kegs fan a
308 ken fawn easing
309 an knee fan wigs
310 in gas a knew fen
311 fawn sank genie
312 an sake wing fen
313 i was ken nag fen
314 gen awaken fins
315 an wank seen fig
316 we sank a fin gen
317 gen awakens fin
318 an sine knew fag
319 an ken if was gen
320 inane fags knew
321 an gen win fakes
322 i ask new gan fen
323 figs weaken nan
324 an wee sink fang
325 we sink a nag fen
326 nag weakens fin
327 an safe king wen
328 new ken as in fag
329 knife wean nags
330 an nag sew knife
331 i ask wen fan gen
332 fee snaking wan
333 few sneak nag in
334 we skin a gan fen
335 fang wank seine
336 new sen faking a
337 we nag ken fin as
338 nag weaken fins
339 an wigs keen fan
340 we nags ken fin a
341 fig weakens nan
342 an wing sank fee
343 an news i fag ken
344 fan weak ensign
345 few snake an gin
346 in keg as new fan
347 fain gnaw knees
348 in wank see fang
349 i gas wen fan ken
350 fink wage senna
351 an ken fag swine
352 we inks gen fan a
353 knife wane nags
354 an sang wink fee
355 we gan ken fins a
356 fan waken singe
357 new nine ask fag
358 an news i fan keg
359 weak nines fang
360 an kings wan fee
361 we gan i fan kens
362 sane knife gnaw
363 an wag seen fink
364 we sank a gin fen
365 knifes wage nan
366 sane in knew fag
367 an gas i knew fen
368 nee asking fawn
369 we snake in fang
370 i was ken gan fen
371 fen awakens gin
372 an week fag inns
373 i sank we nag fen
374 fag weaken inns
375 an winks gee fan
376 few gen in sank a
377 fine senna gawk
378 an swine fan keg
379 we nag sen fink a
380 fan snaking ewe
381 an ken fin wages
382 we sink a gan fen
383 fain wank genes
384 few sneak an gin
385 we ink a snag fen
386 sen faking wane
387 an gawk seen fin
388 we gan ken fin as
389 we sneaking fan
390 an gen wake fins
391 an sen i knew fag
392 nags weaken fin
393 keen a win fangs
394 new kens in fag a
395 kan fees awning
396 an knee swig fan
397 a knew as fin gen
398 fag waken nines
399 an sink gee fawn
400 we nag kens fin a
401 fain swank gene
402 in gene ask fawn
403 an as we fink gen
404 see fan wanking
405 in news gan fake
406 i sank we gan fen
407 fines waken nag
408 few snake gan in
409 i saw ken nag fen
410 few kens angina
411 an new snake fig
412 we gan sen fink a
413 keg fawn sienna
414 an sen gawk fine
415 an ken if saw gen
416 fake awning sen
417 an kens nag wife
418 new a as fink gen
419 fen gaines wank
420 we sneak in fang
421 a is nag knew fen
422 fagin sawn knee
423 fink age an news
424 i sew ken nag fan
425 fain gnaws knee
426 an kan swing fee
427 we ask an gen fin
428 anew nag knifes
429 an kan fee wings
430 we ink as nag fen
431 fang waken sine
432 an king sawn fee
433 we ink a nags fen
434 waning sake fen
435 wan king see fan
436 is an ken gan few
437 fagin sawn keen
438 in gen wake fans
439 a gin as knew fen
440 fain gnaws keen
441 an keen swig fan
442 an ken we gas fin
443 nee swan faking
444 an nag skew fine
445 we nag as kin fen
446 ane few snaking
447 sag an new knife
448 in nan as few keg
449 knew fan gaines
450 an new ages fink
451 an a news fin keg
452 fen waken gains
453 an swan gee fink
454 we gan kens fin a
455 ensign fawn kea
456 an sang wee fink
457 new gas ken fin a
458 fig waken senna
459 in ken fan wages
460 we is kan nag fen
461 easing wank fen
462 few sneak gan in
463 an a sen knew fig
464 fan waning seek
465 fine ken gnaws a
466 i saw ken gan fen
467 fagin waken sen
468 an ewe fan kings
469 we ask an gin fen
470 genies fawn kan
471 an wee ink fangs
472 an ken we sin fag
473 awe snaking fen
474 an seek gin fawn
475 i wan gen ask fen
476 faking ane news
477 in weeks fag nan
478 a ask new gin fen
479 fen awaken gins
480 in gawk seen fan
481 sewn ken in fag a
482 fees waking nan
483 fine keg was nan
484 new sin ken fag a
485 anew feigns kan
486 an ken wines fag
487 new ken is a fang
488 anew gan knifes
489 an keg sawn fine
490 an wen as fin keg
491 skew inane fang
492 an knee swan fig
493 we sin an keg fan
494 knifes wean nag
495 an knees wan fig
496 an wan sen if keg
497 faking wan seen
498 nee king was fan
499 i sew ken gan fan
500 sing fan weaken

### rubyrose:people

input: Ruby Rose
category: people
phrases 1 to 42 of 42

1 your rebs
2 us err boy
3 ruby sore
4 us rob rye
5 surer boy
6 so err buy
7 bury rose
8 us orb rye
9 ruby eros
10 so rub rye
11 bury sore
12 yes or rub
13 rosy rube
14 by err sou
15 burro yes
16 so bur rye
17 bury eros
18 by rue ors
19 berry sou
20 yes or bur
21 rubs yore
22 rye or bus
23 buyer ors
24 res or buy
25 buoys err
26 ers or buy
27 reb yours
28 our res by
29 buyers or
30 our ers by
31 rosy uber
32 rye or sub
33 brr youse
34 by or user
35 by or ruse
36 bru or yes
37 ser or buy
38 us bro rye
39 our by ser
40 us bor rye
41 so bru rye
42 by sure or

### backrooms:titles

input: Backrooms
category: titles
phrases 1 to 185 of 185

1 back moors
2 so back rom
3 backs room
4 a mob rocks
5 scram book
6 so rock bam
7 mock boars
8 as mob rock
9 cram books
10 so mock bar
11 sack broom
12 a mobs rock
13 marc books
14 so rob mack
15 racks boom
16 as rob mock
17 backs moor
18 so mark cob
19 rack bosom
20 so mob rack
21 scam brook
22 a rob mocks
23 mac brooks
24 cars mob ok
25 rack booms
26 a rob smock
27 croaks mob
28 so mock bra
29 cam brooks
30 car mobs ok
31 smack boor
32 so comb ark
33 bam crooks
34 so cork bam
35 ambo rocks
36 scam rob ok
37 croak mobs
38 a robs mock
39 cams brook
40 so arm bock
41 cask broom
42 as mob cork
43 roams bock
44 a mob corks
45 boar mocks
46 scar mob ok
47 boar smock
48 so orb mack
49 macs brook
50 a orbs mock
51 okra combs
52 a mobs cork
53 ambo corks
54 cob ok arms
55 sambo rock
56 as orb mock
57 bark cosmo
58 a orb mocks
59 sark combo
60 a comb kors
61 bora mocks
62 cams rob ok
63 bora smock
64 a orb smock
65 sambo cork
66 so ram bock
67 kora combs
68 mac robs ok
69 soma brock
70 marc sob ok
71 ark coombs
72 scam orb ok
73 comas bork
74 cob ok mars
75 cam robs ok
76 roc ask mob
77 mac orbs ok
78 macs rob ok
79 a combs kor
80 so mar bock
81 crab ok som
82 as comb kor
83 som or back
84 cam orbs ok
85 crab ok mos
86 ok cram sob
87 ark mob cos
88 bos ok marc
89 mos or back
90 arcs mob ok
91 cams orb ok
92 ras comb ok
93 cabs ok rom
94 arc mobs ok
95 scab ok rom
96 car mob kos
97 ars comb ok
98 rom ask cob
99 ok cram bos
100 cob ok rams
101 macs orb ok
102 mob or sack
103 mac rob kos
104 sock or bam
105 cam rob kos
106 cob or mask
107 mock or abs
108 sob or mack
109 mac sob kor
110 mob or cask
111 kos arm cob
112 mac orb kos
113 mock or bas
114 rom cab kos
115 cam sob kor
116 arc mob kos
117 som cab kor
118 comb or ask
119 bos or mack
120 mos cab kor
121 cam orb kos
122 sac mob kor
123 kos ram cob
124 bock or mas
125 kos mar cob
126 as bock rom
127 as bro mock
128 a bro mocks
129 a bro smock
130 a bros mock
131 scam bro ok
132 carb ok som
133 carb ok mos
134 bam cos kor
135 a brock som
136 mac bros ok
137 a brock mos
138 cams bro ok
139 cam bros ok
140 macs bro ok
141 ark cob som
142 as bor mock
143 mac bos kor
144 ska or comb
145 bam orcs ok
146 a bor mocks
147 ark cob mos
148 a bor smock
149 bam roc kos
150 cam bos kor
151 cabs ok mor
152 scam bor ok
153 scab ok mor
154 mas cob kor
155 ask mob cor
156 back mor so
157 mac bro kos
158 cams bor ok
159 ska mob roc
160 cam bro kos
161 ask mob orc
162 mack bro so
163 macs bor ok
164 ask cob mor
165 bam cor kos
166 mac bork so
167 as bock mor
168 mac bor kos
169 cam bork so
170 bam orc kos
171 cam bor kos
172 kab cos rom
173 mack bor so
174 cab kos mor
175 ska cob rom
176 cor ska mob
177 mor kab cos
178 kab roc som
179 kab roc mos
180 orc ska mob
181 mor ska cob
182 kab cor som
183 kab cor mos
184 kab orc som
185 kab orc mos
