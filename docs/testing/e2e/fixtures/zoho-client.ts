/**
 * ZohoTestClient — Zoho CRM API client for E2E validation tests.
 *
 * Handles OAuth2 token refresh and provides search/get methods for
 * querying Leads, Contacts, and Accounts in Zoho CRM.
 *
 * Uses the same credentials as the enrollment app (.env) but runs
 * outside of Lambda — direct HTTP calls from the test runner.
 *
 * Related files:
 * - packages/apps/enrollment/infra/functions/zoho/ZohoClient.ts (production client)
 * - packages/apps/enrollment/shared/zoho-crm.ts (field constants, picklist resolvers)
 * - packages/apps/enrollment/.env (credentials: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, etc.)
 */

import { resolve } from 'path';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// ─── Load .env from enrollment root ─────────────────────────────────────────

const envPath = resolve(process.cwd(), '../../.env');
config({ path: envPath });

// ─── Types ──────────────────────────────────────────────────────────────────

interface ZohoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
}

export interface ZohoRecord {
  id: string;
  [key: string]: any;
}

export interface ZohoSearchResult {
  data: ZohoRecord[];
  info?: { count: number; more_records: boolean };
}

// ─── Client ─────────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export class ZohoTestClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;
  private readonly apiDomain: string;
  private readonly accountsUrl: string;

  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID ?? '';
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET ?? '';
    this.refreshToken = process.env.ZOHO_CLIENT_REFRESH_TOKEN ?? '';
    this.apiDomain = process.env.ZOHO_API_DOMAIN ?? 'https://www.zohoapis.com';
    this.accountsUrl = 'https://accounts.zoho.com';

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error(
        'Missing Zoho credentials. Ensure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ' +
        `ZOHO_CLIENT_REFRESH_TOKEN are set in ${envPath}`,
      );
    }
  }

  // ─── Token management ───────────────────────────────────────────────────

  /** Get a valid access token, refreshing if expired. */
  async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    if (cachedToken && tokenExpiresAt > now + 300) {
      return cachedToken;
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
    });

    const res = await fetch(`${this.accountsUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data: ZohoTokenResponse = await res.json();

    if (data.error) {
      throw new Error(`Zoho token refresh failed: ${data.error}`);
    }

    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in;

    return cachedToken;
  }

  // ─── Search ─────────────────────────────────────────────────────────────

  /**
   * Search for a Contact by email using the search API (criteria-based).
   */
  async searchByEmail(module: 'Leads' | 'Contacts', email: string): Promise<ZohoRecord | null> {
    const token = await this.getAccessToken();

    const criteria = `(Email:equals:${email})`;
    const url = `${this.apiDomain}/crm/v7/${module}/search?criteria=${encodeURIComponent(criteria)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
    });

    if (res.status === 204) return null; // No records found

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoho search ${module} by email failed (${res.status}): ${text}`);
    }

    const result = await res.json();
    return result.data?.[0] ?? null;
  }

  /**
   * Search for an Account by name using the search API.
   */
  async searchAccountByName(accountName: string): Promise<ZohoRecord | null> {
    const token = await this.getAccessToken();

    const criteria = `(Account_Name:equals:${accountName})`;
    const url = `${this.apiDomain}/crm/v7/Accounts/search?criteria=${encodeURIComponent(criteria)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
    });

    if (res.status === 204) return null;

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoho search Accounts by name failed (${res.status}): ${text}`);
    }

    const result = await res.json();
    return result.data?.[0] ?? null;
  }

  /**
   * Get a full record by ID from a module.
   */
  async getRecord(module: 'Leads' | 'Contacts' | 'Accounts', id: string): Promise<ZohoRecord | null> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.apiDomain}/crm/v7/${module}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
    });

    if (res.status === 204 || res.status === 404) return null;

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoho get record ${module}/${id} failed (${res.status}): ${text}`);
    }

    const result = await res.json();
    return result.data?.[0] ?? null;
  }

  /**
   * Get the photo of a Contact/Lead record.
   * Returns { status, contentType, size } or null if no photo.
   *
   * Zoho API: GET /crm/v7/Contacts/{id}/photo
   * → 200 + binary image (photo exists)
   * → 204 or 404 (no photo)
   */
  async getRecordPhoto(module: 'Contacts' | 'Leads', id: string): Promise<{
    status: number;
    contentType: string | null;
    size: number;
  } | null> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.apiDomain}/crm/v7/${module}/${id}/photo`, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
      },
    });

    if (res.status === 204 || res.status === 404) return null;

    if (!res.ok && res.status !== 200) {
      return null;
    }

    const buffer = await res.arrayBuffer();
    return {
      status: res.status,
      contentType: res.headers.get('content-type'),
      size: buffer.byteLength,
    };
  }

  /**
   * Search with retry/polling — waits for async CRM handlers to complete.
   * Retries up to maxAttempts with backoff.
   */
  async searchWithRetry(
    searchFn: () => Promise<ZohoRecord | null>,
    { maxAttempts = 12, initialDelay = 5000, backoffFactor = 1.5 } = {},
  ): Promise<ZohoRecord | null> {
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await searchFn();
      if (result) return result;

      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * backoffFactor, 15_000);
      }
    }

    return null;
  }

  /**
   * Get related records for a parent record (e.g. Payments linked to a Contact).
   * Uses v2 API search with criteria to find records linked to the parent.
   *
   * @returns Array of related records, or empty array if none found.
   */
  async getRelatedRecords(
    parentModule: 'Contacts' | 'Accounts',
    parentId: string,
    relatedModule: string,
  ): Promise<ZohoRecord[]> {
    const token = await this.getAccessToken();

    // Use v2 search with criteria: Contact_Name or Company (field names differ per module)
    const field = parentModule === 'Contacts' ? 'Contact_Name' : 'Company';
    // Some modules use 'Contact' instead of 'Contact_Name' (e.g. Payments)
    const altField = parentModule === 'Contacts' ? 'Contact' : 'Account_Name';

    let res = await fetch(
      `${this.apiDomain}/crm/v2/${relatedModule}/search?criteria=(${field}:equals:${parentId})`,
      {
        method: 'GET',
        headers: { 'Authorization': `Zoho-oauthtoken ${token}` },
      },
    );

    // If primary field fails, try alternate field name
    if (res.status === 204 || !res.ok) {
      res = await fetch(
        `${this.apiDomain}/crm/v2/${relatedModule}/search?criteria=(${altField}:equals:${parentId})`,
        {
          method: 'GET',
          headers: { 'Authorization': `Zoho-oauthtoken ${token}` },
        },
      );
    }

    if (res.status === 204 || res.status === 404) return [];
    if (!res.ok) {
      // Fallback: try listing all and filter client-side (for modules without search support)
      const listRes = await fetch(
        `${this.apiDomain}/crm/v2/${relatedModule}?sort_by=Created_Time&sort_order=desc&per_page=5`,
        { headers: { 'Authorization': `Zoho-oauthtoken ${token}` } },
      );
      if (!listRes.ok || listRes.status === 204) return [];
      const listData = await listRes.json();
      return (listData.data ?? []).filter((r: any) => {
        const ref = r[field];
        return ref?.id === parentId || ref === parentId;
      });
    }

    const data = await res.json();
    return data.data ?? [];
  }
}
