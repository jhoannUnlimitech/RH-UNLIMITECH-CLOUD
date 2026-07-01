import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import {
  fillLeadForm,
  submitLeadForm,
  verifyRequiredFieldLabels,
  submitEmptyLeadForm,
  submitInvalidEmail,
  verifyCountryDropdownLoaded,
  verifyCountryClearsState,
  verifyPhonePrefix,
} from '../../factories/lead-form.factory';
import {
  reloadAndFillRegistrationForm,
  submitRegistrationForm,
  verifyDropdownsLoaded,
  verifyCompanyFoundedValidation,
  verifyShippingAddressToggle,
  verifyProsperityPlannerRadio,
  verifyHcaBookletsRadio,
  verifyInterestsNoneExclusivity,
  verifyNewslettersNoneExclusivity,
  verifyBirthYearValidation,
  verifyAlternatePhone,
  verifyPersonalAddressCascading,
  submitWithMissingRequired,
} from '../../factories/registration-form.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import {
  navigateAndVerifyEmail,
  verifyTokenAlreadyUsed,
  verifyInvalidSessionRedirects,
  verifyTokenAfterCompletion,
} from '../../factories/verify.factory';
import { signAgreement, verifyAgreementReloadPersistence } from '../../factories/agreement.factory';
import { continueFromAgreementSigned } from '../../factories/agreement-signed.factory';
import { completeCheckoutAndPay } from '../../factories/checkout.factory';
import { verifyPaidPage } from '../../factories/paid.factory';
import {
  verifyVerificationEmailContent,
  verifyAgreementSignedEmail,
  verifyWelcomeEmail,
} from '../../factories/email-inbox.factory';
import { verifyNoPersonalDataInStorage } from '../../factories/gdpr.factory';
import {
  verifyPlanPricesDisplayed,
  verifyIndividualOnlyAnnual,
  verifyPlanCountPerInterval,
  verifyIntervalLabels,
  selectPlan,
} from '../../factories/plan-selection.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  LEAD_VALIDATION_COLOMBIA,
  REG_VALIDATION_COLOMBIA,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
  ZOHO_SIGN_LABELS_EN,
} from '../../fixtures/test-data';

/**
 * Full Validation V4 — All validations in a single serial flow (1 session).
 *
 * V4 flow order (AC-53):
 *   general-info → details → plan → thank-you → verify → agreement →
 *   agreement-signed → checkout → paid
 *
 * Executes ALL validation tests using ONE browser session:
 *
 *   1. Form 1 validations (AC-04 to AC-08)
 *   2. Happy path Form 1 → /details
 *   3. GDPR validation (AC-51)
 *   4. Form 2 validations (AC-09 to AC-45)
 *   5. Happy path Form 2 → /plan
 *   6. Plan Selection validations (AC-15, AC-15b, AC-15d, AC-63)
 *   7. Select plan → /thank-you
 *   8. Email verification validations (AC-44a, AC-19a/c/d/e)
 *   9. Agreement signing → /agreement-signed
 *   10. Agreement-signed email validation (AC-44b)
 *   11. Checkout → /paid
 *   12. Welcome email validation (AC-44c)
 *   13. Post-completion token reuse (AC-19c)
 *   14. Invalid session verify (AC-19d)
 *
 * Timeout: 480s (8 min) — forms + email + Zoho Sign + Stripe.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test full-validation
 */

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(480_000);

let verifyUrl = '';

e2e.describe.serial('Full Validation V4 — USA', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP — Navigate to /general-info (V4: first step, no plan selection)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('navigate to sign-up (v4)', navigateToSignUpV4(getPage, PARAMS_V4_FULL));

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM 1: General Info — Validations
  // V4: This is the first step (no plan selection before it)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-04a: required field labels visible',       verifyRequiredFieldLabels(getPage));
  e2e('AC-06: country dropdown loaded',              verifyCountryDropdownLoaded(getPage));
  e2e('AC-08: phone prefix changes with country',    verifyPhonePrefix(getPage, LEAD_VALIDATION_COLOMBIA));
  e2e('AC-07: changing country clears state',        verifyCountryClearsState(getPage, LEAD_VALIDATION_COLOMBIA));

  e2e('AC-04b: empty submit shows errors',           async () => {
    const page = getPage();
    // V4: reload without params to test truly empty form (country won't be pre-filled)
    const currentUrl = page.url();
    const baseUrl = currentUrl.replace(/\?.*$/, ''); // strip query params
    await page.goto(baseUrl);
    await page.waitForSelector('[data-test-context="lead-form"][data-test-state="ready"]', { timeout: 15_000 });
    await submitEmptyLeadForm(getPage)();
  });
  e2e('AC-05: invalid email blocks submit',          submitInvalidEmail(getPage, LEAD_VALIDATION_COLOMBIA));

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM 1: Happy Path — Fill + Submit (advance to /details)
  // V4: No need to re-select plan after reload (plan selection is step 3)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('reload + fill lead form', async () => {
    const page = getPage();
    await page.reload();
    await page.waitForSelector('[data-test-context="lead-form"][data-test-state="ready"]', { timeout: 15_000 });
    await fillLeadForm(getPage, LEAD_MAILOSAUR)();
  });
  e2e('submit lead form → /details',                 submitLeadForm(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // GDPR — AC-51: No personal data in browser storage
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-51: no personal data in localStorage/sessionStorage',
    verifyNoPersonalDataInStorage(getPage, {
      email: testEmail,
      firstName: LEAD_MAILOSAUR.firstName,
      lastName: LEAD_MAILOSAUR.lastName,
      phone: LEAD_MAILOSAUR.phoneNumber,
    }));

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM 2: Details — Validations
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-09: all dropdowns have options',           verifyDropdownsLoaded(getPage));
  e2e('AC-10: company founded year validation',      verifyCompanyFoundedValidation(getPage, REG_VALIDATION_COLOMBIA));
  e2e('AC-11: shipping address toggle + cascading',  verifyShippingAddressToggle(getPage));
  e2e('AC-12: prosperity planner radio exclusivity', verifyProsperityPlannerRadio(getPage));
  e2e('AC-12: HCA booklets radio exclusivity',       verifyHcaBookletsRadio(getPage));
  e2e('AC-13: interests none exclusivity',           verifyInterestsNoneExclusivity(getPage));
  e2e('AC-13: newsletters none exclusivity',         verifyNewslettersNoneExclusivity(getPage));
  e2e('AC-14: birth year validation',                verifyBirthYearValidation(getPage, REG_VALIDATION_COLOMBIA));
  e2e('alternate phone prefix',                      verifyAlternatePhone(getPage));
  e2e('personal address cascading',                  verifyPersonalAddressCascading(getPage));
  e2e('AC-45: missing required blocks submit',       async () => {
    const page = getPage();
    await page.reload();
    await page.waitForSelector('[data-test-context="registration-form"][data-test-state="ready"]', { timeout: 15_000 });
    await submitWithMissingRequired(getPage, REG_USA_V4)();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM 2: Happy Path — Fill + Submit (advance to /plan)
  // V4: Registration submit navigates to /plan (not /thank-you)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('reload + fill registration form',             reloadAndFillRegistrationForm(getPage, REG_USA_V4));
  e2e('submit registration form → /plan',            submitRegistrationForm(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAN SELECTION: Validations (V4: step 3, after registration)
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-15: all plans show prices',                verifyPlanPricesDisplayed(getPage));
  e2e('AC-15b: individual only annual',              async () => {
    const page = getPage();
    await page.reload();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    await verifyIndividualOnlyAnnual(getPage)();
  });
  e2e('AC-15b: 5 annual, 4 monthly',                 verifyPlanCountPerInterval(getPage));
  e2e('AC-15d: interval labels /year /month',         async () => {
    const page = getPage();
    await page.reload();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    await verifyIntervalLabels(getPage)();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAN SELECTION: Select plan → /thank-you
  // V4: Plan selection submit sends verification email + navigates to thank-you
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('select general plan (annual)',                selectPlan(getPage, PLAN_GENERAL_ANNUAL));

  // ═══════════════════════════════════════════════════════════════════════════
  // EMAIL VERIFICATION — AC-44a, AC-19a, AC-19e
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('verify thank-you page',                       verifyThankYouPage(getPage));

  e2e('AC-44a: verification email content',          verifyVerificationEmailContent(testEmail));

  e2e('capture verification link',                   async () => {
    const link = await waitForEmailWithResend(getPage, testEmail)();
    verifyUrl = link;
  });

  e2e('verify email token → /agreement',             () => navigateAndVerifyEmail(getPage, verifyUrl)());

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
  // AGREEMENT — AC-20d: Reload persistence + signing
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-20d: reload agreement page → iframe reloads',
    verifyAgreementReloadPersistence(getPage));

  e2e('sign agreement → /agreement-signed',          signAgreement(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN));

  // ═══════════════════════════════════════════════════════════════════════════
  // AGREEMENT SIGNED EMAIL — AC-44b
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-44b: agreement-signed email content',      verifyAgreementSignedEmail(testEmail));

  e2e('continue to checkout',                        continueFromAgreementSigned(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECKOUT → PAID
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('complete Stripe checkout',                    completeCheckoutAndPay(getPage));
  e2e('verify payment (final)',                      verifyPaidPage(getPage));

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME EMAIL — AC-44c
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-44c: welcome email arrives after payment', verifyWelcomeEmail(testEmail));

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-COMPLETION VALIDATIONS — AC-19c, AC-19d
  // ═══════════════════════════════════════════════════════════════════════════

  e2e('AC-19c: reuse token after completion → already-verified or redirect',
    () => verifyTokenAfterCompletion(getPage, verifyUrl)());

  e2e('AC-19d: invalid session verify → error or redirect',
    verifyInvalidSessionRedirects(getPage));
});
