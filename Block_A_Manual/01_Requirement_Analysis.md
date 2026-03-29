# Phase 1 — Requirement Analysis

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Manual PRD Analysis  

---

## What is Requirement Analysis?

Requirement Analysis is the first phase of STLC where the QA team reads the PRD, identifies what is testable, flags what is unclear, and produces a clarification list for developers — before writing a single test case.

---

## Testable Requirements — Identified from VWO PRD

| # | Requirement | Testable? | Reason |
|---|---|---|---|
| 1 | Email + password login | ✅ Yes | Can verify valid/invalid combinations |
| 2 | Real-time field validation on blur | ✅ Yes | Can trigger and observe error messages |
| 3 | Forgot password flow | ✅ Yes | Can verify redirect and response |
| 4 | Remember Me checkbox | ✅ Yes | Can verify session persistence |
| 5 | Page loads within 2 seconds | ✅ Yes | Can measure with performance tools |
| 6 | Masked password field | ✅ Yes | Can verify input is hidden |
| 7 | Dark/Light theme mode | ✅ Yes | Can verify CSS class toggle |
| 8 | Mobile responsive layout | ✅ Yes | Can verify with viewport resize |
| 9 | 99.9% uptime SLA | ❌ No | Infrastructure concern — not UI scope |
| 10 | GDPR compliance | ❌ No | Legal audit — not automation scope |
| 11 | SSO/SAML integration | ⚠️ Partial | Needs enterprise account access |

---

## Clarification List — Flagged for Dev/BA

These items appeared in the PRD but require developer or BA input before test design can begin:

- **ARIA labels / Screen Reader support** — need dev input on what specific behaviour to verify
- **OWASP authentication guidelines** — need security team to define test scope
- **WCAG 2.1 AA compliance** — need accessibility audit scope defined
- **OAuth and SAML SSO flows** — need enterprise test account access
- **GDPR and CCPA compliance** — legal audit, not automation scope

---

## Key Insight

> Flagging what you don't know is the most important output of requirement analysis. In real projects this becomes your question list to developers before test design starts. A QA who asks the right questions before writing tests saves the entire team from rework.
