# Phase 3 — Test Cases (MCP-Driven)

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Version:** v1.0  
**Total Test Cases:** 8  
**Priority Split:** P1: 3 | P2: 4 | P3: 1  
**Approach:** Test cases written using live element locators from MCP Phase 1 audit  

---

## Quick Index

| ID | Title | Feature | Priority | Status |
|---|---|---|---|---|
| TC_LOGIN_001 | Valid Login | Authentication | P1 | PENDING |
| TC_LOGIN_002 | Invalid Password | Authentication | P1 | PENDING |
| TC_LOGIN_003 | Invalid Email Format | Input Validation | P2 | PENDING |
| TC_LOGIN_004 | Empty Fields Submit | Input Validation | P1 | PENDING |
| TC_LOGIN_005 | Remember Me Checkbox | Session | P2 | PENDING |
| TC_LOGIN_006 | Forgot Password Navigation | Navigation | P2 | PENDING |
| TC_LOGIN_007 | Password Show/Hide Toggle | UI Behaviour | P3 | PENDING |
| TC_LOGIN_008 | Sign in with Google OAuth | OAuth | P2 | PENDING |

---

## TC_LOGIN_001 — Valid Login

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_001 |
| **Feature** | Authentication |
| **Priority** | P1 |
| **Title** | Verify successful login with valid credentials redirects to dashboard |
| **Precondition** | Browser open, VWO login page loaded, valid test account available |
| **Steps** | 1. Navigate to `https://app.vwo.com/#/login` 2. Fill email → `page.getByRole('textbox', { name: 'Enter email ID' }).fill('test@vwo.com')` 3. Fill password → `page.getByRole('textbox', { name: 'Enter password' }).fill('ValidPass123!')` 4. Click Sign In → `page.getByRole('button', { name: 'Sign in' }).first().click()` 5. Observe redirect |
| **Test Data** | Email: `test@vwo.com` \| Password: `ValidPass123!` |
| **Expected Result** | User redirected to VWO dashboard. URL changes to `#/dashboard`. No error shown. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_002 — Invalid Password

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_002 |
| **Feature** | Authentication |
| **Priority** | P1 |
| **Title** | Verify error message shown when incorrect password entered |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Fill email → `page.getByRole('textbox', { name: 'Enter email ID' }).fill('test@vwo.com')` 3. Fill wrong password → `page.getByRole('textbox', { name: 'Enter password' }).fill('WrongPass999!')` 4. Click Sign In → `page.getByRole('button', { name: 'Sign in' }).first().click()` 5. Observe error message |
| **Test Data** | Email: `test@vwo.com` \| Password: `WrongPass999!` |
| **Expected Result** | Error message shown matching `/invalid\|incorrect\|wrong/i`. User stays on login page. URL unchanged. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_003 — Invalid Email Format

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_003 |
| **Feature** | Input Validation |
| **Priority** | P2 |
| **Title** | Verify inline error shown when email field contains invalid format |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Click email field → `page.getByRole('textbox', { name: 'Enter email ID' }).click()` 3. Type invalid email → `.fill('invalidemail')` 4. Trigger blur → `page.keyboard.press('Tab')` 5. Observe inline error |
| **Test Data** | Invalid: `invalidemail`, `user@`, `@domain.com`, `user@.com` |
| **Expected Result** | Inline error shown — `getByText('Invalid email')` visible. Sign In button remains disabled. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_004 — Empty Fields Submit

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_004 |
| **Feature** | Input Validation |
| **Priority** | P1 |
| **Title** | Verify Sign In button blocked when both fields are empty |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Leave email and password fields empty 3. Click Sign In → `page.getByRole('button', { name: 'Sign in' }).first().click()` 4. Observe field states |
| **Test Data** | Email: `` (empty) \| Password: `` (empty) |
| **Expected Result** | Email field focused — `expect(emailField).toBeFocused()`. Both fields show empty value — `toHaveValue('')`. No navigation occurs. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_005 — Remember Me Checkbox

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_005 |
| **Feature** | Session Management |
| **Priority** | P2 |
| **Title** | Verify Remember Me checkbox persists session beyond browser close |
| **Precondition** | Browser open, VWO login page loaded, valid credentials available |
| **Steps** | 1. Navigate to login page 2. Check Remember Me → `page.getByRole('checkbox', { name: 'Remember me' }).check()` 3. Verify checkbox checked → `expect(checkbox).toBeChecked()` 4. Login with valid credentials 5. Close and reopen browser 6. Navigate to VWO — observe session state |
| **Test Data** | Email: `test@vwo.com` \| Password: `ValidPass123!` |
| **Expected Result** | Session persists. User not redirected to login page on return. Cookie with extended expiry present in browser storage. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_006 — Forgot Password Navigation

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_006 |
| **Feature** | Navigation |
| **Priority** | P2 |
| **Title** | Verify Forgot Password button navigates to reset flow and Back returns to login |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Click Forgot Password → `page.getByRole('button', { name: 'Forgot Password?' }).click()` 3. Observe — reset form visible 4. Click Back → `page.getByRole('button', { name: '« Back' }).click()` 5. Observe — login form visible again |
| **Test Data** | No credentials needed |
| **Expected Result** | Forgot Password click shows reset email form. Back click returns user to main login form. No page reload — SPA navigation. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_007 — Password Show/Hide Toggle

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_007 |
| **Feature** | UI Behaviour |
| **Priority** | P3 |
| **Title** | Verify password toggle switches field between masked and visible states |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Verify password masked → `expect(passwordField).toHaveAttribute('type', 'password')` 3. Click toggle → `page.getByRole('button', { name: 'Toggle password visibility' }).first().click()` 4. Verify password visible → `toHaveAttribute('type', 'text')` 5. Click toggle again 6. Verify masked → `toHaveAttribute('type', 'password')` |
| **Test Data** | Password: `TestPass123!` |
| **Expected Result** | Default state: `type="password"` (masked). After toggle: `type="text"` (visible). After second toggle: `type="password"` (masked again). |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## TC_LOGIN_008 — Sign in with Google OAuth

| Field | Detail |
|---|---|
| **ID** | TC_LOGIN_008 |
| **Feature** | OAuth Authentication |
| **Priority** | P2 |
| **Title** | Verify Sign in with Google button redirects to Google OAuth with state parameter |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Click Sign in with Google → `page.getByRole('button', { name: 'Sign in with Google' }).click()` 3. Wait for redirect → `page.waitForURL(/accounts\.google\.com/)` 4. Inspect URL for state parameter |
| **Test Data** | No credentials needed — testing redirect only |
| **Expected Result** | Browser redirects to `accounts.google.com`. OAuth URL contains `state=` parameter (CSRF protection). VWO client ID present in URL. |
| **Actual Result** | — Not yet executed — |
| **Status** | PENDING |

---

## Key Insights from MCP-Driven Test Case Design

**What MCP enabled that manual design could not:**

- Exact Playwright locators embedded directly in test steps — no guessing required during execution
- Hidden form discovery — 4 forms in DOM simultaneously, locators use `.first()` and `.nth()` to avoid ambiguity
- Toggle password visibility appears 3 times — test case explicitly uses `.first()` to target correct element
- OAuth state parameter check — identified from live page behaviour, not from PRD

---

## Manual vs MCP — Phase 3 Comparison

| | Manual (Block A) | MCP (This Phase) |
|---|---|---|
| Test cases written | 5 | 8 |
| Locators in steps | Described in text | Exact production-ready Playwright locators |
| Edge cases covered | Basic valid/invalid | OAuth CSRF, session cookies, DOM ambiguity |
| Execution-ready | Needs locator lookup | Copy-paste ready into spec file |
| Time taken | 30 minutes | Under 10 minutes with MCP context |
