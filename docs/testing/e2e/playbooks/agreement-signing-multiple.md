# Playbook: Agreement Signing — Multiple Signers (Zoho Sign)

Source: Jam `ede404f6-ce50-4ad1-b06e-bb3fa77a6e9a`

## Overview

This playbook documents the Zoho Sign embedded signing flow when the document
is configured with **multiple signature fields** across different membership tiers.
The client must click each signature field individually after providing their
name and initials.

This template uses **Spanish (ES)** labels in Zoho Sign.

## Pre-conditions

- Session has status `paid` (payment confirmed)
- User clicked "Continue to Agreement" on PaidPage
- AgreementPage loaded with `data-test-state="ready"` and iframe visible
- Zoho Sign template configured with multiple signature fields

## Sequence

### Step 1: Click "Comenzar a firmar"
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByRole('button', { name: 'Comenzar a firmar' })`
- **Action:** click (timeout: 30s)
- **Verify:** Terms & Conditions modal appears

### Step 2: Accept Terms & Conditions ("Acepto")
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByRole('button', { name: 'Acepto' })`
- **Action:** click
- **Verify:** Modal closes, signature input fields appear

### Step 3: Fill signature name ("Firma")
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByLabel('Firma')`
- **Action:** clear + fill with signerName
- **Value:** e.g. "Manuel Lara"

### Step 4: Fill initials ("Inicial")
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByLabel('Inicial')`
- **Action:** clear + fill with signerInitials
- **Value:** e.g. "ML"

### Step 5: Confirm signature ("Aceptar")
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByRole('button', { name: 'Aceptar' })`
- **Action:** click
- **Verify:** Signature applied, document shows signature fields to click

### Step 6: Click all remaining signature fields
- **Location:** Inside Zoho Sign iframe
- **Action:** Click each "Signature" field in the document (10 fields in the Jam)
- **Note:** After accepting the signature, the document shows clickable signature
  placeholders. Each click applies the previously accepted signature to that field.
- **Approach:** Use `frame.getByText('Signature').click()` or locate by the
  signature placeholder elements. The exact number of fields depends on the template.
- **Verify:** All fields show the applied signature

### Step 7: Click "Finalizar"
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByRole('button', { name: 'Finalizar' })`
- **Action:** click
- **Verify:** Loading spinner, then redirect to `/completed`


## Confirmed Patterns

### Multiple signature fields require individual clicks
After accepting the signature (Step 5), the document shows multiple clickable
signature placeholders. Each must be clicked to apply the signature. The Jam
showed 10 signature field clicks for different membership tiers:
1. Individual Membership Fee
2. Company Membership Fee
3. Corporate Membership Fee
4. CEO's Circle Membership
5. Attachment B

### Labels are in Spanish for this template
The Zoho Sign locale for this template is Spanish. All button labels use
`ZOHO_SIGN_LABELS_ES` from test-data.ts.

### Connection error is cosmetic
Same as single-signer — browser security warning about localhost connections.
Does not affect the signing flow.

## Pending: Replay validation

The exact selectors for the signature field clicks (Step 6) need to be validated
via Chrome MCP replay. The Jam shows they are `div` elements with class
`relative flex flex-row items-center justify-center h-full cursor-pointer gap-1`.
