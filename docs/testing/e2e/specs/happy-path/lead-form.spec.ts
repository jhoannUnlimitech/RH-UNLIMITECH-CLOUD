/**
 * Lead Form + CRM Validation — Form 1 only with Zoho CRM lifecycle check.
 *
 * Fills and submits the lead form, then validates via Zoho CRM API that:
 * - Lead was created with Status = "Lead" and all fields correct
 * - Account (company) was created with Status = "Pending Membership"
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test lead-form --reporter=list
 *
 * Acceptance Criteria: AC-CRM-V57 to AC-CRM-V69
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import {
  createCRMContext,
  authenticateZoho,
  verifyLeadCreated,
  verifyAccountCreated,
} from '../../factories/crm-validation.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data';

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };
const crmCtx = createCRMContext();

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(120_000);

e2e.describe.serial('Lead Form + CRM Validation', () => {

  // ── Form 1: General Info ───────────────────────────────────────────────────
  e2e('navigate to sign-up',             navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',                  fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form → /details',     submitLeadForm(getPage));

  // ── CRM: Lead + Account validation (API) ───────────────────────────────────
  e2e('CRM: authenticate with Zoho',     authenticateZoho(crmCtx));
  e2e('AC-CRM-V57 to V64: verify Lead in CRM', verifyLeadCreated(crmCtx, testEmail, {
    firstName: LEAD_USA_V4.firstName,
    lastName: LEAD_USA_V4.lastName,
    companyName: LEAD_USA_V4.companyName,
    phoneFull: `+1${LEAD_USA_V4.phoneNumber}`,
    street: LEAD_USA_V4.street,
    addressLine2: LEAD_USA_V4.addressLine2,
    city: LEAD_USA_V4.city,
    stateName: 'Florida',
    countryName: 'United States',
    zip: LEAD_USA_V4.zip,
  }));
  e2e('AC-CRM-V65 to V69: verify Account in CRM', verifyAccountCreated(crmCtx, LEAD_USA_V4.companyName, {
    phoneFull: `+1${LEAD_USA_V4.phoneNumber}`,
    street: LEAD_USA_V4.street,
    addressLine2: LEAD_USA_V4.addressLine2,
    city: LEAD_USA_V4.city,
    stateName: 'Florida',
    countryName: 'United States',
    zip: LEAD_USA_V4.zip,
  }));
});
