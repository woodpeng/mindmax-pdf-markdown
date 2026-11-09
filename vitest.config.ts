import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 90,
        lines: 90,
        functions: 95,
        branches: 80,
      },
    },
  },
});
