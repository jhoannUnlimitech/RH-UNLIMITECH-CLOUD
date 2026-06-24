/**
 * Script para añadir el campo 'status' a todos los empleados existentes
 * Este script establece 'status: active' para todos los empleados que no tienen este campo
 */

import mongoose from 'mongoose';
import { Employee } from '../models/Employee';
import { config } from '../config/env';

const addStatusToEmployees = async () => {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Conectado a MongoDB');

    // Actualizar todos los empleados que no tienen el campo status
    const result = await Employee.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    console.log(`✓ ${result.modifiedCount} empleados actualizados con status: 'active'`);

    // Verificar que todos los empleados tengan el campo status
    const employeesWithoutStatus = await Employee.countDocuments({ 
      status: { $exists: false } 
    });

    if (employeesWithoutStatus === 0) {
      console.log('✓ Todos los empleados tienen el campo status');
    } else {
      console.log(`⚠ Aún hay ${employeesWithoutStatus} empleados sin el campo status`);
    }

    // Mostrar algunos ejemplos
    const employees = await Employee.find()
      .select('name email status')
      .limit(5);

    console.log('\nPrimeros 5 empleados:');
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email}): status = ${emp.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar script
addStatusToEmployees();
