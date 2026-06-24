# Módulo de Autenticación

## Flujo Completo de Login

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant SignIn Form
    participant AuthStore
    participant API
    participant AuthController
    participant Employee Model
    participant JWT
    
    Usuario->>Frontend: Accede a /signin
    Frontend->>SignIn Form: Renderiza formulario
    Usuario->>SignIn Form: Ingresa email y password
    SignIn Form->>AuthStore: login(email, password)
    
    AuthStore->>API: POST /api/v1/auth/login
    API->>AuthController: login()
    
    AuthController->>Employee Model: findOne({ email })
    Employee Model-->>AuthController: Usuario encontrado
    
    AuthController->>AuthController: Verificar password (bcrypt)
    
    alt Password Correcto
        AuthController->>Employee Model: populate('role.permissions')
        Employee Model-->>AuthController: Usuario con rol y permisos
        
        AuthController->>JWT: Generar token
        JWT-->>AuthController: Token JWT
        
        AuthController->>API: Set Cookie (httpOnly, secure)
        API-->>AuthStore: 200 OK + usuario data
        
        AuthStore->>AuthStore: Guardar usuario y permisos
        AuthStore-->>Frontend: Login exitoso
        Frontend->>Usuario: Redirect a /dashboard
    else Password Incorrecto
        AuthController-->>API: 401 Unauthorized
        API-->>AuthStore: Error
        AuthStore-->>Frontend: Mostrar error
        Frontend->>Usuario: Mensaje de error
    end
```

## Arquitectura del Sistema de Autenticación

```mermaid
graph TB
    subgraph "Frontend - Auth"
        LOGIN_PAGE[SignIn Page]
        AUTH_STORE[AuthStore - MobX]
        AUTH_API[Auth API Client]
        PROTECTED[ProtectedRoute Component]
    end
    
    subgraph "Backend - Auth"
        AUTH_ROUTES[/api/v1/auth]
        AUTH_CONTROLLER[AuthController]
        AUTH_MW[Auth Middleware]
    end
    
    subgraph "Models"
        EMPLOYEE[Employee Model]
        ROLE[Role Model]
        PERMISSION[Permission Model]
    end
    
    subgraph "Security"
        JWT_GEN[JWT Generator]
        BCRYPT[Bcrypt]
        COOKIES[HTTP Cookies]
    end
    
    LOGIN_PAGE --> AUTH_STORE
    AUTH_STORE --> AUTH_API
    AUTH_API --> AUTH_ROUTES
    AUTH_ROUTES --> AUTH_CONTROLLER
    
    AUTH_CONTROLLER --> EMPLOYEE
    AUTH_CONTROLLER --> BCRYPT
    AUTH_CONTROLLER --> JWT_GEN
    AUTH_CONTROLLER --> COOKIES
    
    EMPLOYEE --> ROLE
    ROLE --> PERMISSION
    
    AUTH_MW --> JWT_GEN
    AUTH_MW --> COOKIES
    
    PROTECTED --> AUTH_STORE
    
    style LOGIN_PAGE fill:#2196f3
    style AUTH_CONTROLLER fill:#ff9800
    style JWT_GEN fill:#f44336
```

## Estados de Autenticación

```mermaid
stateDiagram-v2
    [*] --> Loading: App Inicia
    
    Loading --> CheckingAuth: checkAuth()
    
    CheckingAuth --> Authenticated: Token Válido
    CheckingAuth --> NotAuthenticated: Sin Token / Token Inválido
    
    NotAuthenticated --> Authenticating: Usuario hace Login
    
    Authenticating --> Authenticated: Credenciales Válidas
    Authenticating --> NotAuthenticated: Credenciales Inválidas
    
    Authenticated --> AccessingResource: Usuario navega
    
    AccessingResource --> Authorized: Tiene Permisos
    AccessingResource --> Unauthorized: Sin Permisos
    
    Authorized --> Authenticated: Continuar
    Unauthorized --> Authenticated: Mostrar 403
    
    Authenticated --> NotAuthenticated: Logout
    Authenticated --> NotAuthenticated: Token Expirado
    
    NotAuthenticated --> [*]: Redirect a /signin
```

## Flujo de Verificación de Token (Middleware)

```mermaid
flowchart TD
    START([Request Recibido]) --> CHECK_COOKIE{¿Cookie JWT<br/>existe?}
    
    CHECK_COOKIE -->|No| NO_TOKEN[Error: No autenticado]
    NO_TOKEN --> RETURN_401[Return 401]
    
    CHECK_COOKIE -->|Sí| VERIFY_TOKEN{¿Token JWT<br/>válido?}
    
    VERIFY_TOKEN -->|No| INVALID_TOKEN[Error: Token inválido]
    INVALID_TOKEN --> CLEAR_COOKIE[Limpiar cookie]
    CLEAR_COOKIE --> RETURN_401
    
    VERIFY_TOKEN -->|Sí| FIND_USER[Buscar usuario en DB]
    
    FIND_USER --> USER_EXISTS{¿Usuario<br/>existe?}
    
    USER_EXISTS -->|No| USER_NOT_FOUND[Error: Usuario no encontrado]
    USER_NOT_FOUND --> RETURN_401
    
    USER_EXISTS -->|Sí| LOAD_PERMISSIONS[Cargar rol y permisos]
    
    LOAD_PERMISSIONS --> ATTACH_USER[Adjuntar usuario a req.user]
    
    ATTACH_USER --> NEXT[next()]
    NEXT --> END([Continuar al Controller])
    
    RETURN_401 --> STOP([Request Terminado])
    
    style START fill:#4caf50
    style END fill:#4caf50
    style STOP fill:#f44336
    style RETURN_401 fill:#f44336
```

## Flujo de Logout

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant AuthStore
    participant API
    participant AuthController
    
    Usuario->>Frontend: Click en Logout
    Frontend->>AuthStore: logout()
    
    AuthStore->>API: POST /api/v1/auth/logout
    API->>AuthController: logout()
    
    AuthController->>AuthController: Clear JWT Cookie
    AuthController-->>API: 200 OK
    
    API-->>AuthStore: Logout exitoso
    AuthStore->>AuthStore: Limpiar usuario del store
    AuthStore->>AuthStore: Limpiar localStorage
    
    AuthStore-->>Frontend: Logout completado
    Frontend->>Usuario: Redirect a /signin
```

## Componentes de Autenticación

```mermaid
graph LR
    subgraph "Páginas"
        SIGNIN[SignIn Page]
    end
    
    subgraph "Stores"
        AUTH_STORE_C[AuthStore]
    end
    
    subgraph "API"
        AUTH_API_C[authApi.ts]
    end
    
    subgraph "Components"
        PROTECTED_ROUTE[ProtectedRoute]
        PERM_ROUTE[PermissionProtectedRoute]
    end
    
    subgraph "Hooks"
        USE_AUTH[useAuth]
        USE_PERM[usePermissions]
    end
    
    SIGNIN --> AUTH_STORE_C
    AUTH_STORE_C --> AUTH_API_C
    
    PROTECTED_ROUTE --> AUTH_STORE_C
    PERM_ROUTE --> AUTH_STORE_C
    PERM_ROUTE --> USE_PERM
    
    USE_AUTH --> AUTH_STORE_C
    USE_PERM --> AUTH_STORE_C
    
    style SIGNIN fill:#2196f3
    style AUTH_STORE_C fill:#9c27b0
    style PROTECTED_ROUTE fill:#ff9800
```

## Estructura de JWT Token

```mermaid
graph TB
    TOKEN[JWT Token]
    
    TOKEN --> HEADER[Header]
    TOKEN --> PAYLOAD[Payload]
    TOKEN --> SIGNATURE[Signature]
    
    HEADER --> ALG[Algorithm: HS256]
    HEADER --> TYP[Type: JWT]
    
    PAYLOAD --> USER_ID[userId: ObjectId]
    PAYLOAD --> EMAIL[email: string]
    PAYLOAD --> ROLE[roleId: ObjectId]
    PAYLOAD --> IAT[iat: timestamp]
    PAYLOAD --> EXP[exp: timestamp]
    
    SIGNATURE --> SECRET[JWT_SECRET]
    
    style TOKEN fill:#f44336
    style PAYLOAD fill:#2196f3
```

## Endpoints de Autenticación

```mermaid
graph LR
    API[/api/v1/auth]
    
    API --> LOGIN[POST /login]
    API --> LOGOUT[POST /logout]
    API --> ME[GET /me]
    API --> CHECK[GET /check]
    
    LOGIN --> LOGIN_CTRL[AuthController.login]
    LOGOUT --> LOGOUT_CTRL[AuthController.logout]
    ME --> ME_CTRL[AuthController.getMe]
    CHECK --> CHECK_CTRL[AuthController.checkAuth]
    
    LOGIN_CTRL -.->|Genera| JWT_COOKIE[JWT Cookie]
    LOGOUT_CTRL -.->|Limpia| JWT_COOKIE
    ME_CTRL -.->|Requiere| AUTH_MW[Auth Middleware]
    CHECK_CTRL -.->|Verifica| JWT_COOKIE
    
    style API fill:#1976d2
    style JWT_COOKIE fill:#f44336
```

## Seguridad Implementada

```mermaid
mindmap
  root((Seguridad<br/>Autenticación))
    JWT Tokens
      HttpOnly Cookies
      Secure Flag
      SameSite
      Expiración 7 días
    Passwords
      Bcrypt Hash
      Salt Rounds 10
      Validación fuerte
    CORS
      Origen permitido
      Credentials enabled
      Headers permitidos
    Validación
      Email format
      Password requirements
      Input sanitization
    Middleware
      Auth verificación
      Permission check
      Error handling
```

## Para visualizar estos diagramas:

1. Copia el código Mermaid
2. Ve a [https://mermaid.live/](https://mermaid.live/)
3. Pega el código en el editor
4. Exporta como PNG o SVG
