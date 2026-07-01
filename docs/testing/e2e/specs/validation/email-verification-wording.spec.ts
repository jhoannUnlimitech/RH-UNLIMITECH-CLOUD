/**
 * Email Verification Wording — Validates email body matches Rules Document (#893).
 *
 * Flow:
 *   Form 1 (fill + submit) → Form 2 (fill + submit) → Plan (select) →
 *   Thank You (wait for email) → Mailosaur API (validate body content)
 *
 * Validates:
 *   - Personalized greeting with firstName
 *   - CTA text "click the button below to verify your email address"
 *   - VERIFY button/link functional
 *   - @membership.wise.org domain notice
 *   - 3 security tips (contacts, domain verification, cautious)
 *   - Contact support@membership.wise.org
 *   - Sign-off "Best regards, WISE Membership Support"
 *   - Text version completeness
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test email-verification-wording --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base.js';
import { navigateToSignUpV4 } from '../../factories/navigation.factory.js';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory.js';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory.js';
import { selectPlanV4 } from '../../factories/plan-selection.factory.js';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  PLAN_GENERAL_ANNUAL,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data.js';
import {
  resetCapturedEmail,
  captureVerificationEmail,
  verifyEmailGreeting,
  verifyEmailCTA,
  verifyEmailButton,
  verifyEmailDomainNotice,
  verifyEmailSecurityTip1,
  verifyEmailSecurityTip2,
  verifyEmailSecurityTip3,
  verifyEmailContactInfo,
  verifyEmailSignoff,
  verifyEmailTextVersion,
} from '../../factories/email-wording.factory.js';

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(180_000);

// ─── Test email (Mailosaur) ─────────────────────────────────────────────────
const testEmail = generateMailosaurEmail('wording');
const leadData = { ...LEAD_USA_V4, email: testEmail };
// Skip photo upload for speed; use URL without https:// prefix (field pre-populates it)
const regData = {
  ...REG_USA_V4,
  profilePhotoPath: undefined,
  companyWebsites: ['www.example-test.com'],
};

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('Email Verification Wording (#893)', () => {

  // ── Setup: Complete enrollment up to email dispatch ────────────────────────

  e2e.beforeAll(() => {
    resetCapturedEmail();
  });

  e2e('navigate to form 1', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form', fillLeadForm(getPage, leadData));
  e2e('submit lead form → /details', submitLeadForm(getPage));
  e2e('fill registration form', fillRegistrationForm(getPage, regData));
  e2e('submit registration → /plan', submitRegistrationForm(getPage));
  e2e('select plan (General Annual)', selectPlanV4(getPage, PLAN_GENERAL_ANNUAL));

  // ── Capture: Intercept verification email via Mailosaur ───────────────────

  e2e('capture verification email from Mailosaur', captureVerificationEmail(testEmail));

  // ── Validation: Email body content per Rules Document ─────────────────────

  e2e('AC-893-01: Greeting "Dear [FirstName],"',
    verifyEmailGreeting(LEAD_USA_V4.firstName));

  e2e('AC-893-02: CTA "click the button below to verify your email address"',
    verifyEmailCTA());

  e2e('AC-893-03: VERIFY button/link present and functional',
    verifyEmailButton());

  e2e('AC-893-04: Domain notice "@membership.wise.org"',
    verifyEmailDomainNotice());

  e2e('AC-893-05: Security tip — contacts/safe sender list',
    verifyEmailSecurityTip1());

  e2e('AC-893-06: Security tip — verify domain authenticity',
    verifyEmailSecurityTip2());

  e2e('AC-893-07: Security tip — cautious of similar domains',
    verifyEmailSecurityTip3());

  e2e('AC-893-08: Contact "support@membership.wise.org"',
    verifyEmailContactInfo());

  e2e('AC-893-09: Sign-off "Best regards, WISE Membership Support"',
    verifyEmailSignoff());

  e2e('AC-893-10: Text version contains all key content',
    verifyEmailTextVersion());
});
