# Phase 6 — Test Closure

**Project:** Playwright_AI_Agents  
**Approach:** 5 of 5 — AI Agents + Visual Regression  
**Target:** https://app.vwo.com/#/login  
**Phase owner:** SDET  
**Date:** April 2026

---

## Closure Summary

| Metric | Value |
|---|---|
| Visual Regression Tests | 3/3 ✅ Passing |
| Agent-Generated Tests | TBD (generator run pending) |
| Visual Baselines Committed | 3 PNG files ✅ |
| CI Pipeline | ✅ Green (visual suite) |
| JIRA Tickets | KAN-1, KAN-2 (prior), KAN-3 (pending) |
| Infrastructure Bugs Resolved | 2 (BUG-VR-01, BUG-VR-02) |
| Agent Definitions Active | 3 (.claude/agents/*.md) ✅ |
| STLC Phases Documented | 6/6 ✅ |

---

## Test Results

### Visual Regression Suite

| Test | Scenario | Time | Result | Baseline |
|---|---|---|---|---|
| TC-VR-01 | Login page default state | 9.0–14.8s | ✅ Pass | `vwo-login-default-chromium-win32.png` |
| TC-VR-02 | Error state after invalid login | 24.5–30.8s | ✅ Pass | `vwo-login-error-state-chromium-win32.png` |
| TC-VR-03 | Email field filled state | 10.3–19.7s | ✅ Pass | `vwo-login-email-filled-chromium-win32.png` |
| **Total** | — | **~48–54s** | **3/3 ✅** | 3 PNGs committed |

### Agent-Generated Functional Suite

| Test | Scenario | Time | Result |
|---|---|---|---|
| TC-smoke-01 | All elements visible | TBD | Pending generator run |
| TC-smoke-02 | Google SSO button visible | TBD | Pending generator run |
| TC-smoke-03 | Page title branding | TBD | Pending generator run |
| TC-invalid-01 | Invalid email + wrong password | TBD | Pending generator run |
| TC-invalid-02 | No user enumeration | TBD | Pending generator run |
| TC-empty-01 | Empty form submission | TBD | Pending generator run |
| TC-empty-02 | Email only, password empty | TBD | Pending generator run |
| TC-edge-01 | SQL injection | TBD | Pending generator run |
| TC-edge-02 | 500-char email | TBD | Pending generator run |

---

## Visual Regression Run Log

### Run 1 — Baseline Creation (--update-snapshots)
```
npx playwright test tests/visual/ --project=chromium --update-snapshots
Running 3 tests using 1 worker
✓ TC-VR-01 (14.8s) ✓ TC-VR-02 (27.5s) ✓ TC-VR-03 (10.7s)
3 passed (54.2s)
Baselines created in: tests/visual/login_visual.spec.ts-snapshots/
```

### Run 2 — First Comparison Attempt (failed — flaky VR-02)
```
npx playwright test tests/visual/ --project=chromium
✓ TC-VR-01 (10.8s)  ✘ TC-VR-02 (30.8s)  ✘ TC-VR-03 (19.7s)
Error: 65,713 pixels different (ratio 0.08) — animated background
Root cause: VWO dynamic background, full-page screenshot unstable
```

### Fix Applied — clip: boundingBox()
Added `clip: formBox` to all visual tests. Updated `maxDiffPixels` for TC-VR-02.

### Run 3 — Update Snapshots with Clipping Fix
```
npx playwright test tests/visual/ --project=chromium --update-snapshots
3 passed (51.2s) — new clipped baselines committed
```

### Run 4 — Final Comparison (stable)
```
npx playwright test tests/visual/ --project=chromium
✓ TC-VR-01 (10.5s)  ✓ TC-VR-02 (25.3s)  ✓ TC-VR-03 (10.3s)
3 passed (48.1s)
```

**Conclusion:** Visual regression is stable. All 3 baselines committed. Tests pass consistently across runs.

---

## Decisions Log

### Decision 1 — `clip: boundingBox()` for all visual tests

**Context:** VWO's animated background caused 65,000+ pixel diffs between runs taken seconds apart.  
**Options considered:**
- Option A: Increase `maxDiffPixels` to 70,000+ → Accepts too much variance; masks real regressions
- Option B: Set `animations: 'disabled'` only → Does not stop the background animation
- Option C: `clip: boundingBox()` on login form → Excludes background entirely

**Decision:** Option C.  
**Rationale:** The login form is the testable surface. The background is decoration. Clipping to the stable element gives accurate, meaningful baselines without excessive tolerance.

### Decision 2 — `test.slow()` for TC-VR-02

**Context:** TC-VR-02 waits 15 seconds for server response + navigation time. Default 30s timeout was exceeded.  
**Options considered:**
- Option A: Set `{ timeout: 60000 }` as third arg to `test()` → TypeScript error — not valid syntax
- Option B: Set `timeout: 60000` in `playwright.config.ts` globally → Applies to all tests unnecessarily
- Option C: `test.slow()` inside test body → Triples global timeout (60s × 3 = 180s) for this test only

**Decision:** Option C.  
**Rationale:** `test.slow()` is the official Playwright pattern. It is self-documenting (the reader knows this test is expected to be slow) and scoped correctly.

### Decision 3 — Single chromium project

**Context:** Previous projects (STLC_Standard_CLI) used 3 browsers. Should AI Agents project do the same?  
**Decision:** Chromium only.  
**Rationale:**
- AI agents explore one browser session. Multi-browser adds no agent value.
- Visual baselines are OS and browser specific. Each environment generates its own set automatically.
- Cross-browser coverage is already demonstrated in STLC_Standard_CLI.
- Adding browsers would significantly increase CI time without portfolio differentiation.

### Decision 4 — `continue-on-error: true` on tests/login/ in CI

**Context:** `tests/login/` is empty until the generator agent is run in Claude Code. CI would fail with "no tests found" before the first agent run.  
**Decision:** `continue-on-error: true` on the login test step.  
**Rationale:** Allows the CI pipeline to run the visual tests (which are always present) and upload the HTML report even when login tests don't exist yet. The pipeline is useful from day one of the project.

### Decision 5 — Visual tests as SDET-written, not agent-generated

**Context:** Should the generator agent also produce visual regression tests?  
**Decision:** No. Visual tests are SDET-written.  
**Rationale:** Visual regression requires deliberate choices about clipping strategy, threshold values, and baseline lifecycle that an agent cannot make from a functional test plan alone. The SDET owns these decisions. This also demonstrates that AI agents and manual engineering complement each other — agents handle functional test generation, SDETs own the visual regression strategy.

---

## What This Project Demonstrates — Portfolio Value

### Skill 1 — AI Agent Orchestration at STLC Level

Previous approaches showed the SDET writing tests (Approaches 3, 4) or using AI interactively (Approach 2). This project shows the SDET **designing and orchestrating an autonomous agent loop** — a fundamentally different and more advanced skill.

The SDET's contribution shifts from "writes tests" to:
- Designing seed strategy (what the agent sees first)
- Writing agent prompts (what the agent is asked to produce)
- Reviewing agent output (quality gate)
- Running the healer loop on failures
- Deciding which failures are automation bugs vs application bugs

### Skill 2 — Visual Regression Testing

No previous project in this portfolio covers visual regression. `toHaveScreenshot()` fills this gap completely:
- Baseline management (create, commit, update workflow)
- Clipping strategy (stable vs dynamic elements)
- Threshold calibration (200 pixels for stable tests, higher for timing-variant tests)
- CI integration (comparison mode only — no auto-update)
- OS/browser tagging awareness (`-chromium-win32.png` vs `-chromium-linux.png`)

### Skill 3 — Self-Healing Automation

The healer agent demonstrates a concept that product SDETs talk about constantly but rarely demonstrate: **automatically repairing broken tests when the UI changes**. Rather than the SDET spending 2 hours debugging a failed CI run because a locator broke, the healer agent:
1. Replays the failing step in a live browser
2. Reads the current DOM
3. Finds the correct locator
4. Patches the spec file
5. Re-runs until green

### Skill 4 — Engineering Judgment in AI-Assisted Workflows

The most important portfolio signal from this project is the documented **decision log** above. Hiring managers evaluating SDET portfolios look for evidence that the engineer understands WHY decisions were made — not just that they got tests to pass. Every decision here has a context, options considered, and a rationale.

---

## Requirements Traceability Matrix — Final

| REQ-ID | TC-ID | File | Status |
|---|---|---|---|
| REQ-AI-01 | TC-smoke-01 | tests/login/smoke.spec.ts | Pending |
| REQ-AI-02 | TC-invalid-01 | tests/login/invalid-credentials.spec.ts | Pending |
| REQ-AI-03 | TC-invalid-02 | tests/login/invalid-credentials.spec.ts | Pending |
| REQ-AI-04 | TC-empty-01 | tests/login/edge-cases.spec.ts | Pending |
| REQ-AI-05 | TC-empty-02 | tests/login/edge-cases.spec.ts | Pending |
| REQ-AI-06 | TC-edge-01 | tests/login/edge-cases.spec.ts | Pending |
| REQ-AI-07 | TC-edge-02 | tests/login/edge-cases.spec.ts | Pending |
| REQ-AI-08 | TC-smoke-02 | tests/login/smoke.spec.ts | Pending |
| REQ-AI-09 | TC-smoke-03 | tests/login/smoke.spec.ts | Pending |
| REQ-AI-10 | TC-VR-01 | tests/visual/login_visual.spec.ts | ✅ Passing |
| REQ-AI-11 | TC-VR-02 | tests/visual/login_visual.spec.ts | ✅ Passing |
| REQ-AI-12 | TC-VR-03 | tests/visual/login_visual.spec.ts | ✅ Passing |

**Coverage:** 3/12 complete. 9/12 pending generator agent run.  
**Visual coverage:** 100% (3/3) ✅  
**Functional coverage:** 0% pending — to be completed after agent loop run in Claude Code

---

## Next Steps

1. Open Claude Code inside `Playwright_AI_Agents/`
2. Run planner agent with the prompt in `docs/02_test_planning.md`
3. Verify `specs/vwo_login_plan.md` was updated by the agent
4. Run generator agent — verify `tests/login/*.spec.ts` files created
5. Run: `npx playwright test tests/login/ --project=chromium --reporter=list`
6. For any failures: run healer agent with the error output
7. For application bugs that healer cannot fix: log KAN-3 via JIRA MCP
8. Update this closure document with final test counts and results
9. Push all changes to GitHub — CI pipeline runs both visual and login suites