# Criterios de Aceptación — Ticket #862: State Required when Country = USA

> **Ticket:** #862
> **Título:** Signup Form 1 Required Field: STATE allows skipping
> **Categoría:** Bug
> **Complejidad:** Medium
> **Horas estimadas:** 3
> **Regla violada:** §2 Individual Profile — "An Individual profile requires [...] a Country (and a State, if the Country is 'USA') as, without this information, a Continent cannot be assigned."
> **Branch:** Pendiente de implementación por desarrollo
> **Fecha:** 2026-06-10

---

## Contexto

El cliente reporta que en Form 1 (General Info), al seleccionar USA como país, el campo State/Province se puede omitir y el formulario avanza al siguiente paso. Esto genera Leads en Zoho CRM con el campo State vacío, lo que impide la asignación correcta del WISE Continent y viola la regla del manual.

### Flujo afectado

```
Form 1 (General Info) → Submit con USA + State vacío → Lead creado sin State → CRM incompleto
```

### Impacto

- **CRM:** Leads sin State → Continent Assignment falla (no puede determinar EUS vs WUS vs FLB)
- **Membership Number:** CC (continent code) podría asignarse incorrectamente
- **Follow-up:** WISE Cont Office no puede hacer seguimiento correcto al lead

---

## Criterios de Aceptación

### UI — Validación Frontend (Form 1)

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-862-01 | Con país = USA y State vacío, click Submit → el formulario NO avanza y muestra error en el campo State (`data-test-key="state-error"` con `data-test-state="visible"`) | E2E: select USA, leave State empty, submit → verify error visible | 🔲 Pendiente |
| AC-862-02 | El mensaje de error del campo State existe en i18n EN (no vacío, descriptivo) | E2E: i18n file check — key exists and length > 0 | 🔲 Pendiente |
| AC-862-03 | El mensaje de error del campo State existe en i18n ES (no vacío, descriptivo) | E2E: i18n file check — key exists and length > 0 | 🔲 Pendiente |
| AC-862-04 | El campo State UI muestra el texto de error del i18n (toContainText) | E2E: verify UI text matches i18n value | 🔲 Pendiente |
| AC-862-05 | El campo State tiene `data-test-state="error"` cuando está vacío post-submit con USA | E2E: verify attribute on state select | 🔲 Pendiente |
| AC-862-06 | Con país = USA y State seleccionado (e.g. "FL"), click Submit → el formulario avanza normalmente a `/details` | E2E: select USA + FL, submit → waitForURL /details | 🔲 Pendiente |
| AC-862-07 | Con país ≠ USA (e.g. Colombia) y State vacío, click Submit → el formulario avanza normalmente (State no es obligatorio para otros países) | E2E: select COL, leave State empty, submit → navigates | 🔲 Pendiente |
| AC-862-08 | Con país ≠ USA que tiene states (e.g. Colombia con departamentos), State vacío → form avanza (solo USA requiere State) | E2E: verify non-USA countries don't require state | 🔲 Pendiente |
| AC-862-09 | El campo State se resetea cuando el usuario cambia de USA a otro país | E2E: select USA → select FL → change to COL → verify state select resets | 🔲 Pendiente |
| AC-862-10 | El error de State desaparece cuando el usuario selecciona un state válido | E2E: trigger error (submit vacío) → select FL → verify error disappears | 🔲 Pendiente |

### Backend — Validación API

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-862-11 | `POST /lead` con `country.iso = USA` y `state.iso = ''` retorna HTTP 400 con `{ code: 'MISSING_STATE' }` | E2E API: direct POST with empty state → verify 400 | 🔲 Pendiente |
| AC-862-12 | `POST /lead` con `country.iso = USA` y `state.iso = 'FL'` retorna HTTP 200 (happy path) | E2E API: direct POST with valid state → verify 200 | 🔲 Pendiente |
| AC-862-13 | `POST /lead` con `country.iso = COL` y `state.iso = ''` retorna HTTP 200 (State no requerido para non-USA) | E2E API: direct POST with COL + empty state → verify 200 | 🔲 Pendiente |
| AC-862-14 | El mensaje de error del backend es descriptivo (no genérico) e indica que State es requerido para USA | E2E API: verify response body.error contains "state" or "State" | 🔲 Pendiente |

### CRM — Validación Zoho

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-862-15 | Post submit con USA + FL → Lead en CRM tiene State no vacío | CRM API: search Lead by email → verify State field | 🔲 Pendiente |
| AC-862-16 | El campo State en el CRM Lead corresponde al state name (e.g. "Florida", no "FL") | CRM API: verify State = "Florida" (resolved name) | 🔲 Pendiente |
| AC-862-17 | El Membership Number CC (continent code) es correcto para el state seleccionado (FL → WUS = 03) | CRM API: verify Membership_Number substring(4,6) matches expected continent | 🔲 Pendiente |

### Regresión — Happy Path no afectado

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-862-18 | El flujo completo full-enrollment-v4 (USA + FL) sigue pasando 37/37 tests después del fix | E2E: run full-enrollment-v4 → all pass | 🔲 Pendiente |
| AC-862-19 | El flujo con params `?country=USA` pre-llena el país y State queda vacío (requiere selección manual) | E2E: verify pre-fill country but state empty → requires user action | 🔲 Pendiente |

---

## Resumen

| Categoría | Criterios | Automatizables |
|-----------|-----------|----------------|
| UI Frontend | 10 | 10 (Playwright + POM) |
| Backend API | 4 | 4 (API direct POST) |
| CRM Zoho | 3 | 3 (Zoho API query) |
| Regresión | 2 | 2 (specs existentes) |
| **Total** | **19** | **19** |

---

## Implementación sugerida

### Spec file

`e2e/specs/validation/state-required-usa.spec.ts`

### Factory

Reutilizar `lead-form.factory.ts` (fillLeadForm) + nuevo factory `state-validation.factory.ts` con:
- `submitWithUSANoState(getPage)` → verify error
- `submitWithUSAAndState(getPage, stateISO)` → verify navigates
- `submitWithNonUSANoState(getPage, countryISO)` → verify navigates

### POM

Ya existe `general-info.pom.ts` con:
- `pom.lead_form._.address_section._.state_select` ✅
- Faltaría añadir: `state_error` key si no existe (verificar DOM)

### Test Data

```typescript
// USA sin state — para validación negativa
export const LEAD_USA_NO_STATE: LeadFormData = {
  ...LEAD_USA_V4,
  stateISO: '',  // vacío — debe fallar
};

// Colombia sin state — para validación positiva (non-USA no requiere)
export const LEAD_COL_NO_STATE: LeadFormData = {
  ...LEAD_COLOMBIA,
  stateISO: '',  // vacío — debe pasar (COL no requiere state)
};
```

---

## Dependencias

| Dependencia | Estado |
|-------------|--------|
| Fix frontend (validación condicional State) | 🔲 Pendiente desarrollo |
| Fix backend (POST /lead rechaza USA + State vacío) | 🔲 Pendiente desarrollo |
| POM `state_error` key en DOM | 🔲 Verificar si developer lo añade |
| i18n keys para error message (EN + ES) | 🔲 Pendiente desarrollo |

---

## Notas

- **Prioridad:** Bloqueante para producción (regla explícita del manual)
- **Fecha límite:** Antes del deploy a producción
- **Los 19 ACs se automatizan DESPUÉS de que el developer implemente el fix**
- El spec de regresión (AC-862-18) se puede correr inmediatamente para verificar que el fix no rompe el happy path
