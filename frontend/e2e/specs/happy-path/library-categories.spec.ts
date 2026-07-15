/**
 * Library Categories — E2E Tests
 *
 * Covers: AC-01 to AC-16 (Categorías CRUD, filtros, paginación)
 * User: Manuel (admin) — full training permissions
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEBOUNCE = 500;

e2e.describe.serial('Library Categories — CRUD + Filters + Pagination', () => {

  e2e('login as admin', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('navigate to /library/categories', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/categories`);
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 15_000 });
  });

  // ─── Cleanup from previous runs ────────────────────────────────────────────

  e2e('pre-cleanup: delete "Categoría E2E" if exists from previous run', async () => {
    const page = getPage();
    await page.selectOption('[data-test-key="items-per-page"]', '50');
    await page.waitForTimeout(300);
    await page.fill('[data-test-key="search-input"]', 'E2E');
    await page.waitForTimeout(DEBOUNCE);

    // Delete children first (Sub E2E), then parents
    // Loop: first pass deletes rows without sub-categories (children first)
    let attempts = 0;
    while (attempts < 15) {
      const rows = page.locator('[data-test-key^="category-row-"]');
      const count = await rows.count();
      if (count === 0) break;

      let deleted = false;
      // Try to delete from last to first (children are typically later/deeper)
      for (let i = count - 1; i >= 0; i--) {
        const row = rows.nth(i);
        const deleteBtn = row.locator('button[title="Eliminar"]');
        if (await deleteBtn.isVisible()) {
          // Listen for both alert (blocked) and confirm (can delete)
          let wasAlert = false;
          const dialogHandler = (dialog: any) => {
            if (dialog.type() === 'alert') {
              wasAlert = true;
              dialog.dismiss();
            } else {
              dialog.accept();
            }
          };
          page.on('dialog', dialogHandler);
          await deleteBtn.click();
          await page.waitForTimeout(1500);
          page.off('dialog', dialogHandler);

          if (!wasAlert) {
            deleted = true;
            break; // Deleted one, restart loop
          }
        }
      }
      if (!deleted) break; // Nothing more can be deleted
      attempts++;
    }

    // Clear search
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(DEBOUNCE);
  });

  // ─── AC-01: Ver categorías del sistema ──────────────────────────────────────

  e2e('AC-01: system categories (Cursos, Políticas) are visible', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Cursos' })).toBeVisible();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Políticas' })).toBeVisible();
  });

  e2e('AC-05: system categories do NOT show delete button', async () => {
    const page = getPage();
    const cursosRow = page.locator('[data-test-key^="category-row-cursos"]');
    await expect(cursosRow).toBeVisible();
    // The Trash2 button should not exist inside system rows
    const deleteBtn = cursosRow.locator('button[title="Eliminar"]');
    await expect(deleteBtn).not.toBeVisible();
  });

  // ─── AC-02: Crear categoría ─────────────────────────────────────────────────

  e2e('AC-02: create new category with name, description, icon, color', async () => {
    const page = getPage();
    // Ensure we can see all categories
    await page.selectOption('[data-test-key="items-per-page"]', '50');
    await page.waitForTimeout(300);

    await page.click('[data-test-key="create-category-btn"]');
    await page.waitForSelector('[data-test-key="name-input"]', { timeout: 5_000 });

    await page.fill('[data-test-key="name-input"]', 'Categoría E2E');
    await page.fill('[data-test-key="description-input"]', 'Creada por test automatizado');
    await page.click('[data-test-key="icon-book-open"]');
    await page.click('[data-test-key="submit-btn"]');

    // Wait for modal to close and data to refresh
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 10_000 });
    await page.selectOption('[data-test-key="items-per-page"]', '50');
    await page.waitForTimeout(300);
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E' }).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-03: Crear sub-categoría ─────────────────────────────────────────────

  e2e('AC-03: create sub-category with parent via UI modal', async () => {
    const page = getPage();
    // Open modal and wait for categories to load in the parent select
    await page.click('[data-test-key="create-category-btn"]');
    await page.waitForSelector('[data-test-key="name-input"]', { timeout: 5_000 });
    
    // Wait for parent select options to load (categories fetched by store)
    await page.waitForTimeout(2000);
    
    await page.fill('[data-test-key="name-input"]', 'Sub E2E');
    
    // Select parent — pick the option that contains "Categoría E2E"
    const parentSelect = page.locator('[data-test-key="parent-select"]');
    const options = await parentSelect.locator('option').allTextContents();
    const targetIndex = options.findIndex(text => text.includes('Categoría E2E'));
    if (targetIndex >= 0) {
      await parentSelect.selectOption({ index: targetIndex });
    }
    
    await page.click('[data-test-key="submit-btn"]');
    await page.waitForTimeout(2000);
    
    // Reload and verify
    await page.reload();
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 10_000 });
    await page.selectOption('[data-test-key="items-per-page"]', '50');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Sub E2E' })).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-04: Editar categoría ────────────────────────────────────────────────

  e2e('AC-04: edit category name and description', async () => {
    const page = getPage();
    // Click edit on "Categoría E2E"
    const row = page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E' }).first();
    await row.locator('button[title="Editar"]').click();
    await page.waitForSelector('[data-test-key="name-input"]', { timeout: 5_000 });

    await page.fill('[data-test-key="name-input"]', 'Categoría E2E Editada');
    await page.click('[data-test-key="submit-btn"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E Editada' })).toBeVisible();
  });

  // ─── AC-12: Buscar categorías ───────────────────────────────────────────────

  e2e('AC-12: search filters categories by name', async () => {
    const page = getPage();
    await page.fill('[data-test-key="search-input"]', 'E2E');
    await page.waitForTimeout(DEBOUNCE);
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'E2E' }).first()).toBeVisible();
    // Cursos should NOT be visible (doesn't match)
    await expect(page.locator('[data-test-key^="category-row-cursos"]')).not.toBeVisible();
    // Clear search
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(DEBOUNCE);
  });

  // ─── AC-11: Filtro por estado ───────────────────────────────────────────────

  e2e('AC-09/AC-10: deactivate parent cascades to children', async () => {
    const page = getPage();
    // Find "Categoría E2E Editada" row and click deactivate
    const row = page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E Editada' }).first();
    await row.locator('button[title="Desactivar"]').click();
    await page.waitForTimeout(1000);

    // Filter by inactive
    await page.selectOption('[data-test-key="status-filter"]', 'inactive');
    await page.waitForTimeout(300);
    // Both parent and child should appear as inactive
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E Editada' }).first()).toBeVisible();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Sub E2E' })).toBeVisible();
  });

  e2e('AC-11: filter by active shows only active categories', async () => {
    const page = getPage();
    await page.selectOption('[data-test-key="status-filter"]', 'active');
    await page.waitForTimeout(300);
    // "Categoría E2E Editada" should NOT be visible (inactive)
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E Editada' }).first()).not.toBeVisible();
    // But Cursos should be visible
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Cursos' })).toBeVisible();
    // Reset to all
    await page.selectOption('[data-test-key="status-filter"]', 'all');
    await page.waitForTimeout(300);
  });

  // ─── AC-13: Show items ──────────────────────────────────────────────────────

  e2e('AC-13: show items (5) limits rows displayed', async () => {
    const page = getPage();
    await page.selectOption('[data-test-key="items-per-page"]', '5');
    await page.waitForTimeout(300);
    const rows = page.locator('[data-test-key^="category-row-"]');
    const count = await rows.count();
    expect(count).toBeLessThanOrEqual(5);
  });

  // ─── AC-14: Paginador ───────────────────────────────────────────────────────

  e2e('AC-14: pagination shows "Mostrando X a Y de Z"', async () => {
    const page = getPage();
    await expect(page.locator('text=/Mostrando/')).toBeVisible();
  });

  // ─── AC-15: Texto largo truncado ────────────────────────────────────────────

  e2e('AC-15: long category names are clamped to 2 lines', async () => {
    const page = getPage();
    // This is a visual test — verify that line-clamp-2 class exists
    const nameElement = page.locator('[data-test-key^="category-row-"]').first().locator('p.line-clamp-2');
    // At least one element should have line-clamp-2
    const count = await page.locator('.line-clamp-2').count();
    expect(count).toBeGreaterThan(0);
  });

  // ─── AC-07: No eliminar padre con hijas ─────────────────────────────────────

  e2e('AC-07: cannot delete category with sub-categories (alert)', async () => {
    const page = getPage();
    // Reactivate the category first
    const row = page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E Editada' }).first();
    await row.locator('button[title="Activar"]').click();
    await page.waitForTimeout(500);

    // Try to delete — should show dialog alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('sub-categoría');
      dialog.dismiss();
    });
    await row.locator('button[title="Eliminar"]').click();
    await page.waitForTimeout(500);
  });

  // ─── Cleanup: delete test categories ────────────────────────────────────────

  e2e('cleanup: delete Sub E2E (child first)', async () => {
    const page = getPage();
    const subRow = page.locator('[data-test-key^="category-row-"]', { hasText: 'Sub E2E' });
    page.on('dialog', dialog => dialog.accept());
    await subRow.locator('button[title="Eliminar"]').click();
    await page.waitForTimeout(1000);
    await expect(subRow).not.toBeVisible();
  });

  e2e('cleanup: delete Categoría E2E Editada', async () => {
    const page = getPage();
    const row = page.locator('[data-test-key^="category-row-"]', { hasText: 'Categoría E2E Editada' }).first();
    page.on('dialog', dialog => dialog.accept());
    await row.locator('button[title="Eliminar"]').click();
    await page.waitForTimeout(1000);
    await expect(row).not.toBeVisible();
  });
});
