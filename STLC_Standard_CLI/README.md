# STLC Standard CLI

This project is a Playwright-based UI automation suite for the VWO login flow, built using the Standard CLI approach in the STLC portfolio. It demonstrates how manual test cases can be translated into maintainable automated tests with a Page Object Model (POM), structured test cases, and GitHub Actions CI integration.

## Project Goal

The objective of this project is to automate the core login scenarios for VWO and validate them in a realistic end-to-end testing setup. The suite focuses on:

- Login page availability and UI validation
- Negative login scenarios
- Server-side validation behavior
- CI execution with Playwright reports

## What This Project Includes

- Playwright test automation for the VWO login page
- A reusable Page Object Model in the pages folder
- Browser-based tests for Chromium, Firefox, and WebKit
- GitHub Actions workflow for automated execution
- Project notes and CI failure analysis documents

## Project Structure

```text
STLC_Standard_CLI/
├── .github/workflows/
│   └── playwright.yml
├── pages/
│   └── LoginPage.ts
├── tests/
│   └── vwo_login.spec.ts
├── CI_FAILURE_ANALYSIS.md
├── CONCEPTS.md
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

## Key Files

- pages/LoginPage.ts: Contains the Page Object Model for login page interactions.
- tests/vwo_login.spec.ts: Contains the automated test cases.
- playwright.config.ts: Defines Playwright configuration, browsers, timeouts, and reporter settings.
- .github/workflows/playwright.yml: Runs the test suite in GitHub Actions.
- CI_FAILURE_ANALYSIS.md: Explains CI issues and their fixes.
- CONCEPTS.md: Covers important automation concepts used in this project.

## Prerequisites

Make sure the following are installed:

- Node.js (recommended: 20+ or 24 for CI compatibility)
- npm

## Installation

From the STLC_Standard_CLI folder, install dependencies:

```bash
npm ci
```

Install Playwright browsers:

```bash
npx playwright install --with-deps
```

## Running Tests

Run the full suite:

```bash
npm test
```

Run tests in UI mode:

```bash
npm run test:ui
```

Run tests in debug mode:

```bash
npm run test:debug
```

Run tests in headed mode:

```bash
npm run test:headed
```

## Covered Test Cases

The current suite includes the following scenarios:

1. Login page loads with all key elements visible
2. Submitting credentials triggers server-side validation
3. Invalid email and wrong password shows error
4. Valid email with wrong password shows error
5. Empty email and empty password shows error
6. Valid email with empty password shows error

## CI/CD

This project includes a GitHub Actions workflow that can be triggered automatically on push and pull request events, and manually from the Actions tab.

### Manual Run in GitHub

1. Open your GitHub repository
2. Go to Actions
3. Select the Playwright workflow
4. Click Run workflow
5. Choose the branch and start the run

## Test Reports

Playwright generates HTML reports in the playwright-report folder after test execution.

## Notes

- The Playwright configuration sets a longer assertion timeout to account for VWO's server-side validation response time.
- The workflow is configured to run in CI with browser stability in mind.
- The project is intended as a reference implementation for STLC-based test automation.

## Documentation References

- CI_FAILURE_ANALYSIS.md
- CONCEPTS.md

This README provides a quick start guide and overview for the STLC Standard CLI automation project.
