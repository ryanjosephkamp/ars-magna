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

## File 1 of 5: 2832 phrases

### losangeles:places

input: Los Angeles
category: places
phrases 1 to 300 of 300

1 long leases
2 an sole legs
3 an els go les
4 legal noses
5 an lee gloss
6 an ess go ell
7 sole angels
8 all go sense
9 on les gel as
10 lee slogans
11 an less loge
12 no les gel as
13 gallons see
14 else long as
15 on les gels a
16 angels lose
17 so all genes
18 no les gels a
19 alleges son
20 an sole gels
21 so gel an les
22 glass leone
23 as gone sell
24 leg on less a
25 angles lose
26 on legless a
27 leg no less a
28 angel loses
29 all song see
30 on els gel as
31 angles sole
32 an sell goes
33 no els gel as
34 angle soles
35 no legless a
36 on els gels a
37 angle loses
38 on lee glass
39 no els gels a
40 gale lesson
41 an legs lose
42 so gel an els
43 gallon sees
44 long see las
45 on gel less a
46 goal lenses
47 on sell ages
48 a gel less no
49 angel soles
50 ages sell no
51 gen so sell a
52 allege sons
53 less go lane
54 les as on leg
55 goal lessen
56 else longs a
57 les as no leg
58 genoa sells
59 else on gals
60 lens so gel a
61 lease longs
62 else no gals
63 els as on leg
64 gaol lenses
65 on seal legs
66 els as no leg
67 slogan eels
68 no seal legs
69 a go sen sell
70 glean soles
71 else on slag
72 a go lens les
73 alleges nos
74 on sells age
75 on les legs a
76 slags leone
77 ass long lee
78 no les legs a
79 slogans eel
80 else no slag
81 a go ness ell
82 salons glee
83 less go lean
84 a gel les son
85 slogan else
86 age sells no
87 a go lens els
88 slogan lees
89 age sell son
90 as go sen ell
91 easel longs
92 so seen gall
93 on els legs a
94 gaol lessen
95 on sell sage
96 no els legs a
97 galleon ess
98 one less gal
99 a gel els son
100 glean loses
101 on less gale
102 a log les sen
103 alleges ons
104 so lean legs
105 a gel sen sol
106 sage sell no
107 eng so sell a
108 no less gale
109 a gel les nos
110 all gee sons
111 seg on sell a
112 all goes sen
113 neg so sell a
114 glen lose as
115 a log els sen
116 a gel lesson
117 a gel els nos
118 as long eels
119 sel as on leg
120 son see gall
121 sel as no leg
122 on seals leg
123 an leg les so
124 gone sells a
125 on legs sel a
126 long see als
127 no legs sel a
128 no seals leg
129 sel go an les
130 glen loses a
131 sel on gel as
132 an leg loses
133 seg as on ell
134 on glass eel
135 sel on gels a
136 all gees son
137 seg as no ell
138 no glass eel
139 an leg els so
140 as lone legs
141 a leg les son
142 a log lenses
143 sel go an els
144 as long lees
145 a seg sell no
146 all gone ess
147 a leg els son
148 so angle les
149 a go lens sel
150 so seal glen
151 a leg sen sol
152 lens go sale
153 a leg les nos
154 son seal leg
155 as gel sel no
156 on sees gall
157 a gel sel son
158 no sees gall
159 a gels sel no
160 les long sea
161 an ell so seg
162 lens go seal
163 a gen les sol
164 so lee slang
165 an leg sel so
166 so legal sen
167 a leg els nos
168 else lag son
169 a gen ell sos
170 on gel sales
171 a gel les ons
172 on legs sale
173 a log sel sen
174 sales gel no
175 a gen els sol
176 no legs sale
177 an gel sel so
178 an glee loss
179 a nog les els
180 ass long eel
181 a leg lens so
182 so leans leg
183 a gel sel nos
184 log lessen a
185 glen so sel a
186 on leg sales
187 a leg sel son
188 no leg sales
189 a nog ell ess
190 an egos sell
191 a gel els ons
192 glen soles a
193 a glen les so
194 an leg soles
195 ell so eng as
196 an ego sells
197 ell so neg as
198 glen sole as
199 a seg ell son
200 as longs lee
201 a glen els so
202 less go elan
203 as gen ell so
204 on legal ess
205 a eng les sol
206 on gel seals
207 a leg sel nos
208 on lee slags
209 a neg les sol
210 seals gel no
211 a gol les sen
212 an gels lose
213 a gen sel sol
214 an gel loses
215 a eng ell sos
216 sane sell go
217 a nog sel les
218 one legs las
219 a neg ell sos
220 les go lanes
221 a eng els sol
222 log seen las
223 a seg ell nos
224 one slag les
225 a neg els sol
226 on gels sale
227 a gol els sen
228 sale gel son
229 a nog sel els
230 sale gels no
231 a leg les ons
232 lass gel one
233 sen lol seg a
234 on gels seal
235 a eng sel sol
236 leg nose las
237 ess lol eng a
238 so gel lanes
239 a neg sel sol
240 seal gel son
241 ess lol neg a
242 seal gels no
243 a gel sel ons
244 glass lee no
245 a gol sel sen
246 a longs eels
247 ell ons seg a
248 so angle els
249 a leg els ons
250 on gases ell
251 a gen ess lol
252 so gels lane
253 a leg sel ons
254 les go leans
255 no gases ell
256 gas one sell
257 els long sea
258 one leg lass
259 so slang eel
260 on slag eels
261 no slag eels
262 son ages ell
263 age sell nos
264 sol seen gal
265 so gels lean
266 an logs eels
267 so gel leans
268 ell gas ones
269 so glean les
270 an gel soles
271 las gels one
272 a longs lees
273 an gloss eel
274 as ogle lens
275 sea sell nog
276 lens go ales
277 one legs als
278 else nag sol
279 lee nag loss
280 lens log sea
281 nos see gall
282 all gene sos
283 log seen als
284 as longs eel
285 on sages ell
286 gen lose las
287 on slag lees
288 gas nose ell
289 no sages ell
290 no slag lees
291 all nog sees
292 on slags eel
293 sons age ell
294 on legs ales
295 no slags eel
296 nag lose les
297 no legs ales
298 an logs lees
299 las gel ones
300 leg nose als

### newyorkcity:places

input: New York City
category: places
phrases 1 to 197 of 197

1 rye know city
2 key win to cry
3 city yen work
4 it cry key now
5 yet rocky win
6 it key won cry
7 yeti know cry
8 i yet know cry
9 worn key city
10 i cry key town
11 yet corky win
12 on wit key cry
13 tiny key crow
14 we try icky no
15 on tricky yew
16 no wit key cry
17 icky new troy
18 we ok tiny cry
19 tiny cry woke
20 i knew coy try
21 icky new tory
22 i cry key wont
23 icy trey know
24 i cry won tyke
25 rocky wet yin
26 cry key in two
27 icy tyre know
28 ok yin wet cry
29 corny key wit
30 i cry own tyke
31 yet inky crow
32 kin yew to cry
33 cry yoke twin
34 ok wit yen cry
35 yin toy wreck
36 we on icky try
37 tricky yew no
38 icy wen ok try
39 icy troy knew
40 on yew kit cry
41 wry tiny coke
42 cow key in try
43 icky trey now
44 wry in key cot
45 wick yen troy
46 we toy kin cry
47 troy nick yew
48 inky cry to we
49 icky tyre now
50 we try coy ink
51 wry key tonic
52 we try coy kin
53 corky wet yin
54 wry no key tic
55 icy try woken
56 i now cry tyke
57 icy tory knew
58 cry yet win ok
59 icky trey won
60 i toy wry neck
61 wick yen tory
62 we kit yon cry
63 tory nick yew
64 it key wry con
65 wonky tie cry
66 icy new ok try
67 icky trey own
68 cry key it own
69 icky tyre won
70 yew ink to cry
71 tiny yew rock
72 cry key in tow
73 icky tyre own
74 cry knew i toy
75 yet wiry conk
76 cry yet in wok
77 wry icky note
78 cry we ink toy
79 icy tyne work
80 ok nit cry yew
81 rocky yen wit
82 wry ok yen tic
83 ice wonky try
84 it yen wok cry
85 icky rye town
86 i con wry tyke
87 worn icy tyke
88 i knot yew cry
89 yon trick yew
90 cry yew kit no
91 wino cry tyke
92 i yet wry conk
93 wry icy token
94 i try yew conk
95 wry icky tone
96 i cry wok tyne
97 yin crow tyke
98 wry on key tic
99 wiry coy kent
100 wry ok icy ten
101 torn icky yew
102 cry yew tin ok
103 corky yen wit
104 wry ok icy net
105 wry keno city
106 etc wry ok yin
107 inky trey cow
108 tye i know cry
109 tiny yew cork
110 yow i try neck
111 rocky yew tin
112 nowt i key cry
113 con wiry tyke
114 yow i cry kent
115 icy entry wok
116 yow it cry ken
117 inky tyre cow
118 ony we kit cry
119 coy trey wink
120 i try we conky
121 icky wen troy
122 icy ken to wry
123 coy tyre wink
124 ick yet wry no
125 icky wren toy
126 ick on try yew
127 icky rye wont
128 ick no try yew
129 corny yew kit
130 we ick yon try
131 crew inky toy
132 i wry coy kent
133 wry kit coney
134 it wry coy ken
135 icky wen tory
136 cry tye in wok
137 neck wiry toy
138 cry key in wot
139 yon trey wick
140 wry yen to ick
141 icky tyne row
142 cry tye win ok
143 yon tyre wick
144 i tye wry conk
145 corky yew tin
146 we try ony ick
147 icky yen wort
148 tye ick wry no
149 wry tyke coin
150 ick yet on wry
151 wry inky cote
152 ick tye on wry
153 wonky rye tic
154 rocky yew nit
155 wry tyke icon
156 cory key twin
157 wry yeti conk
158 corky yew nit
159 tiny rocky we
160 cory inky wet
161 we yon tricky
162 nick yeow try
163 tiny corky we
164 cory yet wink
165 conky wry tie
166 tye inky crow
167 icky rent yow
168 rocky tye win
169 trick yen yow
170 city kern yow
171 icky yon wert
172 icky yet worn
173 cry yeow knit
174 icky rye nowt
175 corky tye win
176 tye wiry conk
177 rick yew tony
178 cory tyke win
179 nick trey yow
180 nick tyre yow
181 icky tern yow
182 coy twerk yin
183 wick rye tony
184 rick tyne yow
185 cory yew knit
186 trick yew ony
187 worn icky tye
188 conky rye wit
189 tricky we ony
190 cory tye wink
191 yow ick entry
192 wick trey ony
193 wick tyre ony
194 wert inky coy
195 icky ony wert
196 icy twerk yon
197 icy twerk ony

### sanfrancisco:places

input: San Francisco
category: places
phrases 1 to 300 of 300

1 francs casino
2 an sonic scarf
3 i can for scans
4 franc casinos
5 i scarf canons
6 in scars of can
7 franc cassino
8 across can fin
9 on can is scarf
10 a coins francs
11 crass can of in
12 as coin francs
13 an in scarf cos
14 carcass of inn
15 in car of scans
16 info can scars
17 an con is scarf
18 scarf an coins
19 i cons an scarf
20 canon is scarf
21 in sacs for can
22 fain can cross
23 in cars of scan
24 scans for cain
25 an cos is franc
26 car coins fans
27 can is for scan
28 sonic a francs
29 in cars of cans
30 cancan for sis
31 far cons is can
32 scan of cairns
33 cross a can fin
34 sonic far scan
35 can is for cans
36 far scan coins
37 an can if cross
38 as sonic franc
39 i cans for scan
40 cans of cairns
41 in scar of scan
42 as coins franc
43 an cos can firs
44 scarf can sion
45 in scar of cans
46 cancan of sirs
47 an no sic scarf
48 sonic far cans
49 can scan of sir
50 cars coins fan
51 i can cross fan
52 far cans coins
53 an cos fins car
54 scarf can ions
55 car can of sins
56 son scarf cain
57 can cans of sir
58 scarf an icons
59 an on cis scarf
60 cars coin fans
61 in cos fans car
62 info scans car
63 can is of narcs
64 far scans coin
65 i scans of narc
66 scans of cairn
67 an cos fin cars
68 cain cross fan
69 i scan of narcs
70 fairs can cons
71 in arc of scans
72 icons fans car
73 on a sic francs
74 fracas cons in
75 no a sic francs
76 cos scarf nina
77 far cos sin can
78 fan scar coins
79 i so can francs
80 fair scans con
81 in cos scan far
82 info scan cars
83 i cans of narcs
84 scarf an scion
85 in sac for scan
86 ain cos francs
87 cars can of sin
88 sonic car fans
89 in cos fan cars
90 fans ran cisco
91 in cos cans far
92 fan scars coin
93 in sac for cans
94 fans scar coin
95 on in scarf sac
96 fair scan cons
97 far can sic son
98 info cans cars
99 no in scarf sac
100 icon fans cars
101 far con is scan
102 far scan icons
103 an cos scar fin
104 scion fans car
105 in arcs of scan
106 far scans icon
107 scarf can is no
108 ass coin franc
109 far con is cans
110 fair cans cons
111 i scan on scarf
112 icons fan cars
113 in arcs of cans
114 fins can orcas
115 far can con sis
116 far cans icons
117 i scan no scarf
118 crass can info
119 in so can scarf
120 info scan scar
121 scar can of sin
122 snarf an cisco
123 in cos scar fan
124 sonic cars fan
125 sic for an scan
126 far scan scion
127 i cans on scarf
128 fans arc coins
129 an cos scan fir
130 fan scars icon
131 i cans no scarf
132 info cans scar
133 an cons sic far
134 fans scar icon
135 sic for an cans
136 scion fan cars
137 on sic an scarf
138 far cans scion
139 an cos cans fir
140 cos fan cairns
141 on scars if can
142 fan scar icons
143 far ins can cos
144 cos fans cairn
145 i can son scarf
146 sonic scar fan
147 no scars if can
148 scarf scan ion
149 on sac is franc
150 fan scar scion
151 no sac is franc
152 fan arcs coins
153 on car sic fans
154 fairs scan con
155 cars can of ins
156 scarf cans ion
157 an cis far cons
158 fracas con sin
159 in sac of narcs
160 info scans arc
161 scarf an cis no
162 cars if canons
163 in sacs of narc
164 fin on carcass
165 an cos arc fins
166 fin no carcass
167 arc can of sins
168 fans arcs coin
169 in cos arc fans
170 fairs cans con
171 is so can franc
172 fans arc icons
173 cis no fans car
174 canna if cross
175 car scan of sin
176 scars if canon
177 on scan sic far
178 cis far canons
179 far scan sic no
180 nos scarf cain
181 scan is of narc
182 ais con francs
183 on as sic franc
184 fain scars con
185 on cars sic fan
186 cos snarf cain
187 crass can if no
188 scan if acorns
189 sac can for sin
190 sonic arc fans
191 scar can of ins
192 acorns sic fan
193 car cans of sin
194 info scan arcs
195 on cans sic far
196 acorn sic fans
197 far cans sic no
198 cans if acorns
199 cans is of narc
200 fans arc scion
201 narc can of sis
202 scar if canons
203 an cars if cons
204 scans if acorn
205 far sacs con in
206 ani cons scarf
207 an cos arcs fin
208 info cans arcs
209 so sic an franc
210 fans arcs icon
211 far sac cons in
212 fin scan orcas
213 sic of an narcs
214 fain scar cons
215 an scars if con
216 fan arcs icons
217 on sac fins car
218 fin scans orca
219 no sac fins car
220 fins scan orca
221 cis no fan cars
222 fin cans orcas
223 on car if scans
224 sin snarf coca
225 arcs can of sin
226 fracas con ins
227 on sacs fin car
228 fins cans orca
229 no car if scans
230 scarf ain cons
231 in cos arcs fan
232 fain crass con
233 cis son fan car
234 sic anon scarf
235 no sacs fin car
236 sonic arcs fan
237 an roc sic fans
238 sac fin acorns
239 is a con francs
240 coin snarf sac
241 on scar sic fan
242 far canons sic
243 cis a corn fans
244 fan arcs scion
245 i cons a francs
246 cis anon scarf
247 an scar if cons
248 sac fins acorn
249 on sac fin cars
250 fain cars cons
251 car so can fins
252 fain scans roc
253 no sac fin cars
254 ais conn scarf
255 on cars if scan
256 sacs fin acorn
257 i con as francs
258 fair sacs conn
259 far can sic nos
260 icon snarf sac
261 no cars if scan
262 sac conn fairs
263 cis nan of cars
264 fan crass coin
265 car scan of ins
266 ais cons franc
267 an sacs con fir
268 arcs if canons
269 on cars if cans
270 ins snarf coca
271 an sac con firs
272 cis acorns fan
273 an sac cons fir
274 cis acorn fans
275 no cars if cans
276 fain arcs cons
277 an narcs if cos
278 francs a icons
279 sac can for ins
280 fain narcs cos
281 car cans of ins
282 fan crass icon
283 cars so can fin
284 francs as icon
285 cars if can son
286 is fracas conn
287 cis a scorn fan
288 francs a scion
289 on arc sic fans
290 fain sacs corn
291 scarf a cons in
292 fain sac scorn
293 on scar if scan
294 fon in carcass
295 an roc fins sac
296 sica on francs
297 no scar if scan
298 crass if canon
299 an sacs if corn
300 fain sac corns

### greatbritain:places

input: Great Britain
category: places
phrases 1 to 300 of 300

1 giant arbiter
2 it brain great
3 it rib an great
4 it err an big at
5 bearing trait
6 i target brain
7 it get an briar
8 i be an trig art
9 trite bargain
10 it arrange bit
11 it bar an tiger
12 i be an tart rig
13 battering air
14 it bartering a
15 it tire an grab
16 i be an trig rat
17 bang irritate
18 i treating bar
19 i garter an bit
20 i be an trig tar
21 batter airing
22 i bartering at
23 i target an rib
24 i rent it grab a
25 baring attire
26 it bar tearing
27 i treat an brig
28 i err an big tat
29 battering rai
30 it bag trainer
31 it grab an rite
32 an big a err tit
33 baiting terra
34 it train barge
35 an are grit bit
36 i get it ran bar
37 battering ria
38 it bag terrain
39 i rag an bitter
40 it ring a be art
41 bartering ait
42 it rat bearing
43 it bear an grit
44 i get in bar art
45 i treating bra
46 it rag an tribe
47 it rat a be ring
48 it eat barring
49 i gear an britt
50 i ring at be art
51 it retain grab
52 it grab an tier
53 i get in rat bar
54 it bar granite
55 i rig an batter
56 i rang it be art
57 it bear rating
58 it rate an brig
59 i get it ran bra
60 i nitrate grab
61 it tear an brig
62 i rat at be ring
63 it bait ranger
64 i rage an britt
65 i rent it brag a
66 i begin tartar
67 it tire an brag
68 i ring a be tart
69 i bear ratting
70 it bear an trig
71 i rang it be rat
72 it grate brain
73 an air get brit
74 i ring a bet art
75 i treat baring
76 in at rib great
77 it tar a be ring
78 i barter giant
79 it bar in great
80 i rat it be gran
81 it bat earring
82 i bitter an gar
83 it rag in be art
84 i grain batter
85 it gear an brit
86 i get in tar bar
87 i rear batting
88 in at get briar
89 i get in rat bra
90 it bar ingrate
91 it bag an trier
92 it grin a be art
93 it grab retina
94 an at rib tiger
95 i rent it garb a
96 it bar tangier
97 in a garter bit
98 i ran it beg art
99 it regain brat
100 in tiger bar at
101 it ran a be grit
102 i target bairn
103 it rage an brit
104 it ran at be rig
105 great rain bit
106 in air get brat
107 i err it bang at
108 it bare rating
109 in a target rib
110 i tar at be ring
111 it tar bearing
112 it bare an grit
113 it err in bag at
114 a bring attire
115 it brag an rite
116 it rat in be rag
117 it arraign bet
118 it tire an garb
119 it rat a be grin
120 it gain barter
121 tiring a be art
122 i grin at be art
123 it rent airbag
124 in a treat brig
125 it ran a be trig
126 it retrain bag
127 it bare an trig
128 i rang it be tar
129 it garner bait
130 it grate an rib
131 i ran it beg rat
132 it rate baring
133 i barter an git
134 i ran at be grit
135 it tear baring
136 i treat in grab
137 i rag a rent bit
138 i bare ratting
139 i target in bar
140 i rat art beg in
141 tiger brain at
142 in a rag bitter
143 i rat at be grin
144 it tin barrage
145 an trait be rig
146 i tar it be gran
147 i rat berating
148 in tit grab are
149 i rag it bar ten
150 it retain brag
151 it brag an tier
152 i be in tart rag
153 it bat rearing
154 it bring at are
155 i ran it rag bet
156 i nitrate brag
157 big in rate art
158 i get in tar bra
159 it gab trainer
160 big in tear art
161 i grin a be tart
162 it gab terrain
163 i bring tae art
164 i ran at be trig
165 bitter grain a
166 i ran great bit
167 it rig ten bar a
168 big treat rain
169 tiring a be rat
170 it rat in be gar
171 big rate train
172 big rent air at
173 i rag in bet art
174 big tear train
175 an rare big tit
176 i rant it be rag
177 it brag retina
178 i grate an brit
179 i grin a bet art
180 rib treating a
181 it rag an biter
182 it rant a be rig
183 grab attire in
184 in a gear britt
185 it tar in be rag
186 i binge tartar
187 trite in grab a
188 it tar a be grin
189 it retain garb
190 in art gear bit
191 i grit ten bar a
192 i nitrate garb
193 it garb an rite
194 i rig ten bar at
195 it nag arbiter
196 in rite grab at
197 i ran it beg tar
198 bit gear train
199 big rate rat in
200 i rat it rag ben
201 i tar berating
202 big tear rat in
203 i rig a tent bar
204 it reign rabat
205 bitter rig an a
206 i be in tart gar
207 air be ratting
208 in a rage britt
209 i rag it be tarn
210 bit rage train
211 an air grit bet
212 i ran it bet gar
213 tribe grain at
214 an rag tire bit
215 i rat in rag bet
216 i tint barrage
217 i bring tae rat
218 it rig a be tarn
219 biting rare at
220 in art rage bit
221 i rent git bar a
222 big retrain at
223 it rate in grab
224 i rant a be grit
225 big trainer at
226 it tear in grab
227 i get a rib tarn
228 air bring tate
229 in at rag tribe
230 i rant at be rig
231 giant rare bit
232 big art tin are
233 i rat it bar gen
234 grab train tie
235 in a bitter gar
236 i ran a bet trig
237 being air tart
238 an ear grit bit
239 i tar art beg in
240 it barrage nit
241 an trig are bit
242 i tar at be grin
243 it garb retina
244 it garb an tier
245 i rat art be gin
246 it gan arbiter
247 in tier grab at
248 i rig a rent bat
249 a beg irritant
250 in rat gear bit
251 i net it rag bar
252 bite grant air
253 big tire ran at
254 i ran art be git
255 are gain britt
256 an trig air bet
257 i ring tet bar a
258 big terrain at
259 i treat a bring
260 it rig a net bar
261 it grate bairn
262 it be raring at
263 i rant it be gar
264 in bait garret
265 in at rate brig
266 it tar in be gar
267 biting rear at
268 in at tear brig
269 i rant a be trig
270 britt regain a
271 i target in bra
272 it err in gab at
273 big retain art
274 brag at tire in
275 i grit a be tarn
276 bit rear giant
277 it ring tae bar
278 rib get it ran a
279 it retrain gab
280 in rat rage bit
281 i rig at be tarn
282 bit regain art
283 in trig bear at
284 i tar rat beg in
285 bag train tire
286 big tire an art
287 i err it tan bag
288 tit bring area
289 it gab an trier
290 big rent i rat a
291 at tie barring
292 big are ran tit
293 i tag a rent rib
294 bait garter in
295 big are rat tin
296 i ran rat be git
297 beat train rig
298 rare in tag bit
299 i rat in bet gar
300 tiring bare at

### neatsvillekentucky:places

input: Neatsville, Kentucky
category: places
phrases 1 to 300 of 300

1 an tiny vest keel luck
2 an tiny vet sleek luck
3 an tiny leek vest luck
4 an tiny leeks vet luck
5 an tiny vets keel luck
6 an tiny levee tsk luck
7 an tiny leek vets luck
8 an tiny elves tuck elk
9 an tiny elves tuck lek
10 an tiny lev sleek tuck
11 an tiny vet suckle elk
12 even let ask tiny luck
13 an tiny lev tuck leeks
14 an tiny vet suckle lek
15 an tiny lev keel tucks
16 an tiny lev tucks leek
17 stuck ken level tiny a
18 stuck eve all tiny ken
19 level ken ask tiny cut
20 eve suck all tiny kent
21 tiny a etc skunk level
22 knee vet all tiny suck
23 lee vent ask tiny luck
24 tiny all suck keen vet
25 stuck eve knell tiny a
26 stuck lev kneel tiny a
27 even elk ask tiny cult
28 tiny all neck tusk eve
29 even ell ask tiny tuck
30 all eve etc tiny skunk
31 tiny van luck seek let
32 tiny a suck kent level
33 even lek ask tiny cult
34 eve tucks all tiny ken
35 cut eve ask tiny knell
36 leek vent as tiny luck
37 cut lev ask tiny kneel
38 luck vet else tiny kan
39 tiny at suck ken level
40 tiny can skulk lee vet
41 tiny a luck tsk eleven
42 tiny a luck kneel vest
43 teen lev ask tiny luck
44 tiny elks even luck at
45 tiny at knuckle elves
46 tiny at neck skull eve
47 tiny kat suck even ell
48 elk tuck else tiny van
49 tiny can skulk let eve
50 an stuck tiny lev keel
51 tiny neve let luck ask
52 lee vet sank tiny luck
53 tiny lev sulk tae neck
54 tiny lav suck keen let
55 tiny a neck tusk level
56 tiny a tuck ken levels
57 lee vet ask tiny clunk
58 tiny kat neck us level
59 tiny eve let luck sank
60 tiny ace skunk let lev
61 an stuck tiny lev leek
62 tiny at cell skunk eve
63 tiny eve let clunk ask
64 tiny a luck kneel vets
65 lek tuck else tiny van
66 lee luck vest tiny kan
67 tiny as luck kneel vet
68 keen lev ask tiny cult
69 tiny eve lent ask luck
70 tiny a luck sleek vent
71 tiny ace ken vet skull
72 tiny tan luck seek lev
73 tiny a tucks ken level
74 tiny a luck keel vents
75 tiny elk even luck sat
76 tiny lev snuck tae elk
77 tiny les even luck kat
78 tiny a luck kneels vet
79 tiny as luck knelt eve
80 tiny van suck keel let
81 tiny leeks vent luck a
82 tiny van cut sleek elk
83 tiny lev eat knuckles
84 tiny veal suck ken let
85 tiny ken us level tack
86 keen vet ask tiny cull
87 ken tuck else tiny lav
88 tiny veal knuckle set
89 vast ken clue tiny elk
90 lee luck vets tiny kan
91 tiny vale suck ken let
92 tiny leek vents luck a
93 tiny a tuck kens level
94 tiny knee let luck vas
95 tiny vale knuckle set
96 tiny ale luck tsk even
97 tiny van luck keel set
98 tiny van suck leek let
99 tiny as luck keel vent
100 tiny lea luck tsk even
101 tiny kan suck tell eve
102 tiny vas luck keen let
103 sunk let keel tiny vac
104 tiny a knuckle les vet
105 tiny lek even luck sat
106 tiny ken set luck veal
107 tiny lev snuck tae lek
108 tiny eve skull act ken
109 lev tuck else tiny kan
110 tiny ken set luck vale
111 tiny van cut sleek lek
112 tiny van etc skulk lee
113 tiny elk vet uncle ask
114 tiny at suck knell eve
115 tiny leek set luck van
116 tiny eleven skulk act
117 tiny eel vent luck ask
118 tiny eve skull cat ken
119 tiny kent see luck lav
120 tiny at suck kneel lev
121 vast ken clue tiny lek
122 sunk leek let tiny vac
123 tiny vet nuke cell ask
124 tiny elk evens luck at
125 tiny eleven skulk cat
126 ten elk lave tiny suck
127 tiny leva suck ken let
128 lee lev sank tiny tuck
129 tiny lev seen luck kat
130 tiny vela suck ken let
131 nee luck tsk tiny veal
132 cut lev sank tiny keel
133 tiny els even luck kat
134 tiny tack nukes level
135 tiny knuckles vet ale
136 tiny vat suck keen ell
137 tiny ken let suck lave
138 nee luck tsk tiny vale
139 tiny act even elk sulk
140 sunk lev keel tiny act
141 tiny lav suck knee let
142 tiny knuckles vet lea
143 tiny las tuck keen lev
144 tiny lek vet uncle ask
145 tiny lav cut sleek ken
146 tiny lac skulk ten eve
147 tiny leva knuckle set
148 ane elk vest tiny luck
149 neat lev suck tiny elk
150 tiny lac let skunk eve
151 an tiny lev skeet luck
152 sunk cell vet tiny kea
153 tiny vela knuckle set
154 sunk lee tack tiny lev
155 tiny cat even elk sulk
156 sunk lev keel tiny cat
157 tiny elk seen luck vat
158 tiny van etc sulk keel
159 tiny ken set luck leva
160 tiny knee vet luck las
161 tiny vac skunk let lee
162 tiny as tuck knell eve
163 tiny lev clue kent ask
164 tiny ken set luck vela
165 tiny a elect lev skunk
166 tiny ace skunk vet ell
167 cut lev sank tiny leek
168 cute lev sank tiny elk
169 tiny vane suck elk let
170 sunk ell tack tiny eve
171 tiny tan suck keel lev
172 tiny a clunk keel vest
173 tiny las tuck elk even
174 tiny las luck keen vet
175 tiny set lave knuckle
176 ten lev skulk tiny ace
177 tiny as tuck kneel lev
178 ken sulk etc tiny veal
179 tiny ken set luck lave
180 tiny lav luck seek ten
181 tiny tack nuke levels
182 sunk lev act tiny leek
183 tiny elk vent clue ask
184 tiny lek evens luck at
185 tiny elk vent luck sea
186 tiny knee set luck lav
187 tiny elk even luck tas
188 ten lek lave tiny suck
189 tiny ale knuckle vest
190 tiny a suckle kent lev
191 tiny ken vest luck ale
192 ken sulk etc tiny vale
193 tiny a knuckle els vet
194 sunk elk vet tiny lace
195 tiny lav luck keen set
196 tiny ken vest luck lea
197 tiny lea knuckle vest
198 tiny can sulk keel vet
199 tiny kan cut sleek lev
200 tiny vena suck elk let
201 tiny lat suck keen lev
202 tiny lev tae knuckles
203 tiny a clunks keel vet
204 tiny a tucks knell eve
205 tiny alt suck keen lev
206 sunk lev cat tiny leek
207 tiny lav etc lee skunk
208 tiny van etc sulk leek
209 tiny vats knuckle lee
210 tiny sack nuke let lev
211 tiny a suckle elk vent
212 tiny act even lek sulk
213 tiny lev knee ask cult
214 tiny at clunk seek lev
215 cut ken lave tiny elks
216 ace lev sulk tiny kent
217 tiny eve cull kent ask
218 tiny nave suck elk let
219 tiny elk set luck vane
220 tiny sat luck keen lev
221 tiny tack sulk eleven
222 tiny lace skulk event
223 tiny a clunk leek vest
224 tiny a tucks kneel lev
225 tiny at clunks elk eve
226 tiny van etc skulk eel
227 nee let skulk tiny vac
228 tiny a tuck kneels lev
229 ane lek vest tiny luck
230 tiny kat clunk sleeve
231 net elk lave tiny suck
232 neat lev suck tiny lek
233 sunk elk etc tiny veal
234 tiny cat even lek sulk
235 tiny lat suck elk even
236 tiny lav tuck keen les
237 tiny lek seen luck vat
238 nee luck tsk tiny leva
239 tiny alt suck elk even
240 ane elk vets tiny luck
241 ane elks vet tiny luck
242 tiny eve us knell tack
243 nee luck tsk tiny vela
244 cute lev sank tiny lek
245 sunk elk etc tiny vale
246 tiny vane luck tsk lee
247 tiny vane suck lek let
248 tiny lev neck lute ask
249 tiny can sulk leek vet
250 tiny veal elect skunk
251 tiny elk set luck vena
252 tiny kan tuck sell eve
253 tiny las tuck lek even
254 tiny lac sulk keen vet
255 tiny a clunks leek vet
256 lev skunk etc tiny ale
257 tiny als tuck keen lev
258 tiny at snuck keel lev
259 tiny at suckle ken lev
260 tiny lev us kneel tack
261 tiny act skunk lev lee
262 tiny ant luck seek lev
263 tiny lek vent clue ask
264 tiny veal suck elk ten
265 lev skunk etc tiny lea
266 tiny lac skulk net eve
267 tiny lek vent luck sea
268 tiny a clunk keel vets
269 tiny a clunk tsk levee
270 tiny can skulk eel vet
271 tiny lev sulk neck eat
272 tiny elk set luck nave
273 tiny lek even luck tas
274 tiny vat luck keen les
275 tiny knee vet cull ask
276 tiny elk seek cult van
277 tiny vale elect skunk
278 tiny vas tuck keen ell
279 tiny act skunk eve ell
280 tiny knee vet luck als
281 tiny as clunk keel vet
282 tiny vale suck elk ten
283 tiny vac knee let sulk
284 sunk lek vet tiny lace
285 tiny at clunk elks eve
286 sunk eve talc tiny elk
287 tiny van tuck seek ell
288 tiny vas luck keel ten
289 tiny veal suckle kent
290 tiny vena luck tsk lee
291 tiny vena suck lek let
292 tiny ken vets luck ale
293 tiny cat skunk lev lee
294 tiny lev kens eat luck
295 sunk vet keel tiny lac
296 tiny a suckle lek vent
297 tiny als tuck elk even
298 tiny als luck keen vet
299 tiny vac keen let sulk
300 tiny ken vets luck lea

### unitedstates:places

input: United States
category: places
phrases 1 to 300 of 300

1 united tastes
2 its untested a
3 it tests an due
4 us test it end a
5 situated sent
6 an tested suit
7 its ten used at
8 us set it end at
9 untied states
10 an suited test
11 it sued an test
12 us test i end at
13 untied tastes
14 it need status
15 used in test at
16 us set it tend a
17 situated nest
18 i eat students
19 us date its ten
20 us test i tend a
21 situated tens
22 its nude state
23 it test an dues
24 us set i tend at
25 sustained tet
26 i seat student
27 its sent due at
28 i set ten dust a
29 saute dentist
30 its nude taste
31 its need tuts a
32 us set it dent a
33 situated nets
34 its astute end
35 its set tuned a
36 us test i dent a
37 attend tissue
38 it send statue
39 us test an diet
40 it sun ted set a
41 tastiest nude
42 its seated nut
43 its net used at
44 i sun ted test a
45 snide statute
46 it date sunset
47 its use tend at
48 us set i dent at
49 nastiest duet
50 it end statues
51 i tests an duet
52 us is ted tent a
53 sauteed stint
54 i send statute
55 an test is duet
56 i set ten stud a
57 tastiest dune
58 it ends statue
59 its nude test a
60 i sun ted set at
61 attend suites
62 its dun estate
63 us test an tide
64 i tut set send a
65 attends suite
66 i end statutes
67 it set an duets
68 i tuts set end a
69 attitude ness
70 i tuned states
71 i test an duets
72 us is ted net at
73 taunted sites
74 it attend uses
75 used tent is at
76 i tut set ends a
77 attuned sites
78 it attends use
79 its need tut as
80 i tut set end as
81 estate nudist
82 it states nude
83 us need its tat
84 us is tet end at
85 attest undies
86 its teased nut
87 us tented its a
88 us set i end tat
89 anisette dust
90 us eat dentist
91 its nude set at
92 i stun ted set a
93 distaste tune
94 it dust senate
95 it sets an duet
96 us set tit end a
97 attitudes sen
98 i ends statute
99 its use dent at
100 i nut ted set as
101 statutes dine
102 its sedate nut
103 us edit an test
104 i tut sets end a
105 tetanus tides
106 it dunes state
107 us end its tate
108 i nut ted sets a
109 anisette stud
110 i tuned tastes
111 us net its date
112 us sit ted net a
113 tetanus diets
114 its astute den
115 an ted set suit
116 us set i tan ted
117 audits tenets
118 i tend statues
119 its due tents a
120 us is tet tend a
121 statute dines
122 it test sundae
123 us tend its tea
124 us tin ted set a
125 tetanus edits
126 i tends statue
127 its dune test a
128 us sit tet end a
129 stateside nut
130 it tastes nude
131 its ted tunes a
132 us is ted nett a
133 stateside tun
134 it dunes taste
135 its due nest at
136 i tuts den set a
137 stated unites
138 student is tea
139 an dust tie set
140 us set i net tad
141 untested sati
142 it tuned seats
143 used ten sit at
144 us is tet dent a
145 tasted unites
146 us attend site
147 an tit see dust
148 i tut den set as
149 it state nudes
150 it tut an seeds
151 us set i tat den
152 student site a
153 its due tent as
154 a dust i net set
155 students tie a
156 us eat its dent
157 i tut den sets a
158 it tunes dates
159 it tees an dust
160 i tut dens set a
161 it states dune
162 its ten sued at
163 set tut end is a
164 i tasted tunes
165 its steed nut a
166 a dun i test set
167 its neat duets
168 tested nut is a
169 it tut ess end a
170 its tensed tau
171 its sue tend at
172 us set dit net a
173 its seated tun
174 used tent sit a
175 nut is ted set a
176 it taste nudes
177 an due set tits
178 a stud i net set
179 it stud senate
180 its ted tune as
181 i tut ess end at
182 student is ate
183 its nett used a
184 us net its ted a
185 i detests aunt
186 tent its used a
187 in ted us test a
188 i dent statues
189 an ted use tits
190 i tut ess tend a
191 its nude tates
192 its tent sued a
193 its tet us end a
194 its nude teats
195 an set sit duet
196 us it set an ted
197 it tuned asset
198 i tuts an steed
199 us i test an ted
200 it eaten studs
201 nuts test die a
202 in ted us set at
203 it attends sue
204 us tend its ate
205 ten ted us is at
206 us attend ties
207 its dune set at
208 set tut den is a
209 i sate student
210 it tuts an seed
211 nuts ted i set a
212 student ties a
213 nude test is at
214 us is an tet ted
215 as united test
216 its sun eat ted
217 i tut ess dent a
218 dentist use at
219 its dues tent a
220 tun is ted set a
221 us detain test
222 us dent its tea
223 tet sun ted is a
224 its saute dent
225 its duet nest a
226 us net tet dis a
227 it tastes dune
228 it tee an studs
229 ten ted us sit a
230 i sedate stunt
231 its due nets at
232 tet is set dun a
233 i dents statue
234 sent duet is at
235 sen tut ted is a
236 its tensed uta
237 in test sued at
238 as dun i set tet
239 at studies ten
240 in duet tests a
241 a dun i sets tet
242 estate dust in
243 nuts set die at
244 a din us set tet
245 i taunted sets
246 an set tuts die
247 a suds i net tet
248 i attuned sets
249 an due test tis
250 ten dit us set a
251 student tie as
252 an stud tie set
253 us and i set tet
254 a studies tent
255 its sue dent at
256 i tut an ess ted
257 i detest aunts
258 sent due sit at
259 ten tet i suds a
260 it seeds taunt
261 used tin test a
262 ten tet us dis a
263 its teased tun
264 an tit see stud
265 in ess tut ted a
266 it attend sues
267 an dui test set
268 us i set ten tad
269 i taunts steed
270 it tees an stud
271 it set uns ted a
272 us tinted seat
273 in dues test at
274 i test uns ted a
275 its sedate tun
276 its use end tat
277 us it test den a
278 sent suited at
279 us end its teat
280 us it as ten ted
281 state end suit
282 its ute send at
283 i set uns ted at
284 it seed taunts
285 its ted sun tea
286 i set tuns ted a
287 an duties test
288 in duets test a
289 us it nest ted a
290 it tunes stead
291 side nut test a
292 us as in tet ted
293 its use attend
294 sent ted suit a
295 us it set den at
296 us attends tie
297 us dent its ate
298 us i test den at
299 us tinted east
300 its ten due sat

### worldtradecenter:places

input: World Trade Center
category: places
phrases 1 to 300 of 300

1 card wonder letter
2 an red letter crowd
3 an red let trod crew
4 let drowned carter
5 an drew letter cord
6 an red let wert cord
7 center told reward
8 an cred word letter
9 an red led trot crew
10 letter drowned car
11 red drew to central
12 an red del trot crew
13 center told drawer
14 new red told carter
15 we rent red told car
16 trade centre world
17 dear crowd let rent
18 an red wort let cred
19 centre told reward
20 on drew letter card
21 an red tort crew led
22 dancer word letter
23 red old went carter
24 red let crew to darn
25 recent told reward
26 red center told war
27 an red tort crew del
28 retarded crown let
29 own red letter card
30 we rent red lot card
31 dawn record letter
32 red world tent care
33 an red lot wert cred
34 later crowd tender
35 new let record dart
36 we tent red lord car
37 centre told drawer
38 ten world tree card
39 red let crew to rand
40 recent told drawer
41 red centre told war
42 we rent red lord act
43 world entered cart
44 red recent told war
45 we trend red lot car
46 world rented trace
47 red world enter act
48 an cold drew err tet
49 new rattled record
50 red tender to crawl
51 we rent ted lord car
52 tread center world
53 dear crew told rent
54 red wren let to card
55 later crowded rent
56 red lord went trace
57 we rent red lord cat
58 let drowned crater
59 tender lord crew at
60 we rent rod let card
61 world create trend
62 world ted enter car
63 we lord ten cart red
64 clatter wonder red
65 red rent let coward
66 we rent red cart old
67 talent record drew
68 ten red trace world
69 we trend rod let car
70 world centered art
71 world tree tend car
72 red crew lend to art
73 we cradled torrent
74 world ted rent care
75 we err ten told card
76 new retracted lord
77 clear drew to trend
78 we rent red rat cold
79 deterrent do crawl
80 later trend do crew
81 red drew let to narc
82 terrace tend world
83 recent drew lord at
84 etc err an world ted
85 tread centre world
86 red world enter cat
87 we let red corn dart
88 world rated center
89 new red told crater
90 red let warn to cred
91 rattler crowd need
92 red cold rent water
93 we rent red told arc
94 wand record letter
95 red lot draw center
96 we rent cred lord at
97 later centred word
98 decent world err at
99 red rent crew to lad
100 let drowned tracer
101 later red went cord
102 we rot nerd let card
103 world rented crate
104 world creed rent at
105 red crew lend to rat
106 water centred lord
107 red old went crater
108 we let nerd cord art
109 world rated centre
110 ten red react world
111 red rent weld to car
112 letter warned cord
113 red let drown trace
114 we err end told cart
115 warren detect lord
116 new ted lord carter
117 red drew not let car
118 alert crowd tender
119 later red word cent
120 we lord red rat cent
121 not deterred crawl
122 new red retract old
123 red rent to lewd car
124 letter dared crown
125 redder town let car
126 we lot red cart nerd
127 war center toddler
128 rattled no crew red
129 a crowd red let rent
130 nerd letter coward
131 red world tent race
132 we net red lord cart
133 crowd lend retreat
134 crowned red let art
135 an red rot welt cred
136 caterer tend world
137 red cent lord water
138 we err cold trend at
139 cartel tender word
140 red center told raw
141 we err dent told car
142 redder two central
143 red lot draw centre
144 we trod nerd let car
145 errant crowded let
146 on red clatter drew
147 ten crew to red lard
148 terrace dent world
149 red lot draw recent
150 we let nerd cord rat
151 cartel rented word
152 world tree dent car
153 red don let crew art
154 center told warder
155 wet end lord carter
156 we err red told cant
157 tent crawled order
158 red drew clatter no
159 we let red cord rant
160 downer letter card
161 new red told tracer
162 we err net told card
163 alert crowded rent
164 cold trend were art
165 we let tor card nerd
166 warden cord letter
167 redder let crown at
168 we rent red tar cold
169 cattle render word
170 new rod letter card
171 etc wert an red lord
172 dread crown letter
173 red lord went crate
174 we trot red lend car
175 warner detect lord
176 tart crew lord need
177 drew do rent let car
178 land record wetter
179 rare crowd tend let
180 we nett red lord car
181 war centre toddler
182 red world tree cant
183 we err lot tend card
184 letter wander cord
185 ten red crate world
186 we err old tent card
187 later crowd rented
188 world trend erect a
189 red nerd let to craw
190 wonder retract led
191 old drew center art
192 we let rod cart nerd
193 rent alerted crowd
194 world cred enter at
195 we err nerd told act
196 rate centred world
197 clear ted word rent
198 rent told red crew a
199 tear centred world
200 raw record tend let
201 we tent red lord arc
202 don retract welder
203 red word recant let
204 drew to nerd let car
205 tender world carte
206 redder lot went car
207 we rent let cord rad
208 reward centred lot
209 new let cord retard
210 we lot tern card red
211 world rented carte
212 tan drew let record
213 an red tor welt cred
214 centre told warder
215 world deer tent car
216 we let red cord tarn
217 rector went ladder
218 world reed tent car
219 red cred rent to law
220 recent told warder
221 old trend were cart
222 red crew lend to tar
223 letter drowned arc
224 older red went cart
225 we err lord tend act
226 tender alter crowd
227 world ted rent race
228 we err nerd told cat
229 now redder clatter
230 new let cord trader
231 red rent crew to dal
232 caterer dent world
233 dear crew lord tent
234 we trend red lot arc
235 carter letdown red
236 red old went tracer
237 we rot led rent card
238 drawer centred lot
239 ten world deter car
240 an wet dolt err cred
241 cedar drown letter
242 wet lord rented car
243 we lord red tar cent
244 elder wonder tract
245 wet render told car
246 we rent led cord art
247 treat crowd lender
248 redder now let cart
249 cred to we rent lard
250 alert centred word
251 ten led word carter
252 we err led don tract
253 warlord center ted
254 red centre told raw
255 we err old end tract
256 wonder retract del
257 cold rent were dart
258 we rent ted lord arc
259 world retrace dent
260 ten let cord drawer
261 red led crew to rant
262 dancer lord wetter
263 wanted let err cord
264 we err old trend act
265 world deter trance
266 red recent lot ward
267 we rot lent card red
268 rectal tender word
269 red world net trace
270 we err lord tend cat
271 down erred clatter
272 red recent told raw
273 we lord tern act red
274 raw cold deterrent
275 world nerd tree act
276 we err cold tend art
277 nettle draw record
278 world cred tent are
279 we err lot dent card
280 drew letter candor
281 red center to drawl
282 we lord ten rat cred
283 related crowd rent
284 crowned red let rat
285 we rot led trend car
286 claret tender word
287 real ted rent crowd
288 two red nerd let car
289 retract world need
290 worn let traced red
291 we rent old rat cred
292 toddler went racer
293 world deer rent act
294 not err let crew dad
295 claret rented word
296 world reed rent act
297 we rot let rend card
298 colt tender reward
299 elder tent word car
300 we err old trend cat

### lasvegas:places

input: Las Vegas
category: places
phrases 1 to 33 of 33

1 slave gas
2 lev gas as
3 gave lass
4 as gel vas
5 save gals
6 a gels vas
7 save slag
8 lev sag as
9 gavel ass
10 legs vas a
11 saves gal
12 leg vas as
13 salve gas
14 veg lass a
15 slave sag
16 veg als as
17 saves lag
18 veg sal as
19 legs vasa
20 seg lav as
21 vase gals
22 vase slag
23 vases gal
24 salve sag
25 gases lav
26 veg salsa
27 vases lag
28 sages lav
29 gels vasa
30 ave glass
31 lev sagas
32 gales vas
33 ave slags

### neworleans:places

input: New Orleans
category: places
phrases 1 to 300 of 300

1 lone answer
2 an new loser
3 we ran on les
4 lean owners
5 an new roles
6 we ran no les
7 wear nelson
8 an won reels
9 on ern slew a
10 answer noel
11 an sworn lee
12 no ern slew a
13 newer salon
14 an own reels
15 we ran on els
16 newer loans
17 we learn son
18 we ran no els
19 renewal son
20 we learns no
21 lens or new a
22 sewn loaner
23 an sewn role
24 an wen or les
25 leans owner
26 an low sneer
27 les nor new a
28 lane owners
29 an sworn eel
30 we or an lens
31 newer solan
32 an worn eels
33 an wen or els
34 sown leaner
35 on real news
36 els nor new a
37 ware nelson
38 an sole wren
39 an new or les
40 ensnare low
41 we snarl one
42 we nor an les
43 seal renown
44 an newer sol
45 an new or els
46 lanes owner
47 an worn lees
48 we nor an els
49 loaner news
50 an sown reel
51 ern own les a
52 senna lower
53 else ran now
54 on wren les a
55 salon renew
56 real new son
57 no wren les a
58 ensnare owl
59 an sewn lore
60 ern own els a
61 sale renown
62 else warn no
63 on wren els a
64 loans renew
65 on new laser
66 no wren els a
67 lane worsen
68 no new laser
69 won ern les a
70 warns leone
71 we learn nos
72 new ern sol a
73 leaner snow
74 else ran won
75 sel we ran no
76 lean worsen
77 lens own are
78 wen or lens a
79 leaner owns
80 real news no
81 we nor lens a
82 elan owners
83 an sown leer
84 won ern els a
85 renewal nos
86 an role news
87 low sen ern a
88 wean loners
89 an reels now
90 wen nor les a
91 wane loners
92 on sewn real
93 we or les nan
94 weasel norn
95 real sewn no
96 sel nor new a
97 solan renew
98 on wear lens
99 we sal on ern
100 ales renown
101 as new loner
102 we sal no ern
103 elan worsen
104 no wear lens
105 we lar on sen
106 answer leno
107 one war lens
108 we lar no sen
109 anew loners
110 on new reals
111 wen nor els a
112 renewal ons
113 no new reals
114 we or els nan
115 on new earls
116 on wren sel a
117 no new earls
118 no wren sel a
119 so learn wen
120 an sol ern we
121 on new arles
122 we ran on sel
123 we seal norn
124 an wen or sel
125 won lens are
126 we on ern las
127 no new arles
128 we no ern las
129 a enrol news
130 a les ern now
131 on news earl
132 won ern sel a
133 no news earl
134 own ern sel a
135 one warn les
136 we on ern als
137 on near slew
138 we no ern als
139 near slew no
140 a els ern now
141 an les owner
142 an new or sel
143 now earn les
144 we sel or nan
145 new ran sole
146 a owl ern sen
147 an lore news
148 a sol ern wen
149 now ran eels
150 an sel nor we
151 on sneer law
152 wen nor sel a
153 no sneer law
154 we sel norn a
155 an wren lose
156 a sel ern now
157 new enrol as
158 a les we norn
159 we loans ern
160 a els we norn
161 real new nos
162 on warns lee
163 one ran slew
164 near new sol
165 an reel snow
166 on warn eels
167 no warn eels
168 an lens wore
169 on sewn earl
170 new son earl
171 no sewn earl
172 none war les
173 an lower sen
174 on earn slew
175 on renew las
176 on reel swan
177 an loser wen
178 no earn slew
179 no renew las
180 swan reel no
181 new loners a
182 won earn les
183 on seal wren
184 an reel owns
185 now ran lees
186 no seal wren
187 won ran eels
188 real sen now
189 newer on las
190 lens own ear
191 newer no las
192 on warn lees
193 near les now
194 also new ern
195 else row nan
196 no warn lees
197 on news lear
198 so lean wren
199 no news lear
200 norn see law
201 sol were nan
202 we snarl eon
203 on ware lens
204 son warn eel
205 no ware lens
206 one warn els
207 lens own era
208 won ran lees
209 an roles wen
210 an els owner
211 an leer snow
212 now earn els
213 real sen won
214 an loner sew
215 on reels wan
216 an sol renew
217 sen own earl
218 wan reels no
219 on sewn lear
220 near les won
221 real wen son
222 on renew als
223 now seal ern
224 new son lear
225 no sewn lear
226 no renew als
227 on leer swan
228 real sen own
229 as lone wren
230 on warns eel
231 swan leer no
232 so renal wen
233 no warns eel
234 an leer owns
235 near les own
236 sere on lawn
237 ern was noel
238 sere no lawn
239 newer on als
240 snow ran eel
241 res own lane
242 raw lens one
243 newer no als
244 none war els
245 news or lane
246 we on learns
247 an owl sneer
248 ers own lane
249 on wen laser
250 new oral sen
251 wan reel son
252 won earn els
253 no wen laser
254 on wren sale
255 no wren sale
256 news or lean
257 won lens ear
258 won seal ern
259 on sawn reel
260 no sawn reel
261 low earn sen
262 near els now
263 ern own sale
264 neon war les
265 new roan les
266 sen war noel
267 sewn loner a
268 norn was eel
269 ern own seal
270 woe ran lens
271 on seer lawn
272 new lone ras
273 law nose ern
274 no seer lawn
275 lean new ors
276 sen own lear
277 won lens era
278 as enrol wen
279 sen row lane
280 won sen earl
281 one wren las
282 lean res now
283 renal no sew
284 new lone ars
285 lean ers now
286 role sew nan
287 near els won
288 ran else own
289 one res lawn
290 lee rows nan
291 warn lee son
292 les wore nan
293 ern saw noel
294 one ers lawn
295 one ern laws
296 wan leer son
297 new nos earl
298 near els own
299 so new learn
300 won res lane

### buenosaires:places

input: Buenos Aires
category: places
phrases 1 to 300 of 300

1 serious bean
2 our base sine
3 i been our ass
4 our in ess be a
5 easier bonus
6 i assure bone
7 our sis been a
8 us is on be are
9 serious bane
10 our nee basis
11 our in be seas
12 us is no be are
13 sabine euros
14 a bruises one
15 i sober an use
16 i be on sure as
17 easier bosun
18 i abuse senor
19 our in bees as
20 i be no sure as
21 abuse senior
22 i beans euros
23 one bus is are
24 us be so in are
25 abuser noise
26 us bear noise
27 our bins see a
28 i nurse so be a
29 beau seniors
30 us raise bone
31 our ben is sea
32 i sun so be are
33 sabine rouse
34 i erase bonus
35 our in see abs
36 i see so burn a
37 aeon bruises
38 a be neurosis
39 our bin see as
40 us be in rose a
41 arouses bine
42 i season rube
43 i seen our abs
44 us see i bar no
45 bonsai reuse
46 i nose abuser
47 an use is bore
48 us rise on be a
49 beanie sours
50 i snore abuse
51 i use an robes
52 us rise no be a
53 bae neurosis
54 i arouses ben
55 sure bone is a
56 i be so ran use
57 us braise one
58 i see our bans
59 i run so be sea
60 as bruise one
61 an use is robe
62 on is sure be a
63 us ease robin
64 i use an bores
65 us see in rob a
66 us bare noise
67 i sober an sue
68 us be in sore a
69 on bear issue
70 our in see bas
71 a be sure is no
72 on easier bus
73 our nibs see a
74 i sun rose be a
75 one is abuser
76 our sin be sea
77 i see on rub as
78 no bear issue
79 one sub is are
80 us is on be ear
81 are bus noise
82 i seen our bas
83 so sure in be a
84 i rouse beans
85 in euros be as
86 i seen so rub a
87 bar issue one
88 our bin sees a
89 i see no rub as
90 one raise bus
91 i uses an bore
92 us is no be ear
93 see our basin
94 ours is an bee
95 us sire on be a
96 i snores beau
97 i sees our ban
98 us seen i rob a
99 as one rubies
100 in use sober a
101 us snore i be a
102 serious ben a
103 our sine be as
104 us sire no be a
105 a bruise ones
106 i uses an robe
107 i see on rubs a
108 us arise bone
109 our sin bees a
110 i see no rubs a
111 sure one bias
112 our bee sins a
113 us be so in ear
114 as busier one
115 i base our sen
116 i runes so be a
117 on use rabies
118 i bees an sour
119 i be as on user
120 as buries one
121 an sue is bore
122 i run so bees a
123 rabies use no
124 i sue an robes
125 i see son rub a
126 i erase bosun
127 our bis seen a
128 i be as no user
129 a bruise nose
130 an sue is robe
131 us is on be era
132 on rise abuse
133 one rebus is a
134 i be as on ruse
135 bonus see air
136 us see an biro
137 us is no be era
138 abuse rise no
139 bare use is no
140 i be as no ruse
141 on see airbus
142 an bee is sour
143 i see sun rob a
144 bison use are
145 i sue an bores
146 us be so in era
147 on bare issue
148 bone sir use a
149 i sun sore be a
150 no see airbus
151 in use robes a
152 us see on rib a
153 on easier sub
154 on bus see air
155 us see no rib a
156 ours be anise
157 an beer is sou
158 i sun so be ear
159 i banes euros
160 iron use be as
161 i be so ran sue
162 boner issue a
163 our nib see as
164 i sees on rub a
165 sure is beano
166 one rise bus a
167 i sees no rub a
168 on bruise sea
169 no bus see air
170 us see in orb a
171 air buses one
172 our bee sin as
173 i see run sob a
174 are sub noise
175 one rubes is a
176 us be i sear no
177 sea bruise no
178 our ins be sea
179 us rein so be a
180 bones use air
181 i base sure no
182 i bes on sure a
183 a buries ones
184 on uses be air
185 i bes no sure a
186 one raise sub
187 iron bus see a
188 us seen i orb a
189 a borne issue
190 no uses be air
191 i rue son be as
192 bar noise use
193 in use bore as
194 i sun so be era
195 so base urine
196 one rube is as
197 i rue on be ass
198 rubies nose a
199 in use bores a
200 i rue no be ass
201 on sire abuse
202 in sue sober a
203 on use sir be a
204 ain sober use
205 obese run is a
206 no use sir be a
207 seen our bias
208 i buses an ore
209 us be as in ore
210 bra issue one
211 iron uses be a
212 i rue sons be a
213 abuse sire no
214 i buses on are
215 i sun eros be a
216 i ensures boa
217 i buses no are
218 i see on bur as
219 so easier bun
220 one bus is ear
221 i seen so bur a
222 one arise bus
223 us be senior a
224 i see sun orb a
225 bourne is sea
226 in use sob are
227 i see no bur as
228 see our sabin
229 in use robe as
230 us be as in roe
231 euros is bean
232 one sire bus a
233 i see bos run a
234 robin use sea
235 our ins bees a
236 i use on be ras
237 an bore issue
238 an sis be euro
239 i see son bur a
240 i ensues boar
241 an sou be rise
242 i use no be ras
243 a buries nose
244 i buses an roe
245 i use as on reb
246 easier bus no
247 on use be sari
248 i use as no reb
249 ours see bani
250 our in bee ass
251 on see rub is a
252 ours been ais
253 in use be soar
254 no see rub is a
255 an robe issue
256 no use be sari
257 i use on be ars
258 base use iron
259 one rub is sea
260 i use no be ars
261 senor is beau
262 in uses bore a
263 i sun ore be as
264 euro is beans
265 our in bes sea
266 so see in rub a
267 base rouse in
268 our neb is sea
269 on is user be a
270 on braise use
271 us is bone are
272 a be user is no
273 on busier sea
274 i bone sure as
275 i sour sen be a
276 on sue rabies
277 in euro be ass
278 i see uns rob a
279 rebus noise a
280 in use be oars
281 i sun roe be as
282 us rise beano
283 in uses robe a
284 us be as on ire
285 no braise use
286 on use be airs
287 so in user be a
288 on buries sea
289 i sues an bore
290 on sue sir be a
291 no busier sea
292 one bus is era
293 us be as no ire
294 rabies sue no
295 no use be airs
296 no sue sir be a
297 sea buries no
298 i subs one are
299 i bus on sere a
300 i robs unease

### amsterdam:places

input: Amsterdam
category: places
phrases 1 to 202 of 202

1 made smart
2 me star dam
3 mad master
4 me rats dam
5 mad stream
6 me dam arts
7 smart dame
8 me dams art
9 made trams
10 med smart a
11 smart mead
12 me rat dams
13 tamed arms
14 me dam tsar
15 armed mast
16 terms dam a
17 armed mats
18 me tram ads
19 mated arms
20 mad a terms
21 tamed mars
22 me dart mas
23 madam rest
24 meds arm at
25 dam master
26 me mats rad
27 mated mars
28 me rams tad
29 dreams mat
30 me tar dams
31 dream mast
32 as term dam
33 dream mats
34 a term dams
35 dreams tam
36 meds tram a
37 tamed rams
38 meds ram at
39 dam stream
40 mad as term
41 dramas met
42 me mat rads
43 mated rams
44 as met dram
45 rammed sat
46 dam arm set
47 madras met
48 arm met ads
49 dreamt mas
50 mad arm set
51 drama stem
52 meds mar at
53 dames tram
54 med trams a
55 dames mart
56 med tram as
57 dams mater
58 sad arm met
59 dram teams
60 a stem dram
61 dama terms
62 dam ram set
63 dams tamer
64 med rams at
65 dram steam
66 ram met ads
67 dram mates
68 med arm sat
69 rammed tas
70 mad ram set
71 dame trams
72 sad ram met
73 damar stem
74 dam mar set
75 mead trams
76 rem dams at
77 dram meats
78 ted arm mas
79 madam tres
80 mem dart as
81 mads mater
82 mar met ads
83 madre mast
84 mad mar set
85 madre mats
86 med ram sat
87 mads tamer
88 sad mar met
89 dram metas
90 ems dam art
91 mas met rad
92 ras met dam
93 ted ram mas
94 mad mat res
95 sad mat rem
96 mad art ems
97 med mar sat
98 mad mat ers
99 mad ras met
100 ars met dam
101 mas rat med
102 tad arm ems
103 dam rat ems
104 rem dam sat
105 mad ars met
106 mad rat ems
107 mad sat rem
108 med arm tas
109 ted mar mas
110 mad star me
111 sad art mem
112 ads rat mem
113 tad ram ems
114 red mas mat
115 mas tar med
116 sad rat mem
117 dam tar ems
118 ads mat rem
119 dam mat res
120 med ram tas
121 dam mat ers
122 mad rats me
123 red mas tam
124 mad arts me
125 mad tar ems
126 res dam tam
127 med mat ras
128 tad mar ems
129 rad mat ems
130 ers dam tam
131 mad tam res
132 sad tam rem
133 med mat ars
134 ads tar mem
135 mad tam ers
136 med mar tas
137 rem dam tas
138 mad tsar me
139 sad tar mem
140 mad sat erm
141 mad tas rem
142 sad tram me
143 med arms at
144 sad mart me
145 med mars at
146 meds mart a
147 sad mat erm
148 sad tam erm
149 mad tas erm
150 med mart as
151 darts a mem
152 me rat mads
153 dams at erm
154 me tar mads
155 dram at ems
156 me mads art
157 med mas art
158 ads mat erm
159 rads at mem
160 ads art mem
161 dam sat erm
162 mad sat mer
163 tad arms me
164 der mat mas
165 mads a term
166 rad sat mem
167 mad mat ser
168 tad mars me
169 me drat mas
170 ads tam rem
171 sad mat mer
172 mad tam ser
173 tad mas rem
174 med tam ras
175 rad tam ems
176 sad tam mer
177 dram sat me
178 med tam ars
179 ads mart me
180 dam tas erm
181 mad tas mer
182 rad mast me
183 tad ras mem
184 tad ars mem
185 rad tas mem
186 mads at rem
187 ads tam erm
188 tad mas erm
189 rads tam me
190 dams at mer
191 dam mat ser
192 dram tas me
193 drat as mem
194 ads mat mer
195 dam sat mer
196 mer mads at
197 mads at erm
198 dam tam ser
199 der mas tam
200 dam tas mer
201 ads tam mer
202 tad mas mer
