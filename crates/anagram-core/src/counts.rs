//! The pool as a multiset: 32 slots packed into four `u64` lanes.
//!
//! The sub-multiset test ("does this word fit in what's left?") is by far the
//! hottest operation in the search — tens of millions of calls on a hard query —
//! so the representation is chosen entirely around making it branch-free.
//!
//! Counts live one per byte. Slots 0 to 25 are the letters; slots 26 to 31
//! are given, per query, to the text's own digits and symbols (the literal
//! rule, roadmap phase N3: `Blink-182` is the pool `b l i n k 1 8 2`, and a
//! term of an anagram uses a `1` as a `1`). A [`Slots`] names which character
//! each of the six holds, in order of first appearance; a text with more than
//! six distinct digits and symbols is refused. The dictionary's own vectors
//! never use those slots (a word is letters), so widening the pool cost the
//! search nothing: same lanes, same test, same memo keys.
//!
//! Because every count is well under 128, a whole lane can be tested at once
//! with the standard SWAR borrow trick:
//!
//! ```text
//! ((rem | 0x8080..) - word) & 0x8080.. == 0x8080..
//! ```
//!
//! For each byte lane, `rem | 0x80` is `rem + 0x80` (the high bit is clear), so
//! the subtraction lands in `[1, 255]` and can never borrow into the next lane.
//! The high bit survives exactly when `rem >= word`. Eight slots per
//! instruction, no branches, and it is portable — the same code is correct on
//! wasm, arm64 and x86.

use core::fmt;

const HIGH: u64 = 0x8080_8080_8080_8080;

/// Slots 0 to 25.
pub const LETTERS: usize = 26;
/// Every slot: the letters and the six a query gives its own characters.
pub const SLOTS: usize = 32;
/// How many distinct digits and symbols one query may hold.
pub const EXTRA_SLOTS: usize = SLOTS - LETTERS;

/// The query's digits and symbols, one slot each from 26 up, in order of
/// first appearance in the text. Empty for a text of letters alone.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Slots {
    chars: Vec<char>,
}

impl Slots {
    pub fn new() -> Slots {
        Slots::default()
    }

    /// The slot `c` holds, if it holds one.
    #[inline]
    pub fn slot_of(&self, c: char) -> Option<usize> {
        self.chars.iter().position(|&held| held == c).map(|i| LETTERS + i)
    }

    /// The slot for `c`, given one if it has none yet; `None` when all six
    /// are taken.
    pub fn assign(&mut self, c: char) -> Option<usize> {
        if let Some(slot) = self.slot_of(c) {
            return Some(slot);
        }
        if self.chars.len() >= EXTRA_SLOTS {
            return None;
        }
        self.chars.push(c);
        Some(LETTERS + self.chars.len() - 1)
    }

    /// The character slot `slot` holds, for a slot from 26 up.
    pub fn char_at(&self, slot: usize) -> Option<char> {
        slot.checked_sub(LETTERS).and_then(|i| self.chars.get(i).copied())
    }

    /// The characters, in slot order.
    pub fn chars(&self) -> &[char] {
        &self.chars
    }

    pub fn is_empty(&self) -> bool {
        self.chars.is_empty()
    }
}

/// Why a text is not a pool.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PoolError {
    /// One character occurs more than 127 times, which is more than a count
    /// byte can hold. Carries the character.
    TooManyRepeats(char),
    /// More than six distinct digits and symbols.
    TooManyCharacters,
    /// A character that is neither a letter nor a digit or symbol of the pool:
    /// `normalize` never emits one, so this is a caller's mistake.
    NotPool(char),
}

/// The slot a pool character takes: a letter its own, anything else what the
/// query's `Slots` gave it.
#[inline]
fn slot_for(c: char, slots: &Slots) -> Option<usize> {
    if c.is_ascii_lowercase() {
        Some(c as usize - 'a' as usize)
    } else {
        slots.slot_of(c)
    }
}

/// The pool as a multiset. Byte `i` of lane `i / 8` holds the count of slot `i`.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct Counts(pub [u64; 4]);

impl Counts {
    pub const EMPTY: Counts = Counts([0; 4]);

    /// Build from a normalized `[a-z]` string: a dictionary word. Returns
    /// `None` if any byte is out of range or a single letter appears more
    /// than 127 times.
    pub fn from_word(word: &str) -> Option<Counts> {
        let mut bytes = [0u8; 32];
        for &b in word.as_bytes() {
            if !b.is_ascii_lowercase() {
                return None;
            }
            let slot = &mut bytes[(b - b'a') as usize];
            *slot = slot.checked_add(1)?;
            if *slot > 127 {
                return None;
            }
        }
        Some(Counts::from_bytes(&bytes))
    }

    /// Build from a pool string as [`normalize`] gives it, giving each digit
    /// and symbol a slot in `slots` as it first appears. The text's own pool.
    pub fn from_pool(text: &str, slots: &mut Slots) -> Result<Counts, PoolError> {
        let mut bytes = [0u8; 32];
        for c in text.chars() {
            let slot = if c.is_ascii_lowercase() {
                c as usize - 'a' as usize
            } else if is_pool_char(c) {
                slots.assign(c).ok_or(PoolError::TooManyCharacters)?
            } else {
                return Err(PoolError::NotPool(c));
            };
            bytes[slot] += 1;
            if bytes[slot] > 127 {
                return Err(PoolError::TooManyRepeats(c));
            }
        }
        Ok(Counts::from_bytes(&bytes))
    }

    /// A term's counts under the query's slots: `None` when a character of
    /// the term has no slot, since then the term cannot fit the pool anyway,
    /// or when a character repeats past 127.
    pub fn in_slots(text: &str, slots: &Slots) -> Option<Counts> {
        let mut bytes = [0u8; 32];
        for c in text.chars() {
            let slot = slot_for(c, slots)?;
            bytes[slot] += 1;
            if bytes[slot] > 127 {
                return None;
            }
        }
        Some(Counts::from_bytes(&bytes))
    }

    #[inline]
    pub fn from_bytes(bytes: &[u8; 32]) -> Counts {
        let mut lanes = [0u64; 4];
        for (lane, chunk) in lanes.iter_mut().zip(bytes.chunks_exact(8)) {
            *lane = u64::from_le_bytes(chunk.try_into().unwrap());
        }
        Counts(lanes)
    }

    #[inline]
    pub fn to_bytes(self) -> [u8; 32] {
        let mut out = [0u8; 32];
        for (i, lane) in self.0.iter().enumerate() {
            out[i * 8..i * 8 + 8].copy_from_slice(&lane.to_le_bytes());
        }
        out
    }

    /// Count of `slot`, where 0 is 'a' and 26 up are the query's own characters.
    #[inline]
    pub fn get(self, slot: usize) -> u8 {
        debug_assert!(slot < SLOTS);
        (self.0[slot >> 3] >> ((slot & 7) * 8)) as u8
    }

    #[inline]
    pub fn is_empty(self) -> bool {
        self.0 == [0; 4]
    }

    /// Total number of characters.
    #[inline]
    pub fn total(self) -> u32 {
        // Counts are < 128, and 32 of them sum to well under u32::MAX, so the
        // per-lane byte sum cannot overflow a u64 accumulator.
        let mut sum = 0u32;
        for lane in self.0 {
            let mut l = lane;
            while l != 0 {
                sum += (l & 0xff) as u32;
                l >>= 8;
            }
        }
        sum
    }

    /// True when every character of `self` is available in `rem`.
    #[inline(always)]
    pub fn fits_in(self, rem: Counts) -> bool {
        // Unrolled deliberately: the compiler keeps all eight values in
        // registers and the early return usually fires on lane 0 or 1.
        ((rem.0[0] | HIGH).wrapping_sub(self.0[0])) & HIGH == HIGH
            && ((rem.0[1] | HIGH).wrapping_sub(self.0[1])) & HIGH == HIGH
            && ((rem.0[2] | HIGH).wrapping_sub(self.0[2])) & HIGH == HIGH
            && ((rem.0[3] | HIGH).wrapping_sub(self.0[3])) & HIGH == HIGH
    }

    /// Lane-wise subtraction. Only valid when `other.fits_in(self)`.
    #[inline(always)]
    pub fn sub(self, other: Counts) -> Counts {
        debug_assert!(other.fits_in(self));
        Counts([
            self.0[0].wrapping_sub(other.0[0]),
            self.0[1].wrapping_sub(other.0[1]),
            self.0[2].wrapping_sub(other.0[2]),
            self.0[3].wrapping_sub(other.0[3]),
        ])
    }

    #[inline]
    pub fn add(self, other: Counts) -> Counts {
        Counts([
            self.0[0].wrapping_add(other.0[0]),
            self.0[1].wrapping_add(other.0[1]),
            self.0[2].wrapping_add(other.0[2]),
            self.0[3].wrapping_add(other.0[3]),
        ])
    }

    /// 32-bit mask of which slots are present at all.
    #[inline]
    pub fn mask(self) -> u32 {
        let mut m = 0u32;
        for slot in 0..SLOTS {
            if self.get(slot) != 0 {
                m |= 1 << slot;
            }
        }
        m
    }

    /// The scarcest slot still remaining, or `None` when empty.
    ///
    /// This is the pivot of the whole search: every solution must cover this
    /// character, so only candidates containing it need to be considered. Ties
    /// break to the lowest slot index, which keeps the choice a deterministic
    /// function of the state — required for both memoization and canonical
    /// ordering. A digit or symbol usually is the rarest, so a pool with one
    /// that no candidate covers dies at the root.
    #[inline]
    pub fn rarest(self) -> Option<usize> {
        let mut best = 0usize;
        let mut best_count = u8::MAX;
        for lane_index in 0..4 {
            let lane = self.0[lane_index];
            if lane == 0 {
                continue;
            }
            for byte in 0..8 {
                let slot = lane_index * 8 + byte;
                let count = (lane >> (byte * 8)) as u8;
                if count != 0 && count < best_count {
                    best_count = count;
                    best = slot;
                }
            }
        }
        (best_count != u8::MAX).then_some(best)
    }
}

impl fmt::Debug for Counts {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("Counts(\"")?;
        for letter in 0..LETTERS {
            for _ in 0..self.get(letter) {
                write!(f, "{}", (b'a' + letter as u8) as char)?;
            }
        }
        for slot in LETTERS..SLOTS {
            for _ in 0..self.get(slot) {
                write!(f, "#{}", slot - LETTERS)?;
            }
        }
        f.write_str("\")")
    }
}

/// Text -> the pool the search uses: the letters as `[a-z]`, and the digits
/// and symbols of the set as themselves.
///
/// Every accented letter is forced to its unaccented base letter, so "Beyoncé"
/// has three e's. The mapping is the generated table in `fold_table.rs`:
/// Unicode NFKD over the Latin blocks (decompose, drop the combining marks,
/// keep the ASCII letters) plus a hand-written list for the Latin letters
/// that have no decomposition: ß -> ss, æ -> ae, œ -> oe, ø -> o, đ -> d,
/// ł -> l, þ -> th, ð -> d, ı -> i. A digit, or one of `@ $ & % + #` wherever
/// it stands (`!` and `?` inside a word), is a character of the pool and stays as itself
/// (`readings.rs`, the literal rule): "Blink-182" is `blink182`, "Ke$ha" is
/// `ke$ha`, and a term of an anagram uses each as itself. A reader may read
/// one as a letter (`$` as s) or leave it out; that is [`normalize_with`].
/// Anything else that is not a Latin letter — punctuation, spaces, other
/// scripts, emoji — is dropped.
///
/// A table rather than a normalization crate because the same tables would
/// add ~50 KB to the compressed WASM payload. The tests below check the table
/// against `unicode-normalization` over the covered ranges, and the TypeScript
/// side (`packages/engine/src/fold.ts`) carries the identical generated table
/// and checks it against the browser's NFKD, so the two cannot drift.
pub fn normalize(input: &str) -> String {
    normalize_with(input, &[])
}

/// [`normalize`] with the reader's own readings of the input's digits and
/// symbols (`readings.rs`): `("4", "drop")` leaves the 4 of "Reacher season 4"
/// out, `("$", "s")` reads the `$` of "Ke$ha" as an s.
pub fn normalize_with(input: &str, readings: &[(String, String)]) -> String {
    let read = crate::readings::read_input(input, readings);
    let mut out = String::with_capacity(read.len());
    for c in read.chars() {
        if c.is_ascii() {
            if c.is_ascii_alphabetic() {
                out.push(c.to_ascii_lowercase());
            } else if is_pool_char(c) {
                // The reading step left it in, so it is an item read as itself.
                out.push(c);
            }
            continue;
        }
        if let Some(folded) = fold_char(c) {
            out.push_str(folded);
        }
    }
    out
}

/// Whether a character is a digit or a symbol of the pool's set, whatever
/// stands around it. `read_input` has already dropped a `!` or `?` that was
/// punctuation, so after it every such character is an item.
pub fn is_pool_char(c: char) -> bool {
    c.is_ascii_digit() || crate::readings::symbol(c).is_some()
}

/// Text -> its words, each folded as [`normalize`] folds: what the text is made
/// of before the search forgets where its spaces were.
///
/// Split on whitespace only. A hyphen or an apostrophe carries no letters, so
/// "apple-sauce" is the one word `applesauce`; a piece that folds to nothing
/// ("!!", "—") is not a word at all and is left out, while "&" and "2026" are
/// tokens of the pool. Whitespace is Unicode
/// White_Space plus U+FEFF, which is what `foldWords` in
/// `packages/engine/src/fold.ts` splits on, so the two sides agree.
pub fn text_words(input: &str) -> Vec<String> {
    text_words_with(input, &[])
}

/// [`text_words`] with the reader's own readings: the tokens of "Area 51" are
/// `area` and `51`, and under `("5", "drop")` `area` and `1`.
pub fn text_words_with(input: &str, readings: &[(String, String)]) -> Vec<String> {
    crate::readings::read_input(input, readings)
        .split(|c: char| c.is_whitespace() || c == '\u{feff}')
        .map(normalize)
        .filter(|word| !word.is_empty())
        .collect()
}

/// Whether a non-ASCII character folds to letters: the reading step's test
/// for "a letter on both sides".
pub(crate) fn folds_to_letters(c: char) -> bool {
    !c.is_ascii() && fold_char(c).is_some()
}

/// The table entry for a non-ASCII character, if it folds to any letters.
fn fold_char(c: char) -> Option<&'static str> {
    let table = &crate::fold_table::FOLD;
    table
        .binary_search_by_key(&c, |&(ch, _)| ch)
        .ok()
        .map(|i| table[i].1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fits_and_sub_round_trip() {
        let big = Counts::from_word("dormitory").unwrap();
        let part = Counts::from_word("dirty").unwrap();
        assert!(part.fits_in(big));
        let rest = big.sub(part);
        assert_eq!(rest, Counts::from_word("room").unwrap());
        assert_eq!(rest.add(part), big);
    }

    #[test]
    fn fits_rejects_missing_letter() {
        let have = Counts::from_word("listen").unwrap();
        assert!(!Counts::from_word("silentz").unwrap().fits_in(have));
        assert!(!Counts::from_word("ll").unwrap().fits_in(have));
    }

    #[test]
    fn fits_checks_every_lane() {
        // One letter per lane boundary: h(7) is the last byte of lane 0,
        // p(15) of lane 1, x(23) of lane 2, z(25) sits in lane 3.
        for word in ["h", "p", "x", "z"] {
            let c = Counts::from_word(word).unwrap();
            assert!(c.fits_in(c));
            assert!(!c.fits_in(Counts::EMPTY), "{word} should not fit in empty");
        }
        // And the six slots of lane 3 past z.
        let mut slots = Slots::new();
        let pool = Counts::from_pool("1234$&", &mut slots).unwrap();
        assert_eq!(slots.chars(), &['1', '2', '3', '4', '$', '&']);
        assert_eq!(pool.get(31), 1);
        assert!(pool.fits_in(pool));
        assert!(!pool.fits_in(Counts::from_pool("1234", &mut slots.clone()).unwrap()));
    }

    #[test]
    fn a_pool_gives_its_characters_slots_in_order_of_appearance() {
        let mut slots = Slots::new();
        let pool = Counts::from_pool("blink182", &mut slots).unwrap();
        assert_eq!(slots.chars(), &['1', '8', '2']);
        assert_eq!((pool.get(26), pool.get(27), pool.get(28)), (1, 1, 1));
        assert_eq!(pool.total(), 8);
        // Ties break to the lowest slot, so `b` (slot 1) is the pivot here; with the
        // letters doubled the digit is, and a words-only search dies at the root.
        assert_eq!(pool.rarest(), Some(1));
        assert_eq!(Counts::from_pool("bblliinnkk1", &mut Slots::new()).unwrap().rarest(), Some(26));
        assert_eq!(pool.mask() >> 26, 0b111);
        assert_eq!(format!("{pool:?}"), "Counts(\"bikln#0#1#2\")");

        // A term is counted through the query's slots; a character without one cannot fit.
        assert_eq!(Counts::in_slots("b8", &slots).unwrap().get(27), 1);
        assert_eq!(Counts::in_slots("b8", &slots).unwrap().get(1), 1);
        assert!(Counts::in_slots("b8", &slots).unwrap().fits_in(pool));
        assert_eq!(Counts::in_slots("b9", &slots), None);
        assert_eq!(Counts::in_slots("link", &slots), Counts::from_word("link"));

        // Six distinct digits and symbols fit; a seventh does not.
        let mut six = Slots::new();
        assert!(Counts::from_pool("012345", &mut six).is_ok());
        assert_eq!(Counts::from_pool("0123456", &mut Slots::new()), Err(PoolError::TooManyCharacters));
        assert_eq!(Counts::from_pool("a-b", &mut Slots::new()), Err(PoolError::NotPool('-')));
        assert_eq!(Counts::from_pool(&"1".repeat(128), &mut Slots::new()), Err(PoolError::TooManyRepeats('1')));
        assert_eq!(Counts::from_pool(&"a".repeat(128), &mut Slots::new()), Err(PoolError::TooManyRepeats('a')));
        assert_eq!(Counts::from_word("b8"), None, "a dictionary word is letters");
    }

    #[test]
    fn rarest_picks_scarcest_letter() {
        // "banana": a=3 b=1 n=2 -> b is scarcest
        assert_eq!(Counts::from_word("banana").unwrap().rarest(), Some(1));
        // ties break low: "ab" -> a
        assert_eq!(Counts::from_word("ab").unwrap().rarest(), Some(0));
        assert_eq!(Counts::EMPTY.rarest(), None);
    }

    #[test]
    fn total_and_mask() {
        let c = Counts::from_word("banana").unwrap();
        assert_eq!(c.total(), 6);
        assert_eq!(c.mask(), (1 << 0) | (1 << 1) | (1 << 13));
    }

    #[test]
    fn normalize_keeps_letters_digits_and_the_symbols_of_the_set() {
        assert_eq!(normalize("Ryan Joseph Kamp"), "ryanjosephkamp");
        // A number is a run of pool characters, and a closing exclamation mark is punctuation.
        assert_eq!(normalize("Route 66!"), "route66");
        assert_eq!(normalize("O'Brien-Smith"), "obriensmith");
        assert_eq!(normalize(""), "");
        assert_eq!(normalize("1234!!"), "1234");
        assert_eq!(normalize("Blink-182"), "blink182");
        assert_eq!(normalize("Ke$ha"), "ke$ha");
        assert_eq!(normalize("P!nk wh?t Hello! what?"), "p!nkwh?thellowhat");
        assert_eq!(normalize("AT&T C++ 50% #1 @home $5"), "at&tc++50%#1@home$5");
        assert_eq!(normalize_with("1234!!", &[("1".into(), "drop".into()), ("2".into(), "drop".into())]), "34");
        assert_eq!(normalize_with("Ke$ha", &[("$".into(), "s".into())]), "kesha");
        assert_eq!(normalize_with("Reacher season 4", &[("4".into(), "drop".into())]), "reacherseason");
    }

    /// Mirrors FOLD_CASES in `packages/engine/test/fold.test.ts`. The two
    /// implementations have to agree byte for byte or a word silently fails
    /// to match the dictionary.
    #[test]
    fn normalize_folds_accents_to_base_letters() {
        let cases = [
            ("Beyoncé Knowles", "beyonceknowles"),
            ("Penélope Cruz", "penelopecruz"),
            ("Zoë Kravitz", "zoekravitz"),
            ("Renée Zellweger", "reneezellweger"),
            ("Björk", "bjork"),
            ("Motörhead", "motorhead"),
            ("Straße", "strasse"),
            ("Ærø", "aero"),
            ("Łódź", "lodz"),
            ("Þórður", "thordur"),
            ("İstanbul", "istanbul"),
            ("Ben Shelton 🎾 2026", "benshelton2026"),
            ("Владимир", ""),
            ("東京", ""),
            // The dictionary build's two accented surfaces.
            ("norteño", "norteno"),
            ("peléan", "pelean"),
        ];
        for (input, expected) in cases {
            assert_eq!(normalize(input), expected, "{input:?}");
        }
    }

    /// Mirrors WORD_CASES in `packages/engine/test/fold.test.ts`: the worker
    /// sends the engine the words it split, and the CLI lets the engine split
    /// them, so the two have to find the same words in the same text.
    #[test]
    fn text_words_are_split_on_whitespace_alone() {
        let at = |code: u32| char::from_u32(code).unwrap();
        let between = |code: u32| format!("apple{}sauce", at(code));
        let cases: Vec<(String, Vec<&str>)> = vec![
            ("apple sauce".into(), vec!["apple", "sauce"]),
            ("  Apple\tSAUCE\n".into(), vec!["apple", "sauce"]),
            ("applesauce".into(), vec!["applesauce"]),
            ("apple-sauce".into(), vec!["applesauce"]),
            ("O'Brien Smith".into(), vec!["obrien", "smith"]),
            ("apple & sauce 2026".into(), vec!["apple", "&", "sauce", "2026"]),
            ("Beyoncé Knowles".into(), vec!["beyonce", "knowles"]),
            ("Straße 9".into(), vec!["strasse", "9"]),
            (between(0xa0), vec!["apple", "sauce"]),
            (between(0x85), vec!["apple", "sauce"]),
            (between(0x2028), vec!["apple", "sauce"]),
            (between(0x3000), vec!["apple", "sauce"]),
            (between(0xfeff), vec!["apple", "sauce"]),
            (between(0x200b), vec!["applesauce"]),
            (String::new(), vec![]),
            ("1234 !!".into(), vec!["1234"]),
            ("!! ??".into(), vec![]),
            ("Blink-182 Ke$ha".into(), vec!["blink182", "ke$ha"]),
        ];
        for (input, expected) in &cases {
            assert_eq!(&text_words(input), expected, "{input:?}");
            assert_eq!(text_words(input).concat(), normalize(input), "{input:?}: the words are the letters");
        }

        // Unicode White_Space plus U+FEFF, and nothing else: the list the
        // TypeScript side spells out in its regular expression.
        let breaks: [u32; 26] = [
            0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20, 0x85, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
            0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff,
        ];
        for code in 0..=0x10ffffu32 {
            let Some(c) = char::from_u32(code) else { continue };
            let words = text_words(&format!("a{c}b"));
            assert_eq!(words.len() == 2, breaks.contains(&code), "U+{code:04X}");
        }
    }

    /// The generated table must equal NFKD-derived folding over every code
    /// point it claims to cover, and must be sorted (it is binary-searched).
    #[test]
    fn fold_table_matches_nfkd_over_its_ranges() {
        use unicode_normalization::char::is_combining_mark;
        use unicode_normalization::UnicodeNormalization;

        let table = &crate::fold_table::FOLD;
        assert!(table.windows(2).all(|w| w[0].0 < w[1].0), "table must be sorted");

        let special = |c: char| -> Option<&'static str> {
            Some(match c {
                'ß' | 'ẞ' => "ss",
                'æ' | 'Æ' => "ae",
                'œ' | 'Œ' => "oe",
                'ø' | 'Ø' => "o",
                'đ' | 'Đ' => "d",
                'ł' | 'Ł' => "l",
                'þ' | 'Þ' => "th",
                'ð' | 'Ð' => "d",
                'ı' => "i",
                _ => return None,
            })
        };

        for &(lo, hi) in &crate::fold_table::RANGES {
            for cp in lo..=hi {
                let Some(c) = char::from_u32(cp) else { continue };
                let expected: String = match special(c) {
                    Some(s) => s.to_owned(),
                    None => c
                        .nfkd()
                        .filter(|&p| !is_combining_mark(p))
                        .filter(char::is_ascii_alphabetic)
                        .map(|p| p.to_ascii_lowercase())
                        .collect(),
                };
                let actual = super::fold_char(c).unwrap_or("");
                assert_eq!(actual, expected, "U+{cp:04X} {c:?}");
            }
        }
        // And nothing in the table lies outside the ranges.
        for &(c, _) in table.iter() {
            let cp = c as u32;
            assert!(
                crate::fold_table::RANGES.iter().any(|&(lo, hi)| (lo..=hi).contains(&cp)),
                "U+{cp:04X} is in the table but outside every range"
            );
        }
    }
}
