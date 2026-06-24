import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../../config/env';

/**
 * Resetea TODAS las contraseñas de empleados a Pass2014!
 * Solo para datos de prueba
 */
async function resetAll() {
  await mongoose.connect(config.mongodb.uri);
  const hash = await bcrypt.hash('Pass2014!', 10);
  const result = await mongoose.connection.db!.collection('employees').updateMany(
    {},
    { $set: { password: hash } }
  );
  console.log(`✅ ${result.modifiedCount} empleados actualizados con password: Pass2014!`);
  process.exit(0);
}

resetAll().catch(err => { console.error(err); process.exit(1); });
