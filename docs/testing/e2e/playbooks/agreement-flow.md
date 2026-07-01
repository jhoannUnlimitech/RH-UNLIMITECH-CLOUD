# Playbook: Agreement Flow (Paid → Agreement → Zoho Sign → Completed)

Source: Jam 549938c7-5e0e-42e4-bf6a-931935dfa49c
Validated: Chrome MCP replay 2026-04-17

## Pre-conditions

- Browser is on `/sign-up/{sessionId}/paid`
- `payment-success` context is present with `data-test-state="ready"`
- "Continue to Agreement" button is visible

## Scope

Full agreement flow:
1. Click "Continue to Agreement" on paid page
2. Wait for agreement page to load (polling phase — up to 30s)
3. Verify Zoho Sign iframe is visible
4. Interact with Zoho Sign iframe (fill name, initials, select signature, finalize)
5. Wait for polling to detect signed status
6. Verify redirect to `/completed`

## Timing

| Phase | Duration | What happens |
|-------|----------|-------------|
| Phase 1: Agreement loading | 10-20s | App polls GET /agreement/{sessionId} every 3s until signing URL ready |
| Phase 2: Zoho Sign interaction | 20-30s | User fills fields and signs in the iframe |
| Phase 3: Signing detection | 5-20s | App polls checkAgreementStatus every 5s until status='signed' |
| **Total** | **35-70s** | From click "Continue" to redirect to /completed |

**Recommended test timeout: 120s** (2 minutes) to account for variability.

## Sequence

### Step 1: Click "Continue to Agreement" (our app — paid page)
- **Selector:** `[data-test-key="continue-button"]`
- **Action:** click
- **Result:** Navigates to `/sign-up/{sessionId}/agreement`
- **Wait:** URL matches `/agreement`

### Step 2: Wait for agreement page to finish loading
- **Wait:** `[data-test-context="agreement-page"][data-test-state="ready"]`
- **Timeout:** 60s (Phase 1 polling can take 10-20s, plus Zoho iframe load)
- **Note:** The page starts in `loading` state while polling. It transitions to `ready` when the signing URL is received and the iframe is rendered.

### Step 3: Verify Zoho Sign iframe is visible
- **Selector:** `[data-test-key="signing-iframe"]`
- **Verify:** iframe is visible and has a `src` attribute containing `sign.zoho.com`

### Step 4: Interact with Zoho Sign iframe (external domain)
- **Domain:** sign.zoho.com (cross-origin iframe)
- **Playwright:** Use `page.frameLocator('[data-test-key="signing-iframe"]')` to access iframe content

**Sub-steps inside iframe:**
1. Accept Terms & Conditions modal (if shown)
2. Fill "Name" field with signer name
3. Fill "Initial" field with initials
4. Select signature style
5. Click "Finalizar" / "Finish" button

**Note:** These selectors are from Zoho Sign and may change. They are best-effort.

### Step 5: Wait for redirect to completed page
- **Wait:** URL matches `/completed`
- **Timeout:** 60s (Phase 3 polling every 5s)
- **Note:** After signing in Zoho, our app's polling detects `status='signed'` and navigates automatically.

### Step 6: Verify completed page
- **Verify:** "Welcome to WISE!" or similar success message visible

## Post-conditions

- Browser is on `/sign-up/{sessionId}/completed`
- Agreement was signed successfully
- Enrollment flow is complete

## Confirmed Patterns

### Agreement loading is async with polling
The agreement page does NOT load instantly. It polls the backend every 3s until the Zoho Sign document is prepared. The `data-test-state` transitions: `loading` → `ready`.

### Zoho Sign iframe is cross-origin
The iframe content is from `sign.zoho.com`. Playwright can access it via `frameLocator()` but the internal DOM is not under our control.

### Redirect is via polling, not webhook push
After signing, the app polls `checkAgreementStatus` every 5s. When it detects `status='signed'`, it navigates to `/completed`. There's no real-time push — the test must wait for the polling cycle.

### Generous timeouts required
- Agreement loading: up to 60s
- Signing detection: up to 60s
- Total test timeout: 120s minimum


## Confirmed Replay Steps (Chrome MCP 2026-04-17)

### Exact interaction sequence inside Zoho Sign iframe

All interactions are inside the iframe (uid prefix 7_x, 8_x, 9_x, 10_x, 11_x in Chrome MCP).
Playwright accesses these via `page.frameLocator('[data-test-key="signing-iframe"]')`.

| # | Action | Target (a11y) | Notes |
|---|--------|---------------|-------|
| 1 | click | button "Comenzar a firmar" | Starts the signing flow |
| 2 | click | button "Acepto" (in Terms dialog) | Terms & Conditions modal appears automatically |
| 3 | click | button "Add signature" | Opens signature dialog |
| 4 | click | button "Aceptar" (in signature dialog) | Name/initials pre-filled, default style selected |
| 5 | click | button "Finalizar" | Submits the signed document |

### Key findings

**Zoho Sign iframe is accessible via Chrome MCP snapshot.**
The a11y tree includes the iframe content. Elements inside the iframe have their own uid namespace. Clicks work directly on iframe elements.

**Signature dialog pre-fills name and initials.**
The dialog shows "Manuel Lara" and "ML" pre-filled from the enrollment data. No need to type — just click "Aceptar" to accept the default.

**Terms & Conditions modal appears after "Comenzar a firmar".**
It's a modal dialog inside the iframe. Must be accepted before proceeding.

**"Finalizar" button appears after all fields are completed.**
The counter shows "3/3" when all required fields (signature) are done.

**Polling redirect works.**
After clicking "Finalizar", the app's polling (every 5s) detects `status='signed'` and navigates to `/completed`. This took ~15-20s in the replay.

### Playwright approach for iframe interaction

```typescript
const iframe = page.frameLocator('[data-test-key="signing-iframe"]');

// Wait for Zoho to load and show "Comenzar a firmar"
await iframe.getByRole('button', { name: 'Comenzar a firmar' }).click({ timeout: 30_000 });

// Accept Terms & Conditions
await iframe.getByRole('button', { name: 'Acepto' }).click({ timeout: 10_000 });

// Add signature (opens dialog with pre-filled name)
await iframe.getByRole('button', { name: 'Add signature' }).click({ timeout: 10_000 });

// Accept default signature
await iframe.getByRole('button', { name: 'Aceptar' }).click({ timeout: 10_000 });

// Finalize
await iframe.getByRole('button', { name: 'Finalizar' }).click({ timeout: 10_000 });

// Wait for polling to detect signed status and redirect
await page.waitForURL(/\/completed/, { timeout: 60_000 });
```

### Locale note
Button labels are in Spanish (es): "Comenzar a firmar", "Acepto", "Aceptar", "Finalizar".
This depends on the Zoho Sign locale setting. If the locale changes, button names change.
Consider using more resilient selectors if locale varies.
