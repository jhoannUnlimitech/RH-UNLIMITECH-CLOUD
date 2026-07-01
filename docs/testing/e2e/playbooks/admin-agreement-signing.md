# Playbook: Admin Agreement Signing

Source: Jam 7c9dfe53-49cc-47ff-a9f5-cd793f4add5d
Replay: Chrome MCP (2026-05-20)

## Pre-conditions
- Enrollment completed (client signed + paid)
- Admin email configured: `admin-wise@isyifpzu.mailosaur.net`
- Zoho Sign template has multiple signers (client + admin)
- Client signature already applied → admin receives signing request

## Sequence

### Step 1: Wait for admin signing email
- **Source:** Mailosaur API
- **Filter:** sentTo=`admin-wise@{MAILOSAUR_DOMAIN}`, subject contains "requests you to sign"
- **Verify:** Email received, from `notifications@zohosign.com`
- **Extract:** Zoho Sign link (`https://sign.zoho.com/zsguest?...&action_type=SIGN`)

### Step 2: Navigate to Zoho Sign guest page
- **Action:** Open extracted link in browser
- **Verify:** Page shows "Document info" with:
  - Document name: "WISE Membership Agreement 1"
  - Sender: "Moises Gonzalez"
  - Organization: "WISE International"
- **Chrome MCP:** `navigate_page` to the extracted URL
- **Playwright:** `page.goto(zohoSignUrl)`

### Step 3: Click "Proceed to document"
- **Selector:** `button#signin-cancel` (text: "Proceed to document")
- **Action:** click
- **Verify:** URL changes to `sign.zoho.com/zsstateless#/review/...`
- **Chrome MCP:** `click` on button
- **Playwright:** `page.locator('button#signin-cancel').click()`

### Step 4: Review page — Consent
- **Verify:** Page shows consent checkbox and "Agree & Continue" button
- **Action:** Check consent checkbox (if not auto-checked)
- **Action:** Click "Agree & Continue"
- **Selector:** `button.zs-btn.zs-btn-primary` (text: "Agree & Continue")
- **Playwright:** `page.getByRole('button', { name: 'Agree & Continue' }).click()`

### Step 5: Verify enrollee email in document
- **Verify:** Document body contains the email of the person who enrolled
- **Source:** Bridge data (`bridge.email`)
- **Playwright:** Check page content or document text for the email

### Step 6: Click signature field
- **Selector:** `div.zs-signature-field` or clickable signature placeholder
- **Action:** click
- **Verify:** Signature modal opens
- **Playwright:** `page.locator('.zs-signature-field').first().click()`

### Step 7: Confirm signature (OK)
- **Selector:** `button.btn.btn-primary` (text: "OK")
- **Action:** click
- **Verify:** Signature applied to field, modal closes
- **Playwright:** `page.getByRole('button', { name: 'OK' }).click()`
- **Note:** Signature name is pre-filled as "WISE Admin"

### Step 8: Click "Finish"
- **Selector:** `button#Finish` or `button` with text "Finish"
- **Action:** click
- **Verify:** Document transitions to completed state
- **Playwright:** `page.locator('button#Finish, button:has-text("Finish")').click()`

### Step 9: Verify completion confirmation
- **Verify:** Page shows "You have signed this document"
- **Verify:** Redirect to `/iframe-signed` (if applicable)
- **Playwright:** `expect(page.locator('text=You have signed this document')).toBeVisible()`

### Step 10: Verify completion email
- **Source:** Mailosaur API
- **Filter:** sentTo=`admin-wise@{MAILOSAUR_DOMAIN}`, subject contains "has been completed"
- **Verify:** Email received with subject "Document WISE Membership Agreement 1 has been completed"
- **Verify:** Email has attachment (signed PDF)

## Post-conditions
- Document fully signed by all parties (client + admin)
- Completion email received by admin
- Zoho Sign webhook fires → triggers tenant creation in provisioning

## Confirmed Patterns

### Zoho Sign Guest Flow (external — no data-test-*)
The admin signing happens entirely on Zoho Sign's domain (sign.zoho.com).
All selectors are raw CSS/IDs per steering test-annotations 10.5.

### Email timing
- Admin signing email arrives ~5-15s after client signs
- Completion email arrives ~5-10s after admin signs
- Both emails come from `notifications@zohosign.com`

### Signature modal
- Pre-fills with "WISE Admin" name
- Single "OK" button to confirm
- No initials required for admin (only client has initials)

### Document already signed
If the admin link is visited after signing, Zoho shows:
"This document has been signed by all parties." (read-only view)
