/**
 * Employees Suspend + Activate + Delete Spec — Self-contained.
 *
 * Creates its own employee, then suspends, activates, and deletes it.
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  openCreateEmployeeModal,
  fillEmployeeForm,
  submitEmployeeForm,
  searchEmployee,
  suspendFirstEmployee,
  activateFirstEmployee,
  deleteFirstEmployee,
} from '../../factories/employees.factory';
import { LOGIN_MOISES } from '../../fixtures/test-data';
import type { EmployeeFormData } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

// Unique employee for this spec
const ts = Date.now().toString().slice(-6);
const TEST_EMP: EmployeeFormData = {
  name: `Suspend Test ${ts}`,
  email: `suspend-${ts}@emxeecta.mailosaur.net`,
  password: 'TestPass2024!',
  phone: '+573007770000',
  nationalId: `SUS${ts}`,
  nationality: 'Colombia',
  birthDate: '1990-03-10',
  hat: 'DEVELOPER',
  division: 'Infraestructura',
  forcePasswordChange: false,
};

e2e.describe.serial('Employees — Suspend + Activate + Delete', () => {
  // Setup: create the employee
  e2e('1. Login and navigate', loginAndNavigateToEmployees(getPage, LOGIN_MOISES));
  e2e('2. Create employee', openCreateEmployeeModal(getPage));
  e2e('3. Fill form', fillEmployeeForm(getPage, TEST_EMP));
  e2e('4. Submit', submitEmployeeForm(getPage));
  e2e('5. Search created employee', searchEmployee(getPage, TEST_EMP.name));

  e2e('6. Verify employee visible', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: TEST_EMP.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  // Suspend
  e2e('7. Suspend employee', suspendFirstEmployee(getPage));

  e2e('8. Verify Inactivo', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-test-key="search-input"]').fill(TEST_EMP.name);
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody tr').first().locator('text=Inactivo')).toBeVisible({ timeout: 5_000 });
  });

  // Activate
  e2e('9. Activate employee', activateFirstEmployee(getPage));

  e2e('10. Verify Activo', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-test-key="search-input"]').fill(TEST_EMP.name);
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody tr').first().locator('text=Activo')).toBeVisible({ timeout: 5_000 });
  });

  // Delete
  e2e('11. Delete employee', deleteFirstEmployee(getPage));

  e2e('12. Verify deleted (no error)', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    const errorAlert = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await errorAlert.isVisible().catch(() => false)).toBe(false);
  });
});
