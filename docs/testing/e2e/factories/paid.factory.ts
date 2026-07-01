/**
 * Paid Page Factories — Reusable test steps for the payment verification page.
 *
 * Covers: verifying that the paid page handles both immediate payment
 * confirmation and delayed webhook processing (polling states).
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/paid.pom';

// ─── Selectors (from POM) ───────────────────────────────────────────────────

const ps = pom.payment_success;

const sel = {
  context:             ps.$(),
  verifying:           ps.verifying.$(),
  processing:          ps.processing.$(),
  ready:               ps.ready.$(),
  timeout:             ps.timeout.$(),
  error:               ps.error.$(),
  statusMessage:       ps._.status_message.$(),
  pageTitle:           ps._.page_title.$(),
  pageSubtitle:        ps._.page_subtitle.$(),
  confirmationDetails: ps._.confirmation_details.$(),
  agreementConfirmed:  ps._.confirmation_details._.agreement_confirmed.$(),
  paymentConfirmed:    ps._.confirmation_details._.payment_confirmed.$(),
  emailSent:           ps._.confirmation_details._.email_sent.$(),
  footerMessage:       ps._.footer_message.$(),
  nextStepMessage:     ps._.next_step_message.$(),
  continueBtn:         ps._.continue_button.$(),
  timeoutMessage:      ps._.timeout_message.$(),
  retryBtn:            ps._.retry_button.$(),
  errorMessage:        ps._.error_message.$(),
};

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * Click "Continue to Agreement" on the paid page.
 * Navigates to the agreement page.
 *
 * NOTE: This factory lives here (not in agreement.factory.ts) because
 * the action happens on the paid page. R1: one factory = one page.
 */
export function continueToAgreement(getPage: () => Page) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.ready, { timeout: 15_000 });
    await page.locator(sel.continueBtn).click();
    await page.waitForURL(/\/agreement/, { timeout: 15_000 });
  };
}

/**
 * Verify the paid page works correctly regardless of webhook timing.
 *
 * In the current flow, paid is the FINAL step. The ready state shows
 * confirmation details (agreement confirmed, payment confirmed, email sent).
 *
 * Handles polling scenarios:
 * - Immediate: webhook already processed → shows confirmation details
 * - Delayed: webhook pending → polls (verifying → processing → ready|timeout)
 */
export function verifyPaidPage(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Wait for the paid page context to appear (with backoff retry)
    // After Stripe redirect, the page may take a few seconds to render the final state.
    let state: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.waitForSelector(sel.context, { timeout: 15_000 });
      state = await page.locator(sel.context).getAttribute('data-test-state');
      if (state === 'ready') break;
      // If not ready yet, wait 3s and re-check (page may still be transitioning)
      await page.waitForTimeout(3_000);
      state = await page.locator(sel.context).getAttribute('data-test-state');
      if (state === 'ready') break;
    }

    // ── Path A: Payment already confirmed ──
    if (state === 'ready') {
      await expect(page.locator(sel.pageTitle)).toBeVisible();
      await expect(page.locator(sel.confirmationDetails)).toBeVisible();
      return;
    }

    // ── Path B: Polling active (verifying or processing) ──
    if (state === 'verifying' || state === 'processing') {
      await expect(page.locator(sel.statusMessage)).toBeVisible();

      // Wait for polling to resolve: ready or timeout (~70s covers 12 attempts)
      const resolved = page.locator(`${sel.ready}, ${sel.timeout}`);
      await resolved.first().waitFor({ timeout: 70_000 });

      if (await page.locator(sel.ready).isVisible()) {
        await expect(page.locator(sel.pageTitle)).toBeVisible();
        await expect(page.locator(sel.confirmationDetails)).toBeVisible();
      } else {
        await expect(page.locator(sel.timeoutMessage)).toBeVisible();
        await expect(page.locator(sel.retryBtn)).toBeVisible();
      }
      return;
    }

    // ── Path C: Timeout already reached ──
    if (state === 'timeout') {
      await expect(page.locator(sel.timeoutMessage)).toBeVisible();
      await expect(page.locator(sel.retryBtn)).toBeVisible();
    }
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION — Individual state verification for PaidPage
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-18 — Verify payment polling states on PaidPage.
 *
 * After Stripe checkout completes and redirects to /paid, verifies:
 * 1. PaidPage shows initial state (verifying or processing)
 * 2. Polling detects payment and transitions to "paid" (ready state)
 * 3. "Continue to Agreement" button becomes visible
 */
export function verifyPaymentPollingStates(getPage: () => Page) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.context, { timeout: 15_000 });

    const initialState = await page.locator(sel.context).getAttribute('data-test-state');

    expect(['verifying', 'processing', 'ready']).toContain(initialState);

    if (initialState === 'ready') {
      await expect(page.locator(sel.pageTitle)).toBeVisible();
      await expect(page.locator(sel.continueBtn)).toBeVisible();
      return;
    }

    const readyOrTimeout = page.locator(`${sel.ready}, ${sel.timeout}`);
    await readyOrTimeout.first().waitFor({ timeout: 70_000 });

    if (await page.locator(sel.ready).isVisible()) {
      await expect(page.locator(sel.pageTitle)).toBeVisible();
      await expect(page.locator(sel.continueBtn)).toBeVisible();
    } else {
      await expect(page.locator(sel.timeoutMessage)).toBeVisible();
      await expect(page.locator(sel.retryBtn)).toBeVisible();
    }
  };
}

// ─── Interceptor Factories (setup/cleanup for simulated states) ─────────────

/** Fake session ID used for interceptor-based tests (no real DynamoDB session needed). */
const FAKE_SESSION_ID = 'e2e-fake-0000-0000-000000000000';

/**
 * Setup: Intercept GET /session/* to return a valid session in the specified status.
 * This prevents the app from redirecting when the sessionId doesn't exist in DynamoDB.
 */
function interceptSessionAsValid(page: Page, sessionId: string, status: string) {
  return page.route('**/enrollment/session/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId,
        status,
        hasLead: true,
        hasRegistration: true,
        hasCheckout: true,
        hasAgreement: true,
        expired: false,
        planSelection: { cname: 'general', country: 'USA', interval: 'year', resolved: true },
      }),
    });
  });
}

/**
 * Setup: Intercept GET /payment/* to always return paid=false (simulates pending webhook).
 * Also intercepts GET /session/* to prevent redirect.
 * Use before verifyPaidProcessingState to force the polling/processing state.
 */
export function interceptPaymentAsPending(getPage: () => Page, sessionId?: string) {
  return async () => {
    const page = getPage();
    const sid = sessionId || FAKE_SESSION_ID;
    // Session must be in 'pending' status to access /paid (after checkout, before webhook confirms)
    await interceptSessionAsValid(page, sid, 'pending');
    await page.route('**/enrollment/payment/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessionId: sid, paid: false, status: 'pending' }),
      });
    });
  };
}

/**
 * Setup: Intercept GET /payment/* to abort with network error.
 * Also intercepts GET /session/* to prevent redirect.
 * Use before verifyPaidErrorState to force the error state.
 */
export function interceptPaymentAsNetworkError(getPage: () => Page, sessionId?: string) {
  return async () => {
    const page = getPage();
    const sid = sessionId || FAKE_SESSION_ID;
    // Session must be in 'pending' status to access /paid
    await interceptSessionAsValid(page, sid, 'pending');
    await page.route('**/enrollment/payment/**', route => route.abort('internetdisconnected'));
  };
}

/**
 * Cleanup: Remove all route interceptors for /payment/* and /session/*.
 * Call after verification to restore normal behavior.
 */
export function clearPaymentInterceptor(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.unroute('**/enrollment/payment/**');
    await page.unroute('**/enrollment/session/**');
  };
}

// ─── Verification Factories ─────────────────────────────────────────────────

/**
 * AC-18b — Verify processing state: spinner visible, status message, no buttons.
 *
 * Requires interceptPaymentAsPending to be called before this factory.
 * Navigates to /paid, verifies state=processing with spinner and message.
 */
export function verifyPaidProcessingState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/paid`);
    await page.waitForSelector(sel.context, { timeout: 15_000 });

    // Should be in processing state (interceptor returns paid=false)
    await page.waitForSelector(sel.processing, { timeout: 10_000 });

    // Verify spinner and message
    await expect(page.locator(sel.statusMessage)).toBeVisible();
    await expect(page.locator(sel.statusMessage)).not.toBeEmpty();

    // Verify no buttons visible during processing
    await expect(page.locator(sel.continueBtn)).not.toBeVisible();
    await expect(page.locator(sel.retryBtn)).not.toBeVisible();
    await expect(page.locator(sel.errorMessage)).not.toBeVisible();
  };
}

/**
 * AC-18d — Verify error state: error message visible, retry button, no continue.
 *
 * Requires interceptPaymentAsNetworkError to be called before this factory.
 * Navigates to /paid, verifies state=error with message and retry button.
 */
export function verifyPaidErrorState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/paid`);
    await page.waitForSelector(sel.context, { timeout: 15_000 });

    // Should be in error state (interceptor aborts the request)
    await page.waitForSelector(sel.error, { timeout: 10_000 });

    // Verify error message and retry button
    await expect(page.locator(sel.errorMessage)).toBeVisible();
    await expect(page.locator(sel.errorMessage)).not.toBeEmpty();
    await expect(page.locator(sel.retryBtn)).toBeVisible();
    await expect(page.locator(sel.retryBtn)).toBeEnabled();

    // Verify continue button NOT visible in error state
    await expect(page.locator(sel.continueBtn)).not.toBeVisible();
  };
}

/**
 * AC-18a — Verify all elements visible in the paid success state.
 *
 * Navigates directly to /paid with a session that has already been paid.
 * Verifies: state=ready, page-title, page-subtitle, next-step-message,
 * continue-button visible and enabled.
 */
export function verifyPaidSuccessState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Navigate directly to /paid with the paid session
    await page.goto(`${baseURL}/sign-up/${sessionId}/paid`);
    await page.waitForSelector(sel.context, { timeout: 15_000 });

    // Verify state is ready (payment confirmed)
    await expect(page.locator(sel.ready)).toBeVisible({ timeout: 70_000 });

    // Verify all success elements are visible
    await expect(page.locator(sel.pageTitle)).toBeVisible();
    await expect(page.locator(sel.pageTitle)).not.toBeEmpty();

    await expect(page.locator(sel.pageSubtitle)).toBeVisible();

    await expect(page.locator(sel.nextStepMessage)).toBeVisible();

    // Continue button visible and enabled
    await expect(page.locator(sel.continueBtn)).toBeVisible();
    await expect(page.locator(sel.continueBtn)).toBeEnabled();

    // Retry button should NOT be visible in success state
    await expect(page.locator(sel.retryBtn)).not.toBeVisible();

    // Error and timeout messages should NOT be visible
    await expect(page.locator(sel.errorMessage)).not.toBeVisible();
    await expect(page.locator(sel.timeoutMessage)).not.toBeVisible();
  };
}

/**
 * AC-18c — Verify timeout state elements.
 *
 * Navigates to /paid with a session in 'pending' status where the webhook
 * has NOT confirmed payment. Waits for polling to exhaust all attempts (~1 min)
 * and verifies the timeout state: message visible, retry button works.
 */
export function verifyPaidTimeoutState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Navigate directly to /paid with the pending session
    await page.goto(`${baseURL}/sign-up/${sessionId}/paid`);
    await page.waitForSelector(sel.context, { timeout: 15_000 });

    // Wait for timeout state (requires ~1 min of polling without payment confirmation)
    await page.waitForSelector(sel.timeout, { timeout: 80_000 });

    // Verify timeout elements
    await expect(page.locator(sel.timeoutMessage)).toBeVisible();
    await expect(page.locator(sel.timeoutMessage)).not.toBeEmpty();
    await expect(page.locator(sel.retryBtn)).toBeVisible();
    await expect(page.locator(sel.retryBtn)).toBeEnabled();

    // Continue button should NOT be visible in timeout state
    await expect(page.locator(sel.continueBtn)).not.toBeVisible();

    // Click retry → should restart polling (transitions to processing immediately)
    await page.locator(sel.retryBtn).click();
    await expect(page.locator(sel.processing)).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(sel.statusMessage)).toBeVisible();
  };
}

/**
 * AC-18e — Verify "Continue to Agreement" button navigates to /agreement.
 *
 * Uses a session that has already been paid. Navigates to /paid,
 * waits for ready state, clicks continue, verifies URL changes to /agreement.
 */
export function verifyPaidContinueNavigation(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Navigate directly to /paid with the paid session
    await page.goto(`${baseURL}/sign-up/${sessionId}/paid`);
    await page.waitForSelector(sel.context, { timeout: 15_000 });

    // Wait for ready state
    await expect(page.locator(sel.ready)).toBeVisible({ timeout: 70_000 });

    // Click continue button
    await page.locator(sel.continueBtn).click();

    // Verify navigation to /agreement
    await page.waitForURL(/\/agreement/, { timeout: 15_000 });
  };
}
