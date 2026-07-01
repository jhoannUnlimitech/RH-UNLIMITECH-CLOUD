/**
 * CRM Account Validation — Verifies Account fields in Zoho CRM match enrollment form data.
 *
 * PRE-REQUISITE: Run enrollment flow first (full-enrollment-v4.spec.ts) to export session-snapshot.json.
 *
 * Run:
 *   npx playwright test crm-account-validation
 *
 * Acceptance Criteria: AC-CRM-V33 to AC-CRM-V45
 */

import { test } from '@playwright/test';
import {
  createCRMContext,
  validateSnapshot,
  authenticateZoho,
  fetchAccountByName,
  validateAccountFields,
  generateAuditReport,
} from '../../../factories/crm-validation.factory';

const ctx = createCRMContext();

test.describe.serial('CRM Account Validation — Field Mapping', () => {

  test.setTimeout(120_000);

  test('load and validate session snapshot',                  validateSnapshot(ctx));
  test('authenticate with Zoho CRM API',                     authenticateZoho(ctx));
  test('AC-CRM-V07/V33: find Account by company name',       fetchAccountByName(ctx));
  test('AC-CRM-V34 to V45: validate Account fields',         validateAccountFields(ctx));
  test('generate CRM Account validation report',             generateAuditReport(ctx));
});
