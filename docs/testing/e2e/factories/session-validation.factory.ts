/**
 * Session Validation Factories — AC-01, AC-02, AC-03
 *
 * Tests session lifecycle: creation, invalid/expired session handling,
 * and data persistence via DynamoDB (no sessionStorage).
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/general-info.pom';
import type { LeadFormData, SessionValidationData } from '../fixtures/test-data';

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  formReady:  pom.lead_form.ready.$(),
  firstName:  pom.lead_form._.name_section._.first_name_input.$(),
  lastName:   pom.lead_form._.name_section._.last_name_input.$(),
  email:      pom.lead_form._.email_section._.email_input.$(),
};

// ─── UUID regex for URL validation ──────────────────────────────────────────

const UUID_PATTERN = /\/sign-up\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/general-info/;

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * AC-01: Navigating to /sign-up creates a valid session UUID and redirects
 * to /sign-up/{uuid}/general-info.
 */
export function verifySessionCreation(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseUrl}/sign-up`);
    await page.waitForURL(UUID_PATTERN, { timeout: 15_000 });

    // URL must contain a valid UUID
    const url = page.url();
    expect(url).toMatch(UUID_PATTERN);

    // Extract and validate the session ID format
    const match = url.match(/\/sign-up\/([0-9a-f-]+)\/general-info/);
    expect(match).not.toBeNull();
    expect(match![1]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  };
}

/**
 * AC-02: Navigating with an invented UUID (not in DynamoDB) must show an
 * error and block access to the form. The form must NOT be accessible.
 *
 * Expected behavior: redirect to /sign-up or show error state.
 * If the form is displayed, this test FAILS — the session-id is created
 * by DynamoDB, not by the user.
 */
export function verifyInventedSessionBlocked(getPage: () => Page, data: SessionValidationData) {
  return async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseUrl}/sign-up/${data.inventedSessionId}/general-info`);

    // Wait for the app to process the session validation
    await page.waitForTimeout(3_000);

    // The form must NOT be in ready state — either redirected or showing error
    const formReady = page.locator(sel.formReady);
    const isFormVisible = await formReady.isVisible().catch(() => false);

    // If the form is visible and ready, the test FAILS
    // An invented session-id must not grant access to the form
    expect(isFormVisible).toBe(false);

    // Should have redirected to /sign-up (entry) or show error
    const url = page.url();
    const isOnSignUpEntry = url.endsWith('/sign-up') || url.endsWith('/sign-up/');
    const hasErrorVisible = await page.locator('[data-test-state="error"]').isVisible().catch(() => false);

    expect(isOnSignUpEntry || hasErrorVisible).toBe(true);
  };
}

/**
 * AC-02: Navigating with a malformed session-id (not UUID format) must
 * show an error and block access to the form.
 */
export function verifyMalformedSessionBlocked(getPage: () => Page, data: SessionValidationData) {
  return async () => {
    const page = getPage();
    const baseUrl = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseUrl}/sign-up/${data.malformedSessionId}/general-info`);

    await page.waitForTimeout(3_000);

    // The form must NOT be accessible
    const formReady = page.locator(sel.formReady);
    const isFormVisible = await formReady.isVisible().catch(() => false);
    expect(isFormVisible).toBe(false);

    // Should have redirected or show error
    const url = page.url();
    const isOnSignUpEntry = url.endsWith('/sign-up') || url.endsWith('/sign-up/');
    const hasErrorVisible = await page.locator('[data-test-state="error"]').isVisible().catch(() => false);

    expect(isOnSignUpEntry || hasErrorVisible).toBe(true);
  };
}

/**
 * AC-03: Data persists in DynamoDB — fill form, submit, reload page,
 * verify fields are restored from backend (not sessionStorage).
 *
 * Pre-condition: must navigate to /sign-up first (creates session).
 * This factory fills the lead form, submits it, navigates back to
 * general-info, and verifies the data was loaded from the backend.
 */
export function verifyDataPersistence(getPage: () => Page, data: LeadFormData) {
  return async () => {
    const page = getPage();

    // At this point we should be on /sign-up/{sessionId}/details (after submit)
    // Extract sessionId from URL
    const url = page.url();
    const match = url.match(/\/sign-up\/([0-9a-f-]+)\//);
    expect(match).not.toBeNull();
    const sessionId = match![1];

    // Navigate back to general-info to test data recovery
    const baseUrl = process.env.BASE_URL || 'https://localhost:9010';
    await page.goto(`${baseUrl}/sign-up/${sessionId}/general-info`);
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // Fields must be populated from backend (DynamoDB), not empty
    const firstName = page.locator(sel.firstName);
    await expect(firstName).toHaveValue(data.firstName, { timeout: 10_000 });

    const lastName = page.locator(sel.lastName);
    await expect(lastName).toHaveValue(data.lastName);

    const email = page.locator(sel.email);
    await expect(email).toHaveValue(data.email);
  };
}
