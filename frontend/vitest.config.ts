import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/{unit,integration,rls}/**/*.spec.ts', 'tests/rls.spec.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
