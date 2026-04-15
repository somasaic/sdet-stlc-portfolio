# Phase 1 — Requirement Analysis

**Project:** Playwright_CLI — Week 2 SDET Portfolio
**Author:** Soma Sai Dinesh Cheviti
**Date:** April 2026
**Targets:** app.vwo.com/#/login (UI) · reqres.in (API)

---

## 1.1 Objective

Identify and document all testable requirements for both test suites in this project:

- **UI Suite** — VWO login page functional and edge case behaviour
- **API Suite** — ReqRes authentication and user resource endpoints

---

## 1.2 UI Requirements — VWO Login Page

### Source
Live DOM audit of `https://app.vwo.com/#/login` using `npx playwright codegen`.

### Testable Requirements

| REQ ID | Requirement | Category |
|---|---|---|
| REQ-UI-01 | Email address input field must be visible and interactable on page load | Functional |
| REQ-UI-02 | Password input field must be visible and interactable on page load | Functional |
| REQ-UI-03 | Sign in button must be visible and enabled on page load | Functional |
| REQ-UI-04 | Forgot Password button must be visible on page load | Functional |
| REQ-UI-05 | Sign in with Google button must be visible on page load | Functional |
| REQ-UI-06 | Submitting invalid credentials must display a visible error message | Functional |
| REQ-UI-07 | Submitting an empty form must display an error message | BVA |
| REQ-UI-08 | Submitting email only (no password) must display an error message | BVA |
| REQ-UI-09 | SQL injection input in email field must not crash the page | Security / Edge |
| REQ-UI-10 | Extremely long string input must be handled gracefully — no crash | Boundary |
| REQ-UI-11 | Special characters in password field must produce an error, not a crash | Edge |
| REQ-UI-12 | Whitespace-only input in both fields must produce a visible error | Edge |

### Non-Testable (Out of Scope)
- Actual login success with real credentials — no valid VWO account available
- Email delivery for Forgot Password flow — external dependency
- Google SSO completion — requires Google account
- Session management post-login — requires authenticated state
- Mobile responsiveness — not in scope for this project

---

## 1.3 API Requirements — ReqRes Classic Endpoints

### Source
ReqRes public API documentation at `https://reqres.in` — Classic API section.

### Authentication Endpoint Requirements

| REQ ID | Endpoint | Requirement | Category |
|---|---|---|---|
| REQ-API-01 | POST /api/login | Valid credentials return 200 status and a token string | Functional |
| REQ-API-02 | POST /api/login | Request without password field returns 400 + "Missing password" | Validation |
| REQ-API-03 | POST /api/login | Wrong credentials return 400 and an error field | Negative |
| REQ-API-04 | POST /api/register | Valid data returns 200 with token and id fields | Functional |
| REQ-API-05 | POST /api/register | Request without password returns 400 + "Missing password" | Validation |

### User Resource Endpoint Requirements

| REQ ID | Endpoint | Requirement | Category |
|---|---|---|---|
| REQ-API-06 | GET /api/users?page=2 | Returns 200 with paginated data array and total count | Functional |
| REQ-API-07 | GET /api/users/2 | Returns 200 with correct user object — id, email, first_name, last_name | Functional |
| REQ-API-08 | GET /api/users/23 | Non-existent user returns 404 | Negative |
| REQ-API-09 | PUT /api/users/2 | Valid update body returns 200 with updated fields and updatedAt timestamp | Functional |
| REQ-API-10 | DELETE /api/users/2 | Returns 204 with no response body | Functional |

---

## 1.4 Requirement Traceability Matrix (RTM)

| REQ ID | Test Case | Spec File | Status |
|---|---|---|---|
| REQ-UI-01 | TC-UI-01 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-02 | TC-UI-01 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-03 | TC-UI-01 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-04 | TC-UI-01 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-05 | TC-UI-01 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-06 | TC-UI-02, TC-UI-03, TC-UI-04 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-07 | TC-UI-05 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-08 | TC-UI-06 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-09 | TC-UI-07 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-10 | TC-UI-08 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-11 | TC-UI-09 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-UI-12 | TC-UI-10 | tests/ui/vwo_login.spec.ts | Covered |
| REQ-API-01 | TC-API-01 | tests/api/auth.spec.ts | Covered |
| REQ-API-02 | TC-API-02 | tests/api/auth.spec.ts | Covered |
| REQ-API-03 | TC-API-03 | tests/api/auth.spec.ts | Covered |
| REQ-API-04 | TC-API-04 | tests/api/auth.spec.ts | Covered |
| REQ-API-05 | TC-API-05 | tests/api/auth.spec.ts | Covered |
| REQ-API-06 | TC-API-06 | tests/api/users.spec.ts | Covered |
| REQ-API-07 | TC-API-07 | tests/api/users.spec.ts | Covered |
| REQ-API-08 | TC-API-08 | tests/api/users.spec.ts | Covered |
| REQ-API-09 | TC-API-09 | tests/api/users.spec.ts | Covered |
| REQ-API-10 | TC-API-10 | tests/api/users.spec.ts | Covered |

**Total requirements:** 22 | **Covered:** 22 | **Not covered:** 0 | **Coverage:** 100%

---

## 1.5 Test Environment Requirements

| Item | Requirement |
|---|---|
| Node.js | 18+ |
| Playwright | @playwright/test (latest) |
| TypeScript | Strict mode |
| Browser | Chromium (UI project) |
| API target | reqres.in (internet required) |
| API key | REQRES_API_KEY in .env |
| CI | GitHub Actions ubuntu-latest |
