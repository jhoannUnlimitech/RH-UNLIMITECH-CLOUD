# Criterios de Aceptación — Ticket #837: Account Status after Payment

> **Ticket:** #837
> **Título:** Incorrect Membership Status on a new Company
> **Severidad:** Bug (Alta)
> **Regla violada:** §2 R029 — "The Active: Valid Payment Method Membership Status is automatically calculated by the WISE CRM based on the WISE Member's real-time payment status in Stripe."
> **Regla violada (ES):** §2 R029 — "El estado de membresía 'Activa: Método de Pago Válido' es calculado automáticamente por el CRM de WISE basándose en el estado de pago en tiempo real en Stripe."
> **Branch:** `bugfix/account-status-after-payment`
> **Fecha:** 2026-06-10

---

## Contexto

El cliente reporta que una empresa de prueba (ID# 1779909043469) con acuerdo firmado y contrafirmado muestra "Pending Membership" como Membership Status en vez de "Active: Valid Payment Method". El cliente indica que "Pending Membership" no debería ser un estado posible.

### Regla del Manual

**§2 (EN):**
> "The Active: Valid Payment Method Membership Status is **automatically calculated** by the WISE CRM based on the WISE Member's **real-time payment status in Stripe**."
>
> "(Membership Status) Active: Valid Payment Method – paying on time, with payment card or ACH payment information which will not expire in the next 60 days (the ideal scene for all memberships)."

**§2 (ES):**
> "El estado de membresía 'Activa: Método de Pago Válido' es **calculado automáticamente** por el CRM de WISE basándose en el **estado de pago en tiempo real en Stripe**."
>
> "Activa: Método de Pago Válido – pagando a tiempo, con tarjeta de crédito o información de pago ACH que no expirará en los próximos 60 días (la situación ideal para todas las membresías)."

---

## Criterios de Aceptación

### Account Status — Post-pago

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-837-01 | Post checkout exitoso (Stripe subscription active + card > 60d) → Account.Status = "Active: Valid Payment Method" | CRM API: full enrollment → verify Account.Status post-pago (con backoff) | 🔲 Pendiente |
| AC-837-02 | Account.Status ≠ "Pending Membership" después de que el pago se completa exitosamente | CRM API: verify Status ≠ "Pending Membership" post-checkout | 🔲 Pendiente |
| AC-837-03 | El handler `ProcessPayment` (webhook `checkout.session.completed`) actualiza Account.Status en Zoho CRM | Logs Lambda + CRM API verify | 🔲 Pendiente |
| AC-837-04 | El E2E audit CRM final valida Account.Status = "Active: Valid Payment Method" (actualizar AC-CRM-V45) | E2E: crm-expected-data.ts expected value | 🔲 Pendiente |

### Membership Level — Asignación por plan

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-837-05 | Plan "individual" → Account.Membership_Level = "Individual" | CRM API: verify field post-enrollment | 🔲 Pendiente |
| AC-837-06 | Plan "general" → Account.Membership_Level = "General" | CRM API: verify field | 🔲 Pendiente |
| AC-837-07 | Plan "company" → Account.Membership_Level = "Company" | CRM API: verify field | 🔲 Pendiente |
| AC-837-08 | Plan "corporate" → Account.Membership_Level = "Corporate" | CRM API: verify field | 🔲 Pendiente |

### Regresión

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-837-09 | El flujo `full-enrollment-v4` completa exitosamente 37+ tests | E2E: run full-enrollment-v4 | 🔲 Pendiente |
| AC-837-10 | El CRM audit final muestra 65+ match, 0 mismatch | E2E: audit-crm report | 🔲 Pendiente |

---

## Resumen

| Categoría | ACs | Estado |
|-----------|-----|--------|
| Account Status post-pago | 4 | 🔲 Pendiente validación |
| Membership Level por plan | 4 | 🔲 Pendiente validación |
| Regresión | 2 | 🔲 Pendiente validación |
| **Total** | **10** | **0 pass / 10 pendiente** |

---

## Implementación del developer (commits)

| Commit | Descripción |
|--------|-------------|
| `5b22dca` | `ProcessPayment`: actualiza Account.Status = "Active: Valid Payment Method" + Membership_Level |
| `1572445` | Corrige mapa plan→membership level (remove ceo, align cnames) |
| `5f84adc` | Verifica response del Account update, recupera de duplicate membership number |

---

## Próximos pasos

1. Correr `full-enrollment-v4` en esta rama para validar que Account.Status cambia post-pago
2. Actualizar `crm-expected-data.ts`: AC-CRM-V45 = "Active: Valid Payment Method"
3. Marcar ACs como pass o fail según resultados
4. Commit + push
