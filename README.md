# Sistema de Gestión de RRHH (rh-management-system)

## 📋 Descripción

Sistema completo de gestión de recursos humanos desarrollado con **React + TailAdmin Pro** en el frontend y **Node.js + Express + MongoDB** en el backend. El proyecto utiliza componentes canónicos de **TailAdmin Pro 2.2.0** vía **MCP Webforge** y gestión de estado con **MobX**.

## 🚀 Características Principales

### Módulos Implementados

1. **Empleados (Core)**
   - CRUD completo de empleados
   - Gestión de cargos y roles
   - Sistema de permisos por grupos
   - Divisiones con responsables (1-10)
   - Foto de perfil (Base64 o iniciales)

2. **CSW (Completed Staff Work)**
   - Flujo de aprobación secuencial:
     - Líder Técnico → Arquitecto Técnico → Arquitecto de Soluciones → Talento Humano
   - Visibilidad controlada por nivel de aprobación
   - Formulario con firma digital
   - Historial de comentarios y decisiones

3. **Capacitaciones (Training)**
   - Dashboard con métricas de History Points (HP)
   - Cursos con enlaces o documentos adjuntos
   - Reportes diarios de estudio
   - Exámenes (opción múltiple y ensayo)
   - Sistema de calificación y corrección
   - Gráficas semanales de progreso

## 🏗️ Arquitectura

```
rh-management-system/
├── frontend/              # React + Vite + TailAdmin Pro 2.2.0
│   ├── src/
│   │   ├── components/        # Componentes CANÓNICOS de TailAdmin
│   │   ├── components-custom/ # Componentes personalizados del proyecto
│   │   ├── stores/            # MobX stores (UI y Views)
│   │   ├── pages/             # Páginas/rutas
│   │   ├── layout/            # Layouts (AppLayout, Sidebar, Header)
│   │   ├── api/               # Servicios de API
│   │   └── utils/             # Utilidades
│   ├── lean.yml               # Limpieza del dashboard base
│   ├── mobx.yml               # Configuración de MobX
│   ├── mobx.rules.yml         # Reglas de arquitectura MobX
│   └── package.json
├── backend/               # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routes
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middleware/        # Auth, CORS, Soft Delete
│   │   ├── services/          # Servicios reutilizables
│   │   └── config/            # Configuración (DB, env)
│   └── package.json
├── docs/
│   ├── AGENTS-FRONTEND.md     # Documentación completa del frontend
│   └── AGENTS-BACKEND.md      # Documentación completa del backend
├── docker-compose.yml         # MongoDB + Mongo Express
├── lean.yml                   # Limpieza del dashboard (referencia)
├── mobx.yml                   # Configuración MobX (referencia)
├── mobx.rules.yml             # Reglas MobX (referencia)
└── README.md                  # Este archivo
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.1.0
- **Language**: TypeScript 5.7.2
- **UI Framework**: TailAdmin Pro 2.2.0 (vía MCP Webforge)
- **Styles**: TailwindCSS 4.0.0
- **State Management**: MobX 6.x + mobx-react-lite
- **Router**: React Router 7.1.5
- **Charts**: ApexCharts (incluido en TailAdmin)

### Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express 4.x
- **Database**: MongoDB 7.x
- **ODM**: Mongoose 8.x
- **Language**: TypeScript 5.7.x
- **Auth**: JWT (jsonwebtoken)
- **File Uploads**: Multer

### DevOps
- **Containers**: Docker + Docker Compose
- **Database Admin**: Mongo Express

## 📦 Instalación

### Prerrequisitos

- Node.js 20.x o superior
- Docker y Docker Compose
- Git

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd RH-UNLIMITECH
```

### 2. Configurar Base de Datos (MongoDB)

```bash
# Iniciar MongoDB y Mongo Express con Docker Compose
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps

# Mongo Express estará disponible en: http://localhost:8081
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env (copiar desde .env.example)
cp .env.example .env

# Editar .env con tus configuraciones
# Valores por defecto están listos para desarrollo

# Ejecutar seed para datos iniciales
npm run seed

# Iniciar servidor de desarrollo
npm run dev

# Backend estará disponible en: http://localhost:3000
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Las dependencias ya están instaladas (incluyendo MobX)
# Si necesitas reinstalar:
# npm install

# Iniciar servidor de desarrollo
npm run dev

# Frontend estará disponible en: http://localhost:5173
```

## 🚀 Comandos de Desarrollo

### Frontend

```bash
cd frontend

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

### Backend

```bash
cd backend

# Desarrollo (con hot reload)
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Ejecutar seed
npm run seed
```

### Docker

```bash
# Iniciar MongoDB
docker-compose up -d

# Ver logs
docker-compose logs -f mongodb

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Acceder a MongoDB CLI
docker exec -it rh-management-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

## 📚 Documentación Completa

- **Frontend**: [docs/AGENTS-FRONTEND.md](docs/AGENTS-FRONTEND.md)
  - Arquitectura del frontend
  - Gestión de estado con MobX
  - Componentes canónicos vs custom
  - Flujo de trabajo con MCP Webforge
  - Reglas de gobernanza (strongRules)
  - Módulos del sistema (Empleados, CSW, Training)
  - Patrones de desarrollo
  - Guía de desarrollo completa

- **Backend**: [docs/AGENTS-BACKEND.md](docs/AGENTS-BACKEND.md)
  - Arquitectura del backend
  - Modelos de datos (Mongoose)
  - API REST endpoints
  - Middleware (Auth, CORS, Soft Delete)
  - Autenticación y autorización (JWT)
  - Configuración de MongoDB
  - Guía de desarrollo completa

## 🔐 Credenciales de Desarrollo

Después de ejecutar `npm run seed` en el backend:

**Admin User**
- Email: `admin@rh.com`
- Password: `admin123`

**MongoDB**
- Host: `localhost:27017`
- Username: `admin`
- Password: `admin123`
- Database: `rh_management`

**Mongo Express**
- URL: `http://localhost:8081`
- No requiere autenticación (deshabilitada para desarrollo)

## 🧪 Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## 📖 Reglas de Desarrollo

### Componentes Canónicos vs Custom

**⚠️ REGLA CRÍTICA**:
- **NUNCA** colocar componentes custom en `src/components/`
- `src/components/`: SOLO componentes canónicos descargados del MCP Webforge
- `src/components-custom/`: TODOS los componentes personalizados del proyecto

### MobX Stores

**Stores Funcionales** (negocio):
- Estructura triple: `*.contract.ts`, `*.mock.ts`, `*.live.ts`
- Interface + namespace en contract
- Mock con datos ficticios (NUNCA PII real)
- Live lanza Error hasta implementación con API

**Stores de UI** (toggles):
- Archivo único sin arquitectura contract/mock/live
- `makeAutoObservable` con `{ autoBind: true }`

### Flujo con MCP Webforge

1. **Buscar** componente con `util_search`
2. **Analizar** detalles con `ui_components_explain_choice`
3. **Comparar** alternativas con `ui_components_compare`
4. **Descargar** con `fs_get_file` usando `file.path` y `file.mode`
5. **Guardar** respetando estructura original en `src/components/`

### API REST (HAL-UC)

Todas las respuestas siguen formato HAL-UC:

```json
{
  "_links": {
    "self": { "href": "/api/v1/employees" }
  },
  "_embedded": {
    "items": [...]
  },
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

## 🗺️ Roadmap

### ✅ Fase 1: Inicialización (COMPLETADA)
- [x] Estructura de directorios
- [x] Scaffold de TailAdmin Pro 2.2.0
- [x] Configuración de MobX
- [x] Docker Compose con MongoDB
- [x] Documentación completa (AGENTS-FRONTEND.md y AGENTS-BACKEND.md)
- [x] Validación de frontend (npm run dev funcionando)

### ⏳ Fase 2: Backend Core (SIGUIENTE)
- [ ] Inicializar proyecto backend con TypeScript
- [ ] Implementar modelos Mongoose
- [ ] Crear routes y controllers básicos
- [ ] Implementar autenticación JWT
- [ ] Crear seed con datos iniciales
- [ ] Testing de endpoints

### 📋 Fase 3: Módulo Empleados
- [ ] Stores MobX (contract, mock, live)
- [ ] Componentes custom (tabla, modal, card)
- [ ] Páginas (listado, detalle)
- [ ] Integración con API
- [ ] Sub-módulo: Cargos
- [ ] Sub-módulo: Permisos

### 📋 Fase 4: Módulo CSW
- [ ] Store CSW con flujo de aprobación
- [ ] Formulario de solicitud
- [ ] Vista de aprobaciones pendientes
- [ ] Componente de firma digital
- [ ] Stepper de flujo
- [ ] Notificaciones por email

### 📋 Fase 5: Módulo Capacitaciones
- [ ] Store Training con métricas
- [ ] Dashboard con gráficas (ApexCharts)
- [ ] CRUD de cursos
- [ ] Formulario de reporte de estudio
- [ ] Sistema de exámenes
- [ ] Calificación y feedback

### 📋 Fase 6: Refinamiento
- [ ] Testing end-to-end
- [ ] Optimización de performance
- [ ] Documentación de API (Swagger)
- [ ] Deploy en producción

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

**Reglas de Commits**:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

## 👥 Equipo

- **Arquitecto de Soluciones**: [Nombre]
- **Líder Técnico**: [Nombre]
- **Desarrolladores**: [Nombres]
- **QA**: [Nombre]

## 📞 Soporte

Para dudas o asistencia:
- Email: [email]
- Slack: [canal]
- Issues: [GitHub Issues URL]

---

**Versión**: 1.0.0  
**Última Actualización**: Enero 28, 2026  
**Estado**: ✅ Frontend inicializado | ⏳ Backend pendiente de implementación

---

## 📊 Estado Actual del Proyecto

### Frontend (✅ LISTO PARA DESARROLLO)
- ✅ TailAdmin Pro 2.2.0 descargado y configurado
- ✅ Dependencias instaladas (290 paquetes)
- ✅ MobX instalado (mobx + mobx-react-lite)
- ✅ Servidor Vite corriendo en `http://localhost:5173`
- ✅ Documentación completa en `docs/AGENTS-FRONTEND.md`

### Backend (⏳ PENDIENTE DE INICIALIZACIÓN)
- ✅ Documentación completa en `docs/AGENTS-BACKEND.md`
- ✅ Docker Compose con MongoDB configurado
- ⏳ Proyecto npm por inicializar
- ⏳ Modelos Mongoose por crear
- ⏳ API REST por implementar

### Base de Datos (✅ LISTA)
- ✅ MongoDB 7.0 corriendo en Docker
- ✅ Mongo Express disponible en `http://localhost:8081`
- ✅ Configuración de conexión lista

## 🎯 Próximos Pasos Inmediatos

1. **Inicializar Backend**:
   ```bash
   cd backend
   npm init -y
   npm install express mongoose cors dotenv bcrypt jsonwebtoken multer
   npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/multer ts-node-dev
   npx tsc --init
   ```

2. **Crear Estructura de Modelos**:
   - Implementar `BaseModel.ts`
   - Crear modelos: Employee, Division, Role, Permission
   - Aplicar soft delete middleware

3. **Implementar Autenticación**:
   - Login/Register endpoints
   - JWT middleware
   - Permission checks

4. **Crear Seed**:
   - Usuario admin inicial
   - Roles y permisos base
   - Divisiones de ejemplo

5. **Conectar Frontend**:
   - Implementar stores Live de MobX
   - Configurar axios con interceptors
   - Manejo de errores y estados de carga

---

**¡El proyecto está listo para comenzar el desarrollo!** 🚀
