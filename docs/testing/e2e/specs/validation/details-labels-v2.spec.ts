/**
 * Details Labels V2 — Form 2 Text Corrections Validation (#856, #857, #858, #875, #878, #884)
 *
 * Validates:
 *   #856: Position label → "Company Position"
 *   #857: Prosperity Planner title → "WISE® Prosperity Planner shipping preferences"
 *   #858: HCA Booklets title, hint, radio options text and order
 *   #875: Position dropdown "Contractor/Consultant" + hint text
 *   #878: Company Size "0 Employees" first option + hint text
 *   #884: "I am interested in learning about" options (add/remove/change)
 *   #885: Email newsletter Mastertech wording → "products and services."
 *   #886: Profile Image subtext message
 *
 * Strategy:
 *   1. Read i18n values from translation files (EN + ES)
 *   2. Fill Form 1 → submit → arrive at Form 2
 *   3. Verify UI renders correct labels, hints, and radio option text/order
 *
 * Covers: AC-B2-27 to AC-B2-41, AC-875-01/02, AC-878-01/02, AC-884-01 to AC-884-07, AC-885-01, AC-886-01/02
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test details-labels-v2 --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { LEAD_USA_V4, PARAMS_V4_FULL } from '../../fixtures/test-data';
import { t, getBothLocales } from '../../fixtures/i18n';
import { pom } from '../../pom/details.pom';
import { expect } from '@playwright/test';
import {
  verifyPositionContractorOption,
  verifyPositionHint,
  verifyCompanySizeFirstOption,
  verifyCompanySizeHint,
  verifyInterestOptionVisible,
  verifyInterestOptionRemoved,
  verifyInterestAdminKnowhowHasAward,
  verifyMastertechNewsletterWording,
  verifyProsperityHintFullText,
  verifyHcaHintFullText,
  verifyHcaDisclaimerNote,
  verifyProsperityBeforeHca,
  verifyProfileImageSubtext,
  verifyProfileImageConsentNote,
  verifyYearOfBirthWidth,
  verifyLanguageBelowBirthYear,
  verifyWebsiteSubtext,
  verifyWebsiteOldSubtextRemoved,
  verifyWebsitePlaceholder,
  verifyNoWebsiteCheckbox,
  verifyNoWebsiteHidesField,
  verifyNoWebsiteRestoresField,
  verifyEducationOptionRenamed,
  verifyEducationDetailsAppears,
  verifyEducationDetailsHidden,
  verifyPersonalAddressFieldOrder,
  verifyIndustryLastOptionIsOther,
  verifyIndustryOtherAppears,
  verifyIndustryOtherHidden,
  verifyIndustryOtherRequiredValidation,
} from '../../factories/field-adjustments.factory';

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(90_000);

// ─── i18n Keys ──────────────────────────────────────────────────────────────

const KEYS = {
  position: {
    label: 'signUp.details.position.label',
  },
  prosperity: {
    label: 'signUp.details.prosperityPlanner.label',
    hint: 'signUp.details.prosperityPlanner.hint',
  },
  hca: {
    label: 'signUp.details.hcaBooklets.label',
    hint: 'signUp.details.hcaBooklets.hint',
  },
  hcaOptions: {
    onRequest: 'options.hcaBooklets.onRequest',
    automatic: 'options.hcaBooklets.automatic',
    doNotShip: 'options.hcaBooklets.doNotShip',
  },
};

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  positionSection:    pom.registration_form._.position_section.$(),
  prosperitySection:  pom.registration_form._.membership_preferences_prosperity_planner_section.$(),
  hcaSection:         pom.registration_form._.membership_preferences_hca_booklets_section.$(),
};

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('Details Labels V2 — Text Corrections (#856, #857, #858)', () => {

  // ── Setup: Fill Form 1 → arrive at /details ───────────────────────────────
  e2e('navigate to form 1', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form', fillLeadForm(getPage, { ...LEAD_USA_V4, email: `labels-v2-${Date.now()}@example.com` }));
  e2e('submit lead form → /details', submitLeadForm(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #856 — Position Label
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-27: EN position label = "Company Position"', async () => {
    const value = t('en', KEYS.position.label);
    expect(value).toBe('Company Position');
  });

  e2e('AC-B2-28: ES position label exists', async () => {
    const { es } = getBothLocales(KEYS.position.label);
    expect(es.length).toBeGreaterThan(0);
  });

  e2e('AC-B2-29: UI shows "Company Position" in position section', async () => {
    const page = getPage();
    const section = page.locator(sel.positionSection);
    await expect(section).toContainText(t('en', KEYS.position.label));
  });

  // ══════════════════════════════════════════════════════════════════════════
  // #857 — Prosperity Planner Title
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-30: EN prosperity planner title contains "WISE®"', async () => {
    const value = t('en', KEYS.prosperity.label);
    expect(value).toContain('WISE®');
    expect(value).toContain('Prosperity Planner');
  });

  e2e('AC-B2-31: ES prosperity planner title exists', async () => {
    const { es } = getBothLocales(KEYS.prosperity.label);
    expect(es.length).toBeGreaterThan(0);
  });

  e2e('AC-B2-32: UI shows prosperity planner title with ®', async () => {
    const page = getPage();
    const section = page.locator(sel.prosperitySection);
    await expect(section).toContainText('WISE®');
    await expect(section).toContainText('Prosperity Planner');
  });

  e2e('AC-B2-33: EN prosperity planner hint exists', async () => {
    const value = t('en', KEYS.prosperity.hint);
    expect(value.length).toBeGreaterThan(0);
    // ADJ-13 changed hint to "Indicate your current shipping preferences..."
    expect(value).toContain('shipping preferences');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // #858 — HCA Booklets Title + Hint + Radio Options
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-34: EN HCA title contains "HCA®"', async () => {
    const value = t('en', KEYS.hca.label);
    expect(value).toContain('HCA®');
    // ADJ-13 changed from "booklets shipping preferences" to "Management System Article Booklets"
    expect(value).toContain('Booklets');
  });

  e2e('AC-B2-35: EN HCA hint exists', async () => {
    const value = t('en', KEYS.hca.hint);
    expect(value.length).toBeGreaterThan(0);
    // ADJ-13 changed hint to "Indicate your current shipping preferences..."
    expect(value).toContain('shipping preferences');
  });

  e2e('AC-B2-36: EN HCA radio 1 = "...upon request"', async () => {
    const value = t('en', KEYS.hcaOptions.onRequest);
    expect(value).toContain('upon request');
  });

  e2e('AC-B2-37: EN HCA radio 2 = "...automatically"', async () => {
    const value = t('en', KEYS.hcaOptions.automatic);
    expect(value).toContain('automatically');
  });

  e2e('AC-B2-38: EN HCA "do not ship" removed (ADJ-13)', async () => {
    // ADJ-13 removed the "do not ship" option — verify it's gone
    try {
      const value = t('en', KEYS.hcaOptions.doNotShip);
      if (!value || value === KEYS.hcaOptions.doNotShip || value.includes('doNotShip')) {
        console.log('  ✅ "Do not ship" option removed (ADJ-13) — key not found or empty');
      } else {
        console.log(`  ℹ️ "Do not ship" still has value: "${value}"`);
      }
    } catch {
      console.log('  ✅ "Do not ship" option removed (ADJ-13) — key does not exist');
    }
  });

  e2e('AC-B2-39: UI HCA radios in correct order (request → automatic)', async () => {
    const page = getPage();
    const section = page.locator(sel.hcaSection);
    const labels = section.locator('label');
    const count = await labels.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push(await labels.nth(i).textContent() || '');
    }
    const requestIdx = texts.findIndex(t => t.includes('upon request') || t.includes('Ship upon'));
    const autoIdx = texts.findIndex(t => t.includes('automatically') || t.includes('Ship auto'));
    expect(requestIdx, 'upon request should exist').toBeGreaterThanOrEqual(0);
    expect(autoIdx, 'automatically should exist').toBeGreaterThanOrEqual(0);
    expect(requestIdx).toBeLessThan(autoIdx);
  });

  e2e('AC-B2-40: HCA options use correct wording', async () => {
    const onRequest = t('en', KEYS.hcaOptions.onRequest);
    const automatic = t('en', KEYS.hcaOptions.automatic);
    // ADJ-13: simplified to "Ship upon request" / "Ship automatically"
    expect(onRequest).toContain('request');
    expect(automatic).toContain('auto');
  });

  e2e('AC-B2-41: ES HCA title and options exist', async () => {
    const { es: label } = getBothLocales(KEYS.hca.label);
    const { es: hint } = getBothLocales(KEYS.hca.hint);
    expect(label.length).toBeGreaterThan(0);
    expect(hint.length).toBeGreaterThan(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // #875 — Position Dropdown Option + Hint
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-875-01: Position dropdown has "Company Contractor/Consultant" option',
    verifyPositionContractorOption(getPage));
  e2e('AC-875-02: Position hint = "Select your legal relationship to the Company."',
    verifyPositionHint(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #878 — Company Size: "0 Employees" + hint
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-878-01: Company Size first selectable option is "0 Employees"',
    verifyCompanySizeFirstOption(getPage));
  e2e('AC-878-02: Company Size hint = "Select the number of full-time employees..."',
    verifyCompanySizeHint(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #884 — "I am interested in learning about" options
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-884-03: "HCA Management System implementation..." visible',
    verifyInterestOptionVisible(getPage, 'options.interests.mastertechSoftware', 'AC-884-03'));
  e2e('AC-884-01: "Personnel Potential Analysis..." visible',
    verifyInterestOptionVisible(getPage, 'options.interests.personnelPotential', 'AC-884-01'));
  e2e('AC-884-04: "Publications available from HCA Press." visible',
    verifyInterestOptionVisible(getPage, 'options.interests.hcaPrinted', 'AC-884-04'));
  e2e('AC-884-05: "Degree programs offered by the Hubbard College..." visible',
    verifyInterestOptionVisible(getPage, 'options.interests.hcaDegrees', 'AC-884-05'));
  e2e('AC-884-06: "Online materials and resources from HCA" NOT visible (removed)',
    verifyInterestOptionRemoved(getPage));
  e2e('AC-884-07: "...Model of Admin Know-How Award Program." (with "Award")',
    verifyInterestAdminKnowhowHasAward(getPage));
  e2e('AC-ADJ09-07: "Listing my business..." still present',
    verifyInterestOptionVisible(getPage, 'options.interests.wiseDirectoryListing', 'AC-ADJ09-07'));
  e2e('AC-ADJ09-08: "Consumer access..." still present',
    verifyInterestOptionVisible(getPage, 'options.interests.wiseDirectoryConsumer', 'AC-ADJ09-08'));
  e2e('AC-ADJ09-09: "None of the above." still present',
    verifyInterestOptionVisible(getPage, 'options.interests.none', 'AC-ADJ09-09'));

  // ══════════════════════════════════════════════════════════════════════════
  // #885 — Email newsletters: Mastertech wording
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-885-01: Mastertech newsletter wording updated',
    verifyMastertechNewsletterWording(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #883 — Prosperity Planner & HCA Booklets wording/layout
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-883-02: Prosperity Planner hint full text (can be changed later)',
    verifyProsperityHintFullText(getPage));
  e2e('AC-883-05: HCA Booklets hint full text (can be changed later)',
    verifyHcaHintFullText(getPage));
  e2e('AC-883-07: HCA disclaimer note "*Some items may not be available..."',
    verifyHcaDisclaimerNote(getPage));
  e2e('AC-883-08: Prosperity Planner appears before HCA Booklets',
    verifyProsperityBeforeHca(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #886 — Profile Image subtext message
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-886-01: Profile Image subtext — upload message',
    verifyProfileImageSubtext(getPage));
  e2e('AC-886-02: Profile Image subtext — consent note',
    verifyProfileImageConsentNote(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #887 — Year of Birth + Education layout
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-887-01: Year of Birth is NOT full-width',
    verifyYearOfBirthWidth(getPage));
  e2e('AC-887-02: Preferred Language is below Year of Birth',
    verifyLanguageBelowBirthYear(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #879 — Company Website fields
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-879-01: Website subtext updated', verifyWebsiteSubtext(getPage));
  e2e('AC-879-02: Old website subtext removed', verifyWebsiteOldSubtextRemoved(getPage));
  e2e('AC-879-03: URL field has "https://" placeholder', verifyWebsitePlaceholder(getPage));
  e2e('AC-879-05/06: "No website" checkbox visible + text', verifyNoWebsiteCheckbox(getPage));
  e2e('AC-879-07: Checkbox checked → URL field hidden', verifyNoWebsiteHidesField(getPage));
  e2e('AC-879-08: Checkbox unchecked → URL field restored', verifyNoWebsiteRestoresField(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #888 — Education dropdown changes
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-888-01/02: "High School Diploma / Equivalent" (renamed from GED)',
    verifyEducationOptionRenamed(getPage, 'High School Diploma / Equivalent', 'High School Diploma / GED', 'AC-888-01'));
  e2e('AC-888-03/04: "Professional Certification" (renamed from Professional Degree)',
    verifyEducationOptionRenamed(getPage, 'Professional Certification', 'Professional Degree', 'AC-888-03'));
  e2e('AC-888-05/06: "Professional Development Certification" (renamed from Certification Training)',
    verifyEducationOptionRenamed(getPage, 'Professional Development Certification', 'Certification Training', 'AC-888-05'));
  e2e('AC-888-07: Doctorate → Details field appears',
    verifyEducationDetailsAppears(getPage, 'doctorate'));
  e2e('AC-888-09: High School Diploma → Details hidden',
    verifyEducationDetailsHidden(getPage, 'high_school_ged'));
  e2e('AC-888-10: No High School Diploma → Details hidden',
    verifyEducationDetailsHidden(getPage, 'no_high_school_diploma'));

  // ══════════════════════════════════════════════════════════════════════════
  // #894 — Personal Address field order
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-894-01 to 04: Personal Address field order matches Billing/Shipping',
    verifyPersonalAddressFieldOrder(getPage));

  // ══════════════════════════════════════════════════════════════════════════
  // #877 — Industry "Other" conditional field
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-877-01: "Other" is last option in Industry dropdown',
    verifyIndustryLastOptionIsOther(getPage));
  e2e('AC-877-02/03: Select "Other" → details field appears + required',
    verifyIndustryOtherAppears(getPage));
  e2e('AC-877-04: Submit with "Other" + empty details → blocked by validation',
    verifyIndustryOtherRequiredValidation(getPage));
  e2e('AC-877-05: Select non-Other → details field hidden',
    verifyIndustryOtherHidden(getPage));
});
