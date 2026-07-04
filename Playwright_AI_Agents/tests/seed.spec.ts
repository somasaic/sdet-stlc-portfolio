import { test, expect } from '@playwright/test';

/**
 * seed.spec.ts — VWO Login Page
 *
 * Bootstrap file for Playwright AI Agents (--loop=claude).
 * Planner and Generator call planner_setup_page / generator_setup_page
 * which runs this file first to set up the browser context.
 *
 * NOTE: No page.pause() — Claude Code loop handles session handoff
 * differently from VS Code loop. pause() causes MCP to hang on Windows.
 */

test('seed', async ({ page }) => {
  await page.goto('/#/login');
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('textbox', { name: 'Email address' })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Sign in', exact: true })
  ).toBeVisible();

  // Seed complete — browser context ready for agent exploration
});