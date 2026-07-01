/**
 * Completed Page Factories — Reusable test steps for the enrollment completion page.
 *
 * Page: /sign-up/{sessionId}/completed
 * Based on: completed.pom.ts
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/completed.pom';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const cp = pom.completed_page;

const sel = {
  pageReady:          cp.ready.$(),
  pageTitle:          cp._.page_title.$(),
  pageSubtitle:       cp._.page_subtitle.$(),
  confirmationCtx:    cp._.confirmation_details.$(),
  paymentConfirmed:   cp._.confirmation_details._.payment_confirmed_message.$(),
  agreementSigned:    cp._.confirmation_details._.agreement_signed_message.$(),
  emailSent:          cp._.confirmation_details._.email_sent_message.$(),
  footerMessage:      cp._.footer_message.$(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// HAPPY PATH — Verify completed page loaded correctly
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify the completed page loads with all elements visible.
 *
 * Navigates to /completed with a session that has status 'completed'.
 * Use when navigating directly (not from a serial flow).
 */
export function verifyCompletedPage(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/completed`);
    await verifyCompletedElements(page);
  };
}

/**
 * Verify the completed page elements are visible.
 *
 * Use in serial flows where the browser is already on /completed
 * (e.g. after signAgreement redirects to /completed).
 */
export function verifyCompletedPageElements(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await verifyCompletedElements(page);
  };
}

/** Shared verification logic — used by both verifyCompletedPage and verifyCompletedPageElements */
async function verifyCompletedElements(page: Page): Promise<void> {
  await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

  // Verify title and subtitle
  await expect(page.locator(sel.pageTitle)).toBeVisible();
  await expect(page.locator(sel.pageTitle)).not.toBeEmpty();

  await expect(page.locator(sel.pageSubtitle)).toBeVisible();
  await expect(page.locator(sel.pageSubtitle)).not.toBeEmpty();

  // Verify confirmation details context and 3 items
  await expect(page.locator(sel.confirmationCtx)).toBeVisible();
  await expect(page.locator(sel.paymentConfirmed)).toBeVisible();
  await expect(page.locator(sel.paymentConfirmed)).not.toBeEmpty();
  await expect(page.locator(sel.agreementSigned)).toBeVisible();
  await expect(page.locator(sel.agreementSigned)).not.toBeEmpty();
  await expect(page.locator(sel.emailSent)).toBeVisible();
  await expect(page.locator(sel.emailSent)).not.toBeEmpty();

  // Verify footer
  await expect(page.locator(sel.footerMessage)).toBeVisible();
  await expect(page.locator(sel.footerMessage)).not.toBeEmpty();
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION — Individual element verification and edge cases
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-22g — Verify that a session without status 'completed' is redirected
 * away from /completed to the appropriate step.
 */
export function verifyCompletedRedirectsNonCompleted(getPage: () => Page, nonCompletedSessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${nonCompletedSessionId}/completed`);

    // Should redirect away from /completed
    await page.waitForURL(/\/sign-up\/[^/]+\/(?!completed)/, { timeout: 15_000 });

    // Verify completed-page context is NOT present
    const completedCtx = await page.locator(sel.pageReady).count();
    expect(completedCtx).toBe(0);
  };
}

/**
 * AC-22f extra — Verify completed page persists after reload.
 */
export function verifyCompletedReloadPersistence(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // First load
    await page.goto(`${baseURL}/sign-up/${sessionId}/completed`);
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });
    await expect(page.locator(sel.pageTitle)).toBeVisible();

    // Reload
    await page.reload();
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    // All elements still visible after reload
    await expect(page.locator(sel.pageTitle)).toBeVisible();
    await expect(page.locator(sel.pageTitle)).not.toBeEmpty();
    await expect(page.locator(sel.confirmationCtx)).toBeVisible();
    await expect(page.locator(sel.footerMessage)).toBeVisible();
  };
}
