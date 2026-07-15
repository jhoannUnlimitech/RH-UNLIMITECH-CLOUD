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

### Criterios de Aceptación — Biblioteca (Categorías)

- [ ] AC-01: Admin puede ver lista de categorías del sistema (Cursos, Políticas)
- [ ] AC-02: Admin puede crear nueva categoría con nombre, descripción, ícono, color
- [ ] AC-03: Admin puede crear sub-categoría dentro de una categoría existente
- [ ] AC-04: Admin puede editar nombre/descripción/color de una categoría
- [ ] AC-05: Admin NO puede eliminar categoría del sistema (isSystem)
- [ ] AC-06: Admin NO puede eliminar categoría con documentos activos
- [ ] AC-07: Admin puede eliminar categoría vacía (sin docs ni sub-categorías)
- [ ] AC-08: Admin puede reordenar categorías (drag o flechas)
- [ ] AC-09: Empleado puede ver categorías y navegar el árbol

### Criterios de Aceptación — Biblioteca (Documentos)

- [ ] AC-10: Admin puede crear documento tipo artículo con contenido Markdown
- [ ] AC-11: Admin puede crear documento tipo link (URL externa requerida)
- [ ] AC-12: Admin puede crear documento tipo mixto (contenido + link)
- [ ] AC-13: Admin puede editar documento (crea nueva versión automáticamente)
- [ ] AC-14: Admin puede ver historial de versiones de un documento
- [ ] AC-15: Admin puede restaurar versión anterior de un documento
- [ ] AC-16: Admin puede publicar/despublicar un documento
- [ ] AC-17: Admin puede destacar un documento (featured)
- [ ] AC-18: Admin puede eliminar documento (soft delete)
- [ ] AC-19: Admin puede agregar tags a un documento
- [ ] AC-20: Empleado puede buscar documentos por título o tags
- [ ] AC-21: Empleado puede ver documento publicado con contenido Markdown renderizado
- [ ] AC-22: Empleado NO puede ver documentos en borrador
- [ ] AC-23: Vista de documento incrementa contador de vistas

### Criterios de Aceptación — Editor Dual

- [ ] AC-24: El editor visual muestra toolbar (H1-H4, bold, italic, listas, links, código)
- [ ] AC-25: El switch toggle cambia entre modo visual y modo markdown
- [ ] AC-26: Al cambiar a markdown se convierte el HTML a MD correctamente
- [ ] AC-27: Al cambiar a visual se carga el MD en el editor correctamente
- [ ] AC-28: El modo markdown muestra textarea + preview lado a lado
- [ ] AC-29: El contenido siempre se guarda como Markdown (verificar en API response)

### Criterios de Aceptación — Cursos

- [ ] AC-30: Admin puede crear curso con nombre, descripción, link, nivel, horas estimadas
- [ ] AC-31: Admin puede asociar un documento de la biblioteca a un curso
- [ ] AC-32: Admin puede editar un curso
- [ ] AC-33: Admin puede eliminar un curso
- [ ] AC-34: Admin puede reordenar cursos dentro de un nivel
- [ ] AC-35: Los cursos se listan ordenados por `order` dentro de su nivel

### Criterios de Aceptación — Niveles

- [ ] AC-36: Admin puede crear nivel asociado a una insignia
- [ ] AC-37: Admin puede editar un nivel
- [ ] AC-38: Admin puede eliminar un nivel
- [ ] AC-39: Admin puede reordenar niveles dentro de una insignia
- [ ] AC-40: Los niveles mantienen orden secuencial estricto

### Criterios de Aceptación — Insignias

- [ ] AC-41: Admin puede crear insignia con nombre, descripción, ícono Lucide, forma, color
- [ ] AC-42: BadgeIconPicker muestra grid de íconos con búsqueda
- [ ] AC-43: BadgeShapePicker muestra las 9 formas disponibles
- [ ] AC-44: Admin puede editar una insignia
- [ ] AC-45: Admin NO puede eliminar insignia con niveles activos
- [ ] AC-46: BadgeIcon renderiza correctamente: forma + color (earned) o gris (not earned)
- [ ] AC-47: BadgeIcon muestra progress ring cuando progress > 0 y < 100

### Criterios de Aceptación — Permisos y Navegación

- [ ] AC-48: La sección "Training" aparece en el sidebar para todos los usuarios
- [ ] AC-49: Items admin (Gestión, Dashboard) solo visibles con `training:create` o `training:manage`
- [ ] AC-50: Empleado sin permiso `training:create` NO puede acceder a `/library/manage`
- [ ] AC-51: La migración 006 crea los 6 permisos correctamente
- [ ] AC-52: Oscar y Laura tienen todos los permisos de training
- [ ] AC-53: Empleados regulares solo tienen `training:read` y `training:report`

### Implementación de Tests

- [ ] POM: `e2e/pom/library.pom.ts` (categorías, documentos, editor)
- [ ] POM: `e2e/pom/training-manage.pom.ts` (cursos, niveles, insignias)
- [ ] Factory: `e2e/factories/library.factory.ts`
- [ ] Factory: `e2e/factories/training-manage.factory.ts`
- [ ] Spec: `e2e/specs/happy-path/library-categories.spec.ts`
- [ ] Spec: `e2e/specs/happy-path/library-documents.spec.ts`
- [ ] Spec: `e2e/specs/happy-path/training-courses-levels-badges.spec.ts`
- [ ] Spec: `e2e/specs/validation/library-permissions.spec.ts`
- [ ] Results: `e2e/results/library-acceptance-criteria.md`
- [ ] Results: `e2e/results/training-manage-acceptance-criteria.md`
