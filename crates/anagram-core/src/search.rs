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
}

impl std::fmt::Display for SolveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolveError::UnknownWord(w) => write!(f, "{w:?} is not in this dictionary tier"),
            SolveError::NotASubset(w) => write!(f, "{w:?} does not fit in the input letters"),
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
        let mut remaining = Counts::from_word(&normalized).unwrap_or(Counts::EMPTY);

        let mut forced = Forced {
            classes: Vec::new(),
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
            remaining = remaining.sub(counts);
            forced.counts = forced.counts.add(counts);
            forced.classes.push(class as u32);
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
    pub fn spell(&self, dict: &Dict, classes: &[u32], tier: Tier) -> Vec<String> {
        classes
            .iter()
            .map(|&c| {
                dict.class_words(c as usize, tier)
                    .next()
                    .map(|w| dict.word(w).to_owned())
                    .unwrap_or_default()
            })
            .collect()
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

    /// Cheap admissibility check against `max_words`: even using the longest
    /// candidate every time, can the rest still be covered in budget?
    fn can_still_fit(&self, rem: Counts) -> bool {
        if self.max_words >= UNLIMITED_WORDS as usize {
            return true;
        }
        if self.candidates.longest == 0 {
            return false;
        }
        let needed = rem.total().div_ceil(self.candidates.longest) as usize;
        self.stack.len() + self.forced_len + needed <= self.max_words
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
}
