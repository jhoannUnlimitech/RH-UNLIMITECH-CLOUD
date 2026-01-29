import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions, softDeletePlugin } from './base/BaseModel';

export interface IDivision extends IBaseModel {
  name: string;
  code: string;
  description?: string;
  managerId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  deleted: boolean;
  deletedAt?: Date;
  
  // Flujo de aprobación
  approvalFlow?: {
    order: number;
    employeeId: mongoose.Types.ObjectId;
    employeeName: string;
    employeePosition?: string;
  }[];
  
  // Métodos
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

const DivisionSchema = new Schema<IDivision>({
  name: { 
    type: String, 
    required: [true, 'El nombre de la división es requerido'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'El código de la división es requerido'],
    trim: true,
    minlength: [1, 'El código debe tener al menos 1 caracter'],
    uppercase: true
  },
  description: { 
    type: String,
    trim: true
  },
  managerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: [true, 'El responsable de la división es requerido']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  approvalFlow: [{
    order: {
      type: Number,
      required: true
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    employeeName: {
      type: String,
      required: true
    },
    employeePosition: {
      type: String
    }
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

// Virtual para transformar managerId populado en manager
DivisionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    // Si managerId está populado (es un objeto con _id)
    if (ret.managerId && typeof ret.managerId === 'object' && ret.managerId._id) {
      // Guardar el objeto completo como manager
      ret.manager = {
        _id: ret.managerId._id,
        name: ret.managerId.name,
        email: ret.managerId.email,
        photo: ret.managerId.photo
      };
      // Convertir managerId al string del _id
      ret.managerId = ret.managerId._id.toString();
    }
    return ret;
  }
});

DivisionSchema.set('toObject', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    // Si managerId está populado (es un objeto con _id)
    if (ret.managerId && typeof ret.managerId === 'object' && ret.managerId._id) {
      // Guardar el objeto completo como manager
      ret.manager = {
        _id: ret.managerId._id,
        name: ret.managerId.name,
        email: ret.managerId.email,
        photo: ret.managerId.photo
      };
      // Convertir managerId al string del _id
      ret.managerId = ret.managerId._id.toString();
    }
    return ret;
  }
});

// Índices
DivisionSchema.index({ name: 1 }, { unique: true });
DivisionSchema.index({ code: 1 }, { unique: true });
DivisionSchema.index({ managerId: 1 });
DivisionSchema.index({ status: 1 });
DivisionSchema.index({ deleted: 1 });

// Aplicar plugin de soft delete
DivisionSchema.plugin(softDeletePlugin);

export const Division = mongoose.model<IDivision>('Division', DivisionSchema);
