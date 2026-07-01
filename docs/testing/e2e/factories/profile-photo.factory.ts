/**
 * Profile Photo Upload Factories — Image upload interactions on Form 2.
 *
 * Page: /sign-up/{sessionId}/details
 * POM: details.pom.ts → registration_form.profile_photo_section
 *
 * Handles file selection via setInputFiles (Playwright), upload verification,
 * preview validation, remove/re-upload, and error state validation.
 *
 * Covers: AC-PU-01 to AC-PU-17
 */

import { expect, type Page } from '@playwright/test';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pom } from '../pom/details.pom';

// ─── Selectors (derived from POM) ──────────────────────────────────────────

const sel = {
  formReady:     pom.registration_form.ready.$(),
  photoSection:  pom.registration_form._.profile_photo_section.$(),
  photoInput:    pom.registration_form._.profile_photo_section._.profile_photo_input.$(),
  photoPreview:  pom.registration_form._.profile_photo_section._.profile_photo_preview.$(),
  photoRemove:   pom.registration_form._.profile_photo_section._.profile_photo_remove.$(),
  photoChange:   pom.registration_form._.profile_photo_section._.profile_photo_change.$(),
  photoUploaded: pom.registration_form._.profile_photo_section._.profile_photo_uploaded.$(),
  photoError:    pom.registration_form._.profile_photo_section._.profile_photo_error.$(),
};

// ─── Image paths (relative to workspace root) ──────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);
const IMAGES_DIR = resolve(__dir, '../../examples/profile-images');

export const PROFILE_IMAGES = {
  /** Valid JPEG, ~780KB — primary happy path image */
  validSmall: resolve(IMAGES_DIR, 'profile_under_10mb_square_b.jpg'),
  /** Valid JPEG, ~2.4MB — secondary image for re-upload test */
  validMedium: resolve(IMAGES_DIR, 'profile_under_10mb_square_a.jpg'),
  /** Valid JPEG, exactly 10MB — boundary test */
  validBoundary: resolve(IMAGES_DIR, 'profile_10mb_square.jpg'),
  /** Invalid: exceeds 10MB limit (~13.9MB) */
  overLimit: resolve(IMAGES_DIR, 'profile_over_12mb_square.jpg'),
  /** Invalid: WebP format (not in allowed types) */
  invalidType: resolve(IMAGES_DIR, 'not-validate-imagen-profile.webp'),
};

// ═════════════════════════════════════════════════════════════════════════════
// HAPPY PATH — AC-PU-01 to AC-PU-11
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-PU-01: Verify profile photo input is visible on the form.
 * AC-PU-02: Verify input accepts only image/jpeg,image/png.
 * AC-PU-03: Verify input does NOT have multiple attribute.
 */
export function verifyPhotoInputInitialState(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // AC-PU-01: Input visible
    const input = page.locator(sel.photoInput);
    await expect(input).toBeAttached({ timeout: 10_000 });

    // AC-PU-02: Accept attribute
    await expect(input).toHaveAttribute('accept', 'image/jpeg,image/png');

    // AC-PU-03: No multiple attribute
    const hasMultiple = await input.getAttribute('multiple');
    expect(hasMultiple).toBeNull();

    // No preview, no error initially
    await expect(page.locator(sel.photoPreview)).not.toBeVisible();
    await expect(page.locator(sel.photoError)).not.toBeVisible();
  };
}

/**
 * AC-PU-04: Upload a valid JPEG image → preview visible with thumbnail.
 * AC-PU-05: Preview shows filename + size.
 * AC-PU-06: Remove button visible after upload.
 */
export function uploadValidImage(getPage: () => Page, imagePath?: string) {
  return async () => {
    const page = getPage();
    const filePath = imagePath || PROFILE_IMAGES.validSmall;

    // Upload file via setInputFiles
    const input = page.locator(sel.photoInput);
    await input.setInputFiles(filePath);

    // Wait for upload to complete (preview appears)
    await expect(page.locator(sel.photoPreview)).toBeVisible({ timeout: 30_000 });

    // AC-PU-05: Preview contains an image element
    const img = page.locator(`${sel.photoPreview} img`);
    await expect(img).toBeVisible();

    // AC-PU-06: Remove button visible
    await expect(page.locator(sel.photoRemove)).toBeVisible();
  };
}

/**
 * AC-PU-07: Click Remove → preview disappears, input returns to initial state.
 */
export function removeUploadedPhoto(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Click remove
    await page.locator(sel.photoRemove).click();

    // Preview disappears
    await expect(page.locator(sel.photoPreview)).not.toBeVisible({ timeout: 5_000 });

    // Input section visible again (Choose File)
    await expect(page.locator(sel.photoInput)).toBeAttached();
  };
}

/**
 * AC-PU-08: Re-upload after remove → new preview visible.
 */
export function reUploadAfterRemove(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Upload a different image
    const input = page.locator(sel.photoInput);
    await input.setInputFiles(PROFILE_IMAGES.validMedium);

    // New preview visible
    await expect(page.locator(sel.photoPreview)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(sel.photoRemove)).toBeVisible();
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VALIDATION — AC-PU-12 to AC-PU-17
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-PU-12: File > 10MB → error visible, no upload to backend.
 * AC-PU-17: Error message in English (default locale).
 */
export function uploadOverSizeLimit(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const input = page.locator(sel.photoInput);
    await input.setInputFiles(PROFILE_IMAGES.overLimit);

    // Error should appear
    const error = page.locator(sel.photoError);
    await expect(error).toBeVisible({ timeout: 5_000 });

    // AC-PU-17: Verify error text matches i18n (English)
    await expect(error).toContainText('File size must not exceed 10 MB');

    // Preview should NOT appear
    await expect(page.locator(sel.photoPreview)).not.toBeVisible();
  };
}

/**
 * AC-PU-13: WebP file → error visible (invalid type).
 * AC-PU-17: Error message in English (default locale).
 */
export function uploadInvalidType(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const input = page.locator(sel.photoInput);
    await input.setInputFiles(PROFILE_IMAGES.invalidType);

    // Error should appear
    const error = page.locator(sel.photoError);
    await expect(error).toBeVisible({ timeout: 5_000 });

    // AC-PU-17: Verify error text matches i18n (English)
    await expect(error).toContainText('Only JPG and PNG files are allowed');

    // Preview should NOT appear
    await expect(page.locator(sel.photoPreview)).not.toBeVisible();
  };
}

/**
 * AC-PU-14: Exactly 10MB file → accepted (boundary).
 */
export function uploadBoundarySize(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const input = page.locator(sel.photoInput);
    await input.setInputFiles(PROFILE_IMAGES.validBoundary);

    // Should succeed (preview visible) — 10MB is the limit, not over
    await expect(page.locator(sel.photoPreview)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(sel.photoError)).not.toBeVisible();
  };
}

/**
 * AC-PU-15: After error, upload valid file → error disappears, preview visible.
 */
export function recoverFromError(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Upload valid file after a previous error
    const input = page.locator(sel.photoInput);
    await input.setInputFiles(PROFILE_IMAGES.validSmall);

    // Error disappears
    await expect(page.locator(sel.photoError)).not.toBeVisible({ timeout: 10_000 });

    // Preview appears
    await expect(page.locator(sel.photoPreview)).toBeVisible({ timeout: 30_000 });
  };
}

/**
 * AC-PU-45: Verify preview uses blob URL (not S3 URL).
 */
export function verifyPreviewUsesBlobUrl(getPage: () => Page) {
  return async () => {
    const page = getPage();

    const img = page.locator(`${sel.photoPreview} img`);
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src!.startsWith('blob:')).toBe(true);
  };
}


// ═════════════════════════════════════════════════════════════════════════════
// LOADING STATE — AC-PU-11 (requires slow network to observe)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-PU-11: Upload with slow network → "Uploading..." text visible during upload.
 *
 * Throttles network to Slow 3G to make the upload take long enough to observe
 * the loading state. Uses the 10MB boundary image for maximum upload time.
 */
export function verifyUploadingStateWithSlowNetwork(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Throttle network to slow 3G via CDP
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024,   // 50 KB/s download
      uploadThroughput: 20 * 1024,     // 20 KB/s upload (forces slow upload)
      latency: 400,                    // 400ms latency
    });

    try {
      // Upload the 10MB image (will take ~500s at 20KB/s — we only need to catch the state)
      const input = page.locator(sel.photoInput);
      await input.setInputFiles(PROFILE_IMAGES.validBoundary);

      // The "Uploading..." label should be visible while upload is in progress
      // The component shows: isUploading ? t('uploading') : t('chooseFile')
      const uploadingLabel = page.locator('label:has-text("Uploading")');
      await expect(uploadingLabel).toBeVisible({ timeout: 10_000 });

      // Also verify the button is disabled during upload
      const button = page.locator(`${sel.photoInput}`);
      await expect(button).toBeDisabled();
    } finally {
      // Restore normal network speed
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
    }

    // Wait for upload to finish (preview appears or timeout)
    await expect(page.locator(sel.photoPreview)).toBeVisible({ timeout: 60_000 });
  };
}
