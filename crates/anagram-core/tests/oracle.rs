//! The completeness oracle.
//!
//! This is the most important test in the repository. The search combines two
//! optimizations — rarest-letter branching and index canonicalization — that are
//! individually standard and *jointly wrong* if written the obvious way: the
//! combination drops real solutions without any sign that it has done so. See
//! the module docs in `search.rs`.
//!
//! The only defence against that failure mode is to compare against an
//! implementation too simple to be wrong. The naive enumerator below tries every
//! candidate at every step and deduplicates with a hash set. It is far too slow
//! for real inputs, but on a small dictionary it is exhaustive by construction.
//!
//! Both implementations must produce **set-identical** results, not merely the
//! same count.

use anagram_core::{Counts, Dict, Flow, Memo, Search, SolveOptions, Tier};
use std::collections::HashSet;

/// A deliberately unclever enumerator: no pivots, no canonical order, no runs.
/// Every subset that fits is tried, and duplicates are removed at the end.
fn naive(dict: &Dict, input: &str, min_word_len: u8) -> HashSet<Vec<String>> {
    let normalized = anagram_core::normalize(input);
    // Matches the engine's contract: an input with no letters is not a query,
    // so it yields nothing rather than one empty solution.
    if normalized.is_empty() {
        return HashSet::new();
    }
    let target = Counts::from_word(&normalized).unwrap();

    let usable: Vec<(usize, Counts)> = dict
        .classes
        .iter()
        .enumerate()
        .filter(|(_, c)| c.len >= min_word_len && c.counts.fits_in(target))
        .map(|(i, c)| (i, c.counts))
        .collect();

    let mut out = HashSet::new();
    let mut stack: Vec<usize> = Vec::new();

    fn walk(
        dict: &Dict,
        usable: &[(usize, Counts)],
        rem: Counts,
        stack: &mut Vec<usize>,
        out: &mut HashSet<Vec<String>>,
    ) {
        if rem.is_empty() {
            let mut words: Vec<String> = stack
                .iter()
                .map(|&c| dict.word(dict.classes[c].words[0]).to_owned())
                .collect();
            words.sort();
            out.insert(words);
            return;
        }
        for &(class, counts) in usable {
            if !counts.fits_in(rem) {
                continue;
            }
            stack.push(class);
            walk(dict, usable, rem.sub(counts), stack, out);
            stack.pop();
        }
    }

    walk(dict, &usable, target, &mut stack, &mut out);
    out
}

fn fast(dict: &Dict, input: &str, min_word_len: u8) -> HashSet<Vec<String>> {
    let options = SolveOptions {
        tier: Tier::Full,
        min_word_len,
        limit: 0,
        ..Default::default()
    };
    let search = Search::prepare(dict, input, options).unwrap();
    let mut out = HashSet::new();
    let mut emitted = 0usize;
    search.enumerate(|classes| {
        emitted += 1;
        let mut words = search.spell(&dict, classes, Tier::Full);
        words.sort();
        out.insert(words);
        Flow::Continue
    });
    // Every solution must be produced exactly once. If the run rule were broken
    // in the other direction — emitting duplicates — the set would be smaller
    // than the emission count and this would catch it.
    assert_eq!(
        emitted,
        out.len(),
        "search emitted {emitted} results but only {} were distinct",
        out.len()
    );
    out
}

fn small_dict() -> Dict {
    Dict::from_words([
        "a", "ab", "abc", "act", "ad", "am", "an", "and", "ant", "ar", "arm", "art", "as", "at",
        "ate", "bad", "bat", "be", "bed", "cab", "cam", "can", "car", "cat", "cent", "coy", "cry",
        "dam", "dart", "dean", "dear", "den", "die", "dirty", "do", "doc", "dog", "dorm", "dot",
        "dry", "ear", "eat", "elints", "enlist", "eta", "girt", "god", "goo", "grid", "grit",
        "he", "hen", "her", "hot", "id", "in", "inlets", "is", "it", "la", "lain", "listen", "lit",
        "man", "mat", "me", "mid", "moo", "mood", "moon", "moor", "moot", "mort", "my", "nail",
        "net", "no", "nod", "nor", "not", "note", "notes", "oar", "od", "of", "oh", "on", "one",
        "onset", "or", "ore", "otter", "oy", "rat", "rate", "ray", "red", "rid", "ride", "riot",
        "rod", "rom", "room", "root", "rot", "sane", "sat", "seton", "silent", "so", "son", "star",
        "stare", "starer", "stone", "tan", "tar", "tea", "ten", "tinsel", "to", "toe", "tom",
        "tone", "tones", "tor", "tore", "trim", "trio", "try", "yam", "yard", "trod", "tidy",
        "moody", "root", "motor", "dirt", "toy", "rim", "mod", "dim", "mid", "trim", "midtor",
    ])
    .unwrap()
}

#[test]
fn matches_naive_enumerator() {
    let dict = small_dict();

    // Short enough that the naive enumerator finishes, varied enough to hit
    // repeated letters, single-solution inputs, and inputs with none.
    let inputs = [
        "dormitory",
        "listen",
        "stone",
        "moondirt",
        "cat",
        "tomcat",
        "antdear",
        "notes",
        "dirtroom",
        "artdean",
        "candied",
        "moonstar",
        "",
        "zzz",
        "q",
    ];

    for input in inputs {
        for min_word_len in [1u8, 2, 3] {
            let expected = naive(&dict, input, min_word_len);
            let actual = fast(&dict, input, min_word_len);

            let missing: Vec<_> = expected.difference(&actual).collect();
            let extra: Vec<_> = actual.difference(&expected).collect();

            assert!(
                missing.is_empty() && extra.is_empty(),
                "input {input:?} minLen={min_word_len}\n  missing {missing:?}\n  extra   {extra:?}"
            );
        }
    }
}

#[test]
fn count_agrees_with_enumeration() {
    let dict = small_dict();
    for input in ["dormitory", "listen", "moondirt", "tomcat", "artdean", "stone"] {
        for min_word_len in [1u8, 2, 3] {
            let options = SolveOptions {
                tier: Tier::Full,
                min_word_len,
                limit: 0,
                ..Default::default()
            };
            let search = Search::prepare(&dict, input, options).unwrap();

            let mut enumerated = 0u128;
            search.enumerate(|_| {
                enumerated += 1;
                Flow::Continue
            });

            let (counted, saturated, _) = search.count(&mut Memo::new(), u64::MAX);
            assert!(!saturated);
            assert_eq!(
                counted, enumerated,
                "input {input:?} minLen={min_word_len}: count {counted} != enumerated {enumerated}"
            );
        }
    }
}

#[test]
fn unrank_walks_the_same_order_as_enumeration() {
    let dict = small_dict();
    for input in ["dormitory", "moondirt", "tomcat", "listen"] {
        let options = SolveOptions {
            tier: Tier::Full,
            min_word_len: 2,
            limit: 0,
            ..Default::default()
        };
        let search = Search::prepare(&dict, input, options).unwrap();

        let mut streamed: Vec<Vec<u32>> = Vec::new();
        search.enumerate(|classes| {
            streamed.push(classes.to_vec());
            Flow::Continue
        });

        // One memo, reused across every lookup — this is exactly how a paging
        // session uses it, so the test also covers memo reuse being sound.
        let mut memo = Memo::new();
        for (i, expected) in streamed.iter().enumerate() {
            let actual = search.nth(&mut memo, i as u128);
            assert_eq!(
                actual.as_ref(),
                Some(expected),
                "input {input:?}: nth({i}) diverged from the stream"
            );
        }
        // One past the end must be None, not a panic or a wrapped result.
        assert_eq!(search.nth(&mut memo, streamed.len() as u128), None);
    }
}

#[test]
fn max_words_filter_is_a_subset() {
    let dict = small_dict();
    let make = |max_words: u8| {
        let options = SolveOptions {
            tier: Tier::Full,
            min_word_len: 2,
            max_words,
            limit: 0,
            ..Default::default()
        };
        let search = Search::prepare(&dict, "dormitory", options).unwrap();
        let mut out = HashSet::new();
        search.enumerate(|classes| {
            let mut w = search.spell(&dict, classes, Tier::Full);
            w.sort();
            out.insert(w);
            Flow::Continue
        });
        out
    };

    let two = make(2);
    let three = make(3);
    let unlimited = make(anagram_core::UNLIMITED_WORDS);

    assert!(two.is_subset(&three), "maxWords=2 must be a subset of 3");
    assert!(three.is_subset(&unlimited));
    assert!(two.iter().all(|s| s.len() <= 2));
    assert!(three.iter().all(|s| s.len() <= 3));
}

#[test]
fn count_respects_max_words() {
    let dict = small_dict();
    for max_words in [1u8, 2, 3, 4] {
        let options = SolveOptions {
            tier: Tier::Full,
            min_word_len: 2,
            max_words,
            limit: 0,
            ..Default::default()
        };
        let search = Search::prepare(&dict, "dormitory", options).unwrap();

        let mut enumerated = 0u128;
        search.enumerate(|_| {
            enumerated += 1;
            Flow::Continue
        });
        let (counted, _, _) = search.count(&mut Memo::new(), u64::MAX);
        assert_eq!(counted, enumerated, "maxWords={max_words}");
    }
}
