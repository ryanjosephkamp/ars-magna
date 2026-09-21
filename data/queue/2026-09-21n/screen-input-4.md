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

## File 4 of 9: 1210 phrases

### morganfreeman:people

input: Morgan Freeman
category: people
phrases 1 to 300 of 300

1 german foreman
2 me gonna farmer
3 an man of merger
4 me rag for an men
5 meaner frogman
6 an germane form
7 green a from man
8 me ran for an meg
9 foreman manger
10 an former mange
11 an men go farmer
12 me ran for an gem
13 frogman rename
14 mean for german
15 an men from gear
16 me ran of an germ
17 fromage manner
18 name for german
19 an men for marge
20 me arm for an gen
21 freeman gorman
22 an mere frogman
23 german men for a
24 me ram for an gen
25 germane forman
26 men for manager
27 me anger an form
28 me rang of an rem
29 foremen garman
30 mean from anger
31 me man an forger
32 an far rem go men
33 forman grameen
34 mean from range
35 me range an form
36 me mar for an gen
37 name from anger
38 me man for anger
39 me nag for an rem
40 name from range
41 me man for range
42 me gan for an rem
43 manner for game
44 an men from rage
45 me rang men for a
46 me rang foreman
47 an mean for germ
48 an on meg arm ref
49 amen for german
50 me man of ranger
51 an no meg arm ref
52 mean for manger
53 an mom green far
54 an on gem arm ref
55 on german frame
56 an name for germ
57 an no gem arm ref
58 men from reagan
59 me rang for mean
60 an man err of meg
61 me near frogman
62 me ran of german
63 me go men ran far
64 an freer gammon
65 an arm from gene
66 an on meg ram ref
67 name for manger
68 me rang for name
69 an no meg ram ref
70 manner from age
71 me mean for gran
72 an man err of gem
73 form anger mean
74 me man of garner
75 me ran a from gen
76 forger mean man
77 an rem of german
78 an on gem ram ref
79 form range mean
80 me name for gran
81 an no gem ram ref
82 amen from anger
83 me nag an former
84 me ran men frog a
85 amen from range
86 me monger an far
87 an on meg mar ref
88 me earn frogman
89 an no merge farm
90 an no meg mar ref
91 manner of marge
92 green arm of man
93 me rag on far men
94 form anger name
95 me farm an goner
96 me rag no far men
97 forger name man
98 an ram from gene
99 an on gem mar ref
100 form range name
101 me for an german
102 an no gem mar ref
103 men fear morgan
104 an mom free gran
105 an far mem go ern
106 manner go frame
107 merge for an man
108 me ran men of rag
109 farm gonna mere
110 me gan an former
111 an rem rag of men
112 mane for german
113 an amen for germ
114 an men err of mag
115 anne from marge
116 an mere man frog
117 me ran on far meg
118 gone man farmer
119 me nag an reform
120 me ran no far meg
121 fore german man
122 an ern from game
123 me ran man go ref
124 merman of anger
125 an mermen go far
126 an on mem err fag
127 morgan man reef
128 an more farm gen
129 an no mem err fag
130 merman of range
131 an one farm germ
132 an rem ran of meg
133 amen for manger
134 an no frame germ
135 me err man go fan
136 amman for green
137 an men arm forge
138 me ran on far gem
139 men form reagan
140 green ram of man
141 me ran no far gem
142 more fag manner
143 an mar from gene
144 an on mem rag ref
145 on frame manger
146 an mere from nag
147 an no mem rag ref
148 one farm manger
149 me rang for amen
150 an rem ran of gem
151 former mean nag
152 an mem for anger
153 me go ern man far
154 no frame manger
155 an mem for range
156 me ran men of gar
157 far mean morgen
158 mean men for rag
159 me ran a form gen
160 form age manner
161 an more fan germ
162 an men err of gam
163 mane from anger
164 me from an anger
165 an men or far meg
166 mane from range
167 me from an range
168 me arm on far gen
169 far mean monger
170 an gene arm form
171 me arm no far gen
172 men fare morgan
173 an meg near form
174 me ran arm of gen
175 men frame organ
176 me gan an reform
177 me err on man fag
178 farm mean goner
179 an mem of ranger
180 an rem arm of gen
181 former name nag
182 near man for meg
183 me err man of nag
184 ref mean morgan
185 me ran of manger
186 an men or far gem
187 more fan manger
188 on man merge far
189 an ern arm of meg
190 far name morgen
191 far man merge no
192 me man on rag ref
193 fear man morgen
194 me rag of manner
195 me man no rag ref
196 mann from eager
197 me near from nag
198 me man a frog ern
199 gone far merman
200 an a frog mermen
201 me ram on far gen
202 on germane farm
203 on man free gram
204 me ram no far gen
205 far name monger
206 free gram man no
207 an ern arm of gem
208 fear man monger
209 an men farm ogre
210 an a men for germ
211 frame man goner
212 an mare from gen
213 me ran ram of gen
214 form anger amen
215 men anger from a
216 me nag ern from a
217 amen man forger
218 men range from a
219 an rem ram of gen
220 form range amen
221 an mon merge far
222 me man ern of rag
223 an gnome farmer
224 an men gore farm
225 an ern ram of meg
226 far german omen
227 an gem near form
228 me go rem ran fan
229 frame gonna rem
230 near men go farm
231 a ran men for meg
232 former game nan
233 near man for gem
234 me ran arm go fen
235 farm name goner
236 an meme for gran
237 me mar on far gen
238 man refer mango
239 near from an meg
240 me gan ern from a
241 ref name morgan
242 an men ram forge
243 me mar no far gen
244 enrage from man
245 green mar of man
246 an ern ram of gem
247 none farm marge
248 an mon free gram
249 me ran mar of gen
250 mona green farm
251 an rem mean frog
252 an rem mar of gen
253 frame groan men
254 former gen man a
255 a ran men for gem
256 reform mean nag
257 an rem of manger
258 me nag on far rem
259 form enrage man
260 me gear for mann
261 me nag no far rem
262 refer among man
263 an men frog mare
264 me ran on fag rem
265 men foam ranger
266 me rag from anne
267 me man ern of gar
268 agree from mann
269 mean men for gar
270 me ran rem fag no
271 an germ foreman
272 me gear from nan
273 me ran rem of nag
274 frame anger mon
275 an meg earn form
276 an ern mar of meg
277 frame range mon
278 on germ mean far
279 an rem on far meg
280 manna of merger
281 near man of germ
282 an rem no far meg
283 farmer mean ngo
284 an ern for gemma
285 a ran men of germ
286 mere fan morgan
287 an mane for germ
288 a arm men for gen
289 reform name nag
290 an gene ram form
291 an mem err of nag
292 form agree mann
293 no germ mean far
294 an arm me go fern
295 frame an morgen
296 me ran for mange
297 me ran ram go fen
298 far german nome
299 an rem man forge
300 me go ern arm fan

### serenawilliams:people

input: Serena Williams
category: people
phrases 1 to 300 of 300

1 animal wireless
2 an wireless mail
3 an well is armies
4 i miss an well are
5 wireless manila
6 an wireless lima
7 well a is remains
8 i were an all miss
9 seminal wailers
10 an wireless mali
11 me raises an will
12 me is an all wires
13 marseille swain
14 an sere williams
15 an will seems air
16 i is an well smear
17 wiseman rallies
18 marseille was in
19 an will rise same
20 i air an well mess
21 williams arsene
22 mine was rallies
23 me arises an will
24 i miss an well ear
25 i mill awareness
26 well a is marines
27 we miss an ill are
28 means raise will
29 an will sire same
30 an mere will is as
31 maria will sense
32 well a is seminar
33 i is an well mares
34 i swan marseille
35 an well same iris
36 me is an well sari
37 mine raise walls
38 ain well miss are
39 an well a is miser
40 we slams airline
41 mean ears is will
42 an ill a were miss
43 mean raises will
44 well air is means
45 i miss an well era
46 names raise will
47 well area miss in
48 me is an well airs
49 marseille saw in
50 well as is marine
51 we is an all miser
52 i wan marseilles
53 all are wine miss
54 i rise an well sam
55 we sail minerals
56 well rain is same
57 i miss an weller a
58 sea will remains
59 an are will semis
60 i wire an all mess
61 are will messina
62 small wine is are
63 i is an well reams
64 name raises will
65 we raise an mills
66 we is an slim real
67 we slam airlines
68 same siren will a
69 i smell an wiser a
70 a win marseilles
71 an will seems ira
72 i will an mere ass
73 we riles animals
74 we smile an liars
75 an well a is reims
76 mean arises will
77 in ears will same
78 i is an mere walls
79 wise all remains
80 i swell an armies
81 i sire an well sam
82 we sails mineral
83 an lire was miles
84 me is an sear will
85 we nails realism
86 we smiles an liar
87 me is an swell air
88 mine rallies saw
89 mean a rises will
90 an well are is mis
91 means arise will
92 all wires is mean
93 we is an all reims
94 name arises will
95 aware in is smell
96 an well as is emir
97 same raines will
98 an lire was smile
99 i seam an well sir
100 means aires will
101 mean arse is will
102 me was an ill rise
103 mine raises wall
104 ain are will mess
105 i were an ill mass
106 sea will marines
107 we smile an rails
108 i seems an ill war
109 we snarls emilia
110 all wire is means
111 i is an weller sam
112 minerals was lie
113 smaller wine is a
114 i wee an small sir
115 realism was line
116 well air is names
117 me air an well sis
118 mineral was lies
119 an lewis is realm
120 i mess an well ira
121 mine arise walls
122 mean as rise will
123 an well as is meir
124 small easier win
125 mean are will sis
126 an well as is mire
127 wise all marines
128 mean sir will sea
129 me is an ill wears
130 mine wars allies
131 all wires is name
132 i will an same res
133 same arisen will
134 an are swim ellis
135 i warm an less lie
136 sea will seminar
137 me raise an wills
138 an well are is ism
139 mine aires walls
140 an will seem sari
141 i will an same ers
142 mine arises wall
143 in are will seams
144 me was an ill sire
145 will remain seas
146 we slim an serial
147 i war an less mile
148 a wins marseille
149 same are sin will
150 i mess an all weir
151 i swells armenia
152 in area will mess
153 i is an swell mare
154 will sees marina
155 well aires is man
156 me wire an all sis
157 we snail realism
158 an are slim lewis
159 we is an slim earl
160 names arise will
161 i lam an wireless
162 i wear an ill mess
163 as win marseille
164 we slim an israel
165 i mire an well ass
166 real win melissa
167 we smile an liras
168 an well a miss ire
169 small raise wine
170 mean wills is are
171 an mere sis will a
172 main raises well
173 in arse will same
174 me is an raw ellis
175 names aires will
176 we is all remains
177 i see an raw mills
178 wise all seminar
179 real lewis is man
180 we is an ill smear
181 marine was ellis
182 an will seem airs
183 i rise an well mas
184 me nails wailers
185 an willis see arm
186 i rims an well sea
187 me rallies swain
188 an real lies swim
189 we is an real mils
190 new similar sale
191 well are is mains
192 an well sea is rim
193 melissa war line
194 ain will see arms
195 we miss an all ire
196 we ails minerals
197 an reis will same
198 i sell an wise arm
199 i sawn marseille
200 in earl was miles
201 i see an ill swarm
202 lewis man israel
203 in sea was miller
204 i was an slim reel
205 new similar seal
206 well sari is mean
207 i was in smell are
208 miles answer ali
209 risen a will same
210 an well air is ems
211 well sir amnesia
212 mean as sire will
213 we miss all in are
214 areas will mines
215 in laws smile are
216 me wires an ill as
217 sesame rain will
218 all a miss wiener
219 me is an swell ira
220 mail answer lies
221 well iran is same
222 we is an small ire
223 man swear lilies
224 well as is airmen
225 an mere wills is a
226 we snails mailer
227 all wire is names
228 i swim an all seer
229 siamese ran will
230 an law rise miles
231 i were an slim las
232 smile answer ali
233 we rail an smiles
234 me saw an ill rise
235 miles aliens war
236 mean ares is will
237 we is in small are
238 amen raises will
239 small wiener is a
240 i war an less lime
241 mine wills areas
242 an well rises aim
243 we air an ill mess
244 mine wails laser
245 an wise air smell
246 we miss an ill ear
247 main arises well
248 me raise an swill
249 i seems an ill raw
250 aisle was merlin
251 in are will masse
252 i rise an all mews
253 same near willis
254 in are wills same
255 i swim an real les
256 smile aliens war
257 well ears is main
258 an swell a is emir
259 we rallies mains
260 same a rinse will
261 i see an warm sill
262 seaman rise will
263 well airs is mean
264 i sees an warm ill
265 a sneer williams
266 we raises an mill
267 i see an warm ills
268 messina air well
269 meaner as is will
270 i seem an ill wars
271 swim aliens real
272 well sari is name
273 i sire an well mas
274 less wire animal
275 same a reins will
276 me is all swear in
277 law lies remains
278 an law rise smile
279 we is all mean sir
280 mail answers lie
281 an will sees mari
282 i wills an mere as
283 mailer was lines
284 well are is minas
285 we is an ill mares
286 miles swear nail
287 slim are was line
288 i rim an well seas
289 marina is welles
290 mean sera is will
291 i will an sere sam
292 mean raise wills
293 an messier a will
294 me is an ill wares
295 smaller ain wise
296 an will sees amir
297 an ill saw is mere
298 allies was miner
299 we arise an mills
300 we is in smaller a

### alberteinstein:people

input: Albert Einstein
category: people
phrases 1 to 300 of 300

1 intestinal beer
2 an ten liberties
3 i better an lines
4 i be an in letters
5 elite bannister
6 an resilient bet
7 it listen an beer
8 it let an in beers
9 liberate tennis
10 an libertine set
11 an better lies in
12 an in tires be let
13 blaise internet
14 its later bennie
15 it be an listener
16 an in tries be let
17 batteries linen
18 an senile bitter
19 i better an niles
20 i better an in les
21 batteries lenin
22 its internal bee
23 it been an liters
24 its near in be let
25 albert nineties
26 an net liberties
27 its in been alert
28 its in ben let are
29 transit beeline
30 an tiniest rebel
31 an entire be list
32 it be an risen let
33 blare intestine
34 it been entrails
35 it been an lister
36 i be an in settler
37 anisette berlin
38 it been latrines
39 i been its rental
40 an in let sit beer
41 entertains bile
42 its elite banner
43 it been an litres
44 its inner let be a
45 tristan beeline
46 an tensile tribe
47 an sir been title
48 its in let an beer
49 isabel internet
50 its alert bennie
51 its let been rain
52 its in ten be real
53 transient belie
54 its beaten liner
55 in lines better a
56 i be an in trestle
57 blaine interest
58 it enter lesbian
59 an entire is belt
60 an in rites be let
61 basile internet
62 an libertine est
63 i listen an beret
64 an in tree be list
65 internal bestie
66 aliens better in
67 in bet listen are
68 it set an in rebel
69 benita listener
70 an brittle seine
71 i seen an brittle
72 i trees an in belt
73 intestinal bree
74 its innate rebel
75 it be an reenlist
76 i let an in berets
77 beale internist
78 it bear sentinel
79 in line better as
80 i let an best erin
81 bernal entities
82 i bales internet
83 i belts an entire
84 i test an in rebel
85 stane libertine
86 it rent baseline
87 an better line is
88 it lets an in beer
89 tiniest enabler
90 its eternal bine
91 i been an litters
92 it reel an in best
93 benita reenlist
94 saline better in
95 i bet an listener
96 an in let is beret
97 talib ernestine
98 let seen britain
99 its later in been
100 its in lent be are
101 balti ernestine
102 stable entire in
103 in better is lane
104 it is an ten rebel
105 earline nesbitt
106 artist been line
107 in beer listen at
108 i been an lit rest
109 it bean listener
110 in niles better a
111 i been til an rest
112 ain better lines
113 in lie been start
114 i tree an in belts
115 an tensile biter
116 in better is lean
117 an in rise let bet
118 it bare sentinel
119 an in steel tribe
120 i let its near ben
121 nail be interest
122 its line been art
123 i rent an best lie
124 i batter nielsen
125 in better is lena
126 i better an in els
127 able interest in
128 ain letters be in
129 it be an stern lie
130 beater listen in
131 i interest an bel
132 it be an sent lire
133 i rattles bennie
134 an in sterile bet
135 i rest an in betel
136 it enable insert
137 i been its antler
138 an in let see brit
139 stalin be entire
140 its let been iran
141 i be an sent liter
142 in beat listener
143 an entire be slit
144 i be an ten liters
145 sabine in letter
146 an siren be title
147 i rein an best let
148 abel interest in
149 an better lie sin
150 i steer an in belt
151 intense real bit
152 an line trees bit
153 it is an lee brent
154 sail be internet
155 an beer titles in
156 i set an in treble
157 able internet is
158 i betters an line
159 i be an ten lister
160 i startle bennie
161 later in seen bit
162 its in net be real
163 bar let einstein
164 better linen is a
165 i be an sent litre
166 in table steiner
167 an sitter be line
168 i let an risen bet
169 train beetles in
170 it enlist an beer
171 an in rest lie bet
172 its inane treble
173 an beers title in
174 an in tiers be let
175 sent libertine a
176 an siren let bite
177 an in sire let bet
178 are bitten lines
179 in listener be at
180 its in ten rebel a
181 in table entries
182 beaten sir let in
183 i be an ten litres
184 rebate listen in
185 an list been tire
186 i list an ten beer
187 internet is abel
188 better lenin is a
189 its erin be an let
190 ain better niles
191 an line rest bite
192 an in rest be tile
193 in start beeline
194 i belt an steiner
195 i reset an in belt
196 tristan been lie
197 its nine bear let
198 i is an ten treble
199 else ten britain
200 its line been rat
201 i rise an bent let
202 bee listen train
203 i belt an entries
204 an in trees be lit
205 bale interest in
206 i letter an ibsen
207 it leer an in best
208 it bean reenlist
209 its lint been are
210 an in test be lire
211 transit been lie
212 its eternal in be
213 it is an net rebel
214 nail best entire
215 its let been rani
216 an in set be liter
217 title seen brain
218 its ten been liar
219 an in tree be slit
220 bernstein lie at
221 in beer is talent
222 it reels an in bet
223 transient be lie
224 its nine be alert
225 its in ten be earl
226 traits been line
227 an lines tree bit
228 i let an sent brie
229 nina better lies
230 its nine belt are
231 an in tire be lets
232 entire let basin
233 its liner been at
234 i be its near lent
235 serial be intent
236 in set been trial
237 an in set be litre
238 beat listen erin
239 its tin been real
240 an ten iris be let
241 train been tiles
242 eternal in is bet
243 i settle an in reb
244 sail better nine
245 i settle an brine
246 i sit an ten rebel
247 it relent sabine
248 its linnet be are
249 its in berne let a
250 been its latrine
251 its lie be tanner
252 it rebel an in est
253 alien better sin
254 in tire been last
255 i be its lean rent
256 i entertains bel
257 i bet an reenlist
258 i rest an bent lie
259 it alerts bennie
260 an line see britt
261 i tree an best lin
262 israel be intent
263 an line set tribe
264 it trees an in bel
265 talent been iris
266 in litter been as
267 i sire an bent let
268 trains beetle in
269 its rent be alien
270 i best an ten lire
271 internal bit see
272 an lies enter bit
273 i lets an in beret
274 internet is bale
275 else bitter an in
276 i bes an in letter
277 it alters bennie
278 in lines be treat
279 its rent be an lie
280 earliest bent in
281 it tinsel an beer
282 i reel an sent bit
283 rain been titles
284 an line tires bet
285 its in ben let ear
286 trial been stein
287 an lit been tires
288 i belt an in ester
289 a bitter nielsen
290 its benin let are
291 i let an tense rib
292 nitrates be line
293 in liters been at
294 i be an net liters
295 strait been line
296 its in relate ben
297 an lite in be rest
298 strain beetle in
299 in beret listen a
300 it is an bent reel

### charlesdarwin:people

input: Charles Darwin
category: people
phrases 1 to 300 of 300

1 inward charles
2 an scared whirl
3 her in card laws
4 rcn i was her lad
5 cardinal shrew
6 an wild archers
7 her drawl is can
8 her wild a rcn as
9 danish crawler
10 his carnal drew
11 i sand her crawl
12 rcn i was her dal
13 crawl sheridan
14 an hired crawls
15 her in sad crawl
16 rcn i saw her lad
17 rancid whalers
18 an sacred whirl
19 her laws rid can
20 his red a rcn law
21 calendar whirs
22 her rancid laws
23 her lawn is card
24 dhl we arc an sir
25 screw handrail
26 an wild crasher
27 her dna is crawl
28 rcn we lard his a
29 crews handrail
30 his clad warren
31 i draw her clans
32 an a crew sir dhl
33 calendars whir
34 an hired scrawl
35 i card her lawns
36 rcn i saw her dal
37 aldrich answer
38 his clad warner
39 i draws her clan
40 his raw a rcn led
41 rachel inwards
42 children war as
43 her ward is clan
44 dhl i crew an ras
45 cranial shrewd
46 i wars chandler
47 i darn her claws
48 dhl i crew an ars
49 crenshaw laird
50 i hand crawlers
51 she rid an crawl
52 his raw a rcn del
53 cardenas whirl
54 children wars a
55 her war slid can
56 her a was lid rcn
57 andric whalers
58 an laced whirrs
59 his war lend car
60 rcn held a is war
61 childers anwar
62 her rancid slaw
63 i crawls her dna
64 i has rcn red law
65 schwerin darla
66 her inward lacs
67 her lads win car
68 i rcn her sad law
69 carwash linder
70 charles draw in
71 i ward her clans
72 i war rcn held as
73 an arched swirl
74 his nerd crawl a
75 dhl i err an caws
76 war is chandler
77 her lind was car
78 rcn i wad her las
79 she drain crawl
80 i shred an crawl
81 i wars rcn held a
82 as raw children
83 her lids war can
84 his a war led rcn
85 charles ward in
86 i wards her clan
87 i slew rcn hard a
88 i hardens crawl
89 her in law cards
90 her a saw lid rcn
91 crawlers had in
92 her darn is claw
93 i err dhl was can
94 he drains crawl
95 i claws her rand
96 rcn held a is raw
97 card learn wish
98 an herd is crawl
99 screw dhl i ran a
100 he crawl dinars
101 her in crawl ads
102 his a war del rcn
103 her wind rascal
104 i herds an crawl
105 i dhl we ran cars
106 he drain crawls
107 her lid wars can
108 dhl in a crew ras
109 cards ran while
110 her land is craw
111 rcn i wad her als
112 rachel draws in
113 he swirl an card
114 dhl ran a is crew
115 hand is crawler
116 his led warn car
117 dhl in a crew ars
118 clear hard wins
119 her in card slaw
120 i can dhl raw res
121 are warns child
122 her saw rid clan
123 i has rcn raw led
124 i charred lawns
125 her las wind car
126 i can dhl raw ers
127 can deal whirrs
128 his red war clan
129 he is rcn raw lad
130 raw is chandler
131 he rid an crawls
132 crew dhl i ran as
133 i harden crawls
134 i scrawl her dna
135 i dhl we ran scar
136 rachel dawn sir
137 her law sin card
138 crews dhl i ran a
139 his reward clan
140 i warn her scald
141 i err dhl saw can
142 clash reward in
143 an red rich laws
144 i has rcn raw del
145 screw land hair
146 her lad wins car
147 i ash rcn red law
148 she crawl nadir
149 i herd an crawls
150 i was he lard rcn
151 larder wish can
152 her slaw rid can
153 i weld rcn rash a
154 clear darn wish
155 her sir claw dna
156 i had rcn raw les
157 rachel wards in
158 i lands her craw
159 dhl in a err caws
160 she crawl dinar
161 her lad win cars
162 he slid rcn raw a
163 liar crew hands
164 her rand is claw
165 i rcn he war lads
166 he drain scrawl
167 her wild can ras
168 i has we lard rcn
169 screw hand liar
170 his del warn car
171 she rid a rcn law
172 can draw relish
173 her las win card
174 i rcn she war lad
175 his drawer clan
176 her raw slid can
177 we arc dhl in ras
178 crawl had siren
179 her in clad wars
180 i rcn she drawl a
181 can lead whirrs
182 his raw lend car
183 he is rcn raw dal
184 in clash drawer
185 her in claws rad
186 res dhl i war can
187 search ran wild
188 her law rid scan
189 i war led has rcn
190 i wanders larch
191 his lad ran crew
192 ern dhl i was car
193 child near wars
194 i drawl her scan
195 ers dhl i war can
196 wears ran child
197 her wild can ars
198 we arc dhl in ars
199 warn his cradle
200 her lind saw car
201 he is a drawl rcn
202 in charred laws
203 an welsh rid car
204 i shred a rcn law
205 crash draw line
206 he rid an scrawl
207 dhl in as err caw
208 hair send crawl
209 his red ran claw
210 he rid a rcn laws
211 ears warn child
212 her law rid cans
213 sec dhl i ran war
214 car warn shield
215 her lids can raw
216 i saw he lard rcn
217 cars darn while
218 i drawl her cans
219 i arc dhl new ras
220 i harden scrawl
221 his weld ran car
222 i herds a rcn law
223 a whirl dancers
224 card was her lin
225 he rid as rcn law
226 in card whalers
227 her law ran disc
228 i war del has rcn
229 crash near wild
230 her rinds claw a
231 i herd a rcn laws
232 crash an wilder
233 her as din crawl
234 i rcn he drawl as
235 can ward relish
236 her lid was narc
237 i rcn he draw las
238 drawn rachel is
239 her rind claws a
240 i sew dhl ran car
241 her drain claws
242 his a rend crawl
243 sen dhl i war car
244 a whirrs candle
245 her als wind car
246 i war les had rcn
247 care hand swirl
248 i herd an scrawl
249 wren dhl i scar a
250 hands war relic
251 an drew is larch
252 i dhl we ran arcs
253 rich land wears
254 her in raw scald
255 i had rcn raw els
256 are warn childs
257 her lad win scar
258 i arc dhl new ars
259 relics hand war
260 her a din crawls
261 i herd as rcn law
262 as wild rancher
263 an res war child
264 i rcn he wars lad
265 clear warn dish
266 an led wars rich
267 i rcn as held raw
268 clear rash wind
269 her lard was inc
270 i ash rcn raw led
271 crash ward line
272 his red raw clan
273 i rcn he ward las
274 crawl has diner
275 an ers war child
276 rcn slid he war a
277 search drawl in
278 an sir herd claw
279 i rcn she war dal
280 rich lands wear
281 an sir crew dahl
282 i lash a rcn drew
283 care land whirs
284 in red crash law
285 her lis wad a rcn
286 child earns war
287 her war sic land
288 ern dhl i saw car
289 crawl hand rise
290 an led whirs car
291 rcn rid we lash a
292 he crawls nadir
293 her lid swan car
294 i ash rcn raw del
295 we drains larch
296 her laws din car
297 he is law rcn rad
298 richer land was
299 her ins card law
300 i arc dhl raw sen

### ferrari:companies

input: Ferrari
category: companies
phrases 1 to 10 of 10

1 rare fir
2 i err far
3 rear fir
4 a err fir
5 fair err
6 i err arf
7 farr ire
8 rarer if
9 farr rei
10 farr eri
