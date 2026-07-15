import mongoose from 'mongoose';
import { config } from '../../config/env';
import { Permission } from '../../models/Permission';
import { Role } from '../../models/Role';

/**
 * Migración 006: Agregar permisos del módulo Training
 *
 * Crea los 6 permisos de training y los asigna a los hats correspondientes:
 * - training:read + training:report → TODOS los hats (todos estudian)
 * - training:create/update/delete/manage → Oscar (QUALITY & TRAINING OFFICER) + Laura (HUMAN TALENT)
 *
 * Fecha: 2026-07-15
 * Idempotente: no duplica si ya existen
 */

const TRAINING_PERMISSIONS = [
  { resource: 'training', action: 'read' },
  { resource: 'training', action: 'create' },
  { resource: 'training', action: 'update' },
  { resource: 'training', action: 'delete' },
  { resource: 'training', action: 'manage' },
  { resource: 'training', action: 'report' },
];

// Hats que reciben TODOS los permisos de training (admins del módulo)
const ADMIN_HATS = [
  'QUALITY & TRAINING OFFICER',
  'HUMAN TALENT MANAGEMENT',
  'ARCHITECT SOLUTIONS',       // Admin general
];

// Todos los hats reciben read + report (todos estudian D21)
const ALL_PERMISSIONS = ['read', 'report'];
const ADMIN_PERMISSIONS = ['read', 'create', 'update', 'delete', 'manage', 'report'];

const migrate = async () => {
  try {
    console.log('🔄 Migración 006: Agregar permisos del módulo Training\n');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado\n');

    // 1. Crear permisos que no existan
    let created = 0;
    const permissionIds: Record<string, any> = {};

    for (const perm of TRAINING_PERMISSIONS) {
      let existing = await Permission.findOne({ resource: perm.resource, action: perm.action })
        .setOptions({ includeDeleted: true });

      if (!existing) {
        existing = await new Permission(perm).save();
        console.log(`   ✅ Permiso creado: ${perm.resource}:${perm.action}`);
        created++;
      } else {
        console.log(`   ⏭️  Permiso ya existe: ${perm.resource}:${perm.action}`);
      }
      permissionIds[perm.action] = existing._id;
    }

    // 2. Asignar permisos a hats
    const allRoles = await Role.find();
    let updated = 0;

    for (const role of allRoles) {
      const roleName = role.name.toUpperCase();
      const isAdmin = ADMIN_HATS.some(h => roleName.includes(h) || h.includes(roleName));
      const permsToAssign = isAdmin ? ADMIN_PERMISSIONS : ALL_PERMISSIONS;

      let roleModified = false;
      for (const action of permsToAssign) {
        const permId = permissionIds[action];
        if (permId && !(role.permissions as any[]).some((p: any) => p.toString() === permId.toString())) {
          (role.permissions as any[]).push(permId);
          roleModified = true;
        }
      }

      if (roleModified) {
        await role.save();
        console.log(`   🔑 Hat "${role.name}" → ${permsToAssign.join(', ')}`);
        updated++;
      }
    }

    console.log(`\n📊 Resultado: ${created} permisos creados, ${updated} hats actualizados`);

  } catch (error) {
    console.error('   ❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Migración 006 finalizada');
    process.exit(0);
  }
};

migrate();
