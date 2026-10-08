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
| 2026-10-08 | the pull request that adds this row | The queue held 165,244 phrases to screen across 61 files (828,660 words) — about 4.5x the words of the largest queue judged before (2026-09-19: 182,726 words, 14 files). Every open pull request in the repository right now (14 of them: #104, #108 through #120) is an earlier night's Greatest Hits or not-judged run, for 2026-09-22 through 2026-10-07, none merged and nine failing their `test` check; `main` has had no Greatest Hits merge since 2026-09-21(n). Each night's queue generation keeps re-accumulating that backlog while nothing drains it, and tonight's queue is a further step up from last night's (2026-10-07: 155,577 phrases, also not judged, same cause). This session could not read the whole queue itself and did not screen or judge any part of it. | none |
