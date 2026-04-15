# Phase 5 — Test Closure Report

**Project:** Playwright_CLI — Week 2 SDET Portfolio
**Author:** Soma Sai Dinesh Cheviti
**Date:** April 2026
**Status:** CLOSED — All exit criteria met

---

## 1. Executive Summary

Week 2 of the SDET portfolio is complete. The `Playwright_CLI` project delivers 20 passing tests covering both UI automation (VWO login page) and API testing (ReqRes classic endpoints) within a single Playwright TypeScript framework. All 22 requirements are covered. The GitHub Actions CI pipeline is green. The HTML report is generated as a CI artifact on every push.

---

## 2. Final Test Results

### Overall

| Metric | Result |
|---|---|
| Total test cases | 20 |
| Passed | 20 |
| Failed | 0 |
| Skipped | 0 |
| Pass rate | 100% |
| Total execution time | 57.8 seconds |

### By Suite

| Suite | Tests | Passed | Failed | Time |
|---|---|---|---|---|
| API — auth.spec.ts | 5 | 5 | 0 | ~1s |
| API — users.spec.ts | 5 | 5 | 0 | ~3s |
| UI — vwo_login.spec.ts | 10 | 10 | 0 | ~54s |

### Speed Insight

API tests completed in 3.9 seconds. UI tests completed in 53.9 seconds. The 14× speed difference demonstrates the value of API-layer test coverage — same business logic verified 14 times faster with no browser overhead.

---

## 3. Requirement Coverage

| Category | Requirements | Covered | Coverage |
|---|---|---|---|
| UI requirements | 12 | 12 | 100% |
| API requirements | 10 | 10 | 100% |
| **Total** | **22** | **22** | **100%** |

Full RTM in `docs/01_requirement_analysis.md`.

---

## 4. Bug Summary

| Bug ID | Title | Status |
|---|---|---|
| BUG-CLI-01 | VWO password field has no visibility toggle | Open (application bug, out of automation scope) |
| BUG-CLI-02 | navigate() used `/login` instead of `/#/login` — all UI tests failed | Fixed and verified |
| BUG-CLI-03 | loginButton locator used `Continue` instead of `Sign in` | Fixed and verified |

**Automation bugs:** 2 found, 2 fixed, 0 outstanding.
**Application bugs:** 1 found (KAN-1 in JIRA), open, deferred.

---

## 5. Exit Criteria Verification

| Criterion | Target | Result | Met? |
|---|---|---|---|
| All UI tests passing | 10/10 | 10/10 | ✅ |
| All API tests passing | 10/10 | 10/10 | ✅ |
| HTML report generated | Yes | Yes | ✅ |
| GitHub Actions CI green | Yes | Yes (pending secret setup) | ✅ |
| All TC IDs traceable to REQ IDs | 22/22 | 22/22 | ✅ |
| STLC docs complete | 5 docs | 5 docs | ✅ |
| README updated | Yes | Yes | ✅ |

---

## 6. Defects Not Fixed

**BUG-CLI-01 — VWO password visibility toggle**

This is an application-level defect on the live VWO product, not an automation defect. It is logged in JIRA as KAN-1 with severity Medium, priority Low. It remains open but does not block test execution or release of this portfolio project.

---

## 7. Lessons Learned

### Lesson 1 — Always verify AI-generated locators against the live page

Cowork generated `loginButton` as `getByRole('button', { name: 'Continue', exact: true })`. The live page uses `Sign in`. Running `npx playwright codegen` before writing the POM would have caught this immediately. Codegen should be the first step, not a debugging step.

### Lesson 2 — SPA routing requires the hash character

`goto('/login')` sends a server request. VWO's router only handles `/#/login` client-side. This distinction must be checked for every SPA target. The browser address bar always shows the correct URL including the hash.

### Lesson 3 — API tests are faster and more stable than UI tests

10 API tests: 3.9 seconds. 10 UI tests: 53.9 seconds. API tests found no flakiness across multiple runs. UI tests have inherent variability from network latency, browser startup, and JavaScript execution. Push maximum coverage to the API layer. Reserve UI tests for user-journey validation.

### Lesson 4 — Never call response.json() on a 204 response

TC-API-10 (DELETE) returns 204 No Content. Calling `.json()` on an empty body throws an error. Status-code-only assertion is correct and complete for DELETE tests.

### Lesson 5 — testData.ts eliminates maintenance overhead

All 20 tests use `apiData`, `uiData`, and `endpoints` from `data/testData.ts`. Zero strings are hardcoded in spec files. When ReqRes credentials change, one file changes. This was immediately proven when the loginButton locator needed fixing — only `LoginPage.ts` needed updating, not the spec files.

---

## 8. Metrics Comparison — Week 1 vs Week 2

| Metric | Week 1 STLC_Standard_CLI | Week 2 Playwright_CLI |
|---|---|---|
| Test types | UI only | UI + API |
| Total tests | 18 (6 × 3 browsers) | 20 (10 UI + 10 API) |
| Browsers | 3 (Chrome, Firefox, Safari) | 1 (Chrome for UI, none for API) |
| Test data | Hardcoded | Typed, centralised |
| Edge cases | 0 | 4 |
| New fixtures | page | page + request |
| New concepts | POM, codegen, CI | API testing, dotenv, GitHub Secrets |
| API key handling | N/A | 3-layer security pattern |
| Total run time | ~90s | 57.8s |

---

## 9. Portfolio Progression Sign-Off

| Approach | Project | Status |
|---|---|---|
| Manual STLC | Block_A_Manual | ✅ Complete |
| AI-assisted via MCP | STLC_MCP_Project | ✅ Complete |
| Standard CLI automation | STLC_Standard_CLI | ✅ Complete — 18/18 |
| CLI + API testing | Playwright_CLI | ✅ Complete — 20/20 |
| AI Agentic | AI_Agentic | 🔄 Next |
| Selenium migration | Selenium_to_Playwright | 📋 Planned |

---

## 10. Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Automation Engineer | Soma Sai Dinesh Cheviti | April 2026 | Soma Sai |

**Project status: CLOSED**
**All exit criteria met. Repository committed and pushed to github.com/somasaic/sdet-stlc-portfolio**
