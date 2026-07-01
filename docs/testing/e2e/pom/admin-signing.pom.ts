/**
 * Admin Signing POM — Admin agreement signing flow (Zoho Sign external)
 *
 * This flow happens ENTIRELY on Zoho Sign's domain (sign.zoho.com).
 * Per steering test-annotations 10.5, third-party pages do NOT have
 * data-test-* annotations. Selectors are raw CSS/IDs documented here
 * and used via .$(' raw-css') terminal in the factory.
 *
 * Our app's only involvement is the redirect target page (/iframe-signed)
 * which is already covered by agreement-signed.pom.ts.
 *
 * ── Zoho Sign Guest Page (sign.zoho.com/zsguest) ──
 * Third-party — no data-test-* annotations.
 * Raw selectors (used in factory):
 *   - "Proceed to document" button: button#signin-cancel
 *   - Document name: heading level 3 "Document info" section
 *
 * ── Zoho Sign Review Page (sign.zoho.com/zsstateless#/review/) ──
 * Third-party — no data-test-* annotations.
 * Raw selectors (used in factory):
 *   - "Proceed to document" (2nd): button with text "Proceed to document"
 *   - Consent checkbox: input[type="checkbox"] in consent section
 *   - "Agree & Continue": button.zs-btn.zs-btn-primary
 *
 * ── Zoho Sign Document View ──
 * Third-party — no data-test-* annotations.
 * Raw selectors (used in factory):
 *   - Signature field: div.zs-signature-field
 *   - OK button (modal): button.btn.btn-primary
 *   - Finish button: button#Finish
 *   - Completion text: "You have signed this document"
 *
 * ── Our App: /iframe-signed ──
 * Covered by agreement-signed.pom.ts (reused).
 * The admin signing redirect goes to this page after Zoho completes.
 *
 * Usage in factory:
 *   // All Zoho selectors are raw strings in the factory (no POM proxy)
 *   const zohoSel = {
 *     proceedBtn: 'button#signin-cancel',
 *     agreeBtn: 'button.zs-btn.zs-btn-primary',
 *     signatureField: 'div.zs-signature-field',
 *     okBtn: 'button.btn.btn-primary',
 *     finishBtn: 'button#Finish',
 *   };
 *
 * NOTE: This POM file exists for documentation purposes only.
 * It does NOT export a createPom() schema because there are no
 * data-test-* elements to map. The factory uses raw selectors directly.
 */

// No POM schema exported — all interactions are on third-party domain.
// This file serves as documentation of the selectors used in the factory.

export const ZOHO_SIGN_ADMIN_SELECTORS = {
  /** Guest page — first "Proceed to document" button */
  guestProceedBtn: 'button#signin-cancel',

  /** Disclosure modal — "Agree" button (appears as overlay after Proceed) */
  agreeBtn: 'button.zs-btn.zs-btn-primary.btn-large',

  /** Review page — "Agree & Continue" button (fallback if no modal) */
  agreeAndContinueBtn: 'button.zs-btn.zs-btn-primary',

  /** Document view — signature field holder (clickable) */
  signatureHolder: 'div.zs-signature-holder',

  /** Document view — signature field container */
  signatureField: 'div.field-content.zs-signature-field',

  /** Signature modal — OK/confirm button */
  signatureOkBtn: 'button.btn.btn-primary',

  /** Document view — Finish button (completes signing) */
  finishBtn: 'button#finish-btn',

  /** Completion — confirmation text */
  completionText: 'You have signed this document',
} as const;
