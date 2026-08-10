//! Native driver for the engine.
//!
//! Runs the same code the browser runs, without the WASM boundary — which makes
//! it the right place to generate goldens, profile, and sanity-check a
//! dictionary build.
//!
//! ```text
//! anagram solve "dormitory"
//! anagram count "conversationalpiece" --tier=full
//! anagram bench
//! ```

use anagram_core::{Dict, Flow, Memo, Search, SolveOptions, Tier, UNLIMITED_WORDS};
use std::fs;
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
        // Small hand-rolled extraction; pulling in serde for three lookups in a
        // dev-only binary is not worth the compile time.
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

struct Args {
    text: String,
    tier: Tier,
    min_word_len: u8,
    max_words: u8,
    limit: usize,
}

fn parse(args: &[String]) -> Args {
    let mut out = Args {
        text: String::new(),
        tier: Tier::Standard,
        min_word_len: 3,
        max_words: UNLIMITED_WORDS,
        limit: 50,
    };
    for arg in args {
        if let Some(v) = arg.strip_prefix("--tier=") {
            out.tier = match v {
                "common" => Tier::Common,
                "full" => Tier::Full,
                _ => Tier::Standard,
            };
        } else if let Some(v) = arg.strip_prefix("--min-len=") {
            out.min_word_len = v.parse().unwrap_or(3);
        } else if let Some(v) = arg.strip_prefix("--max-words=") {
            out.max_words = v.parse().unwrap_or(UNLIMITED_WORDS);
        } else if let Some(v) = arg.strip_prefix("--limit=") {
            out.limit = v.parse().unwrap_or(50);
        } else if !arg.starts_with("--") {
            if !out.text.is_empty() {
                out.text.push(' ');
            }
            out.text.push_str(arg);
        }
    }
    out
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
        _ => {
            eprintln!("usage: anagram <solve|count|bench> \"text\" [--tier=] [--min-len=] [--max-words=] [--limit=]");
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
