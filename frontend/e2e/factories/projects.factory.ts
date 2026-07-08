/**
 * Projects Factory — Interaction logic for the Projects module.
 */
import { expect, type Page } from '@playwright/test';
import type { LoginData } from '../fixtures/test-data';

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

export function loginAndNavigateToProjects(getPage: () => Page, credentials: LoginData) {
  return async () => {
    const page = getPage();
    await loginAs(page, credentials);
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/projects`);
    await page.waitForSelector('[data-test-context="projects-list"]', { timeout: 15_000 });
  };
}

export function searchProject(getPage: () => Page, term: string) {
  return async () => {
    const page = getPage();
    const searchInput = page.locator('[data-test-context="projects-list"] [data-test-key="search-input"]');
    await searchInput.fill(term);
    await page.waitForTimeout(1000);
  };
}

export function deleteFirstProject(getPage: () => Page) {
  return async () => {
    const page = getPage();
    page.on('dialog', async (dialog) => { await dialog.accept(); });
    const deleteBtn = page.locator('[data-test-key="delete-button"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();
    await page.waitForTimeout(2000);
    const confirmBtn = page.locator('button').filter({ hasText: 'Confirmar' }).or(page.locator('button').filter({ hasText: 'Eliminar' }));
    if (await confirmBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.first().click();
    }
    await page.waitForTimeout(1500);
  };
}
