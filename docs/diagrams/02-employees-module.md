# Módulo de Empleados (Employees)

## Arquitectura del Módulo

```mermaid
graph TB
    subgraph "Frontend"
        EMP_LIST[EmployeesList Page]
        EMP_MODAL[Employee Modal Form]
        EMP_STORE[EmployeesStore]
        EMP_API[employeesApi]
        TABLE[Tabla con Paginación]
        FILTERS[Filtros y Búsqueda]
    end
    
    subgraph "Backend"
        EMP_ROUTES[/api/v1/employees]
        EMP_CONTROLLER[EmployeesController]
        EMP_MODEL[Employee Model]
    end
    
    subgraph "Middleware"
        AUTH[Auth Middleware]
        PERM[Permission Middleware]
    end
    
    subgraph "Relaciones"
        DIVISION[Division Model]
        ROLE[Role Model]
    end
    
    EMP_LIST --> TABLE
    EMP_LIST --> FILTERS
    EMP_LIST --> EMP_MODAL
    EMP_LIST --> EMP_STORE
    
    EMP_MODAL --> EMP_STORE
    EMP_STORE --> EMP_API
    EMP_API --> EMP_ROUTES
    
    EMP_ROUTES --> AUTH
    EMP_ROUTES --> PERM
    AUTH --> EMP_CONTROLLER
    PERM --> EMP_CONTROLLER
    
    EMP_CONTROLLER --> EMP_MODEL
    EMP_MODEL --> DIVISION
    EMP_MODEL --> ROLE
    
    style EMP_LIST fill:#2196f3
    style EMP_CONTROLLER fill:#ff9800
    style EMP_MODEL fill:#4caf50
```

## Flujo CRUD Completo

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant Store
    participant API
    participant Controller
    participant Model
    participant DB
    
    Note over Usuario,DB: CREATE - Crear Empleado
    Usuario->>Frontend: Click "Crear Empleado"
    Frontend->>Frontend: Abrir Modal
    Usuario->>Frontend: Llenar formulario
    Frontend->>Store: createEmployee(data)
    Store->>API: POST /api/v1/employees
    API->>Controller: create()
    Controller->>Model: new Employee(data)
    Model->>DB: save()
    DB-->>Model: Empleado guardado
    Model-->>Controller: Empleado con ID
    Controller-->>API: 201 Created
    API-->>Store: Empleado creado
    Store->>Store: Actualizar lista
    Store-->>Frontend: Success
    Frontend->>Usuario: Cerrar modal + notificación
    
    Note over Usuario,DB: READ - Listar Empleados
    Usuario->>Frontend: Accede a /employees
    Frontend->>Store: loadEmployees()
    Store->>API: GET /api/v1/employees?page=1&limit=10
    API->>Controller: getAll()
    Controller->>Model: find() + populate()
    Model->>DB: Query con paginación
    DB-->>Model: Lista de empleados
    Model-->>Controller: Empleados con relaciones
    Controller-->>API: 200 OK + data
    API-->>Store: Lista de empleados
    Store-->>Frontend: Renderizar tabla
    
    Note over Usuario,DB: UPDATE - Editar Empleado
    Usuario->>Frontend: Click "Editar"
    Frontend->>Frontend: Abrir Modal con datos
    Usuario->>Frontend: Modificar campos
    Frontend->>Store: updateEmployee(id, data)
    Store->>API: PUT /api/v1/employees/:id
    API->>Controller: update()
    Controller->>Model: findByIdAndUpdate()
    Model->>DB: update()
    DB-->>Model: Empleado actualizado
    Model-->>Controller: Empleado modificado
    Controller-->>API: 200 OK
    API-->>Store: Empleado actualizado
    Store->>Store: Actualizar en lista
    Store-->>Frontend: Success
    Frontend->>Usuario: Cerrar modal + notificación
    
    Note over Usuario,DB: DELETE - Eliminar Empleado (Soft)
    Usuario->>Frontend: Click "Eliminar"
    Frontend->>Frontend: Confirmar acción
    Usuario->>Frontend: Confirmar
    Frontend->>Store: deleteEmployee(id)
    Store->>API: DELETE /api/v1/employees/:id
    API->>Controller: delete()
    Controller->>Model: softDelete()
    Model->>DB: update({deleted: true})
    DB-->>Model: Empleado marcado como eliminado
    Model-->>Controller: Success
    Controller-->>API: 200 OK
    API-->>Store: Empleado eliminado
    Store->>Store: Remover de lista
    Store-->>Frontend: Success
    Frontend->>Usuario: Notificación
```

## Modelo de Datos Employee

```mermaid
erDiagram
    EMPLOYEE {
        ObjectId _id PK
        string name
        string email UK
        string password
        string phone
        string position
        ObjectId divisionId FK
        ObjectId roleId FK
        string photoUrl
        date birthDate
        string nationality
        boolean forcePasswordChange
        boolean deleted
        date createdAt
        date updatedAt
    }
    
    DIVISION {
        ObjectId _id PK
        string name
        string code
        string description
        ObjectId managerId FK
    }
    
    ROLE {
        ObjectId _id PK
        string name
        string description
        array permissions
    }
    
    PERMISSION {
        string resource
        string action
    }
    
    EMPLOYEE ||--o{ DIVISION : "pertenece a"
    EMPLOYEE ||--o{ ROLE : "tiene"
    ROLE ||--|{ PERMISSION : "contiene"
    DIVISION ||--o{ EMPLOYEE : "dirigida por (manager)"
```

## Endpoints del Módulo

```mermaid
graph TB
    BASE[/api/v1/employees]
    
    BASE --> GET_ALL[GET /]
    BASE --> GET_ONE[GET /:id]
    BASE --> CREATE[POST /]
    BASE --> UPDATE[PUT /:id]
    BASE --> DELETE[DELETE /:id]
    BASE --> CHANGE_PASS[POST /:id/change-password]
    BASE --> GENERATE_PASS[POST /:id/generate-password]
    
    GET_ALL --> PAGINATION[?page=1&limit=10]
    GET_ALL --> SEARCH[?search=nombre]
    GET_ALL --> FILTER_DIV[?division=id]
    GET_ALL --> FILTER_ROLE[?role=id]
    
    style BASE fill:#1976d2
    style CREATE fill:#4caf50
    style UPDATE fill:#ff9800
    style DELETE fill:#f44336
```

## Flujo de Filtros y Búsqueda

```mermaid
flowchart TD
    START([Usuario en Lista de Empleados])
    
    START --> FILTERS{Aplicar filtros?}
    
    FILTERS -->|Búsqueda por texto| SEARCH_INPUT[Input de búsqueda]
    FILTERS -->|Filtro por división| DIV_FILTER[Combobox División]
    FILTERS -->|Filtro por rol| ROLE_FILTER[Combobox Rol]
    FILTERS -->|Sin filtros| LOAD_ALL[Cargar todos]
    
    SEARCH_INPUT --> BUILD_QUERY[Construir query]
    DIV_FILTER --> BUILD_QUERY
    ROLE_FILTER --> BUILD_QUERY
    LOAD_ALL --> BUILD_QUERY
    
    BUILD_QUERY --> API_CALL[GET /employees?filters]
    
    API_CALL --> BACKEND[Backend recibe query]
    
    BACKEND --> MONGO_QUERY{Tipo de filtro?}
    
    MONGO_QUERY -->|Texto| TEXT_SEARCH[Regex en name/email]
    MONGO_QUERY -->|División| DIV_MATCH[Match divisionId]
    MONGO_QUERY -->|Rol| ROLE_MATCH[Match roleId]
    
    TEXT_SEARCH --> EXECUTE_QUERY[Ejecutar en MongoDB]
    DIV_MATCH --> EXECUTE_QUERY
    ROLE_MATCH --> EXECUTE_QUERY
    
    EXECUTE_QUERY --> PAGINATE[Aplicar paginación]
    PAGINATE --> POPULATE[Populate relations]
    
    POPULATE --> RETURN_DATA[Return datos filtrados]
    RETURN_DATA --> UPDATE_UI[Actualizar tabla UI]
    
    UPDATE_UI --> END([Mostrar resultados])
    
    style START fill:#4caf50
    style END fill:#4caf50
    style BUILD_QUERY fill:#2196f3
    style EXECUTE_QUERY fill:#ff9800
```

## Estados del Store (MobX)

```mermaid
stateDiagram-v2
    [*] --> Idle: Inicialización
    
    Idle --> Loading: loadEmployees()
    Loading --> Loaded: Datos recibidos
    Loading --> Error: Error en carga
    
    Loaded --> Idle: Reset
    Error --> Idle: Retry
    
    Idle --> Creating: createEmployee()
    Creating --> Loaded: Empleado creado
    Creating --> Error: Error en creación
    
    Loaded --> Updating: updateEmployee()
    Updating --> Loaded: Empleado actualizado
    Updating --> Error: Error en actualización
    
    Loaded --> Deleting: deleteEmployee()
    Deleting --> Loaded: Empleado eliminado
    Deleting --> Error: Error en eliminación
```

## Componentes UI del Módulo

```mermaid
graph TB
    PAGE[EmployeesList Page]
    
    PAGE --> HEADER[Page Header]
    PAGE --> CREATE_BTN[CreateButton]
    PAGE --> SEARCH[SearchInput]
    PAGE --> DIV_FILTER[DivisionFilter]
    PAGE --> ROLE_FILTER[RoleFilter]
    PAGE --> TABLE_COMP[DataTable]
    PAGE --> MODAL[EmployeeModal]
    
    HEADER --> TITLE[Título: Empleados]
    HEADER --> BREADCRUMB[Breadcrumb]
    
    CREATE_BTN -.->|Permisos| PERM_CREATE[employees.create]
    
    TABLE_COMP --> COLUMNS[Columnas]
    TABLE_COMP --> ROWS[Filas con datos]
    TABLE_COMP --> PAGINATION_COMP[Paginación]
    TABLE_COMP --> ACTIONS[TableActions]
    
    ACTIONS --> VIEW_BTN[Ver]
    ACTIONS --> EDIT_BTN[Editar]
    ACTIONS --> DELETE_BTN[Eliminar]
    
    VIEW_BTN -.->|Permisos| PERM_READ[employees.read]
    EDIT_BTN -.->|Permisos| PERM_UPDATE[employees.update]
    DELETE_BTN -.->|Permisos| PERM_DELETE[employees.delete]
    
    MODAL --> FORM[Formulario]
    FORM --> FIELDS[Campos de entrada]
    FORM --> PHOTO_UPLOAD[Upload foto]
    FORM --> SUBMIT[Guardar]
    FORM --> CANCEL[Cancelar]
    
    style PAGE fill:#2196f3
    style CREATE_BTN fill:#4caf50
    style DELETE_BTN fill:#f44336
```

## Validaciones del Modelo

```mermaid
flowchart TD
    START([Datos del formulario])
    
    START --> VAL_EMAIL{Email válido?}
    VAL_EMAIL -->|No| ERR_EMAIL[Error: Email inválido]
    VAL_EMAIL -->|Sí| VAL_UNIQUE{Email único?}
    
    VAL_UNIQUE -->|No| ERR_UNIQUE[Error: Email ya existe]
    VAL_UNIQUE -->|Sí| VAL_PASSWORD{Password seguro?}
    
    VAL_PASSWORD -->|No| ERR_PASS[Error: Password débil]
    VAL_PASSWORD -->|Sí| VAL_PHONE{Teléfono válido?}
    
    VAL_PHONE -->|No| ERR_PHONE[Error: Teléfono inválido]
    VAL_PHONE -->|Sí| VAL_DIVISION{División existe?}
    
    VAL_DIVISION -->|No| ERR_DIV[Error: División inválida]
    VAL_DIVISION -->|Sí| VAL_ROLE{Rol existe?}
    
    VAL_ROLE -->|No| ERR_ROLE[Error: Rol inválido]
    VAL_ROLE -->|Sí| HASH_PASS[Hash password]
    
    HASH_PASS --> SAVE_DB[Guardar en DB]
    SAVE_DB --> SUCCESS([Empleado creado])
    
    ERR_EMAIL --> FAIL([Validación fallida])
    ERR_UNIQUE --> FAIL
    ERR_PASS --> FAIL
    ERR_PHONE --> FAIL
    ERR_DIV --> FAIL
    ERR_ROLE --> FAIL
    
    style START fill:#4caf50
    style SUCCESS fill:#4caf50
    style FAIL fill:#f44336
    style SAVE_DB fill:#2196f3
```

## Funcionalidades Especiales

```mermaid
mindmap
  root((Employees<br/>Module))
    CRUD Completo
      Crear
      Leer
      Actualizar
      Eliminar soft
    Filtros Avanzados
      Búsqueda texto
      Por división
      Por rol
      Por estado
    Paginación
      10, 25, 50, 100
      Navegación páginas
      Total registros
    Gestión Password
      Cambio forzado
      Generador automático
      Hash seguro bcrypt
    Upload Imagen
      Foto perfil
      Base64 o URL
      Validación formato
    Relaciones
      División asignada
      Rol asignado
      Manager de división
    Validaciones
      Email único
      Formato email
      Password seguro
      Teléfono válido
    Permisos
      employees read
      employees create
      employees update
      employees delete
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
