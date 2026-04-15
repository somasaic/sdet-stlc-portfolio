import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://app.vwo.com',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://reqres.in',
        extraHTTPHeaders: {
          'x-api-key': process.env.REQRES_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});