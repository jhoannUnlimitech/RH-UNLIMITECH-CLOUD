/**
 * Language Selector Validation — Ticket #896
 *
 * Validates the enrollment language selector feature:
 *   - URL param ?lang= detection (exact and fuzzy codes)
 *   - Manual language switch via selector dropdown
 *   - Language persistence across pages (Form 1 → Form 2)
 *   - Unsupported language fallback to English
 *   - URL cleanup (strip ?lang= after consumption)
 *   - localStorage persistence
 *   - Dropdown open/close behavior (Escape key)
 *
 * 5 serial flows covering AC-896-05 through AC-896-30.
 * Each flow creates its own session — no shared state between flows.
 *
 * Run:
 *   npx playwright test language-selector --reporter=list
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test language-selector --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpWithLang } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import {
  verifyLanguageSelectorVisible,
  verifySelectedLanguage,
  verifyLanguageDropdownOptions,
  verifyDropdownClosed,
  openLanguageSelector,
  switchLanguage,
  closeLanguageSelectorWithEscape,
  verifyForm1Language,
  verifyForm2Language,
  verifyUrlClean,
  verifyLanguagePersisted,
} from '../../factories/language-selector.factory';
import { LEAD_USA_V4 } from '../../fixtures/test-data';

// ═════════════════════════════════════════════════════════════════════════════
// Flow 1: English via URL — ?lang=en-US
// ═════════════════════════════════════════════════════════════════════════════

const flow1 = createSerialFlow();

flow1.e2e.describe.serial('Language via URL — English (AC-896-06, 11, 12, 13, 14, 25, 27, 29)', () => {
  flow1.e2e.setTimeout(120_000);

  flow1.e2e('navigate with ?lang=en-US',
    navigateToSignUpWithLang(flow1.getPage, 'en-US'));

  flow1.e2e('AC-896-11: URL is clean (no ?lang param)',
    verifyUrlClean(flow1.getPage));

  flow1.e2e('AC-896-12: language persisted to localStorage',
    verifyLanguagePersisted(flow1.getPage, 'en-US'));

  flow1.e2e('AC-896-13: language selector visible in header',
    verifyLanguageSelectorVisible(flow1.getPage));

  flow1.e2e('AC-896-14: selector shows "English"',
    verifySelectedLanguage(flow1.getPage, 'English'));

  flow1.e2e('AC-896-25, 29, 30: Form 1 labels in English',
    verifyForm1Language(flow1.getPage, 'en'));

  flow1.e2e('fill lead form (EN)',
    fillLeadForm(flow1.getPage, LEAD_USA_V4));

  flow1.e2e('submit lead form → /details',
    submitLeadForm(flow1.getPage));

  flow1.e2e('AC-896-27: Form 2 labels in English',
    verifyForm2Language(flow1.getPage, 'en'));

  flow1.e2e('AC-896-24: selector visible on Form 2',
    verifyLanguageSelectorVisible(flow1.getPage));
});

// ═════════════════════════════════════════════════════════════════════════════
// Flow 2: Spanish via URL — ?lang=es-CO
// ═════════════════════════════════════════════════════════════════════════════

const flow2 = createSerialFlow();

flow2.e2e.describe.serial('Language via URL — Spanish (AC-896-05, 14, 26, 28, 29)', () => {
  flow2.e2e.setTimeout(120_000);

  flow2.e2e('navigate with ?lang=es-CO',
    navigateToSignUpWithLang(flow2.getPage, 'es-CO'));

  flow2.e2e('AC-896-14: selector shows "Español"',
    verifySelectedLanguage(flow2.getPage, 'Español'));

  flow2.e2e('AC-896-26, 29, 30: Form 1 labels in Spanish',
    verifyForm1Language(flow2.getPage, 'es'));

  flow2.e2e('fill lead form (ES)',
    fillLeadForm(flow2.getPage, LEAD_USA_V4));

  flow2.e2e('submit lead form → /details',
    submitLeadForm(flow2.getPage));

  flow2.e2e('AC-896-28: Form 2 labels in Spanish',
    verifyForm2Language(flow2.getPage, 'es'));

  flow2.e2e('AC-896-24: selector visible on Form 2',
    verifyLanguageSelectorVisible(flow2.getPage));
});

// ═════════════════════════════════════════════════════════════════════════════
// Flow 3: Manual Switch via Language Selector
// ═════════════════════════════════════════════════════════════════════════════

const flow3 = createSerialFlow();

flow3.e2e.describe.serial('Language Selector — Manual Switch (AC-896-15..22)', () => {
  flow3.e2e.setTimeout(120_000);

  flow3.e2e('navigate EN',
    navigateToSignUpWithLang(flow3.getPage, 'en-US'));

  flow3.e2e('AC-896-21: Form 1 starts in English',
    verifyForm1Language(flow3.getPage, 'en'));

  flow3.e2e('AC-896-15: open language dropdown',
    openLanguageSelector(flow3.getPage));

  flow3.e2e('AC-896-16: dropdown shows options with labels',
    verifyLanguageDropdownOptions(flow3.getPage));

  flow3.e2e('AC-896-17: switch to Español',
    switchLanguage(flow3.getPage, 'es-CO'));

  flow3.e2e('AC-896-19: dropdown closed after selection',
    verifyDropdownClosed(flow3.getPage));

  flow3.e2e('AC-896-18: language persisted to localStorage',
    verifyLanguagePersisted(flow3.getPage, 'es-CO'));

  flow3.e2e('AC-896-21: Form 1 now in Spanish',
    verifyForm1Language(flow3.getPage, 'es'));

  flow3.e2e('fill lead form (after switch)',
    fillLeadForm(flow3.getPage, LEAD_USA_V4));

  flow3.e2e('submit lead form → /details',
    submitLeadForm(flow3.getPage));

  flow3.e2e('AC-896-22: Form 2 in Spanish (persists across pages)',
    verifyForm2Language(flow3.getPage, 'es'));

  flow3.e2e('AC-896-24: selector still visible on Form 2',
    verifyLanguageSelectorVisible(flow3.getPage));
});

// ═════════════════════════════════════════════════════════════════════════════
// Flow 4: Fuzzy Matching — Base Codes (?lang=es, ?lang=en)
// ═════════════════════════════════════════════════════════════════════════════

const flow4 = createSerialFlow();

flow4.e2e.describe.serial('Fuzzy Matching — Base Codes (AC-896-07, 08)', () => {
  flow4.e2e.setTimeout(60_000);

  flow4.e2e('navigate with ?lang=es (partial code)',
    navigateToSignUpWithLang(flow4.getPage, 'es'));

  flow4.e2e('AC-896-07: resolves to Español',
    verifySelectedLanguage(flow4.getPage, 'Español'));

  flow4.e2e('Form 1 in Spanish',
    verifyForm1Language(flow4.getPage, 'es'));

  flow4.e2e('URL is clean',
    verifyUrlClean(flow4.getPage));
});

// ═════════════════════════════════════════════════════════════════════════════
// Flow 5: Unsupported Language Fallback + Escape closes dropdown
// ═════════════════════════════════════════════════════════════════════════════

const flow5 = createSerialFlow();

flow5.e2e.describe.serial('Unsupported Language + Escape (AC-896-10, 20)', () => {
  flow5.e2e.setTimeout(60_000);

  flow5.e2e('navigate with ?lang=fr (unsupported)',
    navigateToSignUpWithLang(flow5.getPage, 'fr'));

  flow5.e2e('AC-896-10: fallback to English',
    verifySelectedLanguage(flow5.getPage, 'English'));

  flow5.e2e('Form 1 in English (default)',
    verifyForm1Language(flow5.getPage, 'en'));

  flow5.e2e('URL is clean',
    verifyUrlClean(flow5.getPage));

  flow5.e2e('open language selector',
    openLanguageSelector(flow5.getPage));

  flow5.e2e('AC-896-20: Escape closes dropdown',
    closeLanguageSelectorWithEscape(flow5.getPage));
});
