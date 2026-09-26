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

## File 15 of 17: 2802 phrases

### susansarandon:people

input: Susan Sarandon
category: people
phrases 1 to 500 of 500

1 an saran sounds
2 sounds ran an as
3 us darn an on ass
4 ass rounds anna
5 us sand an arson
6 us darn an no ass
7 as rounds annas
8 us sand an sonar
9 us ran an sad son
10 ours sand annas
11 sound ran an ass
12 an on as runs ads
13 anna sounds ras
14 our nan sand ass
15 an no as runs ads
16 around sass nan
17 an ass adorn sun
18 an on ass run ads
19 our annas sands
20 an sura sand son
21 an no ass run ads
22 sodas runs anna
23 an as adorn suns
24 an on suss darn a
25 anna sounds ars
26 an oars sun sand
27 an on as ran suds
28 sands sour anna
29 an suns do saran
30 an no suss darn a
31 sauna darn sons
32 an sous ran sand
33 an no as ran suds
34 roads suns anna
35 an arson sun ads
36 an on as sun rads
37 roads sun annas
38 an sonar sun ads
39 an no as sun rads
40 ass rounds naan
41 an ass darn nous
42 an on ass sun rad
43 round annas ass
44 an ass dun arson
45 an no ass sun rad
46 soda runs annas
47 an saran suds no
48 on runs an sad as
49 sodas run annas
50 an nun sass road
51 sad no runs an as
52 sand sours anna
53 an ass dun sonar
54 us sand an on ras
55 anus sand arson
56 on ass runs nada
57 us sand an no ras
58 round anna sass
59 no ass runs nada
60 sad son run an as
61 anus sand sonar
62 an oar sun sands
63 on run an sad ass
64 anna suds arson
65 an sou ran sands
66 sad no run an ass
67 road suns annas
68 sun an sad arson
69 sad son runs an a
70 sand sour annas
71 an ora sun sands
72 us sand an on ars
73 anna suds sonar
74 us dons an saran
75 us sand an no ars
76 anna adorn suss
77 us nods an saran
78 sad sons run an a
79 naan sounds ras
80 sun an sad sonar
81 an on as suns rad
82 arson suns nada
83 dona runs an ass
84 an no as suns rad
85 sonar suns nada
86 an sos runs nada
87 an on a suns rads
88 sodas runs naan
89 an ass adorn uns
90 an no a suns rads
91 naan sounds ars
92 our nan sass dna
93 an sad ras sun no
94 sands sour naan
95 an ana doss runs
96 us ran an sad nos
97 saran sand nous
98 sodas ran an sun
99 an sad ars sun no
100 nada soars nuns
101 an saran sun sod
102 so ran an sad sun
103 annas darn sous
104 on ass darn anus
105 an on ras sun ads
106 roads suns naan
107 an ana runs sods
108 an no ras sun ads
109 dna sours annas
110 an on sura sands
111 an on ars sun ads
112 saran suns dona
113 no ass darn anus
114 an no ars sun ads
115 annas and sours
116 an no sura sands
117 an on ass dun ras
118 sound ras annas
119 sad saran sun no
120 an no ass dun ras
121 sand sours naan
122 an sun and soars
123 us ran as on sand
124 round naan sass
125 an saran sun dos
126 an on ass dun ars
127 sands nor sauna
128 an roan sad suns
129 us ran as no sand
130 sound ars annas
131 an oars suns dna
132 an no ass dun ars
133 naan suds arson
134 sad son runs ana
135 sad nos run an as
136 naan suds sonar
137 an anus ran sods
138 sad nos runs an a
139 dun soars annas
140 radon sun an ass
141 us ran a sand son
142 anus dons saran
143 round nan sass a
144 so ran an sad uns
145 anus nods saran
146 an anus darn sos
147 on sun an sad ras
148 sad nouns saran
149 sand soar an sun
150 an ass as don urn
151 roan anus sands
152 an oar suns sand
153 on sun an sad ars
154 naan adorn suss
155 an uns sand oars
156 an as or sad nuns
157 annas dons sura
158 sad sons run ana
159 an as nor sad sun
160 annas nods sura
161 sad son ran anus
162 a run as on sands
163 anon sura sands
164 an ana suns rods
165 an as so sand urn
166 duras sons anna
167 roan a sun sands
168 a run as no sands
169 rand sons sauna
170 an ora suns sand
171 an a so sand urns
172 suds roan annas
173 sad nouns ran as
174 an ass us ran don
175 suds anon saran
176 soda ran an suns
177 us ran nan do ass
178 duras son annas
179 roan as sun sand
180 sands so run an a
181 rounds nana ass
182 dna soars an sun
183 a runs as on sand
184 soda saran nuns
185 an sura and sons
186 a runs as no sand
187 sodas urns anna
188 sad sos run anna
189 an as on sad urns
190 radon suss anna
191 radon suns an as
192 an urns as sad no
193 roads uns annas
194 dona run an sass
195 a run as sand son
196 sodas saran nun
197 sour nan sand as
198 sand so run an as
199 dura sons annas
200 an sura sand nos
201 a run on sand ass
202 dans sour annas
203 an urn sass dona
204 a sun ass ran don
205 soda urns annas
206 an on saran suds
207 a run ass sand no
208 rods anus annas
209 an anus sand ors
210 an urn as sad son
211 duras sons naan
212 an ras sand nous
213 sand so runs an a
214 sodas urn annas
215 an saran sun ods
216 an ass on sad urn
217 ours nana sands
218 an sad nuns soar
219 an ass no sad urn
220 rand sous annas
221 our nan and sass
222 dun sos ran an as
223 ands sour annas
224 on saran sun ads
225 us ran so sad nan
226 round nana sass
227 us sand on saran
228 an ass or sad nun
229 ursa anon sands
230 an nan sours ads
231 an as so darn uns
232 us andros annas
233 no saran sun ads
234 an a nor sad suns
235 sands nouns ara
236 an ars sand nous
237 an as and run sos
238 sodas runs nana
239 an nan soar suds
240 an sun as ran sod
241 ads nouns saran
242 an sad nuns oars
243 an as us darn son
244 andros suns ana
245 us sand no saran
246 on as and run ass
247 sounds rasa nan
248 an roan suns ads
249 an a and runs sos
250 sands sour nana
251 an suns and soar
252 no as and run ass
253 dosa runs annas
254 an sad uns arson
255 us so ran an sand
256 dans sours anna
257 an anna suds ors
258 on a and runs ass
259 roads suns nana
260 sad noun ran ass
261 a suns as ran don
262 sans anon duras
263 an nan suds oars
264 ass run as on dna
265 duras nos annas
266 an sad uns sonar
267 no a and runs ass
268 rounds sans ana
269 an suns and oars
270 an sun as ran dos
271 dan sours annas
272 an sad nun soars
273 ass run as no dna
274 sodas urns naan
275 an ras suns dona
276 us ran a sand nos
277 ands sours anna
278 on ass dun saran
279 dna so runs an as
280 rads nous annas
281 roan a suns sand
282 a sun as darn son
283 radon suss naan
284 no ass dun saran
285 darn so sun an as
286 sand sours nana
287 dona ran an suss
288 a sun on darn ass
289 sounds ras nana
290 roan ass sun dna
291 an a us darn sons
292 ours dans annas
293 on suss darn ana
294 a sun ass darn no
295 sounds ars nana
296 sodas ran an uns
297 a sun so ran sand
298 donna suns rasa
299 no suss darn ana
300 dna so run an ass
301 sands ours anna
302 an anus or sands
303 an nuns as do ras
304 donna sans sura
305 an uns sod saran
306 an ass ran sun do
307 ours ands annas
308 an ars suns dona
309 an as nor dun ass
310 dour annas sans
311 anon as runs ads
312 an urns as on ads
313 sands nona sura
314 an ana doss urns
315 an urns as no ads
316 dans sours naan
317 an nuns doss ara
318 sun ran on sad as
319 sands nano sura
320 dna soar an suns
321 an a ass don urns
322 suds arson nana
323 an noun sass rad
324 us ran as and son
325 ands sours naan
326 an ana sods urns
327 an nuns as do ars
328 suds sonar nana
329 an uns and soars
330 us ran ass and no
331 dans arson anus
332 an nan doss sura
333 a ran ass do nuns
334 suds nona saran
335 an saran dun sos
336 an as nor sad uns
337 andro suss anna
338 anon ass run ads
339 rand so sun an as
340 dans sonar anus
341 an sad nan sours
342 don run an ass as
343 adorn suss nana
344 runs ass do anna
345 a suns as on darn
346 ands arson anus
347 an nuns sods ara
348 an uns as don ras
349 suds nano saran
350 an roan sass dun
351 an ras so sun dna
352 duras sons nana
353 an ors suns nada
354 as run ass do nan
355 ands sonar anus
356 on ras sand anus
357 us ran a and sons
358 dons ursa annas
359 an nan sods sura
360 a suns as no darn
361 nods ursa annas
362 no ras sand anus
363 don runs an ass a
364 sand nouns rasa
365 sand soar an uns
366 an as ran suns do
367 adorn anus sans
368 an suss and roan
369 an sun as ran ods
370 undo saran sans
371 roan as suns dna
372 as sun so ran dna
373 sands ours naan
374 sad nan sun soar
375 an a as dons urns
376 duras ons annas
377 ads soar an nuns
378 an a as nods urns
379 andros nuns aas
380 an anus dons ras
381 a runs ass do nan
382 dosa saran nuns
383 an anus nods ras
384 nuns ran so sad a
385 dans nous saran
386 on ars sand anus
387 darn so suns an a
388 sodas urns nana
389 sad ors sun anna
390 us ran nan sod as
391 ands nous saran
392 no ars sand anus
393 us ran a doss nan
394 dosa urns annas
395 us ran ass donna
396 an uns as don ars
397 radon suss nana
398 anon suss darn a
399 an ars so sun dna
400 nana dans sours
401 an ara suns dons
402 an ass as nod urn
403 nana andro suss
404 an ara suns nods
405 on a as sand urns
406 sands noun rasa
407 on anna suds ras
408 an a as suds norn
409 andro suss naan
410 no anna suds ras
411 on a and sass run
412 radon anus sans
413 sad nan sun oars
414 no a as sand urns
415 nana ands sours
416 saran as sun don
417 a ran ass don uns
418 sans andro anus
419 roan uns sand as
420 an uns as on rads
421 donna sans ursa
422 sad sous ran nan
423 no a and sass run
424 sans udon saran
425 dna soars an uns
426 us ran a sods nan
427 sans duro annas
428 an anus dons ars
429 an uns as no rads
430 rasa dans nouns
431 an anus nods ars
432 nan run so sad as
433 sands nona ursa
434 ads soars an nun
435 as ran ass do nun
436 sands nano ursa
437 sad nos runs ana
438 a sass on run dna
439 rasa ands nouns
440 on anna suds ars
441 a sass no run dna
442 duras nona sans
443 no anna suds ars
444 a runs so sad nan
445 duras nano sans
446 an roan suss dna
447 suns ran on sad a
448 annas as do runs
449 an as and sun ors
450 anon as sun rads
451 a suns as on rand
452 an uns ods saran
453 don ras sun an as
454 sun a sand arson
455 a suns as no rand
456 us darn anon ass
457 suds son ran an a
458 an sad ras nouns
459 us ran an son ads
460 anon ass sun rad
461 an nun so sad ras
462 sad nos ran anus
463 rand so suns an a
464 as and sun arson
465 sand sos run an a
466 roan sun and ass
467 sun ran as on ads
468 run ass do annas
469 an a nor dun sass
470 sun a sand sonar
471 sun ran as no ads
472 sad sos run naan
473 don ars sun an as
474 as and sun sonar
475 an uns as ran sod
476 son as runs nada
477 nun ran so sad as
478 on ras suns nada
479 an a sass urn don
480 on aas sand urns
481 a run as sand nos
482 sour nan and ass
483 a suns so ran dna
484 no ras suns nada
485 an ras as dun son
486 no aas sand urns
487 a sun son ran ads
488 an sad ars nouns
489 ads so ran an sun
490 sass anna do run
491 an nun so sad ars
492 dun nan soars as
493 an uns as ran dos
494 dons runs an aas
495 an urn as sad nos
496 nods runs an aas
497 an as us ran dons
498 an annas or suds
499 an as us ran nods
500 sands so run ana

### maryjanevelosodrugsmugglingcase:people

input: Mary Jane Veloso drug smuggling case
category: people
phrases 1 to 500 of 500

1 congressional juggler savage dummy
2 my congressional maglev sugar judge
3 congressional dummy juggle ravages
4 my congressional lava judge muggers
5 congressional agave dummy jugglers
6 my congressional savage juggle drum
7 congressional rummy savaged juggle
8 my congressional juggler gave dumas
9 gummy valued congressional jaggers
10 my congressional magus gravel judge
11 miscellaneous vanguard joggers gym
12 my congressional juggler savage mud
13 miscellaneous vanguard jogger gyms
14 my congressional jugglers gave duma
15 gummy jagger salvage nondisclosure
16 my congressional juggle grave dumas
17 gammy juggler savage nondisclosure
18 my congressional argus judge maglev
19 gammy ravages juggle nondisclosure
20 my congressional ravages juggle mud
21 gummy lavage nondisclosure jaggers
22 my congressional graves juggle duma
23 gammy agave nondisclosure jugglers
24 my congressional jugs mugged larvae
25 gummer judgy congressional salvage
26 my congressional agave juggle drums
27 garvey nondisclosure juggle gammas
28 my congressional rum savaged juggle
29 nondisclosure jemmy luggage vargas
30 my congressional jugs argued maglev
31 nondisclosure jammy luggage graves
32 my congressional jaguars mugged lev
33 nondisclosure jaggery maglev magus
34 my congressional agave mud jugglers
35 my congressional mauve juggle drags
36 my congressional java gurgle smudge
37 my miscellaneous vargas jogged rung
38 my miscellaneous guvnor jag daggers
39 my vulgar game congressional judges
40 my miscellaneous guvnor gagged jars
41 my miscellaneous guvnor jags dagger
42 my congressional juggle raved magus
43 my congressional jugglers gad mauve
44 my vague mad congressional jugglers
45 my vague smuggled congressional raj
46 my vague smuggled congressional jar
47 games my vulgar congressional judge
48 my smug valued congressional jagger
49 us mugged gravely congressional jam
50 my vulgar jagged congressional muse
51 congressional dummy jugglers gave a
52 congressional dummy juggler gave as
53 vulgar gym judge congressional same
54 congressional judge very slug gamma
55 congressional dummy juggle grave as
56 gummy a gravel congressional judges
57 congressional judges very glug mama
58 congressional judge very slug magma
59 glum army gave congressional judges
60 gummy as gravel congressional judge
61 vulgar may judge congressional gems
62 congressional jammed grave slug guy
63 congressional judge gravely gas mum
64 very luggage jams congressional mud
65 vulgar jam mugged congressional yes
66 mom juggle unnecessarily dog vargas
67 glum may grave congressional judges
68 glum may judge congressional graves
69 smug may gravel congressional judge
70 muggy a marvel congressional judges
71 saved juggler gum congressional may
72 ravages my glum congressional judge
73 muggy a marvels congressional judge
74 congressional judges gravel gay mum
75 glum gravy judge congressional same
76 grave guy slammed congressional jug
77 congressional jammed grave lug guys
78 my smuggled congressional java urge
79 muggy jam leave congressional drugs
80 congressional judas gaggle very mum
81 very mama slugged congressional jug
82 saved juggler mug congressional may
83 muggy as marvel congressional judge
84 congressional judges very lug gamma
85 smuggled rum gave congressional jay
86 congressional saved gray juggle mum
87 gummy jag leave congressional drugs
88 congressional judges gave mural gym
89 congressional saved army juggle gum
90 saved mum gaggle congressional jury
91 congressional judge very lugs gamma
92 sum my ravaged congressional juggle
93 jammed rug guys congressional gavel
94 mad juggle very congressional magus
95 vulgar emmy gas congressional judge
96 smug army judge congressional gavel
97 congressional saved army juggle mug
98 congressional smuggled rave jam guy
99 my vague congressional jugglers dam
100 glum jugs very congressional damage
101 mugs my valued congressional jagger
102 ravage my glum congressional judges
103 gammy jug leave congressional drugs
104 mum jury salvaged congressional egg
105 mum jury gagged congressional slave
106 congressional judge revs ugly gamma
107 congressional judges very lug magma
108 groggy van judge miscellaneous arms
109 jury mugged as congressional maglev
110 very maja smuggle congressional dug
111 smug gay marvel congressional judge
112 smug gravy judge congressional male
113 gums my valued congressional jagger
114 vulgar mom unnecessarily jogged gas
115 gum my valued congressional jaggers
116 mum guy slaved congressional jagger
117 vulgar may judge congressional megs
118 congressional meds gave jugular gym
119 congressional jammed graves lug guy
120 congressional mud juggle same gravy
121 congressional dry juggle savage mum
122 congressional judges marvel gay gum
123 congressional judge very glug mamas
124 male gravy gum congressional judges
125 smug gravy judge congressional meal
126 congressional made gravy juggle sum
127 congressional judge very lugs magma
128 congressional judge marvel gay mugs
129 mum jay slugged congressional grave
130 male gravy mugs congressional judge
131 congressional judge very lug gammas
132 congressional judge marvels gay gum
133 grave jay smuggle congressional mud
134 mug my valued congressional jaggers
135 muggy arm slave congressional judge
136 gummy las grave congressional judge
137 congressional jammed grave lugs guy
138 meg jam vaguely congressional drugs
139 ugly jammers gave congressional dug
140 sad rummy gave congressional juggle
141 congressional judge marvel gay gums
142 congressional judges marvel gay mug
143 ugly jam grave congressional smudge
144 male gravy gums congressional judge
145 male gravy mug congressional judges
146 gummy jugs leave congressional drag
147 congressional saved jammer glug guy
148 jugs glug very congressional madame
149 congressional jagged marvel guy sum
150 my valued congressional muggers jag
151 congressional judge marvels gay mug
152 congressional judge revs ugly magma
153 every jugs glug congressional madam
154 glum jug very congressional damages
155 congressional day gave jugglers mum
156 gammy jugs leave congressional drug
157 eggs jam vaguely congressional drum
158 congressional jagged slaver guy mum
159 congressional jagged ravel guys mum
160 my vague congressional juggler dams
161 congressional days gave juggler mum
162 muggy jams leave congressional drug
163 glued gamma very congressional jugs
164 gemma glug very congressional judas
165 very maja mugged congressional slug
166 rummy lava judge congressional eggs
167 congressional judges gave marly gum
168 congressional glad gemma survey jug
169 smug gravy lame congressional judge
170 congressional smudge very jam gulag
171 congressional madam jugs ugly verge
172 congressional dug juggle very mamas
173 congressional sludge very jug gamma
174 congressional judge gave marly mugs
175 smug mylar gave congressional judge
176 jammed rugs guy congressional gavel
177 congressional judge gravel gay mums
178 unnecessarily drug gloves jog gamma
179 gem jam vaguely congressional drugs
180 congressional dummy juggle save rag
181 ugly gamma served congressional jug
182 congressional judge gave mural gyms
183 my glued congressional java muggers
184 mom goggle unnecessarily drugs java
185 groggy van judge miscellaneous mars
186 mom jug unnecessarily logged vargas
187 congressional armed maglev jug guys
188 muggy leaves jam congressional drug
189 congressional judas gravely egg mum
190 very maja slugged congressional gum
191 smuggled may jug congressional rave
192 gummy jags leave congressional drug
193 congressional judge gave marly gums
194 congressional judge gave smarmy lug
195 congressional judges gave marly mug
196 gummy rag slave congressional judge
197 vulgar gym judge congressional mesa
198 unnecessarily drugs glove jog gamma
199 gags glug unnecessarily moved major
200 gemma jogs unnecessarily vulgar god
201 grams jug unnecessarily good maglev
202 groggy van arm miscellaneous judges
203 same juggler gum congressional davy
204 gummy jugs grave congressional deal
205 vague jam smuggle congressional dry
206 made gum gravely congressional jugs
207 congressional jammed gulag revs guy
208 congressional jagged lav summer guy
209 mum save raggedly congressional jug
210 saved jury glug congressional gemma
211 gummy leg grave congressional judas
212 congressional jagged laver guys mum
213 very lama mugged congressional jugs
214 smuggled guy aver congressional jam
215 gummy leaves jag congressional drug
216 mum gave duly congressional jaggers
217 congressional dummy jug several gag
218 mum gravy judge congressional gales
219 congressional judge seam vulgar gym
220 very maja slugged congressional mug
221 glum games vary congressional judge
222 congressional judges rev ugly gamma
223 mum jay grudges congressional gavel
224 gemma jog unnecessarily vulgar dogs
225 same juggler mug congressional davy
226 glum game vary congressional judges
227 glued magma very congressional jugs
228 congressional judges very glug maam
229 made mug gravely congressional jugs
230 congressional rugged values jam gym
231 smug gym judge congressional larvae
232 gems jam vaguely congressional drug
233 congressional drums juggle gave may
234 congressional judge gravely sag mum
235 congressional jammed gulag rev guys
236 congressional smuggled rev guy maja
237 muggy ram slave congressional judge
238 groggy java drugs miscellaneous men
239 congressional dummy juggle graves a
240 very magus juggle congressional dam
241 very jag smuggle congressional duma
242 congressional judge slave gammy rug
243 congressional sludge very jug magma
244 unnecessarily drug gloves jog magma
245 gummy graves jug congressional deal
246 congressional dummy jagger save lug
247 congressional judge gave gammy slur
248 jammed use glug congressional gravy
249 congressional jammed rave glug guys
250 ugly vargas judge congressional mem
251 ugly magma served congressional jug
252 gamma jugs unnecessarily grovel god
253 congressional armed maglev jugs guy
254 gummy jug leaves congressional drag
255 muggy jag leave congressional drums
256 made mugs gravely congressional jug
257 muggy arms judge congressional veal
258 congressional days grave juggle mum
259 regal jugs gave congressional dummy
260 congressional judas grave leggy mum
261 congressional smuggled rem guy java
262 congressional jagged sugar levy mum
263 my valued congressional mugger jags
264 my ravaged congressional mus juggle
265 unnecessarily drugs glove jog magma
266 gemma jog unnecessarily vulgar gods
267 rugged song jam miscellaneous gravy
268 congressional jagged gal survey mum
269 gummy jugs lead congressional grave
270 gummy jug leave congressional drags
271 congressional drug jug gammy leaves
272 muggers gave duly congressional jam
273 grave slum mugged congressional jay
274 made gums gravely congressional jug
275 smug maglev ray congressional judge
276 vulgar yams judge congressional meg
277 congressional dummy jugs gravel age
278 gummy als grave congressional judge
279 congressional arms guy maglev judge
280 muggy arms judge congressional vale
281 mad jug vaguely congressional germs
282 congressional saved jaggery lug mum
283 vulgar mays judge congressional meg
284 congressional judge maglev arm guys
285 glum yams grave congressional judge
286 gummy vas large congressional judge
287 congressional made varus juggle gym
288 congressional judges rev ugly magma
289 unnecessarily gold grove jugs gamma
290 gummy raj gave congressional sludge
291 glum mays grave congressional judge
292 gummy jug leads congressional grave
293 mum jug salvaged congressional grey
294 very lamas mugged congressional jug
295 mum vargas unnecessarily logged jog
296 very jug smuggle congressional dama
297 muggy jug slave congressional dream
298 meg jams vaguely congressional drug
299 congressional dummy juggle save gar
300 gummy jar gave congressional sludge
301 congressional mud jugglers gave may
302 mas gum gravely congressional judge
303 made mugs vary congressional juggle
304 gemma jogs unnecessarily vulgar dog
305 gram jugs unnecessarily good maglev
306 very mag juggle congressional dumas
307 mum jury gagged congressional salve
308 gummy jugs leave congressional grad
309 mag sum gravely congressional judge
310 congressional rugged value jams gym
311 rude java smuggle congressional gym
312 unnecessarily dog gloves jug gramma
313 my jagged miscellaneous guvnor rags
314 congressional day graves juggle mum
315 congressional dummy juggle rave gas
316 vulgar emmy egg congressional judas
317 glued gammas very congressional jug
318 gummy gar slave congressional judge
319 gummy gas ravel congressional judge
320 ugly jag summed congressional grave
321 gummy jug lead congressional graves
322 smuggled jay gum congressional rave
323 congressional madam jug ugly verges
324 magma jugs unnecessarily grovel god
325 groggy van ram miscellaneous judges
326 my glum congressional jugs averaged
327 congressional dummy juggle gave ras
328 vulgar jay summed congressional egg
329 congressional jammed saver glug guy
330 gummy jug slave congressional grade
331 congressional mad gravy juggle muse
332 made gums vary congressional juggle
333 groggy van jug miscellaneous dreams
334 smug gravy egg miscellaneous jordan
335 unnecessarily gold groves jug gamma
336 congressional dummy jug gravel ages
337 groggy vans arm miscellaneous judge
338 very mags juggle congressional duma
339 congressional judge rev ugly gammas
340 vulgar yams judge congressional gem
341 mas mug gravely congressional judge
342 congressional made gravy juggle mus
343 gummy jug salvage congressional red
344 jagged mugs very congressional maul
345 my congressional lava mugger judges
346 jug save madly congressional mugger
347 congressional mad mag juggle survey
348 miscellaneous drugs grave mangy jog
349 random eggs jug miscellaneous gravy
350 germs jam vaguely congressional dug
351 gammy lev sugar congressional judge
352 vulgar mays judge congressional gem
353 vulgar yam judge congressional gems
354 ugly jam mugged congressional saver
355 very maam slugged congressional jug
356 groggy van jugs miscellaneous dream
357 congressional dummy jag save gurgle
358 congressional yards gave juggle mum
359 vulgar jay smudge congressional meg
360 smuggled jay mug congressional rave
361 mum vargas unnecessarily jogged log
362 smuggled jug aver congressional may
363 congressional dummy jug reveal gags
364 summary gal judge congressional veg
365 mum java slugged congressional grey
366 jagged gums very congressional maul
367 congressional judge marvel mag guys
368 muggy mar slave congressional judge
369 muggy over jags miscellaneous grand
370 jagged mugs very congressional alum
371 muggy arm salve congressional judge
372 my mauve congressional jugglers dag
373 smug juggle very congressional dama
374 gem jams vaguely congressional drug
375 congressional dummy jugs reveal gag
376 gummy gala revs congressional judge
377 congressional jammed raves glug guy
378 glum jay grave congressional smudge
379 glum jaggery save congressional mud
380 gummy slug grave congressional jade
381 very gulag summed congressional jag
382 congressional ready maglev jugs gum
383 congressional judge marvel mags guy
384 valued gym sum congressional jagger
385 jug my sugared congressional maglev
386 gamma jugs unnecessarily grovel dog
387 unnecessarily gold grove jugs magma
388 groggy var man miscellaneous judges
389 gummy jug grave congressional deals
390 vulgar emmy sag congressional judge
391 maja glug very congressional smudge
392 congressional jagged marvel guy mus
393 muggy mars judge congressional veal
394 rugged gravy man miscellaneous jogs
395 congressional dummy juggle gave ars
396 gummy gavel jugs congressional dear
397 gulag jags ever congressional dummy
398 summary lev gag congressional judge
399 gummy laver gas congressional judge
400 glum yam grave congressional judges
401 glum yam judge congressional graves
402 congressional judge value grams gym
403 congressional judges gravel may gum
404 smug yam gravel congressional judge
405 gummy veal rags congressional judge
406 ugly jam mugged congressional raves
407 very maja mugged congressional lugs
408 grams jog unnecessarily moved gulag
409 mom jug unnecessarily salvaged grog
410 jagged gums very congressional alum
411 mums gave duly congressional jagger
412 congressional med gave jugular gyms
413 gummy jugs read congressional gavel
414 congressional judge gravel may mugs
415 congressional madam juggle revs guy
416 gamma jug unnecessarily grovel dogs
417 unnecessarily drug glove jogs gamma
418 mom lug unnecessarily jogged vargas
419 muggy veal arm congressional judges
420 congressional jury smuggle dam gave
421 congressional dama juggle very mugs
422 muggy elves jam congressional guard
423 congressional smudge marvel gay jug
424 male gravy jug congressional smudge
425 saved juggler gum congressional yam
426 congressional mars guy maglev judge
427 muggy mars judge congressional vale
428 smug maglev jug congressional ready
429 congressional ready maglev jugs mug
430 orgasm jug unnecessarily dog maglev
431 unnecessarily gagged valor jugs mom
432 gummy juggle raved congressional as
433 congressional jay smuggle drum gave
434 congressional judge slavery gag mum
435 gummy gal judge congressional saver
436 congressional mud jay gave smuggler
437 gummy vale rags congressional judge
438 congressional jagged lag survey mum
439 unnecessarily gold groves jug magma
440 congressional aged gravely jugs mum
441 meg jag vaguely congressional drums
442 mugger gave duly congressional jams
443 congressional dummy jug reveals gag
444 congressional dummy jugs large gave
445 congressional dummy jags grave glue
446 gummy gals rave congressional judge
447 congressional jury gave slam mugged
448 vulgar gays judge congressional mem
449 vulgar jay smudge congressional gem
450 congressional judge gravel may gums
451 congressional judges gravel may mug
452 congressional jammed vas gurgle guy
453 gamma jugs unnecessarily loved grog
454 groggy van rams miscellaneous judge
455 vulgar mom unnecessarily jogged sag
456 congressional judges maglev arm guy
457 muggy vale arm congressional judges
458 congressional dama juggle very gums
459 congressional judge game gravy slum
460 us gravel gammy congressional judge
461 glum gravy judge congressional mesa
462 congressional mud juggle grave yams
463 congressional judge maglev ram guys
464 smug gravy jog miscellaneous danger
465 unnecessarily mad gags juggle vroom
466 gammas jug unnecessarily grovel god
467 orgasm glug unnecessarily moved jag
468 congressional day gave juggler mums
469 megs jam vaguely congressional drug
470 vague gal drugs congressional jemmy
471 muggy jags leave congressional drum
472 congressional guard jag gummy elves
473 congressional judge gave murals gym
474 rum gays judge congressional maglev
475 mad jugs vaguely congressional germ
476 grave gym mauled congressional jugs
477 congressional mud juggle grave mays
478 meg gum gravely congressional judas
479 gummy juggle save congressional rad
480 congressional madam juggle rev guys
481 congressional ready maglev jug mugs
482 saved juggler mug congressional yam
483 ugly maja mugged congressional revs
484 unnecessarily dog glove jugs gramma
485 gummy jugs grave congressional dale
486 very gam juggle congressional dumas
487 congressional dummy jags gave gruel
488 gam sum gravely congressional judge
489 gummy gel grave congressional judas
490 gummy slag rave congressional judge
491 congressional valued marge jugs gym
492 very maul mugged congressional jags
493 miscellaneous random gravy egg jugs
494 gamma jug unnecessarily grovel gods
495 leggy java summer congressional dug
496 gummy gal raves congressional judge
497 mum jays grudge congressional gavel
498 glum gravy seam congressional judge
499 congressional rugged value jam gyms
500 ugly jams mugged congressional rave

### hannaheinbinder:people

input: Hannah Einbinder
category: people
phrases 1 to 500 of 500

1 behind henna rain
2 her in behind anna
3 he ran an in behind
4 behind henna rani
5 her in behind naan
6 her in nina be hand
7 benni hand hernia
8 her ain behind nan
9 he band her in nina
10 behind hernia nan
11 an hen rain behind
12 her ain in hand ben
13 hernia henna bind
14 in nan hear behind
15 her in nina had ben
16 henna hinder bani
17 an nan hire behind
18 i henna her in band
19 banned hernia hin
20 behind hear an inn
21 he bind her in anna
22 hin brained henna
23 her nina had benni
24 her in a hand benni
25 benni dinner haha
26 in hernia hand ben
27 he hand an in brine
28 in hand hear benni
29 her in had an benni
30 here nina hand bin
31 her in anna be hind
32 her nina hand bine
33 her ain inn be hand
34 nine hair hand ben
35 an in hire hand ben
36 he hand nine brain
37 her nine a hand bin
38 her ain banned hin
39 he hid an in banner
40 her hind bean nina
41 i hand her nine ban
42 her nina henna bid
43 he henna an in bird
44 her behind ana inn
45 i ran an behind hen
46 heard in henna bin
47 i hand an nine herb
48 nine hen had brain
49 her nine had an bin
50 in nan hare behind
51 her in inn had bean
52 her ain hand benni
53 an in heir hand ben
54 an hind hear benni
55 he had an inner bin
56 he ran behind nina
57 i nab her nine hand
58 ain hen ran behind
59 he band her ain inn
60 an henna hire bind
61 he bin an hard nine
62 in hair henna bend
63 an hard in been hin
64 an behind nan heir
65 her in a henna bind
66 inner haha bend in
67 her in hand an bine
68 an hin hide banner
69 her ain hen band in
70 behind hare an inn
71 an in hind hear ben
72 in hide henna barn
73 he harden an in bin
74 in henna had brine
75 an nina be her hind
76 nine nina had herb
77 he hand an nine rib
78 her ani hand benni
79 her ain inn had ben
80 behind near an hin
81 an in hin band here
82 bani hand her nine
83 her in bean an hind
84 an heir henna bind
85 an in here ban hind
86 banned in hear hin
87 bin hand an here in
88 an hen bind hernia
89 an in henna her bid
90 in heir henna band
91 her in inn had bane
92 an behind inn rhea
93 he hinder an in ban
94 an behind rani hen
95 he bin an heard inn
96 here anna bin hind
97 i henna her bad inn
98 in hin head banner
99 her in nan head bin
100 here nina hand nib
101 her in inn head ban
102 in hen band hernia
103 her ain in hand neb
104 banner hand hie in
105 her in ani hand ben
106 in henna hand brie
107 an heard in bin hen
108 henna her ain bind
109 an in inn head herb
110 her inane hand bin
111 an in here nab hind
112 hind nan been hair
113 her in inn aah bend
114 benni hand an hire
115 he nab an hinder in
116 herein hand an bin
117 her inn head an bin
118 hard hin been nina
119 her in nina had neb
120 an nina her behind
121 an in hen hear bind
122 behind earn an hin
123 an in hair bend hen
124 her behind nan ani
125 he bind her in naan
126 nine hen band hair
127 her in inn nab head
128 in hare hand benni
129 he hid an nine barn
130 an henna hid brine
131 her nine a hand nib
132 in hind bear henna
133 he bar an nine hind
134 hind nina hear ben
135 an in hen hire band
136 nine hand hear nib
137 he rain an hind ben
138 in hide henna bran
139 an nina hid her ben
140 in haha bend niner
141 he bind her ain nan
142 her hind inane ban
143 an in hen hide barn
144 here hin band nina
145 an in hin hand beer
146 benni hand an heir
147 an in hen had brine
148 in hernia hand neb
149 her nine had an nib
150 an hin bend hernia
151 her in anna bid hen
152 her ani henna bind
153 her in naan be hind
154 here hind ban nina
155 her in nan hide ban
156 in henna hand bier
157 he had an inner nib
158 behind hen air nan
159 an hard hin be nine
160 henna an hired bin
161 an in nan hide herb
162 an inane hind herb
163 her in anna bed hin
164 nine heir hand ban
165 ban had her nine in
166 heard in henna nib
167 her ain nan be hind
168 hired in nab henna
169 an in hen band heir
170 in rhea hand benni
171 her nine hin band a
172 nine henna had rib
173 her in nan had bine
174 nine hair hand neb
175 herb had an nine in
176 an hind hie banner
177 her nine hind ban a
178 an hind henna brie
179 an in hin hear bend
180 an hind hernia ben
181 an in hire hand neb
182 he hand nine bairn
183 her ane in hand bin
184 heard hen bin nina
185 he near an hind bin
186 benni hid her anna
187 an in hen hand brie
188 nine hin bear hand
189 he bin an hired nan
190 here hind nab nina
191 an nan hide her bin
192 an hind hare benni
193 he ban an hired inn
194 inner haha bed inn
195 her nine hid an ban
196 nine heir nab hand
197 her inn hide an ban
198 hinder a henna bin
199 i hid an banner hen
200 in hind bare henna
201 he bear an hind inn
202 nine rhea hand bin
203 her in hide nab nan
204 an hen hinder bani
205 he harden an in nib
206 hind anna hire ben
207 her in nan hid bean
208 here anna bind hin
209 he hid an nine bran
210 nine hen had bairn
211 an hired in ban hen
212 her hind nina bane
213 her inn had an bine
214 bad henna hire inn
215 he hid an inner ban
216 inner hind aah ben
217 an in hen bear hind
218 an hind henna bier
219 nib hand an here in
220 her din henna bani
221 her in nine ban dah
222 in hin henna bread
223 her nine hind nab a
224 ain hen hid banner
225 an in hind hare ben
226 hind nan be hernia
227 an in heir hand neb
228 hand inn been hair
229 an heard inn be hin
230 rabid in henna hen
231 an in hen hide bran
232 ain hen henna bird
233 her hind inn bean a
234 an banned hin hire
235 i bean her hind nan
236 hired anna bin hen
237 he nab an hired inn
238 in hen henna braid
239 her inn nab an hide
240 an hin hinder bane
241 her in nan head nib
242 behind ani ran hen
243 her inn hid an bean
244 nine ani hand herb
245 an in hen hand bier
246 nine hand hie barn
247 he earn an hind bin
248 hinder inn aah ben
249 an here nan hid bin
250 hinder anna be hin
251 her a in behind nan
252 bad inn henna heir
253 an here inn hid ban
254 he hand inner bani
255 her hen bid an nina
256 banned in hare hin
257 an hind rain be hen
258 in rhea henna bind
259 her nine bin an dah
260 her inane hand nib
261 bin had an here inn
262 herein hand an nib
263 an hired in nab hen
264 nine hin bare hand
265 an nine hen had rib
266 nine haha bin nerd
267 an in hind hear neb
268 nine hen brain dah
269 her in ana bind hen
270 behind ern aah inn
271 her in hen band ani
272 an hin brained hen
273 an nina bed her hin
274 her hind anna bine
275 ben hid her in anna
276 in hin henna beard
277 her in nine nab dah
278 an heard hin benni
279 he brad an nine hin
280 he bin hinder anna
281 her in inn bean dah
282 heard hin ban nine
283 her in hen bin nada
284 hind air henna ben
285 her inn head an nib
286 an banned hin heir
287 her in nan hid bane
288 i henna hard benni
289 her ain inn had neb
290 ain henna herd bin
291 he bare an hind inn
292 inner hen had bani
293 an hind nan be hire
294 here naan bin hind
295 he bin an inner dah
296 inner hen aah bind
297 her hind ana be inn
298 in hin harden bean
299 an in hen hed brain
300 near henna hid bin
301 her in hen dab nina
302 hired hen ban nina
303 an in hin head bren
304 hi her banned nina
305 an in hand hie bren
306 nine haha bred inn
307 her in nan hie band
308 bride henna an hin
309 an hinder a bin hen
310 in herd henna bani
311 an in hen bare hind
312 hind hen bear nina
313 her in hin bean dna
314 her inane hin band
315 i ban an hinder hen
316 inner haha bin den
317 an here inn bin dah
318 nine hind aah bren
319 an in hen hare bind
320 henna an hired nib
321 her ain hen bin dna
322 hind nina hare ben
323 an bad inn hire hen
324 herein band an hin
325 her inn hid an bane
326 bin hand hear nine
327 he bind an near hin
328 nine hare hand nib
329 her in ani hand neb
330 her hind ana benni
331 an hind are bin hen
332 heard hin nab nine
333 he hand in nine bar
334 herein ban an hind
335 an hind nan be heir
336 nine henna hid bra
337 he had in nine barn
338 hind niner aah ben
339 he rain in hand ben
340 in hen harden bani
341 an hind inn be hare
342 heard inn bean hin
343 her in hin ban dean
344 he ban hinder nina
345 her inn hie an band
346 ain hen hinder ban
347 an in hin bread hen
348 ain henna hid bren
349 her in ana bend hin
350 he rain banned hin
351 her in nina hed ban
352 nine hand hie bran
353 an nine hen hid bar
354 hired hen nab nina
355 an here hin bin dna
356 inner hand hie ban
357 an in nina hed herb
358 nee hin hand brain
359 i nab an hinder hen
360 hind nina hear neb
361 i henna he brand in
362 bean an hinder hin
363 an near hin be hind
364 he brine hind anna
365 her ane in hand nib
366 her inane hind nab
367 an hired nan be hin
368 hinder a henna nib
369 an in hen hie brand
370 inbred hin henna a
371 he near an hind nib
372 herein nab an hind
373 an in hen bind rhea
374 in hin harden bane
375 he ran an hind bine
376 nine rhea hand nib
377 an nan hide her nib
378 inner hin aah bend
379 her hin bin an dean
380 her banned hin ani
381 he rain an hind neb
382 ain henna din herb
383 an nina hid her neb
384 herb hand ain nine
385 her in naan bid hen
386 hand inn be hernia
387 an nina hed her bin
388 bind in hear henna
389 an in hin beard hen
390 he hand nina brine
391 her in hin nab dean
392 he nab hinder nina
393 an in henna hid reb
394 hind nan hire bean
395 hed nab her in nina
396 he rain hand benni
397 her ain hin end ban
398 inbred hen aah inn
399 an hind inn be rhea
400 nah an behind rein
401 an in hin herd bean
402 hind are henna nib
403 her in naan bed hin
404 i henna hinder ban
405 her ain hen bid nan
406 hind hen bare nina
407 an in hin hare bend
408 inner hin nab head
409 he hear in band inn
410 ane hin ran behind
411 he near in hand bin
412 bare henna hid inn
413 an hind a brine hen
414 benni hid her naan
415 an hind hen air ben
416 band henna hire in
417 an hind rani be hen
418 he henna rabid inn
419 her ane inn had bin
420 an hind hernia neb
421 an ain hin end herb
422 in henna hed bairn
423 he rein an hind ban
424 banned hin air hen
425 an in hin heed barn
426 behind henna ran i
427 an ain hen herd bin
428 hind naan hire ben
429 he bard an nine hin
430 here naan bind hin
431 he hand in bear inn
432 hind nan hear bine
433 her ain nan bed hin
434 he henna nina bird
435 i had in banner hen
436 an hind rhea benni
437 an near hen hid bin
438 nine hin band rhea
439 i henna an hind reb
440 hind heir bean nan
441 an hard inn hie ben
442 nine hind nab hare
443 an here nan bid hin
444 bared in henna hin
445 her ane in band hin
446 been hand rain hin
447 an in hen herd bani
448 i henna hand brine
449 her hind nan be ani
450 i nab hinder henna
451 he hand in nine bra
452 in herein hand ban
453 he earn an hind nib
454 nine hind ban rhea
455 an here nan hid nib
456 nine haha bind ern
457 her ane in ban hind
458 hind arena bin hen
459 i henna in hard ben
460 he band inn hernia
461 he had in nine bran
462 herb hand inane in
463 her ain hin nab end
464 nana her in behind
465 he had in inner ban
466 ain hind henna reb
467 he hand in ain bren
468 hind anna hire neb
469 an in hen brine dah
470 behind he rain nan
471 nib had an here inn
472 hinder ana bin hen
473 her hen bind an ani
474 inner hind aah neb
475 her hin end an bani
476 hind nan hire bane
477 an nine hen hid bra
478 ahh an nine binder
479 her hin dab an nine
480 hired naan bin hen
481 he ban in hard nine
482 ane hen brain hind
483 he rain inn be hand
484 inane hen hid barn
485 an in hin bend rhea
486 hired hin bean nan
487 an nan hid her bine
488 ain henna herd nib
489 he nab an hind rein
490 inane hen bar hind
491 an ain hin herd ben
492 near hin henna bid
493 he earn in hand bin
494 hinder naan be hin
495 an ain hen hid bren
496 bani hand here inn
497 an inner hin be dah
498 near henna hid nib
499 an near hin hid ben
500 banner ani hid hen

### arungawli:people

input: Arun Gawli
category: people
phrases 1 to 77 of 77

1 wag urinal
2 gun air law
3 i war an lug
4 wing laura
5 lungi war a
6 i lug an raw
7 ruling awa
8 i wrung ala
9 lug in war a
10 wag laurin
11 rung wail a
12 lug i warn a
13 luring awa
14 an wail rug
15 lung i war a
16 lunar a wig
17 lug in raw a
18 gun ail war
19 in a law rug
20 ain law rug
21 gul in war a
22 ala run wig
23 gul i warn a
24 a wrung ail
25 gul in raw a
26 raw a lungi
27 an law rug i
28 lug air wan
29 i war an gul
30 gun ail raw
31 i gul an raw
32 rug win ala
33 lung i raw a
34 ani war lug
35 rung i law a
36 lug win ara
37 rug i lawn a
38 wag ail run
39 lug ain war
40 raw lug ani
41 rug ail wan
42 lug ain raw
43 wag ail urn
44 i lunar wag
45 gul ain war
46 gul ain raw
47 i wan rugal
48 rug ani law
49 gun rai law
50 gun ria law
51 rugal a win
52 gul air wan
53 wig ala urn
54 gul raw ani
55 gul win ara
56 rug nai law
57 lug nai war
58 lug air naw
59 lug nai raw
60 lug rai wan
61 lug ria wan
62 gul ani war
63 rug ail naw
64 gul nai war
65 naw gul air
66 gul nai raw
67 rug lin awa
68 rugal naw i
69 gul rai wan
70 gul ria wan
71 rug nil awa
72 lug rai naw
73 lug ria naw
74 lug rin awa
75 gul rai naw
76 gul ria naw
77 gul rin awa

### tocatchapredator:titles

input: To Catch a Predator
category: titles
phrases 1 to 500 of 500

1 apart teach doctor
2 that are cap doctor
3 the pat a doctor car
4 that cap decorator
5 that are top accord
6 the apt a doctor car
7 apart cheat doctor
8 that a doctor pacer
9 the port a accord at
10 that coca predator
11 that are doctor pac
12 a accord to the part
13 decorator patch at
14 rape to that accord
15 a cap to that record
16 doctor attach rape
17 that poor acted car
18 the top a accord art
19 attached a proctor
20 that car ape doctor
21 pat at to her accord
22 that pac decorator
23 that pea doctor car
24 the top a rat accord
25 hoop attracted car
26 that are pot accord
27 rapt a to the accord
28 tea catch trapdoor
29 crop to that arcade
30 a trap to the accord
31 accord tape throat
32 that poor cared act
33 that rare at cop doc
34 that coca teardrop
35 that poor cared cat
36 a cared to that crop
37 trapdoor teach act
38 pear to that accord
39 a record to that pac
40 decorator act path
41 that ear cap doctor
42 that cod art cop are
43 torpedo attach car
44 that cap coat order
45 that rear at cop doc
46 attache rap doctor
47 that at record capo
48 apt at to her accord
49 doctorate crap hat
50 that coop trade car
51 the top a tar accord
52 trapdoor teach cat
53 doctor recap that a
54 that cod are rat cop
55 predator chat coat
56 that art cooped car
57 that top a cared roc
58 pacha treat doctor
59 doctor caper that a
60 that rare at cop cod
61 decorator cat path
62 each at doctor part
63 the pat a rot accord
64 ate catch trapdoor
65 that era cap doctor
66 a accord to that rep
67 trachea pat doctor
68 coca to that draper
69 at rap to the accord
70 apart torched coat
71 that poor raced act
72 a crop to that cedar
73 trachea tap doctor
74 that rat cooped car
75 a accord to the tarp
76 tart doctor apache
77 that cocoa trap red
78 a raced to that crop
79 apart rotted coach
80 that taco cap order
81 that pro a cared cot
82 potato charted car
83 that poor raced cat
84 her top car act toad
85 doctor attach pear
86 that a corrode pact
87 a accord to the prat
88 predator catch tao
89 too cared that crap
90 doctor act her pat a
91 potato charred act
92 that top caca order
93 at card to the copra
94 trapdoor cheat act
95 that ear top accord
96 her top car cat toad
97 potato cared chart
98 that are opt accord
99 that pro car act doe
100 attache par doctor
101 that at corrode cap
102 that cod are tar cop
103 attached car troop
104 that coop tread car
105 that top a raced roc
106 doctorate chap art
107 that capo act order
108 doctor cat her pat a
109 potato charred cat
110 that pro cared coat
111 at par to the accord
112 trapdoor cheat cat
113 that ear doctor pac
114 the pat a accord tor
115 attached cart poor
116 that poor acted arc
117 her top a tat accord
118 poached tractor at
119 that art cared coop
120 the pro a tat accord
121 heard coop attract
122 that pac coat order
123 that pro a acted roc
124 predator chat taco
125 that pro coated car
126 that pro car cat doe
127 decorator chat pat
128 copra to that cedar
129 a crop to that cadre
130 predator coach tat
131 the part accord tao
132 doctor arc the pat a
133 apart coated torch
134 that capo cat order
135 at tap to her accord
136 toreador catch pat
137 that part cared coo
138 the apt a rot accord
139 decorator chat tap
140 that roar acted cop
141 he act a doctor part
142 doctorate act harp
143 that ape arc doctor
144 that pro a raced cot
145 apart torched taco
146 that era top accord
147 doctor act her apt a
148 tattoo charred cap
149 that cop roared act
150 he cat a doctor part
151 toreador catch tap
152 that coop rated car
153 that cod art cop ear
154 doctorate chap rat
155 that root cared cap
156 that pro car act ode
157 teardrop chat coat
158 that pro accord tea
159 doctor cat her apt a
160 that copra redcoat
161 that pea arc doctor
162 cod car rope that at
163 attached crap root
164 that coca pat order
165 the apt a accord tor
166 pact hat decorator
167 that coo crap trade
168 at to he accord part
169 adapter catch root
170 that coca tap order
171 that pro car cat ode
172 atop attach record
173 that era doctor pac
174 doctor arc the apt a
175 parched car tattoo
176 apart a doctor tech
177 that cod art cop era
178 predator catch oat
179 patched a to carrot
180 that cod ear rat cop
181 orchard act teapot
182 that poor car cadet
183 her pat a tot accord
184 toreador patch act
185 that rat cared coop
186 her pat coco dart at
187 eta catch trapdoor
188 that cop roared cat
189 the tart a cod copra
190 doctorate chat rap
191 cheap at do tractor
192 that cod era rat cop
193 part coached tarot
194 that coo depart car
195 her top act arc toad
196 doctor peach tatar
197 that tar cooped car
198 her pro act coat tad
199 throat accord pate
200 that taro cared cop
201 her top cat arc toad
202 doctorate cat harp
203 hard coat to carpet
204 he pat at doctor car
205 crap tattooed char
206 that pot caca order
207 that tod car cap ore
208 coca depart throat
209 accord rope that at
210 he trap at to accord
211 carrot act pothead
212 poor at catch trade
213 that pro act arc doe
214 redcoat cap throat
215 that ear pot accord
216 he tap at doctor car
217 photo traced carat
218 doctor act the para
219 cod cop rear that at
220 teardrop catch tao
221 parched at to actor
222 her pro cat coat tad
223 tarot depart coach
224 cheap at doctor art
225 pro a catch to trade
226 accord rotate path
227 attached pro to car
228 that cod ear tar cop
229 apart acted cohort
230 that red cocoa part
231 hot a traced to crap
232 chop attracted oar
233 the ara doctor pact
234 that pro cat arc doe
235 orchard cat teapot
236 that rot cop arcade
237 that tod car cap roe
238 toreador patch cat
239 too crap that cedar
240 heard at cart to cop
241 attached actor pro
242 too raced that crap
243 her apt a tot accord
244 rotated coach part
245 reap to that accord
246 harder at act to cop
247 doctorate arc path
248 that coco rap trade
249 that a or pet accord
250 cedar chart potato
251 that orca cop trade
252 heard at act to crop
253 parrot detach coat
254 that pro accord ate
255 heard a cop to tract
256 throat traced capo
257 copra to that cadre
258 her apt coco dart at
259 carrot cat pothead
260 that top cared orca
261 top a charted to car
262 potato raced chart
263 that pro cared taco
264 harder at cat to cop
265 actor cart pothead
266 doctor cat the para
267 hot at cared to crap
268 actor trap cathode
269 rooted a catch part
270 cod car pore that at
271 chop attracted ora
272 heard actor to pact
273 heard at cat to crop
274 captor coat hatred
275 hardcore at to pact
276 that cod era tar cop
277 poor chatted carat
278 that pac order taco
279 top a charred to act
280 throat acted copra
281 the part accord oat
282 raped rot catch to a
283 doctorate cap hart
284 hated actor to crap
285 he cap at doctor art
286 coated crap throat
287 that pro raced coat
288 he act at drop actor
289 throat accord peat
290 top a attach record
291 her top orca act tad
292 cathode act parrot
293 that era pot accord
294 top a cared to chart
295 apart coached trot
296 that coop arc trade
297 her pro taco act tad
298 captor coat thread
299 that art raced coop
300 raped a act to torch
301 doctorate carp hat
302 cheap at rat doctor
303 the pat at or accord
304 potato traced char
305 the tao trap accord
306 he act a doctor tarp
307 atop accord threat
308 that trap cared coo
309 top a charred to cat
310 hop attracted orca
311 that rota cared cop
312 he rat a doctor pact
313 doctorate arch pat
314 cared to that copra
315 heard art act to cop
316 doctorate chat par
317 that pro trade coca
318 he cat at drop actor
319 hoop attracted arc
320 that part raced coo
321 hated at crop to car
322 doctorate arch tap
323 cheap a doctor tart
324 her top orca cat tad
325 crop attracted hao
326 that at corrode pac
327 pro car act to death
328 torpedo chat carat
329 that art cooped arc
330 her pro taco cat tad
331 cathode cat parrot
332 pat are chat doctor
333 raped a cat to torch
334 orator acted patch
335 that oar traced cop
336 that pro act arc ode
337 adapter coat torch
338 that tor cop arcade
339 he cat a doctor tarp
340 retard attach coop
341 that roc top arcade
342 cod arc rope that at
343 teardrop chat taco
344 accord tae that pro
345 heard cot crap to at
346 trader attach coop
347 doctor ace that rap
348 the a tap car doctor
349 teardrop coach tat
350 that root raced cap
351 hot act to raped car
352 tater doctor pacha
353 that coco rat padre
354 heard art cat to cop
355 cataract hoped rot
356 that coco par trade
357 he act a doctor prat
358 tach coat predator
359 cedar act that poor
360 pro a catch to tread
361 torpedo attach arc
362 too crap that cadre
363 the tod rap act orca
364 coo attracted harp
365 too cared that carp
366 pro a chatted to car
367 doctorate chap tar
368 hard taco to carpet
369 patched a rot to car
370 teardrop catch oat
371 that coo crap tread
372 pro car cat to death
373 trap coached tarot
374 top at accord heart
375 he cap a doctor tart
376 deathtrap rat coco
377 accord per that tao
378 port a detach to car
379 cedar attach troop
380 heard act to captor
381 port a cared to chat
382 cadre chart potato
383 each at doctor tarp
384 that pro cat arc ode
385 catch tae trapdoor
386 that tao cared crop
387 raped tor catch to a
388 decorator chap tat
389 that coop rat cedar
390 heard rat act to cop
391 doctorate char pat
392 that ora traced cop
393 hot cat to raped car
394 cedar attract hoop
395 that tao record pac
396 rotted a chap to car
397 coho attracted rap
398 that coo act draper
399 he cat a doctor prat
400 doctorate cart hap
401 that tar cared coop
402 at to he accord tarp
403 doctorate char tap
404 that rat raced coop
405 the tod rap cat orca
406 raptor detach coat
407 a catch to teardrop
408 pet a act to orchard
409 oath traced captor
410 that taro raced cop
411 hot a carted to crap
412 toreador chat pact
413 redcoat crop that a
414 hated art cop to car
415 tattoo charred pac
416 pat heart to accord
417 the cod oar tat crap
418 para trotted coach
419 that coot drape car
420 top a traced to arch
421 tartar coached pot
422 the taro pat accord
423 top car arc to death
424 parrot detach taco
425 parted art to coach
426 hot at crap to cedar
427 tetra doctor pacha
428 that coco drape art
429 top hat cared to car
430 actor patted roach
431 poor at catch tread
432 heard rat cat to cop
433 rotated coach trap
434 that pot cared orca
435 order that cop act a
436 accord patter oath
437 cedar cat that poor
438 harder a cop to tact
439 cathode act raptor
440 top a accord threat
441 hard a cope to tract
442 adapter coach trot
443 rotted a coach part
444 top at to arched car
445 potato charted arc
446 the taro tap accord
447 hot at raced to crap
448 hart accord teapot
449 raped actor to chat
450 hot car cap to trade
451 apart charted coot
452 poor at chatted car
453 pet a cat to orchard
454 apart coached tort
455 heard cat to captor
456 hot at recap to card
457 cadet patch orator
458 that root cared pac
459 that pact or do care
460 photo carted carat
461 pare to that accord
462 the cod ora tat crap
463 tact troop charade
464 that rat cooped arc
465 heard a crop to tact
466 tartar acted pooch
467 that coo cat draper
468 at to he accord prat
469 ahead tact proctor
470 top at earth accord
471 hot at caper to card
472 taco thread captor
473 each at doctor prat
474 top a chart to cedar
475 atop charted actor
476 that rooted car cap
477 the tod par act orca
478 apt trachea doctor
479 hated a cop tractor
480 a top at catch order
481 rooted crap attach
482 heard actor act top
483 her a at doctor pact
484 carrot pat cathode
485 top at act hardcore
486 hated a cart to crop
487 cathode crap tarot
488 that orca top cedar
489 order that cop cat a
490 tat coached parrot
491 that coco rap tread
492 top a raced to chart
493 deathtrap coat roc
494 that orca cop tread
495 pro a traced to chat
496 carrot tap cathode
497 harder coat to pact
498 the apt at or accord
499 cathode cat raptor
500 that roc coat padre

### dalecaldwell:people

input: Dale Caldwell
category: people
phrases 1 to 192 of 192

1 calla dwelled
2 a dwelled call
3 well ded call a
4 called walled
5 dead wall cell
6 we add all cell
7 led called law
8 lewd led call a
9 call dead well
10 lewd del call a
11 call wall deed
12 we call all ded
13 del called law
14 cell well add a
15 call deal weld
16 all del caw led
17 clawed all led
18 we call ell dad
19 all waded cell
20 we call led lad
21 call lead weld
22 all led wed lac
23 clawed all del
24 we call del lad
25 call wade dell
26 all del wed lac
27 well dada cell
28 we all clad led
29 clad deal well
30 call a weld led
31 dale weld call
32 we add ell call
33 clad well lead
34 we all clad del
35 laced all weld
36 we call led dal
37 called all wed
38 well a dad cell
39 lewd deal call
40 clad a weld ell
41 called all dew
42 call a weld del
43 claw deal dell
44 call a wed dell
45 all welded lac
46 we call del dal
47 lewd call lead
48 all ell caw ded
49 laced lad well
50 dell dew call a
51 cad ladle well
52 cell weld lad a
53 call ladle wed
54 cell ded wall a
55 call ladle dew
56 clad a led well
57 claw lead dell
58 led dell claw a
59 clad dale well
60 cell dell wad a
61 called a dwell
62 clad a del well
63 ell called wad
64 del dell claw a
65 deal dwell lac
66 cell weld dal a
67 lewd dale call
68 cad all wed ell
69 call waded ell
70 lac a dwell led
71 lad dwell lace
72 well dell a cad
73 dell aced wall
74 lac a dwell del
75 dell claw dale
76 lewd a lad cell
77 laced dal well
78 cad a dwell ell
79 claw ladle led
80 lac a weld dell
81 laced wall led
82 lewd a dal cell
83 cell ladle wad
84 all dew led lac
85 claw ladle del
86 all dew del lac
87 dale dwell lac
88 ell led caw lad
89 laced wall del
90 lewd dell a lac
91 lac walled led
92 ell del caw lad
93 dal dwell lace
94 cell we all dad
95 laced law dell
96 all ell dew cad
97 calla weld led
98 lac lad wed ell
99 lac walled del
100 lac wad led ell
101 well ded calla
102 ell led caw dal
103 calla weld del
104 cal a dwell led
105 calla wed dell
106 lac wad del ell
107 caw ladle dell
108 ell del caw dal
109 cad walled ell
110 cal a dwell del
111 lac dawdle ell
112 cel all wed lad
113 call awed dell
114 lac dal wed ell
115 clawed lad ell
116 cel all wad led
117 lac ladle weld
118 clad a lewd ell
119 lac waddle ell
120 we all dell cad
121 aced all dwell
122 cel all wad del
123 clad ale dwell
124 cal a weld dell
125 clad lea dwell
126 lewd dell cal a
127 lewd led calla
128 cel all wed dal
129 lewd del calla
130 cal all led wed
131 clawed dal ell
132 cal all led dew
133 lewd ladle lac
134 all lad cel dew
135 dwell lac lead
136 cal all del wed
137 call dade well
138 all law cel ded
139 cel all waddle
140 cal all del dew
141 cal all welded
142 all dal cel dew
143 cade all dwell
144 cel law add ell
145 cade wall dell
146 cal lad wed ell
147 cal walled led
148 lac law led del
149 laced all lewd
150 cad law led ell
151 cal lewd ladle
152 cal dal wed ell
153 cell dade wall
154 cel dwell lad a
155 cal walled del
156 clad lad we ell
157 calla dew dell
158 cad law del ell
159 all dawdle cel
160 cel lad wad ell
161 cal dawdle ell
162 we cal dell lad
163 cal deal dwell
164 cel dwell dal a
165 cal ladle weld
166 clad dal we ell
167 cal waddle ell
168 lac lad dew ell
169 cel walled lad
170 cel dal wad ell
171 alec lad dwell
172 we cal dell dal
173 cel walled dal
174 lac law ded ell
175 alec dal dwell
176 cal wad led ell
177 dwell cal lead
178 lac dal dew ell
179 cell ded walla
180 cal wad del ell
181 lac lad dell we
182 cal law led del
183 cell we lad dal
184 lac dal dell we
185 cel ell law dad
186 cel led lad law
187 cel del lad law
188 cel led dal law
189 cal lad dew ell
190 cal law ded ell
191 cel del dal law
192 cal dal dew ell

### johnmadden:people

input: John Madden
category: people
phrases 1 to 14 of 14

1 damned john
2 john add men
3 demand john
4 dam end john
5 mad end john
6 john man ded
7 john and med
8 john dam den
9 haj mend don
10 dad men john
11 haj mend nod
12 dna med john
13 dan med john
14 nam ded john

### bobpettit:people

input: Bob Pettit
category: people
phrases 1 to 19 of 19

1 bit top bet
2 bit pot bet
3 bit opt bet
4 bot tip bet
5 bot pit bet
6 tet tip bob
7 bet bop tit
8 tet pit bob
9 bit bop tet
10 pet bit bot
11 tit top ebb
12 tet bib top
13 tit pot ebb
14 ebb tip tot
15 pet bib tot
16 ebb pit tot
17 tet bib pot
18 tit opt ebb
19 bib opt tet

### florencepugh:people

input: Florence Pugh
category: people
phrases 1 to 500 of 500

1 cheerful pong
2 longer up chef
3 her glen of cup
4 cheep furlong
5 force help gun
6 her leg cop fun
7 fencer plough
8 he confer plug
9 her elf gun cop
10 long pure chef
11 he cup for glen
12 porch feel gun
13 her fun gel cop
14 punch for glee
15 her glen of cpu
16 he engulf crop
17 her fun peg col
18 he confer gulp
19 her fen up clog
20 cop flung here
21 her gen cop flu
22 leg of puncher
23 her pun go clef
24 up ogle french
25 he clung of rep
26 feel hung crop
27 her flu peg con
28 engulf her cop
29 her fen log cup
30 punch free log
31 her nog up clef
32 punch of leger
33 he clog per fun
34 cheep for lung
35 her flu pen cog
36 chop free lung
37 her nog cup elf
38 chug feel porn
39 up gen for lech
40 chop feel rung
41 her fen lug cop
42 flung her cope
43 on fur help ecg
44 lunch frog pee
45 her pug con elf
46 punch frog lee
47 no fur help ecg
48 her gulf ponce
49 he con per gulf
50 flu green chop
51 her gen cop ful
52 cheer flop gun
53 ecg help of run
54 chef rope lung
55 on lug per chef
56 porch flee gun
57 no lug per chef
58 gel of puncher
59 her fun lop ecg
60 lunge of perch
61 up fern go lech
62 prof gee lunch
63 her ful peg con
64 chef rule pong
65 he cup long ref
66 hen plug force
67 her on pug clef
68 glen pour chef
69 her no pug clef
70 chef glue porn
71 on elf per chug
72 cheep golf run
73 her elf pun cog
74 elf hunger cop
75 on rep lug chef
76 elf go puncher
77 no rep lug chef
78 fur long cheep
79 her ful pen cog
80 lunch fog peer
81 her fen log cpu
82 punch reef log
83 on hug per clef
84 french loge up
85 no hug per clef
86 chef pole rung
87 up ern log chef
88 prof gun leech
89 he clog up fern
90 here clung fop
91 on rep chug elf
92 rolf gee punch
93 no rep chug elf
94 cheer golf pun
95 hep run go clef
96 punch fog reel
97 up elf horn ecg
98 porch fee lung
99 up glen or chef
100 chon free plug
101 on fur peg lech
102 chop reef lung
103 ecg help of urn
104 punch frog eel
105 no fur peg lech
106 hen gulp force
107 on rep hug clef
108 chef prune log
109 no rep hug clef
110 chef lure pong
111 lech peg of run
112 leger chop fun
113 hep gen of curl
114 hence pro gulf
115 he crop leg fun
116 pong cheer flu
117 hep glen of cur
118 hope clung ref
119 up leg nor chef
120 helper cog fun
121 up hen clog ref
122 creep golf hun
123 up ref gel chon
124 porch fuel gen
125 hep leg con fur
126 chug flee porn
127 hep fen go curl
128 clef phone rug
129 lech pen of rug
130 chef lunge pro
131 he gun elf crop
132 ful green chop
133 he cop glen fur
134 chop flee rung
135 he gel fun crop
136 genre chop flu
137 up ern fog lech
138 churn golf pee
139 up gel nor chef
140 ogre punch elf
141 hep urn go clef
142 leg pouch fern
143 ecg pen of hurl
144 fern glue chop
145 hep ref gun col
146 felon per chug
147 he cop lung ref
148 hen cup golfer
149 hep elf run cog
150 elf gore punch
151 he log fern cup
152 ref open gulch
153 he peg flu corn
154 chef pore lung
155 hep elf gun roc
156 plunge or chef
157 lech peg of urn
158 rolf gun cheep
159 hep fun gel roc
160 chore pen gulf
161 he clog rep fun
162 fern plug echo
163 up ern hog clef
164 cheep flog run
165 he cop rung elf
166 rough pen clef
167 he long ref cpu
168 perch ogle fun
169 hun go per clef
170 chef luge porn
171 hep rug con elf
172 clef hope rung
173 hep fur gel con
174 ergo punch elf
175 chug elf per no
176 hence flop rug
177 he con rep gulf
178 chon free gulp
179 he plug ref con
180 rope hung clef
181 he golf ern cup
182 fern pole chug
183 he cup gen rolf
184 punch fog leer
185 go fen help cur
186 lung cheer fop
187 he lug fern cop
188 hen group clef
189 he pen fur clog
190 fence plug rho
191 fun or help ecg
192 rolf hug pence
193 he crop gen flu
194 elf pen grouch
195 cup for leg hen
196 free clop hung
197 he pen gulf roc
198 gulch fee porn
199 he gun ref clop
200 lurch fee pong
201 he cop ern gulf
202 hep frog uncle
203 he corn pug elf
204 chef lope rung
205 hep ref lug con
206 hop clung reef
207 he gulp ref con
208 floe gun perch
209 cur of gen help
210 gen foul perch
211 he peg ful corn
212 leech frog pun
213 hen cog per flu
214 lech grope fun
215 leg or pun chef
216 lung perch foe
217 lech per fun go
218 fun perch loge
219 hep urn cog elf
220 pong leech fur
221 he log fern cpu
222 cheer flog pun
223 he flog ern cup
224 churn flop gee
225 he clop gen fur
226 churn fog peel
227 cup for gel hen
228 rep flung echo
229 hep fen log cur
230 hence lug prof
231 gun or hep clef
232 reef hung clop
233 he plug fen roc
234 crepe golf hun
235 con elf per hug
236 fen glue porch
237 he lug fen crop
238 cheep golf urn
239 curl fog he pen
240 rep chug felon
241 he flop gen cur
242 ochre pen gulf
243 clef he gun pro
244 ref ogle punch
245 he crop gen ful
246 glen pouch ref
247 he pun ref clog
248 fern gulp echo
249 lech rep of gun
250 fop gun lecher
251 lug or pen chef
252 neer chop gulf
253 cur golf he pen
254 goer punch elf
255 ecg he flop run
256 pence fog hurl
257 he curl gen fop
258 perch one gulf
259 hep ern cog flu
260 fen group lech
261 he golf ern cpu
262 ref lunge chop
263 curl of peg hen
264 fore pen gulch
265 fun go rep lech
266 perch fuel nog
267 he clop rug fen
268 chon reef plug
269 cop fur gel hen
270 creep flog hun
271 he pun rolf ecg
272 pong cheer ful
273 cpu for leg hen
274 fern gel pouch
275 hep fen lug roc
276 fence gulp rho
277 fun or peg lech
278 churn flog pee
279 he gulp fen roc
280 flung per echo
281 rug on hep clef
282 chef enrol pug
283 elf or pen chug
284 gene lurch fop
285 rug no hep clef
286 fen plug chore
287 log hen cup ref
288 lecher fog pun
289 pec of her lung
290 loge punch ref
291 hug rep con elf
292 genre chop ful
293 pun or gel chef
294 fencer hug pol
295 her pol fun ecg
296 gruel chop fen
297 hen cog per ful
298 fern luge chop
299 lech pen fur go
300 luger chop fen
301 hug ern cop elf
302 huge porn clef
303 hen leg cop fur
304 fen rope gulch
305 oh leg cup fern
306 gulf peer chon
307 hug or pen clef
308 prone lug chef
309 her on gulf pec
310 perch gone flu
311 leg up ref chon
312 punch fore leg
313 her no gulf pec
314 elf purge chon
315 lug hen cop ref
316 fern lope chug
317 cur flog he pen
318 fencer lug hop
319 cop ref gel hun
320 lech prune fog
321 he flog ern cpu
322 lech forge pun
323 cpu for gel hen
324 clung free hop
325 hep ern cog ful
326 fen purge loch
327 gen up ref loch
328 fop hung creel
329 fer he long cup
330 chon reef gulp
331 hog ern cup elf
332 neer flop chug
333 cog elf per hun
334 pore hung clef
335 oh glen cup ref
336 gulf perch eon
337 ecg he flop urn
338 hug lop fencer
339 on clef per ugh
340 lunch fore peg
341 hun leg cop ref
342 huge fern clop
343 flu nor hep ecg
344 crepe flog hun
345 rug hen cop elf
346 rung leech fop
347 rolf up hen ecg
348 fen gulp chore
349 her pug fen col
350 cheep flog urn
351 ecg elf hop run
352 floe peg churn
353 lech ref go pun
354 fern lug epoch
355 clef rep go hun
356 force hep lung
357 col ref pen hug
358 prone elf chug
359 cup fen gel rho
360 fen luge porch
361 rec help of gun
362 clef prune hog
363 oh rep gun clef
364 nee gulf porch
365 hun or peg clef
366 glee churn fop
367 her nog elf cpu
368 hence for plug
369 roc elf pen hug
370 hep core flung
371 col fen per hug
372 prone hug clef
373 nog up ref lech
374 nog perch flue
375 col fur peg hen
376 clef grope hun
377 lech ern of pug
378 punch fore gel
379 rho leg cup fen
380 gofer pun lech
381 pec he golf run
382 gulf nor cheep
383 pec he long fur
384 fen pore gulch
385 rho up gen clef
386 perch gone ful
387 rec he flop gun
388 hep gulf crone
389 fer he cop lung
390 hence for gulp
391 her leg fon cup
392 hep fore clung
393 leg hop fen cur
394 ochre fen plug
395 ful nor hep ecg
396 clef hue prong
397 clef per gun oh
398 creep flung oh
399 roc flu peg hen
400 hung crop flee
401 cur elf pen hog
402 nee prof gulch
403 rho gen cup elf
404 hep roc engulf
405 rep hug fen col
406 hep ref unclog
407 fro he cup glen
408 ochre fen gulp
409 cor he pen gulf
410 perch neo gulf
411 fer he long cpu
412 fencer plug oh
413 reg he clop fun
414 porch fun glee
415 rpg he fuel con
416 crepe flung oh
417 cpu for glen he
418 confer hep lug
419 cru he pen golf
420 cheep or flung
421 rep hen cog flu
422 porch flu gene
423 gen hop elf cur
424 fencer gulp oh
425 hep leg fun roc
426 ugh prone clef
427 he rpg of uncle
428 chef loner pug
429 ugh rep con elf
430 hong pure clef
431 her flu eng cop
432 fer open gulch
433 gul he cop fern
434 rec phone gulf
435 col ref peg hun
436 gul prone chef
437 fer he plug con
438 crop flung hee
439 cel he gun prof
440 porch ful gene
441 oh fern gel cpu
442 epoch glen fur
443 ugh ref pen col
444 recon hep gulf
445 ecg elf hop urn
446 epoch ref lung
447 rec he golf pun
448 porch flue gen
449 rec up golf hen
450 punch feel gor
451 roc elf peg hun
452 epoch elf rung
453 her flu neg cop
454 pence gulf rho
455 hen log ref cpu
456 corn feel pugh
457 ugh elf pen roc
458 ugh lop fencer
459 on pug ref lech
460 punch golf ere
461 no pug ref lech
462 punch free gol
463 fer he gun clop
464 cpu golfer hen
465 orc he pen gulf
466 clung prof hee
467 ugh fen per col
468 epoch ern gulf
469 ugh ern cop elf
470 french ole pug
471 pec he gun rolf
472 fencer ugh pol
473 ger he clop fun
474 fer ogle punch
475 eng he cup rolf
476 he pec furlong
477 ecg pen flu rho
478 rec engulf hop
479 pec he flog run
480 lunch fog pere
481 gol he cup fern
482 gulch ref peon
483 hun rep cog elf
484 chef repo lung
485 her gel fon cup
486 clough per fen
487 cur fen gel hop
488 punch golf ree
489 on rep ugh clef
490 clef heron pug
491 eng he crop flu
492 lunch fog pree
493 no rep ugh clef
494 pence rolf ugh
495 rpg he cone flu
496 cheer fon plug
497 neg he cup rolf
498 punch fro glee
499 fer he gulp con
500 punch flog ere
