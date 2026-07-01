/**
 * Phone Type Validation — Tickets #874, #881
 *
 * Validates the Phone Type selector in Form 1 and Additional Phone Type in Form 2:
 *   - Label, options, default value, required validation
 *   - Each type option is selectable
 *   - Form 2 Additional Phone is optional (submit without filling)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test phone-type-validation --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import {
  verifyPhoneLabel,
  verifyPhoneTypeVisible,
  verifyPhoneTypeOptions,
  verifyPhoneTypeDefault,
  verifyPhoneTypeSelectable,
  verifyPhoneTypeRequired,
  verifyAltPhoneLabel,
  verifyAltPhoneTypeVisible,
  verifyAltPhoneTypeOptions,
  verifyAltPhoneTypeDefault,
} from '../../factories/phone-type.factory';
import {
  LEAD_USA_V4,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data';

// ─── Flow 1: Form 1 Phone Type UI Validation ────────────────────────────────

const flow1 = createSerialFlow();
flow1.e2e.setTimeout(120_000);

flow1.e2e.describe.serial('Phone Type — Form 1 UI (Ticket #874)', () => {

  flow1.e2e('navigate to Form 1',                     navigateToSignUpV4(flow1.getPage, PARAMS_V4_FULL));
  flow1.e2e('AC-874-01: label is "Phone"',            verifyPhoneLabel(flow1.getPage));
  flow1.e2e('AC-874-02: Type selector visible',       verifyPhoneTypeVisible(flow1.getPage));
  flow1.e2e('AC-874-03: has 3 options',               verifyPhoneTypeOptions(flow1.getPage));
  flow1.e2e('AC-874-04: default is empty',            verifyPhoneTypeDefault(flow1.getPage));
  flow1.e2e('AC-874-05: can select "Cell / Mobile"',  verifyPhoneTypeSelectable(flow1.getPage, 'mobile', 'Cell / Mobile'));
  flow1.e2e('AC-874-06: can select "Company"',        verifyPhoneTypeSelectable(flow1.getPage, 'company', 'Company'));
  flow1.e2e('AC-874-07: can select "Home"',           verifyPhoneTypeSelectable(flow1.getPage, 'home', 'Home'));
  flow1.e2e('AC-874-08: required — form blocks submit without Type',
    verifyPhoneTypeRequired(flow1.getPage, LEAD_USA_V4));
});

// ─── Flow 2: Form 2 Additional Phone Type UI Validation ─────────────────────

const flow2 = createSerialFlow();
flow2.e2e.setTimeout(180_000);

flow2.e2e.describe.serial('Additional Phone Type — Form 2 UI (Ticket #881, optional field)', () => {

  flow2.e2e('navigate + fill Form 1 + submit', async () => {
    await navigateToSignUpV4(flow2.getPage, PARAMS_V4_FULL)();
    await fillLeadForm(flow2.getPage, { ...LEAD_USA_V4, phoneType: 'mobile' })();
    await submitLeadForm(flow2.getPage)();
  });

  flow2.e2e('AC-881-01: label is "Additional Phone"',    verifyAltPhoneLabel(flow2.getPage));
  flow2.e2e('AC-881-02: Type selector visible',          verifyAltPhoneTypeVisible(flow2.getPage));
  flow2.e2e('AC-881-03: has 3 options',                  verifyAltPhoneTypeOptions(flow2.getPage));
  flow2.e2e('AC-881-04: default should be "Cell / Mobile"', verifyAltPhoneTypeDefault(flow2.getPage));
});
