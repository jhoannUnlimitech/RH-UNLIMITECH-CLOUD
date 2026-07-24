import mongoose, { Schema, Document } from 'mongoose';

/**
 * BonusRecord — Registro de bonificación asignada a un empleado por trimestre.
 *
 * Se crea al calcular bonificaciones trimestrales.
 * Cada empleado tiene máximo un BonusRecord por trimestre.
 * Status: pending → paid (monetario) o acknowledged (simbólico).
 */

export interface IBonusRecord extends Document {
  employee: mongoose.Types.ObjectId;
  quarter: number;           // 1-4
  year: number;
  totalHours: number;        // Horas del trimestre (snapshot)
  bonusRange: {              // Snapshot desnormalizado del rango al momento del cálculo
    name: string;
    prizeType: string;
    prizeDescription: string;
    prizeAmount?: number;
    prizeCurrency?: string;
    color: string;
  };
  status: 'pending' | 'paid' | 'acknowledged';
  paidAt?: Date;
  paidBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BonusRecordSchema = new Schema<IBonusRecord>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  quarter: { type: Number, required: true, min: 1, max: 4 },
  year: { type: Number, required: true },
  totalHours: { type: Number, required: true },
  bonusRange: {
    name: { type: String, required: true },
    prizeType: { type: String, required: true },
    prizeDescription: { type: String, required: true },
    prizeAmount: { type: Number },
    prizeCurrency: { type: String },
    color: { type: String },
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'acknowledged'],
    default: 'pending',
  },
  paidAt: { type: Date },
  paidBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  notes: { type: String, trim: true },
}, { timestamps: true });

// Un empleado solo puede tener un bono por trimestre
BonusRecordSchema.index({ employee: 1, quarter: 1, year: 1 }, { unique: true });
BonusRecordSchema.index({ quarter: 1, year: 1, status: 1 });

export const BonusRecord = mongoose.model<IBonusRecord>('BonusRecord', BonusRecordSchema);
