-- What the input is, on a submission from the Build page (roadmap phase E1).
--
-- about  one factual sentence saying what the input is, at most 200 characters,
--        ending with a full stop: the rule in tools/hits/src/about.ts, which the
--        API checks before it writes. Null on a promotion from a search, and on
--        a submission that left it empty.
--
-- A submission is a promotion with via = 'typed'. It fills category, why,
-- credit and missing, which 0002 made for it, and this column.

ALTER TABLE promotions ADD COLUMN about TEXT;
