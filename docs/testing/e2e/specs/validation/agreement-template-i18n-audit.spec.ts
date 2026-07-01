/**
 * Agreement Template i18n Audit — Validates Zoho Sign template resolution for all languages.
 *
 * Tests the automatic template selection feature (AC-20e through AC-20i).
 * Each language scenario runs as an INDEPENDENT serial flow — a failure in one
 * does not block the others.
 *
 * What it validates:
 *   1. Template resolution via the i18n fallback chain (language+country → language → en)
 *   2. Document creation succeeds in Zoho Sign (template has signing fields configured)
 *   3. Agreement page reaches data-test-state="ready" (embed signing URL obtained)
 *
 * What it does NOT do:
 *   - Does NOT sign the document (only validates the page loads with the iframe)
 *
 * Scenarios are defined in test-data.ts (TEMPLATE_I18N_SCENARIOS).
 * To run a subset, use Playwright grep:
 *   npx playwright test agreement-template-i18n-audit --grep "AC-20g"
 *   npx playwright test agreement-template-i18n-audit --grep "es-col"
 *
 * Related files:
 *   - e2e/fixtures/test-data.ts — TEMPLATE_I18N_SCENARIOS, LEAD_*, REG_TEMPLATE_*
 *   - infra/functions/zoho/ZohoSignTemplateResolver.ts — resolver with fallback chain
 *   - infra/functions/zoho/ProcessAgreement.ts — creates document from resolved template
 *   - modules/api/src/controllers/GetAgreement.ts — generates embed token for frontend
 *   - modules/spa/src/pages/SignUp/AgreementPage.tsx — polls until ready, shows iframe
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test agreement-template-i18n-audit
 *
 * Validates: AC-20e, AC-20f, AC-20g, AC-20h, AC-20i
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationFormV4 } from '../../factories/registration-form.factory';
import { selectPlanV4 } from '../../factories/plan-selection.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { expect } from '@playwright/test';
import {
  generateMailosaurEmail,
  TEMPLATE_I18N_SCENARIOS,
  PLAN_GENERAL_ANNUAL,
  type LeadFormData,
} from '../../fixtures/test-data';

// ═════════════════════════════════════════════════════════════════════════════
// Test generation — one independent serial flow per scenario from test-data
// ═════════════════════════════════════════════════════════════════════════════

for (const scenario of TEMPLATE_I18N_SCENARIOS) {
  const flow = createSerialFlow();
  flow.e2e.setTimeout(180_000);

  const email = generateMailosaurEmail(`audit-${scenario.id}`);
  const leadData: LeadFormData = { ...scenario.lead, email };
  let verifyUrl = '';

  flow.e2e.describe.serial(`${scenario.criterion} — ${scenario.description}`, () => {
    flow.e2e('navigate to sign-up', navigateToSignUpV4(flow.getPage));
    flow.e2e('fill lead form', fillLeadForm(flow.getPage, leadData));
    flow.e2e('submit lead form', submitLeadForm(flow.getPage));
    flow.e2e('fill registration', fillRegistrationForm(flow.getPage, scenario.registration));
    flow.e2e('submit registration → plan', submitRegistrationFormV4(flow.getPage));
    flow.e2e('select plan', selectPlanV4(flow.getPage, PLAN_GENERAL_ANNUAL));
    flow.e2e('verify thank-you page', verifyThankYouPage(flow.getPage));
    flow.e2e('wait for verification email', async () => {
      verifyUrl = await waitForEmailWithResend(flow.getPage, email)();
    });
    flow.e2e('verify email → agreement', () => navigateAndVerifyEmail(flow.getPage, verifyUrl)());

    flow.e2e(`validate: agreement page loads (template: ${scenario.id})`, async () => {
      const page = flow.getPage();

      // Wait for agreement page to reach ready state
      await expect(page.locator('[data-test-context="agreement-page"][data-test-state="ready"]'))
        .toBeVisible({ timeout: 60_000 });

      // Verify the Zoho Sign iframe is present and visible
      await expect(page.locator('[data-test-key="signing-iframe"]'))
        .toBeVisible({ timeout: 10_000 });

      // Verify NO error state is showing
      const hasError = await page.locator('[data-test-context="agreement-page"][data-test-state="error"]')
        .isVisible().catch(() => false);
      expect(hasError).toBe(false);
    });
  });
}
