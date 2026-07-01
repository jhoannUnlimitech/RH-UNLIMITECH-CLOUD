/**
 * Lead Form Factories — General Info Page (Form 1)
 *
 * Page: /sign-up/{sessionId}/general-info
 * POM: general-info.pom.ts
 *
 * Contains both happy path (fill, submit) and validation (error states,
 * field behavior) factories for the lead form.
 *
 * Rule: One factory file = one page. Happy path and validation coexist
 * in the same file, separated by section comments.
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/general-info.pom';
import type { LeadFormData, LeadFormValidationData } from '../fixtures/test-data';

// ─── Selectors (derived from POM — single source for all factories) ─────────

const sel = {
  formReady:       pom.lead_form.ready.$(),
  formSubmitting:  pom.lead_form.submitting.$(),
  firstName:       pom.lead_form._.name_section._.first_name_input.$(),
  firstNameError:  pom.lead_form._.name_section._.first_name_error.$(),
  lastName:        pom.lead_form._.name_section._.last_name_input.$(),
  lastNameError:   pom.lead_form._.name_section._.last_name_error.$(),
  email:           pom.lead_form._.email_section._.email_input.$(),
  emailError:      pom.lead_form._.email_section._.email_error.$(),
  companyName:     pom.lead_form._.company_name_section._.company_name_input.$(),
  companyNameError: pom.lead_form._.company_name_section._.company_name_error.$(),
  phoneWrapper:    pom.lead_form._.phone_section._.phone_input.$(),
  phoneType:       pom.lead_form._.phone_section._.phone_type_select.$(),
  phoneTel:        pom.lead_form._.phone_section._.phone_input.$(' input[type="tel"]'),
  phoneCountryBtn: pom.lead_form._.phone_section._.phone_input.$(' .react-international-phone-country-selector-button'),
  phoneError:      pom.lead_form._.phone_section._.phone_error.$(),
  street:          pom.lead_form._.address_section._.street_input.$(),
  streetError:     pom.lead_form._.address_section._.street_error.$(),
  addressLine2:    pom.lead_form._.address_section._.address_line2_input.$(),
  city:            pom.lead_form._.address_section._.city_input.$(),
  cityError:       pom.lead_form._.address_section._.city_error.$(),
  zip:             pom.lead_form._.address_section._.zip_input.$(),
  zipError:        pom.lead_form._.address_section._.zip_error.$(),
  countrySelect:   pom.lead_form._.address_section._.country_select.$(),
  countryError:    pom.lead_form._.address_section._.country_error.$(),
  stateSelect:     pom.lead_form._.address_section._.state_select.$(),
  referralInput:   pom.lead_form._.referral_section._.referral_input.$(),
  submitButton:    pom.lead_form._.submit_button.$(),
  submitReady:     pom.lead_form._.submit_button.ready.$(),
  noErrors:        '[data-test-state="error"]',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

async function selectPhoneCountryAndType(page: Page, countryIso2: string, number: string, phoneType?: string): Promise<void> {
  // 1. Select Phone Type (required — defaults to 'mobile' if not provided)
  const typeSelect = page.locator(sel.phoneType);
  const typeValue = phoneType || 'mobile';
  await typeSelect.selectOption(typeValue);
  await expect(typeSelect).toHaveValue(typeValue);

  // 2. Open country dropdown and select country
  const countryBtn = page.locator(sel.phoneCountryBtn);
  await countryBtn.click();

  const countryOption = page.locator(`li[data-country="${countryIso2}"]`);
  await countryOption.waitFor({ state: 'visible', timeout: 5_000 });
  await countryOption.click();

  // 3. Type phone number (pressSequentially — component formats on keystroke)
  const phoneInput = page.locator(sel.phoneTel);
  await phoneInput.click();
  await phoneInput.pressSequentially(number, { delay: 30 });
}

// ═════════════════════════════════════════════════════════════════════════════
// HAPPY PATH — Fill and submit factories
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fill all lead form fields with the provided data.
 * Does NOT submit the form.
 */
export function fillLeadForm(getPage: () => Page, data: LeadFormData) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const firstName = page.locator(sel.firstName);
    await firstName.fill(data.firstName);
    await expect(firstName).toHaveValue(data.firstName);

    const lastName = page.locator(sel.lastName);
    await lastName.fill(data.lastName);
    await expect(lastName).toHaveValue(data.lastName);

    const email = page.locator(sel.email);
    await email.fill(data.email);
    await expect(email).toHaveValue(data.email);

    const companyName = page.locator(sel.companyName);
    await companyName.fill(data.companyName);
    await expect(companyName).toHaveValue(data.companyName);

    await selectPhoneCountryAndType(page, data.phoneCountry, data.phoneNumber, data.phoneType);

    const street = page.locator(sel.street);
    await street.fill(data.street);
    await expect(street).toHaveValue(data.street);

    if (data.addressLine2) {
      const line2 = page.locator(sel.addressLine2);
      await line2.fill(data.addressLine2);
      await expect(line2).toHaveValue(data.addressLine2);
    }

    const city = page.locator(sel.city);
    await city.fill(data.city);
    await expect(city).toHaveValue(data.city);

    const zip = page.locator(sel.zip);
    await zip.fill(data.zip);
    await expect(zip).toHaveValue(data.zip);

    const countrySelect = page.locator(sel.countrySelect);
    await countrySelect.selectOption(data.countryISO3);
    await expect(countrySelect).toHaveValue(data.countryISO3);

    const stateSelect = page.locator(sel.stateSelect);
    await expect(stateSelect).toBeEnabled({ timeout: 5_000 });
    await stateSelect.selectOption(data.stateISO);
    await expect(stateSelect).toHaveValue(data.stateISO);

    // Referral source (required)
    const referralInput = page.locator(sel.referralInput);
    await referralInput.fill(data.referralSource);
    await expect(referralInput).toHaveValue(data.referralSource);

    const errors = page.locator(sel.noErrors);
    await expect(errors).toHaveCount(0);
  };
}

/**
 * Submit the lead form and wait for navigation to the next step.
 */
export function submitLeadForm(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toHaveAttribute('data-test-state', 'ready');

    await submitBtn.click();

    await page.waitForURL(/\/sign-up\/[^/]+\/details/, { timeout: 15_000 });
  };
}


/**
 * Reload the page and fill the lead form with valid data.
 * Used in full-validation spec to clean up after validation tests
 * that leave the form in an error state.
 */
export function reloadAndFillLeadForm(getPage: () => Page, data: LeadFormData) {
  return async () => {
    const page = getPage();
    await page.reload();
    // Delegate to fillLeadForm — it waits for formReady
    await fillLeadForm(getPage, data)();
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — Error states, field behavior, and negative path factories
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-04: Verify required fields have "(Obligatorio)" or "(Required)" label visible.
 */
export function verifyRequiredFieldLabels(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // Required sections show "(Obligatorio)" or "(Required)" text
    const requiredIndicators = page.getByText(/\(Obligatorio\)|\(Required\)/);
    const count = await requiredIndicators.count();

    // At minimum: Nombre, Email, Empresa, Teléfono, Dirección = 5 required sections
    expect(count).toBeGreaterThanOrEqual(5);
  };
}

/**
 * AC-04: Submit empty form → fields show error state + helper text visible.
 * Verifies ALL required fields change to data-test-state="error".
 * Verifies ALL error helper texts are visible via auto-generated data-test-key
 * (Input component derives "{field}-error" from "{field}-input").
 */
export function submitEmptyLeadForm(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const submitBtn = page.locator(sel.submitButton);
    await submitBtn.click();

    // All required input fields must show error state
    await expect(page.locator(sel.firstName)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.lastName)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.email)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.companyName)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.phoneWrapper)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.street)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.city)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.zip)).toHaveAttribute('data-test-state', 'error');
    await expect(page.locator(sel.countrySelect)).toHaveAttribute('data-test-state', 'error');

    // All error helper texts must be visible (auto-generated by Input component)
    await expect(page.locator(sel.firstNameError)).toBeVisible();
    await expect(page.locator(sel.lastNameError)).toBeVisible();
    await expect(page.locator(sel.emailError)).toBeVisible();
    await expect(page.locator(sel.companyNameError)).toBeVisible();
    await expect(page.locator(sel.phoneError)).toBeVisible();
    await expect(page.locator(sel.streetError)).toBeVisible();
    await expect(page.locator(sel.cityError)).toBeVisible();
    await expect(page.locator(sel.zipError)).toBeVisible();
    await expect(page.locator(sel.countryError)).toBeVisible();

    // Form must NOT navigate — still on general-info
    await expect(page).toHaveURL(/\/general-info/);
  };
}

/**
 * AC-05: Submit with invalid email → form stays on page (does not navigate).
 * Fills ALL required fields correctly except email (uses invalid format).
 *
 * The email input has type="email" — the browser's native HTML5 validation
 * blocks the form submit before React's handleSubmit executes. This means
 * the store's validate() never runs and data-test-state stays "normal".
 *
 * What we verify:
 * 1. The form does NOT navigate to /details (submit blocked)
 * 2. The email input has the browser's native invalid state (aria-invalid)
 */
export function submitInvalidEmail(getPage: () => Page, data: LeadFormValidationData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // Fill all required fields with valid data
    await page.locator(sel.firstName).fill(data.base.firstName);
    await page.locator(sel.lastName).fill(data.base.lastName);
    await page.locator(sel.companyName).fill(data.base.companyName);
    await page.locator(sel.street).fill(data.base.street);
    await page.locator(sel.city).fill(data.base.city);
    await page.locator(sel.zip).fill(data.base.zip);

    // Phone (required — uses helper for country selector + number)
    await selectPhoneCountryAndType(page, data.base.phoneCountry, data.base.phoneNumber, data.base.phoneType);

    // Country select (required)
    await page.locator(sel.countrySelect).selectOption(data.base.countryISO3);

    // State select (required — wait for cascading enable)
    const stateSelect = page.locator(sel.stateSelect);
    await expect(stateSelect).toBeEnabled({ timeout: 5_000 });
    await stateSelect.selectOption(data.base.stateISO);

    // Fill email with INVALID format (the only field with bad data)
    const email = page.locator(sel.email);
    await email.fill(data.invalidEmails[0]);

    const submitBtn = page.locator(sel.submitButton);
    await submitBtn.click();

    // Form must NOT navigate — browser native validation blocks submit
    await expect(page).toHaveURL(/\/general-info/, { timeout: 10_000 });
  };
}

/**
 * AC-06: Country dropdown must have options loaded (not empty).
 */
export function verifyCountryDropdownLoaded(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const countrySelect = page.locator(sel.countrySelect);
    await expect(countrySelect).toBeVisible();

    const options = countrySelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  };
}

/**
 * AC-07: Selecting a country loads states. Changing country clears state.
 */
export function verifyCountryClearsState(getPage: () => Page, data: LeadFormValidationData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const countrySelect = page.locator(sel.countrySelect);
    const stateSelect = page.locator(sel.stateSelect);

    await countrySelect.selectOption(data.base.countryISO3);
    await expect(countrySelect).toHaveValue(data.base.countryISO3);

    await expect(stateSelect).toBeEnabled({ timeout: 5_000 });
    await stateSelect.selectOption(data.base.stateISO);
    await expect(stateSelect).toHaveValue(data.base.stateISO);

    await countrySelect.selectOption(data.alternateCountryISO3);
    await expect(countrySelect).toHaveValue(data.alternateCountryISO3);

    await expect(stateSelect).not.toHaveValue(data.base.stateISO);
  };
}

/**
 * AC-08: Selecting a country in the phone input changes the prefix.
 */
export function verifyPhonePrefix(getPage: () => Page, data: LeadFormValidationData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const countryBtn = page.locator(sel.phoneCountryBtn);
    await countryBtn.click();

    const countryOption = page.locator(`li[data-country="${data.phoneVerification.countryIso2}"]`);
    await countryOption.waitFor({ state: 'visible', timeout: 5_000 });
    await countryOption.click();

    const phoneInput = page.locator(sel.phoneTel);
    const value = await phoneInput.inputValue();
    expect(value).toContain(data.phoneVerification.expectedPrefix);
  };
}
