import mongoose, { Schema, Document } from 'mongoose';

/**
 * AttendanceRecord — Registro manual de asistencia a estudio.
 *
 * El encargado de Training pasa lista L/M/V y marca si cada empleado asistió.
 * Un registro = un empleado + una fecha + presente/ausente.
 */

export interface IAttendanceRecord extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  present: boolean;
  markedBy: mongoose.Types.ObjectId; // Quién pasó lista
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
