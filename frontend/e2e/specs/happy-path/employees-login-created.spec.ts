/**
 * Employees Login Created Spec — Login with newly created employee.
 *
 * Flow:
 * 1. Login as Moises → create employee with forcePasswordChange=true
 * 2. Login with new employee → should redirect to /change-password
 * 3. Change password → redirects to dashboard
 * 4. Navigate to /profile → verify data
 *
 * NOTE: This spec creates its own employee to avoid dependency on other specs.
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  openCreateEmployeeModal,
  fillEmployeeForm,
  submitEmployeeForm,
} from '../../factories/employees.factory';
import { LOGIN_MOISES } from '../../fixtures/test-data';
import type { EmployeeFormData } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

// Unique employee for this spec
const ts = Date.now().toString().slice(-6);
const NEW_EMPLOYEE: EmployeeFormData = {
  name: `Login Test ${ts}`,
  email: `login-test-${ts}@emxeecta.mailosaur.net`,
  password: 'InitialPass2024!',
  phone: '+573001110000',
  nationalId: `LT${ts}`,
  nationality: 'Colombia',
  birthDate: '1992-03-20',
  hat: 'DEVELOPER',
  division: 'Infraestructura',
  forcePasswordChange: true,
};

e2e.describe.serial('Employees — Login Created + Force Password Change', () => {
  // Phase 1: Create the employee
  e2e('1. Login as Moises and navigate to /employees',
    loginAndNavigateToEmployees(getPage, LOGIN_MOISES));

  e2e('2. Create new employee',
    openCreateEmployeeModal(getPage));

  e2e('3. Fill employee form',
    fillEmployeeForm(getPage, NEW_EMPLOYEE));

  e2e('4. Submit form',
    submitEmployeeForm(getPage));

  // Phase 2: Login with new employee
  e2e('5. Login with new employee → redirects to /change-password', async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.context().clearCookies();
    await page.goto(`${baseUrl}/signin`);
    await page.waitForSelector('[data-test-context="login-form"][data-test-state="ready"]', { timeout: 15_000 });
    await page.locator('[data-test-key="email-input"]').fill(NEW_EMPLOYEE.email);
    await page.locator('[data-test-key="password-input"]').fill(NEW_EMPLOYEE.password);
    await page.locator('[data-test-key="submit-button"]').click();
    // Should redirect to change-password because forcePasswordChange=true
    await page.waitForURL('**/change-password', { timeout: 15_000 });
    await page.waitForSelector('[data-test-context="change-password-page"]', { timeout: 5_000 });
  });

  // Phase 3: Change password
  e2e('6. Change password', async () => {
    const page = getPage();
    await page.locator('[data-test-key="current-password-input"]').fill(NEW_EMPLOYEE.password);
    await page.locator('[data-test-key="new-password-input"]').fill('NewSecurePass2024!');
    await page.locator('[data-test-key="confirm-password-input"]').fill('NewSecurePass2024!');
    await page.locator('[data-test-key="submit-button"]').click();
    // Should redirect to dashboard after successful change
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain('/change-password');
  });

  // Phase 4: Verify profile
  e2e('7. Navigate to /profile and verify data', async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/profile`);
    await page.waitForSelector('[data-test-context="profile-page"]', { timeout: 10_000 });
    // Verify name
    const name = page.locator('[data-test-key="profile-name"]');
    await expect(name).toContainText(NEW_EMPLOYEE.name);
    // Verify division
    const division = page.locator('[data-test-key="profile-division"]');
    await expect(division).toContainText('Infraestructura');
  });
});
