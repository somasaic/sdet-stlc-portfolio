# SDET Portfolio — STLC Applied to Real Projects

**Soma Sai Dinesh** | QA Automation Engineer | Bengaluru

---

> **📌 Disclaimer:** This is a practice portfolio project created for learning and skill demonstration purposes. VWO Login Dashboard (`app.vwo.com/#/login`) was used as a practice target based on course material from Pramod Dutta's Playwright Automation Mastery 2026 program. No internal systems, confidential data, or proprietary documentation were accessed. All bugs logged are simulated defects created for STLC workflow demonstration — they are not confirmed production vulnerability reports submitted to VWO.

---

## What This Repository Contains

This portfolio demonstrates end-to-end STLC (Software Testing Life Cycle)
applied to real products — VWO Login Dashboard and ReqRes API.

Four projects are documented, each building on the previous:

| Project                     | Folder               | Description                                                            |
| --------------------------- | -------------------- | ---------------------------------------------------------------------- |
| Manual QA                   | `Block_A_Manual/`    | Traditional STLC — PRD analysis, manual test cases, bug reports        |
| AI-Assisted QA              | `STLC_MCP_Project/`  | MCP-driven STLC — Playwright MCP + JIRA MCP automation                 |
| Standard CLI (Week 1)       | `STLC_Standard_CLI/` | Playwright + TypeScript + POM + GitHub Actions CI — UI testing         |
| Standard CLI + API (Week 2) | `Playwright_CLI/`    | Playwright UI + API testing — `request` fixture, testData, dual config |

---

## Why Three Approaches on the Same Target?

The same VWO login page is tested three different ways intentionally. Each approach answers a different question an SDET faces in real work.

**Manual QA** answers: "What does this feature need to do, and how do I document it?" It builds the foundation — requirement analysis, formal test cases, bug reports. Every SDET must own this regardless of their automation skill level. Interviewers at service companies and enterprise QA teams evaluate this directly.

**AI-Assisted QA (MCP)** answers: "How can AI augment my workflow without replacing my judgment?" Playwright MCP + JIRA MCP lets Claude Desktop control a real browser and log bugs autonomously — but the SDET defines the STLC structure, reviews output, and makes decisions. This represents the emerging skill layer in 2025–26 hiring.

**Standard CLI (Week 1)** answers: "How do I build a production-grade, maintainable automation framework from scratch?" This is what companies actually run in CI/CD pipelines. No AI assistance — pure engineering. The SDET writes every file, understands every decision, and owns the framework architecture.

**Standard CLI + API (Week 2)** expands the question: "How do I test across UI and API layers in a single cohesive framework?" By adding the `request` fixture and a second project config, this demonstrates the real-world SDET skill of choosing the right layer to test (API for speed, UI for user workflows). It introduces testData patterns, environment variables, and shows 14× speed gains by testing at API layer.

---

## Project 1b — STLC Standard CLI (Week 1)

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

## Project 2 — Playwright_CLI: UI + API Testing (Week 2)

### Overview

**Standard Playwright UI + API Testing | VWO Login + ReqRes API**

This project introduces API testing alongside UI automation — a critical real-world SDET skill. Using Playwright's `request` fixture, tests run directly against ReqRes public API with zero browser overhead, demonstrating the speed and value of testing at multiple layers.

### Test Results

| Suite                  | Tests     | Status             |
| ---------------------- | --------- | ------------------ |
| API — auth.spec.ts     | 5/5       | ✅ Passing         |
| API — users.spec.ts    | 5/5       | ✅ Passing         |
| UI — vwo_login.spec.ts | 10/10     | ✅ Passing         |
| **Total**              | **20/20** | **✅ All passing** |

### What this project adds

- **Playwright `request` fixture** — API testing without browser or external tools
- **Full CRUD coverage** — GET, POST, PUT, DELETE against ReqRes public API
- **Dual project config** — `ui` and `api` projects in single `playwright.config.ts`
- **testData.ts** — typed test data pattern using TypeScript interfaces
- **dotenv + GitHub Secrets** — secure API key handling in CI/CD
- **Edge case UI tests** — SQL injection, boundary strings, special characters, whitespace handling
- **Bug KAN-2 logged** — REST 200 vs 201 discrepancy in ReqRes API documented

### Performance Comparison

| Layer          | Tests | Time    | Per-test                |
| -------------- | ----- | ------- | ----------------------- |
| API tests      | 10    | 3.9s    | ~400ms                  |
| UI tests       | 10    | 53.9s   | 5-14s                   |
| **Speed gain** | —     | **14×** | API layer is 13× faster |

**Why this matters:** Product SDETs use this knowledge to make architectural decisions — which features test at API vs UI layer for optimal coverage and CI/CD speed.

### Project structure

```
Playwright_CLI/
│
├── tests/
│   ├── example.spec.ts              ← Template test
│   ├── api/
│   │   ├── auth.spec.ts             ← API auth scenarios
│   │   ├── users.spec.ts            ← CRUD operations
│   │   └── bug_kan2.spec.ts         ← REST discrepancy test
│   └── ui/
│       └── vwo_login.spec.ts        ← UI login scenarios + edge cases
│
├── pages/
│   └── LoginPage.ts                 ← POM — VWO selectors
│
├── data/
│   └── testData.ts                  ← Typed test data (interfaces)
│
├── docs/
│   ├── 01_requirement_analysis.md    ← API + UI requirements
│   ├── 02_test_planning.md           ← Scope, risks, dual-layer strategy
│   ├── 03_test_cases.md              ← TC-01 through TC-20
│   ├── 04_bug_reports.md             ← KAN-2 full detail
│   └── 05_test_closure.md            ← Final validation
│
├── playwright.config.ts             ← baseURL, projects (ui/api), globals
├── tsconfig.json                    ← TypeScript config
├── package.json                     ← Playwright, dotenv dependencies
└── README.md                        ← Project guide
```

### Key concepts introduced

- **`page.request`** fixture — direct HTTP requests without browser context
- **`extraHTTPHeaders`** — adding auth headers to all requests
- **`baseURL` per project** — separate configs for UI and API
- **TypeScript interfaces** — type-safe test data (Request/Response)
- **`dotenv`** — loading `.env` for secrets in local dev
- **GitHub Secrets** — CI/CD environment variable injection
- **`if: always()`** in CI — report generation even if tests fail
- **npm ci** — locked dependency install for reproducibility

### STLC — All 6 Phases

Full documentation in `Playwright_CLI/docs/`:

| Phase                    | Deliverable                                     |
| ------------------------ | ----------------------------------------------- |
| 1 — Requirement Analysis | API endpoints + UI workflows documented         |
| 2 — Test Planning        | Dual-layer strategy, scope, risk register       |
| 3 — Test Case Design     | 20 test cases (10 API, 10 UI) with edge cases   |
| 4 — Test Automation      | Playwright request + browser, POM, testData     |
| 5 — Bug Reporting        | KAN-2 — REST 201 vs 200 status code discrepancy |
| 6 — Test Closure         | 20/20 passing, cross-layer validated            |

### Bug KAN-2

**Issue:** POST /api/register returns `200 (OK)` instead of `201 (Created)`  
**Impact:** Violates REST convention — clients expect 201 to signal resource creation  
**Evidence:** Test case `POST_Register_ShouldReturn201OnSuccess` in bug_kan2.spec.ts  
**Status:** Documented for ReqRes demonstration

### How to run locally

```bash
cd Playwright_CLI

# Install dependencies
npm ci
npx playwright install

# Run all tests (UI + API)
npx playwright test

# Run only API tests
npx playwright test --project=api

# Run only UI tests
npx playwright test --project=ui

# View HTML report
npx playwright show-report
```

---

## Portfolio Progression

| Week | Project                | Approach                                                | Tests | Status |
| ---- | ---------------------- | ------------------------------------------------------- | ----- | ------ |
| 0    | Block_A_Manual         | Manual STLC — no automation                             | —     | ✅     |
| 1a   | STLC_MCP_Project       | Playwright MCP + JIRA MCP                               | 13    | ✅     |
| 1b   | STLC_Standard_CLI      | Standard CLI, POM, 3 browsers (UI only)                 | 18    | ✅     |
| 2    | Playwright_CLI         | UI + API, testData, dual config, performance comparison | 20    | ✅     |
| 3/4  | AI_Agentic             | @playwright/cli AI-driven                               | TBD   | 🔄     |
| —    | Selenium_to_Playwright | Migration from Selenium                                 | TBD   | 📋     |

### What each project teaches

- **Block_A_Manual:** STLC fundamentals — how to think like a tester before touching code
- **STLC_MCP_Project:** AI integration — MCP architecture, autonomous test generation, JIRA automation
- **STLC_Standard_CLI:** Core SDET engineering — POM patterns, CI/CD, cross-browser testing, Git workflow
- **Playwright_CLI:** Advanced SDET patterns — API + UI layering, testData design, performance analysis, multi-config frameworks
- **AI_Agentic:** Emerging 2025 skill — autonomous agents, prompt engineering, AI-driven test design
- **Selenium_to_Playwright:** Framework migration — legacy system modernization, tool evaluation

---

## STLC Phases Covered

1. Requirement Analysis
2. Test Planning
3. Test Case Design
4. Test Execution
5. Defect Reporting
6. Test Closure
