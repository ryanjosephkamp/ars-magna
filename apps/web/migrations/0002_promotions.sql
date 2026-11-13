-- Promotions from the search page (roadmap phase C1, voting plan R4).
--
-- promotions        one row per voter per anagram that is not on Discoveries. key is the
--                   letters sorted, a colon, then the words sorted and joined with hyphens
--                   (aaeeglmnnt:elegant-man), so neither word order nor the spelling of the
--                   input splits a count
-- promotion_counts  each key's count, recounted in the same transaction as every change
--
-- words is the phrase in the order the reader saw it, and tier the dictionary they
-- searched. via says where a promotion came from: result (a search result) or typed (the
-- Submit page, phase E). category, why, credit and missing belong to the Submit page and
-- stay empty until then.

CREATE TABLE promotions (
  key TEXT NOT NULL,
  voter TEXT NOT NULL,
  input TEXT NOT NULL,
  words TEXT NOT NULL,
  tier TEXT NOT NULL,
  via TEXT NOT NULL,
  category TEXT,
  why TEXT,
  credit TEXT,
  missing TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (key, voter)
);

CREATE INDEX promotions_by_voter ON promotions (voter, key);

CREATE TABLE promotion_counts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL
);
