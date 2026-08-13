/**
 * Definitions written by hand, consulted before WordNet.
 *
 * WordNet is a lexical database of nouns, verbs, adjectives and adverbs. It has
 * no pronouns, no determiners, no prepositions and no conjunctions — not as an
 * oversight but by design. So the most common words in the language arrive with
 * nothing, and `you`, `the`, `and`, `that`, `of` and `what` were the six most
 * frequent words in the list with no definition at all.
 *
 * Worse than nothing, in a few cases. Where WordNet holds only a proper-noun
 * entry for a short string, that entry is what a reader was shown: `me` was
 * defined as a state in New England, `it` as a branch of engineering, `or` as a
 * state on the Pacific.
 *
 * ## These are prepended, not substituted
 *
 * A curated gloss goes first and WordNet fills the slots behind it. Replacing
 * outright would have been a regression: WordNet's `mine` — "excavation in the
 * earth from which ores are extracted" — is perfectly good, and the pronoun was
 * merely missing. Prepending gives a reader both, in the right order.
 *
 * It also dissolves most of the symbol problem without a symbol list. `ar` now
 * reads "the letter R" and then argon; `hm` reads as the interjection and then
 * the hectometre. Both are true, and the one a reader meant comes first.
 *
 * ## Where these came from, and how far to trust them
 *
 * Two different provenances, and the difference matters.
 *
 *  - The function words, interjections and informal forms are ordinary English.
 *    They are uncontroversial and easy to check against any dictionary.
 *  - The short Scrabble entries — `ai`, `ar`, `oe`, `xu`, `za` — are written
 *    from knowledge of the tournament word list rather than derived from any
 *    file in this repository. They are the reason those words are in English
 *    OpenList at all, and WordNet does not carry them. **They have not been
 *    verified against a source here**, and a reader who plays competitively
 *    will spot an error faster than this build will.
 *
 * Every gloss is deliberately one line. A result row is not a dictionary page,
 * and the job here is to stop a reader wondering whether a word is a bug.
 */

export type CuratedPos =
  | 'n'
  | 'v'
  | 'adj'
  | 'adv'
  | 'det'
  | 'pron'
  | 'prep'
  | 'conj'
  | 'interj';

export type CuratedSense = { readonly pos: CuratedPos; readonly gloss: string };

const s = (pos: CuratedPos, gloss: string): CuratedSense[] => [{ pos, gloss }];

/**
 * Pronouns and possessives. WordNet has none of these.
 */
const PRONOUNS: Record<string, CuratedSense[]> = {
  i: s('pron', 'the person speaking or writing'),
  me: s('pron', 'the person speaking, as the object of a verb or preposition'),
  my: s('det', 'belonging to the person speaking'),
  mine: s('pron', 'the one belonging to the person speaking'),
  myself: s('pron', 'the person speaking, referred to again'),
  you: s('pron', 'the person or people being addressed'),
  your: s('det', 'belonging to the person being addressed'),
  yours: s('pron', 'the one belonging to the person being addressed'),
  yourself: s('pron', 'the person being addressed, referred to again'),
  yourselves: s('pron', 'the people being addressed, referred to again'),
  he: s('pron', 'the male person or animal already mentioned'),
  him: s('pron', 'the male already mentioned, as the object of a verb'),
  his: s('det', 'belonging to the male already mentioned'),
  himself: s('pron', 'the male already mentioned, referred to again'),
  she: s('pron', 'the female person or animal already mentioned'),
  her: s('det', 'belonging to the female already mentioned'),
  hers: s('pron', 'the one belonging to the female already mentioned'),
  herself: s('pron', 'the female already mentioned, referred to again'),
  it: s('pron', 'the thing, animal or idea already mentioned'),
  its: s('det', 'belonging to the thing already mentioned'),
  itself: s('pron', 'the thing already mentioned, referred to again'),
  we: s('pron', 'the speaker together with others'),
  us: s('pron', 'the speaker and others, as the object of a verb'),
  our: s('det', 'belonging to the speaker and others'),
  ours: s('pron', 'the one belonging to the speaker and others'),
  ourself: s('pron', 'the speaker, referred to again in formal or royal use'),
  ourselves: s('pron', 'the speaker and others, referred to again'),
  they: s('pron', 'the people or things already mentioned'),
  them: s('pron', 'the people or things already mentioned, as an object'),
  their: s('det', 'belonging to the people already mentioned'),
  theirs: s('pron', 'the one belonging to the people already mentioned'),
  themselves: s('pron', 'the people already mentioned, referred to again'),
  who: s('pron', 'which person'),
  whom: s('pron', 'which person, as the object of a verb or preposition'),
  whose: s('det', 'belonging to which person'),
  whoever: s('pron', 'any person who'),
  whomever: s('pron', 'any person whom'),
  oneself: s('pron', 'a person in general, referred to again'),
  yous: s('pron', 'the people being addressed, in some dialects'),
  youse: s('pron', 'the people being addressed, in some dialects'),
  thee: s('pron', 'you, as the object of a verb, in archaic use'),
  thou: s('pron', 'you, in archaic use'),
  thy: s('det', 'your, in archaic use'),
  thine: s('pron', 'yours, in archaic use'),
  ye: s('pron', 'you, in archaic or dialect use'),
};

/**
 * Determiners, quantifiers, and the words built from them.
 */
const DETERMINERS: Record<string, CuratedSense[]> = {
  the: s('det', 'used before a noun already known or about to be identified'),
  this: s('det', 'the one here, or the one just mentioned'),
  that: s('det', 'the one there, or the one already mentioned'),
  these: s('det', 'the ones here'),
  those: s('det', 'the ones there'),
  else: s('adv', 'in addition, or instead'),
  something: s('pron', 'a thing not named or not known'),
  someone: s('pron', 'a person not named or not known'),
  somebody: s('pron', 'a person not named or not known'),
  anything: s('pron', 'a thing of any kind'),
  anyone: s('pron', 'a person of any kind'),
  anybody: s('pron', 'a person of any kind'),
  everything: s('pron', 'all things'),
  everyone: s('pron', 'all people'),
  everybody: s('pron', 'all people'),
  others: s('pron', 'the remaining people or things'),
  anytime: s('adv', 'at whatever moment'),
};

/**
 * Prepositions. Position, direction, and relation.
 */
const PREPOSITIONS: Record<string, CuratedSense[]> = {
  of: s('prep', 'belonging to, or coming from'),
  to: s('prep', 'in the direction of, or as far as'),
  for: s('prep', 'intended to benefit, or in support of'),
  with: s('prep', 'accompanied by, or by means of'),
  from: s('prep', 'starting at, or originating in'),
  into: s('prep', 'to the inside of'),
  onto: s('prep', 'to a position on'),
  unto: s('prep', 'to, in archaic use'),
  until: s('prep', 'up to the time of'),
  til: s('prep', 'until'),
  during: s('prep', 'throughout the course of'),
  against: s('prep', 'in opposition to, or touching'),
  among: s('prep', 'in the middle of, or shared by'),
  amongst: s('prep', 'in the middle of, or shared by'),
  amid: s('prep', 'in the middle of'),
  amidst: s('prep', 'in the middle of'),
  beside: s('prep', 'at the side of'),
  besides: s('prep', 'in addition to'),
  toward: s('prep', 'in the direction of'),
  towards: s('prep', 'in the direction of'),
  without: s('prep', 'not having, or lacking'),
  per: s('prep', 'for each'),
  via: s('prep', 'by way of'),
  versus: s('prep', 'against, or as opposed to'),
};

/**
 * Conjunctions and the subordinators. `or` is here because WordNet's only entry
 * for it is the state of Oregon.
 */
const CONJUNCTIONS: Record<string, CuratedSense[]> = {
  and: s('conj', 'together with, or in addition to'),
  or: s('conj', 'introducing an alternative'),
  nor: s('conj', 'and not; used after a negative'),
  if: s('conj', 'on the condition that'),
  than: s('conj', 'introducing the second part of a comparison'),
  because: s('conj', 'for the reason that'),
  since: s('conj', 'from the time that, or seeing that'),
  unless: s('conj', 'except on the condition that'),
  whether: s('conj', 'introducing a choice between possibilities'),
  although: s('conj', 'in spite of the fact that'),
  whilst: s('conj', 'while'),
  whereas: s('conj', 'in contrast with the fact that'),
  whenever: s('conj', 'at whatever time'),
  wherever: s('conj', 'in or to whatever place'),
  however: s('adv', 'nevertheless, or to whatever extent'),
};

/**
 * Auxiliaries and the archaic verb forms English OpenList carries in quantity.
 */
const VERBS: Record<string, CuratedSense[]> = {
  would: s('v', 'used to express a conditional or habitual action'),
  could: s('v', 'was able to, or might possibly'),
  should: s('v', 'ought to, or is expected to'),
  shall: s('v', 'used to express future action or obligation'),
  cannot: s('v', 'is not able to'),
  ought: s('v', 'is under a duty to'),
  hath: s('v', 'has, in archaic use'),
  hast: s('v', 'have, in archaic use'),
  doth: s('v', 'does, in archaic use'),
  dost: s('v', 'do, in archaic use'),
  wast: s('v', 'were, in archaic use'),
  wert: s('v', 'were, in archaic use'),
  shalt: s('v', 'shall, in archaic use'),
  canst: s('v', 'can, in archaic use'),
  gonna: s('v', 'going to, in informal speech'),
  gotta: s('v', 'have got to, in informal speech'),
  gimme: s('v', 'give me, in informal speech'),
  gotcha: s('interj', 'I have got you, or I understand'),
};

/**
 * Interjections. English OpenList is rich in them because they are legal in
 * tournament play, and WordNet holds almost none.
 */
const INTERJECTIONS: Record<string, CuratedSense[]> = {
  ah: s('interj', 'expressing surprise, recognition or relief'),
  ahh: s('interj', 'expressing relief or understanding'),
  aha: s('interj', 'expressing sudden discovery'),
  aw: s('interj', 'expressing sympathy, or mild protest'),
  aww: s('interj', 'expressing tenderness'),
  ay: s('interj', 'expressing sorrow, or meaning yes'),
  aye: s('interj', 'yes, especially in voting'),
  duh: s('interj', 'expressing that something is obvious'),
  eh: s('interj', 'inviting agreement, or asking for repetition'),
  er: s('interj', 'expressing hesitation'),
  erm: s('interj', 'expressing hesitation'),
  ew: s('interj', 'expressing disgust'),
  geez: s('interj', 'expressing surprise or exasperation'),
  jeez: s('interj', 'expressing surprise or exasperation'),
  gosh: s('interj', 'expressing surprise'),
  ha: s('interj', 'expressing laughter, triumph or surprise'),
  hah: s('interj', 'expressing laughter or triumph'),
  hee: s('interj', 'representing a high-pitched laugh'),
  heh: s('interj', 'representing a short laugh'),
  hey: s('interj', 'calling for attention'),
  hi: s('interj', 'a greeting'),
  hm: s('interj', 'expressing thought, doubt or hesitation'),
  hmm: s('interj', 'expressing thought, doubt or hesitation'),
  ho: s('interj', 'expressing surprise, or calling for attention'),
  hoo: s('interj', 'expressing excitement or derision'),
  huh: s('interj', 'expressing puzzlement, or inviting agreement'),
  mm: s('interj', 'expressing agreement or pleasure'),
  mmm: s('interj', 'expressing pleasure or satisfaction'),
  nah: s('interj', 'no, in informal speech'),
  nope: s('interj', 'no, in informal speech'),
  oh: s('interj', 'expressing surprise, pain or recognition'),
  oi: s('interj', 'calling for attention, chiefly British'),
  om: s('n', 'a sacred syllable chanted in Hindu and Buddhist practice'),
  oops: s('interj', 'acknowledging a small mistake'),
  ouch: s('interj', 'expressing sudden pain'),
  ow: s('interj', 'expressing sudden pain'),
  oy: s('interj', 'expressing dismay or exasperation'),
  psst: s('interj', 'calling for attention quietly'),
  psych: s('interj', 'announcing that what was just said was a joke'),
  sh: s('interj', 'calling for silence'),
  shh: s('interj', 'calling for silence'),
  ugh: s('interj', 'expressing disgust or dismay'),
  uh: s('interj', 'expressing hesitation'),
  um: s('interj', 'expressing hesitation'),
  umm: s('interj', 'expressing hesitation'),
  wah: s('interj', 'representing a wail'),
  wha: s('interj', 'expressing surprise or incomprehension'),
  whew: s('interj', 'expressing relief'),
  whoa: s('interj', 'calling for a halt, or expressing astonishment'),
  ya: s('pron', 'you, in informal speech'),
  yah: s('interj', 'yes, in informal speech'),
  yep: s('interj', 'yes, in informal speech'),
  yo: s('interj', 'a greeting, or calling for attention'),
  yuck: s('interj', 'expressing disgust'),
  yum: s('interj', 'expressing that something tastes good'),
  yup: s('interj', 'yes, in informal speech'),
  heck: s('interj', 'expressing annoyance, a milder form of hell'),
  dang: s('interj', 'expressing annoyance, a milder form of damn'),
};

/**
 * Short entries from the tournament word list.
 *
 * These are the words a reader is most likely to take for a bug, and the ones
 * WordNet is least able to help with — it offers a chemical symbol or a US
 * state where the word list means something else entirely. `ar` is the letter
 * R; `ai` is a sloth; `za` is pizza.
 *
 * Written from knowledge of the tournament list, not derived from a file here.
 * See the note at the top of this module.
 */
const SHORT: Record<string, CuratedSense[]> = {
  ae: s('adj', 'one, in Scottish use'),
  ag: s('n', 'agriculture, in informal use'),
  ai: s('n', 'the three-toed sloth of South America'),
  al: s('n', 'an East Indian tree yielding a red dye'),
  an: s('det', 'used before a vowel sound in place of a'),
  ar: s('n', 'the letter R'),
  ba: s('n', 'the eternal soul, in ancient Egyptian belief'),
  bi: s('n', 'a bisexual person'),
  bo: s('n', 'a pal or buddy, in dated slang'),
  da: s('n', 'a heavy Burmese knife'),
  de: s('prep', 'of or from, in names and borrowed phrases'),
  ed: s('n', 'education, in informal use'),
  ef: s('n', 'the letter F'),
  el: s('n', 'an elevated railway'),
  es: s('n', 'the letter S'),
  et: s('v', 'ate, in dialect use'),
  ex: s('n', 'a former spouse or partner'),
  fe: s('n', 'a Hebrew letter'),
  jo: s('n', 'a sweetheart, in Scottish use'),
  lo: s('interj', 'look, in archaic use'),
  na: s('adv', 'no or not, in Scottish use'),
  ne: s('adj', 'born with the name of'),
  od: s('n', 'a hypothetical force once thought to pervade nature'),
  oe: s('n', 'a whirlwind off the Faroe islands'),
  op: s('n', 'a style of geometric abstract art'),
  po: s('n', 'a chamber pot, in informal British use'),
  si: s('n', 'the note B in the sol-fa scale'),
  ta: s('interj', 'thank you, in informal British use'),
  tae: s('prep', 'to, in Scottish use'),
  te: s('n', 'the seventh note of the sol-fa scale'),
  un: s('pron', 'one, in dialect use'),
  ut: s('n', 'the note C, in the old sol-fa scale'),
  wo: s('n', 'woe'),
  xu: s('n', 'a former monetary unit of Vietnam'),
  za: s('n', 'pizza, in slang'),
  zo: s('n', 'a Tibetan hybrid of yak and cow'),
};

/**
 * Short words whose only WordNet entry is a proper noun or an initialism.
 *
 * These are the residue after ranking and the groups above: `la` was Los
 * Angeles rather than the note, `mi` a myocardial infarction, `ab` a bachelor's
 * degree, `tao` an adherent of Taoism rather than the principle itself.
 *
 * They are handled here rather than by a separate "symbol for X" mechanism,
 * which the plan called for and which measurement made unnecessary. Once
 * ranking and the curated table were in, the words left over did not want a
 * label saying they were abbreviations — they wanted the definition WordNet had
 * never carried. A real gloss beats a disclaimer.
 *
 * Deliberately not included: `cpu`, `rom`, `led`, `rpm`, `pac`, `fet`, `als`,
 * `pow`, `zed`, `zee`, `won`, `mon`, `sat`, `fed`. WordNet's expansion is what
 * those words mean, and a curated line would only repeat it.
 */
const RESIDUAL: Record<string, CuratedSense[]> = {
  ab: s('n', 'an abdominal muscle'),
  bop: s('v', 'to hit, or to dance to popular music'),
  cis: s('adj', 'on the same side, or matching the sex assigned at birth'),
  dis: s('v', 'to belittle or show disrespect for, in informal use'),
  doe: s('n', 'a female deer, rabbit or hare'),
  eta: s('n', 'the seventh letter of the Greek alphabet'),
  gad: s('v', 'to move about restlessly in search of pleasure'),
  la: s('n', 'the sixth note of the sol-fa scale'),
  lox: s('n', 'brined or smoked salmon'),
  mi: s('n', 'the third note of the sol-fa scale'),
  pe: s('n', 'a Hebrew letter'),
  reb: s('n', 'a Confederate soldier in the American Civil War'),
  tao: s('n', 'the absolute principle underlying the universe, in Taoism'),
  tho: s('conj', 'though'),
  yay: s('interj', 'expressing delight or approval'),
};

/**
 * Everything, keyed by the normalized word.
 *
 * A `Map`, not an object, and that is load-bearing. The caller looks this up
 * with every word in a 378,844-entry dictionary, and `constructor` is an
 * ordinary English word — so a plain object returns `Object.prototype
 * .constructor`, a function, for a word nobody curated. `toString` and
 * `valueOf` are the same trap waiting behind it.
 */
export const CURATED: ReadonlyMap<string, readonly CuratedSense[]> = new Map(
  Object.entries({
    ...PRONOUNS,
    ...DETERMINERS,
    ...PREPOSITIONS,
    ...CONJUNCTIONS,
    ...VERBS,
    ...INTERJECTIONS,
    ...SHORT,
    ...RESIDUAL,
  }),
);

/** Named groups, for the tests and for anyone auditing where a gloss came from. */
export const GROUPS = {
  pronouns: PRONOUNS,
  determiners: DETERMINERS,
  prepositions: PREPOSITIONS,
  conjunctions: CONJUNCTIONS,
  verbs: VERBS,
  interjections: INTERJECTIONS,
  short: SHORT,
  residual: RESIDUAL,
} as const;
