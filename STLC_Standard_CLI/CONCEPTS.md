# Concepts & Topics — STLC Standard CLI

> One file = complete understanding of every concept used in this approach.
> Format per topic: What it is → Where in repo → Why used → Alternatives.

---

## Approach Summary

This is the **reference implementation** — the cleanest, most direct translation of manual STLC test cases into Playwright TypeScript. Six test cases from `Block_A_Manual/03_Test_Cases.md` become six Playwright tests via a Page Object Model. The emphasis is on **industry-standard structure**: correct timeouts for the target app, proper POM, and a CI configuration that demonstrates real understanding of Playwright's config options.

**Repo structure:**
```
STLC_Standard_CLI/
  playwright.config.ts       ← Global config (timeouts, browsers, reporters)
  pages/
    LoginPage.ts             ← POM — all locators and actions
  tests/
    vwo_login.spec.ts        ← 6 test cases
```

---

## 1. POM — Page Object Model

**What it is:** A design pattern that separates page-specific locators and actions from test logic. The page class owns all locators; test files own the test logic.

**Where in repo:** `STLC_Standard_CLI/pages/LoginPage.ts`

**Full POM in this project:**
```typescript
export class LoginPage {
  // Properties — typed locators
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordButton: Locator;
  readonly signInWithGoogleButton: Locator;

  // Constructor — wire up locators to actual DOM elements
  constructor(page: Page) {
    this.page = page;
    this.emailInput       = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput    = page.getByRole('textbox', { name: 'Password' });
    this.loginButton      = page.getByRole('button', { name: 'Sign in', exact: true });
    this.errorMessage     = page.getByText('Your email, password, IP');
    this.forgotPasswordButton = page.getByRole('button', { name: 'Forgot Password?' });
    this.signInWithGoogleButton = page.getByRole('button', { name: 'Sign in with Google' });
  }

  // Action methods
  async navigate(): Promise<void> { ... }
  async login(email: string, password: string): Promise<void> { ... }
  async fillEmail(email: string): Promise<void> { ... }
  async clickLogin(): Promise<void> { ... }

  // Query methods
  async getErrorMessage(): Promise<string | null> { ... }
  async isErrorVisible(): Promise<boolean> { ... }
}
```

**Why POM is used here (not just inline locators):**
- VWO changes their DOM — one place to update locators
- Tests read like user actions (`loginPage.login()`) not DOM queries
- `getErrorMessage()` and `isErrorVisible()` return values that tests use in assertions — logic stays in the page object, not scattered across tests

**Alternative without POM (inline locators in every test):**
```typescript
// Without POM — every test repeats this
await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
await page.getByRole('textbox', { name: 'Password' }).fill('wrongpass');
await page.getByRole('button', { name: 'Sign in', exact: true }).click();
```
Scales poorly — 6 tests × 3 lines = 18 lines of locator code that all break if VWO changes one element.

---

## 2. `constructor(page: Page)` — Dependency Injection via Constructor

**What it is:** The constructor is a special method that runs when a class is instantiated (`new LoginPage(page)`). Here it receives the `page` object and uses it to initialize all locators.

**Where in repo:**
```typescript
// pages/LoginPage.ts:12
constructor(page: Page) {
  this.page = page;
  this.emailInput = page.getByRole('textbox', { name: 'Email address' });
  // ... more locators
}
```

**Why locators are built in the constructor (not as properties):**
```typescript
// WRONG — locators evaluated at class definition time (before page exists)
readonly emailInput = page.getByRole('textbox', { name: 'Email address' }); // ← page not defined yet

// CORRECT — locators evaluated when constructor runs (page is passed in)
constructor(page: Page) {
  this.emailInput = page.getByRole('textbox', { name: 'Email address' });
}
```

Playwright `Locator` objects are lazy — they don't query the DOM when created. They query only when an action (`.click()`, `.fill()`) or assertion (`toBeVisible()`) is called. This is why a locator defined in the constructor is safe — the DOM doesn't need to exist yet.

**How tests instantiate the POM:**
```typescript
// tests/vwo_login.spec.ts:9
test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);  // ← create instance, inject page
  await loginPage.navigate();        // ← navigate (page now active)
});
```

---

## 3. `async/await` — Promise-Based Asynchrony

**What it is:** TypeScript's mechanism for sequential async code. Every Playwright action returns a Promise. `await` pauses the function until the Promise resolves.

**Where in repo — every method:**
```typescript
// pages/LoginPage.ts:22
async navigate(): Promise<void> {
  await this.page.goto('/#/login');                    // wait for navigation
  await this.page.waitForLoadState('networkidle');     // wait for SPA to load
}

// pages/LoginPage.ts:27
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);    // wait for fill to complete
  await this.passwordInput.fill(password);
  await this.loginButton.click();       // wait for click
  // After click, wait for VWO's server response (one of these resolves first)
  await Promise.race([
    this.page.waitForNavigation().catch(() => {}),
    this.page.waitForLoadState('networkidle').catch(() => {}),
    this.page.waitForTimeout(5000)
  ]);
  await this.page.waitForTimeout(500);  // brief additional settle time
}
```

**Without `await` — what breaks:**
```typescript
this.emailInput.fill(email);      // ← WRONG: fill starts but doesn't wait
this.passwordInput.fill(password); // ← runs before fill finishes
```
Playwright actions would run simultaneously, causing race conditions and unpredictable failures.

**`Promise<void>` return type:**
- `async` functions always return a Promise
- `Promise<void>` = the Promise resolves with no value (function doesn't return data)
- `Promise<string | null>` = the Promise resolves with a string or null
- Tests `await` these promises to ensure the action is complete before the next line runs

---

## 4. `page.goto()` with Hash Routing

**What it is:** Navigates the browser to a URL. VWO uses Angular's hash-based routing — `#/login` is the "page" identifier within the SPA.

**Where in repo:**
```typescript
// pages/LoginPage.ts:23
await this.page.goto('/#/login');
// With baseURL: 'https://app.vwo.com' in config
// Resolved: https://app.vwo.com/#/login
```

**Why `/#/login` and not `/login`:**
- VWO uses Angular Router in hash mode: `https://app.vwo.com/#/login`
- The `#` fragment is NOT sent to the server — it's handled entirely by Angular in the browser
- `page.goto('/#/login')` navigates the browser; Angular's router renders the login component
- Without `#`, the request would go to VWO's server for `/login` — returns 404 (not a server route)

**`waitForLoadState('networkidle')` after `goto()`:**
```typescript
await this.page.goto('/#/login');
await this.page.waitForLoadState('networkidle');
```
After `goto()`, Angular starts bootstrapping — making additional requests for user data, configuration, and translations. `networkidle` waits for these to complete. Without this wait, the email input might not be in the DOM yet when the test tries to interact with it.

**Alternatives:**
```typescript
await page.goto('/#/login', { waitUntil: 'networkidle' }); // combine goto + wait
await expect(loginPage.emailInput).toBeVisible();           // wait for specific element
```

---

## 5. `getByRole()` — ARIA-Based Locator

**What it is:** Queries the DOM via the accessibility tree. Finds elements by their ARIA role and accessible name — exactly how screen readers navigate.

**Where in repo:**
```typescript
// pages/LoginPage.ts:14-19
this.emailInput       = page.getByRole('textbox', { name: 'Email address' });
this.passwordInput    = page.getByRole('textbox', { name: 'Password' });
this.loginButton      = page.getByRole('button', { name: 'Sign in', exact: true });
this.forgotPasswordButton = page.getByRole('button', { name: 'Forgot Password?' });
this.signInWithGoogleButton = page.getByRole('button', { name: 'Sign in with Google' });
```

**`exact: true` on loginButton:**
- Without `exact: true`: `getByRole('button', {name:'Sign in'})` would match "Sign in with Google" and "Sign in using SSO" too (partial match)
- With `exact: true`: only matches a button whose accessible name is exactly "Sign in" — targets the primary submit button

**ARIA roles quick reference:**
| Role | Matches |
|---|---|
| `'textbox'` | `<input type="text">`, `<input type="email">`, `<textarea>` |
| `'button'` | `<button>`, `<input type="submit">`, `role="button"` elements |
| `'checkbox'` | `<input type="checkbox">` |
| `'link'` | `<a href="...">` |
| `'heading'` | `<h1>` to `<h6>` |
| `'img'` | `<img>`, `role="img"` |

**Why preferred over CSS selectors:**
```typescript
// CSS selector — breaks if VWO changes class names
page.locator('.login-btn.submit-btn')

// getByRole — survives DOM restructuring, only breaks if accessibility changes
page.getByRole('button', { name: 'Sign in', exact: true })
```

**Important limitation in this project:** `getByRole('textbox', { name: 'Email address' })` would fail if the Forgot Password test were added here (both login and forgot-password forms have an email input with the same accessible name → strict mode violation). The MCP project uses `page.locator('#login-username')` to solve this.

---

## 6. `getByText()` — Text Content Locator

**What it is:** Finds elements by their visible text content. Partial matching by default.

**Where in repo:**
```typescript
// pages/LoginPage.ts:17
this.errorMessage = page.getByText('Your email, password, IP');
```

**Why partial text `'Your email, password, IP'` (not the full string):**
VWO's actual error: `"Your email, password, IP address or account may be blocked."`

- `getByText('Your email, password, IP')` — stable — matches even if VWO tweaks the sentence ending
- `getByText('Your email, password, IP address or account may be blocked.')` — fragile — breaks on any punctuation change
- `getByText(/your email.+blocked/i)` — regex — works but harder to read

**Alternative locators for error messages:**
```typescript
page.getByRole('alert')           // if VWO used role="alert" (they don't)
page.locator('[data-testid="error-msg"]')  // if VWO added test IDs (they don't)
page.locator('.vwo-error-message') // CSS class — fragile, changes often
```

---

## 7. `expect.timeout` — Global Assertion Timeout

**What it is:** The maximum time (in milliseconds) that ANY `expect().toBeVisible()`, `expect().toBe()`, or similar assertion will retry before failing. Set globally in `playwright.config.ts`.

**Where in repo:**
```typescript
// playwright.config.ts:11
expect: {
  timeout: 25000,  // 25 seconds — was default 5000ms
},
```

**Why 25 seconds specifically:**
- VWO server-side validation: 14–17 seconds
- Network variance: +4 seconds buffer
- Total: ~21 seconds maximum wait needed
- Set to 25 seconds: comfortable headroom

**What assertions use this timeout:**
```typescript
// All of these wait up to 25 seconds
await expect(loginPage.errorMessage).toBeVisible();
await expect(loginPage.emailInput).toHaveValue('test@wingify.com');
await expect(page.url()).toContain('login');
```

**Per-assertion override:**
```typescript
// Override global timeout for just one assertion
await expect(loginPage.errorMessage).toBeVisible({ timeout: 30000 });
```

**Why the default 5s timeout caused failures:** VWO submits ALL form inputs to its server — including empty fields and wrong passwords. No client-side validation intercepts the request. The server response takes 14–17 seconds. With 5s timeout, every negative-path test (wrong password, empty fields) timed out before VWO's server responded.

---

## 8. `actionTimeout` — Per-Action Timeout

**What it is:** Maximum time for any single user action (`.click()`, `.fill()`, `.press()`, etc.) to complete. Separate from assertion timeout.

**Where in repo:**
```typescript
// playwright.config.ts:19
use: {
  actionTimeout: 25000,  // 25s max for any click/fill/etc.
},
```

**Difference between `actionTimeout` and `expect.timeout`:**
| Setting | Controls |
|---|---|
| `actionTimeout` | How long `.click()`, `.fill()`, `.press()` wait for the element to be ready |
| `expect.timeout` | How long `expect().toBeVisible()` and other assertions retry |
| Test `timeout` | Total time budget for one test (all actions + assertions combined) |

**Why needed:** `loginButton.click()` needs the button to be actionable (visible + enabled + stable). If Angular is still rendering when the test calls `.click()`, Playwright waits up to `actionTimeout` for the button to become actionable.

---

## 9. `retries: process.env.CI ? 1 : 0`

**What it is:** Retry configuration — how many times to re-run a failed test before marking it red.

**Where in repo:**
```typescript
// playwright.config.ts:5
retries: process.env.CI ? 1 : 0,
```

**Why 1 retry in CI only:**
- VWO is a live third-party service — occasional network blips or VWO server slowness can cause transient failures
- 1 retry catches these without masking real bugs (a real bug fails on both attempts)
- Locally: 0 retries — immediate feedback during development (don't retry noise during active work)

**What happens on retry:**
- Playwright re-runs the entire test from the beginning
- If `trace: 'on-first-retry'` is set, the retry run records a full trace
- If the retry passes → test is marked as "flaky" in the report (passed on second attempt)
- If the retry fails → test is marked as failed

---

## 10. `workers: process.env.CI ? 1 : undefined`

**What it is:** Controls how many tests run in parallel. `workers: 1` means sequential (one at a time). `undefined` uses Playwright's default (half the available CPU cores).

**Where in repo:**
```typescript
// playwright.config.ts:6
workers: process.env.CI ? 1 : undefined,
```

**Why `workers: 1` in CI:**
Running multiple tests in parallel sends multiple simultaneous login attempts to VWO. VWO's security systems interpret rapid-fire requests from the same IP as a brute-force attack — temporarily blocking the CI runner's IP. All subsequent tests then fail with authentication errors (not assertion errors, but network blocks).

Sequential execution (`workers: 1`) sends one request at a time → VWO processes normally → no IP block.

**Performance impact:** 6 tests × ~20s each = ~120s sequential vs ~40s parallel. For this small suite, 2 extra minutes in CI is acceptable for reliability.

---

## 11. `forbidOnly: !!process.env.CI` — CI Safety

**What it is:** Causes the entire CI run to fail if any test has `test.only()` committed to the repository.

**Where in repo:**
```typescript
// playwright.config.ts:4
forbidOnly: !!process.env.CI,
```

**Why this is a safety net:** `test.only()` restricts Playwright to run ONLY that one test — all others are silently skipped. During local debugging, this is useful. If committed and pushed to main, the CI pipeline would "pass" with only 1 test running while 5 others are silently skipped. `forbidOnly` converts this into a hard CI failure with a clear error message: "Do not use test.only in the tests."

---

## 12. `toBeVisible()`, `toHaveValue()`, `toBeChecked()` — Assertion Library

**What it is:** Playwright's built-in assertion methods on the `expect()` object. All assertions auto-wait (retry until passing or timeout).

**Where in repo:**
```typescript
// tests/vwo_login.spec.ts — various assertions
await expect(loginPage.emailInput).toBeVisible();          // element is visible
await expect(loginPage.errorMessage).toBeVisible();        // error appeared
const isError = await loginPage.isErrorVisible();          // custom boolean check
expect(isError).toBe(true);                                // non-Playwright assertion
```

**Key assertion pairs:**
```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Checkbox / radio
await expect(element).toBeChecked();
await expect(element).not.toBeChecked();

// Input value
await expect(element).toHaveValue('expected text');
await expect(element).toBeEmpty();

// Enabled/disabled
await expect(element).toBeEnabled();
await expect(element).toBeDisabled();

// Attribute
await expect(element).toHaveAttribute('type', 'password');
await expect(element).toHaveAttribute('placeholder', 'Enter email ID');

// Text content
await expect(element).toHaveText('exact text');
await expect(element).toContainText('partial text');

// Page-level
await expect(page).toHaveURL(/pattern/);
await expect(page).toHaveTitle(/VWO/);
```

**`expect(isError).toBe(true)` vs `await expect(element).toBeVisible()`:**
- `expect(isError).toBe(true)` — Jest-style assertion on a JavaScript value. No auto-wait. Instant pass/fail.
- `await expect(element).toBeVisible()` — Playwright assertion on a locator. Auto-waits + retries.

---

## 13. Multi-Browser Config (Local Only)

**What it is:** Playwright projects define which browsers a test suite runs in. Multiple projects = multiple browser configurations.

**Where in repo:**
```typescript
// playwright.config.ts:21
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
],
```

**`...devices['Desktop Chrome']`:** Spread operator copies all settings from Playwright's built-in device profile — viewport size (1280×720), user-agent string, and browser-specific settings. Ensures tests simulate a real desktop browser session.

**Running specific browsers:**
```bash
npx playwright test --project chromium   # Chromium only
npx playwright test --project firefox    # Firefox only
npx playwright test                       # All browsers
```

**In CI — only Chromium:**
```yaml
# .github/workflows/playwright.yml
- run: npx playwright install --with-deps chromium
- run: npx playwright test --project chromium
```
Firefox and WebKit are available locally for cross-browser verification but not in CI (cost + time saving).

---

## 14. `trace: 'on-first-retry'` — Debug Artifact

**What it is:** Playwright records a trace file containing every page action, DOM snapshot, network request, and console log from the test run. Viewable at `trace.playwright.dev`.

**Where in repo:**
```typescript
// playwright.config.ts:17
use: {
  trace: 'on-first-retry',  // record trace when a test is retried
},
```

**`trace` options:**
| Value | When trace is recorded |
|---|---|
| `'off'` | Never (default) |
| `'on'` | Every test run (expensive — lots of disk) |
| `'on-first-retry'` | Only when a test retries (captures the failure, not normal runs) |
| `'retain-on-failure'` | Only for tests that ultimately fail |

**Why `'on-first-retry'`:** A test that fails on first attempt and is retried is the most interesting case — the trace of the retry tells you exactly what went wrong. Recording every test would fill the CI artifact storage quickly.

**Viewing traces:**
```bash
npx playwright show-trace trace.zip
# or drag the .zip file to trace.playwright.dev
```

---

## 15. `screenshot: 'only-on-failure'` — Visual Evidence

**What it is:** Playwright takes a full-page screenshot when a test fails. Saved to `test-results/` and available as a CI artifact.

**Where in repo:**
```typescript
// playwright.config.ts:18
use: {
  screenshot: 'only-on-failure',
},
```

**Options:**
| Value | When screenshot is taken |
|---|---|
| `'off'` | Never |
| `'on'` | Every test (large disk use) |
| `'only-on-failure'` | Only failed tests |

**Why important for CI:** When a test fails in CI (headless, no visible browser), you can't see what the page looked like. The screenshot shows: was the error message shown? Was the page half-loaded? Did an Angular error overlay appear? Without it, debugging CI failures requires adding `console.log(await page.content())` — much slower.

---

## 16. HTML Reporter

**What it is:** Generates an interactive HTML report in `playwright-report/` showing all test results with pass/fail status, test steps, duration, and links to screenshots and traces.

**Where in repo:**
```typescript
// playwright.config.ts:9
reporter: 'html',
```

**Note:** This project uses only `'html'` (single reporter). The MCP project uses `[['list'], ['html'], ['junit']]` (three reporters simultaneously). `'html'` alone does not show real-time terminal output — the MCP project adds `'list'` for that.

**Accessing locally:**
```bash
npx playwright show-report
# Opens playwright-report/index.html in browser
```

---

## Quick Reference — All Concepts at a Glance

| Concept | File | Purpose |
|---|---|---|
| POM | `pages/LoginPage.ts` | Centralized locators + actions |
| `constructor(page: Page)` | `pages/LoginPage.ts:12` | Dependency injection, locator setup |
| `async/await` + `Promise<void>` | All files | Async Playwright API |
| `page.goto('/#/login')` | `pages/LoginPage.ts:23` | Hash-based SPA navigation |
| `waitForLoadState('networkidle')` | `pages/LoginPage.ts:24` | Wait for Angular SPA to finish |
| `getByRole()` with `exact: true` | `pages/LoginPage.ts:14–19` | ARIA-based stable locators |
| `getByText('Your email...')` | `pages/LoginPage.ts:17` | Partial text match for error |
| `expect.timeout: 25000` | `playwright.config.ts:11` | 25s assertion window for VWO |
| `actionTimeout: 25000` | `playwright.config.ts:19` | 25s per action for VWO |
| `retries: process.env.CI ? 1 : 0` | `playwright.config.ts:5` | Retry on flaky CI failures |
| `workers: process.env.CI ? 1` | `playwright.config.ts:6` | Sequential = no VWO IP block |
| `forbidOnly: !!process.env.CI` | `playwright.config.ts:4` | Prevent test.only() in CI |
| `toBeVisible()` + variants | `tests/vwo_login.spec.ts` | Playwright assertions |
| Multi-browser projects | `playwright.config.ts:21` | Chrome/Firefox/WebKit locally |
| `trace: 'on-first-retry'` | `playwright.config.ts:17` | Debug trace on flaky failures |
| `screenshot: 'only-on-failure'` | `playwright.config.ts:18` | Visual evidence on failure |
| HTML reporter | `playwright.config.ts:9` | Interactive test results |
