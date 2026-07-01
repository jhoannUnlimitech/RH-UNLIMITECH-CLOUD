# Playbook: Language Selector — Switch between EN and ES

Source: Jam `9b2e11f5-5b50-4584-875a-61894574bf64`
Duration: 25s
Flow: Form 1 (General Info) — toggle language via selector, verify labels change

---

## Pre-conditions

- App enrollment running (local or live)
- Page loaded on Form 1 (`/sign-up/{sessionId}/general-info`)
- Initial language: Spanish (loaded via `?lang=es-CO` or browser detection)

---

## Sequence

### Step 1: Verify initial state — Spanish

- **Verify:** Selector trigger button text = "Español"
- **Verify:** Form labels in Spanish:
  - "Nombre" (Name section)
  - "Correo Electrónico de la Empresa" (Email section)
  - "Nombre de la Empresa" (Company Name section)
  - "Teléfono de la Empresa" (Phone section)
- **Verify:** Submit button text = "Continuar"

### Step 2: Open language selector

- **Selector:** `[data-test-key="language-selector"] button`
- **Action:** click
- **Verify:** Dropdown visible (`[role="listbox"]` appears)
- **Verify:** Two options visible:
  - `[data-test-key="language-option-en-us"]` — "English" + "English"
  - `[data-test-key="language-option-es-co"]` — "Español" + "Spanish"
- **Verify:** es-co option has `aria-selected="true"` (current)

### Step 3: Switch to English

- **Selector:** `[data-test-key="language-option-en-us"]`
- **Action:** click
- **Verify:** Dropdown closes (listbox disappears)
- **Verify:** Selector trigger text changes to "English"
- **Verify:** Form labels change to English:
  - "Name" (Name section)
  - "Company Email Address" (Email section)
  - "Company Name" (Company Name section)
  - "Phone" (Phone section)
- **Verify:** Submit button text = "Next"
- **Verify:** localStorage key `enrollment_language` = `en-US`

### Step 4: Re-open selector and switch back to Spanish

- **Selector:** `[data-test-key="language-selector"] button`
- **Action:** click
- **Verify:** Dropdown visible
- **Verify:** en-us option has `aria-selected="true"` (current)

### Step 5: Select Español

- **Selector:** `[data-test-key="language-option-es-co"]`
- **Action:** click
- **Verify:** Dropdown closes
- **Verify:** Selector trigger text = "Español"
- **Verify:** Form labels back to Spanish:
  - "Nombre"
  - "Correo Electrónico de la Empresa"
  - "Nombre de la Empresa"
  - "Teléfono de la Empresa"
- **Verify:** Submit button text = "Continuar"
- **Verify:** localStorage key `enrollment_language` = `es-CO`

### Step 6: Rapid toggle (stability check)

- **Action:** Open selector → click EN → wait for labels to change
- **Action:** Open selector → click ES → wait for labels to change
- **Action:** Open selector → click EN → wait for labels to change
- **Verify:** No errors in console, no flash of wrong language, final state = English

---

## Post-conditions

- Language selector shows current language correctly
- Form labels match the selected language
- localStorage persists the last choice
- No page reload occurred (URL unchanged except initial session)

---

## Confirmed Patterns

### Language Selector Interaction

1. **Open:** Click on the trigger button (`[data-test-key="language-selector"] button`)
2. **Select:** Click on the option (`[data-test-key="language-option-{code}"]`)
3. **Verify close:** `[role="listbox"]` no longer visible
4. **Wait for i18n load:** Spanish requires network fetch — use `toContainText` with timeout

### Label Verification Strategy

- Use `data-test-context` sections to scope the text check
- Read expected text from `fixtures/i18n.ts` (never hardcode)
- Key sections to verify:
  - `[data-test-context="name-section"]` → `signUp.generalInfo.name.label`
  - `[data-test-context="email-section"]` → `signUp.generalInfo.email.label`
  - `[data-test-context="company-name-section"]` → `signUp.generalInfo.companyName.label`
  - `[data-test-context="phone-section"]` → `signUp.generalInfo.phone.label`
  - Submit button → `common.buttons.next`

### Timing Notes

- EN → ES: requires network fetch (~200-500ms local, up to 2s live)
- ES → EN: instant (EN is bundled)
- Always use `expect(...).toContainText(text, { timeout: 10_000 })` for ES

### Form Data Preservation

The Jam shows the user clicking on labels AFTER switching language — confirming the form state is preserved. If the user had filled fields before switching, the values would remain (MobX store is independent of i18n).

---

## i18n Keys for Verification (from translation JSONs)

| Section | Key | EN | ES |
|---------|-----|----|----|
| Name | `signUp.generalInfo.name.label` | Name | Nombre |
| Email | `signUp.generalInfo.email.label` | Company Email Address | Correo Electrónico de la Empresa |
| Company Name | `signUp.generalInfo.companyName.label` | Company Name | Nombre de la Empresa |
| Phone | `signUp.generalInfo.phone.label` | Phone | Teléfono de la Empresa |
| Button | `signUp.generalInfo.submitButton` | Continue | Continuar |
