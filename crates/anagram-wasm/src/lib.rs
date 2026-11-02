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
//!
//! # The pool, the classes and the pieces
//!
//! A query is an [`Expanded`] search: one piece per leet reading of the text
//! (one piece, and nothing new, when no character has leet on), each over the
//! pool of its letters, digits and symbols, with the term classes the mask
//! admits. Rows cross the boundary as before, and beside them a second packed
//! string carries each row's tags — the class of every term, the written form
//! with a leet character where its letter went, and the reading — empty when
//! no row has any, which is every row of words alone.

use anagram_core::{Class, Dict, Expanded, Memo, MergedCursor, Row, SolveOptions, Tier};
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
fn pack(rows: &[Row]) -> String {
    let mut out = String::with_capacity(rows.len() * 24);
    for (i, row) in rows.iter().enumerate() {
        if i > 0 {
            out.push('\n');
        }
        for (j, word) in row.words.iter().enumerate() {
            if j > 0 {
                out.push(' ');
            }
            out.push_str(word);
        }
    }
    out
}

/// The rows' tags, one line per row parallel to [`pack`]: empty for a row of
/// words alone as typed, else `reading|classes|written`, where `reading` is
/// the leet pairs `$:s` comma-joined, `classes` one name per word with `-`
/// for a word of the dictionary, and `written` the words as shown, space
/// separated. The whole string is empty when no row has a tag, so the common
/// case parses nothing.
fn pack_tags(rows: &[Row]) -> String {
    let tagged = |row: &Row| !row.reading.is_empty() || row.classes.iter().any(Option::is_some);
    if !rows.iter().any(tagged) {
        return String::new();
    }
    let mut out = String::new();
    for (i, row) in rows.iter().enumerate() {
        if i > 0 {
            out.push('\n');
        }
        if !tagged(row) {
            continue;
        }
        for (j, (c, l)) in row.reading.iter().enumerate() {
            if j > 0 {
                out.push(',');
            }
            out.push(*c);
            out.push(':');
            out.push(*l);
        }
        out.push('|');
        for (j, class) in row.classes.iter().enumerate() {
            if j > 0 {
                out.push(' ');
            }
            out.push_str(class.map_or("-", Class::name));
        }
        out.push('|');
        for (j, word) in row.written.iter().enumerate() {
            if j > 0 {
                out.push(' ');
            }
            out.push_str(word);
        }
    }
    out
}

/// A class mask from the names the worker sends; an unknown name is an error.
fn classes_from(names: &[String]) -> Result<u16, JsError> {
    let mut mask = 0;
    for name in names {
        let class = Class::from_name(name).ok_or_else(|| JsError::new("not a term class"))?;
        mask |= class.bit();
    }
    Ok(mask)
}

/// The characters leet is on for, from the worker's list of one-character strings.
fn leet_from(chars: &[String]) -> Vec<char> {
    chars.iter().filter_map(|s| s.chars().next()).collect()
}

/// The options every query shares: nothing capped but the node budget, and no
/// short words admitted below the minimum length.
fn options(
    tier: Tier,
    classes: u16,
    min_word_len: u8,
    max_words: u8,
    must_include: Vec<String>,
    exclude: Vec<String>,
    max_nodes: f64,
) -> SolveOptions {
    SolveOptions {
        tier,
        classes,
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
    expanded: Expanded,
    /// One memo per piece.
    memos: Vec<Memo>,
    /// Each piece's total once [`Engine::count`] has run: what places an
    /// offset in its piece.
    counts: Option<Vec<(u128, bool)>>,
    /// The paging cursor. `None` until the first batch, or after a seek past
    /// the end.
    cursor: Option<MergedCursor>,
}

impl Session {
    /// The pieces' totals, counted now under `node_budget` when [`Engine::count`] has not run.
    fn counts(&mut self, node_budget: u64) -> &[(u128, bool)] {
        if self.counts.is_none() {
            let counts: Vec<(u128, bool)> = (0..self.expanded.pieces.len())
                .map(|i| {
                    let (n, floor, _) = self.expanded.count_piece(i, &mut self.memos[i], node_budget);
                    (n, floor)
                })
                .collect();
            self.counts = Some(counts);
        }
        self.counts.as_deref().expect("counted")
    }
}

/// What [`Engine::count_query`] found: the total in [`Engine::count`]'s
/// format, whether the text's own row was left out of it, and the digits and
/// symbols of the text no term uses (see [`Engine::unused`]).
#[wasm_bindgen]
pub struct Counted {
    total: String,
    text_left_out: bool,
    unused: String,
}

#[wasm_bindgen]
impl Counted {
    #[wasm_bindgen(getter)]
    pub fn total(&self) -> String {
        self.total.clone()
    }
    #[wasm_bindgen(getter, js_name = textLeftOut)]
    pub fn text_left_out(&self) -> bool {
        self.text_left_out
    }
    #[wasm_bindgen(getter)]
    pub fn unused(&self) -> String {
        self.unused.clone()
    }
}

/// Rows and their tags, as [`Engine::batch`], [`Engine::collect`] and
/// [`Engine::nth`] hand them over: two packed strings, parallel by line.
#[wasm_bindgen]
pub struct Rows {
    rows: String,
    tags: String,
}

#[wasm_bindgen]
impl Rows {
    #[wasm_bindgen(getter)]
    pub fn rows(&self) -> String {
        self.rows.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn tags(&self) -> String {
        self.tags.clone()
    }
}

fn rows_of(rows: &[Row]) -> Rows {
    Rows { rows: pack(rows), tags: pack_tags(rows) }
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
    /// Build an engine from the shipped artifacts: the full word list, the
    /// tier bitsets over it, and the terms of the classes. `tier_bytes` may be
    /// omitted for a list that has no tiers, in which case every word is in
    /// every tier; `class_bytes` for a dictionary of words alone.
    #[wasm_bindgen(constructor)]
    pub fn new(dict_bytes: &[u8], tier_bytes: Option<Box<[u8]>>, class_bytes: Option<Box<[u8]>>) -> Result<Engine, JsError> {
        let dict = Dict::decode(dict_bytes, tier_bytes.as_deref(), class_bytes.as_deref())
            .map_err(|e| JsError::new(&e.to_string()))?;
        Ok(Engine {
            dict,
            session: None,
            exhausted: true,
        })
    }

    /// How many terms of each class the dictionary carries, in the classes'
    /// table order (`CLASSES` in the protocol): all zero for words alone.
    #[wasm_bindgen(js_name = classCounts)]
    pub fn class_counts(&self) -> Vec<u32> {
        self.dict.term_counts().iter().map(|&n| n as u32).collect()
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
    ///
    /// `input` keeps its spaces: they say what the text's own words are, and
    /// the text itself is never one of its results. `classes` names the term
    /// classes admitted beside the tier, `leet` the characters the search also
    /// tries as their letters (one piece per reading, merged).
    #[wasm_bindgen]
    #[allow(clippy::too_many_arguments)]
    pub fn begin(
        &mut self,
        input: &str,
        tier: &str,
        classes: Vec<String>,
        leet: Vec<String>,
        min_word_len: u8,
        max_words: u8,
        must_include: Vec<String>,
        must_exclude: Vec<String>,
        max_nodes: f64,
    ) -> Result<usize, JsError> {
        let tier = tier_from(tier);
        let expanded = Expanded::prepare(
            &self.dict,
            input,
            options(tier, classes_from(&classes)?, min_word_len, max_words, must_include, must_exclude, max_nodes),
            &leet_from(&leet),
        )
        .map_err(|e| JsError::new(&e.to_string()))?;
        let candidates = expanded.candidate_count();
        let memos = expanded.pieces.iter().map(|_| Memo::new()).collect();

        self.session = Some(Session { expanded, memos, counts: None, cursor: None });
        Ok(candidates)
    }

    /// Count a query without making it the session.
    ///
    /// The search page asks this while the reader types a filter: how many of
    /// every result contain these words. Preparing it through [`Engine::begin`]
    /// would replace the list the reader is scrolling, so it gets a search and
    /// a memo of its own, dropped when the count is done. Same format as
    /// [`Engine::count`], `>` and all, with whether the text was left out and
    /// which characters nothing uses.
    #[wasm_bindgen(js_name = countQuery)]
    #[allow(clippy::too_many_arguments)]
    pub fn count_query(
        &self,
        input: &str,
        tier: &str,
        classes: Vec<String>,
        leet: Vec<String>,
        min_word_len: u8,
        max_words: u8,
        must_include: Vec<String>,
        must_exclude: Vec<String>,
        max_nodes: f64,
    ) -> Result<Counted, JsError> {
        let expanded = Expanded::prepare(
            &self.dict,
            input,
            options(tier_from(tier), classes_from(&classes)?, min_word_len, max_words, must_include, must_exclude, max_nodes),
            &leet_from(&leet),
        )
        .map_err(|e| JsError::new(&e.to_string()))?;
        let mut memos: Vec<Memo> = expanded.pieces.iter().map(|_| Memo::new()).collect();
        let (total, floor, _) = expanded.count(&mut memos, max_nodes as u64);
        Ok(Counted { total: total_text(total, floor), text_left_out: expanded.text_left_out(), unused: expanded.unused() })
    }

    /// Whether the active query left the text's own row out: the text's words
    /// are a way to write its letters, no other word shares any of theirs, and
    /// the text is never its own result. The count is then one fewer than the
    /// letters alone would give, and the page says so beside it.
    #[wasm_bindgen(getter, js_name = textLeftOut)]
    pub fn text_left_out(&self) -> bool {
        self.session.as_ref().is_some_and(|s| s.expanded.text_left_out())
    }

    /// The digits and symbols of the active query's text that no term of the
    /// search uses, in the order they first appear: with words alone and
    /// "Blink-182" that is `182`, and the count is 0 for the lack of them.
    /// Empty for a text of letters, and once a class or a leet reading covers
    /// them.
    #[wasm_bindgen(getter)]
    pub fn unused(&self) -> String {
        self.session.as_ref().map(|s| s.expanded.unused()).unwrap_or_default()
    }

    /// The characters the active query tried as their leet letters, in order
    /// of first appearance: at most three of those asked for.
    #[wasm_bindgen(getter, js_name = leetTried)]
    pub fn leet_tried(&self) -> Vec<String> {
        self.session.as_ref().map(|s| s.expanded.leet.iter().map(|c| c.to_string()).collect()).unwrap_or_default()
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
        session.counts = None;
        let counts = session.counts(node_budget as u64);
        let mut total: u128 = 0;
        let mut floor = false;
        for &(n, f) in counts {
            total = match total.checked_add(n) {
                Some(t) => t,
                None => {
                    floor = true;
                    u128::MAX
                }
            };
            floor |= f;
        }
        Ok(total_text(total, floor))
    }

    /// Solutions `offset..offset + len` in canonical order, the pieces one
    /// after another.
    ///
    /// Continues the session's cursor when `offset` is where it left off, and
    /// seeks otherwise. Sets [`Engine::exhausted`]: false means the search
    /// stopped early rather than running out of answers, so the caller must
    /// not treat a short batch as the end of the list.
    #[wasm_bindgen]
    pub fn batch(&mut self, offset: usize, len: usize) -> Result<Rows, JsError> {
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;

        let resumes = matches!(&session.cursor, Some(c) if c.position() == offset as u128 && !c.truncated());
        if !resumes {
            session.cursor = if offset == 0 {
                Some(session.expanded.cursor())
            } else {
                let budget = session.expanded.pieces[0].search.options().max_nodes;
                let counts = session.counts(budget).to_vec();
                let Session { expanded, memos, .. } = session;
                expanded.cursor_at(memos, &counts, offset as u128)
            };
        }

        let Session { expanded, cursor, .. } = session;
        let Some(cursor) = cursor.as_mut() else {
            // Past the end: nothing there, and nothing was cut short.
            self.exhausted = true;
            return Ok(rows_of(&[]));
        };

        let mut rows: Vec<Row> = Vec::with_capacity(len);
        while rows.len() < len {
            match cursor.next(expanded) {
                Some((piece, classes)) => rows.push(expanded.row(&self.dict, piece, classes)),
                None => break,
            }
        }

        // A short batch means one of two very different things: the result set
        // genuinely ended, or the node budget ran out mid-search. Only the first
        // is "no more results".
        self.exhausted = rows.len() >= len || !cursor.truncated();
        Ok(rows_of(&rows))
    }

    /// Up to `limit` solutions from the start, for export.
    ///
    /// Uses its own cursor so the browsing session's paging position is left
    /// exactly where the reader had it. Sets [`Engine::exhausted`] like
    /// [`Engine::batch`] does.
    #[wasm_bindgen]
    pub fn collect(&mut self, limit: usize) -> Result<Rows, JsError> {
        let session = self
            .session
            .as_ref()
            .ok_or_else(|| JsError::new("no active query"))?;

        let mut cursor = session.expanded.cursor();
        let mut rows: Vec<Row> = Vec::with_capacity(limit.min(1 << 16));
        while rows.len() < limit {
            match cursor.next(&session.expanded) {
                Some((piece, classes)) => rows.push(session.expanded.row(&self.dict, piece, classes)),
                None => break,
            }
        }
        self.exhausted = rows.len() >= limit || !cursor.truncated();
        Ok(rows_of(&rows))
    }

    /// Whether the last [`Engine::batch`] ended because the results ran out,
    /// rather than because the search was cut short.
    #[wasm_bindgen(getter)]
    pub fn exhausted(&self) -> bool {
        self.exhausted
    }

    /// A single solution by index, without enumerating the ones before it.
    #[wasm_bindgen]
    pub fn nth(&mut self, index: &str) -> Result<Option<Rows>, JsError> {
        let index: u128 = index
            .parse()
            .map_err(|_| JsError::new("index must be a decimal integer"))?;
        let session = self
            .session
            .as_mut()
            .ok_or_else(|| JsError::new("no active query"))?;
        let budget = session.expanded.pieces[0].search.options().max_nodes;
        let counts = session.counts(budget).to_vec();
        let Session { expanded, memos, .. } = session;
        Ok(expanded
            .nth(memos, &counts, index)
            .map(|(piece, classes)| rows_of(&[expanded.row(&self.dict, piece, &classes)])))
    }

    /// Every spelling of the class each word in a solution belongs to, so the
    /// UI can offer `listen / silent / tinsel / enlist / inlets` for one result
    /// slot. Only 21,960 of 350,469 classes have more than one member, so this
    /// is progressive disclosure, not permanent chrome. `classes` names the
    /// term classes whose spellings count beside the tier's words.
    #[wasm_bindgen(js_name = spellingsOf)]
    pub fn spellings_of(&self, word: &str, tier: &str, classes: Vec<String>) -> Result<Vec<String>, JsError> {
        let scope = anagram_core::Scope { tier: tier_from(tier), classes: classes_from(&classes)? };
        Ok(match self.dict.find_class(word, scope) {
            Some(class) => self.dict.class_words(class, scope).map(|w| self.dict.word(w).to_owned()).collect(),
            None => Vec::new(),
        })
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

    /// Whether a word exists at a tier, or a term in one of `classes` — used to
    /// validate "must include" chips.
    #[wasm_bindgen]
    pub fn has(&self, word: &str, tier: &str, classes: Vec<String>) -> Result<bool, JsError> {
        let scope = anagram_core::Scope { tier: tier_from(tier), classes: classes_from(&classes)? };
        Ok(self.dict.find_class(word, scope).is_some()
            || self.dict.term_index(word).is_some_and(|i| self.dict.term_bits(i) & scope.classes != 0))
    }
}
