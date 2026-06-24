import mongoose from 'mongoose';
import { Employee } from '../../models/Employee';
import { config } from '../../config/env';

/**
 * Migración 004: Añadir campo 'approve_csw' a empleados existentes
 * 
 * Descripción: Establece approve_csw=false para todos los empleados sin este campo
 * Fecha: 2026-06-24
 * Autor: RH-UNLIMITECH Team
 */
const migrate = async () => {
  try {
    console.log('🔄 Migración 004: add-approve-csw-to-employees');
    console.log('   Conectando a MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado\n');

    const result = await Employee.updateMany(
      { approve_csw: { $exists: false } },
      { $set: { approve_csw: false } }
    );

    console.log(`   ✅ ${result.modifiedCount} empleados actualizados con approve_csw: false`);

    const remaining = await Employee.countDocuments({ approve_csw: { $exists: false } });
    if (remaining === 0) {
      console.log('   ✅ Migración completada: todos los empleados tienen approve_csw');
    } else {
      console.log(`   ⚠️  ${remaining} empleados aún sin approve_csw`);
    }
  } catch (error) {
    console.error('   ❌ Error en migración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Migración 004 finalizada');
    process.exit(0);
  }
};

migrate();
