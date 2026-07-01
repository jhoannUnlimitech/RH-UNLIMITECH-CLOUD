import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpWithPlan } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { signAgreement } from '../../factories/agreement.factory';
import { verifyAgreementSignedPage, continueFromAgreementSigned } from '../../factories/agreement-signed.factory';
import { completeCheckoutAndPay } from '../../factories/checkout.factory';
import { verifyPaidPage } from '../../factories/paid.factory';
import {
  LEAD_COLOMBIA,
  REG_COLOMBIA,
  PARAMS_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
  generateMailosaurEmail,
} from '../../fixtures/test-data';

/**
 * Payment Verification Flow — E2E Test (v3)
 *
 * Verifies that after Stripe checkout, the paid page correctly handles
 * both immediate payment confirmation and delayed webhook processing.
 *
 * Timeout: 300s (5 min).
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test payment-verification
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_COLOMBIA, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(300_000);

let verifyUrl = '';

e2e.describe.serial('Payment Verification Flow — Colombia (v3)', () => {
  e2e('navigate with plan+interval',   navigateToSignUpWithPlan(getPage, PARAMS_GENERAL_ANNUAL));
  e2e('fill lead form',                fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form',              submitLeadForm(getPage));
  e2e('fill registration form',        fillRegistrationForm(getPage, REG_COLOMBIA));
  e2e('submit registration form',      submitRegistrationForm(getPage));
  e2e('verify thank-you page',         verifyThankYouPage(getPage));
  e2e('wait for verification email',   async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });
  e2e('verify email token',            () => navigateAndVerifyEmail(getPage, verifyUrl)());
  e2e('sign agreement',                signAgreement(getPage, 'Manuel Lara', 'ML', ZOHO_SIGN_LABELS_EN));
  e2e('verify agreement-signed page',  verifyAgreementSignedPage(getPage));
  e2e('continue to checkout',          continueFromAgreementSigned(getPage));
  e2e('complete Stripe checkout',      completeCheckoutAndPay(getPage));
  e2e('verify payment',                verifyPaidPage(getPage));
});
