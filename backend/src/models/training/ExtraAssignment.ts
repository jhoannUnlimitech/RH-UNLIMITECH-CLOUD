import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * ExtraAssignment — Asignaciones extraordinarias de capacitación.
 *
 * El encargado puede asignar cursos, documentos o directivas a empleados
 * específicos o a todos. Tienen prioridad y aparecen arriba en la vista
 * del empleado (D4).
 */

export type AssignmentType = 'course' | 'document' | 'directive';
export type AssignmentPriority = 'normal' | 'high' | 'urgent';

export interface IAssignmentCompletion {
  employee: Types.ObjectId;
  completedAt: Date;
}

export interface IExtraAssignment extends Document {
  type: AssignmentType;
  resource?: Types.ObjectId;         // ref: Course | LibraryDocument (según type)
  title: string;                     // Título descriptivo
  description?: string;              // Detalle de la asignación
  assignedTo: 'all' | Types.ObjectId[];  // 'all' o lista de empleados
  assignedBy: Types.ObjectId;        // ref: Employee (quien asignó)
  reason: string;                    // Motivo de la asignación
  priority: AssignmentPriority;
  dueDate?: Date;                    // Fecha límite opcional
  completions: IAssignmentCompletion[];  // Track de quién completó
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

const AssignmentCompletionSchema = new Schema<IAssignmentCompletion>({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const ExtraAssignmentSchema = new Schema<IExtraAssignment>({
  type: {
    type: String,
    enum: ['course', 'document', 'directive'],
    required: [true, 'El tipo es requerido'],
  },
  resource: {
    type: Schema.Types.ObjectId,
    refPath: 'type',  // Dynamic ref based on type
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  assignedTo: {
    type: Schema.Types.Mixed, // 'all' o array de ObjectIds
    required: true,
    validate: {
      validator: function(val: any) {
        if (val === 'all') return true;
        if (Array.isArray(val) && val.length > 0) return true;
        return false;
      },
      message: 'Debe asignar a "all" o a al menos un empleado',
    },
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El asignador es requerido'],
  },
  reason: {
    type: String,
    required: [true, 'El motivo es requerido'],
    trim: true,
    maxlength: 500,
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal',
  },
  dueDate: {
    type: Date,
  },
  completions: {
    type: [AssignmentCompletionSchema],
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// --- Índices ---
ExtraAssignmentSchema.index({ active: 1, priority: 1, createdAt: -1 });
ExtraAssignmentSchema.index({ assignedBy: 1 });
ExtraAssignmentSchema.index({ dueDate: 1 });

// --- Plugin soft delete ---
ExtraAssignmentSchema.plugin(softDeletePlugin);

export const ExtraAssignment = mongoose.model<IExtraAssignment>('ExtraAssignment', ExtraAssignmentSchema);
