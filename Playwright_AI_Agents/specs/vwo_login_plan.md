# VWO Login Page — Test Plan

## Application Overview

This test plan covers the VWO login page at https://app.vwo.com/#/login. The page presents a standard login form with an email address field, a password field with a toggle for visibility, a "Sign in" submit button, a "Forgot Password?" link, and additional sign-in options (Google, SSO, Passkey). The left panel shows the VWO branding and a promotional banner. All scenarios use only getByRole locators as required.

## Test Scenarios

### 1. VWO Login Page Tests

**Seed:** `tests/seed.spec.ts`

#### 1.1. Scenario 1 — Page Load Smoke

**File:** `tests/vwo-login/page-load-smoke.spec.ts`

**Steps:**
  1. Navigate to https://app.vwo.com/#/login and wait for the page to fully load.
    - expect: The page title is 'Login - VWO'
  2. Assert the VWO logo image is visible using: page.getByRole('img', { name: 'VWO' })
    - expect: The VWO logo image is visible in the top area of the login form
  3. Assert the Email address input is visible using: page.getByRole('textbox', { name: 'Email address' })
    - expect: The email input field is visible and focusable
  4. Assert the Password input is visible using: page.getByRole('textbox', { name: 'Password' })
    - expect: The password input field is visible
  5. Assert the Sign in button is visible using: page.getByRole('button', { name: 'Sign in' })
    - expect: The 'Sign in' submit button is visible and enabled
  6. Assert the Forgot Password link/button is visible using: page.getByRole('button', { name: 'Forgot Password?' })
    - expect: The 'Forgot Password?' button is visible on the page

#### 1.2. Scenario 2 — Invalid Credentials

**File:** `tests/vwo-login/invalid-credentials.spec.ts`

**Steps:**
  1. Navigate to https://app.vwo.com/#/login and wait for the page to load.
    - expect: The login form is visible
  2. Click the email input and type an invalid email: page.getByRole('textbox', { name: 'Email address' }).fill('test_invalid@example.com')
    - expect: The email field contains 'test_invalid@example.com'
  3. Click the password input and type a wrong password: page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword123!')
    - expect: The password field is populated (characters are masked)
  4. Click the Sign in button: page.getByRole('button', { name: 'Sign in' }).click()
    - expect: The form is submitted
  5. Wait for a server response and assert that an error message is displayed on the page. Check for a role='alert' or an error heading/text such as 'Invalid credentials' or 'Your email or password is incorrect'.
    - expect: An error message appears on the page informing the user that the credentials are invalid
    - expect: The user is NOT redirected to the dashboard
    - expect: The login form remains visible

#### 1.3. Scenario 3 — Empty Form Submission

**File:** `tests/vwo-login/empty-form-submission.spec.ts`

**Steps:**
  1. Navigate to https://app.vwo.com/#/login and wait for the page to load.
    - expect: The login form is visible with empty email and password fields
  2. Without entering any data in any field, click the Sign in button directly: page.getByRole('button', { name: 'Sign in' }).click()
    - expect: The click action is registered
  3. Assert that validation error messages appear. Look for an alert role or visible error text near the email field such as 'This field is required' or 'Please enter your email'.
    - expect: Client-side validation messages appear for the empty email field
    - expect: Client-side validation messages appear for the empty password field (or email field validation stops submission first)
    - expect: The form is NOT submitted to the server
    - expect: The user remains on the login page
  4. Verify the email input still has focus or shows a visual error state: page.getByRole('textbox', { name: 'Email address' })
    - expect: The email field is highlighted or shows a required-field indicator

#### 1.4. Scenario 4 — SQL Injection in Email Field

**File:** `tests/vwo-login/sql-injection-email.spec.ts`

**Steps:**
  1. Navigate to https://app.vwo.com/#/login and wait for the page to load.
    - expect: The login form is visible
  2. Click the email input and type the SQL injection string: page.getByRole('textbox', { name: 'Email address' }).fill("' OR '1'='1")
    - expect: The email field accepts the input string without crashing
  3. Click the password input and type any value: page.getByRole('textbox', { name: 'Password' }).fill('anyPassword')
    - expect: The password field is populated
  4. Click the Sign in button: page.getByRole('button', { name: 'Sign in' }).click()
    - expect: The form is submitted
  5. Wait for the page to respond and assert: (a) the page does not show a 500 Internal Server Error, (b) no unhandled exception or stack trace is rendered, (c) an appropriate error message or validation message is shown.
    - expect: The page handles the SQL injection input gracefully
    - expect: No 500 error page or server crash page is displayed
    - expect: The page shows either a standard invalid-credentials error message or a validation error for invalid email format
    - expect: The user remains on the login page and the application is still functional
  6. Verify the Sign in button is still accessible after the submission: page.getByRole('button', { name: 'Sign in' })
    - expect: The Sign in button is still visible, confirming the page has not crashed

#### 1.5. Scenario 5 — Forgot Password Button Visibility

**File:** `tests/vwo-login/forgot-password-visibility.spec.ts`

**Steps:**
  1. Navigate to https://app.vwo.com/#/login and wait for the page to load.
    - expect: The login form is fully rendered
  2. Assert that the Forgot Password button is present and visible in the DOM using: page.getByRole('button', { name: 'Forgot Password?' })
    - expect: The 'Forgot Password?' button is visible on the page
    - expect: It is rendered within the login form list, below the password input field
    - expect: It is not hidden, covered, or off-screen
  3. Do NOT click the Forgot Password button. Only assert its visibility state (isVisible() should return true).
    - expect: The visibility assertion passes
    - expect: No navigation away from the login page occurs
    - expect: The login form remains intact and unmodified
