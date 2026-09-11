//! Performance regression gate.
//!
//! Asserts on **nodes visited** and **sub-multiset tests**, not on wall time.
//! Those are properties of the search itself: they are identical on a fast
//! laptop and a loaded CI runner, so the gate can be tight without being flaky.
//! A timing threshold loose enough never to fail spuriously would be too loose
//! to catch anything.
//!
//! Thresholds carry ~1.5x headroom over measured values. When one fires it means
//! the search is exploring more of the tree than it used to — most likely a
//! pruning rule that stopped firing, which costs nothing in correctness and
//! everything in speed, so it would otherwise pass unnoticed.
//!
//! Skipped when the dictionary has not been built.

use anagram_core::{Dict, Flow, Memo, Search, SolveOptions, Tier};
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
    let full = fs::read(dir.join(artifact(&manifest, "full")?)).ok()?;
    let tiers = fs::read(dir.join(artifact(&manifest, "tiers")?)).ok()?;
    Dict::decode(&full, Some(&tiers)).ok()
}

/// `(input, max candidates, max count nodes, max enumeration subset tests)`
///
/// Measured on the pinned dictionary at Standard, minWordLen 3. Standard was
/// redefined in September 2026 from Common ∪ TWL (177,197 words) to every
/// attested word (314,007): the TWL definition dropped nearly every word over
/// 15 letters, which the README had never claimed. The new tier admits more
/// candidates on every input, so the measurements moved and the thresholds
/// were re-derived from them at the same ~1.5× headroom; the old figures are
/// kept alongside so the size of the shift is on record.
///
/// ```text
///                        candidates      count nodes      enumeration tests
/// dormitory                61 →    65      59 →    62         976 →       1,075
/// astronomer              273 →   281     190 →   193      21,429 →      21,809
/// arsmagna                 52 →    53      37 →    38         426 →         427
/// woodrowwilson           130 →   134     187 →   194      33,567 →      35,454
/// ryanjosephkamp          817 →   893   2,659 → 2,760   2,996,048 →   3,432,461
/// internationalization    568 →   704   4,589 → 4,824  90,137,342 → 116,466,920
/// ```
///
/// Note how far apart counting and enumeration are on the last row: under
/// five thousand nodes to count the answers, against 116 million sub-multiset
/// tests to actually list them. That gap is the entire reason the interface
/// leads with the count.
const GATES: &[(&str, usize, u64, u64)] = &[
    ("dormitory", 100, 95, 1_600),
    ("astronomer", 420, 290, 33_000),
    ("arsmagna", 80, 60, 650),
    ("woodrowwilson", 200, 290, 53_000),
    ("ryanjosephkamp", 1_350, 4_200, 5_200_000),
    ("internationalization", 1_050, 7_300, 175_000_000),
];

#[test]
fn search_effort_has_not_regressed() {
    let Some(dict) = load() else {
        eprintln!("skipping: run `pnpm dict:build` to enable the bench gate");
        return;
    };

    let mut failures = Vec::new();

    for &(input, max_candidates, max_nodes, max_tests) in GATES {
        let options = SolveOptions {
            tier: Tier::Standard,
            min_word_len: 3,
            limit: 0,
            max_nodes: u64::MAX,
            ..Default::default()
        };
        let search = Search::prepare(&dict, input, options).unwrap();

        let candidates = search.candidate_count();
        let (_, _, count_stats) = search.count(&mut Memo::new(), u64::MAX);

        let enumerate_stats = search.enumerate(|_| Flow::Continue);

        println!(
            "{input:<22} candidates={candidates:<6} count_nodes={:<7} enum_tests={}",
            count_stats.nodes, enumerate_stats.subset_tests
        );

        if candidates > max_candidates {
            failures.push(format!("{input}: {candidates} candidates > {max_candidates}"));
        }
        if count_stats.nodes > max_nodes {
            failures.push(format!(
                "{input}: counting visited {} nodes > {max_nodes}",
                count_stats.nodes
            ));
        }
        if enumerate_stats.subset_tests > max_tests {
            failures.push(format!(
                "{input}: enumeration ran {} subset tests > {max_tests}",
                enumerate_stats.subset_tests
            ));
        }
    }

    assert!(
        failures.is_empty(),
        "search effort regressed:\n  {}\n\nIf this is an intended trade-off, update GATES with the \
         new measurements and say why in the commit.",
        failures.join("\n  ")
    );
}

/// Memoization is what makes counting cheap. If the hit rate collapses, counting
/// degenerates into plain enumeration and long inputs stop being interactive —
/// a change that is invisible on small test inputs.
#[test]
fn counting_still_reuses_its_memo() {
    let Some(dict) = load() else { return };

    for input in ["ryanjosephkamp", "internationalization"] {
        let options = SolveOptions {
            tier: Tier::Standard,
            min_word_len: 3,
            limit: 0,
            max_nodes: u64::MAX,
            ..Default::default()
        };
        let search = Search::prepare(&dict, input, options).unwrap();
        let (_, _, stats) = search.count(&mut Memo::new(), u64::MAX);

        // Measured ratios are 8.5x and 14x hits per node; 3x leaves room for
        // dictionary drift while still catching a collapse.
        assert!(
            stats.memo_hits > stats.nodes * 3,
            "{input}: {} memo hits against {} nodes — memoization is barely paying",
            stats.memo_hits,
            stats.nodes
        );
    }
}
