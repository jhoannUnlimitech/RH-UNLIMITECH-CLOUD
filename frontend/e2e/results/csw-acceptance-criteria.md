# Acceptance Criteria — CSW (Solicitudes) E2E Tests

## A. Crear Solicitud

- [x] AC-CSW-01: Navegar a `/csw/my-requests` muestra la página
- [x] AC-CSW-02: Botón "Crear Solicitud" navega a `/csw/new`
- [x] AC-CSW-03: Formulario carga categorías en el select
- [x] AC-CSW-04: Puede llenar situación, información y solución
- [x] AC-CSW-05: Puede enviar solicitud → redirige a my-requests

## B. Validaciones del Formulario

- [x] AC-CSW-06: No permite enviar sin categoría (muestra error)
- [x] AC-CSW-07: No permite enviar con "Situación" vacía
- [x] AC-CSW-08: No permite enviar con "Información" vacía
- [x] AC-CSW-09: No permite enviar con "Solución" vacía
- [x] AC-CSW-10: Contador de palabras se actualiza en tiempo real
- [x] AC-CSW-11: Botón "Cancelar" regresa sin guardar

## C. Flujo de Aprobación — 3 Niveles (Moises → Manuel → Laura)

- [x] AC-CSW-12: Developer crea y envía "Permiso" → status "Pendiente"
- [x] AC-CSW-13: Moises ve la solicitud en `/csw/pending`
- [x] AC-CSW-14: Moises aprueba nivel 1 con comentario
- [x] AC-CSW-15: Manuel ve la solicitud pendiente
- [x] AC-CSW-16: Manuel RECHAZA nivel 2 con comentario obligatorio
- [x] AC-CSW-17: Developer ve banner de rechazo (razón + quién)
- [x] AC-CSW-18: Developer edita la solicitud rechazada
- [x] AC-CSW-19: Al reenviar, cadena se reinicia a nivel 1
- [x] AC-CSW-20: Moises aprueba nivel 1 (segunda ronda)
- [x] AC-CSW-21: Manuel aprueba nivel 2 (segunda ronda)
- [x] AC-CSW-22: Laura aprueba nivel 3 → status "Aprobada"

## D. Flujo Especial — "Orden de Estudio" (1 nivel: Oscar)

- [x] AC-CSW-23: Developer crea "Orden de Estudio" → status "Pendiente"
- [x] AC-CSW-24: Oscar ve la solicitud en su lista de pendientes
- [x] AC-CSW-25: Oscar aprueba → status "Aprobada"

## E. Crear Categoría (Default Flow)

- [x] AC-CSW-26: Moises accede a `/csw-categories`
- [x] AC-CSW-27: Click "Crear Categoría" abre modal
- [x] AC-CSW-28: Llena nombre y descripción
- [x] AC-CSW-29: Checkbox "Usar flujo de división" está marcado por defecto
- [x] AC-CSW-30: Submit cierra modal y crea categoría
- [x] AC-CSW-31: Categoría aparece al buscar en la lista

## F. Crear Categoría (Aprobador Directo)

- [x] AC-CSW-32: Desmarca "Usar flujo de división"
- [x] AC-CSW-33: Selecciona Oscar como aprobador directo
- [x] AC-CSW-34: Submit crea categoría con directApproverId
- [x] AC-CSW-35: Categoría aparece al buscar en la lista

## G. Editar Categoría

- [x] AC-CSW-36: Busca categoría de test y click editar
- [x] AC-CSW-37: Modal abre con datos pre-cargados
- [x] AC-CSW-38: Modifica descripción y guarda
- [x] AC-CSW-39: Descripción actualizada visible en la lista

## H. Eliminar Categoría

- [x] AC-CSW-40: Busca categoría y click eliminar
- [x] AC-CSW-41: Confirma eliminación (dialog/confirm)
- [x] AC-CSW-42: No muestra error después de eliminar

---

## Status

| Sección | ACs | Tests | Result |
|---------|-----|-------|--------|
| A. Crear Solicitud | 5 | `csw-create.spec.ts` | ✅ Pass |
| B. Validaciones | 6 | `csw-form-validation.spec.ts` | ✅ Pass |
| C. Aprobación 3 niveles | 11 | `csw-approval-flow.spec.ts` (30 tests) | ✅ Pass |
| D. Orden de Estudio | 3 | `csw-orden-estudio.spec.ts` (11 tests) | ✅ Pass |
| E. Categoría Default Flow | 6 | `csw-create-category.spec.ts` | ✅ Pass |
| F. Categoría Direct Approver | 4 | `csw-create-category.spec.ts` | ✅ Pass |
| G. Editar Categoría | 4 | `csw-create-category.spec.ts` | ✅ Pass |
| H. Eliminar Categoría | 3 | `csw-create-category.spec.ts` | ✅ Pass |
| **Total** | **42** | **97 tests** | **✅ All Pass** |

---

## Bugs Encontrados y Corregidos

| # | Bug | Fix |
|---|-----|-----|
| 1 | `initializeApprovalChain` ignoraba `useDefaultFlow: false` y `directApproverId` | Added category check before division flow in `CSW.ts` |
| 2 | Oscar no tenía permiso `csw:approve` | Added permission to QUALITY & TRAINING OFFICER role |
| 3 | Zod validator rechazaba `directApproverId: ""` con 500 | Added `z.preprocess` to transform empty string to undefined |
| 4 | No se mostraban toasts al crear/editar/eliminar categorías | Added `notify.success/error` to `CSWCategoryStore.live.ts` |
