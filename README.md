# RH Unlimitech Cloud

Sistema de Gestión de Recursos Humanos — Plataforma web completa para administración de personal, solicitudes internas y productividad.

## 🚀 Quick Start

```bash
# Levantar todos los servicios (MongoDB + Backend + Frontend)
sudo ./start.sh
```

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:9050 | 9050 |
| Swagger Docs | http://localhost:9050/api-docs | 9050 |
| MongoDB | localhost | 27017 |
| Mongo Express | http://localhost:8081 | 8081 |

### Credenciales de prueba

| Usuario | Rol | Email | Password |
|---------|-----|-------|----------|
| Manuel Lara | Founder | admin@unlimitech.cloud | Pass2014! |
| Jhoann Acosta | QA Analyst | jhoann@unlimitech.cloud | Pass2014! |
| Laura Hernandez | HR Manager | talent@unlimitech.cloud | Pass2014! |
| Moises Gonzalez | Tech Architect | moises@unlimitech.cloud | Pass2014! |

---

## 📦 Módulos

### Dashboard
- Métricas de RRHH (empleados, divisiones)
- Cards CSW (total, en trámite, aprobadas, rechazadas, por firmar)
- Gráficas de productividad semanal (QA + Dev)
- Resumen de la semana actual
- Proyectos activos del usuario

### Empleados
- CRUD completo con foto, datos personales, nacionalidad
- Búsqueda y filtros por división/hat/estado
- Switch approve_csw por empleado

### Divisiones
- Estructura organizacional (7 divisiones)
- Manager asignado por división
- Flujo de aprobación configurable por división

### Hats (Roles)
- Gestión de roles con permisos granulares
- Sistema RBAC (Resource-Based Access Control)
- Permisos: read, create, update, delete, approve, cancel

### Proyectos
- CRUD con equipo, líder, división, enlaces asociados
- Estados: active, on_hold, completed, cancelled
- Detalle con miembros del equipo

### Calendario
- Festivos automáticos (Colombia + Estados Unidos) via `date-holidays`
- CRUD de eventos (solo HR/CEO/Founder)
- Banderas por país (flagcdn.com)
- Vista mes/semana/día con FullCalendar

### CSW — Canal de Solicitudes de Trabajo
- **Estado draft** con autoguardado cada 5 minutos
- **Submit** para enviar a aprobación (draft → pending)
- **Flujo multinivel** configurable por división (users fijos)
- **Categorías** con flujo directo o por división
- **Historial inmutable** con acciones traducidas + iconos
- **Banner de rechazo** visible al editar
- **Cancelar/Editar** según reglas de estado
- **Formato título**: `CSW-CATEGORIA_SNAKE-YYYYMMDD-5chars`

---

## 🏗️ Arquitectura

```
Frontend (React 18 + MobX + Vite + TailwindCSS)
     ↕ API REST (Cookie httpOnly)
Backend (Express + TypeScript + Mongoose)
     ↕
MongoDB (sin autenticación en dev)
```

### Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, MobX, Vite, TailwindCSS, FullCalendar, ApexCharts |
| Backend | Node.js, Express, TypeScript, Mongoose |
| Base de datos | MongoDB 7+ |
| Autenticación | JWT + httpOnly Cookie + bcrypt |
| Seguridad | Helmet, express-rate-limit, Zod validation |
| Documentación | Swagger/OpenAPI 3.0 |

### Patrones de Diseño

- **Store Pattern** (Contract → Mock/Live) con MobX
- **Middleware Chain** (CORS → Helmet → RateLimit → Parse → Auth → Routes → Error)
- **Soft Delete** universal via BaseModel plugin
- **Permission-based access** (resource + action)
- **Factory pattern** para stores
- **Observer pattern** (MobX + React)

---

## 📁 Estructura del Proyecto

```
RH-UNLIMITECH-CLOUD/
├── backend/
│   ├── src/
│   │   ├── config/         # Env, DB, Swagger config
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth, CORS, Error, Validate, Permission
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes + Swagger docs
│   │   ├── validators/     # Zod schemas
│   │   ├── database/       # Migrations + Seeds
│   │   └── scripts/        # Utilidades de BD
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + services
│   │   ├── components/     # UI components reutilizables
│   │   ├── context/        # Theme, Sidebar contexts
│   │   ├── layout/         # AppLayout, Sidebar, Header
│   │   ├── pages/          # Vistas por módulo
│   │   ├── stores/         # MobX stores (contract/live/mock)
│   │   └── utils/          # Helpers (toast, permissions, csw)
│   └── package.json
├── docs/                   # Documentación técnica
├── scripts/                # Playwright screenshots
├── video-promo/            # Video corporativo (Remotion)
├── start.sh                # Script para levantar todo
└── README.md
```

---

## 🔒 Seguridad

- **Helmet** — Security headers (X-Frame-Options, etc.)
- **Rate Limiting** — 10 intentos login/15min, 500 req/min global
- **JWT httpOnly Cookie** — Token no accesible via JavaScript
- **Zod Validation** — Validación de inputs en routes
- **RBAC** — Permisos granulares por recurso + acción
- **Soft Delete** — Datos nunca se eliminan físicamente
- **bcrypt** — Password hashing (10 salt rounds)

Ver auditoría completa: [`docs/SECURITY_ARCHITECTURE_AUDIT.md`](docs/SECURITY_ARCHITECTURE_AUDIT.md)

---

## 📊 Scripts Útiles

```bash
# Levantar servicios
sudo ./start.sh

# Capturar screenshots de la app
node scripts/capture-screenshots.cjs

# Ejecutar migrations
cd backend && npx ts-node --transpile-only src/database/migrations/006-add-orden-estudio-category.ts

# Seed completo (⚠️ borra datos existentes)
cd backend && npx ts-node --transpile-only src/database/seeds/seed-real.ts
```

---

## 📝 Documentación

| Documento | Contenido |
|-----------|-----------|
| [CSW Module Complete](docs/CSW_MODULE_COMPLETE.md) | Flujo completo del módulo CSW |
| [CSW Flow Bugfix](docs/CSW_FLOW_BUGFIX_ANALYSIS.md) | Análisis del bugfix CSW |
| [Security Audit](docs/SECURITY_ARCHITECTURE_AUDIT.md) | Auditoría de seguridad + plan de acción |

---

## 🎬 Video Corporativo

Proyecto Remotion en `video-promo/`:
```bash
cd video-promo
npx remotion studio          # Editor visual
npx remotion render RHUnlimitechCloud --output=video.mp4  # Exportar
```

---

**Rama actual:** `bugfix/security-hardening` desde `develop`  
**Última actualización:** 25 de Junio de 2026
