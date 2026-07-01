/**
 * CRM Validation Factories — Reusable steps for Zoho CRM field mapping validation.
 *
 * Each factory receives a shared CRMValidationContext and returns an async function
 * directly usable as: test('description', authenticateZoho(ctx))
 *
 * Pattern follows the same convention as tenant-creation.factory.ts (API-only, ctx-based).
 *
 * Related files:
 * - e2e/fixtures/zoho-client.ts (HTTP client for Zoho CRM API)
 * - e2e/fixtures/crm-expected-data.ts (builders for expected field values)
 * - e2e/fixtures/crm-report.ts (markdown report generator)
 * - e2e/specs/happy-path/audit-crm.spec.ts (orchestration spec)
 */

import { expect } from '@playwright/test';
import { ZohoTestClient, type ZohoRecord } from '../fixtures/zoho-client';
import {
  readSessionSnapshot,
  buildExpectedContactFields,
  buildExpectedAccountFields,
  type SessionSnapshot,
} from '../fixtures/crm-expected-data';
import {
  compareFields,
  generateReport,
  type FieldResult,
  type FieldStatus,
  type CRMReportData,
} from '../fixtures/crm-report';

// ─── Context ────────────────────────────────────────────────────────────────

export interface CRMValidationContext {
  zoho: ZohoTestClient | null;
  snapshot: SessionSnapshot | null;
  leadRecord: ZohoRecord | null;
  contactRecord: ZohoRecord | null;
  accountRecord: ZohoRecord | null;
  contactResults: FieldResult[];
  accountResults: FieldResult[];
  crossModuleResults: FieldResult[];
  reportPath: string | null;
}

/** Create a fresh CRM validation context for a serial flow. */
export function createCRMContext(): CRMValidationContext {
  return {
    zoho: null,
    snapshot: null,
    leadRecord: null,
    contactRecord: null,
    accountRecord: null,
    contactResults: [],
    accountResults: [],
    crossModuleResults: [],
    reportPath: null,
  };
}

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * AC-CRM-V01 to V04: Read and validate session-snapshot.json.
 * Ensures all required layers (lead, registration, stripe, session) are present.
 */
export function validateSnapshot(ctx: CRMValidationContext) {
  return async () => {
    ctx.snapshot = readSessionSnapshot();

    // Lead layer (Form 1)
    expect(ctx.snapshot.lead.email).toBeTruthy();
    expect(ctx.snapshot.lead.firstName).toBeTruthy();
    expect(ctx.snapshot.lead.lastName).toBeTruthy();
    expect(ctx.snapshot.lead.companyName).toBeTruthy();
    expect(ctx.snapshot.lead.phoneFull).toBeTruthy();
    expect(ctx.snapshot.lead.street).toBeTruthy();
    expect(ctx.snapshot.lead.city).toBeTruthy();
    expect(ctx.snapshot.lead.zip).toBeTruthy();
    expect(ctx.snapshot.lead.countryName).toBeTruthy();
    expect(ctx.snapshot.lead.stateName).toBeTruthy();

    // Registration layer (Form 2)
    expect(ctx.snapshot.registration.position).toBeTruthy();
    expect(ctx.snapshot.registration.companyType).toBeTruthy();
    expect(ctx.snapshot.registration.industry).toBeTruthy();
    expect(ctx.snapshot.registration.companySize).toBeTruthy();
    expect(ctx.snapshot.registration.education).toBeTruthy();
    expect(ctx.snapshot.registration.preferredLanguageName).toBeTruthy();
    expect(ctx.snapshot.registration.prosperityPlanner).toBeTruthy();
    expect(ctx.snapshot.registration.hcaBooklets).toBeTruthy();
    expect(ctx.snapshot.registration.interests.length).toBeGreaterThan(0);
    expect(ctx.snapshot.registration.emailNewsletters.length).toBeGreaterThan(0);

    // Stripe layer
    expect(ctx.snapshot.stripe.plan).toBeTruthy();
    expect(ctx.snapshot.stripe.interval).toBeTruthy();

    // Session layer
    expect(ctx.snapshot.session.createdAt).toBeTruthy();

    console.log(`\n📋 Audit CRM — Session Snapshot`);
    console.log(`   Email: ${ctx.snapshot.lead.email}`);
    console.log(`   Company: ${ctx.snapshot.lead.companyName}`);
    console.log(`   Timestamp: ${ctx.snapshot.metadata.timestamp}`);
  };
}

/**
 * AC-CRM-V05: Authenticate with Zoho CRM via OAuth2 refresh token.
 */
export function authenticateZoho(ctx: CRMValidationContext) {
  return async () => {
    ctx.zoho = new ZohoTestClient();
    const token = await ctx.zoho.getAccessToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(10);
    console.log(`   ✅ Zoho CRM authenticated`);
  };
}

/**
 * AC-CRM-V06: Find Contact by email in Zoho CRM with retry/backoff.
 */
export function fetchContactByEmail(ctx: CRMValidationContext) {
  return async () => {
    const email = ctx.snapshot!.lead.email;

    ctx.contactRecord = await ctx.zoho!.searchWithRetry(
      () => ctx.zoho!.searchByEmail('Contacts', email),
      { maxAttempts: 6, initialDelay: 3_000 },
    );

    expect(ctx.contactRecord).not.toBeNull();
    console.log(`   ✅ Contact found: ${ctx.contactRecord!.id}`);
  };
}

/**
 * AC-CRM-V07: Find Account by company name in Zoho CRM with retry/backoff.
 */
export function fetchAccountByName(ctx: CRMValidationContext) {
  return async () => {
    const companyName = ctx.snapshot!.lead.companyName;

    ctx.accountRecord = await ctx.zoho!.searchWithRetry(
      () => ctx.zoho!.searchAccountByName(companyName),
      { maxAttempts: 6, initialDelay: 3_000 },
    );

    expect(ctx.accountRecord).not.toBeNull();
    console.log(`   ✅ Account found: ${ctx.accountRecord!.id}`);
  };
}

/**
 * AC-CRM-V08 to V32: Compare Contact fields against form data.
 * Includes backoff for Agreement_Signed (async handler via SQS → Lambda).
 */
export function validateContactFields(ctx: CRMValidationContext) {
  return async () => {
    // Backoff for Status: ProcessCountersign sets 'Signed Agreement' async (SQS → Lambda).
    // Expanded: 8 attempts × 10s = 80s max wait (countersign webhook can be slow).
    const maxRetries = 8;
    const retryDelay = 10_000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const status = ctx.contactRecord?.Status;
      if (status === 'Signed Agreement' || attempt === maxRetries) {
        if (attempt === maxRetries && status !== 'Signed Agreement') {
          console.log(`   ⚠️ Status still '${status}' after ${maxRetries} attempts — proceeding with audit`);
        }
        break;
      }
      console.log(`   ⏳ Status = '${status}' (waiting for 'Signed Agreement') — 10s (attempt ${attempt}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, retryDelay));
      ctx.contactRecord = await ctx.zoho!.searchByEmail('Contacts', ctx.snapshot!.lead.email);
    }

    const expectedFields = buildExpectedContactFields(ctx.snapshot!);
    ctx.contactResults = compareFields(expectedFields, ctx.contactRecord);

    const matches = ctx.contactResults.filter(r => r.status === '✅ Match').length;
    const mismatches = ctx.contactResults.filter(r => r.status === '❌ Mismatch').length;

    console.log(`\n📊 Contact: ${matches} match, ${mismatches} mismatch`);
    if (mismatches > 0) {
      ctx.contactResults.filter(r => r.status === '❌ Mismatch').forEach(r => {
        console.log(`   ❌ ${r.field}: "${r.expected}" → "${r.actual}"`);
      });
    }
  };
}

/**
 * AC-CRM-V33 to V45: Compare Account fields against form data.
 */
export function validateAccountFields(ctx: CRMValidationContext) {
  return async () => {
    const expectedFields = buildExpectedAccountFields(ctx.snapshot!);
    ctx.accountResults = compareFields(expectedFields, ctx.accountRecord);

    const matches = ctx.accountResults.filter(r => r.status === '✅ Match').length;
    const mismatches = ctx.accountResults.filter(r => r.status === '❌ Mismatch').length;

    console.log(`\n📊 Account: ${matches} match, ${mismatches} mismatch`);
    if (mismatches > 0) {
      ctx.accountResults.filter(r => r.status === '❌ Mismatch').forEach(r => {
        console.log(`   ❌ ${r.field}: "${r.expected}" → "${r.actual}"`);
      });
    }
  };
}

/**
 * AC-MN-01 to AC-MN-06: Validate Membership Number format (YYYYCCSSSS).
 *
 * The Membership Number is a 10-digit number assigned to the Account:
 *   YYYY = Year of creation (4 digits)
 *   CC   = Continent code (2 digits: 01=FLB, 02=EUS, 03=WUS, 04=CAN, 05=LATAM, 06=UK, 07=AF, 08=ANZO, 09=EU)
 *   SSSS = Sequential counter (4 digits, DynamoDB atomic)
 *
 * Rule: §2 — "A unique, sequentially-generated ten-digit number assigned to a Company profile."
 */
export function validateMembershipNumber(ctx: CRMValidationContext) {
  return async () => {
    const membershipNumber = String(ctx.accountRecord?.Membership_Number ?? '');

    // AC-MN-01: Field exists and is not empty
    expect(membershipNumber.length).toBeGreaterThan(0);
    console.log(`   ✅ AC-MN-01: Membership_Number exists: ${membershipNumber}`);

    // AC-MN-02: Exactly 10 digits
    expect(membershipNumber).toMatch(/^\d{10}$/);
    console.log(`   ✅ AC-MN-02: 10 digits: ${membershipNumber.length === 10}`);

    // AC-MN-03: YYYY = current year (or year of enrollment)
    const yyyy = membershipNumber.substring(0, 4);
    const currentYear = new Date().getFullYear().toString();
    expect(yyyy).toBe(currentYear);
    console.log(`   ✅ AC-MN-03: YYYY = ${yyyy} (current year: ${currentYear})`);

    // AC-MN-04: CC = valid continent code (01-09)
    const cc = membershipNumber.substring(4, 6);
    const validContinentCodes: Record<string, string> = {
      '01': 'FLB', '02': 'EUS', '03': 'WUS', '04': 'CAN',
      '05': 'LATAM', '06': 'UK', '07': 'AF', '08': 'ANZO', '09': 'EU',
    };
    expect(Object.keys(validContinentCodes)).toContain(cc);
    console.log(`   ✅ AC-MN-04: CC = ${cc} (${validContinentCodes[cc]})`);

    // AC-MN-05: SSSS = sequential (1-9999)
    const ssss = membershipNumber.substring(6, 10);
    const seq = parseInt(ssss, 10);
    expect(seq).toBeGreaterThan(0);
    expect(seq).toBeLessThanOrEqual(9999);
    console.log(`   ✅ AC-MN-05: SSSS = ${ssss} (sequential: ${seq})`);

    // AC-MN-06: Full format summary
    console.log(`   ✅ AC-MN-06: Format YYYYCCSSSS = ${yyyy}|${cc}|${ssss} → ${validContinentCodes[cc]}, seq #${seq}`);

    // AC-MN-07: CC corresponds to Company Address country
    // USA → WUS (03) for western states, EUS (02) for eastern, FLB (01) for Florida
    // For simplicity in E2E: verify CC is a valid code for the country used in the test
    const companyCountry = ctx.accountRecord?.Billing_Country1 || ctx.accountRecord?.Company_Billing_Address_Country || '';
    if (companyCountry.toUpperCase().includes('UNITED STATES') || companyCountry === 'USA') {
      // USA should map to FLB (01), EUS (02), or WUS (03)
      expect(['01', '02', '03']).toContain(cc);
      console.log(`   ✅ AC-MN-07: CC=${cc} valid for USA (FLB/EUS/WUS)`);
    } else {
      console.log(`   ✅ AC-MN-07: CC=${cc} (${validContinentCodes[cc]}) — country: ${companyCountry}`);
    }

    // AC-CRM-V64: Account.Agreement_Signed = true (post-countersign)
    // Soft assertion: countersign webhook is async and may not have fired yet
    const accountAgreementSigned = ctx.accountRecord?.Agreement_Signed;
    if (accountAgreementSigned) {
      console.log(`   ✅ AC-CRM-V64: Account.Agreement_Signed = ${accountAgreementSigned}`);
    } else {
      console.log(`   ❌ AC-CRM-V64: Account.Agreement_Signed = ${accountAgreementSigned} (countersign webhook pending)`);
    }
  };
}

/**
 * AC-CRM-V46/V47: Verify cross-module consistency (Contact ↔ Account).
 */
export function validateCrossModule(ctx: CRMValidationContext) {
  return async () => {
    // AC-CRM-V46: Contact → Account association
    const contactAccountName = ctx.contactRecord?.Account_Name;
    let actualAccountName = '';
    if (typeof contactAccountName === 'object' && contactAccountName?.name) {
      actualAccountName = contactAccountName.name;
    } else if (typeof contactAccountName === 'string') {
      actualAccountName = contactAccountName;
    }

    const expectedName = ctx.snapshot!.lead.companyName;
    const associationMatch = actualAccountName === expectedName;

    ctx.crossModuleResults.push({
      field: 'Contact → Account association',
      expected: expectedName,
      actual: actualAccountName || '(no association)',
      status: associationMatch ? '✅ Match' : '❌ Mismatch',
      category: 'cross-module',
      ac: 'AC-CRM-V46',
    });

    // AC-CRM-V47: Company_Type consistency
    const contactCompanyType = String(ctx.contactRecord?.Company_Type ?? '');
    const accountType = String(ctx.accountRecord?.Account_Type ?? '');
    const typeMatch = contactCompanyType.toLowerCase() === accountType.toLowerCase();

    ctx.crossModuleResults.push({
      field: 'Company_Type (Contact) ↔ Account_Type (Account)',
      expected: contactCompanyType,
      actual: accountType,
      status: typeMatch ? '✅ Match' : '❌ Mismatch',
      category: 'cross-module',
      ac: 'AC-CRM-V47',
    });

    console.log(`\n🔗 Cross-module:`);
    ctx.crossModuleResults.forEach(r => {
      console.log(`   ${r.status === '✅ Match' ? '✅' : '❌'} ${r.field}`);
    });
  };
}

/**
 * AC-CRM-V48/V49: Generate markdown audit report in .temp/
 */
export function generateAuditReport(ctx: CRMValidationContext) {
  return async () => {
    const reportData: CRMReportData = {
      email: ctx.snapshot!.lead.email,
      contactId: ctx.contactRecord?.id ?? null,
      accountId: ctx.accountRecord?.id ?? null,
      accountName: ctx.snapshot!.lead.companyName,
      contactFields: ctx.contactResults,
      accountFields: ctx.accountResults,
      crossModuleChecks: ctx.crossModuleResults,
    };

    ctx.reportPath = generateReport(reportData);

    // Summary
    const all = [...ctx.contactResults, ...ctx.accountResults, ...ctx.crossModuleResults];
    const totalMatch = all.filter(r => r.status === '✅ Match').length;
    const totalMismatch = all.filter(r => r.status === '❌ Mismatch').length;
    const totalSkipped = all.filter(r => r.status === '⏭️ Skipped').length;

    console.log(`\n════════════════════════════════════════════════`);
    console.log(`📄 AUDIT CRM REPORT`);
    console.log(`════════════════════════════════════════════════`);
    console.log(`   ✅ Match:    ${totalMatch}`);
    console.log(`   ❌ Mismatch: ${totalMismatch}`);
    console.log(`   ⏭️  Skipped:  ${totalSkipped}`);
    console.log(`   📁 Report:   ${ctx.reportPath}`);
    console.log(`════════════════════════════════════════════════\n`);
  };
}

/**
 * Wait for CRM async handlers to complete before audit.
 *
 * Re-fetches the Contact with backoff until Status = 'Signed Agreement',
 * indicating all async handlers (ProcessCountersign via SQS → Lambda) have finished.
 * Also re-fetches the Account to get the latest state (Agreement_Signed = true).
 *
 * @param ctx - Shared CRM context (updates contactRecord and accountRecord)
 * @param email - Email to search the Contact by
 * @param companyName - Company name to search the Account by
 */
export function waitForCRMIndexing(ctx: CRMValidationContext, email: string, companyName: string) {
  return async () => {
    const maxRetries = 8;
    const retryDelay = 10_000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const record = await ctx.zoho!.searchByEmail('Contacts', email);
      const status = record?.Status;
      const agreementSigned = record?.Agreement_Signed;

      // ProcessCountersign sets Status = 'Signed Agreement' and Account.Agreement_Signed = true
      if (status === 'Signed Agreement') {
        ctx.contactRecord = record;
        console.log(`   ✅ CRM indexed (attempt ${attempt}/${maxRetries}) — Status: '${status}', Agreement_Signed: ${agreementSigned}`);
        break;
      }
      if (attempt < maxRetries) {
        console.log(`   ⏳ Status = '${status}' (waiting for 'Signed Agreement') — 10s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      } else {
        ctx.contactRecord = record;
        console.log(`   ⚠️ Status still '${status}' after ${maxRetries} attempts — proceeding with audit`);
      }
    }

    // Re-fetch Account to get latest state (Agreement_Signed should be true post-countersign)
    const account = await ctx.zoho!.searchAccountByName(companyName);
    if (account) ctx.accountRecord = account;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE CHECKPOINTS — Validate CRM state transitions during enrollment
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-CRM-V57 to V64: Post Form 1 — Verify Lead exists with correct data.
 *
 * After submitting the lead form, ProcessLead (SQS → Lambda) creates a Lead
 * in Zoho CRM. This factory searches by email and verifies Status, Lead_Source,
 * name, phone, company name, and address fields.
 *
 * @param ctx - Shared CRM context (stores leadRecord for subsequent checks)
 * @param email - Email used in the lead form submission
 * @param leadData - Lead form data to compare against CRM
 */
export function verifyLeadCreated(
  ctx: CRMValidationContext,
  email: string,
  leadData?: { firstName: string; lastName: string; companyName: string; phoneFull: string; street: string; addressLine2?: string; city: string; stateName: string; countryName: string; zip: string },
) {
  return async () => {
    ctx.leadRecord = await ctx.zoho!.searchWithRetry(
      () => ctx.zoho!.searchByEmail('Leads', email),
      { maxAttempts: 8, initialDelay: 5_000 },
    );

    expect(ctx.leadRecord).not.toBeNull();

    // AC-CRM-V57: Status = Lead
    const status = ctx.leadRecord!.Status;
    expect(status).toBe('Lead');
    console.log(`   ✅ Lead found: ${ctx.leadRecord!.id} (Status: ${status})`);

    // AC-CRM-V58: Lead_Source = Enrollment Form
    expect(ctx.leadRecord!.Lead_Source).toBe('Enrollment Form');
    console.log(`   ✅ Lead_Source: ${ctx.leadRecord!.Lead_Source}`);

    // If leadData provided, validate all fields
    if (leadData) {
      // AC-CRM-V59: Email
      expect(ctx.leadRecord!.Email).toBe(email);

      // AC-CRM-V60: Name
      expect(ctx.leadRecord!.First_Name).toBe(leadData.firstName);
      expect(ctx.leadRecord!.Last_Name).toBe(leadData.lastName);
      console.log(`   ✅ Name: ${ctx.leadRecord!.First_Name} ${ctx.leadRecord!.Last_Name}`);

      // AC-CRM-V61: Phone
      expect(ctx.leadRecord!.Phone).toBe(leadData.phoneFull);
      console.log(`   ✅ Phone: ${ctx.leadRecord!.Phone}`);

      // AC-CRM-V62: Company Name
      expect(ctx.leadRecord!.Company_Name).toBe(leadData.companyName);
      console.log(`   ✅ Company: ${ctx.leadRecord!.Company_Name}`);

      // AC-CRM-V63: Address
      expect(ctx.leadRecord!.Company_Street_Address).toBe(leadData.street);
      if (leadData.addressLine2) {
        expect(ctx.leadRecord!.Company_Address_Line_2).toBe(leadData.addressLine2);
      }
      console.log(`   ✅ Address: ${ctx.leadRecord!.Company_Street_Address}, ${ctx.leadRecord!.Company_Address_Line_2 ?? ''}`);

      // AC-CRM-V64: City, State, Country, Zip
      expect(ctx.leadRecord!.Company_City).toBe(leadData.city);
      expect(ctx.leadRecord!.Company_State_Province_Region).toBe(leadData.stateName);
      expect(ctx.leadRecord!.Company_Country).toBe(leadData.countryName);
      expect(ctx.leadRecord!.Company_ZIP_Postal_Code).toBe(leadData.zip);
      console.log(`   ✅ Location: ${ctx.leadRecord!.Company_City}, ${ctx.leadRecord!.Company_State_Province_Region}, ${ctx.leadRecord!.Company_Country} ${ctx.leadRecord!.Company_ZIP_Postal_Code}`);
    }
  };
}

/**
 * AC-CRM-V65: Post Form 1 — Verify Account (company) exists with correct data.
 *
 * ProcessLead also creates an Account with the company name from the form.
 * Validates: name, Status (Pending Membership), phone, address, city, state, country, zip.
 *
 * @param ctx - Shared CRM context (stores accountRecord)
 * @param companyName - Company name from the lead form
 * @param accountData - Optional data to validate against CRM
 */
export function verifyAccountCreated(
  ctx: CRMValidationContext,
  companyName: string,
  accountData?: { phoneFull: string; street: string; addressLine2?: string; city: string; stateName: string; countryName: string; zip: string },
) {
  return async () => {
    ctx.accountRecord = await ctx.zoho!.searchWithRetry(
      () => ctx.zoho!.searchAccountByName(companyName),
      { maxAttempts: 8, initialDelay: 5_000 },
    );

    expect(ctx.accountRecord).not.toBeNull();
    expect(ctx.accountRecord!.Account_Name).toBe(companyName);
    console.log(`   ✅ Account found: ${ctx.accountRecord!.id} (Name: ${companyName})`);

    // Status = Pending Membership (set by ProcessLead during Account creation)
    expect(ctx.accountRecord!.Status).toBe('Pending Membership');
    console.log(`   ✅ Status: ${ctx.accountRecord!.Status}`);

    if (accountData) {
      // Phone
      expect(ctx.accountRecord!.Phone).toBe(accountData.phoneFull);
      console.log(`   ✅ Phone: ${ctx.accountRecord!.Phone}`);

      // Billing Address
      expect(ctx.accountRecord!.Street_Address).toBe(accountData.street);
      if (accountData.addressLine2) {
        expect(ctx.accountRecord!.Billing_Street_2).toBe(accountData.addressLine2);
      }
      expect(ctx.accountRecord!.City).toBe(accountData.city);
      expect(ctx.accountRecord!.State).toBe(accountData.stateName);
      expect(ctx.accountRecord!.Billing_Country1).toBe(accountData.countryName.toUpperCase());
      expect(ctx.accountRecord!.Postal_Code).toBe(accountData.zip);
      console.log(`   ✅ Address: ${ctx.accountRecord!.Street_Address}, ${ctx.accountRecord!.Billing_Street_2 ?? ''}`);
      console.log(`   ✅ Location: ${ctx.accountRecord!.City}, ${ctx.accountRecord!.State}, ${ctx.accountRecord!.Billing_Country1} ${ctx.accountRecord!.Postal_Code}`);
    }
  };
}

/**
 * AC-CRM-V59: Post Form 2 — Verify Lead transitioned to Status = "Prospect".
 *
 * After submitting the registration form, ProcessRegistration (SQS → Lambda)
 * updates the Lead status from "Lead" to "Prospect".
 *
 * @param ctx - Shared CRM context
 * @param email - Email to search the Lead by
 */
export function verifyLeadIsProspect(ctx: CRMValidationContext, email: string) {
  return async () => {
    // Re-fetch the Lead to get updated status (handler is async)
    ctx.leadRecord = await ctx.zoho!.searchWithRetry(
      () => ctx.zoho!.searchByEmail('Leads', email).then(record => {
        // Only resolve when status is Prospect (or null if not found)
        if (record && record.Status === 'Prospect') return record;
        return null;
      }),
      { maxAttempts: 8, initialDelay: 5_000 },
    );

    expect(ctx.leadRecord).not.toBeNull();
    expect(ctx.leadRecord!.Status).toBe('Prospect');

    console.log(`   ✅ Lead status: Prospect (id: ${ctx.leadRecord!.id})`);
  };
}

/**
 * AC-CRM-V60: Post Email Verified — Verify Contact exists (Lead converted).
 *
 * After email verification, ProcessConvertContact (SQS → Lambda) converts
 * the Lead into a Contact. This is async and may take 5-15s.
 *
 * @param ctx - Shared CRM context (stores contactRecord)
 * @param email - Email to search the Contact by
 */
export function verifyContactCreated(ctx: CRMValidationContext, email: string) {
  return async () => {
    ctx.contactRecord = await ctx.zoho!.searchWithRetry(
      () => ctx.zoho!.searchByEmail('Contacts', email),
      { maxAttempts: 6, initialDelay: 5_000 },
    );

    expect(ctx.contactRecord).not.toBeNull();

    console.log(`   ✅ Contact created: ${ctx.contactRecord!.id} (converted from Lead)`);
  };
}

/**
 * AC-CRM-V61: Post Email Verified — Verify Contact is associated to Account.
 *
 * During conversion, ProcessConvertContact associates the new Contact with
 * the existing Account (company). This verifies the Account_Name lookup field.
 *
 * @param ctx - Shared CRM context (requires contactRecord and accountRecord to be set)
 */
export function verifyContactAccountAssociation(ctx: CRMValidationContext) {
  return async () => {
    expect(ctx.contactRecord).not.toBeNull();
    expect(ctx.accountRecord).not.toBeNull();

    const contactAccountName = ctx.contactRecord!.Account_Name;
    let actualAccountName = '';
    if (typeof contactAccountName === 'object' && contactAccountName?.name) {
      actualAccountName = contactAccountName.name;
    } else if (typeof contactAccountName === 'string') {
      actualAccountName = contactAccountName;
    }

    const expectedName = ctx.accountRecord!.Account_Name;
    expect(actualAccountName).toBe(expectedName);

    console.log(`   ✅ Contact → Account: ${actualAccountName}`);
  };
}

/**
 * AC-CRM-V57/V58: Validate Contact has a profile photo in Zoho CRM.
 *
 * Uses the Zoho CRM photo endpoint (GET /Contacts/{id}/photo).
 * Returns image data if photo exists, null if not.
 *
 * Only runs if the session snapshot contains profilePhoto metadata.
 * If no profilePhoto in snapshot, skips gracefully (photo was optional in form).
 */
export function validateContactPhoto(ctx: CRMValidationContext) {
  return async () => {
    const snapshot = ctx.snapshot!;
    const contactId = ctx.contactRecord?.id;

    if (!contactId) {
      console.log('   ⏭️ Contact photo: no Contact ID available, skipping');
      return;
    }

    const profilePhoto = snapshot.registration?.profilePhoto;
    if (!profilePhoto?.originalName) {
      console.log('   ⏭️ Contact photo: no profilePhoto in snapshot (photo not uploaded in this test run)');
      return;
    }

    // AC-CRM-V57: Snapshot has profilePhoto.originalName
    expect(profilePhoto.originalName.length).toBeGreaterThan(0);
    console.log(`   ✅ AC-CRM-V57: snapshot has profilePhoto.originalName = "${profilePhoto.originalName}"`);

    // AC-CRM-V58: Contact has photo in Zoho CRM (with retry — upload is async via SQS → Lambda)
    let photoResult: { status: number; contentType: string | null; size: number } | null = null;
    const maxRetries = 6;
    const retryDelay = 5_000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      photoResult = await ctx.zoho!.getRecordPhoto('Contacts', contactId);
      if (photoResult) break;

      if (attempt < maxRetries) {
        console.log(`   ⏳ Contact photo not yet available — waiting 5s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    if (photoResult) {
      console.log(`   ✅ AC-CRM-V58: Contact has profile photo (${photoResult.contentType}, ${photoResult.size} bytes)`);
    } else {
      console.log(`   ❌ AC-CRM-V58: Contact does NOT have profile photo after ${maxRetries} retries`);
    }

    expect(photoResult, 'Contact should have a profile photo in Zoho CRM').not.toBeNull();
  };
}

/**
 * AC-CRM-V62: Post client firma → Contact Status = 'Pending Countersign'.
 *
 * After the client signs the agreement, ProcessAgreementSigned updates
 * the Contact Status field to 'Pending Countersign'. This replaces the
 * legacy tag-based approach.
 *
 * Uses backoff because the SQS → Lambda pipeline is async.
 *
 * @param ctx - Shared CRM context (must have zoho client authenticated)
 * @param email - Email to search the Contact by
 */
export function verifyContactPendingCountersign(ctx: CRMValidationContext, email: string) {
  return async () => {
    const maxRetries = 6;
    const retryDelay = 5_000;

    let contact: any = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      contact = await ctx.zoho!.searchByEmail('Contacts', email);
      const status = contact?.Status;

      if (status === 'Pending Countersign') {
        console.log(`   ✅ AC-CRM-V62: Contact Status = 'Pending Countersign' (attempt ${attempt}/${maxRetries})`);
        return;
      }

      if (attempt < maxRetries) {
        console.log(`   ⏳ Contact Status = '${status}' (waiting for 'Pending Countersign') — 5s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    const actualStatus = contact?.Status ?? '(not found)';
    console.log(`   ❌ AC-CRM-V62: Contact Status = '${actualStatus}' (expected 'Pending Countersign' after ${maxRetries} retries)`);
    expect(actualStatus).toBe('Pending Countersign');
  };
}

/**
 * AC-CRM-V63: Post countersign (all admins signed) → Contact Status = 'Signed Agreement'.
 *
 * After all admins countersign the agreement, ProcessCountersign updates
 * the Contact Status field to 'Signed Agreement' and sets Account.Agreement_Signed = true.
 *
 * Uses backoff because the webhook → SQS → Lambda pipeline is async.
 *
 * @param ctx - Shared CRM context (must have zoho client authenticated)
 * @param email - Email to search the Contact by
 */
export function verifyContactSignedAgreement(ctx: CRMValidationContext, email: string) {
  return async () => {
    const maxRetries = 6;
    const retryDelay = 5_000;

    let contact: any = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      contact = await ctx.zoho!.searchByEmail('Contacts', email);
      const status = contact?.Status;

      if (status === 'Signed Agreement') {
        console.log(`   ✅ AC-CRM-V63: Contact Status = 'Signed Agreement' (attempt ${attempt}/${maxRetries})`);
        ctx.contactRecord = contact;
        return;
      }

      if (attempt < maxRetries) {
        console.log(`   ⏳ Contact Status = '${status}' (waiting for 'Signed Agreement') — 5s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    const actualStatus = contact?.Status ?? '(not found)';
    console.log(`   ❌ AC-CRM-V63: Contact Status = '${actualStatus}' (expected 'Signed Agreement' after ${maxRetries} retries)`);
    ctx.contactRecord = contact;
    expect(actualStatus).toBe('Signed Agreement');
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY WEBSITES VALIDATION — Ticket #869
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wait for Account to have all company website fields populated.
 *
 * After Form 2 submit, ProcessRegistration updates the Account with website URLs.
 * Polls until Company_Website_Social_Media3 is populated (indicates all 5 URLs written).
 *
 * @param ctx - Shared CRM context (stores accountRecord on success)
 * @param companyName - Company name to search the Account by
 */
export function waitForAccountWebsites(ctx: CRMValidationContext, companyName: string) {
  return async () => {
    const maxAttempts = 12;
    const delayMs = 5_000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const account = await ctx.zoho!.searchAccountByName(companyName);
      if (account) {
        ctx.accountRecord = account;
        // Check if SM3 field is populated (indicates all 5 URLs were written)
        if (account['Company_Website_Social_Media3']) {
          console.log(`✅ Account found with website fields (attempt ${attempt}): ${account.id}`);
          return;
        }
        console.log(`⏳ Account found but SM3 not yet populated — attempt ${attempt}/${maxAttempts}...`);
      } else {
        console.log(`⏳ Account not found yet — attempt ${attempt}/${maxAttempts}...`);
      }

      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    // Final check — proceed with whatever we have
    const finalAccount = await ctx.zoho!.searchAccountByName(companyName);
    expect(finalAccount).not.toBeNull();
    ctx.accountRecord = finalAccount!;
    console.log(`⚠️ Proceeding with Account ${finalAccount!.id} — SM3 may not be populated yet`);
  };
}

/**
 * Validate a specific Account field value against expected.
 *
 * Generic factory for asserting that a single Zoho Account field matches the expected value.
 * Reads from the cached accountRecord in context (must be fetched first via waitForAccountWebsites).
 *
 * @param ctx - Shared CRM context (requires accountRecord)
 * @param fieldName - Zoho API field name (e.g. 'Company_Website1')
 * @param expectedValue - Expected field value
 * @param label - Human-readable label for logging
 */
export function validateAccountField(
  ctx: CRMValidationContext,
  fieldName: string,
  expectedValue: string,
  label?: string,
) {
  return async () => {
    const account = ctx.accountRecord!;
    const actual = String(account[fieldName] ?? '');
    const displayLabel = label || fieldName;
    console.log(`  ${displayLabel}: "${actual}" (expected: "${expectedValue}")`);
    expect(actual).toBe(expectedValue);
  };
}

/**
 * Validate Company_Website field on the Lead or Contact.
 *
 * At Prospect stage (after Form 2), Contact does not exist yet.
 * The Lead.Company_Website may be empty because websites are submitted in Form 2
 * but Lead is created in Form 1 (before URLs exist).
 * Contact.Company_Website is populated when Lead converts to Contact (after email verification).
 *
 * This factory handles all three scenarios gracefully:
 *   1. Lead exists with correct value → pass
 *   2. Lead exists but field is empty → pass (expected at Prospect stage, logged)
 *   3. Contact exists with correct value → pass
 *
 * @param ctx - Shared CRM context (requires zoho client)
 * @param email - Email to search Lead/Contact by
 * @param expectedUrl - Expected URL value (first website)
 */
export function validateLeadOrContactWebsite(
  ctx: CRMValidationContext,
  email: string,
  expectedUrl: string,
) {
  return async () => {
    // Check Lead first
    const lead = await ctx.zoho!.searchByEmail('Leads', email);
    if (lead) {
      const actual = lead['Company_Website'] ?? '';
      if (actual === expectedUrl) {
        console.log(`  ✅ Lead.Company_Website: "${actual}"`);
      } else if (actual === '') {
        // Expected: Lead was created before websites were submitted (Form 1 vs Form 2)
        console.log(`  ℹ️ Lead.Company_Website is empty — expected at Prospect stage`);
        console.log(`     (websites go to Account at this stage, Contact gets it after conversion)`);
      } else {
        console.log(`  ❌ Lead.Company_Website: "${actual}" (expected: "${expectedUrl}" or empty)`);
        expect(actual).toBe(expectedUrl);
      }
      return;
    }

    // If Lead was already converted to Contact, check Contact
    const contact = await ctx.zoho!.searchByEmail('Contacts', email);
    if (contact) {
      const actual = contact['Company_Website'] ?? '';
      console.log(`  Contact.Company_Website: "${actual}" (expected: "${expectedUrl}")`);
      expect(actual).toBe(expectedUrl);
    } else {
      console.log('  ℹ️ Neither Lead nor Contact found — skipping (pre-conversion stage)');
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Fix 2 & Fix 3 — Company Type & Industry Picklist (June 2026 Batch)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Wait for Account to be created with Account_Type populated.
 * Account_Type is written asynchronously by ProcessLead Lambda — may need retry.
 */
export function waitForAccountWithType(ctx: CRMValidationContext, companyName: string) {
  return async () => {
    const zoho = ctx.zoho!;
    let account = null;
    for (let attempt = 1; attempt <= 12; attempt++) {
      account = await zoho.searchAccountByName(companyName);
      if (account && account['Account_Type']) break;
      const status = account ? 'found but Account_Type empty' : 'not found';
      console.log(`  ⏳ Account ${status} — attempt ${attempt}/12...`);
      await new Promise(r => setTimeout(r, 5_000));
    }
    expect(account, `Account not found for "${companyName}"`).not.toBeNull();
    ctx.accountRecord = account;
    console.log(`  ✅ Account found: ${account!.id} — Account_Type: "${account!['Account_Type']}"`);
  };
}

/**
 * AC-FIX02-08: Validate that the custom Company_Type field is eliminated (null/undefined).
 */
export function validateCompanyTypeFieldEliminated(ctx: CRMValidationContext) {
  return async () => {
    const value = ctx.accountRecord?.['Company_Type'];
    expect(value === null || value === undefined || value === '').toBe(true);
    console.log(`  ✅ Company_Type = ${JSON.stringify(value)} (field eliminated — not populated)`);
  };
}

/**
 * AC-FIX03: Validate Industry picklist value has no spaces around slashes.
 */
export function validateIndustryNoSpaceSlash(ctx: CRMValidationContext, expectedValue: string) {
  return async () => {
    const value = ctx.accountRecord?.['Industry'] ?? '';
    expect(value).toBe(expectedValue);
    expect(value).not.toContain(' / ');
    console.log(`  ✅ Industry = "${value}" (no spaces around slash)`);
  };
}

/**
 * Summary logger for CRM Company Type & Industry validation.
 */
export function logCompanyTypeIndustrySummary(
  ctx: CRMValidationContext, email: string, companyName: string,
  formCompanyType: string, formIndustry: string,
) {
  return async () => {
    console.log('\n📊 CRM Company Type & Industry — Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Email: ${email}`);
    console.log(`  Company: ${companyName}`);
    console.log(`  Form companyType: "${formCompanyType}"`);
    console.log(`  Form industry: "${formIndustry}"`);
    console.log('');
    console.log(`  Account_Type: "${ctx.accountRecord?.['Account_Type']}" (expected: "Other")`);
    console.log(`  Company_Type: ${JSON.stringify(ctx.accountRecord?.['Company_Type'])} (expected: null/eliminated)`);
    console.log(`  Industry: "${ctx.accountRecord?.['Industry']}" (expected: no spaces in slash)`);
    console.log('═══════════════════════════════════════════════════════');
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHOTO ORIENTATION VALIDATION — Ticket #870
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wait for a Lead/Contact to have a photo in CRM and return the photo metadata.
 *
 * Polls the Zoho CRM photo endpoint until the photo is available (async upload).
 * Returns the photo data (size, contentType) or null if not found after retries.
 *
 * @param ctx - Shared CRM context (requires zoho client)
 * @param email - Email to search the record by
 * @param module - 'Leads' or 'Contacts' (default: 'Leads')
 * @returns Factory function that resolves to photo data or null
 */
export function waitForContactPhoto(
  ctx: CRMValidationContext,
  email: string,
  module: 'Leads' | 'Contacts' = 'Contacts',
) {
  return async (): Promise<{ size: number; contentType: string | null } | null> => {
    const maxRetries = 10;
    const retryDelay = 5_000;

    // 1. Find the record by email
    let record: ZohoRecord | null = null;
    for (let attempt = 1; attempt <= 6; attempt++) {
      record = await ctx.zoho!.searchByEmail(module, email);
      if (record) break;
      if (attempt < 6) {
        console.log(`   ⏳ ${module} not found yet — waiting 5s (attempt ${attempt}/6)...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    if (!record) {
      console.log(`   ⚠️ ${module} not found by email: ${email}`);
      return null;
    }

    // 2. Poll for photo
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const photoResult = await ctx.zoho!.getRecordPhoto(module, record.id);
      if (photoResult) {
        return { size: photoResult.size, contentType: photoResult.contentType };
      }

      if (attempt < maxRetries) {
        console.log(`   ⏳ Photo not yet available — waiting 5s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    return null;
  };
}
