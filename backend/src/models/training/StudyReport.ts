import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * StudyReport — Reporte diario de estudio de un empleado.
 *
 * Cada empleado reporta qué cursos estudió, cuántas horas, y si terminó alguno.
 * Días obligatorios: L, M, V (configurable). Mínimo 1h/día, 3h/semana.
 * Ventana: jueves a miércoles 23:59 (D9).
 */

export interface IStudyReportEntry {
  course: Types.ObjectId;          // ref: Course
  hoursSpent: number;
  completed: boolean;
  progress?: string;               // Si no terminó: en qué parte quedó
}

export interface IStudyReport extends Document {
  employee: Types.ObjectId;
  date: Date;                      // Fecha del reporte (normalizada a 00:00)
  weekStart: Date;                 // Jueves 00:00 de la semana
  weekEnd: Date;                   // Miércoles 23:59 de la semana
  entries: IStudyReportEntry[];
  totalHours: number;              // Suma del día
  observations?: string;           // Notas adicionales
  createdAt: Date;
  updatedAt: Date;
}

const StudyReportEntrySchema = new Schema<IStudyReportEntry>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  hoursSpent: { type: Number, required: true, min: 0.25, max: 12 },
  completed: { type: Boolean, default: false },
  progress: { type: String, maxlength: 500 },
}, { _id: false });

const StudyReportSchema = new Schema<IStudyReport>({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  entries: {
    type: [StudyReportEntrySchema],
    required: true,
    validate: {
      validator: (entries: IStudyReportEntry[]) => entries.length >= 1,
      message: 'Debe reportar al menos un curso',
    },
  },
  totalHours: { type: Number, default: 0, min: 0 },
  observations: { type: String, maxlength: 1000 },
}, {
  timestamps: true,
  toJSON: { transform: (_doc, ret) => { delete ret.__v; return ret; } },
});

// Índices
StudyReportSchema.index({ employee: 1, date: 1 }, { unique: true }); // Un reporte por día por empleado
StudyReportSchema.index({ employee: 1, weekStart: 1 });
StudyReportSchema.index({ weekStart: 1, weekEnd: 1 });

export const StudyReport = mongoose.model<IStudyReport>('StudyReport', StudyReportSchema);
