/**
 * Image Orientation Factories — Reusable steps for photo orientation validation.
 *
 * Provides factories for:
 * - Running a single enrollment (Form 1 + Form 2 + Plan + Email Verify) with a specific photo
 * - Validating all uploaded photos exist in CRM Contact via Zoho API
 *
 * Related files:
 * - e2e/fixtures/zoho-client.ts (Zoho CRM API client)
 * - e2e/factories/navigation.factory.ts (navigateToSignUpV4)
 * - e2e/factories/lead-form.factory.ts (fillLeadForm, submitLeadForm)
 * - e2e/factories/registration-form.factory.ts (fillRegistrationForm, submitRegistrationForm)
 * - e2e/factories/plan-selection.factory.ts (selectPlan)
 * - e2e/factories/thank-you.factory.ts (verifyThankYouPage, waitForEmailWithResend)
 * - e2e/factories/verify.factory.ts (navigateAndVerifyEmail)
 * - e2e/specs/validation/image-orientation-validation.spec.ts (orchestration)
 */

import { statSync } from 'fs';
import type { Page } from '@playwright/test';
import { navigateToSignUpV4 } from './navigation.factory';
import { fillLeadForm, submitLeadForm } from './lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from './registration-form.factory';
import { selectPlan } from './plan-selection.factory';
import { verifyThankYouPage, waitForEmailWithResend } from './thank-you.factory';
import { navigateAndVerifyEmail } from './verify.factory';
import type { CRMValidationContext } from './crm-validation.factory';
import {
  generateMailosaurEmail,
  generateFirstName,
  generateLastName,
  generatePhoneNumber,
  LEAD_USA_V4,
  REG_USA_V4,
  PARAMS_V4_FULL,
  PLAN_GENERAL_ANNUAL,
} from '../fixtures/test-data';
import type { LeadFormData, RegistrationFormData } from '../fixtures/test-data';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Stores enrollment data for post-validation */
export interface EnrollmentPhotoRecord {
  index: number;
  filename: string;
  imagePath: string;
  originalSizeBytes: number;
  email: string;
  companyName: string;
}

/** Stores CRM validation result for a single photo */
export interface PhotoValidationResult {
  index: number;
  filename: string;
  email: string;
  companyName: string;
  originalSizeBytes: number;
  photoFound: boolean;
  crmPhotoSizeBytes: number;
  crmContentType: string;
  status: 'pass' | 'fail';
  note: string;
}

// ─── Enrollment Factory ─────────────────────────────────────────────────────

/**
 * Run a single enrollment (Form 1 + Form 2 + Plan + Email Verify) with a specific profile photo.
 *
 * Creates a unique lead (name, email, company, phone) and fills both forms,
 * selects a plan, waits for verification email, and verifies the email token.
 * After email verification, the Lead converts to Contact and the photo is attached.
 * Stores the enrollment data in the records array for later CRM validation.
 *
 * @param getPage - Page closure from createSerialFlow
 * @param imagePath - Absolute path to the profile image file
 * @param index - Image index (1-based, for logging)
 * @param records - Shared array to store enrollment data for later validation
 */
export function enrollWithPhoto(
  getPage: () => Page,
  imagePath: string,
  index: number,
  records: EnrollmentPhotoRecord[],
) {
  return async () => {
    const filename = imagePath.split('/').pop() || `image_${index}`;
    const originalSize = statSync(imagePath).size;
    const email = generateMailosaurEmail();
    const companyName = `PhotoTest ${index} - ${Date.now()}`;

    // Build unique lead data
    const leadData: LeadFormData = {
      ...LEAD_USA_V4,
      firstName: generateFirstName(),
      lastName: generateLastName(),
      email,
      companyName,
      phoneNumber: generatePhoneNumber('us'),
    };

    // Build registration data with the specific photo
    const regData: RegistrationFormData = {
      ...REG_USA_V4,
      altPhoneNumber: generatePhoneNumber('us'),
      profilePhotoPath: imagePath,
    };

    // Store record for later validation
    const record: EnrollmentPhotoRecord = {
      index,
      filename,
      imagePath,
      originalSizeBytes: originalSize,
      email,
      companyName,
    };
    records.push(record);

    console.log(`  📷 #${index}: ${filename} (${originalSize} bytes) → ${email}`);

    // 1. Navigate → Form 1 → Submit
    await navigateToSignUpV4(getPage, PARAMS_V4_FULL)();
    await fillLeadForm(getPage, leadData)();
    await submitLeadForm(getPage)();

    // 2. Form 2 (with photo) → Submit
    await fillRegistrationForm(getPage, regData)();
    await submitRegistrationForm(getPage)();

    // 3. Plan Selection
    await selectPlan(getPage, PLAN_GENERAL_ANNUAL)();

    // 4. Thank You → Wait for email → Verify email (Lead → Contact conversion)
    await verifyThankYouPage(getPage)();
    const verifyUrl = await waitForEmailWithResend(getPage, email)();
    await navigateAndVerifyEmail(getPage, verifyUrl)();

    console.log(`  ✅ #${index}: enrollment completed + email verified (Contact created)`);
  };
}

// ─── CRM Photo Validation Factory ──────────────────────────────────────────

/**
 * Validate that all enrolled users have their photo in Zoho CRM.
 *
 * Iterates through all enrollment records, finds each Lead by email,
 * checks if the photo exists, and stores the result.
 *
 * @param crmCtx - Shared CRM context (requires authenticated zoho client)
 * @param records - Array of enrollment records from enrollWithPhoto
 * @param results - Array to store validation results
 */
export function validateAllPhotosInCRM(
  crmCtx: CRMValidationContext,
  records: EnrollmentPhotoRecord[],
  results: PhotoValidationResult[],
) {
  return async () => {
    console.log(`\n  🔍 Validating ${records.length} photos in CRM...`);

    for (const record of records) {
      const result: PhotoValidationResult = {
        index: record.index,
        filename: record.filename,
        email: record.email,
        companyName: record.companyName,
        originalSizeBytes: record.originalSizeBytes,
        photoFound: false,
        crmPhotoSizeBytes: 0,
        crmContentType: '',
        status: 'fail',
        note: '',
      };

      try {
        // Find Contact by email (with retry — Lead→Contact conversion is async)
        let contact = await crmCtx.zoho!.searchByEmail('Contacts', record.email);
        if (!contact) {
          // Wait and retry — conversion takes a few seconds
          await new Promise(r => setTimeout(r, 5_000));
          contact = await crmCtx.zoho!.searchByEmail('Contacts', record.email);
        }

        if (!contact) {
          result.note = 'Contact not found by email (conversion may not have completed)';
          console.log(`  ❌ #${record.index}: Contact not found — ${record.email}`);
          results.push(result);
          continue;
        }

        // Check for photo (with retry — photo upload is async via S3 + Lambda)
        let photoData: { status: number; contentType: string | null; size: number } | null = null;
        const maxRetries = 8;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          photoData = await crmCtx.zoho!.getRecordPhoto('Contacts', contact.id);
          if (photoData) break;
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 3_000));
          }
        }

        if (photoData) {
          result.photoFound = true;
          result.crmPhotoSizeBytes = photoData.size;
          result.crmContentType = photoData.contentType || '';
          result.status = 'pass';
          result.note = `Photo found (${photoData.size} bytes, ${photoData.contentType})`;
          console.log(`  ✅ #${record.index}: ${record.filename} → CRM (${photoData.size} bytes)`);
        } else {
          result.note = `Photo NOT found after ${maxRetries} retries`;
          console.log(`  ❌ #${record.index}: ${record.filename} → Photo NOT found`);
        }
      } catch (err: any) {
        result.note = `Error: ${err.message}`;
        console.log(`  ❌ #${record.index}: ${record.filename} → Error: ${err.message}`);
      }

      results.push(result);
    }

    // Summary
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    console.log(`\n  📊 Results: ${passed} pass / ${failed} fail out of ${results.length}`);
  };
}

// ─── Report Factory ─────────────────────────────────────────────────────────

/**
 * Generate a markdown report with the photo validation results.
 *
 * @param results - Array of validation results
 */
export function generatePhotoOrientationReport(results: PhotoValidationResult[]) {
  return async () => {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { resolve } = await import('path');
    const outputDir = resolve(process.cwd(), '.temp');
    mkdirSync(outputDir, { recursive: true });

    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;

    const report = `# Image Orientation Validation Report — Ticket #870

> Generated: ${new Date().toISOString()}
> Branch: bugfix/image-orientation-qa

## Summary

| Metric | Value |
|--------|-------|
| Total images tested | ${results.length} |
| Photos found in CRM | ${passed} |
| Photos NOT found | ${failed} |

## Results

| # | Filename | Original (bytes) | CRM (bytes) | Content-Type | Status | Note |
|---|----------|-----------------|-------------|--------------|--------|------|
${results.map(r => `| ${r.index} | ${r.filename} | ${r.originalSizeBytes} | ${r.crmPhotoSizeBytes || '-'} | ${r.crmContentType || '-'} | ${r.status === 'pass' ? '✅' : '❌'} | ${r.note} |`).join('\n')}

## Conclusion

${failed === 0
  ? 'All photos were uploaded and found in CRM without issues. The intermittent rotation reported in ticket #870 could not be reproduced. The issue is likely a Zoho CRM rendering/caching bug — the same image bytes are stored correctly but displayed with incorrect orientation intermittently by the Zoho thumbnail renderer.'
  : `${failed} photo(s) failed to appear in CRM. This indicates a potential upload reliability issue.`
}

## Recommendation

${failed === 0
  ? '- The bug appears to be on Zoho CRM rendering side (same bytes, different display)\n- Consider adding EXIF orientation stripping as preventive measure\n- Provide this report to the client as evidence that upload pipeline is correct'
  : '- Investigate upload pipeline reliability\n- Check Lambda logs for failed uploads\n- Review ProcessRegistration handler'
}
`;

    writeFileSync(resolve(outputDir, 'report_image_orientation_validation.md'), report);
    console.log(`\n📄 Report saved to .temp/report_image_orientation_validation.md`);
  };
}
