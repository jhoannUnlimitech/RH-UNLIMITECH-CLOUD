/**
 * GDPR Factories — Verify personal data is not stored in browser storage.
 *
 * AC-51: The application must not store personal data (name, email, phone,
 * address) in localStorage or sessionStorage. All data must be loaded
 * exclusively from the backend via API calls.
 *
 * Reference: Solution document §5.6 — "Personal data collected during
 * registration is transmitted to Zoho CRM and is not stored persistently
 * within the module beyond what is necessary for flow state management."
 */

import { expect, type Page } from '@playwright/test';

// ─── Sensitive data patterns ────────────────────────────────────────────────

const SENSITIVE_PATTERNS = [
  // Email patterns
  /@.*\.com/,
  /@.*\.net/,
  /@.*mailosaur/,
  // Phone patterns
  /\+\d{1,3}\s?\d{6,}/,
  // Common test data that should NOT be in storage
  /testlead/,
];

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * AC-51: Verify no personal data is stored in localStorage or sessionStorage.
 *
 * Inspects all keys and values in both storage mechanisms and asserts
 * that no sensitive personal data (email, phone, names from form data)
 * is present. The backend is the sole source of truth.
 *
 * @param personalData - Object with personal data values to check against
 */
export function verifyNoPersonalDataInStorage(
  getPage: () => Page,
  personalData: { email: string; firstName: string; lastName: string; phone?: string },
) {
  return async () => {
    const page = getPage();

    const storageCheck = await page.evaluate((data) => {
      const issues: string[] = [];

      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        const value = localStorage.getItem(key) || '';
        if (value.includes(data.email)) issues.push(`localStorage["${key}"] contains email`);
        if (value.includes(data.firstName)) issues.push(`localStorage["${key}"] contains firstName`);
        if (value.includes(data.lastName)) issues.push(`localStorage["${key}"] contains lastName`);
        if (data.phone && value.includes(data.phone)) issues.push(`localStorage["${key}"] contains phone`);
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)!;
        const value = sessionStorage.getItem(key) || '';
        if (value.includes(data.email)) issues.push(`sessionStorage["${key}"] contains email`);
        if (value.includes(data.firstName)) issues.push(`sessionStorage["${key}"] contains firstName`);
        if (value.includes(data.lastName)) issues.push(`sessionStorage["${key}"] contains lastName`);
        if (data.phone && value.includes(data.phone)) issues.push(`sessionStorage["${key}"] contains phone`);
      }

      return { issues, localStorageKeys: Object.keys(localStorage), sessionStorageKeys: Object.keys(sessionStorage) };
    }, personalData);

    // No personal data should be found in browser storage
    expect(storageCheck.issues, 
      `Personal data found in browser storage:\n${storageCheck.issues.join('\n')}`
    ).toHaveLength(0);
  };
}
