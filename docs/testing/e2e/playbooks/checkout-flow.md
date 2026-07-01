# Playbook: Checkout Flow (Plan → Stripe → Payment Success)

Source: Jam f20cd050-4e69-43ba-a974-23ebbc784262
Validated: Chrome MCP replay 2026-04-17

## Pre-conditions

- Browser is on `/sign-up/{sessionId}/plan` (plan selection page loaded)
- `plan-selection` context is present with `data-test-state="ready"`
- Plans are loaded and visible

## Scope

Full checkout flow:
1. Select a plan (General Membership, yearly)
2. Fill Stripe Checkout form (test card)
3. Verify redirect to payment success page
4. Verify success message visible

## Sequence

### Step 1: Choose General Membership (our app)
- **Selector:** `[data-test-context="plan-general"] [data-test-key="choose-plan-button"]`
- **Action:** click
- **Result:** Browser redirects to `checkout.stripe.com`
- **Wait:** URL contains `checkout.stripe.com`
- **Chrome MCP:** `click` on uid — works directly
- **Playwright:** `page.locator(sel).click()` then `page.waitForURL(/checkout\.stripe\.com/)`

### Step 2: Fill Stripe Checkout form
- **Domain:** checkout.stripe.com (external — no data-test-* annotations)
- **Important:** Stripe inputs are NOT in iframes in the hosted checkout page (confirmed by replay). They are direct DOM elements accessible via a11y tree.

**Card Number:**
- **Selector:** textbox "Card number" (a11y label)
- **Action:** fill
- **Value:** `4242424242424242`
- **Chrome MCP:** `fill` on uid — works directly
- **Playwright:** `page.getByLabel('Card number').fill('4242424242424242')`

**Expiration:**
- **Selector:** textbox "Expiration" (a11y label)
- **Action:** fill
- **Value:** `1030` (formats as 10/30)
- **Chrome MCP:** `fill` on uid — works directly
- **Playwright:** `page.getByLabel('Expiration').fill('1030')`

**CVC:**
- **Selector:** textbox "CVC" (a11y role — NOT getByLabel, which matches 2 elements including an SVG icon)
- **Action:** fill
- **Value:** `123`
- **Chrome MCP:** `fill` on uid — works directly
- **Playwright:** `page.getByRole('textbox', { name: 'CVC' }).fill('123')` (strict mode requires role selector)

**Cardholder Name:**
- **Selector:** textbox "Cardholder name" (a11y label)
- **Action:** fill
- **Value:** `Test User`
- **Chrome MCP:** `fill` on uid — works directly
- **Playwright:** `page.getByLabel('Cardholder name').fill('Test User')`

### Step 3: Click Subscribe
- **Selector:** button "Subscribe"
- **Action:** click
- **Chrome MCP:** `click` on uid — works directly
- **Playwright:** `page.getByRole('button', { name: 'Subscribe' }).click()`

### Step 4: Wait for redirect to payment success page
- **Wait:** URL matches `/sign-up/{sessionId}/paid`
- **Timeout:** 60s (Stripe processing + redirect can take time)
- **Chrome MCP:** `wait_for` with text "Payment Successful"
- **Playwright:** `page.waitForURL(/\/paid/, { timeout: 60_000 })`

### Step 5: Verify payment success
- **Verify:** heading "Payment Successful!" visible
- **Verify:** button "Continue to Agreement" visible
- **Playwright:** `expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible()`

## Post-conditions

- Browser is on `/sign-up/{sessionId}/paid`
- Payment was processed successfully
- "Continue to Agreement" button is visible and clickable

## Confirmed Patterns (from Chrome MCP replay)

### Stripe Checkout inputs are NOT in iframes
In the hosted checkout page (`checkout.stripe.com/c/pay/...`), the card inputs are direct DOM elements, not inside iframes. This means standard `fill()` and `click()` work without frame switching.

### Stripe selectors — use a11y labels, not CSS selectors
The most stable way to target Stripe elements is via their accessible labels:
- `getByLabel('Card number')`
- `getByLabel('Expiration')`
- `getByLabel('CVC')`
- `getByLabel('Cardholder name')`
- `getByRole('button', { name: 'Subscribe' })`

These are more stable than CSS selectors because Stripe maintains a11y compliance.

### Test card
Stripe test mode accepts `4242 4242 4242 4242` with any future expiry and any 3-digit CVC.

### Redirect timing
After clicking Subscribe, Stripe processes the payment and redirects back to our app. This can take 5-15 seconds. Use a generous timeout (60s) for the URL wait.

### Country pre-selected
Stripe auto-selects the country based on the user's location (Colombia in this case). No need to change it for the test.
