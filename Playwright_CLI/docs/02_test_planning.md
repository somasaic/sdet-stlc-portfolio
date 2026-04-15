# Phase 2 — Test Planning

**Project:** Playwright_CLI — Week 2 SDET Portfolio
**Author:** Soma Sai Dinesh Cheviti
**Date:** April 2026

---

## 2.1 Test Objectives

1. Validate VWO login UI behaviour across core, negative, and edge case scenarios
2. Validate ReqRes API authentication and user resource endpoints for correct status codes, response bodies, and error handling
3. Demonstrate dual-project Playwright configuration with shared CI pipeline
4. Demonstrate API testing using the `request` fixture without any external tool

---

## 2.2 Scope

### In Scope

**UI Testing (app.vwo.com/#/login)**
- Page load smoke test — element visibility
- Valid and invalid credential submissions
- Empty and partial form submissions (BVA)
- Edge case inputs — SQL injection, long strings, special characters, whitespace

**API Testing (reqres.in)**
- POST /api/login — happy path and negative cases
- POST /api/register — happy path and missing field
- GET /api/users — list (paginated) and single user
- GET /api/users/:id — not found (404)
- PUT /api/users/:id — update and verify
- DELETE /api/users/:id — delete and verify 204

### Out of Scope
- VWO post-login functionality — no valid credentials
- ReqRes data persistence — Classic API data is stateless/ephemeral
- Performance or load testing
- Mobile browser testing
- Cross-browser API testing (API tests are browserless)
- Visual regression testing
- Accessibility testing

---

## 2.3 Test Approach

### UI Suite Approach
- Page Object Model (POM) — `pages/LoginPage.ts` holds all selectors and methods
- All locators use `getByRole` — resilient to CSS changes
- `test.beforeEach` navigates to `/#/login` before every test
- Test data imported from `data/testData.ts` — no hardcoded strings in spec files
- Edge case inputs defined inline with explanatory comments

### API Suite Approach
- Playwright `request` fixture — no browser opened, direct HTTP
- `baseURL` in config — tests use relative paths (`/api/login` not full URL)
- `extraHTTPHeaders` — API key injected at project level, not in test files
- Three assertion levels per test: status code → body fields → type validation
- Negative tests assert expected error status codes and error messages

---

## 2.4 Entry Criteria

| Criterion | Status |
|---|---|
| playwright.config.ts configured with ui and api projects | Required |
| .env file present with REQRES_API_KEY | Required |
| node_modules installed via npm ci | Required |
| Playwright browsers installed via npx playwright install | Required |
| pages/LoginPage.ts written with correct locators | Required |
| data/testData.ts written with all test inputs | Required |

---

## 2.5 Exit Criteria

| Criterion | Target |
|---|---|
| All UI tests passing | 10/10 |
| All API tests passing | 10/10 |
| HTML report generated | Yes |
| GitHub Actions CI green | Yes |
| All TC IDs traceable to REQ IDs in RTM | 22/22 |

---

## 2.6 Risk Register

| Risk ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| RISK-01 | VWO login page changes locators | Medium | High | Use `getByRole` (stable). Re-run codegen if locators break. |
| RISK-02 | ReqRes API downtime | Low | High | API tests will fail with network error. Retry pipeline. |
| RISK-03 | ReqRes API key expiry | Low | High | Free key tied to account. Regenerate at reqres.in if needed. |
| RISK-04 | VWO adds bot detection or CAPTCHA | Medium | High | Tests will fail at navigation. Document as known risk. |
| RISK-05 | CI runner has no internet (EAI_AGAIN) | Low | Medium | Known sandbox limitation. Confirmed working locally. |
| RISK-06 | GitHub Secret not configured | Medium | High | CI API tests fail with 401. Mitigation: setup instruction in README. |

---

## 2.7 Test Types Applied

| Test Type | Applied To | How |
|---|---|---|
| Smoke testing | TC-UI-01 | Verify all 5 page elements visible on load |
| Functional testing | TC-UI-02 to 06, TC-API-01 to 10 | Verify correct behaviour for valid inputs |
| Negative testing | TC-UI-03/04/05/06, TC-API-02/03/05/08 | Verify error handling for invalid inputs |
| Boundary value analysis | TC-UI-05, TC-UI-06, TC-UI-08 | Empty, partial, maximum length inputs |
| Equivalence partitioning | TC-UI-03/04, TC-API-02/03 | Different invalid credential classes |
| Security testing | TC-UI-07 | SQL injection input — verify no crash |
| Schema validation | TC-API-06/07/09 | Assert field types, not just existence |

---

## 2.8 Deliverables

| Deliverable | Location |
|---|---|
| Requirement analysis | docs/01_requirement_analysis.md |
| Test plan (this document) | docs/02_test_planning.md |
| Test cases | docs/03_test_cases.md |
| Bug reports | docs/04_bug_reports.md |
| Test closure report | docs/05_test_closure.md |
| POM implementation | pages/LoginPage.ts |
| Test data layer | data/testData.ts |
| UI test suite | tests/ui/vwo_login.spec.ts |
| API auth test suite | tests/api/auth.spec.ts |
| API users test suite | tests/api/users.spec.ts |
| CI pipeline | .github/workflows/playwright_cli.yml |
| HTML test report | playwright-report/ (CI artifact) |

---

## 2.9 Schedule

| Task | Target |
|---|---|
| Project setup and config | Day 1 |
| LoginPage.ts and testData.ts | Day 1 |
| API test files (auth + users) | Day 2 |
| UI test file (extended) | Day 2 |
| Local test execution — API 10/10 | Day 2 |
| Local test execution — UI 10/10 | Day 2 |
| CI pipeline + GitHub Secret | Day 3 |
| STLC documentation | Day 3 |
| README updated | Day 3 |
| Git commit and push | Day 3 |
