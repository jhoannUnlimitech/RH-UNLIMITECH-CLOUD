/**
 * Rules Compliance Factory — Validates form texts, screen messages, and dropdown options
 * against the Rules & Workflow Specification Manual (June 15, 2026).
 *
 * Validates:
 *   - i18n values match Rules Document wording
 *   - Dropdown option counts match specification
 *   - Screen message titles, bodies, and CTAs match
 *   - Email template content matches
 *
 * Related files:
 * - .temp/note_review_forms_enrollments.md (full discrepancy report)
 * - src/i18n/locales/en-US/translation.json (i18n source)
 * - infra/functions/EmailDispatch.ts (email templates)
 */

import { expect, type Page } from '@playwright/test';
import { t } from '../fixtures/i18n.js';

// ═════════════════════════════════════════════════════════════════════════════
// i18n Value Validation (no browser needed — reads translation files directly)
// ═════════════════════════════════════════════════════════════════════════════

/** Validate a single i18n key against expected Rules Document value. */
export function validateI18nValue(i18nKey: string, expected: string, acId: string) {
  return async () => {
    const actual = t('en', i18nKey);
    expect(actual).toBe(expected);
    console.log(`  ✅ ${acId}: "${i18nKey}" = "${expected}"`);
  };
}

/** Validate an i18n key CONTAINS a substring (for partial matches). */
export function validateI18nContains(i18nKey: string, substring: string, acId: string) {
  return async () => {
    const actual = t('en', i18nKey);
    expect(actual).toContain(substring);
    console.log(`  ✅ ${acId}: "${i18nKey}" contains "${substring}"`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Dropdown Option Count Validation (browser-based)
// ═════════════════════════════════════════════════════════════════════════════

/** Validate that a dropdown has exactly the expected number of selectable options. */
export function validateDropdownOptionCount(
  getPage: () => Page, selector: string, expectedCount: number, acId: string,
) {
  return async () => {
    const page = getPage();
    const select = page.locator(selector);
    await expect(select).toBeVisible({ timeout: 5_000 });
    const options = await select.locator('option:not([disabled])').allTextContents();
    expect(options.length).toBe(expectedCount);
    console.log(`  ✅ ${acId}: ${selector} has ${options.length} options (expected: ${expectedCount})`);
  };
}

/** Validate that a dropdown's first selectable option matches expected value. */
export function validateDropdownFirstOption(
  getPage: () => Page, selector: string, expected: string, acId: string,
) {
  return async () => {
    const page = getPage();
    const select = page.locator(selector);
    await expect(select).toBeVisible({ timeout: 5_000 });
    const options = await select.locator('option:not([disabled])').allTextContents();
    expect(options[0]).toBe(expected);
    console.log(`  ✅ ${acId}: first option = "${options[0]}"`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Screen Message Validation (i18n based — validates expected wording from Rules)
// ═════════════════════════════════════════════════════════════════════════════

/** Validate Email Verified screen messages match Rules Document pg 80. */
export function validateVerifiedScreenMessages() {
  return async () => {
    const title = t('en', 'signUp.verify.successTitle');
    const body = t('en', 'signUp.verify.successMessage');
    const cta = t('en', 'signUp.verify.continueButton');

    // Rules: "Email Verified!" (capital V)
    expect(title).toBe('Email Verified!');
    console.log(`  ${title === 'Email Verified!' ? '✅' : '❌'} C1: title = "${title}" (expected: "Email Verified!")`);

    // Rules: "Thank you for verifying your email address."
    expect(body).toBe('Thank you for verifying your email address.');
    console.log(`  ${body === 'Thank you for verifying your email address.' ? '✅' : '❌'} C2: body = "${body}"`);

    // Rules: "CONTINUE TO MEMBERSHIP AGREEMENT"
    expect(cta).toContain('Membership Agreement');
    console.log(`  ✅ C3: CTA = "${cta}" (contains "Membership Agreement")`);
  };
}

/** Validate Agreement Signed screen messages match Rules Document pg 80. */
export function validateAgreementSignedScreenMessages() {
  return async () => {
    const title = t('en', 'signUp.agreementSigned.title');
    const subtitle = t('en', 'signUp.agreementSigned.subtitle');
    const cta = t('en', 'signUp.agreementSigned.continueButton');

    // Rules: "WISE Membership Agreement Signed!"
    expect(title).toBe('WISE Membership Agreement Signed!');
    console.log(`  ${title === 'WISE Membership Agreement Signed!' ? '✅' : '❌'} C4: title = "${title}" (expected: "WISE Membership Agreement Signed!")`);

    // Rules: "Thank you for signing your WISE Membership Agreement."
    expect(subtitle).toBe('Thank you for signing your WISE Membership Agreement.');
    console.log(`  ${subtitle === 'Thank you for signing your WISE Membership Agreement.' ? '✅' : '❌'} C5: body = "${subtitle}"`);

    // Rules: "CONTINUE TO PAYMENT"
    expect(cta).toContain('Payment');
    console.log(`  ✅ C6: CTA = "${cta}" (contains "Payment")`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Form 2 Text Validation (i18n — specific wording checks)
// ═════════════════════════════════════════════════════════════════════════════

/** Validate Prosperity Planner hint has "preferences" in parenthesis. */
export function validateProsperityHintWording() {
  return async () => {
    const hint = t('en', 'signUp.details.prosperityPlanner.hint');
    expect(hint).toContain('preferences can be changed later');
    console.log(`  ${hint.includes('preferences can be changed later') ? '✅' : '❌'} B19: hint contains "preferences can be changed later" — actual: "${hint}"`);
  };
}

/** Validate Email Newsletters hint uses "sign up" without hyphen. */
export function validateNewslettersHintNoHyphen() {
  return async () => {
    const hint = t('en', 'signUp.details.emailNewsletters.hint');
    expect(hint).not.toContain('sign-up');
    expect(hint).toContain('sign up');
    console.log(`  ${!hint.includes('sign-up') ? '✅' : '❌'} B25: hint uses "sign up" (no hyphen) — actual: "${hint}"`);
  };
}

/** Validate Education "Some College" includes "or University". */
export function validateEducationSomeCollegeWording() {
  return async () => {
    const value = t('en', 'options.education.someCollege');
    expect(value).toContain('University');
    console.log(`  ${value.includes('University') ? '✅' : '❌'} B32: education option = "${value}" (expected: "Some College or University")`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Language Dropdown Validation (browser-based)
// ═════════════════════════════════════════════════════════════════════════════

/** Validate Preferred Language dropdown has exactly 30 options (Rules Document). */
export function validateLanguageDropdownCount(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator('[data-test-key="preferred-language-select"]');
    await expect(select).toBeVisible({ timeout: 5_000 });
    const options = await select.locator('option:not([disabled])').allTextContents();
    console.log(`  ${options.length === 30 ? '✅' : '❌'} B35: Preferred Language has ${options.length} options (expected: 30)`);
    expect(options.length).toBe(30);
  };
}

/** Validate Language dropdown has English as first option. */
export function validateLanguageEnglishFirst(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const select = page.locator('[data-test-key="preferred-language-select"]');
    await expect(select).toBeVisible({ timeout: 5_000 });
    const options = await select.locator('option:not([disabled])').allTextContents();
    expect(options[0]).toContain('English');
    console.log(`  ✅ B34: first language = "${options[0]}" (English first)`);
  };
}
