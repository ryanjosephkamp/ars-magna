-- Votes on Discoveries (voting plan, phase V2).
--
-- votes        one row per voter per hit; the voter is a random id the browser made
-- vote_counts  each hit's count, recounted in the same transaction as every change
-- rate_limits  actions per connection per UTC hour; the key is a salted hash that
--              changes daily, never an address

CREATE TABLE votes (
  hit_id TEXT NOT NULL,
  voter TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (hit_id, voter)
);

CREATE INDEX votes_by_voter ON votes (voter);

CREATE TABLE vote_counts (
  hit_id TEXT PRIMARY KEY,
  count INTEGER NOT NULL
);

CREATE TABLE rate_limits (
  key TEXT NOT NULL,
  bucket TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (key, bucket)
);
