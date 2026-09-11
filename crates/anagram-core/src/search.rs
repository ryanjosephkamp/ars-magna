//! The search itself.
//!
//! # Rarest-letter branching
//!
//! At any point some letters are scarcer than others. If the remaining letters
//! contain exactly one `j`, then exactly one word in every completion of that
//! state contains that `j` — so instead of trying all several thousand
//! candidates, only the few dozen containing `j` need considering. Branching on
//! the scarcest remaining letter collapses the branching factor by one to two
//! orders of magnitude, and it prunes for free: if some letter is left that no
//! candidate can cover, its bucket scan simply finds nothing and the node dies.
//!
//! # Why the obvious dedup is wrong
//!
//! A solution is a *multiset* of words, but a naive DFS finds each one `k!`
//! times, once per order. The textbook fix is to require non-decreasing word
//! indices down the path. That fix is **incorrect when combined with
//! rarest-letter branching**, and it fails silently — it drops real solutions
//! rather than producing wrong ones.
//!
//! Counterexample: input `abcd`, dictionary where `cd` has index 7 and `ab` has
//! index 2. The root's rarest letter is `c`, which forces `cd` (index 7) to be
//! picked first. The non-decreasing rule then bars everything below index 7,
//! so `ab` is unreachable and the solution `{ab, cd}` vanishes.
//!
//! # Runs
//!
//! The fix is to branch on a letter in a **run**: once `L` is chosen as the
//! pivot, keep consuming `L` until its count reaches zero, and only then pick a
//! new pivot. Index canonicalization applies *within* a run and resets at each
//! run boundary.
//!
//! This is exactly right because:
//!
//! * every word containing `L` must be selected during `L`'s run — the run does
//!   not end until no `L` is left, so the run's membership is forced;
//! * within a run, the chosen words are interchangeable, so requiring
//!   non-decreasing indices keeps exactly one of their orderings;
//! * a word containing both `L` and `M` is assigned unambiguously to the run of
//!   whichever pivot came first;
//! * for a fixed solution multiset, the whole pivot sequence is a deterministic
//!   function of the state, so exactly one DFS path produces it.
//!
//! The result is that every solution is generated exactly once, with no hash
//! set and no dedup pass. `tests/oracle.rs` checks this against a naive
//! enumerator on every input it can afford to.

use crate::counts::Counts;
use crate::dict::{Dict, Tier};
use std::collections::HashMap;

/// `max_words` at or above this is treated as unbounded, which lets the
/// counting memo key on the letter state alone.
pub const UNLIMITED_WORDS: u8 = 64;

#[derive(Clone, Debug)]
pub struct SolveOptions {
    pub tier: Tier,
    /// Words shorter than this are excluded from the vocabulary entirely.
    pub min_word_len: u8,
    /// Cap on how many words a solution may use.
    pub max_words: u8,
    /// Words that must appear in every result.
    pub must_include: Vec<String>,
    /// Stop after this many results. 0 means "no cap".
    pub limit: usize,
    /// Abort after this many DFS nodes, so a pathological query cannot hang.
    pub max_nodes: u64,
}

impl Default for SolveOptions {
    fn default() -> Self {
        SolveOptions {
            tier: Tier::Standard,
            min_word_len: 2,
            max_words: UNLIMITED_WORDS,
            must_include: Vec::new(),
            limit: 10_000,
            max_nodes: 50_000_000,
        }
    }
}

#[derive(Debug, PartialEq)]
pub enum SolveError {
    /// A `must_include` word is not in the dictionary at this tier.
    UnknownWord(String),
    /// A `must_include` word uses letters the input does not have.
    NotASubset(String),
    /// One letter occurs more than 127 times, which is more than a count
    /// byte can hold. Carries the offending letter.
    TooManyRepeats(char),
}

impl std::fmt::Display for SolveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolveError::UnknownWord(w) => write!(f, "{w:?} is not in this dictionary tier"),
            SolveError::NotASubset(w) => write!(f, "{w:?} does not fit in the input letters"),
            SolveError::TooManyRepeats(c) => write!(f, "{c:?} appears more than 127 times"),
        }
    }
}

impl std::error::Error for SolveError {}

#[derive(Default, Debug, Clone, Copy)]
pub struct Stats {
    pub candidates: usize,
    pub nodes: u64,
    pub subset_tests: u64,
    pub memo_entries: usize,
    pub memo_hits: u64,
    pub emitted: usize,
    /// Set when the node budget or result limit cut the search short.
    pub truncated: bool,
}

/// What the caller wants to happen after a result.
#[derive(PartialEq, Clone, Copy)]
pub enum Flow {
    Continue,
    Stop,
}

/// The classes that must be in every result, already resolved.
struct Forced {
    classes: Vec<u32>,
    /// The exact word the caller asked for, parallel to `classes`. A class
    /// has many spellings and `spell` normally shows the commonest, but a
    /// reader who pinned `starer` must see `starer`, not `arrest`.
    words: Vec<u32>,
    counts: Counts,
}

/// Per-query candidate set: the classes that could possibly appear, plus an
/// index from letter to the candidates containing it.
pub struct Candidates {
    counts: Vec<Counts>,
    len: Vec<u8>,
    class: Vec<u32>,
    buckets: [Vec<u32>; 26],
    longest: u32,
}

impl Candidates {
    pub fn len(&self) -> usize {
        self.class.len()
    }

    pub fn is_empty(&self) -> bool {
        self.class.is_empty()
    }

    /// Sweep the dictionary once, keeping classes that fit inside `target`.
    ///
    /// Candidate order is inherited from the dictionary's class order (longest
    /// first, then most common). That order is the canonicalization key for the
    /// run rule, and it also means the first results streamed to the UI are
    /// built from big, recognizable words rather than piles of two-letter ones.
    pub fn build(dict: &Dict, target: Counts, options: &SolveOptions) -> Candidates {
        let mut counts = Vec::new();
        let mut len = Vec::new();
        let mut class = Vec::new();

        for (index, sig) in dict.classes.iter().enumerate() {
            if sig.len < options.min_word_len {
                continue;
            }
            if !sig.counts.fits_in(target) {
                continue;
            }
            if !dict.class_in_tier(index, options.tier) {
                continue;
            }
            counts.push(sig.counts);
            len.push(sig.len);
            class.push(index as u32);
        }

        let mut buckets: [Vec<u32>; 26] = std::array::from_fn(|_| Vec::new());
        for (i, c) in counts.iter().enumerate() {
            for letter in 0..26 {
                if c.get(letter) != 0 {
                    buckets[letter].push(i as u32);
                }
            }
        }

        let longest = len.first().copied().unwrap_or(0) as u32;
        Candidates {
            counts,
            len,
            class,
            buckets,
            longest,
        }
    }
}

/// Reusable memo for counting and unranking.
///
/// Kept outside [`Search`] and owned by the caller so a session can count once
/// and then serve many `nth` lookups without rebuilding the table — which is
/// what makes deep pagination cheap.
#[derive(Default)]
pub struct Memo {
    table: HashMap<MemoKey, u128>,
    hits: u64,
}

impl Memo {
    pub fn new() -> Memo {
        Memo::default()
    }

    pub fn len(&self) -> usize {
        self.table.len()
    }

    pub fn is_empty(&self) -> bool {
        self.table.is_empty()
    }

    pub fn clear(&mut self) {
        self.table.clear();
        self.hits = 0;
    }
}

/// A prepared query: candidates, forced words, and the letters left to place.
///
/// Deliberately owns everything it needs, so it can outlive the call that built
/// it. The `Dict` is only required again to turn class indices back into words.
pub struct Search {
    candidates: Candidates,
    forced: Forced,
    remaining: Counts,
    options: SolveOptions,
    /// The input contained no letters at all.
    ///
    /// Mathematically the empty multiset has exactly one partition — the empty
    /// one — but "here is your 1 result: (nothing)" is a bug as far as anyone
    /// using the site is concerned. Empty in, empty out. Note this is *not* the
    /// same as `remaining.is_empty()`, which is legitimately reached when
    /// `must_include` accounts for every letter.
    empty_input: bool,
}

impl Search {
    pub fn prepare(
        dict: &Dict,
        input: &str,
        options: SolveOptions,
    ) -> Result<Search, SolveError> {
        let normalized = crate::counts::normalize(input);
        let empty_input = normalized.is_empty();
        // `normalized` is `[a-z]` by construction, so the only way this fails
        // is a letter past the 127-per-letter ceiling of a count byte. That
        // used to fall back to an empty multiset, whose one partition is the
        // empty one: "1 anagram", and a blank row. It is an error, and it says
        // which letter.
        let mut remaining = match Counts::from_word(&normalized) {
            Some(counts) => counts,
            None => {
                let letter = (b'a'..=b'z')
                    .map(char::from)
                    .find(|&l| normalized.chars().filter(|&c| c == l).count() > 127)
                    .unwrap_or('?');
                return Err(SolveError::TooManyRepeats(letter));
            }
        };

        let mut forced = Forced {
            classes: Vec::new(),
            words: Vec::new(),
            counts: Counts::EMPTY,
        };

        for word in &options.must_include {
            let word = crate::counts::normalize(word);
            let class = dict
                .find_class(&word, options.tier)
                .ok_or_else(|| SolveError::UnknownWord(word.clone()))?;
            let counts = dict.classes[class].counts;
            if !counts.fits_in(remaining) {
                return Err(SolveError::NotASubset(word));
            }
            // `find_class` succeeded, so the word is a member of this class.
            let word_index = dict.classes[class]
                .words
                .iter()
                .copied()
                .find(|&i| dict.word(i) == word)
                .expect("find_class returned a class without the word");
            remaining = remaining.sub(counts);
            forced.counts = forced.counts.add(counts);
            forced.classes.push(class as u32);
            forced.words.push(word_index);
        }

        let candidates = Candidates::build(dict, remaining, &options);

        Ok(Search {
            candidates,
            forced,
            remaining,
            options,
            empty_input,
        })
    }

    /// True when the input normalized away to nothing, so there is no query.
    pub fn is_empty(&self) -> bool {
        self.empty_input
    }

    pub fn candidate_count(&self) -> usize {
        self.candidates.len()
    }

    /// Letters left after removing any `must_include` words.
    pub fn remaining(&self) -> Counts {
        self.remaining
    }

    pub fn options(&self) -> &SolveOptions {
        &self.options
    }

    /// Enumerate solutions, calling `sink` with the class indices of each.
    ///
    /// `sink` returns [`Flow::Stop`] to end the search early. Forced words are
    /// prepended to every result, so the sink always sees a complete solution.
    pub fn enumerate<F>(&self, mut sink: F) -> Stats
    where
        F: FnMut(&[u32]) -> Flow,
    {
        let mut walker = Walker {
            candidates: &self.candidates,
            stack: Vec::with_capacity(32),
            solution: self.forced.classes.clone(),
            forced_len: self.forced.classes.len(),
            max_words: self.options.max_words as usize,
            limit: self.options.limit,
            node_budget: self.options.max_nodes,
            stats: Stats {
                candidates: self.candidates.len(),
                ..Stats::default()
            },
            stopped: false,
        };

        if self.empty_input || self.forced.classes.len() > walker.max_words {
            return walker.stats;
        }

        walker.pivot(self.remaining, &mut sink);
        walker.stats.truncated |= walker.stopped && walker.stats.emitted < self.options.limit;
        walker.stats
    }

    /// Exact number of solutions, without enumerating them.
    ///
    /// The same recursion, memoized on the remaining-letter state. On hard
    /// inputs this is a three-orders-of-magnitude saving: a 19-letter query with
    /// 18.5M solutions is counted from ~27k nodes.
    ///
    /// Returns `(count, saturated)`. `saturated` means the true total exceeded
    /// `u128::MAX` and the number is a floor, not an exact figure.
    pub fn count(&self, memo: &mut Memo, node_budget: u64) -> (u128, bool, Stats) {
        let unlimited = self.options.max_words >= UNLIMITED_WORDS;
        let budget_left = self
            .options
            .max_words
            .saturating_sub(self.forced.classes.len() as u8);

        let mut counter = Counter {
            candidates: &self.candidates,
            memo,
            unlimited,
            saturated: false,
            node_budget,
            stats: Stats {
                candidates: self.candidates.len(),
                ..Stats::default()
            },
            stopped: false,
        };

        if self.empty_input || (self.forced.classes.len() as u8) > self.options.max_words {
            return (0, false, counter.stats);
        }

        let total = counter.pivot(self.remaining, budget_left);
        let saturated = counter.saturated;
        let stopped = counter.stopped;
        let mut stats = counter.stats;
        stats.memo_entries = memo.table.len();
        stats.memo_hits = memo.hits;
        stats.truncated = stopped;
        (total, saturated, stats)
    }

    /// The `index`-th solution in canonical order, without enumerating the ones
    /// before it.
    ///
    /// Because [`Search::count`] gives exact subtree sizes, the search tree can
    /// be walked directly to a position: at each branch, subtract subtree counts
    /// until the index falls inside one. That makes deep pagination and
    /// "surprise me" O(depth × bucket) instead of O(index).
    pub fn nth(&self, memo: &mut Memo, index: u128) -> Option<Vec<u32>> {
        if self.empty_input {
            return None;
        }
        let unlimited = self.options.max_words >= UNLIMITED_WORDS;
        let budget_left = self
            .options
            .max_words
            .saturating_sub(self.forced.classes.len() as u8);

        let mut counter = Counter {
            candidates: &self.candidates,
            memo,
            unlimited,
            saturated: false,
            node_budget: u64::MAX,
            stats: Stats::default(),
            stopped: false,
        };

        let mut out = self.forced.classes.clone();
        let found = counter.unrank_pivot(self.remaining, budget_left, index, &mut |class| {
            out.push(class);
        });
        found.then_some(out)
    }

    /// Resolve class indices to concrete words, best spelling first.
    ///
    /// Forced words occupy the first slots of every solution, and those are
    /// spelled exactly as the caller wrote them; the rest take the commonest
    /// spelling in `tier`.
    pub fn spell(&self, dict: &Dict, classes: &[u32], tier: Tier) -> Vec<String> {
        classes
            .iter()
            .enumerate()
            .map(|(slot, &c)| {
                if let Some(&word) = self.forced.words.get(slot) {
                    if self.forced.classes[slot] == c {
                        return dict.word(word).to_owned();
                    }
                }
                dict.class_words(c as usize, tier)
                    .next()
                    .map(|w| dict.word(w).to_owned())
                    .unwrap_or_default()
            })
            .collect()
    }

    /// A resumable enumeration starting at result 0.
    ///
    /// Yields exactly what [`Search::enumerate`] yields, in the same order, but
    /// as a cursor that can be paused between results and picked up again.
    pub fn cursor(&self) -> Cursor {
        let mut cursor = self.blank_cursor();
        let max_words = self.options.max_words as usize;

        if self.empty_input || self.forced.classes.len() > max_words {
            cursor.done = true;
            return cursor;
        }
        if self.remaining.is_empty() {
            // Forced words consumed every letter: one result, the forced ones.
            cursor.emit_empty = true;
            return cursor;
        }

        // The root pivot, mirroring the first step of `Walker::pivot`.
        cursor.stats.nodes += 1;
        if !can_still_fit(&self.candidates, self.remaining, self.forced.classes.len(), max_words)
            || (max_words < UNLIMITED_WORDS as usize && self.forced.classes.len() + 1 > max_words)
        {
            cursor.done = true;
            return cursor;
        }
        let letter = self.remaining.rarest().unwrap();
        cursor.frames.push(Frame { rem: self.remaining, letter: letter as u8, pos: 0 });
        cursor
    }

    /// A resumable enumeration positioned so that its first `next` is result
    /// `index`, built by unranking rather than by walking: O(depth × bucket),
    /// the same cost as [`Search::nth`]. `None` when `index` is past the end.
    pub fn cursor_at(&self, memo: &mut Memo, index: u128) -> Option<Cursor> {
        let max_words = self.options.max_words as usize;
        if self.empty_input || self.forced.classes.len() > max_words {
            return None;
        }
        let mut cursor = self.blank_cursor();
        cursor.position = index;

        if self.remaining.is_empty() {
            if index != 0 {
                return None;
            }
            cursor.emit_empty = true;
            return Some(cursor);
        }

        let unlimited = self.options.max_words >= UNLIMITED_WORDS;
        let budget_left = self
            .options
            .max_words
            .saturating_sub(self.forced.classes.len() as u8);
        let mut counter = Counter {
            candidates: &self.candidates,
            memo,
            unlimited,
            saturated: false,
            node_budget: u64::MAX,
            stats: Stats::default(),
            stopped: false,
        };
        let found = counter.seek_pivot(
            self.remaining,
            budget_left,
            index,
            &mut cursor.frames,
            &mut cursor.chosen,
        );
        if !found {
            return None;
        }
        cursor.pending_emit = true;
        Some(cursor)
    }

    fn blank_cursor(&self) -> Cursor {
        Cursor {
            frames: Vec::with_capacity(32),
            chosen: Vec::with_capacity(32),
            solution: self.forced.classes.clone(),
            forced_len: self.forced.classes.len(),
            pending_emit: false,
            pending_pop: false,
            emit_empty: false,
            position: 0,
            max_words: self.options.max_words as usize,
            node_budget: self.options.max_nodes,
            stats: Stats {
                candidates: self.candidates.len(),
                ..Stats::default()
            },
            stopped: false,
            done: false,
        }
    }
}

// ------------------------------------------------------------------ walking

struct Walker<'a> {
    candidates: &'a Candidates,
    stack: Vec<u32>,
    solution: Vec<u32>,
    forced_len: usize,
    max_words: usize,
    limit: usize,
    node_budget: u64,
    stats: Stats,
    stopped: bool,
}

impl Walker<'_> {
    /// Run boundary: choose a fresh pivot letter and start its run.
    fn pivot<F>(&mut self, rem: Counts, sink: &mut F)
    where
        F: FnMut(&[u32]) -> Flow,
    {
        if self.stopped {
            return;
        }

        if rem.is_empty() {
            self.solution.truncate(self.forced_len);
            for &index in &self.stack {
                self.solution.push(self.candidates.class[index as usize]);
            }
            self.stats.emitted += 1;
            if sink(&self.solution) == Flow::Stop {
                self.stopped = true;
                return;
            }
            if self.limit != 0 && self.stats.emitted >= self.limit {
                self.stopped = true;
            }
            return;
        }

        self.stats.nodes += 1;
        if self.stats.nodes > self.node_budget {
            self.stopped = true;
            self.stats.truncated = true;
            return;
        }

        if !self.can_still_fit(rem) {
            return;
        }

        // `rem` is non-empty, so a rarest letter always exists.
        let letter = rem.rarest().unwrap();
        self.run(rem, letter, 0, sink);
    }

    /// Inside a run on `letter`: keep consuming it, and only consider
    /// candidates at or after `min_index` so each multiset is built once.
    fn run<F>(&mut self, rem: Counts, letter: usize, min_index: u32, sink: &mut F)
    where
        F: FnMut(&[u32]) -> Flow,
    {
        // Independent of which candidate we pick, so it is checked once rather
        // than per candidate.
        if self.max_words < UNLIMITED_WORDS as usize
            && self.stack.len() + self.forced_len + 1 > self.max_words
        {
            return;
        }

        let bucket = &self.candidates.buckets[letter];
        let start = bucket.partition_point(|&i| i < min_index);
        let room = rem.total();

        for position in start..bucket.len() {
            if self.stopped {
                return;
            }
            let index = bucket[position];
            let slot = index as usize;

            // Candidates are ordered longest-first, so anything still too long
            // just gets skipped; the tail of the bucket is all short words.
            if self.candidates.len[slot] as u32 > room {
                continue;
            }

            self.stats.subset_tests += 1;
            let counts = self.candidates.counts[slot];
            if !counts.fits_in(rem) {
                continue;
            }

            let next = rem.sub(counts);
            self.stack.push(index);
            if next.get(letter) > 0 {
                // The pivot letter survives, so the run continues and the index
                // floor stays in force.
                self.run(next, letter, index, sink);
            } else {
                self.pivot(next, sink);
            }
            self.stack.pop();
        }
    }

    fn can_still_fit(&self, rem: Counts) -> bool {
        can_still_fit(self.candidates, rem, self.stack.len() + self.forced_len, self.max_words)
    }
}

// ------------------------------------------------------------------- cursor

/// Cheap admissibility check against `max_words`: even using the longest
/// candidate every time, can the rest still be covered in budget?
fn can_still_fit(candidates: &Candidates, rem: Counts, used: usize, max_words: usize) -> bool {
    if max_words >= UNLIMITED_WORDS as usize {
        return true;
    }
    if candidates.longest == 0 {
        return false;
    }
    let needed = rem.total().div_ceil(candidates.longest) as usize;
    used + needed <= max_words
}

/// One frame of a resumable walk: a run on `letter` over `rem`, where `pos`
/// is the next position in `buckets[letter]` to try.
#[derive(Clone, Copy, Debug)]
struct Frame {
    rem: Counts,
    letter: u8,
    pos: u32,
}

/// A suspended enumeration: the explicit-stack form of [`Walker`].
///
/// [`Search::enumerate`] recurses, which is fast and cannot be paused, so
/// serving page `k` used to mean re-enumerating from result zero every time
/// and scrolling was quadratic. A cursor holds the walk's stack as data, so
/// the next page costs only its own length, and [`Search::cursor_at`] builds
/// the stack for an arbitrary position by unranking, so a jump costs O(depth).
///
/// The two walkers must agree exactly, and `tests/oracle.rs` and
/// `tests/golden.rs` hold them together: a cursor stream equals an enumerate
/// stream, and a cursor seeked to `i` continues with results `i, i+1, …`.
pub struct Cursor {
    frames: Vec<Frame>,
    /// Candidate indices chosen along the current path: one per frame below
    /// the root, plus one more while a result is being emitted.
    chosen: Vec<u32>,
    /// The buffer handed out by `next`: forced classes, then `chosen`'s classes.
    solution: Vec<u32>,
    forced_len: usize,
    /// `chosen` is a result that has not been emitted yet. Set by
    /// `cursor_at`, which lands exactly on a result.
    pending_emit: bool,
    /// The last call emitted; its final chosen index is still on the path
    /// and must be popped before the walk continues.
    pending_pop: bool,
    /// The forced words consumed every letter: emit the forced-only result
    /// once. The empty multiset has exactly one partition, the empty one.
    emit_empty: bool,
    /// Results emitted so far, which is also the index of the next result.
    position: u128,
    max_words: usize,
    node_budget: u64,
    pub stats: Stats,
    stopped: bool,
    done: bool,
}

impl Cursor {
    /// Index of the result the next call to `next` will produce.
    pub fn position(&self) -> u128 {
        self.position
    }

    /// The walk stopped at its node budget rather than at the end.
    pub fn truncated(&self) -> bool {
        self.stats.truncated
    }

    /// The walk ran out of results (as opposed to running out of budget).
    pub fn is_done(&self) -> bool {
        self.done
    }

    fn emit(&mut self, candidates: &Candidates) -> Option<&[u32]> {
        self.solution.truncate(self.forced_len);
        for &index in &self.chosen {
            self.solution.push(candidates.class[index as usize]);
        }
        self.position += 1;
        self.stats.emitted += 1;
        Some(&self.solution)
    }

    /// The next result as class indices, or `None` when the walk is over —
    /// check [`Cursor::truncated`] to learn which kind of over.
    pub fn next(&mut self, search: &Search) -> Option<&[u32]> {
        let candidates = &search.candidates;
        if self.done || self.stopped {
            return None;
        }
        if self.emit_empty {
            self.emit_empty = false;
            self.done = true;
            return self.emit(candidates);
        }
        if self.pending_emit {
            self.pending_emit = false;
            self.pending_pop = true;
            return self.emit(candidates);
        }
        if self.pending_pop {
            self.pending_pop = false;
            self.chosen.pop();
        }

        loop {
            let Some(top) = self.frames.last().copied() else {
                self.done = true;
                return None;
            };
            let letter = top.letter as usize;
            let bucket = &candidates.buckets[letter];
            let room = top.rem.total();
            let mut pos = top.pos as usize;
            let mut descended = false;

            while pos < bucket.len() {
                let index = bucket[pos];
                pos += 1;
                let slot = index as usize;

                // Candidates are ordered longest-first, so anything still too
                // long just gets skipped; the tail of the bucket is all short.
                if candidates.len[slot] as u32 > room {
                    continue;
                }
                self.stats.subset_tests += 1;
                let counts = candidates.counts[slot];
                if !counts.fits_in(top.rem) {
                    continue;
                }

                // Resume after this candidate whatever happens below.
                self.frames.last_mut().unwrap().pos = pos as u32;
                let next = top.rem.sub(counts);
                self.chosen.push(index);

                if next.is_empty() {
                    self.pending_pop = true;
                    return self.emit(candidates);
                }

                // Mirrors the check at the top of `Walker::run`: can another
                // word be added at all under `max_words`?
                let used = self.chosen.len() + self.forced_len;
                if self.max_words < UNLIMITED_WORDS as usize && used + 1 > self.max_words {
                    self.chosen.pop();
                    continue;
                }

                if next.get(letter) > 0 {
                    // The pivot letter survives: the run continues, and the
                    // index floor is this candidate, which sits at `pos - 1`.
                    self.frames.push(Frame { rem: next, letter: top.letter, pos: (pos - 1) as u32 });
                } else {
                    // Run boundary: a fresh pivot, mirroring `Walker::pivot`.
                    self.stats.nodes += 1;
                    if self.stats.nodes > self.node_budget {
                        self.stopped = true;
                        self.stats.truncated = true;
                        return None;
                    }
                    if !can_still_fit(candidates, next, used, self.max_words) {
                        self.chosen.pop();
                        continue;
                    }
                    let pivot = next.rarest().unwrap();
                    self.frames.push(Frame { rem: next, letter: pivot as u8, pos: 0 });
                }
                descended = true;
                break;
            }

            if descended {
                continue;
            }
            // This frame is exhausted; the candidate that opened it comes off
            // the path with it. The root opened nothing.
            self.frames.pop();
            if !self.frames.is_empty() {
                self.chosen.pop();
            }
        }
    }
}

// ----------------------------------------------------------------- counting

/// Memo key. When `max_words` is unbounded the depth component is constant, so
/// states are shared across the whole tree; when it is bounded, two states with
/// the same letters but different budgets genuinely have different counts.
type MemoKey = (Counts, u8);

struct Counter<'a> {
    candidates: &'a Candidates,
    memo: &'a mut Memo,
    unlimited: bool,
    saturated: bool,
    node_budget: u64,
    stats: Stats,
    stopped: bool,
}

impl Counter<'_> {
    #[inline]
    fn key(&self, rem: Counts, budget: u8) -> MemoKey {
        (rem, if self.unlimited { 0 } else { budget })
    }

    /// Spend one word of the budget.
    ///
    /// When `max_words` is unbounded the budget must stay pinned: the memo key
    /// drops the depth component in that mode, so a decrementing budget would
    /// let states computed at different depths share an entry — and a long
    /// input built from short words would be silently undercounted once the
    /// budget ran out.
    #[inline]
    fn spend(&self, budget: u8) -> u8 {
        if self.unlimited {
            budget
        } else {
            budget - 1
        }
    }

    fn pivot(&mut self, rem: Counts, budget: u8) -> u128 {
        if rem.is_empty() {
            return 1;
        }
        if budget == 0 || self.stopped {
            return 0;
        }

        let key = self.key(rem, budget);
        if let Some(&hit) = self.memo.table.get(&key) {
            self.memo.hits += 1;
            return hit;
        }

        self.stats.nodes += 1;
        if self.stats.nodes > self.node_budget {
            self.stopped = true;
            return 0;
        }

        if !self.unlimited {
            let longest = self.candidates.longest;
            if longest == 0 || rem.total().div_ceil(longest) > budget as u32 {
                self.memo.table.insert(key, 0);
                return 0;
            }
        }

        let letter = rem.rarest().unwrap();
        let total = self.run(rem, letter, 0, budget);
        // A run cut short by the node budget has only a partial total. Writing
        // it to the memo would poison every later lookup on this session —
        // `nth` walks the tree by subtree sizes, and a subtree recorded as
        // smaller than it is makes the walk land on the wrong result, silently.
        // So a stopped counter leaves the memo exactly as it found it.
        if !self.stopped {
            self.memo.table.insert(key, total);
        }
        total
    }

    fn run(&mut self, rem: Counts, letter: usize, min_index: u32, budget: u8) -> u128 {
        if budget == 0 {
            return 0;
        }
        let bucket = &self.candidates.buckets[letter];
        let start = bucket.partition_point(|&i| i < min_index);
        let room = rem.total();

        let mut total: u128 = 0;
        for position in start..bucket.len() {
            if self.stopped {
                break;
            }
            let index = bucket[position];
            let slot = index as usize;

            if self.candidates.len[slot] as u32 > room {
                continue;
            }
            self.stats.subset_tests += 1;
            let counts = self.candidates.counts[slot];
            if !counts.fits_in(rem) {
                continue;
            }

            let next = rem.sub(counts);
            let next_budget = self.spend(budget);
            let sub = if next.get(letter) > 0 {
                self.run(next, letter, index, next_budget)
            } else {
                self.pivot(next, next_budget)
            };

            total = match total.checked_add(sub) {
                Some(v) => v,
                None => {
                    self.saturated = true;
                    u128::MAX
                }
            };
        }
        total
    }

    // ------------------------------------------------------------ unranking

    fn unrank_pivot<F>(&mut self, rem: Counts, budget: u8, mut index: u128, push: &mut F) -> bool
    where
        F: FnMut(u32),
    {
        if rem.is_empty() {
            return index == 0;
        }
        if budget == 0 {
            return false;
        }
        let letter = rem.rarest().unwrap();
        self.unrank_run(rem, letter, 0, budget, &mut index, push)
    }

    fn unrank_run<F>(
        &mut self,
        rem: Counts,
        letter: usize,
        min_index: u32,
        budget: u8,
        index: &mut u128,
        push: &mut F,
    ) -> bool
    where
        F: FnMut(u32),
    {
        if budget == 0 {
            return false;
        }
        let bucket = self.candidates.buckets[letter].clone();
        let start = bucket.partition_point(|&i| i < min_index);
        let room = rem.total();

        for position in start..bucket.len() {
            let candidate = bucket[position];
            let slot = candidate as usize;
            if self.candidates.len[slot] as u32 > room {
                continue;
            }
            let counts = self.candidates.counts[slot];
            if !counts.fits_in(rem) {
                continue;
            }

            let next = rem.sub(counts);
            let stays = next.get(letter) > 0;
            let next_budget = self.spend(budget);
            let subtree = if stays {
                self.run(next, letter, candidate, next_budget)
            } else {
                self.pivot(next, next_budget)
            };

            if *index < subtree {
                push(self.candidates.class[slot]);
                return if stays {
                    self.unrank_run(next, letter, candidate, next_budget, index, push)
                } else {
                    self.unrank_pivot(next, next_budget, *index, push)
                };
            }
            *index -= subtree;
        }
        false
    }
    // -------------------------------------------------------------- seeking

    /// `unrank_pivot`, but recording the walk as cursor frames so it can be
    /// resumed from the result it lands on.
    fn seek_pivot(
        &mut self,
        rem: Counts,
        budget: u8,
        index: u128,
        frames: &mut Vec<Frame>,
        chosen: &mut Vec<u32>,
    ) -> bool {
        if rem.is_empty() {
            return index == 0;
        }
        if budget == 0 {
            return false;
        }
        let letter = rem.rarest().unwrap();
        frames.push(Frame { rem, letter: letter as u8, pos: 0 });
        self.seek_run(rem, letter, 0, budget, index, frames, chosen)
    }

    /// `unrank_run` with recording. `start` is a bucket *position*: 0 for a
    /// fresh pivot, or the position of the candidate that continued the run —
    /// the same set `partition_point` yields for that candidate's index.
    #[allow(clippy::too_many_arguments)]
    fn seek_run(
        &mut self,
        rem: Counts,
        letter: usize,
        start: usize,
        budget: u8,
        mut index: u128,
        frames: &mut Vec<Frame>,
        chosen: &mut Vec<u32>,
    ) -> bool {
        if budget == 0 {
            return false;
        }
        let bucket = self.candidates.buckets[letter].clone();
        let room = rem.total();

        for position in start..bucket.len() {
            let candidate = bucket[position];
            let slot = candidate as usize;
            if self.candidates.len[slot] as u32 > room {
                continue;
            }
            let counts = self.candidates.counts[slot];
            if !counts.fits_in(rem) {
                continue;
            }

            let next = rem.sub(counts);
            let stays = next.get(letter) > 0;
            let next_budget = self.spend(budget);
            let subtree = if stays {
                self.run(next, letter, candidate, next_budget)
            } else {
                self.pivot(next, next_budget)
            };

            if index < subtree {
                frames.last_mut().expect("a run has a frame").pos = (position + 1) as u32;
                chosen.push(candidate);
                return if stays {
                    frames.push(Frame { rem: next, letter: letter as u8, pos: position as u32 });
                    self.seek_run(next, letter, position, next_budget, index, frames, chosen)
                } else {
                    self.seek_pivot(next, next_budget, index, frames, chosen)
                };
            }
            index -= subtree;
        }
        false
    }
}
