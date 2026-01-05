import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Charge tes variables pour les tests Playwright (Node)
dotenv.config({ path: '.env.test.local' });
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback .env

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: ['**/*.spec.ts'],

  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  // Retries on CI
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Global settings
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Collect console logs
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Projects for different devices
  projects: [
    // Desktop Chrome
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // iPhone 13
    {
      name: 'iPhone 13',
      use: {
        ...devices['iPhone 13'],
        // iPhone 13: 390x844
      },
    },

    // iPhone 13 Landscape
    {
      name: 'iPhone 13 Landscape',
      use: {
        ...devices['iPhone 13 landscape'],
      },
    },

    // Pixel 7
    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
        // Pixel 7: 412x915
      },
    },

    // Pixel 7 Landscape
    {
      name: 'Pixel 7 Landscape',
      use: {
        viewport: { width: 915, height: 412 },
        userAgent: devices['Pixel 7'].userAgent,
        deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
      },
    },

    // Tablet - iPad
    {
      name: 'iPad',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
  ],

  // Web server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
