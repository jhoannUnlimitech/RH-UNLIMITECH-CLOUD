import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationFormV4 } from '../../factories/registration-form.factory';
import { selectPlanV4 } from '../../factories/plan-selection.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { signAgreementMultipleSigners } from '../../factories/agreement.factory';
import { verifyAgreementSignedPage, continueFromAgreementSigned } from '../../factories/agreement-signed.factory';
import { completeCheckoutAndPay } from '../../factories/checkout.factory';
import { verifyPaidPage } from '../../factories/paid.factory';
import { verifyAgreementSignedEmail } from '../../factories/email-inbox.factory';
import {
  generateMailosaurEmail,
  LEAD_COLOMBIA,
  REG_COLOMBIA,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
} from '../../fixtures/test-data';

/**
 * Full Enrollment Flow — Multiple Signers (Zoho Sign template with multiple signature fields)
 *
 * v4 step order:
 *   /sign-up → /general-info → /details → /plan → /thank-you →
 *   [verify email via Mailosaur] → /agreement (sign multiple fields) →
 *   /agreement-signed → /checkout (Stripe) → /paid (FIN)
 *
 * Difference from enrollment-flow-v4:
 *   Uses signAgreementMultipleSigners which handles templates with multiple
 *   signature fields (clicks each remaining field after initial signature).
 *
 * Timeout: 300s (5 min).
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-multiple-signers
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_COLOMBIA, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(420_000);

let verifyUrl = '';
let adminSignUrl = '';

e2e.describe.serial('Full Enrollment — Multiple Signers — Colombia', () => {
  // ── Phase 1: Lead (Form 1) + Registration (Form 2) + Plan Selection ──
  e2e('navigate to sign-up',              navigateToSignUpV4(getPage));
  e2e('fill lead form',                   fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form → details',       submitLeadForm(getPage));
  e2e('fill registration form',           fillRegistrationForm(getPage, REG_COLOMBIA));
  e2e('submit registration → plan',       submitRegistrationFormV4(getPage));
  e2e('select general plan (annual)',      selectPlanV4(getPage, PLAN_GENERAL_ANNUAL));

  // ── Phase 2: Email verification via Mailosaur ──
  e2e('verify thank-you page',            verifyThankYouPage(getPage));
  e2e('wait for verification email',      async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });
  e2e('verify email token → /agreement',  () => navigateAndVerifyEmail(getPage, verifyUrl)());

  // ── Phase 3: Agreement signing (Zoho Sign — multiple signers) ──
  e2e('sign agreement (multiple)',         signAgreementMultipleSigners(getPage, 'Manuel Lara', 'ML', ZOHO_SIGN_LABELS_EN));
  e2e('verify agreement-signed page',     verifyAgreementSignedPage(getPage));
  e2e('continue to checkout',             continueFromAgreementSigned(getPage));

  // ── Phase 4: Stripe Checkout → Paid ──
  e2e('complete Stripe checkout',         completeCheckoutAndPay(getPage));
  e2e('verify payment (final)',           verifyPaidPage(getPage));

  // ── Phase 5: Email inbox verification ──
  e2e('verify agreement-signed email',    verifyAgreementSignedEmail(testEmail));

  // ── Phase 6: Admin Agreement Signing ──
  e2e('AC-AS01: receive admin signing email', async () => {
    const { waitForAdminSigningEmail } = await import('../../factories/admin-signing.factory');
    const url = await waitForAdminSigningEmail(testEmail)();
    adminSignUrl = url;
  });
  e2e('AC-AS04 to AC-AS10: admin signs agreement', async () => {
    const { signAsAdmin } = await import('../../factories/admin-signing.factory');
    await signAsAdmin(getPage, adminSignUrl)();
  });
  e2e('AC-AS11: verify completion email', async () => {
    const { verifyCompletionEmail } = await import('../../factories/admin-signing.factory');
    await verifyCompletionEmail()();
  });

  // ── Phase 7: Export bridge data for provisioning ──
  e2e('export bridge data', async () => {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { resolve } = await import('path');
    const outputDir = resolve(process.cwd(), '.temp');
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(
      resolve(outputDir, 'bridge-output.json'),
      JSON.stringify({
        email: testEmail,
        firstName: LEAD_COLOMBIA.firstName,
        lastName: LEAD_COLOMBIA.lastName,
        timestamp: new Date().toISOString(),
      }, null, 2),
    );
  });
});
