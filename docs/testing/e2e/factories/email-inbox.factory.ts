/**
 * Email Inbox Factories — Verify emails arrived in Mailosaur inbox.
 *
 * These factories validate that the backend sent the expected emails
 * during the enrollment flow. They use the Mailosaur SDK to check
 * the inbox without navigating the browser.
 *
 * Acceptance Criteria covered:
 *   AC-44a: Email arrives within 60s
 *   AC-44b: Subject is recognizable, no unresolved placeholders
 *   AC-44c: Sender is a valid corporate address
 *   AC-44f: Body contains continuation link
 *   AC-44g: No internal/unauthorized links
 *   AC-44h: HTML and text versions present
 *   AC-19a: Link contains session-id
 */

import { expect } from '@playwright/test';
import { createMailosaur, type MailosaurMessage } from '../fixtures/mailosaur';

// ─── Constants ──────────────────────────────────────────────────────────────

const EXPECTED_SENDER = 'noreply@membership.wise.org';
const FORBIDDEN_PATHS = ['/admin', '/api/', '/internal'];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract all links from both text and HTML versions of the email. */
function allLinks(msg: MailosaurMessage): string[] {
  return [
    ...(msg.text?.links ?? []).map(l => l.href),
    ...(msg.html?.links ?? []).map(l => l.href),
  ].filter(Boolean);
}

/** Extract direct links (not Elastic Email tracking) from text version. */
function directLinks(msg: MailosaurMessage): string[] {
  return (msg.text?.links ?? [])
    .map(l => l.href)
    .filter(href => href && !href.includes('mailing.unlimitech.cloud'));
}

// ═════════════════════════════════════════════════════════════════════════════
// VERIFICATION EMAIL — Sent after registration submit
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-44a, AC-44b, AC-44c, AC-44f, AC-44g, AC-44h, AC-19a
 * Validate the verification email content and metadata.
 *
 * Waits for the email, then asserts:
 *   - Subject matches expected pattern
 *   - Sender is corporate address
 *   - HTML and text body present
 *   - Contains verification link with session-id and token
 *   - No forbidden internal links
 *
 * @param email - The Mailosaur email address used during registration
 */
export function verifyVerificationEmailContent(email: string) {
  return async () => {
    const mailosaur = createMailosaur();
    const msg = await mailosaur.waitForMessage(email, { timeoutMs: 30_000 });

    // AC-44b: Subject is recognizable
    expect(msg.subject).toBe('Verify your email — WISE Membership');
    expect(msg.subject).not.toContain('{{');

    // AC-44c: Sender is corporate address
    expect(msg.from.length).toBeGreaterThan(0);
    expect(msg.from[0].email).toBe(EXPECTED_SENDER);

    // AC-44h: HTML and text versions present
    expect(msg.html.body.length).toBeGreaterThan(0);
    expect(msg.text.body.length).toBeGreaterThan(0);

    // AC-44f: Contains verification link
    const links = directLinks(msg);
    const verifyLink = links.find(l => l.includes('/verify?token='));
    expect(verifyLink).toBeTruthy();

    // AC-19a: Link contains session-id
    expect(verifyLink).toMatch(/\/sign-up\/[a-f0-9-]+\/verify\?token=/);

    // AC-44h: Text version also contains the link
    expect(msg.text.body).toContain('/verify?token=');

    // AC-44g: No forbidden internal links
    const allHrefs = allLinks(msg);
    for (const forbidden of FORBIDDEN_PATHS) {
      const bad = allHrefs.find(l => l.includes(forbidden));
      expect(bad, `Found forbidden link path "${forbidden}": ${bad}`).toBeUndefined();
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AGREEMENT SIGNED EMAIL — Sent after Zoho Sign completion
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-44a, AC-44b, AC-44c, AC-44f, AC-44g, AC-44h, AC-19a
 * Validate the agreement-signed email content and metadata.
 *
 * @param email - The Mailosaur email address used during registration
 */
export function verifyAgreementSignedEmail(email: string, timeoutMs = 30_000) {
  return async () => {
    const mailosaur = createMailosaur();
    const msg = await mailosaur.waitForMessage(email, {
      subject: 'WISE Membership Agreement Signed',
      timeoutMs,
    });

    // AC-44b: Subject matches Rules Document (D2)
    expect(msg.subject).toBe('WISE Membership Agreement Signed!');
    expect(msg.subject).not.toContain('{{');

    // AC-44c: Sender is corporate address
    expect(msg.from.length).toBeGreaterThan(0);
    expect(msg.from[0].email).toBe(EXPECTED_SENDER);

    // AC-44h: HTML and text versions present
    expect(msg.html.body.length).toBeGreaterThan(0);
    expect(msg.text.body.length).toBeGreaterThan(0);

    // AC-44f: Contains continuation link
    const links = directLinks(msg);
    const continueLink = links.find(l => l.includes('/agreement-signed'));
    expect(continueLink).toBeTruthy();

    // AC-19a: Link contains session-id
    expect(continueLink).toMatch(/\/sign-up\/[a-f0-9-]+\/agreement-signed/);

    // AC-44g: No forbidden internal links
    const allHrefs = allLinks(msg);
    for (const forbidden of FORBIDDEN_PATHS) {
      const bad = allHrefs.find(l => l.includes(forbidden));
      expect(bad, `Found forbidden link path "${forbidden}": ${bad}`).toBeUndefined();
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// NEGATIVE TEST — No email without registration
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-44d: Verify that NO verification email is sent when only the lead form
 * is submitted (without completing registration).
 *
 * The email is only triggered after registration submit, not after lead submit.
 * This test waits for a short period and verifies Mailosaur did NOT receive
 * any email for the given address.
 *
 * @param email - The Mailosaur email address used in the lead form
 * @param waitMs - How long to wait before concluding no email arrived (default: 15s)
 */
export function verifyNoEmailWithoutRegistration(email: string, waitMs = 15_000) {
  return async () => {
    const mailosaur = createMailosaur();
    try {
      await mailosaur.waitForMessage(email, { timeoutMs: waitMs });
      // If we get here, an email arrived — test FAILS
      throw new Error(
        `Email received for ${email} but none was expected ` +
        `(only lead form submitted, no registration)`,
      );
    } catch (err: any) {
      // The SDK throws when no matching message is found — that's the expected outcome
      if (err.message?.includes('not received') || err.message?.includes('No matching')) {
        return; // ✅ PASS — no email arrived
      }
      throw err; // Re-throw unexpected errors
    }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// WELCOME EMAIL — Sent after payment completion
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-44a, AC-44b, AC-44c, AC-44g, AC-44h
 * Validate the welcome email arrives after payment completion.
 *
 * Subject: "Welcome to WISE!"
 * Body contains: enrollment complete message, support contact info.
 * No continuation link expected (enrollment is finished).
 *
 * @param email - The Mailosaur email address used during registration
 * @param timeoutMs - How long to wait for the email (default: 60s — webhook + SQS processing)
 */
export function verifyWelcomeEmail(email: string, timeoutMs = 90_000) {
  return async () => {
    const mailosaur = createMailosaur();
    const msg = await mailosaur.waitForMessage(email, {
      subject: 'WISE Membership payment',
      timeoutMs,
    });

    // AC-44b: Subject matches Rules Document (D3)
    expect(msg.subject).toBe('Thank you for your WISE Membership payment');
    expect(msg.subject).not.toContain('{{');

    // AC-44c: Sender is corporate address
    expect(msg.from.length).toBeGreaterThan(0);
    expect(msg.from[0].email).toBe(EXPECTED_SENDER);

    // AC-44h: HTML and text versions present
    expect(msg.html.body.length).toBeGreaterThan(0);
    expect(msg.text.body.length).toBeGreaterThan(0);

    // Body contains key phrases per Rules Document (D3 — "New Subscription")
    const textBody = msg.text.body;
    expect(textBody).toContain('Thank you for your payment');
    expect(textBody).toContain('five (5) business days');

    // AC-44g: No forbidden internal links
    const allHrefs = allLinks(msg);
    for (const forbidden of FORBIDDEN_PATHS) {
      const bad = allHrefs.find(l => l.includes(forbidden));
      expect(bad, `Found forbidden link path "${forbidden}": ${bad}`).toBeUndefined();
    }
  };
}
