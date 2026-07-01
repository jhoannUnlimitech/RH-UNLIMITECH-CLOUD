/**
 * Test Data Fixtures — Datasets for enrollment E2E tests.
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Re-export Mailosaur email generation for convenience
export { generateMailosaurEmail } from './mailosaur.js';

// ─── Phone Number Generator ─────────────────────────────────────────────────

/**
 * Generate a random valid phone number for the given country.
 * Zoho CRM does not allow duplicate phone numbers across contacts,
 * so each test run needs a unique number.
 */
export function generatePhoneNumber(countryIso2: string): string {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const digits = (n: number) => Array.from({ length: n }, () => rand(0, 9)).join('');

  switch (countryIso2) {
    case 'us':
      // US: 10 digits, area code starts with 2-9, exchange starts with 2-9
      return `${rand(2, 9)}${digits(2)}${rand(2, 9)}${digits(6)}`;
    case 'co':
      // Colombia: 10 digits, mobile starts with 3
      return `3${digits(9)}`;
    default:
      // Generic: 10 random digits starting with non-zero
      return `${rand(1, 9)}${digits(9)}`;
  }
}

// ─── Random Name Generator ──────────────────────────────────────────────────

const FIRST_NAMES = ['James', 'Maria', 'Robert', 'Sarah', 'David', 'Laura', 'Michael', 'Emma', 'Daniel', 'Sofia'];
const LAST_NAMES = ['Anderson', 'Martinez', 'Thompson', 'Garcia', 'Wilson', 'Lopez', 'Taylor', 'Brown', 'Clark', 'Rivera'];

/**
 * Generate a random first name + suffix for uniqueness.
 */
export function generateFirstName(): string {
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const suffix = Math.floor(Math.random() * 900 + 100); // 3-digit number
  return `${name}${suffix}`;
}

/**
 * Generate a random last name.
 */
export function generateLastName(): string {
  return LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  phoneCountry: string;   // ISO2 lowercase (e.g. 'co')
  phoneNumber: string;     // digits only (e.g. '3000000000')
  phoneType?: 'mobile' | 'company' | 'home';  // Phone Type selector (default: mobile)
  street: string;
  addressLine2?: string;
  city: string;
  zip: string;
  countryISO3: string;     // ISO3 uppercase (e.g. 'COL')
  stateISO: string;        // state code (e.g. 'CUN')
  referralSource: string;  // "How did you hear about WISE?"
}

// ─── Datasets ───────────────────────────────────────────────────────────────

export const LEAD_COLOMBIA: LeadFormData = {
  firstName: 'Manuel',
  lastName: 'Lara',
  email: 'testlead.co@example.com',
  companyName: 'My Company Name',
  phoneCountry: 'co',
  phoneNumber: '3000000000',
  phoneType: 'mobile',
  street: 'Address St',
  addressLine2: 'Second Line',
  city: 'Bogota',
  zip: '00000',
  countryISO3: 'COL',
  stateISO: 'CUN',
  referralSource: 'Google Search',
};

export const LEAD_USA: LeadFormData = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'testlead.us@example.com',
  companyName: 'Acme Corp',
  phoneCountry: 'us',
  phoneNumber: '5551234567',
  street: '123 Main St',
  addressLine2: 'Suite 100',
  city: 'Miami',
  zip: '33101',
  countryISO3: 'USA',
  stateISO: 'FL',
  referralSource: 'Website',
};

// ─── Registration Form Data ─────────────────────────────────────────────────

export interface RegistrationFormData {
  position: string;
  companyType: string;
  companyTypeOther?: string;    // Required when companyType === 'other'
  industry: string;
  industryOther?: string;       // Required when industry === 'other'
  companySize: string;
  companyWebsite?: string;
  companyWebsites?: string[];   // repeatable field — up to 5 URLs
  noWebsite?: boolean;          // If true, checks "no website" checkbox (skips URL fields)
  companyFounded: string;
  // Billing address (optional — only when "same as company" unchecked)
  billingSameAsCompany?: boolean;
  billingStreet?: string;
  billingLine2?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountryISO3?: string;
  billingStateISO?: string;
  // Alternate phone (optional)
  altPhoneCountry?: string;
  altPhoneNumber?: string;
  altPhoneType?: 'mobile' | 'company' | 'home';  // Additional Phone Type selector
  // Membership preferences — radios
  prosperityPlanner: string;    // 'on_request' | 'automatic' | 'do_not_ship'
  hcaBooklets: string;          // 'automatic' | 'on_request' | 'do_not_ship'
  // Membership preferences — checkbox arrays
  interests: string[];           // e.g. ['mastertech_software', 'personnel_potential']
  emailNewsletters: string[];    // e.g. ['church_events', 'hca_resources']
  // Personal profile
  personalStreet?: string;
  personalLine2?: string;
  personalCity?: string;
  personalZip?: string;
  personalCountryISO3?: string;
  personalStateISO?: string;
  birthYear?: string;
  education: string;
  educationDetails?: string;  // Required when education is not 'high_school_ged' or 'no_high_school_diploma'
  preferredLanguageISO: string;
  secondaryLanguageISO?: string;
  // Profile photo (optional — path to image file for upload)
  profilePhotoPath?: string;
}

export const REG_COLOMBIA: RegistrationFormData = {
  position: 'company_owner',
  companyType: 'sole_proprietor',
  industry: 'education',
  companySize: '5_9',
  companyWebsite: 'www.mywebsite.com',
  companyFounded: '2020',
  altPhoneCountry: 'co',
  altPhoneNumber: '3003202000',
  altPhoneType: 'mobile',
  prosperityPlanner: 'automatic',
  hcaBooklets: 'automatic',
  interests: ['mastertech_software', 'personnel_potential', 'admin_knowhow'],
  emailNewsletters: ['church_events', 'hca_resources', 'mastertech_updates'],
  personalStreet: 'My Address st',
  personalLine2: 'apt 890',
  personalCity: 'Doral',
  personalZip: '33558',
  personalCountryISO3: 'USA',
  personalStateISO: 'FL',
  birthYear: '1990',
  education: 'associate_degree',
  educationDetails: 'Associate Degree in Business Administration',
  preferredLanguageISO: 'en',
  secondaryLanguageISO: 'es',
};

// ═════════════════════════════════════════════════════════════════════════════
// Session Validation Data (AC-01, AC-02)
// ═════════════════════════════════════════════════════════════════════════════

export interface SessionValidationData {
  /** A well-formed UUID that does NOT exist in DynamoDB */
  inventedSessionId: string;
  /** A string that is not a valid UUID format */
  malformedSessionId: string;
}

export const SESSION_INVALID: SessionValidationData = {
  inventedSessionId: '00000000-0000-0000-0000-000000000000',
  malformedSessionId: 'not-a-valid-uuid',
};

// ═════════════════════════════════════════════════════════════════════════════
// Lead Form Validation Data (AC-04, AC-05, AC-06, AC-07, AC-08)
// ═════════════════════════════════════════════════════════════════════════════

export interface LeadFormValidationData {
  /** Valid base data — all fields correct */
  base: LeadFormData;
  /** Invalid email formats for AC-05 */
  invalidEmails: string[];
  /** Phone country + expected prefix for AC-08 */
  phoneVerification: {
    countryIso2: string;
    expectedPrefix: string;
  };
  /** Alternate country to test state clearing (AC-07) */
  alternateCountryISO3: string;
  /** State of the alternate country (AC-07) */
  alternateStateISO: string;
}

export const LEAD_VALIDATION_COLOMBIA: LeadFormValidationData = {
  base: LEAD_COLOMBIA,
  invalidEmails: ['not-an-email', 'user@', '@domain.com', 'spaces in@email.com'],
  phoneVerification: { countryIso2: 'co', expectedPrefix: '+57' },
  alternateCountryISO3: 'USA',
  alternateStateISO: 'FL',
};

// ═════════════════════════════════════════════════════════════════════════════
// Registration Form Validation Data (AC-09 to AC-14)
// ═════════════════════════════════════════════════════════════════════════════

export interface RegistrationValidationData {
  /** Valid base data — all fields correct */
  base: RegistrationFormData;
  /** Valid birth year (4 digits, not future) */
  validBirthYear: string;
  /** Future year (should fail validation) */
  futureBirthYear: string;
  /** Non-numeric input (should be rejected) */
  nonNumericYear: string;
  /** Too few digits */
  shortYear: string;
  /** Valid company founded year (4 digits, not future) */
  validFoundedYear: string;
  /** Too many digits (5+) */
  longYear: string;
  /** Mixed alphanumeric (e.g. '20ab') */
  mixedAlphanumericYear: string;
}

export const REG_VALIDATION_COLOMBIA: RegistrationValidationData = {
  base: REG_COLOMBIA,
  validBirthYear: '1990',
  futureBirthYear: '2030',
  nonNumericYear: 'abcd',
  shortYear: '90',
  validFoundedYear: '2020',
  longYear: '19901',
  mixedAlphanumericYear: '20ab',
};

// ═════════════════════════════════════════════════════════════════════════════
// Plan Selection Validation Data (AC-15, AC-15b, AC-15c, AC-15d, AC-16, AC-36)
// ═════════════════════════════════════════════════════════════════════════════

export interface PlanSelectionValidationData {
  /** Valid base data for lead form setup */
  base: LeadFormData;
  /** Valid registration data for setup */
  registration: RegistrationFormData;
  /** Session-id with status 'paid' (payment confirmed) — for AC-18a, AC-18e happy path */
  paidSessionId: string;
  /** Session-id with status 'pending' (checkout done but webhook not confirmed) — for AC-18b, AC-18c, AC-18d */
  pendingSessionId: string;
  /** Expected plan cnames visible in annual interval */
  annualPlanCnames: string[];
  /** Expected plan cnames visible in monthly interval */
  monthlyPlanCnames: string[];
}

export const PLAN_VALIDATION_COLOMBIA: PlanSelectionValidationData = {
  base: LEAD_COLOMBIA,
  registration: REG_COLOMBIA,
  // ⚠️ Development environment session IDs — must be updated if the database is reset.
  // These sessions were created during manual testing and have specific statuses in DynamoDB.
  paidSessionId: 'a74700a6-4d0a-428b-b6b8-41d9a2418fab',     // status: paid (payment confirmed)
  pendingSessionId: '3c0b5ec5-2205-496c-bf99-5d7eb003e695',   // status: pending (webhook not confirmed)
  annualPlanCnames: ['individual', 'general', 'company', 'corporate'],
  monthlyPlanCnames: ['general', 'company', 'corporate'],
};

// ═════════════════════════════════════════════════════════════════════════════
// Checkout Validation Data (AC-16, AC-16b, AC-17, AC-18)
// ═════════════════════════════════════════════════════════════════════════════

export interface CheckoutValidationData {
  /** Valid base data for lead form setup */
  base: LeadFormData;
  /** Valid registration data for setup */
  registration: RegistrationFormData;
  /** Plan cname to select for checkout (e.g. 'general') */
  planCname: string;
  /** Expected plan name as displayed in the UI */
  planDisplayName: string;
  /** Email used in lead form — should be pre-filled in Stripe */
  expectedEmail: string;
}

export const CHECKOUT_VALIDATION_COLOMBIA: CheckoutValidationData = {
  base: LEAD_COLOMBIA,
  registration: REG_COLOMBIA,
  planCname: 'general',
  planDisplayName: 'General Membership',
  expectedEmail: LEAD_COLOMBIA.email,
};

// ═════════════════════════════════════════════════════════════════════════════
// Agreement Validation Data (AC-20, AC-22)
// ═════════════════════════════════════════════════════════════════════════════

export interface AgreementValidationData {
  /** Session-id with status 'paid' or 'pending_signature' — for agreement page tests */
  paidSessionId: string;
  /** Session-id with status 'completed' — for completed page verification */
  completedSessionId: string;
  /** Signer name for the agreement */
  signerName: string;
  /** Signer initials for the agreement */
  signerInitials: string;
}

export const AGREEMENT_VALIDATION: AgreementValidationData = {
  // ⚠️ Development environment session IDs — must be updated if the database is reset.
  paidSessionId: '2167fe4d-ef59-4b3f-9431-cb1535adbf53',     // status: paid/pending_signature (for agreement page tests)
  completedSessionId: '425d98a4-98b3-4b95-84e7-9728b4be16c3', // status: completed (for completed page tests)
  signerName: 'Manuel Lara',
  signerInitials: 'ML',
};

// ═════════════════════════════════════════════════════════════════════════════
// Stripe Test Card Data
// ═════════════════════════════════════════════════════════════════════════════

export interface StripeTestCardData {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

/** Stripe test mode card — always succeeds. See https://docs.stripe.com/testing */
export const STRIPE_TEST_CARD: StripeTestCardData = {
  number: '4242424242424242',
  expiry: '1040',
  cvc: '123',
  name: 'Test User',
};

// ═════════════════════════════════════════════════════════════════════════════
// Zoho Sign Labels — External iframe button/field labels (locale-dependent)
// ═════════════════════════════════════════════════════════════════════════════

export interface ZohoSignLabels {
  /** Button to start the signing flow */
  startSigning: string;
  /** Button to accept Terms & Conditions */
  acceptTerms: string;
  /** Button to open signature dialog */
  addSignature: string;
  /** Label for the signature name field */
  signatureLabel: string;
  /** Label for the initials field */
  initialsLabel: string;
  /** Button to accept/confirm the signature */
  acceptSignature: string;
  /** Button to finalize and submit the signed document */
  finalize: string;
}

/** Zoho Sign labels in Spanish (es) — DUAL SIGNER template (admin + client) */
export const ZOHO_SIGN_LABELS_ES: ZohoSignLabels = {
  startSigning: 'Comenzar a firmar',
  acceptTerms: 'Acepto',
  addSignature: 'Add signature',
  signatureLabel: 'Firma',
  initialsLabel: 'Inicial',
  acceptSignature: 'Aceptar',
  finalize: 'Finalizar',
};

/** Zoho Sign labels in English (en) — DUAL SIGNER template (admin + client) */
export const ZOHO_SIGN_LABELS_EN: ZohoSignLabels = {
  startSigning: 'Start signing',
  acceptTerms: 'Agree',
  addSignature: 'Add signature',
  signatureLabel: 'Signature',
  initialsLabel: 'Initial',
  acceptSignature: 'Ok',
  finalize: 'Finish',
};

// ═════════════════════════════════════════════════════════════════════════════
// Zoho Sign Labels — Single Signer template (client only, no admin signature)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Single-signer Zoho Sign flow labels.
 *
 * In single-signer mode, the iframe skips "Start signing" and goes directly
 * to Terms & Conditions. The signature step uses a preview selector + OK
 * instead of "Add signature" + "Accept".
 */
export interface ZohoSignSingleSignerLabels {
  /** Button to accept Terms & Conditions */
  acceptTerms: string;
  /** Label for the signature name field */
  signatureLabel: string;
  /** Label for the initials field */
  initialsLabel: string;
  /** Button to confirm signature selection (after preview) */
  confirmSignature: string;
  /** Button to finalize and submit the signed document */
  finalize: string;
}

/** Zoho Sign single-signer labels — English */
export const ZOHO_SIGN_SINGLE_EN: ZohoSignSingleSignerLabels = {
  acceptTerms: 'Agree',
  signatureLabel: 'Signature',
  initialsLabel: 'Initial',
  confirmSignature: 'OK',
  finalize: 'Finish',
};

/** Zoho Sign single-signer labels — Spanish */
export const ZOHO_SIGN_SINGLE_ES: ZohoSignSingleSignerLabels = {
  acceptTerms: 'Acepto',
  signatureLabel: 'Firma',
  initialsLabel: 'Inicial',
  confirmSignature: 'Aceptar',
  finalize: 'Finalizar',
};

// ═════════════════════════════════════════════════════════════════════════════
// Multi-Admin Agreement — Admin email constants
// ═════════════════════════════════════════════════════════════════════════════

const MAILOSAUR_SERVER = process.env.MAILOSAUR_SERVER_ID || 'isyifpzu';

/** Admin 1 email for multi-admin agreement template (Wise Admin 1) */
export const ADMIN_EMAIL_1 = process.env.ZOHO_SIGN_ADMIN_EMAIL_1 || `admin1@${MAILOSAUR_SERVER}.mailosaur.net`;

/** Admin 2 email for multi-admin agreement template (Wise Admin 2) */
export const ADMIN_EMAIL_2 = process.env.ZOHO_SIGN_ADMIN_EMAIL_2 || `admin2@${MAILOSAUR_SERVER}.mailosaur.net`;

// ═════════════════════════════════════════════════════════════════════════════
// Plan Selection Data (v3 — plan selection at the start of the flow)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Plan selection data — used by selectPlan() factory.
 * Represents the plan the user selects (or that comes pre-selected from params).
 */
export interface PlanSelectionData {
  /** Product cname (e.g. 'general', 'company', 'charter') */
  cname: string;
  /** Billing interval */
  interval: 'month' | 'year';
}

/**
 * Escenario A: Complete query params → skip plan selection page.
 * Used by navigateToSignUpWithPlan() factory.
 */
export interface EnrollmentParamsComplete {
  /** Product cname (e.g. 'general') */
  plan: string;
  /** Billing interval */
  interval: 'month' | 'year';
}

/**
 * Escenario B: Partial query params → plan selection with preselection.
 * Used by navigateToSignUpWithPartialPlan() factory.
 */
export interface EnrollmentParamsPartial {
  /** Product cname (e.g. 'general') */
  plan: string;
}

// ─── Plan Datasets ──────────────────────────────────────────────────────────

export const PLAN_GENERAL_ANNUAL: PlanSelectionData = { cname: 'general', interval: 'year' };
export const PLAN_GENERAL_MONTHLY: PlanSelectionData = { cname: 'general', interval: 'month' };
export const PLAN_COMPANY_ANNUAL: PlanSelectionData = { cname: 'company', interval: 'year' };
export const PLAN_INDIVIDUAL_ANNUAL: PlanSelectionData = { cname: 'individual', interval: 'year' };

// ─── Enrollment Params Datasets ─────────────────────────────────────────────

/** Escenario A: plan + interval → skip plan selection */
export const PARAMS_GENERAL_ANNUAL: EnrollmentParamsComplete = { plan: 'general', interval: 'year' };
export const PARAMS_COMPANY_ANNUAL: EnrollmentParamsComplete = { plan: 'company', interval: 'year' };

/** Escenario B: plan only → plan selection with preselection */
export const PARAMS_GENERAL_ONLY: EnrollmentParamsPartial = { plan: 'general' };

// ═════════════════════════════════════════════════════════════════════════════
// V4 Enrollment Params — Optional & Independent (AC-52)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * V4 query params — all optional, all independent.
 *
 * Key V4 change: `plan+interval` does NOT skip plan selection.
 * It only pre-selects/highlights in the Plan Selection page (step 3).
 * `country` pre-fills the country select in General Info.
 */
export interface EnrollmentParamsV4 {
  /** Product cname — pre-highlights in Plan Selection */
  plan?: string;
  /** Billing interval — pre-selects toggle in Plan Selection */
  interval?: 'month' | 'year';
  /** Country ISO code — pre-fills country in General Info */
  country?: string;
  /** Language ISO code — pre-selects language preference */
  language?: string;
}

// ─── V4 Params Datasets ─────────────────────────────────────────────────────

/** All params: plan + interval + country */
export const PARAMS_V4_FULL: EnrollmentParamsV4 = { plan: 'general', interval: 'year', country: 'USA' };
/** Plan only: pre-highlights plan, interval defaults to year */
export const PARAMS_V4_PLAN_ONLY: EnrollmentParamsV4 = { plan: 'general' };
/** Country only: pre-fills country in General Info */
export const PARAMS_V4_COUNTRY_ONLY: EnrollmentParamsV4 = { country: 'USA' };
/** Plan + country: pre-highlights plan + pre-fills country */
export const PARAMS_V4_PLAN_COUNTRY: EnrollmentParamsV4 = { plan: 'general', country: 'USA' };
/** Interval only: pre-selects monthly toggle */
export const PARAMS_V4_INTERVAL_ONLY: EnrollmentParamsV4 = { interval: 'month' };
/** Plan + interval (no country): pre-highlights plan + pre-selects interval */
export const PARAMS_V4_PLAN_INTERVAL: EnrollmentParamsV4 = { plan: 'company', interval: 'year' };

// ═════════════════════════════════════════════════════════════════════════════
// V4 Lead Form Data — USA (from Jam 01e8f2d9)
// ═════════════════════════════════════════════════════════════════════════════

export const LEAD_USA_V4: LeadFormData = {
  firstName: generateFirstName(),
  lastName: generateLastName(),
  email: 'testlead.v4@example.com',
  companyName: `Unlimitech Testing LLC - ${Date.now()}`,
  phoneCountry: 'us',
  phoneNumber: generatePhoneNumber('us'),
  phoneType: 'mobile',
  street: 'My Address',
  addressLine2: 'Suite 200',
  city: 'My City',
  zip: '11111',
  countryISO3: 'USA',
  stateISO: 'FL',
  referralSource: 'Partner Referral',
};

// ═════════════════════════════════════════════════════════════════════════════
// V4 Registration Form Data — USA (from Jam 01e8f2d9)
// ═════════════════════════════════════════════════════════════════════════════

export const REG_USA_V4: RegistrationFormData = {
  position: 'company_owner',
  companyType: 'llc',
  industry: 'architecture',
  companySize: '20_49',
  companyFounded: '2010',
  companyWebsites: [
    'https://www.unlimitech-testing.com',
    'https://blog.unlimitech-testing.com',
    'https://shop.unlimitech-testing.com',
  ],
  altPhoneCountry: 'us',
  altPhoneNumber: generatePhoneNumber('us'),
  altPhoneType: 'mobile',
  prosperityPlanner: 'on_request',
  hcaBooklets: 'on_request',
  interests: ['hca_degrees', 'hca_printed'],
  emailNewsletters: ['none'],
  personalStreet: 'My Address 2',
  personalLine2: 'Apt 305',
  personalCity: 'My City 2',
  personalZip: '111111',
  personalCountryISO3: 'USA',
  personalStateISO: 'FL',
  birthYear: '1980',
  education: 'doctorate',
  educationDetails: 'PhD in Business Administration - Harvard University, 2015',
  preferredLanguageISO: 'en',
  secondaryLanguageISO: 'es',
  profilePhotoPath: resolve(dirname(fileURLToPath(import.meta.url)), '../../examples/profile-images/profile_under_10mb_square_b.jpg'),
};

/**
 * REG_USA_V4 variant with Preferred Language = Russian.
 * Used for live environment validation (bugfix/review-test-qa-live).
 * Tests that the language dropdown accepts Russian, CRM stores "Russian",
 * and the Zoho Sign template falls back to English (no Russian template).
 */
export const REG_USA_V4_RU: RegistrationFormData = {
  ...REG_USA_V4,
  preferredLanguageISO: 'ru',
  secondaryLanguageISO: 'en',
};

// ═════════════════════════════════════════════════════════════════════════════
// Agreement Template Selection Data (AC-20e to AC-20j)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Datasets for testing automatic template selection by language.
 *
 * The system selects the Zoho Sign template based on:
 *   1. preferredLanguageISO + countryISO3 → exact match (e.g. "es-COL")
 *   2. preferredLanguageISO only → language fallback (e.g. "es")
 *   3. "en" → English fallback (if no template for the language)
 *
 * Template naming convention:
 *   "2021-WISE-US-Member-Agreement-Envelope (003) - {locale}"
 */

/** Escenario 1: Español + Colombia → es-COL (exact match) */
export const REG_TEMPLATE_ES_COL: RegistrationFormData = {
  ...REG_COLOMBIA,
  preferredLanguageISO: 'es',
};

/** Escenario 2: Español + España → es (fallback idioma, no existe es-ESP) */
export const LEAD_SPAIN: LeadFormData = {
  ...LEAD_COLOMBIA,
  countryISO3: 'ESP',
  stateISO: 'MD',  // Madrid (country-state-city ISO code for Spain)
  city: 'Madrid',
  zip: '28001',
};

export const REG_TEMPLATE_ES: RegistrationFormData = {
  ...REG_COLOMBIA,
  preferredLanguageISO: 'es',
};

/** Escenario 3: Francés + Canadá → fr (fallback idioma) */
export const LEAD_CANADA: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'CAN',
  stateISO: 'QC',  // Quebec
  city: 'Montreal',
  zip: 'H2X 1Y4',
};

export const REG_TEMPLATE_FR: RegistrationFormData = {
  ...REG_COLOMBIA,
  preferredLanguageISO: 'fr',
};

/** Escenario 4: Coreano + Corea → en (fallback inglés, no existe template ko) */
export const LEAD_KOREA: LeadFormData = {
  ...LEAD_COLOMBIA,
  countryISO3: 'KOR',
  stateISO: '11',  // Seoul
  city: 'Seoul',
  zip: '04524',
  phoneCountry: 'kr',
  phoneNumber: '1012345678',
};

export const REG_TEMPLATE_KO: RegistrationFormData = {
  ...REG_COLOMBIA,
  preferredLanguageISO: 'ko',
};

/** Escenario 5: Inglés + EEUU → en (directo) */
export const REG_TEMPLATE_EN: RegistrationFormData = {
  ...REG_COLOMBIA,
  preferredLanguageISO: 'en',
};

// ═════════════════════════════════════════════════════════════════════════════
// Agreement Template i18n Audit — Lead datasets per country
// Each lead represents a country used to test the template fallback chain.
// ═════════════════════════════════════════════════════════════════════════════

/** Checo + República Checa → cs (fallback idioma) */
export const LEAD_CZECH_REPUBLIC: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'CZE',
  stateISO: '201',  // Benešov
  city: 'Prague',
  zip: '11000',
  phoneCountry: 'cz',
  phoneNumber: '601234567',
};

/** Danés + Dinamarca → da (fallback idioma) */
export const LEAD_DENMARK: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'DNK',
  stateISO: '84',  // Capital Region of Denmark
  city: 'Copenhagen',
  zip: '1000',
  phoneCountry: 'dk',
  phoneNumber: '20123456',
};

/** Alemán + Alemania → de (fallback idioma) */
export const LEAD_GERMANY: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'DEU',
  stateISO: 'BW',  // Baden-Württemberg
  city: 'Berlin',
  zip: '10115',
  phoneCountry: 'de',
  phoneNumber: '15112345678',
};

/** Griego + Grecia → el (fallback idioma) */
export const LEAD_GREECE: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'GRC',
  stateISO: '13',  // Achaea Regional Unit
  city: 'Athens',
  zip: '10431',
  phoneCountry: 'gr',
  phoneNumber: '6912345678',
};

/** Francés + Francia → fr (fallback idioma) */
export const LEAD_FRANCE: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'FRA',
  stateISO: '01',  // Ain
  city: 'Paris',
  zip: '75001',
  phoneCountry: 'fr',
  phoneNumber: '612345678',
};

/** Hebreo + Israel → he (fallback idioma) */
export const LEAD_ISRAEL: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'ISR',
  stateISO: 'M',  // Central District
  city: 'Tel Aviv',
  zip: '6100000',
  phoneCountry: 'il',
  phoneNumber: '501234567',
};

/** Húngaro + Hungría → hu (fallback idioma) */
export const LEAD_HUNGARY: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'HUN',
  stateISO: 'BA',  // Baranya County
  city: 'Budapest',
  zip: '1011',
  phoneCountry: 'hu',
  phoneNumber: '201234567',
};

/** Italiano + Italia → it (fallback idioma) */
export const LEAD_ITALY: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'ITA',
  stateISO: '65',  // Abruzzo
  city: 'Roma',
  zip: '00100',
  phoneCountry: 'it',
  phoneNumber: '3201234567',
};

/** Japonés + Japón → ja (fallback idioma) */
export const LEAD_JAPAN: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'JPN',
  stateISO: '23',  // Aichi Prefecture
  city: 'Tokyo',
  zip: '1000001',
  phoneCountry: 'jp',
  phoneNumber: '9012345678',
};

/** Holandés + Países Bajos → nl (fallback idioma) */
export const LEAD_NETHERLANDS: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'NLD',
  stateISO: 'BQ1',  // Bonaire
  city: 'Amsterdam',
  zip: '1012',
  phoneCountry: 'nl',
  phoneNumber: '612345678',
};

/** Noruego + Noruega → no (fallback idioma) */
export const LEAD_NORWAY: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'NOR',
  stateISO: '02',  // Akershus
  city: 'Oslo',
  zip: '0001',
  phoneCountry: 'no',
  phoneNumber: '41234567',
};

/** Portugués + Brasil → pt (fallback idioma) */
export const LEAD_BRAZIL: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'BRA',
  stateISO: 'AC',  // Acre
  city: 'São Paulo',
  zip: '01000000',
  phoneCountry: 'br',
  phoneNumber: '11912345678',
};

/** Ruso + Rusia → ru (fallback idioma) */
export const LEAD_RUSSIA: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'RUS',
  stateISO: 'ALT',  // Altai Krai
  city: 'Moscow',
  zip: '101000',
  phoneCountry: 'ru',
  phoneNumber: '9121234567',
};

/** Eslovaco + Eslovaquia → sk (fallback idioma) */
export const LEAD_SLOVAKIA: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'SVK',
  stateISO: 'BC',  // Banská Bystrica Region
  city: 'Bratislava',
  zip: '81101',
  phoneCountry: 'sk',
  phoneNumber: '901234567',
};

/** Sueco + Suecia → sv (fallback idioma) */
export const LEAD_SWEDEN: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'SWE',
  stateISO: 'K',  // Blekinge
  city: 'Stockholm',
  zip: '11120',
  phoneCountry: 'se',
  phoneNumber: '701234567',
};

/** Chino + China → zh (fallback idioma) */
export const LEAD_CHINA: LeadFormData = {
  ...LEAD_USA,
  countryISO3: 'CHN',
  stateISO: 'AH',  // Anhui
  city: 'Beijing',
  zip: '100000',
  phoneCountry: 'cn',
  phoneNumber: '13812345678',
};

// ═════════════════════════════════════════════════════════════════════════════
// Agreement Template i18n Audit — Registration datasets per language
// Each sets the preferredLanguageISO to test template resolution.
// ═════════════════════════════════════════════════════════════════════════════

/** Checo → cs */
export const REG_TEMPLATE_CS: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'cs' };
/** Danés → da */
export const REG_TEMPLATE_DA: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'da' };
/** Alemán → de */
export const REG_TEMPLATE_DE: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'de' };
/** Griego → el */
export const REG_TEMPLATE_EL: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'el' };
/** Hebreo → he */
export const REG_TEMPLATE_HE: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'he' };
/** Húngaro → hu */
export const REG_TEMPLATE_HU: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'hu' };
/** Italiano → it */
export const REG_TEMPLATE_IT: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'it' };
/** Japonés → ja */
export const REG_TEMPLATE_JA: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'ja' };
/** Holandés → nl */
export const REG_TEMPLATE_NL: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'nl' };
/** Noruego → no */
export const REG_TEMPLATE_NO: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'no' };
/** Portugués → pt */
export const REG_TEMPLATE_PT: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'pt' };
/** Ruso → ru */
export const REG_TEMPLATE_RU: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'ru' };
/** Eslovaco → sk */
export const REG_TEMPLATE_SK: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'sk' };
/** Sueco → sv */
export const REG_TEMPLATE_SV: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'sv' };
/** Chino → zh */
export const REG_TEMPLATE_ZH: RegistrationFormData = { ...REG_COLOMBIA, preferredLanguageISO: 'zh' };

// ═════════════════════════════════════════════════════════════════════════════
// Agreement Template i18n Audit — Scenario definitions
// Maps each language to its lead (country) and registration (language) dataset.
// Used by agreement-template-i18n-audit.spec.ts to generate independent test flows.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * TemplateScenario — Defines a single i18n template resolution test case.
 *
 * Each scenario exercises the fallback chain:
 *   1. language+country (exact) → 2. language only → 3. English fallback
 */
export interface TemplateScenario {
  /** Unique slug for email generation and test identification */
  id: string;
  /** Human-readable description for the test title */
  description: string;
  /** AC criterion being validated (e.g. AC-20g) */
  criterion: string;
  /** Lead form data — determines country in the fallback chain */
  lead: LeadFormData;
  /** Registration form data — determines preferred language */
  registration: RegistrationFormData;
}

/**
 * All i18n template scenarios — covers every imported template + English fallback.
 *
 * Organized by fallback type:
 *   1. Exact match (language + country template exists)
 *   2. Language fallback (no regional variant, uses language-only template)
 *   3. English fallback (no template for the language at all)
 */
export const TEMPLATE_I18N_SCENARIOS: TemplateScenario[] = [
  // ── Exact match (language + country) ────────────────────────────────────
  { id: 'es-col', description: 'Español + Colombia → es-COL (exact match)', criterion: 'AC-20g', lead: LEAD_COLOMBIA, registration: REG_TEMPLATE_ES_COL },

  // ── Language fallback (no regional variant exists) ──────────────────────
  { id: 'es-esp', description: 'Español + España → es (language fallback)', criterion: 'AC-20h', lead: LEAD_SPAIN, registration: REG_TEMPLATE_ES },
  { id: 'en-usa', description: 'Inglés + EEUU → en (direct match)', criterion: 'AC-20e', lead: LEAD_USA, registration: REG_TEMPLATE_EN },
  { id: 'fr-can', description: 'Francés + Canadá → fr (language fallback)', criterion: 'AC-20f', lead: LEAD_CANADA, registration: REG_TEMPLATE_FR },
  { id: 'fr-fra', description: 'Francés + Francia → fr (language fallback)', criterion: 'AC-20f', lead: LEAD_FRANCE, registration: REG_TEMPLATE_FR },
  { id: 'de-deu', description: 'Alemán + Alemania → de (language fallback)', criterion: 'AC-20f', lead: LEAD_GERMANY, registration: REG_TEMPLATE_DE },
  { id: 'it-ita', description: 'Italiano + Italia → it (language fallback)', criterion: 'AC-20f', lead: LEAD_ITALY, registration: REG_TEMPLATE_IT },
  { id: 'pt-bra', description: 'Portugués + Brasil → pt (language fallback)', criterion: 'AC-20f', lead: LEAD_BRAZIL, registration: REG_TEMPLATE_PT },
  { id: 'ja-jpn', description: 'Japonés + Japón → ja (language fallback)', criterion: 'AC-20f', lead: LEAD_JAPAN, registration: REG_TEMPLATE_JA },
  { id: 'ru-rus', description: 'Ruso + Rusia → ru (language fallback)', criterion: 'AC-20f', lead: LEAD_RUSSIA, registration: REG_TEMPLATE_RU },
  { id: 'nl-nld', description: 'Holandés + Países Bajos → nl (language fallback)', criterion: 'AC-20f', lead: LEAD_NETHERLANDS, registration: REG_TEMPLATE_NL },
  { id: 'sv-swe', description: 'Sueco + Suecia → sv (language fallback)', criterion: 'AC-20f', lead: LEAD_SWEDEN, registration: REG_TEMPLATE_SV },
  { id: 'zh-chn', description: 'Chino + China → zh (language fallback)', criterion: 'AC-20f', lead: LEAD_CHINA, registration: REG_TEMPLATE_ZH },
  { id: 'cs-cze', description: 'Checo + Rep. Checa → cs (language fallback)', criterion: 'AC-20f', lead: LEAD_CZECH_REPUBLIC, registration: REG_TEMPLATE_CS },
  { id: 'da-dnk', description: 'Danés + Dinamarca → da (language fallback)', criterion: 'AC-20f', lead: LEAD_DENMARK, registration: REG_TEMPLATE_DA },
  { id: 'el-grc', description: 'Griego + Grecia → el (language fallback)', criterion: 'AC-20f', lead: LEAD_GREECE, registration: REG_TEMPLATE_EL },
  { id: 'he-isr', description: 'Hebreo + Israel → he (language fallback)', criterion: 'AC-20f', lead: LEAD_ISRAEL, registration: REG_TEMPLATE_HE },
  { id: 'hu-hun', description: 'Húngaro + Hungría → hu (language fallback)', criterion: 'AC-20f', lead: LEAD_HUNGARY, registration: REG_TEMPLATE_HU },
  { id: 'no-nor', description: 'Noruego + Noruega → no (language fallback)', criterion: 'AC-20f', lead: LEAD_NORWAY, registration: REG_TEMPLATE_NO },
  { id: 'sk-svk', description: 'Eslovaco + Eslovaquia → sk (language fallback)', criterion: 'AC-20f', lead: LEAD_SLOVAKIA, registration: REG_TEMPLATE_SK },

  // ── English fallback (language has no template) ─────────────────────────
  { id: 'ko-kor', description: 'Coreano + Corea → en (English fallback, no ko template)', criterion: 'AC-20i', lead: LEAD_KOREA, registration: REG_TEMPLATE_KO },
];

// ═════════════════════════════════════════════════════════════════════════════
// Enrollment Form Adjustments — Validation Data (AC-EF01 to AC-EF20, AC-CRM01)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Billing address data for testing the billing address section.
 */
export interface BillingAddressData {
  street: string;
  line2?: string;
  city: string;
  zip: string;
  countryISO3: string;
  stateISO: string;
}

export const BILLING_ADDRESS_USA: BillingAddressData = {
  street: '456 Billing Ave',
  line2: 'Floor 2',
  city: 'Orlando',
  zip: '32801',
  countryISO3: 'USA',
  stateISO: 'FL',
};

/**
 * Company websites data for testing the repeatable website field.
 */
export const COMPANY_WEBSITES: string[] = [
  'https://www.mycompany.com',
  'https://www.mycompany.co',
  'https://blog.mycompany.com',
  'https://shop.mycompany.com',
  'https://support.mycompany.com',
];

/**
 * Country filter validation data.
 * WISE Continental Territories: 90 allowed countries.
 */
export const COUNTRY_FILTER = {
  /** Total number of allowed countries in the WISE filter (96 in allowed-countries.ts) */
  expectedCount: 96,
  /** Sample of countries that MUST be in the dropdown (ISO3) */
  includedCountries: ['USA', 'COL', 'GBR', 'AUS', 'DEU', 'BRA', 'JPN', 'KOR', 'ZAF', 'MEX'],
  /** Sample of countries that MUST NOT be in the dropdown (ISO3) */
  excludedCountries: ['CHN', 'RUS', 'IRN', 'PRK', 'AFG', 'SYR', 'IRQ', 'LBY', 'SDN', 'SOM'],
};

/**
 * Plan grid validation data — expected plans after Charter removal.
 */
export const PLAN_GRID = {
  /** Plans that MUST be visible in the grid */
  expectedPlans: ['individual', 'general', 'company', 'corporate'],
  /** Plans that MUST NOT be visible in the grid (removed) */
  removedPlans: ['charter'],
  /** Plans available in annual interval */
  annualPlans: ['individual', 'general', 'company', 'corporate'],
  /** Plans available in monthly interval (Individual is annual-only) */
  monthlyPlans: ['general', 'company', 'corporate'],
};

/**
 * Registration form data with 5 company URLs — validates full CRM website mapping.
 * Used by ticket #869 to test all 5 Account fields:
 *   URL[0] → Company_Website1, URL[1] → Company_Website (SM1),
 *   URL[2] → Company_Website_Social_Media2, URL[3] → SM3, URL[4] → SM4
 */
export const REG_USA_V4_5URLS: RegistrationFormData = {
  ...REG_USA_V4,
  companyWebsites: [
    'https://www.company-main.com',        // → Company_Website1
    'https://blog.company-main.com',       // → Company_Website (SM1)
    'https://shop.company-main.com',       // → Company_Website_Social_Media2
    'https://careers.company-main.com',    // → Company_Website_Social_Media3
    'https://docs.company-main.com',       // → Company_Website_Social_Media4
  ],
};

/**
 * Registration form data with billing address (different from company address).
 */
export const REG_USA_V4_WITH_BILLING: RegistrationFormData = {
  ...REG_USA_V4,
  billingSameAsCompany: false,
  billingStreet: '456 Billing Ave',
  billingLine2: 'Floor 2',
  billingCity: 'Orlando',
  billingZip: '32801',
  billingCountryISO3: 'USA',
  billingStateISO: 'FL',
  companyWebsites: ['www.mycompany.com', 'blog.mycompany.com'],
};

// ═════════════════════════════════════════════════════════════════════════════
// Language Selector Test Data (#896)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Test data for language selector validation.
 *
 * Each dataset represents a ?lang= URL param scenario with the expected
 * resolved language, selector label, and i18n locale for text verification.
 */
export interface LanguageTestData {
  /** Language code for ?lang= param */
  langParam: string;
  /** Expected resolved language code (what i18n uses internally) */
  resolvedCode: string;
  /** Expected label shown in the selector trigger button */
  selectorLabel: string;
  /** Locale key for i18n fixture ('en' | 'es') */
  locale: 'en' | 'es';
}

/** English via exact code — ?lang=en-US */
export const LANG_EN_US: LanguageTestData = {
  langParam: 'en-US',
  resolvedCode: 'en-US',
  selectorLabel: 'English',
  locale: 'en',
};

/** English via base code (fuzzy match) — ?lang=en */
export const LANG_EN: LanguageTestData = {
  langParam: 'en',
  resolvedCode: 'en-US',
  selectorLabel: 'English',
  locale: 'en',
};

/** Spanish via exact code — ?lang=es-CO */
export const LANG_ES_CO: LanguageTestData = {
  langParam: 'es-CO',
  resolvedCode: 'es-CO',
  selectorLabel: 'Español',
  locale: 'es',
};

/** Spanish via base code (fuzzy match) — ?lang=es */
export const LANG_ES: LanguageTestData = {
  langParam: 'es',
  resolvedCode: 'es-CO',
  selectorLabel: 'Español',
  locale: 'es',
};

/** Unsupported language — should fallback to English default */
export const LANG_UNSUPPORTED: LanguageTestData = {
  langParam: 'fr',
  resolvedCode: 'en-US',
  selectorLabel: 'English',
  locale: 'en',
};
