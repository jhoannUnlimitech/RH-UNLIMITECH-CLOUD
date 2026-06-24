# Módulo de Divisiones (Divisions)

## Arquitectura del Módulo

```mermaid
graph TB
    subgraph "Frontend"
        DIV_LIST[DivisionsList Page]
        DIV_MODAL[Division Modal Form]
        DIV_STORE[DivisionsStore]
        DIV_API[divisionsApi]
        DIV_TABLE[Tabla Divisiones]
    end
    
    subgraph "Backend"
        DIV_ROUTES[/api/v1/divisions]
        DIV_CONTROLLER[DivisionsController]
        DIV_MODEL[Division Model]
    end
    
    subgraph "Middleware"
        AUTH[Auth Middleware]
        PERM[Permission Middleware]
    end
    
    subgraph "Relaciones"
        EMPLOYEE[Employee Model]
        APPROVAL_FLOW[ApprovalFlow Model]
    end
    
    DIV_LIST --> DIV_TABLE
    DIV_LIST --> DIV_MODAL
    DIV_LIST --> DIV_STORE
    
    DIV_MODAL --> DIV_STORE
    DIV_STORE --> DIV_API
    DIV_API --> DIV_ROUTES
    
    DIV_ROUTES --> AUTH
    DIV_ROUTES --> PERM
    AUTH --> DIV_CONTROLLER
    PERM --> DIV_CONTROLLER
    
    DIV_CONTROLLER --> DIV_MODEL
    DIV_MODEL --> EMPLOYEE
    DIV_MODEL --> APPROVAL_FLOW
    
    style DIV_LIST fill:#2196f3
    style DIV_CONTROLLER fill:#ff9800
    style DIV_MODEL fill:#4caf50
```

## Modelo de Datos Division

```mermaid
erDiagram
    DIVISION {
        ObjectId _id PK
        string name
        string code UK
        string description
        ObjectId managerId FK
        boolean deleted
        date createdAt
        date updatedAt
    }
    
    EMPLOYEE {
        ObjectId _id PK
        string name
        string email
        string position
        ObjectId divisionId FK
        ObjectId roleId FK
    }
    
    APPROVALFLOW {
        ObjectId _id PK
        ObjectId divisionId FK
        string name
        array levels
        boolean active
    }
    
    CSW {
        ObjectId _id PK
        ObjectId requesterDivision FK
        ObjectId approvalFlowId FK
        string status
    }
    
    DIVISION ||--|{ EMPLOYEE : "tiene empleados"
    DIVISION ||--o| EMPLOYEE : "dirigida por (manager)"
    DIVISION ||--o| APPROVALFLOW : "tiene flujo aprobación"
    DIVISION ||--|{ CSW : "genera solicitudes"
```

## Flujo CRUD de Divisiones

```mermaid
sequenceDiagram
    actor Usuario
    participant UI
    participant Store
    participant API
    participant Controller
    participant Model
    participant DB
    
    Note over Usuario,DB: Listar Divisiones
    Usuario->>UI: Accede a /divisions
    UI->>Store: loadDivisions()
    Store->>API: GET /api/v1/divisions
    API->>Controller: getAll()
    Controller->>Model: find({deleted: false})
    Model->>DB: Query
    DB-->>Model: Lista divisiones
    Model->>Model: Populate manager
    Model-->>Controller: Divisiones con manager
    Controller-->>API: 200 OK
    API-->>Store: Divisiones
    Store-->>UI: Renderizar tabla
    
    Note over Usuario,DB: Crear División
    Usuario->>UI: Click "Nueva División"
    UI->>UI: Abrir modal
    Usuario->>UI: Llenar form (name, code, desc, manager)
    UI->>Store: createDivision(data)
    Store->>API: POST /api/v1/divisions
    API->>Controller: create()
    Controller->>Controller: Validar code único
    Controller->>Model: new Division(data)
    Model->>DB: save()
    DB-->>Model: División guardada
    Model-->>Controller: División creada
    Controller-->>API: 201 Created
    API-->>Store: División
    Store->>Store: Agregar a lista
    Store-->>UI: Success
    UI->>Usuario: Cerrar modal + notificación
    
    Note over Usuario,DB: Asignar Manager
    Usuario->>UI: Editar división
    Usuario->>UI: Seleccionar nuevo manager
    UI->>Store: updateDivision(id, {managerId})
    Store->>API: PUT /api/v1/divisions/:id
    API->>Controller: update()
    Controller->>Controller: Validar que manager existe
    Controller->>Model: findByIdAndUpdate()
    Model->>DB: Update
    DB-->>Model: División actualizada
    Model-->>Controller: División con nuevo manager
    Controller-->>API: 200 OK
    API-->>Store: División actualizada
    Store->>Store: Actualizar en lista
    Store-->>UI: Success
    UI->>Usuario: Notificación
```

## Endpoints del Módulo

```mermaid
graph TB
    BASE[/api/v1/divisions]
    
    BASE --> GET_ALL[GET /]
    BASE --> GET_ONE[GET /:id]
    BASE --> CREATE[POST /]
    BASE --> UPDATE[PUT /:id]
    BASE --> DELETE[DELETE /:id]
    BASE --> GET_MANAGERS[GET /managers]
    BASE --> GET_EMPLOYEES[GET /:id/employees]
    
    GET_ALL --> POPULATE_MGR[populate manager]
    GET_ONE --> FULL_DATA[con employees y manager]
    GET_EMPLOYEES --> EMP_LIST[Lista empleados de la división]
    GET_MANAGERS --> MGR_LIST[Lista empleados disponibles como managers]
    
    style BASE fill:#1976d2
    style CREATE fill:#4caf50
    style UPDATE fill:#ff9800
    style DELETE fill:#f44336
```

## Flujo de Asignación de Manager

```mermaid
flowchart TD
    START([Usuario edita División])
    
    START --> OPEN_FORM[Abrir formulario edición]
    OPEN_FORM --> LOAD_MANAGERS[Cargar lista de empleados<br/>para combobox manager]
    
    LOAD_MANAGERS --> GET_EMPLOYEES[GET /api/v1/employees]
    GET_EMPLOYEES --> FILTER_EMP{Filtrar empleados<br/>elegibles?}
    
    FILTER_EMP -->|Sí| FILTER_ROLE[Solo roles: Manager, Tech Lead,<br/>Arquitecto, CEO]
    FILTER_EMP -->|No| ALL_EMP[Todos los empleados]
    
    FILTER_ROLE --> SHOW_COMBO[Mostrar en combobox]
    ALL_EMP --> SHOW_COMBO
    
    SHOW_COMBO --> USER_SELECT{Usuario selecciona<br/>manager?}
    
    USER_SELECT -->|Sí| SELECT_MGR[Seleccionar empleado]
    USER_SELECT -->|No| NO_MGR[Sin manager]
    
    SELECT_MGR --> VALIDATE{Manager válido?}
    NO_MGR --> SAVE_NULL[Guardar managerId = null]
    
    VALIDATE -->|No| ERROR[Error: Manager no existe]
    VALIDATE -->|Sí| CHECK_SAME{Es el mismo<br/>que antes?}
    
    CHECK_SAME -->|Sí| NO_CHANGE[Sin cambios]
    CHECK_SAME -->|No| UPDATE_DIV[PUT /divisions/:id]
    
    UPDATE_DIV --> UPDATE_DB[Actualizar en DB]
    UPDATE_DB --> SUCCESS[Division actualizada]
    
    SAVE_NULL --> UPDATE_DB
    
    ERROR --> END_ERROR([Mostrar error])
    NO_CHANGE --> END_OK([Sin acción])
    SUCCESS --> END_OK
    
    style START fill:#4caf50
    style SUCCESS fill:#4caf50
    style ERROR fill:#f44336
    style UPDATE_DIV fill:#2196f3
```

## Relaciones con Empleados

```mermaid
graph TB
    DIVISION[División]
    
    DIVISION --> HAS_MANAGER[Tiene Manager]
    DIVISION --> HAS_EMPLOYEES[Tiene Empleados]
    DIVISION --> HAS_FLOW[Tiene Flujo Aprobación]
    DIVISION --> GENERATES_CSW[Genera CSW]
    
    HAS_MANAGER --> MANAGER[Employee<br/>managerId reference]
    HAS_EMPLOYEES --> EMPLOYEES[Employees[]<br/>divisionId reference]
    HAS_FLOW --> FLOW[ApprovalFlow<br/>divisionId reference]
    GENERATES_CSW --> CSW[CSW[]<br/>requesterDivision reference]
    
    MANAGER -.->|opcional| NULL[Puede ser null]
    EMPLOYEES -.->|0 o más| MULTIPLE[Lista de empleados]
    FLOW -.->|0 o 1| SINGLE[Un flujo por división]
    CSW -.->|0 o más| REQUESTS[Solicitudes de la división]
    
    style DIVISION fill:#1976d2
    style MANAGER fill:#ff9800
    style EMPLOYEES fill:#4caf50
```

## Validaciones del Modelo

```mermaid
flowchart TD
    START([Datos del formulario])
    
    START --> VAL_NAME{Name requerido<br/>y válido?}
    VAL_NAME -->|No| ERR_NAME[Error: Nombre requerido]
    VAL_NAME -->|Sí| VAL_CODE{Code requerido?}
    
    VAL_CODE -->|No| ERR_CODE[Error: Código requerido]
    VAL_CODE -->|Sí| VAL_CODE_UNIQUE{Code único?}
    
    VAL_CODE_UNIQUE -->|No| ERR_CODE_UNIQUE[Error: Código ya existe]
    VAL_CODE_UNIQUE -->|Sí| VAL_MANAGER{ManagerId<br/>proporcionado?}
    
    VAL_MANAGER -->|No| SAVE_NO_MGR[Guardar sin manager]
    VAL_MANAGER -->|Sí| CHECK_MGR_EXISTS{Manager existe<br/>en DB?}
    
    CHECK_MGR_EXISTS -->|No| ERR_MGR[Error: Manager no existe]
    CHECK_MGR_EXISTS -->|Sí| SAVE_WITH_MGR[Guardar con manager]
    
    SAVE_WITH_MGR --> SUCCESS([División guardada])
    SAVE_NO_MGR --> SUCCESS
    
    ERR_NAME --> FAIL([Validación fallida])
    ERR_CODE --> FAIL
    ERR_CODE_UNIQUE --> FAIL
    ERR_MGR --> FAIL
    
    style START fill:#4caf50
    style SUCCESS fill:#4caf50
    style FAIL fill:#f44336
```

## Componentes UI del Módulo

```mermaid
graph TB
    PAGE[DivisionsList Page]
    
    PAGE --> HEADER[Page Header]
    PAGE --> CREATE_BTN[CreateButton]
    PAGE --> TABLE[DataTable]
    PAGE --> MODAL[DivisionModal]
    
    HEADER --> TITLE[Título: Divisiones]
    HEADER --> BREADCRUMB[Breadcrumb]
    
    CREATE_BTN -.->|Permisos| PERM_CREATE[divisions.create]
    
    TABLE --> COLUMNS[Columnas]
    TABLE --> ROWS[Rows con datos]
    TABLE --> ACTIONS[TableActions]
    
    COLUMNS --> COL_NAME[Name]
    COLUMNS --> COL_CODE[Code]
    COLUMNS --> COL_DESC[Description]
    COLUMNS --> COL_MANAGER[Manager]
    COLUMNS --> COL_ACTIONS[Actions]
    
    ACTIONS --> VIEW[Ver]
    ACTIONS --> EDIT[Editar]
    ACTIONS --> DELETE[Eliminar]
    
    VIEW -.->|Permisos| PERM_READ[divisions.read]
    EDIT -.->|Permisos| PERM_UPDATE[divisions.update]
    DELETE -.->|Permisos| PERM_DELETE[divisions.delete]
    
    MODAL --> FORM[Formulario]
    FORM --> INPUT_NAME[Input: Name]
    FORM --> INPUT_CODE[Input: Code]
    FORM --> INPUT_DESC[Textarea: Description]
    FORM --> SELECT_MGR[Select: Manager]
    FORM --> BTNS[Botones]
    
    BTNS --> SAVE[Guardar]
    BTNS --> CANCEL[Cancelar]
    
    style PAGE fill:#2196f3
    style CREATE_BTN fill:#4caf50
    style DELETE fill:#f44336
```

## Flujo de Eliminación (Soft Delete)

```mermaid
sequenceDiagram
    actor Usuario
    participant UI
    participant Store
    participant API
    participant Controller
    participant DivisionModel
    participant EmployeeModel
    participant DB
    
    Usuario->>UI: Click "Eliminar" en división
    UI->>UI: Mostrar confirmación
    Usuario->>UI: Confirmar eliminación
    
    UI->>Store: deleteDivision(divisionId)
    Store->>API: DELETE /api/v1/divisions/:id
    
    API->>Controller: delete(divisionId)
    
    Note over Controller,EmployeeModel: Verificar si tiene empleados
    Controller->>EmployeeModel: count({divisionId, deleted: false})
    
    EmployeeModel->>DB: Query count
    DB-->>EmployeeModel: count
    
    alt Tiene empleados activos
        EmployeeModel-->>Controller: count > 0
        Controller-->>API: 400 Bad Request
        API-->>Store: Error
        Store-->>UI: Mostrar error
        UI->>Usuario: No se puede eliminar:<br/>tiene empleados asignados
    else Sin empleados
        EmployeeModel-->>Controller: count = 0
        Controller->>DivisionModel: softDelete(divisionId)
        DivisionModel->>DB: update({deleted: true})
        DB-->>DivisionModel: División marcada eliminada
        DivisionModel-->>Controller: Success
        Controller-->>API: 200 OK
        API-->>Store: División eliminada
        Store->>Store: Remover de lista
        Store-->>UI: Success
        UI->>Usuario: Notificación: División eliminada
    end
```

## Estados del Store (MobX)

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> LoadingList: loadDivisions()
    LoadingList --> ListLoaded: Success
    LoadingList --> Error: Failure
    
    ListLoaded --> Idle: Reset
    Error --> Idle: Retry
    
    Idle --> Creating: createDivision()
    Creating --> ListLoaded: División creada
    Creating --> Error: Error creación
    
    ListLoaded --> Updating: updateDivision()
    Updating --> ListLoaded: División actualizada
    Updating --> Error: Error actualización
    
    ListLoaded --> Deleting: deleteDivision()
    Deleting --> ListLoaded: División eliminada
    Deleting --> Error: Error eliminación
    
    ListLoaded --> LoadingManagers: loadManagers()
    LoadingManagers --> ManagersLoaded: Managers cargados
    LoadingManagers --> Error: Error carga
    
    ManagersLoaded --> ListLoaded: Volver
```

## Funcionalidades del Módulo

```mermaid
mindmap
  root((Divisions<br/>Module))
    CRUD Básico
      Crear división
      Listar divisiones
      Editar división
      Eliminar soft
    Gestión Manager
      Asignar manager
      Cambiar manager
      Remover manager
      Ver empleados del manager
    Validaciones
      Code único
      Name requerido
      Manager válido
      No eliminar si tiene empleados
    Relaciones
      Con Employees
      Con ApprovalFlows
      Con CSW
    UI Features
      Tabla responsive
      Modal form
      Confirmaciones
      Notificaciones
    Permisos
      divisions read
      divisions create
      divisions update
      divisions delete
```

## Impacto de División en Otros Módulos

```mermaid
graph TB
    DIV[División]
    
    DIV --> EMP_IMPACT[Impacto en Empleados]
    DIV --> FLOW_IMPACT[Impacto en Approval Flows]
    DIV --> CSW_IMPACT[Impacto en CSW]
    
    EMP_IMPACT --> EMP_ASSIGNED[Empleados asignados<br/>a la división]
    EMP_IMPACT --> EMP_MANAGER[Manager de la división]
    EMP_IMPACT --> EMP_FILTER[Filtros por división<br/>en lista empleados]
    
    FLOW_IMPACT --> FLOW_CONFIG[Flujo de aprobación<br/>configurado por división]
    FLOW_IMPACT --> FLOW_LEVELS[Niveles y aprobadores<br/>específicos]
    
    CSW_IMPACT --> CSW_AUTO[CSW automáticamente<br/>toma división del solicitante]
    CSW_IMPACT --> CSW_FLOW[CSW usa flujo<br/>de esa división]
    CSW_IMPACT --> CSW_STATS[Estadísticas por división]
    
    style DIV fill:#1976d2
    style EMP_IMPACT fill:#4caf50
    style FLOW_IMPACT fill:#ff9800
    style CSW_IMPACT fill:#9c27b0
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
