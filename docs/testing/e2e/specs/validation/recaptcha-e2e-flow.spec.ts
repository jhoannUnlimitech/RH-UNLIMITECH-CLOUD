/**
 * reCAPTCHA v3 E2E Flow — Validates that reCAPTCHA does not block legitimate users.
 *
 * Runs the V4 enrollment flow through all 3 protected endpoints (SaveLead,
 * SaveRegistration, SavePlanSelection) with reCAPTCHA active. If any endpoint
 * rejects the token, the flow breaks and the test fails.
 *
 * Also verifies the reCAPTCHA badge is visible (confirms script loaded).
 *
 * Validates: AC-31d, AC-31e
 *
 * Prerequisites:
 *   - app.enrollment service running with reCAPTCHA configured
 *   - VITE_RECAPTCHA_SITE_KEY in frontend env (script loads on page init)
 *   - RECAPTCHA_SECRET_KEY in backend env (token verification)
 *   - CDP_ENDPOINT for browser-based testing
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test recaptcha-e2e-flow
 *
 * Related files:
 *   - src/utils/recaptcha.ts — frontend script loading + token generation
 *   - src/stores/lead/lead.store.ts — generates token on submit
 *   - modules/api/src/services/recaptcha.ts — backend verification
 *   - fixtures/test-data.ts — LEAD_USA, REG_USA_V4, PLAN_GENERAL_ANNUAL
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationFormV4 } from '../../factories/registration-form.factory';
import { selectPlanV4 } from '../../factories/plan-selection.factory';
import { verifyThankYouPage } from '../../factories/thank-you.factory';
import { expect } from '@playwright/test';
import {
  generateMailosaurEmail,
  LEAD_USA,
  REG_USA_V4,
  PLAN_GENERAL_ANNUAL,
  type LeadFormData,
} from '../../fixtures/test-data';

// ═════════════════════════════════════════════════════════════════════════════
// AC-31d — reCAPTCHA does not block legitimate enrollment flow
// ═════════════════════════════════════════════════════════════════════════════

const flow = createSerialFlow();
flow.e2e.setTimeout(120_000);

const email = generateMailosaurEmail('recaptcha-flow');
const leadData: LeadFormData = { ...LEAD_USA, email };

flow.e2e.describe.serial('AC-31d — reCAPTCHA v3 does not block legitimate flow', () => {
  // Step 1: Navigate — reCAPTCHA script loads on page init
  flow.e2e('navigate to sign-up', navigateToSignUpV4(flow.getPage));

  // Step 2: Fill and submit lead form (1st protected endpoint: POST /lead)
  flow.e2e('fill lead form', fillLeadForm(flow.getPage, leadData));
  flow.e2e('submit lead form — reCAPTCHA token generated and accepted', submitLeadForm(flow.getPage));

  // Step 3: Fill and submit registration (2nd protected endpoint: POST /registration)
  flow.e2e('fill registration', fillRegistrationForm(flow.getPage, REG_USA_V4));
  flow.e2e('submit registration — reCAPTCHA token accepted', submitRegistrationFormV4(flow.getPage));

  // Step 4: Select plan (3rd protected endpoint: POST /plans/select)
  flow.e2e('select plan — reCAPTCHA token accepted', selectPlanV4(flow.getPage, PLAN_GENERAL_ANNUAL));

  // Step 5: If we reach thank-you, all 3 protected endpoints passed reCAPTCHA
  flow.e2e('verify thank-you page — all reCAPTCHA checks passed', verifyThankYouPage(flow.getPage));
});

// ═════════════════════════════════════════════════════════════════════════════
// AC-31e — reCAPTCHA badge visible (script loaded and active)
// ═════════════════════════════════════════════════════════════════════════════

const badge = createSerialFlow();
badge.e2e.setTimeout(30_000);

badge.e2e.describe.serial('AC-31e — reCAPTCHA badge is visible on enrollment page', () => {
  badge.e2e('navigate to sign-up', navigateToSignUpV4(badge.getPage));

  badge.e2e('verify reCAPTCHA v3 badge is visible', async () => {
    const page = badge.getPage();
    // reCAPTCHA v3 renders a badge in the bottom-right corner with class .grecaptcha-badge
    await expect(page.locator('.grecaptcha-badge')).toBeVisible({ timeout: 10_000 });
  });
});
