# Acceptance Criteria — Módulo Divisiones

## A. CRUD Divisiones

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DIV-01 | Navegar a `/divisions` muestra lista de divisiones | ✅ Pass |
| AC-DIV-02 | Botón "Nueva División" visible para usuarios con permiso | ✅ Pass |
| AC-DIV-03 | Crear división con nombre, código, descripción y manager | ✅ Pass |
| AC-DIV-04 | División creada aparece en la tabla al buscar | ✅ Pass |
| AC-DIV-05 | Código se muestra en la tabla | ✅ Pass |
| AC-DIV-06 | Editar división (cambiar descripción) | ✅ Pass |
| AC-DIV-07 | Cambios reflejados después de editar | ✅ Pass |
| AC-DIV-08 | Eliminar división (confirmar) | ✅ Pass |
| AC-DIV-09 | No muestra error después de eliminar | ✅ Pass |

## B. Búsqueda

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DIV-10 | Búsqueda por nombre filtra la tabla | ✅ Pass |
| AC-DIV-11 | Búsqueda por código filtra la tabla | ✅ Pass |

## C. Manager

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DIV-12 | Al crear, se asigna un manager (requerido por backend) | ✅ Pass (via API) |
| AC-DIV-13 | Manager asignado es visible en la tabla/vista | ✅ Pass |

## D. Empleados por División

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DIV-14 | En `/employees` filtrar por división muestra solo empleados de esa división | ✅ Pass |

## E. Anotaciones data-test-*

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DIV-15 | `data-test-context="divisions-list"` | ✅ Pass |
| AC-DIV-16 | `data-test-key="create-division-button"` | ✅ Pass |
| AC-DIV-17 | `data-test-key="search-input"` | ✅ Pass |
| AC-DIV-18 | `data-test-key="view-button"`, `edit-button`, `delete-button` | ✅ Pass |
| AC-DIV-19 | `data-test-context="division-form-modal"` | ✅ Pass |

---

## Status

| Sección | ACs | Pass | Pending |
|---------|-----|------|---------|
| A. CRUD | 9 | 9 | 0 |
| B. Búsqueda | 2 | 2 | 0 |
| C. Manager | 2 | 1 | 1 |
| D. Empleados por div | 1 | 0 | 1 |
| E. Anotaciones | 5 | 5 | 0 |
| **Total** | **19** | **19** | **0** |

## Tests

- `divisions-all.spec.ts`: 13 tests ✅
