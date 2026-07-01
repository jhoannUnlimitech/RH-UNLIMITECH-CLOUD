/**
 * Stripe Client — HTTP client for Stripe API validation in E2E tests.
 *
 * Queries Stripe API to validate split payment, customers, subscriptions,
 * and charges on connected accounts (Stripe Connect Direct Charges).
 *
 * Uses the platform's secret key with `Stripe-Account` header for
 * connected account operations.
 *
 * Config (from .env or .env.qa):
 *   STRIPE_SECRET_KEY — Platform account secret key (sk_test_...)
 *
 * Related files:
 * - packages/cloud/stripe/shared/connect-config.ts (Connect config schema)
 * - e2e/factories/stripe-connect-validation.factory.ts (validation factories)
 */

// ─── Config ─────────────────────────────────────────────────────────────────

interface StripeClientConfig {
  readonly secretKey: string;
  readonly connectedAccountId: string;
}

function getConfig(): StripeClientConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID || 'acct_1ThCwARKKa3Cg9Qi';

  if (!secretKey) throw new Error('STRIPE_SECRET_KEY env var is required');

  return { secretKey, connectedAccountId };
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StripeCheckoutSession {
  id: string;
  status: string;
  payment_status: string;
  customer: string;
  subscription: string;
  amount_total: number;
  currency: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
}

export interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  items: { data: Array<{ price: { id: string; unit_amount: number; recurring: { interval: string } } }> };
  application_fee_percent: number | null;
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  application_fee_amount: number | null;
  balance_transaction: string;
}

export interface StripeBalanceTransaction {
  id: string;
  amount: number;
  fee: number;
  net: number;
}

export interface StripeApplicationFee {
  id: string;
  amount: number;
  account: string;
}

// ─── Client ─────────────────────────────────────────────────────────────────

export class StripeTestClient {
  private readonly secretKey: string;
  private readonly connectedAccountId: string;

  constructor() {
    const config = getConfig();
    this.secretKey = config.secretKey;
    this.connectedAccountId = config.connectedAccountId;
  }

  /** Get the connected account ID being used. */
  getConnectedAccountId(): string {
    return this.connectedAccountId;
  }

  /** Make a request to Stripe API (optionally on a connected account). */
  private async request(path: string, options?: { onConnected?: boolean }): Promise<any> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.secretKey}`,
    };
    if (options?.onConnected) {
      headers['Stripe-Account'] = this.connectedAccountId;
    }

    const res = await fetch(`https://api.stripe.com/v1${path}`, { headers });
    const data = await res.json();
    if (data.error) {
      throw new Error(`Stripe API error: ${data.error.message} (${data.error.type})`);
    }
    return data;
  }

  // ── Checkout Sessions ───────────────────────────────────────────────────

  /** Get a checkout session on the connected account. */
  async getCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
    return this.request(`/checkout/sessions/${sessionId}`, { onConnected: true });
  }

  // ── Customers ───────────────────────────────────────────────────────────

  /** Get a customer on the connected account. */
  async getCustomer(customerId: string): Promise<StripeCustomer> {
    return this.request(`/customers/${customerId}`, { onConnected: true });
  }

  // ── Subscriptions ───────────────────────────────────────────────────────

  /** Get a subscription on the connected account. */
  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return this.request(`/subscriptions/${subscriptionId}`, { onConnected: true });
  }

  // ── Charges ─────────────────────────────────────────────────────────────

  /** Get the latest charge for a payment intent on the connected account. */
  async getLatestCharge(paymentIntentId: string): Promise<StripeCharge | null> {
    const data = await this.request(`/charges?payment_intent=${paymentIntentId}&limit=1`, { onConnected: true });
    return data.data?.[0] ?? null;
  }

  /** Get charges for a customer on the connected account. */
  async getChargesForCustomer(customerId: string): Promise<StripeCharge[]> {
    const data = await this.request(`/charges?customer=${customerId}&limit=5`, { onConnected: true });
    return data.data ?? [];
  }

  // ── Balance Transactions ────────────────────────────────────────────────

  /** Get a balance transaction on the connected account. */
  async getBalanceTransaction(btId: string): Promise<StripeBalanceTransaction> {
    return this.request(`/balance_transactions/${btId}`, { onConnected: true });
  }

  // ── Application Fees (on platform) ─────────────────────────────────────

  /** List application fees collected by the platform for a specific charge. */
  async getApplicationFeeForCharge(chargeId: string): Promise<StripeApplicationFee | null> {
    const data = await this.request(`/application_fees?charge=${chargeId}&limit=1`);
    return data.data?.[0] ?? null;
  }

  // ── Products & Prices (on connected) ───────────────────────────────────

  /** List active products on the connected account. */
  async getProducts(): Promise<Array<{ id: string; name: string; active: boolean }>> {
    const data = await this.request('/products?active=true&limit=20', { onConnected: true });
    return data.data ?? [];
  }

  /** List active prices on the connected account. */
  async getPrices(): Promise<Array<{ id: string; unit_amount: number; recurring: { interval: string } | null; product: string }>> {
    const data = await this.request('/prices?active=true&limit=50', { onConnected: true });
    return data.data ?? [];
  }

  // ── Account verification ───────────────────────────────────────────────

  /** Verify the connected account exists and is usable. */
  async verifyConnectedAccount(): Promise<{ id: string; charges_enabled: boolean; payouts_enabled: boolean }> {
    return this.request(`/accounts/${this.connectedAccountId}`);
  }
}

/**
 * Create a Stripe test client instance.
 */
export function createStripeClient(): StripeTestClient {
  return new StripeTestClient();
}
