/**
 * Login E2E Spec — Happy Path.
 *
 * Validates the successful login flow:
 * 1. Navigate to sign-in page
 * 2. Verify initial state
 * 3. Fill credentials (developer user)
 * 4. Submit → redirect to dashboard
 *
 * Pre-requisites:
 * - Backend running on port 9050
 * - Frontend running on port 5173
 * - Test user created (run: npx tsx e2e/fixtures/seed-test-user.ts)
 */

import { createSerialFlow } from '../../fixtures/base';
import {
  navigateToSignIn,
  fillLoginForm,
  submitLoginForm,
  verifyLoginPageInitialState,
  verifyDashboardRedirect,
} from '../../factories/login.factory';
import { LOGIN_DEVELOPER } from '../../fixtures/test-data';

// ─── Happy Path: Developer Login ────────────────────────────────────────────

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Login — Happy Path (Developer)', () => {
  e2e('navigate to sign-in page', navigateToSignIn(getPage));
  e2e('verify initial page state', verifyLoginPageInitialState(getPage));
  e2e('fill login form with developer credentials', fillLoginForm(getPage, LOGIN_DEVELOPER));
  e2e('submit form and redirect to dashboard', submitLoginForm(getPage));
  e2e('verify dashboard redirect', verifyDashboardRedirect(getPage));
});
