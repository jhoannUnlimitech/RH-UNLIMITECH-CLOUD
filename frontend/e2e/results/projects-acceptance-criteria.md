# Acceptance Criteria — Módulo Proyectos

## A. CRUD Proyectos

| AC | Descripción | Status |
|----|-------------|--------|
| AC-PRJ-01 | Navegar a `/projects` muestra lista de proyectos | ✅ Pass |
| AC-PRJ-02 | Botón "Nuevo Proyecto" visible para usuarios con permiso | ✅ Pass |
| AC-PRJ-03 | Crear proyecto con nombre, código, descripción, división, líder y miembros | ✅ Pass |
| AC-PRJ-04 | Proyecto creado aparece en la tabla al buscar | ✅ Pass |
| AC-PRJ-05 | Código se muestra en la tabla | ✅ Pass |
| AC-PRJ-06 | Eliminar proyecto (confirmar) | ✅ Pass |
| AC-PRJ-07 | No muestra error después de eliminar | ✅ Pass |

## B. Vista Detalle

| AC | Descripción | Status |
|----|-------------|--------|
| AC-PRJ-08 | Click "Ver" navega a `/projects/:id` | ✅ Pass |
| AC-PRJ-09 | Detalle muestra nombre del proyecto | ✅ Pass |
| AC-PRJ-10 | Detalle muestra código del proyecto | ✅ Pass |
| AC-PRJ-11 | Detalle muestra miembros del equipo | ⏳ Pending (UI check) |
| AC-PRJ-12 | Detalle muestra líder del proyecto | ⏳ Pending (UI check) |

## C. Búsqueda y Filtros

| AC | Descripción | Status |
|----|-------------|--------|
| AC-PRJ-13 | Búsqueda por nombre filtra la tabla | ✅ Pass |
| AC-PRJ-14 | Búsqueda por código filtra la tabla | ✅ Pass |
| AC-PRJ-15 | Filtro de estado (Activo/Pausa/Completado/Cancelado) | ⏳ Pending (UI interaction) |

## D. Asignar Miembros y Líder

| AC | Descripción | Status |
|----|-------------|--------|
| AC-PRJ-16 | Al crear, se asigna un líder | ✅ Pass (via API) |
| AC-PRJ-17 | Al crear, se asignan miembros | ✅ Pass (via API) |
| AC-PRJ-18 | Miembros visibles en tabla (avatares) | ✅ Pass |

## E. Anotaciones data-test-*

| AC | Descripción | Status |
|----|-------------|--------|
| AC-PRJ-19 | `data-test-context="projects-list"` | ✅ Pass |
| AC-PRJ-20 | `data-test-key="create-project-button"` | ✅ Pass |
| AC-PRJ-21 | `data-test-key="search-input"` | ✅ Pass |
| AC-PRJ-22 | `data-test-key="view-button"`, `edit-button`, `delete-button` | ✅ Pass |

---

## Status

| Sección | ACs | Pass | Pending |
|---------|-----|------|---------|
| A. CRUD | 7 | 7 | 0 |
| B. Vista Detalle | 5 | 3 | 2 |
| C. Búsqueda/Filtros | 3 | 2 | 1 |
| D. Miembros/Líder | 3 | 3 | 0 |
| E. Anotaciones | 4 | 4 | 0 |
| **Total** | **22** | **19** | **3** |

## Tests

- `projects-all.spec.ts`: 11 tests ✅
