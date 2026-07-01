import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUp } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm } from '../../factories/registration-form.factory';
import { LEAD_COLOMBIA, REG_COLOMBIA } from '../../fixtures/test-data';

/**
 * Enrollment Flow — Lead + Registration E2E Test
 *
 * Serial flow: navigate → fill lead → submit lead → fill registration
 *
 * Run modes:
 *   Headless:    npm run e2e
 *   Assisted:    npm run e2e:assisted
 */

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Enrollment Flow — Colombia', () => {
  e2e('navigate to sign-up',        navigateToSignUp(getPage));
  e2e('fill lead form',             fillLeadForm(getPage, LEAD_COLOMBIA));
  e2e('submit lead form',           submitLeadForm(getPage));
  e2e('fill registration form',     fillRegistrationForm(getPage, REG_COLOMBIA));
});
