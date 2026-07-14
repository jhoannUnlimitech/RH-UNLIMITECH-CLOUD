# Sistema de Gestión de RRHH - Frontend (rh-management-system)

## Información del Proyecto

**Nombre**: rh-management-system  
**Versión**: 1.0.0  
**Fecha de Inicio**: Enero 28, 2026  
**Framework Base**: TailAdmin Pro 2.2.0 (Dashboard Ecommerce)  
**Ubicación Frontend**: `/home/jeacosta37/RH-UNLIMITECH/frontend`  
**Stack Tecnológico**:
- React 19.0.0
- TypeScript 5.7.2
- Vite 6.1.0
- TailwindCSS 4.0.0
- TailAdmin Pro 2.2.0 (vía MCP Webforge)
- MobX 6.x + mobx-react-lite
- React Router 7.1.5
- ApexCharts (incluido en TailAdmin)

---

## Tabla de Contenidos

1. [Arquitectura del Frontend](#arquitectura-del-frontend)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Gestión de Estado con MobX](#gestión-de-estado-con-mobx)
4. [Componentes Canónicos vs Custom](#componentes-canónicos-vs-custom)
5. [Flujo de Trabajo con MCP Webforge](#flujo-de-trabajo-con-mcp-webforge)
6. [Reglas de Gobernanza (strongRules)](#reglas-de-gobernanza-strongrules)
7. [Módulos del Sistema](#módulos-del-sistema)
8. [Patrones de Desarrollo](#patrones-de-desarrollo)
9. [Guía de Desarrollo](#guía-de-desarrollo)
10. [Comandos Útiles](#comandos-útiles)

---

## Arquitectura del Frontend

### Visión General

El frontend del Sistema de Gestión de RRHH está construido sobre **TailAdmin Pro 2.2.0**, utilizando el dashboard de Ecommerce como base. La arquitectura sigue los principios de:

1. **Componentes Canónicos Primero**: Usar siempre componentes oficiales de TailAdmin antes de crear custom.
2. **MobX para Estado**: Todo el estado de la aplicación se gestiona con MobX siguiendo las reglas de `mobx.yml` y `mobx.rules.yml`.
3. **MCP Webforge**: Todos los componentes canónicos se obtienen a través del MCP de Webforge.
4. **TypeScript Strict**: Tipo seguro en toda la aplicación.
5. **Modularidad**: Cada módulo del sistema (Empleados, CSW, Capacitaciones) tiene su propia estructura de stores y componentes.

### Flujo de Datos

```
Usuario Interacción
       ↓
  Componente React (Observer)
       ↓
  MobX Store (Actions)
       ↓
  API Backend (fetch/axios)
       ↓
  MobX Store (Update State)
       ↓
  Re-render Automático (MobX)
```

---

## Estructura de Directorios

```
frontend/
├── public/                     # Assets estáticos
│   ├── images/
│   └── favicon.png
├── src/
│   ├── components/             # Componentes CANÓNICOS de TailAdmin
│   │   ├── ecommerce/          # Componentes de ecommerce (base)
│   │   ├── forms/              # Form components canónicos
│   │   ├── tables/             # Table components canónicos
│   │   ├── ui/                 # UI primitives (dropdowns, modals, etc.)
│   │   └── ... (otros componentes canónicos)
│   ├── components-custom/      # ⚠️ TODOS los componentes personalizados aquí
│   │   ├── employees/          # Componentes específicos de Empleados
│   │   ├── csw/                # Componentes de CSW
│   │   ├── training/           # Componentes de Capacitaciones
│   │   └── common/             # Componentes comunes del proyecto
│   ├── stores/                 # MobX Stores
│   │   ├── ui/                 # UI stores (sidebar, theme, etc.)
│   │   │   ├── AppUIStore.ts
│   │   │   └── AppUIProvider.tsx
│   │   └── views/              # View-specific stores
│   │       ├── EmployeesStore.ts
│   │       ├── CSWStore.ts
│   │       ├── TrainingStore.ts
│   │       └── DashboardStore.ts
│   ├── pages/                  # Page components (rutas)
│   │   ├── Employees/
│   │   ├── CSW/
│   │   ├── Training/
│   │   └── Dashboard/
│   ├── layout/                 # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   └── Backdrop.tsx
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types/interfaces
│   ├── api/                    # API clients y servicios
│   │   ├── client.ts           # Axios config
│   │   └── services/           # Service per module
│   │       ├── employees.ts
│   │       ├── csw.ts
│   │       └── training.ts
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── lean.yml                    # Limpieza del dashboard base
├── mobx.yml                    # Configuración de MobX
├── mobx.rules.yml              # Reglas de MobX stores
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

### ⚠️ REGLA CRÍTICA: Componentes Canónicos vs Custom

**NUNCA colocar componentes custom en `src/components/`**

- `src/components/`: SOLO componentes canónicos descargados del MCP Webforge
- `src/components-custom/`: TODOS los componentes personalizados del proyecto

---

## Gestión de Estado con MobX

### Configuración Base (mobx.yml)

El proyecto sigue estrictamente las fases definidas en `mobx.yml`:

1. **install-mobx**: ✅ Completado - mobx y mobx-react-lite instalados
2. **scaffold-app-ui-store**: AppUIStore y AppUIProvider en `src/stores/ui/`
3. **integrate-app-ui-store**: Integración en main.tsx, layouts, etc.
4. **wire-theme-toggles**: Conectar toggles de tema al store
5. **remove-legacy-contexts**: Eliminar SidebarContext y ThemeContext
6. **verify-build**: Validar build sin errores

### Reglas de MobX (mobx.rules.yml)

#### Stores Funcionales (Negocio)

Todos los stores funcionales (EmployeesStore, CSWStore, TrainingStore) DEBEN seguir:

**Estructura Triple**:
1. **Contract** (`*.contract.ts`): Interfaz + namespace con tipos
2. **Mock** (`*.mock.ts`): Implementación con datos de ejemplo
3. **Live** (`*.live.ts`): Implementación que conecta con API (inicialmente lanza Error)

**Ejemplo para EmployeesStore**:

```typescript
// src/stores/views/EmployeesStore.contract.ts
export interface IEmployeesStore {
  employees: IEmployeesStore.Employee[];
  isLoading: boolean;
  searchTerm: string;
  selectedDivision: string | null;
  
  fetchEmployees(): Promise<void>;
  setSearchTerm(term: string): void;
  setDivision(divisionId: string | null): void;
  
  get filteredEmployees(): IEmployeesStore.Employee[];
}

export namespace IEmployeesStore {
  export interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    division: string;
    photo?: string; // Base64
    birthDate: Date;
    nationalId: string;
    phone: string;
    nationality: string;
    managerId?: string;
  }
  
  export const Roles = {
    AI_DRIVEN_QA: 'AI DRIVEN QA',
    AI_DRIVEN_DEVELOPER: 'AI DRIVEN DEVELOPER',
    AI_DRIVEN_ENGINEER: 'AI DRIVEN ENGINEER',
    ARCHITECT_TECHNICAL: 'ARCHITECT TECHNICAL',
    ARCHITECT_SOLUTIONS: 'ARCHITECT SOLUTIONS',
    HUMAN_TALENT: 'HUMAN TALENT',
  } as const;
}

// src/stores/views/EmployeesStore.mock.ts
import { makeAutoObservable } from 'mobx';
import { IEmployeesStore } from './EmployeesStore.contract';

export class EmployeesStoreMock implements IEmployeesStore {
  employees: IEmployeesStore.Employee[] = [
    {
      id: '1',
      name: 'Jordan Blake',
      email: 'jordan.blake@example.com',
      role: IEmployeesStore.Roles.AI_DRIVEN_DEVELOPER,
      division: '1',
      birthDate: new Date('1990-05-15'),
      nationalId: '1234567890',
      phone: '+1234567890',
      nationality: 'Generic Country',
    },
    // ... más datos ficticios
  ];
  
  isLoading = false;
  searchTerm = '';
  selectedDivision: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchEmployees() {
    this.isLoading = true;
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    // Los datos ya están en this.employees
    this.isLoading = false;
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  setDivision(divisionId: string | null) {
    this.selectedDivision = divisionId;
  }

  get filteredEmployees() {
    return this.employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDivision = !this.selectedDivision || emp.division === this.selectedDivision;
      return matchesSearch && matchesDivision;
    });
  }
}

// src/stores/views/EmployeesStore.live.ts
import { makeAutoObservable } from 'mobx';
import { IEmployeesStore } from './EmployeesStore.contract';

export class EmployeesStoreLive implements IEmployeesStore {
  employees: IEmployeesStore.Employee[] = [];
  isLoading = false;
  searchTerm = '';
  selectedDivision: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchEmployees() {
    throw new Error('EmployeesStoreLive.fetchEmployees: Not implemented');
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  setDivision(divisionId: string | null) {
    this.selectedDivision = divisionId;
  }

  get filteredEmployees() {
    return this.employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDivision = !this.selectedDivision || emp.division === this.selectedDivision;
      return matchesSearch && matchesDivision;
    });
  }
}

// src/stores/views/index.ts
import { IEmployeesStore } from './EmployeesStore.contract';
import { EmployeesStoreMock } from './EmployeesStore.mock';
import { EmployeesStoreLive } from './EmployeesStore.live';

export function createEmployeesStore(mode: 'mock' | 'live' = 'mock'): IEmployeesStore {
  return mode === 'mock' ? new EmployeesStoreMock() : new EmployeesStoreLive();
}

export const employeesStore = createEmployeesStore('mock');
```

#### Stores de UI (Simple Toggle Stores)

Los stores puramente de UI (sidebar, theme, modals) NO necesitan la arquitectura contract/mock/live:

```typescript
// src/stores/ui/AppUIStore.ts
import { makeAutoObservable } from 'mobx';

export class AppUIStore {
  isSidebarExpanded = true;
  isMobileOpen = false;
  theme: 'light' | 'dark' = 'light';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.theme = savedTheme;
    }
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    document.documentElement.classList.toggle('dark', this.theme === 'dark');
  }
}

export const appUIStore = new AppUIStore();
```

### Uso en Componentes

```typescript
import { observer } from 'mobx-react-lite';
import { employeesStore } from '@/stores/views';

export const EmployeesTable: React.FC = observer(() => {
  const store = employeesStore;
  
  return (
    <div>
      <input 
        value={store.searchTerm}
        onChange={(e) => store.setSearchTerm(e.target.value)}
      />
      {store.filteredEmployees.map(emp => (
        <div key={emp.id}>{emp.name}</div>
      ))}
    </div>
  );
});
```

---

## Componentes Canónicos vs Custom

### Componentes Canónicos (src/components/)

**Origen**: Descargados del MCP Webforge usando `fs_get_file`  
**Propósito**: Componentes oficiales de TailAdmin Pro 2.2.0  
**Regla**: NUNCA modificar. Si necesitas cambios, crea un componente custom que extienda el canónico.

**Componentes Disponibles**:
- **Forms**: `src/components/form/` (inputs, select, checkbox, file upload, etc.)
- **Tables**: `src/components/tables/` (BasicTables, DataTables con paginación)
- **UI**: `src/components/ui/` (dropdowns, modals, badges, alerts, etc.)
- **Charts**: `src/components/charts/` (line, bar, pie charts con ApexCharts)
- **Cards**: `src/components/cards/` (diversos estilos de cards)

**Cómo Obtener Componentes Canónicos**:

```bash
# 1. Buscar componente en MCP
mcp_webforge_util_search { query: "table pagination" }

# 2. Obtener detalles del componente
mcp_webforge_ui_components_explain_choice { componentId: "react/src/components/tables/DataTables/TableOne/DataTableOne" }

# 3. Descargar con fs_get_file usando file.path y file.mode de la respuesta
mcp_webforge_fs_get_file { 
  path: "src/components/tables/DataTables/TableOne/DataTableOne.tsx",
  mode: "full"
}

# 4. Guardar en src/components/ respetando la estructura original
```

### Componentes Custom (src/components-custom/)

**Ubicación Obligatoria**: `src/components-custom/`  
**Propósito**: Componentes específicos del proyecto de RRHH  
**Regla**: Extender o componer componentes canónicos, nunca reemplazarlos

**Ejemplo: EmployeeCard**

```typescript
// src/components-custom/employees/EmployeeCard.tsx
import CardOne from '@/components/cards/card-with-image/CardOne';
import Badge from '@/components/ui/badge/Badge';
import { IEmployeesStore } from '@/stores/views/EmployeesStore.contract';

interface EmployeeCardProps {
  employee: IEmployeesStore.Employee;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * EmployeeCard - Tarjeta para mostrar información de empleados
 * 
 * Basado en: CardOne (canónico)
 * Extiende con: Badge para roles, acciones específicas de empleados
 */
export const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onEdit, 
  onDelete 
}) => {
  const initials = employee.name.split(' ').map(n => n[0]).join('');
  const photoSrc = employee.photo || `https://ui-avatars.com/api/?name=${initials}`;

  return (
    <CardOne
      title={employee.name}
      image={photoSrc}
    >
      <div className="space-y-2">
        <Badge variant="primary">{employee.role}</Badge>
        <p className="text-sm text-gray-600">{employee.email}</p>
        <p className="text-sm text-gray-600">División: {employee.division}</p>
        
        <div className="flex gap-2 mt-4">
          {onEdit && (
            <button onClick={onEdit} className="btn-primary">
              Editar
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="btn-danger">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </CardOne>
  );
};
```

---

## Flujo de Trabajo con MCP Webforge

### Conexión con MCP

El MCP (Model Context Protocol) Webforge proporciona acceso al catálogo completo de TailAdmin Pro 2.2.0.

**Herramientas Clave**:

1. **sys_autodiscovery**: Obtener estado del MCP y reglas activas
2. **util_search**: Búsqueda multi-catálogo
3. **ui_components_list**: Listar componentes con IDs deterministas
4. **ui_components_explain_choice**: Obtener detalles completos de un componente
5. **ui_components_compare**: Comparar múltiples componentes
6. **fs_get_file**: Descargar archivos usando path/mode/sha256

### Workflow de Descubrimiento

**Paso 1: Buscar Componente**

```typescript
// Ejemplo: Necesitas un componente de tabla con paginación
mcp_webforge_util_search({
  query: "table pagination filter",
  includeStructure: true,
  output: "content"
})
```

**Respuesta incluirá**:
- Lista de componentes relevantes
- IDs deterministas
- Metadata (file.path, file.mode, file.sha256)
- Tokens y synonyms

**Paso 2: Analizar Opciones**

```typescript
// Obtener detalles completos
mcp_webforge_ui_components_explain_choice({
  componentId: "react/src/components/tables/DataTables/TableOne/DataTableOne",
  output: "content"
})
```

**Paso 3: Comparar Alternativas (Opcional)**

```typescript
// Comparar 2-5 componentes
mcp_webforge_ui_components_compare({
  candidates: [
    "react/src/components/tables/DataTables/TableOne/DataTableOne",
    "react/src/components/tables/DataTables/TableTwo/DataTableTwo",
    "react/src/components/tables/DataTables/TableThree/DataTableThree"
  ],
  output: "content"
})
```

**Paso 4: Descargar Componente**

```typescript
// Usar file.path y file.mode de la respuesta
mcp_webforge_fs_get_file({
  path: "src/components/tables/DataTables/TableOne/DataTableOne.tsx",
  mode: "full",
  sha256: "abc123..." // opcional pero recomendado
})
```

**Paso 5: Guardar en Estructura Correcta**

```bash
# El componente se guarda respetando la estructura original:
frontend/src/components/tables/DataTables/TableOne/DataTableOne.tsx
```

### Reglas de Materialización

1. **SIEMPRE usar fs_get_file** con metadata del MCP (no copiar código manualmente)
2. **Respetar la estructura de carpetas** original del componente
3. **NO modificar** componentes canónicos descargados
4. **Documentar** la relación entre componentes custom y canónicos

---

## Reglas de Gobernanza (strongRules)

Estas reglas son **OBLIGATORIAS** y provienen del MCP Webforge:

### 1. MCP-First Principle
**Regla**: Always consult this MCP before materialising code; every decision must align with the active theme and dataset.

**Aplicación**: Antes de crear cualquier componente, buscar en el MCP si existe uno canónico.

### 2. Autodiscovery Refresh
**Regla**: Refresh `sys_autodiscovery` before any new materialisation or synthesis to work with the latest state.

**Aplicación**: Al inicio de cada sesión de desarrollo, ejecutar `sys_autodiscovery` para obtener el estado actual.

### 3. Follow Workflows
**Regla**: Follow the MCP-recommended workflows for known activities before improvising alternatives.

**Aplicación**: Usar el flujo Discovery → Deep-dive → Compare → Materialize documentado arriba.

### 4. Canonical Paths
**Regla**: Materialise every canonical component under `src/components/` before using or extending it.

**Aplicación**: NUNCA colocar componentes canónicos en `src/components-custom/`.

### 5. File System Access
**Regla**: Respect `assertFsPath`: only the dataset-declared paths are permitted.

**Aplicación**: Validar paths antes de escribir archivos.

### 6. Signed URL Expiry
**Regla**: `bundle.signedUrl` links expire quickly; request a new one before attempting direct access after a failure.

**Aplicación**: Si un download falla, volver a llamar `ui_app_create` para obtener nuevo URL.

### 7. Evidence-First
**Regla**: Every recommendation must cite the identifiers, paths, and hashes provided in MCP responses.

**Aplicación**: Documentar siempre el componentId y file.path de componentes usados.

### 8. Custom Components
**Regla**: Store any specialised or derived component in `src/components/custom/`.

**Aplicación**: En este proyecto es `src/components-custom/`.

### 9. Synthesized Components
**Regla**: New components synthesised from the theme belong in `src/components/custom/` and must build on the original capabilities.

**Aplicación**: Los componentes custom deben EXTENDER, no reemplazar, los canónicos.

### 10. External Capabilities
**Regla**: Only extrapolate with external capabilities when the requirement is explicitly out of scope and document the rationale.

**Aplicación**: TailAdmin ya incluye ApexCharts, FullCalendar, etc. No agregar librerías externas sin justificación.

### 11. Styles Precedence
**Regla**: When you need utility classes, prioritise the style dataset (`ui_styles_list`, `ui_styles_search`) and keep a custom sheet separate from the originals.

**Aplicación**: Usar clases de Tailwind de TailAdmin. Si necesitas custom, crear `src/styles/custom.css`.

### 12. Fictional Data Only
**Regla**: All mock/example data in MobX stores and components **MUST** use fictional, random, or generic data. **NEVER** use real names, company names, email addresses, or any personally identifiable information (PII).

**Aplicación**: 
```typescript
// ✅ CORRECTO
const exampleData = [
  { name: 'Jordan Blake', email: 'jordan.blake@example.com' },
  { name: 'Alex Rivera', email: 'alex.rivera@example.com' }
];

// ❌ INCORRECTO
const exampleData = [
  { name: 'Rob Skinner', email: 'rob@actualcompany.com' },
  { name: 'Joe Henderson', email: 'joe@realcompany.com' }
];
```

---

## Módulos del Sistema

### Módulo: Empleados (Core)

**Ubicación**: 
- Stores: `src/stores/views/EmployeesStore.{contract,mock,live}.ts`
- Pages: `src/pages/Employees/`
- Components Custom: `src/components-custom/employees/`

**Funcionalidades**:
1. **CRUD de Empleados**
   - Crear empleado con foto (Base64 opcional, iniciales por defecto)
   - Editar empleado (incluido cambio de foto desde perfil)
   - Eliminar empleado (soft delete)
   - Listar empleados con filtros por división/cargo

2. **Datos del Empleado**:
   ```typescript
   interface Employee {
     id: string;
     photo?: string; // Base64
     name: string;
     email: string;
     role: string; // AI DRIVEN QA, AI DRIVEN DEVELOPER, etc.
     division: string; // 1-10 con responsable
     birthDate: Date;
     nationalId: string;
     phone: string;
     nationality: string;
     managerId?: string; // Jefe directo
   }
   ```

3. **Sub-módulos**:
   - **Cargos**: Gestión de roles/cargos del sistema
   - **Permisos**: Sistema de permisos y grupos (ej. grupo "Developers" con mismas vistas)

**Componentes Necesarios**:
- Tabla de empleados con filtros (usar DataTable canónico)
- Modal para crear/editar empleado (usar Form canónico + Modal canónico)
- Componente de foto con iniciales (custom)
- Selector de división (usar Select canónico)
- Selector de cargo (usar Select canónico)

**Store Structure**:
```typescript
interface IEmployeesStore {
  // State
  employees: Employee[];
  divisions: Division[];
  roles: Role[];
  isLoading: boolean;
  searchTerm: string;
  selectedDivision: string | null;
  selectedRole: string | null;
  
  // Actions
  fetchEmployees(): Promise<void>;
  createEmployee(data: CreateEmployeeDTO): Promise<void>;
  updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<void>;
  deleteEmployee(id: string): Promise<void>;
  setSearchTerm(term: string): void;
  setDivision(id: string | null): void;
  setRole(role: string | null): void;
  
  // Computed
  get filteredEmployees(): Employee[];
  get employeesByDivision(): Map<string, Employee[]>;
}
```

---

### Módulo: CSW (Completed Staff Work)

**Ubicación**:
- Stores: `src/stores/views/CSWStore.{contract,mock,live}.ts`
- Pages: `src/pages/CSW/`
- Components Custom: `src/components-custom/csw/`

**Funcionalidades**:

1. **Flujo de Aprobación Secuencial**:
   ```
   Solicitante (Empleado)
       ↓
   Líder Técnico → Aprueba/Rechaza
       ↓
   Arquitecto Técnico → Aprueba/Rechaza
       ↓
   Arquitecto de Soluciones → Aprueba/Rechaza
       ↓
   Talento Humano (Laura) → Aprueba/Rechaza (Final)
   ```

2. **Visibilidad**:
   - Una solicitud solo es visible para el aprobador actual
   - El aprobador actual solo puede ver si el anterior aprobó
   - Ejemplo: Si Líder Técnico aprobó, Arquitecto Técnico ve la solicitud. Talento Humano NO la ve hasta que Arquitecto de Soluciones apruebe.

3. **Datos de Solicitud CSW**:
   ```typescript
   interface CSWRequest {
     id: string;
     from: {
       employeeId: string;
       name: string;
       role: string;
       requestDate: Date;
     };
     to: string[]; // IDs de aprobadores
     dateRange: {
       from: Date;
       to: Date;
     };
     situation: string; // Texto área
     information: string; // Texto área
     solution: string; // Texto área
     signature: string; // Nombre del solicitante en Playwrite Australia Tasmania - Thin 100
     approvals: Approval[];
     status: 'pending' | 'approved' | 'rejected';
   }
   
   interface Approval {
     approverId: string;
     status: 'pending' | 'approved' | 'rejected';
     comment?: string;
     date?: Date;
   }
   ```

4. **Componentes Necesarios**:
   - Formulario de solicitud CSW (form canónico + custom layout)
   - Tabla de solicitudes pendientes (DataTable canónico)
   - Modal de revisión/aprobación (Modal canónico)
   - Componente de firma con tipografía especial (custom)
   - Stepper para mostrar flujo de aprobación (custom basado en UI canónico)

**Store Structure**:
```typescript
interface ICSWStore {
  // State
  requests: CSWRequest[];
  myRequests: CSWRequest[];
  pendingApprovals: CSWRequest[];
  isLoading: boolean;
  currentUserId: string;
  
  // Actions
  fetchRequests(): Promise<void>;
  createRequest(data: CreateCSWDTO): Promise<void>;
  approveRequest(id: string, comment?: string): Promise<void>;
  rejectRequest(id: string, comment: string): Promise<void>;
  
  // Computed
  get visibleRequests(): CSWRequest[]; // Según permisos del usuario
  get nextApprover(): string | null;
}
```

---

### Módulo: Capacitaciones (Training)

**Ubicación**:
- Stores: `src/stores/views/TrainingStore.{contract,mock,live}.ts`
- Pages: `src/pages/Training/`
- Components Custom: `src/components-custom/training/`

**Funcionalidades**:

1. **Dashboard Interno**:
   - Gráficas de History Points (HP) semanales
   - Lista de empleados en cursos activos
   - Progreso general del equipo

2. **Sub-módulo: Cursos**:
   ```typescript
   interface Course {
     id: string;
     title: string;
     description: string;
     type: 'link' | 'document';
     content: string; // URL o path del documento
     hasExam: boolean;
     examId?: string;
     createdAt: Date;
   }
   ```
   - Crear curso con link o documento adjunto
   - Asignar examen final al curso

3. **Sub-módulo: Listado de Personas en Curso**:
   ```typescript
   interface EmployeeCourse {
     employeeId: string;
     courseId: string;
     status: 'in-progress' | 'completed' | 'failed';
     assignedDate: Date;
     lastReport: Date;
     historyPoints: number; // 1 HP = 30 minutos
   }
   ```
   - Ver empleados asignados a cursos
   - Estado del curso
   - Contador de History Points

4. **Sub-módulo: Reporte de Estudio**:
   ```typescript
   interface StudyReport {
     id: string;
     employeeId: string;
     date: Date;
     type: 'curso-academia' | 'manejo-etica';
     hours: number; // En History Points
     reference: string; // En qué referencia quedaste
     difficulties?: string;
     learnings?: string;
   }
   ```
   - Formulario de reporte diario
   - Campo de fecha
   - Selector tipo de estudio
   - Input de horas (en HP)
   - Campo de referencia alcanzada
   - Campos opcionales de dificultades y aprendizajes
   - Histórico de reportes del empleado

5. **Sub-módulo: Exámenes**:
   ```typescript
   interface Exam {
     id: string;
     courseId: string;
     title: string;
     type: 'multiple-choice' | 'essay';
     questions: Question[];
     createdAt: Date;
   }
   
   interface EmployeeExam {
     id: string;
     employeeId: string;
     examId: string;
     status: 'pending' | 'submitted' | 'approved' | 'needs-correction';
     answers: Answer[];
     feedback?: string;
     grade?: number;
     submittedAt?: Date;
     reviewedAt?: Date;
   }
   ```
   - Crear examen (opción múltiple o ensayo)
   - Asignar examen a curso
   - Empleado realiza examen
   - Calidad revisa y califica
   - Estados: Pendiente / Aprobado / Debe Corregir

6. **Gráficas**:
   - Usar ApexCharts (ya incluido en TailAdmin)
   - Comparativa semanal (miércoles a miércoles) de HP acumulados
   - Gráfica de barras por empleado

**Componentes Necesarios**:
- Dashboard con métricas (usar CardOne canónico + custom charts)
- Tabla de cursos (DataTable canónico)
- Form de creación de curso (Form canónico + FileInput para documentos)
- Tabla de empleados en curso (DataTable canónico)
- Form de reporte de estudio (Form canónico + custom validations)
- Gráfica de HP semanal (ApexCharts canónico)
- Form de creación de examen (Form canónico + custom question builder)
- Vista de examen para empleado (custom basado en Form canónico)
- Vista de corrección para calidad (custom)

**Store Structure**:
```typescript
interface ITrainingStore {
  // State
  courses: Course[];
  employeeCourses: EmployeeCourse[];
  studyReports: StudyReport[];
  exams: Exam[];
  employeeExams: EmployeeExam[];
  isLoading: boolean;
  
  // Actions
  fetchCourses(): Promise<void>;
  createCourse(data: CreateCourseDTO): Promise<void>;
  assignCourse(employeeId: string, courseId: string): Promise<void>;
  submitStudyReport(data: CreateStudyReportDTO): Promise<void>;
  createExam(data: CreateExamDTO): Promise<void>;
  submitExam(examId: string, answers: Answer[]): Promise<void>;
  reviewExam(examId: string, grade: number, feedback: string): Promise<void>;
  
  // Computed
  get weeklyHPStats(): Map<string, number>; // employeeId -> HP
  get employeesInProgress(): EmployeeCourse[];
}
```

---

## Patrones de Desarrollo

### Patrón 1: Tabla con Filtros y Paginación

**Componentes Canónicos Necesarios**:
- `src/components/tables/DataTables/TableOne/DataTableOne.tsx`
- `src/components/tables/DataTables/TableOne/PaginationWithIcon.tsx`
- `src/components/form/Select.tsx` (para filtros)
- `src/components/form/InputField.tsx` (para búsqueda)

**Implementación**:

```typescript
// src/pages/Employees/EmployeesTable.tsx
import { observer } from 'mobx-react-lite';
import { employeesStore } from '@/stores/views';
import DataTableOne from '@/components/tables/DataTables/TableOne/DataTableOne';
import InputField from '@/components/form/InputField';
import Select from '@/components/form/Select';

export const EmployeesTable: React.FC = observer(() => {
  const store = employeesStore;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4">
        <InputField
          label="Buscar"
          value={store.searchTerm}
          onChange={(e) => store.setSearchTerm(e.target.value)}
          placeholder="Nombre o email..."
        />
        <Select
          label="División"
          value={store.selectedDivision || ''}
          onChange={(e) => store.setDivision(e.target.value || null)}
          options={[
            { value: '', label: 'Todas las divisiones' },
            ...store.divisions.map(d => ({ value: d.id, label: d.name }))
          ]}
        />
      </div>

      {/* Tabla */}
      <DataTableOne
        data={store.filteredEmployees}
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Cargo' },
          { key: 'division', label: 'División' },
        ]}
        onRowClick={(employee) => console.log('Edit:', employee.id)}
      />
    </div>
  );
});
```

### Patrón 2: Formulario Modal

**Componentes Canónicos Necesarios**:
- `src/components/ui/modal/index.tsx`
- `src/components/form/Form.tsx`
- `src/components/form/InputField.tsx`
- `src/components/form/Select.tsx`
- `src/components/ui/button/Button.tsx`

**Implementación**:

```typescript
// src/components-custom/employees/CreateEmployeeModal.tsx
import { useState } from 'react';
import Modal from '@/components/ui/modal';
import Form from '@/components/form/Form';
import InputField from '@/components/form/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { employeesStore } from '@/stores/views';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    division: '',
    // ... más campos
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await employeesStore.createEmployee(formData);
    onClose();
    setFormData({ name: '', email: '', role: '', division: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Empleado">
      <Form onSubmit={handleSubmit}>
        <InputField
          label="Nombre Completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <InputField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Select
          label="Cargo"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={[
            { value: 'AI DRIVEN DEVELOPER', label: 'AI Driven Developer' },
            { value: 'AI DRIVEN QA', label: 'AI Driven QA' },
            // ... más roles
          ]}
          required
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Crear Empleado
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
```

### Patrón 3: Dashboard con Métricas

**Componentes Canónicos Necesarios**:
- `src/components/ecommerce/EcommerceMetrics.tsx` (como referencia)
- `src/components/cards/card-with-icon/CardIconOne.tsx`
- `src/components/charts/line/LineChartOne.tsx`

**Implementación**:

```typescript
// src/pages/Training/TrainingDashboard.tsx
import { observer } from 'mobx-react-lite';
import { trainingStore } from '@/stores/views';
import CardIconOne from '@/components/cards/card-with-icon/CardIconOne';
import LineChartOne from '@/components/charts/line/LineChartOne';

export const TrainingDashboard: React.FC = observer(() => {
  const store = trainingStore;

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardIconOne
          title="Cursos Activos"
          value={store.courses.length.toString()}
          icon={<BookIcon />}
        />
        <CardIconOne
          title="Empleados Estudiando"
          value={store.employeesInProgress.length.toString()}
          icon={<UserIcon />}
        />
        <CardIconOne
          title="HP Esta Semana"
          value={store.weeklyHPStats.size.toString()}
          icon={<ClockIcon />}
        />
      </div>

      {/* Gráfica Semanal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          History Points Semanales
        </h3>
        <LineChartOne
          data={prepareChartData(store.weeklyHPStats)}
        />
      </div>
    </div>
  );
});
```

---

## Guía de Desarrollo

### Proceso de Implementación de un Módulo

#### Fase 1: Diseño del Store

1. **Crear Contract** (`*.contract.ts`)
   - Definir interface del store
   - Crear namespace con tipos y constantes
   - Documentar métodos y computed properties

2. **Crear Mock** (`*.mock.ts`)
   - Implementar con datos ficticios (NUNCA PII real)
   - Simular delays de red con `setTimeout`
   - Datos suficientes para probar todas las funcionalidades

3. **Crear Live** (`*.live.ts`)
   - Implementar estructura básica
   - Lanzar `Error('Not implemented')` en métodos
   - Se implementará cuando backend esté listo

4. **Crear Factory** (`index.ts`)
   - Función `createXxxStore(mode: 'mock' | 'live')`
   - Exportar instancia singleton con modo 'mock' por defecto

#### Fase 2: Descubrir Componentes Canónicos

1. **Identificar Necesidades**
   - Tabla? Formulario? Modal? Gráfica?
   - Listar componentes UI necesarios

2. **Buscar en MCP**
   ```typescript
   mcp_webforge_util_search({
     query: "table with pagination and filters",
     includeStructure: true
   })
   ```

3. **Analizar y Comparar**
   ```typescript
   mcp_webforge_ui_components_explain_choice({
     componentId: "react/src/components/tables/DataTables/TableOne/DataTableOne"
   })
   ```

4. **Descargar Componentes**
   ```typescript
   mcp_webforge_fs_get_file({
     path: "src/components/tables/DataTables/TableOne/DataTableOne.tsx",
     mode: "full"
   })
   ```

5. **Guardar en Estructura Correcta**
   - Respetar path original
   - Guardar en `src/components/`

#### Fase 3: Crear Componentes Custom

1. **Ubicación**: `src/components-custom/<modulo>/`
   
2. **Nomenclatura**:
   - PascalCase: `EmployeeCard.tsx`
   - Descriptivo: `CreateEmployeeModal.tsx`

3. **Estructura del Archivo**:
   ```typescript
   import { observer } from 'mobx-react-lite';
   import CanonicalComponent from '@/components/...';
   import { store } from '@/stores/views';
   
   interface ComponentProps {
     // Props tipadas
   }
   
   /**
    * Documentación JSDoc
    * 
    * Basado en: CanonicalComponent (canónico)
    * Extiende con: Funcionalidad específica
    */
   export const CustomComponent: React.FC<ComponentProps> = observer((props) => {
     const storeInstance = store;
     
     // Lógica del componente
     
     return (
       <CanonicalComponent>
         {/* Custom content */}
       </CanonicalComponent>
     );
   });
   ```

4. **Usar Observer**:
   - Siempre envolver con `observer()` si consume stores

#### Fase 4: Crear Páginas

1. **Ubicación**: `src/pages/<Modulo>/`

2. **Estructura**:
   ```typescript
   // src/pages/Employees/EmployeesPage.tsx
   import { observer } from 'mobx-react-lite';
   import PageMeta from '@/components/common/PageMeta';
   import PageBreadCrumb from '@/components/common/PageBreadCrumb';
   import { EmployeesTable } from '@/components-custom/employees/EmployeesTable';
   import { CreateEmployeeModal } from '@/components-custom/employees/CreateEmployeeModal';
   import { employeesStore } from '@/stores/views';
   
   export const EmployeesPage: React.FC = observer(() => {
     const store = employeesStore;
     
     return (
       <>
         <PageMeta title="Empleados | RH Management" />
         <PageBreadCrumb pageName="Empleados" />
         
         <div className="space-y-6">
           <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold">Gestión de Empleados</h1>
             <button onClick={() => store.openCreateModal()}>
               Nuevo Empleado
             </button>
           </div>
           
           <EmployeesTable />
           
           <CreateEmployeeModal 
             isOpen={store.isCreateModalOpen}
             onClose={() => store.closeCreateModal()}
           />
         </div>
       </>
     );
   });
   ```

#### Fase 5: Integrar Rutas

1. **Actualizar** `src/App.tsx`:
   ```typescript
   import { EmployeesPage } from './pages/Employees/EmployeesPage';
   
   // En el Router
   <Route path="/employees" element={<EmployeesPage />} />
   ```

2. **Actualizar Sidebar** `src/layout/AppSidebar.tsx`:
   ```typescript
   const navItems = [
     {
       icon: <UserIcon />,
       name: "Empleados",
       path: "/employees",
     },
     // ... otros items
   ];
   ```

#### Fase 6: Validación

1. **Ejecutar dev server**:
   ```bash
   cd /home/jeacosta37/RH-UNLIMITECH/frontend
   npm run dev
   ```

2. **Verificar**:
   - No hay errores de TypeScript
   - El store se actualiza correctamente
   - Los componentes se renderizan
   - Las interacciones funcionan

3. **Build**:
   ```bash
   npm run build
   ```
   - Debe completar sin errores
   - No warnings de CSS

---

## Comandos Útiles

### Desarrollo

```bash
# Iniciar dev server
cd /home/jeacosta37/RH-UNLIMITECH/frontend
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### MCP Webforge (via Copilot)

```typescript
// Buscar componente
mcp_webforge_util_search({ query: "tu búsqueda", includeStructure: true })

// Listar componentes
mcp_webforge_ui_components_list({ framework: "react", includeStructure: true })

// Detalles de componente
mcp_webforge_ui_components_explain_choice({ componentId: "react/src/..." })

// Descargar componente
mcp_webforge_fs_get_file({ path: "src/components/...", mode: "full" })

// Estado del MCP
mcp_webforge_sys_autodiscovery({ output: "content" })
```

### Git

```bash
# Inicializar repo
cd /home/jeacosta37/RH-UNLIMITECH
git init
git add .
git commit -m "Initial commit: Frontend scaffold with TailAdmin Pro 2.2.0"

# Branches recomendados
git checkout -b develop
git checkout -b feature/module-employees
git checkout -b feature/module-csw
git checkout -b feature/module-training
```

---

## Checklist de Inicio de Sesión

Antes de empezar a desarrollar cada día:

- [ ] Ejecutar `sys_autodiscovery` para obtener estado actual del MCP
- [ ] Revisar `mobx.yml` y `mobx.rules.yml` para recordar reglas
- [ ] Verificar que las dependencias están actualizadas
- [ ] Ejecutar `npm run dev` y verificar que no hay errores
- [ ] Revisar TODO list del proyecto

---

## Próximos Pasos

### Inmediato (Fase Frontend)

1. ✅ Estructura de carpetas creada
2. ✅ TailAdmin Pro descargado y configurado
3. ✅ MobX instalado
4. ✅ Documentación AGENTS-FRONTEND.md creada
5. ⏳ **Validar que `npm run dev` funciona**
6. ⏳ Crear estructura inicial de stores UI (AppUIStore)
7. ⏳ Implementar primer módulo (Empleados) con mock data

### Siguiente Fase (Backend)

1. Crear estructura de backend
2. Configurar MongoDB con Docker Compose
3. Implementar modelos con Mongoose
4. Crear API REST
5. Documentación AGENTS-BACKEND.md

---

## Soporte y Recursos

### Documentación Oficial

- **TailAdmin Pro**: [Docs incluidas en el proyecto]
- **MobX**: https://mobx.js.org/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vitejs.dev/
- **TailwindCSS**: https://tailwindcss.com/docs

### Contacto

Para dudas o asistencia con el proyecto, consultar con el arquitecto de soluciones o el líder técnico del equipo.

---

**Última Actualización**: Enero 28, 2026  
**Versión del Documento**: 1.0.0  
**Autor**: AI Agent (GitHub Copilot con Claude Sonnet 4.5)
