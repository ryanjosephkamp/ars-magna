# Excluded runs

Every judging of a queue that never reached `main`, and why: a run the guards refused, one too large to read,
or one closed unmerged after review. The queue's folder on `main` keeps its screen input either way, and a
queue can still be judged later, by hand, as a new entry. Whatever the excluded run wrote stays on its branch
when one was pushed, as the record. Newest last; a line is added in the pull request that excludes the run,
or, for a run closed on review, in the next pull request that touches this file.

| Queue | Pull request | Why | Branch |
|---|---|---|---|
| 2026-09-18 | #72, closed unmerged on 2026-09-18 | The routine handed its files to subagents. The screen kept 783 phrases where earlier nights kept 6 to 43, 448 of them for one input (The Sheep Detectives), and a keyword script scored those and wrote their justifications from templates. None of the verdicts was judged (D39). | `hits/2026-09-18` |
| 2026-09-19, judged a second time at 17:35 UTC | none: the run's push of `hits/2026-09-19` was refused because the branch already existed, and it deleted its own branch | A test run at an hour other than 07:00 UTC re-judged the newest queue with no `judge-output.jsonl` on main, which was still 2026-09-19 while #82 was unmerged (21 kept, 7 hits). The rows had been judged that morning and were merged as #82; this second judgement survives only in run log `cse_01QYYgRW2LDf41fSQuhn2jjs` on the account that owns the routine, and is not recovered (data rule 3 protects a judgement that became an entry; data rule 4 lists the run here). | none |
