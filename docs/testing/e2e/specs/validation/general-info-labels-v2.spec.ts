/**
 * General Info Labels V2 — Text Corrections Validation
 *
 * Validates that Form 1 (General Info) field labels and hints match the i18n
 * translation files after the corrections in tickets #850, #851, #852, #853.
 *
 * Strategy:
 *   1. Read the actual text from the i18n JSON files (EN + ES)
 *   2. Navigate to the form
 *   3. Verify the UI renders what the i18n file says
 *
 * This ensures:
 *   - The i18n file has the correct text (per ticket requirements)
 *   - The UI renders it correctly (no disconnect between file and DOM)
 *
 * Covers: AC-B2-01 to AC-B2-15
 *
 * Run:
 *   npx playwright test general-info-labels-v2 --reporter=list
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test general-info-labels-v2 --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { PARAMS_V4_FULL } from '../../fixtures/test-data';
import { t, getBothLocales } from '../../fixtures/i18n';
import { pom } from '../../pom/general-info.pom';
import { expect } from '@playwright/test';

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(60_000);

// ─── i18n Keys for the fields being validated ───────────────────────────────

const KEYS = {
  companyName: {
    label: 'signUp.generalInfo.companyName.label',
    hint: 'signUp.generalInfo.companyName.hint',
  },
  phone: {
    label: 'signUp.generalInfo.phone.label',
    hint: 'signUp.generalInfo.phone.hint',
  },
  email: {
    label: 'signUp.generalInfo.email.label',
    hint: 'signUp.generalInfo.email.hint',
  },
  address: {
    label: 'signUp.generalInfo.address.label',
    hint: 'signUp.generalInfo.address.hint',
  },
};

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  companyNameSection: pom.lead_form._.company_name_section.$(),
  phoneSection:       pom.lead_form._.phone_section.$(),
  emailSection:       pom.lead_form._.email_section.$(),
  addressSection:     pom.lead_form._.address_section.$(),
};

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('General Info Labels V2 — Text Corrections (#850-#853)', () => {

  // ── Setup ─────────────────────────────────────────────────────────────────
  e2e('navigate to form 1', navigateToSignUpV4(getPage, PARAMS_V4_FULL));

  // ══════════════════════════════════════════════════════════════════════════
  // PART 1: i18n file validation (EN + ES keys exist and have correct values)
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-01: EN company name hint matches ticket requirement', async () => {
    const value = t('en', KEYS.companyName.hint);
    expect(value).toBe('Enter your name if you do not have a separate company name.');
  });

  e2e('AC-B2-02: ES company name hint exists', async () => {
    const { es } = getBothLocales(KEYS.companyName.hint);
    expect(es.length).toBeGreaterThan(0);
  });

  e2e('AC-B2-04: EN phone label matches ticket requirement', async () => {
    const value = t('en', KEYS.phone.label);
    expect(value).toBe('Company Phone');
  });

  e2e('AC-B2-05: EN phone hint matches ticket requirement', async () => {
    const value = t('en', KEYS.phone.hint);
    expect(value).toBe('Enter your personal phone number if you do not have a separate company phone number.');
  });

  e2e('AC-B2-06: ES phone label and hint exist', async () => {
    const { es: label } = getBothLocales(KEYS.phone.label);
    const { es: hint } = getBothLocales(KEYS.phone.hint);
    expect(label.length).toBeGreaterThan(0);
    expect(hint.length).toBeGreaterThan(0);
  });

  e2e('AC-B2-08: EN email label matches ticket requirement', async () => {
    const value = t('en', KEYS.email.label);
    expect(value).toBe('Company Email Address');
  });

  e2e('AC-B2-09: EN email hint matches ticket requirement', async () => {
    const value = t('en', KEYS.email.hint);
    expect(value).toBe('Enter your personal email address if you do not have a separate company email address.');
  });

  e2e('AC-B2-10: ES email label and hint exist', async () => {
    const { es: label } = getBothLocales(KEYS.email.label);
    const { es: hint } = getBothLocales(KEYS.email.hint);
    expect(label.length).toBeGreaterThan(0);
    expect(hint.length).toBeGreaterThan(0);
  });

  e2e('AC-B2-12: EN address label matches ticket requirement', async () => {
    const value = t('en', KEYS.address.label);
    expect(value).toBe('Company Street Address');
  });

  e2e('AC-B2-13: EN address hint matches ticket requirement', async () => {
    const value = t('en', KEYS.address.hint);
    expect(value).toBe('Enter your personal address if you do not have a separate company address.');
  });

  e2e('AC-B2-14: ES address label and hint exist', async () => {
    const { es: label } = getBothLocales(KEYS.address.label);
    const { es: hint } = getBothLocales(KEYS.address.hint);
    expect(label.length).toBeGreaterThan(0);
    expect(hint.length).toBeGreaterThan(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PART 2: UI renders i18n correctly (EN — default app language)
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-03: UI shows company name hint from i18n', async () => {
    const page = getPage();
    const section = page.locator(sel.companyNameSection);
    await expect(section).toContainText(t('en', KEYS.companyName.hint));
  });

  e2e('AC-B2-07: UI shows phone label from i18n', async () => {
    const page = getPage();
    const section = page.locator(sel.phoneSection);
    await expect(section).toContainText(t('en', KEYS.phone.label));
    await expect(section).toContainText(t('en', KEYS.phone.hint));
  });

  e2e('AC-B2-11: UI shows email label and hint from i18n', async () => {
    const page = getPage();
    const section = page.locator(sel.emailSection);
    await expect(section).toContainText(t('en', KEYS.email.label));
    await expect(section).toContainText(t('en', KEYS.email.hint));
  });

  e2e('AC-B2-15: UI shows address label and hint from i18n', async () => {
    const page = getPage();
    const section = page.locator(sel.addressSection);
    await expect(section).toContainText(t('en', KEYS.address.label));
    await expect(section).toContainText(t('en', KEYS.address.hint));
  });
});
