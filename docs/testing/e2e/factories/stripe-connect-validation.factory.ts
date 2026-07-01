/**
 * Stripe Connect Validation Factory — Split payment validation for Direct Charges.
 *
 * Validates that payments via Stripe Connect are correctly split between
 * the platform (MasterTech, 30%) and the connected account (WISE, ~70% - fees).
 *
 * Uses the Stripe API to query sessions, customers, subscriptions, charges,
 * and application fees on the connected account.
 *
 * Related files:
 * - e2e/fixtures/stripe-client.ts (Stripe API HTTP client)
 * - packages/cloud/stripe/shared/connect-config.ts (Connect config schema)
 * - e2e/results/stripe-connect-split-payment/acceptance-criteria-checklist.md
 */

import { expect } from '@playwright/test';
import { StripeTestClient, createStripeClient } from '../fixtures/stripe-client.js';

// ─── Shared context (populated by factories during the serial flow) ─────────

export interface StripeConnectContext {
  stripe: StripeTestClient | null;
  checkoutSessionId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  chargeId: string | null;
  chargeAmount: number | null;
  applicationFeeAmount: number | null;
  stripeFee: number | null;
  netAmount: number | null;
}

/** Create a fresh Stripe Connect validation context. */
export function createStripeConnectContext(): StripeConnectContext {
  return {
    stripe: null,
    checkoutSessionId: null,
    customerId: null,
    subscriptionId: null,
    chargeId: null,
    chargeAmount: null,
    applicationFeeAmount: null,
    stripeFee: null,
    netAmount: null,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Setup
// ═════════════════════════════════════════════════════════════════════════════

/** Initialize Stripe client and load session data from DynamoDB snapshot. */
export function initStripeConnect(ctx: StripeConnectContext, sessionData: { checkoutSessionId: string; customerId: string; subscriptionId: string }) {
  return async () => {
    ctx.stripe = createStripeClient();
    ctx.checkoutSessionId = sessionData.checkoutSessionId;
    ctx.customerId = sessionData.customerId;
    ctx.subscriptionId = sessionData.subscriptionId;
    console.log(`  ✅ Stripe Connect context initialized`);
    console.log(`     Connected account: ${ctx.stripe.getConnectedAccountId()}`);
    console.log(`     Checkout session: ${ctx.checkoutSessionId}`);
    console.log(`     Customer: ${ctx.customerId}`);
    console.log(`     Subscription: ${ctx.subscriptionId}`);
  };
}

/** DynamoDB table name for enrollment sessions (stage-specific). */
const DDB_TABLE = process.env.DDB_TABLE_ENROLLMENT_SESSIONS
  || 'HCAMSWS--AppEnroll-DevQA-TableEnrollmentSessionsTable-banuwtef';

/**
 * Extract Stripe session data (checkoutSessionId, customerId, subscriptionId)
 * from DynamoDB after a successful enrollment checkout. Reads the session by ID
 * extracted from the current page URL.
 */
export function extractStripeDataFromSession(ctx: StripeConnectContext, getPage: () => any) {
  return async () => {
    const page = getPage();
    const url = page.url();
    const sessionId = url.match(/\/sign-up\/([^/]+)/)?.[1] || '';
    if (!sessionId) throw new Error('Could not extract sessionId from page URL');

    const { DynamoDBClient, GetItemCommand } = await import('@aws-sdk/client-dynamodb');
    const ddb = new DynamoDBClient({});

    const result = await ddb.send(new GetItemCommand({
      TableName: DDB_TABLE,
      Key: { sessionId: { S: sessionId } },
      ProjectionExpression: '#s, stripe',
      ExpressionAttributeNames: { '#s': 'status' },
    }));

    const stripe = result.Item?.stripe?.M || {};
    const checkoutSessionId = stripe.checkoutSessionId?.S || stripe.checkout?.M?.sessionId?.S || '';
    const customerId = stripe.customerId?.S || '';
    const subscriptionId = stripe.subscriptionId?.S || '';

    console.log(`  📋 Session ${sessionId} — status: ${result.Item?.status?.S}`);
    console.log(`     checkoutSessionId: ${checkoutSessionId}`);
    console.log(`     customerId: ${customerId}`);
    console.log(`     subscriptionId: ${subscriptionId}`);

    await initStripeConnect(ctx, { checkoutSessionId, customerId, subscriptionId })();
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Grupo B: Split Payment Validation (Stripe API)
// ═════════════════════════════════════════════════════════════════════════════

/** AC-SC-06: Checkout Session lives on the connected account. */
export function validateSessionOnConnected(ctx: StripeConnectContext) {
  return async () => {
    const session = await ctx.stripe!.getCheckoutSession(ctx.checkoutSessionId!);
    expect(session).not.toBeNull();
    expect(session.id).toBe(ctx.checkoutSessionId);
    // The key validation: session EXISTS on the connected account (queried with
    // stripeAccount header). Status "open" or "complete" are both valid u2014
    // in subscription mode Stripe may keep it "open" briefly. The subscription
    // being active (AC-SC-08) is the authoritative payment confirmation.
    expect(['complete', 'open']).toContain(session.status);
    expect(session.mode).toBe('subscription');
    console.log(`  \u2705 AC-SC-06: Session ${session.id} on connected account (status: ${session.status}, mode: ${session.mode})`);
  };
}

/** AC-SC-07: Customer lives on the connected account. */
export function validateCustomerOnConnected(ctx: StripeConnectContext) {
  return async () => {
    const customer = await ctx.stripe!.getCustomer(ctx.customerId!);
    expect(customer).not.toBeNull();
    expect(customer.id).toBe(ctx.customerId);
    console.log(`  ✅ AC-SC-07: Customer ${customer.id} lives on connected account (email: ${customer.email})`);
  };
}

/** AC-SC-08: Subscription lives on the connected account. */
export function validateSubscriptionOnConnected(ctx: StripeConnectContext) {
  return async () => {
    const sub = await ctx.stripe!.getSubscription(ctx.subscriptionId!);
    expect(sub).not.toBeNull();
    expect(sub.id).toBe(ctx.subscriptionId);
    expect(sub.status).toBe('active');
    expect(sub.application_fee_percent).toBe(30);
    ctx.chargeAmount = sub.items.data[0]?.price?.unit_amount ?? 0;
    console.log(`  ✅ AC-SC-08: Subscription ${sub.id} on connected (status: ${sub.status}, fee: ${sub.application_fee_percent}%)`);
  };
}

/** AC-SC-09: Charge has application_fee = 30% of total. */
export function validateApplicationFee(ctx: StripeConnectContext) {
  return async () => {
    // Poll with exponential backoff — subscription charge may take up to 60s
    let charges: any[] = [];
    const delays = [2000, 3000, 5000, 8000, 10000, 10000, 10000, 10000]; // ~58s total
    for (let attempt = 0; attempt < delays.length; attempt++) {
      charges = await ctx.stripe!.getChargesForCustomer(ctx.customerId!);
      if (charges.length > 0) break;
      console.log(`  \u23F3 No charges yet (attempt ${attempt + 1}/${delays.length}, backoff ${delays[attempt] / 1000}s...)`);
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
    if (charges.length === 0) {
      // Final attempt after all backoff delays
      charges = await ctx.stripe!.getChargesForCustomer(ctx.customerId!);
    }
    expect(charges.length).toBeGreaterThan(0);
    const charge = charges[0];
    ctx.chargeId = charge.id;
    ctx.chargeAmount = charge.amount;

    // Get application fee from platform
    const fee = await ctx.stripe!.getApplicationFeeForCharge(charge.id);
    expect(fee).not.toBeNull();
    ctx.applicationFeeAmount = fee!.amount;

    // Validate 30% (within 1 cent tolerance for rounding)
    const expectedFee = Math.round(charge.amount * 0.30);
    expect(Math.abs(fee!.amount - expectedFee)).toBeLessThanOrEqual(1);

    const feePercent = ((fee!.amount / charge.amount) * 100).toFixed(1);
    console.log(`  \u2705 AC-SC-09: Charge ${charge.id} ($${(charge.amount / 100).toFixed(2)}) \u2192 fee $${(fee!.amount / 100).toFixed(2)} (${feePercent}%)`);
  };
}


/** AC-SC-10: Stripe processing fee absorbed by connected account. */
export function validateStripeFeeOnConnected(ctx: StripeConnectContext) {
  return async () => {
    const charges = await ctx.stripe!.getChargesForCustomer(ctx.customerId!);
    const charge = charges[0];
    const bt = await ctx.stripe!.getBalanceTransaction(charge.balance_transaction);
    // In Direct Charges, bt.fee includes BOTH Stripe processing fee AND application_fee.
    // The actual Stripe processing fee = bt.fee - application_fee.
    const stripeProcessingFee = bt.fee - ctx.applicationFeeAmount!;
    expect(stripeProcessingFee).toBeGreaterThan(0);
    ctx.stripeFee = stripeProcessingFee;
    console.log(`  \u2705 AC-SC-10: Stripe processing fee = $${(stripeProcessingFee / 100).toFixed(2)} (absorbed by WISE)`);
    console.log(`     bt.fee total = $${(bt.fee / 100).toFixed(2)} = $${(ctx.applicationFeeAmount! / 100).toFixed(2)} platform + $${(stripeProcessingFee / 100).toFixed(2)} Stripe`);
  };
}

/** AC-SC-11: Net amount = total - application_fee - stripe_fee. */
export function validateNetAmount(ctx: StripeConnectContext) {
  return async () => {
    const charges = await ctx.stripe!.getChargesForCustomer(ctx.customerId!);
    const charge = charges[0];
    const bt = await ctx.stripe!.getBalanceTransaction(charge.balance_transaction);
    ctx.netAmount = bt.net;

    // Net should equal: charge amount - application_fee - stripe_fee
    const expectedNet = ctx.chargeAmount! - ctx.applicationFeeAmount! - ctx.stripeFee!;
    expect(Math.abs(bt.net - expectedNet)).toBeLessThanOrEqual(1);

    console.log(`  ✅ AC-SC-11: Net to connected = $${(bt.net / 100).toFixed(2)}`);
    console.log(`     Breakdown: $${(ctx.chargeAmount! / 100).toFixed(2)} - $${(ctx.applicationFeeAmount! / 100).toFixed(2)} (platform) - $${(ctx.stripeFee! / 100).toFixed(2)} (Stripe) = $${(bt.net / 100).toFixed(2)}`);
  };
}

/** AC-SC-12: Platform receives exactly 30%. */
export function validatePlatformReceives30Percent(ctx: StripeConnectContext) {
  return async () => {
    const ratio = ctx.applicationFeeAmount! / ctx.chargeAmount!;
    expect(Math.abs(ratio - 0.30)).toBeLessThan(0.001);
    console.log(`  ✅ AC-SC-12: Platform receives ${(ratio * 100).toFixed(1)}% = $${(ctx.applicationFeeAmount! / 100).toFixed(2)} of $${(ctx.chargeAmount! / 100).toFixed(2)}`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Grupo C: Configuration Validation
// ═════════════════════════════════════════════════════════════════════════════

/** AC-SC-14: Connected account is valid in Stripe. */
export function validateConnectedAccountExists(ctx: StripeConnectContext) {
  return async () => {
    const account = await ctx.stripe!.verifyConnectedAccount();
    expect(account.charges_enabled).toBe(true);
    console.log(`  ✅ AC-SC-14: Connected account ${account.id} — charges_enabled: ${account.charges_enabled}, payouts_enabled: ${account.payouts_enabled}`);
  };
}

/** AC-SC-15: Products/Prices exist on the connected account. */
export function validateProductsOnConnected(ctx: StripeConnectContext) {
  return async () => {
    const products = await ctx.stripe!.getProducts();
    expect(products.length).toBeGreaterThanOrEqual(4); // Individual, General, Company, Corporate
    const prices = await ctx.stripe!.getPrices();
    expect(prices.length).toBeGreaterThanOrEqual(4);
    console.log(`  ✅ AC-SC-15: Connected account has ${products.length} products, ${prices.length} prices`);
    products.forEach(p => console.log(`     - ${p.name} (${p.id})`));
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Summary
// ═════════════════════════════════════════════════════════════════════════════

/** Log a summary of the split payment validation. */
export function logSplitPaymentSummary(ctx: StripeConnectContext) {
  return async () => {
    console.log('\n📊 Stripe Connect Split Payment — Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Connected Account: ${ctx.stripe?.getConnectedAccountId()}`);
    console.log(`  Charge: ${ctx.chargeId} ($${((ctx.chargeAmount ?? 0) / 100).toFixed(2)})`);
    console.log('');
    console.log(`  Platform (MasterTech): $${((ctx.applicationFeeAmount ?? 0) / 100).toFixed(2)} (30%)`);
    console.log(`  Stripe fee:            $${((ctx.stripeFee ?? 0) / 100).toFixed(2)} (≈2.9% + $0.30)`);
    console.log(`  Net to Connected:      $${((ctx.netAmount ?? 0) / 100).toFixed(2)} (≈${(((ctx.netAmount ?? 0) / (ctx.chargeAmount || 1)) * 100).toFixed(1)}%)`);
    console.log('═══════════════════════════════════════════════════════');
  };
}
