/**
 * Registration Form Factories — Reusable test steps for the registration (Details) form.
 *
 * Each factory receives getPage and returns an async function directly usable as:
 *   e2e('description', fillRegistrationForm(getPage, data))
 *
 * Based on curated playbook: e2e/playbooks/registration-form-fill.md
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/details.pom';
import type { RegistrationFormData } from '../fixtures/test-data';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalize a value to kebab-case (matches normalizeTestAttr in the app) */
function kebab(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const rf = pom.registration_form;

const sel = {
  formReady:        rf.ready.$(),
  formSubmitting:   rf.submitting.$(),

  // Company selects
  positionSelect:   rf._.position_section._.position_select.$(),
  companyTypeSelect: rf._.company_type_section._.company_type_select.$(),
  industrySelect:   rf._.industry_size_section._.industry_select.$(),
  companySizeSelect: rf._.company_size_select.$(),

  // Website + Founded
  companyWebsite:   rf._.website_section._.company_website_0.$(),
  companyFounded:   rf._.company_founded_section._.company_founded_input.$(),

  // Alternate phone (third-party component)
  altPhoneWrapper:    rf._.alternate_phone_section._.alternate_phone_input.$(),
  altPhoneType:       rf._.alternate_phone_section._.alternate_phone_type_select.$(),
  altPhoneTel:        rf._.alternate_phone_section._.alternate_phone_input.$(' input[type="tel"]'),
  altPhoneCountryBtn: rf._.alternate_phone_section._.alternate_phone_input.$(' .react-international-phone-country-selector-button'),

  // Radios — must use context to disambiguate radio-automatic
  prosperityAutomatic: rf._.membership_preferences_prosperity_planner_section._.radio_automatic.$(),
  prosperityOnRequest: rf._.membership_preferences_prosperity_planner_section._.radio_on_request.$(),
  prosperityDoNotShip: rf._.membership_preferences_prosperity_planner_section._.radio_do_not_ship.$(),
  hcaAutomatic:        rf._.membership_preferences_hca_booklets_section._.radio_automatic.$(),
  hcaOnRequest:        rf._.membership_preferences_hca_booklets_section._.radio_on_request.$(),
  hcaDoNotShip:        rf._.membership_preferences_hca_booklets_section._.radio_do_not_ship.$(),

  // Interests checkboxes (context for scoping)
  interestsCtx:     rf._.membership_preferences_interests_section.$(),

  // Email newsletters checkboxes (context for scoping)
  emailNewslettersCtx: rf._.membership_preferences_email_newsletters_section.$(),

  // Personal address
  personalStreet:   rf._.personal_address_section._.personal_street_input.$(),
  personalLine2:    rf._.personal_address_section._.personal_line2_input.$(),
  personalCity:     rf._.personal_address_section._.personal_city_input.$(),
  personalZip:      rf._.personal_address_section._.personal_zip_input.$(),
  personalCountry:  rf._.personal_address_section._.personal_country_select.$(),
  personalState:    rf._.personal_address_section._.personal_state_select.$(),

  // Personal profile
  birthYear:        rf._.birth_year_section._.birth_year_input.$(),
  educationSelect:  rf._.education_section._.education_select.$(),
  educationDetails: rf._.education_section._.education_details_input.$(),
  preferredLang:    rf._.preferred_language_select.$(),
  secondaryLang:    rf._.secondary_language_select.$(),

  // Buttons
  backButton:       rf._.back_button.$(),
  submitButton:     rf._.submit_button.$(),
  submitReady:      rf._.submit_button.ready.$(),

  // Billing address
  billingSection:       rf._.billing_address_section.$(),
  billingSameAsCompany: rf._.billing_address_section._.same_as_company_checkbox.$(),
  billingStreet:        rf._.billing_address_section._.billing_street_input.$(),
  billingLine2:         rf._.billing_address_section._.billing_line2_input.$(),
  billingCity:          rf._.billing_address_section._.billing_city_input.$(),
  billingZip:           rf._.billing_address_section._.billing_zip_input.$(),
  billingCountry:       rf._.billing_address_section._.billing_country_select.$(),
  billingState:         rf._.billing_address_section._.billing_state_select.$(),

  noErrors:         '[data-test-state="error"]',
};

// ─── Radio value → selector map ─────────────────────────────────────────────

const PROSPERITY_RADIO: Record<string, string> = {
  on_request:   sel.prosperityOnRequest,
  automatic:    sel.prosperityAutomatic,
  do_not_ship:  sel.prosperityDoNotShip,
};

const HCA_RADIO: Record<string, string> = {
  automatic:    sel.hcaAutomatic,
  on_request:   sel.hcaOnRequest,
  do_not_ship:  sel.hcaDoNotShip,
};

// ─── Phone Helper (same pattern as lead form) ───────────────────────────────

async function selectAltPhoneCountryAndType(page: Page, countryIso2: string, number: string, phoneType?: string): Promise<void> {
  // 1. Select Additional Phone Type (required)
  const typeSelect = page.locator(sel.altPhoneType);
  const typeValue = phoneType || 'mobile';
  await typeSelect.selectOption(typeValue);
  await expect(typeSelect).toHaveValue(typeValue);

  // 2. Open country dropdown and select country
  const countryBtn = page.locator(sel.altPhoneCountryBtn);
  await countryBtn.click();

  const countryOption = page.locator(`li[data-country="${countryIso2}"]`);
  await countryOption.waitFor({ state: 'visible', timeout: 5_000 });
  await countryOption.click();

  // 3. Type phone number
  const phoneInput = page.locator(sel.altPhoneTel);
  await phoneInput.click();
  await phoneInput.pressSequentially(number, { delay: 30 });
}

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * Fill all registration form fields with the provided data.
 * Does NOT submit the form.
 */
export function fillRegistrationForm(getPage: () => Page, data: RegistrationFormData) {
  return async () => {
    const page = getPage();

    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // ── Steps 1-4: Company selects ──
    const positionSelect = page.locator(sel.positionSelect);
    await positionSelect.selectOption(data.position);
    await expect(positionSelect).toHaveValue(data.position);

    const companyTypeSelect = page.locator(sel.companyTypeSelect);
    await companyTypeSelect.selectOption(data.companyType);
    await expect(companyTypeSelect).toHaveValue(data.companyType);

    // If company type is "other", fill the details field
    if (data.companyType === 'other' && data.companyTypeOther) {
      const companyTypeOtherInput = page.locator(rf._.company_type_section._.company_type_other_input.$());
      await expect(companyTypeOtherInput).toBeVisible({ timeout: 3_000 });
      await companyTypeOtherInput.fill(data.companyTypeOther);
      await expect(companyTypeOtherInput).toHaveValue(data.companyTypeOther);
    }

    const industrySelect = page.locator(sel.industrySelect);
    await industrySelect.selectOption(data.industry);
    await expect(industrySelect).toHaveValue(data.industry);

    // If industry is "other", fill the details field
    if (data.industry === 'other' && data.industryOther) {
      const industryOtherInput = page.locator(rf._.industry_size_section._.industry_other_input.$());
      await expect(industryOtherInput).toBeVisible({ timeout: 3_000 });
      await industryOtherInput.fill(data.industryOther);
      await expect(industryOtherInput).toHaveValue(data.industryOther);
    }

    const companySizeSelect = page.locator(sel.companySizeSelect);
    await companySizeSelect.selectOption(data.companySize);
    await expect(companySizeSelect).toHaveValue(data.companySize);

    // ── Step 5: Company Website (required — unless "no website" checked) ──
    if (data.noWebsite) {
      // Check the "no website" checkbox — skips URL fields
      const noWebsiteCheckbox = page.locator(rf._.website_section._.no_website_checkbox.$());
      await noWebsiteCheckbox.check();
      await expect(noWebsiteCheckbox).toBeChecked();
    } else if (data.companyWebsites && data.companyWebsites.length > 0) {
      // Repeatable field — fill first URL
      // Note: Field auto-prepends "https://" on focus, so we clear first to avoid
      // double-prefix ("https://https://...") when Playwright's .fill() triggers focus.
      const websiteInput = page.locator(sel.companyWebsite);
      await websiteInput.clear();
      await websiteInput.fill(data.companyWebsites[0]);
      const expectedUrl0 = data.companyWebsites[0].startsWith('https://')
        ? data.companyWebsites[0]
        : `https://${data.companyWebsites[0]}`;
      await expect(websiteInput).toHaveValue(expectedUrl0);

      // Add additional URLs (up to 5)
      const addBtn = page.locator(rf._.website_section._.company_website_add_button.$());
      for (let i = 1; i < data.companyWebsites.length; i++) {
        await addBtn.click();
        const field = page.locator(rf._.website_section.$() + ` [data-test-key="company-website-${i}"]`);
        await expect(field).toBeVisible();
        await field.clear();
        await field.fill(data.companyWebsites[i]);
        const expectedUrlI = data.companyWebsites[i].startsWith('https://')
          ? data.companyWebsites[i]
          : `https://${data.companyWebsites[i]}`;
        await expect(field).toHaveValue(expectedUrlI);
      }
    } else {
      // Single website (backward compat)
      // Note: Field auto-prepends "https://" on focus, so we clear first.
      const websiteInput = page.locator(sel.companyWebsite);
      const rawWebsite = data.companyWebsite || 'https://example.com';
      await websiteInput.clear();
      await websiteInput.fill(rawWebsite);
      const expectedWebsite = rawWebsite.startsWith('https://')
        ? rawWebsite
        : `https://${rawWebsite}`;
      await expect(websiteInput).toHaveValue(expectedWebsite);
    }

    // ── Step 6: Company Founded ──
    const foundedInput = page.locator(sel.companyFounded);
    await foundedInput.fill(data.companyFounded);
    await expect(foundedInput).toHaveValue(data.companyFounded);

    // ── Steps 7-8: Alternate Phone (optional) ──
    if (data.altPhoneCountry && data.altPhoneNumber) {
      await selectAltPhoneCountryAndType(page, data.altPhoneCountry, data.altPhoneNumber, data.altPhoneType);
    }

    // ── Step 8b: Billing Address (optional — only when different from company) ──
    if (data.billingSameAsCompany === false) {
      const billingCheckbox = page.locator(rf._.billing_address_section._.same_as_company_checkbox.$());
      await billingCheckbox.uncheck();
      await expect(billingCheckbox).not.toBeChecked();

      if (data.billingStreet) {
        const billingStreet = page.locator(rf._.billing_address_section._.billing_street_input.$());
        await billingStreet.fill(data.billingStreet);
        await expect(billingStreet).toHaveValue(data.billingStreet);
      }
      if (data.billingLine2) {
        const billingLine2 = page.locator(rf._.billing_address_section._.billing_line2_input.$());
        await billingLine2.fill(data.billingLine2);
        await expect(billingLine2).toHaveValue(data.billingLine2);
      }
      if (data.billingCity) {
        const billingCity = page.locator(rf._.billing_address_section._.billing_city_input.$());
        await billingCity.fill(data.billingCity);
        await expect(billingCity).toHaveValue(data.billingCity);
      }
      if (data.billingZip) {
        const billingZip = page.locator(rf._.billing_address_section._.billing_zip_input.$());
        await billingZip.fill(data.billingZip);
        await expect(billingZip).toHaveValue(data.billingZip);
      }
      if (data.billingCountryISO3) {
        const billingCountry = page.locator(rf._.billing_address_section._.billing_country_select.$());
        await billingCountry.selectOption(data.billingCountryISO3);
        await expect(billingCountry).toHaveValue(data.billingCountryISO3);
      }
      if (data.billingStateISO) {
        const billingState = page.locator(rf._.billing_address_section._.billing_state_select.$());
        await expect(billingState).toBeEnabled({ timeout: 5_000 });
        await billingState.selectOption(data.billingStateISO);
        await expect(billingState).toHaveValue(data.billingStateISO);
      }
    }

    // ── Step 9: Prosperity Planner Radio ──
    const prosperityRadio = page.locator(PROSPERITY_RADIO[data.prosperityPlanner]);
    await prosperityRadio.check();
    await expect(prosperityRadio).toBeChecked();

    // ── Step 10: HCA Booklets Radio ──
    const hcaRadio = page.locator(HCA_RADIO[data.hcaBooklets]);
    await hcaRadio.check();
    await expect(hcaRadio).toBeChecked();

    // ── Steps 11-13: Interests Checkboxes ──
    for (const interest of data.interests) {
      const checkbox = page.locator(`${sel.interestsCtx} [data-test-key="checkbox-${kebab(interest)}"]`);
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }

    // ── Steps 14-16: Email Newsletters Checkboxes ──
    for (const newsletter of data.emailNewsletters) {
      const checkbox = page.locator(`${sel.emailNewslettersCtx} [data-test-key="checkbox-${kebab(newsletter)}"]`);
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }

    // ── Steps 17-20: Personal Address Inputs ──
    if (data.personalStreet) {
      const streetInput = page.locator(sel.personalStreet);
      await streetInput.fill(data.personalStreet);
      await expect(streetInput).toHaveValue(data.personalStreet);
    }

    if (data.personalLine2) {
      const line2Input = page.locator(sel.personalLine2);
      await line2Input.fill(data.personalLine2);
      await expect(line2Input).toHaveValue(data.personalLine2);
    }

    if (data.personalCity) {
      const cityInput = page.locator(sel.personalCity);
      await cityInput.fill(data.personalCity);
      await expect(cityInput).toHaveValue(data.personalCity);
    }

    if (data.personalZip) {
      const zipInput = page.locator(sel.personalZip);
      await zipInput.fill(data.personalZip);
      await expect(zipInput).toHaveValue(data.personalZip);
    }

    // ── Step 21: Personal Country Select ──
    if (data.personalCountryISO3) {
      const countrySelect = page.locator(sel.personalCountry);
      await countrySelect.selectOption(data.personalCountryISO3);
      await expect(countrySelect).toHaveValue(data.personalCountryISO3);
    }

    // ── Step 22: Personal State Select (cascading — wait for enable) ──
    if (data.personalStateISO) {
      const stateSelect = page.locator(sel.personalState);
      await expect(stateSelect).toBeEnabled({ timeout: 5_000 });
      await stateSelect.selectOption(data.personalStateISO);
      await expect(stateSelect).toHaveValue(data.personalStateISO);
    }

    // ── Step 23: Profile Photo Upload (optional) ──
    if (data.profilePhotoPath) {
      const photoInput = page.locator(rf._.profile_photo_section._.profile_photo_input.$());
      await photoInput.setInputFiles(data.profilePhotoPath);
      // Wait for upload to complete (preview appears)
      const photoPreview = page.locator(rf._.profile_photo_section._.profile_photo_preview.$());
      await expect(photoPreview).toBeVisible({ timeout: 30_000 });
    }

    // ── Step 24: Birth Year ──
    if (data.birthYear) {
      const birthYearInput = page.locator(sel.birthYear);
      await birthYearInput.fill(data.birthYear);
      await expect(birthYearInput).toHaveValue(data.birthYear);
    }

    // ── Step 25: Education Select ──
    const educationSelect = page.locator(sel.educationSelect);
    await educationSelect.selectOption(data.education);
    await expect(educationSelect).toHaveValue(data.education);

    // ── Step 25b: Education Details (required for most education levels) ──
    if (data.educationDetails && data.education !== 'high_school_ged' && data.education !== 'no_high_school_diploma') {
      const detailsInput = page.locator(sel.educationDetails);
      await detailsInput.waitFor({ state: 'visible', timeout: 5_000 });
      await detailsInput.fill(data.educationDetails);
      await expect(detailsInput).toHaveValue(data.educationDetails);
    }

    // ── Step 26: Preferred Language Select ──
    const preferredLang = page.locator(sel.preferredLang);
    await preferredLang.selectOption(data.preferredLanguageISO);
    await expect(preferredLang).toHaveValue(data.preferredLanguageISO);

    // ── Step 27: Secondary Language Select (optional) ──
    if (data.secondaryLanguageISO) {
      const secondaryLang = page.locator(sel.secondaryLang);
      await secondaryLang.selectOption(data.secondaryLanguageISO);
      await expect(secondaryLang).toHaveValue(data.secondaryLanguageISO);
    }

    // ── Verify no validation errors ──
    const errors = page.locator(sel.noErrors);
    await expect(errors).toHaveCount(0);
  };
}

/**
 * Submit the registration form and wait for navigation to the thank-you page.
 * v3 flow: registration submit → /thank-you (email verification prompt).
 */
export function submitRegistrationForm(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toHaveAttribute('data-test-state', 'ready');

    await submitBtn.click();

    await page.waitForURL(/\/sign-up\/[^/]+\/(plan|thank-you)/, { timeout: 15_000 });
  };
}

/**
 * Submit the registration form and wait for navigation to plan selection.
 * v4 flow: registration submit → /plan (plan selection is step 3).
 */
export function submitRegistrationFormV4(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toHaveAttribute('data-test-state', 'ready');

    await submitBtn.click();

    await page.waitForURL(/\/sign-up\/[^/]+\/plan/, { timeout: 15_000 });
  };
}

/**
 * Reload the page and fill the registration form with valid data.
 * Used in full-validation spec to clean up after validation tests
 * that leave the form in an error state.
 */
export function reloadAndFillRegistrationForm(getPage: () => Page, data: RegistrationFormData) {
  return async () => {
    const page = getPage();
    await page.reload();
    await fillRegistrationForm(getPage, data)();
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — Error states, field behavior, negative path
// ═════════════════════════════════════════════════════════════════════════════

import type { RegistrationValidationData } from '../fixtures/test-data';

// ─── Shipping selectors (used in validation) ────────────────────────────────

const shippingSel = {
  sameAsBilling:    rf._.shipping_address_section._.same_as_billing_checkbox.$(),
  shippingStreet:   rf._.shipping_address_section._.shipping_street_input.$(),
  shippingLine2:    rf._.shipping_address_section._.shipping_line2_input.$(),
  shippingCity:     rf._.shipping_address_section._.shipping_city_input.$(),
  shippingZip:      rf._.shipping_address_section._.shipping_zip_input.$(),
  shippingCountry:  rf._.shipping_address_section._.shipping_country_select.$(),
  shippingState:    rf._.shipping_address_section._.shipping_state_select.$(),
};

// ─── Error selectors (used in validation) ────────────────────────────────────

const errSel = {
  positionError:    rf._.position_section._.position_error.$(),
  companyTypeError: rf._.company_type_section._.company_type_error.$(),
  industryError:    rf._.industry_size_section._.industry_error.$(),
  companySizeError: rf._.company_size_error.$(),
  foundedError:     rf._.company_founded_section._.company_founded_error.$(),
  birthYearError:   rf._.birth_year_section._.birth_year_error.$(),
  educationError:   rf._.education_section._.education_error.$(),
  prosperityError:  rf._.membership_preferences_prosperity_planner_section._.group_error.$(),
  hcaError:         rf._.membership_preferences_hca_booklets_section._.group_error.$(),
  interestsError:   rf._.membership_preferences_interests_section._.group_error.$(),
  newslettersError: rf._.membership_preferences_email_newsletters_section._.group_error.$(),
};

/**
 * AC-09: Verify professional profile dropdowns + education + languages have options loaded.
 */
export function verifyDropdownsLoaded(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // Professional profile
    expect(await page.locator(sel.positionSelect).locator('option').count()).toBeGreaterThan(1);
    expect(await page.locator(sel.companyTypeSelect).locator('option').count()).toBeGreaterThan(1);
    expect(await page.locator(sel.industrySelect).locator('option').count()).toBeGreaterThan(10);
    expect(await page.locator(sel.companySizeSelect).locator('option').count()).toBeGreaterThan(1);

    // Education
    expect(await page.locator(sel.educationSelect).locator('option').count()).toBeGreaterThan(1);

    // Languages
    expect(await page.locator(sel.preferredLang).locator('option').count()).toBeGreaterThan(10);
    expect(await page.locator(sel.secondaryLang).locator('option').count()).toBeGreaterThan(10);
  };
}

/**
 * AC-10: Company Founded — year field validation.
 *
 * Validates that the field:
 * 1. Filters non-numeric input (setYear strips non-digits) — 'abcd' → empty
 * 2. Filters mixed alphanumeric (setYear keeps only digits) — '20ab' → '20'
 * 3. Limits to 4 digits max — '19901' → '1990'
 * 4. Rejects a future year on submit (e.g. '2030') — shows error state + helper text
 * 5. Rejects too-short year on submit (e.g. '90') — shows error state + helper text
 * 6. Accepts a valid 4-digit year (e.g. '2020') — no error state
 *
 * Tests 1-3 verify the setYear input filter (client-side, immediate).
 * Tests 4-5 verify the store validation (triggered on submit).
 * Test 6 verifies the happy path.
 *
 * Pre-condition: All other required fields must be filled to isolate the
 * founded field error. This factory fills the minimum required fields first.
 */
export function verifyCompanyFoundedValidation(getPage: () => Page, data: RegistrationValidationData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const foundedInput = page.locator(sel.companyFounded);
    const foundedError = page.locator(errSel.foundedError);
    const submitBtn = page.locator(sel.submitButton);

    // ── Fill minimum required fields (except founded) to isolate validation ──
    await page.locator(sel.positionSelect).selectOption(data.base.position);
    await page.locator(sel.companyTypeSelect).selectOption(data.base.companyType);
    await page.locator(sel.industrySelect).selectOption(data.base.industry);
    if (data.base.industry === 'other' && data.base.industryOther) {
      await page.locator(rf._.industry_size_section._.industry_other_input.$()).fill(data.base.industryOther);
    }
    await page.locator(sel.companySizeSelect).selectOption(data.base.companySize);
    await page.locator(PROSPERITY_RADIO[data.base.prosperityPlanner]).check();
    await page.locator(HCA_RADIO[data.base.hcaBooklets]).check();
    const interestsCtx = pom.registration_form._.membership_preferences_interests_section;
    await page.locator(interestsCtx._.checkbox_mastertech_software.$()).check();
    const newslettersCtx = pom.registration_form._.membership_preferences_email_newsletters_section;
    await page.locator(newslettersCtx._.checkbox_church_events.$()).check();
    await page.locator(sel.educationSelect).selectOption(data.base.education);
    await page.locator(sel.preferredLang).selectOption(data.base.preferredLanguageISO);

    // ── Test 1: Non-numeric text is filtered out by setYear ──
    // setYear strips non-digits: 'abcd' → ''
    await foundedInput.fill(data.nonNumericYear);
    await expect(foundedInput).toHaveValue('');

    // ── Test 2: Mixed alphanumeric keeps only digits ──
    // setYear: '20ab' → '20'
    await foundedInput.fill(data.mixedAlphanumericYear);
    await expect(foundedInput).toHaveValue('20');

    // ── Test 3: Long input is truncated to 4 digits ──
    // setYear: '19901' → '1990'
    await foundedInput.fill(data.longYear);
    await expect(foundedInput).toHaveValue(data.longYear.slice(0, 4));

    // ── Test 4: Future year → error on submit ──
    await foundedInput.fill(data.futureBirthYear);
    await expect(foundedInput).toHaveValue(data.futureBirthYear);
    await submitBtn.click();
    await expect(page).toHaveURL(/\/details/);
    await expect(foundedInput).toHaveAttribute('data-test-state', 'error');
    await expect(foundedError).toBeVisible({ timeout: 5_000 });

    // ── Test 5: Too short (2 digits) → error on submit ──
    await foundedInput.fill(data.shortYear);
    await expect(foundedInput).toHaveValue(data.shortYear);
    await submitBtn.click();
    await expect(page).toHaveURL(/\/details/);
    await expect(foundedInput).toHaveAttribute('data-test-state', 'error');
    await expect(foundedError).toBeVisible();

    // ── Test 6: Valid 4-digit year → no error ──
    await foundedInput.fill(data.validFoundedYear);
    await expect(foundedInput).toHaveValue(data.validFoundedYear);
    await expect(foundedInput).toHaveAttribute('data-test-state', 'normal');
  };
}

/**
 * AC-11: Shipping address toggle + fields visible + country→state cascading.
 */
export function verifyShippingAddressToggle(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const sameAsBilling = page.locator(shippingSel.sameAsBilling);

    // Default: checkbox should be checked
    await expect(sameAsBilling).toBeChecked();

    // Shipping fields should NOT be visible when checked
    await expect(page.locator(shippingSel.shippingStreet)).not.toBeVisible();

    // Uncheck "same as billing"
    await sameAsBilling.uncheck();
    await expect(sameAsBilling).not.toBeChecked();

    // All shipping fields must be visible
    await expect(page.locator(shippingSel.shippingStreet)).toBeVisible();
    await expect(page.locator(shippingSel.shippingLine2)).toBeVisible();
    await expect(page.locator(shippingSel.shippingCity)).toBeVisible();
    await expect(page.locator(shippingSel.shippingZip)).toBeVisible();
    await expect(page.locator(shippingSel.shippingCountry)).toBeVisible();

    // State should be disabled until country is selected
    await expect(page.locator(shippingSel.shippingState)).toBeDisabled();

    // Select a country → state should enable with options
    await page.locator(shippingSel.shippingCountry).selectOption('USA');
    await expect(page.locator(shippingSel.shippingState)).toBeEnabled({ timeout: 5_000 });
  };
}

/**
 * AC-12: Radio buttons — Prosperity Planner (mutual exclusion).
 */
export function verifyProsperityPlannerRadio(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const onRequest = page.locator(sel.prosperityOnRequest);
    const automatic = page.locator(sel.prosperityAutomatic);
    const doNotShip = page.locator(sel.prosperityDoNotShip);

    await onRequest.check();
    await expect(onRequest).toBeChecked();

    await automatic.check();
    await expect(automatic).toBeChecked();
    await expect(onRequest).not.toBeChecked();

    await doNotShip.check();
    await expect(doNotShip).toBeChecked();
    await expect(automatic).not.toBeChecked();
    await expect(onRequest).not.toBeChecked();
  };
}

/**
 * AC-12: Radio buttons — HCA Booklets (mutual exclusion).
 */
export function verifyHcaBookletsRadio(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const onRequest = page.locator(sel.hcaOnRequest);
    const automatic = page.locator(sel.hcaAutomatic);
    const doNotShip = page.locator(sel.hcaDoNotShip);

    await automatic.check();
    await expect(automatic).toBeChecked();

    await onRequest.check();
    await expect(onRequest).toBeChecked();
    await expect(automatic).not.toBeChecked();

    await doNotShip.check();
    await expect(doNotShip).toBeChecked();
    await expect(onRequest).not.toBeChecked();
    await expect(automatic).not.toBeChecked();
  };
}

/**
 * AC-13: "None of the above" exclusivity — Interests section.
 */
export function verifyInterestsNoneExclusivity(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const interestsCtx = pom.registration_form._.membership_preferences_interests_section;
    const mastertech = page.locator(interestsCtx._.checkbox_mastertech_software.$());
    const personnelPotential = page.locator(interestsCtx._.checkbox_personnel_potential.$());
    const adminKnowhow = page.locator(interestsCtx._.checkbox_admin_knowhow.$());
    const none = page.locator(interestsCtx._.checkbox_none.$());

    // Select 3 interests
    await mastertech.check();
    await personnelPotential.check();
    await adminKnowhow.check();
    await expect(mastertech).toBeChecked();
    await expect(personnelPotential).toBeChecked();
    await expect(adminKnowhow).toBeChecked();

    // Select "None" — all 3 must uncheck
    await none.check();
    await expect(none).toBeChecked();
    await expect(mastertech).not.toBeChecked();
    await expect(personnelPotential).not.toBeChecked();
    await expect(adminKnowhow).not.toBeChecked();

    // Select one back — "None" must uncheck
    await mastertech.check();
    await expect(mastertech).toBeChecked();
    await expect(none).not.toBeChecked();
  };
}

/**
 * AC-13: "None of the above" exclusivity — Email Newsletters section.
 */
export function verifyNewslettersNoneExclusivity(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const newslettersCtx = pom.registration_form._.membership_preferences_email_newsletters_section;
    const wiseWins = page.locator(newslettersCtx._.checkbox_wise_wins.$());
    const churchEvents = page.locator(newslettersCtx._.checkbox_church_events.$());
    const hcaResources = page.locator(newslettersCtx._.checkbox_hca_resources.$());
    const none = page.locator(newslettersCtx._.checkbox_none.$());

    // Select 3 newsletters
    await wiseWins.check();
    await churchEvents.check();
    await hcaResources.check();
    await expect(wiseWins).toBeChecked();
    await expect(churchEvents).toBeChecked();
    await expect(hcaResources).toBeChecked();

    // Select "None" — all 3 must uncheck
    await none.check();
    await expect(none).toBeChecked();
    await expect(wiseWins).not.toBeChecked();
    await expect(churchEvents).not.toBeChecked();
    await expect(hcaResources).not.toBeChecked();

    // Select one back — "None" must uncheck
    await churchEvents.check();
    await expect(churchEvents).toBeChecked();
    await expect(none).not.toBeChecked();
  };
}

/**
 * AC-14: Birth Year — year field validation.
 *
 * Same validation pattern as Company Founded (AC-10):
 * 1. Filters non-numeric input (setYear strips non-digits) — 'abcd' → empty
 * 2. Filters mixed alphanumeric (setYear keeps only digits) — '20ab' → '20'
 * 3. Limits to 4 digits max — '19901' → '1990'
 * 4. Rejects a future year on submit (e.g. '2030') — shows error state + helper text
 * 5. Rejects too-short year on submit (e.g. '90') — shows error state + helper text
 * 6. Accepts a valid 4-digit year (e.g. '1990') — no error state
 *
 * Pre-condition: All other required fields must be filled to isolate the
 * birth year field error.
 */
export function verifyBirthYearValidation(getPage: () => Page, data: RegistrationValidationData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const birthYearInput = page.locator(sel.birthYear);
    const birthYearError = page.locator(errSel.birthYearError);
    const submitBtn = page.locator(sel.submitButton);

    // ── Fill minimum required fields (except birth year) to isolate validation ──
    await page.locator(sel.positionSelect).selectOption(data.base.position);
    await page.locator(sel.companyTypeSelect).selectOption(data.base.companyType);
    await page.locator(sel.industrySelect).selectOption(data.base.industry);
    if (data.base.industry === 'other' && data.base.industryOther) {
      await page.locator(rf._.industry_size_section._.industry_other_input.$()).fill(data.base.industryOther);
    }
    await page.locator(sel.companySizeSelect).selectOption(data.base.companySize);
    await page.locator(sel.companyFounded).fill(data.base.companyFounded);
    await page.locator(PROSPERITY_RADIO[data.base.prosperityPlanner]).check();
    await page.locator(HCA_RADIO[data.base.hcaBooklets]).check();
    const interestsCtx = pom.registration_form._.membership_preferences_interests_section;
    await page.locator(interestsCtx._.checkbox_mastertech_software.$()).check();
    const newslettersCtx = pom.registration_form._.membership_preferences_email_newsletters_section;
    await page.locator(newslettersCtx._.checkbox_church_events.$()).check();
    await page.locator(sel.educationSelect).selectOption(data.base.education);
    await page.locator(sel.preferredLang).selectOption(data.base.preferredLanguageISO);

    // ── Test 1: Non-numeric text is filtered out by setYear ──
    // setYear strips non-digits: 'abcd' → ''
    await birthYearInput.fill(data.nonNumericYear);
    await expect(birthYearInput).toHaveValue('');

    // ── Test 2: Mixed alphanumeric keeps only digits ──
    // setYear: '20ab' → '20'
    await birthYearInput.fill(data.mixedAlphanumericYear);
    await expect(birthYearInput).toHaveValue('20');

    // ── Test 3: Long input is truncated to 4 digits ──
    // setYear: '19901' → '1990'
    await birthYearInput.fill(data.longYear);
    await expect(birthYearInput).toHaveValue(data.longYear.slice(0, 4));

    // ── Test 4: Future year → error on submit ──
    await birthYearInput.fill(data.futureBirthYear);
    await expect(birthYearInput).toHaveValue(data.futureBirthYear);
    await submitBtn.click();
    await expect(page).toHaveURL(/\/details/);
    await expect(birthYearInput).toHaveAttribute('data-test-state', 'error');
    await expect(birthYearError).toBeVisible({ timeout: 5_000 });

    // ── Test 5: Too short (2 digits) → error on submit ──
    await birthYearInput.fill(data.shortYear);
    await expect(birthYearInput).toHaveValue(data.shortYear);
    await submitBtn.click();
    await expect(page).toHaveURL(/\/details/);
    await expect(birthYearInput).toHaveAttribute('data-test-state', 'error');
    await expect(birthYearError).toBeVisible();

    // ── Test 6: Valid 4-digit year → no error ──
    await birthYearInput.fill(data.validBirthYear);
    await expect(birthYearInput).toHaveValue(data.validBirthYear);
    await expect(birthYearInput).toHaveAttribute('data-test-state', 'normal');
  };
}

/**
 * AC-14: Alternate phone input — country selector + prefix + number.
 */
export function verifyAlternatePhone(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // Open alt phone country dropdown
    const countryBtn = page.locator(sel.altPhoneCountryBtn);
    await countryBtn.click();

    // Select Colombia
    const coOption = page.locator('li[data-country="co"]');
    await coOption.waitFor({ state: 'visible', timeout: 5_000 });
    await coOption.click();

    // Verify prefix changed to +57
    const phoneInput = page.locator(sel.altPhoneTel);
    const value = await phoneInput.inputValue();
    expect(value).toContain('+57');

    // Type number
    await phoneInput.click();
    await phoneInput.pressSequentially('3003202000', { delay: 30 });

    // Verify formatted number
    const finalValue = await phoneInput.inputValue();
    expect(finalValue).toContain('300');
  };
}

/**
 * AC-14: Personal address — country→state cascading.
 */
export function verifyPersonalAddressCascading(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    const personalCountry = page.locator(sel.personalCountry);
    const personalState = page.locator(sel.personalState);

    // State should be disabled initially
    await expect(personalState).toBeDisabled();

    // Select country
    await personalCountry.selectOption('USA');
    await expect(personalCountry).toHaveValue('USA');

    // State should enable with options
    await expect(personalState).toBeEnabled({ timeout: 5_000 });
    const stateOptions = personalState.locator('option');
    expect(await stateOptions.count()).toBeGreaterThan(1);
  };
}

/**
 * AC-45: Submit form with missing required fields — should show errors and block navigation.
 * Fills most fields but omits Education (required) to test validation.
 */
export function submitWithMissingRequired(getPage: () => Page, data: RegistrationFormData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // Fill professional profile
    await page.locator(sel.positionSelect).selectOption(data.position);
    await page.locator(sel.companyTypeSelect).selectOption(data.companyType);
    await page.locator(sel.industrySelect).selectOption(data.industry);
    if (data.industry === 'other' && data.industryOther) {
      await page.locator(rf._.industry_size_section._.industry_other_input.$()).fill(data.industryOther);
    }
    await page.locator(sel.companySizeSelect).selectOption(data.companySize);
    await page.locator(sel.companyFounded).fill(data.companyFounded);

    // Fill radios
    await page.locator(PROSPERITY_RADIO[data.prosperityPlanner]).check();
    await page.locator(HCA_RADIO[data.hcaBooklets]).check();

    // Fill interests (at least one)
    const interestsCtx = pom.registration_form._.membership_preferences_interests_section;
    await page.locator(interestsCtx._.checkbox_mastertech_software.$()).check();

    // Fill newsletters (at least one)
    const newslettersCtx = pom.registration_form._.membership_preferences_email_newsletters_section;
    await page.locator(newslettersCtx._.checkbox_church_events.$()).check();

    // Fill preferred language but SKIP Education (required)
    await page.locator(sel.preferredLang).selectOption(data.preferredLanguageISO);

    // Submit — should fail because Education is missing
    await page.locator(sel.submitButton).click();

    // Should NOT navigate to plan page
    await expect(page).toHaveURL(/\/details/);

    // Education error should be visible
    const educationError = page.locator(errSel.educationError);
    await expect(educationError).toBeVisible({ timeout: 5_000 });
  };
}

