/**
 * Stripe Connect Split Payment Validation
 *
 * Validates that the Stripe Connect Direct Charge implementation correctly
 * splits payments between platform (MasterTech, 30%) and connected account (WISE).
 *
 * Flow:
 *   1. Full enrollment (Form 1 → Form 2 → Plan → Email → Agreement → Checkout → Paid)
 *   2. Extract session data from DynamoDB (checkoutSessionId, customerId, subscriptionId)
 *   3. Query Stripe API on the connected account to validate split
 *
 * Pre-requisites:
 *   - Connect webhook configured in Stripe Dashboard
 *   - STRIPE_CONNECT_WEBHOOK_SECRET in cloud.stripe .env
 *   - Products/Prices migrated to connected account
 *   - STRIPE_SECRET_KEY available in env
 *   - STRIPE_CONNECTED_ACCOUNT_ID in env (or default acct_1ThCwARKKa3Cg9Qi)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test stripe-connect-split-payment --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base.js';
import { navigateToSignUpV4 } from '../../factories/navigation.factory.js';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory.js';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory.js';
import { selectPlanV4 } from '../../factories/plan-selection.factory.js';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory.js';
import { navigateAndVerifyEmail } from '../../factories/verify.factory.js';
import { signAgreementMultipleSigners } from '../../factories/agreement.factory.js';
import { verifyAgreementSignedPage, continueFromAgreementSigned } from '../../factories/agreement-signed.factory.js';
import { completeCheckoutAndPay } from '../../factories/checkout.factory.js';
import { verifyPaidPage } from '../../factories/paid.factory.js';
import {
  createStripeConnectContext,
  validateSessionOnConnected,
  validateCustomerOnConnected,
  validateSubscriptionOnConnected,
  validateApplicationFee,
  validateStripeFeeOnConnected,
  validateNetAmount,
  validatePlatformReceives30Percent,
  validateConnectedAccountExists,
  validateProductsOnConnected,
  logSplitPaymentSummary,
} from '../../factories/stripe-connect-validation.factory.js';
import { createStripeClient } from '../../fixtures/stripe-client.js';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
} from '../../fixtures/test-data.js';

// ─── Config ─────────────────────────────────────────────────────────────────

const testEmail = generateMailosaurEmail('sc');
const leadData = { ...LEAD_USA_V4, email: testEmail };
const regData = { ...REG_USA_V4, profilePhotoPath: undefined };

const { e2e, getPage } = createSerialFlow();
const scCtx = createStripeConnectContext();

e2e.setTimeout(300_000); // 5 min for full flow + Stripe validation

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('Stripe Connect Split Payment Validation', () => {

  // ── Initialize Stripe client ──────────────────────────────────────────────

  e2e('initialize Stripe Connect client', async () => {
    scCtx.stripe = createStripeClient();
    console.log(`  ✅ Stripe client initialized (connected: ${scCtx.stripe.getConnectedAccountId()})`);
  });

  // ── Grupo C: Configuration prerequisites ──────────────────────────────────

  e2e('AC-SC-14: Connected account exists and is valid',
    validateConnectedAccountExists(scCtx));

  e2e('AC-SC-15: Products/Prices exist on connected account',
    validateProductsOnConnected(scCtx));

  // ── Grupo A: Full enrollment flow ─────────────────────────────────────────

  e2e('navigate to form 1', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form', fillLeadForm(getPage, leadData));
  e2e('submit lead form → /details', submitLeadForm(getPage));
  e2e('fill registration form', fillRegistrationForm(getPage, regData));
  e2e('submit registration → /plan', submitRegistrationForm(getPage));
  e2e('select plan (General Annual)', selectPlanV4(getPage, PLAN_GENERAL_ANNUAL));
  e2e('verify thank-you page', verifyThankYouPage(getPage));

  let verifyUrl = '';
  e2e('wait for verification email', async () => {
    verifyUrl = await waitForEmailWithResend(getPage, testEmail)();
  });
  e2e('verify email → /agreement', () => navigateAndVerifyEmail(getPage, verifyUrl)());

  e2e('sign agreement', async () => {
    const { ZOHO_SIGN_LABELS_EN } = await import('../../fixtures/test-data.js');
    await signAgreementMultipleSigners(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN)();
  });
  e2e('verify agreement-signed page', verifyAgreementSignedPage(getPage));
  e2e('continue to checkout', continueFromAgreementSigned(getPage));

  // ── AC-SC-01/02: Checkout + Paid ──────────────────────────────────────────

  e2e('AC-SC-01: complete Stripe checkout', completeCheckoutAndPay(getPage));
  e2e('AC-SC-02: verify paid page loads', verifyPaidPage(getPage));

  // ── Extract session data for Stripe validation ────────────────────────────

  e2e('extract Stripe session data from DynamoDB', async () => {
    const { extractStripeDataFromSession } = await import('../../factories/stripe-connect-validation.factory.js');
    await extractStripeDataFromSession(scCtx, getPage)();
  });

  // ── Grupo B: Split payment validation (Stripe API) ────────────────────────

  e2e('AC-SC-06: Checkout Session on connected account',
    validateSessionOnConnected(scCtx));
  e2e('AC-SC-07: Customer on connected account',
    validateCustomerOnConnected(scCtx));
  e2e('AC-SC-08: Subscription on connected account (fee_percent=30)',
    validateSubscriptionOnConnected(scCtx));
  e2e('AC-SC-09: application_fee = 30% of charge',
    validateApplicationFee(scCtx));
  e2e('AC-SC-10: Stripe fee absorbed by connected account',
    validateStripeFeeOnConnected(scCtx));
  e2e('AC-SC-11: Net amount = total - fee - stripe_fee',
    validateNetAmount(scCtx));
  e2e('AC-SC-12: Platform receives exactly 30%',
    validatePlatformReceives30Percent(scCtx));

  // ── Summary ───────────────────────────────────────────────────────────────

  e2e('summary — split payment validated',
    logSplitPaymentSummary(scCtx));
});
