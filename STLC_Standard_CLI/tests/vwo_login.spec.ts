import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('VWO Login Page — STLC Standard CLI', () => {

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-01: login page loads with all key elements visible', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordButton).toBeVisible();
    await expect(loginPage.signInWithGoogleButton).toBeVisible();
  });
  
  test('TC-02: submitting credentials triggers server-side validation', async ({ page }) => {
    await loginPage.login('test@wingify.com', 'Test@1234');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-03: invalid email and wrong password shows error', async ({ page }) => {
    await loginPage.login('invalid@test.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-04: valid email with wrong password shows error', async ({ page }) => {
    await loginPage.login('test@wingify.com', 'wrongpassword123');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-05: empty email and empty password shows error', async ({ page }) => {
    await loginPage.clickLogin();
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-06: valid email with empty password shows error', async ({ page }) => {
    await loginPage.fillEmail('test@wingify.com');
    await loginPage.clickLogin();
    await expect(loginPage.errorMessage).toBeVisible();
  });

});