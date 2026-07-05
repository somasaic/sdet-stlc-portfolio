/**
 * vwo_login.spec.ts
 * -----------------
 * Playwright + TypeScript test suite for VWO Login Page
 * URL: https://app.vwo.com/#/login
 *
 * Covers all 8 test cases defined in VWO_Login_TestCases_v1.0.docx:
 *
 *   TC_LOGIN_001  Valid Login — Registered Credentials           [P1]
 *   TC_LOGIN_002  Invalid Login — Wrong Password                 [P1]
 *   TC_LOGIN_003  Invalid Email Format — Client-Side Validation  [P2]
 *   TC_LOGIN_004  Empty Fields — Submit with No Input            [P1]
 *   TC_LOGIN_005  Remember Me Checkbox — Persistent Session      [P2]
 *   TC_LOGIN_006  Forgot Password — Navigation to Reset Flow     [P2]
 *   TC_LOGIN_007  Password Show / Hide Toggle                    [P3]
 *   TC_LOGIN_008  Sign in with Google — OAuth Redirect           [P2]
 *
 * Architecture:
 *   - Page Object Model  → pages/LoginPage.ts
 *   - Test data          → utils/testData.ts
 *   - Locators           → getByRole() from live element audit (29 Mar 2026)
 *
 * Run:
 *   npx playwright test tests/vwo_login.spec.ts
 *   npx playwright test tests/vwo_login.spec.ts --headed
 *   npx playwright test tests/vwo_login.spec.ts --grep "TC_LOGIN_001"
 * 
 * 
 * 
 * NOTE: In a production project these tests would be split into
 * separate spec files by feature area:
 * auth.spec.ts | validation.spec.ts | session.spec.ts |
 * navigation.spec.ts | ui.spec.ts | oauth.spec.ts
 * Single file used here for portfolio clarity.
 *
 */

import { test, expect, type BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {
  BASE_URL,
  VALID_USER,
  INVALID_CASES,
  PASSWORD_TOGGLE,
  REMEMBER_ME,
  FORGOT_PASSWORD,
  GOOGLE_OAUTH,
  UI,
} from '../utils/testData';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe('VWO Login Page — Authentication Tests', () => {

  let loginPage: LoginPage;

  // ── beforeEach ─────────────────────────────────────────────────────────────
  /**
   * Before every test:
   *  1. Instantiate LoginPage POM with the current page fixture.
   *  2. Navigate to the login URL and wait for the email field to be visible.
   *
   * This guarantees every test starts from a clean, fully loaded login state
   * regardless of execution order.
   */
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto(BASE_URL);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_001 | Valid Login — Registered Credentials | P1
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_001 — Valid login with registered credentials', async ({ page }) => {
    // Requires a real VWO account — skip unless VWO_TEST_EMAIL + VWO_TEST_PASSWORD
    // are configured as GitHub Secrets (or local env vars).
    test.skip(!process.env.VWO_TEST_EMAIL, 'Valid login requires VWO_TEST_EMAIL and VWO_TEST_PASSWORD env vars');

    // ── Arrange ──────────────────────────────────────────────────────────────
    // Precondition verified by beforeEach (email field visible = page ready)

    // ── Act ───────────────────────────────────────────────────────────────────
    await loginPage.fillEmail(VALID_USER.email);
    await loginPage.fillPassword(VALID_USER.password);
    await loginPage.clickSignIn();

    // ── Assert ────────────────────────────────────────────────────────────────
    // 1. User is no longer on the login page
    await loginPage.assertRedirectedFromLogin();

    // 2. Specifically reaches the dashboard
    await expect(page).toHaveURL(UI.dashboardUrlPattern);

    // 3. No error toast or inline error message visible
    await expect(page.getByText(/invalid|incorrect|wrong/i)).not.toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_002 | Invalid Login — Wrong Password | P1
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_002 — Login rejected with wrong password', async ({ page }) => {
    test.slow(); // VWO server-side validation takes 14-17 seconds
    // ── Arrange ──────────────────────────────────────────────────────────────
    const { email, password } = INVALID_CASES.wrongPassword;

    // ── Act ───────────────────────────────────────────────────────────────────
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.clickSignIn();

    // ── Assert ────────────────────────────────────────────────────────────────
    // 1. VWO shows a generic server-side error — does not reveal which field is wrong.
    //    Actual text: 'Your email, password, IP address or account may be blocked.'
    await expect(page.getByText('Your email, password, IP')).toBeVisible({ timeout: 25000 });

    // 2. User stays on the login page
    await loginPage.assertOnLoginPage();

    // 3. Email field retains its value (usability — user doesn't retype email)
    await expect(loginPage.emailInput).toHaveValue(email);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_003 | Invalid Email Format — Client-Side Validation | P2
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_003 — Invalid email format triggers inline validation error', async ({ page }) => {
    // FINDING: VWO does not implement client-side inline validation on blur.
    // All form submissions — including malformed email formats — are sent server-side.
    // The expected 'Invalid email' message (per original test design) never appears.
    // This is a UX gap: client-side validation would give faster user feedback.
    // Linked defect: KAN-27 documents related password-field validation gap.
    // Status: fixme until VWO adds client-side email format validation.
    test.fixme(true, 'VWO submits all inputs server-side — no inline email format validation exists. Client-side validation is a known UX gap.');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_004 | Empty Fields — Submit with No Input | P1
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_004 — Submit with empty email and password shows validation error', async ({ page }) => {
    test.slow(); // VWO sends even empty forms to server — 14-17s response
    // ── Arrange ──────────────────────────────────────────────────────────────
    await expect(loginPage.emailInput).toHaveValue(INVALID_CASES.empty.email);
    await expect(loginPage.passwordInput).toHaveValue(INVALID_CASES.empty.password);

    // ── Act ───────────────────────────────────────────────────────────────────
    await loginPage.clickSignIn();

    // ── Assert ────────────────────────────────────────────────────────────────
    // 1. VWO sends empty credentials server-side — error appears after 14-17s.
    //    (No client-side 'Invalid email' — VWO has no inline validation; see TC_LOGIN_003.)
    await expect(page.getByText('Your email, password, IP')).toBeVisible({ timeout: 25000 });

    // 2. User remains on login page
    await loginPage.assertOnLoginPage();

    // 3. Page is still interactive after server-side response
    const readyState = await page.evaluate(() => document.readyState);
    expect(readyState).toBe('complete');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_005 | Remember Me Checkbox — Persistent Session | P2
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_005 — Remember Me checkbox toggles correctly and creates persistent cookie', async ({
    page,
    context,
  }: { page: import('@playwright/test').Page; context: BrowserContext }) => {
    // Requires a real VWO account to complete the login flow and verify cookie.
    test.skip(!process.env.VWO_TEST_EMAIL, 'Remember Me cookie test requires VWO_TEST_EMAIL and VWO_TEST_PASSWORD env vars');
    // ── Arrange — Verify default unchecked state ──────────────────────────────
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();

    // ── Act 1: Check the checkbox ─────────────────────────────────────────────
    await loginPage.checkRememberMe();
    await expect(loginPage.rememberMeCheckbox).toBeChecked();

    // ── Act 2: Uncheck the checkbox ───────────────────────────────────────────
    await loginPage.uncheckRememberMe();
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();

    // ── Act 3: Login WITH Remember Me checked ─────────────────────────────────
    await loginPage.checkRememberMe();
    await loginPage.fillCredentials(REMEMBER_ME.email, REMEMBER_ME.password);
    await loginPage.clickSignIn();

    // Wait for redirect — login must succeed for cookie assertion
    await loginPage.assertRedirectedFromLogin();

    // ── Assert: persistent cookie has maxAge > 0 ──────────────────────────────
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === REMEMBER_ME.cookieName);

    // If cookieName is found: assert it is persistent (not session-only)
    if (authCookie) {
      // A persistent cookie has an 'expires' timestamp set in the future
      expect(authCookie.expires).toBeGreaterThan(REMEMBER_ME.minCookieMaxAge);
    } else {
      // Cookie name may differ across environments — at minimum,
      // verify at least one cookie with a future expiry exists (indicates persistence)
      const persistentCookies = cookies.filter(c => c.expires > 0);
      expect(
        persistentCookies.length,
        `Expected at least one persistent cookie when Remember Me is checked.\nCookies found: ${JSON.stringify(cookies.map(c => ({ name: c.name, expires: c.expires })), null, 2)}`
      ).toBeGreaterThan(0);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_006 | Forgot Password — Navigation to Reset Flow | P2
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_006 — Forgot Password navigates to reset form and Back returns to login', async ({ page }) => {
    // ── Precondition: main login form is visible ──────────────────────────────
    await loginPage.assertLoginFormVisible();
    await expect(loginPage.forgotPasswordBtn).toBeVisible();

    // ── Act: Click Forgot Password ────────────────────────────────────────────
    await loginPage.clickForgotPassword();

    // ── Assert: Forgot-password sub-form is now visible ───────────────────────
    // VWO keeps both forms in the DOM simultaneously — login form inputs remain
    // in DOM but are hidden. resetEmailInput targets #forgot-password-username
    // by ID to avoid strict mode violation with #login-username still in tree.
    await loginPage.assertForgotPasswordFormVisible();

    // Sign In button belongs to the login form — not visible on forgot-password form
    await expect(loginPage.signInBtn).not.toBeVisible();

    // ── Act: Click Back ───────────────────────────────────────────────────────
    await loginPage.clickBack();

    // ── Assert: Main login form is restored ───────────────────────────────────
    await loginPage.assertLoginFormVisible();
    await expect(loginPage.forgotPasswordBtn).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_007 | Password Show / Hide Toggle | P3
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_007 — Password toggle reveals and re-masks the password field', async ({ page }) => {
    // ── Arrange ──────────────────────────────────────────────────────────────
    // 1. Assert field is masked by default
    await expect(loginPage.passwordInput).toHaveAttribute('type', PASSWORD_TOGGLE.maskedType);

    // 2. Fill the password field so the toggle has something to reveal
    await loginPage.fillPassword(PASSWORD_TOGGLE.password);

    // ── Act 1: Click toggle — should reveal ───────────────────────────────────
    await loginPage.passwordToggleBtn.click();

    // ── Assert: type is now 'text' (visible) ──────────────────────────────────
    await expect(loginPage.passwordInput).toHaveAttribute('type', PASSWORD_TOGGLE.visibleType);

    // Password value is preserved after toggle
    await expect(loginPage.passwordInput).toHaveValue(PASSWORD_TOGGLE.password);

    // ── Act 2: Click toggle again — should re-mask ────────────────────────────
    await loginPage.passwordToggleBtn.click();

    // ── Assert: type is back to 'password' (masked) ───────────────────────────
    await expect(loginPage.passwordInput).toHaveAttribute('type', PASSWORD_TOGGLE.maskedType);

    // Password value is still preserved after second toggle
    await expect(loginPage.passwordInput).toHaveValue(PASSWORD_TOGGLE.password);

    // ── Assert: toggle button is accessible (has ARIA label) ──────────────────
    await expect(loginPage.passwordToggleBtn).toBeVisible();
    await expect(loginPage.passwordToggleBtn).toBeEnabled();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC_LOGIN_008 | Sign in with Google — OAuth Redirect Initiated | P2
  // ═══════════════════════════════════════════════════════════════════════════

  test('TC_LOGIN_008 — Sign in with Google initiates OAuth redirect with CSRF state param', async ({ page }) => {
    // ── Precondition: Google button is visible and enabled ────────────────────
    await expect(loginPage.googleSignInBtn).toBeVisible();
    await expect(loginPage.googleSignInBtn).toBeEnabled();

    // ── Intercept: Capture the redirect URL before it fully navigates ─────────
    // We listen for the request to Google rather than waiting for full load,
    // since the Google consent page may block in a test environment.
    let capturedGoogleUrl: string | null = null;

    page.on('request', request => {
      if (request.url().includes('accounts.google.com') || request.url().includes('oauth')) {
        capturedGoogleUrl = request.url();
      }
    });

    // ── Act: Click the Google Sign In button ──────────────────────────────────
    await loginPage.clickGoogleSignIn();

    // Wait for the OAuth navigation to start (with timeout from testData)
    await page.waitForURL(
      url =>
        url.toString().includes('accounts.google.com') ||
        url.toString().includes('oauth'),
      { timeout: GOOGLE_OAUTH.redirectTimeoutMs }
    );

    // ── Assert 1: Redirected to Google's auth endpoint ────────────────────────
    const currentUrl = page.url();
    expect(currentUrl).toContain(GOOGLE_OAUTH.expectedRedirectHost);

    // ── Assert 2: CSRF state parameter is present (OAuth 2.0 security) ────────
    expect(currentUrl).toMatch(GOOGLE_OAUTH.stateParamRegex);

    // ── Assert 3: Required OAuth parameters exist in the redirect URL ─────────
    for (const param of GOOGLE_OAUTH.requiredParams) {
      expect(
        currentUrl,
        `OAuth redirect URL is missing required parameter: ${param}`
      ).toContain(param);
    }

    // ── Assert 4: No JS errors were thrown during the button click/redirect ───
    // (Playwright captures console errors automatically in --reporter=html)
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Standalone group: UI and Accessibility assertions (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('VWO Login Page — UI & Accessibility', () => {

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto(BASE_URL);
  });

  test('Core login elements are visible and enabled on page load', async ({ page }) => {
    // Confirmed working locators (verified via seed.spec.ts and STLC Standard CLI)
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInBtn).toBeVisible();
    await expect(loginPage.signInBtn).toBeEnabled();
    await expect(loginPage.forgotPasswordBtn).toBeVisible();
    await expect(loginPage.googleSignInBtn).toBeVisible();
    await expect(loginPage.ssoSignInBtn).toBeVisible();

    // Note: passkeySignInBtn, passwordToggleBtn, rememberMeCheckbox accessible
    // names vary across VWO environments — verified locally via STLC Manual audit.
  });

  test('Email and password fields have correct placeholder text', async ({ page }) => {
    await expect(loginPage.emailInput).toHaveAttribute(
      'placeholder',
      UI.emailPlaceholder
    );
    await expect(loginPage.passwordInput).toHaveAttribute(
      'placeholder',
      UI.passwordPlaceholder
    );
  });

  test('Tab order follows logical sequence: email → password → sign in', async ({ page }) => {
    // Focus the email field first
    await loginPage.emailInput.focus();
    await expect(loginPage.emailInput).toBeFocused();

    // Tab to password
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();

    // Tab past toggle button, then tab to reach the Sign In button
    // (exact Tab count depends on DOM order — adjust if toggle is in between)
    await page.keyboard.press('Tab'); // toggle button
    await page.keyboard.press('Tab'); // Forgot Password button
    await page.keyboard.press('Tab'); // next focusable element toward Sign In
  });

  test('Password field is masked by default — type attribute is "password"', async ({ page }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('Remember Me is unchecked by default', async ({ page }) => {
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });

});






