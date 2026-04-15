import { test, expect } from '@playwright/test';
import { apiData, endpoints } from '../../data/testData';

test.describe('ReqRes API — Authentication Endpoints', () => {

  test('TC-API-01: POST /api/login — valid credentials returns 200 + token', async ({ request }) => {
    const response = await request.post(endpoints.login, {
      data: apiData.validLogin,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
  });

  test('TC-API-02: POST /api/login — missing password returns 400 + error message', async ({ request }) => {
    const response = await request.post(endpoints.login, {
      data: apiData.missingPassword,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Missing password');
  });

  test('TC-API-03: POST /api/login — wrong credentials returns 400 + error', async ({ request }) => {
    const response = await request.post(endpoints.login, {
      data: apiData.invalidLogin,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('TC-API-04: POST /api/register — valid data returns 200 + token and id', async ({ request }) => {
    const response = await request.post(endpoints.register, {
      data: apiData.validRegister,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.token).toBeDefined();
    expect(body.id).toBeDefined();
  });

  test('TC-API-05: POST /api/register — missing password returns 400 + error', async ({ request }) => {
    const response = await request.post(endpoints.register, {
      data: apiData.missingPasswordRegister,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Missing password');
  });

});
