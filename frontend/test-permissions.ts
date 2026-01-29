import { permissionsService } from './api/services/permissions';

// Script de prueba para verificar carga de permisos
async function testPermissions() {
  try {
    console.log('🧪 Iniciando prueba de carga de permisos...\n');
    
    const permissions = await permissionsService.getAll();
    
    console.log('✅ Respuesta recibida');
    console.log('Tipo:', typeof permissions);
    console.log('Es Array:', Array.isArray(permissions));
    console.log('Total permisos:', permissions.length);
    console.log('\n📊 Permisos cargados:');
    
    // Agrupar por módulo
    const grouped = permissions.reduce((acc: any, p: any) => {
      if (!acc[p.resource]) {
        acc[p.resource] = [];
      }
      acc[p.resource].push(p.action);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([module, actions]: [string, any]) => {
      console.log(`  📁 ${module}: ${actions.join(', ')}`);
    });
    
    console.log('\n✅ Prueba completada exitosamente');
  } catch (error: any) {
    console.error('❌ Error en la prueba:', error);
    console.error('Mensaje:', error.message);
    console.error('Response:', error.response?.data);
  }
}

testPermissions();
