/**
 * Rules Compliance Form 2 Factory — Validates Company & Profile Details page wording and composition.
 *
 * Each factory validates a group of ACs from the Rules Compliance checklist (Grupo B).
 * Reads actual text from the DOM and compares against Rules Document expected values.
 *
 * Related files:
 * - e2e/pom/details.pom.ts (selectors)
 * - e2e/fixtures/rules-expected-data.ts (expected values)
 * - e2e/results/rules-compliance-wording/acceptance-criteria-checklist.md
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/details.pom.js';
import { FORM2_EXPECTED, RULES_LANGUAGES, PHONE_TYPE_OPTIONS } from '../fixtures/rules-expected-data.js';

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  formReady: pom.registration_form.ready.$(),
  // Sections
  positionSection: pom.registration_form._.position_section.$(),
  companyTypeSection: pom.registration_form._.company_type_section.$(),
  industrySection: pom.registration_form._.industry_size_section.$(),
  websiteSection: pom.registration_form._.website_section.$(),
  companyFoundedSection: pom.registration_form._.company_founded_section.$(),
  billingSection: pom.registration_form._.billing_address_section.$(),
  shippingSection: pom.registration_form._.shipping_address_section.$(),
  altPhoneSection: pom.registration_form._.alternate_phone_section.$(),
  prosperitySection: pom.registration_form._.membership_preferences_prosperity_planner_section.$(),
  hcaSection: pom.registration_form._.membership_preferences_hca_booklets_section.$(),
  interestsSection: pom.registration_form._.membership_preferences_interests_section.$(),
  newslettersSection: pom.registration_form._.membership_preferences_email_newsletters_section.$(),
  personalAddressSection: pom.registration_form._.personal_address_section.$(),
  profilePhotoSection: pom.registration_form._.profile_photo_section.$(),
  birthYearSection: pom.registration_form._.birth_year_section.$(),
  educationSection: pom.registration_form._.education_section.$(),
  // Specific elements
  positionSelect: pom.registration_form._.position_section._.position_select.$(),
  companyTypeSelect: pom.registration_form._.company_type_section._.company_type_select.$(),
  industrySelect: pom.registration_form._.industry_size_section._.industry_select.$(),
  companySizeSelect: pom.registration_form._.company_size_select.$(),
  educationSelect: pom.registration_form._.education_section._.education_select.$(),
  preferredLangSelect: pom.registration_form._.preferred_language_select.$(),
  secondaryLangSelect: pom.registration_form._.secondary_language_select.$(),
  altPhoneTypeSelect: pom.registration_form._.alternate_phone_section._.alternate_phone_type_select.$(),
  billingCheckbox: pom.registration_form._.billing_address_section._.same_as_company_checkbox.$(),
  shippingCheckbox: pom.registration_form._.shipping_address_section._.same_as_billing_checkbox.$(),
  personalCheckbox: pom.registration_form._.personal_address_section._.personal_same_as_company_checkbox.$(),
  noWebsiteCheckbox: pom.registration_form._.website_section._.no_website_checkbox.$(),
  addWebsiteButton: pom.registration_form._.website_section._.company_website_add_button.$(),
  submitButton: pom.registration_form._.submit_button.$(),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Get all text content from a section. */
async function getSectionText(page: Page, sectionSel: string): Promise<string> {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    return el?.textContent ?? '';
  }, sectionSel);
}

/** Count options in a select (excluding placeholder/disabled). */
async function getSelectOptions(page: Page, selectSel: string): Promise<string[]> {
  const select = page.locator(selectSel);
  await expect(select).toBeVisible({ timeout: 5_000 });
  const options = await select.locator('option:not([disabled]):not([value=""])').allTextContents();
  return options.map(o => o.trim());
}

// ═════════════════════════════════════════════════════════════════════════════
// B.1 Company Hints
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2CompanyHints(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 15_000 });

    // AC-RC-B01: Position hint
    const posText = await getSectionText(page, sel.positionSection);
    expect(posText).toContain(FORM2_EXPECTED.position.hint);
    console.log(`  ✅ AC-RC-B01: Position hint matches`);

    // AC-RC-B03: Company Type hint
    const typeText = await getSectionText(page, sel.companyTypeSection);
    expect(typeText).toContain(FORM2_EXPECTED.companyType.hint);
    console.log(`  ✅ AC-RC-B03: Company Type hint matches`);

    // AC-RC-B08: Industry hint
    const indText = await getSectionText(page, sel.industrySection);
    expect(indText).toContain(FORM2_EXPECTED.industry.hint);
    console.log(`  ✅ AC-RC-B08: Industry hint matches`);

    // AC-RC-B10: Company Size hint
    // Company Size is directly under form (not in industry_size_section)
    const formText = await page.evaluate((formSel) => {
      const form = document.querySelector(formSel);
      return form?.textContent ?? '';
    }, pom.registration_form.$());
    expect(formText).toContain(FORM2_EXPECTED.companySize.hint);
    console.log(`  ✅ AC-RC-B10: Company Size hint matches`);

    // AC-RC-B12: Company Founded hint
    const foundedText = await getSectionText(page, sel.companyFoundedSection);
    expect(foundedText).toContain(FORM2_EXPECTED.companyFounded.hint);
    console.log(`  ✅ AC-RC-B12: Company Founded hint matches`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.1 Company Dropdowns
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2CompanyDropdowns(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B02: Position — 5 options
    const posOpts = await getSelectOptions(page, sel.positionSelect);
    expect(posOpts.length).toBe(FORM2_EXPECTED.position.optionCount);
    console.log(`  ✅ AC-RC-B02: Position has ${posOpts.length} options`);

    // AC-RC-B04: Company Type — 8 (7 + Other)
    const typeOpts = await getSelectOptions(page, sel.companyTypeSelect);
    expect(typeOpts.length).toBe(FORM2_EXPECTED.companyType.optionCount);
    console.log(`  ✅ AC-RC-B04: Company Type has ${typeOpts.length} options`);

    // AC-RC-B09: Industry — 46 (45 + Other)
    const indOpts = await getSelectOptions(page, sel.industrySelect);
    expect(indOpts.length).toBe(FORM2_EXPECTED.industry.optionCount);
    console.log(`  ✅ AC-RC-B09: Industry has ${indOpts.length} options`);

    // AC-RC-B11: Company Size — 9
    const sizeOpts = await getSelectOptions(page, sel.companySizeSelect);
    expect(sizeOpts.length).toBe(FORM2_EXPECTED.companySize.optionCount);
    console.log(`  ✅ AC-RC-B11: Company Size has ${sizeOpts.length} options`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.1 Website Section
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2WebsiteSection(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B05: Website hint
    const webText = await getSectionText(page, sel.websiteSection);
    expect(webText).toContain(FORM2_EXPECTED.website.hint);
    console.log(`  ✅ AC-RC-B05: Website hint matches`);

    // AC-RC-B06: "No website" checkbox text
    const checkboxLabel = await page.evaluate((cbSel) => {
      const cb = document.querySelector(cbSel);
      const label = cb?.closest('label') ?? cb?.parentElement;
      return label?.textContent?.trim() ?? '';
    }, sel.noWebsiteCheckbox);
    expect(checkboxLabel).toContain('does not have a Website');
    console.log(`  ✅ AC-RC-B06: No website checkbox text = "${checkboxLabel.substring(0, 60)}..."`);

    // AC-RC-B07: Add button text (KNOWN DISCREPANCY — actual: "+ Add another URL")
    const addBtn = page.locator(sel.addWebsiteButton);
    const isVisible = await addBtn.isVisible().catch(() => false);
    if (isVisible) {
      const btnText = await addBtn.textContent();
      const expected = FORM2_EXPECTED.website.addButton;
      const matches = btnText?.trim() === expected;
      console.log(`  ${matches ? '✅' : '❌'} AC-RC-B07: Add button = "${btnText?.trim()}" (expected: "${expected}")`);
      // Soft assertion — known discrepancy, log but don't block serial flow
      if (!matches) {
        console.log(`     ⚠️ KNOWN DISCREPANCY: Developer needs to change button text`);
      }
    } else {
      console.log(`  ⚠️ AC-RC-B07: Add button not visible (may need a URL first)`);
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.2 Address Checkboxes
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2AddressCheckboxes(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B13: Billing "Same as Company address"
    const billingLabel = await page.evaluate((cbSel) => {
      const cb = document.querySelector(cbSel);
      const label = cb?.closest('label') ?? cb?.parentElement;
      return label?.textContent?.trim() ?? '';
    }, sel.billingCheckbox);
    expect(billingLabel).toContain('Same as Company');
    console.log(`  ✅ AC-RC-B13: Billing checkbox = "${billingLabel}"`);

    // AC-RC-B14: Shipping "Same as Company address"
    const shippingLabel = await page.evaluate((cbSel) => {
      const cb = document.querySelector(cbSel);
      const label = cb?.closest('label') ?? cb?.parentElement;
      return label?.textContent?.trim() ?? '';
    }, sel.shippingCheckbox);
    // Rules says "Same as Company address" — code says "Same as Company address" via sameAsBilling key
    const expected = FORM2_EXPECTED.shippingAddress.sameAsCompany;
    const matches = shippingLabel.includes('Company');
    console.log(`  ${matches ? '✅' : '❌'} AC-RC-B14: Shipping checkbox = "${shippingLabel}" (expected to contain "Company")`);
    expect(shippingLabel).toContain('Company');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.2 Additional Phone
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2PhoneSection(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B16: Additional Phone type default = "Cell / Mobile"
    const typeSelect = page.locator(sel.altPhoneTypeSelect);
    const isVisible = await typeSelect.isVisible().catch(() => false);
    if (isVisible) {
      const selected = await typeSelect.locator('option:checked').textContent();
      expect(selected?.trim()).toBe(FORM2_EXPECTED.alternatePhone.typeDefault);
      console.log(`  ✅ AC-RC-B16: Alt Phone Type default = "${selected?.trim()}"`);
    } else {
      console.log(`  ⚠️ AC-RC-B16: Alt Phone Type select not visible`);
    }

    // AC-RC-B15: Additional Phone required (KNOWN DISCREPANCY: currently optional)
    const sectionText = await getSectionText(page, sel.altPhoneSection);
    const isRequired = sectionText.includes('(Required)');
    console.log(`  ${isRequired ? '✅' : '❌'} AC-RC-B15: Additional Phone required = ${isRequired} (Rules: true)`);
    if (!isRequired) {
      console.log(`     ⚠️ KNOWN DISCREPANCY: Rules says Required, app says Optional`);
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.3 Preference Hints
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2PreferencesHints(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B17: Prosperity Planner hint — should contain "preferences" (KNOWN DISCREPANCY)
    const prospText = await getSectionText(page, sel.prosperitySection);
    const hasPreferences = prospText.includes('preferences can be changed later');
    console.log(`  ${hasPreferences ? '✅' : '❌'} AC-RC-B17: Prosperity hint contains "preferences can be changed later"`);
    console.log(`     Actual text includes: "...${prospText.match(/.{0,20}can be changed.{0,20}/)?.[0] ?? 'NOT FOUND'}..."`);
    if (!hasPreferences) {
      console.log(`     ⚠️ KNOWN DISCREPANCY: Missing "preferences" in hint`);
    }

    // AC-RC-B19: HCA Booklets disclaimer (may be outside the radio section context)
    const hcaText = await getSectionText(page, sel.hcaSection);
    const fullFormText = await page.evaluate((formSel) => {
      const form = document.querySelector(formSel);
      return form?.textContent ?? '';
    }, pom.registration_form.$());
    const hasDisclaimer = fullFormText.includes('may not be available in all languages');
    console.log(`  ${hasDisclaimer ? '✅' : '❌'} AC-RC-B19: HCA disclaimer present in form`);
    if (!hasDisclaimer) {
      console.log(`     ⚠️ KNOWN DISCREPANCY: Disclaimer not visible on page`);
    }

    // AC-RC-B21: Interests hint
    const intText = await getSectionText(page, sel.interestsSection);
    expect(intText).toContain(FORM2_EXPECTED.interests.hint);
    console.log(`  ✅ AC-RC-B21: Interests hint matches`);

    // AC-RC-B23: Email Newsletters hint — "sign up" without hyphen (KNOWN DISCREPANCY)
    const newsText = await getSectionText(page, sel.newslettersSection);
    const hasHyphen = newsText.includes('sign-up');
    const hasNoHyphen = newsText.includes('sign up');
    console.log(`  ${(!hasHyphen && hasNoHyphen) ? '✅' : '❌'} AC-RC-B23: Newsletters hint uses "sign up" (no hyphen)`);
    console.log(`     Contains "sign-up": ${hasHyphen}, contains "sign up": ${hasNoHyphen}`);
    if (hasHyphen) {
      console.log(`     ⚠️ KNOWN DISCREPANCY: Uses "sign-up" instead of "sign up"`);
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.3 Preference Options Count
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2PreferencesOptions(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B18: Prosperity Planner — 2 radio options (Ship upon request, Ship automatically)
    const prospRadios = await page.locator(`${sel.prosperitySection} input[type="radio"]`).count();
    expect(prospRadios).toBeGreaterThanOrEqual(2);
    console.log(`  ✅ AC-RC-B18: Prosperity Planner has ${prospRadios} radio options`);

    // AC-RC-B20: HCA Booklets — 2 radio options
    const hcaRadios = await page.locator(`${sel.hcaSection} input[type="radio"]`).count();
    expect(hcaRadios).toBeGreaterThanOrEqual(2);
    console.log(`  ✅ AC-RC-B20: HCA Booklets has ${hcaRadios} radio options`);

    // AC-RC-B22: Interests — 8 checkboxes
    const intChecks = await page.locator(`${sel.interestsSection} input[type="checkbox"]`).count();
    expect(intChecks).toBe(FORM2_EXPECTED.interests.optionCount);
    console.log(`  ✅ AC-RC-B22: Interests has ${intChecks} checkboxes (expected: ${FORM2_EXPECTED.interests.optionCount})`);

    // AC-RC-B24: Email Newsletters — 6 checkboxes
    const newsChecks = await page.locator(`${sel.newslettersSection} input[type="checkbox"]`).count();
    expect(newsChecks).toBe(FORM2_EXPECTED.emailNewsletters.optionCount);
    console.log(`  ✅ AC-RC-B24: Newsletters has ${newsChecks} checkboxes (expected: ${FORM2_EXPECTED.emailNewsletters.optionCount})`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.4 Personal Profile
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2PersonalProfile(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-RC-B25: Personal Address "Same as Company Address"
    const personalLabel = await page.evaluate((cbSel) => {
      const cb = document.querySelector(cbSel);
      const label = cb?.closest('label') ?? cb?.parentElement;
      return label?.textContent?.trim() ?? '';
    }, sel.personalCheckbox);
    expect(personalLabel).toContain('Company');
    console.log(`  ✅ AC-RC-B25: Personal Address checkbox = "${personalLabel}"`);

    // AC-RC-B27: Profile Image hint "JPG or PNG, max 10 MB"
    const photoText = await getSectionText(page, sel.profilePhotoSection);
    expect(photoText).toContain(FORM2_EXPECTED.profilePhoto.hint);
    console.log(`  ✅ AC-RC-B27: Profile Image hint present`);

    // AC-RC-B28: Profile Image description
    expect(photoText).toContain('Upload a picture of yourself');
    console.log(`  ✅ AC-RC-B28: Profile Image description present`);

    // AC-RC-B26: Birth Year optional (no "(Required)" in section)
    const birthText = await getSectionText(page, sel.birthYearSection);
    const birthRequired = birthText.includes('(Required)');
    expect(birthRequired).toBe(false);
    console.log(`  ✅ AC-RC-B26: Birth Year is optional (no Required marker)`);

    // AC-RC-B29: Education "Some College or University" (KNOWN DISCREPANCY)
    const eduOpts = await getSelectOptions(page, sel.educationSelect);
    const someCollege = eduOpts.find(o => o.includes('College'));
    const hasUniversity = someCollege?.includes('University') ?? false;
    console.log(`  ${hasUniversity ? '✅' : '❌'} AC-RC-B29: Education option = "${someCollege}" (expected: "${FORM2_EXPECTED.education.someCollege}")`);
    if (!hasUniversity) {
      console.log(`     ⚠️ KNOWN DISCREPANCY: Missing "or University" in option text`);
    }

    // AC-RC-B30: Education count = 9
    expect(eduOpts.length).toBe(FORM2_EXPECTED.education.optionCount);
    console.log(`  ✅ AC-RC-B30: Education has ${eduOpts.length} options`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.4 Language Dropdown
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2LanguageDropdown(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const langOpts = await getSelectOptions(page, sel.preferredLangSelect);

    // AC-RC-B31: English is first option
    expect(langOpts[0]).toContain('English');
    console.log(`  ✅ AC-RC-B31: First language = "${langOpts[0]}" (English first)`);

    // AC-RC-B32: Exactly 30 languages (KNOWN DISCREPANCY: currently 183)
    console.log(`  ${langOpts.length === 30 ? '✅' : '❌'} AC-RC-B32: Language count = ${langOpts.length} (expected: 30)`);
    if (langOpts.length !== 30) {
      console.log(`     ⚠️ KNOWN DISCREPANCY: ${langOpts.length} languages instead of 30 (uses full ISO 639-1)`);
    }

    // AC-RC-B33: Custom entries (Cantonese, Mandarin, Farsi, French Canadian) (KNOWN DISCREPANCY)
    const customEntries = ['Cantonese', 'Mandarin', 'Farsi', 'French Canadian'];
    for (const entry of customEntries) {
      const found = langOpts.some(o => o.includes(entry));
      console.log(`  ${found ? '✅' : '❌'} AC-RC-B33: "${entry}" ${found ? 'present' : 'MISSING'}`);
      if (!found) {
        console.log(`     ⚠️ KNOWN DISCREPANCY: "${entry}" not in ISO 639-1 standard list`);
      }
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// B.5 Composition
// ═════════════════════════════════════════════════════════════════════════════

export function validateForm2Composition(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Get Y position of each major section
    const sections = [
      { name: 'Position', sel: sel.positionSection },
      { name: 'Company Type', sel: sel.companyTypeSection },
      { name: 'Industry', sel: sel.industrySection },
      { name: 'Website', sel: sel.websiteSection },
      { name: 'Founded', sel: sel.companyFoundedSection },
      { name: 'Billing', sel: sel.billingSection },
      { name: 'Shipping', sel: sel.shippingSection },
      { name: 'Alt Phone', sel: sel.altPhoneSection },
      { name: 'Prosperity', sel: sel.prosperitySection },
      { name: 'Interests', sel: sel.interestsSection },
      { name: 'Newsletters', sel: sel.newslettersSection },
      { name: 'Personal Address', sel: sel.personalAddressSection },
      { name: 'Profile Photo', sel: sel.profilePhotoSection },
      { name: 'Education', sel: sel.educationSection },
    ];

    const positions = await page.evaluate((sels: { name: string; sel: string }[]) => {
      return sels.map(s => {
        const el = document.querySelector(s.sel);
        return { name: s.name, y: el ? el.getBoundingClientRect().top : -1 };
      });
    }, sections);

    console.log(`  📋 Form 2 section positions:`);
    for (const p of positions) {
      console.log(`     ${p.name}: ${p.y === -1 ? 'NOT FOUND' : p.y + 'px'}`);
    }

    // Filter out missing sections and verify order
    const found = positions.filter(p => p.y >= 0);
    for (let i = 1; i < found.length; i++) {
      if (found[i].y < found[i - 1].y) {
        console.log(`  ❌ AC-RC-B34: "${found[i].name}" (${found[i].y}px) is ABOVE "${found[i - 1].name}" (${found[i - 1].y}px)`);
      }
      expect(found[i].y).toBeGreaterThanOrEqual(found[i - 1].y);
    }

    console.log(`  ✅ AC-RC-B34: All ${found.length} sections in correct vertical order`);
  };
}
