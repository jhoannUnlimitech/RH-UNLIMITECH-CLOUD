import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import {
  verifyRequiredFieldLabels,
  submitEmptyLeadForm,
  submitInvalidEmail,
  verifyCountryDropdownLoaded,
  verifyCountryClearsState,
  verifyPhonePrefix,
} from '../../factories/lead-form.factory';
import { LEAD_VALIDATION_COLOMBIA } from '../../fixtures/test-data';

/**
 * General Info Form — Validation E2E Tests
 *
 * Validates: AC-04, AC-05, AC-06, AC-07, AC-08
 *
 * AC-04: Required fields marked + empty submit shows errors
 * AC-05: Invalid email format rejected
 * AC-06: Country dropdown loaded with options
 * AC-07: Country change clears state selection
 * AC-08: Phone country selector applies correct prefix
 *
 * Run:
 *   npx playwright test general-info-validation
 *   npm run e2e -- general-info-validation
 */

// ── AC-04: Required field labels ────────────────────────────────────────────

const requiredLabels = createSerialFlow();

requiredLabels.e2e.describe.serial('AC-04 — Required Field Labels', () => {
  requiredLabels.e2e('navigate to sign-up',                navigateToSignUp(requiredLabels.getPage));
  requiredLabels.e2e('required fields have labels visible', verifyRequiredFieldLabels(requiredLabels.getPage));
});

// ── AC-04: Empty submit ─────────────────────────────────────────────────────

const emptySubmit = createSerialFlow();

emptySubmit.e2e.describe.serial('AC-04 — Empty Submit Shows Errors', () => {
  emptySubmit.e2e('navigate to sign-up',                navigateToSignUp(emptySubmit.getPage));
  emptySubmit.e2e('submit empty form shows toast + errors', submitEmptyLeadForm(emptySubmit.getPage));
});

// ── AC-05: Invalid email ────────────────────────────────────────────────────

const invalidEmail = createSerialFlow();

invalidEmail.e2e.describe.serial('AC-05 — Invalid Email Rejected', () => {
  invalidEmail.e2e('navigate to sign-up',                navigateToSignUp(invalidEmail.getPage));
  invalidEmail.e2e('invalid email shows error on submit', submitInvalidEmail(invalidEmail.getPage, LEAD_VALIDATION_COLOMBIA));
});

// ── AC-06: Country dropdown loaded ──────────────────────────────────────────

const countryDropdown = createSerialFlow();

countryDropdown.e2e.describe.serial('AC-06 — Country Dropdown Loaded', () => {
  countryDropdown.e2e('navigate to sign-up',                navigateToSignUp(countryDropdown.getPage));
  countryDropdown.e2e('country dropdown has options loaded', verifyCountryDropdownLoaded(countryDropdown.getPage));
});

// ── AC-07: Country clears state ─────────────────────────────────────────────

const countryClearsState = createSerialFlow();

countryClearsState.e2e.describe.serial('AC-07 — Country Change Clears State', () => {
  countryClearsState.e2e('navigate to sign-up',                navigateToSignUp(countryClearsState.getPage));
  countryClearsState.e2e('changing country clears state selection', verifyCountryClearsState(countryClearsState.getPage, LEAD_VALIDATION_COLOMBIA));
});

// ── AC-08: Phone prefix ─────────────────────────────────────────────────────

const phonePrefix = createSerialFlow();

phonePrefix.e2e.describe.serial('AC-08 — Phone Country Prefix', () => {
  phonePrefix.e2e('navigate to sign-up',                navigateToSignUp(phonePrefix.getPage));
  phonePrefix.e2e('selecting country applies correct phone prefix', verifyPhonePrefix(phonePrefix.getPage, LEAD_VALIDATION_COLOMBIA));
});
