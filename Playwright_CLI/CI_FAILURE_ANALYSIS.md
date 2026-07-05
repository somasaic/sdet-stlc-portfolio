# CI Failure Analysis — Playwright CLI (UI + API)

## Approach Overview

| Field | Detail |
|---|---|
| **Approach** | 03 — Playwright CLI with UI and API Testing |
| **Folder** | `Playwright_CLI/` |
| **CI Job** | `test-cli` |
| **Runner** | `ubuntu-latest`, Node 24 |
| **Playwright Version** | 1.59.x |
| **Browser in CI** | Chromium only (UI project) |
| **Test Projects** | `ui` (VWO login) + `api` (reqres.in) |
| **Final CI Status** | ✅ Green |

### What Makes This Approach Unique
This is the only project in the portfolio that combines **browser-based UI testing** with **HTTP API testing** in a single Playwright configuration. The dual-project config defines two completely separate test runners within one `playwright.config.ts`:
- `ui` project: headful-compatible Chrome against `https://app.vwo.com`
- `api` project: no browser, raw HTTP requests against `https://reqres.in`

---

## CI Failure #1 — Node Version Deprecation

| Field | Detail |
|---|---|
| **File** | `.github/workflows/playwright.yml` |
| **Step** | `actions/setup-node@v4` — `test-cli` job |
| **Failure Type** | CI infrastructure deprecation warning |
| **Category** | Node.js version lifecycle |

### Error Message
```
Node.js 20 actions are deprecated. Please update the following actions
to use Node.js 24: actions/setup-node@v4
```

### Root Cause
The initial workflow specified `node-version: "20"` for all jobs. GitHub Actions began emitting this deprecation notice as Node 20 moved toward end-of-life. While this was a warning and not an immediate hard failure, the correct professional response is to stay ahead of the deprecation curve.

### How We Fixed It
```yaml
# .github/workflows/playwright.yml — test-cli job
- uses: actions/setup-node@v4
  with:
    node-version: "24"
    cache: "npm"
    cache-dependency-path: Playwright_CLI/package-lock.json
```

### Why We Chose This Fix
Node 24 is the current Active LTS release. Pinning to a specific LTS version (rather than `lts/*`) gives reproducible builds — the CI environment does not change unexpectedly if GitHub shifts its `lts/*` alias.

### Benefits
- Removes deprecation noise from CI logs
- Node 24 resolves several npm caching edge cases that caused occasional `npm ci` slowness on Node 20

### Limitations
- Must re-verify that all `package.json` dependencies are Node 24 compatible. Breaking changes in transitive dependencies would surface during `npm ci`.

---

## CI Failure #2 — Dual Project Config: Test Isolation in CI

| Field | Detail |
|---|---|
| **File** | `.github/workflows/playwright.yml` — `test-cli` job |
| **Category** | CI design — test project separation |

### What Happened
The initial CI step ran `npx playwright test` without specifying a project. This caused the `ui` project and `api` project to run together in a single step. Two problems emerged:

1. **API tests failing blocked UI test results** — when the `api` project failed (because `REQRES_API_KEY` was not configured as a secret), the entire step failed, obscuring whether the UI tests had passed.

2. **Mixed HTML report** — the Playwright HTML report combined UI and API test results, making it difficult to understand which category of tests was failing.

### Root Cause
`npx playwright test` without `--project` runs ALL defined projects. The two projects have fundamentally different concerns:
- UI tests can fail because of VWO DOM changes
- API tests can fail because of missing secrets or reqres.in API behaviour changes

Mixing them in one step means a missing API key secret would show as a test failure in the same column as a legitimate Playwright assertion failure.

### How We Fixed It
```yaml
# .github/workflows/playwright.yml — test-cli job
- name: Run UI tests
  run: npx playwright test --project ui
  env:
    CI: true

- name: Run API tests (self-skip when REQRES_API_KEY is absent)
  run: npx playwright test --project api
  env:
    CI: true
    REQRES_API_KEY: ${{ secrets.REQRES_API_KEY }}
```

Two separate named steps, each targeting one project. The API step passes `REQRES_API_KEY` from GitHub Secrets. If the secret is not configured, the test inside self-skips.

### Why We Chose This Fix
Separating steps provides:
1. **Independent pass/fail signals** — GitHub Actions shows each step's status separately. A red API step does not hide a green UI step.
2. **Cleaner HTML report** — UI and API results are isolated in their respective report sections.
3. **Secret scoping** — `REQRES_API_KEY` is only passed to the step that needs it. The UI step runs without it.

### Benefits
- Precise failure attribution — clear whether UI or API is failing
- Self-documenting CI — the step names explain exactly what each runs
- Secret not exposed to the UI test step (least-privilege principle)

### Limitations
- Two separate steps add ~30s of overhead per CI run (Playwright startup cost per step)
- If a future test in `ui` accidentally calls the API (cross-concern coupling), the UI step would fail with a network error rather than an API test failure

---

## CI Failure #3 — API Tests: Known Bug Pattern with `test.fail()`

| Field | Detail |
|---|---|
| **File** | `tests/api/bug_kan2.spec.ts` |
| **Test** | `KAN-28: POST /api/register returns 200 instead of 201` |
| **Category** | Intentional failure documentation — `test.fail()` pattern |

### What the Problem Was
When the API test was first written, it asserted:
```typescript
expect(response.status()).toBe(201); // Expected: 201 Created
// Actual: 200 OK
```

This assertion **always fails** because reqres.in's `POST /api/register` endpoint returns HTTP 200 instead of the RESTful convention of HTTP 201 Created. This is a real bug (documented as KAN-28 in JIRA).

Without the `test.fail()` pattern, this would cause a permanent red CI job — a known, accepted bug would permanently break the build.

### Root Cause
The reqres.in API returns 200 OK for resource creation endpoints. Per REST conventions (RFC 7231), `POST` that creates a new resource should return `201 Created`. This is a known deviation in the reqres.in mock API — it prioritizes simplicity over strict REST compliance.

### Why This Occurs
In real project environments, teams encounter two categories of failing tests:
1. **Genuine failures** — bugs to fix before shipping
2. **Known open defects** — bugs that are tracked, accepted, and waiting for a fix

If both categories cause a red CI build, the team loses the ability to distinguish "this just broke" from "this is already known." CI becomes noise.

### How We Fixed It — `test.fail()` Pattern

```typescript
// tests/api/bug_kan2.spec.ts
test('KAN-28: POST /api/register returns 200 instead of expected 201 — BUG', async ({ request }) => {
  // test.fail() marks this as an EXPECTED failure.
  // CI passes when the assertion fails (bug still present).
  // CI fails when the assertion unexpectedly passes (bug was fixed without updating this test).
  test.fail(true, 'KAN-28: /api/register returns 200 instead of 201 — known bug, open in JIRA');

  const response = await request.post('/api/register', {
    data: { email: 'eve.holt@reqres.in', password: 'pistol' }
  });

  expect(response.status()).toBe(201); // Actual: 200 — this assertion "fails" intentionally
});
```

`test.fail()` inverts the pass/fail logic:
- If the assertion inside fails → **test PASSES** (expected outcome — bug still present)
- If the assertion inside passes → **test FAILS** (unexpected — bug was silently fixed, test needs updating)

A companion test documents the actual behaviour:
```typescript
test('KAN-28: Confirm actual behaviour — POST /api/register returns 200', async ({ request }) => {
  // This PASSES — documents what reqres.in actually does
  expect(response.status()).toBe(200);
  expect(body.token).toBeDefined();
});
```

### Why We Chose This Fix
`test.fail()` is Playwright's canonical pattern for documenting known bugs without breaking the build. The alternatives:

| Alternative | Problem |
|---|---|
| Remove the test | Deletes the bug documentation — no automated reminder when the bug is fixed |
| `test.skip()` | Skips the test entirely — CI gives no signal about the bug at all |
| Comment out the assertion | Not machine-readable — future engineers won't know this is a known failure |
| `test.fail()` | Correct — CI stays green, bug is documented, and CI breaks the moment the bug is fixed (forcing test update) |

### Benefits
- CI stays green while the known bug remains open
- The bug is documented in executable code — any engineer running the suite sees it
- When reqres.in fixes the bug, CI will break immediately, prompting the team to update the test
- KAN-28 JIRA link in the test comment creates traceability

### Limitations
- A developer who doesn't understand `test.fail()` semantics may think the test is "broken" and remove it
- If reqres.in changes the endpoint behaviour again in a new way, both the bug test and the companion test would need updating

---

## CI Failure #4 — API Tests Self-Skip Without Secret

| Field | Detail |
|---|---|
| **File** | `tests/api/bug_kan2.spec.ts` |
| **Category** | Secret-conditional execution |

### What Happened
When `REQRES_API_KEY` was not configured as a GitHub Secret, the API tests ran against reqres.in without a key. reqres.in began requiring API keys for all requests after a policy change. Requests without a key returned `401 Unauthorized`, causing all API tests to fail.

### Root Cause
reqres.in changed from a public open API to a key-authenticated API. Tests written before this change assumed unauthenticated access was always available.

### How We Fixed It
```typescript
// tests/api/bug_kan2.spec.ts
test.describe('Bug Report — KAN-28', () => {
  // Self-skip when REQRES_API_KEY is not configured
  test.skip(!process.env.REQRES_API_KEY, 'Set REQRES_API_KEY secret to run API tests');

  test('...', async ({ request }) => {
    // Tests only run when the key is available
  });
});
```

And in `playwright.config.ts`:
```typescript
projects: [
  {
    name: 'api',
    testDir: './tests/api',
    use: {
      baseURL: 'https://reqres.in',
      extraHTTPHeaders: {
        'x-api-key': process.env.REQRES_API_KEY ?? '',
      },
    },
  },
],
```

The `?? ''` fallback means an empty string is passed when the env var is absent — the `test.skip` then catches this and skips before any request is made.

### Why We Chose This Fix
The `test.skip(!process.env.REQRES_API_KEY)` pattern mirrors how credentials-dependent tests are handled throughout this portfolio. The same pattern is used in the MCP project for VWO login credentials. It:
1. Avoids hard-coding credentials
2. Makes CI green without the secret (tests skip cleanly)
3. Becomes fully active when the secret is configured

### Benefits
- CI passes with or without the API key secret configured
- Engineers onboarding to the project see a clear message ("Set REQRES_API_KEY secret") rather than a cryptic 401 error

### Limitations
- All API tests skip in CI unless the secret is explicitly set — the bulk of the API test coverage only runs locally or when the secret is added to the repository

---

## CI Failure #5 — `dotenv` Configuration for API Key

| Field | Detail |
|---|---|
| **File** | `Playwright_CLI/playwright.config.ts` |
| **Category** | Environment variable loading |

### Root Cause
The `playwright.config.ts` imports `dotenv` to load local `.env` files:

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

In CI, there is no `.env` file (it is gitignored). `dotenv.config()` silently no-ops when the file doesn't exist — it does not throw an error. The `REQRES_API_KEY` then comes from the GitHub Actions `env:` block instead.

This worked correctly but required verifying that `dotenv` was in `package.json` dependencies (not just `devDependencies`) so it would install during `npm ci`.

### How We Fixed It
Verified `dotenv` is listed in `dependencies` in `package.json`:
```json
{
  "dependencies": {
    "dotenv": "^16.x"
  }
}
```

`npm ci` in the CI job then installs `dotenv` correctly, and `dotenv.config()` no-ops silently when no `.env` file exists.

### Benefits
- Same `playwright.config.ts` works identically locally (reads `.env`) and in CI (reads from environment variables)
- No conditional logic needed in the config — `dotenv.config()` handles the missing-file case gracefully

---

## Overall Approach Benefits

| Benefit | Detail |
|---|---|
| **Dual test type coverage** | Both UI (browser) and API (HTTP) in one project — reflects real team test structures |
| **Independent project configs** | `ui` and `api` projects are completely isolated — different base URLs, different timeout settings |
| **Bug documentation in code** | `test.fail()` for KAN-28 makes the known bug visible, trackable, and self-alerting when fixed |
| **Self-skipping tests** | No credentials required for CI to pass — tests advertise their requirements via skip messages |
| **Fast API tests** | API tests run without a browser — execute in ~2-3 seconds versus 30+ seconds for UI tests |

## Overall Approach Limitations

| Limitation | Detail |
|---|---|
| **TC-UI-02 tautological assertion** | `expect(isStillOnLoginPage \|\| !isStillOnLoginPage).toBe(true)` always passes — no real assertion |
| **UI timeout config missing** | `playwright.config.ts` for UI project has no explicit `expect.timeout` — tests relying on VWO's 14-17s response may be timing-dependent |
| **API coverage depends on secret** | All API tests skip in CI by default — API test coverage is invisible in CI without the secret |
| **reqres.in dependency** | API tests depend on a third-party mock API that can change authentication requirements, endpoint behaviour, or availability |
| **No cross-layer tests** | UI and API are tested independently — no test verifies that a UI action results in the correct API call |

## Key Fixes Summary

| Failure | Fix | Pattern |
|---|---|---|
| Node deprecation | `node-version: "24"` | Infrastructure upgrade |
| Mixed project execution | `--project ui` and `--project api` as separate steps | Step isolation |
| Known bug breaking CI | `test.fail(true, 'KAN-28...')` | Intentional failure documentation |
| API tests failing without secret | `test.skip(!process.env.REQRES_API_KEY)` | Secret-conditional execution |
| dotenv in CI | Verified `dotenv` in `dependencies` | Dependency management |
