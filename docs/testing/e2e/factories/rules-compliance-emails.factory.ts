/**
 * Rules Compliance Emails Factory — Validates email template content against Rules Document.
 *
 * Reads the EmailDispatch.ts source code directly (no sending emails) to validate
 * that the templates match the Rules & Workflow Specification Manual (pg 79-80).
 *
 * This avoids costly enrollment flows — validates the SOURCE of truth (template code).
 *
 * Related files:
 * - packages/apps/enrollment/infra/functions/EmailDispatch.ts (templates)
 * - .temp/note_review_forms_enrollments.md (discrepancy report §5-6)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ReportResult } from './rules-compliance-report.factory.js';

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

/** Path to EmailDispatch.ts — goes up from e2e/factories/ to the bundle root */
const EMAIL_DISPATCH_PATH = resolve(__dir, '../../../../infra/functions/EmailDispatch.ts');

function readEmailDispatch(): string {
  return readFileSync(EMAIL_DISPATCH_PATH, 'utf8');
}

// ═════════════════════════════════════════════════════════════════════════════
// D.1 Agreement Signed Email
// ═════════════════════════════════════════════════════════════════════════════

export function validateAgreementSignedEmail(results: ReportResult[]) {
  return async () => {
    const source = readEmailDispatch();

    // AC-RC-D01: Subject should be "WISE Membership Agreement Signed!"
    const subjectMatch = source.match(/AgreementSigned.*?subject:\s*['"`](.+?)['"`]/s);
    const actualSubject = subjectMatch?.[1] ?? '(not found)';
    const expectedSubject = 'WISE Membership Agreement Signed!';
    const d01Pass = actualSubject === expectedSubject;
    results.push({
      id: 'AC-RC-D01', group: 'D',
      description: 'Agreement Signed email subject',
      expected: expectedSubject, actual: actualSubject, pass: d01Pass,
    });
    console.log(`  ${d01Pass ? '✅' : '❌'} AC-RC-D01: subject = "${actualSubject}" (expected: "${expectedSubject}")`);

    // AC-RC-D02: Body title should be "WISE Membership Agreement Signed!"
    const hasWiseMembership = source.includes('[EmailType.AgreementSigned]') &&
      source.match(/AgreementSigned.*?<h2>(.+?)<\/h2>/s);
    const bodyTitle = hasWiseMembership?.[1] ?? '(not found)';
    const d02Pass = bodyTitle.includes('WISE Membership');
    results.push({
      id: 'AC-RC-D02', group: 'D',
      description: 'Agreement Signed email body title includes "WISE Membership"',
      expected: 'WISE Membership Agreement Signed!', actual: bodyTitle, pass: d02Pass,
    });
    console.log(`  ${d02Pass ? '✅' : '❌'} AC-RC-D02: body title = "${bodyTitle}"`);

    // AC-RC-D03: Body text = "Thank you for signing your WISE Membership Agreement."
    const agreementSection = source.match(/\[EmailType\.AgreementSigned\].*?text:.*?`([\s\S]*?)`/)?.[1] ?? '';
    const hasCorrectBody = agreementSection.includes('Thank you for signing your WISE Membership Agreement');
    results.push({
      id: 'AC-RC-D03', group: 'D',
      description: 'Agreement Signed email body = Rules wording',
      expected: 'Thank you for signing your WISE Membership Agreement.',
      actual: hasCorrectBody ? '(matches)' : 'uses different wording',
      pass: hasCorrectBody,
    });
    console.log(`  ${hasCorrectBody ? '✅' : '❌'} AC-RC-D03: body text matches Rules`);

    // AC-RC-D04: NO "next step" text in email
    const hasNextStep = agreementSection.includes('next step');
    results.push({
      id: 'AC-RC-D04', group: 'D',
      description: 'Agreement Signed email: NO "next step" text',
      expected: '(should not contain "next step")',
      actual: hasNextStep ? 'contains "next step"' : '(not present)',
      pass: !hasNextStep,
    });
    console.log(`  ${!hasNextStep ? '✅' : '❌'} AC-RC-D04: "next step" ${hasNextStep ? 'PRESENT (should not be)' : 'not present'}`);

    // AC-RC-D05: CTA button = "Continue to Payment"
    const ctaMatch = source.match(/AgreementSigned.*?ctaButton\(.*?,\s*['"`](.+?)['"`]\)/s);
    const ctaText = ctaMatch?.[1] ?? '(not found)';
    const d05Pass = ctaText === 'Continue to Payment';
    results.push({
      id: 'AC-RC-D05', group: 'D',
      description: 'Agreement Signed email CTA = "Continue to Payment"',
      expected: 'Continue to Payment', actual: ctaText, pass: d05Pass,
    });
    console.log(`  ${d05Pass ? '✅' : '❌'} AC-RC-D05: CTA = "${ctaText}"`);

    // AC-RC-D06: Email deduplication (check if there's any dedup guard in code)
    // This is a BUG — the email is sent twice. We check if there's dedup logic.
    const hasDedup = source.includes('dedup') || source.includes('already_sent') || source.includes('sentAt');
    results.push({
      id: 'AC-RC-D06', group: 'D',
      description: 'Agreement Signed email: deduplication guard exists',
      expected: 'dedup logic present (prevent duplicate)',
      actual: hasDedup ? 'dedup found' : 'NO dedup guard (BUG: email arrives twice)',
      pass: hasDedup,
    });
    console.log(`  ${hasDedup ? '✅' : '❌'} AC-RC-D06: dedup guard = ${hasDedup}`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// D.2 Welcome Email (post-payment)
// ═════════════════════════════════════════════════════════════════════════════

export function validateWelcomeEmail(results: ReportResult[]) {
  return async () => {
    const source = readEmailDispatch();

    // AC-RC-D07: Body should mention receipt + 5 business days
    const completedSection = source.match(/\[EmailType\.Completed\].*?text:.*?`([\s\S]*?)`/)?.[1] ?? '';
    const hasReceipt = completedSection.includes('receipt');
    results.push({
      id: 'AC-RC-D07', group: 'D',
      description: 'Welcome email body mentions "receipt"',
      expected: 'Thank you for your payment. Your receipt is attached...',
      actual: hasReceipt ? 'mentions receipt' : 'NO receipt mention (different wording)',
      pass: hasReceipt,
    });
    console.log(`  ${hasReceipt ? '✅' : '❌'} AC-RC-D07: Welcome email mentions receipt = ${hasReceipt}`);

    // AC-RC-D08: "five (5) business days"
    const hasFiveDays = completedSection.includes('five') || completedSection.includes('5') && completedSection.includes('business');
    results.push({
      id: 'AC-RC-D08', group: 'D',
      description: 'Welcome email mentions "five (5) business days"',
      expected: 'Please allow up to five (5) business days...',
      actual: hasFiveDays ? '(present)' : 'NOT present',
      pass: hasFiveDays,
    });
    console.log(`  ${hasFiveDays ? '✅' : '❌'} AC-RC-D08: "5 business days" = ${hasFiveDays}`);

    // AC-RC-D09: "email notification once this is complete"
    const hasNotification = completedSection.includes('notification') && completedSection.includes('complete');
    results.push({
      id: 'AC-RC-D09', group: 'D',
      description: 'Welcome email mentions "email notification once complete"',
      expected: 'You will receive an email notification once this is complete.',
      actual: hasNotification ? '(present)' : 'NOT present',
      pass: hasNotification,
    });
    console.log(`  ${hasNotification ? '✅' : '❌'} AC-RC-D09: notification notice = ${hasNotification}`);

    // AC-RC-D10: Receipt attachment (PDF)
    const hasAttachment = source.includes('attachment') || source.includes('receipt') && source.includes('pdf');
    results.push({
      id: 'AC-RC-D10', group: 'D',
      description: 'Welcome email has receipt attachment (PDF)',
      expected: '[RECEIPT ATTACHED]',
      actual: hasAttachment ? 'attachment logic present' : 'NO attachment (not implemented)',
      pass: hasAttachment,
    });
    console.log(`  ${hasAttachment ? '✅' : '❌'} AC-RC-D10: receipt attachment = ${hasAttachment}`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// D.3 Payment Transaction Email (ALL payments)
// ═════════════════════════════════════════════════════════════════════════════

export function validatePaymentTransactionEmail(results: ReportResult[]) {
  return async () => {
    const source = readEmailDispatch();

    // AC-RC-D11: Payment Transaction email type exists
    const hasPaymentType = source.includes('PaymentTransaction') || source.includes('payment_transaction');
    results.push({
      id: 'AC-RC-D11', group: 'D',
      description: 'Payment Transaction email type exists',
      expected: 'EmailType.PaymentTransaction builder exists',
      actual: hasPaymentType ? 'exists' : 'NOT IMPLEMENTED',
      pass: hasPaymentType,
    });
    console.log(`  ${hasPaymentType ? '✅' : '❌'} AC-RC-D11: PaymentTransaction email = ${hasPaymentType ? 'exists' : 'NOT IMPLEMENTED'}`);

    // AC-RC-D12: Payment Transaction body
    results.push({
      id: 'AC-RC-D12', group: 'D',
      description: 'Payment Transaction email body = Rules wording',
      expected: 'Thank you for your WISE Membership payment. Your receipt is attached.',
      actual: hasPaymentType ? '(check content)' : 'NOT IMPLEMENTED',
      pass: false, // Not implemented yet
    });
    console.log(`  ❌ AC-RC-D12: PaymentTransaction body — NOT IMPLEMENTED`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// D.4 Post-Countersign Email
// ═════════════════════════════════════════════════════════════════════════════

export function validatePostCountersignEmail(results: ReportResult[]) {
  return async () => {
    const source = readEmailDispatch();

    // AC-RC-D13: Post-countersign email type exists
    const hasCountersign = source.includes('Countersign') || source.includes('countersign') || source.includes('PostSign');
    results.push({
      id: 'AC-RC-D13', group: 'D',
      description: 'Post-Countersign email type exists',
      expected: 'Email with download link after all parties sign',
      actual: hasCountersign ? 'exists' : 'NOT IMPLEMENTED',
      pass: hasCountersign,
    });
    console.log(`  ${hasCountersign ? '✅' : '❌'} AC-RC-D13: Post-Countersign email = ${hasCountersign ? 'exists' : 'NOT IMPLEMENTED'}`);

    // AC-RC-D14: Post-countersign body
    results.push({
      id: 'AC-RC-D14', group: 'D',
      description: 'Post-Countersign email body = Rules wording + download link',
      expected: 'Your WISE Membership Agreement has been processed. [DOWNLOAD]',
      actual: hasCountersign ? '(check content)' : 'NOT IMPLEMENTED',
      pass: false, // Not implemented yet
    });
    console.log(`  ❌ AC-RC-D14: Post-Countersign body — NOT IMPLEMENTED`);
  };
}
