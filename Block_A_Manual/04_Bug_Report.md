# Phase 4 — Defect Reporting

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Manual Bug Reporting  

---

## What is Defect Reporting?

When a test case fails, the QA engineer logs a bug report — a precise document that any developer can pick up and reproduce without asking questions. A good bug report has everything needed: environment, steps, expected vs actual result, and severity/priority classification.

---

## Bug Report: BUG_Login_PWD001

| Field | Detail |
|---|---|
| **Bug ID** | BUG_Login_PWD001 |
| **Title** | System accepting weak passwords — input allowed even when strength and length rules not satisfied |
| **Environment** | Chrome, Firefox, Safari \| Windows, MacOS \| URL: https://app.vwo.com/#/login |
| **Steps to Reproduce** | 1. Open browser, navigate to VWO login page 2. Click password field 3. Type weak password: `abc` 4. Click outside field or click Sign In 5. Observe — no error shown, input accepted |
| **Test Data** | Weak passwords used: `abc`, `123456`, `abcdefgh`, `ex1234` |
| **Expected Result** | Error message shown — password must meet strength and length rules. Weak input rejected. |
| **Actual Result** | No error shown. Weak password accepted. Login proceeds successfully with weak password. |
| **Severity** | **High** — Security risk. Weak passwords allowed into the system for all users. |
| **Priority** | **High** — Login is the entry point to the system. Must be fixed before release. |

---

## Bug Lifecycle in JIRA — BUG_Login_PWD001

| Status | Who Acts | What Happens |
|---|---|---|
| **New** | QA Engineer | Bug logged — BUG_Login_PWD001 created in JIRA |
| **Open** | QA Lead / Manager | Bug reviewed and confirmed as valid |
| **Assigned** | QA Lead | Bug assigned to password validation developer |
| **In Progress** | Developer | Developer actively fixing the password validation logic |
| **Fixed** | Developer | Developer marks fix complete — deployed to test environment |
| **Retest** | QA Engineer | Retest with `abc`, `123456`, `abcdefgh` — verify error now shows |
| **Closed** | QA Engineer | Fix confirmed working — bug closed |
| **Reopen** | QA Engineer | If fix did not work — bug sent back to developer |

---

## Bug Report Format — 7 Fields Every Report Needs

| Field | Purpose |
|---|---|
| Bug ID | Unique identifier for tracking |
| Title | One line — what broke, not how |
| Environment | Browser, OS, URL — where it was found |
| Steps to Reproduce | Exact steps anyone can follow to see the bug |
| Expected Result | What should have happened |
| Actual Result | What actually happened |
| Severity + Priority | Impact and urgency — set independently |
