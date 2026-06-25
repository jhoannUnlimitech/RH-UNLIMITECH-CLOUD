# Análisis — Bugfix CSW Flow

## Cambios a Implementar

---

### 1. Formato del título CSW

**Actual:** `CSW-{objectId}`

**Nuevo:** `CSW-{nombre_categoria_snake_case}-{fecha}-{5 primeros dígitos del ObjectId}`

**Ejemplos:**
- `CSW-PERMISO-20260624-6a3c5`
- `CSW-VACACIONES-20260624-6a3c5`
- `CSW-AUMENTO_SALARIAL-20260624-6a3c5`
- `CSW-ORDEN_DE_ESTUDIO-20260701-6b4d2`
- `CSW-PERMISO_PERSONAL-20260624-6a3c5`

**Implementación:**

- **Sin campo nuevo en BD** — Se genera en el frontend a partir de `category.name`
- **Función helper:**
  ```typescript
  const toUpperSnakeCase = (str: string) => 
    str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
       .replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  
  const formatCSWTitle = (csw: CSW) => {
    const catName = toUpperSnakeCase(csw.category?.name || 'OTRO');
    const date = new Date(csw.createdAt).toISOString().split('T')[0].replace(/-/g, '');
    const idShort = csw._id.substring(0, 5);
    return `CSW-${catName}-${date}-${idShort}`;
  };
  ```

**Archivos a modificar:**
- `frontend/src/pages/CSW/CSWList.tsx` — usar `formatCSWTitle()` en vez de `CSW-{id}`
- `frontend/src/pages/CSW/CSWView.tsx` — titulo formateado en header
- `frontend/src/utils/csw.ts` — (crear) helper `formatCSWTitle` y `toSnakeCase`

**Impacto:** Bajo — solo cambio de display, sin tocar BD ni backend.

---

### 2. Historial de cambios de estado automático

**Problema:** Cuando un CSW rechazado se edita, cambia a `pending` pero no queda en el historial.

**Solución:** En el backend, al actualizar un CSW que está en estado `rejected`:
```typescript
// En csw.controller.ts → updateCSW
if (csw.status === 'rejected' && dataChanged) {
  csw.status = 'pending';
  csw.history.push({
    action: 'status_changed',
    performedBy: 'system',
    performedByName: 'Sistema',
    performedAt: new Date(),
    previousStatus: 'rejected',
    newStatus: 'pending',
    comments: 'Estado cambiado automáticamente al editar la solicitud'
  });
}
```

**Archivos a modificar:**
- `backend/src/controllers/csw.controller.ts` — lógica en updateCSW
- `backend/src/models/CSWHistory.ts` — verificar que soporte action 'status_changed'

---

### 3. Mostrar mensaje de rechazo al editar

**Problema:** Al editar un CSW rechazado, el usuario no ve por qué fue rechazado.

**Solución:** En el formulario de edición, si el CSW viene de estado `rejected`:
- Mostrar un Alert/banner arriba del form con:
  - Quién rechazó
  - Fecha del rechazo
  - Comentario del rechazo (motivo)

**Componente TailAdmin:** Usar `Alert` con variante `warning` o un card destacado.

```tsx
{csw.status === 'rejected' && lastRejection && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 dark:border-red-800 dark:bg-red-900/10">
    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Motivo del rechazo</h4>
    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{lastRejection.comments}</p>
    <p className="text-xs text-red-500 mt-2">
      Rechazado por {lastRejection.approverName} — {formatDate(lastRejection.date)}
    </p>
  </div>
)}
```

**Archivos a modificar:**
- `frontend/src/pages/CSW/CSWForm.tsx` — agregar banner de rechazo

---

### 4. Estado Draft + Autoguardado

**Nuevo estado:** `draft`

**Flujo:**
```
draft → pending → (approved / rejected)
                      ↓
                   pending (si se edita tras rechazo)
```

**Modelo CSW:** Agregar `'draft'` al enum de status.

**Lógica:**
- Al crear un CSW, estado inicial = `draft`
- Autoguardado cada X minutos (configurable en AppSettings)
- Botón "Enviar Solicitud" cambia de `draft` → `pending` y activa el flujo
- El draft NO se ve por los aprobadores — solo el creador
- El draft SÍ se puede eliminar

**AppSettings:**
```typescript
{ key: 'csw_autosave_interval', value: 5 } // minutos
```

**Frontend:**
- Timer con `setInterval` que hace PUT cada N minutos si hay cambios
- Indicador "Guardado automáticamente a las HH:MM"
- Botón "Guardar borrador" + Botón "Enviar solicitud"
- En la lista de CSW, los drafts se marcan con badge "Borrador"

**Archivos a modificar:**
- `backend/src/models/CSW.ts` — agregar 'draft' a status enum
- `backend/src/controllers/csw.controller.ts` — crear con status draft, endpoint para enviar
- `backend/src/models/AppSettings.ts` — (crear si no existe) para configuración
- `frontend/src/pages/CSW/CSWForm.tsx` — autoguardado + botón enviar
- `frontend/src/pages/CSW/CSWList.tsx` — badge "Borrador", ocultar drafts de otros

**Nuevo endpoint:**
```
POST /api/v1/csw/:id/submit  — Cambia draft → pending, activa flujo
```

---

### 4b. Flujo de aprobación condicional

**Lógica existente:** Cada categoría puede tener `useDefaultFlow` (flujo de la división) o `directApproverId` (aprobación única).

**Nuevo tipo: "Orden de Estudio"**
- Categoría nueva con `abbreviation: 'EST'`
- `useDefaultFlow: false`
- `directApproverId: Oscar Hernandez` (single approval)

**Lo que se valida al crear CSW:**
```
if (category.useDefaultFlow) {
  → Cargar ApprovalFlow de la división del empleado
  → Generar approvalChain con N niveles
} else {
  → approvalChain = [{ approverId: category.directApproverId, level: 1 }]
  → Single approval
}
```

---

### 5. Toggle de estado en header del CSW

**Al ver/editar un CSW:** Mostrar un badge/toggle en la parte superior que indique el estado actual.

**Componente:**
```tsx
<div className="flex items-center gap-3">
  <h2>CSW-PER-20260624-6a3c5</h2>
  <Badge color={statusColor}>{statusLabel}</Badge>
</div>
```

**Estados y colores:**
| Estado | Color | Label |
|--------|-------|-------|
| draft | light/gray | Borrador |
| pending | warning | Pendiente |
| approved | success | Aprobado |
| rejected | error | Rechazado |
| cancelled | light | Cancelado |

**Archivos a modificar:**
- `frontend/src/pages/CSW/CSWForm.tsx` — badge en header
- `frontend/src/pages/CSW/CSWView.tsx` — badge en header

---

## Resumen de Archivos a Modificar

### Backend
| Archivo | Cambio |
|---------|--------|
| `models/CSW.ts` | + 'draft' status, history entry para status_changed |
| `controllers/csw.controller.ts` | draft logic, submit endpoint, auto-history |
| `routes/csw.routes.ts` | POST /:id/submit |
| `models/AppSettings.ts` | (crear) configuración global |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `pages/CSW/CSWList.tsx` | formato título snake_case, badge borrador, ocultar drafts ajenos |
| `pages/CSW/CSWForm.tsx` | draft/submit, autoguardado, banner rechazo, badge estado |
| `pages/CSW/CSWView.tsx` | badge estado en header, título formateado |
| `utils/csw.ts` | (crear) helpers formatCSWTitle, toSnakeCase |

### Migraciones
- No se requieren migraciones — MongoDB flexible, el campo `draft` se acepta automáticamente.

---

## Orden de Implementación

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Formato título CSW en lista y vista | ✅ Implementado |
| 2 | Estado draft en modelo + controller | ✅ Implementado |
| 3 | Endpoint POST /:id/submit | ✅ Implementado |
| 4 | Frontend: draft/submit buttons + autoguardado | ✅ Implementado |
| 5 | Historial automático de status_changed | ✅ Implementado |
| 6 | Banner de rechazo en form edición | ✅ Implementado |
| 7 | Badge de estado en header de CSW view/edit | ✅ Implementado |
| 8 | Fix word-wrap en CSWView | ✅ Implementado |
| 9 | Icono cancelar en CSW list actions | ✅ Implementado |
| 10 | Categoría "Orden de Estudio" + aprobación Oscar | ⏳ Pendiente (seed/migration) |

**Implementación completada:** Junio 25, 2026
