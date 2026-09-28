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

## File 23 of 23: 1740 phrases

### manonbannerman:people

input: Manon Bannerman
category: people
phrases 1 to 500 of 500

1 banner mon manna
2 an mon man banner
3 an on men man barn
4 bannerman man no
5 born men man anna
6 an no men man barn
7 bannerman an mon
8 an manner man nob
9 me man an born nan
10 nob manner manna
11 born mean man nan
12 an on men man bran
13 bannerman nam no
14 on manner man ban
15 an no men man bran
16 banner nom manna
17 born name man nan
18 an on nan man berm
19 an nom bannerman
20 an mon ban manner
21 an no nan man berm
22 bannerman nam on
23 on man nab manner
24 on ran men man ban
25 an nan mob manner
26 on man nan bar men
27 an mon nab manner
28 no ran men man ban
29 an born manna men
30 no man nan bar men
31 born amen man nan
32 an man ran mon ben
33 an banner nan mom
34 me ran nan man nob
35 roman nan man ben
36 on ran man nab men
37 born men man naan
38 no ran man nab men
39 on manna man bren
40 an nan man norm be
41 no manna man bren
42 an men nor man ban
43 anon men man barn
44 nan man on arm ben
45 born mane man nan
46 nan man no arm ben
47 anon men man bran
48 me ran nan ban mon
49 roman nan ban men
50 an nan man morn be
51 mean norm ban nan
52 an nan man men rob
53 on nan ban merman
54 nan ran man be mon
55 no nan ban merman
56 an man nor nab men
57 ban manner man no
58 me ran nan nab mon
59 roman nan nab men
60 nan man on ram ben
61 mean morn ban nan
62 nan man no ram ben
63 mean norm nab nan
64 an man ran men nob
65 roman nan man neb
66 an nan ran mom ben
67 on nan nab merman
68 ban me man an norn
69 no nan nab merman
70 on nan me man barn
71 nab manner man no
72 born men man nan a
73 mean morn nab nan
74 no nan me man barn
75 ban mean man norn
76 an nan man men orb
77 ban name man norn
78 an mon ran men ban
79 man manna be norn
80 an nan mon bar men
81 nab mean man norn
82 nan man on mar ben
83 baron men man nan
84 nan man no mar ben
85 bean norm man nan
86 norn man a ban men
87 ben norm man anna
88 nab me man an norn
89 nab name man norn
90 an nan ran men mob
91 bean morn man nan
92 an mon ran men nab
93 ben morn man anna
94 on arm nan ban men
95 ban amen man norn
96 no arm nan ban men
97 bren mon man anna
98 norn man a nab men
99 name norm nab nan
100 an nan me ban norm
101 ben manor man nan
102 an man ran mon neb
103 barn mean nan mon
104 on nan me man bran
105 barn name nan mon
106 an nan man rom ben
107 name morn nab nan
108 no nan me man bran
109 nab amen man norn
110 an nan arm mon ben
111 an manna norm ben
112 on arm nan nab men
113 anna norm ban men
114 no arm nan nab men
115 me ban norn manna
116 an nan me ban morn
117 barn omen man nan
118 an nan me nab norm
119 bran mean nan mon
120 nan man on arm neb
121 berm man anon nan
122 nan man no arm neb
123 ban mane man norn
124 on ram nan ban men
125 an manna morn ben
126 no ram nan ban men
127 anna morn ban men
128 on nan man men bra
129 on men nan barman
130 no nan man men bra
131 on manna men barn
132 an nan man mon reb
133 ben norm man naan
134 on man nan ban rem
135 bran name nan mon
136 an nan me nab morn
137 anna norm nab men
138 no man nan ban rem
139 no men nan barman
140 an nan ram mon ben
141 no manna men barn
142 on ram nan nab men
143 an banner man nom
144 no ram nan nab men
145 manna ran mon ben
146 nan man on ram neb
147 me nab norn manna
148 on mar nan ban men
149 ban name nan norm
150 nan man no ram neb
151 barn nome man nan
152 an mon man ern ban
153 neb norm man anna
154 no mar nan ban men
155 nan manna be norm
156 on man nan nab rem
157 bane norm man nan
158 no man nan nab rem
159 barn men moan nan
160 an nan ran mom neb
161 ben morn man naan
162 an nan arm men nob
163 nab mane man norn
164 an nan mar mon ben
165 anna morn nab men
166 nan nor me man ban
167 an manna mon bren
168 an nan man ern mob
169 on nan manner bam
170 on mar nan nab men
171 manna nor ban men
172 an mon man ern nab
173 nan manor ban men
174 no mar nan nab men
175 nam on man banner
176 nan man on mar neb
177 no nan manner bam
178 an nan rom ban men
179 ban name nan morn
180 nan man no mar neb
181 bren moan man nan
182 nan nor me nab man
183 neb morn man anna
184 an nan ram men nob
185 bran omen man nan
186 an nan rom nab men
187 nan manna be morn
188 an nan man rem nob
189 bane morn man nan
190 an nan man rom neb
191 nan manna rob men
192 an nan mom ban ern
193 nam an banner mon
194 an nan arm mon neb
195 bren mon man naan
196 an nan mar men nob
197 beam man nan norn
198 an nan mon ban rem
199 on manna men bran
200 an nan mom nab ern
201 no manna men bran
202 an on nan mem barn
203 manna nor nab men
204 an no nan mem barn
205 nan manor nab men
206 an nan nor ban mem
207 bran nome man nan
208 an nan ram mon neb
209 neb manor man nan
210 an nan mon nab rem
211 bam mean nan norn
212 on nan man ern bam
213 bran men moan nan
214 an nan nor nab mem
215 manna ran men nob
216 no nan man ern bam
217 bam name nan norn
218 nan or men man ban
219 norm nan ban amen
220 an nan mar mon neb
221 bren noma man nan
222 an nan ran mem nob
223 an nan merman nob
224 an on nan mem bran
225 naan norm ban men
226 an no nan mem bran
227 nam none man barn
228 nan or man nab men
229 nan manna orb men
230 an nan nor men bam
231 morn nan ban amen
232 an on men nam barn
233 norm nan nab amen
234 an no men nam barn
235 an manna norm neb
236 an man nam on bren
237 naan morn ban men
238 an man nam no bren
239 naan norm nab men
240 an on men nam bran
241 born men man nana
242 an no men nam bran
243 morn nan nab amen
244 erm an nan man nob
245 an manna morn neb
246 an nan ban mon erm
247 neb norm man naan
248 bam men on ran nan
249 banner no man nam
250 bam men no ran nan
251 nam on ban manner
252 erm on nan man ban
253 manna ran mon neb
254 erm no nan man ban
255 nam no ban manner
256 an nan nab mon erm
257 ben nor manna man
258 ban mem on ran nan
259 naan morn nab men
260 on nan nab man erm
261 norm nan ban mane
262 ban mem no ran nan
263 nam none man bran
264 nam on man ran ben
265 neb morn man naan
266 no nan nab man erm
267 nam on nab manner
268 nam no man ran ben
269 nam no nab manner
270 an nan man men bro
271 born mem anna nan
272 nab mem on ran nan
273 morn nan ban mane
274 nab mem no ran nan
275 manna man ern nob
276 ben norm man nan a
277 norm nan nab mane
278 me nam an born nan
279 on nan manna berm
280 an on nan nam berm
281 no nan manna berm
282 an no nan nam berm
283 morn nan nab mane
284 nam me ban an norn
285 manna mon ban ern
286 ben morn man nan a
287 anna norn ban mem
288 nam an man be norn
289 born men nam anna
290 an man ran nom ben
291 an manner nom ban
292 nam me nab an norn
293 nona men man barn
294 bren mon man nan a
295 nan manna mob ern
296 nam on men ran ban
297 an manner nam nob
298 nam on nan bar men
299 manna mon nab ern
300 nam no men ran ban
301 nana norm man ben
302 nam no nan bar men
303 born mean nam nan
304 an mon ran nam ben
305 anna norn nab mem
306 an nan nam be norm
307 nano men man barn
308 nam on man ran neb
309 nom nab an manner
310 nam no man ran neb
311 born name nam nan
312 an nan man mor ben
313 nana morn man ben
314 an nan man men bor
315 nam anon man bren
316 nam on nan arm ben
317 nona men man bran
318 an nan mon men bra
319 neb nor manna man
320 nam no nan arm ben
321 nana mon man bren
322 a nan norm ban men
323 born mem naan nan
324 an nan nam be morn
325 nano men man bran
326 an nan nam rob men
327 nam neon man barn
328 a nan morn ban men
329 bonne arm man nan
330 nam on nan man reb
331 born men mana nan
332 a nan norm nab men
333 anon nan mem barn
334 nam no nan man reb
335 born amen nam nan
336 an man nam nor ben
337 an manna nom bren
338 mer on nan man ban
339 nana norm ban men
340 an men ran nom ban
341 barn men mon anna
342 an nan nom bar men
343 naan norn ban mem
344 mer no nan man ban
345 nan nam roman ben
346 nam on nan ram ben
347 born men nam naan
348 neb norm man nan a
349 bonne ram man nan
350 nam no nan ram ben
351 nam neon man bran
352 an men ran nam nob
353 manna nam on bren
354 a nan morn nab men
355 nana morn ban men
356 nam on ern man ban
357 manna nam no bren
358 mer on nan nab man
359 mana norn man ben
360 nam no ern man ban
361 nana norm nab men
362 mer no nan nab man
363 born nan manna me
364 neb morn man nan a
365 naan norn nab mem
366 an man ran nom neb
367 anon men nam barn
368 an nan nam orb men
369 nana norm man neb
370 nam on nan mar ben
371 anon nan mem bran
372 nam no nan mar ben
373 bonne mar man nan
374 an nan arm nom ben
375 nana morn nab men
376 nam on man nab ern
377 bran men mon anna
378 nam no man nab ern
379 nana morn man neb
380 an nan mor ban men
381 born mane nam nan
382 an nan man nom reb
383 nam manna be norn
384 an mon ran nam neb
385 nam norn man bane
386 nam ran on nab men
387 nom manna ran ben
388 an nan ram nom ben
389 anon men nam bran
390 an nan mor nab men
391 ramen mon ban nan
392 an nan man mer nob
393 born mem nana nan
394 an nan man mor neb
395 boner man nam nan
396 an men nor nam ban
397 bren mom anna nan
398 nam on nan arm neb
399 bren nom man anna
400 an ern man nom ban
401 barn mean nan nom
402 nam no nan arm neb
403 ramen mon nab nan
404 nam an ern man nob
405 barn amen nan mon
406 an nan ban mon mer
407 barn name nan nom
408 nam on nan ban rem
409 barn men mon naan
410 an nan mar nom ben
411 bam men norn anna
412 nam no nan ban rem
413 bren mano man nan
414 nam nor nab an men
415 nan nam roman neb
416 an man nom nab ern
417 mana norn man neb
418 an man nam nor neb
419 ban mean nam norn
420 an nan mon ern bam
421 barn men noma nan
422 nam on nan ram neb
423 nam norn beam nan
424 nam no nan ram neb
425 bran mean nan nom
426 nam an mon ban ern
427 nob ramen man nan
428 an nan nab mon mer
429 bran amen nan mon
430 nam on nan nab rem
431 ben norn mama nan
432 nam no nan nab rem
433 ban name nam norn
434 nam nor me ban nan
435 bran name nan nom
436 an nan nam mob ern
437 berm man nona nan
438 nam an mon nab ern
439 bran men mon naan
440 nam nor nan be man
441 barn mane nan mon
442 nam on nan mar neb
443 berm mon anna nan
444 nam no nan mar neb
445 berm man nano nan
446 an nan arm nom neb
447 barn omen nam nan
448 nam nor me nab nan
449 borne man nam nan
450 me ran nan nom ban
451 nom manna ran neb
452 an nan nom ban rem
453 berm nam anon nan
454 me ran nan nam nob
455 bren mom naan nan
456 a nan norn ban mem
457 bran men noma nan
458 an nan ram nom neb
459 nam nom an banner
460 me ran nan nab nom
461 bren nom man naan
462 an nan nom nab rem
463 ben rom manna nan
464 a nan norn nab mem
465 bran mane nan mon
466 an nan mar nom neb
467 nana norn ban mem
468 an nan ban nom erm
469 born men nam nana
470 an nan mon barn me
471 bam amen nan norn
472 nam or nan ban men
473 bean norn man nam
474 me nam on nan barn
475 bren moan nam nan
476 born men nam nan a
477 bran omen nam nan
478 an nan nab nom erm
479 bam men norn naan
480 nom ran an men nab
481 nana norn nab mem
482 me nam no nan barn
483 reb mon manna nan
484 nam or nan nab men
485 nam bonne ran man
486 norn nam a ban men
487 ben norn maam nan
488 ben or nam man nan
489 nab mean nam norn
490 an nan nom men bra
491 baron men nam nan
492 on nan ban nam erm
493 bean norm nam nan
494 no nan ban nam erm
495 barn men nom anna
496 norn nam a nab men
497 neb norn mama nan
498 an nan mon bran me
499 ben norm nam anna
500 be nom man ran nan

### sachintendulkar:people

input: Sachin Tendulkar
category: people
phrases 1 to 500 of 500

1 enchiladas trunk
2 the sunk cardinal
3 an in crushed talk
4 an held a trucks in
5 enchilada trunks
6 this unclean dark
7 i handle an trucks
8 he trucks an in lad
9 the unkind rascal
10 us think an cradle
11 an in rash let duck
12 us think calendar
13 his trunk candle a
14 he drink an cut las
15 an uncharted silk
16 it lunches an dark
17 an held art suck in
18 an ethical drunks
19 struck in handle a
20 he trucks an in dal
21 its ranked launch
22 his a dunk central
23 an held in rat suck
24 the cranial dunks
25 an rest kid launch
26 he drink an cut als
27 this nuanced lark
28 i latches an drunk
29 i tsk an red launch
30 her dank lunatics
31 in a handle trucks
32 her kin a dust clan
33 us talk hindrance
34 it hulk an dancers
35 an held in tar suck
36 it launched ranks
37 drunk a has client
38 an rich a tend sulk
39 she drank lunatic
40 i chalked an turns
41 an rush at deck lin
42 it drank launches
43 us hand an trickle
44 he land in struck a
45 children ask aunt
46 i churned an talks
47 i dusk her tan clan
48 he drank lunatics
49 i clashed an trunk
50 her kin a stud clan
51 its dank launcher
52 an hunt clears kid
53 he land in trucks a
54 nuclear sad think
55 he link an custard
56 us rat an kind lech
57 it hunker scandal
58 kind a rest launch
59 an in lush rack ted
60 under talk chains
61 shackled in turn a
62 an rush at deck nil
63 it darkens launch
64 drunk a let chains
65 he sit an dank curl
66 it calendars hunk
67 i tusk an chandler
68 an in held struck a
69 land thank cruise
70 us kit an chandler
71 i run a land sketch
72 it calendar hunks
73 an run hacked list
74 an struck a hed lin
75 i calendars thunk
76 us lard an kitchen
77 us tar an kind lech
78 he stunk cardinal
79 it chalked an runs
80 an kin ted has curl
81 at drink launches
82 an in tracked lush
83 i charts an dun elk
84 saucer land think
85 an ain held trucks
86 an las dun her tick
87 children ask tuna
88 struck line hand a
89 i let a darn chunks
90 i lunches tankard
91 sliced run thank a
92 an struck a hed nil
93 unclear sad think
94 it hulks an dancer
95 an sunk red hit lac
96 hand until creaks
97 us hand an tickler
98 an lit ern has duck
99 ain struck handle
100 an hurt sad nickel
101 an sunk a retch lid
102 salad run kitchen
103 an run kid satchel
104 i charts an dun lek
105 launch seat drink
106 this a dunk lancer
107 he curl an dank tis
108 kind launch tears
109 his dna run tackle
110 i starch an dun elk
111 chains talked run
112 an are thuds clink
113 hed lurk an in cast
114 it unhand slacker
115 an dark hit uncles
116 i let a chunks rand
117 sunk in cathedral
118 an struck line had
119 hed lurk an in cats
120 saul think dancer
121 an in thud slacker
122 i let as darn chunk
123 drunk late chains
124 an rule kid snatch
125 hed lurk an in acts
126 launch eat drinks
127 an hail end trucks
128 an als dun her tick
129 detail shrunk can
130 truck had an lines
131 rich dent sulk an a
132 under chain talks
133 kind hunt clears a
134 i land hen trucks a
135 kinda rest launch
136 an let dunk chairs
137 i starch an dun lek
138 nude think rascal
139 an thunk is cradle
140 i ask then land cur
141 launched an skirt
142 an haul end tricks
143 i let as chunk rand
144 kinda trash uncle
145 shackled in run at
146 i land urn sketch a
147 drunk aah clients
148 an run dish tackle
149 she tin a darn luck
150 sir launched tank
151 in at lunches dark
152 an sec lin hurt dak
153 scandal rue think
154 rascal dunk the in
155 an kin ted ash curl
156 chandler ask unit
157 struck in had lane
158 an rich kat dun les
159 central said hunk
160 children tusk an a
161 i lurk a end snatch
162 launch stare kind
163 trucks had an line
164 an lit ras end huck
165 thunk is calendar
166 an in stacked hurl
167 hed lurk an in scat
168 casual drink then
169 an run kid latches
170 i lend hun tracks a
171 land take urchins
172 an ted risk launch
173 an lit ars end huck
174 talked an urchins
175 i lurked an snatch
176 hick end slur an at
177 staunch real kind
178 it dunks her canal
179 i tsk nerd launch a
180 anal cursed think
181 this rank land cue
182 he rut as land nick
183 clause darn think
184 in drunk latches a
185 i run she clank tad
186 launch train desk
187 an like dun charts
188 i sulk the darn can
189 trucks hand alien
190 an hulk sit dancer
191 i lurk a end chants
192 kind clears haunt
193 his kat run candle
194 a sun in held track
195 teach nails drunk
196 hand til an sucker
197 an kin les rut chad
198 caldera think sun
199 an turd has nickel
200 in slut hard neck a
201 eats drink launch
202 an in traced hulks
203 an sec nil hurt dak
204 tea drinks launch
205 cashed in run talk
206 he lust in rack dna
207 sunk then radical
208 i churned an stalk
209 an lit ern ash duck
210 shackled ain turn
211 it cradle an hunks
212 us ran i land ketch
213 secular and think
214 struck in had lean
215 i sulk a trench dna
216 unclean dark shit
217 an at lunches dirk
218 a lust in hard neck
219 kind launch rates
220 in lane had trucks
221 i sulk the rand can
222 launch read stink
223 kind a run satchel
224 i dunk a trench las
225 scared luna think
226 an rule kid chants
227 he lack as dirt nun
228 kind launches art
229 an hit clears dunk
230 i lard nun sketch a
231 lunatic shark end
232 an hulk end racist
233 i land he ruck ants
234 hands ruin tackle
235 laden in has truck
236 she ran lat duck in
237 chains deal trunk
238 an sunk eldritch a
239 she ran alt duck in
240 kinda clears hunt
241 in turns chalked a
242 ern has til an duck
243 launch trade skin
244 an in shackled rut
245 he run ant sick lad
246 hands nail tucker
247 an at discern hulk
248 us cant in red lakh
249 raid thank uncles
250 us charted an link
251 an rich kat dun els
252 rank until chased
253 it cranked an lush
254 in rash at end luck
255 dna strike launch
256 tickles had an run
257 it sank he land cur
258 skin launched art
259 ten dark is launch
260 in run a sketch lad
261 kind at launchers
262 an dares thin luck
263 she irk an dun talc
264 crusade thank lin
265 kind a rule snatch
266 he dun lin tracks a
267 lakh run distance
268 liked a run snatch
269 us ink a trench lad
270 dune think rascal
271 he dunk an cristal
272 i lurk den snatch a
273 tucker hand nails
274 an dirk set launch
275 he rid a clunks ant
276 star include hank
277 scared in talk hun
278 i hunt ark land sec
279 distance ran hulk
280 cursed lin thank a
281 i run an lad sketch
282 sand until hacker
283 an in shackle turd
284 it ran las end huck
285 inland has tucker
286 struck linen had a
287 such ken darn til a
288 ate drinks launch
289 an at churned silk
290 i tsk a rend launch
291 crinkles had aunt
292 an at rescind hulk
293 run kit as held can
294 rand think clause
295 it cradles an hunk
296 hick den slur an at
297 scandal hike turn
298 an run hacked slit
299 i nut led ran shack
300 anus think cradle
301 kind a lunches art
302 an kin els rut chad
303 dna until hackers
304 crushed inn talk a
305 a tsk in red launch
306 turn hacked nails
307 scared a hunt link
308 i he land an trucks
309 launch tanks ride
310 i lurked an chants
311 i ask hen darn cult
312 drunk ain satchel
313 sick turn had lane
314 i dunk a trench als
315 calendar shut ink
316 an hunk rid castle
317 us tan a clerk hind
318 cheat nails drunk
319 an lakh sun credit
320 then sun a rick lad
321 under stalk china
322 lie an struck hand
323 i lurk den chants a
324 launch dare stink
325 an in suckled hart
326 a link as then curd
327 its rank launched
328 an lure kid snatch
329 a link as then crud
330 launches rat kind
331 his rank laden cut
332 he dun nil tracks a
333 inhaled an trucks
334 in a churned talks
335 i dunks clear nth a
336 ancient hard sulk
337 in trunk clashed a
338 he run ant sick dal
339 lunar sad kitchen
340 an hut risk candle
341 i sun kent arch lad
342 redskin launch at
343 i cradles an thunk
344 i nut hard scan elk
345 chains lead trunk
346 an ride tsk launch
347 i nut del ran shack
348 teach snail drunk
349 shut a link dancer
350 i tans he land ruck
351 nuclear stink had
352 kind a run latches
353 in run a sketch dal
354 launch take rinds
355 an crushed at link
356 held uns in track a
357 stickler unhand a
358 an hula end tricks
359 sketch lid run an a
360 launch and strike
361 an las nicked hurt
362 lin and he trucks a
363 art includes hank
364 in at hulk dancers
365 in at she darn luck
366 link crashed aunt
367 an dna rush tickle
368 his a ran lent duck
369 calendar shut kin
370 an lit scared hunk
371 i nut hard cans elk
372 under stalk chain
373 an saul kid trench
374 huck end til an ras
375 this luna cranked
376 an run tickled ash
377 us ink a trench dal
378 lakhs end curtain
379 an like dun starch
380 i nut led ran hacks
381 kinda run satchel
382 an hurt sacked lin
383 it ran als end huck
384 launch rate kinds
385 his aunt lard neck
386 us hed it rank clan
387 launch tear kinds
388 drunk a ash client
389 she run lid act kan
390 tackle hand ruins
391 drunk a lie snatch
392 his elk and nut car
393 star include khan
394 an ads hurt nickel
395 slut and he rack in
396 launch trade sink
397 an shad run tickle
398 in at as herd clunk
399 launch tanked sir
400 in a tusk chandler
401 in run led has tack
402 centaurs had link
403 an rune task child
404 a hurl as kind cent
405 launch drank site
406 an lines truck dah
407 i sun kent char lad
408 skin launched rat
409 an sun direct lakh
410 an hank i crust led
411 taka sun children
412 an lad ruin sketch
413 huck end til an ars
414 dean talk urchins
415 us thank in cradle
416 i run an dal sketch
417 launch snake dirt
418 an hunk sit cradle
419 he lust in and rack
420 hard link nutcase
421 an sulk hit dancer
422 she run lid cat kan
423 sink launched art
424 an dears thin luck
425 i nut hard scan lek
426 sura think candle
427 trucks hand an lie
428 i sulk a and trench
429 kinda rule snatch
430 an lunt kid search
431 in a hats red clunk
432 nuclear ads think
433 an lad thin sucker
434 he tan urn sick lad
435 slicker hand aunt
436 its ark end launch
437 hurl is kat end can
438 hunk sit calendar
439 an talk dun riches
440 then sun a rick dal
441 staunch dark line
442 an hart kid uncles
443 i nut del ran hacks
444 echidna talk runs
445 kind a rule chants
446 an khan i crust led
447 slacker hand unit
448 liked a run chants
449 i nut hard cans lek
450 drunks aah client
451 red a stink launch
452 in run del has tack
453 ain handle trucks
454 an lit cursed hank
455 ern ash til an duck
456 ancient dark lush
457 tackled an rush in
458 it lark sen can hud
459 launch ask tinder
460 in ruth ask candle
461 nil and he trucks a
462 its hunk calendar
463 her inland at suck
464 an hank i crust del
465 under talks china
466 red tank is launch
467 an hun i tracks led
468 hackers land unit
469 an in crusted lakh
470 lush kat in red can
471 tracheal kind sun
472 an lane hid trucks
473 i run hes clank tad
474 shrunk an dialect
475 in desk launch art
476 i lurk a and stench
477 us knelt arachnid
478 in hunt ask cradle
479 his lek and nut car
480 kinda lunches art
481 in hat land sucker
482 i rest hank dun lac
483 cursed nail thank
484 rascal kid the nun
485 an hen i trucks lad
486 launch tae drinks
487 an line trucks dah
488 i sun kent arch dal
489 hacker land units
490 tickle had an runs
491 i ran tun shack led
492 candle shark unit
493 sucker land an hit
494 rind hulk a set can
495 later dunk chains
496 his lunt cranked a
497 an a hun tricks led
498 chairs talked nun
499 hurt a sand nickel
500 in a hast red clunk

### mrbeast:people

input: MrBeast
category: people
phrases 1 to 42 of 42

1 smart be
2 arm best
3 ram best
4 mar best
5 arms bet
6 bats rem
7 arm bets
8 bars met
9 bar stem
10 mars bet
11 bam rest
12 trams be
13 mat rebs
14 ram bets
15 rams bet
16 bras met
17 mar bets
18 stab rem
19 abs term
20 bra stem
21 brats me
22 bas term
23 mats reb
24 brat ems
25 sat berm
26 tabs rem
27 stab erm
28 mast reb
29 bats erm
30 tam rebs
31 tram bes
32 tabs erm
33 mart bes
34 bast rem
35 tas berm
36 bast erm
37 bam tres
38 stab mer
39 bats mer
40 mas bret
41 tabs mer
42 bast mer

### shubmangill:people

input: Shubman Gill
category: people
phrases 1 to 500 of 500

1 blushing lam
2 him gun balls
3 humbling las
4 his numb gall
5 malign blush
6 him guns ball
7 humbling als
8 him ball sung
9 blaming lush
10 him bull sang
11 shaming bull
12 him ball snug
13 mashing bull
14 him bull snag
15 balling hums
16 him bags null
17 balling mush
18 him slung lab
19 bashing mull
20 him bulls nag
21 gumball shin
22 him bull nags
23 bash mulling
24 man bills hug
25 lingam blush
26 him gall buns
27 bushman gill
28 man bugs hill
29 blushing mal
30 him gulls ban
31 humbling sal
32 man bug hills
33 man bill hugs
34 man bull sigh
35 him gan bulls
36 his lung lamb
37 all numb sigh
38 him nab gulls
39 small big hun
40 sum hang bill
41 hall bum sign
42 mill hang bus
43 man bill gush
44 bum sing hall
45 him snub gall
46 lung has limb
47 ham bill guns
48 ball sign hum
49 man bush gill
50 mash bill gun
51 ball sing hum
52 sham bill gun
53 ham bills gun
54 small bin hug
55 bang his mull
56 ham bull sign
57 his lung balm
58 bull sing ham
59 bam gun hills
60 him gull bans
61 gum shall bin
62 his bung mall
63 gun slim blah
64 ball gun shim
65 nigh all bums
66 mug shall bin
67 bam guns hill
68 big shun mall
69 ill hang bums
70 bang hill sum
71 mill has bung
72 ham bill sung
73 gas numb hill
74 mill hang sub
75 bash gun mill
76 hams bill gun
77 man bug shill
78 sang bum hill
79 sang bill hum
80 ball gum shin
81 mus hang bill
82 bam sign hull
83 bill hung mas
84 all bung shim
85 nim shall bug
86 gills man hub
87 ball mug shin
88 bam sing hull
89 mans bill hug
90 hub sign mall
91 bang hums ill
92 mis hang bull
93 hub sing mall
94 sung hill bam
95 bang mush ill
96 ball gin hums
97 blah guns mil
98 ball hung mis
99 balls gin hum
100 bag shun mill
101 ball gin mush
102 mall bush gin
103 ham bill snug
104 limb gun lash
105 balls hug nim
106 mall bug shin
107 hall bums gin
108 limb hung las
109 mills bag hun
110 sham big null
111 hall bin mugs
112 ling sum blah
113 nigh bus mall
114 mans bug hill
115 ban gum hills
116 bangs hum ill
117 nag bill hums
118 hall bin gums
119 hall bins gum
120 snag bum hill
121 ling hums lab
122 ban hug mills
123 snag bill hum
124 hall bugs nim
125 nag bum hills
126 gill man hubs
127 nag bill mush
128 ism hang bull
129 ling mush lab
130 abs hung mill
131 ban mug hills
132 small bug hin
133 lung ash limb
134 huns mill bag
135 hall bins mug
136 blah gun mils
137 mash bull gin
138 halls bum gin
139 lam bush ling
140 halls bin gum
141 sham bull gin
142 bun sigh mall
143 shag numb ill
144 hun mill bags
145 ball hung ism
146 bang hill mus
147 mall bins hug
148 lab sling hum
149 bam gun shill
150 ham bulls gin
151 nag bush mill
152 snug hill bam
153 mall bin hugs
154 gum shall nib
155 lambs hug lin
156 ban mugs hill
157 bill shun mag
158 halls bin mug
159 lamb hug nils
160 labs hung mil
161 lamb hung lis
162 nag bums hill
163 hills nab gum
164 lamb hugs lin
165 bag shin mull
166 ball hugs nim
167 mags bill hun
168 nag bills hum
169 hub mill sang
170 slim lab hung
171 ban gums hill
172 malls bin hug
173 blah mugs lin
174 mag bull shin
175 bun hill mags
176 buns hill mag
177 mills nab hug
178 mug shall nib
179 hums gan bill
180 blah gin slum
181 lab hung mils
182 man big hulls
183 hills nab mug
184 mush gan bill
185 blah gums lin
186 lamb gin lush
187 blah gum nils
188 nags bum hill
189 bags hull nim
190 big huns mall
191 nags bill hum
192 gall bum shin
193 lash bum ling
194 nibs gum hall
195 ling hum labs
196 bas hung mill
197 mil bash lung
198 hall bum gins
199 gash numb ill
200 bam hung sill
201 bang lush mil
202 ham bin gulls
203 lam blush gin
204 bun hills mag
205 slab hung mil
206 nigh sub mall
207 limb hung als
208 bam hung ills
209 ban hugs mill
210 bang hull mis
211 bans gum hill
212 blah mug nils
213 bun mill shag
214 hill nab mugs
215 ash numb gill
216 balls gum hin
217 mag bill huns
218 bis hung mall
219 hams bull gin
220 buns mill hag
221 nibs mug hall
222 sag numb hill
223 lamb lug shin
224 gill ham buns
225 gib hulls man
226 small hub gin
227 ling slam hub
228 nigh slum lab
229 null bag shim
230 bang hum sill
231 halls bug nim
232 nag bull shim
233 shag bull nim
234 hill gan bums
235 hill nab gums
236 nibs hug mall
237 ash bung mill
238 ball gins hum
239 bang hum ills
240 bans mug hill
241 hum gan bills
242 mags bin hull
243 balls mug hin
244 bill shun gam
245 mash bung ill
246 limb shun gal
247 bans hug mill
248 blah slug nim
249 sham bung ill
250 hags numb ill
251 mag bills hun
252 mall bin gush
253 nigh bull mas
254 gills ham bun
255 ling hum slab
256 bam sigh null
257 gall bin hums
258 gam bull shin
259 ham bull gins
260 mas bung hill
261 buns hill gam
262 lambs hug nil
263 smug bin hall
264 lamb gush lin
265 ball gush nim
266 gall bin mush
267 lamb hugs nil
268 mag blush lin
269 mills nag hub
270 mill nab hugs
271 ball mugs hin
272 bam gull shin
273 blah mugs nil
274 nub sigh mall
275 gill shun bam
276 big hun malls
277 mall bugs hin
278 bun mill gash
279 hall bung mis
280 gall bush nim
281 balm hug nils
282 balm hung lis
283 gams bill hun
284 hub mill snag
285 ball gums hin
286 balm hugs lin
287 gill hums ban
288 gills hum ban
289 bang hull ism
290 blah gums nil
291 shall bum gin
292 bun hills gam
293 bun hill gams
294 gal blush nim
295 shim gan bull
296 gash bull nim
297 hub sling lam
298 bag hulls nim
299 gill mush ban
300 bash gin mull
301 gam bill huns
302 gill mash bun
303 gab shun mill
304 hubs gin mall
305 mag snub hill
306 lush nag limb
307 ban sigh mull
308 mash bin gull
309 mull hang bis
310 nag blush mil
311 ban gush mill
312 sham bin gull
313 hub gin malls
314 nub hill mags
315 small nib hug
316 balm gin lush
317 hag numbs ill
318 shag bin mull
319 bun mill hags
320 nib mugs hall
321 hun slag limb
322 bam gin hulls
323 ban gum shill
324 hag bulls nim
325 hams bung ill
326 mills gab hun
327 has numb gill
328 gam bills hun
329 gall bins hum
330 ham bins gull
331 glum sin blah
332 limb shun lag
333 mag bins hull
334 smug lin blah
335 hags bull nim
336 nag bum shill
337 mills gan hub
338 nib gums hall
339 lamb slug hin
340 hun lag limbs
341 balm lug shin
342 ban mug shill
343 shim gall bun
344 hums nab gill
345 hum nab gills
346 hag snub mill
347 nub hills mag
348 gams bin hull
349 gam blush lin
350 mags bull hin
351 ham snub gill
352 glum shin lab
353 mil slang hub
354 nub mill shag
355 hall bung ism
356 mush nab gill
357 hag numb sill
358 bam gins hull
359 huns mill gab
360 gib shun mall
361 gill mans hub
362 nib gum halls
363 lamb gush nil
364 hag numb ills
365 ling lam hubs
366 mull nab sigh
367 lush gan limb
368 mill nab gush
369 hub mill nags
370 mil gan blush
371 mag blush nil
372 ham bung sill
373 hub gins mall
374 hubs mill nag
375 nib hugs mall
376 bash gull nim
377 ham bung ills
378 gam snub hill
379 shill nab gum
380 nib mug halls
381 balm gush lin
382 ban gull shim
383 mans big hull
384 gash bin mull
385 lag blush nim
386 gill hams bun
387 gills ham nub
388 balm hugs nil
389 hams bin gull
390 huns lag limb
391 mag bin hulls
392 malls bug hin
393 hangs bum ill
394 gab shin mull
395 nib hug malls
396 blah lugs nim
397 lash bung mil
398 shill nab mug
399 hin mull bags
400 gill hum bans
401 lush ling bam
402 gam bins hull
403 nibs hum gall
404 nub mill gash
405 small gib hun
406 nibs gull ham
407 small bin ugh
408 nibs hull mag
409 hags bin mull
410 hag bins mull
411 bun shill mag
412 nub hills gam
413 nub hill gams
414 gib hull mans
415 bam gulls hin
416 nib gulls ham
417 smug nil blah
418 small bung hi
419 gill mash nub
420 nigh mull abs
421 snug mil blah
422 mag bulls hin
423 mill gan hubs
424 shim nab gull
425 man bills ugh
426 man glib lush
427 gam blush nil
428 ball nigh sum
429 mash big null
430 hang bum sill
431 gall bums hin
432 null gab shim
433 nub mill hags
434 nib hull mags
435 hang bum ills
436 balm slug hin
437 gams bull hin
438 nib gush mall
439 gam bin hulls
440 glum ins blah
441 nib hums gall
442 shim gall nub
443 smug nib hall
444 balm gush nil
445 sham bun gill
446 nib mush gall
447 glum bin lash
448 null mash gib
449 lamb lugs hin
450 lambs lug hin
451 ban smug hill
452 nibs hull gam
453 bun shill gam
454 nim gall hubs
455 nibs mull hag
456 nigh mull bas
457 gam bulls hin
458 gill hams nub
459 smug bill nah
460 gab hulls nim
461 nib gull mash
462 hams big null
463 nib mull shag
464 gan bum hills
465 glib lam shun
466 nab smug hill
467 nub shill mag
468 nib hull gams
469 gan bush mill
470 null hams gib
471 nib mull gash
472 nib gull hams
473 ball smug hin
474 nib hulls mag
475 balm lugs hin
476 bash glum lin
477 sham nub gill
478 ball nigh mus
479 glib hun alms
480 glum hin labs
481 nub shill gam
482 small nib ugh
483 nib mull hags
484 nah bum gills
485 his lung blam
486 sham gib null
487 glum hin slab
488 nib hulls gam
489 glum nib lash
490 sham nib gull
491 bash glum nil
492 nah bills gum
493 mans bill ugh
494 nah bill mugs
495 slam glib hun
496 nah bill gums
497 nah bills mug
498 nah bug mills
499 nah bugs mill
500 gan bum shill

### nickwalker:people

input: Nick Walker
category: people
phrases 1 to 106 of 106

1 rack winkle
2 we nick lark
3 wreak clink
4 we link rack
5 wanker lick
6 we lick rank
7 lawn kicker
8 i clerk wank
9 wank licker
10 we lack rink
11 a wreck link
12 we clink ark
13 we rack kiln
14 a clerk wink
15 we crank ilk
16 we lick nark
17 a wreck kiln
18 we irk clank
19 car knew ilk
20 law rick ken
21 war lick ken
22 new lick ark
23 war nick elk
24 an wreck ilk
25 war nick lek
26 war neck ilk
27 elk wink car
28 new irk lack
29 raw lick ken
30 law kick ern
31 elk win rack
32 raw nick elk
33 neck irk law
34 lek wink car
35 arc knew ilk
36 lek win rack
37 raw nick lek
38 raw neck ilk
39 elk ran wick
40 wan rick elk
41 new kirk lac
42 ark lick wen
43 lek ran wick
44 wan rick lek
45 elk wink arc
46 kan crew ilk
47 ken irk claw
48 wen irk lack
49 ilk rack wen
50 lek wink arc
51 elk ink craw
52 rink caw elk
53 rack new ilk
54 lek ink craw
55 rink caw lek
56 caw kern ilk
57 kin elk craw
58 cal new kirk
59 lar new kick
60 kin lek craw
61 kir new lack
62 irk lac knew
63 ick new lark
64 we lick karn
65 carl we kink
66 we clank kir
67 lac wen kirk
68 lar kick wen
69 naw rick elk
70 walk rec ink
71 craw ken ilk
72 walk rec kin
73 law neck kir
74 clan we kirk
75 naw rick lek
76 war keck lin
77 law rec kink
78 lac knew kir
79 law ick kern
80 war keck nil
81 raw keck lin
82 walk ick ern
83 war cel kink
84 cal wen kirk
85 wan cel kirk
86 raw keck nil
87 ark cel wink
88 lark ick wen
89 raw cel kink
90 cel irk wank
91 claw ken kir
92 wank rec ilk
93 lar wick ken
94 warn ick elk
95 lack wen kir
96 warn ick lek
97 lar keck win
98 irk cal knew
99 naw cel kirk
100 rin wack elk
101 wack ern ilk
102 law keck rin
103 rin wack lek
104 lar ick knew
105 cal knew kir
106 wank cel kir

### halleberry:people

input: Halle Berry
category: people
phrases 1 to 87 of 87

1 harry belle
2 be her rally
3 hell by err a
4 herbal lyre
5 a berry hell
6 he err by all
7 herbal rely
8 by rare hell
9 brr he yell a
10 bray heller
11 her bell ray
12 a brr hey ell
13 really herb
14 by rear hell
15 a brr yeh ell
16 rarely bleh
17 bar her yell
18 he rally reb
19 rely her lab
20 ball her rye
21 yell her bra
22 rye bar hell
23 her lyre lab
24 bye err hall
25 her bell rya
26 her reb ally
27 hell ray reb
28 all berry he
29 bray her ell
30 all herb rye
31 bell err hay
32 bay hell err
33 ell ray herb
34 bey err hall
35 ley err blah
36 lye err blah
37 be ell harry
38 bly her real
39 hey err ball
40 her bell yar
41 bly her earl
42 bra hell rye
43 her reb yall
44 aby hell err
45 bly her lear
46 bal her lyre
47 he larry bel
48 bally he err
49 hall reb rye
50 rya reb hell
51 yah bell err
52 yeh err ball
53 rah bell rye
54 he lar beryl
55 bleh err lay
56 hall brr eye
57 rya herb ell
58 yea brr hell
59 rely her bal
60 aye brr hell
61 bly err hale
62 lay brr heel
63 yeah brr ell
64 alley brr he
65 bah yell err
66 yar reb hell
67 lar bly here
68 ally brr hee
69 rah bel rely
70 hale brr ley
71 rah reb yell
72 hale brr lye
73 larry ble he
74 yar herb ell
75 heal brr ley
76 lar herb ley
77 heal brr lye
78 lar herb lye
79 rah bel lyre
80 hae brr yell
81 yall brr hee
82 rah bly reel
83 lar bleh rye
84 heal bly err
85 rah ble lyre
86 rah bly leer
87 rah ble rely

### maxscherzer:people

input: Max Scherzer
category: people
phrases 1 to 5 of 5

1 herm sex czar
2 czar mesh rex
3 arms chez rex
4 mars chez rex
5 rams chez rex
