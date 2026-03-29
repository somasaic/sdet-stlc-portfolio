# Phase 1 — Requirement Analysis (MCP-Driven)

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Live page extraction using Playwright MCP  
**Tool:** Claude in Chrome (MCP Client) → Browser Snapshot  

---

## How This Was Generated

Instead of reading a PRD document, Playwright MCP navigated to the live VWO login page and extracted every interactive element directly from the DOM. This gives real, current element data — not documentation that may be outdated.

```
Claude Desktop (MCP Client)
    ↓ browser_snapshot tool
Live VWO Login Page DOM
    ↓ extracted
Interactive Element Audit
```

---

## Total Interactive Elements Found: 43

| Type | Count |
|---|---|
| Input Fields | 9 |
| Buttons | 20 |
| Links | 11 |
| Checkboxes | 3 |

---

## Input Fields

| # | Label | Type | Playwright Locator | Notes |
|---|---|---|---|---|
| 1 | Email address | email | `page.getByRole('textbox', { name: 'Enter email ID' })` | Main login form |
| 2 | Password | password | `page.getByRole('textbox', { name: 'Enter password' })` | Main login form |
| 3 | Email address | email | `page.getByRole('textbox', { name: 'Email address' })` | Forgot Password / SSO flow |
| 4 | Email address | email | `page.getByLabel('Email address').nth(2)` | Reset Password form |
| 5 | New Password | password | `page.getByRole('textbox', { name: 'Enter new password' })` | Reset Password form |
| 6 | Confirm Password | password | `page.getByRole('textbox', { name: 'Confirm new password' })` | Reset Password form |
| 7 | Subject | text | `page.getByRole('textbox', { name: 'Subject' })` | Support ticket modal |
| 8 | Description | text | `page.getByRole('textbox', { name: 'Description' })` | Support ticket modal |
| 9 | Select users search | text | `page.getByRole('textbox', { name: 'No results match' })` | CC Users dropdown search |

---

## Buttons

| # | Label | Playwright Locator | Notes |
|---|---|---|---|
| 1 | Toggle password visibility | `page.getByRole('button', { name: 'Toggle password visibility' }).first()` | Login form |
| 2 | Forgot Password? | `page.getByRole('button', { name: 'Forgot Password?' })` | Login form |
| 3 | Sign in | `page.getByRole('button', { name: 'Sign in' }).first()` | Primary CTA |
| 4 | Sign in with Google | `page.getByRole('button', { name: 'Sign in with Google' })` | OAuth option |
| 5 | Sign in using SSO | `page.getByRole('button', { name: 'Sign in using SSO' })` | SSO option |
| 6 | Sign in with Passkey | `page.getByRole('button', { name: 'Sign in with Passkey' })` | Passkey option |
| 7 | Back | `page.getByRole('button', { name: '« Back' })` | Reset Password form |
| 8 | Reset Password | `page.getByRole('button', { name: 'Reset Password' }).first()` | Reset Password form |
| 9 | Set Password | `page.getByRole('button', { name: 'Set Password' })` | Set Password flow |
| 10 | Back (SSO) | `page.getByRole('button', { name: 'Back' })` | SSO email form |
| 11 | Reset Password (SSO) | `page.getByRole('button', { name: 'Reset Password' }).nth(1)` | SSO flow |
| 12 | Login to your VWO account | `page.getByRole('button', { name: 'Login to your VWO account' })` | ABTasty merger panel |
| 13 | Get Support | `page.getByRole('button', { name: 'Get Support' })` | Footer |
| 14 | Verify Account | `page.getByRole('button', { name: 'Verify Account' })` | Top nav banner |
| 15 | Need Help? Contact Support | `page.getByRole('button', { name: 'Need Help? Contact Support' })` | Top nav |
| 16 | Toggle password visibility (New) | `page.getByRole('button', { name: 'Toggle password visibility' }).nth(1)` | New Password field |
| 17 | Toggle password visibility (Confirm) | `page.getByRole('button', { name: 'Toggle password visibility' }).nth(2)` | Confirm Password field |
| 18 | Submit | `page.getByRole('button', { name: 'Submit' })` | Support ticket modal |
| 19 | Close (modal 1) | `page.getByRole('button', { name: 'Close' }).first()` | Support modal close |
| 20 | Close (modal 2) | `page.getByRole('button', { name: 'Close' }).nth(1)` | Alert/notification close |

---

## Links

| # | Text | Playwright Locator | Destination |
|---|---|---|---|
| 1 | Go to dashboard | `page.getByRole('link', { name: 'Go to dashboard' })` | #/dashboard |
| 2 | Start a free trial | `page.getByRole('link', { name: 'Start a free trial' })` | vwo.com/free-trial |
| 3 | Start a FREE TRIAL | `page.getByRole('link', { name: 'Start a FREE TRIAL' })` | vwo.com/free-trial |
| 4 | Privacy policy | `page.getByRole('link', { name: 'Privacy policy' })` | vwo.com/privacy-policy |
| 5 | Terms | `page.getByRole('link', { name: 'Terms' })` | vwo.com/terms |
| 6 | Developer resources | `page.getByRole('link', { name: 'Developer resources' })` | #/developers |
| 7 | Give us a call | `page.getByRole('link', { name: 'Give us a call' })` | Phone link |
| 8 | Show logged in users | `page.getByRole('link', { name: 'Show logged in users' })` | javascript:void(0) |
| 9 | Uptime Status | `page.getByRole('link', { name: 'Uptime Status' })` | pingdom.com stats |
| 10 | Visit wingify.com | `page.getByRole('link', { name: 'Visit wingify.com' })` | wingify.com |
| 11 | support@vwo.com | `page.getByRole('link', { name: 'support@vwo.com' })` | mailto link |

---

## Checkboxes

| # | Label | Playwright Locator | Notes |
|---|---|---|---|
| 1 | Remember me | `page.getByRole('checkbox', { name: 'Remember me' })` | Login form |
| 2 | CC Other Users | `page.getByRole('checkbox', { name: 'CC Other Users' })` | Support ticket modal |
| 3 | Attach Campaigns | `page.getByRole('checkbox', { name: 'Attach Campaigns' })` | Support ticket modal |

---

## QA Observations — Critical Findings

| Finding | Detail | Impact on Testing |
|---|---|---|
| Multiple hidden forms | 4 form elements exist in DOM simultaneously — login, forgot password, SSO, reset password. Only one visible at a time. | Use `.first()` or visible filter to avoid ambiguity in locators |
| Ambiguous locators | Toggle password visibility appears 3 times in DOM | Always use `.first()`, `.nth(1)`, `.nth(2)` to distinguish |
| javascript:void(0) link | "Show logged in users" has no real href — triggers JS handler | Needs manual verification — cannot assert URL navigation |
| Hidden support modal | Support ticket form always in DOM but hidden | Do not interact without triggering Get Support button first |
| Hidden file input | File input exists for support ticket attachment | `page.locator('button[type="file"]')` |

---

## Manual vs MCP — Phase 1 Comparison

| | Manual (Block A) | MCP (This Phase) |
|---|---|---|
| Source | PRD document | Live DOM snapshot |
| Elements found | ~8 testable requirements | 43 interactive elements |
| Locators | Described in text | Production-ready Playwright locators |
| Hidden elements | Not visible in PRD | Fully exposed — 4 hidden forms found |
| Time taken | 30 minutes reading PRD | Under 2 minutes via MCP snapshot |

---

## Key Insight

> The PRD describes what the product *should* do. MCP reads what the product *actually has* in the DOM right now. Hidden forms, modal elements, and edge-case buttons that never appear in documentation are fully visible to MCP. This is why AI-assisted requirement analysis is faster and more complete than PRD reading alone.
