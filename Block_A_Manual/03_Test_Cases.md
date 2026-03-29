# Phase 3 — Test Case Design

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Manual Test Case Design  

---

## What is Test Case Design?

Test Case Design converts requirements into precise, executable specifications. The rule is **one behaviour = one test case = one clear pass/fail status**. Combining multiple behaviours into one test case makes reporting ambiguous.

---

## Test Case: TCD_LOGIN_UI01

| Field | Detail |
|---|---|
| **ID** | TCD_LOGIN_UI01 |
| **Feature** | Login — UI Behaviour |
| **Title** | Verify email field accepts valid email format only |
| **Precondition** | Browser open, internet connected, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Click email field 3. Type `testuser@gmail.com` 4. Click outside field 5. Observe response |
| **Test Data** | Valid: `testuser@gmail.com` \| Invalid: `testuser`, `testuser@`, `test@.com` |
| **Expected Result** | Valid email accepted with no error. Invalid format shows inline error message. |
| **Actual Result** | *(fill after execution)* |
| **Status** | Pass / Fail |

---

## Test Case: TCD_LOGIN_UI02

| Field | Detail |
|---|---|
| **ID** | TCD_LOGIN_UI02 |
| **Feature** | Login — UI Behaviour |
| **Title** | Verify password field rejects weak passwords |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Click password field 3. Type `abc` 4. Click outside field 5. Observe field response |
| **Test Data** | Weak: `abc` (short), `12345678` (no letters), `abcdefgh` (no digits/symbols), `ABC12345` (no symbols/lowercase) |
| **Expected Result** | Error shown — password must meet strength and length rules. Weak input not accepted. |
| **Actual Result** | *(fill after execution)* |
| **Status** | Pass / Fail |

---

## Test Case: TCD_LOGIN_UI03

| Field | Detail |
|---|---|
| **ID** | TCD_LOGIN_UI03 |
| **Feature** | Login — UI Behaviour |
| **Title** | Verify Sign In button blocks submission with empty fields |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Load login page 2. Leave email and password fields empty 3. Click Sign In button 4. Observe response |
| **Test Data** | Empty string in both fields |
| **Expected Result** | Error shown — fields required. No navigation occurs. User stays on login page. |
| **Actual Result** | *(fill after execution)* |
| **Status** | Pass / Fail |

---

## Test Case: TCD_LOGIN_UI04

| Field | Detail |
|---|---|
| **ID** | TCD_LOGIN_UI04 |
| **Feature** | Login — Valid Flow |
| **Title** | Verify successful login with valid credentials redirects to dashboard |
| **Precondition** | Browser open, VWO login page loaded, valid test account credentials available |
| **Steps** | 1. Navigate to login page 2. Enter valid email 3. Enter valid password 4. Click Sign In 5. Observe redirect |
| **Test Data** | Valid email and password from registered VWO test account |
| **Expected Result** | User redirected to VWO dashboard. URL changes from `#/login` to `#/dashboard`. No error shown. |
| **Actual Result** | *(fill after execution)* |
| **Status** | Pass / Fail |

---

## Test Case: TCD_LOGIN_UI05

| Field | Detail |
|---|---|
| **ID** | TCD_LOGIN_UI05 |
| **Feature** | Login — Invalid Flow |
| **Title** | Verify error message shown on invalid credentials |
| **Precondition** | Browser open, VWO login page loaded |
| **Steps** | 1. Navigate to login page 2. Enter valid email 3. Enter wrong password 4. Click Sign In 5. Observe response |
| **Test Data** | Email: `testuser@gmail.com` \| Password: `WrongPass123!` |
| **Expected Result** | Error shown — invalid email or password. User remains on login page. URL unchanged. |
| **Actual Result** | *(fill after execution)* |
| **Status** | Pass / Fail |

---

## Key Rule Learned

> **One behaviour = One test case = One clear pass/fail.**  
> Never combine multiple behaviours into a single test case. If email passes but password fails, you cannot report a clean status on a combined test case.
