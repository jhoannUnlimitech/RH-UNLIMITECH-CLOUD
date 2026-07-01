import { createSerialFlow } from '../../fixtures/base';
import {
  verifyPostPaymentBlocksGeneralInfo,
  verifyPostPaymentBlocksDetails,
  verifyPostPaymentBlocksPlan,
  verifyPendingRedirectsFromCompleted,
  verifyCompletedRedirectsFromEarlierSteps,
} from '../../factories/navigation-guard.factory';
import { AGREEMENT_VALIDATION, PLAN_VALIDATION_COLOMBIA } from '../../fixtures/test-data';

/**
 * Navigation Guard — Validation E2E Tests
 *
 * Validates: AC-32, AC-34, AC-35
 *
 * AC-32: Post-payment sessions cannot access Form 1, Form 2, Plan Selection
 * AC-34: Each URL redirects to the correct step based on session status
 * AC-35: No sessionStorage — already verified in AC-03 (data persistence)
 *
 * Uses pre-existing sessions in different statuses:
 * - completedSessionId: status 'completed' (for AC-32, AC-34)
 * - pendingSessionId: status 'pending' (for AC-34)
 *
 * Run:
 *   npx playwright test navigation-guard-validation
 *   npm run e2e -- navigation-guard-validation
 */

const completedSessionId = AGREEMENT_VALIDATION.completedSessionId;
const pendingSessionId = PLAN_VALIDATION_COLOMBIA.pendingSessionId;

// ── AC-32: Post-payment blocks /general-info ────────────────────────────────

const blocksGeneralInfo = createSerialFlow();

blocksGeneralInfo.e2e.describe.serial('AC-32 — Post-Payment Blocks General Info', () => {
  if (!completedSessionId) {
    blocksGeneralInfo.e2e('SKIPPED — no completedSessionId', async () => { blocksGeneralInfo.e2e.skip(); });
    return;
  }
  blocksGeneralInfo.e2e('completed session cannot access /general-info',
    verifyPostPaymentBlocksGeneralInfo(blocksGeneralInfo.getPage, completedSessionId));
});

// ── AC-32: Post-payment blocks /details ─────────────────────────────────────

const blocksDetails = createSerialFlow();

blocksDetails.e2e.describe.serial('AC-32 — Post-Payment Blocks Details', () => {
  if (!completedSessionId) {
    blocksDetails.e2e('SKIPPED — no completedSessionId', async () => { blocksDetails.e2e.skip(); });
    return;
  }
  blocksDetails.e2e('completed session cannot access /details',
    verifyPostPaymentBlocksDetails(blocksDetails.getPage, completedSessionId));
});

// ── AC-32: Post-payment blocks /plan ────────────────────────────────────────

const blocksPlan = createSerialFlow();

blocksPlan.e2e.describe.serial('AC-32 — Post-Payment Blocks Plan', () => {
  if (!completedSessionId) {
    blocksPlan.e2e('SKIPPED — no completedSessionId', async () => { blocksPlan.e2e.skip(); });
    return;
  }
  blocksPlan.e2e('completed session cannot access /plan',
    verifyPostPaymentBlocksPlan(blocksPlan.getPage, completedSessionId));
});

// ── AC-34: Pending session redirects from /completed ────────────────────────

const pendingRedirects = createSerialFlow();

pendingRedirects.e2e.describe.serial('AC-34 — Pending Session Redirects From Completed', () => {
  if (!pendingSessionId) {
    pendingRedirects.e2e('SKIPPED — no pendingSessionId', async () => { pendingRedirects.e2e.skip(); });
    return;
  }
  pendingRedirects.e2e('pending session redirects away from /completed',
    verifyPendingRedirectsFromCompleted(pendingRedirects.getPage, pendingSessionId));
});

// ── AC-34: Completed session redirects from earlier steps ───────────────────

const completedRedirects = createSerialFlow();

completedRedirects.e2e.describe.serial('AC-34 — Completed Session Redirects From Earlier Steps', () => {
  if (!completedSessionId) {
    completedRedirects.e2e('SKIPPED — no completedSessionId', async () => { completedRedirects.e2e.skip(); });
    return;
  }
  completedRedirects.e2e('completed session redirects away from /general-info',
    verifyCompletedRedirectsFromEarlierSteps(completedRedirects.getPage, completedSessionId));
});

// ── AC-35: No sessionStorage ────────────────────────────────────────────────
// Already verified in AC-03 (session-management.spec.ts — Data Persistence).
// Data loads from backend via GET /lead/{sessionId}, not from sessionStorage.
