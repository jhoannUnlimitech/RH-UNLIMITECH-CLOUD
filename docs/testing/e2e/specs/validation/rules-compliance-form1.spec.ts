/**
 * Rules Compliance — Form 1 (General Information)
 *
 * Validates that all labels, hints, placeholders, dropdown options, and visual
 * composition of Form 1 match the Rules & Workflow Specification Manual (June 15, 2026).
 *
 * Language: English (en-US) — navigates with ?lang=en-US.
 * Method: Browser (CDP) — navigates to Form 1, reads DOM text.
 *
 * ACs: AC-RC-A01 through AC-RC-A13
 * Ref: e2e/results/rules-compliance-wording/acceptance-criteria-checklist.md (Grupo A)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test rules-compliance-form1 --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base.js';
import { navigateToSignUpV4 } from '../../factories/navigation.factory.js';
import {
  validateForm1Labels,
  validateForm1Hints,
  validateForm1PhoneType,
  validateForm1CountryDropdown,
  validateForm1Composition,
  validateForm1ReferralPlaceholder,
} from '../../factories/rules-compliance-form1.factory.js';
import { PARAMS_V4_FULL } from '../../fixtures/test-data.js';

// ─── Config ─────────────────────────────────────────────────────────────────

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(60_000);

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('Rules Compliance — Form 1: General Information (English)', () => {

  // ── Navigate (English) ────────────────────────────────────────────────────

  e2e('navigate to Form 1 (en-US)', navigateToSignUpV4(getPage, { ...PARAMS_V4_FULL, language: 'en-US' }));

  // ── AC-RC-A01 to A04, A08: Labels ────────────────────────────────────────

  e2e('AC-RC-A01 to A04, A08: validate labels', validateForm1Labels(getPage));

  // ── AC-RC-A03, A05, A09, A10: Hints ──────────────────────────────────────

  e2e('AC-RC-A03, A05, A09, A10: validate hints', validateForm1Hints(getPage));

  // ── AC-RC-A06, A07: Phone Type ───────────────────────────────────────────

  e2e('AC-RC-A06, A07: phone type default + options', validateForm1PhoneType(getPage));

  // ── AC-RC-A11: Referral placeholder ──────────────────────────────────────

  e2e('AC-RC-A11: referral placeholder', validateForm1ReferralPlaceholder(getPage));

  // ── AC-RC-A12: Country dropdown (95 countries) ───────────────────────────

  e2e('AC-RC-A12: country dropdown — 95 countries', validateForm1CountryDropdown(getPage));

  // ── AC-RC-A13: Composition (section order) ───────────────────────────────

  e2e('AC-RC-A13: composition — section order matches Rules', validateForm1Composition(getPage));
});
