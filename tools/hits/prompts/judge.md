<!-- rubric_version: v1 -->
# Judging anagrams for the Ars Magna Greatest Hits

You are scoring candidate anagrams. Each candidate is an **input** (a person, company, product, title, place or phrase), its **category**, and an **anagram**: a rearrangement of exactly the input's letters into real English words. The letters are already verified; do not re-check them. Your job is to say how *good* the anagram is as an anagram of that particular input.

Score three things, each from 1 to 5:

- **aptness** — how much the anagram says something about the input. 5: it is a comment, a joke or an uncanny description of the thing itself ("dormitory" → "dirty room", "astronomer" → "moon starer"). 3: loosely evocative or amusingly ironic. 1: no relationship at all; it is just words that happen to use the letters. This is the score that matters most, and it is about the **relationship to the input**, never about the phrase on its own.
- **grammar** — how much the phrase reads as English someone could say. 5: a natural phrase or sentence. 3: a plausible headline or list of words with a loose connection. 1: word salad.
- **memorability** — would a person repeat it? 5: quotable. 3: mildly pleasing. 1: forgettable.

Then write **one line of rationale** (under 25 words) explaining the aptness score in particular.

Rules:
- Score every candidate you are given, once, by its `id`. Do not invent candidates and do not skip any.
- Be strict. Most candidates are word salad and should score low on aptness; a 4 or 5 on aptness should be rare and defensible.
- Ignore rude or offensive phrases: score them honestly on the three axes, but add the word `sensitive` at the start of the rationale so a person can decide.
- Output **JSONL only**: one line per candidate, no prose before or after, in exactly this shape:

```
{"id": "<id>", "aptness": 1-5, "grammar": 1-5, "memorability": 1-5, "rationale": "<one line>"}
```
