/**
 * Image Orientation Validation — Ticket #870
 *
 * Tests that profile photos uploaded during enrollment are correctly stored
 * in Zoho CRM without orientation issues. Runs 10 enrollments (Form 1 + Form 2)
 * with different portrait photos, then validates via CRM API that each Lead
 * has the photo stored.
 *
 * Structure:
 *   - 10 sequential enrollments (each with a different photo)
 *   - 1 final CRM validation step (checks all 10 photos exist)
 *   - 1 report generation step
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test image-orientation-validation --reporter=list
 */

import { resolve } from 'path';
import { createSerialFlow } from '../../fixtures/base';
import { createCRMContext, authenticateZoho } from '../../factories/crm-validation.factory';
import {
  enrollWithPhoto,
  validateAllPhotosInCRM,
  generatePhotoOrientationReport,
  type EnrollmentPhotoRecord,
  type PhotoValidationResult,
} from '../../factories/image-orientation.factory';

// ─── Test Images ────────────────────────────────────────────────────────────

const IMAGES_DIR = resolve(process.cwd(), 'examples/profile-images/orientation-test');

const TEST_IMAGES = Array.from({ length: 10 }, (_, i) =>
  resolve(IMAGES_DIR, `portrait_square_${String(i + 1).padStart(2, '0')}.jpg`),
);

// ─── Shared State ───────────────────────────────────────────────────────────

const records: EnrollmentPhotoRecord[] = [];
const results: PhotoValidationResult[] = [];

// ─── Serial Flow ────────────────────────────────────────────────────────────

const { e2e, getPage } = createSerialFlow();
const crmCtx = createCRMContext();

e2e.setTimeout(600_000); // 10 min — 10 enrollments + CRM validation

e2e.describe.serial('Image Orientation Validation — 10 Photos (Ticket #870)', () => {

  // ── Phase 1: Create 10 enrollments with different photos ───────────────────
  for (let i = 0; i < 10; i++) {
    e2e(`AC-870-${String(i + 1).padStart(2, '0')}: enrollment #${i + 1} with photo`,
      enrollWithPhoto(getPage, TEST_IMAGES[i], i + 1, records));
  }

  // ── Phase 2: Validate all 10 photos exist in CRM ──────────────────────────
  e2e('CRM: authenticate',                    authenticateZoho(crmCtx));
  e2e('AC-870-11: validate all photos in CRM', validateAllPhotosInCRM(crmCtx, records, results));
  e2e('AC-870-13: generate report',            generatePhotoOrientationReport(results));
});
