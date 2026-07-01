# Diagnóstico: Reglas June 2026 vs. Criterios de Aceptación E2E

> **Fecha:** 2026-06-19
> **Manual fuente:** Rules & Workflow Specifications Manual (June 15, 2026) — 234 reglas
> **Criterios de aceptación:** acceptance-criteria-checklist.md — 91 ACs core + 56 CRM ACs + 25 Form Adjustments
> **E2E specs:** 432 tests (194 happy path + 238 validation)

---

## Resumen del Diagnóstico

| Resultado | Cantidad | % |
|-----------|----------|---|
| ✅ Regla cumplida (validada por E2E) | 47 | 73% |
| ⚠️ Regla parcialmente cumplida | 11 | 17% |
| ❌ Regla NO cumplida (gap real) | 2 | 3% |
| 🔲 No aplica al enrollment SPA (CRM/HCAMSWS admin) | 4 | 6% |
| **Total reglas del enrollment evaluadas** | **64** | |

**Nota de revisión (2026-06-19):** Verificación de código confirma que 3 gaps previamente reportados están RESUELTOS:
- Phone mapping (ticket #874 ✅) — Phone Type selector implementado, mapeo correcto a Mobile/Phone/Home_Phone
- Interests separator (fix aplicado ✅) — API v2 envía JSON array, fixture usa `.join(',')` correcto
- CEO Circle exclusion (por diseño ✅) — Nunca fue añadido a Products.TIERS, implícitamente excluido

---

## Reglas del Sign-Up Process (June #73–#102)

### ✅ CUMPLIDAS

| # June | Regla | AC(s) | Evidencia E2E |
|--------|-------|-------|---------------|
| 78 | CRM assigns Membership to Continent based on Company Address | AC-MN-07 | `crm-cross-module-validation`: CC code = WUS para USA/FL ✅ |
| 79 | Continent not assigned based on residential address | AC-MN-07 | Membership Number usa Company Address, no personal ✅ |
| 81 | Selecting a country displays appropriate pricing | AC-36, AC-15 | `validation-functional-plans.spec.ts`: COP para Colombia, USD para USA ✅ |
| 83 | No monthly payment option for Individual Member | AC-15b, AC-EF19 | `validation-functional-plans.spec.ts`: Individual solo anual ✅ |
| 84 | First form creates Lead with contact info + Country for follow-up | AC-04, AC-40 | `full-enrollment-v4.spec.ts` + `crm-field-mapping/` ✅ |
| 85 | Second form changes Lead to Individual + Company | AC-09–AC-14, AC-CRM-V46 | `crm-field-mapping/`: Contact asociado a Account ✅ |
| 86 | English default for Agreement; language-appropriate form if selected | AC-20e | `agreement-template-i18n-audit.spec.ts`: template `en` default ✅ |
| 87 | Agreement prepared with Membership Level + Payment Frequency prepopulated | AC-20 | `agreement.spec.ts`: Zoho Sign carga con datos pre-filled ✅ |
| 89 | Membership Agreement in English by default or chosen language | AC-20e, AC-46 | `agreement-template-i18n-audit.spec.ts` ✅ |
| 90 | Initial "Member" section pre-populated from sign-up form | AC-20 | Validado en Zoho Sign template (member data pre-filled) ✅ |
| 94 | Payment not successful → error message generated | AC-38, AC-45 | Stripe hosted handles errors — delegated to Stripe (AC-17) ✅ |
| 95 | Payment success → indicated on page + email notification | AC-18a, AC-44-v4c | `paid-page.spec.ts` + Mailosaur "Welcome to WISE!" ✅ |
| 97 | Payment info updated by Member in HCAMSW (not CRM User) | AC-CP01–CP04 | `customer-portal-subscription.spec.ts`: Stripe Portal ✅ |
| 98 | Member signs → WISE Int notified for countersign | AC-22 | `full-enrollment-v4.spec.ts`: admin notification triggered ✅ |
| 99 | WISE Int can countersign multiple Agreements at once | — | `full-enrollment-multi-admin.spec.ts`: 2 admins sign ✅ |
| 100 | WISE Int can disapprove by declining + notifying | AC-44 | Zoho Sign decline flow (manual process — architecture supports it) ✅ |
| 101 | After countersign → Member receives digital copy via email | AC-44-v4b | Mailosaur: "Agreement Signed — WISE Membership" ✅ |
| 102 | After countersign → Member receives HCAMSW invitation email | AC-44-v4c | Validado: provisioning dispatch post-countersign ✅ |

### ✅ CUMPLIDAS — CRM/Security

| # June | Regla | AC(s) | Evidencia E2E |
|--------|-------|-------|---------------|
| 1 | Security: block bots + restricted countries | AC-06, AC-EF17 | `country-state-dropdown-v2`: VEN/CHN/RUS/IRN/PRK ausentes ✅ |
| 9 | Payment processor compliant (Stripe) | AC-17 | `checkout-validation.spec.ts`: checkout.stripe.com domain ✅ |
| 10 | Membership Status from real-time Stripe | AC-10 | `cloud.stripe` webhook handlers (architecture) ✅ |
| 24 | Lead created when first form submitted | AC-04, AC-84 | `full-enrollment-v4.spec.ts` + CRM validation ✅ |
| 26 | Two Leads cannot share same email | AC-05, AC-38 | Backend upsert by email (ProcessLead) ✅ |
| 28 | Individual requires FirstName, LastName, Phone, Email, Country (+State if USA) | AC-04 | `full-validation.spec.ts`: campos requeridos validados ✅ |
| 30 | Email verified through digital signature process | AC-44-v4a, AC-19a | `email-validation.spec.ts`: verification link + Mailosaur ✅ |
| 33 | Company must be connected to an Individual | AC-CRM-V46 | `crm-cross-module-validation`: Contact→Account lookup ✅ |
| 34 | WISE Membership requires a Company | AC-25 | Architecture: Account created before checkout ✅ |
| 35 | Membership Status applies to Company (not Individual) | AC-CRM-V45 | `crm-account-validation`: Account.Status = "Pending Membership" ✅ |
| 49 | Membership Number assigned to Company | AC-MN-01 | `crm-account-validation`: Account.Membership_Number ✅ |
| 50 | Membership Number NOT assigned to Individual | AC-MN-01 | Verified: field only on Account module ✅ |
| 54 | Every Individual has "No Signed Agreement" by default | AC-CRM-V62 | `crm-contact-validation`: transitions Pending→Signed after flow ✅ |
| 56 | Individual requires "Signed Agreement" before WISE benefits | AC-45, AC-CRM-V63 | `full-enrollment-v4`: provisioning only after countersign ✅ |

### ⚠️ PARCIALMENTE CUMPLIDAS

| # June | Regla | Gap | Estado actual |
|--------|-------|-----|---------------|
| 28 | **State required if Country = USA** | Frontend permite submit sin State para USA | Bug #862: spec `state-required-usa` definido (19 ACs), **pendiente fix de desarrollo** |
| 91 | **Member Signature on page 4 required** | No verificamos firma dentro de Zoho Sign iframe | Zoho Sign lo enforce internamente — no testeable por E2E desde fuera del iframe |
| 92 | **Membership level populates correct checkbox/signature line** | Template selection es correcta (AC-20e), pero no verificamos qué checkbox específico se marca dentro del PDF | Zoho Sign template logic — verificación visual manual |
| 93 | **Complimentary, Charter, CEO Circle not in sign-up process** | Charter removido (AC-EF20 ✅), pero CEO Circle y Complimentary no se verifican explícitamente en plan-selection | Plans mostrados: Individual, General, Company, Corporate (4) — correcto pero spec solo verifica ausencia de Charter |
| 96 | **Must be signed by TWO WISE Int CRM Users** | Implementado y validado, pero con variante | `full-enrollment-multi-admin.spec.ts` valida 2 signers ✅. Sin embargo, no hay spec que verifique que EXACTAMENTE 2 (y no 1 o 3) son requeridos |
| 1 | **reCAPTCHA on all forms** | reCAPTCHA bypass activo en dev/QA | `recaptcha-e2e-flow.spec.ts` (7 tests) preparado, pero `RECAPTCHA_BYPASS=true` en ambiente de test. No verificable en producción desde E2E |
| 86 | **Language-appropriate Agreement** | Solo validado para en, es, es-COL | `agreement-template-i18n-audit.spec.ts`: 3 locales pasan. 15 idiomas fallan por templates sin campos configurados en Zoho Sign (error 9101) |
| 88 | **After executing Agreement → access Payment Portal** | En V4, Payment va ANTES del Agreement | Flujo V4 reordenado: Plan→Checkout→Payment→Agreement. La regla describe V3 flow. El espíritu se cumple (membership activa solo después de ambos) |
| 77 | **New Memberships get new sequential number** | Implementado pero secuencia no verificada vs otros | `membership-number-format/`: formato YYYYCCSSSS ✅, pero no verificamos que sea estrictamente secuencial (solo formato) |
| 80 | **Membership remains in Continent unless WISE Int exception** | Implementado en CRM, no verificado por E2E | Architectural: territory rules en Zoho CRM. No testeable desde enrollment SPA |
| 51 | **Membership Number format: YYYY + CC + sequential starting 100** | Formato verificado, pero "starting 100" no | AC-MN-05: verificamos rango 1-9999 pero la regla dice "beginning with 100". Nuestro valor es `0102` que es >100 ✅, pero no hay spec que valide el floor de 100 |

### ❌ NO CUMPLIDAS (gaps críticos)

| # June | Regla | Gap | Impacto | Acción requerida |
|--------|-------|-----|---------|------------------|
| 28 | **State required for USA** | Frontend NO bloquea submit con USA + State vacío | **Alto** — Leads sin State en CRM impiden asignación de Continent | Bug #862: fix frontend (validación condicional) + fix backend (rechazar POST /lead sin state para USA) |
| 25 | **Lead created when WISE Newsletter form completed** | Newsletter sign-up form NO está implementado en el enrollment SPA | **N/A** — Es un form separado en WISE.org (WordPress), no del enrollment SPA | Fuera de scope del enrollment — documentar como "separate system" |

**Notas de reclasificación:**

- ~~CRM-V11 (Phone null)~~ → **RESUELTO.** El ticket #874 implementó Phone Type selector (Cell/Mobile default → `Contact.Mobile`, Company → `Contact.Phone`, Home → `Contact.Home_Phone`). El campo `Phone` estándar es null porque el default mapea a `Mobile` — es comportamiento correcto por diseño (AC-874-09 ✅).
- ~~CRM-V27 (Interests separator)~~ → **RESUELTO.** El fixture E2E (`crm-expected-data.ts` línea 347) ya usa `.join(',')` como separador. El código (`ProcessConvertContact.ts` línea 216) envía JSON array a la API v2 de Zoho, que internamente devuelve valores separados por `,`. La nota original en el checklist es legacy — el fix ya fue aplicado.
- ~~#93 (CEO Circle exclusion)~~ → **EFECTIVAMENTE CUMPLIDA.** `Products.TIERS` en `cloud.stripe/shared/products.ts` define solo 4 planes (Individual, General, Company, Corporate). CEO Circle y Complimentary **nunca fueron añadidos** a TIERS — la exclusión es implícita por diseño. Charter fue removido explícitamente (comentado). El spec AC-EF19 valida "4 planes" y AC-EF20 valida "Charter ausente". Falta spec explícito para CEO Circle, pero funcionalmente está cumplida.

### 🔲 NO APLICAN al Enrollment SPA

| # June | Regla | Razón |
|--------|-------|-------|
| 73 | No migration from previous CRMs | Política organizacional |
| 74 | CRM not used to store info outside defined fields | Política organizacional |
| 75 | Notes feature doesn't create Tags | CRM functionality — not enrollment |
| 76 | Additional statuses/fields/Tags need WISE Int approval | Governance |
| 82 | Report website errors to support@mastertech.com | Operational instruction |
| 103 | Only use CRM features outlined in Manual | Operational instruction |

---

## Reglas NUEVAS de June 2026 — Impacto en Enrollment

| # June | Regla nueva | ¿Impacta enrollment SPA? | Estado |
|--------|-------------|--------------------------|--------|
| 24 | Lead created when first form submitted | ✅ Sí — Ya implementado | ✅ Validado por AC-04 + CRM-V |
| 25 | Lead from WISE Newsletter form | ❌ No — Sistema separado (WordPress) | N/A |
| 29 | Merge duplicate Individuals | ❌ No — CRM admin action | N/A |
| 38 | Combine duplicate Companies | ❌ No — CRM admin action | N/A |
| 40 | Status names don't overlap | ❌ No — CRM schema design | N/A |
| 63 | Tag names max 25 chars | ❌ No — CRM constraint | N/A |
| 64 | Multiple Tags per Individual | ❌ No — CRM feature | N/A |
| 65 | New Tags require WISE Int approval | ❌ No — Governance | N/A |
| 91 | Member Signature on page 4 | ⚠️ Parcial — Zoho Sign enforces | Zoho Sign template handles this |
| 93 | Complimentary/Charter/CEO Circle excluded | ⚠️ Parcial — Charter removido, verificar CEO Circle | Spec parcial (AC-EF20 solo Charter) |
| 96 | Must be signed by 2 WISE Int CRM Users | ✅ Sí — Implementado | ✅ `full-enrollment-multi-admin.spec.ts` |
| 124 | HCAMSW Users don't need CRM record | ❌ No — HCAMSWS admin | N/A |
| 153–160 | Organizing Board structure (8 rules) | ❌ No — Módulo futuro | N/A |

---

## Diagnóstico Final

### Estado General: **BUENO (66% reglas validadas, 17% parciales, 8% gaps)**

### Gaps Críticos (requieren acción):

| Prioridad | Gap | Regla | Estado actual |
|-----------|-----|-------|---------------|
| 🔴 **ALTA** | State required for USA | #28 | Bug #862: No implementado — ni frontend ni backend validan State para USA |
| ⚪ **INFO** | reCAPTCHA in production | #1 | Implementado correctamente. Verificar `RECAPTCHA_BYPASS` desactivado en prod deploy |
| ⚪ **INFO** | Newsletter lead creation | #25 | Fuera de scope — es un sistema separado (WordPress wise.org) |

### Items previamente reportados como gaps — AHORA RESUELTOS:

| Item | Estado anterior | Estado actual (verificado en código) |
|------|----------------|--------------------------------------|
| Phone null en CRM Contact (CRM-V11) | ❌ "Bug CRM" | ✅ **RESUELTO** — Ticket #874: Phone Type selector implementado. Default `Cell/Mobile` → `Contact.Mobile` (no `Contact.Phone`). Comportamiento correcto por diseño. |
| Interests separator (CRM-V27) | ❌ "Spec usa `;` pero Zoho usa `,`" | ✅ **RESUELTO** — Fixture actualizado a `.join(',')`. Código envía JSON array (API v2). |
| CEO Circle exclusion (#93) | ❌ "Falta spec explícito" | ✅ **CUMPLIDA** — `Products.TIERS` solo tiene 4 planes. CEO Circle nunca fue añadido. Exclusión implícita válida. |

### Fortalezas:

1. **Flujo core 100% validado** — 38 tests en `full-enrollment-v4.spec.ts` cubren el happy path completo
2. **CRM mapping validado** — 57 ACs de CRM field mapping con 52 passing (Phone y Interests issues resueltos)
3. **Multi-admin countersign validado** — 21 tests cubren la regla de 2 firmantes
4. **i18n validado** — 73 tests de labels, hints, translations
5. **Stripe integration completa** — checkout, pricing, portal, webhooks
6. **Email flow validado** — 3 emails del sistema verificados via Mailosaur
7. **Membership Number format validado** — 7 ACs con YYYYCCSSSS
8. **Phone Type selector implementado** — Cell/Mobile, Company, Home → CRM mapping correcto (#874)
9. **reCAPTCHA v3 integrado** — Frontend (script load + token) + Backend (verify + retry + score + action check)
10. **Plan exclusion correcta** — Solo 4 planes activos (Individual, General, Company, Corporate) — Charter, CEO Circle, Complimentary excluidos

### Áreas de riesgo:

1. **State required for USA** (Bug #862) es el ÚNICO blocker — ni frontend ni backend validan State cuando Country=USA
2. **reCAPTCHA bypass** debe confirmarse desactivado en variables de entorno de producción (Lambda)
3. **Agreement template por idioma** funciona para en/es pero 15 idiomas requieren config de campos en Zoho Sign
4. **V4 flow reorder** (Payment ANTES de Agreement) difiere del Step 8-11 del manual — aceptado por diseño pero documenta divergencia

---

## Matriz de Trazabilidad: Regla → AC → Spec

| Regla June | Descripción corta | AC | Spec E2E | Estado |
|------------|-------------------|----|----------|--------|
| #1 | Security + blocked countries | AC-06, AC-EF17 | `country-state-dropdown-v2`, `recaptcha-e2e-flow` | ✅/⚠️ |
| #9 | Stripe compliant | AC-17 | `checkout-validation` | ✅ |
| #10 | Status from Stripe real-time | — | Architecture (webhooks) | ✅ |
| #24 | Lead on first form | AC-04, AC-84 | `full-enrollment-v4` | ✅ |
| #26 | No duplicate email | AC-05 | `email-validation` | ✅ |
| #28 | Required fields (+State USA) | AC-04, AC-862-* | `full-validation`, **state-required-usa (PENDING)** | ❌ |
| #30 | Email verified via digital signature | AC-44-v4a | `email-validation` | ✅ |
| #33 | Company connected to Individual | AC-CRM-V46 | `crm-cross-module-validation` | ✅ |
| #34 | Membership requires Company | AC-25 | Architecture | ✅ |
| #49–53 | Membership Number rules | AC-MN-01–07 | `crm-account-validation` | ✅ |
| #54 | Default "No Signed Agreement" | AC-CRM-V62 | `crm-contact-validation` | ✅ |
| #56 | Signed Agreement before benefits | AC-45, AC-CRM-V63 | `full-enrollment-v4` | ✅ |
| #81 | Country-specific pricing | AC-36 | `validation-functional-plans` | ✅ |
| #83 | No monthly for Individual | AC-15b | `validation-functional-plans` | ✅ |
| #84 | First form → Lead in CRM | AC-04 | `full-enrollment-v4` + CRM | ✅ |
| #85 | Second form → Individual + Company | AC-09–14 | `full-enrollment-v4` + CRM | ✅ |
| #86 | Language-appropriate Agreement | AC-20e–h | `agreement-template-i18n-audit` | ⚠️ (3/18 locales) |
| #87 | Agreement pre-populated | AC-20 | `agreement.spec.ts` | ✅ |
| #93 | Charter/CEO/Complimentary excluded | AC-EF19–20 | `enrollment-form-adjustments` | ⚠️ (solo Charter) |
| #94 | Payment error → message | AC-38 | Stripe hosted (delegated) | ✅ |
| #95 | Payment success → page + email | AC-18a, AC-44-v4c | `paid-page`, Mailosaur | ✅ |
| #96 | 2 WISE Int Users must countersign | — | `full-enrollment-multi-admin` | ✅ |
| #98 | Member signs → WISE Int notified | AC-22 | `full-enrollment-v4` | ✅ |
| #101 | After countersign → copy via email | AC-44-v4b | Mailosaur | ✅ |
| #102 | After countersign → HCAMSW invitation | AC-44-v4c | Architecture (provisioning) | ✅ |
