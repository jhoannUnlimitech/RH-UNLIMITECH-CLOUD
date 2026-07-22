# Criterios de Aceptación — Módulo Biblioteca (Training Phase 1)

## Rutas a testear

| Ruta | Rol requerido | Descripción |
|------|---------------|-------------|
| `/library` | training:read | Vista empleado — docs publicados + destacados slider |
| `/library/manage` | training:create | Gestión documentos + sidebar categorías |
| `/library/categories` | training:create | Tabla CRUD categorías (filtros, paginación, restore, hardDelete) |
| `/library/documents/new` | training:create | Crear documento (editor dual) |
| `/library/documents/edit/:slug` | training:update | Editar documento existente |
| `/library/documents/:slug` | training:read | Vista lectura de documento |
| `/training/manage` | training:create | Gestión cursos/niveles/insignias |

## Usuarios de prueba

| Usuario | Hat | Permisos Training |
|---------|-----|-------------------|
| admin@unlimitech.cloud (Manuel) | ARCHITECT SOLUTIONS | Todos (read/create/update/delete/manage/report) |
| talent@unlimitech.cloud (Laura) | HUMAN TALENT | Todos |
| training@unlimitech.cloud (Oscar) | QUALITY & TRAINING OFFICER | Todos |
| moises@unlimitech.cloud | TECHNICAL ARCHITECT MANAGER | read, report (solo lectura) |

---

## Flujo 1: Categorías — CRUD completo + Lifecycle

### Crear
- [ ] AC-01: Admin ve lista de categorías del sistema (Cursos, Políticas) en `/library/categories`
- [ ] AC-02: Admin crea nueva categoría con nombre, descripción, ícono Lucide, color
- [ ] AC-03: Admin crea sub-categoría seleccionando parent en el modal
- [ ] AC-04: Categoría creada aparece en la tabla después de crearla
- [ ] AC-05: Admin NO puede crear categoría sin nombre (validación)

### Editar
- [ ] AC-06: Admin edita nombre/descripción/color de una categoría (modal editar)
- [ ] AC-07: Cambios se reflejan en la tabla inmediatamente

### Desactivar
- [ ] AC-08: Admin desactiva categoría (botón ojo tachado)
- [ ] AC-09: Categoría desactivada muestra estado "Inactiva" en la tabla
- [ ] AC-10: Desactivar padre desactiva hijas automáticamente (cascada)
- [ ] AC-11: Categorías inactivas NO aparecen en sidebar de `/library/manage`

### Eliminar (soft delete)
- [ ] AC-12: Admin elimina categoría vacía — DeleteConfirmModal aparece
- [ ] AC-13: Confirmar eliminación → categoría desaparece de vista Activas
- [ ] AC-14: Estado cambia a `deleted: true` + `active: false`
- [ ] AC-15: Si categoría tiene docs → API devuelve 409 con lista de docs
- [ ] AC-16: Si categoría tiene sub-categorías → toast error "tiene X sub-categorías"
- [ ] AC-17: Categorías del sistema (isSystem) NO muestran botón eliminar

### Restaurar
- [ ] AC-18: Filtro "Eliminadas" muestra categorías soft-deleted
- [ ] AC-19: Botón restaurar (↩️) abre modal de confirmación verde
- [ ] AC-20: Confirmar restauración → categoría vuelve a estado activa
- [ ] AC-21: Categoría restaurada desaparece de vista "Eliminadas"

### Eliminar permanentemente (hard delete)
- [ ] AC-22: En vista "Eliminadas", botón 🗑️ abre HardDeleteModal
- [ ] AC-23: HardDeleteModal requiere escribir el nombre exacto para confirmar
- [ ] AC-24: Si nombre no coincide → botón deshabilitado + mensaje error
- [ ] AC-25: Confirmar hard delete → categoría eliminada de la BD permanentemente
- [ ] AC-26: Si categoría tiene docs asociados → error "tiene X documentos"

### Filtros y Paginación
- [ ] AC-27: Buscador filtra categorías por nombre (debounce 400ms)
- [ ] AC-28: Filtro por estado: Activas / Inactivas / Eliminadas / Todos
- [ ] AC-29: Show items (5/10/25/50) cambia cantidad de filas
- [ ] AC-30: Paginador funciona (Anterior/Siguiente/números)
- [ ] AC-31: "Mostrando X a Y de Z entradas" se actualiza correctamente
- [ ] AC-32: Texto largo en nombre se trunca a 2 líneas (line-clamp-2)

---

## Flujo 2: Documentos — CRUD completo

### Crear
- [ ] AC-33: Admin navega a `/library/documents/new` desde botón "+ Nuevo Documento"
- [ ] AC-34: Crear documento tipo Artículo con contenido en editor markdown
- [ ] AC-35: Crear documento tipo Link (URL externa requerida)
- [ ] AC-36: Crear documento tipo Mixto (contenido + link)
- [ ] AC-37: Guardar como Borrador (no publicado) → redirige a `/library/manage`
- [ ] AC-38: Crear y Publicar → documento visible en `/library` para empleados
- [ ] AC-39: Tags se agregan con Enter/botón + y se eliminan con ×
- [ ] AC-40: Toggle "Destacar documento" funciona

### Editar
- [ ] AC-41: Click en card de documento navega a `/library/documents/edit/:slug`
- [ ] AC-42: Form carga datos existentes (título, descripción, tipo, contenido, tags)
- [ ] AC-43: Editor muestra contenido existente al editar (modo visual o markdown)
- [ ] AC-44: Guardar edición crea nueva versión automáticamente
- [ ] AC-45: Nota del cambio (changeNote) aparece en campo al editar

### Publicar/Despublicar
- [ ] AC-46: Admin puede publicar documento desde la card (botón "Publicar")
- [ ] AC-47: Admin puede despublicar documento publicado
- [ ] AC-48: Documento borrador NO aparece en vista empleado `/library`

### Eliminar
- [ ] AC-49: Admin elimina documento con confirmación
- [ ] AC-50: Documento eliminado desaparece de la lista

---

## Flujo 3: Vista Empleado (`/library`)

### Navegación y Layout
- [ ] AC-51: Empleado ve sidebar de categorías (solo activas)
- [ ] AC-52: Click en categoría filtra documentos de esa categoría + sub-categorías
- [ ] AC-53: Botón "Todas" muestra todos los documentos publicados
- [ ] AC-54: Solo documentos publicados son visibles (no borradores)

### Destacados (Slider)
- [ ] AC-55: Sección "Destacados" muestra docs con `featured: true`
- [ ] AC-56: Slider no agranda el layout (overflow-hidden)
- [ ] AC-57: Flechas ← → navegan el slider horizontalmente
- [ ] AC-58: Click en destacado navega a la vista del documento

### Búsqueda y Filtros
- [ ] AC-59: Buscador filtra por título y tags con debounce 400ms
- [ ] AC-60: Filtro por tipo (Artículos/Links/Archivos/Mixtos) funciona
- [ ] AC-61: Paginación "Mostrando X a Y de Z documentos" funciona
- [ ] AC-62: Botones Anterior/Siguiente de paginación funcionan

### Lista de Documentos
- [ ] AC-63: Cada doc muestra: ícono tipo, título, descripción, categoría, vistas, fecha, tags
- [ ] AC-64: Click en documento navega a `/library/documents/:slug`
- [ ] AC-65: Skeleton loading aparece mientras carga

---

## Flujo 4: Vista Documento (`/library/documents/:slug`)

- [ ] AC-66: Documento se carga y muestra título, autor, versión, vistas, fecha
- [ ] AC-67: Contenido Markdown se renderiza correctamente (headers, listas, código, tablas)
- [ ] AC-68: Tags se muestran como badges
- [ ] AC-69: Link externo se muestra como enlace clickeable (si tiene)
- [ ] AC-70: Archivo adjunto se muestra con botón descargar (si tiene)
- [ ] AC-71: Botón "← Volver a Biblioteca" navega a `/library`
- [ ] AC-72: Contador de vistas se incrementa al visitar

---

## Flujo 5: Editor Dual (Visual/Markdown)

- [ ] AC-73: Editor visual muestra toolbar (H1-H4, bold, italic, listas, links, código)
- [ ] AC-74: Switch toggle cambia entre modo visual y modo markdown
- [ ] AC-75: Modo markdown muestra textarea + preview lado a lado
- [ ] AC-76: Preview actualiza en tiempo real al escribir en textarea
- [ ] AC-77: Al cambiar de visual a markdown se convierte correctamente (HTML → MD)
- [ ] AC-78: Contenido siempre se guarda como Markdown (verificar en API)

---

## Flujo 6: Gestión Documentos (`/library/manage`)

- [ ] AC-79: Vista grid muestra cards compactas (2 columnas)
- [ ] AC-80: Vista lista muestra tabla clickeable con columnas (título, tipo, categoría, estado, vistas, fecha)
- [ ] AC-81: Toggle grid/list cambia la vista
- [ ] AC-82: Seleccionar categoría padre "Cursos" muestra docs de sub-categorías también
- [ ] AC-83: Filtro por tipo funciona
- [ ] AC-84: Búsqueda por título/tags con debounce 400ms
- [ ] AC-85: Paginación funciona

---

## Flujo 7: Permisos y Navegación

- [ ] AC-86: Sección "Training" aparece en el sidebar para todos con training:read
- [ ] AC-87: Items admin (Gestión Biblioteca, Dashboard) solo visibles con training:create/manage
- [ ] AC-88: Empleado sin training:create NO puede acceder a `/library/manage` (redirect)
- [ ] AC-89: Empleado sin training:create NO puede acceder a `/library/documents/new`
- [ ] AC-90: Empleado read-only SÍ puede ver `/library` y `/library/documents/:slug`

---

## Flujo 8: Cursos/Niveles/Insignias (API CRUD)

- [ ] AC-91: GET `/api/v1/training/courses` devuelve lista
- [ ] AC-92: POST `/api/v1/training/courses` crea curso
- [ ] AC-93: PUT `/api/v1/training/courses/:id` actualiza curso
- [ ] AC-94: DELETE `/api/v1/training/courses/:id` elimina (soft)
- [ ] AC-95: GET `/api/v1/training/levels` devuelve lista
- [ ] AC-96: POST `/api/v1/training/levels` crea nivel
- [ ] AC-97: PUT `/api/v1/training/levels/:id` actualiza nivel
- [ ] AC-98: DELETE `/api/v1/training/levels/:id` elimina (soft)
- [ ] AC-99: GET `/api/v1/training/badges` devuelve lista
- [ ] AC-100: POST `/api/v1/training/badges` crea insignia
- [ ] AC-101: PUT `/api/v1/training/badges/:id` actualiza insignia
- [ ] AC-102: DELETE `/api/v1/training/badges/:id` NO elimina con niveles activos

---

## Resumen

| Flujo | ACs | Descripción |
|-------|-----|-------------|
| 1. Categorías CRUD + Lifecycle | 32 (AC-01 a AC-32) | Crear, editar, desactivar, eliminar, restaurar, hard delete |
| 2. Documentos CRUD | 18 (AC-33 a AC-50) | Crear, editar, publicar, eliminar |
| 3. Vista Empleado | 15 (AC-51 a AC-65) | Biblioteca, destacados, búsqueda, paginación |
| 4. Vista Documento | 7 (AC-66 a AC-72) | Lectura, markdown, volver |
| 5. Editor Dual | 6 (AC-73 a AC-78) | Visual/markdown toggle |
| 6. Gestión Documentos | 7 (AC-79 a AC-85) | Grid/list, filtros, paginación |
| 7. Permisos | 5 (AC-86 a AC-90) | Sidebar, acceso, restricciones |
| 8. API CRUD | 12 (AC-91 a AC-102) | Cursos, niveles, insignias |
| **Total** | **102 ACs** | |
