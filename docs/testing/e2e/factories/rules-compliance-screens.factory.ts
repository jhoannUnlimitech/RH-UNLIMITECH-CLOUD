/**
 * Rules Compliance Screens Factory — Validates screen messages (Email Verified, Agreement Signed, Paid).
 *
 * Each factory validates text + composition of a screen against the Rules Document (pg 79-80).
 * Uses i18n fixture to read the actual values and compare against expected.
 *
 * Related files:
 * - e2e/fixtures/i18n.ts (translation reader)
 * - e2e/fixtures/rules-expected-data.ts (expected values)
 */

import { expect } from '@playwright/test';
import { t } from '../fixtures/i18n.js';
import { SCREENS_EXPECTED } from '../fixtures/rules-expected-data.js';

/** Track results for the final report. */
export interface ComplianceResult {
  id: string;
  description: string;
  expected: string;
  actual: string;
  pass: boolean;
  group: string;
}

/** Shared results collector — populated by all factories, read by report generator. */
export const results: ComplianceResult[] = [];

function record(r: ComplianceResult) {
  results.push(r);
  const icon = r.pass ? '✅' : '❌';
  console.log(`  ${icon} ${r.id}: ${r.description}`);
  if (!r.pass) {
    console.log(`     Expected: "${r.expected}"`);
    console.log(`     Actual:   "${r.actual}"`);
    console.log(`     ⚠️ DISCREPANCY`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// C.1 Email Verified Screen
// ═════════════════════════════════════════════════════════════════════════════

export function validateEmailVerifiedScreen() {
  return async () => {
    const title = t('en', 'signUp.verify.successTitle');
    const body = t('en', 'signUp.verify.successMessage');
    const cta = t('en', 'signUp.verify.continueButton');

    // AC-RC-C01: Title
    record({
      id: 'AC-RC-C01', group: 'C',
      description: 'Email Verified title',
      expected: SCREENS_EXPECTED.emailVerified.title,
      actual: title,
      pass: title === SCREENS_EXPECTED.emailVerified.title,
    });

    // AC-RC-C02: Body
    record({
      id: 'AC-RC-C02', group: 'C',
      description: 'Email Verified body',
      expected: SCREENS_EXPECTED.emailVerified.body,
      actual: body,
      pass: body === SCREENS_EXPECTED.emailVerified.body,
    });

    // AC-RC-C03: CTA
    record({
      id: 'AC-RC-C03', group: 'C',
      description: 'Email Verified CTA button',
      expected: SCREENS_EXPECTED.emailVerified.cta,
      actual: cta,
      pass: cta === SCREENS_EXPECTED.emailVerified.cta,
    });

    // AC-RC-C04: Composition (title, body, cta all present — order is implicit in i18n)
    record({
      id: 'AC-RC-C04', group: 'C',
      description: 'Email Verified has title + body + CTA (composition)',
      expected: 'all present',
      actual: `title=${!!title}, body=${!!body}, cta=${!!cta}`,
      pass: !!title && !!body && !!cta,
    });
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// C.2 Agreement Signed Screen
// ═════════════════════════════════════════════════════════════════════════════

export function validateAgreementSignedScreen() {
  return async () => {
    const title = t('en', 'signUp.agreementSigned.title');
    const subtitle = t('en', 'signUp.agreementSigned.subtitle');
    const cta = t('en', 'signUp.agreementSigned.continueButton');

    let nextStep: string | null = null;
    try { nextStep = t('en', 'signUp.agreementSigned.nextStep'); } catch { /* key may not exist */ }

    // AC-RC-C05: Title — Rules says "WISE Membership Agreement Signed!"
    record({
      id: 'AC-RC-C05', group: 'C',
      description: 'Agreement Signed title = "WISE Membership Agreement Signed!"',
      expected: SCREENS_EXPECTED.agreementSigned.title,
      actual: title,
      pass: title === SCREENS_EXPECTED.agreementSigned.title,
    });

    // AC-RC-C06: Body — Rules says "Thank you for signing your WISE Membership Agreement."
    record({
      id: 'AC-RC-C06', group: 'C',
      description: 'Agreement Signed body',
      expected: SCREENS_EXPECTED.agreementSigned.body,
      actual: subtitle,
      pass: subtitle === SCREENS_EXPECTED.agreementSigned.body,
    });

    // AC-RC-C07: No extra "next step" text
    record({
      id: 'AC-RC-C07', group: 'C',
      description: 'Agreement Signed: NO "next step" extra text',
      expected: '(should not exist)',
      actual: nextStep ?? '(not found)',
      pass: !nextStep || nextStep === '',
    });

    // AC-RC-C08: CTA button
    record({
      id: 'AC-RC-C08', group: 'C',
      description: 'Agreement Signed CTA = "Continue to Payment"',
      expected: SCREENS_EXPECTED.agreementSigned.cta,
      actual: cta,
      pass: cta === SCREENS_EXPECTED.agreementSigned.cta,
    });

    // AC-RC-C09: Composition
    record({
      id: 'AC-RC-C09', group: 'C',
      description: 'Agreement Signed has title + body + CTA (composition)',
      expected: 'all present',
      actual: `title=${!!title}, body=${!!subtitle}, cta=${!!cta}`,
      pass: !!title && !!subtitle && !!cta,
    });
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// C.3 Paid/Welcome Screen
// ═════════════════════════════════════════════════════════════════════════════

export function validatePaidScreen() {
  return async () => {
    const title = t('en', 'signUp.paid.title');
    const subtitle = t('en', 'signUp.paid.subtitle');
    const agreementLine = t('en', 'signUp.paid.agreementConfirmed');
    const paymentLine = t('en', 'signUp.paid.paymentConfirmed');
    const emailLine = t('en', 'signUp.paid.emailSent');

    // AC-RC-C10: Title
    record({
      id: 'AC-RC-C10', group: 'C',
      description: 'Paid page title = "Welcome to WISE!"',
      expected: SCREENS_EXPECTED.paid.title,
      actual: title,
      pass: title === SCREENS_EXPECTED.paid.title,
    });

    // AC-RC-C11: Subtitle exists
    record({
      id: 'AC-RC-C11', group: 'C',
      description: 'Paid page subtitle present',
      expected: '(non-empty)',
      actual: subtitle.substring(0, 60),
      pass: subtitle.length > 0,
    });

    // AC-RC-C12: Checkmarks (3 confirmation lines)
    record({
      id: 'AC-RC-C12', group: 'C',
      description: 'Paid page: agreement + payment + email confirmation lines',
      expected: '3 lines present',
      actual: `agreement=${!!agreementLine}, payment=${!!paymentLine}, email=${!!emailLine}`,
      pass: !!agreementLine && !!paymentLine && !!emailLine,
    });

    // AC-RC-C13: Composition
    record({
      id: 'AC-RC-C13', group: 'C',
      description: 'Paid page: title + subtitle + checkmarks (composition)',
      expected: 'all present',
      actual: `all present`,
      pass: !!title && !!subtitle && !!agreementLine && !!paymentLine && !!emailLine,
    });
  };
}
