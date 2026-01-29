import { connectDB } from '../config/database';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';
import mongoose from 'mongoose';

/**
 * Script para añadir permisos del módulo de permisos al rol de administrador
 */
const addPermissionsToAdmin = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🔗 Conectado a la base de datos\n');

    // Buscar o crear permisos para el módulo de permisos
    console.log('📋 Verificando permisos del módulo de permisos...');
    
    const permissionsToCreate = [
      { resource: 'permissions', action: 'read' },
      { resource: 'permissions', action: 'create' },
      { resource: 'permissions', action: 'update' },
      { resource: 'permissions', action: 'delete' },
    ];

    const createdPermissions = [];
    
    for (const perm of permissionsToCreate) {
      let permission = await Permission.findOne(perm);
      
      if (!permission) {
        permission = await Permission.create(perm);
        console.log(`   ✅ Creado: ${perm.resource}:${perm.action}`);
        createdPermissions.push(permission);
      } else {
        console.log(`   ℹ️  Ya existe: ${perm.resource}:${perm.action}`);
        createdPermissions.push(permission);
      }
    }

    // Buscar el rol de administrador
    console.log('\n👔 Buscando rol ARCHITECT SOLUTIONS...');
    const adminRole = await Role.findOne({ name: 'ARCHITECT SOLUTIONS' });
    
    if (!adminRole) {
      console.log('❌ No se encontró el rol ARCHITECT SOLUTIONS');
      console.log('💡 Ejecuta primero: npm run seed');
      process.exit(1);
    }

    console.log(`✅ Rol encontrado: ${adminRole.name}`);
    console.log(`   Permisos actuales: ${adminRole.permissions.length}`);

    // Añadir los nuevos permisos al rol si no existen
    let permisosAñadidos = 0;
    
    for (const permission of createdPermissions) {
      const yaExiste = adminRole.permissions.some(
        (p) => p.toString() === permission._id.toString()
      );
      
      if (!yaExiste) {
        adminRole.permissions.push(permission._id as mongoose.Types.ObjectId);
        permisosAñadidos++;
      }
    }

    if (permisosAñadidos > 0) {
      await adminRole.save();
      console.log(`\n✅ Se añadieron ${permisosAñadidos} permisos nuevos al rol`);
    } else {
      console.log('\nℹ️  El rol ya tenía todos los permisos');
    }

    console.log(`📊 Total de permisos en el rol: ${adminRole.permissions.length}\n`);

    // Listar todos los permisos del sistema
    console.log('📋 Permisos totales en el sistema:');
    const allPermissions = await Permission.find().sort('resource action');
    
    const groupedPerms: Record<string, string[]> = {};
    allPermissions.forEach((perm) => {
      if (!groupedPerms[perm.resource]) {
        groupedPerms[perm.resource] = [];
      }
      groupedPerms[perm.resource].push(perm.action);
    });

    Object.entries(groupedPerms).forEach(([resource, actions]) => {
      console.log(`   📁 ${resource}: ${actions.join(', ')}`);
    });

    console.log(`\n✅ Total: ${allPermissions.length} permisos\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Ejecutar el script
addPermissionsToAdmin();
