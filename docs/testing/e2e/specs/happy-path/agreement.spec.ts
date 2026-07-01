import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { selectPlan } from '../../factories/plan-selection.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { signAgreement } from '../../factories/agreement.factory';
import {
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
  generateMailosaurEmail,
} from '../../fixtures/test-data';

/**
 * Agreement Page — Happy Path E2E Test (V4)
 *
 * V4 flow: general-info → details → plan → thank-you → verify →
 *          agreement (Zoho Sign) → signed
 *
 * Timeout: 300s (5 min).
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test agreement
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(300_000);

let verifyUrl = '';

e2e.describe.serial('Agreement — Happy Path (V4)', () => {
  e2e('navigate with v4 params',       navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',                fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form',              submitLeadForm(getPage));
  e2e('fill registration form',        fillRegistrationForm(getPage, REG_USA_V4));
  e2e('submit registration form',      submitRegistrationForm(getPage));
  e2e('select plan',                   selectPlan(getPage, PLAN_GENERAL_ANNUAL));
  e2e('verify thank-you page',         verifyThankYouPage(getPage));
  e2e('wait for verification email',   async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });
  e2e('verify email token',            () => navigateAndVerifyEmail(getPage, verifyUrl)());
  e2e('sign agreement',                signAgreement(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN));
});
