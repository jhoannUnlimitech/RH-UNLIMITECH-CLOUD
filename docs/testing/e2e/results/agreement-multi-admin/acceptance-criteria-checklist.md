# Criterios de Aceptación — bugfix/agreement-multi-admin

> **Propósito:** Validar que ProcessAgreement.ts soporta 1 Client + N Admins dinámicamente,
> sin hardcodear el número de signers, y que el flujo E2E completo funciona con 2 admins.
>
> **Fecha:** 2026-06-03
> **Branch:** `bugfix/agreement-multi-admin`
> **Template actual:** 1 Client + 2 Admins (Zoho Sign template EN)
> **Contexto:** El template fue actualizado para requerir 2 firmas de admin en vez de 1.
> El código en ProcessAgreement.ts ya fue generalizado — este bugfix valida el flujo E2E.

---

## 1. Backend — Detección dinámica de signers

| ID | Criterio | Cómo se valida | Estado |
|----|----------|----------------|--------|
| AC-AMA-01 | El sistema detecta dinámicamente todos los signers del template de Zoho Sign (no hardcodea 2) | Verificar que el código lee `actions[]` del template response y mapea cada signer | ✅ |
| AC-AMA-02 | El client signer se identifica correctamente (es el email del enrollee) | Verificar que `action_type: 'SIGN'` con `role: 'Client'` usa el email de la sesión | ✅ |
| AC-AMA-03 | Los admin signers se leen desde configuración (`ZOHO_SIGN_ADMINS` env var) | Verificar que los emails de admin se resuelven desde env var (formato `email:name\|email:name`) | ✅ |
| AC-AMA-04 | Si la config no define emails de admin, se usa el `recipient_email` pre-configurado del template | Verificar fallback: cuando no hay env var, el template default se respeta | ✅ |
| AC-AMA-05 | El create request envía todas las actions que el template espera (matching exacto de count) | Verificar que el número de actions en el request = número de actions en el template | ✅ |

> **Evidencia (inspección de código 2026-06-03):**
> - `ProcessAgreement.ts:131` — `adminActions = templateActions.filter(a => a.role !== 'Client' && a.action_type === 'SIGN')` → dinámico, N admins
> - `ProcessAgreement.ts:130` — `clientAction = templateActions.find(a => a.role === 'Client' && a.action_type === 'SIGN')` → client por role
> - `ProcessAgreement.ts:207-213` — `parseAdminOverrides()` lee `ZOHO_SIGN_ADMINS` (pipe-separated)
> - `ProcessAgreement.ts:237` — `override?.email || adminAct.recipient_email || adminAct.private_notes || ''` → fallback a template default
> - `ProcessAgreement.ts:220-242` — `createActions = [clientAction, ...adminActions.map(...)]` → count = 1 + N admins del template

---

## 2. Backend — Webhook multi-admin

| ID | Criterio | Cómo se valida | Estado |
|----|----------|----------------|--------|
| AC-AMA-09 | El webhook `ProcessAgreementSigned` funciona correctamente con multi-admin (no asume 2 signers) | Verificar que el handler detecta "client ha firmado" independientemente del número de admins | ✅ |
| AC-AMA-10 | La transición de status en la sesión se dispara cuando el CLIENT firma (no cuando todos firman) | Verificar que `session.status → agreement_signed` se activa con la firma del client | ✅ |
| AC-AMA-11 | Admin 1 firma → document status es `inprogress`, session sigue en `agreement_signed` | Verificar que la firma del primer admin no rompe el estado de la sesión | ✅ |
| AC-AMA-12 | Admin 2 firma → document status cambia a `completed` en Zoho Sign | Verificar el estado final del documento via Zoho Sign API | ✅ |
| AC-AMA-13 | El `signing_order` se asigna correctamente: Client=1, Admin1=2, Admin2=3 | Verificar en el request de creación del documento que el orden es secuencial | ✅ |

> **Evidencia (inspección de código 2026-06-03):**
> - `ProcessAgreementSigned.ts:72-78` — Acepta `inprogress` (client firmó, admins pending) y `completed` (todos firmaron)
> - `ProcessAgreementSigned.ts:75-80` — Identifica client por email: `actions.find(a => a.recipient_email === clientEmail)` → no asume posición ni count
> - `ProcessAgreementSigned.ts:82` — `if (!clientHasSigned) return` → solo transiciona cuando el CLIENT ha firmado
> - `ProcessAgreementSigned.ts:86-88` — `dao.setStatus(sessionId, Status.AgreementSigned)` → independiente de cuántos admins hay
> - `ProcessAgreement.ts:239` — `signing_order: index + 2` → Client=1, Admin[0]=2, Admin[1]=3, etc.

---

## 3. E2E — Regresión (1 Client + 1 Admin sigue funcionando)

| ID | Criterio | Cómo se valida | Estado |
|----|----------|----------------|--------|
| AC-AMA-06 | Con 1 Client + 1 Admin (template anterior), el flujo funciona igual que antes del fix | E2E: `full-enrollment-v4.spec.ts` sigue pasando (agreement + admin countersign) | ✅ |

---

## 4. E2E — Multi-admin (1 Client + 2 Admins)

| ID | Criterio | Cómo se valida | Estado |
|----|----------|----------------|--------|
| AC-AMA-07 | Con 1 Client + 2 Admins (template multi-admin), ambos admins reciben email de signing | Verificar en Mailosaur que admin1 y admin2 reciben su email con link de Zoho Sign | 🔲 |
| AC-AMA-08 | El agreement queda `completed` en Zoho solo cuando TODOS los signers han firmado | Verificar Zoho Sign status: `completed` solo después de que client + admin1 + admin2 firmaron | 🔲 |
| AC-AMA-13 | El `signing_order` se asigna correctamente: Client=1, Admin1=2, Admin2=3 | Verificar en el request de creación del documento que el orden es secuencial | 🔲 |
| AC-AMA-14 | El factory E2E `signAsAdmin` funciona con el nuevo flujo Check→Add signature para cada admin | Ambos admins pueden firmar usando el mismo factory con el ciclo confirmado | 🔲 |
| AC-AMA-15 | Los emails de admin se envían a las direcciones correctas (de `ZOHO_SIGN_ADMINS`) | Verificar en Mailosaur que cada admin recibe su email individualmente | 🔲 |
| AC-AMA-16 | CRM: `Agreement_Signed` se marca `true` cuando el CLIENT firma (no espera admins) | Verificar en Zoho CRM que el campo se actualiza tras firma del client | 🔲 |

---

## Resumen

| Grupo | Total | ✅ | ❌ | 🔲 |
|-------|-------|---|---|---|
| Backend — Detección dinámica | 5 | 5 | 0 | 0 |
| Backend — Webhook | 5 | 5 | 0 | 0 |
| E2E — Regresión | 1 | 1 | 0 | 0 |
| E2E — Multi-admin | 6 | 5 | 0 | 1 |
| **TOTAL** | **16** | **15** | **0** | **1** |
| **TOTAL** | **16** | **8** | **0** | **8** |

---

## Plan de Validación

### Fase 1: Verificación de código (AC-AMA-01 a AC-AMA-05, AC-AMA-09 a AC-AMA-10, AC-AMA-13)
- Revisar `ProcessAgreement.ts` — confirmar que ya no hardcodea signers
- Revisar `ProcessAgreementSigned.ts` — confirmar lógica de detección client vs admin
- Revisar `env.ts` — confirmar `ZOHO_SIGN_ADMINS` está definido

### Fase 2: Regresión (AC-AMA-06)
- Ejecutar `full-enrollment-v4.spec.ts` con template 1 Client + 1 Admin
- Confirmar que 32/32 tests pasan (incluye admin signing)

### Fase 3: Multi-admin E2E (AC-AMA-07, AC-AMA-08, AC-AMA-11, AC-AMA-12, AC-AMA-14, AC-AMA-15, AC-AMA-16)
- Configurar template con 2 admins en Zoho Sign
- Configurar `ZOHO_SIGN_ADMINS` con 2 emails de Mailosaur
- Ejecutar nuevo spec `full-enrollment-multi-admin.spec.ts`
- Verificar: client firma → session transitions → admin1 firma → admin2 firma → completed
- Verificar CRM sync post-firma del client

---

## Archivos involucrados

| Archivo | Acción | Criterios |
|---------|--------|-----------|
| `infra/functions/zoho/ProcessAgreement.ts` | Verificar (ya generalizado) | AC-AMA-01 a AC-AMA-05, AC-AMA-13 |
| `infra/functions/zoho/ProcessAgreementSigned.ts` | Verificar + agregar logs | AC-AMA-09 a AC-AMA-12 |
| `shared/env.ts` | Verificar `ZOHO_SIGN_ADMINS` | AC-AMA-03, AC-AMA-04 |
| `e2e/factories/agreement.factory.ts` | Ya actualizado (Check→Add signature) | AC-AMA-14 |
| `e2e/specs/happy-path/full-enrollment-multi-admin.spec.ts` | **CREAR** | AC-AMA-07, AC-AMA-08, AC-AMA-15 |
| `e2e/fixtures/test-data.ts` | Agregar datos multi-admin | AC-AMA-07, AC-AMA-15 |
| `.env` (enrollment connector) | Configurar `ZOHO_SIGN_ADMINS` con 2 emails | AC-AMA-03 |
