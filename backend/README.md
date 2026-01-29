# Backend - Sistema de Gestión de RRHH

## ✅ Primer Sprint Completado

### Estructura Implementada

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       ✅ Conexión MongoDB
│   │   └── env.ts            ✅ Variables de entorno + JWT config (48h)
│   ├── middleware/
│   │   ├── auth.ts           ✅ Auth con JWT en cookies httpOnly
│   │   ├── error.ts          ✅ Error handler global
│   │   ├── cors.ts           ✅ CORS con credentials
│   │   └── permission.ts     ✅ Verificación de permisos
│   ├── models/
│   │   ├── base/
│   │   │   └── BaseModel.ts  ✅ Interface + soft delete plugin
│   │   ├── Employee.ts       ✅ Con foto base64, hash password
│   │   ├── Division.ts       ✅ 10 divisiones
│   │   ├── Role.ts           ✅ Roles con permisos
│   │   └── Permission.ts     ✅ Sistema de permisos granular
│   ├── controllers/
│   │   └── auth.controller.ts ✅ Login, register, logout, me, refresh
│   ├── routes/
│   │   ├── auth.routes.ts    ✅ Rutas de autenticación
│   │   └── index.ts          ✅ Router principal
│   ├── scripts/
│   │   └── seed.ts           ✅ Datos iniciales completos
│   ├── app.ts                ✅ Express app configurado
│   └── server.ts             ✅ Entry point
├── .env                      ✅ Variables de entorno
├── .env.example              ✅ Template
├── .gitignore                ✅ Configurado
├── package.json              ✅ Scripts y dependencias
└── tsconfig.json             ✅ TypeScript configurado
```

### Funcionalidades Implementadas

#### 🔐 Autenticación con JWT en Cookies (48h)

**Características**:
- ✅ JWT almacenado en cookie httpOnly (seguridad XSS)
- ✅ Expiración de 48 horas
- ✅ Cookie secure en producción
- ✅ SameSite strict (protección CSRF)
- ✅ Reemplazo automático al re-login
- ✅ Password hasheado con bcrypt
- ✅ Validación de campos

**Endpoints**:
```
POST /api/v1/auth/register    - Registro de empleado
POST /api/v1/auth/login       - Login (reemplaza token existente)
POST /api/v1/auth/logout      - Logout (limpia cookie)
GET  /api/v1/auth/me          - Obtener usuario actual
POST /api/v1/auth/refresh     - Refrescar token (extender 48h)
```

#### 👥 Modelos de Datos

**Employee** (con foto base64):
- Validación de base64 con formato: `data:image/[tipo];base64,...`
- Hash automático de password
- Método `comparePassword()`
- Soft delete
- Relaciones con Role, Division, Manager

**Division** (10 divisiones):
- Cada división tiene un manager (Employee)
- Soft delete

**Role** (5 roles):
- `ARCHITECT SOLUTIONS` (admin completo)
- `ARCHITECT TECHNICAL`
- `AI DRIVEN DEVELOPER`
- `AI DRIVEN QA`
- `HUMAN TALENT`

**Permission** (sistema granular):
- Formato: `resource` + `action`
- Actions: read, create, update, delete, approve
- Resources: employees, csw, training, divisions, roles

#### 🌱 Seed Data

El script `npm run seed` crea:
- ✅ 19 permisos (5 resources × actions)
- ✅ 5 roles con permisos configurados
- ✅ 10 divisiones (División 1-10)
- ✅ 1 admin + 4 empleados de ejemplo

**Credenciales**:
```
Admin:
  📧 admin@rh.com
  🔑 admin123

Desarrollador:
  📧 jordan.blake@rh.com
  🔑 dev123

QA:
  📧 alex.rivera@rh.com
  🔑 qa123

Arquitecto:
  📧 taylor.morgan@rh.com
  🔑 arch123
```

### Configuración de JWT

```typescript
// src/config/env.ts
jwt: {
  secret: process.env.JWT_SECRET,
  expiresIn: '48h',              // Token expira cada 48 horas
  cookieName: 'rh_auth_token',
  cookieOptions: {
    httpOnly: true,              // No accesible vía JS (XSS protection)
    secure: prod,                // Solo HTTPS en producción
    sameSite: 'strict',          // CSRF protection
    maxAge: 48 * 60 * 60 * 1000, // 48 horas
    path: '/',
  }
}
```

### Siguiente Sprint

**Pendiente**:
- [ ] Iniciar MongoDB (Docker o servicio local)
- [ ] Ejecutar seed: `npm run seed`
- [ ] Probar endpoints de auth con Postman
- [ ] Implementar CRUD de Employees (routes + controller)
- [ ] Implementar módulo CSW
- [ ] Implementar módulo Training

**Comandos para Continuar**:

```bash
# 1. Iniciar MongoDB
docker-compose up -d

# O si MongoDB está en WSL:
sudo service mongodb start

# 2. Ejecutar seed
cd backend
npm run seed

# 3. Iniciar backend
npm run dev

# 4. Probar endpoints
# POST http://localhost:3000/api/v1/auth/login
# Body: { "email": "admin@rh.com", "password": "admin123" }
```

### Notas de Seguridad

✅ **JWT en cookies httpOnly**: Mejor práctica vs localStorage
✅ **bcrypt**: Passwords hasheados con salt
✅ **Validaciones**: Mongoose validators en todos los campos
✅ **CORS configurado**: Solo frontend permitido
✅ **Soft delete**: No se eliminan datos físicamente
✅ **Error handling**: Mensajes genéricos al cliente

---

**Estado**: ✅ Backend inicializado y listo para desarrollo
**Siguiente**: Iniciar MongoDB y ejecutar seed
