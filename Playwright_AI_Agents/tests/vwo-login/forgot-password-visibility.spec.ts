import { test, expect } from '@playwright/test';

/**
 * Scenario 5 — Forgot Password Button Visibility
 * Source: specs/vwo_login_plan.md — Section 1.5
 * Generated from: planner agent output (live DOM verified)
 * Locator strategy: getByRole only
 *
 * Agent finding: "Forgot Password?" renders as a <button> element,
 * NOT an anchor/link. getByRole('link') would fail.
 * getByRole('button', { name: 'Forgot Password?' }) is correct.
 *
 * Scope: Visibility ONLY. Do NOT click — no navigation triggered.
 */

test.describe('VWO Login — Forgot Password Visibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-nav-01: Forgot Password button is visible — NOT a link, a button', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: 'Forgot Password?' });

    // Visible and in DOM
    await expect(forgotBtn).toBeVisible();

    // Not hidden, not off-screen
    await expect(forgotBtn).toBeEnabled();

    // Confirm we are still on login page — no click triggered
    await expect(page).toHaveURL(/\/#\/login/);

    // Login form intact and unmodified
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-nav-02: Sign in with Google button is visible', async ({ page }) => {
    // Agent discovered this element — not in original manual plan
    await expect(
      page.getByRole('button', { name: 'Sign in with Google' })
    ).toBeVisible();
  });

});
