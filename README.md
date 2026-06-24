# Sistema de Gestión de RRHH — RH-UNLIMITECH

Sistema completo de gestión de recursos humanos con **React + TailAdmin Pro** en el frontend y **Node.js + Express + MongoDB** en el backend.

---

## Servicios y Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend API | 9050 | http://localhost:9050 |
| Swagger Docs | 9050 | http://localhost:9050/api-docs |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Mongo Express | 8081 | http://localhost:8081 |

---

## Inicio Rápido

```bash
# 1. Levantar MongoDB (Docker)
docker compose up -d

# 2. Backend
cd backend
npm install          # solo la primera vez
npm run seed         # poblar base de datos
npm run dev          # servidor en http://localhost:9050

# 3. Frontend
cd ../frontend
npm install          # solo la primera vez
npm run dev          # app en http://localhost:5173
```

---

## Credenciales de Acceso

| Email | Password | Rol |
|-------|----------|-----|
| admin@rh.com | Pass2014! | ARCHITECT SOLUTIONS (Admin) |
| jeacosta37@gmail.com | Pass2014! | Admin personalizado |
| jordan.blake@rh.com | dev123456 | AI DRIVEN DEVELOPER |
| taylor.morgan@rh.com | arch123456 | ARCHITECT TECHNICAL |
| sage.wilson@rh.com | hr123456 | HUMAN TALENT |

---

## Stack Tecnológico

### Frontend
- React 19 + TypeScript 5.7
- Vite 6.1
- TailwindCSS 4.0
- TailAdmin Pro 2.2.0
- MobX 6.15 + mobx-react-lite
- React Router 7.1.5
- Axios

### Backend
- Node.js 20.x + TypeScript 5.9
- Express 5.x
- MongoDB 7.0 + Mongoose 9.x
- JWT (cookies httpOnly, 48h)
- Swagger/OpenAPI
- bcrypt, multer, cors

### DevOps
- Docker Compose (MongoDB + Mongo Express)
- WSL2 (Ubuntu 24.04)

---

## Arquitectura del Proyecto

```
RH-UNLIMITECH-CLOUD/
├── frontend/                  # React + Vite + TailAdmin Pro
│   ├── src/
│   │   ├── components/        # Componentes canónicos TailAdmin
│   │   ├── components-custom/ # Componentes del proyecto
│   │   ├── stores/            # MobX stores (ui/ y views/)
│   │   ├── pages/             # Páginas/rutas
│   │   ├── layout/            # AppLayout, Sidebar, Header
│   │   ├── api/               # Servicios API (axios)
│   │   └── utils/             # Utilidades y helpers
│   ├── .env                   # VITE_API_URL=http://localhost:9050/api/v1
│   └── package.json
├── backend/                   # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/            # database.ts, env.ts, swagger.ts
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routes
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middleware/        # auth, cors, error, permission
│   │   ├── database/          # 📦 Migrations & Seeds
│   │   │   ├── migrations/    # Cambios incrementales a la BD
│   │   │   └── seeds/         # Datos iniciales
│   │   └── scripts/           # Utilidades de desarrollo
│   ├── .env                   # Variables de entorno
│   └── package.json
├── docs/                      # Documentación completa
│   ├── AGENTS-BACKEND.md      # Arquitectura backend
│   ├── AGENTS-FRONTEND.md     # Arquitectura frontend
│   ├── CSW_ARCHITECTURE.md    # Sistema de aprobaciones
│   ├── PERMISSIONS_SYSTEM.md  # RBAC
│   ├── PROJECT_STATUS.md      # Estado del proyecto
│   ├── TABLE_PATTERN.md       # Patrones de UI
│   ├── COMO_LEVANTAR_BACKEND.md
│   └── diagrams/              # Diagramas Mermaid por módulo
├── docker-compose.yml         # MongoDB + Mongo Express
└── README.md                  # Este archivo
```

---

## Scripts del Backend

```bash
npm run dev                 # Desarrollo con hot-reload
npm run build               # Compilar TypeScript
npm start                   # Producción (dist/)
npm run seed                # Poblar BD desde cero (BORRA datos)
npm run db:reset-password   # Resetear contraseñas por defecto
npm run db:check-permissions # Listar permisos y roles del sistema
```

### Migraciones

```bash
# Ejecutar una migración específica
npx ts-node src/database/migrations/001-add-status-to-employees.ts
npx ts-node src/database/migrations/002-fix-divisions-managerId.ts
npx ts-node src/database/migrations/003-add-permissions-module.ts
```

---

## Módulos del Sistema

### ✅ Completados (Backend + Frontend)
- **Autenticación** — Login/Logout JWT en cookies httpOnly
- **Empleados** — CRUD completo con foto, división, rol
- **Divisiones** — Gestión con manager asignado
- **Roles y Permisos** — RBAC completo (32 permisos, 5 roles)

### ✅ Backend Completo / 🟡 Frontend Pendiente
- **CSW (Solicitudes)** — Flujo de aprobación multinivel
- **Flujos de Aprobación** — Configurables por división
- **Categorías CSW** — 15 categorías configurables

### ❌ No Iniciados
- **Capacitaciones (Training)** — Cursos, HP, exámenes
- **Dashboard / Reportes** — Métricas y gráficas

---

## Permisos del Sistema

| Módulo | Acciones |
|--------|----------|
| employees | read, create, update, delete |
| divisions | read, create, update, delete |
| roles | read, create, update, delete |
| permissions | read, create, update, delete |
| csw | read, create, update, approve, cancel, delete |
| csw_categories | read, create, update, delete |
| approval_flows | read, create, update, delete |
| training | read, create, update, delete |

---

## Docker

```bash
docker compose up -d        # Levantar MongoDB + Mongo Express
docker compose ps           # Ver estado
docker compose logs -f      # Ver logs
docker compose down         # Detener
docker compose down -v      # Detener + borrar volúmenes (CUIDADO)
```

---

## Documentación Detallada

- [Arquitectura Backend](docs/AGENTS-BACKEND.md)
- [Arquitectura Frontend](docs/AGENTS-FRONTEND.md)
- [Sistema CSW](docs/CSW_ARCHITECTURE.md)
- [Sistema de Permisos](docs/PERMISSIONS_SYSTEM.md)
- [Estado del Proyecto](docs/PROJECT_STATUS.md)
- [Patrones de Tabla](docs/TABLE_PATTERN.md)
- [Cómo Levantar Backend](docs/COMO_LEVANTAR_BACKEND.md)
- [Diagramas del Sistema](docs/diagrams/README.md)
- [Base de Datos (Migrations/Seeds)](backend/src/database/README.md)

---

## Variables de Entorno

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=9050
MONGO_URI=mongodb://localhost:27017/rh_management
JWT_SECRET=<tu-secret-32-chars-min>
FRONTEND_URL=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:9050/api/v1
```

---

**Última actualización:** Junio 24, 2026
