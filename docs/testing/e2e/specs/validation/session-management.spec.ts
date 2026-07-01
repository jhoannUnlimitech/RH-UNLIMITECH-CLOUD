import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import {
  verifySessionCreation,
  verifyInventedSessionBlocked,
  verifyMalformedSessionBlocked,
  verifyDataPersistence,
} from '../../factories/session-validation.factory';
import { LEAD_COLOMBIA, SESSION_INVALID } from '../../fixtures/test-data';

/**
 * Session Management — Validation E2E Tests
 *
 * Validates: AC-01, AC-02, AC-03
 *
 * AC-01: Session created only with valid DynamoDB session-id via URL
 * AC-02: Invalid/expired/missing session-id → error + blocked access
 * AC-03: Form data persists in DynamoDB, recoverable on page reload
 *
 * Run:
 *   npx playwright test session-management
 *   npm run e2e -- session-management
 */

// ── AC-01: Valid session creation ───────────────────────────────────────────

const sessionCreation = createSerialFlow();

sessionCreation.e2e.describe.serial('AC-01 — Session Creation', () => {
  sessionCreation.e2e('navigating to /sign-up creates UUID and redirects to general-info',
    verifySessionCreation(sessionCreation.getPage));
});

// ── AC-02: Invalid session-id blocked ───────────────────────────────────────

const inventedSessionBlocked = createSerialFlow();

inventedSessionBlocked.e2e.describe.serial('AC-02 — Invented Session ID Blocked', () => {
  inventedSessionBlocked.e2e('invented UUID must not grant access to the form',
    verifyInventedSessionBlocked(inventedSessionBlocked.getPage, SESSION_INVALID));
});

const malformedSessionBlocked = createSerialFlow();

malformedSessionBlocked.e2e.describe.serial('AC-02 — Malformed Session ID Blocked', () => {
  malformedSessionBlocked.e2e('malformed session-id must not grant access to the form',
    verifyMalformedSessionBlocked(malformedSessionBlocked.getPage, SESSION_INVALID));
});

// ── AC-03: Data persistence via DynamoDB ────────────────────────────────────

const dataPersistence = createSerialFlow();

dataPersistence.e2e.describe.serial('AC-03 — Data Persistence', () => {
  dataPersistence.e2e('navigate to sign-up',       navigateToSignUpV4(dataPersistence.getPage));
  dataPersistence.e2e('fill lead form',            fillLeadForm(dataPersistence.getPage, LEAD_COLOMBIA));
  dataPersistence.e2e('submit lead form',          submitLeadForm(dataPersistence.getPage));
  dataPersistence.e2e('reload and verify data recovered from backend',
    verifyDataPersistence(dataPersistence.getPage, LEAD_COLOMBIA));
});
