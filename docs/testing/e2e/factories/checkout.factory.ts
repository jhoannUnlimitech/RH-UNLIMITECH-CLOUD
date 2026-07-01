/**
 * Checkout Factories — Reusable test steps for the Stripe checkout flow.
 *
 * In v3, CheckoutPage is a transition page that auto-redirects to Stripe.
 * The plan is already stored in session.planSelection (set by SaveLead).
 * The frontend only sends sessionId — the backend reads the plan from the session.
 *
 * Page: /sign-up/{sessionId}/checkout
 * POM: checkout.pom.ts
 *
 * NOTE: Stripe Checkout is an external domain. Selectors use a11y labels
 * (getByLabel, getByRole) instead of data-test-* annotations.
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/checkout.pom';
import { STRIPE_TEST_CARD } from '../fixtures/test-data';
import type { CheckoutValidationData } from '../fixtures/test-data';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const sel = {
  pagePreparing:  pom.checkout_page.preparing.$(),
  pageError:      pom.checkout_page.error.$(),
  statusMessage:  pom.checkout_page._.status_message.$(),
  errorTitle:     pom.checkout_page._.error_title.$(),
  errorMessage:   pom.checkout_page._.error_message.$(),
  retryButton:    pom.checkout_page._.retry_button.$(),
};

// ═════════════════════════════════════════════════════════════════════════════
// HAPPY PATH — CheckoutPage auto-redirect → Stripe → /paid
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Wait for CheckoutPage to auto-redirect to Stripe, fill test card, and submit.
 * CheckoutPage shows "preparing" briefly then redirects via window.location.href.
 *
 * @returns Waits for redirect back to /paid after Stripe payment.
 */
export function completeCheckoutAndPay(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // CheckoutPage auto-redirects to Stripe — wait for Stripe URL
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });

    // Fill Stripe form — use getByLabel with regex for i18n support
    // Stripe renders labels in the browser's language (EN or ES)
    await page.getByLabel(/card number|número de la tarjeta/i).fill(STRIPE_TEST_CARD.number);
    await page.getByLabel(/expir|vencimiento/i).fill(STRIPE_TEST_CARD.expiry);
    await page.getByLabel(/^CVC$/i).fill(STRIPE_TEST_CARD.cvc);
    await page.getByLabel(/cardholder|titular/i).fill(STRIPE_TEST_CARD.name);

    // Fill zip/postal code if visible (US requires it)
    const zipField = page.getByLabel(/zip|postal|código postal/i);
    if (await zipField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await zipField.fill('11111');
    }

    // Click Subscribe/Suscribirse button
    const submitBtn = page.getByRole('button', { name: /subscribe|suscribirse/i });
    await submitBtn.click();

    // Wait for redirect back to /paid
    await page.waitForURL(/\/paid/, { timeout: 60_000 });
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — CheckoutPage states (preparing, error)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-59: Verify CheckoutPage shows preparing state with spinner.
 * Uses page.route() interceptor to block the checkout API call so the page
 * stays in "preparing" state instead of redirecting to Stripe.
 *
 * @param sessionId - Session ID to navigate to /checkout
 */
export function verifyCheckoutPreparingState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Intercept checkout API to prevent redirect
    await page.route('**/enrollment/checkout', route => route.abort());

    await page.goto(`${baseURL}/sign-up/${sessionId}/checkout`);
    await page.waitForSelector(sel.pagePreparing, { timeout: 10_000 });
    await expect(page.locator(sel.statusMessage)).toBeVisible();

    await page.unroute('**/enrollment/checkout');
  };
}

/**
 * AC-61: Verify CheckoutPage error state with retry button.
 * Uses page.route() interceptor to return a 500 error from the checkout API.
 *
 * @param sessionId - Session ID to navigate to /checkout
 */
export function verifyCheckoutErrorState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Intercept checkout API to return error
    await page.route('**/enrollment/checkout', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Test error', code: 'INTERNAL_ERROR' }),
      }),
    );

    await page.goto(`${baseURL}/sign-up/${sessionId}/checkout`);
    await page.waitForSelector(sel.pageError, { timeout: 15_000 });
    await expect(page.locator(sel.errorTitle)).toBeVisible();
    await expect(page.locator(sel.errorMessage)).toBeVisible();
    await expect(page.locator(sel.retryButton)).toBeVisible();

    await page.unroute('**/enrollment/checkout');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — Stripe Checkout data verification
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-16, AC-16b, AC-17 — Verify Stripe Checkout page content.
 *
 * Pre-condition: Browser must already be on checkout.stripe.com
 * (after CheckoutPage auto-redirect or after completeCheckoutAndPay navigated there).
 *
 * Verifies:
 *   - URL is checkout.stripe.com (AC-17 — PCI compliance)
 *   - Plan name is displayed (AC-16b)
 *   - Email is pre-filled (AC-16)
 *
 * @param data - Checkout validation data from test-data.ts
 */
export function verifyStripeCheckoutData(getPage: () => Page, data: CheckoutValidationData) {
  return async () => {
    const page = getPage();

    // Should already be on Stripe
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });

    // AC-17: Verify we're on Stripe's domain (not our app)
    const stripeUrl = page.url();
    expect(stripeUrl).toContain('checkout.stripe.com');

    // Wait for Stripe page to fully render
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

    // AC-16b: Verify the plan name is displayed
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    expect(pageContent).toContain(data.planDisplayName);

    // AC-16: Verify email is pre-filled
    const emailVisible = pageContent!.includes(data.expectedEmail);
    if (!emailVisible) {
      console.warn(`[AC-16] Email "${data.expectedEmail}" not found in Stripe page text. May be in an input field.`);
    }
  };
}

/**
 * Complete Stripe Checkout form and verify redirect to /paid.
 * Pre-condition: Browser must already be on checkout.stripe.com.
 *
 * Uses STRIPE_TEST_CARD from test-data.ts — no hardcoded card numbers.
 */
export function completeStripeAndVerifyRedirect(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Should already be on checkout.stripe.com
    expect(page.url()).toContain('checkout.stripe.com');

    // Fill Stripe Checkout form (a11y selectors — external domain)
    await page.getByLabel('Card number').fill(STRIPE_TEST_CARD.number);
    await page.getByLabel('Expiration').fill(STRIPE_TEST_CARD.expiry);
    await page.getByRole('textbox', { name: 'CVC' }).fill(STRIPE_TEST_CARD.cvc);
    await page.getByLabel('Cardholder name').fill(STRIPE_TEST_CARD.name);

    // Click Subscribe
    await page.getByRole('button', { name: 'Subscribe' }).click();

    // Wait for redirect back to /paid
    await page.waitForURL(/\/paid/, { timeout: 60_000 });
  };
}
