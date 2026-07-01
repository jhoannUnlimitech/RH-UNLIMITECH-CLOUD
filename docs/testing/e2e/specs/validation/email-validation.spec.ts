import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { selectPlan } from '../../factories/plan-selection.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { verifyThankYouPage, verifyResendCooldown, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail, verifyTokenAlreadyUsed, verifyInvalidSessionRedirects, verifyTokenAfterCompletion } from '../../factories/verify.factory';
import { signAgreement } from '../../factories/agreement.factory';
import { verifyAgreementSignedPage, continueFromAgreementSigned } from '../../factories/agreement-signed.factory';
import { completeCheckoutAndPay } from '../../factories/checkout.factory';
import { verifyPaidPage } from '../../factories/paid.factory';
import {
  verifyVerificationEmailContent,
  verifyAgreementSignedEmail,
  verifyWelcomeEmail,
  verifyNoEmailWithoutRegistration,
} from '../../factories/email-inbox.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  LEAD_COLOMBIA,
  REG_USA_V4,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
} from '../../fixtures/test-data';

/**
 * Email Validation V4 — All email-related acceptance criteria in 1 session.
 *
 * V4 flow order: general-info → details → plan → thank-you → verify → ...
 *
 * Emails validated (AC-44a/b/c — only from contact@unlimitech.cloud):
 *   1. Verification email — after plan selection submit
 *   2. Agreement-signed email — after Zoho Sign completion
 *   3. Welcome email — after payment completion (AC-44c)
 *
 * Emails IGNORED (AC-44f): Any from Zoho CRM domains (contacts.zoho.com, etc.)
 *
 * Acceptance Criteria:
 *   AC-44a: Verification email — subject, sender, link with token+session-id
 *   AC-44b: Agreement-signed email — subject, sender, link to /agreement-signed
 *   AC-44c: Welcome email — subject, sender, enrollment complete content
 *   AC-44d: No email without plan selection (only lead+registration)
 *   AC-44e: No forbidden links, HTML+text versions present
 *   AC-44f: Ignore Zoho CRM emails (not in scope)
 *   AC-19a: Verification link contains session-id
 *   AC-19c: Token reuse after full flow completion
 *   AC-19d: Invalid session ID → error/redirect
 *   AC-19e: Token reuse immediately after consumption → already-verified
 *   AC-50: Resend email cooldown behavior
 *
 * Timeout: 480s (8 min) — email + Zoho Sign + Stripe + negative test.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test email-validation
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(480_000);

let verifyUrl = '';

e2e.describe.serial('Email Validation V4 — USA', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP: Navigate → Lead → Registration → Plan Selection → Thank You
  // V4 order: general-info → details → plan → thank-you (AC-53)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('navigate (v4 params)',          navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',               fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form',             submitLeadForm(getPage));
  e2e('fill registration form',       fillRegistrationForm(getPage, REG_USA_V4));
  e2e('submit registration form',     submitRegistrationForm(getPage));
  e2e('select general plan (annual)',  selectPlan(getPage, PLAN_GENERAL_ANNUAL));
  e2e('verify thank-you page',        verifyThankYouPage(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICATION EMAIL — AC-44a, AC-44e, AC-19a
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-44a: verification email — subject, sender, links, content',
    verifyVerificationEmailContent(testEmail));

  // ═══════════════════════════════════════════════════════════════════════════
  // RESEND COOLDOWN — AC-50
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-50: resend button cooldown behavior',
    verifyResendCooldown(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // EMAIL VERIFICATION FLOW
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('capture verification link',     async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });

  e2e('verify email token → /agreement', () => navigateAndVerifyEmail(getPage, verifyUrl)());

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN REUSE — AC-19e (token already consumed)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-19e: reuse consumed token → already-verified',
    () => verifyTokenAlreadyUsed(getPage, verifyUrl)());

  // Navigate back to agreement after token reuse verification
  e2e('continue from already-verified → /agreement', async () => {
    const page = getPage();
    const continueBtn = page.locator('[data-test-context="verify-page"] [data-test-key="continue-button"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForURL(/\/sign-up\/[^/]+\/agreement/, { timeout: 15_000 });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ADVANCE FLOW: Agreement → Agreement Signed → Checkout → Paid
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('sign agreement',                signAgreement(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN));
  e2e('verify agreement-signed page',  verifyAgreementSignedPage(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // AGREEMENT SIGNED EMAIL — AC-44b, AC-44e
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-44b: agreement-signed email — subject, sender, links, content',
    verifyAgreementSignedEmail(testEmail));

  e2e('continue to checkout',          continueFromAgreementSigned(getPage));
  e2e('complete Stripe checkout',      completeCheckoutAndPay(getPage));
  e2e('verify payment (final)',        verifyPaidPage(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME EMAIL — AC-44c, AC-44e
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-44c: welcome email — subject, sender, content',
    verifyWelcomeEmail(testEmail));

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-COMPLETION VALIDATIONS — AC-19c, AC-19d
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-19c: reuse token after full completion → already-verified or redirect',
    () => verifyTokenAfterCompletion(getPage, verifyUrl)());

  e2e('AC-19d: invalid session verify → error or redirect',
    verifyInvalidSessionRedirects(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // NEGATIVE TEST — AC-44d: No email without plan selection
  // In V4, email is sent after plan selection (not after registration).
  // A session with only lead+registration should NOT receive an email.
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-44d: setup — navigate to new session (v4)', async () => {
    const page = getPage();
    const url = process.env.BASE_URL || 'https://localhost:9010';
    await page.goto(`${url}/sign-up`);
    await page.waitForURL(/\/sign-up\/[^/]+\/general-info/);
  });

  e2e('AC-44d: fill and submit lead + registration (no plan selection)', async () => {
    const negativeEmail = generateMailosaurEmail('noemail');
    const page = getPage();

    // Fill lead form with a different Mailosaur email
    const { fillLeadForm: fillLead, submitLeadForm: submitLead } = await import('../../factories/lead-form.factory');
    await fillLead(() => page, { ...LEAD_COLOMBIA, email: negativeEmail })();
    await submitLead(() => page)();

    // Fill and submit registration (but do NOT select plan)
    const { fillRegistrationForm: fillReg, submitRegistrationForm: submitReg } = await import('../../factories/registration-form.factory');
    const { REG_COLOMBIA: regData } = await import('../../fixtures/test-data');
    await fillReg(() => page, regData)();
    await submitReg(() => page)();

    // Now on /plan — but we do NOT select a plan (no email should be sent)
    await page.waitForURL(/\/sign-up\/[^/]+\/plan/);

    // Store email for the next step
    (globalThis as any).__negativeTestEmail = negativeEmail;
  });

  e2e('AC-44d: verify NO email received (lead+registration only, no plan selection)', async () => {
    const negativeEmail = (globalThis as any).__negativeTestEmail;
    await verifyNoEmailWithoutRegistration(negativeEmail)();
  });
});
