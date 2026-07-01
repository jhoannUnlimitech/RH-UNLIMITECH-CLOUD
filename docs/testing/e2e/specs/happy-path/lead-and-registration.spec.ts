/**
 * Lead + Registration + CRM Lifecycle — Form 1 and Form 2 with CRM validation.
 *
 * Fills both forms (including 3 company websites), then validates via Zoho CRM API
 * that the Lead and Account were created correctly and the status transitions work.
 *
 * CRM Checkpoints:
 *   Post Form 1: Lead exists (Status=Lead) + Account exists
 *   Post Form 2: Lead transitions to Status=Prospect
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test lead-and-registration --reporter=list
 *
 * Acceptance Criteria: AC-CRM-V57, AC-CRM-V58, AC-CRM-V59
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import {
  createCRMContext,
  authenticateZoho,
  verifyLeadCreated,
  verifyAccountCreated,
  verifyLeadIsProspect,
} from '../../factories/crm-validation.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data';

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };
const crmCtx = createCRMContext();

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(120_000);

e2e.describe.serial('Lead + Registration + CRM Lifecycle', () => {

  // ── Phase 1: General Info (Lead Form) ──────────────────────────────────────
  e2e('navigate to sign-up',             navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',                  fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form → /details',     submitLeadForm(getPage));

  // ── CRM Checkpoint 1: Lead created with correct data (API validation) ──────
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
  e2e('AC-CRM-V65: verify Account (company) created', verifyAccountCreated(crmCtx, LEAD_USA_V4.companyName, {
    phoneFull: `+1${LEAD_USA_V4.phoneNumber}`,
    street: LEAD_USA_V4.street,
    addressLine2: LEAD_USA_V4.addressLine2,
    city: LEAD_USA_V4.city,
    stateName: 'Florida',
    countryName: 'United States',
    zip: LEAD_USA_V4.zip,
  }));

  // ── Phase 2: Details (Registration Form) ───────────────────────────────────
  e2e('fill registration form (3 websites)', fillRegistrationForm(getPage, REG_USA_V4));
  e2e('submit registration → /plan',     submitRegistrationForm(getPage));

  // ── CRM Checkpoint 2: Lead → Prospect (API validation) ─────────────────────
  e2e('AC-CRM-V70: verify Lead is Prospect', verifyLeadIsProspect(crmCtx, testEmail));

  // ── Summary ────────────────────────────────────────────────────────────────
  e2e('summary', async () => {
    console.log(`\n════════════════════════════════════════════════`);
    console.log(`✅ Lead Form + CRM Validation PASSED`);
    console.log(`════════════════════════════════════════════════`);
    console.log(`   Email:    ${testEmail}`);
    console.log(`   Name:     ${LEAD_USA_V4.firstName} ${LEAD_USA_V4.lastName}`);
    console.log(`   Company:  ${LEAD_USA_V4.companyName}`);
    console.log(`   Phone:    +1${LEAD_USA_V4.phoneNumber}`);
    console.log(`   Lead ID:  ${crmCtx.leadRecord?.id}`);
    console.log(`   Status:   ${crmCtx.leadRecord?.Status}`);
    console.log(`════════════════════════════════════════════════\n`);
  });
});
