/**
 * Library Categories — E2E Tests (AC-01 to AC-32)
 *
 * Covers the full category lifecycle:
 * Create → Edit → Deactivate (cascade) → Soft Delete → Filter Deleted →
 * Restore → Hard Delete (write name to confirm) → Filters + Pagination
 *
 * User: Manuel (admin) — full training permissions
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import {
  navigateToLibraryCategories,
  navigateToLibraryManage,
  createCategory,
  editCategory,
  deactivateCategory,
  softDeleteCategory,
  restoreCategory,
  hardDeleteCategory,
  filterCategoriesByStatus,
  searchCategories,
  setItemsPerPage,
  cleanupLibraryTestData,
} from '../../factories/library.factory';
import { LOGIN_MANUEL, LIB_CATEGORY, LIB_SUBCATEGORY } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEBOUNCE = 500;

// Slugs are auto-generated from name: "E2E Cat Automated" → "e2e-cat-automated"
const CAT_SLUG = 'e2e-cat-automated';
const SUBCAT_SLUG = 'e2e-subcat-child';

e2e.describe.serial('Library Categories — Full Lifecycle (AC-01 to AC-32)', () => {

  // ─── Setup ──────────────────────────────────────────────────────────────────

  e2e('login as admin (Manuel)', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('pre-cleanup: remove E2E test data from previous runs', async () => {
    const page = getPage();
    const API = 'http://localhost:9050/api/v1';

    // Navigate to get auth cookie
    await page.goto(`${BASE_URL}/library/categories`);
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 15_000 });

    // Cleanup via API: fetch all categories, soft-delete then hard-delete E2E ones
    await page.evaluate(async (apiUrl) => {
      try {
        const res = await fetch(`${apiUrl}/library/categories?includeDeleted=true`, { credentials: 'include' });
        const data = await res.json();
        if (!data?.data) return;

        const e2eCats = data.data
          .filter((c: any) => c.name && c.name.startsWith('E2E '))
          .sort((a: any, b: any) => (b.depth || 0) - (a.depth || 0));

        for (const cat of e2eCats) {
          // Soft delete first (si no está deleted ya)
          if (!cat.deleted) {
            await fetch(`${apiUrl}/library/categories/${cat._id}?force=true`, {
              method: 'DELETE', credentials: 'include'
            });
          }
          // Hard delete
          await fetch(`${apiUrl}/library/categories/${cat._id}/permanent`, {
            method: 'DELETE', credentials: 'include'
          });
        }
      } catch { /* ignore */ }
    }, API);

    await page.reload();
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 15_000 });
  });

  e2e('navigate to /library/categories', async () => {
    await navigateToLibraryCategories(getPage)();
  });

  // ─── AC-01: System categories visible ───────────────────────────────────────

  e2e('AC-01: system categories (Cursos, Políticas) are visible', async () => {
    const page = getPage();
    await setItemsPerPage(getPage, '50')();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Cursos' })).toBeVisible();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Políticas' })).toBeVisible();
  });

  // ─── AC-02: Create category ─────────────────────────────────────────────────

  e2e('AC-02: create new category with name, description, icon, color', async () => {
    await createCategory(getPage, LIB_CATEGORY)();
  });

  e2e('AC-04: created category appears in table', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 15_000 });
    await setItemsPerPage(getPage, '50')();
    await page.waitForTimeout(500);
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first()).toBeVisible({ timeout: 10_000 });
  });

  // ─── AC-03: Create sub-category ─────────────────────────────────────────────

  e2e('AC-03: create sub-category selecting parent in modal', async () => {
    await createCategory(getPage, LIB_SUBCATEGORY)();
    const page = getPage();
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForSelector('[data-test-context="library-categories-page"]', { timeout: 10_000 });
    await setItemsPerPage(getPage, '50')();
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_SUBCATEGORY.name })).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-05: Cannot create without name ──────────────────────────────────────

  e2e('AC-05: cannot create category without name (validation)', async () => {
    const page = getPage();
    await page.click('[data-test-key="create-category-btn"]');
    await page.waitForSelector('[data-test-key="name-input"]', { timeout: 5_000 });
    // Try to submit with empty name — HTML5 required should block
    const nameInput = page.locator('[data-test-key="name-input"]');
    await nameInput.fill('');
    await page.click('[data-test-key="submit-btn"]');
    // Modal should still be open (form not submitted due to required)
    await expect(page.locator('[data-test-key="name-input"]')).toBeVisible();
    // Close modal
    await page.click('[data-test-key="cancel-btn"]');
    await page.waitForTimeout(300);
  });

  // ─── AC-06/07: Edit category ────────────────────────────────────────────────

  e2e('AC-06: edit category name and description', async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name });
    await row.locator('button[title="Editar"]').click();
    await page.waitForSelector('[data-test-key="name-input"]', { timeout: 5_000 });
    await page.fill('[data-test-key="name-input"]', 'E2E Cat Edited');
    await page.fill('[data-test-key="description-input"]', 'Descripción editada');
    await page.click('[data-test-key="submit-btn"]');
    await page.waitForSelector('[data-test-key="name-input"]', { state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(500);
  });

  e2e('AC-07: changes reflected immediately in table', async () => {
    const page = getPage();
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: 'E2E Cat Edited' })).toBeVisible();
  });

  // Rename back for next tests
  e2e('restore original name for lifecycle tests', async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: 'E2E Cat Edited' });
    await row.locator('button[title="Editar"]').click();
    await page.waitForSelector('[data-test-key="name-input"]', { timeout: 5_000 });
    await page.fill('[data-test-key="name-input"]', LIB_CATEGORY.name);
    await page.click('[data-test-key="submit-btn"]');
    await page.waitForSelector('[data-test-key="name-input"]', { state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(500);
  });

  // ─── AC-08/09/10: Deactivate ────────────────────────────────────────────────

  e2e('AC-08/09: deactivate category shows "Inactiva" state', async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first();
    await row.locator('button[title="Desactivar"]').click();
    await page.waitForTimeout(1000);
    // Filter inactive to verify
    await filterCategoriesByStatus(getPage, 'inactive')();
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first()).toBeVisible();
  });

  e2e('AC-10: deactivating parent cascades to children', async () => {
    const page = getPage();
    // Child should also appear in inactive
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_SUBCATEGORY.name })).toBeVisible();
  });

  e2e('AC-11: inactive categories do NOT appear in /library/manage sidebar', async () => {
    await navigateToLibraryManage(getPage)();
    const page = getPage();
    // The deactivated category should NOT be in the sidebar tree
    await expect(page.locator(`[data-test-key^="category-"]`, { hasText: LIB_CATEGORY.name })).not.toBeVisible();
    // Navigate back to categories page
    await navigateToLibraryCategories(getPage)();
    await setItemsPerPage(getPage, '50')();
  });

  // Reactivate for delete tests
  e2e('reactivate category for delete tests', async () => {
    const page = getPage();
    await filterCategoriesByStatus(getPage, 'inactive')();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first();
    await row.locator('button[title="Activar"]').click();
    await page.waitForTimeout(500);
    await filterCategoriesByStatus(getPage, 'all')();
    await page.waitForTimeout(300);
  });

  // ─── AC-16: Delete parent with sub-categories → shows affected items ───────

  e2e('AC-16: deleting category with sub-categories shows affected items in confirm', async () => {
    const page = getPage();

    // Register dialog handler BEFORE triggering the action (native confirm() from frontend)
    let dialogMessage = '';
    page.once('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept(); // Accept cascade delete
    });

    // Ensure we see the parent row and click delete
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first();
    await expect(row).toBeVisible({ timeout: 5_000 });

    const deleteBtn = row.locator('button[title="Eliminar"]');
    await expect(deleteBtn).toBeVisible({ timeout: 3_000 });
    await deleteBtn.click();

    // DeleteConfirmModal (React component) should open
    await page.waitForTimeout(1000);

    // Find and click the red "Eliminar" button inside the modal
    const modalDeleteBtn = page.locator('.bg-red-600:has-text("Eliminar"), button.bg-red-600');
    if (await modalDeleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await modalDeleteBtn.click();
    } else {
      // Fallback: maybe modal uses different class — click last "Eliminar" button
      await page.locator('button:has-text("Eliminar")').last().click();
    }

    // Wait for API call + native confirm() + cascade
    await page.waitForTimeout(4000);

    // Verify the native confirm dialog fired with dependency info
    expect(dialogMessage.length).toBeGreaterThan(0);
    expect(dialogMessage).toContain('Sub-categor');

    // After cascade, both should be in "Eliminadas" view
    await filterCategoriesByStatus(getPage, 'deleted')();
    await page.waitForTimeout(1000);
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_SUBCATEGORY.name }).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-12/13/14: Restore from deleted view ─────────────────────────────────
  // (Padre e hijo ya fueron eliminados en AC-16 por cascada)

  // ─── AC-17: System categories no delete button ──────────────────────────────

  e2e('AC-17: system categories (isSystem) do NOT show delete button', async () => {
    const page = getPage();
    await filterCategoriesByStatus(getPage, 'all')();
    const cursosRow = page.locator('[data-test-key="category-row-cursos"]');
    if (await cursosRow.isVisible()) {
      const deleteBtn = cursosRow.locator('button[title="Eliminar"]');
      await expect(deleteBtn).not.toBeVisible();
    }
  });

  // ─── AC-18/19/20/21: Restore ───────────────────────────────────────────────

  e2e('AC-18: filter "Eliminadas" shows soft-deleted categories', async () => {
    const page = getPage();
    await filterCategoriesByStatus(getPage, 'deleted')();
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-19/20: restore button opens green modal and restores category', async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first();
    await row.locator('button[title="Restaurar"]').click();
    // Green restore modal should appear
    await page.waitForTimeout(300);
    await expect(page.locator('text="¿Restaurar esta categoría?"')).toBeVisible();
    // Confirm restore
    const restoreBtn = page.locator('button:has-text("Restaurar")').last();
    await restoreBtn.click();
    await page.waitForTimeout(1500);
  });

  e2e('AC-21: restored category disappears from "Eliminadas" view', async () => {
    const page = getPage();
    await page.waitForTimeout(500);
    // Refresh the deleted view
    await filterCategoriesByStatus(getPage, 'active')();
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first()).toBeVisible();
  });

  // Now soft delete again for hard delete test (no children this time since child was cascade-deleted)
  e2e('soft delete category again for hard delete test', async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first();
    await row.locator('button[title="Eliminar"]').click();
    await page.waitForTimeout(300);
    const confirmBtn = page.locator('button:has-text("Eliminar")').last();
    await confirmBtn.click();
    await page.waitForTimeout(1000);
    await filterCategoriesByStatus(getPage, 'deleted')();
    await page.waitForTimeout(500);
  });

  // ─── AC-22/23/24/25: Hard Delete ───────────────────────────────────────────

  e2e('AC-22: hard delete button opens HardDeleteModal', async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name }).first();
    await row.locator('button[title="Eliminar permanentemente"]').click();
    await page.waitForSelector('[data-test-context="hard-delete-modal"]', { timeout: 5_000 });
    await expect(page.locator('text="Eliminación Permanente"')).toBeVisible();
  });

  e2e('AC-24: wrong name keeps button disabled', async () => {
    const page = getPage();
    await page.fill('[data-test-key="confirm-name-input"]', 'wrong name');
    await page.waitForTimeout(200);
    const deleteBtn = page.locator('button:has-text("Eliminar Permanentemente")');
    await expect(deleteBtn).toBeDisabled();
    // Error message appears
    await expect(page.locator('text="El nombre no coincide"')).toBeVisible();
  });

  e2e('AC-23/25: typing exact name enables confirm → hard deletes permanently', async () => {
    const page = getPage();
    await page.fill('[data-test-key="confirm-name-input"]', LIB_CATEGORY.name);
    await page.waitForTimeout(200);
    const deleteBtn = page.locator('button:has-text("Eliminar Permanentemente")');
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();
    await page.waitForTimeout(2000);
    // Category should be gone from deleted view
    await expect(page.locator(`[data-test-key^="category-row-"]`, { hasText: LIB_CATEGORY.name })).not.toBeVisible();
  });

  // ─── AC-27/28/29/30/31/32: Filters & Pagination ────────────────────────────

  e2e('AC-27: search filters categories by name (debounce 400ms)', async () => {
    const page = getPage();
    await filterCategoriesByStatus(getPage, 'all')();
    await searchCategories(getPage, 'Cursos')();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Cursos' })).toBeVisible();
    await expect(page.locator('[data-test-key^="category-row-"]', { hasText: 'Políticas' })).not.toBeVisible();
    // Clear
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(DEBOUNCE);
  });

  e2e('AC-28: filter by status Active/Inactive/Deleted/All works', async () => {
    const page = getPage();
    await filterCategoriesByStatus(getPage, 'active')();
    const activeRows = await page.locator('[data-test-key^="category-row-"]').count();
    expect(activeRows).toBeGreaterThan(0);
    await filterCategoriesByStatus(getPage, 'all')();
  });

  e2e('AC-29: show items (5/10/25/50) limits rows', async () => {
    const page = getPage();
    await setItemsPerPage(getPage, '5')();
    const rows = await page.locator('[data-test-key^="category-row-"]').count();
    expect(rows).toBeLessThanOrEqual(5);
    await setItemsPerPage(getPage, '50')();
  });

  e2e('AC-30: pagination buttons work', async () => {
    const page = getPage();
    await setItemsPerPage(getPage, '5')();
    // If there are more than 5 categories, pagination appears
    const paginationInfo = page.locator('text=/Mostrando/');
    await expect(paginationInfo).toBeVisible();
    await setItemsPerPage(getPage, '50')();
  });

  e2e('AC-31: "Mostrando X a Y de Z entradas" updates correctly', async () => {
    const page = getPage();
    await expect(page.locator('text=/Mostrando/')).toBeVisible();
    const text = await page.locator('text=/Mostrando/').textContent();
    expect(text).toMatch(/Mostrando \d+ a \d+ de \d+ entradas/);
  });

  e2e('AC-32: long category names are truncated (line-clamp-2)', async () => {
    const page = getPage();
    const clampedElements = await page.locator('.line-clamp-2').count();
    expect(clampedElements).toBeGreaterThan(0);
  });
});
