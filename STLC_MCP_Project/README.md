# STLC MCP Project — AI-Assisted Testing

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Complete STLC cycle driven by Playwright MCP + JIRA MCP  

---

## What This Folder Contains

A full Software Testing Life Cycle applied to a real product — VWO Login Dashboard — using AI-assisted MCP tools instead of manual workflows.

Every phase produces a real artifact. Every artifact is traceable to the phase before it.

```
Live Page Snapshot (MCP)
    ↓
Test Plan
    ↓
Test Cases with exact locators
    ↓
Playwright POM spec file
    ↓
Bug KAN-1 logged to JIRA (MCP)
    ↓
Test Closure Report
```

---

## Phases

| Phase | Folder | Output | Tool Used |
|---|---|---|---|
| 1 — Requirement Analysis | `01_Requirement_Analysis/` | 43 interactive elements extracted from live DOM | Playwright MCP |
| 2 — Test Planning | `02_Test_Plan/` | Scope, risk register, entry/exit criteria | MCP-informed |
| 3 — Test Case Design | `03_Test_Cases/` | 8 test cases with production-ready Playwright locators | MCP locators |
| 4 — Test Execution | `04_Test_Execution/` | POM architecture, 13 Playwright tests, 5-browser config | Playwright + TypeScript |
| 5 — Defect Reporting | `05_Defect_Reports/` | KAN-1 bug logged directly to JIRA board | JIRA MCP |
| 6 — Test Closure | `06_Test_Closure/` | Full summary, Manual vs MCP comparison, sign-off | — |

---

## Tools and Architecture

```
You (QA Lead)
    ↓ natural language instructions
Claude Desktop (LLM + MCP Client)
    ↓ tool calls
Playwright MCP Server  →  Browser automation  →  VWO Login Page
JIRA MCP Server        →  Issue creation      →  KAN project board
```

| Tool | Role |
|---|---|
| Claude Desktop | MCP Client — the brain that coordinates tools |
| Playwright MCP | Controls browser — navigates, snapshots, extracts elements |
| JIRA MCP | Creates and manages bug tickets |
| GitHub Actions | CI pipeline — runs tests on every push |

---

## How to Run the Tests

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npx playwright test STLC_MCP_Project/04_Test_Execution/tests/

# Run specific test
npx playwright test --grep "TC_LOGIN_001"

# Run with browser visible
npx playwright test --headed

# View HTML report
npx playwright show-report
```

---

## Key Findings vs Manual STLC

| | Manual (Block A) | MCP (This Project) |
|---|---|---|
| Elements found | ~8 from PRD | 43 from live DOM |
| Requirement Analysis time | 30 minutes | 2 minutes |
| Locators in test cases | Described in text | Production-ready, copy-paste ready |
| Bug logging | Manual JIRA entry | One MCP prompt → ticket created |
| Total STLC time | ~90 minutes | ~20 minutes |

---

## JIRA Board

**Project:** VWO Login STLC  
**URL:** https://somasaicheviti.atlassian.net/jira/software/projects/KAN  
**Open bugs:** KAN-1 — Password field accepts weak passwords without validation error
