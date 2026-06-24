import { connectDB } from '../../config/database';
import { Permission } from '../../models/Permission';
import { Role } from '../../models/Role';
import mongoose from 'mongoose';

/**
 * Migración 003: Añadir permisos del módulo 'permissions' al rol admin
 * 
 * Descripción: Crea permisos CRUD para el módulo de permisos y los asigna al admin
 * Fecha: 2026-02-20
 * Autor: RH-UNLIMITECH Team
 */
const migrate = async (): Promise<void> => {
  try {
    console.log('🔄 Migración 003: add-permissions-module');
    await connectDB();
    console.log('   ✅ Conectado\n');

    const permsToCreate = [
      { resource: 'permissions', action: 'read' },
      { resource: 'permissions', action: 'create' },
      { resource: 'permissions', action: 'update' },
      { resource: 'permissions', action: 'delete' },
    ];

    const created = [];
    for (const perm of permsToCreate) {
      let permission = await Permission.findOne(perm);
      if (!permission) {
        permission = await Permission.create(perm);
        console.log(`   ✅ Creado: ${perm.resource}:${perm.action}`);
      } else {
        console.log(`   ℹ️  Ya existe: ${perm.resource}:${perm.action}`);
      }
      created.push(permission);
    }

    const adminRole = await Role.findOne({ name: 'ARCHITECT SOLUTIONS' });
    if (!adminRole) {
      console.log('   ❌ Rol ARCHITECT SOLUTIONS no encontrado');
      process.exit(1);
    }

    let added = 0;
    for (const perm of created) {
      if (!adminRole.permissions.some(p => p.toString() === perm._id.toString())) {
        adminRole.permissions.push(perm._id as mongoose.Types.ObjectId);
        added++;
      }
    }

    if (added > 0) {
      await adminRole.save();
      console.log(`\n   ✅ ${added} permisos añadidos al rol admin`);
    } else {
      console.log('\n   ℹ️  El rol ya tenía todos los permisos');
    }

    console.log(`   📊 Total permisos del rol: ${adminRole.permissions.length}`);
  } catch (error) {
    console.error('   ❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

migrate();
