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

## File 81 of 95: 2623 phrases

### miketyson:people

input: Mike Tyson
category: people
phrases 1 to 274 of 274

1 its monkey
2 my on kites
3 i ok my sent
4 tiny smoke
5 my no kites
6 my ok in set
7 it monkeys
8 my one kits
9 my ok is ten
10 stony mike
11 my ok stein
12 i tsk my one
13 monkey sit
14 my one skit
15 i ok my nest
16 monkey tis
17 its key mon
18 me sky to in
19 misty keno
20 my kin toes
21 i ok my tens
22 money kits
23 i tsk money
24 my ok is net
25 yon kismet
26 it keys mon
27 i ok my nets
28 smoky tine
29 on sky time
30 is to my ken
31 money skit
32 time sky no
33 i sky to men
34 inky tomes
35 is my token
36 it ok my sen
37 yoke mints
38 most in key
39 i net my kos
40 mosey knit
41 i sky monte
42 i met on sky
43 yeti monks
44 me skin toy
45 i tsk my eon
46 moneys kit
47 my neo kits
48 i to my kens
49 enmity kos
50 mink to yes
51 met i sky no
52 smokey tin
53 my neo skit
54 me it sky no
55 mikes tony
56 it sky omen
57 me in ok sty
58 smokey nit
59 me sink toy
60 me i sky ton
61 smoky nite
62 my in stoke
63 my ten kos i
64 kites mony
65 yet is monk
66 men i ok sty
67 kismet ony
68 me ink toys
69 i so my kent
70 smote inky
71 it sky nome
72 it so my ken
73 me toys kin
74 i tsk my neo
75 it key mons
76 me i sky not
77 kite my son
78 me it sky on
79 my kit ones
80 me i tsk yon
81 yes mint ok
82 ken i my sot
83 my kit nose
84 me i tsk ony
85 on sky item
86 item sky no
87 my skin toe
88 my ski note
89 so mint key
90 on mist key
91 mine ok sty
92 yet on skim
93 key mist no
94 me knit soy
95 yet skim no
96 yes ink tom
97 nim to keys
98 my oink set
99 yes kit mon
100 my sink toe
101 my ski tone
102 me inks toy
103 sit my keno
104 key sit mon
105 my ink toes
106 me into sky
107 my kino set
108 in sky tome
109 key in toms
110 not key mis
111 sky to mine
112 on sky mite
113 on emit sky
114 mite sky no
115 no emit sky
116 skim to yen
117 sky to mien
118 key sin tom
119 me oink sty
120 tyke is mon
121 in sky mote
122 my sin toke
123 not key ism
124 yet ski mon
125 tie sky mon
126 my kit eons
127 keys in tom
128 men ski toy
129 kin tom yes
130 kite my nos
131 ok tiny ems
132 my kit sone
133 yen mist ok
134 my tis keno
135 men kit soy
136 sky met ion
137 my inks toe
138 on sty mike
139 no sty mike
140 yes ink mot
141 yin ok stem
142 my tokens i
143 soy met ink
144 yen ski tom
145 my ins toke
146 yet ink som
147 my kits eon
148 yet kin som
149 yet ink mos
150 yon met ski
151 yet kin mos
152 my skit eon
153 key sin mot
154 key tis mon
155 key tin som
156 nim sky toe
157 key tin mos
158 my kos tine
159 key ins tom
160 my sot kine
161 mis toy ken
162 keys in mot
163 ems ink toy
164 kin mot yes
165 kin toy ems
166 yen kit som
167 mis ok tyne
168 kos met yin
169 in som tyke
170 yen kit mos
171 ism toy ken
172 on mis tyke
173 in mos tyke
174 no mis tyke
175 mien ok sty
176 yen ski mot
177 ism ok tyne
178 key mis ton
179 yon kit ems
180 on ism tyke
181 no ism tyke
182 tim on keys
183 i smoky ten
184 key ism ton
185 met kin soy
186 key ins mot
187 koi my sent
188 key nim sot
189 key nit som
190 my its keno
191 i smoky net
192 key nit mos
193 inky to ems
194 inky so met
195 me kits yon
196 me ski tony
197 koi my nest
198 me tiny kos
199 my knot sei
200 koi my tens
201 it keys nom
202 nom its key
203 koi my nets
204 iot my kens
205 me kit nosy
206 keys tim no
207 sim on tyke
208 ons my kite
209 one tim sky
210 yon skit me
211 yom its ken
212 tye on skim
213 sim not key
214 tye skim no
215 tye is monk
216 my tins oke
217 key tim son
218 me inky sot
219 yes it monk
220 yom kin set
221 my nits oke
222 my kos nite
223 me tsk yoni
224 men iot sky
225 mink so yet
226 me tion sky
227 me kits ony
228 i tye monks
229 kent is yom
230 men itsy ok
231 yes kit nom
232 key sit nom
233 key tis nom
234 ten ski yom
235 tyke sim no
236 yens tim ok
237 key tim nos
238 key sim ton
239 tyke is nom
240 yet i monks
241 it yom kens
242 ken sit yom
243 ken tim soy
244 tye ski mon
245 yet ski nom
246 neo tim sky
247 tie sky nom
248 tye kin som
249 net ski yom
250 me ony skit
251 ken sim toy
252 set ink yom
253 tye kin mos
254 eon tim sky
255 tyne sim ok
256 men koi sty
257 so tye mink
258 isnt my oke
259 tye ink som
260 yen tim kos
261 tyke nim so
262 me kino sty
263 tye ink mos
264 sen kit yom
265 met ski ony
266 syne tim ok
267 ems kit ony
268 tyke i mons
269 ken tis yom
270 yet nim kos
271 key tim ons
272 oke nim sty
273 tye nim kos
274 nom tye ski

### ericvillency:people

input: Eric Villency
category: people
phrases 1 to 117 of 117

1 in liver cycle
2 in cry ive cell
3 i cry cel in lev
4 in circle levy
5 in cry vie cell
6 i cel in ley vcr
7 clive cry line
8 in vice cry ell
9 i cel in lye vcr
10 ever ill cynic
11 in vcr yell ice
12 live cry cline
13 icy cell rev in
14 nicely lie vcr
15 in lice cry lev
16 cline cry evil
17 i cry cell vein
18 clever icy lin
19 i cry cell vine
20 nice lyric lev
21 ill vcr ice yen
22 clive cry lien
23 i nelly ice vcr
24 in cleric levy
25 nice vcr yell i
26 cry liven lice
27 i cry lev cline
28 nicer cell ivy
29 lin i cycle rev
30 cline cry veil
31 nil i cycle rev
32 clever icy nil
33 cynic i rev ell
34 yin circle lev
35 lin ice cry lev
36 ill veer cynic
37 ill icy nee vcr
38 ley rev clinic
39 nil ice cry lev
40 lye rev clinic
41 lee icy vcr lin
42 cicely rev lin
43 yin ice vcr ell
44 vile cry cline
45 lin ice vcr ley
46 cicely rev nil
47 lin ice vcr lye
48 vier cycle lin
49 lee icy vcr nil
50 cynic rile lev
51 in lice vcr ley
52 civic yell ern
53 in lice vcr lye
54 vier cycle nil
55 rin i cycle lev
56 cecil very lin
57 nil ice vcr ley
58 rin live cycle
59 cel in vile cry
60 vier ell cynic
61 nil ice vcr lye
62 cecil very nil
63 cel i liven cry
64 lier lev cynic
65 cine i yell vcr
66 rin evil cycle
67 in ivy rec cell
68 lene civil cry
69 in evil cel cry
70 niece vcr lily
71 icy eel vcr lin
72 rin vile cycle
73 in veil cel cry
74 clinic lev rye
75 in live cel cry
76 nellie icy vcr
77 icy eel vcr nil
78 rin veil cycle
79 vcr cee ill yin
80 cynic lire lev
81 in lily vcr cee
82 yin cleric lev
83 cee vill in cry
84 cine lyric lev
85 lev rec icy lin
86 niece cry vill
87 rev cel icy lin
88 levin lice cry
89 lev rec icy nil
90 vinyl rice cel
91 lin ive cel cry
92 vein cel lyric
93 rev cel icy nil
94 vine cel lyric
95 lin vie cel cry
96 yin vill recce
97 yin lie cel vcr
98 ricin cel levy
99 i cry cel levin
100 cicely rin lev
101 nil ive cel cry
102 nicely vcr lei
103 nil vie cel cry
104 vinyl lice rec
105 i rec cel vinyl
106 rin cecil levy
107 cline vcr ley i
108 vinyl eric cel
109 cel rin icy lev
110 cynic vill ere
111 cline vcr lye i
112 cynic vill ree
113 lin i lycee vcr
114 yin lei cel vcr
115 nil i lycee vcr
116 lin ivy cel rec
117 nil ivy cel rec

### jonhusted:people

input: Jon Husted
category: people
phrases 1 to 118 of 118

1 just honed
2 she jut don
3 thud jones
4 just do hen
5 hounds jet
6 he just don
7 hound jets
8 oh just end
9 hound jest
10 she jot dun
11 duets john
12 she jut nod
13 duet johns
14 hun do jets
15 thuds jeon
16 on jut shed
17 tuned josh
18 he jut dons
19 hosted jun
20 he jut nods
21 shed jut no
22 on jets hud
23 hun do jest
24 hud jets no
25 hed just no
26 on jest hud
27 hes jut don
28 hud jest no
29 oh just den
30 he just nod
31 hud jet son
32 jut do hens
33 hed jut son
34 hed jot sun
35 hod jet sun
36 jus the don
37 hos jut end
38 sod jet hun
39 do jet huns
40 dos jet hun
41 dun jet hos
42 hud jet nos
43 hed jot uns
44 ods jet hun
45 do jet shun
46 hen jut sod
47 on jets duh
48 hod jet uns
49 hes jut nod
50 hen jut dos
51 hed jut nos
52 hos jut den
53 on jest duh
54 duh jet son
55 sen jot hud
56 jun the sod
57 dun jets oh
58 jun the dos
59 hen jut ods
60 dun jest oh
61 sen jut hod
62 duh jets no
63 dun hes jot
64 jus the nod
65 jun to shed
66 jun the ods
67 jus hot end
68 duh jest no
69 hed just on
70 she dot jun
71 he dots jun
72 he dont jus
73 jus het don
74 duh jet nos
75 he dost jun
76 jus hot den
77 ends oh jut
78 do then jus
79 ted john us
80 send oh jut
81 she jun tod
82 jus ten hod
83 dens oh jut
84 jun het sod
85 jun het dos
86 jus het nod
87 jus not hed
88 tod hes jun
89 jus nth doe
90 jun het ods
91 dun jet sho
92 hod set jun
93 duh sen jot
94 tod hen jus
95 end sho jut
96 jus nth ode
97 dot hes jun
98 end tho jus
99 hed jus ton
100 hod net jus
101 den sho jut
102 hud jet ons
103 dot hen jus
104 hed jut ons
105 hed jun sot
106 dent oh jus
107 ted hos jun
108 den tho jus
109 don eth jus
110 tend oh jus
111 ted hon jus
112 ted sho jun
113 duh jet ons
114 ted noh jus
115 sod eth jun
116 dos eth jun
117 nod eth jus
118 ods eth jun

### thechroniclesofnarnia:titles

input: The Chronicles of Narnia
category: titles
phrases 1 to 500 of 500

1 financiers anchor hotel
2 her hole can infractions
3 his on a ranch reflection
4 afternoons learn chichi
5 her chili can afternoons
6 his no a ranch reflection
7 inflection anchor share
8 her holes can infraction
9 her loch to an financiers
10 anchors hear inflection
11 her holes can infarction
12 an on rich has reflection
13 fornication ranch heels
14 the on choral financiers
15 an no rich has reflection
16 infraction anchor heels
17 the no choral financiers
18 her on car has inflection
19 nonfiction crash healer
20 her real cash nonfiction
21 her on a crash inflection
22 lecher horn fascination
23 her are clash nonfiction
24 her no car has inflection
25 infarction anchor heels
26 her a anchors inflection
27 her no a crash inflection
28 chalet honor financiers
29 her as anchor inflection
30 her on cloth financiers a
31 afternoons chair lichen
32 her clone has infraction
33 her no cloth financiers a
34 harsh cereal nonfiction
35 in anchor has reflection
36 his no arch an reflection
37 henceforth ironic nasal
38 her silicon father canon
39 his other corn can finale
40 nonfiction clear rehash
41 her clone has infarction
42 his no char an reflection
43 inflection corners haha
44 has her clear nonfiction
45 an on rich ash reflection
46 anchor hears inflection
47 her horn confiscate nail
48 an no rich ash reflection
49 infractions anchor heel
50 her ash clear nonfiction
51 his rho can an reflection
52 archer leash nonfiction
53 her car leash nonfiction
54 i con an harsh reflection
55 lancer honor chieftains
56 his nacho ran reflection
57 her on as arch inflection
58 ashore ranch inflection
59 her earl cash nonfiction
60 her no as arch inflection
61 infraction ranches hole
62 her car heals nonfiction
63 her on loch financiers at
64 rich hosanna reflection
65 her chaos ran inflection
66 her no loch financiers at
67 infarction ranches hole
68 her hole scan infraction
69 her in clone cart fashion
70 archer heals nonfiction
71 her acorn has inflection
72 her confiscate lin horn a
73 archers heal nonfiction
74 her lash care nonfiction
75 henceforth is an in carol
76 chieftains anchor loner
77 the cola horn financiers
78 her on car ash inflection
79 health croon financiers
80 her cars heal nonfiction
81 her on arc has inflection
82 financiers alert honcho
83 her nacho lot financiers
84 her no car ash inflection
85 financiers learnt hooch
86 the lac honor financiers
87 her no arc has inflection
88 infraction anchors heel
89 her las reach nonfiction
90 her on as char inflection
91 confiscate inhaler horn
92 her hole scan infarction
93 her no as char inflection
94 lions chacha interferon
95 her hole cans infraction
96 an rich a nosh reflection
97 archers hale nonfiction
98 her hole cans infarction
99 henceforth is an in coral
100 infarction anchors heel
101 on here clash infraction
102 her confiscate nil horn a
103 archer hales nonfiction
104 her loan arch infections
105 his iron techno clean far
106 henceforth anal incisor
107 her clan shoe infraction
108 an in rho cash reflection
109 crasher heal nonfiction
110 the halo corn financiers
111 her on col ran chieftains
112 chichi renal afternoons
113 an hero financiers cloth
114 an roc has her inflection
115 harsh nail confectioner
116 an hole torch financiers
117 her no col ran chieftains
118 henceforth cranial sion
119 her corn loan chieftains
120 henceforth coal an in sir
121 financiers alter honcho
122 on here clash infarction
123 her on col hat financiers
124 loach throne financiers
125 on crash hear inflection
126 her no col hat financiers
127 inflection anchor shear
128 her nan color chieftains
129 i can on harsh reflection
130 inflection anchors hare
131 her clan shoe infarction
132 i can no harsh reflection
133 colon financiers hearth
134 no crash hear inflection
135 henceforth soil an in car
136 henceforth cranial ions
137 her car hales nonfiction
138 her hot no financiers lac
139 inflection anchor hares
140 on archer has inflection
141 her nth a cool financiers
142 nonfiction arch healers
143 her cars hale nonfiction
144 i nosh an arch reflection
145 infraction rehash clone
146 her colon ran chieftains
147 i has horn can reflection
148 anchor enrol chieftains
149 no archer has inflection
150 an in hos arch reflection
151 crasher hale nonfiction
152 her con heal infractions
153 i can henceforth solar in
154 infarction rehash clone
155 her scar heal nonfiction
156 henceforth is an in claro
157 financiers another loch
158 her lacs hear nonfiction
159 an in roc hash reflection
160 loins chacha interferon
161 his nan roach reflection
162 his nine roach clean fort
163 chic inhaler afternoons
164 her ale crash nonfiction
165 an in hat reinforces loch
166 nonfiction char healers
167 on horn clear chieftains
168 onion til her each francs
169 inflection anchors rhea
170 henceforth is an clarion
171 his iron techno lance far
172 clearer hash nonfiction
173 her loan char infections
174 an on halt reinforces chi
175 infractions leach heron
176 infraction clash her one
177 an thin a reinforces loch
178 infraction leach senhor
179 her lea crash nonfiction
180 an no halt reinforces chi
181 hooch financiers antler
182 her colon hat financiers
183 i has on ranch reflection
184 clearer shah nonfiction
185 her lash race nonfiction
186 henceforth oil an in cars
187 infarction leach senhor
188 her sale arch nonfiction
189 i has no ranch reflection
190 chicano lash interferon
191 her lear cash nonfiction
192 his electron fair an chon
193 corneal horn chieftains
194 her clan hose infraction
195 an in hos char reflection
196 hornet financiers loach
197 on cloth hear financiers
198 her fine lions rat concha
199 rash echelon infraction
200 no cloth hear financiers
201 an harsh note circle info
202 hoarse ranch inflection
203 on rash chain reflection
204 her on ash arc inflection
205 harsh confectioner lain
206 infarction clash her one
207 her no ash arc inflection
208 infraction leach herons
209 an lion reinforces hatch
210 i can henceforth on liars
211 acorn rehash inflection
212 her seal arch nonfiction
213 i can henceforth no liars
214 rash echelon infarction
215 her ear clash nonfiction
216 henceforth oils an in car
217 financiers later honcho
218 her als reach nonfiction
219 i reinforces an halt chon
220 interferon hails concha
221 her horn confiscate anil
222 i loan henceforth can sir
223 harsh cornea inflection
224 her clan hose infarction
225 i can henceforth on rails
226 infarction leach herons
227 her con leash infraction
228 an harsh tone circle info
229 chon financiers rathole
230 her loach ran infections
231 i can henceforth no rails
232 harsh anil confectioner
233 her lac share nonfiction
234 henceforth oil an in scar
235 harsher lace nonfiction
236 her clone ash infraction
237 i is henceforth carnal no
238 choral sheen infraction
239 her scorn aah inflection
240 an richest ono flinch are
241 choral sheen infarction
242 in ash anchor reflection
243 his nine roach lance fort
244 conical hash interferon
245 her hen coal infractions
246 her lin confiscate an rho
247 conical shah interferon
248 her con hale infractions
249 i can henceforth on liras
250 financiers rental hooch
251 her con leash infarction
252 i canal henceforth on sir
253 heh corneal infractions
254 an here loch infractions
255 her far cohesion tin clan
256 financials ochre throne
257 her cons heal infraction
258 i can henceforth no liras
259 infections rancher halo
260 her hale scar nonfiction
261 i canal henceforth no sir
262 infractions cholera hen
263 her on leach infractions
264 i nails henceforth on car
265 afternoons charlie chin
266 an loan reinforces hitch
267 the rho financiers an col
268 afternoons charlie inch
269 her clone ash infarction
270 i nails henceforth no car
271 nonfiction archer shale
272 infractions leach her no
273 henceforth rail an in cos
274 infraction cholera hens
275 iron hash can reflection
276 his nether in falcon orca
277 infarction cholera hens
278 her sale char nonfiction
279 her fine loins rat concha
280 alec harsher nonfiction
281 financiers coal the horn
282 the on rho financiers lac
283 financials coherent rho
284 his anon arch reflection
285 an on loch err chieftains
286 fornication cleaner shh
287 her con heals infraction
288 the no rho financiers lac
289 interferon chains loach
290 an hail reinforces notch
291 an no loch err chieftains
292 financials ochre hornet
293 her era clash nonfiction
294 her fine lions tar concha
295 financials hector heron
296 her hens coal infraction
297 i loans henceforth in car
298 infractions healer chon
299 her cons heal infarction
300 an roc ash her inflection
301 chieftains rancher loon
302 her rash lace nonfiction
303 i rail henceforth can son
304 inflection ranchers hao
305 her roan cash inflection
306 her lost rho finance cain
307 fornication larch sheen
308 her seal char nonfiction
309 his on arch an reflection
310 nonfiction larch hearse
311 reflection cash an rhino
312 i loan henceforth in cars
313 chieftains cholera norn
314 an lech horse infraction
315 her a so ranch inflection
316 infraction healers chon
317 iron shah can reflection
318 an fine slant choir chore
319 financials echo norther
320 her clan hoot financiers
321 i snail henceforth on car
322 infarction healers chon
323 her con heals infarction
324 henceforth soil an in arc
325 rancho hears inflection
326 her hens coal infarction
327 i snail henceforth no car
328 infractions chela heron
329 on lecher has infraction
330 her hos arc an inflection
331 infraction chela senhor
332 her corns aah inflection
333 her nil confiscate an rho
334 fertiliser canna honcho
335 an harsh coin reflection
336 i horn ash can reflection
337 interferon cochin salah
338 no lecher has infraction
339 i soil henceforth ran can
340 infarction chela senhor
341 fertiliser can an honcho
342 i nail henceforth on cars
343 financiers rancho hotel
344 an lech horse infarction
345 inflection con her rash a
346 infraction chela herons
347 her cool than financiers
348 an lion henceforth is car
349 inflection rancho share
350 her leash arc nonfiction
351 an harsh cleric note info
352 infarction chela herons
353 her clan hoe infractions
354 irons canal into her chef
355 fornication lancers heh
356 henceforth coins an liar
357 i nail henceforth no cars
358 infraction rancho heels
359 hers roach an inflection
360 i horns chance for entail
361 infarction rancho heels
362 here car lash nonfiction
363 his on char an reflection
364 henceforth cannolis air
365 the chon financiers oral
366 henceforth is an iron lac
367 rancho enrol chieftains
368 her clan hoes infraction
369 on financiers her hot lac
370 infractions rancho heel
371 her norn confiscate hail
372 i nails henceforth corn a
373 financials chore throne
374 her cons hale infraction
375 henceforth sic an on liar
376 infraction hansel chore
377 on lecher has infarction
378 henceforth sic an no liar
379 henceforth alan incisor
380 her on chela infractions
381 i ash on ranch reflection
382 chieftains rancho loner
383 her shale con infraction
384 her fine loins tar concha
385 infarction hansel chore
386 no lecher has infarction
387 fitch clears an one rhino
388 financiers hath coronel
389 on larch hear infections
390 i ash no ranch reflection
391 infractions rah echelon
392 her no chela infractions
393 i scan henceforth on liar
394 henceforth aircon nails
395 on loch financiers heart
396 i scan henceforth no liar
397 financiers hatcher loon
398 no larch hear infections
399 his a horn can reflection
400 afternoons ahi clincher
401 an rich chile afternoons
402 her loch not financiers a
403 infraction ranches helo
404 an halt reinforces chino
405 her cash or an inflection
406 nonfiction reacher lash
407 on hotel arch financiers
408 i loan henceforth in scar
409 inflection arch senhora
410 on hole chart financiers
411 an harsh cleric tone info
412 infarction ranches helo
413 no loch financiers heart
414 henceforth sail an in roc
415 infraction hansel ochre
416 not financiers her loach
417 her clan or on chieftains
418 henceforth cannoli sari
419 the loch financiers roan
420 her clan or no chieftains
421 inflection rancho shear
422 once lash her infraction
423 henceforth oil an in arcs
424 infarction hansel ochre
425 inflection crash an hero
426 an ochre slant choir fine
427 financials chore hornet
428 no hotel arch financiers
429 i cans henceforth on liar
430 inflection rancho hares
431 her chon seal infraction
432 i air henceforth on clans
433 henceforth cannoli airs
434 her clan hoes infarction
435 i iron henceforth can las
436 inflection char senhora
437 her cons hale infarction
438 i cans henceforth no liar
439 inflection ranches hora
440 her coon halt financiers
441 i air henceforth no clans
442 henceforth aircon slain
443 on rash reach inflection
444 i nail henceforth on scar
445 henceforth aircon snail
446 an other loch financiers
447 an finer chi horn lactose
448 inflection narco rehash
449 an loch sheer infraction
450 an sir henceforth in cola
451 infraction senhora lech
452 on role ranch chieftains
453 i rain henceforth can sol
454 henceforth carina lions
455 her con hales infraction
456 i is henceforth carol nan
457 financials hooch renter
458 her shale con infarction
459 he financiers to on larch
460 infarction senhora lech
461 no role ranch chieftains
462 i nail henceforth no scar
463 henceforth narc liaison
464 her hen coals infraction
465 on liar henceforth is can
466 financiers loaner hotch
467 her cone lash infraction
468 i ran henceforth in coals
469 henceforth nala incisor
470 her lac hears nonfiction
471 no to he financiers larch
472 henceforth carina loins
473 her acorn ash inflection
474 henceforth can liar is no
475 financiers loach nother
476 her arc heals nonfiction
477 the loch or an financiers
478 financiers anther cholo
479 on halt reinforces china
480 henceforth oils an in arc
481 nother financials chore
482 on heel crash infraction
483 i reinforces an nth loach
484 nonfiction archer selah
485 once lash her infarction
486 so can henceforth in liar
487 nother financials ochre
488 her chon seal infarction
489 i corn henceforth slain a
490 reinforces cannoli hath
491 no heel crash infraction
492 i snail henceforth corn a
493 henceforth cannolis rai
494 shorn a chain reflection
495 henceforth arc an in silo
496 henceforth cannolis ria
497 an loch sheer infarction
498 an liar henceforth in cos
499 her lone cash infraction
500 i oils henceforth ran can

### marleematlin:people

input: Marlee Matlin
category: people
phrases 1 to 500 of 500

1 terminal male
2 an tame miller
3 me tell an amir
4 me term an ill a
5 terminal meal
6 me tell marina
7 me tell an rami
8 i met an all rem
9 mineral metal
10 me man literal
11 an are met mill
12 me term all in a
13 terminal lame
14 mine let alarm
15 all arm meet in
16 me tell a arm in
17 maternal mile
18 an taller mime
19 me till an mare
20 an ill rem met a
21 mental mailer
22 me remain tall
23 i meter an mall
24 me tell a ram in
25 marine mallet
26 me tell airman
27 an arm let mile
28 i arm a tell men
29 maternal lime
30 me learnt mail
31 me melt an liar
32 me tell a mar in
33 remain mallet
34 miller mean at
35 me rate an mill
36 i ram a tell men
37 lamer ailment
38 mine tell mara
39 me tear an mill
40 i tell rem man a
41 mitral enamel
42 an literal mem
43 i melt an realm
44 i mar a tell men
45 mill maneater
46 me mail rental
47 me tire an mall
48 me let i ran lam
49 ailment realm
50 miller meant a
51 all ram meet in
52 me rim all ten a
53 merlin tamale
54 miller name at
55 an arm meet ill
56 me met a ran ill
57 mailer mantle
58 all mean timer
59 in mall met are
60 i ran a tell mem
61 airmen mallet
62 men tell maria
63 all a merit men
64 i man a term ell
65 mailer lament
66 all mean merit
67 miller met an a
68 me net all rim a
69 mailer mantel
70 me mantle liar
71 an arm let lime
72 me rat i man ell
73 i mantle realm
74 an ram let mile
75 rim me tell an a
76 all name timer
77 mean a tell rim
78 me tar i man ell
79 all met marine
80 me alert an mil
81 in rem met all a
82 all name merit
83 me ran all time
84 i ran a melt elm
85 me rain mallet
86 me melt an rail
87 lin let me arm a
88 later man mile
89 me ream an till
90 me i tell an arm
91 me retain mall
92 ill are met man
93 mil let me ran a
94 me lament liar
95 an mem till are
96 all a i term men
97 miller eat man
98 an at mill mere
99 me arm i tan ell
100 i lament realm
101 an male let rim
102 an rem me till a
103 an team miller
104 an a mill metre
105 i rent elm lam a
106 me alarm inlet
107 mere a man till
108 me mat i ran ell
109 mill meant are
110 me trail an elm
111 me ran a til elm
112 are man millet
113 all men met air
114 me arm ell tin a
115 mine malt real
116 me melt an lair
117 lin let me ram a
118 mean tell amir
119 in meal let arm
120 me i tell an ram
121 me learnt lima
122 me man til real
123 elm let a arm in
124 me mantle rail
125 i mean all term
126 nil let me arm a
127 mine tell maar
128 an meal let rim
129 i let an elm arm
130 merlin metal a
131 all mar meet in
132 me ram i tan ell
133 me mail antler
134 an real met mil
135 me ram ell tin a
136 it rename mall
137 all mare met in
138 lin let me mar a
139 mine rate mall
140 an ell arm time
141 me i tell an mar
142 mine tear mall
143 me mire an tall
144 elm let a ram in
145 name tell amir
146 an ram meet ill
147 nil let me ram a
148 time near mall
149 me melt an lira
150 ill net me arm a
151 tea man miller
152 it lam an merle
153 erm me till an a
154 an mate miller
155 an all rem time
156 in arm a met ell
157 mailer man let
158 i name all term
159 i let an elm ram
160 me mantle lair
161 me alter an mil
162 me mar i tan ell
163 all mean remit
164 an are melt mil
165 i lam a melt ern
166 all team miner
167 an ram let lime
168 an a me trim ell
169 main all meter
170 an mar let mile
171 me mar ell tin a
172 an meat miller
173 i man all meter
174 me tan a rim ell
175 line met alarm
176 an mem tell air
177 elm let a mar in
178 me lam latrine
179 an rem let mail
180 nil let me mar a
181 me lament rail
182 in arm lame let
183 an ell i met arm
184 time learn lam
185 mean a term ill
186 an rem i let lam
187 mean tell rami
188 in a meter mall
189 ill net me ram a
190 me mantle lira
191 it man all mere
192 in ram a met ell
193 all mean mitre
194 i malt an merle
195 me lam ern til a
196 all name remit
197 me mint all are
198 i let an elm mar
199 mine alert lam
200 me lam an liter
201 rim elm let an a
202 ate man miller
203 an arm melt lie
204 i ran all met me
205 me lament lair
206 all a remit men
207 an a rem let mil
208 me rail mantel
209 all rem team in
210 an ell i met ram
211 all met airmen
212 me malt an lire
213 ill men me rat a
214 mean later mil
215 in a melt realm
216 an at me rim ell
217 mile alert man
218 me lam an litre
219 ill net me mar a
220 all mean miter
221 ill a term name
222 all a i rent mem
223 me lam retinal
224 all meet an rim
225 ill ten me arm a
226 name tell rami
227 an ear met mill
228 in mar a met ell
229 all meant emir
230 in meal let ram
231 an rem me itll a
232 all mate miner
233 me man all tire
234 me it arm an ell
235 all name mitre
236 ill a meter man
237 in ell me arm at
238 time earn mall
239 an rem tell aim
240 erm i let an lam
241 let remain lam
242 all are met nim
243 an ell i met mar
244 me lament lira
245 an ell ram time
246 all a me tin rem
247 till mean mare
248 an mem let liar
249 ill ten me ram a
250 all merit amen
251 me tell in mara
252 an a ell met rim
253 imam learn let
254 an mar meet ill
255 ill men me tar a
256 later name mil
257 all a miter men
258 an ill a met erm
259 all name miter
260 mine term all a
261 in ell me tram a
262 mean real milt
263 i man all metre
264 me it ram an ell
265 main all metre
266 me met all rain
267 i met an all erm
268 liar metal men
269 an mare met ill
270 in ell me ram at
271 all enter imam
272 an mar let lime
273 in rem let lam a
274 all meant mire
275 real lam met in
276 me i tram an ell
277 line metal arm
278 mean rem till a
279 ill ten me mar a
280 liar mean melt
281 all men arm tie
282 erm me itll an a
283 till name mare
284 all rem mate in
285 me it mar an ell
286 miller tae man
287 an mare let mil
288 in ell me mar at
289 mill mean rate
290 an lam let emir
291 i tell a man erm
292 mill mean tear
293 an era met mill
294 an mem i rat ell
295 mail alert men
296 in ram lame let
297 lit elm me ran a
298 near tell imam
299 all at mire men
300 me i rat all men
301 liner let mama
302 all ream met in
303 an ell i mat rem
304 mall meet rain
305 an lam term lie
306 an a rem til elm
307 men trail meal
308 all met an emir
309 me i arm all ten
310 real name milt
311 all mere mat in
312 ill rem me tan a
313 mine alter lam
314 an ram melt lie
315 erm all a met in
316 trial lame men
317 in are lam melt
318 an mem i tar ell
319 merlin lame at
320 mill meter an a
321 me i ram all ten
322 mine malt earl
323 main rem tell a
324 me all in at rem
325 mile alter man
326 me tell ain arm
327 me i tar all men
328 lire metal man
329 mere at man ill
330 i net me arm all
331 animal let rem
332 me man til earl
333 erm i mat an ell
334 me inter llama
335 i man real melt
336 erm a til an elm
337 marine lam let
338 ill metre man a
339 ill ern me mat a
340 liar name melt
341 an elm met liar
342 mir me tell an a
343 main real melt
344 in meal let mar
345 me i mar all ten
346 tire mean mall
347 me man all rite
348 in mem ell rat a
349 rein tell mama
350 an earl met mil
351 lit ern me lam a
352 lime alert man
353 an rem team ill
354 i net me ram all
355 mill name rate
356 an elm let amir
357 me term an all i
358 mill name tear
359 an lam let mire
360 erm me tin all a
361 near team mill
362 me lam later in
363 in rem ell mat a
364 alarm meet lin
365 me itll an mare
366 mel i let an arm
367 all meter mina
368 all men eat rim
369 erm me all in at
370 aim man teller
371 it mean all rem
372 an lit a rem elm
373 ten alarm mile
374 an ell mar time
375 me in tall a rem
376 ill enter mama
377 me rile an malt
378 i net me mar all
379 male man liter
380 me man are till
381 mer me till an a
382 all tie merman
383 all met an mire
384 me erm an ill at
385 in teller mama
386 an rem let lima
387 in mem ell tar a
388 mint male real
389 an mem let rail
390 mel i let an ram
391 real meant mil
392 an meme trill a
393 it arm a ell men
394 amen tell amir
395 i term all amen
396 me i rent a mall
397 trail lame men
398 an a tiller mem
399 mel i let an mar
400 tire name mall
401 an lam met lire
402 erm me in tall a
403 eta man miller
404 all men ram tie
405 i arm at ell men
406 meal man liter
407 me trill mean a
408 it ram a ell men
409 menial arm let
410 it name all rem
411 me i mat all ern
412 trial mean elm
413 me man all tier
414 me mill a at ern
415 male man litre
416 in mall met ear
417 me met rin all a
418 ill mean mater
419 in mar lame let
420 erm me tan ill a
421 mine ream tall
422 an mem let lair
423 it man a rem ell
424 mil alert mean
425 all man met ire
426 mer i let an lam
427 all term anime
428 an lee arm milt
429 mal i let an rem
430 arm tell anime
431 an rem eat mill
432 i tram a ell men
433 realm let mina
434 an rem mate ill
435 i ram at ell men
436 mail alter men
437 lit merle man a
438 mer all a met in
439 in realm metal
440 me ran all item
441 i met a mall ern
442 mil learn team
443 an elm let rami
444 it mar a ell men
445 line metal ram
446 an mar melt lie
447 i man at rem ell
448 meal man litre
449 in merle malt a
450 i arm a elm lent
451 mean til realm
452 me tell ain ram
453 mer met an ill a
454 in lamer metal
455 an ream met ill
456 i met an all mer
457 in meter llama
458 i mean arm tell
459 me i man ell art
460 tail man merle
461 in mare lam let
462 i net rem mall a
463 near mate mill
464 all rem man tie
465 i mar at ell men
466 rail metal men
467 all tea rim men
468 mer me itll an a
469 men tail realm
470 an mem let lira
471 i ram a elm lent
472 metal ran mile
473 ill a term amen
474 it man a erm ell
475 emir mean tall
476 an mere mat ill
477 lar i let an mem
478 rail mean melt
479 an ream let mil
480 mel i rat an elm
481 till mean ream
482 an real lit mem
483 me melt lar in a
484 trial name elm
485 me tell in maar
486 me tin mer all a
487 men air mallet
488 ill are mat men
489 i lam a rem lent
490 all remit amen
491 ill ear met man
492 an all rem me it
493 ill name mater
494 me rate in mall
495 it ran a ell mem
496 meat near mill
497 me tear in mall
498 i man at erm ell
499 mil alert name
500 lamer a melt in

### whalefall:titles

input: Whalefall
category: titles
phrases 1 to 11 of 11

1 flew halal
2 well half a
3 wheal fall
4 he fall law
5 hell flaw a
6 a flew hall
7 all haw elf
8 he flaw all
9 we half all
10 wha all elf
11 wah all elf

### theirishman:titles

input: The Irishman
category: titles
phrases 1 to 500 of 500

1 interim shah
2 this in harem
3 the in is harm
4 nth rim he is a
5 ahh minister
6 her main shit
7 i shit her man
8 nth herm i is a
9 hash interim
10 her ain smith
11 he arm this in
12 nth sir i hem a
13 hernia smith
14 their in mash
15 her hit is man
16 shh i term in a
17 hah minister
18 their in sham
19 i arm his then
20 nth hes i rim a
21 mash inherit
22 his then amir
23 i harms the in
24 i he is nth arm
25 sham inherit
26 their in hams
27 he ram this in
28 i shh me rat in
29 ham inherits
30 her main hits
31 him rent his a
32 shh i rim ten a
33 hams inherit
34 his then rami
35 her in is math
36 i erm his nth a
37 hitman heirs
38 the mini rash
39 i hits her man
40 i he is nth ram
41 hitman hires
42 this ain herm
43 i ram his then
44 i shh me tar in
45 hairs hitmen
46 his thin mare
47 the in has rim
48 shh i rim net a
49 hitman shire
50 her mini hats
51 he mar this in
52 i she rim nth a
53 martinis heh
54 him near shit
55 it mash her in
56 i he is nth mar
57 hairnet shim
58 her thin aims
59 it sham her in
60 i he rims nth a
61 mains hither
62 him shrine at
63 i sin the harm
64 i he rim nth as
65 minas hither
66 his mint hare
67 i has her mint
68 hi nth rem is a
69 anthem rishi
70 her thin sima
71 him is her tan
72 i sim her nth a
73 hetman rishi
74 him hints are
75 him sin her at
76 shh i tin rem a
77 him earn shit
78 he harm its in
79 his nth rem a i
80 him sin heart
81 him is her ant
82 her nth mis a i
83 he shirt main
84 me ran his hit
85 i mer his nth a
86 his thin ream
87 i harm his ten
88 he is mir nth a
89 his inert ham
90 i shin the arm
91 her nth ism a i
92 his mint rhea
93 he tram his in
94 shh erm i tin a
95 him earths in
96 i mar his then
97 hi i as nth rem
98 it shine harm
99 him isnt her a
100 i shh it ran me
101 he rain smith
102 it hams her in
103 i hem sri nth a
104 him sin earth
105 his then rim a
106 shh rin i met a
107 this men hair
108 him tin her as
109 it shh in rem a
110 this hire man
111 her in smith a
112 shh mir i net a
113 him is anther
114 him tins her a
115 shh mer i tin a
116 them sin hair
117 i ran the shim
118 i shh in rem at
119 him near hits
120 her in sit ham
121 nth a is hi erm
122 him thins are
123 it has her nim
124 i me shh in art
125 him nest hair
126 i arm this hen
127 shh it erm in a
128 in hear smith
129 i shin the ram
130 nth sir me hi a
131 him shine art
132 he is an mirth
133 shh i erm in at
134 her anti shim
135 i harm the ins
136 nth a is mer hi
137 him hat siren
138 i net his harm
139 shh it mer in a
140 this heir man
141 i hit her mans
142 an rem shh it i
143 she mint hair
144 i sin her math
145 shh i mer in at
146 i shrine math
147 i ran his meth
148 shh i mir ten a
149 him thin ears
150 i rent his ham
151 nth rah i is me
152 him tin share
153 i ran this hem
154 i she mir nth a
155 me hints hair
156 ham the in sir
157 i him ser nth a
158 him shine rat
159 her nim shit a
160 i me shri nth a
161 him earns hit
162 he rim an shit
163 i mir nth hes a
164 him has trine
165 i ram this hen
166 i hi erm nth as
167 him hear tins
168 i shin the mar
169 i he mir nth as
170 them shin air
171 it sin her ham
172 me sri hi nth a
173 him earn hits
174 her in hit mas
175 i me hi nth ras
176 he mints hair
177 it arm his hen
178 i hi mer nth as
179 he shirt mina
180 he tin his arm
181 i me hi nth ars
182 mine hath sir
183 the rim shin a
184 i him nth res a
185 is her hitman
186 the in rim ash
187 i him nth ers a
188 him train hes
189 i mint her ash
190 i mer shh nit a
191 him nets hair
192 i shit an herm
193 an erm shh it i
194 me thin hairs
195 she rim an hit
196 an mer shh it i
197 theirs ham in
198 it ran his hem
199 a rem nit i shh
200 it shrine ham
201 i thin her mas
202 a me rin it shh
203 thine is harm
204 i shirt an hem
205 at me rin i shh
206 he trash mini
207 the hin is arm
208 a erm nit i shh
209 him ran heist
210 her tin is ham
211 a ern tim i shh
212 him hint ears
213 i mar this hen
214 i hath miners
215 this in herm a
216 he train shim
217 i tin her mash
218 in has hermit
219 i shin her mat
220 him hit snare
221 he rims an hit
222 him thin arse
223 i is then harm
224 him earth ins
225 i tin her sham
226 hither is man
227 it ram his hen
228 men shit hair
229 he tin his ram
230 his anti herm
231 this hen rim a
232 him hire ants
233 her nim hit as
234 him hear nits
235 i isnt her ham
236 him shin rate
237 i harm its hen
238 him shin tear
239 her nim is hat
240 man hire shit
241 his in hat rem
242 mine hit rash
243 i hint her mas
244 his ane mirth
245 her nim hits a
246 me thins hair
247 his rem thin a
248 me hint hairs
249 i shin her tam
250 him rinse hat
251 him hit an res
252 him reins hat
253 i tins her ham
254 him hears tin
255 her in hat mis
256 him hint arse
257 her in shim at
258 he mint hairs
259 i hats her nim
260 him net hairs
261 i tan her shim
262 hear his mint
263 her mis thin a
264 him nears hit
265 him hit an ers
266 harem shit in
267 i tram his hen
268 harsh time in
269 an hit is herm
270 she thin amir
271 it ham her ins
272 hers hit main
273 his hen trim a
274 him shine tar
275 he rim an hits
276 it shin harem
277 i ham this ern
278 heir shit man
279 the hin is ram
280 i thin masher
281 his in het arm
282 ahem shirt in
283 her shim tin a
284 him thin ares
285 it ash her nim
286 him hints ear
287 he rat his nim
288 him hat resin
289 i tin her hams
290 hear this nim
291 an hem hit sir
292 shit her mina
293 his rem hint a
294 it hash miner
295 he arm his nit
296 it ham shiner
297 it mar his hen
298 i hints harem
299 he tin his mar
300 him share nit
301 he rim his tan
302 him thin sera
303 i ham her nits
304 she hint amir
305 her mis hint a
306 him sin hater
307 i hast her nim
308 i hint masher
309 i hits an herm
310 rain the shim
311 her in hat ism
312 she thin rami
313 he rim his ant
314 in earth shim
315 her ism thin a
316 him hints era
317 his hin term a
318 i mint rehash
319 i rams the hin
320 an hire smith
321 i ham his tern
322 him hint ares
323 the hin is mar
324 has their nim
325 in herm shit a
326 him tan heirs
327 his in herm at
328 him train she
329 her nit is ham
330 in hare smith
331 i tan his herm
332 harm heist in
333 his in het ram
334 him hint sera
335 me rat his hin
336 him rein hats
337 it ham his ern
338 him hires tan
339 i mash her nit
340 men hits hair
341 in shirt hem a
342 he hints amir
343 i hem his rant
344 i hem tarnish
345 i shat her nim
346 him inter ash
347 i sham her nit
348 him thins ear
349 the hin rims a
350 thine ham sir
351 his hen rim at
352 his nim heart
353 his herm tin a
354 him hire tans
355 he ram his nit
356 man hire hits
357 her ism hint a
358 him thin eras
359 he sit in harm
360 hit has miner
361 i met harsh in
362 maths hire in
363 i ham then sir
364 him hires ant
365 he tar his nim
366 heirs hit man
367 her hin mist a
368 she hint rami
369 his in the arm
370 i thins harem
371 the hin rim as
372 his meth rain
373 me hath in sir
374 an heir smith
375 i hem his tarn
376 him isnt hare
377 i mats her hin
378 this hem rain
379 ham her in tis
380 him tin shear
381 i has then rim
382 man hires hit
383 her hin is mat
384 masher hit in
385 his in het mar
386 men hit hairs
387 he arm its hin
388 hit her mains
389 art hem his in
390 hers hit mina
391 i hams her nit
392 him sear hint
393 i shirt he man
394 him tan shire
395 het in is harm
396 shin the amir
397 he mar his nit
398 earth his nim
399 me tar his hin
400 him tin hares
401 her hin is tam
402 he shin mitra
403 in herm hit as
404 i thrash mien
405 he is thin arm
406 him ash trine
407 in herm is hat
408 thin is harem
409 hi the in arms
410 him hears nit
411 rat hem his in
412 him tins hare
413 his in the ram
414 harem hits in
415 thin herm is a
416 thine has rim
417 in herm hits a
418 him thins era
419 i rent him has
420 him hast rein
421 in hem is hart
422 his hem train
423 it has in herm
424 arm shine hit
425 he ram its hin
426 he hints rami
427 an hes hit rim
428 him tans heir
429 him is nth are
430 heir hits man
431 i term in hash
432 him hint eras
433 man he hit sir
434 his miner hat
435 he harm in tis
436 him stare hin
437 it harm in hes
438 ham their sin
439 hi the in mars
440 him trains he
441 he is thin ram
442 nim hear shit
443 arm he shit in
444 hits her mina
445 his in the mar
446 mint has hire
447 i term in shah
448 shire hit man
449 i hem in trash
450 hermit shin a
451 he mar its hin
452 a shine mirth
453 tar hem his in
454 ahem thin sir
455 the in marsh i
456 in ash hermit
457 his mint her a
458 the nim hairs
459 is her nth aim
460 hit her minas
461 him sit he ran
462 math hires in
463 arm she hit in
464 hers thin aim
465 he stir in ham
466 in hash timer
467 this nim her a
468 he thins amir
469 het sir ham in
470 hair met shin
471 has he trim in
472 him strain he
473 he is thin mar
474 him isnt rhea
475 ram he shit in
476 it rehash nim
477 him rat in hes
478 shim thin are
479 his in her mat
480 hash merit in
481 it she harm in
482 hers hat mini
483 he rat in shim
484 hint is harem
485 him is he rant
486 shin the rami
487 i hit hers man
488 this rein ham
489 i rim then ash
490 him hare nits
491 me is nth hair
492 in shim heart
493 het in has rim
494 him shat rein
495 him he star in
496 him tins rhea
497 i thin she arm
498 shah merit in
499 the sir man hi
500 aim her hints

### kenmccallum:people

input: Ken McCallum
category: people
phrases 1 to 40 of 40

1 me clunk calm
2 call neck mum
3 call muck men
4 me clunk clam
5 cell muck man
6 calm luck men
7 men clam luck
8 elm cluck man
9 men cluck lam
10 mall neck cum
11 mack cull men
12 mac neck mull
13 cam neck mull
14 clan muck elm
15 mac clunk elm
16 cum knell mac
17 cam clunk elm
18 cum knell cam
19 elm clank cum
20 call neck umm
21 lac clunk mem
22 clan luck mem
23 calm neck lum
24 man mel cluck
25 clan muck mel
26 mac clunk mel
27 clam neck lum
28 cam clunk mel
29 cal clunk mem
30 mal men cluck
31 nam cell muck
32 clank cel mum
33 clack men lum
34 clank cum mel
35 mack cell mun
36 nam elm cluck
37 nam mel cluck
38 clank cel umm
39 clack elm mun
40 clack mel mun

### sudhayadav:people

input: Sudha Yadav
category: people
phrases 1 to 28 of 28

1 dud hay vasa
2 us had a davy
3 sadhu davy a
4 dud a hay vas
5 dud vas ayah
6 dud a yah vas
7 hud day vasa
8 shy dud ava a
9 duh day vasa
10 hud davy as a
11 ava dud shay
12 duh davy as a
13 vada say hud
14 hud day vas a
15 ava dud hays
16 duh day vas a
17 hud davy aas
18 dah davy a us
19 duh davy aas
20 had davy sau
21 yah vasa dud
22 ashy dud ava
23 hud days ava
24 hay duds ava
25 duh days ava
26 duh vada say
27 dah davy sau
28 yah duds ava

### oliviergiroud:people

input: Olivier Giroud
category: people
phrases 1 to 500 of 500

1 our rigid olive
2 i lived our giro
3 i do our live rig
4 vigour oil ride
5 i devil our giro
6 i do our evil rig
7 dire vigour oil
8 i rode our vigil
9 i do our vile rig
10 olive rigor dui
11 i idle our vigor
12 i ive our old rig
13 void lieu rigor
14 i redo our vigil
15 i vie our old rig
16 livid euro giro
17 i gird our olive
18 i go our vier lid
19 virile giro duo
20 our rig lie void
21 i go our evil rid
22 girlie our void
23 our oil rig dive
24 i ive our girl do
25 dui river igloo
26 our vigil do ire
27 i vie our girl do
28 idol ire vigour
29 our oil ive grid
30 i go our veil rid
31 odour ire vigil
32 our oil vie grid
33 i rig our veil do
34 udo virile giro
35 our rig ive idol
36 i or our live dig
37 lido ire vigour
38 our rig vie idol
39 our lid or i give
40 rid louie vigor
41 our lei rig void
42 i or our evil dig
43 idol rei vigour
44 our vigil or die
45 i oil our rev dig
46 idol eri vigour
47 ive gird our oil
48 i oil our veg rid
49 odour rei vigil
50 go our livid ire
51 i ive our log rid
52 odour eri vigil
53 our rig ive lido
54 our veil or i dig
55 lido rei vigour
56 our rig vie lido
57 i or our vile dig
58 lido eri vigour
59 i rig live odour
60 i go our live rid
61 vid louie rigor
62 our giro ive lid
63 i oil rug ive rod
64 div louie rigor
65 oil our vier dig
66 i vie our log rid
67 rigid louie vor
68 our giro vie lid
69 i oil rug vie rod
70 i do lier vigour
71 i ive loo rid rug
72 i love our rigid
73 i vie loo rid rug
74 i rig evil odour
75 liver or i go dui
76 i ive loud rigor
77 i oil rig rev duo
78 our virile god i
79 vigil or i do rue
80 i do vigour lire
81 rig or i love dui
82 i void girl euro
83 rig or i live duo
84 i rule void giro
85 i rig loo rev dui
86 i vie loud rigor
87 oil or i ive drug
88 i live dour giro
89 rug or i lie void
90 i dog our virile
91 rug or i oil dive
92 i love rigor dui
93 oil or i vie drug
94 i rig vile odour
95 girl or i ive duo
96 i lie dour vigor
97 our rig i ive dol
98 i rue vigil door
99 girl or i vie duo
100 void rue rig oil
101 our rig i vie dol
102 give our oil rid
103 evil or i rig duo
104 i live rigor duo
105 our gild or i ive
106 i rile vigour do
107 our gild or i vie
108 i lure void giro
109 vier rug oil i do
110 i oil vier gourd
111 rug or i ive idol
112 our olive grid i
113 rig or i veil duo
114 i ive girl odour
115 rug or i vie idol
116 i oil rig devour
117 rug or i void lei
118 i lie vigour rod
119 i go or livid rue
120 i vie girl odour
121 rug or i ive lido
122 void rug oil ire
123 vole or i rig dui
124 i or uglier void
125 rug or i vie lido
126 i or livid rogue
127 ire or i lug void
128 i veil dour giro
129 loud rig or i ive
130 dour oil ive rig
131 loud rig or i vie
132 vier oil rig duo
133 i oil or vier dug
134 i or idle vigour
135 i rig or vile duo
136 i or livid rouge
137 vig i do our lire
138 dour oil vie rig
139 vid i go our lire
140 i rig veil odour
141 go i rid our vile
142 red vigour oil i
143 div i go our lire
144 i rue vigor idol
145 vig i oil our red
146 our livid ogre i
147 dev i oil our rig
148 i gore our livid
149 i log or vier dui
150 dui over rig oil
151 vor i lie our dig
152 i veil rigor duo
153 vig i lie our rod
154 our rigid vole i
155 gid i oil our rev
156 giro or live dui
157 vor i dig our lei
158 i rue vigil odor
159 gor i ive our lid
160 rude vigor oil i
161 gor i vie our lid
162 dui river go oil
163 i do our lier vig
164 rig or olive dui
165 vid i log our ire
166 i loud vier giro
167 div i log our ire
168 vier loo rig dui
169 i go our lier vid
170 our livid goer i
171 i go our lier div
172 rig or void lieu
173 i vig our old ire
174 giro or evil dui
175 guv or i oil ride
176 i rue vigor lido
177 udo or i live rig
178 i rile vigor duo
179 udo or i ive girl
180 our girl video i
181 udo or i vie girl
182 dour olive rig i
183 udo or i rig evil
184 dour giver oil i
185 gor or i live dui
186 giro or vile dui
187 luv or i die giro
188 vigor or lie dui
189 i vig or our lied
190 i oer dour vigil
191 our evil or i gid
192 giver or oil dui
193 vid or i oil urge
194 virile dui or go
195 div or i oil urge
196 vie our oil gird
197 i go vor lier dui
198 giro or veil dui
199 vor go i rid lieu
200 our vigor lied i
201 i oil guv rid ore
202 i or vigour lied
203 vig or i rue idol
204 our vigil do rei
205 udo or i rig veil
206 our dire oil vig
207 lurid or i go ive
208 udo i live rigor
209 rug vor i oil die
210 our vigil do eri
211 i vig or our idle
212 our giver idol i
213 i oil guv rid roe
214 ole i rid vigour
215 vor or i dig lieu
216 our oil vig ride
217 rei or i lug void
218 der i oil vigour
219 our veil or i gid
220 dui rove rig oil
221 lurid or go i vie
222 guv i rid oriole
223 vor rig i do lieu
224 our vigor deli i
225 i vig or our deli
226 dor i lie vigour
227 eri or i lug void
228 duro i live giro
229 lire vor i go dui
230 i or vigour deli
231 gor or i veil dui
232 our vigil doer i
233 i guv or dire oil
234 duro i lie vigor
235 gul or i void ire
236 dui rev giro oil
237 our gid or i live
238 our giver lido i
239 i vig or rude oil
240 duro i rig olive
241 vig or i rue lido
242 our vier oil gid
243 i oil oer rid guv
244 duro i oil giver
245 vor oil i rue dig
246 i dore our vigil
247 giro luv i do ire
248 loe i rid vigour
249 vig or i rile duo
250 udo i veil rigor
251 i oil ire guv rod
252 i rei old vigour
253 i oil vig rue rod
254 i eri old vigour
255 vor go i rile dui
256 our giro lie vid
257 vor rig i lie duo
258 our giro lie div
259 loo guv i rid ire
260 i udo evil rigor
261 loo vig i rid rue
262 i rei loud vigor
263 i oil rig rev udo
264 duro i veil giro
265 i oil rug ive dor
266 vigil or ore dui
267 i gor or evil dui
268 i eri loud vigor
269 i oil rug vid ore
270 vigil or roe dui
271 i oil rug div ore
272 vig i rile odour
273 i oil rug vie dor
274 vigor or lei dui
275 i oil vig err duo
276 our livid ergo i
277 goo luv i rid ire
278 udo i rile vigor
279 i oil rug vid roe
280 i go virile dour
281 i oil rug div roe
282 dour evil giro i
283 i vig or dour lie
284 our ire vig idol
285 i udo or vile rig
286 vigil or ire duo
287 i vig or loud ire
288 i duro evil giro
289 i oil gor rev dui
290 i udo vile rigor
291 ire vor i oil dug
292 i evil rigor duo
293 our vile gid or i
294 i udo liver giro
295 i rig loo rue vid
296 go our livid rei
297 i rig loo rue div
298 old ire vigour i
299 i rile our vig do
300 our giro vid lei
301 due rig oil i vor
302 our giro div lei
303 i gor or vile dui
304 go our livid eri
305 lei vor i rig duo
306 i gor virile duo
307 i vid oer oil rug
308 dour vile giro i
309 i div oer oil rug
310 our ire vig lido
311 go i rile our vid
312 duro ive rig oil
313 go i rile our div
314 lurid vier goo i
315 loo vig i err dui
316 i duro vile giro
317 ire vor i log dui
318 i vile rigor duo
319 i vig or dour lei
320 i liver giro duo
321 i vig or lier duo
322 loud ire vigor i
323 i ive our gol rid
324 i go virile duro
325 i gol or vier dui
326 i vig lier odour
327 i vie our gol rid
328 i udo lier vigor
329 i vig our lei rod
330 rei rug oil void
331 i vig our ore lid
332 eri rug oil void
333 i vig our roe lid
334 dour ore vigil i
335 luv rei i do giro
336 vid euro rig oil
337 guv rei i oil rod
338 div euro rig oil
339 luv eri i do giro
340 dour roe vigil i
341 i vig rei our old
342 dour lei vigor i
343 guv rei i rid loo
344 i lier vigor duo
345 i or giro lev dui
346 our livid or gie
347 guv eri i oil rod
348 vigil oer or dui
349 i rid our vig ole
350 oil gor vier dui
351 i vig eri our old
352 livid euro gor i
353 guv eri i rid loo
354 dour ire vig oil
355 i oer vig our lid
356 vig rei our idol
357 i oil our vig der
358 vigil or rei duo
359 luv rei i rid goo
360 rid euro vig oil
361 i oil our reg vid
362 vig eri our idol
363 i oil our reg div
364 vigil or eri duo
365 luv eri i rid goo
366 udo vier rig oil
367 i lie our vig dor
368 dui lie giro vor
369 i vig our ire dol
370 dui river logo i
371 role or i vig dui
372 i dor vigil euro
373 vor rei i oil dug
374 i udo vigor lire
375 ire or i guv idol
376 vig rei our lido
377 vor udo i rig lie
378 vigil or udo ire
379 vor reg i oil dui
380 vig eri our lido
381 i rig our ole vid
382 i duro vigil ore
383 i rig our ole div
384 i dor vigour lei
385 vor eri i oil dug
386 rod euro vigil i
387 i lie our gor vid
388 giro or vid lieu
389 i lie our gor div
390 giro or div lieu
391 euro or i vig lid
392 dui role vigor i
393 i oil our ger vid
394 i dor vigor lieu
395 i lie our vor gid
396 i duro vigil roe
397 i oil our ger div
398 i gird vor louie
399 guv dor i oil ire
400 i duro vigor lei
401 vig dor i oil rue
402 i vid rug oriole
403 i rid our vig loe
404 i div rug oriole
405 lire or i vig duo
406 dui lover giro i
407 lieu or i vig rod
408 i rei vigour dol
409 vig udo i err oil
410 duro vie rig oil
411 i log our rei vid
412 lid euro vigor i
413 i log our rei div
414 i vor louie grid
415 vor ole i rig dui
416 i eri vigour dol
417 vor gor i lie dui
418 rod lei vigour i
419 gor vid i oil rue
420 duo lire vigor i
421 gor div i oil rue
422 rod lieu vigor i
423 vor ger i oil dui
424 lid ore vigour i
425 i log our eri vid
426 vid rue giro oil
427 vor gid i oil rue
428 div rue giro oil
429 i log our eri div
430 lid roe vigour i
431 ire or i guv lido
432 i oer duro vigil
433 lore or i vig dui
434 dui lore vigor i
435 vor rei i log dui
436 dui vole rigor i
437 i vor gie our lid
438 i vor girlie duo
439 i vig dor our lei
440 louie vid or rig
441 vor eri i log dui
442 louie div or rig
443 i rig our loe vid
444 i oer vigour lid
445 i rig our loe div
446 dol ire vigour i
447 vor udo i rig lei
448 rei udo or vigil
449 i vig rei our dol
450 eri udo or vigil
451 ire or i vlog dui
452 odour lire vig i
453 i gor vid our lei
454 vig duro oil ire
455 i gor div our lei
456 vig louie or rid
457 i vor gid our lei
458 dour rei vig oil
459 i vig eri our dol
460 dour eri vig oil
461 vor loe i rig dui
462 dui lei giro vor
463 i gol vid our ire
464 duro rei vig oil
465 i gol div our ire
466 duro eri vig oil
467 i guv rei or idol
468 udo virile gor i
469 i guv eri or idol
470 udo girlie i vor
471 i vig duro or lie
472 i gul rei or void
473 i guv rei or lido
474 i gul eri or void
475 i guv eri or lido
476 i vig udo or lire
477 i vlog rei or dui
478 i vlog eri or dui
479 i vig dor or lieu
480 i vig duro or lei
481 vig udo or i rile
482 i gor vid or lieu
483 i gor div or lieu
484 i vor gid or lieu
485 i vid loo rug ire
486 i div loo rug ire
487 i or loud vig rei
488 i oil guv rei dor
489 i or loud vig eri
490 i oil guv eri dor
491 i rei vid loo rug
492 i rei div loo rug
493 i eri vid loo rug
494 i eri div loo rug
495 i vor gor lei dui
496 i or lier vig udo
497 i vor gol ire dui
498 our gol rei vid i
499 our gol rei div i
500 our gol eri vid i

### joshbrolin:people

input: Josh Brolin
category: people
phrases 1 to 35 of 35

1 broil johns
2 sir lob john
3 job horn lis
4 lis rob john
5 sol rib john
6 orb josh lin
7 lis orb john
8 nils job rho
9 jib horn sol
10 lin jobs rho
11 orb josh nil
12 nil jobs rho
13 josh lin rob
14 josh nil rob
15 bro josh nil
16 libs or john
17 lib or johns
18 bor josh lin
19 bol john sir
20 bor josh nil
21 bro john lis
22 lob josh rin
23 hols nor jib
24 lob john sri
25 lib nor josh
26 bor john lis
27 lib john ors
28 sri bol john
29 slob rho jin
30 job hols rin
31 orb hols jin
32 rob hols jin
33 bro hols jin
34 bol josh rin
35 bor hols jin
