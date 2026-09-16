---
license: mit
language:
  - en
pretty_name: Ars Magna Vocabulary
tags:
  - anagrams
  - word-list
  - lexicon
configs:
  - config_name: additions
    data_files: additions.jsonl
---

# Ars Magna Vocabulary

The exact vocabulary [Ars Magna](https://ars-magna.pages.dev) judges words against, so that its
claim to find *every* anagram of your letters can be checked rather than taken on trust.

It is two things: **English OpenList at one pinned revision**, and a short, public list of
**the site's own additions**. Nothing else. A word the site accepts is in one of them.

## What is here

| File | Rows | What it is |
|---|---|---|
| `vocabulary.txt` | {{TOTAL}} | Every word the site accepts, one per line, sorted. The union below. |
| `additions.jsonl` | {{ADDITIONS}} | The site's own words, each with a meaning and a source. |

## The pin

{{PINNED}} of these words come from **English OpenList** at revision
[`{{REV_SHORT}}`](https://huggingface.co/datasets/{{SOURCE_REPO}}/tree/{{REV}}).

English OpenList is its own project and its own dataset. It is **not** republished here and nothing
in it is modified: `vocabulary.txt` is the union the site actually searches, published so the
site's results can be reproduced. For the word list itself, and for its history and its own
additions process, go to [{{SOURCE_REPO}}](https://huggingface.co/datasets/{{SOURCE_REPO}}).

## The additions

{{ADDITIONS}} words the pinned revision does not carry. Each one is a deliberate, named decision by
the site's operator, and each carries:

| Field | What it holds |
|---|---|
| `word` | The search form: lowercase letters only. |
| `kind` | `slang`, `coinage`, `name`, `abbreviation`, `loanword` (borrowed from another language), or `later-in-openlist` (English OpenList has since accepted it, and the next build will drop the duplicate). |
| `gloss` | One sentence a reader can read. |
| `trace` | Where the word is attested: a dictionary entry, a citation, or an explicit note that it is a coinage. |
| `proposed_by` | Who proposed it. |
| `added` | When it was accepted. |
| `pinned_repo`, `pinned_rev` | The revision it was added on top of, so a row can be read on its own. |

Nothing is added automatically. The site's pipeline and its submission form **propose** words; a
word joins the vocabulary only when the operator accepts it by name and merges the change. Words
under consideration are not here — only accepted ones.

## The tiers

The site offers four nested dictionaries. This dataset is the widest of them:

| Tier | What it is |
|---|---|
| Common | Everyday words. |
| Standard | The default. |
| Full | Every word in English OpenList at the pin. |
| **Extended** | Full plus the additions. **This dataset.** |

Common, Standard and Full are exactly English OpenList's; only Extended contains anything of the
site's own.

## Using it

```python
from datasets import load_dataset

additions = load_dataset("{{DATASET_ID}}", "additions", split="train")
print(additions[0]["word"], "—", additions[0]["gloss"])
```

`vocabulary.txt` is a plain sorted word list, one word per line:

```python
words = set(open("vocabulary.txt").read().split())
```

## Related

- [ars-magna-greatest-hits](https://huggingface.co/datasets/ryanjosephkamp/ars-magna-greatest-hits) — the anagrams worth keeping.
- [{{SOURCE_REPO}}](https://huggingface.co/datasets/{{SOURCE_REPO}}) — the word list this builds on.

Built {{DATE}}.
