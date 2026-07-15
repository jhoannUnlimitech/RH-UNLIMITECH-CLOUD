# Checklist — Phase 1: Biblioteca + Estructura Formativa

**Branch:** `solution/training-phase-1`
**Estado:** 📋 Pendiente

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
