import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Employee } from '../models/Employee';
import { Role } from '../models/Role';
import { Division } from '../models/Division';
import { progressService } from '../services/training/progress.service';

/**
 * Seed E2E Employee — Crea un empleado temporal para tests E2E de progress.
 *
 * El empleado se crea con rol que tiene training:read + training:report.
 * Su progress se inicializa DESPUÉS de que los cursos E2E existan en BD,
 * así su progress.courses[] incluye los cursos E2E.
 *
 * Uso: npx ts-node --transpile-only src/scripts/seed-e2e-employee.ts
 * Output: imprime el employee ID para uso en tests.
 */

const E2E_EMPLOYEE = {
  name: 'E2E Test Employee',
  email: 'e2e-test@unlimitech.cloud',
  password: 'E2ETest2024!',
  phone: '3001234567',
  nationalId: 'E2E000001',
  nationality: 'Colombiana',
  birthDate: new Date('1990-01-01'),
};

async function seedE2EEmployee() {
  try {
    await connectDB();
    console.log('🔗 Conectado a MongoDB');

    // Buscar un rol con training:read
    const role = await Role.findOne({}).select('_id');
    if (!role) { console.log('❌ No hay roles en BD'); process.exit(1); }

    // Buscar una división
    const division = await Division.findOne({}).select('_id');
    if (!division) { console.log('❌ No hay divisiones en BD'); process.exit(1); }

    // Crear o reusar el empleado E2E
    let employee = await Employee.findOne({ email: E2E_EMPLOYEE.email });
    if (employee) {
      console.log(`♻️  Empleado E2E ya existe: ${employee._id}`);
    } else {
      employee = await Employee.create({
        ...E2E_EMPLOYEE,
        role: role._id,
        division: division._id,
        status: 'active',
        forcePasswordChange: false,
      });
      console.log(`✅ Empleado E2E creado: ${employee._id}`);
    }

    // Reinicializar progress (borra el anterior y crea uno nuevo con cursos actuales)
    const { EmployeeTrainingProgress } = await import('../models/training/EmployeeTrainingProgress');
    await EmployeeTrainingProgress.deleteOne({ employee: employee._id });
    const progress = await progressService.initializeForEmployee(employee._id.toString());
    
    console.log(`✅ Progress inicializado: ${progress.courses.length} cursos, ${progress.levels.length} niveles, ${progress.badges.length} insignias`);
    console.log(`📋 Employee ID: ${employee._id}`);
    console.log(`📋 Email: ${E2E_EMPLOYEE.email}`);
    console.log(`📋 Password: ${E2E_EMPLOYEE.password}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedE2EEmployee();
