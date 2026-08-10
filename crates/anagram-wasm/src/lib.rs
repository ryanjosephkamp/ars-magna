//! Thin wasm-bindgen surface over `anagram-core`.
//!
//! Deliberately does no work of its own — it owns the dictionary, keeps one
//! prepared query alive between calls, and marshals results across the
//! boundary. Everything interesting lives in the core crate, which is also what
//! the native CLI and the test oracle exercise.
//!
//! # Why a session
//!
//! The search is recursive and cannot be suspended mid-descent, so results are
//! served in two ways depending on what the UI needs:
//!
//! * `batch(offset, len)` re-enumerates and skips — cheap while `offset` is
//!   small, which covers scrolling through the first few thousand results.
//! * `nth(index)` unranks using the counting DP — O(depth), so it stays instant
//!   at result 12,000,000, which is what makes deep paging and "surprise me"
//!   possible at all.
//!
//! The memo is owned by the session and shared across both, so the expensive
//! counting pass happens once per query rather than once per call.

use anagram_core::{Dict, Flow, Memo, Search, SolveOptions, Tier};
use wasm_bindgen::prelude::*;

fn tier_from(name: &str) -> Tier {
    match name {
        "common" => Tier::Common,
        "full" => Tier::Full,
        _ => Tier::Standard,
    }
}

/// Results are marshalled as one string: solutions separated by `\n`, words by
/// a space. A single large string crosses the boundary far more cheaply than
/// thousands of individual JS values, and the worker splits it off the main
/// thread anyway.
fn pack(rows: &[Vec<String>]) -> String {
    let mut out = String::with_capacity(rows.len() * 24);
    for (i, row) in rows.iter().enumerate() {
        if i > 0 {
            out.push('\n');
        }
        for (j, word) in row.iter().enumerate() {
            if j > 0 {
                out.push(' ');
            }
            out.push_str(word);
        }
    }
    out
}

#[wasm_bindgen]
pub struct Engine {
    dict: Dict,
    session: Option<Session>,
}

struct Session {
    search: Search,
    memo: Memo,
    tier: Tier,
}

#[wasm_bindgen]
pub struct QueryStats {
    candidates: usize,
    nodes: f64,
    emitted: usize,
    truncated: bool,
}

#[wasm_bindgen]
impl QueryStats {
    #[wasm_bindgen(getter)]
    pub fn candidates(&self) -> usize {
        self.candidates
    }
    #[wasm_bindgen(getter)]
    pub fn nodes(&self) -> f64 {
        self.nodes
    }
    #[wasm_bindgen(getter)]
    pub fn emitted(&self) -> usize {
        self.emitted
    }
    #[wasm_bindgen(getter)]
    pub fn truncated(&self) -> bool {
        self.truncated
    }
}

#[wasm_bindgen]
impl Engine {
    /// Build an engine from the shipped artifacts.
    ///
    /// `tier_bytes` may be omitted when loading a standalone tier file (the
    /// Common artifact carries no bitsets, because every word in it is a
    /// member by construction).
    #[wasm_bindgen(constructor)]
    pub fn new(dict_bytes: &[u8], tier_bytes: Option<Box<[u8]>>) -> Result<Engine, JsError> {
        let dict = Dict::decode(dict_bytes, tier_bytes.as_deref())
            .map_err(|e| JsError::new(&e.to_string()))?;
        Ok(Engine {
            dict,
            session: None,
        })
    }

    #[wasm_bindgen(getter, js_name = wordCount)]
    pub fn word_count(&self) -> usize {
        self.dict.words.len()
    }

    #[wasm_bindgen(getter, js_name = classCount)]
    pub fn class_count(&self) -> usize {
        self.dict.classes.len()
    }

    /// Prepare a query. Returns the number of candidate classes, which is the
    /// only honest predictor of how hard the search will be — far better than
    /// input length, since letter *diversity* is what drives the explosion.
    #[wasm_bindgen]
    #[allow(clippy::too_many_arguments)]
    pub fn begin(
        &mut self,
        input: &str,
        tier: &str,
        min_word_len: u8,
        max_words: u8,
        must_include: Vec<String>,
        max_nodes: f64,
    ) -> Result<usize, JsError> {
        let tier = tier_from(tier);
        let options = SolveOptions {
            tier,
            min_word_len: min_word_len.max(1),
            max_words: max_words.max(1),
            must_include,
            limit: 0,
            max_nodes: max_nodes as u64,
        };

        let search = Search::prepare(&self.dict, input, options)
            .map_err(|e| JsError::new(&e.to_string()))?;
        let candidates = search.candidate_count();

        self.session = Some(Session {
            search,
            memo: Memo::new(),
            tier,
        });
        Ok(candidates)
    }

    /// Exact solution count as a decimal string.
    ///
    /// A string because the total routinely exceeds `Number.MAX_SAFE_INTEGER` —
    /// an 18-million-result query is ordinary, and long inputs run far past
    /// 2^53. A `>` prefix means the true count overflowed `u128` and this is a
    /// floor.
    #[wasm_bindgen]
    pub fn count(&mut self, node_budget: f64) -> Result<String, JsError> {
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;
        let (total, saturated, _) = session.search.count(&mut session.memo, node_budget as u64);
        Ok(if saturated {
            format!(">{total}")
        } else {
            total.to_string()
        })
    }

    /// Solutions `offset..offset + len` in canonical order.
    #[wasm_bindgen]
    pub fn batch(&mut self, offset: usize, len: usize) -> Result<String, JsError> {
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;

        let mut rows: Vec<Vec<String>> = Vec::with_capacity(len);
        let mut seen = 0usize;
        session.search.enumerate(|classes| {
            if seen >= offset {
                rows.push(session.search.spell(&self.dict, classes, session.tier));
            }
            seen += 1;
            if rows.len() >= len {
                Flow::Stop
            } else {
                Flow::Continue
            }
        });

        Ok(pack(&rows))
    }

    /// A single solution by index, without enumerating the ones before it.
    #[wasm_bindgen]
    pub fn nth(&mut self, index: &str) -> Result<Option<String>, JsError> {
        let index: u128 = index
            .parse()
            .map_err(|_| JsError::new("index must be a decimal integer"))?;
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;

        Ok(session
            .search
            .nth(&mut session.memo, index)
            .map(|classes| pack(&[session.search.spell(&self.dict, &classes, session.tier)])))
    }

    /// Every spelling of the class each word in a solution belongs to, so the
    /// UI can offer `listen / silent / tinsel / enlist / inlets` for one result
    /// slot. Only 21,960 of 350,469 classes have more than one member, so this
    /// is progressive disclosure, not permanent chrome.
    #[wasm_bindgen(js_name = spellingsOf)]
    pub fn spellings_of(&self, word: &str, tier: &str) -> Vec<String> {
        let tier = tier_from(tier);
        match self.dict.find_class(word, tier) {
            Some(class) => self
                .dict
                .class_words(class, tier)
                .map(|w| self.dict.word(w).to_owned())
                .collect(),
            None => Vec::new(),
        }
    }

    /// Whether a word exists at a tier — used to validate "must include" chips.
    #[wasm_bindgen]
    pub fn has(&self, word: &str, tier: &str) -> bool {
        self.dict.find_class(word, tier_from(tier)).is_some()
    }
}
