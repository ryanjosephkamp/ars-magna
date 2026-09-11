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
//! ```

use anagram_core::{Counts, Cursor, Dict, Flow, Memo, Search, SolveOptions, Tier, UNLIMITED_WORDS};
use serde::{Deserialize, Serialize};
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

fn load_dict() -> Result<Dict, Box<dyn std::error::Error>> {
    let dist = repo_root().join("apps/web/public/dict");
    let manifest = fs::read_to_string(dist.join("manifest.json")).map_err(|_| {
        format!(
            "no dictionary at {}\n  run `pnpm dict:fetch && pnpm dict:build` first",
            dist.display()
        )
    })?;

    let name_of = |key: &str| -> Option<String> {
        // Small hand-rolled extraction; the manifest is tiny and stable.
        let anchor = format!("\"{key}\"");
        let start = manifest.find(&anchor)? + anchor.len();
        let rest = &manifest[start..];
        let name_at = rest.find("\"name\"")? + "\"name\"".len();
        let after = &rest[name_at..];
        let open = after.find('"')? + 1;
        let close = after[open..].find('"')?;
        Some(after[open..open + close].to_owned())
    };

    let full = name_of("full").ok_or("manifest is missing the full artifact")?;
    let tiers = name_of("tiers").ok_or("manifest is missing the tiers artifact")?;

    let dict_bytes = fs::read(dist.join(&full))?;
    let tier_bytes = fs::read(dist.join(&tiers))?;

    Ok(Dict::decode(&dict_bytes, Some(&tier_bytes))?)
}

fn tier_from(name: &str) -> Tier {
    match name {
        "common" => Tier::Common,
        "full" => Tier::Full,
        _ => Tier::Standard,
    }
}

fn tier_name(tier: Tier) -> &'static str {
    match tier {
        Tier::Common => "common",
        Tier::Standard => "standard",
        Tier::Full => "full",
    }
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
    text: String,
    tier: Tier,
    min_word_len: u8,
    max_words: u8,
    limit: usize,
}

fn parse(args: &[String]) -> Args {
    let argv = Argv::parse(args);
    Args {
        text: argv.positional.join(" "),
        tier: tier_from(argv.get("tier").unwrap_or("standard")),
        min_word_len: argv.num("min-len", 3),
        max_words: argv.num("max-words", UNLIMITED_WORDS),
        limit: argv.num("limit", 50),
    }
}

fn options(args: &Args, limit: usize) -> SolveOptions {
    SolveOptions {
        tier: args.tier,
        min_word_len: args.min_word_len,
        max_words: args.max_words,
        must_include: Vec::new(),
        limit,
        max_nodes: u64::MAX,
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let (command, rest) = argv.split_first().map(|(c, r)| (c.as_str(), r)).unwrap_or((
        "help",
        &[][..],
    ));

    match command {
        "solve" => solve(parse(rest)),
        "count" => count(parse(rest)),
        "bench" => bench(),
        "batch" => batch(&Argv::parse(rest)),
        "check" => check(&Argv::parse(rest)),
        _ => {
            eprintln!(
                "usage:\n  anagram <solve|count> \"text\" [--tier=] [--min-len=] [--max-words=] [--limit=]\n  \
                 anagram bench\n  \
                 anagram batch --in=candidates.jsonl --out=DIR [--tier=] [--min-len=] [--max-words=] \
                 [--first=] [--sample=] [--seed=] [--status=new|all] [--max-nodes=]\n  \
                 anagram check \"input\" \"anagram phrase\" [--tier=]"
            );
            Ok(())
        }
    }
}

fn solve(args: Args) -> Result<(), Box<dyn std::error::Error>> {
    let dict = load_dict()?;
    let tier = args.tier;
    let search = Search::prepare(&dict, &args.text, options(&args, args.limit))?;

    println!(
        "{} candidate classes for {:?}",
        search.candidate_count(),
        anagram_core::normalize(&args.text)
    );

    let started = Instant::now();
    let mut shown = 0usize;
    let stats = search.enumerate(|classes| {
        let mut words = search.spell(&dict, classes, tier);
        words.sort_by_key(|w| std::cmp::Reverse(w.len()));
        println!("  {}", words.join(" "));
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
    Ok(())
}

fn count(args: Args) -> Result<(), Box<dyn std::error::Error>> {
    let dict = load_dict()?;
    let search = Search::prepare(&dict, &args.text, options(&args, 0))?;

    let started = Instant::now();
    let (total, saturated, stats) = search.count(&mut Memo::new(), u64::MAX);
    let elapsed = started.elapsed();

    println!(
        "{}{} anagrams",
        if saturated { "more than " } else { "" },
        total
    );
    println!(
        "  {} candidates · {} nodes · {} memo entries · {} hits · {:.1?}",
        stats.candidates, stats.nodes, stats.memo_entries, stats.memo_hits, elapsed
    );
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
            min_word_len: 3,
            max_words: UNLIMITED_WORDS,
            must_include: Vec::new(),
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
}

/// One result, as the prefilter consumes it. `count` and `index` are decimal
/// strings because both routinely exceed what a JSON number can hold exactly.
#[derive(Serialize)]
struct Row<'a> {
    id: &'a str,
    input: &'a str,
    category: &'a str,
    count: String,
    count_is_floor: bool,
    index: String,
    sampled: bool,
    words: Vec<String>,
    zipf: Vec<u8>,
    tiers: Vec<&'static str>,
    pos: Vec<u16>,
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
    error: Option<String>,
    ms: u128,
}

#[derive(Serialize)]
struct Summary {
    tier: &'static str,
    min_word_len: u8,
    max_words: u8,
    first: usize,
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

/// The per-word metadata a result carries into the prefilter.
fn describe(dict: &Dict, classes: &[u32], tier: Tier) -> (Vec<String>, Vec<u8>, Vec<&'static str>, Vec<u16>) {
    let mut words = Vec::with_capacity(classes.len());
    let mut zipf = Vec::with_capacity(classes.len());
    let mut tiers = Vec::with_capacity(classes.len());
    let mut pos = Vec::with_capacity(classes.len());
    for &class in classes {
        let Some(w) = dict.class_words(class as usize, tier).next() else { continue };
        words.push(dict.word(w).to_owned());
        zipf.push(dict.zipf[w as usize]);
        pos.push(dict.pos[w as usize]);
        tiers.push(if dict.in_tier(w, Tier::Common) {
            "common"
        } else if dict.in_tier(w, Tier::Standard) {
            "standard"
        } else {
            "full"
        });
    }
    (words, zipf, tiers, pos)
}

fn batch(argv: &Argv) -> Result<(), Box<dyn std::error::Error>> {
    let input_path = argv.get("in").ok_or("batch needs --in=candidates.jsonl")?;
    let out_dir = PathBuf::from(argv.get("out").ok_or("batch needs --out=DIR")?);
    let tier = tier_from(argv.get("tier").unwrap_or("standard"));
    let min_word_len: u8 = argv.num("min-len", 3);
    let max_words: u8 = argv.num("max-words", 4);
    let first: usize = argv.num("first", 2_000);
    let sample: usize = argv.num("sample", 500);
    let seed: u64 = argv.num("seed", 1);
    let max_nodes: u64 = argv.num("max-nodes", 50_000_000);
    let only_status = argv.get("status").unwrap_or("new");

    let dict = load_dict()?;
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

        let options = SolveOptions {
            tier,
            min_word_len,
            max_words,
            must_include: Vec::new(),
            limit: 0,
            max_nodes,
        };
        let search = match Search::prepare(&dict, &candidate.input, options) {
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
                    error: Some(error.to_string()),
                    ms: started.elapsed().as_millis(),
                });
                continue;
            }
        };

        let mut memo = Memo::new();
        let (total, saturated, count_stats) = search.count(&mut memo, max_nodes);
        let count_is_floor = saturated || count_stats.truncated;

        // The head: the first `first` results in canonical order.
        let mut cursor: Cursor = search.cursor();
        let mut head = 0usize;
        let mut index: u128 = 0;
        while head < first {
            let Some(classes) = cursor.next(&search) else { break };
            let (words, zipf, tiers, pos) = describe(&dict, classes, tier);
            let row = Row {
                id: &candidate.id,
                input: &candidate.input,
                category: &candidate.category,
                count: total.to_string(),
                count_is_floor,
                index: index.to_string(),
                sampled: false,
                words,
                zipf,
                tiers,
                pos,
            };
            serde_json::to_writer(&mut raw, &row)?;
            raw.write_all(b"\n")?;
            head += 1;
            index += 1;
        }
        let head_truncated = cursor.truncated();

        // The sample: uniform over what the head did not cover. Skipped when
        // the count is only a floor, since positions past it are undefined.
        let mut sampled = 0usize;
        if !count_is_floor && total > first as u128 && sample > 0 {
            let mut rng = SplitMix64(seed ^ fnv1a(&candidate.id));
            let want = sample.min((total - first as u128).min(usize::MAX as u128) as usize);
            let mut picks: Vec<u128> = Vec::with_capacity(want);
            let mut tries = 0usize;
            while picks.len() < want && tries < want * 20 {
                tries += 1;
                let pick = rng.below(first as u128, total);
                if !picks.contains(&pick) {
                    picks.push(pick);
                }
            }
            picks.sort_unstable();
            for pick in picks {
                let Some(classes) = search.nth(&mut memo, pick) else { continue };
                let (words, zipf, tiers, pos) = describe(&dict, &classes, tier);
                let row = Row {
                    id: &candidate.id,
                    input: &candidate.input,
                    category: &candidate.category,
                    count: total.to_string(),
                    count_is_floor,
                    index: pick.to_string(),
                    sampled: true,
                    words,
                    zipf,
                    tiers,
                    pos,
                };
                serde_json::to_writer(&mut raw, &row)?;
                raw.write_all(b"\n")?;
                sampled += 1;
            }
        }

        rows_written += head + sampled;
        eprintln!(
            " {}{} results · head {head}{} · sample {sampled} · {:.1?}",
            if count_is_floor { ">" } else { "" },
            total,
            if head_truncated { " (truncated)" } else { "" },
            started.elapsed()
        );
        summaries.push(CandidateSummary {
            id: candidate.id,
            input: candidate.input,
            candidates: search.candidate_count(),
            count: total.to_string(),
            count_is_floor,
            head,
            head_truncated,
            sampled,
            error: None,
            ms: started.elapsed().as_millis(),
        });
    }

    raw.flush()?;
    let summary = Summary {
        tier: tier_name(tier),
        min_word_len,
        max_words,
        first,
        sample,
        seed,
        max_nodes,
        candidates: summaries,
        rows: rows_written,
    };
    fs::write(out_dir.join("summary.json"), serde_json::to_string_pretty(&summary)? + "\n")?;
    eprintln!("{} rows -> {}", rows_written, out_dir.join("raw.jsonl").display());
    Ok(())
}

// -------------------------------------------------------------------- check

/// Is `phrase` a real anagram of `input` at `tier`? Prints why not, and exits
/// non-zero, when it is not. The same folding the site applies is used on
/// both sides, so "Beyoncé" and "beyonce" agree.
fn check(argv: &Argv) -> Result<(), Box<dyn std::error::Error>> {
    let [input, phrase] = argv.positional.as_slice() else {
        return Err("check needs two arguments: \"input\" \"anagram phrase\"".into());
    };
    let tier = tier_from(argv.get("tier").unwrap_or("standard"));
    let dict = load_dict()?;

    let want = Counts::from_word(&anagram_core::normalize(input));
    let have = Counts::from_word(&anagram_core::normalize(phrase));
    let (Some(want), Some(have)) = (want, have) else {
        println!("no: a letter appears more than 127 times");
        std::process::exit(1);
    };
    if want != have {
        println!(
            "no: the letters differ ({} vs {})",
            anagram_core::normalize(input),
            anagram_core::normalize(phrase)
        );
        std::process::exit(1);
    }

    for word in phrase.split_whitespace() {
        let folded = anagram_core::normalize(word);
        if folded.is_empty() {
            continue;
        }
        if dict.find_class(&folded, tier).is_none() {
            println!("no: {folded:?} is not in the {} dictionary", tier_name(tier));
            std::process::exit(1);
        }
    }
    println!("ok");
    Ok(())
}
