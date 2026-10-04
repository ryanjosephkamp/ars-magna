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

## File 29 of 43: 2901 phrases

### kengriffin:people

input: Ken Griffin
category: people
phrases 1 to 53 of 53

1 finger fink
2 ref fin king
3 fringe fink
4 fern if king
5 ken riffing
6 ink eff ring
7 kin eff ring
8 ken gin riff
9 gen ink riff
10 fig ink fern
11 keg riff inn
12 kin riff gen
13 ref fink gin
14 ink eff grin
15 fig fin kern
16 rink eff gin
17 fen fink rig
18 kin eff grin
19 gen fink fir
20 fig fink ern
21 kin fig fern
22 fen fir king
23 fer fin king
24 eng kin riff
25 fen fig rink
26 neg kin riff
27 reg fink fin
28 fer fink gin
29 ken ring iff
30 eng ink riff
31 ger fink fin
32 neg ink riff
33 ken ing riff
34 ken frig fin
35 eng fink fir
36 neg fink fir
37 fen kif ring
38 ref fink ing
39 ken grin iff
40 eff king rin
41 fern kif gin
42 fen frig ink
43 fen frig kin
44 kern gin iff
45 fen kif grin
46 eff ing rink
47 ern king iff
48 ing fer fink
49 gen rink iff
50 iff eng rink
51 iff neg rink
52 fern kif ing
53 kern ing iff

### amirjangoo:people

input: Amir Jangoo
category: people
phrases 1 to 500 of 500

1 mooing raja
2 ago major in
3 i go an major
4 i arm on jog a
5 morgan jiao
6 i room ganja
7 i room an jag
8 i arm no jog a
9 jingo aroma
10 i jog ramona
11 in a room jag
12 i jar mon go a
13 angio major
14 goa major in
15 i roam an jog
16 i ram on jog a
17 goji ramona
18 i maroon jag
19 i rag an mojo
20 i ram no jog a
21 jingo amaro
22 ago arm join
23 an a rig mojo
24 i mar on jog a
25 mooing ajar
26 mara go join
27 on jam go air
28 i mar no jog a
29 i moor ganja
30 i moor an jag
31 in a or go jam
32 on jog maria
33 jig room an a
34 an jam or i go
35 no jog maria
36 go in major a
37 a or i man jog
38 ago ram join
39 on raj go aim
40 an a i jog rom
41 mojo grain a
42 on jar go aim
43 a nor i go jam
44 a mooing raj
45 no raj go aim
46 mon or i jag a
47 major go ani
48 in mojo rag a
49 on rom i jag a
50 a mooing jar
51 in a moor jag
52 no rom i jag a
53 on jar amigo
54 on a jog amir
55 a or i jam nog
56 amigo jar no
57 no a jog amir
58 i go mon a raj
59 ago jam iron
60 on a roam jig
61 mor i jog an a
62 go ain major
63 no a roam jig
64 jim or go an a
65 maar go join
66 on a jam giro
67 i jam gor on a
68 ago mar join
69 no a jam giro
70 i jag mor on a
71 goa arm join
72 i jog roman a
73 i jag mor no a
74 jig maroon a
75 on a jog rami
76 nam or i jog a
77 jingo roam a
78 no a jog rami
79 a nom i go raj
80 jag air moon
81 jig moor an a
82 nom or i jag a
83 on jig aroma
84 in moa go raj
85 gor i jam a no
86 no jig aroma
87 go join arm a
88 go i jar a nom
89 on raj amigo
90 i jar ago mon
91 no raj amigo
92 i jog on mara
93 raj go amnio
94 i go ajar mon
95 jar go amnio
96 i roam on jag
97 goa ram join
98 i jog no mara
99 goon air jam
100 i roam no jag
101 jig room ana
102 ain rom jog a
103 goo rain jam
104 go join ram a
105 goa jam iron
106 in or ago jam
107 main jar goo
108 go air jam no
109 jog air moan
110 go iron jam a
111 goa mar join
112 i jag moron a
113 nag air mojo
114 i go mon raja
115 ani room jag
116 go join mar a
117 raj moo gain
118 an aim or jog
119 gain jar moo
120 i jog on maar
121 jag air mono
122 i jog no maar
123 goon aim raj
124 i rang mojo a
125 jag rain moo
126 i jog a manor
127 goon aim jar
128 a or main jog
129 on jiao gram
130 i moan raj go
131 no jiao gram
132 go aim jar no
133 mon jog aria
134 go i jar moan
135 jag ain room
136 jog in roam a
137 mojo gan air
138 i man raj goo
139 oar join mag
140 go i jam roan
141 ana rig mojo
142 jam or in goa
143 raja moo gin
144 maja or go in
145 go iron maja
146 go in jam oar
147 ora join mag
148 nog i major a
149 aga join rom
150 aim or on jag
151 mina jar goo
152 aim or no jag
153 moa join rag
154 go in jam ora
155 in mojo agar
156 i go noma raj
157 ain jog roam
158 go i jar noma
159 jog air noma
160 jog i man oar
161 mon rag jiao
162 i ran jam goo
163 rani jam goo
164 jog i man ora
165 on maja giro
166 an moa or jig
167 no maja giro
168 i nor ago jam
169 jog in aroma
170 go in jar moa
171 main raj goo
172 a or join mag
173 jig moon ara
174 i jar mon goa
175 oar join gam
176 mongo i jar a
177 jog rain moa
178 goo i jar man
179 jog aim roan
180 a or join gam
181 jiao arm nog
182 moa or in jag
183 ora join gam
184 jig moo ran a
185 go amino raj
186 i arm ono jag
187 jig moor ana
188 jog ion arm a
189 go amino jar
190 moo a gin raj
191 moa join gar
192 a or jog mina
193 mara jog ion
194 i jag mon oar
195 jag roam ion
196 i jam ono rag
197 moa iron jag
198 i moo raj nag
199 ain mojo gar
200 jog air a mon
201 rani moo jag
202 ain jam or go
203 oar jog mina
204 i ran moa jog
205 ono rig maja
206 i jag mon ora
207 ani roam jog
208 i jog ara mon
209 ara gin mojo
210 i jog ana rom
211 ora jog mina
212 a or moan jig
213 ono jag amir
214 i ram ono jag
215 mojo rag ani
216 jog ion ram a
217 ono jig mara
218 i moo raj gan
219 mania or jog
220 i moo jar gan
221 magi jar ono
222 maja nor i go
223 jiao ram nog
224 jam or go ani
225 jig moan oar
226 i jar ono mag
227 ani moor jag
228 i jam ono gar
229 amino or jag
230 a nor aim jog
231 rom nag jiao
232 jag ran i moo
233 jig moan ora
234 i mar ono jag
235 rag ain mojo
236 jog ion mar a
237 ono jag rami
238 jag a rim ono
239 anima or jog
240 i jar ono gam
241 jag ain moor
242 a or jig noma
243 moa jog rani
244 i or moan jag
245 maar jog ion
246 gin jar a moo
247 jiao mar nog
248 in mojo a gar
249 amnio or jag
250 nag jar i moo
251 rom gan jiao
252 rig jam a ono
253 ono jig maar
254 jig arm a ono
255 oar jig noma
256 i nor jam goa
257 ora jig noma
258 a oar jig mon
259 roan jig moa
260 goo nim jar a
261 jog main oar
262 a ora jig mon
263 jim on agora
264 noma or i jag
265 jog main ora
266 nog i jam oar
267 goji roman a
268 jig ram a ono
269 ajar nim goo
270 a nor jig moa
271 jiao nor mag
272 nog i jam ora
273 moira on jag
274 mano i go raj
275 amaro in jog
276 mano i go jar
277 gin ajar moo
278 goji on arm a
279 i ajar mongo
280 goji no arm a
281 moira an jog
282 rom ion jag a
283 jiao nor gam
284 jig mar a ono
285 amaro on jig
286 a oar jog nim
287 raga in mojo
288 ami on go raj
289 goji on mara
290 ami on go jar
291 i jag romano
292 ami no go raj
293 goji no mara
294 nom i go raja
295 jig mono ara
296 rai on go jam
297 ago roan jim
298 rom a jog ani
299 mora ain jog
300 agro i jam no
301 goji on maar
302 ami no go jar
303 ago jam noir
304 rai no go jam
305 goji no maar
306 nog i jar moa
307 jim roan goa
308 a ora jog nim
309 goo mina raj
310 ria on go jam
311 agora jim no
312 ria no go jam
313 maga or join
314 goji on ram a
315 ago jam nori
316 mora in jog a
317 gama or join
318 mora i jag no
319 jig romano a
320 goji no ram a
321 jag moira no
322 jim nor ago a
323 ago roam jin
324 moa nor i jag
325 go nai major
326 mora on jig a
327 goo nim raja
328 mora no jig a
329 gar jiao mon
330 goji on mar a
331 goji man oar
332 mair on jog a
333 goji man ora
334 goji no mar a
335 angio or jam
336 mair no jog a
337 ing ajar moo
338 an a goji rom
339 magi raj ono
340 jim or an goa
341 jig amaro no
342 nam i jar goo
343 aga jin room
344 i agro on jam
345 go jin aroma
346 jim or on aga
347 jingo mora a
348 jim or no aga
349 jag nai room
350 noo i arm jag
351 gar ani mojo
352 i mora on jag
353 nai roam jog
354 noo i jam rag
355 jog air mano
356 ago a jin rom
357 goji manor a
358 an mojo gar i
359 ama or jingo
360 nom i jar goa
361 mig ajar ono
362 goji or man a
363 goa roam jin
364 i mora an jog
365 go noir maja
366 mor i jog ana
367 jag rai moon
368 i nom ago raj
369 goo jin mara
370 noo i ram jag
371 jargon moa i
372 ami or on jag
373 jag ria moon
374 nam i jog oar
375 goa jam noir
376 ami or no jag
377 mongo i raja
378 i gor on maja
379 agro jam ion
380 i gor no maja
381 jog iron ama
382 nam i jog ora
383 aga join mor
384 i or maja nog
385 goon jim ara
386 ama or in jog
387 goon ami raj
388 noo i jar mag
389 goon ami jar
390 noo i jam gar
391 goon rai jam
392 jim or go ana
393 roam an goji
394 go jim roan a
395 go nori maja
396 ami or an jog
397 goon ria jam
398 noo i mar jag
399 goo amin raj
400 ama or on jig
401 goa jam nori
402 a mor ain jog
403 goo amin jar
404 ama or no jig
405 aga jin moor
406 noo i jar gam
407 rag nai mojo
408 go jim on ara
409 jog rai moan
410 an ago or jim
411 agar jim ono
412 go jim no ara
413 goo jin maar
414 nom i jag oar
415 nag rai mojo
416 go jim an oar
417 gor jiao man
418 nom i jag ora
419 jag nai moor
420 nom i jog ara
421 goo rin maja
422 goo jim ran a
423 jog ria moan
424 go jim an ora
425 agar jin moo
426 rai mon jog a
427 nag ria mojo
428 ing a moo raj
429 jog ami roan
430 ria mon jog a
431 jag rai mono
432 nai or go jam
433 magi jar noo
434 amin or jog a
435 aga rin mojo
436 jin a moo gar
437 gar nai mojo
438 mano or jig a
439 jag ria mono
440 goo jin arm a
441 jog amin oar
442 go jin roam a
443 jig mano oar
444 ago raj i mon
445 jog amin ora
446 go noir jam a
447 jag mora ion
448 nai rom jog a
449 ing raja moo
450 jim agro on a
451 jig mano ora
452 jim agro no a
453 jog rai noma
454 goo jin ram a
455 jog ria noma
456 gor ion jam a
457 jag mair ono
458 ami nor jog a
459 rig maja noo
460 mor ion jag a
461 jog aria nom
462 jog air a nom
463 an mora goji
464 go nori jam a
465 jag amir noo
466 mor a jog ani
467 jig mara noo
468 a nor jim goa
469 goji moa ran
470 rin a jog moa
471 ing mojo ara
472 i mana or jog
473 goji mon ara
474 i mano or jag
475 mig raja ono
476 goo jin mar a
477 gan rai mojo
478 nom a jig oar
479 ago mora jin
480 goo rin jam a
481 goji rom ana
482 rig jam a noo
483 rag jiao nom
484 nom a jig ora
485 nag jiao mor
486 jig arm a noo
487 gan ria mojo
488 ago jar i nom
489 jag rami noo
490 goo nim raj a
491 go jin amaro
492 ajar nom i go
493 jog ani mora
494 jig ram a noo
495 jag moa noir
496 goji mor an a
497 ama gor join
498 rag a jim ono
499 raga jim ono
500 jig mar a noo

### vithyaramraj:people

input: Vithya Ramraj
category: people
phrases 1 to 302 of 302

1 him tarry java
2 my vat jar hair
3 my a var hit raj
4 java marry hit
5 my raj via hart
6 my var i hat raj
7 haji marry vat
8 my jar via hart
9 my var i jar hat
10 java ray mirth
11 my var hit raja
12 my var i rat haj
13 haj via martyr
14 arm via thy raj
15 hit jar my var a
16 rajah tram ivy
17 arm via thy jar
18 my var i tar haj
19 tram vary haji
20 my var rat haji
21 my at jar var hi
22 mart vary haji
23 ram via thy raj
24 rah i jar my vat
25 mitra vary haj
26 ram via thy jar
27 tha i jar my var
28 arty vim rajah
29 thy air jam var
30 myth i jar var a
31 hi java martyr
32 mar via thy raj
33 my at var hi raj
34 jarrah mat ivy
35 mar via thy jar
36 hi jam try var a
37 rajah mart ivy
38 my var tar haji
39 my vat i rah raj
40 vita marry haj
41 my ajar var hit
42 my var i tha raj
43 rajah tray vim
44 i try java harm
45 i taj rah my var
46 mirth java rya
47 thy var aim raj
48 haj i my art var
49 harry tim java
50 thy aim jar var
51 myth i raj var a
52 harry vita jam
53 trim a vary haj
54 rajah vary tim
55 him vary at raj
56 my vita jarrah
57 him vary at jar
58 myrrh ait java
59 harry i jam vat
60 jarrah tam ivy
61 thy vim jar ara
62 mirth java yar
63 harm ivy jar at
64 i vary raj math
65 i vary jar math
66 i vary jam hart
67 it harm var jay
68 it vary raj ham
69 him ray vat raj
70 it vary jar ham
71 him jar ray vat
72 him rat var jay
73 it vary arm haj
74 arm raj hat ivy
75 hat ivy jar arm
76 my vat raj hair
77 at raj harm ivy
78 it vary ram haj
79 hit jay arm var
80 ham ivy jar art
81 try vim aah raj
82 try vim aah jar
83 ram raj hat ivy
84 him tar var jay
85 hat ivy jar ram
86 i vary tram haj
87 i vary mart haj
88 rat raj ham ivy
89 ham ivy jar rat
90 haj i marry vat
91 it vary mar haj
92 hit jay ram var
93 mar raj hat ivy
94 hat ivy jar mar
95 him jar rya vat
96 vim try a rajah
97 ray raj hat vim
98 ham via raj try
99 hat vim jar ray
100 ham via jar try
101 tar raj ham ivy
102 hit jay mar var
103 var may hit raj
104 ham ivy jar tar
105 hit jar may var
106 hi java arm try
107 my var art haji
108 haj via arm try
109 hay vim jar art
110 art raj ham ivy
111 hit jam var ray
112 hi java ram try
113 rat raj hay vim
114 hay vim jar rat
115 hay rim jar vat
116 haj via ram try
117 haj ivy arm art
118 ava him try raj
119 hi art vary jam
120 hi java mar try
121 hi vat jar army
122 haj ivy arm rat
123 haj rim vary at
124 tar raj hay vim
125 haj via mar try
126 hay vim jar tar
127 rath via my raj
128 hi rat vary jam
129 rath via my jar
130 haj ivy ram art
131 hat vim jar rya
132 art raj hay vim
133 haj ivy ram rat
134 hat rim jay var
135 var yam hit raj
136 hit jar yam var
137 haj aim var try
138 hi var try maja
139 taj i vary harm
140 haj vim tarry a
141 haj ivy arm tar
142 haj ivy mar art
143 hi tar vary jam
144 art ray vim haj
145 hay rim raj vat
146 mat raj vary hi
147 mat jar vary hi
148 haj ivy mar rat
149 jim a harry vat
150 hit jam var rya
151 hi tam vary raj
152 hi tam vary jar
153 aha vim try raj
154 haj vim rat ray
155 hi var jam tray
156 aha vim try jar
157 him jar try ava
158 haj ivy ram tar
159 i jarrah my vat
160 haj rim ray vat
161 rah it vary jam
162 my var taj hair
163 hi jay tram var
164 rath i vary jam
165 thy vim raj ara
166 haj ivy mar tar
167 rya raj hat vim
168 haj vim try ara
169 my var rajah it
170 haj vim tar ray
171 taj him ray var
172 yah vim jar art
173 yah raj rat vim
174 yah vim jar rat
175 yah vat rim raj
176 yah rim jar vat
177 thy rim jar ava
178 yah raj tar vim
179 yah vim jar tar
180 haj vim rat rya
181 haj rim rya vat
182 hart jim vary a
183 jim var ray hat
184 haj vim tar rya
185 tha raj arm ivy
186 tha ivy jar arm
187 him jar yar vat
188 thy ara jim var
189 rah ivy jam art
190 thy var ami raj
191 jim var hay art
192 rah ivy jam rat
193 tha raj ram ivy
194 tha ivy jar ram
195 myrrh via taj a
196 hi jam arty var
197 tha raj mar ivy
198 tha ivy jar mar
199 rah ivy jam tar
200 mat raj rah ivy
201 tha raj ray vim
202 mirth jay var a
203 rah ivy jar mat
204 tha vim jar ray
205 tim var hay raj
206 mir var hat jay
207 rah ivy jar tam
208 rah jay rat vim
209 thy ami jar var
210 jim rya hat var
211 thy rai jam var
212 tim var ray haj
213 ami var try haj
214 mir vat hay raj
215 thy ria jam var
216 harry vim taj a
217 hi raj army vat
218 aah var jim try
219 thy rim raj ava
220 yar raj hat vim
221 haj rim try ava
222 hay jim rat var
223 rah jay tar vim
224 haj mir vary at
225 rah via jam try
226 my raj vita rah
227 my jar vita rah
228 myth i ajar var
229 hay tim jar var
230 hit jam var yar
231 hay jim tar var
232 tha vim jar rya
233 rath jim vary a
234 hay mir jar vat
235 yar vim rat haj
236 rah jim vary at
237 hi jay mart var
238 yah jim rat var
239 haj mir ray vat
240 thy raj ava mir
241 thy jar ava mir
242 yah vim raj art
243 hay rim taj var
244 ahi jam var try
245 yar vim tar haj
246 yah tim jar var
247 yah jim tar var
248 him yar vat raj
249 myrrh it java a
250 rah rim jay vat
251 him jay art var
252 yah mir jar vat
253 rah jim ray vat
254 haj vim art rya
255 tha rim jay var
256 myrrh i java at
257 haj rim yar vat
258 hat vim jar yar
259 i ava taj myrrh
260 taj rah arm ivy
261 hi taj arm vary
262 ava mir try haj
263 aha var jim try
264 taj rah ram ivy
265 yar jim hat var
266 him taj var rya
267 hi taj army var
268 hi taj ram vary
269 him raj rya vat
270 yah jim art var
271 taj rah mar ivy
272 myth i raja var
273 taj rah ray vim
274 hi taj mar vary
275 haj it army var
276 him yar taj var
277 rah vim jay art
278 yah tim raj var
279 yar tha jar vim
280 rah ivy raj tam
281 yah mir raj vat
282 tha jim var ray
283 haj tim var rya
284 ava jim rah try
285 yah rim taj var
286 haj mir rya vat
287 raj yar tha vim
288 hay mir taj var
289 rah tim jay var
290 tha vim raj rya
291 var yar tim haj
292 rah mir jay vat
293 rah jim rya vat
294 tha mir jay var
295 haj mir yar vat
296 tha jim var rya
297 yah mir taj var
298 haj vim art yar
299 rah jim yar vat
300 yar jim tha var
301 yar taj rah vim
302 rah vim taj rya

### donniebrasco:titles

input: Donnie Brasco
category: titles
phrases 1 to 500 of 500

1 sabine cordon
2 i second baron
3 i rob an second
4 i be an on cords
5 sabine condor
6 robin second a
7 in doors be can
8 i be an no cords
9 onside carbon
10 robin does can
11 bored no is can
12 an on sec do rib
13 braced onions
14 indoors be can
15 i codes an born
16 an no sec do rib
17 debonair cons
18 once do brains
19 an sir be condo
20 i be no on cards
21 corned bonsai
22 carbon does in
23 i second an orb
24 i don on be cars
25 canine broods
26 once said born
27 sober in do can
28 i don no be cars
29 scenario bond
30 i drones bacon
31 i does an bronc
32 i don son be car
33 broaden coins
34 soon can bride
35 in born do case
36 an in ors be doc
37 broaden icons
38 robin don case
39 on don is brace
40 i don on be scar
41 deacons robin
42 an inbred coos
43 one don is crab
44 i bes an on cord
45 ordinance sob
46 i condone bars
47 on in do braces
48 i don no be scar
49 candies boron
50 i beans cordon
51 in bones do car
52 i bes an no cord
53 deacon robins
54 beacon don sir
55 nice born do as
56 i be on card son
57 broaden scion
58 once in boards
59 on in score bad
60 i be no card son
61 cordoba nines
62 on nice boards
63 bone don is car
64 i don corn be as
65 barons coined
66 an scorned obi
67 on no bird case
68 an in sod be roc
69 narc nobodies
70 i beans condor
71 on bond is care
72 i don scorn be a
73 ordinance bos
74 no nice boards
75 an crib do ones
76 an in dos be roc
77 canon disrobe
78 so dance robin
79 said no be corn
80 an on ids be roc
81 brained coons
82 i crane dobson
83 an core is bond
84 an no ids be roc
85 canines brood
86 on side carbon
87 on nice do bars
88 i be on can rods
89 brandies coon
90 no side carbon
91 in don rob case
92 i be no can rods
93 carnie dobson
94 on code brains
95 no nice do bars
96 i bed no on cars
97 broaden sonic
98 on disrobe can
99 an bid score no
100 i bred so on can
101 ordnance bios
102 on birds ocean
103 an in rob codes
104 i bred so no can
105 onboard since
106 brains code no
107 on in does crab
108 i don corns be a
109 can disrobe no
110 on no cries bad
111 i end so rob can
112 so don carbine
113 an score do bin
114 an in ors be cod
115 ocean birds no
116 one bond is car
117 i bend so on car
118 boar second in
119 done no is crab
120 i do so can bren
121 once in broads
122 an crib do nose
123 i card so on ben
124 on nice broads
125 one corn is bad
126 i bend so no car
127 i nodes carbon
128 in door be scan
129 i beds no on car
130 no nice broads
131 on side rob can
132 i card so no ben
133 on ascribe don
134 an doc is boner
135 i don so be narc
136 no ascribe don
137 in door be cans
138 i be son can rod
139 i bond corneas
140 on bone is card
141 i don so can reb
142 cabin don rose
143 i does born can
144 i be don ran cos
145 born is deacon
146 i don sober can
147 on do sir be can
148 so bonnie card
149 in born codes a
150 on is don be car
151 nice do barons
152 on red is bacon
153 no do sir be can
154 don bear coins
155 on rib does can
156 car be don is no
157 i bonds cornea
158 no red is bacon
159 i bed no on scar
160 on codes brain
161 an in robs code
162 i end so on crab
163 one brains doc
164 in odors be can
165 an in ods be roc
166 cab don senior
167 on in board sec
168 i end so no crab
169 in care dobson
170 in score bond a
171 i don on sec bar
172 i snored bacon
173 no in board sec
174 i do on be narcs
175 bison don care
176 on in bread cos
177 i do on can rebs
178 brain codes no
179 an irons be doc
180 an cis no do reb
181 soon nice brad
182 on bond is race
183 i don no sec bar
184 broad nice son
185 in bone do cars
186 so in don be car
187 in done cobras
188 no in bread cos
189 i do no be narcs
190 on bad cronies
191 done no cab sir
192 i do no can rebs
193 scared boon in
194 on end is cobra
195 i don son be arc
196 on sonic bread
197 an sob rice don
198 i don on be arcs
199 card be onions
200 on in code bars
201 i don no be arcs
202 can bid sooner
203 on sec do brain
204 i corn on bed as
205 i condone bras
206 no end is cobra
207 i be on sad corn
208 on coins bread
209 on no crab side
210 i corn no bed as
211 i sob ordnance
212 born don is ace
213 i be no sad corn
214 bacon don rise
215 in don be orcas
216 i do on scar ben
217 nice don boars
218 i don born case
219 i don ors be can
220 once on braids
221 i second on bar
222 i do no scar ben
223 brain code son
224 on don ice bars
225 i corn son bed a
226 bread coins no
227 done orb is can
228 i corn so bend a
229 once no braids
230 i second no bar
231 i don nos be car
232 i broaden cons
233 no don ice bars
234 i do son be narc
235 i bean condors
236 on don rib case
237 i corn on beds a
238 crab don noise
239 in ones do crab
240 i do ben corn as
241 on bird oceans
242 in bronc does a
243 no is on be card
244 on dies carbon
245 an in sec brood
246 i brad no on sec
247 bacon do siren
248 on core is band
249 i end so orb can
250 oceans bird no
251 no don rib case
252 i corn no beds a
253 i dances boron
254 on son rice bad
255 i be on darn cos
256 carbon dies no
257 on code is barn
258 i corn so be dna
259 done carbon is
260 on no die crabs
261 i be no darn cos
262 ocean ribs don
263 no son rice bad
264 i cab on red son
265 cards be onion
266 no code is barn
267 i do son can reb
268 i conned boars
269 on in bears doc
270 i sob on red can
271 cabin do senor
272 on nice do bras
273 so on in be card
274 soon nicer bad
275 on no care dibs
276 i cab no red son
277 cabin don sore
278 an cos iron bed
279 i sob no red can
280 an bodies corn
281 an orbs code in
282 i do on sec barn
283 board cones in
284 an rib codes no
285 so no in be card
286 carbon die son
287 in cos bond are
288 i be son ran doc
289 are bond coins
290 on in codes bar
291 i do no sec barn
292 on sonic beard
293 base corn do in
294 on do in be cars
295 don bears coin
296 no in bears doc
297 i cord as on ben
298 i scanned boor
299 on no bids care
300 no do in be cars
301 carbine do son
302 i don on braces
303 i cabs no on red
304 on coins beard
305 no nice do bras
306 i cord as no ben
307 beard coins no
308 an bod score in
309 don is corn be a
310 ocean bird son
311 on in beard cos
312 i dons on be car
313 nice born soda
314 born doe is can
315 i nods on be car
316 cones do brain
317 i don no braces
318 i don so arc ben
319 soon red cabin
320 on rise don cab
321 i end on bar cos
322 robin dose can
323 in don orb case
324 son do in be car
325 onboard sec in
326 one con birds a
327 i dons no be car
328 bacon don sire
329 an cob don rise
330 i nods no be car
331 baron codes in
332 no in beard cos
333 i nod on be cars
334 can bird noose
335 on con is bread
336 i don on sec bra
337 dancers boo in
338 on dies rob can
339 i scab no on red
340 soon braced in
341 on bins do care
342 i end no bar cos
343 con does brain
344 no dies rob can
345 i nod no be cars
346 once sad robin
347 an iron be docs
348 i bed so on narc
349 on birds canoe
350 an orb codes in
351 i don no sec bra
352 once sin board
353 in nose do crab
354 i rob so can den
355 drone is bacon
356 i don one crabs
357 i bed so no narc
358 on drone basic
359 on rice bonds a
360 so rid on be can
361 in bear condos
362 an sir bed coon
363 i cab so on nerd
364 in bears condo
365 an core do bins
366 so rid no be can
367 canoe birds no
368 an rib code son
369 i nod son be car
370 bacon ride son
371 on in cores bad
372 i cab so no nerd
373 bare sonic don
374 on rose bid can
375 i be on scan rod
376 barons code in
377 on bin does car
378 i bed on ran cos
379 basic drone no
380 i can bored son
381 i don on bes car
382 soon bind care
383 on siren do cab
384 i be no scan rod
385 brad coins one
386 no rice bonds a
387 i bed no ran cos
388 on rides bacon
389 i bodes an corn
390 i don no bes car
391 done sonic bar
392 an son rob dice
393 i be on card nos
394 ocean bond sir
395 on in cord base
396 i con so be darn
397 cone do brains
398 no bin does car
399 i be no card nos
400 carbon dose in
401 in one brad cos
402 no is on bed car
403 in race dobson
404 no siren do cab
405 i be on ran docs
406 are bonds coin
407 on no birds ace
408 i cab no on reds
409 bacon rides no
410 an cod is boner
411 i be on cans rod
412 barons ice don
413 i drones an cob
414 i be no ran docs
415 car bed onions
416 on crone is bad
417 i end on sob car
418 bison don race
419 bare cos don in
420 i scar no on deb
421 in board scone
422 on son bid care
423 i corn on be ads
424 so drone cabin
425 on no bid cares
426 i be no cans rod
427 soon rice band
428 on one bids car
429 so on in bed car
430 said bone corn
431 in senor do cab
432 i can on red bos
433 ones brain doc
434 on orb is dance
435 i end no sob car
436 soon ice brand
437 an bored cos in
438 i corn no be ads
439 on bonds erica
440 i dose an bronc
441 on do in be scar
442 robin don aces
443 an in rob coeds
444 so no in bed car
445 once bonds air
446 bad crone is no
447 i can no red bos
448 once bad irons
449 done in bar cos
450 i do sen rob can
451 car bond noise
452 one doc is barn
453 i crab so on den
454 erica bonds no
455 no son bid care
456 i bed on arc son
457 said born cone
458 on no bid scare
459 no do in be scar
460 scone do brain
461 boned no is car
462 i crab so no den
463 brains cod one
464 an bid core son
465 i bed no arc son
466 one born acids
467 an side rob con
468 i bed no on arcs
469 once born aids
470 in cons be road
471 i end so con bar
472 i ascend boron
473 on bin do cares
474 on is rod be can
475 i banes cordon
476 on sir bode can
477 i do cos ran ben
478 don bear icons
479 on side orb can
480 i bend so on arc
481 one card bison
482 ain no be cords
483 can be rod is no
484 sacred boon in
485 an door bin sec
486 i nod on be scar
487 bad corn noise
488 in sec do baron
489 i bend so no arc
490 boron is dance
491 in son bear doc
492 i corn as on deb
493 once rabid son
494 on bin do scare
495 i nod no be scar
496 a bond cronies
497 no sir bode can
498 on is ben do car
499 barn disco one
500 nice son do bra

### sophiabush:people

input: Sophia Bush
category: people
phrases 1 to 500 of 500

1 us hop sahib
2 his bosh up a
3 a sob i up shh
4 push his boa
5 his hob up as
6 us shh i bop a
7 his hub soap
8 a bus his hop
9 shh i up bos a
10 push has obi
11 bush hop is a
12 a pub i so shh
13 hos up sahib
14 i shop bush a
15 hao bus ship
16 a sub his hop
17 his pubs hao
18 his hob ups a
19 hao sub ship
20 his hub sop a
21 hao bus hips
22 posh hub is a
23 obi push ash
24 i has up bosh
25 hao bush sip
26 i bush posh a
27 poi has hubs
28 i hop bush as
29 hash bus poi
30 up hob is ash
31 hub piss hao
32 a hob his sup
33 boa sip hush
34 up hiss hob a
35 ash bush poi
36 a hob his pus
37 ais bush hop
38 i ash up bosh
39 shah bus poi
40 i bash up hos
41 hao sub hips
42 oh his up abs
43 hao subs hip
44 i hop bus has
45 pia sob hush
46 is hub shop a
47 hub shop ais
48 i push bosh a
49 pia bush hos
50 hub so ship a
51 bis push hao
52 i hash up bos
53 hao bush psi
54 so hip bush a
55 pub hiss hao
56 oh his up bas
57 obi hush spa
58 i shop hub as
59 psi hush boa
60 i shops hub a
61 hash sub poi
62 is up has hob
63 obi hush pas
64 i shop hubs a
65 poi hush abs
66 i bush hops a
67 has bush poi
68 i so hash pub
69 obi hush sap
70 i hop sub has
71 sou bash phi
72 ahh i up boss
73 bos hush pia
74 us hop i bash
75 shah sub poi
76 i so bush hap
77 obi ups hash
78 is hush bop a
79 hao bush pis
80 oh i has pubs
81 hao subs phi
82 i push hob as
83 ais bop hush
84 hah i up boss
85 ais hob push
86 us hob hip as
87 pis hush boa
88 us ship hob a
89 obi sup hash
90 is hub hop as
91 obi ups shah
92 i has hos pub
93 poi hush bas
94 i as posh hub
95 hub sips hao
96 is hubs hop a
97 obi sup shah
98 i has ops hub
99 hubs sip hao
100 i so hush bap
101 pus hash obi
102 i hop bus ash
103 poi ash hubs
104 us bop i hash
105 obi hush asp
106 ahh i up sobs
107 hubs hop ais
108 hub so hip as
109 bah his soup
110 i hop hubs as
111 pia boss huh
112 oh i pass hub
113 soap bush hi
114 hubs so hip a
115 bias ops huh
116 oh i push abs
117 bash hip sou
118 i hop hub ass
119 his bush pao
120 hub so is hap
121 posh hub ais
122 i up bos shah
123 abo his push
124 oh i bush spa
125 bass poi huh
126 hah i up sobs
127 oba his push
128 i so haps hub
129 oh ups sahib
130 oh up is bash
131 his bush opa
132 oh i bush pas
133 boa piss huh
134 i so hap hubs
135 his bush apo
136 i hop sub ash
137 bias oh push
138 oh i push bas
139 sho up sahib
140 oh i bush sap
141 bias sop huh
142 i ups hob has
143 bah his opus
144 i sop hub has
145 his hub apos
146 a bop i shush
147 pia sobs huh
148 us hob hips a
149 bios up hash
150 huh i bop ass
151 bash hi soup
152 a hob push is
153 bapu his hos
154 i sup hob has
155 bios up shah
156 oh i ups bash
157 his hubs pao
158 his pub oh as
159 his bosh pau
160 his pubs oh a
161 sahib oh sup
162 oh i ash pubs
163 pass obi huh
164 a bus hip hos
165 boa sips huh
166 oh i sup bash
167 his hubs opa
168 oh i bus haps
169 sahib oh pus
170 as bop i hush
171 his hubs apo
172 hash sob i up
173 ahi posh bus
174 i hob pus has
175 ahi bus shop
176 shah sob i up
177 bash hi opus
178 his hos pub a
179 soap bis huh
180 us is hob hap
181 bah hip sous
182 i ash hos pub
183 soap hubs hi
184 oh i bash pus
185 ahi bush ops
186 oh i subs hap
187 soaps hub hi
188 oh i bush asp
189 ahh subs poi
190 i bus hos hap
191 ahi posh sub
192 his ops hub a
193 bah ship sou
194 soph is hub a
195 sha bush poi
196 i ash ops hub
197 ahh bis soup
198 hi so up bash
199 ahi sub shop
200 hi so has pub
201 has bio push
202 hops is hub a
203 hah subs poi
204 us hob i haps
205 bap sushi oh
206 ahh i bus ops
207 sau hip bosh
208 us i bop shah
209 ahi bush sop
210 a sub hip hos
211 ahi sob push
212 huh i sob spa
213 hah bis soup
214 oh i sub haps
215 ash bio push
216 ahh so is pub
217 saps obi huh
218 huh i sob pas
219 sash hub poi
220 us hob phi as
221 ahh obi puss
222 oh i saps hub
223 bio ups hash
224 huh i sob sap
225 ahi bus soph
226 oh i sap hubs
227 ahi bus hops
228 us i hap bosh
229 ahi subs hop
230 hah i bus ops
231 shah obi pus
232 i sub hos hap
233 bio ups shah
234 hi up has sob
235 soba hi push
236 oh up has bis
237 abo sip hush
238 oh pub is ash
239 ais hub soph
240 sash hob i up
241 ais hub hops
242 a bus ship oh
243 sau hob ship
244 oh hub piss a
245 pia hubs hos
246 i sop hub ash
247 oba sip hush
248 hah so is pub
249 hao hubs psi
250 oh bus is hap
251 hah obi puss
252 ahh i sub ops
253 ahh bis opus
254 hi us hop abs
255 bias hos hup
256 i hap sos hub
257 spa bio hush
258 ahh i sop bus
259 ahi sub soph
260 i sap hos hub
261 ahi sub hops
262 up sob is ahh
263 pass bio huh
264 hi bosh up as
265 pas bio hush
266 posh a bus hi
267 hao hubs pis
268 huh i sap bos
269 sap bio hush
270 huh i sop abs
271 hah bis opus
272 hi us bop ash
273 spas obi huh
274 oh bis push a
275 bah hi soups
276 oh pub hiss a
277 pia bush sho
278 shh i ups boa
279 hao bus pish
280 ahh i ups sob
281 sau hob hips
282 hi up has bos
283 hash bio sup
284 huh i sob asp
285 spa bios huh
286 a hub hop sis
287 ahi hob puss
288 i hob pus ash
289 shah bio sup
290 shh i sup boa
291 has bosh piu
292 hah i sub ops
293 saps bio huh
294 hi us hop bas
295 pas bios huh
296 ahh i sup sob
297 spas bio huh
298 hah i sop bus
299 sap bios huh
300 up sob is hah
301 ahh bio puss
302 a sub ship oh
303 hash bio pus
304 up bos is ahh
305 boa hiss hup
306 oh sub is hap
307 pau hob hiss
308 oh hub is spa
309 bap ious shh
310 huh i sop bas
311 asp bio hush
312 ahh i sop sub
313 basis oh hup
314 hi us sob hap
315 shah bio pus
316 hi so ash pub
317 his hup soba
318 oh us hap bis
319 hash sob piu
320 hi bos push a
321 hao sub pish
322 hah i ups sob
323 his sho bapu
324 oh hub is pas
325 shah sob piu
326 a bus hips oh
327 hah bio puss
328 posh a sub hi
329 sha obi push
330 ahh i sob pus
331 sahib hup so
332 hi so bus hap
333 asp bios huh
334 oh hub is sap
335 bah hips sou
336 ahh i ups bos
337 ahh bios sup
338 a bus phi hos
339 ahi bos push
340 shh obi up as
341 boa phish us
342 hah i sup sob
343 sha bio push
344 ahh so up bis
345 hup ahi boss
346 ahh i sup bos
347 apos bush hi
348 oh hub sip as
349 pao hub hiss
350 up bos is hah
351 pao bis hush
352 hi us hob spa
353 ahh bios pus
354 oh hub sips a
355 sash hob piu
356 oh hubs sip a
357 bah phi sous
358 hah i sop sub
359 bapu hiss oh
360 as bus hip oh
361 hah bios sup
362 is pub has oh
363 abo piss huh
364 hi us hap bos
365 abo psi hush
366 hi us hob pas
367 ash bosh piu
368 hi up hob ass
369 bash hos piu
370 hah i sob pus
371 oba piss huh
372 hi us hob sap
373 oba psi hush
374 hi up sob ash
375 opa hub hiss
376 hah i ups bos
377 ahh boss piu
378 oh bis up ash
379 opa bis hush
380 ash hob i ups
381 apo hub hiss
382 us oh his bap
383 hah bios pus
384 hah so up bis
385 soba sip huh
386 hos sip hub a
387 apo bis hush
388 a sub hips oh
389 ahi bosh ups
390 hah i sup bos
391 ahi pubs hos
392 hi so sub hap
393 ahi bosh sup
394 ash hob i sup
395 hash bos piu
396 a subs hip oh
397 abo pis hush
398 huh bos sip a
399 hup ahi sobs
400 a sub phi hos
401 hah boss piu
402 hi bosh ups a
403 oba pis hush
404 oh hub is asp
405 ahi hubs ops
406 hi so sap hub
407 sau bosh phi
408 hi bosh sup a
409 soba psi huh
410 bah us is hop
411 ahi bosh pus
412 sho i up bash
413 apos bis huh
414 sho i has pub
415 sha hubs poi
416 as sub hip oh
417 ahh sobs piu
418 hi bos up ash
419 apos hubs hi
420 his pub sho a
421 abo sips huh
422 as bus phi oh
423 oba sips huh
424 hi hos up abs
425 soba pis huh
426 hi us hob asp
427 sash obi hup
428 hup i has sob
429 hup abo hiss
430 a bus hi shop
431 ahi hubs sop
432 a subs phi oh
433 bah pish sou
434 a bop sis huh
435 has bios hup
436 is as bop huh
437 hup oba hiss
438 shh obi ups a
439 ahh bios ups
440 bah up is hos
441 sho ahi pubs
442 sha i up bosh
443 hah sobs piu
444 hip sos hub a
445 shah bos piu
446 a sob sip huh
447 piu sha bosh
448 hi hos up bas
449 pia hubs sho
450 huh bis sop a
451 soba piu shh
452 shh obi sup a
453 ais bosh hup
454 hi hob ups as
455 sash bio hup
456 hi hub sop as
457 ash bios hup
458 hup i has bos
459 pau bios shh
460 hi hubs sop a
461 bias sho hup
462 as sub phi oh
463 hah bios ups
464 sha i hop bus
465 abo phish us
466 his bos hup a
467 bash sho piu
468 a bush oh sip
469 oba phish us
470 pah so is hub
471 pish sau hob
472 bap is so huh
473 sha bios hup
474 a sub hi shop
475 boa is up shh
476 a bus poi shh
477 a sob psi huh
478 bop us has hi
479 hup as is hob
480 a sob hi push
481 sha up is hob
482 a bush oh psi
483 as bus hi hop
484 is us bop ahh
485 sha i hop sub
486 sho i ash pub
487 a bush hi ops
488 a bus hi soph
489 oh hi up bass
490 sho i bus hap
491 a bus hi hops
492 a sob pis huh
493 i push so bah
494 hup i hob ass
495 a subs hi hop
496 hup bosh is a
497 a sub poi shh
498 hup i sob ash
499 pish us hob a
500 a bush oh pis

### paytontolle:people

input: Payton Tolle
category: people
phrases 1 to 500 of 500

1 totally open
2 late only top
3 on let to play
4 on ply let to a
5 loopy talent
6 lately on top
7 no let to play
8 no ply let to a
9 potent alloy
10 lately no top
11 all no to type
12 tel on ply to a
13 openly total
14 let onto play
15 ploy to an let
16 tel no ply to a
17 penalty tool
18 all one potty
19 top to an yell
20 penalty loot
21 top lonely at
22 lot to an yelp
23 totally nope
24 plenty tool a
25 on lot let pay
26 loyal potent
27 not top alley
28 pot to an yell
29 potato nelly
30 play note lot
31 only pelt to a
32 totally peon
33 openly lot at
34 on tell to pay
35 aplenty tool
36 late only pot
37 no tell to pay
38 aplenty loot
39 lately on pot
40 all top to yen
41 latent loopy
42 lately no pot
43 any pol to let
44 patently loo
45 plenty loot a
46 on ploy let at
47 play tone lot
48 no ploy let at
49 on play lotte
50 on telly top a
51 no play lotte
52 no telly top a
53 atop only let
54 pony tell to a
55 not late ploy
56 all toy to pen
57 top only tale
58 only let opt a
59 too play lent
60 on yell to pat
61 not pot alley
62 no yell to pat
63 not loyal pet
64 on yell to tap
65 only plot tea
66 all pot to yen
67 late lot pony
68 plot to an ley
69 only lot pate
70 no yell to tap
71 loan type lot
72 on pet to ally
73 plane lot toy
74 no pet to ally
75 yet tool plan
76 plot to an lye
77 aptly one lot
78 late no to ply
79 not ally poet
80 lay lot to pen
81 tell onto pay
82 an pol toy let
83 teal only top
84 on telly pot a
85 open to tally
86 on lot yelp at
87 only plot ate
88 no telly pot a
89 only lot peat
90 no lot yelp at
91 only pot tale
92 on pelt to lay
93 peony to tall
94 on lot let yap
95 loyal ten top
96 no pelt to lay
97 on yelp total
98 an ley lot top
99 total yelp no
100 an lye lot top
101 play let toon
102 any top to ell
103 yet loot plan
104 pylon let to a
105 tall open toy
106 typo to an ell
107 lately opt no
108 too ply an let
109 on tally poet
110 apt no to yell
111 all note typo
112 an let lop toy
113 no tally poet
114 one ply lot at
115 pollen toy at
116 on lot pet lay
117 on type atoll
118 ten ploy lot a
119 too pally ten
120 lay pet lot no
121 pay tell toon
122 on tell to yap
123 on allot type
124 no tell to yap
125 atoll type no
126 yon let to pal
127 pylon to tale
128 nelly top to a
129 no allot type
130 an ley lot pot
131 not pet alloy
132 on ply to tale
133 lonely pot at
134 no ply to tale
135 yet plot loan
136 an lye lot pot
137 teal only pot
138 a let only top
139 all type toon
140 any pot to ell
141 ally note top
142 an ell top toy
143 pat let loony
144 yet lot an pol
145 panel lot toy
146 yon let to lap
147 tap let loony
148 yon plot let a
149 total one ply
150 an toe lot ply
151 too pan telly
152 on let opt lay
153 too pen tally
154 top ton yell a
155 pay note toll
156 not pay to ell
157 yell to panto
158 no let opt lay
159 all petty ono
160 opt to an yell
161 tale lot pony
162 on telly opt a
163 too nap telly
164 net ploy lot a
165 all tone typo
166 no telly opt a
167 loyal ten pot
168 ten pol to lay
169 play net tool
170 on ply to teal
171 tall one typo
172 nelly pot to a
173 not opt alley
174 no ply to teal
175 lot eat pylon
176 any lop to let
177 not toy lapel
178 lone ply to at
179 on toy pallet
180 pay let lot no
181 only plot eta
182 yall pet to no
183 no toy pallet
184 on yell opt at
185 yet plant loo
186 yet pall to no
187 tao tell pony
188 no yell opt at
189 too yell pant
190 a let only pot
191 lay note plot
192 on ley plot at
193 tape only lot
194 on lotte ply a
195 loyal net top
196 no ley plot at
197 not teal ploy
198 no lotte ply a
199 only pole tat
200 an ell pot toy
201 ally tone top
202 ten toy poll a
203 not pally toe
204 on lye plot at
205 only tote pal
206 no lye plot at
207 atop on telly
208 on yelp to lat
209 lay tent pool
210 on yelp to alt
211 loan let typo
212 no yelp to lat
213 only to plate
214 no yelp to alt
215 top only tael
216 ploy not let a
217 all tote pony
218 lot yen to pal
219 atop no telly
220 an lot opt ley
221 pay tone toll
222 net pol to lay
223 peon to tally
224 on ply let tao
225 yelp to talon
226 on ley lot pat
227 ton top alley
228 an lot opt lye
229 too plant ley
230 no ply let tao
231 yall note top
232 pat ley lot no
233 pylon to teal
234 on ley lot tap
235 only pet alto
236 not pal to ley
237 alto let pony
238 a pet only lot
239 lent tool pay
240 one ply to lat
241 yon lot plate
242 on lye lot pat
243 too plant lye
244 one ply to alt
245 any pelt tool
246 pat lye lot no
247 play tent loo
248 on lye lot tap
249 play net loot
250 on ply tae lot
251 pylon lot tea
252 ten tool ply a
253 ally note pot
254 poll yen to at
255 lay tone plot
256 top ell to nay
257 teal lot pony
258 lot yen to lap
259 loopy tan let
260 no ply tae lot
261 too pally net
262 not pal to lye
263 pale only tot
264 yon lot pelt a
265 only tote lap
266 yon pol let at
267 only opt tale
268 on ply to tael
269 toll eat pony
270 a tell on typo
271 panty let loo
272 lay let on top
273 yell onto pat
274 no ply to tael
275 at pelt loony
276 ply let onto a
277 yell onto tap
278 a tell no typo
279 yall tone top
280 lay let no top
281 all neo potty
282 net toy poll a
283 peony toll at
284 yon let to alp
285 only tot plea
286 not lap to ley
287 pet onto ally
288 all opt to yen
289 an lotte ploy
290 lot not yelp a
291 lane lot typo
292 nelly opt to a
293 not yelp alto
294 not lap to lye
295 pylon lot ate
296 ten loot ply a
297 oat tell pony
298 only tet lop a
299 yet tall poon
300 at yell on top
301 loyal net pot
302 lot yet on pal
303 ally tone pot
304 at yell no top
305 lay tent loop
306 on ply let oat
307 lent loot pay
308 pal yet lot no
309 only pelt tao
310 a type on toll
311 too pent ally
312 pol let to nay
313 any pelt loot
314 no ply let oat
315 lane plot toy
316 a type no toll
317 one opt tally
318 not ply to ale
319 only pot tael
320 an ell opt toy
321 eat only plot
322 apt ley lot no
323 ton pot alley
324 yon let lop at
325 lean lot typo
326 ane lot to ply
327 only pet lota
328 not ply to lea
329 yall note pot
330 tyne poll to a
331 yon late plot
332 on ell toy pat
333 lota let pony
334 apt lye lot no
335 ally open tot
336 noel ply to at
337 loyal pet ton
338 no ell toy pat
339 on pally tote
340 on ell tot pay
341 pony toll tea
342 on ell toy tap
343 pelt onto lay
344 no ell tot pay
345 lay tent polo
346 no ell toy tap
347 only lop tate
348 not yap to ell
349 an yelp lotto
350 lay let on pot
351 lonely at opt
352 net tool ply a
353 lean plot toy
354 lay let no pot
355 tao let pylon
356 all yet on top
357 tell onto yap
358 at yet on poll
359 only opt teal
360 lot yet on lap
361 alloy net top
362 all yet no top
363 tall type ono
364 an yet lop lot
365 pally one tot
366 at yet no poll
367 tall toe pony
368 lap yet lot no
369 ploy lot ante
370 pal let on toy
371 lot tae pylon
372 all pet on toy
373 any poet toll
374 neo ply lot at
375 any tote poll
376 ton pay to ell
377 lay pen lotto
378 yap let lot no
379 noel tot play
380 pal let no toy
381 on ploy latte
382 ley lot to pan
383 yall tone pot
384 all pet no toy
385 no ploy latte
386 ten loo ply at
387 only lope tat
388 let lop to nay
389 ton ally poet
390 at yell on pot
391 pony toll ate
392 ley lot to nap
393 pylon to tael
394 at yell no pot
395 not yelp lota
396 lye lot to pan
397 nelly top tao
398 opt yet all no
399 tally one top
400 yon ell top at
401 aptly let ono
402 ten lop to lay
403 yall open tot
404 lye lot to nap
405 total yen pol
406 net loot ply a
407 only pelt oat
408 a tell yon top
409 only to petal
410 on to all type
411 tael lot pony
412 yon ell to pat
413 penal lot toy
414 yon ell to tap
415 pylon lot eta
416 lap let on toy
417 play ten tool
418 lap let no toy
419 ply atone lot
420 on pol lay tet
421 yon leapt lot
422 no pol lay tet
423 pal yen lotto
424 all yet on pot
425 yap tell toon
426 on ley top lat
427 ally pen toot
428 a yell not top
429 atoll yen top
430 all yet no pot
431 loan pelt toy
432 on ley top alt
433 lonely to pat
434 apt no toy ell
435 yon lot petal
436 no ley top lat
437 all onto type
438 lot yen to alp
439 top allot yen
440 no ley top alt
441 lonely to tap
442 a let lot pony
443 only pol tate
444 an tet ply loo
445 leant to ploy
446 any opt to ell
447 oat let pylon
448 on lye top lat
449 neat ploy lot
450 on lye top alt
451 pall note toy
452 no lye top lat
453 pan yell toot
454 tan pol to ley
455 alloy net pot
456 no lye top alt
457 note opt ally
458 an pol tot ley
459 ply onto tale
460 tan pol to lye
461 toll tae pony
462 an pol tot lye
463 loopy lent at
464 on ley tot pal
465 nap yell toot
466 yon ell pot at
467 yon tall poet
468 no ley tot pal
469 alto ten ploy
470 not yet poll a
471 apt let loony
472 net loo ply at
473 lay nett pool
474 on lye tot pal
475 yap note toll
476 a tell yon pot
477 loopy let ant
478 ell toy to pan
479 only poet lat
480 no lye tot pal
481 lay pent tool
482 ley not plot a
483 alloy pet ton
484 on tet lop lay
485 only poet alt
486 ell toy to nap
487 aptly neo lot
488 net lop to lay
489 late ploy ton
490 lay tet lop no
491 too leant ply
492 eat on lot ply
493 only lop teat
494 lone tot ply a
495 poet toll nay
496 lye not plot a
497 alone ply tot
498 eat no lot ply
499 aptly ten loo
500 ton pal to ley

### flydubai:companies

input: Flydubai
category: companies
phrases 1 to 17 of 17

1 bay fluid
2 by fluid a
3 i fly bud a
4 fay build
5 i flay bud
6 aby fluid
7 i flay dub
8 by aid flu
9 duly fib a
10 buy if lad
11 by aid ful
12 bud if lay
13 buy if dal
14 dub if lay
15 by if dual
16 by if auld
17 fab duly i

### annehathaway:people

input: Anne Hathaway
category: people
phrases 1 to 500 of 500

1 hyena aah want
2 the nan aah way
3 we hath an any a
4 yeah thaw anna
5 he want an ayah
6 an ten a aah why
7 away hat henna
8 an ana hate why
9 he thaw an any a
10 an haha tawney
11 then aah an way
12 an net a aah why
13 wheat hay anna
14 they aah an wan
15 he haw an any at
16 haha went yana
17 an ana heat why
18 the hay wan an a
19 yeah thaw naan
20 any a went haha
21 an new a hay hat
22 away nan heath
23 an any wet haha
24 an a haw the nay
25 thane aah yawn
26 we aah thy anna
27 an ane why hat a
28 heath yawn ana
29 an why aah ante
30 he hay an wan at
31 heath yaw anna
32 an haha net way
33 an any a hew hat
34 ante yawn haha
35 he aah any want
36 thy a aah an wen
37 hyena thaw ana
38 the any wan aah
39 an hewn a hay at
40 wheat hay naan
41 they haw an ana
42 an ten a hay haw
43 neat yawn haha
44 an ten haha way
45 an any haw the a
46 anna whet ayah
47 aah an neat why
48 an net a hay haw
49 heath wan yana
50 then a aah yawn
51 an a hew thy ana
52 anew hath yana
53 the nay aah wan
54 thy new aah an a
55 ane tawny haha
56 we hath an yana
57 an tan a hew hay
58 nah away thane
59 yeah wan an hat
60 an nth a aah yew
61 ayah wan thane
62 an wan hay hate
63 an nth a hay awe
64 yana hath wane
65 the hay wan ana
66 an het a haw nay
67 heath way anna
68 he thaw an yana
69 any haw an het a
70 thane haw yana
71 an away hat hen
72 an nth a haw yea
73 heath yaw naan
74 we aah thy naan
75 we aah any nth a
76 wane than ayah
77 an any haw hate
78 we hay a hat nan
79 yeah what anna
80 an haha wet nay
81 het hay wan an a
82 naan whet ayah
83 the nan aah yaw
84 he wan a hat nay
85 tha away henna
86 the any ana haw
87 yah he want an a
88 hyena aha want
89 an thaw aah yen
90 he hay tan wan a
91 heath way naan
92 ten why aah ana
93 he hay ant wan a
94 nah aah tawney
95 an wan hay heat
96 he yaw a hat nan
97 yeah what naan
98 heath yawn an a
99 we aah nay nth a
100 hyena what ana
101 an nay haw hate
102 thy a we aah nan
103 wheat yah anna
104 an hay aah newt
105 he tan a haw nay
106 yeah thaw nana
107 the ana haw nay
108 an a nah the way
109 wean yana hath
110 hyena thaw an a
111 an a nay hew hat
112 anew than ayah
113 an any haw heat
114 an a than he yaw
115 wheat ayah nan
116 an haha yaw ten
117 an any wha the a
118 nae tawny haha
119 then aah an yaw
120 an nay he haw at
121 newt yana haha
122 ten a yawn haha
123 an any a wet ahh
124 wean than ayah
125 hath an any awe
126 thy a he wan ana
127 wheat nah yana
128 yeah tan an haw
129 nah a tae an why
130 neath aah yawn
131 an wan hath yea
132 he hat wan any a
133 away neath nah
134 an tan aah whey
135 an any wah the a
136 thane aha yawn
137 then ayah wan a
138 he hay want an a
139 neath wan ayah
140 yet wan an haha
141 hen hat an way a
142 wheat hay nana
143 an hay wean hat
144 nah we hay an at
145 wheat yah naan
146 an nay haw heat
147 hay a hat an wen
148 yeah what nana
149 an ana hat whey
150 an any a wet hah
151 thane wha yana
152 yeah haw an ant
153 an new a hat yah
154 tawney ana ahh
155 new yana hath a
156 yen an hat haw a
157 hate hwan yana
158 an ant aah whey
159 we than hay an a
160 heath way nana
161 net why aah ana
162 nah an a eat why
163 thane wah yana
164 an hay hat wane
165 a wan at hay hen
166 tawney ana hah
167 he hat away nan
168 yah he wan an at
169 heat hwan yana
170 an new ayah hat
171 he haw tan any a
172 hyena than awa
173 an nay hath awe
174 an ten a ahh way
175 heath yaw nana
176 aah thy new ana
177 any a he haw ant
178 tawney nah aha
179 any hat aah wen
180 an ten a aha why
181 neat hwan ayah
182 new hat aah nay
183 an het a ana why
184 neath haw yana
185 we tan any haha
186 nah he yaw an at
187 heath naw yana
188 then a haw yana
189 an ten a hay wha
190 ante hwan ayah
191 any haw aah ten
192 the why ana an a
193 neath aha yawn
194 an haha yaw net
195 an a wha the nay
196 neath wha yana
197 hyena haw an at
198 an ten a hah way
199 whet ayah nana
200 hen than away a
201 an ten a hay wah
202 neath wah yana
203 an ane way hath
204 a hay nan hew at
205 wheat yah nana
206 an ayah hat wen
207 he what an any a
208 henna ayah wat
209 an then way aha
210 thy a an ane haw
211 henna ayah twa
212 we hath any ana
213 an a hay ant hew
214 thane ayah naw
215 an ayah haw ten
216 an a wah the nay
217 naw neath ayah
218 net a yawn haha
219 ahh an a net way
220 thy ana aah wen
221 he hat yawn an a
222 an ana whet hay
223 aha an a net why
224 an ana hath yew
225 an a tan way heh
226 an haw aah tyne
227 hey hat wan an a
228 thy nan aah awe
229 an ten a yaw ahh
230 new hay aah tan
231 an net a hay wha
232 he hat way anna
233 an a yaw the nah
234 new ana hat hay
235 we hath nay an a
236 new hay aah ant
237 an ten a haw yah
238 an hay haw ante
239 thy aha an new a
240 wan haha yen at
241 we ahh an any at
242 anew hay an hat
243 heh at yawn an a
244 he thaw any ana
245 hah an a net way
246 any haw aah net
247 an net a hay wah
248 an want aah hey
249 he than an way a
250 ahh an away ten
251 an ten a yaw hah
252 an yana hew hat
253 he wha an any at
254 he aah want nay
255 he thaw nay an a
256 ane why aah tan
257 ahh yet wan an a
258 wha an any hate
259 we hah an any at
260 an ayah haw net
261 an net a yaw ahh
262 ane ana hat why
263 an het a nah way
264 a anna hate why
265 an net a haw yah
266 the any ana wha
267 hen hat an yaw a
268 ane why aah ant
269 an tan a yaw heh
270 they haw anna a
271 he wah an any at
272 an hay than awe
273 nth a we hay ana
274 het nan aah way
275 hey haw tan an a
276 an hewn at ayah
277 hah yet wan an a
278 a than new ayah
279 an a haw ant hey
280 wan hay aah ten
281 an net a yaw hah
282 wah an any hate
283 wha a hat an yen
284 hewn at aah nay
285 an any het a wha
286 wan hat aah yen
287 he hat way nan a
288 hah an away ten
289 ahh an a wet nay
290 the any wan aha
291 an hewn a yah at
292 the any ana wah
293 an het a wan yah
294 wha an any heat
295 an tan a hew yah
296 any ana hew hat
297 an away nth a he
298 he hay want ana
299 an a nah thy awe
300 hay an neat haw
301 wah a hat an yen
302 an haw than yea
303 an any het a wah
304 a anna heat why
305 he tan a ana why
306 an het yawn aah
307 an nth a haw aye
308 nan aah tae why
309 an het a yaw nah
310 ahh an neat way
311 the hay naw an a
312 an wan het ayah
313 wha he tan any a
314 an tan hew ayah
315 an nth a awe yah
316 wet hay aah nan
317 hah an a wet nay
318 ahh an away net
319 yah a hat an wen
320 ane yawn hath a
321 new a hay at nah
322 nah yeah want a
323 thy a aha an wen
324 he aah tan yawn
325 wah he tan any a
326 aha an neat why
327 nth a he yaw ana
328 hewn a hat yana
329 thy wha an ane a
330 an ant hew ayah
331 we hat nah any a
332 yew tan an haha
333 an new a hay tha
334 wah an any heat
335 ahh an a tan yew
336 an away tan heh
337 naw he hay an at
338 a nay went haha
339 any a hew at nah
340 hewn at hay ana
341 thy wah an ane a
342 ten haw aah nay
343 an a yaw ant heh
344 an away ant heh
345 wet hay nah an a
346 new any at haha
347 an het a wha nay
348 heath wan any a
349 hen haw any at a
350 eat why aah nan
351 he tan a nah way
352 wan hay aah net
353 an why tha ane a
354 hah an neat way
355 hah an a tan yew
356 hah an away net
357 an nth a wha yea
358 we hat hay anna
359 an het a wah nay
360 he hat way naan
361 an a hew ant yah
362 tan hay aah wen
363 the yah wan an a
364 hewn ayah tan a
365 an nth a wah yea
366 yen want haha a
367 he yawn a nah at
368 hay an ane thaw
369 he hat naw any a
370 wean any hath a
371 an any a hew tha
372 ten ana haw hay
373 an nth a hae way
374 tan haw aah yen
375 heh at wan any a
376 an wan the ayah
377 new any at ahh a
378 any aah hewn at
379 an why hat a nae
380 he hat wan yana
381 an a hae thy wan
382 wane any hath a
383 an any a haw eth
384 an ayah than we
385 hae why tan an a
386 net haw aah nay
387 an nth a aha yew
388 new any hat aah
389 an any a wat heh
390 aah thy ane wan
391 an new a tha yah
392 a naan hate why
393 new any at hah a
394 henna hat way a
395 he haw ant nay a
396 thane haw any a
397 an any a twa heh
398 they haw naan a
399 an a awa thy hen
400 an yana the haw
401 yet haw nah an a
402 yah he want ana
403 an ten a yah wha
404 an ane yaw hath
405 aha we any nth a
406 an then yaw aha
407 an wet a nah yah
408 aha he want nay
409 we hay a nah ant
410 yah an wan hate
411 thy a nae an haw
412 he away nth ana
413 we tan nay ahh a
414 the wan ana yah
415 an ten a yah wah
416 net ana haw hay
417 we tan any ahh a
418 hyena hat wan a
419 an any a eth wha
420 het nay aah wan
421 tha nay hew an a
422 the wan nay aha
423 he tan a wha nay
424 he wan tan ayah
425 an any a eth wah
426 a naan heat why
427 an net a yah wha
428 he aah an tawny
429 we tan nay hah a
430 he hat yawn ana
431 we tan any hah a
432 yeah thaw nan a
433 an a way heh ant
434 ane wan hat hay
435 an a hat naw hey
436 he hat yaw anna
437 he nah an at way
438 hen aah tan way
439 he tan a wah nay
440 went an hay aah
441 yew hat nah an a
442 he aah ant yawn
443 a haw at yen nah
444 we tan nay haha
445 we than yah an a
446 nth a wean ayah
447 when hay an at a
448 nth wan aah yea
449 an net a yah wah
450 hen aah tawny a
451 yeh hat wan an a
452 we aah nth yana
453 an nth a ayah we
454 anew any hath a
455 eth nay haw an a
456 an nth ayah awe
457 an tan a yeh wha
458 an het yana haw
459 he tha yawn an a
460 yah an wan heat
461 an nth a awa hey
462 nth a wane ayah
463 an nth a wha aye
464 we hath nay ana
465 tha a hay an wen
466 hay a whet anna
467 tea why nah an a
468 aha thy new ana
469 an tan a yeh wah
470 an neat hay wha
471 nah a nay hew at
472 the way nah ana
473 tha a haw an yen
474 nth nay aah awe
475 an nth a yaw hae
476 he haw tan yana
477 a haw nan hey at
478 het hay wan ana
479 aha we nay nth a
480 tea why aah nan
481 an nth a wah aye
482 an ten ayah wha
483 ate why nah an a
484 haw thy ane ana
485 an wan a tye ahh
486 ane nay hat haw
487 we tan nah hay a
488 we hat hay naan
489 hen haw nay at a
490 hen ayah want a
491 yeh haw tan an a
492 nah an wet ayah
493 an a haw ant yeh
494 an neat hay wah
495 an het a naw yah
496 we hat ayah nan
497 an wan a eth yah
498 ahh an wet yana
499 het hay naw an a
500 het nan aah yaw

### roblowe:people

input: Rob Lowe
category: people
phrases 1 to 29 of 29

1 bow role
2 low or be
3 bore low
4 we or lob
5 robe low
6 owl or be
7 blow ore
8 we or bol
9 blow roe
10 bore owl
11 bowl ore
12 robe owl
13 bow lore
14 bowl roe
15 brew loo
16 lobe row
17 lob wore
18 oer blow
19 reb wool
20 oer bowl
21 elbow or
22 bowel or
23 brow ole
24 orb lowe
25 bro lowe
26 below or
27 bol wore
28 brow loe
29 bor lowe
