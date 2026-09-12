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
