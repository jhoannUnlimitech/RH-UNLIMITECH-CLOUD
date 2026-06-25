/**
 * Migration 006: Agregar categoría "Orden de Estudio" con aprobación directa por Oscar Avila
 * 
 * Esta categoría tiene useDefaultFlow=false, es decir que no pasa por el flujo
 * de aprobación de la división sino que va directamente a Oscar Avila (EVP).
 * 
 * Uso: npx ts-node src/database/migrations/006-add-orden-estudio-category.ts
 */
import mongoose from 'mongoose';
import { config } from '../../config/env';
import { CSWCategory } from '../../models/CSWCategory';
import { Employee } from '../../models/Employee';

async function migrate() {
  try {
    console.log('🔄 Migration 006: Agregar categoría "Orden de Estudio"...');
    
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Conectado a MongoDB');

    // Buscar a Oscar Hernandez (encargado de capacitación/estudios)
    const oscar = await Employee.findOne({ 
      email: 'training@unlimitech.cloud',
      deleted: false 
    });

    if (!oscar) {
      console.error('❌ No se encontró a Oscar Hernandez (training@unlimitech.cloud)');
      console.log('   Asegúrate de haber ejecutado el seed primero.');
      process.exit(1);
    }

    console.log(`   ✅ Oscar Hernandez encontrado: ${oscar._id}`);

    // Verificar si ya existe la categoría
    const existing = await CSWCategory.findOne({ 
      name: 'Orden de Estudio',
      deleted: false 
    });

    if (existing) {
      console.log('   ⚠️ La categoría "Orden de Estudio" ya existe, actualizando...');
      existing.useDefaultFlow = false;
      (existing as any).directApproverId = oscar._id;
      existing.description = 'Solicitud de cambio de horario para horas de estudio';
      existing.active = true;
      await existing.save();
      console.log('   ✅ Categoría actualizada');
    } else {
      // Obtener el último order
      const lastCategory = await CSWCategory.findOne({ deleted: false })
        .sort({ order: -1 })
        .select('order');
      
      const nextOrder = (lastCategory?.order || 10) + 1;

      await CSWCategory.create({
        name: 'Orden de Estudio',
        description: 'Solicitud de cambio de horario para horas de estudio',
        active: true,
        order: nextOrder,
        useDefaultFlow: false,
        directApproverId: oscar._id,
      } as any);
      console.log(`   ✅ Categoría "Orden de Estudio" creada (order: ${nextOrder})`);
    }

    console.log('\n✅ Migration 006 completada exitosamente');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migration:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrate();
