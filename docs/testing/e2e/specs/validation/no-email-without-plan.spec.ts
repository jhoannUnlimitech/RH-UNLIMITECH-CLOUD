/**
 * AC-44-v4d — No email without plan selection (negative test)
 *
 * Validates that the system does NOT send a verification email when only
 * lead form + registration form are submitted WITHOUT selecting a plan.
 *
 * In V4, the email is triggered after plan selection (step 3), not after
 * registration (step 2). A session that stops at /plan should NOT receive
 * any email from the system.
 *
 * Flow:
 *   1. Navigate to /sign-up → /general-info
 *   2. Fill and submit lead form → /details
 *   3. Fill and submit registration form → /plan
 *   4. STOP — do NOT select a plan
 *   5. Wait 20 seconds and verify NO email arrived
 *
 * Run:
 *   npx playwright test no-email-without-plan
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test no-email-without-plan
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationFormV4 } from '../../factories/registration-form.factory';
import { verifyNoEmailWithoutRegistration } from '../../factories/email-inbox.factory';
import {
  generateMailosaurEmail,
  LEAD_COLOMBIA,
  REG_COLOMBIA,
} from '../../fixtures/test-data';

const testEmail = generateMailosaurEmail('no-plan');
const LEAD_MAILOSAUR = { ...LEAD_COLOMBIA, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(120_000);

e2e.describe.serial('AC-44-v4d — No email without plan selection', () => {
  // ── Setup: Lead + Registration (no plan) ──────────────────────
  e2e('navigate to sign-up (v4)', navigateToSignUpV4(getPage));
  e2e('fill lead form', fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form → details', submitLeadForm(getPage));
  e2e('fill registration form', fillRegistrationForm(getPage, REG_COLOMBIA));
  e2e('submit registration → plan', submitRegistrationFormV4(getPage));

  // ── Validation: Verify on /plan page but NO email sent ────────
  e2e('verify on plan page (no selection)', async () => {
    const page = getPage();
    await page.waitForURL(/\/sign-up\/[^/]+\/plan/, { timeout: 10_000 });
  });

  e2e('AC-44-v4d: verify NO email received', verifyNoEmailWithoutRegistration(testEmail, 20_000));
});
