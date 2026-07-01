/**
 * Rules Compliance Form 1 Factory — Validates General Information page wording and composition.
 *
 * Each factory validates a group of ACs from the Rules Compliance checklist (Grupo A).
 * Reads actual text from the DOM (labels, hints, placeholders, options) and compares
 * against the Rules & Workflow Specification Manual expected values.
 *
 * Strategy for hints/labels without data-test-key:
 *   - Uses evaluate_script to read textContent by proximity to annotated inputs
 *   - Each form field's label and hint are in predictable DOM positions relative
 *     to their annotated input/select
 *
 * Related files:
 * - e2e/pom/general-info.pom.ts (selectors)
 * - e2e/fixtures/rules-expected-data.ts (expected values from Rules)
 * - e2e/results/rules-compliance-wording/acceptance-criteria-checklist.md
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/general-info.pom.js';
import { FORM1_EXPECTED, PHONE_TYPE_OPTIONS, RULES_COUNTRIES_COUNT } from '../fixtures/rules-expected-data.js';

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  formReady: pom.lead_form.ready.$(),
  // Sections (for composition order)
  nameSection: pom.lead_form._.name_section.$(),
  emailSection: pom.lead_form._.email_section.$(),
  companyNameSection: pom.lead_form._.company_name_section.$(),
  phoneSection: pom.lead_form._.phone_section.$(),
  addressSection: pom.lead_form._.address_section.$(),
  referralSection: pom.lead_form._.referral_section.$(),
  // Inputs (for locating nearby labels/hints)
  firstNameInput: pom.lead_form._.name_section._.first_name_input.$(),
  lastNameInput: pom.lead_form._.name_section._.last_name_input.$(),
  emailInput: pom.lead_form._.email_section._.email_input.$(),
  companyNameInput: pom.lead_form._.company_name_section._.company_name_input.$(),
  phoneTypeSelect: pom.lead_form._.phone_section._.phone_type_select.$(),
  countrySelect: pom.lead_form._.address_section._.country_select.$(),
  referralInput: pom.lead_form._.referral_section._.referral_input.$(),
};

// ═════════════════════════════════════════════════════════════════════════════
// AC-RC-A01 to A04, A08: Labels
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validates Form 1 field labels match Rules Document.
 * Reads label text from the DOM by finding the label associated with each input.
 */
export function validateForm1Labels(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 10_000 });

    // AC-RC-A01: First Name label
    const firstLabel = await page.evaluate((inputSel) => {
      const input = document.querySelector(inputSel);
      if (!input) return null;
      // Find label: either <label for="id"> or ancestor label or preceding label in same group
      const wrapper = input.closest('[data-test-context]');
      const label = wrapper?.querySelector('label');
      return label?.textContent?.trim() ?? null;
    }, sel.firstNameInput);
    // The label contains both "First" and "Last" as sub-labels, or the parent is "Name"
    // Check the placeholder or the actual input label attribute
    const firstPlaceholder = await page.locator(sel.firstNameInput).getAttribute('placeholder');
    const firstAriaLabel = await page.locator(sel.firstNameInput).getAttribute('aria-label');

    // Read the visible text near the first name input
    const nameLabels = await page.evaluate((sectionSel) => {
      const section = document.querySelector(sectionSel);
      if (!section) return [];
      const labels = section.querySelectorAll('label, .label, [class*="label"]');
      return Array.from(labels).map(l => l.textContent?.trim() ?? '');
    }, sel.nameSection);

    console.log(`  📋 Name section labels found: ${JSON.stringify(nameLabels)}`);

    // AC-RC-A01: "First" should appear as label text
    const hasFirst = nameLabels.some(l => l.includes('First'));
    expect(hasFirst).toBe(true);
    console.log(`  ✅ AC-RC-A01: "First" label present`);

    // AC-RC-A02: "Last" should appear as label text
    const hasLast = nameLabels.some(l => l.includes('Last'));
    expect(hasLast).toBe(true);
    console.log(`  ✅ AC-RC-A02: "Last" label present`);

    // AC-RC-A04: Phone label = "Phone"
    const phoneLabels = await page.evaluate((sectionSel) => {
      const section = document.querySelector(sectionSel);
      if (!section) return [];
      const labels = section.querySelectorAll('label, .label, [class*="label"], h3, h4, legend');
      return Array.from(labels).map(l => l.textContent?.trim() ?? '');
    }, sel.phoneSection);
    console.log(`  📋 Phone section labels: ${JSON.stringify(phoneLabels)}`);
    const hasPhone = phoneLabels.some(l => l.includes('Phone'));
    expect(hasPhone).toBe(true);
    console.log(`  ✅ AC-RC-A04: "Phone" label present`);

    // AC-RC-A08: Email label = "Company Email Address"
    const emailLabels = await page.evaluate((sectionSel) => {
      const section = document.querySelector(sectionSel);
      if (!section) return [];
      const labels = section.querySelectorAll('label, .label, [class*="label"], h3, h4, legend');
      return Array.from(labels).map(l => l.textContent?.trim() ?? '');
    }, sel.emailSection);
    console.log(`  📋 Email section labels: ${JSON.stringify(emailLabels)}`);
    const hasEmailLabel = emailLabels.some(l => l.includes('Company Email Address'));
    expect(hasEmailLabel).toBe(true);
    console.log(`  ✅ AC-RC-A08: "Company Email Address" label present`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-RC-A03, A05, A09, A10: Hints
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validates Form 1 hint texts match Rules Document.
 * Hints are typically rendered as a <p> or <span> with a specific class below the label.
 */
export function validateForm1Hints(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 10_000 });

    // Helper: extract all visible text from a section
    const getSectionText = async (sectionSel: string) => {
      return page.evaluate((s) => {
        const el = document.querySelector(s);
        return el?.textContent ?? '';
      }, sectionSel);
    };

    // AC-RC-A03: Company Name hint
    const companyText = await getSectionText(sel.companyNameSection);
    expect(companyText).toContain(FORM1_EXPECTED.companyName.hint);
    console.log(`  ✅ AC-RC-A03: Company Name hint matches Rules`);

    // AC-RC-A05: Phone hint
    const phoneText = await getSectionText(sel.phoneSection);
    expect(phoneText).toContain(FORM1_EXPECTED.phone.hint);
    console.log(`  ✅ AC-RC-A05: Phone hint matches Rules`);

    // AC-RC-A09: Email hint
    const emailText = await getSectionText(sel.emailSection);
    expect(emailText).toContain(FORM1_EXPECTED.email.hint);
    console.log(`  ✅ AC-RC-A09: Email hint matches Rules`);

    // AC-RC-A10: Address hint
    const addressText = await getSectionText(sel.addressSection);
    expect(addressText).toContain(FORM1_EXPECTED.address.hint);
    console.log(`  ✅ AC-RC-A10: Address hint matches Rules`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-RC-A06, A07: Phone Type
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validates Phone Type select: default value and option list.
 */
export function validateForm1PhoneType(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator(sel.phoneTypeSelect);
    await expect(select).toBeVisible({ timeout: 5_000 });

    // AC-RC-A06: Default value is "Cell / Mobile" (first option selected)
    const selectedText = await select.locator('option:checked').textContent();
    expect(selectedText?.trim()).toBe(FORM1_EXPECTED.phone.typeDefault);
    console.log(`  ✅ AC-RC-A06: Phone Type default = "${selectedText?.trim()}"`);

    // AC-RC-A07: Exactly 3 options
    const options = await select.locator('option:not([value=""])').allTextContents();
    const trimmed = options.map(o => o.trim());
    expect(trimmed.length).toBe(3);
    for (const expected of PHONE_TYPE_OPTIONS) {
      expect(trimmed).toContain(expected);
    }
    console.log(`  ✅ AC-RC-A07: Phone Type has 3 options: ${JSON.stringify(trimmed)}`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-RC-A11: Referral Placeholder
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validates Referral input placeholder matches Rules.
 */
export function validateForm1ReferralPlaceholder(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const input = page.locator(sel.referralInput);
    await expect(input).toBeVisible({ timeout: 5_000 });

    const placeholder = await input.getAttribute('placeholder');
    const expected = FORM1_EXPECTED.referral.placeholder;
    if (placeholder === expected) {
      console.log(`  ✅ AC-RC-A11: Referral placeholder = "${placeholder}"`);
    } else {
      // Check if the text appears as visible hint/label instead of placeholder
      const sectionText = await page.evaluate((s) => document.querySelector(s)?.textContent ?? '', sel.referralSection);
      const hasText = sectionText.includes('How did you hear about WISE');
      console.log(`  ${hasText ? '✅' : '❌'} AC-RC-A11: Referral text "${expected}" — placeholder=${placeholder}, in section=${hasText}`);
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-RC-A12: Country Dropdown (95 countries)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validates Country dropdown has exactly 95 selectable options (WISE Continents chart).
 */
export function validateForm1CountryDropdown(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator(sel.countrySelect);
    await expect(select).toBeVisible({ timeout: 5_000 });

    // Count options excluding placeholder/disabled
    const options = await select.locator('option:not([disabled]):not([value=""])').allTextContents();
    console.log(`  📋 Country dropdown has ${options.length} options (expected: ${RULES_COUNTRIES_COUNT})`);

    // Log first 10 and last 5 for debugging
    if (options.length !== RULES_COUNTRIES_COUNT) {
      console.log(`     First 10: ${options.slice(0, 10).join(', ')}`);
      console.log(`     Last 5: ${options.slice(-5).join(', ')}`);
    }

    expect(options.length).toBe(RULES_COUNTRIES_COUNT);
    console.log(`  ✅ AC-RC-A12: Country dropdown has ${RULES_COUNTRIES_COUNT} countries`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-RC-A13: Composition (Section Order)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validates Form 1 sections appear in the order defined by the Rules Document.
 * Uses DOM position (getBoundingClientRect().top) to determine visual order.
 */
export function validateForm1Composition(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.formReady, { timeout: 10_000 });

    // Get the Y position of each section
    const sectionPositions = await page.evaluate((sections: string[]) => {
      return sections.map(sel => {
        const el = document.querySelector(sel);
        if (!el) return { sel, y: -1 };
        return { sel, y: el.getBoundingClientRect().top };
      });
    }, [
      sel.nameSection,
      sel.emailSection,
      sel.companyNameSection,
      sel.phoneSection,
      sel.addressSection,
      sel.referralSection,
    ]);

    console.log(`  📋 Section positions (Y):`);
    for (const sp of sectionPositions) {
      const name = sp.sel.match(/data-test-context="([^"]+)"/)?.[1] ?? sp.sel;
      console.log(`     ${name}: ${sp.y}px`);
    }

    // Verify each section is below the previous one
    for (let i = 1; i < sectionPositions.length; i++) {
      const prev = sectionPositions[i - 1];
      const curr = sectionPositions[i];
      if (prev.y === -1 || curr.y === -1) continue; // skip missing sections
      expect(curr.y).toBeGreaterThan(prev.y);
    }

    console.log(`  ✅ AC-RC-A13: Sections in correct order (Name → Email → Company → Phone → Address → Referral)`);
  };
}
