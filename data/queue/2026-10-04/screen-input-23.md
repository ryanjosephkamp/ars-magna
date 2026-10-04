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

## File 23 of 43: 2783 phrases

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

### casekeenum:people

input: Case Keenum
category: people
phrases 1 to 203 of 203

1 acumen seek
2 me cause ken
3 me nuke sec a
4 us came knee
5 me suck nee a
6 us came keen
7 a neck me use
8 me nuke case
9 me cues ken a
10 me sauce ken
11 me cue ken as
12 an meek cues
13 a neck me sue
14 me cue snake
15 me cue kens a
16 me cue sneak
17 us me ace ken
18 men use cake
19 ken see cum a
20 use came ken
21 a cue ken ems
22 me nukes ace
23 sec emu ken a
24 us keen mace
25 me cee sunk a
26 me nuke aces
27 us can me eek
28 men sue cake
29 us can me eke
30 man cue seek
31 cee ken sum a
32 sue came ken
33 mun eek sec a
34 us keen acme
35 mun eke sec a
36 sake cue men
37 a cee ken mus
38 knee use mac
39 men suk cee a
40 nuke see mac
41 a cum eek sen
42 mac keen use
43 a cum eke sen
44 same cue ken
45 an cee me suk
46 knee use cam
47 kan cee me us
48 can seek emu
49 nuke see cam
50 us emcee kan
51 cam keen use
52 sen make cue
53 ken use mace
54 knee sue mac
55 mac keen sue
56 knee sue cam
57 cam keen sue
58 ken use acme
59 can meek use
60 cum keen sea
61 sunk emcee a
62 sea neck emu
63 ace meek sun
64 ken sue mace
65 ace keen sum
66 cue seem kan
67 ken ease cum
68 ken sue acme
69 can meek sue
70 mas cue knee
71 cum seen kea
72 mesa cue ken
73 mas cue keen
74 seam cue ken
75 ane muck see
76 kea cues men
77 ace knee sum
78 nee use mack
79 ace keen mus
80 sen cake emu
81 ace nuke ems
82 ace meek uns
83 emu aces ken
84 ace ken muse
85 nee sum cake
86 nee ace musk
87 nee muck sea
88 nee cum sake
89 sac keen emu
90 nee sue mack
91 nee cue mask
92 ace knee mus
93 sec menu kea
94 ane cum seek
95 nee mus cake
96 nee emu sack
97 nee scum kea
98 ace kens emu
99 us meek cane
100 mun see cake
101 nee emu cask
102 mae neck use
103 sea cum knee
104 us meek acne
105 an emcee suk
106 case ken emu
107 me cues kane
108 me necks eau
109 mae neck sue
110 mae sec nuke
111 mae nee suck
112 amu sec knee
113 kane sec emu
114 amu sec keen
115 nam cue seek
116 kae sec menu
117 sae keen cum
118 make cee sun
119 ace seek mun
120 sac knee emu
121 can eek muse
122 suk nee mace
123 mae cues ken
124 can eke muse
125 mace knee us
126 kane cue ems
127 kae cues men
128 sae nee muck
129 kane cum see
130 eau neck ems
131 kae nee scum
132 amu neck see
133 maes cue ken
134 ask cee menu
135 came eek sun
136 man cues eek
137 suk nee acme
138 sae neck emu
139 came eke sun
140 mae cue kens
141 man cues eke
142 acme knee us
143 make cee uns
144 nae muck see
145 sane cum eek
146 mace eek sun
147 sane cum eke
148 mace eke sun
149 ane scum eek
150 ane scum eke
151 cane eek sum
152 cane eke sum
153 acme eek sun
154 mas cee nuke
155 acme eke sun
156 kan cee muse
157 came eek uns
158 kae cum seen
159 sac eek menu
160 came eke uns
161 mans cue eek
162 acne eek sum
163 sac eke menu
164 mans cue eke
165 acne eke sum
166 nae cum seek
167 scan eek emu
168 ane cee musk
169 mace eek uns
170 cane eek mus
171 cans eek emu
172 sae cum knee
173 scan eke emu
174 nee suk came
175 mace eke uns
176 cane eke mus
177 cans eke emu
178 kane cee sum
179 mean cee suk
180 acme eek uns
181 acne eek mus
182 sank cee emu
183 name cee suk
184 acme eke uns
185 acne eke mus
186 eek sean cum
187 eke sean cum
188 kane cee mus
189 ska cee menu
190 sake cee mun
191 amen cee suk
192 case eek mun
193 eek nae scum
194 sunk cee mae
195 case eke mun
196 nae cee musk
197 eek nam cues
198 eke nae scum
199 eke nam cues
200 mane cee suk
201 amu cee kens
202 aces eek mun
203 aces eke mun

### dennishaskins:people

input: Dennis Haskins
category: people
phrases 1 to 500 of 500

1 skinheads inns
2 in has kindness
3 she sins an kind
4 an skinned hiss
5 he sins an kinds
6 i sinned shanks
7 she sin an kinds
8 nine kiss hands
9 his in sank ends
10 kindness shin a
11 an sheds skin in
12 in ash kindness
13 an hens is kinds
14 an kinds shines
15 an shed skins in
16 in shanked sins
17 she kids an inns
18 his kinds senna
19 an shed sinks in
20 hand kisses inn
21 his inn ask ends
22 nines has kinds
23 an end shin kiss
24 nines kiss hand
25 an sheds sink in
26 nine skis hands
27 an desk shins in
28 sand shine skin
29 an desks shin in
30 hands skies inn
31 his inn asks end
32 in skinned sash
33 his in sand kens
34 as skinned shin
35 in end is shanks
36 in snakes hinds
37 in ness has kind
38 dna shines skin
39 his inns ask end
40 kind hisses nan
41 she sins an dink
42 sand shine sink
43 she disks an inn
44 nan kids shines
45 in kens is hands
46 sine skin hands
47 his sin sank end
48 nan dishes skin
49 an end hiss skin
50 skin and shines
51 his in sank dens
52 henna kids sins
53 an in disks hens
54 an skins shined
55 in ends is hanks
56 skins had nines
57 in ends is shank
58 inn ashes kinds
59 she skids an inn
60 dna shines sink
61 an shed skin sin
62 an sinks shined
63 an hen sins kids
64 sinks had nines
65 she skins an din
66 snakes dish inn
67 he sins an dinks
68 shades skin inn
69 an shed kiss inn
70 ash sinned skin
71 she sin an dinks
72 dna shine skins
73 an hens sin kids
74 in sneaks hinds
75 she sinks an din
76 sine sink hands
77 his in dank ness
78 an dinks shines
79 his ken sin sand
80 nan dishes sink
81 his ken sins dna
82 dna shine sinks
83 an in skids hens
84 nines ski hands
85 an end hiss sink
86 sink and shines
87 his in ken sands
88 ashen kind sins
89 an hens sins kid
90 inn asked shins
91 an ski send shin
92 heads skins inn
93 an shed sink sin
94 kinda sins hens
95 his desk sin nan
96 sane kind shins
97 an desk shin sin
98 nina sheds skin
99 she disk an inns
100 hank sinned sis
101 in skin send ash
102 senna kids shin
103 his den kiss nan
104 shanks dines in
105 an den shin kiss
106 hand skies inns
107 an ken sins dish
108 sand shines ink
109 his sen skin dna
110 heads sinks inn
111 an kiss send hin
112 heads skin inns
113 in sen has kinds
114 in snaked shins
115 his sen kids nan
116 skins and shine
117 an sen shin kids
118 senna dish skin
119 his inn ask dens
120 sand shines kin
121 an hens is dinks
122 nan kissed shin
123 an end shin skis
124 nina shed skins
125 in ends is khans
126 sedan shin skin
127 his ness kid nan
128 dean shins skin
129 he disks an inns
130 sands shine ink
131 an ness shin kid
132 shades sink inn
133 an sen skin dish
134 sinks and shine
135 an ink send hiss
136 ash sinned sink
137 she skid an inns
138 inns asked shin
139 an hes sin kinds
140 inn sank dishes
141 his inn asks den
142 kind hiss senna
143 nan end his kiss
144 nina shed sinks
145 an sheds inks in
146 kine sins hands
147 in den is shanks
148 sands shine kin
149 his ins sank end
150 sneak hind sins
151 an kin send hiss
152 khan sinned sis
153 an shed ink sins
154 kinda shin ness
155 in sink send ash
156 nine skins shad
157 his inns ask den
158 skinned shins a
159 kan sends his in
160 dean shin skins
161 an ends shin ski
162 nines skis hand
163 his sen sink dna
164 nan shined kiss
165 i send in shanks
166 nina sheds sink
167 kind hens sins a
168 desk shins nina
169 an skin hid ness
170 head skins inns
171 he skids an inns
172 sis henna kinds
173 an shed kin sins
174 nine sinks shad
175 in skin end sash
176 nines skin dash
177 an shed skin ins
178 dean shin sinks
179 in inn has desks
180 sine skins hand
181 in inns has desk
182 shiksa send inn
183 an end shins ski
184 heads sink inns
185 his in desks nan
186 his dinks senna
187 an hin kiss ends
188 sneaks dish inn
189 an ins kids hens
190 head sinks inns
191 his sin sank den
192 nines ash kinds
193 an sen sink dish
194 senna dish sink
195 his ins sand ken
196 sine sinks hand
197 an den hiss skin
198 inn shank sides
199 his ness ink dna
200 sedan shin sink
201 an desk hiss inn
202 dean shins sink
203 kind ness shin a
204 nine asks hinds
205 in ness ash kind
206 nines has dinks
207 an ends hiss ink
208 snake dish inns
209 his sen ink sand
210 shade skins inn
211 an sink hid ness
212 desks shin nina
213 an kens is hinds
214 snaked his inns
215 his sins and ken
216 shanks dies inn
217 kind hen sins as
218 hind kiss senna
219 in sink end sash
220 shade sinks inn
221 sad hens skin in
222 shade skin inns
223 in kiss shed nan
224 dashes skin inn
225 an ends hiss kin
226 hind kisses nan
227 an shed sink ins
228 nines skin shad
229 in hens kiss dna
230 sneak dish inns
231 his kin sand sen
232 nan disks shine
233 an desk shin ins
234 nan disk shines
235 an hens kiss din
236 nines sink dash
237 an inns kids hes
238 snakes din shin
239 i ends in shanks
240 hinds sin snake
241 an ness ink dish
242 naked shin sins
243 kind hens sin as
244 hank dines sins
245 in dens is hanks
246 sand shine inks
247 in dens is shank
248 senna kid shins
249 his kens sin dna
250 nine shanks ids
251 an hens skin ids
252 nine kinds sash
253 in inn ask sheds
254 hanks dine sins
255 an hen sins disk
256 shank dine sins
257 an kind hes sins
258 shiksa ends inn
259 an shed skis inn
260 nan hides skins
261 an sen shins kid
262 nines ask hinds
263 i sends in hanks
264 henna disk sins
265 i sends in shank
266 hades skins inn
267 an kin dish ness
268 his an kindness
269 an sheds ink sin
270 deans shin skin
271 an den hiss sink
272 nines sank dish
273 hed sins an skin
274 has skinned sin
275 his skin and sen
276 snakes hid inns
277 kin sins has end
278 nan skids shine
279 kind sin has sen
280 shanks die inns
281 shed skin is nan
282 shanks dine sin
283 an hens sin disk
284 nan hides sinks
285 in sen ski hands
286 shanks dis nine
287 an skin dis hens
288 hades sinks inn
289 an kin sin sheds
290 hades skin inns
291 kin ness is hand
292 shade sink inns
293 kin sen is hands
294 nan skid shines
295 in inn asks shed
296 dashes sink inn
297 his den sins kan
298 nina disks hens
299 in ness has dink
300 nan hissed skin
301 an kens sin dish
302 sash sinned ink
303 an kind hens sis
304 inn shanked sis
305 in inns ask shed
306 kinda shins sen
307 sad hens sink in
308 nines sink shad
309 an hin sins desk
310 danish ken sins
311 an hen sin disks
312 khan dines sins
313 in ink send sash
314 dna shines inks
315 an hen sins skid
316 sash sinned kin
317 an hin kids ness
318 shines sank din
319 an skin diss hen
320 henna disks sin
321 shed inn skin as
322 sin snaked shin
323 in hen sass kind
324 hanks diss nine
325 an hens sink ids
326 shank diss nine
327 in ness ask hind
328 henna skid sins
329 his den skis nan
330 senna hid skins
331 an den shin skis
332 sane hind skins
333 an end hiss inks
334 henna diss skin
335 an hens sin skid
336 sane kinds shin
337 an skins hid sen
338 sins knead shin
339 an sheds ski inn
340 kind nines sash
341 kin shin send as
342 inn ashes dinks
343 kind sen shin as
344 snake din shins
345 nan send his ski
346 shiksa end inns
347 send in has skin
348 nina skids hens
349 hed sins an sink
350 senna hid sinks
351 an skis send hin
352 sane hind sinks
353 his sink and sen
354 danish sen skin
355 shed sink is nan
356 deans shin sink
357 an sins hid kens
358 dink hisses nan
359 an sinks hid sen
360 sine inks hands
361 an shed inks sin
362 senna disk shin
363 in ink sends ash
364 inns sand sheik
365 kan end his sins
366 nan dishes inks
367 kan send his sin
368 hades sink inns
369 an hes sins dink
370 hin ink sadness
371 an sink dis hens
372 inks and shines
373 an hen sin skids
374 henna skids sin
375 his sen disk nan
376 nan hissed sink
377 in sis hand kens
378 naked shins sin
379 kin shins send a
380 hanks dies inns
381 kind sen shins a
382 shank dies inns
383 an sen shin disk
384 sneaks din shin
385 his ins sank den
386 sneak din shins
387 kin shin sends a
388 shades ink inns
389 kind hen sin ass
390 ins shanked sin
391 in dens is khans
392 kan shined sins
393 his ken diss nan
394 sands hikes inn
395 kin sin has ends
396 khans dine sins
397 sad hen skins in
398 hank diss nines
399 an shin diss ken
400 sedan shins ink
401 shed inn skins a
402 sinned skin has
403 an inn disks hes
404 sands hike inns
405 an shed ski inns
406 sedans shin ink
407 in ess ink hands
408 henna diss sink
409 i sends in khans
410 ids skins henna
411 in ken sins shad
412 hinds skies nan
413 in den skin sash
414 kan dishes inns
415 nan end his skis
416 snide sins hank
417 sad hen sinks in
418 sneaks hid inns
419 an sink diss hen
420 shades inks inn
421 an hen skins ids
422 sedan shins kin
423 shed inn sink as
424 nan shined skis
425 in sen ash kinds
426 senna skid shin
427 sad ken shins in
428 ash sinned inks
429 shed inn sinks a
430 inns sank hides
431 shed inns skin a
432 ins snake hinds
433 his ink and ness
434 sedans shin kin
435 an den shins ski
436 danish sen sink
437 his dens ski nan
438 hanks dines sin
439 in sen has dinks
440 shank dines sin
441 in ink ends sash
442 ids sinks henna
443 in hens skin ads
444 kan sinned hiss
445 an dens shin ski
446 inns ashes dink
447 an hen sinks ids
448 dank shine sins
449 send in has sink
450 henna dis skins
451 his sen skid nan
452 khan diss nines
453 sand she skin in
454 khans diss nine
455 an ken shins ids
456 nina sheds inks
457 an sen shin skid
458 shaken din sins
459 his kin and ness
460 henna dis sinks
461 hind ness skin a
462 has skinned ins
463 an skins dis hen
464 ashen kinds sin
465 an ski sends hin
466 nines skins dah
467 his dens sin kan
468 shanks dine ins
469 hed sin an skins
470 inn snaked hiss
471 an inn skids hes
472 kine shin sands
473 an kind sen hiss
474 sin knead shins
475 kin shin ends as
476 side inns hanks
477 in inks send ash
478 heads inks inns
479 nan ends his ski
480 snide sins khan
481 in sen skin shad
482 inns shakes din
483 in kiss and hens
484 sinned sink has
485 in desk hiss nan
486 shanks snide in
487 in hes skins dna
488 nan shied skins
489 his sen inks dna
490 ashes kind inns
491 has ends skin in
492 nines sinks dah
493 in hiss send kan
494 danish ness ink
495 an hes skins din
496 senna dish inks
497 an sinks dis hen
498 sand hikes inns
499 an hin skis ends
500 hind skis senna

### andydalton:people

input: Andy Dalton
category: people
phrases 1 to 77 of 77

1 dandy talon
2 an dandy lot
3 natal noddy
4 not land day
5 any told dna
6 lady tan don
7 dont an lady
8 ant don lady
9 only tan dad
10 nan told day
11 ton land day
12 only tan add
13 any dont lad
14 at add nylon
15 only ant dad
16 nay told dna
17 dna toy land
18 lady and ton
19 land and toy
20 any dont dal
21 on dandy lat
22 on dandy alt
23 no dandy lat
24 no dandy alt
25 only ant add
26 nan dot lady
27 lady tan nod
28 only dna tad
29 ant nod lady
30 nay dot land
31 nay dont lad
32 lay dna dont
33 land any dot
34 nan lot dyad
35 nay tod land
36 any dna dolt
37 yon land tad
38 land any tod
39 nay dont dal
40 only and tad
41 tod nan lady
42 an oddly tan
43 dolt and nay
44 lay and dont
45 any and told
46 nylon at dad
47 told and nay
48 an ant oddly
49 lady and not
50 lady dna ton
51 dan any told
52 dan any dolt
53 dolt and any
54 dolt day nan
55 an dandy tol
56 dan dont lay
57 lady dna not
58 lad and tony
59 only dan tad
60 noddy an lat
61 noddy an alt
62 lady dan ton
63 land dan toy
64 dolt dna nay
65 dal and tony
66 told dan nay
67 lady dan not
68 land tan yod
69 dolt dan nay
70 oddly at nan
71 lad dna tony
72 land ant yod
73 land tad ony
74 dal dna tony
75 lad dan tony
76 dal dan tony
77 tol dyad nan

### jaidaparker:people

input: Jaida Parker
category: people
phrases 1 to 256 of 256

1 raj park idea
2 i jar parked a
3 dak per i jar a
4 idea jar park
5 dark pie jar a
6 dak rep i jar a
7 raja park die
8 dear a kip raj
9 ped i jar ark a
10 jade air park
11 dear kip jar a
12 dak per i raj a
13 kid rape raja
14 red a kip raja
15 i ped a ark raj
16 a jarred pika
17 red pika jar a
18 dak rep i raj a
19 dear kip raja
20 jade a rip ark
21 raja kid pear
22 ajar a kid rep
23 raja read kip
24 i ape dark raj
25 raj read pika
26 kid per ajar a
27 jar read pika
28 pied a jar ark
29 kid reap raja
30 die raj park a
31 raja rid peak
32 die jar park a
33 raj park aide
34 jade a irk rap
35 aide jar park
36 i rap jade ark
37 ajar dark pie
38 ripe a jar dak
39 jade pair ark
40 kid rape jar a
41 dare kip raja
42 jade a irk par
43 raj dare pika
44 pad jerk air a
45 parka die raj
46 i par jade ark
47 aid jerk para
48 kip a read raj
49 pika jar dare
50 kid pear jar a
51 die jar parka
52 read kip jar a
53 pad jerk aria
54 aid jerk rap a
55 raid peak raj
56 peak a rid raj
57 raid peak jar
58 rid peak jar a
59 dark pie raja
60 dare kip jar a
61 ajar dear kip
62 aid jerk par a
63 kid pare raja
64 kid rape raj a
65 ajar red pika
66 kid per raja a
67 pia jar drake
68 i rake raj pad
69 ajar rape kid
70 red kip ajar a
71 dear pika raj
72 i jar rake pad
73 dear pika jar
74 i jerk ara pad
75 aid perk raja
76 i peak raj rad
77 dip rake raja
78 i jar peak rad
79 dirk ape raja
80 aid perk jar a
81 paid rake raj
82 dip rake jar a
83 paid rake jar
84 dark ape jar i
85 paid jerk ara
86 a raj kid pear
87 red pika raja
88 a raja kid rep
89 jade rip arak
90 i rape raj dak
91 raja rap dike
92 dark pea jar i
93 die ajar park
94 kid reap raj a
95 ajar pear kid
96 i jar rape dak
97 ajar kip read
98 kid reap jar a
99 ajar kid reap
100 dike raj rap a
101 para dike raj
102 dike jar rap a
103 ajar peak rid
104 dare kip raj a
105 dike jar para
106 dike raj par a
107 raja par dike
108 dike jar par a
109 raj raked pia
110 kid pare raj a
111 jar raked pia
112 kid pare jar a
113 ajar kip dare
114 drip kea jar a
115 raja drip kea
116 ajar dak per i
117 pied ajar ark
118 i jar pear dak
119 jade irk para
120 i reap raj dak
121 parked raja i
122 jar i reap dak
123 ajar kid pare
124 dark pie raj a
125 arid peak raj
126 aid perk raj a
127 arid peak jar
128 dip rake raj a
129 pied raja ark
130 dirk ape raj a
131 ajar ripe dak
132 dirk ape jar a
133 ajar perk aid
134 dip jerk ara a
135 ajar rake dip
136 rad jerk pia a
137 rapid kea raj
138 dirk pea jar a
139 ajar ape dirk
140 rad pike jar a
141 rapid kea jar
142 i pare raj dak
143 ajar pea dirk
144 jar i pare dak
145 ajar pike rad
146 red pika raj a
147 ripe raja dak
148 dak pier jar a
149 pied raj arak
150 a raj drip kea
151 pied jar arak
152 dak peri jar a
153 ajar pier dak
154 pied raj ark a
155 ajar kea drip
156 jake i rap rad
157 ajar peri dak
158 kapa i jar red
159 dike ajar rap
160 ripe a raj dak
161 dike ajar par
162 jake i par rad
163 drake pia raj
164 parked a raj i
165 i jarred kapa
166 jake a rip rad
167 dirk pea raja
168 i kapa red raj
169 rad pike raja
170 dap jerk air a
171 aida rap jerk
172 dap i rake raj
173 ajar parked i
174 dap i jar rake
175 raid jake rap
176 dap i jerk ara
177 dak pier raja
178 ped i jar arak
179 aida par jerk
180 dark pea raj i
181 rad jake pair
182 pard i jar kea
183 der ajar pika
184 dak per i raja
185 raid jake par
186 der pika jar a
187 jade rai park
188 kae a drip raj
189 dak peri raja
190 rid jake rap a
191 jade ria park
192 pad jerk rai a
193 dap jerk aria
194 pad jerk ria a
195 jade kira rap
196 i ped ajar ark
197 aida jar perk
198 rid jake par a
199 aid jake parr
200 dirk pea raj a
201 ride jar kapa
202 rad pike raj a
203 dire raj kapa
204 jade kir rap a
205 kae ajar drip
206 dak pier raj a
207 arid jake rap
208 jade kir par a
209 dire jar kapa
210 der kip ajar a
211 rid jake para
212 drip kae jar a
213 jade kira par
214 dak peri raj a
215 drip jake ara
216 i ajar rep dak
217 arid jake par
218 der kip raja a
219 jade raki rap
220 ped irk ajar a
221 jade pari ark
222 ped irk raja a
223 ride raj kapa
224 ped kira jar a
225 jade raki par
226 i ped ark raja
227 rapid kae raj
228 rai dap jerk a
229 rapid kae jar
230 ria dap jerk a
231 jade kir para
232 ped kir ajar a
233 drip kae raja
234 ped raki jar a
235 pard jake air
236 i ped arak raj
237 der pika raja
238 i pard raj kea
239 aida raj perk
240 i jar kae pard
241 ped kira raja
242 der pika raj a
243 rad jake pari
244 i kapa der raj
245 ped raki raja
246 dak pear raj i
247 ajar kira ped
248 i kae pard raj
249 ajar raki ped
250 der i jar kapa
251 pard jake rai
252 ped kira raj a
253 pard jake ria
254 dak rep i raja
255 ped raki raj a
256 ped kir raja a

### jacksmith:people

input: Jack Smith
category: people
phrases 1 to 7 of 7

1 jams thick
2 chi tsk jam
3 jam shtick
4 mic tsk haj
5 jam kitsch
6 ich tsk jam
7 hic tsk jam
