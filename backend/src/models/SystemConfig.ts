import mongoose, { Schema, Document } from 'mongoose';

/**
 * SystemConfig — Configuración general del sistema (singleton).
 *
 * Un solo documento en la colección que almacena todos los parámetros
 * globales del sistema. Se carga una vez al iniciar y se cachea.
 *
 * Secciones:
 * - general: timezone, nombre empresa, logo
 * - schedule: días laborales, horario, días obligatorios de estudio
 * - training: mínimo horas semanales, umbral aprobación exámenes
 * - holidays: lista de festivos donde no se pasa lista
 * - notifications: retención, frecuencia de resúmenes
 */

export interface IHoliday {
  date: string;       // YYYY-MM-DD
  name: string;       // Nombre del festivo
  recurring: boolean; // true = se repite cada año (ignora el año)
}

export interface ISystemConfig extends Document {
  // General
  general: {
    companyName: string;
    timezone: string;          // IANA timezone (ej: 'America/Bogota')
    locale: string;            // Locale para formateo (ej: 'es-CO')
    dateFormat: string;        // Formato de fecha (ej: 'DD/MM/YYYY')
    logo?: string;             // URL o base64 del logo
  };

  // Horario y jornada
  schedule: {
    workDays: number[];        // Días laborales [1,2,3,4,5] = L-V
    workHoursStart: string;    // Hora inicio (ej: '08:00')
    workHoursEnd: string;      // Hora fin (ej: '17:00')
    studyDays: number[];       // Días obligatorios de estudio [1,3,5] = L/M/V
  };

  // Training
  training: {
    minWeeklyHours: number;    // Mínimo horas semanales de estudio (default: 3)
    examPassingScore: number;  // Porcentaje mínimo para aprobar examen (default: 80)
    maxExamAttempts: number;   // Máximo intentos por examen (default: 3)
    studyReportMaxHoursPerDay: number; // Máximo horas reportables por día (default: 12)
  };

  // Festivos
  holidays: IHoliday[];

  // Notificaciones
  notifications: {
    retentionDays: number;     // Días que se retienen notificaciones (default: 90)
    emailEnabled: boolean;     // Enviar notificaciones por email
    summaryFrequency: 'daily' | 'weekly' | 'none'; // Frecuencia de resumen
  };

  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const HolidaySchema = new Schema<IHoliday>({
  date: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  recurring: { type: Boolean, default: false },
}, { _id: true });

const SystemConfigSchema = new Schema<ISystemConfig>({
  general: {
    companyName: { type: String, default: 'Unlimitech Cloud' },
    timezone: { type: String, default: 'America/Bogota' },
    locale: { type: String, default: 'es-CO' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    logo: { type: String },
  },
  schedule: {
    workDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    workHoursStart: { type: String, default: '08:00' },
    workHoursEnd: { type: String, default: '17:00' },
    studyDays: { type: [Number], default: [1, 3, 5] },
  },
  training: {
    minWeeklyHours: { type: Number, default: 3 },
    examPassingScore: { type: Number, default: 80 },
    maxExamAttempts: { type: Number, default: 3 },
    studyReportMaxHoursPerDay: { type: Number, default: 12 },
  },
  holidays: { type: [HolidaySchema], default: [] },
  notifications: {
    retentionDays: { type: Number, default: 90 },
    emailEnabled: { type: Boolean, default: false },
    summaryFrequency: { type: String, enum: ['daily', 'weekly', 'none'], default: 'none' },
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
}, {
  timestamps: true,
  collection: 'system_config',
});

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
