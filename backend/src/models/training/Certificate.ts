import mongoose, { Schema, Document } from 'mongoose';

/**
 * Certificate — Certificado generado al completar un nivel o insignia.
 *
 * Se genera automáticamente cuando:
 * - Un empleado aprueba el examen de un nivel → certificado tipo 'level'
 * - Un empleado completa todos los niveles de una insignia → certificado tipo 'badge'
 */

export interface ICertificateVariables {
  employeeName: string;
  employeeDivision: string;
  employeeHat: string;
  completedDate: string;
  totalHours: number;
  levelName?: string;
  badgeName?: string;
  examScore?: number;
}

export interface ICertificate extends Document {
  employee: mongoose.Types.ObjectId;
  type: 'level' | 'badge';
  referenceId: mongoose.Types.ObjectId;
  referenceName: string;
  title: string;
  variables: ICertificateVariables;
  pdfBase64?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['level', 'badge'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  referenceName: { type: String, required: true },
  title: { type: String, required: true },
  variables: {
    employeeName: { type: String, required: true },
    employeeDivision: { type: String },
    employeeHat: { type: String },
    completedDate: { type: String, required: true },
    totalHours: { type: Number, default: 0 },
    levelName: { type: String },
    badgeName: { type: String },
    examScore: { type: Number },
  },
  pdfBase64: { type: String },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

CertificateSchema.index({ employee: 1, type: 1, referenceId: 1 }, { unique: true });
CertificateSchema.index({ employee: 1, issuedAt: -1 });

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
