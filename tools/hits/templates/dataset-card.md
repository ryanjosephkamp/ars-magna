---
license: mit
language:
  - en
pretty_name: Ars Magna Greatest Hits
size_categories:
  - n<1K
task_categories:
  - text-classification
tags:
  - anagrams
  - wordplay
  - english
configs:
{{CONFIGS}}
---

# Ars Magna Greatest Hits

The funniest and most apt anagrams of people, companies, products, titles, places and phrases, found by [Ars Magna](https://ars-magna.pages.dev) and kept by hand.

Every row is a real anagram: the words use exactly the input's letters, checked against a pinned revision of [English OpenList]({{SOURCE_URL}}) (`{{DICT_REV}}`), and every word is in the tier the row names. Accented letters fold to their base letter, so *Beyoncé* has three e's. A number or a symbol in the input is read as letters first, and the row says how (`reading`): on its own a number is spelled (*Blink-182* has the letters of *blink one hundred eighty two*), inside a word a digit or `$`/`!` stands for its keyboard letter (*Ke$ha* is *kesha*), `@` is *a*, `&` is *and* and `+` is *plus*; a reading may leave an item out.

## Subsets

| Config | What it holds | Rows |
|---|---|---|
{{SUBSET_TABLE}}

A category with no rows yet is listed here but not offered as a config until it has one.

```python
from datasets import load_dataset
{{EXAMPLE_CONFIG}} = load_dataset("{{DATASET_ID}}", "{{EXAMPLE_CONFIG}}")
```

## Fields

| Field | Meaning |
|---|---|
| `id` | The input's folded letters, its category, and its words as a multiset. Stable. |
| `input` | The text as a person would write it. |
| `category` | One of `people`, `companies`, `products`, `titles`, `places`, `phrases`. |
| `words` | The anagram's words, in reading order. |
| `display` | The words joined with spaces. |
| `letters` | The sorted letters the input and the anagram share. |
| `reading` | How each number and symbol of the input was read, as a list of `item` and `reading` in the input's order: `spell` (the number's name, or the symbol's word), `digits` (digit by digit), `year` (*nineteen oh seven*), `letter` (the keyboard letter), `drop` (left out), or a homophone word (`to`, `too`, `for`, `ate`, `won`, `oh`); `null` for an input without any, and for a hit from before 2026-09-21, whose digits and symbols were dropped. |
| `prefilter_score` | The model-free score that put it in front of a judge (ordering, word frequency, length). |
| `judge` | One entry per judge, with its model, rubric version, rationale and date. Rubric v2 scores `relation` to the input (1–5, the score that decides) and `reads` (1–3), with `tone` and `subjects` labels and a `justification`. Rubric v1 scored aptness, grammar and memorability (1–5 each) and a total. |
| `justification` | One plain sentence explaining why the anagram fits its input, for a reader who does not know the reference; `null` when there is none yet. |
| `about` | One factual sentence saying what the input is, from Wikidata's English description or written for the dataset; `null` when there is none yet. |
| `wikipedia` | The input's English Wikipedia article; `null` when it has none or none is known. |
| `senses` | The sense a word reads in, in this anagram, as a list of `word` and `sense` in reading order: one sentence each, only for a word whose first dictionary sense would not explain the reading or that has no definition; `null` when no word needs one. |
| `shelf` | `greatest` (Greatest Hits, chosen by hand), `interesting` (a clear link), or `stretch` (a loose one). |
| `submitter` | Who found it, when it was submitted rather than mined; `null` for a mined hit. |
| `added` | The date it entered the list. |
| `dictionary` | The English OpenList revision it was verified against. |
| `tier` | The smallest dictionary tier that contains every word: `common`, `standard`, `full`, or `extended` for a word the site added on top of English OpenList. |
| `tags` | Labels: `classic` for the ones everyone knows, `tone:…` and `subject:…` from the judge, `greatest-candidate` where the judge scored relation 5. |
| `status` | `accepted` or `featured`. Proposed and retired rows are not published. |

## How rows get here

1. Inputs are gathered without a model: hand-picked, or taken from the day's most-viewed Wikipedia articles and classified through Wikidata.
2. The Ars Magna engine enumerates every anagram.
3. A deterministic prefilter keeps phrases made of everyday words, in their best reading order.
4. A language model scores each phrase's relation to its input against a fixed rubric ({{RUBRIC}}).
5. The pipeline places each phrase on a shelf by that score.
6. A person approves by merging. Greatest Hits are chosen by hand.

The pipeline, the schemas and the rubric are in the [repository](https://github.com/ryanjosephkamp/ars-magna).

## Changelog

{{CHANGELOG}}
