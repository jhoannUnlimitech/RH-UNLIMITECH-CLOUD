/**
 * Profile Photo Upload — Validation E2E Test
 *
 * Validates error handling and boundary conditions for the photo upload.
 * Requires Form 1 to be filled first to reach /details.
 *
 * Tests:
 *   - File > 10MB → error (AC-PU-12)
 *   - WebP file → error (AC-PU-13)
 *   - Exactly 10MB → accepted (AC-PU-14)
 *   - Recovery from error → upload valid (AC-PU-15/16)
 *   - Submit form WITHOUT photo → success (AC-PU-10 — optional field)
 *
 * Covers: AC-PU-10, AC-PU-12 to AC-PU-16
 *
 * Timeout: 120s
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test profile-photo-validation --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import {
  verifyPhotoInputInitialState,
  uploadOverSizeLimit,
  uploadInvalidType,
  uploadBoundarySize,
  uploadValidImage,
  recoverFromError,
  removeUploadedPhoto,
  reUploadAfterRemove,
  verifyUploadingStateWithSlowNetwork,
} from '../../factories/profile-photo.factory';
import {
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  generateMailosaurEmail,
} from '../../fixtures/test-data';

const testEmail = generateMailosaurEmail();
const LEAD = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

// Registration data WITHOUT photo (photo tests are done separately)
const REG_NO_PHOTO = { ...REG_USA_V4, profilePhotoPath: undefined };

e2e.setTimeout(120_000);

e2e.describe.serial('Profile Photo Upload — Validation', () => {

  // ── Setup: Navigate + Fill Form 1 → /details ──────────────────────────────
  e2e('navigate with v4 params', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',          fillLeadForm(getPage, LEAD));
  e2e('submit lead form',        submitLeadForm(getPage));

  // ── Validation: File too large ────────────────────────────────────────────
  e2e('AC-PU-12: file > 10MB → error visible', uploadOverSizeLimit(getPage));

  // ── Validation: Invalid file type ─────────────────────────────────────────
  e2e('AC-PU-13: WebP file → error (invalid type)', uploadInvalidType(getPage));

  // ── Validation: Recovery from error ───────────────────────────────────────
  e2e('AC-PU-15/16: upload valid after error → error disappears', recoverFromError(getPage));

  // ── Validation: Remove and re-upload ──────────────────────────────────────
  e2e('AC-PU-07: remove photo → input reset', removeUploadedPhoto(getPage));
  e2e('AC-PU-08: re-upload after remove → new preview', reUploadAfterRemove(getPage));

  // ── Validation: Boundary — exactly 10MB ───────────────────────────────────
  e2e('remove current photo', removeUploadedPhoto(getPage));
  e2e('AC-PU-14: exactly 10MB → accepted (boundary)', uploadBoundarySize(getPage));

  // ── Validation: Uploading state with slow network (AC-PU-11) ───────────────
  e2e('remove photo for slow network test', removeUploadedPhoto(getPage));
  e2e('AC-PU-11: uploading state visible with slow network', verifyUploadingStateWithSlowNetwork(getPage));

  // ── Validation: Submit WITHOUT photo (optional field) ─────────────────────
  e2e('remove photo for optional test', removeUploadedPhoto(getPage));
  e2e('fill registration form (no photo)', fillRegistrationForm(getPage, REG_NO_PHOTO));
  e2e('AC-PU-10: submit without photo → /plan (field optional)', submitRegistrationForm(getPage));
});
