/**
 * Employees Create Spec — Create employee + verify in table + view data.
 *
 * Flow:
 * 1. Login as Moises (has employees:create)
 * 2. Navigate to /employees
 * 3. Create new employee with all fields
 * 4. Search by name → verify in table
 * 5. View employee → verify data matches
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  openCreateEmployeeModal,
  fillEmployeeForm,
  submitEmployeeForm,
  searchEmployee,
  viewFirstEmployee,
  closeViewModal,
} from '../../factories/employees.factory';
import { LOGIN_MOISES, EMPLOYEE_CREATE } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Employees — Create + View', () => {
  e2e('1. Login as Moises and navigate to /employees',
    loginAndNavigateToEmployees(getPage, LOGIN_MOISES));

  e2e('2. Click create employee button',
    openCreateEmployeeModal(getPage));

  e2e('3. Fill employee form with all fields',
    fillEmployeeForm(getPage, EMPLOYEE_CREATE));

  e2e('4. Submit form',
    submitEmployeeForm(getPage));

  e2e('5. Search for created employee',
    searchEmployee(getPage, EMPLOYEE_CREATE.name));

  e2e('6. Verify employee appears in table', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    const row = page.locator('tbody tr').filter({ hasText: EMPLOYEE_CREATE.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('7. View employee details',
    viewFirstEmployee(getPage));

  e2e('8. Verify name in view modal', async () => {
    const page = getPage();
    const modal = page.locator('[data-test-context="employee-view-modal"]');
    await expect(modal).toContainText(EMPLOYEE_CREATE.name);
  });

  e2e('9. Verify email in view modal', async () => {
    const page = getPage();
    const modal = page.locator('[data-test-context="employee-view-modal"]');
    await expect(modal).toContainText(EMPLOYEE_CREATE.email);
  });

  e2e('10. Verify phone in view modal', async () => {
    const page = getPage();
    const modal = page.locator('[data-test-context="employee-view-modal"]');
    await expect(modal).toContainText(EMPLOYEE_CREATE.phone);
  });

  e2e('11. Close view modal',
    closeViewModal(getPage));
});
