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
//!
//! # The text is never its own result
//!
//! A result is a multiset of classes, shown with one spelling per class, so
//! when the text's own words are dictionary words the text is one of its own
//! results: "below" led its list and hid `elbow` behind it. The rule is that
//! the text itself, its words in any order, is never a result, while the same
//! letters spaced differently (`applesauce` for "apple sauce") are.
//!
//! Only one row can ever display as the text: the class multiset of its words.
//! When that row can be spelled another way, [`Search::spell`] spells it that
//! way and nothing else changes. When it cannot, the row is dropped, and then
//! every view of the result set has to agree that it is gone.
//!
//! They agree through the **canonical path**, the candidate indices the walk
//! chooses on its way to a result. It is a function of the multiset alone (the
//! rarest letter, then every word of the row holding it in ascending index,
//! then the next rarest), so the dropped row's path is known without searching.
//! And canonical order *is* lexicographic order on paths: two results share a
//! prefix, reach the same state, and part ways inside one bucket, which is
//! scanned in ascending index. So the walkers skip the row by comparing paths
//! at emission, and unranking learns whether an index lies before or after
//! the row by comparing the path it landed on, with no count involved. That
//! matters because a count that stopped at its budget cannot say what index
//! the row had, and the list, "Go to" and "Surprise me" must still skip it.
//! The memo holds raw subtree totals throughout; the one subtraction happens
//! where a total leaves [`Search::count`].
//!
//! # The pool and the classes
//!
//! The text is a pool of characters (`counts.rs`): letters, and its digits
//! and symbols, which take the six slots past z for this query. A candidate is
//! a dictionary class in scope (its tier, or a term class of the mask that
//! spells it), a term with a digit or symbol that fits (counted through the
//! query's slots), or a numeral generated from the pool's digits when that
//! class is on. The last two have no place in the dictionary's class list, so
//! they take **virtual class indices** from `dict.classes.len()` up, in the
//! order they were made; their spellings are pseudo word indices with the
//! high bit set. With words alone the pool's digits and symbols are covered
//! by nothing, the rarest slot at the root is one of them, and the search
//! dies at once: [`Search::uncovered`] says which, so the page can.

use crate::classes::{Class, ClassMask};
use crate::counts::{Counts, PoolError, Slots, SLOTS};
use crate::dict::{Dict, Scope, Tier};
use std::collections::{HashMap, HashSet};

/// The high bit of a spelling index marks a virtual candidate's one spelling.
const VIRTUAL: u32 = 1 << 31;

/// The most numerals one query may generate from its digits.
pub const NUMERAL_CAP: usize = 4_096;

/// `max_words` at or above this is treated as unbounded, which lets the
/// counting memo key on the letter state alone.
pub const UNLIMITED_WORDS: u8 = 64;

#[derive(Clone, Debug)]
pub struct SolveOptions {
    pub tier: Tier,
    /// The term classes admitted beside the tier (`classes.rs`), one bit
    /// each; 0 is words alone, today's search.
    pub classes: ClassMask,
    /// Words shorter than this are excluded from the vocabulary entirely.
    pub min_word_len: u8,
    /// Words shorter than `min_word_len` that are admitted anyway, such as
    /// "a", "to" and "no". `None` leaves the vocabulary exactly as
    /// `min_word_len` alone defines it.
    pub short_words: Option<Vec<String>>,
    /// Cap on how many words a solution may use.
    pub max_words: u8,
    /// Words that must appear in every result.
    pub must_include: Vec<String>,
    /// Spellings taken out of the vocabulary for this query alone. A class whose
    /// every spelling is excluded is dropped; a class with other spellings keeps
    /// them and never shows an excluded one. Since the search runs on classes,
    /// every count stays exact. A word the dictionary does not carry excludes
    /// nothing.
    pub exclude: Vec<String>,
    /// Stop after this many results. 0 means "no cap".
    pub limit: usize,
    /// Abort after this many DFS nodes, so a pathological query cannot hang.
    pub max_nodes: u64,
}

impl Default for SolveOptions {
    fn default() -> Self {
        SolveOptions {
            tier: Tier::Standard,
            classes: 0,
            min_word_len: 2,
            short_words: None,
            max_words: UNLIMITED_WORDS,
            must_include: Vec::new(),
            exclude: Vec::new(),
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
    /// One character occurs more than 127 times, which is more than a count
    /// byte can hold. Carries the offending character.
    TooManyRepeats(char),
    /// More than six distinct digits and symbols, which is more than the pool
    /// has slots for.
    TooManyCharacters,
    /// The pool's digits would make more numerals than [`NUMERAL_CAP`].
    TooManyNumerals,
    /// A word is both in `must_include` and in `exclude`.
    IncludedAndExcluded(String),
}

impl std::fmt::Display for SolveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolveError::UnknownWord(w) => write!(f, "{w:?} is not in this dictionary tier"),
            SolveError::NotASubset(w) => write!(f, "{w:?} does not fit in the input letters"),
            SolveError::TooManyRepeats(c) => write!(f, "{c:?} appears more than 127 times"),
            SolveError::TooManyCharacters => write!(f, "more than six different digits and symbols"),
            SolveError::TooManyNumerals => write!(f, "the digits make more than {NUMERAL_CAP} numerals"),
            SolveError::IncludedAndExcluded(w) => write!(f, "{w:?} is both included and excluded"),
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

/// What became of the text's own row in this query.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TextRow {
    /// The text's words are not a result here: one of them is not a word of
    /// this query, there are more of them than the word cap allows, or the
    /// row lacks a word every result must include.
    None,
    /// The row is a result and already shows other words than the text's,
    /// as "apple sauce" shows `cause apple`.
    Shown,
    /// The row would have shown the text, so one word takes its next
    /// commonest spelling: "below" shows `elbow`.
    Respelled,
    /// The row can only be spelled as the text, so it is not a result. The
    /// count is one fewer than the letters alone would give.
    Dropped,
}

enum Fate {
    Shown,
    /// Show `word` in the last free slot holding `class`.
    Respelled { class: u32, word: u32 },
    Dropped,
}

/// The one row that could display as the text: the classes of its words.
struct OwnRow {
    /// The row's free part (everything but the forced classes) as candidate
    /// indices, in the order the walk chooses them.
    path: Vec<u32>,
    /// Every class of the row, forced ones included, sorted: what `spell`
    /// compares a result with.
    classes: Vec<u32>,
    /// The text's words as word indices, sorted.
    words: Vec<u32>,
    fate: Fate,
}

impl OwnRow {
    /// The text's own row under this query, or `None` when the text's words
    /// are not one of its results: a word outside the tier or excluded (an
    /// excluded spelling is never shown, so the text cannot appear), more
    /// words than the cap, a forced class the row lacks (every result holds
    /// them all), or a class the query does not search with.
    fn find(
        dict: &Dict,
        input: &str,
        options: &SolveOptions,
        forced: &Forced,
        excluded: &HashSet<u32>,
        candidates: &Candidates,
        remaining: Counts,
    ) -> Option<OwnRow> {
        let tokens = crate::counts::text_words(input);
        if tokens.is_empty() || tokens.len() > options.max_words as usize {
            return None;
        }
        let scope = Scope { tier: options.tier, classes: options.classes };

        let mut words = Vec::with_capacity(tokens.len());
        let mut classes = Vec::with_capacity(tokens.len());
        for token in &tokens {
            // A word of the dictionary in scope, or one of this query's own
            // terms: a numeral made of the text's digits, a term with a symbol.
            let (class, word) = match dict.find_class(token, scope) {
                Some(class) => (class as u32, dict.index_of(token)?),
                None => {
                    let k = candidates.virtuals.iter().position(|v| v.text == *token)?;
                    ((candidates.dict_classes + k) as u32, VIRTUAL | k as u32)
                }
            };
            if excluded.contains(&word) {
                return None;
            }
            words.push(word);
            classes.push(class);
        }

        // The free part: the row less one occurrence of each forced class.
        let mut free = classes.clone();
        for class in &forced.classes {
            let at = free.iter().position(|c| c == class)?;
            free.swap_remove(at);
        }
        let members: Vec<u32> = free
            .iter()
            .map(|&class| candidates.index_of_class(class))
            .collect::<Option<_>>()?;
        let path = candidates.canonical_path(remaining, &members)?;

        // What the row shows by default: the forced words as typed, and each
        // free class's commonest spelling this query allows.
        let allowed = |class: u32| candidates.spellings(dict, class, scope).filter(|w| !excluded.contains(w));
        let mut shown = forced.words.clone();
        for &class in &free {
            shown.push(allowed(class).next()?);
        }
        shown.sort_unstable();
        words.sort_unstable();
        classes.sort_unstable();

        let fate = if shown != words {
            Fate::Shown
        } else {
            // Changing one slot always makes the row differ from the text, so
            // one is changed: to the commonest replacement any free class
            // offers, ties A to Z. A class's spellings come commonest first,
            // so its candidate is its second.
            let mut best: Option<(u32, u32)> = None;
            for &class in &free {
                let Some(word) = allowed(class).nth(1) else { continue };
                let better = best.is_none_or(|(_, held)| {
                    let (new, old) = (dict.zipf[word as usize], dict.zipf[held as usize]);
                    new > old || (new == old && dict.word(word) < dict.word(held))
                });
                if better {
                    best = Some((class, word));
                }
            }
            match best {
                Some((class, word)) => Fate::Respelled { class, word },
                None => Fate::Dropped,
            }
        };

        Some(OwnRow { path, classes, words, fate })
    }
}

/// A candidate the dictionary's class list does not hold: a term with a digit
/// or symbol that fits this query's pool, or a numeral made of its digits.
pub struct Virtual {
    pub text: String,
    pub counts: Counts,
    pub class: Class,
}

/// Per-query candidate set: the classes that could possibly appear, plus an
/// index from slot to the candidates containing it.
pub struct Candidates {
    counts: Vec<Counts>,
    len: Vec<u8>,
    /// The class index of each candidate: the dictionary's, or a virtual one
    /// from `dict_classes` up. Ascending.
    class: Vec<u32>,
    buckets: [Vec<u32>; SLOTS],
    longest: u32,
    /// `dict.classes.len()`: where the virtual class indices begin.
    dict_classes: usize,
    /// This query's own candidates, virtual class `dict_classes + k`.
    virtuals: Vec<Virtual>,
    /// Dictionary classes below `min_word_len` that only a term of the mask
    /// let in (`ta` beside `at`), ascending: their words are still under the
    /// length rule, so only their terms of the mask are shown. Usually empty.
    terms_only: Vec<u32>,
}

impl Candidates {
    pub fn len(&self) -> usize {
        self.class.len()
    }

    pub fn is_empty(&self) -> bool {
        self.class.is_empty()
    }

    /// The spellings of a class this query may show, in the order `spell`
    /// prefers them: a dictionary class's words and terms in scope, or a
    /// virtual class's one text as a pseudo index. A class that only a term
    /// of the mask let in below `min_word_len` shows its terms alone: the
    /// length rule still governs its words (`kiln ta`, never `at kiln`).
    fn spellings<'a>(&'a self, dict: &'a Dict, class: u32, scope: Scope) -> Box<dyn Iterator<Item = u32> + 'a> {
        match (class as usize).checked_sub(self.dict_classes) {
            None if self.terms_only.binary_search(&class).is_ok() => {
                Box::new(dict.class_words(class as usize, scope).filter(|&w| dict.is_term(w)))
            }
            None => Box::new(dict.class_words(class as usize, scope)),
            Some(k) => Box::new(std::iter::once(VIRTUAL | k as u32)),
        }
    }

    /// The text of a spelling index: a word or term of the dictionary, or a
    /// virtual candidate's own.
    fn text<'a>(&'a self, dict: &'a Dict, spelling: u32) -> &'a str {
        if spelling & VIRTUAL != 0 {
            &self.virtuals[(spelling & !VIRTUAL) as usize].text
        } else {
            dict.word(spelling)
        }
    }

    /// The class a spelling belongs to, or `None` for a word of the dictionary.
    fn class_of_spelling(&self, dict: &Dict, spelling: u32, scope: Scope) -> Option<Class> {
        if spelling & VIRTUAL != 0 {
            return Some(self.virtuals[(spelling & !VIRTUAL) as usize].class);
        }
        let bits = dict.term_bits(spelling);
        if bits == 0 {
            return None;
        }
        Class::first_in(bits & scope.classes).or_else(|| Class::first_in(bits))
    }

    /// Sweep the dictionary once, keeping classes that fit inside `target`.
    ///
    /// Candidate order is inherited from the dictionary's class order (longest
    /// first, then most common). That order is the canonicalization key for the
    /// run rule, and it also means the first results streamed to the UI are
    /// built from big, recognizable words rather than piles of two-letter ones.
    ///
    /// A class below `min_word_len` survives only when `short_words` names one
    /// of its spellings, and that spelling is in the query's tier. The list is
    /// resolved to class indices up front: `find_class` is a hash probe, and
    /// the sweep visits every class in the dictionary.
    ///
    /// A class none of whose spellings in scope survive `excluded` (word
    /// indices) is left out, so it is as if the dictionary never had it.
    ///
    /// The length rule is for words: a class below `min_word_len` stays when
    /// `short_words` names it or a term class of the mask spells it (`u`, `2`),
    /// since a term is governed by its class. A class kept by a term alone is
    /// marked `terms_only`, so its words, which the rule still excludes, are
    /// never shown for it (`ta` beside `at` at a minimum of 3 spells `ta`). After the dictionary's classes
    /// come this query's own: the terms with a digit or symbol that fit,
    /// counted through `slots`, and, with the numerals class on, every
    /// numeral the pool's digits make, each written in the text's own digit
    /// order (`182` gives `182`, `82`, `12`, `18`, `1`, `8`, `2`).
    pub fn build(
        dict: &Dict,
        target: Counts,
        options: &SolveOptions,
        excluded: &HashSet<u32>,
        slots: &Slots,
        pool: &str,
    ) -> Result<Candidates, SolveError> {
        let mut counts = Vec::new();
        let mut len = Vec::new();
        let mut class = Vec::new();
        let scope = Scope { tier: options.tier, classes: options.classes };

        let admitted: HashSet<u32> = options
            .short_words
            .as_deref()
            .unwrap_or_default()
            .iter()
            .filter_map(|word| dict.find_class(&crate::counts::normalize(word), scope))
            .map(|index| index as u32)
            .collect();

        let mut terms_only = Vec::new();
        for (index, sig) in dict.classes.iter().enumerate() {
            // Under the length rule and not on the allowlist: in only through a term of the mask, and then by its terms alone.
            let by_term_only = sig.len < options.min_word_len && !admitted.contains(&(index as u32));
            if by_term_only && sig.term_bits & options.classes == 0 {
                continue;
            }
            if !sig.counts.fits_in(target) {
                continue;
            }
            if !dict.class_in_scope(index, scope) {
                continue;
            }
            // Checked last, and only for a query that excludes anything: every
            // class that reaches here fits the letters, which is few of them.
            // A class in by its terms alone is out once every such term is excluded.
            if !excluded.is_empty()
                && dict.class_words(index, scope).all(|w| excluded.contains(&w) || (by_term_only && !dict.is_term(w)))
            {
                continue;
            }
            counts.push(sig.counts);
            len.push(sig.len);
            class.push(index as u32);
            if by_term_only {
                terms_only.push(index as u32);
            }
        }

        let dict_classes = dict.classes.len();
        let mut virtuals: Vec<Virtual> = Vec::new();
        if options.classes != 0 {
            for term in &dict.extra_terms {
                let bits = dict.term_bits(term.index);
                if bits & options.classes == 0 || excluded.contains(&term.index) {
                    continue;
                }
                let Some(c) = dict.term_counts_in(term.index, slots) else { continue };
                if !c.fits_in(target) {
                    continue;
                }
                let class = Class::first_in(bits & options.classes).expect("a bit of the mask");
                virtuals.push(Virtual { text: dict.word(term.index).to_owned(), counts: c, class });
            }
            if options.classes & Class::Numerals.bit() != 0 {
                for text in numerals(pool, target, slots)? {
                    let c = Counts::in_slots(&text, slots).expect("a numeral's digits have slots");
                    virtuals.push(Virtual { text, counts: c, class: Class::Numerals });
                }
            }
        }
        for (k, v) in virtuals.iter().enumerate() {
            counts.push(v.counts);
            len.push(v.counts.total() as u8);
            class.push((dict_classes + k) as u32);
        }

        let mut buckets: [Vec<u32>; SLOTS] = std::array::from_fn(|_| Vec::new());
        for (i, c) in counts.iter().enumerate() {
            for slot in 0..SLOTS {
                if c.get(slot) != 0 {
                    buckets[slot].push(i as u32);
                }
            }
        }

        let longest = len.iter().copied().max().unwrap_or(0) as u32;
        Ok(Candidates {
            counts,
            len,
            class,
            buckets,
            longest,
            dict_classes,
            virtuals,
            terms_only,
        })
    }

    /// The pool's digits and symbols that no candidate contains, in slot
    /// order: with words alone, every one of them.
    fn uncovered(&self, target: Counts, slots: &Slots) -> String {
        let mut out = String::new();
        for (i, &c) in slots.chars().iter().enumerate() {
            let slot = crate::counts::LETTERS + i;
            if target.get(slot) != 0 && self.buckets[slot].is_empty() {
                out.push(c);
            }
        }
        out
    }

    /// The candidate standing for a dictionary class, if it is one. Candidates
    /// keep the dictionary's class order, so this is a binary search, and so
    /// comparing two candidate indices is comparing their classes.
    fn index_of_class(&self, class: u32) -> Option<u32> {
        self.class.binary_search(&class).ok().map(|i| i as u32)
    }

    /// The order the walk chooses `members` in, when they partition `rem`
    /// exactly: the rarest letter left, every member holding it in ascending
    /// index (one run), then the next rarest. `None` when they do not
    /// partition `rem`. See the module docs: a result has exactly one path.
    fn canonical_path(&self, mut rem: Counts, members: &[u32]) -> Option<Vec<u32>> {
        let mut left = members.to_vec();
        left.sort_unstable();
        let mut path = Vec::with_capacity(left.len());
        while let Some(letter) = rem.rarest() {
            let (run, rest): (Vec<u32>, Vec<u32>) =
                left.iter().partition(|&&i| self.counts[i as usize].get(letter) != 0);
            if run.is_empty() {
                return None;
            }
            for index in run {
                let counts = self.counts[index as usize];
                if !counts.fits_in(rem) {
                    return None;
                }
                rem = rem.sub(counts);
                path.push(index);
            }
            left = rest;
        }
        left.is_empty().then_some(path)
    }
}

/// Every numeral the pool's digits make: each non-empty sub-multiset of the
/// digits of `target`, written in the order the text has its digits (`pool`
/// is the text's pool string), in the odometer's order over the distinct
/// digits, so the list is a deterministic function of the text.
fn numerals(pool: &str, target: Counts, slots: &Slots) -> Result<Vec<String>, SolveError> {
    // The distinct digits in slot order, each with how many the pool has left.
    let digits: Vec<(char, u8)> = slots
        .chars()
        .iter()
        .enumerate()
        .filter(|(_, c)| c.is_ascii_digit())
        .map(|(i, &c)| (c, target.get(crate::counts::LETTERS + i)))
        .filter(|&(_, n)| n > 0)
        .collect();
    if digits.is_empty() {
        return Ok(Vec::new());
    }
    let total: usize = digits.iter().map(|&(_, n)| n as usize + 1).product::<usize>() - 1;
    if total > NUMERAL_CAP {
        return Err(SolveError::TooManyNumerals);
    }
    // The text's digits in their own order, the source of every spelling.
    let sequence: Vec<char> = pool.chars().filter(char::is_ascii_digit).collect();
    let mut take: Vec<u8> = vec![0; digits.len()];
    let mut out = Vec::with_capacity(total);
    loop {
        // Odometer over the per-digit counts.
        let mut i = 0;
        while i < take.len() {
            if take[i] < digits[i].1 {
                take[i] += 1;
                break;
            }
            take[i] = 0;
            i += 1;
        }
        if i == take.len() {
            break;
        }
        let mut left = take.clone();
        let mut text = String::new();
        for &d in &sequence {
            let at = digits.iter().position(|&(c, _)| c == d).expect("a digit of the pool");
            if left[at] > 0 {
                left[at] -= 1;
                text.push(d);
            }
        }
        out.push(text);
    }
    Ok(out)
}

/// Default ceiling on memo entries during a count. Each entry is roughly 80
/// bytes with hash-table overhead, so this is about 320 MB — a long way past
/// what any interactive query needs (a 26-letter phrase counts its 18 billion
/// answers in ~140k entries) and a long way short of what a 35-letter pangram
/// would consume if let run: it fills 3 million entries in about a minute
/// natively and would run for hours toward gigabytes. A capped count reports
/// a floor, like a count cut off by the node budget.
pub const DEFAULT_MEMO_CAP: usize = 4_000_000;

/// Reusable memo for counting and unranking.
///
/// Kept outside [`Search`] and owned by the caller so a session can count once
/// and then serve many `nth` lookups without rebuilding the table — which is
/// what makes deep pagination cheap.
pub struct Memo {
    table: HashMap<MemoKey, u128>,
    hits: u64,
    /// Ceiling on `table.len()` while counting. Unranking is not held to it:
    /// a seek adds at most O(depth × bucket) entries on top of what the count
    /// already built, and refusing it would just make "Go to" fail.
    cap: usize,
}

impl Default for Memo {
    fn default() -> Memo {
        Memo::with_cap(DEFAULT_MEMO_CAP)
    }
}

impl Memo {
    pub fn new() -> Memo {
        Memo::default()
    }

    /// A memo that stops a count once it holds `cap` entries.
    pub fn with_cap(cap: usize) -> Memo {
        Memo {
            table: HashMap::new(),
            hits: 0,
            cap,
        }
    }

    pub fn cap(&self) -> usize {
        self.cap
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
    /// Word indices `exclude` took out of the vocabulary for this query.
    excluded: HashSet<u32>,
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
    /// A digit or symbol of the pool that no candidate contains: no result can
    /// cover it, so the query has none, and the walkers say so without a walk.
    /// The pivot would find it within a level or two anyway; this saves the
    /// levels, and says why.
    dead: bool,
    /// The text's own row, when the text's words are a result of this query.
    own: Option<OwnRow>,
    /// Which of the six slots past z holds which of the text's digits and symbols.
    slots: Slots,
    /// The pool's digits and symbols no candidate contains, in slot order.
    uncovered: String,
}

impl Search {
    pub fn prepare(
        dict: &Dict,
        input: &str,
        options: SolveOptions,
    ) -> Result<Search, SolveError> {
        let normalized = crate::counts::normalize(input);
        let empty_input = normalized.is_empty();
        let scope = Scope { tier: options.tier, classes: options.classes };
        // `normalized` is the pool by construction, so this fails only on a
        // character past the 127-per-slot ceiling of a count byte, or on more
        // distinct digits and symbols than the six slots hold. Either used to
        // fall back to an empty multiset, whose one partition is the empty one:
        // "1 anagram", and a blank row. It is an error, and it says which.
        let mut slots = Slots::new();
        let mut remaining = match Counts::from_pool(&normalized, &mut slots) {
            Ok(counts) => counts,
            Err(PoolError::TooManyRepeats(c)) => return Err(SolveError::TooManyRepeats(c)),
            Err(PoolError::TooManyCharacters) => return Err(SolveError::TooManyCharacters),
            Err(PoolError::NotPool(c)) => unreachable!("normalize emitted {c:?}"),
        };

        let excluded: HashSet<u32> = options
            .exclude
            .iter()
            .filter_map(|word| dict.index_of(&crate::counts::normalize(word)))
            .collect();

        let mut forced = Forced {
            classes: Vec::new(),
            words: Vec::new(),
            counts: Counts::EMPTY,
        };

        for word in &options.must_include {
            let word = crate::counts::normalize(word);
            if dict.index_of(&word).is_some_and(|i| excluded.contains(&i)) {
                return Err(SolveError::IncludedAndExcluded(word));
            }
            // A word of the dictionary, or a term of letters alone in a class
            // of the mask. A term with a digit or symbol, and a numeral, have
            // no class of the dictionary's and cannot be pinned yet.
            let class = dict
                .find_class(&word, scope)
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

        let candidates = Candidates::build(dict, remaining, &options, &excluded, &slots, &normalized)?;
        let own = OwnRow::find(dict, input, &options, &forced, &excluded, &candidates, remaining);
        let uncovered = candidates.uncovered(remaining, &slots);
        let dead = !uncovered.is_empty();

        Ok(Search {
            candidates,
            forced,
            excluded,
            remaining,
            options,
            empty_input,
            dead,
            own,
            slots,
            uncovered,
        })
    }

    /// The tier and the classes this query searches.
    pub fn scope(&self) -> Scope {
        Scope { tier: self.options.tier, classes: self.options.classes }
    }

    /// The slots the pool's digits and symbols took for this query.
    pub fn slots(&self) -> &Slots {
        &self.slots
    }

    /// The pool's digits and symbols that no candidate of this query
    /// contains, in slot order: what the count is zero for the lack of. With
    /// words alone and "Blink-182" it is `182`; empty for a text of letters.
    pub fn uncovered(&self) -> &str {
        &self.uncovered
    }

    /// What became of the text's own row: see [`TextRow`].
    pub fn text_row(&self) -> TextRow {
        match self.own.as_ref().map(|own| &own.fate) {
            None => TextRow::None,
            Some(Fate::Shown) => TextRow::Shown,
            Some(Fate::Respelled { .. }) => TextRow::Respelled,
            Some(Fate::Dropped) => TextRow::Dropped,
        }
    }

    /// Whether `words` (word indices, any order) are the text's own words. A
    /// caller that spells results its own way, as the batch does with every
    /// spelling of a row, asks this to leave the text out.
    pub fn is_text(&self, words: &[u32]) -> bool {
        self.own.as_ref().is_some_and(|own| {
            if words.len() != own.words.len() {
                return false;
            }
            let mut sorted = words.to_vec();
            sorted.sort_unstable();
            sorted == own.words
        })
    }

    /// The dropped row's path, when this query dropped its row.
    fn dropped(&self) -> Option<&[u32]> {
        match &self.own {
            Some(OwnRow { path, fate: Fate::Dropped, .. }) => Some(path),
            _ => None,
        }
    }

    /// Whether a walk that has chosen `path` stands on the dropped row.
    #[inline]
    fn skips(&self, path: &[u32]) -> bool {
        self.dropped().is_some_and(|own| own == path)
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
            skip: self.dropped(),
        };

        if self.empty_input || self.dead || self.forced.classes.len() > walker.max_words {
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
    ///
    /// When the query dropped the text's own row the figure is one fewer than
    /// the tree holds. That is exact for a finished count. For one that stopped
    /// at its budget it keeps the floor honest: the partial sum may or may not
    /// have reached the row, and only one fewer is certain either way.
    pub fn count(&self, memo: &mut Memo, node_budget: u64) -> (u128, bool, Stats) {
        let unlimited = self.options.max_words >= UNLIMITED_WORDS;
        let budget_left = self
            .options
            .max_words
            .saturating_sub(self.forced.classes.len() as u8);

        let memo_cap = memo.cap;
        let mut counter = Counter {
            candidates: &self.candidates,
            memo,
            unlimited,
            saturated: false,
            node_budget,
            memo_cap,
            stats: Stats {
                candidates: self.candidates.len(),
                ..Stats::default()
            },
            stopped: false,
        };

        if self.empty_input || self.dead || (self.forced.classes.len() as u8) > self.options.max_words {
            return (0, false, counter.stats);
        }

        let raw = counter.pivot(self.remaining, budget_left);
        let saturated = counter.saturated;
        let stopped = counter.stopped;
        let mut stats = counter.stats;
        stats.memo_entries = memo.table.len();
        stats.memo_hits = memo.hits;
        stats.truncated = stopped;
        let total = if self.dropped().is_some() && !saturated { raw.saturating_sub(1) } else { raw };
        (total, saturated, stats)
    }

    /// The `index`-th solution in canonical order, without enumerating the ones
    /// before it.
    ///
    /// Because [`Search::count`] gives exact subtree sizes, the search tree can
    /// be walked directly to a position: at each branch, subtract subtree counts
    /// until the index falls inside one. That makes deep pagination and
    /// "surprise me" O(depth × bucket) instead of O(index).
    ///
    /// When the query dropped the text's own row, every index at or past the
    /// row's place means the result one further along the tree. Which side an
    /// index falls on is read off the path it unranks to, so this needs no
    /// finished count and costs at most a second unranking.
    pub fn nth(&self, memo: &mut Memo, index: u128) -> Option<Vec<u32>> {
        if self.empty_input || self.dead || self.forced.classes.len() > self.options.max_words as usize {
            return None;
        }
        let mut path = self.unrank(memo, index)?;
        if self.dropped().is_some_and(|own| path.as_slice() >= own) {
            path = self.unrank(memo, index.checked_add(1)?)?;
        }
        let mut out = self.forced.classes.clone();
        out.extend(path.iter().map(|&i| self.candidates.class[i as usize]));
        Some(out)
    }

    /// A counter over this query's tree with no budget: unranking and seeking
    /// add at most O(depth × bucket) entries to what a count already built.
    fn counter<'a>(&'a self, memo: &'a mut Memo, node_budget: u64) -> Counter<'a> {
        Counter {
            candidates: &self.candidates,
            memo,
            unlimited: self.options.max_words >= UNLIMITED_WORDS,
            saturated: false,
            node_budget,
            memo_cap: usize::MAX,
            stats: Stats::default(),
            stopped: false,
        }
    }

    /// Words a result may still use once the forced ones are placed.
    fn budget_left(&self) -> u8 {
        self.options.max_words.saturating_sub(self.forced.classes.len() as u8)
    }

    /// The path of the tree's `index`-th result, the dropped row included.
    fn unrank(&self, memo: &mut Memo, index: u128) -> Option<Vec<u32>> {
        let mut path = Vec::new();
        let found = self
            .counter(memo, u64::MAX)
            .unrank_pivot(self.remaining, self.budget_left(), index, &mut |candidate| path.push(candidate));
        found.then_some(path)
    }

    /// The index of a result in canonical order: the inverse of [`Search::nth`].
    ///
    /// `classes` are the result's classes in any order, the forced ones among
    /// them. `None` when they are not a result of this query (the text's own
    /// row, once dropped, is not one), or when `node_budget` ran out first.
    ///
    /// The walk follows the result's canonical path and, at each step, adds
    /// the subtree totals of every candidate the scan would have tried before
    /// the one chosen: the same totals [`Search::nth`] subtracts, so the cost
    /// is the same, O(depth × bucket) memo hits after a finished count. After
    /// a count that stopped early those totals are not in the memo and have to
    /// be counted, which is what the budget is for; a stopped counter writes
    /// nothing, so the memo is never poisoned. Nothing in the engine waits on
    /// this: skipping the dropped row compares paths instead.
    pub fn rank(&self, memo: &mut Memo, classes: &[u32], node_budget: u64) -> Option<u128> {
        if self.empty_input || self.dead || classes.len() > self.options.max_words as usize {
            return None;
        }
        let mut free = classes.to_vec();
        for class in &self.forced.classes {
            let at = free.iter().position(|c| c == class)?;
            free.swap_remove(at);
        }
        let members: Vec<u32> = free
            .iter()
            .map(|&class| self.candidates.index_of_class(class))
            .collect::<Option<_>>()?;
        let path = self.candidates.canonical_path(self.remaining, &members)?;

        let own = self.dropped();
        if own == Some(path.as_slice()) {
            return None;
        }
        let raw = self
            .counter(memo, node_budget)
            .rank_path(self.remaining, self.budget_left(), &path)?;
        // The dropped row sat before this one, so everything after it moved up.
        Some(if own.is_some_and(|own| own < path.as_slice()) { raw - 1 } else { raw })
    }

    /// Resolve class indices to concrete words, best spelling first.
    ///
    /// Forced words occupy the first slots of every solution, and those are
    /// spelled exactly as the caller wrote them; the rest take the commonest
    /// spelling in scope. The one exception is the text's own row when that
    /// spelling would be the text: one free slot takes its next spelling, so
    /// "below" reads `elbow` (see [`TextRow::Respelled`]).
    pub fn spell(&self, dict: &Dict, classes: &[u32]) -> Vec<String> {
        self.spell_indices(dict, classes).iter().map(|&w| self.word(dict, w).to_owned()).collect()
    }

    /// [`Search::spell`] as spelling indices: a word or term of the
    /// dictionary, or a virtual candidate's pseudo index (see [`Search::word`]).
    pub fn spell_indices(&self, dict: &Dict, classes: &[u32]) -> Vec<u32> {
        let mut words = self.spell_commonest(dict, classes);
        if let Some(OwnRow { classes: own, fate: Fate::Respelled { class, word }, .. }) = &self.own {
            if classes.len() == own.len() {
                let mut sorted = classes.to_vec();
                sorted.sort_unstable();
                // The last free slot holding the class; forced slots come first.
                let slot = (self.forced.words.len()..classes.len()).rev().find(|&s| classes[s] == *class);
                if let (true, Some(slot)) = (sorted == *own, slot) {
                    words[slot] = *word;
                }
            }
        }
        words
    }

    fn spell_commonest(&self, dict: &Dict, classes: &[u32]) -> Vec<u32> {
        classes
            .iter()
            .enumerate()
            .map(|(slot, &c)| {
                if let Some(&word) = self.forced.words.get(slot) {
                    if self.forced.classes[slot] == c {
                        return word;
                    }
                }
                self.spellings(dict, c).next().unwrap_or(u32::MAX)
            })
            .collect()
    }

    /// The spellings of `class` this query may show, commonest first, the
    /// excluded ones left out: word indices, or a virtual class's pseudo index.
    pub fn spellings<'a>(&'a self, dict: &'a Dict, class: u32) -> impl Iterator<Item = u32> + 'a {
        self.candidates.spellings(dict, class, self.scope()).filter(move |w| !self.excluded.contains(w))
    }

    /// The text of a spelling index from [`Search::spell_indices`] or
    /// [`Search::spellings`]: a word or term of the dictionary, or a virtual
    /// candidate's own text. `u32::MAX` (no spelling) is the empty string.
    pub fn word<'a>(&'a self, dict: &'a Dict, spelling: u32) -> &'a str {
        if spelling == u32::MAX {
            ""
        } else {
            self.candidates.text(dict, spelling)
        }
    }

    /// The class a spelling belongs to: `None` for a word of the dictionary,
    /// else the term's first class in table order among those the query
    /// admits (a numeral is `Numerals`; a leet reading is the caller's).
    pub fn class_of(&self, dict: &Dict, spelling: u32) -> Option<Class> {
        if spelling == u32::MAX {
            return None;
        }
        self.candidates.class_of_spelling(dict, spelling, self.scope())
    }

    /// Whether a spelling index is a virtual candidate's, so `dict.word` must
    /// not be asked for it.
    pub fn is_virtual(spelling: u32) -> bool {
        spelling & VIRTUAL != 0
    }

    /// A resumable enumeration starting at result 0.
    ///
    /// Yields exactly what [`Search::enumerate`] yields, in the same order, but
    /// as a cursor that can be paused between results and picked up again.
    pub fn cursor(&self) -> Cursor {
        let mut cursor = self.blank_cursor();
        let max_words = self.options.max_words as usize;

        if self.empty_input || self.dead || self.forced.classes.len() > max_words {
            cursor.done = true;
            return cursor;
        }
        if self.remaining.is_empty() {
            // Forced words consumed every letter: one result, the forced ones,
            // unless they are the text itself and the row was dropped.
            cursor.emit_empty = !self.skips(&[]);
            cursor.done = !cursor.emit_empty;
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
    ///
    /// Like [`Search::nth`], a seek that lands on or past the dropped row is
    /// made again one further along the tree.
    pub fn cursor_at(&self, memo: &mut Memo, index: u128) -> Option<Cursor> {
        let max_words = self.options.max_words as usize;
        if self.empty_input || self.dead || self.forced.classes.len() > max_words {
            return None;
        }

        if self.remaining.is_empty() {
            if index != 0 || self.skips(&[]) {
                return None;
            }
            let mut cursor = self.blank_cursor();
            cursor.emit_empty = true;
            return Some(cursor);
        }

        let mut cursor = self.seek(memo, index)?;
        if self.dropped().is_some_and(|own| cursor.chosen.as_slice() >= own) {
            cursor = self.seek(memo, index.checked_add(1)?)?;
        }
        cursor.position = index;
        Some(cursor)
    }

    /// A cursor standing on the tree's `index`-th result, the dropped row
    /// included, ready to emit it.
    fn seek(&self, memo: &mut Memo, index: u128) -> Option<Cursor> {
        let mut cursor = self.blank_cursor();
        let found = self.counter(memo, u64::MAX).seek_pivot(
            self.remaining,
            self.budget_left(),
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
    /// The path of the text's own row, when the query dropped it.
    skip: Option<&'a [u32]>,
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
            // The text's own row, which is not a result: see the module docs.
            if self.skip.is_some_and(|own| own == self.stack.as_slice()) {
                return;
            }
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
                    // The text's own row, which is not a result: walk on.
                    if search.skips(&self.chosen) {
                        self.chosen.pop();
                        continue;
                    }
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
    /// Stop, like the node budget, once the memo holds this many entries.
    memo_cap: usize,
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
        if self.stats.nodes > self.node_budget || self.memo.table.len() >= self.memo_cap {
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
                push(candidate);
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

    // -------------------------------------------------------------- ranking

    /// The inverse of `unrank_pivot`: how many results the walk reaches before
    /// the one whose canonical path is `path`. At each step that is every
    /// subtree the scan would have entered before the chosen candidate. `None`
    /// when `path` is no result here, the budget ran out, or a total overflowed.
    fn rank_path(&mut self, mut rem: Counts, mut budget: u8, path: &[u32]) -> Option<u128> {
        let candidates = self.candidates;
        let mut rank: u128 = 0;
        let mut letter = rem.rarest();
        let mut min_index = 0u32;

        for &chosen in path {
            let letter_now = letter?;
            if budget == 0 {
                return None;
            }
            let bucket = &candidates.buckets[letter_now];
            let start = bucket.partition_point(|&i| i < min_index);
            let room = rem.total();
            let next_budget = self.spend(budget);

            for &candidate in &bucket[start..] {
                if candidate >= chosen {
                    break;
                }
                let slot = candidate as usize;
                if candidates.len[slot] as u32 > room {
                    continue;
                }
                let counts = candidates.counts[slot];
                if !counts.fits_in(rem) {
                    continue;
                }
                let next = rem.sub(counts);
                let subtree = if next.get(letter_now) > 0 {
                    self.run(next, letter_now, candidate, next_budget)
                } else {
                    self.pivot(next, next_budget)
                };
                if self.stopped {
                    return None;
                }
                rank = rank.checked_add(subtree)?;
            }

            let counts = candidates.counts[chosen as usize];
            if chosen < min_index || counts.get(letter_now) == 0 || !counts.fits_in(rem) {
                return None;
            }
            rem = rem.sub(counts);
            budget = next_budget;
            if rem.get(letter_now) > 0 {
                min_index = chosen;
            } else {
                letter = rem.rarest();
                min_index = 0;
            }
        }
        rem.is_empty().then_some(rank)
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dict::{TierBits, WordList};
    use crate::readings::parse_reading;

    /// `min_word_len` 3 at Full, with or without an allowlist.
    fn options(short_words: Option<&[&str]>) -> SolveOptions {
        SolveOptions {
            tier: Tier::Full,
            min_word_len: 3,
            short_words: short_words.map(|words| words.iter().map(|w| w.to_string()).collect()),
            limit: 0,
            ..Default::default()
        }
    }

    /// Every result as class indices, in emission order.
    fn classes(dict: &Dict, input: &str, options: SolveOptions) -> Vec<Vec<u32>> {
        let search = Search::prepare(dict, input, options).unwrap();
        let mut out = Vec::new();
        search.enumerate(|classes| {
            out.push(classes.to_vec());
            Flow::Continue
        });
        out
    }

    /// Every result as sorted words, sorted, so two runs compare as sets.
    fn spelled(dict: &Dict, input: &str, options: SolveOptions) -> Vec<Vec<String>> {
        let mut out = crate::solve(dict, input, options).unwrap();
        for words in &mut out {
            words.sort();
        }
        out.sort();
        out
    }

    fn rows(words: &[&[&str]]) -> Vec<Vec<String>> {
        let mut out: Vec<Vec<String>> = words
            .iter()
            .map(|row| {
                let mut row: Vec<String> = row.iter().map(|w| w.to_string()).collect();
                row.sort();
                row
            })
            .collect();
        out.sort();
        out
    }

    /// A dictionary with the terms of the classes beside its words: the
    /// fixture the literal rule's tests search.
    fn classed() -> Dict {
        let terms = [
            ("1", Class::Shorthand.bit()),
            ("2", Class::Shorthand.bit()),
            ("4", Class::Shorthand.bit()),
            ("u", Class::Shorthand.bit()),
            ("r", Class::Shorthand.bit()),
            ("b8", Class::Blends.bit()),
            ("gr8", Class::Blends.bit()),
            ("l8", Class::Blends.bit()),
            ("&", Class::Symbols.bit()),
            ("@", Class::Symbols.bit()),
            ("wtf", Class::Acronyms.bit()),
            ("amy", Class::Names.bit()),
        ];
        Dict::from_words_and_terms(
            ["link", "blink", "ink", "two", "fast", "furious", "may", "yam", "bat", "tab", "tat", "at", "be", "ate", "eat", "tea"],
            terms,
        )
        .unwrap()
    }

    fn with(classes: ClassMask) -> SolveOptions {
        SolveOptions { tier: Tier::Full, classes, min_word_len: 2, limit: 0, ..Default::default() }
    }

    /// Every result spelled, with each word's class name, sorted for comparison.
    fn tagged(dict: &Dict, input: &str, options: SolveOptions) -> Vec<Vec<(String, &'static str)>> {
        let search = Search::prepare(dict, input, options).unwrap();
        let mut out = Vec::new();
        search.enumerate(|classes| {
            let mut row: Vec<(String, &'static str)> = search
                .spell_indices(dict, classes)
                .iter()
                .map(|&i| (search.word(dict, i).to_owned(), search.class_of(dict, i).map_or(crate::classes::WORDS, |c| c.name())))
                .collect();
            row.sort();
            out.push(row);
            Flow::Continue
        });
        out.sort();
        out
    }

    #[test]
    fn a_pool_with_a_digit_has_nothing_with_words_alone_and_says_which() {
        let dict = classed();
        let search = Search::prepare(&dict, "Blink-182", with(0)).unwrap();
        assert_eq!(search.uncovered(), "182");
        assert_eq!(search.slots().chars(), &['1', '8', '2']);
        assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 0);
        assert!(tagged(&dict, "Blink-182", with(0)).is_empty());
        assert_eq!(search.text_row(), TextRow::None, "blink182 is no word");
        // A cursor and nth agree that there is nothing, without a walk.
        assert!(search.cursor().next(&search).is_none());
        assert!(search.nth(&mut Memo::new(), 0).is_none());

        // The letters alone are as they were: the digits are not dropped, they are counted.
        let plain = Search::prepare(&dict, "blink", with(0)).unwrap();
        assert_eq!(plain.uncovered(), "");
        assert_eq!(plain.count(&mut Memo::new(), u64::MAX).0, 0, "blink is the text itself and has no other spelling");
        assert_eq!(Search::prepare(&dict, "blink link", with(0)).unwrap().count(&mut Memo::new(), u64::MAX).0, 0, "its own words");
        assert_eq!(Search::prepare(&dict, "blinklink", with(0)).unwrap().count(&mut Memo::new(), u64::MAX).0, 1, "a re-spacing is a result");
    }

    #[test]
    fn the_classes_admit_their_terms_and_every_term_is_tagged() {
        let dict = classed();
        let mask = Class::Shorthand.bit() | Class::Blends.bit();
        let found = tagged(&dict, "Blink-182", with(mask));
        fn row(words: &[(&str, &'static str)]) -> Vec<(String, &'static str)> {
            let mut r: Vec<(String, &'static str)> = words.iter().map(|(w, c)| (w.to_string(), *c)).collect();
            r.sort();
            r
        }
        // The one arrangement: 1 and 2 as shorthand, link, and b8 as a blend.
        assert!(found.contains(&row(&[("1", "shorthand"), ("2", "shorthand"), ("link", "words"), ("b8", "blends")])), "{found:?}");
        for r in &found {
            assert!(r.iter().all(|(w, _)| w != "182" && w != "18" && w != "82"), "no numeral without the class: {r:?}");
        }
        // Shorthand alone cannot place the 8; blends alone cannot place the 1 and 2.
        let search = Search::prepare(&dict, "Blink-182", with(Class::Shorthand.bit())).unwrap();
        assert_eq!(search.uncovered(), "8");
        assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 0);
        let search = Search::prepare(&dict, "Blink-182", with(Class::Blends.bit())).unwrap();
        assert_eq!(search.uncovered(), "12");
        // Every class shows in the count of candidates, none in the letters' classes.
        assert!(search.candidate_count() >= 1);

        // A symbol is a term of its class, and nothing else.
        assert!(tagged(&dict, "AT&T", with(0)).is_empty());
        let found = tagged(&dict, "AT&T", with(Class::Symbols.bit()));
        assert_eq!(found, vec![row(&[("tat", "words"), ("&", "symbols")])]);
    }

    #[test]
    fn a_term_of_letters_is_a_spelling_of_its_letters_class() {
        let dict = classed();
        // `amy` spells may's class: with names on the count does not move and the row keeps its word.
        let words = tagged(&dict, "yam", with(0));
        let names = tagged(&dict, "yam", with(Class::Names.bit()));
        assert_eq!(words, names);
        assert_eq!(words, vec![vec![("may".to_owned(), crate::classes::WORDS)]], "yam is the text; may is its other spelling");
        // A term that opens a class of its own counts, at any length: `u` and `r` are one character each.
        assert!(tagged(&dict, "ur", with(0)).is_empty());
        let short = tagged(&dict, "ur", with(Class::Shorthand.bit()));
        assert_eq!(short, vec![vec![("r".to_owned(), "shorthand"), ("u".to_owned(), "shorthand")]]);
        // But a word under the minimum length is still out, whatever the mask: `at` is 2, `a` would not be.
        let search = Search::prepare(&dict, "wtf", SolveOptions { min_word_len: 4, ..with(Class::Acronyms.bit()) }).unwrap();
        assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 0, "wtf is the text itself");
        let search = Search::prepare(&dict, "w tf", SolveOptions { min_word_len: 4, ..with(Class::Acronyms.bit()) }).unwrap();
        assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 1, "a term is governed by its class, not the minimum length");
    }

    #[test]
    fn a_class_let_in_by_a_term_below_the_length_rule_shows_its_terms_alone() {
        fn row(words: &[(&str, &'static str)]) -> Vec<(String, &'static str)> {
            let mut r: Vec<(String, &'static str)> = words.iter().map(|(w, c)| (w.to_string(), *c)).collect();
            r.sort();
            r
        }
        // `ta` (acronyms) spells the class of `at`: at a minimum of 3 the class is in through the term alone.
        let dict = Dict::from_words_and_terms(
            ["at", "cat", "act", "link", "blink", "kiln"],
            [("ta", Class::Acronyms.bit()), ("u", Class::Shorthand.bit()), ("r", Class::Shorthand.bit())],
        )
        .unwrap();
        let min3 = |classes: ClassMask| SolveOptions { min_word_len: 3, ..with(classes) };
        assert!(tagged(&dict, "link ta", min3(0)).is_empty(), "words alone: nothing under 3 letters places the t and a");
        // The row is `kiln ta`, the term tagged; `at`, a word the rule excludes, is never shown for the class,
        // whether the text spells it as the term or as the word.
        for input in ["link ta", "link at"] {
            let found = tagged(&dict, input, min3(Class::Acronyms.bit()));
            assert_eq!(found, vec![row(&[("kiln", "words"), ("ta", "acronyms")])], "{input:?}");
            let search = Search::prepare(&dict, input, min3(Class::Acronyms.bit())).unwrap();
            assert_eq!(search.count(&mut Memo::new(), u64::MAX).0, 1, "{input:?}: the count was already right");
        }
        // Excluding the term takes the class out with it: its words were never in.
        let excluded = SolveOptions { exclude: vec!["ta".into()], ..min3(Class::Acronyms.bit()) };
        assert!(tagged(&dict, "link ta", excluded).is_empty());
        // At a minimum of 2 the word is a spelling again, and leads as the commoner.
        let found = tagged(&dict, "link ta", with(Class::Acronyms.bit()));
        assert_eq!(found, vec![row(&[("kiln", "words"), ("at", "words")])]);
        // An allowlisted word admits its class outright, term or no term.
        let listed = SolveOptions { short_words: Some(vec!["at".into()]), ..min3(0) };
        assert_eq!(tagged(&dict, "link ta", listed), vec![row(&[("kiln", "words"), ("at", "words")])]);
        // A term that opens a class of its own is untouched: `u` and `r` at a minimum of 3.
        let found = tagged(&dict, "ur link", min3(Class::Shorthand.bit()));
        assert_eq!(found, vec![row(&[("kiln", "words"), ("r", "shorthand"), ("u", "shorthand")])]);

        // On the classed fixture: names on at a minimum of 4 shows `amy` for the letters of `yam`, never the
        // three-letter `may`, and with words alone the letters have nothing.
        let dict = classed();
        let min4 = |classes: ClassMask| SolveOptions { min_word_len: 4, ..with(classes) };
        assert!(tagged(&dict, "yam", min4(0)).is_empty());
        assert_eq!(tagged(&dict, "yam", min4(Class::Names.bit())), vec![row(&[("amy", "names")])]);
        assert!(tagged(&dict, "amy", min4(Class::Names.bit())).is_empty(), "amy is the text itself, and may is under the rule");
        // Under the minimum the words lead again.
        assert_eq!(tagged(&dict, "yam", with(Class::Names.bit())), vec![row(&[("may", "words")])]);
    }

    #[test]
    fn numerals_are_made_from_the_pool_and_the_text_itself_is_never_one() {
        let dict = classed();
        let numerals = with(Class::Numerals.bit());
        // "2 Fast 2 Furious" never lists `two`: a digit is a digit. With numerals on, the 2s are terms.
        for options in [with(0), numerals.clone()] {
            for r in tagged(&dict, "2 Fast 2 Furious", options) {
                assert!(r.iter().all(|(w, _)| w != "two"), "{r:?}");
            }
        }
        assert!(tagged(&dict, "2 Fast 2 Furious", with(0)).is_empty());
        let found = tagged(&dict, "2 Fast 2 Furious", numerals.clone());
        // `fast furious 2 2` is the text itself; `fast furious 22` is a result, the 2s as one numeral.
        assert!(found.iter().any(|r| r.contains(&("22".to_owned(), "numerals"))), "{found:?}");
        assert!(!found.iter().any(|r| r.iter().filter(|(w, _)| w == "2").count() == 2 && r.len() == 4), "{found:?}");

        // "182" alone: every numeral of its digits, never itself.
        let search = Search::prepare(&dict, "182", numerals.clone()).unwrap();
        assert_eq!(search.text_row(), TextRow::Dropped);
        let found = tagged(&dict, "182", numerals.clone());
        let texts: Vec<Vec<&str>> = found.iter().map(|r| r.iter().map(|(w, _)| w.as_str()).collect()).collect();
        assert!(!texts.contains(&vec!["182"]), "{texts:?}");
        assert!(texts.contains(&vec!["18", "2"]) && texts.contains(&vec!["1", "82"]) && texts.contains(&vec!["1", "2", "8"]), "{texts:?}");
        assert!(found.iter().all(|r| r.iter().all(|(_, c)| *c == "numerals")));
        // The digits are written in the text's own order: 8 then 2 is `82`, never `28`.
        assert!(!texts.iter().any(|r| r.contains(&"28")), "{texts:?}");

        // Too many distinct characters, and too many numerals, are errors that say so.
        assert_eq!(Search::prepare(&dict, "1234567", with(0)).err(), Some(SolveError::TooManyCharacters));
        let many = "111111111111111222222222222222333333333333333444444444444444555555555555555666666666666666";
        assert_eq!(Search::prepare(&dict, many, numerals).err(), Some(SolveError::TooManyNumerals));
        assert!(Search::prepare(&dict, many, with(0)).is_ok(), "without numerals the digits are just uncovered");
    }

    #[test]
    fn a_leet_read_text_is_a_pool_of_letters() {
        let dict = classed();
        let read = crate::readings::read_input("B8", &parse_reading("8:b").unwrap());
        assert_eq!(read, "Bb");
        let read = crate::readings::read_input("Ke$ha", &parse_reading("$:s").unwrap());
        assert_eq!(read, "Kesha");
        let search = Search::prepare(&dict, &read, with(0)).unwrap();
        assert!(search.slots().is_empty());
        assert_eq!(search.uncovered(), "");
    }

    /// The tests over this dictionary search "t oad", not "toad": `toad` is a
    /// word here with no other spelling, so as the text it would be left out
    /// of its own results, which is not what these tests are about.
    fn small_dict() -> Dict {
        Dict::from_words(["a", "to", "no", "on", "ad", "qi", "dot", "toad", "not"]).unwrap()
    }

    #[test]
    fn listed_short_words_are_admitted_and_unlisted_ones_are_not() {
        let dict = small_dict();

        // "toad" is "a" + "dot" or "to" + "ad": the first needs a listed word,
        // the second needs "ad", which is in the dictionary but not the list.
        assert_eq!(
            spelled(&dict, "t oad", options(Some(&["a", "to", "no"]))),
            rows(&[&["toad"], &["a", "dot"]])
        );
        assert_eq!(spelled(&dict, "t oad", options(None)), rows(&[&["toad"]]));

        // "qi" + "dot" is the only partition of these letters. Unlisted, "qi"
        // never appears, even though a lower minimum would admit it.
        assert_eq!(spelled(&dict, "qidot", options(Some(&["a", "to", "no"]))), rows(&[]));
        assert_eq!(
            spelled(&dict, "qidot", SolveOptions { min_word_len: 1, ..options(None) }),
            rows(&[&["dot", "qi"]])
        );
    }

    #[test]
    fn a_listed_word_the_dictionary_lacks_is_ignored() {
        let dict = small_dict();
        // Absent words, an empty entry, and unnormalized spellings of present
        // ones: nothing fails, and the present ones still count.
        let list: &[&str] = &["zz", "xyzzy", "", "A", " to ", "N-o"];
        assert_eq!(
            spelled(&dict, "t oad", options(Some(list))),
            rows(&[&["toad"], &["a", "dot"]])
        );
        assert_eq!(
            spelled(&dict, "onto", options(Some(list))),
            rows(&[&["no", "to"]])
        );
    }

    #[test]
    fn none_and_an_empty_list_are_the_vocabulary_min_word_len_defines() {
        let dict = small_dict();
        for input in ["toad", "onto", "qidot", "notto", "dotnot"] {
            let plain = classes(&dict, input, options(None));
            let empty = classes(&dict, input, options(Some(&[])));
            assert_eq!(plain, empty, "{input:?}: None and Some(vec![]) differ");

            // And both are what `min_word_len` alone admits: no class under 3.
            let search = Search::prepare(&dict, input, options(None)).unwrap();
            let expected = dict
                .classes
                .iter()
                .filter(|c| c.len >= 3 && c.counts.fits_in(search.remaining()))
                .count();
            assert_eq!(search.candidate_count(), expected, "{input:?}: candidate set");
            let search = Search::prepare(&dict, input, options(Some(&[]))).unwrap();
            assert_eq!(search.candidate_count(), expected, "{input:?}: candidate set");
        }
    }

    #[test]
    fn a_listed_word_admits_its_whole_class() {
        let dict = small_dict();
        // "no" and "on" are one class. Listing "no" alone admits the class,
        // because the search works in classes, not spellings.
        let class = dict.find_class("no", Scope::tier(Tier::Full)).unwrap();
        assert_eq!(dict.find_class("on", Scope::tier(Tier::Full)), Some(class));

        let found = classes(&dict, "onto", options(Some(&["no", "to"])));
        assert_eq!(found.len(), 1, "onto = no + to, once: {found:?}");
        assert!(found[0].contains(&(class as u32)), "{found:?} lacks the no/on class");

        // Listing the other spelling admits the same class, and `spell` shows
        // the class's representative either way.
        assert_eq!(classes(&dict, "onto", options(Some(&["on", "to"]))), found);
    }

    /// A dictionary with tiers, from `(word, in_common, in_standard, in_full)`
    /// rows. `TierBits` only decodes, so the bitset artifact is assembled by
    /// hand. A word in none of the three sets is a site addition: the shipped
    /// list carries it and only Extended, which filters nothing, admits it.
    fn tiered(rows: &[(&str, bool, bool, bool)]) -> Dict {
        let mut rows = rows.to_vec();
        rows.sort_by_key(|&(word, _, _, _)| word);
        let words: Vec<String> = rows.iter().map(|&(word, _, _, _)| word.to_owned()).collect();

        let mut buf = Vec::new();
        buf.extend_from_slice(b"ARSMBITS");
        buf.extend_from_slice(&1u16.to_le_bytes()); // format version
        buf.extend_from_slice(&3u16.to_le_bytes()); // Common, Standard, Full
        buf.extend_from_slice(&(words.len() as u32).to_le_bytes());
        for set in 0..3 {
            let mut bits = vec![0u8; words.len().div_ceil(8)];
            for (i, &(_, common, standard, full)) in rows.iter().enumerate() {
                if [common, standard, full][set] {
                    bits[i >> 3] |= 1 << (i & 7);
                }
            }
            buf.extend_from_slice(&bits);
        }
        let tiers = TierBits::decode(&buf).unwrap();

        let n = words.len();
        Dict::new(WordList { words, zipf: vec![0; n], pos: vec![0; n] }, Some(tiers), Vec::new()).unwrap()
    }

    #[test]
    fn a_listed_word_outside_the_query_tier_does_not_admit_its_class() {
        let dict = tiered(&[
            ("toad", true, true, true),
            ("dot", true, true, true),
            ("to", true, true, true),
            ("a", false, true, true), // Standard and up
            ("on", true, true, true),
            ("no", false, false, true), // Full only
        ]);
        let at = |tier: Tier, short: &[&str]| SolveOptions { tier, ..options(Some(short)) };

        // "a" is not in Common, so at Common the list cannot reach "a dot".
        assert_eq!(spelled(&dict, "t oad", at(Tier::Common, &["a"])), rows(&[&["toad"]]));
        assert_eq!(
            spelled(&dict, "t oad", at(Tier::Standard, &["a"])),
            rows(&[&["toad"], &["a", "dot"]])
        );

        // The listed spelling itself must be in the tier: "on" is Common but
        // the list says "no", which is only Full. Listing "on" admits the
        // class at Common, and at Full either spelling does.
        assert_eq!(spelled(&dict, "onto", at(Tier::Common, &["no", "to"])), rows(&[]));
        assert_eq!(
            spelled(&dict, "onto", at(Tier::Common, &["on", "to"])),
            rows(&[&["on", "to"]])
        );
        assert_eq!(
            spelled(&dict, "onto", at(Tier::Full, &["no", "to"])),
            rows(&[&["no", "to"]])
        );
    }

    #[test]
    fn a_site_addition_belongs_to_extended_and_nothing_narrower() {
        // No bitset claims "zz", which is what a word the site added looks like
        // in the artifact: the shipped list carries it, and only the tier that
        // filters nothing lets it through.
        let dict = tiered(&[("zz", false, false, false), ("to", true, true, true)]);
        let addition = dict.words.iter().position(|w| w == "zz").unwrap() as u32;
        let pinned = dict.words.iter().position(|w| w == "to").unwrap() as u32;

        assert!(!dict.in_scope(addition, Scope::tier(Tier::Common)));
        assert!(!dict.in_scope(addition, Scope::tier(Tier::Standard)));
        assert!(!dict.in_scope(addition, Scope::tier(Tier::Full)));
        assert!(dict.in_scope(addition, Scope::tier(Tier::Extended)));

        // And the pinned word is in every tier, Extended included.
        for tier in [Tier::Common, Tier::Standard, Tier::Full, Tier::Extended] {
            assert!(dict.in_scope(pinned, Scope::tier(tier)), "{tier:?} should contain a pinned word");
        }
    }

    #[test]
    fn admitting_an_addition_reaches_it_from_a_narrow_tier_without_relabelling_it() {
        let mut dict = tiered(&[("zz", false, false, false), ("to", true, true, true)]);
        let addition = dict.words.iter().position(|w| w == "zz").unwrap() as u32;

        assert_eq!(dict.admit(&["zz".to_string()]), 1);
        assert_eq!(dict.admitted(), 1);

        // Common now reaches it: this is what lets enumeration search Common
        // plus the additions.
        assert!(dict.in_scope(addition, Scope::tier(Tier::Common)));
        assert!(dict.class_in_scope(dict.find_class("zz", Scope::tier(Tier::Common)).unwrap(), Scope::tier(Tier::Common)));

        // But the built tiers are untouched, so a result can still say where
        // the word really came from. Reading provenance through `in_tier`
        // would call every admitted addition "common".
        assert!(!dict.in_built_tier(addition, Tier::Common));
        assert!(!dict.in_built_tier(addition, Tier::Full));
        assert!(dict.in_built_tier(addition, Tier::Extended));

        // A word the artifact does not carry is ignored rather than failing:
        // that is the state between `vocab:add` and the dictionary rebuild.
        assert_eq!(dict.admit(&["notaword".to_string()]), 0);
        assert_eq!(dict.admitted(), 1);
    }

    #[test]
    fn a_dictionary_admits_nothing_until_asked() {
        let dict = tiered(&[("zz", false, false, false), ("to", true, true, true)]);
        assert_eq!(dict.admitted(), 0);
        let addition = dict.words.iter().position(|w| w == "zz").unwrap() as u32;
        assert!(!dict.in_scope(addition, Scope::tier(Tier::Common)));
    }

    /// "dormitory" over a dictionary where two classes have two spellings each:
    /// {room, moor} and {dirty, tydir}.
    fn dorm_dict() -> Dict {
        Dict::from_words(["dormitory", "dirty", "tydir", "room", "moor", "rid", "moo", "try", "torrid", "yom", "dim", "roty", "or"]).unwrap()
    }

    fn excluding(words: &[&str]) -> SolveOptions {
        SolveOptions {
            exclude: words.iter().map(|w| w.to_string()).collect(),
            ..options(None)
        }
    }

    /// The count, checked against enumeration, and the rows as sorted words.
    fn counted(dict: &Dict, input: &str, options: SolveOptions) -> (u128, Vec<Vec<String>>) {
        let search = Search::prepare(dict, input, options.clone()).unwrap();
        let (total, saturated, _) = search.count(&mut Memo::new(), u64::MAX);
        assert!(!saturated);
        let rows = spelled(dict, input, options);
        assert_eq!(total, rows.len() as u128, "the count and the enumeration disagree");
        (total, rows)
    }

    #[test]
    fn an_excluded_spelling_is_hidden_and_its_class_kept_while_it_has_others() {
        let dict = dorm_dict();
        let (all, _) = counted(&dict, "dormitory", options(None));

        // Excluding `room` leaves `moor` to spell the class: the same results,
        // the same count, and `room` never shown.
        let (total, rows) = counted(&dict, "dormitory", excluding(&["room"]));
        assert_eq!(total, all);
        assert!(rows.iter().all(|r| !r.contains(&"room".to_string())));
        assert!(rows.contains(&vec!["dirty".to_string(), "moor".to_string()]));
    }

    #[test]
    fn a_class_with_every_spelling_excluded_is_dropped_and_the_count_stays_exact() {
        let dict = dorm_dict();
        let (all, every) = counted(&dict, "dormitory", options(None));
        let using = every.iter().filter(|r| r.iter().any(|w| w == "moor" || w == "room")).count() as u128;
        assert!(using > 0);

        let (total, rows) = counted(&dict, "dormitory", excluding(&["room", "moor"]));
        assert_eq!(total, all - using);
        assert!(rows.iter().all(|r| r.iter().all(|w| w != "room" && w != "moor")));

        // The other two-spelling class, the same way.
        let with_dirty = every.iter().filter(|r| r.iter().any(|w| w == "dirty" || w == "tydir")).count() as u128;
        let (without_dirty, _) = counted(&dict, "dormitory", excluding(&["dirty", "tydir"]));
        assert_eq!(without_dirty, all - with_dirty);
    }

    #[test]
    fn excluding_a_word_the_dictionary_lacks_changes_nothing() {
        let dict = dorm_dict();
        let plain = classes(&dict, "dormitory", options(None));
        assert_eq!(classes(&dict, "dormitory", excluding(&["zebra", "", "Room!"])).len(), plain.len());
        // An unnormalized spelling of a word it has is that word.
        let (_, rows) = counted(&dict, "dormitory", excluding(&["ROOM"]));
        assert!(rows.iter().all(|r| !r.contains(&"room".to_string())));
    }

    // ------------------------------------------- the text is never a result

    /// A dictionary with a frequency byte per word, from `(word, zipf)` rows.
    fn weighted(rows: &[(&str, u8)]) -> Dict {
        let mut rows = rows.to_vec();
        rows.sort_by_key(|&(word, _)| word);
        let words: Vec<String> = rows.iter().map(|&(word, _)| word.to_owned()).collect();
        let zipf: Vec<u8> = rows.iter().map(|&(_, z)| z).collect();
        let n = words.len();
        Dict::new(WordList { words, zipf, pos: vec![0; n] }, None, Vec::new()).unwrap()
    }

    fn everyday() -> Dict {
        weighted(&[
            ("listen", 200), ("silent", 180), ("tinsel", 100), ("enlist", 90),
            ("below", 150), ("elbow", 140), ("bowel", 90),
            ("apple", 170), ("appel", 40), ("pepla", 0),
            ("house", 190), ("sauce", 120), ("cause", 185),
            ("evil", 130), ("live", 130), ("vile", 130), ("veil", 110),
        ])
    }

    /// The one row of `input` that holds `words`' classes, as it is shown.
    fn shown_as(dict: &Dict, input: &str, words: &[&str]) -> Option<Vec<String>> {
        let mut want: Vec<u32> = words.iter().map(|w| dict.find_class(w, Scope::tier(Tier::Full)).unwrap() as u32).collect();
        want.sort_unstable();
        let search = Search::prepare(dict, input, SolveOptions { limit: 0, ..options(None) }).unwrap();
        let mut found = None;
        search.enumerate(|classes| {
            let mut sorted = classes.to_vec();
            sorted.sort_unstable();
            if sorted == want {
                found = Some(search.spell(dict, classes));
            }
            Flow::Continue
        });
        found.map(|mut row| {
            row.sort();
            row
        })
    }

    fn words(row: &[&str]) -> Option<Vec<String>> {
        let mut row: Vec<String> = row.iter().map(|w| w.to_string()).collect();
        row.sort();
        Some(row)
    }

    #[test]
    fn the_row_that_would_show_the_text_takes_the_commonest_other_spelling() {
        let dict = everyday();
        // One word: the next commonest of its class.
        assert_eq!(shown_as(&dict, "below", &["below"]), words(&["elbow"]));
        assert_eq!(shown_as(&dict, "listen", &["listen"]), words(&["silent"]));
        // Two words, one with no other spelling: the other changes.
        assert_eq!(shown_as(&dict, "apple house", &["apple", "house"]), words(&["appel", "house"]));
        // Two words that could both change: one does, to the commoner replacement
        // (`silent` 180 against `elbow` 140), whichever way round they were typed.
        assert_eq!(shown_as(&dict, "listen below", &["listen", "below"]), words(&["silent", "below"]));
        assert_eq!(shown_as(&dict, "below listen", &["listen", "below"]), words(&["silent", "below"]));
        // A tie in frequency goes A to Z: `live` before `vile`.
        assert_eq!(shown_as(&dict, "evil", &["evil"]), words(&["live"]));
        // A row that never showed the text is left as it was: `cause` leads `sauce`.
        assert_eq!(shown_as(&dict, "apple sauce", &["apple", "sauce"]), words(&["apple", "cause"]));
        assert_eq!(shown_as(&dict, "silent", &["listen"]), words(&["listen"]));
        // And with no other spelling at all, there is no such row.
        assert_eq!(shown_as(&dict, "house", &["house"]), None);
        assert_eq!(shown_as(&dict, "h ouse", &["house"]), words(&["house"]));
    }

    #[test]
    fn what_became_of_the_text_is_reported() {
        let dict = everyday();
        let row = |input: &str| Search::prepare(&dict, input, options(None)).unwrap().text_row();
        assert_eq!(row("house"), TextRow::Dropped);
        assert_eq!(row("below"), TextRow::Respelled);
        assert_eq!(row("apple sauce"), TextRow::Shown);
        assert_eq!(row("apple saauce"), TextRow::None);
        assert_eq!(row("applesauce"), TextRow::None);
        assert_eq!(row(""), TextRow::None);

        // The text's own words, in any order and however they were typed, and
        // nothing else: what a caller that spells rows itself asks.
        let search = Search::prepare(&dict, "Apple  HOUSE", options(None)).unwrap();
        let index = |word: &str| dict.index_of(word).unwrap();
        assert!(search.is_text(&[index("house"), index("apple")]));
        assert!(!search.is_text(&[index("house"), index("appel")]));
        assert!(!search.is_text(&[index("house")]));
    }

    /// The claims the skip rests on, checked on the tree itself with the rule
    /// switched off: a result's path is the order the walk emits it in, paths
    /// sort the way results are listed, and `rank_path` is a result's index.
    #[test]
    fn a_path_is_the_walk_and_path_order_is_list_order() {
        let dict = Dict::from_words([
            "dormitory", "dirty", "tydir", "room", "moor", "rid", "moo", "try", "torrid", "yom", "dim", "roty",
            "or", "do", "it", "my", "to", "mid", "riot", "trio", "dorm", "mood", "doom", "tom", "dry", "rot",
            "dot", "rod", "trod", "dirt", "tidy", "toy", "rim", "mod", "motor", "moody", "od", "oy", "id", "om",
            "mo", "yo", "ti", "tor", "ort", "dor", "tod", "yod", "dom", "rom", "mor", "myo", "rimy", "miry",
        ])
        .unwrap();

        let mut checked = 0usize;
        for (input, min_word_len, max_words, include) in [
            ("dormitory", 2u8, UNLIMITED_WORDS, None),
            ("dormitory", 3, UNLIMITED_WORDS, None),
            ("dormitory", 2, 3, None),
            ("dormitory", 2, 2, None),
            ("dormitory", 2, UNLIMITED_WORDS, Some("dirty")),
            ("dormitory", 2, 3, Some("it")),
            ("moo moo dirty", 2, UNLIMITED_WORDS, None),
        ] {
            let options = SolveOptions {
                tier: Tier::Full,
                min_word_len,
                max_words,
                must_include: include.iter().map(|w| w.to_string()).collect(),
                limit: 0,
                ..Default::default()
            };
            let mut search = Search::prepare(&dict, input, options).unwrap();
            // The tree itself: with no own row, nothing is skipped.
            search.own = None;
            let forced = search.forced.classes.len();

            let mut rows: Vec<Vec<u32>> = Vec::new();
            search.enumerate(|classes| {
                rows.push(classes.to_vec());
                Flow::Continue
            });
            assert!(!rows.is_empty(), "{input:?} min={min_word_len} max={max_words} include={include:?}: no rows");
            checked += rows.len();

            let mut memo = Memo::new();
            let mut previous: Option<Vec<u32>> = None;
            for (i, row) in rows.iter().enumerate() {
                let walked: Vec<u32> =
                    row[forced..].iter().map(|&c| search.candidates.index_of_class(c).unwrap()).collect();
                // Shuffled in, the members come back out in the walk's own order.
                let mut members = walked.clone();
                members.reverse();
                let path = search.candidates.canonical_path(search.remaining, &members).unwrap();
                assert_eq!(path, walked, "{input:?} row {i}: the path is not the walk");

                if let Some(before) = &previous {
                    assert!(before < &path, "{input:?} row {i}: paths do not sort as the list does");
                }
                previous = Some(path.clone());

                let rank = search.counter(&mut memo, u64::MAX).rank_path(search.remaining, search.budget_left(), &path);
                assert_eq!(rank, Some(i as u128), "{input:?} row {i}: rank");
                assert_eq!(search.unrank(&mut memo, i as u128), Some(path), "{input:?} row {i}: unrank");
            }
        }
        assert!(checked > 100, "only {checked} rows checked");
    }

    #[test]
    fn a_count_that_stopped_early_is_one_lower_and_the_views_still_skip_the_row() {
        let dict = Dict::from_words([
            "dormitory", "dirty", "room", "moor", "rid", "moo", "try", "torrid", "yom", "dim", "or", "do", "it",
            "my", "to", "mid", "riot", "trio", "dorm", "mood", "doom", "tom", "dry", "rot",
        ])
        .unwrap();
        let options = SolveOptions { tier: Tier::Full, min_word_len: 2, limit: 0, ..Default::default() };
        let search = Search::prepare(&dict, "dormitory", options.clone()).unwrap();
        assert_eq!(search.text_row(), TextRow::Dropped);

        let mut rows: Vec<Vec<u32>> = Vec::new();
        search.enumerate(|classes| {
            rows.push(classes.to_vec());
            Flow::Continue
        });
        let own = dict.find_class("dormitory", Scope::tier(Tier::Full)).unwrap() as u32;
        assert!(rows.iter().all(|row| row != &[own]));

        // The same letters typed apart keep the row: one more, the same otherwise.
        let spaced = Search::prepare(&dict, "dormitor y", options).unwrap();
        let (with_row, _, _) = spaced.count(&mut Memo::new(), u64::MAX);
        assert_eq!(with_row, rows.len() as u128 + 1);

        // Stopped at every budget short of finishing: a floor, one lower than the
        // partial sum the same budget gives with the row kept, never below zero,
        // and never above the truth.
        for budget in 0..40 {
            let mut memo = Memo::new();
            let (floor, saturated, stats) = search.count(&mut memo, budget);
            let (kept, _, _) = spaced.count(&mut Memo::new(), budget);
            assert!(!saturated);
            if !stats.truncated {
                assert_eq!(floor, rows.len() as u128);
                break;
            }
            assert_eq!(floor, kept.saturating_sub(1), "budget {budget}");
            assert!(floor <= rows.len() as u128, "budget {budget}: a floor above the truth");

            // Nothing partial was written, so unranking and seeking are still right.
            for (i, row) in rows.iter().enumerate() {
                assert_eq!(search.nth(&mut memo, i as u128).as_ref(), Some(row), "budget {budget}: nth({i})");
            }
            assert_eq!(search.nth(&mut memo, rows.len() as u128), None);
            let mut cursor = search.cursor_at(&mut memo, 1).unwrap();
            assert_eq!(cursor.next(&search), Some(rows[1].as_slice()));
        }
    }

    #[test]
    fn a_word_both_included_and_excluded_is_refused() {
        let dict = dorm_dict();
        let options = SolveOptions { must_include: vec!["room".to_string()], ..excluding(&["room"]) };
        assert_eq!(
            Search::prepare(&dict, "dormitory", options).err(),
            Some(SolveError::IncludedAndExcluded("room".to_string()))
        );
        // Another spelling of the same class may be included: it is the word the
        // reader asked for, and only `room` is gone.
        let other = SolveOptions { must_include: vec!["moor".to_string()], ..excluding(&["room"]) };
        let (total, rows) = counted(&dict, "dormitory", other);
        assert!(total > 0);
        assert!(rows.iter().all(|r| r.contains(&"moor".to_string())));
    }
}
