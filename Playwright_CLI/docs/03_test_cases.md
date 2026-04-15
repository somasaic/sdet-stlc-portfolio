# Phase 3 — Test Cases

**Project:** Playwright_CLI — Week 2 SDET Portfolio
**Author:** Soma Sai Dinesh Cheviti
**Date:** April 2026
**Total:** 20 test cases — 10 UI + 10 API

---

## UI Test Cases — `tests/ui/vwo_login.spec.ts`

---

### TC-UI-01 — Login page loads — all key elements visible

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-01 |
| **REQ ID** | REQ-UI-01, REQ-UI-02, REQ-UI-03, REQ-UI-04, REQ-UI-05 |
| **Type** | Smoke |
| **Priority** | Critical |
| **Precondition** | Browser navigated to https://app.vwo.com/#/login |

**Test Steps:**
1. Navigate to `/#/login`
2. Assert email input is visible
3. Assert password input is visible
4. Assert Sign in button is visible
5. Assert Forgot Password button is visible

**Expected Result:** All 5 elements visible within 5 seconds of navigation.

**Design Rationale:** Smoke test — if this fails, all other tests will also fail. Run first.

---

### TC-UI-02 — Valid email format triggers server-side validation

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-02 |
| **REQ ID** | REQ-UI-06 |
| **Type** | Functional |
| **Priority** | High |
| **Precondition** | Browser navigated to login page |

**Test Steps:**
1. Fill email with `test@wingify.com` (valid format, no real account)
2. Fill password with `Test@1234` (invalid credentials)
3. Click Sign in
4. Assert error message becomes visible

**Expected Result:** Server responds with error message visible on page. Response time ~14 seconds (server-side validation).

**Design Rationale:** Tests that the form submits and reaches the server. No real credentials needed — the error response confirms the server was reached.

---

### TC-UI-03 — Invalid email + wrong password shows error (EP)

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-03 |
| **REQ ID** | REQ-UI-06 |
| **Type** | Negative — Equivalence Partition |
| **Priority** | High |
| **Precondition** | Browser navigated to login page |

**Test Steps:**
1. Fill email with `invalid@test.com` (unknown domain)
2. Fill password with `wrongpassword123`
3. Click Sign in
4. Assert error message is visible

**Expected Result:** Error message visible. Different EP from TC-UI-04 (unknown vs known domain).

**Design Rationale:** Unknown email domain is one equivalence partition. Tests the "no such user" path.

---

### TC-UI-04 — Valid email format + wrong password shows error (EP)

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-04 |
| **REQ ID** | REQ-UI-06 |
| **Type** | Negative — Equivalence Partition |
| **Priority** | High |
| **Precondition** | Browser navigated to login page |

**Test Steps:**
1. Fill email with `test@wingify.com` (valid domain, known to VWO)
2. Fill password with `wrongpassword`
3. Click Sign in
4. Assert error message is visible

**Expected Result:** Error message visible. Same visible outcome as TC-UI-03 but different partition.

**Design Rationale:** Known domain + wrong password is a different EP from unknown domain. Both return vague errors — this prevents user enumeration (a security property).

---

### TC-UI-05 — Empty form submission shows error (BVA minimum)

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-05 |
| **REQ ID** | REQ-UI-07 |
| **Type** | Negative — BVA Minimum |
| **Priority** | High |
| **Precondition** | Browser navigated to login page |

**Test Steps:**
1. Do not fill any field
2. Click Sign in
3. Assert error message is visible

**Expected Result:** Error visible in ~5 seconds (client-side validation — faster than server round-trip).

**Design Rationale:** BVA minimum boundary — zero input. The fast response (~5s vs ~14s for TC-UI-03) confirms this validation runs client-side before hitting the server.

---

### TC-UI-06 — Email only, password empty shows error (BVA partial)

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-06 |
| **REQ ID** | REQ-UI-08 |
| **Type** | Negative — BVA Partial |
| **Priority** | Medium |
| **Precondition** | Browser navigated to login page |

**Test Steps:**
1. Fill email with `test@wingify.com`
2. Leave password empty
3. Click Sign in
4. Assert error message is visible

**Expected Result:** Error visible. Partial input — one field provided, one missing.

---

### TC-UI-07 — SQL injection string in email field — no crash

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-07 |
| **REQ ID** | REQ-UI-09 |
| **Type** | Security / Edge Case |
| **Priority** | Medium |
| **Precondition** | Browser navigated to login page |
| **Test Input** | `' OR 1=1--` |

**Test Steps:**
1. Fill email with `' OR 1=1--`
2. Fill password with `anypassword`
3. Click Sign in
4. Assert error message is visible (page did not crash)

**Expected Result:** Normal error message shown. No server error. No JavaScript exception. Page remains functional.

**Design Rationale:** Tests input sanitisation at the UI layer. A crash or 500 error would indicate the SQL string reached the database unescaped.

---

### TC-UI-08 — 500-character string in email — handled gracefully

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-08 |
| **REQ ID** | REQ-UI-10 |
| **Type** | Edge Case — Boundary |
| **Priority** | Low |
| **Precondition** | Browser navigated to login page |
| **Test Input** | `'a'.repeat(500)` |

**Test Steps:**
1. Fill email with a 500-character string of 'a' characters
2. Fill password with `anypassword`
3. Click Sign in
4. Assert error is shown or page does not crash

**Expected Result:** No crash, no browser freeze, no unhandled exception. Error message or graceful rejection.

---

### TC-UI-09 — Special characters in password — no crash

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-09 |
| **REQ ID** | REQ-UI-11 |
| **Type** | Edge Case |
| **Priority** | Low |
| **Precondition** | Browser navigated to login page |
| **Test Input** | `!@#$%^&*()` |

**Test Steps:**
1. Fill email with `test@wingify.com`
2. Fill password with `!@#$%^&*()`
3. Click Sign in
4. Assert error is visible and page has not crashed

**Expected Result:** Error message visible. No crash.

---

### TC-UI-10 — Whitespace-only in both fields — error visible

| Field | Detail |
|---|---|
| **TC ID** | TC-UI-10 |
| **REQ ID** | REQ-UI-12 |
| **Type** | Edge Case |
| **Priority** | Low |
| **Precondition** | Browser navigated to login page |
| **Test Input** | `'   '` (3 spaces) in both fields |

**Test Steps:**
1. Fill email with three spaces
2. Fill password with three spaces
3. Click Sign in
4. Assert error is visible

**Expected Result:** Error visible. Whitespace-only should be treated as empty — not as valid input.

---

## API Test Cases — `tests/api/auth.spec.ts`

---

### TC-API-01 — POST /api/login — valid credentials returns 200 + token

| Field | Detail |
|---|---|
| **TC ID** | TC-API-01 |
| **REQ ID** | REQ-API-01 |
| **Type** | Functional — Happy Path |
| **Priority** | Critical |
| **Endpoint** | POST /api/login |

**Request Body:**
```json
{ "email": "eve.holt@reqres.in", "password": "cityslicka" }
```

**Assertions:**
- Status: `200`
- `body.token` is defined
- `typeof body.token === 'string'`

**Design Rationale:** Happy path. Confirms authentication returns a token. Level 3 type check confirms token is usable string, not a number or object.

---

### TC-API-02 — POST /api/login — missing password returns 400

| Field | Detail |
|---|---|
| **TC ID** | TC-API-02 |
| **REQ ID** | REQ-API-02 |
| **Type** | Negative — Missing Required Field |
| **Priority** | High |
| **Endpoint** | POST /api/login |

**Request Body:**
```json
{ "email": "eve.holt@reqres.in" }
```

**Assertions:**
- Status: `400`
- `body.error === 'Missing password'`

**Design Rationale:** Verifies required field enforcement. The exact error message assertion confirms the API returns a meaningful, actionable error.

---

### TC-API-03 — POST /api/login — wrong credentials returns 400

| Field | Detail |
|---|---|
| **TC ID** | TC-API-03 |
| **REQ ID** | REQ-API-03 |
| **Type** | Negative |
| **Priority** | High |
| **Endpoint** | POST /api/login |

**Request Body:**
```json
{ "email": "wrong@test.com", "password": "wrongpassword" }
```

**Assertions:**
- Status: `400`
- `body.error` is defined

**Design Rationale:** Confirms the API rejects unknown credentials with correct status code.

---

### TC-API-04 — POST /api/register — valid data returns 200 + token + id

| Field | Detail |
|---|---|
| **TC ID** | TC-API-04 |
| **REQ ID** | REQ-API-04 |
| **Type** | Functional — Happy Path |
| **Priority** | High |
| **Endpoint** | POST /api/register |

**Request Body:**
```json
{ "email": "eve.holt@reqres.in", "password": "pistol" }
```

**Assertions:**
- Status: `200`
- `body.token` is defined
- `body.id` is defined

**Design Rationale:** Register endpoint returns both a token and an assigned ID. Both fields asserted.

---

### TC-API-05 — POST /api/register — missing password returns 400

| Field | Detail |
|---|---|
| **TC ID** | TC-API-05 |
| **REQ ID** | REQ-API-05 |
| **Type** | Negative — Missing Required Field |
| **Priority** | High |
| **Endpoint** | POST /api/register |

**Request Body:**
```json
{ "email": "sydney@fife" }
```

**Assertions:**
- Status: `400`
- `body.error === 'Missing password'`

---

## API Test Cases — `tests/api/users.spec.ts`

---

### TC-API-06 — GET /api/users?page=2 — returns paginated list

| Field | Detail |
|---|---|
| **TC ID** | TC-API-06 |
| **REQ ID** | REQ-API-06 |
| **Type** | Functional |
| **Priority** | High |
| **Endpoint** | GET /api/users?page=2 |

**Assertions:**
- Status: `200`
- `body.page === 2`
- `Array.isArray(body.data) === true`
- `body.data.length > 0`
- `body.total === 12`

**Design Rationale:** Tests pagination query parameter. Schema check on `data` being an array, not just defined.

---

### TC-API-07 — GET /api/users/2 — single user returns correct object

| Field | Detail |
|---|---|
| **TC ID** | TC-API-07 |
| **REQ ID** | REQ-API-07 |
| **Type** | Functional |
| **Priority** | High |
| **Endpoint** | GET /api/users/2 |

**Assertions:**
- Status: `200`
- `body.data.id === 2`
- `body.data.email` is defined
- `typeof body.data.first_name === 'string'`

**Design Rationale:** Verifies path parameter routing. Type check on `first_name` confirms schema integrity.

---

### TC-API-08 — GET /api/users/23 — non-existent user returns 404

| Field | Detail |
|---|---|
| **TC ID** | TC-API-08 |
| **REQ ID** | REQ-API-08 |
| **Type** | Negative |
| **Priority** | High |
| **Endpoint** | GET /api/users/23 |

**Assertions:**
- Status: `404`

**Design Rationale:** This is a PASS when status is 404. Tests correct not-found handling. No `.json()` call — body may be empty or `{}`.

---

### TC-API-09 — PUT /api/users/2 — update returns 200 + updated data

| Field | Detail |
|---|---|
| **TC ID** | TC-API-09 |
| **REQ ID** | REQ-API-09 |
| **Type** | Functional |
| **Priority** | High |
| **Endpoint** | PUT /api/users/2 |

**Request Body:**
```json
{ "name": "Soma Sai", "job": "SDET" }
```

**Assertions:**
- Status: `200`
- `body.name === 'Soma Sai'`
- `body.job === 'SDET'`
- `body.updatedAt` is defined

**Design Rationale:** Three assertions: sent fields reflected back (update applied) + `updatedAt` proves server processed and timestamped the change.

---

### TC-API-10 — DELETE /api/users/2 — returns 204 no content

| Field | Detail |
|---|---|
| **TC ID** | TC-API-10 |
| **REQ ID** | REQ-API-10 |
| **Type** | Functional |
| **Priority** | High |
| **Endpoint** | DELETE /api/users/2 |

**Assertions:**
- Status: `204`
- No `.json()` call — 204 has no body

**Design Rationale:** 204 No Content means the operation succeeded with no response body. Calling `.json()` on a 204 throws a parse error. Status-only assertion is correct and complete.

---

## Test Design Summary

| Category | UI Tests | API Tests | Total |
|---|---|---|---|
| Happy path / Functional | 2 | 6 | 8 |
| Negative / Missing field | 4 | 4 | 8 |
| Edge / Boundary / Security | 4 | 0 | 4 |
| **Total** | **10** | **10** | **20** |
