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

use anagram_core::{Counts, Dict, Flow, Memo, Search, SolveOptions, TextRow, Tier};
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
    // All three are the one word `dormitory`, so all three must agree. A
    // hyphen, an apostrophe and punctuation carry no letters and end no word.
    let reference = solutions(&dict, "dormitory", opts(3, 2));
    for variant in ["DORMITORY", "Dor-mit'ory", "dormitory!!", "dormitory, .", "dormitory 123"] {
        assert_eq!(
            solutions(&dict, variant, opts(3, 2)),
            reference,
            "{variant:?} did not normalize to \"dormitory\""
        );
    }

    // Spaces do end a word. The same letters typed apart are not the word
    // `dormitory`, so that row is a result of theirs, a re-spacing, where
    // the word itself left it out. Nothing else differs.
    let word = signature_of(&["dormitory"]);
    assert!(!reference.contains(&word), "the text is never its own result");
    let mut spaced = solutions(&dict, "  d o r m i t o r y  ", opts(3, 2));
    let at = spaced.iter().position(|row| *row == word).expect("a re-spacing is a result");
    spaced.remove(at);
    assert_eq!(spaced, reference);
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

    for tier in [Tier::Common, Tier::Standard, Tier::Full, Tier::Extended] {
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
    let extended = at(Tier::Extended);

    assert!(common.is_subset(&standard), "common ⊄ standard");
    assert!(standard.is_subset(&full), "standard ⊄ full");
    // Full stopped being the unfiltered tier when the site gained words of its
    // own; this is the assertion that would catch the bitset mapping drifting,
    // since a dictionary built without tiers reports every word in every tier.
    assert!(full.is_subset(&extended), "full ⊄ extended");
    assert!(common.len() < full.len(), "tiers should differ in size");
}

#[test]
fn degenerate_inputs_terminate_quickly() {
    let dict = dict_or_skip!();

    // A number is left out (the literal rule), so these have nothing in them.
    for input in ["", "1234!!", "!!!", "   ", "?!.,"] {
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
fn more_than_127_of_one_letter_is_an_error_not_an_empty_result() {
    let dict = dict_or_skip!();

    // Counts are bytes with a 127 ceiling. Past it the input used to collapse
    // to an empty multiset, whose single partition is the empty one: the site
    // said "1 anagram" and showed a blank row. A pasted paragraph crosses the
    // ceiling on the letter e at roughly 1,100 characters.
    let just_under = "a".repeat(127) + "dormitory";
    let search = Search::prepare(&dict, &just_under, opts(2, anagram_core::UNLIMITED_WORDS)).unwrap();
    let mut rows = 0usize;
    search.enumerate(|_| {
        rows += 1;
        Flow::Continue
    });
    assert!(rows > 0, "127 repeats is within range and must still solve");

    let over = "a".repeat(128) + "dormitory";
    let result = Search::prepare(&dict, &over, opts(2, anagram_core::UNLIMITED_WORDS));
    match result {
        Err(anagram_core::SolveError::TooManyRepeats('a')) => {}
        Err(other) => panic!("expected TooManyRepeats('a'), got {other:?}"),
        Ok(search) => {
            let (count, _, _) = search.count(&mut Memo::new(), 1_000);
            panic!("128 repeats must be an error, not {count} result(s)");
        }
    }
}

#[test]
fn accented_spellings_search_the_same_letters_as_plain_ones() {
    let dict = dict_or_skip!();

    // Every accented letter folds to its base letter, so an accented name and
    // its plain spelling are the same query. Before, the accent was dropped
    // along with its letter: "Beyoncé" searched as "beyonc".
    for (accented, plain) in [
        ("Beyoncé Knowles", "beyonce knowles"),
        ("Penélope Cruz", "penelope cruz"),
        ("Zoë Kravitz", "zoe kravitz"),
        ("Renée Zellweger", "renee zellweger"),
        ("Björk", "bjork"),
        ("Motörhead", "motorhead"),
        ("Straße", "strasse"),
    ] {
        let options = opts(3, 3);
        let a = solutions(&dict, accented, options.clone());
        let b = solutions(&dict, plain, options);
        assert_eq!(a, b, "{accented:?} and {plain:?} must give the same results");
        assert_eq!(
            anagram_core::normalize(accented).len(),
            anagram_core::normalize(plain).len(),
            "{accented:?} lost or gained a letter"
        );
    }
}

#[test]
fn class_index_agrees_with_a_linear_scan() {
    let dict = dict_or_skip!();

    // `find_class` used to scan every class; it now probes a hash index. The
    // two must agree for every word at every tier, including words that exist
    // only at Full and words whose class has members across tiers.
    let scan = |word: &str, tier: Tier| -> Option<usize> {
        let counts = Counts::from_word(word)?;
        dict.classes.iter().position(|c| {
            c.counts == counts && c.words.iter().any(|&i| dict.word(i) == word && dict.in_tier(i, tier))
        })
    };

    let mut checked = 0usize;
    for word in dict.words.iter().step_by(97) {
        for tier in [Tier::Common, Tier::Standard, Tier::Full] {
            assert_eq!(dict.find_class(word, tier), scan(word, tier), "{word:?} at {tier:?}");
            checked += 1;
        }
    }
    assert!(checked > 10_000);

    // Words that are not in the list at all, including anagrams of real words.
    for word in ["tinsle", "zzzz", "beyonce", "arsmagna"] {
        assert_eq!(dict.find_class(word, Tier::Full), scan(word, Tier::Full), "{word:?}");
    }
}

#[test]
fn pages_served_by_the_cursor_concatenate_to_one_enumeration() {
    let dict = dict_or_skip!();

    // Pages of a real result set, each fetched by seeking to its offset the
    // way the worker does when the reader jumps, must join back into exactly
    // the stream a single enumeration produces.
    let search = Search::prepare(&dict, "scarlett johansson", opts(3, 4)).unwrap();
    let mut streamed: Vec<Vec<u32>> = Vec::new();
    search.enumerate(|classes| {
        streamed.push(classes.to_vec());
        Flow::Continue
    });
    assert!(streamed.len() > 50_000, "expected a large result set, got {}", streamed.len());

    let mut memo = Memo::new();
    let page = 5_000usize;
    let mut joined: Vec<Vec<u32>> = Vec::new();
    let mut offset = 0usize;
    while offset < streamed.len() {
        let mut cursor = search.cursor_at(&mut memo, offset as u128).expect("offset in range");
        for _ in 0..page {
            match cursor.next(&search) {
                Some(classes) => joined.push(classes.to_vec()),
                None => break,
            }
        }
        offset += page;
    }
    assert_eq!(joined, streamed);

    // And sequential paging from one cursor, without seeking, is the same.
    let mut cursor = search.cursor();
    let mut sequential: Vec<Vec<u32>> = Vec::new();
    loop {
        let before = sequential.len();
        for _ in 0..page {
            match cursor.next(&search) {
                Some(classes) => sequential.push(classes.to_vec()),
                None => break,
            }
        }
        if sequential.len() == before {
            break;
        }
    }
    assert_eq!(sequential, streamed);
    assert!(cursor.is_done() && !cursor.truncated());
}

#[test]
fn a_page_at_a_random_offset_equals_the_unranked_slice() {
    let dict = dict_or_skip!();

    // The case from the audit: 85,182 results, where page 340 used to cost
    // a full re-enumeration. Random offsets, compared against nth() so the
    // test does not need to enumerate the whole set.
    let search = Search::prepare(&dict, "arnold schwarzenegger", opts(3, 4)).unwrap();
    let mut memo = Memo::new();
    let (total, saturated, _) = search.count(&mut memo, u64::MAX);
    assert!(!saturated && total > 80_000, "total {total}");

    // A fixed linear congruential sequence: deterministic, spread out.
    let mut seed: u64 = 0x9E37_79B9_7F4A_7C15;
    for _ in 0..25 {
        seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let offset = (seed >> 33) as u128 % total;
        let len = 37usize;

        let mut cursor = search.cursor_at(&mut memo, offset).expect("offset in range");
        let mut page: Vec<Vec<u32>> = Vec::new();
        for _ in 0..len {
            match cursor.next(&search) {
                Some(classes) => page.push(classes.to_vec()),
                None => break,
            }
        }

        let expected: Vec<Vec<u32>> = (0..len as u128)
            .filter_map(|i| search.nth(&mut memo, offset + i))
            .collect();
        assert_eq!(page, expected, "page at offset {offset}");
        assert_eq!(cursor.position(), offset + page.len() as u128);
    }

    // Past the end is None, not a panic and not an empty cursor that lies.
    assert!(search.cursor_at(&mut memo, total).is_none());

    // With a pinned word, the forced slot leads every result the cursor emits.
    let pinned = SolveOptions {
        must_include: vec!["moon".to_owned()],
        ..opts(3, anagram_core::UNLIMITED_WORDS)
    };
    let search = Search::prepare(&dict, "astronomer", pinned).unwrap();
    let mut streamed: Vec<Vec<u32>> = Vec::new();
    search.enumerate(|classes| {
        streamed.push(classes.to_vec());
        Flow::Continue
    });
    let mut memo = Memo::new();
    for start in [0usize, 1, streamed.len() / 2, streamed.len() - 1] {
        let mut cursor = search.cursor_at(&mut memo, start as u128).unwrap();
        let mut rest = Vec::new();
        while let Some(classes) = cursor.next(&search) {
            rest.push(classes.to_vec());
        }
        assert_eq!(rest, &streamed[start..], "pinned, resumed from {start}");
    }
}

#[test]
fn a_memo_cap_yields_a_floor_rather_than_unbounded_growth() {
    let dict = dict_or_skip!();

    // A 26-letter phrase needs ~140k memo entries to count exactly. Capped
    // far below that, the count must stop, say so, hold the memo near the cap,
    // and still be usable for unranking afterwards.
    let search = Search::prepare(
        &dict,
        "president of the united states",
        opts(3, anagram_core::UNLIMITED_WORDS),
    )
    .unwrap();

    let mut capped = Memo::with_cap(2_000);
    let (floor, saturated, stats) = search.count(&mut capped, u64::MAX);
    assert!(stats.truncated, "the cap must cut the count short");
    assert!(!saturated);
    assert!(floor > 0);
    assert!(capped.len() <= 2_000 + 64, "memo held {} entries against a cap of 2,000", capped.len());

    let mut exact = Memo::new();
    let (total, _, exact_stats) = search.count(&mut exact, u64::MAX);
    assert!(!exact_stats.truncated);
    assert!(floor < total, "floor {floor} must be below the exact total {total}");
    assert_eq!(exact.cap(), anagram_core::DEFAULT_MEMO_CAP);

    // Unranking is not held to the cap, and the capped memo was not poisoned.
    let first = search.nth(&mut capped, 0).expect("result 0 exists");
    assert_eq!(Some(first), search.nth(&mut exact, 0));
}

#[test]
fn short_words_reach_the_classics_that_need_an_everyday_word() {
    let dict = dict_or_skip!();

    // The Greatest Hits pipeline runs at minWordLen 3, which puts "has to
    // pilfer" and "a rope ends it" out of reach: each needs a one- or
    // two-letter word. The allowlist admits those few words without opening
    // the door to every two-letter Scrabble play.
    let options = SolveOptions {
        tier: Tier::Common,
        min_word_len: 3,
        short_words: Some(
            ["a", "i", "it", "to", "has", "of"].iter().map(|w| w.to_string()).collect(),
        ),
        max_words: 5,
        limit: 0,
        ..Default::default()
    };
    assert_contains(&dict, "a shoplifter", &["has", "to", "pilfer"], options.clone());
    assert_contains(&dict, "desperation", &["a", "rope", "ends", "it"], options.clone());

    // Without the list, the same options cannot reach either.
    let without = SolveOptions { short_words: None, ..options };
    for (input, words) in [
        ("a shoplifter", &["has", "to", "pilfer"][..]),
        ("desperation", &["a", "rope", "ends", "it"][..]),
    ] {
        let found = solutions(&dict, input, without.clone());
        assert!(
            !found.contains(&signature_of(words)),
            "{input:?} reached {words:?} with no allowlist"
        );
        assert!(found.iter().all(|sig| sig.iter().all(|c| c.total() >= 3)));
    }
}

#[test]
fn a_short_word_outside_the_query_tier_does_not_admit_its_class() {
    let dict = dict_or_skip!();

    // A two-letter word that exists only above Common: listed, it admits its
    // class at Full and not at Common, because the list is read in the
    // query's tier like everything else.
    let Some(rare) = dict
        .words
        .iter()
        .enumerate()
        .find(|(i, w)| w.len() == 2 && !dict.in_tier(*i as u32, Tier::Common))
        .map(|(_, w)| w.as_str())
    else {
        eprintln!("skipping: every two-letter word is Common in this dictionary");
        return;
    };
    let options = |tier: Tier| SolveOptions {
        tier,
        short_words: Some(vec![rare.to_owned()]),
        ..opts(3, 1)
    };

    // Typed with a space in it: the word itself is never its own result, and
    // its two letters, typed apart, are not words here.
    let spaced = format!("{} {}", &rare[..1], &rare[1..]);
    assert!(
        solutions(&dict, &spaced, options(Tier::Common)).is_empty(),
        "{rare:?} is not Common, so listing it must admit nothing at Common"
    );
    assert_eq!(solutions(&dict, &spaced, options(Tier::Full)), vec![signature_of(&[rare])]);
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

/// The site's own settings: Standard, words of two letters and up, no cap.
fn site() -> SolveOptions {
    opts(2, anagram_core::UNLIMITED_WORDS)
}

#[test]
fn the_text_is_never_its_own_result_on_the_shipped_dictionary() {
    let dict = dict_or_skip!();

    // (text, what became of its row, the count, the row's words as shown)
    //
    // The counts before this rule were 116, 6, 1, 6, 17, 1,288 and 588: a
    // dropped row is one fewer and a respelled one changes nothing.
    let cases: [(&str, TextRow, u128, Option<&[&str]>); 9] = [
        ("dormitory", TextRow::Dropped, 115, None),
        ("house", TextRow::Dropped, 5, None),
        ("rhythm", TextRow::Dropped, 0, None),
        ("below", TextRow::Respelled, 6, Some(&["elbow"])),
        ("listen", TextRow::Respelled, 17, Some(&["silent"])),
        ("apple house", TextRow::Respelled, 1_288, Some(&["appel", "house"])),
        ("house apple", TextRow::Respelled, 1_288, Some(&["appel", "house"])),
        // `cause` is commoner than `sauce`, so this row never showed the text.
        ("apple sauce", TextRow::Shown, 588, Some(&["apple", "cause"])),
        // One word that is no word: the letters alone, and the re-spacing stays.
        ("applesauce", TextRow::Dropped, 587, None),
    ];

    for (text, fate, total, shown) in cases {
        let search = Search::prepare(&dict, text, site()).unwrap();
        assert_eq!(search.text_row(), fate, "{text:?}");

        let mut memo = Memo::new();
        let (counted, saturated, _) = search.count(&mut memo, u64::MAX);
        assert!(!saturated);
        assert_eq!(counted, total, "{text:?}: count");

        let own = signature_of(&anagram_core::text_words(text).iter().map(String::as_str).collect::<Vec<_>>());
        let mut typed = anagram_core::text_words(text);
        typed.sort();
        let mut rows = 0u128;
        let mut found: Option<Vec<String>> = None;
        search.enumerate(|classes| {
            let mut words = search.spell(&dict, classes, Tier::Standard);
            words.sort();
            assert_ne!(words, typed, "{text:?} is one of its own results");
            let mut sig: Vec<Counts> = classes.iter().map(|&c| dict.classes[c as usize].counts).collect();
            sig.sort_by_key(|c| c.to_bytes());
            if sig == own {
                found = Some(words);
            }
            rows += 1;
            Flow::Continue
        });
        assert_eq!(rows, total, "{text:?}: enumerated");
        let want = shown.map(|words| {
            let mut words: Vec<String> = words.iter().map(|w| w.to_string()).collect();
            words.sort();
            words
        });
        assert_eq!(found, want, "{text:?}: how the text's own row is shown");

        // Past the last result there is nothing, where the dropped row used to be.
        assert!(search.nth(&mut memo, total).is_none(), "{text:?}: nth past the end");
        if total > 0 {
            assert!(search.nth(&mut memo, total - 1).is_some());
        }
    }

    // `applesauce` is a result of "apple sauce": the same letters, spaced differently.
    assert_contains(&dict, "apple sauce", &["applesauce"], site());
}

#[test]
fn must_exclude_still_counts_what_it_counted() {
    let dict = dict_or_skip!();

    // `hassabis` is not a word, so this text has no row of its own and the
    // figures the manual quotes stand: 15,202, and 14,312 without `ai`.
    let plain = Search::prepare(&dict, "Demis Hassabis", site()).unwrap();
    assert_eq!(plain.text_row(), TextRow::None);
    assert_eq!(plain.count(&mut Memo::new(), u64::MAX).0, 15_202);

    let without = SolveOptions { exclude: vec!["ai".to_owned()], ..site() };
    let search = Search::prepare(&dict, "Demis Hassabis", without).unwrap();
    assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 14_312);
}

#[test]
fn must_include_of_every_word_of_the_text_leaves_nothing() {
    let dict = dict_or_skip!();

    let pinned = |words: &[&str]| SolveOptions {
        must_include: words.iter().map(|w| w.to_string()).collect(),
        ..site()
    };
    // Both words pinned as typed: the only result would be the text.
    let search = Search::prepare(&dict, "apple house", pinned(&["apple", "house"])).unwrap();
    assert_eq!(search.text_row(), TextRow::Dropped);
    assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 0);
    assert!(search.cursor().next(&search).is_none());
    assert!(search.nth(&mut Memo::new(), 0).is_none());
    assert!(search.cursor_at(&mut Memo::new(), 0).is_none());

    // One pinned: its slot stays as typed and the free one takes the other spelling.
    let search = Search::prepare(&dict, "apple house", pinned(&["house"])).unwrap();
    assert_eq!(search.text_row(), TextRow::Respelled);
    let first = search.nth(&mut Memo::new(), 0).unwrap();
    let mut rows = Vec::new();
    search.enumerate(|classes| {
        rows.push(search.spell(&dict, classes, Tier::Standard));
        Flow::Continue
    });
    assert!(rows.contains(&vec!["house".to_owned(), "appel".to_owned()]), "{:?}", &rows[..rows.len().min(5)]);
    assert!(!rows.contains(&vec!["house".to_owned(), "apple".to_owned()]));
    assert_eq!(first[0], dict.find_class("house", Tier::Standard).unwrap() as u32);

    // The other spelling pinned: the row already differs from the text.
    let search = Search::prepare(&dict, "apple house", pinned(&["appel"])).unwrap();
    assert_eq!(search.text_row(), TextRow::Shown);
}

#[test]
fn rank_is_the_inverse_of_nth_on_real_result_sets() {
    let dict = dict_or_skip!();

    // Whole result sets, one that dropped its row and one that did not.
    for text in ["dormitory", "apple sauce", "below", "house"] {
        let search = Search::prepare(&dict, text, site()).unwrap();
        let mut memo = Memo::new();
        let (total, _, _) = search.count(&mut memo, u64::MAX);
        for index in 0..total {
            let row = search.nth(&mut memo, index).unwrap();
            assert_eq!(search.rank(&mut memo, &row, u64::MAX), Some(index), "{text:?}: rank(nth({index}))");
        }
    }

    // And spread across a large one, where neither could be checked by walking.
    let search = Search::prepare(&dict, "arnold schwarzenegger", opts(3, 4)).unwrap();
    let mut memo = Memo::new();
    let (total, saturated, _) = search.count(&mut memo, u64::MAX);
    assert!(!saturated && total > 80_000);
    let mut seed: u64 = 0x9E37_79B9_7F4A_7C15;
    for _ in 0..200 {
        seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let index = (seed >> 33) as u128 % total;
        let row = search.nth(&mut memo, index).unwrap();
        assert_eq!(search.rank(&mut memo, &row, u64::MAX), Some(index), "rank(nth({index}))");
    }
}

#[test]
fn a_stopped_count_of_a_query_that_dropped_its_row_is_still_a_floor() {
    let dict = dict_or_skip!();

    let search = Search::prepare(&dict, "dormitory", site()).unwrap();
    let mut streamed: Vec<Vec<u32>> = Vec::new();
    search.enumerate(|classes| {
        streamed.push(classes.to_vec());
        Flow::Continue
    });
    assert_eq!(streamed.len(), 115);

    let mut memo = Memo::new();
    let (floor, _, stats) = search.count(&mut memo, 20);
    assert!(stats.truncated, "a 20-node budget must cut the count short");
    assert!(floor < 115, "the floor {floor} must be below the exact total");

    // The list, Go to and Surprise me still leave the row out, in the same places.
    for (i, expected) in streamed.iter().enumerate() {
        assert_eq!(search.nth(&mut memo, i as u128).as_ref(), Some(expected), "nth({i}) after a stopped count");
    }
    assert_eq!(search.nth(&mut memo, 115), None);
    let (exact, _, _) = search.count(&mut memo, u64::MAX);
    assert_eq!(exact, 115);
}
