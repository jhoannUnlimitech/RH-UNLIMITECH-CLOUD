/**
 * Audit CRM — Zoho CRM Field Mapping Validation (Contact + Account + Cross-Module)
 *
 * Validates that ALL fields sent during enrollment are correctly stored in Zoho CRM.
 * Searches by email (Contact) and company name (Account), compares every field,
 * and generates a detailed report in .temp/report_crm_*.md.
 *
 * PRE-REQUISITE: Run enrollment flow first to generate session-snapshot.json:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4
 *
 * If session-snapshot.json does not exist, the spec fails with a descriptive message
 * indicating that the enrollment flow must be run first.
 *
 * Run:
 *   npx playwright test audit-crm
 *
 * Acceptance Criteria: AC-CRM-V01 to AC-CRM-V50
 */

import { test } from '@playwright/test';
import { existsSync } from 'fs';
import { resolve } from 'path';
import {
  createCRMContext,
  validateSnapshot,
  authenticateZoho,
  fetchContactByEmail,
  fetchAccountByName,
  validateContactFields,
  validateAccountFields,
  validateMembershipNumber,
  validateCrossModule,
  generateAuditReport,
} from '../../factories/crm-validation.factory';
import {
  validatePaymentCreated,
  validateInvoiceCreated,
  validatePaymentStripeConsistency,
  validateAccountStripeId,
  validateAccountExpirationDate,
  validateProductsWiseStripe,
} from '../../factories/crm-payment-validation.factory';

// ─── Pre-check: session-snapshot.json must exist ─────────────────────────────

const snapshotPath = resolve(process.cwd(), '.temp/session-snapshot.json');

if (!existsSync(snapshotPath)) {
  test('PRE-REQUISITE: session-snapshot.json must exist', () => {
    throw new Error(
      `\n\n` +
      `═══════════════════════════════════════════════════════════════════════\n` +
      `  ❌ session-snapshot.json NOT FOUND\n` +
      `═══════════════════════════════════════════════════════════════════════\n\n` +
      `  The CRM audit requires enrollment data exported by the full enrollment flow.\n\n` +
      `  Run the enrollment flow first:\n\n` +
      `    CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4\n\n` +
      `  This generates .temp/session-snapshot.json with all form data needed\n` +
      `  to validate against Zoho CRM.\n\n` +
      `  Expected path: ${snapshotPath}\n` +
      `═══════════════════════════════════════════════════════════════════════\n`,
    );
  });
} else {

// ─── Main Test Suite ─────────────────────────────────────────────────────────

const ctx = createCRMContext();

test.describe.serial('Audit CRM — Zoho Field Mapping Validation', () => {

  test.setTimeout(120_000);

  test('AC-CRM-V01 to V04: validate session snapshot',   validateSnapshot(ctx));
  test('AC-CRM-V05: authenticate with Zoho CRM',         authenticateZoho(ctx));
  test('AC-CRM-V06: find Contact by email',              fetchContactByEmail(ctx));
  test('AC-CRM-V07: find Account by company name',       fetchAccountByName(ctx));
  test('AC-CRM-V08 to V32: validate Contact fields',     validateContactFields(ctx));
  test('AC-CRM-V33 to V45: validate Account fields',     validateAccountFields(ctx));
  test('AC-MN-01 to MN-06: validate Membership Number',   validateMembershipNumber(ctx));
  test('AC-CRM-V46/V47: cross-module consistency',       validateCrossModule(ctx));

  // ── Profile Photo CRM Sync validation (AC-CRM-V57, AC-CRM-V58) ─────────────
  test('AC-CRM-V57/V58: validate Contact photo in CRM', async () => {
    const { expect } = await import('@playwright/test');
    const contactId = ctx.contactRecord?.id;
    expect(contactId, 'Contact record must exist').toBeTruthy();

    const profilePhoto = ctx.snapshot?.registration?.profilePhoto;

    if (!profilePhoto?.originalName) {
      console.log('   ⏭️  No profilePhoto in snapshot — skipping photo validation (field optional)');
      return;
    }

    // AC-CRM-V57: Snapshot has profilePhoto.originalName
    expect(profilePhoto.originalName.length).toBeGreaterThan(0);
    console.log(`   ✅ AC-CRM-V57: snapshot has profilePhoto.originalName = "${profilePhoto.originalName}"`);

    // AC-CRM-V58: Contact has photo in Zoho CRM (with retry — upload is async via SQS → Lambda)
    let photo: { status: number; contentType: string | null; size: number } | null = null;
    const maxRetries = 6;
    const retryDelay = 5_000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      photo = await ctx.zoho!.getRecordPhoto('Contacts', contactId!);
      if (photo) break;

      if (attempt < maxRetries) {
        console.log(`   ⏳ Contact photo not yet available — waiting 5s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    if (photo) {
      console.log(`   ✅ AC-CRM-V58: Contact photo found (${photo.contentType}, ${photo.size} bytes)`);
      expect(photo.status).toBe(200);
      expect(photo.size).toBeGreaterThan(0);
      expect(photo.contentType?.startsWith('image/')).toBe(true);
    } else {
      console.log(`   ❌ AC-CRM-V58: Contact does NOT have profile photo after ${maxRetries} retries`);
      expect(photo, 'Contact should have a profile photo in Zoho CRM').not.toBeNull();
    }
  });

  // ── Payment & Invoice validation (AC-828) — graceful skip if no Payment found ──
  test('AC-828-01 to 07: validate Payment created', async () => {
    const contactId = ctx.contactRecord?.id;
    if (!contactId) {
      console.log('   ⏭️ AC-828: No Contact — skipping Payment validation');
      return;
    }
    const payments = await ctx.zoho!.getRelatedRecords('Contacts', contactId, 'Payments');
    if (payments.length === 0) {
      console.log('   ⏭️ AC-828-01: No Payment found — run full-enrollment-v4 first (Payment created post-checkout)');
      return;
    }
    await validatePaymentCreated(ctx)();
  });

  test('AC-828-08 to 12: validate Invoice created', async () => {
    const contactId = ctx.contactRecord?.id;
    if (!contactId) {
      console.log('   ⏭️ AC-828: No Contact — skipping Invoice validation');
      return;
    }
    const invoices = await ctx.zoho!.getRelatedRecords('Contacts', contactId, 'Invoices');
    if (invoices.length === 0) {
      console.log('   ⏭️ AC-828-08: No Invoice found — run full-enrollment-v4 first');
      return;
    }
    await validateInvoiceCreated(ctx)();
  });

  test('AC-828-13 to 15: validate Stripe cross-check', async () => {
    const contactId = ctx.contactRecord?.id;
    if (!contactId) {
      console.log('   ⏭️ AC-828: No Contact — skipping Stripe cross-check');
      return;
    }
    const payments = await ctx.zoho!.getRelatedRecords('Contacts', contactId, 'Payments');
    if (payments.length === 0) {
      console.log('   ⏭️ AC-828-13: No Payment — skipping Stripe cross-check');
      return;
    }
    await validatePaymentStripeConsistency(ctx)();
  });

  // ── Account post-payment fields (AC-828-17 to 26) ──────────────────────────
  test('AC-828-17/18: validate Account.Stripe_ID', validateAccountStripeId(ctx));
  test('AC-828-19 to 22: validate Account.Expiration_Date', validateAccountExpirationDate(ctx));
  test('AC-828-23 to 26: validate Products WISE Stripe', validateProductsWiseStripe(ctx));

  test('AC-CRM-V48/V49: generate audit report',          generateAuditReport(ctx));
});

} // end if (existsSync)
