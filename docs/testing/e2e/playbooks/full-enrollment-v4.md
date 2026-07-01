# Playbook: Full Enrollment V4

Source: Jam `01e8f2d9-9734-49b8-a29a-6e88f51c0556`
Duration: 5m 12s
Author: Moises Gonzalez
Date: 2026-05-01

## Flow Order (V4)

```
/sign-up?plan=general&interval=year&country=USA
  → /general-info     (Lead Form)
  → /details          (Registration Form)
  → /plan             (Plan Selection — paso 3)
  → /thank-you        (esperar email)
  → [Email 1: Verify your email]
  → /verify?token=... (verificar email)
  → /agreement        (Zoho Sign iframe)
  → /agreement-signed (confirmación firma)
  → [Email 2: Agreement Signed]
  → /checkout         (Stripe redirect)
  → /paid             (confirmación pago, status: completed)
  → [Email 3: Welcome to WISE!]
```

## Pre-conditions

- Backend running (API + SQS + SendEmail Lambda + Cloud Core + Cloud Stripe)
- Mailosaur credentials configured
- Zoho Sign template configured (single or dual signer)
- Stripe test mode active

## Query Params (all optional, independent)

| Param | Value | Effect |
|-------|-------|--------|
| `plan` | `general` | Pre-highlights plan in Plan Selection |
| `interval` | `year` | Pre-selects annual toggle |
| `country` | `USA` | Pre-fills country in General Info |

**Key V4 change:** `plan+interval` does NOT skip plan selection. It only pre-selects.

---

## Sequence

### Phase 1: General Info (Lead Form)

#### Step 1: Navigate
- **URL:** `/sign-up?plan=general&interval=year&country=USA`
- **Redirects to:** `/sign-up/{sessionId}/general-info?plan=general&interval=year&country=USA`
- **Verify:** Form visible, country pre-filled with "USA" (from params)

#### Step 2: First Name
- **Selector:** `[data-test-key="first-name-input"]`
- **Action:** fill
- **Value:** `Unlimitech`

#### Step 3: Last Name
- **Selector:** `[data-test-key="last-name-input"]` (Tab from first name)
- **Action:** fill
- **Value:** `Cloud`

#### Step 4: Email
- **Selector:** email input (Tab from last name)
- **Action:** fill (Ctrl+V from Mailosaur)
- **Value:** `{generated}@{serverId}.mailosaur.net`

#### Step 5: Company Name
- **Selector:** `[data-test-key="company-name-input"]`
- **Action:** fill
- **Value:** `Unlimitech Testing LLC`

#### Step 6: Phone
- **Selector:** PhoneInput (react-international-phone)
- **Action:** click tel input + type digits
- **Value:** Country: US (+1), Number: `3000000000`
- **Note:** Country already US (default for USA country param)

#### Step 7: Street
- **Selector:** `[data-test-key="street-input"]`
- **Action:** fill
- **Value:** `My Address`

#### Step 8: City
- **Selector:** `[data-test-key="city-input"]`
- **Action:** fill
- **Value:** `My City`

#### Step 9: Zip
- **Selector:** `[data-test-key="zip-input"]`
- **Action:** fill
- **Value:** `11111`

#### Step 10: Country (already pre-filled)
- **Selector:** `[data-test-key="country-select"]`
- **Action:** verify value = `USA` (pre-filled from params)
- **Note:** No action needed if pre-filled correctly

#### Step 11: Submit Lead Form
- **Selector:** `[data-test-key="submit-button"][data-test-state="ready"]`
- **Action:** click
- **Verify:** Navigates to `/details`

---

### Phase 2: Details (Registration Form)

#### Step 12: Position
- **Selector:** `[data-test-key="position-select"]`
- **Action:** selectOption
- **Value:** `company_owner`

#### Step 13: Company Type
- **Selector:** `[data-test-key="company-type-select"]`
- **Action:** selectOption
- **Value:** `llc`

#### Step 14: Industry
- **Selector:** `[data-test-key="industry-select"]`
- **Action:** selectOption
- **Value:** `architecture`

#### Step 15: Company Size
- **Selector:** `[data-test-key="company-size-select"]`
- **Action:** selectOption
- **Value:** `20_49`

#### Step 16: Company Founded
- **Selector:** `[data-test-key="company-founded-input"]`
- **Action:** fill
- **Value:** `2010`

#### Step 17: Same as Billing (uncheck + recheck)
- **Selector:** `[data-test-key="same-as-billing-checkbox"]`
- **Action:** click (uncheck), click (recheck)
- **Note:** User toggled to see shipping fields, then re-checked

#### Step 18: Alternate Phone
- **Selector:** PhoneInput (alternate)
- **Action:** type digits
- **Value:** Country: US (+1), Number: `3000000000`

#### Step 19: Prosperity Planner
- **Selector:** `[data-test-key="radio-on-request"]` (in prosperity-planner context)
- **Action:** click
- **Value:** `on_request`

#### Step 20: HCA Booklets
- **Selector:** `[data-test-key="radio-on-request"]` (in hca-booklets context)
- **Action:** click
- **Value:** `on_request`

#### Step 21: Interests — HCA Online
- **Selector:** `[data-test-key="checkbox-hca-online"]`
- **Action:** check

#### Step 22: Interests — HCA Printed
- **Selector:** `[data-test-key="checkbox-hca-printed"]`
- **Action:** check

#### Step 23: Email Newsletters — None
- **Selector:** `[data-test-key="checkbox-none"]`
- **Action:** check

#### Step 24: Personal Address — Street
- **Selector:** `[data-test-key="personal-street-input"]`
- **Action:** fill
- **Value:** `My Address 2`

#### Step 25: Personal Address — Country
- **Selector:** `[data-test-key="personal-country-select"]`
- **Action:** selectOption
- **Value:** `USA`

#### Step 26: Personal Address — City
- **Selector:** `[data-test-key="personal-city-input"]`
- **Action:** fill
- **Value:** `My City 2`

#### Step 27: Personal Address — Zip
- **Selector:** `[data-test-key="personal-zip-input"]`
- **Action:** fill
- **Value:** `111111`

#### Step 28: Birth Year
- **Selector:** `[data-test-key="birth-year-input"]`
- **Action:** fill
- **Value:** `1980`

#### Step 29: Education
- **Selector:** `[data-test-key="education-select"]`
- **Action:** selectOption
- **Value:** `doctorate`

#### Step 30: Preferred Language
- **Selector:** `[data-test-key="preferred-language-select"]`
- **Action:** selectOption
- **Value:** `en`

#### Step 31: Secondary Language
- **Selector:** `[data-test-key="secondary-language-select"]`
- **Action:** selectOption
- **Value:** `es`

#### Step 32: Submit Registration
- **Selector:** `[data-test-key="submit-button"][data-test-state="ready"]`
- **Action:** click
- **Verify:** Navigates to `/plan`

---

### Phase 3: Plan Selection

#### Step 33: Toggle to Annual (if not already)
- **Selector:** `[data-test-key="annually-button"]`
- **Action:** click (toggle was on monthly, user clicked monthly then annually)
- **Verify:** `[data-test-state="active"]`

#### Step 34: Select General Plan
- **Selector:** `[data-test-key="choose-plan-button"]` (on General plan card)
- **Action:** click
- **Verify:** Navigates to `/thank-you`
- **Note:** Plan was pre-highlighted from params, user just clicks Select

---

### Phase 4: Email Verification

#### Step 35: Thank You Page
- **Verify:** Page shows "check your email" message
- **Action:** Wait for email delivery (~30s)

#### Step 36: Email 1 — Verification Email
- **Source:** Mailosaur inbox
- **Subject:** "Verify your email — WISE Membership"
- **Sender:** `contact@unlimitech.cloud`
- **Contains:** Link with `/verify?token={hash}`
- **Action:** Extract verification link

#### Step 37: Click Verification Link
- **URL:** `/sign-up/{sessionId}/verify?token={hash}`
- **Verify:** Email verified, page shows "Continue to Membership Agreement"
- **Action:** Click "Continue to Membership Agreement" button
- **Selector:** `[data-test-key="continue-button"]`
- **Navigates to:** `/agreement`

---

### Phase 5: Agreement Signing (Zoho Sign)

#### Step 38: Agreement Page
- **Verify:** Zoho Sign iframe loads (polling for `ready` status)
- **Timing:** Initial polling ~3-5s until `signingUrl` available

#### Step 39: Sign Agreement
- **Action:** Complete Zoho Sign flow in iframe
- **Steps:** Start signing → Accept terms → Add signature → Add initials → Finish
- **Signer Name:** `Unlimitech Cloud`
- **Signer Initials:** `UC`
- **Timing:** ~30s for signing + webhook processing

#### Step 40: Agreement Signed Page
- **Verify:** Page shows confirmation of signature
- **Selector:** `[data-test-key="continue-button"]` text: "Continue to Payment"

#### Step 41: Email 2 — Agreement Signed Email
- **Source:** Mailosaur inbox
- **Subject:** Contains "Agreement Signed"
- **Sender:** `contact@unlimitech.cloud`
- **Contains:** Link to `/agreement-signed`
- **Timing:** Arrives within ~30s of signing

#### Step 42: Continue to Payment
- **Selector:** `[data-test-key="continue-button"]`
- **Action:** click
- **Navigates to:** `/checkout`

---

### Phase 6: Stripe Checkout

#### Step 43: Checkout Page → Stripe Redirect
- **Verify:** Page calls `POST /enrollment/checkout`
- **Response:** `{ checkoutUrl, stripeSessionId, customerId }`
- **Action:** Auto-redirect to Stripe hosted checkout
- **Timing:** ~8s for Stripe session creation + redirect

#### Step 44: Complete Stripe Payment
- **URL:** `checkout.stripe.com/c/pay/...`
- **Action:** Fill test card (4242...) + submit
- **Verify:** Stripe redirects back to app

#### Step 45: Paid Page
- **URL:** `/sign-up/{sessionId}/paid`
- **Verify:** Session status = `completed`, `paid: true`
- **Selector:** `[data-test-context="confirmation-details"]`

#### Step 46: Email 3 — Welcome Email
- **Source:** Mailosaur inbox
- **Subject:** Contains "Welcome to WISE"
- **Sender:** `contact@unlimitech.cloud`
- **Timing:** Arrives within ~90s (webhook → SQS → Lambda processing)

---

## Emails Summary (3 system emails, ignore CRM emails)

| # | Trigger | Subject | Sender | Contains |
|---|---------|---------|--------|----------|
| 1 | After Plan Selection submit | "Verify your email — WISE Membership" | contact@unlimitech.cloud | `/verify?token=` link |
| 2 | After Agreement signed | Contains "Agreement Signed" | contact@unlimitech.cloud | `/agreement-signed` link |
| 3 | After Payment completed | Contains "Welcome to WISE" | contact@unlimitech.cloud | Enrollment complete message |

**Ignore:** Emails from `contacts.zoho.com`, `zoho.com`, or any Zoho CRM domain.

---

## Confirmed Patterns

### Query Params (V4 behavior)
- `plan+interval` does NOT skip plan selection — only pre-selects
- `country` pre-fills the country select in General Info
- All params are optional and independent
- Without params, flow starts at `/general-info` with no pre-selections

### Timing
- Email delivery: 10-30s (verification), 10-30s (agreement-signed), 30-90s (welcome)
- Zoho Sign polling: 3-5s initial, then 5s intervals until `signed`
- Stripe session creation: 7-8s
- Stripe checkout completion: depends on test card fill speed

### Session Status Transitions
```
lead → registered → email_sent → email_verified →
pending_signature → agreement_signed → pending → paid → completed
```
