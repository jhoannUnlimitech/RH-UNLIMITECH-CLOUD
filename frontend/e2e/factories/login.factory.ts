/**
 * Login Factory — Interaction logic for the Sign In page.
 *
 * Provides reusable factories for:
 * - Navigating to the login page
 * - Filling the login form
 * - Submitting the form
 * - Verifying successful login (redirect to dashboard)
 * - Verifying error states
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/signin.pom';
import type { LoginData, InvalidLoginData } from '../fixtures/test-data';

// ─── Selectors (derived from POM — evaluated once at module load) ───────────

const sel = {
  signinPage:       pom.signin_page.$(),
  pageTitle:        pom.signin_page._.page_title.$(),
  formReady:        pom.signin_page._.login_form.ready.$(),
  formLoading:      pom.signin_page._.login_form.loading.$(),
  emailInput:       pom.signin_page._.login_form._.login_inputs._.email_input.$(),
  passwordInput:    pom.signin_page._.login_form._.login_inputs._.password_input.$(),
  showPasswordToggle: pom.signin_page._.login_form._.login_inputs._.show_password_toggle.$(),
  forgotPasswordLink: pom.signin_page._.login_form._.login_inputs._.forgot_password_link.$(),
  submitButton:     pom.signin_page._.login_form._.login_inputs._.submit_button.$(),
  submitReady:      pom.signin_page._.login_form._.login_inputs._.submit_button.ready.$(),
  submitLoading:    pom.signin_page._.login_form._.login_inputs._.submit_button.loading.$(),
  errorMessage:     pom.signin_page._.login_form._.error_message.$(),
  errorVisible:     pom.signin_page._.login_form._.error_message.visible.$(),
};

// ─── Navigation ─────────────────────────────────────────────────────────────

/**
 * Navigates to the Sign In page and waits for the form to be ready.
 */
export function navigateToSignIn(getPage: () => Page, baseURL?: string) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'http://localhost:5173';

    // Clear cookies to ensure no existing session
    await page.context().clearCookies();

    // Navigate to signin page
    await page.goto(`${url}/signin`);
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });
  };
}

// ─── Fill Form ──────────────────────────────────────────────────────────────

/**
 * Fills the login form with the provided credentials.
 * Does NOT submit — use submitLoginForm for that.
 */
export function fillLoginForm(getPage: () => Page, data: LoginData) {
  return async () => {
    const page = getPage();

    // Wait for form ready
    await page.waitForSelector(sel.formReady, { timeout: 10_000 });

    // Fill email
    const emailInput = page.locator(sel.emailInput);
    await emailInput.fill(data.email);
    await expect(emailInput).toHaveValue(data.email);

    // Fill password
    const passwordInput = page.locator(sel.passwordInput);
    await passwordInput.fill(data.password);
    await expect(passwordInput).toHaveValue(data.password);
  };
}

// ─── Submit Form ────────────────────────────────────────────────────────────

/**
 * Clicks the submit button and waits for navigation to dashboard (success).
 */
export function submitLoginForm(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait for signin page context to disappear (SPA navigated away)
    await expect(page.locator(sel.signinPage)).toBeHidden({ timeout: 15_000 });
  };
}

/**
 * Clicks the submit button expecting an error (invalid credentials).
 * Verifies the error message appears.
 */
export function submitLoginFormExpectingError(getPage: () => Page, data: InvalidLoginData) {
  return async () => {
    const page = getPage();

    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait for loading state to appear and resolve
    await page.waitForSelector(sel.formReady, { timeout: 10_000 });

    // Verify error message appears
    const errorMsg = page.locator(sel.errorVisible);
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });
    await expect(errorMsg).toContainText(data.expectedError);
  };
}

// ─── Verify States ──────────────────────────────────────────────────────────

/**
 * Verifies the login page is displayed correctly (initial state).
 */
export function verifyLoginPageInitialState(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Page title visible
    const title = page.locator(sel.pageTitle);
    await expect(title).toBeVisible();
    await expect(title).toContainText('Iniciar Sesión');

    // Form is ready
    await expect(page.locator(sel.formReady)).toBeVisible();

    // Inputs are visible and empty
    const emailInput = page.locator(sel.emailInput);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('');

    const passwordInput = page.locator(sel.passwordInput);
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveValue('');

    // Submit button ready
    const submitBtn = page.locator(sel.submitReady);
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();

    // Error message should NOT be visible
    await expect(page.locator(sel.errorMessage)).not.toBeVisible();

    // Show password toggle visible
    await expect(page.locator(sel.showPasswordToggle)).toBeVisible();

    // Forgot password link visible
    await expect(page.locator(sel.forgotPasswordLink)).toBeVisible();
  };
}

/**
 * Verifies that the user landed on the dashboard after successful login.
 */
export function verifyDashboardRedirect(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // After successful login, the signin form is gone and we're on the dashboard
    // Verify the login form is NOT present (we navigated away)
    await expect(page.locator(sel.signinPage)).not.toBeVisible({ timeout: 5_000 });
    // Verify URL no longer contains /signin
    expect(page.url()).not.toContain('/signin');
  };
}

/**
 * Verifies the show/hide password toggle works correctly.
 */
export function verifyPasswordToggle(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const passwordInput = page.locator(sel.passwordInput);
    const toggle = page.locator(sel.showPasswordToggle);

    // Initially password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle → password visible
    await toggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again → password hidden
    await toggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  };
}
