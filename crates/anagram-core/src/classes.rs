//! The term classes of decision D63 (2026-09-21).
//!
//! A term of an anagram is a word of the dictionary or a term of a labelled
//! class. Every anagram carries the classes its terms come from; the default
//! everywhere is words alone, and a search admits a class by naming it in its
//! mask, as it names a tier. The table is the plan's, in its order; `words` is
//! the absence of bits. `packages/engine/src/protocol.ts` carries the same
//! names in the same order (`CLASSES`), so a mask crosses the worker boundary
//! as names and a class bit means the same thing on both sides.

/// A class a term may belong to. The discriminant is its bit.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Hash, PartialOrd, Ord)]
pub enum Class {
    /// A digit or a run of digits as itself, read as a number: generated from
    /// the pool, never listed.
    Numerals = 0,
    /// A symbol of the set as itself, read as its word: `& and`, `@ at`.
    Symbols = 1,
    /// One character read as a word: `u you`, `2 to`, `8 ate`.
    Shorthand = 2,
    /// Letters and digits that sound like a word: `b8`, `gr8`, `2day`.
    Blends = 3,
    /// Initialisms and text abbreviations: `wtf`, `btw`, `thx`.
    Acronyms = 4,
    /// A digit or symbol standing for one letter, written back where the letter
    /// went: generated from the readings table, never listed.
    Leet = 5,
    /// A name the vocabulary lacks: `eiffel`, `berne`.
    Names = 6,
    /// Informal and slang words the pinned list lacks: `rizz`, `sus`.
    Slang = 7,
}

/// Which classes a search admits, one bit each.
pub type ClassMask = u16;

/// The name of the class every dictionary word belongs to.
pub const WORDS: &str = "words";

impl Class {
    /// Every class, in the table's order.
    pub const ALL: [Class; 8] = [
        Class::Numerals,
        Class::Symbols,
        Class::Shorthand,
        Class::Blends,
        Class::Acronyms,
        Class::Leet,
        Class::Names,
        Class::Slang,
    ];

    #[inline]
    pub fn bit(self) -> ClassMask {
        1 << (self as u16)
    }

    pub fn name(self) -> &'static str {
        match self {
            Class::Numerals => "numerals",
            Class::Symbols => "symbols",
            Class::Shorthand => "shorthand",
            Class::Blends => "blends",
            Class::Acronyms => "acronyms",
            Class::Leet => "leet",
            Class::Names => "names",
            Class::Slang => "slang",
        }
    }

    pub fn from_name(name: &str) -> Option<Class> {
        Class::ALL.iter().copied().find(|c| c.name() == name)
    }

    /// The first class in table order whose bit `mask` has.
    pub fn first_in(mask: ClassMask) -> Option<Class> {
        Class::ALL.iter().copied().find(|c| mask & c.bit() != 0)
    }
}

/// `shorthand,blends` → the mask. An empty string is words alone. An unknown
/// name is an error naming it.
pub fn parse_classes(text: &str) -> Result<ClassMask, String> {
    let mut mask = 0;
    for name in text.split(',').map(str::trim).filter(|n| !n.is_empty()) {
        if name == WORDS {
            continue;
        }
        let class = Class::from_name(name).ok_or_else(|| {
            format!(
                "{name:?} is not a term class; the classes are {}",
                Class::ALL.iter().map(|c| c.name()).collect::<Vec<_>>().join(", ")
            )
        })?;
        mask |= class.bit();
    }
    Ok(mask)
}

/// The names of the classes in `mask`, in table order.
pub fn class_names(mask: ClassMask) -> Vec<&'static str> {
    Class::ALL.iter().filter(|c| mask & c.bit() != 0).map(|c| c.name()).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_and_bits_round_trip_in_table_order() {
        for (i, class) in Class::ALL.iter().enumerate() {
            assert_eq!(class.bit(), 1 << i);
            assert_eq!(Class::from_name(class.name()), Some(*class));
        }
        assert_eq!(parse_classes("").unwrap(), 0);
        assert_eq!(parse_classes("words").unwrap(), 0);
        assert_eq!(parse_classes("blends, shorthand").unwrap(), Class::Shorthand.bit() | Class::Blends.bit());
        assert_eq!(class_names(Class::Blends.bit() | Class::Shorthand.bit()), ["shorthand", "blends"]);
        assert_eq!(Class::first_in(Class::Leet.bit() | Class::Numerals.bit()), Some(Class::Numerals));
        assert_eq!(Class::first_in(0), None);
        assert!(parse_classes("emoji").unwrap_err().contains("emoji"));
    }
}
