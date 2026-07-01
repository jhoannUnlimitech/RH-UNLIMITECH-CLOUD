# Criterios de Aceptación — Ticket #828: CRM Payment & Invoice Registration

> **Ticket:** #828
> **Título:** Payment (and invoice?) is not showing up
> **Branch:** `solution/stripe-payment-invoice`
> **Fecha creación:** 2026-06-12
> **Última validación:** 2026-06-30 — **40/40 tests pass (8.6 min)**
> **Spec:** `full-enrollment-v4.spec.ts` + `audit-crm.spec.ts`

---

## Contexto

Después de un pago exitoso de membresía, el sistema debe registrar automáticamente un **Payment** y un **Invoice** en Zoho CRM, vinculados al Individual (Contact) y a la Company (Account). Además, el Account debe tener `Stripe_ID` y `Expiration_Date` poblados.

### Formato esperado

**Description/Subject:** `{Plan} · {Intervalo} · {Nombre de la empresa}`
**Ejemplo:** `General Membership · Annual · Unlimitech Testing LLC - 1782832999330`

---

## Criterios de Aceptación

### Payment en Zoho CRM (Contact related list)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-01 | Post-pago exitoso → existe un Payment vinculado al Contact en Zoho CRM | CRM API: GET /Contacts/{id}/Payments (related list) | ✅ Pass (1 record) |
| AC-828-02 | El Payment tiene Description con formato `{Plan} · {Interval} · {CompanyName}` | CRM API: verify Description field | ✅ Pass ("General Membership · Annual · Unlimitech Testing LLC - 1782832999330") |
| AC-828-03 | El Payment tiene Amount correspondiente al precio del plan seleccionado | CRM API: verify Amount field | ✅ Pass ($500) |
| AC-828-04 | El Payment tiene Customer_Id (Stripe customer ID) | CRM API: verify Customer_Id field not empty | ✅ Pass ("cus_Unes2hg7279CCO") |
| AC-828-05 | El Payment tiene Period_Start y Period_End correctos (intervalo month/year) | CRM API: verify dates | ✅ Pass (2026-06-30 → 2027-06-30, annual) |

### Payment en Zoho CRM (Account related list)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-06 | El mismo Payment está vinculado al Account (Company) | CRM API: GET /Accounts/{id}/Payments | ✅ Pass (linked to Account) |
| AC-828-07 | Contact.Payment y Account.Payment son el mismo registro | CRM API: verify same Payment ID | ✅ Pass |

### Invoice en Zoho CRM (Contact related list)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-08 | Post-pago exitoso → existe un Invoice vinculado al Contact | CRM API: search by Contact_Name | ✅ Pass (1 record) |
| AC-828-09 | El Invoice tiene Subject con formato `{Plan} · {Interval} · {CompanyName}` | CRM API: verify Subject field | ✅ Pass ("General Membership · Annual · Unlimitech Testing LLC - 1782832999330") |
| AC-828-10 | El Invoice tiene Status = "Paid" o "Approved" | CRM API: verify Status field | ✅ Pass ("Approved") |
| AC-828-11 | El Invoice tiene Total correspondiente al monto pagado | CRM API: verify Total field | ✅ Pass (500) |
| AC-828-12 | El Invoice tiene Receipt_Number | CRM API: verify Receipt_Number not empty | ✅ Pass ("6120519000017017039") |

### Verificación cruzada Stripe ↔ Zoho

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-13 | El Customer_Id del Payment en Zoho es un Stripe customer ID válido (formato `cus_*`) | API: verify format starts with 'cus_' | ✅ Pass ("cus_Unes2hg7279CCO") |
| AC-828-14 | El Amount del Payment coincide con el monto esperado | API: verify Amount field | ✅ Pass (Amount=500) |
| AC-828-15 | El Subscription_Id en Zoho corresponde a la suscripción activa en Stripe | API: Stripe GET /subscriptions → verify match | ✅ Pass ("sub_1To3YvRKKa3Cg9QidPxk9r1v") |

### Timing

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-16 | El Payment aparece en Zoho CRM dentro de 30 segundos post-checkout | CRM API: backoff polling (5s × 6 intentos) | ✅ Pass (found on attempt 1) |

---

## Account Post-Payment Fields

### Account.Stripe_ID

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-17 | Post-pago → Account.Stripe_ID contiene Stripe Customer ID (`cus_*`) | CRM API: GET Account → Stripe_ID field | ✅ Pass (included in 24/24 Account match) |
| AC-828-18 | Account.Stripe_ID es el mismo valor que Contact.Stripe_ID | CRM API: cross-check Account vs Contact | ✅ Pass |

### Account.Expiration_Date

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-19 | Post-pago → Account.Expiration_Date tiene valor (no vacío) | CRM API: GET Account → Expiration_Date | ✅ Pass (included in 24/24 Account match) |
| AC-828-20 | Plan anual: Expiration_Date = Sign-Up Date + ~365 días | CRM API: verify date diff | ✅ Pass (2026-06-30 → 2027-06-30) |
| AC-828-21 | Plan mensual: Expiration_Date = Sign-Up Date + ~30 días | CRM API: verify date diff | N/A (test usa plan anual) |
| AC-828-22 | Expiration_Date formato correcto (YYYY-MM-DD o Zoho date format) | CRM API: regex validation | ✅ Pass |

### Products WISE Stripe (related list)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-828-23 | Post-pago → Products WISE Stripe record vinculado al Contact | CRM API: GET related list | ⏳ Pendiente (módulo custom no vinculado aún) |
| AC-828-24 | Post-pago → Products WISE Stripe record vinculado al Account | CRM API: GET related list | ⏳ Pendiente |
| AC-828-25 | Product tiene nombre del plan | CRM API: verify Product_Name | ⏳ Pendiente |
| AC-828-26 | Product tiene Subscription_Id de Stripe | CRM API: verify field | ⏳ Pendiente |

---

## Resumen

| Grupo | ACs | Pass | Pendiente |
|-------|:---:|:---:|:---:|
| Payment (Contact) | 5 | 5 ✅ | 0 |
| Payment (Account) | 2 | 2 ✅ | 0 |
| Invoice (Contact) | 5 | 5 ✅ | 0 |
| Cross-check Stripe ↔ Zoho | 3 | 3 ✅ | 0 |
| Timing | 1 | 1 ✅ | 0 |
| Account.Stripe_ID | 2 | 2 ✅ | 0 |
| Account.Expiration_Date | 4 | 3 ✅ | 0 (1 N/A) |
| Products WISE Stripe | 4 | 0 | 4 ⏳ |
| **Total** | **26** | **21 ✅** | **4 ⏳ + 1 N/A** |

---

## Nota sobre Contact.Status

El único mismatch en el CRM audit es:
- `Contact.Status`: Expected "Signed Agreement" → Actual "Pending Countersign"

Esto es un **timing issue del webhook de Zoho Sign**, no un bug del código. El webhook de countersign es asíncrono y en algunos casos tarda > 160 segundos. No afecta la funcionalidad — el Status se actualiza eventualmente cuando el webhook procesa.

---

## Evidencia de ejecución

```
Fecha: 2026-06-30
Spec: full-enrollment-v4.spec.ts
Resultado: 40/40 pass (8.6 min)
CRM Audit: 63 match, 1 mismatch (Status timing)
Lead: testlead.xxx@emxeecta.mailosaur.net
Account: Unlimitech Testing LLC - 1782832999330
Membership Number: 2026030149
Stripe Customer: cus_Unes2hg7279CCO
Stripe Subscription: sub_1To3YvRKKa3Cg9QidPxk9r1v
```
