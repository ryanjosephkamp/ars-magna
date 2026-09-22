-- The class of each term of the anagram that is not a word of the dictionary
-- (decision D63), as JSON keyed by the term: `{"b8": "blends", "1": "shorthand"}`;
-- null when every term is a word, which is every promotion made before the
-- site had the Terms control. Set by /api/promote on the row it writes, from
-- what the Build page's Words known found, so the review knows what a term is.

ALTER TABLE promotions ADD COLUMN classes TEXT;
