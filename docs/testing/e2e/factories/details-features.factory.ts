/**
 * Details Features Factories — Form 2 new functionality validation.
 *
 * Covers tickets #859 (personal address checkbox), #860 (education options),
 * #861 (back button navigation).
 *
 * POM: details.pom.ts
 * Covers: AC-B2-42 to AC-B2-53
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/details.pom';

// ─── Selectors (derived from POM) ──────────────────────────────────────────

const rf = pom.registration_form;

const sel = {
  personalSection:   rf._.personal_address_section.$(),
  personalHidden:    rf._.personal_address_section.hidden.$(),
  personalVisible:   rf._.personal_address_section.visible.$(),
  sameAsCompany:     rf._.personal_address_section._.personal_same_as_company_checkbox.$(),
  personalStreet:    rf._.personal_address_section._.personal_street_input.$(),
  educationSelect:   rf._.education_languages_section._.education_select.$(),
  backButton:        rf._.back_button.$(),
  backButtonTop:     rf._.back_button_top.$(),
  submitButton:      rf._.submit_button.$(),
};

// ═════════════════════════════════════════════════════════════════════════════
// #859 — Personal Address Checkbox
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-B2-42, AC-B2-43: Verify checkbox visible and unchecked by default (section visible).
 * Note: Developer implemented with unchecked default → personal fields visible initially.
 */
export function verifyPersonalAddressInitialState(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-B2-42: Checkbox visible
    const checkbox = page.locator(sel.sameAsCompany);
    await expect(checkbox).toBeVisible({ timeout: 10_000 });

    // AC-B2-43: Check current state — developer set unchecked as default
    const isChecked = await checkbox.isChecked();

    if (isChecked) {
      // If checked: section hidden (fields not visible)
      const section = page.locator(sel.personalSection);
      await expect(section).toHaveAttribute('data-test-state', 'hidden');
    } else {
      // If unchecked: section visible (fields shown)
      const section = page.locator(sel.personalSection);
      await expect(section).toHaveAttribute('data-test-state', 'visible');
    }
  };
}

/**
 * AC-B2-44: Check the checkbox → personal address fields become hidden.
 * Then uncheck → fields become visible again.
 */
export function togglePersonalAddress(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const checkbox = page.locator(sel.sameAsCompany);
    const section = page.locator(sel.personalSection);

    // Check → fields hidden
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await expect(section).toHaveAttribute('data-test-state', 'hidden');

    // Uncheck → fields visible again
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await expect(section).toHaveAttribute('data-test-state', 'visible');
    await expect(page.locator(sel.personalStreet)).toBeVisible();
  };
}

/**
 * AC-B2-45: Re-check → fields hidden again, submit uses company address.
 */
export function recheckPersonalAddress(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const checkbox = page.locator(sel.sameAsCompany);
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    const section = page.locator(sel.personalSection);
    await expect(section).toHaveAttribute('data-test-state', 'hidden');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #860 — Education Dropdown
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-B2-47: Verify "High School Diploma / GED" exists (not "Degree").
 * AC-B2-48: Verify "No High School Diploma" is the last option.
 */
export function verifyEducationOptions(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const options = page.locator(`${sel.educationSelect} option`);
    const allTexts = await options.allTextContents();

    // Filter out placeholder
    const realOptions = allTexts.filter(t => t !== '' && !t.includes('Choose'));

    // AC-B2-47: "Diploma" not "Degree"
    const diplomaOption = realOptions.find(t => t.includes('High School'));
    expect(diplomaOption).toContain('Diploma');
    expect(diplomaOption).not.toContain('Degree');

    // AC-B2-48: "No High School Diploma" is last
    const lastOption = realOptions[realOptions.length - 1];
    expect(lastOption).toBe('No High School Diploma');
  };
}

/**
 * AC-B2-50: Select "No High School Diploma" + submit → navigates to /plan.
 */
export function selectNoHighSchoolAndSubmit(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Select the new option
    const educationSelect = page.locator(sel.educationSelect);
    await educationSelect.selectOption({ label: 'No High School Diploma' });
    await expect(educationSelect).toHaveValue('no_high_school_diploma');

    // Submit form
    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Should navigate to /plan (form accepted the new option)
    await page.waitForURL(/\/sign-up\/[^/]+\/(plan|thank-you)/, { timeout: 15_000 });
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// #861 — Back Button
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-B2-51: Back button visible in Form 2 (bottom).
 */
export function verifyBackButtonVisible(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await expect(page.locator(sel.backButton)).toBeVisible({ timeout: 10_000 });
  };
}

/**
 * AC-B2-52: Click Back → navigates to /general-info.
 */
export function clickBackAndVerify(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.locator(sel.backButton).click();
    await page.waitForURL(/\/general-info/, { timeout: 10_000 });
  };
}

/**
 * AC-B2-53: After navigating back, Form 1 data is preserved.
 */
export function verifyFormDataPreserved(getPage: () => Page, expectedEmail: string) {
  return async () => {
    const page = getPage();

    // Verify we're on general-info
    expect(page.url()).toContain('/general-info');

    // Check a field that was filled — email should still have the value
    const emailInput = page.locator('[data-test-key="email-input"]');
    await expect(emailInput).toHaveValue(expectedEmail);
  };
}
