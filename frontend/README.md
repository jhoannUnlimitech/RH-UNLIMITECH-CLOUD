# Frontend — RH Unlimitech Cloud

Aplicación React con MobX, Vite y TailwindCSS basada en TailAdmin Pro.

## Setup

```bash
cd frontend
npm install
npm run dev
```

**Puerto:** 5173

## Stack

| Tecnología | Uso |
|-----------|-----|
| React 18 | UI Components |
| MobX | State management (stores) |
| Vite | Build tool + HMR |
| TailwindCSS | Estilos utilitarios |
| React Router 7 | Navegación SPA |
| Axios | HTTP client (withCredentials) |
| FullCalendar | Módulo calendario |
| ApexCharts | Gráficas de productividad |
| Flatpickr | Date range pickers |

## Arquitectura de Stores

```
stores/views/
├── index.ts                    # Factory: crea instancias (live/mock)
├── AuthStore.contract.ts       # Interface
├── AuthStore.live.ts           # Implementación real (API)
├── AuthStore.mock.ts           # Implementación mock (dev)
├── CSWStore.contract.ts
├── CSWStore.live.ts
├── CSWStore.mock.ts
├── CSWCategoryStore.contract.ts
├── CSWCategoryStore.live.ts
└── ...
```

## Autenticación

- **Cookie httpOnly** — El backend envía `rh_auth_token` como cookie
- **Sin localStorage para tokens** — Solo cache de user data para fallback
- **ProtectedRoute** — Espera `checkAuth()` antes de decidir redirect
- **PermissionRoute** — Verifica permisos por recurso

## Componentes Reutilizables

| Componente | Uso |
|-----------|-----|
| SearchableSelect | Dropdowns con búsqueda |
| Badge | Estados con colores |
| Button | Primary, outline, variants |
| Alert | Notificaciones en contexto |
| Modal | Dialogs reutilizables |
| Pagination | Paginación con español |
| TableSkeleton | Loading state para tablas |
| PageBreadcrumb | Miga de pan (solo nav, sin título) |
| ErrorBoundary | Catch de errores global |
| Toast | Notificaciones flotantes (z-99999) |

## Páginas

| Ruta | Página | Permiso |
|------|--------|---------|
| `/` | Dashboard | Todos |
| `/employees` | Lista empleados | employees:read |
| `/divisions` | Lista divisiones | divisions:read |
| `/roles` | Lista hats | roles:read |
| `/projects` | Lista proyectos | projects:read |
| `/calendar` | Calendario | Todos |
| `/csw/my-requests` | Mis solicitudes | csw:read |
| `/csw/pending` | Pendientes de firma | csw:approve |
| `/csw/all` | Todas las solicitudes | Admin |
| `/csw/new` | Nueva solicitud | csw:create |
| `/csw-categories` | Categorías CSW | csw_categories:update |

## Diseño UI

- Modo claro + oscuro (ThemeContext)
- Logo dinámico por tema (sidebar)
- Patrón consistente: Breadcrumb → Título + Descripción + Botón → Contenido
- Iconos: SVG inline + icon library del template
- Responsive: mobile-first con breakpoints sm/xl
