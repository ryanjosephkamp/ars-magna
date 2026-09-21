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
//!
//! The naive side works in spellings, where the engine works in classes, so it
//! is also the check on the rule that the text is never its own result: there
//! the rule is one line, the text's words taken out of the set, and the engine
//! has to arrive at the same rows by way of respelling one and dropping another.

use anagram_core::{Counts, Dict, Flow, Memo, Search, SolveOptions, TextRow, Tier};
use std::collections::HashSet;

/// A query, as both enumerators are given it.
#[derive(Clone, Copy)]
struct Spec<'a> {
    input: &'a str,
    min_word_len: u8,
    /// `None` and an empty list mean the same to the naive side.
    short_words: Option<&'a [&'a str]>,
    include: &'a [&'a str],
    exclude: &'a [&'a str],
    max_words: u8,
}

impl<'a> Spec<'a> {
    fn of(input: &'a str, min_word_len: u8) -> Spec<'a> {
        Spec {
            input,
            min_word_len,
            short_words: None,
            include: &[],
            exclude: &[],
            max_words: anagram_core::UNLIMITED_WORDS,
        }
    }

    fn options(&self) -> SolveOptions {
        let owned = |words: &[&str]| words.iter().map(|w| w.to_string()).collect::<Vec<_>>();
        SolveOptions {
            tier: Tier::Full,
            min_word_len: self.min_word_len,
            short_words: self.short_words.map(owned),
            max_words: self.max_words,
            must_include: owned(self.include),
            exclude: owned(self.exclude),
            limit: 0,
            ..Default::default()
        }
    }
}

/// A row by what it is rather than how it is spelled: each word's letters
/// sorted, then the words sorted. Two spellings of one result share a key.
fn key(words: &[String]) -> Vec<String> {
    let mut out: Vec<String> = words
        .iter()
        .map(|w| {
            let mut letters: Vec<char> = w.chars().collect();
            letters.sort_unstable();
            letters.into_iter().collect()
        })
        .collect();
    out.sort();
    out
}

fn sorted(mut words: Vec<String>) -> Vec<String> {
    words.sort();
    words
}

/// A deliberately unclever enumerator: no pivots, no canonical order, no runs,
/// and no classes either. It works in *spellings*: every word of the query's
/// vocabulary is tried at every step, and duplicates are removed at the end.
/// So what comes back is every way to write the letters in words, as sorted
/// word lists, and the rule about the text is the plainest thing it could be:
/// take the text's own words out of that set.
///
/// The vocabulary is computed here, not asked of the engine: a word counts
/// when it is long enough, or when `short_words` lists any spelling of its
/// letters (the engine admits a class whole), and when `exclude` does not
/// name it. Must-include words are set aside first and need pass no test but
/// being in the dictionary, which is how the engine treats a pinned word.
fn naive_spellings(dict: &Dict, spec: Spec) -> HashSet<Vec<String>> {
    let normalized = anagram_core::normalize(spec.input);
    // Matches the engine's contract: an input with no letters is not a query,
    // so it yields nothing rather than one empty solution.
    if normalized.is_empty() {
        return HashSet::new();
    }
    let mut target = Counts::from_word(&normalized).unwrap();
    for word in spec.include {
        target = target.sub(Counts::from_word(word).unwrap());
    }
    let room = (spec.max_words as usize).saturating_sub(spec.include.len());
    let short = spec.short_words.unwrap_or_default();

    let usable: Vec<(&str, Counts)> = dict
        .classes
        .iter()
        .filter(|c| {
            let long_enough = c.len >= spec.min_word_len;
            let listed = c.words.iter().any(|&w| short.contains(&dict.word(w)));
            (long_enough || listed) && c.counts.fits_in(target)
        })
        .flat_map(|c| c.words.iter().map(|&w| (dict.word(w), c.counts)))
        .filter(|(word, _)| !spec.exclude.contains(word))
        .collect();

    let mut out = HashSet::new();
    let mut stack: Vec<&str> = spec.include.to_vec();

    fn walk<'d>(
        usable: &[(&'d str, Counts)],
        rem: Counts,
        room: usize,
        stack: &mut Vec<&'d str>,
        out: &mut HashSet<Vec<String>>,
    ) {
        if rem.is_empty() {
            out.insert(sorted(stack.iter().map(|w| w.to_string()).collect()));
            return;
        }
        if room == 0 {
            return;
        }
        for &(word, counts) in usable {
            if !counts.fits_in(rem) {
                continue;
            }
            stack.push(word);
            walk(usable, rem.sub(counts), room - 1, stack, out);
            stack.pop();
        }
    }

    if spec.include.len() <= spec.max_words as usize {
        walk(&usable, target, room, &mut stack, &mut out);
    }

    // The text itself, its words in any order, is never a result.
    out.remove(&sorted(anagram_core::text_words(spec.input)));
    out
}

/// The rows the naive enumerator says exist: a row exists while it still has
/// a spelling.
fn naive_rows(dict: &Dict, spec: Spec) -> HashSet<Vec<String>> {
    naive_spellings(dict, spec).iter().map(|words| key(words)).collect()
}

/// The engine's rows for the same query, with every check that can be made
/// on the way: each row once, and each shown in a spelling the naive side
/// also found, which is never the text.
fn fast_rows(dict: &Dict, spec: Spec) -> HashSet<Vec<String>> {
    let spellings = naive_spellings(dict, spec);
    let search = Search::prepare(dict, spec.input, spec.options()).unwrap();
    let mut out = HashSet::new();
    let mut emitted = 0usize;
    search.enumerate(|classes| {
        emitted += 1;
        let words = sorted(search.spell(dict, classes, Tier::Full));
        assert!(
            spellings.contains(&words),
            "{:?}: the engine showed {words:?}, which is not a way to write these letters here",
            spec.input
        );
        out.insert(key(&words));
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

fn naive(dict: &Dict, input: &str, min_word_len: u8, short_words: &[&str]) -> HashSet<Vec<String>> {
    naive_rows(dict, Spec { short_words: Some(short_words), ..Spec::of(input, min_word_len) })
}

fn fast(dict: &Dict, input: &str, min_word_len: u8, short_words: Option<&[&str]>) -> HashSet<Vec<String>> {
    fast_rows(dict, Spec { short_words, ..Spec::of(input, min_word_len) })
}

/// Every view of one query's results must be the same list: the count, the
/// stream, unranking, ranking, a cursor from zero and a cursor from anywhere.
/// Returns the stream.
fn views_agree(dict: &Dict, spec: Spec) -> Vec<Vec<u32>> {
    let what = format!(
        "{:?} min={} short={:?} include={:?} exclude={:?} max={}",
        spec.input, spec.min_word_len, spec.short_words, spec.include, spec.exclude, spec.max_words
    );
    let search = Search::prepare(dict, spec.input, spec.options()).unwrap();

    let mut streamed: Vec<Vec<u32>> = Vec::new();
    search.enumerate(|classes| {
        streamed.push(classes.to_vec());
        Flow::Continue
    });

    // One memo, reused across every lookup, as a paging session reuses it.
    let mut memo = Memo::new();
    let (counted, saturated, _) = search.count(&mut memo, u64::MAX);
    assert!(!saturated);
    assert_eq!(counted, streamed.len() as u128, "{what}: count != enumerated");

    for (i, expected) in streamed.iter().enumerate() {
        assert_eq!(search.nth(&mut memo, i as u128).as_ref(), Some(expected), "{what}: nth({i})");
        assert_eq!(search.rank(&mut memo, expected, u64::MAX), Some(i as u128), "{what}: rank of row {i}");
        // A row is a multiset: its rank cannot depend on the order it is given in.
        let mut reversed = expected.clone();
        reversed.reverse();
        assert_eq!(search.rank(&mut memo, &reversed, u64::MAX), Some(i as u128), "{what}: rank, reversed");
    }
    // One past the end must be None, not a panic or a wrapped result.
    assert_eq!(search.nth(&mut memo, streamed.len() as u128), None, "{what}: nth past the end");

    let mut cursor = search.cursor();
    let mut walked: Vec<Vec<u32>> = Vec::new();
    while let Some(classes) = cursor.next(&search) {
        walked.push(classes.to_vec());
    }
    assert_eq!(walked, streamed, "{what}: cursor stream");
    assert!(!cursor.truncated());
    assert_eq!(cursor.position(), streamed.len() as u128);

    for start in 0..streamed.len() {
        let mut cursor = search
            .cursor_at(&mut memo, start as u128)
            .unwrap_or_else(|| panic!("{what}: cursor_at({start}) found nothing"));
        assert_eq!(cursor.position(), start as u128);
        let mut rest: Vec<Vec<u32>> = Vec::new();
        while let Some(classes) = cursor.next(&search) {
            rest.push(classes.to_vec());
        }
        assert_eq!(rest, &streamed[start..], "{what}: resumed from {start}");
    }
    assert!(search.cursor_at(&mut memo, streamed.len() as u128).is_none(), "{what}: cursor_at past the end");
    streamed
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
        "dormitory",
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
            let expected = naive(&dict, input, min_word_len, &[]);
            let actual = fast(&dict, input, min_word_len, None);

            let missing: Vec<_> = expected.difference(&actual).collect();
            let extra: Vec<_> = actual.difference(&expected).collect();

            assert!(
                missing.is_empty() && extra.is_empty(),
                "input {input:?} minLen={min_word_len}\n  missing {missing:?}\n  extra   {extra:?}"
            );
        }
    }
}

/// The allowlist changes only the vocabulary, so the search must still agree
/// with the naive enumerator on it — and, since the candidate set is fixed per
/// query, counting, unranking and the cursor must all agree with enumeration
/// over that vocabulary too.
#[test]
fn short_words_match_naive_enumeration_count_and_unranking() {
    let dict = small_dict();

    // "no" is listed but "on" is not, so the naive filter's "any spelling"
    // rule and the engine's class resolution must agree; "zz" is in no
    // dictionary and must be ignored by both.
    let short: &[&str] = &["a", "no", "to", "at", "zz"];
    let inputs = ["dormitory", "moondirt", "tomcat", "antdear", "candied", "moonstar", "stone", "onto"];

    for input in inputs {
        let expected = naive(&dict, input, 3, short);
        let actual = fast(&dict, input, 3, Some(short));
        let missing: Vec<_> = expected.difference(&actual).collect();
        let extra: Vec<_> = actual.difference(&expected).collect();
        assert!(
            missing.is_empty() && extra.is_empty(),
            "input {input:?} short={short:?}\n  missing {missing:?}\n  extra   {extra:?}"
        );

        // The list is load-bearing: at least one input needs a short word.
        let without = fast(&dict, input, 3, None);
        assert!(without.is_subset(&actual), "{input:?}: the allowlist removed a result");
    }
    assert!(
        fast(&dict, "onto", 3, Some(short)).len() > fast(&dict, "onto", 3, None).len(),
        "\"onto\" needs a short word, so the allowlist must add a result"
    );

    for input in inputs {
        let options = SolveOptions {
            tier: Tier::Full,
            min_word_len: 3,
            short_words: Some(short.iter().map(|w| w.to_string()).collect()),
            limit: 0,
            ..Default::default()
        };
        let search = Search::prepare(&dict, input, options).unwrap();

        let mut streamed: Vec<Vec<u32>> = Vec::new();
        search.enumerate(|classes| {
            streamed.push(classes.to_vec());
            Flow::Continue
        });

        let mut memo = Memo::new();
        let (counted, saturated, _) = search.count(&mut memo, u64::MAX);
        assert!(!saturated);
        assert_eq!(counted, streamed.len() as u128, "{input:?}: count != enumerated");

        for (i, expected) in streamed.iter().enumerate() {
            assert_eq!(
                search.nth(&mut memo, i as u128).as_ref(),
                Some(expected),
                "input {input:?}: nth({i}) diverged from the stream"
            );
        }
        assert_eq!(search.nth(&mut memo, streamed.len() as u128), None);

        let mut cursor = search.cursor();
        let mut walked: Vec<Vec<u32>> = Vec::new();
        while let Some(classes) = cursor.next(&search) {
            walked.push(classes.to_vec());
        }
        assert_eq!(walked, streamed, "{input:?}: cursor stream");
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

/// The cursor is a second walker, so it gets the same treatment as the first:
/// its stream must equal enumeration, and a cursor seeked to `i` must continue
/// with results `i, i+1, …` to the end, for every `i`.
#[test]
fn cursor_matches_enumeration_and_resumes_from_any_position() {
    let dict = small_dict();
    for input in ["dormitory", "moondirt", "tomcat", "listen", "artdean", "stone", "candied"] {
        for (min_word_len, max_words) in [(1u8, anagram_core::UNLIMITED_WORDS), (2, anagram_core::UNLIMITED_WORDS), (2, 2), (2, 3), (3, 4)] {
            let options = SolveOptions {
                tier: Tier::Full,
                min_word_len,
                max_words,
                limit: 0,
                ..Default::default()
            };
            let search = Search::prepare(&dict, input, options).unwrap();

            let mut streamed: Vec<Vec<u32>> = Vec::new();
            search.enumerate(|classes| {
                streamed.push(classes.to_vec());
                Flow::Continue
            });

            // A cursor from zero, run to the end.
            let mut cursor = search.cursor();
            let mut walked: Vec<Vec<u32>> = Vec::new();
            while let Some(classes) = cursor.next(&search) {
                walked.push(classes.to_vec());
            }
            assert_eq!(walked, streamed, "{input:?} min={min_word_len} max={max_words}: cursor stream");
            assert!(!cursor.truncated());
            assert_eq!(cursor.position(), streamed.len() as u128);

            // A cursor seeked to every position, run to the end from there.
            let mut memo = Memo::new();
            for start in 0..streamed.len() {
                let mut cursor = search
                    .cursor_at(&mut memo, start as u128)
                    .unwrap_or_else(|| panic!("{input:?}: cursor_at({start}) found nothing"));
                assert_eq!(cursor.position(), start as u128);
                let mut rest: Vec<Vec<u32>> = Vec::new();
                while let Some(classes) = cursor.next(&search) {
                    rest.push(classes.to_vec());
                }
                assert_eq!(rest, &streamed[start..], "{input:?}: resumed from {start}");
            }
            assert!(search.cursor_at(&mut memo, streamed.len() as u128).is_none());
        }
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

/// The rule, case by case. Each query is checked three ways: the engine's
/// rows against brute force minus the text, every view of the list against
/// every other, and what the engine says became of the text's own row.
///
/// The dictionary has no frequencies, so a class's commonest spelling is its
/// first A to Z: `moor` before `room`, `no` before `on`, `elints` before
/// `enlist` and the rest.
#[test]
fn the_text_is_never_its_own_result() {
    let dict = small_dict();
    let unlimited = anagram_core::UNLIMITED_WORDS;
    let short: &[&str] = &["no", "to"];

    // (input, min, short words, include, exclude, max words, what became of the row)
    #[rustfmt::skip]
    let cases: &[(&str, u8, Option<&[&str]>, &[&str], &[&str], u8, TextRow)] = &[
        // One word. Its class leads with another spelling, so the row never showed the text.
        ("listen",            2, None, &[], &[], unlimited, TextRow::Shown),
        // One word, and the one its class leads with: the next spelling takes its place.
        ("elints",            2, None, &[], &[], unlimited, TextRow::Respelled),
        // One word with no other spelling: the row goes.
        ("dormitory",         2, None, &[], &[], unlimited, TextRow::Dropped),
        ("DORMITORY",         2, None, &[], &[], unlimited, TextRow::Dropped),
        // Two words that appear as typed by luck, in either order, and two that do not.
        ("dirty moor",        2, None, &[], &[], unlimited, TextRow::Respelled),
        ("moor dirty",        2, None, &[], &[], unlimited, TextRow::Respelled),
        ("dirty room",        2, None, &[], &[], unlimited, TextRow::Shown),
        // Two words, neither with another spelling.
        ("dirty otter",       2, None, &[], &[], unlimited, TextRow::Dropped),
        // A repeated word, with and without another spelling.
        ("no no",             2, None, &[], &[], unlimited, TextRow::Respelled),
        ("no on",             2, None, &[], &[], unlimited, TextRow::Shown),
        ("moo moo",           2, None, &[], &[], unlimited, TextRow::Dropped),
        // Not words, so there is no row to speak of: a misspelling, a re-spacing, single letters.
        ("dirty rooom",       2, None, &[], &[], unlimited, TextRow::None),
        ("dorm it ory",       2, None, &[], &[], unlimited, TextRow::None),
        ("d o r m i t o r y", 1, None, &[], &[], unlimited, TextRow::None),
        // A piece that folds to nothing is no word; a hyphen ends none. An
        // ampersand and digits are read as words since phase N ("dirty and
        // moor", "dormitory one hundred twenty three"), so those rows are the
        // text's own words in a longer text.
        ("dirty ?? moor",     2, None, &[], &[], unlimited, TextRow::Respelled),
        ("dormitory !!!",     2, None, &[], &[], unlimited, TextRow::Dropped),
        ("dor-mit'ory",       2, None, &[], &[], unlimited, TextRow::Dropped),
        // Must include keeps its slot as typed. Holding one of the words, the other decides.
        ("dirty moor",        2, None, &["dirty"], &[], unlimited, TextRow::Respelled),
        ("dirty moor",        2, None, &["moor"],  &[], unlimited, TextRow::Dropped),
        // Another spelling of a word of the text: the row already differs.
        ("dirty moor",        2, None, &["room"],  &[], unlimited, TextRow::Shown),
        // Every word of the text: only the text is left, so nothing is.
        ("dirty moor",        2, None, &["dirty", "moor"], &[], unlimited, TextRow::Dropped),
        ("no no",             2, None, &["no"],    &[], unlimited, TextRow::Respelled),
        ("no no",             2, None, &["no", "no"], &[], unlimited, TextRow::Dropped),
        // A word the row lacks: the text is not among these results at all.
        ("dirty moor",        2, None, &["dim"],   &[], unlimited, TextRow::None),
        // Must exclude. The typed spelling excluded: the text cannot show. The other one: it can only show.
        ("dirty moor",        2, None, &[], &["moor"], unlimited, TextRow::None),
        ("dirty moor",        2, None, &[], &["room"], unlimited, TextRow::Dropped),
        ("dirty room",        2, None, &[], &["moor"], unlimited, TextRow::Dropped),
        // Minimum length, and the short words let in under it.
        ("no dirt",           3, None,        &[], &[], unlimited, TextRow::None),
        ("no dirt",           3, Some(short), &[], &[], unlimited, TextRow::Respelled),
        ("on dirt",           3, Some(short), &[], &[], unlimited, TextRow::Shown),
        ("to dirt",           3, Some(short), &[], &[], unlimited, TextRow::Dropped),
        // The word cap: a text of more words than it allows is no result.
        ("dirty moor",        2, None, &[], &[], 1, TextRow::None),
        ("dirty moor",        2, None, &[], &[], 2, TextRow::Respelled),
        ("dirty otter",       2, None, &[], &[], 2, TextRow::Dropped),
        ("dirty otter",       2, None, &[], &[], 3, TextRow::Dropped),
        ("dormitory",         2, None, &[], &[], 1, TextRow::Dropped),
    ];

    for &(input, min_word_len, short_words, include, exclude, max_words, expected) in cases {
        let spec = Spec { input, min_word_len, short_words, include, exclude, max_words };
        let what = format!("{input:?} min={min_word_len} short={short_words:?} include={include:?} exclude={exclude:?} max={max_words}");

        let want = naive_rows(&dict, spec);
        let got = fast_rows(&dict, spec);
        let missing: Vec<_> = want.difference(&got).collect();
        let extra: Vec<_> = got.difference(&want).collect();
        assert!(missing.is_empty() && extra.is_empty(), "{what}\n  missing {missing:?}\n  extra   {extra:?}");

        let streamed = views_agree(&dict, spec);
        assert_eq!(streamed.len(), want.len(), "{what}: rows");

        let search = Search::prepare(&dict, input, spec.options()).unwrap();
        assert_eq!(search.text_row(), expected, "{what}: what became of the text's row");

        // The text is in nothing the engine shows, whatever became of its row.
        let text = sorted(anagram_core::text_words(input));
        for classes in &streamed {
            assert_ne!(sorted(search.spell(&dict, classes, Tier::Full)), text, "{what}: the text is a result");
        }

        // What the same letters give with the rule out of the way, typed as one
        // run of letters that is no word. A dropped row is exactly one row fewer;
        // anything else leaves the rows as they were.
        let letters: String = anagram_core::normalize(input);
        if !dict.words.contains(&letters) {
            let plain = views_agree(&dict, Spec { input: &letters, ..spec });
            let fewer = usize::from(expected == TextRow::Dropped);
            assert_eq!(streamed.len() + fewer, plain.len(), "{what}: against the letters alone");
        }
    }
}

/// The two ways a row's spelling is chosen, stated as the words shown.
#[test]
fn the_row_takes_its_next_spelling_and_a_pinned_word_stays_as_typed() {
    let dict = small_dict();
    let shown = |input: &str, include: &[&str]| -> HashSet<Vec<String>> {
        let spec = Spec { include, ..Spec::of(input, 2) };
        let search = Search::prepare(&dict, input, spec.options()).unwrap();
        let mut out = HashSet::new();
        search.enumerate(|classes| {
            out.insert(sorted(search.spell(&dict, classes, Tier::Full)));
            Flow::Continue
        });
        out
    };
    let row = |words: &[&str]| sorted(words.iter().map(|w| w.to_string()).collect());

    // `moor` leads its class, so "dirty moor" would show itself: `room` instead.
    assert!(shown("dirty moor", &[]).contains(&row(&["dirty", "room"])));
    assert!(!shown("dirty moor", &[]).contains(&row(&["dirty", "moor"])));
    // Every other text leaves that row as it always was.
    assert!(shown("dirty room", &[]).contains(&row(&["dirty", "moor"])));
    assert!(shown("dirtymoor", &[]).contains(&row(&["dirty", "moor"])));

    // A repeated word changes one slot, not both.
    assert!(shown("no no", &[]).contains(&row(&["no", "on"])));
    // With one `no` pinned, the pinned slot stays and the free one changes.
    assert!(shown("no no", &["no"]).contains(&row(&["no", "on"])));
    // Pinned as the other spelling, the row is `on` and the class's first: not the text.
    assert!(shown("no no", &["on"]).contains(&row(&["no", "on"])));

    // The six spellings of one class: the text's is passed over for the next.
    assert_eq!(shown("elints", &[]), HashSet::from([row(&["enlist"])]));
    assert_eq!(shown("listen", &[]), HashSet::from([row(&["elints"])]));
}

/// `rank` refuses what is not a result, and a budget it cannot meet.
#[test]
fn rank_refuses_what_is_not_a_result() {
    let dict = small_dict();
    let class = |word: &str| dict.find_class(word, Tier::Full).unwrap() as u32;
    let search = Search::prepare(&dict, "dormitory", Spec::of("dormitory", 2).options()).unwrap();
    let mut memo = Memo::new();

    // The dropped row is not a result, so it has no index.
    assert_eq!(search.text_row(), TextRow::Dropped);
    assert_eq!(search.rank(&mut memo, &[class("dormitory")], u64::MAX), None);
    // Nor has a row that is short of letters, over them, or of another text.
    assert_eq!(search.rank(&mut memo, &[class("dirty")], u64::MAX), None);
    assert_eq!(search.rank(&mut memo, &[class("dirty"), class("room"), class("a")], u64::MAX), None);
    assert_eq!(search.rank(&mut memo, &[class("listen")], u64::MAX), None);
    assert_eq!(search.rank(&mut memo, &[], u64::MAX), None);
    // A real row has one, and with no budget to count what lies before it, none.
    let last = {
        let mut rows = Vec::new();
        search.enumerate(|classes| {
            rows.push(classes.to_vec());
            Flow::Continue
        });
        rows.pop().unwrap()
    };
    assert_eq!(search.rank(&mut Memo::new(), &last, 0), None);
    assert!(search.rank(&mut Memo::new(), &last, u64::MAX).is_some());
}
