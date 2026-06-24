# RH-UNLIMITECH: Sistema de Gestión de Recursos Humanos

## Descripción General
RH-UNLIMITECH es una plataforma integral para la gestión de recursos humanos, diseñada para empresas que requieren control avanzado sobre empleados, divisiones, roles, permisos, solicitudes de cambio (CSW), capacitaciones, políticas internas y tareas diarias. El sistema es modular, escalable y preparado para integrar funcionalidades avanzadas de IA.

---

## Arquitectura General
- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS (TailAdmin Pro)
- **Backend:** Node.js 20 + Express + TypeScript + MongoDB (Mongoose)
- **Base de Datos:** MongoDB 7 (Docker)
- **Orquestación:** Docker Compose
- **Estado Global:** MobX
- **Autenticación:** JWT + Cookies
- **Documentación:** Swagger (OpenAPI)

### Diagrama Simplificado
```
Usuario
  ↓
Frontend (React, MobX)
  ↓ (API REST)
Backend (Node.js, Express, Mongoose)
  ↓
MongoDB (Docker)
```

---

## Conexión y Despliegue
- **Backend y Base de Datos** corren en contenedores Docker, MongoDB expone el puerto 27017 y el backend el 3000.
- **Frontend** se conecta al backend vía HTTP (API RESTful).
- **Variables de entorno** gestionadas con dotenv.
- **Despliegue local:**
  1. `docker-compose up -d` (levanta MongoDB y Mongo Express)
  2. `npm run dev` en `/backend` (levanta API)
  3. `npm run dev` en `/frontend` (levanta React)

---

## Tecnologías Utilizadas
- **Frontend:**
  - React 19, TypeScript 5.7, Vite 6, TailwindCSS 4, TailAdmin Pro
  - MobX para gestión de estado
  - ApexCharts para visualizaciones
- **Backend:**
  - Node.js 20, Express 4, TypeScript 5.7
  - Mongoose 9 para ODM
  - JWT para autenticación
  - Multer para uploads
- **Base de Datos:**
  - MongoDB 7 (Docker)
- **DevOps:**
  - Docker Compose
  - Scripts de seed y migración

---

## Patrones de Diseño y Buenas Prácticas
- **MVC:** Separación clara entre Modelos, Controladores y Rutas
- **Repository Pattern:** (en modelos Mongoose)
- **Soft Delete:** Todos los modelos soportan borrado lógico
- **Timestamps:** Todos los modelos tienen `createdAt` y `updatedAt`
- **HAL-UC Compliance:** Contrato de respuesta API uniforme
- **Modularidad:** Cada módulo (empleados, roles, CSW, etc.) tiene su propio controller/model/route
- **MobX Rules:** Gobernanza de estado y acciones en frontend
- **Reusable Table Pattern:** Tablas y acciones estandarizadas en UI

---

## Módulos Principales
- **Autenticación y Usuarios:** Login, logout, gestión de sesiones, roles y permisos
- **Empleados:** CRUD, filtros, asignación de roles/divisiones, generador de contraseñas
- **Divisiones:** CRUD, asignación de managers, códigos y descripciones
- **Roles y Permisos:** CRUD, asignación granular de permisos por módulo
- **CSW (Change Management):** Solicitudes de cambio, flujos de aprobación configurables, historial, estadísticas
- **Capacitación (futuro):** Cursos, seguimiento, recomendaciones IA
- **Políticas (futuro):** Gestión y consulta de políticas internas
- **Tareas (futuro):** Tablero Kanban, asignación inteligente, seguimiento diario
- **Estadísticas (futuro):** Dashboards, reportes, análisis predictivo

---

## Seguridad
- **JWT + Cookies seguras**
- **CORS configurado**
- **Validación de datos en backend y frontend**
- **Roles y permisos a nivel de endpoint y UI**

---

## Integraciones y Extensibilidad
- **Swagger:** Documentación interactiva de la API
- **Mongo Express:** UI para administración de la base de datos
- **Preparado para IA:** Arquitectura lista para integrar módulos de recomendación, análisis de sentimiento, chatbots, etc.

---

## Ejemplo de Flujo de Solicitud CSW
1. Empleado crea una solicitud de cambio (CSW)
2. El sistema determina el flujo de aprobación según la división
3. Cada aprobador recibe notificación y puede aprobar/rechazar
4. El estado de la solicitud se actualiza y se registra el historial
5. Estadísticas y reportes disponibles para managers y RRHH

---

## Futuras Funcionalidades Fancy con IA
- Asistente de aprobaciones inteligente
- Clasificación automática de solicitudes
- Chatbot de RRHH
- Recomendador de capacitaciones
- Kanban inteligente para tareas
- Dashboards predictivos y análisis de clima laboral

---

## Contacto y Colaboración
- Documentación extendida en `/docs`
- Código fuente modular y comentado
- Listo para escalar y personalizar según necesidades de la empresa
