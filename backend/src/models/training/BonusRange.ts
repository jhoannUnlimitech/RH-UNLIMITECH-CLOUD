import mongoose, { Schema, Document } from 'mongoose';

/**
 * BonusRange — Rangos de bonificación por horas de estudio trimestral.
 *
 * Define los rangos: quién estudió entre X y Y horas extra recibe Z premio.
 * Configurable por el admin desde /settings o /training/admin/config.
 * Se evalúa al final de cada trimestre.
 */

export interface IBonusRange extends Document {
  name: string;              // Ej: "Bronce", "Plata", "Oro", "Diamante"
  minHours: number;          // Mínimo de horas totales en el trimestre
  maxHours: number | null;   // Máximo (null = sin límite superior)
  order: number;             // Orden de prioridad (1 = más bajo)
  prizeType: 'symbolic' | 'monetary' | 'time_off' | 'other';
  prizeDescription: string;  // Ej: "Certificado de reconocimiento", "$100.000 COP"
  prizeAmount?: number;      // Monto (si es monetario)
  prizeCurrency?: string;    // Moneda (COP, USD, etc.)
  color: string;             // Color para UI (hex)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BonusRangeSchema = new Schema<IBonusRange>({
  name: { type: String, required: true, trim: true },
  minHours: { type: Number, required: true, min: 0 },
  maxHours: { type: Number, default: null },
  order: { type: Number, required: true },
  prizeType: {
    type: String,
    enum: ['symbolic', 'monetary', 'time_off', 'other'],
    default: 'symbolic',
  },
  prizeDescription: { type: String, required: true, trim: true },
  prizeAmount: { type: Number },
  prizeCurrency: { type: String, default: 'COP' },
  color: { type: String, default: '#3b82f6' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

BonusRangeSchema.index({ order: 1 });
BonusRangeSchema.index({ active: 1, minHours: 1 });

export const BonusRange = mongoose.model<IBonusRange>('BonusRange', BonusRangeSchema);
