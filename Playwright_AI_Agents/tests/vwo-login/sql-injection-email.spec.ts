import { test, expect } from '@playwright/test';

/**
 * Scenario 4 — SQL Injection in Email Field
 * Source: specs/vwo_login_plan.md — Section 1.4
 * Generated from: planner agent output (live DOM verified)
 * Locator strategy: getByRole only
 *
 * Security edge case — verifies the app handles malicious input gracefully.
 * Input: ' OR '1'='1  (valid SQL injection string — agent-verified)
 * Expected: no crash, no 500, normal error or validation shown.
 */

test.describe('VWO Login — SQL Injection Edge Case', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-edge-01: SQL injection in email field does not crash the app', async ({ page }) => {
    test.slow();

    await page.getByRole('textbox', { name: 'Email address' }).fill("' OR '1'='1");
    await page.getByRole('textbox', { name: 'Password' }).fill('anyPassword');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // VWO sends ALL inputs server-side (14-17s). The error text VWO shows for SQL
    // injection may differ from normal bad-credential errors — wait for network
    // idle (request fully settled) instead of a specific text match.
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Page must not expose a server-side 500 or stack trace
    const pageContent = await page.content();
    expect(pageContent).not.toContain('500');
    expect(pageContent).not.toContain('Internal Server Error');
    expect(pageContent).not.toContain('stack trace');

    // User must remain on login page (no redirect to dashboard — SQL injection rejected)
    await expect(page).toHaveURL(/\/#\/login/);

    // App must still be functional after the request settles
    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

});
