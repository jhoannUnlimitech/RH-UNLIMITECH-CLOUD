import mongoose, { Schema, Document } from 'mongoose';

/**
 * AttendanceRecord — Registro manual de asistencia a estudio.
 *
 * El encargado de Training pasa lista L/M/V y marca si cada empleado asistió.
 * Un registro = un empleado + una fecha + presente/ausente/exento.
 * Exento = festivo, vacaciones, permiso (CSW aprobado), etc.
 */

export interface IAttendanceRecord extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  present: boolean;
  exempt: boolean;               // Exento (festivo, vacaciones, permiso)
  exemptReason?: string;         // Razón de exención
  markedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El empleado es requerido'],
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida'],
  },
  present: {
    type: Boolean,
    required: true,
    default: false,
  },
  exempt: {
    type: Boolean,
    default: false,
  },
  exemptReason: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  markedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200,
  },
}, {
  timestamps: true,
});

// Un empleado solo puede tener un registro por fecha
AttendanceRecordSchema.index({ employee: 1, date: 1 }, { unique: true });
AttendanceRecordSchema.index({ date: 1 });

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
