/**
 * Optional last resort: ask Haiku 4.5 to categorize the titles Wikidata
 * could not. Off unless `--classify-with-haiku` is passed and
 * `ANTHROPIC_API_KEY` is set; the nightly run does not use it. Cheap enough
 * to leave on if the unclassified pile grows, but the table in
 * categories.json is the first thing to grow instead.
 */
import { CATEGORIES, isCategory, type Category } from '../ids.ts';

export async function classifyWithHaiku(
  titles: readonly string[],
  deps: { fetch: typeof fetch; apiKey: string; model?: string },
): Promise<Map<string, Category>> {
  const out = new Map<string, Category>();
  if (titles.length === 0) return out;
  const prompt =
    `Categorize each title into exactly one of: ${CATEGORIES.join(', ')}. ` +
    `Use "people" for a person, "companies" for a company or organisation, "products" for a product, ` +
    `software or brand, "titles" for a film, show, album, book or game, "places" for a place, and ` +
    `"phrases" for anything else that is a well-known phrase. Answer "skip" for an event, a concept, ` +
    `or anything that is none of these. Reply with one line per title: <title> | <category>.\n\n` +
    titles.map((t) => `- ${t}`).join('\n');
  const response = await deps.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': deps.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: deps.model ?? 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude API -> HTTP ${response.status}: ${await response.text()}`);
  const body = (await response.json()) as { content: { type: string; text?: string }[] };
  const text = body.content.map((c) => c.text ?? '').join('\n');
  for (const line of text.split('\n')) {
    const [title, category] = line.replace(/^-\s*/, '').split('|').map((s) => s.trim());
    if (title && category && isCategory(category) && titles.includes(title)) out.set(title, category);
  }
  return out;
}
