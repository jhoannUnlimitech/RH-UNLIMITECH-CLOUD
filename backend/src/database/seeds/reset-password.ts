import { connectDB } from '../../config/database';
import { Employee } from '../../models/Employee';
import bcrypt from 'bcrypt';

/**
 * Reset Password - Restablece contraseñas de usuarios específicos
 * 
 * Uso: npx ts-node src/database/seeds/reset-password.ts [email] [password]
 * 
 * Sin argumentos: resetea admin@rh.com y jeacosta37@gmail.com a Pass2014!
 */
const resetPasswords = async (): Promise<void> => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const email = args[0];
    const newPassword = args[1] || 'Pass2014!';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (email) {
      // Reset un usuario específico
      const result = await Employee.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
      console.log(`${email}: ${result.modifiedCount > 0 ? '✅ Contraseña actualizada' : '❌ No encontrado'}`);
    } else {
      // Reset usuarios por defecto
      const users = ['admin@rh.com', 'jeacosta37@gmail.com'];
      for (const userEmail of users) {
        const result = await Employee.updateOne(
          { email: userEmail },
          { $set: { password: hashedPassword } }
        );
        console.log(`${userEmail}: ${result.modifiedCount > 0 ? '✅ Contraseña actualizada' : '❌ No encontrado'}`);
      }
    }

    console.log(`\n🔐 Nueva contraseña: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPasswords();
