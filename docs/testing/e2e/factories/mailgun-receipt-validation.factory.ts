/**
 * Mailgun Receipt Validation Factory — AC-EN-01 to AC-EN-09.
 *
 * Validates that the enrollment completed email (D3) includes a permanent
 * Stripe receipt link per the Rules Document "New Subscription" notification.
 * Covers: template content, conditional rendering, producer wiring, and delivery.
 *
 * Related files:
 * - packages/cloud/core/templates/enrollment--completed.html (template under test)
 * - packages/apps/enrollment/infra/functions/EmailDispatch.ts (consumer)
 * - packages/apps/enrollment/infra/functions/zoho/ProcessPayment.ts (producer)
 * - packages/cloud/stripe/infra/functions/GetSubscriptionDetails.ts (Stripe data source)
 * - e2e/results/enrollment-email-notifications/acceptance-criteria-checklist.md
 */

import { expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ─── Path resolution ────────────────────────────────────────────────────────

const SPA_ROOT = process.cwd();
const TEMPLATE_PATH = join(SPA_ROOT, '..', '..', '..', '..', 'cloud', 'core', 'templates', 'enrollment--completed.html');
const EMAIL_DISPATCH_PATH = join(SPA_ROOT, '..', '..', '..', '..', '..', 'packages', 'apps', 'enrollment', 'infra', 'functions', 'EmailDispatch.ts');
const PROCESS_PAYMENT_PATH = join(SPA_ROOT, '..', '..', '..', '..', '..', 'packages', 'apps', 'enrollment', 'infra', 'functions', 'zoho', 'ProcessPayment.ts');
const GET_SUB_DETAILS_PATH = join(SPA_ROOT, '..', '..', '..', '..', '..', 'packages', 'cloud', 'stripe', 'infra', 'functions', 'GetSubscriptionDetails.ts');

/** Read a file with existence guard. */
function readFile(path: string): string {
  expect(existsSync(path), `File not found: ${path}`).toBe(true);
  return readFileSync(path, 'utf8');
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-01: Template has receipt reference text
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-01: Template completed has "Your receipt is available below" (Rules D3 receipt reference). */
export function validateReceiptReferenceText() {
  return async () => {
    const content = readFile(TEMPLATE_PATH);
    expect(content).toMatch(/[Yy]our receipt is available/i);
    console.log('   ✅ AC-EN-01: Template has receipt reference text ("Your receipt is available below")');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-02: Template has "View Receipt" button with {{receiptUrl}}
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-02: Template has CTA button "View Receipt" with href={{receiptUrl}}. */
export function validateReceiptButton() {
  return async () => {
    const content = readFile(TEMPLATE_PATH);
    expect(content).toContain('>View Receipt</a>');
    expect(content).toMatch(/href="{{receiptUrl}}"[^>]*>View Receipt<\/a>/s);
    // Button has styled appearance (same design system as other CTAs)
    expect(content).toContain('background-color: #3b82f6');
    console.log('   ✅ AC-EN-02: Template has "View Receipt" button (blue, href={{receiptUrl}})');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-03: Template uses {{#if receiptUrl}} conditional
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-03: Template uses Handlebars conditional for receipt (graceful when no URL). */
export function validateReceiptConditional() {
  return async () => {
    const content = readFile(TEMPLATE_PATH);
    expect(content).toContain('{{#if receiptUrl}}');
    expect(content).toContain('{{/if}}');
    console.log('   ✅ AC-EN-03: Template uses {{#if receiptUrl}} conditional (graceful degradation)');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-04: Template has fallback link with {{receiptUrl}} visible
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-04: Template has fallback link showing {{receiptUrl}} as text. */
export function validateReceiptFallbackLink() {
  return async () => {
    const content = readFile(TEMPLATE_PATH);
    expect(content).toContain('copy and paste this link');
    expect(content).toMatch(/<a href="{{receiptUrl}}">{{receiptUrl}}<\/a>/);
    console.log('   ✅ AC-EN-04: Template has fallback link ({{receiptUrl}} as visible text)');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-05: ProcessPayment passes receiptUrl in SQS email message
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-05: ProcessPayment includes receiptUrl in the SQS message for EmailDispatch. */
export function validateProcessPaymentPassesReceiptUrl() {
  return async () => {
    const content = readFile(PROCESS_PAYMENT_PATH);
    expect(content).toContain('receiptUrl');
    // Must be in the email SQS message JSON
    expect(content).toMatch(/MessageBody.*receiptUrl|receiptUrl.*MessageBody/s);
    console.log('   ✅ AC-EN-05: ProcessPayment passes receiptUrl in SQS email message');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-06: EmailDispatch forwards receiptUrl as template variable
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-06: EmailDispatch includes receiptUrl in the variables passed to the template. */
export function validateEmailDispatchForwardsReceiptUrl() {
  return async () => {
    const content = readFile(EMAIL_DISPATCH_PATH);
    expect(content).toContain('receiptUrl');
    // Must be inside the Completed builder's variables object
    expect(content).toMatch(/Completed[\s\S]*?variables[\s\S]*?receiptUrl/);
    console.log('   ✅ AC-EN-06: EmailDispatch forwards receiptUrl in template variables');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-07: GetSubscriptionDetails returns receiptUrl from Stripe Charge
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-07: GetSubscriptionDetails Lambda exposes receiptUrl from the Stripe Charge. */
export function validateGetSubscriptionDetailsReturnsReceiptUrl() {
  return async () => {
    const content = readFile(GET_SUB_DETAILS_PATH);
    expect(content).toMatch(/receipt_url|receiptUrl/);
    console.log('   ✅ AC-EN-07: GetSubscriptionDetails exposes receiptUrl from Stripe Charge');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-08: Email delivered contains real Stripe receipt URL
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-EN-08: Welcome email body contains a real Stripe receipt link (pay.stripe.com).
 * NOTE: This AC is validated via full-enrollment-v4 step 23 (Mailosaur).
 * Here we verify the template structure supports it — the E2E validates delivery.
 */
export function validateReceiptUrlInTemplate() {
  return async () => {
    const content = readFile(TEMPLATE_PATH);
    // The template accepts receiptUrl which will be a pay.stripe.com URL at runtime
    expect(content).toContain('{{receiptUrl}}');
    // href points to the variable (Stripe will provide the real URL)
    expect(content).toMatch(/href="{{receiptUrl}}"/);
    console.log('   ✅ AC-EN-08: Template wired for receipt URL (pay.stripe.com at runtime)');
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-EN-09: Template without receiptUrl does not show button (graceful)
// ═════════════════════════════════════════════════════════════════════════════

/** AC-EN-09: When receiptUrl is empty/falsy, the {{#if}} block hides the button. */
export function validateGracefulDegradation() {
  return async () => {
    const content = readFile(TEMPLATE_PATH);
    // The button and fallback are INSIDE the {{#if receiptUrl}} block
    const ifBlock = content.match(/{{#if receiptUrl}}([\s\S]*?){{\/if}}/);
    expect(ifBlock, '{{#if receiptUrl}}...{{/if}} block must exist').toBeTruthy();

    // The button is inside the conditional block (not outside)
    const blockContent = ifBlock![1];
    expect(blockContent).toContain('View Receipt');
    expect(blockContent).toContain('{{receiptUrl}}');

    // The sign-off is OUTSIDE the conditional (always shows)
    const afterIf = content.split('{{/if}}')[1] || '';
    expect(afterIf).toContain('Best regards');

    console.log('   ✅ AC-EN-09: Button is inside {{#if}} — hidden when receiptUrl is empty (graceful)');
  };
}
