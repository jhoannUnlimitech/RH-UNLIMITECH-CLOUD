import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import {
  verifyStripeCheckoutData,
  completeStripeAndVerifyRedirect,
} from '../../factories/checkout.factory';
import { verifyPaymentPollingStates } from '../../factories/paid.factory';
import {
  LEAD_COLOMBIA,
  REG_COLOMBIA,
  CHECKOUT_VALIDATION_COLOMBIA,
} from '../../fixtures/test-data';

/**
 * Checkout & Post-Payment — Validation E2E Tests
 *
 * Validates: AC-16, AC-16b, AC-17, AC-18
 *
 * AC-16:  Stripe Checkout loads with pre-filled email and redirects to /paid after payment
 * AC-16b: Amount in Stripe Checkout matches the plan price from /plan
 * AC-17:  Payment is handled on Stripe's domain (checkout.stripe.com), not our app
 * AC-18:  PaidPage polling detects payment and transitions to "paid" state
 *
 * NOTE: These tests create real Stripe Checkout sessions in test mode.
 * Each run takes ~30-60s due to Stripe processing time.
 *
 * Pre-condition: Must complete lead + registration forms to reach plan selection.
 *
 * Run:
 *   npx playwright test checkout-validation
 *   npm run e2e -- checkout-validation
 */

// ── Helper: setup to reach plan selection page ──────────────────────────────

function setupToPlanSelection(flow: ReturnType<typeof createSerialFlow>) {
  flow.e2e('navigate to sign-up',      navigateToSignUp(flow.getPage));
  flow.e2e('fill lead form',           fillLeadForm(flow.getPage, LEAD_COLOMBIA));
  flow.e2e('submit lead form',         submitLeadForm(flow.getPage));
  flow.e2e('fill registration form',   fillRegistrationForm(flow.getPage, REG_COLOMBIA));
  flow.e2e('submit registration form', submitRegistrationForm(flow.getPage));
}

// ── AC-16, AC-16b, AC-17, AC-18 — Full checkout validation flow ─────────────

const checkoutFullFlow = createSerialFlow();

// Increase timeout — Stripe checkout + payment processing is slow
checkoutFullFlow.e2e.setTimeout(180_000);

checkoutFullFlow.e2e.describe.serial('AC-16 / AC-16b / AC-17 / AC-18 — Checkout & Payment Validation', () => {
  setupToPlanSelection(checkoutFullFlow);
  checkoutFullFlow.e2e('verify Stripe Checkout data (amount, email, domain)',
    verifyStripeCheckoutData(checkoutFullFlow.getPage, CHECKOUT_VALIDATION_COLOMBIA));
  checkoutFullFlow.e2e('complete Stripe payment and verify redirect to /paid',
    completeStripeAndVerifyRedirect(checkoutFullFlow.getPage));
  checkoutFullFlow.e2e('verify payment polling states on PaidPage',
    verifyPaymentPollingStates(checkoutFullFlow.getPage));
});
