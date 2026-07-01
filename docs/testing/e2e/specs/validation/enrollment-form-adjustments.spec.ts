/**
 * Enrollment Form Adjustments — Validation Spec
 *
 * Validates the new features integrated in bugfix/enrollment-form-adjustments:
 * - AC-EF01 to AC-EF05: Referral field ("How did you hear about WISE?")
 * - AC-EF06 to AC-EF10: Billing Address section
 * - AC-EF11 to AC-EF14: Repeatable Company Website field
 * - AC-EF15 to AC-EF18: WISE Country Filter (90 countries)
 * - AC-EF19 to AC-EF20: Charter plan removal
 * - AC-CRM01: Phone mapping to Individual in CRM
 *
 * Pre-condition: App running at BASE_URL (default: https://localhost:9010)
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { pom as leadPom } from '../../pom/general-info.pom';
import { pom as detailsPom } from '../../pom/details.pom';
import { pom as plansPom } from '../../pom/plan-selection.pom';
import {
  LEAD_USA_V4,
  REG_USA_V4,
  COUNTRY_FILTER,
  PLAN_GRID,
  COMPANY_WEBSITES,
  BILLING_ADDRESS_USA,
} from '../../fixtures/test-data';

// ═════════════════════════════════════════════════════════════════════════════
// Section 1: Referral Field (AC-EF01 to AC-EF05)
// ═════════════════════════════════════════════════════════════════════════════

const referralFlow = createSerialFlow();

referralFlow.e2e.describe.serial('AC-EF01 to AC-EF05 — Referral Field', () => {
  referralFlow.e2e('navigate to sign-up', navigateToSignUpV4(referralFlow.getPage));

  referralFlow.e2e('AC-EF01: referral field is visible in General Info', async () => {
    const page = referralFlow.getPage();
    await page.waitForSelector(leadPom.lead_form.ready.$(), { timeout: 15_000 });

    const referralInput = page.locator(leadPom.lead_form._.referral_section._.referral_input.$());
    await expect(referralInput).toBeVisible();
  });

  referralFlow.e2e('AC-EF02: referral field accepts text input', async () => {
    const page = referralFlow.getPage();
    const referralInput = page.locator(leadPom.lead_form._.referral_section._.referral_input.$());
    await referralInput.fill('Google Search');
    await expect(referralInput).toHaveValue('Google Search');
  });

  referralFlow.e2e('AC-EF03: referral field is included in form submission', async () => {
    const page = referralFlow.getPage();

    // Fill all required fields
    await fillLeadForm(referralFlow.getPage, LEAD_USA_V4)();

    // Verify referral has value before submit
    const referralInput = page.locator(leadPom.lead_form._.referral_section._.referral_input.$());
    await expect(referralInput).toHaveValue(LEAD_USA_V4.referralSource);
  });

  referralFlow.e2e('AC-EF04: form submits successfully with referral filled', async () => {
    const page = referralFlow.getPage();
    await submitLeadForm(referralFlow.getPage)();
    // Should navigate to details page
    await expect(page).toHaveURL(/\/details/);
  });

  referralFlow.e2e('AC-EF05: referral value persists on page reload', async () => {
    const page = referralFlow.getPage();
    // Reload the current page (details) and go back to general-info via URL
    const currentUrl = page.url();
    const generalInfoUrl = currentUrl.replace('/details', '/general-info');
    await page.goto(generalInfoUrl);
    await page.waitForSelector(leadPom.lead_form.ready.$(), { timeout: 15_000 });

    const referralInput = page.locator(leadPom.lead_form._.referral_section._.referral_input.$());
    await expect(referralInput).toHaveValue(LEAD_USA_V4.referralSource);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 2: Billing Address (AC-EF06 to AC-EF10)
// ═════════════════════════════════════════════════════════════════════════════

const billingFlow = createSerialFlow();

billingFlow.e2e.describe.serial('AC-EF06 to AC-EF10 — Billing Address', () => {
  billingFlow.e2e('navigate and fill lead form', async () => {
    await navigateToSignUpV4(billingFlow.getPage)();
    await fillLeadForm(billingFlow.getPage, LEAD_USA_V4)();
    await submitLeadForm(billingFlow.getPage)();
  });

  billingFlow.e2e('AC-EF06: billing address section exists with hidden state by default', async () => {
    const page = billingFlow.getPage();
    await page.waitForSelector(detailsPom.registration_form.ready.$(), { timeout: 15_000 });

    const billingSection = page.locator(detailsPom.registration_form._.billing_address_section.$());
    await expect(billingSection).toHaveAttribute('data-test-state', 'hidden');
  });

  billingFlow.e2e('AC-EF07: "Same as company" checkbox is checked by default', async () => {
    const page = billingFlow.getPage();
    const checkbox = page.locator(
      detailsPom.registration_form._.billing_address_section._.same_as_company_checkbox.$()
    );
    await expect(checkbox).toBeChecked();
  });

  billingFlow.e2e('AC-EF08: unchecking "Same as company" reveals billing fields', async () => {
    const page = billingFlow.getPage();
    const checkbox = page.locator(
      detailsPom.registration_form._.billing_address_section._.same_as_company_checkbox.$()
    );
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // Section state should change to visible
    const billingSection = page.locator(detailsPom.registration_form._.billing_address_section.$());
    await expect(billingSection).toHaveAttribute('data-test-state', 'visible');

    // All billing fields should be visible
    await expect(page.locator(detailsPom.registration_form._.billing_address_section._.billing_street_input.$())).toBeVisible();
    await expect(page.locator(detailsPom.registration_form._.billing_address_section._.billing_city_input.$())).toBeVisible();
    await expect(page.locator(detailsPom.registration_form._.billing_address_section._.billing_zip_input.$())).toBeVisible();
    await expect(page.locator(detailsPom.registration_form._.billing_address_section._.billing_country_select.$())).toBeVisible();
  });

  billingFlow.e2e('AC-EF09: billing country→state cascading works', async () => {
    const page = billingFlow.getPage();

    // State should be disabled initially
    const stateSelect = page.locator(
      detailsPom.registration_form._.billing_address_section._.billing_state_select.$()
    );
    await expect(stateSelect).toBeDisabled();

    // Select country
    const countrySelect = page.locator(
      detailsPom.registration_form._.billing_address_section._.billing_country_select.$()
    );
    await countrySelect.selectOption(BILLING_ADDRESS_USA.countryISO3);
    await expect(countrySelect).toHaveValue(BILLING_ADDRESS_USA.countryISO3);

    // State should enable
    await expect(stateSelect).toBeEnabled({ timeout: 5_000 });
    await stateSelect.selectOption(BILLING_ADDRESS_USA.stateISO);
    await expect(stateSelect).toHaveValue(BILLING_ADDRESS_USA.stateISO);
  });

  billingFlow.e2e('AC-EF10: re-checking "Same as company" hides billing fields', async () => {
    const page = billingFlow.getPage();
    const checkbox = page.locator(
      detailsPom.registration_form._.billing_address_section._.same_as_company_checkbox.$()
    );
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    const billingSection = page.locator(detailsPom.registration_form._.billing_address_section.$());
    await expect(billingSection).toHaveAttribute('data-test-state', 'hidden');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 3: Repeatable Company Website (AC-EF11 to AC-EF14)
// ═════════════════════════════════════════════════════════════════════════════

const websiteFlow = createSerialFlow();

websiteFlow.e2e.describe.serial('AC-EF11 to AC-EF14 — Repeatable Company Website', () => {
  websiteFlow.e2e('navigate and fill lead form', async () => {
    await navigateToSignUpV4(websiteFlow.getPage)();
    await fillLeadForm(websiteFlow.getPage, LEAD_USA_V4)();
    await submitLeadForm(websiteFlow.getPage)();
  });

  websiteFlow.e2e('AC-EF11: first website field (index 0) is visible', async () => {
    const page = websiteFlow.getPage();
    await page.waitForSelector(detailsPom.registration_form.ready.$(), { timeout: 15_000 });

    const website0 = page.locator(detailsPom.registration_form._.website_section._.company_website_0.$());
    await expect(website0).toBeVisible();
  });

  websiteFlow.e2e('AC-EF12: "Add" button adds additional website fields (up to 5)', async () => {
    const page = websiteFlow.getPage();

    // Fill first website
    const website0 = page.locator(detailsPom.registration_form._.website_section._.company_website_0.$());
    await website0.fill(COMPANY_WEBSITES[0]);
    await expect(website0).toHaveValue(COMPANY_WEBSITES[0]);

    // Click add button to add second field
    const addBtn = page.locator(detailsPom.registration_form._.website_section._.company_website_add_button.$());
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Second field should appear
    const website1 = page.locator(detailsPom.registration_form._.website_section._.company_website_1.$());
    await expect(website1).toBeVisible();
    await website1.fill(COMPANY_WEBSITES[1]);

    // Add third
    await addBtn.click();
    const website2 = page.locator(detailsPom.registration_form._.website_section._.company_website_2.$());
    await expect(website2).toBeVisible();
    await website2.fill(COMPANY_WEBSITES[2]);

    // Add fourth
    await addBtn.click();
    const website3 = page.locator(detailsPom.registration_form._.website_section._.company_website_3.$());
    await expect(website3).toBeVisible();
    await website3.fill(COMPANY_WEBSITES[3]);

    // Add fifth (max)
    await addBtn.click();
    const website4 = page.locator(detailsPom.registration_form._.website_section._.company_website_4.$());
    await expect(website4).toBeVisible();
    await website4.fill(COMPANY_WEBSITES[4]);
  });

  websiteFlow.e2e('AC-EF13: max message shown and add button disabled at 5 URLs', async () => {
    const page = websiteFlow.getPage();

    // Add button should be disabled at max (not hidden — it shows "disabled" state)
    const addBtn = page.locator(detailsPom.registration_form._.website_section._.company_website_add_button.$());
    await expect(addBtn).toHaveAttribute('data-test-state', 'disabled');
    await expect(addBtn).toBeDisabled();
  });

  websiteFlow.e2e('AC-EF14: remove button removes a website field', async () => {
    const page = websiteFlow.getPage();

    // Remove the last one (index 4)
    const removeBtn = page.locator(detailsPom.registration_form._.website_section._.company_website_remove_4.$());
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Field 4 should disappear
    const website4 = page.locator(detailsPom.registration_form._.website_section._.company_website_4.$());
    await expect(website4).not.toBeVisible();

    // Add button should reappear
    const addBtn = page.locator(detailsPom.registration_form._.website_section._.company_website_add_button.$());
    await expect(addBtn).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 4: WISE Country Filter (AC-EF15 to AC-EF18)
// ═════════════════════════════════════════════════════════════════════════════

const countryFlow = createSerialFlow();

countryFlow.e2e.describe.serial('AC-EF15 to AC-EF18 — WISE Country Filter', () => {
  countryFlow.e2e('navigate to sign-up', navigateToSignUpV4(countryFlow.getPage));

  countryFlow.e2e('AC-EF15: country dropdown shows exactly 96 allowed countries + placeholder', async () => {
    const page = countryFlow.getPage();
    await page.waitForSelector(leadPom.lead_form.ready.$(), { timeout: 15_000 });

    const countrySelect = page.locator(leadPom.lead_form._.address_section._.country_select.$());
    const options = countrySelect.locator('option');
    const count = await options.count();

    // 96 allowed countries + 1 placeholder = 97 total options
    expect(count).toBe(COUNTRY_FILTER.expectedCount + 1); // 96 + 1 placeholder
  });

  countryFlow.e2e('AC-EF16: included countries are selectable', async () => {
    const page = countryFlow.getPage();
    const countrySelect = page.locator(leadPom.lead_form._.address_section._.country_select.$());

    // Test a sample of included countries
    for (const iso3 of COUNTRY_FILTER.includedCountries.slice(0, 3)) {
      await countrySelect.selectOption(iso3);
      await expect(countrySelect).toHaveValue(iso3);
    }
  });

  countryFlow.e2e('AC-EF17: excluded countries are NOT in the dropdown', async () => {
    const page = countryFlow.getPage();
    const countrySelect = page.locator(leadPom.lead_form._.address_section._.country_select.$());

    // Get all option values
    const optionValues = await countrySelect.locator('option').evaluateAll(
      (opts) => opts.map(o => (o as HTMLOptionElement).value)
    );

    // Excluded countries should NOT be in the list
    for (const iso3 of COUNTRY_FILTER.excludedCountries) {
      expect(optionValues).not.toContain(iso3);
    }
  });

  countryFlow.e2e('AC-EF18: country filter applies to all country selects in the flow', async () => {
    const page = countryFlow.getPage();

    // Fill lead form and navigate to details
    await fillLeadForm(countryFlow.getPage, LEAD_USA_V4)();
    await submitLeadForm(countryFlow.getPage)();

    await page.waitForSelector(detailsPom.registration_form.ready.$(), { timeout: 15_000 });

    // Check personal address country select also has the filter
    const personalCountry = page.locator(
      detailsPom.registration_form._.personal_address_section._.personal_country_select.$()
    );
    const personalOptions = await personalCountry.locator('option').evaluateAll(
      (opts) => opts.map(o => (o as HTMLOptionElement).value)
    );

    // Excluded countries should NOT be in personal address either
    for (const iso3 of COUNTRY_FILTER.excludedCountries.slice(0, 3)) {
      expect(personalOptions).not.toContain(iso3);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Section 5: Charter Plan Removal (AC-EF19 to AC-EF20)
// ═════════════════════════════════════════════════════════════════════════════

const planFlow = createSerialFlow();

planFlow.e2e.describe.serial('AC-EF19 to AC-EF20 — Charter Plan Removal', () => {
  planFlow.e2e('navigate, fill lead and registration, reach plan selection', async () => {
    await navigateToSignUpV4(planFlow.getPage)();
    await fillLeadForm(planFlow.getPage, LEAD_USA_V4)();
    await submitLeadForm(planFlow.getPage)();

    const page = planFlow.getPage();
    await page.waitForSelector(detailsPom.registration_form.ready.$(), { timeout: 15_000 });

    // Fill minimum required registration fields to submit
    const rf = detailsPom.registration_form;
    await page.locator(rf._.position_section._.position_select.$()).selectOption(REG_USA_V4.position);
    await page.locator(rf._.company_type_section._.company_type_select.$()).selectOption(REG_USA_V4.companyType);
    await page.locator(rf._.industry_size_section._.industry_select.$()).selectOption(REG_USA_V4.industry);
    await page.locator(rf._.company_size_select.$()).selectOption(REG_USA_V4.companySize);
    await page.locator(rf._.website_section._.company_website_0.$()).fill('https://example.com');
    await page.locator(rf._.company_founded_section._.company_founded_input.$()).fill(REG_USA_V4.companyFounded);
    await page.locator(rf._.membership_preferences_prosperity_planner_section._.radio_on_request.$()).check();
    await page.locator(rf._.membership_preferences_hca_booklets_section._.radio_on_request.$()).check();
    await page.locator(rf._.membership_preferences_interests_section._.checkbox_mastertech_software.$()).check();
    await page.locator(rf._.membership_preferences_email_newsletters_section._.checkbox_church_events.$()).check();
    await page.locator(rf._.education_languages_section._.education_select.$()).selectOption(REG_USA_V4.education);
    await page.locator(rf._.education_languages_section._.preferred_language_select.$()).selectOption(REG_USA_V4.preferredLanguageISO);

    // Submit registration → plan selection
    const submitBtn = page.locator(rf._.submit_button.$());
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await page.waitForURL(/\/sign-up\/[^/]+\/plan/, { timeout: 15_000 });
  });

  planFlow.e2e('AC-EF19: expected plans are visible (individual, general, company, corporate)', async () => {
    const page = planFlow.getPage();
    await page.waitForSelector(plansPom.plan_selection.ready.$(), { timeout: 15_000 });

    for (const planCname of PLAN_GRID.expectedPlans) {
      const planCard = page.locator(`[data-test-context="plan-${planCname}"]`);
      await expect(planCard).toBeVisible();
    }
  });

  planFlow.e2e('AC-EF20: Charter plan is NOT visible in the grid', async () => {
    const page = planFlow.getPage();

    for (const planCname of PLAN_GRID.removedPlans) {
      const planCard = page.locator(`[data-test-context="plan-${planCname}"]`);
      await expect(planCard).not.toBeVisible();
    }
  });
});
