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

    // Wait for response — could be client or server side
    await page.waitForTimeout(5000);

    // Page must not show a 500 error
    const pageContent = await page.content();
    expect(pageContent).not.toContain('500');
    expect(pageContent).not.toContain('Internal Server Error');
    expect(pageContent).not.toContain('stack trace');

    // App must still be functional — Sign in button still present
    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true })
    ).toBeVisible();

    // User must remain on login page
    await expect(page).toHaveURL(/\/#\/login/);
  });

});
