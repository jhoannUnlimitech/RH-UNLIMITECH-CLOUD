/**
 * Profile Spec — Validates that /profile shows correct user data.
 *
 * Logs in as the e2e developer and verifies all profile fields match.
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import { LOGIN_DEVELOPER } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginAs(page: any) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/signin`);
  await page.waitForSelector('[data-test-context="login-form"][data-test-state="ready"]', { timeout: 15_000 });
  await page.locator('[data-test-key="email-input"]').fill(LOGIN_DEVELOPER.email);
  await page.locator('[data-test-key="password-input"]').fill(LOGIN_DEVELOPER.password);
  await page.locator('[data-test-key="submit-button"]').click();
  await page.locator('[data-test-context="signin-page"]').waitFor({ state: 'hidden', timeout: 15_000 });
}

// ─── Profile Data Validation ────────────────────────────────────────────────

e2e.describe.serial('Profile — User Data Validation', () => {
  e2e('1. Login as developer', async () => {
    const page = getPage();
    await loginAs(page);
  });

  e2e('2. Navigate to /profile', async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/profile`);
    await page.waitForSelector('[data-test-context="profile-page"]', { timeout: 15_000 });
  });

  e2e('3. Verify profile name', async () => {
    const page = getPage();
    const name = page.locator('[data-test-key="profile-name"]');
    await expect(name).toContainText('E2E Test Developer');
  });

  e2e('4. Verify profile role (hat)', async () => {
    const page = getPage();
    const role = page.locator('[data-test-key="profile-role"]');
    await expect(role).toContainText('DEVELOPER');
  });

  e2e('5. Verify profile division', async () => {
    const page = getPage();
    const division = page.locator('[data-test-key="profile-division"]');
    await expect(division).toContainText('Infraestructura');
  });

  e2e('6. Verify profile email', async () => {
    const page = getPage();
    const email = page.locator('[data-test-key="profile-email"]');
    await expect(email).toContainText('greatly-hide@emxeecta.mailosaur.net');
  });

  e2e('7. Verify profile phone', async () => {
    const page = getPage();
    const phone = page.locator('[data-test-key="profile-phone"]');
    await expect(phone).toContainText('+573001234567');
  });

  e2e('8. Verify profile national ID (cédula)', async () => {
    const page = getPage();
    const nationalId = page.locator('[data-test-key="profile-national-id"]');
    await expect(nationalId).toContainText('9999888877');
  });

  e2e('9. Verify profile nationality', async () => {
    const page = getPage();
    const nationality = page.locator('[data-test-key="profile-nationality"]');
    await expect(nationality).toContainText('Colombia');
  });

  e2e('10. Verify profile birth date', async () => {
    const page = getPage();
    const birthDate = page.locator('[data-test-key="profile-birth-date"]');
    await expect(birthDate).toContainText('1995');
  });

  e2e('11. Verify profile status (Activo)', async () => {
    const page = getPage();
    const status = page.locator('[data-test-key="profile-status"]');
    await expect(status).toContainText('Activo');
  });

  e2e('12. Verify edit info button is visible', async () => {
    const page = getPage();
    const editBtn = page.locator('[data-test-key="edit-info-button"]');
    await expect(editBtn).toBeVisible();
  });

  e2e('13. Verify change password button is visible', async () => {
    const page = getPage();
    const pwdBtn = page.locator('[data-test-key="change-password-button"]');
    await expect(pwdBtn).toBeVisible();
  });

  e2e('14. Click edit → modal opens with name pre-filled', async () => {
    const page = getPage();
    await page.locator('[data-test-key="edit-info-button"]').click();
    await page.waitForSelector('[data-test-context="edit-info-modal"]', { timeout: 5_000 });
    const nameInput = page.locator('[data-test-key="edit-name-input"]');
    await expect(nameInput).toHaveValue('E2E Test Developer');
  });

  e2e('15. Cancel edit → modal closes', async () => {
    const page = getPage();
    await page.locator('[data-test-context="edit-info-modal"] [data-test-key="modal-cancel-button"]').click();
    await page.locator('[data-test-context="edit-info-modal"]').waitFor({ state: 'hidden', timeout: 5_000 });
  });

  e2e('16. Change password button opens modal', async () => {
    const page = getPage();
    await page.locator('[data-test-key="change-password-button"]').click();
    await page.waitForSelector('[data-test-context="change-password-modal"]', { timeout: 5_000 });
    // Verify modal has the 3 password fields
    await expect(page.locator('[data-test-key="current-password-input"]')).toBeVisible();
    await expect(page.locator('[data-test-key="new-password-input"]')).toBeVisible();
    await expect(page.locator('[data-test-key="confirm-password-input"]')).toBeVisible();
  });
});
