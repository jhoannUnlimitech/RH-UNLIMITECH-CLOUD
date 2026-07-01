/**
 * Navigation Factories — Entry points for enrollment flows.
 *
 * V3 scenarios (legacy):
 *   - Escenario C (no params): /sign-up → /plan (full plan selection)
 *   - Escenario A (plan+interval): /sign-up?plan=X&interval=Y → /general-info (skip plan)
 *   - Escenario B (plan only): /sign-up?plan=X → /plan (preselected)
 *
 * V4 scenarios (current):
 *   - All params optional & independent (AC-52)
 *   - Always lands on /general-info (plan selection is step 3)
 *   - plan+interval pre-selects in Plan Selection (does NOT skip it)
 *   - country pre-fills country in General Info
 *
 * All param values come from test-data.ts datasets — never hardcoded.
 */

import type { Page } from '@playwright/test';
import type { EnrollmentParamsComplete, EnrollmentParamsPartial, EnrollmentParamsV4 } from '../fixtures/test-data';

/**
 * Escenario C (v3): Navigate without params → lands on plan selection page.
 */
export function navigateToSignUp(getPage: () => Page, baseURL?: string) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'https://localhost:9010';
    await page.goto(`${url}/sign-up`);
    await page.waitForURL(/\/sign-up\/[^/]+\/plan/);
  };
}

/**
 * v4 flow: Navigate without params → lands on general-info (Form 1).
 * In v4, plan selection moved to step 3 (after both forms).
 * Supports optional params for pre-filling (plan, interval, country, language).
 */
export function navigateToSignUpWithPlan(
  getPage: () => Page, params: EnrollmentParamsComplete, baseURL?: string,
) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'https://localhost:9010';
    await page.goto(`${url}/sign-up?plan=${params.plan}&interval=${params.interval}`);
    await page.waitForURL(/\/sign-up\/[^/]+\/general-info/);
  };
}

/**
 * Escenario B: Navigate with plan only (no interval) → plan selection with preselection.
 * @param params - Partial enrollment params from test-data.ts
 */
export function navigateToSignUpWithPartialPlan(
  getPage: () => Page, params: EnrollmentParamsPartial, baseURL?: string,
) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'https://localhost:9010';
    await page.goto(`${url}/sign-up?plan=${params.plan}`);
    await page.waitForURL(/\/sign-up\/[^/]+\/plan/);
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// V4 Navigation — Optional & Independent Params (AC-52, AC-53)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Navigate to enrollment with explicit language parameter (?lang=).
 *
 * Used to test the language detection via URL param injection (#896).
 * The app consumes the ?lang= param, persists it to localStorage, and strips it from the URL.
 * Always lands on /general-info (same as V4 flow).
 *
 * @param lang - Language code to inject (e.g. 'es-CO', 'en-US', 'es', 'en', 'fr')
 */
export function navigateToSignUpWithLang(
  getPage: () => Page, lang: string, baseURL?: string,
) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'https://localhost:9010';
    await page.goto(`${url}/sign-up?lang=${lang}`);
    await page.waitForURL(/\/sign-up\/[^/]+\/general-info/);
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// V4 Navigation — Optional & Independent Params (AC-52, AC-53)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * V4 Navigation: All params optional and independent.
 *
 * In V4, the flow ALWAYS starts at /general-info regardless of params.
 * Plan selection is step 3 (after registration), never skipped.
 *
 * Params behavior:
 *   - plan: pre-highlights the plan card in Plan Selection (step 3)
 *   - interval: pre-selects the month/year toggle in Plan Selection
 *   - country: pre-fills the country select in General Info
 *   - language: pre-selects language preference
 *
 * @param params - Optional V4 enrollment params (all independent)
 */
export function navigateToSignUpV4(
  getPage: () => Page, params?: EnrollmentParamsV4, baseURL?: string,
) {
  return async () => {
    const page = getPage();
    const url = baseURL || process.env.BASE_URL || 'https://localhost:9010';
    const searchParams = new URLSearchParams();
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.interval) searchParams.set('interval', params.interval);
    if (params?.country) searchParams.set('country', params.country);
    if (params?.language) searchParams.set('language', params.language);

    const qs = searchParams.toString();
    await page.goto(`${url}/sign-up${qs ? '?' + qs : ''}`);

    // V4: always lands on /general-info (plan selection is step 3)
    await page.waitForURL(/\/sign-up\/[^/]+\/general-info/);
  };
}
