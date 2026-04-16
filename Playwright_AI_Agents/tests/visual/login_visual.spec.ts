import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests — VWO Login Page
 * Approach 5 Key Addon: toHaveScreenshot() — pixel-level baseline comparison
 *
 * Strategy: Clip to login form only — VWO has a dynamic animated background
 * that changes every run. Clipping to the form area gives stable baselines.
 *
 * TC-VR-01: Login page default state — form area baseline
 * TC-VR-02: Error state after invalid login — form area baseline
 * TC-VR-03: Login page with email filled — form area baseline
 */

test.describe('VWO Login — Visual Regression', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  });

  test('TC-VR-01: Login page default state matches baseline', async ({ page }) => {
    const loginForm = page.locator('.login-form, form, [class*="login"], [class*="card"]').first();
    const formBox = await loginForm.boundingBox();

    await expect(page).toHaveScreenshot('vwo-login-default.png', {
      clip: formBox ?? undefined,
      animations: 'disabled',
      maxDiffPixels: 200,
    });
  });

  test('TC-VR-02: Error state after invalid credentials matches baseline', async ({ page }) => {
    test.slow();

    await page.getByRole('textbox', { name: 'Email address' }).fill('wrong@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await page.waitForTimeout(15000);

    const loginForm = page.locator('.login-form, form, [class*="login"], [class*="card"]').first();
    const formBox = await loginForm.boundingBox();

    await expect(page).toHaveScreenshot('vwo-login-error-state.png', {
      clip: formBox ?? undefined,
      animations: 'disabled',
      maxDiffPixels: 200,
    });
  });

  test('TC-VR-03: Login page with email filled matches baseline', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@wingify.com');

    const loginForm = page.locator('.login-form, form, [class*="login"], [class*="card"]').first();
    const formBox = await loginForm.boundingBox();

    await expect(page).toHaveScreenshot('vwo-login-email-filled.png', {
      clip: formBox ?? undefined,
      animations: 'disabled',
      maxDiffPixels: 200,
    });
  });

});