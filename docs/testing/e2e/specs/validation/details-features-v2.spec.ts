/**
 * Details Features V2 — Form 2 New Functionality (#859, #860, #861)
 *
 * Validates:
 *   #859: Personal Address "Same as Company" checkbox
 *   #860: Education dropdown new options
 *   #861: Back button navigation
 *
 * Covers: AC-B2-42 to AC-B2-53
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test details-features-v2 --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm } from '../../factories/registration-form.factory';
import { LEAD_USA_V4, REG_USA_V4, PARAMS_V4_FULL } from '../../fixtures/test-data';
import { t, getBothLocales } from '../../fixtures/i18n';
import {
  verifyPersonalAddressInitialState,
  togglePersonalAddress,
  recheckPersonalAddress,
  verifyEducationOptions,
  verifyBackButtonVisible,
  clickBackAndVerify,
  verifyFormDataPreserved,
} from '../../factories/details-features.factory';
import { expect } from '@playwright/test';

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(120_000);

const testEmail = `features-v2-${Date.now()}@example.com`;
const LEAD = { ...LEAD_USA_V4, email: testEmail };

// Registration data WITHOUT photo (faster for this validation spec)
const REG_NO_PHOTO = { ...REG_USA_V4, profilePhotoPath: undefined };

e2e.describe.serial('Details Features V2 — #859, #860, #861', () => {

  // ── Setup: Fill Form 1 → arrive at /details ───────────────────────────────
  e2e('navigate to form 1', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form', fillLeadForm(getPage, LEAD));
  e2e('submit lead form → /details', submitLeadForm(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #859 — Personal Address "Same as Company" Checkbox
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-46: i18n EN+ES personal address checkbox label', async () => {
    // Verify the translation key exists in both languages
    const { en, es } = getBothLocales('signUp.details.personalAddress.sameAsCompany');
    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBeGreaterThan(0);
  });

  e2e('AC-B2-42/43: checkbox visible + initial state correct', verifyPersonalAddressInitialState(getPage));
  e2e('AC-B2-44/45: toggle checkbox → fields hide/show', togglePersonalAddress(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #860 — Education Dropdown Options
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-47/48: education options (Diploma not Degree, No HS Diploma last)', verifyEducationOptions(getPage));

  e2e('AC-B2-49: ES education options exist in i18n', async () => {
    // Check the ES locale has the education options
    const esOptions = t('es', 'options.education.noHighSchoolDiploma');
    expect(esOptions.length).toBeGreaterThan(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // #861 — Back Button
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-51: back button visible in Form 2', verifyBackButtonVisible(getPage));
  e2e('AC-B2-52: click back → navigates to /general-info', clickBackAndVerify(getPage));
  e2e('AC-B2-53: form 1 data preserved after back', verifyFormDataPreserved(getPage, testEmail));

  // ══════════════════════════════════════════════════════════════════════════
  // #860 — Submit with "No High School Diploma" (requires full form fill)
  // ══════════════════════════════════════════════════════════════════════════

  e2e('return to form 2 (re-submit form 1)', async () => {
    const page = getPage();
    // Submit form 1 again to get back to /details
    const submitBtn = page.locator('[data-test-key="submit-button"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await page.waitForURL(/\/details/, { timeout: 10_000 });
  });

  e2e('fill form 2 with "No High School Diploma"', async () => {
    const page = getPage();
    // Fill form with education override
    const regData = { ...REG_NO_PHOTO, education: 'no_high_school_diploma' };
    await fillRegistrationForm(getPage, regData)();
  });

  e2e('AC-B2-50: submit with "No High School Diploma" → /plan', async () => {
    const page = getPage();
    const submitBtn = page.locator('[data-test-key="submit-button"][data-test-state="ready"]');
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();
    await page.waitForURL(/\/sign-up\/[^/]+\/(plan|thank-you)/, { timeout: 15_000 });
  });
});
