/**
 * Agreement Factories — Reusable test steps for the agreement signing flow.
 *
 * Covers: paid page → agreement page → Zoho Sign iframe → completed page.
 * Based on curated playbooks:
 *   - agreement-flow.md (dual signer — admin + client)
 *   - agreement-signing-single.md (single signer — client only)
 *
 * Two signing variants:
 *   signAgreement()             — Dual signer: Start → Terms → Add signature → name/initials → Accept → Finish
 *   signAgreementSingleSigner() — Single signer: Terms → name/initials → preview → OK → Finish
 *
 * NOTE: Zoho Sign is an external iframe. Selectors use a11y labels
 * (getByRole, getByLabel) and are locale-dependent.
 */

import { expect, type Page } from '@playwright/test';
import { pom as agreementPom } from '../pom/agreement.pom';
import { ZOHO_SIGN_LABELS_ES, type ZohoSignLabels, type ZohoSignSingleSignerLabels, ZOHO_SIGN_SINGLE_EN } from '../fixtures/test-data';

// ─── Selectors (our app — from POM) ─────────────────────────────────────────

const agreementSel = {
  pageReady:       agreementPom.agreement_page.ready.$(),
  signingIframe:   agreementPom.agreement_page._.signing_iframe.$(),
};

// Re-export continueToAgreement from paid.factory (R1: action happens on paid page)
export { continueToAgreement } from './paid.factory';

// ─── Factories ──────────────────────────────────────────────────────────────

/**
 * Wait for the agreement page to load (polling phase), then interact with
 * the Zoho Sign iframe to sign the document, and wait for redirect to /completed.
 *
 * @param signerName - Full name for the signature (e.g. "Manuel Lara")
 * @param signerInitials - Initials for the signature (e.g. "ML")
 * @param labels - Zoho Sign button/field labels (locale-dependent, defaults to Spanish)
 */
export function signAgreement(getPage: () => Page, signerName: string, signerInitials: string, labels: ZohoSignLabels = ZOHO_SIGN_LABELS_ES) {
  return async () => {
    const page = getPage();

    // ── Wait for agreement page to finish loading (Phase 1 polling) ──
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });

    // Verify iframe is present with Zoho Sign src
    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // ── Interact with Zoho Sign iframe ──
    const frame = page.frameLocator(agreementSel.signingIframe);

    // Step 1: Click "Start signing" (locale-dependent)
    await frame.getByRole('button', { name: labels.startSigning }).click({ timeout: 45_000 });

    // Step 2: Accept Terms & Conditions modal → click "Agree"
    await frame.getByRole('button', { name: labels.acceptTerms }).click({ timeout: 15_000 });

    // Step 3: Click "Start" button if it appears (sometimes skipped after Terms)
    const startBtnVisible = await frame.getByRole('button', { name: 'Start' })
      .isVisible({ timeout: 5_000 }).catch(() => false);
    if (startBtnVisible) {
      await frame.getByRole('button', { name: 'Start' }).click();
    }

    // Step 4: Loop — Add signature → (Ok if modal) → Check → repeat until Finish
    // First "Add signature" opens modal with name/initials. Subsequent ones apply directly.
    // After each signature, "Check" navigates to next field. "Finish" appears when all done.
    let firstSignature = true;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1_500);

      // Check if "Finish" is available — all fields signed
      const finishVisible = await frame.getByRole('button', { name: labels.finalize })
        .isVisible().catch(() => false);
      if (finishVisible) break;

      // Try clicking "Add signature" if visible
      const addSigVisible = await frame.getByRole('button', { name: labels.addSignature })
        .isVisible().catch(() => false);
      if (addSigVisible) {
        await frame.getByRole('button', { name: labels.addSignature }).click();
        await page.waitForTimeout(1_000);

        // First time: modal opens with name/initials inputs → fill and click Ok
        if (firstSignature) {
          const nameInput = frame.getByLabel(labels.signatureLabel);
          const nameVisible = await nameInput.isVisible({ timeout: 3_000 }).catch(() => false);
          if (nameVisible) {
            await nameInput.clear();
            await nameInput.fill(signerName);
            const initialsInput = frame.getByLabel(labels.initialsLabel);
            await initialsInput.clear();
            await initialsInput.fill(signerInitials);
            await frame.getByRole('button', { name: 'Ok' }).click({ timeout: 5_000 });
            firstSignature = false;
          }
        }
        await page.waitForTimeout(1_500);
        continue;
      }

      // Try clicking "Check" to navigate to next unsigned field
      const checkVisible = await frame.getByRole('button', { name: 'Check' })
        .isVisible().catch(() => false);
      if (checkVisible) {
        await frame.getByRole('button', { name: 'Check' }).click();
        await page.waitForTimeout(1_500);
      }
    }

    // Step 5: Click "Finish" to complete the document
    await frame.getByRole('button', { name: labels.finalize }).click({ timeout: 15_000 });

    // ── Wait for polling to detect signed status and redirect ──
    await page.waitForURL(/\/agreement-signed/, { timeout: 90_000 });
  };
}


/**
 * Sign agreement — SINGLE SIGNER variant (client only, no admin signature).
 *
 * Playbook: e2e/playbooks/agreement-signing-single.md
 * Source: Jam 38a83a86-b933-4759-a22e-e5a65564418a
 *
 * Flow: Start signing → Agree (Terms) → name/initials → select preview → Ok → Finish
 *
 * @param signerName - Full name for the signature (e.g. "Manuel Lara")
 * @param signerInitials - Initials for the signature (e.g. "ML")
 * @param labels - Zoho Sign button/field labels (locale-dependent, defaults to English)
 */
export function signAgreementSingleSigner(getPage: () => Page, signerName: string, signerInitials: string, labels: ZohoSignSingleSignerLabels = ZOHO_SIGN_SINGLE_EN) {
  return async () => {
    const page = getPage();

    // ── Wait for agreement page to finish loading (Phase 1 polling) ──
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });

    // Verify iframe is present with Zoho Sign src
    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // ── Interact with Zoho Sign iframe ──
    const frame = page.frameLocator(agreementSel.signingIframe);

    // Step 1: Click "Start signing" — waits for document to render inside iframe
    await frame.getByRole('button', { name: 'Start signing' }).click({ timeout: 30_000 });

    // Step 2: Accept Terms & Conditions
    await frame.getByRole('button', { name: labels.acceptTerms }).click({ timeout: 10_000 });

    // Step 3: Fill signature name (fields appear directly after Terms — no "Add signature" step)
    const nameInput = frame.getByLabel(labels.signatureLabel);
    await nameInput.clear();
    await nameInput.fill(signerName);

    // Step 4: Fill initials
    const initialsInput = frame.getByLabel(labels.initialsLabel);
    await initialsInput.clear();
    await initialsInput.fill(signerInitials);

    // Step 5: Confirm signature (Ok — after preview auto-selection)
    await frame.getByRole('button', { name: labels.confirmSignature }).click({ timeout: 10_000 });

    // Step 6: Finalize the document
    await frame.getByRole('button', { name: labels.finalize }).click({ timeout: 10_000 });

    // ── Wait for polling to detect signed status and redirect ──
    await page.waitForURL(/\/agreement-signed/, { timeout: 60_000 });
  };
}

/**
 * Sign agreement — MULTIPLE SIGNERS variant (document with multiple signature fields).
 *
 * Playbook: e2e/playbooks/agreement-signing-multiple.md
 * Source: Jam ede404f6-ce50-4ad1-b06e-bb3fa77a6e9a
 *
 * Flow: Start signing → Terms → Add signature → name/initials → Accept
 *       → click each remaining signature field in document → Finalize
 *
 * After accepting the signature, the document shows multiple clickable "Signature"
 * placeholders. Each must be clicked to apply the signature. The number of fields
 * depends on the template.
 *
 * @param signerName - Full name for the signature (e.g. "Manuel Lara")
 * @param signerInitials - Initials for the signature (e.g. "ML")
 * @param labels - Zoho Sign button/field labels (locale-dependent, defaults to Spanish)
 */
export function signAgreementMultipleSigners(getPage: () => Page, signerName: string, signerInitials: string, labels: ZohoSignLabels = ZOHO_SIGN_LABELS_ES) {
  return async () => {
    const page = getPage();

    // ── Wait for agreement page to finish loading (Phase 1 polling) ──
    await page.waitForSelector(agreementSel.pageReady, { timeout: 90_000 });

    // Verify iframe is present with Zoho Sign src (backoff: 5 attempts x 3s)
    const iframe = page.locator(agreementSel.signingIframe);
    let iframeVisible = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      iframeVisible = await iframe.isVisible().catch(() => false);
      if (iframeVisible) break;
      await page.waitForTimeout(3_000);
    }
    if (!iframeVisible) {
      await expect(iframe).toBeVisible({ timeout: 15_000 });
    }

    const frame = page.frameLocator(agreementSel.signingIframe);

    // ═══════════════════════════════════════════════════════════════════
    // Zoho Sign iframe interaction — All buttons identified by stable IDs
    // (NOT by text labels — text changes with locale/template version)
    //
    // Stable IDs confirmed via Jam d9f3031e + Chrome MCP analysis:
    //   #mob-agree-btn    → "Start signing" / "Start" / "Comenzar a firmar"
    //   #fillin-action-btn → "Add signature" / "Check" (toggles per state)
    //   #select-sign      → "Ok" (confirm signature selection)
    // ═══════════════════════════════════════════════════════════════════

    // Step 1: Click Start (#mob-agree-btn or #startButton — Zoho uses different IDs across versions)
    // Zoho Sign's branding footer (position:fixed) overlaps this button.
    // Use evaluate() to dispatch click directly on the DOM element.
    // Wait extra for Zoho Sign iframe to fully initialize its event handlers.
    const startBtn = frame.locator('#mob-agree-btn, #startButton');
    await startBtn.first().waitFor({ state: 'visible', timeout: 30_000 });
    await page.waitForTimeout(2_000);
    await startBtn.first().evaluate((el) => (el as HTMLElement).click());

    // Step 2: Accept Terms & Conditions (modal "Agree" button — no ID, use text label)
    // After Start, a Terms modal appears with "Agree" button (no stable ID available).
    // Give Zoho time to render the Terms modal after Start click.
    await page.waitForTimeout(3_000);
    const agreeBtn = frame.getByRole('button', { name: labels.acceptTerms });
    await agreeBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await agreeBtn.evaluate((el) => (el as HTMLElement).click());

    // Step 3: Click #fillin-action-btn to open the signature input panel
    // After Agree, Zoho navigates to the first signature field in the document.
    // The #fillin-action-btn must be clicked to open the signature name/initials modal.
    await page.waitForTimeout(2_000);
    const fillinBtn = frame.locator('#fillin-action-btn');
    await fillinBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await fillinBtn.evaluate((el) => (el as HTMLElement).click());

    // Step 4: Fill signature name
    const nameInput = frame.getByLabel(labels.signatureLabel);
    await nameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await nameInput.clear();
    await nameInput.fill(signerName);

    // Step 4: Fill initials
    const initialsInput = frame.getByLabel(labels.initialsLabel);
    await initialsInput.clear();
    await initialsInput.fill(signerInitials);

    // Step 5: Confirm signature (#select-sign → "Ok")
    const selectSignBtn = frame.locator('#select-sign');
    await selectSignBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await selectSignBtn.evaluate((el) => (el as HTMLElement).click());

    // Step 6: Sign all remaining fields using #fillin-action-btn
    // After confirming, #fillin-action-btn applies signature to each field.
    // Loop clicks it until all fields are signed → "Finish" appears or URL changes.
    let signatureFieldsSigned = 1; // First signature already applied in step 5 (Ok)

    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1_500);

      // Exit: page navigated to agreement-signed
      const currentUrl = page.url();
      if (currentUrl.includes('/agreement-signed')) break;

      // Exit: Finish button appeared (all fields signed)
      try {
        const finishBtn = frame.getByRole('button', { name: labels.finalize });
        const finishVisible = await finishBtn.isVisible();
        if (finishVisible) {
          const modalBlocking = await frame.locator('.modal-dim').isVisible().catch(() => false);
          if (!modalBlocking) break;
        }
      } catch { /* not visible */ }

      // Click #fillin-action-btn — applies signature to current field
      try {
        const actionBtn = frame.locator('#fillin-action-btn');
        const actionVisible = await actionBtn.isVisible().catch(() => false);
        if (actionVisible) {
          await actionBtn.evaluate((el) => (el as HTMLElement).click());
          signatureFieldsSigned++;
          console.log(`   📝 Signature field #${signatureFieldsSigned} signed`);
          await page.waitForTimeout(1_000);
        }
      } catch { /* not found */ }
    }

    // Wait for any modal overlay to disappear before clicking Finish
    await page.waitForTimeout(1_500);

    // Step 8: Finalize the document
    // After all fields are signed, "Finish" button appears. Click it to submit.
    // If "Finish" is not found (e.g. the last "Check" click already submitted), check URL.
    const currentUrlAfterLoop = page.url();
    if (!currentUrlAfterLoop.includes('/agreement-signed')) {
      const finishBtn = frame.getByRole('button', { name: labels.finalize });
      const finishExists = await finishBtn.isVisible({ timeout: 10_000 }).catch(() => false);

      if (finishExists) {
        await frame.locator('.modal-dim').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
        await page.waitForTimeout(500);
        await finishBtn.evaluate((el) => (el as HTMLElement).click());
      } else {
        // Fallback: click #fillin-action-btn one more time (may be "Finish" with different label)
        const actionBtn = frame.locator('#fillin-action-btn');
        const actionExists = await actionBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        if (actionExists) {
          await actionBtn.evaluate((el) => (el as HTMLElement).click());
        }
      }
    }

    // ── Wait for polling to detect signed status and redirect ──
    console.log(`   📝 Total signature fields signed: ${signatureFieldsSigned}`);
    await page.waitForURL(/\/agreement-signed/, { timeout: 90_000 });

    return { signatureFieldsSigned };
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// NATIVE TEMPLATE — New Zoho Sign template format (May 2026)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sign agreement — NATIVE TEMPLATE variant (new Zoho Sign format).
 *
 * Source: Jam 1f63f04a-79fe-4443-a555-1418eceaea38
 *
 * The new template has pre-filled form fields (Name, Company, Address, etc.)
 * and a simplified signing flow:
 *   1. Scroll to "Add signature" button at the bottom
 *   2. Click "Add signature" → modal with Signature + Initial inputs
 *   3. Fill signature name and initials
 *   4. Click "Ok" → modal closes, signature applied
 *   5. Click button#check → document submitted, redirects to Stripe checkout
 *
 * Key differences from old template:
 *   - No "Start signing" step
 *   - No Terms & Conditions checkbox
 *   - No "Finish" button — uses "Check" (button#check)
 *   - Redirects directly to Stripe checkout (no /agreement-signed intermediate)
 *
 * @param signerName - Full name for the signature (e.g. "Manuel Lara")
 * @param signerInitials - Initials for the signature (e.g. "ML")
 */
export function signAgreementNativeTemplate(getPage: () => Page, signerName: string, signerInitials: string) {
  return async () => {
    const page = getPage();

    // ── Wait for agreement page to finish loading (Phase 1 polling) ──
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });

    // Verify iframe is present
    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).toBeVisible({ timeout: 30_000 });

    const frame = page.frameLocator(agreementSel.signingIframe);

    // Step 1: Wait for "Add signature" button to appear (scroll may be needed)
    const addSignatureBtn = frame.locator('button:has-text("Add signature")');
    await expect(addSignatureBtn).toBeVisible({ timeout: 30_000 });

    // Step 2: Click "Add signature" → modal opens
    await addSignatureBtn.click();

    // Step 3: Fill signature name
    const signatureInput = frame.locator('input[placeholder="Signature"]');
    await expect(signatureInput).toBeVisible({ timeout: 5_000 });
    await signatureInput.fill(signerName);

    // Step 4: Fill initials
    const initialInput = frame.locator('input[placeholder="Initial"]');
    await initialInput.fill(signerInitials);

    // Step 5: Click "Ok" → modal closes, signature applied to document
    const okBtn = frame.locator('button:has-text("Ok")');
    await okBtn.click();

    // Step 6: Wait for "Check" button and click → submits document
    const checkBtn = frame.locator('button#check');
    await expect(checkBtn).toBeVisible({ timeout: 10_000 });
    await checkBtn.click();

    // Step 7: Wait for redirect to Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION — Agreement page state verification
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AC-20d — Verify agreement page persists after reload.
 *
 * While on /agreement with the Zoho Sign iframe loaded, reloads the page
 * and verifies the iframe loads again. The backend generates a new embed
 * token on each call to GetAgreement.
 *
 * Pre-condition: Browser must already be on /agreement with iframe visible.
 * Use in serial flows between navigating to agreement and signing.
 */
export function verifyAgreementReloadPersistence(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Verify iframe is currently visible
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });
    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // Reload the page
    await page.reload();

    // Verify iframe loads again after reload (new token from backend)
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // Verify iframe src points to Zoho Sign
    const src = await iframe.getAttribute('src');
    expect(src).toContain('sign.zoho.com');
  };
}

/**
 * AC-20a — Verify agreement page loading state.
 *
 * Navigates to /agreement with a paid session. Intercepts GET /agreement/*
 * to return ready=false, forcing the loading state with spinner and message.
 */
export function verifyAgreementLoadingState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Intercept session endpoint to simulate valid session in email_verified state
    await page.route('**/enrollment/session/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId, status: 'email_verified', hasLead: true, hasRegistration: true,
          hasCheckout: false, hasAgreement: false, expired: false,
          planSelection: { cname: 'general', country: 'USA', interval: 'year', resolved: true },
        }),
      });
    });

    // Intercept agreement endpoint to simulate document not ready yet
    await page.route('**/enrollment/agreement/**', route => {
      if (route.request().url().includes('checkOnly') || route.request().url().includes('signed')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ sessionId, ready: false, status: 'pending' }),
        });
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessionId, ready: false, status: 'pending' }),
      });
    });

    await page.goto(`${baseURL}/sign-up/${sessionId}/agreement`);

    // Verify loading state
    const loadingSel = agreementPom.agreement_page.loading.$();
    await page.waitForSelector(loadingSel, { timeout: 10_000 });

    const loadingMsg = page.locator(agreementPom.agreement_page._.loading_message.$());
    await expect(loadingMsg).toBeVisible();
    await expect(loadingMsg).not.toBeEmpty();

    // Iframe should NOT be visible during loading
    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).not.toBeVisible();

    // Cleanup interceptors
    await page.unroute('**/enrollment/agreement/**');
    await page.unroute('**/enrollment/session/**');
  };
}

/**
 * AC-20b — Verify agreement page ready state with iframe.
 *
 * Navigates to /agreement with a paid session. Verifies that the page
 * transitions to ready state with title, subtitle, signing container,
 * and iframe pointing to sign.zoho.com.
 */
export function verifyAgreementReadyState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    await page.goto(`${baseURL}/sign-up/${sessionId}/agreement`);
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });

    // Verify title and subtitle
    const title = page.locator(agreementPom.agreement_page._.page_title.$());
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();

    const subtitle = page.locator(agreementPom.agreement_page._.page_subtitle.$());
    await expect(subtitle).toBeVisible();

    // Verify signing container and iframe
    const container = page.locator(agreementPom.agreement_page._.signing_container.$());
    await expect(container).toBeVisible();

    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).toBeVisible();

    // Verify iframe src points to Zoho Sign
    const src = await iframe.getAttribute('src');
    expect(src).toContain('sign.zoho.com');
  };
}

/**
 * AC-20c — Verify agreement page error state.
 *
 * Intercepts GET /agreement/* to simulate a network error,
 * forcing the error state with error message.
 */
export function verifyAgreementErrorState(getPage: () => Page, sessionId: string) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Intercept session endpoint to simulate valid session
    await page.route('**/enrollment/session/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId, status: 'email_verified', hasLead: true, hasRegistration: true,
          hasCheckout: false, hasAgreement: false, expired: false,
          planSelection: { cname: 'general', country: 'USA', interval: 'year', resolved: true },
        }),
      });
    });

    // Intercept agreement endpoint to simulate error
    await page.route('**/enrollment/agreement/**', route => route.abort('internetdisconnected'));

    await page.goto(`${baseURL}/sign-up/${sessionId}/agreement`);

    // Verify error state
    const errorSel = agreementPom.agreement_page.error.$();
    await page.waitForSelector(errorSel, { timeout: 15_000 });

    const errorMsg = page.locator(agreementPom.agreement_page._.error_message.$());
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).not.toBeEmpty();

    // Iframe should NOT be visible in error state
    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).not.toBeVisible();

    // Cleanup
    await page.unroute('**/enrollment/agreement/**');
    await page.unroute('**/enrollment/session/**');
  };
}

/**
 * AC-21 — Verify Zoho Sign token expiration handling.
 *
 * Zoho Sign embed tokens expire after 2 minutes. This test:
 * 1. Navigates to /agreement and waits for the iframe to load (ready state)
 * 2. Captures the initial iframe src (contains the embed token)
 * 3. Waits 160 seconds (>2 minutes) without interacting with the iframe
 * 4. Reloads the page to trigger a new token generation
 * 5. Verifies the iframe loads again with a new signing URL (new token)
 *
 * The AgreementPage does NOT have built-in auto-refresh for expired tokens.
 * The recovery path is: user reloads → Phase 1 polling restarts → backend
 * generates a new embed token via GetAgreement controller → new iframe loads.
 *
 * @param waitMs - Time to wait for token expiration (default: 160_000ms = 2m40s)
 */
export function verifyTokenExpiration(getPage: () => Page, sessionId: string, waitMs = 160_000) {
  return async () => {
    const page = getPage();
    const baseURL = process.env.BASE_URL || 'https://localhost:9010';

    // Step 1: Navigate and wait for iframe to load
    await page.goto(`${baseURL}/sign-up/${sessionId}/agreement`);
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });

    const iframe = page.locator(agreementSel.signingIframe);
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // Step 2: Capture initial iframe src (contains embed token)
    const initialSrc = await iframe.getAttribute('src');
    expect(initialSrc).toContain('sign.zoho.com');

    // Step 3: Wait for token to expire (>2 minutes)
    // Using page.waitForTimeout which is Playwright's built-in wait
    await page.waitForTimeout(waitMs);

    // Step 4: Reload the page — this triggers Phase 1 polling again
    // The backend generates a new embed token via GetAgreement controller
    await page.reload();
    await page.waitForSelector(agreementSel.pageReady, { timeout: 60_000 });

    // Step 5: Verify iframe loads again with a new token
    await expect(iframe).toBeVisible({ timeout: 10_000 });
    const newSrc = await iframe.getAttribute('src');
    expect(newSrc).toContain('sign.zoho.com');

    // The new src should be different from the initial one (new token)
    // Zoho Sign URLs contain unique token parameters that change on each request
    expect(newSrc).not.toEqual(initialSrc);
  };
}
