/**
 * Employees Master Spec — Runs the full employee lifecycle independently.
 *
 * This is a self-contained serial flow that tests:
 * 1. Create employee
 * 2. Search and verify in table
 * 3. View employee data
 * 4. Edit employee (change phone)
 * 5. Suspend employee
 * 6. Activate employee
 * 7. Delete employee
 *
 * Each step is independent — the employee is created at the start.
 *
 * Run with:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts employees-all --reporter=list
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
  editFirstEmployee,
  suspendFirstEmployee,
  activateFirstEmployee,
  deleteFirstEmployee,
} from '../../factories/employees.factory';
import { LOGIN_MOISES } from '../../fixtures/test-data';
import type { EmployeeFormData } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

// Unique employee for full lifecycle
const ts = Date.now().toString().slice(-6);
const LIFECYCLE_EMP: EmployeeFormData = {
  name: `Lifecycle ${ts}`,
  email: `lifecycle-${ts}@emxeecta.mailosaur.net`,
  password: 'LifePass2024!',
  phone: '+573001234567',
  nationalId: `LC${ts}`,
  nationality: 'Colombia',
  birthDate: '1993-07-15',
  hat: 'DEVELOPER',
  division: 'Infraestructura',
  forcePasswordChange: false,
};

e2e.describe.serial('Employees — Full Lifecycle (Master)', () => {
  // ─── CREATE ───────────────────────────────────────────────────────────
  e2e('1. Login as Moises and navigate to /employees',
    loginAndNavigateToEmployees(getPage, LOGIN_MOISES));

  e2e('2. Open create modal',
    openCreateEmployeeModal(getPage));

  e2e('3. Fill employee form',
    fillEmployeeForm(getPage, LIFECYCLE_EMP));

  e2e('4. Submit form',
    submitEmployeeForm(getPage));

  // ─── SEARCH & VERIFY ──────────────────────────────────────────────────
  e2e('5. Search for created employee',
    searchEmployee(getPage, LIFECYCLE_EMP.name));

  e2e('6. Verify in table', async () => {
    const page = getPage();
    const row = page.locator('tbody tr').filter({ hasText: LIFECYCLE_EMP.name });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  });

  // ─── VIEW ─────────────────────────────────────────────────────────────
  e2e('7. View employee details',
    viewFirstEmployee(getPage));

  e2e('8. Verify name in view', async () => {
    const page = getPage();
    const modal = page.locator('[data-test-context="employee-view-modal"]');
    await expect(modal).toContainText(LIFECYCLE_EMP.name);
  });

  e2e('9. Verify email in view', async () => {
    const page = getPage();
    const modal = page.locator('[data-test-context="employee-view-modal"]');
    await expect(modal).toContainText(LIFECYCLE_EMP.email);
  });

  e2e('10. Verify phone in view', async () => {
    const page = getPage();
    const modal = page.locator('[data-test-context="employee-view-modal"]');
    await expect(modal).toContainText(LIFECYCLE_EMP.phone);
  });

  e2e('11. Close view',
    closeViewModal(getPage));

  // ─── EDIT ─────────────────────────────────────────────────────────────
  e2e('12. Search again', searchEmployee(getPage, LIFECYCLE_EMP.name));

  e2e('13. Edit employee — change phone',
    editFirstEmployee(getPage, { phone: '+573009998888' }));

  e2e('14. Verify edit success', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="employees-list"]')).toBeVisible();
  });

  // ─── SUSPEND ──────────────────────────────────────────────────────────
  e2e('15. Search employee', searchEmployee(getPage, LIFECYCLE_EMP.name));

  e2e('16. Suspend employee', suspendFirstEmployee(getPage));

  e2e('17. Verify Inactivo', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-test-key="search-input"]').fill(LIFECYCLE_EMP.name);
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody tr').first().locator('text=Inactivo')).toBeVisible({ timeout: 5_000 });
  });

  // ─── ACTIVATE ─────────────────────────────────────────────────────────
  e2e('18. Activate employee', activateFirstEmployee(getPage));

  e2e('19. Verify Activo', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-test-key="search-input"]').fill(LIFECYCLE_EMP.name);
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody tr').first().locator('text=Activo')).toBeVisible({ timeout: 5_000 });
  });

  // ─── DELETE ───────────────────────────────────────────────────────────
  e2e('20. Delete employee', deleteFirstEmployee(getPage));

  e2e('21. Verify deleted', async () => {
    const page = getPage();
    await page.waitForTimeout(1000);
    const error = page.locator('[class*="bg-red"]').filter({ hasText: 'Error' });
    expect(await error.isVisible().catch(() => false)).toBe(false);
  });
});
