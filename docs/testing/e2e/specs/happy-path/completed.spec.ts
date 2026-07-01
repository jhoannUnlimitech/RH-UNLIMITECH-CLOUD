import { createSerialFlow } from '../../fixtures/base';
import { verifyCompletedPage } from '../../factories/completed.factory';
import { AGREEMENT_VALIDATION } from '../../fixtures/test-data';

/**
 * Completed Page — Happy Path E2E Test
 *
 * Verifies that the completed page loads correctly with all elements visible
 * for a session that has completed the full enrollment flow.
 *
 * Uses a pre-existing completed session to avoid repeating the full flow.
 *
 * Run:
 *   npx playwright test completed
 *   npm run e2e -- completed
 */

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Completed Page — Happy Path', () => {
  e2e('all elements visible (title, subtitle, confirmations, footer)',
    verifyCompletedPage(getPage, AGREEMENT_VALIDATION.completedSessionId));
});
