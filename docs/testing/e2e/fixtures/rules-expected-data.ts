/**
 * Rules Expected Data — Reference values from the Rules & Workflow Specification Manual.
 *
 * Contains the exact texts, option lists, and counts that the enrollment forms must
 * match according to the Rules Document (Revised: June 15, 2026). Used by the
 * rules-compliance specs as the source of truth for validation.
 *
 * Related files:
 * - .temp/note_review_forms_enrollments.md (discrepancy report)
 * - e2e/results/rules-compliance-wording/acceptance-criteria-checklist.md (AC definitions)
 * - src/i18n/locales/en-US/translation.json (actual i18n values)
 */

// ═════════════════════════════════════════════════════════════════════════════
// Form 1 — General Information (Rules pg 62-64)
// ═════════════════════════════════════════════════════════════════════════════

export const FORM1_EXPECTED = {
  name: {
    firstLabel: 'First',
    lastLabel: 'Last',
  },
  companyName: {
    hint: 'Enter your name if you do not have a separate company name.',
  },
  phone: {
    label: 'Phone',
    hint: 'Enter your personal phone number if you do not have a separate company phone number.',
    typeDefault: 'Cell / Mobile',
    typeOptions: ['Cell / Mobile', 'Company', 'Home'],
  },
  email: {
    label: 'Company Email Address',
    hint: 'Enter your personal email address if you do not have a separate company email address.',
  },
  address: {
    hint: 'Enter your personal address if you do not have a separate company address.',
  },
  referral: {
    placeholder: 'How did you hear about WISE?',
  },
  /** Expected section order in DOM (top to bottom). */
  sectionOrder: [
    'name_section',
    'email_section',
    'company_name_section',
    'phone_section',
    'address_section',
    'referral_section',
  ],
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// Form 2 — Company & Profile Details (Rules pg 65-75)
// ═════════════════════════════════════════════════════════════════════════════

export const FORM2_EXPECTED = {
  position: {
    hint: 'Select your legal relationship to the Company.',
    optionCount: 5,
  },
  companyType: {
    hint: 'Select the type of entity under which the Company is registered and operating.',
    optionCount: 7, // 6 regular + Other (Other IS one of the 7)
  },
  website: {
    hint: 'Enter your Company website or social media sites so we can better serve you.',
    noWebsiteCheckbox: 'My Company does not have a Website or Social media account.',
    addButton: 'Additional company website or social media channel.',
  },
  industry: {
    hint: 'Select the main industry in which the Company operates.',
    optionCount: 46, // 45 + Other
  },
  companySize: {
    hint: 'Select the number of full-time employees working for the Company (Not including the Company owner).',
    optionCount: 9,
  },
  companyFounded: {
    hint: 'Enter the year the Company was founded.',
  },
  billingAddress: {
    sameAsCompany: 'Same as Company address',
  },
  shippingAddress: {
    sameAsCompany: 'Same as Company address', // Rules says "Company", code says "Company" via sameAsBilling key
  },
  alternatePhone: {
    required: true, // Rules says Required
    typeDefault: 'Cell / Mobile',
  },
  prosperityPlanner: {
    hint: 'Indicate your current shipping preferences for this membership benefit (preferences can be changed later):',
  },
  hcaBooklets: {
    note: '*Some items may not be available in all languages and regions.',
  },
  interests: {
    hint: 'Please indicate which topics you would like to learn more about.',
    optionCount: 8,
  },
  emailNewsletters: {
    hint: 'Please indicate which email newsletter(s) you would like to sign up for.',
    optionCount: 6,
  },
  personalAddress: {
    sameAsCompany: 'Same as Company Address',
  },
  profilePhoto: {
    hint: 'JPG or PNG, max 10 MB',
    description: 'Upload a picture of yourself for your Membership Profile and so WISE staff can recognize you at conferences and events! Note: Your images will not be shared or used without your express written consent.',
  },
  education: {
    optionCount: 9,
    someCollege: 'Some College or University', // Rules expects "or University"
  },
  preferredLanguage: {
    optionCount: 30, // Rules specifies exactly 30
    firstOption: 'English',
  },
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// Screen Messages (Rules pg 79-80)
// ═════════════════════════════════════════════════════════════════════════════

export const SCREENS_EXPECTED = {
  emailVerified: {
    title: 'Email Verified!',
    body: 'Thank you for verifying your email address.',
    cta: 'Continue to Membership Agreement',
  },
  agreementSigned: {
    title: 'WISE Membership Agreement Signed!',
    body: 'Thank you for signing your WISE Membership Agreement.',
    cta: 'Continue to Payment',
    /** This text should NOT exist on the screen. */
    forbiddenText: 'The next step is to complete your membership payment.',
  },
  paid: {
    title: 'Welcome to WISE!',
  },
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// Languages — 30 from Rules Document (pg 76)
// ═════════════════════════════════════════════════════════════════════════════

export const RULES_LANGUAGES = [
  'English',
  'Arabic',
  'Cantonese',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'Farsi',
  'Finnish',
  'French',
  'French Canadian',
  'German',
  'Greek',
  'Hebrew',
  'Hungarian',
  'Italian',
  'Japanese',
  'Kurdish',
  'Latvian',
  'Lithuanian',
  'Mandarin',
  'Portuguese',
  'Polish',
  'Romanian',
  'Russian',
  'Serbian',
  'Slovak',
  'Spanish',
  'Swedish',
  'Ukrainian',
] as const;

// ═════════════════════════════════════════════════════════════════════════════
// Countries — 95 from WISE Continents chart (Rules Appendix)
// ═════════════════════════════════════════════════════════════════════════════

export const RULES_COUNTRIES = [
  // USA (1) + Canada (1)
  'United States', 'Canada',
  // UK territory (3)
  'United Kingdom', 'Ireland', 'India',
  // Africa (12)
  'Egypt', 'Ghana', 'Guyana', 'Kenya', 'Namibia', 'Nigeria',
  'Rwanda', 'South Africa', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe',
  // ANZO (17)
  'Australia', 'Hong Kong', 'Indonesia', 'Japan', 'Malaysia', 'New Zealand',
  'Philippines', 'Singapore', 'Thailand', 'Vietnam', 'Taiwan',
  'Nepal', 'Pakistan', 'Qatar', 'Saudi Arabia', 'South Korea', 'United Arab Emirates',
  // Europe (42)
  'Albania', 'Austria', 'Belarus', 'Belgium', 'Bulgaria', 'Croatia',
  'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France',
  'Georgia', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Israel',
  'Italy', 'Kazakhstan', 'Kyrgyzstan', 'Latvia', 'Lebanon', 'Lithuania',
  'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Netherlands', 'Norway',
  'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'Uzbekistan',
  // LATAM (19)
  'Argentina', 'Aruba', 'Bolivia', 'Brazil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Dominican Republic', 'Ecuador', 'Guatemala',
  'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay',
  'Peru', 'Uruguay',
] as const;

/** Total countries expected in the dropdown. */
export const RULES_COUNTRIES_COUNT = 95;

// ═════════════════════════════════════════════════════════════════════════════
// Phone Type Options (Form 1 + Form 2 Additional Phone)
// ═════════════════════════════════════════════════════════════════════════════

export const PHONE_TYPE_OPTIONS = ['Cell / Mobile', 'Company', 'Home'] as const;
