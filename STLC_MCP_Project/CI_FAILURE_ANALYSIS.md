# CI Failure Analysis — STLC MCP Project

## Approach Overview

| Field | Detail |
|---|---|
| **Approach** | 05 — Full STLC via MCP + JIRA Integration |
| **Folder** | `STLC_MCP_Project/` |
| **CI Job** | `test-mcp` |
| **Runner** | `ubuntu-latest`, Node 24 |
| **Playwright Version** | 1.59.x |
| **Browser in CI** | Chromium only |
| **Test File** | `04_Test_Execution/tests/vwo.login.spec.ts` |
| **Test Cases** | 13 tests (8 core login + 5 UI/accessibility) |
| **Final CI Status** | ✅ Green — 9 passed, 3 skipped (require VWO credentials), 1 fixme |

### What Makes This Approach Unique
This is the most complete project in the portfolio. It covers all 6 STLC phases as structured folders, has the deepest LoginPage POM implementation, and integrates JIRA bug ticket creation directly via Claude Desktop MCP tools. It also had the **highest number of CI failures** — 8 distinct failures were identified and fixed before the job reached green.

---

## CI Failure #1 — `package-lock.json` Missing: CI Setup Crash

| Field | Detail |
|---|---|
| **File** | `STLC_MCP_Project/package-lock.json` (was absent) |
| **Step** | `actions/setup-node@v4` with `cache: "npm"` |
| **Failure Type** | CI infrastructure crash before tests even ran |
| **Category** | npm cache configuration |

### Error Message
```
Error: Some specified paths were not resolved, unable to cache dependencies.
  /home/runner/work/sdet-stlc-portfolio/sdet-stlc-portfolio/STLC_MCP_Project/package-lock.json

Error: The process '/usr/bin/bash' failed with exit code 1
```

### Root Cause
The `setup-node@v4` action with `cache: "npm"` requires a `package-lock.json` file to:
1. Compute a cache key (hash of the lock file content)
2. Restore matching cached `node_modules` from the previous run
3. Fall back to `npm ci` if cache misses

When `STLC_MCP_Project/package-lock.json` did not exist (the project was initially set up with only `package.json`), the cache action could not compute a hash. It threw a hard error and exited the job before any npm install or Playwright test could run.

This failure was **pre-test** — no tests ran, no results were produced, the entire CI job was red from the cache step.

### Why This Occurs
This situation arises whenever:
- A new sub-project is added to a monorepo with its own `package.json` but without committing the generated `package-lock.json`
- A developer runs `npm install` locally (generates `package-lock.json`) but forgets to commit it
- `package-lock.json` is added to `.gitignore` (incorrect for libraries and apps)

### How We Fixed It
```powershell
# Run in STLC_MCP_Project/ directory
npm install --package-lock-only
```

The `--package-lock-only` flag generates `package-lock.json` **without actually installing any packages to `node_modules`**. This is ideal for CI setup because:
1. It produces the lock file that `setup-node@v4` needs
2. It does not install dependencies (CI does that with `npm ci` in a separate step)
3. The lock file captures exact resolved versions of all transitive dependencies

The generated file was then committed:
```
git add STLC_MCP_Project/package-lock.json
git commit -m "fix: generate package-lock.json for STLC_MCP_Project CI cache"
```

### Why We Chose `--package-lock-only` Over `npm install`
| Option | What It Does | Problem |
|---|---|---|
| `npm install` | Installs all packages + generates lock file | Installs packages into `node_modules` — unnecessary for just generating the lock file; also risks committing `node_modules` accidentally |
| `npm ci` | Installs from existing lock file | Requires the lock file to already exist — circular dependency |
| `npm install --package-lock-only` | Only updates/creates lock file, no install | Exactly what we need — generates lock file without polluting working directory |

### Benefits
- CI job now passes the cache step and proceeds to `npm ci`
- npm cache is used on subsequent runs — saves 1-2 minutes of install time per CI run
- Lock file pinned versions — reproducible installs across all environments

### Limitations
- The lock file must be kept up-to-date when `package.json` changes. After every `npm install --save` or dependency version bump, the lock file must be regenerated and committed.

---

## CI Failure #2 — TC_LOGIN_006: Strict Mode Violation (Dual Email Inputs)

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/pages/LoginPage.ts` |
| **Test** | `TC_LOGIN_006 — Forgot Password navigates to reset form and Back returns to login` |
| **Failure Type** | `strict mode violation: getByRole('textbox', {name:'Email address'}) resolved to 2 elements` |
| **Category** | Angular SPA DOM architecture — both forms simultaneously in DOM |

### Error Message
```
Error: strict mode violation: getByRole('textbox', {name:'Email address'}) resolved to 2 elements:
  1) <input id="login-username" type="email" name="email" placeholder="Enter email ID"
     aria-label="Email address" class="ng-untouched ng-pristine ng-invalid"/>
  2) <input id="forgot-password-username" type="email" name="email"
     placeholder="Enter email ID" aria-label="Email address" class="ng-untouched..."/>

  Call log:
    at 04_Test_Execution/pages/LoginPage.ts:127:18
```

### Root Cause
VWO's Angular login page uses a **single-page architecture where both the login form and the forgot-password form coexist in the DOM simultaneously**. When TC_LOGIN_006 clicks "Forgot Password?", the forgot-password form becomes visible while the **login form remains in the DOM** (just hidden via CSS `display:none` or Angular's `*ngIf="false"` equivalent).

Both forms contain an email input with the **same accessible name** `"Email address"`:
- Login form: `<input id="login-username" aria-label="Email address" />`
- Forgot-password form: `<input id="forgot-password-username" aria-label="Email address" />`

Playwright's `getByRole('textbox', {name:'Email address'})` uses the accessibility tree. Both inputs have identical role (`textbox`) and identical accessible name (`Email address`). Playwright finds **2 matches** and throws a `strict mode violation` because it cannot determine which one the test intends to target.

This failure is **unique to TC_LOGIN_006** (Forgot Password test). All other tests (TC_LOGIN_001–005, 007, 008) do not trigger the Forgot Password flow, so only one email input is visible during those tests — no strict mode violation occurs.

### Why This Occurs
This is an **Angular SPA design pattern**: both forms are in the DOM so Angular can manage their state and animations without a page reload. The CSS toggles visibility. Playwright's accessibility-based locators (like `getByRole`) see elements regardless of CSS visibility — they query the full accessibility tree including hidden elements.

Any time you have:
1. Multiple form states on a single Angular/React/Vue page
2. Multiple elements with the same ARIA role and name
3. A test that navigates to one of those states

...you will encounter strict mode violations with accessibility-based locators.

### Intermediate Fix (Commit `2b95ff6`)
The initial approach was to skip TC_LOGIN_006 in CI entirely:
```typescript
test.skip(!!process.env.CI, 'VWO forgot-password DOM — strict mode violation unresolved in headless CI');
```
This kept CI green but left the test unverified in CI. It was a temporary measure while the root cause was investigated.

### Final Fix (Commit `86b83b1`)
```typescript
// pages/LoginPage.ts — BEFORE (broken)
this.emailInput    = page.getByRole('textbox', { name: 'Email address' });
this.resetEmailInput = page.getByRole('textbox', { name: 'Email address' });

// pages/LoginPage.ts — AFTER (fixed)
// VWO keeps BOTH email inputs in the DOM simultaneously.
// Each has a unique ID — use CSS ID selector to bypass the accessibility tree ambiguity.
this.emailInput    = page.locator('#login-username');          // login form email
this.resetEmailInput = page.locator('#forgot-password-username'); // forgot-password form email
```

**CSS ID selectors (`#login-username`)** are exact — they match exactly one element in the DOM because IDs must be unique per HTML specification. They bypass the accessibility tree entirely, targeting the specific DOM element by its `id` attribute.

### Why We Chose ID-Based Locators
| Locator Strategy | Works? | Reason |
|---|---|---|
| `getByRole('textbox', {name:'Email address'})` | ❌ | Matches 2 elements — strict mode violation |
| `getByLabel('Email address')` | ❌ | Same accessibility tree — same 2 matches |
| `getByRole('textbox', {name:'Email address'}).first()` | ⚠️ | Works but targets whichever is first in DOM — fragile if DOM order changes |
| `page.locator('#login-username')` | ✅ | Exact ID match — exactly 1 element always |
| `page.locator('[placeholder="Enter email ID"]')` | ⚠️ | Both inputs have same placeholder — still 2 matches |

CSS ID selectors are the most specific possible locator. VWO's IDs (`login-username`, `forgot-password-username`) are semantic and stable — they describe their purpose in the form name. These IDs are unlikely to change without VWO also changing the form architecture.

### Why This Fix Enabled Removing the `test.skip()`
With ID-based locators, each email input is now uniquely identified:
- `loginPage.emailInput` → always finds `#login-username` (login form)
- `loginPage.resetEmailInput` → always finds `#forgot-password-username` (forgot-password form)

Even when both forms are in the DOM simultaneously, each locator resolves to exactly one element. TC_LOGIN_006 runs end-to-end in CI without the strict mode violation.

### Benefits
- TC_LOGIN_006 now fully verified in CI (not skipped)
- Both email inputs are precisely targeted regardless of DOM state
- The fix is documented in the POM constructor with a comment explaining why IDs are used (for future maintainers)

### Limitations
- If VWO renames the `id` attributes (e.g., from `login-username` to `email-login`), the locator breaks silently — `page.locator('#login-username')` finds 0 elements and the test fails at navigation, not at the locator definition
- CSS ID locators are less "readable intent" than `getByRole` — they don't communicate that the element is a text input
- This fix required inspecting VWO's HTML source — it cannot be derived from visual observation alone

---

## CI Failure #3 — TC_LOGIN_006: URL Assertion After Forgot Password Click

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/tests/vwo.login.spec.ts` |
| **Test** | `TC_LOGIN_006` |
| **Failure Type** | `expect(page).toHaveURL` assertion failed |
| **Category** | SPA routing misunderstanding |

### Error Message
```
Error: expect(received).toHaveURL(expected)
  Expected pattern: /.*#\/login/
  Received string:  "https://app.vwo.com/#/forgot-password"
  at vwo.login.spec.ts:228
```

### Root Cause
The original TC_LOGIN_006 included `await loginPage.assertOnLoginPage()` after clicking the Forgot Password button. `assertOnLoginPage()` checks:

```typescript
async assertOnLoginPage(): Promise<void> {
  await expect(this.page).toHaveURL(/.*#\/login/);
}
```

The test assumed that clicking Forgot Password would show a sub-form **within the same login page URL** (`/#/login`). This assumption was wrong.

VWO's Angular SPA navigates to a **new route** when Forgot Password is clicked:
- Before click: `https://app.vwo.com/#/login`
- After click: `https://app.vwo.com/#/forgot-password`

The Angular router changes the hash fragment. The URL assertion looked for `/#/login` but the page had navigated to `/#/forgot-password`. The assertion failed immediately.

### Why This Occurs
There are two common patterns for multi-step forms in SPAs:

**Pattern A — Route change:** The router changes the URL when moving between form states. Each state is a separate "page" in the SPA (`/#/login`, `/#/forgot-password`). This is VWO's actual behaviour.

**Pattern B — DOM state change:** The forms are toggled within a single route via `*ngIf` or CSS. The URL stays the same (`/#/login`) throughout. The test assumption was this pattern.

Without manually observing the browser URL bar while clicking Forgot Password on the live VWO site, the wrong pattern was assumed.

### How We Fixed It
Removed `assertOnLoginPage()` from TC_LOGIN_006:

```typescript
// BEFORE (broken)
await loginPage.clickForgotPassword();
await loginPage.assertOnLoginPage();  // ← WRONG: URL is now /#/forgot-password
await loginPage.assertForgotPasswordFormVisible();

// AFTER (fixed)
await loginPage.clickForgotPassword();
// No URL assertion here — VWO navigates to /#/forgot-password, not staying on /#/login
await loginPage.assertForgotPasswordFormVisible();
await expect(loginPage.signInBtn).not.toBeVisible();
```

The test now verifies what matters functionally:
1. The forgot-password form's email input is visible (`#forgot-password-username`)
2. The login form's Sign In button is **not** visible (hidden after navigation)
3. After clicking Back, the login form re-appears

### Why We Chose To Remove (Not Replace) The Assertion
We could have replaced with `toHaveURL(/.*#\/forgot-password/)`. We did not because:
- The test's purpose is to verify **form navigation** — does clicking Forgot Password show the correct form? Not: does the URL change to a specific path?
- URL assertions test routing logic, not UX behaviour
- VWO may change the URL scheme in a future release — the form visibility assertion is more stable

### Benefits
- Test now correctly matches VWO's actual SPA navigation behaviour
- Form visibility assertions are more meaningful than URL assertions for UX testing

### Limitations
- No URL verification in TC_LOGIN_006 — if VWO accidentally navigated to the wrong route but somehow still showed the forgot-password form elements, the test would not catch it

---

## CI Failure #4 — TC_LOGIN_002/004: Error Text Regex Mismatch

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/tests/vwo.login.spec.ts` |
| **Tests** | TC_LOGIN_002 (wrong password), TC_LOGIN_004 (empty fields) |
| **Failure Type** | Assertion timeout — element not found |
| **Category** | Wrong assumption about VWO error message content |

### Error Message
```
Error: expect(received).toBeVisible()
  Locator: getByText(/invalid|incorrect|wrong/i)
  Expected: visible
  Received: <element(s) not found>
  25000ms elapsed
```

### Root Cause
The original tests asserted that VWO would display an error message containing the words "invalid", "incorrect", or "wrong". VWO's actual error message is:

> **"Your email, password, IP address or account may be blocked."**

None of these three words appear in VWO's error message. The regex `/invalid|incorrect|wrong/i` found no matching element. The test waited 25 seconds and then failed.

### Why This Occurs
VWO uses a **security-first error message** that does not reveal which field was incorrect. This is best practice for authentication:
- "Invalid email" tells an attacker the email exists in the database
- "Wrong password" tells an attacker the email exists but the password is wrong
- "Your email, password, IP address or account may be blocked" tells the attacker nothing about which condition is true

The test author assumed generic error vocabulary ("invalid", "incorrect", "wrong") that is common in other login forms, without verifying VWO's specific message.

### How We Fixed It
```typescript
// BEFORE (broken)
await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible({ timeout: 25000 });

// AFTER (fixed)
await expect(page.getByText('Your email, password, IP')).toBeVisible({ timeout: 25000 });
```

The partial string `'Your email, password, IP'` is unique to VWO's error message on this page and reliably present for all failed login scenarios (wrong password, empty fields, rate-limiting).

### Benefits
- Tests now correctly locate VWO's actual error message
- Partial string match is resilient to minor VWO copy changes

### Limitations
- If VWO changes its error message prefix, the locator breaks. Should be reviewed when VWO announces UI changes.

---

## CI Failure #5 — TC_LOGIN_003: Expected Inline Email Validation That Doesn't Exist

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/tests/vwo.login.spec.ts` |
| **Test** | `TC_LOGIN_003 — Invalid email format triggers inline validation error` |
| **Failure Type** | Assertion timeout — `getByText('Invalid email')` not found |
| **Category** | Missing client-side feature — VWO doesn't implement inline validation |

### Error Message
```
Error: expect(received).toBeVisible()
  Locator: getByText('Invalid email')
  Expected: visible
  Received: <element(s) not found>
  25000ms elapsed
  at vwo.login.spec.ts:132
```

### Root Cause
TC_LOGIN_003 tested for **client-side email format validation** — the expectation that typing an invalid email format (e.g., `"notanemail"`) and clicking submit would show an inline message like "Invalid email" before the server is even contacted.

**VWO does not implement client-side input validation.** All form submissions — including malformed email addresses, empty strings, and SQL injection payloads — are sent to VWO's server. The client-side JavaScript performs no format checking before submission.

The test waited for a `getByText('Invalid email')` element that VWO will never render because that client-side validation path does not exist.

### Why This Occurs
Client-side email validation is common in many web applications via HTML5's built-in `type="email"` input validation or JavaScript `oninput` handlers. The test author assumed VWO implemented this standard pattern.

VWO chose server-side-only validation for all inputs. This is a **deliberate product decision** — it simplifies the Angular form implementation at the cost of slower feedback for users who type invalid email formats.

### How We Fixed It
```typescript
// AFTER (fixed with test.fixme())
test('TC_LOGIN_003 — Invalid email format triggers inline validation error', async ({ page }) => {
  test.fixme(
    true,
    'VWO submits all inputs server-side — no inline email format validation exists. ' +
    'Client-side validation is a known UX gap. Linked defect: KAN-27.'
  );
});
```

`test.fixme(true, reason)` marks the test as a known failing or unimplementable case. It:
1. **Does not execute the test body** (avoids the 25s timeout on every CI run)
2. **Appears in the HTML report** as "fixme" (not hidden)
3. **Documents the reason** — future engineers know this is a real finding, not an oversight
4. **Does not fail CI** — `fixme` tests are considered expected non-passes

### Why `test.fixme()` Over `test.skip()`

| Method | Effect | When to Use |
|---|---|---|
| `test.skip()` | Skips the test — correct but uninteresting | Feature temporarily unavailable (e.g., login server down for maintenance) |
| `test.fixme()` | Marks as known issue — alerts engineer attention | Known gap in application behaviour; feature should exist but doesn't |
| Remove the test | Deletes the finding | Never — the test documents a real UX gap |

`test.fixme()` communicates: "This is a **real finding** (VWO should have client-side validation), not just a test that's disabled. It needs a product/engineering decision before it can pass."

### Why This Is Documented As a Finding
The absence of client-side email validation is a **UX defect**: a user who types `"notanemail"` waits 14-17 seconds for a server round-trip before learning their email format is wrong. Client-side validation would give immediate feedback. This is the kind of observation that comes from deep test design — not just verifying that the app works, but verifying that it works *well for the user*.

### Benefits
- CI does not waste 25s on every run waiting for validation that will never appear
- The finding is preserved and visible in every HTML report
- Any new team member reading the test output immediately understands there is a UX gap here

### Limitations
- `test.fixme()` does not send an alert — the team must actively read CI reports to notice this gap
- If VWO adds client-side validation in a future release, this test remains fixme until a human updates it — there is no automated detection that the feature now exists

---

## CI Failure #6 — Remember Me Checkbox: ARIA Label Not Exposed

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/pages/LoginPage.ts` |
| **Test** | `TC_LOGIN_005` and `'Remember Me is unchecked by default'` |
| **Failure Type** | Element not found — 0 matches |
| **Category** | Angular Material component — ARIA not propagated |

### Error Message
```
Error: expect(received).not.toBeChecked()
  Locator: getByRole('checkbox', {name: /remember me/i})
  Expected: not checked
  Received: <element(s) not found>
  at LoginPage.ts:144
```

### Root Cause
VWO's Remember Me checkbox is built using **Angular Material's `MatCheckbox` component**. This component wraps a native `<input type="checkbox">` in a custom Angular component with additional UI layers:

```html
<!-- VWO's Angular Material checkbox structure (simplified) -->
<mat-checkbox>
  <label class="mat-checkbox-layout">
    <span class="mat-checkbox-inner-container">
      <input type="checkbox" class="mat-checkbox-input cdk-visually-hidden">
    </span>
    <span class="mat-checkbox-label">Remember me</span>
  </label>
</mat-checkbox>
```

The native `<input type="checkbox">` is **visually hidden** (`cdk-visually-hidden` class applies `position: absolute; opacity: 0;`). The visible checkbox appearance is rendered by Angular Material's CSS on the `<label>` element.

Playwright's `getByRole('checkbox', {name:/remember me/i})` queries the **ARIA accessibility tree**. For it to work, the checkbox must have an accessible name. Angular Material's `MatCheckbox` does NOT automatically propagate the label text as an ARIA name to the hidden native input in VWO's version. The result: the native checkbox exists in the DOM but has no accessible name → `getByRole('checkbox', {name:/remember me/i})` finds 0 elements.

### Why This Occurs
This is a known quirk of **Angular Material components with visually-hidden native inputs**. The Material component handles accessibility internally (via `aria-labelledby` on its host element), but this doesn't always flow through to the native `<input>` that Playwright queries when using `getByRole`.

This situation arises whenever:
- A component library uses a custom UI overlay on top of native form elements
- The native element is visually hidden (opacity:0, off-screen positioning)
- The accessibility tree binding differs from what Playwright's role-based locators expect
- Angular CDK uses `VisuallyHidden` service for custom component internals

### How We Fixed It
```typescript
// pages/LoginPage.ts — BEFORE (broken)
this.rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });

// pages/LoginPage.ts — AFTER (fixed)
// getByRole('checkbox') with accessible name fails — VWO's Angular Material component
// doesn't expose the label as an ARIA name on the native <input>.
// Direct CSS type selector targets the native DOM element without going through ARIA.
this.rememberMeCheckbox = page.locator('input[type="checkbox"]').first();
```

`page.locator('input[type="checkbox"]')` queries the DOM directly for all native checkbox inputs. `.first()` selects the first one — VWO's Remember Me checkbox is the only (or first) `<input type="checkbox">` on the login form.

### Why We Chose `.first()` Instead of a More Specific Selector
| Option | Problem |
|---|---|
| `input[type="checkbox"][name="rememberMe"]` | VWO's checkbox may not have a `name` attribute |
| `input[type="checkbox"].mat-checkbox-input` | Angular class names may change between Angular Material versions |
| `.remember-me input[type="checkbox"]` | Depends on VWO's class naming convention |
| `input[type="checkbox"]` + `.first()` | Works: only one checkbox on the login form; safe and minimal |

The login form has exactly one checkbox (Remember Me). If VWO ever adds a second checkbox, `.first()` would still target the correct element (it's always the first one in DOM order).

### Benefits
- Correctly locates and interacts with VWO's Angular Material checkbox
- Works regardless of how Angular Material handles ARIA internally

### Limitations
- If VWO adds more checkboxes before the Remember Me checkbox in the DOM, `.first()` would target the wrong element
- Bypasses accessibility checks — a screen reader user might not be able to interact with this element the same way Playwright does, and this locator would not detect that issue

---

## CI Failure #7 — `backBtn`: Button vs Link Ambiguity

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/pages/LoginPage.ts` |
| **Test** | `TC_LOGIN_006 — clickBack()` |
| **Failure Type** | Strict mode violation OR element not found |
| **Category** | VWO renders Back as button or link depending on context |

### Root Cause
VWO's "Back" element on the forgot-password form renders as either a `<button>` or an `<a>` link depending on the Angular version, the form state, and the platform (mobile vs desktop view). In some CI headless renders, it appeared as `<a role="button">`. In others, it appeared as `<button>`.

```typescript
// BEFORE (broken) — assumes Back is always a button
this.backBtn = page.getByRole('button', { name: /back/i });
// If VWO renders it as <a>, this finds 0 elements → test fails
```

### How We Fixed It
```typescript
// pages/LoginPage.ts — AFTER (fixed)
// VWO's Back element may be a <button> or <a> — .or() handles both variants.
// .first() prevents a strict mode violation if both roles match simultaneously.
this.backBtn = page.getByRole('button', { name: /back/i })
    .or(page.getByRole('link', { name: /back/i }))
    .first();
```

Playwright's `.or()` combinator creates a **union locator** that matches if either sub-locator resolves to a visible element. `.first()` ensures that if somehow both a button AND a link named "Back" appear, only the first is targeted.

### Why We Chose `.or()` Over CSS Selectors
The `.or()` combinator:
1. Maintains semantic accessibility intent — looks for an interactive element named "Back" regardless of its HTML tag
2. Is self-documenting — reads as "a button named Back OR a link named Back"
3. Works even if VWO changes the element from `<button>` to `<a>` in a future release without requiring a locator update

A CSS alternative like `[role="button"], a[href]` would be less readable and would match more broadly than needed.

### Benefits
- Handles VWO's inconsistent rendering of the Back element across environments
- Future-proof: if VWO changes between button and link, the locator still works

### Limitations
- `.or()` with `.first()` adds a small performance cost — Playwright must query both locator sub-expressions before resolving
- If VWO adds multiple Back buttons or links, `.first()` may target the wrong one

---

## CI Failure #8 — TC_LOGIN_001/005: Valid Login Without VWO Credentials

| Field | Detail |
|---|---|
| **File** | `04_Test_Execution/tests/vwo.login.spec.ts` |
| **Tests** | TC_LOGIN_001, TC_LOGIN_005 |
| **Failure Type** | Tests requiring real credentials fail without them |
| **Category** | Credential-gated test execution |

### Root Cause
TC_LOGIN_001 (valid login) and TC_LOGIN_005 (Remember Me with login) require actual VWO account credentials to complete the login flow and reach the dashboard. In CI, no VWO credentials are configured as secrets (registering a real VWO account for CI testing is not appropriate for a portfolio project).

Without credentials, `VALID_USER.email` and `VALID_USER.password` would be empty strings, causing the tests to attempt login with empty credentials — which always fails with VWO's error message, not with a successful redirect.

### How We Fixed It
```typescript
// vwo.login.spec.ts — TC_LOGIN_001
test('TC_LOGIN_001 — Valid login with registered credentials', async ({ page }) => {
  test.skip(
    !process.env.VWO_TEST_EMAIL,
    'Valid login requires VWO_TEST_EMAIL and VWO_TEST_PASSWORD env vars'
  );
  // Test body only executes when env vars are set
  await loginPage.login(VALID_USER.email, VALID_USER.password);
  await loginPage.assertRedirectedFromLogin();
});
```

And in the GitHub Actions workflow:
```yaml
- name: Run tests
  run: npx playwright test --config=04_Test_Execution/playwright.config.ts --project chromium
  env:
    CI: true
    VWO_TEST_EMAIL: ${{ secrets.VWO_TEST_EMAIL }}
    VWO_TEST_PASSWORD: ${{ secrets.VWO_TEST_PASSWORD }}
```

`!process.env.VWO_TEST_EMAIL` evaluates to `true` when the environment variable is not set, triggering the skip. If the GitHub Secret `VWO_TEST_EMAIL` is configured in the repository, the test runs.

### Benefits
- CI passes cleanly without VWO credentials
- Tests are preserved and document the full happy path
- Any team that configures the secrets gets full credential-dependent test coverage automatically

### Limitations
- Valid login (the most critical P1 test) never runs in CI for this portfolio — critical regression goes undetected

---

## CI Failure #9 — Node Version Deprecation

| Field | Detail |
|---|---|
| **File** | `.github/workflows/playwright.yml` — `test-mcp` job |
| **Category** | CI infrastructure |

Updated from `node-version: "20"` to `node-version: "24"` along with all other jobs. See Playwright_AI_Agents `CI_FAILURE_ANALYSIS.md` for full root cause and reasoning.

---

## CI Failure #10 — Custom Config Path for Playwright

| Field | Detail |
|---|---|
| **File** | `.github/workflows/playwright.yml` — `test-mcp` job |
| **Category** | Non-standard Playwright config location |

### Root Cause
Unlike other projects where `playwright.config.ts` lives at the project root, the MCP project places its config inside the `04_Test_Execution/` folder to mirror the STLC folder structure:

```
STLC_MCP_Project/
  01_Requirement_Analysis/
  02_Test_Plan/
  03_Test_Cases/
  04_Test_Execution/        ← playwright.config.ts lives here
    playwright.config.ts
    tests/
    pages/
  05_Defect_Reports/
  06_Test_Closure/
```

Running `npx playwright test` without specifying a config path would look for `playwright.config.ts` at the root of `STLC_MCP_Project/` — not found → Playwright throws an error.

### How We Fixed It
```yaml
# .github/workflows/playwright.yml — test-mcp job
- name: Run tests — chromium only
  run: npx playwright test --config=04_Test_Execution/playwright.config.ts --project chromium
```

The `--config=` flag explicitly points Playwright to the config file's non-standard location.

### Benefits
- Preserves the STLC folder structure that mirrors the manual project
- Config and tests are co-located within `04_Test_Execution/` — makes phase 4 self-contained

### Limitations
- Every engineer running tests must remember to specify `--config=04_Test_Execution/playwright.config.ts` locally
- The `defaults.run.working-directory: STLC_MCP_Project` in the CI job sets the working directory to the project root — the config path is relative to that

---

## JIRA Integration: MCP Credential Rotation

| Field | Detail |
|---|---|
| **File** | `STLC_MCP_Project/.env` (gitignored) |
| **Category** | JIRA API credential management |

### What Happened
The JIRA MCP integration was initially configured with credentials pointing to an old JIRA instance that had since been deleted or expired. The MCP tool calls from Claude Desktop to JIRA failed with `401 Unauthorized` or `404 Not Found`.

### Root Cause
A previous JIRA cloud instance (`old-instance.atlassian.net`) was used during initial development. When the JIRA project was migrated to a new instance (`somasaicheviti-1780804851917.atlassian.net`), the `.env` file was not updated.

### How We Fixed It
```
# STLC_MCP_Project/.env — updated, never committed (gitignored)
JIRA_URL=https://somasaicheviti-1780804851917.atlassian.net
JIRA_EMAIL=somasaicheviti@gmail.com
JIRA_API_TOKEN=<current-valid-token>
JIRA_PROJECT_KEY=KAN
JIRA_CLOUD_ID=4b283126-ab5e-479a-8b0b-41797f8a9b8a
```

`.env.example` (committed, no real credentials) was updated to reflect the new structure:
```
JIRA_URL=https://your-instance.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=KAN
JIRA_CLOUD_ID=your-cloud-id
```

### Security Note
The `.env` file **must never be committed**. It is listed in `.gitignore`. The API token and email must never appear in committed code. This is enforced by `.gitignore` and by code review practice.

---

## Overall Approach Benefits

| Benefit | Detail |
|---|---|
| **Most complete STLC coverage** | 13 test cases covering all 8 core cases + 5 UI/accessibility assertions |
| **6-phase folder structure** | Entire STLC lifecycle is navigable by any team member |
| **JIRA integration via MCP** | One prompt creates a formatted JIRA ticket with links, steps, and severity |
| **Deepest POM implementation** | Locators, actions, assertions, and guard methods all in `LoginPage.ts` |
| **ID-based locators** | Resolved strict mode violations that affected simpler locator strategies |
| **Self-documenting failures** | `test.fixme()` for TC_LOGIN_003 preserves the finding without breaking CI |
| **Credential-safe CI** | Credential-dependent tests skip cleanly — CI is green without real VWO credentials |

## Overall Approach Limitations

| Limitation | Detail |
|---|---|
| **Most failures to fix** | 10 distinct CI failures — highest complexity maintenance surface |
| **JIRA not wired to CI** | JIRA ticket creation happens from Claude Desktop MCP, not from CI pipeline |
| **Config in non-standard location** | `--config=04_Test_Execution/playwright.config.ts` required on every run |
| **package-lock.json discipline** | Must be regenerated and committed after every dependency update |
| **TC_LOGIN_001 never runs in CI** | Valid login (P1 test) requires credentials not configured in CI |

## Key Fixes Summary — Chronological

| # | Failure | Root Cause | Fix Applied | Pattern |
|---|---|---|---|---|
| 1 | CI crash before tests | `package-lock.json` missing | `npm install --package-lock-only` | Generate lock file |
| 2 | TC_LOGIN_006 strict mode | Dual email inputs in DOM | `page.locator('#login-username')` | ID-based locators |
| 3 | TC_LOGIN_006 URL assertion | VWO navigates to `/#/forgot-password` | Removed `assertOnLoginPage()` | Remove wrong assertion |
| 4 | TC_LOGIN_002/004 error text | VWO's error text doesn't match regex | `getByText('Your email, password, IP')` | Correct text from observed UI |
| 5 | TC_LOGIN_003 inline validation | VWO has no client-side validation | `test.fixme(true, reason)` | Document known gap |
| 6 | Remember Me checkbox | Angular Material hides ARIA | `locator('input[type="checkbox"]').first()` | Direct DOM selector |
| 7 | Back button type | VWO renders as button or link | `.or()` combinator + `.first()` | Union locator |
| 8 | TC_LOGIN_001/005 credentials | VWO account required | `test.skip(!process.env.VWO_TEST_EMAIL)` | Credential-conditional skip |
| 9 | Node deprecation | Node 20 EOL | `node-version: "24"` | Infrastructure upgrade |
| 10 | Config path not found | Config in `04_Test_Execution/` subfolder | `--config=04_Test_Execution/playwright.config.ts` | Explicit config path |
