# CI Failure Analysis — Block A: Manual STLC Documentation

## Approach Overview

| Field | Detail |
|---|---|
| **Approach** | 01 — Manual STLC Documentation |
| **Folder** | `Block_A_Manual/` |
| **CI Job** | None — documentation only |
| **CI Status** | Not applicable (always "green" by absence) |
| **Test Count** | 0 automated tests |
| **Scope** | 6 STLC phase documents for VWO Login page |

---

## Why There Is No CI Job

The GitHub Actions workflow explicitly excludes this project:

```yaml
# Block_A_Manual is documentation only — no CI job.
```

Manual STLC documentation consists of 6 markdown files:

| File | STLC Phase |
|---|---|
| `01_Requirement_Analysis.md` | Requirements gathering |
| `02_Test_Plan.md` | Test strategy and scope |
| `03_Test_Cases.md` | 8 structured test cases |
| `04_Bug_Report.md` | Defect: weak password (KAN-27) |
| `05_Severity_Priority.md` | Bug classification matrix |
| `06_Regression_Retesting.md` | Regression scope after fix |

There is no executable code — no test runner, no package.json, no Playwright config. CI infrastructure cannot validate documentation for correctness; it can only lint markdown syntax. That level of CI is not meaningful for a portfolio demonstration.

---

## CI Failures in This Approach: None

No CI failures occurred in this project because there is no CI job to fail. However, the concept of "failure" in manual STLC takes a different form — human error, stale documentation, missed test coverage, and subjective interpretation. These are explored in the limitations section below.

---

## What Manual STLC Provides That Automation Cannot

### Requirement Analysis
Manual review of the VWO login page identified 43 interactive elements from a live DOM audit: 9 inputs, 20 buttons, 11 links, 3 checkboxes. This human-driven discovery formed the scope baseline for all 4 automated approaches. No automation tool was asked to "find what to test" — the manual analyst did that first.

### Test Case Design Thinking
`03_Test_Cases.md` contains 8 test cases covering:
- Positive: valid login flow
- Negative: wrong password, empty fields, invalid email format
- Edge: SQL injection, 500-character email string, whitespace-only input
- UX: Remember Me, Forgot Password, password toggle, Google OAuth

The edge cases (SQL injection, long strings, whitespace) were identified through manual **boundary value analysis** and **exploratory testing intuition** — not from requirements. An AI agent would not produce these without being explicitly asked.

### Defect Discovery
`04_Bug_Report.md` documents KAN-27: VWO does not enforce password strength on the client side. A user can type "abc" as a password — the Sign In button remains enabled and no validation error appears. This is a real security gap found by manual observation, not by a test assertion.

---

## Defects and Limitations of the Manual Approach

### 1. Documentation Becomes Stale
- **Problem:** VWO's login page DOM changes over time. Locators, labels, and button text referenced in `03_Test_Cases.md` can become outdated without any automated mechanism to detect it.
- **Risk:** A tester follows a test case that references a UI element that no longer exists or has moved. The test appears to "pass" (the tester checks a box) but actually verifies nothing.
- **Mitigation:** Schedule quarterly manual reviews of all test case documents against the live application.

### 2. Human Error Rate
- **Problem:** Manual test execution is error-prone. A tester under time pressure may skip steps, misread expected results, or mark a failing test as passing.
- **Risk:** Regression defects ship undetected.
- **Mitigation:** Pair review of test execution results; escalate critical test cases to automation.

### 3. No Repeatability
- **Problem:** Running the same manual test twice requires the same human effort twice. There is no "re-run" button.
- **Risk:** Teams deprioritize regression testing under release pressure because it costs the same effort as the first run.
- **Mitigation:** Convert the high-priority test cases (TC-01, TC-02, TC-04) to automated specs first.

### 4. No Headless / Parallel Execution
- **Problem:** Manual testing runs in one browser, one session, by one tester.
- **Risk:** Cross-browser bugs (VWO looks different in Firefox vs Chrome for certain Angular rendering paths) go undetected.
- **Mitigation:** Automated projects in this portfolio (Playwright_CLI, STLC_Standard_CLI) run chromium + firefox + webkit locally.

### 5. No Artifact Retention
- **Problem:** Manual test execution leaves no machine-readable artifact — no trace file, no screenshot, no HTML report.
- **Risk:** When a defect is raised, there is no automated reproduction evidence. The tester's notes are the only record.
- **Mitigation:** Playwright's `trace: 'on-first-retry'` and `screenshot: 'only-on-failure'` settings in automated projects address this gap.

---

## Benefits of the Manual Approach

| Benefit | Explanation |
|---|---|
| **Foundation for all automation** | Every automated test in this portfolio traces back to a test case defined here. Without this phase, automation has no requirements anchor. |
| **Finds what automation cannot see** | The KAN-27 weak-password bug was found by observation, not by assertion. A Playwright test would not check password strength requirements unless explicitly coded to do so. |
| **No infrastructure cost** | Zero CI minutes consumed, zero Playwright browser install time, zero npm dependencies. |
| **Readable by non-technical stakeholders** | Product managers, business analysts, and QA leads can review test cases without understanding TypeScript. |
| **Always "green"** | There are no assertions to fail. This is a feature, not a limitation — in the CI pipeline, the absence of this project's job means it never contributes to a red build. |
| **Forces structured thinking** | Writing a test plan before writing tests prevents scope creep, duplicate coverage, and missed risk areas. |

---

## Key Lessons from This Approach

1. **Manual STLC is not inferior to automation — it is the prerequisite.** Every automated test in projects 2–5 is a translation of a test case defined here. Without `03_Test_Cases.md`, the automated specs would have no clear intent.

2. **Bug KAN-27 originated here.** The weak password defect was found in `04_Bug_Report.md` and then cross-referenced into JIRA (KAN-27) via the MCP project. Manual discovery + automated JIRA integration is a complete workflow.

3. **Documentation rot is the equivalent of CI failure for manual STLC.** A red CI badge means tests are failing. Stale documentation means tests are passing when they shouldn't be. Both indicate the test suite no longer reflects reality.

4. **The 6-phase STLC structure is portable.** The folder structure (`01_Requirement_Analysis` → `06_Regression_Retesting`) is replicated exactly in `STLC_MCP_Project`, demonstrating that the manual phase and the automated phase share the same lifecycle model.
