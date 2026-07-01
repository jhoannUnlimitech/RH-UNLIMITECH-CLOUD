# Playbook: Plan Selection Verification

Source: Jam 071960e3-1ad7-48d2-a602-0447d1b9fda8
Validated: Chrome MCP replay 2026-04-17

## Pre-conditions

- Browser is on `/sign-up/{sessionId}/plan` (registration form was submitted successfully)
- `plan-selection` context is present with `data-test-state="ready"`
- Plans are loaded from API (`plans-grid` context with `data-test-state="loaded"`)
- Default interval is "year" (annually toggle active)

## Scope

Verification only — no checkout. Validates:
1. Page loads correctly with plans
2. Interval toggle switches between monthly/yearly
3. Correct plans appear for each interval
4. Choose plan buttons are ready for interaction

## Sequence

### Step 1: Verify page loaded with annual plans (default)
- **Wait:** `[data-test-context="plan-selection"][data-test-state="ready"]`
- **Verify:** `annually-button` has `data-test-state="active"`
- **Verify:** `monthly-button` has `data-test-state="inactive"`
- **Verify:** 5 plan cards visible: plan-individual, plan-general, plan-company, plan-charter, plan-corporate
- **Verify:** Each card has `plan-name`, `plan-price`, `choose-plan-button` with state `ready`

### Step 2: Switch to Monthly
- **Selector:** `[data-test-key="monthly-button"]`
- **Action:** click
- **Verify:** `monthly-button` changes to `data-test-state="active"`
- **Verify:** `annually-button` changes to `data-test-state="inactive"`
- **Verify:** `plan-individual` is NOT visible (no monthly price)
- **Verify:** 4 plan cards visible: plan-general, plan-company, plan-charter, plan-corporate
- **Verify:** Each visible card has `choose-plan-button` with state `ready`

### Step 3: Switch back to Annually
- **Selector:** `[data-test-key="annually-button"]`
- **Action:** click
- **Verify:** `annually-button` changes to `data-test-state="active"`
- **Verify:** `monthly-button` changes to `data-test-state="inactive"`
- **Verify:** 5 plan cards visible again (plan-individual returns)
- **Verify:** Each card has `choose-plan-button` with state `ready`

## Post-conditions

- Page is in "annually" state (same as initial)
- No checkout initiated
- No errors visible


## Confirmed Patterns (from Chrome MCP replay)

### All annotations confirmed present
- `data-test-context="plan-selection"` with `data-test-state="ready"` ✓
- `data-test-key="monthly-button"` with `data-test-state="inactive"/"active"` ✓
- `data-test-key="annually-button"` with `data-test-state="active"/"inactive"` ✓
- `data-test-context="plan-{cname}"` for each plan card ✓
- `data-test-key="choose-plan-button"` with `data-test-state="ready"` in each card ✓

### Plan visibility by interval
- **Annually (default):** 5 plans — individual, general, company, charter, corporate
- **Monthly:** 4 plans — general, company, charter, corporate (individual has no monthly price)

### Toggle interaction
- Click on `monthly-button` or `annually-button` works via direct click (no evaluate_script needed)
- State attributes update reactively — no wait needed between click and verification

### Plan card verification
- Use `document.querySelectorAll('[data-test-context^="plan-"]')` to count visible plan cards
- Filter out `plan-selection` from the results (it also matches the prefix)
- In Playwright: use `page.locator('[data-test-context="plans-grid"] [data-test-context^="plan-"]').count()`

### Prices confirmed (annually)
| Plan | Price |
|------|-------|
| Individual | $195/year |
| General | $500/year |
| Company | $1,500/year |
| Charter | $1,500/year |
| Corporate | $6,000/year |
