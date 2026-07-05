# CI Failure Analysis — STLC Standard CLI

## Approach Overview

| Field | Detail |
|---|---|
| **Approach** | 02 — Standard Playwright CLI with POM |
| **Folder** | `STLC_Standard_CLI/` |
| **CI Job** | `test-standard-cli` |
| **Runner** | `ubuntu-latest`, Node 24 |
| **Playwright Version** | 1.59.x |
| **Browser in CI** | Chromium only (`--project chromium`) |
| **Test File** | `tests/vwo_login.spec.ts` (6 test cases) |
| **Final CI Status** | ✅ Green |

### What Makes This Approach Unique
This is the **reference implementation** — the cleanest, most straightforward Playwright + POM structure in the portfolio. It directly translates the 6 test cases from `Block_A_Manual/03_Test_Cases.md` into TypeScript, with zero extras. All locators, actions, and assertions live in `pages/LoginPage.ts`. Tests are a clean read with no configuration complexity.

---

## CI Failure #1 — Default Assertion Timeout Too Short for VWO

| Field | Detail |
|---|---|
| **File** | `STLC_Standard_CLI/playwright.config.ts` |
| **Affects** | TC-02, TC-03, TC-04, TC-05, TC-06 |
| **Failure Type** | Assertion timeout |
| **Category** | Timeout calibration — VWO server-side validation |

### Error Message
```
Error: expect(received).toBeVisible()
  Locator: getByText('Your email, password, IP')
  Expected: visible
  Received: <element(s) not found>
  Call log:
    waiting for getByText('Your email, password, IP') to be visible
    5000ms elapsed
  at vwo_login.spec.ts:25
```

### Root Cause
Playwright's **default assertion timeout is 5000ms (5 seconds)**. When a test calls:

```typescript
await expect(loginPage.errorMessage).toBeVisible();
```

Playwright retries the assertion every 100ms for up to 5 seconds. If the element is not visible within that window, the test fails.

**VWO's validation is entirely server-side.** When the user clicks Sign In:
1. The browser sends credentials to VWO's server (HTTP POST)
2. VWO's backend validates the credentials against its database
3. VWO returns a response (error message or redirect)
4. The Angular SPA renders the response in the UI

This round-trip consistently takes **14-17 seconds** in headless CI on GitHub's Ubuntu runners. The reason:
- VWO's servers are geographically distributed; the GitHub Actions runner may be routed to a distant region
- Headless browser HTTP overhead without connection keep-alive optimization
- VWO's backend may apply rate limiting that adds additional delay for test traffic

With the 5s default, the error message is always waited for before VWO has finished processing — the test fails on every run.

### Why This Occurs
This failure occurs whenever:
- A test asserts on a UI element that appears only after a **server round-trip** (not a client-side DOM manipulation)
- The server response time exceeds Playwright's default 5s assertion timeout
- The application performs **no client-side intermediate state** (e.g., loading spinner) that Playwright could detect to know the request is in-flight

VWO shows no loading indicator between click and error message — the UI appears frozen for 14-17 seconds. Playwright cannot distinguish "waiting for server" from "element will never appear."

### In What Cases This Situation Arises
- Login forms that submit to slow backends (auth servers often have rate-limit delays)
- Any end-to-end test hitting a real third-party API (not a mock)
- Test environments where network latency is unpredictable (cloud CI runners with shared networking)
- Tests run against production or staging without local mocks

### How We Fixed It

```typescript
// playwright.config.ts
export default defineConfig({
  // VWO server-side credential validation takes 14-17 seconds.
  // Default 5s assertion timeout causes all negative-login tests to fail in CI.
  expect: {
    timeout: 25000,  // was: default 5000ms
  },
  use: {
    baseURL: 'https://app.vwo.com',
    actionTimeout: 25000,  // max per action (click, fill, etc.)
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

Setting `expect.timeout: 25000` raises the assertion retry window to 25 seconds — enough to cover VWO's 14-17s server response plus variance.

### Why We Chose 25 Seconds (Not 30, Not 60)
- **17s:** The observed maximum VWO server response time in CI
- **+8s buffer:** Covers network variance and occasional VWO slowness
- **= 25s:** Enough headroom without making tests run for a full minute on true timeouts
- The CI job `timeout-minutes: 20` caps the entire job — individual test timeouts feed into this budget

### Why Not Use `waitForResponse()` Instead
An alternative: intercept the VWO API response explicitly with `page.waitForResponse()` and only then assert the UI. This would be more precise but:
1. Requires knowing VWO's internal API endpoint URLs (they could change with any VWO release)
2. Creates tight coupling between the test and VWO's private API structure
3. More complexity for tests that are meant to demonstrate the simplest possible approach

`expect.timeout: 25000` is the simplest, most portable fix.

### Benefits of This Fix
- All 6 tests now wait adequately for VWO's server response
- Single config change affects all current and future tests in the project
- No per-test retry logic needed — the timeout window covers the worst case

### Limitations
- 25s timeout means a genuinely broken test (where VWO never returns an error) wastes 25 full seconds before failing
- If VWO's response time increases beyond 25s (server degradation, higher load), tests would fail intermittently

---

## CI Failure #2 — Node Version Deprecation

| Field | Detail |
|---|---|
| **File** | `.github/workflows/playwright.yml` — `test-standard-cli` job |
| **Category** | CI infrastructure |

### Error Message
```
Node.js 20 actions are deprecated. Please update the following actions
to use Node.js 24: actions/setup-node@v4
```

### Root Cause and Fix
Same as all other jobs — original `node-version: "20"` updated to `node-version: "24"`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "24"
    cache: "npm"
    cache-dependency-path: STLC_Standard_CLI/package-lock.json
```

---

## CI Failure #3 — Error Text Locator Mismatch

| Field | Detail |
|---|---|
| **File** | `pages/LoginPage.ts` |
| **Affects** | TC-02, TC-03, TC-04, TC-05, TC-06 |
| **Failure Type** | Element not found — wrong error text |
| **Category** | Application behaviour assumption |

### Error Message
```
Error: expect(received).toBeVisible()
  Locator: getByText(/invalid|incorrect|wrong/i)
  Expected: visible
  Received: <element(s) not found>
```

### Root Cause
The initial `LoginPage.ts` defined the error message locator as a regex matching common error phrases:

```typescript
// ORIGINAL (broken)
this.errorMessage = page.getByText(/invalid|incorrect|wrong/i);
```

This assumed VWO would display a generic error like "Invalid credentials" or "Incorrect password." VWO's actual error message is:

> **"Your email, password, IP address or account may be blocked."**

None of the words "invalid", "incorrect", or "wrong" appear in this message. The locator found zero elements, so `toBeVisible()` timed out after 25 seconds.

### Why This Occurs
VWO uses **privacy-respecting error messaging** — it does not tell the user whether the email address exists, whether the password was wrong, or whether the account is locked. This prevents user enumeration attacks (an attacker cannot distinguish "email not found" from "wrong password").

The error message is deliberately vague and generic. Any test that tries to match a specific word like "invalid" or "wrong" will fail because VWO intentionally avoids those specific words.

### In What Cases This Situation Arises
- Tests written based on assumptions about what an error message "should" say
- Tests written without first observing the actual UI error text in the target application
- Security-conscious applications that use generic error messages to prevent user enumeration

### How We Fixed It
```typescript
// pages/LoginPage.ts — FIXED
this.errorMessage = page.getByText('Your email, password, IP');
```

The string `'Your email, password, IP'` is the beginning of VWO's actual error message. `getByText()` in Playwright uses **partial matching by default** — it matches any element whose text content contains this substring. The full VWO message is:

> "Your email, password, IP address or account may be blocked."

Using the first 25 characters gives enough uniqueness without depending on the full string (which might be truncated on small screens or changed in future VWO releases).

### Why We Chose Partial Text Match
- **Full string:** `'Your email, password, IP address or account may be blocked.'` — too brittle, breaks if VWO changes punctuation or wording slightly
- **Regex:** `/your email.+blocked/i` — workable but harder to read at a glance
- **Partial:** `'Your email, password, IP'` — stable prefix, readable, and unique enough on the VWO login page

### Benefits
- Correctly locates VWO's actual error element on every test run
- Partial match is resilient to minor wording changes in the full error message

### Limitations
- If VWO ever changes the beginning of the error message (before "password, IP"), the locator breaks
- Does not distinguish between different types of errors — if VWO ever shows different messages for "account locked" vs "wrong password," this locator cannot differentiate

---

## CI Failure #4 — Multi-Browser Matrix in CI Causing Timeouts

| Field | Detail |
|---|---|
| **File** | `.github/workflows/playwright.yml` and `playwright.config.ts` |
| **Category** | CI scope — browser matrix reduction |

### What Happened
The initial CI step ran all 3 browser projects (chromium, firefox, webkit) in the `test-standard-cli` job. With 6 tests × 3 browsers × 25s maximum wait time per test = potential 450 seconds (7.5 minutes) for negative-path tests alone. The CI job `timeout-minutes: 20` was at risk of being hit.

Additionally, Firefox and WebKit require additional Playwright browser installs (`--with-deps firefox webkit`) which added 3-4 minutes of install time.

### Root Cause
The original config defined 3 browser projects without distinguishing CI vs local execution. CI is meant for fast feedback on the most common platform (Chromium), not full cross-browser validation.

### How We Fixed It
```yaml
# .github/workflows/playwright.yml
- name: Install Playwright browsers (chromium)
  run: npx playwright install --with-deps chromium

- name: Run tests — chromium only in CI
  run: npx playwright test --project chromium
```

```typescript
// playwright.config.ts — still defines all 3 for local runs
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
],
```

The config retains all 3 browser projects for local full-matrix runs, but CI is explicitly constrained to chromium via `--project chromium` in the workflow.

### Why We Chose This Fix
- Chromium covers the majority of real-world Chrome usage (70%+ global market share)
- Firefox and WebKit add disproportionate CI time for VWO login tests (locators are browser-independent — the same POM locators work across all browsers)
- Full cross-browser runs should happen in dedicated nightly or release pipelines, not on every push to main

### Benefits
- CI job completes in 2-4 minutes instead of 10+ minutes
- Install step only downloads one browser binary (~130MB for Chromium vs ~400MB+ for all three)
- Full browser matrix still available for local verification with `npx playwright test --project firefox`

### Limitations
- Cross-browser regressions not caught on every commit
- WebKit (Safari) rendering differences invisible in CI — the angular SPA may behave differently in Safari's rendering engine

---

## CI Failure #5 — `retries` Configuration Missing

| Field | Detail |
|---|---|
| **File** | `playwright.config.ts` |
| **Category** | Flakiness mitigation |

### What Happened
When tests ran for the first time without retry configuration, a network blip or transient VWO slowness would cause a test to fail that would have passed on a second attempt. The CI job marked the entire run as failed.

### Root Cause
VWO is a live third-party service. Its response times are not guaranteed. A single test run with no retries is vulnerable to:
- VWO rate limiting (treating rapid test traffic as suspicious)
- GitHub Actions network variability
- VWO backend maintenance windows

### How We Fixed It
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 1 : 0,  // Retry once in CI; never locally
  workers: process.env.CI ? 1 : undefined,  // Single worker in CI to prevent rate-limit hits
});
```

`retries: 1` in CI allows each failed test one retry before being marked as failed. `workers: 1` ensures tests run sequentially in CI (not in parallel), reducing the rate of requests to VWO and lowering the chance of rate-limit errors.

### Why `workers: 1` in CI
Running multiple tests in parallel sends multiple simultaneous login attempts to VWO. VWO's security systems may interpret this as a brute-force attack and temporarily block the CI runner's IP address — causing all tests to fail simultaneously.

Sequential execution (`workers: 1`) sends one request at a time. VWO processes each sequentially and does not trigger IP blocks.

### Benefits
- Transient network failures don't produce false red builds
- VWO rate-limit triggers significantly reduced by sequential execution

### Limitations
- `workers: 1` increases total CI time — 6 tests × ~20s each = ~120s vs ~40s for parallel execution
- `retries: 1` doubles the time of any genuinely failing test (runs twice before reporting red)

---

## Overall Approach Benefits

| Benefit | Detail |
|---|---|
| **Simplest codebase** | Clean POM + single spec file — easiest to read, review, and maintain |
| **Full POM pattern** | All locators centralized in `LoginPage.ts` — one file to update when VWO changes its DOM |
| **Direct STLC traceability** | TC-01 through TC-06 map directly to test cases in `Block_A_Manual/03_Test_Cases.md` |
| **No hidden complexity** | No AI generation, no MCP, no dual configs — pure Playwright standard practice |
| **Correct VWO error text** | `getByText('Your email, password, IP')` targets the actual error message — reliable |
| **Appropriate timeouts** | 25s expect timeout covers VWO's 14-17s server round-trip with headroom |

## Overall Approach Limitations

| Limitation | Detail |
|---|---|
| **Fewer test cases than MCP project** | 6 test cases vs 13 in STLC_MCP_Project — no Forgot Password, Remember Me, OAuth in this suite |
| **No credential-dependent tests** | No valid login test — cannot verify the complete happy path |
| **Chromium-only CI** | Firefox and WebKit regressions go undetected on every push |
| **`getByRole` email locator** | `page.getByRole('textbox', { name: 'Email address' })` would fail if Forgot Password form were triggered in this suite — the same strict mode issue fixed in MCP would recur here |
| **Single spec file** | All 6 tests in one file — does not scale well beyond ~15 tests |

## Key Fixes Summary

| Failure | Root Cause | Fix Applied | Pattern |
|---|---|---|---|
| Assertion timeout | VWO 14-17s server validation vs 5s default timeout | `expect.timeout: 25000`, `actionTimeout: 25000` | Config calibration |
| Node deprecation | Node 20 EOL | `node-version: "24"` | Infrastructure upgrade |
| Error text mismatch | Wrong assumption about VWO's error message | `getByText('Your email, password, IP')` | Correct locator from observed UI |
| Multi-browser CI timeout | 3 browsers × 25s tests exhausted job limit | `--project chromium` in CI only | Scope reduction |
| Flaky tests | VWO rate-limit + network variance | `retries: 1`, `workers: 1` in CI | Resilience config |
