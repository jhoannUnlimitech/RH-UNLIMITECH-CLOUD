import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from './base/BaseModel';

/**
 * Modelo de Proyecto
 * Un proyecto pertenece a una división y puede tener múltiples empleados asignados.
 * Aplica para: Technical Leaders, Developers, QA, Architects (no administrativos)
 */
export interface IProject extends Document {
  name: string;
  code: string;                       // Código corto del proyecto (ej: "WF-001")
  description?: string;
  divisionId: Types.ObjectId;         // División a la que pertenece
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  members: Types.ObjectId[];          // Empleados asignados
  leadId?: Types.ObjectId;            // Líder del proyecto (TL o PM)
  repositories?: { name: string; url: string; type: string }[]; // Links a repositorios
  
  // Soft delete
  deleted: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, 'El nombre del proyecto es requerido'],
    trim: true,
    maxlength: [150, 'El nombre no puede exceder 150 caracteres']
  },
  code: {
    type: String,
    required: [true, 'El código del proyecto es requerido'],
    trim: true,
    uppercase: true,
    unique: true,
    maxlength: [20, 'El código no puede exceder 20 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  divisionId: {
    type: Schema.Types.ObjectId,
    ref: 'Division',
    required: [true, 'La división es requerida'],
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'on_hold', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  repositories: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['github', 'gitlab', 'bitbucket', 'other'], default: 'github' }
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
ProjectSchema.index({ code: 1 }, { unique: true });
ProjectSchema.index({ divisionId: 1, status: 1 });
ProjectSchema.index({ members: 1 });
ProjectSchema.index({ deleted: 1 });

// Plugin soft delete
ProjectSchema.plugin(softDeletePlugin);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
