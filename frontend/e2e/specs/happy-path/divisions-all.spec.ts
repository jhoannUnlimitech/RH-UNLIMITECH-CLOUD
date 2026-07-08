/**
 * Divisions Master Spec — Full CRUD lifecycle (self-contained).
 *
 * Creates, searches, edits, and deletes a division.
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToDivisions,
  createDivision,
  searchDivision,
  editFirstDivision,
  deleteFirstDivision,
} from '../../factories/divisions.factory';
import { LOGIN_MOISES } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

const ts = Date.now().toString().slice(-6);
const TEST_DIV = {
  name: `Test Division ${ts}`,
  code: `TD${ts}`,
  description: 'División creada por e2e test',
};

e2e.describe.serial('Divisions — Full CRUD Lifecycle', () => {
  // ─── CREATE VIA API (more reliable for test setup) ────────────────────
  e2e('1. Login and navigate to /divisions',
    loginAndNavigateToDivisions(getPage, LOGIN_MOISES));

  e2e('2. Create division via API', async () => {
    const page = getPage();
    // Get token from cookie
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'rh_auth_token');
    const baseApi = 'http://localhost:9050/api/v1';

    // Get Moises's ID for managerId
    const meRes = await page.evaluate(async (api) => {
      const res = await fetch(`${api}/auth/me`, { credentials: 'include' });
      return res.json();
    }, baseApi);
    const managerId = (meRes as any).data?.employee?.id;

    // Create division via API
    const createRes = await page.evaluate(async ({ api, div, mgr }) => {
      const res = await fetch(`${api}/divisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...div, managerId: mgr }),
      });
      return res.json();
    }, { api: baseApi, div: TEST_DIV, mgr: managerId });

    expect((createRes as any).success !== false).toBe(true);
  });

  // ─── SEARCH & VERIFY ──────────────────────────────────────────────────
  e2e('3. Reload and search for created division', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-test-context="divisions-list"]', { timeout: 10_000 });
    const searchInput = page.locator('[data-test-context="divisions-list"] [data-test-key="search-input"]');
    await searchInput.fill(TEST_DIV.name);
    await page.waitForTimeout(1000);
  });

  e2e('4. Verify in table', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: TEST_DIV.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('5. Verify code in table', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: TEST_DIV.code });
    await expect(row.first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── EDIT ─────────────────────────────────────────────────────────────
  e2e('6. Edit division — change description',
    editFirstDivision(getPage, { description: 'Descripción actualizada por e2e' }));

  e2e('7. Search again',
    searchDivision(getPage, TEST_DIV.name));

  e2e('8. Verify edit success', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="divisions-list"]')).toBeVisible();
    const error = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await error.isVisible().catch(() => false)).toBe(false);
  });

  // ─── DELETE ───────────────────────────────────────────────────────────
  e2e('9. Delete division',
    deleteFirstDivision(getPage));

  e2e('10. Verify deleted (no error)', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    const error = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await error.isVisible().catch(() => false)).toBe(false);
  });
});
