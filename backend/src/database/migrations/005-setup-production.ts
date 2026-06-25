import mongoose from 'mongoose';
import { config } from '../../config/env';
import { Permission } from '../../models/Permission';
import { Role } from '../../models/Role';

/**
 * Migración 005: Setup de producción
 * 
 * Asegura que todas las colecciones y permisos base existan.
 * Idempotente: se puede correr múltiples veces sin duplicar datos.
 * 
 * Fecha: 2026-06-24
 * 
 * Colecciones del sistema:
 * - permissions (38 permisos en 9 módulos)
 * - roles (hats con permisos asignados)
 * - employees (usuarios del sistema)
 * - divisions (estructura organizacional)
 * - projects (proyectos con equipos)
 * - csws (solicitudes de trabajo)
 * - cswcategories (categorías de solicitud)
 * - approvalflows (flujos de aprobación)
 * - weeklyreports (métricas de productividad)
 */
const migrate = async () => {
  try {
    console.log('🔄 Migración 005: setup-production');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado\n');

    // Permisos base (idempotente)
    const allPerms = [
      // employees
      { resource: 'employees', action: 'read' },
      { resource: 'employees', action: 'create' },
      { resource: 'employees', action: 'update' },
      { resource: 'employees', action: 'delete' },
      // divisions
      { resource: 'divisions', action: 'read' },
      { resource: 'divisions', action: 'create' },
      { resource: 'divisions', action: 'update' },
      { resource: 'divisions', action: 'delete' },
      // roles (hats)
      { resource: 'roles', action: 'read' },
      { resource: 'roles', action: 'create' },
      { resource: 'roles', action: 'update' },
      { resource: 'roles', action: 'delete' },
      // permissions
      { resource: 'permissions', action: 'read' },
      { resource: 'permissions', action: 'create' },
      { resource: 'permissions', action: 'update' },
      { resource: 'permissions', action: 'delete' },
      // projects
      { resource: 'projects', action: 'read' },
      { resource: 'projects', action: 'create' },
      { resource: 'projects', action: 'update' },
      { resource: 'projects', action: 'delete' },
      // csw
      { resource: 'csw', action: 'read' },
      { resource: 'csw', action: 'create' },
      { resource: 'csw', action: 'update' },
      { resource: 'csw', action: 'approve' },
      { resource: 'csw', action: 'cancel' },
      { resource: 'csw', action: 'delete' },
      // csw_categories
      { resource: 'csw_categories', action: 'read' },
      { resource: 'csw_categories', action: 'create' },
      { resource: 'csw_categories', action: 'update' },
      { resource: 'csw_categories', action: 'delete' },
      // approval_flows
      { resource: 'approval_flows', action: 'read' },
      { resource: 'approval_flows', action: 'create' },
      { resource: 'approval_flows', action: 'update' },
      { resource: 'approval_flows', action: 'delete' },
      // training
      { resource: 'training', action: 'read' },
      { resource: 'training', action: 'create' },
      { resource: 'training', action: 'update' },
      { resource: 'training', action: 'delete' },
    ];

    let created = 0;
    for (const perm of allPerms) {
      const exists = await Permission.findOne(perm);
      if (!exists) {
        const p = new Permission(perm);
        await p.save();
        created++;
      }
    }
    console.log(`   📋 Permisos: ${created} nuevos creados, ${allPerms.length} totales`);

    // Verificar que haya al menos un hat admin con todos los permisos
    const allPermDocs = await Permission.find({});
    const adminHat = await Role.findOne({ name: 'FOUNDER & SOLUTIONS ARCHITECT' });
    if (adminHat) {
      adminHat.permissions = allPermDocs.map(p => p._id) as any;
      await adminHat.save();
      console.log(`   🎩 Hat admin actualizado con ${allPermDocs.length} permisos`);
    }

    // Verificar índices
    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();
    console.log(`\n   📊 Colecciones en BD: ${collections.map(c => c.name).join(', ')}`);

    console.log('\n✅ Migración 005 completada');
  } catch (error) {
    console.error('   ❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrate();
