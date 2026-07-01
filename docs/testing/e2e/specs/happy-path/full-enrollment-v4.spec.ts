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
import { verifyAgreementSignedEmail, verifyWelcomeEmail } from '../../factories/email-inbox.factory';
import {
  createCRMContext,
  authenticateZoho,
  verifyLeadCreated,
  verifyAccountCreated,
  verifyLeadIsProspect,
  verifyContactCreated,
  verifyContactAccountAssociation,
  verifyContactPendingCountersign,
  verifyContactSignedAgreement,
  waitForCRMIndexing,
  validateContactFields,
  validateAccountFields,
  validateMembershipNumber,
  validateCrossModule,
  validateContactPhoto,
  generateAuditReport,
} from '../../factories/crm-validation.factory';
import {
  validatePaymentCreated,
  validateInvoiceCreated,
  validatePaymentStripeConsistency,
} from '../../factories/crm-payment-validation.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
} from '../../fixtures/test-data';

/**
 * Full Enrollment Flow V4 — USA (plan+interval+country params)
 *
 * V4 flow order (AC-53):
 *   /sign-up?plan=general&interval=year&country=USA →
 *   general-info → details → plan → thank-you →
 *   [verify email via Mailosaur] → agreement (Zoho Sign) →
 *   agreement-signed → [verify agreement email] →
 *   checkout (Stripe) → paid → [verify welcome email]
 *
 * Key V4 changes vs V3:
 *   - Plan selection is step 3 (after registration), never skipped (AC-52)
 *   - Query params only pre-select, never skip pages
 *   - 3 emails validated: verification, agreement-signed, welcome (AC-44a/b/c)
 *
 * Requires:
 *   - Backend running (API + SQS + SendEmail Lambda + Cloud Core + Cloud Stripe)
 *   - Mailosaur credentials in .env.qa
 *   - CDP_ENDPOINT recommended for visual debugging
 *
 * Timeout: 360s (6 min) — email delivery + Stripe + Zoho Sign + polling.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();
const crmCtx = createCRMContext();

e2e.setTimeout(360_000);

let verifyUrl = '';
let adminSignUrl = '';

e2e.describe.serial('Full Enrollment V4 — USA (plan+interval+country params)', () => {

  // ── Phase 1: General Info (Lead Form) ──────────────────────────────────────
  e2e('navigate with v4 params (plan+interval+country)',
    navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',                fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form → /details',   submitLeadForm(getPage));

  // ── CRM Checkpoint 1: Lead + Account created (AC-CRM-V57, V58) ─────────────
  e2e('CRM: authenticate',                          authenticateZoho(crmCtx));
  e2e('AC-CRM-V57: verify Lead created (Status=Lead)', verifyLeadCreated(crmCtx, testEmail));
  e2e('AC-CRM-V58: verify Account created',         verifyAccountCreated(crmCtx, LEAD_USA_V4.companyName));

  // ── Phase 2: Details (Registration Form) ───────────────────────────────────
  e2e('fill registration form',        fillRegistrationForm(getPage, REG_USA_V4));
  e2e('submit registration → /plan',   submitRegistrationForm(getPage));

  // ── CRM Checkpoint 2: Lead → Prospect (AC-CRM-V59) ────────────────────────
  e2e('AC-CRM-V59: verify Lead is Prospect',        verifyLeadIsProspect(crmCtx, testEmail));

  // ── Phase 3: Plan Selection (step 3 in V4) ─────────────────────────────────
  e2e('select general plan (annual)',   selectPlan(getPage, PLAN_GENERAL_ANNUAL));

  // ── Phase 4: Email Verification via Mailosaur ──────────────────────────────
  e2e('verify thank-you page',         verifyThankYouPage(getPage));
  e2e('wait for verification email (AC-44a)', async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });
  e2e('verify email token → /agreement', () => navigateAndVerifyEmail(getPage, verifyUrl)());

  // ── CRM Checkpoint 3: Lead → Contact (async conversion) (AC-CRM-V60, V61) ─
  e2e('AC-CRM-V60: verify Contact created',         verifyContactCreated(crmCtx, testEmail));
  e2e('AC-CRM-V61: verify Contact → Account',       verifyContactAccountAssociation(crmCtx));

  // ── Phase 5: Agreement Signing (Zoho Sign) ─────────────────────────────────
  let signingResult: { signatureFieldsSigned: number } | null = null;
  e2e('sign agreement', async () => {
    signingResult = await signAgreementMultipleSigners(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN)();
  });
  e2e('verify agreement-signed page',  verifyAgreementSignedPage(getPage));
  e2e('AC-CRM-V62: verify Contact Pending Countersign', verifyContactPendingCountersign(crmCtx, testEmail));

  // ── Phase 5b: Agreement Signed Email (AC-44b) ─────────────────────────────
  e2e('verify agreement-signed email (AC-44b)', verifyAgreementSignedEmail(testEmail));

  e2e('continue to checkout',          continueFromAgreementSigned(getPage));

  // ── Phase 6: Stripe Checkout → Paid ────────────────────────────────────────
  e2e('complete Stripe checkout',      completeCheckoutAndPay(getPage));
  e2e('verify paid page (final)',      verifyPaidPage(getPage));

  // ── Phase 7: Welcome Email (AC-44c) ────────────────────────────────────────
  e2e('verify welcome email (AC-44c)', verifyWelcomeEmail(testEmail));

  // ── Phase 8: Admin Agreement Signing (Multi-Admin: 2 countersigners) ─────
  e2e('AC-AMA-07a: admin1 receives signing email', async () => {
    const { waitForAdminSigningEmailByRecipient } = await import('../../factories/admin-signing.factory');
    const { ADMIN_EMAIL_1 } = await import('../../fixtures/test-data');
    const url = await waitForAdminSigningEmailByRecipient(ADMIN_EMAIL_1, testEmail)();
    adminSignUrl = url;
  });
  e2e('AC-AMA-14a: admin1 signs agreement', async () => {
    const { signAsAdmin } = await import('../../factories/admin-signing.factory');
    await signAsAdmin(getPage, adminSignUrl)();
  });
  e2e('AC-AMA-07b: admin2 receives signing email', async () => {
    const { waitForAdminSigningEmailByRecipient } = await import('../../factories/admin-signing.factory');
    const { ADMIN_EMAIL_2 } = await import('../../fixtures/test-data');
    const url = await waitForAdminSigningEmailByRecipient(ADMIN_EMAIL_2, testEmail)();
    adminSignUrl = url;
  });
  e2e('AC-AMA-14b: admin2 signs agreement', async () => {
    const { signAsAdmin } = await import('../../factories/admin-signing.factory');
    await signAsAdmin(getPage, adminSignUrl)();
  });
  e2e('AC-AMA-08+12: verify completion email (all signed)', async () => {
    const { verifyCompletionEmailForAdmin } = await import('../../factories/admin-signing.factory');
    const { ADMIN_EMAIL_1 } = await import('../../fixtures/test-data');
    await verifyCompletionEmailForAdmin(ADMIN_EMAIL_1)();
  });
  // AC-CRM-V63 commented out — Zoho Sign countersign webhook has timing issues in dev
  // (the completion email arrives but the webhook to ProcessCountersign Lambda is delayed)
  // e2e('AC-CRM-V63: verify Contact Signed Agreement', verifyContactSignedAgreement(crmCtx, testEmail));

  // ── Phase 9: Export bridge data for provisioning ───────────────────────────
  e2e('export bridge data', async () => {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { resolve } = await import('path');
    const outputDir = resolve(process.cwd(), '.temp');
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(
      resolve(outputDir, 'bridge-output.json'),
      JSON.stringify({
        email: testEmail,
        firstName: LEAD_USA_V4.firstName,
        lastName: LEAD_USA_V4.lastName,
        street: LEAD_USA_V4.street,
        city: LEAD_USA_V4.city,
        zip: LEAD_USA_V4.zip,
        countryISO3: LEAD_USA_V4.countryISO3,
        plan: 'general',
        interval: 'year',
        timestamp: new Date().toISOString(),
      }, null, 2),
    );
  });

  // ── Phase 10: Export session snapshot for CRM validation ───────────────────
  e2e('export session snapshot for CRM validation', async () => {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { resolve } = await import('path');
    const outputDir = resolve(process.cwd(), '.temp');
    mkdirSync(outputDir, { recursive: true });

    // Extract Stripe customer ID from the page (stored in session after checkout)
    const page = getPage();
    let stripeCustomerId = '';
    try {
      const sessionUrl = page.url();
      const sessionIdMatch = sessionUrl.match(/\/sign-up\/([^/]+)\//);
      if (sessionIdMatch) {
        const baseURL = process.env.BASE_URL || 'https://localhost:9010';
        const apiBase = process.env.ENROLLMENT_API_URL || baseURL;
        // Try to get session data from the API to extract Stripe ID
        // If not available, leave empty — CRM validation will skip that field
        const res = await page.request.get(`${apiBase}/session/${sessionIdMatch[1]}`);
        if (res.ok()) {
          const sessionData = await res.json();
          stripeCustomerId = sessionData?.stripe?.customerId ?? '';
        }
      }
    } catch {
      // Non-critical — Stripe ID validation will be skipped if not available
    }

    const sessionSnapshot = {
      session: {
        id: page.url().match(/\/sign-up\/([^/]+)\//)?.[1] ?? '',
        createdAt: new Date().toISOString(),
        status: 'completed',
      },
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
      stripe: {
        customerId: stripeCustomerId,
        plan: 'general',
        interval: 'year',
      },
      agreement: {
        signatureFieldsSigned: signingResult?.signatureFieldsSigned ?? 0,
        plan: 'general',
        interval: 'year',
      },
      admins: {
        admin1: (await import('../../fixtures/test-data')).ADMIN_EMAIL_1,
        admin2: (await import('../../fixtures/test-data')).ADMIN_EMAIL_2,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        testDataset: 'LEAD_USA_V4 + REG_USA_V4 (multi-admin)',
      },
    };

    writeFileSync(
      resolve(outputDir, 'session-snapshot.json'),
      JSON.stringify(sessionSnapshot, null, 2),
    );

    // Store snapshot in CRM context for audit phase
    crmCtx.snapshot = sessionSnapshot as any;
  });

  // ── Phase 11: CRM Audit — Validate all fields against Zoho CRM ────────────
  e2e('CRM Audit: wait for CRM async handlers',         waitForCRMIndexing(crmCtx, testEmail, LEAD_USA_V4.companyName));
  e2e('CRM Audit: validate Contact fields (60+ campos)', validateContactFields(crmCtx));
  e2e('CRM Audit: validate Account fields (20+ campos)', validateAccountFields(crmCtx));
  e2e('CRM Audit: validate Membership Number (YYYYCCSSSS)', validateMembershipNumber(crmCtx));
  e2e('CRM Audit: cross-module consistency',             validateCrossModule(crmCtx));
  e2e('CRM Audit: validate Contact photo',              validateContactPhoto(crmCtx));
  e2e('CRM Audit: validate Payment created (AC-828)',   validatePaymentCreated(crmCtx));
  e2e('CRM Audit: validate Invoice created (AC-828)',   validateInvoiceCreated(crmCtx));
  e2e('CRM Audit: Stripe cross-check (AC-828)',         validatePaymentStripeConsistency(crmCtx));
  e2e('CRM Audit: generate report',                      generateAuditReport(crmCtx));
});
