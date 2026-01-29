# 🔐 Guía de Autenticación en Swagger

## ✅ PASO 1: Autenticarse

1. Abre Swagger UI: http://localhost:3000/api-docs
2. Busca el endpoint **POST /api/v1/auth/login** (primera sección "Auth")
3. Haz clic en "Try it out"
4. Ingresa las credenciales de prueba:

```json
{
  "email": "admin@rh.com",
  "password": "admin123"
}
```

5. Haz clic en "Execute"
6. **¡LISTO!** La cookie se estableció automáticamente en tu navegador

## ✅ PASO 2: Usar Endpoints Protegidos

Ahora puedes ejecutar cualquier endpoint protegido y funcionará automáticamente:

- **GET /api/v1/employees** - Listar empleados
- **GET /api/v1/divisions** - Listar divisiones
- **GET /api/v1/roles** - Listar roles
- **POST /api/v1/employees** - Crear empleado
- etc.

La cookie `rh_auth_token` se enviará automáticamente con cada petición.

## 🔍 PASO 3: Verificar tu Token (Opcional)

Si quieres ver el contenido de tu token actual:

1. Ejecuta **GET /api/v1/auth/debug/token**
2. Verás el payload completo:

```json
{
  "status": "success",
  "data": {
    "payload": {
      "id": "...",
      "email": "admin@rh.com",
      "roleId": "...",
      "divisionId": "...",
      "iat": 1738009200,
      "exp": 1738182000
    },
    "expiresAt": "2026-01-30T11:40:00.000Z",
    "expiresIn": "47.99 horas"
  },
  "rawToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔄 Renovar Sesión

Tu sesión dura **48 horas**. Para renovarla:

- Simplemente ejecuta POST /api/v1/auth/login nuevamente
- La cookie se actualizará automáticamente

## 🚪 Cerrar Sesión

Para cerrar sesión:

- Ejecuta **POST /api/v1/auth/logout**
- La cookie se eliminará

## ❌ Solución de Problemas

### Error: "No autenticado. Por favor inicie sesión"

**Causa:** No has ejecutado el login o la cookie expiró.

**Solución:**
1. Ejecuta POST /api/v1/auth/login
2. Verifica que la respuesta sea 200 OK
3. Intenta el endpoint protegido nuevamente

### Error: "Credenciales inválidas"

**Solución:**
- Verifica que estés usando: admin@rh.com / admin123
- O usa cualquiera de las otras credenciales del seed

### La cookie no se establece

**Solución:**
1. Verifica que estés en http://localhost:3000 (no https)
2. Abre las DevTools del navegador → Application → Cookies
3. Busca la cookie `rh_auth_token`

## 📋 Otras Credenciales de Prueba

```
Email: jordan.blake@rh.com    | Password: password
Email: alex.morgan@rh.com     | Password: password
Email: sam.rivera@rh.com      | Password: password
Email: taylor.chen@rh.com     | Password: password
Email: casey.kim@rh.com       | Password: password
Email: riley.garcia@rh.com    | Password: password
Email: avery.patel@rh.com     | Password: password
Email: morgan.lee@rh.com      | Password: password
Email: jordan.taylor@rh.com   | Password: password
Email: alex.martinez@rh.com   | Password: password
Email: sam.anderson@rh.com    | Password: password
Email: taylor.white@rh.com    | Password: password
Email: casey.lopez@rh.com     | Password: password
Email: riley.gonzalez@rh.com  | Password: password
Email: avery.wilson@rh.com    | Password: password
```

## 💡 ¿Por qué NO uso el botón "Authorize"?

El botón "Authorize" en Swagger está diseñado para APIs que usan **Bearer tokens en headers** o **API Keys**, no para **cookies httpOnly**.

Nuestra API usa cookies por seguridad (XSS protection), así que el flujo correcto es:
1. Login → Cookie se establece automáticamente
2. Todos los endpoints usan esa cookie automáticamente

## 🔒 Seguridad

- ✅ Cookie httpOnly (no accesible desde JavaScript)
- ✅ SameSite: Strict (protección CSRF)
- ✅ Secure en producción (solo HTTPS)
- ✅ 48 horas de expiración
- ✅ Auto-renovación en cada login
