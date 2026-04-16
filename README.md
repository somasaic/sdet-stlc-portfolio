# SDET Portfolio — STLC Applied to Real Projects

**Soma Sai Dinesh** | QA Automation Engineer | Bengaluru

---

> **📌 Disclaimer:** This is a practice portfolio project created for learning and skill demonstration purposes. VWO Login Dashboard (`app.vwo.com/#/login`) was used as a practice target based on course material from Pramod Dutta's Playwright Automation Mastery 2026 program. No internal systems, confidential data, or proprietary documentation were accessed. All bugs logged are simulated defects created for STLC workflow demonstration — they are not confirmed production vulnerability reports submitted to VWO.

---

## What This Repository Contains

This portfolio demonstrates end-to-end STLC (Software Testing Life Cycle) applied to real products — VWO Login Dashboard and ReqRes API — using five progressively advanced approaches. Each project builds on the previous, adding a new layer of skill.

| Project                           | Folder                  | Description                                                                     |
| --------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| Manual QA                         | `Block_A_Manual/`       | Traditional STLC — PRD analysis, manual test cases, bug reports                 |
| AI-Assisted QA                    | `STLC_MCP_Project/`     | MCP-driven STLC — Playwright MCP + JIRA MCP automation                          |
| Standard CLI (Week 1b)            | `STLC_Standard_CLI/`    | Playwright + TypeScript + POM + GitHub Actions CI — UI testing                  |
| Standard CLI + API (Week 2)       | `Playwright_CLI/`       | Playwright UI + API testing — `request` fixture, testData, dual config          |
| AI Agents + Visual Reg (Week 3/4) | `Playwright_AI_Agents/` | Playwright built-in AI agents — planner, generator, healer + toHaveScreenshot() |

---

## Why Five Approaches on the Same Target?

The same VWO login page is tested five different ways intentionally. Each approach answers a different question an SDET faces in real work.

**Manual QA** answers: "What does this feature need to do, and how do I document it?" It builds the foundation — requirement analysis, formal test cases, bug reports. Every SDET must own this regardless of their automation skill level.

**AI-Assisted QA (MCP)** answers: "How can AI augment my workflow without replacing my judgment?" Playwright MCP + JIRA MCP lets Claude Desktop control a real browser and log bugs autonomously — but the SDET defines the STLC structure, reviews output, and makes decisions.

**Standard CLI (Week 1b)** answers: "How do I build a production-grade, maintainable automation framework from scratch?" Pure engineering — the SDET writes every file, understands every decision, and owns the framework architecture.

**Standard CLI + API (Week 2)** expands the question: "How do I test across UI and API layers in a single cohesive framework?" Introduces the `request` fixture, testData patterns, dual project config, and shows 14× speed gains by testing at the API layer.

**Playwright AI Agents (Week 3/4)** answers: "How do autonomous AI agents handle the full test lifecycle — and where does a human SDET still add irreplaceable value?" Three built-in agents (planner, generator, healer) handle test planning, code generation, and self-repair. Visual regression testing with `toHaveScreenshot()` covers pixel-level UI verification — the skill gap most 1-3 year SDETs have not closed.

---

## Project 1b — STLC Standard CLI (Week 1)

### What Standard CLI means and why an SDET chooses it

Standard CLI refers to initialising a Playwright project using `npm init playwright@latest` from the command line — no IDE plugin, no code generator dependency, no AI co-pilot. The SDET manually creates the folder structure, writes the configuration, builds the POM class, and authors every test case.

An SDET chooses Standard CLI over other approaches for four specific reasons:

**Framework ownership.** When a CI pipeline breaks at 2am, the on-call SDET must understand every file in the project — not just the test logic, but the config, the runner, the reporter, and the workflow YAML. Standard CLI forces that understanding because nothing is generated for you.

**Interview readiness.** Product companies ask SDETs to build a test framework from scratch in technical rounds. "Initialise a Playwright project, write a POM class, add a spec file, configure GitHub Actions" is a real interview task. The ability to do this cold, without assistance, is what Standard CLI practice builds.

**Team scalability.** MCP-generated tests are tied to an AI tool. Standard CLI projects follow conventions that any TypeScript developer can read, review, and extend. PRs get reviewed. Tests get maintained. Frameworks outlive the person who built them.

**CI/CD integration.** GitHub Actions reads `.github/workflows/playwright.yml` — a plain YAML file the SDET writes by hand. Understanding what each step does (checkout, setup-node, npm ci, playwright install, test, upload-artifact) is the difference between an SDET who can debug a failing pipeline and one who just pushes and hopes.

### How Standard CLI differs from other approaches

| Dimension                | Manual QA           | MCP-Assisted                  | Standard CLI                          |
| ------------------------ | ------------------- | ----------------------------- | ------------------------------------- |
| Who executes tests       | Human tester        | AI agent (Claude + MCP)       | Playwright runner (automated)         |
| Who writes the framework | Not applicable      | MCP generates code            | SDET writes every file                |
| Selector strategy        | Manual inspection   | Codegen / AI suggestion       | SDET chooses (getByRole used)         |
| CI/CD integration        | None                | None                          | Full GitHub Actions pipeline          |
| Reproducibility          | Tester-dependent    | Tool-dependent                | Deterministic — same result every run |
| Interview signal         | QA process maturity | Emerging AI tooling awareness | Core SDET engineering competency      |
| Maintenance              | Manual re-execution | Re-run AI session             | Git commit — version controlled       |

### Project structure

```
STLC_Standard_CLI/
│
├── .github/
│   └── workflows/
│       └── playwright.yml          ← GitHub Actions CI pipeline
│
├── pages/
│   └── LoginPage.ts                ← POM — VWO selectors and action methods
│
├── tests/
│   └── vwo_login.spec.ts           ← 6 test cases across login scenarios
│
├── playwright.config.ts            ← baseURL, browsers, retries, reporter
├── tsconfig.json                   ← TypeScript compiler config
├── package.json                    ← project dependencies
└── README.md                       ← project-level STLC documentation
```

### STLC phases applied

| Phase                    | What was done                                                                | Output                |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------- |
| 1 — Requirement Analysis | Identified 6 testable requirements on VWO login page via DOM audit           | REQ-01 through REQ-06 |
| 2 — Test Planning        | Defined scope, entry/exit criteria, 5-item risk register, 4 testing types    | Test Plan in README   |
| 3 — Test Case Design     | 6 TC IDs using equivalence partitioning and boundary value analysis          | TC-01 through TC-06   |
| 4 — Test Automation      | Playwright + TypeScript POM, role-based locators, 18 tests across 3 browsers | vwo_login.spec.ts     |
| 5 — Bug Reporting        | KAN-1 logged in JIRA — password field has no visibility toggle               | JIRA ticket           |
| 6 — Test Closure         | 18/18 passed, 0 failed, cross-browser validated, CI pipeline green           | HTML report           |

### Test results

| Browser   | Tests  | Passed | Failed |
| --------- | ------ | ------ | ------ |
| Chromium  | 6      | 6      | 0      |
| Firefox   | 6      | 6      | 0      |
| WebKit    | 6      | 6      | 0      |
| **Total** | **18** | **18** | **0**  |

### How to run locally

```bash
cd STLC_Standard_CLI
npm ci
npx playwright install
npx playwright test
npx playwright show-report
```

---

## Project 2 — Playwright_CLI: UI + API Testing (Week 2)

### Overview

**Standard Playwright UI + API Testing | VWO Login + ReqRes API**

This project introduces API testing alongside UI automation — a critical real-world SDET skill. Using Playwright's `request` fixture, tests run directly against ReqRes public API with zero browser overhead, demonstrating the speed and value of testing at multiple layers.

### Test Results

| Suite                  | Tests     | Status             |
| ---------------------- | --------- | ------------------ |
| API — auth.spec.ts     | 5/5       | ✅ Passing         |
| API — users.spec.ts    | 5/5       | ✅ Passing         |
| UI — vwo_login.spec.ts | 10/10     | ✅ Passing         |
| **Total**              | **20/20** | **✅ All passing** |

### What this project adds

- **Playwright `request` fixture** — API testing without browser or external tools
- **Full CRUD coverage** — GET, POST, PUT, DELETE against ReqRes public API
- **Dual project config** — `ui` and `api` projects in single `playwright.config.ts`
- **testData.ts** — typed test data pattern using TypeScript interfaces
- **dotenv + GitHub Secrets** — secure API key handling in CI/CD
- **Edge case UI tests** — SQL injection, boundary strings, special characters, whitespace handling
- **Bug KAN-2 logged** — REST 200 vs 201 discrepancy in ReqRes API documented via JIRA MCP

### Performance Comparison

| Layer          | Tests | Time    | Per-test                |
| -------------- | ----- | ------- | ----------------------- |
| API tests      | 10    | 3.9s    | ~400ms                  |
| UI tests       | 10    | 53.9s   | 5–14s                   |
| **Speed gain** | —     | **14×** | API layer is 14× faster |

**Why this matters:** Product SDETs use this knowledge to make architectural decisions — which features to test at API vs UI layer for optimal coverage and CI/CD speed.

### Project structure

```
Playwright_CLI/
│
├── tests/
│   ├── api/
│   │   ├── auth.spec.ts             ← API auth scenarios (TC-API-01 to TC-API-05)
│   │   ├── users.spec.ts            ← CRUD operations (TC-API-06 to TC-API-10)
│   │   └── bug_kan2.spec.ts         ← REST 200 vs 201 intentional fail
│   └── ui/
│       └── vwo_login.spec.ts        ← UI login scenarios + edge cases (TC-UI-01 to TC-UI-10)
│
├── pages/
│   └── LoginPage.ts                 ← POM — VWO selectors
│
├── data/
│   └── testData.ts                  ← Typed test data (interfaces + endpoints)
│
├── docs/
│   ├── 01_requirement_analysis.md   ← API + UI requirements (22 REQs)
│   ├── 02_test_planning.md          ← Scope, risks, dual-layer strategy
│   ├── 03_test_cases.md             ← TC-01 through TC-20
│   ├── 04_bug_reports.md            ← KAN-2 full detail
│   └── 05_test_closure.md           ← Final validation
│
├── playwright.config.ts             ← baseURL, projects (ui/api), globals
├── tsconfig.json
├── package.json
└── README.md
```

### Key concepts introduced

- **`request` fixture** — direct HTTP without browser context
- **`extraHTTPHeaders`** — adding auth headers to all requests at config level
- **`baseURL` per project** — separate baseURL for UI (VWO) and API (ReqRes)
- **TypeScript interfaces** — type-safe test data (LoginCredentials, UserPayload)
- **`dotenv`** — loading `.env` for secrets in local dev
- **GitHub Secrets** — CI/CD environment variable injection
- **`if: always()`** in CI — report generation even if tests fail
- **204 No Content rule** — DELETE tests that correctly skip `response.json()`
- **3-level API assertions** — status code → field existence → schema/type validation

### STLC — All 6 Phases

| Phase                    | Deliverable                                     |
| ------------------------ | ----------------------------------------------- |
| 1 — Requirement Analysis | 22 requirements — 12 UI + 10 API, RTM mapped    |
| 2 — Test Planning        | Dual-layer strategy, scope, risk register       |
| 3 — Test Case Design     | 20 test cases (10 API, 10 UI) with edge cases   |
| 4 — Test Automation      | Playwright request + browser, POM, testData     |
| 5 — Bug Reporting        | KAN-2 — REST 201 vs 200 status code discrepancy |
| 6 — Test Closure         | 20/20 passing, cross-layer validated            |

### Bug KAN-2

**Issue:** POST /api/register returns `200 (OK)` instead of `201 (Created)`  
**Impact:** Violates REST convention — RFC 7231 says resource creation should return 201  
**Evidence:** `bug_kan2.spec.ts` — first test intentionally FAILS (proves bug), second PASSES (documents actual behaviour)  
**Logged via:** JIRA MCP — same approach as KAN-1 in STLC_MCP_Project  
**Status:** [KAN-2 on JIRA](https://somasaicheviti.atlassian.net/browse/KAN-2)

### How to run locally

```bash
cd Playwright_CLI
npm ci
npx playwright install

# Run all tests (UI + API)
npx playwright test

# Run only API tests
npx playwright test --project=api

# Run only UI tests
npx playwright test --project=ui

# Run the intentional bug test
npx playwright test --project=api tests/api/bug_kan2.spec.ts --reporter=list

npx playwright show-report
```

---

## Project 3 — Playwright_AI_Agents: AI Agents + Visual Regression (Week 3/4)

### Overview

**Playwright Built-in AI Agents | VWO Login | planner + generator + healer + toHaveScreenshot()**

This project demonstrates Playwright's built-in AI agent system — three specialised agents that autonomously plan, generate, and self-heal test suites. Added key addon: **Visual Regression Testing** using `toHaveScreenshot()` — pixel-level baseline comparison that catches UI regressions functional tests miss entirely.

This is Approach 5 in the portfolio — the most advanced project, representing the emerging 2025–26 SDET skill set.

### What makes this different from all previous approaches

| Dimension            | All Previous Approaches         | Playwright AI Agents                              |
| -------------------- | ------------------------------- | ------------------------------------------------- |
| Who writes tests     | SDET (manually or with AI help) | Planner + Generator agents (autonomous)           |
| Who repairs failures | SDET debugs and patches         | Healer agent self-repairs failing tests           |
| Test coverage type   | Functional UI and API           | Functional + Visual Regression                    |
| UI change detection  | Only catches logic failures     | Pixel-level diff — catches CSS and layout changes |
| Baseline management  | Not applicable                  | PNG baselines committed to repo, CI compares      |
| Agent infrastructure | MCP used ad hoc per prompt      | Agent loop: planner → generator → healer          |

### Understanding Playwright AI Agents

Playwright ships three built-in agents as of v1.56. They are initialized via:

```bash
npx playwright init-agents --loop=claude
```

This generates three Markdown definition files in `.claude/agents/` that Claude Code reads automatically when you open the project. These files contain the system prompts and tool lists that instruct Claude Code how to behave as each agent role.

#### 🎭 Planner Agent

**What it does:** Explores the live application and produces a human-readable Markdown test plan.

**How it works:**

1. Claude Code calls `planner_setup_page` tool
2. That tool runs `seed.spec.ts` first — navigating to the target URL
3. Browser session is handed to the agent via `page.pause()`
4. Agent uses `browser_snapshot` to read the live DOM structure
5. Agent navigates all flows — login, error states, edge cases
6. Agent writes `specs/vwo_login_plan.md` — structured, machine-readable plan

**Input:** `seed.spec.ts` + your prompt  
**Output:** `specs/vwo_login_plan.md`

**Example prompt for Claude Code:**

```
Use the planner agent to explore app.vwo.com/#/login and produce a test plan.
Cover: page load smoke, invalid credentials, empty form, SQL injection edge case.
Save to: specs/vwo_login_plan.md
```

#### 🎭 Generator Agent

**What it does:** Reads the Markdown plan and generates executable Playwright TypeScript spec files — verifying every selector live as it writes.

**How it works:**

1. Reads `specs/vwo_login_plan.md`
2. Calls `generator_setup_page` → runs `seed.spec.ts` → opens browser
3. Verifies each selector exists in the real DOM before writing it
4. Produces `tests/login/*.spec.ts` with proper assertions

**Input:** `specs/vwo_login_plan.md`  
**Output:** `tests/login/*.spec.ts` — verified, runnable tests

**Example prompt for Claude Code:**

```
Use the generator agent to convert specs/vwo_login_plan.md into test files.
Output to: tests/login/. Use seed.spec.ts. Use getByRole locators only.
```

#### 🎭 Healer Agent

**What it does:** Replays failing tests, inspects the current DOM, patches the broken selector or assertion, and re-runs until the test passes.

**How it works:**

1. Receives failing test file path + error output
2. Replays the failing steps in a live browser
3. Reads the current DOM to find the correct element
4. Patches the spec file in place
5. Re-runs until green — or marks as skipped if UI is genuinely broken

**Input:** Failing test name + error  
**Output:** Patched passing spec file (or documented skip)

**Example prompt for Claude Code:**

```
Use the healer agent to fix the failing test:
tests/login/invalid-credentials.spec.ts
Error: [paste error output here]
```

### Understanding seed.spec.ts

`seed.spec.ts` is the most misunderstood file in this project. It is **not a regular test**.

Before the planner or generator starts exploring the browser, it calls `planner_setup_page` (or `generator_setup_page`), which runs `seed.spec.ts` first. The seed file navigates to the target URL and calls `page.pause()` — which keeps the browser open and hands the live session to the agent.

**Without `page.pause()`:** the browser closes immediately after navigation. The agent has no session to explore.  
**With `page.pause()`:** the browser stays open. The agent's `browser_snapshot`, `browser_click`, `browser_fill` tool calls work against this live session.

```typescript
// seed.spec.ts — browser bootstrap, NOT a test
test("seed", async ({ page }) => {
  await page.goto("/#/login");
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("textbox", { name: "Email address" }),
  ).toBeVisible(); // confirm page ready before handing to agent

  await page.pause(); // ← agent takes control here
});
```

### Playwright AI Agents vs Playwright MCP — the critical distinction

Both use MCP under the hood. The difference is in **role and structure**.

**Playwright MCP** (used in Week 1a) is a browser control **server** — it exposes tools (`browser_snapshot`, `browser_click`, `browser_fill`) that any MCP client can call. You drive every interaction step by step in a conversational session.

**Playwright AI Agents** are structured **clients** with defined roles built on top of those same MCP tools. The planner agent wraps `browser_snapshot` calls in a deliberate loop that produces a Markdown plan. The generator wraps `generator_setup_page` in a loop that produces TypeScript files. The output is deterministic and structured — not conversational.

| Dimension        | Playwright MCP (Week 1a)       | Playwright AI Agents (Week 3/4)                 |
| ---------------- | ------------------------------ | ----------------------------------------------- |
| Role             | Browser control server         | Structured client with defined purpose          |
| Who drives steps | You — one prompt per action    | Agent — autonomous loop                         |
| Output           | Conversational response        | Files: specs/_.md + tests/_.spec.ts             |
| Token cost       | ~115K tokens per 30 actions    | Lower — agents write to disk, not context       |
| Best for         | Interactive exploration, KAN-1 | Full STLC automation, KAN-3                     |
| Agent definition | Not applicable                 | `.claude/agents/*.md` — regenerate on PW update |

**The analogy:** MCP is electricity. The agents are appliances. Both run on the same protocol — they serve completely different purposes.

### Key Addon — Visual Regression Testing

Visual regression testing with `toHaveScreenshot()` is the Week 3/4 key addon — the skill gap most SDETs at 1-3 years have not closed.

**What functional tests miss:**

- A CSS deploy changed the error message from red to orange
- The password field border disappeared
- The login button shifted 20px right on mobile viewport
- The logo was replaced with a placeholder image
- Functional tests still PASS despite all of these regressions

**What `toHaveScreenshot()` catches:** Any pixel-level visual change. The baseline PNG is stored in the repo. Every CI run compares against it. If the UI changes unexpectedly, the test fails with a diff image showing exactly what changed.

#### Two-phase workflow

**Phase 1 — Create baselines (first run):**

```bash
npx playwright test tests/visual/ --project=chromium --update-snapshots
# Creates PNG files in tests/visual/login_visual.spec.ts-snapshots/
```

**Phase 2 — Comparison (every run after):**

```bash
npx playwright test tests/visual/ --project=chromium
# Compares pixel-by-pixel against stored baselines
# Fails with diff image if UI has changed
```

#### The VWO animated background problem — and how it was solved

VWO's login page has a dynamic CSS animated background that changes every render. Full-page screenshots produced 65,000–69,000 pixel diffs between runs taken seconds apart — not because the UI changed, but because the animation was captured at a different frame.

**Solution:** Clip screenshots to the login form's bounding box only:

```typescript
const loginForm = page.locator("form").first();
const formBox = await loginForm.boundingBox();

await expect(page).toHaveScreenshot("vwo-login-default.png", {
  clip: formBox ?? undefined, // form only — excludes animated background
  animations: "disabled", // disable remaining CSS animations
  maxDiffPixels: 200, // tolerance for sub-pixel font rendering
});
```

This is documented engineering decision-making — not just "it works now." The `maxDiffPixels: 200` threshold handles sub-pixel font rendering differences between runs while still catching real UI regressions (which typically change thousands of pixels).

#### Visual regression test results

| Test      | Scenario                        | Baseline file                               | Status     |
| --------- | ------------------------------- | ------------------------------------------- | ---------- |
| TC-VR-01  | Login page default state        | `vwo-login-default-chromium-win32.png`      | ✅ Passing |
| TC-VR-02  | Error state after invalid login | `vwo-login-error-state-chromium-win32.png`  | ✅ Passing |
| TC-VR-03  | Login page with email filled    | `vwo-login-email-filled-chromium-win32.png` | ✅ Passing |
| **Total** | —                               | —                                           | **3/3 ✅** |

Baseline PNGs are committed to the repository. CI compares against them on every push. The `-chromium-win32` suffix is automatic — Playwright tags baselines by browser and OS so CI on Ubuntu Linux generates and uses its own separate baselines without conflicting with Windows development baselines.

### Project structure

```
Playwright_AI_Agents/
│
├── .claude/
│   └── agents/
│       ├── playwright-test-planner.md    ← Agent definition — Claude Code reads this
│       ├── playwright-test-generator.md  ← Agent definition — Claude Code reads this
│       └── playwright-test-healer.md     ← Agent definition — Claude Code reads this
│
├── .github/
│   └── workflows/
│       └── playwright_agents.yml         ← CI pipeline — visual + agent-generated tests
│
├── docs/                                 ← STLC documentation (6 phases)
│   ├── 01_requirement_analysis.md
│   ├── 02_test_planning.md
│   ├── 03_test_cases.md
│   ├── 04_bug_reports.md
│   └── 05_test_closure.md
│
├── specs/
│   └── vwo_login_plan.md                 ← Test plan (written by planner agent)
│
├── tests/
│   ├── seed.spec.ts                      ← Browser bootstrap — NOT a regular test
│   ├── login/                            ← Agent-generated test files (generator output)
│   │   ├── smoke.spec.ts
│   │   ├── invalid-credentials.spec.ts
│   │   └── edge-cases.spec.ts
│   └── visual/
│       ├── login_visual.spec.ts          ← Visual regression — toHaveScreenshot()
│       └── login_visual.spec.ts-snapshots/
│           ├── vwo-login-default-chromium-win32.png
│           ├── vwo-login-error-state-chromium-win32.png
│           └── vwo-login-email-filled-chromium-win32.png
│
├── screenshots/                          ← Additional captured screenshots
├── playwright.config.ts                  ← Single project (chromium), 60s timeout
├── tsconfig.json                         ← TypeScript config
├── package.json
└── README.md
```

### STLC — All 6 Phases

| Phase                    | What was done                                                                  | Output                                   |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------- |
| 1 — Requirement Analysis | Planner agent explores live DOM, documents all testable elements and flows     | `specs/vwo_login_plan.md`                |
| 2 — Test Planning        | Agent loop design, seed strategy, visual baseline plan, CI configuration       | `docs/02_test_planning.md`               |
| 3 — Test Case Design     | Generator converts plan to TC IDs — smoke, invalid creds, edge cases, VR tests | `tests/login/*.spec.ts` + TC-VR-01/02/03 |
| 4 — Test Automation      | Agent-generated specs + visual regression tests with clipped baseline strategy | All spec files, PNG baselines            |
| 5 — Bug Reporting        | Healer-caught failures logged as KAN-3 in JIRA via JIRA MCP                    | `docs/04_bug_reports.md`, JIRA KAN-3     |
| 6 — Test Closure         | 3/3 visual tests passing, agent-generated tests verified, CI pipeline green    | `docs/05_test_closure.md`, HTML report   |

### Configuration decisions explained

**`fullyParallel: false` and `workers: 1`**  
The AI agents run sequentially. One agent at a time controls the browser. Parallel workers would interfere with the agent's live browser session. This is fundamentally different from Weeks 1-2 where parallel execution was appropriate.

**`timeout: 60000`**  
TC-VR-02 waits 15 seconds for VWO's server-side validation response. With navigation time and screenshot comparison, the test takes ~27 seconds. A 60-second global timeout with `test.slow()` on TC-VR-02 (which triples it to 180s) ensures reliable CI behaviour.

**Single `chromium` project only**  
Agents explore one browser session at a time. Cross-browser testing is handled in Weeks 1b and 2 where deterministic functional tests can run in parallel across browsers.

**`updateSnapshots: missing` via `--update-snapshots` flag**  
Baselines are created on first run and committed to the repo. CI compares against committed baselines — never auto-updates them. An update requires an explicit developer decision: run `--update-snapshots`, review the diff, commit the new baseline.

### How to run locally

```bash
cd Playwright_AI_Agents
npm ci
npx playwright install chromium

# Run visual regression tests
npx playwright test tests/visual/ --project=chromium --reporter=list

# Create/update visual baselines
npx playwright test tests/visual/ --project=chromium --update-snapshots

# Run agent-generated tests (after running agents in Claude Code)
npx playwright test tests/login/ --project=chromium --reporter=list

# View HTML report
npx playwright show-report
```

### How to run the AI agents (Claude Code required)

```bash
# Step 1: Open Claude Code inside the project
cd Playwright_AI_Agents
claude

# Step 2: Run the planner agent
# Prompt Claude Code:
"Use the planner agent to explore app.vwo.com/#/login.
Seed: tests/seed.spec.ts. Save to: specs/vwo_login_plan.md.
Cover: page load, invalid credentials, empty form, SQL injection edge case."

# Step 3: Run the generator agent
# Prompt Claude Code:
"Use the generator agent to convert specs/vwo_login_plan.md into tests.
Output: tests/login/. Use seed.spec.ts. getByRole locators only."

# Step 4: Run generated tests
npx playwright test tests/login/ --project=chromium --reporter=list

# Step 5: For any failing test, run the healer
# Prompt Claude Code:
"Use the healer agent to fix: tests/login/[filename].spec.ts
Error: [paste the error output]"
```

### Key concepts introduced

- **Playwright AI Agents** — built-in planner, generator, healer (Playwright v1.56+)
- **`npx playwright init-agents --loop=claude`** — generates `.claude/agents/*.md` definition files
- **`seed.spec.ts`** — browser bootstrap with `page.pause()` for agent session handoff
- **`planner_setup_page` tool** — runs seed.spec.ts before agent exploration
- **`generator_setup_page` tool** — runs seed.spec.ts before test code generation
- **`toHaveScreenshot()`** — pixel-level baseline comparison for visual regression
- **`clip: boundingBox()`** — stable screenshots by excluding dynamic background elements
- **`test.slow()`** — triples timeout for specific tests with long waits
- **`animations: 'disabled'`** — ensures screenshots capture stable static state
- **`maxDiffPixels`** — tolerance threshold for sub-pixel rendering differences

---

## Tech Stack

- Playwright + TypeScript
- Python + Pytest
- GitHub Actions (CI/CD)
- JIRA (Bug Tracking via MCP and manual)
- Playwright MCP (AI-assisted browser automation — Week 1a)
- Playwright AI Agents — planner, generator, healer (Week 3/4)
- Claude Desktop / Claude Code (MCP client + agent runner)
- `toHaveScreenshot()` — visual regression baseline testing

---

## Portfolio Progression

| Week | Project                | Approach                                           | Tests      | Status |
| ---- | ---------------------- | -------------------------------------------------- | ---------- | ------ |
| 0    | Block_A_Manual         | Manual STLC — no automation                        | —          | ✅     |
| 1a   | STLC_MCP_Project       | Playwright MCP + JIRA MCP — AI agent exploration   | 13         | ✅     |
| 1b   | STLC_Standard_CLI      | Standard CLI, POM, 3 browsers, GitHub Actions      | 18         | ✅     |
| 2    | Playwright_CLI         | UI + API, testData, dual config, 14× speed gain    | 20         | ✅     |
| 3/4  | Playwright_AI_Agents   | Planner + Generator + Healer + Visual Regression   | 3 VR + TBD | 🔄     |
| —    | Selenium_to_Playwright | Migration — Java Selenium to Playwright TypeScript | TBD        | 📋     |

### What each project teaches

- **Block_A_Manual:** STLC fundamentals — how to think like a tester before touching code
- **STLC_MCP_Project:** AI integration — MCP architecture, autonomous test generation, JIRA automation
- **STLC_Standard_CLI:** Core SDET engineering — POM patterns, CI/CD, cross-browser testing, Git workflow
- **Playwright_CLI:** Advanced SDET patterns — API + UI layering, testData design, 3-level assertions, multi-config frameworks
- **Playwright_AI_Agents:** Emerging 2025–26 skill — autonomous agent loops, visual regression, self-healing automation, seed pattern
- **Selenium_to_Playwright:** Framework migration — legacy system modernisation, tool evaluation, migration strategy

---

## STLC Phases Covered

All six phases are applied to every project in this portfolio:

1. **Requirement Analysis** — identifying testable requirements from PRD, live DOM, or API docs
2. **Test Planning** — scope, entry/exit criteria, risk register, testing types
3. **Test Case Design** — TC IDs using equivalence partitioning, boundary value analysis, edge cases
4. **Test Execution / Automation** — Playwright TypeScript, POM, fixtures, CI/CD pipelines
5. **Defect Reporting** — JIRA tickets (KAN-1, KAN-2, KAN-3) logged via MCP and documented
6. **Test Closure** — metrics, RTM traceability, HTML reports, CI green

---

## JIRA Bug Tracker

All bugs are logged to the [KAN project on JIRA](https://somasaicheviti.atlassian.net/jira/software/projects/KAN/boards/1).

| Bug   | Project              | Summary                                                        | Severity | Priority |
| ----- | -------------------- | -------------------------------------------------------------- | -------- | -------- |
| KAN-1 | STLC_Standard_CLI    | Password field has no visibility toggle on VWO login           | Medium   | Low      |
| KAN-2 | Playwright_CLI       | POST /api/register returns 200 instead of 201 (REST violation) | Low      | Low      |
| KAN-3 | Playwright_AI_Agents | Healer-caught test failure (to be logged post agent run)       | TBD      | TBD      |

---

## Live Portfolio

GitHub Pages: [somasaic.github.io/sdet-stlc-portfolio](https://somasaic.github.io/sdet-stlc-portfolio)

Interactive concept explorer covering: How MCP Works, LLM vs Agent, REST vs MCP, Manual vs MCP, STLC Phases, The Repo, 5 Approaches comparison, API Testing, page vs request fixture, CLI Comparison, LLM Limits, Agent Architecture, Playwright Agents, Agents vs MCP, Visual Regression.
