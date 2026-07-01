# Criterios de Aceptación — Mailgun Reply-To Header

> **Branch:** `solution/mailgun-reply-to`
> **Fecha creación:** 2026-07-01
> **Commit developer:** `e11e80a` feat(cloud.core): configurable Reply-To header for Mailgun emails
> **Spec:** `mailgun-reply-to.spec.ts`
> **Última ejecución:** 2026-07-01 — 11/11 pass (1.8s) + full-enrollment-v4 40/40 pass (7.5min)

---

## Contexto

El developer implementó un header `Reply-To` configurable para todos los emails enviados via Mailgun.
La lógica de precedencia es:

```
per-call replyTo (payload) > MAILGUN_REPLY_TO (env var) > none (sin header)
```

Esto permite que cuando un usuario responda un email de WISE, la respuesta llegue a una casilla
de soporte (`support@membership.wise.org`) en vez de a `noreply@membership.wise.org`.

---

## Grupo A: Environment Chain (R02 compliance)

**Objetivo:** Validar que la variable `MAILGUN_REPLY_TO` está correctamente wired en toda la cadena.

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-RT-01 | `CoreEnv` interface tiene campo `mailgun.replyTo?: string` con JSDoc | File grep: cloud.core/infra/env.ts | ✅ Pass |
| AC-RT-02 | Visitor lee `MAILGUN_REPLY_TO` con `.optional.string()` | File grep: cloud.core/infra/env.ts visitor | ✅ Pass |
| AC-RT-03 | `CoreEnv.MAILGUN_REPLY_TO` declarado en `lib.node.core/src/env.ts` con JSDoc | File grep: libs/node/core/src/env.ts | ✅ Pass |
| AC-RT-04 | Factory inyecta `MAILGUN_REPLY_TO` al Lambda condicionalmente (`? { VAR } : {}`) | File grep: cloud.core/infra/factories/functions.ts | ✅ Pass |

---

## Grupo B: Contract (SendEmail Input interface)

**Objetivo:** Validar que el contrato tipado incluye `replyTo` con documentación.

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-RT-05 | `Input` interface tiene campo `replyTo?: string` | File grep: fn.send-email.ts | ✅ Pass |
| AC-RT-06 | Campo `replyTo` tiene JSDoc explicando precedencia y comportamiento | File grep: JSDoc present | ✅ Pass |

---

## Grupo C: Lambda Implementation (SendEmail.ts)

**Objetivo:** Validar que el Lambda aplica el header correctamente con la lógica de precedencia.

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-RT-07 | Lambda lee `MAILGUN_REPLY_TO` como `defaultReplyTo` en constructor | File grep: SendEmail.ts | ✅ Pass |
| AC-RT-08 | Lambda resuelve replyTo con precedencia: `event.replyTo ?? this.defaultReplyTo` | File grep: precedence logic | ✅ Pass |
| AC-RT-09 | Lambda aplica `h:Reply-To` en form data solo cuando replyTo tiene valor | File grep: `if (replyTo) form.set('h:Reply-To', replyTo)` | ✅ Pass |
| AC-RT-10 | Sin replyTo ni env → NO se agrega header (no se envía `h:Reply-To` vacío) | Code logic: `if` guard prevents empty header | ✅ Pass |

---

## Grupo D: E2E Delivery — Header presente en email real

**Objetivo:** Validar que el email recibido tiene (o no) el header Reply-To según configuración.

**Pre-requisito:** `MAILGUN_REPLY_TO=support@membership.wise.org` en `cloud.core/.env` + servicio corriendo.

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-RT-11 | Email enviado con `MAILGUN_REPLY_TO` configurado → header Reply-To presente en Mailosaur | Mailosaur API: message headers check | ✅ Pass |
| AC-RT-12 | Header Reply-To tiene valor (no vacío) — valor actual: `moises@unlimitech.cloud` (env del developer) | Mailosaur API: header value present | ✅ Pass |

---

## Resumen

| Grupo | ACs | Método | Costo |
|-------|:---:|--------|-------|
| A (Env Chain) | 4 | File grep — sin servicios | 0 (< 1s) |
| B (Contract) | 2 | File grep — sin servicios | 0 (< 1s) |
| C (Lambda) | 4 | File grep — sin servicios | 0 (< 1s) |
| D (E2E Delivery) | 2 | Mailosaur headers — requiere servicios + email enviado | Medio (~60s) |
| **Total** | **12** | | |

---

## Estrategia de automatización

### Spec: `mailgun-reply-to.spec.ts`

```
e2e/
├── factories/
│   └── mailgun-reply-to-validation.factory.ts   ← File grep assertions (AC-RT-01 a 10)
│                                                   + Mailosaur header check (AC-RT-11, 12)
├── specs/validation/
│   └── mailgun-reply-to.spec.ts                 ← Spec orquestador
└── results/mailgun-reply-to/
    └── acceptance-criteria-checklist.md          ← Este archivo
```

### Grupo A–C (estáticos): corren sin servicios, solo leen archivos

- Pattern idéntico a `mailgun-env-chain.spec.ts`
- Factory lee archivos del repo y hace assertions con regex
- 10 ACs en < 1 segundo

### Grupo D (E2E): requiere servicio corriendo

**Opción 1 (standalone):** Invocar Lambda SendEmail directamente con payload de prueba → verificar header en Mailosaur.

**Opción 2 (integrado):** Correr `full-enrollment-v4` con `MAILGUN_REPLY_TO` configurado → verificar headers en los emails que ya se reciben en el flujo.

**Recomendación:** Opción 1 — más rápido, más aislado, no necesita el flujo completo.

---

## Ejecución

```bash
# Grupo A–C (sin servicios — solo file assertions)
npx playwright test mailgun-reply-to --reporter=list

# Grupo D (requiere cloud.core corriendo con MAILGUN_REPLY_TO configurado)
CDP_ENDPOINT=http://localhost:9223 npx playwright test mailgun-reply-to --reporter=list
```

---

## Variable de entorno requerida

Agregar en `packages/cloud/core/.env`:
```env
MAILGUN_REPLY_TO=support@membership.wise.org
```


---

## Evidencia de ejecución

```
Fecha: 2026-07-01
Spec: mailgun-reply-to.spec.ts — 11/11 pass (1.8s)
Full-enrollment-v4.spec.ts — 40/40 pass (7.5 min)

Reply-To header confirmado en email:
  Header: Reply-To = "moises@unlimitech.cloud"
  Nota: Valor del developer (su .env). En producción será support@membership.wise.org.
  Feature: ✅ Funcional — el header se aplica correctamente según MAILGUN_REPLY_TO.

CRM Audit: 63 match, 1 mismatch (Status timing — countersign webhook async)
```
