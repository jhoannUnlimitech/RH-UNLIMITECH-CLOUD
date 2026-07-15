# Deuda Técnica Detectada — Módulos Existentes

Hallazgos encontrados durante el análisis de arquitectura para el módulo Training. Se documentan para corregir en un sprint futuro dedicado a refactoring, **NO se corrigen ahora** para no interferir con el desarrollo del módulo Training.

---

## Prioridad Alta (afectan mantenibilidad)

### DT-01: Fat Controllers — Sin capa de servicios

**Archivos afectados:** Todos los controllers (`divisions.controller.ts`, `csw.controller.ts`, `employees.controller.ts`, etc.)

**Problema:** Los controllers mezclan 3 responsabilidades: manejo HTTP, lógica de negocio, y acceso directo a datos. Ejemplo: `createDivision` tiene 80 líneas haciendo validación de negocio, queries directos a Mongoose, y formatting de respuesta.

**Impacto:** 
- No se pueden testear las reglas de negocio sin levantar un servidor HTTP
- Un cambio en la lógica de "crear división" requiere tocar el controller que también maneja el response
- Duplicación de lógica entre controllers (ej: verificar si un employee existe se repite en 4+ controllers)

**Fix futuro:** Extraer capa `services/` con lógica de negocio. Controllers solo parsean request → llaman service → envían response.

---

### DT-02: Modelo CSW con 600+ líneas de lógica embebida

**Archivo:** `backend/src/models/CSW.ts`

**Problema:** El modelo CSW tiene `initializeApprovalChain`, `approveAtLevel`, `rejectAtLevel` y más métodos como methods de Mongoose. Esto hace el archivo difícil de navegar y los métodos difíciles de testear unitariamente.

**Impacto:**
- Archivo de 600+ líneas donde schema, types, y lógica de negocio están mezclados
- Los métodos acceden a otros modelos (`ApprovalFlow`, `Employee`, `CSWCategory`) dentro del schema method — alto acoplamiento
- Agregar un nuevo tipo de flujo requiere modificar el archivo directamente

**Fix futuro:** Mover la lógica a un `csw.service.ts`. El modelo solo queda con el schema y validaciones Mongoose básicas.

---

### DT-03: Console.logs en controllers de producción

**Archivos:** `divisions.controller.ts`, posiblemente otros

**Problema:** Hay `console.log('📥 Request body:', req.body)` y `console.log('✅ División creada:', division._id)` en controllers.

**Impacto:** Ruido en logs de producción, posible leak de datos sensibles.

**Fix futuro:** Reemplazar con un logger estructurado (winston/pino) con niveles. Los debug logs solo en `NODE_ENV=development`.

---

## Prioridad Media (mejoran consistencia)

### DT-04: Validación duplicada — Zod + manual en controllers

**Archivos:** `divisions.controller.ts`, `employees.controller.ts`

**Problema:** Los validators Zod existen (`division.validator.ts`) pero los controllers TAMBIÉN hacen validación manual:
```typescript
// division.validator.ts tiene el schema Zod ✅
// PERO el controller también hace:
if (!name || !name.trim()) throw new AppError('El nombre es requerido', 400);
if (!mongoose.Types.ObjectId.isValid(managerId)) throw new AppError('ID no válido', 400);
```

**Impacto:** Doble mantenimiento. Si cambias una regla en Zod, el controller sigue teniendo su propia validación que puede contradecir.

**Fix futuro:** Quitar validación manual del controller. Confiar 100% en Zod (que se ejecuta antes en el middleware `validate()`). El controller asume que el body ya está validado.

---

### DT-05: Transformación de datos inconsistente (Division.managerId → manager)

**Archivo:** `backend/src/models/Division.ts`, `divisions.controller.ts`

**Problema:** La transformación de `managerId` populado a un campo `manager` se hace en 3 lugares:
1. En el schema con `toJSON` transform
2. En el schema con `toObject` transform  
3. MANUALMENTE en el controller (`divisionsWithManager.map(...)`)

**Impacto:** Código duplicado. Si cambia el formato, hay que actualizar 3 lugares.

**Fix futuro:** Centralizar en el schema transform y confiar en él. El controller no debería hacer transformaciones manuales.

---

### DT-06: `CSWHistory` colección separada pero el CSW ya embebe historial

**Archivos:** `backend/src/models/CSWHistory.ts`, `backend/src/models/CSW.ts`

**Problema:** Existe una colección `CSWHistory` pero el modelo CSW ya tiene `history: ICSWHistory[]` embebido como subdocumento. Ambos parecen contener la misma info.

**Impacto:** Confusión sobre cuál es la fuente de verdad. Posible data inconsistente si uno se actualiza y el otro no.

**Fix futuro:** Decidir cuál es la fuente única. Si el historial embebido es suficiente (y lo es para CSW que tiene máximo ~20 entries), eliminar la colección separada.

---

### DT-07: Falta index para soft delete en queries frecuentes

**Archivos:** Varios modelos

**Problema:** El `softDeletePlugin` filtra por `{ deleted: { $ne: true } }` en cada find, pero no todos los modelos tienen un índice que incluya `deleted` como primer campo o como parte de un compound index con los campos más consultados.

**Impacto:** Performance en colecciones grandes. MongoDB hace collection scan si no hay índice para el filtro.

**Fix futuro:** Revisar y agregar compound indexes que incluyan `deleted` donde haga falta (ej: `{ deleted: 1, division: 1 }` para Employee).

---

## Prioridad Baja (nice to have)

### DT-08: TypeScript errors pre-existentes (35 errores en tsc)

**Archivos:** Múltiples (ver output de `tsc --noEmit`)

**Problema:** El proyecto no compila limpio con `tsc`. Hay errores de tipos en seeds, routes, controllers. El proyecto funciona en runtime porque `ts-node` / el bundler ignora los errores.

**Impacto:** No se puede confiar en TypeScript para detectar bugs en CI. Refactoring es peligroso sin type-safety.

**Fix futuro:** Sprint dedicado a corregir los 35 errores de tipos. Algunos son triviales (imports faltantes, tipos de Zod v4).

---

### DT-09: No hay patrón de error consistente

**Problema:** Algunos controllers usan `throw new AppError(msg, code)`, otros usan `res.status(X).json({ success: false, message })` directamente, y otros hacen ambos en diferentes paths del mismo función.

**Impacto:** Inconsistencia en el formato de error que recibe el frontend.

**Fix futuro:** Estandarizar: siempre `throw new AppError()` y dejar que el `errorHandler` middleware formatee la respuesta.

---

### DT-10: Archivos duplicados entre `backend/` (raíz) y `RH-UNLIMITECH-CLOUD/backend/`

**Problema:** En el workspace existen dos copias del backend — una en la raíz (`backend/`) y otra dentro de `RH-UNLIMITECH-CLOUD/backend/`. La de la raíz parece ser una versión anterior sin las últimas features.

**Impacto:** Confusión sobre cuál es la fuente de verdad. Riesgo de editar el archivo incorrecto.

**Fix futuro:** Eliminar el `backend/` de la raíz (o convertirlo en un symlink si hay razón para mantenerlo).

---

## Plan de Acción (post-Training)

| Sprint | Items | Esfuerzo |
|--------|-------|----------|
| Refactor Sprint 1 | DT-01 (services layer para 1-2 módulos como piloto), DT-03 (logger), DT-04 (quitar validación manual) | ~3 días |
| Refactor Sprint 2 | DT-02 (CSW service), DT-05 (Division transform), DT-06 (eliminar CSWHistory) | ~2 días |
| Refactor Sprint 3 | DT-08 (fix TS errors), DT-07 (indices), DT-09 (error pattern) | ~2 días |
| Cleanup | DT-10 (eliminar duplicados) | ~30 min |

**Nota:** El módulo Training se implementa con la arquitectura mejorada (con services layer, sin fat controllers) desde el inicio. Esto sirve como modelo de referencia para cuando se refactoren los módulos existentes.
