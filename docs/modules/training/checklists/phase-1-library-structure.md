# Checklist — Phase 1: Biblioteca + Estructura Formativa

**Branch:** `solution/training-phase-1`
**Estado:** ✅ Completada (8 slices de implementación + fixes de UI)

---

## Slice 01 — Library Models
**Rama:** `slice/01-library-models`

- [x] Modelo `LibraryCategory` (schema + interface + índices)
- [x] Modelo `LibraryDocument` (schema + interface + índices)
- [x] Modelo `LibraryDocumentVersion` (schema + interface + TTL index)
- [x] Validator Zod: `libraryCategory.validator.ts`
- [x] Validator Zod: `libraryDocument.validator.ts`
- [x] Script seed: crear categorías base (Cursos, Políticas) con `isSystem: true`
- [x] BaseModel/softDelete aplicado a los 3 modelos
- [x] Sin errores TypeScript

---

## Slice 02 — Library Categories CRUD
**Rama:** `slice/02-library-categories-crud`

- [x] Service: `library.service.ts` — createCategory, updateCategory, deleteCategory
- [x] Service: getCategories (árbol jerárquico), getCategoryById
- [x] Service: reorderCategories (actualizar `order`)
- [x] Service: validar que no se elimine categoría con docs activos
- [x] Controller: `library.controller.ts` — solo HTTP
- [x] Routes: `library.routes.ts` — CRUD categorías
- [x] Middleware: `authMiddleware` + `requirePermission('training', 'create')`
- [x] Endpoint: `GET /api/v1/library/categories` (árbol o por parent)
- [x] Endpoint: `POST /api/v1/library/categories`
- [x] Endpoint: `PUT /api/v1/library/categories/:id`
- [x] Endpoint: `PUT /api/v1/library/categories/reorder`
- [x] Endpoint: `DELETE /api/v1/library/categories/:id`
- [x] Calcular `depth` automáticamente al crear sub-categoría
- [x] Calcular `documentsCount` al agregar/eliminar docs

---

## Slice 03 — Library Documents CRUD
**Rama:** `slice/03-library-documents-crud`

- [x] Service: createDocument (validar categoría existe, generar slug)
- [x] Service: updateDocument (crear versión nueva en `LibraryDocumentVersion`)
- [x] Service: deleteDocument (soft delete)
- [x] Service: getDocuments (filtros: categoría, tipo, tags, publicado)
- [x] Service: getDocumentBySlug
- [x] Service: getVersionHistory (listar versiones de un doc)
- [x] Service: restoreVersion (restaurar versión anterior)
- [x] Service: publishDocument / unpublishDocument
- [x] Service: incrementViewCount
- [x] Controller: endpoints HTTP
- [x] Endpoint: `GET /api/v1/library/documents`
- [x] Endpoint: `GET /api/v1/library/documents/:slug`
- [x] Endpoint: `POST /api/v1/library/documents`
- [x] Endpoint: `PUT /api/v1/library/documents/:id`
- [x] Endpoint: `PUT /api/v1/library/documents/:id/publish`
- [x] Endpoint: `GET /api/v1/library/documents/:id/versions`
- [x] Endpoint: `POST /api/v1/library/documents/:id/restore-version/:version`
- [x] Endpoint: `DELETE /api/v1/library/documents/:id`
- [x] Endpoint: `GET /api/v1/library/search?q=&category=&type=`
- [x] Búsqueda por título + tags (D16)
- [x] Visibilidad: filtrar por rol/división del usuario actual

---

## Slice 04 — Library Editor Dual
**Rama:** `slice/04-library-editor-dual`

- [x] Instalar: `react-quill-new`, `turndown`, `react-markdown`, `remark-gfm`, `marked`
- [x] Componente: `DocumentEditor` con props `value` (MD) + `onChange`
- [x] Switch toggle: Editor Visual ↔ Markdown
- [x] Modo visual: toolbar (headers, bold, italic, listas, links, código, tablas)
- [x] Modo markdown: textarea + preview en vivo con react-markdown
- [x] Conversión al cambiar modo: visual→MD (turndown), MD→visual (marked)
- [x] Al guardar: siempre output Markdown independiente del modo
- [x] Componente: `MarkdownRenderer` (para vista de lectura de docs)
- [x] Estilos TailwindCSS para el contenido renderizado (prose)

---

## Slice 05 — Course Model CRUD
**Rama:** `slice/05-course-model-crud`

- [x] Modelo `Course` (schema + interface + índices)
- [x] Validator Zod: `course.validator.ts`
- [x] Service: `courses.service.ts` — create, update, delete, getByLevel, reorder
- [x] Validar que el `level` referenciado existe
- [x] Validar que `libraryDocument` referenciado existe (si se proporciona)
- [x] Actualizar `Level.courses[]` al crear/eliminar curso
- [x] Controller + Routes
- [x] Endpoint: `GET /api/v1/training/courses`
- [x] Endpoint: `GET /api/v1/training/courses/:id`
- [x] Endpoint: `POST /api/v1/training/courses`
- [x] Endpoint: `PUT /api/v1/training/courses/:id`
- [x] Endpoint: `PUT /api/v1/training/courses/reorder`
- [x] Endpoint: `DELETE /api/v1/training/courses/:id`

---

## Slice 06 — Level Model CRUD
**Rama:** `slice/06-level-model-crud`

- [x] Modelo `Level` (schema + interface + índices)
- [x] Validator Zod: `level.validator.ts`
- [x] Service: `levels.service.ts` — create, update, delete, getByBadge, reorder
- [x] Validar que `badge` referenciado existe
- [x] Validar orden secuencial (D1: no se puede saltar)
- [x] Actualizar `Badge.levels[]` al crear/eliminar nivel
- [x] Calcular `requiredCoursesCount` (default: todos)
- [x] Controller + Routes
- [x] Endpoint: `GET /api/v1/training/levels`
- [x] Endpoint: `GET /api/v1/training/levels/:id`
- [x] Endpoint: `POST /api/v1/training/levels`
- [x] Endpoint: `PUT /api/v1/training/levels/:id`
- [x] Endpoint: `PUT /api/v1/training/levels/reorder`
- [x] Endpoint: `DELETE /api/v1/training/levels/:id`

---

## Slice 07 — Badge Model CRUD
**Rama:** `slice/07-badge-model-crud`

- [x] Modelo `Badge` (schema + interface + `BadgeShape` enum + índices)
- [x] Validator Zod: `badge.validator.ts`
- [x] Service: `badges.service.ts` — create, update, delete, getAll
- [x] Calcular `totalCourses` automáticamente (sum de cursos en niveles)
- [x] Instalar: `lucide-react`
- [x] Componente: `BadgeIcon` — renderiza shape SVG + ícono Lucide centrado
- [x] Props: shape, icon, color, earned, progress, size
- [x] 9 shapes SVG: circle, shield, hexagon, star, diamond, pentagon, octagon, badge, medal
- [x] Estado: color (earned), gris (not started), parcial con % (in progress)
- [x] Componente: `BadgeIconPicker` — selector de ícono Lucide (search + grid)
- [x] Componente: `BadgeShapePicker` — selector visual de forma
- [x] Controller + Routes
- [x] Endpoint: `GET /api/v1/training/badges`
- [x] Endpoint: `GET /api/v1/training/badges/:id`
- [x] Endpoint: `POST /api/v1/training/badges`
- [x] Endpoint: `PUT /api/v1/training/badges/:id`
- [x] Endpoint: `DELETE /api/v1/training/badges/:id`

---

## Slice 08 — Frontend Library UI
**Rama:** `slice/08-frontend-library-ui`

- [x] Store MobX: `LibraryStore.contract.ts` + `LibraryStore.live.ts`
- [x] Store MobX: `TrainingStore.contract.ts` + `TrainingStore.live.ts`
- [x] API Service: `library.ts` (categorías + documentos)
- [x] API Service: `training.ts` (cursos + niveles + insignias)
- [x] Página: `/library` — Vista empleado (categorías + docs + buscar)
- [x] Página: `/library/manage` — Vista admin (árbol + CRUD docs)
- [x] Página: `/library/documents/:slug` — Vista lectura de documento
- [x] Página: `/library/documents/new` — Crear documento (editor dual)
- [x] Página: `/library/documents/edit/:id` — Editar documento
- [x] Página: `/training/courses` — Gestión cursos/niveles/insignias (admin)
- [x] Componente: `CategoryTree` (árbol navegable con FolderCard)
- [x] Componente: `DocumentCard` (card de documento con tipo/estado)
- [x] Sidebar: agregar sección "Training" con sub-items
- [x] Permisos: mostrar/ocultar según `training:read`, `training:create`
- [x] `data-test-*` annotations en todos los componentes
- [x] Migración 006: permisos training + asignación a hats
- [x] Permission model: agregar 'manage' y 'report' al enum de actions
- [x] PermissionResource/Action types actualizados en frontend


---

## Slice 09 — Testing E2E (Phase 1)
**Rama:** `slice/09-testing-phase-1`
**Estado:** ✅ 121 tests passing — 102 ACs automatizados (2.5 min)

### Bugs encontrados y corregidos durante el testing

| # | Bug | Fix |
|---|-----|-----|
| 1 | `externalLink: ""` rechazado por Zod url validator | `z.preprocess` empty → undefined |
| 2 | `slug` required fallaba (Mongoose validate antes de pre-save) | Mover generación a `pre('validate')` |
| 3 | Slug unique index bloqueaba con soft-deleted docs | Partial unique index `{deleted: {$ne: true}}` |
| 4 | PermissionRoute no verificaba `action` específica | Extendido con prop `action` opcional |
| 5 | `/library/manage` accesible sin `training:create` | Ruta protegida con `action="create"` |
| 6 | Delete categoría con hijas bloqueaba en vez de cascada | Cascade: soft-delete hijas + unpublish docs, con preview de afectados |
| 7 | Delete documento usaba `confirm()` nativo | Migrado a `DeleteConfirmModal` React |
| 8 | Sin endpoint hard-delete para documentos | Agregado `DELETE /documents/:id/permanent` |
| 9 | Sin endpoint restore para documentos | Agregado `POST /documents/:id/restore` |
| 10 | Sin filtro de estado en gestión de documentos | Agregado select Todos/Publicados/Borradores/Eliminados |

### Criterios de Aceptación — Biblioteca (Categorías) — 32 ACs ✅

- [x] AC-01: Admin ve lista de categorías del sistema (Cursos, Políticas)
- [x] AC-02: Admin crea nueva categoría con nombre, descripción, ícono, color
- [x] AC-03: Admin crea sub-categoría seleccionando parent en el modal
- [x] AC-04: Categoría creada aparece en la tabla
- [x] AC-05: Admin NO puede crear categoría sin nombre (validación)
- [x] AC-06: Admin edita nombre/descripción/color (modal editar)
- [x] AC-07: Cambios se reflejan inmediatamente
- [x] AC-08: Admin desactiva categoría
- [x] AC-09: Desactivar padre desactiva hijas (cascada)
- [x] AC-10: Inactivas NO aparecen en sidebar de manage
- [x] AC-11: Filtro "Eliminadas" muestra soft-deleted
- [x] AC-12: DeleteConfirmModal aparece al eliminar
- [x] AC-13: Confirmar eliminación → desaparece de vista activas
- [x] AC-14: Categoría cambia a deleted+inactive
- [x] AC-15: Docs se despublican con force
- [x] AC-16: Sub-categorías se muestran en confirm y se eliminan en cascada
- [x] AC-17: Categorías isSystem NO muestran botón eliminar
- [x] AC-18: Botón restaurar abre modal verde
- [x] AC-19: Confirmar restauración → vuelve activa
- [x] AC-20: Restaurada desaparece de vista "Eliminadas"
- [x] AC-21: HardDeleteModal requiere escribir nombre exacto
- [x] AC-22: Nombre incorrecto → botón deshabilitado
- [x] AC-23: Confirmar hard delete → eliminada permanentemente
- [x] AC-24: Buscador filtra por nombre (debounce 400ms)
- [x] AC-25: Filtro por estado funciona
- [x] AC-26: Show items cambia filas
- [x] AC-27: Paginador funciona
- [x] AC-28: "Mostrando X a Y de Z" se actualiza
- [x] AC-29: Texto largo truncado (line-clamp-2)
- [x] AC-30: Slug se actualiza al editar título
- [x] AC-31: Hard delete solo desde papelera
- [x] AC-32: Cascade muestra preview de afectados antes de ejecutar

### Criterios de Aceptación — Biblioteca (Documentos) — 18 ACs ✅

- [x] AC-33: Navegar a new document desde botón
- [x] AC-34: Crear artículo con contenido markdown
- [x] AC-35: Crear link (URL externa)
- [x] AC-36: Crear mixto (contenido + link)
- [x] AC-37: Guardar como borrador
- [x] AC-38: Publicar → visible en /library
- [x] AC-39: Tags agregar con Enter/+ y eliminar con ×
- [x] AC-40: Toggle featured funciona
- [x] AC-41: Click card → edit form
- [x] AC-42: Form carga datos existentes
- [x] AC-43: Editor muestra contenido al editar
- [x] AC-44: Save crea nueva versión
- [x] AC-45: Change note visible al editar
- [x] AC-46: Publicar desde card
- [x] AC-47: Despublicar desde card
- [x] AC-48: Borrador NO visible en /library
- [x] AC-49: Eliminar con DeleteConfirmModal
- [x] AC-50: Eliminado desaparece de lista

### Criterios de Aceptación — Vista Empleado + Doc View + Manage — 22 ACs ✅

- [x] AC-51: Sidebar categorías activas
- [x] AC-52: Click categoría filtra docs
- [x] AC-53: "Todas" muestra todos publicados
- [x] AC-54: Solo publicados visibles
- [x] AC-55: Destacados con featured=true
- [x] AC-56: Slider overflow-hidden
- [x] AC-57: Flechas navegan slider
- [x] AC-58: Click destacado → vista documento
- [x] AC-59: Búsqueda debounce 400ms
- [x] AC-60: Filtro por tipo
- [x] AC-61: Paginación info
- [x] AC-62: Paginación botones
- [x] AC-63: Docs muestran metadata
- [x] AC-64: Click doc → /library/documents/:slug
- [x] AC-65: Skeleton loading
- [x] AC-66: Doc view muestra título/autor/versión/vistas/fecha
- [x] AC-67: Markdown renderiza correctamente
- [x] AC-68: Tags como badges
- [x] AC-69: Link externo clickeable
- [x] AC-70: Archivo con botón descargar
- [x] AC-71: "← Volver a Biblioteca" navega
- [x] AC-72: Contador vistas incrementa

### Criterios de Aceptación — Editor Dual — 6 ACs ✅

- [x] AC-73: Toolbar visible (bold, italic, listas, código)
- [x] AC-74: Toggle visual ↔ markdown
- [x] AC-75: Textarea + preview lado a lado
- [x] AC-76: Preview actualiza en tiempo real
- [x] AC-77: Conversión HTML → MD al cambiar modo
- [x] AC-78: Contenido se guarda como Markdown

### Criterios de Aceptación — Gestión /library/manage — 7 ACs ✅

- [x] AC-79: Vista grid cards 2 columnas
- [x] AC-80: Vista lista tabla clickeable
- [x] AC-81: Toggle grid/list
- [x] AC-82: Parent category incluye sub-category docs
- [x] AC-83: Filtro por tipo
- [x] AC-84: Búsqueda debounce 400ms
- [x] AC-85: Paginación funciona

### Criterios de Aceptación — Permisos — 5 ACs ✅

- [x] AC-86: Training visible en sidebar
- [x] AC-87: Items admin solo con create/manage
- [x] AC-88: Sin create → redirect de /library/manage
- [x] AC-89: Sin create → redirect de /library/documents/new
- [x] AC-90: Read-only SÍ puede ver /library y /library/documents/:slug

### Criterios de Aceptación — API CRUD (Courses/Levels/Badges) — 12 ACs ✅

- [x] AC-91: GET /training/courses devuelve lista
- [x] AC-92: POST /training/courses crea curso
- [x] AC-93: PUT /training/courses/:id actualiza
- [x] AC-94: DELETE /training/courses/:id elimina (soft)
- [x] AC-95: GET /training/levels devuelve lista
- [x] AC-96: POST /training/levels crea nivel
- [x] AC-97: PUT /training/levels/:id actualiza
- [x] AC-98: DELETE /training/levels/:id elimina (soft)
- [x] AC-99: GET /training/badges devuelve lista
- [x] AC-100: POST /training/badges crea insignia
- [x] AC-101: PUT /training/badges/:id actualiza
- [x] AC-102: DELETE /training/badges/:id con constraint de niveles

### Implementación de Tests ✅

- [x] POM: `e2e/pom/library.pom.ts` (manage, categories, document form, view, editor)
- [x] Factory: `e2e/factories/library.factory.ts` (30+ funciones exportadas)
- [x] Spec: `e2e/specs/happy-path/library-categories.spec.ts` (30 tests)
- [x] Spec: `e2e/specs/happy-path/library-documents.spec.ts` (21 tests)
- [x] Spec: `e2e/specs/happy-path/library-editor.spec.ts` (11 tests)
- [x] Spec: `e2e/specs/happy-path/library-all.spec.ts` (31 tests)
- [x] Spec: `e2e/specs/happy-path/library-api-crud.spec.ts` (14 tests)
- [x] Spec: `e2e/specs/validation/library-permissions.spec.ts` (14 tests)
- [x] Results: `e2e/results/library-acceptance-criteria.md` (102 ACs ✅)
- [x] Test data: datasets tipados para categorías, documentos, badges, levels, courses
- [x] Cleanup: pre-cleanup via API (soft-delete + hard-delete) en cada spec
