# Phase 2 — Test Planning

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Manual Test Planning  

---

## What is Test Planning?

Test Planning defines what will be tested, what will not be tested, the approach, tools, and risks — before writing any test cases. It sets the boundary for the entire test effort.

---

## In Scope — What Will Be Tested

- UI behaviour — input fields, buttons, checkboxes, links, visibility states
- Valid login flow — correct credentials, successful dashboard redirect
- Invalid login flow — wrong password, wrong email, error messages shown
- Empty field submission — Sign In clicked with no data entered
- Input format validation — email format rules, password strength rules
- Button state behaviours — enabled/disabled states and response messages

---

## Out of Scope — What Will NOT Be Tested

| What | Why Out of Scope |
|---|---|
| Performance testing | Needs separate tools and load setup — not UI automation scope |
| Security / penetration testing | Needs specialist expertise and OWASP knowledge |
| API response validation | Backend concern — needs separate API testing layer |
| GDPR / WCAG / CCPA compliance | Legal and standards audit — not functional test scope |
| SSO / SAML integration | Needs enterprise account — environment not available |

---

## Test Approach

- **Tool:** Playwright + TypeScript
- **Type:** Functional UI Testing
- **Environment:** Chrome, Firefox, Safari — Windows and MacOS
- **Test Data:** Separate `testData.ts` file — valid and invalid credential sets
- **Execution:** Local + GitHub Actions CI pipeline

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| VWO login page structure changes | Test locators break | Use role-based locators — more stable than CSS selectors |
| No enterprise account for SSO testing | SSO flow untested | Mark SSO as out of scope — log as known gap |
| Password strength rules undocumented | Wrong test data | Raise clarification query to dev team |

---

## Entry and Exit Criteria

**Entry Criteria — Testing starts when:**
- Login page is accessible at app.vwo.com/#/login
- Valid test credentials are available
- Playwright environment is configured

**Exit Criteria — Testing ends when:**
- All in-scope test cases executed
- All critical and high severity bugs logged
- Pass rate above 90%
- Test closure report signed off
