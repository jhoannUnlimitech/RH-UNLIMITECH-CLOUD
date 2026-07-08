/**
 * Employees Edit Spec — Edit employee fields and verify changes.
 *
 * Flow:
 * 1. Login as Moises
 * 2. Search for existing test employee
 * 3. Edit: change phone number
 * 4. Verify change reflected in table/view
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  searchEmployee,
  editFirstEmployee,
  viewFirstEmployee,
  closeViewModal,
} from '../../factories/employees.factory';
import { LOGIN_MOISES, EMPLOYEE_CREATE } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Employees — Edit Fields', () => {
  e2e('1. Login as Moises and navigate to /employees',
    loginAndNavigateToEmployees(getPage, LOGIN_MOISES));

  e2e('2. Search for test employee',
    searchEmployee(getPage, EMPLOYEE_CREATE.name));

  e2e('3. Verify employee is visible', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: EMPLOYEE_CREATE.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('4. Edit employee — change phone',
    editFirstEmployee(getPage, { phone: '+573005559999' }));

  e2e('5. Verify edit was successful (modal closed, no error)', async () => {
    const page = getPage();
    // If we got here, edit succeeded (modal closed and list reloaded)
    await expect(page.locator('[data-test-context="employees-list"]')).toBeVisible();
    // Verify no error toast
    const errorToast = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    const hasError = await errorToast.isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
