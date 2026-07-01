/**
 * Email Wording Factory — Validates verification email body content (#893).
 *
 * Intercepts the verification email via Mailosaur API and validates that
 * the HTML body contains the exact wording specified in the Rules Document.
 * Does NOT navigate the browser — uses Mailosaur SDK only.
 *
 * Related files:
 * - infra/functions/EmailDispatch.ts (email template source)
 * - e2e/factories/email-inbox.factory.ts (base Mailosaur interceptor)
 * - e2e/fixtures/mailosaur.ts (Mailosaur SDK helper)
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test email-verification-wording --reporter=list
 */

import { expect } from '@playwright/test';
import { createMailosaur, type MailosaurMessage } from '../fixtures/mailosaur.js';

// ─── Shared state — email captured once, validated by multiple tests ────────

let capturedEmail: MailosaurMessage | null = null;

/** Reset captured email (call at start of each spec run). */
export function resetCapturedEmail(): void {
  capturedEmail = null;
}

// ═════════════════════════════════════════════════════════════════════════════
// Capture — Intercept the verification email via Mailosaur
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Intercepts the verification email and stores it for subsequent validations.
 * Must run after plan selection (email is dispatched post-plan-submit).
 *
 * @param email - The Mailosaur email address used during enrollment
 * @param timeoutMs - Max wait for email arrival (default: 60s)
 */
export function captureVerificationEmail(email: string, timeoutMs = 60_000) {
  return async () => {
    const mailosaur = createMailosaur();
    capturedEmail = await mailosaur.waitForMessage(email, { timeoutMs });
    expect(capturedEmail).not.toBeNull();
    expect(capturedEmail!.subject).toBe('Verify your email — WISE Membership');
    console.log(`  ✅ Verification email captured — Subject: "${capturedEmail!.subject}"`);
    console.log(`     Received: ${capturedEmail!.receivedAt}`);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Validations — Each factory checks one aspect of the email body
// ═════════════════════════════════════════════════════════════════════════════

/** AC-893-01: Email greeting uses the lead's first name. */
export function verifyEmailGreeting(firstName: string) {
  return async () => {
    expect(capturedEmail, 'Email not captured — run captureVerificationEmail first').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain(`Dear ${firstName}`);
    console.log(`  ✅ AC-893-01: Greeting "Dear ${firstName}" present`);
  };
}

/** AC-893-02: Email CTA text — "Please click the button below to verify your email address." */
export function verifyEmailCTA() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('Please click the button below to verify your email address');
    console.log('  ✅ AC-893-02: CTA text present');
  };
}

/** AC-893-03: VERIFY button/link exists and points to /verify?token=. */
export function verifyEmailButton() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    // Button text "VERIFY" in HTML
    expect(html).toContain('VERIFY');
    // Link to /verify?token= — check text links first (not wrapped in tracking)
    // then fall back to HTML links
    const textLinks = capturedEmail!.text.links.map(l => l.href);
    const htmlLinks = capturedEmail!.html.links.map(l => l.href);
    const allLinks = [...textLinks, ...htmlLinks];
    const verifyLink = allLinks.find(l => l.includes('/verify?token='));
    expect(verifyLink, `VERIFY link with /verify?token= not found. Links: ${allLinks.slice(0, 5).join(', ')}`).toBeTruthy();
    console.log(`  ✅ AC-893-03: VERIFY button present → ${verifyLink!.slice(0, 80)}...`);
  };
}

/** AC-893-04: Domain notice — "@membership.wise.org". */
export function verifyEmailDomainNotice() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('@membership.wise.org');
    expect(html).toContain('future emails will be sent from');
    console.log('  ✅ AC-893-04: Domain notice "@membership.wise.org" present');
  };
}

/** AC-893-05: Security tip 1 — "add our email address to your contacts or safe sender list." */
export function verifyEmailSecurityTip1() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('add our email address to your contacts or safe sender list');
    console.log('  ✅ AC-893-05: Security tip 1 (contacts/safe sender) present');
  };
}

/** AC-893-06: Security tip 2 — "verify that messages from us come from the @membership.wise.org domain." */
export function verifyEmailSecurityTip2() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('verify that messages from us come from');
    expect(html).toContain('@membership.wise.org');
    console.log('  ✅ AC-893-06: Security tip 2 (verify domain) present');
  };
}

/** AC-893-07: Security tip 3 — "cautious of emails from similar-looking domains or addresses." */
export function verifyEmailSecurityTip3() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('cautious of emails from similar-looking domains or addresses');
    console.log('  ✅ AC-893-07: Security tip 3 (cautious of similar domains) present');
  };
}

/** AC-893-08: Contact info — "support@membership.wise.org". */
export function verifyEmailContactInfo() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('support@membership.wise.org');
    console.log('  ✅ AC-893-08: Contact email "support@membership.wise.org" present');
  };
}

/** AC-893-09: Sign-off — "Best regards, WISE Membership Support". */
export function verifyEmailSignoff() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const html = capturedEmail!.html.body;
    expect(html).toContain('Best regards');
    expect(html).toContain('WISE Membership Support');
    console.log('  ✅ AC-893-09: Sign-off "Best regards, WISE Membership Support" present');
  };
}

/** AC-893-10: Text version also has the complete content. */
export function verifyEmailTextVersion() {
  return async () => {
    expect(capturedEmail, 'Email not captured').not.toBeNull();
    const text = capturedEmail!.text.body;
    expect(text).toContain('verify your email address');
    expect(text).toContain('@membership.wise.org');
    expect(text).toContain('support@membership.wise.org');
    expect(text).toContain('Best regards');
    expect(text).toContain('WISE Membership Support');
    console.log('  ✅ AC-893-10: Text version contains all key phrases');
  };
}
