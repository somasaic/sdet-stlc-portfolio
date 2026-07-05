# Concepts & Topics — Block A: Manual STLC

> One file = complete understanding of every concept used in this approach.
> Format per topic: What it is → Where in repo → Why used → Alternatives.

---

## 1. STLC — Software Testing Life Cycle

**What it is:** A structured sequence of phases that a QA team follows from receiving requirements to closing the test cycle. Each phase has a defined input, output, and exit criterion.

**Where in repo:**
```
Block_A_Manual/
  01_Requirement_Analysis.md   ← Phase 1
  02_Test_Plan.md              ← Phase 2
  03_Test_Cases.md             ← Phase 3
  04_Bug_Report.md             ← Phase 4
  05_Severity_Priority.md      ← Phase 4 (classification)
  06_Regression_Retesting.md   ← Phase 5-6
```

**Why used:** Every automated test in the portfolio (Projects 2–5) is derived from this phase structure. It proves that automation is the *execution* of a thought-out test strategy — not the replacement of it.

**The 6 phases:**
| Phase | Name | Output |
|---|---|---|
| 1 | Requirement Analysis | Testable requirements list + RTM + clarification queries |
| 2 | Test Planning | Test Plan document (scope, risks, approach, entry/exit criteria) |
| 3 | Test Case Design | Test cases in table format (ID, steps, expected, actual, status) |
| 4 | Test Execution | Executed test cases + bug reports |
| 5 | Defect Reporting | Bug reports with severity/priority, lifecycle tracking |
| 6 | Test Closure | Closure report, regression sign-off, metrics |

**Alternatives:** Agile teams often collapse phases 1–3 into sprint planning, but the underlying activities (clarify requirements, define scope, write test cases) always happen — just more informally.

---

## 2. Requirement Analysis

**What it is:** The first STLC phase where QA reads the PRD (Product Requirements Document) and identifies what IS testable, what is NOT testable, and what needs clarification before testing can begin.

**Where in repo:** `Block_A_Manual/01_Requirement_Analysis.md`

**Key outputs produced:**
- **Testable requirements table** — columns: Requirement | Testable? | Reason
- **Clarification list** — questions to developers/BAs before test design starts

**Example from this repo:**
```
| Req | Testable? | Reason |
| Email+password login | ✅ Yes | Can verify valid/invalid combinations |
| 99.9% uptime SLA | ❌ No | Infrastructure concern — not UI scope |
| SSO/SAML integration | ⚠️ Partial | Needs enterprise account access |
```

**Why used:** Without this phase, test cases are written against assumptions — not verified requirements. VWO's SSO feature being marked as "partial" (not "yes") prevented wasted test case design for a feature we couldn't access.

**Alternatives:** Some teams use user story mapping (Agile) or use-case analysis (waterfall) instead of PRD analysis. The output (testable item list) is the same regardless of method.

---

## 3. RTM — Requirements Traceability Matrix

**What it is:** A matrix that maps every requirement to the test case(s) that verify it. Ensures no requirement is untested and no test case exists without a requirement.

**Where in repo:** Implied in `01_Requirement_Analysis.md` (testable requirements table) and explicit in TC IDs in `03_Test_Cases.md` (TCD_LOGIN_UI01 → TCD_LOGIN_UI05 trace back to requirements 1–6).

**RTM structure:**
```
Requirement ID | Requirement Description | Test Case ID(s) | Status
REQ-01         | Email + password login  | TCD_LOGIN_UI04  | Pass
REQ-02         | Field validation        | TCD_LOGIN_UI01  | Fail
```

**Why used:** RTM answers the coverage question: "If requirement 3 changes, which test cases need updating?" It also proves to a release manager that every requirement has been tested before sign-off.

**Alternatives:** In Agile, acceptance criteria on user stories serve as lightweight RTM. Tools like Jira X-ray, Zephyr, or TestRail maintain digital RTMs automatically.

---

## 4. Test Planning

**What it is:** The phase where QA defines the scope boundary — what will be tested, what will not, what tools will be used, what risks exist, and what defines "done" (entry/exit criteria).

**Where in repo:** `Block_A_Manual/02_Test_Plan.md`

**Key sections in this file:**
- **In Scope** — UI behaviour, valid/invalid login flows, empty field submission
- **Out of Scope** — performance testing, security/pen testing, GDPR compliance, SSO
- **Test Approach** — Playwright + TypeScript, functional UI testing, Chrome/Firefox/Safari
- **Risk Register** — 3 identified risks with impact + mitigation
- **Entry Criteria** — preconditions before testing starts
- **Exit Criteria** — conditions that signal testing is complete

**Why used:** Without a test plan, QA scope creeps (testers start testing everything) or shrinks (testers miss important areas). The Out of Scope section in this repo explicitly excluded performance and security testing — which prevented wasted effort and set correct stakeholder expectations.

**Alternatives:** In Agile sprints, a test plan is often replaced by a "Definition of Done" with testing acceptance criteria. Large enterprises use IEEE 829 standard test plan templates.

---

## 5. Test Strategy

**What it is:** The approach chosen for testing — which testing types, techniques, tools, and environments. A subset of the test plan focused on "how" rather than "what."

**Where in repo:** `Block_A_Manual/02_Test_Plan.md` → "Test Approach" section

**Strategy defined in this repo:**
```
Tool: Playwright + TypeScript
Type: Functional UI Testing
Environments: Chrome, Firefox, Safari — Windows + MacOS
Test Data: Separate testData.ts (valid + invalid credential sets)
Execution: Local + GitHub Actions CI
```

**Why used:** A defined strategy prevents ad-hoc testing. Knowing "functional UI testing" as the strategy means exploratory or performance testing is explicitly out of scope — testers don't drift.

**Alternatives:**
- **Risk-based testing** — prioritise test cases by risk level (test high-risk areas first)
- **Exploratory testing** — no scripted cases, testers use knowledge and intuition
- **Shift-left testing** — test requirements before code is written (unit + integration tests)

---

## 6. Test Case Design

**What it is:** Converting requirements into structured, executable test specifications. Each test case has: ID, title, preconditions, steps, test data, expected result, actual result, and pass/fail status.

**Where in repo:** `Block_A_Manual/03_Test_Cases.md`

**Test case format used:**
```
ID: TCD_LOGIN_UI01
Feature: Login — UI Behaviour
Title: Verify email field accepts valid email format only
Precondition: Browser open, VWO login page loaded
Steps: 1. Navigate... 2. Click email field... 3. Type email...
Test Data: Valid: testuser@gmail.com | Invalid: testuser, test@.com
Expected Result: Valid accepted. Invalid format shows inline error.
Actual Result: (fill after execution)
Status: Pass / Fail
```

**Core design rule from this repo:** **One behaviour = one test case = one clear pass/fail status.** Combining multiple behaviours (e.g., "test both email and password validation in one test") makes the status ambiguous.

**Why used:** Structured test cases ensure consistent execution — any tester (not just the original author) can execute the test and report accurately.

**Alternatives:**
- Gherkin/BDD format (Given/When/Then) — used with Cucumber, more readable for non-technical stakeholders
- Checklists — informal, faster to write, used in exploratory testing sessions
- Decision tables — used for complex conditional logic (multiple conditions → multiple outcomes)

---

## 7. Test Case Design Techniques

### 7a. Equivalence Partitioning (EP)

**What it is:** Divides input data into groups (partitions) where all values in a group are expected to produce the same behaviour. Test one value per partition rather than every possible value.

**Where used in this repo:** `03_Test_Cases.md` — email field testing uses EP implicitly:
- Valid partition: `testuser@gmail.com` (represents all valid emails)
- Invalid partition: `testuser`, `test@.com` (represents all invalid formats)

**Why used:** Testing every possible email string is impossible. EP reduces the test count while maintaining coverage.

**Alternatives:** Random testing (no technique — just pick values), exhaustive testing (test everything — impractical).

### 7b. Boundary Value Analysis (BVA)

**What it is:** Tests at the boundaries between partitions — where bugs most commonly occur. For a valid range, test: minimum - 1, minimum, minimum + 1, maximum - 1, maximum, maximum + 1.

**Where used in this repo:** `Playwright_CLI/tests/ui/vwo_login.spec.ts` line 72:
```typescript
test('TC-UI-08: 500-character string in email — handled gracefully', async () => {
  const longEmail = 'a'.repeat(500);
```
500 characters is a boundary test — the upper edge of a reasonable input length.

**Why used:** Bugs cluster at boundaries. A field that accepts "up to 254 characters" often fails at exactly 255 — not at 100 or 1000.

### 7c. Exploratory Testing

**What it is:** Simultaneous test design and execution — the tester learns the application, designs tests, and executes them in real time without pre-written cases.

**Where used in this repo:** The KAN-27 bug (VWO accepts weak passwords) was found through exploratory observation — no test case was written that said "check password strength validation." A manual tester noticed the gap while using the application.

**Why used:** Scripted test cases can only find bugs in scenarios the test author predicted. Exploratory testing finds the bugs that weren't anticipated.

---

## 8. Bug Report

**What it is:** A document that enables any developer to reproduce a defect without asking questions. Contains environment, reproduction steps, expected vs actual result, and severity/priority classification.

**Where in repo:** `Block_A_Manual/04_Bug_Report.md`

**Bug found in this project:** BUG_Login_PWD001 — VWO accepts weak passwords (`abc`, `123456`) without any validation error. Logged as KAN-27 in JIRA in the MCP project.

**7 mandatory fields:**
| Field | Purpose |
|---|---|
| Bug ID | Unique reference for tracking and linking |
| Title | One line — what broke, not how |
| Environment | Browser + OS + URL — reproducibility context |
| Steps to Reproduce | Exact steps anyone can follow |
| Expected Result | What should have happened |
| Actual Result | What actually happened |
| Severity + Priority | Impact and urgency — set independently |

**Why used:** An incomplete bug report wastes developer time. A developer who receives "login is broken" will spend time reproducing the bug before they can fix it. A complete bug report = zero clarification meetings.

**Alternatives:** In JIRA + Agile, bug reports are filed as "Bug" issue type with templates. Tools like TestRail generate bug reports linked to failing test cases automatically.

---

## 9. Severity vs Priority

**What it is:** Two independent classifications for every bug. Severity = impact on system functionality. Priority = urgency of the fix.

**Where in repo:** `Block_A_Manual/05_Severity_Priority.md`

**The critical distinction:**
```
High Severity + High Priority:
  → Login page completely broken for all users
  → Fix immediately

Low Severity + High Priority:
  → VWO logo misaligned on the public login page homepage
  → No functional impact but millions of users see it daily

High Severity + Low Priority:
  → Admin panel crashes when you enter a 10,000-character string
  → Serious bug but affects 2 internal admin users who know not to do this
```

**Why this matters in interviews:** Interviewers test whether you know these are separate axes. A QA who says "High severity means fix first" fails the question — priority determines fix order, not severity.

**Severity levels:** Critical → High → Medium → Low
**Priority levels:** High → Medium → Low

---

## 10. Bug Lifecycle

**What it is:** The states a bug moves through from creation to closure in a defect tracking system (JIRA, Azure DevOps, etc.).

**Where in repo:** `Block_A_Manual/04_Bug_Report.md` → "Bug Lifecycle in JIRA" section

**Lifecycle documented:**
```
New → Open → Assigned → In Progress → Fixed → Retest → Closed
                                                    ↓
                                                 Reopen (if fix failed)
```

**Why used:** Lifecycle tracking ensures no bug is silently dropped. A bug in "Fixed" state with no QA retest is still an unverified bug.

**Alternatives:** Lightweight teams use GitHub Issues (no explicit lifecycle, just open/closed). Enterprise teams use JIRA workflows with mandatory field validation at each transition.

---

## 11. Regression Testing

**What it is:** Re-executing a subset of existing test cases after a bug fix to confirm the fix works and did not break anything else.

**Where in repo:** `Block_A_Manual/06_Regression_Retesting.md`

**Regression scope for BUG_Login_PWD001 fix:**
- Re-test the password field with the same weak passwords (`abc`, `123456`)
- Re-test valid login flow to confirm the fix didn't accidentally break correct credentials
- Re-test Forgot Password to confirm unrelated flows still work

**Why used:** Developers fix one bug and inadvertently break another. Regression testing catches this. The scope is targeted (not full re-test) to stay efficient.

**Alternatives:** Automated regression suites (like the Playwright tests in Projects 2–5) replace manual regression entirely. This is the primary argument for investing in test automation.

---

## 12. Entry and Exit Criteria

**What it is:** Formal conditions that must be met before testing begins (entry) and conditions that signal testing is complete (exit).

**Where in repo:** `Block_A_Manual/02_Test_Plan.md` → last section

**Entry criteria in this repo:**
- Login page accessible at app.vwo.com/#/login
- Valid test credentials available
- Playwright environment configured

**Exit criteria in this repo:**
- All in-scope test cases executed
- All Critical and High bugs logged
- Pass rate above 90%
- Test closure report signed off

**Why used:** Without exit criteria, testing never officially ends — teams test indefinitely or stop arbitrarily. Exit criteria give a shared definition of "done" that all stakeholders agree to before testing starts.

---

## 13. Test Closure

**What it is:** The final STLC phase — summarizing test results, archiving artifacts, and documenting lessons learned.

**Where in repo:** `Block_A_Manual/06_Regression_Retesting.md` (covers the retesting that precedes closure)

**Closure activities:**
- Final pass/fail count
- Defect summary (open/closed/deferred bugs)
- Coverage report against RTM
- Lessons learned for the next cycle
- Sign-off from QA lead and project manager

**Why used:** Closure creates an artifact that explains the test effort — used for future projects, audits, and sprint retrospectives.

---

## Quick Reference — All Concepts at a Glance

| Concept | File | Output |
|---|---|---|
| STLC phases | All 6 files | Complete test lifecycle |
| Requirement Analysis | `01_Requirement_Analysis.md` | Testable req list + clarification queries |
| RTM | `01_Requirement_Analysis.md` + `03_Test_Cases.md` | Requirement → TC traceability |
| Test Planning | `02_Test_Plan.md` | Scope, risks, approach, entry/exit criteria |
| Test Strategy | `02_Test_Plan.md` | Tool, type, environments |
| Test Case Design | `03_Test_Cases.md` | Structured test cases |
| EP + BVA | `03_Test_Cases.md` | Test data selection techniques |
| Bug Report | `04_Bug_Report.md` | KAN-27 bug documentation |
| Severity vs Priority | `05_Severity_Priority.md` | Bug classification matrix |
| Bug Lifecycle | `04_Bug_Report.md` | New → Open → Closed workflow |
| Regression Testing | `06_Regression_Retesting.md` | Post-fix re-execution scope |
| Entry/Exit Criteria | `02_Test_Plan.md` | Definition of done |
