# Módulo de Flujos de Aprobación (Approval Flows)

## Arquitectura del Módulo

```mermaid
graph TB
    subgraph "Frontend"
        FLOW_LIST[ApprovalFlows List]
        FLOW_FORM[ApprovalFlow Form]
        LEVEL_BUILDER[Level Builder]
        FLOW_STORE[ApprovalFlowsStore]
        FLOW_API[approvalFlowsApi]
    end
    
    subgraph "Backend"
        FLOW_ROUTES[/api/v1/approval-flows]
        FLOW_CTRL[ApprovalFlowController]
        FLOW_MODEL[ApprovalFlow Model]
    end
    
    subgraph "Related Models"
        DIVISION[Division Model]
        ROLE[Role Model]
        EMPLOYEE[Employee Model]
        CSW[CSW Model]
    end
    
    subgraph "Middleware"
        AUTH[Auth Middleware]
        PERM[Permission Middleware]
    end
    
    FLOW_LIST --> FLOW_STORE
    FLOW_FORM --> LEVEL_BUILDER
    FLOW_FORM --> FLOW_STORE
    
    FLOW_STORE --> FLOW_API
    FLOW_API --> FLOW_ROUTES
    
    FLOW_ROUTES --> AUTH
    AUTH --> PERM
    PERM --> FLOW_CTRL
    
    FLOW_CTRL --> FLOW_MODEL
    FLOW_MODEL --> DIVISION
    FLOW_MODEL --> ROLE
    FLOW_MODEL --> EMPLOYEE
    
    CSW --> FLOW_MODEL
    
    style FLOW_LIST fill:#2196f3
    style FLOW_CTRL fill:#ff9800
    style FLOW_MODEL fill:#4caf50
```

## Modelo de Datos ApprovalFlow

```mermaid
erDiagram
    APPROVALFLOW {
        ObjectId _id PK
        ObjectId divisionId FK
        string name
        string description
        array levels
        boolean active
        boolean isDefault
        boolean deleted
        date createdAt
        date updatedAt
    }
    
    LEVEL {
        int order
        string name
        enum approverType
        ObjectId approverRoleId FK
        ObjectId approverUserId FK
        boolean required
        boolean autoApprove
    }
    
    DIVISION {
        ObjectId _id PK
        string name
        string code
        ObjectId managerId FK
    }
    
    ROLE {
        ObjectId _id PK
        string name
        array permissions
    }
    
    EMPLOYEE {
        ObjectId _id PK
        string name
        ObjectId roleId FK
        ObjectId divisionId FK
    }
    
    CSW {
        ObjectId _id PK
        ObjectId approvalFlowId FK
        array approvalChain
        string status
    }
    
    APPROVALFLOW ||--o| DIVISION : "configurado para"
    APPROVALFLOW ||--|{ LEVEL : "contiene"
    LEVEL ||--o| ROLE : "aprobador por rol"
    LEVEL ||--o| EMPLOYEE : "aprobador específico"
    CSW ||--o| APPROVALFLOW : "usa flujo"
```

## Estructura de un Flujo de Aprobación

```mermaid
graph TB
    FLOW[ApprovalFlow]
    
    FLOW --> META[Metadata]
    FLOW --> LEVELS[Levels Array]
    
    META --> NAME[name]
    META --> DESC[description]
    META --> DIV[divisionId]
    META --> ACTIVE[active]
    META --> DEFAULT[isDefault]
    
    LEVELS --> LEVEL1[Level 1]
    LEVELS --> LEVEL2[Level 2]
    LEVELS --> LEVEL3[Level 3]
    LEVELS --> LEVELN[Level N...]
    
    LEVEL1 --> L1_ORDER[order: 1]
    LEVEL1 --> L1_NAME[name: Tech Lead]
    LEVEL1 --> L1_TYPE[approverType: role]
    LEVEL1 --> L1_ROLE[approverRoleId]
    LEVEL1 --> L1_REQ[required: true]
    LEVEL1 --> L1_AUTO[autoApprove: false]
    
    LEVEL2 --> L2_ORDER[order: 2]
    LEVEL2 --> L2_NAME[name: Arquitecto]
    LEVEL2 --> L2_TYPE[approverType: role]
    LEVEL2 --> L2_ROLE[approverRoleId]
    
    LEVEL3 --> L3_ORDER[order: 3]
    LEVEL3 --> L3_NAME[name: CEO]
    LEVEL3 --> L3_TYPE[approverType: user]
    LEVEL3 --> L3_USER[approverUserId]
    
    style FLOW fill:#1976d2
    style LEVELS fill:#4caf50
    style META fill:#ff9800
```

## Flujo de Creación de Approval Flow

```mermaid
sequenceDiagram
    actor Admin
    participant UI
    participant Form
    participant Store
    participant API
    participant Controller
    participant Model
    participant DB
    
    Note over Admin,DB: Iniciar Creación
    Admin->>UI: Click "Nuevo Flujo"
    UI->>Form: Abrir formulario
    
    Note over Admin,DB: Cargar Datos
    Form->>API: GET /api/v1/divisions
    API-->>Form: Lista divisiones
    Form->>API: GET /api/v1/roles
    API-->>Form: Lista roles
    Form->>API: GET /api/v1/employees
    API-->>Form: Lista empleados
    
    Note over Admin,DB: Configurar Flujo
    Admin->>Form: Seleccionar división
    Admin->>Form: Ingresar nombre
    Admin->>Form: Agregar nivel 1
    Admin->>Form: Seleccionar tipo: role
    Admin->>Form: Seleccionar rol: Tech Lead
    Admin->>Form: Agregar nivel 2
    Admin->>Form: Seleccionar tipo: user
    Admin->>Form: Seleccionar usuario: CEO
    
    Note over Admin,DB: Guardar
    Admin->>Form: Click "Guardar"
    Form->>Form: Validar niveles
    Form->>Store: createApprovalFlow(data)
    Store->>API: POST /api/v1/approval-flows
    
    API->>Controller: create()
    Controller->>Controller: Validar división
    Controller->>Controller: Validar niveles
    Controller->>Controller: Validar aprobadores existen
    Controller->>Model: new ApprovalFlow(data)
    Model->>DB: save()
    DB-->>Model: Flujo guardado
    Model-->>Controller: ApprovalFlow creado
    Controller-->>API: 201 Created
    API-->>Store: Flujo creado
    Store-->>UI: Success
    UI->>Admin: Redirect + notificación
```

## Tipos de Aprobadores

```mermaid
graph TB
    APPROVER_TYPE[Approver Type]
    
    APPROVER_TYPE --> BY_ROLE[By Role]
    APPROVER_TYPE --> BY_USER[By User]
    
    BY_ROLE --> ROLE_LOGIC[Lógica por Rol]
    BY_USER --> USER_LOGIC[Lógica por Usuario]
    
    ROLE_LOGIC --> FIND_EMPLOYEES[Buscar empleados<br/>con ese rol]
    FIND_EMPLOYEES --> FILTER_DIV{¿Filtrar por<br/>división?}
    
    FILTER_DIV -->|Sí| SAME_DIV[Empleados del mismo<br/>rol y división]
    FILTER_DIV -->|No| ANY_DIV[Empleados del rol<br/>en cualquier división]
    
    SAME_DIV --> SELECT_FIRST[Seleccionar primero<br/>o todos]
    ANY_DIV --> SELECT_FIRST
    
    USER_LOGIC --> DIRECT_USER[Usar usuario<br/>específico directamente]
    
    SELECT_FIRST --> APPROVER[Aprobador asignado]
    DIRECT_USER --> APPROVER
    
    style APPROVER_TYPE fill:#1976d2
    style BY_ROLE fill:#4caf50
    style BY_USER fill:#ff9800
```

## Ejemplo: Flujos por División

```mermaid
graph TB
    subgraph "División: Administrativo"
        ADMIN_FLOW[Flujo Administrativo]
        ADMIN_FLOW --> ADMIN_L1[Nivel 1: Talento Humano<br/>role]
        ADMIN_FLOW --> ADMIN_L2[Nivel 2: CEO<br/>user]
    end
    
    subgraph "División: Tecnología"
        TECH_FLOW[Flujo Tecnología]
        TECH_FLOW --> TECH_L1[Nivel 1: Tech Lead<br/>role]
        TECH_FLOW --> TECH_L2[Nivel 2: Arquitecto Técnico<br/>role]
        TECH_FLOW --> TECH_L3[Nivel 3: Arquitecto Soluciones<br/>role]
    end
    
    subgraph "División: Datos"
        DATA_FLOW[Flujo Datos]
        DATA_FLOW --> DATA_L1[Nivel 1: Arquitecto Técnico<br/>role]
        DATA_FLOW --> DATA_L2[Nivel 2: Arquitecto Soluciones<br/>role]
    end
    
    subgraph "Default Flow"
        DEFAULT[Flujo por Defecto]
        DEFAULT --> DEF_L1[Nivel 1: Manager<br/>role]
        DEFAULT --> DEF_L2[Nivel 2: CEO<br/>user]
    end
    
    style ADMIN_FLOW fill:#2196f3
    style TECH_FLOW fill:#4caf50
    style DATA_FLOW fill:#ff9800
    style DEFAULT fill:#9c27b0
```

## Proceso de Asignación de Flujo a CSW

```mermaid
flowchart TD
    START([Usuario crea CSW])
    
    START --> GET_DIV[Obtener división<br/>del solicitante]
    GET_DIV --> FIND_FLOW[Buscar ApprovalFlow<br/>por divisionId]
    
    FIND_FLOW --> FLOW_EXISTS{¿Flujo existe<br/>y está activo?}
    
    FLOW_EXISTS -->|No| CHECK_DEFAULT{¿Existe flujo<br/>por defecto?}
    FLOW_EXISTS -->|Sí| USE_DIV_FLOW[Usar flujo de división]
    
    CHECK_DEFAULT -->|Sí| USE_DEFAULT[Usar flujo por defecto]
    CHECK_DEFAULT -->|No| ERROR[Error: No hay flujo<br/>configurado]
    
    USE_DIV_FLOW --> COPY_FLOW[Copiar flujo a CSW]
    USE_DEFAULT --> COPY_FLOW
    
    COPY_FLOW --> BUILD_CHAIN[Construir approvalChain]
    
    BUILD_CHAIN --> ITERATE_LEVELS[Iterar niveles del flujo]
    
    ITERATE_LEVELS --> GET_APPROVER[Obtener aprobador<br/>según tipo]
    
    GET_APPROVER --> ADD_TO_CHAIN[Agregar a approvalChain]
    
    ADD_TO_CHAIN --> MORE_LEVELS{¿Más niveles?}
    
    MORE_LEVELS -->|Sí| ITERATE_LEVELS
    MORE_LEVELS -->|No| SAVE_CSW[Guardar CSW con<br/>approvalFlowId y chain]
    
    SAVE_CSW --> SUCCESS([CSW creado con flujo])
    ERROR --> FAIL([Fallo en creación])
    
    style START fill:#4caf50
    style SUCCESS fill:#4caf50
    style ERROR fill:#f44336
    style BUILD_CHAIN fill:#2196f3
```

## Constructor de Niveles (UI)

```mermaid
graph TB
    LEVEL_BUILDER[Level Builder Component]
    
    LEVEL_BUILDER --> LIST[Lista de Niveles]
    LEVEL_BUILDER --> ADD_BTN[Agregar Nivel]
    
    LIST --> LEVEL_ITEM[Level Item]
    
    LEVEL_ITEM --> ITEM_ORDER[Order Badge]
    LEVEL_ITEM --> ITEM_NAME[Input: Nombre]
    LEVEL_ITEM --> ITEM_TYPE[Select: Tipo]
    LEVEL_ITEM --> ITEM_APPROVER[Select: Aprobador]
    LEVEL_ITEM --> ITEM_REQ[Checkbox: Required]
    LEVEL_ITEM --> ITEM_AUTO[Checkbox: AutoApprove]
    LEVEL_ITEM --> ITEM_ACTIONS[Acciones]
    
    ITEM_TYPE --> TYPE_ROLE[role]
    ITEM_TYPE --> TYPE_USER[user]
    
    TYPE_ROLE --> ROLE_SELECT[Combobox Roles]
    TYPE_USER --> USER_SELECT[Combobox Usuarios]
    
    ITEM_ACTIONS --> MOVE_UP[▲ Subir]
    ITEM_ACTIONS --> MOVE_DOWN[▼ Bajar]
    ITEM_ACTIONS --> DELETE[🗑️ Eliminar]
    
    ADD_BTN --> NEW_LEVEL[Agregar nuevo nivel<br/>al final de la lista]
    
    style LEVEL_BUILDER fill:#2196f3
    style LIST fill:#4caf50
    style ADD_BTN fill:#4caf50
```

## Validaciones del Flujo

```mermaid
flowchart TD
    START([Validar Flujo])
    
    START --> VAL_NAME{¿Nombre válido?}
    VAL_NAME -->|No| ERR_NAME[Error: Nombre requerido]
    VAL_NAME -->|Sí| VAL_DIV{¿División válida?}
    
    VAL_DIV -->|No| ERR_DIV[Error: División inválida]
    VAL_DIV -->|Sí| VAL_LEVELS{¿Tiene niveles?}
    
    VAL_LEVELS -->|No| ERR_LEVELS[Error: Debe tener<br/>al menos un nivel]
    VAL_LEVELS -->|Sí| VAL_ORDER{¿Orden correcto?}
    
    VAL_ORDER -->|No| ERR_ORDER[Error: Orden debe ser<br/>1, 2, 3, ...]
    VAL_ORDER -->|Sí| ITERATE[Iterar cada nivel]
    
    ITERATE --> VAL_LEVEL_NAME{¿Nivel tiene<br/>nombre?}
    VAL_LEVEL_NAME -->|No| ERR_LEVEL_NAME[Error: Nivel sin nombre]
    VAL_LEVEL_NAME -->|Sí| VAL_TYPE{¿Tipo válido?}
    
    VAL_TYPE -->|No| ERR_TYPE[Error: Tipo inválido]
    VAL_TYPE -->|Sí| CHECK_TYPE{Tipo?}
    
    CHECK_TYPE -->|role| VAL_ROLE{¿roleId existe?}
    CHECK_TYPE -->|user| VAL_USER{¿userId existe?}
    
    VAL_ROLE -->|No| ERR_ROLE[Error: Rol no existe]
    VAL_ROLE -->|Sí| NEXT_LEVEL{¿Más niveles?}
    
    VAL_USER -->|No| ERR_USER[Error: Usuario no existe]
    VAL_USER -->|Sí| NEXT_LEVEL
    
    NEXT_LEVEL -->|Sí| ITERATE
    NEXT_LEVEL -->|No| SUCCESS([Flujo válido])
    
    ERR_NAME --> FAIL([Validación fallida])
    ERR_DIV --> FAIL
    ERR_LEVELS --> FAIL
    ERR_ORDER --> FAIL
    ERR_LEVEL_NAME --> FAIL
    ERR_TYPE --> FAIL
    ERR_ROLE --> FAIL
    ERR_USER --> FAIL
    
    style START fill:#4caf50
    style SUCCESS fill:#4caf50
    style FAIL fill:#f44336
```

## Endpoints del Módulo

```mermaid
graph TB
    BASE[/api/v1/approval-flows]
    
    BASE --> GET_ALL[GET /]
    BASE --> GET_ONE[GET /:id]
    BASE --> CREATE[POST /]
    BASE --> UPDATE[PUT /:id]
    BASE --> DELETE[DELETE /:id]
    BASE --> BY_DIV[GET /by-division/:divisionId]
    BASE --> GET_DEFAULT[GET /default]
    BASE --> SET_DEFAULT[POST /:id/set-default]
    BASE --> ACTIVATE[POST /:id/activate]
    BASE --> DEACTIVATE[POST /:id/deactivate]
    
    GET_ALL --> FILTER_DIV[?division=id]
    GET_ALL --> FILTER_ACTIVE[?active=true]
    
    style BASE fill:#1976d2
    style CREATE fill:#4caf50
    style UPDATE fill:#ff9800
    style DELETE fill:#f44336
```

## Componentes UI del Módulo

```mermaid
graph TB
    PAGE[ApprovalFlows Page]
    
    PAGE --> HEADER[Header]
    PAGE --> CREATE_BTN[Crear Flujo]
    PAGE --> TABLE[DataTable]
    PAGE --> FORM_MODAL[Form Modal]
    
    HEADER --> TITLE[Título: Flujos de Aprobación]
    HEADER --> BREADCRUMB[Breadcrumb]
    
    CREATE_BTN -.->|Permisos| PERM_CREATE[approval_flows.create]
    
    TABLE --> COLUMNS[Columnas]
    TABLE --> ROWS[Filas]
    TABLE --> ACTIONS[Actions]
    
    COLUMNS --> C_NAME[Name]
    COLUMNS --> C_DIV[División]
    COLUMNS --> C_LEVELS[# Niveles]
    COLUMNS --> C_ACTIVE[Activo]
    COLUMNS --> C_DEFAULT[Por Defecto]
    COLUMNS --> C_ACTIONS[Actions]
    
    ACTIONS --> A_VIEW[Ver]
    ACTIONS --> A_EDIT[Editar]
    ACTIONS --> A_DELETE[Eliminar]
    ACTIONS --> A_TOGGLE[Activar/Desactivar]
    
    A_VIEW -.->|Permisos| PERM_READ[approval_flows.read]
    A_EDIT -.->|Permisos| PERM_UPDATE[approval_flows.update]
    A_DELETE -.->|Permisos| PERM_DELETE[approval_flows.delete]
    
    FORM_MODAL --> F_NAME[Input: Name]
    FORM_MODAL --> F_DIV[Select: División]
    FORM_MODAL --> F_DESC[Textarea: Description]
    FORM_MODAL --> F_ACTIVE[Checkbox: Active]
    FORM_MODAL --> F_DEFAULT[Checkbox: Default]
    FORM_MODAL --> F_LEVELS[Level Builder]
    
    style PAGE fill:#2196f3
    style CREATE_BTN fill:#4caf50
    style F_LEVELS fill:#ff9800
```

## Impacto de Cambios en Flujos

```mermaid
sequenceDiagram
    actor Admin
    participant UI
    participant API
    participant FlowModel
    participant CSWModel
    participant DB
    
    Note over Admin,DB: Admin edita un flujo existente
    Admin->>UI: Modifica niveles del flujo
    Admin->>UI: Guarda cambios
    UI->>API: PUT /approval-flows/:id
    API->>FlowModel: update(id, data)
    FlowModel->>DB: Actualizar flujo
    DB-->>FlowModel: Flujo actualizado
    
    Note over Admin,DB: ¿Afecta a CSW existentes?
    FlowModel->>CSWModel: find({approvalFlowId: id, status: 'pending'})
    CSWModel->>DB: Query CSW pendientes
    DB-->>CSWModel: Lista CSW
    
    alt CSW pendientes encontrados
        CSWModel-->>FlowModel: count > 0
        FlowModel->>FlowModel: Advertir: X CSW en curso<br/>usan este flujo
        FlowModel-->>API: 200 OK + warning
        API-->>UI: Flujo actualizado<br/>pero CSW activos no se modifican
        UI->>Admin: Mostrar advertencia
    else Sin CSW pendientes
        CSWModel-->>FlowModel: count = 0
        FlowModel-->>API: 200 OK
        API-->>UI: Flujo actualizado
        UI->>Admin: Success
    end
```

## Flujo de Eliminación

```mermaid
flowchart TD
    START([Admin elimina flujo])
    
    START --> CHECK_CSW[Verificar si hay CSW<br/>que usan este flujo]
    
    CHECK_CSW --> CSW_EXISTS{¿Existen CSW<br/>asociados?}
    
    CSW_EXISTS -->|Sí| CHECK_STATUS{¿Todos están<br/>finalizados?}
    CSW_EXISTS -->|No| CAN_DELETE[Puede eliminar]
    
    CHECK_STATUS -->|Hay pendientes| CANNOT_DELETE[No puede eliminar]
    CHECK_STATUS -->|Todos finalizados| SOFT_DELETE[Soft delete permitido]
    
    CANNOT_DELETE --> ERROR[Error 400:<br/>Flujo en uso]
    
    SOFT_DELETE --> MARK_DELETED[deleted = true]
    CAN_DELETE --> MARK_DELETED
    
    MARK_DELETED --> DEACTIVATE[active = false]
    DEACTIVATE --> SAVE[Guardar en DB]
    SAVE --> SUCCESS([Flujo eliminado])
    
    ERROR --> FAIL([Operación cancelada])
    
    style START fill:#ff9800
    style SUCCESS fill:#4caf50
    style ERROR fill:#f44336
    style CANNOT_DELETE fill:#f44336
```

## Estados del Store (MobX)

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> LoadingFlows: loadApprovalFlows()
    LoadingFlows --> FlowsLoaded: Success
    LoadingFlows --> Error: Failure
    
    FlowsLoaded --> LoadingOne: loadApprovalFlow(id)
    LoadingOne --> FlowLoaded: Success
    LoadingOne --> Error: Failure
    
    Idle --> Creating: createApprovalFlow()
    Creating --> FlowsLoaded: Flujo creado
    Creating --> Error: Error creación
    
    FlowsLoaded --> Updating: updateApprovalFlow()
    Updating --> FlowsLoaded: Flujo actualizado
    Updating --> Error: Error actualización
    
    FlowsLoaded --> Deleting: deleteApprovalFlow()
    Deleting --> FlowsLoaded: Flujo eliminado
    Deleting --> Error: Error eliminación
    
    FlowsLoaded --> TogglingActive: toggleActive()
    TogglingActive --> FlowsLoaded: Estado cambiado
    TogglingActive --> Error: Error
```

## Relación con CSW

```mermaid
graph LR
    subgraph "Configuración"
        DIV[División]
        FLOW[ApprovalFlow]
        LEVELS[Niveles configurados]
    end
    
    subgraph "Creación CSW"
        USER[Usuario crea CSW]
        ASSIGN[Asignar flujo<br/>según división]
        COPY[Copiar flujo a CSW]
    end
    
    subgraph "Ejecución"
        CSW[CSW con chain]
        APPROVE[Proceso aprobación]
        COMPLETE[CSW completado]
    end
    
    DIV --> FLOW
    FLOW --> LEVELS
    
    USER --> ASSIGN
    ASSIGN --> FLOW
    FLOW --> COPY
    COPY --> CSW
    
    CSW --> APPROVE
    APPROVE --> COMPLETE
    
    COMPLETE -.->|No afecta| FLOW
    
    style FLOW fill:#1976d2
    style CSW fill:#4caf50
    style COPY fill:#ff9800
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
