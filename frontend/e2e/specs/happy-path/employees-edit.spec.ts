/**
 * Employees Edit Spec — Self-contained.
 *
 * Creates its own employee, edits phone, verifies.
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  openCreateEmployeeModal,
  fillEmployeeForm,
  submitEmployeeForm,
  searchEmployee,
  editFirstEmployee,
} from '../../factories/employees.factory';
import { LOGIN_MOISES } from '../../fixtures/test-data';
import type { EmployeeFormData } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

// Unique employee for this spec
const ts = Date.now().toString().slice(-6);
const TEST_EMP: EmployeeFormData = {
  name: `Edit Test ${ts}`,
  email: `edit-${ts}@emxeecta.mailosaur.net`,
  password: 'TestPass2024!',
  phone: '+573001110000',
  nationalId: `EDT${ts}`,
  nationality: 'Colombia',
  birthDate: '1991-06-20',
  hat: 'DEVELOPER',
  division: 'Infraestructura',
  forcePasswordChange: false,
};

e2e.describe.serial('Employees — Edit Fields', () => {
  // Setup: create employee
  e2e('1. Login and navigate', loginAndNavigateToEmployees(getPage, LOGIN_MOISES));
  e2e('2. Create employee', openCreateEmployeeModal(getPage));
  e2e('3. Fill form', fillEmployeeForm(getPage, TEST_EMP));
  e2e('4. Submit', submitEmployeeForm(getPage));
  e2e('5. Search created employee', searchEmployee(getPage, TEST_EMP.name));

  e2e('6. Verify visible', async () => {
    const page = getPage();
    await expect(page.locator('tbody tr').filter({ hasText: TEST_EMP.name }).first()).toBeVisible({ timeout: 10_000 });
  });

  // Edit
  e2e('7. Edit employee — change phone', editFirstEmployee(getPage, { phone: '+573009998888' }));

  e2e('8. Verify edit success (no error, back on list)', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="employees-list"]')).toBeVisible();
    const errorToast = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await errorToast.isVisible().catch(() => false)).toBe(false);
  });
});
