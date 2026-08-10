//! Ars Magna — multi-word anagram search.
//!
//! Given a phrase, find every way its exact letters can be re-partitioned into
//! dictionary words. Punctuation, digits and spacing are discarded; what remains
//! is a multiset of 26 letters that must be consumed completely.
//!
//! ```
//! use anagram_core::{Dict, Search, SolveOptions, Tier};
//!
//! let dict = Dict::from_words(["dirty", "room", "moor", "dormitory"]).unwrap();
//! let options = SolveOptions { tier: Tier::Full, min_word_len: 3, ..Default::default() };
//! let search = Search::prepare(&dict, "dormitory", options).unwrap();
//!
//! let mut found = Vec::new();
//! search.enumerate(|classes| {
//!     found.push(search.spell(&dict, classes, Tier::Full));
//!     anagram_core::Flow::Continue
//! });
//!
//! // `room` and `moor` are the same anagram class, so the search yields one
//! // result for them, spelled with the class representative. With real
//! // frequency data that is the commonest spelling; here there is none, so it
//! // falls back to alphabetical and `moor` wins.
//! assert!(found.iter().any(|words| {
//!     let mut sorted = words.clone();
//!     sorted.sort();
//!     sorted == ["dirty", "moor"]
//! }));
//! ```
//!
//! Use [`Dict::class_words`] to recover the other spellings of a result.

pub mod counts;
pub mod dict;
pub mod search;

pub use counts::{normalize, Counts};
pub use dict::{Dict, DictError, SigClass, Tier, TierBits, WordList};
pub use search::{Candidates, Flow, Memo, Search, SolveError, SolveOptions, Stats, UNLIMITED_WORDS};

/// One solution, as words.
pub type Solution = Vec<String>;

/// Convenience wrapper: enumerate up to `options.limit` solutions as words.
///
/// Real callers should use [`Search`] directly so results can be streamed as
/// they are found rather than collected; this exists for tests and the CLI.
pub fn solve(dict: &Dict, input: &str, options: SolveOptions) -> Result<Vec<Solution>, SolveError> {
    let tier = options.tier;
    let search = Search::prepare(dict, input, options)?;
    let mut out = Vec::new();
    search.enumerate(|classes| {
        out.push(search.spell(dict, classes, tier));
        Flow::Continue
    });
    Ok(out)
}
