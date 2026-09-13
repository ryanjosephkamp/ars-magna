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

## File 1 of 6: 2702 phrases

### thegodfather:titles

input: The Godfather
category: titles
phrases 1 to 300 of 300

1 het godfather
2 the hated frog
3 he go the draft
4 fathered goth
5 the forged hat
6 he do the graft
7 godfather eth
8 the aged forth
9 he fart the god
10 the dog father
11 he raft the god
12 the aged froth
13 he dog the fart
14 her fated goth
15 he dog the raft
16 frog the death
17 he fog that red
18 head get forth
19 he dog the frat
20 forget the dah
21 her theft dog a
22 theft hear god
23 the herd go fat
24 fog the hatred
25 he dog that ref
26 thread the fog
27 herd to the fag
28 he gated forth
29 he ford the tag
30 theft hear dog
31 herd of the tag
32 teeth had frog
33 ted for the hag
34 hod get father
35 get for the dah
36 head get froth
37 the fed go hart
38 heard theft go
39 her fed got hat
40 that heed frog
41 he frog the tad
42 he farted goth
43 red of the ghat
44 that hog freed
45 the hod get far
46 for that hedge
47 he fog the dart
48 farted the hog
49 the hot red fag
50 at hedge forth
51 he fort the dag
52 ford get heath
53 the het far god
54 hard fog teeth
55 the ref hat god
56 fog the dearth
57 the red fog hat
58 fag doth there
59 he gad the fort
60 ted hog father
61 her god heft at
62 the herd fagot
63 he ford the gat
64 fed got hearth
65 herd of the gat
66 god heft heart
67 the fret do hag
68 that ford ghee
69 the red hog fat
70 that hog defer
71 the ted hog far
72 he gated froth
73 the het far dog
74 ogre had theft
75 he trod the fag
76 gore had theft
77 the ref dog hat
78 theft hare god
79 the fret go dah
80 gather do heft
81 her heft dog at
82 god heft earth
83 the ref got dah
84 ago herd theft
85 the fed hog art
86 hat edge forth
87 fed to her ghat
88 thee hog draft
89 the heft do rag
90 her ghetto fad
91 her hod get fat
92 ergo had theft
93 ted of her ghat
94 tether had fog
95 go the hard fet
96 ghetto had ref
97 her het fat god
98 fared the goth
99 the fed hog rat
100 her theft dago
101 at herd the fog
102 heart dog heft
103 the ref do ghat
104 fag doth three
105 the heft go rad
106 het god father
107 her heft do tag
108 her theft goad
109 the red aft hog
110 hog read theft
111 the heft do gar
112 heft go hatred
113 her ted fog hat
114 hare dog theft
115 get her hot fad
116 heard heft got
117 her fet hat god
118 thee gad forth
119 her tet had fog
120 earth dog heft
121 her ted hog fat
122 heft go thread
123 heft to her dag
124 god fret heath
125 her het fat dog
126 goth earth fed
127 the fed rot hag
128 at hedge froth
129 go the aft herd
130 theft hog dare
131 he heft to drag
132 goer had theft
133 the fed hog tar
134 hot fed gather
135 her heft go tad
136 fed hog threat
137 her fet dog hat
138 fatted her hog
139 the hot fed rag
140 death fret hog
141 the rho tag fed
142 fort hath edge
143 her fet got dah
144 het dog father
145 her het aft god
146 rhea dog theft
147 the rho fag ted
148 daft hog there
149 her heft do gat
150 hat hedge fort
151 herd get of hat
152 hag ford teeth
153 go her deft hat
154 hard feet goth
155 the ref dot hag
156 heath dog fret
157 red theft hog a
158 thee ford ghat
159 her hot fed tag
160 hard theft ego
161 the dog her fat
162 ted frog heath
163 the hot fed gar
164 head fret goth
165 fad get the rho
166 dah frog teeth
167 he heft to grad
168 forge hath ted
169 the ref hog tad
170 tag heed forth
171 her hot ted fag
172 hat edge froth
173 he get fort had
174 heft get hoard
175 her fet do ghat
176 other deft hag
177 her het aft dog
178 that forged he
179 her fed hog tat
180 daft goth here
181 her fed tot hag
182 thee froth dag
183 he got hard fet
184 goa herd theft
185 the ref tag hod
186 dear theft hog
187 her deft goth a
188 theft hoe drag
189 oft get her dah
190 hat freed goth
191 the hot ref dag
192 hero gad theft
193 hog her deft at
194 heft go dearth
195 he got fret had
196 fate herd goth
197 gad to her heft
198 thee graft hod
199 got her het fad
200 hag rode theft
201 red heft go hat
202 daft hog three
203 the fet hog rad
204 hart feed goth
205 her hot fed gat
206 hard fete goth
207 the hot ref gad
208 ted fog hearth
209 get of the hard
210 theta herd fog
211 get her aft hod
212 hated het frog
213 get he doth far
214 thee gad froth
215 red heft to hag
216 het forged hat
217 hot ref get dah
218 god heft hater
219 the fed or ghat
220 hot hedge fart
221 he get ford hat
222 other fed ghat
223 her fet dot hag
224 fed hog hatter
225 her het tod fag
226 hag redo theft
227 he go het draft
228 dear heft goth
229 her fet hog tad
230 hot hedge raft
231 the het rod fag
232 aged het forth
233 het herd go fat
234 het frog death
235 the fet rag hod
236 theft gear hod
237 oh he get draft
238 goth read heft
239 he fat red goth
240 hat defer goth
241 red goth heft a
242 hag feed troth
243 hog her aft ted
244 hearth dog fet
245 the het of drag
246 hot hedge frat
247 her theft god a
248 gofer hath ted
249 het herd to fag
250 theft gore dah
251 het herd of tag
252 hater dog heft
253 go the fret had
254 three goth fad
255 he do het graft
256 hot heed graft
257 the dot her fag
258 trade heft hog
259 red hog heft at
260 theft rage hod
261 he get daft rho
262 fag doth ether
263 he go deft hart
264 fart heed goth
265 the tod ref hag
266 gat heed forth
267 the fog her tad
268 theft hoe grad
269 het ted for hag
270 hot heft grade
271 got the ref had
272 oft hath greed
273 he fart het god
274 deft hearth go
275 the het fog rad
276 goat herd heft
277 he do theft rag
278 dare heft goth
279 het fed go hart
280 feat herd goth
281 he got fed hart
282 tag heed froth
283 he got her daft
284 raft heed goth
285 her tet fag hod
286 gear doth heft
287 her fet tag hod
288 hot ghee draft
289 the rho gad fet
290 dah fog tether
291 the aft her god
292 hotter fed hag
293 her hot fet dag
294 fet hog hatred
295 the heft or dag
296 hag teed forth
297 the red tho fag
298 frat heed goth
299 het red of ghat
300 oft hedge hart

### starwars:titles

input: Star Wars
category: titles
phrases 1 to 9 of 9

1 stars war
2 stars raw
3 straw ras
4 rats wars
5 straw ars
6 arts wars
7 tsar wars
8 warts ras
9 warts ars

### breakingbad:titles

input: Breaking Bad
category: titles
phrases 1 to 300 of 300

1 daring kebab
2 an baked brig
3 an grab be kid
4 brigade bank
5 i bank badger
6 kind a be grab
7 baked baring
8 i barged bank
9 an brag be kid
10 bread baking
11 bridge bank a
12 big be an dark
13 bared baking
14 bed barking a
15 dark bag be in
16 beard baking
17 i banged bark
18 an bag be dirk
19 dab breaking
20 i banked grab
21 an bark be dig
22 abed barking
23 i grabbed kan
24 an bar beg kid
25 bead barking
26 i barked bang
27 an garb be kid
28 bade barking
29 kinda be grab
30 kind a beg bar
31 brigand bake
32 big bank dear
33 kind a be garb
34 abed braking
35 big read bank
36 an gib be dark
37 bead braking
38 i braked bang
39 an bra beg kid
40 dirk beanbag
41 bad bear king
42 drab a be king
43 brigand beak
44 big break dna
45 dark gab be in
46 bade braking
47 big bank dare
48 big a kern bad
49 grabbed akin
50 bed braking a
51 kind a beg bra
52 bandage birk
53 kind bear bag
54 an reb bag kid
55 deb barking a
56 big ken brad a
57 ink grabbed a
58 an gab be dirk
59 kin grabbed a
60 kin a grab bed
61 die grab bank
62 bad ark beg in
63 big naked bar
64 dark a beg bin
65 baked a bring
66 bad a beg rink
67 i banked brag
68 an big ark bed
69 kid began bar
70 an keg rib bad
71 bad break gin
72 in keg bar bad
73 bad bare king
74 kind reb bag a
75 badge bark in
76 in ark bag bed
77 ride bag bank
78 big a bend ark
79 kinda be brag
80 an ark beg bid
81 brink badge a
82 an bag irk bed
83 kid bear bang
84 big ark be dna
85 in barked bag
86 in grab be dak
87 bird bank age
88 in bark be dag
89 kind bare bag
90 i bag dark ben
91 big bean dark
92 an brig be dak
93 in drag kebab
94 i grab bad ken
95 bad bake ring
96 big ken bard a
97 kind age barb
98 bad berg ink a
99 baked brag in
100 an rag ebb kid
101 i banked garb
102 bad ark be gin
103 dig bear bank
104 bad rag be ink
105 barbed a king
106 be big drank a
107 in braked bag
108 brag a ink bed
109 kinda beg bar
110 dank a be brig
111 big naked bra
112 bad rag be kin
113 bad age brink
114 kin a brag bed
115 bad rang bike
116 bad berk gin a
117 baked grab in
118 red gib bank a
119 kinda be garb
120 i bag rank bed
121 kid bean grab
122 an reb gab kid
123 big brake dna
124 kin a grab deb
125 a grind kebab
126 i be bank drag
127 bad beak ring
128 an ark bed gib
129 deb braking a
130 an keg bid bra
131 big bark dean
132 brad a be king
133 kid began bra
134 i be bag drank
135 babe rang kid
136 an big ark deb
137 bad brain keg
138 bad kerb gin a
139 die brag bank
140 big a bred kan
141 big dark bane
142 in brag be dak
143 dna grab bike
144 kin a bred bag
145 kid bare bang
146 kind ebb rag a
147 big rake band
148 in ark bag deb
149 die bang bark
150 bad kan be rig
151 baking be rad
152 an gar ebb kid
153 bank beg raid
154 kind be brag a
155 kind bear gab
156 bad gar be ink
157 bad ark being
158 an ark ebb dig
159 gran kid babe
160 an bag irk deb
161 big bake darn
162 dark a beg nib
163 bike and grab
164 brag ken bid a
165 dig break ban
166 bad gar be kin
167 bad brake gin
168 big berk and a
169 darn bag bike
170 red big bank a
171 din break bag
172 kin a garb bed
173 bread bag ink
174 i brag bad ken
175 dig bare bank
176 big a kern dab
177 big ban drake
178 kind reb gab a
179 bane grab kid
180 in ark gab bed
181 big bread kan
182 ben big dark a
183 abed bar king
184 dark a ebb gin
185 bread bag kin
186 an gab irk bed
187 bid bank gear
188 an rib beg dak
189 bed bark gain
190 big kan be rad
191 an kebab grid
192 drab a beg ink
193 bad barge ink
194 kin bag be rad
195 bead bar king
196 in bar beg dak
197 kinda beg bra
198 big kerb and a
199 die garb bank
200 in garb be dak
201 drink beg baa
202 drab a beg kin
203 bad barge kin
204 kind a ebb gar
205 big beak darn
206 bid bar an keg
207 babe rank dig
208 i be bank grad
209 bid bank rage
210 i bark bad gen
211 big knead bar
212 kin bar be dag
213 dark a ebbing
214 i gab dark ben
215 beard bag ink
216 brag a ink deb
217 ride gab bank
218 dark gen bib a
219 dab bear king
220 bad gib kern a
221 brig banked a
222 kid ben grab a
223 big bake rand
224 drink be bag a
225 babe ink drag
226 dank a beg rib
227 badge bar ink
228 kin a brag deb
229 drake bag bin
230 end big bark a
231 big beard kan
232 i garb bad ken
233 big nab drake
234 bed big rank a
235 abed big rank
236 i bag rank deb
237 bad gain berk
238 an keg rib dab
239 beard bag kin
240 bard a be king
241 rand bag bike
242 in keg bar dab
243 big baker dna
244 i bag dark neb
245 band rag bike
246 i gab rank bed
247 bad bake grin
248 i bark bag end
249 bade bar king
250 dark bang be i
251 dink bear bag
252 in bra beg dak
253 big rank bead
254 beg a rid bank
255 kid bean brag
256 bring a be dak
257 bid break nag
258 i nag bad berk
259 kin drag babe
260 kin a garb deb
261 badge bar kin
262 i bag drab ken
263 dna bag biker
264 i be gab drank
265 in barked gab
266 an keg bib rad
267 dak bar being
268 kin bra be dag
269 kind bare gab
270 kin a bred gab
271 red king baba
272 in ark gab deb
273 kid barge ban
274 drab a bin keg
275 dear bank gib
276 i rag bank bed
277 bad grab kine
278 i bed brag kan
279 gib read bank
280 an gab irk deb
281 bad ark begin
282 kin berg dab a
283 ding bake bar
284 i nag bad kerb
285 bang rid beak
286 i beg rank dab
287 kebab ran dig
288 in keg dab bra
289 drag ban bike
290 be a gird bank
291 dna brag bike
292 kid ben brag a
293 drink beg aba
294 kin a ebb grad
295 big beak rand
296 i gan bad berk
297 kind babe rag
298 an big reb dak
299 bad nag biker
300 i bag ken brad

### thegreatgatsby:titles

input: The Great Gatsby
category: titles
phrases 1 to 300 of 300

1 the tasty beggar
2 that yes get grab
3 the best a gag try
4 that baggy trees
5 the stay get grab
6 the bats try egg a
7 the baggy treats
8 that yes get brag
9 thy best a get rag
10 thy greatest bag
11 the stay get brag
12 thy brag set get a
13 the tasty bagger
14 that yes get garb
15 by egg the star at
16 that baggy steer
17 the stray get bag
18 thy star at be egg
19 that baggy reset
20 the stay get garb
21 thy best a get gar
22 the baggy taster
23 that rags get bye
24 thy best a egg art
25 that baggy ester
26 the gray get stab
27 thy tart a be eggs
28 the baggy taters
29 the gates try bag
30 thy best a rat egg
31 that gayest berg
32 the tray get bags
33 the a by start egg
34 they target bags
35 that tray be eggs
36 by egg the tart as
37 they targets bag
38 the gay get brats
39 thy tart as be egg
40 these baggy tart
41 the trays get bag
42 that egg by rest a
43 thy greatest gab
44 the gaga best try
45 that try as be egg
46 the strategy bag
47 the gay test grab
48 she try at get bag
49 these bratty gag
50 that stray be egg
51 the at by get rags
52 they best ragtag
53 the gag start bye
54 thy best a tar egg
55 better shaggy at
56 that gay beg rest
57 brag a get the sty
58 betray that eggs
59 that try egg base
60 he try at get bags
61 thy beta stagger
62 that try beg ages
63 the art by get gas
64 that stagger bye
65 that yes egg brat
66 he start by egg at
67 they stagger bat
68 the gray get tabs
69 the rat by get gas
70 they targets gab
71 the tray gets bag
72 he try at gets bag
73 they gags batter
74 that try gee bags
75 the at by rat eggs
76 the gags battery
77 the satyr get bag
78 the at by gag rest
79 they tat beggars
80 that rye get bags
81 her at by get tags
82 the strategy gab
83 that tags be grey
84 the at by gets rag
85 thy gaga betters
86 that eggs ray bet
87 her at by get stag
88 betrays that egg
89 the gay gets brat
90 the a by tart eggs
91 they stagger tab
92 the gays get brat
93 bags a get the try
94 they bets ragtag
95 that stag be grey
96 that a try eggs be
97 they tats beggar
98 that eggs rat bye
99 the at by rats egg
100 they stab tagger
101 that gray beg set
102 the at by egg arts
103 shag get battery
104 that rag gets bye
105 bet egg thy star a
106 they gag batters
107 that trays be egg
108 bag as get the try
109 that gray begets
110 by get that gears
111 he star by get tag
112 thy test garbage
113 that grey get abs
114 he try sat get bag
115 gash get battery
116 the gray gets bat
117 the a by egg tarts
118 hat beg strategy
119 that egg rest bay
120 her at by gets tag
121 battery hat eggs
122 that try beg sage
123 the tar by get gas
124 hags get battery
125 that gas grey bet
126 she try at get gab
127 that stagger bey
128 that try begs age
129 he get tryst bag a
130 they tats bagger
131 that at begs grey
132 the at by gets gar
133 thy state beggar
134 that gag be tyres
135 the sat by get rag
136 that yet beggars
137 the sty bag great
138 he gag at try best
139 ghat be strategy
140 by gas the target
141 the try as beg tag
142 better hasty gag
143 by tags the great
144 the gag as try bet
145 by greatest ghat
146 by stagger the at
147 she tag by get art
148 hag gets battery
149 by stag the great
150 bag a gets the try
151 thy taste beggar
152 that gay get rebs
153 the try as egg bat
154 beth targets gay
155 bag stage the try
156 the at by tar eggs
157 yet stagger bath
158 by gets that gear
159 he get try gas bat
160 hag bet strategy
161 the stray get gab
162 the at by egg tsar
163 baggy star teeth
164 thy a gags better
165 he tags by get art
166 battery hats egg
167 by get that rages
168 the art by get sag
169 by stagger theta
170 that at beg greys
171 he get by tart gas
172 beth target gays
173 that rye gets bag
174 he stag by get art
175 thy stagger beat
176 that satyr be egg
177 he try eggs bat at
178 tagger stay beth
179 the gay test brag
180 he rats by get tag
181 the ragtag bytes
182 the gray get bast
183 she rat by get tag
184 begat that greys
185 that gags be trey
186 he tag by get arts
187 that grays beget
188 that yes tag berg
189 her at by gag test
190 battery hast egg
191 the gray gets tab
192 her sat by get tag
193 baggy heart test
194 the grays get bat
195 the try as egg tab
196 shaggy treat bet
197 by gets that rage
198 the sat by get gar
199 thy state bagger
200 thy seat get grab
201 he get try gas tab
202 treaty egg baths
203 thy stage get bar
204 the art by gag set
205 baggy earth test
206 that grey get bas
207 she try at beg tag
208 thy tate beggars
209 that gar gets bye
210 she gag at try bet
211 thy taste bagger
212 the tray gag best
213 he try at egg stab
214 shy begat target
215 thy great set bag
216 he get sty grab at
217 tasty egg breath
218 that gags be tyre
219 he rat by get tags
220 yet stagger baht
221 thy gas be target
222 the rat by get sag
223 batty heart eggs
224 beg the gay start
225 hers tag by get at
226 tasty gather beg
227 the try begat gas
228 he rat by get stag
229 battery shat egg
230 that rags get bey
231 the sat by egg art
232 batty gags there
233 the try bates gag
234 she try at egg bat
235 hasty target beg
236 that sat beg grey
237 he gags at try bet
238 bye targets ghat
239 the stay tag berg
240 he try at gets gab
241 baggy hat street
242 the tag get brays
243 he tag by gets art
244 treaty gags beth
245 thy east get grab
246 her tat by get gas
247 baggy threat set
248 the sty beggar at
249 be the try gags at
250 batty earth eggs
251 thy tears get bag
252 she egg by tart at
253 thy tagger beast
254 thy tags be great
255 he star by get gat
256 thy tagger beats
257 that gay set berg
258 he try at beg tags
259 baggy tats there
260 that eggs tar bye
261 he try at beg stag
262 thereby tags tag
263 the gates try gab
264 the gag by rat set
265 bratty hate eggs
266 thy at be stagger
267 that res by egg at
268 thereby stag tag
269 that try gees bag
270 her at by gets gat
271 testy gather bag
272 thy stag be great
273 he tag by get tsar
274 thy tates beggar
275 that try bees gag
276 that ers by egg at
277 thy teats beggar
278 the tags get bray
279 the sat by rat egg
280 bytes gather tag
281 by start the gage
282 thy tart a bes egg
283 baggy tart sheet
284 thy a test beggar
285 her at by tat eggs
286 batty gags three
287 that tag be greys
288 the try as beg gat
289 thy teat beggars
290 the stag get bray
291 the ras by get tag
292 batty hearts egg
293 thy a beg targets
294 she try at egg tab
295 het tasty beggar
296 thy as gag better
297 she tar by get tag
298 het strategy bag
299 rest the baggy at
300 he rat by gets tag

### abbeyroad:titles

input: Abbey Road
category: titles
phrases 1 to 300 of 300

1 abroad bye
2 baby do are
3 dry a be boa
4 adore baby
5 body bear a
6 a by be road
7 abroad bey
8 boy bread a
9 bear by do a
10 beady boar
11 are bob day
12 bye or bad a
13 abode bray
14 bye board a
15 rob a be day
16 aboard bye
17 boy beard a
18 do bye bar a
19 adobe bray
20 baby do ear
21 bare by do a
22 dobby area
23 a rode baby
24 be a do bray
25 aboard bey
26 body bare a
27 a or bay bed
28 beady bora
29 bad are boy
30 bey or bad a
31 barbed ayo
32 baby do era
33 ore by bad a
34 bead boyar
35 a redo baby
36 be by do ara
37 bade boyar
38 bay be road
39 rod be bay a
40 abed boyar
41 ready a bob
42 do bey bar a
43 bayard obe
44 boar be day
45 roe by bad a
46 ray do babe
47 a by bar doe
48 bored bay a
49 a by bed oar
50 doer baby a
51 a by red boa
52 a obey brad
53 a or bay deb
54 bey board a
55 a by bed ora
56 boy dab are
57 do ebb ray a
58 broad a bye
59 do reb bay a
60 ear bob day
61 a bra do bye
62 body be ara
63 day a be orb
64 era bob day
65 a by bar ode
66 by dear boa
67 rad a be boy
68 by read boa
69 aby a be rod
70 a bob deary
71 a or ebb day
72 a obey bard
73 bye or dab a
74 barb do yea
75 ore by dab a
76 bad ear boy
77 bod be ray a
78 boa be yard
79 roe by dab a
80 by bear ado
81 a bra do bey
82 by dare boa
83 do reb aby a
84 ray do abbe
85 ebb a do rya
86 baba do rye
87 a or aby bed
88 bod bay are
89 bey or dab a
90 bared a boy
91 a or aby deb
92 bad era boy
93 bod be rya a
94 babe or day
95 by bead or a
96 rya do babe
97 bro a be day
98 ara bed boy
99 abo by red a
100 ado bar bye
101 oba by red a
102 bad bay ore
103 bor a be day
104 by bare ado
105 a by or bade
106 broad a bey
107 dry be abo a
108 bad bay roe
109 dor be bay a
110 by rode baa
111 dry be oba a
112 doe bar bay
113 by abed or a
114 boa ray bed
115 bod be yar a
116 boy dab ear
117 yod be bar a
118 beady a rob
119 yod be bra a
120 a bode bray
121 do rye bab a
122 bray be ado
123 dye or bab a
124 drab a obey
125 do ebb yar a
126 dory be baa
127 bod by are a
128 bed bay oar
129 aby a be dor
130 boy dab era
131 a by bae rod
132 bad yea rob
133 a by der boa
134 by rode aba
135 reb by oda a
136 by redo baa
137 doe bra a by
138 bad oar bye
139 a by obe rad
140 bed bay ora
141 bod by ear a
142 bored a aby
143 bod by era a
144 red boy baa
145 deb by oar a
146 bad ora bye
147 ode bra a by
148 bye baa rod
149 deb by ora a
150 by bead oar
151 ado a reb by
152 dory be aba
153 by abo der a
154 by bead ora
155 by oba der a
156 do bare bay
157 by bae dor a
158 ode bar bay
159 dey or bab a
160 bra bay doe
161 by baa doer
162 by redo aba
163 yea bob rad
164 beady a orb
165 red boy aba
166 abbe or day
167 bod aby are
168 bod bar yea
169 oar ebb day
170 rya do abbe
171 bod bay ear
172 by bode ara
173 boa bar dye
174 boa ray deb
175 bear bay do
176 ora ebb day
177 ado bar bey
178 bad yea orb
179 yea rob dab
180 bye dab oar
181 bad aby ore
182 bod bay era
183 red boa bay
184 deb bay oar
185 bye dab ora
186 dye rob baa
187 bra bay ode
188 dye bob ara
189 bad aby roe
190 deb bay ora
191 bar aby doe
192 bay or bead
193 bad boa rye
194 dye or baba
195 dab bay ore
196 ado ray ebb
197 rya bed boa
198 bra dye boa
199 bad oar bey
200 dye rob aba
201 bed aby oar
202 ado bay reb
203 dab bay roe
204 bad ora bey
205 bey baa rod
206 bay or bade
207 bed aby ora
208 yea orb dab
209 bar aby ode
210 bra aby doe
211 dye orb baa
212 be road aby
213 bod aby ear
214 rye dab boa
215 dye orb aba
216 bod baa rye
217 bey dab oar
218 bey dab ora
219 bod aby era
220 red boa aby
221 deb aby oar
222 bra aby ode
223 rod abbey a
224 dory babe a
225 aye rob bad
226 deb aby ora
227 dab aby ore
228 bora be day
229 ado aby reb
230 dab aby roe
231 rya ebb ado
232 derby boa a
233 dore baby a
234 beady a bro
235 dory abbe a
236 bad yea bro
237 ado bra bye
238 bod bar aye
239 abed or bay
240 dobby are a
241 bad aye orb
242 do aye barb
243 deb boy ara
244 aye rob dab
245 abo be yard
246 bae rob day
247 bed boyar a
248 day boa reb
249 oba be yard
250 ayo be brad
251 rod bye aba
252 oda bar bye
253 rad boa bye
254 bead or aby
255 rad aye bob
256 bade or aby
257 bad ray obe
258 by bear oda
259 der bay boa
260 abo by read
261 bod bye ara
262 beady a bor
263 oba by read
264 bod bra yea
265 bardo a bye
266 ayo be bard
267 deb boyar a
268 abo by dare
269 ado bra bey
270 ayo be drab
271 bad yea bor
272 oba by dare
273 oda bay reb
274 do year bab
275 derby abo a
276 by bare oda
277 derby oba a
278 day bar obe
279 dobby ear a
280 rod bey aba
281 dey or baba
282 oda bar bey
283 rad boa bey
284 bed bar ayo
285 do babe yar
286 bod by area
287 dobby era a
288 dab aye orb
289 bed abo ray
290 day bae orb
291 bed oba ray
292 bod be raya
293 deb boa rya
294 rad bae boy
295 dor abbey a
296 red abo bay
297 oda ray ebb
298 bod bey ara
299 red oba bay
300 do rye abba

### hanumanansh:titles

input: Hanuman Ansh
category: titles
phrases 1 to 171 of 171

1 human has nan
2 man has an hun
3 man hush anna
4 an nan has hum
5 haha man nuns
6 ham has an nun
7 an hun shaman
8 man ash an hun
9 hush an manna
10 an nan ash hum
11 human ash nan
12 ham ash an nun
13 man hush naan
14 man hush nan a
15 nah an humans
16 man hash a nun
17 manna has hun
18 nun a man shah
19 ham shun anna
20 ahh us man nan
21 anna ham huns
22 an uns man ahh
23 anna mash hun
24 hah us man nan
25 haha mans nun
26 huh nan man as
27 anna hams hun
28 ahh a man nuns
29 manna ash hun
30 nan as ham hun
31 annas ham hun
32 an uns man hah
33 sham hun anna
34 hah a man nuns
35 ham shun naan
36 nah a man huns
37 naan ham huns
38 ahh nun man as
39 naan mash hun
40 nah us ham nan
41 naan hams hun
42 an nan sum ahh
43 sham hun naan
44 nah hun man as
45 man annas huh
46 ham shun nan a
47 mans huh anna
48 hah nun man as
49 hums nah anna
50 man sun an ahh
51 man hush nana
52 a nan ham huns
53 mush nah anna
54 an nan sum hah
55 nam hush anna
56 huh a mans nan
57 manna ahh sun
58 a nan mash hun
59 manna hah sun
60 nah nuns ham a
61 mun hash anna
62 an as hunh man
63 mans huh naan
64 man sun an hah
65 hum nah annas
66 nah nun mash a
67 human sha nan
68 nah nun sham a
69 manus ahh nan
70 nah a hums nan
71 mana hash nun
72 a nan hams hun
73 sham hun nana
74 nah a mush nan
75 hums nah naan
76 an nan huh mas
77 man hansa hun
78 nah nun ham as
79 mush nah naan
80 ahh a mans nun
81 manna ahh uns
82 nah nun hams a
83 nam hush naan
84 nah nan hum as
85 manus hah nan
86 nah a mans hun
87 ham shun nana
88 hah a mans nun
89 manna hah uns
90 ham nah an sun
91 mun hash naan
92 an nun ahh mas
93 mas hunh anna
94 sham hun nan a
95 ham hansa nun
96 nam has an hun
97 nam nuns haha
98 man shun nah a
99 hum hansa nan
100 an hun nah mas
101 mana ahh nuns
102 an nun hah mas
103 mans hunh ana
104 an nan ahh mus
105 mun shah anna
106 an nan hah mus
107 mana nan hush
108 ham nah an uns
109 ham huns nana
110 an sun nam ahh
111 manna sha hun
112 nam ash an hun
113 mash hun nana
114 mans hunh an a
115 mana hah nuns
116 man sha an hun
117 mana nah huns
118 an nan sha hum
119 mana shah nun
120 an sun nam hah
121 nana nam hush
122 an ana mun shh
123 manna as hunh
124 an ash mun nah
125 hams hun nana
126 an nun ama shh
127 mans huh nana
128 an uns nam ahh
129 mas hunh naan
130 ham sha an nun
131 nam annas huh
132 an nan amu shh
133 nana mun hash
134 an uns nam hah
135 hums nah nana
136 a shun nam nah
137 nana mun shah
138 an as hunh nam
139 mush nah nana
140 nam hush nan a
141 mun shah naan
142 nam hash a nun
143 nam hansa hun
144 has an mun nah
145 masa nan hunh
146 mun hash nan a
147 mun annas ahh
148 nan nam huh as
149 mun hansa nah
150 nam sha an hun
151 mas hunh nana
152 mun shh anna a
153 mana nah shun
154 mas hunh nan a
155 mun annas hah
156 nam shah a nun
157 mun shh naan a
158 mun shah nan a
159 nam nuns ahh a
160 an sha mun nah
161 mana a shh nun
162 nam nuns hah a
163 nam huns nah a
164 nam as ahh nun
165 nam us ahh nan
166 nam as nah hun
167 nam as hah nun
168 nam us hah nan
169 mun as ahh nan
170 mun shh nana a
171 mun as hah nan

### mirzapur:titles

input: Mirzapur
category: titles
phrases 1 to 2 of 2

1 azur prim
2 i azur rpm

### thegentlemen:titles

input: The Gentlemen
category: titles
phrases 1 to 300 of 300

1 het gentlemen
2 me gentle then
3 the men let gen
4 lengthen mete
5 then meet glen
6 me net the glen
7 gentlemen eth
8 then melt gene
9 the men net leg
10 lengthen meet
11 glen theme ten
12 the ten gel men
13 men tee length
14 the ten men leg
15 gentle het men
16 the men net gel
17 glen theme net
18 me let then gen
19 gentle hen met
20 the elm net gen
21 gene helm tent
22 me net then leg
23 helmet net gen
24 me gel ten then
25 gen theme lent
26 the ten elm gen
27 tenth men glee
28 ten hen let meg
29 then mete glen
30 me then ten leg
31 ten helmet gen
32 nth men get lee
33 gentle hem ten
34 ten hen met leg
35 nee length met
36 me net then gel
37 gent helm teen
38 ten hen let gem
39 hen nettle meg
40 he get men lent
41 gentle hem net
42 ten elm get hen
43 hen nettle gem
44 nth men let gee
45 helm nett gene
46 get hen let men
47 teen meth glen
48 het men let gen
49 tenth elm gene
50 net hen let meg
51 gen helm tenet
52 ten let hem gen
53 gen hem nettle
54 net hen met leg
55 glen hem tenet
56 net hen let gem
57 me teen length
58 me let nth gene
59 glen teeth men
60 nth men get eel
61 them teen glen
62 net elm get hen
63 nth melee gent
64 the ten glen me
65 ment then glee
66 he tent men leg
67 he gentle ment
68 het men net leg
69 mel tenth gene
70 net let hem gen
71 eng ten helmet
72 me get lent hen
73 gene meth lent
74 het ten gel men
75 neg ten helmet
76 me let hen gent
77 eng net helmet
78 he gel nett men
79 neg net helmet
80 he tent men gel
81 lene tenth meg
82 nth men tee leg
83 gen hen mettle
84 het men net gel
85 lene tenth gem
86 gent he let men
87 eng theme lent
88 me he tent glen
89 gentle eth men
90 nth lee met gen
91 neg theme lent
92 me net het glen
93 them lene gent
94 me tent hen leg
95 them nene gelt
96 he met lent gen
97 gene them lent
98 he nett men leg
99 thee ment glen
100 me gee nth lent
101 nth genteel me
102 glen he met ten
103 eng helm tenet
104 nth lee net meg
105 eng hem nettle
106 nth ten gee elm
107 neg helm tenet
108 met hen let gen
109 neg hem nettle
110 me net nth glee
111 gent heel ment
112 nth men tee gel
113 eng hen mettle
114 he net men gelt
115 neg hen mettle
116 nth lee net gem
117 gent meth lene
118 he net lent meg
119 gelt meth nene
120 me tee nth glen
121 ghee lent ment
122 me gel nth teen
123 nth eel met gen
124 he net lent gem
125 me gel nett hen
126 me tent hen gel
127 glen he met net
128 nth elm net gee
129 me he nett glen
130 nth eel net meg
131 he tent elm gen
132 gel hen met ten
133 me nett hen leg
134 het elm net gen
135 gen he melt ten
136 nth eel net gem
137 he net elm gent
138 leg hem ten net
139 me net hen gelt
140 gel hen met net
141 gen he melt net
142 nth elm tee gen
143 eng me let then
144 mel the ten gen
145 ten het men leg
146 ten lee nth meg
147 neg me let then
148 gel hem ten net
149 ten lee nth gem
150 he nett elm gen
151 mel the net gen
152 the ten elm eng
153 the ten elm neg
154 the men tel gen
155 the lent gen me
156 the net elm eng
157 tet men gel hen
158 nee nth let meg
159 the net elm neg
160 nee nth leg met
161 nee nth let gem
162 ment he let gen
163 me eng the lent
164 nee nth elm get
165 ten nth eel meg
166 eng he met lent
167 eng he melt ten
168 mel he tent gen
169 me neg the lent
170 ten het elm gen
171 ten nth eel gem
172 neg he met lent
173 neg he melt ten
174 mel he net gent
175 eng the let men
176 ment he net leg
177 me tel then gen
178 nee nth gel met
179 ment he gel ten
180 neg the let men
181 eng he melt net
182 eth me net glen
183 neg he melt net
184 he mel ten gent
185 he ment ten leg
186 eng he tent elm
187 ment he net gel
188 mel he nett gen
189 me ten het glen
190 neg he tent elm
191 me eth ten glen
192 eng let met hen
193 ten men eth leg
194 me ten nth glee
195 neg let met hen
196 he ten men gelt
197 he ten lent meg
198 me teen nth leg
199 he ten lent gem
200 eng hem let ten
201 neg hem let ten
202 me lee nth gent
203 net men eth leg
204 eng he nett elm
205 me tel nth gene
206 ten men eth gel
207 neg he nett elm
208 eng hem let net
209 he ten elm gent
210 me eng het lent
211 ten hen tel meg
212 neg hem let net
213 me ten hen gelt
214 gen eth let men
215 ten mel nth gee
216 tel hen met gen
217 me neg het lent
218 ten hen tel gem
219 net men eth gel
220 get hen mel ten
221 men tel nth gee
222 the ten mel eng
223 ten mel het gen
224 eng het let men
225 get hen tel men
226 the ten mel neg
227 the men tel eng
228 men tel het gen
229 me tele nth gen
230 net hen tel meg
231 neg het let men
232 me teel nth gen
233 me het lent gen
234 net mel nth gee
235 the men tel neg
236 net hen tel gem
237 leg hen men tet
238 get hen mel net
239 the net mel eng
240 net mel het gen
241 nth lene me get
242 ten elm eth gen
243 me nee nth gelt
244 the net mel neg
245 me nth eel gent
246 tee mel nth gen
247 net elm eth gen
248 gen hem tel ten
249 eng nth lee met
250 neg nth lee met
251 nee tel nth meg
252 nee tel nth gem
253 gen hem tel net
254 he tent mel eng
255 eng het elm ten
256 eng nth eel met
257 he tent mel neg
258 neg het elm ten
259 neg nth eel met
260 me tel eng then
261 eng eth let men
262 gen hen elm tet
263 me tel neg then
264 gent he tel men
265 neg eth let men
266 eng het elm net
267 mel eng het ten
268 me eth lent gen
269 me he lent gent
270 neg het elm net
271 mel neg het ten
272 tel eng het men
273 tel eng ten hem
274 tel neg het men
275 tel neg ten hem
276 he nett mel eng
277 mel eng het net
278 eng nth elm tee
279 he nett mel neg
280 eth eng ten elm
281 mel neg het net
282 tel eng net hem
283 neg nth elm tee
284 eth neg ten elm
285 tel eng met hen
286 tel neg net hem
287 glen he men tet
288 tel neg met hen
289 mel eng nth tee
290 eth eng net elm
291 eng he let ment
292 mel neg nth tee
293 eth neg net elm
294 he ment tel gen
295 neg he let ment
296 gen hen mel tet
297 me eth eng lent
298 nee nth mel get
299 me eth neg lent
300 gen eth mel ten

### toxic:titles

input: Toxic
category: titles
phrases 1 to 1 of 1

1 it cox

### spidermanbrandnewday:titles

input: Spider-Man: Brand New Day
category: titles
phrases 1 to 300 of 300

1 an band rewarded my spin
2 my dead warren band spin
3 my dear band warned spin
4 an brad wandered my spin
5 my dear warden band spin
6 my dead warner band spin
7 my dead barn warned spin
8 my dear band wander spin
9 my dead banner draw spin
10 an randy mind spread web
11 my banned dear draw spin
12 my dead warden spin barn
13 my dead barn wander spin
14 my earned band draw spin
15 my dead barren dawn spin
16 my dead banner ward spin
17 my bad dna spin wanderer
18 my banned dear ward spin
19 my banned ward read spin
20 my banned dare draw spin
21 an randy spider damn web
22 my drawn dean bread spin
23 my banned red award spin
24 my banner war added spin
25 my bad nan rewarded spin
26 my dead bran warned spin
27 an randy mind spared web
28 an drawn bad remedy spin
29 my ended barn award spin
30 my banned ward dare spin
31 my earned dad spin brawn
32 my banned war dared spin
33 an bard wandered my spin
34 an dry damn sprained web
35 an drab wandered my spin
36 my drawn dean beard spin
37 my dead warden spin bran
38 an merry bad dawned spin
39 my dead bran wander spin
40 an damned derby war spin
41 my dead wand spin barren
42 my banned war dread spin
43 my dear barn dawned spin
44 an randy mind drapes web
45 my darned dawn bear spin
46 an sandy draper mind web
47 an mad derby warned spin
48 my banded dear warn spin
49 an damp yards web dinner
50 my near brad dawned spin
51 by rewarded an damn spin
52 an damn yard brewed spin
53 my darned ben award spin
54 my rare band dawned spin
55 my barred dean dawn spin
56 an darned spray mind web
57 my drawn bad neared spin
58 an damn spray ridden web
59 my near brawn added spin
60 an randy rip demands web
61 an mad warden spin derby
62 an wedded army spin barn
63 an dry panda reminds web
64 my banner dad spin dewar
65 my dear brand waned spin
66 my raw banner added spin
67 an mad derby wander spin
68 my ended bran award spin
69 my dearer dawn band spin
70 an dandy warmer bed spin
71 an armed derby dawn spin
72 by reward an damned spin
73 my deader band warn spin
74 my banded dare warn spin
75 my drawn bean dared spin
76 my earned brawn add spin
77 an drawn bye madder spin
78 an randy padres mind web
79 my rear band dawned spin
80 an randy pad reminds web
81 an amber daddy spin wren
82 an dreamy drew band spin
83 my banded ward near spin
84 my banned raw dared spin
85 an damned yard brew spin
86 an randy damn prides web
87 my bended award ran spin
88 my bad errand waned spin
89 my near brand waded spin
90 my drained snap darn web
91 my banned adder war spin
92 an wedded ban marry spin
93 an mere daddy spin brawn
94 an randy pads remind web
95 my darned bean draw spin
96 my drab dean warned spin
97 an bended army draw spin
98 an dry bam wandered spin
99 an dandy dream brew spin
100 an dry sandman pride web
101 my darned dawn bare spin
102 my earned drab dawn spin
103 by spin an damned drawer
104 my banded wear darn spin
105 my dear bran dawned spin
106 an warm dandy breed spin
107 an darned minds pray web
108 an randy padre minds web
109 my banner dada spin drew
110 my drawn dread bean spin
111 an bandy drew dream spin
112 an warmed brad deny spin
113 an dry pandas remind web
114 my dread ban warned spin
115 my barren dad waned spin
116 my darned wand bear spin
117 my red panda web innards
118 an dreamy bend draw spin
119 an warmed yard bend spin
120 an raw damned spin derby
121 an raw derby demand spin
122 my banned radar wed spin
123 my raped dna web innards
124 an dandy drew spin amber
125 an bedded army warn spin
126 my banned raw dread spin
127 an dewy dream brand spin
128 an damned sprain dry web
129 an dry sprain demand web
130 an randy drips named web
131 my dreaded ban warn spin
132 my banned radar spin dew
133 my bared dna warned spin
134 an inner daddy ramps web
135 my darned barn wade spin
136 my drab dean spin warden
137 an dry amber dawned spin
138 an drawn amber eddy spin
139 an banded army spin drew
140 an drawn dry beamed spin
141 an damn rinds prayed web
142 an myriad darn spend web
143 my deader barn dawn spin
144 my darned ward bean spin
145 my darned wan bread spin
146 an bended army ward spin
147 an mad berry dawned spin
148 an randy damned rips web
149 an randy rips demand web
150 my darned snap drain web
151 an dandy rap reminds web
152 my barred wand spin dean
153 my darned red spin nawab
154 my drab dean wander spin
155 my wan barren added spin
156 an bended yard warm spin
157 an mad dandy spin brewer
158 an darned mind prays web
159 my dread warden ban spin
160 an wry damned bread spin
161 an wry demand bread spin
162 my wanderer and bad spin
163 my banded ward earn spin
164 my drawn bane dared spin
165 my drained rand snap web
166 an dyed warmer band spin
167 an dreamy ward bend spin
168 my bare darn dawned spin
169 an wedded army spin bran
170 an merry band waded spin
171 an damned drew bray spin
172 my dread ban wander spin
173 my banded rear dawn spin
174 my bared dna spin warden
175 an drawn dame spin derby
176 an damn dewar spin derby
177 an damned rinds pray web
178 my banded rand wear spin
179 my near bard dawned spin
180 an barren daddy mew spin
181 an damn berry waded spin
182 an raspy damn ridden web
183 an warmed dna spin derby
184 my dearer wand band spin
185 my drained span darn web
186 an wry bad remanded spin
187 an damp yard web dinners
188 my darned bane draw spin
189 my bare dander dawn spin
190 my bared dna wander spin
191 my darned pains darn web
192 my near drab dawned spin
193 my banner dewar add spin
194 an armed dandy brew spin
195 an armed wand spin derby
196 an bawdy nerd dream spin
197 an randy minds drape web
198 my awed errand band spin
199 my darned wan beard spin
200 my weaned darn brad spin
201 my dread dean spin brawn
202 an wry bar demanded spin
203 my beaded darn warn spin
204 my drained pans darn web
205 an dyed brawn dream spin
206 an dandy sperm drain web
207 an minded spray darn web
208 my drawn bane dread spin
209 an armed drew bandy spin
210 an warmed dye brand spin
211 an dry dramas pinned web
212 spin band my earned ward
213 my darned bead warn spin
214 an randy amends drip web
215 an wry damned beard spin
216 an wry demand beard spin
217 an randy spin madder web
218 an myriad rand spend web
219 my dread warden nab spin
220 an redder bawdy man spin
221 an damn rind sprayed web
222 my banner wad dared spin
223 my drawn adder bean spin
224 an dandy arm brewed spin
225 an warmed red bandy spin
226 an damned wad berry spin
227 an dandy par reminds web
228 an dry madras pinned web
229 an randy maps ridden web
230 my darned wand bare spin
231 my darned dna sprain web
232 my earned wand spin drab
233 an bedded wan marry spin
234 my darned anna drips web
235 my wan dander bread spin
236 an banded wed marry spin
237 an warmed barn eddy spin
238 an dreamy dawn bred spin
239 my darned bane ward spin
240 spin brad my earned dawn
241 my deader wan brand spin
242 my banned raw spin adder
243 an dreamy wed brand spin
244 my bare rand dawned spin
245 my red dander spin nawab
246 my darned span drain web
247 an banded dew marry spin
248 an barmy red dawned spin
249 an randy dam brewed spin
250 an damn dyad spin brewer
251 an damned pry drains web
252 an dry mandarin sped web
253 my barren dna waded spin
254 we ready damn brand spin
255 my drained naps darn web
256 an warmed dyer band spin
257 an mad bawdy render spin
258 an dreamy dew brand spin
259 an wary damned bred spin
260 an wary demand bred spin
261 an dandy warmer spin deb
262 an dandy ember draw spin
263 an drab dawn remedy spin
264 an drawn yard embed spin
265 spin band my darned wear
266 my dread brand wean spin
267 my darned pan drains web
268 my barren add waned spin
269 an armed brawn eddy spin
270 an warm dyad spin bender
271 an many dander drips web
272 an dandy spar remind web
273 an sandy ramp ridden web
274 my darned bar waned spin
275 my darned pans drain web
276 my drained rand span web
277 an randy ward embed spin
278 my darned bade warn spin
279 my banner wad dread spin
280 my darned bran wade spin
281 my darned nap drains web
282 my darned pains web rand
283 an damn reynard dips web
284 an damned rind spray web
285 an raspy dander mind web
286 an dandy raps remind web
287 an drawn mead spin derby
288 my deader wand spin barn
289 my weaned rand brad spin
290 my deader bran dawn spin
291 an bended wad marry spin
292 an damned dinars pry web
293 an raw derby madden spin
294 an randy rapids mend web
295 my beaded rand warn spin
296 my bended radar wan spin
297 my drained rand pans web
298 my dread innards pan web
299 an drawn remedy dab spin
300 an spry damned drain web

### youcanseeeverything:titles

input: You Can See Everything
category: titles
phrases 1 to 300 of 300

1 your even eye can sight
2 his every cut gonna eye
3 you sign the craven eye
4 his on century gave eye
5 his no century gave eye
6 you sing the craven eye
7 this very cue gonna eye
8 the young cavern is eye
9 it eye your seven chang
10 the young craven is eye
11 our nancy gives the eye
12 this very ocean gun eye
13 your in stench gave eye
14 the in sugar convey eye
15 you eye the given narcs
16 the angry sun voice eye
17 i gonna these curvy eye
18 its on urgency have eye
19 its no urgency have eye
20 this one guy cavern eye
21 this one craven guy eye
22 this very nuance go eye
23 your even chang sit eye
24 your chang even its eye
25 the suave no eye crying
26 the venous crying eye a
27 her out nancy gives eye
28 you caving her sent eye
29 the none vicar guys eye
30 you canst her given eye
31 your ten given cash eye
32 this over nance guy eye
33 us eye the angry novice
34 those in guy cavern eye
35 our any stench give eye
36 your in chest eye vegan
37 those in craven guy eye
38 us crayon the given eye
39 this very gun canoe eye
40 this even acorn guy eye
41 the sour nancy give eye
42 the in ounces eye gravy
43 he caving your sent eye
44 your sent chin gave eye
45 your sent inch gave eye
46 you scant her given eye
47 his very nuance got eye
48 his urgent a convey eye
49 he canst your given eye
50 the in agony curves eye
51 our then yes caving eye
52 his even carton guy eye
53 the naive guys corn eye
54 our even city hangs eye
55 the nice savory gun eye
56 her nasty gun voice eye
57 this none guy carve eye
58 she caving your ten eye
59 he scant your given eye
60 their coven guys an eye
61 his young vent care eye
62 our given yes chant eye
63 her sunny coat give eye
64 our even sign yacht eye
65 his young nerve act eye
66 his even cantor guy eye
67 our casing envy the eye
68 her one cavity guns eye
69 i eye our seventy chang
70 this none guy crave eye
71 this one yang curve eye
72 very gonna his cute eye
73 the in survey conga eye
74 the sonic guy raven eye
75 you eye this craven gen
76 your each sign vent eye
77 our even yacht sing eye
78 the in argus convey eye
79 your net given cash eye
80 his young nerve cat eye
81 your each vent sing eye
82 thy sure vice gonna eye
83 he cavern its young eye
84 the saucy in govern eye
85 us convey her giant eye
86 he eye its young craven
87 the scary noun give eye
88 his out nancy verge eye
89 an very ounce eye sight
90 our even tying cash eye
91 his even contra guy eye
92 his angry eve count eye
93 ours give the canny eye
94 your then gin caves eye
95 your even tis eye chang
96 the angry uns voice eye
97 our then case vying eye
98 the none vicars guy eye
99 its huge over eye nancy
100 the young vans rice eye
101 an very enough eye tics
102 your cent eye his vegan
103 thy in vegan course eye
104 the nice ovary guns eye
105 its very ocean hung eye
106 their vague no sync eye
107 never act his young eye
108 an out singer chevy eye
109 this vague none cry eye
110 his curvy one eye agent
111 his young ten carve eye
112 you gins the craven eye
113 his very tung eye ocean
114 her canny out gives eye
115 her out casing envy eye
116 the in scurvy eye genoa
117 the naive guy scorn eye
118 the on saucer vying eye
119 an out cheers vying eye
120 your sen caving the eye
121 her gone cavity sun eye
122 this even guano cry eye
123 her in cunts voyage eye
124 the no saucer vying eye
125 her one sung eye cavity
126 the sugary in eye coven
127 his young ten crave eye
128 eye craves the young in
129 never cat his young eye
130 your ninth sec gave eye
131 her sunny taco give eye
132 your nice vet hangs eye
133 his young vent race eye
134 your in techs eye vegan
135 thy in cause govern eye
136 she caving your net eye
137 your sec haven ting eye
138 your in tech eye vegans
139 you sight never can eye
140 you eye his craven gent
141 your ten chins gave eye
142 its each gunny eye over
143 your ten vice hangs eye
144 the noisy gun carve eye
145 those naive gun cry eye
146 the curvy no gaines eye
147 her given cos eye aunty
148 our casing even thy eye
149 our heavy cent sign eye
150 his craven guy note eye
151 the canny sour give eye
152 the curvy one gains eye
153 the naive guy corns eye
154 the noisy gun crave eye
155 his cute none eye gravy
156 the union sec eye gravy
157 the young sen eye vicar
158 our heavy cent sing eye
159 his grave yen count eye
160 her youngest in eye vac
161 his young vet crane eye
162 his every canto gun eye
163 his even nougat cry eye
164 your even tic hangs eye
165 it gonna such every eye
166 the vague iron sync eye
167 eye carves the young in
168 thy on given eye saucer
169 the nice nous eye gravy
170 the nicer savoy gun eye
171 our sec tying eye haven
172 the nice sung eye ovary
173 his cut agony nerve eye
174 this angry oven cue eye
175 thy sure canon give eye
176 your even gin chats eye
177 on eye the suave crying
178 the curvy no eye easing
179 thy no given eye saucer
180 the nice rung eye savoy
181 your even chi eye angst
182 her antsy gun voice eye
183 thy seven in eye cougar
184 her noisy cunt gave eye
185 your veg eye this nance
186 your nth given eye case
187 thy sure one caving eye
188 this very guan cone eye
189 his very tune conga eye
190 the nary gun voices eye
191 the young raven sic eye
192 our aching yes vent eye
193 the angry nous eye vice
194 his craven guy tone eye
195 the craven ion guys eye
196 our each sting envy eye
197 our each sent vying eye
198 the grey son eye vicuna
199 this cagey nun eye over
200 his very cunt eye genoa
201 her gay venison cut eye
202 its every nacho gun eye
203 the saucy oven ring eye
204 this coy run avenge eye
205 her one snug eye cavity
206 our shiny cent gave eye
207 his corny tune gave eye
208 easy eye the curving no
209 your each gin vents eye
210 the inane scurvy go eye
211 this even cur eye agony
212 its honey gun carve eye
213 his young net carve eye
214 your sent veg eye china
215 us eye the grainy coven
216 the coy using raven eye
217 the curvy ones gain eye
218 its very canoe hung eye
219 his every canon gut eye
220 your nigh sent cave eye
221 your sent chi eye vegan
222 this none gravy cue eye
223 thy in ounces grave eye
224 our in vegan scythe eye
225 your then vegan sic eye
226 his curt agony even eye
227 her cut agony veins eye
228 thy one using carve eye
229 the rainy cove guns eye
230 his young vcr eaten eye
231 its young eve ranch eye
232 its vogue eye her nancy
233 the scary union eye veg
234 his cut envoy anger eye
235 his very tung canoe eye
236 your sent veg chain eye
237 she gave in eye country
238 its honey gun crave eye
239 his young net crave eye
240 his even gut crayon eye
241 his cut envoy range eye
242 us have once trying eye
243 an grey hunt voices eye
244 this coy geneva run eye
245 the nosey vicar gun eye
246 thy in vegan source eye
247 thy on genius carve eye
248 her on genus eye cavity
249 the cis young raven eye
250 thy one using crave eye
251 his cute organ envy eye
252 her union cyst gave eye
253 our icy events hang eye
254 once eye this very guan
255 the scary inn eye vogue
256 an out reigns chevy eye
257 the canny sir eye vogue
258 thy no genius carve eye
259 her no genus eye cavity
260 our given cents hay eye
261 i conveys her gaunt eye
262 the cosy ravine gun eye
263 this cagey oven run eye
264 our canes vying the eye
265 your even chi eye gnats
266 thy on genius crave eye
267 the craven sion guy eye
268 the curvy nose gain eye
269 our even cyan sight eye
270 the sunny ego eye vicar
271 her tangy sun voice eye
272 never eye his cut agony
273 her nuts vice eye agony
274 his angry cove tune eye
275 his canny out verge eye
276 i have song eye century
277 your sent chang vie eye
278 your net chins gave eye
279 thy even coin sugar eye
280 his every nut conga eye
281 thy no genius crave eye
282 his tangy one curve eye
283 our given scent hay eye
284 your net vice hangs eye
285 an eight survey con eye
286 your nigh case vent eye
287 his very cent eye guano
288 your cis then eye vegan
289 the yon using carve eye
290 our heavy cents gin eye
291 the craven ions guy eye
292 her noisy vegan cut eye
293 our seven gin yacht eye
294 your scant hen give eye
295 thy in sauce govern eye
296 the on vicuna greys eye
297 our aching set envy eye
298 our even gin yachts eye
299 the no vicuna greys eye
300 his ten agony curve eye

### theodyssey:titles

input: The Odyssey
category: titles
phrases 1 to 119 of 119

1 het odyssey
2 they sod yes
3 he do sty yes
4 odyssey eth
5 they ods yes
6 he so dye sty
7 thy yes does
8 he so dey sty
9 she toys dye
10 yet does shy
11 shot dye yes
12 thy eyed sos
13 he toys dyes
14 they dye sos
15 she toy dyes
16 thy yes dose
17 yet shod yes
18 yes host dye
19 do thy yeses
20 dyes the soy
21 yet shy dose
22 dot shy eyes
23 sod thy eyes
24 yet shed soy
25 shed yes toy
26 thy eyes dos
27 shy dote yes
28 tod shy eyes
29 dots shy eye
30 tosh dye yes
31 hot yes dyes
32 seed shy toy
33 ods thy eyes
34 doss thy eye
35 dye toes shy
36 sods thy eye
37 seed thy soy
38 they so dyes
39 hes toys dye
40 yet dyes hos
41 dyes toe shy
42 dyes set hoy
43 dye shoe sty
44 dye sets hoy
45 hes toy dyes
46 seedy to shy
47 dye hose sty
48 sty heed soy
49 eyed shy sot
50 dost shy eye
51 sty seed hoy
52 dye hoes sty
53 shod sty eye
54 yes tho dyes
55 dots hey yes
56 dyes hoe sty
57 yet doss hey
58 dey shot yes
59 yet sods hey
60 thy seedy so
61 eyed hos sty
62 teed shy soy
63 dost hey yes
64 dee shy toys
65 dye hey toss
66 dyes het soy
67 does hey sty
68 dose hey sty
69 dees shy toy
70 seedy oh sty
71 hod sty eyes
72 dey she toys
73 dos they yes
74 dots yeh yes
75 dees thy soy
76 dyes hey sot
77 shod yes tye
78 they dey sos
79 dey toes shy
80 yod shy tees
81 dey yes host
82 they yod ess
83 dye yes hots
84 yeh yet doss
85 dey hey toss
86 dost yeh yes
87 yod hey sets
88 yeh yet sods
89 dey shoe sty
90 does tye shy
91 dye shes toy
92 dey sets hoy
93 dye yeh toss
94 dey hose sty
95 dose tye shy
96 dey yes tosh
97 does yeh sty
98 shed tye soy
99 sees thy yod
100 dose yeh sty
101 dey hoes sty
102 hots dey yes
103 dey hes toys
104 eyed sho sty
105 dyes eth soy
106 dyes yeh sot
107 dyes yet sho
108 dyes tye hos
109 dey shes toy
110 dey yeh toss
111 yod yeh sets
112 sods hey tye
113 dees hoy sty
114 doss hey tye
115 yod shes yet
116 sods yeh tye
117 dyes tye sho
118 doss yeh tye
119 yod shes tye

### practicalmagic:titles

input: Practical Magic 2
category: titles
phrases 1 to 300 of 300

1 magic arctic pal
2 magic at clip car
3 i act car calm pig
4 magic arctic lap
5 magic clip cart a
6 i cat car calm pig
7 impact caca girl
8 calm critic gap a
9 i act mac cap girl
10 cigar claim pact
11 tragic pic calm a
12 i cat mac cap girl
13 gap claim arctic
14 tragic a clip mac
15 i act cam cap girl
16 grip acclaim act
17 magic car act lip
18 i cat cam cap girl
19 gala camp critic
20 magic car cat lip
21 i cap it calm crag
22 galactic a crimp
23 tragic a clip cam
24 i act car clam pig
25 magic clip carat
26 i cap tragic calm
27 i cat car clam pig
28 grip acclaim cat
29 magic lit cap car
30 i cap car calm git
31 tragic claim cap
32 tragic mic clap a
33 i act cap calm rig
34 pig acclaim cart
35 magic clip arc at
36 i act arc calm pig
37 act caca pilgrim
38 camp critic lag a
39 i cat cap calm rig
40 magic lactic rap
41 magic car til cap
42 i cat arc calm pig
43 cigar impact lac
44 magic crit clap a
45 i calm pic tag car
46 cat caca pilgrim
47 it caca camp girl
48 i clip car tag mac
49 git acclaim crap
50 i calm arctic gap
51 i act car clip mag
52 cacti map garlic
53 magic car pal tic
54 i calm tic gap car
55 magic arctic alp
56 lactic a camp rig
57 i clip car tag cam
58 cacti camp grail
59 lactic a gimp car
60 i cat car clip mag
61 magical crap tic
62 tragic pic clam a
63 i act mic crap gal
64 galactic mac rip
65 lactic a pig marc
66 i act car clip gam
67 magic lactic par
68 lactic a grip mac
69 i cap it clam crag
70 cacti palm cigar
71 i camp arctic gal
72 i cat mic crap gal
73 galactic car imp
74 magic car tip lac
75 i clap mic tag car
76 rig acclaim pact
77 i clap tragic mac
78 i act mac clap rig
79 arctic clap magi
80 it crap magic lac
81 i act pac calm rig
82 galactic cam rip
83 i calm tragic pac
84 i act pic calm rag
85 critical cap mag
86 magic car lap tic
87 i act mac clip rag
88 prig acclaim act
89 magic car pit lac
90 i cat car clip gam
91 tragic claim pac
92 lactic a grip cam
93 i talc car pig mac
94 grit acclaim cap
95 i clap tragic cam
96 i cat mac clap rig
97 tragic pica calm
98 magic lip arc act
99 i cat pac calm rig
100 magical cart pic
101 i cap tragic clam
102 i cat pic calm rag
103 prig acclaim cat
104 magic car til pac
105 i act cam clap rig
106 aga clamp critic
107 i camp tragic lac
108 i cap car clam git
109 galactic arm pic
110 lactic a cram pig
111 i cat mac clip rag
112 trig acclaim cap
113 magic lip arc cat
114 i act cap clam rig
115 galactic cap rim
116 grim cacti clap a
117 i camp tic lag car
118 critical cap gam
119 magic lac act rip
120 i act arc clam pig
121 magical cap crit
122 i camp arctic lag
123 i act cam clip rag
124 galactic rap mic
125 it caca calm grip
126 i act mic crap lag
127 gap critical mac
128 magic lac cat rip
129 i act lac camp rig
130 crag acclaim tip
131 arctic a gimp lac
132 i talc car pig cam
133 git acclaim carp
134 magic lit cap arc
135 i cat cam clap rig
136 tragic mica clap
137 grim at caca clip
138 i act car gimp lac
139 camp italic crag
140 pig arctic calm a
141 i act marc pig lac
142 magic tic carpal
143 magic arc til cap
144 i cat cap clam rig
145 lactic map cigar
146 i clam arctic gap
147 i cat arc clam pig
148 galactic ram pic
149 lit mac cap cigar
150 i cat cam clip rag
151 crag acclaim pit
152 i clap arctic mag
153 i cat mic crap lag
154 gap acclaim crit
155 pat mic caca girl
156 i cat lac camp rig
157 gap critical cam
158 lit cam cap cigar
159 it cap car lag mic
160 gap climatic car
161 i camp lactic rag
162 i clam pic tag car
163 magical carp tic
164 it carp magic lac
165 i act mac grip lac
166 critical pac mag
167 i clam tragic pac
168 i act pic calm gar
169 galactic par mic
170 calm tip caca rig
171 i cat car gimp lac
172 tragic limp caca
173 magic tic arc pal
174 i arc cap calm git
175 grit acclaim pac
176 lactic a arc gimp
177 i cat marc pig lac
178 capital mic crag
179 calm pit caca rig
180 i act mac clip gar
181 cacti crimp gala
182 i crap lactic mag
183 i cap tic calm rag
184 galactic mar pic
185 magic lac arc tip
186 i act mic clap rag
187 trig acclaim pac
188 it cap mac garlic
189 i cat mac grip lac
190 galactic cramp i
191 magic tic arc lap
192 i cat pic calm gar
193 tragic pica clam
194 i clap arctic gam
195 i clam tic gap car
196 lactic crap magi
197 magic it clap car
198 i act cam grip lac
199 galactic pac rim
200 i gap lactic marc
201 i cat mac clip gar
202 critical pac gam
203 magic lac arc pit
204 a act mic cap girl
205 magical pac crit
206 i camp lactic gar
207 i cart mac pig lac
208 galactic arc imp
209 i cap lactic gram
210 i cat mic clap rag
211 climatic cap gar
212 grim act caca lip
213 i act cam clip gar
214 lactic amp cigar
215 lit pac arc magic
216 i arc pic calm tag
217 rag climatic cap
218 calm rip caca git
219 i cart mic cap gal
220 climatic pac gar
221 magic lac rat pic
222 i arc mac clip tag
223 gap climatic arc
224 it caca calm prig
225 i cat cam grip lac
226 lactic carp magi
227 it caca grim clap
228 i act lac cram pig
229 lactic pica gram
230 camp lit caca rig
231 a calm car pig tic
232 lactic crimp aga
233 it cap cam garlic
234 a cat mic cap girl
235 rag climatic pac
236 apt mic caca girl
237 i act mic carp gal
238 cig capital marc
239 magic arc til pac
240 i cat cam clip gar
241 cigar cacti lamp
242 lit car caca gimp
243 i arc tic calm gap
244 garlic mica pact
245 limp car caca git
246 i cart cam pig lac
247 maga arctic clip
248 mat pic caca girl
249 i cat lac cram pig
250 pam lactic cigar
251 grim cat caca lip
252 i cat mic carp gal
253 gama arctic clip
254 lit marc caca pig
255 i arc cam clip tag
256 garlic cacti amp
257 limp act caca rig
258 i act mic pal crag
259 girl piccata mac
260 garlic i camp act
261 i cap tic calm gar
262 cig acclaim part
263 gilt mica cap car
264 i talc mic gap car
265 galactic cap mir
266 i crap lactic gam
267 i crap tic lag mac
268 magical cap tric
269 lit mac caca grip
270 i act pac clam rig
271 cigar impact cal
272 pig arctic clam a
273 i act pic clam rag
274 girl piccata cam
275 gilt crimp caca a
276 i act mic clap gar
277 glam arctic pica
278 limp cat caca rig
279 i crap mic tag lac
280 maga clap critic
281 garlic i camp cat
282 i act pic cram gal
283 cig acclaim trap
284 grip cacti calm a
285 i act pic lag marc
286 gama clap critic
287 magic lac rap tic
288 i arc tic camp gal
289 rig piccata calm
290 i cram lactic gap
291 i cat mic pal crag
292 gal impact circa
293 lit cam caca grip
294 i cat pac clam rig
295 galactic pac mir
296 it camp lac cigar
297 i cat pic clam rag
298 mig carpal cacti
299 calm pic arc gait
300 i cat mic clap gar
