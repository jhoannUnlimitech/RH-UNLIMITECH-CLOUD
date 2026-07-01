/**
 * CSW Form Validation Spec — Field validation and error handling.
 *
 * Validates:
 * - Cannot submit with empty fields
 * - Cannot submit without category
 * - Word count display works
 * - Cancel button returns to list
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToMyRequests,
  navigateToNewCSW,
} from '../../factories/csw.factory';
import { pom } from '../../pom/csw.pom';
import { LOGIN_DEVELOPER } from '../../fixtures/test-data';

// ─── Flow 1: Submit with empty fields shows errors ──────────────────────────

const emptySubmit = createSerialFlow();

emptySubmit.e2e.describe.serial('CSW Validation — Empty Submit', () => {
  emptySubmit.e2e('login and navigate to my-requests',
    loginAndNavigateToMyRequests(emptySubmit.getPage, LOGIN_DEVELOPER));

  emptySubmit.e2e('navigate to new CSW form',
    navigateToNewCSW(emptySubmit.getPage));

  emptySubmit.e2e('click submit without filling fields', async () => {
    const page = emptySubmit.getPage();
    const submitBtn = page.locator(pom.csw_form._.form_actions._.submit_button.$());
    await submitBtn.click();
    // Form should not navigate — still on /csw/new
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/csw/new');
  });

  emptySubmit.e2e('verify error messages appear', async () => {
    const page = emptySubmit.getPage();
    // Category error
    const categoryError = page.locator('text="La categoría es requerida"');
    await expect(categoryError).toBeVisible();
    // Situation error
    const situationError = page.locator('text="La situación es requerida"');
    await expect(situationError).toBeVisible();
    // Information error
    const informationError = page.locator('text="La información es requerida"');
    await expect(informationError).toBeVisible();
    // Solution error
    const solutionError = page.locator('text="La solución es requerida"');
    await expect(solutionError).toBeVisible();
  });
});

// ─── Flow 2: Word count displays correctly ──────────────────────────────────

const wordCount = createSerialFlow();

wordCount.e2e.describe.serial('CSW Validation — Word Count', () => {
  wordCount.e2e('login and navigate to new CSW',
    loginAndNavigateToMyRequests(wordCount.getPage, LOGIN_DEVELOPER));

  wordCount.e2e('navigate to new form',
    navigateToNewCSW(wordCount.getPage));

  wordCount.e2e('type text and verify word count updates', async () => {
    const page = wordCount.getPage();
    // Use direct data-test-key selector (simpler, avoids deep nesting issues)
    const situationTextarea = page.locator('[data-test-key="situation-textarea"]');
    await expect(situationTextarea).toBeVisible({ timeout: 5_000 });
    await situationTextarea.fill('Esta es una prueba de conteo de palabras');
    await page.waitForTimeout(500); // Wait for React state update

    // Verify word count updated (8 words: Esta es una prueba de conteo de palabras)
    const wordCountEl = page.locator('[data-test-key="situation-word-count"]');
    await expect(wordCountEl).toBeVisible({ timeout: 5_000 });
    await expect(wordCountEl).toContainText('8');
    await expect(wordCountEl).toContainText('1000');
  });
});

// ─── Flow 3: Cancel button returns to list ──────────────────────────────────

const cancelFlow = createSerialFlow();

cancelFlow.e2e.describe.serial('CSW Validation — Cancel Returns to List', () => {
  cancelFlow.e2e('login and navigate to new CSW',
    loginAndNavigateToMyRequests(cancelFlow.getPage, LOGIN_DEVELOPER));

  cancelFlow.e2e('navigate to new form',
    navigateToNewCSW(cancelFlow.getPage));

  cancelFlow.e2e('click cancel button', async () => {
    const page = cancelFlow.getPage();
    const cancelBtn = page.locator(pom.csw_form._.form_actions._.cancel_button.$());
    await cancelBtn.click();
    // Should navigate back
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/csw/new');
  });
});
