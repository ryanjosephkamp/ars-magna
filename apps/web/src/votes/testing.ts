/**
 * Cloudflare D1's interface over SQLite in memory, with every migration in
 * apps/web/migrations applied, so the tests run the API's real SQL. Test code
 * only: nothing the site bundles imports it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import type { D1Database, D1PreparedStatement, D1Result } from './store.ts';

const MIGRATIONS = new URL('../../migrations/', import.meta.url);

type Statement = D1PreparedStatement & { rows(): Record<string, unknown>[] };

export function memoryD1(): D1Database & { sqlite: DatabaseSync } {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(new URL(file, MIGRATIONS), 'utf8'));
  }

  const statement = (query: string, params: unknown[] = []): Statement => {
    const args = params as never[];
    return {
      bind: (...values: unknown[]) => statement(query, values),
      first: async <T>() => (sqlite.prepare(query).get(...args) as T | undefined) ?? null,
      all: async <T>() => ({ results: sqlite.prepare(query).all(...args) as T[] }),
      run: async () => sqlite.prepare(query).run(...args),
      rows: () => sqlite.prepare(query).all(...args) as Record<string, unknown>[],
    };
  };

  return {
    sqlite,
    prepare: (query: string) => statement(query),
    async batch<T>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
      sqlite.exec('BEGIN');
      try {
        const out = statements.map((s) => ({ results: (s as Statement).rows() as T[] }));
        sqlite.exec('COMMIT');
        return out;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
