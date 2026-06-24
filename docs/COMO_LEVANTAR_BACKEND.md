# 📚 Guía: Cómo Levantar el Backend

## 🎯 Pasos para Levantar el Backend (RH-UNLIMITECH)

### 1. ✅ Verificar que MongoDB esté corriendo

**Opción A: Verificar si ya está corriendo**
```bash
docker ps
```

Busca un contenedor llamado `rh-management-mongodb` con el puerto `27017` expuesto.

**Opción B: Levantar MongoDB si no está corriendo**

Desde la raíz del proyecto (no desde /backend):
```bash
cd ~/RH-UNLIMITECH/RH-UNLIMITECH-CLOUD
docker-compose up -d
```

Esto levantará:
- MongoDB en puerto 27017
- Mongo Express (interfaz web) en puerto 8081

### 2. ✅ Verificar la Configuración del .env

Asegúrate de que el archivo `backend/.env` tenga la configuración correcta:

```env
NODE_ENV=development
PORT=3000

# MongoDB
MONGO_URI=mongodb://admin:admin123@localhost:27017/rh_management?authSource=admin

# JWT
JWT_SECRET=f7c58e1d2b2bfbfda756da1d442a58b0639300bd

# Frontend
FRONTEND_URL=http://localhost:5173

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**⚠️ Importante:** 
- Si tu backend corre **fuera de Docker** (en WSL directamente), usa `localhost`
- Si tu backend corre **dentro de Docker**, usa `mongodb` como host

### 3. ✅ Instalar Dependencias (solo la primera vez o si cambia package.json)

**IMPORTANTE: Abre una terminal WSL (no PowerShell)**

```bash
cd ~/RH-UNLIMITECH/RH-UNLIMITECH-CLOUD/backend
npm install
```

### 4. ✅ Levantar el Backend

Desde la terminal WSL, en la carpeta backend:

```bash
cd ~/RH-UNLIMITECH/RH-UNLIMITECH-CLOUD/backend
npm run dev
```

### 5. ✅ Verificar que esté funcionando

Deberías ver un mensaje similar a:
```
[INFO] ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.9.3)
[dotenv@17.2.3] injecting env (7) from .env
✅ MongoDB connected successfully
🚀 Server running on port 3000
```

Si ves `✅ MongoDB connected successfully`, ¡todo está funcionando correctamente!

---

## 🚨 Solución de Problemas Comunes

### Error: "Missing script: dev"
**Causa:** Estás ejecutando `npm run dev` en la raíz del proyecto en lugar de la carpeta backend.

**Solución:**
```bash
cd ~/RH-UNLIMITECH/RH-UNLIMITECH-CLOUD/backend
npm run dev
```

### Error: "Authentication failed" o "AuthenticationFailed"
**Causa:** Las credenciales de MongoDB no coinciden.

**Solución:** Verifica que el MONGO_URI en `.env` tenga:
- Usuario: `admin`
- Contraseña: `admin123`
- Database: `rh_management`
- authSource: `admin`

### Error: "getaddrinfo ENOTFOUND mongodb"
**Causa:** El MONGO_URI usa `mongodb` como host, pero el backend corre fuera de Docker.

**Solución:** Cambia en `backend/.env`:
```env
# De esto:
MONGO_URI=mongodb://admin:admin123@mongodb:27017/rh_management?authSource=admin

# A esto:
MONGO_URI=mongodb://admin:admin123@localhost:27017/rh_management?authSource=admin
```

Luego reinicia el backend.

### Error: "ts-node-dev no se reconoce"
**Causa:** Estás ejecutando el comando en PowerShell en lugar de WSL.

**Solución:** Abre una terminal WSL:
1. En VS Code, presiona `Ctrl + Shift + ñ` (o Ctrl + Shift + `)
2. Selecciona "wsl" en el dropdown de terminales
3. Ejecuta los comandos desde ahí

---

## 📝 Resumen de Comandos Rápidos

### Inicio Rápido (todo en orden)
```bash
# 1. Levantar MongoDB (desde raíz del proyecto)
cd ~/RH-UNLIMITECH/RH-UNLIMITECH-CLOUD
docker-compose up -d

# 2. Ir a backend e instalar dependencias (primera vez)
cd backend
npm install

# 3. Levantar el backend
npm run dev
```

### Verificar estado de servicios
```bash
# Ver contenedores Docker corriendo
docker ps

# Ver logs de MongoDB
docker logs rh-management-mongodb

# Ver logs del backend
# (se muestran automáticamente cuando corre npm run dev)
```

---

## 🔗 URLs Importantes

- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api-docs
- **Mongo Express:** http://localhost:8081
- **Frontend:** http://localhost:5173 (cuando esté levantado)

---

## 🛠️ Scripts Disponibles en Backend

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "seed": "ts-node src/scripts/seed.ts"
}
```

- **npm run dev**: Modo desarrollo con hot-reload
- **npm run build**: Compila TypeScript a JavaScript
- **npm start**: Ejecuta la versión compilada
- **npm run seed**: Ejecuta el script de seed para poblar la BD
