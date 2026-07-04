import { test, expect } from '@playwright/test';

/**
 * Scenario 2 — Invalid Credentials
 * Source: specs/vwo_login_plan.md — Section 1.2
 * Generated from: planner agent output (live DOM verified)
 * Locator strategy: getByRole only
 *
 * NOTE: VWO uses server-side credential validation.
 * Error response takes ~14-17 seconds. test.slow() triples timeout.
 */

test.describe('VWO Login — Invalid Credentials', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-invalid-01: unknown email + wrong password shows error message', async ({ page }) => {
    test.slow();

    await page.getByRole('textbox', { name: 'Email address' }).fill('test_invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // VWO server-side validation takes 14-17 seconds.
    // Error text: 'Your email, password, IP address or account may be blocked.'
    // VWO does NOT use role="alert" — partial text match via getByText is correct.
    await expect(
      page.getByText('Your email, password, IP')
    ).toBeVisible({ timeout: 30000 });

    // User must NOT be redirected to dashboard
    await expect(page).toHaveURL(/\/#\/login/);

    // Login form must remain visible
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-invalid-02: no user enumeration — valid email format shows same error', async ({ page }) => {
    test.slow();

    await page.getByRole('textbox', { name: 'Email address' }).fill('test@wingify.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Same vague error — VWO does not reveal whether email or password was wrong
    await expect(
      page.getByText('Your email, password, IP')
    ).toBeVisible({ timeout: 30000 });

    // User remains on login page
    await expect(page).toHaveURL(/\/#\/login/);
  });

});
