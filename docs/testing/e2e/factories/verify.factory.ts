/**
 * Verify Page Factories — Email token verification.
 *
 * Page: /sign-up/{sessionId}/verify?token=...
 * POM: verify.pom.ts
 *
 * Navigates to the verification link (from email), waits for the API
 * to confirm the token, and clicks continue to proceed to agreement.
 *
 * Also includes validation factories for token reuse and error states.
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/verify.pom';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const sel = {
  success:          pom.verify_page.success.$(),
  already_verified: pom.verify_page.already_verified.$(),
  error:            pom.verify_page.error.$(),
  pageTitle:        pom.verify_page._.page_title.$(),
  pageMessage:      pom.verify_page._.page_message.$(),
  continueButton:   pom.verify_page._.continue_button.$(),
  resendButton:     pom.verify_page._.resend_button.$(),
};

// ═════════════════════════════════════════════════════════════════════════════
// HAPPY PATH
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Navigate to the verification link and confirm email was verified.
 *
 * @param verifyUrl - The full verification URL extracted from the email
 */
export function navigateAndVerifyEmail(getPage: () => Page, verifyUrl: string) {
  return async () => {
    const page = getPage();

    await page.goto(verifyUrl);

    const resolved = page.locator(`${sel.success}, ${sel.already_verified}`);
    await resolved.first().waitFor({ timeout: 15_000 });

    await expect(page.locator(sel.pageTitle)).toBeVisible();
    await expect(page.locator(sel.pageMessage)).toBeVisible();

    await page.locator(sel.continueButton).click();
    await page.waitForURL(/\/sign-up\/[^/]+\/agreement/, { timeout: 15_000 });
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — Token reuse, error states
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-19e: Navigate to a verify URL that was already consumed.
 * The token was already used — the page should show "already-verified"
 * with a continue button (the session is still valid).
 *
 * @param verifyUrl - The same URL used in navigateAndVerifyEmail
 */
export function verifyTokenAlreadyUsed(getPage: () => Page, verifyUrl: string) {
  return async () => {
    const page = getPage();

    await page.goto(verifyUrl);

    // Should show already-verified (token consumed but session valid)
    const resolved = page.locator(`${sel.already_verified}, ${sel.success}`);
    await resolved.first().waitFor({ timeout: 15_000 });

    await expect(page.locator(sel.pageTitle)).toBeVisible();
    await expect(page.locator(sel.pageMessage)).toBeVisible();
    // Continue button should be available (session is verified)
    await expect(page.locator(sel.continueButton)).toBeVisible();
  };
}

/**
 * AC-19d: Navigate to /verify with an invalid/invented session ID.
 * The app should show an error state or redirect to /sign-up.
 *
 * @param baseURL - The app base URL (default: https://localhost:9010)
 */
export function verifyInvalidSessionRedirects(getPage: () => Page, baseURL?: string) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'https://localhost:9010';
    const fakeSessionId = '00000000-0000-0000-0000-000000000000';
    const fakeToken = 'invalid-token-that-does-not-exist';

    await page.goto(`${url}/sign-up/${fakeSessionId}/verify?token=${fakeToken}`);

    // Should either show error state or redirect to /sign-up (new session)
    await page.waitForTimeout(3_000);

    const currentUrl = page.url();
    const isOnError = await page.locator(sel.error).isVisible().catch(() => false);
    const isRedirected = currentUrl.includes('/general-info') || currentUrl.includes('/plan') || currentUrl.endsWith('/sign-up');

    // Either error state visible OR redirected away from /verify
    expect(isOnError || isRedirected, 
      `Expected error state or redirect, but URL is ${currentUrl}`
    ).toBe(true);
  };
}

/**
 * AC-19c: Navigate to verify URL after the session completed the full flow.
 * The session is in status "paid" — the verify page should show
 * "already-verified" since the email was already verified earlier.
 *
 * @param verifyUrl - The same URL used earlier in the flow
 */
export function verifyTokenAfterCompletion(getPage: () => Page, verifyUrl: string) {
  return async () => {
    const page = getPage();

    await page.goto(verifyUrl);

    // Session already completed — should show already-verified or redirect
    await page.waitForTimeout(3_000);

    const currentUrl = page.url();
    const isAlreadyVerified = await page.locator(sel.already_verified).isVisible().catch(() => false);
    const isSuccess = await page.locator(sel.success).isVisible().catch(() => false);
    const isRedirected = !currentUrl.includes('/verify');

    expect(isAlreadyVerified || isSuccess || isRedirected,
      `Expected already-verified, success, or redirect, but URL is ${currentUrl}`
    ).toBe(true);
  };
}
