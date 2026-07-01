/**
 * Employees Factory — Interaction logic for the Employees module.
 *
 * Provides reusable factories for:
 * - Navigating to employees list
 * - Creating an employee via form modal
 * - Viewing, editing, suspending, deleting employees
 * - Searching and filtering
 */

import { expect, type Page } from '@playwright/test';
import type { LoginData, EmployeeFormData } from '../fixtures/test-data';

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

export function loginAndNavigateToEmployees(getPage: () => Page, credentials: LoginData) {
  return async () => {
    const page = getPage();
    await loginAs(page, credentials);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/employees`);
    await page.waitForSelector('[data-test-context="employees-list"]', { timeout: 15_000 });
  };
}

// ─── Create Employee ────────────────────────────────────────────────────────

export function openCreateEmployeeModal(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const createBtn = page.locator('[data-test-key="create-employee-button"]');
    await expect(createBtn).toBeVisible({ timeout: 5_000 });
    await createBtn.click();
    await page.waitForSelector('[data-test-context="employee-form-modal"]', { timeout: 5_000 });
  };
}

export function fillEmployeeForm(getPage: () => Page, data: EmployeeFormData) {
  return async () => {
    const page = getPage();
    // Wait for the modal to be fully visible (check for title text)
    await page.locator('text=Nuevo Empleado').or(page.locator('text=Editar Empleado')).first().waitFor({ timeout: 5_000 });
    await page.waitForTimeout(1000); // Wait for selectors to load data

    // Use the modal dialog container (last visible modal on page)
    const modal = page.locator('.fixed [class*="max-w"]').last();

    // Name
    await modal.locator('#name').fill(data.name);

    // Email
    await modal.locator('#email').fill(data.email);

    // Password
    await modal.locator('#password').fill(data.password);

    // Phone
    await modal.locator('#phone').fill(data.phone);

    // National ID
    await modal.locator('#nationalId').fill(data.nationalId);

    // Birth Date (flatpickr readonly input — use JS to set value)
    await page.evaluate((date) => {
      const input = document.querySelector('#birthDate') as any;
      if (input && input._flatpickr) {
        input._flatpickr.setDate(date, true);
      } else if (input) {
        // Fallback: dispatch input event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        nativeInputValueSetter?.call(input, date);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, data.birthDate);

    // Nationality (SearchableSelect by id)
    const nationalityBtn = modal.locator('#nationality');
    await nationalityBtn.click();
    await page.waitForTimeout(400);
    // Type in the dropdown search
    const openDropdowns = page.locator('.absolute.z-50 input[type="text"]');
    if (await openDropdowns.last().isVisible()) {
      await openDropdowns.last().fill(data.nationality);
      await page.waitForTimeout(600);
    }
    await page.locator('.absolute.z-50 button').filter({ hasText: data.nationality }).first().click();
    await page.waitForTimeout(300);

    // Hat (SearchableSelect by id="role")
    const hatBtn = modal.locator('#role');
    await hatBtn.click();
    await page.waitForTimeout(400);
    if (await openDropdowns.last().isVisible()) {
      await openDropdowns.last().fill(data.hat);
      await page.waitForTimeout(600);
    }
    await page.locator('.absolute.z-50 button').filter({ hasText: data.hat }).first().click();
    await page.waitForTimeout(300);

    // Division (SearchableSelect by id="division")
    const divBtn = modal.locator('#division');
    await divBtn.click();
    await page.waitForTimeout(400);
    if (await openDropdowns.last().isVisible()) {
      await openDropdowns.last().fill(data.division);
      await page.waitForTimeout(600);
    }
    await page.locator('.absolute.z-50 button').filter({ hasText: data.division }).first().click();
    await page.waitForTimeout(300);
  };
}

export function submitEmployeeForm(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Find the submit button in the modal (the primary button at the bottom)
    const modal = page.locator('.fixed [class*="max-w"]').last();
    const submitBtn = modal.locator('button[type="submit"]').first();
    await submitBtn.click();
    // Wait for modal to close (the overlay disappears)
    await page.waitForTimeout(2000);
    // Verify we're back on the list page
    await page.waitForSelector('[data-test-context="employees-list"]', { timeout: 10_000 });
  };
}

// ─── Search ─────────────────────────────────────────────────────────────────

export function searchEmployee(getPage: () => Page, searchTerm: string) {
  return async () => {
    const page = getPage();
    const searchInput = page.locator('[data-test-context="employees-list"] [data-test-key="search-input"]');
    await searchInput.fill(searchTerm);
    await page.waitForTimeout(1000); // debounce
  };
}

// ─── View Employee ──────────────────────────────────────────────────────────

export function viewFirstEmployee(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const viewBtn = page.locator('[data-test-key="view-button"]').first();
    await expect(viewBtn).toBeVisible({ timeout: 10_000 });
    await viewBtn.click();
    await page.waitForSelector('[data-test-context="employee-view-modal"]', { timeout: 5_000 });
  };
}

export function closeViewModal(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Close via the modal's built-in close button
    const closeBtn = page.locator('[data-test-context="employee-view-modal"]').locator('button').filter({ hasText: 'Cerrar' }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      // Use escape key
      await page.keyboard.press('Escape');
    }
    await page.locator('[data-test-context="employee-view-modal"]').waitFor({ state: 'hidden', timeout: 5_000 });
  };
}

// ─── Suspend/Activate ───────────────────────────────────────────────────────

export function suspendFirstEmployee(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const suspendBtn = page.locator('[data-test-key="suspend-button"][data-test-state="active"]').first();
    await expect(suspendBtn).toBeVisible({ timeout: 5_000 });
    await suspendBtn.click();
    await page.waitForTimeout(1500);
  };
}

export function activateFirstEmployee(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const activateBtn = page.locator('[data-test-key="suspend-button"][data-test-state="inactive"]').first();
    await expect(activateBtn).toBeVisible({ timeout: 5_000 });
    await activateBtn.click();
    await page.waitForTimeout(1500);
  };
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export function deleteFirstEmployee(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Register dialog handler for confirmation
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    const deleteBtn = page.locator('[data-test-key="delete-button"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();
    // Wait for delete modal or confirmation
    await page.waitForTimeout(2000);
    // If a custom modal appears, click confirm
    const confirmBtn = page.locator('[data-test-key="delete-confirm-button"]');
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await page.waitForTimeout(1500);
  };
}
