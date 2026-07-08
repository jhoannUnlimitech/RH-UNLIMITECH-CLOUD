# Acceptance Criteria — Módulo Hats (Roles)

## A. CRUD Hats

| AC | Descripción | Status |
|----|-------------|--------|
| AC-HAT-01 | Navegar a `/roles` muestra lista de hats | ✅ Pass |
| AC-HAT-02 | Botón "Nuevo Hat" visible para usuarios con permiso | ✅ Pass |
| AC-HAT-03 | Crear hat con nombre y permisos asignados | ✅ Pass |
| AC-HAT-04 | Hat creado aparece en la tabla al buscar | ✅ Pass |
| AC-HAT-05 | Click "Ver" navega a `/roles/view/:id` y muestra nombre | ✅ Pass |
| AC-HAT-06 | Click "Editar" navega a `/roles/edit/:id` | ✅ Pass |
| AC-HAT-07 | Página de edición muestra el hat | ✅ Pass |
| AC-HAT-08 | Eliminar hat (confirmar) | ✅ Pass |
| AC-HAT-09 | No muestra error después de eliminar | ✅ Pass |

## B. Búsqueda

| AC | Descripción | Status |
|----|-------------|--------|
| AC-HAT-10 | Búsqueda por nombre filtra la tabla | ✅ Pass |

## C. Permisos

| AC | Descripción | Status |
|----|-------------|--------|
| AC-HAT-11 | Al crear, se asignan permisos al hat | ✅ Pass (via API) |
| AC-HAT-12 | Vista muestra permisos asignados | ✅ Pass |
| AC-HAT-13 | Editar permite cambiar permisos | ⏳ Pending (UI interaction) |

## D. Anotaciones data-test-*

| AC | Descripción | Status |
|----|-------------|--------|
| AC-HAT-14 | `data-test-context="hats-list"` | ✅ Pass |
| AC-HAT-15 | `data-test-key="create-hat-button"` | ✅ Pass |
| AC-HAT-16 | `data-test-key="search-input"` | ✅ Pass |
| AC-HAT-17 | `data-test-key="view-button"`, `edit-button`, `delete-button` | ✅ Pass |

---

## Status

| Sección | ACs | Pass | Pending |
|---------|-----|------|---------|
| A. CRUD | 9 | 9 | 0 |
| B. Búsqueda | 1 | 1 | 0 |
| C. Permisos | 3 | 2 | 1 |
| D. Anotaciones | 4 | 4 | 0 |
| **Total** | **17** | **16** | **1** |

## Tests

- `hats-all.spec.ts`: 12 tests ✅
