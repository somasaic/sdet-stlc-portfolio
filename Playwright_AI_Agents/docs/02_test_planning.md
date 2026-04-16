# Phase 2 — Test Planning

**Project:** Playwright_AI_Agents  
**Approach:** 5 of 5 — AI Agents + Visual Regression  
**Target:** https://app.vwo.com/#/login  
**Phase owner:** SDET (agent loop design, seed strategy, CI config)  
**Date:** April 2026

---

## Test Objective

Demonstrate Playwright's built-in AI agent system (planner, generator, healer) applied to the full STLC on VWO login, with Visual Regression Testing as the key addon skill.

This project proves two things that no previous approach in the portfolio demonstrates:
1. Autonomous test generation — AI agents plan, write, and repair tests without the SDET writing spec code
2. Visual regression — pixel-level UI verification that catches regressions functional tests miss

---

## Scope

### In Scope

- VWO Login page at `https://app.vwo.com/#/login`
- Functional test scenarios: smoke, invalid credentials, empty form, edge cases
- Visual regression: 3 baseline scenarios (default state, error state, email-filled state)
- Agent-generated tests via planner → generator → healer loop
- CI/CD pipeline on GitHub Actions (chromium only)
- JIRA bug logging for healer-caught failures (KAN-3)

### Out of Scope

- VWO post-login pages and dashboard (requires valid credentials)
- ReqRes API testing (covered in Playwright_CLI)
- Firefox and WebKit cross-browser testing (covered in STLC_Standard_CLI)
- Performance testing, accessibility testing
- Authentication bypass testing

---

## Test Strategy

### Layer 1 — AI-Generated Functional Tests

**Toolchain:** Planner Agent → Generator Agent → Healer Agent  
**Target:** `tests/login/`  
**Approach:** Autonomous — the SDET provides a prompt, the agent writes the tests

The agent loop:
```
Planner explores live DOM → writes specs/vwo_login_plan.md
Generator reads plan → writes tests/login/*.spec.ts
Healer receives failing test → patches and re-runs
```

**SDET role:** Define the prompt, review agent output, approve or redirect, log healer-caught bugs.

### Layer 2 — Visual Regression Tests

**Toolchain:** Playwright `toHaveScreenshot()` with `clip: boundingBox()`  
**Target:** `tests/visual/login_visual.spec.ts`  
**Approach:** SDET-written — not agent-generated (visual strategy requires deliberate decision about clipping)

Visual regression is the key addon because:
- It catches regressions that functional tests miss (CSS changes, layout shifts, visual breakage)
- It is not covered by any previous project in this portfolio
- 80% of SDET job descriptions at product companies mention visual testing
- The PNG baselines are version-controlled — every change to UI is tracked

### Why chromium only

All test runs use chromium project only. Reasons:
1. AI agents explore one browser session at a time — multi-browser runs add no value for agent exploration
2. Visual regression baselines are OS and browser-specific — chromium on Windows (dev) and chromium on Linux (CI) each have their own baseline set
3. Cross-browser functional testing is already demonstrated in STLC_Standard_CLI (18/18 across 3 browsers)

---

## Entry Criteria

- [x] `npm init playwright@latest` completed — project initialised
- [x] `npx playwright init-agents --loop=claude` completed — agent definitions in `.claude/agents/`
- [x] `seed.spec.ts` written and verified — navigates to `/#/login`, confirms email input visible
- [x] `playwright.config.ts` configured — baseURL, timeout 60s, chromium only
- [x] `specs/vwo_login_plan.md` — manual plan written as starting point for planner agent
- [x] Visual regression tests written in `tests/visual/login_visual.spec.ts`
- [x] Visual baselines created and committed — 3 PNG files in snapshots folder
- [ ] Planner agent run completed and `vwo_login_plan.md` updated by agent
- [ ] Generator agent run completed and `tests/login/*.spec.ts` files produced
- [ ] All agent-generated tests verified to run

---

## Exit Criteria

- [ ] All agent-generated functional tests pass (0 failures after healer)
- [x] All 3 visual regression tests pass — 3/3 ✅
- [x] Visual baselines committed to repository
- [x] CI pipeline (`playwright_agents.yml`) runs successfully
- [ ] Any healer-caught failures logged as KAN-3 in JIRA
- [ ] All 6 STLC phase documents complete

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| VWO changes login page DOM — agent-generated selectors break | Medium | High | Healer agent patches failing selectors automatically |
| VWO animated background causes flaky visual diffs | High | High | `clip: boundingBox()` restricts capture to stable form area only — resolved |
| TC-VR-02 server validation timeout (14-17s) exceeds test timeout | Medium | High | `test.slow()` triples timeout to 180s — resolved |
| Agent generates incorrect locators (not getByRole) | Low | Medium | SDET reviews generator output before committing |
| GitHub Actions on Linux has different font rendering than Windows dev | High | Low | Playwright auto-creates separate OS-tagged baselines: chromium-linux.png |
| Claude Code context window fills during long agent exploration | Medium | Medium | Seed.spec.ts keeps browser alive; agent can re-snapshot if needed |
| `page.pause()` in seed.spec.ts causes CI to hang if run outside agent | Medium | High | seed.spec.ts excluded from CI run — CI runs tests/visual/ and tests/login/ only |

---

## Test Types

| Type | Description | Tool | Location |
|---|---|---|---|
| Smoke | All key elements visible on load | Generator agent | tests/login/smoke.spec.ts |
| Negative | Invalid credentials error states | Generator agent | tests/login/invalid-credentials.spec.ts |
| Boundary | Empty form, partial inputs | Generator agent | tests/login/edge-cases.spec.ts |
| Security edge | SQL injection, long strings | Generator agent | tests/login/edge-cases.spec.ts |
| Visual Regression | Pixel baseline comparison — 3 scenarios | `toHaveScreenshot()` | tests/visual/login_visual.spec.ts |
| Self-healing | Healer fixes broken selectors | Healer agent | Runs against any failing test |

---

## Agent Loop Design

### Seed Test Design Decision

`seed.spec.ts` is not a test — it is a browser bootstrap. The key decision is `page.pause()`:

- **Why it exists:** Before the planner or generator explores the browser, `planner_setup_page` runs `seed.spec.ts` first. Without `page.pause()`, the browser closes immediately after navigation and the agent has nothing to explore.
- **What `page.pause()` does:** Keeps the browser open and hands the live session to the agent. The agent then calls `browser_snapshot`, `browser_click`, `browser_fill` against this session.
- **Risk in CI:** If `seed.spec.ts` is included in the CI test run, `page.pause()` causes CI to hang indefinitely. CI runs only `tests/visual/` and `tests/login/` — never `seed.spec.ts` directly.

### Planner Prompt Strategy

The planner prompt is designed to cover all 5 test scenario categories:
```
Explore app.vwo.com/#/login. Cover:
1. Page load smoke — all elements visible
2. Invalid credentials — error state
3. Empty form — validation
4. Edge cases — SQL injection, long strings
5. Navigation — Forgot Password, Google SSO buttons
Save plan to specs/vwo_login_plan.md using the seed in tests/seed.spec.ts
```

### Generator Prompt Strategy

```
Convert specs/vwo_login_plan.md into Playwright tests.
Output to tests/login/ — one file per scenario group.
Use tests/seed.spec.ts for context.
Use getByRole locators only. No CSS selectors. No XPath.
```

### Healer Prompt Strategy

```
Fix the failing test: tests/login/[filename].spec.ts
Error: [paste full error output including line numbers]
Re-run after each patch until green or confirmed broken.
```

---

## CI Pipeline Design

File: `.github/workflows/playwright_agents.yml`

```
Steps:
1. Checkout repository
2. Setup Node.js (LTS)
3. npm ci (locked dependencies)
4. npx playwright install --with-deps chromium (chromium only — saves ~2 min)
5. Run visual regression tests → npx playwright test tests/visual/
6. Run agent-generated tests → npx playwright test tests/login/ (continue-on-error: true)
7. Upload HTML report artifact (if: always())
8. Upload visual baselines artifact (if: always())
```

**Why `continue-on-error: true` on tests/login/:**
The `tests/login/` folder is populated by the generator agent — it may be empty before the first agent run. If CI runs before agent-generated tests exist, "no tests found" would fail the entire pipeline. `continue-on-error: true` ensures visual tests and reports still run even when login tests don't exist yet.

---

## Visual Regression Strategy

### Baseline Management

1. **Create baselines locally:** `npx playwright test tests/visual/ --update-snapshots`
2. **Commit PNG files:** Push `tests/visual/login_visual.spec.ts-snapshots/` to main branch
3. **CI compares:** Every push runs comparison mode — no `--update-snapshots` flag in CI
4. **Update flow:** If VWO intentionally changes UI → SDET runs `--update-snapshots` locally → reviews diff → commits new baseline

### Threshold Decision

`maxDiffPixels: 200` — chosen because:
- Sub-pixel font rendering can differ by 50-150 pixels between runs on the same machine
- 200 pixels is well above that noise floor
- A real UI regression (button moved, field removed, colour changed) typically affects 1,000+ pixels
- TC-VR-02 uses a higher threshold due to server-side timing variance in error message appearance

### Clipping Strategy

All visual tests use `clip: loginForm.boundingBox()` because VWO's background animation produces 65,000+ pixel diffs per run. Only the login form is stable enough for pixel comparison.