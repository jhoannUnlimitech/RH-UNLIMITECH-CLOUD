/**
 * CRM Company Type & Industry Validation — Fixes #2 and #3 (June 2026 Batch)
 *
 * Validates every Company Type option maps correctly to Account_Type in Zoho CRM,
 * that the deprecated Company_Type field is eliminated, and that Industry picklist
 * values with slashes have no spaces.
 *
 * Each company type gets its own enrollment → CRM validation.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test crm-company-type-industry --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import {
  createCRMContext,
  authenticateZoho,
  validateAccountField,
  waitForAccountWithType,
  validateCompanyTypeFieldEliminated,
  validateIndustryNoSpaceSlash,
} from '../../factories/crm-validation.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
} from '../../fixtures/test-data';

// ─── Company Type test matrix ───────────────────────────────────────────────

let flowCounter = 0;

const COMPANY_TYPE_MATRIX: Array<{
  formValue: string;
  expectedCRM: string;
  companyTypeOther?: string;
}> = [
  { formValue: 'sole_proprietor', expectedCRM: 'Sole proprietorship' },
  { formValue: 'llc', expectedCRM: 'LLC' },
  { formValue: 'cooperative', expectedCRM: 'Cooperative' },
  { formValue: 'incorporated', expectedCRM: 'Incorporated' },
  { formValue: 'non_profit_charitable', expectedCRM: 'Non-profit (charitable)' },
  { formValue: 'non_profit_non_charitable', expectedCRM: 'Non-profit (non-charitable)' },
  { formValue: 'other', expectedCRM: 'Other', companyTypeOther: 'Custom QA Business Type' },
];

// ─── Industry with slash (Fix 3) ────────────────────────────────────────────

const INDUSTRY_SLASH_TESTS: Array<{ formValue: string; expectedCRM: string; industryOther?: string }> = [
  { formValue: 'accounting_bookkeeping', expectedCRM: 'Accounting/Bookkeeping' },
  { formValue: 'banking_financial_services', expectedCRM: 'Banking/Financial Services' },
  { formValue: 'food_beverage', expectedCRM: 'Food/Beverage' },
  { formValue: 'other', expectedCRM: 'Other', industryOther: 'Custom Industry for QA Testing' },
];

// ═════════════════════════════════════════════════════════════════════════════
// Fix 2: Each Company Type → Account_Type picklist
// ═════════════════════════════════════════════════════════════════════════════

for (const ct of COMPANY_TYPE_MATRIX) {
  const { e2e, getPage } = createSerialFlow();
  const crmCtx = createCRMContext();
  const testEmail = generateMailosaurEmail(`ct-${ct.formValue.slice(0, 8)}`);
  const companyName = `CT Test ${ct.formValue} - ${Date.now()}-${++flowCounter}`;
  const leadData = { ...LEAD_USA_V4, email: testEmail, companyName };
  const regData = {
    ...REG_USA_V4,
    companyType: ct.formValue,
    companyTypeOther: ct.companyTypeOther,
    industry: 'education',
    industryOther: undefined,
    companyWebsites: ['https://www.test-ct.com'],
    profilePhotoPath: undefined,
  };

  e2e.setTimeout(180_000);

  e2e.describe.serial(`AC-FIX02: companyType="${ct.formValue}" → Account_Type="${ct.expectedCRM}"`, () => {
    e2e('navigate', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
    e2e('fill lead form', fillLeadForm(getPage, leadData));
    e2e('submit lead form', submitLeadForm(getPage));
    e2e('fill registration form', fillRegistrationForm(getPage, regData));
    e2e('submit registration', submitRegistrationForm(getPage));
    e2e('CRM: authenticate', authenticateZoho(crmCtx));
    e2e('CRM: find Account', waitForAccountWithType(crmCtx, companyName));
    e2e(`validate Account_Type = "${ct.expectedCRM}"`,
      validateAccountField(crmCtx, 'Account_Type', ct.expectedCRM, 'Account_Type'));
    e2e('validate Company_Type field eliminated', validateCompanyTypeFieldEliminated(crmCtx));
    if (ct.companyTypeOther) {
      e2e('AC-FIX02-09: Company_Type_Other = texto libre',
        validateAccountField(crmCtx, 'Company_Type_Other', ct.companyTypeOther, 'Company_Type_Other'));
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Fix 3: Industry with slash → no spaces
// ═════════════════════════════════════════════════════════════════════════════

for (const ind of INDUSTRY_SLASH_TESTS) {
  const { e2e, getPage } = createSerialFlow();
  const crmCtx = createCRMContext();
  const testEmail = generateMailosaurEmail(`ind-${ind.formValue.slice(0, 8)}`);
  const companyName = `IND Test ${ind.formValue} - ${Date.now()}-${++flowCounter}`;
  const leadData = { ...LEAD_USA_V4, email: testEmail, companyName };
  const regData = {
    ...REG_USA_V4,
    industry: ind.formValue,
    industryOther: ind.industryOther,
    companyWebsites: ['https://www.test-ind.com'],
    profilePhotoPath: undefined,
  };

  e2e.setTimeout(180_000);

  e2e.describe.serial(`AC-FIX03: industry="${ind.formValue}" → "${ind.expectedCRM}"`, () => {
    e2e('navigate', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
    e2e('fill lead form', fillLeadForm(getPage, leadData));
    e2e('submit lead form', submitLeadForm(getPage));
    e2e('fill registration form', fillRegistrationForm(getPage, regData));
    e2e('submit registration', submitRegistrationForm(getPage));
    e2e('CRM: authenticate', authenticateZoho(crmCtx));
    e2e('CRM: find Account', waitForAccountWithType(crmCtx, companyName));
    e2e(`validate Industry = "${ind.expectedCRM}"`,
      validateIndustryNoSpaceSlash(crmCtx, ind.expectedCRM));
    if (ind.industryOther) {
      e2e('AC-FIX03-06: Industry_Other = texto libre',
        validateAccountField(crmCtx, 'Industry_Other', ind.industryOther, 'Industry_Other'));
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Fix 1: "No Website" checkbox → No_Website = true, Company_Website1 empty
// ═════════════════════════════════════════════════════════════════════════════

{
  const { e2e, getPage } = createSerialFlow();
  const crmCtx = createCRMContext();
  const testEmail = generateMailosaurEmail('no-web');
  const companyName = `NoWeb Test - ${Date.now()}-${++flowCounter}`;
  const leadData = { ...LEAD_USA_V4, email: testEmail, companyName };
  const regData = {
    ...REG_USA_V4,
    noWebsite: true,
    companyWebsite: undefined,
    companyWebsites: undefined,
    profilePhotoPath: undefined,
  };

  e2e.setTimeout(180_000);

  e2e.describe.serial('AC-FIX01-06/07: noWebsite checkbox → No_Website=true, Website1 empty', () => {
    e2e('navigate', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
    e2e('fill lead form', fillLeadForm(getPage, leadData));
    e2e('submit lead form', submitLeadForm(getPage));
    e2e('fill registration form (noWebsite=true)', fillRegistrationForm(getPage, regData));
    e2e('submit registration', submitRegistrationForm(getPage));
    e2e('CRM: authenticate', authenticateZoho(crmCtx));
    e2e('CRM: find Account', waitForAccountWithType(crmCtx, companyName));
    e2e('AC-FIX01-06: No_Website = true',
      validateAccountField(crmCtx, 'No_Website', 'true', 'No_Website'));
    e2e('AC-FIX01-07: Company_Website1 is empty',
      validateAccountField(crmCtx, 'Company_Website1', '', 'Company_Website1'));
  });
}
