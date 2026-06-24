# Diagrama General del Sistema RH-UNLIMITECH

## Arquitectura General

```mermaid
graph TB
    subgraph "Cliente"
        USER[👤 Usuario]
        BROWSER[🌐 Navegador Web]
    end
    
    subgraph "Frontend - React"
        APP[App.tsx]
        ROUTER[React Router]
        STORES[MobX Stores]
        PAGES[Páginas/Componentes]
        API_CLIENT[API Client]
    end
    
    subgraph "Backend - Node.js + Express"
        EXPRESS[Express Server]
        MIDDLEWARE[Middleware Layer]
        ROUTES[Routes]
        CONTROLLERS[Controllers]
        MODELS[Mongoose Models]
    end
    
    subgraph "Base de Datos"
        MONGODB[(MongoDB)]
    end
    
    subgraph "Middleware Components"
        AUTH_MW[Auth Middleware]
        PERM_MW[Permission Middleware]
        CORS_MW[CORS Middleware]
        ERROR_MW[Error Handler]
    end
    
    USER --> BROWSER
    BROWSER --> APP
    APP --> ROUTER
    ROUTER --> PAGES
    PAGES --> STORES
    STORES --> API_CLIENT
    API_CLIENT -->|HTTP/REST| EXPRESS
    
    EXPRESS --> MIDDLEWARE
    MIDDLEWARE --> AUTH_MW
    MIDDLEWARE --> PERM_MW
    MIDDLEWARE --> CORS_MW
    MIDDLEWARE --> ERROR_MW
    
    AUTH_MW --> ROUTES
    PERM_MW --> ROUTES
    ROUTES --> CONTROLLERS
    CONTROLLERS --> MODELS
    MODELS --> MONGODB
    
    style USER fill:#e1f5ff
    style MONGODB fill:#4caf50
    style EXPRESS fill:#ff9800
    style APP fill:#2196f3
```

## Flujo de Datos Principal

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant API
    participant Auth
    participant Permission
    participant Controller
    participant DB
    
    Usuario->>Frontend: Interacción UI
    Frontend->>API: HTTP Request + JWT Cookie
    API->>Auth: Verificar Token
    Auth->>Permission: Verificar Permisos
    Permission->>Controller: Request Autorizado
    Controller->>DB: Query/Update
    DB-->>Controller: Datos
    Controller-->>API: Response
    API-->>Frontend: JSON Data
    Frontend-->>Usuario: UI Actualizada
```

## Módulos del Sistema

```mermaid
graph LR
    CORE[🏠 Core System]
    
    AUTH[🔐 Autenticación]
    EMP[👥 Empleados]
    DIV[🏢 Divisiones]
    ROLES[👔 Roles]
    PERM[🔑 Permisos]
    CSW[📋 CSW]
    FLOWS[🔄 Approval Flows]
    CAT[📑 Categorías]
    
    CORE --> AUTH
    CORE --> EMP
    CORE --> DIV
    CORE --> ROLES
    CORE --> PERM
    CORE --> CSW
    CORE --> FLOWS
    CORE --> CAT
    
    AUTH -.->|Protege| EMP
    AUTH -.->|Protege| DIV
    AUTH -.->|Protege| ROLES
    
    PERM -.->|Controla| EMP
    PERM -.->|Controla| DIV
    PERM -.->|Controla| CSW
    
    EMP -->|Pertenece a| DIV
    EMP -->|Tiene| ROLES
    ROLES -->|Tiene| PERM
    
    CSW -->|Usa| FLOWS
    CSW -->|Usa| CAT
    FLOWS -->|Por| DIV
    
    style CORE fill:#1976d2
    style AUTH fill:#f44336
    style CSW fill:#4caf50
```

## Stack Tecnológico

```mermaid
graph TB
    subgraph "Frontend Stack"
        REACT[React 19]
        TS_F[TypeScript 5.7]
        VITE[Vite 6]
        MOBX[MobX]
        TAILWIND[TailwindCSS 4]
        APEX[ApexCharts]
    end
    
    subgraph "Backend Stack"
        NODE[Node.js 20]
        EXPRESS_B[Express 4]
        TS_B[TypeScript 5.7]
        MONGOOSE[Mongoose 9]
        JWT[JWT Auth]
        SWAGGER[Swagger/OpenAPI]
    end
    
    subgraph "Database & DevOps"
        MONGO_DB[MongoDB 7]
        DOCKER[Docker Compose]
    end
    
    REACT --> TS_F
    REACT --> VITE
    REACT --> MOBX
    REACT --> TAILWIND
    REACT --> APEX
    
    NODE --> EXPRESS_B
    NODE --> TS_B
    EXPRESS_B --> MONGOOSE
    EXPRESS_B --> JWT
    EXPRESS_B --> SWAGGER
    
    MONGOOSE --> MONGO_DB
    DOCKER --> MONGO_DB
    DOCKER --> NODE
    
    style REACT fill:#61dafb
    style NODE fill:#339933
    style MONGO_DB fill:#47a248
```

## Flujo de Autenticación y Autorización

```mermaid
stateDiagram-v2
    [*] --> NoAutenticado
    
    NoAutenticado --> Autenticando: Login Request
    Autenticando --> Autenticado: Credenciales Válidas
    Autenticando --> NoAutenticado: Credenciales Inválidas
    
    Autenticado --> VerificandoPermisos: Acceso a Recurso
    VerificandoPermisos --> Autorizado: Tiene Permisos
    VerificandoPermisos --> NoAutorizado: Sin Permisos
    
    Autorizado --> Autenticado: Continuar Navegando
    NoAutorizado --> Autenticado: Volver
    
    Autenticado --> NoAutenticado: Logout
    Autenticado --> NoAutenticado: Token Expirado
    
    NoAutorizado --> [*]: Página 403
```

## Arquitectura de Carpetas

```mermaid
graph TB
    ROOT[/ RH-UNLIMITECH-CLOUD]
    
    ROOT --> BACKEND[📁 backend]
    ROOT --> FRONTEND[📁 frontend]
    ROOT --> DOCS[📁 docs]
    ROOT --> DOCKER[🐳 docker-compose.yml]
    
    BACKEND --> SRC_B[📁 src]
    SRC_B --> CONTROLLERS_B[📁 controllers]
    SRC_B --> MODELS_B[📁 models]
    SRC_B --> ROUTES_B[📁 routes]
    SRC_B --> MIDDLEWARE_B[📁 middleware]
    SRC_B --> CONFIG_B[📁 config]
    
    FRONTEND --> SRC_F[📁 src]
    SRC_F --> PAGES[📁 pages]
    SRC_F --> COMPONENTS[📁 components]
    SRC_F --> STORES[📁 stores]
    SRC_F --> API[📁 api]
    SRC_F --> LAYOUT[📁 layout]
    
    DOCS --> DIAGRAMS[📁 diagrams]
    
    style ROOT fill:#1976d2
    style BACKEND fill:#ff9800
    style FRONTEND fill:#2196f3
    style DOCS fill:#4caf50
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
