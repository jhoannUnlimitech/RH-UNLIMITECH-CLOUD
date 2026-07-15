/**
 * Library Permissions — E2E Validation Tests
 *
 * Covers: AC-56 to AC-61 (Permisos y navegación)
 * Tests with two users: admin (Manuel) and read-only (Moises)
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// ─── Admin user tests ─────────────────────────────────────────────────────────

const adminFlow = createSerialFlow();

adminFlow.e2e.describe.serial('Library Permissions — Admin (Manuel)', () => {

  adminFlow.e2e('login as admin', async () => {
    await navigateToSignIn(adminFlow.getPage)();
    await fillLoginForm(adminFlow.getPage, LOGIN_MANUEL)();
    await submitLoginForm(adminFlow.getPage)();
    await verifyDashboardRedirect(adminFlow.getPage)();
  });

  adminFlow.e2e('AC-56: Training section visible in sidebar', async () => {
    const page = adminFlow.getPage();
    // Expand Training section if collapsed
    const trainingSection = page.locator('text="Training"').first();
    await expect(trainingSection).toBeVisible();
  });

  adminFlow.e2e('AC-57: admin items visible (Gestión Biblioteca, Dashboard)', async () => {
    const page = adminFlow.getPage();
    // Click to expand Training submenu
    await page.locator('text="Training"').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('text="Gestión Biblioteca"').first()).toBeVisible();
    await expect(page.locator('text="Dashboard"').first()).toBeVisible();
  });

  adminFlow.e2e('AC-60: admin can access /library/manage', async () => {
    const page = adminFlow.getPage();
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 15_000 });
    expect(page.url()).toContain('/library/manage');
  });

  adminFlow.e2e('AC-60: admin can access /library/categories', async () => {
    const page = adminFlow.getPage();
    await page.goto(`${BASE_URL}/library/categories`);
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 15_000 });
    expect(page.url()).toContain('/library/categories');
  });

  adminFlow.e2e('AC-60: admin can access /library/documents/new', async () => {
    const page = adminFlow.getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 15_000 });
    expect(page.url()).toContain('/library/documents/new');
  });
});

// ─── Read-only user tests ─────────────────────────────────────────────────────

const readOnlyFlow = createSerialFlow();

readOnlyFlow.e2e.describe.serial('Library Permissions — Read-only (Moises)', () => {

  readOnlyFlow.e2e('login as Moises (training:read only)', async () => {
    const page = readOnlyFlow.getPage();
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForSelector('[data-test-state="ready"]', { timeout: 15_000 });
    await page.fill('[data-test-key="email-input"]', 'moises@unlimitech.cloud');
    await page.fill('[data-test-key="password-input"]', 'Pass2014!');
    await page.click('[data-test-key="submit-button"]');
    await page.waitForURL(/^\/$|\/dashboard/, { timeout: 15_000 });
  });

  readOnlyFlow.e2e('AC-56: Training section visible for read-only user', async () => {
    const page = readOnlyFlow.getPage();
    await expect(page.locator('text="Training"').first()).toBeVisible();
  });

  readOnlyFlow.e2e('AC-57: admin items NOT visible for read-only user', async () => {
    const page = readOnlyFlow.getPage();
    await page.locator('text="Training"').first().click();
    await page.waitForTimeout(300);
    // "Gestión Biblioteca" should NOT be visible for read-only
    const gestionItem = page.locator('a[href="/library/manage"]');
    await expect(gestionItem).not.toBeVisible();
  });

  readOnlyFlow.e2e('AC-58: read-only user redirected from /library/manage', async () => {
    const page = readOnlyFlow.getPage();
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForTimeout(3000);
    // Should be redirected (PermissionRoute)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/library/manage');
  });

  readOnlyFlow.e2e('AC-58: read-only user redirected from /library/documents/new', async () => {
    const page = readOnlyFlow.getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/library/documents/new');
  });

  readOnlyFlow.e2e('AC-61: read-only user CAN access /library (vista empleado)', async () => {
    const page = readOnlyFlow.getPage();
    await page.goto(`${BASE_URL}/library`);
    await page.waitForSelector('[data-test-context="library-page"]', { timeout: 15_000 });
    expect(page.url()).toContain('/library');
  });
});
