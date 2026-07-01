# Criterios de Aceptación — WISE Membership Number Format (YYYYCCSSSS)

> **Propósito:** Validar que el formato de número de membresía WISE cumple con la especificación
> `YYYYCCSSSS` (10 dígitos): Year + Continent Code + Sequential.
>
> **Fecha:** 2026-06-05
> **Branch:** `solution/sdk-upgrade` (merge de `solution/membership-number-format`)
> **Formato:** `YYYYCCSSSS` (10 dígitos)
> **Ejemplo:** `2026030100` = Año 2026, FLB continent (03), primer miembro (0100)
> **Inicio secuencial:** 0100 (counter empieza en 99, primer increment → 100)

---

## 1. Formato del Membership Number

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-MN-01 | El membership number tiene exactamente 10 dígitos | Regex: `/^\d{10}$/` en el campo del CRM | 🔲 |
| AC-MN-02 | Los primeros 4 dígitos corresponden al año actual (YYYY) | `membershipNumber.slice(0,4) === currentYear` | 🔲 |
| AC-MN-03 | Los dígitos 5-6 son un código de continente válido (01-09) | `parseInt(mn.slice(4,6)) >= 1 && <= 9` | 🔲 |
| AC-MN-04 | Los últimos 4 dígitos son el secuencial (≥ 0100) | `parseInt(mn.slice(6)) >= 100` | 🔲 |
| AC-MN-05 | El número se incrementa secuencialmente (no repite, no salta más de 1) | Dos enrollments consecutivos → diff = 1 | 🔲 |

---

## 2. Continent Code Resolution

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-MN-06 | USA (Eastern states) → continent code `01` (EUS) | Enrollment con countryISO3=USA, state=FL/NY/etc → CC=01 o 03 | 🔲 |
| AC-MN-07 | USA (Western states) → continent code `02` (WUS) | Enrollment con countryISO3=USA, state=CA/WA/etc → CC=02 | 🔲 |
| AC-MN-08 | USA (Florida) → continent code `03` (FLB — Flag Land Base) | Enrollment con state=FL → CC=03 | 🔲 |
| AC-MN-09 | Canada → continent code `04` (CAN) | Enrollment con countryISO3=CAN → CC=04 | 🔲 |
| AC-MN-10 | United Kingdom → continent code `05` (UK) | Enrollment con countryISO3=GBR → CC=05 | 🔲 |
| AC-MN-11 | Africa countries → continent code `06` (AF) | Enrollment con countryISO3 africano → CC=06 | 🔲 |
| AC-MN-12 | Australia/NZ/Asia → continent code `07` (ANZO) | Enrollment con countryISO3=AUS/NZL/JPN → CC=07 | 🔲 |
| AC-MN-13 | Europe countries → continent code `08` (EU) | Enrollment con countryISO3 europeo → CC=08 | 🔲 |
| AC-MN-14 | Latin America → continent code `09` (LATAM) | Enrollment con countryISO3=COL/BRA/MEX → CC=09 | 🔲 |
| AC-MN-15 | Primary source: Zoho CRM Account `Continent` picklist field | Verificar que ProcessPayment consulta el CRM primero | 🔲 |
| AC-MN-16 | Fallback: country-to-continent internal mapping cuando CRM no tiene Continent | Verificar fallback funciona | 🔲 |

---

## 3. DynamoDB Atomic Counter

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-MN-17 | Counter PK format: `COUNTER#MEMBERSHIP#YYYY#CC` | DynamoDB scan/query para verificar key format | 🔲 |
| AC-MN-18 | Counter inicial empieza en 99 (primer ADD +1 → 100 → "0100") | Verificar primer enrollment de un continent-year | 🔲 |
| AC-MN-19 | Counter es atómico (concurrent requests no generan duplicados) | Verificar via DynamoDB UPDATE ADD operation | 🔲 |
| AC-MN-20 | Counters separados por continent-year (2026-03 ≠ 2026-01) | Dos enrollments con diff continent → secuenciales independientes | 🔲 |

---

## 4. Integración — ProcessPayment

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-MN-21 | ProcessPayment genera membership number tras pago exitoso | Verificar que después de Stripe checkout → session tiene membershipNumber | 🔲 |
| AC-MN-22 | Membership number se guarda en DynamoDB session record | `GET /session/{id}` → `membershipNumber` presente | 🔲 |
| AC-MN-23 | Membership number se sincroniza al CRM (Contact.Membership_Number) | Zoho API: `GET /Contacts/{id}` → campo Membership_Number | 🔲 |
| AC-MN-24 | Si el enrollment ya tiene membership number, no genera otro (idempotente) | Re-run ProcessPayment → mismo número, no duplicado | 🔲 |

---

## 5. Validación CRM (audit-crm)

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-MN-25 | Campo `Membership_Number` en Zoho Contact tiene formato YYYYCCSSSS | audit-crm: regex validate en Contact fields | 🔲 |
| AC-MN-26 | El año del membership number corresponde al año del enrollment | audit-crm: compare year vs session.createdAt | 🔲 |
| AC-MN-27 | El continent code corresponde al país del lead (via mapping) | audit-crm: validate CC vs lead.countryISO3 | 🔲 |

---

## 6. Exportación en Session Snapshot

| ID | Criterio | Método de validación | Estado |
|----|----------|---------------------|--------|
| AC-MN-28 | `membershipNumber` se incluye en el session-snapshot.json exportado | Verificar campo presente en snapshot después de payment | 🔲 |
| AC-MN-29 | El valor exportado tiene exactamente 10 dígitos numéricos | Regex `/^\d{10}$/` en el campo del snapshot | 🔲 |
| AC-MN-30 | El membership number exportado coincide con el del CRM (Contact.Membership_Number) | audit-crm: snapshot.membershipNumber === Contact.Membership_Number | 🔲 |

---

## 7. Deprecated (removed)

| Variable | Antes | Ahora |
|----------|-------|-------|
| `MEMBERSHIP_NUMBER_START_VALUE` | Env var para inicio del counter | ❌ Deprecated — inicio fijo en 99 por continent-year |
| `MEMBERSHIP_NUMBER_LENGTH` | Env var para longitud del número | ❌ Deprecated — fijo 10 dígitos (YYYYCCSSSS) |

---

## Resumen

| Categoría | Total | ✅ Pass | 🔲 Pendiente |
|-----------|-------|---------|--------------|
| Formato | 5 | 0 | 5 |
| Continent Resolution | 11 | 0 | 11 |
| DynamoDB Counter | 4 | 0 | 4 |
| ProcessPayment Integration | 4 | 0 | 4 |
| CRM Validation | 3 | 0 | 3 |
| Exportación Snapshot | 3 | 0 | 3 |
| **TOTAL** | **30** | **0** | **30** |

---

## Cómo validar

```bash
# 1. Correr full enrollment (genera membership number en ProcessPayment)
CDP_ENDPOINT=http://localhost:9223 npx playwright test full-enrollment-multi-admin --reporter=list

# 2. Verificar en DynamoDB que el session tiene membershipNumber
aws dynamodb get-item --table-name "HCAMSWS--AppEnroll-DevQA-TableEnrollmentSessionsTable-*" \
  --key '{"PK":{"S":"SESSION#<sessionId>"}}'

# 3. Verificar en CRM que Contact tiene el número
npx playwright test audit-crm --reporter=list

# 4. Verificar formato del número (via CRM audit o manualmente)
# Ejemplo esperado para USA Florida: 2026030100 (año 2026, FLB, primer miembro)
```

## Continent Codes Reference

| Code | Name | Regions |
|------|------|---------|
| 01 | EUS | Eastern United States (NY, MA, PA, VA, etc.) |
| 02 | WUS | Western United States (CA, WA, OR, NV, etc.) |
| 03 | FLB | Flag Land Base (Florida) |
| 04 | CAN | Canada |
| 05 | UK | United Kingdom |
| 06 | AF | Africa |
| 07 | ANZO | Australia, New Zealand, Oceania + Asia |
| 08 | EU | Europe |
| 09 | LATAM | Latin America |

---

## Notas

- **Fecha de implementación:** 2026-06-05
- **Autor commit:** `d55d5b6` — `feat(app.enrollment): WISE Membership Number format YYYYCCSSSS`
- **La validación E2E requiere** que el flujo completo se ejecute hasta el paso de payment (Stripe checkout) para que ProcessPayment genere el número.
- **Florida es un caso especial** — tiene su propio continent code (03 FLB) separado de Eastern US (01 EUS).
- **Los counters son per continent-year** — si es enero 2027, los counters se reinician para todos los continentes.
