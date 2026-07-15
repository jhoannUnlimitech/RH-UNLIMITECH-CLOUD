import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * Badge — Insignia gamificada de capacitación.
 *
 * Cada insignia contiene niveles que se completan en secuencia.
 * Se renderiza con una forma SVG (shape) + ícono Lucide (icon) + color.
 * Los empleados obtienen la insignia al completar todos sus niveles.
 */

export type BadgeShape =
  | 'circle'
  | 'shield'
  | 'hexagon'
  | 'star'
  | 'diamond'
  | 'pentagon'
  | 'octagon'
  | 'badge'
  | 'medal';

export const BADGE_SHAPES: BadgeShape[] = [
  'circle', 'shield', 'hexagon', 'star', 'diamond',
  'pentagon', 'octagon', 'badge', 'medal'
];

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;                    // Nombre del ícono Lucide (ej: "award", "shield-check")
  shape: BadgeShape;               // Forma SVG de la insignia
  color: string;                   // Color hex cuando está obtenida
  levels: Types.ObjectId[];        // ref: Level[] (orden define secuencia D1)
  totalCourses: number;            // Computed: suma cursos de todos los niveles
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

const BadgeSchema = new Schema<IBadge>({
  name: {
    type: String,
    required: [true, 'El nombre de la insignia es requerido'],
    trim: true,
    unique: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [300, 'La descripción no puede exceder 300 caracteres']
  },
  icon: {
    type: String,
    required: [true, 'El ícono es requerido'],
    trim: true,
    maxlength: [50, 'El nombre del ícono no puede exceder 50 caracteres']
  },
  shape: {
    type: String,
    enum: BADGE_SHAPES,
    required: [true, 'La forma es requerida'],
    default: 'circle'
  },
  color: {
    type: String,
    required: [true, 'El color es requerido'],
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser hexadecimal válido']
  },
  levels: [{
    type: Schema.Types.ObjectId,
    ref: 'Level'
  }],
  totalCourses: {
    type: Number,
    default: 0,
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
BadgeSchema.index({ name: 1 }, { unique: true });
BadgeSchema.index({ active: 1, deleted: 1 });

// --- Plugin soft delete ---
BadgeSchema.plugin(softDeletePlugin);

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
