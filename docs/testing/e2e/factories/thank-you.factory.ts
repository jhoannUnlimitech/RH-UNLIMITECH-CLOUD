/**
 * Thank You Page Factories — Email verification prompt after registration.
 *
 * Page: /sign-up/{sessionId}/thank-you
 * POM: thank-you.pom.ts
 *
 * After registration submit, the user lands here and must check their email.
 * The factory includes a resend-with-retry strategy for email verification:
 *   1. Wait for email in Mailosaur (10s)
 *   2. If not received, click resend button in the browser
 *   3. Wait again (10s)
 *   4. Repeat up to maxRetries times
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/thank-you.pom';
import { createMailosaur } from '../fixtures/mailosaur';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const sel = {
  pageReady:     pom.thank_you_page.ready.$(),
  pageTitle:     pom.thank_you_page._.page_title.$(),
  pageSubtitle:  pom.thank_you_page._.page_subtitle.$(),
  spamNote:      pom.thank_you_page._.spam_note.$(),
  resendSuccess: pom.thank_you_page._.resend_success.$(),
  resendButton:  pom.thank_you_page._.resend_button.$(),
  resendReady:   pom.thank_you_page._.resend_button.ready.$(),
  resendCooldown: pom.thank_you_page._.resend_button.cooldown.$(),
};

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * Verify the thank-you page loaded correctly after registration submit.
 */
export function verifyThankYouPage(getPage: () => Page) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });
    await expect(page.locator(sel.pageTitle)).toBeVisible();
    await expect(page.locator(sel.pageSubtitle)).toBeVisible();
    await expect(page.locator(sel.spamNote)).toBeVisible();
    await expect(page.locator(sel.resendReady)).toBeVisible();
  };
}

/**
 * AC-50: Verify resend button cooldown behavior.
 *
 * After registration submit, the backend sends the verification email
 * automatically and the resend button enters a 60s cooldown.
 *
 * Verifies:
 *   1. Button is in cooldown state (disabled) after initial email send
 *   2. Button text shows countdown timer (contains seconds)
 */
export function verifyResendCooldown(getPage: () => Page) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    const resendBtn = page.locator(sel.resendButton);
    const state = await resendBtn.getAttribute('data-test-state');

    // The button should be in cooldown (backend just sent the email)
    // or ready (if enough time passed since registration submit)
    if (state === 'cooldown') {
      // Verify cooldown is active: button disabled, text shows countdown
      await expect(resendBtn).toBeDisabled();
      const text = await resendBtn.textContent();
      expect(text).toMatch(/\d+/); // Contains countdown seconds
    } else {
      // Button is ready — click to trigger resend + verify cooldown activates
      await expect(resendBtn).toBeEnabled();
      await resendBtn.click();
      await expect(page.locator(sel.resendCooldown)).toBeVisible({ timeout: 5_000 });
      await expect(resendBtn).toBeDisabled();
    }
  };
}

/**
 * Wait for the verification email via Mailosaur with resend retry logic.
 *
 * Strategy:
 *   1. Wait 30s for the email to arrive in Mailosaur
 *   2. If it arrives → return the link immediately (no resend needed)
 *   3. If it doesn't arrive → click resend button, wait 30s more
 *   4. Repeat up to maxRetries resends
 *
 * The backend enforces a 60s cooldown between resends, but the first resend
 * is available immediately after the initial send. Subsequent resends wait
 * for the cooldown to clear.
 *
 * @param email - The Mailosaur email address used during registration
 * @param maxRetries - Maximum number of resend attempts after initial wait (default: 3)
 * @param attemptTimeoutMs - How long to wait per attempt (default: 30s)
 */
export function waitForEmailWithResend(
  getPage: () => Page,
  email: string,
  maxRetries = 3,
  attemptTimeoutMs = 30_000,
) {
  return async (): Promise<string> => {
    const page = getPage();
    const mailosaur = createMailosaur();

    // ── First attempt: wait for the original email ──
    try {
      return await mailosaur.waitForVerificationLink(email, attemptTimeoutMs);
    } catch {
      // Email didn't arrive in the first 30s — proceed to resend
    }

    // ── Resend attempts ──
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Click resend if button is ready
      const resendBtn = page.locator(sel.resendButton);
      const state = await resendBtn.getAttribute('data-test-state');

      if (state === 'ready') {
        await resendBtn.click();
        await page.waitForTimeout(1_000);
      } else if (state === 'cooldown') {
        // Wait for cooldown to clear before clicking
        await page.waitForSelector(sel.resendReady, { timeout: 65_000 });
        await resendBtn.click();
        await page.waitForTimeout(1_000);
      }

      // Wait for the resent email
      try {
        return await mailosaur.waitForVerificationLink(email, attemptTimeoutMs);
      } catch {
        if (attempt >= maxRetries) {
          throw new Error(
            `Verification email not received after initial wait + ${maxRetries} resends ` +
            `(${attemptTimeoutMs}ms each) for ${email}`,
          );
        }
      }
    }

    throw new Error(`Unreachable — verification email not received for ${email}`);
  };
}
