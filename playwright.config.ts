import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

// Charge tes variables pour les tests Playwright (Node)
dotenv.config({ path: '.env.test.local' });
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback .env

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: ['**/*.spec.ts'],
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
