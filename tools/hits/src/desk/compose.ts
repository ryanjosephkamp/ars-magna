/**
 * What the review desk's decisions become: the exact commands, in the order
 * to run them, and the filled `docs/prompts/apply-desk.md`.
 *
 * Pure, and with no imports on purpose. `pnpm hits:desk` strips the types
 * from this file and inlines it into the page, so the page and the tests run
 * the same code. Keep to syntax that type stripping can erase.
 */

export type StatusName = 'proposed' | 'accepted' | 'featured' | 'retired';
export type CategoryName = 'people' | 'companies' | 'products' | 'titles' | 'places' | 'phrases';
export type TierName = 'common' | 'standard' | 'full' | 'extended';

export type StatusDecision = { kind: 'status'; id: string; status: StatusName };
export type JustifyDecision = { kind: 'justify'; id: string; text: string };
/** What an input is: one sentence for every hit of it, so `id` is the candidate id. */
export type DescribeDecision = { kind: 'describe'; id: string; text: string };
/** The sense one word of a hit reads in, in that anagram; empty text clears it. */
export type SenseDecision = { kind: 'sense'; id: string; word: string; text: string };
/** How a hit reads on Discover, with listed forms, punctuation and capitals; empty text returns it to the words in order. */
export type DisplayDecision = { kind: 'display'; id: string; text: string };
export type TagDecision = { kind: 'tag'; id: string; add: string[]; remove: string[] };
/**
 * A row of a judged queue that is not in data/hits.jsonl, put there by name.
 * `judged` is the justification in its verdict; `justification` is the one
 * the operator wants, the same text when unchanged.
 */
export type PromoteDecision = {
  kind: 'promote';
  queue: string;
  model: string;
  id: string;
  status: 'accepted' | 'proposed';
  justification: string;
  judged: string;
};
/**
 * The order a hit's words read in. `hit` is whether the id was in
 * data/hits.jsonl when the order was chosen; a near miss takes its order only
 * once it is promoted.
 */
export type OrderDecision = { kind: 'order'; id: string; words: string[]; hit: boolean };
/** The operator's note on one row, for the agent. `display` is how the row read before any reordering. */
export type NoteDecision = { kind: 'note'; id: string; display: string; text: string; hit: boolean };
/**
 * The shelf an accepted hit shows on: Interesting or A stretch. `judged` is
 * where the judge's scores alone put it and `tags` its `shelf:` tags now; a
 * tag records the placement only where it differs from the judged shelf.
 */
export type ShelfDecision = { kind: 'shelf'; id: string; shelf: 'interesting' | 'stretch'; judged: 'interesting' | 'stretch'; tags: string[] };
export type RequeueDecision = { kind: 'requeue'; ids: string[]; settingsBefore: string; rubricBefore: string; category: string; source: string };
/** A deep run into one queue folder, bounded per input; the deep-run prompt carries it out. */
export type DeepDecision = { kind: 'deep'; date: string; perInput: string };
export type SeedDecision = { kind: 'seed'; input: string; category: CategoryName; anchors: string[] };
export type AddDecision = { kind: 'add'; input: string; category: CategoryName; phrase: string; tier: TierName; justification: string; reading?: string };
/**
 * A promoted anagram never to be promoted again, by its code (the SHA-256 of
 * its key). `display` is how the desk showed it, for the list of decisions
 * only: the command carries the code alone, since the words may be a reader's.
 */
export type BlockDecision = { kind: 'block'; id: string; display: string };
export type Decision =
  | StatusDecision
  | JustifyDecision
  | DescribeDecision
  | SenseDecision
  | DisplayDecision
  | TagDecision
  | PromoteDecision
  | OrderDecision
  | NoteDecision
  | ShelfDecision
  | RequeueDecision
  | DeepDecision
  | SeedDecision
  | AddDecision
  | BlockDecision;

/** `notes` are the desk's own notes on the commands; `rowNotes` are the operator's notes on single rows, one list item each. */
export type Composed = { commands: string[]; notes: string[]; rowNotes: string[] };

export const DESK_CATEGORIES: CategoryName[] = ['people', 'companies', 'products', 'titles', 'places', 'phrases'];
const STATUS_ORDER: StatusName[] = ['featured', 'accepted', 'proposed', 'retired'];
/** A promoted anagram's code: the SHA-256 of its key, in lowercase hex. */
const CODE = /^[0-9a-f]{64}$/;

/** A shell word: as it is when it is safe, otherwise in single quotes. */
export function shellQuote(text: string): string {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

/** Letters that do not decompose into a base letter and a mark. */
const FOLD: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', ł: 'l', đ: 'd', ð: 'd', þ: 'th', ı: 'i' };

/** A reading of an input's numbers and symbols: item → name, as `@ars-magna/engine/readings` has it. */
export type ReadingMap = Readonly<Record<string, string>>;

/**
 * The engine's reading step, as this file uses it. This file imports nothing,
 * since the page inlines it, so the page (which inlines the engine's
 * `readings.ts` first) and `desk.ts` each hand the functions in with
 * `setReadings`. Until then an input reads as before phase N: no numbers.
 */
export type Readings = {
  /** The input with its numbers and symbols read as letters. */
  readInput(input: string, reading?: ReadingMap): string;
  /** The reading of every item, defaults filled in, or null for an input without items. */
  fullReading(input: string, reading?: ReadingMap): Record<string, string> | null;
  /** Why a reading does not fit the input, or null. */
  readingProblem(input: string, reading: ReadingMap): string | null;
  /** The reading in words: `182 read as one hundred eighty-two`. */
  describeReading(input: string, reading?: ReadingMap): string;
  /** `182:digits,2:too` → the map, or null when not written that way. */
  parseReading(text: string): Record<string, string> | null;
};

let readings: Readings = {
  readInput: (input) => input,
  fullReading: () => null,
  readingProblem: () => null,
  describeReading: () => '',
  parseReading: () => null,
};

export function setReadings(engine: Readings): void {
  readings = engine;
}

/** The engine's reading step, for the page. */
export function readingsOf(): Readings {
  return readings;
}

/**
 * The input's letters as the pipeline folds them: its numbers and symbols
 * read (by the defaults, or as `reading` says), then lowercase a to z, accents
 * removed, nothing else.
 */
export function foldLetters(text: string, reading?: ReadingMap): string {
  const mapped = [...readings.readInput(text, reading).toLowerCase()].map((c) => FOLD[c] ?? c).join('');
  return mapped.normalize('NFKD').replace(/[^a-z]/g, '');
}

export function candidateIdOf(input: string, category: string, reading?: ReadingMap): string {
  return `${foldLetters(input, reading)}:${category}`;
}

/** The candidate a hit or a queue row belongs to: the first two parts of its id. */
export function candidateOfHit(id: string): string {
  return id.split(':').slice(0, 2).join(':');
}

export function hitIdOf(input: string, category: string, words: readonly string[], reading?: ReadingMap): string {
  const folded = words.map((w) => foldLetters(w)).filter((w) => w.length > 0).sort();
  return `${candidateIdOf(input, category, reading)}:${folded.join('-')}`;
}

/** The reading an Add a hit decision names, parsed; undefined for none. */
export function readingOfAdd(d: { reading?: string }): ReadingMap | undefined {
  const text = d.reading?.trim();
  if (!text) return undefined;
  return readings.parseReading(text) ?? undefined;
}

/** Does the phrase use exactly the input's letters, the input read as `reading` says? */
export function phraseFits(input: string, phrase: string, reading?: ReadingMap): boolean {
  const sorted = (text: string, r?: ReadingMap) => [...foldLetters(text, r)].sort().join('');
  return sorted(input, reading).length > 0 && sorted(input, reading) === sorted(phrase);
}

function fitsIn(word: string, input: string): boolean {
  const counts = new Map<string, number>();
  for (const c of foldLetters(input)) counts.set(c, (counts.get(c) ?? 0) + 1);
  for (const c of word) {
    const n = counts.get(c) ?? 0;
    if (n === 0) return false;
    counts.set(c, n - 1);
  }
  return true;
}

/**
 * Seed lines, one input per line: `input | category | anchor anchor`. The
 * category defaults to phrases. An id already in the pool, one repeated, an
 * unknown category or an anchor that does not fit is a problem, not a seed.
 */
export function parseSeeds(text: string, known: readonly string[]): { seeds: SeedDecision[]; problems: string[] } {
  const seeds: SeedDecision[] = [];
  const problems: string[] = [];
  const pool = new Set(known);
  const listed = new Set<string>();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith('#')) continue;
    const parts = line.split('|').map((p) => p.trim());
    const input = parts[0] ?? '';
    const category = (parts[1] || 'phrases').toLowerCase();
    if (foldLetters(input).length === 0) {
      problems.push(`${line}: the input has no letters`);
      continue;
    }
    if (!(DESK_CATEGORIES as string[]).includes(category)) {
      problems.push(`${input}: unknown category ${category}; use one of ${DESK_CATEGORIES.join(', ')}`);
      continue;
    }
    const id = candidateIdOf(input, category);
    if (pool.has(id) || listed.has(id)) {
      problems.push(`${input}: ${id} is already ${pool.has(id) ? 'in the pool' : 'listed above'}`);
      continue;
    }
    const anchors = [...new Set((parts[2] ?? '').split(/\s+/).filter((a) => a.length > 0).map((a) => a.toLowerCase()))];
    const bad = anchors.filter((a) => !/^[a-z]+$/.test(a) || !fitsIn(a, input));
    if (bad.length > 0) {
      problems.push(`${input}: the anchor ${bad.join(', ')} does not fit in its letters`);
      continue;
    }
    listed.add(id);
    seeds.push({ kind: 'seed', input, category: category as CategoryName, anchors });
  }
  return { seeds, problems };
}

/**
 * The punctuation a hit's display may carry (decision D27): apostrophe, hyphen,
 * comma, full stop, question mark, colon, semicolon and quotation marks, the
 * typographic marks included. Never an exclamation mark, which the site's
 * voice leaves out. Everything else in a display is a letter or a space.
 */
export const DISPLAY_MARKS = "'’-,.?:;\"“”‘";
/** The marks that may open or close a token: everything but the apostrophe and the hyphen, which belong inside a form. */
const EDGE_MARKS = ',.?:;"“”‘’';

/** A display's apostrophes as the forms file spells them, so `don’t` finds `don't`. */
function straightApostrophes(text: string): string {
  return text.replace(/’/g, "'");
}

/**
 * Why a display cannot stand for a hit's words, or null when it can. Pure, and
 * the one rule `hits:display`, ingest, the promotions review and the desk all
 * apply.
 *
 * A display reads the hit's words, in the order they read, once each, as the
 * words themselves or as listed forms of them (`forms` maps a form to the
 * word its letters spell: `it's` to `its`), with the marks `DISPLAY_MARKS`
 * and capitals for I, names, acronyms and the start of a sentence: the
 * capitals of a token come first (`Dirty`, `NASA`, `I'm`), never after a
 * lowercase letter. A token with an apostrophe or hyphen that is no listed
 * form (a possessive, `dog's` for `dogs`) is refused unless `possessives` is
 * set, which only the operator's own command sets: the judge may suggest a
 * listed form, never a possessive. The letters of the whole display are the
 * hit's letters, which the word rule already guarantees and this states.
 */
export function displayProblem(
  display: string,
  words: readonly string[],
  forms: Readonly<Record<string, string>>,
  options: { possessives?: boolean } = {},
): string | null {
  const text = display.replace(/\s+/g, ' ').trim();
  if (text.length === 0) return 'the display is empty';
  if (/!/.test(text)) return 'an exclamation mark is never shown';
  for (const char of text) {
    if (/[a-zA-Z ]/.test(char) || DISPLAY_MARKS.includes(char)) continue;
    return `“${char}” is not a letter or one of the marks a display may carry (${DISPLAY_MARKS.replace(/(.)/g, '$1 ').trim()})`;
  }
  const read: string[] = [];
  for (const token of text.split(' ')) {
    let core = token;
    while (core.length > 0 && EDGE_MARKS.includes(core[0]!)) core = core.slice(1);
    while (core.length > 0 && EDGE_MARKS.includes(core[core.length - 1]!)) core = core.slice(0, -1);
    if (core.length === 0) return `“${token}” has no letters`;
    const letters = core.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return `“${token}” has no letters`;
    if (/[a-z][A-Z]/.test(letters)) return `“${token}” has a capital after a lowercase letter`;
    const lower = letters.toLowerCase();
    const spelled = straightApostrophes(core.toLowerCase());
    if (/['’-]/.test(spelled)) {
      const listed = forms[spelled];
      if (listed !== undefined) {
        if (listed !== lower) return `“${token}” is the listed form of ${listed}, not of ${lower}`;
      } else if (!options.possessives) {
        return `“${token}” is not a listed form (a possessive appears only by the operator's command)`;
      }
    }
    read.push(lower);
  }
  if (read.join(' ') !== words.join(' ')) {
    return `the display reads ${read.join(' ')}, not the words ${words.join(' ')} in their order`;
  }
  return null;
}

/** The last decision of a kind for each key, in the order the last ones were made. */
function lastBy<T extends Decision>(decisions: readonly Decision[], kind: T['kind'], key: (d: T) => string): T[] {
  const latest = new Map<string, T>();
  for (const d of decisions) {
    if (d.kind !== kind) continue;
    const k = key(d as T);
    latest.delete(k);
    latest.set(k, d as T);
  }
  return [...latest.values()];
}

/**
 * The commands for a set of decisions, grouped so each runs after what it
 * needs: seeds and requeues, a deep run, rows promoted from a queue, word
 * orders, then justifications, what inputs are, senses, displays, tags, shelves and statuses, then blocks, then hits added by hand. A
 * later decision about the same thing replaces an earlier one. The notes on
 * rows come out as a list for the prompt, each with the row's chosen order.
 */
export function composeCommands(decisions: readonly Decision[], today: string): Composed {
  const commands: string[] = [];
  const notes: string[] = [];
  const rowNotes: string[] = [];
  const noted = new Map(
    lastBy<NoteDecision>(decisions, 'note', (d) => d.id)
      .filter((d) => d.text.trim().length > 0)
      .map((d) => [d.id, d]),
  );

  const seeds = lastBy<SeedDecision>(decisions, 'seed', (d) => candidateIdOf(d.input, d.category));
  if (seeds.length > 0) {
    // A seed is read by the defaults, and records how when its input has a number or a symbol.
    const lines = seeds.map((s) => {
      const reading = readings.fullReading(s.input);
      return JSON.stringify({
        id: candidateIdOf(s.input, s.category),
        input: s.input,
        category: s.category,
        source: 'manual',
        first_seen: today,
        status: 'new',
        ...(s.anchors.length > 0 ? { anchors: s.anchors } : {}),
        ...(reading ? { reading } : {}),
      });
    });
    commands.push(["cat >> data/candidates.jsonl <<'EOF'", ...lines, 'EOF'].join('\n'));
  }

  for (const r of lastBy<RequeueDecision>(decisions, 'requeue', () => 'requeue')) {
    const args = [
      ...(r.settingsBefore ? [`--settings-before=${r.settingsBefore}`] : []),
      ...(r.rubricBefore ? [`--rubric-before=${r.rubricBefore}`] : []),
      ...(r.category ? [`--category=${r.category}`] : []),
      ...(r.source ? [`--source=${r.source}`] : []),
      ...r.ids.map(shellQuote),
    ].join(' ');
    commands.push(`pnpm hits:requeue ${args} --dry-run`, `pnpm hits:requeue ${args}`);
  }

  for (const d of lastBy<DeepDecision>(decisions, 'deep', () => 'deep')) {
    const size = d.perInput && d.perInput !== 'all' ? `${d.perInput} phrases per input` : 'no bound per input';
    commands.push(`# then carry out the deep run from data/queue/${d.date} on, at ${size}, as docs/prompts/deep-run.md describes`);
  }

  const justifications = new Map(lastBy<JustifyDecision>(decisions, 'justify', (d) => d.id).map((d) => [d.id, d.text]));
  const statuses = new Map(lastBy<StatusDecision>(decisions, 'status', (d) => d.id).map((d) => [d.id, d.status]));
  const promoted = new Map<string, { queue: string; model: string; status: string; ids: string[] }>();
  const promotes = lastBy<PromoteDecision>(decisions, 'promote', (d) => d.id);
  for (const p of promotes) {
    const text = p.justification.trim();
    const judged = p.judged.trim();
    const edited = text.length > 0 && text !== judged;
    // Ingest accepts a row straight away only with the verdict's own
    // justification; otherwise it goes in as proposed and is accepted after
    // its justification is set.
    const direct = p.status === 'accepted' && !edited && judged.length > 0;
    const status = direct ? 'accepted' : 'proposed';
    const key = [p.queue, p.model, status].join('|');
    const group = promoted.get(key) ?? { queue: p.queue, model: p.model, status, ids: [] };
    group.ids.push(p.id);
    promoted.set(key, group);
    if (edited && !justifications.has(p.id)) justifications.set(p.id, text);
    if (p.status === 'accepted' && !direct) {
      if (edited) {
        if (!statuses.has(p.id)) statuses.set(p.id, 'accepted');
      } else if (noted.has(p.id)) {
        notes.push(
          `${p.id} has no justification yet, so it goes in as proposed. Write one plain sentence for it from my note on it below, ` +
            `set it with pnpm hits:justify, then accept it with pnpm hits:set --status=accepted ${p.id}.`,
        );
      } else {
        notes.push(`${p.id} has no justification yet, so it goes in as proposed. Give it one with pnpm hits:justify before accepting it.`);
      }
    }
  }
  for (const g of promoted.values()) {
    commands.push(`pnpm hits:ingest --date=${g.queue} --model=${shellQuote(g.model)} --only=${g.ids.join(',')} --status=${g.status}`);
  }

  // A near miss's order is set once ingest has written it; one left in its queue has no line to change.
  const promotedBy = new Map(promotes.map((p) => [p.id, p]));
  const orders = lastBy<OrderDecision>(decisions, 'order', (d) => d.id);
  for (const o of orders) {
    if (o.hit || promotedBy.has(o.id)) commands.push(`pnpm hits:order ${o.id} ${o.words.map(shellQuote).join(' ')}`);
  }

  for (const [id, text] of justifications) commands.push(`pnpm hits:justify ${id} ${shellQuote(text)}`);

  // After ingest and the justifications, so a promoted near miss has its hit line to take the sentence.
  for (const d of lastBy<DescribeDecision>(decisions, 'describe', (x) => x.id)) {
    commands.push(`pnpm hits:describe ${d.id} ${shellQuote(d.text)}`);
  }

  for (const d of lastBy<SenseDecision>(decisions, 'sense', (x) => `${x.id} ${x.word}`)) {
    const text = d.text.trim();
    commands.push(`pnpm hits:sense ${d.id} ${d.word} ${text ? shellQuote(text) : '--clear'}`);
  }

  // After the word orders, which rewrite a display, and the senses: the display reads the words in their chosen order.
  for (const d of lastBy<DisplayDecision>(decisions, 'display', (x) => x.id)) {
    const text = d.text.replace(/\s+/g, ' ').trim();
    commands.push(`pnpm hits:display ${d.id} ${text ? shellQuote(text) : '--clear'}`);
  }

  for (const t of lastBy<TagDecision>(decisions, 'tag', (d) => d.id)) {
    const changes = [...t.add.map((x) => `+${x}`), ...t.remove.map((x) => `-${x}`)];
    if (changes.length > 0) commands.push(`pnpm hits:tag ${t.id} ${changes.map(shellQuote).join(' ')}`);
  }

  for (const s of lastBy<ShelfDecision>(decisions, 'shelf', (d) => d.id)) {
    const want = s.shelf === s.judged ? [] : [`shelf:${s.shelf}`];
    const changes = [...want.filter((t) => !s.tags.includes(t)).map((t) => `+${t}`), ...s.tags.filter((t) => !want.includes(t)).map((t) => `-${t}`)];
    if (changes.length > 0) commands.push(`pnpm hits:tag ${s.id} ${changes.join(' ')}`);
  }

  for (const status of STATUS_ORDER) {
    const ids = [...statuses].filter(([, s]) => s === status).map(([id]) => id);
    if (ids.length > 0) commands.push(`pnpm hits:set --status=${status} ${ids.join(' ')}`);
  }

  // By code only: nothing a reader typed goes into a command.
  const blocks = lastBy<BlockDecision>(decisions, 'block', (d) => d.id).filter((d) => CODE.test(d.id));
  for (const b of blocks) commands.push(`pnpm promotions:block --code=${b.id}`);

  for (const a of lastBy<AddDecision>(decisions, 'add', (d) => hitIdOf(d.input, d.category, d.phrase.split(/\s+/), readingOfAdd(d)))) {
    const words = a.phrase.split(/\s+/).map((w) => foldLetters(w)).filter((w) => w.length > 0);
    // The reading the operator typed, if any, goes to the engine's check, to propose_hit and into the id.
    const reading = readingOfAdd(a);
    const readFlag = a.reading?.trim() ? ` --read=${shellQuote(a.reading.trim())}` : '';
    const readArg = reading && Object.keys(reading).length > 0 ? ` and reading ${JSON.stringify(reading)}` : '';
    commands.push(
      `cargo run --release -p anagram-cli -- check ${shellQuote(a.input)} ${shellQuote(a.phrase)} --tier=${a.tier}${readFlag}`,
      `# then call the MCP tool propose_hit with input ${JSON.stringify(a.input)}, category ${a.category}, words ${JSON.stringify(words)}, tier ${a.tier}, justification ${JSON.stringify(a.justification)}${readArg}`,
      `pnpm hits:set --status=accepted ${hitIdOf(a.input, a.category, words, reading)}`,
    );
  }

  const chosen = new Map(orders.map((o) => [o.id, o.words.join(' ')]));
  for (const n of noted.values()) {
    const p = promotedBy.get(n.id);
    const where = n.hit ? '' : p ? `, promoted from ${p.queue} as ${p.status}` : ', a near miss left in its queue';
    const text = n.text.trim().replace(/\s*\n\s*/g, '\n  ');
    rowNotes.push(`- ${n.id}, reading "${chosen.get(n.id) ?? n.display}"${where}: ${text}`);
  }

  return { commands, notes, rowNotes };
}

/** The part of a prompt file an agent receives: everything below its `---` line. */
export function promptBody(template: string): string {
  const lines = template.split('\n');
  const at = lines.findIndex((l) => l.trim() === '---');
  return (at >= 0 ? lines.slice(at + 1) : lines).join('\n').trim();
}

/** `docs/prompts/deep-run.md` with deep_run_scope and deep_run_size filled. */
export function fillDeepRunPrompt(template: string, scope: string, size: string): string {
  return promptBody(template)
    .split('deep_run_size')
    .join(size.trim() || 'the deep preset')
    .split('deep_run_scope')
    .join(scope.trim() || 'as I describe below');
}

/** `docs/prompts/apply-desk.md` with desk_branch, desk_notes, desk_row_notes and desk_commands filled. */
export function fillPrompt(template: string, commands: readonly string[], notes: string, branch: string, rowNotes: readonly string[] = []): string {
  const block = commands.length > 0 ? ['```bash', ...commands, '```'].join('\n') : '(no commands)';
  return promptBody(template)
    .split('desk_branch')
    .join(branch)
    .split('desk_row_notes')
    .join(rowNotes.length > 0 ? rowNotes.join('\n') : 'none')
    .split('desk_notes')
    .join(notes.trim() || 'none')
    .split('desk_commands')
    .join(block);
}
