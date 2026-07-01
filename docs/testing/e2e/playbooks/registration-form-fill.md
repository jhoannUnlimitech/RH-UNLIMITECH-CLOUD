# Playbook: Registration Form Fill (DetailsPage)

Source: Jam dd934bb1-aabf-4514-9fa5-83bca2b6cd00
Validated: Chrome MCP replay 2026-04-16

## Pre-conditions

- Browser is on `/sign-up/{sessionId}/details` (lead form was submitted successfully)
- `registration-form` context is present with `data-test-state="ready"`
- Shipping address defaults to "same as billing" (checkbox checked) — not toggled in this test

## Sequence

### Step 1-4: Company Selects (batch)

All four company selects use internal values that don't match the visible text.
In Chrome MCP, `fill()` fails because it expects visible text. Use `evaluate_script`
to set `.value` and dispatch `change` event on each.

In Playwright, use `selectOption(value)` which works with internal values directly.

| # | Selector | Value | Verify |
|---|----------|-------|--------|
| 1 | `[data-test-key="position-select"]` | `company_owner` | value = `company_owner` |
| 2 | `[data-test-key="company-type-select"]` | `sole_proprietor` | value = `sole_proprietor` |
| 3 | `[data-test-key="industry-select"]` | `education` | value = `education` |
| 4 | `[data-test-key="company-size-select"]` | `5_9` | value = `5_9` |

**Chrome MCP approach (confirmed working):**
```js
evaluate_script: () => {
  const dispatch = (el) => el.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('[data-test-key="position-select"]').value = 'company_owner'; dispatch(...);
  document.querySelector('[data-test-key="company-type-select"]').value = 'sole_proprietor'; dispatch(...);
  document.querySelector('[data-test-key="industry-select"]').value = 'education'; dispatch(...);
  document.querySelector('[data-test-key="company-size-select"]').value = '5_9'; dispatch(...);
}
```

**Playwright approach:**
```ts
await page.locator('[data-test-key="position-select"]').selectOption('company_owner');
await page.locator('[data-test-key="company-type-select"]').selectOption('sole_proprietor');
// etc.
```

### Step 5: Company Website Input
- **Selector:** `[data-test-key="company-website-input"]`
- **Action:** fill (click + type)
- **Value:** `http://mywebsite.com`
- **Verify:** input value = `http://mywebsite.com`
- **Chrome MCP:** `fill` on uid — works directly

### Step 6: Company Founded Input
- **Selector:** `[data-test-key="company-founded-input"]`
- **Action:** fill (click + type)
- **Value:** `2020`
- **Verify:** input value = `2020`
- **Chrome MCP:** `fill` on uid — works directly

### Step 7-8: Alternate Phone (3 sub-steps)

Same pattern as lead form PhoneInput. The component is `react-international-phone`
(third-party). Internal elements don't have `data-test-*` annotations.

**Sub-step 7a: Open country dropdown**
- **Selector:** `[data-test-key="alternate-phone-input"] .react-international-phone-country-selector-button`
- **Action:** click
- **Chrome MCP:** `evaluate_script` to click the button element

**Sub-step 7b: Select Colombia from dropdown**
- **Selector:** `li[data-country="co"]`
- **Action:** click (via evaluate_script — dropdown items are dynamic DOM)
- **Chrome MCP:** `evaluate_script` to find and click the `li` element
- **Note:** The dropdown search input is NOT reliably accessible via a11y tree. Use JS click directly.

**Sub-step 8: Type phone number**
- **Selector:** `[data-test-key="alternate-phone-input"] input[type="tel"]`
- **Action:** focus + click + pressSequentially (NOT fill — PhoneInput formats on keystroke)
- **Value:** `3003202000`
- **Verify:** input value matches `/\+57.*300.*320.*2000/`
- **Chrome MCP:** `evaluate_script` to focus, then `type_text`

### Step 9: Prosperity Planner Radio
- **Selector:** `[data-test-context="membership-preferences-prosperity-planner-section"] [data-test-key="radio-automatic"]`
- **Action:** click
- **Verify:** radio is checked
- **Chrome MCP:** `click` on uid of the radio element
- **Note:** `radio-automatic` exists in TWO contexts (prosperity-planner and hca-booklets). MUST use context selector to disambiguate in Playwright.

### Step 10: HCA Booklets Radio
- **Selector:** `[data-test-context="membership-preferences-hca-booklets-section"] [data-test-key="radio-automatic"]`
- **Action:** click
- **Verify:** radio is checked
- **Chrome MCP:** `click` on uid of the radio element

### Step 11-13: Interests Checkboxes
- **Context:** `[data-test-context="membership-preferences-interests-section"]`
- **Action:** click each checkbox by `data-test-key`
- **Chrome MCP:** `click` on uid of each checkbox element

| # | Key | Label |
|---|-----|-------|
| 11 | `checkbox-mastertech_software` | Business software solutions from Mastertech |
| 12 | `checkbox-hca_online` | Online materials from HCA |
| 13 | `checkbox-admin_knowhow` | Admin Know-How Program |

- **Verify:** each checkbox is checked after click

### Step 14-16: Email Newsletters Checkboxes
- **Context:** `[data-test-context="membership-preferences-email-newsletters-section"]`
- **Action:** click each checkbox by `data-test-key`
- **Chrome MCP:** `click` on uid of each checkbox element

| # | Key | Label |
|---|-----|-------|
| 14 | `checkbox-church_events` | Church-hosted events |
| 15 | `checkbox-hca_resources` | HCA resources and events |
| 16 | `checkbox-mastertech_updates` | Mastertech product updates |

- **Verify:** each checkbox is checked after click

### Step 17-20: Personal Address Inputs
- **Action:** fill (click + type) — all work directly with Chrome MCP `fill`

| # | Selector | Value |
|---|----------|-------|
| 17 | `[data-test-key="personal-street-input"]` | `My Address st` |
| 18 | `[data-test-key="personal-line2-input"]` | `apt 890` |
| 19 | `[data-test-key="personal-city-input"]` | `Doral` |
| 20 | `[data-test-key="personal-zip-input"]` | `33558` |

### Step 21: Personal Country Select
- **Selector:** `[data-test-key="personal-country-select"]`
- **Action:** evaluate_script to set value `USA` + dispatch change event
- **Verify:** select value = `USA`
- **Note:** Same as company selects — internal value doesn't match visible text. In Playwright use `selectOption('USA')`.

### Step 22: Personal State Select (cascading dependency)
- **Selector:** `[data-test-key="personal-state-select"]`
- **Pre-condition:** MUST wait for select to be enabled after country selection. React needs a tick to re-render with state options.
- **Action:** evaluate_script with `setTimeout(500ms)` to set value `FL` + dispatch change
- **Verify:** select value = `FL`
- **Playwright approach:** `await expect(stateSelect).toBeEnabled({ timeout: 5000 })` before `selectOption('FL')`

### Step 23: Birth Year Input
- **Selector:** `[data-test-key="birth-year-input"]`
- **Action:** fill
- **Value:** `1990`
- **Chrome MCP:** `fill` on uid — works directly

### Step 24-26: Education + Languages (batch)

All three are selects with internal values. Can be set in a single evaluate_script.

| # | Selector | Value | Verify |
|---|----------|-------|--------|
| 24 | `[data-test-key="education-select"]` | `associate_degree` | value = `associate_degree` |
| 25 | `[data-test-key="preferred-language-select"]` | `en` | value = `en` |
| 26 | `[data-test-key="secondary-language-select"]` | `es` | value = `es` |

**Chrome MCP approach (confirmed working):**
```js
evaluate_script: () => {
  const dispatch = (el) => el.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('[data-test-key="education-select"]').value = 'associate_degree'; dispatch(...);
  document.querySelector('[data-test-key="preferred-language-select"]').value = 'en'; dispatch(...);
  document.querySelector('[data-test-key="secondary-language-select"]').value = 'es'; dispatch(...);
}
```

## Post-conditions

- No validation errors visible: `[data-test-state="error"]` count = 0
- Submit button (`[data-test-key="submit-button"]`) is enabled with `data-test-state="ready"`
- Back button (`[data-test-key="back-button"]`) is visible
- Form is NOT submitted (playbook ends before click on submit)

## Confirmed Patterns

### Selects with internal values
Chrome MCP `fill()` fails on `<select>` elements when the option text doesn't match the value.
Use `evaluate_script` to set `.value` + dispatch `change`. In Playwright, `selectOption(value)` works directly.

### PhoneInput (react-international-phone)
Three-step interaction: (1) click country button, (2) JS click `li[data-country="xx"]`, (3) focus + type digits.
The dropdown search input is not reliably accessible. Use direct JS click on the list item.
Use `pressSequentially` (not `fill`) because the component formats on each keystroke.

### Radio disambiguation
`radio-automatic` appears in two contexts. Always use the full context path:
- `[data-test-context="membership-preferences-prosperity-planner-section"] [data-test-key="radio-automatic"]`
- `[data-test-context="membership-preferences-hca-booklets-section"] [data-test-key="radio-automatic"]`

### Country/State cascading
After setting a country select, React needs time to re-render the state select with new options.
In Chrome MCP: use `setTimeout(500ms)` inside evaluate_script.
In Playwright: use `await expect(stateSelect).toBeEnabled({ timeout: 5000 })`.

### Shipping address
Default is "same as billing" (checkbox checked). This playbook does NOT toggle it.
A separate playbook variant would uncheck it and fill the shipping address fields.
