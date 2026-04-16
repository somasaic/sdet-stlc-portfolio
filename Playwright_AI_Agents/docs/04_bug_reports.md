# Phase 5 — Bug Reports

**Project:** Playwright_AI_Agents  
**Approach:** 5 of 5 — AI Agents + Visual Regression  
**Target:** https://app.vwo.com/#/login  
**Phase owner:** Healer Agent (detection) + SDET (JIRA logging via MCP)  
**Date:** April 2026

---

## Bug Logging Process in This Project

Unlike previous projects where bugs were identified manually (Block_A_Manual) or from automated test failures (STLC_Standard_CLI, Playwright_CLI), this project introduces a **healer-caught bug workflow**:

1. Generator agent produces test files in `tests/login/`
2. SDET runs the generated tests
3. **Failures fall into two categories:**
   - Automation bug (wrong locator, timing issue) → Healer agent patches the spec file
   - Application bug (VWO login page actually behaves incorrectly) → SDET logs to JIRA
4. JIRA tickets logged via JIRA MCP (same approach as KAN-1 in STLC_MCP_Project and KAN-2 in Playwright_CLI)

---

## Known Bug — Context from Previous Projects

### KAN-1 — Password field no visibility toggle

**Project:** STLC_Standard_CLI (Week 1b)  
**Relevance to this project:** This bug was first identified in Week 1b. Visual regression in this project can now verify that the missing toggle icon is consistently absent — if VWO adds a visibility toggle in a future deploy, TC-VR-01 will catch the visual change automatically.

**Status:** Open  
**JIRA:** [KAN-1](https://somasaicheviti.atlassian.net/browse/KAN-1)

---

### KAN-2 — POST /api/register returns 200 instead of 201

**Project:** Playwright_CLI (Week 2)  
**Relevance to this project:** Not directly applicable — this project does not test the ReqRes API.  

**Status:** Open  
**JIRA:** [KAN-2](https://somasaicheviti.atlassian.net/browse/KAN-2)

---

## Project-Specific Bugs

### BUG-VR-01 — VWO animated background causes non-deterministic pixel diffs (RESOLVED)

**Type:** Test infrastructure bug — not an application bug  
**Severity:** High (if unresolved, visual tests are completely unreliable)  
**Discovered during:** Phase 2 visual test implementation  
**Status:** RESOLVED — not logged to JIRA (infrastructure issue, not app defect)

**Description:**  
Full-page screenshots of VWO login page showed 65,000–69,000 pixel differences between runs taken seconds apart. The VWO login page has a dynamic CSS animated background that renders at different animation frames on each page load.

**Evidence:**
```
Run 1 vs Run 2 diff: 65,713 pixels (ratio 0.08)
Run 2 vs Run 3 diff: 48,894 pixels (ratio 0.06)
```

**Root cause:** CSS background animation not deterministic per render. `animations: 'disabled'` only disables CSS transition animations, not all dynamic rendering.

**Resolution:**
```typescript
const loginForm = page.locator('form').first();
const formBox = await loginForm.boundingBox();
await expect(page).toHaveScreenshot('vwo-login-default.png', {
  clip: formBox ?? undefined,  // ← clips to form bounding box only
  animations: 'disabled',
  maxDiffPixels: 200,
});
```

Clipping to the form bounding box excludes the animated background entirely. Diffs dropped from 65,000+ to under 200 pixels consistently.

**Learning for SDET interviews:** "When implementing visual regression on pages with dynamic content, always identify stable elements and clip screenshots to those regions. Committing full-page baselines on animated pages is a common mistake that produces permanently flaky tests."

---

### BUG-VR-02 — TC-VR-02 exceeded default 30s timeout (RESOLVED)

**Type:** Test infrastructure bug  
**Severity:** Medium  
**Discovered during:** First comparison run of visual tests  
**Status:** RESOLVED — not logged to JIRA

**Description:**  
TC-VR-02 waits 15 seconds for VWO's server-side validation response after clicking Sign in with invalid credentials. The default Playwright test timeout of 30 seconds was exceeded when combined with navigation time (~3s), interaction time (~1s), and the 15s wait.

```
Error: Test timeout of 30000ms exceeded.
at await page.waitForTimeout(15000)
```

**Resolution:**
```typescript
test('TC-VR-02: Error state...', async ({ page }) => {
  test.slow(); // ← triples timeout to 180s (60s global × 3)
  // ...
  await page.waitForTimeout(15000);
  // ...
});
```

`test.slow()` is the correct Playwright syntax for extending timeout on a per-test basis. Setting the third argument to `test()` as `{ timeout: 60000 }` causes a TypeScript error — `test.slow()` inside the test body is the official approach.

---

## KAN-3 — Healer-Caught Failures (Placeholder)

**Status:** To be logged after generator agent run and subsequent healer cycle

When the generator agent produces `tests/login/*.spec.ts` files and they are run:
- Any failures that the healer agent **cannot fix** (because VWO's actual application is broken, not the test) are escalated as application bugs
- These are logged as KAN-3 in JIRA via JIRA MCP following the same process as KAN-1 and KAN-2

**Template for KAN-3:**

```
Title: [TC-ID] — [Brief description of failure]
Type: Bug
Project: KAN
Labels: playwright-ai-agents, healer-caught, week3-4

Description:
- Endpoint/URL: https://app.vwo.com/#/login
- Test file: tests/login/[filename].spec.ts
- Healer verdict: Could not patch — application behaviour is broken
- Steps: [healer replay steps]
- Expected: [what the test asserts]
- Actual: [what the browser showed]
- Healer log: [paste healer output]
```

---

## Visual Regression as a Bug Detection Mechanism

Visual regression tests act as a passive bug detection layer. If VWO deploys a CSS change to their login page, TC-VR-01 will fail on the next CI run with:

```
Error: expect(page).toHaveScreenshot(expected) failed
X pixels (ratio Y) are different.

Expected: vwo-login-default-chromium-win32.png
Received: [actual screenshot]
Diff:     [diff image with changed pixels highlighted in red]
```

**When this happens, the SDET must decide:**
1. Is this an **intentional VWO UI change**? → Run `--update-snapshots`, review diff, commit new baseline
2. Is this an **unintentional regression**? → Log as a bug (not to JIRA since VWO is a practice target — but document as a simulated P1 visual regression)

This decision-making process is what product company SDETs do on every sprint — distinguishing intentional design changes from unintentional visual regressions.

---

## Bug Summary Table

| Bug ID | Type | Severity | Status | Resolution |
|---|---|---|---|---|
| BUG-VR-01 | Test infra — animated background | High | ✅ Resolved | clip: boundingBox() |
| BUG-VR-02 | Test infra — timeout | Medium | ✅ Resolved | test.slow() |
| KAN-1 | App bug — no password toggle | Medium | Open | From Week 1b |
| KAN-2 | App bug — REST 200 vs 201 | Low | Open | From Week 2 |
| KAN-3 | App bug — healer-caught | TBD | Pending agent run | To be logged via JIRA MCP |