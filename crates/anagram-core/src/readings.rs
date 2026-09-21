//! The items of an input, and how each stands: a run of digits (`182`, `1,000`
//! with its separators), a run of digits with its ordinal suffix (`9th`,
//! `21st`), or one of the symbols in the table (`@ $ ! ? & % + #`; `!` and
//! `?` only inside a word, where they are characters rather than marks).
//!
//! The literal rule (roadmap phase N, decisions D62 and D63, accepted
//! 2026-09-21): an anagram rearranges what was typed, and nothing is
//! converted. A number is never read as its name, and a symbol never as a
//! letter or a word. Until the literal phase (N3) counts digits and symbols
//! as characters of the pool, every item is **left out** of the letters, which
//! is `drop`, the one reading this module offers; `normalize` and
//! `text_words` apply it. The written form (`182:drop`), the record field and
//! the item finder stay for N3, which adds `self` and the leet readings.
//!
//! The table (`readings_table.rs`) is generated from `scripts/readings.json`,
//! and the TypeScript side (`packages/engine/src/readings.ts`) implements the
//! same finder over the same table; both walk the JSON's cases, so the two
//! cannot drift. Overrides are `(item, reading)` pairs keyed by the item as
//! `Found::key` writes it: the digits without separators plus the suffix, or
//! the symbol itself.

use crate::readings_table::{Symbol, SYMBOLS};

/// One item of the input, with what it may be read as.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Item {
    /// The item as the written form names it: `182`, `9th`, `1000` for `1,000`, `@`.
    pub key: String,
    /// The reading in force: the override if it names one offered, else the default.
    pub reading: String,
    /// The default reading for this item where it stands.
    pub default: String,
    /// Every reading this item offers, in the order the interface lists them.
    pub offered: Vec<String>,
    /// How many times the item occurs in the input.
    pub count: usize,
    /// Characters the item spans, summed over its occurrences: what `drop` skips.
    pub chars: usize,
}

/// The one reading every item offers today.
const DROP: &str = "drop";

/// Whether a character carries a letter: ASCII, or one the fold table maps.
fn is_letter(c: char) -> bool {
    c.is_ascii_alphabetic() || crate::counts::folds_to_letters(c)
}

/// The ordinal suffix a number takes: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st.
fn suffix_for(digits: &str) -> &'static str {
    let last_two: u32 = digits[digits.len().saturating_sub(2)..].parse().unwrap_or(0);
    let last: u32 = digits[digits.len() - 1..].parse().unwrap_or(0);
    if (11..=13).contains(&last_two) {
        "th"
    } else {
        match last {
            1 => "st",
            2 => "nd",
            3 => "rd",
            _ => "th",
        }
    }
}

/// Where an item sits in the input.
struct Found {
    /// Byte range in the input.
    start: usize,
    end: usize,
    /// The digits without separators, or empty for a symbol.
    digits: String,
    /// The lowercase ordinal suffix, if the item is an ordinal.
    suffix: Option<&'static str>,
    symbol: Option<&'static Symbol>,
}

impl Found {
    fn key(&self) -> String {
        match self.symbol {
            Some(s) => s.ch.to_string(),
            None => format!("{}{}", self.digits, self.suffix.unwrap_or("")),
        }
    }
}

/// Every item in the input, in order.
fn find_items(input: &str) -> Vec<Found> {
    let chars: Vec<(usize, char)> = input.char_indices().collect();
    let mut found = Vec::new();
    let mut i = 0;
    let letter_at = |j: isize| -> bool { j >= 0 && (j as usize) < chars.len() && is_letter(chars[j as usize].1) };
    while i < chars.len() {
        let c = chars[i].1;
        if c.is_ascii_digit() {
            let start = i;
            let mut digits = String::new();
            while i < chars.len() && chars[i].1.is_ascii_digit() {
                digits.push(chars[i].1);
                i += 1;
            }
            // Thousands separators: `1,000`, `12,345,678`, never `1,2` or `1,2345`.
            if digits.len() <= 3 {
                while i + 3 < chars.len()
                    && chars[i].1 == ','
                    && chars[i + 1..i + 4].iter().all(|(_, d)| d.is_ascii_digit())
                    && !(i + 4 < chars.len() && chars[i + 4].1.is_ascii_digit())
                {
                    for (_, d) in &chars[i + 1..i + 4] {
                        digits.push(*d);
                    }
                    i += 4;
                }
            }
            // An ordinal: the suffix the number takes, followed by no letter.
            let mut suffix = None;
            if i + 1 < chars.len() {
                let two: String = [chars[i].1, chars[i + 1].1].iter().collect::<String>().to_ascii_lowercase();
                let wanted = suffix_for(&digits);
                if two == wanted && !letter_at(i as isize + 2) {
                    suffix = Some(wanted);
                    i += 2;
                }
            }
            let end = if i < chars.len() { chars[i].0 } else { input.len() };
            found.push(Found { start: chars[start].0, end, digits, suffix, symbol: None });
            continue;
        }
        if let Some(symbol) = SYMBOLS.iter().find(|s| s.ch == c) {
            let inside_word = letter_at(i as isize - 1) && letter_at(i as isize + 1);
            if !symbol.inside_word_only || inside_word {
                let end = if i + 1 < chars.len() { chars[i + 1].0 } else { input.len() };
                found.push(Found { start: chars[i].0, end, digits: String::new(), suffix: None, symbol: Some(symbol) });
            }
        }
        i += 1;
    }
    found
}

/// The reading in force for an item: an override that names a reading the
/// item offers, else the default. Both are `drop` today; an override naming
/// anything else is ignored here and refused by [`reading_problem`].
fn chosen(f: &Found, overrides: &[(String, String)]) -> (String, Vec<String>, String) {
    let offered = vec![DROP.to_owned()];
    let key = f.key();
    let reading = overrides
        .iter()
        .rev()
        .find(|(k, _)| *k == key)
        .map(|(_, name)| name.as_str())
        .filter(|name| offered.iter().any(|o| o == name))
        .unwrap_or(DROP)
        .to_owned();
    (reading, offered, DROP.to_owned())
}

/// The input with every item left out: no digits and no symbols of the set
/// left, everything else as typed. What `normalize` and `text_words` fold.
pub fn read_input(input: &str, overrides: &[(String, String)]) -> String {
    let found = find_items(input);
    if found.is_empty() {
        return input.to_owned();
    }
    let mut out = String::with_capacity(input.len());
    let mut at = 0;
    for f in &found {
        out.push_str(&input[at..f.start]);
        let _ = chosen(f, overrides);
        at = f.end;
    }
    out.push_str(&input[at..]);
    out
}

/// The distinct items of the input, in order of first occurrence, each with
/// the reading in force: what a record stores and the interface lists.
pub fn items(input: &str, overrides: &[(String, String)]) -> Vec<Item> {
    let mut out: Vec<Item> = Vec::new();
    for f in find_items(input) {
        let key = f.key();
        let chars = input[f.start..f.end].chars().count();
        if let Some(item) = out.iter_mut().find(|i| i.key == key) {
            item.count += 1;
            item.chars += chars;
            continue;
        }
        let (reading, offered, default) = chosen(&f, overrides);
        out.push(Item { key, reading, default, offered, count: 1, chars });
    }
    out
}

/// Why `overrides` cannot be the reading of `input`: an item the input lacks,
/// or a reading the item does not offer. None when every pair is in order.
/// The interface ignores such a pair; the CLI, the API and the tools refuse it.
pub fn reading_problem(input: &str, overrides: &[(String, String)]) -> Option<String> {
    let items = items(input, &[]);
    for (key, name) in overrides {
        let Some(item) = items.iter().find(|i| i.key == *key) else {
            return Some(format!("the input has no {key} to read"));
        };
        if !item.offered.iter().any(|o| o == name) {
            return Some(format!("{key} cannot be read as {name}; it offers {}", item.offered.join(", ")));
        }
    }
    None
}

/// `182:drop,2:drop` → the pairs. An empty string is no overrides. A pair
/// without a colon, or an empty item or name, is an error.
pub fn parse_reading(text: &str) -> Result<Vec<(String, String)>, String> {
    let mut out = Vec::new();
    for pair in text.split(',').map(str::trim).filter(|p| !p.is_empty()) {
        let Some((key, name)) = pair.split_once(':') else {
            return Err(format!("a reading is written item:name, not {pair:?}"));
        };
        let (key, name) = (key.trim(), name.trim());
        if key.is_empty() || name.is_empty() {
            return Err(format!("a reading is written item:name, not {pair:?}"));
        }
        out.push((key.to_owned(), name.to_owned()));
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::readings_table::CASES;

    #[test]
    fn every_case_reads_as_the_table_says() {
        for (input, overrides, expected) in CASES.iter() {
            let pairs = parse_reading(overrides).unwrap();
            assert_eq!(read_input(input, &pairs), *expected, "{input:?} with {overrides:?}");
        }
    }

    #[test]
    fn reading_leaves_no_item_behind() {
        for (input, overrides, _) in CASES.iter() {
            let read = read_input(input, &parse_reading(overrides).unwrap());
            assert!(items(&read, &[]).is_empty(), "{read:?} still has items");
            // Reading again changes nothing: the step is idempotent.
            assert_eq!(read_input(&read, &[]), read);
        }
    }

    #[test]
    fn items_say_what_is_offered_and_chosen() {
        let list = items("2 Fast 2 Furious", &[]);
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].key, "2");
        assert_eq!(list[0].count, 2);
        assert_eq!(list[0].chars, 2);
        assert_eq!(list[0].reading, "drop");
        assert_eq!(list[0].offered, ["drop"]);

        let list = items("Blink-182", &parse_reading("182:drop").unwrap());
        assert_eq!((list[0].reading.as_str(), list[0].default.as_str()), ("drop", "drop"));

        let list = items("Beverly Hills 90210", &[]);
        assert_eq!(list[0].chars, 5);

        let list = items("1,000 10,000th", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["1000", "10000th"]);
        assert_eq!((list[0].chars, list[1].chars), (5, 8));

        let list = items("Hello! Ke$ha wh?t @ AT&T C++ 50% #1 9th", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["$", "?", "@", "&", "+", "50", "%", "#", "1", "9th"]);
        assert_eq!(list[4].count, 2);
    }

    #[test]
    fn problems_name_the_item_and_the_reading() {
        assert_eq!(reading_problem("Blink-182", &parse_reading("182:drop").unwrap()), None);
        assert_eq!(reading_problem("Blink-182", &parse_reading("5:drop").unwrap()).unwrap(), "the input has no 5 to read");
        assert!(reading_problem("Blink-182", &parse_reading("182:spell").unwrap()).unwrap().contains("cannot be read as spell"));
        assert!(parse_reading("182").is_err());
        assert!(parse_reading(":x").is_err());
        assert_eq!(parse_reading("").unwrap(), Vec::<(String, String)>::new());
        assert_eq!(parse_reading(" 2:drop , 182:drop ").unwrap().len(), 2);
    }

    #[test]
    fn normalize_and_text_words_leave_items_out() {
        assert_eq!(crate::normalize("Blink-182"), "blink");
        assert_eq!(crate::normalize("Ke$ha"), "keha");
        assert_eq!(crate::normalize("Hello!"), "hello");
        assert_eq!(crate::normalize("the 10,000th man"), "theman");
        assert_eq!(crate::text_words("Area 51"), ["area"]);
        assert_eq!(crate::text_words("AT&T"), ["att"]);
        assert_eq!(crate::normalize_with("Reacher season 4", &parse_reading("4:drop").unwrap()), "reacherseason");
        assert_eq!(crate::text_words_with("2 Fast 2 Furious", &parse_reading("2:drop").unwrap()), ["fast", "furious"]);
    }
}
