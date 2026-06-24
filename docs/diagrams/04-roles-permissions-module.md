# Módulo de Roles y Permisos

## Arquitectura del Sistema de Permisos

```mermaid
graph TB
    subgraph "Frontend"
        ROLE_PAGE[Roles Page]
        ROLE_FORM[Role Form]
        PERM_SELECTOR[Permission Selector]
        USE_PERM[usePermissions Hook]
        PROTECTED[ProtectedRoute]
        TABLE_ACTIONS[TableActions]
    end
    
    subgraph "Backend"
        ROLE_ROUTES[/api/v1/roles]
        PERM_ROUTES[/api/v1/permissions]
        ROLE_CTRL[RolesController]
        PERM_CTRL[PermissionsController]
        ROLE_MODEL[Role Model]
        PERM_MODEL[Permission Model]
    end
    
    subgraph "Middleware"
        AUTH_MW[Auth Middleware]
        PERM_MW[Permission Middleware]
    end
    
    subgraph "Models"
        EMPLOYEE[Employee Model]
    end
    
    ROLE_PAGE --> ROLE_FORM
    ROLE_PAGE --> USE_PERM
    ROLE_FORM --> PERM_SELECTOR
    
    USE_PERM --> PROTECTED
    USE_PERM --> TABLE_ACTIONS
    
    ROLE_PAGE --> ROLE_ROUTES
    PERM_SELECTOR --> PERM_ROUTES
    
    ROLE_ROUTES --> AUTH_MW
    PERM_ROUTES --> AUTH_MW
    AUTH_MW --> PERM_MW
    PERM_MW --> ROLE_CTRL
    PERM_MW --> PERM_CTRL
    
    ROLE_CTRL --> ROLE_MODEL
    PERM_CTRL --> PERM_MODEL
    
    ROLE_MODEL --> PERM_MODEL
    EMPLOYEE --> ROLE_MODEL
    
    style ROLE_PAGE fill:#2196f3
    style PERM_MW fill:#f44336
    style ROLE_MODEL fill:#4caf50
```

## Modelo de Datos

```mermaid
erDiagram
    ROLE {
        ObjectId _id PK
        string name UK
        string description
        array permissionIds FK
        boolean active
        boolean deleted
        date createdAt
        date updatedAt
    }
    
    PERMISSION {
        ObjectId _id PK
        string resource
        string action
        string description
        boolean active
    }
    
    EMPLOYEE {
        ObjectId _id PK
        string name
        string email
        ObjectId roleId FK
        ObjectId divisionId FK
    }
    
    ROLE ||--|{ PERMISSION : "tiene"
    EMPLOYEE ||--o| ROLE : "asignado"
```

## Estructura de Permisos

```mermaid
graph TB
    PERM[Permission]
    
    PERM --> RESOURCE[Resource]
    PERM --> ACTION[Action]
    
    RESOURCE --> RES_EMP[employees]
    RESOURCE --> RES_DIV[divisions]
    RESOURCE --> RES_ROLES[roles]
    RESOURCE --> RES_PERM[permissions]
    RESOURCE --> RES_CSW[csw]
    RESOURCE --> RES_CAT[csw_categories]
    RESOURCE --> RES_FLOW[approval_flows]
    RESOURCE --> RES_TRAIN[training]
    RESOURCE --> RES_POL[policies]
    RESOURCE --> RES_TASK[tasks]
    
    ACTION --> ACT_READ[read]
    ACTION --> ACT_CREATE[create]
    ACTION --> ACT_UPDATE[update]
    ACTION --> ACT_DELETE[delete]
    ACTION --> ACT_APPROVE[approve]
    ACTION --> ACT_CANCEL[cancel]
    
    style PERM fill:#1976d2
    style RESOURCE fill:#4caf50
    style ACTION fill:#ff9800
```

## Flujo de Verificación de Permisos

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant Hook
    participant AuthStore
    participant Backend
    participant PermMiddleware
    participant Controller
    
    Note over Usuario,Controller: Verificación Frontend
    Usuario->>Frontend: Intenta acceder a recurso
    Frontend->>Hook: usePermissions()
    Hook->>AuthStore: user.role.permissions
    AuthStore-->>Hook: Lista de permisos
    Hook->>Hook: hasPermission(resource, action)
    
    alt Tiene permiso en Frontend
        Hook-->>Frontend: true
        Frontend->>Usuario: Mostrar recurso/botón
        
        Note over Usuario,Controller: Verificación Backend
        Usuario->>Frontend: Realizar acción (ej: crear)
        Frontend->>Backend: POST /api/v1/employees
        Backend->>PermMiddleware: checkPermission('employees', 'create')
        PermMiddleware->>PermMiddleware: Verificar req.user.role.permissions
        
        alt Tiene permiso en Backend
            PermMiddleware->>Controller: next()
            Controller->>Controller: Ejecutar acción
            Controller-->>Backend: 201 Created
            Backend-->>Frontend: Success
            Frontend->>Usuario: Acción completada
        else No tiene permiso en Backend
            PermMiddleware-->>Backend: 403 Forbidden
            Backend-->>Frontend: Error
            Frontend->>Usuario: Acceso denegado
        end
    else No tiene permiso en Frontend
        Hook-->>Frontend: false
        Frontend->>Usuario: Ocultar recurso/botón
    end
```

## Flujo de Creación de Rol

```mermaid
sequenceDiagram
    actor Admin
    participant UI
    participant Form
    participant Store
    participant API
    participant Controller
    participant DB
    
    Admin->>UI: Click "Nuevo Rol"
    UI->>Form: Abrir formulario
    
    Note over Admin,DB: Cargar permisos disponibles
    Form->>API: GET /api/v1/permissions
    API->>Controller: getAllPermissions()
    Controller->>DB: find({active: true})
    DB-->>Controller: Lista permisos
    Controller-->>API: 200 OK
    API-->>Form: Permisos agrupados por recurso
    
    Form->>Form: Renderizar selector permisos
    
    Note over Admin,DB: Crear rol con permisos
    Admin->>Form: Ingresar nombre y descripción
    Admin->>Form: Seleccionar permisos
    Form->>Form: Agrupar permisos seleccionados
    
    Admin->>Form: Click "Guardar"
    Form->>Store: createRole({name, desc, permissionIds})
    Store->>API: POST /api/v1/roles
    
    API->>Controller: create()
    Controller->>Controller: Validar nombre único
    Controller->>Controller: Validar permisos existen
    Controller->>DB: new Role().save()
    DB-->>Controller: Rol creado
    
    Controller-->>API: 201 Created
    API-->>Store: Rol creado
    Store-->>UI: Success
    UI->>Admin: Redirect a lista + notificación
```

## Selector de Permisos en UI

```mermaid
graph TB
    FORM[Role Form]
    
    FORM --> NAME[Input: Nombre]
    FORM --> DESC[Textarea: Descripción]
    FORM --> PERM_SECTION[Sección Permisos]
    
    PERM_SECTION --> ACCORDION[Accordion por Recurso]
    
    ACCORDION --> RES_1[📁 Empleados]
    ACCORDION --> RES_2[📁 Divisiones]
    ACCORDION --> RES_3[📁 Roles]
    ACCORDION --> RES_4[📁 Permisos]
    ACCORDION --> RES_5[📁 CSW]
    ACCORDION --> RES_6[📁 Categorías CSW]
    ACCORDION --> RES_7[📁 Flujos Aprobación]
    
    RES_1 --> EMP_READ[☑️ Ver empleados]
    RES_1 --> EMP_CREATE[☑️ Crear empleados]
    RES_1 --> EMP_UPDATE[☑️ Editar empleados]
    RES_1 --> EMP_DELETE[☑️ Eliminar empleados]
    
    RES_2 --> DIV_PERMS[☑️ Ver, Crear, Editar, Eliminar]
    RES_3 --> ROLE_PERMS[☑️ Ver, Crear, Editar, Eliminar]
    RES_5 --> CSW_PERMS[☑️ Ver, Crear, Editar, Eliminar,<br/>Aprobar, Cancelar]
    
    style FORM fill:#2196f3
    style PERM_SECTION fill:#4caf50
    style ACCORDION fill:#ff9800
```

## Permisos por Módulo

```mermaid
mindmap
  root((Recursos y<br/>Acciones))
    employees
      read
      create
      update
      delete
    divisions
      read
      create
      update
      delete
    roles
      read
      create
      update
      delete
    permissions
      read
      create
      update
      delete
    csw
      read
      create
      update
      delete
      approve
      cancel
    approval_flows
      read
      create
      update
      delete
    csw_categories
      read
      create
      update
      delete
    training
      read
      create
      update
      delete
    policies
      read
      create
      update
      delete
    tasks
      read
      create
      update
      delete
```

## Componentes de Protección

```mermaid
graph TB
    subgraph "Route Protection"
        PR[ProtectedRoute]
        PPR[PermissionProtectedRoute]
    end
    
    subgraph "Component Protection"
        CB[CreateButton]
        TA[TableActions]
        COND[Conditional Render]
    end
    
    subgraph "Hooks"
        UA[useAuth]
        UP[usePermissions]
    end
    
    subgraph "Utils"
        HP[hasPermission]
        HAP[hasAnyPermission]
        HARP[hasAllPermissions]
        CAR[canAccessResource]
    end
    
    PR --> UA
    PPR --> UP
    
    CB --> UP
    TA --> UP
    COND --> UP
    
    UP --> HP
    UP --> HAP
    UP --> HARP
    UP --> CAR
    
    style PR fill:#f44336
    style PPR fill:#f44336
    style UP fill:#4caf50
```

## Middleware de Permisos (Backend)

```mermaid
flowchart TD
    START([Request llega al endpoint])
    
    START --> AUTH{Auth<br/>Middleware}
    
    AUTH -->|No autenticado| ERR_401[401 Unauthorized]
    AUTH -->|Autenticado| PERM{Permission<br/>Middleware}
    
    PERM --> GET_USER[Obtener req.user]
    GET_USER --> LOAD_PERMS[Cargar user.role.permissions]
    
    LOAD_PERMS --> CHECK{¿Tiene permiso<br/>requerido?}
    
    CHECK -->|No| ERR_403[403 Forbidden]
    CHECK -->|Sí| NEXT[next()]
    
    NEXT --> CONTROLLER[Ejecutar Controller]
    
    ERR_401 --> END_ERR([Response Error])
    ERR_403 --> END_ERR
    CONTROLLER --> END_OK([Response Success])
    
    style START fill:#4caf50
    style CONTROLLER fill:#2196f3
    style END_OK fill:#4caf50
    style ERR_401 fill:#f44336
    style ERR_403 fill:#f44336
```

## Ejemplo de Roles Predefinidos

```mermaid
graph LR
    subgraph "Rol: Admin"
        ADMIN[Admin]
        ADMIN --> ALL_PERMS[Todos los permisos<br/>de todos los recursos]
    end
    
    subgraph "Rol: Manager"
        MANAGER[Manager]
        MANAGER --> EMP_ALL[employees: *]
        MANAGER --> DIV_READ[divisions: read]
        MANAGER --> CSW_APPROVE[csw: read, approve]
    end
    
    subgraph "Rol: Employee"
        EMP[Employee]
        EMP --> EMP_READ[employees: read]
        EMP --> DIV_READ2[divisions: read]
        EMP --> CSW_OWN[csw: read, create]
    end
    
    subgraph "Rol: HR"
        HR[HR / Talento Humano]
        HR --> EMP_HR[employees: *]
        HR --> DIV_HR[divisions: *]
        HR --> ROLES_HR[roles: read]
        HR --> CSW_HR[csw: read, approve]
    end
    
    style ADMIN fill:#f44336
    style MANAGER fill:#ff9800
    style HR fill:#2196f3
    style EMP fill:#4caf50
```

## Flujo de Edición de Rol

```mermaid
sequenceDiagram
    actor Admin
    participant UI
    participant Form
    participant API
    participant Controller
    participant DB
    
    Admin->>UI: Click "Editar" en rol
    UI->>API: GET /api/v1/roles/:id
    API->>Controller: getById(id)
    Controller->>DB: findById().populate('permissions')
    DB-->>Controller: Rol con permisos
    Controller-->>API: 200 OK
    API-->>UI: Rol data
    
    UI->>Form: Abrir form con datos
    Form->>API: GET /api/v1/permissions
    API-->>Form: Lista permisos
    
    Form->>Form: Pre-seleccionar permisos del rol
    
    Admin->>Form: Modificar permisos
    Admin->>Form: Click "Guardar"
    
    Form->>API: PUT /api/v1/roles/:id
    API->>Controller: update(id, data)
    Controller->>Controller: Validar permisos
    Controller->>DB: findByIdAndUpdate()
    DB-->>Controller: Rol actualizado
    Controller-->>API: 200 OK
    API-->>UI: Rol actualizado
    UI->>Admin: Redirect + notificación
```

## Propagación de Cambios de Permisos

```mermaid
graph TB
    CHANGE[Cambio en Rol]
    
    CHANGE --> UPDATE_DB[Actualizar rol en DB]
    UPDATE_DB --> AFFECT_USERS[Afecta a usuarios<br/>con ese rol]
    
    AFFECT_USERS --> USER_LOGIN{Usuario<br/>logueado?}
    
    USER_LOGIN -->|No| NO_IMPACT[Sin impacto inmediato]
    USER_LOGIN -->|Sí| NEED_REFRESH[Necesita refrescar token]
    
    NO_IMPACT --> NEXT_LOGIN[En próximo login<br/>tendrá nuevos permisos]
    
    NEED_REFRESH --> OPTIONS[Opciones]
    
    OPTIONS --> OPT_1[Forzar logout]
    OPTIONS --> OPT_2[Refrescar automático]
    OPTIONS --> OPT_3[Usuario refresca manualmente]
    
    OPT_1 --> RELOGIN[Usuario hace login nuevamente]
    OPT_2 --> NEW_TOKEN[Emitir nuevo token]
    OPT_3 --> USER_ACTION[Usuario hace logout/login]
    
    RELOGIN --> UPDATED[Permisos actualizados]
    NEW_TOKEN --> UPDATED
    USER_ACTION --> UPDATED
    NEXT_LOGIN --> UPDATED
    
    style CHANGE fill:#ff9800
    style UPDATED fill:#4caf50
```

## Estados del Store

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> LoadingRoles: loadRoles()
    LoadingRoles --> RolesLoaded: Success
    LoadingRoles --> Error: Failure
    
    Idle --> LoadingPermissions: loadPermissions()
    LoadingPermissions --> PermissionsLoaded: Success
    LoadingPermissions --> Error: Failure
    
    RolesLoaded --> LoadingOne: loadRole(id)
    LoadingOne --> RoleLoaded: Success
    LoadingOne --> Error: Failure
    
    Idle --> Creating: createRole()
    Creating --> RolesLoaded: Rol creado
    Creating --> Error: Error
    
    RolesLoaded --> Updating: updateRole()
    Updating --> RolesLoaded: Rol actualizado
    Updating --> Error: Error
    
    RolesLoaded --> Deleting: deleteRole()
    Deleting --> RolesLoaded: Rol eliminado
    Deleting --> Error: Error
```

## Endpoints del Módulo

```mermaid
graph TB
    ROLES[/api/v1/roles]
    PERMS[/api/v1/permissions]
    
    ROLES --> R_GET_ALL[GET /]
    ROLES --> R_GET_ONE[GET /:id]
    ROLES --> R_CREATE[POST /]
    ROLES --> R_UPDATE[PUT /:id]
    ROLES --> R_DELETE[DELETE /:id]
    ROLES --> R_ASSIGN[POST /:id/assign-permissions]
    
    PERMS --> P_GET_ALL[GET /]
    PERMS --> P_BY_RESOURCE[GET /by-resource]
    PERMS --> P_CREATE[POST /]
    PERMS --> P_UPDATE[PUT /:id]
    PERMS --> P_DELETE[DELETE /:id]
    
    style ROLES fill:#1976d2
    style PERMS fill:#4caf50
    style R_CREATE fill:#4caf50
    style R_UPDATE fill:#ff9800
    style R_DELETE fill:#f44336
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
