import { createSerialFlow } from '../../fixtures/base';
import { waitForAdminSigningEmail, signAsAdmin, verifyCompletionEmail } from '../../factories/admin-signing.factory';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Admin Agreement Signing — E2E Test
 *
 * Validates that after the client signs the WISE Membership Agreement,
 * the admin receives a signing request email and can complete the signature
 * via Zoho Sign.
 *
 * PRE-REQUISITE: Run enrollment flow first (multiple-signers) to:
 *   1. Complete client signature (triggers admin signing request)
 *   2. Export bridge data to .temp/bridge-output.json
 *
 * Flow:
 *   Phase 1: Wait for admin signing email in Mailosaur
 *   Phase 2: Navigate to Zoho Sign → Sign document
 *   Phase 3: Verify completion email
 *
 * Acceptance Criteria: AC-AS01 to AC-AS12
 *
 * Timeout: 180s.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test admin-agreement-signing
 */

// ─── Read bridge data from enrollment ────────────────────────────────────────

interface BridgeData {
  email: string;
  firstName: string;
  lastName: string;
  timestamp: string;
}

function readBridgeData(): BridgeData {
  const bridgePath = resolve(process.cwd(), '.temp/bridge-output.json');
  try {
    const content = readFileSync(bridgePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    throw new Error(
      `Bridge data not found at ${bridgePath}. ` +
      'Run enrollment flow first: CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-multiple-signers',
    );
  }
}

const bridge = readBridgeData();

// ─── Test Setup ──────────────────────────────────────────────────────────────

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(180_000);

let zohoSignUrl = '';

e2e.describe.serial('Admin Agreement Signing — Happy Path', () => {
  // ── Phase 1: Wait for admin signing email ─────────────────────
  e2e('AC-AS01: receive admin signing email', async () => {
    const url = await waitForAdminSigningEmail(bridge.email)();
    zohoSignUrl = url;
  });

  // ── Phase 2: Sign document via Zoho Sign ──────────────────────
  e2e('AC-AS04 to AC-AS10: sign as admin', () => signAsAdmin(getPage, zohoSignUrl)());

  // ── Phase 3: Verify completion ────────────────────────────────
  e2e('AC-AS11: verify completion email', verifyCompletionEmail());
});
