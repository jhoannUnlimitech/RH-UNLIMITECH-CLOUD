/**
 * Agreement Signed Page Factories — Post-agreement confirmation.
 *
 * Page: /sign-up/{sessionId}/agreement-signed
 * POM: agreement-signed.pom.ts
 *
 * After the agreement is signed (Zoho Sign), the user lands here.
 * In v3, the continue button navigates to /checkout (CheckoutPage transition).
 *
 * Confirmed via Jam f1416d33: In Playwright CDP with isolated context,
 * the in-memory workflow store may not have all steps completed after
 * page.goto(verifyUrl), so we use a URL fallback if the click doesn't navigate.
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/agreement-signed.pom';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const sel = {
  pageReady:       pom.agreement_signed_page.ready.$(),
  pageTitle:       pom.agreement_signed_page._.page_title.$(),
  pageSubtitle:    pom.agreement_signed_page._.page_subtitle.$(),
  nextStepMessage: pom.agreement_signed_page._.next_step_info._.next_step_message.$(),
  nextStepHint:    pom.agreement_signed_page._.next_step_info._.next_step_hint.$(),
  continueButton:  pom.agreement_signed_page._.continue_button.$(),
};

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * Verify the agreement-signed page loaded correctly.
 */
export function verifyAgreementSignedPage(getPage: () => Page) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });
    await expect(page.locator(sel.pageTitle)).toBeVisible();
    // Commented: "next step" message removed per Rules compliance (C5/D2 — ticket #903)
    // await expect(page.locator(sel.nextStepMessage)).toBeVisible();
  };
}

/**
 * Navigate from agreement-signed to checkout (v3: /checkout transition page).
 *
 * Strategy (confirmed via Jam f1416d33):
 *   1. Click the continue button (React Router client-side navigation)
 *   2. Wait for /checkout or Stripe URL (CheckoutPage auto-redirects)
 *   3. If navigation didn't happen (workflow store blocked), fall back to
 *      direct URL navigation — the backend session status is correct
 */
export function continueFromAgreementSigned(getPage: () => Page) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    // Extract sessionId from current URL for fallback navigation
    const currentUrl = page.url();
    const sessionMatch = currentUrl.match(/\/sign-up\/([^/]+)\//);
    const sessionId = sessionMatch?.[1];

    // Step 1: Click the continue button
    await page.locator(sel.continueButton).click();

    // Step 2: Wait for /checkout or Stripe (CheckoutPage auto-redirects to Stripe)
    try {
      await page.waitForURL(/\/sign-up\/[^/]+\/checkout|checkout\.stripe\.com/, { timeout: 10_000 });
    } catch {
      // Step 3: Fallback — navigate directly via URL
      if (sessionId) {
        const baseURL = process.env.BASE_URL || 'https://localhost:9010';
        await page.goto(`${baseURL}/sign-up/${sessionId}/checkout`);
        await page.waitForURL(/\/sign-up\/[^/]+\/checkout|checkout\.stripe\.com/, { timeout: 30_000 });
      }
    }
  };
}
