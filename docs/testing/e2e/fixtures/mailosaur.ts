/**
 * Mailosaur Helper — Email inbox integration for E2E tests.
 *
 * Uses the official Mailosaur SDK (messages.get with automatic polling).
 * Based on validated PoC: packages/poc/mailosaur-email/
 *
 * Config (from .env.qa):
 *   MAILOSAUR_API_KEY   — API key from Mailosaur dashboard
 *   MAILOSAUR_SERVER_ID — Server ID (inbox identifier)
 *
 * Usage:
 *   const email = generateMailosaurEmail();
 *   // ... fill form with email, submit ...
 *   const mailosaur = createMailosaur();
 *   const link = await mailosaur.waitForVerificationLink(email);
 */

import MailosaurClient from 'mailosaur';

// ─── Config (from env vars — loaded by playwright.config.ts from .env.qa) ───

interface MailosaurConfig {
  readonly apiKey: string;
  readonly serverId: string;
  readonly domain: string;
}

function getConfig(): MailosaurConfig {
  const apiKey = process.env.MAILOSAUR_API_KEY;
  const serverId = process.env.MAILOSAUR_SERVER_ID;

  if (!apiKey) throw new Error('MAILOSAUR_API_KEY env var is required. Set it in .env.qa');
  if (!serverId) throw new Error('MAILOSAUR_SERVER_ID env var is required. Set it in .env.qa');

  return { apiKey, serverId, domain: `${serverId}.mailosaur.net` };
}

// ─── Email generation ───────────────────────────────────────────────────────

/**
 * Generate a unique Mailosaur email address for a test run.
 * Format: testlead.{timestamp}@{serverId}.mailosaur.net
 *
 * Uses only a timestamp (no random suffix) because Elastic Email
 * may filter emails with random-looking local parts as spam.
 * The millisecond timestamp provides sufficient uniqueness between runs.
 */
export function generateMailosaurEmail(prefix = 'testlead'): string {
  const { domain } = getConfig();
  const ts = Date.now();
  return `${prefix}.${ts}@${domain}`;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Parsed email message from Mailosaur (subset of SDK types). */
export interface MailosaurMessage {
  id: string;
  subject: string;
  from: { email: string; name?: string }[];
  to: { email: string }[];
  html: { body: string; links: { href: string; text?: string }[] };
  text: { body: string; links: { href: string; text?: string }[] };
  receivedAt: string;
}

export interface MailosaurHelper {
  /** Wait for the verification email and return the verify URL. */
  waitForVerificationLink(sentTo: string, timeoutMs?: number): Promise<string>;
  /** Wait for any email matching sentTo and return the first link matching urlPattern. */
  waitForLink(sentTo: string, urlPattern: RegExp, timeoutMs?: number): Promise<string>;
  /** Wait for any email matching sentTo (and optionally subject) and return the full message for detailed assertions. */
  waitForMessage(sentTo: string, options?: { subject?: string; timeoutMs?: number }): Promise<MailosaurMessage>;
}

/**
 * Create a Mailosaur helper instance backed by the official SDK.
 *
 * The SDK's messages.get() polls automatically until a matching message
 * arrives or the timeout expires — no manual polling needed.
 */
export function createMailosaur(): MailosaurHelper {
  const { apiKey, serverId } = getConfig();
  const client = new MailosaurClient(apiKey);

  return {
    async waitForVerificationLink(sentTo: string, timeoutMs = 30_000): Promise<string> {
      const message = await client.messages.get(serverId, {
        sentTo,
      }, {
        timeout: timeoutMs,
        receivedAfter: new Date(Date.now() - 120_000),
      });

      // Search text links first (not wrapped in Elastic Email tracking)
      // then fall back to HTML links
      const allLinks = [
        ...(message.text?.links ?? []),
        ...(message.html?.links ?? []),
      ];
      const link = allLinks.find(l => l.href?.includes('/verify?token='));

      if (!link?.href) {
        const foundLinks = allLinks.map(l => l.href).join(', ') || 'none';
        throw new Error(
          `Verification link not found in email to ${sentTo}. ` +
          `Subject: "${message.subject}". Links found: ${foundLinks}`,
        );
      }

      return link.href;
    },

    async waitForLink(sentTo: string, urlPattern: RegExp, timeoutMs = 30_000): Promise<string> {
      const message = await client.messages.get(serverId, {
        sentTo,
      }, {
        timeout: timeoutMs,
        receivedAfter: new Date(Date.now() - 120_000),
      });

      const allLinks = [
        ...(message.text?.links ?? []),
        ...(message.html?.links ?? []),
      ];
      const link = allLinks.find(l => urlPattern.test(l.href || ''));

      if (!link?.href) {
        throw new Error(
          `Link matching ${urlPattern} not found in email to ${sentTo}. ` +
          `Subject: "${message.subject}".`,
        );
      }

      return link.href;
    },

    async waitForMessage(sentTo: string, options?: { subject?: string; timeoutMs?: number }): Promise<MailosaurMessage> {
      const timeoutMs = options?.timeoutMs ?? 30_000;
      const criteria: Record<string, string> = { sentTo };
      if (options?.subject) criteria.subject = options.subject;

      const message = await client.messages.get(serverId, criteria, {
        timeout: timeoutMs,
        receivedAfter: new Date(Date.now() - 120_000),
      });

      return {
        id: message.id!,
        subject: message.subject || '',
        from: (message.from ?? []).map(f => ({ email: f.email || '', name: f.name || undefined })),
        to: (message.to ?? []).map(t => ({ email: t.email || '' })),
        html: {
          body: message.html?.body || '',
          links: (message.html?.links ?? []).map(l => ({ href: l.href || '', text: l.text || undefined })),
        },
        text: {
          body: message.text?.body || '',
          links: (message.text?.links ?? []).map(l => ({ href: l.href || '', text: l.text || undefined })),
        },
        receivedAt: message.received?.toISOString() || '',
      };
    },
  };
}
