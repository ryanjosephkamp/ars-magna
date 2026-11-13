-- When a promoted anagram is published on Discover, each promotion of it
-- becomes a vote (voting plan R4, roadmap phase F1).
--
-- converted_to  the hit id this promotion's vote went to, set by the step in
--               Deploy that converts them (apps/web/src/votes/convert.ts);
--               null until then. The promotion row itself is kept, so a vote
--               the reader later takes back is never added again.

ALTER TABLE promotions ADD COLUMN converted_to TEXT;
