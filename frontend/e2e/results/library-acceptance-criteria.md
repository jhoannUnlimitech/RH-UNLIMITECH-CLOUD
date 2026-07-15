# Criterios de Aceptación — Módulo Biblioteca (Training Phase 1)

## Rutas a testear

| Ruta | Rol requerido | Descripción |
|------|---------------|-------------|
| `/library` | training:read | Vista empleado de la biblioteca |
| `/library/manage` | training:create | Gestión documentos + sidebar categorías |
| `/library/categories` | training:create | Tabla CRUD de categorías |
| `/library/documents/new` | training:create | Crear documento (editor dual) |
| `/library/documents/edit/:slug` | training:update | Editar documento existente |
| `/training/manage` | training:create | Gestión cursos/niveles/insignias |

## Usuarios de prueba

| Usuario | Hat | Permisos Training |
|---------|-----|-------------------|
| admin@unlimitech.cloud (Manuel) | ARCHITECT SOLUTIONS | Todos (read/create/update/delete/manage/report) |
| talent@unlimitech.cloud (Laura) | HUMAN TALENT | Todos |
| oscar@unlimitech.cloud | QUALITY & TRAINING OFFICER | Todos |
| moises@unlimitech.cloud | TECHNICAL ARCHITECT MANAGER | read, report (solo lectura) |

---

## AC — Categorías

- [ ] AC-01: Admin ve lista de categorías del sistema (Cursos, Políticas) en `/library/categories`
- [ ] AC-02: Admin crea nueva categoría con nombre, descripción, ícono Lucide, color
- [ ] AC-03: Admin crea sub-categoría dentro de una categoría existente (parent select)
- [ ] AC-04: Admin edita nombre/descripción/color de una categoría (modal editar)
- [ ] AC-05: Admin NO puede eliminar categoría del sistema (isSystem) — botón oculto
- [ ] AC-06: Admin NO puede eliminar categoría con documentos activos — alert con mensaje
- [ ] AC-07: Admin NO puede eliminar categoría padre con sub-categorías — alert lista hijas
- [ ] AC-08: Admin puede eliminar categoría vacía (confirm + DELETE)
- [ ] AC-09: Admin desactiva categoría padre → hijas se desactivan automáticamente
- [ ] AC-10: Categorías inactivas NO aparecen en sidebar de `/library/manage`
- [ ] AC-11: Filtro por estado (Activas/Inactivas/Todas) funciona en `/library/categories`
- [ ] AC-12: Buscador filtra categorías por nombre
- [ ] AC-13: Show items (5/10/25/50) cambia cantidad de filas
- [ ] AC-14: Paginador funciona correctamente (Anterior/Siguiente/números)
- [ ] AC-15: Texto largo en nombre de categoría se trunca a 2 líneas (line-clamp-2)
- [ ] AC-16: El conteo de documentos de una categoría padre incluye docs de sub-categorías

---

## AC — Documentos

- [ ] AC-17: Admin crea documento tipo Artículo con contenido en editor visual
- [ ] AC-18: Admin crea documento tipo Link (URL externa requerida)
- [ ] AC-19: Admin crea documento tipo Mixto (contenido + link)
- [ ] AC-20: Al editar un documento se carga el contenido existente en el editor
- [ ] AC-21: Al editar y guardar se crea nueva versión automáticamente
- [ ] AC-22: Admin puede publicar/despublicar documento
- [ ] AC-23: Admin puede marcar documento como destacado (toggle en form)
- [ ] AC-24: Admin puede eliminar documento (confirm + DELETE)
- [ ] AC-25: Tags se agregan con Enter y se eliminan con ×
- [ ] AC-26: Buscador filtra documentos por título o tags
- [ ] AC-27: Filtro por tipo (Artículos/Links/Archivos/Mixtos) funciona
- [ ] AC-28: Vista grid muestra cards compactas (2 columnas)
- [ ] AC-29: Vista lista muestra tabla clickeable con columnas
- [ ] AC-30: Toggle grid/list cambia la vista correctamente
- [ ] AC-31: Paginador "Mostrando X a Y de Z entradas" funciona
- [ ] AC-32: Al seleccionar categoría padre "Cursos" muestra docs de sub-categorías
- [ ] AC-33: Skeleton loading aparece mientras carga datos
- [ ] AC-34: Cards muestran: tipo (ícono Lucide), título, descripción, tags, categoría, vistas, fecha completa
- [ ] AC-35: Fecha en cards muestra formato "15 jul 2026" (día + mes + año)

---

## AC — Editor Dual

- [ ] AC-36: Editor visual muestra toolbar (H1-H4, bold, italic, listas, links, código)
- [ ] AC-37: Switch toggle cambia entre modo visual y modo markdown
- [ ] AC-38: Modo markdown muestra textarea + preview lado a lado
- [ ] AC-39: Contenido siempre se guarda como Markdown (verificar en respuesta API)
- [ ] AC-40: Al cargar documento para editar, el editor visual muestra el contenido formateado

---

## AC — Cursos (CRUD API)

- [ ] AC-41: GET `/api/v1/training/courses` devuelve lista de cursos
- [ ] AC-42: POST `/api/v1/training/courses` crea curso con nombre, descripción, nivel, horas
- [ ] AC-43: PUT `/api/v1/training/courses/:id` actualiza curso
- [ ] AC-44: DELETE `/api/v1/training/courses/:id` elimina curso (soft)
- [ ] AC-45: PUT `/api/v1/training/courses/reorder` reordena cursos

---

## AC — Niveles (CRUD API)

- [ ] AC-46: GET `/api/v1/training/levels` devuelve lista de niveles
- [ ] AC-47: POST `/api/v1/training/levels` crea nivel asociado a insignia
- [ ] AC-48: PUT `/api/v1/training/levels/:id` actualiza nivel
- [ ] AC-49: DELETE `/api/v1/training/levels/:id` elimina nivel (soft)
- [ ] AC-50: PUT `/api/v1/training/levels/reorder` reordena niveles

---

## AC — Insignias (CRUD API)

- [ ] AC-51: GET `/api/v1/training/badges` devuelve lista de insignias
- [ ] AC-52: POST `/api/v1/training/badges` crea insignia con ícono Lucide + shape + color
- [ ] AC-53: PUT `/api/v1/training/badges/:id` actualiza insignia
- [ ] AC-54: DELETE `/api/v1/training/badges/:id` NO elimina si tiene niveles activos
- [ ] AC-55: BadgeIcon renderiza forma SVG + color (earned) o gris (not earned)

---

## AC — Permisos y Navegación

- [ ] AC-56: Sección "Training" aparece en el sidebar para empleados con training:read
- [ ] AC-57: Items admin (Gestión Biblioteca, Dashboard) solo visibles con training:create/manage
- [ ] AC-58: Empleado sin training:create NO puede acceder a `/library/manage` (redirect)
- [ ] AC-59: Migración 006 crea los 6 permisos correctamente
- [ ] AC-60: Oscar y Laura tienen todos los permisos de training
- [ ] AC-61: Empleados regulares solo tienen training:read y training:report

---

## Resumen

| Sección | ACs | Estado |
|---------|-----|--------|
| Categorías | 16 (AC-01 a AC-16) | 📋 Pendiente |
| Documentos | 19 (AC-17 a AC-35) | 📋 Pendiente |
| Editor Dual | 5 (AC-36 a AC-40) | 📋 Pendiente |
| Cursos API | 5 (AC-41 a AC-45) | 📋 Pendiente |
| Niveles API | 5 (AC-46 a AC-50) | 📋 Pendiente |
| Insignias API | 5 (AC-51 a AC-55) | 📋 Pendiente |
| Permisos | 6 (AC-56 a AC-61) | 📋 Pendiente |
| **Total** | **61 ACs** | **0 pass** |
