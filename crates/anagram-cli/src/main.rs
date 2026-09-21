//! Native driver for the engine.
//!
//! Runs the same code the browser runs, without the WASM boundary — which makes
//! it the right place to generate goldens, profile, sanity-check a dictionary
//! build, and feed the Greatest Hits pipeline.
//!
//! ```text
//! anagram solve "dormitory"
//! anagram count "conversationalpiece" --tier=full
//! anagram bench
//! anagram batch --in=data/candidates.jsonl --out=data/queue/2026-09-12
//! anagram check "dormitory" "dirty room"
//! anagram solve "Blink-182" --classes=shorthand,blends
//! anagram solve "Ke\$ha" --leet='$'
//! anagram check "Ke\$ha" "hakes" --read='$:s'
//! ```
//!
//! The literal rule (D62, D63): a digit or a symbol of the text is a character
//! of the pool, and a term of an anagram uses it as itself; `--classes=` names
//! the term classes admitted beside the tier, `--leet=` the characters the
//! search also tries as their letters, `--read=` a fixed reading of one.

use anagram_core::{
    class_names, parse_classes, Class, ClassMask, Counts, Cursor, Dict, Expanded, Flow, Memo, Scope, Search, Slots,
    SolveOptions, TextRow, Tier, UNLIMITED_WORDS, WORDS,
};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::Instant;

fn repo_root() -> PathBuf {
    // CARGO_MANIFEST_DIR is <root>/crates/anagram-cli
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("repo root")
        .to_path_buf()
}

/// Which dictionary the artifacts are: the pinned English OpenList revision
/// and the hash of the word list as built, so a queue's summary can say what
/// it was enumerated with (the plan's first data rule).
#[derive(Serialize, Clone)]
struct DictionaryId {
    rev: String,
    full_sha256: String,
}

fn load_dict() -> Result<Dict, Box<dyn std::error::Error>> {
    Ok(load_dict_with_id()?.0)
}

fn load_dict_with_id() -> Result<(Dict, DictionaryId), Box<dyn std::error::Error>> {
    let dist = repo_root().join("apps/web/public/dict");
    let manifest = fs::read_to_string(dist.join("manifest.json")).map_err(|_| {
        format!(
            "no dictionary at {}\n  run `pnpm dict:fetch && pnpm dict:build` first",
            dist.display()
        )
    })?;

    // Small hand-rolled extraction; the manifest is tiny and stable. `field_of`
    // reads the string that follows the first `"field"` after `"key"`.
    let field_of = |key: &str, field: &str| -> Option<String> {
        let anchor = format!("\"{key}\"");
        let start = manifest.find(&anchor)? + anchor.len();
        let rest = &manifest[start..];
        let field_anchor = format!("\"{field}\"");
        let field_at = rest.find(&field_anchor)? + field_anchor.len();
        let after = &rest[field_at..];
        let open = after.find('"')? + 1;
        let close = after[open..].find('"')?;
        Some(after[open..open + close].to_owned())
    };
    let name_of = |key: &str| field_of(key, "name");

    let full = name_of("full").ok_or("manifest is missing the full artifact")?;
    let tiers = name_of("tiers").ok_or("manifest is missing the tiers artifact")?;
    // The terms of the classes, when a build emitted them (`dict:build` does
    // only once a class file has a term); a dictionary of words alone without.
    let classes = name_of("classes");
    let id = DictionaryId {
        rev: field_of("source", "rev").unwrap_or_default(),
        full_sha256: field_of("full", "sha256").unwrap_or_default(),
    };

    let dict_bytes = fs::read(dist.join(&full))?;
    let tier_bytes = fs::read(dist.join(&tiers))?;
    let class_bytes = classes.map(|name| fs::read(dist.join(name))).transpose()?;

    Ok((Dict::decode(&dict_bytes, Some(&tier_bytes), class_bytes.as_deref())?, id))
}

fn tier_from(name: &str) -> Tier {
    match name {
        "common" => Tier::Common,
        "full" => Tier::Full,
        "extended" => Tier::Extended,
        _ => Tier::Standard,
    }
}

fn tier_name(tier: Tier) -> &'static str {
    match tier {
        Tier::Common => "common",
        Tier::Standard => "standard",
        Tier::Full => "full",
        Tier::Extended => "extended",
    }
}

/// The short words a search admits below its minimum length: one per line,
/// `#` starts a comment.
fn read_short_words(path: &str) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let text = fs::read_to_string(path).map_err(|e| format!("{path}: {e}"))?;
    Ok(text
        .lines()
        .map(|line| line.split('#').next().unwrap_or("").trim())
        .filter(|word| !word.is_empty())
        .map(anagram_core::normalize)
        .collect())
}

/// `--flag=value` pairs and bare positionals, in order.
struct Argv {
    flags: Vec<(String, String)>,
    positional: Vec<String>,
}

impl Argv {
    fn parse(args: &[String]) -> Argv {
        let mut flags = Vec::new();
        let mut positional = Vec::new();
        for arg in args {
            if let Some(rest) = arg.strip_prefix("--") {
                let (key, value) = rest.split_once('=').unwrap_or((rest, ""));
                flags.push((key.to_owned(), value.to_owned()));
            } else {
                positional.push(arg.clone());
            }
        }
        Argv { flags, positional }
    }

    fn get(&self, key: &str) -> Option<&str> {
        self.flags.iter().rev().find(|(k, _)| k == key).map(|(_, v)| v.as_str())
    }

    fn num<T: std::str::FromStr>(&self, key: &str, default: T) -> T {
        self.get(key).and_then(|v| v.parse().ok()).unwrap_or(default)
    }
}

struct Args {
    /// The text as typed, with its digits and symbols read as `--read=` says: what the search is given.
    text: String,
    tier: Tier,
    /// The term classes admitted beside the tier (`--classes=`).
    classes: ClassMask,
    /// The characters the search also tries as their leet letters (`--leet=`).
    leet: Vec<char>,
    min_word_len: u8,
    max_words: u8,
    short_words: Option<Vec<String>>,
    limit: usize,
}

/// `--read=$:s,4:drop`: the reader's readings of the text's digits and
/// symbols, checked against what the text offers (`self`, its letters,
/// `drop`). None given is the defaults: every character as itself.
fn reading_flag(argv: &Argv, text: &str) -> Result<Vec<(String, String)>, Box<dyn std::error::Error>> {
    let pairs = anagram_core::parse_reading(argv.get("read").unwrap_or(""))?;
    if let Some(problem) = anagram_core::reading_problem(text, &pairs) {
        return Err(format!("--read: {problem}").into());
    }
    Ok(pairs)
}

/// `--classes=shorthand,blends`: the term classes admitted beside the tier.
fn classes_flag(argv: &Argv) -> Result<ClassMask, Box<dyn std::error::Error>> {
    Ok(parse_classes(argv.get("classes").unwrap_or("")).map_err(|e| format!("--classes: {e}"))?)
}

/// `--leet='$,!,@'` or `--leet='$!@'`: the characters the search also tries as
/// their letters, each a digit or symbol of the pool with letters to offer.
fn leet_flag(argv: &Argv) -> Result<Vec<char>, Box<dyn std::error::Error>> {
    let mut out = Vec::new();
    for c in argv.get("leet").unwrap_or("").chars().filter(|c| *c != ',' && !c.is_whitespace()) {
        if anagram_core::letters_of(c).is_empty() {
            return Err(format!("--leet: {c:?} has no letter reading").into());
        }
        if !out.contains(&c) {
            out.push(c);
        }
    }
    Ok(out)
}

fn parse(args: &[String]) -> Result<Args, Box<dyn std::error::Error>> {
    let argv = Argv::parse(args);
    let typed = argv.positional.join(" ");
    let reading = reading_flag(&argv, &typed)?;
    Ok(Args {
        text: anagram_core::read_input(&typed, &reading),
        tier: tier_from(argv.get("tier").unwrap_or("standard")),
        classes: classes_flag(&argv)?,
        leet: leet_flag(&argv)?,
        min_word_len: argv.num("min-len", 3),
        max_words: argv.num("max-words", UNLIMITED_WORDS),
        short_words: argv.get("short-words").map(read_short_words).transpose()?,
        limit: argv.num("limit", 50),
    })
}

fn options(args: &Args, limit: usize) -> SolveOptions {
    SolveOptions {
        tier: args.tier,
        classes: args.classes,
        min_word_len: args.min_word_len,
        short_words: args.short_words.clone(),
        max_words: args.max_words,
        must_include: Vec::new(),
        exclude: Vec::new(),
        limit,
        max_nodes: u64::MAX,
    }
}

/// A row's tags for a person: `1 shorthand, 2 shorthand, b8 blends; $ as s`.
/// Empty for a row of words alone under the text as typed.
fn describe_tags(row: &anagram_core::Row) -> String {
    let mut parts: Vec<String> = row
        .written
        .iter()
        .zip(&row.classes)
        .filter_map(|(word, class)| class.map(|c| format!("{word} {}", c.name())))
        .collect();
    if !row.reading.is_empty() {
        parts.push(row.reading.iter().map(|(c, l)| format!("{c} as {l}")).collect::<Vec<_>>().join(", "));
    }
    parts.join("; ")
}

/// Say which digits and symbols of the pool nothing uses, when any: the count
/// is zero for the lack of a class that would.
fn print_unused(unused: &str) {
    if !unused.is_empty() {
        let list: Vec<String> = unused.chars().map(|c| c.to_string()).collect();
        println!("  no term uses {}; a class would (--classes=, --leet=)", list.join(", "));
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let (command, rest) = argv.split_first().map(|(c, r)| (c.as_str(), r)).unwrap_or((
        "help",
        &[][..],
    ));

    match command {
        "solve" => solve(parse(rest)?),
        "count" => count(parse(rest)?),
        "bench" => bench(),
        "batch" => batch(&Argv::parse(rest)),
        "check" => check(&Argv::parse(rest)),
        _ => {
            eprintln!(
                "usage:\n  anagram <solve|count> \"text\" [--tier=] [--classes=shorthand,blends] [--leet='$!@'] [--min-len=] [--short-words=FILE] [--max-words=] [--limit=] [--read=$:s,4:drop]\n  \
                 anagram bench\n  \
                 anagram batch --in=candidates.jsonl --out=DIR [--tier=] [--classes=] [--min-len=] [--short-words=FILE] [--max-words=] \
                 [--additions=FILE] [--spellings=first|all] [--expand-cap=] [--limit=] [--sample=] [--seed=] \
                 [--status=new|all] [--max-nodes=] [--settings=]\n  \
                 anagram check \"input\" \"anagram phrase\" [--tier=] [--classes=] [--read=$:s,4:drop]"
            );
            Ok(())
        }
    }
}

fn solve(args: Args) -> Result<(), Box<dyn std::error::Error>> {
    let dict = load_dict()?;
    let expanded = Expanded::prepare(&dict, &args.text, options(&args, args.limit), &args.leet)?;

    println!(
        "{} candidate classes for {:?}{}",
        expanded.candidate_count(),
        anagram_core::normalize(&args.text),
        if expanded.pieces.len() > 1 { format!(" in {} readings", expanded.pieces.len()) } else { String::new() }
    );

    let started = Instant::now();
    let mut shown = 0usize;
    let stats = expanded.enumerate(|piece, classes| {
        let row = expanded.row(&dict, piece, classes);
        let mut order: Vec<usize> = (0..row.words.len()).collect();
        order.sort_by_key(|&i| std::cmp::Reverse(row.words[i].len()));
        let written: Vec<&str> = order.iter().map(|&i| row.written[i].as_str()).collect();
        let tags = describe_tags(&row);
        if tags.is_empty() {
            println!("  {}", written.join(" "));
        } else {
            println!("  {}  [{tags}]", written.join(" "));
        }
        shown += 1;
        Flow::Continue
    });

    println!(
        "\n{shown} shown in {:.1?} ({} nodes, {} subset tests){}",
        started.elapsed(),
        stats.nodes,
        stats.subset_tests,
        if stats.truncated { ", truncated" } else { "" }
    );
    print_text_row(&expanded);
    print_unused(&expanded.unused());
    Ok(())
}

/// Say so when the text's own row is not among the results: the text itself,
/// its words in any order, is never a result, and a row that can be spelled
/// no other way is left out and not counted.
fn print_text_row(expanded: &Expanded) {
    if expanded.text_left_out() {
        println!("  the text itself is left out");
    }
}

fn count(args: Args) -> Result<(), Box<dyn std::error::Error>> {
    let dict = load_dict()?;
    let expanded = Expanded::prepare(&dict, &args.text, options(&args, 0), &args.leet)?;

    let started = Instant::now();
    let mut memos: Vec<Memo> = expanded.pieces.iter().map(|_| Memo::new()).collect();
    let (total, floor, stats) = expanded.count(&mut memos, u64::MAX);
    let elapsed = started.elapsed();

    println!("{}{} anagrams", if floor { "more than " } else { "" }, total);
    println!(
        "  {} candidates · {} nodes · {} memo entries · {} hits · {:.1?}{}",
        stats.candidates,
        stats.nodes,
        stats.memo_entries,
        stats.memo_hits,
        elapsed,
        if expanded.pieces.len() > 1 { format!(" · {} readings", expanded.pieces.len()) } else { String::new() }
    );
    print_text_row(&expanded);
    print_unused(&expanded.unused());
    Ok(())
}

fn bench() -> Result<(), Box<dyn std::error::Error>> {
    let dict = load_dict()?;
    println!(
        "{} words · {} classes\n",
        dict.words.len(),
        dict.classes.len()
    );
    println!(
        "{:<24} {:>7} {:>10} {:>14} {:>10} {:>10}",
        "input", "letters", "candidates", "count", "count ms", "1k ms"
    );

    let inputs = [
        "listen",
        "dormitory",
        "astronomer",
        "arsmagna",
        "ryanjosephkamp",
        "woodrowwilson",
        "internationalization",
        "conversationalpiece",
        "thequickbrownfoxjumps",
    ];

    for input in inputs {
        let base = SolveOptions {
            tier: Tier::Standard,
            classes: 0,
            min_word_len: 3,
            short_words: None,
            max_words: UNLIMITED_WORDS,
            must_include: Vec::new(),
            exclude: Vec::new(),
            limit: 0,
            max_nodes: u64::MAX,
        };
        let search = Search::prepare(&dict, input, base.clone())?;

        let t0 = Instant::now();
        let (total, saturated, _) = search.count(&mut Memo::new(), 200_000_000);
        let count_ms = t0.elapsed().as_secs_f64() * 1000.0;

        let first_k = Search::prepare(&dict, input, SolveOptions { limit: 1000, ..base })?;
        let t1 = Instant::now();
        first_k.enumerate(|_| Flow::Continue);
        let stream_ms = t1.elapsed().as_secs_f64() * 1000.0;

        println!(
            "{:<24} {:>7} {:>10} {:>14} {:>10.1} {:>10.1}",
            input,
            anagram_core::normalize(input).len(),
            search.candidate_count(),
            format!("{}{}", if saturated { ">" } else { "" }, total),
            count_ms,
            stream_ms
        );
    }
    Ok(())
}

// -------------------------------------------------------------------- batch

/// One line of `data/candidates.jsonl`. Fields the pipeline does not need
/// here are carried as-is and ignored.
#[derive(Deserialize)]
struct Candidate {
    id: String,
    input: String,
    category: String,
    #[serde(default)]
    status: String,
    /// Words to search around when the input has more results than `--limit`.
    #[serde(default)]
    anchors: Vec<String>,
    /// How the input's numbers and symbols are read, every item of them
    /// (phase N). A candidate without one was made before phase N, when
    /// every item was dropped, and is read that way still.
    #[serde(default)]
    reading: Option<BTreeMap<String, String>>,
}

impl Candidate {
    /// The reading as `(item, name)` pairs: the candidate's own, or every item dropped.
    fn reading_pairs(&self) -> Vec<(String, String)> {
        match &self.reading {
            Some(map) => map.iter().map(|(k, v)| (k.clone(), v.clone())).collect(),
            None => anagram_core::reading_items(&self.input, &[])
                .into_iter()
                .map(|item| (item.key, "drop".to_owned()))
                .collect(),
        }
    }

    /// The input with its numbers and symbols read: what the search is given.
    fn read_input(&self) -> String {
        anagram_core::read_input(&self.input, &self.reading_pairs())
    }
}

/// One result, as the prefilter consumes it. `count` and `index` are decimal
/// strings because both routinely exceed what a JSON number can hold exactly.
/// With `--spellings=all` one result becomes a row per spelling, all with the
/// same `index`.
#[derive(Serialize)]
struct Row<'a> {
    id: &'a str,
    input: &'a str,
    category: &'a str,
    count: String,
    count_is_floor: bool,
    index: String,
    sampled: bool,
    /// The anchor word this row's search required; absent for the main search.
    #[serde(skip_serializing_if = "Option::is_none")]
    anchor: Option<&'a str>,
    /// How the input's digits and symbols were read, every item of them; absent for an input without any.
    #[serde(skip_serializing_if = "Option::is_none")]
    reading: Option<&'a BTreeMap<String, String>>,
    words: Vec<String>,
    /// Each word of `words` that is a term of a class rather than a word of the
    /// dictionary, with its class; absent when every word is a word.
    #[serde(skip_serializing_if = "Option::is_none")]
    classes: Option<BTreeMap<String, &'static str>>,
    zipf: Vec<u8>,
    /// The narrowest tier each word belongs to, or a term's class.
    tiers: Vec<&'static str>,
    pos: Vec<u16>,
}

#[derive(Serialize)]
struct AnchorSummary {
    word: String,
    count: String,
    count_is_floor: bool,
    head: usize,
    sampled: usize,
    rows: usize,
    /// The text's own row was dropped from this search, so `count` is one
    /// fewer than the letters alone would give.
    text_dropped: bool,
    error: Option<String>,
}

#[derive(Serialize)]
struct CandidateSummary {
    id: String,
    input: String,
    candidates: usize,
    count: String,
    count_is_floor: bool,
    head: usize,
    head_truncated: bool,
    sampled: usize,
    /// Rows written for this candidate: every spelling, every anchor search.
    rows: usize,
    /// Results with more spellings than `--expand-cap`, cut at the cap.
    capped: usize,
    /// The text's own row was dropped from the main search, so `count` is one
    /// fewer than the letters alone would give.
    text_dropped: bool,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    anchors: Vec<AnchorSummary>,
    error: Option<String>,
    ms: u128,
}

#[derive(Serialize)]
struct Summary {
    /// The pipeline's settings version (`s2`…), when the caller names one.
    #[serde(skip_serializing_if = "Option::is_none")]
    settings: Option<String>,
    /// The counting convention: `excluded` means the text itself is never a
    /// result, so a candidate's `count` leaves it out (see `text_dropped`).
    /// A summary without the field counted it.
    text: &'static str,
    tier: &'static str,
    min_word_len: u8,
    short_words: usize,
    /// Site additions admitted beside `tier`. Absent on a queue enumerated
    /// before s3, which had none.
    #[serde(skip_serializing_if = "Option::is_none")]
    additions: Option<usize>,
    /// The dictionary the queue was enumerated with: the pinned revision and
    /// the built word list's hash. Absent on a queue from before s4.
    #[serde(skip_serializing_if = "Option::is_none")]
    dictionary: Option<DictionaryId>,
    /// The default readings of digits and symbols the queue was enumerated
    /// under (phase N); each row carries its input's own. Absent before s5.
    readings: BTreeMap<&'static str, &'static str>,
    /// The term classes admitted beside `tier` (the literal rule, N3); absent
    /// for a queue of words alone.
    #[serde(skip_serializing_if = "Vec::is_empty")]
    classes: Vec<&'static str>,
    max_words: u8,
    spellings: &'static str,
    expand_cap: usize,
    limit: usize,
    sample: usize,
    seed: u64,
    max_nodes: u64,
    candidates: Vec<CandidateSummary>,
    rows: usize,
}

/// A small, fast, well-distributed generator; the point is determinism, not
/// cryptography. Same seed and candidate, same sample, every run.
struct SplitMix64(u64);

impl SplitMix64 {
    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    /// Uniform in `[lo, hi)`. `hi - lo` fits a u128; rejection keeps it unbiased.
    fn below(&mut self, lo: u128, hi: u128) -> u128 {
        let span = hi - lo;
        if span <= u64::MAX as u128 {
            let span = span as u64;
            let zone = u64::MAX - (u64::MAX % span);
            loop {
                let r = self.next();
                if r < zone {
                    return lo + (r % span) as u128;
                }
            }
        }
        // Two draws; bias beyond 2^64 results is immaterial for sampling.
        let r = ((self.next() as u128) << 64) | self.next() as u128;
        lo + r % span
    }
}

fn fnv1a(text: &str) -> u64 {
    let mut hash = 0xcbf2_9ce4_8422_2325u64;
    for b in text.bytes() {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x100_0000_01b3);
    }
    hash
}

/// What every search in a batch shares.
struct BatchConfig {
    tier: Tier,
    classes: ClassMask,
    min_word_len: u8,
    short_words: Vec<String>,
    allow: HashSet<String>,
    max_words: u8,
    all_spellings: bool,
    expand_cap: usize,
    limit: usize,
    sample: usize,
    seed: u64,
    max_nodes: u64,
}

impl BatchConfig {
    fn options(&self, must_include: Vec<String>) -> SolveOptions {
        SolveOptions {
            tier: self.tier,
            classes: self.classes,
            min_word_len: self.min_word_len,
            short_words: (!self.short_words.is_empty()).then(|| self.short_words.clone()),
            max_words: self.max_words,
            must_include,
            exclude: Vec::new(),
            limit: 0,
            max_nodes: self.max_nodes,
        }
    }
}

/// The spellings a result can be written with, one list per class, commonest
/// first. A word under the minimum length counts only when the allowlist names
/// it (a term is governed by its class, not the length), and a forced slot
/// keeps the word the search was asked for. Without `--spellings=all`, each
/// list keeps its first entry, as the batch always did. The indices are the
/// search's: a word's, or a virtual candidate's pseudo index.
fn spellings(dict: &Dict, search: &Search, classes: &[u32], forced: &[String], config: &BatchConfig) -> Vec<Vec<u32>> {
    classes
        .iter()
        .enumerate()
        .map(|(slot, &class)| {
            let words = search.spellings(dict, class);
            let mut list: Vec<u32> = match forced.get(slot) {
                Some(word) => words.filter(|&w| search.word(dict, w) == word).collect(),
                None => words
                    .filter(|&w| {
                        let word = search.word(dict, w);
                        word.len() >= config.min_word_len as usize
                            || config.allow.contains(word)
                            || search.class_of(dict, w).is_some()
                    })
                    .collect(),
            };
            if list.is_empty() {
                list.extend(search.spellings(dict, class).next());
            }
            if !config.all_spellings {
                list.truncate(1);
            }
            list
        })
        .collect()
}

/// Every combination of one spelling per slot, the last slot varying fastest,
/// stopping at `cap`. The flag says whether the cap cut it short. A
/// combination `skip` names is passed over before it counts toward the cap:
/// that is the text's own words, which are never a result.
fn expand(slots: &[Vec<u32>], cap: usize, skip: impl Fn(&[u32]) -> bool) -> (Vec<Vec<u32>>, bool) {
    let total = slots.iter().try_fold(1usize, |n, s| n.checked_mul(s.len())).unwrap_or(usize::MAX);
    if total == 0 {
        return (Vec::new(), false);
    }
    let mut out = Vec::new();
    let mut at = vec![0usize; slots.len()];
    let mut passed = 0usize;
    loop {
        let words: Vec<u32> = at.iter().zip(slots).map(|(&i, s)| s[i]).collect();
        if skip(&words) {
            passed += 1;
        } else {
            out.push(words);
        }
        if out.len() >= cap {
            return (out, total - passed > cap);
        }
        let mut slot = slots.len();
        loop {
            if slot == 0 {
                return (out, false);
            }
            slot -= 1;
            at[slot] += 1;
            if at[slot] < slots[slot].len() {
                break;
            }
            at[slot] = 0;
        }
    }
}

/// What one search wrote.
#[derive(Default)]
struct Pass {
    count: u128,
    count_is_floor: bool,
    head: usize,
    head_truncated: bool,
    sampled: usize,
    rows: usize,
    capped: usize,
    text_dropped: bool,
}

/// Write one result as rows, one per spelling. Returns the rows written and
/// whether the spellings were capped. A result already written for this
/// candidate (the same classes, found by another search) writes nothing.
#[allow(clippy::too_many_arguments)]
fn write_result(
    raw: &mut impl Write,
    dict: &Dict,
    search: &Search,
    candidate: &Candidate,
    anchor: Option<&str>,
    forced: &[String],
    classes: &[u32],
    count: u128,
    count_is_floor: bool,
    index: u128,
    sampled: bool,
    seen: &mut HashSet<Vec<u32>>,
    config: &BatchConfig,
) -> Result<(usize, bool), Box<dyn std::error::Error>> {
    let mut key = classes.to_vec();
    key.sort_unstable();
    if !seen.insert(key) {
        return Ok((0, false));
    }
    let slots = spellings(dict, search, classes, forced, config);
    let cap = if config.all_spellings { config.expand_cap.max(1) } else { 1 };
    let (mut combinations, capped) = expand(&slots, cap, |words| search.is_text(words));
    // With one spelling per class, the text's own row has only the text to
    // show here, so it takes the spelling the search itself gives it.
    if combinations.is_empty() && search.text_row() == TextRow::Respelled {
        let respelled = search.spell_indices(dict, classes);
        if !search.is_text(&respelled) && !respelled.contains(&u32::MAX) {
            combinations.push(respelled);
        }
    }
    for words in &combinations {
        let terms: BTreeMap<String, &'static str> = words
            .iter()
            .filter_map(|&w| search.class_of(dict, w).map(|c| (search.word(dict, w).to_owned(), c.name())))
            .collect();
        let row = Row {
            id: &candidate.id,
            input: &candidate.input,
            category: &candidate.category,
            count: count.to_string(),
            count_is_floor,
            index: index.to_string(),
            sampled,
            anchor,
            reading: candidate.reading.as_ref(),
            words: words.iter().map(|&w| search.word(dict, w).to_owned()).collect(),
            classes: (!terms.is_empty()).then_some(terms),
            zipf: words.iter().map(|&w| if Search::is_virtual(w) { 0 } else { dict.zipf[w as usize] }).collect(),
            tiers: words
                .iter()
                .map(|&w| {
                    // The narrowest tier the word belongs to, or a term's class.
                    // The last arm used to be an unconditional "full", which
                    // would now mislabel every site addition as part of the
                    // pinned list.
                    //
                    // These read the built tiers, not `in_scope`: a run that
                    // admitted additions would otherwise label every one of
                    // them "common" and the prefilter would wave them through
                    // as pinned words.
                    if let Some(class) = search.class_of(dict, w) {
                        class.name()
                    } else if dict.in_built_tier(w, Tier::Common) {
                        "common"
                    } else if dict.in_built_tier(w, Tier::Standard) {
                        "standard"
                    } else if dict.in_built_tier(w, Tier::Full) {
                        "full"
                    } else {
                        "extended"
                    }
                })
                .collect(),
            pos: words.iter().map(|&w| if Search::is_virtual(w) { 0 } else { dict.pos[w as usize] }).collect(),
        };
        serde_json::to_writer(&mut *raw, &row)?;
        raw.write_all(b"\n")?;
    }
    Ok((combinations.len(), capped))
}

/// One search over a candidate: the head, the first `limit` results in
/// canonical order, then a uniform sample of what the head did not cover.
#[allow(clippy::too_many_arguments)]
fn run_pass(
    raw: &mut impl Write,
    dict: &Dict,
    search: &Search,
    candidate: &Candidate,
    anchor: Option<&str>,
    forced: &[String],
    seen: &mut HashSet<Vec<u32>>,
    config: &BatchConfig,
) -> Result<Pass, Box<dyn std::error::Error>> {
    let mut memo = Memo::new();
    let (total, saturated, count_stats) = search.count(&mut memo, config.max_nodes);
    let count_is_floor = saturated || count_stats.truncated;
    let text_dropped = search.text_row() == TextRow::Dropped;
    let mut pass = Pass { count: total, count_is_floor, text_dropped, ..Pass::default() };

    let mut cursor: Cursor = search.cursor();
    let mut index: u128 = 0;
    while pass.head < config.limit {
        let Some(classes) = cursor.next(search) else { break };
        let (rows, capped) =
            write_result(raw, dict, search, candidate, anchor, forced, classes, total, count_is_floor, index, false, seen, config)?;
        pass.rows += rows;
        pass.capped += capped as usize;
        pass.head += 1;
        index += 1;
    }
    pass.head_truncated = cursor.truncated();

    // Skipped when the count is only a floor, since positions past it are
    // undefined.
    if !count_is_floor && total > config.limit as u128 && config.sample > 0 {
        let key = match anchor {
            Some(word) => format!("{}+{word}", candidate.id),
            None => candidate.id.clone(),
        };
        let mut rng = SplitMix64(config.seed ^ fnv1a(&key));
        let want = config.sample.min((total - config.limit as u128).min(usize::MAX as u128) as usize);
        let mut picks: Vec<u128> = Vec::with_capacity(want);
        let mut tries = 0usize;
        while picks.len() < want && tries < want * 20 {
            tries += 1;
            let pick = rng.below(config.limit as u128, total);
            if !picks.contains(&pick) {
                picks.push(pick);
            }
        }
        picks.sort_unstable();
        for pick in picks {
            let Some(classes) = search.nth(&mut memo, pick) else { continue };
            let (rows, capped) =
                write_result(raw, dict, search, candidate, anchor, forced, &classes, total, count_is_floor, pick, true, seen, config)?;
            pass.rows += rows;
            pass.capped += capped as usize;
            pass.sampled += 1;
        }
    }
    Ok(pass)
}

fn batch(argv: &Argv) -> Result<(), Box<dyn std::error::Error>> {
    let input_path = argv.get("in").ok_or("batch needs --in=candidates.jsonl")?;
    let out_dir = PathBuf::from(argv.get("out").ok_or("batch needs --out=DIR")?);
    let short_words = argv.get("short-words").map(read_short_words).transpose()?.unwrap_or_default();
    let config = BatchConfig {
        tier: tier_from(argv.get("tier").unwrap_or("standard")),
        classes: classes_flag(argv)?,
        min_word_len: argv.num("min-len", 3),
        allow: short_words.iter().cloned().collect(),
        short_words,
        max_words: argv.num("max-words", 4),
        all_spellings: match argv.get("spellings").unwrap_or("first") {
            "first" => false,
            "all" => true,
            other => return Err(format!("--spellings must be first or all, not {other}").into()),
        },
        expand_cap: argv.num("expand-cap", 64),
        // `--first` is the older name for `--limit`.
        limit: argv.get("limit").or(argv.get("first")).and_then(|v| v.parse().ok()).unwrap_or(2_000),
        sample: argv.num("sample", 500),
        seed: argv.num("seed", 1),
        max_nodes: argv.num("max-nodes", 50_000_000),
    };
    let only_status = argv.get("status").unwrap_or("new");

    let (mut dict, dictionary) = load_dict_with_id()?;
    // The site's additions, searched alongside `--tier`. An addition lives
    // only in Extended, so without this a Common run can never reach one.
    // Words the artifact does not carry are ignored, which is the state
    // between adding a word and rebuilding the dictionary.
    let additions = argv.get("additions").map(read_short_words).transpose()?.unwrap_or_default();
    let admitted = dict.admit(&additions);
    if !additions.is_empty() {
        eprintln!("additions: {admitted} of {} admitted beside {}", additions.len(), tier_name(config.tier));
    }
    let dict = dict;
    fs::create_dir_all(&out_dir)?;
    let mut raw = std::io::BufWriter::new(fs::File::create(out_dir.join("raw.jsonl"))?);

    let text = fs::read_to_string(input_path)?;
    let mut summaries = Vec::new();
    let mut rows_written = 0usize;

    for (line_no, line) in text.lines().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        let candidate: Candidate = serde_json::from_str(line)
            .map_err(|e| format!("{input_path}:{}: {e}", line_no + 1))?;
        if only_status != "all" && candidate.status != only_status {
            continue;
        }

        let started = Instant::now();
        eprint!("  {:<40}", candidate.input);

        // The input read as the candidate records, or with every item dropped
        // for one from before phase N; a reading that does not fit is an error row.
        let prepared = match anagram_core::reading_problem(&candidate.input, &candidate.reading_pairs()) {
            Some(problem) => Err(problem),
            None => Search::prepare(&dict, &candidate.read_input(), config.options(Vec::new())).map_err(|e| e.to_string()),
        };
        let search = match prepared {
            Ok(search) => search,
            Err(error) => {
                eprintln!(" error: {error}");
                summaries.push(CandidateSummary {
                    id: candidate.id,
                    input: candidate.input,
                    candidates: 0,
                    count: "0".to_owned(),
                    count_is_floor: false,
                    head: 0,
                    head_truncated: false,
                    sampled: 0,
                    rows: 0,
                    capped: 0,
                    text_dropped: false,
                    anchors: Vec::new(),
                    error: Some(error.to_string()),
                    ms: started.elapsed().as_millis(),
                });
                continue;
            }
        };

        let mut seen: HashSet<Vec<u32>> = HashSet::new();
        let main = run_pass(&mut raw, &dict, &search, &candidate, None, &[], &mut seen, &config)?;
        let mut rows = main.rows;
        let mut capped = main.capped;

        // Anchor searches reach past the head and the sample of a big input.
        // When the main search already wrote every result, they add nothing.
        let complete = !main.count_is_floor && !main.head_truncated && main.count <= config.limit as u128;
        let mut anchors = Vec::new();
        if !complete {
            for anchor in &candidate.anchors {
                let word = anagram_core::normalize(anchor);
                let forced = vec![word.clone()];
                let summary = match Search::prepare(&dict, &candidate.read_input(), config.options(forced.clone())) {
                    Ok(anchored) => {
                        let pass = run_pass(&mut raw, &dict, &anchored, &candidate, Some(&word), &forced, &mut seen, &config)?;
                        rows += pass.rows;
                        capped += pass.capped;
                        AnchorSummary {
                            word,
                            count: pass.count.to_string(),
                            count_is_floor: pass.count_is_floor,
                            head: pass.head,
                            sampled: pass.sampled,
                            rows: pass.rows,
                            text_dropped: pass.text_dropped,
                            error: None,
                        }
                    }
                    Err(error) => AnchorSummary {
                        word,
                        count: "0".to_owned(),
                        count_is_floor: false,
                        head: 0,
                        sampled: 0,
                        rows: 0,
                        text_dropped: false,
                        error: Some(error.to_string()),
                    },
                };
                anchors.push(summary);
            }
        }

        rows_written += rows;
        eprintln!(
            " {}{} results · head {}{} · sample {} · {} rows{} · {:.1?}",
            if main.count_is_floor { ">" } else { "" },
            main.count,
            main.head,
            if main.head_truncated { " (truncated)" } else { "" },
            main.sampled,
            rows,
            if anchors.is_empty() { String::new() } else { format!(" · {} anchors", anchors.len()) },
            started.elapsed()
        );
        summaries.push(CandidateSummary {
            id: candidate.id,
            input: candidate.input,
            candidates: search.candidate_count(),
            count: main.count.to_string(),
            count_is_floor: main.count_is_floor,
            head: main.head,
            head_truncated: main.head_truncated,
            sampled: main.sampled,
            rows,
            capped,
            text_dropped: main.text_dropped,
            anchors,
            error: None,
            ms: started.elapsed().as_millis(),
        });
    }

    raw.flush()?;
    let summary = Summary {
        settings: argv.get("settings").map(str::to_owned),
        text: "excluded",
        tier: tier_name(config.tier),
        min_word_len: config.min_word_len,
        short_words: config.short_words.len(),
        additions: (!additions.is_empty()).then_some(admitted),
        dictionary: Some(dictionary),
        readings: anagram_core::READING_DEFAULTS.iter().copied().collect(),
        classes: class_names(config.classes),
        max_words: config.max_words,
        spellings: if config.all_spellings { "all" } else { "first" },
        expand_cap: config.expand_cap,
        limit: config.limit,
        sample: config.sample,
        seed: config.seed,
        max_nodes: config.max_nodes,
        candidates: summaries,
        rows: rows_written,
    };
    fs::write(out_dir.join("summary.json"), serde_json::to_string_pretty(&summary)? + "\n")?;
    eprintln!("{} rows -> {}", rows_written, out_dir.join("raw.jsonl").display());
    Ok(())
}

// -------------------------------------------------------------------- check

/// Is `phrase` a real anagram of `input` at `tier`, with the term classes of
/// `--classes=` admitted and the input read as `--read=` says? Prints why
/// not, and exits non-zero, when it is not. The same folding the site applies
/// is used on both sides, so "Beyoncé" and "beyonce" agree. The phrase is
/// given as a record stores it, its words as letters (`hakes` for `hake$`
/// under `--read='$:s'`), and the answer names every term's class.
fn check(argv: &Argv) -> Result<(), Box<dyn std::error::Error>> {
    let [input, phrase] = argv.positional.as_slice() else {
        return Err("check needs two arguments: \"input\" \"anagram phrase\"".into());
    };
    let tier = tier_from(argv.get("tier").unwrap_or("standard"));
    let classes = classes_flag(argv)?;
    let reading = reading_flag(argv, input)?;
    let dict = load_dict()?;
    let scope = Scope { tier, classes };

    // The input read as `--read=` says (the defaults without it); the phrase is words and terms.
    let letters = anagram_core::normalize_with(input, &reading);
    let phrase_pool = anagram_core::normalize(phrase);
    let mut slots = Slots::new();
    let want = Counts::from_pool(&letters, &mut slots);
    let have = Counts::in_slots(&phrase_pool, &slots);
    let want = match want {
        Ok(counts) => counts,
        Err(anagram_core::PoolError::TooManyRepeats(c)) => {
            println!("no: {c:?} appears more than 127 times");
            std::process::exit(1);
        }
        Err(_) => {
            println!("no: the input has more than six different digits and symbols");
            std::process::exit(1);
        }
    };
    if have != Some(want) {
        println!("no: the characters differ ({letters} vs {phrase_pool})");
        std::process::exit(1);
    }

    let mut tags: Vec<String> = Vec::new();
    for word in phrase.split_whitespace() {
        let folded = anagram_core::normalize(word);
        if folded.is_empty() {
            continue;
        }
        if dict.find_class(&folded, scope).is_some() {
            let index = dict.index_of(&folded).expect("a member of its class");
            if let Some(class) = Class::first_in(dict.term_bits(index) & classes) {
                tags.push(format!("{folded} {}", class.name()));
            }
            continue;
        }
        // A term with a digit or symbol, or a numeral of the input's digits.
        let is_numeral = classes & Class::Numerals.bit() != 0 && folded.chars().all(|c| c.is_ascii_digit());
        let term = dict.term_index(&folded).filter(|&i| dict.term_bits(i) & classes != 0);
        match (is_numeral, term) {
            (true, _) => tags.push(format!("{folded} {}", Class::Numerals.name())),
            (false, Some(index)) => {
                let class = Class::first_in(dict.term_bits(index) & classes).expect("a bit of the mask");
                tags.push(format!("{folded} {}", class.name()));
            }
            (false, None) => {
                let with = if classes == 0 { String::new() } else { format!(" with {}", class_names(classes).join(", ")) };
                println!("no: {folded:?} is not in the {} dictionary{with}", tier_name(tier));
                std::process::exit(1);
            }
        }
    }
    for (key, name) in &reading {
        if name != anagram_core::SELF && name != anagram_core::DROP {
            tags.push(format!("{key} as {name}"));
        }
    }
    if tags.is_empty() {
        println!("ok");
    } else {
        println!("ok  [{}]", tags.join(", "));
    }
    let _ = WORDS;
    Ok(())
}
