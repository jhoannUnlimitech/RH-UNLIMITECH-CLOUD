/**
 * Divisions Factory — Interaction logic for the Divisions module.
 */

import { expect, type Page } from '@playwright/test';
import type { LoginData } from '../fixtures/test-data';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginAs(page: Page, credentials: LoginData): Promise<void> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/signin`);
  await page.waitForSelector('[data-test-context="login-form"][data-test-state="ready"]', { timeout: 15_000 });
  await page.locator('[data-test-key="email-input"]').fill(credentials.email);
  await page.locator('[data-test-key="password-input"]').fill(credentials.password);
  await page.locator('[data-test-key="submit-button"]').click();
  await page.locator('[data-test-context="signin-page"]').waitFor({ state: 'hidden', timeout: 15_000 });
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export function loginAndNavigateToDivisions(getPage: () => Page, credentials: LoginData) {
  return async () => {
    const page = getPage();
    await loginAs(page, credentials);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/divisions`);
    await page.waitForSelector('[data-test-context="divisions-list"]', { timeout: 15_000 });
  };
}

// ─── Create Division ────────────────────────────────────────────────────────

export function createDivision(getPage: () => Page, data: { name: string; code: string; description: string }) {
  return async () => {
    const page = getPage();
    // Click create button
    await page.locator('[data-test-key="create-division-button"]').click();
    await page.waitForSelector('[data-test-context="division-form-modal"]', { timeout: 5_000 });
    await page.waitForTimeout(1000);

    const modal = page.locator('[data-test-context="division-form-modal"]');
    // Fill name
    await modal.locator('#name').fill(data.name);
    // Fill code
    await modal.locator('#code').fill(data.code);
    // Fill description
    await modal.locator('#description, textarea').first().fill(data.description);

    // Select manager (required) — pick first available from dropdown
    const managerSelect = modal.locator('#managerId');
    if (await managerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await managerSelect.click();
      await page.waitForTimeout(400);
      // Select the first available option
      const firstOption = page.locator('.absolute.z-50 button').first();
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(300);
      }
    }

    // Submit
    const submitBtn = modal.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('[data-test-context="divisions-list"]', { timeout: 10_000 });
  };
}

// ─── Search ─────────────────────────────────────────────────────────────────

export function searchDivision(getPage: () => Page, term: string) {
  return async () => {
    const page = getPage();
    const searchInput = page.locator('[data-test-context="divisions-list"] [data-test-key="search-input"]');
    await searchInput.fill(term);
    await page.waitForTimeout(1000);
  };
}

// ─── Edit ───────────────────────────────────────────────────────────────────

export function editFirstDivision(getPage: () => Page, updates: { description?: string }) {
  return async () => {
    const page = getPage();
    const editBtn = page.locator('[data-test-key="edit-button"]').first();
    await expect(editBtn).toBeVisible({ timeout: 5_000 });
    await editBtn.click();
    await page.waitForSelector('[data-test-context="division-form-modal"]', { timeout: 5_000 });
    await page.waitForTimeout(500);

    const modal = page.locator('[data-test-context="division-form-modal"]');
    if (updates.description) {
      const descField = modal.locator('#description, textarea').first();
      await descField.clear();
      await descField.fill(updates.description);
    }

    await modal.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
    await page.waitForSelector('[data-test-context="divisions-list"]', { timeout: 10_000 });
  };
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export function deleteFirstDivision(getPage: () => Page) {
  return async () => {
    const page = getPage();
    page.on('dialog', async (dialog) => { await dialog.accept(); });
    const deleteBtn = page.locator('[data-test-key="delete-button"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();
    await page.waitForTimeout(2000);
    // If custom modal, click confirm
    const confirmBtn = page.locator('button').filter({ hasText: 'Confirmar' }).or(page.locator('button').filter({ hasText: 'Eliminar' }));
    if (await confirmBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.first().click();
    }
    await page.waitForTimeout(1500);
  };
}
