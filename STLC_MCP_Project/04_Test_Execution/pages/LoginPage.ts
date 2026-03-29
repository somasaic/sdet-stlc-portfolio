/**
 * LoginPage.ts
 * ------------
 * Page Object Model for app.vwo.com/#/login
 *
 * All locators are derived from the live browser snapshot audit (29 Mar 2026)
 * that identified 43 interactive elements: 9 inputs, 20 buttons, 11 links, 3 checkboxes.
 *
 * This class covers the 8 in-scope elements defined in VWO_Login_TestPlan_v1.0:
 *   1. Email field
 *   2. Password field
 *   3. Toggle password visibility button
 *   4. Forgot Password button
 *   5. Sign In submit button
 *   6. Remember Me checkbox
 *   7. Sign in with Google button
 *   8. Sign in using SSO button
 *   9. Sign in with Passkey button
 *
 * Usage:
 *   import { LoginPage } from '../pages/LoginPage';
 *   const loginPage = new LoginPage(page);
 *   await loginPage.fillEmail('user@example.com');
 *   await loginPage.clickSignIn();
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  // ── Page reference ──────────────────────────────────────────────────────────
  readonly page: Page;

  // ── Locators — Input Fields ─────────────────────────────────────────────────
  /**
   * Primary email input on the main login form.
   * Audit ref: ref_1 | type=email | placeholder="Enter email ID"
   */
  readonly emailInput: Locator;

  /**
   * Password input on the main login form.
   * Audit ref: ref_2 | type=password | placeholder="Enter password"
   */
  readonly passwordInput: Locator;

  // ── Locators — Buttons ──────────────────────────────────────────────────────
  /**
   * Eye icon button to reveal/mask the password field.
   * Audit ref: ref_3 | type=button
   * NOTE: Three toggle buttons exist in DOM (login, new-pwd, confirm-pwd forms).
   *       .first() always targets the main login form toggle.
   */
  readonly passwordToggleBtn: Locator;

  /**
   * Forgot Password? link-styled button — triggers reset flow SPA state change.
   * Audit ref: ref_4 | type=button
   */
  readonly forgotPasswordBtn: Locator;

  /**
   * Primary Sign In submit button on the main login form.
   * Audit ref: ref_5 | type=submit | text="Sign in"
   * NOTE: A second Sign In button exists in the SSO form — .first() targets login form.
   */
  readonly signInBtn: Locator;

  /**
   * Google OAuth redirect button.
   * Audit ref: ref_6 | type=button | text="Sign in with Google"
   */
  readonly googleSignInBtn: Locator;

  /**
   * SAML/OIDC SSO redirect button.
   * Audit ref: ref_7 | type=button | text="Sign in using SSO"
   */
  readonly ssoSignInBtn: Locator;

  /**
   * WebAuthn passkey button.
   * Audit ref: ref_8 | type=button | text="Sign in with Passkey"
   */
  readonly passkeySignInBtn: Locator;

  // ── Locators — Checkboxes ───────────────────────────────────────────────────
  /**
   * Remember Me checkbox — controls session vs persistent cookie.
   * Audit ref: ref_46 | type=checkbox | label="Remember me"
   */
  readonly rememberMeCheckbox: Locator;

  // ── Locators — Validation Messages ─────────────────────────────────────────
  /**
   * Inline validation error shown when email format is invalid.
   * Audit ref: ref_40 | generic "Invalid email"
   */
  readonly invalidEmailMsg: Locator;

  // ── Locators — Forgot Password Sub-Form ────────────────────────────────────
  /**
   * Email input inside the reset-password sub-form (separate hidden form in DOM).
   * Audit ref: ref_103 | type=email | label="Email address"
   */
  readonly resetEmailInput: Locator;

  /**
   * Reset Password submit button (first instance = main forgot-password form).
   * Audit ref: ref_108 | type=submit | text="Reset Password"
   */
  readonly resetPasswordBtn: Locator;

  /**
   * Back button inside the forgot-password sub-form.
   * Audit ref: ref_106 | type=button | text="Back"
   */
  readonly backBtn: Locator;

  // ── Constructor ─────────────────────────────────────────────────────────────
  constructor(page: Page) {
    this.page = page;

    // Inputs
    this.emailInput    = page.getByRole('textbox', { name: 'Enter email ID' });
    this.passwordInput = page.getByRole('textbox', { name: 'Enter password' });

    // Buttons — main login form
    this.passwordToggleBtn = page.getByRole('button', { name: 'Toggle password visibility' }).first();
    this.forgotPasswordBtn = page.getByRole('button', { name: 'Forgot Password?' });
    this.signInBtn         = page.getByRole('button', { name: 'Sign in' }).first();

    // Buttons — alternative auth
    this.googleSignInBtn  = page.getByRole('button', { name: 'Sign in with Google' });
    this.ssoSignInBtn     = page.getByRole('button', { name: 'Sign in using SSO' });
    this.passkeySignInBtn = page.getByRole('button', { name: 'Sign in with Passkey' });

    // Checkbox
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });

    // Validation text
    this.invalidEmailMsg = page.getByText('Invalid email');

    // Forgot password sub-form
    this.resetEmailInput  = page.getByRole('textbox', { name: 'Email address' });
    this.resetPasswordBtn = page.getByRole('button', { name: 'Reset Password' }).first();
    this.backBtn          = page.getByRole('button', { name: 'Back' });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to the VWO login page and wait until the email input is visible.
   * Call this in beforeEach rather than page.goto() directly so that
   * all tests start from a known ready state.
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.emailInput).toBeVisible();
  }

  /**
   * Clear and fill the email input field.
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  /**
   * Clear and fill the password input field.
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  /**
   * Fill both email and password in a single call — convenience method
   * used by the majority of test cases.
   */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /**
   * Click the Sign In submit button and wait for network idle.
   * Does NOT assert the outcome — tests own that assertion.
   */
  async clickSignIn(): Promise<void> {
    await this.signInBtn.click();
  }

  /**
   * Full login flow: fill credentials + click Sign In.
   * Convenience method for TC_LOGIN_001 and related positive-path tests.
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.clickSignIn();
  }

  /**
   * Check the Remember Me checkbox.
   * No-op if already checked.
   */
  async checkRememberMe(): Promise<void> {
    if (!(await this.rememberMeCheckbox.isChecked())) {
      await this.rememberMeCheckbox.check();
    }
  }

  /**
   * Uncheck the Remember Me checkbox.
   * No-op if already unchecked.
   */
  async uncheckRememberMe(): Promise<void> {
    if (await this.rememberMeCheckbox.isChecked()) {
      await this.rememberMeCheckbox.uncheck();
    }
  }

  /**
   * Click the Forgot Password? button to trigger SPA state change to reset form.
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordBtn.click();
  }

  /**
   * Click the Back button inside the forgot-password sub-form.
   */
  async clickBack(): Promise<void> {
    await this.backBtn.click();
  }

  /**
   * Click the toggle button once to flip the password field visibility.
   * Returns the new type attribute value ('text' | 'password').
   */
  async togglePasswordVisibility(): Promise<string | null> {
    await this.passwordToggleBtn.click();
    return await this.passwordInput.getAttribute('type');
  }

  /**
   * Click the Google OAuth sign-in button.
   * Test must then assert redirect separately.
   */
  async clickGoogleSignIn(): Promise<void> {
    await this.googleSignInBtn.click();
  }

  /**
   * Click the SSO sign-in button.
   */
  async clickSSOSignIn(): Promise<void> {
    await this.ssoSignInBtn.click();
  }

  /**
   * Click the Passkey sign-in button.
   */
  async clickPasskeySignIn(): Promise<void> {
    await this.passkeySignInBtn.click();
  }

  // ── Assertion helpers ───────────────────────────────────────────────────────

  /**
   * Assert that the main login form is in a visible, interactive state.
   * Use this after clicking Back from forgot-password or after page load.
   */
  async assertLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInBtn).toBeVisible();
  }

  /**
   * Assert that the forgot-password sub-form is visible.
   */
  async assertForgotPasswordFormVisible(): Promise<void> {
    await expect(this.resetEmailInput).toBeVisible();
    await expect(this.resetPasswordBtn).toBeVisible();
    await expect(this.backBtn).toBeVisible();
  }

  /**
   * Assert that the inline invalid-email validation message is visible.
   */
  async assertInvalidEmailVisible(): Promise<void> {
    await expect(this.invalidEmailMsg).toBeVisible();
  }

  /**
   * Assert that the user is still on the login page (URL check).
   */
  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*#\/login/);
  }

  /**
   * Assert that the user has left the login page (redirected after auth).
   */
  async assertRedirectedFromLogin(): Promise<void> {
    await expect(this.page).not.toHaveURL(/.*#\/login/);
  }
}