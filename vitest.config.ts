import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Enable global test functions (describe, it, expect)
    globals: true,

    // Test environment
    environment: 'node',

    // Include patterns
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],

    // Coverage configuration for Sonar
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
