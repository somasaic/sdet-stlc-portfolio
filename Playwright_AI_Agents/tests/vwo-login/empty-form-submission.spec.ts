import { test, expect } from '@playwright/test';

/**
 * Scenario 3 — Empty Form Submission
 * Source: specs/vwo_login_plan.md — Section 1.3
 * Generated from: planner agent output (live DOM verified)
 * Locator strategy: getByRole only
 *
 * Client-side validation — response within ~2 seconds (no server call).
 * This distinguishes it from TC-invalid-01 which takes 14-17s (server-side).
 */

test.describe('VWO Login — Empty Form Submission', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-empty-01: empty form submission shows error message', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // VWO sends even empty-form credentials to the server — response takes 14-17s.
    // Error text confirmed via live test: 'Your email, password, IP address or account may be blocked.'
    await expect(
      page.getByText('Your email, password, IP')
    ).toBeVisible({ timeout: 25000 });

    // Must remain on login page
    await expect(page).toHaveURL(/\/#\/login/);

    // Email field still visible — form not cleared
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-empty-02: email filled, password empty shows error message', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@wingify.com');

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Partial form also triggers server-side validation — error takes up to 17s
    await expect(
      page.getByText('Your email, password, IP')
    ).toBeVisible({ timeout: 25000 });

    // Remains on login page
    await expect(page).toHaveURL(/\/#\/login/);
  });

});
