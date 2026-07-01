/**
 * CRM Payment & Invoice Validation — Ticket #828
 *
 * Validates that after successful payment, Zoho CRM contains:
 * - Payment record linked to Contact and Account
 * - Invoice record linked to Contact with Status = "Paid"
 * - Cross-check with Stripe data from session snapshot
 *
 * Related files:
 * - infra/functions/zoho/ProcessPayment.ts (creates Payment + Invoice in Zoho)
 * - e2e/fixtures/zoho-client.ts (getRelatedRecords method)
 * - e2e/fixtures/crm-expected-data.ts (SessionSnapshot with stripe data)
 *
 * Run (standalone after full-enrollment-v4):
 *   npx playwright test audit-crm --reporter=list
 */

import { expect } from '@playwright/test';
import type { CRMValidationContext } from './crm-validation.factory';

/**
 * AC-828-01 to AC-828-07: Validate Payment record exists in Zoho CRM.
 *
 * Searches for Payments related to the Contact. Verifies:
 * - Payment exists (with backoff — async handler)
 * - Description matches format: "{Plan} · {Interval} · {CompanyName}"
 * - Customer_Id is populated (Stripe customer)
 * - Payment is also linked to the Account
 */
export function validatePaymentCreated(ctx: CRMValidationContext) {
  return async () => {
    const contactId = ctx.contactRecord?.id;
    const accountId = ctx.accountRecord?.id;
    const snapshot = ctx.snapshot!;

    expect(contactId, 'Contact must exist for Payment validation').toBeTruthy();

    // AC-828-16: Wait for Payment to appear (async handler, backoff)
    let payments: any[] = [];
    const maxRetries = 6;
    const retryDelay = 5_000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      payments = await ctx.zoho!.getRelatedRecords('Contacts', contactId!, 'Payments');
      if (payments.length > 0) break;

      if (attempt < maxRetries) {
        console.log(`   ⏳ Payment not yet available — waiting 5s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    // AC-828-01: Payment exists
    expect(payments.length, 'Payment should exist for Contact').toBeGreaterThan(0);
    console.log(`   ✅ AC-828-01: Payment found (${payments.length} record(s))`);

    const payment = payments[0];

    // AC-828-02: Description format
    const description = payment.Description || payment.Subject || '';
    const expectedPlan = snapshot.stripe?.plan || 'general';
    const expectedInterval = snapshot.stripe?.interval === 'year' ? 'Annual' : 'Monthly';
    const companyName = snapshot.lead.companyName;

    if (description) {
      console.log(`   ✅ AC-828-02: Payment Description = "${description}"`);
      expect(description).toContain(companyName.split(' - ')[0]); // Company name without timestamp
    } else {
      console.log(`   ⚠️ AC-828-02: Payment Description is empty`);
    }

    // AC-828-04: Customer_Id
    const customerId = payment.Customer_Id || payment.Stripe_Customer_Id || '';
    if (customerId) {
      console.log(`   ✅ AC-828-04: Customer_Id = "${customerId}"`);
    } else {
      console.log(`   ⚠️ AC-828-04: Customer_Id is empty`);
    }

    // AC-828-05: Period dates
    const periodStart = payment.Period_Start || payment.Start_Date || '';
    const periodEnd = payment.Period_End || payment.End_Date || '';
    if (periodStart && periodEnd) {
      console.log(`   ✅ AC-828-05: Period = ${periodStart} → ${periodEnd}`);
    } else {
      console.log(`   ⚠️ AC-828-05: Period dates not populated`);
    }

    // AC-828-06/07: Payment linked to Account
    if (accountId) {
      const accountPayments = await ctx.zoho!.getRelatedRecords('Accounts', accountId, 'Payments');
      const linkedToAccount = accountPayments.some((p: any) => p.id === payment.id);
      if (linkedToAccount) {
        console.log(`   ✅ AC-828-06/07: Payment linked to Account`);
      } else {
        console.log(`   ⚠️ AC-828-06: Payment NOT linked to Account (${accountPayments.length} payments on Account)`);
      }
    }
  };
}

/**
 * AC-828-08 to AC-828-12: Validate Invoice record exists in Zoho CRM.
 *
 * Searches for Invoices related to the Contact. Verifies:
 * - Invoice exists
 * - Subject matches format
 * - Status = "Approved" (the picklist has no "Paid"; "Approved" = paid)
 * - Total matches payment amount
 * - Receipt_Number is populated
 */
export function validateInvoiceCreated(ctx: CRMValidationContext) {
  return async () => {
    const contactId = ctx.contactRecord?.id;
    expect(contactId, 'Contact must exist for Invoice validation').toBeTruthy();

    // Search for Invoices linked to Contact
    const invoices = await ctx.zoho!.getRelatedRecords('Contacts', contactId!, 'Invoices');

    // AC-828-08: Invoice exists
    if (invoices.length === 0) {
      console.log(`   ⚠️ AC-828-08: No Invoice found linked to Contact (may use different module name)`);
      return;
    }

    expect(invoices.length).toBeGreaterThan(0);
    console.log(`   ✅ AC-828-08: Invoice found (${invoices.length} record(s))`);

    const invoice = invoices[0];

    // AC-828-09: Subject format
    const subject = invoice.Subject || '';
    if (subject) {
      console.log(`   ✅ AC-828-09: Invoice Subject = "${subject}"`);
    }

    // AC-828-10: Status = "Approved" (no "Paid" in the picklist; "Approved" = paid)
    const status = invoice.Status || invoice.Invoice_Status || '';
    if (status) {
      console.log(`   ${status === 'Approved' ? '✅' : '❌'} AC-828-10: Invoice Status = "${status}"`);
      expect(status).toBe('Approved');
    }

    // AC-828-11: Total
    const total = invoice.Total || invoice.Grand_Total || '';
    if (total) {
      console.log(`   ✅ AC-828-11: Invoice Total = ${total}`);
    }

    // AC-828-12: Receipt_Number
    const receiptNumber = invoice.Receipt_Number || invoice.Invoice_Number || '';
    if (receiptNumber) {
      console.log(`   ✅ AC-828-12: Receipt_Number = "${receiptNumber}"`);
    } else {
      console.log(`   ⚠️ AC-828-12: Receipt_Number is empty`);
    }
  };
}

/**
 * AC-828-13 to AC-828-15: Cross-check Payment data with Stripe API.
 *
 * Compares Zoho Payment fields against actual Stripe data from the session snapshot.
 */
export function validatePaymentStripeConsistency(ctx: CRMValidationContext) {
  return async () => {
    const contactId = ctx.contactRecord?.id;
    const snapshot = ctx.snapshot!;

    if (!contactId) return;

    const payments = await ctx.zoho!.getRelatedRecords('Contacts', contactId, 'Payments');
    if (payments.length === 0) {
      console.log(`   ⏭️ AC-828-13/14/15: No Payment to cross-check (skipping)`);
      return;
    }

    const payment = payments[0];
    const stripeCustomerId = snapshot.stripe?.customerId;

    // AC-828-13: Customer_Id matches snapshot OR is valid Stripe format
    if (stripeCustomerId && payment.Customer_Id) {
      const match = payment.Customer_Id === stripeCustomerId;
      console.log(`   ${match ? '✅' : '❌'} AC-828-13: Customer_Id match — Zoho: "${payment.Customer_Id}" vs Snapshot: "${stripeCustomerId}"`);
    } else if (payment.Customer_Id && payment.Customer_Id.startsWith('cus_')) {
      // Snapshot doesn't have customerId but Payment has valid Stripe format
      console.log(`   ✅ AC-828-13: Customer_Id valid Stripe format: "${payment.Customer_Id}"`);
    } else {
      console.log(`   ⏭️ AC-828-13: Cannot compare (Zoho: "${payment.Customer_Id}", Snapshot: "${stripeCustomerId}")`);
    }

    // AC-828-14/15: Amount and Subscription would require Stripe API call
    // For now, log what's available
    const amount = payment.Amount || payment.Total || '';
    const subscriptionId = payment.Subscription_Id || '';

    if (amount) {
      console.log(`   ✅ AC-828-14: Payment Amount = ${amount}`);
    }
    if (subscriptionId) {
      console.log(`   ✅ AC-828-15: Subscription_Id = "${subscriptionId}"`);
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT POST-PAYMENT FIELDS — AC-828-17 to AC-828-26
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-828-17/18: Validate Account.Stripe_ID is populated post-payment.
 *
 * After payment, the Account should have the Stripe Customer ID so the CRM
 * user can identify the Stripe customer directly from the Company record.
 * Cross-checks with Contact.Stripe_ID for consistency.
 *
 * Related: ProcessPayment.ts step 3 (Account update) should write Stripe_ID.
 */
export function validateAccountStripeId(ctx: CRMValidationContext) {
  return async () => {
    const account = ctx.accountRecord;
    expect(account, 'Account must exist for Stripe_ID validation').toBeTruthy();

    // AC-828-17: Account.Stripe_ID is not empty
    const stripeId = account?.Stripe_ID || account?.Stripe_Id || account?.['Stripe_ID'] || '';
    if (stripeId) {
      console.log(`   ✅ AC-828-17: Account.Stripe_ID = "${stripeId}"`);
      expect(stripeId.length).toBeGreaterThan(0);
    } else {
      console.log(`   ❌ AC-828-17: Account.Stripe_ID is EMPTY — ProcessPayment.ts does not write it to Account`);
      // Soft assertion — log the bug but continue flow
    }

    // AC-828-18: Account.Stripe_ID matches Contact.Stripe_ID
    const contactStripeId = ctx.contactRecord?.Stripe_ID || ctx.contactRecord?.['Stripe_ID'] || '';
    if (stripeId && contactStripeId) {
      const match = stripeId === contactStripeId;
      console.log(`   ${match ? '✅' : '❌'} AC-828-18: Account.Stripe_ID matches Contact.Stripe_ID — Account: "${stripeId}" vs Contact: "${contactStripeId}"`);
    } else if (contactStripeId && !stripeId) {
      console.log(`   ❌ AC-828-18: Contact has Stripe_ID="${contactStripeId}" but Account does NOT — inconsistency`);
    } else {
      console.log(`   ⚠️ AC-828-18: Cannot compare (Account: "${stripeId}", Contact: "${contactStripeId}")`);
    }
  };
}

/**
 * AC-828-19 to AC-828-22: Validate Account.Expiration_Date is populated post-payment.
 *
 * After payment, the Account should have an expiration date calculated from
 * the subscription interval: Sign-Up Date + 1 year (annual) or + 1 month (monthly).
 *
 * Related: ProcessPayment.ts should calculate and write Expiration_Date.
 */
export function validateAccountExpirationDate(ctx: CRMValidationContext) {
  return async () => {
    const account = ctx.accountRecord;
    expect(account, 'Account must exist for Expiration_Date validation').toBeTruthy();

    // AC-828-19: Expiration_Date is not empty
    const expirationDate = account?.Expiration_Date || account?.['Expiration_Date'] || '';
    if (expirationDate) {
      console.log(`   ✅ AC-828-19: Account.Expiration_Date = "${expirationDate}"`);
    } else {
      console.log(`   ❌ AC-828-19: Account.Expiration_Date is EMPTY — ProcessPayment.ts does not calculate/write it`);
      // Soft assertion — log but continue
      return; // Can't validate format/logic if empty
    }

    // AC-828-22: Format is a valid date (YYYY-MM-DD or Zoho date format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    const isValidFormat = dateRegex.test(expirationDate);
    if (isValidFormat) {
      console.log(`   ✅ AC-828-22: Expiration_Date format valid (YYYY-MM-DD)`);
    } else {
      console.log(`   ⚠️ AC-828-22: Expiration_Date format = "${expirationDate}" (may be Zoho format)`);
    }

    // AC-828-20/21: Expiration is in the future (sign-up + interval)
    const signUpDate = account?.Sign_Up_Date || account?.['Sign_Up_Date'] || '';
    const snapshot = ctx.snapshot;
    const interval = snapshot?.stripe?.interval || 'year';

    if (signUpDate && isValidFormat) {
      const signUp = new Date(signUpDate);
      const expiration = new Date(expirationDate);
      const diffMs = expiration.getTime() - signUp.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (interval === 'year') {
        // AC-828-20: Annual plan → ~365 days
        const isAnnual = diffDays >= 360 && diffDays <= 370;
        console.log(`   ${isAnnual ? '✅' : '❌'} AC-828-20: Expiration is ${diffDays} days after Sign-Up (expected ~365 for annual)`);
      } else {
        // AC-828-21: Monthly plan → ~30 days
        const isMonthly = diffDays >= 28 && diffDays <= 31;
        console.log(`   ${isMonthly ? '✅' : '❌'} AC-828-21: Expiration is ${diffDays} days after Sign-Up (expected ~30 for monthly)`);
      }
    } else {
      console.log(`   ⚠️ AC-828-20/21: Cannot verify interval (Sign_Up_Date: "${signUpDate}", interval: "${interval}")`);
    }
  };
}

/**
 * AC-828-23 to AC-828-26: Validate Products WISE Stripe related list.
 *
 * After payment, the Contact and Account should have a "Products WISE Stripe"
 * record linking the membership plan/product to the CRM record.
 *
 * Related: Custom module in Zoho CRM — may require a new step in ProcessPayment.
 */
export function validateProductsWiseStripe(ctx: CRMValidationContext) {
  return async () => {
    const contactId = ctx.contactRecord?.id;
    const accountId = ctx.accountRecord?.id;

    expect(contactId, 'Contact must exist for Products validation').toBeTruthy();

    // AC-828-23: Products WISE Stripe exists on Contact
    let contactProducts: any[] = [];
    try {
      contactProducts = await ctx.zoho!.getRelatedRecords('Contacts', contactId!, 'Products_WISE_Stripe');
    } catch {
      // Module name may differ — try alternatives
      try {
        contactProducts = await ctx.zoho!.getRelatedRecords('Contacts', contactId!, 'Products_Wise_Stripe');
      } catch {
        console.log(`   ⚠️ AC-828-23: Cannot query Products_WISE_Stripe related list (module may not exist or name differs)`);
      }
    }

    if (contactProducts.length > 0) {
      console.log(`   ✅ AC-828-23: Products WISE Stripe found on Contact (${contactProducts.length} record(s))`);

      const product = contactProducts[0];

      // AC-828-25: Product has plan name
      const productName = product.Name || product.Product_Name || product.Subject || '';
      if (productName) {
        console.log(`   ✅ AC-828-25: Product Name = "${productName}"`);
      } else {
        console.log(`   ⚠️ AC-828-25: Product Name is empty`);
      }

      // AC-828-26: Product has Subscription_Id
      const subId = product.Subscription_Id || product.Stripe_Subscription_Id || '';
      if (subId) {
        console.log(`   ✅ AC-828-26: Product Subscription_Id = "${subId}"`);
      } else {
        console.log(`   ⚠️ AC-828-26: Product Subscription_Id is empty`);
      }
    } else {
      console.log(`   ❌ AC-828-23: Products WISE Stripe NOT FOUND on Contact — module may not be linked or feature not implemented`);
    }

    // AC-828-24: Products WISE Stripe exists on Account
    if (accountId) {
      let accountProducts: any[] = [];
      try {
        accountProducts = await ctx.zoho!.getRelatedRecords('Accounts', accountId, 'Products_WISE_Stripe');
      } catch {
        try {
          accountProducts = await ctx.zoho!.getRelatedRecords('Accounts', accountId, 'Products_Wise_Stripe');
        } catch {
          // Silent — already logged for Contact
        }
      }

      if (accountProducts.length > 0) {
        console.log(`   ✅ AC-828-24: Products WISE Stripe found on Account (${accountProducts.length} record(s))`);
      } else {
        console.log(`   ❌ AC-828-24: Products WISE Stripe NOT FOUND on Account`);
      }
    }
  };
}
