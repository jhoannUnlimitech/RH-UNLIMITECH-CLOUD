# Módulo CSW (Change Management)

## Arquitectura del Módulo CSW

```mermaid
graph TB
    subgraph "Frontend"
        CSW_LIST[CSW List]
        CSW_FORM[CSW Form]
        CSW_VIEW[CSW View]
        CSW_STORE[CSWStore]
        CSW_API[cswApi]
        APPROVAL_BTN[Approval Buttons]
    end
    
    subgraph "Backend"
        CSW_ROUTES[/api/v1/csw]
        CSW_CTRL[CSWController]
        CSW_MODEL[CSW Model]
        HISTORY_MODEL[CSWHistory Model]
    end
    
    subgraph "Related Models"
        EMPLOYEE[Employee]
        DIVISION[Division]
        CATEGORY[CSWCategory]
        FLOW[ApprovalFlow]
    end
    
    subgraph "Middleware"
        AUTH[Auth Middleware]
        PERM[Permission Middleware]
    end
    
    CSW_LIST --> CSW_STORE
    CSW_FORM --> CSW_STORE
    CSW_VIEW --> CSW_STORE
    CSW_VIEW --> APPROVAL_BTN
    
    CSW_STORE --> CSW_API
    CSW_API --> CSW_ROUTES
    
    CSW_ROUTES --> AUTH
    AUTH --> PERM
    PERM --> CSW_CTRL
    
    CSW_CTRL --> CSW_MODEL
    CSW_CTRL --> HISTORY_MODEL
    
    CSW_MODEL --> EMPLOYEE
    CSW_MODEL --> DIVISION
    CSW_MODEL --> CATEGORY
    CSW_MODEL --> FLOW
    
    style CSW_LIST fill:#2196f3
    style CSW_CTRL fill:#ff9800
    style CSW_MODEL fill:#4caf50
```

## Modelo de Datos CSW

```mermaid
erDiagram
    CSW {
        ObjectId _id PK
        string situation
        string information
        string solution
        ObjectId requesterId FK
        string requesterName
        string requesterPosition
        ObjectId requesterDivision FK
        ObjectId categoryId FK
        ObjectId approvalFlowId FK
        array approvalChain
        string status
        int currentLevel
        array history
        boolean deleted
        date createdAt
        date updatedAt
    }
    
    APPROVALCHAIN {
        int level
        string name
        ObjectId approverId
        string approverName
        string approverPosition
        string status
        date approvedAt
        string comments
    }
    
    HISTORY {
        string action
        ObjectId performedBy
        string performedByName
        date performedAt
        int level
        string previousStatus
        string newStatus
        string comments
    }
    
    EMPLOYEE {
        ObjectId _id PK
        string name
        string position
        ObjectId divisionId FK
        ObjectId roleId FK
    }
    
    DIVISION {
        ObjectId _id PK
        string name
        string code
        ObjectId managerId FK
    }
    
    CSWCATEGORY {
        ObjectId _id PK
        string name
        string description
        boolean active
    }
    
    APPROVALFLOW {
        ObjectId _id PK
        ObjectId divisionId FK
        string name
        array levels
        boolean active
    }
    
    CSW ||--o| EMPLOYEE : "solicitada por"
    CSW ||--o| DIVISION : "pertenece a"
    CSW ||--o| CSWCATEGORY : "clasificada como"
    CSW ||--o| APPROVALFLOW : "sigue flujo"
    CSW ||--|{ APPROVALCHAIN : "tiene cadena"
    CSW ||--|{ HISTORY : "registra historial"
```

## Flujo Completo de Creación CSW

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant Store
    participant API
    participant Controller
    participant CSWModel
    participant FlowModel
    participant EmployeeModel
    participant DB
    
    Note over Usuario,DB: Cargar Datos Iniciales
    Usuario->>Frontend: Accede a /csw/new
    Frontend->>API: GET /api/v1/csw-categories
    API-->>Frontend: Lista categorías
    Frontend->>API: GET /api/v1/employees/me
    API-->>Frontend: Datos del usuario
    
    Note over Usuario,DB: Llenar Formulario
    Usuario->>Frontend: Selecciona categoría
    Usuario->>Frontend: Escribe situación (max 200 palabras)
    Usuario->>Frontend: Escribe información (max 200 palabras)
    Usuario->>Frontend: Escribe solución (max 200 palabras)
    Usuario->>Frontend: Click "Enviar Solicitud"
    
    Note over Usuario,DB: Crear CSW
    Frontend->>Store: createCSW(data)
    Store->>API: POST /api/v1/csw
    
    API->>Controller: create()
    Controller->>EmployeeModel: findById(requesterId)
    EmployeeModel-->>Controller: Usuario con división
    
    Controller->>FlowModel: findOne({divisionId})
    FlowModel-->>Controller: Flujo de aprobación
    
    Controller->>Controller: Generar approvalChain<br/>según niveles del flujo
    
    Controller->>CSWModel: new CSW(data)
    CSWModel->>DB: save()
    DB-->>CSWModel: CSW guardado
    
    Controller->>Controller: Registrar en history:<br/>'created'
    
    CSWModel-->>Controller: CSW creado
    Controller-->>API: 201 Created
    API-->>Store: CSW creado
    Store-->>Frontend: Success
    Frontend->>Usuario: Redirect a lista + notificación
```

## Estados de una Solicitud CSW

```mermaid
stateDiagram-v2
    [*] --> pending: Usuario crea CSW
    
    pending --> approved: Todos los niveles aprueban
    pending --> rejected: Algún nivel rechaza
    pending --> cancelled: Usuario cancela
    
    approved --> implemented: Implementación completada
    approved --> cancelled: Cancelada después de aprobada
    
    rejected --> [*]
    cancelled --> [*]
    implemented --> [*]
    
    note right of pending
        CSW esperando aprobaciones
        currentLevel indica nivel actual
    end note
    
    note right of approved
        Todos los aprobadores
        dieron su visto bueno
    end note
    
    note right of rejected
        Al menos un aprobador
        rechazó la solicitud
    end note
```

## Flujo de Aprobación

```mermaid
sequenceDiagram
    actor Aprobador
    participant Frontend
    participant API
    participant Controller
    participant CSWModel
    participant DB
    
    Note over Aprobador,DB: Ver Solicitud Pendiente
    Aprobador->>Frontend: Accede a /csw/pending
    Frontend->>API: GET /csw/pending-approvals
    API->>Controller: getPendingApprovals(userId)
    Controller->>DB: find CSW donde userId es aprobador<br/>del nivel actual
    DB-->>Controller: Lista CSW pendientes
    Controller-->>API: CSW[]
    API-->>Frontend: Lista
    Frontend->>Aprobador: Mostrar tabla
    
    Note over Aprobador,DB: Ver Detalle
    Aprobador->>Frontend: Click en CSW
    Frontend->>API: GET /csw/:id
    API->>Controller: getById(id)
    Controller->>DB: findById().populate()
    DB-->>Controller: CSW completo
    Controller-->>API: CSW
    API-->>Frontend: Datos completos
    Frontend->>Aprobador: Mostrar vista detalle
    
    Note over Aprobador,DB: Aprobar
    Aprobador->>Frontend: Click "Aprobar"
    Frontend->>Frontend: Modal comentarios (opcional)
    Aprobador->>Frontend: Ingresar comentarios
    Aprobador->>Frontend: Confirmar aprobación
    
    Frontend->>API: POST /csw/:id/approve
    API->>Controller: approve(cswId, userId, comments)
    
    Controller->>Controller: Verificar que userId es<br/>aprobador del nivel actual
    Controller->>Controller: Marcar nivel como 'approved'
    Controller->>Controller: Registrar en history
    
    Controller->>Controller: ¿Es el último nivel?
    
    alt Es el último nivel
        Controller->>Controller: status = 'approved'
        Controller->>Controller: Notificar a solicitante
    else No es el último nivel
        Controller->>Controller: currentLevel++
        Controller->>Controller: status = 'pending'
        Controller->>Controller: Notificar siguiente aprobador
    end
    
    Controller->>DB: save()
    DB-->>Controller: CSW actualizado
    Controller-->>API: 200 OK
    API-->>Frontend: Success
    Frontend->>Aprobador: Notificación + actualizar vista
```

## Flujo de Rechazo

```mermaid
sequenceDiagram
    actor Aprobador
    participant Frontend
    participant API
    participant Controller
    participant CSWModel
    participant DB
    
    Aprobador->>Frontend: Click "Rechazar"
    Frontend->>Frontend: Modal comentarios (requerido)
    Aprobador->>Frontend: Ingresar razón del rechazo
    Aprobador->>Frontend: Confirmar rechazo
    
    Frontend->>API: POST /csw/:id/reject
    API->>Controller: reject(cswId, userId, comments)
    
    Controller->>Controller: Verificar que userId es<br/>aprobador del nivel actual
    Controller->>Controller: Marcar nivel como 'rejected'
    Controller->>Controller: status = 'rejected'
    Controller->>Controller: Registrar en history
    Controller->>Controller: Notificar a solicitante
    
    Controller->>DB: save()
    DB-->>Controller: CSW actualizado
    Controller-->>API: 200 OK
    API-->>Frontend: Success
    Frontend->>Aprobador: Notificación + actualizar vista
```

## Vistas del Módulo CSW

```mermaid
graph TB
    CSW_MODULE[Módulo CSW]
    
    CSW_MODULE --> MY_REQUESTS[Mis Solicitudes]
    CSW_MODULE --> PENDING_APP[Pendientes de Aprobar]
    CSW_MODULE --> ALL_CSW[Todas las Solicitudes]
    CSW_MODULE --> CREATE[Nueva Solicitud]
    
    MY_REQUESTS --> MR_TABLE[Tabla CSW creados<br/>por el usuario]
    MY_REQUESTS --> MR_FILTER[Filtrar por estado]
    MY_REQUESTS --> MR_ACTIONS[Ver, Editar, Cancelar]
    
    PENDING_APP --> PA_TABLE[Tabla CSW donde usuario<br/>es aprobador actual]
    PENDING_APP --> PA_ACTIONS[Ver, Aprobar, Rechazar]
    
    ALL_CSW --> ALL_TABLE[Tabla todos los CSW]
    ALL_CSW --> ALL_FILTER[Filtros avanzados]
    ALL_CSW --> ALL_STATS[Estadísticas]
    
    CREATE --> FORM[Formulario 3 campos]
    CREATE --> CAT_SELECT[Selector categoría]
    CREATE --> SUBMIT[Enviar solicitud]
    
    style CSW_MODULE fill:#1976d2
    style MY_REQUESTS fill:#4caf50
    style PENDING_APP fill:#ff9800
    style ALL_CSW fill:#9c27b0
```

## Componentes UI del Módulo

```mermaid
graph TB
    CSW_LIST[CSWList Component]
    
    CSW_LIST --> FILTERS[Filtros]
    CSW_LIST --> TABLE[DataTable]
    CSW_LIST --> CREATE_BTN[Crear Solicitud]
    
    FILTERS --> F_STATUS[Por Estado]
    FILTERS --> F_CATEGORY[Por Categoría]
    FILTERS --> F_DATE[Por Fecha]
    FILTERS --> F_REQUESTER[Por Solicitante]
    
    TABLE --> COLUMNS[Columnas]
    TABLE --> ROWS[Filas]
    TABLE --> ACTIONS[Actions]
    
    COLUMNS --> C_ID[ID/Código]
    COLUMNS --> C_CAT[Categoría]
    COLUMNS --> C_REQ[Solicitante]
    COLUMNS --> C_STATUS[Estado]
    COLUMNS --> C_LEVEL[Nivel Actual]
    COLUMNS --> C_DATE[Fecha]
    
    ACTIONS --> A_VIEW[Ver Detalle]
    ACTIONS --> A_APPROVE[Aprobar]
    ACTIONS --> A_REJECT[Rechazar]
    ACTIONS --> A_CANCEL[Cancelar]
    
    A_VIEW -.->|Permisos| P_READ[csw.read]
    A_APPROVE -.->|Permisos| P_APPROVE[csw.approve]
    A_REJECT -.->|Permisos| P_APPROVE
    A_CANCEL -.->|Permisos| P_CANCEL[csw.cancel]
    
    style CSW_LIST fill:#2196f3
    style CREATE_BTN fill:#4caf50
    style A_APPROVE fill:#4caf50
    style A_REJECT fill:#f44336
```

## Vista Detalle de CSW

```mermaid
graph TB
    CSW_VIEW[CSW View Component]
    
    CSW_VIEW --> HEADER[Header Info]
    CSW_VIEW --> CONTENT[Contenido CSW]
    CSW_VIEW --> CHAIN[Cadena Aprobación]
    CSW_VIEW --> HISTORY[Historial]
    CSW_VIEW --> ACTIONS_DET[Acciones]
    
    HEADER --> H_ID[ID/Código]
    HEADER --> H_STATUS[Estado Badge]
    HEADER --> H_CAT[Categoría]
    HEADER --> H_DATE[Fecha Creación]
    
    CONTENT --> CNT_SITUATION[Situación]
    CONTENT --> CNT_INFO[Información]
    CONTENT --> CNT_SOLUTION[Solución]
    CONTENT --> CNT_REQUESTER[Solicitante Info]
    
    CHAIN --> LEVELS[Niveles de Aprobación]
    
    LEVELS --> L1[Nivel 1]
    LEVELS --> L2[Nivel 2]
    LEVELS --> L3[Nivel 3]
    
    L1 --> L1_APPROVER[Aprobador]
    L1 --> L1_STATUS[Estado]
    L1 --> L1_DATE[Fecha]
    L1 --> L1_COMMENTS[Comentarios]
    
    HISTORY --> H_ENTRIES[Entradas Timeline]
    
    H_ENTRIES --> E_CREATED[Creado]
    H_ENTRIES --> E_APPROVED[Aprobado nivel X]
    H_ENTRIES --> E_REJECTED[Rechazado]
    H_ENTRIES --> E_CANCELLED[Cancelado]
    
    ACTIONS_DET --> BTN_APPROVE[Aprobar]
    ACTIONS_DET --> BTN_REJECT[Rechazar]
    ACTIONS_DET --> BTN_CANCEL[Cancelar]
    ACTIONS_DET --> BTN_EDIT[Editar]
    
    style CSW_VIEW fill:#2196f3
    style CHAIN fill:#4caf50
    style HISTORY fill:#ff9800
```

## Endpoints del Módulo

```mermaid
graph TB
    BASE[/api/v1/csw]
    
    BASE --> GET_ALL[GET /]
    BASE --> GET_ONE[GET /:id]
    BASE --> CREATE[POST /]
    BASE --> UPDATE[PUT /:id]
    BASE --> DELETE[DELETE /:id]
    BASE --> APPROVE[POST /:id/approve]
    BASE --> REJECT[POST /:id/reject]
    BASE --> CANCEL[POST /:id/cancel]
    BASE --> MY_REQ[GET /my-requests]
    BASE --> PENDING[GET /pending-approvals]
    BASE --> STATS[GET /statistics]
    
    GET_ALL --> FILTER_STATUS[?status=pending]
    GET_ALL --> FILTER_CAT[?category=id]
    GET_ALL --> FILTER_DIV[?division=id]
    
    style BASE fill:#1976d2
    style CREATE fill:#4caf50
    style APPROVE fill:#4caf50
    style REJECT fill:#f44336
    style CANCEL fill:#ff9800
```

## Generación de Approval Chain

```mermaid
flowchart TD
    START([CSW Creado])
    
    START --> GET_USER[Obtener usuario solicitante]
    GET_USER --> GET_DIV[Obtener división del usuario]
    GET_DIV --> FIND_FLOW[Buscar ApprovalFlow<br/>de la división]
    
    FIND_FLOW --> FLOW_EXISTS{¿Flujo existe?}
    
    FLOW_EXISTS -->|No| DEFAULT_FLOW[Usar flujo por defecto]
    FLOW_EXISTS -->|Sí| USE_FLOW[Usar flujo de la división]
    
    DEFAULT_FLOW --> BUILD_CHAIN[Construir approvalChain]
    USE_FLOW --> BUILD_CHAIN
    
    BUILD_CHAIN --> ITERATE[Iterar niveles del flujo]
    
    ITERATE --> LEVEL_TYPE{Tipo de<br/>aprobador?}
    
    LEVEL_TYPE -->|role| FIND_BY_ROLE[Buscar empleados<br/>con ese rol]
    LEVEL_TYPE -->|user| FIND_BY_ID[Usar usuario específico]
    
    FIND_BY_ROLE --> SELECT_APPROVER[Seleccionar aprobador]
    FIND_BY_ID --> SELECT_APPROVER
    
    SELECT_APPROVER --> ADD_LEVEL[Agregar nivel a chain]
    
    ADD_LEVEL --> MORE_LEVELS{¿Más niveles?}
    
    MORE_LEVELS -->|Sí| ITERATE
    MORE_LEVELS -->|No| SAVE_CHAIN[Guardar approvalChain en CSW]
    
    SAVE_CHAIN --> SET_CURRENT[currentLevel = 1]
    SET_CURRENT --> SET_STATUS[status = 'pending']
    SET_STATUS --> NOTIFY[Notificar primer aprobador]
    
    NOTIFY --> END([CSW listo])
    
    style START fill:#4caf50
    style END fill:#4caf50
    style BUILD_CHAIN fill:#2196f3
```

## Lógica de Progresión de Niveles

```mermaid
flowchart TD
    START([Aprobación recibida])
    
    START --> VALIDATE{¿Usuario es aprobador<br/>del nivel actual?}
    
    VALIDATE -->|No| ERR_UNAUTH[Error 403:<br/>No autorizado]
    VALIDATE -->|Sí| MARK_APPROVED[Marcar nivel como 'approved']
    
    MARK_APPROVED --> ADD_HISTORY[Agregar a history]
    
    ADD_HISTORY --> LAST_LEVEL{¿Es el<br/>último nivel?}
    
    LAST_LEVEL -->|Sí| APPROVE_CSW[status = 'approved']
    LAST_LEVEL -->|No| NEXT_LEVEL[currentLevel++]
    
    APPROVE_CSW --> NOTIFY_REQ[Notificar solicitante:<br/>CSW aprobado]
    NEXT_LEVEL --> NOTIFY_NEXT[Notificar siguiente aprobador]
    
    NOTIFY_REQ --> SAVE[Guardar en DB]
    NOTIFY_NEXT --> SAVE
    
    SAVE --> SUCCESS([Success])
    ERR_UNAUTH --> FAIL([Fallo])
    
    style START fill:#4caf50
    style SUCCESS fill:#4caf50
    style APPROVE_CSW fill:#4caf50
    style ERR_UNAUTH fill:#f44336
```

## Historial de Cambios

```mermaid
graph TB
    HISTORY[CSWHistory]
    
    HISTORY --> CREATED[created]
    HISTORY --> EDITED[edited]
    HISTORY --> APPROVED[approved_level_X]
    HISTORY --> REJECTED[rejected_level_X]
    HISTORY --> CANCELLED[cancelled]
    HISTORY --> IMPLEMENTED[implemented]
    
    CREATED --> C_DATA[performedBy<br/>performedAt<br/>newStatus: pending]
    
    APPROVED --> A_DATA[performedBy<br/>performedAt<br/>level<br/>comments<br/>previousStatus<br/>newStatus]
    
    REJECTED --> R_DATA[performedBy<br/>performedAt<br/>level<br/>comments<br/>newStatus: rejected]
    
    CANCELLED --> CN_DATA[performedBy<br/>performedAt<br/>comments<br/>newStatus: cancelled]
    
    style HISTORY fill:#1976d2
    style CREATED fill:#4caf50
    style APPROVED fill:#4caf50
    style REJECTED fill:#f44336
    style CANCELLED fill:#ff9800
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
