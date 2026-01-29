import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions, softDeletePlugin } from './base/BaseModel';

export interface IPermission extends IBaseModel {
  resource: string;
  action: string;
  deleted: boolean;
  deletedAt?: Date;
}

const PermissionSchema = new Schema<IPermission>({
  resource: { 
    type: String, 
    required: [true, 'El recurso es requerido'],
    trim: true,
    lowercase: true
  },
  action: { 
    type: String, 
    required: [true, 'La acción es requerida'],
    trim: true,
    lowercase: true,
    enum: {
      values: ['read', 'create', 'update', 'delete', 'approve', 'cancel'],
      message: 'La acción debe ser: read, create, update, delete, approve o cancel'
    }
  },
  deleted: { 
    type: Boolean, 
    default: false,
    select: false
  },
  deletedAt: { 
    type: Date,
    select: false
  }
}, baseSchemaOptions);

// Índice compuesto para evitar duplicados
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });
PermissionSchema.index({ deleted: 1 });

// Aplicar plugin de soft delete
PermissionSchema.plugin(softDeletePlugin);

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
