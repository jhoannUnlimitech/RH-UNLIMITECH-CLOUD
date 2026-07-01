/**
 * CSW Create Category Spec — Tests creating categories with both flow types.
 *
 * Flow 1: Create a category that uses the default division flow (useDefaultFlow: true)
 * Flow 2: Create a category with a direct approver (useDefaultFlow: false)
 *
 * Both flows use Moises (approve_csw: true) who has permission to create categories.
 *
 * Pre-requisites:
 * - Backend running on port 9050
 * - Frontend running on port 5173
 * - Moises has csw_categories:create permission
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import type { LoginData } from '../../fixtures/test-data';
import { LOGIN_MOISES } from '../../fixtures/test-data';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginAs(page: any, credentials: LoginData) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/signin`);
  await page.waitForSelector('[data-test-context="login-form"][data-test-state="ready"]', { timeout: 15_000 });
  await page.locator('[data-test-key="email-input"]').fill(credentials.email);
  await page.locator('[data-test-key="password-input"]').fill(credentials.password);
  await page.locator('[data-test-key="submit-button"]').click();
  await page.locator('[data-test-context="signin-page"]').waitFor({ state: 'hidden', timeout: 15_000 });
}

// ─── Flow 1: Create category with default division flow ─────────────────────

const defaultFlow = createSerialFlow();

defaultFlow.e2e.describe.serial('CSW Category — Create with Default Flow', () => {
  defaultFlow.e2e('1. Login as Moises', async () => {
    const page = defaultFlow.getPage();
    await loginAs(page, LOGIN_MOISES);
  });

  defaultFlow.e2e('2. Navigate to /csw-categories', async () => {
    const page = defaultFlow.getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/csw-categories`);
    await page.waitForTimeout(2000);
    // Verify page loaded (use heading to avoid strict mode with breadcrumb)
    const title = page.getByRole('heading', { name: 'Categorías CSW' });
    await expect(title).toBeVisible({ timeout: 10_000 });
  });

  defaultFlow.e2e('3. Click "Crear Categoría" button', async () => {
    const page = defaultFlow.getPage();
    const createBtn = page.locator('[data-test-key="create-category-button"]');
    await expect(createBtn).toBeVisible({ timeout: 5_000 });
    await createBtn.click();
    await page.waitForSelector('[data-test-context="csw-category-form-modal"]', { timeout: 5_000 });
  });

  defaultFlow.e2e('4. Fill category name and description', async () => {
    const page = defaultFlow.getPage();
    const ts = Date.now().toString().slice(-6);
    const nameInput = page.locator('[data-test-key="category-name-input"]');
    await nameInput.fill(`TestCategory-DefaultFlow-${ts}`);
    const descInput = page.locator('[data-test-key="category-description-input"]');
    await descInput.fill('Categoría de prueba e2e con flujo de división por defecto');
    // Store for verification step
    (defaultFlow as any).__catName = `TestCategory-DefaultFlow-${ts}`;
  });

  defaultFlow.e2e('5. Verify "Usar flujo de división" is checked (default)', async () => {
    const page = defaultFlow.getPage();
    const checkbox = page.locator('[data-test-key="use-default-flow-checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  defaultFlow.e2e('6. Submit the form', async () => {
    const page = defaultFlow.getPage();
    const submitBtn = page.locator('[data-test-key="modal-submit-button"]');
    await submitBtn.click();
    // Wait for modal to close (success)
    await page.locator('[data-test-context="csw-category-form-modal"]').waitFor({ state: 'hidden', timeout: 15_000 });
  });

  defaultFlow.e2e('7. Search and verify category in list', async () => {
    const page = defaultFlow.getPage();
    const catName = (defaultFlow as any).__catName;
    const searchInput = page.locator('[data-test-context="csw-categories-list"] [data-test-key="search-input"]');
    await searchInput.fill(catName);
    await page.waitForTimeout(1000);
    const row = page.locator('tbody tr').filter({ hasText: catName });
    await expect(row).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Flow 2: Create category with direct approver ───────────────────────────

const directApprover = createSerialFlow();

directApprover.e2e.describe.serial('CSW Category — Create with Direct Approver', () => {
  directApprover.e2e('1. Login as Moises', async () => {
    const page = directApprover.getPage();
    await loginAs(page, LOGIN_MOISES);
  });

  directApprover.e2e('2. Navigate to /csw-categories', async () => {
    const page = directApprover.getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/csw-categories`);
    await page.waitForTimeout(2000);
    const title = page.getByRole('heading', { name: 'Categorías CSW' });
    await expect(title).toBeVisible({ timeout: 10_000 });
  });

  directApprover.e2e('3. Click "Crear Categoría" button', async () => {
    const page = directApprover.getPage();
    const createBtn = page.locator('[data-test-key="create-category-button"]');
    await createBtn.click();
    await page.waitForSelector('[data-test-context="csw-category-form-modal"]', { timeout: 5_000 });
  });

  directApprover.e2e('4. Fill category name and description', async () => {
    const page = directApprover.getPage();
    const ts = Date.now().toString().slice(-6);
    const nameInput = page.locator('[data-test-key="category-name-input"]');
    await nameInput.fill(`TestCategory-DirectApprover-${ts}`);
    const descInput = page.locator('[data-test-key="category-description-input"]');
    await descInput.fill('Categoría con aprobador directo Oscar');
    (directApprover as any).__catName = `TestCategory-DirectApprover-${ts}`;
  });

  directApprover.e2e('5. Uncheck "Usar flujo de división" to enable direct approver', async () => {
    const page = directApprover.getPage();
    const checkbox = page.locator('[data-test-key="use-default-flow-checkbox"]');
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  directApprover.e2e('6. Select Oscar as direct approver', async () => {
    const page = directApprover.getPage();
    // Wait for the direct approver select to appear
    const approverSelect = page.locator('[data-test-key="direct-approver-select"]');
    await expect(approverSelect).toBeVisible({ timeout: 5_000 });
    // Click to open dropdown
    await approverSelect.click();
    await page.waitForTimeout(500);
    // Search for Oscar
    const searchInput = approverSelect.locator('input[type="text"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Oscar');
      await page.waitForTimeout(600);
    }
    // Click Oscar's option
    const option = approverSelect.locator('button').filter({ hasText: 'Oscar' }).first();
    await option.click();
    await page.waitForTimeout(300);
  });

  directApprover.e2e('7. Submit the form', async () => {
    const page = directApprover.getPage();
    const submitBtn = page.locator('[data-test-key="modal-submit-button"]');
    await submitBtn.click();
    // Wait for modal to close
    await page.locator('[data-test-context="csw-category-form-modal"]').waitFor({ state: 'hidden', timeout: 15_000 });
  });

  directApprover.e2e('8. Search and verify category in list', async () => {
    const page = directApprover.getPage();
    const catName = (directApprover as any).__catName;
    const searchInput = page.locator('[data-test-context="csw-categories-list"] [data-test-key="search-input"]');
    await searchInput.fill(catName);
    await page.waitForTimeout(1000);
    const row = page.locator('tbody tr').filter({ hasText: catName });
    await expect(row).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Flow 3: Edit a test category ───────────────────────────────────────────

const editFlow = createSerialFlow();

editFlow.e2e.describe.serial('CSW Category — Edit Category', () => {
  editFlow.e2e('1. Login as Moises', async () => {
    const page = editFlow.getPage();
    await loginAs(page, LOGIN_MOISES);
  });

  editFlow.e2e('2. Navigate to /csw-categories', async () => {
    const page = editFlow.getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/csw-categories`);
    const title = page.getByRole('heading', { name: 'Categorías CSW' });
    await expect(title).toBeVisible({ timeout: 10_000 });
  });

  editFlow.e2e('3. Search for the test category', async () => {
    const page = editFlow.getPage();
    const searchInput = page.locator('[data-test-context="csw-categories-list"] [data-test-key="search-input"]');
    await searchInput.fill('TestCategory-DefaultFlow');
    await page.waitForTimeout(1000);
    const row = page.locator('tbody tr').filter({ hasText: 'TestCategory-DefaultFlow' }).first();
    await expect(row).toBeVisible({ timeout: 5_000 });
  });

  editFlow.e2e('4. Click edit button on the row', async () => {
    const page = editFlow.getPage();
    const row = page.locator('tbody tr').filter({ hasText: 'TestCategory-DefaultFlow' }).first();
    const editBtn = row.locator('[data-test-key="edit-button"]');
    await editBtn.click();
    await page.waitForSelector('[data-test-context="csw-category-form-modal"]', { timeout: 5_000 });
  });

  editFlow.e2e('5. Modify the description', async () => {
    const page = editFlow.getPage();
    const descInput = page.locator('[data-test-key="category-description-input"]');
    await descInput.clear();
    await descInput.fill('Descripción actualizada por e2e test');
  });

  editFlow.e2e('6. Submit the edit form', async () => {
    const page = editFlow.getPage();
    const submitBtn = page.locator('[data-test-key="modal-submit-button"]');
    await submitBtn.click();
    await page.locator('[data-test-context="csw-category-form-modal"]').waitFor({ state: 'hidden', timeout: 15_000 });
  });

  editFlow.e2e('7. Verify updated description in list', async () => {
    const page = editFlow.getPage();
    await page.waitForTimeout(500);
    const row = page.locator('tbody tr').filter({ hasText: 'TestCategory-DefaultFlow' }).first();
    await expect(row).toBeVisible({ timeout: 5_000 });
    await expect(row).toContainText('Descripción actualizada por e2e test');
  });
});

// ─── Flow 4: Delete a test category ─────────────────────────────────────────

const deleteFlow = createSerialFlow();

deleteFlow.e2e.describe.serial('CSW Category — Delete Category', () => {
  deleteFlow.e2e('1. Login as Moises', async () => {
    const page = deleteFlow.getPage();
    await loginAs(page, LOGIN_MOISES);
  });

  deleteFlow.e2e('2. Navigate to /csw-categories', async () => {
    const page = deleteFlow.getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/csw-categories`);
    const title = page.getByRole('heading', { name: 'Categorías CSW' });
    await expect(title).toBeVisible({ timeout: 10_000 });
  });

  deleteFlow.e2e('3. Search for the direct approver test category', async () => {
    const page = deleteFlow.getPage();
    const searchInput = page.locator('[data-test-context="csw-categories-list"] [data-test-key="search-input"]');
    await searchInput.fill('TestCategory-DirectApprover');
    await page.waitForTimeout(1000);
    const row = page.locator('tbody tr').filter({ hasText: 'TestCategory-DirectApprover' }).first();
    await expect(row).toBeVisible({ timeout: 5_000 });
  });

  deleteFlow.e2e('4. Click delete button and confirm', async () => {
    const page = deleteFlow.getPage();
    // Register dialog handler BEFORE clicking (window.confirm)
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    const row = page.locator('tbody tr').filter({ hasText: 'TestCategory-DirectApprover' }).first();
    const deleteBtn = row.locator('[data-test-key="delete-button"]');
    await deleteBtn.click();
    await page.waitForTimeout(2000);
    // Verify no error alert appeared
    const errorAlert = page.locator('text=Error');
    const hasError = await errorAlert.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
