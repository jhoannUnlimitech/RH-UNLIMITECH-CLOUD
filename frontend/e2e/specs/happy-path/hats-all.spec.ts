/**
 * Hats Master Spec — CRUD lifecycle (self-contained).
 *
 * Creates a hat via API, searches, views, edits, and deletes it.
 * Uses Laura (has roles:read, roles:create, roles:update, roles:delete).
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToHats,
  searchHat,
  deleteFirstHat,
} from '../../factories/hats.factory';
import { LOGIN_LAURA } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

const ts = Date.now().toString().slice(-6);
const TEST_HAT = {
  name: `TEST HAT ${ts}`,
  permissions: [] as string[],
};

e2e.describe.serial('Hats — Full CRUD Lifecycle', () => {
  // ─── CREATE VIA API ───────────────────────────────────────────────────
  e2e('1. Login and navigate to /roles',
    loginAndNavigateToHats(getPage, LOGIN_LAURA));

  e2e('2. Create hat via API', async () => {
    const page = getPage();
    const baseApi = 'http://localhost:9050/api/v1';

    // Get permissions list for the new hat (just use first 2)
    const permsRes = await page.evaluate(async (api) => {
      const res = await fetch(`${api}/permissions`, { credentials: 'include' });
      return res.json();
    }, baseApi);
    const perms = (permsRes as any).data || [];
    const permIds = perms.slice(0, 2).map((p: any) => p._id || p.id);

    // Create hat via API
    const createRes = await page.evaluate(async ({ api, hat, perms }) => {
      const res = await fetch(`${api}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: hat.name, permissions: perms }),
      });
      return res.json();
    }, { api: baseApi, hat: TEST_HAT, perms: permIds });

    expect((createRes as any).success !== false).toBe(true);
  });

  // ─── SEARCH & VERIFY ──────────────────────────────────────────────────
  e2e('3. Reload and search for created hat', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-test-context="hats-list"]', { timeout: 10_000 });
    const searchInput = page.locator('[data-test-context="hats-list"] [data-test-key="search-input"]');
    await searchInput.fill(TEST_HAT.name);
    await page.waitForTimeout(1000);
  });

  e2e('4. Verify hat in table', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: TEST_HAT.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  // ─── VIEW ─────────────────────────────────────────────────────────────
  e2e('5. Click view button', async () => {
    const page = getPage();
    const viewBtn = page.locator('[data-test-key="view-button"]').first();
    await viewBtn.click();
    // Navigates to /roles/view/:id
    await page.waitForURL('**/roles/view/**', { timeout: 5_000 });
  });

  e2e('6. Verify hat name on view page', async () => {
    const page = getPage();
    await expect(page.locator(`text=${TEST_HAT.name}`).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── EDIT ─────────────────────────────────────────────────────────────
  e2e('7. Navigate to edit page', async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    // Go back to list
    await page.goto(`${baseUrl}/roles`);
    await page.waitForSelector('[data-test-context="hats-list"]', { timeout: 10_000 });
    const searchInput = page.locator('[data-test-context="hats-list"] [data-test-key="search-input"]');
    await searchInput.fill(TEST_HAT.name);
    await page.waitForTimeout(1000);
  });

  e2e('8. Click edit button', async () => {
    const page = getPage();
    const editBtn = page.locator('[data-test-key="edit-button"]').first();
    await editBtn.click();
    await page.waitForURL('**/roles/edit/**', { timeout: 5_000 });
  });

  e2e('9. Verify edit page loaded', async () => {
    const page = getPage();
    // The edit page should show the hat name
    await expect(page.locator(`input[value="${TEST_HAT.name}"]`).or(page.locator(`text=${TEST_HAT.name}`))).toBeVisible({ timeout: 5_000 });
  });

  // ─── DELETE ───────────────────────────────────────────────────────────
  e2e('10. Navigate back to list and search', async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/roles`);
    await page.waitForSelector('[data-test-context="hats-list"]', { timeout: 10_000 });
    const searchInput = page.locator('[data-test-context="hats-list"] [data-test-key="search-input"]');
    await searchInput.fill(TEST_HAT.name);
    await page.waitForTimeout(1000);
  });

  e2e('11. Delete hat',
    deleteFirstHat(getPage));

  e2e('12. Verify deleted (no error)', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    const error = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await error.isVisible().catch(() => false)).toBe(false);
  });
});
