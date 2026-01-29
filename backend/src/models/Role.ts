import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions, softDeletePlugin } from './base/BaseModel';

export interface IRole extends IBaseModel {
  name: string;
  permissions: mongoose.Types.ObjectId[];
  deleted: boolean;
  deletedAt?: Date;
}

const RoleSchema = new Schema<IRole>({
  name: { 
    type: String, 
    required: [true, 'El nombre del rol es requerido'],
    trim: true,
    uppercase: true
  },
  permissions: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Permission'
  }],
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

// Índices
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ deleted: 1 });

// Aplicar plugin de soft delete
RoleSchema.plugin(softDeletePlugin);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
