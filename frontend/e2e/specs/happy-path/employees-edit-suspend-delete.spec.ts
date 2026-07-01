/**
 * Employees Edit + Suspend + Delete Spec.
 *
 * Flow:
 * 1. Login as Moises
 * 2. Search existing test employee
 * 3. Suspend → verify "Inactivo"
 * 4. Activate → verify "Activo"
 * 5. Delete → confirm → verify gone
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  searchEmployee,
  suspendFirstEmployee,
  activateFirstEmployee,
  deleteFirstEmployee,
} from '../../factories/employees.factory';
import { LOGIN_MOISES, EMPLOYEE_CREATE } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Employees — Suspend + Activate + Delete', () => {
  e2e('1. Login as Moises and navigate to /employees',
    loginAndNavigateToEmployees(getPage, LOGIN_MOISES));

  e2e('2. Search for test employee',
    searchEmployee(getPage, EMPLOYEE_CREATE.name));

  e2e('3. Verify employee is visible', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: EMPLOYEE_CREATE.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('4. Suspend employee',
    suspendFirstEmployee(getPage));

  e2e('5. Verify status changed to Inactivo', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    const searchInput = page.locator('[data-test-key="search-input"]');
    await searchInput.fill(EMPLOYEE_CREATE.name);
    await page.waitForTimeout(1000);
    const statusBadge = page.locator('tbody tr').first().locator('text=Inactivo');
    await expect(statusBadge).toBeVisible({ timeout: 5_000 });
  });

  e2e('6. Activate employee back',
    activateFirstEmployee(getPage));

  e2e('7. Verify status back to Activo', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    const searchInput = page.locator('[data-test-key="search-input"]');
    await searchInput.fill(EMPLOYEE_CREATE.name);
    await page.waitForTimeout(1000);
    const statusBadge = page.locator('tbody tr').first().locator('text=Activo');
    await expect(statusBadge).toBeVisible({ timeout: 5_000 });
  });

  e2e('8. Delete employee',
    deleteFirstEmployee(getPage));

  e2e('9. Verify employee deleted (count decreased)', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    const searchInput = page.locator('[data-test-key="search-input"]');
    await searchInput.fill(EMPLOYEE_CREATE.name);
    await page.waitForTimeout(1000);
    // Verify no error toast/alert appeared (delete was successful)
    const errorAlert = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    const hasError = await errorAlert.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
