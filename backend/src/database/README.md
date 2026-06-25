# 📦 Database - Migrations & Seeds

Carpeta centralizada para gestionar migraciones y datos iniciales del sistema.

---

## 📁 Estructura

```
src/database/
├── migrations/          # Scripts de migración (cambios incrementales)
│   ├── 001-add-status-to-employees.ts
│   ├── 002-fix-divisions-managerId.ts
│   └── 003-add-permissions-module.ts
├── seeds/               # Scripts de seed (datos iniciales)
│   ├── seed.ts          # Seed principal (crea todo desde cero)
│   └── reset-password.ts # Utilidad para resetear contraseñas
└── README.md            # Este archivo
```

---

## 🌱 Seeds

### Seed Principal

Pobla la base de datos con datos completos para desarrollo.

```bash
npm run seed
```

**⚠️ ADVERTENCIA:** Borra TODAS las colecciones antes de crear datos nuevos.

**Crea:**
- 32 permisos (8 módulos)
- 5 roles configurados
- 10 divisiones
- 16 empleados + 1 admin
- 15 categorías CSW
- 10 flujos de aprobación

### Reset de Contraseña

```bash
# Resetear usuarios por defecto (admin@rh.com, jeacosta37@gmail.com)
npm run db:reset-password

# Resetear un usuario específico
npx ts-node src/database/seeds/reset-password.ts usuario@email.com MiNuevaPass123
```

---

## 🔄 Migraciones

Las migraciones son cambios incrementales que se aplican sobre datos existentes **sin borrar** la base de datos.

### Convención de Nombres

```
NNN-descripcion-corta.ts
```

- `NNN`: Número secuencial de 3 dígitos (001, 002, 003...)
- `descripcion-corta`: Qué hace la migración en kebab-case

### Ejecutar una Migración

```bash
# Ejecutar migración específica
npm run migrate -- 001

# O directamente:
npx ts-node src/database/migrations/001-add-status-to-employees.ts
```

### Lista de Migraciones

| # | Nombre | Descripción | Fecha |
|---|--------|-------------|-------|
| 001 | add-status-to-employees | Añade campo `status: 'active'` a empleados sin él | 2026-01-29 |
| 002 | fix-divisions-managerId | Repara managerId corrupto en divisiones | 2026-02-15 |
| 003 | add-permissions-module | Crea permisos CRUD del módulo permissions | 2026-02-20 |
| 004 | add-approve-csw-to-employees | Añade `approve_csw: false` a empleados | 2026-06-24 |
| 005 | setup-production | Asegura 38 permisos base + hat admin actualizado | 2026-06-24 |

---

## 🛠️ Crear una Nueva Migración

1. Crear archivo con el siguiente número secuencial:
   ```
   src/database/migrations/004-mi-nueva-migracion.ts
   ```

2. Usar esta plantilla:
   ```typescript
   import mongoose from 'mongoose';
   import { config } from '../../config/env';

   /**
    * Migración 004: Descripción breve
    * 
    * Descripción: Qué hace esta migración
    * Fecha: YYYY-MM-DD
    * Autor: Nombre
    */
   const migrate = async () => {
     try {
       console.log('🔄 Migración 004: descripcion');
       await mongoose.connect(config.mongodb.uri);
       console.log('   ✅ Conectado\\n');

       // Tu lógica aquí...

     } catch (error) {
       console.error('   ❌ Error:', error);
       process.exit(1);
     } finally {
       await mongoose.connection.close();
       console.log('\\n✅ Migración 004 finalizada');
       process.exit(0);
     }
   };

   migrate();
   ```

3. Agregar a la tabla de migraciones en este README.

---

## 📋 Credenciales por Defecto (post-seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@rh.com | Pass2014! | ARCHITECT SOLUTIONS |
| jordan.blake@rh.com | dev123456 | AI DRIVEN DEVELOPER |
| taylor.morgan@rh.com | arch123456 | ARCHITECT TECHNICAL |
| alex.rivera@rh.com | qa123456 | AI DRIVEN QA |
| sage.wilson@rh.com | hr123456 | HUMAN TALENT |
