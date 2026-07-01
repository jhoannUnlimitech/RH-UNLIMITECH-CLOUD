/**
 * Enrollment API Helper — Direct HTTP requests to the enrollment backend.
 *
 * Used by API validation specs that test backend behavior without browser.
 * Complements the browser-based factories for scenarios where we need
 * to send malformed/invalid requests that the frontend would never send
 * (e.g. missing reCAPTCHA token, invalid tokens, replay attacks).
 *
 * Config:
 *   ENROLLMENT_API_URL — from test-data.ts (API Gateway raw URL)
 *
 * Related files:
 *   - fixtures/test-data.ts — ENROLLMENT_API_URL, RECAPTCHA_API_LEAD_PAYLOAD
 *   - specs/validation/recaptcha-api-validation.spec.ts — primary consumer
 *   - modules/api/src/endpoints.ts — endpoint route definitions
 */

import { ENROLLMENT_API_URL } from './test-data';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ApiResponse {
  /** HTTP status code */
  status: number;
  /** Parsed JSON body */
  body: Record<string, any>;
}

// ─── Core request helper ────────────────────────────────────────────────────

/**
 * Makes a POST request to the enrollment API.
 * Returns the status code and parsed JSON body.
 */
async function post(path: string, payload: Record<string, any>): Promise<ApiResponse> {
  const res = await fetch(`${ENROLLMENT_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

/**
 * Makes a GET request to the enrollment API.
 * Returns the status code and parsed JSON body.
 */
async function get(path: string): Promise<ApiResponse> {
  const res = await fetch(`${ENROLLMENT_API_URL}${path}`, {
    headers: { 'Accept': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// ─── Endpoint methods ───────────────────────────────────────────────────────

/**
 * POST /lead — Save lead form data.
 * @param sessionId - UUID of the enrollment session
 * @param data - Lead form fields (dot-notation keys)
 * @param recaptchaToken - Optional reCAPTCHA token (omit to test rejection)
 */
export async function postLead(
  sessionId: string,
  data: Record<string, string>,
  recaptchaToken?: string,
): Promise<ApiResponse> {
  const payload: Record<string, any> = { sessionId, data, params: {} };
  if (recaptchaToken !== undefined) payload.recaptchaToken = recaptchaToken;
  return post('/lead', payload);
}

/**
 * POST /registration — Save registration form data.
 * @param sessionId - UUID of the enrollment session
 * @param data - Registration form fields (dot-notation keys)
 * @param recaptchaToken - Optional reCAPTCHA token (omit to test rejection)
 */
export async function postRegistration(
  sessionId: string,
  data: Record<string, string>,
  recaptchaToken?: string,
): Promise<ApiResponse> {
  const payload: Record<string, any> = { sessionId, data, params: {} };
  if (recaptchaToken !== undefined) payload.recaptchaToken = recaptchaToken;
  return post('/registration', payload);
}

/**
 * POST /plans/select — Save plan selection.
 * @param sessionId - UUID of the enrollment session
 * @param cname - Plan cname (e.g. 'general')
 * @param interval - Billing interval ('month' | 'year')
 * @param recaptchaToken - Optional reCAPTCHA token (omit to test rejection)
 */
export async function postPlanSelection(
  sessionId: string,
  cname: string,
  interval: 'month' | 'year',
  recaptchaToken?: string,
): Promise<ApiResponse> {
  const payload: Record<string, any> = { sessionId, cname, interval };
  if (recaptchaToken !== undefined) payload.recaptchaToken = recaptchaToken;
  return post('/plans/select', payload);
}

/**
 * GET /health — Health check (no reCAPTCHA required).
 */
export async function getHealth(): Promise<ApiResponse> {
  return get('/health');
}

/**
 * GET /session/:sessionId — Get session status.
 */
export async function getSession(sessionId: string): Promise<ApiResponse> {
  return get(`/session/${sessionId}`);
}
