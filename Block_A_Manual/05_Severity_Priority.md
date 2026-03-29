# Phase 4 — Severity vs Priority

**Project:** VWO Login Dashboard  
**Concept:** Two independent bug classifications  

---

## The Core Distinction

| | Definition | Question to Ask |
|---|---|---|
| **Severity** | Impact on the system — how badly does this break functionality? | How broken is it? |
| **Priority** | Urgency of the fix — how soon must this be fixed? | How urgent is the fix? |

> **They are independent.** A bug can be Low severity but High priority, or High severity but Low priority.

---

## Applied to VWO — BUG_Login_PWD001

**Bug:** Password field accepts weak passwords like `abc` without error.

- **Severity = High** — Security risk. Any user can set a weak password. System-wide impact.
- **Priority = High** — Login is the entry point to the application. Must be fixed before release.

---

## The Flip Example — Most Important for Interviews

**Bug:** VWO logo is slightly misaligned on mobile login page.

- **Severity = Low** — No functional impact. User can still log in. Core functionality unaffected.
- **Priority = Medium** — Visible to thousands of users on a high-traffic public page. Fix before next release but not blocking.

> A cosmetic bug on a homepage = **Low severity, Medium/High priority**.  
> This is the classic example that shows you understand the difference.

---

## Severity Levels

| Level | Description | Example |
|---|---|---|
| **Critical** | System crash, data loss, security breach | Login page inaccessible to all users |
| **High** | Major feature broken, workaround difficult | Weak passwords accepted — security risk |
| **Medium** | Feature partially broken, workaround exists | Forgot password email delayed but arrives |
| **Low** | Minor cosmetic issue, no functional impact | Logo misaligned on mobile |

---

## Priority Levels

| Level | Description |
|---|---|
| **High** | Fix immediately — blocks release or affects all users |
| **Medium** | Fix in current sprint — visible to users but not blocking |
| **Low** | Fix when time permits — minor, rarely noticed |
