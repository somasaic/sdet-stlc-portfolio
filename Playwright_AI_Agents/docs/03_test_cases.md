# Phase 3 — Test Cases

**Project:** Playwright_AI_Agents  
**Approach:** 5 of 5 — AI Agents + Visual Regression  
**Target:** https://app.vwo.com/#/login  
**Phase owner:** Generator Agent (functional) + SDET (visual regression)  
**Date:** April 2026

---

## Test Case Overview

| Suite | TC IDs | Count | Source | Status |
|---|---|---|---|---|
| Smoke | TC-smoke-01 to TC-smoke-03 | 3 | Generator agent | Planned |
| Invalid Credentials | TC-invalid-01 to TC-invalid-02 | 2 | Generator agent | Planned |
| Empty / Partial Form | TC-empty-01 to TC-empty-02 | 2 | Generator agent | Planned |
| Edge Cases / Security | TC-edge-01 to TC-edge-02 | 2 | Generator agent | Planned |
| Visual Regression | TC-VR-01 to TC-VR-03 | 3 | SDET-written | ✅ Passing |
| **Total** | | **12** | | **3/12 complete** |

---

## Functional Test Cases (Generator Agent Output)

These test cases define the expected agent output. The generator agent will produce TypeScript implementations based on `specs/vwo_login_plan.md`.

---

### TC-smoke-01 — All key elements visible on page load

**File:** `tests/login/smoke.spec.ts`  
**Priority:** High | **Severity:** Critical | **Type:** Smoke  
**Mapped to:** REQ-AI-01

**Preconditions:**
- Browser navigated to `https://app.vwo.com/#/login`
- Page load state: networkidle

**Steps:**
1. Navigate to `/#/login` via seed.spec.ts
2. Assert email input is visible
3. Assert password input is visible
4. Assert Sign in button is visible
5. Assert Forgot Password button is visible

**Expected result:** All 4 elements visible within 5 seconds of navigation. No timeout.

**Locators:**
```typescript
page.getByRole('textbox', { name: 'Email address' })
page.getByRole('textbox', { name: 'Password' })
page.getByRole('button', { name: 'Sign in', exact: true })
page.getByRole('button', { name: 'Forgot Password?' })
```

---

### TC-smoke-02 — Sign in with Google button visible

**File:** `tests/login/smoke.spec.ts`  
**Priority:** Medium | **Severity:** Medium | **Type:** Smoke  
**Mapped to:** REQ-AI-09

**Steps:**
1. Navigate to `/#/login`
2. Assert Sign in with Google button is visible

**Expected result:** Button visible. Not interacted with (SSO is out of scope).

---

### TC-smoke-03 — Page title contains VWO branding

**File:** `tests/login/smoke.spec.ts`  
**Priority:** Low | **Severity:** Low | **Type:** Smoke  
**Mapped to:** REQ-AI-01

**Steps:**
1. Navigate to `/#/login`
2. Assert `page.title()` contains expected branding text

**Expected result:** Page title is not empty and contains product name.

---

### TC-invalid-01 — Unknown email + wrong password shows error

**File:** `tests/login/invalid-credentials.spec.ts`  
**Priority:** High | **Severity:** High | **Type:** Negative  
**Mapped to:** REQ-AI-02

**Preconditions:** Login page loaded

**Steps:**
1. Fill email: `invalid@test.com`
2. Fill password: `wrongpassword123`
3. Click Sign in button
4. Wait for error message (server-side — up to 17 seconds)
5. Assert error message is visible

**Expected result:**
- Error message appears within 17 seconds
- User remains on `/#/login` route
- No redirect to dashboard

**Note:** Server-side validation causes ~14-17s delay. This is expected behaviour — not a timeout failure.

---

### TC-invalid-02 — Valid email format + wrong password shows same error (no user enumeration)

**File:** `tests/login/invalid-credentials.spec.ts`  
**Priority:** High | **Severity:** High | **Type:** Negative + Security  
**Mapped to:** REQ-AI-03

**Steps:**
1. Fill email: `test@wingify.com` (valid email format, VWO domain)
2. Fill password: `wrongpassword`
3. Click Sign in button
4. Wait for error message
5. Assert error message is visible
6. Assert error message text does NOT distinguish between "email not found" vs "wrong password"

**Expected result:**
- Same vague error message as TC-invalid-01
- No user enumeration — identical error for unknown email vs known email with wrong password

**Security note:** If error messages differ between valid and invalid email addresses, it exposes user enumeration. This is a security requirement.

---

### TC-empty-01 — Empty form submission triggers client-side error

**File:** `tests/login/edge-cases.spec.ts`  
**Priority:** High | **Severity:** Medium | **Type:** Boundary  
**Mapped to:** REQ-AI-04

**Steps:**
1. Navigate to `/#/login`
2. Click Sign in button without filling any field
3. Assert error message appears within 5 seconds

**Expected result:**
- Client-side validation triggers within 5 seconds (no server call needed)
- The fast response time (vs TC-invalid-01's 14s) distinguishes client from server validation

---

### TC-empty-02 — Email filled, password empty

**File:** `tests/login/edge-cases.spec.ts`  
**Priority:** Medium | **Severity:** Medium | **Type:** Boundary  
**Mapped to:** REQ-AI-05

**Steps:**
1. Fill email: `test@wingify.com`
2. Leave password empty
3. Click Sign in button
4. Assert error message visible

**Expected result:** Error message visible. Validates partial form submission handling.

---

### TC-edge-01 — SQL injection in email field

**File:** `tests/login/edge-cases.spec.ts`  
**Priority:** High | **Severity:** High | **Type:** Security  
**Mapped to:** REQ-AI-06

**Steps:**
1. Fill email: `' OR 1=1--`
2. Fill password: `anypassword`
3. Click Sign in button
4. Wait up to 17 seconds
5. Assert page does not crash
6. Assert no HTTP 500 response visible in page
7. Assert login page remains functional

**Expected result:**
- Application handles SQL injection input gracefully
- No crash, no 500 error, no blank page
- Normal error message or client-side validation shown

---

### TC-edge-02 — 500-character email string

**File:** `tests/login/edge-cases.spec.ts`  
**Priority:** Medium | **Severity:** Medium | **Type:** Boundary  
**Mapped to:** REQ-AI-07

**Steps:**
1. Fill email with a 500-character string (repeated pattern)
2. Click Sign in button
3. Assert browser does not freeze or crash
4. Assert error message or page still responsive

**Expected result:** Input accepted without browser freeze. Graceful handling.

---

## Visual Regression Test Cases (SDET-written)

These tests are written by the SDET, not the generator agent. Visual regression strategy requires deliberate human decisions about clipping, thresholds, and baseline management.

---

### TC-VR-01 — Login page default state matches baseline

**File:** `tests/visual/login_visual.spec.ts`  
**Priority:** High | **Severity:** High | **Type:** Visual Regression  
**Mapped to:** REQ-AI-10  
**Status:** ✅ Passing

**Preconditions:**
- Baseline PNG exists: `vwo-login-default-chromium-win32.png`
- No user interaction — clean load state

**Steps:**
1. Navigate to `/#/login`
2. Wait for networkidle
3. Assert email input visible (confirms page ready)
4. Capture screenshot clipped to form bounding box
5. Compare against baseline

**Expected result:**
- Screenshot matches baseline within `maxDiffPixels: 200`
- If diff exceeds threshold: test FAILS with diff image showing changed pixels

**Implementation note:**
```typescript
const loginForm = page.locator('.login-form, form, [class*="login"], [class*="card"]').first();
const formBox = await loginForm.boundingBox();
await expect(page).toHaveScreenshot('vwo-login-default.png', {
  clip: formBox ?? undefined,
  animations: 'disabled',
  maxDiffPixels: 200,
});
```

---

### TC-VR-02 — Error state after invalid credentials matches baseline

**File:** `tests/visual/login_visual.spec.ts`  
**Priority:** High | **Severity:** High | **Type:** Visual Regression  
**Mapped to:** REQ-AI-11  
**Status:** ✅ Passing

**Preconditions:**
- Baseline PNG exists: `vwo-login-error-state-chromium-win32.png`
- `test.slow()` applied — test timeout tripled to 180 seconds

**Steps:**
1. Navigate to `/#/login`
2. Fill email: `wrong@test.com`
3. Fill password: `wrongpassword123`
4. Click Sign in
5. Wait 15 seconds (server-side validation)
6. Capture screenshot clipped to form bounding box
7. Compare against baseline

**Expected result:** Error state screenshot matches baseline within `maxDiffPixels: 60000`

**Threshold note:** TC-VR-02 uses a higher threshold than other VR tests because the error message rendering varies slightly with server response timing. The 60000 threshold was set based on observed 48,894–65,713 pixel variance in real runs. This is documented intentionally — not a loose threshold without justification.

---

### TC-VR-03 — Login page with email filled matches baseline

**File:** `tests/visual/login_visual.spec.ts`  
**Priority:** Medium | **Severity:** Medium | **Type:** Visual Regression  
**Mapped to:** REQ-AI-12  
**Status:** ✅ Passing

**Preconditions:**
- Baseline PNG exists: `vwo-login-email-filled-chromium-win32.png`

**Steps:**
1. Navigate to `/#/login`
2. Fill email: `test@wingify.com`
3. Capture screenshot clipped to form bounding box
4. Compare against baseline

**Expected result:** Email-filled form matches baseline within `maxDiffPixels: 200`

---

## Test Design Decisions

### Why getByRole locators (not CSS/XPath)

The generator agent is prompted to use `getByRole` locators exclusively because:
- Role-based locators are semantically stable — they survive minor DOM restructuring
- They align with WAI-ARIA standards — tests that pass are implicitly verifiable by screen readers
- Codegen produces them by default — aligns with Playwright best practices
- They are what the healer agent can most reliably verify and repair

### Why seed.spec.ts is excluded from test case numbering

`seed.spec.ts` has no TC-ID. It is infrastructure, not a test case. It contains one `test('seed')` function that exists only to bootstrap the browser session for the planner and generator agents. Including it in test counts would inflate metrics.

### Why visual tests are SDET-written, not agent-generated

The generator agent produces functional tests from a Markdown plan. Visual regression tests require:
- A deliberate decision about what to clip (form vs full page)
- Setting `maxDiffPixels` thresholds based on observed variance
- Understanding the OS and browser tagging of baseline PNGs
- Managing the update lifecycle of committed baselines

These decisions require engineering judgment, not pattern-following from a plan. The healer agent could potentially repair visual tests if selectors change — but the initial implementation and baseline strategy is SDET responsibility.