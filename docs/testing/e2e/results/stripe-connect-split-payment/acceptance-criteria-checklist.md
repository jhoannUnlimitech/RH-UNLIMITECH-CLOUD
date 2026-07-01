# Criterios de Aceptación — Stripe Connect Split Payment

> **Branch:** `solution/stripe-connect-split-payment`
> **Fecha:** 2026-06-23
> **Última ejecución:** 2026-06-23 (26/26 pass — 2.4min)
> **Pre-requisitos:** Connect webhook configurado + Products migrados a connected account

---

## Descripción

Implementación de Stripe Connect Direct Charges en el flujo de enrollment. Cada pago de membresía se divide:
- **Platform (MasterTech):** 30% via `application_fee_percent`
- **Connected (WISE):** ~70% - Stripe processing fee
- **Stripe fee:** 2.9% + $0.30 (absorbido por la cuenta conectada)

El Customer, Subscription y Charges viven en la **cuenta conectada** (no en la plataforma).
La confirmación del pago llega via un **Connect webhook** (eventos de la cuenta conectada).

---

## Grupo A: Flujo funcional (E2E browser)

**Objetivo:** Confirmar que el enrollment completo funciona end-to-end con Stripe Connect.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-SC-01 | Checkout page de Stripe carga correctamente | E2E browser: Stripe hosted page visible | ✅ |
| AC-SC-02 | Paid page carga post-checkout (Connect webhook procesado) | E2E browser: /paid URL loads | ✅ |
| AC-SC-03 | Welcome email llega post-payment (< 90s) | E2E Mailosaur (validado en full-enrollment-v4) | ✅ |
| AC-SC-04 | Session DynamoDB status = 'completed' | DynamoDB: verify session status | ✅ |
| AC-SC-05 | Session DynamoDB stripe.subscriptionId tiene valor | DynamoDB: verify field not null | ✅ |

---

## Grupo B: Split payment validation (Stripe API — post-enrollment)

**Objetivo:** Validar que el pago se dividió correctamente entre plataforma y cuenta conectada.

**Pre-requisito:** Enrollment de Grupo A completado (session con checkoutSessionId).

| ID | Criterio | Método | Estado | Valor observado |
|----|----------|--------|--------|-----------------|
| AC-SC-06 | Checkout Session vive en la cuenta conectada | Stripe API: GET /checkout/sessions/{id} con `stripeAccount` header | ✅ | status: open, mode: subscription |
| AC-SC-07 | Customer vive en la cuenta conectada | Stripe API: GET /customers/{id} con `stripeAccount` | ✅ | cus_Ul8Miphb1Ph6d8 |
| AC-SC-08 | Subscription activa con fee_percent=30 | Stripe API: GET /subscriptions/{id} con `stripeAccount` | ✅ | status: active, application_fee_percent: 30 |
| AC-SC-09 | Charge tiene application_fee = 30% del monto total | Stripe API: application_fee.amount / charge.amount = 0.30 | ✅ | $150.00 de $500.00 (30.0%) |
| AC-SC-10 | Stripe processing fee absorbido por cuenta conectada | Stripe API: balance_transaction.fee breakdown | ✅ | $14.80 (bt.fee=$164.80 = $150 platform + $14.80 Stripe) |
| AC-SC-11 | Net amount = total - application_fee - stripe_fee | Stripe API: balance_transaction.net = expected | ✅ | $335.20 = $500 - $150 - $14.80 |
| AC-SC-12 | Platform (MasterTech) recibe exactamente 30% | Stripe API: application_fee / charge = 0.30 | ✅ | 30.0% confirmado |

---

## Grupo C: Configuración y prerequisitos

**Objetivo:** Validar que la infraestructura de Connect está correctamente configurada.

| ID | Criterio | Método | Estado | Valor observado |
|----|----------|--------|--------|-----------------|
| AC-SC-13 | SSM parameter existe con schema correcto | AWS CLI: ssm get-parameter | ✅ | `/stacks/HCAMSWS--Stripe/DevQA/config/stripe-connect` → `{"default":{"accountId":"acct_1ThCwARKKa3Cg9Qi","feePercent":30}}` |
| AC-SC-14 | Connected account ID es válido en Stripe | Stripe API: GET /accounts/{id} | ✅ | charges_enabled: true, payouts_enabled: true |
| AC-SC-15 | Products/Prices existen en la cuenta conectada | Stripe API: GET /products + /prices con `stripeAccount` | ✅ | 6 products, 50 prices |

---

## Grupo D: CRM post-payment (cubierto por full-enrollment-v4)

**Objetivo:** Confirmar que CRM sync funciona igual con Connect.

| ID | Criterio | Método | Estado | Nota |
|----|----------|--------|--------|------|
| AC-SC-16 | Account.Membership_Number asignado post-payment | CRM API (full-enrollment-v4 audit) | ✅ | Validado en full-enrollment-v4 run (30/37 pass, CRM audit OK) |
| AC-SC-17 | Account.Status = "Active: Valid Payment Method" | CRM API (full-enrollment-v4 audit) | ✅ | Validado en full-enrollment-v4 run |

---

## Resumen

| Grupo | ACs | Pass | Método principal |
|-------|-----|------|-----------------|
| A (Flujo funcional) | 5 | 5/5 ✅ | E2E browser + DynamoDB |
| B (Split payment) | 7 | 7/7 ✅ | Stripe API (post-enrollment) |
| C (Configuración) | 3 | 3/3 ✅ | AWS CLI + Stripe API |
| D (CRM) | 2 | 2/2 ✅ | CRM API (full-enrollment-v4) |
| **Total** | **17** | **17/17 ✅** | |

---

## Resultados Observados — Split Payment Breakdown (General Annual $500)

```
═══════════════════════════════════════════════════════
  Connected Account: acct_1ThCwARKKa3Cg9Qi
  Plan: General Annual ($500.00)

  Platform (MasterTech): $150.00 (30%)
  Stripe fee:            $14.80  (2.9% + $0.30)
  Net to Connected:      $335.20 (67.0%)
═══════════════════════════════════════════════════════
```

Matches the developer's description:
- ✅ 30% platform fee → $150
- ✅ Stripe fee (2.9% + $0.30) absorbed by connected → $14.80
- ✅ Connected receives ~67% → $335.20

---

## Fee Calculation Reference

### Plan: Corporate Annual ($500/year) — VALIDATED

```
Total charge:       $500.00 (50000 cents)
Application fee:    $150.00 (30% → platform MasterTech) ✅ CONFIRMED
Stripe fee:         $14.80  (2.9% + $0.30 → absorbed by connected) ✅ CONFIRMED
Net to connected:   $335.20 (WISE) ✅ CONFIRMED
```

### Formula (validated)

```
application_fee = charge_amount × 0.30
stripe_fee = (charge_amount × 0.029) + 30  (in cents)
net_connected = charge_amount - application_fee - stripe_fee
```

---

## Spec Architecture

```
e2e/
├── fixtures/
│   └── stripe-client.ts              ← HTTP client for Stripe API (connected account queries)
├── factories/
│   └── stripe-connect-validation.factory.ts  ← Factories for split payment validation
├── specs/
│   └── validation/
│       └── stripe-connect-split-payment.spec.ts  ← Spec orchestration (26 tests)
└── results/
    └── stripe-connect-split-payment/
        └── acceptance-criteria-checklist.md  ← THIS FILE
```

---

## Configuración requerida (antes de correr)

### 1. Crear Connect Webhook en Stripe Dashboard

```bash
# Obtener Function URL del Lambda Webhook:
aws lambda get-function-url-config \
  --function-name "HCAMSWS--Stripe-DevQA-WebhookFunction-*" \
  --query 'FunctionUrl' --output text

# En Stripe Dashboard → Developers → Webhooks → Add endpoint:
# - URL: <Function URL obtenida>
# - Listen to: "Events on Connected accounts" (NOT "Events on your account")
# - Events: checkout.session.completed, checkout.session.expired
# - Description: HCAMSWS--StripeConnect-DevQA
```

### 2. Configurar signing secret

```bash
# Copiar el signing secret del webhook recién creado
# Agregarlo al .env de cloud.stripe:
echo 'STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...' >> packages/cloud/stripe/.env
```

### 3. Redeploy cloud.stripe

```bash
cd packages/cloud/stripe
npm run sst:dev  # o webiai infra dev
```

### 4. Verificar Products en cuenta conectada

```bash
curl -s -u "$STRIPE_SECRET_KEY:" \
  -H "Stripe-Account: acct_1ThCwARKKa3Cg9Qi" \
  "https://api.stripe.com/v1/products?active=true" | jq '.data | length'
# Debe retornar >= 5 (Individual, General, Company, Corporate, Charter)
```

### 5. STRIPE_SECRET_KEY en .env.qa del SPA

```bash
# Requerido para que el spec pueda consultar la Stripe API
# packages/apps/enrollment/modules/spa/.env.qa
STRIPE_SECRET_KEY=sk_test_...
STRIPE_CONNECTED_ACCOUNT_ID=acct_1ThCwARKKa3Cg9Qi
```

---

## Notas técnicas

- **Direct Charge pattern:** La sesión de checkout se crea CON el header `stripeAccount` → todo vive en la cuenta conectada
- **application_fee_percent vs application_fee_amount:** Se usa `_percent` porque es una suscripción (no one-time), y se configura dentro de `subscription_data`
- **SSM path:** `/stacks/HCAMSWS--Stripe/DevQA/config/stripe-connect` (nota: `$app.name` resuelve a `HCAMSWS--Stripe`, no `HCAMSWS/Stripe`)
- **SSM cache:** La config se cachea 5 min en Lambda — cambios en SSM tardan hasta 5 min en aplicar
- **Webhook tipo Connect:** Un solo webhook en la cuenta plataforma recibe eventos de TODAS las cuentas conectadas. El evento incluye `account: 'acct_XXX'` para identificar la fuente.
- **Checkout Session status:** En modo subscription, la session puede quedar `open` brevemente (Stripe la cierra async). La subscription `active` con `application_fee_percent: 30` es la confirmación autoritativa.
- **Charge timing:** El charge se crea via invoice (subscription). Puede tardar unos segundos post-checkout. El spec usa exponential backoff (2s→3s→5s→8s→10s×4 = ~58s max).
- **balance_transaction.fee en Direct Charges:** Incluye TANTO el Stripe processing fee COMO la application_fee. El Stripe fee real = `bt.fee - application_fee_amount`.

---

## Bugs encontrados durante QA

### BUG-1: SSM Parameter path mismatch (RESUELTO)

**Síntoma:** Checkout Lambda fallaba con "Can only apply application_fee_percent when made on behalf of another account"
**Causa:** El SSM parameter fue creado manualmente en `/stacks/HCAMSWS/Stripe/DevQA/config/stripe-connect` pero el Lambda lee de `/stacks/HCAMSWS--Stripe/DevQA/config/stripe-connect` (porque `$app.name` resuelve a `HCAMSWS--Stripe`).
**Fix:** Eliminar parameter incorrecto, hacer refresh de Pulumi, y redeploy para que Pulumi re-cree el parameter en el path correcto con el seed value del `.env`.

### BUG-2: SSM parameter con accountId vacío (RESUELTO)

**Síntoma:** Mismo error que BUG-1 — `application_fee_percent` se pasaba sin `stripeAccount` header.
**Causa:** El parameter creado por Pulumi tenía `"accountId":""` porque la env var `STRIPE_ACCOUNT_CONNECTED` no se propagó correctamente al seed value.
**Fix:** Confirmado que con `.env` correcto (`STRIPE_ACCOUNT_CONNECTED=acct_1ThCwARKKa3Cg9Qi` + `STRIPE_CONNECT_FEE_PERCENT=30`) el seed genera el JSON correcto.

### BUG-3: Webhook URL stale post-redeploy (operacional, no código)

**Síntoma:** Webhook no llegaba al Lambda después de redeploy.
**Causa:** Cada redeploy de cloud.stripe genera una nueva Function URL. El webhook en Stripe apuntaba a la URL anterior.
**Fix:** Actualizar la URL del webhook endpoint en Stripe Dashboard/API después de cada redeploy. Documentado en `docs/deployment/stripe-connect-webhook.md`.
