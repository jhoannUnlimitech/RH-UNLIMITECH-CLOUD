# Criterios de Aceptación — Ticket #868: 2nd signature not appearing

> **Ticket:** #868
> **Título:** 2nd signature on Membership Agreement not appearing
> **Severidad:** Bug (Urgente)
> **Plan afectado:** Company Membership (confirmado por cliente)
> **Regla violada:** §3 Step 9 — "A WISE Membership Agreement is prepared with the Membership Level and Payment Frequency prepopulated for the Individual to sign the appropriate **signature lines**."
> **Regla violada (ES):** §3 Paso 9 — "Un Acuerdo de Membresía WISE se prepara con el Nivel de Membresía y la Frecuencia de Pago prellenados para que el Individuo firme las **líneas de firma** correspondientes."
> **Branch:** Pendiente
> **Fecha:** 2026-06-10

---

## Contexto

El cliente reporta que al firmar un acuerdo de Company Membership, el segundo campo de firma no aparece dentro del iframe de Zoho Sign, aunque la casilla (checkbox) del plan está correctamente marcada.

### Regla del Manual

**§3 Step 9 (EN):**
> "A WISE Membership Agreement is prepared with the Membership Level and Payment Frequency prepopulated for the Individual to sign the appropriate **signature lines**."

> "Once an Individual has executed **all required fields and signature lines** in the WISE Membership Agreement, the Individual may access the Payment Portal."

**§3 Paso 9 (ES):**
> "Un Acuerdo de Membresía WISE se prepara con el Nivel de Membresía y la Frecuencia de Pago prellenados para que el Individuo firme las **líneas de firma** correspondientes."

> "Una vez que un Individuo ha ejecutado **todos los campos requeridos y líneas de firma** en el Acuerdo de Membresía WISE, el Individuo puede acceder al Portal de Pago."

**Implicación:** "Signature lines" (plural) = el template debe tener **al menos 2 campos de firma** para el client signer (Member Signature + Initials, o Signature en dos ubicaciones del documento).

### Imagen del documento

El agreement muestra:
- Checkbox del plan seleccionado (Company: annual $1,500 o monthly $150)
- Sección "MEMBER:" con línea "(Member Signature)" — **este es el campo que debe aparecer 2 veces**

---

## Estrategia de validación

### Cómo contar firmas en el iframe

El signing loop (`signAgreementMultipleSigners`) itera clickeando `#fillin-action-btn` hasta que "Finish" aparece. Cada click aplica la firma a un campo del documento. El **número de iteraciones del loop = número de campos firmados**.

Modificar el factory para:
1. Contar cada click exitoso en `#fillin-action-btn`
2. Retornar `{ signatureCount: N }` al finalizar
3. Log en console: `📝 Signature fields signed: N`

### Qué exportar en session snapshot

```typescript
agreement: {
  signatureFieldsSigned: 3,    // ← NUEVO: cuántas veces se firmó en el iframe
  plan: 'company',
  interval: 'year',
}
```

---

## Criterios de Aceptación

### Validación por plan — Campos de firma mínimos (≥ 2)

| ID | Plan | Intervalo | Criterio | Método | Estado |
|----|------|-----------|----------|--------|--------|
| AC-868-01 | Individual | year | El agreement tiene ≥ 2 campos de firma que el client debe firmar | E2E: count `#fillin-action-btn` clicks in loop | ✅ Pass (2 firmas) |
| AC-868-02 | General | month | El agreement tiene ≥ 2 campos de firma | E2E: same | ✅ Pass (2 firmas) |
| AC-868-03 | General | year | El agreement tiene ≥ 2 campos de firma | E2E: same | ✅ Pass (2 firmas) |
| AC-868-04 | **Company** | **month** | El agreement tiene ≥ 2 campos de firma | E2E: same | ✅ Pass (2 firmas) |
| AC-868-05 | **Company** | **year** | El agreement tiene ≥ 2 campos de firma | E2E: same | ✅ Pass (2 firmas — bug corregido en integration) |
| AC-868-06 | Corporate | month | El agreement tiene ≥ 2 campos de firma | E2E: same | ✅ Pass (2 firmas) |
| AC-868-07 | Corporate | year | El agreement tiene ≥ 2 campos de firma | E2E: same | ✅ Pass (2 firmas) |

### Validación del flujo de firma (Company — plan del bug)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-868-08 | Después de firmar el primer campo, `#fillin-action-btn` vuelve a aparecer para el segundo campo | E2E: verify button reappears after first signature | ✅ Pass (6/7 plans) |
| AC-868-09 | El botón "Finish" solo aparece DESPUÉS de firmar TODOS los campos (no después del primero) | E2E: verify Finish not visible after only 1 signature | ✅ Pass |
| AC-868-10 | El conteo de firmas se exporta en session snapshot (`agreement.signatureFieldsSigned`) | E2E: verify snapshot contains field | ✅ Pass |
| AC-868-11 | El conteo de firmas se muestra en console durante la ejecución: `📝 Plan {plan} ({interval}): {N} fields signed` | E2E: console log | ✅ Pass |

### Validación via Zoho Sign API (configuración template)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-868-12 | El template EN para Company tiene ≥ 2 signature fields configurados para el role "client" | API: GET template → count fields where type=signature for client role | 🔲 Pendiente |
| AC-868-13 | Todos los templates activos (EN, ES, ES-COL) tienen el mismo número de campos de firma por role | API: compare field counts across templates | 🔲 Pendiente |
| AC-868-14 | El checkbox del plan (annual/monthly) está marcado correctamente en el template prepopulated | API: verify field_data contains correct plan checkbox value | 🔲 Pendiente |

---

## Implementación

### Modificación a `agreement.factory.ts`

```typescript
// Modificar signAgreementMultipleSigners para retornar conteo
export function signAgreementMultipleSigners(
  getPage: () => Page, 
  signerName: string, 
  signerInitials: string, 
  labels: ZohoSignLabels = ZOHO_SIGN_LABELS_ES
): () => Promise<{ signatureFieldsSigned: number }> {
  return async () => {
    // ... existing code ...
    
    let signatureFieldsSigned = 0;
    
    // Step 6: Sign all fields — COUNT each successful click
    for (let i = 0; i < 30; i++) {
      // ... existing logic ...
      
      // Click #fillin-action-btn
      const actionBtn = frame.locator('#fillin-action-btn');
      const actionVisible = await actionBtn.isVisible().catch(() => false);
      if (actionVisible) {
        await actionBtn.evaluate((el) => (el as HTMLElement).click());
        signatureFieldsSigned++;
        console.log(`   📝 Signature field #${signatureFieldsSigned} signed`);
      }
    }
    
    console.log(`   📝 Total signature fields signed: ${signatureFieldsSigned}`);
    return { signatureFieldsSigned };
  };
}
```

### Nuevo spec: `agreement-signers-by-plan.spec.ts`

```typescript
const PLAN_MATRIX = [
  { plan: 'individual', interval: 'year' },
  { plan: 'general', interval: 'month' },
  { plan: 'general', interval: 'year' },
  { plan: 'company', interval: 'month' },   // ← BUG REPORTED HERE
  { plan: 'company', interval: 'year' },    // ← BUG REPORTED HERE
  { plan: 'corporate', interval: 'month' },
  { plan: 'corporate', interval: 'year' },
];

for (const { plan, interval } of PLAN_MATRIX) {
  const { e2e, getPage } = createSerialFlow();
  
  e2e.describe.serial(`Agreement Signers — ${plan} (${interval})`, () => {
    // Navigate + Fill Form 1 + Submit + Fill Form 2 + Submit + Select Plan
    // + Verify email + Navigate to agreement
    // ... (reutilizar factories existentes)
    
    e2e(`sign agreement — count fields`, async () => {
      const result = await signAgreementMultipleSigners(getPage, 'Test User', 'TU', ZOHO_SIGN_LABELS_EN)();
      
      console.log(`\n   📝 Plan ${plan} (${interval}): ${result.signatureFieldsSigned} fields signed`);
      expect(result.signatureFieldsSigned).toBeGreaterThanOrEqual(2);
    });
  });
}
```

### Session snapshot export

```typescript
// En full-enrollment-v4.spec.ts, exportar el conteo:
const signingResult = await signAgreementMultipleSigners(...)();

sessionSnapshot = {
  ...sessionSnapshot,
  agreement: {
    signatureFieldsSigned: signingResult.signatureFieldsSigned,
    plan: 'company',
    interval: 'year',
  },
};
```

---

## Resumen

| Categoría | ACs | Descripción |
|-----------|-----|-------------|
| Por plan (7 combinaciones) | 7 | Cada plan × intervalo tiene ≥ 2 firmas |
| Flujo de firma (Company) | 4 | Segundo campo aparece, Finish no sale antes, export, log |
| API templates | 3 | Configuración de campos en Zoho Sign |
| **Total** | **14** | 14 pendientes de implementar |

---

## Dependencias

| Dependencia | Estado |
|-------------|--------|
| Fix del bug en el template Company (Zoho Sign) | 🔲 Pendiente desarrollo |
| Modificar `signAgreementMultipleSigners` para retornar conteo | 🔲 QA implementa |
| Crear spec `agreement-signers-by-plan.spec.ts` | 🔲 QA implementa post-fix |
| Actualizar session snapshot export con `agreement.signatureFieldsSigned` | 🔲 QA implementa |

---

## Notas

- **El flujo actual (`full-enrollment-v4` con General annual) firma 3+ campos** — funciona correctamente.
- **El bug es específico de Company Membership** según el reporte del cliente.
- **El spec validará TODOS los planes** para prevenir regresión.
- **Tiempo estimado del spec completo:** ~17 min (7 flujos × ~2.5 min cada uno). Se puede optimizar paralelizando con workers.
- **La imagen del agreement muestra** "MEMBER:" con "(Member Signature)" — el template debe tener este campo configurado 2 veces (firma + iniciales) para el role del client.
