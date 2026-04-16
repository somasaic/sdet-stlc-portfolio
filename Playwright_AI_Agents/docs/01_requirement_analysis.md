# Phase 1 — Requirement Analysis

**Project:** Playwright_AI_Agents  
**Approach:** 5 of 5 — AI Agents + Visual Regression  
**Target:** https://app.vwo.com/#/login  
**Phase owner:** Planner Agent + SDET review  
**Date:** April 2026

---

## How Requirements Were Gathered

Unlike previous approaches where requirements came from a PRD (Block_A_Manual) or a static DOM audit (STLC_Standard_CLI), this project uses the **Planner Agent** to extract requirements directly from the live application.

The planner agent:
1. Calls `planner_setup_page` → runs `seed.spec.ts` → opens a live browser on `/#/login`
2. Uses `browser_snapshot` to read the full accessibility tree of the page
3. Navigates all interactive flows — error states, validation states, navigation links
4. Produces `specs/vwo_login_plan.md` — a structured test plan based on live DOM discovery

This means requirements reflect the **actual current state of the application**, not a document that may be stale.

---

## Application Overview

**Application:** VWO (Visual Website Optimizer) Login Dashboard  
**URL:** `https://app.vwo.com/#/login`  
**Type:** Single Page Application (SPA) — client-side hash routing  
**Auth required:** No — login page is publicly accessible  
**Tech stack observable:** React SPA, hash router, server-side credential validation

---

## Identified UI Elements (from live DOM snapshot)

| Element ID | Role | Accessible Name | Locator |
|---|---|---|---|
| E-01 | textbox | Email address | `getByRole('textbox', { name: 'Email address' })` |
| E-02 | textbox | Password | `getByRole('textbox', { name: 'Password' })` |
| E-03 | button | Sign in | `getByRole('button', { name: 'Sign in', exact: true })` |
| E-04 | button | Forgot Password? | `getByRole('button', { name: 'Forgot Password?' })` |
| E-05 | button | Sign in with Google | `getByRole('button', { name: 'Sign in with Google' })` |
| E-06 | heading | VWO logo / branding | `getByRole('heading')` |
| E-07 | alert / text | Error message (appears on failure) | `getByText` — dynamic, appears post-submit |

**Key DOM behaviour observed:**
- Route: `/#/login` — SPA hash routing, `goto('/login')` does NOT work
- Error message appears after ~14-17 seconds on invalid credentials (server-side validation)
- Empty form submit triggers client-side error within ~2 seconds
- Animated background (CSS) changes every render — impacts visual regression strategy

---

## Functional Requirements

| REQ-ID | Category | Requirement | Testable? |
|---|---|---|---|
| REQ-AI-01 | Smoke | All 5 key elements visible on page load within 5 seconds | Yes |
| REQ-AI-02 | Auth — Negative | Invalid email + wrong password shows error message | Yes |
| REQ-AI-03 | Auth — Negative | Valid email format + wrong password shows same vague error (no user enumeration) | Yes |
| REQ-AI-04 | Validation | Empty form submission triggers client-side error within 5 seconds | Yes |
| REQ-AI-05 | Validation | Email-only submission (empty password) triggers error | Yes |
| REQ-AI-06 | Security | SQL injection input (`' OR 1=1--`) does not crash the app or return 500 | Yes |
| REQ-AI-07 | Security | 500-character email string is handled gracefully — no browser freeze | Yes |
| REQ-AI-08 | Navigation | Forgot Password button is visible and clickable | Yes |
| REQ-AI-09 | Navigation | Sign in with Google button is visible and clickable | Yes |
| REQ-AI-10 | Visual | Login form default state matches committed pixel baseline | Yes |
| REQ-AI-11 | Visual | Error state after invalid login matches committed pixel baseline | Yes |
| REQ-AI-12 | Visual | Email-filled state matches committed pixel baseline | Yes |

---

## Non-Functional Requirements

| NFR-ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Functional tests complete within 60 seconds per test |
| NFR-02 | Stability | Visual regression tests pass consistently across runs (no flaky pixel diffs) |
| NFR-03 | CI | All tests run on GitHub Actions Ubuntu runner on every push to main |
| NFR-04 | Baseline | Visual baselines committed to repo — reproducible across environments |
| NFR-05 | Self-healing | Agent-generated tests are healable by healer agent when selectors change |

---

## Requirements Traceability Matrix (RTM)

| REQ-ID | Test Case ID | Test File | Status |
|---|---|---|---|
| REQ-AI-01 | TC-smoke-01 | tests/login/smoke.spec.ts | Planned |
| REQ-AI-02 | TC-invalid-01 | tests/login/invalid-credentials.spec.ts | Planned |
| REQ-AI-03 | TC-invalid-02 | tests/login/invalid-credentials.spec.ts | Planned |
| REQ-AI-04 | TC-empty-01 | tests/login/edge-cases.spec.ts | Planned |
| REQ-AI-05 | TC-empty-02 | tests/login/edge-cases.spec.ts | Planned |
| REQ-AI-06 | TC-edge-01 | tests/login/edge-cases.spec.ts | Planned |
| REQ-AI-07 | TC-edge-02 | tests/login/edge-cases.spec.ts | Planned |
| REQ-AI-08 | TC-nav-01 | tests/login/smoke.spec.ts | Planned |
| REQ-AI-09 | TC-nav-02 | tests/login/smoke.spec.ts | Planned |
| REQ-AI-10 | TC-VR-01 | tests/visual/login_visual.spec.ts | ✅ Passing |
| REQ-AI-11 | TC-VR-02 | tests/visual/login_visual.spec.ts | ✅ Passing |
| REQ-AI-12 | TC-VR-03 | tests/visual/login_visual.spec.ts | ✅ Passing |

---

## What the Planner Agent Adds Over Manual Requirement Analysis

| Dimension | Manual (Block_A) | Planner Agent (This Project) |
|---|---|---|
| Source | PRD document (may be stale) | Live DOM snapshot (always current) |
| Coverage | 8 elements found from PRD | All visible elements from accessibility tree |
| Time | ~30 minutes of manual reading | 2–5 minutes autonomous exploration |
| Accuracy | Depends on PRD quality | Reflects actual page behaviour |
| Output | Free-form notes | Structured Markdown plan machine-readable by generator |

---

## Key Finding — Animated Background Problem

During planner exploration, the live DOM snapshot revealed that VWO's login page has a **dynamic CSS animated background** that renders differently on every page load.

**Impact on visual regression:** Full-page screenshots taken seconds apart showed 65,000–69,000 pixel differences — not due to UI changes, but due to the animation being at different frames.

**Requirement added (REQ-AI-10/11/12):** Visual baselines must use `clip: boundingBox()` to restrict screenshots to the stable login form area only. This requirement shaped the entire visual regression implementation strategy.