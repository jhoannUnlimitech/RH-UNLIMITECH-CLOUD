# Plan de Anotaciones `data-test-*` — RH Unlimitech Cloud

## Inventario de Componentes a Anotar

### PÁGINAS (data-test-context por sección)

| # | Archivo | Context raíz | Sub-contexts |
|---|---------|-------------|--------------|
| 1 | `AuthPages/SignIn.tsx` | `signin-page` | `login-form`, `login-inputs` |
| 2 | `Dashboard/Home.tsx` | `dashboard` | `csw-stats`, `productivity-chart`, `week-summary`, `projects-card`, `quick-links` |
| 3 | `Employees/EmployeesList.tsx` | `employees-list` | `employees-controls`, `employees-table`, `table-header`, `table-body` |
| 4 | `Divisions/DivisionsList.tsx` | `divisions-list` | `divisions-controls`, `divisions-table`, `table-header`, `table-body` |
| 5 | `Hats/HatsList.tsx` | `hats-list` | `hats-controls`, `hats-table`, `table-header`, `table-body` |
| 6 | `Hats/HatForm.tsx` | `hat-form` | `permissions-section`, `permissions-list` |
| 7 | `Hats/HatsView.tsx` | `hat-view` | `hat-info`, `permissions-section` |
| 8 | `Projects/ProjectsList.tsx` | `projects-list` | `projects-controls`, `projects-table`, `table-body` |
| 9 | `Projects/ProjectDetail.tsx` | `project-detail` | `project-info`, `project-members`, `project-links` |
| 10 | `Calendar/CalendarPage.tsx` | `calendar-page` | `calendar-header`, `calendar-legend`, `calendar-view`, `event-modal` |
| 11 | `Calendar/EventsList.tsx` | `events-list` | `events-controls`, `events-table`, `table-body` |
| 12 | `CSW/CSWList.tsx` | `csw-list` | `csw-controls`, `csw-filters`, `csw-table`, `table-body` |
| 13 | `CSW/CSWForm.tsx` | `csw-form` | `rejection-banner`, `form-header`, `category-field`, `situation-field`, `information-field`, `solution-field`, `form-actions` |
| 14 | `CSW/CSWView.tsx` | `csw-view` | `csw-header`, `requester-info`, `csw-content`, `approval-chain`, `action-history`, `approval-actions` |
| 15 | `CSWCategories/CSWCategoriesList.tsx` | `csw-categories-list` | `categories-controls`, `categories-table`, `table-body` |

### COMPONENTES MODALES (data-test-context)

| # | Archivo | Context |
|---|---------|---------|
| 16 | `employees/EmployeeFormModal.tsx` | `employee-form-modal` |
| 17 | `employees/ViewEmployeeModal.tsx` | `employee-view-modal` |
| 18 | `employees/DeleteConfirmModal.tsx` | `employee-delete-modal` |
| 19 | `divisions/DivisionFormModal.tsx` | `division-form-modal` |
| 20 | `divisions/DivisionViewModal.tsx` | `division-view-modal` |
| 21 | `divisions/DeleteConfirmModal.tsx` | `division-delete-modal` |
| 22 | `cswCategories/CSWCategoryFormModal.tsx` | `csw-category-form-modal` |
| 23 | `cswCategories/DeleteConfirmModal.tsx` | `csw-category-delete-modal` |
| 24 | `hats/HatFormModal.tsx` | `hat-form-modal` |
| 25 | `hats/DeleteConfirmModal.tsx` | `hat-delete-modal` |
| 26 | `projects/ProjectFormModal.tsx` | `project-form-modal` |

### COMPONENTES DE FORMULARIO (data-test-key por prop)

| # | Archivo | Keys |
|---|---------|------|
| 27 | `form/SearchableSelect.tsx` | Acepta `data-test-key` via id prop |
| 28 | `form/Input.tsx` | Acepta `data-test-key` via name/id |
| 29 | `form/Switch.tsx` | `switch-{name}` |
| 30 | `form/Label.tsx` | N/A (decorativo) |

### COMPONENTES UI (data-test-key/state)

| # | Archivo | Anotación |
|---|---------|-----------|
| 31 | `ui/button/Button.tsx` | Acepta `data-test-key` via prop |
| 32 | `ui/alert/Alert.tsx` | `data-test-context="alert-{variant}"` |
| 33 | `ui/badge/Badge.tsx` | N/A (decorativo) |
| 34 | `ui/modal/Modal.tsx` | `data-test-context="modal"` |
| 35 | `ui/pagination/Pagination.tsx` | `data-test-context="pagination"` |
| 36 | `ui/skeleton/TableSkeleton.tsx` | `data-test-state="loading"` |
| 37 | `ui/toast/Toast.tsx` | `data-test-context="toast"`, `data-test-state` |

### LAYOUT (data-test-context)

| # | Archivo | Context |
|---|---------|---------|
| 38 | `layout/AppSidebar.tsx` | `sidebar` |
| 39 | `layout/AppLayout.tsx` | `app-layout` |
| 40 | `header/Header.tsx` | `app-header` |

---

## Jerarquía por Flujo (Ejemplo: CSW)

```
app-layout
├── sidebar
│   └── [key] csw-menu-item
├── app-header
│   ├── [key] user-dropdown
│   └── [key] theme-toggle
└── csw-list
    ├── [key] page-title
    ├── csw-controls
    │   ├── [key] search-input
    │   ├── [key] status-filter
    │   ├── [key] category-filter
    │   └── [key] create-button
    ├── csw-table [data-test-state="loaded"|"loading"|"empty"]
    │   ├── table-header
    │   │   └── [key] header-row
    │   └── table-body
    │       ├── [key] csw-{id}
    │       │   ├── [key] title-cell
    │       │   ├── [key] requester-cell
    │       │   ├── [key] status-cell [data-test-state="pending"|"approved"|...]
    │       │   ├── [key] progress-cell
    │       │   ├── [key] view-button
    │       │   ├── [key] edit-button
    │       │   ├── [key] cancel-button
    │       │   └── [key] delete-button
    │       └── ...
    └── pagination
        ├── [key] prev-button
        ├── [key] next-button
        └── [key] page-info
```

## Jerarquía: Login

```
signin-page
└── login-form [data-test-state="ready"|"loading"]
    ├── login-inputs
    │   ├── [key] email-input
    │   ├── [key] password-input
    │   └── [key] submit-button [data-test-state="ready"|"loading"]
    └── [key] error-message [data-test-state="visible"]
```

## Jerarquía: Dashboard

```
dashboard
├── [key] welcome-title
├── [key] user-info
├── csw-stats [data-test-state="loaded"|"loading"]
│   ├── [key] stat-total
│   ├── [key] stat-pending
│   ├── [key] stat-approved
│   ├── [key] stat-rejected
│   └── [key] stat-to-sign (solo aprobadores)
├── productivity-chart
│   └── [key] chart-container
├── week-summary
│   ├── [key] qa-metrics
│   └── [key] dev-metrics
├── projects-card
│   └── [key] project-{id}
└── quick-links
    ├── [key] link-my-requests
    ├── [key] link-pending
    ├── [key] link-employees
    └── [key] link-hats
```

## Jerarquía: CSW Form

```
csw-form
├── rejection-banner [data-test-state="visible"] (solo si rechazado)
│   ├── [key] rejection-reason
│   ├── [key] rejection-by
│   └── [key] rejection-date
├── form-header
│   ├── [key] form-title
│   ├── [key] status-badge [data-test-state="{status}"]
│   └── [key] autosave-indicator
├── category-field
│   └── [key] category-select
├── situation-field
│   ├── [key] situation-textarea
│   └── [key] situation-word-count
├── information-field
│   ├── [key] information-textarea
│   └── [key] information-word-count
├── solution-field
│   ├── [key] solution-textarea
│   └── [key] solution-word-count
└── form-actions
    ├── [key] cancel-button
    ├── [key] save-draft-button [data-test-state="ready"|"loading"]
    └── [key] submit-button [data-test-state="ready"|"loading"]
```

## Jerarquía: CSW View

```
csw-view
├── csw-header
│   ├── [key] csw-title
│   ├── [key] status-badge [data-test-state="{status}"]
│   └── [key] created-date
├── requester-info
│   ├── [key] requester-name
│   └── [key] requester-position
├── csw-content
│   ├── [key] category-value
│   ├── [key] progress-bar [data-test-state="0/3"|"1/3"|...]
│   ├── [key] situation-text
│   ├── [key] information-text
│   └── [key] solution-text
├── approval-chain
│   └── [key] approval-{level}
│       ├── [key] approver-name
│       ├── [key] approver-position
│       ├── [key] approval-status [data-test-state="pending"|"approved"|"rejected"]
│       └── [key] approval-comments
├── action-history
│   └── [key] history-{index}
│       ├── [key] history-action [data-test-state="{action}"]
│       ├── [key] history-by
│       ├── [key] history-comments
│       └── [key] history-date
└── approval-actions (solo aprobadores en nivel actual)
    ├── [key] comments-textarea
    ├── [key] approve-button
    └── [key] reject-button
```

---

## Prioridad de Implementación

### Bloque 1 — Flujos críticos (Login + CSW)
1. `SignIn.tsx` — Login form
2. `CSWForm.tsx` — Crear/editar solicitud
3. `CSWList.tsx` — Lista de solicitudes
4. `CSWView.tsx` — Detalle y aprobación

### Bloque 2 — CRUD principal
5. `EmployeesList.tsx` + `EmployeeFormModal.tsx`
6. `DivisionsList.tsx` + `DivisionFormModal.tsx`
7. `HatsList.tsx` + `HatForm.tsx`
8. `ProjectsList.tsx` + `ProjectFormModal.tsx`

### Bloque 3 — Secundarios
9. `Dashboard/Home.tsx`
10. `CalendarPage.tsx` + `EventsList.tsx`
11. `CSWCategoriesList.tsx`

### Bloque 4 — Componentes base
12. `SearchableSelect.tsx` — prop `data-test-key`
13. `Button.tsx` — prop `data-test-key`
14. `Modal.tsx` — `data-test-context`
15. `AppSidebar.tsx` + `Header.tsx`

---

## Convenciones

| Regla | Ejemplo |
|-------|---------|
| Contexts en kebab-case | `data-test-context="csw-form"` |
| Keys en kebab-case | `data-test-key="submit-button"` |
| Keys dinámicos con ID | `data-test-key="csw-6a3cc"` |
| States del vocabulario cerrado | `data-test-state="loading"` |
| IDs globales solo para elementos críticos | `data-test-id="global-logout"` |
| Nunca en elementos decorativos | No en `<hr>`, `<span>` con iconos |

---

**Total componentes a anotar: ~40 archivos**  
**Estimado: 4-6 horas de implementación**  
**Siguiente paso: Implementar Bloque 1 (Login + CSW)**
