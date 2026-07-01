/**
 * Login Validation Spec — Error cases and UI interactions.
 *
 * Validates:
 * - Invalid credentials → error message displayed
 * - Non-existent user → error message displayed
 * - Password visibility toggle
 * - Form re-interactive after error (can retry)
 *
 * Pre-requisites:
 * - Backend running on port 9050
 * - Frontend running on port 5173
 */

import { createSerialFlow } from '../../fixtures/base';
import {
  navigateToSignIn,
  fillLoginForm,
  submitLoginFormExpectingError,
  verifyLoginPageInitialState,
  verifyPasswordToggle,
} from '../../factories/login.factory';
import {
  LOGIN_DEVELOPER,
  LOGIN_WRONG_PASSWORD,
  LOGIN_NONEXISTENT_USER,
} from '../../fixtures/test-data';

// ─── Flow 1: Wrong Password ────────────────────────────────────────────────

const wrongPassword = createSerialFlow();

wrongPassword.e2e.describe.serial('Login Validation — Wrong Password', () => {
  wrongPassword.e2e('navigate to sign-in page', navigateToSignIn(wrongPassword.getPage));
  wrongPassword.e2e('verify initial page state', verifyLoginPageInitialState(wrongPassword.getPage));
  wrongPassword.e2e('fill form with wrong password', fillLoginForm(wrongPassword.getPage, LOGIN_WRONG_PASSWORD));
  wrongPassword.e2e('submit and verify error message', submitLoginFormExpectingError(wrongPassword.getPage, LOGIN_WRONG_PASSWORD));
});

// ─── Flow 2: Non-existent User ──────────────────────────────────────────────

const nonexistent = createSerialFlow();

nonexistent.e2e.describe.serial('Login Validation — Non-existent User', () => {
  nonexistent.e2e('navigate to sign-in page', navigateToSignIn(nonexistent.getPage));
  nonexistent.e2e('fill form with non-existent user', fillLoginForm(nonexistent.getPage, LOGIN_NONEXISTENT_USER));
  nonexistent.e2e('submit and verify error message', submitLoginFormExpectingError(nonexistent.getPage, LOGIN_NONEXISTENT_USER));
});

// ─── Flow 3: Password Toggle ────────────────────────────────────────────────

const passwordToggle = createSerialFlow();

passwordToggle.e2e.describe.serial('Login Validation — Password Visibility Toggle', () => {
  passwordToggle.e2e('navigate to sign-in page', navigateToSignIn(passwordToggle.getPage));
  passwordToggle.e2e('fill password field', fillLoginForm(passwordToggle.getPage, LOGIN_DEVELOPER));
  passwordToggle.e2e('toggle password visibility', verifyPasswordToggle(passwordToggle.getPage));
});
