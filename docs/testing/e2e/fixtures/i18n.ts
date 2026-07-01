/**
 * i18n Fixture — Reads translation files for E2E validation.
 *
 * Provides access to the actual i18n values from the EN (bundled) and ES (dynamic)
 * translation files. Tests compare these values against what the UI renders.
 *
 * Usage:
 *   import { getTranslation, LOCALES } from '../fixtures/i18n';
 *   const t = getTranslation('en');
 *   expect(section).toContainText(t('signUp.generalInfo.email.label'));
 *
 * This ensures:
 *   1. The i18n file has the correct text (matches the ticket requirement)
 *   2. The UI renders what the i18n file says (no disconnect)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

// ─── Paths to translation files ─────────────────────────────────────────────

const TRANSLATION_PATHS = {
  en: resolve(__dir, '../../src/i18n/locales/en-US/translation.json'),
  es: resolve(__dir, '../../../api/locales/es-co.json'),
} as const;

export type Locale = keyof typeof TRANSLATION_PATHS;
export const LOCALES: Locale[] = ['en', 'es'];

// ─── Cache ──────────────────────────────────────────────────────────────────

const cache: Record<string, Record<string, unknown>> = {};

/** Load and cache a translation file. */
function loadTranslations(locale: Locale): Record<string, unknown> {
  if (!cache[locale]) {
    const raw = readFileSync(TRANSLATION_PATHS[locale], 'utf8');
    cache[locale] = JSON.parse(raw);
  }
  return cache[locale];
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get a translation value by dot-notation key.
 * Returns the string value or throws if key not found.
 *
 * @example
 *   const label = t('en', 'signUp.generalInfo.email.label');
 *   // → "Company Email Address"
 */
export function t(locale: Locale, key: string): string {
  const translations = loadTranslations(locale);
  const parts = key.split('.');
  let current: unknown = translations;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      throw new Error(`i18n key "${key}" not found at part "${part}" for locale "${locale}"`);
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== 'string') {
    throw new Error(`i18n key "${key}" is not a string for locale "${locale}" (got ${typeof current})`);
  }

  return current;
}

/**
 * Create a locale-bound translation function.
 *
 * @example
 *   const tEN = getTranslation('en');
 *   const label = tEN('signUp.generalInfo.email.label');
 */
export function getTranslation(locale: Locale): (key: string) => string {
  return (key: string) => t(locale, key);
}

/**
 * Verify a key exists in both EN and ES locales.
 * Returns { en: string, es: string } or throws.
 */
export function getBothLocales(key: string): { en: string; es: string } {
  return {
    en: t('en', key),
    es: t('es', key),
  };
}
