import { test, expect } from '@playwright/test';

/**
 * Bug Demonstration Test — Playwright_CLI
 *
 * Purpose: Intentionally expose and document a real bug found during testing.
 * This test FAILS by design — it documents KAN-2 (logged in JIRA).
 *
 * Bug: ReqRes POST /api/register does not return HTTP 201 (Created) for a
 * successful registration. It returns 200 (OK) instead. Per REST API
 * conventions, resource creation should return 201 Not 200.
 *
 * Severity: Low | Priority: Low | Status: Open in JIRA as KAN-2
 *
 * To run this file:
 *   npx playwright test --project=api tests/api/bug_kan2.spec.ts
 *
 * Expected: This test FAILS — that is the correct behaviour.
 * It proves the bug exists and is documented.
 */

test.describe('Bug Report — KAN-2', () => {

  test('KAN-2: POST /api/register returns 200 instead of expected 201 (Created) — BUG', async ({ request }) => {
    /**
     * REST convention: POST that creates a new resource should return 201 Created.
     * ReqRes returns 200 OK for successful registration — this is incorrect.
     *
     * This test INTENTIONALLY FAILS to document the bug.
     * KAN-2 has been logged in JIRA at somasaicheviti.atlassian.net
     */
    const response = await request.post('/api/register', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'pistol'
      }
    });

    // Actual: response.status() === 200
    // Expected per REST convention: 201 Created
    // This assertion FAILS — which is the point. The bug is real.
    expect(response.status()).toBe(201);
  });

  test('KAN-2: Confirm actual behaviour — POST /api/register returns 200 (documents the bug)', async ({ request }) => {
    /**
     * This companion test PASSES and documents what ReqRes actually returns.
     * Both tests together tell the full story:
     * - Bug test (above): fails because 201 is expected but 200 is returned
     * - This test: passes because it asserts the actual (wrong) behaviour
     *
     * In a real company: the bug test would be marked @known-bug or skipped
     * until the API team fixes the endpoint to return 201.
     */
    const response = await request.post('/api/register', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'pistol'
      }
    });

    const body = await response.json();

    // Documents actual behaviour — this PASSES
    expect(response.status()).toBe(200);
    expect(body.token).toBeDefined();
    expect(body.id).toBeDefined();

    // Logging the bug details in test output
    console.log('KAN-2 Bug confirmed: /api/register returned', response.status(), '— expected 201');
    console.log('Response body:', JSON.stringify(body));
  });

});
