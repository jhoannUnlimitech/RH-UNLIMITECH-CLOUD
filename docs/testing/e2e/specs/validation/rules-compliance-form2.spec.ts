/**
 * Rules Compliance — Form 2 (Company & Profile Details)
 *
 * Validates that all labels, hints, placeholders, dropdown options, and visual
 * composition of Form 2 match the Rules & Workflow Specification Manual (June 15, 2026).
 *
 * Language: English (en-US) — navigates with ?language=en-US.
 * Method: Browser (CDP) — requires Form 1 completed to reach Form 2.
 *
 * ACs: AC-RC-B01 through AC-RC-B34
 * Ref: e2e/results/rules-compliance-wording/acceptance-criteria-checklist.md (Grupo B)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test rules-compliance-form2 --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base.js';
import { navigateToSignUpV4 } from '../../factories/navigation.factory.js';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory.js';
import {
  validateForm2CompanyHints,
  validateForm2CompanyDropdowns,
  validateForm2WebsiteSection,
  validateForm2AddressCheckboxes,
  validateForm2PhoneSection,
  validateForm2PreferencesHints,
  validateForm2PreferencesOptions,
  validateForm2PersonalProfile,
  validateForm2LanguageDropdown,
  validateForm2Composition,
} from '../../factories/rules-compliance-form2.factory.js';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data.js';

// ─── Config ─────────────────────────────────────────────────────────────────

const testEmail = generateMailosaurEmail('rc2');
const leadData = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(120_000);

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('Rules Compliance — Form 2: Company & Profile Details (English)', () => {

  // ── Navigate to Form 2 (requires Form 1 complete) ─────────────────────────

  e2e('navigate to Form 1 (en-US)', navigateToSignUpV4(getPage, { ...PARAMS_V4_FULL, language: 'en-US' }));
  e2e('fill lead form', fillLeadForm(getPage, leadData));
  e2e('submit lead form → /details', submitLeadForm(getPage));

  // ── B.1 Company Details — Hints ───────────────────────────────────────────

  e2e('AC-RC-B01, B03, B08, B10, B12: company section hints',
    validateForm2CompanyHints(getPage));

  // ── B.1 Company Details — Dropdowns ───────────────────────────────────────

  e2e('AC-RC-B02, B04, B09, B11: company dropdowns (count + content)',
    validateForm2CompanyDropdowns(getPage));

  // ── B.1 Website Section ───────────────────────────────────────────────────

  e2e('AC-RC-B05, B06, B07: website hint + checkbox + add button',
    validateForm2WebsiteSection(getPage));

  // ── B.2 Address Checkboxes ────────────────────────────────────────────────

  e2e('AC-RC-B13, B14: billing/shipping "Same as Company" checkboxes',
    validateForm2AddressCheckboxes(getPage));

  // ── B.2 Additional Phone ──────────────────────────────────────────────────

  e2e('AC-RC-B15, B16: additional phone required + type default',
    validateForm2PhoneSection(getPage));

  // ── B.3 Membership Preferences — Hints ────────────────────────────────────

  e2e('AC-RC-B17, B19, B21, B23: preference section hints',
    validateForm2PreferencesHints(getPage));

  // ── B.3 Membership Preferences — Options ──────────────────────────────────

  e2e('AC-RC-B18, B20, B22, B24: preference options count',
    validateForm2PreferencesOptions(getPage));

  // ── B.4 Personal Profile ──────────────────────────────────────────────────

  e2e('AC-RC-B25, B26, B27, B28, B29, B30: personal profile fields',
    validateForm2PersonalProfile(getPage));

  // ── B.4 Language Dropdown ─────────────────────────────────────────────────

  e2e('AC-RC-B31, B32, B33: language dropdown (count + English first + custom entries)',
    validateForm2LanguageDropdown(getPage));

  // ── B.5 Composition ───────────────────────────────────────────────────────

  e2e('AC-RC-B34: composition — section order matches Rules',
    validateForm2Composition(getPage));
});
