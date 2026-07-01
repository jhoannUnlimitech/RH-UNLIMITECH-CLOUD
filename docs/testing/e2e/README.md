# Enrollment E2E Tests

Suite de tests end-to-end para el flujo de enrollment de WISE Membership (app.enrollment SPA). Valida el flujo completo desde el registro del lead hasta el pago y firma del acuerdo.

## Requisitos

- Node.js 20+
- Servicios corriendo: `cloud.core`, `cloud.stripe`, `app.enrollment` (spa + api), `srv.onboarding`
- Cuenta de Mailosaur configurada (para interceptar emails de verificación)
- Stripe test mode configurado (para checkout)
- Zoho Sign configurado (para firma de acuerdo)

### Para modo Headless (CI)

```bash
# Instalar Chromium + dependencias del sistema (una sola vez)
npx playwright install --with-deps chromium
```

> **Nota:** El paso de firma de acuerdo (Zoho Sign iframe) NO funciona en headless-shell. Usar CDP para flujos que incluyen firma.

### Para modo CDP (visual/debugging)

- Chrome corriendo con `--remote-debugging-port=9223`

## Variables de Entorno

Crear archivo `.env.qa` en `packages/apps/enrollment/modules/spa/`:

```env
# ─── Mailosaur ───────────────────────────────────────────────────────────────
MAILOSAUR_API_KEY=<your-mailosaur-api-key>
MAILOSAUR_SERVER_ID=<your-server-id>

# ─── Environment Switch ──────────────────────────────────────────────────────
# LIVE=true  → uses TEST_LIVE_* URLs (Amplify deployed)
# LIVE=false → uses LOCAL_* URLs (default)
LIVE=false

# ─── Local URLs ──────────────────────────────────────────────────────────────
LOCAL_BASE_URL=https://localhost:9010

# ─── Live/Test URLs (Amplify) ────────────────────────────────────────────────
TEST_LIVE_BASE_URL=https://main.d35hdnltqnm8nj.amplifyapp.com
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `MAILOSAUR_API_KEY` | API key de Mailosaur | Requerido |
| `MAILOSAUR_SERVER_ID` | Server ID de Mailosaur | Desde .env.qa |
| `LIVE` | `true` = Amplify, `false` = localhost | `false` |
| `LOCAL_BASE_URL` | URL local de la app | `https://localhost:9010` |
| `TEST_LIVE_BASE_URL` | URL de Amplify (test) | `https://main.d35hdnltqnm8nj.amplifyapp.com` |
| `BASE_URL` | Override manual (ignora LIVE) | Resuelto por LIVE switch |
| `CDP_ENDPOINT` | Chrome CDP endpoint (modo asistido) | No definido = headless |
| `ZOHO_SIGN_ADMIN_EMAIL_1` | Email del admin 1 para templates multi-signer | `admin1@{MAILOSAUR_SERVER_ID}.mailosaur.net` |
| `ZOHO_SIGN_ADMIN_EMAIL_2` | Email del admin 2 para templates multi-signer | `admin2@{MAILOSAUR_SERVER_ID}.mailosaur.net` |

### Configuración Multi-Admin (Zoho Sign)

Los tests de firma multi-admin (`full-enrollment-multi-admin.spec.ts`) requieren que los emails de los administradores de Zoho Sign coincidan con los configurados en el **template de Zoho Sign** Y sean receptables por Mailosaur.

**Importante:** Los admin emails deben:
1. Estar configurados como signers en el template de Zoho Sign
2. Pertenecer al mismo Mailosaur server que `MAILOSAUR_SERVER_ID`

Si usas un Mailosaur server diferente al default (`isyifpzu`), debes:
1. Actualizar `MAILOSAUR_SERVER_ID` en `.env.qa`
2. Las variables `ZOHO_SIGN_ADMIN_EMAIL_1/2` se construyen automáticamente como `admin1@{MAILOSAUR_SERVER_ID}.mailosaur.net`
3. O definir explícitamente: `ZOHO_SIGN_ADMIN_EMAIL_1=admin1@tuserver.mailosaur.net`
4. **Actualizar el template de Zoho Sign** con los mismos emails como signers

## Modos de Ejecución

### Headless (CI / rápido)

```bash
cd packages/apps/enrollment/modules/spa
npx playwright test
```

- Más rápido (~2.5m para happy-path sin Zoho Sign)
- Zoho Sign iframe NO funciona (usa headless-shell sin rendering completo)
- Ideal para validaciones de formularios, emails, navegación

### CDP — Asistido (visual / debugging)

```bash
CDP_ENDPOINT=http://localhost:9223 npx playwright test
```

- Más lento (~6-7m) pero soporta Zoho Sign iframe
- Permite ver la ejecución en tiempo real
- Requerido para flujos que incluyen firma de acuerdo

### Live/Test (Amplify deployed)

```bash
# Opción 1: Set LIVE=true en .env.qa y correr normalmente
CDP_ENDPOINT=http://localhost:9223 npx playwright test

# Opción 2: Override via línea de comando
LIVE=true CDP_ENDPOINT=http://localhost:9223 npx playwright test enrollment-flow-v4
```

- Corre contra la app desplegada en Amplify
- No requiere servicios locales corriendo
- Requiere que el backend de Amplify tenga email dispatch configurado para Mailosaur

### Diferencias entre modos

| Aspecto | Headless | CDP | Live (Amplify) |
|---------|----------|-----|----------------|
| Velocidad | Más rápido | Medio | Depende de red |
| Zoho Sign iframe | ❌ | ✅ | ✅ |
| Stripe Checkout | ✅ | ✅ | ✅ |
| Formularios | ✅ | ✅ | ✅ |
| Emails (Mailosaur) | ✅ | ✅ | Requiere config backend |
| Servicios locales | Requeridos | Requeridos | No requeridos |

## Comandos

### Ejecutar todos los tests

```bash
# CDP (recomendado para flujo completo)
CDP_ENDPOINT=http://localhost:9223 npx playwright test

# Headless (solo formularios y validaciones)
npx playwright test
```

### Ejecutar un flujo específico (happy-path)

```bash
# Flujo V4 completo (15 tests) — requiere CDP para Zoho Sign
CDP_ENDPOINT=http://localhost:9223 npx playwright test enrollment-flow-v4

# Flujo V4 con params (62 tests) — requiere CDP
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-with-params

# Solo lead form (headless OK)
npx playwright test lead-form

# Solo plan selection (headless OK)
npx playwright test plan-selection
```

### Ejecutar validaciones

```bash
# Validación de formularios (headless OK)
npx playwright test general-info-validation
npx playwright test details-validation
npx playwright test plan-selection-validation

# Enrollment Form Adjustments — nuevos campos (headless OK)
npx playwright test enrollment-form-adjustments

# ─── Enrollment Form Corrections Batch 2 (#850-#864) ─────────────────────────
# Validaciones de texto (labels, hints, i18n EN+ES), dropdowns, y funcionalidad nueva.
# 60 tests across 4 specs — all headless OK via CDP.
CDP_ENDPOINT=http://localhost:9223 npx playwright test general-info-labels-v2 --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test country-state-dropdown-v2 --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test details-labels-v2 --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test details-features-v2 --reporter=list

# Correr los 4 juntos:
CDP_ENDPOINT=http://localhost:9223 npx playwright test general-info-labels-v2 country-state-dropdown-v2 details-labels-v2 details-features-v2 --reporter=list

# ─── Company Websites CRM Mapping (#869) ─────────────────────────────────────
# Valida que 5 URLs de Form 2 se mapeen a los campos correctos del Account en Zoho CRM.
# 14 tests — Form 1 → Form 2 (5 URLs) → Submit → CRM API validation (5 Account fields)
CDP_ENDPOINT=http://localhost:9223 npx playwright test company-websites-crm-mapping --reporter=list

# ─── Field Adjustments Validation (#874-#894) ──────────────────────────────
# Phone Type selector (Form 1 required + Form 2 optional) + labels/hints/layout
# + Industry Other, Company Website, Education, Personal Address, Prosperity/HCA
CDP_ENDPOINT=http://localhost:9223 npx playwright test phone-type-validation --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test details-labels-v2 --reporter=list

# Correr ambos field adjustments juntos (71 tests):
CDP_ENDPOINT=http://localhost:9223 npx playwright test phone-type-validation details-labels-v2 --reporter=list

# Validación de emails (headless OK — no incluye Zoho Sign)
npx playwright test no-email-without-plan

# ─── Email Verification Wording (#893) ───────────────────────────────────────
# Valida que el email de verificación contiene el texto del Rules Document p.79
# Flujo: Form 1 → Form 2 → Plan → interceptar email → validar body (10 ACs, ~1 min)
CDP_ENDPOINT=http://localhost:9223 npx playwright test email-verification-wording --reporter=list

# ─── Language Selector Validation (#896) ─────────────────────────────────────
# Valida el selector de idioma: URL param (?lang=), switch manual, persistencia,
# fuzzy matching, fallback, Escape cierra dropdown. 5 flows, 39 tests, ~1.8 min.
# Headless OK — no requiere Zoho Sign ni Stripe.
CDP_ENDPOINT=http://localhost:9223 npx playwright test language-selector --reporter=list

# ─── Mailgun Reply-To Header Validation ──────────────────────────────────────
# Valida que el header Reply-To se agrega correctamente a los emails.
# Grupos A-C: file assertions (env chain, contract, Lambda logic) — 0 costo.
# Grupo D: header check via Mailosaur (requiere email enviado con MAILGUN_REPLY_TO).
# 11 tests, ~2s.
npx playwright test mailgun-reply-to --reporter=list

# Solo un flow específico del language selector:
npx playwright test language-selector --grep "English" --reporter=list
npx playwright test language-selector --grep "Spanish" --reporter=list
npx playwright test language-selector --grep "Manual Switch" --reporter=list
npx playwright test language-selector --grep "Fuzzy" --reporter=list
npx playwright test language-selector --grep "Unsupported" --reporter=list

# Validación completa (requiere CDP para Zoho Sign)
CDP_ENDPOINT=http://localhost:9223 npx playwright test email-validation
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-validation

# Navigation guards (headless OK)
npx playwright test navigation-guard-validation

# Session management (headless OK)
npx playwright test session-management

# ─── Image Orientation Validation (#870) ─────────────────────────────────────
# Uploads 10 different profile photos via 10 enrollments (Form 1 + Form 2 + Plan + Email Verify)
# Then validates via Zoho CRM API that all 10 Contact photos exist.
# ~7.5 min (10 enrollments × ~45s each + CRM validation)
CDP_ENDPOINT=http://localhost:9223 npx playwright test image-orientation-validation --reporter=list
```

### Ejecutar validación CRM (Zoho API)

Los specs CRM validan que la data enviada en los formularios se refleje correctamente en Zoho CRM via API. No usan browser para la validación — solo consultas HTTP a la API de Zoho CRM.

**Requisitos:**
- Credenciales Zoho CRM en `packages/apps/enrollment/.env` (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_CLIENT_REFRESH_TOKEN`, `ZOHO_API_DOMAIN`)
- Servicios corriendo: `cloud.core`, `cloud.stripe`, `app.enrollment`
- CDP para los specs que llenan formularios (browser)

**Ver progreso en consola:** Siempre usar `--reporter=list` para ver cada paso en tiempo real:

```bash
# ─── CRM Lifecycle (Form 1 + validación Lead y Account en Zoho) ──────────────
# Llena el Form 1, luego valida via API que el Lead y Account se crearon con los datos correctos.
# Valida: Status=Lead, Lead_Source, nombre, email, teléfono, compañía, dirección completa.
# Valida Account: Status=Pending Membership, teléfono, dirección.
CDP_ENDPOINT=http://localhost:9223 npx playwright test lead-and-registration --reporter=list

# ─── Solo Form 1 + CRM (más rápido, ~50s) ────────────────────────────────────
CDP_ENDPOINT=http://localhost:9223 npx playwright test lead-form --reporter=list

# ─── Full Enrollment V4 + CRM Lifecycle + Audit (~5.5 min) ───────────────────
# Flujo completo: Form 1 → Form 2 → Plan → Email → Agreement → Checkout → Paid
# CRM checkpoints en cada paso + audit final con reporte
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4 --reporter=list

# ─── Full Enrollment Multi-Admin (1 Client + 2 Admins) (~3.7 min) ────────────
# Flujo completo + firma de 2 administradores (template EN con 3 signers)
# Valida: client signs → checkout → paid → admin1 signs → admin2 signs → completed
# Requiere: ZOHO_SIGN_ADMINS con 2 emails en .env del connector
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-multi-admin --reporter=list

# ─── Audit CRM standalone (headless OK — solo API, ~24s) ─────────────────────
# PRE-REQUISITO: Correr full-enrollment-v4 primero (genera session-snapshot.json)
# Compara 60+ campos del Contact y Account contra la data del formulario.
# Genera reporte en .temp/report_crm_*.md con tabla de discrepancias.
npx playwright test audit-crm --reporter=list

# ─── Specs individuales (headless OK — solo API) ─────────────────────────────
npx playwright test crm-contact-validation --reporter=list
npx playwright test crm-account-validation --reporter=list
npx playwright test crm-cross-module-validation --reporter=list
```

> **Nota:** Siempre usar `--reporter=list` con CDP para ver el progreso paso a paso.
> Sin este flag, Playwright usa el reporter por defecto que no muestra output hasta el final.
>
> Los reportes se generan en `.temp/report_crm_YYYY-MM-DDTHHMMSS.md` con tabla comparativa
> campo por campo. Cada ejecución genera un archivo nuevo (no sobreescribe).
>
> El spec `lead-and-registration` y `lead-form` son autónomos — llenan el formulario y
> validan CRM en la misma ejecución (no necesitan snapshot previo).

## Arquitectura

```
e2e/
├── fixtures/
│   ├── base.ts              ← createSerialFlow() — sesión aislada (CDP/headless)
│   ├── test-data.ts         ← Datasets tipados (LEAD_COLOMBIA, REG_COLOMBIA, etc.)
│   └── i18n.ts              ← Lectura directa de archivos i18n JSON para validación
│
├── pom/                     ← Page Object Models (selectores data-test-*)
│   ├── selector-engine.ts   ← Motor genérico de selectores (proxy-based)
│   ├── general-info.pom.ts  ← POM: Lead Form (General Info)
│   ├── details.pom.ts       ← POM: Registration Form (Details)
│   ├── plan-selection.pom.ts← POM: Plan Selection page
│   ├── thank-you.pom.ts     ← POM: Thank You / Email verification
│   ├── verify.pom.ts        ← POM: Email verification page
│   ├── agreement.pom.ts     ← POM: Agreement page (Zoho Sign)
│   ├── agreement-signed.pom.ts ← POM: Agreement Signed page
│   ├── checkout.pom.ts      ← POM: Stripe Checkout
│   ├── paid.pom.ts          ← POM: Paid page
│   ├── completed.pom.ts     ← POM: Completed page
│   └── header.pom.ts        ← POM: App Header + Language Selector (#896)
│
├── factories/               ← Lógica de interacción reutilizable
│   ├── navigation.factory.ts        ← Navegación (sign-up, params)
│   ├── lead-form.factory.ts         ← Fill + submit lead form
│   ├── registration-form.factory.ts ← Fill + submit registration
│   ├── plan-selection.factory.ts    ← Select plan + toggle interval
│   ├── thank-you.factory.ts         ← Verify thank-you + wait for email
│   ├── verify.factory.ts            ← Navigate verify link
│   ├── agreement.factory.ts         ← Sign agreement (Zoho Sign iframe)
│   ├── agreement-signed.factory.ts  ← Verify + continue from agreement-signed
│   ├── checkout.factory.ts          ← Complete Stripe checkout
│   ├── paid.factory.ts              ← Verify paid page
│   ├── completed.factory.ts         ← Verify completed page
│   ├── email-inbox.factory.ts       ← Mailosaur email verification
│   ├── navigation-guard.factory.ts  ← Route guard validation
│   ├── session-validation.factory.ts← Session state validation
│   ├── details-features.factory.ts  ← Personal address checkbox, education, back button (#859-#861)
│   ├── image-orientation.factory.ts ← Photo upload + CRM validation for 10 images (#870)
│   ├── phone-type.factory.ts        ← Phone Type validation (Form 1 + Form 2) (#874, #881)
│   ├── field-adjustments.factory.ts ← Text/label/layout validations (#875, #877, #878, #879, #883-#888, #894)
│   ├── email-wording.factory.ts     ← Email body content validation (#893)
│   ├── language-selector.factory.ts ← Language selector verify/switch/i18n validation (#896)
│   ├── mailgun-reply-to-validation.factory.ts ← Reply-To header env chain + delivery validation
│   └── gdpr.factory.ts              ← GDPR/storage validation
│
├── specs/
│   ├── happy-path/          ← Flujos completos (end-to-end)
│   │   ├── enrollment-flow-v4.spec.ts         ← Flujo V4 completo (15 tests)
│   │   ├── full-enrollment-v4.spec.ts         ← Flujo V4 extendido (16 tests)
│   │   ├── full-enrollment-with-params.spec.ts← V4 con 8 combinaciones de params (62 tests)
│   │   ├── lead-form.spec.ts                  ← Solo lead form
│   │   ├── plan-selection.spec.ts             ← Solo plan selection
│   │   ├── agreement.spec.ts                  ← Solo agreement signing
│   │   ├── checkout-flow.spec.ts              ← Solo checkout
│   │   └── completed.spec.ts                  ← Solo completed page
│   │
│   └── validation/          ← Casos edge y validaciones
│       ├── general-info-validation.spec.ts    ← Validación de campos lead form
│       ├── general-info-labels-v2.spec.ts     ← Labels/hints i18n Form 1 (#850-#853)
│       ├── country-state-dropdown-v2.spec.ts  ← Country/State dropdowns (#854, #855)
│       ├── details-validation.spec.ts         ← Validación de campos registration
│       ├── details-labels-v2.spec.ts          ← Labels/radios i18n Form 2 (#856-#858, #875, #877, #878, #879, #883-#888, #894)
│       ├── details-features-v2.spec.ts        ← Checkbox, education, back (#859-#861)
│       ├── phone-type-validation.spec.ts      ← Phone Type selector Form 1 + Form 2 (#874, #881)
│       ├── plan-selection-validation.spec.ts  ← Validación de plan selection
│       ├── enrollment-form-adjustments.spec.ts← Validación de nuevos campos (referral, billing, website, country filter, charter)
│       ├── email-validation.spec.ts           ← Validación de emails (3 tipos)
│       ├── email-verification-wording.spec.ts ← Email body wording Rules Document (#893)
│       ├── language-selector.spec.ts          ← Language selector URL param + switch + i18n (#896)
│       ├── no-email-without-plan.spec.ts      ← AC-44-v4d: no email sin plan
│       ├── full-validation.spec.ts            ← Validación completa del flujo
│       ├── paid-validation.spec.ts            ← Validación de paid page states
│       ├── agreement-validation.spec.ts       ← Validación de agreement page
│       ├── completed-validation.spec.ts       ← Validación de completed page
│       ├── checkout-validation.spec.ts        ← Validación de checkout
│       ├── navigation-guard-validation.spec.ts← Route guards post-pago
│       ├── session-management.spec.ts         ← Gestión de sesión
│       ├── company-websites-crm-mapping.spec.ts ← 5 URLs → Account CRM fields (#869)
│       ├── image-orientation-validation.spec.ts ← 10 photos orientation (#870)
│       └── mailgun-reply-to.spec.ts           ← Reply-To header validation (env + delivery)
│
└── results/                 ← Reportes y checklists
    ├── wise-membership-registration-and-payment/
    │   ├── acceptance-criteria.md
    │   ├── acceptance-criteria-checklist.md
    │   └── wise-membership-registration-and-payment-report.md
    ├── enrollment-form-field-adjustments/
    │   └── acceptance-criteria-checklist.md
    └── email-verification-wording/
        └── acceptance-criteria-checklist.md
    └── enrollment-language-selector/
        ├── acceptance-criteria-checklist.md
        └── implementation-plan.md
    └── mailgun-reply-to/
        └── acceptance-criteria-checklist.md
```

## Flujo V4 — Orden de pasos

```
/sign-up → /general-info → /details → /plan → /thank-you →
[verify email] → /agreement (Zoho Sign) → /agreement-signed →
/checkout (Stripe) → /paid
```

## Criterios de Aceptación

| Sección | ACs | Estado |
|---------|-----|--------|
| Gestión de Sesión | AC-01 a AC-03 | ✅ |
| Formulario General Info | AC-04 a AC-08 | ✅ |
| Formulario Details | AC-09 a AC-14 | ✅ |
| Plan & Stripe Checkout | AC-15, 15b, 15d, 17 | ✅ |
| Post-Pago & Email | AC-16 a AC-19d | ✅ |
| Firma del Acuerdo | AC-20 a AC-22g | ✅ |
| CRM | AC-23, AC-24 | ✅ |
| Seguridad | AC-26 | ✅ |
| Control Navegación | AC-32 a AC-35 | ✅ |
| Divisa & Precios | AC-36, AC-37 | ✅ |
| Errores & Feedback | AC-38, 39, 45 | ✅ |
| i18n | AC-42, 43, 46 | ✅ |
| Emails V4 | AC-44-v4a a AC-44-v4f | ✅ |
| Flujo V4 | AC-52, AC-53 | ✅ |
| Enrollment Form Adjustments | AC-EF01 a AC-EF20 | ✅ |
| Customer Portal (Stripe) | AC-CP01 a AC-CP04 (9 sub-criterios) | ✅ |
| CRM Fixes | AC-CRM01, AC-CRM02 | 📋 Backend |
| CRM Field Mapping Validation | AC-CRM-V01 a AC-CRM-V72 | ✅ 71 pass / ❌ 1 bug backend (V30) |
| Profile Photo Upload | AC-PU-01 a AC-PU-45 | ✅ 48 pass |
| Enrollment Form Corrections Batch 2 | AC-B2-01 a AC-B2-58 | ✅ 58 pass (60 tests) |
| Company Websites CRM Mapping | AC-869-01 a AC-869-10 | ✅ 10 pass (14 tests) |
| Image Orientation Validation | AC-870-01 a AC-870-13 | ✅ 13 pass — Zoho CRM rendering bug, not our pipeline |
| Field Adjustments (#874-#894) | 75 ACs automated | ✅ 75 pass (71 tests) |
| Email Verification Wording (#893) | 10 ACs | ✅ 10 pass (17 tests) |
| Language Selector (#896) | 30 ACs | ✅ 28 pass (39 tests), 2 unit-only |
| **Total** | **~401** | **398 ✅ + 2 📋 + 1 ❌ backend** |

Único AC sin validar E2E: AC-31 (reCAPTCHA) — backlog, no implementado.

## Flujo Secuencial: Enrollment → Provisioning

Los tests de enrollment y provisioning se ejecutan **secuencialmente**. Al completar el flujo `full-enrollment-multi-admin`, se exporta un `session-snapshot.json` en `.temp/` con la data del lead, registro, plan y admins. Este archivo es consumido por el test de provisioning (`full-provisioning-with-user-invited.spec.ts`) para continuar el flujo sin llamar al API de provisioning directamente.

```bash
# Paso 1: Enrollment completo (exporta session-snapshot.json)
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-multi-admin --reporter=list

# Paso 2: Provisioning (lee session-snapshot.json)
cd ../../../services/onboarding/modules/provisioning
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-provisioning-with-user-invited --reporter=list
```

**Flujo:**
1. Enrollment: Lead → Registration → Plan → Email Verify → Agreement (client signs) → Stripe → Paid → Admin1 signs → Admin2 signs → Document completed
2. Zoho Sign webhook fires → ProcessCountersign → ProcessProvisioningDispatch → Tenant + Company created → Invitation email sent
3. Provisioning: Lee snapshot → encuentra email de invitación → Owner: accept T&C → register → login → profile → send invitation → Invitee: accept → register → login → profile

## Profile Photo Upload

### Ejecutar tests de profile photo

```bash
# ─── Happy Path (requiere CDP para ver upload en browser) ────────────────────
CDP_ENDPOINT=http://localhost:9223 npx playwright test profile-photo-upload --reporter=list

# ─── Validation (errores, boundary, remove/re-upload, slow network) ──────────
CDP_ENDPOINT=http://localhost:9223 npx playwright test profile-photo-validation --reporter=list

# ─── API + S3 Bucket validation (headless OK — no browser needed) ────────────
npx playwright test profile-photo-api-validation --reporter=list
```

### Criterios validados (48 total)
- **UI Happy Path:** Input visible, accept types, upload → preview, blob URL, submit con foto
- **UI Validation:** >10MB error, WebP error, boundary 10MB, recovery, remove/re-upload, optional field, slow network uploading state, i18n error messages
- **API Endpoint:** Valid/invalid content types, missing fields, session validation, presigned URL PUT, filename sanitization, response shape
- **S3 Bucket:** CORS, lifecycle 3 days, public access blocked, key format structure
- **Lambda:** Env vars, timeout, IAM permissions (s3:PutObject only on uploads/*)

### Imágenes de prueba

Ubicación: `examples/profile-images/`

| Archivo | Tamaño | Para |
|---------|--------|------|
| `profile_under_10mb_square_b.jpg` | 780 KB | Happy path |
| `profile_under_10mb_square_a.jpg` | 2.4 MB | Re-upload |
| `profile_10mb_square.jpg` | 10 MB | Boundary |
| `profile_over_12mb_square.jpg` | 13.9 MB | Over limit |
| `not-validate-imagen-profile.webp` | 423 KB | Invalid type |

## Troubleshooting

### Zoho Sign iframe no carga (headless)

El `chrome-headless-shell` no renderiza iframes de terceros correctamente. Usar CDP:
```bash
CDP_ENDPOINT=http://localhost:9223 npx playwright test agreement
```

### Stripe Checkout timeout

Stripe test mode puede tener latencia. Aumentar timeout si falla:
```bash
npx playwright test checkout-flow --timeout=120000
```

### Email no llega (Mailosaur timeout)

- Verificar que `srv.onboarding` está corriendo (Lambda de dispatch)
- Verificar credenciales en `.env.qa`
- El timeout default es 60s — puede necesitar más en cold start

### "Session expired" o redirect inesperado

Las sesiones expiran después de 3 días (DynamoDB TTL). Si un test falla por sesión expirada, es porque se está reutilizando un session-id viejo. Cada test genera su propia sesión nueva.

## CRM Audit — Zoho Field Mapping Validation

El spec `audit-crm.spec.ts` valida que los datos enviados en los formularios de enrollment se reflejan correctamente en Zoho CRM. Incluye validación de foto de perfil.

### Ejecutar

```bash
# PRE-REQUISITO: Correr full-enrollment-v4 primero (genera session-snapshot.json)
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4 --reporter=list

# Luego correr audit standalone (headless OK — solo API, no browser)
npx playwright test audit-crm --reporter=list

# O correr ambos juntos:
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-v4 audit-crm --reporter=list
```

### Qué valida

| Sección | ACs | Campos |
|---------|-----|--------|
| Session Snapshot | V01-V04 | lead, registration, stripe, metadata, profilePhoto |
| Contact Fields | V08-V32 | 38 campos (personal, empresa, preferencias, status) |
| Account Fields | V33-V45 | 24 campos (nombre, tipo, industria, direcciones) |
| Cross-Module | V46-V47 | Asociación Contact↔Account, consistencia Company_Type |
| Profile Photo | V57-V59 | Foto existe en Contact (image/jpeg), originalName exportado |

### Known Issues

No known issues — all 64 CRM fields match after full enrollment flow.

### Status actual (2026-06-09)

- **64 match, 0 mismatch** ✅
- **Status transitions validated:**
  - Post client firma: `'Pending Countersign'` ✅ (AC-CRM-V62)
  - Post countersign: `'Signed Agreement'` ✅ (AC-CRM-V63)
- **Profile Photo** ✅ (365KB, image/jpeg, via `ProcessConvertContact` step 8)
- **37 tests en 4.3 min** via CDP

### Reportes

Cada ejecución genera un reporte en `.temp/report_crm_YYYY-MM-DDTHHMMSS.md` con tabla comparativa campo por campo.


## Plan Signing Validation — Ticket #868

Valida que cada plan × intervalo genera un agreement con ≥ 2 campos de firma para el client.

### Ejecutar

```bash
# Todos los planes (7 combinaciones, ~12 min via CDP)
CDP_ENDPOINT=http://localhost:9223 npx playwright test validation-functional-plans --reporter=list

# Solo un plan específico (e.g. company year — el bug)
CDP_ENDPOINT=http://localhost:9223 npx playwright test validation-functional-plans --grep "company.*year" --reporter=list

# Solo planes mensuales
CDP_ENDPOINT=http://localhost:9223 npx playwright test validation-functional-plans --grep "month" --reporter=list

# Solo planes anuales
CDP_ENDPOINT=http://localhost:9223 npx playwright test validation-functional-plans --grep "year" --reporter=list
```

### Plan matrix

| Plan | Interval | Signatures | Status |
|------|----------|-----------|--------|
| individual | year | 2 | ✅ Pass |
| general | month | 2 | ✅ Pass |
| general | year | 2 | ✅ Pass |
| company | month | 2 | ✅ Pass |
| **company** | **year** | **1** | **❌ Fail — BUG #868** |
| corporate | month | 2 | ✅ Pass |
| corporate | year | 2 | ✅ Pass |

### Output

Genera `.temp/plan-signing-report.json` con resultados detallados por plan:
```json
[
  { "plan": "company", "interval": "year", "signatureFieldsSigned": 1, "status": "fail", "bug": true }
]
```

### Última ejecución (2026-06-10)

- 68/71 tests passed (12 min)
- 6/7 plans pass, 1 fail (Company year = 1 firma)
- Bug confirmado: template de Zoho Sign para Company annual solo tiene 1 campo de firma configurado
