# Backend — RH-UNLIMITECH API

API REST para el sistema de gestión de RRHH. Express 5 + MongoDB + TypeScript.

---

## Inicio Rápido

```bash
# Requisitos: Docker corriendo con MongoDB (ver docker-compose.yml en raíz)

npm install              # Instalar dependencias
cp .env.example .env     # Configurar variables (o usar defaults)
npm run seed             # Poblar base de datos
npm run dev              # http://localhost:9050
```

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload (ts-node-dev) |
| `npm run build` | Compilar TypeScript a dist/ |
| `npm start` | Ejecutar versión compilada |
| `npm run seed` | Poblar BD desde cero (⚠️ borra datos) |
| `npm run db:reset-password` | Resetear contraseñas por defecto |
| `npm run db:check-permissions` | Listar permisos y roles actuales |

### Migraciones

```bash
npx ts-node src/database/migrations/001-add-status-to-employees.ts
npx ts-node src/database/migrations/002-fix-divisions-managerId.ts
npx ts-node src/database/migrations/003-add-permissions-module.ts
```

---

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # Conexión MongoDB (Mongoose)
│   │   ├── env.ts             # Variables de entorno tipadas
│   │   └── swagger.ts         # Configuración Swagger/OpenAPI
│   ├── models/
│   │   ├── base/BaseModel.ts  # Interface base (timestamps, soft delete)
│   │   ├── Employee.ts        # Empleados (bcrypt, foto base64)
│   │   ├── Division.ts        # Divisiones organizacionales
│   │   ├── Role.ts            # Roles con permisos
│   │   ├── Permission.ts      # Permisos (resource + action)
│   │   ├── CSW.ts             # Solicitudes CSW
│   │   ├── CSWCategory.ts     # Categorías de solicitud
│   │   ├── CSWHistory.ts      # Historial de cambios CSW
│   │   └── ApprovalFlow.ts    # Flujos de aprobación por división
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── employees.controller.ts
│   │   ├── divisions.controller.ts
│   │   ├── roles.controller.ts
│   │   ├── permissions.controller.ts
│   │   ├── csw.controller.ts
│   │   ├── cswCategory.controller.ts
│   │   └── approvalFlow.controller.ts
│   ├── routes/                # Express Router por módulo
│   ├── middleware/
│   │   ├── auth.ts            # JWT cookie verification
│   │   ├── permission.ts      # RBAC check (resource:action)
│   │   ├── cors.ts            # CORS config
│   │   ├── error.ts           # Error handler global
│   │   └── swaggerAuth.ts     # Cookie pass-through para Swagger
│   ├── database/              # 📦 Migrations & Seeds
│   │   ├── migrations/        # Cambios incrementales
│   │   ├── seeds/             # Datos iniciales
│   │   └── README.md          # Documentación completa
│   ├── scripts/               # Utilidades de desarrollo
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Entry point
├── .env                       # Variables de entorno
├── .env.example               # Template
├── package.json
└── tsconfig.json
```

---

## API Endpoints

**Base URL:** `http://localhost:9050/api/v1`

### Autenticación
```
POST   /auth/login            # Login (devuelve cookie JWT)
POST   /auth/logout           # Logout (limpia cookie)
GET    /auth/me               # Usuario actual
POST   /auth/refresh          # Refrescar token
```

### Empleados
```
GET    /employees             # Listar (paginado, filtros)
GET    /employees/:id         # Obtener por ID
POST   /employees             # Crear
PUT    /employees/:id         # Actualizar
DELETE /employees/:id         # Soft delete
```

### Divisiones
```
GET    /divisions             # Listar
GET    /divisions/:id         # Obtener por ID
POST   /divisions             # Crear
PUT    /divisions/:id         # Actualizar
DELETE /divisions/:id         # Soft delete
```

### Roles y Permisos
```
GET    /roles                 # Listar roles
POST   /roles                 # Crear rol
PUT    /roles/:id             # Actualizar rol
DELETE /roles/:id             # Eliminar rol
GET    /permissions           # Listar permisos
GET    /permissions/by-resource # Permisos agrupados
```

### CSW (Solicitudes)
```
GET    /csw                   # Listar solicitudes
GET    /csw/:id               # Detalle
POST   /csw                   # Crear solicitud
PUT    /csw/:id               # Editar (si rechazada)
DELETE /csw/:id               # Cancelar
POST   /csw/:id/approve       # Aprobar nivel
POST   /csw/:id/reject        # Rechazar
GET    /csw/my-requests       # Mis solicitudes
GET    /csw/pending-approvals # Pendientes de aprobar
```

### Categorías CSW
```
GET    /csw-categories        # Listar
POST   /csw-categories        # Crear
PUT    /csw-categories/:id    # Actualizar
DELETE /csw-categories/:id    # Eliminar
```

### Flujos de Aprobación
```
GET    /approval-flows                    # Listar todos
GET    /approval-flows/:id                # Detalle
GET    /approval-flows/by-division/:id    # Por división
POST   /approval-flows                    # Crear
PUT    /approval-flows/:id                # Actualizar
DELETE /approval-flows/:id                # Eliminar
```

---

## Autenticación

- JWT almacenado en cookie **httpOnly** (protección XSS)
- Expiración: 48 horas
- SameSite: `lax` (compatible con Swagger)
- Renovación automática con `/auth/refresh`

---

## Sistema de Permisos (RBAC)

Cada permiso es una combinación `resource:action`. El middleware `requirePermission('employees', 'create')` verifica que el rol del usuario tenga ese permiso asignado.

**Roles predefinidos:**
- ARCHITECT SOLUTIONS — Admin total (32 permisos)
- ARCHITECT TECHNICAL — Lectura + aprobación técnica
- AI DRIVEN DEVELOPER — Lectura + creación básica
- AI DRIVEN QA — Solo lectura
- HUMAN TALENT — Gestión de personal completa

---

## Variables de Entorno

```env
NODE_ENV=development
PORT=9050
MONGO_URI=mongodb://localhost:27017/rh_management
JWT_SECRET=f7c58e1d2b2bfbfda756da1d442a58b0639300bd
FRONTEND_URL=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## Notas Técnicas

- Todos los modelos usan **soft delete** (`deleted: boolean`)
- Timestamps automáticos (`createdAt`, `updatedAt`)
- Passwords hasheados con **bcrypt** (salt 10)
- CORS permite origins `http://localhost:*`
- Swagger UI disponible en `/api-docs`
- Express 5.x con soporte nativo de async errors

---

**Última actualización:** Junio 24, 2026
