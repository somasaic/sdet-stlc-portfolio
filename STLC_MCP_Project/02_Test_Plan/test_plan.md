# Phase 2 — Test Plan (MCP-Driven)

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Version:** v1.0  
**Approach:** AI-assisted test planning based on live MCP element audit  
**Generated:** March 2026  

---

## Context

This test plan was generated using MCP output from Phase 1 — 43 interactive elements extracted live from the VWO login page DOM. Scope decisions are based on actual elements found, not PRD documentation.

---

## 1. In Scope

Core login form elements targeted for testing:

| Element | Type | Playwright Locator | Test Types |
|---|---|---|---|
| Email field | Input | `page.getByRole('textbox', { name: 'Enter email ID' })` | Functional, Security, UI |
| Password field | Input | `page.getByRole('textbox', { name: 'Enter password' })` | Functional, Security, UI |
| Sign In button | Button | `page.getByRole('button', { name: 'Sign in' }).first()` | Functional, UI, Regression |
| Remember Me checkbox | Checkbox | `page.getByRole('checkbox', { name: 'Remember me' })` | Functional, Session |
| Forgot Password button | Button | `page.getByRole('button', { name: 'Forgot Password?' })` | Functional, Navigation |
| Sign in with Google | Button | `page.getByRole('button', { name: 'Sign in with Google' })` | OAuth, UI |
| Sign in using SSO | Button | `page.getByRole('button', { name: 'Sign in using SSO' })` | SSO, UI |
| Sign in with Passkey | Button | `page.getByRole('button', { name: 'Sign in with Passkey' })` | Passkey, UI |

**Test types in scope:** Functional, Security, UI/UX, Regression, Accessibility, Cross-Browser

---

## 2. Out of Scope

| Area | Reason |
|---|---|
| Support modal (Subject, Description, CC Users) | Triggered by Get Support — separate flow, separate test cycle |
| Reset Password form | Requires email link — separate flow |
| Set Password form | Post-reset flow — not part of login module |
| Footer links (Privacy, Terms, Developer resources) | Static navigation — no functional logic |
| ABTasty merger info panel | Marketing content — not testable functionality |
| Top nav buttons (Verify Account, Need Help) | Separate notification flows |
| Performance / load testing | Requires dedicated tooling — not UI automation scope |
| Mobile native apps | Web only — native app is separate scope |
| Backend API testing | Requires API layer — separate test cycle |

---

## 3. Test Approach

### Testing Layers

| Layer | What is Tested | Tool |
|---|---|---|
| Functional | Login flows — valid, invalid, empty | Playwright + TypeScript |
| Security | SQL injection in fields, brute force simulation | Playwright + TypeScript |
| UI | Element visibility, states, error messages | Playwright + TypeScript |
| OAuth | Google Sign In button navigation | Playwright + TypeScript |
| Accessibility | ARIA labels, keyboard navigation | Playwright + axe-core |
| Cross-Browser | Chrome, Firefox, Safari | Playwright multi-browser |

### POM Structure

```
pages/
└── LoginPage.ts           ← all locators and actions
tests/
└── vwo_login.spec.ts      ← test logic only
utils/
└── testData.ts            ← valid, invalid, edge case data
fixtures/
└── auth.fixture.ts        ← reusable login state
```

### Test Data Matrix — Email Field

| Category | Example | Expected |
|---|---|---|
| Valid format | `user@gmail.com` | Accepted |
| Missing @ | `usergmail.com` | Error shown |
| Missing domain | `user@` | Error shown |
| Empty | `` | Required field error |
| SQL injection | `' OR 1=1 --` | Input sanitised, no DB error |
| XSS payload | `<script>alert(1)</script>` | Input sanitised |
| Max length | 255+ characters | Graceful truncation or error |

### CI/CD Integration

```yaml
# GitHub Actions triggers on every push to main
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm install
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 4. Risk Register

| Risk | Element | Likelihood | Impact | Rating | Mitigation |
|---|---|---|---|---|---|
| SQL injection via email field | Email input | Medium | High | HIGH | Test with injection payloads — verify sanitisation |
| Brute force attack | Sign In button | High | High | HIGH | Verify rate limiting after 5 failed attempts |
| Email enumeration | Error messages | Medium | High | HIGH | Verify generic error — not "email not found" |
| CSRF in OAuth flow | Google Sign In | Low | High | MEDIUM | Verify state parameter present in OAuth redirect |
| Session fixation | Remember Me | Low | High | MEDIUM | Verify new session token generated post-login |
| Password visible in transit | Password field | Low | Critical | HIGH | Verify HTTPS enforced, field type=password |
| Locator ambiguity | Toggle password (×3) | High | Medium | MEDIUM | Use `.first()`, `.nth(1)`, `.nth(2)` consistently |
| Hidden forms interfering | 4 forms in DOM | High | Medium | MEDIUM | Filter by visible — `locator.filter({ visible: true })` |

---

## 5. Entry and Exit Criteria

### Entry Criteria — Testing Starts When

- VWO login page accessible at `https://app.vwo.com/#/login`
- Valid test account credentials available
- Playwright environment configured — `npx playwright install` complete
- All in-scope test cases written and reviewed
- Test data file (`testData.ts`) populated with valid, invalid, and edge case data

### Exit Criteria — Testing Ends When

- All in-scope test cases executed — zero skipped
- Pass rate ≥ 95%
- Zero Critical severity defects open
- All High severity defects logged with reproduction steps
- HTML test report generated and reviewed
- Test closure report signed off

---

## Manual vs MCP — Phase 2 Comparison

| | Manual (Block A) | MCP (This Phase) |
|---|---|---|
| Scope basis | PRD document — 8 requirements | Live DOM — 43 elements, informed scope decisions |
| Out of scope identification | General assumptions | Specific — 4 hidden forms identified and excluded precisely |
| Risk identification | Generic security risks | Element-specific — ambiguous locators, hidden forms flagged |
| Locators in plan | Described in text | Production-ready Playwright locators included |
| Time taken | 20 minutes | Under 5 minutes with MCP context |
