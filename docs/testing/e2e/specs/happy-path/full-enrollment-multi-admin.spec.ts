import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { selectPlan } from '../../factories/plan-selection.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { signAgreementMultipleSigners } from '../../factories/agreement.factory';
import { verifyAgreementSignedPage, continueFromAgreementSigned } from '../../factories/agreement-signed.factory';
import { completeCheckoutAndPay } from '../../factories/checkout.factory';
import { verifyPaidPage } from '../../factories/paid.factory';
import { verifyWelcomeEmail } from '../../factories/email-inbox.factory';
import {
  waitForAdminSigningEmailByRecipient,
  signAsAdmin,
  verifyCompletionEmailForAdmin,
} from '../../factories/admin-signing.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
  ADMIN_EMAIL_1,
  ADMIN_EMAIL_2,
} from '../../fixtures/test-data';

/**
 * Full Enrollment Flow — Multi-Admin (1 Client + 2 Admins)
 *
 * Validates the agreement signing flow with a template that requires
 * 2 admin countersignatures (WISE Director + VP Operations).
 *
 * Flow:
 *   general-info → details → plan → thank-you →
 *   verify email → agreement (client signs) → agreement-signed →
 *   checkout (Stripe) → paid →
 *   admin1 signs → admin2 signs → document completed
 *
 * Covers: AC-AMA-06 to AC-AMA-08, AC-AMA-11, AC-AMA-12, AC-AMA-14 to AC-AMA-16
 *
 * Requires:
 *   - Template EN configured with 2 Admin actions in Zoho Sign
 *   - ZOHO_SIGN_ADMINS="admin-wise@domain:WISE Director|admin-wise2@domain:VP Operations"
 *   - CDP_ENDPOINT recommended
 *
 * Timeout: 600s (10 min) — two admin signing rounds + email waits.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-multi-admin
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(600_000);

let verifyUrl = '';
let adminSignUrl1 = '';
let adminSignUrl2 = '';

e2e.describe.serial('Full Enrollment — Multi-Admin (1 Client + 2 Admins)', () => {

  // ── Phase 1: General Info (Lead Form) ──────────────────────────────────────
  e2e('navigate with v4 params', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',          fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form',        submitLeadForm(getPage));

  // ── Phase 2: Registration (Details Form) ───────────────────────────────────
  e2e('fill registration form',    fillRegistrationForm(getPage, REG_USA_V4));
  e2e('submit registration',       submitRegistrationForm(getPage));

  // ── Phase 3: Plan Selection ────────────────────────────────────────────────
  e2e('select general plan (annual)', selectPlan(getPage, PLAN_GENERAL_ANNUAL));

  // ── Phase 4: Email Verification ────────────────────────────────────────────
  e2e('verify thank-you page', verifyThankYouPage(getPage));
  e2e('wait for verification email', async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });
  e2e('verify email token → /agreement', () => navigateAndVerifyEmail(getPage, verifyUrl)());

  // ── Phase 5: Client signs agreement (AC-AMA-06) ────────────────────────────
  e2e('AC-AMA-06: client signs agreement', signAgreementMultipleSigners(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN));
  e2e('verify agreement-signed page',      verifyAgreementSignedPage(getPage));

  // ── Phase 6: Stripe Checkout → Paid ────────────────────────────────────────
  e2e('continue to checkout',     continueFromAgreementSigned(getPage));
  e2e('complete Stripe checkout', completeCheckoutAndPay(getPage));
  e2e('verify paid page',        verifyPaidPage(getPage));

  // ── Phase 7: Admin 1 signs (AC-AMA-07a, AC-AMA-14a) ───────────────────────
  e2e('AC-AMA-07a: admin1 receives signing email', async () => {
    const url = await waitForAdminSigningEmailByRecipient(ADMIN_EMAIL_1, testEmail)();
    adminSignUrl1 = url;
  });
  e2e('AC-AMA-14a: admin1 signs agreement', async () => {
    await signAsAdmin(getPage, adminSignUrl1)();
  });

  // ── Phase 8: Admin 2 signs (AC-AMA-07b, AC-AMA-14b) ───────────────────────
  e2e('AC-AMA-07b: admin2 receives signing email', async () => {
    const url = await waitForAdminSigningEmailByRecipient(ADMIN_EMAIL_2, testEmail)();
    adminSignUrl2 = url;
  });
  e2e('AC-AMA-14b: admin2 signs agreement', async () => {
    await signAsAdmin(getPage, adminSignUrl2)();
  });

  // ── Phase 9: Verify document completed + welcome email (after all admins sign) ──
  e2e('AC-AMA-08+12: verify completion email (all signed)', async () => {
    await verifyCompletionEmailForAdmin(ADMIN_EMAIL_1)();
  });
  e2e('verify welcome email', verifyWelcomeEmail(testEmail));

  // ── Phase 10: Export session snapshot for CRM audit ─────────────────────────
  e2e('export session snapshot for CRM validation', async () => {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { resolve } = await import('path');
    const page = getPage();
    const outputDir = resolve(process.cwd(), '.temp');
    mkdirSync(outputDir, { recursive: true });

    const sessionId = page.url().match(/\/sign-up\/([^/]+)\//)?.[1] ?? '';

    const sessionSnapshot = {
      session: { id: sessionId, createdAt: new Date().toISOString(), status: 'completed' },
      lead: {
        firstName: LEAD_USA_V4.firstName,
        lastName: LEAD_USA_V4.lastName,
        email: testEmail,
        companyName: LEAD_USA_V4.companyName,
        phoneCountry: LEAD_USA_V4.phoneCountry,
        phoneNumber: LEAD_USA_V4.phoneNumber,
        phoneFull: `+1${LEAD_USA_V4.phoneNumber}`,
        street: LEAD_USA_V4.street,
        addressLine2: LEAD_USA_V4.addressLine2 ?? '',
        city: LEAD_USA_V4.city,
        zip: LEAD_USA_V4.zip,
        countryISO3: LEAD_USA_V4.countryISO3,
        countryName: 'United States',
        stateISO: LEAD_USA_V4.stateISO,
        stateName: 'Florida',
        referralSource: LEAD_USA_V4.referralSource,
      },
      registration: {
        position: REG_USA_V4.position,
        companyType: REG_USA_V4.companyType,
        industry: REG_USA_V4.industry,
        companySize: REG_USA_V4.companySize,
        companyWebsite: REG_USA_V4.companyWebsite ?? (REG_USA_V4.companyWebsites?.[0] ?? ''),
        companyWebsites: REG_USA_V4.companyWebsites ?? [],
        companyFounded: REG_USA_V4.companyFounded,
        altPhoneCountry: REG_USA_V4.altPhoneCountry ?? '',
        altPhoneNumber: REG_USA_V4.altPhoneNumber ?? '',
        altPhoneFull: REG_USA_V4.altPhoneCountry === 'us' ? `+1${REG_USA_V4.altPhoneNumber}` : '',
        billingSameAsCompany: REG_USA_V4.billingSameAsCompany ?? true,
        billingStreet: REG_USA_V4.billingStreet ?? null,
        billingLine2: REG_USA_V4.billingLine2 ?? null,
        billingCity: REG_USA_V4.billingCity ?? null,
        billingZip: REG_USA_V4.billingZip ?? null,
        billingCountryISO3: REG_USA_V4.billingCountryISO3 ?? null,
        billingCountryName: null,
        billingStateISO: REG_USA_V4.billingStateISO ?? null,
        billingStateName: null,
        shippingSameAsBilling: true,
        shippingStreet: null,
        shippingLine2: null,
        shippingCity: null,
        shippingZip: null,
        shippingCountryISO3: null,
        shippingCountryName: null,
        shippingStateISO: null,
        shippingStateName: null,
        prosperityPlanner: REG_USA_V4.prosperityPlanner,
        hcaBooklets: REG_USA_V4.hcaBooklets,
        interests: REG_USA_V4.interests,
        emailNewsletters: REG_USA_V4.emailNewsletters,
        personalStreet: REG_USA_V4.personalStreet ?? '',
        personalLine2: REG_USA_V4.personalLine2 ?? '',
        personalCity: REG_USA_V4.personalCity ?? '',
        personalZip: REG_USA_V4.personalZip ?? '',
        personalCountryISO3: REG_USA_V4.personalCountryISO3 ?? '',
        personalCountryName: 'United States',
        personalStateISO: REG_USA_V4.personalStateISO ?? '',
        personalStateName: 'Florida',
        birthYear: REG_USA_V4.birthYear ?? '',
        education: REG_USA_V4.education,
        preferredLanguageISO: REG_USA_V4.preferredLanguageISO,
        preferredLanguageName: 'English',
        secondaryLanguageISO: REG_USA_V4.secondaryLanguageISO ?? '',
        secondaryLanguageName: 'Spanish',
        profilePhoto: REG_USA_V4.profilePhotoPath ? {
          originalName: 'profile_under_10mb_square_b.jpg',
          contentType: 'image/jpeg',
        } : null,
      },
      stripe: { plan: 'general', interval: 'year' },
      admins: { admin1: ADMIN_EMAIL_1, admin2: ADMIN_EMAIL_2 },
      metadata: { timestamp: new Date().toISOString(), testDataset: 'LEAD_USA_V4 + REG_USA_V4 (multi-admin)' },
    };

    writeFileSync(resolve(outputDir, 'session-snapshot.json'), JSON.stringify(sessionSnapshot, null, 2));
  });
});
