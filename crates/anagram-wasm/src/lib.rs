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
//! * `batch(offset, len)` serves pages from a resumable cursor kept in the
//!   session. A page that continues where the last one ended costs only its
//!   own length; any other offset is reached by unranking with the counting
//!   memo, O(depth), and the walk resumes from there. Scrolling is linear.
//! * `nth(index)` unranks a single result the same way, which is what makes
//!   "Go to" and "Surprise me" instant at result 12,000,000.
//!
//! The memo is owned by the session and shared across all of it, so the
//! expensive counting pass happens once per query rather than once per call.

use anagram_core::{Cursor, Dict, Memo, Search, SolveOptions, Tier};
use wasm_bindgen::prelude::*;

fn tier_from(name: &str) -> Tier {
    match name {
        "common" => Tier::Common,
        "full" => Tier::Full,
        "extended" => Tier::Extended,
        // Standard is the default, and an unknown name lands here rather than
        // failing: a stale bundle asking for a tier this build does not know
        // still returns real results, just narrower ones.
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

/// The options every query shares: nothing capped but the node budget, and no
/// short words admitted below the minimum length.
fn options(
    tier: Tier,
    min_word_len: u8,
    max_words: u8,
    must_include: Vec<String>,
    exclude: Vec<String>,
    max_nodes: f64,
) -> SolveOptions {
    SolveOptions {
        tier,
        min_word_len: min_word_len.max(1),
        short_words: None,
        max_words: max_words.max(1),
        must_include,
        exclude,
        limit: 0,
        max_nodes: max_nodes as u64,
    }
}

/// A total as the worker sends it: digits, with `>` in front when it is a floor.
fn total_text(total: u128, floor: bool) -> String {
    if floor {
        format!(">{total}")
    } else {
        total.to_string()
    }
}

#[wasm_bindgen]
pub struct Engine {
    dict: Dict,
    session: Option<Session>,
    /// Set by `batch`: whether the last one ended naturally or was cut short.
    exhausted: bool,
}

struct Session {
    search: Search,
    memo: Memo,
    tier: Tier,
    /// The paging cursor. `None` until the first batch, or after a seek past
    /// the end.
    cursor: Option<Cursor>,
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
    /// Build an engine from the shipped artifacts: the full word list and the
    /// tier bitsets over it. `tier_bytes` may be omitted for a list that has
    /// no tiers, in which case every word is in every tier.
    #[wasm_bindgen(constructor)]
    pub fn new(dict_bytes: &[u8], tier_bytes: Option<Box<[u8]>>) -> Result<Engine, JsError> {
        let dict = Dict::decode(dict_bytes, tier_bytes.as_deref())
            .map_err(|e| JsError::new(&e.to_string()))?;
        Ok(Engine {
            dict,
            session: None,
            exhausted: true,
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
        must_exclude: Vec<String>,
        max_nodes: f64,
    ) -> Result<usize, JsError> {
        let tier = tier_from(tier);
        let search = Search::prepare(
            &self.dict,
            input,
            options(tier, min_word_len, max_words, must_include, must_exclude, max_nodes),
        )
        .map_err(|e| JsError::new(&e.to_string()))?;
        let candidates = search.candidate_count();

        self.session = Some(Session {
            search,
            memo: Memo::new(),
            tier,
            cursor: None,
        });
        Ok(candidates)
    }

    /// Count a query without making it the session.
    ///
    /// The search page asks this while the reader types a filter: how many of
    /// every result contain these words. Preparing it through [`Engine::begin`]
    /// would replace the list the reader is scrolling, so it gets a search and
    /// a memo of its own, dropped when the count is done. Same format as
    /// [`Engine::count`], `>` and all.
    #[wasm_bindgen(js_name = countQuery)]
    #[allow(clippy::too_many_arguments)]
    pub fn count_query(
        &self,
        input: &str,
        tier: &str,
        min_word_len: u8,
        max_words: u8,
        must_include: Vec<String>,
        must_exclude: Vec<String>,
        max_nodes: f64,
    ) -> Result<String, JsError> {
        let search = Search::prepare(
            &self.dict,
            input,
            options(tier_from(tier), min_word_len, max_words, must_include, must_exclude, max_nodes),
        )
        .map_err(|e| JsError::new(&e.to_string()))?;
        let mut memo = Memo::new();
        let (total, saturated, stats) = search.count(&mut memo, max_nodes as u64);
        Ok(total_text(total, saturated || stats.truncated))
    }

    /// Solution count as a decimal string.
    ///
    /// A string because the total routinely exceeds `Number.MAX_SAFE_INTEGER` —
    /// an 18-million-result query is ordinary, and long inputs run far past
    /// 2^53.
    ///
    /// A `>` prefix means the number is a **floor**, not an exact figure. That
    /// happens two ways: the true total overflowed `u128`, or the search hit its
    /// node budget before finishing. Both must be reported, because presenting a
    /// budget-truncated count as exact would be the site quietly lying about the
    /// one number it exists to produce.
    #[wasm_bindgen]
    pub fn count(&mut self, node_budget: f64) -> Result<String, JsError> {
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;
        let (total, saturated, stats) =
            session.search.count(&mut session.memo, node_budget as u64);
        Ok(total_text(total, saturated || stats.truncated))
    }

    /// Solutions `offset..offset + len` in canonical order.
    ///
    /// Continues the session's cursor when `offset` is where it left off, and
    /// seeks otherwise. Sets [`Engine::exhausted`]: false means the search
    /// stopped early rather than running out of answers, so the caller must
    /// not treat a short batch as the end of the list.
    #[wasm_bindgen]
    pub fn batch(&mut self, offset: usize, len: usize) -> Result<String, JsError> {
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;
        let Session { search, memo, tier, cursor } = session;

        let resumes = matches!(cursor, Some(c) if c.position() == offset as u128 && !c.truncated());
        if !resumes {
            *cursor = if offset == 0 {
                Some(search.cursor())
            } else {
                search.cursor_at(memo, offset as u128)
            };
        }

        let Some(cursor) = cursor.as_mut() else {
            // Past the end: nothing there, and nothing was cut short.
            self.exhausted = true;
            return Ok(String::new());
        };

        let mut rows: Vec<Vec<String>> = Vec::with_capacity(len);
        while rows.len() < len {
            match cursor.next(search) {
                Some(classes) => rows.push(search.spell(&self.dict, classes, *tier)),
                None => break,
            }
        }

        // A short batch means one of two very different things: the result set
        // genuinely ended, or the node budget ran out mid-search. Only the first
        // is "no more results".
        self.exhausted = rows.len() >= len || !cursor.truncated();
        Ok(pack(&rows))
    }

    /// Up to `limit` solutions from the start, for export.
    ///
    /// Uses its own cursor so the browsing session's paging position is left
    /// exactly where the reader had it. Sets [`Engine::exhausted`] like
    /// [`Engine::batch`] does.
    #[wasm_bindgen]
    pub fn collect(&mut self, limit: usize) -> Result<String, JsError> {
        let session = self
            .session
            .as_ref()
            .ok_or_else(|| JsError::new("no active query"))?;

        let mut cursor = session.search.cursor();
        let mut rows: Vec<Vec<String>> = Vec::with_capacity(limit.min(1 << 16));
        while rows.len() < limit {
            match cursor.next(&session.search) {
                Some(classes) => rows.push(session.search.spell(&self.dict, classes, session.tier)),
                None => break,
            }
        }
        self.exhausted = rows.len() >= limit || !cursor.truncated();
        Ok(pack(&rows))
    }

    /// Whether the last [`Engine::batch`] ended because the results ran out,
    /// rather than because the search was cut short.
    #[wasm_bindgen(getter)]
    pub fn exhausted(&self) -> bool {
        self.exhausted
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

    /// Part-of-speech masks for a space-separated list of words, in order.
    ///
    /// One call per batch rather than one per word: the worker flattens every
    /// row it is about to show, asks once, and slices the answer back apart.
    #[wasm_bindgen(js_name = posMasks)]
    pub fn pos_masks(&self, words: &str) -> Vec<u16> {
        words
            .split(' ')
            .filter(|w| !w.is_empty())
            .map(|w| self.dict.pos_of(w))
            .collect()
    }

    /// The frequency byte of each word in a space-separated list, in order, as
    /// the dictionary carries it: `(zipf + 1) * 24`, and 0 where the build had
    /// no frequency for the word. One call per list, like `posMasks`.
    #[wasm_bindgen(js_name = zipfOf)]
    pub fn zipf_of(&self, words: &str) -> Vec<u8> {
        words
            .split(' ')
            .filter(|w| !w.is_empty())
            .map(|w| self.dict.index_of(w).map_or(0, |i| self.dict.zipf[i as usize]))
            .collect()
    }

    /// Whether a word exists at a tier — used to validate "must include" chips.
    #[wasm_bindgen]
    pub fn has(&self, word: &str, tier: &str) -> bool {
        self.dict.find_class(word, tier_from(tier)).is_some()
    }
}
