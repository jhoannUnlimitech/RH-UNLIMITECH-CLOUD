# Criterios de Aceptación — Módulo Biblioteca (Training Phase 1)

**Estado: ✅ 102/102 ACs validados — 121 tests passing (2.5 min)**

## Rutas testeadas

| Ruta | Rol requerido | Descripción |
|------|---------------|-------------|
| `/library` | training:read | Vista empleado — docs publicados + destacados slider |
| `/library/manage` | training:create | Gestión documentos + sidebar categorías |
| `/library/categories` | training:create | Tabla CRUD categorías (filtros, paginación, restore, hardDelete) |
| `/library/documents/new` | training:create | Crear documento (editor dual) |
| `/library/documents/edit/:slug` | training:update | Editar documento existente |
| `/library/documents/:slug` | training:read | Vista lectura de documento |
| `/training/manage` | training:manage | Gestión cursos/niveles/insignias |

## Specs y tests por flujo

| Spec | ACs | Tests | Tiempo |
|------|-----|-------|--------|
| `library-categories.spec.ts` | AC-01 a AC-32 | 30 | ~44s |
| `library-documents.spec.ts` | AC-33 a AC-50 | 21 | ~43s |
| `library-editor.spec.ts` | AC-73 a AC-78 | 11 | ~14s |
| `library-all.spec.ts` | AC-51 a AC-90 | 31 | ~34s |
| `library-api-crud.spec.ts` | AC-91 a AC-102 | 14 | ~4s |
| `library-permissions.spec.ts` | AC-86 a AC-90 | 14 | ~12s |
| **Total** | **102** | **121** | **~2.5m** |

---

## Flujo 1: Categorías — CRUD completo + Lifecycle (30 tests)

### Crear
- [x] AC-01: Admin ve lista de categorías del sistema (Cursos, Políticas) en `/library/categories`
- [x] AC-02: Admin crea nueva categoría con nombre, descripción, ícono Lucide, color
- [x] AC-03: Admin crea sub-categoría seleccionando parent en el modal
- [x] AC-04: Categoría creada aparece en la tabla después de crearla
- [x] AC-05: Admin NO puede crear categoría sin nombre (validación)

### Editar
- [x] AC-06: Admin edita nombre/descripción/color de una categoría (modal editar)
- [x] AC-07: Cambios se reflejan en la tabla inmediatamente

### Desactivar
- [x] AC-08: Admin desactiva categoría (botón ojo tachado)
- [x] AC-09: Categoría desactivada muestra estado "Inactiva" en la tabla
- [x] AC-10: Desactivar padre desactiva hijas automáticamente (cascada)
- [x] AC-11: Categorías inactivas NO aparecen en sidebar de `/library/manage`

### Eliminar (soft delete con cascada)
- [x] AC-12: Admin elimina categoría — DeleteConfirmModal aparece
- [x] AC-13: Confirmar eliminación → categoría desaparece de vista Activas
- [x] AC-14: Estado cambia a `deleted: true` + `active: false`
- [x] AC-15: Si categoría tiene docs → muestra en confirm y despublica con force
- [x] AC-16: Si categoría tiene sub-categorías → muestra afectados y elimina en cascada
- [x] AC-17: Categorías del sistema (isSystem) NO muestran botón eliminar

### Restaurar
- [x] AC-18: Filtro "Eliminadas" muestra categorías soft-deleted
- [x] AC-19: Botón restaurar (↩️) abre modal de confirmación verde
- [x] AC-20: Confirmar restauración → categoría vuelve a estado activa
- [x] AC-21: Categoría restaurada desaparece de vista "Eliminadas"

### Eliminar permanentemente (hard delete)
- [x] AC-22: En vista "Eliminadas", botón 🗑️ abre HardDeleteModal
- [x] AC-23: HardDeleteModal requiere escribir el nombre exacto para confirmar
- [x] AC-24: Si nombre no coincide → botón deshabilitado + mensaje error
- [x] AC-25: Confirmar hard delete → categoría eliminada de la BD permanentemente
- [x] AC-26: Si categoría tiene docs asociados → error "tiene X documentos"

### Filtros y Paginación
- [x] AC-27: Buscador filtra categorías por nombre (debounce 400ms)
- [x] AC-28: Filtro por estado: Activas / Inactivas / Eliminadas / Todos
- [x] AC-29: Show items (5/10/25/50) cambia cantidad de filas
- [x] AC-30: Paginador funciona (Anterior/Siguiente/números)
- [x] AC-31: "Mostrando X a Y de Z entradas" se actualiza correctamente
- [x] AC-32: Texto largo en nombre se trunca a 2 líneas (line-clamp-2)

---

## Flujo 2: Documentos — CRUD completo (21 tests)

### Crear
- [x] AC-33: Admin navega a `/library/documents/new` desde botón "+ Nuevo Documento"
- [x] AC-34: Crear documento tipo Artículo con contenido en editor markdown
- [x] AC-35: Crear documento tipo Link (URL externa requerida)
- [x] AC-36: Crear documento tipo Mixto (contenido + link)
- [x] AC-37: Guardar como Borrador (no publicado) → redirige a `/library/manage`
- [x] AC-38: Crear y Publicar → documento visible en `/library` para empleados
- [x] AC-39: Tags se agregan con Enter/botón + y se eliminan con ×
- [x] AC-40: Toggle "Destacar documento" funciona

### Editar
- [x] AC-41: Click en card de documento navega a `/library/documents/edit/:slug`
- [x] AC-42: Form carga datos existentes (título, descripción, tipo, contenido, tags)
- [x] AC-43: Editor muestra contenido existente al editar (modo visual o markdown)
- [x] AC-44: Guardar edición crea nueva versión automáticamente
- [x] AC-45: Nota del cambio (changeNote) aparece en campo al editar

### Publicar/Despublicar
- [x] AC-46: Admin puede publicar documento desde la card (botón "Publicar")
- [x] AC-47: Admin puede despublicar documento publicado
- [x] AC-48: Documento borrador NO aparece en vista empleado `/library`

### Eliminar
- [x] AC-49: Admin elimina documento con confirmación (DeleteConfirmModal)
- [x] AC-50: Documento eliminado desaparece de la lista

---

## Flujo 3: Vista Empleado `/library` (parte de library-all, 31 tests)

### Navegación y Layout
- [x] AC-51: Empleado ve sidebar de categorías (solo activas)
- [x] AC-52: Click en categoría filtra documentos de esa categoría + sub-categorías
- [x] AC-53: Botón "Todas" muestra todos los documentos publicados
- [x] AC-54: Solo documentos publicados son visibles (no borradores)

### Destacados (Slider)
- [x] AC-55: Sección "Destacados" muestra docs con `featured: true`
- [x] AC-56: Slider no agranda el layout (overflow-hidden)
- [x] AC-57: Flechas ← → navegan el slider horizontalmente
- [x] AC-58: Click en destacado navega a la vista del documento

### Búsqueda y Filtros
- [x] AC-59: Buscador filtra por título y tags con debounce 400ms
- [x] AC-60: Filtro por tipo (Artículos/Links/Archivos/Mixtos) funciona
- [x] AC-61: Paginación "Mostrando X a Y de Z documentos" funciona
- [x] AC-62: Botones Anterior/Siguiente de paginación funcionan

### Lista de Documentos
- [x] AC-63: Cada doc muestra: ícono tipo, título, descripción, categoría, vistas, fecha, tags
- [x] AC-64: Click en documento navega a `/library/documents/:slug`
- [x] AC-65: Skeleton loading aparece mientras carga

---

## Flujo 4: Vista Documento `/library/documents/:slug`

- [x] AC-66: Documento se carga y muestra título, autor, versión, vistas, fecha
- [x] AC-67: Contenido Markdown se renderiza correctamente (headers, listas, código, tablas)
- [x] AC-68: Tags se muestran como badges
- [x] AC-69: Link externo se muestra como enlace clickeable (si tiene)
- [x] AC-70: Archivo adjunto se muestra con botón descargar (si tiene)
- [x] AC-71: Botón "← Volver a Biblioteca" navega a `/library`
- [x] AC-72: Contador de vistas se incrementa al visitar

---

## Flujo 5: Editor Dual Visual/Markdown (11 tests)

- [x] AC-73: Editor visual muestra toolbar (H1-H4, bold, italic, listas, links, código)
- [x] AC-74: Switch toggle cambia entre modo visual y modo markdown
- [x] AC-75: Modo markdown muestra textarea + preview lado a lado
- [x] AC-76: Preview actualiza en tiempo real al escribir en textarea
- [x] AC-77: Al cambiar de visual a markdown se convierte correctamente (HTML → MD)
- [x] AC-78: Contenido siempre se guarda como Markdown (verificar en API)

---

## Flujo 6: Gestión Documentos `/library/manage`

- [x] AC-79: Vista grid muestra cards compactas (2 columnas)
- [x] AC-80: Vista lista muestra tabla clickeable con columnas (título, tipo, categoría, estado, vistas, fecha)
- [x] AC-81: Toggle grid/list cambia la vista
- [x] AC-82: Seleccionar categoría padre "Cursos" muestra docs de sub-categorías también
- [x] AC-83: Filtro por tipo funciona
- [x] AC-84: Búsqueda por título/tags con debounce 400ms
- [x] AC-85: Paginación funciona

---

## Flujo 7: Permisos y Navegación (14 tests)

- [x] AC-86: Sección "Training" aparece en el sidebar para todos con training:read
- [x] AC-87: Items admin (Gestión Biblioteca, Dashboard) solo visibles con training:create/manage
- [x] AC-88: Empleado sin training:create NO puede acceder a `/library/manage` (redirect)
- [x] AC-89: Empleado sin training:create NO puede acceder a `/library/documents/new`
- [x] AC-90: Empleado read-only SÍ puede ver `/library` y `/library/documents/:slug`

---

## Flujo 8: Cursos/Niveles/Insignias API CRUD (14 tests)

- [x] AC-91: GET `/api/v1/training/courses` devuelve lista
- [x] AC-92: POST `/api/v1/training/courses` crea curso
- [x] AC-93: PUT `/api/v1/training/courses/:id` actualiza curso
- [x] AC-94: DELETE `/api/v1/training/courses/:id` elimina (soft)
- [x] AC-95: GET `/api/v1/training/levels` devuelve lista
- [x] AC-96: POST `/api/v1/training/levels` crea nivel
- [x] AC-97: PUT `/api/v1/training/levels/:id` actualiza nivel
- [x] AC-98: DELETE `/api/v1/training/levels/:id` elimina (soft)
- [x] AC-99: GET `/api/v1/training/badges` devuelve lista
- [x] AC-100: POST `/api/v1/training/badges` crea insignia
- [x] AC-101: PUT `/api/v1/training/badges/:id` actualiza insignia
- [x] AC-102: DELETE `/api/v1/training/badges/:id` NO elimina con niveles activos

---

## Notas de implementación

### Pre-cleanup por spec
Cada spec realiza limpieza al inicio via API (`page.evaluate` con `fetch`) para eliminar datos E2E de corridas anteriores. Usa soft-delete + hard-delete para garantizar que los slugs queden libres.

### Dependencias entre specs
Los specs son **independientes** — cada uno hace su propio login y cleanup. Se pueden ejecutar en cualquier orden.

### Manejo del editor dual
El editor usa un `<Switch>` component que es un `<input type="checkbox" class="sr-only">`. La interacción se hace clickeando el `<label>` padre visual (no el input directamente).

### Categorías con cascada
Al eliminar una categoría con hijas/documentos, el backend devuelve un 409 con la lista de afectados. El frontend muestra un `confirm()` con esa info y si acepta, re-envía con `?force=true`.
