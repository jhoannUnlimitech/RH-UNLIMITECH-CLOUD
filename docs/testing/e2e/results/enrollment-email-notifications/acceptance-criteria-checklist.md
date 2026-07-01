# Criterios de Aceptación — Enrollment Email Notifications

> **Branch:** `solution/enrollment-email-notifications`
> **Fecha:** 2026-06-30
> **Última ejecución:** 2026-06-30 — 9/9 pass (spec) + 40/40 pass (full-enrollment-v4)
> **Specs:** `mailgun-receipt.spec.ts` + `full-enrollment-v4.spec.ts`
> **Rules Document:** D3 + D4 (pg 80)

---

## Contexto

El Rules Document establece que los emails post-payment deben incluir un receipt link. Esta rama implementa:
- **D3 (Completed):** Receipt link en el welcome email
- **D4 (Payment Transaction):** Email separado con receipt per transaction

Ambos usan la URL permanente del Stripe Charge (`pay.stripe.com/receipts/...`).

---

## Criterios de Aceptación — D3 Receipt en Completed email

### Template Content

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-EN-01 | Template tiene "Your receipt is available" (referencia al receipt) | File grep | ✅ Pass |
| AC-EN-02 | Template tiene botón "View Receipt" con `href={{receiptUrl}}` (azul, styled) | File grep | ✅ Pass |
| AC-EN-03 | Template usa `{{#if receiptUrl}}` (condicional — graceful si no hay URL) | File grep | ✅ Pass |
| AC-EN-04 | Template tiene fallback link con `{{receiptUrl}}` como texto visible | File grep | ✅ Pass |

### Producer + Consumer Wiring

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-EN-05 | ProcessPayment pasa `receiptUrl` en el mensaje SQS al EmailDispatch | Code grep | ✅ Pass |
| AC-EN-06 | EmailDispatch forward `receiptUrl` como variable al template Mailgun | Code grep | ✅ Pass |
| AC-EN-07 | GetSubscriptionDetails retorna `receiptUrl` del Stripe Charge | Code grep | ✅ Pass |

### Delivery + Graceful Degradation

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-EN-08 | Template wired para receipt URL (href apunta a variable) | File grep | ✅ Pass |
| AC-EN-09 | Sin receiptUrl el botón NO se muestra ({{#if}} lo oculta) | Template logic | ✅ Pass |

---

## Criterios de Aceptación — D4 Payment Transaction email

### Template

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-D4-01 | Template `enrollment--payment-transaction.html` existe | File check | ✅ Pass |
| AC-D4-02 | Template tiene `Dear {{firstName}},` | File grep | ✅ Pass |
| AC-D4-03 | Template tiene "Thank you for your WISE Membership payment" (Rules D4) | File grep | ✅ Pass |
| AC-D4-04 | Template tiene botón [View Receipt] con `{{receiptUrl}}` | File grep | ✅ Pass |
| AC-D4-05 | Template tiene `{{#if receiptUrl}}` condicional | File grep | ✅ Pass |
| AC-D4-06 | Template tiene fallback link | File grep | ✅ Pass |
| AC-D4-07 | Template tiene sign-off "Best regards, WISE Membership Support" | File grep | ✅ Pass |

### Builder + Wiring

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-D4-08 | `EmailType.PaymentTransaction` existe en email-types.ts | Code grep | ✅ Pass |
| AC-D4-09 | Builder en EmailDispatch emite template `enrollment--payment-transaction` | Code grep | ✅ Pass |
| AC-D4-10 | Builder Subject = "Your WISE Membership Receipt" | Code grep | ✅ Pass |
| AC-D4-11 | Builder pasa variables `{ firstName, receiptUrl }` | Code grep | ✅ Pass |

### Delivery (E2E)

| ID | Criterio | Método | Estado |
|----|----------|--------|:---:|
| AC-D4-12 | Email "Your WISE Membership Receipt" llega post-payment | Mailgun Events API | ✅ Pass (confirmado) |
| AC-D4-13 | Email From = `noreply@membership.wise.org` | Mailgun Events | ✅ Pass |

---

## Templates validation vs Rules Document

| Template | Rules | Elementos requeridos | Compliant? |
|---|---|---|:---:|
| `enrollment--email-verify` (D1) | Step 6 | Dear name, VERIFY btn, domain notice, 3 tips, contact, sign-off | ✅ 100% |
| `enrollment--agreement-signed` (D2) | Step 9 | Dear name, body text, Continue to Payment btn, fallback, sign-off, NO "next step" | ✅ 100% |
| `enrollment--completed` (D3) | Step 11 | Dear name, payment, receipt ref, 5 days, notification, View Receipt btn, sign-off | ✅ 100% |
| `enrollment--payment-transaction` (D4) | All payments | Dear name, WISE payment, receipt ref, View Receipt btn, sign-off | ✅ 100% |
| `enrollment--post-countersign` (D5) | Post-countersign | Dear name, agreement processed, DOWNLOAD btn | ❌ **NO EXISTE** |

---

## Resumen

| Grupo | ACs | Pass | Pendiente |
|---|:---:|:---:|:---:|
| D3 Receipt (template + wiring) | 9 | 9 ✅ | 0 |
| D4 Payment Transaction (template + builder + delivery) | 13 | 13 ✅ | 0 |
| Templates Rules compliance (D1-D4) | 4 | 4 ✅ | 0 |
| **D5 Post-Countersign** | — | — | **❌ No implementado** |
| **Total** | **26** | **26 ✅** | **D5 pendiente** |

---

## Pendiente (fuera del scope de esta rama)

| Email | Estado | Dependencia |
|---|:---:|---|
| D5: Post-Countersign | ❌ | Template + builder + Zoho Sign download URL |
| E2: Admin notification | ❌ | Template + continent→admin resolver |
| firstName bug (Agreement + Welcome) | ⏳ | 1 línea × 2 producers |

---

## Evidencia

```
Ejecución: 2026-06-30
Spec mailgun-receipt: 9/9 pass (1.1s)
Full-enrollment-v4: 40/40 pass (7.4min)
Mailgun Events: 4 emails delivered per enrollment
  - "Verify your email — WISE Membership"
  - "WISE Membership Agreement Signed!"
  - "Thank you for your WISE Membership payment"
  - "Your WISE Membership Receipt"  ← NUEVO (D4)
Templates: 4/5 compliant (D5 faltante)
```
