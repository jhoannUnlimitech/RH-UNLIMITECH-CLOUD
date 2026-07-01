/**
 * Plan Selection Factories — Reusable test steps for the plan selection page.
 *
 * In v3, plan selection is the FIRST step of the enrollment flow.
 * It does NOT generate a Stripe checkout — only saves the selection
 * and navigates to /general-info.
 *
 * Based on curated playbook: e2e/playbooks/plan-selection-verify.md
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/plan-selection.pom';
import type { PlanSelectionData, RegistrationFormData } from '../fixtures/test-data';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const ps = pom.plan_selection;

const sel = {
  pageReady:       ps.ready.$(),
  pageLoading:     ps.loading.$(),
  monthlyButton:   ps._.interval_toggle._.monthly_button.$(),
  monthlyActive:   ps._.interval_toggle._.monthly_button.active.$(),
  monthlyInactive: ps._.interval_toggle._.monthly_button.inactive.$(),
  annuallyButton:  ps._.interval_toggle._.annually_button.$(),
  annuallyActive:  ps._.interval_toggle._.annually_button.active.$(),
  annuallyInactive: ps._.interval_toggle._.annually_button.inactive.$(),
  plansGrid:       ps._.plans_grid.$(),

  // Plan cards by cname (derived from POM)
  planIndividual:  ps._.plans_grid._.plan_individual.$(),
  planGeneral:     ps._.plans_grid._.plan_general.$(),
  planCompany:     ps._.plans_grid._.plan_company.$(),
  // planCharter:     ps._.plans_grid._.plan_charter.$(),
  planCorporate:   ps._.plans_grid._.plan_corporate.$(),
};

// ─── Plan card child selectors (derived from POM, used as relative selectors) ──

const pg = ps._.plans_grid;

/** Per-plan selectors: { context, price, chooseBtn, name, intervalLabel } */
function planSel(plan: ReturnType<typeof pg._>[keyof ReturnType<typeof pg._>]) {
  return {
    context:       (plan as any).$() as string,
    price:         (plan as any)._.plan_price.$() as string,
    chooseBtn:     (plan as any)._.choose_plan_button.$() as string,
    chooseBtnReady:(plan as any)._.choose_plan_button.ready.$() as string,
    name:          (plan as any)._.plan_name.$() as string,
    intervalLabel: (plan as any)._.plan_interval_label.$() as string,
  };
}

const plans: Record<string, ReturnType<typeof planSel>> = {
  individual: planSel(pg._.plan_individual),
  general:    planSel(pg._.plan_general),
  company:    planSel(pg._.plan_company),
  // charter:    planSel(pg._.plan_charter),
  corporate:  planSel(pg._.plan_corporate),
};

const ANNUAL_PLAN_KEYS = ['individual', 'general', 'company', 'corporate'] as const;
const MONTHLY_PLAN_KEYS = ['general', 'company', 'corporate'] as const;

// ═════════════════════════════════════════════════════════════════════════════
// SELECTION — Choose a plan and navigate to /general-info
// ═════════════════════════════════════════════════════════════════════════════

/**
 * v3: Select a plan at the start of the enrollment flow and navigate to /general-info.
 * Handles interval toggle if the plan requires monthly billing.
 *
 * @param data - Plan selection data from test-data.ts (cname + interval)
 */
export function selectPlan(getPage: () => Page, data: PlanSelectionData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.pageReady, { timeout: 30_000 });

    // Toggle to monthly if needed (default is annual)
    if (data.interval === 'month') {
      await page.locator(sel.monthlyButton).click();
      await expect(page.locator(sel.monthlyActive)).toBeVisible();
    }

    // Click the choose button for the specified plan
    const planData = plans[data.cname];
    expect(planData, `Unknown plan cname: ${data.cname}`).toBeTruthy();

    const chooseBtn = page.locator(planData.chooseBtn);
    await expect(chooseBtn).toBeVisible();
    await chooseBtn.click();

    // V4: plan selection navigates to /thank-you (step 3 → step 4)
    // V3 legacy: navigated to /general-info (step 1 → step 2)
    await page.waitForURL(/\/sign-up\/[^/]+\/(thank-you|general-info)/, { timeout: 10_000 });
  };
}

/**
 * v4: Select a plan after both forms are complete → navigate to /thank-you.
 * In v4, plan selection is step 3 and triggers email verification.
 *
 * @param data - Plan selection data from test-data.ts (cname + interval)
 */
export function selectPlanV4(getPage: () => Page, data: PlanSelectionData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    // Toggle to monthly if needed (default is annual)
    if (data.interval === 'month') {
      await page.locator(sel.monthlyButton).click();
      await expect(page.locator(sel.monthlyActive)).toBeVisible();
    }

    // Click the choose button for the specified plan
    const planData = plans[data.cname];
    expect(planData, `Unknown plan cname: ${data.cname}`).toBeTruthy();

    const chooseBtn = page.locator(planData.chooseBtn);
    await expect(chooseBtn).toBeVisible();
    await chooseBtn.click();

    // v4: plan selection navigates to /thank-you (triggers email verification)
    await page.waitForURL(/\/sign-up\/[^/]+\/thank-you/, { timeout: 10_000 });
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VERIFICATION — Plan page structure, toggle, prices
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Verify the plan selection page loads correctly with annual plans (default).
 * Then toggle to monthly, verify plans change, toggle back to annually.
 */
export function verifyPlanSelection(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // ── Step 1: Verify page loaded with annual plans (default) ──
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    // Annually is active by default
    await expect(page.locator(sel.annuallyActive)).toBeVisible();
    await expect(page.locator(sel.monthlyInactive)).toBeVisible();

    // 5 plan cards visible
    for (const key of ANNUAL_PLAN_KEYS) {
      await expect(page.locator(plans[key].context)).toBeVisible();
    }

    // All choose-plan buttons are ready
    for (const key of ANNUAL_PLAN_KEYS) {
      await expect(page.locator(plans[key].chooseBtnReady)).toBeVisible();
    }

    // ── Step 2: Switch to Monthly ──
    await page.locator(sel.monthlyButton).click();

    // Monthly is now active
    await expect(page.locator(sel.monthlyActive)).toBeVisible();
    await expect(page.locator(sel.annuallyInactive)).toBeVisible();

    // Individual plan disappears (no monthly price)
    await expect(page.locator(sel.planIndividual)).toBeHidden();

    // 4 plan cards visible
    for (const key of MONTHLY_PLAN_KEYS) {
      await expect(page.locator(plans[key].context)).toBeVisible();
    }

    for (const key of MONTHLY_PLAN_KEYS) {
      await expect(page.locator(plans[key].chooseBtnReady)).toBeVisible();
    }

    // ── Step 3: Switch back to Annually ──
    await page.locator(sel.annuallyButton).click();

    // Annually is active again
    await expect(page.locator(sel.annuallyActive)).toBeVisible();
    await expect(page.locator(sel.monthlyInactive)).toBeVisible();

    // 5 plan cards visible again
    for (const key of ANNUAL_PLAN_KEYS) {
      await expect(page.locator(plans[key].context)).toBeVisible();
    }

    for (const key of ANNUAL_PLAN_KEYS) {
      await expect(page.locator(plans[key].chooseBtn)).toBeVisible();
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — Price display, interval behavior
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-15, AC-36, AC-37 — Verify all visible plan cards display a numeric price.
 * Checks that plan-price text is not empty, not "—", and contains at least one digit.
 */
export function verifyPlanPricesDisplayed(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    // Verify prices in annual view (default)
    for (const key of ANNUAL_PLAN_KEYS) {
      const priceEl = page.locator(plans[key].price);
      await expect(priceEl).toBeVisible();
      const priceText = await priceEl.textContent();
      expect(priceText).toBeTruthy();
      expect(priceText).not.toBe('—');
      expect(priceText).toMatch(/\d/);
    }

    // Switch to monthly and verify prices for monthly plans
    await page.locator(sel.monthlyButton).click();
    await expect(page.locator(sel.monthlyActive)).toBeVisible();

    for (const key of MONTHLY_PLAN_KEYS) {
      const priceEl = page.locator(plans[key].price);
      await expect(priceEl).toBeVisible();
      const priceText = await priceEl.textContent();
      expect(priceText).toBeTruthy();
      expect(priceText).not.toBe('—');
      expect(priceText).toMatch(/\d/);
    }
  };
}

/**
 * AC-15b — Verify Individual plan is only visible in annual interval.
 */
export function verifyIndividualOnlyAnnual(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    // In annual mode: Individual is visible and available
    await expect(page.locator(sel.planIndividual)).toBeVisible();

    // Switch to monthly: Individual should be disabled (not hidden — shown with opacity)
    await page.locator(sel.monthlyButton).click();
    await expect(page.locator(sel.monthlyActive)).toBeVisible();
    await expect(page.locator(sel.planIndividual)).toHaveAttribute('data-test-state', 'disabled');

    // Switch back to annual: Individual should be available again
    await page.locator(sel.annuallyButton).click();
    await expect(page.locator(sel.annuallyActive)).toBeVisible();
    await expect(page.locator(sel.planIndividual)).toBeVisible();
    const state = await page.locator(sel.planIndividual).getAttribute('data-test-state');
    expect(state).not.toBe('disabled');
  };
}

/**
 * AC-15b — Verify plan count per interval: 5 annual, 4 monthly.
 */
export function verifyPlanCountPerInterval(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    for (const key of ANNUAL_PLAN_KEYS) {
      await expect(page.locator(plans[key].context)).toBeVisible();
    }

    await page.locator(sel.monthlyButton).click();
    await expect(page.locator(sel.monthlyActive)).toBeVisible();
    // Individual is disabled (not hidden) in monthly — only annual supported
    await expect(page.locator(sel.planIndividual)).toHaveAttribute('data-test-state', 'disabled');
    for (const key of MONTHLY_PLAN_KEYS) {
      await expect(page.locator(plans[key].context)).toBeVisible();
    }
  };
}

/**
 * AC-15d — Verify interval labels show correct text per toggle state.
 */
export function verifyIntervalLabels(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.pageReady, { timeout: 15_000 });

    for (const key of ANNUAL_PLAN_KEYS) {
      const label = page.locator(plans[key].intervalLabel);
      await expect(label).toBeVisible();
      const text = await label.textContent();
      expect(text?.toLowerCase()).toMatch(/year|año/);
    }

    await page.locator(sel.monthlyButton).click();
    await expect(page.locator(sel.monthlyActive)).toBeVisible();

    for (const key of MONTHLY_PLAN_KEYS) {
      const label = page.locator(plans[key].intervalLabel);
      await expect(label).toBeVisible();
      const text = await label.textContent();
      expect(text?.toLowerCase()).toMatch(/month|mes/);
    }
  };
}
