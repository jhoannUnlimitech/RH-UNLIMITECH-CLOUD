import mongoose from 'mongoose';
import { Employee } from '../../models/Employee';
import { config } from '../../config/env';

/**
 * Migración 001: Añadir campo 'status' a empleados existentes
 * 
 * Descripción: Establece status='active' para todos los empleados sin este campo
 * Fecha: 2026-01-29
 * Autor: RH-UNLIMITECH Team
 */
const migrate = async () => {
  try {
    console.log('🔄 Migración 001: add-status-to-employees');
    console.log('   Conectando a MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado\n');

    const result = await Employee.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    console.log(`   ✅ ${result.modifiedCount} empleados actualizados con status: 'active'`);

    const remaining = await Employee.countDocuments({ status: { $exists: false } });
    if (remaining === 0) {
      console.log('   ✅ Migración completada: todos los empleados tienen status');
    } else {
      console.log(`   ⚠️  ${remaining} empleados aún sin status`);
    }
  } catch (error) {
    console.error('   ❌ Error en migración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Migración 001 finalizada');
    process.exit(0);
  }
};

migrate();
