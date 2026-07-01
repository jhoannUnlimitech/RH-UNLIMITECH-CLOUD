import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import { selectPlan } from '../../factories/plan-selection.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { signAgreement } from '../../factories/agreement.factory';
import { verifyAgreementSignedPage, continueFromAgreementSigned } from '../../factories/agreement-signed.factory';
import { completeCheckoutAndPay } from '../../factories/checkout.factory';
import { verifyPaidPage } from '../../factories/paid.factory';
import { verifyAgreementSignedEmail, verifyWelcomeEmail } from '../../factories/email-inbox.factory';
import {
  generateMailosaurEmail,
  LEAD_COLOMBIA,
  REG_COLOMBIA,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
} from '../../fixtures/test-data';

/**
 * Full Enrollment Flow — Escenario C (sin query params)
 *
 * Complete v3 flow:
 *   /sign-up → plan selection → general-info → details → thank-you →
 *   [verify email via Mailosaur] → agreement (Zoho Sign) →
 *   agreement-signed → checkout (Stripe) → paid (FIN)
 *
 * Requires:
 *   - Backend running (API + SQS + SendEmail Lambda + Cloud Core + Cloud Stripe)
 *   - Mailosaur credentials in .env.qa
 *   - CDP_ENDPOINT recommended for visual debugging
 *
 * Timeout: 300s (5 min) — email delivery + Stripe + Zoho Sign + polling.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_COLOMBIA, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(300_000);

let verifyUrl = '';

e2e.describe.serial('Full Enrollment — Escenario C (sin params)', () => {
  // ── Phase 1: Plan Selection + Lead + Registration ──
  e2e('navigate to sign-up',           navigateToSignUp(getPage));
  e2e('select general plan (annual)',   selectPlan(getPage, PLAN_GENERAL_ANNUAL));
  e2e('fill lead form',                fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form',              submitLeadForm(getPage));
  e2e('fill registration form',        fillRegistrationForm(getPage, REG_COLOMBIA));
  e2e('submit registration form',      submitRegistrationForm(getPage));

  // ── Phase 2: Email verification via Mailosaur ──
  e2e('verify thank-you page',         verifyThankYouPage(getPage));
  e2e('wait for verification email',   async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });
  e2e('verify email token → /agreement', () => navigateAndVerifyEmail(getPage, verifyUrl)());

  // ── Phase 3: Agreement signing (Zoho Sign) ──
  e2e('sign agreement',                signAgreement(getPage, 'Manuel Lara', 'ML', ZOHO_SIGN_LABELS_EN));
  e2e('verify agreement-signed page',  verifyAgreementSignedPage(getPage));
  e2e('continue to checkout',          continueFromAgreementSigned(getPage));

  // ── Phase 4: Stripe Checkout → Paid ──
  e2e('complete Stripe checkout',      completeCheckoutAndPay(getPage));
  e2e('verify payment (final)',        verifyPaidPage(getPage));

  // ── Phase 5: Email inbox verification ──
  e2e('verify agreement-signed email', verifyAgreementSignedEmail(testEmail));
  // NOTE: Welcome email depends on ProcessPayment (Slice 02 — pending backend).
  // Uncomment when the welcome email is confirmed working in v3.
  // e2e('verify welcome email',          verifyWelcomeEmail(testEmail));
});
