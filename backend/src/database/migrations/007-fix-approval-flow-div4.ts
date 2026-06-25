/**
 * Migration 007: Fix ApprovalFlow de División 4 (Infraestructura)
 * 
 * Flujo correcto según la configuración de la división:
 * Nivel 1: Moises Gonzalez (moises@unlimitech.cloud)
 * Nivel 2: Manuel Lara (admin@unlimitech.cloud) 
 * Nivel 3: Laura Hernandez (talent@unlimitech.cloud)
 * 
 * Uso: npx ts-node src/database/migrations/007-fix-approval-flow-div4.ts
 */
import mongoose from 'mongoose';
import { config } from '../../config/env';
import { Employee } from '../../models/Employee';
import '../../models/Role';
import '../../models/Division';
import '../../models/ApprovalFlow';

async function migrate() {
  try {
    console.log('🔄 Migration 007: Fix ApprovalFlow División 4...');
    
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Conectado a MongoDB');

    const ApprovalFlow = mongoose.model('ApprovalFlow');
    const Division = mongoose.model('Division');

    // Buscar División 4
    const div4 = await Division.findOne({ code: 'DIV04', deleted: false });
    if (!div4) {
      console.error('❌ No se encontró División 4');
      process.exit(1);
    }
    console.log('   ✅ División 4:', (div4 as any).name);

    // Buscar empleados
    const moises = await Employee.findOne({ email: 'moises@unlimitech.cloud', deleted: false });
    const manuel = await Employee.findOne({ email: 'admin@unlimitech.cloud', deleted: false });
    const laura = await Employee.findOne({ email: 'talent@unlimitech.cloud', deleted: false });

    if (!moises || !manuel || !laura) {
      console.error('❌ No se encontraron todos los aprobadores:');
      console.log('   Moises:', moises ? '✅' : '❌');
      console.log('   Manuel:', manuel ? '✅' : '❌');
      console.log('   Laura:', laura ? '✅' : '❌');
      process.exit(1);
    }

    console.log('   ✅ Moises:', moises._id);
    console.log('   ✅ Manuel:', manuel._id);
    console.log('   ✅ Laura:', laura._id);

    // Buscar flujo activo de Div 4
    const flow = await ApprovalFlow.findOne({ divisionId: div4._id, active: true, deleted: false });
    if (!flow) {
      console.error('❌ No se encontró flujo activo para División 4');
      process.exit(1);
    }

    // Actualizar niveles
    (flow as any).levels = [
      { order: 1, name: 'Aprobación', approverType: 'user', approverUserId: moises._id, required: true, autoApprove: false },
      { order: 2, name: 'Aprobación', approverType: 'user', approverUserId: manuel._id, required: true, autoApprove: false },
      { order: 3, name: 'Aprobación', approverType: 'user', approverUserId: laura._id, required: true, autoApprove: false },
    ];

    await (flow as any).save();
    console.log('\n✅ Flujo actualizado:');
    console.log('   Nivel 1: Moises Gonzalez');
    console.log('   Nivel 2: Manuel Lara');
    console.log('   Nivel 3: Laura Hernandez');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrate();
