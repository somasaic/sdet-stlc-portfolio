# Block A — Manual STLC

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Traditional STLC using PRD analysis — no automation tools  

---

## What This Folder Contains

A complete Software Testing Life Cycle applied manually to the VWO Login Dashboard. Every phase was done by reading the PRD, thinking through the problem, and producing written artifacts — no AI tools involved.

This is the foundation. Understanding manual STLC first makes AI-assisted STLC (see `STLC_MCP_Project/`) faster and more meaningful.

---

## Files

| File | Phase | What It Contains |
|---|---|---|
| `01_Requirement_Analysis.md` | Phase 1 | Testable requirements from PRD, clarification list |
| `02_Test_Plan.md` | Phase 2 | Scope, approach, risk register, entry/exit criteria |
| `03_Test_Cases.md` | Phase 3 | 5 test cases — TCD_LOGIN_UI01 to UI05 |
| `04_Bug_Report.md` | Phase 4 | BUG_Login_PWD001 — full JIRA-format bug report + lifecycle |
| `05_Severity_Priority.md` | Phase 4 | Severity vs Priority — definitions and real examples |
| `06_Regression_Retesting.md` | Phase 5/6 | Regression vs Retesting — from real bug fix scenario |
| `docs/Block_B_Automation_Foundations.md` | Reference | Playwright + TypeScript automation Q&A — code drill output |

---

## Key Concepts Covered

**STLC Phases:**
- Requirement Analysis — read PRD, identify testable items, flag unclear items
- Test Planning — define scope, out of scope, risks
- Test Case Design — one behaviour = one test case = one pass/fail
- Defect Reporting — full bug report format, JIRA lifecycle
- Test Closure — regression vs retesting, sign-off

**Automation Foundations:**
- Selenium vs Playwright — when to use which
- Page Object Model — why and how
- iFrame handling — frameLocator() vs switchTo()
- Implicit vs Explicit vs Auto-wait
- CI/CD — GitHub Actions YAML pipeline

---

## The Core Rule of Test Case Design

> **One behaviour = One test case = One clear pass/fail.**  
> Never combine multiple behaviours into one test case.  
> If email passes but password fails, you cannot report a clean status on a combined test case.

---

## Compare With MCP Approach

See `STLC_MCP_Project/` for the same STLC cycle done using Playwright MCP and JIRA MCP.

| | Manual (This Folder) | MCP Approach |
|---|---|---|
| Requirement source | PRD document | Live DOM snapshot |
| Elements identified | ~8 | 43 |
| Test cases | 5 | 8 |
| Bug logging | Manual format | JIRA MCP — one prompt |
| Total time | ~90 minutes | ~20 minutes |
