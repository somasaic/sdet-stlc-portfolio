# Phase 5 — Defect Reporting (JIRA MCP-Driven)

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**JIRA Board:** somasaicheviti.atlassian.net/jira/software/projects/KAN  
**Approach:** Bug logged directly to JIRA via MCP — no manual entry  

---

## How This Was Generated

Instead of manually creating a JIRA ticket, the JIRA MCP tool was used to log the bug directly from Claude Desktop. One prompt — one ticket created with full ADF-formatted description.

```
Claude Desktop (MCP Client)
    ↓ createJiraIssue tool
JIRA MCP Server
    ↓ API call
somasaicheviti.atlassian.net — KAN project
    ↓ created
KAN-1 Bug Ticket
```

---

## Bug Report — KAN-1

| Field | Detail |
|---|---|
| **Issue Key** | KAN-1 |
| **Project** | VWO Login STLC |
| **Type** | Bug |
| **Priority** | High |
| **Status** | To Do |
| **URL** | https://somasaicheviti.atlassian.net/browse/KAN-1 |

---

## Bug Details

| Field | Detail |
|---|---|
| **Summary** | Password field accepts weak passwords without validation error |
| **Environment** | URL: https://app.vwo.com/#/login \| Feature: Password Field / Client-Side Validation |
| **Playwright Locator** | `page.getByRole('textbox', { name: 'Enter password' })` |
| **Linked Test Case** | TC_LOGIN_002 |

---

## Steps to Reproduce

1. Navigate to `https://app.vwo.com/#/login`
2. Click on the password field (placeholder: `Enter password`)
3. Type a weak password: `abc`
4. Click the Sign In button
5. Observe — no password strength validation error shown, login proceeds

---

## Test Data — Weak Password Variants

| Password | Why Weak |
|---|---|
| `abc` | Only 3 characters, no numbers or special chars |
| `123456` | Numeric only — common brute-force target |
| `abcdefgh` | 8 chars, lowercase only, no numbers or special chars |

---

## Expected vs Actual

| | Detail |
|---|---|
| **Expected** | Validation error shown — password must meet minimum strength rules. Sign In blocked until rules satisfied. |
| **Actual** | Weak password accepted. No error shown. Sign In button remains enabled. Login request dispatched to server. |

---

## Impact

| Area | Impact |
|---|---|
| **Security** | Accounts with weak passwords vulnerable to brute-force and credential stuffing |
| **Compliance** | Violates OWASP Authentication guidelines — minimum password complexity required |
| **UX** | Users not guided toward secure passwords — increases long-term account risk |

---

## Bug Lifecycle — KAN-1 in JIRA

| Status | Who Acts | What Happens |
|---|---|---|
| **To Do** | QA Engineer | Bug logged via JIRA MCP — KAN-1 created |
| **In Progress** | Developer | Developer assigned, fixing password validation logic |
| **In Review** | QA Lead | Fix reviewed before marking complete |
| **Done** | QA Engineer | Retest with `abc`, `123456` — error now shows — bug closed |

---

## Manual vs MCP — Phase 5 Comparison

| | Manual (Block A) | MCP (This Phase) |
|---|---|---|
| Bug entry | Typed manually into JIRA form | One prompt → JIRA MCP → ticket created |
| Format | Plain text fields | Full ADF structured format with code blocks |
| Linked artefacts | Not linked | Linked to TC_LOGIN_002 and test plan risk R-03 |
| Time taken | 10 minutes | Under 1 minute |
| Traceability | Manual reference | Automatic — MCP tied bug to test case and locator |

---

## JIRA MCP Tools Used

| Tool | Purpose |
|---|---|
| `getAccessibleAtlassianResources` | Get cloudId for somasaicheviti.atlassian.net |
| `getVisibleJiraProjects` | Find VWO Login STLC project — key: KAN |
| `getJiraProjectIssueTypesMetadata` | Get Bug issue type ID: 10006 |
| `createJiraIssue` | Create KAN-1 with full ADF description |
