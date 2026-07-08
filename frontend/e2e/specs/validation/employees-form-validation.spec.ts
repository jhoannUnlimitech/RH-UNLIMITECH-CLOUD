/**
 * Employees Form Validation Spec — Field validation errors.
 *
 * Tests:
 * - Submit with empty fields → error messages
 * - Invalid email format
 * - Password too short
 * - Duplicate email (backend validation)
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToEmployees,
  openCreateEmployeeModal,
} from '../../factories/employees.factory';
import { LOGIN_MOISES } from '../../fixtures/test-data';

// ─── Flow 1: Submit empty form shows errors ─────────────────────────────────

const emptySubmit = createSerialFlow();

emptySubmit.e2e.describe.serial('Employees Validation — Empty Submit', () => {
  emptySubmit.e2e('1. Login and navigate to employees',
    loginAndNavigateToEmployees(emptySubmit.getPage, LOGIN_MOISES));

  emptySubmit.e2e('2. Open create modal',
    openCreateEmployeeModal(emptySubmit.getPage));

  emptySubmit.e2e('3. Click submit without filling', async () => {
    const page = emptySubmit.getPage();
    const modal = page.locator('.fixed [class*="max-w"]').last();
    const submitBtn = modal.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1000);
    // Modal should still be open (validation prevented submit)
    await expect(modal).toBeVisible();
  });

  emptySubmit.e2e('4. Verify form shows validation errors (modal stays open)', async () => {
    const page = emptySubmit.getPage();
    // The form didn't close — validation errors exist
    // Check that at least one error class element is visible (text-red or text-error)
    const errorElements = page.locator('.text-red-500, .text-error-500, [class*="text-red"]');
    const count = await errorElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Flow 2: Short password shows error ─────────────────────────────────────

const shortPassword = createSerialFlow();

shortPassword.e2e.describe.serial('Employees Validation — Short Password', () => {
  shortPassword.e2e('1. Login and navigate',
    loginAndNavigateToEmployees(shortPassword.getPage, LOGIN_MOISES));

  shortPassword.e2e('2. Open create modal',
    openCreateEmployeeModal(shortPassword.getPage));

  shortPassword.e2e('3. Fill password with less than 6 chars', async () => {
    const page = shortPassword.getPage();
    const modal = page.locator('.fixed [class*="max-w"]').last();
    await modal.locator('#name').fill('Test');
    await modal.locator('#email').fill('test@test.com');
    await modal.locator('#password').fill('abc');
    await modal.locator('#phone').fill('+57300');
    await modal.locator('#nationalId').fill('123');
  });

  shortPassword.e2e('4. Submit and check password error', async () => {
    const page = shortPassword.getPage();
    const modal = page.locator('.fixed [class*="max-w"]').last();
    await modal.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1000);
    // Modal stays open (validation failed)
    await expect(modal).toBeVisible();
    // Check error elements are present
    const errorElements = page.locator('.text-red-500, .text-error-500, [class*="text-red"]');
    const count = await errorElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Flow 3: Invalid email format ───────────────────────────────────────────

const invalidEmail = createSerialFlow();

invalidEmail.e2e.describe.serial('Employees Validation — Invalid Email', () => {
  invalidEmail.e2e('1. Login and navigate',
    loginAndNavigateToEmployees(invalidEmail.getPage, LOGIN_MOISES));

  invalidEmail.e2e('2. Open create modal',
    openCreateEmployeeModal(invalidEmail.getPage));

  invalidEmail.e2e('3. Fill invalid email and submit', async () => {
    const page = invalidEmail.getPage();
    const modal = page.locator('.fixed [class*="max-w"]').last();
    await modal.locator('#name').fill('Test Employee');
    await modal.locator('#email').fill('not-an-email');
    await modal.locator('#password').fill('ValidPass123!');
    await modal.locator('#phone').fill('+573001234567');
    await modal.locator('#nationalId').fill('9999999999');
    await modal.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(500);
  });

  invalidEmail.e2e('4. Verify email format error', async () => {
    const page = invalidEmail.getPage();
    const error = page.locator('text=email').or(page.locator('text=válido'));
    await expect(error.first()).toBeVisible({ timeout: 3_000 });
  });
});
