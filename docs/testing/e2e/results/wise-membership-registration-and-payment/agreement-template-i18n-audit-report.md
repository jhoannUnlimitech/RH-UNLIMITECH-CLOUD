# Reporte QA — Agreement Template i18n Audit

**Branch:** `bugfix/agreement-template-i18n`  
**Spec:** `e2e/specs/validation/agreement-template-i18n-audit.spec.ts`  
**Fecha:** 12 May 2026  
**Última actualización:** 03 Jun 2026 (re-validación EN con nuevo flujo Check→Add signature)  
**Ejecutado con:** CDP (`http://localhost:9223`), Stage DevQA  
**Duración parcial:** ~15 min (timeout en escenario 7/12)

---

## Resumen Ejecutivo

| Categoría | Resultado |
|-----------|-----------|
| Templates con campos de firma configurados | ✅ 2/20 (en, es-COL) |
| Templates sin campos de firma | ❌ 18/20 |
| Fallback a inglés (idioma sin template) | ⚠️ No verificable — depende del Defecto 2 |
| Manejo de error cuando template falla | ❌ Bug — página queda en loading infinito |
| Template EN — flujo firma completo (nuevo i18n) | ✅ PASS — 32/32 tests (5.6m) — 03 Jun 2026 |

---

## Resultados por Escenario

| # | Idioma | País | Template esperado | Fallback | Resultado | Causa |
|---|--------|------|-------------------|----------|-----------|-------|
| 1 | en | USA | `en` | directo | ✅ PASS (re-validado 03 Jun) | Template funcional — nuevo flujo Check→Add signature |
| 2 | es | COL | `es-COL` | exact match | ✅ PASS | Template funcional |
| 3 | es | ESP | `es` | idioma | ❌ FAIL (setup) | ESP no tiene states válidos en el form — error en test data |
| 4 | fr | CAN | `fr` | idioma | ❌ FAIL | Template sin campos de firma (Zoho 9101) |
| 5 | de | DEU | `de` | idioma | ❌ FAIL | Template sin campos de firma (Zoho 9101) |
| 6 | it | ITA | `it` | idioma | ❌ FAIL | Template sin campos de firma (Zoho 9101) |
| 7 | pt | BRA | `pt` | idioma | ❌ FAIL (inferido) | Template sin campos de firma |
| 8 | ja | JPN | `ja` | idioma | ❌ FAIL (inferido) | Template sin campos de firma |
| 9 | ru | RUS | `ru` | idioma | ❌ FAIL (inferido) | Template sin campos de firma |
| 10 | nl | NLD | `nl` | idioma | ❌ FAIL (inferido) | Template sin campos de firma |
| 11 | sv | SWE | `sv` | idioma | ❌ FAIL (inferido) | Template sin campos de firma |
| 12 | ko | KOR | `en` | inglés | ✅ PASS (inferido) | Fallback a `en` que sí funciona |

> Los escenarios "inferidos" se basan en la consulta directa a la API de Zoho Sign que confirmó 0 campos de firma en todos los templates excepto `en` y `es-COL`.
> 
> **Nota 03 Jun 2026:** El escenario #1 (EN) fue re-validado con `full-enrollment-v4.spec.ts` (32/32 tests, 5.6m) después de corregir el factory `signAgreementMultipleSigners` para soportar el nuevo flujo de firma del template i18n EN: ciclo `Check → Add signature → Check → Add signature → ... → Finish`. Client signing (48.6s) + Admin signing (48.2s) ambos pasan correctamente.

---

## Estado de Templates en Zoho Sign (verificado via API)

Consulta directa a `GET /api/v1/templates/:id` para los 20 templates importados:

| Locale | Template ID | Actions (recipients) | Campos de firma | Estado |
|--------|-------------|---------------------|-----------------|--------|
| en | 424867000000122028 | 2 (Client + Admin) | ✅ Configurados | Funcional |
| es-COL | 424867000000121420 | 2 (Client + Admin) | ✅ Configurados | Funcional |
| es-COL | 424867000000122090 | 2 (Client + Admin) | ❌ Sin campos | Duplicado — no funcional |
| es | 424867000000122041 | 2 (Client + Admin) | ❌ Sin campos | **Falta configurar** |
| fr | 424867000000120644 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| de | 424867000000116989 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| it | 424867000000120631 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| pt | 424867000000124002 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| ja | 424867000000116976 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| ru | 424867000000122054 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| nl | 424867000000123194 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| sv | 424867000000123168 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| zh | 424867000000121394 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| he | 424867000000120605 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| hu | 424867000000123181 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| cs | 424867000000120657 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| da | 424867000000121381 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| el | 424867000000120670 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| no | 424867000000120618 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |
| sk | 424867000000121407 | 2 (Client + Admin) | ❌ Sin campos | Falta configurar |

---

## Defectos Identificados

### Defecto 1: 18 de 20 templates sin campos de firma (Configuración Zoho Sign)

**Severidad:** Bloqueante para la feature  
**Tipo:** Configuración de terceros  
**Impacto:** Ningún idioma excepto `en` y `es-COL` puede completar el flujo de agreement

**Descripción:** Los templates fueron importados correctamente (documento + recipients Client/Admin), pero no se posicionaron los campos de firma (Signature, Initial) en el documento PDF. Zoho Sign requiere al menos 1 campo de firma por signer para crear un documento.

**Nota importante:** El template `es` (español genérico) tampoco tiene campos configurados. Esto significa que el escenario "Español + España → fallback a es" también fallaría si el form aceptara ESP como país.

**Acción requerida:**
1. Abrir cada template en la UI de Zoho Sign → Templates
2. Posicionar campos de firma (Signature + Initial) para Client y Admin
3. Usar `en` o `es-COL` como referencia visual
4. Prioridad sugerida: `es` (español genérico) primero, luego `fr`, `de`, `pt`, `it`

---

### Defecto 2: Página queda en loading infinito cuando template falla (Código)

**Severidad:** Alta  
**Tipo:** Bug de código — manejo de errores  
**Archivo:** `infra/functions/zoho/ProcessAgreement.ts`

**Descripción:** Cuando Zoho Sign rechaza la creación del documento (error 9101 u otro), la Lambda hace `return` sin actualizar el estado de la sesión. El frontend pollea indefinidamente sin recibir feedback.

**Comportamiento actual:**
1. Lambda recibe error 9101 de Zoho Sign
2. Lambda hace `console.error(...)` + `return` (sin persistir error)
3. Session queda sin `agreement.requestId`
4. Frontend pollea `GET /agreement/:sessionId` → recibe `{ ready: false, status: 'pending' }`
5. Frontend muestra "Preparing your agreement for signing..." por 60 polls × 3s = 180s
6. Después de 180s, frontend muestra `data-test-state="error"` con timeout genérico

**Comportamiento esperado:**
- La Lambda debería persistir el error en la sesión (ej: `agreement.status = 'error'`)
- El endpoint `GET /agreement/:sessionId` debería detectar ese estado y devolver `{ ready: false, status: 'error' }`
- El frontend debería mostrar `data-test-state="error"` inmediatamente (no después de 3 min de polling)

**Evidencia en logs:**
```
[ProcessAgreement] Failed to create document: {
  response: '{"code":9101,"message":"Add atleast one field for a signer.","status":"failure"}'
}
```

---

### Defecto 3 (menor): Template `es` no tiene campos de firma

**Severidad:** Media  
**Tipo:** Configuración  
**Impacto:** El escenario "Español + cualquier país que no sea Colombia" fallaría

Según la documentación de la feature: "Actualmente es-COL, es y en ya los tienen." — pero la verificación via API muestra que `es` (ID: 424867000000122041) tiene 0 campos de firma. Posible discrepancia entre la documentación y el estado real.

---

## Bases del Reporte

| Fuente | Referencia |
|--------|-----------|
| Feature spec | Proporcionada por el usuario — escenarios de prueba y cadena de fallback |
| `results.json` | `scripts/zoho-sign-import/results.json` — 18 templates importados + 2 es-COL |
| API Zoho Sign | Consulta directa `GET /api/v1/templates/:id` — 0 `document_fields` en 18/20 |
| Logs Lambda | Console `sst:@` — error 9101 confirmado para `fr` |
| `ProcessAgreement.ts` | `return` silencioso en línea ~200 sin persistir error |
| `AgreementPage.tsx` | Frontend tiene render para `error` state pero depende de timeout (180s) |
| Steering `webforgeai.md` R6 | Guards deben documentar *por qué* salen — el `return` viola esta convención |
| README `zoho-sign-import` | "Después debes configurar los campos de firma en la UI de Zoho Sign" |

---

## Próximos Pasos

1. **Desarrollador:** Configurar campos de firma en los templates de Zoho Sign (prioridad: `es`, `fr`, `de`)
2. **Desarrollador:** Implementar manejo de error en `ProcessAgreement.ts` para persistir el fallo
3. **QA:** Re-ejecutar `agreement-template-i18n-audit.spec.ts` después de las correcciones
4. **QA:** Corregir test data para `es-ESP` (el país España necesita un state válido en el form)
