//! 26-letter multiset, packed into four `u64` lanes.
//!
//! The sub-multiset test ("does this word fit in what's left?") is by far the
//! hottest operation in the search — tens of millions of calls on a hard query —
//! so the representation is chosen entirely around making it branch-free.
//!
//! Counts live one per byte, 26 used and 6 zero padding. Because every count is
//! well under 128, a whole lane can be tested at once with the standard SWAR
//! borrow trick:
//!
//! ```text
//! ((rem | 0x8080..) - word) & 0x8080.. == 0x8080..
//! ```
//!
//! For each byte lane, `rem | 0x80` is `rem + 0x80` (the high bit is clear), so
//! the subtraction lands in `[1, 255]` and can never borrow into the next lane.
//! The high bit survives exactly when `rem >= word`. Eight letters per
//! instruction, no branches, and it is portable — the same code is correct on
//! wasm, arm64 and x86.

use core::fmt;

const HIGH: u64 = 0x8080_8080_8080_8080;

/// Letter multiset. Byte `i` of lane `i / 8` holds the count of letter `i`.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct Counts(pub [u64; 4]);

impl Counts {
    pub const EMPTY: Counts = Counts([0; 4]);

    /// Build from a normalized `[a-z]` string. Returns `None` if any byte is
    /// out of range or a single letter appears more than 127 times.
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

    /// Count of `letter`, where 0 is 'a'.
    #[inline]
    pub fn get(self, letter: usize) -> u8 {
        debug_assert!(letter < 26);
        (self.0[letter >> 3] >> ((letter & 7) * 8)) as u8
    }

    #[inline]
    pub fn is_empty(self) -> bool {
        self.0 == [0; 4]
    }

    /// Total number of letters.
    #[inline]
    pub fn total(self) -> u32 {
        // Counts are < 128, and 26 of them sum to well under u32::MAX, so the
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

    /// True when every letter of `self` is available in `rem`.
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

    /// 26-bit mask of which letters are present at all.
    #[inline]
    pub fn mask(self) -> u32 {
        let mut m = 0u32;
        for letter in 0..26 {
            if self.get(letter) != 0 {
                m |= 1 << letter;
            }
        }
        m
    }

    /// The scarcest letter still remaining, or `None` when empty.
    ///
    /// This is the pivot of the whole search: every solution must cover this
    /// letter, so only words containing it need to be considered. Ties break to
    /// the lowest letter index, which keeps the choice a deterministic function
    /// of the state — required for both memoization and canonical ordering.
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
                let letter = lane_index * 8 + byte;
                if letter >= 26 {
                    break;
                }
                let count = (lane >> (byte * 8)) as u8;
                if count != 0 && count < best_count {
                    best_count = count;
                    best = letter;
                }
            }
        }
        (best_count != u8::MAX).then_some(best)
    }
}

impl fmt::Debug for Counts {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("Counts(\"")?;
        for letter in 0..26 {
            for _ in 0..self.get(letter) {
                write!(f, "{}", (b'a' + letter as u8) as char)?;
            }
        }
        f.write_str("\")")
    }
}

/// Text -> the `[a-z]` letters the search uses.
///
/// Every accented letter is forced to its unaccented base letter, so "Beyoncé"
/// has three e's. The mapping is the generated table in `fold_table.rs`:
/// Unicode NFKD over the Latin blocks (decompose, drop the combining marks,
/// keep the ASCII letters) plus a hand-written list for the Latin letters
/// that have no decomposition: ß -> ss, æ -> ae, œ -> oe, ø -> o, đ -> d,
/// ł -> l, þ -> th, ð -> d, ı -> i. Anything else that is not a Latin letter
/// — punctuation, spaces, digits, other scripts, emoji — is dropped.
///
/// A table rather than a normalization crate because the same tables would
/// add ~50 KB to the compressed WASM payload. The tests below check the table
/// against `unicode-normalization` over the covered ranges, and the TypeScript
/// side (`packages/engine/src/fold.ts`) carries the identical generated table
/// and checks it against the browser's NFKD, so the two cannot drift.
pub fn normalize(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for c in input.chars() {
        if c.is_ascii() {
            if c.is_ascii_alphabetic() {
                out.push(c.to_ascii_lowercase());
            }
            continue;
        }
        if let Some(folded) = fold_char(c) {
            out.push_str(folded);
        }
    }
    out
}

/// Text -> its words, each folded as [`normalize`] folds: what the text is made
/// of before the search forgets where its spaces were.
///
/// Split on whitespace only. A hyphen or an apostrophe carries no letters, so
/// "apple-sauce" is the one word `applesauce`; a piece that folds to nothing
/// ("&", "2026") is not a word at all and is left out. Whitespace is Unicode
/// White_Space plus U+FEFF, which is what `foldWords` in
/// `packages/engine/src/fold.ts` splits on, so the two sides agree.
pub fn text_words(input: &str) -> Vec<String> {
    input
        .split(|c: char| c.is_whitespace() || c == '\u{feff}')
        .map(normalize)
        .filter(|word| !word.is_empty())
        .collect()
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
    fn normalize_strips_everything_but_letters() {
        assert_eq!(normalize("Ryan Joseph Kamp"), "ryanjosephkamp");
        assert_eq!(normalize("Route 66!"), "route");
        assert_eq!(normalize("O'Brien-Smith"), "obriensmith");
        assert_eq!(normalize(""), "");
        assert_eq!(normalize("1234!!"), "");
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
            ("Ben Shelton 🎾 2026", "benshelton"),
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
            ("apple & sauce 2026".into(), vec!["apple", "sauce"]),
            ("Beyoncé Knowles".into(), vec!["beyonce", "knowles"]),
            ("Straße 9".into(), vec!["strasse"]),
            (between(0xa0), vec!["apple", "sauce"]),
            (between(0x85), vec!["apple", "sauce"]),
            (between(0x2028), vec!["apple", "sauce"]),
            (between(0x3000), vec!["apple", "sauce"]),
            (between(0xfeff), vec!["apple", "sauce"]),
            (between(0x200b), vec!["applesauce"]),
            (String::new(), vec![]),
            ("1234 !!".into(), vec![]),
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
