/**
 * testData.ts
 * -----------
 * Central test data store for VWO login page spec.
 * All credentials, boundary values, and injection payloads
 * are maintained here — never hard-coded in spec or POM files.
 *
 * Usage:
 *   import { VALID_USER, INVALID_CASES, BOUNDARY } from '../utils/testData';
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

export const BASE_URL = 'https://app.vwo.com/#/login';

// ─── Valid credentials ────────────────────────────────────────────────────────

export const VALID_USER = {
  email:    'test@vwo.com',
  password: 'Valid@Pass123',
} as const;

// ─── Invalid / negative scenarios ────────────────────────────────────────────

export const INVALID_CASES = {
  /** TC_LOGIN_002 — correct email, wrong password */
  wrongPassword: {
    email:    'test@vwo.com',
    password: 'WrongPass!99',
  },

  /** TC_LOGIN_003 — malformed email formats */
  badEmails: [
    'invalidemail.com',     // missing @
    'test@',                // missing domain
    '@vwo.com',             // missing local part
    'test@@vwo.com',        // double @
    'test @vwo.com',        // space in local part
  ],

  /** TC_LOGIN_004 — empty submit */
  empty: {
    email:    '',
    password: '',
  },
} as const;

// ─── Password toggle test data ─────────────────────────────────────────────

export const PASSWORD_TOGGLE = {
  password:        'MySecret@99',
  maskedType:      'password',
  visibleType:     'text',
} as const;

// ─── Remember Me / session expectations ──────────────────────────────────────

export const REMEMBER_ME = {
  email:              VALID_USER.email,
  password:           VALID_USER.password,
  /** Cookie name used by VWO for auth persistence — update if app changes */
  cookieName:         'auth_token',
  /** Persistent cookie must have a maxAge > 0 */
  minCookieMaxAge:    1,
} as const;

// ─── Forgot Password flow ─────────────────────────────────────────────────────

export const FORGOT_PASSWORD = {
  /** Used only for navigation/UI test — no email is actually sent */
  testEmail: 'test@vwo.com',
} as const;

// ─── Google OAuth expectations ────────────────────────────────────────────────

export const GOOGLE_OAUTH = {
  /** Partial URL to assert redirect destination */
  expectedRedirectHost: 'accounts.google.com',
  /** Regex to validate OAuth state CSRF param is present */
  stateParamRegex:      /[?&]state=[a-zA-Z0-9_-]+/,
  /** Required OAuth query params that must appear in the redirect URL */
  requiredParams:       ['client_id', 'redirect_uri', 'state', 'scope'] as const,
  /** Max ms to wait for OAuth redirect navigation */
  redirectTimeoutMs:    10_000,
} as const;

// ─── Boundary / security payloads ─────────────────────────────────────────────

export const BOUNDARY = {
  /** 255-char email: accepted or truncated gracefully — must not throw 500 */
  longEmail: `${'a'.repeat(243)}@boundary.com`,   // 243 + 1 + 9 + 1 + 3 = 257 chars total

  /** SQL injection — must be sanitised, no DB error exposed */
  sqlInjection: `' OR 1=1--`,

  /** XSS attempt — must render as plain text, no script execution */
  xssPayload: `<script>alert('xss')</script>`,
} as const;

// ─── UI / attribute expectations ──────────────────────────────────────────────

export const UI = {
  /** CSS placeholder text on inputs — verified against live DOM snapshot */
  emailPlaceholder:    'Enter email ID',
  passwordPlaceholder: 'Enter password',

  /** Inline validation error text — verified in DOM audit */
  invalidEmailMsg: 'Invalid email',

  /** Regex pattern for post-login URL — should NOT match #/login */
  dashboardUrlPattern: /.*#\/dashboard/,
  loginUrlPattern:     /.*#\/login/,
} as const;