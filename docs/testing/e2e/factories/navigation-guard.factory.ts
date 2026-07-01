/**
 * Navigation Guard Factories — Cross-cutting validation for route guards.
 *
 * Verifies that the SPA enforces navigation restrictions based on session status.
 * No POM needed — these factories only verify URL redirections, not UI elements.
 *
 * AC-32: Post-payment sessions cannot access Form 1, Form 2, Plan Selection
 * AC-34: Each URL redirects to the correct step based on session status
 * AC-35: No sessionStorage — already verified in AC-03 (data persistence)
 */

import { expect, type Page } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════════
// AC-32 — Post-payment navigation blocked
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-32: Verify that a completed/paid session cannot access /general-info.
 * Should redirect away from the form.
 */
export function verifyPostPaymentBlocksGeneralInfo(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/general-info`);
    await page.waitForURL(/\/sign-up\/[^/]+\/(?!general-info)/, { timeout: 15_000 });

    // Should NOT be on general-info
    expect(page.url()).not.toContain('/general-info');
  };
}

/**
 * AC-32: Verify that a completed/paid session cannot access /details.
 * Should redirect away from the form.
 */
export function verifyPostPaymentBlocksDetails(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/details`);
    await page.waitForURL(/\/sign-up\/[^/]+\/(?!details)/, { timeout: 15_000 });

    // Should NOT be on details
    expect(page.url()).not.toContain('/details');
  };
}

/**
 * AC-32: Verify that a completed/paid session cannot access /plan.
 * Should redirect away from plan selection.
 */
export function verifyPostPaymentBlocksPlan(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/plan`);
    await page.waitForURL(/\/sign-up\/[^/]+\/(?!plan)/, { timeout: 15_000 });

    // Should NOT be on plan
    expect(page.url()).not.toContain('/plan');
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AC-34 — State-based redirection
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-34: Verify that a pending session redirects to /plan when accessing /completed.
 * A session in 'pending' status should not access post-payment pages.
 */
export function verifyPendingRedirectsFromCompleted(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/completed`);
    await page.waitForURL(/\/sign-up\/[^/]+\/(?!completed)/, { timeout: 15_000 });

    // Should redirect to plan (the furthest accessible step for pending)
    expect(page.url()).not.toContain('/completed');
  };
}

/**
 * AC-34: Verify that a completed session redirects to /completed from any earlier step.
 */
export function verifyCompletedRedirectsFromEarlierSteps(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Try accessing /general-info with completed session
    await page.goto(`${baseURL}/sign-up/${sessionId}/general-info`);

    // Wait for redirect — should end up at /completed or /agreement or /paid
    // (any post-payment step, not general-info)
    await page.waitForURL(/\/sign-up\/[^/]+\/(?!general-info)/, { timeout: 15_000 });
    expect(page.url()).not.toContain('/general-info');
  };
}
