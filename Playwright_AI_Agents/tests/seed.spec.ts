import { test, expect } from '@playwright/test';

/**
 * seed.spec.ts — VWO Login Page
 *
 * This is NOT a regular test. It is a bootstrap file for Playwright AI Agents.
 *
 * What it does:
 * - Planner agent calls planner_setup_page → runs this file first
 * - Generator agent calls generator_setup_page → runs this file first
 * - Navigates to VWO login page and confirms it is ready
 * - Hands the open browser session to the agent to explore
 *
 * Target: https://app.vwo.com/#/login
 * No authentication required — login page is publicly accessible
 */

test('seed', async ({ page }) => {
  await page.goto('/#/login');
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('textbox', { name: 'Email address' })
  ).toBeVisible();

  await page.pause();
});