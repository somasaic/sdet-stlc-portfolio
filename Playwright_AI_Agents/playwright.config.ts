import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  timeout: 60000,

  // VWO server-side validation takes 14-17s; Angular SPA title may set late.
  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },

  use: {
    baseURL: 'https://app.vwo.com',
    actionTimeout: 20000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});