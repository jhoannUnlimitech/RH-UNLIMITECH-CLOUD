import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * Level — Nivel dentro de una insignia de capacitación.
 *
 * Agrupa cursos y tiene un examen asociado al final. Los niveles se
 * completan en orden secuencial estricto (D1). Al completar todos los
 * cursos requeridos, se desbloquea el examen del nivel.
 */

export interface ILevel extends Document {
  name: string;
  description?: string;
  order: number;                   // Secuencia estricta (D1: no se puede saltar)
  badge: Types.ObjectId;           // ref: Badge
  exam?: Types.ObjectId;           // ref: Exam (se asigna después)
  courses: Types.ObjectId[];       // ref: Course[]
  requiredCoursesCount: number;    // Cursos requeridos para desbloquear examen (default: todos)
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

const LevelSchema = new Schema<ILevel>({
  name: {
    type: String,
    required: [true, 'El nombre del nivel es requerido'],
    trim: true,
    maxlength: [150, 'El nombre no puede exceder 150 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  order: {
    type: Number,
    required: true,
    min: [0, 'El orden no puede ser negativo']
  },
  badge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: [true, 'La insignia es requerida'],
    index: true
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exam'
  },
  courses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  requiredCoursesCount: {
    type: Number,
    default: 0, // 0 = todos los cursos son requeridos
    min: 0
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
LevelSchema.index({ badge: 1, order: 1 });
LevelSchema.index({ active: 1, deleted: 1 });

// --- Plugin soft delete ---
LevelSchema.plugin(softDeletePlugin);

export const Level = mongoose.model<ILevel>('Level', LevelSchema);
