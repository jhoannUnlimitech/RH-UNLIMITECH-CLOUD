# Criterios de Aceptación — Rules Compliance: Wording & Composition

> **Branch:** `bugfix/enrollment-text-corrections`
> **Fecha:** 2026-06-24
> **Última ejecución:** 2026-06-24 (30/30 pass — 33s) — Compliance: 67/87 (77%)
> **Rules Document:** Rules & Workflow Specification Manual (Revised: June 15, 2026)
> **Idioma de validación:** English (en-US) — idioma primario del Rules Document
> **Fuente de revisión:** `.temp/note_review_forms_enrollments.md`

---

## Descripción

Validación automatizada de que todos los textos visibles al usuario (labels, hints, placeholders,
opciones de dropdowns, screen messages, y composición visual) coinciden con el Rules Document.
Cada AC valida un campo o texto específico contra su regla de referencia.

**Estrategia:** Navegar con `?lang=en-US`, validar textos en inglés y composición (orden DOM).

---

## Reglas de Referencia (del note_review_forms_enrollments.md)

| Regla | Página | Sección | Descripción |
|-------|--------|---------|-------------|
| R-F1 | pg 62-64 | Form 1: General Information | Labels, hints, placeholders, phone type options |
| R-F2 | pg 65-75 | Form 2: Company & Profile Details | Position, Type, Industry, Size, Website, Phones, Preferences, Education, Languages |
| R-SC | pg 79 | User Screen Messages | Email Verified, Agreement Signed, Welcome/Paid |
| R-EM | pg 79-80 | Email Notifications (Member) | Verify, Agreement Signed, Welcome, Payment Transaction, Post-Countersign |
| R-DR | pg 76-78 | Dropdown Options | 30 languages, 95 countries, Position, CompanyType, Industry, Size, Education |
| R-CO | pg 62-80 | Composition (visual order) | Orden label→hint→field, sections en secuencia Rules |

---

## Grupo A: Form 1 — General Information (R-F1)

**Método:** Browser — navigate to `/sign-up/{id}/general-info?lang=en-US`
**POM:** `general-info.pom.ts`

| ID | Regla | Campo | Elemento | Texto esperado (Rules) | i18n key | Estado |
|----|-------|-------|----------|----------------------|----------|--------|
| AC-RC-A01 | R-F1 | First Name | label | "First" | `signUp.generalInfo.name.first` | 🔲 |
| AC-RC-A02 | R-F1 | Last Name | label | "Last" | `signUp.generalInfo.name.last` | 🔲 |
| AC-RC-A03 | R-F1 | Company Name | hint | "Enter your name if you do not have a separate company name." | `signUp.generalInfo.companyName.hint` | 🔲 |
| AC-RC-A04 | R-F1 | Phone | label | "Phone" | `signUp.generalInfo.phone.label` | 🔲 |
| AC-RC-A05 | R-F1 | Phone | hint | "Enter your personal phone number if you do not have a separate company phone number." | `signUp.generalInfo.phone.hint` | 🔲 |
| AC-RC-A06 | R-F1 | Phone Type | default value | "Cell / Mobile" (first option selected) | `options.phone.types.mobile` | 🔲 |
| AC-RC-A07 | R-F1 | Phone Type | options count | 3 opciones: Cell/Mobile, Company, Home | `signUp.generalInfo.phone.types.*` | 🔲 |
| AC-RC-A08 | R-F1 | Email | label | "Company Email Address" | `signUp.generalInfo.email.label` | 🔲 |
| AC-RC-A09 | R-F1 | Email | hint | "Enter your personal email address if you do not have a separate company email address." | `signUp.generalInfo.email.hint` | 🔲 |
| AC-RC-A10 | R-F1 | Address | hint | "Enter your personal address if you do not have a separate company address." | `signUp.generalInfo.address.hint` | 🔲 |
| AC-RC-A11 | R-F1 | Referral | placeholder | "How did you hear about WISE?" | `signUp.generalInfo.referral.placeholder` | 🔲 |
| AC-RC-A12 | R-F1 | Country | options | 95 países del WISE Continents chart | Browser: count `<option>` | 🔲 |
| AC-RC-A13 | R-F1 | Composition | order | Secciones en orden: Name → Email → Company → Phone → Address → Referral → Submit | DOM order validation | 🔲 |

---

## Grupo B: Form 2 — Company & Profile Details (R-F2)

**Método:** Browser — navigate to Form 2 (requiere Form 1 completado)
**POM:** `details.pom.ts`

### B.1 Company Details

| ID | Regla | Campo | Elemento | Texto esperado (Rules) | i18n key | Estado |
|----|-------|-------|----------|----------------------|----------|--------|
| AC-RC-B01 | R-F2 | Position | hint | "Select your legal relationship to the Company." | `signUp.details.position.hint` | 🔲 |
| AC-RC-B02 | R-F2 | Position | options | 5: Owner, Partner, Officer, Employee, Contractor | `options.position.*` | 🔲 |
| AC-RC-B03 | R-F2 | Company Type | hint | "Select the type of entity under which the Company is registered and operating." | `signUp.details.companyType.hint` | 🔲 |
| AC-RC-B04 | R-F2 | Company Type | options | 7 + Other | `options.companyType.*` | 🔲 |
| AC-RC-B05 | R-F2 | Website | hint | "Enter your Company website or social media sites so we can better serve you." | `signUp.details.companyWebsite.hint` | 🔲 |
| AC-RC-B06 | R-F2 | Website | checkbox | "My Company does not have a Website or Social media account." | `signUp.details.companyWebsite.noWebsite` | 🔲 |
| AC-RC-B07 | R-F2 | Website | add button | Rules: "Additional company website or social media channel." vs actual: "+ Add another URL" | `signUp.details.companyWebsite.addButton` | 🔲 |
| AC-RC-B08 | R-F2 | Industry | hint | "Select the main industry in which the Company operates." | `signUp.details.industry.hint` | 🔲 |
| AC-RC-B09 | R-F2 | Industry | options | 45 + Other | `options.industry.*` | 🔲 |
| AC-RC-B10 | R-F2 | Company Size | hint | "Select the number of full-time employees working for the Company (Not including the Company owner)." | `signUp.details.companySize.hint` | 🔲 |
| AC-RC-B11 | R-F2 | Company Size | options | 9 opciones (0 → 500+) | `options.companySize.*` | 🔲 |
| AC-RC-B12 | R-F2 | Company Founded | hint | "Enter the year the Company was founded." | `signUp.details.companyFounded.hint` | 🔲 |

### B.2 Addresses & Phone

| ID | Regla | Campo | Elemento | Texto esperado (Rules) | i18n key | Estado |
|----|-------|-------|----------|----------------------|----------|--------|
| AC-RC-B13 | R-F2 | Billing | checkbox | "Same as Company address" | `signUp.details.billingAddress.sameAsCompany` | 🔲 |
| AC-RC-B14 | R-F2 | Shipping | checkbox | Rules: "Same as Company address" — **actual: "Same as Company address"** | `signUp.details.shippingAddress.sameAsBilling` | 🔲 |
| AC-RC-B15 | R-F2 | Additional Phone | required | Rules: Required — actual: Optional | Browser: submit empty → check error | 🔲 |
| AC-RC-B16 | R-F2 | Additional Phone | type default | "Cell / Mobile" | `signUp.details.alternatePhone.types.mobile` | 🔲 |

### B.3 Membership Preferences

| ID | Regla | Campo | Elemento | Texto esperado (Rules) | i18n key | Estado |
|----|-------|-------|----------|----------------------|----------|--------|
| AC-RC-B17 | R-F2 | Prosperity Planner | hint | "(preferences can be changed later):" — Rules tiene "preferences" | `signUp.details.prosperityPlanner.hint` | 🔲 |
| AC-RC-B18 | R-F2 | Prosperity Planner | options | "Ship upon request; Ship automatically" | `options.prosperityPlanner.*` | 🔲 |
| AC-RC-B19 | R-F2 | HCA Booklets | disclaimer | "*Some items may not be available in all languages and regions." | `signUp.details.hcaBooklets.note` | 🔲 |
| AC-RC-B20 | R-F2 | HCA Booklets | options | "Ship upon request; Ship automatically" | `options.hcaBooklets.*` | 🔲 |
| AC-RC-B21 | R-F2 | Interests | hint | "Please indicate which topics you would like to learn more about." | `signUp.details.interests.hint` | 🔲 |
| AC-RC-B22 | R-F2 | Interests | options | 8 opciones (incl. None) | `options.interests.*` | 🔲 |
| AC-RC-B23 | R-F2 | Email Newsletters | hint | Rules: "sign up for" (sin hyphen) — actual: "sign-up for" | `signUp.details.emailNewsletters.hint` | 🔲 |
| AC-RC-B24 | R-F2 | Email Newsletters | options | 6 opciones (incl. None) | `options.emailNewsletters.*` | 🔲 |

### B.4 Personal Profile

| ID | Regla | Campo | Elemento | Texto esperado (Rules) | i18n key | Estado |
|----|-------|-------|----------|----------------------|----------|--------|
| AC-RC-B25 | R-F2 | Personal Address | checkbox | "Same as Company Address" | `signUp.details.personalAddress.sameAsCompany` | 🔲 |
| AC-RC-B26 | R-F2 | Birth Year | required | Optional (no error when empty) | Browser: submit → no error | 🔲 |
| AC-RC-B27 | R-F2 | Profile Image | hint | "JPG or PNG, max 10 MB" | `signUp.details.profilePhoto.hint` | 🔲 |
| AC-RC-B28 | R-F2 | Profile Image | description | "Upload a picture of yourself for your Membership Profile..." | `signUp.details.profilePhoto.description` | 🔲 |
| AC-RC-B29 | R-F2 | Education | options | 9 opciones — Rules: "Some College or University" vs actual: "Some College" | `options.education.*` | 🔲 |
| AC-RC-B30 | R-F2 | Education | details rule | If NOT "High School/No Diploma" → details required | Browser: select + submit → error | 🔲 |
| AC-RC-B31 | R-F2 | Preferred Language | first option | English first | Browser: check first `<option>` | 🔲 |
| AC-RC-B32 | R-F2 | Preferred Language | count | Rules: 30 idiomas — actual: 183 | Browser: count `<option>` | 🔲 |
| AC-RC-B33 | R-F2 | Preferred Language | custom entries | Cantonese, Mandarin, Farsi, French Canadian present | Browser: search options | 🔲 |
| AC-RC-B34 | R-F2 | Composition | order | Sections: Position → Type → Website → Industry → Size → Founded → Billing → Shipping → Phone → Preferences → Personal → Photo → Education → Languages → Submit | DOM order | 🔲 |

---

## Grupo C: Screen Messages (R-SC)

**Método:** Browser — requiere flujo completo hasta cada screen
**Idioma:** English (`?lang=en-US`)

### C.1 Email Verified Screen (`/verify`)

| ID | Regla | Elemento | Texto esperado (Rules pg 79) | i18n key | Estado |
|----|-------|----------|------------------------------|----------|--------|
| AC-RC-C01 | R-SC | title | "Email verified!" | `signUp.verify.successTitle` | 🔲 |
| AC-RC-C02 | R-SC | body | "Your email address has been verified successfully." | `signUp.verify.successMessage` | 🔲 |
| AC-RC-C03 | R-SC | CTA button | "Continue to Membership Agreement" | `signUp.verify.continueButton` | 🔲 |
| AC-RC-C04 | R-SC | composition | title above body, body above CTA | DOM order | 🔲 |

### C.2 Agreement Signed Screen (`/agreement-signed`)

| ID | Regla | Elemento | Texto esperado (Rules pg 79) | i18n key | Discrepancia | Estado |
|----|-------|----------|------------------------------|----------|-------------|--------|
| AC-RC-C05 | R-SC | title | "WISE Membership Agreement Signed!" | `signUp.agreementSigned.title` | ❌ Actual: "Agreement Signed!" — falta "WISE Membership" | 🔲 |
| AC-RC-C06 | R-SC | body | "Thank you for signing your WISE Membership Agreement." | `signUp.agreementSigned.subtitle` | ❌ Actual: "Your membership agreement has been signed successfully." | 🔲 |
| AC-RC-C07 | R-SC | extra text | NO debe existir "The next step is to complete your membership payment." | `signUp.agreementSigned.nextStep` | ❌ Actual: existe y no debería | 🔲 |
| AC-RC-C08 | R-SC | CTA button | "Continue to Payment" | `signUp.agreementSigned.continueButton` | ✅ Match | 🔲 |
| AC-RC-C09 | R-SC | composition | title → body → CTA (sin texto extra entre body y CTA) | DOM order | 🔲 |

### C.3 Paid/Welcome Screen (`/paid`)

| ID | Regla | Elemento | Texto esperado (Rules) | i18n key | Estado |
|----|-------|----------|----------------------|----------|--------|
| AC-RC-C10 | R-SC | title | "Welcome to WISE!" | `signUp.paid.title` | 🔲 |
| AC-RC-C11 | R-SC | subtitle | Consistent with welcome email content | `signUp.paid.subtitle` | 🔲 |
| AC-RC-C12 | R-SC | checkmarks | Agreement signed + Payment confirmed + Email sent | `signUp.paid.agreementConfirmed/paymentConfirmed/emailSent` | 🔲 |
| AC-RC-C13 | R-SC | composition | title → subtitle → checkmarks → footer | DOM order | 🔲 |

---

## Grupo D: Email Wording (R-EM)

**Método:** Mailosaur — requiere flujo completo con enrollment real
**Idioma:** English (email subject + body)

### D.1 Agreement Signed Email

| ID | Regla | Elemento | Texto esperado (Rules pg 79) | Discrepancia | Estado |
|----|-------|----------|------------------------------|-------------|--------|
| AC-RC-D01 | R-EM | subject | "WISE Membership Agreement Signed!" | ❌ Actual: falta "WISE Membership" | 🔲 |
| AC-RC-D02 | R-EM | body title | "WISE Membership Agreement Signed!" | ❌ Same as subject | 🔲 |
| AC-RC-D03 | R-EM | body text | "Thank you for signing your WISE Membership Agreement." | ❌ Actual: wording diferente | 🔲 |
| AC-RC-D04 | R-EM | no extra text | NO debe existir "The next step is to select your membership plan..." | ❌ Actual: existe | 🔲 |
| AC-RC-D05 | R-EM | CTA button | "Continue to Payment" | Match | 🔲 |
| AC-RC-D06 | R-EM | count | Solo 1 email (NO duplicado) | ❌ BUG: llega 2 veces | 🔲 |

### D.2 Welcome Email (post-payment) — Ticket #903

| ID | Regla | Elemento | Texto esperado (Rules pg 80 "New Subscription") | Discrepancia | Estado |
|----|-------|----------|------------------------------------------------|-------------|--------|
| AC-RC-D07 | R-EM | body | "Thank you for your payment. Your receipt is attached to this email." | ❌ Actual: "Your enrollment is now complete. Thank you for joining..." | 🔲 |
| AC-RC-D08 | R-EM | 5 days notice | "Please allow up to five (5) business days for your Membership Application to be processed." | ❌ NO existe | 🔲 |
| AC-RC-D09 | R-EM | notification | "You will receive an email notification once this is complete." | ❌ NO existe | 🔲 |
| AC-RC-D10 | R-EM | receipt | "[RECEIPT ATTACHED]" — Stripe receipt PDF adjunto | ❌ NO implementado | 🔲 |

### D.3 Payment Transaction Email (ALL payments)

| ID | Regla | Elemento | Texto esperado (Rules pg 80) | Estado |
|----|-------|----------|------------------------------|--------|
| AC-RC-D11 | R-EM | existence | Email "Payment Transaction" debe existir | ❌ NO implementado | 🔲 |
| AC-RC-D12 | R-EM | body | "Thank you for your WISE Membership payment. Your receipt is attached." | ❌ NO implementado | 🔲 |

### D.4 Post-Countersign Email

| ID | Regla | Elemento | Texto esperado (Rules pg 80) | Estado |
|----|-------|----------|------------------------------|--------|
| AC-RC-D13 | R-EM | existence | Email post-countersign debe existir con download link | ❌ NO implementado | 🔲 |
| AC-RC-D14 | R-EM | body | "Your WISE Membership Agreement has been processed. [DOWNLOAD]" | ❌ NO implementado | 🔲 |

---

## Grupo E: Dropdown Content (R-DR)

**Método:** Browser — read `<option>` elements from selects
**POM:** Selectors from `general-info.pom.ts` y `details.pom.ts`

| ID | Regla | Dropdown | Validación | Valor esperado | Estado |
|----|-------|----------|-----------|----------------|--------|
| AC-RC-E01 | R-DR | Country (Form 1) | count | 95 países | 🔲 |
| AC-RC-E02 | R-DR | Country (Form 1) | content | Solo países del WISE Continents chart | 🔲 |
| AC-RC-E03 | R-DR | Preferred Language | count | 30 idiomas (no 183) | 🔲 |
| AC-RC-E04 | R-DR | Preferred Language | content | Los 30 idiomas del Rules (incl. Cantonese, Mandarin, Farsi, French Canadian) | 🔲 |
| AC-RC-E05 | R-DR | Preferred Language | order | English first | 🔲 |
| AC-RC-E06 | R-DR | Secondary Language | same as Preferred | Misma lista que Preferred Language | 🔲 |
| AC-RC-E07 | R-DR | Position | count + content | 5 opciones correctas | 🔲 |
| AC-RC-E08 | R-DR | Company Type | count + content | 7 + Other | 🔲 |
| AC-RC-E09 | R-DR | Industry | count + content | 45 + Other | 🔲 |
| AC-RC-E10 | R-DR | Company Size | count + content | 9 opciones correctas | 🔲 |
| AC-RC-E11 | R-DR | Education | count + content | 9 opciones — incl. "Some College or University" | 🔲 |
| AC-RC-E12 | R-DR | Phone Type (Form 1) | count + content | 3: Cell/Mobile, Company, Home | 🔲 |
| AC-RC-E13 | R-DR | Additional Phone Type | count + content | 3: Cell/Mobile, Company, Home | 🔲 |

---

## Resumen

| Grupo | ACs | Descripción | Método | Discrepancias conocidas |
|-------|-----|-------------|--------|------------------------|
| A — Form 1 wording | 13 | Labels, hints, composition | Browser (Form 1 visible) | 0 |
| B — Form 2 wording | 34 | Labels, hints, options, composition | Browser (Form 2 visible) | 7 |
| C — Screens | 13 | Titles, bodies, CTAs, composition | i18n + Browser | 2 |
| D — Emails | 14 | Subjects, bodies, attachments, count | Source code analysis | 8 |
| E — Dropdowns | 13 | Option count + content + order | Browser (Form 1 + Form 2) | 3 |
| **Total** | **87** | | | **20 esperados FAIL** |

---

## Discrepancias conocidas (esperadas como FAIL hasta corrección)

| # | AC | Discrepancia | Tipo |
|---|---|---|---|
| 1 | AC-RC-B07 | Website Add button: "+ Add another URL" vs "Additional company website or social media channel." | Wording |
| 2 | AC-RC-B15 | Additional Phone: Optional vs Required | Behavior |
| 3 | AC-RC-B17 | Prosperity hint: falta "preferences" | Wording |
| 4 | AC-RC-B23 | Email newsletters: "sign-up" vs "sign up" (hyphen) | Wording |
| 5 | AC-RC-B29 | Education: "Some College" vs "Some College or University" | Wording |
| 6 | AC-RC-B32 | Language: 183 idiomas vs 30 | Content |
| 7 | AC-RC-B33 | Language: faltan Cantonese, Mandarin, Farsi, French Canadian | Content |
| 8 | AC-RC-C05 | Agreement Signed title: falta "WISE Membership" | Wording |
| 9 | AC-RC-C06 | Agreement Signed body: wording diferente | Wording |
| 10 | AC-RC-C07 | Agreement Signed: texto extra no debería existir | Wording |
| 11 | AC-RC-D01 | Agreement email subject: falta "WISE Membership" | Wording |
| 12 | AC-RC-D02 | Agreement email body title: falta "WISE Membership" | Wording |
| 13 | AC-RC-D03 | Agreement email body text: wording diferente | Wording |
| 14 | AC-RC-D04 | Agreement email: texto extra "next step..." | Wording |
| 15 | AC-RC-D06 | Agreement email: llega duplicado (BUG) | Bug |
| 16 | AC-RC-D07 | Welcome email: body completamente diferente | Wording |
| 17 | AC-RC-D08 | Welcome email: falta "5 business days" | Missing |
| 18 | AC-RC-D09 | Welcome email: falta "notification once complete" | Missing |
| 19 | AC-RC-D10 | Welcome email: falta receipt attachment | Missing |
| 20 | AC-RC-D11 | Payment Transaction email: no implementado | Missing |
| 21 | AC-RC-D12 | Payment Transaction email: body missing | Missing |
| 22 | AC-RC-D13 | Post-Countersign email: no implementado | Missing |
| 23 | AC-RC-D14 | Post-Countersign email: body missing | Missing |
| 24 | AC-RC-E03 | Language count: 183 vs 30 | Content |

---

## POM Coverage

### Form 1 (`general-info.pom.ts`) — ✅ Completo

Todos los selectores necesarios ya existen:
- `lead_form._.name_section._.first_name_input` / `last_name_input`
- `lead_form._.email_section._.email_input`
- `lead_form._.company_name_section._.company_name_input`
- `lead_form._.phone_section._.phone_type_select` / `phone_input`
- `lead_form._.address_section._.country_select` / `state_select`
- `lead_form._.referral_section._.referral_input`
- `lead_form._.submit_button`

### Form 2 (`details.pom.ts`) — ✅ Completo

Todos los selectores necesarios ya existen para cada sección.

### POM Faltantes (a reportar al developer)

| Elemento | Necesidad | POM actual | Acción |
|----------|-----------|-----------|--------|
| Hint text elements | Validar texto de hints | No hay `data-test-key` en hints | ⚠️ **REPORTAR**: hints no tienen annotation — necesitan `data-test-key="X-hint"` |
| Label elements | Validar texto de labels | No hay `data-test-key` en labels | ⚠️ **REPORTAR**: labels no tienen annotation — usar CSS selector como fallback |
| Section title/heading | Validar composición | No hay key para headings | ⚠️ Usar DOM order de sections (contexts) |

**Alternativa sin annotations faltantes:** Usar `.$(' .hint-class')` o `evaluate_script` para leer el textContent de los labels/hints por proximidad al input anotado. No es ideal pero funciona sin cambios del developer.

---

## Spec Architecture propuesto

```
e2e/
├── fixtures/
│   └── rules-expected-data.ts        ← CREAR: textos esperados, listas de países/idiomas
├── factories/
│   └── rules-compliance.factory.ts   ← YA EXISTE: actualizar con nuevos factories
├── specs/
│   └── validation/
│       ├── rules-compliance-form1.spec.ts      ← CREAR: Grupo A + E (Form 1)
│       ├── rules-compliance-form2.spec.ts      ← CREAR: Grupo B + E (Form 2)
│       ├── rules-compliance-screens.spec.ts    ← CREAR: Grupo C
│       └── rules-compliance-emails.spec.ts     ← CREAR: Grupo D
└── results/
    └── rules-compliance-wording/
        └── acceptance-criteria-checklist.md    ← ESTE ARCHIVO
```
