/**
 * Training API Factory — API-level interaction helpers for training endpoints.
 *
 * Used by specs that test backend logic via authenticated API calls
 * executed through the browser context (cookies).
 */

import { type Page } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:9050/api/v1';

/**
 * Execute an authenticated API call through the browser context.
 * Returns the parsed JSON response.
 */
export async function apiExec(page: Page, method: string, path: string, body?: any): Promise<any> {
  return page.evaluate(async ({ apiUrl, method, path, body }) => {
    const res = await fetch(`${apiUrl}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }, { apiUrl: API_URL, method, path, body });
}

/**
 * Login via API (set cookies in browser context).
 */
export async function apiLogin(page: Page, email: string, password: string): Promise<any> {
  return apiExec(page, 'POST', '/auth/login', { email, password });
}
