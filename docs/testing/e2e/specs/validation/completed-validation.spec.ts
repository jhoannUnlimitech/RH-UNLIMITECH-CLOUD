import { createSerialFlow } from '../../fixtures/base';
import {
  verifyCompletedPage,
  verifyCompletedRedirectsNonCompleted,
  verifyCompletedReloadPersistence,
} from '../../factories/completed.factory';
import { AGREEMENT_VALIDATION, PLAN_VALIDATION_COLOMBIA } from '../../fixtures/test-data';

/**
 * Completed Page — Validation E2E Tests
 *
 * Validates: AC-22b, AC-22c, AC-22d, AC-22e, AC-22f, AC-22g
 *
 * AC-22b: completed-page context with state=ready
 * AC-22c: Title visible and not empty
 * AC-22d: Subtitle visible and not empty
 * AC-22e: 3 confirmation items visible (payment, agreement, email)
 * AC-22f: Footer visible, reload persists all elements
 * AC-22g: Session without status 'completed' redirects to correct step
 *
 * Uses pre-existing sessions to avoid repeating the full enrollment flow.
 *
 * Run:
 *   npx playwright test completed-validation
 *   npm run e2e -- completed-validation
 */

const completedSessionId = AGREEMENT_VALIDATION.completedSessionId;
const pendingSessionId = PLAN_VALIDATION_COLOMBIA.pendingSessionId;

// ── AC-22b to AC-22e: All completed page elements visible ───────────────────

const completedElements = createSerialFlow();

completedElements.e2e.describe.serial('AC-22b/c/d/e — Completed Page Elements', () => {
  if (!completedSessionId) {
    completedElements.e2e('SKIPPED — no completedSessionId configured', async () => {
      completedElements.e2e.skip();
    });
    return;
  }

  completedElements.e2e('all elements visible (title, subtitle, confirmations, footer)',
    verifyCompletedPage(completedElements.getPage, completedSessionId));
});

// ── AC-22f: Reload persistence ──────────────────────────────────────────────

const reloadPersistence = createSerialFlow();

reloadPersistence.e2e.describe.serial('AC-22f — Completed Page Reload Persistence', () => {
  if (!completedSessionId) {
    reloadPersistence.e2e('SKIPPED — no completedSessionId configured', async () => {
      reloadPersistence.e2e.skip();
    });
    return;
  }

  reloadPersistence.e2e('all elements persist after page reload',
    verifyCompletedReloadPersistence(reloadPersistence.getPage, completedSessionId));
});

// ── AC-22g: Non-completed session redirects ─────────────────────────────────

const nonCompletedRedirect = createSerialFlow();

nonCompletedRedirect.e2e.describe.serial('AC-22g — Non-Completed Session Redirects', () => {
  if (!pendingSessionId) {
    nonCompletedRedirect.e2e('SKIPPED — no pendingSessionId configured', async () => {
      nonCompletedRedirect.e2e.skip();
    });
    return;
  }

  nonCompletedRedirect.e2e('session without completed status redirects away from /completed',
    verifyCompletedRedirectsNonCompleted(nonCompletedRedirect.getPage, pendingSessionId));
});
