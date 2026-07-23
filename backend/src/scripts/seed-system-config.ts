import mongoose from 'mongoose';
import { config } from '../config/env';
import { connectDB } from '../config/database';
import { SystemConfig } from '../models/SystemConfig';
import { CalendarEvent } from '../models/CalendarEvent';
import { Employee } from '../models/Employee';

/**
 * Seed — Configuración del Sistema + Festivos de Colombia 2026.
 *
 * Crea el documento singleton de SystemConfig con los defaults de la empresa,
 * y registra los festivos de Colombia 2026 como CalendarEvent type='holiday'.
 *
 * Uso: npx ts-node src/scripts/seed-system-config.ts
 */

const HOLIDAYS_COLOMBIA_2026 = [
  { date: '2026-01-01', title: 'Año Nuevo' },
  { date: '2026-01-12', title: 'Día de los Reyes Magos' },
  { date: '2026-03-23', title: 'Día de San José' },
  { date: '2026-04-02', title: 'Jueves Santo' },
  { date: '2026-04-03', title: 'Viernes Santo' },
  { date: '2026-05-01', title: 'Día del Trabajo' },
  { date: '2026-05-18', title: 'Ascensión del Señor' },
  { date: '2026-06-08', title: 'Corpus Christi' },
  { date: '2026-06-15', title: 'Sagrado Corazón de Jesús' },
  { date: '2026-06-29', title: 'San Pedro y San Pablo' },
  { date: '2026-07-20', title: 'Día de la Independencia' },
  { date: '2026-08-07', title: 'Batalla de Boyacá' },
  { date: '2026-08-17', title: 'Asunción de la Virgen' },
  { date: '2026-10-12', title: 'Día de la Raza' },
  { date: '2026-11-02', title: 'Todos los Santos' },
  { date: '2026-11-16', title: 'Independencia de Cartagena' },
  { date: '2026-12-08', title: 'Inmaculada Concepción' },
  { date: '2026-12-25', title: 'Navidad' },
];

async function seedSystemConfig() {
  try {
    await connectDB();
    console.log('🔗 Conectado a MongoDB');

    // 1. Crear/actualizar SystemConfig (singleton)
    const existing = await SystemConfig.findOne();
    if (existing) {
      console.log('⚠️  SystemConfig ya existe — actualizando...');
      existing.general = {
        companyName: 'Unlimitech Cloud',
        timezone: 'America/Bogota',
        locale: 'es-CO',
        dateFormat: 'DD/MM/YYYY',
      };
      existing.schedule = {
        workDays: [1, 2, 3, 4, 5],       // Lunes a Viernes
        workHoursStart: '08:00',
        workHoursEnd: '18:00',
        studyDays: [1, 3, 5],            // Lunes, Miércoles, Viernes
      };
      existing.training = {
        minWeeklyHours: 3,
        examPassingScore: 80,
        maxExamAttempts: 3,
        studyReportMaxHoursPerDay: 12,
      };
      existing.notifications = {
        retentionDays: 90,
        emailEnabled: false,
        summaryFrequency: 'none',
      };
      await existing.save();
      console.log('✅ SystemConfig actualizado');
    } else {
      await SystemConfig.create({
        general: {
          companyName: 'Unlimitech Cloud',
          timezone: 'America/Bogota',
          locale: 'es-CO',
          dateFormat: 'DD/MM/YYYY',
        },
        schedule: {
          workDays: [1, 2, 3, 4, 5],
          workHoursStart: '08:00',
          workHoursEnd: '18:00',
          studyDays: [1, 3, 5],
        },
        training: {
          minWeeklyHours: 3,
          examPassingScore: 80,
          maxExamAttempts: 3,
          studyReportMaxHoursPerDay: 12,
        },
        holidays: [],
        notifications: {
          retentionDays: 90,
          emailEnabled: false,
          summaryFrequency: 'none',
        },
      });
      console.log('✅ SystemConfig creado con defaults');
    }

    // 2. Crear festivos de Colombia 2026 como CalendarEvents
    // Obtener un usuario admin para createdBy
    const admin = await Employee.findOne({ email: 'admin@unlimitech.cloud' });
    if (!admin) {
      console.log('⚠️  No se encontró admin@unlimitech.cloud — festivos no creados');
    } else {
      let created = 0;
      let skipped = 0;

      for (const holiday of HOLIDAYS_COLOMBIA_2026) {
        const startDate = new Date(holiday.date + 'T00:00:00');
        const endDate = new Date(holiday.date + 'T23:59:59');

        // Verificar si ya existe
        const exists = await CalendarEvent.findOne({
          type: 'holiday',
          title: holiday.title,
          startDate: { $gte: startDate, $lte: endDate },
        });

        if (exists) {
          skipped++;
          continue;
        }

        await CalendarEvent.create({
          title: holiday.title,
          description: `Festivo Colombia — ${holiday.title}`,
          startDate,
          endDate,
          color: 'danger',
          type: 'holiday',
          allDay: true,
          createdBy: admin._id,
        });
        created++;
      }

      console.log(`✅ Festivos Colombia 2026: ${created} creados, ${skipped} ya existían`);
    }

    console.log('\n🎉 Seed de configuración completado');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSystemConfig();
