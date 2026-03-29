# Phase 5 — Regression vs Retesting

**Project:** VWO Login Dashboard  
**Concept:** Two types of testing after a bug fix  

---

## The Core Distinction

| | Definition | When it happens |
|---|---|---|
| **Retesting** | Verify that a specific bug has been fixed | Immediately after developer marks bug as Fixed |
| **Regression Testing** | Verify that the fix did not accidentally break anything else that was already working | After retesting confirms the fix works |

---

## Applied to VWO — BUG_Login_PWD001 Fix Scenario

**Scenario:** Developer fixes the password validation bug — weak passwords now rejected.

### Retesting
- You test the password field again with `abc`, `123456`, `abcdefgh`
- Error message now shows correctly
- You confirm BUG_Login_PWD001 is fixed
- **This is Retesting** — verifying the specific fix

### Regression Testing
- You then run ALL other test cases:
  - TCD_LOGIN_UI01 — email field validation
  - TCD_LOGIN_UI03 — empty field submission
  - TCD_LOGIN_UI04 — valid login flow
  - TCD_LOGIN_UI05 — invalid login flow
- None of these were affected by the bug — but the developer's code change might have touched shared login logic
- You verify nothing else broke
- **This is Regression Testing** — protecting what was already working

---

## Why Regression Testing Matters

A developer fixing password validation may have touched shared authentication logic. That change could accidentally break:
- Email field validation
- Sign In button behaviour
- Session handling

You don't know what they changed internally. So you run everything.

> **The one-line rule:**  
> Retesting = verify the fix.  
> Regression = verify nothing else broke.

---

## In Playwright — Regression is Automatic

```typescript
// Running the full test suite = regression testing
npx playwright test

// Running one specific test = retesting
npx playwright test --grep "password validation"
```

When you run `npx playwright test` after a bug fix — you are performing regression testing. Every test that was passing before must still pass after the fix.
