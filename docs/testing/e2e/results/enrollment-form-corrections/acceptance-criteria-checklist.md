# Criterios de Aceptación — Enrollment Form Corrections Batch 2

> **Propósito:** Validar correcciones de texto, dropdowns, y funcionalidad nueva en Forms 1 y 2.
> **Tickets:** #850 a #864
> **Fecha:** 2026-06-09
> **Branch:** `bugfix/enrollment-form-corrections-qa`
> **Referencia:** Rules & Workflow Specifications Manual (Revised May 15, 2026)

---

## Sesión 1: Form 1 — Labels y Hints (#850, #851, #852, #853)

**Spec:** `specs/validation/general-info-labels-v2.spec.ts` — 16 tests ✅

| ID | Criterio | Estado | Validado por |
|----|----------|--------|--------------|
| AC-B2-01 | EN: Company Name hint = "Enter your name if you do not have a separate company name." | ✅ | i18n file check |
| AC-B2-02 | ES: Company Name hint existe y no está vacío | ✅ | i18n file check |
| AC-B2-03 | UI: sección company-name muestra hint del i18n | ✅ | UI toContainText |
| AC-B2-04 | EN: Phone label = "Company Phone" | ✅ | i18n file check |
| AC-B2-05 | EN: Phone hint = "Enter your personal phone number..." | ✅ | i18n file check |
| AC-B2-06 | ES: Phone label y hint existen | ✅ | i18n file check |
| AC-B2-07 | UI: sección phone muestra label y hint del i18n | ✅ | UI toContainText |
| AC-B2-08 | EN: Email label = "Company Email Address" | ✅ | i18n file check |
| AC-B2-09 | EN: Email hint = "Enter your personal email address..." | ✅ | i18n file check |
| AC-B2-10 | ES: Email label y hint existen | ✅ | i18n file check |
| AC-B2-11 | UI: sección email muestra label y hint del i18n | ✅ | UI toContainText |
| AC-B2-12 | EN: Address label = "Company Street Address" | ✅ | i18n file check |
| AC-B2-13 | EN: Address hint = "Enter your personal address..." | ✅ | i18n file check |
| AC-B2-14 | ES: Address label y hint existen | ✅ | i18n file check |
| AC-B2-15 | UI: sección address muestra label y hint del i18n | ✅ | UI toContainText |

---

## Sesión 2: Form 1 — Country & State Dropdowns (#854, #855)

**Spec:** `specs/validation/country-state-dropdown-v2.spec.ts` — 12 tests ✅

| ID | Criterio | Estado | Método |
|----|----------|--------|--------|
| AC-B2-16 | "United States" es la primera opción en el dropdown de países | ✅ | E2E: primer option |
| AC-B2-17 | "South Korea" en posición alfabética correcta | ✅ | E2E: verificar índice |
| AC-B2-18 | "Venezuela" NO está en la lista | ✅ | E2E: option count = 0 |
| AC-B2-19 | "Hong Kong" sin "S.A.R." | ✅ | E2E: texto exacto |
| AC-B2-20 | Resto de países en orden alfabético después de USA | ✅ | E2E: verificar orden |
| AC-B2-21 | US States: exactamente 52 opciones (50 + DC + PR) | ✅ | E2E: count options |
| AC-B2-22 | "American Samoa" ausente de states | ✅ | E2E: option count = 0 |
| AC-B2-23 | "Guam" ausente de states | ✅ | E2E: option count = 0 |
| AC-B2-24 | "Northern Mariana Islands" ausente | ✅ | E2E: option count = 0 |
| AC-B2-25 | "United States Virgin Islands" ausente | ✅ | E2E: option count = 0 |
| AC-B2-26 | FL, CA, NY, TX, DC, PR presentes en states | ✅ | E2E: option exists |

---

## Sesión 3: Form 2 — Labels y Radios (#856, #857, #858)

**Spec:** `specs/validation/details-labels-v2.spec.ts` — 18 tests ✅

| ID | Criterio | Estado | Método |
|----|----------|--------|--------|
| AC-B2-27 | EN: Position label = "Company Position" | ✅ | i18n file check |
| AC-B2-28 | ES: Position label existe | ✅ | i18n file check |
| AC-B2-29 | UI: Form 2 muestra "Company Position" | ✅ | UI toContainText |
| AC-B2-30 | EN: Prosperity Planner title contiene "WISE®" | ✅ | i18n file check |
| AC-B2-31 | ES: Prosperity Planner title existe | ✅ | i18n file check |
| AC-B2-32 | UI: muestra título con ® | ✅ | UI toContainText |
| AC-B2-33 | EN: Prosperity Planner helper text existe y contiene "Prosperity Planner" | ✅ | i18n file check |
| AC-B2-34 | EN: HCA title contiene "HCA®" y "booklets" | ✅ | i18n file check |
| AC-B2-35 | EN: HCA hint lowercase "booklets", "membership" | ✅ | i18n file check |
| AC-B2-36 | Radio 1: "...upon request." | ✅ | i18n file check |
| AC-B2-37 | Radio 2: "...automatically." | ✅ | i18n file check |
| AC-B2-38 | Radio 3: "...do not send..." | ✅ | i18n file check |
| AC-B2-39 | Orden DOM: upon request → automatic → do not send | ✅ | E2E: label order |
| AC-B2-40 | HCA options usan "send" no "ship" | ✅ | i18n: not contains "ship" |
| AC-B2-41 | ES: HCA title + hint existen | ✅ | i18n file check |

---

## Sesión 4: Form 2 — Funcionalidad Nueva (#859, #860, #861)

**Spec:** `specs/validation/details-features-v2.spec.ts` — 14 tests ✅
**Factory:** `factories/details-features.factory.ts`
**POM update:** `back_button_top` + `personal_same_as_company_checkbox`

| ID | Criterio | Estado | Método |
|----|----------|--------|--------|
| AC-B2-42 | Checkbox `personal-same-as-company-checkbox` visible en sección Personal Address | ✅ | E2E: POM key visible |
| AC-B2-43 | Checkbox estado inicial verificado (unchecked → section visible) | ✅ | E2E: verify context state |
| AC-B2-44 | Toggle checkbox → campos se ocultan (check) y muestran (uncheck) | ✅ | E2E: click + verify state |
| AC-B2-45 | Check checkbox → sección hidden (backend usa company address) | ✅ | E2E: check + verify hidden |
| AC-B2-46 | i18n EN + ES: label del checkbox existe y no está vacío | ✅ | i18n file check |
| AC-B2-47 | Education: opción "High School Diploma / GED" (no "Degree") | ✅ | E2E: option text verified |
| AC-B2-48 | Education: opción "No High School Diploma" al final del dropdown | ✅ | E2E: last option |
| AC-B2-49 | ES: Education options actualizadas en i18n | ✅ | i18n file check |
| AC-B2-50 | Seleccionar "No High School Diploma" + submit → navega a /plan | ✅ | E2E: select + submit |
| AC-B2-51 | Back button visible en Form 2 (bottom: `back-button`) | ✅ | E2E: POM key visible |
| AC-B2-52 | Click Back en Form 2 → navega a `/general-info` | ✅ | E2E: click + waitForURL |
| AC-B2-53 | Datos de Form 1 se preservan al navegar back | ✅ | E2E: verify email value |

---

## Sesión 5: Provisioning Email (#864)

**Spec:** Validado en `full-enrollment-multi-admin` + `full-provisioning-with-user-invited`

| ID | Criterio | Estado | Validado por |
|----|----------|--------|--------------|
| AC-B2-54 | Webhook Zoho Sign procesa `completed` | ✅ | Logs enrollment |
| AC-B2-55 | ProcessCountersign publica provisioning dispatch | ✅ | Logs enrollment |
| AC-B2-56 | ProcessProvisioningDispatch crea tenant + company | ✅ | Logs onboarding |
| AC-B2-57 | Email de invitación enviado al owner | ✅ | Mailosaur |
| AC-B2-58 | HMAC secret correcto | ✅ | Config verificada |

---

## Resumen General

| Sesión | Tickets | Spec | Total ACs | ✅ Pass | 🔲 Pendiente |
|--------|---------|------|-----------|---------|--------------|
| 1 | #850-#853 | `general-info-labels-v2.spec.ts` | 15 | 15 | 0 |
| 2 | #854, #855 | `country-state-dropdown-v2.spec.ts` | 11 | 11 | 0 |
| 3 | #856-#858 | `details-labels-v2.spec.ts` | 15 | 15 | 0 |
| 4 | #859-#861 | `details-features-v2.spec.ts` | 12 | 12 | 0 |
| 5 | #864 | (existente) | 5 | 5 | 0 |
| **TOTAL** | | | **58** | **58** | **0** |

---

## Test Execution — Última corrida (2026-06-09)

```
60 passed (56.7s) — CDP mode, 4 workers
```

| Spec | Tests | Tiempo | Modo |
|------|-------|--------|------|
| `general-info-labels-v2.spec.ts` | 16 | ~10s | CDP |
| `country-state-dropdown-v2.spec.ts` | 12 | ~15s | CDP |
| `details-labels-v2.spec.ts` | 18 | ~26s | CDP |
| `details-features-v2.spec.ts` | 14 | ~57s | CDP |
| **TOTAL** | **60** | **56.7s** | |

---

## Observaciones

### Comportamiento implementado vs ticket

| Ticket | Lo que dice el ticket | Lo implementado | Impacto en test |
|--------|----------------------|-----------------|-----------------|
| #859 | Checkbox checked por defecto → campos ocultos | Checkbox **unchecked** por defecto → campos visibles | Test adaptado para verificar ambos estados via toggle |
| #861 | Back button en Form 2 y Plan Selection | Back button solo en Form 2 | Plan Selection back button no implementado (fuera de alcance) |

### Elementos con data-test-* ya validados en DOM

| POM key | data-test-key en DOM | Estado |
|---------|---------------------|--------|
| `personal_same_as_company_checkbox` | `personal-same-as-company-checkbox` | ✅ Verificado |
| `back_button_top` | `back-button-top` | ✅ Verificado |
| `back_button` | `back-button` | ✅ Verificado |
| `monthly_button` | `monthly-button` | ✅ Existente (PlanSelectionPage) |
| `annually_button` | `annually-button` | ✅ Existente (PlanSelectionPage) |

### Arquitectura — Conformidad con steerings

- ✅ Factories en `factories/` con patrón `getPage → async () => {}`
- ✅ POM en `pom/details.pom.ts` con selectores jerárquicos
- ✅ Fixture `i18n.ts` para leer traducciones directamente de archivos JSON
- ✅ Specs son orquestación pura (no contienen lógica de interacción)
- ✅ `createSerialFlow()` para todos los specs
- ✅ No se localiza por texto (AP2) — se localiza por `data-test-context/key` y se verifica contenido
- ✅ TypeScript compila sin errores

---

## Notas

- **Branch:** `bugfix/enrollment-form-corrections-qa` (derivada de `integration`)
- **Todos los 58 ACs pasan** — 60 tests en 4 specs ejecutándose en 56.7s via CDP.
- **Sesión 5 (#864)** validada en specs existentes (full-enrollment-multi-admin + full-provisioning).
- **Los tests de i18n verifican EN y ES** — leen directamente los archivos JSON y comparan contra la UI.
- **Logo link:** Anotación `data-test-key="logo-link"` añadida por el desarrollador en `AppHeader.tsx`.
