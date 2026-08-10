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

use crate::counts::Counts;
use std::collections::HashMap;

const MAGIC_DICT: &[u8; 8] = b"ARSMAGNA";
const MAGIC_BITS: &[u8; 8] = b"ARSMBITS";
const FORMAT_VERSION: u16 = 1;

const SECTION_WORDS: u32 = 1;
const SECTION_ZIPF: u32 = 3;

#[derive(Debug)]
pub enum DictError {
    BadMagic,
    UnsupportedVersion(u16),
    Truncated,
    MissingSection(&'static str),
    BadWord(String),
}

impl std::fmt::Display for DictError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DictError::BadMagic => write!(f, "not an Ars Magna artifact"),
            DictError::UnsupportedVersion(v) => write!(f, "unsupported format version {v}"),
            DictError::Truncated => write!(f, "artifact is truncated"),
            DictError::MissingSection(s) => write!(f, "missing {s} section"),
            DictError::BadWord(w) => write!(f, "word {w:?} is not [a-z]+"),
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

        for i in 0..section_count {
            let at = 24 + i * 12;
            let kind = u32_at(buf, at)?;
            let offset = u32_at(buf, at + 4)? as usize;
            let length = u32_at(buf, at + 8)? as usize;
            let slice = buf.get(offset..offset + length).ok_or(DictError::Truncated)?;
            match kind {
                SECTION_WORDS => words_section = Some(slice),
                SECTION_ZIPF => zipf_section = Some(slice),
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

        Ok(WordList { words, zipf })
    }
}

/// Tier membership bitsets, indexed over the Full-tier word ordering.
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
            // Full tier has no bitset: everything is a member.
            None => true,
        }
    }
}

/// Which vocabulary a query runs against. Strictly nested.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Tier {
    Common,
    Standard,
    Full,
}

impl Tier {
    /// Index into `TierBits`; `None` means "no filtering".
    fn bitset(self) -> Option<usize> {
        match self {
            Tier::Common => Some(0),
            Tier::Standard => Some(1),
            Tier::Full => None,
        }
    }
}

/// One anagram class: a letter multiset and the words that spell it.
pub struct SigClass {
    pub counts: Counts,
    pub len: u8,
    /// Indices into `Dict::words`, best-frequency first.
    pub words: Vec<u32>,
    /// Highest zipf byte among the class's words; drives result ranking.
    pub zipf: u8,
}

/// The searchable dictionary: words, tier membership, and the signature index.
pub struct Dict {
    pub words: Vec<String>,
    pub zipf: Vec<u8>,
    pub classes: Vec<SigClass>,
    tiers: Option<TierBits>,
}

impl Dict {
    /// Build from an already-decoded word list.
    pub fn new(list: WordList, tiers: Option<TierBits>) -> Result<Dict, DictError> {
        let WordList { words, zipf } = list;

        let mut grouped: HashMap<Counts, Vec<u32>> = HashMap::with_capacity(words.len());
        for (index, word) in words.iter().enumerate() {
            let counts = Counts::from_word(word).ok_or_else(|| DictError::BadWord(word.clone()))?;
            grouped.entry(counts).or_default().push(index as u32);
        }

        let mut classes: Vec<SigClass> = grouped
            .into_iter()
            .map(|(counts, mut members)| {
                // Best-known spelling first, so materialized results lead with
                // the word a reader will actually recognize.
                members.sort_by_key(|&i| (std::cmp::Reverse(zipf[i as usize]), words[i as usize].clone()));
                let best = members.iter().map(|&i| zipf[i as usize]).max().unwrap_or(0);
                SigClass {
                    counts,
                    len: counts.total() as u8,
                    words: members,
                    zipf: best,
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

        Ok(Dict {
            words,
            zipf,
            classes,
            tiers,
        })
    }

    pub fn decode(dict_bytes: &[u8], tier_bytes: Option<&[u8]>) -> Result<Dict, DictError> {
        let list = WordList::decode(dict_bytes)?;
        let tiers = match tier_bytes {
            Some(b) => Some(TierBits::decode(b)?),
            None => None,
        };
        Dict::new(list, tiers)
    }

    pub fn word(&self, index: u32) -> &str {
        &self.words[index as usize]
    }

    /// Words of `class` that are members of `tier`.
    pub fn class_words(&self, class: usize, tier: Tier) -> impl Iterator<Item = u32> + '_ {
        let set = tier.bitset();
        self.classes[class].words.iter().copied().filter(move |&i| {
            match (set, &self.tiers) {
                (Some(s), Some(bits)) => bits.contains(s, i as usize),
                _ => true,
            }
        })
    }

    /// Whether any spelling of `class` survives in `tier`.
    pub fn class_in_tier(&self, class: usize, tier: Tier) -> bool {
        self.class_words(class, tier).next().is_some()
    }

    /// Look up a word's class, if it exists in `tier`.
    pub fn find_class(&self, word: &str, tier: Tier) -> Option<usize> {
        let counts = Counts::from_word(word)?;
        self.classes.iter().position(|c| {
            c.counts == counts
                && self
                    .class_words_slice(c)
                    .iter()
                    .any(|&i| self.words[i as usize] == word && self.in_tier(i, tier))
        })
    }

    fn class_words_slice<'a>(&self, class: &'a SigClass) -> &'a [u32] {
        &class.words
    }

    pub fn in_tier(&self, word_index: u32, tier: Tier) -> bool {
        match (tier.bitset(), &self.tiers) {
            (Some(s), Some(bits)) => bits.contains(s, word_index as usize),
            _ => true,
        }
    }

    /// Build a small in-memory dictionary. Used by tests and by the CLI when
    /// pointed at a plain newline-delimited word file.
    pub fn from_words<I, S>(words: I) -> Result<Dict, DictError>
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        let mut list: Vec<String> = words.into_iter().map(Into::into).collect();
        list.sort();
        list.dedup();
        let zipf = vec![0; list.len()];
        Dict::new(WordList { words: list, zipf }, None)
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
    fn rejects_non_lowercase_words() {
        assert!(matches!(
            Dict::from_words(["Hello"]),
            Err(DictError::BadWord(_))
        ));
    }
}
