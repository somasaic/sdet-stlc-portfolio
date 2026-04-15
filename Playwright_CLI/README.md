# SDET Portfolio — Playwright CLI Project

**Week 2 | VWO Login UI + ReqRes API | Playwright + TypeScript**

> Part of the SDET Portfolio by Soma Sai Dinesh Cheviti
> GitHub: [github.com/somasaic/sdet-stlc-portfolio](https://github.com/somasaic/sdet-stlc-portfolio)

---

## Quick Results

| Suite                | Tests     | Result             | Time     |
| -------------------- | --------- | ------------------ | -------- |
| API — Auth Endpoints | 5/5       | ✅ Passing         | ~1s      |
| API — User Resources | 5/5       | ✅ Passing         | ~3s      |
| UI — VWO Login       | 10/10     | ✅ Passing         | ~54s     |
| **Total**            | **20/20** | **✅ All passing** | **~58s** |

> The 14× speed gap between API (3.9s) and UI (53.9s) is intentional and documented. It demonstrates why product companies push coverage to the API layer.

---

## 1. What This Project Demonstrates

This is Week 2 of a structured SDET portfolio covering the full STLC across four progressively advanced approaches. Week 2 extends Week 1 with API testing, typed test data, and dual project configuration — all in a single Playwright TypeScript project.

**New skills introduced in Week 2 vs Week 1:**

- Playwright `request` fixture — API testing without any browser or external tool
- `testData.ts` — typed test data pattern using TypeScript interfaces
- Dual project config — `ui` and `api` projects in one `playwright.config.ts`
- `dotenv` + `extraHTTPHeaders` — secure API key handling at config level
- GitHub Secrets — CI-safe credential management
- 10 API tests covering GET, POST, PUT, DELETE with three assertion levels
- 4 edge case UI tests — SQL injection, boundary strings, special characters, whitespace

---

## 2. Two Playwright CLI Tools — The Conceptual Core

The name "Playwright CLI" refers to two distinct tools. Understanding both is the conceptual foundation of this project.

### Tool 1 — Standard CLI: `npx playwright`

Ships with `@playwright/test`. The test runner used in this project and in Week 1.

```bash
npx playwright test                    # run all tests
npx playwright test --project=api      # run API project only
npx playwright test --project=ui       # run UI project only
npx playwright codegen https://app.vwo.com/#/login   # generate locators
npx playwright show-report             # open HTML report
npx playwright test --debug            # debug with inspector
npx playwright test --grep "TC-API"    # filter tests by name
```

### Tool 2 — `@playwright/cli` (Microsoft's AI Agent CLI)

A separate Microsoft package built specifically for AI coding agents (Claude Code, Cursor, Copilot, Windsurf). Solves the token efficiency problem with Playwright MCP.

```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills        # creates .claude/skills/playwright-cli/SKILL.md
playwright-cli open https://example.com
playwright-cli snapshot                # saves to disk, not context window
playwright-cli click e15               # element reference from snapshot
playwright-cli fill e22 "text"
playwright-cli screenshot
```

### MCP vs `@playwright/cli` — Why This Matters

| Feature             | Playwright MCP                   | `@playwright/cli`                |
| ------------------- | -------------------------------- | -------------------------------- |
| Snapshot delivery   | Injected into LLM context window | Saved to disk as YAML/PNG        |
| Tokens per snapshot | ~115,000                         | ~25,000                          |
| Token efficiency    | Baseline                         | **4.6× better**                  |
| Session persistence | Per tool call                    | Persistent daemon (Unix socket)  |
| Transport           | HTTP                             | Direct Unix socket               |
| Best for            | Simple AI tasks                  | Complex multi-step AI automation |

> This project's name `Playwright_CLI` reflects awareness of both tools. The test suite itself uses the Standard CLI. The `@playwright/cli` AI agent approach is the Week 3/4 AI_Agentic project.

---

## 3. Project Structure

```
Playwright_CLI/
│
├── .github/
│   └── workflows/
│       └── playwright_cli.yml     ← CI pipeline — API first, then UI
│
├── data/
│   └── testData.ts                ← All test inputs — typed interfaces, no hardcoding
│
├── docs/                          ← STLC phase documentation
│   ├── 01_requirement_analysis.md
│   ├── 02_test_planning.md
│   ├── 03_test_cases.md
│   ├── 04_bug_reports.md
│   └── 05_test_closure.md
│
├── pages/
│   └── LoginPage.ts               ← POM — getByRole locators, 7 typed async methods
│
├── tests/
│   ├── ui/
│   │   └── vwo_login.spec.ts      ← 10 UI tests — core + edge cases
│   └── api/
│       ├── auth.spec.ts           ← 5 API auth tests (login + register)
│       └── users.spec.ts          ← 5 API user tests (GET PUT DELETE)
│
├── .env                           ← API key — gitignored, never commit
├── .env.example                   ← Safe-to-commit template
├── .gitignore
├── package.json
├── playwright.config.ts           ← Dual project config: ui + api
├── tsconfig.json
└── README.md
```

---

## 4. Architecture — How the Dual Config Works

`playwright.config.ts` defines two completely separate projects:

```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config(); // loads .env into process.env before anything else

export default defineConfig({
  projects: [
    {
      name: "ui",
      testDir: "./tests/ui",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://app.vwo.com",
        screenshot: "only-on-failure",
        trace: "on-first-retry",
      },
    },
    {
      name: "api",
      testDir: "./tests/api",
      use: {
        baseURL: "https://reqres.in",
        extraHTTPHeaders: {
          "x-api-key": process.env.REQRES_API_KEY ?? "",
          "Content-Type": "application/json",
        },
      },
    },
  ],
});
```

**Key architectural decisions:**

- `dotenv.config()` runs first — loads `.env` before any test or config reads `process.env`
- `extraHTTPHeaders` injects the API key at the project level — no key inside individual test files
- `baseURL` per project — tests use `/api/login` not `https://reqres.in/api/login` — environment-agnostic
- `testDir` per project — `ui` and `api` suites are completely isolated
- `??` (nullish coalescing) — falls back to empty string only if value is null/undefined, not if it is 0

---

## 5. Concepts Checklist

### API Testing Concepts

- [x] HTTP methods — GET, POST, PUT, DELETE — what each does, when to use
- [x] Status code assertions — 200, 201, 204, 400, 401, 403, 404
- [x] Three-level assertion pattern — status code → body fields → schema/types
- [x] `request` fixture — no browser, direct HTTP, injected by Playwright runner
- [x] `response.json()` — parse body; never call on 204 (no content)
- [x] Negative API testing — missing fields, wrong credentials, non-existent resources
- [x] `baseURL` in config — prepended to all relative URLs in `request` calls
- [x] `extraHTTPHeaders` — headers injected at project level, not in test files
- [x] 404 as a PASS — negative test correctly asserts wrong status as expected

### TypeScript / Architecture Concepts

- [x] `interface` — defines object shape; TypeScript enforces it at compile time
- [x] `password?: string` — optional field marker; allows missing-field test objects
- [x] `as LoginCredentials` — type assertion; enables autocomplete and type safety
- [x] `export const` / `import { }` — named exports and imports
- [x] `readonly` — POM properties set once in constructor, not reassignable
- [x] `async/await` — all browser and HTTP methods are asynchronous
- [x] `Promise<void>` — return type for methods that perform actions, not return data

### Test Design Concepts

- [x] POM (Page Object Model) — selectors in `pages/`, logic in `tests/`
- [x] `getByRole` locators — resilient; survive CSS changes if ARIA role stays same
- [x] `test.describe` + `let` at describe scope — `loginPage` accessible to all tests
- [x] `test.beforeEach` — fresh navigation before every test; tests are independent
- [x] Equivalence partitioning — valid, invalid, boundary, edge case categories
- [x] Boundary value analysis — empty, single char, maximum length inputs
- [x] `testData.ts` pattern — DRY principle for test inputs; one file, all credentials

### Security / CI/CD Concepts

- [x] `.env` file — local secrets, always in `.gitignore`, never committed
- [x] `.env.example` — safe template showing variable names without values
- [x] `dotenv` — reads `.env` into `process.env` at runtime
- [x] GitHub Secrets — encrypted credential storage for CI
- [x] `${{ secrets.REQRES_API_KEY }}` — secrets injected as environment variables
- [x] `npm ci` vs `npm install` — reproducible builds in CI
- [x] `if: always()` — upload report even when tests fail
- [x] `working-directory: Playwright_CLI` — CI runs from project subfolder

---

## 6. All 20 Test Cases

### UI Suite — `tests/ui/vwo_login.spec.ts`

Target: `https://app.vwo.com/#/login`

| TC ID    | Scenario                                | Type            | Expected                  |
| -------- | --------------------------------------- | --------------- | ------------------------- |
| TC-UI-01 | Page loads — all elements visible       | Smoke           | 5 elements visible        |
| TC-UI-02 | Valid email format triggers server auth | Functional      | Server responds           |
| TC-UI-03 | Invalid email + wrong password          | EP Negative     | Error visible             |
| TC-UI-04 | Valid email + wrong password            | EP Negative     | Error visible             |
| TC-UI-05 | Empty form submission                   | BVA Minimum     | Error visible, fast (~5s) |
| TC-UI-06 | Email only, password empty              | BVA Partial     | Error visible             |
| TC-UI-07 | SQL injection in email field            | Edge / Security | No crash, error shown     |
| TC-UI-08 | 500-character string in email           | Edge / Boundary | Handled gracefully        |
| TC-UI-09 | Special characters in password          | Edge            | Error visible, no crash   |
| TC-UI-10 | Whitespace-only in both fields          | Edge            | Error visible             |

> TC-UI-05 runs in ~5 seconds (client-side validation). TC-UI-03 runs in ~18 seconds (server-side validation). The timing difference proves the validation location without inspecting network traffic.

### API Suite — `tests/api/auth.spec.ts`

Target: `https://reqres.in/api`

| TC ID     | Endpoint        | Method | Scenario           | Expected                 |
| --------- | --------------- | ------ | ------------------ | ------------------------ |
| TC-API-01 | `/api/login`    | POST   | Valid credentials  | 200 + token (string)     |
| TC-API-02 | `/api/login`    | POST   | Missing password   | 400 + "Missing password" |
| TC-API-03 | `/api/login`    | POST   | Wrong credentials  | 400 + error defined      |
| TC-API-04 | `/api/register` | POST   | Valid registration | 200 + token + id         |
| TC-API-05 | `/api/register` | POST   | Missing password   | 400 + "Missing password" |

### API Suite — `tests/api/users.spec.ts`

| TC ID     | Endpoint            | Method | Scenario           | Expected                         |
| --------- | ------------------- | ------ | ------------------ | -------------------------------- |
| TC-API-06 | `/api/users?page=2` | GET    | Paginated list     | 200 + data array, total=12       |
| TC-API-07 | `/api/users/2`      | GET    | Single user exists | 200 + id=2, first_name (string)  |
| TC-API-08 | `/api/users/23`     | GET    | Non-existent user  | 404                              |
| TC-API-09 | `/api/users/2`      | PUT    | Update user        | 200 + updated fields + updatedAt |
| TC-API-10 | `/api/users/2`      | DELETE | Delete user        | 204 (no body parsed)             |

---

## 7. Key Debugging Lesson — The SPA Routing Fix

All 10 UI tests initially failed with `element not found` on the email input. Root cause: `LoginPage.navigate()` used `goto('/login')` without the `#`.

VWO is a Single Page Application. The route `/#/login` is handled by the JavaScript router in the browser. Without the `#`, the browser sends a server request for `/login`, which returns 404 — no login form ever loads.

Fix: `goto('/#/login')`. This is a real debugging skill — the locator was correct, the URL was wrong. The screenshot in `test-results/` showed a blank or error page, not a login form.

**Second fix:** The `loginButton` locator generated by Cowork used `'Continue'` as the button name. Playwright codegen on the live VWO page shows `'Sign in'`. Always verify generated locators against the live page.

---

## 8. How to Run Locally

```bash
# Navigate to the project
cd sdet-stlc-portfolio/Playwright_CLI

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Copy env template and add your ReqRes API key
cp .env.example .env
# Edit .env: REQRES_API_KEY=your_key_from_reqres.in

# Run API tests only — fast verification (no browser)
npx playwright test --project=api --reporter=list

# Run UI tests only
npx playwright test --project=ui --reporter=list

# Run all 20 tests
npx playwright test

# Open HTML report
npx playwright show-report

# Filter tests by TC ID
npx playwright test --grep "TC-API"
npx playwright test --grep "TC-UI-07"

# Debug a specific test
npx playwright test --grep "TC-UI-01" --debug
```

---

## 9. CI/CD Pipeline

The pipeline runs on every push and pull request to `main`.

```yaml
# .github/workflows/playwright_cli.yml
env:
  REQRES_API_KEY: ${{ secrets.REQRES_API_KEY }}

steps:
  - checkout
  - setup Node LTS
  - npm ci # exact versions from lock file
  - npx playwright install --with-deps # browsers + OS dependencies
  - npx playwright test --project=api # API tests first (3.9s)
  - npx playwright test --project=ui # UI tests second (53.9s)
  - upload HTML report (if: always()) # report uploads even on failure
```

**Before pushing:** Add `REQRES_API_KEY` to GitHub repo secrets:
`Settings → Secrets and variables → Actions → New repository secret`

---

## 10. STLC Phase Coverage

| Phase                   | Coverage                                                                        |
| ----------------------- | ------------------------------------------------------------------------------- |
| Phase 1 — Requirements  | VWO login UI requirements + ReqRes API contract; testable behaviours identified |
| Phase 2 — Test Planning | Dual project strategy, testData.ts pattern, edge case categories defined        |
| Phase 3 — Test Cases    | 20 TC IDs with EP/BVA labels, inline rationale comments                         |
| Phase 4 — Automation    | POM + getByRole, request fixture, extraHTTPHeaders, strict TypeScript           |
| Phase 5 — Bug Reporting | HTML report per run; CI artifact retained 30 days; TC ID traceability           |
| Phase 6 — Test Closure  | CI green on push/PR; API-first pipeline; 20/20 final result                     |

---

## 11. How This Differs from Week 1 (STLC_Standard_CLI)

| Dimension           | Week 1            | Week 2                                       |
| ------------------- | ----------------- | -------------------------------------------- |
| Test types          | UI only           | UI + API                                     |
| Test count          | 6                 | 20 (10 UI + 10 API)                          |
| Test data           | Hardcoded strings | `testData.ts` typed interfaces               |
| Edge cases          | None              | SQL injection, boundary, special chars       |
| Fixtures used       | `page` only       | `page` + `request`                           |
| API key handling    | N/A               | dotenv + GitHub Secrets                      |
| Playwright projects | 1 (chromium)      | 2 (ui + api)                                 |
| Environment config  | Hardcoded baseURL | Per-project baseURL                          |
| New TS concepts     | POM, async/await  | Interfaces, optional fields, type assertions |

---

## 12. Portfolio Roadmap

```
Block_A_Manual
    ├── Manual STLC — 6 STLC phases, no automation
    │
    ├── STLC_MCP_Project
    │     └── Playwright MCP + JIRA MCP — AI agent, 43 DOM elements, 5-browser CI
    │
    ├── STLC_Standard_CLI
    │     └── Standard Playwright CLI — POM, 6 tests, 3 browsers, 18/18 ✅
    │
    ├── Playwright_CLI          ← YOU ARE HERE
    │     └── UI + API, testData.ts, dual config, 20/20 ✅
    │
    ├── AI_Agentic              ← NEXT (Week 3/4)
    │     └── @playwright/cli — AI-driven, token-efficient, Unix socket sessions
    │
    └── Selenium_to_Playwright
          └── Migration project — demonstrate framework transition
```

---

## Environment Variables

| Variable          | Description                           | Required |
| ----------------- | ------------------------------------- | -------- |
| `REQRES_API_KEY`  | ReqRes API key for `x-api-key` header | Yes      |
| `REQRES_BASE_URL` | Override ReqRes base URL              | Optional |
| `VWO_BASE_URL`    | Override VWO base URL                 | Optional |

Get a free API key at [reqres.in](https://reqres.in) — no credit card required.

---

_Soma Sai Dinesh Cheviti · QA Automation Engineer · Bengaluru & Nandyal_
_Playwright + TypeScript + Python · 2 years experience_
_Open to SDET roles — product companies, WFH / Hybrid_
