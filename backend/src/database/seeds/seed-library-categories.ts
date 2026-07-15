import mongoose from 'mongoose';
import { config } from '../../config/env';
import { LibraryCategory } from '../../models/training/LibraryCategory';
import { Employee } from '../../models/Employee';

/**
 * Seed: Categorías base de la Biblioteca
 *
 * Crea las categorías del sistema (isSystem: true) que no se pueden eliminar.
 * Idempotente: no duplica si ya existen (busca por slug).
 *
 * Ejecutar: npx ts-node src/database/seeds/seed-library-categories.ts
 */

const SYSTEM_CATEGORIES = [
  {
    name: 'Cursos',
    slug: 'cursos',
    description: 'Material formativo asociado a los niveles de training',
    icon: '📘',
    color: '#4CAF50',
    order: 1,
  },
  {
    name: 'Políticas',
    slug: 'politicas',
    description: 'Políticas empresariales, código de ética, reglamento interno',
    icon: '📋',
    color: '#2196F3',
    order: 2,
  },
];

async function seedLibraryCategories() {
  try {
    console.log('🌱 Seed: Categorías base de la Biblioteca\n');
    await mongoose.connect(config.mongodb.uri);
    console.log('   ✅ Conectado a MongoDB\n');

    // Necesitamos un admin como createdBy
    const admin = await Employee.findOne().sort({ createdAt: 1 });

    if (!admin) {
      console.error('   ❌ No se encontró ningún empleado. Ejecuta el seed principal primero.');
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;

    for (const cat of SYSTEM_CATEGORIES) {
      const existing = await LibraryCategory.findOne({ slug: cat.slug }).setOptions({ includeDeleted: true });

      if (existing) {
        console.log(`   ⏭️  "${cat.name}" ya existe (slug: ${cat.slug})`);
        skipped++;
        continue;
      }

      const category = new LibraryCategory({
        ...cat,
        isSystem: true,
        active: true,
        depth: 0,
        parent: null,
        documentsCount: 0,
        createdBy: admin._id,
      });
      await category.save();

      console.log(`   ✅ Creada: "${cat.name}" (${cat.icon})`);
      created++;
    }

    console.log(`\n📊 Resultado: ${created} creadas, ${skipped} ya existían`);
    console.log('✅ Seed de categorías completado\n');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedLibraryCategories();
