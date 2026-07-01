/**
 * CRM Expected Data — Transforms session-snapshot.json into expected CRM field values.
 *
 * Uses the same resolvePicklist() and resolveMultiselect() functions as the
 * production handlers to compute what SHOULD be in Zoho CRM after enrollment.
 *
 * Related files:
 * - packages/apps/enrollment/shared/zoho-crm.ts (resolvers, field constants)
 * - e2e/fixtures/zoho-client.ts (API client for fetching actual CRM data)
 * - e2e/fixtures/crm-report.ts (report generator)
 */

import { resolve } from 'path';
import { readFileSync } from 'fs';

// ─── Session Snapshot Types ─────────────────────────────────────────────────

export interface SessionSnapshot {
  session: {
    id: string;
    createdAt: string;
    status: string;
  };
  lead: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    phoneCountry: string;
    phoneNumber: string;
    phoneFull: string;
    street: string;
    addressLine2: string;
    city: string;
    zip: string;
    countryISO3: string;
    countryName: string;
    stateISO: string;
    stateName: string;
    referralSource: string;
  };
  registration: {
    position: string;
    companyType: string;
    industry: string;
    companySize: string;
    companyWebsite: string;
    companyWebsites: string[];
    companyFounded: string;
    altPhoneCountry: string;
    altPhoneNumber: string;
    altPhoneFull: string;
    billingSameAsCompany: boolean;
    billingStreet: string | null;
    billingLine2: string | null;
    billingCity: string | null;
    billingZip: string | null;
    billingCountryISO3: string | null;
    billingCountryName: string | null;
    billingStateISO: string | null;
    billingStateName: string | null;
    shippingSameAsBilling: boolean;
    shippingStreet: string | null;
    shippingLine2: string | null;
    shippingCity: string | null;
    shippingZip: string | null;
    shippingCountryISO3: string | null;
    shippingCountryName: string | null;
    shippingStateISO: string | null;
    shippingStateName: string | null;
    prosperityPlanner: string;
    hcaBooklets: string;
    interests: string[];
    emailNewsletters: string[];
    personalStreet: string;
    personalLine2: string;
    personalCity: string;
    personalZip: string;
    personalCountryISO3: string;
    personalCountryName: string;
    personalStateISO: string;
    personalStateName: string;
    birthYear: string;
    education: string;
    preferredLanguageISO: string;
    preferredLanguageName: string;
    secondaryLanguageISO: string;
    secondaryLanguageName: string;
    profilePhoto?: {
      originalName: string;
      contentType: string;
    } | null;
  };
  stripe: {
    customerId: string;
    plan: string;
    interval: string;
  };
  metadata: {
    timestamp: string;
    testDataset: string;
  };
}

// ─── Picklist Maps (mirrored from shared/zoho-crm.ts) ──────────────────────

const PICKLIST_POSITION: Record<string, string> = {
  company_owner:      'Company Owner',
  company_partner:    'Company Partner (Partial Ownership)',
  company_officer:    'Company Officer',
  company_employee:   'Company Employee (No Ownership)',
  company_contractor: 'Company Contractor',
};

const PICKLIST_EDUCATION: Record<string, string> = {
  doctorate:              'Doctorate',
  professional_degree:    'Professional Degree',
  masters_degree:         "Master's Degree",
  bachelors_degree:       "Bachelor's Degree",
  associate_degree:       'Associate Degree',
  some_college:           'Some College',
  certification_training: 'Certification Training',
  high_school_ged:        'High School Diploma / GED',
};

const PICKLIST_INDUSTRY: Record<string, string> = {
  accounting_bookkeeping: 'Accounting/Bookkeeping',
  advertising_marketing: 'Advertising/Marketing',
  agriculture: 'Agriculture',
  architecture: 'Architecture',
  arts_entertainment: 'Arts/Entertainment',
  automotive_products_services: 'Automotive Products/Services',
  aviation: 'Aviation',
  banking_financial_services: 'Banking/Financial Services',
  construction_remodeling: 'Construction/Remodeling',
  chiropractic: 'Chiropractic',
  consulting: 'Consulting',
  dental_healthcare: 'Dental Healthcare',
  education: 'Education',
  fashion: 'Fashion',
  financial_investment_services: 'Financial/Investment Services',
  food_beverage: 'Food/Beverage',
  foundations_non_profit_services: 'Foundations/Non-Profit Services',
  graphic_design: 'Graphic Design',
  healthcare_wellness_products: 'Healthcare/Wellness Products',
  healthcare_provider: 'Healthcare Provider',
  home_services: 'Home Services',
  hospitality: 'Hospitality',
  hr_services: 'HR Services',
  insurance: 'Insurance',
  interior_design: 'Interior Design',
  it_services: 'IT Services',
  landscaping_exterior_design: 'Landscaping/Exterior Design',
  legal_services_attorney: 'Legal Services/Attorney',
  manufacturing: 'Manufacturing',
  online_publications: 'Online Publications',
  online_sales_marketing: 'Online Sales/Marketing',
  printing_services: 'Printing Services',
  privacy_security: 'Privacy/Security',
  publishing: 'Publishing',
  quality_management: 'Quality Management',
  real_estate: 'Real Estate',
  regulatory_compliance: 'Regulatory Compliance',
  restaurant_services: 'Restaurant/Restaurant Services',
  retail_sales: 'Retail Sales',
  retail_sales_services: 'Retail Sales Services',
  software_development: 'Software Development',
  software_services: 'Software Services',
  telephone_services: 'Telephone Services',
  utilities: 'Utilities',
  website_design_services: 'Website Design/Services',
  other: 'Other',
};

const PICKLIST_COMPANY_TYPE: Record<string, string> = {
  sole_proprietor: 'Sole Proprietor',
  llc: 'LLC',
  cooperative: 'Cooperative',
  incorporated: 'Incorporated',
  non_profit_charitable: 'Non-Profit (Charitable)',
  non_profit_non_charitable: 'Non-Profit (Non-Charitable)',
};

const PICKLIST_COMPANY_SIZE: Record<string, string> = {
  '0': '0 Employees',
  '1': '1 Employee',
  '2_4': '2-4 Employees',
  '5_9': '5-9 Employees',
  '10_19': '10-19 Employees',
  '20_49': '20-49 Employees',
  '50_99': '50-99 Employees',
  '100_500': '100-500 Employees',
  '500_plus': '500+ Employees',
};

const PICKLIST_ACCOUNT_TYPE: Record<string, string> = {
  sole_proprietor:          'Sole proprietorship',
  llc:                      'LLC',
  cooperative:              'Cooperative',
  incorporated:             'Incorporated',
  non_profit_charitable:    'Non-profit (charitable)',
  non_profit_non_charitable:'Non-profit (non-charitable)',
  other:                    'Other',
};

const PICKLIST_PROSPERITY_PLANNER: Record<string, string> = {
  on_request:   'Ship upon request',
  automatic:    'Ship automatically',
  do_not_ship:  'Do not ship',
};

const PICKLIST_HCA_BOOKLETS: Record<string, string> = {
  automatic:    'Ship automatically',
  on_request:   'Ship upon request',
  do_not_ship:  'Do not ship',
};

const MULTISELECT_INTERESTS: Record<string, string> = {
  mastertech_software:     'Business software solutions and services from Mastertech.',
  hca_printed:             'Publications available from HCA Press.',
  hca_online:              'Online materials and resources from the Hubbard College of Administration.',
  hca_degrees:             'Degree programs offered by the Hubbard College of Administration.',
  hca_publications:        'Publications available from HCA Press.',
  admin_knowhow:           'Guidance and resources on the Model of Admin Know-How Program.',
  wise_directory_listing:  'Listing my business or advertising in a WISE Business Directory.',
  wise_directory_consumer: 'Consumer access to a WISE Business Directory.',
  none:                    'None of the above.',
};

const MULTISELECT_EMAIL_NEWSLETTERS: Record<string, string> = {
  wise_wins:          'WISE Membership wins and successes',
  wise_news:          'WISE Membership news, announcements and events',
  church_events:      'Church-hosted or sponsored news, events and functions',
  hca_resources:      'Hubbard College of Administration resources, news and events',
  mastertech_updates: 'Mastertech Computer Products International, Inc. product and updates',
  none:               'None of the above.',
};

// ─── Resolver functions ─────────────────────────────────────────────────────

function resolvePicklist(field: string, value: string): string {
  const maps: Record<string, Record<string, string>> = {
    position: PICKLIST_POSITION,
    education: PICKLIST_EDUCATION,
    industry: PICKLIST_INDUSTRY,
    company_type: PICKLIST_COMPANY_TYPE,
    company_size: PICKLIST_COMPANY_SIZE,
    account_type: PICKLIST_ACCOUNT_TYPE,
    prosperity_planner: PICKLIST_PROSPERITY_PLANNER,
    hca_booklets: PICKLIST_HCA_BOOKLETS,
  };
  return maps[field]?.[value] ?? value;
}

function resolveMultiselect(field: 'interests' | 'email_newsletters', values: string[]): string[] {
  const maps: Record<string, Record<string, string>> = {
    interests: MULTISELECT_INTERESTS,
    email_newsletters: MULTISELECT_EMAIL_NEWSLETTERS,
  };
  const map = maps[field];
  if (!map) return [];
  return values.map(v => map[v]).filter(Boolean);
}

// ─── Expected Data Builders ─────────────────────────────────────────────────

export interface ExpectedField {
  field: string;        // Zoho API name
  expected: string;     // Expected value (from form data + resolver)
  category: string;     // Grouping: 'identity', 'address', 'company', 'personal', 'preferences', 'status'
  ac: string;           // Acceptance criteria ID
}

/**
 * Build expected Contact fields from session snapshot.
 */
export function buildExpectedContactFields(snapshot: SessionSnapshot): ExpectedField[] {
  const { lead, registration: reg, stripe } = snapshot;
  const fields: ExpectedField[] = [];

  // ── Identity ──
  fields.push({ field: 'First_Name', expected: lead.firstName, category: 'identity', ac: 'AC-CRM-V08' });
  fields.push({ field: 'Last_Name', expected: lead.lastName, category: 'identity', ac: 'AC-CRM-V09' });
  fields.push({ field: 'Email', expected: lead.email, category: 'identity', ac: 'AC-CRM-V10' });
  // Phone maps to Mobile (default type=mobile per ADJ-01). Company → Phone, Home → Home_Phone.
  fields.push({ field: 'Mobile', expected: lead.phoneFull, category: 'identity', ac: 'AC-CRM-V11' });

  // ── Company Billing Address ──
  fields.push({ field: 'Company_Billing_Address_Street_1', expected: lead.street, category: 'address', ac: 'AC-CRM-V12' });
  fields.push({ field: 'Company_Billing_Address_Street_2', expected: lead.addressLine2 || '', category: 'address', ac: 'AC-CRM-V12' });
  fields.push({ field: 'Company_Billing_Address_City', expected: lead.city, category: 'address', ac: 'AC-CRM-V12' });
  fields.push({ field: 'Company_Billing_Address_State', expected: lead.stateName, category: 'address', ac: 'AC-CRM-V12' });
  fields.push({ field: 'Company_Billing_Address_Country', expected: lead.countryName, category: 'address', ac: 'AC-CRM-V12' });
  fields.push({ field: 'Company_Billing_Zip', expected: lead.zip, category: 'address', ac: 'AC-CRM-V12' });

  // ── Company Shipping Address ──
  const shippingSameAsBilling = reg.shippingSameAsBilling;
  const useBilling = reg.billingSameAsCompany;
  const shipStreet = shippingSameAsBilling
    ? (useBilling ? lead.street : (reg.billingStreet ?? lead.street))
    : (reg.shippingStreet ?? '');
  const shipLine2 = shippingSameAsBilling
    ? (useBilling ? lead.addressLine2 : (reg.billingLine2 ?? lead.addressLine2))
    : (reg.shippingLine2 ?? '');
  const shipCity = shippingSameAsBilling
    ? (useBilling ? lead.city : (reg.billingCity ?? lead.city))
    : (reg.shippingCity ?? '');
  const shipState = shippingSameAsBilling
    ? (useBilling ? lead.stateName : (reg.billingStateName ?? lead.stateName))
    : (reg.shippingStateName ?? '');
  const shipCountry = shippingSameAsBilling
    ? (useBilling ? lead.countryName : (reg.billingCountryName ?? lead.countryName))
    : (reg.shippingCountryName ?? '');
  const shipZip = shippingSameAsBilling
    ? (useBilling ? lead.zip : (reg.billingZip ?? lead.zip))
    : (reg.shippingZip ?? '');

  fields.push({ field: 'Company_Shipping_Address_Street_1', expected: shipStreet, category: 'address', ac: 'AC-CRM-V13' });
  fields.push({ field: 'Company_Shipping_Address_Street_2', expected: shipLine2, category: 'address', ac: 'AC-CRM-V13' });
  fields.push({ field: 'Company_Shipping_Address_City', expected: shipCity, category: 'address', ac: 'AC-CRM-V13' });
  fields.push({ field: 'Company_Shipping_Address_State', expected: shipState, category: 'address', ac: 'AC-CRM-V13' });
  fields.push({ field: 'Company_Shipping_Address_Country', expected: shipCountry, category: 'address', ac: 'AC-CRM-V13' });
  fields.push({ field: 'Company_Shipping_Zip', expected: shipZip, category: 'address', ac: 'AC-CRM-V13' });

  // ── Company Details ──
  fields.push({ field: 'Position_Form', expected: resolvePicklist('position', reg.position), category: 'company', ac: 'AC-CRM-V14' });
  fields.push({ field: 'Industry', expected: resolvePicklist('industry', reg.industry), category: 'company', ac: 'AC-CRM-V15' });
  fields.push({ field: 'Company_Type', expected: resolvePicklist('company_type', reg.companyType), category: 'company', ac: 'AC-CRM-V16' });
  fields.push({ field: 'Company_Size', expected: resolvePicklist('company_size', reg.companySize), category: 'company', ac: 'AC-CRM-V17' });
  fields.push({ field: 'Company_Website', expected: reg.companyWebsite || (reg.companyWebsites?.[0] ?? ''), category: 'company', ac: 'AC-CRM-V18' });
  fields.push({ field: 'Company_Founded_year', expected: reg.companyFounded, category: 'company', ac: 'AC-CRM-V19' });
  fields.push({ field: 'Alternate_Phone', expected: reg.altPhoneFull || '', category: 'company', ac: 'AC-CRM-V20' });

  // ── Personal Address ──
  fields.push({ field: 'Home_Address_Street_1', expected: reg.personalStreet || '', category: 'personal', ac: 'AC-CRM-V21' });
  fields.push({ field: 'Home_Address_Street_2', expected: reg.personalLine2 || '', category: 'personal', ac: 'AC-CRM-V21' });
  fields.push({ field: 'Home_City', expected: reg.personalCity || '', category: 'personal', ac: 'AC-CRM-V21' });
  fields.push({ field: 'Home_State', expected: reg.personalStateName || '', category: 'personal', ac: 'AC-CRM-V21' });
  fields.push({ field: 'Home_Postal_Code', expected: reg.personalZip || '', category: 'personal', ac: 'AC-CRM-V21' });

  // ── Personal Profile ──
  fields.push({ field: 'Education_Level_Form', expected: resolvePicklist('education', reg.education), category: 'personal', ac: 'AC-CRM-V22' });
  fields.push({ field: 'Preferred_Language_Form', expected: reg.preferredLanguageName, category: 'personal', ac: 'AC-CRM-V23' });
  fields.push({ field: 'Second_Language_Form', expected: reg.secondaryLanguageName || '', category: 'personal', ac: 'AC-CRM-V24' });

  // ── Preferences ──
  fields.push({ field: 'Prosperity_Planner_Preference', expected: resolvePicklist('prosperity_planner', reg.prosperityPlanner), category: 'preferences', ac: 'AC-CRM-V25' });
  fields.push({ field: 'HCA_Booklets_Preference', expected: resolvePicklist('hca_booklets', reg.hcaBooklets), category: 'preferences', ac: 'AC-CRM-V26' });

  const resolvedInterests = resolveMultiselect('interests', reg.interests);
  fields.push({ field: 'I_am_interested_in_learning_about', expected: resolvedInterests.join(','), category: 'preferences', ac: 'AC-CRM-V27' });

  const resolvedNewsletters = resolveMultiselect('email_newsletters', reg.emailNewsletters);
  fields.push({ field: 'Please_email_me_about', expected: resolvedNewsletters.join(','), category: 'preferences', ac: 'AC-CRM-V28' });

  // ── Status & Stripe ──
  // If stripe.customerId is empty in snapshot, we still validate it's not null in CRM
  // by using a special marker that the compareFields function will handle
  fields.push({ field: 'Stripe_ID', expected: stripe.customerId || '__NOT_EMPTY__', category: 'status', ac: 'AC-CRM-V29' });
  fields.push({ field: 'Email_Verified', expected: 'true', category: 'status', ac: 'AC-CRM-V31' });
  fields.push({ field: 'Status', expected: 'Signed Agreement', category: 'status', ac: 'AC-CRM-V32' });

  return fields;
}

/**
 * Build expected Account fields from session snapshot.
 */
export function buildExpectedAccountFields(snapshot: SessionSnapshot): ExpectedField[] {
  const { lead, registration: reg, session } = snapshot;
  const fields: ExpectedField[] = [];

  // ── Core identity ──
  fields.push({ field: 'Account_Name', expected: lead.companyName, category: 'identity', ac: 'AC-CRM-V33' });
  fields.push({ field: 'Account_Type', expected: resolvePicklist('account_type', reg.companyType), category: 'company', ac: 'AC-CRM-V34' });
  fields.push({ field: 'Industry', expected: resolvePicklist('industry', reg.industry), category: 'company', ac: 'AC-CRM-V35' });
  fields.push({ field: 'Company_Size', expected: resolvePicklist('company_size', reg.companySize), category: 'company', ac: 'AC-CRM-V36' });
  fields.push({ field: 'Phone', expected: lead.phoneFull, category: 'identity', ac: 'AC-CRM-V37' });
  fields.push({ field: 'Company_Website1', expected: reg.companyWebsite || (reg.companyWebsites?.[0] ?? ''), category: 'company', ac: 'AC-CRM-V38' });
  // Additional websites (SM1..SM4)
  if (reg.companyWebsites && reg.companyWebsites.length > 1) {
    fields.push({ field: 'Company_Website_Social_Media1', expected: reg.companyWebsites[1] ?? '', category: 'company', ac: 'AC-FIX01-02' });
  }
  if (reg.companyWebsites && reg.companyWebsites.length > 2) {
    fields.push({ field: 'Company_Website_Social_Media2', expected: reg.companyWebsites[2] ?? '', category: 'company', ac: 'AC-FIX01-03' });
  }
  if (reg.companyWebsites && reg.companyWebsites.length > 3) {
    fields.push({ field: 'Company_Website_Social_Media3', expected: reg.companyWebsites[3] ?? '', category: 'company', ac: 'AC-FIX01-04' });
  }
  if (reg.companyWebsites && reg.companyWebsites.length > 4) {
    fields.push({ field: 'Company_Website_Social_Media4', expected: reg.companyWebsites[4] ?? '', category: 'company', ac: 'AC-FIX01-05' });
  }
  fields.push({ field: 'Company_Ownership', expected: resolvePicklist('position', reg.position), category: 'company', ac: 'AC-CRM-V39' });
  fields.push({ field: 'Company_Founded_year', expected: reg.companyFounded, category: 'company', ac: 'AC-CRM-V40' });

  // ── Billing Address ──
  fields.push({ field: 'Street_Address', expected: lead.street, category: 'address', ac: 'AC-CRM-V41' });
  fields.push({ field: 'Billing_Street_2', expected: lead.addressLine2 || '', category: 'address', ac: 'AC-CRM-V41' });
  fields.push({ field: 'City', expected: lead.city, category: 'address', ac: 'AC-CRM-V41' });
  fields.push({ field: 'State', expected: lead.stateName, category: 'address', ac: 'AC-CRM-V41' });
  fields.push({ field: 'Billing_Country1', expected: lead.countryName.toUpperCase(), category: 'address', ac: 'AC-CRM-V41' });
  fields.push({ field: 'Postal_Code', expected: lead.zip, category: 'address', ac: 'AC-CRM-V41' });

  // ── Shipping Address (same logic as Contact) ──
  const shippingSameAsBilling = reg.shippingSameAsBilling;
  const useBilling = reg.billingSameAsCompany === false;
  const shipStreet = shippingSameAsBilling
    ? (useBilling ? (reg.billingStreet ?? '') : lead.street)
    : (reg.shippingStreet ?? '');
  const shipCity = shippingSameAsBilling
    ? (useBilling ? (reg.billingCity ?? '') : lead.city)
    : (reg.shippingCity ?? '');
  const shipState = shippingSameAsBilling
    ? (useBilling ? (reg.billingStateName ?? '') : lead.stateName)
    : (reg.shippingStateName ?? '');
  const shipCountry = shippingSameAsBilling
    ? (useBilling ? (reg.billingCountryName ?? '') : lead.countryName)
    : (reg.shippingCountryName ?? '');
  const shipZip = shippingSameAsBilling
    ? (useBilling ? (reg.billingZip ?? '') : lead.zip)
    : (reg.shippingZip ?? '');

  fields.push({ field: 'Company_Shipping_Address_Street_1', expected: shipStreet, category: 'address', ac: 'AC-CRM-V42' });
  fields.push({ field: 'Company_Shipping_Address_City', expected: shipCity, category: 'address', ac: 'AC-CRM-V42' });
  fields.push({ field: 'Company_Shipping_Address_State', expected: shipState, category: 'address', ac: 'AC-CRM-V42' });
  fields.push({ field: 'Company_Shipping_Address_Country', expected: shipCountry.toUpperCase(), category: 'address', ac: 'AC-CRM-V42' });
  fields.push({ field: 'Company_Shipping_ZIP_Code', expected: shipZip, category: 'address', ac: 'AC-CRM-V42' });

  // ── Preferences ──
  fields.push({ field: 'Prosperity_Planner_Preference', expected: resolvePicklist('prosperity_planner', reg.prosperityPlanner), category: 'preferences', ac: 'AC-CRM-V43' });
  fields.push({ field: 'HCA_Booklets_Preference', expected: resolvePicklist('hca_booklets', reg.hcaBooklets), category: 'preferences', ac: 'AC-CRM-V44' });

  // ── Status ──
  fields.push({ field: 'Status', expected: 'Active: Valid Payment Method', category: 'status', ac: 'AC-CRM-V45' });

  // ── Membership Number ──
  fields.push({ field: 'Membership_Number', expected: '__NOT_EMPTY__', category: 'membership', ac: 'AC-MN-01' });

  // ── Membership Number ──
  fields.push({ field: 'Membership_Number', expected: '__NOT_EMPTY__', category: 'membership', ac: 'AC-MN-01' });

  return fields;
}

// ─── Snapshot Reader ────────────────────────────────────────────────────────

/**
 * Read and validate the session-snapshot.json file.
 * Throws descriptive error if file is missing or incomplete.
 */
export function readSessionSnapshot(): SessionSnapshot {
  const snapshotPath = resolve(process.cwd(), '.temp/session-snapshot.json');

  let content: string;
  try {
    content = readFileSync(snapshotPath, 'utf-8');
  } catch {
    throw new Error(
      `Session snapshot not found at ${snapshotPath}. ` +
      'Run enrollment flow first: CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4',
    );
  }

  const snapshot: SessionSnapshot = JSON.parse(content);

  // Validate required layers
  const errors: string[] = [];

  if (!snapshot.session?.createdAt) errors.push('session.createdAt is missing');
  if (!snapshot.lead?.email) errors.push('lead.email is missing');
  if (!snapshot.lead?.firstName) errors.push('lead.firstName is missing');
  if (!snapshot.lead?.lastName) errors.push('lead.lastName is missing');
  if (!snapshot.lead?.companyName) errors.push('lead.companyName is missing');
  if (!snapshot.lead?.phoneFull) errors.push('lead.phoneFull is missing');
  if (!snapshot.lead?.countryName) errors.push('lead.countryName is missing');
  if (!snapshot.lead?.stateName) errors.push('lead.stateName is missing');
  if (!snapshot.registration?.position) errors.push('registration.position is missing');
  if (!snapshot.registration?.companyType) errors.push('registration.companyType is missing');
  if (!snapshot.registration?.industry) errors.push('registration.industry is missing');
  if (!snapshot.registration?.education) errors.push('registration.education is missing');
  if (!snapshot.registration?.preferredLanguageName) errors.push('registration.preferredLanguageName is missing');

  if (errors.length > 0) {
    throw new Error(
      `Session snapshot is incomplete. Missing fields:\n  - ${errors.join('\n  - ')}\n\n` +
      'Ensure the enrollment flow exports the full session data.',
    );
  }

  return snapshot;
}
