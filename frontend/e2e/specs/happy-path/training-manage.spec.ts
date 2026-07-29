/**
 * Training Phase 2 — Manage Page UI (AC-01 to AC-16)
 *
 * Tests the TrainingManage page (/training/manage):
 * - Tab Insignias: CRUD badges
 * - Tab Niveles: CRUD levels
 * - Tab Cursos: CRUD courses
 *
 * Uses admin user (Manuel) who has training:manage permission.
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { navigateToTrainingManage, switchTab } from '../../factories/training.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Training Manage — Badges/Levels/Courses UI (AC-01 to AC-16)', () => {

  e2e('login as admin (Manuel)', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('navigate to /training/manage', async () => {
    await navigateToTrainingManage(getPage)();
  });

  // ─── Tab Insignias (AC-01 to AC-06) ────────────────────────────────────────

  e2e('AC-01: admin sees badges tab with existing badges', async () => {
    const page = getPage();
    // Tab "Insignias" should be active or clickable
    await page.click('button:has-text("Insignias")');
    await page.waitForTimeout(500);
    // Should see at least one badge from seed
    const badges = page.locator('[data-test-context="badges-grid"], .grid');
    await expect(badges.first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-02: admin creates new badge', async () => {
    const page = getPage();
    await page.click('button:has-text("Nueva Insignia")');
    await page.waitForTimeout(500);

    // Fill modal form
    const modal = page.locator('.fixed, [role="dialog"]').last();
    await expect(modal).toBeVisible();

    // Fill name
    await modal.locator('input').first().fill('E2E Test Badge');

    // Fill description if visible
    const descField = modal.locator('textarea').first();
    if (await descField.isVisible()) {
      await descField.fill('Badge created by E2E test');
    }

    // Click create/save button
    await modal.locator('button:has-text("Crear")').click();
    await page.waitForTimeout(1000);
  });

  e2e('AC-03: created badge appears in grid', async () => {
    const page = getPage();
    await expect(page.locator('text=E2E Test Badge').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-04: admin edits badge name', async () => {
    const page = getPage();
    // Find the badge and click edit
    const badgeCard = page.locator('text=E2E Test Badge').first().locator('xpath=ancestor::*[contains(@class,"rounded")]').first();
    const editBtn = badgeCard.locator('button').first();
    await editBtn.click();
    await page.waitForTimeout(500);

    // Change name in modal
    const modal = page.locator('.fixed, [role="dialog"]').last();
    const nameInput = modal.locator('input').first();
    await nameInput.clear();
    await nameInput.fill('E2E Badge Renamed');
    await modal.locator('button:has-text("Actualizar"), button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    // Verify renamed
    await expect(page.locator('text=E2E Badge Renamed').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-05+06: admin deletes badge', async () => {
    const page = getPage();
    // Find badge and delete
    const badgeCard = page.locator('text=E2E Badge Renamed').first().locator('xpath=ancestor::*[contains(@class,"rounded")]').first();
    const buttons = badgeCard.locator('button');
    // Last button should be delete
    await buttons.last().click();
    await page.waitForTimeout(500);

    // Confirm deletion in modal
    const confirmBtn = page.locator('button:has-text("Eliminar")').last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await page.waitForTimeout(1000);

    // Badge should be gone
    await expect(page.locator('text=E2E Badge Renamed')).not.toBeVisible({ timeout: 5_000 });
  });

  // ─── Tab Niveles (AC-07 to AC-11) ─────────────────────────────────────────

  e2e('AC-07: switch to Niveles tab', async () => {
    await switchTab(getPage, 'Niveles')();
    const page = getPage();
    // Should see a table or list of levels
    await page.waitForTimeout(500);
    // At least header visible
    await expect(page.locator('text=Niveles').first()).toBeVisible();
  });

  e2e('AC-08: admin creates new level', async () => {
    const page = getPage();
    await page.click('button:has-text("Nuevo Nivel")');
    await page.waitForTimeout(500);

    const modal = page.locator('.fixed, [role="dialog"]').last();
    await expect(modal).toBeVisible();

    // Fill name
    await modal.locator('input[type="text"]').first().fill('E2E Test Level');

    // Select first available badge
    const badgeSelect = modal.locator('select').first();
    if (await badgeSelect.isVisible()) {
      const options = await badgeSelect.locator('option').all();
      if (options.length > 1) {
        await badgeSelect.selectOption({ index: 1 });
      }
    }

    await modal.locator('button:has-text("Crear")').click();
    await page.waitForTimeout(1000);
  });

  e2e('AC-09: created level appears', async () => {
    const page = getPage();
    await expect(page.locator('text=E2E Test Level').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-11: admin deletes level', async () => {
    const page = getPage();
    const row = page.locator('text=E2E Test Level').first().locator('xpath=ancestor::tr | ancestor::*[contains(@class,"border")]').first();
    const deleteBtn = row.locator('button').last();
    await deleteBtn.click();
    await page.waitForTimeout(500);

    const confirmBtn = page.locator('button:has-text("Eliminar")').last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await page.waitForTimeout(1000);
    await expect(page.locator('text=E2E Test Level')).not.toBeVisible({ timeout: 5_000 });
  });

  // ─── Tab Cursos (AC-12 to AC-16) ──────────────────────────────────────────

  e2e('AC-12: switch to Cursos tab', async () => {
    await switchTab(getPage, 'Cursos')();
    const page = getPage();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Cursos').first()).toBeVisible();
  });

  e2e('AC-13: admin creates new course', async () => {
    const page = getPage();
    await page.click('button:has-text("Nuevo Curso")');
    await page.waitForTimeout(500);

    const modal = page.locator('.fixed, [role="dialog"]').last();
    await expect(modal).toBeVisible();

    // Fill name
    await modal.locator('[data-test-key="course-name-input"]').fill('E2E Test Course');
    // Fill description
    await modal.locator('[data-test-key="course-description-input"]').fill('Course for E2E testing');
    // Select first level
    const levelSelect = modal.locator('[data-test-key="course-level-select"]');
    const options = await levelSelect.locator('option').all();
    if (options.length > 1) {
      await levelSelect.selectOption({ index: 1 });
    }
    // Hours
    await modal.locator('[data-test-key="course-hours-input"]').fill('2');

    await modal.locator('button:has-text("Crear")').click();
    await page.waitForTimeout(1000);
  });

  e2e('AC-14: created course appears', async () => {
    const page = getPage();
    await expect(page.locator('text=E2E Test Course').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-16: admin deletes course', async () => {
    const page = getPage();
    const row = page.locator('text=E2E Test Course').first().locator('xpath=ancestor::tr | ancestor::*[contains(@class,"border")]').first();
    const deleteBtn = row.locator('button').last();
    await deleteBtn.click();
    await page.waitForTimeout(500);

    const confirmBtn = page.locator('button:has-text("Eliminar")').last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await page.waitForTimeout(1000);
    await expect(page.locator('text=E2E Test Course')).not.toBeVisible({ timeout: 5_000 });
  });
});
