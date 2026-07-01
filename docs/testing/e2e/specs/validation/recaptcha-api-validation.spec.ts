/**
 * reCAPTCHA v3 API Validation — Tests backend rejection of invalid/missing tokens.
 *
 * These tests make direct HTTP requests to the enrollment API (no browser UI).
 * They simulate bot behavior: requests without tokens, with fake tokens,
 * token replay attacks, and cross-action token misuse.
 *
 * Validates: AC-31a, AC-31b, AC-31c, AC-31f, AC-31h
 *
 * Prerequisites:
 *   - app.enrollment service running (API Gateway accessible)
 *   - reCAPTCHA script loaded in the enrollment SPA (for token generation in AC-31f/h)
 *   - CDP_ENDPOINT set (for browser-based token generation in AC-31f/h)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test recaptcha-api-validation
 *
 * Related files:
 *   - fixtures/enrollment-api.ts — API helper (postLead, postRegistration, postPlanSelection)
 *   - fixtures/test-data.ts — RECAPTCHA_INVALID_TOKENS, RECAPTCHA_API_LEAD_PAYLOAD
 *   - modules/api/src/services/recaptcha.ts — backend verification logic
 */

import { test, expect, chromium, type Page, type Browser, type BrowserContext } from '@playwright/test';
import { postLead, postRegistration, postPlanSelection, getHealth } from '../../fixtures/enrollment-api';
import { RECAPTCHA_INVALID_TOKENS, RECAPTCHA_API_LEAD_PAYLOAD } from '../../fixtures/test-data';
import { v4 as uuidv4 } from 'uuid';

// ─── Setup: generate a fresh sessionId for each test via browser navigation ──

let sessionId: string;
let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

test.beforeAll(async () => {
  // 1. Verify API is accessible
  const health = await getHealth();
  expect(health.status).toBe(200);
  expect(health.body.status).toBe('ok');

  // 2. Generate a sessionId — the frontend generates UUIDs, backend registers on first POST
  //    For API-only tests (AC-31a/b/c), any UUID works because reCAPTCHA rejects BEFORE session lookup.
  //    For token-generation tests (AC-31f/h), we need a browser to get a real token.
  sessionId = uuidv4();

  // 3. If CDP is available, open browser for token generation tests (AC-31f, AC-31h)
  if (process.env.CDP_ENDPOINT) {
    try {
      browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT, { timeout: 10_000 });
      context = await browser.newContext({ ignoreHTTPSErrors: true });
      page = await context.newPage();

      const baseUrl = process.env.BASE_URL || 'https://localhost:9010';
      await page.goto(`${baseUrl}/sign-up`);
      await page.waitForURL(/\/sign-up\/[^/]+\/general-info/, { timeout: 15_000 });

      // Wait for reCAPTCHA script to load (grecaptcha object available)
      await page.waitForFunction(() => 'grecaptcha' in window && (window as any).grecaptcha?.execute, { timeout: 10_000 });

      // Extract real sessionId from URL
      const url = page.url();
      const match = url.match(/\/sign-up\/([^/]+)\/general-info/);
      if (match?.[1]) sessionId = match[1];
    } catch (err) {
      console.warn('[recaptcha-api-validation] CDP not available — token generation tests will be skipped');
    }
  }
});

test.afterAll(async () => {
  if (context) await context.close();
  if (browser && !process.env.CDP_ENDPOINT) await browser.close();
});

// ═════════════════════════════════════════════════════════════════════════════
// AC-31a — Token ausente → RECAPTCHA_TOKEN_REQUIRED
// ═════════════════════════════════════════════════════════════════════════════

test.describe('AC-31a — Request without recaptchaToken is rejected', () => {
  test('POST /lead without token → 400 RECAPTCHA_TOKEN_REQUIRED', async () => {
    const res = await postLead(sessionId, RECAPTCHA_API_LEAD_PAYLOAD);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_TOKEN_REQUIRED');
  });

  test('POST /registration without token → 400 RECAPTCHA_TOKEN_REQUIRED', async () => {
    const res = await postRegistration(sessionId, { 'company.position': 'company_owner' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_TOKEN_REQUIRED');
  });

  test('POST /plans/select without token → 400 RECAPTCHA_TOKEN_REQUIRED', async () => {
    const res = await postPlanSelection(sessionId, 'general', 'year');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_TOKEN_REQUIRED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// AC-31b — Token inválido → RECAPTCHA_FAILED
// ═════════════════════════════════════════════════════════════════════════════

test.describe('AC-31b — Request with fake/invalid token is rejected', () => {
  test('POST /lead with fake token → 400 RECAPTCHA_FAILED', async () => {
    const res = await postLead(sessionId, RECAPTCHA_API_LEAD_PAYLOAD, RECAPTCHA_INVALID_TOKENS.fake);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_FAILED');
  });

  test('POST /registration with fake token → 400 RECAPTCHA_FAILED', async () => {
    const res = await postRegistration(
      sessionId,
      { 'company.position': 'company_owner' },
      RECAPTCHA_INVALID_TOKENS.fake,
    );
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_FAILED');
  });

  test('POST /plans/select with fake token → 400 RECAPTCHA_FAILED', async () => {
    const res = await postPlanSelection(sessionId, 'general', 'year', RECAPTCHA_INVALID_TOKENS.fake);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_FAILED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// AC-31c — Token vacío o whitespace → RECAPTCHA_TOKEN_REQUIRED
// ═════════════════════════════════════════════════════════════════════════════

test.describe('AC-31c — Request with empty/whitespace token is rejected', () => {
  test('POST /lead with empty string → 400 RECAPTCHA_TOKEN_REQUIRED', async () => {
    const res = await postLead(sessionId, RECAPTCHA_API_LEAD_PAYLOAD, RECAPTCHA_INVALID_TOKENS.empty);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_TOKEN_REQUIRED');
  });

  test('POST /lead with whitespace → 400 RECAPTCHA_TOKEN_REQUIRED', async () => {
    const res = await postLead(sessionId, RECAPTCHA_API_LEAD_PAYLOAD, RECAPTCHA_INVALID_TOKENS.whitespace);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_TOKEN_REQUIRED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// AC-31f — Token replay (single-use) → second use fails
// ═════════════════════════════════════════════════════════════════════════════

test.describe('AC-31f — Token replay attack is blocked (single-use)', () => {
  test('Same token used twice → second request fails with RECAPTCHA_FAILED', async () => {
    test.skip(!page, 'Requires CDP_ENDPOINT for real token generation');

    // Generate a real token from the browser
    const token = await page!.evaluate(async () => {
      // Extract site key from the reCAPTCHA script tag already loaded in the page
      const scriptSrc = document.querySelector('script[src*="recaptcha"]')?.getAttribute('src') || '';
      const siteKey = scriptSrc.match(/render=([^&]+)/)?.[1] || '';
      if (!siteKey || !(window as any).grecaptcha) {
        throw new Error('reCAPTCHA not available — site key not found in page');
      }
      return new Promise<string>((resolve, reject) => {
        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha.execute(siteKey, { action: 'submit_lead' })
            .then(resolve)
            .catch(reject);
        });
      });
    });

    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);

    // First use — should succeed (or fail for other reasons, but NOT RECAPTCHA_FAILED on token validity)
    const res1 = await postLead(sessionId, RECAPTCHA_API_LEAD_PAYLOAD, token);
    // First use: token is valid, so reCAPTCHA passes. May fail on other validation but NOT on token.
    expect(res1.body.code).not.toBe('RECAPTCHA_TOKEN_REQUIRED');

    // Second use — same token → must fail because tokens are single-use
    const res2 = await postLead(sessionId, RECAPTCHA_API_LEAD_PAYLOAD, token);
    expect(res2.status).toBe(400);
    expect(res2.body.code).toBe('RECAPTCHA_FAILED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// AC-31h — Cross-action token → rejected (action mismatch)
// ═════════════════════════════════════════════════════════════════════════════

test.describe('AC-31h — Cross-action token is rejected', () => {
  test('Token for submit_lead used on /registration → RECAPTCHA_FAILED', async () => {
    test.skip(!page, 'Requires CDP_ENDPOINT for real token generation');

    // Generate token with action 'submit_lead' (site key extracted from page script tag)
    const token = await page!.evaluate(async () => {
      const scriptSrc = document.querySelector('script[src*="recaptcha"]')?.getAttribute('src') || '';
      const siteKey = scriptSrc.match(/render=([^&]+)/)?.[1] || '';
      return new Promise<string>((resolve, reject) => {
        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha.execute(siteKey, { action: 'submit_lead' })
            .then(resolve)
            .catch(reject);
        });
      });
    });

    expect(token).toBeTruthy();

    // Use it on /registration (expects action 'submit_registration')
    const res = await postRegistration(
      sessionId,
      { 'company.position': 'company_owner' },
      token,
    );
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_FAILED');
  });

  test('Token for submit_lead used on /plans/select → RECAPTCHA_FAILED', async () => {
    test.skip(!page, 'Requires CDP_ENDPOINT for real token generation');

    // Generate token with action 'submit_lead' (site key extracted from page script tag)
    const token = await page!.evaluate(async () => {
      const scriptSrc = document.querySelector('script[src*="recaptcha"]')?.getAttribute('src') || '';
      const siteKey = scriptSrc.match(/render=([^&]+)/)?.[1] || '';
      return new Promise<string>((resolve, reject) => {
        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha.execute(siteKey, { action: 'submit_lead' })
            .then(resolve)
            .catch(reject);
        });
      });
    });

    expect(token).toBeTruthy();

    // Use it on /plans/select (expects action 'submit_plan')
    const res = await postPlanSelection(sessionId, 'general', 'year', token);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RECAPTCHA_FAILED');
  });
});
