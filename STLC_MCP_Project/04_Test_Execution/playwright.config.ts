/**
 * playwright.config.ts
 * --------------------
 * Playwright configuration for VWO Login Page test suite.
 *
 * Run modes:
 *   npx playwright test                            — all tests, all browsers
 *   npx playwright test --headed                   — visible browser
 *   npx playwright test --grep "TC_LOGIN_001"      — single test by ID
 *   npx playwright test --project=chromium         — single browser
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ── Test discovery ──────────────────────────────────────────────────────────
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  // ── Global settings ─────────────────────────────────────────────────────────
  fullyParallel: true,          // Tests in the same file run in parallel
  forbidOnly: !!process.env.CI, // Fail CI if test.only is accidentally committed
  retries: process.env.CI ? 2 : 0, // Retry flaky tests on CI only
  workers: process.env.CI ? 1 : undefined,

  // VWO server-side credential validation takes 14-17 seconds.
  // Default 5s assertion timeout causes negative-login tests to fail in CI.
  expect: {
    timeout: 25000,
  },

  // ── Reporting ───────────────────────────────────────────────────────────────
  reporter: [
    ['list'],                          // Real-time console output
    ['html', { open: 'never' }],       // HTML report in playwright-report/
    ['junit', { outputFile: 'test-results/junit-report.xml' }], // CI integration
  ],

  // ── Shared test options ─────────────────────────────────────────────────────
  use: {
    baseURL:            'https://app.vwo.com',
    actionTimeout:      25_000,    // Max ms for any single action — covers VWO 14-17s response
    navigationTimeout:  30_000,    // Max ms for page.goto() / waitForURL()
    trace:              'on-first-retry',  // Capture trace on flaky retry
    screenshot:         'only-on-failure', // Screenshot on test failure
    video:              'retain-on-failure',
    headless:           true,
  },

  // ── Browser matrix ──────────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports (smoke only — add grep tag if needed)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
});