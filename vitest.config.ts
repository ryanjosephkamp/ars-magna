import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
    environment: 'node',
    // The engine test loads the real 2.18 MB dictionary and builds the
    // signature index; that is the point of it, but it is not instant.
    testTimeout: 30_000,
  },
});
