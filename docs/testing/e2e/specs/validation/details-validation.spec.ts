import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import {
  verifyDropdownsLoaded,
  verifyCompanyFoundedValidation,
  verifyShippingAddressToggle,
  verifyProsperityPlannerRadio,
  verifyHcaBookletsRadio,
  verifyInterestsNoneExclusivity,
  verifyNewslettersNoneExclusivity,
  verifyBirthYearValidation,
  verifyAlternatePhone,
  verifyPersonalAddressCascading,
  submitWithMissingRequired,
} from '../../factories/registration-form.factory';
import { LEAD_COLOMBIA, REG_COLOMBIA, REG_VALIDATION_COLOMBIA } from '../../fixtures/test-data';

/**
 * Details Form — Validation E2E Tests
 *
 * Validates: AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-45
 *
 * Pre-condition: Must complete lead form (Form 1) to reach details page.
 * Each flow reuses happy path factories for setup.
 *
 * Run:
 *   npx playwright test details-validation
 *   npm run e2e -- details-validation
 */

// ── Helper: setup to reach details page ─────────────────────────────────────

function setupToDetails(flow: ReturnType<typeof createSerialFlow>) {
  flow.e2e('navigate to sign-up', navigateToSignUp(flow.getPage));
  flow.e2e('fill lead form',      fillLeadForm(flow.getPage, LEAD_COLOMBIA));
  flow.e2e('submit lead form',    submitLeadForm(flow.getPage));
}

// ── AC-09: All dropdowns loaded (professional + education + languages) ──────

const dropdownsLoaded = createSerialFlow();

dropdownsLoaded.e2e.describe.serial('AC-09 — Dropdowns Loaded', () => {
  setupToDetails(dropdownsLoaded);
  dropdownsLoaded.e2e('all dropdowns have predefined options', verifyDropdownsLoaded(dropdownsLoaded.getPage));
});

// ── AC-10: Company Founded year validation ──────────────────────────────────

const companyFounded = createSerialFlow();

companyFounded.e2e.setTimeout(60_000);

companyFounded.e2e.describe.serial('AC-10 — Company Founded Year Validation', () => {
  setupToDetails(companyFounded);
  companyFounded.e2e('rejects non-numeric, future year, short input, mixed chars; accepts valid 4-digit year',
    verifyCompanyFoundedValidation(companyFounded.getPage, REG_VALIDATION_COLOMBIA));
});

// ── AC-11: Shipping address toggle + cascading ──────────────────────────────

const shippingToggle = createSerialFlow();

shippingToggle.e2e.describe.serial('AC-11 — Shipping Address Toggle', () => {
  setupToDetails(shippingToggle);
  shippingToggle.e2e('toggle shows fields + country→state cascading', verifyShippingAddressToggle(shippingToggle.getPage));
});

// ── AC-12a: Prosperity Planner radio exclusivity ────────────────────────────

const prosperityRadio = createSerialFlow();

prosperityRadio.e2e.describe.serial('AC-12 — Prosperity Planner Radio', () => {
  setupToDetails(prosperityRadio);
  prosperityRadio.e2e('radio allows only one selection at a time', verifyProsperityPlannerRadio(prosperityRadio.getPage));
});

// ── AC-12b: HCA Booklets radio exclusivity ──────────────────────────────────

const hcaBookletsRadio = createSerialFlow();

hcaBookletsRadio.e2e.describe.serial('AC-12 — HCA Booklets Radio', () => {
  setupToDetails(hcaBookletsRadio);
  hcaBookletsRadio.e2e('radio allows only one selection at a time', verifyHcaBookletsRadio(hcaBookletsRadio.getPage));
});

// ── AC-13a: Interests "None of the above" exclusivity ───────────────────────

const interestsNone = createSerialFlow();

interestsNone.e2e.describe.serial('AC-13 — Interests None Exclusivity', () => {
  setupToDetails(interestsNone);
  interestsNone.e2e('select 3 → None deselects all → select 1 deselects None', verifyInterestsNoneExclusivity(interestsNone.getPage));
});

// ── AC-13b: Email Newsletters "None of the above" exclusivity ───────────────

const newslettersNone = createSerialFlow();

newslettersNone.e2e.describe.serial('AC-13 — Newsletters None Exclusivity', () => {
  setupToDetails(newslettersNone);
  newslettersNone.e2e('select 3 → None deselects all → select 1 deselects None', verifyNewslettersNoneExclusivity(newslettersNone.getPage));
});

// ── AC-14a: Birth year validation ───────────────────────────────────────────

const birthYear = createSerialFlow();

birthYear.e2e.setTimeout(60_000);

birthYear.e2e.describe.serial('AC-14 — Birth Year Validation', () => {
  setupToDetails(birthYear);
  birthYear.e2e('rejects non-numeric, future year, short input, mixed chars; accepts valid 4-digit year',
    verifyBirthYearValidation(birthYear.getPage, REG_VALIDATION_COLOMBIA));
});

// ── Alternate phone ─────────────────────────────────────────────────────────

const alternatePhone = createSerialFlow();

alternatePhone.e2e.describe.serial('Alternate Phone — Country Selector + Prefix', () => {
  setupToDetails(alternatePhone);
  alternatePhone.e2e('selecting country changes prefix and accepts number', verifyAlternatePhone(alternatePhone.getPage));
});

// ── Personal address cascading ──────────────────────────────────────────────

const personalAddress = createSerialFlow();

personalAddress.e2e.describe.serial('Personal Address — Country→State Cascading', () => {
  setupToDetails(personalAddress);
  personalAddress.e2e('selecting country enables state with options', verifyPersonalAddressCascading(personalAddress.getPage));
});

// ── AC-45: Submit with missing required field ───────────────────────────────

const missingRequired = createSerialFlow();

missingRequired.e2e.describe.serial('AC-45 — Submit With Missing Required', () => {
  setupToDetails(missingRequired);
  missingRequired.e2e('omitting Education blocks submit and shows error', submitWithMissingRequired(missingRequired.getPage, REG_COLOMBIA));
});
