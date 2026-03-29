# Block B — Automation Foundations

**Project:** VWO Login Dashboard  
**URL:** https://app.vwo.com/#/login  
**Approach:** Playwright + TypeScript Code Drill  

---

## Overview

Block B started with a blank-file code drill — writing Playwright + TypeScript for VWO login from memory with no notes. From that code, 5 automation concepts were extracted and answered. Every answer is grounded in code actually written — not memorised definitions.

---

## The Code Drill — vwo_login.spec.ts

```typescript
import { test, expect } from '@playwright/test';
import { validUser, invalidUser } from '../utils/testData';

test('vwo valid login', async ({ page }) => {
    await page.goto('https://app.vwo.com/#/login');

    await page.getByRole('textbox', { name: 'Email address' }).fill(validUser.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(validUser.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading')).toBeVisible();
});

test('vwo invalid login', async ({ page }) => {
    await page.goto('https://app.vwo.com/#/login');

    await page.getByRole('textbox', { name: 'Email address' }).fill(invalidUser.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(invalidUser.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/login/);
    await expect(page.getByText('Your email, password, IP')).toBeVisible();
});
```

## Test Data — utils/testData.ts

```typescript
export const validUser = {
    email: 'your_vwo_test_email@gmail.com',
    password: 'YourVWOPassword123!'
};

export const invalidUser = {
    email: 'wronguser@gmail.com',
    password: 'wrongpassword'
};
```

---

## 4 Corrections Found During Code Review

| # | Issue | Wrong | Correct |
|---|---|---|---|
| 1 | Invalid login URL assertion | `toHaveURL(/dashboard/)` | `toHaveURL(/login/)` — user must stay on login page |
| 2 | Heading assertion incomplete | `expect(heading)` — no matcher | `expect(heading).toBeVisible()` — matcher required |
| 3 | Double await typo | `await await page.goto()` | `await page.goto()` |
| 4 | Wrong test data values | `email: 'tomsmith'` — herokuapp data | Use actual VWO test account credentials |

---

## Q1 — Selenium vs Playwright: When to Use Which?

| | Selenium | Playwright |
|---|---|---|
| Released | 2004 — legacy | 2020 — modern |
| Browser Support | All browsers including IE | Chromium, Firefox, WebKit |
| Waits | Manual implicit/explicit waits | Built-in auto-wait |
| Speed | Slower | Faster |
| TypeScript Support | Limited | Native |

**When to use Selenium:** Legacy Java projects, wide browser support needed, existing Selenium Grid infrastructure.

**When to use Playwright:** New projects, TypeScript stack, faster execution needed, modern SDET roles.

> *"I work with Playwright because it has built-in auto-wait which eliminates flaky tests, native TypeScript support, and faster execution. Selenium is still used in legacy Java projects or when wide browser coverage including older browsers is needed."*

---

## Q2 — What is POM and Why?

POM (Page Object Model) separates locators and actions from test logic.

```
project/
├── pages/
│   ├── LoginPage.ts       ← locators + actions for login page
│   └── DashboardPage.ts   ← locators + actions for dashboard
├── tests/
│   └── vwo_login.spec.ts  ← test logic only, no locators
└── utils/
    └── testData.ts        ← test data separated from tests
```

**Why POM matters:** When a selector changes, update it in one place — the page class. All tests continue to work. Without POM, one selector change breaks 50 test files.

> *"POM separates locators and actions from test logic. Each page has its own class. When a selector changes I update it in one place — the page class — and all tests continue to work."*

---

## Q3 — How Do You Handle iFrames?

An iframe is an embedded page within a page. Normal locators cannot reach inside it.

**In Playwright:**
```typescript
const frame = page.frameLocator('#iframe-id');
await frame.getByRole('button', { name: 'Submit' }).click();
```

**In Selenium:**
```java
driver.switchTo().frame("iframe-id");
driver.findElement(By.id("submit")).click();
driver.switchTo().defaultContent();
```

> *"In Playwright I use frameLocator() to switch context into the iframe then interact normally. In Selenium it is driver.switchTo().frame() and then switchTo().defaultContent() to return."*

---

## Q4 — Implicit vs Explicit Wait vs Auto-Wait

| | What it is | Used in | Problem |
|---|---|---|---|
| Implicit Wait | Global timeout for ALL elements | Selenium | Slows entire test suite |
| Explicit Wait | Targeted wait for specific condition | Selenium | Manual code required per element |
| Auto-Wait | Built-in — waits before every action automatically | Playwright | None — this is the solution |

**Why no waits in Playwright code:** Before every action, Playwright automatically waits for the element to be visible, enabled, stable, and ready. No manual wait statements needed.

> *"Playwright uses auto-wait — before every action it automatically waits for the element to be visible, enabled, and stable. That is why my Playwright code has no wait statements."*

---

## Q5 — How Do You Run Tests in CI?

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

**Key commands:**
```bash
npx playwright test                    # run all tests
npx playwright test vwo_login.spec.ts  # run specific file
npx playwright test --headed           # run with browser visible
npx playwright show-report             # open HTML report
```

> *"I use GitHub Actions. A YAML file in the repo defines the pipeline. On every push it installs dependencies, runs npx playwright test, and uploads the HTML report as an artifact."*
