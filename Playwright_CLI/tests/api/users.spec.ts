import { test, expect } from '@playwright/test';
import { apiData, endpoints } from '../../data/testData';

test.describe('ReqRes API — User Resource Endpoints', () => {

  test('TC-API-06: GET /api/users?page=2 — returns 200 + paginated list of users', async ({ request }) => {
    const response = await request.get(`${endpoints.users}?page=2`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.page).toBe(2);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.total).toBe(12);
  });

  test('TC-API-07: GET /api/users/2 — single user returns 200 + valid user object', async ({ request }) => {
    const response = await request.get(endpoints.singleUser);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.id).toBe(2);
    expect(body.data.email).toBeDefined();
    expect(typeof body.data.first_name).toBe('string');
  });

  test('TC-API-08: GET /api/users/23 — non-existent user returns 404', async ({ request }) => {
    const response = await request.get(endpoints.nonExistentUser);

    expect(response.status()).toBe(404);
  });

  test('TC-API-09: PUT /api/users/2 — update user returns 200 + updated data', async ({ request }) => {
    const response = await request.put(endpoints.singleUser, {
      data: apiData.updateUser,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('Soma Sai');
    expect(body.job).toBe('SDET');
    expect(body.updatedAt).toBeDefined();
  });

  test('TC-API-10: DELETE /api/users/2 — returns 204 no content', async ({ request }) => {
    const response = await request.delete(endpoints.singleUser);

    expect(response.status()).toBe(204);
  });

});
