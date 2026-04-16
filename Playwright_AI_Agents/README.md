# SDET Portfolio — Playwright AI Agents

**Week 3/4 | VWO Login | Playwright Built-in AI Agents + Visual Regression**

> Approach 5 of 6 — sdet-stlc-portfolio by Soma Sai Dinesh Cheviti
> github.com/somasaic/sdet-stlc-portfolio

---

## Quick Results

| Suite | Tests | Status | Time |
|---|---|---|---|
| Visual Regression (TC-VR-01 to TC-VR-03) | 3/3 | ✅ Passing | ~48s |
| Agent-Generated login/ | TBD | 🔄 Run agents via Claude Code | — |

---

## What This Project Demonstrates

This is Approach 5 in a structured SDET portfolio covering the full STLC across progressively advanced execution modes. It introduces two genuinely new capabilities:

**1. Playwright Built-in AI Agents** — planner, generator, and healer running as a chain inside Claude Code. The AI explores the live app, writes the test plan, generates the spec files, and self-repairs failures — all autonomously.

**2. Visual Regression Testing** — Playwright's native `toHaveScreenshot()` captures pixel-level baselines of the login form. Any unintended UI change (button colour, layout shift, missing element) fails the test and produces a diff image showing exactly what changed.

---

## The 5-Approach Progression

| Approach | Project | New skill | Tests |
|---|---|---|---|
| 1 | Block_A_Manual | QA process thinking | — |
| 2 | STLC_MCP_Project | AI agent + JIRA MCP | 13 |
| 3 | STLC_Standard_CLI | POM + CI/CD engineering | 18/18 |
| 4 | Playwright_CLI | API testing + testData.ts | 20/20 |
| **5** | **Playwright_AI_Agents** | **AI agents + visual regression** | **3/3 VR + TBD agent** |

---

## The Three AI Agents — How They Work

Playwright ships three built-in agents. Initialized with:

```bash
npx playwright init-agents --loop=claude
```

This creates `.claude/agents/` with three instruction files Claude Code discovers automatically.

---

### Planner — explores and plans

The planner navigates the live app using browser tools, reads the real DOM, and writes a structured Markdown test plan. It uses the `planner_setup_page` tool which **runs `seed.spec.ts` first** to bootstrap the browser session.

**Input:** `tests/seed.spec.ts` + your prompt
**Output:** `specs/vwo_login_plan.md`

**Prompt to use in Claude Code:**
```
Use the playwright-test-planner agent to explore the VWO login page.
Seed file: tests/seed.spec.ts
Target: app.vwo.com/#/login

Generate a test plan covering:
1. Page load smoke — all elements visible
2. Invalid credentials — error shown
3. Empty form submission — BVA minimum
4. SQL injection edge case

Save to: specs/vwo_login_plan.md
```

---

### Generator — converts plan to tests

The generator reads the Markdown plan, opens the browser via `generator_setup_page` (which also runs `seed.spec.ts` first), navigates to each element mentioned in the plan, **verifies selectors are real** against the live page, and writes TypeScript spec files.

**Input:** `specs/vwo_login_plan.md`
**Output:** `tests/login/*.spec.ts`

**Prompt to use in Claude Code:**
```
Use the playwright-test-generator agent to convert the test plan into tests.

Input: specs/vwo_login_plan.md
Seed: tests/seed.spec.ts
Output: tests/login/

Generate one spec file per scenario. Use getByRole locators only.
```

---

### Healer — fixes failing tests

When tests fail after generation, the healer replays the failing steps, inspects the current DOM, patches the locator or assertion, and re-runs until the test passes. This is self-healing automation.

**Input:** Failing test name + error message
**Output:** Patched, passing test

**Prompt to use in Claude Code:**
```
Use the playwright-test-healer agent to fix this failing test:
tests/login/invalid-credentials.spec.ts

Error: [paste error from terminal]
```

---

## seed.spec.ts — The Most Important File to Understand

`seed.spec.ts` is NOT a regular test. It is the **agent bootstrap file**.

**How it works mechanically:**
- Planner calls `planner_setup_page` tool → runs `seed.spec.ts` first
- Generator calls `generator_setup_page` tool → runs `seed.spec.ts` first
- The seed navigates to the target page and calls `page.pause()`
- `page.pause()` keeps the browser open and hands control to the agent
- The agent now has a live, open browser session to explore

**Why `page.pause()` is critical:** Without it, the browser closes immediately after navigation. The agent would have nothing to explore.

**For VWO login:** No authentication needed. The page is publicly accessible. The seed simply navigates to `/#/login` and confirms the email field is visible before handing control.

```typescript
test('seed', async ({ page }) => {
  await page.goto('/#/login');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('textbox', { name: 'Email address' })
  ).toBeVisible();
  await page.pause();  // ← hands control to agent
});
```

---

## Visual Regression — Key Addon (unique to Approach 5)

**File:** `tests/visual/login_visual.spec.ts`
**Baselines:** `tests/visual/login_visual.spec.ts-snapshots/`

| TC ID | Scenario | Baseline file |
|---|---|---|
| TC-VR-01 | Default page state | `vwo-login-default-chromium-win32.png` |
| TC-VR-02 | After invalid login — error shown | `vwo-login-error-state-chromium-win32.png` |
| TC-VR-03 | Email field filled | `vwo-login-email-filled-chromium-win32.png` |

**Two-phase mechanism:**
- Phase 1 (first run / `--update-snapshots`): creates PNG baselines
- Phase 2 (all runs after): pixel-level comparison against baseline — fails if UI changed

**Why clipping:** VWO has a dynamic animated background that changes every run, causing 65,000+ pixel diffs on full-page screenshots. Clipping to the login form bounding box isolates only the stable form elements.

**What a real regression looks like:** If VWO changes their Sign in button from blue to green, TC-VR-01 fails with a diff image highlighting the button area in red. You review the diff, confirm it is intentional, then run `--update-snapshots` to accept the new baseline.

**Commands:**
```bash
# Create / update baselines
npx playwright test tests/visual/ --project=chromium --update-snapshots

# Run comparison (CI mode)
npx playwright test tests/visual/ --project=chromium
```

---

## Running the Full Agent Loop — Step by Step

```bash
# Step 1 — open Claude Code in this folder
cd Playwright_AI_Agents
claude

# Step 2 — run planner (generates specs/vwo_login_plan.md)
# [type planner prompt in Claude Code — see above]

# Step 3 — run generator (generates tests/login/*.spec.ts)
# [type generator prompt in Claude Code — see above]

# Step 4 — run generated tests
npx playwright test tests/login/ --project=chromium --reporter=list

# Step 5 — heal any failures
# [type healer prompt in Claude Code for each failing test]

# Step 6 — run visual regression
npx playwright test tests/visual/ --project=chromium --reporter=list

# Step 7 — run everything
npx playwright test --project=chromium --reporter=list

# Step 8 — open HTML report
npx playwright show-report
```

---

## Project Structure

```
Playwright_AI_Agents/
├── .claude/
│   └── agents/
│       ├── playwright-test-generator.md   ← generator instructions
│       ├── playwright-test-healer.md      ← healer instructions
│       └── playwright-test-planner.md     ← planner instructions
├── .github/workflows/
│   └── playwright_agents.yml              ← CI pipeline
├── docs/                                  ← STLC phase documentation
│   ├── 01_requirement_analysis.md
│   ├── 02_test_planning.md
│   ├── 03_test_cases.md
│   ├── 04_bug_reports.md
│   └── 05_test_closure.md
├── specs/
│   └── vwo_login_plan.md                  ← human + planner test plan
├── tests/
│   ├── login/                             ← generator output (run agents)
│   ├── visual/
│   │   ├── login_visual.spec.ts           ← 3 visual regression tests ✅
│   │   └── login_visual.spec.ts-snapshots/
│   │       ├── vwo-login-default-chromium-win32.png
│   │       ├── vwo-login-error-state-chromium-win32.png
│   │       └── vwo-login-email-filled-chromium-win32.png
│   └── seed.spec.ts                       ← agent bootstrap (NOT a test)
├── playwright.config.ts                   ← chromium only, timeout 60s
├── tsconfig.json
└── README.md
```

---

## STLC Phase Coverage

| Phase | What was done | Output |
|---|---|---|
| Phase 1 — Requirements | Planner extracts from live DOM. Manual plan written first. | `specs/vwo_login_plan.md` |
| Phase 2 — Test Planning | Agent loop sequence defined. Seed file strategy documented. | `docs/02_test_planning.md` |
| Phase 3 — Test Cases | Plan scenarios + visual regression TC-VR-01/02/03 | `docs/03_test_cases.md` |
| Phase 4 — Automation | Visual regression passing. Generator produces login/ tests. | `tests/visual/` + `tests/login/` |
| Phase 5 — Bug Reporting | Healer-caught failures → KAN-3 via JIRA MCP | JIRA KAN board |
| Phase 6 — Closure | CI green. Baselines committed. HTML artifact on every push. | `playwright_agents.yml` |

---

## Key Concepts New in Approach 5

| Concept | What it means |
|---|---|
| `npx playwright init-agents` | Creates agent instruction files in `.claude/agents/` |
| `planner_setup_page` tool | Runs seed.spec.ts before planner starts exploring |
| `generator_setup_page` tool | Runs seed.spec.ts before generator writes tests |
| `page.pause()` in seed | Keeps browser open — hands session to agent |
| `toHaveScreenshot()` | Pixel-level baseline comparison — visual regression |
| `clip: formBox` | Clips screenshot to form only — excludes dynamic background |
| `--update-snapshots` | Promotes actual screenshots to baselines |
| `test.slow()` | Triples timeout for a specific test |
| `maxDiffPixels` | Tolerance for sub-pixel rendering differences |

---

## Portfolio Progression

```
Block_A_Manual          ← Manual STLC, no automation           ✅
STLC_MCP_Project        ← Playwright MCP + JIRA MCP            ✅
STLC_Standard_CLI       ← POM, 18/18, 3 browsers, CI           ✅
Playwright_CLI          ← UI + API, 20/20, testData.ts          ✅
Playwright_AI_Agents    ← AI agents + visual regression         ✅ ← HERE
Selenium_to_Playwright  ← Migration project                     📋
```
