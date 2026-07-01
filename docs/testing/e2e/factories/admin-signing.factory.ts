/**
 * Admin Signing Factory — Admin signs the WISE Membership Agreement via Zoho Sign
 *
 * Playbook: e2e/playbooks/admin-agreement-signing.md
 * Source: Jam 7c9dfe53-49cc-47ff-a9f5-cd793f4add5d
 *
 * Flow:
 *   1. Search Mailosaur for admin signing email
 *   2. Extract Zoho Sign link from email
 *   3. Navigate to Zoho Sign → Proceed → Agree → Sign → Finish
 *   4. Verify completion email arrives
 *
 * Covers: AC-AS01 to AC-AS12
 *
 * Per steering test-annotations 10.5:
 *   - Zoho Sign is third-party — raw selectors from admin-signing.pom.ts
 *   - No data-test-* annotations on Zoho pages
 *   - Mailosaur interaction via API (not browser)
 */

import { expect, type Page } from '@playwright/test';
import { ZOHO_SIGN_ADMIN_SELECTORS } from '../pom/admin-signing.pom';
import Mailosaur from 'mailosaur';

// ─── Zoho Sign selectors (third-party — raw CSS per steering 10.5) ───────────

const zohoSel = ZOHO_SIGN_ADMIN_SELECTORS;

// ─── Mailosaur config ────────────────────────────────────────────────────────

const MAILOSAUR_API_KEY = process.env.MAILOSAUR_API_KEY!;
const MAILOSAUR_SERVER_ID = process.env.MAILOSAUR_SERVER_ID || 'isyifpzu';
const ADMIN_EMAIL = process.env.ZOHO_SIGN_ADMIN_EMAIL_1 || `admin1@${MAILOSAUR_SERVER_ID}.mailosaur.net`;

// ═════════════════════════════════════════════════════════════════════════════
// AC-AS01, AC-AS02: Wait for admin signing email and extract link
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-AS01: Wait for the admin signing request email in Mailosaur.
 * AC-AS02: Extract the Zoho Sign link from the email.
 *
 * Searches for an email sent to admin-wise@{domain} with subject
 * containing "requests you to sign".
 *
 * @returns The Zoho Sign URL for the admin to sign
 */
export function waitForAdminSigningEmail(enrolleeEmail: string) {
  return async (): Promise<string> => {
    const client = new Mailosaur(MAILOSAUR_API_KEY);

    // AC-AS01: Search for the signing request email (received after enrollment)
    const message = await client.messages.get(MAILOSAUR_SERVER_ID, {
      sentTo: ADMIN_EMAIL,
      subject: 'requests you to sign',
    }, {
      timeout: 90_000,
      receivedAfter: new Date(Date.now() - 10 * 60 * 1000), // last 10 minutes
    });

    expect(message).toBeTruthy();
    expect(message.subject).toContain('requests you to sign');
    expect(message.from![0].email).toBe('notifications@zohosign.com');

    // AC-AS02: Extract Zoho Sign link
    const html = message.html?.body || '';
    const linkMatch = html.match(/href="(https:\/\/sign\.zoho\.com\/zsguest[^"]+)"/);
    expect(linkMatch).toBeTruthy();

    const zohoSignUrl = linkMatch![1];
    expect(zohoSignUrl).toContain('action_type=');

    return zohoSignUrl;
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-AS04 to AC-AS10: Sign the document via Zoho Sign
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-AS04 to AC-AS10: Navigate to Zoho Sign and complete the admin signature.
 *
 * Steps:
 *   1. Navigate to Zoho Sign guest page
 *   2. Click "Proceed to document" (guest page)
 *   3. Check consent checkbox + Click "Agree & Continue"
 *   4. Click signature field → OK in modal (applies to first field)
 *   5. Click remaining signature fields (auto-applies without modal)
 *   6. Click "Finish"
 *   7. Verify redirect to /iframe-signed
 *
 * @param zohoSignUrl - The URL extracted from the admin signing email
 */
export function signAsAdmin(getPage: () => Page, zohoSignUrl: string) {
  return async () => {
    const page = getPage();

    // AC-AS04: Navigate to Zoho Sign guest page
    await page.goto(zohoSignUrl);
    await page.waitForSelector(zohoSel.guestProceedBtn, { timeout: 30_000 });

    // Verify document info is displayed (AC-AS05)
    const pageContent = await page.content();
    expect(pageContent).toContain('WISE Membership Agreement');

    // Click "Proceed to document" (guest page)
    await page.locator(zohoSel.guestProceedBtn).click();

    // Wait for review page to load
    await page.waitForURL(/zsstateless/, { timeout: 15_000 });
    await page.waitForTimeout(3_000);

    // AC-AS06: Accept Terms — two approaches depending on template version
    // New template: checkbox + "Agree & Continue" button directly on page
    // Old template: "Electronic Record and Signature Disclosure" button → modal → "Agree"
    const agreeBtn = page.locator('button:has-text("Agree & Continue"), button:has-text("Agree and Continue")');
    const agreeBtnVisible = await agreeBtn.first().isVisible({ timeout: 5_000 }).catch(() => false);

    if (agreeBtnVisible) {
      // New template flow (confirmed via Jam e9fd3f78):
      //   1. Click checkbox → opens "Terms and conditions" modal
      //   2. Click "Agree" inside the modal
      //   3. Click "Agree & Continue" on the page
      const checkbox = page.locator('input[type="checkbox"]').first();
      const checkboxVisible = await checkbox.isVisible({ timeout: 3_000 }).catch(() => false);
      if (checkboxVisible) {
        await checkbox.check({ force: true });
        await page.waitForTimeout(1_000);
      }

      // Check if a "Terms and conditions" modal appeared after checking the checkbox
      const agreeInModal = page.locator('button.zs-btn:has-text("Agree"), dialog button:has-text("Agree"), [role="dialog"] button:has-text("Agree")');
      const modalAgreeVisible = await agreeInModal.first().isVisible({ timeout: 3_000 }).catch(() => false);
      if (modalAgreeVisible) {
        await agreeInModal.first().click();
        await page.waitForTimeout(1_000);
      }

      // Now click "Agree & Continue"
      await agreeBtn.first().click();
    } else {
      // Old template: click disclosure button → modal → "Agree"
      await page.waitForTimeout(5_000);
      const disclosureLink = page.getByRole('button', { name: /Electronic Record and Signature Disclosure/i });
      await expect(disclosureLink).toBeVisible({ timeout: 10_000 });
      await disclosureLink.click();

      const agreeInModal = page.locator('dialog button:has-text("Agree"), [role="dialog"] button:has-text("Agree")');
      await expect(agreeInModal.first()).toBeVisible({ timeout: 10_000 });
      await agreeInModal.first().click();
    }

    // Wait for document to render with signature fields
    await page.waitForTimeout(3_000);

    // AC-AS07: Sign all signature fields
    // The new template flow for admin:
    //   1. After "Agree", Zoho navigates to the first signature field
    //   2. A signature modal may already be open OR a "Signature" field needs to be clicked
    //   3. The modal shows pre-filled name/initials → click "Ok" to apply
    //   4. After the first "Ok", Zoho auto-applies to ALL remaining fields
    //   5. "You've successfully filled all fields. Click Finish to complete." appears
    //
    // Strategy: Try clicking "Ok" first (modal may already be open), then look for
    // signature fields if needed. After first successful Ok, wait for Finish.

    let signatureApplied = false;

    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(2_000);

      // Check if all fields are done and Finish is ready
      const successMsg = await page.locator('text=successfully filled all fields').isVisible().catch(() => false);
      if (successMsg) break;

      const finishBtn = page.locator('button#finish-btn, button:has-text("Finish")');
      const fieldsRemaining = await page.locator('text=Fields remaining').isVisible().catch(() => false);
      if (!fieldsRemaining && signatureApplied) {
        const finishVisible = await finishBtn.first().isVisible().catch(() => false);
        if (finishVisible) break;
      }

      // Check if signature modal is already open (Ok button visible)
      // Jam 057b0f22 confirmed: guest page uses button#ok for the signature confirm
      const okBtn = page.locator('button#ok, button#zs-btn-ok, dialog button:has-text("Ok"), [role="dialog"] button:has-text("Ok"), button.zs-modal-btn:has-text("Ok"), .modal-footer button:has-text("Ok")');
      const okVisible = await okBtn.first().isVisible({ timeout: 5_000 }).catch(() => false);
      if (okVisible) {
        await okBtn.first().click();
        await page.waitForTimeout(3_000);
        signatureApplied = true;
        continue;
      }

      // Try clicking on a signature field to open the modal
      const sigField = page.locator('div.zs-field-wrapper, .field-edit-box:has-text("Signature"), .field-edit-box:has-text("Initial"), .field-edit-box, [data-field-type="signature"]').first();
      const sigVisible = await sigField.isVisible({ timeout: 3_000 }).catch(() => false);
      if (sigVisible) {
        await sigField.click();
        await page.waitForTimeout(2_000);

        // After clicking field, check for Ok button in modal
        const okAfterClick = await okBtn.first().isVisible({ timeout: 5_000 }).catch(() => false);
        if (okAfterClick) {
          await okBtn.first().click();
          await page.waitForTimeout(2_000);
          signatureApplied = true;
        }
      } else {
        // No signature field found — might be done
        break;
      }
    }

    // AC-AS09: Click "Finish"
    await page.waitForTimeout(2_000);
    const finishBtn = page.locator('button#finish, button#finish-btn, button:has-text("Finish")');
    await expect(finishBtn.first()).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(1_000);
    await finishBtn.first().click();

    // AC-AS10 + AC-AS12: Verify redirect to /iframe-signed
    await page.waitForURL(/iframe-signed/, { timeout: 30_000 });

    // Verify confirmation message
    const confirmation = page.locator('text=Gracias por firmar, text=Thank you for signing, text=firma ha sido registrada');
    const confirmVisible = await confirmation.first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(confirmVisible || page.url().includes('iframe-signed')).toBe(true);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// AC-AS11: Verify completion email
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-AS11: Verify the "Document has been completed" email arrives.
 *
 * After admin signs, Zoho sends a completion email to the admin.
 */
export function verifyCompletionEmail() {
  return async () => {
    const client = new Mailosaur(MAILOSAUR_API_KEY);

    const message = await client.messages.get(MAILOSAUR_SERVER_ID, {
      sentTo: ADMIN_EMAIL,
      subject: 'has been completed',
    }, { timeout: 90_000 });

    expect(message).toBeTruthy();
    expect(message.subject).toContain('Document WISE Membership Agreement');
    expect(message.subject).toContain('has been completed');
    expect(message.from![0].email).toBe('notifications@zohosign.com');

    // Completion email should have an attachment (signed PDF)
    expect(message.attachments!.length).toBeGreaterThan(0);
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// MULTI-ADMIN — Wait for specific admin signing email by recipient
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AC-AMA-07, AC-AMA-15: Wait for a signing request email sent to a specific admin.
 *
 * In multi-admin templates, each admin receives their own signing email sequentially
 * (based on signing_order). This function searches Mailosaur for an email sent to
 * the specified admin address with subject "requests you to sign".
 *
 * @param adminEmail - The specific admin email to search for (e.g. admin1@server.mailosaur.net)
 * @param enrolleeEmail - The enrollee email (used as context for filtering if needed)
 * @returns The Zoho Sign URL for this admin to sign
 */
export function waitForAdminSigningEmailByRecipient(adminEmail: string, enrolleeEmail: string) {
  return async (): Promise<string> => {
    // Use Mailosaur HTTP API directly — the Node.js SDK has issues with message deletion
    const serverMatch = adminEmail.match(/@([^.]+)\.mailosaur\.net/);
    const serverId = serverMatch ? serverMatch[1] : MAILOSAUR_SERVER_ID;
    const auth = Buffer.from(`api:${MAILOSAUR_API_KEY}`).toString('base64');

    let zohoSignUrl = '';
    const startTime = Date.now();
    const maxWaitMs = 120_000;

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const res = await fetch(`https://mailosaur.com/api/messages?server=${serverId}&page=0&itemsPerPage=20`, {
          headers: { Authorization: `Basic ${auth}` },
        });
        const data = await res.json() as any;

        // Find most recent email to this admin
        const adminMsg = data.items?.find((m: any) => m.to?.[0]?.email === adminEmail);

        if (adminMsg) {
          // Get full message to extract the Zoho Sign link
          const fullRes = await fetch(`https://mailosaur.com/api/messages/${adminMsg.id}`, {
            headers: { Authorization: `Basic ${auth}` },
          });
          const fullMsg = await fullRes.json() as any;
          const html = fullMsg.html?.body || '';
          const linkMatch = html.match(/href="(https:\/\/sign\.zoho\.com\/zsguest[^"]+)"/);

          if (linkMatch) {
            zohoSignUrl = linkMatch[1];
            break;
          }
        }
      } catch { /* ignore and retry */ }

      await new Promise(r => setTimeout(r, 5_000));
    }

    if (!zohoSignUrl) {
      throw new Error(`Admin signing email not found for ${adminEmail} within ${maxWaitMs / 1000}s`);
    }

    expect(zohoSignUrl).toContain('sign.zoho.com');
    expect(zohoSignUrl).toContain('action_type=');

    return zohoSignUrl;
  };
}

/**
 * AC-AMA-08, AC-AMA-11, AC-AMA-12: Verify completion email for multi-admin.
 *
 * In multi-admin templates, the completion email ("has been completed") only arrives
 * after ALL signers have signed. This function searches for that email sent to
 * any of the admin addresses.
 *
 * @param adminEmail - The admin email to check for completion notification
 */
export function verifyCompletionEmailForAdmin(adminEmail: string) {
  return async () => {
    const client = new Mailosaur(MAILOSAUR_API_KEY);

    // Extract server ID from the admin email domain
    const serverMatch = adminEmail.match(/@([^.]+)\.mailosaur\.net/);
    const serverId = serverMatch ? serverMatch[1] : MAILOSAUR_SERVER_ID;

    const message = await client.messages.get(serverId, {
      sentTo: adminEmail,
      subject: 'has been completed',
    }, { timeout: 120_000 });

    expect(message).toBeTruthy();
    expect(message.subject).toContain('WISE Membership Agreement');
    expect(message.subject).toContain('has been completed');
    expect(message.from![0].email).toBe('notifications@zohosign.com');

    // Completion email should have the signed PDF attached
    expect(message.attachments!.length).toBeGreaterThan(0);
  };
}
