import mongoose from 'mongoose';
import { Division } from '../models/Division';
import { Employee } from '../models/Employee';
import { config } from '../config/env';

const fixDivisionsManagerId = async () => {
  try {
    console.log('🔧 Conectando a MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todos los empleados
    const employees = await Employee.find({ deleted: { $ne: true } });
    console.log(`👥 Total de empleados disponibles: ${employees.length}`);
    
    if (employees.length === 0) {
      console.error('❌ No hay empleados disponibles para asignar');
      process.exit(1);
    }

    // Buscar directamente en la colección sin usar el modelo (para evitar transforms)
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const divisionsCollection = db.collection('divisions');
    
    // Primero ver todas las divisiones
    const allRawDivisions = await divisionsCollection.find({}).toArray();
    console.log(`📊 Total de divisiones en BD: ${allRawDivisions.length}`);
    
    // Mostrar algunos ejemplos de managerId
    console.log('\n🔍 Ejemplos de managerId en BD:');
    for (let i = 0; i < Math.min(3, allRawDivisions.length); i++) {
      const div = allRawDivisions[i];
      console.log(`  - ${div.name}: "${div.managerId}" (tipo: ${typeof div.managerId}, length: ${String(div.managerId).length})`);
    }
    
    // Encontrar divisiones con managerId corrupto
    const corruptedDivisions = allRawDivisions.filter(div => {
      const managerIdStr = String(div.managerId);
      return managerIdStr === '[object Object]' || managerIdStr.length !== 24;
    });
    
    console.log(`\n📊 Divisiones con managerId corrupto: ${corruptedDivisions.length}\n`);

    let fixedCount = 0;

    for (let i = 0; i < corruptedDivisions.length; i++) {
      const division = corruptedDivisions[i];
      try {
        // Asignar un empleado de forma rotativa
        const employeeIndex = i % employees.length;
        const assignedEmployee = employees[employeeIndex];
        
        console.log(`🔧 Corrigiendo División "${division.name}"`);
        console.log(`   Antiguo managerId: "${division.managerId}"`);
        console.log(`   Nuevo manager: ${assignedEmployee.name} (${assignedEmployee._id})`);
        
        // Actualizar directamente en la colección
        await divisionsCollection.updateOne(
          { _id: division._id },
          { $set: { managerId: assignedEmployee._id } }
        );
        
        fixedCount++;
        console.log(`   ✅ Actualizado correctamente\n`);
      } catch (error: any) {
        console.error(`❌ Error procesando división "${division.name}":`, error.message);
      }
    }
    
    // Verificar divisiones correctas
    const allDivisions = await Division.find({}).populate('managerId');
    const correctCount = allDivisions.length - fixedCount;

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Divisiones corregidas: ${fixedCount}`);
    console.log(`   ✅ Divisiones ya correctas: ${correctCount}`);
    console.log(`   📋 Total procesado: ${allDivisions.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

fixDivisionsManagerId();
