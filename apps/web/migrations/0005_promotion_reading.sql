-- How the reader read the input's numbers and symbols (roadmap phase N): the
-- reading of every item, as JSON, `{"4": "drop"}`; null for an input without
-- any. The review reads the input the same way, so the letters it checks are
-- the letters the reader searched. Set by /api/promote on the row it writes.

ALTER TABLE promotions ADD COLUMN reading TEXT;
