import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { verifyPlanSelection } from '../../factories/plan-selection.factory';
import { LEAD_COLOMBIA, REG_COLOMBIA } from '../../fixtures/test-data';

/**
 * Plan Selection — E2E Test
 *
 * Serial flow: navigate → lead → submit → registration → submit → verify plans
 * Reuses all previous factories to reach the plan selection page.
 *
 * Run:
 *   npx playwright test plan-selection
 *   npm run e2e -- plan-selection
 */

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Plan Selection — Verify', () => {
  e2e('navigate to sign-up',        navigateToSignUp(getPage));
  e2e('fill lead form',             fillLeadForm(getPage, LEAD_COLOMBIA));
  e2e('submit lead form',           submitLeadForm(getPage));
  e2e('fill registration form',     fillRegistrationForm(getPage, REG_COLOMBIA));
  e2e('submit registration form',   submitRegistrationForm(getPage));
  e2e('verify plan selection page', verifyPlanSelection(getPage));
});
