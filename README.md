# SDET Portfolio — STLC Applied to Real Projects

**Soma Sai Dinesh** | QA Automation Engineer | Bengaluru

---

> **📌 Disclaimer:** This is a practice portfolio project created for learning and skill demonstration purposes. VWO Login Dashboard (`app.vwo.com/#/login`) was used as a practice target based on course material from Pramod Dutta's Playwright Automation Mastery 2026 program. No internal systems, confidential data, or proprietary documentation were accessed. All bugs logged are simulated defects created for STLC workflow demonstration — they are not confirmed production vulnerability reports submitted to VWO.

---

## What This Repository Contains

This portfolio demonstrates end-to-end STLC (Software Testing Life Cycle)
applied to a real product — VWO Login Dashboard (app.vwo.com).

Three approaches are documented side by side:

| Approach                | Folder               | Description                                                                    |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------ |
| Manual QA               | `Block_A_Manual/`    | Traditional STLC — PRD analysis, manual test cases, bug reports                |
| AI-Assisted QA          | `STLC_MCP_Project/`  | MCP-driven STLC — Playwright MCP + JIRA MCP automation                         |
| Standard CLI Automation | `STLC_Standard_CLI/` | Playwright + TypeScript + POM + GitHub Actions CI — production-grade framework |

---

## Why Three Approaches on the Same Target?

The same VWO login page is tested three different ways intentionally. Each approach answers a different question an SDET faces in real work.

**Manual QA** answers: "What does this feature need to do, and how do I document it?" It builds the foundation — requirement analysis, formal test cases, bug reports. Every SDET must own this regardless of their automation skill level. Interviewers at service companies and enterprise QA teams evaluate this directly.

**AI-Assisted QA (MCP)** answers: "How can AI augment my workflow without replacing my judgment?" Playwright MCP + JIRA MCP lets Claude Desktop control a real browser and log bugs autonomously — but the SDET defines the STLC structure, reviews output, and makes decisions. This represents the emerging skill layer in 2025–26 hiring.

**Standard CLI** answers: "How do I build a production-grade, maintainable automation framework from scratch?" This is what companies actually run in CI/CD pipelines. No AI assistance — pure engineering. The SDET writes every file, understands every decision, and owns the framework architecture.

---

## Project 3 — STLC Standard CLI

### What Standard CLI means and why an SDET chooses it

Standard CLI refers to initialising a Playwright project using `npm init playwright@latest` from the command line — no IDE plugin, no code generator dependency, no AI co-pilot. The SDET manually creates the folder structure, writes the configuration, builds the POM class, and authors every test case.

An SDET chooses Standard CLI over other approaches for four specific reasons:

**Framework ownership.** When a CI pipeline breaks at 2am, the on-call SDET must understand every file in the project — not just the test logic, but the config, the runner, the reporter, and the workflow YAML. Standard CLI forces that understanding because nothing is generated for you.

**Interview readiness.** Product companies ask SDETs to build a test framework from scratch in technical rounds. "Initialise a Playwright project, write a POM class, add a spec file, configure GitHub Actions" is a real interview task. The ability to do this cold, without assistance, is what Standard CLI practice builds.

**Team scalability.** MCP-generated tests are tied to an AI tool. Standard CLI projects follow conventions that any TypeScript developer can read, review, and extend. PRs get reviewed. Tests get maintained. Frameworks outlive the person who built them.

**CI/CD integration.** GitHub Actions reads `.github/workflows/playwright.yml` — a plain YAML file the SDET writes by hand. Understanding what each step does (checkout, setup-node, npm ci, playwright install, test, upload-artifact) is the difference between an SDET who can debug a failing pipeline and one who just pushes and hopes.

### How Standard CLI differs from the other two approaches

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
├── node_modules/                   ← auto-generated, excluded from git
│
├── playwright.config.ts            ← baseURL, browsers, retries, reporter
├── tsconfig.json                   ← TypeScript compiler config
├── package.json                    ← project dependencies
├── package-lock.json               ← locked dependency versions
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

## Tech Stack

- Playwright + TypeScript
- Python + Pytest
- GitHub Actions (CI/CD)
- JIRA (Bug Tracking)
- Playwright MCP (AI-assisted browser automation)
- Claude Desktop (MCP Client)

---

## Project — VWO Login Dashboard

**Target:** https://app.vwo.com/#/login
**Type:** Web Application — Authentication Module
**Purpose:** Practice STLC application — public login page used as test target

---

## STLC Phases Covered

1. Requirement Analysis
2. Test Planning
3. Test Case Design
4. Test Execution
5. Defect Reporting
6. Test Closure
