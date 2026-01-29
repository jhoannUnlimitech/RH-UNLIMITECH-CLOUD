# 🎯 SOLUCIÓN DEFINITIVA: Usar Postman o curl para testing

## ❌ Problema con Swagger UI

Swagger UI tiene una **limitación técnica**: no puede manejar cookies `httpOnly` correctamente porque:
1. Swagger UI se ejecuta en el navegador como JavaScript
2. Las cookies `httpOnly` NO son accesibles desde JavaScript (por seguridad)
3. El navegador las maneja automáticamente, pero Swagger UI no puede leerlas para mostrarlas

## ✅ Soluciones Disponibles

### Opción 1: Usar Postman (RECOMENDADO)

1. **Hacer Login**:
   ```
   POST http://localhost:3000/api/v1/auth/login
   Content-Type: application/json
   
   {
     "email": "admin@rh.com",
     "password": "admin123"
   }
   ```

2. **La cookie se establece automáticamente** ✅

3. **Usar cualquier endpoint**:
   ```
   GET http://localhost:3000/api/v1/employees
   ```
   La cookie `rh_auth_token` se envía automáticamente.

### Opción 2: Usar curl (para scripts)

```bash
# 1. Login (guarda cookies)
curl -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}'

# 2. Usar endpoint protegido (envía cookies)
curl -b cookies.txt http://localhost:3000/api/v1/employees

# 3. Debug token
curl -b cookies.txt http://localhost:3000/api/v1/auth/debug/token
```

### Opción 3: Swagger con Bearer Token (TEMPORAL)

**Paso 1**: Hacer login y obtener el token raw
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}' | jq '.data.debug.token'
```

**Paso 2**: En Swagger, click "Authorize" y pegar el token con `Bearer ` al inicio:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**NOTA**: Esta opción requiere modificar el backend para soportar Bearer tokens.

### Opción 4: Extensión del Navegador (DevTools)

1. Abre Swagger: http://localhost:3000/api-docs
2. Abre DevTools (F12) → Console
3. Ejecuta el login desde la consola:
   ```javascript
   fetch('http://localhost:3000/api/v1/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'admin@rh.com', password: 'admin123' }),
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
4. La cookie se establece en el navegador
5. Ahora puedes usar Swagger normalmente

## 🔧 Alternativa: Agregar soporte Bearer Token

Si necesitas usar Swagger frecuentemente, puedo agregar soporte para Bearer tokens en el header Authorization como alternativa a las cookies. ¿Quieres que implemente esto?

## 📝 Scripts de Testing Incluidos

He creado `test-auth.sh` que prueba todo el flujo:

```bash
cd /home/jeacosta37/RH-UNLIMITECH/backend
chmod +x test-auth.sh
./test-auth.sh
```

Esto verificará:
- ✅ Login funciona
- ✅ Cookie se establece
- ✅ Endpoints protegidos funcionan con la cookie
- ✅ Debug token muestra la información

## 🎓 Por qué usamos httpOnly cookies

Las cookies `httpOnly` son la forma **MÁS SEGURA** de almacenar tokens JWT porque:
- ✅ No son accesibles desde JavaScript (protección XSS)
- ✅ Se envían automáticamente (no hay que manejar headers manualmente)
- ✅ Pueden tener flags `Secure` y `SameSite` para protección CSRF
- ✅ El navegador las maneja de forma nativa

El trade-off es que herramientas como Swagger UI no pueden leerlas directamente, pero eso es un problema de la herramienta, no de la implementación.
