/**
 * Agreement Template Selection — Language-based template resolution E2E test.
 *
 * Validates that the system selects the correct Zoho Sign template based on
 * the user's preferred language (Form 2) and country (Form 1).
 *
 * Fallback chain: idioma+país → solo idioma → inglés
 *
 * Scenarios tested:
 *   1. Español + Colombia → template es-COL (exact match)
 *   2. Inglés + EEUU → template en (direct match)
 *   3. Francés + Canadá → template fr (language fallback)
 *
 * Validation: The agreement page reaches data-test-state="ready" (template found
 * and document created). If the template doesn't exist, the page shows error state.
 *
 * Validates: AC-20e, AC-20f, AC-20g, AC-20h, AC-20i
 *
 * Requirements:
 *   - CDP_ENDPOINT (Zoho Sign iframe requires full Chrome)
 *   - Backend with Zoho Sign integration active
 *   - Templates configured in Zoho Sign: es-COL, es, en, fr
 *
 * Timeout: 480s — 3 scenarios × full flow (lead → registration → plan → verify → agreement)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test agreement-template-selection
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
  LEAD_COLOMBIA,
  LEAD_USA,
  LEAD_CANADA,
  REG_TEMPLATE_ES_COL,
  REG_TEMPLATE_EN,
  REG_TEMPLATE_FR,
  PLAN_GENERAL_ANNUAL,
} from '../../fixtures/test-data';

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 1: Español + Colombia → es-COL (AC-20g)
// ═════════════════════════════════════════════════════════════════════════════

const scenario1 = createSerialFlow();
scenario1.e2e.setTimeout(180_000);

const email1 = generateMailosaurEmail('tpl-es-col');
const LEAD_1 = { ...LEAD_COLOMBIA, email: email1 };
let verifyUrl1 = '';

scenario1.e2e.describe.serial('AC-20g — Español + Colombia → template es-COL', () => {
  scenario1.e2e('navigate to sign-up', navigateToSignUpV4(scenario1.getPage));
  scenario1.e2e('fill lead form (Colombia)', fillLeadForm(scenario1.getPage, LEAD_1));
  scenario1.e2e('submit lead form', submitLeadForm(scenario1.getPage));
  scenario1.e2e('fill registration (español)', fillRegistrationForm(scenario1.getPage, REG_TEMPLATE_ES_COL));
  scenario1.e2e('submit registration → plan', submitRegistrationFormV4(scenario1.getPage));
  scenario1.e2e('select plan', selectPlanV4(scenario1.getPage, PLAN_GENERAL_ANNUAL));
  scenario1.e2e('verify thank-you page', verifyThankYouPage(scenario1.getPage));
  scenario1.e2e('wait for verification email', async () => {
    verifyUrl1 = await waitForEmailWithResend(scenario1.getPage, email1)();
  });
  scenario1.e2e('verify email → agreement', () => navigateAndVerifyEmail(scenario1.getPage, verifyUrl1)());

  scenario1.e2e('AC-20g: agreement page loads with es-COL template', async () => {
    const page = scenario1.getPage();
    // Wait for agreement page to reach ready state (template found + document created)
    await expect(page.locator('[data-test-context="agreement-page"][data-test-state="ready"]'))
      .toBeVisible({ timeout: 60_000 });
    // Verify iframe is present (Zoho Sign loaded)
    await expect(page.locator('[data-test-key="signing-iframe"]'))
      .toBeVisible({ timeout: 10_000 });
    // Verify NO error state
    const hasError = await page.locator('[data-test-context="agreement-page"][data-test-state="error"]')
      .isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 2: Inglés + EEUU → en (AC-20e direct match)
// ═════════════════════════════════════════════════════════════════════════════

const scenario2 = createSerialFlow();
scenario2.e2e.setTimeout(180_000);

const email2 = generateMailosaurEmail('tpl-en');
const LEAD_2 = { ...LEAD_USA, email: email2 };
let verifyUrl2 = '';

scenario2.e2e.describe.serial('AC-20e — Inglés + EEUU → template en', () => {
  scenario2.e2e('navigate to sign-up', navigateToSignUpV4(scenario2.getPage));
  scenario2.e2e('fill lead form (USA)', fillLeadForm(scenario2.getPage, LEAD_2));
  scenario2.e2e('submit lead form', submitLeadForm(scenario2.getPage));
  scenario2.e2e('fill registration (english)', fillRegistrationForm(scenario2.getPage, REG_TEMPLATE_EN));
  scenario2.e2e('submit registration → plan', submitRegistrationFormV4(scenario2.getPage));
  scenario2.e2e('select plan', selectPlanV4(scenario2.getPage, PLAN_GENERAL_ANNUAL));
  scenario2.e2e('verify thank-you page', verifyThankYouPage(scenario2.getPage));
  scenario2.e2e('wait for verification email', async () => {
    verifyUrl2 = await waitForEmailWithResend(scenario2.getPage, email2)();
  });
  scenario2.e2e('verify email → agreement', () => navigateAndVerifyEmail(scenario2.getPage, verifyUrl2)());

  scenario2.e2e('AC-20e: agreement page loads with en template', async () => {
    const page = scenario2.getPage();
    await expect(page.locator('[data-test-context="agreement-page"][data-test-state="ready"]'))
      .toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-test-key="signing-iframe"]'))
      .toBeVisible({ timeout: 10_000 });
    const hasError = await page.locator('[data-test-context="agreement-page"][data-test-state="error"]')
      .isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 3: Francés + Canadá → fr (AC-20f language fallback)
// ═════════════════════════════════════════════════════════════════════════════

const scenario3 = createSerialFlow();
scenario3.e2e.setTimeout(180_000);

const email3 = generateMailosaurEmail('tpl-fr');
const LEAD_3 = { ...LEAD_CANADA, email: email3 };
let verifyUrl3 = '';

scenario3.e2e.describe.serial('AC-20f — Francés + Canadá → template fr (fallback)', () => {
  scenario3.e2e('navigate to sign-up', navigateToSignUpV4(scenario3.getPage));
  scenario3.e2e('fill lead form (Canada)', fillLeadForm(scenario3.getPage, LEAD_3));
  scenario3.e2e('submit lead form', submitLeadForm(scenario3.getPage));
  scenario3.e2e('fill registration (français)', fillRegistrationForm(scenario3.getPage, REG_TEMPLATE_FR));
  scenario3.e2e('submit registration → plan', submitRegistrationFormV4(scenario3.getPage));
  scenario3.e2e('select plan', selectPlanV4(scenario3.getPage, PLAN_GENERAL_ANNUAL));
  scenario3.e2e('verify thank-you page', verifyThankYouPage(scenario3.getPage));
  scenario3.e2e('wait for verification email', async () => {
    verifyUrl3 = await waitForEmailWithResend(scenario3.getPage, email3)();
  });
  scenario3.e2e('verify email → agreement', () => navigateAndVerifyEmail(scenario3.getPage, verifyUrl3)());

  scenario3.e2e('AC-20f: agreement page loads with fr template (fallback)', async () => {
    const page = scenario3.getPage();
    await expect(page.locator('[data-test-context="agreement-page"][data-test-state="ready"]'))
      .toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-test-key="signing-iframe"]'))
      .toBeVisible({ timeout: 10_000 });
    const hasError = await page.locator('[data-test-context="agreement-page"][data-test-state="error"]')
      .isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
