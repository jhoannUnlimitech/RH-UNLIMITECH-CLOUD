/**
 * Dashboard Spec — Validates the main dashboard page.
 *
 * Tests:
 * - Page loads with welcome message
 * - User info (hat + division) is displayed
 * - CSW stats cards are visible
 * - Quick links are functional
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import { LOGIN_DEVELOPER } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

async function loginAs(page: any) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/signin`);
  await page.waitForSelector('[data-test-context="login-form"][data-test-state="ready"]', { timeout: 15_000 });
  await page.locator('[data-test-key="email-input"]').fill(LOGIN_DEVELOPER.email);
  await page.locator('[data-test-key="password-input"]').fill(LOGIN_DEVELOPER.password);
  await page.locator('[data-test-key="submit-button"]').click();
  await page.locator('[data-test-context="signin-page"]').waitFor({ state: 'hidden', timeout: 15_000 });
}

e2e.describe.serial('Dashboard — Main Page', () => {
  e2e('1. Login and land on dashboard', async () => {
    const page = getPage();
    await loginAs(page);
    await page.waitForSelector('[data-test-context="dashboard"]', { timeout: 15_000 });
  });

  e2e('2. Verify welcome title with user name', async () => {
    const page = getPage();
    const title = page.locator('[data-test-key="welcome-title"]');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Hola');
  });

  e2e('3. Verify user info shows hat and division', async () => {
    const page = getPage();
    const info = page.locator('[data-test-key="user-info"]');
    await expect(info).toBeVisible();
    await expect(info).toContainText('DEVELOPER');
    await expect(info).toContainText('Infraestructura');
  });

  e2e('4. Verify CSW stats cards are visible', async () => {
    const page = getPage();
    // Should have stats showing total/pending/approved/rejected
    const statsSection = page.locator('text=Total').or(page.locator('text=Mis Solicitudes'));
    await expect(statsSection.first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('5. Verify quick links section exists', async () => {
    const page = getPage();
    // Quick links in dashboard content (not sidebar)
    const dashboardContent = page.locator('[data-test-context="dashboard"]');
    const myRequestsLink = dashboardContent.locator('a[href="/csw/my-requests"]');
    await expect(myRequestsLink.first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('6. Verify "Mis Solicitudes" quick link navigates correctly', async () => {
    const page = getPage();
    const dashboardContent = page.locator('[data-test-context="dashboard"]');
    const link = dashboardContent.locator('a[href="/csw/my-requests"]').first();
    await link.click();
    await page.waitForURL('**/csw/my-requests', { timeout: 5_000 });
    await page.goBack();
    await page.waitForSelector('[data-test-context="dashboard"]', { timeout: 5_000 });
  });

  e2e('7. Verify division info is displayed', async () => {
    const page = getPage();
    // Dashboard should show "Mi División" section
    const divSection = page.locator('text=Mi División').or(page.locator('text=División'));
    await expect(divSection.first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('8. Verify page has no errors', async () => {
    const page = getPage();
    const error = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await error.isVisible().catch(() => false)).toBe(false);
  });
});
