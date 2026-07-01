/**
 * Language Selector Factories — Verify, switch, and validate language state.
 *
 * Component: LanguageSelector.tsx (in AppHeader)
 * POM: header.pom.ts
 *
 * Provides factories for:
 *   - Verifying the selector is visible and shows the correct language
 *   - Opening/closing the dropdown
 *   - Switching language and verifying the UI updates
 *   - Verifying form labels match the expected locale
 *   - Verifying URL cleanup and localStorage persistence
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/header.pom';
import { pom as formPom } from '../pom/general-info.pom';
import { pom as detailsPom } from '../pom/details.pom';
import { t, type Locale } from '../fixtures/i18n';

// ─── Selectors (derived from POM) ──────────────────────────────────────────

const sel = {
  // Header / Language Selector
  selectorContext:  pom.app_header._.language_selector.$(),
  selectorActive:   pom.app_header._.language_selector.active.$(),
  selectorInactive: pom.app_header._.language_selector.inactive.$(),
  triggerButton:    pom.app_header._.language_selector._.language_trigger_button.$(),
  dropdown:         pom.app_header._.language_selector._.language_dropdown.$(),
  dropdownVisible:  pom.app_header._.language_selector._.language_dropdown.visible.$(),
  optionEN:         pom.app_header._.language_selector._.language_dropdown._.language_option_en_us.$(),
  optionES:         pom.app_header._.language_selector._.language_dropdown._.language_option_es_co.$(),
  // Form 1 sections (for label verification)
  nameSection:         formPom.lead_form._.name_section.$(),
  emailSection:        formPom.lead_form._.email_section.$(),
  companyNameSection:  formPom.lead_form._.company_name_section.$(),
  phoneSection:        formPom.lead_form._.phone_section.$(),
  submitButton:        formPom.lead_form._.submit_button.$(),
};

// ─── i18n Keys for verification ─────────────────────────────────────────────

const I18N_KEYS = {
  form1: {
    name: 'signUp.generalInfo.name.label',
    email: 'signUp.generalInfo.email.label',
    companyName: 'signUp.generalInfo.companyName.label',
    phone: 'signUp.generalInfo.phone.label',
    submitButton: 'signUp.generalInfo.submitButton',
  },
  form2: {
    position: 'signUp.details.position.label',
    companyType: 'signUp.details.companyType.label',
  },
};

// ─── Verification Factories ─────────────────────────────────────────────────

/**
 * Verify that the language selector is visible in the header.
 * Checks that the selector context and trigger button exist.
 */
export function verifyLanguageSelectorVisible(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await expect(page.locator(sel.selectorContext)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(sel.triggerButton)).toBeVisible();
  };
}

/**
 * Verify the selector trigger shows the expected language label.
 * @param expectedLabel - 'English' or 'Español'
 */
export function verifySelectedLanguage(getPage: () => Page, expectedLabel: string) {
  return async () => {
    const page = getPage();
    await expect(page.locator(sel.triggerButton)).toContainText(expectedLabel, { timeout: 10_000 });
  };
}

/**
 * Verify the dropdown is open and shows both language options with correct content.
 */
export function verifyLanguageDropdownOptions(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Dropdown should be visible
    await expect(page.locator(sel.dropdownVisible)).toBeVisible();
    // Both options exist
    const optEN = page.locator(sel.optionEN);
    const optES = page.locator(sel.optionES);
    await expect(optEN).toBeVisible();
    await expect(optES).toBeVisible();
    // Options contain native + english labels
    await expect(optEN).toContainText('English');
    await expect(optES).toContainText('Español');
    await expect(optES).toContainText('Spanish');
  };
}

/**
 * Verify the dropdown is closed (not visible).
 */
export function verifyDropdownClosed(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await expect(page.locator(sel.dropdown)).not.toBeVisible();
  };
}

// ─── Action Factories ───────────────────────────────────────────────────────

/**
 * Open the language selector dropdown.
 */
export function openLanguageSelector(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.locator(sel.triggerButton).click();
    await expect(page.locator(sel.dropdownVisible)).toBeVisible({ timeout: 3_000 });
  };
}

/**
 * Switch language by clicking the target option.
 * Assumes the dropdown is closed — opens it, selects, and waits for the switch.
 * @param targetLang - 'en-US' or 'es-CO'
 */
export function switchLanguage(getPage: () => Page, targetLang: 'en-US' | 'es-CO') {
  return async () => {
    const page = getPage();
    // Check if dropdown is already open, if not open it
    const dropdownVisible = page.locator(sel.dropdownVisible);
    const isOpen = await dropdownVisible.isVisible().catch(() => false);
    if (!isOpen) {
      await page.locator(sel.triggerButton).click();
      await expect(dropdownVisible).toBeVisible({ timeout: 3_000 });
    }
    // Click option
    const optionSel = targetLang === 'en-US' ? sel.optionEN : sel.optionES;
    await page.locator(optionSel).click();
    // Wait for dropdown to close
    await expect(page.locator(sel.dropdown)).not.toBeVisible({ timeout: 3_000 });
    // Wait for trigger to update
    const expectedLabel = targetLang === 'en-US' ? 'English' : 'Español';
    await expect(page.locator(sel.triggerButton)).toContainText(expectedLabel, { timeout: 10_000 });
  };
}

/**
 * Close the language selector dropdown via Escape key.
 */
export function closeLanguageSelectorWithEscape(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await expect(page.locator(sel.dropdownVisible)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(sel.dropdown)).not.toBeVisible({ timeout: 3_000 });
  };
}

// ─── i18n Text Verification Factories ───────────────────────────────────────

/**
 * Verify Form 1 (General Info) labels match the expected locale.
 * Checks: Name, Email, Company Name, Phone section labels + submit button.
 * @param locale - 'en' or 'es'
 */
export function verifyForm1Language(getPage: () => Page, locale: Locale) {
  return async () => {
    const page = getPage();
    const timeout = locale === 'es' ? 10_000 : 5_000; // ES loads from network

    await expect(page.locator(sel.nameSection)).toContainText(
      t(locale, I18N_KEYS.form1.name), { timeout },
    );
    await expect(page.locator(sel.emailSection)).toContainText(
      t(locale, I18N_KEYS.form1.email), { timeout },
    );
    await expect(page.locator(sel.companyNameSection)).toContainText(
      t(locale, I18N_KEYS.form1.companyName), { timeout },
    );
    await expect(page.locator(sel.phoneSection)).toContainText(
      t(locale, I18N_KEYS.form1.phone), { timeout },
    );
    await expect(page.locator(sel.submitButton)).toContainText(
      t(locale, I18N_KEYS.form1.submitButton), { timeout },
    );
  };
}

/**
 * Verify Form 2 (Details) labels match the expected locale.
 * Checks position and company type section labels.
 * @param locale - 'en' or 'es'
 */
export function verifyForm2Language(getPage: () => Page, locale: Locale) {
  return async () => {
    const page = getPage();
    const timeout = locale === 'es' ? 10_000 : 5_000;

    // Form 2 selectors from details POM
    const positionSection = detailsPom.registration_form._.position_section.$();
    const companyTypeSection = detailsPom.registration_form._.company_type_section.$();

    await expect(page.locator(positionSection)).toContainText(
      t(locale, I18N_KEYS.form2.position), { timeout },
    );
    await expect(page.locator(companyTypeSection)).toContainText(
      t(locale, I18N_KEYS.form2.companyType), { timeout },
    );
  };
}

// ─── URL and localStorage Verification ──────────────────────────────────────

/**
 * Verify that ?lang= parameter has been cleaned from the URL.
 */
export function verifyUrlClean(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const url = page.url();
    expect(url).not.toContain('?lang=');
    expect(url).not.toContain('&lang=');
  };
}

/**
 * Verify that the language was persisted to localStorage.
 * @param expectedCode - e.g. 'en-US' or 'es-CO'
 */
export function verifyLanguagePersisted(getPage: () => Page, expectedCode: string) {
  return async () => {
    const page = getPage();
    const stored = await page.evaluate(() => localStorage.getItem('enrollment_language'));
    expect(stored).toBe(expectedCode);
  };
}
