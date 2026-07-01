/**
 * Mailgun Receipt Validation — AC-EN-01 to AC-EN-09
 *
 * Validates that the enrollment completed email includes a permanent
 * Stripe receipt link (Rules Document D3 "New Subscription").
 *
 * Static code assertions (AC-EN-01 to 09) — zero cost, no infra needed.
 * E2E delivery (AC-EN-08) validated via full-enrollment-v4 step 23.
 *
 * Run:
 *   npx playwright test mailgun-receipt --reporter=list
 *
 * Related files:
 * - e2e/factories/mailgun-receipt-validation.factory.ts (AC factories)
 * - packages/cloud/core/templates/enrollment--completed.html (template)
 * - e2e/results/enrollment-email-notifications/acceptance-criteria-checklist.md
 */

import { test } from '@playwright/test';
import {
  validateReceiptReferenceText,
  validateReceiptButton,
  validateReceiptConditional,
  validateReceiptFallbackLink,
  validateProcessPaymentPassesReceiptUrl,
  validateEmailDispatchForwardsReceiptUrl,
  validateGetSubscriptionDetailsReturnsReceiptUrl,
  validateReceiptUrlInTemplate,
  validateGracefulDegradation,
} from '../../factories/mailgun-receipt-validation.factory.js';

// ─── Spec ───────────────────────────────────────────────────────────────────

test.describe('Mailgun Receipt — Completed email receipt link (AC-EN-01 to EN-09)', () => {

  // ── Template content (Rules D3) ─────────────────────────────────────────
  test('AC-EN-01: receipt reference text present', validateReceiptReferenceText());
  test('AC-EN-02: "View Receipt" button with {{receiptUrl}}', validateReceiptButton());
  test('AC-EN-03: {{#if receiptUrl}} conditional', validateReceiptConditional());
  test('AC-EN-04: fallback link with {{receiptUrl}} visible', validateReceiptFallbackLink());

  // ── Producer + consumer wiring ──────────────────────────────────────────
  test('AC-EN-05: ProcessPayment passes receiptUrl in SQS', validateProcessPaymentPassesReceiptUrl());
  test('AC-EN-06: EmailDispatch forwards receiptUrl to template', validateEmailDispatchForwardsReceiptUrl());
  test('AC-EN-07: GetSubscriptionDetails returns receiptUrl', validateGetSubscriptionDetailsReturnsReceiptUrl());

  // ── Delivery + graceful degradation ─────────────────────────────────────
  test('AC-EN-08: template wired for receipt URL (pay.stripe.com)', validateReceiptUrlInTemplate());
  test('AC-EN-09: no button when receiptUrl is empty (graceful)', validateGracefulDegradation());
});
