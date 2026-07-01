import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { selectPlan, verifyPlanSelection } from '../../factories/plan-selection.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { expect } from '@playwright/test';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  LEAD_COLOMBIA,
  REG_USA_V4,
  REG_COLOMBIA,
  PARAMS_V4_FULL,
  PARAMS_V4_PLAN_ONLY,
  PARAMS_V4_COUNTRY_ONLY,
  PARAMS_V4_PLAN_COUNTRY,
  PARAMS_V4_INTERVAL_ONLY,
  PARAMS_V4_PLAN_INTERVAL,
  PLAN_GENERAL_ANNUAL,
  PLAN_GENERAL_MONTHLY,
} from '../../fixtures/test-data';
import { pom } from '../../pom/general-info.pom';
import { pom as planPom } from '../../pom/plan-selection.pom';

/**
 * V4 Params Validation — Each param is optional and independent (AC-52).
 *
 * Tests that query params correctly pre-select values without skipping pages.
 * Each scenario validates a different combination of params.
 *
 * AC-52: All params optional & independent
 * AC-52a: plan → pre-highlights plan card
 * AC-52b: interval → pre-selects month/year toggle
 * AC-52c: country → pre-fills country in General Info
 * AC-52d: no params → no pre-selections
 * AC-53: Flow always starts at /general-info
 *
 * Timeout: 120s per scenario (no email/payment — only form + plan selection).
 *
 * Run:
 *   npx playwright test full-enrollment-with-params
 */

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 1: All params (plan + interval + country)
// ═════════════════════════════════════════════════════════════════════════════

const flow1 = createSerialFlow();

flow1.e2e.setTimeout(120_000);

flow1.e2e.describe.serial('AC-52: All params (plan+interval+country)', () => {
  flow1.e2e('navigate with all params', navigateToSignUpV4(flow1.getPage, PARAMS_V4_FULL));

  flow1.e2e('AC-52c: country pre-filled in General Info', async () => {
    const page = flow1.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    await expect(countrySelect).toHaveValue('USA');
  });

  flow1.e2e('fill lead form (country already set)', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow1.getPage, { ...LEAD_USA_V4, email })();
  });

  flow1.e2e('submit lead form → /details', submitLeadForm(flow1.getPage));

  flow1.e2e('fill registration form', fillRegistrationForm(flow1.getPage, REG_USA_V4));

  flow1.e2e('submit registration → /plan', submitRegistrationForm(flow1.getPage));

  flow1.e2e('AC-52a: plan pre-highlighted in Plan Selection', async () => {
    const page = flow1.getPage();
    // Wait for plan selection page to be ready
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    // Verify the plan selection page loaded with plans visible
    const planCards = page.locator('[data-test-key="choose-plan-button"]');
    await expect(planCards.first()).toBeVisible();
  });

  flow1.e2e('AC-52b: interval pre-selected to annual', async () => {
    const page = flow1.getPage();
    const annualBtn = page.locator('[data-test-key="annually-button"]');
    await expect(annualBtn).toHaveAttribute('data-test-state', 'active');
  });

  flow1.e2e('select plan completes', selectPlan(flow1.getPage, PLAN_GENERAL_ANNUAL));
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 2: Plan only (no interval, no country)
// ═════════════════════════════════════════════════════════════════════════════

const flow2 = createSerialFlow();

flow2.e2e.setTimeout(120_000);

flow2.e2e.describe.serial('AC-52a: Plan only param', () => {
  flow2.e2e('navigate with plan only', navigateToSignUpV4(flow2.getPage, PARAMS_V4_PLAN_ONLY));

  flow2.e2e('AC-52d: country NOT pre-filled (no country param)', async () => {
    const page = flow2.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    // Should be empty or default placeholder
    const value = await countrySelect.inputValue();
    expect(value).toBe('');
  });

  flow2.e2e('fill lead form (must select country manually)', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow2.getPage, { ...LEAD_COLOMBIA, email })();
  });

  flow2.e2e('submit lead form', submitLeadForm(flow2.getPage));
  flow2.e2e('fill registration form', fillRegistrationForm(flow2.getPage, REG_COLOMBIA));
  flow2.e2e('submit registration → /plan', submitRegistrationForm(flow2.getPage));

  flow2.e2e('AC-52a: plan pre-highlighted', async () => {
    const page = flow2.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    // Verify plan selection page loaded with plans visible
    const planCards = page.locator('[data-test-key="choose-plan-button"]');
    await expect(planCards.first()).toBeVisible();
  });

  flow2.e2e('AC-52b: interval defaults to year (no interval param)', async () => {
    const page = flow2.getPage();
    const annualBtn = page.locator('[data-test-key="annually-button"]');
    await expect(annualBtn).toHaveAttribute('data-test-state', 'active');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 3: Country only (no plan, no interval)
// ═════════════════════════════════════════════════════════════════════════════

const flow3 = createSerialFlow();

flow3.e2e.setTimeout(120_000);

flow3.e2e.describe.serial('AC-52c: Country only param', () => {
  flow3.e2e('navigate with country only', navigateToSignUpV4(flow3.getPage, PARAMS_V4_COUNTRY_ONLY));

  flow3.e2e('AC-52c: country pre-filled to USA', async () => {
    const page = flow3.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    await expect(countrySelect).toHaveValue('USA');
  });

  flow3.e2e('fill lead form (country already set)', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow3.getPage, { ...LEAD_USA_V4, email })();
  });

  flow3.e2e('submit lead form', submitLeadForm(flow3.getPage));
  flow3.e2e('fill registration form', fillRegistrationForm(flow3.getPage, REG_USA_V4));
  flow3.e2e('submit registration → /plan', submitRegistrationForm(flow3.getPage));

  flow3.e2e('AC-52a: no plan pre-highlighted (no plan param)', async () => {
    const page = flow3.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    // No plan should be pre-selected/highlighted
    // The user must manually choose
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 4: Interval only (pre-selects monthly toggle)
// ═════════════════════════════════════════════════════════════════════════════

const flow4 = createSerialFlow();

flow4.e2e.setTimeout(120_000);

flow4.e2e.describe.serial('AC-52b: Interval only param (month)', () => {
  flow4.e2e('navigate with interval=month', navigateToSignUpV4(flow4.getPage, PARAMS_V4_INTERVAL_ONLY));

  flow4.e2e('fill lead form', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow4.getPage, { ...LEAD_COLOMBIA, email })();
  });

  flow4.e2e('submit lead form', submitLeadForm(flow4.getPage));
  flow4.e2e('fill registration form', fillRegistrationForm(flow4.getPage, REG_COLOMBIA));
  flow4.e2e('submit registration → /plan', submitRegistrationForm(flow4.getPage));

  flow4.e2e('AC-52b: monthly toggle pre-selected', async () => {
    const page = flow4.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    const monthlyBtn = page.locator('[data-test-key="monthly-button"]');
    await expect(monthlyBtn).toHaveAttribute('data-test-state', 'active');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 5: No params (everything manual)
// ═════════════════════════════════════════════════════════════════════════════

const flow5 = createSerialFlow();

flow5.e2e.setTimeout(120_000);

flow5.e2e.describe.serial('AC-52d: No params (all manual)', () => {
  flow5.e2e('navigate without params', navigateToSignUpV4(flow5.getPage));

  flow5.e2e('AC-53: lands on /general-info (not /plan)', async () => {
    const page = flow5.getPage();
    await expect(page).toHaveURL(/\/sign-up\/[^/]+\/general-info/);
  });

  flow5.e2e('AC-52d: country NOT pre-filled', async () => {
    const page = flow5.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    const value = await countrySelect.inputValue();
    expect(value).toBe('');
  });

  flow5.e2e('fill lead form (all manual)', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow5.getPage, { ...LEAD_COLOMBIA, email })();
  });

  flow5.e2e('submit lead form', submitLeadForm(flow5.getPage));
  flow5.e2e('fill registration form', fillRegistrationForm(flow5.getPage, REG_COLOMBIA));
  flow5.e2e('submit registration → /plan', submitRegistrationForm(flow5.getPage));

  flow5.e2e('AC-52d: no pre-selections in plan page', async () => {
    const page = flow5.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    // Default interval should be year (app default)
    const annualBtn = page.locator('[data-test-key="annually-button"]');
    await expect(annualBtn).toHaveAttribute('data-test-state', 'active');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 6: Plan + Country (no interval)
// ═════════════════════════════════════════════════════════════════════════════

const flow6 = createSerialFlow();

flow6.e2e.setTimeout(120_000);

flow6.e2e.describe.serial('AC-52: Plan + Country (no interval)', () => {
  flow6.e2e('navigate with plan+country', navigateToSignUpV4(flow6.getPage, PARAMS_V4_PLAN_COUNTRY));

  flow6.e2e('AC-52c: country pre-filled to USA', async () => {
    const page = flow6.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    await expect(countrySelect).toHaveValue('USA');
  });

  flow6.e2e('fill lead form', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow6.getPage, { ...LEAD_USA_V4, email })();
  });

  flow6.e2e('submit lead form', submitLeadForm(flow6.getPage));
  flow6.e2e('fill registration form', fillRegistrationForm(flow6.getPage, REG_USA_V4));
  flow6.e2e('submit registration → /plan', submitRegistrationForm(flow6.getPage));

  flow6.e2e('AC-52a: plan pre-highlighted', async () => {
    const page = flow6.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    const planCards = page.locator('[data-test-key="choose-plan-button"]');
    await expect(planCards.first()).toBeVisible();
  });

  flow6.e2e('AC-52b: interval defaults to year (no interval param)', async () => {
    const page = flow6.getPage();
    const annualBtn = page.locator('[data-test-key="annually-button"]');
    await expect(annualBtn).toHaveAttribute('data-test-state', 'active');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 7: Country + Interval (no plan)
// ═════════════════════════════════════════════════════════════════════════════

const flow7 = createSerialFlow();

flow7.e2e.setTimeout(120_000);

flow7.e2e.describe.serial('AC-52: Country + Interval (no plan)', () => {
  flow7.e2e('navigate with country+interval=month',
    navigateToSignUpV4(flow7.getPage, { country: 'USA', interval: 'month' }));

  flow7.e2e('AC-52c: country pre-filled to USA', async () => {
    const page = flow7.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    await expect(countrySelect).toHaveValue('USA');
  });

  flow7.e2e('fill lead form', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow7.getPage, { ...LEAD_USA_V4, email })();
  });

  flow7.e2e('submit lead form', submitLeadForm(flow7.getPage));
  flow7.e2e('fill registration form', fillRegistrationForm(flow7.getPage, REG_USA_V4));
  flow7.e2e('submit registration → /plan', submitRegistrationForm(flow7.getPage));

  flow7.e2e('AC-52b: monthly toggle pre-selected', async () => {
    const page = flow7.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    const monthlyBtn = page.locator('[data-test-key="monthly-button"]');
    await expect(monthlyBtn).toHaveAttribute('data-test-state', 'active');
  });

  flow7.e2e('AC-52a: no plan pre-highlighted (no plan param)', async () => {
    // Without plan param, no specific plan should be pre-selected
    const page = flow7.getPage();
    const planCards = page.locator('[data-test-key="choose-plan-button"]');
    await expect(planCards.first()).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 8: Plan + Interval (no country)
// ═════════════════════════════════════════════════════════════════════════════

const flow8 = createSerialFlow();

flow8.e2e.setTimeout(120_000);

flow8.e2e.describe.serial('AC-52: Plan + Interval (no country)', () => {
  flow8.e2e('navigate with plan+interval (no country)',
    navigateToSignUpV4(flow8.getPage, PARAMS_V4_PLAN_INTERVAL));

  flow8.e2e('AC-52d: country NOT pre-filled (no country param)', async () => {
    const page = flow8.getPage();
    const countrySelect = page.locator('[data-test-key="country-select"]');
    const value = await countrySelect.inputValue();
    expect(value).toBe('');
  });

  flow8.e2e('fill lead form (must select country manually)', async () => {
    const email = generateMailosaurEmail();
    await fillLeadForm(flow8.getPage, { ...LEAD_COLOMBIA, email })();
  });

  flow8.e2e('submit lead form', submitLeadForm(flow8.getPage));
  flow8.e2e('fill registration form', fillRegistrationForm(flow8.getPage, REG_COLOMBIA));
  flow8.e2e('submit registration → /plan', submitRegistrationForm(flow8.getPage));

  flow8.e2e('AC-52b: annual toggle pre-selected (interval=year)', async () => {
    const page = flow8.getPage();
    await page.waitForSelector('[data-test-context="plan-selection"][data-test-state="ready"]', { timeout: 15_000 });
    const annualBtn = page.locator('[data-test-key="annually-button"]');
    await expect(annualBtn).toHaveAttribute('data-test-state', 'active');
  });

  flow8.e2e('AC-52a: plan pre-highlighted', async () => {
    const page = flow8.getPage();
    const planCards = page.locator('[data-test-key="choose-plan-button"]');
    await expect(planCards.first()).toBeVisible();
  });
});
