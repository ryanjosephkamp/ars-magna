# Third-party notices

Ars Magna's code is MIT licensed; see [LICENSE](LICENSE). It uses the following data, each under
its own terms.

## WordNet 3.1

The definitions under `apps/web/public/defs/` are derived from Princeton WordNet 3.1
(https://wordnet.princeton.edu/). Its notice, which also sits beside the files in
`apps/web/public/defs/LICENSE`:

> This software and database is being provided to you, the LICENSEE, by Princeton University
> under the following license. By obtaining, using and/or copying this software and database,
> you agree that you have read, understood, and will comply with these terms and conditions.:
>
> Permission to use, copy, modify and distribute this software and database and its
> documentation for any purpose and without fee or royalty is hereby granted, provided that you
> agree to comply with the following copyright notice and statements, including the disclaimer,
> and that the same appear on ALL copies of the software, database and documentation, including
> modifications that you make for internal use or for distribution.
>
> WordNet 3.1 Copyright 2011 by Princeton University. All rights reserved.
>
> THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES NO
> REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION,
> PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANT-ABILITY OR FITNESS
> FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR
> DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER
> RIGHTS.
>
> The name of Princeton University or Princeton may not be used in advertising or publicity
> pertaining to distribution of the software and/or database. Title to copyright in this
> software, database and any associated documentation shall at all times remain with Princeton
> University and LICENSEE agrees to preserve same.

## English OpenList

The word list the search checks against, pinned to one revision.
https://huggingface.co/datasets/ryanjosephkamp/english-openlist

The dataset's maintainer releases his own contribution to it under the MIT License. The list
was assembled from other sources, which keep their own terms; the dataset's card names them.

## FrequencyWords

Word frequencies from FrequencyWords by Hermit Dave
(https://github.com/hermitdave/FrequencyWords), file `content/2018/en/en_full.txt` at commit
`525f9b5`, which counts words in the OpenSubtitles 2018 corpus
(http://opus.nlpl.eu/OpenSubtitles2018.php). FrequencyWords is under the MIT License for code
and CC BY-SA 4.0 for content (https://creativecommons.org/licenses/by-sa/4.0/). Ars Magna uses
the content.

Ars Magna reduces each word's count to one frequency byte and ranks the words to choose the
Common tier. The frequency bytes in `apps/web/public/dict/full.*.bin` and the Common tier in
`apps/web/public/dict/tiers.*.bits` are adapted from FrequencyWords and are offered under
CC BY-SA 4.0. They come with no warranties.

## Names

The names class (`data/vocabulary/names.jsonl`, shipped in `apps/web/public/dict/classes.*.bin`)
is built from four sources. Each name's `trace` links the record it came from.

- **GeoNames** (https://www.geonames.org/), the `cities15000` dump fetched September 21, 2026,
  under the Creative Commons Attribution 4.0 License
  (https://creativecommons.org/licenses/by/4.0/). Ars Magna keeps places of 300,000 people or
  more and takes each word of a place's name as lowercase letters.
- **Wikidata** (https://www.wikidata.org/), whose structured data is under CC0 1.0
  (https://www.wikidata.org/wiki/Wikidata:Licensing).
- **US Census Bureau** name files: the 2000 surnames and the 1990 given names
  (https://www.census.gov/topics/population/genealogy/data.html), works of the US government.
