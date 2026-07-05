# Concepts & Topics — STLC MCP Project

> One file = complete understanding of every concept used in this approach.
> Format per topic: What it is → Where in repo → Why used → Alternatives.

---

## Approach Summary

This is the **most complete project** in the portfolio. It combines:
1. A **6-phase STLC folder structure** (requirement analysis → test closure)
2. A **full Playwright POM** with 13 test cases
3. **JIRA integration via MCP** (bugs logged from Claude Desktop in one prompt)
4. The **most CI failures** — 10 were fixed — making it the richest source of Playwright and testing knowledge

**Repo structure:**
```
STLC_MCP_Project/
  01_Requirement_Analysis/     ← Phase 1 docs
  02_Test_Plan/                ← Phase 2 docs
  03_Test_Cases/               ← Phase 3 docs
  04_Test_Execution/           ← Phase 4 — Playwright test suite
    playwright.config.ts       ← Config (non-standard location)
    pages/
      LoginPage.ts             ← Full POM with actions + assertions
    tests/
      vwo.login.spec.ts        ← 13 test cases
  05_Defect_Reports/           ← Phase 5 — bug reports (KAN-27, KAN-28)
  06_Test_Closure/             ← Phase 6 docs
  .env                         ← JIRA credentials (gitignored)
  .env.example                 ← Template (committed)
```

---

## 1. 6-Phase STLC Folder Structure

**What it is:** The entire Software Testing Life Cycle represented as numbered folders — each folder is one STLC phase containing its documentation and/or test artifacts.

**Where in repo:** Project root — folders `01_` through `06_`

**Why numbered folders (01_, 02_, etc.):** Filesystem sort order. Without the numbers, `Requirement_Analysis`, `Test_Cases`, `Test_Closure` would sort alphabetically — breaking the logical phase sequence. Numbers force chronological order in any file explorer.

**Phase mapping:**
| Folder | Phase | Key artifact |
|---|---|---|
| `01_Requirement_Analysis/` | Requirements | RTM, clarification queries |
| `02_Test_Plan/` | Planning | Scope, risks, entry/exit criteria |
| `03_Test_Cases/` | Design | 13 test case specifications |
| `04_Test_Execution/` | Execution | Playwright test suite (automated) |
| `05_Defect_Reports/` | Defect Management | BUG_Login_PWD001 (KAN-27) |
| `06_Test_Closure/` | Closure | Final metrics, lessons learned |

**Why this structure matters:** Any team member can navigate the lifecycle without a wiki. Phase 4 (`04_Test_Execution`) is self-contained — it has its own `playwright.config.ts`, `pages/`, and `tests/` — so it can be understood and run without reading the other phases.

**Alternative:** Feature-based folder structure (`auth/`, `forgot-password/`, `accessibility/`). The STLC phase structure was chosen here to demonstrate lifecycle thinking, not feature organization.

---

## 2. MCP — Model Context Protocol

**What it is:** An open protocol that allows AI assistants (like Claude Desktop) to call external tools and APIs directly. In this project, Claude Desktop connected to JIRA's API via an Atlassian MCP server — one prompt creates a fully formatted JIRA issue.

**Where in repo:**
- `05_Defect_Reports/BUG_Login_PWD001.md` — the bug report generated and then logged to JIRA via MCP
- `.env` — contains the JIRA credentials MCP uses to authenticate

**How it worked:**
```
User prompt in Claude Desktop:
"Log this bug to JIRA project KAN:
 Title: Password field accepts weak passwords
 Severity: High, Priority: High
 Steps: 1. Go to VWO login 2. Type 'abc' in password 3. No error shown
 Expected: Error message shown
 Actual: Weak password accepted"

↓ Claude calls MCP tool: createJiraIssue(...)
↓ MCP server calls: https://somasaicheviti-1780804851917.atlassian.net/rest/api/3/issue
↓ JIRA creates: KAN-27 with ADF-formatted description
↓ Response: Issue key KAN-27, URL returned to Claude
```

**Why used:** Traditional bug logging workflow: QA writes the bug in a test case doc → copies it to JIRA → manually formats it. MCP eliminates copy-paste. The prompt → ticket workflow takes seconds instead of minutes. It demonstrates real-world AI tool integration in QA.

**JIRA credentials flow:**
```
Claude Desktop reads .env → passes credentials to MCP server
→ MCP server authenticates to JIRA → creates issue → returns key
```

**Alternative:** Postman or curl to hit JIRA's REST API directly. MCP is preferred because it's prompt-driven — no API knowledge needed from the QA engineer.

---

## 3. `.env` + `.env.example` Pattern — Secrets Management

**What it is:** A pattern for managing credentials locally without committing them to Git.

**Where in repo:**
```
STLC_MCP_Project/
  .env          ← NEVER committed (gitignored) — contains real credentials
  .env.example  ← IS committed — shows what variables are needed (no values)
```

**`.env` contents (never committed):**
```
JIRA_URL=https://somasaicheviti-1780804851917.atlassian.net
JIRA_EMAIL=somasaicheviti@gmail.com
JIRA_API_TOKEN=<real-token>
JIRA_PROJECT_KEY=KAN
JIRA_CLOUD_ID=4b283126-ab5e-479a-8b0b-41797f8a9b8a
```

**`.env.example` contents (committed):**
```
JIRA_URL=https://your-instance.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=KAN
JIRA_CLOUD_ID=your-cloud-id
```

**Why this pattern:**
- A new team member clones the repo, sees `.env.example`, copies it to `.env`, fills in credentials
- The real `.env` never appears in git history — credentials stay private even if the repo is public
- `.gitignore` enforces this: `.env` listed explicitly

**VWO credentials (for CI tests) use a different mechanism:**
```yaml
# .github/workflows/playwright.yml
env:
  VWO_TEST_EMAIL: ${{ secrets.VWO_TEST_EMAIL }}
  VWO_TEST_PASSWORD: ${{ secrets.VWO_TEST_PASSWORD }}
```
GitHub Secrets are injected as environment variables during CI runs. They are not in `.env` — they live in the repository's secret store, encrypted by GitHub.

---

## 4. Custom Config Path — `--config=04_Test_Execution/playwright.config.ts`

**What it is:** The `--config=` flag tells Playwright where to find its configuration file when it's not in the project root.

**Where in repo:**
```yaml
# .github/workflows/playwright.yml:166
run: npx playwright test --config=04_Test_Execution/playwright.config.ts --project chromium
```

**Why non-standard location:** The STLC folder structure places all of Phase 4 (test execution) inside `04_Test_Execution/`. The Playwright config belongs with the test suite, not at the project root. This makes `04_Test_Execution/` a self-contained test suite — navigatable without understanding the parent folder structure.

**For local runs:**
```bash
cd STLC_MCP_Project
npx playwright test --config=04_Test_Execution/playwright.config.ts
npx playwright test --config=04_Test_Execution/playwright.config.ts --project chromium
npx playwright test --config=04_Test_Execution/playwright.config.ts --grep "TC_LOGIN_001"
```

---

## 5. Multi-Reporter Configuration

**What it is:** Running multiple Playwright reporters simultaneously — each produces a different output format for different consumers.

**Where in repo:**
```typescript
// 04_Test_Execution/playwright.config.ts:33
reporter: [
  ['list'],                                          // real-time terminal output
  ['html', { open: 'never' }],                       // interactive HTML report
  ['junit', { outputFile: 'test-results/junit-report.xml' }], // CI integration
],
```

**Why three reporters:**
| Reporter | Who consumes it | Format |
|---|---|---|
| `'list'` | Engineers watching CI logs | Line-by-line terminal output in real time |
| `'html'` | Engineers reviewing results | Interactive browser report with screenshots + traces |
| `'junit'` | CI systems (Jenkins, Azure DevOps) | XML format that CI dashboards parse for test trend graphs |

**`open: 'never'` on HTML reporter:** By default, Playwright opens the HTML report in a browser automatically after local runs. `open: 'never'` disables this — important in CI where no browser is available (the attempt to open would cause an error).

**JUnit XML format:**
```xml
<testsuite name="VWO Login" tests="13" failures="0" skipped="3">
  <testcase name="TC_LOGIN_002" time="17.3" classname="vwo.login.spec.ts">
  </testcase>
</testsuite>
```
CI platforms parse this XML to build test trend dashboards, failure history, and flakiness tracking.

---

## 6. Full POM — Actions + Assertion Helpers

**What it is:** An extended Page Object Model that includes not just locators and action methods, but also named assertion helpers — methods that encapsulate multiple `expect()` calls.

**Where in repo:** `04_Test_Execution/pages/LoginPage.ts`

**Three layers in this POM:**

**Layer 1 — Locators (constructor):**
```typescript
this.emailInput    = page.locator('#login-username');
this.passwordInput = page.getByRole('textbox', { name: 'Password' });
this.rememberMeCheckbox = page.locator('input[type="checkbox"]').first();
// ... 12 total locators
```

**Layer 2 — Action methods:**
```typescript
async fillEmail(email: string): Promise<void>
async fillPassword(password: string): Promise<void>
async fillCredentials(email: string, password: string): Promise<void>
async clickSignIn(): Promise<void>
async login(email: string, password: string): Promise<void>  // convenience: fill + click
async checkRememberMe(): Promise<void>
async uncheckRememberMe(): Promise<void>
async clickForgotPassword(): Promise<void>
async clickBack(): Promise<void>
async togglePasswordVisibility(): Promise<string | null>
async clickGoogleSignIn(): Promise<void>
```

**Layer 3 — Assertion helpers:**
```typescript
async assertLoginFormVisible(): Promise<void>        // checks email + password + signIn visible
async assertForgotPasswordFormVisible(): Promise<void> // checks resetEmailInput visible
async assertInvalidEmailVisible(): Promise<void>     // checks inline error visible
async assertOnLoginPage(): Promise<void>             // checks URL contains /#/login
async assertRedirectedFromLogin(): Promise<void>     // checks URL does NOT contain /#/login
```

**Why assertion helpers in POM (not in test file):**
```typescript
// Without assertion helper — test file is verbose
await expect(loginPage.emailInput).toBeVisible();
await expect(loginPage.passwordInput).toBeVisible();
await expect(loginPage.signInBtn).toBeVisible();

// With assertion helper — test file is concise and readable
await loginPage.assertLoginFormVisible();
```

When VWO adds a new required element to the login form, you update `assertLoginFormVisible()` in one place — not 10 test cases.

---

## 7. `page.locator('#id')` — CSS ID Selector

**What it is:** Queries the DOM for an element with a specific `id` attribute. CSS ID selectors are the most specific possible selector — each ID must be unique per HTML spec.

**Where in repo:**
```typescript
// 04_Test_Execution/pages/LoginPage.ts:127
this.emailInput    = page.locator('#login-username');
this.resetEmailInput = page.locator('#forgot-password-username');
```

**Why NOT `getByRole('textbox', {name:'Email address'})` here:**
VWO keeps both the login form and the forgot-password form in the DOM simultaneously. Both email inputs share the same accessible name "Email address". `getByRole()` finds 2 elements → Playwright strict mode violation.

CSS ID selectors target one specific element regardless of how many similar elements exist in the DOM:
- `#login-username` → exactly the login form's email input
- `#forgot-password-username` → exactly the forgot-password form's email input

**Why ID selectors are reliable for VWO specifically:**
VWO's Angular component uses semantic IDs that describe the field's purpose: `login-username` (not `ng-input-0` or `mat-input-3`). Semantic IDs are stable — VWO would need to redesign the form's architecture to change them.

**CSS selector reference:**
```typescript
page.locator('#elementId')            // by id attribute
page.locator('.className')             // by CSS class
page.locator('input[type="checkbox"]') // by element + attribute
page.locator('form > input')           // child combinator
page.locator('div.form input:first-child') // complex selector
```

---

## 8. `page.locator().first()` — Disambiguation

**What it is:** When a locator matches multiple elements, `.first()` selects only the first match. Prevents strict mode violations without requiring a more specific selector.

**Where in repo:**
```typescript
// 04_Test_Execution/pages/LoginPage.ts:133
this.signInBtn = page.getByRole('button', { name: 'Sign in' }).first();
//                                                              ↑ VWO has two "Sign in" buttons

this.rememberMeCheckbox = page.locator('input[type="checkbox"]').first();
//                                                               ↑ target first checkbox

this.resetPasswordBtn = page.getByRole('button', { name: /reset password/i }).first();
```

**Why `.first()` instead of a more specific locator:**
- VWO's "Sign in" button appears twice: once in the login form, once in the SSO form. Both are rendered simultaneously in the DOM.
- `.first()` reliably targets the primary login form's button (it appears first in DOM order)
- The alternative (`nth=0`) is less readable than `.first()`

**Locator index methods:**
```typescript
locator.first()          // first matching element
locator.last()           // last matching element
locator.nth(0)           // by 0-based index (0 = first)
locator.nth(2)           // third matching element
```

**When NOT to use `.first()`:** If DOM order changes (VWO adds a new button before the existing one), `.first()` targets the wrong element. Prefer a more specific selector if possible. `.first()` is appropriate when DOM order is stable and well-understood.

---

## 9. `.or()` Combinator — Union Locator

**What it is:** Creates a locator that matches if EITHER of two sub-locators resolves to a visible element. Handles cases where the same UI element may render as different HTML element types.

**Where in repo:**
```typescript
// 04_Test_Execution/pages/LoginPage.ts:156
this.backBtn = page.getByRole('button', { name: /back/i })
    .or(page.getByRole('link', { name: /back/i }))
    .first();
```

**Why needed:** VWO's "Back" element on the forgot-password form can render as either:
- `<button class="...">Back</button>` (standard button)
- `<a href="...">Back</a>` (link that looks like a button)

This depends on the Angular component version and form context. `getByRole('button', {name:/back/i})` finds 0 elements when it's an `<a>`. `.or(getByRole('link', {...}))` catches both cases.

**`.or()` evaluation:**
- Playwright checks the first locator → 1+ elements found → uses that
- If first locator resolves to 0 elements → checks the second locator
- If both resolve to 0 → strict mode violation (0 elements)
- `.first()` on the result → if both somehow match simultaneously, take the first

**Alternative without `.or()`:**
```typescript
page.locator('[class*="back"], a[href*="forgot"]') // CSS — less semantic, fragile
```

---

## 10. `input[type="checkbox"]` — CSS Attribute Selector

**What it is:** A CSS selector that targets elements by attribute value. More specific than a plain element selector.

**Where in repo:**
```typescript
// 04_Test_Execution/pages/LoginPage.ts:144
this.rememberMeCheckbox = page.locator('input[type="checkbox"]').first();
```

**Why NOT `getByRole('checkbox', {name:/remember me/i})`:**
VWO uses Angular Material's `MatCheckbox` component. The native `<input type="checkbox">` is visually hidden (`cdk-visually-hidden`). Angular Material handles accessibility via `aria-labelledby` on the host component, but this doesn't flow through to the native input. `getByRole('checkbox')` queries the ARIA tree — finds 0 elements because the native input has no accessible name.

`page.locator('input[type="checkbox"]')` queries the DOM directly — finds the native input element regardless of ARIA state.

**CSS attribute selectors:**
```typescript
page.locator('input[type="checkbox"]')   // input elements with type=checkbox
page.locator('input[type="email"]')      // input elements with type=email
page.locator('a[href*="forgot"]')        // links containing "forgot" in href
page.locator('[role="alert"]')           // any element with role=alert
page.locator('[data-testid="submit"]')   // by test ID attribute
page.locator('[aria-label="Close"]')     // by aria-label
```

---

## 11. `test.fixme(condition, reason)` — Gap Documentation

**What it is:** Marks a test as a known gap — something that should be tested but the application doesn't support yet. The test body is not executed. Appears in reports as "fixme."

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:138
test('TC_LOGIN_003 — Invalid email format triggers inline validation error', async () => {
  test.fixme(
    true,
    'VWO submits all inputs server-side — no inline email format validation exists. ' +
    'Client-side validation is a known UX gap.'
  );
});
```

**Why `test.fixme()` instead of deleting the test:**
- The test case `TC_LOGIN_003` was designed based on expected standard behaviour (most login forms validate email format client-side before submission)
- VWO doesn't implement client-side validation — all inputs go to the server
- **Deleting the test** would erase the finding — future engineers wouldn't know this gap was considered
- **`test.fixme()`** preserves the test intent, documents the finding, and doesn't fail CI

**Semantic difference: `fixme` vs `skip`:**
| Method | Meaning |
|---|---|
| `test.skip()` | "This test is temporarily disabled — environment issue or not relevant now" |
| `test.fixme()` | "This test represents a real gap — the feature should exist but doesn't" |

In HTML reports: `fixme` tests appear with an orange/amber indicator — visually distinct from skipped tests — drawing attention to the application gap.

---

## 12. `test.skip(!process.env.VWO_TEST_EMAIL)` — Credential Guard

**What it is:** Skips a test at runtime when the required environment variable (VWO credentials) is absent. Tests run only when credentials are configured.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:80
test('TC_LOGIN_001 — Valid login with registered credentials', async ({ page }) => {
  test.skip(
    !process.env.VWO_TEST_EMAIL,
    'Valid login requires VWO_TEST_EMAIL and VWO_TEST_PASSWORD env vars'
  );
  // Only runs if VWO_TEST_EMAIL is set
  await loginPage.login(VALID_USER.email, VALID_USER.password);
});
```

**In CI workflow:**
```yaml
env:
  VWO_TEST_EMAIL: ${{ secrets.VWO_TEST_EMAIL }}
  VWO_TEST_PASSWORD: ${{ secrets.VWO_TEST_PASSWORD }}
```

**Flow:**
- Secret not configured in GitHub → `process.env.VWO_TEST_EMAIL` is `undefined` → `!undefined` is `true` → test skips
- Secret configured → env var has value → `!value` is `false` → test runs

**Why this is better than hardcoding test credentials:**
- Credentials committed to Git = security breach (anyone with repo access can use them)
- GitHub Secrets are encrypted and only injected into CI runs
- The skip message tells any engineer exactly what to configure to run the test

---

## 13. `test.slow()` — Timeout Tripler

**What it is:** Triples the current test's timeout. If the global test timeout is 60s (the default), a `test.slow()` test gets 180s.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:106
test('TC_LOGIN_002 — Login rejected with wrong password', async ({ page }) => {
  test.slow(); // VWO server-side validation takes 14-17 seconds
```

**Why needed:** TC_LOGIN_002 submits wrong credentials and waits for VWO's error message. VWO's server takes 14-17 seconds. The `expect.timeout: 25000` in config covers the assertion wait, but the total test time (navigate + fill + click + wait + assert) can approach 30-35 seconds. `test.slow()` ensures the test's overall timeout budget isn't exhausted.

**Alternative:**
```typescript
test.setTimeout(90000); // set explicit timeout for this test
```
`test.slow()` is preferred because it's relative — it scales with the configured global timeout. `test.setTimeout(90000)` hardcodes a number that becomes wrong if the global timeout changes.

---

## 14. `page.evaluate()` — JavaScript in Browser Context

**What it is:** Executes JavaScript code inside the browser's JavaScript engine and returns the result to the Node.js test runner.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:162
const readyState = await page.evaluate(() => document.readyState);
expect(readyState).toBe('complete');
```

**Why used:** Verifies that the page's DOM is fully loaded and JavaScript has finished executing. `document.readyState` is a browser API — accessible only inside the browser context. `page.evaluate()` is the bridge between Node.js (where Playwright runs) and the browser's JavaScript engine.

**`document.readyState` values:**
| Value | Meaning |
|---|---|
| `'loading'` | DOM is still being parsed |
| `'interactive'` | DOM parsed, external resources still loading |
| `'complete'` | Everything loaded (equivalent to `window.onload` fired) |

**Other `page.evaluate()` uses:**
```typescript
// Get page-level data
const title = await page.evaluate(() => document.title);
const cookies = await page.evaluate(() => document.cookie);
const scrollY = await page.evaluate(() => window.scrollY);

// Execute browser actions
await page.evaluate(() => window.scrollTo(0, 500));
await page.evaluate(() => document.querySelector('#element').click());
```

**Security note:** `page.evaluate()` runs arbitrary JavaScript in the browser. Only use it for browser APIs not available through Playwright's native methods.

---

## 15. `page.on('request', ...)` — Request Interception

**What it is:** Registers a listener that fires every time the page makes a network request. Used to capture redirect URLs before they complete.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:293
let capturedGoogleUrl: string | null = null;

page.on('request', request => {
  if (request.url().includes('accounts.google.com') || request.url().includes('oauth')) {
    capturedGoogleUrl = request.url();
  }
});
```

**Why used in TC_LOGIN_008 (Google OAuth):** When clicking "Sign in with Google," VWO initiates an OAuth redirect to Google's authentication server. The full redirect completes so fast that Playwright's `toHaveURL()` might miss capturing the URL before it navigates further. Listening to requests gives us the URL at the exact moment the request is made.

**`page.on()` event types:**
```typescript
page.on('request', req => console.log(req.url()));       // outgoing request
page.on('response', res => console.log(res.status()));   // incoming response
page.on('console', msg => console.log(msg.text()));      // browser console
page.on('pageerror', err => console.error(err));         // JavaScript errors
page.on('dialog', dialog => dialog.accept());            // alert/confirm dialogs
page.on('download', download => download.path());        // file downloads
```

**Alternative:** `page.route()` — intercepts AND can modify requests before they complete (used for mocking APIs).

---

## 16. `page.waitForURL(pattern)` — URL Navigation Wait

**What it is:** Pauses test execution until the page URL matches a given pattern (string, regex, or function). More specific than `waitForLoadState()`.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:303
await page.waitForURL(
  url => url.toString().includes('accounts.google.com') || url.toString().includes('oauth'),
  { timeout: GOOGLE_OAUTH.redirectTimeoutMs }
);
```

**Function-based predicate:** The most flexible form — instead of a string or regex, pass a function that returns `true` when the URL matches. Handles complex conditions (URL contains A OR B).

**Forms of `waitForURL`:**
```typescript
await page.waitForURL('https://example.com/dashboard');  // exact string
await page.waitForURL(/dashboard/);                        // regex
await page.waitForURL(url => url.pathname === '/dashboard'); // function predicate
await page.waitForURL('**/dashboard', { timeout: 10000 }); // glob pattern
```

**Alternative:** `page.waitForNavigation()` — waits for any navigation to complete (less specific — doesn't check where you ended up).

---

## 17. `context.cookies()` — Browser Context Cookie Access

**What it is:** Returns all cookies set for the current browser context. Used to verify session persistence after login with Remember Me checked.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:197
const cookies = await context.cookies();
const authCookie = cookies.find(c => c.name === REMEMBER_ME.cookieName);

if (authCookie) {
  expect(authCookie.expires).toBeGreaterThan(REMEMBER_ME.minCookieMaxAge);
} else {
  const persistentCookies = cookies.filter(c => c.expires > 0);
  expect(persistentCookies.length).toBeGreaterThan(0);
}
```

**Why `context` fixture instead of `page`:**
Cookies belong to the **browser context** (the session container) — not to a single page. Multiple pages in the same context share cookies. `page.context().cookies()` also works, but the `context` fixture directly from test parameters is cleaner.

**Cookie structure:**
```typescript
interface Cookie {
  name: string;      // cookie name
  value: string;     // cookie value
  domain: string;    // which domain owns the cookie
  path: string;      // URL path the cookie applies to
  expires: number;   // expiry timestamp (Unix epoch). -1 = session cookie
  httpOnly: boolean; // JS cannot access this cookie
  secure: boolean;   // only sent over HTTPS
  sameSite: 'Strict' | 'Lax' | 'None';
}
```

**`expires: -1` vs `expires: timestamp`:**
- `expires: -1` = session cookie — deleted when browser closes
- `expires: 1750000000` = persistent cookie — survives browser restart
- Remember Me should produce `expires > 0` (persistent)

---

## 18. `page.keyboard.press('Tab')` — Keyboard Interaction

**What it is:** Simulates keyboard keypresses. `Tab` key moves focus to the next focusable element — used for tab order accessibility testing.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:372
await loginPage.emailInput.focus();
await expect(loginPage.emailInput).toBeFocused();

await page.keyboard.press('Tab');
await expect(loginPage.passwordInput).toBeFocused();

await page.keyboard.press('Tab'); // toggle button
await page.keyboard.press('Tab'); // Forgot Password button
```

**Why tested:** Tab order is an accessibility requirement (WCAG 2.1). Users who navigate by keyboard (or screen reader) must be able to reach all interactive elements in a logical sequence: email → password → sign in. A broken tab order means keyboard-only users cannot log in.

**Common keyboard interactions:**
```typescript
await page.keyboard.press('Tab');       // next focusable element
await page.keyboard.press('Shift+Tab'); // previous focusable element
await page.keyboard.press('Enter');     // submit / activate
await page.keyboard.press('Escape');    // close modal / cancel
await page.keyboard.press('ArrowDown'); // dropdown navigation
await page.keyboard.type('text');       // type without targeting an element
```

**`toBeFocused()` assertion:**
```typescript
await expect(element).toBeFocused();    // element has :focus
await expect(element).not.toBeFocused();
```

---

## 19. `togglePasswordVisibility()` — Return Value from Action Method

**What it is:** A POM action method that performs an action AND returns a value — the new `type` attribute of the password field after toggling.

**Where in repo:**
```typescript
// 04_Test_Execution/pages/LoginPage.ts:255
async togglePasswordVisibility(): Promise<string | null> {
  await this.passwordToggleBtn.click();
  return await this.passwordInput.getAttribute('type');
  // Returns 'text' (visible) or 'password' (masked)
}
```

**Used in test:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:257
await loginPage.passwordToggleBtn.click();
await expect(loginPage.passwordInput).toHaveAttribute('type', PASSWORD_TOGGLE.visibleType);
```

**`getAttribute()` — DOM attribute access:**
```typescript
await element.getAttribute('type')        // returns 'text' or 'password'
await element.getAttribute('placeholder') // returns placeholder text
await element.getAttribute('href')        // returns link target
await element.getAttribute('data-id')     // any custom attribute
// Returns null if attribute doesn't exist
```

**`toHaveAttribute()` assertion:**
```typescript
await expect(passwordInput).toHaveAttribute('type', 'password'); // masked
await expect(passwordInput).toHaveAttribute('type', 'text');     // visible
```

---

## 20. Import Aliases and `type` Keyword

**What it is:** TypeScript's `import type` imports only the type definition — not the runtime value. Useful for types used only in type annotations.

**Where in repo:**
```typescript
// 04_Test_Execution/tests/vwo.login.spec.ts:38
import { test, expect, type BrowserContext } from '@playwright/test';
//                      ↑ 'type' keyword — BrowserContext is a type, not a value
```

**Why `type BrowserContext` (not `import { BrowserContext }`):**
`BrowserContext` is only used in a TypeScript type annotation:
```typescript
}: { page: import('@playwright/test').Page; context: BrowserContext })
```
Using `import type` tells the TypeScript compiler to strip this import at runtime — no JavaScript code is emitted for it. Slightly smaller bundle, clearer intent.

**Import patterns:**
```typescript
import { test, expect } from '@playwright/test';          // runtime values
import type { Page, Locator } from '@playwright/test';    // type-only
import { test, expect, type Page } from '@playwright/test'; // mixed
```

---

## 21. `testData.ts` — Centralized Test Data

**What it is:** A separate file that defines all test data as constants — no hardcoded strings in test files.

**Where in repo:**
```typescript
// 04_Test_Execution/utils/testData.ts (referenced in tests)
export const VALID_USER = {
  email: process.env.VWO_TEST_EMAIL || '',
  password: process.env.VWO_TEST_PASSWORD || '',
};

export const INVALID_CASES = {
  wrongPassword: { email: 'test@wingify.com', password: 'wrongpass123' },
  empty: { email: '', password: '' },
};

export const GOOGLE_OAUTH = {
  redirectTimeoutMs: 15000,
  expectedRedirectHost: 'accounts.google.com',
  stateParamRegex: /state=/,
  requiredParams: ['client_id', 'redirect_uri', 'response_type'],
};
```

**Why centralized test data:**
- Change a test email address → one file to update (not 13 test cases)
- Test data reads from env vars (`process.env.VWO_TEST_EMAIL`) — the same data file works locally and in CI

**Alternative:** Fixture files (JSON), data providers (factory functions), faker libraries (random test data generation).

---

## 22. `retries: process.env.CI ? 2 : 0` — Higher Retry for Complex Suite

**Where in repo:**
```typescript
// 04_Test_Execution/playwright.config.ts:23
retries: process.env.CI ? 2 : 0,
```

**Why 2 retries (not 1 like other projects):** This suite has 13 tests with real credential-dependent scenarios, VWO server validation, and OAuth redirects — more surface area for transient failures. 2 retries provides an extra safety net without masking real bugs (a genuinely broken test fails on all 3 attempts).

---

## Quick Reference — All Concepts at a Glance

| Concept | File/Location | Purpose |
|---|---|---|
| 6-phase STLC folder | Project root `01_` to `06_` | Lifecycle structure |
| MCP integration | Claude Desktop + `.env` | JIRA ticket creation from prompts |
| `.env` + `.env.example` | Project root | Secrets management pattern |
| Custom config path | `--config=04_Test_Execution/playwright.config.ts` | Non-standard config location |
| Multi-reporter | `playwright.config.ts:33` | list + html + junit |
| Full POM (3 layers) | `pages/LoginPage.ts` | Locators + actions + assertions |
| `page.locator('#id')` | `pages/LoginPage.ts:127` | Specific ID targeting (strict mode fix) |
| `.first()` | `pages/LoginPage.ts:133` | Disambiguate multiple matches |
| `.or()` combinator | `pages/LoginPage.ts:156` | Handle button OR link variants |
| CSS attribute selector | `pages/LoginPage.ts:144` | Target native checkbox (Angular Material) |
| `test.fixme()` | `tests/vwo.login.spec.ts:138` | Document known application gap |
| `test.skip(!secret)` | `tests/vwo.login.spec.ts:80` | Credential-conditional skip |
| `test.slow()` | `tests/vwo.login.spec.ts:106` | Triple timeout for slow VWO tests |
| `page.evaluate()` | `tests/vwo.login.spec.ts:162` | Access browser JavaScript APIs |
| `page.on('request')` | `tests/vwo.login.spec.ts:293` | Capture OAuth redirect URL |
| `page.waitForURL()` | `tests/vwo.login.spec.ts:303` | Wait for specific URL match |
| `context.cookies()` | `tests/vwo.login.spec.ts:197` | Verify persistent session cookie |
| `keyboard.press('Tab')` | `tests/vwo.login.spec.ts:372` | Tab order accessibility test |
| `getAttribute()` | `pages/LoginPage.ts:257` | Read DOM attribute values |
| `import type` | `tests/vwo.login.spec.ts:38` | Type-only import |
| Centralized test data | `utils/testData.ts` | No hardcoded strings in tests |
| `retries: 2` in CI | `playwright.config.ts:23` | Extra resilience for complex suite |
| `video: 'retain-on-failure'` | `playwright.config.ts:47` | Video evidence on failure |
| JUnit XML reporter | `playwright.config.ts:36` | CI dashboard integration |
