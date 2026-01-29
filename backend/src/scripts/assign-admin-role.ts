import { connectDB } from '../config/database';
import { Role } from '../models/Role';
import { Employee } from '../models/Employee';
import mongoose from 'mongoose';

/**
 * Script para asignar el rol de administrador al usuario admin@rh.com
 */
const assignAdminRole = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🔗 Conectado a la base de datos\n');

    // Buscar el rol de ARCHITECT SOLUTIONS (administrador)
    const adminRole = await Role.findOne({ name: 'ARCHITECT SOLUTIONS' });
    
    if (!adminRole) {
      console.log('❌ No se encontró el rol ARCHITECT SOLUTIONS');
      console.log('💡 Ejecuta primero: npm run seed');
      process.exit(1);
    }

    console.log(`✅ Rol encontrado: ${adminRole.name} (ID: ${adminRole._id})`);
    console.log(`   Permisos: ${adminRole.permissions.length}\n`);

    // Buscar el usuario admin@rh.com
    const admin = await Employee.findOne({ email: 'admin@rh.com' });
    
    if (!admin) {
      console.log('❌ No se encontró el usuario admin@rh.com');
      console.log('💡 Ejecuta primero: npm run seed');
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado: ${admin.name} (${admin.email})`);
    console.log(`   Rol actual: ${admin.role}\n`);

    // Asignar el rol de administrador
    admin.role = adminRole._id as mongoose.Types.ObjectId;
    await admin.save();

    console.log('✅ Rol de administrador asignado exitosamente!');
    console.log(`   Usuario: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${adminRole.name}`);
    console.log(`   Permisos totales: ${adminRole.permissions.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al asignar rol:', error);
    process.exit(1);
  }
};

// Ejecutar el script
assignAdminRole();
