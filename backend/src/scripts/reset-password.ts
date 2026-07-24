import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Employee } from '../models/Employee';

/**
 * Reset password for a specific user.
 * Usage: npx ts-node src/scripts/reset-password.ts <email> <newPassword>
 */

async function resetPassword() {
  const email = process.argv[2] || 'talent@unlimitech.cloud';
  const newPassword = process.argv[3] || 'Pass2014!';

  await connectDB();
  console.log('🔗 Conectado a MongoDB');

  const user = await Employee.findOne({ email }).select('+password');
  if (!user) {
    console.log(`❌ Usuario ${email} no encontrado`);
    process.exit(1);
  }

  // Asignar password en TEXTO PLANO — el pre-save hook se encarga de hashearlo
  user.password = newPassword;
  user.forcePasswordChange = false;
  await user.save();

  console.log(`✅ Contraseña de ${email} reseteada a: ${newPassword}`);
  await mongoose.disconnect();
  process.exit(0);
}

resetPassword();
