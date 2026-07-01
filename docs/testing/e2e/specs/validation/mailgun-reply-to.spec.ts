/**
 * Mailgun Reply-To Validation — validates configurable Reply-To header implementation.
 *
 * Groups A–C: Static file assertions (env chain, contract, Lambda logic).
 * Group D: E2E header check via Mailosaur (requires email already sent with MAILGUN_REPLY_TO).
 *
 * Run:
 *   npx playwright test mailgun-reply-to --reporter=list
 *
 * Branch: solution/mailgun-reply-to
 * Commit: e11e80a feat(cloud.core): configurable Reply-To header for Mailgun emails
 */

import { test } from '@playwright/test';
import {
  validateCoreEnvReplyToField,
  validateCoreEnvVisitorReadsReplyTo,
  validateLibEnvReplyToDeclaration,
  validateFactoryInjectsReplyTo,
  validateContractReplyToField,
  validateContractReplyToJSDoc,
  validateLambdaReadsEnvDefault,
  validateLambdaPrecedenceLogic,
  validateLambdaConditionalHeader,
  validateNoEmptyHeaderGuard,
  validateReplyToHeaderInEmail,
} from '../../factories/mailgun-reply-to-validation.factory';

// ─── Group A: Environment Chain (AC-RT-01 to 04) ────────────────────────────

test.describe('Group A: Environment Chain — MAILGUN_REPLY_TO wiring', () => {
  test('AC-RT-01: CoreEnv has mailgun.replyTo field with JSDoc', validateCoreEnvReplyToField());
  test('AC-RT-02: Visitor reads MAILGUN_REPLY_TO with .optional.string()', validateCoreEnvVisitorReadsReplyTo());
  test('AC-RT-03: lib.node.core declares CoreEnv.MAILGUN_REPLY_TO with JSDoc', validateLibEnvReplyToDeclaration());
  test('AC-RT-04: Factory injects MAILGUN_REPLY_TO to Lambda conditionally', validateFactoryInjectsReplyTo());
});

// ─── Group B: Contract (AC-RT-05, 06) ───────────────────────────────────────

test.describe('Group B: Contract — SendEmail Input.replyTo', () => {
  test('AC-RT-05: Input interface has replyTo?: string', validateContractReplyToField());
  test('AC-RT-06: replyTo field has JSDoc explaining precedence', validateContractReplyToJSDoc());
});

// ─── Group C: Lambda Implementation (AC-RT-07 to 10) ────────────────────────

test.describe('Group C: Lambda — Reply-To precedence logic', () => {
  test('AC-RT-07: Lambda reads MAILGUN_REPLY_TO as defaultReplyTo', validateLambdaReadsEnvDefault());
  test('AC-RT-08: Precedence: event.replyTo ?? this.defaultReplyTo', validateLambdaPrecedenceLogic());
  test('AC-RT-09: h:Reply-To applied only when replyTo has value', validateLambdaConditionalHeader());
  test('AC-RT-10: No empty Reply-To header guard', validateNoEmptyHeaderGuard());
});

// ─── Group D: E2E Delivery (AC-RT-11, 12) ───────────────────────────────────

test.describe('Group D: E2E Delivery — Reply-To header in real email', () => {
  const testEmail = process.env.REPLY_TO_TEST_EMAIL || 'ride-headed@emxeecta.mailosaur.net';
  const expectedReplyTo = 'support@membership.wise.org';

  test('AC-RT-11 + 12: Reply-To header present with correct value',
    validateReplyToHeaderInEmail(testEmail, expectedReplyTo));
});
