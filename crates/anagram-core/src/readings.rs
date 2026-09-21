//! The reading of numbers and symbols: what turns `Blink-182` into the letters
//! of *blink one hundred eighty two* before the search sees it (roadmap phase
//! N, decisions D19 to D21).
//!
//! An **item** is a run of ASCII digits (`182`, `1,000` with its thousands
//! separators), a run of digits with its ordinal suffix (`9th`, `21st`), or one
//! of the symbols in the table (`@ $ ! & +`). Each item has a few **readings**
//! and a default:
//!
//! - on its own, a number is spelled as a whole (`spell`: one hundred eighty
//!   two), with digit by digit (`digits`), a year for four digits (`year`:
//!   nineteen oh seven), the keyboard letters where every digit has one
//!   (`letter`: 1337 → ieet), a homophone for a single digit (`to`, `too`,
//!   `for`, `ate`, `won`, `oh`) and `drop` as the alternatives;
//! - inside a word, with a letter on both sides, a digit stands for its
//!   keyboard letter (`Bl1nk` → blink), as `$` and `!` do (`Ke$ha`, `P!nk`);
//!   elsewhere those two are punctuation and not items at all;
//! - `@` stands for *a*, or is spelled *at*; `&` and `+` are spelled *and* and
//!   *plus*;
//! - a number of more than four digits is dropped unless read digit by digit.
//!
//! A spelled reading enters the text as its words, with a space on either
//! side wherever the neighbour is not one, so the text's own words are known
//! (the text itself is never its own result); a letter reading joins its
//! neighbours; a dropped item leaves nothing. The result is text with no items
//! left in it, which `normalize` and `text_words` then fold as they always
//! have. `read_input` with no overrides is what they apply.
//!
//! The table (`readings_table.rs`) is generated from `scripts/readings.json`,
//! and the TypeScript side (`packages/engine/src/readings.ts`) implements the
//! same step over the same table; both walk the JSON's cases, so the two
//! cannot drift. Overrides are `(item, reading)` pairs keyed by the item as
//! `item_key` writes it: the digits without separators plus the suffix, or the
//! symbol itself; the written form everywhere is `182:digits,2:too`.

use crate::readings_table::{
    Symbol, DIGIT_LETTERS, DIGIT_NAMES, HUNDRED, MAX_SPELLED_DIGITS, ORDINAL_IRREGULAR, SYMBOLS, TEENS, TENS,
    THOUSAND,
};

/// One item of the input, with what it may be read as.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Item {
    /// The item as the written form names it: `182`, `9th`, `1000` for `1,000`, `@`.
    pub key: String,
    /// The reading in force: the override if it names one offered, else the default.
    pub reading: String,
    /// The default reading for this item where it stands.
    pub default: String,
    /// Every reading this item offers, in the order the interface lists them, `drop` last.
    pub offered: Vec<String>,
    /// How many times the item occurs in the input.
    pub count: usize,
    /// Characters the item spans, summed over its occurrences: what `drop` skips.
    pub chars: usize,
}

/// Whether a character carries a letter: ASCII, or one the fold table maps.
fn is_letter(c: char) -> bool {
    c.is_ascii_alphabetic() || crate::counts::folds_to_letters(c)
}

fn digit_name(d: u32) -> &'static str {
    DIGIT_NAMES[d as usize][0]
}

/// The cardinal's words, no "and": 182 → one hundred eighty two. Up to 9999.
fn cardinal(mut v: u32) -> Vec<&'static str> {
    if v == 0 {
        return vec![digit_name(0)];
    }
    let mut words = Vec::new();
    if v >= 1000 {
        words.push(digit_name(v / 1000));
        words.push(THOUSAND);
        v %= 1000;
    }
    if v >= 100 {
        words.push(digit_name(v / 100));
        words.push(HUNDRED);
        v %= 100;
    }
    if v >= 20 {
        words.push(TENS[(v / 10 - 2) as usize]);
        if !v.is_multiple_of(10) {
            words.push(digit_name(v % 10));
        }
    } else if v >= 10 {
        words.push(TEENS[(v - 10) as usize]);
    } else if v > 0 {
        words.push(digit_name(v));
    }
    words
}

/// The ordinal's words: the cardinal with its last word made ordinal.
fn ordinal(v: u32) -> Vec<String> {
    let mut words: Vec<String> = cardinal(v).into_iter().map(str::to_owned).collect();
    let last = words.pop().unwrap_or_default();
    let made = match ORDINAL_IRREGULAR.iter().find(|(w, _)| *w == last) {
        Some((_, irregular)) => (*irregular).to_owned(),
        None if last.ends_with('y') => format!("{}ieth", &last[..last.len() - 1]),
        None => format!("{last}th"),
    };
    words.push(made);
    words
}

/// A four-digit number read as a year, or None where that reads as the
/// cardinal does (2000 is *two thousand* either way).
fn year(v: u32) -> Option<Vec<&'static str>> {
    let (hi, lo) = (v / 100, v % 100);
    let mut words = cardinal(hi);
    if hi % 10 == 0 {
        // 1000, 2000, …: the cardinal already says "two thousand".
        if lo == 0 {
            return None;
        }
    } else if lo == 0 {
        words.push(HUNDRED);
        return Some(words);
    }
    if lo < 10 {
        words.push(DIGIT_NAMES[0][1]); // oh
        words.push(digit_name(lo));
    } else {
        words.extend(cardinal(lo));
    }
    Some(words)
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
    /// A letter directly before and directly after.
    inside_word: bool,
}

impl Found {
    fn key(&self) -> String {
        match self.symbol {
            Some(s) => s.ch.to_string(),
            None => format!("{}{}", self.digits, self.suffix.unwrap_or("")),
        }
    }
}

/// Every item in the input, in order, with the reading each offers.
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
            let inside_word = suffix.is_none() && letter_at(start as isize - 1) && letter_at(i as isize);
            let end = if i < chars.len() { chars[i].0 } else { input.len() };
            found.push(Found { start: chars[start].0, end, digits, suffix, symbol: None, inside_word });
            continue;
        }
        if let Some(symbol) = SYMBOLS.iter().find(|s| s.ch == c) {
            let inside_word = letter_at(i as isize - 1) && letter_at(i as isize + 1);
            if !symbol.inside_word_only || inside_word {
                let end = if i + 1 < chars.len() { chars[i + 1].0 } else { input.len() };
                found.push(Found { start: chars[i].0, end, digits: String::new(), suffix: None, symbol: Some(symbol), inside_word });
            }
        }
        i += 1;
    }
    found
}

/// The readings an item offers, in order, and its default.
fn offered(f: &Found) -> (Vec<String>, String) {
    if let Some(s) = f.symbol {
        let mut out = Vec::new();
        if s.letter.is_some() {
            out.push("letter".to_owned());
        }
        if s.spell.is_some() {
            out.push("spell".to_owned());
        }
        out.push("drop".to_owned());
        return (out, s.default.to_owned());
    }
    if f.suffix.is_some() {
        return (vec!["spell".to_owned(), "drop".to_owned()], "spell".to_owned());
    }
    let n = f.digits.len();
    let value: Option<u32> = if n <= MAX_SPELLED_DIGITS { f.digits.parse().ok() } else { None };
    let mut out = Vec::new();
    if value.is_some() {
        out.push("spell".to_owned());
    }
    if n == 1 {
        for name in &DIGIT_NAMES[f.digits.as_bytes()[0] as usize - b'0' as usize][1..] {
            out.push((*name).to_owned());
        }
    } else {
        out.push("digits".to_owned());
    }
    if n == 4 && !f.digits.starts_with('0') && year(value.unwrap_or(0)).is_some() {
        out.push("year".to_owned());
    }
    let lettered = f.digits.bytes().all(|d| DIGIT_LETTERS[(d - b'0') as usize].is_some());
    if lettered {
        out.push("letter".to_owned());
    }
    out.push("drop".to_owned());
    let default = if f.inside_word && lettered {
        "letter"
    } else if value.is_some() {
        "spell"
    } else {
        "drop"
    };
    (out, default.to_owned())
}

/// What an item's reading puts into the text: words, or letters, or nothing.
enum Piece {
    Words(Vec<String>),
    Letters(String),
    Nothing,
}

fn piece(f: &Found, reading: &str) -> Piece {
    if let Some(s) = f.symbol {
        return match reading {
            "letter" => Piece::Letters(s.letter.map(|c| c.to_string()).unwrap_or_default()),
            "spell" => Piece::Words(vec![s.spell.unwrap_or("").to_owned()]),
            _ => Piece::Nothing,
        };
    }
    let value: u32 = f.digits.parse().unwrap_or(0);
    match reading {
        "spell" if f.suffix.is_some() => Piece::Words(ordinal(value)),
        "spell" => Piece::Words(cardinal(value).into_iter().map(str::to_owned).collect()),
        "digits" => Piece::Words(f.digits.bytes().map(|d| digit_name((d - b'0') as u32).to_owned()).collect()),
        "year" => Piece::Words(year(value).unwrap_or_default().into_iter().map(str::to_owned).collect()),
        "letter" => Piece::Letters(f.digits.bytes().filter_map(|d| DIGIT_LETTERS[(d - b'0') as usize]).collect()),
        "drop" => Piece::Nothing,
        word => Piece::Words(vec![word.to_owned()]),
    }
}

/// The reading in force for an item: the override when it names one the item offers.
fn chosen(f: &Found, overrides: &[(String, String)]) -> (String, Vec<String>, String) {
    let (offered, default) = offered(f);
    let key = f.key();
    let reading = overrides
        .iter()
        .rev()
        .find(|(k, _)| *k == key)
        .map(|(_, name)| name.as_str())
        .filter(|name| offered.iter().any(|o| o == name))
        .unwrap_or(&default)
        .to_owned();
    (reading, offered, default)
}

/// The input with every item read: no digits and no symbols of the set left,
/// the words of a spelled item set off by spaces. What `normalize` and
/// `text_words` fold.
pub fn read_input(input: &str, overrides: &[(String, String)]) -> String {
    let found = find_items(input);
    if found.is_empty() {
        return input.to_owned();
    }
    let mut out = String::with_capacity(input.len() + 16);
    let mut at = 0;
    for f in &found {
        out.push_str(&input[at..f.start]);
        let (reading, _, _) = chosen(f, overrides);
        match piece(f, &reading) {
            Piece::Letters(letters) => out.push_str(&letters),
            Piece::Nothing => {}
            Piece::Words(words) => {
                if out.chars().last().is_some_and(|c| !c.is_whitespace()) {
                    out.push(' ');
                }
                out.push_str(&words.join(" "));
                if input[f.end..].chars().next().is_some_and(|c| !c.is_whitespace()) {
                    out.push(' ');
                }
            }
        }
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

/// `182:digits,2:too` → the pairs. An empty string is no overrides. A pair
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
    fn cardinals_agree_with_a_second_spelling() {
        // A table-free spelling of 0..=9999, so the composition above is checked
        // and not only the cases.
        let ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        let teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        let tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        let below_hundred = |v: usize| -> String {
            if v < 10 {
                ones[v].to_owned()
            } else if v < 20 {
                teens[v - 10].to_owned()
            } else if v % 10 == 0 {
                tens[v / 10].to_owned()
            } else {
                format!("{} {}", tens[v / 10], ones[v % 10])
            }
        };
        for v in 0..=9999usize {
            let mut parts = Vec::new();
            if v >= 1000 {
                parts.push(format!("{} thousand", ones[v / 1000]));
            }
            if v % 1000 >= 100 {
                parts.push(format!("{} hundred", ones[v % 1000 / 100]));
            }
            if v % 100 > 0 || v == 0 {
                parts.push(below_hundred(v % 100));
            }
            assert_eq!(cardinal(v as u32).join(" "), parts.join(" "), "{v}");
        }
    }

    #[test]
    fn items_say_what_is_offered_and_chosen() {
        let list = items("2 Fast 2 Furious", &[]);
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].key, "2");
        assert_eq!(list[0].count, 2);
        assert_eq!(list[0].reading, "spell");
        assert_eq!(list[0].offered, ["spell", "to", "too", "drop"]);

        let list = items("Blink-182", &parse_reading("182:digits").unwrap());
        assert_eq!(list[0].reading, "digits");
        assert_eq!(list[0].offered, ["spell", "digits", "drop"]);

        let list = items("Como 1907", &[]);
        assert_eq!(list[0].offered, ["spell", "digits", "year", "drop"]);

        let list = items("1337", &[]);
        assert_eq!(list[0].offered, ["spell", "digits", "year", "letter", "drop"]);

        let list = items("Bl1nk", &[]);
        assert_eq!((list[0].reading.as_str(), list[0].default.as_str()), ("letter", "letter"));

        let list = items("Beverly Hills 90210", &[]);
        assert_eq!(list[0].offered, ["digits", "drop"]);
        assert_eq!(list[0].reading, "drop");
        assert_eq!(list[0].chars, 5);

        let list = items("Hello! Ke$ha @ AT&T C++ 9th", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["$", "@", "&", "+", "9th"]);
        assert_eq!(list[3].count, 2);
    }

    #[test]
    fn problems_name_the_item_and_the_reading() {
        assert_eq!(reading_problem("Blink-182", &parse_reading("182:digits").unwrap()), None);
        assert_eq!(reading_problem("Blink-182", &parse_reading("5:drop").unwrap()).unwrap(), "the input has no 5 to read");
        assert!(reading_problem("Blink-182", &parse_reading("182:year").unwrap()).unwrap().contains("cannot be read as year"));
        assert!(parse_reading("182").is_err());
        assert!(parse_reading(":x").is_err());
        assert_eq!(parse_reading("").unwrap(), Vec::<(String, String)>::new());
        assert_eq!(parse_reading(" 2:too , 182:digits ").unwrap().len(), 2);
    }

    #[test]
    fn normalize_and_text_words_read_by_default() {
        assert_eq!(crate::normalize("Blink-182"), "blinkonehundredeightytwo");
        assert_eq!(crate::normalize("Ke$ha"), "kesha");
        assert_eq!(crate::normalize("Hello!"), "hello");
        assert_eq!(crate::text_words("Area 51"), ["area", "fifty", "one"]);
        assert_eq!(crate::text_words("AT&T"), ["at", "and", "t"]);
        assert_eq!(crate::normalize_with("Reacher season 4", &parse_reading("4:drop").unwrap()), "reacherseason");
        assert_eq!(crate::text_words_with("2 Fast 2 Furious", &parse_reading("2:too").unwrap()), ["too", "fast", "too", "furious"]);
    }
}
