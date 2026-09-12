# Add a hit by hand

Replace hit_input, hit_phrase and hit_category, then paste everything below the line into an agent
session opened in the repository. hit_category is one of people, companies, products, titles, places,
phrases.

---

Add a hit to the Ars Magna Greatest Hits: hit_phrase, an anagram of hit_input, in the category hit_category. Read AGENTS.md, then follow "Add a hit by hand" in docs/OPERATOR.md: check the phrase at the narrowest tier it passes, record it as a proposed hit, set it accepted with pnpm hits:set, run the four suites, and open a pull request. If the phrase is not an anagram of the input, stop and say what the check printed. Stop when the pull request is open and its CI is reported.
