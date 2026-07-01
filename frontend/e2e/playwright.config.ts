/**
 * Playwright Configuration — RH Unlimitech Cloud E2E Tests.
 *
 * Modes:
 * - Headless: npx playwright test (launches Chromium)
 * - CDP: CDP_ENDPOINT=http://localhost:9223 npx playwright test (connects to Chrome)
 *
 * Environment Variables:
 * - BASE_URL: Frontend URL (default: http://localhost:5173)
 * - CDP_ENDPOINT: Chrome DevTools Protocol endpoint (optional)
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.ts',

  /* Maximum time one test can run */
  timeout: 30_000,

  /* Expect assertions timeout */
  expect: {
    timeout: 10_000,
  },

  /* Run tests in serial within each file (flows are sequential) */
  fullyParallel: false,
  workers: 1,

  /* Fail the build on CI if you accidentally left test.only in the source */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Reporter */
  reporter: process.env.CI ? 'html' : 'list',

  /* Shared settings for all projects */
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },

  /* No browser projects — we manage browser lifecycle in createSerialFlow (base.ts) */
  projects: [
    {
      name: 'happy-path',
      testDir: './specs/happy-path',
    },
    {
      name: 'validation',
      testDir: './specs/validation',
    },
  ],
});
