# Concepts & Topics — Playwright CLI (UI + API)

> One file = complete understanding of every concept used in this approach.
> Format per topic: What it is → Where in repo → Why used → Alternatives.

---

## Approach Summary

This project demonstrates **two types of testing in one Playwright project**: browser-based UI testing (VWO login page) and HTTP API testing (reqres.in REST API). A **dual project configuration** separates concerns — the UI project runs headed Chrome, the API project runs with no browser at all.

**Repo structure:**
```
Playwright_CLI/
  playwright.config.ts       ← Dual project config (ui + api)
  pages/
    LoginPage.ts             ← Page Object Model for VWO
  data/
    testData.ts              ← Test data (emails, passwords)
  tests/
    ui/
      vwo_login.spec.ts      ← 10 UI tests
    api/
      users.spec.ts          ← GET /users endpoint tests
      auth.spec.ts           ← Login + register endpoint tests
      bug_kan2.spec.ts       ← KAN-28 known bug documentation
```

---

## 1. POM — Page Object Model

**What it is:** A design pattern where all locators and actions for a specific page are encapsulated in a single class (`LoginPage.ts`). Test files use the class — they don't write locators directly.

**Where in repo:** `Playwright_CLI/pages/LoginPage.ts`

**Structure:**
```typescript
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;    // ← locator defined once
  readonly loginButton: Locator;

  constructor(page: Page) {        // ← locators built in constructor
    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.loginButton = page.getByRole('button', { name: 'Sign in', exact: true });
  }

  async login(email: string, password: string): Promise<void> { // ← action method
    await this.emailInput.fill(email);
    await this.loginButton.click();
  }
}
```

**How tests use the POM:**
```typescript
// tests/ui/vwo_login.spec.ts:9
loginPage = new LoginPage(page);
await loginPage.login(uiData.invalidEmail, uiData.invalidPassword);
```

**Why used:** Without POM, every test file has its own `page.getByRole(...)` calls. When VWO changes the email field's accessible name, you update 10 test files. With POM, you update one line in `LoginPage.ts`.

**Benefits of POM:**
- Single source of truth for locators
- Tests read as user actions ("loginPage.login(email, pass)"), not DOM queries
- Action methods encapsulate waiting logic (e.g., `Promise.race` after click)

**Alternatives:**
- **No POM (direct locators in tests)** — faster to write, harder to maintain at scale
- **Fixture pattern** — Playwright's `test.extend()` injects page objects as fixtures
- **Screenplay pattern** — actor-centric (used in Serenity/JS) — more complex than POM

---

## 2. TypeScript — Class with `readonly` Properties

**What it is:** TypeScript classes group related data and methods. `readonly` marks a property that can only be assigned in the constructor — it cannot be reassigned later.

**Where in repo:**
```typescript
// pages/LoginPage.ts:3
export class LoginPage {
  readonly page: Page;        // ← cannot be reassigned after constructor
  readonly emailInput: Locator;
  readonly loginButton: Locator;
```

**Why `readonly` for locators:** A `Locator` is a reusable reference to a DOM element — it should never be reassigned mid-test. `readonly` makes this intent explicit and TypeScript will throw a compile error if you accidentally write `this.emailInput = something` outside the constructor.

**`export class` vs regular class:**
- `export class LoginPage` — makes the class available for import in other files
- Without `export` — the class only exists in the current file

**Alternatives:** `private` properties (hidden from outside the class, accessed only via methods), `protected` (accessible in subclasses), `public` (default — accessible everywhere).

---

## 3. TypeScript — Type Annotations

**What it is:** TypeScript adds static types to JavaScript. Type annotations tell TypeScript (and your IDE) what kind of value a variable, parameter, or return value holds.

**Where in repo:**
```typescript
// pages/LoginPage.ts — type annotations on properties
readonly page: Page;           // type: Playwright Page object
readonly emailInput: Locator;  // type: Playwright Locator object
readonly errorMessage: Locator;

// type annotations on method parameters and return types
async login(email: string, password: string): Promise<void>
//                ↑string      ↑string         ↑return type

async getErrorMessage(): Promise<string | null>
//                              ↑can return string OR null
```

**`Promise<void>` explained:**
- `Promise` — this function is asynchronous (returns a Promise)
- `<void>` — when the Promise resolves, it gives no value (the function doesn't return anything useful)
- `Promise<string | null>` — the Promise resolves to either a string or null

**Why used:** TypeScript catches bugs at compile time. If you call `loginPage.login(123, true)`, TypeScript says "error: argument of type 'number' is not assignable to parameter of type 'string'" — before the test even runs.

**`string | null` — union type:**
```typescript
async getErrorMessage(): Promise<string | null> {
  return this.errorMessage.textContent(); // textContent() can return null if element not found
}
```

**Alternatives:** Plain JavaScript (no types — no compile-time safety). JSDoc comments (adds type hints to JS without compilation step — less strict).

---

## 4. Arrow Functions vs Regular Functions

**What it is:** Two syntaxes for defining functions in JavaScript/TypeScript.

**Where in repo:**
```typescript
// Regular async function (used for class methods)
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
}

// Arrow function (used in callbacks and inline functions)
// tests/ui/vwo_login.spec.ts:13
test('TC-UI-01', async ({ page }) => {   // ← arrow function
  await expect(loginPage.emailInput).toBeVisible();
});
```

**Key difference — `this` binding:**
- Regular functions: `this` depends on how the function is called
- Arrow functions: `this` is inherited from the surrounding scope (lexical binding)

**In Playwright tests, arrow functions are used because:**
```typescript
test('TC-UI-01', async ({ page }) => {
  // 'this' is not used in Playwright test functions
  // Arrow functions are the convention in Playwright docs
});
```

**In class methods, regular async functions are used because:**
```typescript
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  // 'this' refers to the LoginPage instance — needs regular function
}
```

---

## 5. `async/await` and Promises

**What it is:** JavaScript's model for asynchronous operations. A `Promise` is a placeholder for a future value. `await` pauses execution until the Promise resolves.

**Where in repo — advanced pattern (Promise.race):**
```typescript
// pages/LoginPage.ts:32
await Promise.race([
  this.page.waitForNavigation().catch(() => {}),
  this.page.waitForLoadState('networkidle').catch(() => {}),
  this.page.waitForTimeout(5000)
]);
```

**`Promise.race()` explained:**
- Accepts an array of Promises
- Resolves as soon as the FIRST Promise in the array resolves (whichever is fastest)
- Used here because after clicking login, one of three things happens first:
  1. A navigation occurs (successful login → dashboard)
  2. Network becomes idle (error message appears)
  3. 5 seconds pass (VWO doesn't respond in time)

**`.catch(() => {})` explained:**
- `waitForNavigation()` throws if no navigation happens (e.g., VWO shows error without navigating)
- `.catch(() => {})` silently swallows the error, allowing `Promise.race` to wait for the next Promise

**Alternatives:**
```typescript
await page.waitForLoadState('networkidle', { timeout: 20000 }); // simpler — wait for one thing
```
`Promise.race` is used here because the test doesn't know whether VWO will navigate (success) or stay (error) — it handles both outcomes.

---

## 6. Import / Export — ES Modules

**What it is:** TypeScript/JavaScript's system for sharing code between files. `export` makes something available for import. `import` brings it into another file.

**Where in repo:**
```typescript
// pages/LoginPage.ts:1
import { Page, Locator } from '@playwright/test';  // import from npm package
export class LoginPage { ... }                       // export from this file

// tests/ui/vwo_login.spec.ts:3
import { LoginPage } from '../../pages/LoginPage';  // relative import
import { uiData } from '../../data/testData';       // data import
```

**Named export vs default export:**
```typescript
// Named export — import with exact name in braces
export class LoginPage { ... }
import { LoginPage } from './LoginPage';

// Default export — import with any name, no braces
export default class LoginPage { ... }
import LP from './LoginPage';
```

This repo uses named exports (`export class LoginPage`) because named exports are more explicit — you know exactly what you're importing.

---

## 7. `request` Fixture — Playwright API Testing

**What it is:** Playwright's built-in HTTP client for making API requests. Injected as a fixture parameter in API tests (no browser needed).

**Where in repo:**
```typescript
// tests/api/bug_kan2.spec.ts:28
test('KAN-28...', async ({ request }) => {
//                          ↑ Playwright injects this fixture
  const response = await request.post('/api/register', {
    data: { email: 'eve.holt@reqres.in', password: 'pistol' }
  });
  expect(response.status()).toBe(201);
});
```

**`request` methods:**
```typescript
await request.get('/api/users');           // GET request
await request.post('/api/register', {      // POST with JSON body
  data: { key: 'value' }
});
await request.put('/api/users/2', { data: {...} });   // PUT
await request.delete('/api/users/2');                  // DELETE
await request.patch('/api/users/2', { data: {...} });  // PATCH
```

**How the request fixture is configured:**
```typescript
// playwright.config.ts:24
{
  name: 'api',
  testDir: './tests/api',
  use: {
    baseURL: 'https://reqres.in',           // API base URL
    extraHTTPHeaders: {
      'x-api-key': process.env.REQRES_API_KEY ?? '', // auth header
      'Content-Type': 'application/json',
    },
  },
}
```

`extraHTTPHeaders` are sent with EVERY request in the API project — no need to repeat headers in each test.

**Alternatives:** `axios`, `node-fetch`, or `supertest` (popular in Jest). Playwright's `request` fixture is preferred here because it's built in, uses the same config as browser tests, and supports response assertions natively.

---

## 8. API Response Assertions

**What it is:** Asserting on HTTP response properties — status code, response body, headers.

**Where in repo:**
```typescript
// tests/api/bug_kan2.spec.ts:43
const response = await request.post('/api/register', { data: {...} });
const body = await response.json();        // parse JSON body

expect(response.status()).toBe(200);       // check HTTP status code
expect(body.token).toBeDefined();          // check field exists
expect(body.id).toBeDefined();             // check field exists
```

**Response methods:**
```typescript
response.status()             // HTTP status code (200, 201, 404, etc.)
response.statusText()         // "OK", "Created", "Not Found"
response.ok()                 // true if status is 200-299
await response.json()         // parse body as JSON object
await response.text()         // parse body as string
response.headers()            // response headers object
```

**Why used:** API tests verify the contract between frontend and backend. The KAN-28 bug (returns 200 instead of 201) was found by asserting `expect(response.status()).toBe(201)` — which revealed reqres.in returns 200 for resource creation.

---

## 9. `test.fail(condition, reason)` — Known Bug Pattern

**What it is:** Marks a test as an "expected failure." The test PASSES in CI when its assertion fails (confirming the bug still exists), and FAILS in CI when its assertion unexpectedly passes (signaling the bug was fixed and the test needs updating).

**Where in repo:**
```typescript
// tests/api/bug_kan2.spec.ts:38
test.fail(true, 'KAN-28: /api/register returns 200 instead of 201 — known bug, open in JIRA');

expect(response.status()).toBe(201); // Actual: 200 — fails intentionally
// test.fail() inverts: this "failure" makes the test PASS
```

**Logic inversion table:**
| Assertion result | Without test.fail() | With test.fail() |
|---|---|---|
| Passes (201 returned) | Test PASSES | Test FAILS (unexpected — bug was fixed) |
| Fails (200 returned) | Test FAILS | Test PASSES (expected — bug still present) |

**Why used over `test.skip()`:**
| Pattern | What happens | When to use |
|---|---|---|
| `test.skip()` | Test is invisible to CI | Feature temporarily unavailable |
| `test.fail()` | CI stays green, bug documented, breaks if fixed | Known open bug that's tracked |
| `test.fixme()` | Test skips, marked as needs-fix | Missing feature (gap) |

**JIRA traceability in this test:**
The test comment includes the JIRA URL: `somasaicheviti-1780804851917.atlassian.net/browse/KAN-28`. Any engineer reading the test failure knows exactly which JIRA ticket to reference.

---

## 10. Dual Project Config (`ui` + `api`)

**What it is:** A single `playwright.config.ts` defining two completely separate test projects — each with its own `testDir`, `baseURL`, and settings. Projects run independently.

**Where in repo:**
```typescript
// playwright.config.ts:13
projects: [
  {
    name: 'ui',
    testDir: './tests/ui',         // only tests in this folder
    use: {
      ...devices['Desktop Chrome'], // runs with a real browser
      baseURL: 'https://app.vwo.com',
    },
  },
  {
    name: 'api',
    testDir: './tests/api',        // only tests in this folder
    use: {
      baseURL: 'https://reqres.in', // no browser — pure HTTP
      extraHTTPHeaders: {
        'x-api-key': process.env.REQRES_API_KEY ?? '',
      },
    },
  },
],
```

**Running projects:**
```bash
npx playwright test --project ui    # run only UI tests
npx playwright test --project api   # run only API tests
npx playwright test                 # run both
```

**Why two separate steps in CI:**
```yaml
# .github/workflows/playwright.yml
- name: Run UI tests
  run: npx playwright test --project ui

- name: Run API tests
  run: npx playwright test --project api
  env:
    REQRES_API_KEY: ${{ secrets.REQRES_API_KEY }}
```

Separate CI steps give independent pass/fail signals. A missing API key secret doesn't hide UI test results.

---

## 11. `dotenv` — Environment Variable Loading

**What it is:** A Node.js library that reads a `.env` file from the project root and loads its key=value pairs into `process.env`.

**Where in repo:**
```typescript
// playwright.config.ts:1
import dotenv from 'dotenv';
dotenv.config(); // reads .env file → populates process.env
```

**`.env` file (never committed — gitignored):**
```
REQRES_API_KEY=your-key-here
```

**How it flows:**
1. Local development: `dotenv.config()` reads `.env` → `process.env.REQRES_API_KEY` = "your-key"
2. CI (GitHub Actions): no `.env` file → `dotenv.config()` no-ops silently → `process.env.REQRES_API_KEY` comes from the GitHub Secret

**`?? ''` — Nullish coalescing operator:**
```typescript
'x-api-key': process.env.REQRES_API_KEY ?? '',
// If REQRES_API_KEY is undefined → use empty string ''
// (prevents TypeError from undefined in headers object)
```

**Why `.env` is gitignored:**
```
# .gitignore
.env          ← never committed — contains secrets
.env.local
```

`.env.example` IS committed — it's a template showing which variables are needed without the actual values.

**Alternatives:** 
- GitHub Actions `secrets` directly in env block (no dotenv needed)
- `cross-env` package — set environment variables inline in npm scripts
- OS-level environment variables (set in system profile)

---

## 12. `isErrorVisible()` — Custom Boolean Method

**What it is:** A POM method that returns `true` or `false` indicating whether an error state is present, rather than throwing an assertion.

**Where in repo:**
```typescript
// pages/LoginPage.ts:71
async isErrorVisible(): Promise<boolean> {
  const url = this.page.url();
  if (!url.includes('login')) return false; // navigated away = successful login

  const errorElements = await this.page.locator('[role="alert"], .error, .alert').all();
  for (const element of errorElements) {
    if (await element.isVisible()) return true;
  }
  return this.errorMessage.isVisible().catch(() => false);
}
```

**Why return `boolean` instead of using `expect().toBeVisible()`:**
- `expect().toBeVisible()` throws an error if the element is not found — fails the test
- `isErrorVisible()` returns false gracefully — lets the test decide what to do with the result

**Used in test:**
```typescript
// tests/ui/vwo_login.spec.ts:33
const isError = await loginPage.isErrorVisible();
expect(isError).toBe(true);
```

**`locator.all()` explained:**
```typescript
const errorElements = await this.page.locator('[role="alert"], .error, .alert').all();
// .all() returns an array of all matched elements — does NOT throw if empty
// Standard locator with toBeVisible() throws if 0 elements found
```

**Alternatives:**
```typescript
await expect(locator).toBeVisible();      // throws on failure — test fails
const count = await locator.count();       // returns number of matching elements
const isVisible = await locator.isVisible(); // true/false without throwing
```

---

## 13. `locator.all()` — Iterating Multiple Elements

**What it is:** Returns a Promise that resolves to an array of all elements matching the locator. Unlike `.count()` which gives a number, `.all()` gives you actual element handles you can interact with.

**Where in repo:**
```typescript
// pages/LoginPage.ts:62
const errorElements = await this.page.locator('[role="alert"], .error, .alert').all();
for (const element of errorElements) {
  const text = await element.textContent();
  if (text && text.trim()) return text;
}
```

**CSS selector list `,`:**
- `'[role="alert"], .error, .alert'` — matches ANY element that has `role="alert"` OR class `error` OR class `alert`
- The comma `,` is a CSS selector list (OR) — equivalent to three separate locators combined

**Why used:** VWO may show errors in different DOM structures depending on the error type. Checking all three selectors provides a fallback chain.

---

## 14. `test.skip(!condition)` — Secret-Conditional Skip

**What it is:** Skips all tests in a `describe` block when a condition is true — used here to skip when a required secret (API key) is absent.

**Where in repo:**
```typescript
// tests/api/bug_kan2.spec.ts:26
test.describe('Bug Report — KAN-28', () => {
  test.skip(!process.env.REQRES_API_KEY, 'Set REQRES_API_KEY secret to run API tests');
  // All tests inside skip when REQRES_API_KEY is not set
});
```

**Note:** `test.skip()` inside a `describe` block (not inside a `test()`) skips ALL tests in that block.

---

## 15. SQL Injection Test — Security Edge Case

**What it is:** A test that submits a SQL injection payload (`' OR 1=1--`) as the email to verify the application doesn't crash or grant unauthorized access.

**Where in repo:**
```typescript
// tests/ui/vwo_login.spec.ts:63
test('TC-UI-07: SQL injection string in email field — no crash, error shown', async ({ page }) => {
  const sqlInjection = "' OR 1=1--";
  await loginPage.login(sqlInjection, uiData.invalidPassword);
  await expect(loginPage.emailInput).toBeVisible(); // page still functional
  expect(page.url()).toContain('login');             // still on login page
});
```

**Why used:** SQL injection is one of the OWASP Top 10 vulnerabilities. This test verifies that:
1. The app doesn't crash (server handles the input gracefully)
2. The user isn't accidentally authenticated (URL still contains "login")
3. The page is still functional (email input visible after submission)

**VWO's handling:** VWO sends all inputs server-side. The backend sanitizes SQL injection payloads and returns a standard authentication error.

---

## Quick Reference — All Concepts at a Glance

| Concept | File | Purpose |
|---|---|---|
| POM | `pages/LoginPage.ts` | Centralized locators + actions |
| `readonly` class properties | `pages/LoginPage.ts:4` | Immutable Playwright locators |
| Type annotations | `pages/LoginPage.ts` | TypeScript safety |
| Arrow functions | All spec files | Playwright test + callback syntax |
| `async/await` + Promises | All files | Async test execution |
| `Promise.race()` | `pages/LoginPage.ts:32` | Handle multiple possible outcomes |
| Import/export | All files | Share code between files |
| `request` fixture | `tests/api/` all files | HTTP API testing (no browser) |
| API response assertions | `tests/api/` all files | Status code + body validation |
| `test.fail()` | `tests/api/bug_kan2.spec.ts:38` | Known bug documentation |
| Dual project config | `playwright.config.ts:13` | Separate UI and API test runs |
| `dotenv` | `playwright.config.ts:1` | Load `.env` for local secrets |
| `?? ''` nullish coalescing | `playwright.config.ts:31` | Safe env var fallback |
| `isErrorVisible()` boolean | `pages/LoginPage.ts:71` | Non-throwing error check |
| `locator.all()` | `pages/LoginPage.ts:62` | Iterate multiple elements |
| `test.skip(!secret)` | `tests/api/bug_kan2.spec.ts:26` | Skip when secret absent |
| SQL injection test | `tests/ui/vwo_login.spec.ts:63` | Security edge case |
| `extraHTTPHeaders` | `playwright.config.ts:29` | API authentication headers |
