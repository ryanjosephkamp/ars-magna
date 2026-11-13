//! Several searches as one: the leet pieces.
//!
//! A digit or symbol of the pool may stand for a letter (`$` for s, `7` for t
//! or v; the table in `readings.rs`). Leet is generative, not a lexicon: when
//! the reader turns it on for a character, the search tries the character as
//! itself and as each of its letters, and merges the results. Each reading of
//! the text is one [`Search`] over its own pool — the **piece** — and an
//! [`Expanded`] query is the pieces in a fixed order, the text as typed first.
//! Counts add up; the list is the pieces' lists one after another; a result
//! carries the reading it was found under, and is written with the character
//! where the letter went (`hake$`, tagged `$ as s`).
//!
//! At most [`LEET_CHARACTERS`] characters expand, by first appearance, so a
//! query is at most 8 pieces when each has one letter (`$ ! @`) and 27 in the
//! worst case (`1 6 7`); a fourth stays as it was read. With no leet there is
//! one piece and nothing here costs anything.

use crate::classes::Class;
use crate::dict::Dict;
use crate::readings::{items, letters_of, read_input, SELF};
use crate::search::{Cursor, Flow, Memo, Search, SolveError, SolveOptions, Stats, TextRow};

/// How many of the text's characters one query may expand.
pub const LEET_CHARACTERS: usize = 3;

/// One leet reading of a piece: a character read as a letter, and how many
/// times it stands in the text.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Leet {
    pub ch: char,
    pub letter: char,
    pub count: usize,
}

/// One reading of the text and its search.
pub struct Piece {
    /// The leet readings this piece was searched under, in order of first
    /// appearance; empty for the text as typed.
    pub reading: Vec<Leet>,
    pub search: Search,
}

/// The pieces of one query.
pub struct Expanded {
    /// The text as typed first, then every combination of its leet readings.
    pub pieces: Vec<Piece>,
    /// The characters leet was tried on, in order of first appearance.
    pub leet: Vec<char>,
}

/// One result as a row: its words as a record stores them, the class of each
/// (`None` for a word of the dictionary), how each is written (the leet
/// character where its letter went), and the reading it was found under.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Row {
    pub words: Vec<String>,
    pub classes: Vec<Option<Class>>,
    pub written: Vec<String>,
    pub reading: Vec<(char, char)>,
}

impl Expanded {
    /// Prepare the pieces of `input` (the text after the reader's fixed
    /// readings, as the CLI and the worker pass it), expanding the characters
    /// of `leet` the text has as themselves and that offer letters.
    pub fn prepare(dict: &Dict, input: &str, options: SolveOptions, leet: &[char]) -> Result<Expanded, SolveError> {
        let expand: Vec<(char, usize)> = items(input, &[])
            .into_iter()
            .filter(|item| item.reading == SELF)
            .filter_map(|item| item.key.chars().next().map(|c| (c, item.count)))
            .filter(|(c, _)| leet.contains(c) && !letters_of(*c).is_empty())
            .take(LEET_CHARACTERS)
            .collect();

        // Every combination of "as itself" and each letter, the text as typed
        // first: the pieces' order, which the list and every index follow.
        let mut combos: Vec<Vec<Leet>> = vec![Vec::new()];
        for &(ch, count) in &expand {
            let mut next = Vec::with_capacity(combos.len() * (1 + letters_of(ch).len()));
            for combo in &combos {
                next.push(combo.clone());
                for &letter in letters_of(ch) {
                    let mut with = combo.clone();
                    with.push(Leet { ch, letter, count });
                    next.push(with);
                }
            }
            combos = next;
        }

        let mut pieces = Vec::with_capacity(combos.len());
        for reading in combos {
            let overrides: Vec<(String, String)> = reading.iter().map(|l| (l.ch.to_string(), l.letter.to_string())).collect();
            let text = read_input(input, &overrides);
            let search = Search::prepare(dict, &text, options.clone())?;
            pieces.push(Piece { reading, search });
        }
        Ok(Expanded { pieces, leet: expand.into_iter().map(|(c, _)| c).collect() })
    }

    /// Whether any piece left the text's own row out (see [`TextRow`]).
    pub fn text_left_out(&self) -> bool {
        self.pieces.iter().any(|p| p.search.text_row() == TextRow::Dropped)
    }

    /// The digits and symbols of the text that no term of any piece uses: the
    /// as-typed piece's uncovered characters, less the ones leet read as a
    /// letter. What the count is zero for the lack of; empty for a text of
    /// letters.
    pub fn unused(&self) -> String {
        self.pieces[0].search.uncovered().chars().filter(|c| !self.leet.contains(c)).collect()
    }

    /// How many candidates the pieces hold together.
    pub fn candidate_count(&self) -> usize {
        self.pieces.iter().map(|p| p.search.candidate_count()).sum()
    }

    /// One piece's total: `(count, floor)`, the floor when the budget or the
    /// memo cap stopped it or the total overflowed.
    pub fn count_piece(&self, piece: usize, memo: &mut Memo, node_budget: u64) -> (u128, bool, Stats) {
        let (total, saturated, stats) = self.pieces[piece].search.count(memo, node_budget);
        (total, saturated || stats.truncated, stats)
    }

    /// The total over every piece, a floor when any piece's was. `memos` is
    /// one per piece, kept by the caller so unranking can reuse them.
    pub fn count(&self, memos: &mut [Memo], node_budget: u64) -> (u128, bool, Stats) {
        let mut total: u128 = 0;
        let mut floor = false;
        let mut stats = Stats::default();
        for (i, memo) in memos.iter_mut().enumerate().take(self.pieces.len()) {
            let (n, f, s) = self.count_piece(i, memo, node_budget);
            total = match total.checked_add(n) {
                Some(t) => t,
                None => {
                    floor = true;
                    u128::MAX
                }
            };
            floor |= f;
            stats = merge(stats, s);
        }
        (total, floor, stats)
    }

    /// Enumerate every piece's results in order, calling `sink` with the piece
    /// and the class indices of each.
    pub fn enumerate<F>(&self, mut sink: F) -> Stats
    where
        F: FnMut(usize, &[u32]) -> Flow,
    {
        let mut stats = Stats::default();
        for (i, piece) in self.pieces.iter().enumerate() {
            let mut stopped = false;
            let s = piece.search.enumerate(|classes| {
                let flow = sink(i, classes);
                stopped = flow == Flow::Stop;
                flow
            });
            stats = merge(stats, s);
            if stopped {
                break;
            }
        }
        stats
    }

    /// The `index`-th result over the pieces, given each piece's exact total
    /// (`counts`, from [`Expanded::count_piece`]; a floor stops the walk at
    /// that piece, since what follows it has no index).
    pub fn nth(&self, memos: &mut [Memo], counts: &[(u128, bool)], mut index: u128) -> Option<(usize, Vec<u32>)> {
        for (i, &(count, floor)) in counts.iter().enumerate().take(self.pieces.len()) {
            if index < count {
                return self.pieces[i].search.nth(&mut memos[i], index).map(|classes| (i, classes));
            }
            if floor {
                return None;
            }
            index -= count;
        }
        None
    }

    /// A cursor at result 0 of the first piece.
    pub fn cursor(&self) -> MergedCursor {
        MergedCursor { piece: 0, cursor: None, row: Vec::new(), position: 0, stats: Stats::default(), stopped: false, done: false }
    }

    /// A cursor positioned so that its first `next` is result `index` over the
    /// pieces, by unranking (see [`Expanded::nth`] for `counts`).
    pub fn cursor_at(&self, memos: &mut [Memo], counts: &[(u128, bool)], index: u128) -> Option<MergedCursor> {
        let mut local = index;
        for (i, &(count, floor)) in counts.iter().enumerate().take(self.pieces.len()) {
            if local < count {
                let cursor = self.pieces[i].search.cursor_at(&mut memos[i], local)?;
                return Some(MergedCursor {
                    piece: i,
                    cursor: Some(cursor),
                    row: Vec::new(),
                    position: index,
                    stats: Stats::default(),
                    stopped: false,
                    done: false,
                });
            }
            if floor {
                return None;
            }
            local -= count;
        }
        None
    }

    /// A result as a row: spelled by its piece, each word tagged with its
    /// class, and written with each leet character where its letter went. The
    /// character goes to the first word, in row order, that still holds an
    /// unreplaced copy of its letter, once per occurrence in the text; that
    /// word is of class `leet`.
    pub fn row(&self, dict: &Dict, piece: usize, classes: &[u32]) -> Row {
        let p = &self.pieces[piece];
        let indices = p.search.spell_indices(dict, classes);
        let words: Vec<String> = indices.iter().map(|&i| p.search.word(dict, i).to_owned()).collect();
        let mut tags: Vec<Option<Class>> = indices.iter().map(|&i| p.search.class_of(dict, i)).collect();
        let mut written = words.clone();
        for leet in &p.reading {
            for _ in 0..leet.count {
                let Some((w, at)) = written.iter().enumerate().find_map(|(w, word)| word.find(leet.letter).map(|at| (w, at))) else {
                    break;
                };
                written[w].replace_range(at..at + leet.letter.len_utf8(), &leet.ch.to_string());
                tags[w] = Some(Class::Leet);
            }
        }
        Row { words, classes: tags, written, reading: p.reading.iter().map(|l| (l.ch, l.letter)).collect() }
    }
}

fn merge(a: Stats, b: Stats) -> Stats {
    Stats {
        candidates: a.candidates + b.candidates,
        nodes: a.nodes + b.nodes,
        subset_tests: a.subset_tests + b.subset_tests,
        memo_entries: a.memo_entries + b.memo_entries,
        memo_hits: a.memo_hits + b.memo_hits,
        emitted: a.emitted + b.emitted,
        truncated: a.truncated || b.truncated,
    }
}

/// A resumable enumeration over the pieces: one piece's [`Cursor`] at a time,
/// the next piece's when it ends.
pub struct MergedCursor {
    piece: usize,
    cursor: Option<Cursor>,
    row: Vec<u32>,
    position: u128,
    pub stats: Stats,
    stopped: bool,
    done: bool,
}

impl MergedCursor {
    /// Index of the result the next call to `next` will produce.
    pub fn position(&self) -> u128 {
        self.position
    }

    /// A piece's walk stopped at its node budget rather than at its end.
    pub fn truncated(&self) -> bool {
        self.stats.truncated
    }

    pub fn is_done(&self) -> bool {
        self.done
    }

    /// The next result as `(piece, class indices)`, or `None` when the pieces
    /// are over — check [`MergedCursor::truncated`] to learn which kind of over.
    pub fn next(&mut self, expanded: &Expanded) -> Option<(usize, &[u32])> {
        if self.done || self.stopped {
            return None;
        }
        loop {
            if self.piece >= expanded.pieces.len() {
                self.done = true;
                return None;
            }
            let search = &expanded.pieces[self.piece].search;
            let cursor = self.cursor.get_or_insert_with(|| search.cursor());
            match cursor.next(search) {
                Some(classes) => {
                    self.row.clear();
                    self.row.extend_from_slice(classes);
                    self.position += 1;
                    return Some((self.piece, &self.row));
                }
                None => {
                    if cursor.truncated() {
                        self.stats.truncated = true;
                        self.stopped = true;
                        return None;
                    }
                    self.stats = merge(self.stats, cursor.stats);
                    self.stats.truncated = false;
                    self.piece += 1;
                    self.cursor = None;
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dict::Tier;

    fn options(classes: u16) -> SolveOptions {
        SolveOptions { tier: Tier::Full, classes, min_word_len: 2, limit: 0, ..Default::default() }
    }

    fn dict() -> Dict {
        let terms = [
            ("1", Class::Shorthand.bit()),
            ("2", Class::Shorthand.bit()),
            ("u", Class::Shorthand.bit()),
            ("b8", Class::Blends.bit()),
            ("gr8", Class::Blends.bit()),
            ("&", Class::Symbols.bit()),
            ("wtf", Class::Acronyms.bit()),
        ];
        Dict::from_words_and_terms(["hakes", "shake", "link", "blink", "kiln", "two", "sad", "ads", "seven", "even", "vent", "net"], terms).unwrap()
    }

    fn rows(dict: &Dict, expanded: &Expanded) -> Vec<Row> {
        let mut out = Vec::new();
        expanded.enumerate(|piece, classes| {
            out.push(expanded.row(dict, piece, classes));
            Flow::Continue
        });
        out
    }

    #[test]
    fn no_leet_is_one_piece_and_no_reading() {
        let dict = dict();
        let expanded = Expanded::prepare(&dict, "Ke$ha", options(0), &[]).unwrap();
        assert_eq!(expanded.pieces.len(), 1);
        assert!(expanded.leet.is_empty());
        let mut memos = vec![Memo::new()];
        assert_eq!(expanded.count(&mut memos, u64::MAX).0, 0);
        assert_eq!(expanded.unused(), "$");
        assert!(rows(&dict, &expanded).is_empty());
    }

    #[test]
    fn leet_tries_each_letter_and_writes_the_character_where_it_went() {
        let dict = dict();
        let expanded = Expanded::prepare(&dict, "Ke$ha", options(0), &['$']).unwrap();
        assert_eq!(expanded.pieces.len(), 2);
        assert_eq!(expanded.leet, ['$']);
        assert_eq!(expanded.unused(), "");
        let mut memos = vec![Memo::new(), Memo::new()];
        let (total, floor, _) = expanded.count(&mut memos, u64::MAX);
        assert_eq!((total, floor), (1, false), "hakes/shake is one class");
        let found = rows(&dict, &expanded);
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].words, ["hakes"]);
        assert_eq!(found[0].written, ["hake$"]);
        assert_eq!(found[0].classes, [Some(Class::Leet)]);
        assert_eq!(found[0].reading, [('$', 's')]);

        // The same row alone under the fixed reading, as one piece.
        let fixed = Expanded::prepare(&dict, &read_input("Ke$ha", &[("$".into(), "s".into())]), options(0), &[]).unwrap();
        assert_eq!(fixed.pieces.len(), 1);
        assert_eq!(rows(&dict, &fixed)[0].words, ["hakes"]);
        assert!(rows(&dict, &fixed)[0].reading.is_empty(), "a fixed reading is the caller's to record");

        // The text itself is never a result, under any reading: "Se7en" under
        // v is `seven`, a word with no other spelling, so that piece has nothing.
        let seven = Expanded::prepare(&dict, "Se7en", options(0), &['7']).unwrap();
        assert_eq!(seven.pieces.len(), 3);
        assert!(seven.text_left_out());
        assert!(rows(&dict, &seven).is_empty());
    }

    #[test]
    fn nth_and_the_cursor_walk_the_pieces_in_order() {
        // `7` reads as t or v: the pool `a7e` is nothing as typed, `ate` under
        // t and `ave` under v, three results each, so the list has two pieces
        // with results and every index has to find its piece.
        let dict = Dict::from_words(["ate", "tea", "at", "ta", "a", "t", "e", "ave", "eva", "av", "v"]).unwrap();
        let options = SolveOptions { min_word_len: 1, ..options(0) };
        let expanded = Expanded::prepare(&dict, "a7e", options, &['7']).unwrap();
        assert_eq!(expanded.pieces.len(), 3);
        let mut memos: Vec<Memo> = (0..expanded.pieces.len()).map(|_| Memo::new()).collect();
        let counts: Vec<(u128, bool)> = (0..expanded.pieces.len())
            .map(|i| {
                let (n, f, _) = expanded.count_piece(i, &mut memos[i], u64::MAX);
                (n, f)
            })
            .collect();
        assert_eq!(counts, [(0, false), (3, false), (3, false)]);
        assert_eq!(expanded.count(&mut memos, u64::MAX).0, 6);
        let listed = rows(&dict, &expanded);
        assert_eq!(listed.len(), 6);
        // The text itself, `ate` under t, shows its other spelling; the `7` goes where the t went.
        assert!(listed.iter().any(|r| r.words == ["tea"] && r.written == ["7ea"] && r.reading == [('7', 't')]), "{listed:?}");
        assert!(listed.iter().any(|r| r.words == ["eva"] && r.written == ["e7a"] && r.reading == [('7', 'v')]), "{listed:?}");
        assert!(listed.iter().any(|r| r.words == ["at", "e"] && r.written == ["a7", "e"] && r.classes == [Some(Class::Leet), None]), "{listed:?}");
        for (i, row) in listed.iter().enumerate() {
            let (piece, classes) = expanded.nth(&mut memos, &counts, i as u128).unwrap();
            assert_eq!(&expanded.row(&dict, piece, &classes), row, "result {i}");
            let mut cursor = expanded.cursor_at(&mut memos, &counts, i as u128).unwrap();
            assert_eq!(cursor.position(), i as u128);
            let (piece, classes) = cursor.next(&expanded).unwrap();
            assert_eq!(&expanded.row(&dict, piece, classes), row, "cursor at {i}");
        }
        assert!(expanded.nth(&mut memos, &counts, 6).is_none());
        assert!(expanded.cursor_at(&mut memos, &counts, 6).is_none());
        let mut cursor = expanded.cursor();
        let mut walked = 0;
        while cursor.next(&expanded).is_some() {
            walked += 1;
        }
        assert_eq!(walked, 6);
        assert!(cursor.is_done() && !cursor.truncated());
        assert!(expanded.text_left_out() == false, "the text's row was respelled, not dropped");
    }

    #[test]
    fn at_most_three_characters_expand() {
        let dict = dict();
        let expanded = Expanded::prepare(&dict, "a 1 2 3 4", options(0), &['1', '2', '3', '4']).unwrap();
        assert_eq!(expanded.leet, ['1', '2', '3']);
        // 1 has two letters, 2 and 3 one each: (1+2) × 2 × 2 pieces.
        assert_eq!(expanded.pieces.len(), 12);
        assert_eq!(expanded.unused(), "4");
    }
}
