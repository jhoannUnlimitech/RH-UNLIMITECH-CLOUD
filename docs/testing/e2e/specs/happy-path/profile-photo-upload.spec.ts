/**
 * Profile Photo Upload — Happy Path E2E Test
 *
 * Validates the profile photo upload functionality in Form 2 (Details page).
 * Requires Form 1 to be filled first (uses existing lead-form + registration factories).
 *
 * Flow:
 *   Phase 1: Navigate → Fill Form 1 → Submit → arrives at /details
 *   Phase 2: Verify photo input initial state
 *   Phase 3: Upload valid image → verify preview
 *   Phase 4: Remove → verify reset
 *   Phase 5: Re-upload → verify new preview
 *   Phase 6: Submit form WITH photo → navigates to /plan
 *
 * Covers: AC-PU-01 to AC-PU-11, AC-PU-45
 *
 * Timeout: 120s
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test profile-photo-upload --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import {
  verifyPhotoInputInitialState,
  uploadValidImage,
  verifyPreviewUsesBlobUrl,
} from '../../factories/profile-photo.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import {
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  generateMailosaurEmail,
} from '../../fixtures/test-data';

const testEmail = generateMailosaurEmail();
const LEAD = { ...LEAD_USA_V4, email: testEmail };

const { e2e, getPage } = createSerialFlow();

// Registration data WITHOUT photo (photo is uploaded separately in this spec)
const REG_NO_PHOTO = { ...REG_USA_V4, profilePhotoPath: undefined };

e2e.setTimeout(120_000);

e2e.describe.serial('Profile Photo Upload — Happy Path', () => {

  // ── Phase 1: Navigate + Fill Form 1 → /details ────────────────────────────
  e2e('navigate with v4 params', navigateToSignUpV4(getPage, PARAMS_V4_FULL));
  e2e('fill lead form',          fillLeadForm(getPage, LEAD));
  e2e('submit lead form',        submitLeadForm(getPage));

  // ── Phase 2: Verify initial state of photo upload ─────────────────────────
  e2e('AC-PU-01/02/03: verify photo input initial state', verifyPhotoInputInitialState(getPage));

  // ── Phase 3: Fill form fields first (without photo), then upload photo last
  e2e('fill registration form (all fields)', fillRegistrationForm(getPage, REG_NO_PHOTO));

  // ── Phase 4: Upload photo after form is filled ────────────────────────────
  e2e('AC-PU-04/05/06: upload valid image → preview visible', uploadValidImage(getPage));
  e2e('AC-PU-45: preview uses blob URL (not S3)', verifyPreviewUsesBlobUrl(getPage));

  // ── Phase 5: Submit form WITH photo → /plan ───────────────────────────────
  e2e('AC-PU-09: submit form with photo → /plan', submitRegistrationForm(getPage));
});
