/**
 * Company Websites CRM Mapping — Ticket #869
 *
 * Validates that all 5 company website URLs from Form 2 map correctly
 * to the corresponding Zoho CRM Account fields:
 *   URL[0] → Company_Website1
 *   URL[1] → Company_Website (SM1)
 *   URL[2] → Company_Website_Social_Media2
 *   URL[3] → Company_Website_Social_Media3
 *   URL[4] → Company_Website_Social_Media4
 *
 * Also validates Contact/Lead receives URL[0] in Company_Website.
 *
 * Flow: Navigate → Form 1 → Submit → Form 2 (5 URLs) → Submit →
 *       Wait for CRM async → Validate 5 URL fields via Zoho API
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test company-websites-crm-mapping --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import {
  createCRMContext,
  authenticateZoho,
  waitForAccountWebsites,
  validateAccountField,
  validateLeadOrContactWebsite,
} from '../../factories/crm-validation.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4_5URLS,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data';

const testEmail = generateMailosaurEmail();
const LEAD_MAILOSAUR = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();
const crmCtx = createCRMContext();

e2e.setTimeout(180_000);

e2e.describe.serial('Company Websites CRM Mapping — 5 URLs (Ticket #869)', () => {

  // ── Phase 1: General Info (Lead Form) ──────────────────────────────────────
  e2e('navigate with v4 params',        navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',                 fillLeadForm(getPage, LEAD_MAILOSAUR));
  e2e('submit lead form → /details',    submitLeadForm(getPage));

  // ── Phase 2: Details (Registration Form with 5 URLs) ───────────────────────
  e2e('AC-869-01/02: fill registration form with 5 URLs', fillRegistrationForm(getPage, REG_USA_V4_5URLS));
  e2e('AC-869-03: submit registration → /plan',           submitRegistrationForm(getPage));

  // ── Phase 3: CRM Validation — 5 URL fields ────────────────────────────────
  e2e('CRM: authenticate',                                authenticateZoho(crmCtx));
  e2e('CRM: find Account + wait for website fields',      waitForAccountWebsites(crmCtx, LEAD_USA_V4.companyName));

  e2e('AC-869-04: URL #1 → Company_Website1 in Account',
    validateAccountField(crmCtx, 'Company_Website1', REG_USA_V4_5URLS.companyWebsites![0], 'Company_Website1'));

  e2e('AC-869-05: URL #2 → Company_Website_Social_Media1 in Account',
    validateAccountField(crmCtx, 'Company_Website_Social_Media1', REG_USA_V4_5URLS.companyWebsites![1], 'Company_Website_Social_Media1'));

  e2e('AC-869-06: URL #3 → Company_Website_Social_Media2 in Account',
    validateAccountField(crmCtx, 'Company_Website_Social_Media2', REG_USA_V4_5URLS.companyWebsites![2], 'Company_Website_Social_Media2'));

  e2e('AC-869-07: URL #4 → Company_Website_Social_Media3 in Account',
    validateAccountField(crmCtx, 'Company_Website_Social_Media3', REG_USA_V4_5URLS.companyWebsites![3], 'Company_Website_Social_Media3'));

  e2e('AC-869-08: URL #5 → Company_Website_Social_Media4 in Account',
    validateAccountField(crmCtx, 'Company_Website_Social_Media4', REG_USA_V4_5URLS.companyWebsites![4], 'Company_Website_Social_Media4'));

  e2e('AC-869-09: URL #1 → Company_Website in Contact/Lead',
    validateLeadOrContactWebsite(crmCtx, testEmail, REG_USA_V4_5URLS.companyWebsites![0]));

  e2e('AC-869-10: summary — all URLs mapped correctly', async () => {
    console.log('\n📊 Company Websites CRM Mapping — Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Company: ${LEAD_USA_V4.companyName}`);
    console.log(`  URLs submitted: ${REG_USA_V4_5URLS.companyWebsites!.length}`);
    console.log('');
    console.log('  Mapping verification:');
    const fields = ['Company_Website1', 'Company_Website_Social_Media1', 'Company_Website_Social_Media2', 'Company_Website_Social_Media3', 'Company_Website_Social_Media4'];
    REG_USA_V4_5URLS.companyWebsites!.forEach((url: string, i: number) => {
      const actual = crmCtx.accountRecord?.[fields[i]] ?? '(not found)';
      const status = actual === url ? '✅' : '❌';
      console.log(`    ${status} URL[${i}] → ${fields[i]}: ${url}`);
    });
    console.log('═══════════════════════════════════════════════════════');
  });
});
