//! The items of an input, and how each stands: every distinct digit or symbol
//! of the pool. A digit is always an item; `@ $ & % + #` are items wherever
//! they stand (`$5` as `Ke$ha`), and `! ?` only inside a word, with a letter
//! on both sides, where they are characters rather than marks.
//!
//! The literal rule (roadmap phase N, decisions D62 and D63, accepted
//! 2026-09-21): an anagram rearranges what was typed, and nothing is
//! converted. An item reads as itself by default (`self`: the character is a
//! character of the pool, and a term of an anagram uses it as itself), as one
//! of its leet letters (`$` as s, `7` as t or v: the search puts the character
//! back where the letter went and says so), or as `drop`, left out, which is
//! how every item was read between the fix pull request and N3 and how the
//! records made then still read. A number is never read as its name, and a
//! symbol never as a word.
//!
//! The table (`readings_table.rs`) is generated from `scripts/readings.json`,
//! and the TypeScript side (`packages/engine/src/readings.ts`) implements the
//! same finder over the same table; both walk the JSON's cases, so the two
//! cannot drift. Overrides are `(item, reading)` pairs keyed by the character
//! itself.

use crate::readings_table::{Character, CHARACTERS};

/// One item of the input, with what it may be read as.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Item {
    /// The character, as the written form names it: `1`, `$`.
    pub key: String,
    /// The reading in force: the override if it names one offered, else the default.
    pub reading: String,
    /// The default reading for this item: `self`.
    pub default: String,
    /// Every reading this item offers, in the order the interface lists them:
    /// `self`, its letters, `drop`.
    pub offered: Vec<String>,
    /// How many times the item occurs in the input.
    pub count: usize,
    /// Characters the item spans, summed over its occurrences: what `drop`
    /// skips. One per occurrence, so the same as `count`.
    pub chars: usize,
}

/// The reading that keeps the character as itself, the default.
pub const SELF: &str = "self";
/// The reading that leaves the character out.
pub const DROP: &str = "drop";

/// Whether a character carries a letter: ASCII, or one the fold table maps.
fn is_letter(c: char) -> bool {
    c.is_ascii_alphabetic() || crate::counts::folds_to_letters(c)
}

/// The table's entry for a digit or symbol of the set, whatever stands around it.
pub(crate) fn symbol(c: char) -> Option<&'static Character> {
    CHARACTERS.iter().find(|s| s.ch == c)
}

/// The leet letters a pool character offers: `$` → `s`, `7` → `t v`, `&` → none.
pub fn letters_of(c: char) -> &'static [char] {
    symbol(c).map_or(&[], |s| s.letters)
}

/// An item of the input: the character and its table entry.
struct Found {
    ch: char,
    spec: &'static Character,
}

/// Every item in the input, in order.
fn find_items(input: &str) -> Vec<Found> {
    let chars: Vec<(usize, char)> = input.char_indices().collect();
    let letter_at = |j: isize| -> bool { j >= 0 && (j as usize) < chars.len() && is_letter(chars[j as usize].1) };
    let mut found = Vec::new();
    for (i, &(_, c)) in chars.iter().enumerate() {
        let Some(spec) = symbol(c) else { continue };
        if spec.inside_word_only && !(letter_at(i as isize - 1) && letter_at(i as isize + 1)) {
            continue;
        }
        found.push(Found { ch: c, spec });
    }
    found
}

/// What the character offers, in the order the interface lists them.
fn offered(spec: &Character) -> Vec<String> {
    let mut out = vec![SELF.to_owned()];
    out.extend(spec.letters.iter().map(|l| l.to_string()));
    out.push(DROP.to_owned());
    out
}

/// The reading in force for an item: an override that names a reading the
/// item offers, else `self`. An override naming anything else is ignored here
/// (a link cannot make the page convert) and refused by [`reading_problem`].
fn chosen(f: &Found, overrides: &[(String, String)]) -> (String, Vec<String>) {
    let offered = offered(f.spec);
    let key = f.ch.to_string();
    let reading = overrides
        .iter()
        .rev()
        .find(|(k, _)| *k == key)
        .map(|(_, name)| name.as_str())
        .filter(|name| offered.iter().any(|o| o == name))
        .unwrap_or(SELF)
        .to_owned();
    (reading, offered)
}

/// The input with every item read: kept as itself, replaced by its letter, or
/// left out; a `!` or `?` that is punctuation dropped; everything else as
/// typed. What `normalize` and `text_words` fold, so after this step every
/// digit or symbol of the set left in the text is an item read as itself.
pub fn read_input(input: &str, overrides: &[(String, String)]) -> String {
    let mut out = String::with_capacity(input.len());
    let chars: Vec<(usize, char)> = input.char_indices().collect();
    let letter_at = |j: isize| -> bool { j >= 0 && (j as usize) < chars.len() && is_letter(chars[j as usize].1) };
    for (i, &(_, c)) in chars.iter().enumerate() {
        let Some(spec) = symbol(c) else {
            out.push(c);
            continue;
        };
        if spec.inside_word_only && !(letter_at(i as isize - 1) && letter_at(i as isize + 1)) {
            // Punctuation: a mark, not a character of the pool.
            continue;
        }
        let (reading, _) = chosen(&Found { ch: c, spec }, overrides);
        match reading.as_str() {
            SELF => out.push(c),
            DROP => {}
            letter => out.push_str(letter),
        }
    }
    out
}

/// The distinct items of the input, in order of first occurrence, each with
/// the reading in force: what a record stores and the interface lists.
pub fn items(input: &str, overrides: &[(String, String)]) -> Vec<Item> {
    let mut out: Vec<Item> = Vec::new();
    for f in find_items(input) {
        let key = f.ch.to_string();
        if let Some(item) = out.iter_mut().find(|i| i.key == key) {
            item.count += 1;
            item.chars += 1;
            continue;
        }
        let (reading, offered) = chosen(&f, overrides);
        out.push(Item { key, reading, default: SELF.to_owned(), offered, count: 1, chars: 1 });
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

/// `$:s,4:drop` → the pairs. An empty string is no overrides. A pair
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

/// The reading in words, for a person: `1 as itself · $ as s · 4 left out`.
/// Empty for an input without items.
pub fn describe_reading(input: &str, overrides: &[(String, String)]) -> String {
    items(input, overrides)
        .iter()
        .map(|item| match item.reading.as_str() {
            SELF => format!("{} as itself", item.key),
            DROP => format!("{} left out", item.key),
            letter => format!("{} as {letter}", item.key),
        })
        .collect::<Vec<_>>()
        .join(" · ")
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
    fn reading_is_idempotent_and_keeps_only_items_read_as_themselves() {
        for (input, overrides, _) in CASES.iter() {
            let pairs = parse_reading(overrides).unwrap();
            let read = read_input(input, &pairs);
            // Reading again by the defaults changes nothing: every item left is itself.
            assert_eq!(read_input(&read, &[]), read);
            for item in items(&read, &[]) {
                assert_eq!(item.reading, SELF, "{read:?}");
                let stays = items(input, &pairs).iter().any(|i| i.key == item.key && i.reading == SELF);
                assert!(stays, "{read:?} kept {} that {input:?} read otherwise", item.key);
            }
        }
    }

    #[test]
    fn items_say_what_is_offered_and_chosen() {
        let list = items("2 Fast 2 Furious", &[]);
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].key, "2");
        assert_eq!(list[0].count, 2);
        assert_eq!(list[0].chars, 2);
        assert_eq!(list[0].reading, "self");
        assert_eq!(list[0].offered, ["self", "z", "drop"]);

        let list = items("Blink-182", &parse_reading("8:drop").unwrap());
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["1", "8", "2"]);
        assert_eq!(list[0].offered, ["self", "i", "l", "drop"]);
        assert_eq!((list[1].reading.as_str(), list[1].default.as_str()), ("drop", "self"));

        // A run is its distinct digits; separators and an ordinal's suffix are not items.
        let list = items("Beverly Hills 90210", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["9", "0", "2", "1"]);
        assert_eq!(list[1].count, 2);
        let list = items("1,000 10,000th", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["1", "0"]);
        assert_eq!((list[0].count, list[1].count), (2, 7));

        let list = items("Hello! Ke$ha wh?t @ AT&T C++ 50% #1 9th $5", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["$", "?", "@", "&", "+", "5", "0", "%", "#", "1", "9"]);
        assert_eq!(list[4].count, 2);
        assert_eq!(list[3].offered, ["self", "drop"], "& has no leet letter");
        // A `$` is an item wherever it stands (D62), a `!` or `?` only inside a word.
        assert_eq!((list[0].count, list[5].count), (2, 2), "the $ and the 5 of `$5` are items");
        let list = items("$5 off $h!t", &[]);
        let keys: Vec<&str> = list.iter().map(|i| i.key.as_str()).collect();
        assert_eq!(keys, ["$", "5", "!"]);
        assert_eq!(list[0].offered, ["self", "s", "drop"]);
        assert!(items("Hello! what?", &[]).is_empty());

        assert_eq!(letters_of('7'), &['t', 'v']);
        assert_eq!(letters_of('&'), &[] as &[char]);
        assert_eq!(letters_of('a'), &[] as &[char]);
        assert!(crate::counts::is_pool_char('$') && crate::counts::is_pool_char('7') && !crate::counts::is_pool_char('-'));
    }

    #[test]
    fn problems_name_the_item_and_the_reading() {
        assert_eq!(reading_problem("Blink-182", &parse_reading("1:drop,8:b").unwrap()), None);
        assert_eq!(reading_problem("Blink-182", &parse_reading("5:drop").unwrap()).unwrap(), "the input has no 5 to read");
        assert_eq!(reading_problem("Blink-182", &parse_reading("182:drop").unwrap()).unwrap(), "the input has no 182 to read");
        assert_eq!(
            reading_problem("Blink-182", &parse_reading("1:spell").unwrap()).unwrap(),
            "1 cannot be read as spell; it offers self, i, l, drop"
        );
        assert!(reading_problem("Ke$ha", &parse_reading("$:z").unwrap()).unwrap().contains("cannot be read as z"));
        assert!(parse_reading("182").is_err());
        assert!(parse_reading(":x").is_err());
        assert_eq!(parse_reading("").unwrap(), Vec::<(String, String)>::new());
        assert_eq!(parse_reading(" 2:drop , $:s ").unwrap().len(), 2);
    }

    #[test]
    fn normalize_and_text_words_follow_the_reading() {
        assert_eq!(crate::normalize("Blink-182"), "blink182");
        assert_eq!(crate::normalize("Ke$ha"), "ke$ha");
        assert_eq!(crate::normalize("Hello!"), "hello");
        assert_eq!(crate::normalize("$5 off"), "$5off");
        assert_eq!(crate::normalize_with("$5 off", &parse_reading("$:drop").unwrap()), "5off");
        assert_eq!(crate::normalize_with("$hake", &parse_reading("$:s").unwrap()), "shake");
        assert_eq!(crate::normalize("the 10,000th man"), "the10000thman");
        assert_eq!(crate::text_words("Area 51"), ["area", "51"]);
        assert_eq!(crate::text_words("AT&T"), ["at&t"]);
        assert_eq!(crate::normalize_with("Reacher season 4", &parse_reading("4:drop").unwrap()), "reacherseason");
        assert_eq!(crate::normalize_with("Ke$ha", &parse_reading("$:s").unwrap()), "kesha");
        assert_eq!(crate::text_words_with("2 Fast 2 Furious", &parse_reading("2:drop").unwrap()), ["fast", "furious"]);
        assert_eq!(crate::text_words_with("h3llo l33t", &parse_reading("3:e").unwrap()), ["hello", "leet"]);
        assert_eq!(describe_reading("Ke$ha 4 4", &parse_reading("$:s,4:drop").unwrap()), "$ as s · 4 left out");
        assert_eq!(describe_reading("Blink-182", &[]), "1 as itself · 8 as itself · 2 as itself");
        assert_eq!(describe_reading("plain", &[]), "");
    }
}
