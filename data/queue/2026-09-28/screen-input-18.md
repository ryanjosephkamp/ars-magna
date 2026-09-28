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

## File 18 of 23: 2524 phrases

### kylieminogue:people

input: Kylie Minogue
category: people
phrases 1 to 500 of 500

1 you milk genie
2 you like in meg
3 i like me guy no
4 i monkey guile
5 you like in gem
6 i ok me guy line
7 young mike lie
8 on mike lie guy
9 me lie in ok guy
10 yogi like menu
11 you milk in gee
12 i key in go mule
13 in mike eulogy
14 i omen like guy
15 i lie men ok guy
16 young mike lei
17 you like me gin
18 i oil me key gun
19 mile nuke yogi
20 in yule go mike
21 i oil me guy ken
22 glue yoke mini
23 you gel in mike
24 i ok me guy lien
25 nog key milieu
26 i guy like nome
27 me ok in guy lei
28 yogi lime nuke
29 on lei guy mike
30 i lie on key gum
31 yon mike guile
32 no lei guy mike
33 i lie no key gum
34 luge yoke mini
35 i me like young
36 i eye in glum ok
37 guile yoke nim
38 me guy like ion
39 i lie on key mug
40 me unlike yogi
41 my lieu go kine
42 i lie no key mug
43 liege mink you
44 meek in oil guy
45 i ok men guy lei
46 yogi liken emu
47 mine lie ok guy
48 i ok me glue yin
49 yon milieu keg
50 i guy lone mike
51 me ink i go yule
52 oiling key emu
53 my lieu ink ego
54 i yoke me lug in
55 oily kine geum
56 in kilo eye gum
57 i eye mil ok gun
58 liege oink yum
59 you lime in keg
60 i ok nim guy lee
61 liege kino yum
62 in kilo eye mug
63 i lie my nuke go
64 louie inky meg
65 in oil key geum
66 me ok i gin yule
67 gie key moulin
68 like yin go emu
69 i key on gum lei
70 i geeky moulin
71 i guy keen limo
72 i key no gum lei
73 louie inky gem
74 i guy keen milo
75 i yen lie ok gum
76 goy ken milieu
77 you me lie king
78 i key on mug lei
79 yogi kine mule
80 i guy meek lion
81 i key no mug lei
82 geum like yoni
83 in emu like goy
84 i yen lie ok mug
85 muni oily geek
86 mini eel ok guy
87 i eye lin ok gum
88 genii emu yolk
89 guy mike lie no
90 i like on guy me
91 genie kilo yum
92 you lie kin meg
93 i key in log emu
94 glue mike yoni
95 mine guy ok lei
96 i eye lin ok mug
97 genii yoke lum
98 you lie kin gem
99 i ok me luge yin
100 yogi muni keel
101 you i milk gene
102 i eye on gum ilk
103 luge mike yoni
104 i like yon geum
105 i eye no gum ilk
106 louie gyn mike
107 i guy noel mike
108 i eye on mug ilk
109 yogi muni leek
110 my kin lieu ego
111 i eye no mug ilk
112 yogi mike lune
113 key nim go lieu
114 i key me lug ion
115 genie limo yuk
116 i glue yon mike
117 my lieu i go ken
118 genie milo yuk
119 i eye kin mogul
120 i key lin go emu
121 gym kine louie
122 i guy meek loin
123 i ok yin gum lee
124 guile mike ony
125 in lei yoke gum
126 i ok nim guy eel
127 muni geeky oil
128 i guy limo knee
129 i eye nil ok gum
130 genii mole yuk
131 i guy milo knee
132 i guy ok nee mil
133 oiling eek yum
134 i guy meek lino
135 i ok yin mug lee
136 oiling eke yum
137 ok yin lie geum
138 i eye nil ok mug
139 keg milieu ony
140 you gee kin mil
141 i nuke my lei go
142 guile kine yom
143 me go inky lieu
144 i key nil go emu
145 muni gie yokel
146 in lei yoke mug
147 i yen lei ok gum
148 gyn oke milieu
149 ok mien guy lei
150 i eye nim ok lug
151 eyeing koi lum
152 inky emu go lie
153 i yen lei ok mug
154 gie unlike yom
155 me lie oink guy
156 i ok yin gum eel
157 i gum oily knee
158 i ok my lieu gen
159 i like menu goy
160 i ok yin mug eel
161 i keen oily gum
162 i ink emu go ley
163 i mug oily knee
164 i yen emu go ilk
165 i eye glum oink
166 i ink emu go lye
167 my unlike ego i
168 i ok yin gel emu
169 you ink lie meg
170 i ok emu gin ley
171 i keen oily mug
172 i ok emu gin lye
173 me lie kino guy
174 you ink i gel me
175 i guy mile keno
176 in yule i ok meg
177 you ink lie gem
178 in yule i ok gem
179 i eye glum kino
180 in ley i ok geum
181 i yoke mile gun
182 in lye i ok geum
183 i nuke limey go
184 me i guy one ilk
185 guy ok lee mini
186 kin emu i go ley
187 i luge yon mike
188 kin emu i go lye
189 i nuke oily meg
190 yum i go in keel
191 i yoke line gum
192 oke i glue my in
193 i key mon guile
194 yum i ok in glee
195 i key lion geum
196 yum i go in leek
197 i yoke line mug
198 me i go kin yule
199 i lime keno guy
200 koi i gun my lee
201 i me ink eulogy
202 i lie ken go yum
203 me oil kine guy
204 oke i lie my gun
205 i nuke oily gem
206 eek i oil my gun
207 key ion gum lei
208 eke i oil my gun
209 i guy mole kine
210 yum i lie on keg
211 i lime yoke gun
212 yum i go lee ink
213 key ion mug lei
214 yum i lie no keg
215 you ink mil gee
216 yum i go lee kin
217 you i liken meg
218 me go yuk in lie
219 inky emu go lei
220 oke i luge my in
221 gum yoke lie in
222 koi i gun my eel
223 me oink lei guy
224 me i guy neo ilk
225 you lie nim keg
226 eng i ok my lieu
227 i eye limo gunk
228 you i me ink leg
229 i eye milo gunk
230 neg i ok my lieu
231 i yoke mine lug
232 oke i gun my lei
233 you i liken gem
234 yum i gee ok lin
235 me ok yin guile
236 i ink eel go yum
237 mug yoke lie in
238 my on lieu keg i
239 guy ok lie mien
240 my no lieu keg i
241 you ink lei meg
242 yum i go kin eel
243 me guy lei kino
244 yum i gee on ilk
245 you ink lei gem
246 yum i gee no ilk
247 i key loin geum
248 i go mun key lie
249 gin i yoke mule
250 i key ole in gum
251 i key lino geum
252 i key ole in mug
253 kin emu lie goy
254 yum i gee ok nil
255 i yen kilo geum
256 you i me gel kin
257 login i key emu
258 i yuk me go line
259 lug ok mini eye
260 me go yuk in lei
261 me i yoke lungi
262 you me i gin elk
263 gum ink oil eye
264 i me guy ion elk
265 i nuke mile goy
266 i ok yin emu leg
267 you gee nim ilk
268 i lie yuk on meg
269 gum kin oil eye
270 i key lum in ego
271 mogul ink i eye
272 i lie yuk no meg
273 mug ink oil eye
274 i guy eek on mil
275 i yoke lien gum
276 i lie yuk on gem
277 i ogle inky emu
278 i guy eek no mil
279 i yoke nim glue
280 i lie yuk no gem
281 mug kin oil eye
282 you me i gin lek
283 i yoke lien mug
284 i go lum kin eye
285 i yoke lin geum
286 i me guy ion lek
287 gum key lie ion
288 i guy eke on mil
289 mug key lie ion
290 i guy eke no mil
291 i oink yule meg
292 i go yin emu elk
293 louie my in keg
294 i guy oke in elm
295 i lime nuke goy
296 eek i lug my ion
297 i oink yule gem
298 i key loe in gum
299 i gin emu yokel
300 yum i go nee ilk
301 i yoke nil geum
302 i key loe in mug
303 me ink lieu goy
304 eke i lug my ion
305 lingo i key emu
306 gen lie i ok yum
307 i oink ley geum
308 i guy eek in mol
309 gin oil key emu
310 i go mun key lei
311 emu in oily keg
312 me ole i ink guy
313 i oink lye geum
314 lei yum i go ken
315 i yoke nim luge
316 i lie men go yuk
317 i yoke mien lug
318 i guy eke in mol
319 yum i oink glee
320 i eye lum ok gin
321 liege in ok yum
322 me ole i guy kin
323 ole in guy mike
324 me i guy eon ilk
325 i like gone yum
326 i go yin emu lek
327 yum i liken ego
328 i gee yuk on mil
329 ego like in yum
330 i gee yuk no mil
331 leno i guy mike
332 i go yuk lee nim
333 yogi i nuke elm
334 i gul me yoke in
335 koi me guy line
336 i yuk me ogle in
337 ling i yoke emu
338 i key gol in emu
339 oke my in guile
340 i yuk me go lien
341 i liken emu goy
342 i gee yuk in mol
343 eye ion gum ilk
344 i eye gul ok nim
345 you like me ing
346 i gee lum ok yin
347 eye ion mug ilk
348 i oke me guy lin
349 yum in gee kilo
350 me loe i ink guy
351 mig you keel in
352 me loe i guy kin
353 you in mike leg
354 me ing i ok yule
355 my ion lieu keg
356 yum i ok lei gen
357 yin ok lieu meg
358 eye lum i go ink
359 yuk mine go lie
360 i gum oke in ley
361 mungo i lie key
362 men yuk i go lei
363 yum i ogle kine
364 i gum oke in lye
365 loe in guy mike
366 i mug oke in ley
367 yin ok lieu gem
368 i go yuk nee mil
369 mig you lie ken
370 i mug oke in lye
371 ugly mike one i
372 i koi my nee lug
373 ony i like geum
374 i lie gyn ok emu
375 oke in guy mile
376 i oke me guy nil
377 yin ok lei geum
378 i yuk me oil gen
379 lum i eyeing ok
380 gin i ok lee yum
381 eek in guy limo
382 i gul me key ion
383 eek in guy milo
384 i gyn me ok lieu
385 eke in guy limo
386 i yuk me lie nog
387 eke in guy milo
388 me koi i gun ley
389 mig you ink lee
390 me koi i gun lye
391 geek oil in yum
392 eye mun i go ilk
393 yuk i lie gnome
394 me koi i yen lug
395 ony i glue mike
396 gin i ok eel yum
397 koi me guy lien
398 i yuk me gel ion
399 koi i lug enemy
400 nim yuk i go eel
401 i yuk gone mile
402 i oke me lug yin
403 yuk mine go lei
404 i log in eek yum
405 mungo i key lei
406 yum eng i ok lie
407 you in mile keg
408 i log in eke yum
409 goy ink lie emu
410 you i mel in keg
411 yuk in gee limo
412 yum neg i ok lie
413 yuk in gee milo
414 mel oke i guy in
415 nom i key guile
416 yum eek i go lin
417 i neo ugly mike
418 yum eke i go lin
419 mel i nuke yogi
420 i ok emu gyn lei
421 keg emu oil yin
422 i gel in oke yum
423 you mig in leek
424 i me oke ugly in
425 in emu elk yogi
426 yum eek i go nil
427 oke i gun limey
428 yum eke i go nil
429 ing i yoke mule
430 yum eng i ok lei
431 lum i keen yogi
432 i yum in elk ego
433 yum lei go kine
434 yum neg i ok lei
435 i yuk gone lime
436 lum gie i key no
437 my keno guile i
438 lum ing i eye ok
439 mungo i eye ilk
440 i yum on lei keg
441 you in mil geek
442 i yuk on lei meg
443 mig you ink eel
444 i yuk in elm ego
445 gul ok mini eye
446 i yum in lek ego
447 eek you gin mil
448 i yum no lei keg
449 muni i yoke leg
450 i yuk no lei meg
451 mig on key lieu
452 ing i ok ley emu
453 muni i ogle key
454 ing i ok lye emu
455 my oil nuke gie
456 i yuk on lei gem
457 gie you ink elm
458 i yuk no lei gem
459 eke you gin mil
460 you i in elk meg
461 koi me glue yin
462 i me yuk in loge
463 ony i luge mike
464 you i in elk gem
465 in emu lek yogi
466 you i in elm keg
467 yoni i keel gum
468 you i in lek meg
469 i oily meek gun
470 you i in lek gem
471 yoni i keel mug
472 lum eek i go yin
473 muni i gee yolk
474 you i me kin leg
475 i eek young mil
476 i yuk mel in ego
477 mun i keel yogi
478 lum eke i go yin
479 yum lei ink ego
480 lum gie i ok yen
481 muni i key loge
482 yom eek i lug in
483 yoni i gum leek
484 i ok my lune gie
485 you mig lee kin
486 i yum oke in leg
487 i eke young mil
488 yom eke i lug in
489 ego lie ink yum
490 i yum ole in keg
491 yoni i mug leek
492 i yuk ole in meg
493 gee ink oil yum
494 ing i ok lee yum
495 ego lie kin yum
496 i lum gie on key
497 ugly meek ion i
498 i yuk ole in gem
499 koi me gin yule
500 i yuk mig on lee

### chrissiehynde:people

input: Chrissie Hynde
category: people
phrases 1 to 500 of 500

1 enriched hissy
2 his shiny creed
3 she dry his nice
4 he dry his in sec
5 her shiny dices
6 his yes end rich
7 i sic her shy end
8 his cheesy rind
9 i drench his yes
10 i dry his sec hen
11 her dicey shins
12 he sync his ride
13 i shy her cis end
14 his synched ire
15 his yes chin red
16 i din her shy sec
17 i synched heirs
18 his yes inch red
19 i shed she cry in
20 he synched iris
21 i sync her hides
22 i sic her shy den
23 i synched hires
24 his shy red nice
25 he is in shed cry
26 deny his riches
27 his dry see chin
28 i shy her cis den
29 hid his scenery
30 his dry see inch
31 i is he sync herd
32 here shiny disc
33 she dine his cry
34 i sheds he cry in
35 rich shined yes
36 his shy in creed
37 he is she din cry
38 i synched shire
39 his hind see cry
40 he dis she cry in
41 his hire synced
42 his dry seen chi
43 he is his end cry
44 cry hide shines
45 he dines his cry
46 i hiss he end cry
47 his henry dices
48 in yes shed rich
49 he dry she sic in
50 yes enrich dish
51 shy need is rich
52 he is in shy cred
53 his heir synced
54 her yes chin ids
55 she is in hed cry
56 inches ride shy
57 her yes inch ids
58 i sin he shed cry
59 in cherish dyes
60 his hes dry nice
61 i is hen shed cry
62 yes cherish din
63 his hen cry side
64 i shed in cry hes
65 rich dishes yen
66 her dyes is chin
67 i shin he dry sec
68 his dyer inches
69 her dyes is inch
70 i shy in herd sec
71 chin desire shy
72 his hens die cry
73 i dish he cry sen
74 inch desire shy
75 her in dishy sec
76 i hed he sync sir
77 cissy hind here
78 her in icy sheds
79 he rid i sync hes
80 cry hides shine
81 her ids shy nice
82 i hid he cry ness
83 shy cried shine
84 hence is his dry
85 i shed he cry ins
86 shiny rich seed
87 her dye is chins
88 he is his den cry
89 shiny hired sec
90 his rich yes den
91 i hid she cry sen
92 cheers dish yin
93 his sen hide cry
94 i hiss he cry den
95 cheesy hind sir
96 his hen dies cry
97 he is sen hid cry
98 rich denies shy
99 i dyes her chins
100 he shy in sic red
101 chi hinders yes
102 his nerd shy ice
103 i he send his cry
104 shiny shed rice
105 his hens dry ice
106 she dis i cry hen
107 heirs sync hide
108 his den shy rice
109 i she end his cry
110 hire sync hides
111 her yes sic hind
112 i sins he hed cry
113 rich dye shines
114 his yes rend chi
115 i sin he shy cred
116 hires sync hide
117 his rye send chi
118 i sin she hed cry
119 synched hire is
120 he dishes in cry
121 he dis i cry hens
122 hey his cinders
123 shy herd is nice
124 he is hen cry ids
125 hence dishy sir
126 cry heeds his in
127 he is sen dry chi
128 henry hiss dice
129 in yes shred chi
130 she din i cry hes
131 riches dish yen
132 her hind cis yes
133 i dry he chin ess
134 hers inches yid
135 i sync here dish
136 i dry he inch ess
137 cider shine shy
138 rice end his shy
139 he is hen dis cry
140 dice shrine shy
141 her shed icy sin
142 i hid he sync res
143 rich dyes shine
144 in yes herds chi
145 he diss i cry hen
146 his dyes enrich
147 his hes dine cry
148 he is sin hed cry
149 shire sync hide
150 his red icy hens
151 i hid he sync ers
152 heir sync hides
153 his rye ends chi
154 he is hes din cry
155 chin dishes rye
156 his ends hie cry
157 he dis hes cry in
158 inches dish rye
159 his sen dye rich
160 he hid in cry ess
161 inch dishes rye
162 chin dis her yes
163 i shy he sic nerd
164 hind yes riches
165 she hides in cry
166 his hes i end cry
167 chis dies henry
168 inch dis her yes
169 she dry i sic hen
170 chis hinder yes
171 rich seed shy in
172 i is hen shy cred
173 synched heir is
174 shed yen is rich
175 i he ends his cry
176 sin cherish dye
177 dices her shy in
178 he hed sis cry in
179 shy enrich dies
180 his red yen chis
181 he dry i sic hens
182 ices dish henry
183 his red yens chi
184 i is hens hed cry
185 rich needy hiss
186 his reds yen chi
187 he is hin dry sec
188 rice shined shy
189 nice dis her shy
190 i he sync his red
191 rich seedy shin
192 her in yid chess
193 he is hen sic dry
194 chin reside shy
195 his rye end chis
196 he dry hes sic in
197 hiss iced henry
198 his res deny chi
199 hed is in cry hes
200 inch reside shy
201 in yes herd chis
202 sec rid he shy in
203 niches ride shy
204 his hin seed cry
205 i hed she cry ins
206 riches dine shy
207 shy red is niche
208 i shy hen rid sec
209 shy iced shrine
210 his ers deny chi
211 he dry in cis hes
212 cry shied shine
213 shy deer is chin
214 he is ins hed cry
215 sic hides henry
216 shy reed is chin
217 i she cry his den
218 sis chide henry
219 shy deer is inch
220 i shy res end chi
221 his dyer niches
222 shy reed is inch
223 i shy ers end chi
224 ice hinders shy
225 his hen cry ides
226 i rend he sic shy
227 icy shed shrine
228 his hind sec rye
229 his hes i cry den
230 dishy rich seen
231 her shed icy ins
232 i shy hen sic red
233 riches shed yin
234 red yes shin chi
235 i hid sen cry hes
236 cheers dishy in
237 his yen sic herd
238 i he cry his dens
239 yen cherish ids
240 cry heed his sin
241 he i sync her ids
242 cissy hired hen
243 she dyes in rich
244 i dis hes cry hen
245 rich hissed yen
246 in hes hides cry
247 i hid ess cry hen
248 niche rides shy
249 his hen dry ices
250 i sin hes hed cry
251 shy chide siren
252 she din rich yes
253 i shy ern hid sec
254 side henry chis
255 i shy red inches
256 i hed sis cry hen
257 rich hinds eyes
258 dice her shy sin
259 he rid she sync i
260 rich hides yens
261 i dish sec henry
262 i dry hes sic hen
263 shiner shy dice
264 his res dye chin
265 his sen i hed cry
266 riches dye shin
267 he is shy cinder
268 i hed ins cry hes
269 yid shin cheers
270 i shine shed cry
271 cis red he shy in
272 sincere shy hid
273 his ern shy dice
274 in hes he cry ids
275 rich hind yeses
276 his res dye inch
277 i is need cry shh
278 cheery hinds is
279 i end shy riches
280 in hes i shy cred
281 shiny shred ice
282 he hissed in cry
283 i he dry in chess
284 heresy chin ids
285 his ers dye chin
286 in ess he dry chi
287 heresy inch ids
288 her cissy in hed
289 i send she cry hi
290 rich eyed shins
291 he shin side cry
292 i hed hin cry ess
293 hired yin chess
294 his ers dye inch
295 cis hen he is dry
296 chins hired yes
297 shy din is cheer
298 he is cry send hi
299 shy iced shiner
300 chi deny her sis
301 i shy hed sic ern
302 cheesy shin rid
303 shy din see rich
304 she is end cry hi
305 herein shy disc
306 i dry she inches
307 red sen i shy chi
308 niche dries shy
309 rich hens is dye
310 i ends she cry hi
311 chin dis heresy
312 rich yes hid sen
313 i is cry send heh
314 inch dis heresy
315 dry shin see chi
316 i sends he cry hi
317 shiny herds ice
318 she shied in cry
319 he is ends cry hi
320 cheery hind sis
321 her yid shin sec
322 he is red sync hi
323 dyer shines chi
324 shed rye is chin
325 he she cry in ids
326 icy shed shiner
327 her shed cis yin
328 i is ends cry heh
329 ins cherish dye
330 shed rye is inch
331 i is red sync heh
332 nicer hides shy
333 he herd cissy in
334 i she shy in cred
335 chi dyes shrine
336 hey her in discs
337 shh i seed in cry
338 cheery dish sin
339 hiss her icy end
340 hi she dry in sec
341 discs hie henry
342 he shreds icy in
343 she is den cry hi
344 shiny ids cheer
345 iced her shy sin
346 he she dry cis in
347 chi dye shrines
348 dry sheen is chi
349 heh in dry is sec
350 shiny hes cried
351 in rye hid chess
352 sec hin i dry hes
353 riches hid yens
354 sec dish her yin
355 he is dens cry hi
356 shy chide rinse
357 his shy iced ern
358 cis hes i dry hen
359 sic shied henry
360 he is shiny cred
361 he end sis cry hi
362 shy chide reins
363 she shred icy in
364 rec i shy his end
365 chin dyes heirs
366 chis dyes her in
367 i send hes cry hi
368 inch dyes heirs
369 his nee dish cry
370 i is dens cry heh
371 shy dire niches
372 his shed icy ern
373 i hi she sync red
374 shiny cheer dis
375 i hid shy screen
376 hi he dry in secs
377 chins dish eyre
378 his dens hie cry
379 i end sis cry heh
380 niches dish rye
381 shy hes rid nice
382 i ends hes cry hi
383 niche sired shy
384 chis din her yes
385 i is cred yen shh
386 chin dyes hires
387 i shy dense rich
388 heh i dry in secs
389 chis deny heirs
390 his sine hed cry
391 i die sen cry shh
392 inch dyes hires
393 he is henry disc
394 hi i sync red hes
395 cheery sins hid
396 shy rise end chi
397 hi he sin dry sec
398 chins hides rye
399 her ids yen chis
400 hi i cry shed sen
401 chis deny hires
402 she herds icy in
403 hi i shy sec nerd
404 icy shred shine
405 i sync shed hire
406 shh i rid sec yen
407 chins dyes hire
408 chin dye her sis
409 hi i dry sec hens
410 nicer dishy hes
411 his nee dry chis
412 i she dry sec hin
413 ices hinder shy
414 shy hen is cider
415 rec i shy his den
416 shy chide resin
417 inch dye her sis
418 heh i sin dry sec
419 chin hissed rye
420 rich hen is dyes
421 hi dry hen is sec
422 inch hissed rye
423 her ids yens chi
424 shh i ice dry sen
425 enriched shy is
426 he deny rich sis
427 i he cry hind ess
428 chis dye shrine
429 dry hes is niche
430 i hi he sync reds
431 cis hides henry
432 rich yes dis hen
433 she i dry cis hen
434 hiss enrich dye
435 chi dye her sins
436 he i dry cis hens
437 shy enrich ides
438 in reeds shy chi
439 i hi she cry dens
440 icy herd shines
441 shed sir yen chi
442 hi he dry sec ins
443 rich shied yens
444 in hes shy cider
445 shh i sic red yen
446 chin dyes shire
447 in hes dyes rich
448 i synch he is red
449 inch dyes shire
450 rich sin hed yes
451 cry din i see shh
452 icy herds shine
453 cried she shy in
454 cis ern shy i hed
455 chins dye heirs
456 i needs shy rich
457 shh i end icy res
458 enrich side shy
459 in dry hie chess
460 shh i end icy ers
461 dyer shine chis
462 shy sen die rich
463 i end rye sic shh
464 chis deny shire
465 rich yes din hes
466 dic i shy her sen
467 chi dyes shiner
468 sec herd his yin
469 heh i dry sec ins
470 chins dye hires
471 i din shy cheers
472 hi i rend shy sec
473 ricin heeds shy
474 cry heed his ins
475 hi is hes end cry
476 sic hind heresy
477 i shined she cry
478 he dis sen cry hi
479 shiny ceres hid
480 she rid yes chin
481 shh i in sec dyer
482 chins dyes heir
483 he hide sir sync
484 i he dry ness chi
485 sen cherish yid
486 he rid shiny sec
487 shh i end cis rye
488 shiny reeds chi
489 ice rend his shy
490 i hed ness cry hi
491 shiny hes cider
492 she rid yes inch
493 i shy rec in shed
494 yid shins cheer
495 shy sire end chi
496 sec red hin shy i
497 cinders hie shy
498 in seder shy chi
499 she i cry hen ids
500 shiny cries hed

### chrisfagan:people

input: Chris Fagan
category: people
phrases 1 to 269 of 269

1 rash facing
2 an rich fags
3 chasing far
4 i hang scarf
5 cashing far
6 an arch figs
7 chair fangs
8 i crash fang
9 chairs fang
10 i fags ranch
11 nigh fracas
12 far is chang
13 crash fagin
14 i arch fangs
15 cash faring
16 his fang car
17 chang fairs
18 i char fangs
19 chafing ras
20 i shag franc
21 chafing ars
22 can rag fish
23 cris afghan
24 crash fag in
25 chains frag
26 i gash franc
27 chasing arf
28 fag is ranch
29 cashing arf
30 finch rags a
31 gar fish can
32 figs ranch a
33 in scarf hag
34 rich fan gas
35 nigh scarf a
36 car fan sigh
37 a sigh franc
38 rich fangs a
39 crash an fig
40 car nag fish
41 arch fags in
42 finch rag as
43 fang is char
44 fig ranch as
45 his fang arc
46 car gan fish
47 char fags in
48 rich fang as
49 sic hang far
50 fish an crag
51 hag is franc
52 can shag fir
53 cash fan rig
54 car fag shin
55 his fan crag
56 his fag narc
57 cash ran fig
58 can far sigh
59 can gash fir
60 car shag fin
61 arch fang is
62 firs can hag
63 far snag chi
64 fir can hags
65 narc has fig
66 char an figs
67 gas if ranch
68 rich fan sag
69 fags ran chi
70 car gash fin
71 hag fins car
72 cash rag fin
73 chi fan rags
74 arc fan sigh
75 arch gas fin
76 gran if cash
77 far sang chi
78 crag has fin
79 arc nag fish
80 hags fin car
81 chi fans rag
82 far nags chi
83 hag fin cars
84 arch fag sin
85 cis far hang
86 char gas fin
87 nag if crash
88 nigh far sac
89 cash nag fir
90 gar fin cash
91 arc gan fish
92 car fags hin
93 sac hang fir
94 sang if arch
95 char fag sin
96 chin far gas
97 inch far gas
98 far nag chis
99 cash far gin
100 chi fans gar
101 hag fin scar
102 fag ran chis
103 arc fag shin
104 cash gan fir
105 can rash fig
106 sang if char
107 cars fag hin
108 fir scan hag
109 far gan chis
110 arc shag fin
111 chis fan rag
112 arch fag ins
113 chin fag ras
114 inch fag ras
115 fir cans hag
116 sag if ranch
117 cars if hang
118 snag if arch
119 narc ash fig
120 chin fag ars
121 inch fag ars
122 ras if chang
123 scar fag hin
124 arc gash fin
125 hag fins arc
126 car if hangs
127 char fag ins
128 arch sag fin
129 shag if narc
130 crag ash fin
131 snag if char
132 chis fan gar
133 ars if chang
134 hags fin arc
135 scar if hang
136 nags if arch
137 char sag fin
138 gash if narc
139 hag fin arcs
140 frag his can
141 hag if narcs
142 cash if rang
143 chin far sag
144 inch far sag
145 arc fags hin
146 nags if char
147 hags if narc
148 arcs fag hin
149 arcs if hang
150 crash if gan
151 arc if hangs
152 frig an cash
153 ing far cash
154 chang a firs
155 chang as fir
156 franc gas hi
157 finch gar as
158 scarf nag hi
159 ich far sang
160 can has frig
161 scarf gan hi
162 arf is chang
163 hic far sang
164 crag fans hi
165 narc fags hi
166 narcs fag hi
167 ich far snag
168 scar fang hi
169 car nah figs
170 car fangs hi
171 gah is franc
172 franc sag hi
173 car hang ifs
174 cash frag in
175 hic far snag
176 ich far nags
177 scarf gah in
178 frag an chis
179 arc fangs hi
180 cars nah fig
181 cars fang hi
182 can arf sigh
183 francs hag i
184 hic far nags
185 can ash frig
186 scar nah fig
187 chi fang ras
188 arcs fang hi
189 chi fang ars
190 can fag shri
191 chin frag as
192 inch frag as
193 can rah figs
194 ich fan rags
195 cig fan rash
196 ich fans rag
197 cris fan hag
198 arc nah figs
199 can gah firs
200 chins frag a
201 hic fan rags
202 gah if narcs
203 arf nigh sac
204 arc hang ifs
205 hic fans rag
206 car gah fins
207 arch nag ifs
208 ich fans gar
209 cash fag rin
210 chin arf gas
211 inch arf gas
212 francs gah i
213 cash arf gin
214 arcs nah fig
215 franc hags i
216 cars gah fin
217 hic fans gar
218 chi arf sang
219 sic hang arf
220 cis fang rah
221 scar gah fin
222 scan frag hi
223 scan rah fig
224 scan gah fir
225 cans frag hi
226 cans rah fig
227 cans gah fir
228 chi arf snag
229 ich fags ran
230 char nag ifs
231 arch gan ifs
232 chin arf sag
233 inch arf sag
234 arc gah fins
235 arf gan chis
236 narc sha fig
237 char gan ifs
238 chi arf nags
239 hic fags ran
240 arcs gah fin
241 crag sha fin
242 chis arf nag
243 sic fang rah
244 can sha frig
245 ich fang ras
246 cis frag nah
247 cigs far nah
248 gah cris fan
249 ich fang ars
250 sac frag hin
251 cis arf hang
252 hic fang ras
253 ich arf sang
254 rah cigs fan
255 rah cig fans
256 hic fang ars
257 narc hag ifs
258 cris fag nah
259 sic frag nah
260 cash arf ing
261 hic arf sang
262 ich arf snag
263 sac nah frig
264 hic arf snag
265 ich arf nags
266 crag nah ifs
267 cigs arf nah
268 narc gah ifs
269 hic arf nags

### henrymurray:people

input: Henry Murray
category: people
phrases 1 to 68 of 68

1 my near hurry
2 my ern hurry a
3 me hurry yarn
4 my hun err ray
5 my hurry earn
6 hay err my run
7 men hurry ray
8 my run her ray
9 rye hurry man
10 my hun err rya
11 my rune harry
12 hay err my urn
13 arm yen hurry
14 my urn her ray
15 ray rhyme run
16 my run her rya
17 rum ray henry
18 my urn her rya
19 ern hurry may
20 yah err my run
21 ram yen hurry
22 my yar her run
23 men hurry rya
24 yah err my urn
25 any rem hurry
26 my yar her urn
27 rum harry yen
28 my rye run rah
29 mar yen hurry
30 my urn rah rye
31 any rue myrrh
32 my hun err yar
33 rem hurry nay
34 myrrh run yea
35 ray rhyme urn
36 hun marry rye
37 rya rhyme run
38 ern hurry yam
39 hay merry run
40 nay rue myrrh
41 rum henry rya
42 ray merry hun
43 yah merry run
44 rya rhyme urn
45 hay merry urn
46 merry hun rya
47 any erm hurry
48 marry hey run
49 nary me hurry
50 yah merry urn
51 my ern hurray
52 nay erm hurry
53 marry hey urn
54 yar rum henry
55 any mer hurry
56 aye myrrh run
57 yar merry hun
58 yar rhyme run
59 yea myrrh urn
60 harry ern yum
61 marry yeh run
62 aye myrrh urn
63 yar men hurry
64 nay mer hurry
65 yar rhyme urn
66 nam rye hurry
67 marry yeh urn
68 harry rye mun

### jonsumrall:people

input: Jon Sumrall
category: people
phrases 1 to 53 of 53

1 null majors
2 jam sun roll
3 jams unroll
4 on mull jars
5 jars mull no
6 raj mull son
7 jar mull son
8 uns roll jam
9 moll sun raj
10 moll sun jar
11 uns jar moll
12 null jar som
13 raj mull nos
14 jar mull nos
15 null jar mos
16 null or jams
17 null som raj
18 null mos raj
19 jarl on slum
20 jam null ors
21 jun or small
22 jarl slum no
23 man jus roll
24 all jus norm
25 jun or malls
26 all jus morn
27 raj moll uns
28 jams run lol
29 jam runs lol
30 mas jun roll
31 jus nor mall
32 mall jun ors
33 ras jun moll
34 ran jus moll
35 raj mull ons
36 jar mull ons
37 ars jun moll
38 jarl mol sun
39 nam jus roll
40 jarl lum son
41 jam urns lol
42 jams urn lol
43 arms jun lol
44 lars jun mol
45 jarl mol uns
46 mars jun lol
47 alls jun rom
48 mun jarl sol
49 jarl lum nos
50 rams jun lol
51 jars mun lol
52 alls jun mor
53 jarl lum ons

### joshheupel:people

input: Josh Heupel
category: people
phrases 1 to 28 of 28

1 up josh heel
2 oh lush jeep
3 he joe plush
4 joe hep lush
5 julep she oh
6 jus hep hole
7 so heh julep
8 jus help hoe
9 jeep sol huh
10 jee lush hop
11 joe heh plus
12 jus heel hop
13 julep hes oh
14 he sho julep
15 josh hup lee
16 jee lop hush
17 josh hup eel
18 julep he hos
19 jee pol hush
20 jee plush oh
21 jus pole heh
22 jee slop huh
23 hehe jus pol
24 jus lope heh
25 jee loup shh
26 hep helo jus
27 jus lop hehe
28 jee hols hup

### chipkelly:people

input: Chip Kelly
category: people
phrases 1 to 9 of 9

1 picky hell
2 he ply lick
3 hilly peck
4 elk ply chi
5 lek ply chi
6 ich elk ply
7 hic elk ply
8 ich lek ply
9 hic lek ply

### gavinbazunu:people

input: Gavin Bazunu
category: people
phrases 1 to 5 of 5

1 biz guava nun
2 bun guv nazi a
3 bun guava zin
4 nub guv nazi a
5 nub guava zin

### azerbaijan:places

input: Azerbaijan
category: places
phrases 1 to 39 of 39

1 nazi jab are
2 nazi a be raj
3 an zaire jab
4 i raze an jab
5 ajar nazi be
6 in a raze jab
7 nazi jab ear
8 jib raze an a
9 nazi jab era
10 be nazi jar a
11 be nazi raja
12 ane a jar biz
13 ain jab raze
14 ane a raj biz
15 jib raze ana
16 zin a be raja
17 jab raze ani
18 zin a jab are
19 ajar ane biz
20 zin a jab ear
21 ane raja biz
22 be zin ajar a
23 bae nazi raj
24 zin a jab era
25 bae nazi jar
26 biz nae jar a
27 biz jean ara
28 biz nae raj a
29 nae ajar biz
30 bae zin jar a
31 biz jane ara
32 bae zin raj a
33 biz nae raja
34 baa raze jin
35 jab area zin
36 jab raze nai
37 aba raze jin
38 bae zin raja
39 ajar zin bae

### fremantlefootballclub:companies

input: Fremantle Football Club
category: companies
phrases 1 to 500 of 500

1 uncomfortable flat bell
2 an left comfortable bull
3 an colorful lamb bet left
4 uncomfortable ball left
5 an full comfortable belt
6 an forceful tomb ball let
7 uncomfortable ball felt
8 comfortable ball let fun
9 an colorful lamb bet felt
10 fluent comfortable ball
11 comfortable lab tell fun
12 an forceful tomb tell lab
13 uncomfortable fall belt
14 comfortable a blunt fell
15 bluff moll to an bracelet
16 comfortable fella blunt
17 felt an comfortable bull
18 an cellular tomb off belt
19 uncomfortable flab tell
20 comfortable fan bull let
21 an colorful bam belt left
22 comfortable flaunt bell
23 comfortable ban let full
24 fell tumbler of an cobalt
25 comfortable flan bullet
26 comfortable bun let fall
27 an colorful balm bet left
28 controllable metal buff
29 comfortable full nab let
30 an forceful bob tell malt
31 controllable fat fumble
32 left fun bomb collateral
33 an forceful bolt met ball
34 controllable blame tuff
35 comfortable flat be null
36 an colorful bam belt felt
37 controllable team bluff
38 forceful bottle ball man
39 an forceful bam tell bolt
40 controllable tame bluff
41 comfortable fall be lunt
42 an colorful balm bet felt
43 controllable mate bluff
44 collateral fun bomb felt
45 an full loft mob bracelet
46 controllable meat bluff
47 tall bomb for flatulence
48 an off tomb lull bracelet
49 controllable table muff
50 comfortable lab net full
51 an cellular toff bomb let
52 controllable aft fumble
53 comfortable flu ball ten
54 an forceful bomb tell lat
55 comfortable lunt befall
56 comfortable nub let fall
57 an forceful bomb tell alt
58 controllable lam buffet
59 controllable bluff met a
60 an off mull bolt bracelet
61 controllable bat muffle
62 cellular bomb off talent
63 an forceful bot tell lamb
64 forceful allotment blab
65 comfortable ban tell flu
66 an forceful balm bolt let
67 controllable tab muffle
68 combatant belle for full
69 an forceful blot met ball
70 controllable bleat muff
71 tall bob from flatulence
72 an forceful balm lot belt
73 controllable amulet bff
74 off troll belt ambulance
75 an forceful tall bob melt
76 controllable mal buffet
77 comfortable lab fell nut
78 an forceful bam tell blot
79 controllable meta bluff
80 combatant fuller of bell
81 forceful let bomb an tall
82 controllable aff tumble
83 colorful fell bet batman
84 an forceful mall bolt bet
85 forceful batman lot bell
86 an forceful mat tell blob
87 comfortable ball net flu
88 an bluff mol lot bracelet
89 off belt numb collateral
90 an buff moll lot bracelet
91 combatant bell fell four
92 an forceful blob met tall
93 comfortable lat bell fun
94 an cellular tomb fob left
95 comfortable alt bell fun
96 an colorful matt ebb fell
97 full balm lot benefactor
98 an forceful tam tell blob
99 comfortable elf nut ball
100 an off mull blot bracelet
101 comfortable tan bell flu
102 all belt an forceful tomb
103 comfortable ben lull fat
104 an colorful belt met flab
105 comfortable fan bet lull
106 an forceful balm blot let
107 forceful battle ball mon
108 an forceful bot tell balm
109 comfortable ant bell flu
110 an forceful lot blab melt
111 comfortable ful ball ten
112 an forceful lab bolt melt
113 collateral ben bluff tom
114 an forceful mat bolt bell
115 full tall mob benefactor
116 an cellular tomb fob felt
117 fat roll bomb flatulence
118 an forceful mott bell lab
119 controllable a belt muff
120 an forceful mall blot bet
121 controllable a buff melt
122 an colorful malt ebb left
123 comfortable bel nut fall
124 an forceful matt lob bell
125 comfortable full tan bel
126 all butt lamb of florence
127 combatant bull of feller
128 me off all reluctant blob
129 bluff at melt collarbone
130 an forceful bot ball melt
131 forceful ballet man bolt
132 an forceful bam toll belt
133 comfortable ban tell ful
134 bluff mon to all bracelet
135 off bull labor cattlemen
136 an forceful tam bolt bell
137 colorful flat blame bent
138 an forceful lam bolt belt
139 collateral bet bluff mon
140 an forceful balm toll bet
141 tall moon bluff bracelet
142 an colorful melt bet flab
143 forceful belt ballot man
144 forceful let lamb an bolt
145 tall bob form flatulence
146 an colorful ebb melt flat
147 forceful bolt meant ball
148 forceful belt ball an tom
149 forceful noble ball matt
150 forceful belt lamb an lot
151 forceful baton tell lamb
152 on mall to bluff bracelet
153 electoral man bolt bluff
154 an forceful mall belt bot
155 comfortable lab fell tun
156 an colorful malt ebb felt
157 reluctant loaf fell bomb
158 forceful man ball to belt
159 combatant bore fell full
160 no mall to bluff bracelet
161 reluctant boll off blame
162 an forceful lab blot melt
163 comfortable tan bull elf
164 left bomb to cellular fan
165 left boll fort ambulance
166 an forceful lat bell tomb
167 flat album bolt florence
168 an forceful alt bell tomb
169 tomb ball for flatulence
170 me blob of reluctant fall
171 forceful talent ball mob
172 an forceful mat blot bell
173 collateral ten bluff mob
174 an colorful lamb belt fet
175 combatant robe fell full
176 an cellular toff bob melt
177 collateral men bolt buff
178 oft bomb an cellular left
179 left bulb recall footman
180 numb lot fall of bracelet
181 comfortable ant bull elf
182 an forceful bot malt bell
183 bluff moll to tabernacle
184 an cellular toff mob belt
185 forceful mall bob talent
186 an cellular toff met blob
187 forceful bomb tell natal
188 an cellular bomb loft fet
189 bluff mall onto bracelet
190 an forceful tam blot bell
191 forceful battle man boll
192 an forceful lam blot belt
193 bluff tam let collarbone
194 all balm butt of florence
195 fatal tomb bull florence
196 forceful let lamb an blot
197 forceful batman tell lob
198 cellular bomb felt to fan
199 umbrella lotte off blanc
200 an forceful moll belt tab
201 buff mat tell collarbone
202 an cellular tomb eff bolt
203 colorful flab battle men
204 all lamb to forceful bent
205 forceful ballet man blot
206 an forceful balm tot bell
207 buff tall met collarbone
208 an forceful matt blob ell
209 comfortable ball net ful
210 bum ball to flat florence
211 full bam toll benefactor
212 an buff mol toll bracelet
213 colorful bellman bet fat
214 full bat lamb to florence
215 full flora bob cattlemen
216 numb loft of all bracelet
217 colorful batman felt bel
218 oft bomb an cellular felt
219 full bolt lam benefactor
220 full a blob for cattlemen
221 forceful tablet ball mon
222 me turnoff bolt able call
223 bluff balm lot tolerance
224 bluff bam to all electron
225 floral bulb of cattlemen
226 buff lamb to all electron
227 forceful at bolt bellman
228 an forceful boll malt bet
229 collateral men bluff bot
230 off bent to cellular lamb
231 comfortable bun fell lat
232 local butt befell for man
233 comfortable bun fell alt
234 but lamb fall to florence
235 forceful blot meant ball
236 an forceful boll bat melt
237 collateral belt buff mon
238 forceful belt mob an tall
239 bluff mall boat electron
240 forceful bet lamb an toll
241 fell bob flour cattleman
242 left funeral lamb to bloc
243 reluctant foal fell bomb
244 all flu bob for cattlemen
245 forceful boll let batman
246 an colorful balm belt fet
247 electoral man blot bluff
248 not full lamb of bracelet
249 buff tam tell collarbone
250 fat bull lamb to florence
251 combatant rolf feel bull
252 an forceful malt lob belt
253 colorful ben befall matt
254 matt lab bull of florence
255 colorful fell bet bantam
256 an forceful boll mat belt
257 molecular font blab left
258 forceful ball lamb to ten
259 forceful bantam lot bell
260 forceful let malt an blob
261 flat front blab molecule
262 an forceful malt bolt bel
263 colorful elf belt batman
264 full tab lamb to florence
265 comfortable tan bell ful
266 forceful ban tell to lamb
267 tall mob bluff tolerance
268 off lamb to null bracelet
269 flat album blot florence
270 an cellular tomb eff blot
271 comfortable tun ball elf
272 but off all lamb electron
273 forceful baton tell balm
274 cellular tan felt of bomb
275 forceful bellman bat lot
276 an forceful tam belt boll
277 flatulence blab from lot
278 an forceful mall blob tet
279 combatant bluff roll lee
280 flat bam bull to florence
281 numb left fob collateral
282 an forceful boll melt tab
283 forceful blob meant tall
284 fell mob of reluctant lab
285 collateral men blot buff
286 an cleft rut befall bloom
287 combatant blue fell rolf
288 all balm to forceful bent
289 forceful tall bob mantle
290 cellular ant felt of bomb
291 lab bolt from flatulence
292 an forceful lat blob melt
293 reluctant floe bomb fall
294 reluctant lam fell of bob
295 controllable lam be tuff
296 all mutt blab of florence
297 comfortable ant bell ful
298 an forceful alt blob melt
299 forceful ten lamb ballot
300 flat ball of bum electron
301 forceful bottle ban mall
302 me blab not forceful tall
303 comfortable null fat bel
304 full balm bat to florence
305 off bellman labor cutlet
306 flat tomb of cellular ben
307 bolt lamb for flatulence
308 cellular flat net of bomb
309 cellular teflon bomb fat
310 an colorful melt blab fet
311 fell bulb roof cattleman
312 left tomb of cellular ban
313 controllable at buff elm
314 tall lamb to forceful ben
315 tall muff bet collarbone
316 off lot bull man bracelet
317 collateral net bluff mob
318 but tall lamb of florence
319 bluff atom ball electron
320 full lab rob of cattlemen
321 comfortable null bat elf
322 buff balm to all electron
323 full floor ebb cattleman
324 off bent to cellular balm
325 full loft mob tabernacle
326 bracelet man bolt of full
327 off tomb lull tabernacle
328 but fall balm to florence
329 comfortable tun fall bel
330 but fall lamb of electron
331 combatant rebel off lull
332 forceful belt ball an mot
333 combatant boll free full
334 forceful bell lamb an tot
335 collateral ben bolt muff
336 me bob flat cellular font
337 fat moll bull benefactor
338 mat bulb fall to florence
339 forceful tall bob lament
340 an forceful malt blot bel
341 caller footman felt bulb
342 not full balm of bracelet
343 comfortable all bent flu
344 fat balm bull to florence
345 forceful baton ball melt
346 fat bull lamb of electron
347 bot ball from flatulence
348 matt bull rebel of falcon
349 colorful fen battle lamb
350 tall tub lamb of florence
351 colorful flab meant belt
352 on tom bluff all bracelet
353 full blot lam benefactor
354 off lot numb all bracelet
355 molecular font blab felt
356 forceful ball lamb to net
357 tomb full all benefactor
358 molten bullet bar of calf
359 reluctant foam fell blob
360 cellular font bet of lamb
361 forceful manta tell blob
362 no tom bluff all bracelet
363 mono tall bluff bracelet
364 but mob all flat florence
365 forceful at blot bellman
366 forceful balm ball to ten
367 forceful tab lot bellman
368 forceful malt ball to ben
369 collateral lent muff bob
370 but ball malt of florence
371 reluctant flab boom fell
372 cellular tomb belt of fan
373 reluctant moll off babel
374 noble mall butter of calf
375 forceful ballet lamb ton
376 cellular left nab of tomb
377 numb fob felt collateral
378 forceful ban tell to balm
379 comfortable all belt fun
380 full flan mob to bracelet
381 colorful fell batten bam
382 off balm to null bracelet
383 forceful tall bob mantel
384 cellular tomb felt of ban
385 forceful tablet man boll
386 off balm but all electron
387 off mull bolt tabernacle
388 forceful belt bat an moll
389 forceful bottle nab mall
390 an cellular mott eff blob
391 controllable bel muff at
392 flat bulb lam to florence
393 blame ballet runoff colt
394 flat bam bull of electron
395 colorful bell fatten bam
396 tan lamb to forceful bell
397 full roof blab cattlemen
398 not lamb all forceful bet
399 collateral men blob tuff
400 reluctant elf mob of ball
401 combatant bull offer ell
402 me belt flat colorful ban
403 reluctant bloom eff ball
404 aft bull lamb to florence
405 colorful fet bell batman
406 all muff blab to electron
407 buff mall bolt tolerance
408 all ful bob for cattlemen
409 controllable fat bum elf
410 reluctant all elf of bomb
411 bluff moat ball electron
412 bent mob of cellular flat
413 forceful mall belt baton
414 bent mall to forceful lab
415 controllable lat be muff
416 bum bottle for fallen lac
417 forceful mantle blab lot
418 me blab flat colorful ten
419 collateral ten blob muff
420 mat full blab to florence
421 electoral lamb bluff ton
422 full lamb to fab electron
423 collateral lent mob buff
424 forceful ant lamb to bell
425 comfortable nub fell lat
426 forceful lam ball to bent
427 controllable alt be muff
428 bracelet man blot of full
429 comfortable nub fell alt
430 on bomb left cellular fat
431 colorful flab blame tent
432 mental lobe bull of craft
433 fab floor bull cattlemen
434 forceful bam ball to lent
435 bluff bam toll tolerance
436 but lot bam fall florence
437 reluctant offal bell mob
438 cellular fat left bomb no
439 collateral ben bluff mot
440 forceful ball ban to melt
441 lab blot from flatulence
442 full balm bat of electron
443 forceful lab bolt mantle
444 cellular fen bomb to flat
445 comfortable all bun left
446 reluctant bel mob of fall
447 combatant bell fuel rolf
448 bull of lab for cattlemen
449 bluff bolt lam tolerance
450 forceful lab lamb to lent
451 cellular offal tent bomb
452 all fob blur of cattlemen
453 colorful tent flambe lab
454 tall balm to forceful ben
455 comfortable neb lull fat
456 but tall balm of florence
457 matt blob roll affluence
458 cellular felt nab of tomb
459 blame ballet runoff clot
460 buff ball lam to electron
461 blot lamb for flatulence
462 loft of bull man bracelet
463 flat abbot mull florence
464 me turnoff bolt bale call
465 comfortable fen lull bat
466 but fall balm of electron
467 colorful fable lamb tent
468 me nab flat colorful belt
469 molecular toff ball bent
470 full tam blab to florence
471 combatant elf flour bell
472 full lab orb of cattlemen
473 bluff lat met collarbone
474 me ball aft colorful bent
475 traceable mon toll bluff
476 forceful bel ball an mott
477 forceful bomb leant tall
478 at lamb not forceful bell
479 comfortable lat bull fen
480 me ball bolt forceful tan
481 bluff alt met collarbone
482 bluff lab lam to electron
483 comfortable alt bull fen
484 full a flat bomb electron
485 collateral neb bluff tom
486 an forceful moll blab tet
487 bluff mol lot tabernacle
488 cellular font belt of bam
489 buff moll lot tabernacle
490 tall be not forceful lamb
491 fab tomb roll flatulence
492 an tactful rom befell lob
493 forceful net lamb ballot
494 fat balm bull of electron
495 forceful lament blab lot
496 far lull bob of cattlemen
497 forceful balm ballot ten
498 font bomb left cellular a
499 balm bolt for flatulence
500 forceful balm ball to net

### davidkaczynski:people

input: David Kaczynski
category: people
phrases 1 to 53 of 53

1 zany kid kids vac
2 zany dvds i kick a
3 zany dad kick vis
4 vid sky a zinc dak
5 zany vis add kick
6 div sky a zinc dak
7 zany kid disk vac
8 ick zin yak a dvds
9 zany kid skid vac
10 ick zin kay a dvds
11 avid dak sky zinc
12 i kayak dvds zinc
13 kick did zany vas
14 zinc kid davy ask
15 dick kid zany vas
16 zinc did sky kava
17 sky dak zinc diva
18 zinc ski dak davy
19 zin davy ask dick
20 zany vis dak dick
21 kick zin sad davy
22 kick vid sad zany
23 kick div sad zany
24 zin davy kick ads
25 zin davy kid cask
26 zinc kid vada sky
27 zany ads vid kick
28 dick vid ask zany
29 davy zin sick dak
30 zany ads div kick
31 dick div ask zany
32 ick nazi yak dvds
33 kid vid zany cask
34 kid div zany cask
35 zin dyad kick vas
36 zinc kid davy ska
37 zany dak vid sick
38 zany dak div sick
39 sack davy kid zin
40 vac ask kiddy zin
41 sack zany kid vid
42 sack zany kid div
43 kay ick nazi dvds
44 vid dak yaks zinc
45 div dak yaks zinc
46 kaka zin icy dvds
47 dick vada zin sky
48 dicky dak vas zin
49 dick vid ska zany
50 dick div ska zany
51 kiddy zin ska vac
52 dick davy ska zin
53 ick zin kaya dvds

### raywinstone:people

input: Ray Winstone
category: people
phrases 1 to 500 of 500

1 wary tension
2 its any owner
3 in try was one
4 we is an on try
5 tawny senior
6 an tiny worse
7 an trey is now
8 we is an no try
9 awry tension
10 an west irony
11 on in rest way
12 i sew an on try
13 wiser tannoy
14 i water sonny
15 an wise on try
16 i sew an no try
17 snowy retina
18 its wary none
19 an wise no try
20 i set an wry no
21 waiter sonny
22 an snowy tire
23 an tyre is now
24 we try on in as
25 airy newtons
26 it yearns now
27 i own an tyres
28 we try no in as
29 sanity owner
30 its new rayon
31 an try owes in
32 i try on new as
33 nary townies
34 an stony wire
35 in one try saw
36 i try no new as
37 yawns orient
38 an wiry stone
39 its on new ray
40 we try on sin a
41 notary swine
42 it wear sonny
43 its no new ray
44 we try no sin a
45 tannoy wires
46 now train yes
47 i worst an yen
48 i try on sewn a
49 notary wines
50 an sworn yeti
51 an trey is won
52 i try no sewn a
53 anyone wrist
54 its awry none
55 an tyre is won
56 we so try an in
57 yarn townies
58 not win years
59 on rent is way
60 so try in new a
61 tawney irons
62 an wiry notes
63 no rent is way
64 i try as on wen
65 yarns townie
66 it say renown
67 in news to ray
68 i try as no wen
69 notary sinew
70 on say winter
71 we yarn its no
72 i try sen own a
73 anyone writs
74 no say winter
75 in now rat yes
76 i nest on wry a
77 tawney rosin
78 i stay renown
79 two in ran yes
80 i nest no wry a
81 santo winery
82 it yearns won
83 won entry is a
84 a sew in on try
85 annoys write
86 an snowy rite
87 an two yen sir
88 a sew in no try
89 retain snowy
90 not in sawyer
91 on in was trey
92 i nets on wry a
93 annoy writes
94 in stay owner
95 no in was trey
96 i nets no wry a
97 yes iron want
98 in now try sea
99 wry sen to in a
100 won train yes
101 own entry is a
102 on try wen is a
103 so any winter
104 i snow an trey
105 no try wen is a
106 i yearns town
107 an rye is town
108 on news i try a
109 sinner to way
110 we sort an yin
111 i net on wry as
112 an rosy twine
113 on in was tyre
114 no news i try a
115 an snowy tier
116 an in try woes
117 in son we try a
118 yes own train
119 no in was tyre
120 i net no wry as
121 any tires now
122 in yes own art
123 wen try so in a
124 an nosey writ
125 new in to rays
126 i to an wry sen
127 any write son
128 one try wins a
129 i we try an son
130 an stony weir
131 i snow an tyre
132 i so try an wen
133 any towers in
134 an yes win rot
135 new son i try a
136 any writes no
137 one try win as
138 wry on in set a
139 any tries now
140 we sin an troy
141 wry no in set a
142 on twin years
143 won in rat yes
144 in sty or new a
145 in town years
146 i owns an trey
147 wry on ten is a
148 years twin no
149 an rye sit now
150 wry no is ten a
151 ain new story
152 we try an sion
153 wry in so ten a
154 an wiry tones
155 on rye is want
156 wry on net is a
157 not any wires
158 on swine try a
159 wry no is net a
160 say to winner
161 we yarns to in
162 wry in so net a
163 a write sonny
164 in tyres own a
165 a new is on try
166 so intern way
167 no swine try a
168 a new is no try
169 not wins year
170 we try an ions
171 in nos we try a
172 an wine story
173 it snow an rye
174 on ins we try a
175 any one wrist
176 in yes own rat
177 no ins we try a
178 i rays newton
179 i sow an entry
180 won sen i try a
181 on insert way
182 i owns an tyre
183 i we try an nos
184 it yearn snow
185 yet own an sir
186 new nos i try a
187 its wary neon
188 i rest any now
189 an in sty or we
190 way insert no
191 i yarn to news
192 an new sty or i
193 not risen way
194 wins to an rye
195 wry son i net a
196 years tin now
197 rosy in went a
198 i on wry sent a
199 town rain yes
200 i was on entry
201 i no wry sent a
202 any tires won
203 in now tar yes
204 i on wry ten as
205 an wiry onset
206 on in ray west
207 i no wry ten as
208 not rinse way
209 any no wet sir
210 we so try inn a
211 yin to answer
212 i was no entry
213 i try now sen a
214 new is notary
215 an rosy in wet
216 wry nos i net a
217 not reins way
218 on yes win art
219 i try son wen a
220 we sin notary
221 we sin an tory
222 i we ran on sty
223 any tries won
224 we sort any in
225 i we ran no sty
226 nine sort way
227 no yes win art
228 i on an wry set
229 any wine sort
230 it owns an rye
231 i so an wry ten
232 its awry neon
233 an try owe sin
234 i so we try nan
235 i ray newtons
236 in warn to yes
237 i on wry tens a
238 any store win
239 an yes win tor
240 i no wry tens a
241 i yearn towns
242 i was none try
243 i not wry sen a
244 niners to way
245 an troy sew in
246 it on wry sen a
247 news into ray
248 an yes tin row
249 it no wry sen a
250 winner toys a
251 an rye sit won
252 i so an wry net
253 it yawn senor
254 on in saw trey
255 an new i so try
256 nosy in water
257 on sir net way
258 i try nos wen a
259 yet rains now
260 i toys an wren
261 i on wry sen at
262 we annoy stir
263 it rows an yen
264 i no wry sen at
265 any rise town
266 no in saw trey
267 we try ons in a
268 iron sent way
269 no sir net way
270 sty or in wen a
271 it ware sonny
272 an in sort yew
273 i try ons new a
274 watery in son
275 torn yes win a
276 we nor in sty a
277 years tin won
278 on tyres win a
279 i nor new sty a
280 as went irony
281 an on wiry set
282 wynn or i set a
283 i yearns wont
284 it warn on yes
285 an wen i or sty
286 now tiny ears
287 no tyres win a
288 an sty nor i we
289 anew in story
290 an no wiry set
291 a ern i own sty
292 on nasty wire
293 i rest any won
294 i net ons wry a
295 any risen two
296 on in saw tyre
297 i try wen ons a
298 as tiny owner
299 it warn no yes
300 wry son i ten a
301 we iron tansy
302 on yes win rat
303 i wynn res to a
304 on tiny wears
305 an wen is troy
306 i wynn ers to a
307 tin own years
308 no in saw tyre
309 i try an ons we
310 an wiry seton
311 any sir to wen
312 wry nos i ten a
313 newton is ray
314 own in set ray
315 i ons wry ten a
316 one try swain
317 in row say ten
318 we or sty inn a
319 i yawns tenor
320 wan one is try
321 a we rin on sty
322 on wine stray
323 new sir to nay
324 a we rin no sty
325 stray one win
326 won in tar yes
327 i wynn ser to a
328 any sire town
329 in ton war yes
330 a wen i nor sty
331 stray wine no
332 an on writ yes
333 i wry ton sen a
334 winners toy a
335 in trey own as
336 a wren i on sty
337 any new riots
338 an no writ yes
339 a wren i no sty
340 any rinse two
341 an tory sew in
342 nan we i or sty
343 i yawn nestor
344 is an own trey
345 a ern i won sty
346 so ninety war
347 an wren is toy
348 a ern i now sty
349 stay rein now
350 any ten is row
351 a we i norn sty
352 tinny worse a
353 we stray on in
354 any reins two
355 in yen to wars
356 any west iron
357 own ten is ray
358 any wrote sin
359 its wry none a
360 i yawn stoner
361 an rye is wont
362 warn into yes
363 we stray no in
364 not ray swine
365 in yes own tar
366 not wine rays
367 on yes tin war
368 not swear yin
369 we iron an sty
370 now say trine
371 neo try was in
372 yet won rains
373 it ran won yes
374 on rainy west
375 its on raw yen
376 tiny one wars
377 in trey snow a
378 wintry one as
379 in tyre own as
380 in wont years
381 on in stew ray
382 year isnt now
383 an wry on site
384 rainy west no
385 won sir yen at
386 year sin town
387 wary no set in
388 year twin son
389 its no ray wen
390 now tiny arse
391 an in sow trey
392 winner toy as
393 is an own tyre
394 in wants yore
395 an new sir toy
396 it snore yawn
397 an wry no site
398 i yawns toner
399 sewn in to ray
400 yearn its now
401 its on new rya
402 two say niner
403 new sin to ray
404 tawny one sir
405 an sty wore in
406 years win ton
407 an wen is tory
408 any worse tin
409 it row an yens
410 won tiny ears
411 we say torn in
412 yet own rains
413 its no new rya
414 way store inn
415 i say won rent
416 it worsen nay
417 it ran own yes
418 niner to ways
419 in tyre snow a
420 none stir way
421 an in wort yes
422 at wire sonny
423 an yen sit row
424 wary stone in
425 on wrist yen a
426 yawn store in
427 an sty wire no
428 inn to sawyer
429 own sir yen at
430 year tins now
431 i saw on entry
432 on twins year
433 wary ten is no
434 stony in wear
435 on tern is way
436 no twins year
437 no wrist yen a
438 an oyster win
439 an in sow tyre
440 wont rain yes
441 i saw no entry
442 any siren two
443 no tern is way
444 own tiny ears
445 in trey owns a
446 i sow tannery
447 an wry in toes
448 yet snow rain
449 an tyne is row
450 not airy news
451 an rye sin two
452 any tower sin
453 it ray on news
454 in nestor way
455 on win set ray
456 in tenor ways
457 on sinew try a
458 so winter nay
459 won yin rest a
460 tin say owner
461 i ray sent now
462 siren to yawn
463 i say own rent
464 any rose twin
465 on in wet rays
466 in towns year
467 yes or in want
468 not weary sin
469 in yens to war
470 now ray stein
471 it ray no news
472 on wine trays
473 no sinew try a
474 one win trays
475 on trey wins a
476 year win tons
477 in tow ran yes
478 snowy in rate
479 we rays to inn
480 snowy in tear
481 no trey wins a
482 in stoner way
483 an try owe ins
484 weary in tons
485 an sir tow yen
486 way nest iron
487 on trey win as
488 trays wine no
489 i stray new no
490 not wines ray
491 i try none saw
492 stay rein won
493 an yen is wort
494 now try anise
495 an woe sin try
496 any one writs
497 an sir toy wen
498 torn easy win
499 no trey win as
500 way inter son
