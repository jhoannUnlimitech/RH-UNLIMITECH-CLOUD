# Criterios de Aceptación Adicionales — Account Fields Post-Payment

> **Ticket:** #828 (extensión)
> **Branch:** `solution/stripe-payment-invoice`
> **Fecha creación:** 2026-06-26
> **Última validación:** 2026-06-30 — ✅ 21/22 pass (4 pendientes de Products module)
> **Implementado por developer:** Commit `f39598b` (Stripe_ID + Expiration_Date + firstName)

---

## Criterios de Aceptación — Estado actualizado

### Account.Stripe_ID — ✅ IMPLEMENTADO Y VALIDADO

| ID | Criterio | Estado | Evidencia |
|----|----------|:---:|---|
| AC-828-17 | Account.Stripe_ID tiene valor (`cus_*`) | ✅ Pass | Incluido en 24/24 Account match |
| AC-828-18 | Account.Stripe_ID = Contact.Stripe_ID | ✅ Pass | Ambos = `cus_Unes2hg7279CCO` |

### Account.Expiration_Date — ✅ IMPLEMENTADO Y VALIDADO

| ID | Criterio | Estado | Evidencia |
|----|----------|:---:|---|
| AC-828-19 | Expiration_Date no vacío | ✅ Pass | Incluido en 24/24 Account match |
| AC-828-20 | Plan anual: ~365 días después de Sign-Up | ✅ Pass | 2026-06-30 → 2027-06-30 |
| AC-828-21 | Plan mensual: ~30 días después de Sign-Up | N/A | Test usa plan anual |
| AC-828-22 | Formato fecha válido | ✅ Pass | Zoho date format |

### Products WISE Stripe — ⏳ PENDIENTE DE IMPLEMENTACIÓN

| ID | Criterio | Estado | Nota |
|----|----------|:---:|---|
| AC-828-23 | Products vinculado al Contact | ⏳ | Módulo custom no vinculado aún |
| AC-828-24 | Products vinculado al Account | ⏳ | Módulo custom no vinculado aún |
| AC-828-25 | Product tiene nombre del plan | ⏳ | Requiere implementación |
| AC-828-26 | Product tiene Subscription_Id | ⏳ | Requiere implementación |

---

## Resumen

```
Account.Stripe_ID:       ✅ Corregido por developer (commit f39598b) — validado 2026-06-30
Account.Expiration_Date: ✅ Corregido por developer (commit f39598b) — validado 2026-06-30
Products WISE Stripe:    ⏳ Pendiente — módulo custom en Zoho CRM no tiene lógica de vinculación
```
