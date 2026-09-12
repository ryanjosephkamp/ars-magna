/**
 * The thousand most-viewed English Wikipedia articles for a day.
 *
 * Free, keyless, and exactly the mix wanted: the people, products, places
 * and titles that the world is looking at today. The feed for a day is
 * published a little after the day ends and occasionally lags, so a miss
 * falls back one more day rather than failing the night's run.
 */
import type { RawCandidate, Source, SourceDeps } from './source.ts';

const ENDPOINT = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access';

type Feed = { items: { articles: { article: string; views: number; rank: number }[] }[] };

export function previousDay(date: string, days = 1): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export const wikipediaTop: Source = {
  name: 'wikipedia-top',
  async fetch(date, deps: SourceDeps): Promise<RawCandidate[]> {
    // The feed is for the day *before* the run: today's numbers are not in yet.
    for (const attempt of [1, 2]) {
      const day = previousDay(date, attempt);
      const url = `${ENDPOINT}/${day.replace(/-/g, '/')}`;
      const response = await deps.fetch(url, { headers: { 'user-agent': deps.userAgent } });
      if (response.status === 404) continue;
      if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
      const feed = (await response.json()) as Feed;
      const articles = feed.items[0]?.articles ?? [];
      return articles.map((a) => ({
        title: a.article.replace(/_/g, ' '),
        source: `wikipedia-top:${day}`,
        weight: a.views,
      }));
    }
    throw new Error(`no pageviews for ${previousDay(date)} or the day before`);
  },
};
