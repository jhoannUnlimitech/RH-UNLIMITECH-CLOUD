/**
 * CRM Cross-Module Validation — Verifies consistency between Contact and Account in Zoho CRM.
 *
 * PRE-REQUISITE: Run enrollment flow first (full-enrollment-v4.spec.ts) to export session-snapshot.json.
 *
 * Run:
 *   npx playwright test crm-cross-module-validation
 *
 * Acceptance Criteria: AC-CRM-V46, AC-CRM-V47
 */

import { test } from '@playwright/test';
import {
  createCRMContext,
  validateSnapshot,
  authenticateZoho,
  fetchContactByEmail,
  fetchAccountByName,
  validateCrossModule,
  generateAuditReport,
} from '../../../factories/crm-validation.factory';

const ctx = createCRMContext();

test.describe.serial('CRM Cross-Module Validation — Contact ↔ Account Consistency', () => {

  test.setTimeout(120_000);

  test('load and validate snapshot',                    validateSnapshot(ctx));
  test('authenticate with Zoho CRM',                   authenticateZoho(ctx));
  test('find Contact by email',                        fetchContactByEmail(ctx));
  test('find Account by company name',                 fetchAccountByName(ctx));
  test('AC-CRM-V46/V47: cross-module consistency',     validateCrossModule(ctx));
  test('generate cross-module validation report',      generateAuditReport(ctx));
});
