# Checklist — Phase 1: Biblioteca + Estructura Formativa

**Branch:** `solution/training-phase-1`
**Estado:** 📋 Pendiente

---

## Slice 01 — Library Models
**Rama:** `slice/01-library-models`

- [ ] Modelo `LibraryCategory` (schema + interface + índices)
- [ ] Modelo `LibraryDocument` (schema + interface + índices)
- [ ] Modelo `LibraryDocumentVersion` (schema + interface + TTL index)
- [ ] Validator Zod: `libraryCategory.validator.ts`
- [ ] Validator Zod: `libraryDocument.validator.ts`
- [ ] Script seed: crear categorías base (Cursos, Políticas) con `isSystem: true`
- [ ] BaseModel/softDelete aplicado a los 3 modelos
- [ ] Sin errores TypeScript

---

## Slice 02 — Library Categories CRUD
**Rama:** `slice/02-library-categories-crud`

- [ ] Service: `library.service.ts` — createCategory, updateCategory, deleteCategory
- [ ] Service: getCategories (árbol jerárquico), getCategoryById
- [ ] Service: reorderCategories (actualizar `order`)
- [ ] Service: validar que no se elimine categoría con docs activos
- [ ] Controller: `library.controller.ts` — solo HTTP
- [ ] Routes: `library.routes.ts` — CRUD categorías
- [ ] Middleware: `authMiddleware` + `requirePermission('training', 'create')`
- [ ] Endpoint: `GET /api/v1/library/categories` (árbol o por parent)
- [ ] Endpoint: `POST /api/v1/library/categories`
- [ ] Endpoint: `PUT /api/v1/library/categories/:id`
- [ ] Endpoint: `PUT /api/v1/library/categories/reorder`
- [ ] Endpoint: `DELETE /api/v1/library/categories/:id`
- [ ] Calcular `depth` automáticamente al crear sub-categoría
- [ ] Calcular `documentsCount` al agregar/eliminar docs

---

## Slice 03 — Library Documents CRUD
**Rama:** `slice/03-library-documents-crud`

- [ ] Service: createDocument (validar categoría existe, generar slug)
- [ ] Service: updateDocument (crear versión nueva en `LibraryDocumentVersion`)
- [ ] Service: deleteDocument (soft delete)
- [ ] Service: getDocuments (filtros: categoría, tipo, tags, publicado)
- [ ] Service: getDocumentBySlug
- [ ] Service: getVersionHistory (listar versiones de un doc)
- [ ] Service: restoreVersion (restaurar versión anterior)
- [ ] Service: publishDocument / unpublishDocument
- [ ] Service: incrementViewCount
- [ ] Controller: endpoints HTTP
- [ ] Endpoint: `GET /api/v1/library/documents`
- [ ] Endpoint: `GET /api/v1/library/documents/:slug`
- [ ] Endpoint: `POST /api/v1/library/documents`
- [ ] Endpoint: `PUT /api/v1/library/documents/:id`
- [ ] Endpoint: `PUT /api/v1/library/documents/:id/publish`
- [ ] Endpoint: `GET /api/v1/library/documents/:id/versions`
- [ ] Endpoint: `POST /api/v1/library/documents/:id/restore-version/:version`
- [ ] Endpoint: `DELETE /api/v1/library/documents/:id`
- [ ] Endpoint: `GET /api/v1/library/search?q=&category=&type=`
- [ ] Búsqueda por título + tags (D16)
- [ ] Visibilidad: filtrar por rol/división del usuario actual

---

## Slice 04 — Library Editor Dual
**Rama:** `slice/04-library-editor-dual`

- [ ] Instalar: `react-quill-new`, `turndown`, `react-markdown`, `remark-gfm`, `marked`
- [ ] Componente: `DocumentEditor` con props `value` (MD) + `onChange`
- [ ] Switch toggle: Editor Visual ↔ Markdown
- [ ] Modo visual: toolbar (headers, bold, italic, listas, links, código, tablas)
- [ ] Modo markdown: textarea + preview en vivo con react-markdown
- [ ] Conversión al cambiar modo: visual→MD (turndown), MD→visual (marked)
- [ ] Al guardar: siempre output Markdown independiente del modo
- [ ] Componente: `MarkdownRenderer` (para vista de lectura de docs)
- [ ] Estilos TailwindCSS para el contenido renderizado (prose)

---

## Slice 05 — Course Model CRUD
**Rama:** `slice/05-course-model-crud`

- [ ] Modelo `Course` (schema + interface + índices)
- [ ] Validator Zod: `course.validator.ts`
- [ ] Service: `courses.service.ts` — create, update, delete, getByLevel, reorder
- [ ] Validar que el `level` referenciado existe
- [ ] Validar que `libraryDocument` referenciado existe (si se proporciona)
- [ ] Actualizar `Level.courses[]` al crear/eliminar curso
- [ ] Controller + Routes
- [ ] Endpoint: `GET /api/v1/training/courses`
- [ ] Endpoint: `GET /api/v1/training/courses/:id`
- [ ] Endpoint: `POST /api/v1/training/courses`
- [ ] Endpoint: `PUT /api/v1/training/courses/:id`
- [ ] Endpoint: `PUT /api/v1/training/courses/reorder`
- [ ] Endpoint: `DELETE /api/v1/training/courses/:id`

---

## Slice 06 — Level Model CRUD
**Rama:** `slice/06-level-model-crud`

- [ ] Modelo `Level` (schema + interface + índices)
- [ ] Validator Zod: `level.validator.ts`
- [ ] Service: `levels.service.ts` — create, update, delete, getByBadge, reorder
- [ ] Validar que `badge` referenciado existe
- [ ] Validar orden secuencial (D1: no se puede saltar)
- [ ] Actualizar `Badge.levels[]` al crear/eliminar nivel
- [ ] Calcular `requiredCoursesCount` (default: todos)
- [ ] Controller + Routes
- [ ] Endpoint: `GET /api/v1/training/levels`
- [ ] Endpoint: `GET /api/v1/training/levels/:id`
- [ ] Endpoint: `POST /api/v1/training/levels`
- [ ] Endpoint: `PUT /api/v1/training/levels/:id`
- [ ] Endpoint: `PUT /api/v1/training/levels/reorder`
- [ ] Endpoint: `DELETE /api/v1/training/levels/:id`

---

## Slice 07 — Badge Model CRUD
**Rama:** `slice/07-badge-model-crud`

- [ ] Modelo `Badge` (schema + interface + `BadgeShape` enum + índices)
- [ ] Validator Zod: `badge.validator.ts`
- [ ] Service: `badges.service.ts` — create, update, delete, getAll
- [ ] Calcular `totalCourses` automáticamente (sum de cursos en niveles)
- [ ] Instalar: `lucide-react`
- [ ] Componente: `BadgeIcon` — renderiza shape SVG + ícono Lucide centrado
- [ ] Props: shape, icon, color, earned, progress, size
- [ ] 9 shapes SVG: circle, shield, hexagon, star, diamond, pentagon, octagon, badge, medal
- [ ] Estado: color (earned), gris (not started), parcial con % (in progress)
- [ ] Componente: `BadgeIconPicker` — selector de ícono Lucide (search + grid)
- [ ] Componente: `BadgeShapePicker` — selector visual de forma
- [ ] Controller + Routes
- [ ] Endpoint: `GET /api/v1/training/badges`
- [ ] Endpoint: `GET /api/v1/training/badges/:id`
- [ ] Endpoint: `POST /api/v1/training/badges`
- [ ] Endpoint: `PUT /api/v1/training/badges/:id`
- [ ] Endpoint: `DELETE /api/v1/training/badges/:id`

---

## Slice 08 — Frontend Library UI
**Rama:** `slice/08-frontend-library-ui`

- [ ] Store MobX: `LibraryStore.contract.ts` + `LibraryStore.live.ts`
- [ ] Store MobX: `TrainingStore.contract.ts` + `TrainingStore.live.ts`
- [ ] API Service: `library.ts` (categorías + documentos)
- [ ] API Service: `training.ts` (cursos + niveles + insignias)
- [ ] Página: `/library` — Vista empleado (categorías + docs + buscar)
- [ ] Página: `/library/manage` — Vista admin (árbol + CRUD docs)
- [ ] Página: `/library/documents/:slug` — Vista lectura de documento
- [ ] Página: `/library/documents/new` — Crear documento (editor dual)
- [ ] Página: `/library/documents/edit/:id` — Editar documento
- [ ] Página: `/training/courses` — Gestión cursos/niveles/insignias (admin)
- [ ] Componente: `CategoryTree` (árbol navegable con FolderCard)
- [ ] Componente: `DocumentCard` (card de documento con tipo/estado)
- [ ] Sidebar: agregar sección "Training" con sub-items
- [ ] Permisos: mostrar/ocultar según `training:read`, `training:create`
- [ ] `data-test-*` annotations en todos los componentes
