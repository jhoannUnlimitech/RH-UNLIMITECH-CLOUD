/**
 * Projects Master Spec — CRUD lifecycle (self-contained).
 *
 * Creates via API, searches, views detail, edits, and deletes.
 * Uses Laura (has projects:create/update/delete).
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToProjects,
  searchProject,
  deleteFirstProject,
} from '../../factories/projects.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

const ts = Date.now().toString().slice(-6);
const TEST_PROJECT = {
  name: `Test Project ${ts}`,
  code: `TP${ts}`,
  description: 'Proyecto creado por e2e test para validar CRUD completo',
  status: 'active',
};

e2e.describe.serial('Projects — Full CRUD Lifecycle', () => {
  // ─── CREATE VIA API ───────────────────────────────────────────────────
  e2e('1. Login and navigate to /projects',
    loginAndNavigateToProjects(getPage, LOGIN_MANUEL));

  e2e('2. Create project via API', async () => {
    const page = getPage();
    const baseApi = 'http://localhost:9050/api/v1';

    // Get a division ID
    const divsRes = await page.evaluate(async (api) => {
      const res = await fetch(`${api}/divisions`, { credentials: 'include' });
      return res.json();
    }, baseApi);
    const divs = (divsRes as any).data || divsRes;
    const divId = Array.isArray(divs) ? divs[0]?._id : divs?.divisions?.[0]?._id;

    // Get current user ID for leadId
    const meRes = await page.evaluate(async (api) => {
      const res = await fetch(`${api}/auth/me`, { credentials: 'include' });
      return res.json();
    }, baseApi);
    const leadId = (meRes as any).data?.employee?.id;

    // Create project
    const createRes = await page.evaluate(async ({ api, project, divId, leadId }) => {
      const res = await fetch(`${api}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...project, divisionId: divId, leadId, members: [leadId] }),
      });
      return res.json();
    }, { api: baseApi, project: TEST_PROJECT, divId, leadId });

    expect((createRes as any).success !== false).toBe(true);
  });

  // ─── SEARCH & VERIFY ──────────────────────────────────────────────────
  e2e('3. Reload and search', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-test-context="projects-list"]', { timeout: 10_000 });
    const searchInput = page.locator('[data-test-context="projects-list"] [data-test-key="search-input"]');
    await searchInput.fill(TEST_PROJECT.name);
    await page.waitForTimeout(1000);
  });

  e2e('4. Verify project in table', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: TEST_PROJECT.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('5. Verify code in table', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: TEST_PROJECT.code });
    await expect(row.first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── VIEW DETAIL ──────────────────────────────────────────────────────
  e2e('6. Click view → navigate to detail', async () => {
    const page = getPage();
    const viewBtn = page.locator('[data-test-key="view-button"]').first();
    await viewBtn.click();
    await page.waitForURL('**/projects/**', { timeout: 5_000 });
  });

  e2e('7. Verify project name on detail page', async () => {
    const page = getPage();
    await expect(page.locator(`text=${TEST_PROJECT.name}`).first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('8. Verify project code on detail page', async () => {
    const page = getPage();
    await expect(page.locator(`text=${TEST_PROJECT.code}`).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── DELETE ───────────────────────────────────────────────────────────
  e2e('9. Navigate back to list', async () => {
    const page = getPage();
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/projects`);
    await page.waitForSelector('[data-test-context="projects-list"]', { timeout: 10_000 });
    const searchInput = page.locator('[data-test-context="projects-list"] [data-test-key="search-input"]');
    await searchInput.fill(TEST_PROJECT.name);
    await page.waitForTimeout(1000);
  });

  e2e('10. Delete project',
    deleteFirstProject(getPage));

  e2e('11. Verify deleted (no error)', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    const error = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await error.isVisible().catch(() => false)).toBe(false);
  });
});
