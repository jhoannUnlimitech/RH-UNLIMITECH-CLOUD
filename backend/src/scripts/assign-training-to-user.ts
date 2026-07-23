/**
 * Script: Asignar training progress a un empleado específico.
 *
 * Ejecutar: npx tsx src/scripts/assign-training-to-user.ts jhoann@unlimitech.cloud
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const email = process.argv[2] || 'jhoann@unlimitech.cloud';
  
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rh_management';
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');

  const { Employee } = await import('../models/Employee');
  const { progressService } = await import('../services/training/progress.service');
  const { EmployeeTrainingProgress } = await import('../models/training/EmployeeTrainingProgress');

  // Buscar empleado
  const employee = await Employee.findOne({ email });
  if (!employee) {
    console.error(`❌ Empleado con email "${email}" no encontrado`);
    process.exit(1);
  }
  console.log(`👤 Empleado: ${employee.name} (${employee.email})`);

  // Verificar si ya tiene progreso
  const existing = await EmployeeTrainingProgress.findOne({ employee: employee._id });
  if (existing) {
    console.log('⚠️  Ya tiene progreso asignado. Eliminando para recrear...');
    await EmployeeTrainingProgress.deleteOne({ employee: employee._id });
  }

  // Inicializar progreso
  const progress = await progressService.initializeForEmployee(employee._id.toString());
  
  console.log('\n✅ Progreso asignado:');
  console.log(`  🏆 Insignias: ${progress.badges.length}`);
  console.log(`  📊 Niveles: ${progress.levels.length}`);
  console.log(`  📚 Cursos: ${progress.courses.length}`);
  console.log(`  📍 Nivel actual: ${progress.currentLevel || 'Ninguno (sin badges/levels disponibles)'}`);
  
  if (progress.badges.length === 0) {
    console.log('\n⚠️  No hay insignias/niveles/cursos en la BD. Ejecuta primero: npx tsx src/scripts/seed-training.ts');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
