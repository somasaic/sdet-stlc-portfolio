import { test, expect } from '@playwright/test';

/**
 * Scenario 1 — Page Load Smoke
 * Source: specs/vwo_login_plan.md — Section 1.1
 * Generated from: planner agent output (live DOM verified)
 * Locator strategy: getByRole only
 */

test.describe('VWO Login — Page Load Smoke', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');
  });

  test('TC-smoke-01: page title contains VWO', async ({ page }) => {
    // VWO's exact title may vary by region/version — match any title containing 'VWO'
    await expect(page).toHaveTitle(/VWO/);
  });

  test('TC-smoke-02: VWO logo image is visible', async ({ page }) => {
    // Use regex for name — logo alt text may vary between 'VWO' and 'VWO Logo' etc.
    await expect(
      page.getByRole('img', { name: /VWO/i })
    ).toBeVisible();
  });

  test('TC-smoke-03: email address input is visible', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-smoke-04: password input is visible', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: 'Password' })
    ).toBeVisible();
  });

  test('TC-smoke-05: Sign in button is visible and enabled', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: 'Sign in', exact: true });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toBeEnabled();
  });

  test('TC-smoke-06: Forgot Password button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Forgot Password?' })
    ).toBeVisible();
  });

});
