//! Golden cases against the real shipped dictionary.
//!
//! Skipped when `apps/web/public/dict` has not been built, so a fresh clone can
//! still run `cargo test` before `pnpm dict:build`.
//!
//! Assertions are by **anagram class**, never by exact spelling. The search
//! collapses every spelling of a letter multiset into one result and returns the
//! commonest representative, so `astronomer -> moon starer` legitimately comes
//! back as `arrest moon` (`arrest`, `starer`, `rarest` and `raters` are one
//! class). Asserting on surface strings would make these tests fail for a
//! correct engine, and would break again every time frequency data shifted.

use anagram_core::{Counts, Dict, Flow, Memo, Search, SolveOptions, Tier};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

fn dist_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .unwrap()
        .join("apps/web/public/dict")
}

fn artifact(manifest: &str, key: &str) -> Option<String> {
    let anchor = format!("\"{key}\"");
    let start = manifest.find(&anchor)? + anchor.len();
    let rest = &manifest[start..];
    let at = rest.find("\"name\"")? + "\"name\"".len();
    let after = &rest[at..];
    let open = after.find('"')? + 1;
    let close = after[open..].find('"')?;
    Some(after[open..open + close].to_owned())
}

fn load() -> Option<Dict> {
    let dir = dist_dir();
    let manifest = fs::read_to_string(dir.join("manifest.json")).ok()?;
    let full = artifact(&manifest, "full")?;
    let tiers = artifact(&manifest, "tiers")?;
    let dict_bytes = fs::read(dir.join(full)).ok()?;
    let tier_bytes = fs::read(dir.join(tiers)).ok()?;
    Dict::decode(&dict_bytes, Some(&tier_bytes)).ok()
}

macro_rules! dict_or_skip {
    () => {
        match load() {
            Some(d) => d,
            None => {
                eprintln!("skipping: run `pnpm dict:fetch && pnpm dict:build` to enable goldens");
                return;
            }
        }
    };
}

/// Every result, as a sorted multiset of the letter-signatures it uses.
fn solutions(dict: &Dict, input: &str, options: SolveOptions) -> Vec<Vec<Counts>> {
    let search = Search::prepare(dict, input, options).unwrap();
    let mut out = Vec::new();
    search.enumerate(|classes| {
        let mut sig: Vec<Counts> = classes.iter().map(|&c| dict.classes[c as usize].counts).collect();
        sig.sort_by_key(|c| c.to_bytes());
        out.push(sig);
        Flow::Continue
    });
    out
}

fn signature_of(words: &[&str]) -> Vec<Counts> {
    let mut sig: Vec<Counts> = words.iter().map(|w| Counts::from_word(w).unwrap()).collect();
    sig.sort_by_key(|c| c.to_bytes());
    sig
}

fn assert_contains(dict: &Dict, input: &str, expected: &[&str], options: SolveOptions) {
    let want = signature_of(expected);
    let found = solutions(dict, input, options);
    assert!(
        found.contains(&want),
        "{input:?} did not yield {expected:?} ({} results searched)",
        found.len()
    );
}

fn opts(min_word_len: u8, max_words: u8) -> SolveOptions {
    SolveOptions {
        tier: Tier::Standard,
        min_word_len,
        max_words,
        limit: 0,
        max_nodes: u64::MAX,
        ..Default::default()
    }
}

#[test]
fn classic_anagrams() {
    let dict = dict_or_skip!();

    assert_contains(&dict, "dormitory", &["dirty", "room"], opts(3, 2));
    assert_contains(&dict, "astronomer", &["moon", "starer"], opts(4, 2));
    assert_contains(&dict, "conversation", &["conservation"], opts(3, 1));
    assert_contains(&dict, "the eyes", &["they", "see"], opts(3, 2));
    assert_contains(&dict, "debit card", &["bad", "credit"], opts(3, 2));
    assert_contains(&dict, "schoolmaster", &["the", "classroom"], opts(3, 2));
}

#[test]
fn the_name_is_an_anagram_of_what_the_site_does() {
    let dict = dict_or_skip!();
    assert_contains(&dict, "Ars Magna", &["anagrams"], opts(3, 1));
}

#[test]
fn punctuation_digits_and_case_are_ignored() {
    let dict = dict_or_skip!();
    // All four normalize to the same letters, so all four must agree.
    let reference = solutions(&dict, "dormitory", opts(3, 2));
    for variant in ["DORMITORY", "Dor-mit'ory", "dormitory 123", "  d o r m i t o r y  "] {
        assert_eq!(
            solutions(&dict, variant, opts(3, 2)),
            reference,
            "{variant:?} did not normalize to \"dormitory\""
        );
    }
}

#[test]
fn every_result_uses_exactly_the_input_letters() {
    let dict = dict_or_skip!();

    // The load-bearing invariant: nothing added, nothing dropped, nothing
    // reused. Checked across inputs with repeated letters, rare letters, and
    // enough breadth to exercise deep recursion.
    for input in [
        "dormitory",
        "ryanjosephkamp",
        "astronomer",
        "arsmagna",
        "banana",
        "mississippi",
        "woodrow wilson",
        "the quick brown fox",
    ] {
        let target = Counts::from_word(&anagram_core::normalize(input)).unwrap();
        let options = SolveOptions {
            limit: 3_000,
            ..opts(2, anagram_core::UNLIMITED_WORDS)
        };
        let search = Search::prepare(&dict, input, options).unwrap();

        let mut checked = 0usize;
        search.enumerate(|classes| {
            let mut total = Counts::EMPTY;
            for &c in classes {
                total = total.add(dict.classes[c as usize].counts);
            }
            assert_eq!(total, target, "{input:?}: letters not conserved");
            checked += 1;
            Flow::Continue
        });
        assert!(checked > 0, "{input:?} produced no results at all");
    }
}

#[test]
fn every_word_returned_is_in_the_dictionary_and_tier() {
    let dict = dict_or_skip!();
    let lookup: HashMap<&str, usize> = dict
        .words
        .iter()
        .enumerate()
        .map(|(i, w)| (w.as_str(), i))
        .collect();

    for tier in [Tier::Common, Tier::Standard, Tier::Full] {
        let options = SolveOptions {
            tier,
            limit: 500,
            ..opts(3, 4)
        };
        let search = Search::prepare(&dict, "ryanjosephkamp", options).unwrap();
        search.enumerate(|classes| {
            for word in search.spell(&dict, classes, tier) {
                let index = *lookup
                    .get(word.as_str())
                    .unwrap_or_else(|| panic!("{word:?} is not in the dictionary"));
                assert!(
                    dict.in_tier(index as u32, tier),
                    "{word:?} is not a member of {tier:?}"
                );
                assert!(word.len() >= 3, "{word:?} is shorter than minWordLen");
            }
            Flow::Continue
        });
    }
}

#[test]
fn tiers_are_strictly_nested() {
    let dict = dict_or_skip!();
    let at = |tier: Tier| {
        let mut out = std::collections::HashSet::new();
        let search = Search::prepare(&dict, "ryanjosephkamp", SolveOptions { tier, ..opts(3, 3) })
            .unwrap();
        search.enumerate(|classes| {
            let mut sig: Vec<[u8; 32]> = classes
                .iter()
                .map(|&c| dict.classes[c as usize].counts.to_bytes())
                .collect();
            sig.sort();
            out.insert(sig);
            Flow::Continue
        });
        out
    };

    let common = at(Tier::Common);
    let standard = at(Tier::Standard);
    let full = at(Tier::Full);

    assert!(common.is_subset(&standard), "common ⊄ standard");
    assert!(standard.is_subset(&full), "standard ⊄ full");
    assert!(common.len() < full.len(), "tiers should differ in size");
}

#[test]
fn degenerate_inputs_terminate_quickly() {
    let dict = dict_or_skip!();

    for input in ["", "1234!!", "!!!", "   "] {
        let out = solutions(&dict, input, opts(2, 8));
        // No letters means nothing to partition. One empty solution would be
        // defensible mathematically but is a liability in a results list, so
        // the contract is: no results.
        assert!(out.is_empty(), "{input:?} should yield nothing, got {out:?}");
    }

    // A lone `q` has no covering word; the rarest-letter rule must notice
    // immediately rather than scanning the dictionary.
    for input in ["q", "qq", "zzzz", "bcdfg"] {
        let out = solutions(&dict, input, opts(3, 4));
        assert!(out.is_empty(), "{input:?} should yield nothing");
    }
}

#[test]
fn repeated_words_are_allowed_but_emitted_once() {
    let dict = dict_or_skip!();
    // "papa" = pa + pa. The multiset must permit the repeat, and the result must
    // appear exactly once rather than twice under two orderings.
    let found = solutions(&dict, "papa", opts(2, 2));
    let want = signature_of(&["pa", "pa"]);
    assert_eq!(
        found.iter().filter(|s| **s == want).count(),
        1,
        "expected exactly one 'pa pa' result, got {found:?}"
    );
}

#[test]
fn counting_matches_enumeration_on_real_data() {
    let dict = dict_or_skip!();
    for input in ["dormitory", "astronomer", "arsmagna", "woodrowwilson"] {
        let search = Search::prepare(&dict, input, opts(3, 4)).unwrap();
        let mut enumerated = 0u128;
        search.enumerate(|_| {
            enumerated += 1;
            Flow::Continue
        });
        let (counted, saturated, _) = search.count(&mut Memo::new(), u64::MAX);
        assert!(!saturated);
        assert_eq!(counted, enumerated, "{input:?}");
    }
}

#[test]
fn truncated_count_does_not_poison_the_memo() {
    let dict = dict_or_skip!();

    // The browser counts with a node budget and then serves "Go to" and
    // "Surprise me" from the same memo. A count that stops early must leave no
    // partial subtree totals behind, or unranking lands on the wrong result.
    let search = Search::prepare(&dict, "ryanjosephkamp", opts(3, anagram_core::UNLIMITED_WORDS))
        .unwrap();

    let mut streamed: Vec<Vec<u32>> = Vec::new();
    search.enumerate(|classes| {
        streamed.push(classes.to_vec());
        Flow::Continue
    });

    let mut memo = Memo::new();
    let (partial, _, stats) = search.count(&mut memo, 200);
    assert!(stats.truncated, "a 200-node budget must cut the count short");
    assert!((partial as usize) < streamed.len(), "the partial count must be a floor");

    for (i, expected) in streamed.iter().enumerate() {
        assert_eq!(
            search.nth(&mut memo, i as u128).as_ref(),
            Some(expected),
            "nth({i}) diverged from the stream after a truncated count"
        );
    }
    assert_eq!(search.nth(&mut memo, streamed.len() as u128), None);

    // And the same memo now counts exactly, since nothing wrong was cached.
    let (exact, _, _) = search.count(&mut memo, u64::MAX);
    assert_eq!(exact as usize, streamed.len());
}

#[test]
fn a_pinned_word_is_shown_as_the_word_that_was_pinned() {
    let dict = dict_or_skip!();

    // `starer` shares a class with `arrest`, `rarest` and `raters`, and
    // `arrest` is the commoner spelling. Pinning `starer` must still show
    // `starer`: the reader asked for that word and the row has to contain it.
    for (input, pinned) in [("astronomer", "starer"), ("listen", "silent"), ("dormitory", "dirty")] {
        let options = SolveOptions {
            must_include: vec![pinned.to_owned()],
            ..opts(3, anagram_core::UNLIMITED_WORDS)
        };
        let search = Search::prepare(&dict, input, options).unwrap();

        let mut rows = 0usize;
        search.enumerate(|classes| {
            let words = search.spell(&dict, classes, Tier::Standard);
            assert!(
                words.iter().any(|w| w == pinned),
                "{input:?} pinned to {pinned:?} showed {words:?}"
            );
            rows += 1;
            Flow::Continue
        });
        assert!(rows > 0, "{input:?} with {pinned:?} produced no rows");

        // Unranked results are spelled the same way as streamed ones.
        let first = search.nth(&mut Memo::new(), 0).unwrap();
        assert!(search.spell(&dict, &first, Tier::Standard).iter().any(|w| w == pinned));
    }
}

#[test]
fn round_trip_recall() {
    let dict = dict_or_skip!();

    // Build inputs that are guaranteed to have a solution by concatenating
    // known words, then check the engine finds that exact combination back.
    // Random strings mostly have no solution, so they test nothing about recall.
    // Every word here must exist in English OpenList. Note that proper nouns are
    // excluded from the dataset by design, so "ryan" and "kamp" are not words —
    // a name only anagrams into common vocabulary.
    let cases: [&[&str]; 6] = [
        &["dirty", "room"],
        &["moon", "starer"],
        &["anagram", "solver"],
        &["great", "art"],
        &["silent", "night"],
        &["joseph", "prank", "may"],
    ];

    for words in cases {
        let input: String = words.concat();
        let max_words = words.len() as u8;
        assert_contains(&dict, &input, words, opts(3, max_words));
    }
}
