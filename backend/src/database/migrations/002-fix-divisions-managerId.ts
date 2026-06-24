import mongoose from 'mongoose';
import { Division } from '../../models/Division';
import { Employee } from '../../models/Employee';
import { config } from '../../config/env';

/**
 * Migración 002: Corregir managerId corrupto en divisiones
 * 
 * Descripción: Repara divisiones cuyo managerId es '[object Object]' o inválido
 * Fecha: 2026-02-15
 * Autor: RH-UNLIMITECH Team
 */
const migrate = async () => {
  try {
    console.log('🔄 Migración 002: fix-divisions-managerId');
    console.log('   Conectando a MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado\n');

    const employees = await Employee.find({ deleted: { $ne: true } });
    if (employees.length === 0) {
      console.error('   ❌ No hay empleados disponibles para asignar');
      process.exit(1);
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');

    const divisionsCollection = db.collection('divisions');
    const allDivisions = await divisionsCollection.find({}).toArray();

    const corrupted = allDivisions.filter(div => {
      const idStr = String(div.managerId);
      return idStr === '[object Object]' || idStr.length !== 24;
    });

    console.log(`   📊 Divisiones con managerId corrupto: ${corrupted.length}`);

    let fixed = 0;
    for (let i = 0; i < corrupted.length; i++) {
      const div = corrupted[i];
      const employee = employees[i % employees.length];
      await divisionsCollection.updateOne(
        { _id: div._id },
        { $set: { managerId: employee._id } }
      );
      console.log(`   ✅ "${div.name}" → manager: ${employee.name}`);
      fixed++;
    }

    console.log(`\n   📊 Resumen: ${fixed} divisiones corregidas`);
  } catch (error) {
    console.error('   ❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Migración 002 finalizada');
    process.exit(0);
  }
};

migrate();
