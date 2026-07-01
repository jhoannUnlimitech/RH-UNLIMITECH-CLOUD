# Playbook: Agreement Signing Flow (Paid → Agreement → Zoho Sign → Completed)

Source: Jam 419a16c6-87a9-473b-b028-eb628db81423
Status: Curated — validated via Chrome MCP replay 2026-04-21

## Pre-conditions

- Browser is on `/sign-up/{sessionId}/paid` with `data-test-state="ready"`
- Payment has been confirmed (status: `paid`)
- "Continuar al Acuerdo" button is visible and enabled

## Scope

Full agreement signing flow:
1. Click "Continue to Agreement" on paid page
2. Wait for agreement page to load (Phase 1 polling)
3. Verify Zoho Sign iframe loads
4. Interact with Zoho Sign iframe (signature fields, confirm, finalize)
5. Wait for polling to detect signed status (Phase 2)
6. Verify redirect to `/completed`
7. Verify completed page shows welcome message

## Sequence

### Step 1: Click "Continue to Agreement" (our app — paid page)
- **Selector:** `[data-test-key="continue-button"]`
- **Action:** click
- **Wait:** URL matches `/agreement`
- **Verify:** Page navigates to `/sign-up/{sessionId}/agreement`

### Step 2: Wait for agreement page loading state
- **Wait:** `[data-test-context="agreement-page"][data-test-state="loading"]`
- **Verify:** Spinner visible, `loading-message` shows "Preparando su acuerdo para la firma..."
- **Note:** Phase 1 polling — backend prepares Zoho Sign document (every 3s, max 60 attempts)

### Step 3: Wait for agreement page ready state
- **Wait:** `[data-test-context="agreement-page"][data-test-state="ready"]`
- **Timeout:** 60s (Phase 1 polling can take 10-20s)
- **Verify:** `page-title` visible ("Acuerdo de Membresía")
- **Verify:** `page-subtitle` visible
- **Verify:** `signing-container` visible
- **Verify:** `signing-iframe` visible with `src` containing `sign.zoho.com`

### Step 4: Interact with Zoho Sign iframe — Start signing
- **Domain:** sign.zoho.com (cross-origin iframe)
- **Access:** `page.frameLocator('[data-test-key="signing-iframe"]')`
- **Action:** Click "Comenzar a firmar" button (or equivalent start button)
- **Note:** This is inside the Zoho iframe — selectors are Zoho's, not ours

### Step 5: Accept Terms & Conditions
- **Action:** Click "Acepto" button in Terms modal
- **Note:** Modal appears automatically after starting the signing flow

### Step 6: Click signature field to open signature dialog
- **Action:** Click on the signature input area
- **Result:** Signature dialog opens with Name and Initial fields

### Step 7: Fill signature details
- **Action:** Fill Name field with signer name (e.g. "Manuel Lara")
- **Action:** Fill Initial field with initials (e.g. "ML")
- **Action:** Select signature style (third option)
- **Note:** Fields may be pre-filled from enrollment data

### Step 8: Accept signature
- **Action:** Click "Aceptar" button
- **Result:** Signature is applied to the document

### Step 9: Update phone number (Zoho modal)
- **Action:** Update phone field if prompted (e.g. "+37300000001")
- **Action:** Click "Listo" to confirm
- **Note:** Zoho may show additional modals for document fields

### Step 10: Update name (Zoho modal)
- **Action:** Update name field if prompted (e.g. "Manuel Lara Perez")
- **Action:** Click "Listo" to confirm

### Step 11: Finalize document
- **Action:** Click "Finalizar" button
- **Result:** Document is submitted to Zoho Sign for processing

### Step 12: Wait for signing detection (Phase 2 polling)
- **Wait:** URL matches `/completed`
- **Timeout:** 60s (Phase 2 polling every 5s via `checkOnly=true`)
- **Note:** After "Finalizar", Zoho may show a connection error (Chrome blocks localhost redirect from public page). This is expected — our app's polling detects `status='signed'` independently.

### Step 13: Verify completed page
- **Verify:** Page is on `/sign-up/{sessionId}/completed`
- **Verify:** Welcome message visible ("¡Bienvenido a WISE!" or "Welcome to WISE!")
- **Verify:** Success checkmark icon visible
- **Verify:** Confirmation messages about payment, agreement, and email

## Post-conditions

- Browser is on `/sign-up/{sessionId}/completed`
- Agreement was signed successfully
- Session status transitioned to `completed`
- Enrollment flow is complete

## Timing (from Jam analysis)

| Phase | Duration | What happens |
|-------|----------|-------------|
| Paid → Agreement navigation | ~1s | Click continue, URL changes |
| Phase 1: Agreement loading | ~4s | Polling until signing URL ready |
| Zoho Sign interaction | ~30s | Fill fields, sign, finalize |
| Phase 2: Signing detection | ~8s | Polling until status='signed' |
| **Total** | **~43s** | From click "Continue" to `/completed` |

## Confirmed Patterns (from Chrome MCP replay 2026-04-21)

### Simplified signing flow
The replay confirmed a simpler flow than the Jam recording:
1. "Comenzar a firmar" → Terms modal → "Acepto" → Document with fields
2. "Add signature" → Signature dialog (Name + Initials pre-filled) → "Aceptar"
3. "Finalizar" → Polling detects `signed` → Redirect to `/completed`

The phone/name modals (Steps 9-10 in v1) did NOT appear in this replay. They are optional and depend on the Zoho Sign document template configuration.

### Exact interaction sequence (Chrome MCP UIDs)

| # | Action | Target | UID | Notes |
|---|--------|--------|-----|-------|
| 1 | click | "Comenzar a firmar" | 8_18 | Starts signing flow |
| 2 | verify | Terms modal appears | 9_0 | dialog modal "Términos y condiciones" |
| 3 | click | "Acepto" | 9_22 | Accepts terms |
| 4 | verify | Document shows fields | — | Name: "Manuel Lara", Phone: "+573000000000", Signature: "Required" |
| 5 | click | "Add signature" | 10_3 | Opens signature dialog |
| 6 | verify | Signature dialog | 11_0 | Name pre-filled: "Manuel Lara", Initials: "ML", 3 styles |
| 7 | click | "Aceptar" | 11_17 | Accepts default signature |
| 8 | verify | Counter changes to 3/3 | 8_10 | All fields completed |
| 9 | click | "Finalizar" | 12_0 | Submits signed document |
| 10 | wait | Redirect to /completed | — | Polling detects `signed` (~15-30s) |
| 11 | verify | Welcome page | 13_0 | "¡Bienvenido a WISE!" |

### Playwright approach (updated)

```typescript
const frame = page.frameLocator('[data-test-key="signing-iframe"]');

// Step 1: Start signing
await frame.getByRole('button', { name: 'Comenzar a firmar' }).click({ timeout: 30_000 });

// Step 2: Accept Terms
await frame.getByRole('button', { name: 'Acepto' }).click({ timeout: 10_000 });

// Step 3: Add signature
await frame.getByRole('button', { name: 'Add signature' }).click({ timeout: 10_000 });

// Step 4: Accept default signature (name + initials pre-filled)
await frame.getByRole('button', { name: 'Aceptar' }).click({ timeout: 10_000 });

// Step 5: Finalize
await frame.getByRole('button', { name: 'Finalizar' }).click({ timeout: 10_000 });

// Step 6: Wait for redirect
await page.waitForURL(/\/completed/, { timeout: 60_000 });
```

### Session used for replay
- Session ID: `425d98a4-98b3-4b95-84e7-9728b4be16c3`
- Full flow: sign-up → lead (Colombia) → registration → plan (General) → Stripe checkout → paid → agreement → completed
- Total time from agreement page to completed: ~35s
