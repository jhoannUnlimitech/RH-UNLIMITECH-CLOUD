# ✅ SWAGGER FUNCIONANDO - Guía de Uso

## 🎉 Problema Resuelto

He implementado soporte para **Bearer Tokens** en addition a las cookies httpOnly. Ahora puedes usar Swagger de dos formas:

---

## 📖 Método 1: Bearer Token en Swagger (RECOMENDADO PARA TESTING)

### Paso 1: Hacer Login

1. Abre Swagger: http://localhost:3000/api-docs
2. Busca `POST /api/v1/auth/login`
3. Click "Try it out"
4. Ingresa las credenciales:
   ```json
   {
     "email": "admin@rh.com",
     "password": "admin123"
   }
   ```
5. Click "Execute"

### Paso 2: Copiar el Token

En la respuesta, busca el campo `data.debug.token` y copia el token completo:

```json
{
  "status": "success",
  "data": {
    "employee": {...},
    "debug": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3..."  // 👈 COPIAR ESTO
    }
  }
}
```

### Paso 3: Autorizar en Swagger

1. Click en el botón **"Authorize" 🔓** (arriba a la derecha en Swagger)
2. Se abrirá un modal con dos opciones:
   - **bearerAuth (http, Bearer)** ← Usar esta
   - cookieAuth (apiKey)
3. En el campo de **bearerAuth**, pega el token (solo el token, sin "Bearer ")
4. Click **"Authorize"**
5. Click **"Close"**

### Paso 4: Usar Cualquier Endpoint

Ahora puedes ejecutar cualquier endpoint y funcionará:
- GET /api/v1/employees
- GET /api/v1/divisions
- GET /api/v1/roles
- POST /api/v1/employees
- etc.

El token se enviará automáticamente en el header: `Authorization: Bearer <token>`

---

## 📖 Método 2: Cookies httpOnly (PRODUCCIÓN)

Este método es automático y más seguro, pero Swagger UI tiene limitaciones para mostrarlo.

### Para Testing con curl:

```bash
# Login (guarda cookies)
curl -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}'

# Usar endpoint (envía cookies automáticamente)
curl -b cookies.txt http://localhost:3000/api/v1/employees
```

### Para Testing con Postman:

1. POST http://localhost:3000/api/v1/auth/login con credentials
2. La cookie se guarda automáticamente
3. Todos los requests subsecuentes usan la cookie

---

## 🔑 Credenciales Disponibles

```
Admin (todos los permisos):
email: admin@rh.com
password: admin123

Otros usuarios (password para todos: "password"):
- jordan.blake@rh.com
- alex.morgan@rh.com
- sam.rivera@rh.com
- taylor.chen@rh.com
- casey.kim@rh.com
- riley.garcia@rh.com
- avery.patel@rh.com
- morgan.lee@rh.com
- jordan.taylor@rh.com
- alex.martinez@rh.com
- sam.anderson@rh.com
- taylor.white@rh.com
- casey.lopez@rh.com
- riley.gonzalez@rh.com
- avery.wilson@rh.com
```

---

## 🔍 Endpoints de Debug

### GET /api/v1/auth/debug/token
Ver información de tu token actual:
- Payload completo (id, email, roleId, divisionId)
- Fecha de expiración
- Token raw para verificar en jwt.io

### GET /api/v1/auth/me
Ver información del usuario autenticado:
- Datos del empleado
- Rol y permisos
- División

---

## 🛠️ Soporte Dual de Autenticación

El backend ahora acepta autenticación de **DOS formas**:

1. **Cookie httpOnly** (rh_auth_token) - Automática, más segura
   - Se establece al hacer login
   - Se envía automáticamente en cada request
   - Protección XSS y CSRF

2. **Bearer Token en header** (Authorization: Bearer <token>) - Manual, para testing
   - Requiere copiar el token manualmente
   - Se envía en header: `Authorization: Bearer eyJhbGc...`
   - Útil para Swagger, Postman, curl

El middleware `authMiddleware` intenta primero la cookie, y si no existe, busca el Bearer token.

---

## 📝 Verificar que Funciona

Ejecuta el script de prueba:

```bash
cd /home/jeacosta37/RH-UNLIMITECH/backend
./test-auth.sh
```

Esto verificará:
- ✅ Login establece cookie correctamente
- ✅ Endpoints protegidos funcionan con cookie
- ✅ Debug token devuelve información correcta

---

## 🎓 Resumen Técnico

### Cambios Implementados:

1. **authMiddleware** ahora acepta:
   - Cookie: `rh_auth_token`
   - Header: `Authorization: Bearer <token>`

2. **Swagger config** incluye:
   - `bearerAuth`: Para testing manual con token
   - `cookieAuth`: Para uso automático con cookies
   - `withCredentials: true`: Intenta enviar cookies (limitado en Swagger UI)

3. **CORS actualizado**:
   - Permite localhost en desarrollo
   - `credentials: true` para permitir cookies
   - `sameSite: 'lax'` para compatibilidad

4. **Todas las rutas** ahora documentadas con ambos esquemas de seguridad:
   ```yaml
   security:
     - bearerAuth: []
     - cookieAuth: []
   ```

---

## ❓ Preguntas Frecuentes

### ¿Por qué dos métodos de autenticación?

- **Cookies**: Más seguro para producción (httpOnly, XSS protection)
- **Bearer**: Más fácil para testing en herramientas como Swagger/Postman

### ¿Cuál debo usar en mi frontend?

Usa **cookies** (el login automáticamente las establece). Es más seguro.

### ¿Cuánto dura el token?

**48 horas**. Después debes hacer login nuevamente.

### ¿Puedo renovar el token?

Sí, ejecuta POST /api/v1/auth/refresh o vuelve a hacer login.

### ¿El token se puede revocar?

Actualmente no (es JWT stateless). Para revocar, el usuario debe hacer logout y el token expirará naturalmente en 48h.

---

## ✅ Testing Completo

Ahora deberías poder:

1. ✅ Hacer login en Swagger
2. ✅ Copiar el token
3. ✅ Autorizar con bearerAuth
4. ✅ Ejecutar cualquier endpoint protegido
5. ✅ Ver la respuesta correctamente sin errores 401

**Si aún tienes problemas, revisa la consola del servidor para ver los logs de debug.**
