/**
 * CRM Contact Validation — Verifies Contact fields in Zoho CRM match enrollment form data.
 *
 * PRE-REQUISITE: Run enrollment flow first (full-enrollment-v4.spec.ts) to export session-snapshot.json.
 *
 * Run:
 *   npx playwright test crm-contact-validation
 *
 * Acceptance Criteria: AC-CRM-V01 to AC-CRM-V32
 */

import { test } from '@playwright/test';
import {
  createCRMContext,
  validateSnapshot,
  authenticateZoho,
  fetchContactByEmail,
  validateContactFields,
  generateAuditReport,
} from '../../../factories/crm-validation.factory';

const ctx = createCRMContext();

test.describe.serial('CRM Contact Validation — Field Mapping', () => {

  test.setTimeout(120_000);

  test('AC-CRM-V01 to V04: validate session snapshot',       validateSnapshot(ctx));
  test('AC-CRM-V05: authenticate with Zoho CRM API',         authenticateZoho(ctx));
  test('AC-CRM-V06: find Contact by email in Zoho CRM',      fetchContactByEmail(ctx));
  test('AC-CRM-V08 to V32: validate Contact fields',         validateContactFields(ctx));
  test('AC-CRM-V48/V49: generate CRM validation report',     generateAuditReport(ctx));
});
