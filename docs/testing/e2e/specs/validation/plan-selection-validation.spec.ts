import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import {
  verifyPlanPricesDisplayed,
  verifyIndividualOnlyAnnual,
  verifyPlanCountPerInterval,
  verifyIntervalLabels,
} from '../../factories/plan-selection.factory';

/**
 * Plan Selection — Validation E2E Tests (v3)
 *
 * In v3, plan selection is the FIRST step of the enrollment flow.
 * No pre-conditions needed — just navigate to /sign-up → /plan.
 *
 * Validates:
 *   AC-15:  All visible plans display numeric prices
 *   AC-15b: Individual only in annual; 5 annual plans, 4 monthly plans
 *   AC-15d: Interval labels show /year or /month matching the toggle state
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test plan-selection-validation
 */

// ── AC-15, AC-36, AC-37: Plan prices displayed ──────────────────────────────

const pricesDisplayed = createSerialFlow();

pricesDisplayed.e2e.describe.serial('AC-15 / AC-36 / AC-37 — Plan Prices Displayed', () => {
  pricesDisplayed.e2e('navigate to plan selection', navigateToSignUp(pricesDisplayed.getPage));
  pricesDisplayed.e2e('all plans show numeric prices in both intervals', verifyPlanPricesDisplayed(pricesDisplayed.getPage));
});

// ── AC-15b: Individual plan only in annual ──────────────────────────────────

const individualOnlyAnnual = createSerialFlow();

individualOnlyAnnual.e2e.describe.serial('AC-15b — Individual Only Annual', () => {
  individualOnlyAnnual.e2e('navigate to plan selection', navigateToSignUp(individualOnlyAnnual.getPage));
  individualOnlyAnnual.e2e('individual hidden in monthly, visible in annually', verifyIndividualOnlyAnnual(individualOnlyAnnual.getPage));
});

// ── AC-15b: Plan count per interval ─────────────────────────────────────────

const planCountPerInterval = createSerialFlow();

planCountPerInterval.e2e.describe.serial('AC-15b — Plan Count Per Interval', () => {
  planCountPerInterval.e2e('navigate to plan selection', navigateToSignUp(planCountPerInterval.getPage));
  planCountPerInterval.e2e('5 plans in annual, 4 in monthly', verifyPlanCountPerInterval(planCountPerInterval.getPage));
});

// ── AC-15d: Interval labels ─────────────────────────────────────────────────

const intervalLabels = createSerialFlow();

intervalLabels.e2e.describe.serial('AC-15d — Interval Labels', () => {
  intervalLabels.e2e('navigate to plan selection', navigateToSignUp(intervalLabels.getPage));
  intervalLabels.e2e('labels show /year in annual and /month in monthly', verifyIntervalLabels(intervalLabels.getPage));
});
