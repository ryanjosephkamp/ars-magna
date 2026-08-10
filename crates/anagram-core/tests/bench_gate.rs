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
/// Measured on the pinned dictionary at Standard, minWordLen 3:
///
/// ```text
/// dormitory              61 candidates      59 nodes         976 tests
/// astronomer            273 candidates     190 nodes      21,429 tests
/// arsmagna               52 candidates      37 nodes         426 tests
/// woodrowwilson         130 candidates     187 nodes      33,567 tests
/// ryanjosephkamp        817 candidates   2,659 nodes   2,996,048 tests
/// internationalization  568 candidates   4,589 nodes  90,137,342 tests
/// ```
///
/// Note how far apart counting and enumeration are on the last row: 4,589 nodes
/// to count 252,995 answers, against 90 million sub-multiset tests to actually
/// list them. That gap is the entire reason the interface leads with the count.
const GATES: &[(&str, usize, u64, u64)] = &[
    ("dormitory", 100, 90, 1_500),
    ("astronomer", 420, 290, 32_000),
    ("arsmagna", 80, 60, 650),
    ("woodrowwilson", 200, 290, 50_000),
    ("ryanjosephkamp", 1_250, 4_000, 4_500_000),
    ("internationalization", 900, 7_000, 135_000_000),
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
