//! Decoding of the shipped dictionary artifacts, and construction of the
//! signature index the search actually walks.
//!
//! The search never branches on words — it branches on *anagram classes*. All
//! words sharing a sorted-letter signature (`listen`, `silent`, `tinsel`,
//! `enlist`, `inlets`, `elints`) collapse into one node, so the branching factor
//! drops and near-duplicate results stop flooding the stream. Surface forms are
//! reattached only when a solution is materialized.
//!
//! On the shipped list that is 378,844 words in 350,469 classes; only 21,960
//! classes have more than one member, which is why "other spellings" has to be
//! progressive disclosure in the UI rather than permanent chrome.
//!
//! # Terms
//!
//! Beside the words, a dictionary may carry the terms of the labelled classes
//! (decision D63; `classes.rs`), from the `classes` artifact `dict:build`
//! emits when a class file has a term. The words stay letters-only; a term may
//! carry a digit or a symbol of the pool (`b8`, `&`). Terms sit after the
//! words in `words`, with their class bits beside them, and are in no tier: a
//! search admits them by its class mask. A term of letters alone joins the sig
//! class of its letters, so `amy` is a spelling of `may`'s class and opens no
//! new count, while `u`, `wtf` and `b8` open classes of their own; a term with
//! a digit or symbol has no fixed vector (the pool gives those characters
//! their slots per query) and is counted by the search through its `Slots`.

use crate::classes::{Class, ClassMask};
use crate::counts::{is_pool_char, Counts, Slots};
use std::collections::{HashMap, HashSet};

const MAGIC_DICT: &[u8; 8] = b"ARSMAGNA";
const MAGIC_BITS: &[u8; 8] = b"ARSMBITS";
const MAGIC_CLASSES: &[u8; 8] = b"ARSMCLAS";
const FORMAT_VERSION: u16 = 1;

const SECTION_WORDS: u32 = 1;
const SECTION_ZIPF: u32 = 3;
const SECTION_POS: u32 = 4;
// Section 5 carries the site's listed forms (`don't` beside `dont`) for the
// page; the search knows only the letters-word, so it is skipped here like any
// section this reader does not know.

#[derive(Debug)]
pub enum DictError {
    BadMagic,
    UnsupportedVersion(u16),
    Truncated,
    MissingSection(&'static str),
    BadWord(String),
    /// A term of the classes artifact is not letters, digits and symbols of the pool.
    BadTerm(String),
}

impl std::fmt::Display for DictError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DictError::BadMagic => write!(f, "not an Ars Magna artifact"),
            DictError::UnsupportedVersion(v) => write!(f, "unsupported format version {v}"),
            DictError::Truncated => write!(f, "artifact is truncated"),
            DictError::MissingSection(s) => write!(f, "missing {s} section"),
            DictError::BadWord(w) => write!(f, "word {w:?} is not [a-z]+"),
            DictError::BadTerm(t) => write!(f, "term {t:?} is not letters, digits and symbols of the pool"),
        }
    }
}

impl std::error::Error for DictError {}

fn u16_at(buf: &[u8], at: usize) -> Result<u16, DictError> {
    buf.get(at..at + 2)
        .map(|b| u16::from_le_bytes([b[0], b[1]]))
        .ok_or(DictError::Truncated)
}

fn u32_at(buf: &[u8], at: usize) -> Result<u32, DictError> {
    buf.get(at..at + 4)
        .map(|b| u32::from_le_bytes([b[0], b[1], b[2], b[3]]))
        .ok_or(DictError::Truncated)
}

/// Words plus their frequency bytes, straight out of the artifact.
pub struct WordList {
    pub words: Vec<String>,
    /// Quantised zipf, one byte per word; 0 means "no frequency data".
    pub zipf: Vec<u8>,
    /// Part-of-speech bitmask per word; 0 means "nothing known". Two bytes on
    /// the wire because there are nine classes, one `u16` here.
    pub pos: Vec<u16>,
}

impl WordList {
    /// Decode a front-coded `.bin` artifact.
    pub fn decode(buf: &[u8]) -> Result<WordList, DictError> {
        if buf.len() < 24 || &buf[0..8] != MAGIC_DICT {
            return Err(DictError::BadMagic);
        }
        let version = u16_at(buf, 8)?;
        if version != FORMAT_VERSION {
            return Err(DictError::UnsupportedVersion(version));
        }

        let word_count = u32_at(buf, 12)? as usize;
        let section_count = u16_at(buf, 18)? as usize;

        let mut words_section: Option<&[u8]> = None;
        let mut zipf_section: Option<&[u8]> = None;
        let mut pos_section: Option<&[u8]> = None;

        for i in 0..section_count {
            let at = 24 + i * 12;
            let kind = u32_at(buf, at)?;
            let offset = u32_at(buf, at + 4)? as usize;
            let length = u32_at(buf, at + 8)? as usize;
            let slice = buf.get(offset..offset + length).ok_or(DictError::Truncated)?;
            match kind {
                SECTION_WORDS => words_section = Some(slice),
                SECTION_ZIPF => zipf_section = Some(slice),
                SECTION_POS => pos_section = Some(slice),
                _ => {}
            }
        }

        let payload = words_section.ok_or(DictError::MissingSection("WORDS"))?;

        let mut words = Vec::with_capacity(word_count);
        let mut scratch = Vec::<u8>::with_capacity(64);
        let mut read = 0usize;

        for _ in 0..word_count {
            let shared = *payload.get(read).ok_or(DictError::Truncated)? as usize;
            read += 1;
            if shared > scratch.len() {
                return Err(DictError::Truncated);
            }
            scratch.truncate(shared);
            loop {
                let byte = *payload.get(read).ok_or(DictError::Truncated)?;
                read += 1;
                if byte == 0 {
                    break;
                }
                scratch.push(byte);
            }
            // Every byte came from a `[a-z]`-normalized build, so this is
            // guaranteed valid UTF-8; the check is cheap insurance against a
            // corrupt download.
            words.push(
                std::str::from_utf8(&scratch)
                    .map_err(|_| DictError::Truncated)?
                    .to_owned(),
            );
        }

        let zipf = match zipf_section {
            Some(z) if z.len() >= word_count => z[..word_count].to_vec(),
            _ => vec![0; word_count],
        };

        // Absent is not an error: a dictionary built before this section
        // existed still loads, and the ordering falls back to search order.
        let pos = match pos_section {
            Some(p) if p.len() >= word_count * 2 => (0..word_count)
                .map(|i| u16::from_le_bytes([p[i * 2], p[i * 2 + 1]]))
                .collect(),
            _ => vec![0; word_count],
        };

        Ok(WordList { words, zipf, pos })
    }
}

/// Tier membership bitsets, indexed over the shipped word ordering, which is
/// the Extended tier: the pinned list plus the site's own additions.
pub struct TierBits {
    word_count: usize,
    sets: Vec<Vec<u8>>,
}

impl TierBits {
    pub fn decode(buf: &[u8]) -> Result<TierBits, DictError> {
        if buf.len() < 16 || &buf[0..8] != MAGIC_BITS {
            return Err(DictError::BadMagic);
        }
        let version = u16_at(buf, 8)?;
        if version != FORMAT_VERSION {
            return Err(DictError::UnsupportedVersion(version));
        }
        let set_count = u16_at(buf, 10)? as usize;
        let word_count = u32_at(buf, 12)? as usize;
        let set_bytes = word_count.div_ceil(8);

        let mut sets = Vec::with_capacity(set_count);
        for i in 0..set_count {
            let at = 16 + i * set_bytes;
            sets.push(
                buf.get(at..at + set_bytes)
                    .ok_or(DictError::Truncated)?
                    .to_vec(),
            );
        }
        Ok(TierBits { word_count, sets })
    }

    pub fn contains(&self, set: usize, word_index: usize) -> bool {
        if word_index >= self.word_count {
            return false;
        }
        match self.sets.get(set) {
            Some(bits) => bits[word_index >> 3] & (1 << (word_index & 7)) != 0,
            // Extended has no bitset: every word in the shipped list is a
            // member. A dictionary built with no tiers at all lands here too,
            // which is why `Dict::from_words` reports every word in every tier.
            None => true,
        }
    }
}

/// The terms of the labelled classes, straight out of the `classes` artifact:
/// `ARSMCLAS`, a `u16` version, a `u32` count at byte 12, then per term a
/// `u16` of class bits, a `u8` length and the term's bytes. Sorted and unique
/// as built; a term in two class files carries both bits.
pub struct TermList {
    pub terms: Vec<(String, ClassMask)>,
}

impl TermList {
    pub fn decode(buf: &[u8]) -> Result<TermList, DictError> {
        if buf.len() < 16 || &buf[0..8] != MAGIC_CLASSES {
            return Err(DictError::BadMagic);
        }
        let version = u16_at(buf, 8)?;
        if version != FORMAT_VERSION {
            return Err(DictError::UnsupportedVersion(version));
        }
        let count = u32_at(buf, 12)? as usize;
        let mut terms = Vec::with_capacity(count);
        let mut at = 16;
        for _ in 0..count {
            let bits = u16_at(buf, at)?;
            let len = *buf.get(at + 2).ok_or(DictError::Truncated)? as usize;
            let bytes = buf.get(at + 3..at + 3 + len).ok_or(DictError::Truncated)?;
            let term = std::str::from_utf8(bytes).map_err(|_| DictError::Truncated)?.to_owned();
            if !is_term(&term) {
                return Err(DictError::BadTerm(term));
            }
            // Sorted and unique as built, which `Dict::new` relies on and the
            // build guarantees; a list out of order is a corrupt artifact.
            if terms.last().is_some_and(|(last, _): &(String, ClassMask)| *last >= term) {
                return Err(DictError::BadTerm(term));
            }
            terms.push((term, bits));
            at += 3 + len;
        }
        Ok(TermList { terms })
    }
}

/// Whether `text` may be a term: non-empty, every character a lowercase
/// letter or a digit or symbol of the pool.
pub fn is_term(text: &str) -> bool {
    !text.is_empty() && text.chars().all(|c| c.is_ascii_lowercase() || is_pool_char(c))
}

/// Which vocabulary a query runs against: a tier of the words, and the term
/// classes admitted beside it. A spelling is in scope when its tier admits it
/// or one of its class bits is in the mask; words alone is a mask of 0.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Scope {
    pub tier: Tier,
    pub classes: ClassMask,
}

impl Scope {
    /// A tier with no classes: today's search.
    pub fn tier(tier: Tier) -> Scope {
        Scope { tier, classes: 0 }
    }
}

/// Which vocabulary a query runs against. Strictly nested:
/// Common ⊂ Standard ⊂ Full ⊂ Extended.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Tier {
    Common,
    Standard,
    /// English OpenList at the pinned revision.
    Full,
    /// The pinned list plus the site's own additions: every word that ships.
    Extended,
}

impl Tier {
    /// Index into `TierBits`; `None` means "no filtering".
    ///
    /// Full held the `None` slot until the site had words of its own. The
    /// shipped list is the union now, so Full has to be stated as a bitset of
    /// its own and Extended is the tier that filters nothing.
    fn bitset(self) -> Option<usize> {
        match self {
            Tier::Common => Some(0),
            Tier::Standard => Some(1),
            Tier::Full => Some(2),
            Tier::Extended => None,
        }
    }
}

/// One anagram class: a letter multiset and the words that spell it.
pub struct SigClass {
    pub counts: Counts,
    pub len: u8,
    /// Indices into `Dict::words`, best-frequency first; a term (an index at
    /// or past `Dict::word_count`) after every word.
    pub words: Vec<u32>,
    /// Highest zipf byte among the class's words; drives result ranking.
    pub zipf: u8,
    /// The class bits of every term that spells this class, or 0 when only
    /// words do. What lets a class below the minimum word length in when a
    /// class of the mask spells it.
    pub term_bits: ClassMask,
}

/// A term with a digit or a symbol in it, which has no fixed vector: the
/// search counts it through the query's slots.
pub struct ExtraTerm {
    /// Its index in `Dict::words`.
    pub index: u32,
}

/// The searchable dictionary: words, tier membership, and the signature index.
pub struct Dict {
    /// The dictionary's words, sorted, then the terms of the classes, sorted.
    pub words: Vec<String>,
    /// How many of `words` are the dictionary's; the rest are terms.
    pub word_count: usize,
    /// Class bits per term, parallel to the tail of `words` from `word_count`.
    term_bits: Vec<ClassMask>,
    /// The terms that carry a digit or a symbol, in `words` order.
    pub extra_terms: Vec<ExtraTerm>,
    pub zipf: Vec<u8>,
    /// Part-of-speech bitmask per word, parallel to `words`. 0 means unknown.
    pub pos: Vec<u16>,
    pub classes: Vec<SigClass>,
    /// Letter multiset -> index into `classes`. Built once at load so a lookup
    /// is a hash probe rather than a scan of 350,469 classes; `find_class`
    /// runs on every must-include check and every word of an expanded row.
    class_of: HashMap<Counts, u32>,
    tiers: Option<TierBits>,
    /// Word indices admitted at every tier, whatever the bitsets say: the
    /// site's own additions, so a run can search a narrow tier plus them.
    ///
    /// Empty unless `admit` is called, which only the batch does. The site
    /// and the CLI's own `solve` leave it empty and see the tiers exactly as
    /// they were built.
    extra: HashSet<u32>,
}

impl Dict {
    /// Build from an already-decoded word list, and the terms of the classes
    /// (`(term, class bits)`, sorted and unique as the artifact carries them;
    /// none for a dictionary of words alone). A term that is a word of the
    /// list is dropped: the word already spells it, and the build refuses
    /// such a term before it gets here.
    pub fn new(list: WordList, tiers: Option<TierBits>, terms: Vec<(String, ClassMask)>) -> Result<Dict, DictError> {
        let WordList { mut words, mut zipf, mut pos } = list;
        let word_count = words.len();

        let mut grouped: HashMap<Counts, Vec<u32>> = HashMap::with_capacity(words.len());
        for (index, word) in words.iter().enumerate() {
            let counts = Counts::from_word(word).ok_or_else(|| DictError::BadWord(word.clone()))?;
            grouped.entry(counts).or_default().push(index as u32);
        }

        // The terms after the words, with their bits; a term of letters alone
        // joins its letters' class, one with a digit or symbol waits for a
        // query's slots. The words are sorted, so "is it a word" is a binary
        // search, and the terms come sorted, so the tail stays searchable.
        let mut term_bits = Vec::with_capacity(terms.len());
        let mut extra_terms = Vec::new();
        for (term, bits) in terms {
            if !is_term(&term) {
                return Err(DictError::BadTerm(term));
            }
            if bits == 0 || words[..word_count].binary_search(&term).is_ok() {
                continue;
            }
            let index = words.len() as u32;
            if let Some(counts) = Counts::from_word(&term) {
                grouped.entry(counts).or_default().push(index);
            } else {
                extra_terms.push(ExtraTerm { index });
            }
            words.push(term);
            term_bits.push(bits);
            zipf.push(0);
            pos.push(0);
        }

        let mut classes: Vec<SigClass> = grouped
            .into_iter()
            .map(|(counts, mut members)| {
                // Best-known spelling first, so materialized results lead with
                // the word a reader will actually recognize; a term, with no
                // frequency of its own, after every word.
                members.sort_by_key(|&i| {
                    (i as usize >= word_count, std::cmp::Reverse(zipf[i as usize]), words[i as usize].clone())
                });
                let best = members.iter().map(|&i| zipf[i as usize]).max().unwrap_or(0);
                let bits = members
                    .iter()
                    .filter_map(|&i| (i as usize).checked_sub(word_count))
                    .fold(0, |acc, t| acc | term_bits[t]);
                SigClass {
                    counts,
                    len: counts.total() as u8,
                    words: members,
                    zipf: best,
                    term_bits: bits,
                }
            })
            .collect();

        // A stable, deterministic order is required: the search canonicalizes on
        // class index, so a different order would change which representative of
        // each solution gets emitted. Longest first also means the earliest
        // streamed results use the biggest words, which are the interesting ones.
        classes.sort_by(|a, b| {
            b.len
                .cmp(&a.len)
                .then(b.zipf.cmp(&a.zipf))
                .then_with(|| words[a.words[0] as usize].cmp(&words[b.words[0] as usize]))
        });

        let class_of = classes
            .iter()
            .enumerate()
            .map(|(index, class)| (class.counts, index as u32))
            .collect();

        Ok(Dict {
            words,
            word_count,
            term_bits,
            extra_terms,
            zipf,
            pos,
            classes,
            class_of,
            tiers,
            extra: HashSet::new(),
        })
    }

    /// Whether `index` names a term of the classes rather than a word.
    #[inline]
    pub fn is_term(&self, index: u32) -> bool {
        index as usize >= self.word_count
    }

    /// The class bits of `index`: 0 for a dictionary word.
    #[inline]
    pub fn term_bits(&self, index: u32) -> ClassMask {
        (index as usize).checked_sub(self.word_count).and_then(|i| self.term_bits.get(i).copied()).unwrap_or(0)
    }

    /// How many terms of the classes the dictionary carries, one count per
    /// class in `Class::ALL`'s order.
    pub fn term_counts(&self) -> [usize; 8] {
        let mut counts = [0usize; 8];
        for &bits in &self.term_bits {
            for (i, class) in Class::ALL.iter().enumerate() {
                if bits & class.bit() != 0 {
                    counts[i] += 1;
                }
            }
        }
        counts
    }

    /// A term of the classes by its text, if the dictionary carries one. The
    /// terms are sorted after the words, so this is a binary search.
    pub fn term_index(&self, text: &str) -> Option<u32> {
        let terms = &self.words[self.word_count..];
        terms.binary_search_by(|w| w.as_str().cmp(text)).ok().map(|i| (self.word_count + i) as u32)
    }

    /// Admit `words` at every tier, on top of whatever the bitsets hold.
    ///
    /// This is how enumeration searches Common plus the site's additions
    /// without widening Common itself: an addition lives only in Extended, so
    /// a Common search would otherwise never reach it. Returns how many of
    /// `words` were found; a word the dictionary does not carry is ignored,
    /// which is what happens between adding a word and rebuilding the
    /// artifacts.
    pub fn admit(&mut self, words: &[String]) -> usize {
        let mut found = 0;
        for word in words {
            if let Some(index) = self.index_of(word) {
                self.extra.insert(index);
                found += 1;
            }
        }
        found
    }

    /// The index of `word` in the shipped list, whatever its tier, or of a
    /// term of the classes. Both runs are sorted, so this is two binary
    /// searches.
    pub fn index_of(&self, word: &str) -> Option<u32> {
        let words = &self.words[..self.word_count];
        match words.binary_search_by(|w| w.as_str().cmp(word)) {
            Ok(i) => Some(i as u32),
            Err(_) => self.term_index(word),
        }
    }

    /// How many words are admitted beyond their tiers.
    pub fn admitted(&self) -> usize {
        self.extra.len()
    }

    pub fn decode(dict_bytes: &[u8], tier_bytes: Option<&[u8]>, class_bytes: Option<&[u8]>) -> Result<Dict, DictError> {
        let list = WordList::decode(dict_bytes)?;
        let tiers = match tier_bytes {
            Some(b) => Some(TierBits::decode(b)?),
            None => None,
        };
        let terms = match class_bytes {
            Some(b) => TermList::decode(b)?.terms,
            None => Vec::new(),
        };
        Dict::new(list, tiers, terms)
    }

    pub fn word(&self, index: u32) -> &str {
        &self.words[index as usize]
    }

    /// Part-of-speech mask for `word`, or 0 when it is unknown or absent.
    ///
    /// Binary search rather than `find_class`, which scans every class: this is
    /// called once per word of every row a reader is shown, and a linear scan
    /// there would cost more than the ordering it feeds.
    pub fn pos_of(&self, word: &str) -> u16 {
        match self.words[..self.word_count].binary_search_by(|w| w.as_str().cmp(word)) {
            Ok(index) => self.pos.get(index).copied().unwrap_or(0),
            Err(_) => 0,
        }
    }

    /// Spellings of `class` that are in `scope`: words of its tier, terms of
    /// its classes, plus any admitted by `admit`.
    pub fn class_words(&self, class: usize, scope: Scope) -> impl Iterator<Item = u32> + '_ {
        let set = scope.tier.bitset();
        // The emptiness test comes first deliberately: this runs for every
        // word of every class the sweep touches, and the site never admits
        // anything, so the common case must not pay for a hash.
        let extra = (!self.extra.is_empty()).then_some(&self.extra);
        self.classes[class].words.iter().copied().filter(move |&i| {
            if extra.is_some_and(|e| e.contains(&i)) {
                return true;
            }
            if self.is_term(i) {
                return self.term_bits(i) & scope.classes != 0;
            }
            match (set, &self.tiers) {
                (Some(s), Some(bits)) => bits.contains(s, i as usize),
                _ => true,
            }
        })
    }

    /// Whether any spelling of `class` survives in `scope`.
    pub fn class_in_scope(&self, class: usize, scope: Scope) -> bool {
        self.class_words(class, scope).next().is_some()
    }

    /// Look up a word's class, if the word exists in `scope`. A term with a
    /// digit or symbol has no class here; the search resolves it through its
    /// slots.
    pub fn find_class(&self, word: &str, scope: Scope) -> Option<usize> {
        let counts = Counts::from_word(word)?;
        let class = *self.class_of.get(&counts)? as usize;
        let member = self.classes[class]
            .words
            .iter()
            .any(|&i| self.words[i as usize] == word && self.in_scope(i, scope));
        member.then_some(class)
    }

    /// The class for an exact letter multiset, regardless of scope.
    pub fn class_of_counts(&self, counts: Counts) -> Option<usize> {
        self.class_of.get(&counts).map(|&c| c as usize)
    }

    /// Whether spelling `index` is in `scope`: admitted by `admit`, a word of
    /// the tier, or a term of one of the classes.
    pub fn in_scope(&self, index: u32, scope: Scope) -> bool {
        (!self.extra.is_empty() && self.extra.contains(&index))
            || (self.is_term(index) && self.term_bits(index) & scope.classes != 0)
            || self.in_built_tier(index, scope.tier)
    }

    /// Whether `word_index` is in `tier` as the artifact was built, ignoring
    /// anything `admit` let through. A term is in no tier, Extended included.
    ///
    /// The two differ only during a run that admitted additions, and the
    /// difference matters: a result's tier label has to say where a word
    /// really comes from. Labelling through `in_scope` would call every
    /// addition "common" the moment a Common run admitted it.
    pub fn in_built_tier(&self, word_index: u32, tier: Tier) -> bool {
        if self.is_term(word_index) {
            return false;
        }
        match (tier.bitset(), &self.tiers) {
            (Some(s), Some(bits)) => bits.contains(s, word_index as usize),
            _ => true,
        }
    }

    /// The counts of term `index` under a query's slots: a term of letters
    /// alone always has them, one with a digit or symbol only when every such
    /// character has a slot.
    pub fn term_counts_in(&self, index: u32, slots: &Slots) -> Option<Counts> {
        Counts::in_slots(&self.words[index as usize], slots)
    }

    /// Build a small in-memory dictionary. Used by tests and by the CLI when
    /// pointed at a plain newline-delimited word file.
    pub fn from_words<I, S>(words: I) -> Result<Dict, DictError>
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        Dict::from_words_and_terms(words, Vec::<(String, ClassMask)>::new())
    }

    /// [`Dict::from_words`] with the terms of the classes beside the words.
    pub fn from_words_and_terms<I, S, T, U>(words: I, terms: T) -> Result<Dict, DictError>
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
        T: IntoIterator<Item = (U, ClassMask)>,
        U: Into<String>,
    {
        let mut list: Vec<String> = words.into_iter().map(Into::into).collect();
        list.sort();
        list.dedup();
        let zipf = vec![0; list.len()];
        let pos = vec![0; list.len()];
        // Sorted and unique, a term in two classes carrying both bits, as the build emits them.
        let mut terms: Vec<(String, ClassMask)> = terms.into_iter().map(|(t, bits)| (t.into(), bits)).collect();
        terms.sort();
        let mut merged: Vec<(String, ClassMask)> = Vec::with_capacity(terms.len());
        for (term, bits) in terms {
            match merged.last_mut() {
                Some((last, held)) if *last == term => *held |= bits,
                _ => merged.push((term, bits)),
            }
        }
        Dict::new(WordList { words: list, zipf, pos }, None, merged)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn groups_anagrams_into_one_class() {
        let dict = Dict::from_words(["listen", "silent", "tinsel", "stone", "notes"]).unwrap();
        // 5 words, 2 classes: {listen,silent,tinsel} and {stone,notes}
        assert_eq!(dict.classes.len(), 2);
        let sizes: Vec<usize> = dict.classes.iter().map(|c| c.words.len()).collect();
        assert_eq!(sizes.iter().sum::<usize>(), 5);
        assert!(sizes.contains(&3) && sizes.contains(&2));
    }

    #[test]
    fn classes_are_ordered_longest_first() {
        let dict = Dict::from_words(["a", "abc", "ab", "abcd"]).unwrap();
        let lens: Vec<u8> = dict.classes.iter().map(|c| c.len).collect();
        assert_eq!(lens, vec![4, 3, 2, 1]);
    }

    #[test]
    fn find_class_is_exact_and_tier_aware() {
        let dict = Dict::from_words(["listen", "silent", "stone", "notes", "tones"]).unwrap();
        let full = Scope::tier(Tier::Full);
        let listen = dict.find_class("listen", full).unwrap();
        assert_eq!(dict.find_class("silent", full), Some(listen));
        assert_eq!(dict.find_class("tinsel", full), None, "same letters, not a member");
        assert_eq!(dict.find_class("stone", full), dict.find_class("tones", full));
        assert_ne!(dict.find_class("stone", full), Some(listen));
        assert_eq!(dict.find_class("Listen", full), None, "input must be normalized");
        assert_eq!(dict.find_class("", full), None);
        assert_eq!(dict.class_of_counts(Counts::from_word("enlist").unwrap()), Some(listen));
    }

    #[test]
    fn terms_sit_after_the_words_in_no_tier_and_join_their_letters_class() {
        let terms = [
            ("amy", Class::Names.bit()),
            ("u", Class::Shorthand.bit()),
            ("b8", Class::Blends.bit()),
            ("&", Class::Symbols.bit()),
            ("wtf", Class::Acronyms.bit()),
            ("u", Class::Slang.bit()),
            ("may", Class::Names.bit()),
        ];
        let dict = Dict::from_words_and_terms(["may", "yam", "link"], terms).unwrap();
        assert_eq!(dict.word_count, 3);
        // Sorted after the words, unique, `may` dropped as a word already, `u` with both bits.
        assert_eq!(&dict.words[3..], &["&", "amy", "b8", "u", "wtf"]);
        assert_eq!(dict.term_bits(dict.index_of("u").unwrap()), Class::Shorthand.bit() | Class::Slang.bit());
        assert_eq!(dict.term_bits(dict.index_of("link").unwrap()), 0);
        assert!(dict.is_term(dict.index_of("amy").unwrap()) && !dict.is_term(dict.index_of("yam").unwrap()));

        // A letters term joins its class; the class knows its terms' bits.
        let words = Scope::tier(Tier::Extended);
        let names = Scope { tier: Tier::Extended, classes: Class::Names.bit() };
        let may = dict.find_class("may", words).unwrap();
        assert_eq!(dict.classes[may].term_bits, Class::Names.bit());
        assert_eq!(dict.find_class("amy", words), None, "a term is in no tier");
        assert_eq!(dict.find_class("amy", names), Some(may));
        let spelled: Vec<&str> = dict.class_words(may, names).map(|i| dict.word(i)).collect();
        assert_eq!(spelled, ["may", "yam", "amy"], "words first, then the term");
        assert_eq!(dict.class_words(may, words).count(), 2);
        assert!(!dict.in_built_tier(dict.index_of("amy").unwrap(), Tier::Extended));

        // A term of its own opens a class; one with a digit waits for a query's slots.
        let wtf = dict.find_class("wtf", Scope { tier: Tier::Common, classes: Class::Acronyms.bit() }).unwrap();
        assert_eq!(dict.classes[wtf].len, 3);
        assert_eq!(dict.find_class("b8", Scope { tier: Tier::Extended, classes: Class::Blends.bit() }), None);
        assert_eq!(dict.extra_terms.len(), 2);
        assert_eq!(dict.term_index("b8"), dict.index_of("b8"));
        assert_eq!(dict.term_index("amy"), dict.index_of("amy"));
        assert_eq!(dict.term_index("zzz"), None);
        let mut slots = Slots::new();
        let pool = Counts::from_pool("blink182", &mut slots).unwrap();
        let b8 = dict.term_counts_in(dict.index_of("b8").unwrap(), &slots).unwrap();
        assert!(b8.fits_in(pool));
        assert_eq!(dict.term_counts_in(dict.index_of("&").unwrap(), &slots), None);
        // numerals, symbols, shorthand, blends, acronyms, leet, names, slang
        assert_eq!(dict.term_counts(), [0, 1, 1, 1, 1, 0, 1, 1]);
        assert!(matches!(Dict::from_words_and_terms(["a"], [("b-8", 1)]), Err(DictError::BadTerm(_))));
    }

    #[test]
    fn a_term_list_round_trips_through_its_artifact() {
        let mut buf = Vec::new();
        buf.extend_from_slice(MAGIC_CLASSES);
        buf.extend_from_slice(&FORMAT_VERSION.to_le_bytes());
        buf.extend_from_slice(&[0, 0]);
        buf.extend_from_slice(&2u32.to_le_bytes());
        for (term, bits) in [("&", Class::Symbols.bit()), ("b8", Class::Blends.bit())] {
            buf.extend_from_slice(&bits.to_le_bytes());
            buf.push(term.len() as u8);
            buf.extend_from_slice(term.as_bytes());
        }
        let list = TermList::decode(&buf).unwrap();
        assert_eq!(list.terms, [("&".to_owned(), Class::Symbols.bit()), ("b8".to_owned(), Class::Blends.bit())]);
        assert!(matches!(TermList::decode(&buf[..20]), Err(DictError::Truncated)));
        assert!(matches!(TermList::decode(b"ARSMAGNA00000000"), Err(DictError::BadMagic)));
    }

    #[test]
    fn rejects_non_lowercase_words() {
        assert!(matches!(
            Dict::from_words(["Hello"]),
            Err(DictError::BadWord(_))
        ));
    }
}
