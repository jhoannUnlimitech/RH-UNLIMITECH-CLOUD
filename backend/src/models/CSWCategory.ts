import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin } from './base/BaseModel';

/**
 * Categorías configurables para solicitudes CSW
 * Ejemplos: Permiso, Aumento, Incapacidad, Vacaciones, etc.
 */
export interface ICSWCategory extends Document {
  name: string;
  description?: string;
  active: boolean;
  order: number; // Para ordenar en el combobox
  
  // Soft delete
  deleted: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const CSWCategorySchema = new Schema<ICSWCategory>({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true,
    unique: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [250, 'La descripción no puede exceder 250 caracteres']
  },
  
  active: {
    type: Boolean,
    default: true
  },
  
  order: {
    type: Number,
    default: 0
  },
  
  deleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date
}, {
  timestamps: true
});

// Aplicar plugin de soft delete
CSWCategorySchema.plugin(softDeletePlugin);

// Índices
CSWCategorySchema.index({ active: 1, order: 1 });
CSWCategorySchema.index({ deleted: 1 });

export const CSWCategory = model<ICSWCategory>('CSWCategory', CSWCategorySchema);
