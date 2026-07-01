# Playbook: Agreement Signing — Single Signer (Zoho Sign)

Source: Jam `38a83a86-b933-4759-a22e-e5a65564418a`
Previous Jam (discarded): `8a495291-47d8-4f3d-8f1f-798a35ec89bd`

## Overview

This playbook documents the Zoho Sign embedded signing flow when the document
is configured with a **single signer** (the client only). The admin signature
is pre-applied by the backend before the embed URL is generated.

## Pre-conditions

- Session has status `paid` (payment confirmed)
- User clicked "Continue to Agreement" on PaidPage
- AgreementPage loaded with `data-test-state="ready"` and iframe visible

## Sequence

### Step 1: Click "Start signing"
- **Location:** Inside Zoho Sign iframe
- **Selector:** `div` with text "Start signing" (rendered as a bar at the bottom of the document)
- **Action:** click (timeout: 30s — document may take time to render)
- **Verify:** Terms & Conditions modal appears

### Step 2: Accept Terms & Conditions ("Agree")
- **Location:** Inside Zoho Sign iframe
- **Selector:** button with text `labels.acceptTerms` (e.g. "Agree")
- **Action:** click
- **Verify:** Modal closes, signature fields become visible

### Step 3: Fill signature name
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByLabel(labels.signatureLabel)` (e.g. "Signature")
- **Action:** clear + fill with `signerName`
- **Value:** e.g. "Manuel Lara"

### Step 4: Fill initials
- **Location:** Inside Zoho Sign iframe
- **Selector:** `getByLabel(labels.initialsLabel)` (e.g. "Initial")
- **Action:** clear + fill with `signerInitials`
- **Value:** e.g. "ML"

### Step 5: Confirm signature ("Ok")
- **Location:** Inside Zoho Sign iframe
- **Selector:** button with text `labels.confirmSignature` (e.g. "Ok")
- **Action:** click
- **Verify:** Signature applied to document

### Step 6: Finalize document ("Finish")
- **Location:** Inside Zoho Sign iframe
- **Selector:** button with text `labels.finalize` (e.g. "Finish")
- **Action:** click
- **Verify:** Loading spinner, then redirect to `/completed`

### Step 7: Wait for redirect
- **Action:** waitForURL `/completed` (timeout: 60s — Phase 2 polling)
- **Verify:** CompletedPage loads

## Post-conditions

- Session status transitioned to `completed`
- CompletedPage shows welcome message

## Confirmed Patterns

### "Start signing" is a div, not a button
The "Start signing" element is a `div` with text content, not a `<button>`.
Use `frame.locator('div').filter({ hasText: /^Start signing$/ })` in Playwright.

### Labels are locale-dependent
Button labels change based on Zoho Sign locale. Current template uses English
labels: "Start signing", "Agree", "Signature", "Initial", "Ok", "Finish".

### No "Add signature" step
Unlike the dual-signer template, the single-signer template shows signature
fields directly after accepting Terms. There is no separate "Add signature" button.

### Connection error is cosmetic
A browser security warning about localhost connections from the Zoho iframe
may appear during Finish. It does not affect the flow.
