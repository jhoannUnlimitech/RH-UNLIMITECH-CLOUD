import { connectDB } from '../config/database';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';

const checkPermissions = async () => {
  try {
    await connectDB();
    console.log('🔗 Conectado a la base de datos\n');

    // Contar permisos
    const permissionsCount = await Permission.countDocuments();
    console.log(`📊 Total de permisos en BD: ${permissionsCount}\n`);

    if (permissionsCount === 0) {
      console.log('⚠️  NO HAY PERMISOS EN LA BASE DE DATOS');
      console.log('💡 Ejecuta: npm run seed\n');
      process.exit(1);
    }

    // Listar todos los permisos agrupados
    const permissions = await Permission.find().sort('resource action');
    
    const grouped: Record<string, string[]> = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm.action);
    });

    console.log('📋 Permisos por módulo:\n');
    Object.entries(grouped).forEach(([resource, actions]) => {
      console.log(`   📁 ${resource}:`);
      actions.forEach(action => {
        console.log(`      - ${action}`);
      });
      console.log('');
    });

    // Verificar roles
    console.log('👔 Roles en el sistema:\n');
    const roles = await Role.find().populate('permissions', 'resource action');
    
    for (const role of roles) {
      console.log(`   🔐 ${role.name}`);
      console.log(`      Permisos: ${role.permissions.length}`);
      
      const rolePermsByModule: Record<string, number> = {};
      role.permissions.forEach((perm: any) => {
        if (!rolePermsByModule[perm.resource]) {
          rolePermsByModule[perm.resource] = 0;
        }
        rolePermsByModule[perm.resource]++;
      });
      
      Object.entries(rolePermsByModule).forEach(([resource, count]) => {
        console.log(`         - ${resource}: ${count} permisos`);
      });
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkPermissions();
