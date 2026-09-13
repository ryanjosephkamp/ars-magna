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
export type TierName = 'common' | 'standard' | 'full';

export type StatusDecision = { kind: 'status'; id: string; status: StatusName };
export type JustifyDecision = { kind: 'justify'; id: string; text: string };
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
export type RequeueDecision = { kind: 'requeue'; ids: string[]; settingsBefore: string; rubricBefore: string; category: string; source: string };
export type DeepDecision = { kind: 'deep'; date: string };
export type SeedDecision = { kind: 'seed'; input: string; category: CategoryName; anchors: string[] };
export type AddDecision = { kind: 'add'; input: string; category: CategoryName; phrase: string; tier: TierName; justification: string };
export type Decision =
  | StatusDecision
  | JustifyDecision
  | TagDecision
  | PromoteDecision
  | RequeueDecision
  | DeepDecision
  | SeedDecision
  | AddDecision;

export type Composed = { commands: string[]; notes: string[] };

export const DESK_CATEGORIES: CategoryName[] = ['people', 'companies', 'products', 'titles', 'places', 'phrases'];
const STATUS_ORDER: StatusName[] = ['featured', 'accepted', 'proposed', 'retired'];

/** A shell word: as it is when it is safe, otherwise in single quotes. */
export function shellQuote(text: string): string {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

/** Letters that do not decompose into a base letter and a mark. */
const FOLD: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', ł: 'l', đ: 'd', ð: 'd', þ: 'th', ı: 'i' };

/** The input's letters as the pipeline folds them: lowercase a to z, accents removed, nothing else. */
export function foldLetters(text: string): string {
  const mapped = [...text.toLowerCase()].map((c) => FOLD[c] ?? c).join('');
  return mapped.normalize('NFKD').replace(/[^a-z]/g, '');
}

export function candidateIdOf(input: string, category: string): string {
  return `${foldLetters(input)}:${category}`;
}

export function hitIdOf(input: string, category: string, words: readonly string[]): string {
  const folded = words.map(foldLetters).filter((w) => w.length > 0).sort();
  return `${candidateIdOf(input, category)}:${folded.join('-')}`;
}

/** Does the phrase use exactly the input's letters? */
export function phraseFits(input: string, phrase: string): boolean {
  const sorted = (text: string) => [...foldLetters(text)].sort().join('');
  return sorted(input).length > 0 && sorted(input) === sorted(phrase);
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
 * needs: seeds and requeues, a deep run, rows promoted from a queue, then
 * justifications, tags and statuses, then hits added by hand. A later
 * decision about the same thing replaces an earlier one.
 */
export function composeCommands(decisions: readonly Decision[], today: string): Composed {
  const commands: string[] = [];
  const notes: string[] = [];

  const seeds = lastBy<SeedDecision>(decisions, 'seed', (d) => candidateIdOf(d.input, d.category));
  if (seeds.length > 0) {
    const lines = seeds.map((s) =>
      JSON.stringify({
        id: candidateIdOf(s.input, s.category),
        input: s.input,
        category: s.category,
        source: 'manual',
        first_seen: today,
        status: 'new',
        ...(s.anchors.length > 0 ? { anchors: s.anchors } : {}),
      }),
    );
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
    commands.push(
      `pnpm hits:enumerate --date=${d.date} --preset=deep`,
      `pnpm hits:prefilter --date=${d.date} --per-input=all`,
      `pnpm hits:screen --date=${d.date}`,
    );
    notes.push(`Then screen and judge data/queue/${d.date} as automation/judge-routine.md describes from step 3, and ingest it with the engine check on.`);
  }

  const justifications = new Map(lastBy<JustifyDecision>(decisions, 'justify', (d) => d.id).map((d) => [d.id, d.text]));
  const statuses = new Map(lastBy<StatusDecision>(decisions, 'status', (d) => d.id).map((d) => [d.id, d.status]));
  const promoted = new Map<string, { queue: string; model: string; status: string; ids: string[] }>();
  for (const p of lastBy<PromoteDecision>(decisions, 'promote', (d) => d.id)) {
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
      } else {
        notes.push(`${p.id} has no justification yet, so it goes in as proposed. Give it one with pnpm hits:justify before accepting it.`);
      }
    }
  }
  for (const g of promoted.values()) {
    commands.push(`pnpm hits:ingest --date=${g.queue} --model=${shellQuote(g.model)} --only=${g.ids.join(',')} --status=${g.status}`);
  }

  for (const [id, text] of justifications) commands.push(`pnpm hits:justify ${id} ${shellQuote(text)}`);

  for (const t of lastBy<TagDecision>(decisions, 'tag', (d) => d.id)) {
    const changes = [...t.add.map((x) => `+${x}`), ...t.remove.map((x) => `-${x}`)];
    if (changes.length > 0) commands.push(`pnpm hits:tag ${t.id} ${changes.map(shellQuote).join(' ')}`);
  }

  for (const status of STATUS_ORDER) {
    const ids = [...statuses].filter(([, s]) => s === status).map(([id]) => id);
    if (ids.length > 0) commands.push(`pnpm hits:set --status=${status} ${ids.join(' ')}`);
  }

  for (const a of lastBy<AddDecision>(decisions, 'add', (d) => hitIdOf(d.input, d.category, d.phrase.split(/\s+/)))) {
    const words = a.phrase.split(/\s+/).map(foldLetters).filter((w) => w.length > 0);
    commands.push(
      `cargo run --release -p anagram-cli -- check ${shellQuote(a.input)} ${shellQuote(a.phrase)} --tier=${a.tier}`,
      `# then call the MCP tool propose_hit with input ${JSON.stringify(a.input)}, category ${a.category}, words ${JSON.stringify(words)}, tier ${a.tier} and justification ${JSON.stringify(a.justification)}`,
      `pnpm hits:set --status=accepted ${hitIdOf(a.input, a.category, words)}`,
    );
  }

  return { commands, notes };
}

/** The part of a prompt file an agent receives: everything below its `---` line. */
export function promptBody(template: string): string {
  const lines = template.split('\n');
  const at = lines.findIndex((l) => l.trim() === '---');
  return (at >= 0 ? lines.slice(at + 1) : lines).join('\n').trim();
}

/** `docs/prompts/apply-desk.md` with desk_branch, desk_notes and desk_commands filled. */
export function fillPrompt(template: string, commands: readonly string[], notes: string, branch: string): string {
  const block = commands.length > 0 ? ['```bash', ...commands, '```'].join('\n') : '(no commands)';
  return promptBody(template)
    .split('desk_branch')
    .join(branch)
    .split('desk_notes')
    .join(notes.trim() || 'none')
    .split('desk_commands')
    .join(block);
}
