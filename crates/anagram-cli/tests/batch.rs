//! `anagram batch` and `anagram check`, driven as the pipeline drives them:
//! as a subprocess, against the committed dictionary. Skipped when the
//! dictionary has not been built, like the core crate's goldens.

use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).ancestors().nth(2).unwrap().to_path_buf()
}

fn dict_built() -> bool {
    repo_root().join("apps/web/public/dict/manifest.json").exists()
}

fn scratch(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("ars-magna-batch-{name}-{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).unwrap();
    dir
}

fn anagram(args: &[&str]) -> std::process::Output {
    Command::new(env!("CARGO_BIN_EXE_anagram")).args(args).output().unwrap()
}

fn letters(text: &str) -> String {
    let mut v: Vec<char> = text.chars().filter(|c| c.is_ascii_alphabetic()).map(|c| c.to_ascii_lowercase()).collect();
    v.sort_unstable();
    v.into_iter().collect()
}

const CANDIDATES: &str = r#"{"id":"dormitory:phrases","input":"dormitory","category":"phrases","source":"manual","first_seen":"2026-09-11","status":"new"}
{"id":"astronomer:phrases","input":"Astronomer","category":"phrases","source":"manual","first_seen":"2026-09-11","status":"new"}
{"id":"arnoldschwarzenegger:people","input":"Arnold Schwarzenegger","category":"people","source":"manual","first_seen":"2026-09-11","status":"new"}
{"id":"listen:phrases","input":"listen","category":"phrases","source":"manual","first_seen":"2026-09-11","status":"enumerated"}
"#;

#[test]
fn batch_enumerates_samples_and_is_deterministic() {
    if !dict_built() {
        eprintln!("skipping: dictionary not built");
        return;
    }
    let dir = scratch("batch");
    let input = dir.join("candidates.jsonl");
    fs::write(&input, CANDIDATES).unwrap();

    let run = |out: &Path| {
        let output = anagram(&[
            "batch",
            &format!("--in={}", input.display()),
            &format!("--out={}", out.display()),
            "--tier=standard",
            "--min-len=3",
            "--max-words=4",
            "--first=50",
            "--sample=20",
            "--seed=7",
        ]);
        assert!(output.status.success(), "batch failed: {}", String::from_utf8_lossy(&output.stderr));
        fs::read_to_string(out.join("raw.jsonl")).unwrap()
    };

    let first = run(&dir.join("a"));
    let second = run(&dir.join("b"));
    assert_eq!(first, second, "same seed must give byte-identical output");
    assert!(dir.join("a/summary.json").exists());

    let rows: Vec<serde_json::Value> = first.lines().map(|l| serde_json::from_str(l).unwrap()).collect();
    assert!(!rows.is_empty());

    // Only `new` candidates run by default.
    let ids: HashSet<&str> = rows.iter().map(|r| r["id"].as_str().unwrap()).collect();
    assert!(ids.contains("dormitory:phrases"));
    assert!(ids.contains("arnoldschwarzenegger:people"));
    assert!(!ids.contains("listen:phrases"), "an enumerated candidate must be skipped");

    let mut per_candidate: HashMap<&str, Vec<&serde_json::Value>> = HashMap::new();
    for row in &rows {
        per_candidate.entry(row["id"].as_str().unwrap()).or_default().push(row);
    }

    for (id, rows) in &per_candidate {
        let input = rows[0]["input"].as_str().unwrap();
        let count: u128 = rows[0]["count"].as_str().unwrap().parse().unwrap();
        let mut seen = HashSet::new();
        for row in rows {
            // Letters conserved, every word carries its metadata.
            let words: Vec<&str> = row["words"].as_array().unwrap().iter().map(|w| w.as_str().unwrap()).collect();
            assert_eq!(letters(&words.concat()), letters(input), "{id}: letters not conserved");
            assert_eq!(row["zipf"].as_array().unwrap().len(), words.len());
            assert_eq!(row["tiers"].as_array().unwrap().len(), words.len());
            assert_eq!(row["pos"].as_array().unwrap().len(), words.len());
            for tier in row["tiers"].as_array().unwrap() {
                assert!(matches!(tier.as_str().unwrap(), "common" | "standard" | "full"));
            }
            // Indices are unique and inside the count; samples come after the head.
            let index: u128 = row["index"].as_str().unwrap().parse().unwrap();
            assert!(index < count, "{id}: index {index} >= count {count}");
            assert!(seen.insert(index), "{id}: index {index} repeated");
            if row["sampled"].as_bool().unwrap() {
                assert!(index >= 50, "{id}: sampled index {index} inside the enumerated head");
            }
        }
        // The head is complete when the count allows it.
        let head = rows.iter().filter(|r| !r["sampled"].as_bool().unwrap()).count();
        assert_eq!(head as u128, count.min(50), "{id}: head size");
    }

    // A big result set gets its sample; a small one is fully enumerated with none.
    let arnold = &per_candidate["arnoldschwarzenegger:people"];
    assert!(arnold.iter().any(|r| r["sampled"].as_bool().unwrap()));
    let dormitory = &per_candidate["dormitory:phrases"];
    assert!(dormitory.iter().all(|r| !r["sampled"].as_bool().unwrap()));
    assert!(!dormitory[0]["count_is_floor"].as_bool().unwrap());
}

/// The pipeline's s2 flags against a scratch allowlist, over a candidate file.
fn wide_batch(dir: &Path, name: &str, candidates: &str, limit: &str) -> (Vec<serde_json::Value>, serde_json::Value, String) {
    let input = dir.join(format!("{name}.jsonl"));
    fs::write(&input, candidates).unwrap();
    let short = dir.join("short-words.txt");
    fs::write(&short, "# a test allowlist\na\nto\nno\nis  # trailing comment\n").unwrap();
    let out = dir.join(name);
    let output = anagram(&[
        "batch",
        &format!("--in={}", input.display()),
        &format!("--out={}", out.display()),
        "--tier=common",
        "--min-len=3",
        &format!("--short-words={}", short.display()),
        "--max-words=5",
        "--spellings=all",
        &format!("--limit={limit}"),
        "--sample=25",
        "--seed=3",
        "--settings=s2",
    ]);
    assert!(output.status.success(), "batch failed: {}", String::from_utf8_lossy(&output.stderr));
    let text = fs::read_to_string(out.join("raw.jsonl")).unwrap();
    let rows = text.lines().map(|l| serde_json::from_str(l).unwrap()).collect();
    let summary = serde_json::from_str(&fs::read_to_string(out.join("summary.json")).unwrap()).unwrap();
    (rows, summary, text)
}

fn words_of(row: &serde_json::Value) -> Vec<&str> {
    row["words"].as_array().unwrap().iter().map(|w| w.as_str().unwrap()).collect()
}

/// Each word's letters, sorted, and the words sorted: two spellings of one
/// result share this key.
fn class_key(row: &serde_json::Value) -> Vec<String> {
    let mut key: Vec<String> = words_of(row).iter().map(|w| letters(w)).collect();
    key.sort();
    key
}

#[test]
fn batch_writes_every_spelling_admits_listed_short_words_and_bounds_by_limit() {
    if !dict_built() {
        return;
    }
    let dir = scratch("wide");
    let candidates = r#"{"id":"listen:phrases","input":"Listen","category":"phrases","source":"manual","first_seen":"2026-09-13","status":"new"}
{"id":"ashoplifter:phrases","input":"A shoplifter","category":"phrases","source":"manual","first_seen":"2026-09-13","status":"new"}
"#;
    let (rows, summary, _) = wide_batch(&dir, "complete", candidates, "100000");
    assert_eq!(summary["settings"], "s2");
    assert_eq!(summary["spellings"], "all");
    assert_eq!(summary["short_words"], 4);

    // Every spelling of a letter group: "listen" and "silent" are one group.
    let listen: HashSet<Vec<&str>> =
        rows.iter().filter(|r| r["id"] == "listen:phrases").map(words_of).collect();
    assert!(listen.contains(&vec!["silent"]), "silent is written, not only the first spelling");
    assert!(listen.contains(&vec!["listen"]));

    // Short words: listed ones are admitted, nothing else under three letters.
    let shoplifter: Vec<&serde_json::Value> = rows.iter().filter(|r| r["id"] == "ashoplifter:phrases").collect();
    assert!(shoplifter.iter().any(|r| {
        let mut w = words_of(r);
        w.sort();
        w == ["has", "pilfer", "to"]
    }), "has to pilfer is generated");
    for row in &rows {
        let words = words_of(row);
        assert_eq!(letters(&words.concat()), letters(row["input"].as_str().unwrap()), "letters conserved");
        for w in words {
            assert!(w.len() >= 3 || ["a", "to", "no", "is"].contains(&w), "unlisted short word {w:?}");
        }
    }

    // Under the limit, every result is written and nothing is sampled; the
    // spellings of one result share its index.
    for (id, candidate) in summary["candidates"].as_array().unwrap().iter().map(|c| (c["id"].as_str().unwrap(), c)) {
        let count: u128 = candidate["count"].as_str().unwrap().parse().unwrap();
        let own: Vec<&serde_json::Value> = rows.iter().filter(|r| r["id"] == id).collect();
        assert!(own.iter().all(|r| !r["sampled"].as_bool().unwrap()), "{id}: sampled under the limit");
        let indices: HashSet<&str> = own.iter().map(|r| r["index"].as_str().unwrap()).collect();
        assert_eq!(indices.len() as u128, count, "{id}: every result written");
        assert_eq!(candidate["rows"].as_u64().unwrap() as usize, own.len(), "{id}: rows in the summary");
        let mut by_index: HashMap<&str, HashSet<Vec<String>>> = HashMap::new();
        for r in &own {
            by_index.entry(r["index"].as_str().unwrap()).or_default().insert(class_key(r));
        }
        assert!(by_index.values().all(|keys| keys.len() == 1), "{id}: one index, one result");
    }
}

#[test]
fn batch_samples_past_the_limit_and_searches_around_anchors() {
    if !dict_built() {
        return;
    }
    let dir = scratch("anchors");
    let candidates = r#"{"id":"thecountryside:phrases","input":"The countryside","category":"phrases","source":"manual","first_seen":"2026-09-13","status":"new","anchors":["city","dust","zebra"]}
"#;
    let (rows, summary, first) = wide_batch(&dir, "a", candidates, "150");
    let (_, _, second) = wide_batch(&dir, "b", candidates, "150");
    assert_eq!(first, second, "same seed, byte-identical output");

    let candidate = &summary["candidates"][0];
    let count: u128 = candidate["count"].as_str().unwrap().parse().unwrap();
    assert!(count > 150, "the input must be larger than the limit for this test");
    assert_eq!(candidate["head"], 150);
    assert!(candidate["sampled"].as_u64().unwrap() > 0);
    for row in rows.iter().filter(|r| r["anchor"].is_null() && r["sampled"].as_bool().unwrap()) {
        let index: u128 = row["index"].as_str().unwrap().parse().unwrap();
        assert!(index >= 150, "a sampled row sits past the head");
    }

    // Every anchored row contains its anchor; an anchor that does not fit is
    // reported, not fatal.
    let anchors = candidate["anchors"].as_array().unwrap();
    assert_eq!(anchors.len(), 3);
    for anchor in anchors {
        let word = anchor["word"].as_str().unwrap();
        let anchored: Vec<&serde_json::Value> = rows.iter().filter(|r| r["anchor"] == word).collect();
        if word == "zebra" {
            assert!(anchor["error"].is_string());
            assert!(anchored.is_empty());
            continue;
        }
        assert!(anchor["error"].is_null());
        assert!(!anchored.is_empty(), "{word}: anchored rows");
        assert!(anchored.iter().all(|r| words_of(r).contains(&word)), "{word}: every row has the anchor");
    }

    // A result found by two searches is written once.
    let mut source: HashMap<Vec<String>, (String, String)> = HashMap::new();
    for row in &rows {
        let from = (row["anchor"].as_str().unwrap_or("").to_owned(), row["index"].as_str().unwrap().to_owned());
        let previous = source.entry(class_key(row)).or_insert_with(|| from.clone());
        assert_eq!(*previous, from, "one result, one search");
    }
    assert_eq!(candidate["rows"].as_u64().unwrap() as usize, rows.len());
}

#[test]
fn check_accepts_real_anagrams_and_names_the_failure_otherwise() {
    if !dict_built() {
        return;
    }
    let ok = anagram(&["check", "dormitory", "dirty room"]);
    assert!(ok.status.success(), "{}", String::from_utf8_lossy(&ok.stdout));

    let accented = anagram(&["check", "Beyoncé", "obey enc"]);
    // Not a real phrase, but the letters must be compared after folding.
    assert!(!accented.status.success());
    assert!(String::from_utf8_lossy(&accented.stdout).contains("enc"), "the failing word is named");

    let wrong_letters = anagram(&["check", "dormitory", "dirty rooms"]);
    assert!(!wrong_letters.status.success());
    assert!(String::from_utf8_lossy(&wrong_letters.stdout).contains("letters"));

    let not_a_word = anagram(&["check", "dormitory", "dirty moor"]);
    // `moor` is a word; `roomdirty` split oddly is not.
    assert!(not_a_word.status.success());
    let bad_word = anagram(&["check", "dormitory", "dirt yroom"]);
    assert!(!bad_word.status.success());
    assert!(String::from_utf8_lossy(&bad_word.stdout).contains("yroom"));

    // Tier matters: a Full-only word is refused at Standard and accepted at Full.
    let std = anagram(&["check", "internationalization", "internationalization", "--tier=standard"]);
    let full = anagram(&["check", "internationalization", "internationalization", "--tier=full"]);
    assert!(std.status.success(), "internationalization is attested and now in Standard");
    assert!(full.status.success());
    let generated = anagram(&["check", "abacteremicer", "abacteremicer", "--tier=standard"]);
    let generated_full = anagram(&["check", "abacteremicer", "abacteremicer", "--tier=full"]);
    assert!(!generated.status.success(), "a machine-generated word is Full-only");
    assert!(generated_full.status.success());
}
