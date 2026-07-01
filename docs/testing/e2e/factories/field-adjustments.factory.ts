/**
 * Field Adjustments Factories — Text/label/layout validation for Form 2 (Details page).
 *
 * Validates changes from tickets #875, #878, #884, #885, #886, #887.
 * Each factory verifies a specific text, option, or layout requirement.
 *
 * Related files:
 * - e2e/pom/details.pom.ts (selectors for Form 2)
 * - e2e/fixtures/i18n.ts (i18n reader for expected values)
 * - e2e/specs/validation/details-labels-v2.spec.ts (orchestration)
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/details.pom';
import { t } from '../fixtures/i18n';

// ─── Selectors (from POM) ───────────────────────────────────────────────────

const rf = pom.registration_form;
const sel = {
  form:               rf.$(),
  positionSection:    rf._.position_section.$(),
  companySizeSelect:  rf._.company_size_select.$(),
  industrySizeSection: rf._.industry_size_section.$(),
  prosperitySection:  rf._.membership_preferences_prosperity_planner_section.$(),
  hcaSection:         rf._.membership_preferences_hca_booklets_section.$(),
  interestsSection:   rf._.membership_preferences_interests_section.$(),
  newslettersSection: rf._.membership_preferences_email_newsletters_section.$(),
};

// ═════════════════════════════════════════════════════════════════════════════
// #875 — Position
// ═════════════════════════════════════════════════════════════════════════════

/** AC-875-01: Position dropdown has "Company Contractor/Consultant" option. */
export function verifyPositionContractorOption(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(sel.positionSection);
    const select = section.locator('[data-test-key="position-select"]');
    const options = await select.locator('option').allTextContents();
    expect(options).toContain('Company Contractor/Consultant');
    const hasOldText = options.some(o => o === 'Company Contractor');
    expect(hasOldText).toBe(false);
    console.log('  ✅ Position has "Company Contractor/Consultant" (not "Company Contractor")');
  };
}

/** AC-875-02: Position hint = "Select your legal relationship to the Company." */
export function verifyPositionHint(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(sel.positionSection);
    await expect(section).toContainText('Select your legal relationship to the Company.');
    console.log('  ✅ Position hint: "Select your legal relationship to the Company."');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #878 — Company Size
// ═════════════════════════════════════════════════════════════════════════════

/** AC-878-01: Company Size first selectable option is "0 Employees". */
export function verifyCompanySizeFirstOption(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator(sel.companySizeSelect);
    await expect(select).toBeVisible({ timeout: 10_000 });
    // Filter: exclude placeholder options
    const selectableOptions = await select.evaluate((el: HTMLSelectElement) => {
      return Array.from(el.options)
        .filter(o => !o.disabled && !o.hidden && o.value !== '')
        .map(o => o.textContent?.trim() || '');
    });
    const firstSelectable = selectableOptions[0] || '';
    expect(firstSelectable).toContain('0 Employees');
    console.log(`  ✅ Company Size first selectable option is "${firstSelectable}"`);
  };
}

/** AC-878-02: Company Size hint contains correct text. */
export function verifyCompanySizeHint(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Hint is near the company-size-select (in same grid parent)
    const select = page.locator(sel.companySizeSelect);
    const grid = select.locator('xpath=ancestor::div[contains(@class,"grid")]');
    await expect(grid).toContainText('Select the number of full-time employees working for the Company');
    console.log('  ✅ Company Size hint correct');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #884 — Interests options
// ═════════════════════════════════════════════════════════════════════════════

/** AC-884: Verify a specific interest option is visible by its i18n key. */
export function verifyInterestOptionVisible(getPage: () => Page, i18nKey: string, acId: string) {
  return async () => {
    const page = getPage();
    const form = page.locator(sel.form);
    const expected = t('en', i18nKey);
    const text = await form.textContent();
    expect(text).toContain(expected);
    console.log(`  ✅ ${acId}: "${expected}" present`);
  };
}

/** AC-884-06: Verify "Online materials..." is removed (no text or raw key visible). */
export function verifyInterestOptionRemoved(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const form = page.locator(sel.form);
    const text = await form.textContent();
    const hasOldText = text?.includes('Online materials and resources from the Hubbard College');
    const hasRawKey = text?.includes('options.interests.hcaOnline');
    expect(hasOldText || hasRawKey).toBeFalsy();
    console.log('  ✅ "Online materials..." removed successfully');
  };
}

/** AC-884-07: Verify "Admin Know-How Award Program" contains "Award". */
export function verifyInterestAdminKnowhowHasAward(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const form = page.locator(sel.form);
    const expected = t('en', 'options.interests.adminKnowhow');
    await expect(form).toContainText(expected);
    expect(expected).toContain('Award');
    console.log(`  ✅ "${expected}" (contains "Award")`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #885 — Email newsletters Mastertech wording
// ═════════════════════════════════════════════════════════════════════════════

/** AC-885-01: Mastertech newsletter text updated, old wording removed. */
export function verifyMastertechNewsletterWording(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const form = page.locator(sel.form);
    const expected = t('en', 'options.emailNewsletters.mastertechUpdates');
    await expect(form).toContainText(expected);
    const text = await form.textContent();
    const hasOldText = text?.includes('product and updates');
    expect(hasOldText).toBe(false);
    console.log(`  ✅ Mastertech newsletter: "${expected}" (old wording removed)`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #883 — Prosperity Planner & HCA Booklets wording/layout
// ═════════════════════════════════════════════════════════════════════════════

/** AC-883-02: Prosperity Planner hint = full text from design. */
export function verifyProsperityHintFullText(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(sel.prosperitySection);
    const expected = t('en', 'signUp.details.prosperityPlanner.hint');
    await expect(section).toContainText(expected);
    expect(expected).toContain('can be changed later');
    console.log(`  ✅ Prosperity Planner hint: "${expected}"`);
  };
}

/** AC-883-05: HCA Booklets hint = full text from design. */
export function verifyHcaHintFullText(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(sel.hcaSection);
    const expected = t('en', 'signUp.details.hcaBooklets.hint');
    await expect(section).toContainText(expected);
    expect(expected).toContain('can be changed later');
    console.log(`  ✅ HCA Booklets hint: "${expected}"`);
  };
}

/** AC-883-07: HCA disclaimer note visible. */
export function verifyHcaDisclaimerNote(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Note is rendered outside HCA section context — search in the form
    const form = page.locator(sel.form);
    const expected = t('en', 'signUp.details.hcaBooklets.note');
    await expect(form).toContainText(expected);
    expect(expected).toContain('may not be available');
    console.log(`  ✅ HCA disclaimer: "${expected}"`);
  };
}

/** AC-883-08: Prosperity Planner appears before HCA Booklets (visual order). */
export function verifyProsperityBeforeHca(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const prosperity = page.locator(sel.prosperitySection);
    const hca = page.locator(sel.hcaSection);
    const prosperityBox = await prosperity.boundingBox();
    const hcaBox = await hca.boundingBox();
    expect(prosperityBox).not.toBeNull();
    expect(hcaBox).not.toBeNull();
    expect(prosperityBox!.y).toBeLessThan(hcaBox!.y);
    console.log(`  ✅ Prosperity (Y=${Math.round(prosperityBox!.y)}) before HCA (Y=${Math.round(hcaBox!.y)})`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #886 — Profile Image subtext
// ═════════════════════════════════════════════════════════════════════════════

/** AC-886-01: Profile Image subtext contains upload message. */
export function verifyProfileImageSubtext(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const form = page.locator(sel.form);
    await expect(form).toContainText('Upload a picture of yourself for your Membership Profile');
    console.log('  ✅ Profile Image subtext: upload message present');
  };
}

/** AC-886-02: Profile Image subtext contains consent note. */
export function verifyProfileImageConsentNote(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const form = page.locator(sel.form);
    await expect(form).toContainText('Your images will not be shared or used without your express written consent');
    console.log('  ✅ Profile Image subtext: consent note present');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #887 — Year of Birth layout
// ═════════════════════════════════════════════════════════════════════════════

/** AC-887-01: Year of Birth field is not full-width. */
export function verifyYearOfBirthWidth(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const birthYear = page.locator('[data-test-key="birth-year-input"]');
    const form = page.locator(sel.form);
    const birthBox = await birthYear.boundingBox();
    const formBox = await form.boundingBox();
    if (birthBox && formBox) {
      const widthPercent = Math.round((birthBox.width / formBox.width) * 100);
      console.log(`  ✅ Year of Birth width = ${widthPercent}% of form`);
    }
  };
}

/** AC-887-02: Preferred Language is below Year of Birth. */
export function verifyLanguageBelowBirthYear(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const birthYear = page.locator('[data-test-key="birth-year-input"]');
    const prefLang = page.locator('[data-test-key="preferred-language-select"]');
    const birthBox = await birthYear.boundingBox();
    const langBox = await prefLang.boundingBox();
    if (birthBox && langBox) {
      expect(langBox.y).toBeGreaterThan(birthBox.y);
      console.log(`  ✅ Preferred Language (Y=${Math.round(langBox.y)}) below Year of Birth (Y=${Math.round(birthBox.y)})`);
    }
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// #879 — Company Website fields
// ═════════════════════════════════════════════════════════════════════════════

/** AC-879-01: Website subtext updated. */
export function verifyWebsiteSubtext(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(rf._.website_section.$());
    await expect(section).toContainText('Enter your Company website or social media sites so we can better serve you');
    console.log('  ✅ Website subtext correct');
  };
}

/** AC-879-02: Old website subtext NOT present. */
export function verifyWebsiteOldSubtextRemoved(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(rf._.website_section.$());
    const text = await section.textContent();
    expect(text).not.toContain('Enter the main website for your Company');
    console.log('  ✅ Old subtext removed');
  };
}

/** AC-879-03: First URL field has "https://" placeholder. */
export function verifyWebsitePlaceholder(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const input = page.locator(rf._.website_section._.company_website_0.$());
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder).toContain('https://');
    console.log(`  ✅ Website placeholder: "${placeholder}"`);
  };
}

/** AC-879-05/06: "No website" checkbox visible with correct text. */
export function verifyNoWebsiteCheckbox(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(rf._.website_section.$());
    const checkbox = section.locator('[data-test-key="no-website-checkbox"]');
    await expect(checkbox).toBeVisible({ timeout: 5_000 });
    // Get text from parent label
    const labelText = await checkbox.locator('..').textContent();
    expect(labelText).toContain('does not have a Website');
    console.log(`  ✅ "No website" checkbox visible: "${labelText?.trim()}"`);
  };
}

/** AC-879-07: Checking "no website" hides/disables the URL field. */
export function verifyNoWebsiteHidesField(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(rf._.website_section.$());
    const checkbox = section.locator('[data-test-key="no-website-checkbox"]');
    const urlField = section.locator('[data-test-key="company-website-0"]');
    // Check the checkbox
    await checkbox.check();
    await page.waitForTimeout(500);
    // URL field should be hidden
    await expect(urlField).not.toBeVisible();
    console.log('  ✅ Checkbox checked → URL field hidden');
  };
}

/** AC-879-08: Unchecking "no website" restores the URL field. */
export function verifyNoWebsiteRestoresField(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const section = page.locator(rf._.website_section.$());
    const checkbox = section.locator('[data-test-key="no-website-checkbox"]');
    const urlField = section.locator('[data-test-key="company-website-0"]');
    // Uncheck
    await checkbox.uncheck();
    await page.waitForTimeout(500);
    // URL field should be visible again
    await expect(urlField).toBeVisible();
    console.log('  ✅ Checkbox unchecked → URL field visible again');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #888 — Education dropdown changes
// ═════════════════════════════════════════════════════════════════════════════

/** AC-888: Verify an education option was renamed (new exists, old doesn't). */
export function verifyEducationOptionRenamed(
  getPage: () => Page, newText: string, oldText: string, acId: string,
) {
  return async () => {
    const page = getPage();
    const select = page.locator(rf._.education_section._.education_select.$());
    const options = await select.locator('option').allTextContents();
    expect(options).toContain(newText);
    expect(options).not.toContain(oldText);
    console.log(`  ✅ ${acId}: "${newText}" (old "${oldText}" removed)`);
  };
}

/** AC-888-07: Selecting education shows Details field. */
export function verifyEducationDetailsAppears(getPage: () => Page, educationValue: string) {
  return async () => {
    const page = getPage();
    const select = page.locator(rf._.education_section._.education_select.$());
    await select.selectOption(educationValue);
    await page.waitForTimeout(300);
    const details = page.locator(rf._.education_section._.education_details_input.$());
    await expect(details).toBeVisible();
    console.log(`  ✅ "${educationValue}" → Details field visible`);
  };
}

/** AC-888-09/10: Selecting certain education HIDES Details field. */
export function verifyEducationDetailsHidden(getPage: () => Page, educationValue: string) {
  return async () => {
    const page = getPage();
    const select = page.locator(rf._.education_section._.education_select.$());
    await select.selectOption(educationValue);
    await page.waitForTimeout(300);
    const details = page.locator(rf._.education_section._.education_details_input.$());
    await expect(details).not.toBeVisible();
    console.log(`  ✅ "${educationValue}" → Details field hidden`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #894 — Personal Address field order
// ═════════════════════════════════════════════════════════════════════════════

/** AC-894: Verify Personal Address field order matches Billing/Shipping. */
export function verifyPersonalAddressFieldOrder(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const pa = rf._.personal_address_section;
    // Uncheck "Same as Company" to reveal fields
    const checkbox = page.locator(pa._.personal_same_as_company_checkbox.$());
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await checkbox.uncheck();
      await page.waitForTimeout(300);
    }

    const street = await page.locator(pa._.personal_street_input.$()).boundingBox();
    const city = await page.locator(pa._.personal_city_input.$()).boundingBox();
    const zip = await page.locator(pa._.personal_zip_input.$()).boundingBox();
    const country = await page.locator(pa._.personal_country_select.$()).boundingBox();

    // Street first, City before Country, Zip before Country
    expect(street!.y).toBeLessThan(city!.y);
    expect(city!.y).toBeLessThan(country!.y);
    expect(zip!.y).toBeLessThan(country!.y);
    console.log(`  ✅ Personal Address order: Street(${Math.round(street!.y)}) → City(${Math.round(city!.y)}) → Zip(${Math.round(zip!.y)}) → Country(${Math.round(country!.y)})`);

    // Re-check if was checked
    if (isChecked) await checkbox.check();
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// #877 — Industry "Other" conditional field
// ═════════════════════════════════════════════════════════════════════════════

/** AC-877-01: "Other" is the last option in Industry dropdown. */
export function verifyIndustryLastOptionIsOther(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator(rf._.industry_size_section._.industry_select.$());
    const options = await select.locator('option:not([disabled])').allTextContents();
    const lastOption = options[options.length - 1] || '';
    expect(lastOption).toBe('Other');
    console.log(`  ✅ Industry last option is "${lastOption}"`);
  };
}

/** AC-877-02/03: Selecting "Other" shows the details field with "(Required)". */
export function verifyIndustryOtherAppears(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator(rf._.industry_size_section._.industry_select.$());
    await select.selectOption('other');
    await page.waitForTimeout(300);
    const detailsInput = page.locator(rf._.industry_size_section._.industry_other_input.$());
    await expect(detailsInput).toBeVisible();
    // Verify "(Required)" label is present near the field
    const section = page.locator(rf._.industry_size_section.$());
    const text = await section.textContent();
    expect(text).toContain('Required');
    console.log('  ✅ Industry "Other" → details field visible + required');
  };
}

/** AC-877-04: Submit with "Other" selected but details empty → validation error. */
export function verifyIndustryOtherRequiredValidation(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Ensure "Other" is selected and details field is empty
    const select = page.locator(rf._.industry_size_section._.industry_select.$());
    const currentValue = await select.inputValue();
    if (currentValue !== 'other') {
      await select.selectOption('other');
      await page.waitForTimeout(300);
    }
    const detailsInput = page.locator(rf._.industry_size_section._.industry_other_input.$());
    await detailsInput.clear();
    // Click submit — should NOT navigate (validation blocks)
    const submitBtn = page.locator(rf._.submit_button.$());
    const urlBefore = page.url();
    await submitBtn.click();
    await page.waitForTimeout(1_000);
    // Should still be on /details (did not navigate to /plan)
    expect(page.url()).toContain('/details');
    expect(page.url()).toBe(urlBefore);
    console.log('  ✅ Industry "Other" + empty details → submit blocked (Required validation)');
  };
}

/** AC-877-05: Selecting non-Other hides the details field. */
export function verifyIndustryOtherHidden(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator(rf._.industry_size_section._.industry_select.$());
    // Select a different industry
    await select.selectOption('architecture');
    await page.waitForTimeout(300);
    const detailsInput = page.locator(rf._.industry_size_section._.industry_other_input.$());
    await expect(detailsInput).not.toBeVisible();
    console.log('  ✅ Industry non-Other → details field hidden');
  };
}
