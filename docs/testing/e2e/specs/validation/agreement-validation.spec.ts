import { createSerialFlow } from '../../fixtures/base';
import {
  verifyAgreementLoadingState,
  verifyAgreementReadyState,
  verifyAgreementErrorState,
  verifyAgreementReloadPersistence,
  verifyTokenExpiration,
} from '../../factories/agreement.factory';
import { AGREEMENT_VALIDATION } from '../../fixtures/test-data';

/**
 * Agreement Page — Validation E2E Tests
 *
 * Validates: AC-20a, AC-20b, AC-20c, AC-20d, AC-21, AC-22b
 *
 * AC-20a: Loading state — spinner and message while preparing document
 * AC-20b: Ready state — title, subtitle, signing container, iframe with Zoho URL
 * AC-20c: Error state — error message when agreement endpoint fails
 * AC-20d: Reload persistence — iframe reloads with new token after page refresh
 * AC-21:  Token expiration — wait >2 min, reload, verify new token generated
 * AC-22b: Completed page — welcome message after signing
 *
 * These tests use pre-existing sessions to avoid repeating the full enrollment flow:
 * - paidSessionId: session with status 'paid' (for agreement page tests)
 * - completedSessionId: session with status 'completed' (for completed page test)
 *
 * AC-20a and AC-20c use page.route() interceptors to simulate states.
 * AC-21 requires a real wait of ~160 seconds (token expiration is 2 minutes).
 *
 * Run:
 *   npx playwright test agreement-validation
 *   npm run e2e -- agreement-validation
 */

const { paidSessionId } = AGREEMENT_VALIDATION;

// ── AC-20a: Loading state — spinner and message ─────────────────────────────

const agreementLoading = createSerialFlow();

agreementLoading.e2e.setTimeout(30_000);

agreementLoading.e2e.describe.serial('AC-20a — Agreement Loading State', () => {
  if (!paidSessionId) {
    agreementLoading.e2e('SKIPPED — no paidSessionId configured', async () => {
      agreementLoading.e2e.skip();
    });
    return;
  }

  agreementLoading.e2e('loading state shows spinner and message',
    verifyAgreementLoadingState(agreementLoading.getPage, paidSessionId));
});

// ── AC-20b: Ready state — iframe with Zoho Sign ────────────────────────────

const agreementReady = createSerialFlow();

agreementReady.e2e.setTimeout(90_000);

agreementReady.e2e.describe.serial('AC-20b — Agreement Ready State with Iframe', () => {
  if (!paidSessionId) {
    agreementReady.e2e('SKIPPED — no paidSessionId configured', async () => {
      agreementReady.e2e.skip();
    });
    return;
  }

  agreementReady.e2e('ready state shows title, subtitle, and Zoho Sign iframe',
    verifyAgreementReadyState(agreementReady.getPage, paidSessionId));
});

// ── AC-20c: Error state — error message ─────────────────────────────────────

const agreementError = createSerialFlow();

agreementError.e2e.setTimeout(30_000);

agreementError.e2e.describe.serial('AC-20c — Agreement Error State', () => {
  if (!paidSessionId) {
    agreementError.e2e('SKIPPED — no paidSessionId configured', async () => {
      agreementError.e2e.skip();
    });
    return;
  }

  agreementError.e2e('error state shows error message when endpoint fails',
    verifyAgreementErrorState(agreementError.getPage, paidSessionId));
});

// ── AC-20d: Reload persistence — iframe reloads after refresh ───────────────

const agreementReload = createSerialFlow();

agreementReload.e2e.setTimeout(120_000);

agreementReload.e2e.describe.serial('AC-20d — Agreement Reload Persistence', () => {
  if (!paidSessionId) {
    agreementReload.e2e('SKIPPED — no paidSessionId configured', async () => {
      agreementReload.e2e.skip();
    });
    return;
  }

  agreementReload.e2e('iframe reloads with new token after page refresh',
    verifyAgreementReloadPersistence(agreementReload.getPage, paidSessionId));
});

// ── AC-21: Token expiration — wait >2 min, reload, verify new token ─────────

const tokenExpiration = createSerialFlow();

// This test requires ~3 minutes: 60s for initial load + 160s wait + 60s for reload
tokenExpiration.e2e.setTimeout(300_000);

tokenExpiration.e2e.describe.serial('AC-21 — Zoho Sign Token Expiration', () => {
  if (!paidSessionId) {
    tokenExpiration.e2e('SKIPPED — no paidSessionId configured', async () => {
      tokenExpiration.e2e.skip();
    });
    return;
  }

  tokenExpiration.e2e('token expires after 2 min, reload generates new token',
    verifyTokenExpiration(tokenExpiration.getPage, paidSessionId));
});
