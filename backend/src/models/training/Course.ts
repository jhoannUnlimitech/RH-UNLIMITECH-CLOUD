import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * Course — Curso individual dentro de un nivel de capacitación.
 *
 * Cada curso pertenece a un Level y puede tener un documento asociado
 * en la Biblioteca (LibraryDocument) como material de estudio.
 * El orden determina la secuencia de estudio dentro del nivel.
 */

export interface ICourse extends Document {
  name: string;
  description: string;
  link?: string;                   // URL externa (video, plataforma)
  libraryDocument?: Types.ObjectId; // ref: LibraryDocument (material en Biblioteca)
  order: number;                   // Orden dentro del nivel
  level: Types.ObjectId;           // ref: Level
  estimatedHours?: number;         // Horas estimadas de duración
  active: boolean;

  // Soft delete
  deleted: boolean;
  deletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Métodos
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

const CourseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: [true, 'El nombre del curso es requerido'],
    trim: true,
    maxlength: [150, 'El nombre no puede exceder 150 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  link: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'El link debe ser una URL válida (http/https)']
  },
  libraryDocument: {
    type: Schema.Types.ObjectId,
    ref: 'LibraryDocument'
  },
  order: {
    type: Number,
    required: true,
    min: [0, 'El orden no puede ser negativo']
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
    required: [true, 'El nivel es requerido'],
    index: true
  },
  estimatedHours: {
    type: Number,
    min: [0.25, 'Las horas estimadas deben ser al menos 0.25'],
    max: [100, 'Las horas estimadas no pueden exceder 100']
  },
  active: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// --- Índices ---
CourseSchema.index({ level: 1, order: 1 });
CourseSchema.index({ active: 1, deleted: 1 });
CourseSchema.index({ libraryDocument: 1 });

// --- Plugin soft delete ---
CourseSchema.plugin(softDeletePlugin);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
